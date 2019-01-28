import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
import { DBkeys } from '../../services/db-Keys';
import { LocalStoreManager } from '../../services/local-store-manager.service';
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-incompatible-browser',
  templateUrl: './incompatible-browser.component.html',
  styleUrls: ['./incompatible-browser.component.scss']
})
export class IncompatibleBrowserComponent implements OnInit {

    constructor(
        private router: Router, private localStorage: LocalStoreManager,
        private authService: AuthService
    ) { }

    ngOnInit() {

       // this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
    }

    proceed() {
        
        this.localStorage.deleteData(DBkeys.NOT_CHROME);
        this.localStorage.saveSyncedSessionData(true, DBkeys.NOT_CHROME);
        this.authService.logout();
        this.authService.redirectLogoutUser();
    }

}
