
import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute,Params } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { AuthService } from "../../core/auth/auth.service";
import { ConfigurationService } from '../../core/common/configuration.service';
import { UserService } from "../../core/common/user.service";
import { Utilities } from '../../core/common/utilities';
import { ResetPassword } from '../../core/models/forgot-password.model';

@Component({
    selector: "reset-password",
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})

export class ResetPasswordComponent implements OnInit, OnDestroy {

    resetPasswordModel = new ResetPassword();
    isLoading = false;
    formResetToggle = true;
    modalClosedCallback: () => void;
    LogoImage: string = "../assets/images/" + Utilities.LogoImage;
    @Input()
    isModal = false;

    constructor(
        private router: Router,
        private alertService: AlertService,
        private authService: AuthService,
        private configurations: ConfigurationService,
        private userService: UserService,
        private route: ActivatedRoute) {
        this.route.queryParams.subscribe((params: Params) => {

            this.resetPasswordModel.userid = params.userid;
            // this._code = "xx";
        });
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


    resetPassword() {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Reset password...");

        this.userService.resetPassword(this.resetPasswordModel)
            .subscribe(
            user => {
                this.alertService.stopLoadingMessage();
                this.isLoading = false;
                //this.alertService.showMessage("A password reset link has been sent your email. ", "", MessageSeverity.success);
                this.router.navigate(['/reset-password-success']);
            },
            error => {
                console.log(error);
                this.alertService.stopLoadingMessage();
                setTimeout(() => { this.isLoading = false; }, 200);
                let Errors = Utilities.ErrorDetail("Unable to Reset", error);
                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

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
        this.formResetToggle = false;

        setTimeout(() => {
            this.formResetToggle = true;
        });
    }
}
