import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { RulesetDashboardPage } from '../../../core/models/view-models/ruleset-dashboard-page.model';
import { Color } from '../../../core/models/tiles/color.model';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { RulesetDashboardPageService } from '../../../core/services/ruleset-dashboard-page.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { SharedService } from '../../../core/services/shared.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { User } from '../../../core/models/user.model';
import { VIEW } from '../../../core/models/enums';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';


@Component({
    selector: 'app-ruleset-page',
    templateUrl: './ruleset-page.component.html',
    styleUrls: ['./ruleset-page.component.scss']
})
export class RulesetPageComponent implements OnInit {

    pageFormModal: RulesetDashboardPage = new RulesetDashboardPage();
    pageForm: FormGroup;
    colorModel: Color = new Color();
    isLoading = false;
    rulesetId: number;
    layoutId: number;
    disabled: boolean = false;
  title: string = ''
  button: string = ''
    constructor(
        private router: Router, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, private pageService: RulesetDashboardPageService,
        private bsModalRef: BsModalRef, private modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService
    ) { }

    ngOnInit() {
        this.Initialize();
    }

    private Initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            setTimeout(() => {
                let modalContentButton = this.bsModalRef.content.button;
                this.rulesetId = this.bsModalRef.content.rulesetId;
                this.layoutId = this.bsModalRef.content.layoutId;
                this.pageFormModal = Object.assign({}, this.bsModalRef.content.pageFormModal ? this.bsModalRef.content.pageFormModal : this.pageFormModal);
                this.pageFormModal.view = modalContentButton === 'DUPLICATE' ? VIEW.DUPLICATE : modalContentButton === 'UPDATE' ? VIEW.EDIT : VIEW.ADD;

                if (this.pageFormModal.view == VIEW.DUPLICATE) {
                    this.pageFormModal.name = '';
                }
                this.setDefaultColors();
            }, 0);
        }
    }

    private setDefaultColors() {
        this.pageFormModal.titleTextColor = this.pageFormModal.titleTextColor ? this.pageFormModal.titleTextColor : '#000000';
        this.pageFormModal.titleBgColor = this.pageFormModal.titleBgColor ? this.pageFormModal.titleBgColor : '#FFFFFF';
        this.pageFormModal.bodyTextColor = this.pageFormModal.bodyTextColor ? this.pageFormModal.bodyTextColor : '#000000';
        this.pageFormModal.bodyBgColor = this.pageFormModal.bodyBgColor ? this.pageFormModal.bodyBgColor : '#FFFFFF';
    }

    submitForm() {
        if (this.pageFormModal.name == "") {
            this.alertService.showMessage("Please add Page Name.", "Name is required", MessageSeverity.error);
        }
        else {
            this.isLoading = true;
            let _msg = this.pageFormModal.rulesetDashboardPageId == 0 || this.pageFormModal.rulesetDashboardPageId === undefined ? "Creating Page..." : "Updating Page...";
            this.alertService.startLoadingMessage("", _msg);

            this.pageFormModal.rulesetId = this.rulesetId;

            if (this.pageFormModal.rulesetDashboardPageId == 0 || this.pageFormModal.rulesetDashboardPageId === undefined) {
                this.pageFormModal.rulesetDashboardLayoutId = this.layoutId;
                this.addPage(this.pageFormModal);
            }
            else if (this.pageFormModal.rulesetDashboardPageId > 0 && this.pageFormModal.view == VIEW.EDIT) {
                this.updatePage(this.pageFormModal);
            }
            else if (this.pageFormModal.rulesetDashboardPageId > 0 && this.pageFormModal.view == VIEW.DUPLICATE) {
                //this.pageFormModal.rulesetDashboardPageId = undefined;
                this.duplicatePage(this.pageFormModal);
            }
        }
    }

    private addPage(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.pageService.createEditRulesetDashboardPage(modal)
            .subscribe(
            data => {
                //if (data != null) {
                //    if ((typeof data) === "string") {
                //        let str:any=data
                //        data = JSON.parse(str);
                //    }
                //    let viewType = modal.view;
                //    modal = data;
                //    modal.view = viewType;
                //}
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();

                    let message = "Page has been added successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.disabled = false;
                    this.bsModalRef.hide();
                    this.sharedService.updateRulesetDashboardPage(modal);
                },
                error => {
                    console.log(error);
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Add ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {

                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
        );
    }

    private updatePage(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.pageService.createEditRulesetDashboardPage(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let message = "Page has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.disabled = false;
                    this.bsModalRef.hide();
                    this.sharedService.updateRulesetDashboardPage(modal);
                },
                error => {
                    console.log(error);
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Update ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
        );
    }

    private duplicatePage(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.pageService.duplicateRulesetDashboardPage(modal)
            .subscribe(
            data => {
                //if (data != null) {
                //    if ((typeof data) === "string") {
                //        let str: any = data
                //        data = JSON.parse(str);
                //    }
                //    let viewType = modal.view;
                //    modal = data;
                //    modal.view = viewType;
                //}
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let message = "Page has been duplicated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.disabled = false;
                    this.bsModalRef.hide();
                    this.sharedService.updateRulesetDashboardPage(modal);
                },
                error => {
                    console.log(error);
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Duplicate ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
        );
    }

    close() {
        this.bsModalRef.hide();
    }

}
