import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from './../../../../services/alert.service';
import { ConfigurationService } from '../../../../services/configuration.service';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { Utilities } from './../../../../services/utilities';
import { User } from '../../../../models/user.model';
import { DBkeys } from '../../../../services/db-Keys';
import { LocalStoreManager } from '../../../../services/local-store-manager.service';

import { RulesetDashboardLayoutService } from "../../../../services/ruleset-dashboard-layout.service";
import { RulesetDashboardLayout } from '../../../../models/view-models/ruleset-dashboard-layout.model';

import { SharedService } from "../../../../services/shared.service";
import { CommonService } from "../../../../services/shared/common.service";
import { AuthService } from "../../../../services/auth.service";
import { VIEW } from '../../../../models/enums';

@Component({
    selector: 'app-ruleset-layout',
    templateUrl: './ruleset-layout.component.html',
    styleUrls: ['./ruleset-layout.component.scss']
})
export class RulesetLayoutComponent implements OnInit {

    layoutModel: RulesetDashboardLayout = new RulesetDashboardLayout();
    layoutFormModal: RulesetDashboardLayout = new RulesetDashboardLayout();
    layoutForm: FormGroup;
    isLoading = false;
    rulesetId: number;
    layoutPages: any;
    disabled: boolean = false;
    screenHeight: number;
    screenWidth: number;

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
    }

    constructor(
        private router: Router, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, private layoutService: RulesetDashboardLayoutService,
        private bsModalRef: BsModalRef, private modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService
    ) {
        this.onResize();
    }

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
                this.layoutPages = this.bsModalRef.content.layoutPages;
                this.layoutFormModal = Object.assign({}, this.bsModalRef.content.layoutFormModal ? this.bsModalRef.content.layoutFormModal : this.layoutFormModal);
                this.layoutFormModal.view = modalContentButton === 'DUPLICATE' ? VIEW.DUPLICATE : modalContentButton === 'UPDATE' ? VIEW.EDIT : VIEW.ADD;

                if (this.layoutFormModal.view == VIEW.DUPLICATE) {
                    this.layoutFormModal.name = '';
                }
                this.rulesetId = this.layoutFormModal.rulesetId = this.bsModalRef.content.rulesetId;
                this.screenWidth = this.layoutFormModal.layoutWidth ? this.layoutFormModal.layoutWidth : this.screenWidth;
                this.screenHeight = this.layoutFormModal.layoutHeight ? this.layoutFormModal.layoutHeight : this.screenHeight;
            }, 0);
        }
    }

    submitForm() {
        if (this.layoutFormModal.name == "") {
            this.alertService.showMessage("Please add Layout Name.", "Name is required", MessageSeverity.error);
        }
        else {
            this.isLoading = true;
            let _msg = this.layoutFormModal.rulesetDashboardLayoutId == 0 || this.layoutFormModal.rulesetDashboardLayoutId === undefined ? "Creating Layout..." : "Updating Layout...";
            this.alertService.startLoadingMessage("", _msg);

            this.layoutFormModal.layoutWidth = this.screenWidth;
            this.layoutFormModal.layoutHeight = this.screenHeight;
            this.layoutFormModal.rulesetId = this.rulesetId;

            if (this.layoutFormModal.rulesetDashboardLayoutId == 0 || this.layoutFormModal.rulesetDashboardLayoutId === undefined) {
                this.addLayout(this.layoutFormModal);
            }
            else if (this.layoutFormModal.rulesetDashboardLayoutId > 0 && this.layoutFormModal.view == VIEW.EDIT) {
                this.updateLayout(this.layoutFormModal);
            }
            else if (this.layoutFormModal.rulesetDashboardLayoutId > 0 && this.layoutFormModal.view == VIEW.DUPLICATE) {
                this.layoutFormModal.rulesetDashboardLayoutId = undefined;
                this.duplicateLayout(this.layoutFormModal);
            }
        }
    }

    private addLayout(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.layoutService.createRulesetDashboardLayout(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();

                    let message = "Layout has been added successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.disabled = false;
                    this.bsModalRef.hide();
                    this.sharedService.updateRulesetDashboardLayout(true);
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

    private updateLayout(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.layoutService.updateRulesetDashboardLayout(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();

                    let message = "Layout has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);

                    this.bsModalRef.hide();
                    this.sharedService.updateRulesetDashboardLayout(true);

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

    private duplicateLayout(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.layoutService.duplicateRulesetDashboardLayout(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();

                    let message = "Layout has been duplicated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);

                    this.bsModalRef.hide();
                    this.sharedService.updateRulesetDashboardLayout(true);

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

    manageRuleSets() {
        this.bsModalRef.hide();
        this.router.navigate(['/rulesets']);
    }


}
