import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { ConfigurationService } from '../../core/common/configuration.service';
import { SearchService } from '../../core/services/search.service';
import { BasicSearch } from '../../core/models/search.model';
import { HeaderValues } from '../../core/models/headers.model';
import { SearchType } from '../../core/models/enums';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { SharedService } from '../../core/services/shared.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AuthService } from '../../core/auth/auth.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { AppService1 } from '../../app.service';
import { Utilities } from '../../core/common/utilities';
import { Characters } from '../../core/models/view-models/characters.model';
import { CharactersService } from '../../core/services/characters.service';

@Component({
  selector: 'app-basic-search',
  templateUrl: './basic-search.component.html',
  styleUrls: ['./basic-search.component.scss']
})
export class BasicSearchComponent implements OnInit {
  isLoading = false;
  searchList: any = [];
  dropDownText: any;
  selected: boolean;
  value: number = 1;
  defaultText: string = '';
  allFiltersSelected: boolean = true;
  showMoreLessToggle: boolean = true;
  isCharacterRulesetEntity: boolean = false;
  searchModal: BasicSearch = new BasicSearch();
  headers: HeaderValues = new HeaderValues();
  SEARCHTYPE = SearchType;
  searchTypeParam: any;
  isCampaignSearch: boolean = false;
  characterId: number;
  rulesetID: number;
  character: Characters = new Characters();
  isPlayerCharacterSearch: boolean = false;

  constructor(private searchService: SearchService, private router: Router, private alertService: AlertService, private sharedService: SharedService,
    private configurations: ConfigurationService, private route: ActivatedRoute, private modalService: BsModalService,
    private localStorage: LocalStoreManager, private authService: AuthService, public appService: AppService1,
    private charactersService: CharactersService) {

    route.params.subscribe(val => {
     
      this.searchTypeParam = val.searchType;
      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId) {
          this.setHeaderValues(this.headers);
        }
      }
     
      this.Initialize();
      // put the code from `ngOnInit` here
    });}

  ngOnInit() {
  
  }

  private Initialize() {
    this.isCharacterRulesetEntity = false;
    this.route.params.subscribe(params => {
      if (params['searchType'] == SearchType.CHARACTERRULESETITEMS) {
        this.isCharacterRulesetEntity = true;
        this.searchModal.searchType = SearchType.RULESETITEMS;
      }
      else if (params['searchType'] == SearchType.CHARACTERRULESETSPELLS) {
        this.isCharacterRulesetEntity = true;
        this.searchModal.searchType = SearchType.RULESETSPELLS;
      }
      else if (params['searchType'] == SearchType.CHARACTERRULESETABILITIES) {
        this.isCharacterRulesetEntity = true;
        this.searchModal.searchType = SearchType.RULESETABILITIES;
      }

      else if (params['searchType'] == SearchType.CHARACTERRULESETBUFFEFFECT) {
        this.isCharacterRulesetEntity = true;
        this.searchModal.searchType = SearchType.RULESETBUFFANDEFFECT;
      }
      else if (params['searchType'] == SearchType.CHARACTERLOOT) {
        this.isCharacterRulesetEntity = true;
        this.searchModal.searchType = SearchType.CHARACTERLOOT;
      }
      else {
        this.searchModal.searchType = params['searchType'];
      }
      
      this.searchModal.searchString = params['searchText'];
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user) {
        if (user.isGm) {
          if (
            params['searchType'] == SearchType.RULESETABILITIES ||
            params['searchType'] == SearchType.RULESETITEMS ||
            params['searchType'] == SearchType.RULESETSPELLS ||
            params['searchType'] == SearchType.RULESETLOOT ||
            params['searchType'] == SearchType.RULESETLOOTTEMPLATE ||
            params['searchType'] == SearchType.RULESETMONSTER ||
            params['searchType'] == SearchType.RULESETMONSTERTEMPLATE ||
            params['searchType'] == SearchType.RULESETBUFFANDEFFECT) {
            this.isCampaignSearch = true;
          }
        }
      }

      //this.searchModal.searchString = params['searchText'] ? params['searchText'] : '__empty__';
      this.searchModal.searchString = this.searchModal.searchString == '__empty__' ? '' : this.searchModal.searchString;
    });

    this.defaultText = this.GetSearchText(this.searchModal.searchType);
    //this.dropDownText = [
    //  { value: 1, text: 'Everything', selected: true },
    //  { value: 2, text: 'Character', selected: false },
    //  { value: 3, text: 'Rulesets', selected: false },
    //  { value: 4, text: 'Items', selected: false },
    //  { value: 5, text: 'Spells', selected: false },
    //  { value: 6, text: 'Abilities', selected: false },
    //  { value: 7, text: 'Character Stat', selected: false },
    //  { value: 8, text: 'Tiles', selected: false },
    //];    

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
    else if (this.searchModal.searchType == SearchType.CHARACTERLOOT || this.searchModal.searchType == SearchType.RULESETLOOT || this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE) {
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
    if (this.headers) {      
      if (this.headers.headerLink == 'ruleset') {
        this.searchModal.rulesetID = this.headers.headerId;

        ////RuleSet Dropdown////
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user) {
          if (user.isGm) {
            this.isLoading = true;
            this.characterId = 0;
            this.rulesetID = this.headers.headerId;
            this.dropDownText = [
              { value: 1, text: 'Everything', type: SearchType.EVERYTHING, selected: this.searchModal.searchType == SearchType.EVERYTHING ? true : false, imageurl: '' },
              { value: 12, text: 'Monsters', type: SearchType.RULESETMONSTER, selected: this.searchModal.searchType == SearchType.RULESETMONSTER ? true : false, imageurl: '' },
              { value: 13, text: 'Monster Templates', type: SearchType.RULESETMONSTERTEMPLATE, selected: this.searchModal.searchType == SearchType.RULESETMONSTERTEMPLATE ? true : false, imageurl: '' },
              { value: 18, text: 'Items', type: SearchType.RULESETCHARACTERITEMS, selected: this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS ? true : false, imageurl: '' },
              { value: 5, text: 'Item Templates', type: SearchType.RULESETITEMS, selected: this.searchModal.searchType == SearchType.RULESETITEMS ? true : false, imageurl: '' },
              { value: 14, text: 'Loot', type: SearchType.RULESETLOOT, selected: this.searchModal.searchType == SearchType.RULESETLOOT ? true : false, imageurl: '' },
              { value: 15, text: 'Loot Templates', type: SearchType.RULESETLOOTTEMPLATE, selected: this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE ? true : false, imageurl: '' },
              { value: 6, text: 'Spells', type: SearchType.RULESETSPELLS, selected: this.searchModal.searchType == SearchType.RULESETSPELLS ? true : false, imageurl: '' },
              { value: 7, text: 'Abilities', type: SearchType.RULESETABILITIES, selected: this.searchModal.searchType == SearchType.RULESETABILITIES ? true : false, imageurl: '' },
              { value: 11, text: 'Buffs & Effects', type: SearchType.RULESETBUFFANDEFFECT, selected: this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT ? true : false, imageurl: '' },
              { value: 16, text: 'Handouts', type: SearchType.RULESETHANDOUT, selected: this.searchModal.searchType == SearchType.RULESETHANDOUT ? true : false, imageurl: '' }
            ];            
          }
        }
        ////RuleSet Dropdown////
      }
      else if (this.headers.headerLink == 'character') {
        if (
          this.searchModal.searchType == SearchType.RULESETITEMS
          ||
          this.searchModal.searchType == SearchType.RULESETSPELLS
          ||
          this.searchModal.searchType == SearchType.RULESETABILITIES
          ||
          this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT         

        ) {
          let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          this.searchModal.rulesetID = rid;
        }
        else {
          this.searchModal.characterID = this.headers.headerId
        }
        if (this.searchModal.searchType == SearchType.CHARACTERLOOT) {
          let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          this.searchModal.rulesetID = rid;
          this.searchModal.characterID = this.headers.headerId
        }

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
        ////Character Dropdown////
        this.charactersService.getCharactersById<any>(this.searchModal.characterID)
          .subscribe(data => {
            this.character = data;
            this.searchModal.rulesetID = this.character.ruleSet.ruleSetId;
            this.dropDownText = [
              { value: 1, text: 'Everything', type: SearchType.EVERYTHING, selected: this.searchModal.searchType == SearchType.EVERYTHING ? true : false, imageurl: '' },
              { value: 2, text: 'Inventory', type: SearchType.CHARACTERITEMS, selected: this.searchModal.searchType == SearchType.CHARACTERITEMS ? true : false, imageurl: this.character.imageUrl },
              { value: 3, text: 'Spells', type: SearchType.CHARACTERSPELLS, selected: this.searchModal.searchType == SearchType.CHARACTERSPELLS ? true : false, imageurl: this.character.imageUrl },
              { value: 4, text: 'Abilities', type: SearchType.CHARACTERABILITIES, selected: this.searchModal.searchType == SearchType.CHARACTERABILITIES ? true : false, imageurl: this.character.imageUrl },
              { value: 10, text: 'Buffs & Effects', type: SearchType.CHARACTERBUFFANDEFFECT, selected: this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT ? true : false, imageurl: this.character.imageUrl },
              { value: 5, text: 'Item Templates', type: SearchType.RULESETITEMS, selected: this.searchModal.searchType == SearchType.RULESETITEMS ? true : false, imageurl: this.character.ruleSet.imageUrl },
              { value: 6, text: 'Spells', type: SearchType.RULESETSPELLS, selected: this.searchModal.searchType == SearchType.RULESETSPELLS ? true : false, imageurl: this.character.ruleSet.imageUrl },
              { value: 7, text: 'Abilities', type: SearchType.RULESETABILITIES, selected: this.searchModal.searchType == SearchType.RULESETABILITIES ? true : false, imageurl: this.character.ruleSet.imageUrl },


              { value: 12, text: 'Buffs & Effects', type: SearchType.RULESETBUFFANDEFFECT, selected: this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT ? true : false, imageurl: this.character.ruleSet.imageUrl },
              //{ value: 12, text: 'Monsters', type: SearchType.RULESETMONSTER, selected: searchType == SearchType.RULESETMONSTER ? true : false, imageurl: '' },
              //{ value: 13, text: 'Monster Templates', type: SearchType.RULESETMONSTERTEMPLATE, selected: searchType == SearchType.RULESETMONSTERTEMPLATE ? true : false, imageurl: '' },
              { value: 19, text: 'Loot', type: SearchType.CHARACTERLOOT, selected: this.searchModal.searchType == SearchType.CHARACTERLOOT ? true : false, imageurl: this.character.ruleSet.imageUrl, isForPC: true },
              //{ value: 15, text: 'Loot Templates', type: SearchType.RULESETLOOTTEMPLATE, selected: searchType == SearchType.RULESETLOOTTEMPLATE ? true : false, imageurl: '' },
              { value: 16, text: 'Handouts', type: SearchType.CHARACTERHANDOUT, selected: this.searchModal.searchType == SearchType.CHARACTERHANDOUT ? true : false, imageurl: this.character.ruleSet.imageUrl, isForPC: true }
            ];

          }, error => {
            this.isLoading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              this.authService.logout(true);
            }
          }, () => { });
        ////Character Dropdown////

      }
    }
    this.isLoading = true;
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
          else if (this.searchModal.searchType == SearchType.CHARACTERLOOT ||this.searchModal.searchType == SearchType.RULESETLOOT || this.searchModal.searchType == SearchType.RULESETLOOTTEMPLATE) {
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
          else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES || this.searchModal.searchType == SearchType.RULESETABILITIES) {
            this.searchModal.abilityFilters.isAbilityDesc = data.isDesc;
            this.searchModal.abilityFilters.isAbilityLevel = data.isLevel;
            this.searchModal.abilityFilters.isAbilityName = data.isName;
            this.searchModal.abilityFilters.isAbilityStats = data.isStats;
            this.searchModal.abilityFilters.isAbilityTags = data.isTags;
          }
          else if (this.searchModal.searchType == SearchType.CHARACTERBUFFANDEFFECT || this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
            this.searchModal.buffAndEffectFilters.isBuffAndEffectName = true;
            this.searchModal.buffAndEffectFilters.isBuffAndEffectDesc = true;
            this.searchModal.buffAndEffectFilters.isBuffAndEffectStats = true;
            this.searchModal.buffAndEffectFilters.isBuffAndEffectTags = true;
          }
        }
        
        
        //this.isLoading = false;
        this.search(this.searchModal.searchString);
      },
        error => {
          this.search(this.searchModal.searchString);
        }, () => { });
    
  }
  
  search(query: string, isSearched: boolean = false) {
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
    if (user == null) {
      this.authService.logout();
    }
    else {
      this.searchList = [];
      this.isLoading = true;
      this.showMoreLessToggle = true;

    //used to enable (check) the 'Name' checkbox
      this.checkFilters();

      this.searchService.searchRecords<any>(this.searchModal, false, false)
        .subscribe(data => {
          if (data.length > 0) {
            this.showMoreLessToggle = true;
            if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETCHARACTERITEMS) {
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
              this.searchModal.searchHeadingText = 'Loot Templates';
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
          }
          else {
            this.showMoreLessToggle = false;
          }

          if (isSearched) {
            this.router.navigate(['/search/basic/' + this.searchTypeParam + '/' + query]);
          }
          
          this.isLoading = false;
        },
        error => {
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

  setText(text, searchText) {
    let searchQuery = searchText;
    let type = text.type;
    searchText = searchText ? searchText : '__empty__';
    this.router.navigate(['/search/' + type + '/' + searchText]);

      //this.dropDownText.forEach(function (val) {
      //    val.selected = false;
      //});
      //text.selected = true;

      //this.search(this.searchModal.searchString);
  }

  showMorelessFields() {
    this.showMoreLessToggle = !this.showMoreLessToggle;
  }

  gotoPage(input: any) {
    if (this.searchModal.searchType == SearchType.CHARACTERITEMS || input.searchType == SearchType.RULESETCHARACTERITEMS) {
      this.router.navigate(['/character/inventory-details', input.recordId]);
    }
    else if (this.searchModal.searchType == SearchType.RULESETITEMS) {
      if (this.isCharacterRulesetEntity) {
        if (input.record.isBundle) {
          this.router.navigate(['/character/ruleset/item-detail', input.recordId]);
        }
        else {
          this.router.navigate(['/character/ruleset/item-details', input.recordId]);
        }
        
      }
      else {
        if (input.record.isBundle) {
          this.router.navigate(['/ruleset/bundle-details', input.recordId]);
        }
        else {
          this.router.navigate(['/ruleset/item-details', input.recordId]);
        }
        
      }
    }
    else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS) {
      this.router.navigate(['/character/spell-details', input.recordId]);
    }
    else if (this.searchModal.searchType == SearchType.RULESETSPELLS) {
      if (this.isCharacterRulesetEntity) {
        this.router.navigate(['/character/ruleset/spell-details', input.recordId]);
      }
      else {
        this.router.navigate(['/ruleset/spell-details', input.recordId]);
      }
    }
    else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES) {
      this.router.navigate(['/character/ability-details', input.recordId]);
    }
    else if (this.searchModal.searchType == SearchType.RULESETABILITIES) {
      if (this.isCharacterRulesetEntity) {
        this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
      }
      else {
        this.router.navigate(['/ruleset/ability-details', input.recordId]);
      }
    }
    else if (this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
      if (this.isCharacterRulesetEntity) {
        this.router.navigate(['/character/buff-effect-detail', input.recordId]);        
      } else {
        this.router.navigate(['/ruleset/buff-effect-details', input.recordId]);
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
    else if (this.searchModal.searchType == SearchType.CHARACTERLOOT) {
      if (input.record && input.record.isLootPile) {
        this.router.navigate(['/character/ruleset/loot-pile-details', input.recordId]);
      } else {
        this.router.navigate(['/character/ruleset/loot-details', input.recordId]);
      }
      //loot-pile-details
    }
  }

  //private setRulesetId(rulesetId: number) {
  //    this.localStorage.deleteData(DBkeys.RULESET_ID);
  //    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  //    // console.log(' rulesetId => ' + this.localStorage.getDataObject<number>(DBkeys.RULESET_ID));
  //}

  RedirectBack() {
    window.history.back();
  }

  GetSearchText(type): string {
    switch (+type) {
      case SearchType.CHARACTERABILITIES:
        return 'Ability';
      case SearchType.CHARACTERITEMS:
        return 'Item';
      case SearchType.CHARACTERSPELLS:
        return 'Spell';
      case SearchType.RULESETABILITIES:
        return 'Ability';
      case SearchType.RULESETITEMS:
        return 'Item Templates';
      case SearchType.RULESETSPELLS:
        return 'Spell';
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
        return 'Loot Template';
      case SearchType.CHARACTERHANDOUT:
        return 'Handouts';
      case SearchType.RULESETHANDOUT:
        return 'Handouts';
      case SearchType.RULESETCHARACTERITEMS:
        return 'Items';
      case SearchType.CHARACTERLOOT:
        return 'Loot';
      default:
        return '';
    }
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
      else if ( this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
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
      else if ( this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
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
    }
  }
  private setHeaderValues(model: any): any {
    let headerValues = model;
    this.appService.updateAccountSetting1(headerValues);
    this.sharedService.updateAccountSetting(headerValues);
    this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
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
        //console.log('founded spells', found);
        this.searchModal.abilityFilters.isAbilityName = true;
      }

    }
    else if (this.searchModal.searchType == SearchType.RULESETBUFFANDEFFECT) {
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

  }
}


