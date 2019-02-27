import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { AuthService } from "../../../core/auth/auth.service";
import { ConfigurationService } from '../../../core/common/configuration.service';
import { UserService } from "../../../core/common/user.service";
import { Utilities } from '../../../core/common/utilities';

@Component({
  selector: 'app-register-email-confirmation',
  templateUrl: './register-email-confirmation.component.html',
  styleUrls: ['./register-email-confirmation.component.css']
})
export class RegisterEmailConfirmationComponent implements OnInit {

    isLoading = false;
    formResetToggle = true;
    modalClosedCallback: () => void;

    _email: string;

    @Input()
    isModal = false;

    constructor(
        private router: Router,
        private alertService: AlertService,
        private authService: AuthService,
        private configurations: ConfigurationService,
        private userService: UserService,
        private route: ActivatedRoute) {
        this.route.queryParams.subscribe(params => {
            this._email = params.email;
        });
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this._email = params.email == undefined ? "xxx@xxx.xxx" : params.email;
           // console.log(this._email);
        });
    }


}
