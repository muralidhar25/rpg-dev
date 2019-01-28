import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../../services/alert.service';
import { LocalStoreManager } from '../../../../services/local-store-manager.service';
import { Ruleset } from '../../../../models/view-models/ruleset.model';
import { RulesetService } from "../../../../services/ruleset.service";
import { VIEW } from '../../../../models/enums';
import { RulesetManageComponent } from '../../ruleset-form/ruleset-manage.component';
import { Utilities } from '../../../../services/utilities';
import { AuthService } from '../../../../services/auth.service';
import { RulesetFormComponent } from '../../ruleset-form/ruleset-form.component';

@Component({
    selector: 'import-ruleset',
    templateUrl: './import-ruleset.component.html',
    styleUrls: ['./import-ruleset.component.scss']
})
export class ImportRulesetComponent implements OnInit {

    rulesetModel = new Ruleset();

    constructor(private router: Router, private alertService: AlertService, private authService: AuthService, 
        private bsModalRef: BsModalRef, private modalService: BsModalService,
        private localStorage: LocalStoreManager, private rulesetService: RulesetService
    ) { }

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
