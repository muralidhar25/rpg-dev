import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, } from 'ngx-bootstrap';
import { AlertService } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { ItemsService } from '../../../core/services/items.service';
import { SharedService } from '../../../core/services/shared.service';
import { DBkeys } from '../../../core/common/db-keys';
import { User } from '../../../core/models/user.model';
import { BuffAndEffectService } from '../../../core/services/buff-and-effect.service';
import { ExecuteTileService } from '../../../core/services/tiles/execute-tile.service';
import { CharacterSpellService } from '../../../core/services/character-spells.service';
import { CharacterAbilityService } from '../../../core/services/character-abilities.service';
import { PlatformLocation } from '@angular/common';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';

@Component({
  selector: 'app-execute',
  templateUrl: './execute.component.html',
  styleUrls: ['./execute.component.scss']
})
export class EditorExecuteComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  ruleSet: any = new Ruleset();
  limitTextSpell: string = "Show more";
  limitTextItem: string = "Show more";
  limitTextAbility: string = "Show more";
  limitTextBuffAndEffect: string = "Show more";
  limitSpell: number = 4;
  limitItem: number = 4;
  limitAbility: number = 4;
  limitBuffAndEffect: number = 4;

  color: any;
  tileColor: any;
  shapeClass: string;
  isLoading: boolean = false;
  isItemloaded: boolean = false;
  isIspellloaded: boolean = false;
  isAbilityloaded: boolean = false;
  isBuffAndEffectloaded: boolean = false;
  items: any;
  spells: any;
  abilities: any;
  BuffAndEffects: any;
  spellsList: boolean = true;
  itemsList: boolean;
  abilitiesList: boolean;
  BuffAndEffectList: boolean;
  selectedColor: string;
  rangeValue: number;

  itemId: number = 0;
  spellId: number = 0;
  abilityId: number = 0;
  BuffAndEffectId: number = 0;
  itemName: string = '';
  spellName: string = '';
  abilityName: string = '';
  BuffAndEffectName: string = '';

  title: string;
  pageId: number;
  characterId: number;
  _linkType: any;
  showTitle: boolean = true;
  query: string = '';
  showMoreLessColorText: string = "Advanced";
  showMoreLessColorToggle: boolean = true;
  defaultColorList: any = [];
  showDemo: boolean = false;
  tile: number;
  selectedStatType: number = 0;
  selectedIndex: number;
  displayboth: boolean = false;
  displayLinkImage: boolean = true;
  executeRecordTitle: string='';


  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
    public localStorage: LocalStoreManager, private authService: AuthService, private sharedService: SharedService,
    private itemsService: ItemsService, private characterSpellService: CharacterSpellService, private characterAbilityService: CharacterAbilityService,
    private executeTileService: ExecuteTileService, private alertService: AlertService, private location: PlatformLocation,
    private buffAndEffectService: BuffAndEffectService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {

      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.ruleSet = this.bsModalRef.content.ruleset;

      this._linkType = this.ruleSet.isItemEnabled ? "Item" : this.ruleSet.isSpellEnabled ? "Spell" : this.ruleSet.isAbilityEnabled ? "Ability" : "BuffAndEffect";

      //this.setPropertyType(this.executeTileFormModal.spellId ? 'spell' : this.executeTileFormModal.abilityId ? 'ability' : this.executeTileFormModal.itemId ? 'item' : 'spell');

      if (this.showTitle && this.displayLinkImage) {
        this.displayboth = true;
      }
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
      debugger
      if (this.ruleSet.isItemEnabled) {
        this.itemsService.getItemByCharacterId<any[]>(this.characterId)
          .subscribe(data => {
            this.isItemloaded = true;
            this.items = data.filter(function (val) { return val.command; });
            if (this.items.length) {
              this.items = Object.assign([], this.items.map((x) => {
                x.selected = false;
                return x;
              }));
              this.showMoreCommands('item', this.items.length, "Show more");
            }
            //console.log(this.items);
            if (this._linkType == "Item")
              this.isLoading = false;

          }, error => {
            this.isLoading = false;
            this.isItemloaded = true;
          }, () => { });
      }
      else {
        this.isItemloaded = true;
      }
      // getting spell data
      if (this.ruleSet.isSpellEnabled) {
        this.characterSpellService.getCharacterSpellByCharacterId<any[]>(this.characterId)
          .subscribe(data => {
            this.isIspellloaded = true;
            this.spells = data.filter(function (val) { return val.spell.command; });
            if (this.spells.length) {
              this.spells = Object.assign([], this.spells.map((x) => {
                x.selected = false;
                return x;
              }));
              this.showMoreCommands('spell', this.spells.length, "Show more");
            }
            //console.log(this.spells);
            if (this._linkType == "Spell")
              this.isLoading = false;

          }, error => {
            this.isLoading = false;
            this.isIspellloaded = true;
          }, () => { });
      }
      else {
        this.isIspellloaded = true;
      }
      if (this.ruleSet.isAbilityEnabled) {
        this.characterAbilityService.getCharacterAbilityByCharacterId<any[]>(this.characterId)
          .subscribe(data => {
            this.isAbilityloaded = true;
            this.abilities = data.filter(function (val) { return val.ability.command; });
            if (this.abilities.length) {
              this.abilities = Object.assign([], this.abilities.map((x) => {
                x.selected = false;
                return x;
              }));
              this.showMoreCommands('ability', this.abilities.length, "Show more");
            }
            if (this._linkType == "Ability")
              this.isLoading = false;

          }, error => {
            this.isLoading = false;
            this.isAbilityloaded = true;
          }, () => { });
      } else {
        this.isAbilityloaded = true;
      }
      if (this.ruleSet.isBuffAndEffectEnabled) {
        this.buffAndEffectService.getBuffAndEffectAssignedToCharacter<any[]>(this.characterId)
          .subscribe(data => {
            this.isBuffAndEffectloaded = true;
            this.BuffAndEffects = data.filter(function (val) { return val.command; });
            if (this.BuffAndEffects.length) {
              this.BuffAndEffects = Object.assign([], this.BuffAndEffects.map((x) => {
                x.selected = false;
                return x;
              }));
              this.showMoreCommands('BuffAndEffect', this.BuffAndEffects.length, "Show more");
            }
            if (this._linkType == "BuffAndEffect")
              this.isLoading = false;

          }, error => {
            this.isLoading = false;
            this.isBuffAndEffectloaded = true;
          }, () => { });
      } else {
        this.isBuffAndEffectloaded = true;
      }

    }
  }
  showMoreCommands(fieldName: any, _limit: number, _limitText: string) {
    //console.log(fieldName);
    if (fieldName == 'spell') {
      if (_limitText == "Show more") {
        this.limitTextSpell = "Show less";
        this.limitSpell = _limit;
      } else {
        this.limitTextSpell = "Show more";
        this.limitSpell = 4;
      }
    }
    else if (fieldName == 'item') {
      if (_limitText == "Show more") {
        this.limitTextItem = "Show less";
        this.limitItem = _limit;
      } else {
        this.limitTextItem = "Show more";
        this.limitItem = 4;
      }
    }
    else if (fieldName == 'ability') {
      if (_limitText == "Show more") {
        this.limitTextAbility = "Show less";
        this.limitAbility = _limit;
      } else {
        this.limitTextAbility = "Show more";
        this.limitAbility = 4;
      }
    }
    else if (fieldName == 'BuffAndEffect') {
      if (_limitText == "Show more") {
        this.limitTextBuffAndEffect = "Show less";
        this.limitBuffAndEffect = _limit;
      } else {
        this.limitTextBuffAndEffect = "Show more";
        this.limitBuffAndEffect = 4;
      }
    }
  }

  showProperty(evt) {
    if (evt == "Items") {
      this.setPropertyType('item');
    }
    else if (evt == "Spells") {
      this.setPropertyType('spell');
    }
    else if (evt == "Abilites") {
      this.setPropertyType('ability');
    }
    else if (evt == "BuffAndEffects") {
      this.setPropertyType('BuffAndEffects');
    }
  }

  setPropertyType(type: string) {

    if (type.toLowerCase() == "item") {
      this.itemsList = true;
      this.spellsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectList = false;
      //this.executeTileFormModal.linkType = "Item";
      this._linkType = "Item";
    }
    else if (type == "spell") {
      this.spellsList = true;
      this.itemsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectList = false;
      //this.executeTileFormModal.linkType = "Spell";
      this._linkType = "Spell";
    }
    else if (type == "ability") {
      this.abilitiesList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.BuffAndEffectList = false;
      //this.executeTileFormModal.linkType = "Ability";
      this._linkType = "Ability";
    }
    else if (type == "BuffAndEffects") {
      this.BuffAndEffectList = true;
      this.abilitiesList = false;
      this.itemsList = false;
      this.spellsList = false;
      //this.executeTileFormModal.linkType = "BuffAndEffect";
      this._linkType = "BuffAndEffect";
    }
  }

  getItemValue(val: any) {
    this.itemId = val.itemId;
    this.itemName = val.name;
    this.items.map(x => {
      if (x.itemId == val.itemId) {
        x.selected = true;
      } else {
        x.selected = false;
      }
    });
    console.log("Item => ", val);
    this.abilityId = null;
    this.spellId = null;
    this.BuffAndEffectId = null;
  }

  getAbilityValue(val: any) {
    this.abilityId = val.characterAbilityId;
    this.abilityName = val.ability.name;
    this.abilities.map(x => {
      if (x.characterAbilityId == val.characterAbilityId) {
        x.selected = true;
      } else {
        x.selected = false;
      }
    });
    this.itemId = null;
    this.spellId = null;
    this.BuffAndEffectId = null;
  }

  getSpellValue(val: any) {
    this.spellId = val.characterSpellId;
    this.spellName = val.spell.name;
    this.spells.map(x => {
      if (x.characterSpellId == val.characterSpellId) {
        x.selected = true;
      } else {
        x.selected = false;
      }
    });
    this.abilityId = null;
    this.itemId = null;
    this.BuffAndEffectId = null;
  }
  getBuffAndEffectValue(val: any) {
    this.BuffAndEffectId = val.characterBuffAndEffectId;
    this.BuffAndEffectName = val.name;
    this.BuffAndEffects.map(x => {
      if (x.characterBuffAndEffectId == val.characterBuffAndEffectId) {
        x.selected = true;
      } else {
        x.selected = false;
      }
    });
    this.itemId = null;
    this.spellId = null;
    this.abilityId = null;
  }

  submitForm() {
    if (this._linkType == "Item" && this.itemId) {
      if (this.executeRecordTitle) {
        this.event.emit('<a class="Editor_itemDetailExe a-hyperLink" data-Editor="' + this.itemId + '">' + this.executeRecordTitle + '</a>');
      } else {
        this.event.emit('<a class="Editor_itemDetailExe a-hyperLink" data-Editor="' + this.itemId + '">' + this.itemName + '</a>');
      }
    }
    if (this._linkType == "Spell" && this.spellId) {
      if (this.executeRecordTitle) {
        this.event.emit('<a class="Editor_spellDetailExe a-hyperLink" data-Editor="' + this.spellId + '">' + this.executeRecordTitle + '</a>');
      } else {
        this.event.emit('<a class="Editor_spellDetailExe a-hyperLink" data-Editor="' + this.spellId + '">' + this.spellName + '</a>');
      }
    }
    if (this._linkType == "Ability" && this.abilityId) {
      if (this.executeRecordTitle) {
        this.event.emit('<a class="Editor_abilityDetailExe a-hyperLink" data-Editor="' + this.abilityId + '">' + this.executeRecordTitle + '</a>');
      } else {
        this.event.emit('<a class="Editor_abilityDetailExe a-hyperLink" data-Editor="' + this.abilityId + '">' + this.abilityName + '</a>');
      }
    }
    if (this._linkType == "BuffAndEffect" && this.BuffAndEffectId) {
      if (this.executeRecordTitle) {
        this.event.emit('<a class="Editor_BuffAndEffectDetailExe a-hyperLink" data-Editor="' + this.BuffAndEffectId + '">' + this.executeRecordTitle + '</a>');
      } else {
        this.event.emit('<a class="Editor_BuffAndEffectDetailExe a-hyperLink" data-Editor="' + this.BuffAndEffectId + '">' + this.BuffAndEffectName + '</a>');
      }
    }

    this.close();
  }


  close() {
    this.bsModalRef.hide();
    //this.destroyModalOnInit()
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }


}
