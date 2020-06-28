import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { AuthService } from "../../core/auth/auth.service";
import { ConfigurationService } from '../../core/common/configuration.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  isLoggedIn: boolean;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn;
  }

  logout() {
    this.authService.logout();
    this.authService.redirectLogoutUser();
  }

  goBack() {
    window.history.back()
  }

}
