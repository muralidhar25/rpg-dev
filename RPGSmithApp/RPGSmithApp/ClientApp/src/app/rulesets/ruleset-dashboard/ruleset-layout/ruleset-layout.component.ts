import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { RulesetDashboardLayout } from '../../../core/models/view-models/ruleset-dashboard-layout.model';
import { DEVICE, VIEW, Layout } from '../../../core/models/enums';
import { SharedService } from '../../../core/services/shared.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { RulesetDashboardLayoutService } from '../../../core/services/ruleset-dashboard-layout.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { DBkeys } from '../../../core/common/db-keys';
import { User } from '../../../core/models/user.model';
import { Utilities } from '../../../core/common/utilities';
import { PlatformLocation } from '@angular/common';

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

    DeviceType = DEVICE
    View = VIEW
  title: string = ''
  button: string = ''
  isCampaignDashboardScreen: boolean= false;
    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
    }
  isShared: boolean = false;

    constructor(
        private router: Router, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, private layoutService: RulesetDashboardLayoutService,
        private bsModalRef: BsModalRef, private modalService: BsModalService, private localStorage: LocalStoreManager,
      private sharedService: SharedService, private commonService: CommonService,
      private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
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
              this.isCampaignDashboardScreen = this.bsModalRef.content.isCampaignDashboardScreen ? this.bsModalRef.content.isCampaignDashboardScreen : false;
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
              if (this.isCampaignDashboardScreen) {
                this.layoutFormModal.isSharedLayout = true;
              }
              

              if (this.layoutFormModal.name == Layout.SharedLayoutName) {
                this.isShared = true;
              }
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
    SelectDefaultLayout(event, element, layout, deviceName) {
        if (event.target.checked) {
            
            let message = 'Would you like to make this ' + layout.name + ' Layout the default layout for ' + deviceName + ' Devices?';
            this.alertService.showDialog(message,
                DialogType.confirm, () => this.updateLayoutDefaultDevice(layout, deviceName), () => this.DeselectSelectedDevice(event, layout, deviceName), 'Yes', 'No');
        }
    }
    updateLayoutDefaultDevice(layout, device) {
        switch (device) {
            case DEVICE.COMPUTER:
                layout.isDefaultComputer = true;
                break;
            case DEVICE.TABLET:
                layout.isDefaultTablet = true;
                break;
            case DEVICE.MOBILE:
                layout.isDefaultMobile = true;
                break;
            default:
        }
    }
    DeselectSelectedDevice(event, layout, device) {
        event.target.checked = false;
        event.target.disabled = false;
        switch (device) {
            case DEVICE.COMPUTER:
                layout.isDefaultComputer = false;
                break;
            case DEVICE.TABLET:
                layout.isDefaultTablet = false;
                break;
            case DEVICE.MOBILE:
                layout.isDefaultMobile = false;
                break;
            default:
        }
    }
}
