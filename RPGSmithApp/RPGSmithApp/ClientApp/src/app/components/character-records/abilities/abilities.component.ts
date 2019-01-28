import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../../services/alert.service';
import { AuthService } from "./../../../services/auth.service";
//import { ConfigurationService } from './../../../services/configuration.service';
import { Utilities } from './../../../services/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DBkeys } from '../../../services/db-Keys';
import { LocalStoreManager } from '../../../services/local-store-manager.service';
import { SharedService } from "../../../services/shared.service";
import { CommonService } from "../../../services/shared/common.service";
import { RulesetService } from "../../../services/ruleset.service";
import { AddCharaterAbilityComponent } from './add-abilities/add-abilities.component';
import { CreateAbilitiesComponent } from '../../records/abilities/create-abilities/create-abilities.component';

import { User } from '../../../models/user.model';
import { Ability } from '../../../models/view-models/ability.model';
import { CharacterAbilities } from '../../../models/view-models/character-abilities.model';
import { AbilityService } from "../../../services/ability.service";
import { CharacterAbilityService } from "../../../services/character-abilities.service";
import { PageLastViewsService } from "../../../services/pagelast-view.service";
import { PageLastViews } from '../../../models/view-models/pagelast-view.model';
import { DiceRollComponent } from "../../dice/dice-roll/dice-roll.component";
import { Characters } from "../../../models/view-models/characters.model";
import { CharactersService } from "../../../services/characters.service";
import { CastComponent } from "../../shared/cast/cast.component";
//import { recordAbilityMock } from '../../../common/mock-data';

@Component({
    selector: 'app-abilities',
    templateUrl: './abilities.component.html',
    styleUrls: ['./abilities.component.scss']
})

export class CharacterAbilitiesComponent implements OnInit {

    isLoading = false;
    isListView: boolean = false;
    showActions: boolean = true;
    actionText: string;
    bsModalRef: BsModalRef;
    characterId: number;
    rulesetId: number;
    abilitiesList: any;
    isDropdownOpen: boolean = false;
    pageLastView: any;
    ruleSet: any;
    character: any = new Characters();
    noRecordFound: boolean = false;
    scrollLoading: boolean = false;
    page: number = 1;
    pageSize: number = 28;

    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private rulesetService: RulesetService, private charactersService: CharactersService,
        private sharedService: SharedService, private commonService: CommonService, private pageLastViewsService: PageLastViewsService,
        private abilityService: AbilityService, private characterAbilityService: CharacterAbilityService
    ) {
        this.sharedService.shouldUpdateCharacterAbilityList().subscribe(sharedServiceJson => {
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
        
        //this.rulesetService.getRulesetById<any>(this.rulesetId)
        //    .subscribe(data => {
        //        this.ruleSet = data;
        //    }, error => {
        //        let Errors = Utilities.ErrorDetail("", error);
        //        if (Errors.sessionExpire) {
        //            this.authService.logout(true);
        //        }
        //    });

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
            this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize)
                .subscribe(data => {
                    this.abilitiesList = Utilities.responseData(data.characterAbilityList, this.pageSize);
                    this.ruleSet = data.RuleSet;
                    this.character = data.Character;
                    this.setHeaderValues(this.character);
                    try {
                        this.abilitiesList.forEach(function (val) {
                            val.showIcon = false;
                            val.showUse = val.ability.command == null || val.ability.command == undefined || val.ability.command == '' ? false : true;
                        });
                    } catch (err) { }
                    try {
                        this.noRecordFound = !data.characterAbilityList.length;
                    } catch (err) { }
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                }, () => { });
            
            this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'CharacterAbilities')
                .subscribe(data => {
                    if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
                }, error => {
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                });

            //this.charactersService.getCharactersById<any>(this.characterId)
            //    .subscribe(data => {
            //        this.character = data;
            //        this.isLoading = false;
            //        this.setHeaderValues(this.character);
            //    }, error => {
            //        this.character = new Characters();
            //        this.isLoading = false;
            //    }, () => { });
        }
    }

    onScroll() {

        ++this.page;
        this.scrollLoading = true;

        this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize)
                .subscribe(data => {

                    var _characterAbilityList = data.characterAbilityList;
                    for (var i = 0; i < _characterAbilityList.length; i++) {
                        _characterAbilityList[i].showIcon = false;
                        try {
                            _characterAbilityList[i].showUse = _characterAbilityList[i].ability.command == null || _characterAbilityList[i].ability.command == undefined || _characterAbilityList[i].ability.command == '' ? false : true;
                        } catch (err) { }
                        this.abilitiesList.push(_characterAbilityList[i]);
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
            pageName: 'CharacterAbilities',
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
        
        this.abilitiesList.forEach(function (val) {
            if (id === val.characterAbilityId) {
                val.showIcon = true;
            } else {
                val.showIcon = false;
            }
        });
    }
        
    addAbility() {
        this.bsModalRef = this.modalService.show(AddCharaterAbilityComponent, {
             class: 'modal-primary modal-md',
             ignoreBackdropClick: true,
             keyboard: false
         });
         this.bsModalRef.content.title = 'Add Ability';
         this.bsModalRef.content.button = 'ADD';
        this.bsModalRef.content.abilityVM = { characterId: this.characterId };
        this.bsModalRef.content.characterAbilities = this.abilitiesList;
    }

    createAbility() {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.abilityService.getAbilitiesCount(this.rulesetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Create New Ability';
                    this.bsModalRef.content.button = 'CREATE';
                    this.bsModalRef.content.ruleSetId = this.rulesetId;
                    this.bsModalRef.content.isFromCharacter = true;
                    this.bsModalRef.content.isFromCharacterId = +this.characterId;

                    this.bsModalRef.content.abilityVM = { ruleSetId: this.rulesetId, ruleSet: this.ruleSet };
                    this.bsModalRef.content.rulesetID = this.rulesetId
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });        
        
    }

    editAbility(ability: any) {
        this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Character Ability';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.isFromCharacter = true;
        this.bsModalRef.content.isFromCharacterId = +this.characterId;
        this.bsModalRef.content.isFromCharacterAbilityId = ability.characterAbilityId;
        this.bsModalRef.content.isFromCharacterAbilityEnable = ability.isEnabled;
        this.bsModalRef.content.isFromCharacterAbilityCurrent = ability.currentNumberOfUses == null ? 0 : ability.currentNumberOfUses;
        this.bsModalRef.content.isFromCharacterAbilityMax = ability.maxNumberOfUses == null ? 0 : ability.maxNumberOfUses;
        this.bsModalRef.content.abilityVM = ability.ability;
        this.bsModalRef.content.rulesetID = this.rulesetId
    }

    duplicateAbility(ability: any) {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.abilityService.getAbilitiesCount(this.rulesetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Duplicate Ability';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.isFromCharacter = true;
                    this.bsModalRef.content.isFromCharacterId = +this.characterId;
                    this.bsModalRef.content.isFromCharacterAbilityId = ability.characterAbilityId;
                    this.bsModalRef.content.isFromCharacterAbilityCurrent = ability.currentNumberOfUses == null ? 0 : ability.currentNumberOfUses;
                    this.bsModalRef.content.isFromCharacterAbilityMax = ability.maxNumberOfUses == null ? 0 : ability.maxNumberOfUses;
                    this.bsModalRef.content.abilityVM = ability.ability;
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });  
        
     }

    deleteAbility(ability: any) {
        let name = ability ? (ability.ability ? ability.ability.name : 'spell') : 'spell';
        this.alertService.showDialog('Are you sure you want to remove ' + name + ' from this Character?',
             DialogType.confirm, () => this.deleteAbilityHelper(ability), null, 'Yes', 'No');
     }

     private deleteAbilityHelper(ability: any) {
         this.isLoading = true;
         this.alertService.startLoadingMessage("", "Deleting a Ability");

         this.characterAbilityService.deleteCharacterAbility_up(ability.characterAbilityId, this.rulesetId)
             .subscribe(
                 data => {
                     this.isLoading = false; 
                     this.alertService.stopLoadingMessage();
                     this.alertService.showMessage("Character Ability has been removed successfully.", "", MessageSeverity.success);
                     this.abilitiesList = this.abilitiesList.filter((val) => val.characterAbilityId != ability.characterAbilityId);
                     try {
                         this.noRecordFound = !this.abilitiesList.length;
                     } catch (err) { }
                     //this.initialize();
                 },
                 error => {
                     this.isLoading = false; 
                     this.alertService.stopLoadingMessage();
                     let Errors = Utilities.ErrorDetail("Unable to Remove", error);
                     if (Errors.sessionExpire) {
                         //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                         this.authService.logout(true);
                     }
                     else
                         this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                 });
     }

    enableAbility(ability: any) {        
        //this.isLoading = true;
        let enableTxt = ability.isEnabled ? 'Disable' : 'Enable';
        this.characterAbilityService.toggleEnableCharacterAbility(ability.characterAbilityId)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    ability.isEnabled = ability.isEnabled ? false : true;
                    //this.initialize();
                },
                error => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to " + enableTxt, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    useAbility(ability: any) {
        
        if (ability.abilityId) {
            this.abilityService.getAbilityCommands_sp<any>(ability.abilityId)
                .subscribe(data => {
                    if (data.length > 0) {
                        this.bsModalRef = this.modalService.show(CastComponent, {
                            class: 'modal-primary modal-md',
                            ignoreBackdropClick: true,
                            keyboard: false
                        });

                        this.bsModalRef.content.title = "Ability Commands";
                        this.bsModalRef.content.ListCommands = data;
                        this.bsModalRef.content.AbilityId = ability.abilityId;
                        this.bsModalRef.content.Command = ability.ability;
                        this.bsModalRef.content.Character = this.character;
                    } else {
                        this.useCommand(ability.ability)
                    }
                }, error => { }, () => { });
        }  

        //if (ability.ability.abilityCommand.length) {
        //    this.bsModalRef = this.modalService.show(CastComponent, {
        //        class: 'modal-primary modal-md',
        //        ignoreBackdropClick: true,
        //        keyboard: false
        //    });

        //    this.bsModalRef.content.title = "Ability Commands";
        //    //this.bsModalRef.content.ListCommands = ability.ability.abilityCommand; 
        //    this.bsModalRef.content.AbilityId = ability.abilityId; 
        //    this.bsModalRef.content.Command = ability.ability;
        //    this.bsModalRef.content.Character = this.character;
        //} else {
        //    this.useCommand(ability.ability)
        //}
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
        if (Command.hasOwnProperty("abilityId")) {
            this.bsModalRef.content.recordName = Command.name;
            this.bsModalRef.content.recordImage = Command.imageUrl;
        }
        this.bsModalRef.content.event.subscribe(result => {
        });
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
