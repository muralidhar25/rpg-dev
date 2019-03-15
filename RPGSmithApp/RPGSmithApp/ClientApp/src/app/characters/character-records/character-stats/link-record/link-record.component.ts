import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CharactersCharacterStat } from '../../../../core/models/view-models/characters-character-stats.model';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { SharedService } from '../../../../core/services/shared.service';
import { CharacterSpellService } from '../../../../core/services/character-spells.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AlertService } from '../../../../core/common/alert.service';
import { CharacterAbilityService } from '../../../../core/services/character-abilities.service';
import { ItemsService } from '../../../../core/services/items.service';
import { STAT_LINK_TYPE } from '../../../../core/models/enums';
import { User } from '../../../../core/models/user.model';
import { DBkeys } from '../../../../core/common/db-keys';
import { Ruleset } from '../../../../core/models/view-models/ruleset.model';


@Component({
  selector: 'app-link-record',
  templateUrl: './link-record.component.html',
  styleUrls: ['./link-record.component.scss']
})
export class LinkRecordComponent implements OnInit {
    items: any;
    spells: any;
    abilities: any;


    ruleSet: any = new Ruleset();
    limitTextSpell: string = "Show more";
    limitTextItem: string = "Show more";
    limitTextAbility: string = "Show more";
    lengthOfRecordsToDisplay: number = 10;
    limitSpell: number = this.lengthOfRecordsToDisplay;
    limitItem: number = this.lengthOfRecordsToDisplay;
    limitAbility: number = this.lengthOfRecordsToDisplay;
    title: string;
    isLoading: boolean = false;
    spellsList: boolean = true;;
    itemsList: boolean;
    abilitiesList: boolean;
    itemId: number = 0;
    spellId: number = 0;
    abilityId: number = 0;
    selectedItem: any = null;
    selectedSpell: any = null;
    selectedAbility: any = null;  
    characterId: number;
    _linkType: any;

    query: string = '';
    charactersCharacterStat: CharactersCharacterStat;
    public event: EventEmitter<any> = new EventEmitter();

    constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
        private localStorage: LocalStoreManager, private authService: AuthService, private itemsService: ItemsService, 
        private characterSpellService: CharacterSpellService, private characterAbilityService: CharacterAbilityService,
        private alertService: AlertService) {
    }

    ngOnInit() {
        setTimeout(() => {
            this.characterId = this.bsModalRef.content.characterId;            
            this.ruleSet = this.bsModalRef.content.ruleSet;
            this.title = this.bsModalRef.content.title;
            this.charactersCharacterStat = this.bsModalRef.content.characterstat;
            this.itemId = 0;
            this.spellId = 0;
            this.abilityId = 0;
            if (this.charactersCharacterStat.linkType == STAT_LINK_TYPE.ITEM) {
                this.itemId = this.charactersCharacterStat.defaultValue;
            }
            else if (this.charactersCharacterStat.linkType == STAT_LINK_TYPE.SPELL) {
                this.spellId = this.charactersCharacterStat.defaultValue;
            }
            else if (this.charactersCharacterStat.linkType == STAT_LINK_TYPE.ABILITY) {
                this.abilityId = this.charactersCharacterStat.defaultValue;
            }
            this._linkType = this.ruleSet.isItemEnabled ? "Item" : this.ruleSet.isSpellEnabled ? "Spell" : "Ability";  
            this.initialize();
        }, 0);
    }

    private initialize() {
        
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            // getting items data
            if (this.ruleSet.isItemEnabled) {
                this.itemsService.getItemByCharacterId<any[]>(this.characterId)
                    .subscribe(data => {
                        //console.log(data);
                        this.items = data;
                        
                        if (this.items.length) {
                            this.items = Object.assign([], this.items.map((x) => {
                                if (this.itemId == x.itemId) {

                                    x.selected = true;
                                    this.showProperty('Items');
                                    this.selectedItem = x;
                                }
                                else {
                                    x.selected = false;
                                }

                                return x;
                            }));
                            this.showMoreCommands('item', this.items.length, "Show more");
                        }
                        if (this._linkType == "Item") {
                            this.isLoading = false;
                        }
                        this.isLoading = false;
                    }, error => {
                        this.isLoading = false;
                    }, () => { });
            }
            // getting spell data
            if (this.ruleSet.isSpellEnabled) {
                this.characterSpellService.getCharacterSpellByCharacterId<any[]>(this.characterId)
                    .subscribe(data => {
                        //console.log(data);
                        this.spells = data;
                        
                        if (this.spells.length) {
                            this.spells = Object.assign([], this.spells.map((x) => {

                                if (this.spellId == x.characterSpellId) {

                                    x.selected = true;
                                    this.showProperty('Spells')
                                    this.selectedSpell = x;
                                }
                                else {
                                    x.selected = false;
                                }
                                return x;
                            }));
                            this.showMoreCommands('spell', this.spells.length, "Show more");
                        }
                        if (this._linkType == "Spell") {
                            this.isLoading = false;
                        } this.isLoading = false;
                    }, error => {
                        this.isLoading = false;
                    }, () => { });
            }
            if (this.ruleSet.isAbilityEnabled) {
              this.characterAbilityService.getCharacterAbilityByCharacterId<any[]>(this.characterId)
                    .subscribe(data => {
                        //console.log(data);
                        this.abilities = data;
                        if (this.abilities.length) {
                            this.abilities = Object.assign([], this.abilities.map((x) => {
                                if (this.abilityId == x.characterAbilityId) {

                                    x.selected = true;
                                    this.showProperty('Abilites')
                                    this.selectedSpell = x;
                                }
                                else {
                                    x.selected = false;
                                }
                                return x;
                            }));
                            this.showMoreCommands('ability', this.abilities.length, "Show more");
                        }
                        if (this._linkType == "Ability") {
                            this.isLoading = false;
                        } this.isLoading = false;
                    }, error => {
                        this.isLoading = false;
                    }, () => { });
            }
            if (!this.ruleSet.isItemEnabled && !this.ruleSet.isSpellEnabled && !this.ruleSet.isAbilityEnabled) {
                this.isLoading = false
            }

        }
    }

    showProperty(evt) {
        if (evt == "Items") {
            this.itemsList = true;
            this.spellsList = false;
            this.abilitiesList = false;
            //this.linkTileFormModal.linkType = "Item";
            this._linkType = "Item";
        }
        else if (evt == "Spells") {
            this.spellsList = true;
            this.itemsList = false;
            this.abilitiesList = false;
            //this.linkTileFormModal.linkType = "Spell";
            this._linkType = "Spell";
        }
        else {
            this.abilitiesList = true;
            this.itemsList = false;
            this.spellsList = false;
            //this.linkTileFormModal.linkType = "Ability";
            this._linkType = "Ability";
        }
    }

    getItemValue(val: any) {
        this.abilityId = 0;
        this.spellId = 0;
        this.selectedSpell = null;
        this.selectedAbility = null;
        this.itemId = val.itemId;
        this.selectedItem = val;
    }

    getAbilityValue(val: any) {
        
        this.itemId = 0;
        this.spellId = 0;
        this.selectedItem = null;
        this.selectedSpell = null;
        this.abilityId = val.characterAbilityId;
        this.selectedAbility = val;
    }

    getSpellValue(val: any) {
        
        this.abilityId = 0;
        this.itemId = 0;
        this.selectedItem = null;
        this.selectedAbility = null;
        this.spellId = val.characterSpellId;
        this.selectedSpell = val;
    }

    showMoreCommands(fieldName: any, _limit: number, _limitText: string) {
        //console.log(fieldName);
        if (fieldName == 'spell') {
            if (_limitText == "Show more") {
                this.limitTextSpell = "Show less";
                this.limitSpell = _limit;
            } else {
                this.limitTextSpell = "Show more";
                this.limitSpell = this.lengthOfRecordsToDisplay;
            }
        }
        else if (fieldName == 'item') {
            if (_limitText == "Show more") {
                this.limitTextItem = "Show less";
                this.limitItem = _limit;
            } else {
                this.limitTextItem = "Show more";
                this.limitItem = this.lengthOfRecordsToDisplay;
            }
        }
        else if (fieldName == 'ability') {
            if (_limitText == "Show more") {
                this.limitTextAbility = "Show less";
                this.limitAbility = _limit;
            } else {
                this.limitTextAbility = "Show more";
                this.limitAbility = this.lengthOfRecordsToDisplay;
            }
        }
    }

    submitForm() {
        //this.spellId;
        //this.abilityId;
        //this.itemId;
        //let returnObj: any = {
        //    spellId: this.spellId,
        //    abilityId: this.abilityId,
        //    itemId: this.itemId
        //};
        //
        this.event.emit({
            spell: this.selectedSpell,
            ability: this.selectedAbility,
            item: this.selectedItem,
            type: this.abilityId ? STAT_LINK_TYPE.ABILITY : this.spellId ? STAT_LINK_TYPE.SPELL : this.itemId ? STAT_LINK_TYPE.ITEM : ''
        });
        this.close();
    }   

    close() {
        this.bsModalRef.hide();
        this.destroyModalOnInit()
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }


}
