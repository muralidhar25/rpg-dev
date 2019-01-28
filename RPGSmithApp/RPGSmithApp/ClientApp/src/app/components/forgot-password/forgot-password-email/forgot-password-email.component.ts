import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute, Params } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../../services/alert.service';
import { AuthService } from "../../../services/auth.service";
import { ConfigurationService } from '../../../services/configuration.service';
import { UserService } from "../../../services/user.service";
import { Utilities } from '../../../services/utilities';


@Component({
  selector: 'app-forgot-password-email',
  templateUrl: './forgot-password-email.component.html',
  styleUrls: ['./forgot-password-email.component.css']
})
export class ForgotPasswordEmailComponent implements OnInit {
    _userid: string;
    _code: string;


    constructor(
        private router: Router,
        private alertService: AlertService,
        private authService: AuthService,
        private configurations: ConfigurationService,
        private userService: UserService,
        private route: ActivatedRoute) { 
     this.route.queryParams.subscribe((params: Params) => {
         //console.log(params);
         this._userid = params.id;
        // this._code = "xx";
      });}
  ngOnInit() {
  }
    changePassword() {
        this.router.navigate(['/resetpassword'], { queryParams: { userid: this._userid } })
    }
}
