import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { fadeInOut } from '../../../services/animations';
import { AlertService, MessageSeverity, DialogType } from '../../../services/alert.service';
import { AuthService } from "../../../services/auth.service";
import { ConfigurationService } from '../../../services/configuration.service';
import { Utilities } from '../../../services/utilities';
import { RulesetService } from "../../../services/ruleset.service";
import { Ruleset } from '../../../models/view-models/ruleset.model';
import { VIEW } from '../../../models/enums';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { RulesetFormComponent } from '../ruleset-form/ruleset-form.component';
import { RulesetManageComponent } from '../ruleset-form/ruleset-manage.component';

import { SharedService } from '../../../services/shared.service';
import { CommonService } from "../../../services/shared/common.service";
import { LocalStoreManager } from '../../../services/local-store-manager.service';

import { DBkeys } from "../../../services/db-Keys";
import { User } from '../../../models/user.model';
import { RulesetRecordCount } from '../../../models/view-models/ruleset-record-count.model';
import { ImportRulesetComponent } from '../ruleset-helper/import-ruleset/import-ruleset.component'
import { RulesetAddComponent } from "../ruleset-helper/ruleset-add/ruleset-add.component";

@Component({
  selector: 'app-ruleset',
  templateUrl: './ruleset.component.html',
    styleUrls: ['./ruleset.component.scss'],
    animations: [fadeInOut]
})

export class RulesetComponent implements OnInit {

    openManage: boolean = false;;
    page?: number = 1;
    pagesize?: number = 30;
    bsModalRef: BsModalRef;
    rulesets: any; //Ruleset[];
    isLoading = false;
    isDropdownOpen: boolean = false;
    showForm: boolean = false;
    showPlus: boolean = true;
    isAdminUser: boolean = false;

    constructor(
        private router: Router, private alertService: AlertService, private localStorage: LocalStoreManager,
        private authService: AuthService, private configurations: ConfigurationService,
        private rulesetService: RulesetService, private modalService: BsModalService, private modalService1: BsModalService,
        private sharedService: SharedService, private commonService: CommonService
    ) {
        if (!this.authService.isLoggedIn) {
            this.authService.logout();
        }
        this.sharedService.shouldUpdateRulesetList().subscribe(ruleset => {
            if (ruleset) {
                this.openManage = false;
                this.initialize(ruleset);
            }
        });
    }

    @HostListener('document:click', ['$event.target'])
    documentClick(target: any) {        
        try {
            if (target.className.endsWith("not-plus"))
                this.showPlus = false;
            else if (target.className.endsWith("is-plus"))
                this.showPlus = !this.showPlus;
            else this.showPlus = true;

            if (target.className.endsWith("is-show"))
                this.isDropdownOpen = !this.isDropdownOpen;
            else this.isDropdownOpen = false;
        } catch (err) { this.isDropdownOpen = false; this.showPlus = true;}
    }
   
    ngOnInit() {
        this.destroyModalOnInit();
        this.initialize(null);
    }

    private resetHeaderValues(): any {
        try {
            this.sharedService.updateAccountSetting(-1);
            this.localStorage.deleteData(DBkeys.HEADER_VALUE);
            this.localStorage.saveSyncedSessionData(undefined, DBkeys.HEADER_VALUE);
        } catch (err) { }
    }
    
    private initialize(ruleset?: any) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isAdminUser = user.roles.some(function (value) { return (value === "administrator") });
            this.isLoading = true;
            this.rulesetService.getRulesetsByUserId(user.id)
                .subscribe(data => {
                    this.rulesets = data;
                    this.isLoading = false;
                    if (ruleset && !this.openManage) {
                        let rulesetData = ruleset;
                        this.manageRuleset(ruleset);
                        ruleset = null;
                        this.openManage = true;
                    }
                }, error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                }, () => { });
            //setTimeout(() => {
            //    if (ruleset && !this.isLoading) this.manageRuleset(ruleset);
            //}, 200);

            //resting headers
            this.resetHeaderValues();
        }
    }

    addRuleset() {
        this.bsModalRef = this.modalService.show(RulesetAddComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.rulesets = this.rulesets;
        this.bsModalRef.content.eventEmitter.subscribe(result => {
            if (result) {
                this.initialize();
            }
        });
    }

    createRuleset() {
        this.bsModalRef = this.modalService.show(RulesetFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Create Rule Set';
        this.bsModalRef.content.button = 'NEXT';
        this.bsModalRef.content.rulesetModel = { ruleSetId: 0 };
    }

    manageRuleset(ruleset: Ruleset) {
        
        console.log('mange ruleset popup');
        if (!document.getElementsByClassName('mng-ruleset-popup').length) {
            this.setRulesetId(ruleset.ruleSetId);
            setTimeout(() => {
                this.bsModalRef = this.modalService1.show(RulesetManageComponent, {
                    class: 'modal-primary modal-md mng-ruleset-popup',
                    ignoreBackdropClick: true,
                    keyboard: false
                });
                this.bsModalRef.content.title = 'Rule Set Properties';
                ruleset.view = VIEW.EDIT;
                this.bsModalRef.content.ruleset = ruleset;
                this.bsModalRef.content.recordCount = ruleset.recordCount;   
            }, 100);
                  
        }       
    }
    private setRulesetId(rulesetId: number) {
        this.localStorage.deleteData(DBkeys.RULESET_ID);
        this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
    }
    manageIcon(id: number) {
        this.rulesets.forEach(function (val) {
            if (id === val.ruleSetId) {
                val.showIcon = true;
            } else {
                val.showIcon = false;
            }
        })
    }

    editRuleset(ruleset: Ruleset) {
        this.bsModalRef = this.modalService.show(RulesetFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Rule Set';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.ruleSetImage = ruleset.ruleSetImage;
        this.bsModalRef.content.rulesetModel = ruleset;
    }

    duplicateRuleset(ruleset: Ruleset) {
        this.bsModalRef = this.modalService.show(RulesetFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Duplicate Rule Set';
        this.bsModalRef.content.button = 'DUPLICATE';
        this.bsModalRef.content.ruleSetImage = ruleset.ruleSetImage;
        this.bsModalRef.content.rulesetModel = ruleset;
    }

    deleteRuleset(ruleset: Ruleset) {
        this.alertService.showDialog('Are you sure you want to delete "' + ruleset.ruleSetName + '" ruleset and all its characters?',
            DialogType.confirm, () => this.deleteRulesetHelper(ruleset), null, 'Yes', 'No');
    }

    private deleteRulesetHelper(ruleset: Ruleset) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting Ruleset");

        this.rulesetService.deleteRuleset(ruleset.ruleSetId)
            .subscribe(
            data => {
                this.isLoading = false; 
                this.alertService.stopLoadingMessage();
                this.commonService.UpdateCounts(); /*update charaters count*/
                this.alertService.showMessage("Ruleset has been deleted successfully.", "", MessageSeverity.success);
                this.rulesets = this.rulesets.filter((val) => val.ruleSetId != ruleset.ruleSetId);
                //this.initialize();
            },
            error => {
                this.isLoading = false; 
                this.alertService.stopLoadingMessage();

                let Errors = Utilities.ErrorDetail("Unable to Delete", error);
                if (Errors.sessionExpire) {
                    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                    this.authService.logout(true);
                }
                else
                    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

            });
    }
    
    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
            this.sharedService.updateAccountSetting(false);
            this.localStorage.deleteData(DBkeys.HEADER_VALUE);
        } catch (err) { }
    }

    importRuleset() {
        this.bsModalRef = this.modalService.show(ImportRulesetComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });    
        this.bsModalRef.content.rulesetModel = { ruleSetId: 0 };
    }
}
