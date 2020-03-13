import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CharacterSpells } from '../../../../core/models/view-models/character-spells.model';
import { SharedService } from '../../../../core/services/shared.service';
import { SpellsService } from '../../../../core/services/spells.service';
import { CommonService } from '../../../../core/services/shared/common.service';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { CharacterSpellService } from '../../../../core/services/character-spells.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../../core/common/alert.service';
import { DBkeys } from '../../../../core/common/db-keys';
import { User } from '../../../../core/models/user.model';
import { Utilities } from '../../../../core/common/utilities';
import { VIEW } from '../../../../core/models/enums';

@Component({
    selector: 'app-add-spell',
    templateUrl: './add-spells.component.html',
    styleUrls: ['./add-spells.component.scss']
})
export class AddCharacterSpellComponent implements OnInit {

    isLoading = false;
    title: string;
    _view: string;
    characterId: number;
    rulesetId: number;
    showWebButtons: boolean = false;
    fileToUpload: File = null;
    numberRegex = "^(?:[0-9]+(?:\.[0-9]{0,8})?)?$";
    spellsList: any;
    characterSpells: any;
    characterSpellModal: any = new CharacterSpells();;
    searchText:string
    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService,
        private spellsService: SpellsService, private characterSpellService: CharacterSpellService
    ) {
        this.route.params.subscribe(params => { this.characterId = params['id']; });
    }

    ngOnInit() {
        setTimeout(() => {
            this.isLoading = true
            this.title = this.bsModalRef.content.title;
            this._view = this.bsModalRef.content.button;
            let _spellVM = this.bsModalRef.content.spellVM;
            this.characterSpellModal = this.characterSpellService.characterSpellModelData(_spellVM, this._view);
            this.characterId = this.characterSpellModal.characterId;
            this.rulesetId = this.characterSpellModal.rulesetId;
            this.characterSpells = this.bsModalRef.content.characterSpells;
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

            this.initialize();
        }, 0);
    }


    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.spellsService.getspellsByRuleset_add_Cache<any[]>(this.rulesetId)
                .subscribe(data => {
                    
                    this.spellsList= data;
                    this.spellsList.forEach(function (val) { val.showIcon = false; val.selected = false; });
                    this.isLoading = false
                }, error => {
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.isLoading = false
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                }, () => { });
        }
    }
    
    setSpell(event: any, spell: any) {

        //if (event.target.checked) {
        //    this.characterSpellModal.multiSpells.push({ spellId: spell.spellId });
        //}
        //else {
        //    this.characterSpellModal.multiSpells
        //        .splice(this.characterSpellModal.multiSpells.indexOf({ spellId: spell.spellId }), 1);
        //}
        this.spellsList.map((spellItem) => {
            if (spellItem.spellId == spell.spellId) {
                spellItem.selected = event.target.checked;
            }
            return spellItem;
        })
        //this.characterSpellModal.spellId = spell.spellId;
    }

    setMemorized(checked: boolean) {
        this.characterSpellModal.isMemorized = checked;
    }

    submitForm(spell: any) {
        this.isLoading = true
        this.spellsList.map((spellItem) => {
            if (spellItem.selected) {
                this.characterSpellModal.multiSpells.push({ spellId: spellItem.spellId });
            }
            return spellItem;
        })
        if (this.characterSpellModal.multiSpells == undefined) {
            this.alertService.showMessage("Please select new Spell to Add.", "", MessageSeverity.error);
            this.isLoading = false; 
        }
        else if (this.characterSpellModal.multiSpells.length == 0) {
            this.alertService.showMessage("Please select new Spell to Add.", "", MessageSeverity.error);
            this.isLoading = false; 
        }
        else {
            if (this.characterSpellModal.view === VIEW.DUPLICATE) {
                this.duplicateSpell(spell);
            }
            else {
                this.addEditSpell(spell);
            }
        }
    }

    addEditSpell(modal: any) {

        this.characterSpellService.createCharacterSpell(modal)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let message = "Spell added successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.sharedService.UpdateCharacterSpellList(true);
                },
                error => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let _message = modal.characterAbilityId == 0 || modal.characterAbilityId === undefined ? "Unable to Create " : "Unable to Update ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
        );
    }

    duplicateSpell(modal: any) {

        this.characterSpellService.duplicateCharacterSpell(modal)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Spell has been duplicated successfully.", "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.sharedService.UpdateCharacterSpellList(true);
                },
                error => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Duplicate ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

                });
    }




    close() {
        this.bsModalRef.hide();
    }

}
