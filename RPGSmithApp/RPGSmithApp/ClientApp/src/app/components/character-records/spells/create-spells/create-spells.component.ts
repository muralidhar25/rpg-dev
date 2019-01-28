import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { AlertService, MessageSeverity, DialogType } from '../../../../services/alert.service';
import { ConfigurationService } from '../../../../services/configuration.service';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AuthService } from "../../../../services/auth.service";
import { SharedService } from '../../../../services/shared.service';
import { Utilities } from '../../../../services/utilities';
import { DBkeys } from '../../../../services/db-Keys';
import { LocalStoreManager } from '../../../../services/local-store-manager.service';
import { CommonService } from "../../../../services/shared/common.service";
import { SpellsService } from "../../../../services/spells.service";

import { ItemMaster } from '../../../../models/view-models/item-master.model';
import { itemMasterSpell } from '../../../../models/view-models/item-master-spell.model';
import { Spell } from '../../../../models/view-models/spell.model';
import { VIEW } from '../../../../models/enums';

@Component({
    selector: 'app-create-spell',
    templateUrl: './create-spells.component.html',
    styleUrls: ['./create-spells.component.scss']
})
export class CreateSpellsComponent implements OnInit {

    title: string;
    showWebButtons: boolean = false;
    isLoading = false;
    _ruleSetId: number;
    spellFormModal: any = new Spell();
    fileToUpload: File = null;
    commandList = [];

    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService,
        private spellsService: SpellsService
    ) {
        this.route.params.subscribe(params => { this._ruleSetId = params['id']; });
    }

    ngOnInit() {
        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
            let _view = this.bsModalRef.content.button;
            let _spellVM = this.bsModalRef.content.spellVM;
            this.spellFormModal = this.spellsService.spellModelData(_spellVM, _view);
        }, 0);
    }

   
    addCommand(commandVM: any): void {
        let _commandVM = commandVM == undefined ? [] : commandVM;
        _commandVM.push({ commandId: 0, command: '', name: '' });
        this.spellFormModal.commandVM = _commandVM;
    }

    removeCommand(command: any): void {
        this.spellFormModal.commandVM
            .splice(this.spellFormModal.commandVM.indexOf(command), 1);
    }

    setComponent(field: string, checked: boolean) {
        switch (field) {
            case "Somatic": {
                this.spellFormModal.isSomaticComponent = checked;
                break;
            }
            case "Verbal": {
                this.spellFormModal.isVerbalComponent = checked;
                break;
            }
            case "memorized": {
                this.spellFormModal.memorized = checked;
                break;
            }
            case "shouldCast": {
                this.spellFormModal.shouldCast = checked;
                break;
            }
            default: break;
        }
    }

    fileInput(_files: FileList) {
        this.fileToUpload = _files.item(0);
        this.showWebButtons = false;
    }

    submitForm(spell: Spell) {
        
        if (spell.ruleSetId == 0 || spell.ruleSetId === undefined)
            spell.ruleSetId = this._ruleSetId;

        if (this.fileToUpload != null) {
            this.fileUpload(spell);
        }
        else {
            this.submit(spell);
        }
    }

    private fileUpload(spell: Spell) {
        this.isLoading = true;
        let _msg = spell.spellId == 0 || spell.spellId === undefined ? "Creating Spell." : "Updating Spell.";
        this.alertService.startLoadingMessage("", _msg);

        //file upload
        this.spellsService.fileUpload(this.fileToUpload)
            .subscribe(
                data => {
                    console.log(data);
                    spell.imageUrl = data.ImageUrl;
                    this.submit(spell);
                },
                error => {
                    console.log(error);
                    this.submit(spell);
                });
    }

    private submit(spell: Spell) {
        if (this.spellFormModal.view === VIEW.DUPLICATE) {
            this.duplicateSpell(spell);
        }
        else {
            this.addEditSpell(spell);
        }
    }

    private addEditSpell(modal: Spell) {
        this.isLoading = true;
        let _msg = modal.spellId == 0 || modal.spellId === undefined ? "Creating Spell." : "Updating Spell.";
        this.alertService.startLoadingMessage("", _msg);

        this.spellsService.createSpell(modal)
            .subscribe(
                data => {
                    console.log("data: ", data);
                    setTimeout(() => { this.isLoading = false; }, 200);
                    this.alertService.stopLoadingMessage();
                    let message = modal.spellId == 0 || modal.spellId === undefined ? "Spell has been created successfully." : "Spell has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.sharedService.updateSpellList(true);
                },
                error => {
                    setTimeout(() => { this.isLoading = false; }, 200);
                    this.alertService.stopLoadingMessage();
                    let _message = modal.spellId == 0 || modal.spellId === undefined ? "Unable to Create " : "Unable to Update ";
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

    private duplicateSpell(modal: Spell) {

        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Duplicating Spell..");

        this.spellsService.duplicateSpell(modal)
            .subscribe(
                data => {
                    setTimeout(() => { this.isLoading = false; }, 200);
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Spell has been duplicated successfully.", "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.sharedService.updateSpellList(true);
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
            this.spellFormModal.imageUrl = event.target.result;
          }
      
          reader.readAsDataURL(event.target.files[0]);
        }
    }
            
    openWeb(){
        //this.bsModalRef = this.modalService.show(SearchImageComponent, {
        //    class: 'modal-primary modal-lg',
        //    ignoreBackdropClick: true,
        //    keyboard: true
        //});
        //this.bsModalRef.content.title = 'Search Image';;
    }

    close() {
        this.bsModalRef.hide();
    }

}
