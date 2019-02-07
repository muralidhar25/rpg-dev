import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { AuthService } from "../../../core/auth/auth.service";
import { ConfigurationService } from '../../../core/common/configuration.service';
import { UserService } from "../../../core/common/user.service";
import { Utilities } from '../../../core/common/utilities';


@Component({
  selector: 'app-email-confirmation-success',
  templateUrl: './email-confirmation-success.component.html',
  styleUrls: ['./email-confirmation-success.component.css']
})
export class EmailConfirmationSuccessComponent implements OnInit {

    isLoading = false;
    userId: string;

    constructor(private router: Router,
        private alertService: AlertService,
        private authService: AuthService,
        private configurations: ConfigurationService,
        private userService: UserService,
        private route: ActivatedRoute) {
        this.route.queryParams.subscribe(params => {
            this.userId = params.id;
        });
    }

    ngOnInit() {
        if (this.userId != undefined && this.userId != null)
            this.confirmation(this.userId);
    }

    private confirmation(userId: string) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Confirming email...");
        this.userService.activeUserByConfirmEmail(userId, "")
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Email Address has been Confirmed.", "", MessageSeverity.success);
                    this.router.navigate(['/email-confirmation-success']);
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    setTimeout(() => { this.isLoading = false; }, 200);
                    //That email address doesn't match any user accounts. Are you sure you've registered?
                    let Errors = Utilities.ErrorDetail("Unable to Confirm", error);
                    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                    this.router.navigate(['/register']);
                });
    }

}
