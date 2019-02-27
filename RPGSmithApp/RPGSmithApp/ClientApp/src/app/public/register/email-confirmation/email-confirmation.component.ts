import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute, Params } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { AuthService } from "../../../core/auth/auth.service";
import { ConfigurationService } from '../../../core/common/configuration.service';
import { UserService } from "../../../core/common/user.service";
import { Utilities } from '../../../core/common/utilities';


@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css']
})
export class EmailConfirmationComponent implements OnInit {

    isLoading = false;
    formResetToggle = true;
    modalClosedCallback: () => void;

    _id: string;
    _code: string;

    @Input()
    isModal = false;

    constructor(private router: Router,
        private alertService: AlertService,
        private authService: AuthService,
        private configurations: ConfigurationService,
        private userService: UserService,
        private route: ActivatedRoute) {
        this.route.queryParams.subscribe((params: Params) => {
            this._id = params.id;
             this._code = "xx";
        });}

    ngOnInit() {

    }

    confirm() {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Confirming email...");
        this.userService.activeUserByConfirmEmail(this._id, this._code)
            .subscribe(
            data => {
                //TODO
                this.alertService.stopLoadingMessage();
                this.alertService.showMessage("Email Address has been Confirmed.", "", MessageSeverity.success);
                this.router.navigate(['/email-confirmation-success']);
                this.isLoading = false;
            },
            error => {
                this.alertService.stopLoadingMessage();
                setTimeout(() => { this.isLoading = false; }, 200);
                //That email address doesn't match any user accounts. Are you sure you've registered?
                let Errors = Utilities.ErrorDetail("Unable to Confirm", error);
                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

            });
    }

}
