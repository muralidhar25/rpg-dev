// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Component, Directive ,OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ChangePassword } from '../../../core/models/change-password.model';
import { User } from '../../../core/models/user.model';
import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { AuthService } from "../../../core/auth/auth.service";

import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { UserService } from "../../../core/common/user.service";
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { EqualValidator } from "../../../core/directives/equal-validator.directive";
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
    //directives: [EqualValidator]
})
export class ChangePasswordComponent implements OnInit {

    changePasswordModel: any = new ChangePassword();
    pwdPattern = "^(?=.*?[a-z])(?=.*?[0-9]).{8,}$";
    isLoading = false;

  constructor(
    private route: ActivatedRoute,
      private bsModalRef: BsModalRef,
      private alertService: AlertService,
      private authService: AuthService,
      private userService: UserService,
      private localStorage: LocalStoreManager,
      private modalService: BsModalService
    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1)); 
  }

  ngOnInit() {
  }

  submitForm(){
      this.changePassword(this.changePasswordModel);
    }

    private changePassword(_changePassword) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user !== null) {
            _changePassword.userId = user.id;
            this.alertService.startLoadingMessage("", "Changing password");
            this.userService.changePassword(_changePassword)
                .subscribe(
                    data => {
                        setTimeout(() => { this.isLoading = false; }, 200);
                        this.alertService.stopLoadingMessage();
                        this.alertService.showMessage(data, "", MessageSeverity.success);
                        this.bsModalRef.hide();
                    },
                    error => {
                        setTimeout(() => { this.isLoading = false; }, 200);
                        this.alertService.stopLoadingMessage();
                        let _message = "Unable to Change Password ";
                        let Errors = Utilities.ErrorDetail(_message, error);
                        if (Errors.sessionExpire) {
                            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                            this.authService.logout(true);
                        }
                        else
                            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

                    }, () => { });
        }

    }

  close() {
    this.bsModalRef.hide();
  }

}
