import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../../services/alert.service';
import { LocalStoreManager } from '../../../../services/local-store-manager.service';
import { Ruleset } from '../../../../models/view-models/ruleset.model';
import { RulesetService } from "../../../../services/ruleset.service";
import { Utilities } from '../../../../services/utilities';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'share-ruleset',
    templateUrl: './share-ruleset.component.html',
    styleUrls: ['./share-ruleset.component.scss']
})
export class ShareRulesetComponent implements OnInit {

    rulesetModel = new Ruleset();
    emailId: string = '';
    isLoading = false;

    constructor(private router: Router, private alertService: AlertService, private authService: AuthService,
        private bsModalRef: BsModalRef, private modalService: BsModalService,
        private localStorage: LocalStoreManager, private rulesetService: RulesetService,
    ) { }

    ngOnInit() {
        setTimeout(() => {            
            this.rulesetModel = this.bsModalRef.content.ruleset == undefined
                ? new Ruleset() : this.bsModalRef.content.ruleset;           
        }, 0);
    }

    close() {
        if (!this.isLoading)
            this.bsModalRef.hide();
    }

    submitForm() {
        this.sendRuleSetCode();
    }

    sendRuleSetCode() {
        this.isLoading = true; 
        this.rulesetService.shareRuleSetCode(this.emailId, this.rulesetModel.shareCode)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Rule Set has been shared successfully.", "", MessageSeverity.success);
                    this.close();
                },
            error => {
                this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Send ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

                });
    }

}
