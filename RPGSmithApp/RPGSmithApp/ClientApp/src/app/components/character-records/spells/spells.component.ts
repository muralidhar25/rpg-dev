import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../../services/alert.service';
import { AuthService } from "./../../../services/auth.service";
import { ConfigurationService } from './../../../services/configuration.service';
import { Utilities } from './../../../services/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DBkeys } from '../../../services/db-Keys';
import { LocalStoreManager } from '../../../services/local-store-manager.service';
import { SharedService } from "../../../services/shared.service";
import { CommonService } from "../../../services/shared/common.service";
import { AddCharacterSpellComponent } from './add-spells/add-spells.component';
import { CreateSpellsComponent } from '../../records/spells/create-spells/create-spells.component';
import { CastComponent } from '../../../components/shared/cast/cast.component';
import { User } from '../../../models/user.model';
import { SpellsService } from "../../../services/spells.service";
import { CharacterSpellService } from "../../../services/character-spells.service";
import { PageLastViewsService } from "../../../services/pagelast-view.service";
import { Characters } from "../../../models/view-models/characters.model";
import { CharactersService } from "../../../services/characters.service";
import { DiceRollComponent } from "../../dice/dice-roll/dice-roll.component";
import { RulesetService } from "../../../services/ruleset.service";

@Component({
    selector: 'app-spells',
    templateUrl: './spells.component.html',
    styleUrls: ['./spells.component.scss']
})

export class CharacterSpellsComponent implements OnInit {

    isLoading = false;
    isListView: boolean = false;
    showActions: boolean = true;
    actionText: string;
    bsModalRef: BsModalRef;
    characterId: number;
    rulesetId: number;
    spellsList: any;
    isDropdownOpen: boolean = false;
    pageLastView: any;
    character: any = new Characters();
    ruleSet: any;
    noRecordFound: boolean = false;
    scrollLoading: boolean = false;
    page: number = 1;
    pageSize: number = 28;

    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService, private pageLastViewsService: PageLastViewsService,
        private spellsService: SpellsService, private characterSpellService: CharacterSpellService, private charactersService: CharactersService,
        private rulesetService: RulesetService
    ) {
        this.sharedService.shouldUpdateCharacterSpellList().subscribe(sharedServiceJson => {
            this.route.params.subscribe(params => { this.characterId = params['id']; });
            if (sharedServiceJson) {
                this.page = 1;
                this.pageSize = 28;
                this.initialize();
            }
        });
    }

    @HostListener('document:click', ['$event.target'])
    documentClick(target: any) {
        try {
            if (target.className.endsWith("is-show"))
                this.isDropdownOpen = !this.isDropdownOpen;
            else this.isDropdownOpen = false;
        } catch (err) { this.isDropdownOpen = false; }
    }

    ngOnInit() {
        this.route.params.subscribe(params => { this.characterId = params['id']; });
        if (this.rulesetId == undefined)
            this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

        this.destroyModalOnInit();
        this.initialize();
        this.showActionButtons(this.showActions);
    }
    
    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            this.characterSpellService.getCharacterSpellsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize)
                .subscribe(data => {
                    this.spellsList = Utilities.responseData(data.CharacterSpellList, this.pageSize);
                    this.ruleSet = data.RuleSet;
                    this.character = data.Character;
                    this.setHeaderValues(this.character);
                    try {
                        this.spellsList.forEach(function (val) {
                            val.showIcon = false;
                            val.showCast = val.spell.command == null || val.spell.command == undefined || val.spell.command == '' ? false : true;
                        });
                    } catch (err) { }
                    try {
                        this.noRecordFound = !data.CharacterSpellList.length;
                    } catch (err) { }
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                }, () => { });

            this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'CharacterSpells')
                .subscribe(data => {
                    if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
                }, error => {
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                });
        }
    }

    onScroll() {

        ++this.page;
        this.scrollLoading = true;

        this.characterSpellService.getCharacterSpellsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize)
            .subscribe(data => {

                var _characterSpellList = data.CharacterSpellList;
                for (var i = 0; i < _characterSpellList.length; i++) {
                    _characterSpellList[i].showIcon = false;
                    try {
                        _characterSpellList[i].showUse = _characterSpellList[i].spell.command == null || _characterSpellList[i].spell.command == undefined || _characterSpellList[i].spell.command == '' ? false : true;
                    } catch (err) { }
                    this.spellsList.push(_characterSpellList[i]);
                }
                this.scrollLoading = false;

            }, error => {
                this.scrollLoading = false;
                this.isLoading = false;
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                    this.authService.logout(true);
                }
            }, () => { });

    }

    showActionButtons(showActions) {
        this.showActions = !showActions;
        if (showActions) {
            this.actionText = 'ACTIONS';//'Show Actions';
        } else {
            this.actionText = 'HIDE';//'Hide Actions';
        }
    }

    showListView(view: boolean) {
        this.isListView = view;
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

        this.pageLastView = {
            pageName: 'CharacterSpells',
            viewType: this.isListView ? 'List' : 'Grid',
            UserId: user.id
        }

        this.pageLastViewsService.createPageLastViews<any>(this.pageLastView)
            .subscribe(data => {
                if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
            }, error => {
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                    this.authService.logout(true);
                }
            });
    }

    manageIcon(id: number) {
        this.spellsList.forEach(function (val) {
            if (id === val.characterSpellId) {
                val.showIcon = true;
            } else {
                val.showIcon = false;
            }
        });
    }

     addSpell() {
         this.bsModalRef = this.modalService.show(AddCharacterSpellComponent, {
             class: 'modal-primary modal-md',
             ignoreBackdropClick: true,
             keyboard: false
         });
         this.bsModalRef.content.title = 'Add Spell';
         this.bsModalRef.content.button = 'ADD';
         this.bsModalRef.content.spellVM = { characterId: this.characterId };
         this.bsModalRef.content.characterSpells = this.spellsList;
     }

    createSpell() {
        // this.alertService.startLoadingMessage("", "Checking records");   
        this.spellsService.getspellsCount(this.rulesetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Create New Spell';
                    this.bsModalRef.content.button = 'CREATE';
                    this.bsModalRef.content.ruleSetId = this.rulesetId;
                    this.bsModalRef.content.isFromCharacter = true;
                    this.bsModalRef.content.isFromCharacterId = +this.characterId;
                    this.bsModalRef.content.spellVM = { ruleSetId: this.rulesetId };
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });  
        
    }

    editSpell(spell: any) {
        this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        
        this.bsModalRef.content.title = 'Edit Character Spell';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.isFromCharacter = true;
        this.bsModalRef.content.isFromCharacterId = +this.characterId;
        this.bsModalRef.content.isFromCharacterSpellId = spell.characterSpellId;
        this.bsModalRef.content.isFromCharacterSpellMemorized = spell.memorized;
        
        this.bsModalRef.content.spellVM = spell.spell;
        this.bsModalRef.content.rulesetID = this.rulesetId;
    }

    duplicateSpell(spell: any) {
        // this.alertService.startLoadingMessage("", "Checking records");   
        this.spellsService.getspellsCount(this.rulesetId)
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

                    this.bsModalRef.content.spellVM = spell.spell;
                    this.bsModalRef.content.rulesetID = this.rulesetId;
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });  
        
     }

    deleteSpell(spell: any) {
        let name = spell ? (spell.spell ? spell.spell.name : 'spell') : 'spell';
         this.alertService.showDialog('Are you sure you want to remove ' + name + ' from this Character?',
             DialogType.confirm, () => this.deleteSpellHelper(spell), null, 'Yes', 'No');
     }

    private deleteSpellHelper(spell: any) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting a Spell");

        this.characterSpellService.deleteCharacterSpell_up(spell.characterSpellId, this.rulesetId)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Character Spell has been deleted successfully.", "", MessageSeverity.success);
                    this.spellsList = this.spellsList.filter((val) => val.characterSpellId != spell.characterSpellId);
                    try {
                        this.noRecordFound = !this.spellsList.length;
                    } catch (err) { }
                   // this.initialize();
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
                    spell.isMemorized = spell.isMemorized ? false : true;
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

        if (spell.spellId) {
            this.spellsService.getSpellCommands_sp<any>(spell.spellId)
                .subscribe(data => {
                    if (data.length > 0) {
                        this.bsModalRef = this.modalService.show(CastComponent, {
                            class: 'modal-primary modal-md',
                            ignoreBackdropClick: true,
                            keyboard: false
                        });
                        this.bsModalRef.content.title = "Spell Cast";
                        this.bsModalRef.content.ListCommands = data;
                        this.bsModalRef.content.Command = spell.spell;
                        this.bsModalRef.content.Character = this.character;
                        this.bsModalRef.content.ButtonText = 'Cast';
                    } else {
                        this.useCommand(spell.spell)
                    }
                }, error => { }, () => { });
        }

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
    private castSpellHelper(spell: any) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "TODO => Cast Spell");
        setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
        }, 200);
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }

    openDiceRollModal() {
        this.bsModalRef = this.modalService.show(DiceRollComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.character = this.character;
        this.bsModalRef.content.recordName = this.character.characterName;
        this.bsModalRef.content.recordImage = this.character.imageUrl;
    }

    private setHeaderValues(character: Characters): any {
        let headerValues = {
            headerName: character.characterName,
            headerImage: character.imageUrl,
            headerId: character.characterId,
            headerLink: 'character',
            hasHeader: true
        };
        this.sharedService.updateAccountSetting(headerValues);
        this.localStorage.deleteData(DBkeys.HEADER_VALUE);
        this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
    }
}
