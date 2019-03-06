import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RulesetService } from '../../../core/services/ruleset.service';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';

@Component({
  selector: 'app-ruleset-add-interface',
  templateUrl: './ruleset-add-interface.component.html',
  styleUrls: ['./ruleset-add-interface.component.scss']
})
export class RulesetAddInterfaceComponent implements OnInit {

    isLoading = false;
    _view: string;
    rulesetsList: any;
    addedRuleset: any;
    multiRulesets: number[] = [];
    public eventEmitter: EventEmitter<any> = new EventEmitter();

    constructor(private router: Router,
        private alertService: AlertService,
        private authService: AuthService,
        private localStorage: LocalStoreManager,
        private route: ActivatedRoute,
        private sharedService: SharedService,
        private commonService: CommonService,
        private rulesetService: RulesetService) { }

    ngOnInit() {
        setTimeout(() => {
            //this.addedRuleset = this.bsModalRef.content.rulesets;
            this.initialize();
        }, 0);
  }
    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            this.rulesetService.getCoreRulesets<any[]>(user.id)
                .subscribe(data => {
                    //console.log('idata', data);
                    this.rulesetsList = data;
                    this.rulesetsList.forEach(function (val) { val.showIcon = false; });
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                }, () => { });
        }
    }
    addRuleSet(ruleSetId) {

        //if (this.multiRulesets.length > 0) {
        //this.isLoading = true;
        this.alertService.startLoadingMessage("", "Adding Ruleset");
        let ruleSets = [];
        ruleSets.push(ruleSetId);
        this.rulesetService.addRuleSets<any>(ruleSets)
            .subscribe(
            data => {
               // this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let message = "Rule Set(s) have been added successfully.";
                this.alertService.showMessage(message, "", MessageSeverity.success);
                this.RedirectBack();
                    //this.eventEmitter.emit(true);
                },
            error => {
                   // this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Add ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
        //}
    }
    RedirectBack() {
      this.router.navigate(['/rulesets']);
        //window.history.back();
    }

    htmltoPlainText(text) {
        return text ? new DOMParser().parseFromString(String(text).replace(/<[^>]+>/gm, ''), "text/html").documentElement.textContent : '';
    }

}