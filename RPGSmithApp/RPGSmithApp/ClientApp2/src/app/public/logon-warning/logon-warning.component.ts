// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { Utilities } from "../../core/common/utilities";

@Component({
    selector: "logon-warning",
    templateUrl: './logon-warning.component.html',
    styleUrls: ['./logon-warning.component.scss']
})

export class LogonWarningComponent implements OnInit {

    appLogo = '../assets/images/' + Utilities.LogoImage //"../assets/images/logo-full.png";
    constructor(
        private route: Router
    ) {
    }

    ngOnInit() {

    }

    openFacebook(){
        window.open("https://www.facebook.com/RPG-Smith-1625592264372389", "_blank");
    }

    openGoogle(){
        window.open("https://plus.google.com/u/2/communities/101062066525142446219", "_blank");
    }
    
}
