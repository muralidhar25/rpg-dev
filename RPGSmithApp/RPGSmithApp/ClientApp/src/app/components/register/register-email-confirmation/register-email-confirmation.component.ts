import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../../services/alert.service';
import { AuthService } from "../../../services/auth.service";
import { ConfigurationService } from '../../../services/configuration.service';
import { UserService } from "../../../services/user.service";
import { Utilities } from '../../../services/utilities';

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
