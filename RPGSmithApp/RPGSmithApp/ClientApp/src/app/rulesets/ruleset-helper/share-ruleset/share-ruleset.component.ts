import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { RulesetService } from '../../../core/services/ruleset.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Utilities } from '../../../core/common/utilities';
import { PlatformLocation } from '@angular/common';

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
      private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1)); }

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
