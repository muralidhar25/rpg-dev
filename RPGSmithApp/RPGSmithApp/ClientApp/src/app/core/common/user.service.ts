
import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { LocalStoreManager } from '../common/local-store-manager.service';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { DBkeys } from '../common/db-keys';

import { AuthService } from "../auth/auth.service";
import { FileUploadService } from "./file-upload.service";
import { LoginResponse, IdToken } from '../models/login-response.model';
import { User } from '../models/user.model';
import { Permission, PermissionNames, PermissionValues } from '../models/permission.model';
import { UserRegister, EmailConfirmationContent } from '../models/user-register.model';
import { ForgotPassword, ResetPassword } from '../models/forgot-password.model';
import { ChangePassword } from '../models/change-password.model';


@Injectable()
export class UserService extends EndpointFactory {


  public get registerUrl() { return this.configurations.registerUrl; }
  public get homeUrl() { return this.configurations.homeUrl; }

  public loginRedirectUrl: string;
  public logoutRedirectUrl: string;
  private previousIsLoggedInCheck = false;
  private _loginStatus = new Subject<boolean>();

  private get registerApi() { return this.configurations.baseUrl + this.configurations.registerApi; }
  private get forgotPassApi() { return this.configurations.baseUrl + this.configurations.forgotPassApi; }
  private get resetPassApi() { return this.configurations.baseUrl + this.configurations.resetPassApi; }
  private get changePassApi() { return this.configurations.baseUrl + this.configurations.changePassApi; }
  private get checkPassApi() { return this.configurations.baseUrl + "/api/account/CheckPassword"; }
  private get confirmApi() { return this.configurations.baseUrl + "/api/account/ConfirmEmail"; }
  private get activationApi() { return this.configurations.baseUrl + "/api/account/ActiveUserByConfirmEmail"; }
  private get getUserByIdApi() { return this.configurations.baseUrl + "/api/account/UserById"; }
  private get updateSettingUrl() { return this.configurations.baseUrl + "/api/account/UpdateAccountSetting"; }
  private get uploadImgUrl() { return this.configurations.baseUrl + "/api/account/UploadProfileImageBlob"; }
  private get userExistUrl() { return this.configurations.baseUrl + "/api/account/IsUserExist"; }
  private get deleteUserUrl() { return this.configurations.baseUrl + "/api/account/delete"; }
  private get getBlobSpaceUsedApi() { return this.configurations.baseUrl + "/api/Image/GetBlobSpaceUsed"; }
  //private get saveErrorLogApi() { return this.configurations.baseUrl + "/api/account/saveErrorLog"; }
  constructor(http: HttpClient, injector: Injector, configurations: ConfigurationService,
    private router: Router,
    //private endpointFactory: EndpointFactory,
    private fileUploadService: FileUploadService,
    private localStorage: LocalStoreManager) {
    //this.initializeLoginStatus();
    super(http, configurations, injector);
  }

  private initializeLoginStatus() {
    this.localStorage.getInitEvent().subscribe(() => {
      this.reevaluateLoginStatus();
    });
  }

  getUserById(userId: any) {
    let endpointUrl = `${this.getUserByIdApi}/${userId}`;
    return this.http.get<any[]>(endpointUrl);
  }

  getUserDetailById<T>(Id: string): Observable<T> {
    let endpointUrl = `${this.getUserByIdApi}?id=${Id}`;
    return this.http.get<T>(endpointUrl);
  }

  getBlobSpaceUsed<T>(userId: string): Observable<T> {
    let endpointUrl = `${this.getBlobSpaceUsedApi}?userId=${userId}`;
    return this.http.get<T>(endpointUrl);
  }
  //saveErrorLog(errModel) {
  //  return this.http.post<any>(this.saveErrorLogApi, errModel);    
  //}

  register(user: UserRegister, emailConfirmationContent: EmailConfirmationContent) {

    let _emailContent = {
      emailSubject: emailConfirmationContent.emailSubject,
      emailBody: emailConfirmationContent.emailBody,
      url: emailConfirmationContent.urlLink
    }
    let _user = {
      username: user.username,
      fullname: user.username,
      email: user.email,
      password: user.password,
      jobTitle: 'developer',
      phoneNumber: '0168371548111',
      isEnabled: true,
      // isLockedOut: false,
      roleName: 'user',
      mailContent: _emailContent,
      profileImage: user.profileImage,
      hasSubscribedNewsletter: user.hasSubscribedNewsletter
    };

    let _registerURL = this.registerApi + '?emailSubject=' + emailConfirmationContent.emailSubject + '&emailConfirmationContent=' + emailConfirmationContent.emailBody + '&url=' + emailConfirmationContent.urlLink;
    //console.log('Here the register modal value: ', _user);        
    return this.http.post(_registerURL, _user, { responseType: 'text' });

  }

  forgotPassword(forgotPassword: ForgotPassword) {
    let forgotModel = {
      email: forgotPassword.email
    };
    return this.http.post<any>(this.forgotPassApi, forgotModel);
  }

  resetPassword(resetPassword: ResetPassword) {
    let resetModel = {
      userid: resetPassword.userid,
      newPassword: resetPassword.newPassword
    };
    return this.http.post(this.resetPassApi, resetModel, { responseType: 'text' });
  }

  changePassword(_changePassword: ChangePassword) {
    let changeModel = {
      userId: _changePassword.userId,
      oldPassword: _changePassword.oldPassword,
      newPassword: _changePassword.newPassword
    };
    return this.http.post(this.changePassApi, changeModel, { responseType: 'text' });
  }

  confirmEmail(userId: string, code: string) {

    let url = `${this.confirmApi}?userId=${userId}&code=${code}`;
    return this.http.get(url, { responseType: 'text' });
  }

  checkAvailability<T>(userModel: User): Observable<T> {
    return this.http.post<T>(this.userExistUrl, userModel);
  }

  updateAccountSetting<T>(_settings: User, _url: string): Observable<T> {
    _settings.url = _url;
    //let endpoint = `${this.updateSettingUrl}?url=${_url}`;
    return this.http.post<T>(this.updateSettingUrl, _settings);
  }

  fileUpload(fileToUpload: File) {
    return this.fileUploadMethod<any>(fileToUpload);
  }

  private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
    return this.fileUploadService.fileUpload<T>(this.uploadImgUrl, fileToUpload);
  }

  activeUserByConfirmEmail(id: string, code: string) {
    let model = {
      userId: id,
      emailConfirmationToken: code
    };

    return this.http.post(this.activationApi, model, { responseType: 'text' });
  }

  logout(): void {
    this.localStorage.deleteData(DBkeys.ACCESS_TOKEN);
    this.localStorage.deleteData(DBkeys.ID_TOKEN);
    this.localStorage.deleteData(DBkeys.REFRESH_TOKEN);
    this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);
    this.localStorage.deleteData(DBkeys.USER_PERMISSIONS);
    this.localStorage.deleteData(DBkeys.CURRENT_USER);

    this.configurations.clearLocalChanges();
    this.reevaluateLoginStatus();
  }

  deletAccount<T>(userId: string): Observable<T> {
    let endpoint = `${this.deleteUserUrl}/${userId}`;

    return this.http.delete<T>(endpoint, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deletAccount(userId));
      });
  }

  checkPassword(pass: ChangePassword) {
    let model = {
      userId: pass.userId,
      oldPassword: pass.oldPassword
    };
    return this.http.post(this.checkPassApi, model);
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


}
