import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { AuthService } from '../../core/auth/auth.service';
import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { ConfigurationService } from '../../core/common/configuration.service';

@Component({
  selector: 'app-terms-condition',
  templateUrl: './terms-condition.component.html',
  styleUrls: ['./terms-condition.component.scss']
})
export class TermsConditionComponent implements OnInit {

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
