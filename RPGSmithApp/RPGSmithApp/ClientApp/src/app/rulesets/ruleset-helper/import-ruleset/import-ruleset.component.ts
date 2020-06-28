import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RulesetService } from '../../../core/services/ruleset.service';
import { Utilities } from '../../../core/common/utilities';
import { RulesetFormComponent } from '../../ruleset-form/ruleset-form.component';
import { VIEW } from '../../../core/models/enums';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'import-ruleset',
    templateUrl: './import-ruleset.component.html',
    styleUrls: ['./import-ruleset.component.scss']
})
export class ImportRulesetComponent implements OnInit {

    rulesetModel = new Ruleset();

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
        this.bsModalRef.hide();
    }

    submitForm(modal: any) {
        this.rulesetService.importRuleSet(modal.shareCode)
            .subscribe(
                data => {
                    this.close();
                    this.generalSetting(data);
                },
                error => {
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Import ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });

    }

    generalSetting(ruleset: Ruleset) {
        
        this.bsModalRef = this.modalService.show(RulesetFormComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Import Rule Set';
        this.bsModalRef.content.button = 'IMPORT';
        ruleset.view = VIEW.DUPLICATE;
        this.bsModalRef.content.ruleSetImage = ruleset.ruleSetImage;
        this.bsModalRef.content.rulesetModel = ruleset;
    }

    
}
