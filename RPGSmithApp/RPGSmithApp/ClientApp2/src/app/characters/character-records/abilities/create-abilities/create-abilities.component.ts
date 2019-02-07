import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { AlertService, MessageSeverity, DialogType } from '../../../../core/common/alert.service';
import { ConfigurationService } from '../../../../core/common/configuration.service';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AuthService } from "../../../../core/auth/auth.service";
import { SharedService } from '../../../../core/services/shared.service';
import { Utilities } from '../../../../core/common/utilities';
import { DBkeys } from '../../../../core/common/db-keys';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { CommonService } from "../../../../core/services/shared/common.service";
import { AbilityService } from "../../../../core/services/ability.service";

import { Ability } from '../../../../core/models/view-models/ability.model';
import { VIEW } from '../../../../core/models/enums';

@Component({
    selector: 'app-create-abilities',
    templateUrl: './create-abilities.component.html',
    styleUrls: ['./create-abilities.component.scss']
})
export class CreateAbilitiesComponent implements OnInit {

    title: string;
    showWebButtons: boolean = false;
    isLoading = false;
    _ruleSetId: number;
    abilityFormModal: any = new Ability();
    fileToUpload: File = null;
    commandList = [];
    itemsFormModal: any;
    newItemDescription: any;
    numberRegex: any;
    newConatainer: any;
    button: any;

    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService,
        private abilityService: AbilityService
    ) {
        this.route.params.subscribe(params => { this._ruleSetId = params['id']; });
    }

    ngOnInit() {
        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
            let _view = this.bsModalRef.content.button;
            let _abilityVM = this.bsModalRef.content.abilityVM;
            this.abilityFormModal = this.abilityService.abilityModelData(_abilityVM, _view);
        }, 0);
    }

    addCommand(commandVM: any): void {
        let _commandVM = commandVM == undefined ? [] : commandVM;
        _commandVM.push({ commandId: 0, command: '', name: '' });
        this.abilityFormModal.commandVM = _commandVM;
    }

    removeCommand(command: any): void {
        this.abilityFormModal.commandVM
            .splice(this.abilityFormModal.commandVM.indexOf(command), 1);
    }

    setEnableDisable(checked: boolean) {
        this.abilityFormModal.isEnabled = checked;
    }

    fileInput(_files: FileList) {
        this.fileToUpload = _files.item(0);
        this.showWebButtons = false;
    }

    submitForm(ability: Ability) {

        if (ability.ruleSetId == 0 || ability.ruleSetId === undefined)
            ability.ruleSetId = this._ruleSetId;

        if (this.fileToUpload != null) {
            this.fileUpload(ability);
        }
        else {
            this.submit(ability);
        }
    }

    private fileUpload(ability: Ability) {
        this.isLoading = true;
        let _msg = ability.abilityId == 0 || ability.abilityId === undefined ? "Creating Ability." : "Updating Ability.";
        this.alertService.startLoadingMessage("", _msg);

        //file upload
        this.abilityService.fileUpload(this.fileToUpload)
            .subscribe(
                data => {
                    console.log(data);
                    ability.imageUrl = data.ImageUrl;
                    this.submit(ability);
                },
                error => {
                    console.log(error);
                    this.submit(ability);
                });
    }

    private submit(ability: Ability) {
        if (this.abilityFormModal.view === VIEW.DUPLICATE) {
            this.duplicateAbility(ability);
        }
        else {
            this.addEditAbility(ability);
        }
    }

    private addEditAbility(modal: Ability) {
        this.isLoading = true;
        let _msg = modal.abilityId == 0 || modal.abilityId === undefined ? "Creating Ability." : "Updating Ability.";
        this.alertService.startLoadingMessage("", _msg);

        this.abilityService.createAbility(modal)
            .subscribe(
                data => {
                    console.log("data: ", data);
                    setTimeout(() => { this.isLoading = false; }, 200);
                    this.alertService.stopLoadingMessage();
                    let message = modal.abilityId == 0 || modal.abilityId === undefined ? "Ability has been created successfully." : "Ability has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.sharedService.updateAbilityList(true);
                },
                error => {
                    setTimeout(() => { this.isLoading = false; }, 200);
                    this.alertService.stopLoadingMessage();
                    let _message = modal.abilityId == 0 || modal.abilityId === undefined ? "Unable to Create " : "Unable to Update ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
        );
    }

    private duplicateAbility(modal: Ability) {

        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Duplicating Spell..");

        this.abilityService.duplicateAbility(modal)
            .subscribe(
                data => {
                    setTimeout(() => { this.isLoading = false; }, 200);
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Ability has been duplicated successfully.", "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.sharedService.updateAbilityList(true);
                },
                error => {
                    setTimeout(() => { this.isLoading = false; }, 200);
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Duplicate ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

                });
    }


    showButtons() {
        this.showWebButtons = true;
    }

    hideButtons() {
        this.showWebButtons = false;
    }

    readTempUrl(event:any) {
        if (event.target.files && event.target.files[0]) {
          var reader = new FileReader();

          reader.onload = (event:any) => {
              this.abilityFormModal.imageUrl = event.target.result;
          }

          reader.readAsDataURL(event.target.files[0]);
        }
    }

    openWeb(){
        this.bsModalRef.hide();
    }

    close() {
        this.bsModalRef.hide();
    }

}
