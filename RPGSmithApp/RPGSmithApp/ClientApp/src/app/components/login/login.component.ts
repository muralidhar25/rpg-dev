
import { Component, OnInit, OnDestroy, Input, ViewChild } from "@angular/core";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AuthService } from "../../services/auth.service";
import { ConfigurationService } from '../../services/configuration.service';
import { DBkeys } from "../../services/db-Keys";
import { LocalStoreManager } from '../../services/local-store-manager.service';
import { Utilities } from '../../services/utilities';
import { UserLogin } from '../../models/user-login.model';
import { SocialLoginService, Provider } from 'ngx-social-login';
// import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { AccountTermsComponent } from "../accounts/account-terms/account-terms.component";
import { AccountService } from "../../services/account.service";
import { RulesetService } from "../../services/ruleset.service";
import { User } from "../../models/user.model";

@Component({
    selector: "app-login",
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, OnDestroy {

    bsModalRef: BsModalRef;
    userLogin = new UserLogin();
    isLoading = false;
    formResetToggle = true;
    modalClosedCallback: () => void;
    loginStatusSubscription: any;
    errorMessage: string;
    appLogo = "../assets/images/" + Utilities.LogoImage; // "../assets/images/logo-full.png";
    @Input()
    isModal = false;
    isChrome: boolean = Utilities.IsCrome;
    LogoImage: string = '../../../assets/images/' + Utilities.LogoImage;

    constructor(
        private modalService: BsModalService,
        private socialService: SocialLoginService,
        private alertService: AlertService,
        private authService: AuthService,
        private configurations: ConfigurationService,
        private router: Router, private localStorage: LocalStoreManager,
        private rulesetService: RulesetService
    ) {
    }

    proceed() {
        this.isChrome = true;
    }

    ngOnInit() {
        this.userLogin.rememberMe = this.authService.rememberMe; 
        if (this.getShouldRedirect()) {
            this.authService.redirectLoginUser();
        }
        else {
            this.loginStatusSubscription = this.authService.getLoginStatusEvent().subscribe(isLoggedIn => {
                if (this.getShouldRedirect()) {
                    this.authService.redirectLoginUser();
                }
            });
        }
    }

    edit(){
        this.router.navigate(['/attempterror']);
    }

    ngOnDestroy() {
        if (this.loginStatusSubscription)
            this.loginStatusSubscription.unsubscribe();
    }


    getShouldRedirect() {
        return !this.isModal && this.authService.isLoggedIn && !this.authService.isSessionExpired;
    }


    showErrorAlert(caption: string, message: string) {
        this.alertService.showMessage(caption, message, MessageSeverity.error);
    }

    closeModal() {
        if (this.modalClosedCallback) {
            this.modalClosedCallback();
        }
    }


    login() {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Logging in...");

        this.authService.login(this.userLogin.email, this.userLogin.password, this.userLogin.rememberMe)
            .subscribe(
            user => {
                try { this.localStorage.saveSyncedSessionData(null, DBkeys.SOCIAL_LOGIN); } catch (err) { }
                //this.authService.redirectLoginUser();
                this.reset();
                setTimeout(() => {
                    this.alertService.stopLoadingMessage();
                    this.isLoading = false;                  

                    if (!this.isModal) {
                        //this.alertService.showMessage("Login", `Welcome ${user.fullName}!`, MessageSeverity.success);
                    }
                    else {
                        this.alertService.showMessage("Login", `Session for ${user.fullName} restored!`, MessageSeverity.success);
                        setTimeout(() => {
                            this.alertService.showStickyMessage("Session Restored", "Please try your last operation again", MessageSeverity.default);
                        }, 500);

                        this.closeModal();
                    }
                }, 500);
            },
            error => {
                this.alertService.stopLoadingMessage();

                if (Utilities.checkNoNetwork(error)) {
                    this.alertService.showStickyMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error, error);
                    this.offerAlternateHost();
                }
                 else {
                    let errorMessage = Utilities.findHttpResponseMessage("error_description", error);

                    if (errorMessage) {
                        if (errorMessage == "The specified user account has been suspended for 1 minute.") {
                            this.router.navigate(['/logonwarning']);
                        }
                        else
                            this.alertService.showStickyMessage("Unable to login", errorMessage, MessageSeverity.error, error);
                    }
                    else if (error.message)
                        this.alertService.showStickyMessage("Unable to login", error.message, MessageSeverity.error, '');
                    else
                        this.alertService.showStickyMessage("Unable to login", "An error occured whilst logging in, please try again later.\nError: " + error.statusText || error.status, MessageSeverity.error, error);
                }

                setTimeout(() => {
                    this.isLoading = false;
                }, 500);
            });
    }

    loginWithFacebook(): void {
        try {
            //if (this.termsAccountCreation()) {
            this.socialService.login(Provider.FACEBOOK).subscribe(user => {
                this.socailLogin(user.accessToken, this.configurations.grantTypeFacebook, Provider.FACEBOOK);
            },
                error => {
                    //this.alertService.showStickyMessage("Unable to login", "Something went wrong, please try again later.", MessageSeverity.error, error);
                });
            //}
        } catch (err) { console.log(err); }
    }
    
    loginWithGoogle(): void {
        try {
            this.socialService.login(Provider.GOOGLE).subscribe(user => {
                this.socailLogin(user.accessToken, this.configurations.grantTypeGoogle, Provider.GOOGLE);
            },
                error => {
                    //this.alertService.showStickyMessage("Unable to login", "Something went wrong, please try again later.", MessageSeverity.error, error);
                });

        } catch (err) { console.log(err); }
    }
    
    socailLogin(token: string, grantType: string, provider: string) {
        
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Logging " + provider + " login...");
        
        this.authService.loginSocialPlatform(token, grantType)
            .subscribe(
            data => {
                try { this.localStorage.saveSyncedSessionData(provider, DBkeys.SOCIAL_LOGIN); } catch (err) { }
                if (provider == Provider.GOOGLE) window.location.reload();
                //this.authService.redirectLoginUser();
                this.redirectToHome();
                setTimeout(() => {
                    this.alertService.stopLoadingMessage();
                    this.isLoading = false;
                    
                    if (!this.isModal) {
                        //this.alertService.showMessage("Login", `Welcome ${data.fullName}!`, MessageSeverity.success);
                    }
                    else {
                        this.alertService.showMessage("Login", `Session for ${data.fullName} restored!`, MessageSeverity.success);
                        setTimeout(() => {
                            this.alertService.showStickyMessage("Session Restored", "Please try your last operation again", MessageSeverity.default);
                        }, 500);

                        this.closeModal();
                    }
                }, 500);
            },
            error => {
                this.alertService.stopLoadingMessage();

                if (Utilities.checkNoNetwork(error)) {
                    this.alertService.showStickyMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error, error);
                    this.offerAlternateHost();
                }
                else {
                    let errorMessage = Utilities.findHttpResponseMessage("error_description", error);

                    if (errorMessage)
                        this.alertService.showStickyMessage("Unable to login", errorMessage, MessageSeverity.error, error);
                    else if (error.message)
                        this.alertService.showStickyMessage("Unable to login", error.message, MessageSeverity.error, '');
                    else
                        this.alertService.showStickyMessage("Unable to login", "An error occured while logging in, please try again later.\nError: " + error.statusText || error.status, MessageSeverity.error, error);
                }

                setTimeout(() => { this.isLoading = false; }, 500);
            });
    }


    offerAlternateHost() {

        if (Utilities.checkIsLocalHost(location.origin) && Utilities.checkIsLocalHost(this.configurations.baseUrl)) {
            this.alertService.showDialog("Dear Developer!\nIt appears your backend Web API service is not running...\n" +
                "Would you want to temporarily switch to the online Demo API below?(Or specify another)",
                DialogType.prompt,
                (value: string) => {
                    this.configurations.baseUrl = value;
                    this.alertService.showStickyMessage("API Changed!", "The target Web API has been changed to: " + value, MessageSeverity.warn);
                },
                null,
                null,
                null,
                this.configurations.fallbackBaseUrl);
        }
    }
    
    reset() {
        ////this.formResetToggle = false;

        ////setTimeout(() => {
        ////    this.formResetToggle = true;
        ////});
        //this.router.navigate(['/characters']);
        this.redirectToHome();
    }

    redirectToHome() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER)
        this.rulesetService.getRulesetAndCharactrCount(user.id)
            .subscribe(data => {
                let model:any = data;
                if (model.rulesetCount > 0) {
                    this.router.navigate(['/characters']);
                }
                else {
                    this.router.navigate(['/rulesets']);
                }
            },
                error => {
                    this.router.navigate(['/rulesets']);
                });
        
    }


    termsAccountCreation(): boolean {
        this.bsModalRef = this.modalService.show(AccountTermsComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });

        this.bsModalRef.content.event.subscribe(data => {
            return data === true;
        });
        return false;
    }

}
