
import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { AuthService } from "../../core/auth/auth.service";
import { ConfigurationService } from '../../core/common/configuration.service';
import { UserService } from "../../core/common/user.service";
import { Utilities } from '../../core/common/utilities';
import { ForgotPassword } from '../../core/models/forgot-password.model';
import { SocialLoginService, Provider } from 'ngx-social-login';
import { DBkeys } from "../../core/common/db-keys";
import { LocalStoreManager } from '../../core/common/local-store-manager.service';

@Component({
    selector: "forgot-password",
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})

export class ForgotPasswordComponent implements OnInit, OnDestroy {

    forgotPasswordModel = new ForgotPassword();
    isLoading = false;
    formResetToggle = true;
    modalClosedCallback: () => void;
    appLogo = "../assets/images/" + Utilities.LogoImage;//"../assets/images/logo-full.png";
    @Input()
    isModal = false;

    constructor(private router: Router, private localStorage: LocalStoreManager,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private authService: AuthService,
        private configurations: ConfigurationService,
        private userService: UserService,
        private socialService: SocialLoginService,) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    showErrorAlert(caption: string, message: string) {
        this.alertService.showMessage(caption, message, MessageSeverity.error);
    }

    closeModal() {
        if (this.modalClosedCallback) {
            this.modalClosedCallback();
        }
    }

    forgotPassword(){
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Forgot password...");

        this.userService.forgotPassword(this.forgotPasswordModel)
            .subscribe(
            user => {
                //TODO - show api response as msg
                this.alertService.stopLoadingMessage();
                this.isLoading = false;
                this.alertService.showMessage("A password reset link has been sent your email. ", "", MessageSeverity.success);
              //  this.router.navigate(['/resetpassword'], { queryParams: { email: this.forgotPasswordModel.email } });
            },
            error => {
                console.log(error);
                setTimeout(() => { this.isLoading = false; }, 200);
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Forgot Password", error);
                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

            });
    }

    loginWithFacebook(): void {
        this.socialService.login(Provider.FACEBOOK).subscribe(user => {
            this.loginSocialPlatform(user.accessToken, this.configurations.grantTypeFacebook, Provider.FACEBOOK);
        },
            error => {
                //this.alertService.showStickyMessage("Unable to login", "Something went wrong, please try again later.", MessageSeverity.error, error);
            });
    }

    loginWithGoogle(): void {
        this.socialService.login(Provider.GOOGLE).subscribe(user => {
            this.loginSocialPlatform(user.accessToken, this.configurations.grantTypeGoogle, Provider.GOOGLE);
        },
            error => {
                //this.alertService.showStickyMessage("Unable to login", "Something went wrong, please try again later.", MessageSeverity.error, error);
            });
    }

    loginSocialPlatform(token: string, grantType: string, provider: string) {

        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Logging " + provider + " login...");

        this.authService.loginSocialPlatform(token, grantType)
            .subscribe(
            data => {
                try { this.localStorage.saveSyncedSessionData(provider, DBkeys.SOCIAL_LOGIN); } catch (err) { }
                window.location.reload();
                this.authService.redirectLoginUser();
                setTimeout(() => {
                    this.alertService.stopLoadingMessage();
                    this.isLoading = false;
                    this.reset();

                    if (!this.isModal) {
                        this.alertService.showMessage("Login", `Welcome ${data.fullName}!`, MessageSeverity.success);
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

    clear(){
        this.forgotPasswordModel.email = '';
    }

    reset() {
        this.formResetToggle = false;

        setTimeout(() => {
            this.formResetToggle = true;
        });
    }
}
