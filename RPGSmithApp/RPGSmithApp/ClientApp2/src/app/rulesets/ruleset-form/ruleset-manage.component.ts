import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from "@angular/router";

import { SharedService } from "../../core/services/shared.service";
import { DBkeys } from '../../core/common/db-keys';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { RulesetService } from "../../core/services/ruleset.service";
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { RulesetRecordCount } from '../../core/models/view-models/ruleset-record-count.model';
import { VIEW } from '../../core/models/enums';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { RulesetFormComponent } from '../ruleset-form/ruleset-form.component';
import { ShareRulesetComponent } from '../ruleset-helper/share-ruleset/share-ruleset.component';

@Component({
    selector: 'ruleset-manage',
    templateUrl: './ruleset-manage.component.html',
    styleUrls: ['./ruleset-manage.component.scss']
})

export class RulesetManageComponent implements OnInit,OnChanges {

    rulesetModel = new Ruleset();
    @Output() add: EventEmitter<Ruleset> = new EventEmitter<Ruleset>();
    @Output() update: EventEmitter<Ruleset> = new EventEmitter<Ruleset>();

    rulesetForm: FormGroup;
    isLoading = false;
    rulesetRecordCount: any = new RulesetRecordCount();

    constructor(
        private formBuilder: FormBuilder, private router: Router, private localStorage: LocalStoreManager,
        private rulesetService: RulesetService, private bsModalRef: BsModalRef, private sharedService: SharedService,
        private modalService: BsModalService
    ) {
    }
    ngOnInit() {
        setTimeout(() => {
            this.rulesetRecordCount = this.bsModalRef.content.recordCount == undefined
                ? new RulesetRecordCount() : this.bsModalRef.content.recordCount;
            this.rulesetModel = this.bsModalRef.content.ruleset == undefined
                ? new Ruleset() : this.bsModalRef.content.ruleset;
            this.setHeaderValues(this.rulesetModel);
        }, 0);
    }

    ngOnChanges() {
    }

    ngOnDestroy() {

    }

    private setHeaderValues(ruleset: Ruleset): any {
        try {
            let headerValues = {
                headerName: ruleset.ruleSetName,
                headerImage: ruleset.imageUrl ? ruleset.imageUrl : 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RuleSetWhite.png',
                headerId: ruleset.ruleSetId,
                headerLink: 'ruleset',
                hasHeader: true
            };
            this.sharedService.updateAccountSetting(headerValues);
            this.localStorage.deleteData(DBkeys.HEADER_VALUE);
            this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
        } catch (err) { }
    }

    generalSetting(ruleset: Ruleset) {

        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(RulesetFormComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false,
            initialState: {
                data: ruleset
            }
        });
        this.bsModalRef.content.title = 'Edit RuleSet';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.ruleSetImage = ruleset.ruleSetImage;
        ruleset.view = VIEW.MANAGE;
        this.bsModalRef.content.rulesetModel = ruleset;
    }

    characterStats(ruleset: Ruleset) {
        this.close();
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/character-stats', ruleset.ruleSetId]);
    }


    item(ruleset: Ruleset) {
        this.close();
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/item-master', ruleset.ruleSetId]);
    }

    spell(ruleset: Ruleset) {
        this.close();
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/spell', ruleset.ruleSetId]);
    }

    ability(ruleset: Ruleset) {
        this.close();
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/ability', ruleset.ruleSetId]);
    }

    shareRuleset(ruleset: Ruleset) {
        this.close(false);
        this.bsModalRef = this.modalService.show(ShareRulesetComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.ruleset = ruleset;
    }

    gotoDashboard(ruleset: Ruleset) {
        this.router.navigate(['/ruleset/dashboard', ruleset.ruleSetId])
    }

    close(back?: boolean) {
        this.bsModalRef.hide();
        //this.modalService.hide(1);
        if (back) {
            this.sharedService.updateAccountSetting(false);
            this.localStorage.deleteData(DBkeys.HEADER_VALUE);
        }
    }

}
