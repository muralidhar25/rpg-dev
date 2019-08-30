import { Component, OnInit, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, } from 'ngx-bootstrap';
import { DBkeys } from '../../../core/common/db-keys';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ItemsService } from '../../../core/services/items.service';
import { User } from '../../../core/models/user.model';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { CharacterSpellService } from '../../../core/services/character-spells.service';
import { CharacterAbilityService } from '../../../core/services/character-abilities.service';
import { PlatformLocation } from '@angular/common';
import { BuffAndEffectService } from '../../../core/services/buff-and-effect.service';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss']
})
export class EditorLinkComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  ruleSet: any = new Ruleset();
  limitTextSpell: string = "Show more";
  limitTextItem: string = "Show more";
  limitTextAbility: string = "Show more";
  limitTextBuffAndEffect: string = "Show more";
  selectedStatType: number = 0;
  selectedIndex: number;

  limitSpell: number = 4;
  limitItem: number = 4;
  limitAbility: number = 4;
  limitBuffAndEffect: number = 4;

  title: string;
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

  itemId: number = 0;
  spellId: number = 0;
  abilityId: number = 0;
  BuffAndEffectId: number = 0;
  itemName: string = '';
  spellName: string = '';
  abilityName: string = '';
  BuffAndEffectName: string = '';

  characterId: number;
  _linkType: any;
  query: string = '';
  linkRecordTitle: string = '';

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
    private localStorage: LocalStoreManager, private authService: AuthService, private itemsService: ItemsService,
    private characterSpellService: CharacterSpellService, private characterAbilityService: CharacterAbilityService,
    private location: PlatformLocation,
    private buffAndEffectService: BuffAndEffectService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {

      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.ruleSet = this.bsModalRef.content.ruleset;
      this._linkType = this.ruleSet.isItemEnabled ? "Item" : this.ruleSet.isSpellEnabled ? "Spell" : this.ruleSet.isAbilityEnabled ? "Ability" : "BuffAndEffect";

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
            this.items = data;
            this.isItemloaded = true;
            if (this.items.length) {
              this.items = Object.assign([], this.items.map((x) => {
                x.selected = false;
                return x;
              }));
              this.showMoreCommands('item', this.items.length, "Show more");
            }
            if (this._linkType == "Item") {
              this.isLoading = false;
            }

          }, error => {
            this.isLoading = false;
            this.isItemloaded = true;
          }, () => { });
      } else {
        this.isItemloaded = true;
      }
      // getting spell data
      if (this.ruleSet.isSpellEnabled) {
        this.characterSpellService.getCharacterSpellByCharacterId<any[]>(this.characterId)
          .subscribe(data => {
            this.spells = data;
            this.isIspellloaded = true;
            if (this.spells.length) {
              this.spells = Object.assign([], this.spells.map((x) => {
                x.selected = false;
                return x;
              }));
              this.showMoreCommands('spell', this.spells.length, "Show more");
            }
            if (this._linkType == "Spell") {
              this.isLoading = false;
            }
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
            this.abilities = data;
            this.isAbilityloaded = true;
            if (this.abilities.length) {
              this.abilities = Object.assign([], this.abilities.map((x) => {
                x.selected = false;
                return x;
              }));
              this.showMoreCommands('ability', this.abilities.length, "Show more");
            }
            if (this._linkType == "Ability") {
              this.isLoading = false;
            }
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
            this.BuffAndEffects = data;
            this.isBuffAndEffectloaded = true;
            if (this.BuffAndEffects.length) {
              this.BuffAndEffects = Object.assign([], this.BuffAndEffects.map((x) => {
                x.selected = false;
                return x;
              }));
              this.showMoreCommands('BuffAndEffect', this.BuffAndEffects.length, "Show more");
            }
            if (this._linkType == "BuffAndEffect") {
              this.isLoading = false;
            }
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
      this.itemsList = true;
      this.spellsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectList = false;
      //this.linkTileFormModal.linkType = "Item";
      this._linkType = "Item";
    }
    else if (evt == "Spells") {
      this.spellsList = true;
      this.itemsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectList = false;
      //this.linkTileFormModal.linkType = "Spell";
      this._linkType = "Spell";
    }
    else if (evt == "Abilites") {
      this.abilitiesList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.BuffAndEffectList = false;
      //this.linkTileFormModal.linkType = "Ability";
      this._linkType = "Ability";
    }
    else {
      this.BuffAndEffectList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.abilitiesList = false;
      //this.linkTileFormModal.linkType = "BuffAndEffect";
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
    console.log("Ability => ", val);
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
    console.log("Spell => ", val);
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
    console.log("B&E => ", val);
    this.itemId = null;
    this.spellId = null;
    this.abilityId = null;
  }

  submitForm() {

    if (this._linkType == "Item" && this.itemId) {
      if (this.linkRecordTitle) {
        this.event.emit('<a class="Editor_itemDetail a-hyperLink" data-Editor="' + this.itemId + '">' + this.linkRecordTitle + '</a>');
      } else {
        this.event.emit('<a class="Editor_itemDetail a-hyperLink" data-Editor="' + this.itemId + '">' + this.itemName + '</a>');
      }
    }
    if (this._linkType == "Spell" && this.spellId) {
      if (this.linkRecordTitle) {
        this.event.emit('<a class="Editor_spellDetail a-hyperLink" data-Editor="' + this.spellId + '">' + this.linkRecordTitle + '</a>');
      } else {
        this.event.emit('<a class="Editor_spellDetail a-hyperLink" data-Editor="' + this.spellId + '">' + this.spellName + '</a>');
      }
    }
    if (this._linkType == "Ability" && this.abilityId) {
      if (this.linkRecordTitle) {
        this.event.emit('<a class="Editor_abilityDetail a-hyperLink" data-Editor="' + this.abilityId + '">' + this.linkRecordTitle + '</a>');
      } else {
        this.event.emit('<a class="Editor_abilityDetail a-hyperLink" data-Editor="' + this.abilityId + '">' + this.abilityName + '</a>');
      }
    }
    if (this._linkType == "BuffAndEffect" && this.BuffAndEffectId) {
      if (this.linkRecordTitle) {
        this.event.emit('<a class="Editor_BuffAndEffectDetail a-hyperLink" data-Editor="' + this.BuffAndEffectId + '">' + this.linkRecordTitle + '</a>');
      } else {
        this.event.emit('<a class="Editor_BuffAndEffectDetail a-hyperLink" data-Editor="' + this.BuffAndEffectId + '">' + this.BuffAndEffectName + '</a>');
      }
    }

    //this.event.emit(this.linkRecordTitle + "Result");
    this.close();
  }

  close() {
    this.bsModalRef.hide();
    //this.destroyModalOnInit();
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }


}
