import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { CharacterDashboardPageService } from "../../../core/services/character-dashboard-page.service";

import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { CharacterDashboardPage } from '../../../core/models/view-models/character-dashboard-page.model';
import { VIEW } from '../../../core/models/enums';
import { Color } from '../../../core/models/tiles/color.model';

import { SharedService } from "../../../core/services/shared.service";
import { CommonService } from "../../../core/services/shared/common.service";
import { AuthService } from "../../../core/auth/auth.service";
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'app-page-form',
    templateUrl: './page-form.component.html',
    styleUrls: ['./page-form.component.scss']
})
export class PageFormComponent implements OnInit {

    pageFormModal: CharacterDashboardPage = new CharacterDashboardPage();
    pageForm: FormGroup;
    colorModel: Color = new Color();
    isLoading = false;
    characterId: number;
    layoutId: number;
    disabled: boolean = false;
    title: string
    button: string
    constructor(
        private router: Router, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, private pageService: CharacterDashboardPageService,
        private bsModalRef: BsModalRef, private modalService: BsModalService, private localStorage: LocalStoreManager,      
      private sharedService: SharedService, private commonService: CommonService,
      private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1)); }

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
                this.characterId = this.bsModalRef.content.characterId;
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
        if (this.pageFormModal.name=="") {
            this.alertService.showMessage("Please add Page Name.", "Name is required", MessageSeverity.error);
        }
        else {
            this.isLoading = true;
            let _msg = this.pageFormModal.characterDashboardPageId == 0 || this.pageFormModal.characterDashboardPageId === undefined ? "Creating Page..." : "Updating Page...";         
            this.alertService.startLoadingMessage("", _msg);

            this.pageFormModal.characterId = this.characterId;

            if (this.pageFormModal.characterDashboardPageId == 0 || this.pageFormModal.characterDashboardPageId === undefined) {
                this.pageFormModal.characterDashboardLayoutId = this.layoutId;
                this.addPage(this.pageFormModal);
            }
            else if (this.pageFormModal.characterDashboardPageId > 0 && this.pageFormModal.view == VIEW.EDIT) {
                this.updatePage(this.pageFormModal);
            }
            else if (this.pageFormModal.characterDashboardPageId > 0 && this.pageFormModal.view == VIEW.DUPLICATE) {
                //this.pageFormModal.characterDashboardPageId = undefined;
                this.duplicatePage(this.pageFormModal);
            }
        }
    }

    private addPage(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.pageService.createeditCharacterDashboardPage(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();

                    let message =  "Page has been added successfully." ;
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.disabled = false;                   
                    this.bsModalRef.hide();
                    this.sharedService.updateCharacterDashboardPage(modal); 
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

    private updatePage(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.pageService.createeditCharacterDashboardPage(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let message =  "Page has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.disabled = false;                   
                    this.bsModalRef.hide();
                    this.sharedService.updateCharacterDashboardPage(modal);
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

    private duplicatePage(modal) {
        this.isLoading = true;
        this.disabled = true;
        this.pageService.duplicateCharacterDashboardPage(modal)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let message = "Page has been duplicated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.disabled = false;
                    this.bsModalRef.hide();
                    this.sharedService.updateCharacterDashboardPage(modal);
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
