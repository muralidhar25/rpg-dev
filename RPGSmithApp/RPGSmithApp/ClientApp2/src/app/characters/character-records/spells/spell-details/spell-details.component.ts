import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../../../core/common/alert.service';
import { AuthService } from "./../../../../core/auth/auth.service";
import { ConfigurationService } from './../../../../core/common/configuration.service';
import { Utilities } from './../../../../core/common/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DBkeys } from '../../../../core/common/db-keys';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { SharedService } from "../../../../core/services/shared.service";
import { CommonService } from "../../../../core/services/shared/common.service";

import { CreateSpellsComponent } from '../../../../records/spells/create-spells/create-spells.component';
import { User } from '../../../../core/models/user.model';
import { Spell } from '../../../../core/models/view-models/spell.model';
import { SpellsService } from "../../../../core/services/spells.service";
import { CharacterSpellService } from "../../../../core/services/character-spells.service";
import { CastComponent } from '../../../../shared/cast/cast.component';
import { Characters } from "../../../../core/models/view-models/characters.model";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { RulesetService } from "../../../../core/services/ruleset.service";

@Component({
    selector: 'app-spell-details',
    templateUrl: './spell-details.component.html',
    styleUrls: ['./spell-details.component.scss']
})

export class CharacterSpellDetailsComponent implements OnInit {

    bsModalRef: BsModalRef;
    isLoading = false;
    showActions: boolean = true;
    actionText: string;
    spellId: number;
    ruleSetId: number;
    characterId: number;
    character: Characters = new Characters();
    spellDetail: any = new Spell();

    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService, private characterSpellService: CharacterSpellService,
        private spellsService: SpellsService, private rulesetService: RulesetService
    ) {
        this.route.params.subscribe(params => { this.spellId = params['id']; });
        this.sharedService.shouldUpdateSpellList().subscribe(sharedServiceJson => {
            if (sharedServiceJson.onPage) this.spellDetail.memorized = sharedServiceJson.memorized;
            else this.initialize();
        });
    }

    ngOnInit() {
        this.initialize();
        this.showActionButtons(this.showActions);
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            this.characterSpellService.getCharacterSpellById<any>(this.spellId)
                .subscribe(data => {
                    this.spellDetail = this.characterSpellService.spellModelDetailData(data, "UPDATE");
                   // this.ruleSetId = this.spellDetail.ruleSetId;
                    this.characterId = this.spellDetail.characterId;
                    this.character = data.character;
                    this.rulesetService.GetCopiedRulesetID(this.spellDetail.ruleSetId, user.id).subscribe(data => {
                        let id: any = data
                        this.ruleSetId = id;
                        this.isLoading = false;
                    }, error => {
                        this.isLoading = false;
                        let Errors = Utilities.ErrorDetail("", error);
                        if (Errors.sessionExpire) {
                            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                            this.authService.logout(true);
                        }
                    }, () => { });
                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                }, () => { });
        }
    }

    showActionButtons(showActions) {
        this.showActions = !showActions;
        if (showActions) {
            this.actionText = 'ACTIONS';//'Show Actions';
        } else {
            this.actionText = 'HIDE';//'Hide Actions';
        }
    }

    editSpell(spell: Spell) {
        this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Spell';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.fromDetail = true;
        this.bsModalRef.content.spellVM = spell;
        this.bsModalRef.content.rulesetID = this.ruleSetId;
        this.bsModalRef.content.isFromCharacter = true;
        this.bsModalRef.content.isFromCharacterId = +this.characterId;
    }

    duplicateSpell(spell: Spell) {
        // this.alertService.startLoadingMessage("", "Checking records");
        this.spellsService.getspellsCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Duplicate Spell';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.isFromCharacter = true;
                    this.bsModalRef.content.isFromCharacterId = +this.characterId;
                    this.bsModalRef.content.spellVM = spell;
                    this.bsModalRef.content.rulesetID = this.ruleSetId;
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });


    }

    deleteSpell(spell: Spell) {
        let message = 'Are you sure you want to remove ' + spell.name + ' from this Character?';

        this.alertService.showDialog(message,
            DialogType.confirm, () => this.deleteSpellHelper(spell), null, 'Yes', 'No');
    }

    private deleteSpellHelper(spell: Spell) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting a Spell");

        this.characterSpellService.deleteCharacterSpell_up(this.spellId, this.ruleSetId)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Spell has been deleted successfully.", "", MessageSeverity.success);
                    //this.initialize();
                    this.router.navigate(['/character/spell', this.characterId]);
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

    memorizeSpell(spell: any) {
        //this.isLoading = true;
        let memorizeTxt = spell.isMemorized ? 'Unmemorize' : 'Memorize';
        this.characterSpellService.toggleMemorizedCharacterSpell(spell.characterSpellId)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    //spell.isMemorized = spell.isMemorized ? false : true;
                    this.spellDetail.memorized = spell.memorized ? false : true;
                    this.sharedService.updateSpellList({ memorized: this.spellDetail.memorized, onPage: true });
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to " + memorizeTxt, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    castSpell(spell: any) {
        if (this.spellDetail.spellCommandVM.length) {
            this.bsModalRef = this.modalService.show(CastComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.title = "Spell Cast"
            this.bsModalRef.content.ListCommands = this.spellDetail.spellCommandVM
            this.bsModalRef.content.Command = this.spellDetail
            this.bsModalRef.content.Character = this.character
            this.bsModalRef.content.ButtonText = 'Cast'
        }
        else {
            this.useCommand(this.spellDetail)
        }
    }

    private castSpellHelper(spell: any) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Executing the default command associated with this " + spell.name + " Spell.");
        setTimeout(() => {
        this.isLoading = false;
            this.alertService.stopLoadingMessage();
        }, 200);
    }

    useCommand(Command: any) {
        let msg = "The command value for " + Command.name
            + " has not been provided. Edit this record to input one.";
        if (Command.command == undefined || Command.command == null || Command.command == '') {
            this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
        }
        else {
            //TODO
            this.useCommandHelper(Command);
        }
    }
    private useCommandHelper(Command: any) {
        this.bsModalRef = this.modalService.show(DiceRollComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.tile = -2;
        this.bsModalRef.content.characterId = this.character.characterId;
        this.bsModalRef.content.character = this.character;
        this.bsModalRef.content.command = Command.command;
        if (Command.hasOwnProperty("spellId")) {
            this.bsModalRef.content.recordName = Command.name;
            this.bsModalRef.content.recordImage = Command.imageUrl;
        }
        this.bsModalRef.content.event.subscribe(result => {
        });
    }

    RedirectBack() {
        window.history.back();
    }

    Redirect(path) {
        this.router.navigate([path, this.characterId]);
    }

    gotoDashboard() {
        this.router.navigate(['/character/dashboard', this.characterId]);
    }
    ViewImage(img) {
        if (img) {
            this.bsModalRef = this.modalService.show(ImageViewerComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.ViewImageUrl = img.src;
            this.bsModalRef.content.ViewImageAlt = img.alt;
        }
    }
}
