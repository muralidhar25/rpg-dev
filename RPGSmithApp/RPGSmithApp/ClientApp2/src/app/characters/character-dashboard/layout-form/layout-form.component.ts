import { Component, OnInit, HostListener  } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router,  } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { CharacterDashboardLayoutService } from "../../../core/services/character-dashboard-layout.service";
import { CharacterDashboardLayout } from '../../../core/models/view-models/character-dashboard-layout.model';

import { SharedService } from "../../../core/services/shared.service";
import { CommonService } from "../../../core/services/shared/common.service";
import { AuthService } from "../../../core/auth/auth.service";
import { VIEW } from '../../../core/models/enums';

@Component({
    selector: 'app-layout-form',
    templateUrl: './layout-form.component.html',
    styleUrls: ['./layout-form.component.scss']
})
export class LayoutFormComponent implements OnInit {

    layoutModel: CharacterDashboardLayout = new CharacterDashboardLayout();
    layoutFormModal: CharacterDashboardLayout = new CharacterDashboardLayout();
    layoutForm: FormGroup;
    isLoading = false;
    characterId: number;
    layoutPages: any;
    disabled: boolean = false;
    screenHeight: number;
    screenWidth: number;
    title: string
    button:string
    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
    }

    constructor(
        private router: Router, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, private layoutService: CharacterDashboardLayoutService,
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
                this.title = this.bsModalRef.content.title;
                let modalContentButton = this.button = this.bsModalRef.content.button;
                this.layoutPages = this.bsModalRef.content.layoutPages;
                this.layoutFormModal = Object.assign({}, this.bsModalRef.content.layoutFormModal ? this.bsModalRef.content.layoutFormModal : this.layoutFormModal);
                this.layoutFormModal.view = modalContentButton === 'DUPLICATE' ? VIEW.DUPLICATE : modalContentButton === 'UPDATE' ? VIEW.EDIT : VIEW.ADD;

                if (this.layoutFormModal.view == VIEW.DUPLICATE) {
                    this.layoutFormModal.name = '';
                }
                this.characterId = this.layoutFormModal.characterId = this.bsModalRef.content.characterId;
                this.screenWidth = this.layoutFormModal.layoutWidth ? this.layoutFormModal.layoutWidth : this.screenWidth;
                this.screenHeight = this.layoutFormModal.layoutHeight ? this.layoutFormModal.layoutHeight : this.screenHeight;
            }, 0);
        }
    }

    submitForm() {
        if (this.layoutFormModal.name=="") {
            this.alertService.showMessage("Please add Layout Name.", "Name is required", MessageSeverity.error);
        }
        else {
            this.isLoading = true;
            let _msg = this.layoutFormModal.characterDashboardLayoutId == 0 || this.layoutFormModal.characterDashboardLayoutId === undefined ? "Creating Layout..." : "Updating Layout...";         
            this.alertService.startLoadingMessage("", _msg);

            this.layoutFormModal.layoutWidth = this.screenWidth;
            this.layoutFormModal.layoutHeight = this.screenHeight;
            this.layoutFormModal.characterId = this.characterId;
            
            if (this.layoutFormModal.characterDashboardLayoutId == 0 || this.layoutFormModal.characterDashboardLayoutId === undefined) {
                this.addLayout(this.layoutFormModal);
            }
            else if (this.layoutFormModal.characterDashboardLayoutId > 0 && this.layoutFormModal.view == VIEW.EDIT) {
                this.updateLayout(this.layoutFormModal);
            }
            else if (this.layoutFormModal.characterDashboardLayoutId > 0 && this.layoutFormModal.view == VIEW.DUPLICATE) {
                this.layoutFormModal.characterDashboardLayoutId = undefined;
                this.duplicateLayout(this.layoutFormModal);
            }
        }
    }

    private addLayout(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.layoutService.createCharacterDashboardLayout(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();

                    let message =  "Layout has been added successfully." ;
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.disabled = false;
                    this.bsModalRef.hide();
                    this.sharedService.updateCharacterDashboardLayout(true);  
                },
                error => {
                    console.log(error);
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();
                    let _message ="Unable to Add " ;
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
        this.layoutService.updateCharacterDashboardLayout(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();

                    let message =  "Layout has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                   
                    this.bsModalRef.hide();
                    this.sharedService.updateCharacterDashboardLayout(true);                  
                  
                },
                error => {
                    console.log(error);
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();
                    let _message =  "Unable to Update ";
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
        this.layoutService.duplicateCharacterDashboardLayout(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.disabled = false;
                    this.alertService.stopLoadingMessage();

                    let message = "Layout has been duplicated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);

                    this.bsModalRef.hide();
                    this.sharedService.updateCharacterDashboardLayout(true);

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
