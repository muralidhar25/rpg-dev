import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../core/services/search.service';
import { Search } from '../../core/models/search.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { ConfigurationService } from '../../core/common/configuration.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { BsModalService } from 'ngx-bootstrap';
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

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
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
  searchModal: BasicSearch = new BasicSearch();
  headers: HeaderValues = new HeaderValues();
  character: Characters = new Characters();
  SEARCHTYPE = SearchType;
  everthing: number = -1;
  showMoreLessToggle: boolean = true;
  allFiltersSelected: boolean = false;
  isCharacterRulesetEntity: boolean = false;

  constructor(private searchService: SearchService, private router: Router, private alertService: AlertService, private sharedService: SharedService,
    private configurations: ConfigurationService, private route: ActivatedRoute, private modalService: BsModalService, private rulesetService: RulesetService,
    private localStorage: LocalStoreManager, private authService: AuthService, private charactersService: CharactersService, public appService: AppService1) {
   
    this.route.params.subscribe(params => {
      this.searchModal.searchString = params['searchText'];
      this.searchModal.searchType = params.searchType;
      this.defaultText = this.setDefaulttext(this.searchModal.searchType);
      if (this.searchModal.searchString) {
        this.searchModal.searchString = decodeURIComponent(this.searchModal.searchString)
      }
      this.Initialize(this.searchModal.searchType);
    });
  
  }

  ngOnInit() { }

  private Initialize( searchType) {
    
    this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (this.headers) {
      if (this.headers.headerId && this.headers.headerLink == 'character') {
        this.isLoading = true;
          this.characterId = this.headers.headerId;
          this.searchModal.characterID = this.characterId;
          this.charactersService.getCharactersById<any>(this.characterId)
          .subscribe(data => {
            this.character = data;
            this.searchModal.rulesetID = this.character.ruleSet.ruleSetId;
              this.dropDownText = [
                { value: 1, text: 'Everything', type: SearchType.EVERYTHING, selected: searchType == SearchType.EVERYTHING ? true:false, imageurl: '' },
                { value: 2, text: 'Inventory', type: SearchType.CHARACTERITEMS, selected: searchType == SearchType.CHARACTERITEMS ? true : false, imageurl: this.character.imageUrl },
                { value: 3, text: 'Spells', type: SearchType.CHARACTERSPELLS, selected: searchType == SearchType.CHARACTERSPELLS ? true : false, imageurl: this.character.imageUrl },
                { value: 4, text: 'Abilities', type: SearchType.CHARACTERABILITIES, selected: searchType == SearchType.CHARACTERABILITIES ? true : false, imageurl: this.character.imageUrl },
                { value: 5, text: 'Items', type: SearchType.RULESETITEMS, selected: searchType == SearchType.RULESETITEMS ? true : false, imageurl: this.character.ruleSet.imageUrl },
                { value: 6, text: 'Spells', type: SearchType.RULESETSPELLS, selected: searchType == SearchType.RULESETSPELLS ? true : false, imageurl: this.character.ruleSet.imageUrl },
                { value: 7, text: 'Abilities', type: SearchType.RULESETABILITIES, selected: searchType == SearchType.RULESETABILITIES ? true : false, imageurl: this.character.ruleSet.imageUrl }
              ];
              
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

  }
 
  

  search(query: any, isSearched :boolean = false) {
    
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

      this.searchService.searchRecords<any>(this.searchModal)
        .subscribe(data => {
          if (data && data.length > 0) {
            this.showMoreLessToggle = true;
            if (this.searchModal.searchType == SearchType.EVERYTHING) {
              this.searchModal.searchHeadingText = 'Everything';
              this.searchList = data.map(x => {
               
                let records = '';
                switch (x.recordType) {
                  case  SearchType.RULESETITEMS:
                    records = x.rulesetItem;
                    break;
                  case   SearchType.CHARACTERITEMS:
                    records =  x.characterItem;
                    break;
                  case   SearchType.RULESETSPELLS:
                    records = x.rulesetSpell;
                    break;
                  case  SearchType.CHARACTERSPELLS:
                    records = x.characterSpell;
                    break;
                  case  SearchType.RULESETABILITIES:
                    records =  x.rulesetAbility;
                    break;
                  case  SearchType.CHARACTERABILITIES:
                    records =  x.characterAbility;
                    break;
                  default:
                    records =  x ;
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
            else if (this.searchModal.searchType == SearchType.CHARACTERITEMS) {
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
            } else if (this.searchModal.searchType == SearchType.RULESETITEMS) {
             
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
            } else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS) {
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
            } else if (this.searchModal.searchType == SearchType.RULESETSPELLS) {
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
            } else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES) {
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
            } else if (this.searchModal.searchType == SearchType.RULESETABILITIES) {
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

    } else {
      this.searchModal.searchType = text.type;
    }
    text.selected = true;
    this.router.navigate(['/search/' + this.searchModal.searchType + '/' + searchedtext]);
    this.Initialize(this.searchModal.searchType);
   
  }

  gotoPage(input: any) {
    if (this.searchModal.searchType == SearchType.EVERYTHING) {
        if ( input.searchType == SearchType.CHARACTERITEMS) {
          this.router.navigate(['/character/inventory-details', input.recordId]);
        }
        else if (input.searchType == SearchType.RULESETITEMS) {
          if (input.record.isBundle) {
            this.router.navigate(['/character/ruleset/item-detail', input.recordId]);
          }
          else {
            this.router.navigate(['/character/ruleset/item-details', input.recordId]);
          }
          
        }
        else if (input.searchType == SearchType.CHARACTERSPELLS) {
          this.router.navigate(['/character/spell-details', input.recordId]);
        }
        else if (input.searchType == SearchType.RULESETSPELLS) {
          this.router.navigate(['/character/ruleset/spell-details', input.recordId]);
        }
        else if (input.searchType == SearchType.CHARACTERABILITIES) {
          this.router.navigate(['/character/ability-details', input.recordId]);
        }
        else if (input.searchType == SearchType.RULESETABILITIES) {
          this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
        }
    } else {
      if (this.searchModal.searchType == SearchType.CHARACTERITEMS) {
        //console.log(this.searchModal.searchType);
        this.router.navigate(['/character/inventory-details', input.recordId]);
      } else if (this.searchModal.searchType == SearchType.RULESETITEMS) {
        if (input.record.isBundle) {
          this.router.navigate(['/character/ruleset/item-detail', input.recordId]);
        }
        else {
          this.router.navigate(['/character/ruleset/item-details', input.recordId]);
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
        this.router.navigate(['/character/ruleset/spell-details', input.recordId]);
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
        this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
        //if (this.isCharacterRulesetEntity) {
        //  this.router.navigate(['/character/ruleset/ability-details', input.recordId]);
        //}
        //else {
        //  this.router.navigate(['/ruleset/ability-details', input.recordId]);
        //}
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
      if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS) {
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
    }
    else {
      this.allFiltersSelected = true;
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
      else if (this.searchModal.searchType == SearchType.EVERYTHING) {
        this.searchModal.everythingFilters.isEverythingDesc = true;
        this.searchModal.everythingFilters.isEverythingTags = true;
        this.searchModal.everythingFilters.isEverythingName = true;
        this.searchModal.everythingFilters.isEverythingStats = true;

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
        return 'Items';
      case SearchType.RULESETSPELLS:
        return 'Spells';


      default:
        return 'Everything';
    }
  }

  checkFilters() {
    if (this.searchModal.searchType == SearchType.CHARACTERITEMS || this.searchModal.searchType == SearchType.RULESETITEMS) {
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


}
