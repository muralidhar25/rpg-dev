import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { RulesetService } from '../../../core/services/ruleset.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';

@Component({
    selector: 'ruleset-add',
    templateUrl: './ruleset-add.component.html',
    styleUrls: ['./ruleset-add.component.scss']
})
export class RulesetAddComponent implements OnInit {

    isLoading = false;
    _view: string;
    rulesetsList: any;
    addedRuleset: any;
    multiRulesets: number[] = [];
    public eventEmitter: EventEmitter<any> = new EventEmitter();

    constructor(private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService, private rulesetService: RulesetService
    ) { }

    ngOnInit() {
        setTimeout(() => {            
            this.addedRuleset = this.bsModalRef.content.rulesets;
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
                    this.rulesetsList = data;
                    this.rulesetsList.forEach(function (val) { val.showIcon = false; });
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false; 
                }, () => { });
        }
    }

    setRuleset(event: any, ruleset: any) {
        if (event.target.checked) {
            this.multiRulesets=[];
            this.multiRulesets.push(ruleset.ruleSetId);
        }
        else {
            this.multiRulesets.splice(this.multiRulesets.indexOf(ruleset.ruleSetId), 1);
        }
    }

    submitForm() {

        //if (this.multiRulesets.length > 0) {
        this.isLoading = true;
        this.rulesetService.addRuleSets<any>(this.multiRulesets)
            .subscribe(
                data => {
                    this.isLoading = false;
                    let message = "Rule Set(s) have been added successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.close();
                    this.eventEmitter.emit(true);
                },
                error => {
                    this.isLoading = false;
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

    close() {
        this.bsModalRef.hide();
    }
}
