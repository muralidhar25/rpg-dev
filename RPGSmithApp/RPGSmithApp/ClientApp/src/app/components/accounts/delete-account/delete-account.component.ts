import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { SocialLoginService } from 'ngx-social-login';
import { AlertService, DialogType, MessageSeverity } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LocalStoreManager } from '../../../services/local-store-manager.service';
import { AccountSettingsComponent } from '../account-settings/account-settings.component';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { Utilities } from '../../../services/utilities';
import { DBkeys } from '../../../services/db-Keys';
import { ChangePassword } from '../../../models/change-password.model';

@Component({
    selector: 'app-delete-account',
    templateUrl: './delete-account.component.html',
    styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent implements OnInit {

    userData: User = new User();
    _password: ChangePassword = new ChangePassword();
    pass: string;
    isLoading: boolean = false;
    socialLogin: string;

    constructor(
        private bsModalRef: BsModalRef,
        private modalService: BsModalService,
        private socialService: SocialLoginService,
        private alertService: AlertService,
        private authService: AuthService, private userService: UserService,
        private router: Router, private localStorage: LocalStoreManager
    ) {
    }

    ngOnInit() {
        setTimeout(() => {
            this.userData = this.bsModalRef.content.userdata;
            this.socialLogin = this.bsModalRef.content.socialLogin;
        }, 0);
    }

    submitForm() {
        if (this.socialLogin)
            this.alertService.showDialog('Are you sure you want to delete your account?',
                DialogType.confirm, () => this.deleteAccount(this.userData), null, 'Yes', 'No');
        else
            this.alertService.showDialog('Are you sure you want to delete your account?',
                DialogType.confirm, () => this.checkAccountPassword(this.userData), null, 'Yes', 'No');
    }

    private checkAccountPassword(user: User) {
        this.isLoading = true;
        this._password = {
            userId: user.id, oldPassword: this.pass,
            confirmPassword: this.pass, newPassword: this.pass
        }
        this.userService.checkPassword(this._password)
            .subscribe(
            data => {
                    //after verifying password
                    this.deleteAccount(user);
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Check Password";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, "Please enter a valid password.", MessageSeverity.error, error);
                });
    }


    private deleteAccount(user: User) {
        this.isLoading = true;
        //this.alertService.startLoadingMessage("", "Deleting Character");

        this.userService.deletAccount(user.id)
            .subscribe(
                data => {
                    this.close();
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Account has been removed successfully.", "", MessageSeverity.success);
                    setTimeout(() => {
                        this.authService.logout(true);
                    }, 500);
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Delete";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

                });
    }

    close() {
        this.bsModalRef.hide();
        //this.destroyModalOnInit();
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }

    openAccountSettings() {
        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(AccountSettingsComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
    }

}
