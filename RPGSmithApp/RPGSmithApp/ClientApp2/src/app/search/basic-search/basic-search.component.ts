import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { ConfigurationService } from '../../core/common/configuration.service';
import { SearchService } from '../../core/services/search.service';
import { BasicSearch } from '../../core/models/search.model';
import { HeaderValues } from '../../core/models/headers.model';
import { SearchType } from '../../core/models/enums';
import { AlertService } from '../../core/common/alert.service';
import { SharedService } from '../../core/services/shared.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AuthService } from '../../core/auth/auth.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';

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
  allFiltersSelected: boolean = true;
  showMoreLessToggle: boolean = true;
  searchModal: BasicSearch = new BasicSearch();

  headers: HeaderValues = new HeaderValues();
  SEARCHTYPE = SearchType;
  constructor(private searchService: SearchService, private router: Router, private alertService: AlertService, private sharedService: SharedService,
    private configurations: ConfigurationService, private route: ActivatedRoute, private modalService: BsModalService,
    private localStorage: LocalStoreManager, private authService: AuthService) { }

  ngOnInit() {
    this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    this.Initialize();
  }

  private Initialize() {

    this.route.params.subscribe(params => {
      this.searchModal.searchType = params['searchType'];
      this.searchModal.searchString = params['searchText'];
    });

    this.dropDownText = [
      { value: 1, text: 'Everything', selected: false },
      { value: 2, text: 'Character', selected: true },
      { value: 3, text: 'Rulesets', selected: false },
      { value: 4, text: 'Items', selected: false },
      { value: 5, text: 'Spells', selected: false },
      { value: 6, text: 'Abilities', selected: false },
      { value: 7, text: 'Character Stat', selected: false },
      { value: 8, text: 'Tiles', selected: false },
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

    this.search(this.searchModal.searchString);
  }

  search(query: string) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
    }
    else {
      this.searchList = [];
      this.isLoading = true;

      this.searchService.searchRecords<any>(this.searchModal)
        .subscribe(data => {
          if (data.length > 0) {
            if (this.searchModal.searchType == SearchType.CHARACTERITEMS) {
              this.searchModal.searchHeadingText = 'Items';
              this.searchList = data.map(x => {
                return {
                  searchimage: x.itemImage,
                  name: x.name,
                  searchType: this.searchModal.searchType,
                 // searchHeadingText: 'Items',
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
                  //searchHeadingText: 'Items',
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
                 // searchHeadingText: 'Spells',
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
                  //searchHeadingText: 'Spells',
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

          }

          this.isLoading = false;
        },
          error => { }, () => { });
    }
  }

  //setText(text) {
  //    this.defaultText = text.text;
  //    this.dropDownText.forEach(function (val) {
  //        val.selected = false;
  //    });
  //    text.selected = true;

  //    this.search(this.searchModal.searchString);
  //}

  showMorelessFields() {
    this.showMoreLessToggle = !this.showMoreLessToggle;
  }

  gotoPage(input: any) {
    if (this.searchModal.searchType == SearchType.CHARACTERITEMS) {
      this.router.navigate(['/character/inventory-details', input.recordId]);
    }
    else if (this.searchModal.searchType == SearchType.RULESETITEMS) {
      this.router.navigate(['/ruleset/item-details', input.recordId]);
    }
    else if (this.searchModal.searchType == SearchType.CHARACTERSPELLS) {
      this.router.navigate(['/character/spell-details', input.recordId]);
    }
    else if (this.searchModal.searchType == SearchType.RULESETSPELLS) {
      this.router.navigate(['/ruleset/spell-details', input.recordId]);
    }
    else if (this.searchModal.searchType == SearchType.CHARACTERABILITIES) {
      this.router.navigate(['/character/ability-details', input.recordId]);
    }
    else if (this.searchModal.searchType == SearchType.RULESETABILITIES) {
      this.router.navigate(['/ruleset/ability-details', input.recordId]);
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
        return 'Item';
      case SearchType.RULESETSPELLS:
        return 'Spell';

      default:
        return '';
    }
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
    }
  }
}
