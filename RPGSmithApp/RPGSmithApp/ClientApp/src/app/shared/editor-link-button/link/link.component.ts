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
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { SpellsService } from '../../../core/services/spells.service';
import { AbilityService } from '../../../core/services/ability.service';

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
  limitTextItemTemplate: string = "Show more";
  limitTextMonsterTemplate: string = "Show more";
  limitTextMonster: string = "Show more";
  selectedStatType: number = 0;
  selectedIndex: number;

  limitSpell: number = 4;
  limitItem: number = 4;
  limitAbility: number = 4;
  limitBuffAndEffect: number = 4;
  limitItemTemplate: number = 4;
  limitMonsterTemplate: number = 4;
  limitMonster: number = 4;

  title: string;
  isLoading: boolean = false;
  isItemloaded: boolean = false;
  isIspellloaded: boolean = false;
  isAbilityloaded: boolean = false;
  isBuffAndEffectloaded: boolean = false;
  isItemTemplateloaded: boolean = false;
  isMonsterTemplateloaded: boolean = false;
  isMonsterloaded: boolean = false;
  items: any;
  spells: any;
  abilities: any;
  BuffAndEffects: any;
  ItemTemplates: any;
  MonsterTemplates: any;
  Monsters: any;
  spellsList: boolean = true;
  itemsList: boolean;
  abilitiesList: boolean;
  BuffAndEffectList: boolean;
  ItemTemplateList: boolean;
  MonsterTemplateList: boolean;
  MonsterList: boolean;

  itemId: number = 0;
  spellId: number = 0;
  abilityId: number = 0;
  BuffAndEffectId: number = 0;
  ItemTemplateId: number = 0;
  MonsterTemplateId: number = 0;
  MonsterId: number = 0;
  itemName: string = '';
  spellName: string = '';
  abilityName: string = '';
  BuffAndEffectName: string = '';
  ItemTemplateName: string = '';
  MonsterTemplateName: string = '';
  MonsterName: string = '';

  characterId: number;
  _linkType: any;
  query: string = '';
  linkRecordTitle: string = '';
  selectedItemsList: any[] = [];
  selectedSpellsList: any[] = [];
  selectedAbilitiesList: any[] = [];
  selectedBuffAndEffectsList: any[] = [];
  selectedItemTemplatesList: any[] = [];
  selectedMonsterTemplatesList: any[] = [];
  selectedMonstersList: any[] = [];

  IsRulesetLevel: boolean = false;
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
    private localStorage: LocalStoreManager, private authService: AuthService, private itemsService: ItemsService,
    private characterSpellService: CharacterSpellService, private characterAbilityService: CharacterAbilityService,
    private SpellService: SpellsService, private AbilityService: AbilityService,
    private location: PlatformLocation, private monsterService: MonsterTemplateService, private itemMasterService: ItemMasterService,
    private buffAndEffectService: BuffAndEffectService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.IsRulesetLevel = this.bsModalRef.content.isRulesetLevel ? this.bsModalRef.content.isRulesetLevel : false;
      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.ruleSet = this.bsModalRef.content.ruleset;
      this._linkType = this.ruleSet.isItemEnabled ? (this.IsRulesetLevel ? "ItemTemplate" : "Item") : this.ruleSet.isSpellEnabled ? "Spell" : this.ruleSet.isAbilityEnabled ? "Ability" : "BuffAndEffect";
      if (this.IsRulesetLevel) {
        this.isItemloaded = true;
      }
      else {
        this.isItemTemplateloaded = true;
        this.isMonsterloaded = true;
        this.isMonsterTemplateloaded = true;
      }
      this.initialize();
      try {
        document.getElementsByClassName('modal-md modal-with-max-zindex')[0].parentElement.style.zIndex = '99999999999';
      } catch (e) {

      }
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      // getting items data

      if (this.IsRulesetLevel) {
        // getting spell data
        if (this.ruleSet.isSpellEnabled) {
          this.SpellService.getspellsByRuleset_add<any[]>(this.ruleSet.ruleSetId)
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
          this.isLoading = false;
          this.isIspellloaded = true;
        }
        if (this.ruleSet.isAbilityEnabled) {
          this.AbilityService.getAbilityByRuleset_add<any[]>(this.ruleSet.ruleSetId)
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
          this.isLoading = false;
          this.isAbilityloaded = true;
        }
        if (this.ruleSet.isBuffAndEffectEnabled) {
          this.buffAndEffectService.getBuffAndEffectByRuleset_add<any[]>(this.ruleSet.ruleSetId)
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
          this.isLoading = false;
          this.isBuffAndEffectloaded = true;
        }

        if (this.ruleSet.isItemEnabled) { //ruleset item templates
          this.itemMasterService.getItemMasterByRuleset_add<any[]>(this.ruleSet.ruleSetId, true, false)
            .subscribe((data: any) => {
              if (data) {
                this.ItemTemplates = data.ItemMaster;
                this.isItemTemplateloaded = true;
                if (this.ItemTemplates.length) {
                  this.ItemTemplates = Object.assign([], this.ItemTemplates.map((x) => {
                    x.selected = false;
                    return x;
                  }));
                  this.showMoreCommands('ItemTemplate', this.ItemTemplates.length, "Show more");
                }
                if (this._linkType == "ItemTemplate") {
                  this.isLoading = false;
                }
              } else {
                this.isItemTemplateloaded = true;
              }


            }, error => {
              this.isLoading = false;
              this.isItemTemplateloaded = true;
            }, () => { });
        } else {
          this.isLoading = false;
          this.isItemTemplateloaded = true;
        }

        this.monsterService.getMonsterTemplateByRuleset_add<any[]>(this.ruleSet.ruleSetId, true)
          .subscribe((data: any) => {
            this.MonsterTemplates = data.MonsterTemplate;
            if (data) {
              this.isMonsterTemplateloaded = true;
              if (this.MonsterTemplates.length) {
                this.MonsterTemplates = Object.assign([], this.MonsterTemplates.map((x) => {
                  x.selected = false;
                  return x;
                }));
                this.showMoreCommands('MonsterTemplate', this.MonsterTemplates.length, "Show more");
              }
              if (this._linkType == "MonsterTemplate") {
                this.isLoading = false;
              }
            }
            else {
              this.isLoading = false;
              this.isMonsterTemplateloaded = true;
            }

          }, error => {
            this.isLoading = false;
            this.isMonsterTemplateloaded = true;
          }, () => { });

        this.monsterService.getMonsterByRuleset_spWithPagination<any[]>(this.ruleSet.ruleSetId, 1, 2000, 1)
          .subscribe((data: any) => {
            if (data) {
              this.Monsters = data.monsters;
              this.isMonsterloaded = true;
              if (this.Monsters.length) {
                this.Monsters = Object.assign([], this.Monsters.map((x) => {
                  x.selected = false;
                  return x;
                }));
                this.showMoreCommands('Monster', this.Monsters.length, "Show more");
              }
              if (this._linkType == "Monster") {
                this.isLoading = false;
              }
            }

            else {
              this.isLoading = false;
              this.isMonsterloaded = true;
            }
          }, error => {
            this.isLoading = false;
            this.isMonsterloaded = true;
          }, () => { });



      }
      else {
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
          this.isLoading = false;
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
          this.isLoading = false;
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
          this.isLoading = false;
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
          this.isLoading = false;
          this.isBuffAndEffectloaded = true;
        }
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
    else if (fieldName == 'ItemTemplate') {
      if (_limitText == "Show more") {
        this.limitTextItemTemplate = "Show less";
        this.limitItemTemplate = _limit;
      } else {
        this.limitTextItemTemplate = "Show more";
        this.limitItemTemplate = 4;
      }
    }
    else if (fieldName == 'MonsterTemplate') {
      if (_limitText == "Show more") {
        this.limitTextMonsterTemplate = "Show less";
        this.limitMonsterTemplate = _limit;
      } else {
        this.limitTextMonsterTemplate = "Show more";
        this.limitMonsterTemplate = 4;
      }
    }
    else if (fieldName == 'Monster') {
      if (_limitText == "Show more") {
        this.limitTextMonster = "Show less";
        this.limitMonster = _limit;
      } else {
        this.limitTextMonster = "Show more";
        this.limitMonster = 4;
      }
    }
  }
  showProperty(evt) {
    if (this.items) {
      this.items.map(x => {
        x.selected = false;
      });
    }
    if (this.abilities) {
      this.abilities.map(x => {
        x.selected = false;
      });
    }
    if (this.spells) {
      this.spells.map(x => {
        x.selected = false;
      });
    }
    if (this.BuffAndEffects) {
      this.BuffAndEffects.map(x => {
        x.selected = false;
      });
    }
    if (this.ItemTemplates) {
      this.ItemTemplates.map(x => {
        x.selected = false;
      });
    }
    if (this.MonsterTemplates) {
      this.MonsterTemplates.map(x => {
        x.selected = false;
      });
    }
    if (this.Monsters) {
      this.Monsters.map(x => {
        x.selected = false;
      });
    }
    if (evt == "Items") {
      this.itemsList = true;
      this.spellsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectList = false;
      this.ItemTemplateList = false;
      this.MonsterTemplateList = false;
      this.MonsterList = false;
      //this.linkTileFormModal.linkType = "Item";
      this._linkType = "Item";
    }
    else if (evt == "Spells") {
      this.spellsList = true;
      this.itemsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectList = false;
      this.ItemTemplateList = false;
      this.MonsterTemplateList = false;
      this.MonsterList = false;
      //this.linkTileFormModal.linkType = "Spell";
      this._linkType = "Spell";
    }
    else if (evt == "Abilites") {
      this.abilitiesList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.BuffAndEffectList = false;
      this.ItemTemplateList = false;
      this.MonsterTemplateList = false;
      this.MonsterList = false;
      //this.linkTileFormModal.linkType = "Ability";
      this._linkType = "Ability";
    }
    else if (evt == "BuffAndEffects") {
      this.BuffAndEffectList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.abilitiesList = false;
      this.ItemTemplateList = false;
      this.MonsterTemplateList = false;
      this.MonsterList = false;
      //this.linkTileFormModal.linkType = "BuffAndEffect";
      this._linkType = "BuffAndEffect";
    }
    else if (evt == "ItemTemplates") {
      this.ItemTemplateList = true;
      this.BuffAndEffectList = false;
      this.itemsList = false;
      this.spellsList = false;
      this.abilitiesList = false;
      this.MonsterTemplateList = false;
      this.MonsterList = false;
      //this.linkTileFormModal.linkType = "BuffAndEffect";
      this._linkType = "ItemTemplate";
    }
    else if (evt == "MonsterTemplates") {
      this.MonsterTemplateList = true;
      this.BuffAndEffectList = false;
      this.itemsList = false;
      this.spellsList = false;
      this.abilitiesList = false;
      this.ItemTemplateList = false;

      this.MonsterList = false;
      //this.linkTileFormModal.linkType = "BuffAndEffect";
      this._linkType = "MonsterTemplate";
    }
    else if (evt == "Monsters") {
      this.MonsterList = true;
      this.BuffAndEffectList = false;
      this.itemsList = false;
      this.spellsList = false;
      this.abilitiesList = false;
      this.ItemTemplateList = false;
      this.MonsterTemplateList = false;

      //this.linkTileFormModal.linkType = "BuffAndEffect";
      this._linkType = "Monster";
    }
  }

  getItemValue(event: any, val: any) {
    this.itemId = val.itemId;
    this.itemName = val.name;
    this.items.map(x => {
      if (x.itemId == val.itemId) {
        x.selected = event.target.checked;
        x.itemName = x.name;
      }
    });
    //console.log("Item => ", val);
    this.abilityId = null;
    this.spellId = null;
    this.BuffAndEffectId = null;
    this.ItemTemplateId = null;
    this.MonsterTemplateId = null;
    this.MonsterId = null;
  }

  getAbilityValue(event: any, val: any) {
    if (this.IsRulesetLevel) {
      this.abilityId = val.abilityId;
      this.abilityName = val.name;
      this.abilities.map(x => {
        if (x.abilityId == val.abilityId) {
          x.selected = event.target.checked;
          x.abilityName = x.name;
        }
      });
    }
    else {
      this.abilityId = val.characterAbilityId;
      this.abilityName = val.ability.name;
      this.abilities.map(x => {
        if (x.characterAbilityId == val.characterAbilityId) {
          x.selected = event.target.checked;
          x.abilityName = x.ability.name;
          x.abilityId = x.characterAbilityId;
        }
      });
    }

    //console.log("Ability => ", val);
    this.itemId = null;
    this.spellId = null;
    this.BuffAndEffectId = null;
    this.ItemTemplateId = null;
    this.MonsterTemplateId = null;
    this.MonsterId = null;
  }

  getSpellValue(event: any, val: any) {
    if (this.IsRulesetLevel) {
      this.spellId = val.spellId;
      this.spellName = val.name;
      this.spells.map(x => {
        if (x.spellId == val.spellId) {
          x.selected = event.target.checked;
          x.spellName = x.name;
        }
      });
    }
    else {
      this.spellId = val.characterSpellId;
      this.spellName = val.spell.name;
      this.spells.map(x => {
        if (x.characterSpellId == val.characterSpellId) {
          x.selected = event.target.checked;
          x.spellName = x.spell.name;
          x.spellId = x.characterSpellId;
        }
      });
    }

    //console.log("Spell => ", val);
    this.abilityId = null;
    this.itemId = null;
    this.BuffAndEffectId = null;
    this.ItemTemplateId = null;
    this.MonsterTemplateId = null;
    this.MonsterId = null;
  }
  getBuffAndEffectValue(event: any, val: any) {
    if (this.IsRulesetLevel) {
      this.BuffAndEffectId = val.buffAndEffectId;
      this.BuffAndEffectName = val.name;
      this.BuffAndEffects.map(x => {
        if (x.buffAndEffectId == val.buffAndEffectId) {
          x.selected = event.target.checked;
          x.BuffAndEffectName = x.name;
        }
      });
    }
    else {
      this.BuffAndEffectId = val.characterBuffAndEffectId;
      this.BuffAndEffectName = val.name;
      this.BuffAndEffects.map(x => {
        if (x.characterBuffAndEffectId == val.characterBuffAndEffectId) {
          x.selected = event.target.checked;
          x.BuffAndEffectName = x.name;
          x.buffAndEffectId = x.characterBuffAndEffectId;
        }
      });
    }

    //console.log("B&E => ", val);
    this.itemId = null;
    this.spellId = null;
    this.abilityId = null;
    this.ItemTemplateId = null;
    this.MonsterTemplateId = null;
    this.MonsterId = null;
  }
  getItemTemplateValue(event: any, val: any) {
    this.ItemTemplateId = val.itemMasterId;
    this.ItemTemplateName = val.itemName;
    this.ItemTemplates.map(x => {
      if (x.itemMasterId == val.itemMasterId) {
        x.selected = event.target.checked;
        x.ItemTemplateName = x.itemName;
      }
    });
    this.itemId = null;
    this.spellId = null;
    this.abilityId = null;
    this.BuffAndEffectId = null;
    this.MonsterTemplateId = null;
    this.MonsterId = null;
  }
  getMonsterTemplateValue(event: any, val: any) {
    this.MonsterTemplateId = val.monsterTemplateId;
    this.MonsterTemplateName = val.name;
    this.MonsterTemplates.map(x => {
      if (x.monsterTemplateId == val.monsterTemplateId) {
        x.selected = event.target.checked;
        x.MonsterTemplateName = x.name;
      }
    });
    this.itemId = null;
    this.spellId = null;
    this.abilityId = null;
    this.BuffAndEffectId = null;
    this.ItemTemplateId = null;
    this.MonsterId = null;
  }
  getMonsterValue(event: any, val: any) {
    this.MonsterId = val.monsterId;
    this.MonsterName = val.name;
    this.Monsters.map(x => {
      if (x.monsterId == val.monsterId) {
        x.selected = event.target.checked;
        x.MonsterName = x.name;
      }
    });
    this.itemId = null;
    this.spellId = null;
    this.abilityId = null;
    this.BuffAndEffectId = null;
    this.ItemTemplateId = null;
    this.MonsterTemplateId = null;
  }

  submitForm() {
    if (this.IsRulesetLevel) {
      if (this._linkType == "Spell" && this.spellId) {
        this.spells.map(x => {
          if (x.spellId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedSpellsList.push({ link: '<a class="Editor_Ruleset_spellDetail a-hyperLink" data-Editor="' + x.spellId + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedSpellsList.push({ link: '<a class="Editor_Ruleset_spellDetail a-hyperLink" data-Editor="' + x.spellId + '">' + x.spellName + '</a>' });
            }

          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedSpellsList);
        } else {
          this.event.emit(this.selectedSpellsList);
        }
      }
      if (this._linkType == "Ability" && this.abilityId) {
        this.abilities.map(x => {
          if (x.abilityId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedAbilitiesList.push({ link: '<a class="Editor_Ruleset_abilityDetail a-hyperLink" data-Editor="' + x.abilityId + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedAbilitiesList.push({ link: '<a class="Editor_Ruleset_abilityDetail a-hyperLink" data-Editor="' + x.abilityId + '">' + x.abilityName + '</a>' });
            }
          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedAbilitiesList);
        } else {
          this.event.emit(this.selectedAbilitiesList);
        }
      }
      if (this._linkType == "BuffAndEffect" && this.BuffAndEffectId) {
        this.BuffAndEffects.map(x => {
          if (x.buffAndEffectId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedBuffAndEffectsList.push({ link: '<a class="Editor_Ruleset_BuffAndEffectDetail a-hyperLink" data-Editor="' + x.buffAndEffectId + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedBuffAndEffectsList.push({ link: '<a class="Editor_Ruleset_BuffAndEffectDetail a-hyperLink" data-Editor="' + x.buffAndEffectId + '">' + x.BuffAndEffectName + '</a>' });
            }
          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedBuffAndEffectsList);
        } else {
          this.event.emit(this.selectedBuffAndEffectsList);
        }
      }
      if (this._linkType == "ItemTemplate" && this.ItemTemplateId) {
        //var itemTemplaterec = this.ItemTemplates.find(it =>  it.itemMasterId == this.ItemTemplateId );
        //let isBundle = false;
        //if (itemTemplaterec && itemTemplaterec.isBundle) {
        //  isBundle = true;
        //}
        this.ItemTemplates.map(x => {
          if (x.itemMasterId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedItemTemplatesList.push({ link: '<a class="Editor_Ruleset_ItemTemplateDetail a-hyperLink" data-Editor="' + x.itemMasterId + '" data-isBundle="' + x.isBundle + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedItemTemplatesList.push({ link: '<a class="Editor_Ruleset_ItemTemplateDetail a-hyperLink" data-Editor="' + x.itemMasterId + '" data-isBundle="' + x.isBundle + '">' + x.ItemTemplateName + '</a>' });
            }
          }
        });

        if (this.linkRecordTitle) {
          this.event.emit(this.selectedItemTemplatesList);
        } else {
          this.event.emit(this.selectedItemTemplatesList);
        }
      }
      if (this._linkType == "MonsterTemplate" && this.MonsterTemplateId) {
        //var monsterTemplaterec = this.MonsterTemplates.find(it =>  it.monsterTemplateId == this.MonsterTemplateId );
        //let isBundle = false;
        //if (monsterTemplaterec && monsterTemplaterec.isBundle) {
        //  isBundle = true;
        //}
        this.MonsterTemplates.map(x => {
          if (x.monsterTemplateId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedMonsterTemplatesList.push({ link: '<a class="Editor_Ruleset_MonsterTemplateDetail a-hyperLink" data-Editor="' + x.monsterTemplateId + '"  data-isBundle="' + x.isBundle + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedMonsterTemplatesList.push({ link: '<a class="Editor_Ruleset_MonsterTemplateDetail a-hyperLink" data-Editor="' + x.monsterTemplateId + '" data-isBundle="' + x.isBundle + '">' + x.MonsterTemplateName + '</a>' });
            }
          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedMonsterTemplatesList);
        } else {
          this.event.emit(this.selectedMonsterTemplatesList);
        }
      }
      if (this._linkType == "Monster" && this.MonsterId) {
        this.Monsters.map(x => {
          if (x.monsterId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedMonstersList.push({ link: '<a class="Editor_Ruleset_MonsterDetail a-hyperLink" data-Editor="' + x.monsterId + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedMonstersList.push({ link: '<a class="Editor_Ruleset_MonsterDetail a-hyperLink" data-Editor="' + x.monsterId + '">' + x.MonsterName + '</a>' });
            }
          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedMonstersList);
        } else {
          this.event.emit(this.selectedMonstersList);
        }
      }
    }
    else {
      if (this._linkType == "Item" && this.itemId) {
        this.items.map(x => {
          if (x.itemId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedItemsList.push({ link: '<a class="Editor_itemDetail a-hyperLink" data-Editor="' + x.itemId + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedItemsList.push({ link: '<a class="Editor_itemDetail a-hyperLink" data-Editor="' + x.itemId + '">' + x.itemName + '</a>' });
            }
          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedItemsList);
        } else {
          this.event.emit(this.selectedItemsList);
        }
      }
      if (this._linkType == "Spell" && this.spellId) {
        this.spells.map(x => {
          if (x.spellId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedSpellsList.push({ link: '<a class="Editor_spellDetail a-hyperLink" data-Editor="' + x.spellId + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedSpellsList.push({ link: '<a class="Editor_spellDetail a-hyperLink" data-Editor="' + x.spellId + '">' + x.spellName + '</a>' });
            }

          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedSpellsList);
        } else {
          this.event.emit(this.selectedSpellsList);
        }
      }
      if (this._linkType == "Ability" && this.abilityId) {
        this.abilities.map(x => {
          if (x.abilityId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedAbilitiesList.push({ link: '<a class="Editor_abilityDetail a-hyperLink" data-Editor="' + x.abilityId + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedAbilitiesList.push({ link: '<a class="Editor_abilityDetail a-hyperLink" data-Editor="' + x.abilityId + '">' + x.abilityName + '</a>' });
            }
          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedAbilitiesList);
        } else {
          this.event.emit(this.selectedAbilitiesList);
        }
      }
      if (this._linkType == "BuffAndEffect" && this.BuffAndEffectId) {
        this.BuffAndEffects.map(x => {
          if (x.buffAndEffectId && x.selected) {
            if (this.linkRecordTitle) {
              this.selectedBuffAndEffectsList.push({ link: '<a class="Editor_BuffAndEffectDetail a-hyperLink" data-Editor="' + x.buffAndEffectId + '">' + this.linkRecordTitle + '</a>' });
            } else {
              this.selectedBuffAndEffectsList.push({ link: '<a class="Editor_BuffAndEffectDetail a-hyperLink" data-Editor="' + x.buffAndEffectId + '">' + x.BuffAndEffectName + '</a>' });
            }
          }
        });
        if (this.linkRecordTitle) {
          this.event.emit(this.selectedBuffAndEffectsList);
        } else {
          this.event.emit(this.selectedBuffAndEffectsList);
        }
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
