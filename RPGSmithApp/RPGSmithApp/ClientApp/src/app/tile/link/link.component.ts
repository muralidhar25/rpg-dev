import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { Color } from '../../core/models/tiles/color.model';
import { LinkTile } from '../../core/models/tiles/link-tile.model';
import { CharacterTile } from '../../core/models/tiles/character-tile.model';
import { CharacterDashboardPage } from '../../core/models/view-models/character-dashboard-page.model';
import { VIEW, SHAPE, SHAPE_CLASS } from '../../core/models/enums';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { AuthService } from '../../core/auth/auth.service';
import { ItemsService } from '../../core/services/items.service';
import { LinkTileService } from '../../core/services/tiles/link-tile.service';
import { CharacterSpellService } from '../../core/services/character-spells.service';
import { CharacterAbilityService } from '../../core/services/character-abilities.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { ColorService } from '../../core/services/tiles/color.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { Utilities } from '../../core/common/utilities';
import { ColorsComponent } from '../colors/colors.component';
import { PlatformLocation } from '@angular/common';
import { BuffAndEffectService } from '../../core/services/buff-and-effect.service';
import { CharactersService } from '../../core/services/characters.service';
import { MonsterTemplateService } from '../../core/services/monster-template.service';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss']
})
export class LinkTileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  ruleSet: any = new Ruleset();
  limitTextSpell: string = "Show more";
  limitTextItem: string = "Show more";
  limitTextAbility: string = "Show more";
  limitTextBuffAndEffect: string = "Show more";
  limitTextAllies: string = "Show more";
  showMoreLessColorText: string = "Advanced";
  color: any;

  colorModel: Color = new Color();
  view: any;
  showDemo: boolean = false;
  tile: number;
  selectedStatType: number = 0;
  selectedIndex: number;
  defaultColorList: any = [];

  limitSpell: number = 4;
  limitItem: number = 4;
  limitAbility: number = 4;
  limitBuffAndEffect: number = 4;
  limitAllies: number = 4;
  tileColor: any;
  title: string;
  isLoading: boolean = false;
  isItemloaded: boolean = false;
  isIspellloaded: boolean = false;
  isAbilityloaded: boolean = false;
  isBuffAndEffectloaded: boolean = false;
  isAllyLoaded: boolean = false;
  items: any;
  spells: any;
  abilities: any;
  BuffAndEffects: any;
  Allies: any;
  spellsList: boolean = true;
  itemsList: boolean;
  abilitiesList: boolean;
  BuffAndEffectList: boolean;
  AllyList: boolean;
  showMoreLessColorToggle: boolean = true;
  selectedColor: string;
  colorList: Color[] = [];
  itemId: number = 0;
  spellId: number = 0;
  abilityId: number = 0;
  BuffAndEffectId: number = 0;
  AllyId: number = 0;
  showTitle: boolean = true;
  shapeClass: string;

  linkTileFormModal = new LinkTile();
  characterTileModel = new CharacterTile();
  pageId: number;
  characterId: number;
  _linkType: any;
  query: string = '';
  pageDefaultData = new CharacterDashboardPage();
  VIEW = VIEW;
  displayboth: boolean = false;
  displayLinkImage: boolean = true;
  doesCharacterHasAllies: boolean = false;
  monstersFilter: any = {
    type: 1,
    name: 'Alphabetical',
    icon: '',
    viewableCount: 0
  };

  isManual: boolean;
  fontOptions = [
    { id: 1, value: 8 },
    { id: 2, value: 9 },
    { id: 3, value: 10 },
    { id: 4, value: 11 },
    { id: 5, value: 12 },
    { id: 6, value: 14 },
    { id: 7, value: 16 },
    { id: 8, value: 18 },
    { id: 9, value: 20 },
    { id: 10, value: 22 },
    { id: 11, value: 24 },
    { id: 12, value: 26 },
    { id: 13, value: 28 },
    { id: 14, value: 36 },
    { id: 15, value: 48 },
    { id: 16, value: 72 }];
  selectedFontSize = [];
  selectedFontSizeTitle = [];

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.submitForm();
    }
  }


  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
    private localStorage: LocalStoreManager, private authService: AuthService, private itemsService: ItemsService, private colorService: ColorService,
    private characterSpellService: CharacterSpellService, private characterAbilityService: CharacterAbilityService,
    private linkTileService: LinkTileService, private alertService: AlertService, private location: PlatformLocation,
    private buffAndEffectService: BuffAndEffectService,
    private charactersService: CharactersService,
    private monsterTemplateService: MonsterTemplateService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {

      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.pageId = this.bsModalRef.content.pageId;
      let model = this.bsModalRef.content.tile;
      let view = this.bsModalRef.content.view;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;
      this.ruleSet = this.bsModalRef.content.ruleSet;
      this.characterTileModel = this.linkTileService.linkTileModelData(model, this.characterId, this.pageId, view, this.pageDefaultData);
      this.linkTileFormModal = Object.assign({}, this.characterTileModel.linkTile);
      this.linkTileFormModal.color = this.characterTileModel.color;
      this.linkTileFormModal.shape = this.characterTileModel.shape;

      this.isManual = this.linkTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.linkTileFormModal.fontSizeTitle);
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.linkTileFormModal.fontSize);
      }

      this._linkType = this.ruleSet.isItemEnabled ? "Item" : this.ruleSet.isSpellEnabled ? "Spell" : this.ruleSet.isAbilityEnabled ? "Ability" : this.doesCharacterHasAllies ? "Allies" : "BuffAndEffect";
      this.showTitle = this.linkTileFormModal.showTitle;
      this.displayLinkImage = this.linkTileFormModal.displayLinkImage;
      if (this.showTitle && this.displayLinkImage) {
        this.displayboth = true;
      }
      this.shapeClass = this.linkTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.linkTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);

      this.initialize(this.linkTileFormModal);
    }, 0);
  }

  private initialize(Tile) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.setColorOnInit();
      // getting items data
      if (this.ruleSet.isItemEnabled) {
        this.itemsService.getItemByCharacterId<any[]>(this.characterId)
          .subscribe(data => {
            //console.log(data);
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
            //console.log(data);
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
            //console.log(data);
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
            //console.log(data);
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

      //get Allies assigned to current character
      this.charactersService.isAllyAssigned(this.characterId).subscribe(data => {
        if (data) {
          this.doesCharacterHasAllies = true;
        }
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => {
        if (this.doesCharacterHasAllies) {
          let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(ruleSetId, 1, 9999, this.monstersFilter.type, this.characterId)
            .subscribe(data => {
              if (data.Character) {
                //this.character = data.Character;
                this.characterId = data.Character.characterId;
              }
              if (data.RuleSet) {
                this.Allies = Utilities.responseData(data.monsters, 9999);
              }
              if (this.Allies && this.Allies.length) {
                this.Allies = Object.assign([], this.Allies.map((x) => {
                  x.selected = false;
                  return x;
                }));
                this.showMoreCommands('Allies', this.Allies.length, "Show more");
              }
              if (this._linkType == "Allies") {
                this.isLoading = false;
              }
              this.isAllyLoaded = true;

            }, error => {
              this.isLoading = false;
              this.isAllyLoaded = true;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => { });
        } else {
          this.isAllyLoaded = true;
        }
      });

      //this.isLoading = true;
      this.colorService.getRecentColors<any>()
        .subscribe(data => {
          let _colorList = [];
          let _hasSame = 0;
          data.forEach((val, index) => {
            let _selected = false;
            if (index == 0 && Tile.view == VIEW.ADD) {
              _selected = true;
            }
            else if (_hasSame == 0 && Tile.view != VIEW.ADD) {
              _hasSame = (Tile.titleBgColor == val.titleBgColor
                && Tile.bodyBgColor == val.bodyBgColor) ? 1 : 0;
              _selected = _hasSame ? true : false;
            }
            _colorList.push({
              titleBgColor: val.titleBgColor,
              titleTextColor: val.titleTextColor,
              bodyBgColor: val.bodyBgColor,
              bodyTextColor: val.bodyTextColor,
              selected: _selected
            });
          });
          let colorDelectedforTile = false;
          _colorList.map((clr, index) => {
            if (clr.selected) {
              colorDelectedforTile = true;
              this.setColor(clr);
            }
          })
          if (!colorDelectedforTile) {

            let newColor = {
              titleBgColor: Tile.titleBgColor,
              titleTextColor: Tile.titleTextColor,
              bodyBgColor: Tile.bodyBgColor,
              bodyTextColor: Tile.bodyTextColor,
              selected: true
            }
            _colorList.splice(0, 0, newColor);
            if (_colorList.length > 6) {
              _colorList.splice(6, _colorList.length - 6)
            }
            this.setColor(newColor)


          }
          this.colorList = _colorList;
        }, error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Error getting recent colors", error);
          if (Errors.sessionExpire) this.authService.logout(true);
          else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }, () => { });
    }
  }

  //setShowTitle(_showTitle: boolean) {
  //    this.showTitle = _showTitle;
  //    this.linkTileFormModal.showTitle = _showTitle;
  //}

  setShowTitle(_showTitle: boolean) {
    this.displayboth = false;
    this.showTitle = _showTitle;
    this.displayLinkImage = false;
    this.linkTileFormModal.displayLinkImage = this.displayLinkImage;
    this.linkTileFormModal.showTitle = _showTitle;
  }
  setbothDisplayLinkImage(displayboth: boolean) {
    this.displayboth = true;
    this.showTitle = displayboth;
    this.displayLinkImage = displayboth;
    this.linkTileFormModal.showTitle = displayboth;
    this.linkTileFormModal.displayLinkImage = displayboth;
  }
  setDisplayLinkImage(_displayLinkImage: boolean) {
    this.displayboth = false;
    this.showTitle = false;
    this.displayLinkImage = _displayLinkImage;
    this.linkTileFormModal.showTitle = false;
    this.linkTileFormModal.displayLinkImage = _displayLinkImage;
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
    else if (fieldName == 'Allies') {
      if (_limitText == "Show more") {
        this.limitTextAllies = "Show less";
        this.limitAllies = _limit;
      } else {
        this.limitTextAllies = "Show more";
        this.limitAllies = 4;
      }
    }
  }
  showMoreColorFields() {
    if (this.showMoreLessColorToggle) {
      this.showMoreLessColorText = "Show Less";

    } else {
      this.showMoreLessColorText = "Advanced";
    }
    this.showMoreLessColorToggle = !this.showMoreLessColorToggle;
  }

  setColorOnInit() {
    //let colorExist = false;
    this.isLoading = true;
    this.colorService.getRPGCoreColors<any>().subscribe(data => {
      data.forEach((val, index) => {
        this.defaultColorList.push({
          titleBgColor: val.titleBgColor,
          titleTextColor: val.titleTextColor,
          bodyBgColor: val.bodyBgColor,
          bodyTextColor: val.bodyTextColor,
          selected: index == 0 ? true : false
        });
      });
    }, error => { }, () => { });

    setTimeout(() => {
      this.colorService.AllReadyHaveColor(this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER).id).subscribe(
        data => {
          let clrList: Color[] = this.colorList.map((clr, index) => {
            clr.selected = false
            if (!data) {
              if (clr.bodyBgColor == '#6094BE'
                && clr.titleBgColor == '#2973A8' && clr.titleTextColor == '#FFFFFF') {
                clr.selected = true
              }
            }
            else if (clr.bodyBgColor == this.colorModel.bodyBgColor && clr.bodyTextColor == this.colorModel.bodyTextColor
              && clr.titleBgColor == this.colorModel.titleBgColor && clr.titleTextColor == this.colorModel.titleTextColor) {
              clr.selected = true
            }
            return clr;
          })
          clrList.map((clr, index) => {
            if (clr.selected) {
              this.setColor(clr);
            }
          })
          this.colorList = clrList;
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
        });

    }, 600);



  }
  setColor(color: any) {

    this.tileColor = color.bgColor;
    this.colorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.linkTileFormModal.titleTextColor = color.titleTextColor;
    this.linkTileFormModal.titleBgColor = color.titleBgColor;
    this.linkTileFormModal.bodyTextColor = color.bodyTextColor;
    this.linkTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.linkTileFormModal.titleTextColor,
      titleBgColor: this.linkTileFormModal.titleBgColor,
      bodyTextColor: this.linkTileFormModal.bodyTextColor,
      bodyBgColor: this.linkTileFormModal.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });
  }

  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.linkTileFormModal.titleTextColor = color.titleTextColor;
    this.linkTileFormModal.titleBgColor = color.titleBgColor;
    this.linkTileFormModal.bodyTextColor = color.bodyTextColor;
    this.linkTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.linkTileFormModal.titleTextColor,
      titleBgColor: this.linkTileFormModal.titleBgColor,
      bodyTextColor: this.linkTileFormModal.bodyTextColor,
      bodyBgColor: this.linkTileFormModal.bodyBgColor
    }
    this.colorList.map((val) => { val.selected = false; });
  }

  setShape(value: number) {
    this.linkTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }

  showProperty(evt) {
    if (evt == "Items") {
      this.itemsList = true;
      this.spellsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectList = false;
      this.AllyList = false;
      this.linkTileFormModal.linkType = "Item";
      this._linkType = "Item";
    }
    else if (evt == "Spells") {
      this.spellsList = true;
      this.itemsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectList = false;
      this.AllyList = false;
      this.linkTileFormModal.linkType = "Spell";
      this._linkType = "Spell";
    }
    else if (evt == "Abilites") {
      this.abilitiesList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.BuffAndEffectList = false;
      this.AllyList = false;
      this.linkTileFormModal.linkType = "Ability";
      this._linkType = "Ability";
    }
    else if (evt == "Allies") {
      this.AllyList = true;
      this.abilitiesList = false;
      this.itemsList = false;
      this.spellsList = false;
      this.BuffAndEffectList = false;
      this.linkTileFormModal.linkType = "Allies";
      this._linkType = "Allies";
    }
    else {
      this.BuffAndEffectList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.abilitiesList = false;
      this.AllyList = false;
      this.linkTileFormModal.linkType = "BuffAndEffect";
      this._linkType = "BuffAndEffect";
    }
  }

  getItemValue(val: any) {
    this.abilityId = null;
    this.spellId = null;
    this.BuffAndEffectId = null;
    this.AllyId = null;

    this.linkTileFormModal.multiAbilityIds = [];
    this.linkTileFormModal.multiSpellIds = [];
    this.linkTileFormModal.multiItemIds = [];
    this.linkTileFormModal.multiBuffAndEffectsIds = [];
    this.linkTileFormModal.multiAllyIds = [];

    this.linkTileFormModal.itemId = val.itemId;
    this.linkTileFormModal.linkType = "Item";

    this.linkTileFormModal.multiItemIds.push(val.itemId);
  }

  getAbilityValue(val: any) {
    this.itemId = null;
    this.spellId = null;
    this.BuffAndEffectId = null;
    this.AllyId = null;

    this.linkTileFormModal.multiItemIds = [];
    this.linkTileFormModal.multiSpellIds = [];
    this.linkTileFormModal.multiAbilityIds = [];
    this.linkTileFormModal.multiBuffAndEffectsIds = [];
    this.linkTileFormModal.multiAllyIds = [];

    this.linkTileFormModal.abilityId = val.characterAbilityId;
    this.linkTileFormModal.linkType = "Ability";

    this.linkTileFormModal.multiAbilityIds.push(val.characterAbilityId);
  }

  getSpellValue(val: any) {
    this.abilityId = null;
    this.itemId = null;
    this.BuffAndEffectId = null;
    this.AllyId = null;

    this.linkTileFormModal.multiAbilityIds = [];
    this.linkTileFormModal.multiItemIds = [];
    this.linkTileFormModal.multiSpellIds = [];
    this.linkTileFormModal.multiBuffAndEffectsIds = [];
    this.linkTileFormModal.multiAllyIds = [];

    this.linkTileFormModal.spellId = val.characterSpellId;
    this.linkTileFormModal.linkType = "Spell";

    this.linkTileFormModal.multiSpellIds.push(val.characterSpellId);
  }
  getBuffAndEffectValue(val: any) {
    this.itemId = null;
    this.spellId = null;
    this.abilityId = null;
    this.AllyId = null;

    this.linkTileFormModal.multiItemIds = [];
    this.linkTileFormModal.multiSpellIds = [];
    this.linkTileFormModal.multiAbilityIds = [];
    this.linkTileFormModal.multiAbilityIds = [];
    this.linkTileFormModal.multiBuffAndEffectsIds = [];
    this.linkTileFormModal.multiAllyIds = [];

    this.linkTileFormModal.buffAndEffectId = val.characterBuffAndEffectId;
    this.linkTileFormModal.linkType = "BuffAndEffect";

    this.linkTileFormModal.multiBuffAndEffectsIds.push(val.characterBuffAndEffectId);
  }

  getAlliesValue(val: any) {
    this.itemId = null;
    this.spellId = null;
    this.abilityId = null;
    this.BuffAndEffectId = null;

    this.linkTileFormModal.multiItemIds = [];
    this.linkTileFormModal.multiSpellIds = [];
    this.linkTileFormModal.multiAbilityIds = [];
    this.linkTileFormModal.multiBuffAndEffectsIds = [];
    this.linkTileFormModal.multiAllyIds = [];

    this.linkTileFormModal.allyId = val.monsterId;
    this.linkTileFormModal.linkType = "Allies";

    this.linkTileFormModal.multiAllyIds.push(val.monsterId);
  }
  getItemValueList(e: any, val: any) {
    if (e.target.checked) {
      this.abilityId = null;
      this.spellId = null;
      this.BuffAndEffectId = null;
      this.AllyId = null;
      //this.linkTileFormModal.multiAbilityIds = [];
      //this.linkTileFormModal.multiSpellIds = [];

      this.linkTileFormModal.itemId = val.itemId;
      this.linkTileFormModal.linkType = "Item";
      this.items.map((x) => {
        if (x.itemId == val.itemId)
          x.selected = true;
      });
      //this.linkTileFormModal.multiItemIds.push(val.itemId);
    }
    else {
      this.items.map((x) => {
        if (x.itemId == val.itemId)
          x.selected = false;
      });
      //this.linkTileFormModal.multiItemIds.splice(this.linkTileFormModal.multiItemIds.indexOf(val.itemId), 1);
    }
    this.linkTileFormModal.multiItemIds = [];
    this.items.map((x) => {
      if (x.selected) {
        this.linkTileFormModal.multiItemIds.push(x.itemId);
      }
    });
  }

  getAbilityValueList(e: any, val: any) {
    if (e.target.checked) {
      this.itemId = null;
      this.spellId = null;
      this.BuffAndEffectId = null;
      this.AllyId = null;
      //this.linkTileFormModal.multiItemIds = [];
      //this.linkTileFormModal.multiSpellIds = [];

      this.linkTileFormModal.abilityId = val.characterAbilityId;
      this.linkTileFormModal.linkType = "Ability";

      this.abilities.map((x) => {
        if (x.characterAbilityId == val.characterAbilityId)
          x.selected = true;
      });

      //this.linkTileFormModal.multiAbilityIds.push(val.characterAbilityId);
    }
    else {
      this.abilities.map((x) => {
        if (x.characterAbilityId == val.characterAbilityId)
          x.selected = false;
      });
      //this.linkTileFormModal.multiAbilityIds.splice(this.linkTileFormModal.multiAbilityIds.indexOf(val.characterAbilityId), 1);
    }
    this.linkTileFormModal.multiAbilityIds = [];
    this.abilities.map((x) => {
      if (x.selected) {
        this.linkTileFormModal.multiAbilityIds.push(x.characterAbilityId);
      }
    });
  }

  getSpellValueList(e: any, val: any) {
    if (e.target.checked) {
      this.abilityId = null;
      this.itemId = null;
      this.BuffAndEffectId = null;
      this.AllyId = null;
      //this.linkTileFormModal.multiAbilityIds = [];
      //this.linkTileFormModal.multiItemIds = [];

      this.linkTileFormModal.spellId = val.characterSpellId;
      this.linkTileFormModal.linkType = "Spell";

      this.spells.map((x) => {
        if (x.characterSpellId == val.characterSpellId)
          x.selected = true;
      });

      //this.linkTileFormModal.multiSpellIds.push(val.characterSpellId);
    }
    else {
      this.spells.map((x) => {
        if (x.characterSpellId == val.characterSpellId)
          x.selected = false;
      });
      //this.linkTileFormModal.multiSpellIds.splice(this.linkTileFormModal.multiSpellIds.indexOf(val.characterSpellId), 1);
    }

    this.linkTileFormModal.multiSpellIds = [];
    this.spells.map((x) => {
      if (x.selected) {
        this.linkTileFormModal.multiSpellIds.push(x.characterSpellId);
      }
    });
  }

  getBuffAndEffectValueList(e: any, val: any) {
    if (e.target.checked) {
      this.itemId = null;
      this.spellId = null;
      this.abilityId = null;
      this.AllyId = null;

      //this.linkTileFormModal.multiItemIds = [];
      //this.linkTileFormModal.multiSpellIds = [];

      this.linkTileFormModal.buffAndEffectId = val.characterBuffAndEffectId;
      this.linkTileFormModal.linkType = "BuffAndEffect";

      this.BuffAndEffects.map((x) => {
        if (x.characterBuffAndEffectId == val.characterBuffAndEffectId)
          x.selected = true;
      });

      //this.linkTileFormModal.multiAbilityIds.push(val.characterAbilityId);
    }
    else {
      this.BuffAndEffects.map((x) => {
        if (x.characterBuffAndEffectId == val.characterBuffAndEffectId)
          x.selected = false;
      });
      //this.linkTileFormModal.multiAbilityIds.splice(this.linkTileFormModal.multiAbilityIds.indexOf(val.characterAbilityId), 1);
    }
    this.linkTileFormModal.multiBuffAndEffectsIds = [];
    this.BuffAndEffects.map((x) => {
      if (x.selected) {
        this.linkTileFormModal.multiBuffAndEffectsIds.push(x.characterBuffAndEffectId);
      }
    });
  }

  getAlliesValueList(e: any, val: any) {
    if (e.target.checked) {
      this.itemId = null;
      this.spellId = null;
      this.abilityId = null;

      this.linkTileFormModal.allyId = val.monsterId;
      this.linkTileFormModal.linkType = "Ally";

      this.Allies.map((x) => {
        if (x.monsterId == val.monsterId)
          x.selected = true;
      });

    }
    else {
      this.Allies.map((x) => {
        if (x.monsterId == val.monsterId)
          x.selected = false;
      });
      //this.linkTileFormModal.multiAbilityIds.splice(this.linkTileFormModal.multiAbilityIds.indexOf(val.characterAbilityId), 1);
    }
    this.linkTileFormModal.multiAllyIds = [];
    this.Allies.map((x) => {
      if (x.selected) {
        this.linkTileFormModal.multiAllyIds.push(x.monsterId);
      }
    });
  }

  opencolorpopup() {
    this.bsModalRef = this.modalService.show(ColorsComponent, {
      class: 'modal-primary modal-md selectPopUpModal',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Select Tile Colors";
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.linkTileFormModal.titleTextColor,
      titleBgColor: this.linkTileFormModal.titleBgColor,
      bodyTextColor: this.linkTileFormModal.bodyTextColor,
      bodyBgColor: this.linkTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.linkTileFormModal.titleTextColor = data.titleTextColor;
      this.linkTileFormModal.titleBgColor = data.titleBgColor;
      this.linkTileFormModal.bodyTextColor = data.bodyTextColor;
      this.linkTileFormModal.bodyBgColor = data.bodyBgColor;

      this.colorList.forEach(function (val) {
        val.selected = false;
      });

      this.colorList.push({
        titleBgColor: data.titleBgColor,
        titleTextColor: data.titleTextColor,
        bodyBgColor: data.bodyBgColor,
        bodyTextColor: data.bodyTextColor,
        selected: true
      });
      if (this.colorList.length > 1)
        this.colorList.splice(0, 1);
      this.bsModalRef.hide();
    });
  }

  setDefaultColors(defaultColor: string) {
    if (!this.linkTileFormModal.titleTextColor)
      this.linkTileFormModal.titleTextColor = defaultColor;
    if (!this.linkTileFormModal.titleBgColor)
      this.linkTileFormModal.titleBgColor = defaultColor;
    if (!this.linkTileFormModal.bodyTextColor)
      this.linkTileFormModal.bodyTextColor = defaultColor;
    if (!this.linkTileFormModal.bodyBgColor)
      this.linkTileFormModal.bodyBgColor = defaultColor;
  }

  submitForm() {
    if (this.characterTileModel.characterId == 0 || this.characterTileModel.characterId == undefined) {
      this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.tileTypeId == 0 || this.characterTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Link tile is not selected.", MessageSeverity.error);
    }
    else if (this.linkTileFormModal.linkType == "" || this.linkTileFormModal.linkType == undefined) {
      this.alertService.showMessage("", "Link Type property is not selected.", MessageSeverity.error);
    }
    else if (!this.linkTileFormModal.buffAndEffectId && !this.linkTileFormModal.abilityId && !this.linkTileFormModal.itemId && !this.linkTileFormModal.spellId && !this.linkTileFormModal.allyId) {
      this.alertService.showMessage("", "Link Type property is not selected.", MessageSeverity.error);
    }
    else {
      this.linkTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.characterTileModel.color = this.linkTileFormModal.color;
      this.characterTileModel.shape = this.linkTileFormModal.shape;
      this.characterTileModel.linkTile = this.linkTileFormModal;
      //this.setDefaultColors(this.linkTileFormModal.color);
      this.linkTileFormModal.showTitle = this.showTitle;
      this.linkTileFormModal.displayLinkImage = this.displayLinkImage;

      this.isLoading = true;
      let _msg = this.linkTileFormModal.linkTileId == 0 || this.linkTileFormModal.linkTileId === undefined
        ? "Creating Link Tile..." : "Updating Link Tile...";
      this.alertService.startLoadingMessage("", _msg);
      this.addEditLinkTile(this.characterTileModel);
    }
  }

  private addEditLinkTile(modal) {

    if (this.isManual) {
      this.linkTileFormModal.isManual = true;
      this.linkTileFormModal.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.linkTileFormModal.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.linkTileFormModal.isManual = false;
    }

    this.isLoading = true;
    modal.spellIDS = this.linkTileFormModal.multiSpellIds;
    modal.abilityIDS = this.linkTileFormModal.multiAbilityIds
    modal.itemIDS = this.linkTileFormModal.multiItemIds
    modal.buffAndEffectIDS = this.linkTileFormModal.multiBuffAndEffectsIds
    modal.allyIDS = this.linkTileFormModal.multiAllyIds

    this.linkTileService.createlinkTile(modal)
      .subscribe(
        data => {

          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let message = modal.linkTile.linkTileId == 0 || modal.linkTile.linkTileId === undefined ? "Link Tile has been added successfully." : "Character Stat Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateCharacterList(data);
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.linkTile.linkTileId == 0 || modal.linkTile.linkTileId === undefined ? "Unable to Add " : "Unable to Update ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else {
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          }
        },
      );
  }

  close() {
    this.bsModalRef.hide();
    this.event.emit(true);
    this.destroyModalOnInit();
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  setFontSizeType(fontStyle: boolean) {
    this.isManual = fontStyle;
  }

  get fontSettings() {
    return {
      primaryKey: "id",
      labelKey: "value",
      text: "Size",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class",
      showCheckbox: false,
      position: "bottom"
    };
  }

  get fontSettingsTitle() {
    return {
      primaryKey: "id",
      labelKey: "value",
      text: "Size",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class",
      showCheckbox: false,
      position: "bottom"
    };
  }


}
