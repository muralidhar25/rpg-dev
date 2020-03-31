// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Provider } from 'ngx-social-login';

import { LocalStoreManager } from '../common/local-store-manager.service';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { DBkeys } from '../common/db-keys';
import { JwtHelper } from '../common/jwt-helper';
import { Utilities } from '../common/utilities';
import { LoginResponse, IdToken } from '../models/login-response.model';
import { User } from '../models/user.model';
import { Permission, PermissionNames, PermissionValues } from '../models/permission.model';
import { AppService1 } from '../../app.service';

@Injectable()
export class AuthService {

  public get loginUrl() { return this.configurations.loginUrl; }
  public get homeUrl() { return this.configurations.homeUrl; }

  public loginRedirectUrl: string;
  public logoutRedirectUrl: string;

  public reLoginDelegate: () => void;

  private previousIsLoggedInCheck = false;
  private _loginStatus = new Subject<boolean>();


  constructor(private router: Router, private configurations: ConfigurationService, private endpointFactory: EndpointFactory, private localStorage: LocalStoreManager,
    private appService: AppService1) {
    this.initializeLoginStatus();
  }


  private initializeLoginStatus() {
    this.localStorage.getInitEvent().subscribe(() => {
      this.reevaluateLoginStatus();
    });
  }


  gotoPage(page: string, preserveParams = true) {

    let navigationExtras: NavigationExtras = {
      queryParamsHandling: preserveParams ? "merge" : "", preserveFragment: preserveParams
    };


    this.router.navigate([page], navigationExtras);
  }


  redirectLoginUser() {

    let redirect = this.loginRedirectUrl && this.loginRedirectUrl != '/' && this.loginRedirectUrl != ConfigurationService.defaultHomeUrl ? this.loginRedirectUrl : this.homeUrl;
    this.loginRedirectUrl = null;


    let urlParamsAndFragment = Utilities.splitInTwo(redirect, '#');
    let urlAndParams = Utilities.splitInTwo(urlParamsAndFragment.firstPart, '?');

    let navigationExtras: NavigationExtras = {
      fragment: urlParamsAndFragment.secondPart,
      queryParams: Utilities.getQueryParamsFromString(urlAndParams.secondPart),
      queryParamsHandling: "merge"
    };

    this.router.navigate([urlAndParams.firstPart], navigationExtras);
  }


  redirectLogoutUser() {
    let redirect = this.logoutRedirectUrl ? this.logoutRedirectUrl : this.loginUrl;
    this.logoutRedirectUrl = null;

    this.router.navigate([redirect]);
  }


  redirectForLogin() {
    this.loginRedirectUrl = this.router.url;
    this.router.navigate([this.loginUrl]);
  }


  reLogin() {
    this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);

    if (this.reLoginDelegate) {
      this.reLoginDelegate();
    }
    else {
      this.redirectForLogin();
    }
  }


  refreshLogin() {
    return this.endpointFactory.getRefreshLoginEndpoint<LoginResponse>()
      .map(response => this.processLoginResponse(response, this.rememberMe));
  }


  login(userName: string, password: string, rememberMe?: boolean) {
    if (this.isLoggedIn)
      this.logout();

    return this.endpointFactory.getLoginEndpoint<LoginResponse>(userName, password)
      .map(response => this.processLoginResponse(response, rememberMe));

  }

  loginSocialPlatform(token: string, grantType: string) {
    if (this.isLoggedIn)
      this.logout();

    return this.endpointFactory.loginSocialPlatform<LoginResponse>(token, grantType)
      .map(response => this.processLoginResponse(response, false));
  }


  private processLoginResponse(response: LoginResponse, rememberMe: boolean) {
    let accessToken = response.access_token;

    if (accessToken == null)
      throw new Error("Received accessToken was empty");

    let idToken = response.id_token;
    let refreshToken = response.refresh_token || this.refreshToken;
    let expiresIn = response.expires_in;

    let tokenExpiryDate = new Date();
    tokenExpiryDate.setSeconds(tokenExpiryDate.getSeconds() + expiresIn);

    let accessTokenExpiry = tokenExpiryDate;

    let jwtHelper = new JwtHelper();
    let decodedIdToken = <IdToken>jwtHelper.decodeToken(response.id_token);

    let permissions: PermissionValues[] = Array.isArray(decodedIdToken.permission) ? decodedIdToken.permission : [decodedIdToken.permission];

    if (!this.isLoggedIn)
      this.configurations.import(decodedIdToken.configuration);

    let user = new User(
      decodedIdToken.sub,
      decodedIdToken.name,
      decodedIdToken.fullname,
      decodedIdToken.email,
      decodedIdToken.jobtitle,
      decodedIdToken.phone,
      decodedIdToken.profileimage,
      Array.isArray(decodedIdToken.role) ? decodedIdToken.role : [decodedIdToken.role]);
    user.isEnabled = true;
    user.isGm = decodedIdToken.isgm ? decodedIdToken.isgm.toLowerCase() == 'true' ? true : false : false;
    user.removeAds = decodedIdToken.removeads ? decodedIdToken.removeads.toLowerCase() == 'true' ? true : false : false;
    user.rulesetSlot = decodedIdToken.rulesetslot ? +decodedIdToken.rulesetslot : 3;
    user.playerSlot = decodedIdToken.playerslot ? +decodedIdToken.playerslot : 0;
    user.characterSlot = decodedIdToken.characterslot ? +decodedIdToken.characterslot : 3;
    user.campaignSlot = decodedIdToken.campaignslot ? +decodedIdToken.campaignslot : 0;
    user.storageSpace = decodedIdToken.storagespaceinmb ? +decodedIdToken.storagespaceinmb : 1000;
    this.saveUserDetails(user, permissions, accessToken, idToken, refreshToken, accessTokenExpiry, rememberMe);

    this.reevaluateLoginStatus(user);

    return user;
  }


  private saveUserDetails(user: User, permissions: PermissionValues[], accessToken: string, idToken: string, refreshToken: string, expiresIn: Date, rememberMe: boolean) {

    if (rememberMe) {
      this.localStorage.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
      this.localStorage.savePermanentData(idToken, DBkeys.ID_TOKEN);
      this.localStorage.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);
      this.localStorage.savePermanentData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
      this.localStorage.savePermanentData(permissions, DBkeys.USER_PERMISSIONS);
      this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
    }
    else {
      this.localStorage.saveSyncedSessionData(accessToken, DBkeys.ACCESS_TOKEN);
      this.localStorage.saveSyncedSessionData(idToken, DBkeys.ID_TOKEN);
      this.localStorage.saveSyncedSessionData(refreshToken, DBkeys.REFRESH_TOKEN);
      this.localStorage.saveSyncedSessionData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
      this.localStorage.saveSyncedSessionData(permissions, DBkeys.USER_PERMISSIONS);
      this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
    }

    this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
  }


  logout(relogin?: boolean, buttonClick: boolean=false): void {
    //this.localStorage.deleteData(DBkeys.ACCESS_TOKEN);
    //this.localStorage.deleteData(DBkeys.ID_TOKEN);
    //this.localStorage.deleteData(DBkeys.REFRESH_TOKEN);
    //this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);
    //this.localStorage.deleteData(DBkeys.USER_PERMISSIONS);
    //this.localStorage.deleteData(DBkeys.CURRENT_USER);
    //this.localStorage.deleteData(DBkeys.SOCIAL_LOGIN);
    //this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    //this.localStorage.deleteData(DBkeys.CHAR_CHAR_STAT_DETAILS);
    //this.localStorage.deleteData(DBkeys.ChatActiveStatus);
    //this.localStorage.deleteData(DBkeys.ChatInNewTab);
    //this.localStorage.deleteData(DBkeys.ChatMsgsForNewChatWindow);

    

    if (buttonClick && window.indexedDB) {
      if (this.appService.objectStore) {
        this.appService.objectStore.close();
        this.deleteIndexedDB(relogin);
      } else {
        this.closeIndexedDBconnection(relogin);
      }
    } else {
      this.logoutLogin(relogin);
    }

  }

  async closeIndexedDBconnection(relogin) {
    let that = this;
    const request = await window.indexedDB.open(DBkeys.IndexedDB, DBkeys.IndexedDBVersion);

    request.onsuccess = async function (event) {
      await event.target['result'].close();
      that.deleteIndexedDB(relogin);
    };

    request.onerror = function (event) {
      console.log('[onerror]', request.error);
    };
  }

  async deleteIndexedDB(relogin) {
    let that = this;
    var req = await window.indexedDB.deleteDatabase(DBkeys.IndexedDB);
    req.onsuccess = function () {
      console.log("Deleted database successfully");
      that.logoutLogin(relogin);
    };
    req.onerror = function () {
      console.log("Couldn't delete database");
      that.logoutLogin(relogin);
    };
    req.onblocked = function () {
      console.log("Couldn't delete database due to the operation being blocked");
      that.logoutLogin(relogin);
    };
  }

  logoutLogin(relogin) {
    this.localStorage.deleteData("ItemMasterData");
    this.localStorage.clearAllSessionsStorage();

    ///////////////////this.localStorage.deleteData(DBkeys.chatConnections);

    this.appService.updatCloseNotificationInterval(true);

    ///////////////////////////////

    if (relogin) {
      this.localStorage.localStorageSetItem(DBkeys.IsLogonKickedOut, true);
    }

    this.configurations.clearLocalChanges();
    this.reevaluateLoginStatus();

    if (relogin) {
      this.redirectForLogin();
      window.location.reload();
    } else {
      this.router.navigate([this.loginUrl]);
    }
  }

  private reevaluateLoginStatus(currentUser?: User) {

    let user = currentUser || this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    let isLoggedIn = user != null;

    if (this.previousIsLoggedInCheck != isLoggedIn) {
      setTimeout(() => {
        this._loginStatus.next(isLoggedIn);
      });
    }

    this.previousIsLoggedInCheck = isLoggedIn;
  }


  getLoginStatusEvent(): Observable<boolean> {
    return this._loginStatus.asObservable();
  }


  get currentUser(): User {

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    this.reevaluateLoginStatus(user);

    return user;
  }

  get userPermissions(): PermissionValues[] {
    return this.localStorage.getDataObject<PermissionValues[]>(DBkeys.USER_PERMISSIONS) || [];
  }

  get accessToken(): string {

    this.reevaluateLoginStatus();
    return this.localStorage.getData(DBkeys.ACCESS_TOKEN);
  }

  get accessTokenExpiryDate(): Date {

    this.reevaluateLoginStatus();
    return this.localStorage.getDataObject<Date>(DBkeys.TOKEN_EXPIRES_IN, true);
  }

  get isSessionExpired(): boolean {

    if (this.accessTokenExpiryDate == null) {
      return true;
    }

    return !(this.accessTokenExpiryDate.valueOf() > new Date().valueOf());
  }


  get idToken(): string {

    this.reevaluateLoginStatus();
    return this.localStorage.getData(DBkeys.ID_TOKEN);
  }

  get refreshToken(): string {

    this.reevaluateLoginStatus();
    return this.localStorage.getData(DBkeys.REFRESH_TOKEN);
  }

  get isLoggedIn(): boolean {
    return this.currentUser != null;
  }

  get rememberMe(): boolean {
    return this.localStorage.getDataObject<boolean>(DBkeys.REMEMBER_ME) == true;
  }

  get socialLogin(): string {
    return this.localStorage.getDataObject<string>(DBkeys.SOCIAL_LOGIN);
  }

  get hasEmailFb(): boolean {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    return user == null ? false : user.email == null || user.email == undefined || user.email == "" ? false : true;
  }

  get getRulesetId(): number {
    return this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
  }
  //

  public updateSocialLoginUserValuesFromToken(id_token, currentUserDetails: User) {
    //let idToken = id_token;



    let jwtHelper = new JwtHelper();
    let decodedIdToken = <IdToken>jwtHelper.decodeToken(id_token);

    let permissions: PermissionValues[] = Array.isArray(decodedIdToken.permission) ? decodedIdToken.permission : [decodedIdToken.permission];

    if (!this.isLoggedIn)
      this.configurations.import(decodedIdToken.configuration);

    let user = currentUserDetails;
    console.log("updateSocialLoginUserValuesFromToken: currentUserDetails-->>", user)
    user.isGm = decodedIdToken.isgm ? decodedIdToken.isgm.toLowerCase() == 'true' ? true : false : false;
    user.removeAds = decodedIdToken.removeads ? decodedIdToken.removeads.toLowerCase() == 'true' ? true : false : false;
    user.rulesetSlot = decodedIdToken.rulesetslot ? +decodedIdToken.rulesetslot : 3;
    user.playerSlot = decodedIdToken.playerslot ? +decodedIdToken.playerslot : 0;
    user.characterSlot = decodedIdToken.characterslot ? +decodedIdToken.characterslot : 3;
    user.campaignSlot = decodedIdToken.campaignslot ? +decodedIdToken.campaignslot : 0;
    user.storageSpace = decodedIdToken.storagespaceinmb ? +decodedIdToken.storagespaceinmb : 1000;

    if (this.localStorage.sessionExists(DBkeys.CURRENT_USER)) {
      this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
    }
    else {
      this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
    }
    //this.saveUserDetails(user, permissions, accessToken, idToken, refreshToken, accessTokenExpiry, rememberMe);

  }
}
