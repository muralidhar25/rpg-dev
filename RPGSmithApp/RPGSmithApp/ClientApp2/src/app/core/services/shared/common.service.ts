import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Provider } from 'ngx-social-login';
import { LocalStoreManager } from './../../common/local-store-manager.service';
import { AuthService } from './../../auth/auth.service';
import { EndpointFactory } from './../../common/endpoint-factory.service';
import { ConfigurationService } from './../../common/configuration.service';
import { DBkeys } from './../../common/db-keys';
import { JwtHelper } from './../../common/jwt-helper';
import { Utilities } from './../../common/utilities';
import { LoginResponse, IdToken } from '../../models/login-response.model';
import { User } from '../../models/user.model';
import { Permission, PermissionNames, PermissionValues } from '../../models/permission.model';
import { CharactersService } from './../characters.service';
import { RulesetService } from './../ruleset.service';
import { ItemMasterService } from './../item-master.service';
import { SpellsService } from './../spells.service';
import { UserService } from './../../common/user.service';
import { ItemsService } from './../items.service';


@Injectable()
export class CommonService {

    _rulesetCount: number=0;
    _characterCount: number=0;
    _getUser: any;

    constructor(private router: Router, private configurations: ConfigurationService,
        private endpointFactory: EndpointFactory, private localStorage: LocalStoreManager,
        private charactersService: CharactersService, private rulesetService: RulesetService,
        private authService: AuthService, private userService: UserService) {
        // this.initializeLoginStatus();
    }

    private initializeLoginStatus() {

        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        let isLoggedIn = user != null;
        if (!isLoggedIn) {
            this.authService.logout();
            this.authService.redirectLogoutUser();
        }
    }


    /*set character & ruleset result count*/
    UpdateCounts() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null) {
            this.authService.logout();
            this.authService.redirectLogoutUser();
        } else {
            this.RulesetCharacterCount(user.id)
            //this.RulesetsCount(user.id);
            //this.CharactersCount(user.id);
        }
    }

    GetUserDetail() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null) {
            this.authService.logout();
            this.authService.redirectLogoutUser();
        } else {
            if (user.userName == null)
                this.GetUser(user.id);
        }
    }
    private RulesetCharacterCount(userId: string) {
        this.rulesetService.getRulesetAndCharactrCount(userId)
            .subscribe(data => {
                let model: any = data;
                //console.log('RulesetsCount: ' + data);
                this._rulesetCount = model.rulesetCount;
                this._characterCount = model.characetrCount;
            },
                error => {
                    this._rulesetCount = 0;
                    this._characterCount = 0;
                });
    }
    private RulesetsCount(userId: string) {
        this.rulesetService.getRulesetAndCharactrCount(userId)
            .subscribe(data => {
                let model: any = data;
                //console.log('RulesetsCount: ' + data);
                this.setRulesetCount(model.rulesetCount);
            },
            error => {
                this.setRulesetCount(0);
            });
    }

    private CharactersCount(userId: string) {
        this.rulesetService.getRulesetAndCharactrCount(userId)
            .subscribe(data => {
                let model: any = data;
                //console.log('CharactersCount: ' + data);
                this.setCharactersCount(model.characetrCount);
            },
            error => {
                this.setCharactersCount(0);
            });
    }

    private GetUser(userId: string) {
        this.userService.getUserById(userId)
            .subscribe(data => {
                this.setUserDetails(data);
                this.localStorage.saveSyncedSessionData(data, DBkeys.CURRENT_USER);
            }, error => { });
    }

    setRulesetCount(count: number) {
        this._rulesetCount = count;
    }

    getRulesetCount() {
        return this._rulesetCount;
    }

    setCharactersCount(count: number) {
        this._characterCount = count;
    }

    getCharactersCount() {
        return this._characterCount;
    }

    setUserDetails(user: any) {
        this._getUser = user;
    }

    getUserDetails() {
        return this._getUser;
    }

}
