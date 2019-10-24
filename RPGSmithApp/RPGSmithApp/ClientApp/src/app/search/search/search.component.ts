import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../core/services/search.service';
import { Search } from '../../core/models/search.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { ConfigurationService } from '../../core/common/configuration.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { Characters } from '../../core/models/view-models/characters.model';
import { HeaderValues } from "../../core/models/headers.model";
import { CharactersService } from "../../core/services/characters.service";
import { Utilities } from "../../core/common/utilities";
import { SearchType } from '../../core/models/enums';
import { BasicSearch } from '../../core/models/search.model';
import { AppService1 } from '../../app.service';
import { RulesetService } from '../../core/services/ruleset.service';
import { EditMonsterComponent } from '../../records/monster/edit-monster/edit-monster.component';
import { EditItemComponent } from '../../characters/character-records/items/edit-item/edit-item.component';
import { CreateSpellsComponent } from '../../shared/create-spells/create-spells.component';
import { CreateAbilitiesComponent } from '../../shared/create-abilities/create-abilities.component';
import { CreateBuffAndEffectsComponent } from '../../shared/create-buff-and-effects/create-buff-and-effects.component';
import { CreateMonsterTemplateComponent } from '../../records/monster-template/create-monster-template/create-monster-template.component';
import { CreateMonsterGroupComponent } from '../../records/monster-template/moster-group/monster-group.component';
import { CreateItemMsterComponent } from '../../records/item-master/create-item/create-item.component';
import { CreateBundleComponent } from '../../records/item-master/create-bundle/create-bundle.component';
import { CreatelootComponent } from '../../records/loot/createloot/createloot.component';
import { CreateLootPileComponent } from '../../records/loot-pile/create-loot-pile/create-loot-pile.component';
import { CreateLootPileTemplateComponent } from '../../records/loot-pile-template/create-loot-pile-template/create-loot-pile-template.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  bsModalRef: BsModalRef;
  searchimage: string;
  isLoading = false;
  name: string;
  text: string;
  searchList: any = [];
  drpText: string;
  dropDownText: any;
  selected: boolean;
  value: number = 1;
  defaultText: string = '';
  characterId: number;
  rulesetID: number;
  searchModal: BasicSearch = new BasicSearch();
  headers: HeaderValues = new HeaderValues();
  character: Characters = new Characters();
  SEARCHTYPE = SearchType;
  everthing: number = -1;
  showMoreLessToggle: boolean = true;
  allFiltersSelected: boolean = false;
  isCharacterRulesetEntity: boolean = false;
  isCampaignSearch: boolean = false;
  isPlayerCharacterSearch: boolean = false;
  timeoutHandler: any;
  ruleSet: any;

  constructor(private searchService: SearchService, private router: Router, private alertService: AlertService, private sharedService: SharedService,
    private configurations: ConfigurationService, private route: ActivatedRoute, private modalService: BsModalService, private rulesetService: RulesetService,
    private localStorage: LocalStoreManager, private authService: AuthService, private charactersService: CharactersService, public appService: AppService1) {

    this.route.params.subscribe(params => {
      this.searchModal.searchString = params['searchText'] ? params['searchText'] : '__empty__';
      this.searchModal.searchString = this.searchModal.searchString == '__empty__' ? '' : this.searchModal.searchString;
      this.searchModal.searchType = params.searchType;
      this.defaultText = this.setDefaulttext(this.searchModal.searchType);
      if (this.searchModal.searchString) {
        this.searchModal.searchString = decodeURIComponent(this.searchModal.searchString)
      }

      this.Initialize(this.searchModal.searchType);
    });

  }

  ngOnInit() { }

  private Initialize(searchType) {

    let ruleSetId: number = this.localStorage.getDataObject(DBkeys.RULESET_ID);
    this.rulesetService.getRulesetById<any>(ruleSetId).subscribe(data => {
      if (data) {
        this.ruleSet = data;
      }
    }, error => { }, () => {
      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'character') {
          this.isLoading = true;
          this.isCampaignSearch = false;
          this.characterId = this.headers.headerId;
          this.searchModal.characterID = this.characterId;
          this.charactersService.getPlayerControlsByCharacterId(this.headers.headerId)
            .subscribe(data => {
              if (data) {
                if (data.isPlayerCharacter ||
                  data.isPlayerLinkedToCurrentCampaign ||
                  data.isCurrentCampaignPlayerCharacter) {
                  this.isPlayerCharacterSearch = true;
                }
                else {
                  this.isPlayerCharacterSearch = false;
                }
              }


            }, error => {
              let Errors = Utilities.ErrorDetail("", error);
            });
          this.charactersService.getCharactersById<any>(this.characterId)
            .subscribe(data => {
              this.character = data;
              this.searchModal.rulesetID = this.character.ruleSet.ruleSetId;
              //this.dropDownText = [
              //  { value: 1, text: 'Everything', type: SearchType.EVERYTHING, selected: searchType == SearchType.EVERYTHING ? true:false, imageurl: '' },
              //  { value: 2, text: 'Inventory', type: SearchType.CHARACTERITEMS, selected: searchType == SearchType.CHARACTERITEMS ? true : false, imageurl: this.character.imageUrl },
              //  { value: 3, text: 'Spells', type: SearchType.CHARACTERSPELLS, selected: searchType == SearchType.CHARACTERSPELLS ? true : false, imageurl: this.character.imageUrl },
              //  { value: 4, text: 'Abilities', type: SearchType.CHARACTERABILITIES, selected: searchType == SearchType.CHARACTERABILITIES ? true : false, imageurl: this.character.imageUrl },
              //  { value: 10, text: 'Buffs & Effects', type: SearchType.CHARACTERBUFFANDEFFECT, selected: searchType == SearchType.CHARACTERBUFFANDEFFECT ? true : false, imageurl: this.character.imageUrl },
              //  { value: 5, text: 'Item Templates', type: SearchType.RULESETITEMS, selected: searchType == SearchType.RULESETITEMS ? true : false, imageurl: this.character.ruleSet.imageUrl },
              //  { value: 6, text: 'Spells', type: SearchType.RULESETSPELLS, selected: searchType == SearchType.RULESETSPELLS ? true : false, imageurl: this.character.ruleSet.imageUrl },
              //  { value: 7, text: 'Abilities', type: SearchType.RULESETABILITIES, selected: searchType == SearchType.RULESETABILITIES ? true : false, imageurl: this.character.ruleSet.imageUrl },


              //  { value: 12, text: 'Buffs & Effects', type: SearchType.RULESETBUFFANDEFFECT, selected: searchType == SearchType.RULESETBUFFANDEFFECT ? true : false, imageurl: this.character.ruleSet.imageUrl},
              //  //{ value: 12, text: 'Monsters', type: SearchType.RULESETMONSTER, selected: searchType == SearchType.RULESETMONSTER ? true : false, imageurl: '' },
              //  //{ value: 13, text: 'Monster Templates', type: SearchType.RULESETMONSTERTEMPLATE, selected: searchType == SearchType.RULESETMONSTERTEMPLATE ? true : false, imageurl: '' },
              //  { value: 19, text: 'Loot', type: SearchType.CHARACTERLOOT, selected: searchType == SearchType.CHARACTERLOOT ? true : false, imageurl: this.character.ruleSet.imageUrl , isForPC: true },
              //  //{ value: 15, text: 'Random Loot', type: SearchType.RULESETLOOTTEMPLATE, selected: searchType == SearchType.RULESETLOOTTEMPLATE ? true : false, imageurl: '' },
              //  { value: 16, text: 'Handouts', type: SearchType.CHARACTERHANDOUT, selected: searchType == SearchType.CHARACTERHANDOUT ? true : false, imageurl: this.character.ruleSet.imageUrl, isForPC:true }
              //];

              this.dropDownText = [];
              this.dropDownText.push({ value: 1, text: 'Everything', type: SearchType.EVERYTHING, selected: searchType == SearchType.EVERYTHING ? true : false, imageurl: '' });

              if (this.ruleSet && this.ruleSet.isItemEnabled) {
                this.dropDownText.push({ value: 2, text: 'Inventory', type: SearchType.CHARACTERITEMS, selected: searchType == SearchType.CHARACTERITEMS ? true : false, imageurl: this.character.imageUrl });
              }
              if (this.ruleSet && this.ruleSet.isSpellEnabled) {
                this.dropDownText.push({ value: 3, text: 'Spells', type: SearchType.CHARACTERSPELLS, selected: searchType == SearchType.CHARACTERSPELLS ? true : false, imageurl: this.character.imageUrl });
              }
              if (this.ruleSet && this.ruleSet.isAbilityEnabled) {
                this.dropDownText.push({ value: 4, text: 'Abilities', type: SearchType.CHARACTERABILITIES, selected: searchType == SearchType.CHARACTERABILITIES ? true : false, imageurl: this.character.imageUrl });
              }
              if (this.ruleSet && this.ruleSet.isBuffAndEffectEnabled) {
                this.dropDownText.push({ value: 10, text: 'Buffs & Effects', type: SearchType.CHARACTERBUFFANDEFFECT, selected: searchType == SearchType.CHARACTERBUFFANDEFFECT ? true : false, imageurl: this.character.imageUrl });
              }
              if (this.ruleSet && this.ruleSet.isItemEnabled) {
                this.dropDownText.push({ value: 5, text: 'Item Templates', type: SearchType.RULESETITEMS, selected: searchType == SearchType.RULESETITEMS ? true : false, imageurl: this.character.ruleSet.imageUrl });
              }
              if (this.ruleSet && this.ruleSet.isSpellEnabled) {
                this.dropDownText.push({ value: 6, text: 'Spells', type: SearchType.RULESETSPELLS, selected: searchType == SearchType.RULESETSPELLS ? true : false, imageurl: this.character.ruleSet.imageUrl });
              }
              if (this.ruleSet && this.ruleSet.isAbilityEnabled) {
                this.dropDownText.push({ value: 7, text: 'Abilities', type: SearchType.RULESETABILITIES, selected: searchType == SearchType.RULESETABILITIES ? true : false, imageurl: this.character.ruleSet.imageUrl });
              }
              if (this.ruleSet && this.ruleSet.isBuffAndEffectEnabled) {
                this.dropDownText.push({ value: 12, text: 'Buffs & Effects', type: SearchType.RULESETBUFFANDEFFECT, selected: searchType == SearchType.RULESETBUFFANDEFFECT ? true : false, imageurl: this.character.ruleSet.imageUrl });
              }
              if (this.ruleSet && this.ruleSet.isItemEnabled) {
                this.dropDownText.push({ value: 19, text: 'Loot', type: SearchType.CHARACTERLOOT, selected: searchType == SearchType.CHARACTERLOOT ? true : false, imageurl: this.character.ruleSet.imageUrl, isForPC: true });
              }
              this.dropDownText.push({ value: 16, text: 'Handouts', type: SearchType.CHARACTERHANDOUT, selected: searchType == SearchType.CHARACTERHANDOUT ? true : false, imageurl: this.character.ruleSet.imageUrl, isForPC: true });


              if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS) {
                this.searchModal.itemFilters.isItemAbilityAssociated = true;
                this.searchModal.itemFilters.isItemDesc = true;
                this.searchModal.itemFilters.isItemName = true;
                this.searchModal.itemFilters.isItemRarity = true;
                this.searchModal.itemFilters.isItemSpellAssociated = true;
                this.searchModal.itemFilters.isItemStats = true;
                this.searchModal.itemFilters.isItemTags = true;
              }
              else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS || this.searchModal.searchType == SearchType.RULESETSPELLS) {
                this.searchModal.spellFilters.isSpellCastingTime = true;
                this.searchModal.spellFilters.isSpellClass = true;
                this.searchModal.spellFilters.isSpellDesc = true;
                this.searchModal.spellFilters.isSpellEffectDesc = true;
                this.searchModal.spellFilters.isSpellHitEffect = true;
                this.searchModal.spellFilters.isSpellLevel = true;
                this.searchModal.spellFilters.isSpellMissEffect = true;
                this.searchModal.spellFilters.isSpellName = true;
                this.searchModal.spellFilters.isSpellSchool = true;
                this.searchModal.spellFilters.isSpellStats = true;
                this.searchModal.spellFilters.isSpellTags = true;
              }
              else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES || this.searchModal.searchType == SearchType.RULESETABILITIES) {
                this.searchModal.abilityFilters.isAbilityDesc = true;
                this.searchModal.abilityFilters.isAbilityLevel = true;
                this.searchModal.abilityFilters.isAbilityName = true;
                this.searchModal.abilityFilters.isAbilityStats = true;
                this.searchModal.abilityFilters.isAbilityTags = true;
              }
              else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT || this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
                this.searchModal.buffAndEffectFilters.isBuffAndEffectName = true;
                this.searchModal.buffAndEffectFilters.isBuffAndEffectDesc = true;
                this.searchModal.buffAndEffectFilters.isBuffAndEffectStats = true;
                this.searchModal.buffAndEffectFilters.isBuffAndEffectTags = true;
              }
              else if (this.searchModal.searchType == SearchType.CHARACTERHANDOUT) {
                this.searchModal.handoutFilters.isHandoutName = true;
                this.searchModal.handoutFilters.isHandoutFileType = true;
              }
              else if (this.searchModal.searchType == SearchType.CHARACTERLOOT) {
                this.searchModal.lootFilters.isLootAbilityAssociated = true;
                this.searchModal.lootFilters.isLootDesc = true;
                this.searchModal.lootFilters.isLootItemAssociated = true;
                this.searchModal.lootFilters.isLootName = true;
                this.searchModal.lootFilters.isLootRarity = true;
                this.searchModal.lootFilters.isLootSpellAssociated = true;
                this.searchModal.lootFilters.isLootStats = true;
                this.searchModal.lootFilters.isLootTags = true;
              }
              this.isLoading = true;
              if (this.headers) {
                if (this.headers.headerLink == 'ruleset') {
                  this.searchModal.rulesetID = this.headers.headerId
                }
                else if (this.headers.headerLink == 'character') {
                  if (
                    this.searchModal.searchType == SearchType.RULESETITEMS
                    ||
                    this.searchModal.searchType == SearchType.RULESETSPELLS
                    ||
                    this.searchModal.searchType == SearchType.RULESETABILITIES

                  ) {
                    let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
                    this.searchModal.rulesetID = rid;
                  }
                  else {
                    this.searchModal.characterID = this.headers.headerId
                  }
                }
              }

              this.searchService.getFilters<any>(this.searchModal)
                .subscribe(data => {

                  if (data) {
                    if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS) {
                      this.searchModal.itemFilters.isItemAbilityAssociated = data.isAssociatedAbility;
                      this.searchModal.itemFilters.isItemDesc = data.isDesc;
                      this.searchModal.itemFilters.isItemName = data.isName;
                      this.searchModal.itemFilters.isItemRarity = data.isRarity;
                      this.searchModal.itemFilters.isItemSpellAssociated = data.isAssociatedSpell;
                      this.searchModal.itemFilters.isItemStats = data.isStats;
                      this.searchModal.itemFilters.isItemTags = data.isTags;
                    }
                    else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS || this.searchModal.searchType == SearchType.RULESETSPELLS) {
                      this.searchModal.spellFilters.isSpellCastingTime = data.isCastingTime;
                      this.searchModal.spellFilters.isSpellClass = data.isClass;
                      this.searchModal.spellFilters.isSpellDesc = data.isDesc;
                      this.searchModal.spellFilters.isSpellEffectDesc = data.isEffectDesc;
                      this.searchModal.spellFilters.isSpellHitEffect = data.isHitEffect;
                      this.searchModal.spellFilters.isSpellLevel = data.isLevel;
                      this.searchModal.spellFilters.isSpellMissEffect = data.isMissEffect;
                      this.searchModal.spellFilters.isSpellName = data.isName;
                      this.searchModal.spellFilters.isSpellSchool = data.isSchool;
                      this.searchModal.spellFilters.isSpellStats = data.isStats;
                      this.searchModal.spellFilters.isSpellTags = data.isTags;
                    }
                    else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES || this.searchModal.searchType == SearchType.RULESETABILITIES) {
                      this.searchModal.abilityFilters.isAbilityDesc = data.isDesc;
                      this.searchModal.abilityFilters.isAbilityLevel = data.isLevel;
                      this.searchModal.abilityFilters.isAbilityName = data.isName;
                      this.searchModal.abilityFilters.isAbilityStats = data.isStats;
                      this.searchModal.abilityFilters.isAbilityTags = data.isTags;
                    }
                    else if (this.searchModal.searchType == SearchType.EVERYTHING) {

                      this.searchModal.everythingFilters.isEverythingDesc = data.isDesc;
                      this.searchModal.everythingFilters.isEverythingTags = data.isTags;
                      this.searchModal.everythingFilters.isEverythingName = data.isName;
                      this.searchModal.everythingFilters.isEverythingStats = data.isStats;

                    }
                    else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT || this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
                      this.searchModal.buffAndEffectFilters.isBuffAndEffectDesc = data.isDesc;
                      this.searchModal.buffAndEffectFilters.isBuffAndEffectName = data.isName;
                      this.searchModal.buffAndEffectFilters.isBuffAndEffectStats = data.isStats;
                      this.searchModal.buffAndEffectFilters.isBuffAndEffectTags = data.isTags;
                    }
                    else if (this.searchModal.searchType == SearchType.RULESETHANDOUT) {
                      this.searchModal.handoutFilters.isHandoutFileType = data.isHandoutFileType;
                      this.searchModal.handoutFilters.isHandoutName = data.isName;
                    }
                    else if (this.searchModal.searchType == SearchType.CHARACTERLOOT) {
                      this.searchModal.lootFilters.isLootAbilityAssociated = data.isAssociatedAbility;
                      this.searchModal.lootFilters.isLootDesc = data.isDesc;
                      this.searchModal.lootFilters.isLootItemAssociated = data.isAssociatedItem;
                      this.searchModal.lootFilters.isLootName = data.isName;
                      this.searchModal.lootFilters.isLootRarity = data.isRarity;
                      this.searchModal.lootFilters.isLootSpellAssociated = data.isAssociatedSpell;
                      this.searchModal.lootFilters.isLootStats = data.isStats;
                      this.searchModal.lootFilters.isLootTags = data.isTags;
                    }
                  }
                  //this.isLoading = false;

                  this.search(this.searchModal.searchString);
                },
                  error => {
                    this.search(this.searchModal.searchString);
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
        else if (this.headers.headerId && this.headers.headerLink == 'ruleset') {
          let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
          if (user) {
            if (user.isGm) {
              this.isLoading = true;
              this.characterId = 0;
              this.rulesetID = this.headers.headerId;
              this.searchModal.rulesetID = this.rulesetID;
              this.searchModal.characterID = 0;
              this.isCampaignSearch = true;
              //this.character = data;
              // this.searchModal.rulesetID = this.character.ruleSet.ruleSetId;
              //this.dropDownText = [
              //  { value: 1, text: 'Everything', type: SearchType.EVERYTHING, selected: searchType == SearchType.EVERYTHING ? true : false, imageurl: '' },
              //  { value: 12, text: 'Monsters', type: SearchType.RULESETMONSTER, selected: searchType == SearchType.RULESETMONSTER ? true : false, imageurl: '' },
              //  { value: 13, text: 'Monster Templates', type: SearchType.RULESETMONSTERTEMPLATE, selected: searchType == SearchType.RULESETMONSTERTEMPLATE ? true : false, imageurl: '' },
              //  { value: 18, text: 'Items', type: SearchType.RULESETCHARACTERITEMS, selected: searchType == SearchType.RULESETCHARACTERITEMS ? true : false, imageurl: '' },
              //  { value: 5, text: 'Item Templates', type: SearchType.RULESETITEMS, selected: searchType == SearchType.RULESETITEMS ? true : false, imageurl: '' },
              //  { value: 14, text: 'Loot', type: SearchType.RULESETLOOT, selected: searchType == SearchType.RULESETLOOT ? true : false, imageurl: '' },
              //  { value: 15, text: 'Random Loot', type: SearchType.RULESETLOOTTEMPLATE, selected: searchType == SearchType.RULESETLOOTTEMPLATE ? true : false, imageurl: '' },
              //  { value: 6, text: 'Spells', type: SearchType.RULESETSPELLS, selected: searchType == SearchType.RULESETSPELLS ? true : false, imageurl: '' },
              //  { value: 7, text: 'Abilities', type: SearchType.RULESETABILITIES, selected: searchType == SearchType.RULESETABILITIES ? true : false, imageurl: '' },
              //  { value: 11, text: 'Buffs & Effects', type: SearchType.RULESETBUFFANDEFFECT, selected: searchType == SearchType.RULESETBUFFANDEFFECT ? true : false, imageurl: '' },
              //  { value: 16, text: 'Handouts', type: SearchType.RULESETHANDOUT, selected: searchType == SearchType.RULESETHANDOUT ? true : false, imageurl: '' }
              //];

              this.dropDownText = [];
              this.dropDownText.push({ value: 1, text: 'Everything', type: SearchType.EVERYTHING, selected: searchType == SearchType.EVERYTHING ? true : false, imageurl: '' });
              this.dropDownText.push({ value: 12, text: 'Monsters', type: SearchType.RULESETMONSTER, selected: searchType == SearchType.RULESETMONSTER ? true : false, imageurl: '' });
              this.dropDownText.push({ value: 13, text: 'Monster Templates', type: SearchType.RULESETMONSTERTEMPLATE, selected: searchType == SearchType.RULESETMONSTERTEMPLATE ? true : false, imageurl: '' });
              debugger
              if (this.ruleSet && this.ruleSet.isItemEnabled) {
                this.dropDownText.push({ value: 18, text: 'Items', type: SearchType.RULESETCHARACTERITEMS, selected: searchType == SearchType.RULESETCHARACTERITEMS ? true : false, imageurl: '' },
                  { value: 5, text: 'Item Templates', type: SearchType.RULESETITEMS, selected: searchType == SearchType.RULESETITEMS ? true : false, imageurl: '' },
                  { value: 14, text: 'Loot', type: SearchType.RULESETLOOT, selected: searchType == SearchType.RULESETLOOT ? true : false, imageurl: '' },
                  { value: 15, text: 'Random Loot', type: SearchType.RULESETLOOTTEMPLATE, selected: searchType == SearchType.RULESETLOOTTEMPLATE ? true : false, imageurl: '' });
              }
              if (this.ruleSet && this.ruleSet.isSpellEnabled) {
                this.dropDownText.push({ value: 6, text: 'Spells', type: SearchType.RULESETSPELLS, selected: searchType == SearchType.RULESETSPELLS ? true : false, imageurl: '' });
              }
              if (this.ruleSet && this.ruleSet.isAbilityEnabled) {
                this.dropDownText.push({ value: 7, text: 'Abilities', type: SearchType.RULESETABILITIES, selected: searchType == SearchType.RULESETABILITIES ? true : false, imageurl: '' });
              }
              if (this.ruleSet && this.ruleSet.isBuffAndEffectEnabled) {
                this.dropDownText.push({ value: 11, text: 'Buffs & Effects', type: SearchType.RULESETBUFFANDEFFECT, selected: searchType == SearchType.RULESETBUFFANDEFFECT ? true : false, imageurl: '' });
              }

              this.dropDownText.push({ value: 16, text: 'Handouts', type: SearchType.RULESETHANDOUT, selected: searchType == SearchType.RULESETHANDOUT ? true : false, imageurl: '' });

              if (this.searchModal.searchType == SearchType.RULESETITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
                this.searchModal.itemFilters.isItemAbilityAssociated = true;
                this.searchModal.itemFilters.isItemDesc = true;
                this.searchModal.itemFilters.isItemName = true;
                this.searchModal.itemFilters.isItemRarity = true;
                this.searchModal.itemFilters.isItemSpellAssociated = true;
                this.searchModal.itemFilters.isItemStats = true;
                this.searchModal.itemFilters.isItemTags = true;
              }
              else if (this.searchModal.searchType == SearchType.RULESETSPELLS) {
                this.searchModal.spellFilters.isSpellCastingTime = true;
                this.searchModal.spellFilters.isSpellClass = true;
                this.searchModal.spellFilters.isSpellDesc = true;
                this.searchModal.spellFilters.isSpellEffectDesc = true;
                this.searchModal.spellFilters.isSpellHitEffect = true;
                this.searchModal.spellFilters.isSpellLevel = true;
                this.searchModal.spellFilters.isSpellMissEffect = true;
                this.searchModal.spellFilters.isSpellName = true;
                this.searchModal.spellFilters.isSpellSchool = true;
                this.searchModal.spellFilters.isSpellStats = true;
                this.searchModal.spellFilters.isSpellTags = true;
              }
              else if (this.searchModal.searchType == SearchType.RULESETABILITIES) {
                this.searchModal.abilityFilters.isAbilityDesc = true;
                this.searchModal.abilityFilters.isAbilityLevel = true;
                this.searchModal.abilityFilters.isAbilityName = true;
                this.searchModal.abilityFilters.isAbilityStats = true;
                this.searchModal.abilityFilters.isAbilityTags = true;
              }
              else if (this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
                this.searchModal.buffAndEffectFilters.isBuffAndEffectName = true;
                this.searchModal.buffAndEffectFilters.isBuffAndEffectDesc = true;
                this.searchModal.buffAndEffectFilters.isBuffAndEffectStats = true;
                this.searchModal.buffAndEffectFilters.isBuffAndEffectTags = true;
              }
              else if (this.searchModal.searchType == SearchType.RULESETLOOT || this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE) {
                this.searchModal.lootFilters.isLootAbilityAssociated = true;
                this.searchModal.lootFilters.isLootDesc = true;
                this.searchModal.lootFilters.isLootItemAssociated = true;
                this.searchModal.lootFilters.isLootName = true;
                this.searchModal.lootFilters.isLootRarity = true;
                this.searchModal.lootFilters.isLootSpellAssociated = true;
                this.searchModal.lootFilters.isLootStats = true;
                this.searchModal.lootFilters.isLootTags = true;
              }

              else if (this.searchModal.searchType == SearchType.RULESETMONSTER || this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE) {
                this.searchModal.monsterFilters.isMonsterAbilityAssociated = true;
                this.searchModal.monsterFilters.isMonsterAC = true;
                this.searchModal.monsterFilters.isMonsterBEAssociated = true;
                this.searchModal.monsterFilters.isMonsterChallengeRating = true;
                this.searchModal.monsterFilters.isMonsterDesc = true;
                this.searchModal.monsterFilters.isMonsterHealth = true;
                this.searchModal.monsterFilters.isMonsterItemAssociated = true;
                this.searchModal.monsterFilters.isMonsterName = true;
                this.searchModal.monsterFilters.isMonsterSpellAssociated = true;
                this.searchModal.monsterFilters.isMonsterStats = true;
                this.searchModal.monsterFilters.isMonsterTags = true;
                this.searchModal.monsterFilters.isMonsterXPValue = true;
              }

              else if (this.searchModal.searchType == SearchType.RULESETHANDOUT) {
                this.searchModal.handoutFilters.isHandoutName = true;
                this.searchModal.handoutFilters.isHandoutFileType = true;
              }
              this.isLoading = true;
              if (this.headers) {
                if (this.headers.headerLink == 'ruleset') {
                  this.searchModal.rulesetID = this.headers.headerId;
                  this.searchModal.characterID = 0;
                }
              }

              this.searchService.getFilters<any>(this.searchModal)
                .subscribe(data => {

                  if (data) {
                    if (this.searchModal.searchType == SearchType.RULESETITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
                      this.searchModal.itemFilters.isItemAbilityAssociated = data.isAssociatedAbility;
                      this.searchModal.itemFilters.isItemDesc = data.isDesc;
                      this.searchModal.itemFilters.isItemName = data.isName;
                      this.searchModal.itemFilters.isItemRarity = data.isRarity;
                      this.searchModal.itemFilters.isItemSpellAssociated = data.isAssociatedSpell;
                      this.searchModal.itemFilters.isItemStats = data.isStats;
                      this.searchModal.itemFilters.isItemTags = data.isTags;
                    }
                    else if (this.searchModal.searchType == SearchType.RULESETSPELLS) {
                      this.searchModal.spellFilters.isSpellCastingTime = data.isCastingTime;
                      this.searchModal.spellFilters.isSpellClass = data.isClass;
                      this.searchModal.spellFilters.isSpellDesc = data.isDesc;
                      this.searchModal.spellFilters.isSpellEffectDesc = data.isEffectDesc;
                      this.searchModal.spellFilters.isSpellHitEffect = data.isHitEffect;
                      this.searchModal.spellFilters.isSpellLevel = data.isLevel;
                      this.searchModal.spellFilters.isSpellMissEffect = data.isMissEffect;
                      this.searchModal.spellFilters.isSpellName = data.isName;
                      this.searchModal.spellFilters.isSpellSchool = data.isSchool;
                      this.searchModal.spellFilters.isSpellStats = data.isStats;
                      this.searchModal.spellFilters.isSpellTags = data.isTags;
                    }
                    else if (this.searchModal.searchType == SearchType.RULESETABILITIES) {
                      this.searchModal.abilityFilters.isAbilityDesc = data.isDesc;
                      this.searchModal.abilityFilters.isAbilityLevel = data.isLevel;
                      this.searchModal.abilityFilters.isAbilityName = data.isName;
                      this.searchModal.abilityFilters.isAbilityStats = data.isStats;
                      this.searchModal.abilityFilters.isAbilityTags = data.isTags;
                    }
                    else if (this.searchModal.searchType == SearchType.EVERYTHING) {

                      this.searchModal.everythingFilters.isEverythingDesc = data.isDesc;
                      this.searchModal.everythingFilters.isEverythingTags = data.isTags;
                      this.searchModal.everythingFilters.isEverythingName = data.isName;
                      this.searchModal.everythingFilters.isEverythingStats = data.isStats;

                    }
                    else if (this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
                      this.searchModal.buffAndEffectFilters.isBuffAndEffectDesc = data.isDesc;
                      this.searchModal.buffAndEffectFilters.isBuffAndEffectName = data.isName;
                      this.searchModal.buffAndEffectFilters.isBuffAndEffectStats = data.isStats;
                      this.searchModal.buffAndEffectFilters.isBuffAndEffectTags = data.isTags;
                    }
                    else if (this.searchModal.searchType == SearchType.RULESETLOOT || this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE) {
                      this.searchModal.lootFilters.isLootAbilityAssociated = data.isAssociatedAbility;
                      this.searchModal.lootFilters.isLootDesc = data.isDesc;
                      this.searchModal.lootFilters.isLootItemAssociated = data.isAssociatedItem;
                      this.searchModal.lootFilters.isLootName = data.isName;
                      this.searchModal.lootFilters.isLootRarity = data.isRarity;
                      this.searchModal.lootFilters.isLootSpellAssociated = data.isAssociatedSpell;
                      this.searchModal.lootFilters.isLootStats = data.isStats;
                      this.searchModal.lootFilters.isLootTags = data.isTags;
                    }

                    else if (this.searchModal.searchType == SearchType.RULESETMONSTER || this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE) {
                      this.searchModal.monsterFilters.isMonsterAbilityAssociated = data.isAssociatedAbility;
                      this.searchModal.monsterFilters.isMonsterAC = data.isAC;
                      this.searchModal.monsterFilters.isMonsterBEAssociated = data.isAssociatedBE;
                      this.searchModal.monsterFilters.isMonsterChallengeRating = data.isChallengeRating;
                      this.searchModal.monsterFilters.isMonsterDesc = data.isDesc;
                      this.searchModal.monsterFilters.isMonsterHealth = data.isHealth;
                      this.searchModal.monsterFilters.isMonsterItemAssociated = data.isAssociatedItem;
                      this.searchModal.monsterFilters.isMonsterName = data.isName;
                      this.searchModal.monsterFilters.isMonsterSpellAssociated = data.isAssociatedSpell;
                      this.searchModal.monsterFilters.isMonsterStats = data.isStats;
                      this.searchModal.monsterFilters.isMonsterTags = data.isTags;
                      this.searchModal.monsterFilters.isMonsterXPValue = data.isXPValue;
                    }
                    else if (this.searchModal.searchType == SearchType.RULESETHANDOUT) {
                      this.searchModal.handoutFilters.isHandoutFileType = data.isHandoutFileType;
                      this.searchModal.handoutFilters.isHandoutName = data.isName;
                    }
                  }
                  //this.isLoading = false;

                  this.search(this.searchModal.searchString);
                },
                  error => {
                    this.search(this.searchModal.searchString);
                  }, () => { });
            }
          }




        }

        //else if (this.headers.headerId && this.headers.headerLink == 'ruleset') {
        //  this.isLoading = true;

        //  this.rulesetService.getRulesetById<any>(this.headers.headerId)
        //    .subscribe(rulesetData => {
        //      let ruleset = rulesetData;
        //  this.searchModal.rulesetID =  this.headers.headerId;
        //  //this.searchModal.characterID = this.characterId;

        //     // this.character = data;
        //      //this.searchModal.rulesetID = this.character.ruleSet.ruleSetId;
        //      this.dropDownText = [
        //        { value: 1, text: 'Everything', type: SearchType.EVERYTHING, selected: searchType == SearchType.EVERYTHING ? true : false, imageurl: '' },
        //        { value: 5, text: 'Items', type: SearchType.RULESETITEMS, selected: searchType == SearchType.RULESETITEMS ? true : false, imageurl: ruleset.imageUrl },
        //        { value: 6, text: 'Spells', type: SearchType.RULESETSPELLS, selected: searchType == SearchType.RULESETSPELLS ? true : false, imageurl: ruleset.imageUrl },
        //        { value: 7, text: 'Abilities', type: SearchType.RULESETABILITIES, selected: searchType == SearchType.RULESETABILITIES ? true : false, imageurl: ruleset.imageUrl }
        //      ];

        //      if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS) {
        //        this.searchModal.itemFilters.isItemAbilityAssociated = true;
        //        this.searchModal.itemFilters.isItemDesc = true;
        //        this.searchModal.itemFilters.isItemName = true;
        //        this.searchModal.itemFilters.isItemRarity = true;
        //        this.searchModal.itemFilters.isItemSpellAssociated = true;
        //        this.searchModal.itemFilters.isItemStats = true;
        //        this.searchModal.itemFilters.isItemTags = true;
        //      }
        //      else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS || this.searchModal.searchType == SearchType.RULESETSPELLS) {
        //        this.searchModal.spellFilters.isSpellCastingTime = true;
        //        this.searchModal.spellFilters.isSpellClass = true;
        //        this.searchModal.spellFilters.isSpellDesc = true;
        //        this.searchModal.spellFilters.isSpellEffectDesc = true;
        //        this.searchModal.spellFilters.isSpellHitEffect = true;
        //        this.searchModal.spellFilters.isSpellLevel = true;
        //        this.searchModal.spellFilters.isSpellMissEffect = true;
        //        this.searchModal.spellFilters.isSpellName = true;
        //        this.searchModal.spellFilters.isSpellSchool = true;
        //        this.searchModal.spellFilters.isSpellStats = true;
        //        this.searchModal.spellFilters.isSpellTags = true;
        //      }
        //      else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES || this.searchModal.searchType == SearchType.RULESETABILITIES) {
        //        this.searchModal.abilityFilters.isAbilityDesc = true;
        //        this.searchModal.abilityFilters.isAbilityLevel = true;
        //        this.searchModal.abilityFilters.isAbilityName = true;
        //        this.searchModal.abilityFilters.isAbilityStats = true;
        //        this.searchModal.abilityFilters.isAbilityTags = true;
        //      }
        //      this.isLoading = true;
        //      if (this.headers) {
        //        if (this.headers.headerLink == 'ruleset') {
        //          this.searchModal.rulesetID = this.headers.headerId
        //        }
        //        else if (this.headers.headerLink == 'character') {
        //          if (
        //            this.searchModal.searchType == SearchType.RULESETITEMS
        //            ||
        //            this.searchModal.searchType == SearchType.RULESETSPELLS
        //            ||
        //            this.searchModal.searchType == SearchType.RULESETABILITIES

        //          ) {
        //            let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
        //            this.searchModal.rulesetID = rid;
        //          }
        //          else {
        //            //this.searchModal.characterID = this.headers.headerId
        //          }
        //        }
        //      }

        //      this.searchService.getFilters<any>(this.searchModal)
        //        .subscribe(data => {

        //          if (data) {
        //            if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS) {
        //              this.searchModal.itemFilters.isItemAbilityAssociated = data.isAssociatedAbility;
        //              this.searchModal.itemFilters.isItemDesc = data.isDesc;
        //              this.searchModal.itemFilters.isItemName = data.isName;
        //              this.searchModal.itemFilters.isItemRarity = data.isRarity;
        //              this.searchModal.itemFilters.isItemSpellAssociated = data.isAssociatedSpell;
        //              this.searchModal.itemFilters.isItemStats = data.isStats;
        //              this.searchModal.itemFilters.isItemTags = data.isTags;
        //            }
        //            else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS || this.searchModal.searchType == SearchType.RULESETSPELLS) {
        //              this.searchModal.spellFilters.isSpellCastingTime = data.isCastingTime;
        //              this.searchModal.spellFilters.isSpellClass = data.isClass;
        //              this.searchModal.spellFilters.isSpellDesc = data.isDesc;
        //              this.searchModal.spellFilters.isSpellEffectDesc = data.isEffectDesc;
        //              this.searchModal.spellFilters.isSpellHitEffect = data.isHitEffect;
        //              this.searchModal.spellFilters.isSpellLevel = data.isLevel;
        //              this.searchModal.spellFilters.isSpellMissEffect = data.isMissEffect;
        //              this.searchModal.spellFilters.isSpellName = data.isName;
        //              this.searchModal.spellFilters.isSpellSchool = data.isSchool;
        //              this.searchModal.spellFilters.isSpellStats = data.isStats;
        //              this.searchModal.spellFilters.isSpellTags = data.isTags;
        //            }
        //            else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES || this.searchModal.searchType == SearchType.RULESETABILITIES) {
        //              this.searchModal.abilityFilters.isAbilityDesc = data.isDesc;
        //              this.searchModal.abilityFilters.isAbilityLevel = data.isLevel;
        //              this.searchModal.abilityFilters.isAbilityName = data.isName;
        //              this.searchModal.abilityFilters.isAbilityStats = data.isStats;
        //              this.searchModal.abilityFilters.isAbilityTags = data.isTags;
        //            }
        //            else if (this.searchModal.searchType == SearchType.EVERYTHING) {

        //              this.searchModal.everythingFilters.isEverythingDesc = data.isDesc;
        //              this.searchModal.everythingFilters.isEverythingTags = data.isTags;
        //              this.searchModal.everythingFilters.isEverythingName = data.isName;
        //              this.searchModal.everythingFilters.isEverythingStats = data.isStats;

        //            }
        //          }
        //          //this.isLoading = false;

        //          this.search(this.searchModal.searchString);
        //        },
        //          error => {
        //            this.search(this.searchModal.searchString);
        //          }, () => { });
        //    }, error => {
        //      this.isLoading = false;
        //      let Errors = Utilities.ErrorDetail("", error);
        //      if (Errors.sessionExpire) {
        //        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
        //        this.authService.logout(true);
        //      }
        //    }, () => { });

        //}
      }
    });

  }



  search(query: any, isSearched: boolean = false) {
    if (isSearched && !query) {
      let errMessage = 'A Search String is required to perform a Search. Please input one and try again.';
      this.alertService.showMessage("", errMessage, MessageSeverity.error);
      return false;
    }

    if (this.searchModal) {

      if (!this.searchModal.searchString) {
        this.searchModal.searchString = '';
      }
      if (!query) {
        query = '';
      }
    }
    this.appService.updateSearchText(query);

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.searchList = [];

      this.isLoading = true;
      this.showMoreLessToggle = true;
      //used to enable (check) the 'Name' checkbox
      this.checkFilters();
      let includeHandout = this.isCampaignSearch ? true : this.isPlayerCharacterSearch ? true : false;
      this.searchService.searchRecords<any>(this.searchModal, this.isCampaignSearch, includeHandout)
        .subscribe(data => {
          if (data && data.length > 0) {
            this.showMoreLessToggle = true;
            if (this.searchModal.searchType == SearchType.EVERYTHING) {
              this.searchModal.searchHeadingText = 'Everything';
              this.searchList = data.map(x => {

                let records = '';
                switch (x.recordType) {
                  case SearchType.RULESETITEMS:
                    records = x.rulesetItem;
                    break;
                  case SearchType.CHARACTERITEMS:
                    records = x.characterItem;
                    break;
                  case SearchType.RULESETSPELLS:
                    records = x.rulesetSpell;
                    break;
                  case SearchType.CHARACTERSPELLS:
                    records = x.characterSpell;
                    break;
                  case SearchType.RULESETABILITIES:
                    records = x.rulesetAbility;
                    break;
                  case SearchType.CHARACTERABILITIES:
                    records = x.characterAbility;
                    break;
                  case SearchType.CHARACTERBUFFANDEFFECT:
                    records = x.characterBuffAndEffect;
                    break;
                  case SearchType.RULESETBUFFANDEFFECT:
                    records = x.rulesetBuffAndEffect;
                    break;
                  case SearchType.RULESETLOOT:
                    records = x.rulesetLoot;
                    break;
                  case SearchType.RULESETLOOTTEMPLATE:
                    records = x.rulesetLootTemplate;
                    break;
                  case SearchType.RULESETMONSTER:
                    records = x.rulesetMonster;
                    break;
                  case SearchType.RULESETMONSTERTEMPLATE:
                    records = x.rulesetMonsterTemplate;
                    break;
                  case SearchType.RULESETCHARACTERITEMS:
                    records = x.rulesetCharacterItem;
                    break;
                  case SearchType.CHARACTERLOOT:
                    records = x.characterLoot;
                    break;
                  default:
                    records = x;
                    break;
                }

                return {
                  searchimage: x.image,
                  name: x.name,
                  searchType: x.recordType,
                  recordId: x.id,
                  record: records
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
              this.searchModal.searchHeadingText = 'Items';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.itemImage,
                  name: x.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.itemId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETITEMS) {

              this.searchModal.searchHeadingText = 'Items';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.itemImage,
                  name: x.itemName,
                  searchType: this.searchModal.searchType,
                  recordId: x.itemMasterId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS) {
              this.searchModal.searchHeadingText = 'Spells';
              this.searchList = data.map(x => {
                return {
                  searchimage: x.spell.imageUrl,
                  name: x.spell.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.characterSpellId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETSPELLS) {
              this.searchModal.searchHeadingText = 'Spells';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.imageUrl,
                  name: x.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.spellId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES) {
              this.searchModal.searchHeadingText = 'Abilities';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.ability.imageUrl,
                  name: x.ability.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.characterAbilityId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETABILITIES) {
              this.searchModal.searchHeadingText = 'Abilities';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.imageUrl,
                  name: x.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.abilityId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT) {
              this.searchModal.searchHeadingText = 'Buffs and Effects';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.buffAndEffect.imageUrl,
                  name: x.buffAndEffect.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.characterBuffAandEffectId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
              this.searchModal.searchHeadingText = 'Buffs and Effects';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.imageUrl,
                  name: x.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.buffAndEffectId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETLOOT || this.searchModal.searchType == SearchType.CHARACTERLOOT) {
              this.searchModal.searchHeadingText = 'Loots';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.itemImage,
                  name: x.itemName,
                  searchType: this.searchModal.searchType,
                  recordId: x.lootId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE) {
              this.searchModal.searchHeadingText = 'Random Loot';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.imageUrl,
                  name: x.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.lootTemplateId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETMONSTER) {
              this.searchModal.searchHeadingText = 'Monsters';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.imageUrl,
                  name: x.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.monsterId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE) {
              this.searchModal.searchHeadingText = 'Monster Templates';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.imageUrl,
                  name: x.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.monsterTemplateId,
                  record: x
                };
              });
            }
            else if (this.searchModal.searchType == SearchType.RULESETHANDOUT || this.searchModal.searchType == SearchType.CHARACTERHANDOUT) {
              this.searchModal.searchHeadingText = 'Handout';
              this.searchList = data.map(x => {

                return {
                  searchimage: x.type ? x.type.indexOf('image') > -1 ? x.url : '' : '',
                  name: x.name,
                  searchType: this.searchModal.searchType,
                  recordId: x.id,
                  record: x
                };
              });
            }
          } else {
            this.showMoreLessToggle = false;
          }
          if (isSearched) {
            this.router.navigate(['/search/' + this.searchModal.searchType + '/' + query]);
          }
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Some error occured.";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }, () => { });

    }

  }

  setText(text, searchedtext) {
    //if (!searchedtext) {
    //  let errMessage = 'A Search String is required to perform a Search. Please input one and try again.';
    //  this.alertService.showMessage("", errMessage, MessageSeverity.error);
    //  return false;
    //}
    this.showMoreLessToggle = true;
    this.dropDownText.forEach(function (val) {
      val.selected = false;
    });
    text.selected = true;

    this.isCharacterRulesetEntity = false;
    this.defaultText = text.text;
    if (text.type == SearchType.CHARACTERITEMS) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.CHARACTERITEMS;

    } else if (text.type == SearchType.CHARACTERSPELLS) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.CHARACTERSPELLS;
    }
    else if (text.type == SearchType.CHARACTERABILITIES) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.CHARACTERABILITIES;

    } else if (text.type == SearchType.RULESETITEMS) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETITEMS;

    } else if (text.type == SearchType.RULESETSPELLS) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETSPELLS;

    } else if (text.type == SearchType.RULESETABILITIES) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETABILITIES;

    }
    else if (text.type == SearchType.CHARACTERBUFFANDEFFECT) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.CHARACTERBUFFANDEFFECT;

    }
    else if (text.type == SearchType.RULESETBUFFANDEFFECT) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETBUFFANDEFFECT;

    }
    else if (text.type == SearchType.RULESETMONSTER) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETMONSTER;

    }
    else if (text.type == SearchType.RULESETMONSTERTEMPLATE) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETMONSTERTEMPLATE;

    }
    else if (text.type == SearchType.RULESETLOOT) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETLOOT;

    }
    else if (text.type == SearchType.RULESETLOOTTEMPLATE) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETLOOTTEMPLATE;

    }
    else if (text.type == SearchType.CHARACTERHANDOUT) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.CHARACTERHANDOUT;

    }
    else if (text.type == SearchType.RULESETHANDOUT) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETHANDOUT;

    }
    else if (text.type == SearchType.RULESETCHARACTERITEMS) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.RULESETCHARACTERITEMS;

    }
    else if (text.type == SearchType.CHARACTERLOOT) {
      this.isCharacterRulesetEntity = true;
      this.searchModal.searchType = SearchType.CHARACTERLOOT;

    }
    else {
      this.searchModal.searchType = text.type;
    }
    text.selected = true;
    this.router.navigate(['/search/' + this.searchModal.searchType + '/' + searchedtext]);
    this.Initialize(this.searchModal.searchType);

  }

  gotoPage(input: any) {
    if (this.searchModal.searchType == SearchType.EVERYTHING) {
      if (input.searchType == SearchType.CHARACTERITEMS || input.searchType == SearchType.RULESETCHARACTERITEMS) {
        this.router.navigate(['/character/inventory-details', input.recordId]);
      }
      else if (input.searchType == SearchType.RULESETITEMS) {
        if (input.record.isBundle) {
          if (this.isCampaignSearch) {
            this.router.navigate(['/ruleset/bundle-details', input.recordId]);
          } else {
            this.router.navigate(['/character/ruleset/item-detail', input.recordId]);
          }

        }
        else {
          if (this.isCampaignSearch) {
            this.router.navigate(['ruleset/item-details', input.recordId]);
          } else {
            this.router.navigate(['/character/ruleset/item-details', input.recordId]);
          }

        }

      }
      else if (input.searchType == SearchType.CHARACTERSPELLS) {
        this.router.navigate(['/character/spell-details', input.recordId]);
      }
      else if (input.searchType == SearchType.RULESETSPELLS) {
        if (this.isCampaignSearch) {
          this.router.navigate(['ruleset/spell-details', input.recordId]);
        } else {
          this.router.navigate(['/character/ruleset/spell-details', input.recordId]);
        }

      }
      else if (input.searchType == SearchType.CHARACTERABILITIES) {
        this.router.navigate(['/character/ability-details', input.recordId]);
      }
      else if (input.searchType == SearchType.RULESETABILITIES) {
        if (this.isCampaignSearch) {
          this.router.navigate(['ruleset/ability-details', input.recordId]);
        } else {
          this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
        }

      }
      else if (input.searchType == SearchType.CHARACTERBUFFANDEFFECT) {
        this.router.navigate(['/character/buff-effect-details', input.recordId]);
      }
      else if (input.searchType == SearchType.RULESETBUFFANDEFFECT) {
        if (this.isCampaignSearch) {
          this.router.navigate(['/ruleset/buff-effect-details', input.recordId]);
        } else {
          this.router.navigate(['/character/buff-effect-detail', input.recordId]);
        }

      }
      else if (input.searchType == SearchType.RULESETLOOT) {
        if (input.record && input.record.isLootPile) {
          this.router.navigate(['/ruleset/loot-pile-details', input.recordId]);
        } else {
          this.router.navigate(['/ruleset/loot-details', input.recordId]);
        }
        //loot-pile-details
      }
      else if (input.searchType == SearchType.RULESETLOOTTEMPLATE) {
        this.router.navigate(['/ruleset/loot-pile-template-details', input.recordId]);
      }
      else if (input.searchType == SearchType.RULESETMONSTER) {
        this.router.navigate(['/ruleset/monster-details', input.recordId]);
      }
      else if (input.searchType == SearchType.RULESETMONSTERTEMPLATE) {
        if (!input.record.isBundle) {
          this.router.navigate(['/ruleset/monster-template-details', input.recordId]);
        }
        else {
          this.router.navigate(['/ruleset/monster-bundle-details', input.recordId]);
        }
      }
      else if (input.searchType == SearchType.CHARACTERHANDOUT) {
        window.open(input.searchimage); //this.router.navigate(['/character/buff-effect-details', input.recordId]);
      }
      else if (input.searchType == SearchType.RULESETHANDOUT) {
        window.open(input.searchimage); //this.router.navigate(['/character/buff-effect-details', input.recordId]);
      }
      else if (input.searchType == SearchType.CHARACTERLOOT) {
        if (input.record && input.record.isLootPile) {
          this.router.navigate(['/character/ruleset/loot-pile-details', input.recordId]);
        } else {
          this.router.navigate(['/character/ruleset/loot-details', input.recordId]);
        }
        //loot-pile-details
      }

    } else {
      if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
        //console.log(this.searchModal.searchType);
        this.router.navigate(['/character/inventory-details', input.recordId]);
      }
      else if (this.searchModal.searchType == SearchType.RULESETITEMS) {
        if (input.record.isBundle) {
          if (this.isCampaignSearch) {
            this.router.navigate(['/ruleset/bundle-details', input.recordId]);
          } else {
            this.router.navigate(['/character/ruleset/item-detail', input.recordId]);
          }

        }
        else {
          if (this.isCampaignSearch) {
            this.router.navigate(['ruleset/item-details', input.recordId]);
          } else {
            this.router.navigate(['/character/ruleset/item-details', input.recordId]);
          }

        }

        //if (this.isCharacterRulesetEntity) {
        //  this.router.navigate(['/character/ruleset/item-details', input.recordId]);
        //}
        //else {
        //  this.router.navigate(['/ruleset/item-details', input.recordId]);
        //}
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS) {
        this.router.navigate(['/character/spell-details', input.recordId]);
      }
      else if (this.searchModal.searchType == SearchType.RULESETSPELLS) {
        if (this.isCampaignSearch) {
          this.router.navigate(['ruleset/spell-details', input.recordId]);
        } else {
          this.router.navigate(['/character/ruleset/spell-details', input.recordId]);
        }

        //if (this.isCharacterRulesetEntity) {
        //  this.router.navigate(['/character/ruleset/spell-details', input.recordId]);
        //}
        //else {
        //  this.router.navigate(['/ruleset/spell-details', input.recordId]);
        //}
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES) {
        this.router.navigate(['/character/ability-details', input.recordId]);
      }
      else if (this.searchModal.searchType == SearchType.RULESETABILITIES) {
        if (this.isCampaignSearch) {
          this.router.navigate(['ruleset/ability-details', input.recordId]);
        } else {
          this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
        }

        //if (this.isCharacterRulesetEntity) {
        //  this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
        //}
        //else {
        //  this.router.navigate(['/ruleset/ability-details', input.recordId]);
        //}
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT) {
        this.router.navigate(['/character/buff-effect-details', input.recordId]);
      }
      else if (this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
        if (this.isCampaignSearch) {
          this.router.navigate(['/ruleset/buff-effect-details', input.recordId]);
        } else {
          this.router.navigate(['/character/buff-effect-detail', input.recordId]);
        }

      }
      else if (this.searchModal.searchType == SearchType.RULESETLOOT) {
        if (input.record && input.record.isLootPile) {
          this.router.navigate(['/ruleset/loot-pile-details', input.recordId]);
        } else {
          this.router.navigate(['/ruleset/loot-details', input.recordId]);
        }

        //loot-pile-details
      }
      else if (this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE) {
        this.router.navigate(['/ruleset/loot-pile-template-details', input.recordId]);
      }
      else if (this.searchModal.searchType == SearchType.RULESETMONSTER) {
        this.router.navigate(['/ruleset/monster-details', input.recordId]);
      }
      else if (this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE) {
        if (!input.record.isBundle) {
          this.router.navigate(['/ruleset/monster-template-details', input.recordId]);
        }
        else {
          this.router.navigate(['/ruleset/monster-bundle-details', input.recordId]);
        }
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERHANDOUT) {
        window.open(input.searchimage); //this.router.navigate(['/character/buff-effect-details', input.recordId]);
      }
      else if (this.searchModal.searchType == SearchType.RULESETHANDOUT) {
        window.open(input.searchimage); //this.router.navigate(['/character/buff-effect-details', input.recordId]);
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERLOOT) {
        if (input.record && input.record.isLootPile) {
          this.router.navigate(['/character/ruleset/loot-pile-details', input.recordId]);
        } else {
          this.router.navigate(['/character/ruleset/loot-details', input.recordId]);
        }
      }
    }

  }
  //private setRulesetId(rulesetId: number) {
  //    this.localStorage.deleteData(DBkeys.RULESET_ID);
  //    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  //   // console.log(' rulesetId => ' + this.localStorage.getDataObject<number>(DBkeys.RULESET_ID));
  //}
  showMorelessFields() {
    this.showMoreLessToggle = !this.showMoreLessToggle;
  }
  selectDeselectFilters() {
    if (this.allFiltersSelected) {
      this.allFiltersSelected = false;
      if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
        this.searchModal.itemFilters.isItemAbilityAssociated = false;
        this.searchModal.itemFilters.isItemDesc = false;
        this.searchModal.itemFilters.isItemName = false;
        this.searchModal.itemFilters.isItemRarity = false;
        this.searchModal.itemFilters.isItemSpellAssociated = false;
        this.searchModal.itemFilters.isItemStats = false;
        this.searchModal.itemFilters.isItemTags = false;
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS || this.searchModal.searchType == SearchType.RULESETSPELLS) {
        this.searchModal.spellFilters.isSpellCastingTime = false;
        this.searchModal.spellFilters.isSpellClass = false;
        this.searchModal.spellFilters.isSpellDesc = false;
        this.searchModal.spellFilters.isSpellEffectDesc = false;
        this.searchModal.spellFilters.isSpellHitEffect = false;
        this.searchModal.spellFilters.isSpellLevel = false;
        this.searchModal.spellFilters.isSpellMissEffect = false;
        this.searchModal.spellFilters.isSpellName = false;
        this.searchModal.spellFilters.isSpellSchool = false;
        this.searchModal.spellFilters.isSpellStats = false;
        this.searchModal.spellFilters.isSpellTags = false;
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES || this.searchModal.searchType == SearchType.RULESETABILITIES) {
        this.searchModal.abilityFilters.isAbilityDesc = false;
        this.searchModal.abilityFilters.isAbilityLevel = false;
        this.searchModal.abilityFilters.isAbilityName = false;
        this.searchModal.abilityFilters.isAbilityStats = false;
        this.searchModal.abilityFilters.isAbilityTags = false;
      }
      else if (this.searchModal.searchType == SearchType.EVERYTHING) {
        this.searchModal.everythingFilters.isEverythingDesc = false;
        this.searchModal.everythingFilters.isEverythingTags = false;
        this.searchModal.everythingFilters.isEverythingName = false;
        this.searchModal.everythingFilters.isEverythingStats = false;

      }
      else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT || this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
        this.searchModal.buffAndEffectFilters.isBuffAndEffectDesc = false;
        this.searchModal.buffAndEffectFilters.isBuffAndEffectTags = false;
        this.searchModal.buffAndEffectFilters.isBuffAndEffectName = false;
        this.searchModal.buffAndEffectFilters.isBuffAndEffectStats = false;

      }
      else if (this.searchModal.searchType == SearchType.RULESETMONSTER || this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE) {
        this.searchModal.monsterFilters.isMonsterDesc = false;
        this.searchModal.monsterFilters.isMonsterTags = false;
        this.searchModal.monsterFilters.isMonsterName = false;
        this.searchModal.monsterFilters.isMonsterStats = false;

        this.searchModal.monsterFilters.isMonsterAbilityAssociated = false;
        this.searchModal.monsterFilters.isMonsterAC = false;
        this.searchModal.monsterFilters.isMonsterBEAssociated = false;
        this.searchModal.monsterFilters.isMonsterChallengeRating = false;
        this.searchModal.monsterFilters.isMonsterHealth = false;
        this.searchModal.monsterFilters.isMonsterItemAssociated = false;
        this.searchModal.monsterFilters.isMonsterSpellAssociated = false;
        this.searchModal.monsterFilters.isMonsterXPValue = false;


      }
      else if (this.searchModal.searchType == SearchType.RULESETLOOT || this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE || this.searchModal.searchType == SearchType.CHARACTERLOOT) {
        this.searchModal.lootFilters.isLootDesc = false;
        this.searchModal.lootFilters.isLootTags = false;
        this.searchModal.lootFilters.isLootName = false;
        this.searchModal.lootFilters.isLootStats = false;

        this.searchModal.lootFilters.isLootAbilityAssociated = false;
        this.searchModal.lootFilters.isLootItemAssociated = false;
        this.searchModal.lootFilters.isLootRarity = false;
        this.searchModal.lootFilters.isLootSpellAssociated = false;
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERHANDOUT || this.searchModal.searchType == SearchType.RULESETHANDOUT) {
        this.searchModal.handoutFilters.isHandoutName = false;
        this.searchModal.handoutFilters.isHandoutFileType = false;

      }
    }
    else {
      this.allFiltersSelected = true;
      if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
        this.searchModal.itemFilters.isItemAbilityAssociated = true;
        this.searchModal.itemFilters.isItemDesc = true;
        this.searchModal.itemFilters.isItemName = true;
        this.searchModal.itemFilters.isItemRarity = true;
        this.searchModal.itemFilters.isItemSpellAssociated = true;
        this.searchModal.itemFilters.isItemStats = true;
        this.searchModal.itemFilters.isItemTags = true;
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS || this.searchModal.searchType == SearchType.RULESETSPELLS) {
        this.searchModal.spellFilters.isSpellCastingTime = true;
        this.searchModal.spellFilters.isSpellClass = true;
        this.searchModal.spellFilters.isSpellDesc = true;
        this.searchModal.spellFilters.isSpellEffectDesc = true;
        this.searchModal.spellFilters.isSpellHitEffect = true;
        this.searchModal.spellFilters.isSpellLevel = true;
        this.searchModal.spellFilters.isSpellMissEffect = true;
        this.searchModal.spellFilters.isSpellName = true;
        this.searchModal.spellFilters.isSpellSchool = true;
        this.searchModal.spellFilters.isSpellStats = true;
        this.searchModal.spellFilters.isSpellTags = true;
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES || this.searchModal.searchType == SearchType.RULESETABILITIES) {
        this.searchModal.abilityFilters.isAbilityDesc = true;
        this.searchModal.abilityFilters.isAbilityLevel = true;
        this.searchModal.abilityFilters.isAbilityName = true;
        this.searchModal.abilityFilters.isAbilityStats = true;
        this.searchModal.abilityFilters.isAbilityTags = true;
      }
      else if (this.searchModal.searchType == SearchType.EVERYTHING) {
        this.searchModal.everythingFilters.isEverythingDesc = true;
        this.searchModal.everythingFilters.isEverythingTags = true;
        this.searchModal.everythingFilters.isEverythingName = true;
        this.searchModal.everythingFilters.isEverythingStats = true;

      }
      else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT || this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
        this.searchModal.buffAndEffectFilters.isBuffAndEffectDesc = true;
        this.searchModal.buffAndEffectFilters.isBuffAndEffectTags = true;
        this.searchModal.buffAndEffectFilters.isBuffAndEffectName = true;
        this.searchModal.buffAndEffectFilters.isBuffAndEffectStats = true;

      }
      else if (this.searchModal.searchType == SearchType.RULESETMONSTER || this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE) {
        this.searchModal.monsterFilters.isMonsterDesc = true;
        this.searchModal.monsterFilters.isMonsterTags = true;
        this.searchModal.monsterFilters.isMonsterName = true;
        this.searchModal.monsterFilters.isMonsterStats = true;

        this.searchModal.monsterFilters.isMonsterAbilityAssociated = true;
        this.searchModal.monsterFilters.isMonsterAC = true;
        this.searchModal.monsterFilters.isMonsterBEAssociated = true;
        this.searchModal.monsterFilters.isMonsterChallengeRating = true;
        this.searchModal.monsterFilters.isMonsterHealth = true;
        this.searchModal.monsterFilters.isMonsterItemAssociated = true;
        this.searchModal.monsterFilters.isMonsterSpellAssociated = true;
        this.searchModal.monsterFilters.isMonsterXPValue = true;


      }
      else if (this.searchModal.searchType == SearchType.RULESETLOOT || this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE || this.searchModal.searchType == SearchType.CHARACTERLOOT) {
        this.searchModal.lootFilters.isLootDesc = true;
        this.searchModal.lootFilters.isLootTags = true;
        this.searchModal.lootFilters.isLootName = true;
        this.searchModal.lootFilters.isLootStats = true;

        this.searchModal.lootFilters.isLootAbilityAssociated = true;
        this.searchModal.lootFilters.isLootItemAssociated = true;
        this.searchModal.lootFilters.isLootRarity = true;
        this.searchModal.lootFilters.isLootSpellAssociated = true;
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERHANDOUT || this.searchModal.searchType == SearchType.RULESETHANDOUT) {
        this.searchModal.handoutFilters.isHandoutName = true;
        this.searchModal.handoutFilters.isHandoutFileType = true;

      }
    }
  }
  setDefaulttext(type) {
    switch (+type) {
      case SearchType.CHARACTERABILITIES:
        return 'Ability';
      case SearchType.CHARACTERITEMS:
        return 'Inventory';
      case SearchType.CHARACTERSPELLS:
        return 'Spells';
      case SearchType.RULESETABILITIES:
        return 'Ability';
      case SearchType.RULESETITEMS:
        return 'Item Templates';
      case SearchType.RULESETSPELLS:
        return 'Spells';
      case SearchType.RULESETBUFFANDEFFECT:
        return 'Buffs & Effects';
      case SearchType.CHARACTERBUFFANDEFFECT:
        return 'Buffs & Effects';
      case SearchType.RULESETMONSTER:
        return 'Monster';
      case SearchType.RULESETMONSTERTEMPLATE:
        return 'Monster Template';
      case SearchType.RULESETLOOT:
        return 'Loot';
      case SearchType.RULESETLOOTTEMPLATE:
        return 'Random Loot';
      case SearchType.CHARACTERHANDOUT:
        return 'Handouts';
      case SearchType.RULESETHANDOUT:
        return 'Handouts';
      case SearchType.RULESETCHARACTERITEMS:
        return 'Items';
      case SearchType.CHARACTERLOOT:
        return 'Loot';
      default:
        return 'Everything';
    }
  }

  checkFilters() {
    if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
      let values = Object.values(this.searchModal.itemFilters);
      var found = values.find(function (element) {
        return element == true;
      });

      if (!found) {
        //console.log('founded items', found);
        this.searchModal.itemFilters.isItemName = true;
      }
    }
    else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS || this.searchModal.searchType == SearchType.RULESETSPELLS) {

      let values = Object.values(this.searchModal.spellFilters);
      var found = values.find(function (element) {
        return element == true;
      });

      if (!found) {
        //console.log('founded spells', found);
        this.searchModal.spellFilters.isSpellName = true;
      }
    }
    else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES || this.searchModal.searchType == SearchType.RULESETABILITIES) {
      let values = Object.values(this.searchModal.abilityFilters);
      var found = values.find(function (element) {
        return element == true;
      });
      if (!found) {
        // console.log('founded spells', found);
        this.searchModal.abilityFilters.isAbilityName = true;
      }
    }
    else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT || this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
      let values = Object.values(this.searchModal.buffAndEffectFilters);
      var found = values.find(function (element) {
        return element == true;
      });
      if (!found) {
        // console.log('founded spells', found);
        this.searchModal.buffAndEffectFilters.isBuffAndEffectName = true;
      }
    }
    else if (this.searchModal.searchType == SearchType.RULESETMONSTER || this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE) {
      let values = Object.values(this.searchModal.monsterFilters);
      var found = values.find(function (element) {
        return element == true;
      });
      if (!found) {
        // console.log('founded spells', found);
        this.searchModal.monsterFilters.isMonsterName = true;
      }
    }
    else if (this.searchModal.searchType == SearchType.RULESETLOOT || this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE || this.searchModal.searchType == SearchType.CHARACTERLOOT) {
      let values = Object.values(this.searchModal.lootFilters);
      var found = values.find(function (element) {
        return element == true;
      });
      if (!found) {
        // console.log('founded spells', found);
        this.searchModal.lootFilters.isLootName = true;
      }
    }
    else if (this.searchModal.searchType == SearchType.CHARACTERHANDOUT || this.searchModal.searchType == SearchType.RULESETHANDOUT) {
      let values = Object.values(this.searchModal.handoutFilters);
      var found = values.find(function (element) {
        return element == true;
      });
      if (!found) {
        // console.log('founded spells', found);
        this.searchModal.handoutFilters.isHandoutName = true;
      }
    }
    else if (this.searchModal.searchType == SearchType.EVERYTHING) {
      let values = Object.values(this.searchModal.everythingFilters);
      var found = values.find(function (element) {
        return element == true;
      });
      if (!found) {
        //console.log('founded Everything', found);
        this.searchModal.everythingFilters.isEverythingName = true;
      }
    }

  }

  GoBack() {

    let isGm: boolean = false;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user) {
      if (user.isGm) {
        isGm = true;
      }
    }
    let headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE)
    if (headers) {
      if (headers.headerLink == "character") {
        this.router.navigate(['/character/dashboard', headers.headerId]);
        return false;
      }
      else if (headers.headerLink == "ruleset" && isGm) {
        this.router.navigate(['/ruleset/campaign-details', headers.headerId]);
        return false;
      }
    }
    if (this.isCampaignSearch && isGm) {
      this.router.navigate(['/rulesets/campaigns']);
      return false;
    }
    else {
      this.router.navigate(['/characters']);
      return false;
    }
  }

  clickAndHold(record) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  editRecord(record) {
    this.timeoutHandler = setInterval(() => {
      this.EditSearchedRecord(record);
    }, 1000);
  }

  EditSearchedRecord(input) {
    if (this.searchModal.searchType == SearchType.EVERYTHING) {
      if (input.searchType == SearchType.CHARACTERITEMS || input.searchType == SearchType.RULESETCHARACTERITEMS) {
        this.EditCharacterItems(input);
      }
      else if (input.searchType == SearchType.RULESETITEMS) {
        if (input.record.isBundle) {
          if (this.isCampaignSearch) {
            this.EditRuleSetItemTemplate_Bundle(input);
          } else {
            //this.router.navigate(['/character/ruleset/item-detail', input.recordId]);
          }
        }
        else {
          if (this.isCampaignSearch) {
            this.EditRuleSetItemTemplate(input);
          } else {
            //this.router.navigate(['/character/ruleset/item-details', input.recordId]);
          }
        }
      }
      else if (input.searchType == SearchType.CHARACTERSPELLS) {
        this.EditCharacterSpells(input);
      }
      else if (input.searchType == SearchType.RULESETSPELLS) {
        if (this.isCampaignSearch) {
          this.EditRuleSetSpells(input);
        } else {
          //this.router.navigate(['/character/ruleset/spell-details', input.recordId]);
        }

      }
      else if (input.searchType == SearchType.CHARACTERABILITIES) {
        this.EditCharacterAbility(input);
      }
      else if (input.searchType == SearchType.RULESETABILITIES) {
        if (this.isCampaignSearch) {
          this.EditRuleSetAbility(input);
        } else {
          //this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
        }

      }
      else if (input.searchType == SearchType.CHARACTERBUFFANDEFFECT) {
        this.EditCharacterBuffEffect(input);
      }
      else if (input.searchType == SearchType.RULESETBUFFANDEFFECT) {
        if (this.isCampaignSearch) {
          this.EditRuleSetBuffEffect(input);
        } else {
          //this.router.navigate(['/character/buff-effect-detail', input.recordId]);
        }

      }
      else if (input.searchType == SearchType.RULESETLOOT) {
        if (input.record && input.record.isLootPile) {
          this.Edit_RuleSet_LootPile(input);
        } else {
          this.Edit_RuleSet_Loot(input);
        }
      }
      else if (input.searchType == SearchType.RULESETLOOTTEMPLATE) {
        this.Edit_RuleSet_LootPileTemplate(input);
      }
      else if (input.searchType == SearchType.RULESETMONSTER) {
        this.EditMonster(input);
      }
      else if (input.searchType == SearchType.RULESETMONSTERTEMPLATE) {
        if (!input.record.isBundle) {
          this.EditMosterTemplate(input);
        }
        else {
          this.EditMoster_BundleTemplate(input);
        }
      }
      else if (input.searchType == SearchType.CHARACTERLOOT) {
        //if (input.record && input.record.isLootPile) {
        //  this.router.navigate(['/character/ruleset/loot-pile-details', input.recordId]);
        //} else {
        //  this.router.navigate(['/character/ruleset/loot-details', input.recordId]);
        //}
      }

    } else {
      if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
        this.EditCharacterItems(input);
      }
      else if (this.searchModal.searchType == SearchType.RULESETITEMS) {
        if (input.record.isBundle) {
          if (this.isCampaignSearch) {
            this.EditRuleSetItemTemplate_Bundle(input);
          } else {
            //this.router.navigate(['/character/ruleset/item-detail', input.recordId]);
          }

        }
        else {
          if (this.isCampaignSearch) {
            this.EditRuleSetItemTemplate(input);
          } else {
            //this.router.navigate(['/character/ruleset/item-details', input.recordId]);
          }

        }
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS) {
        this.EditCharacterSpells(input);
      }
      else if (this.searchModal.searchType == SearchType.RULESETSPELLS) {
        if (this.isCampaignSearch) {
          this.EditRuleSetSpells(input);
        } else {
          //this.router.navigate(['/character/ruleset/spell-details', input.recordId]);
        }
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES) {
        this.EditCharacterAbility(input);
      }
      else if (this.searchModal.searchType == SearchType.RULESETABILITIES) {
        if (this.isCampaignSearch) {
          this.EditRuleSetAbility(input);
        } else {
          //this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
        }
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT) {
        this.EditCharacterBuffEffect(input);
      }
      else if (this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
        if (this.isCampaignSearch) {
          this.EditRuleSetBuffEffect(input);
        } else {
          //this.router.navigate(['/character/buff-effect-detail', input.recordId]);
        }

      }
      else if (this.searchModal.searchType == SearchType.RULESETLOOT) {
        if (input.record && input.record.isLootPile) {
          this.Edit_RuleSet_LootPile(input);
        } else {
          this.Edit_RuleSet_Loot(input);
        }
      }
      else if (this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE) {
        this.Edit_RuleSet_LootPileTemplate(input);
      }
      else if (this.searchModal.searchType == SearchType.RULESETMONSTER) {
        this.EditMonster(input);
      }
      else if (this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE) {
        if (!input.record.isBundle) {
          this.EditMosterTemplate(input);
        }
        else {
          this.EditMoster_BundleTemplate(input);
        }
      }
      else if (this.searchModal.searchType == SearchType.CHARACTERLOOT) {
        //if (input.record && input.record.isLootPile) {
        //  this.router.navigate(['/character/ruleset/loot-pile-details', input.recordId]);
        //} else {
        //  this.router.navigate(['/character/ruleset/loot-details', input.recordId]);
        //}
      }
    }

  }

  EditCharacterBuffEffect(buff_Effect) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Buff & Effect';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.fromDetail = false;
      this.bsModalRef.content.IsFromCharacter = true;
      this.bsModalRef.content.buffAndEffectVM = buff_Effect.record;
      this.bsModalRef.content.rulesetID = this.rulesetID;
      this.bsModalRef.content.isEditingWithoutDetail = true;
      this.bsModalRef.content.userID = user.id;
    }
  }

  EditCharacterItems(item) {
    this.bsModalRef = this.modalService.show(EditItemComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Item';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.itemVM = item.record;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  EditCharacterSpells(spell) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Spell';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.fromDetail = false;
      this.bsModalRef.content.spellVM = spell.record;
      this.bsModalRef.content.rulesetID = this.rulesetID;
      this.bsModalRef.content.isFromCharacter = true;
      this.bsModalRef.content.isFromCharacterId = +this.characterId;
      this.bsModalRef.content.isEditingWithoutDetail = true;
      this.bsModalRef.content.userID = user.id;
    }
  }

  EditCharacterAbility(ability) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Ability';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.fromDetail = false;
      this.bsModalRef.content.abilityVM = ability.record;
      this.bsModalRef.content.isFromCharacter = true;
      this.bsModalRef.content.isFromCharacterId = +this.characterId;
      this.bsModalRef.content.isFromCharacterAbilityId = ability.record.characterAbilityId;
      this.bsModalRef.content.rulesetID = this.rulesetID;
      this.bsModalRef.content.isEditingWithoutDetail = true;
      this.bsModalRef.content.userID = user.id;
    }
  }

  EditRuleSetBuffEffect(buff_Effect) {
    this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Buff & Effect';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.buffAndEffectVM = buff_Effect.record;
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  EditRuleSetItemTemplate(itemTemplate) {
    this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Item Template';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.itemMasterVM = itemTemplate.record.itemMasterId;
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  EditRuleSetItemTemplate_Bundle(itemTemplateBundle) {
    this.bsModalRef = this.modalService.show(CreateBundleComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Bundle';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.bundleVM = itemTemplateBundle.record.itemMasterId;
    //this.bsModalRef.content.bundleVM = {
    //  bundleId: bundle.bundleId,
    //  ruleSetId: this.ruleSetId,
    //  bundleName: bundle.bundleName,
    //  bundleImage: bundle.bundleImage,
    //  bundleVisibleDesc: bundle.bundleVisibleDesc,
    //  value: bundle.value,
    //  volume: bundle.volume,
    //  totalWeight: bundle.totalWeight,
    //  metatags: bundle.metatags,
    //  rarity: bundle.rarity,
    //  weightLabel: bundle.weightLabel,
    //  currencyLabel: bundle.currencyLabel,
    //  volumeLabel: bundle.volumeLabel
    //};
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  EditRuleSetSpells(spell) {
    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Spell';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.spellVM = spell.record;
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  EditRuleSetAbility(ability) {
    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Ability';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.abilityVM = ability.record;
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  EditMonster(monster) {
    this.bsModalRef = this.modalService.show(EditMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Monster';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterVM = monster.record.monsterId;
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.isFromCombatScreen = false;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  EditMosterTemplate(monsterTemplate) {
    this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Monster Template';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterTemplateVM = monsterTemplate.record.monsterTemplateId;
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.isFromCombatScreen = false;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  EditMoster_BundleTemplate(monsterBundleTemplate) {
    this.bsModalRef = this.modalService.show(CreateMonsterGroupComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Bundle';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.bundleVM = monsterBundleTemplate.record.monsterTemplateId
    //this.bsModalRef.content.bundleVM = {
    //  bundleId: bundle.bundleId,
    //  ruleSetId: this.ruleSetId,
    //  bundleName: bundle.bundleName,
    //  bundleImage: bundle.bundleImage,
    //  bundleVisibleDesc: bundle.bundleVisibleDesc,

    //  metatags: bundle.metatags,
    //  addToCombat: bundle.addToCombat

    //};
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  Edit_RuleSet_Loot(loot) {
    this.bsModalRef = this.modalService.show(CreatelootComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Loot';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.itemMasterVM = loot.record.lootId;
    this.bsModalRef.content.rulesetID = this.rulesetID;
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  Edit_RuleSet_LootPile(lootPile) {
    this.bsModalRef = this.modalService.show(CreateLootPileComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Loot Pile';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.lootPileVM = lootPile.record.lootId;
    this.bsModalRef.content.ruleSetId = this.rulesetID;
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  Edit_RuleSet_LootPileTemplate(lootPileTemplate) {
    this.bsModalRef = this.modalService.show(CreateLootPileTemplateComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Random Loot';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.lootPileVM = lootPileTemplate.record.lootTemplateId;
    this.bsModalRef.content.ruleSetId = this.rulesetID;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

}
