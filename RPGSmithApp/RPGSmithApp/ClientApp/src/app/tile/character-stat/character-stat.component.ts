import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { VIEW, STAT_TYPE, SHAPE, SHAPE_CLASS, STAT_LINK_TYPE, BLOB_TYPE } from '../../core/models/enums';
import { Characters } from '../../core/models/view-models/characters.model';
import { CharacterTile } from '../../core/models/tiles/character-tile.model';
import { CharacterStatTile } from '../../core/models/tiles/character-stat-tile.model';
import { CharacterDashboardPage } from '../../core/models/view-models/character-dashboard-page.model';
import { Color } from '../../core/models/tiles/color.model';
import { CharactersCharacterStatService } from '../../core/services/characters-character-stat.service';
import { CharacterStatTileService } from '../../core/services/tiles/character-stat-tile.service';
import { ColorService } from '../../core/services/tiles/color.service';
import { FileUploadService } from '../../core/common/file-upload.service';
import { AuthService } from '../../core/auth/auth.service';
import { SharedService } from '../../core/services/shared.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { Utilities } from '../../core/common/utilities';
import { ColorsComponent } from '../colors/colors.component';
import { CharactersCharacterStat } from '../../core/models/view-models/characters-character-stats.model';
import { ImageSelectorComponent } from '../../shared/image-interface/image-selector/image-selector.component';
import { PlatformLocation } from '@angular/common';
import { AppService1 } from '../../app.service';

@Component({
  selector: 'app-character-stat',
  templateUrl: './character-stat.component.html',
  styleUrls: ['./character-stat.component.scss']
})
export class CharacterStatTileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  showWebButtons: boolean;
  imageUrl: string;
  fileToUpload: File = null;
  hasCommand: boolean;
  content: any;
  color: any;
  limitText: string = "Show more";
  limit: number = 4;
  stats: any;
  rulesetId: number;
  isLoading: boolean = false;
  // tileForm: FormGroup;
  title: string;
  statsList: Array<any> = [];
  selectedColor: string;
  shapeClass: string;
  colorList: Color[] = [];
  characterStatId: any;
  tileColor: any;
  rangeValue: number;
  VIEW = VIEW;
  character: Characters = new Characters();
  characterTileModel = new CharacterTile();
  characterStatTileFormModal = new CharacterStatTile();
  pageId: number;
  characterId: number;
  showTitle: boolean = true;
  displayLinkImage: boolean = true;
  query: string = '';
  pageDefaultData = new CharacterDashboardPage();
  selectedStatType: number = 0;
  showMoreLessColorText: string = "Advanced";
  showMoreLessColorToggle: boolean = true;
  defaultColorList: any = [];
  colorModel: Color = new Color();
  showDemo: boolean = false;
  tile: number;

  statLinkRecords: any[]
  limitTextSpell: string = "Show more";
  limitTextItem: string = "Show more";
  limitTextAbility: string = "Show more";
  limitTextBuffAndEffect: string = "Show more";
  lengthOfRecordsToDisplay: number = 4;
  limitSpell: number = this.lengthOfRecordsToDisplay;
  limitItem: number = this.lengthOfRecordsToDisplay;
  limitAbility: number = this.lengthOfRecordsToDisplay;
  limitBuffAndEffect: number = this.lengthOfRecordsToDisplay;
  spellsList: boolean = true;;
  itemsList: boolean;
  abilitiesList: boolean;
  BuffAndEffectsList: boolean;
  itemId: number = 0;
  spellId: number = 0;
  abilityId: number = 0;
  BuffAndEffectId: number = 0;
  selectedItem: any = null;
  selectedSpell: any = null;
  selectedAbility: any = null;
  selectedBuffAndEffect: any = null;
  _linkType: any;
  items: any = [];
  spells: any = [];
  abilities: any = [];
  BuffAndEffects: any = [];
  STAT_TYPE = STAT_TYPE
  //STAT_LINK_TYPE= STAT_LINK_TYPE

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

  constructor(private bsModalRef: BsModalRef, private sharedService: SharedService, private colorService: ColorService,
    private modalService: BsModalService, public localStorage: LocalStoreManager, private authService: AuthService,
    public characterStatTileService: CharacterStatTileService, public characterStatService: CharactersCharacterStatService,
    private alertService: AlertService, private fileUploadService: FileUploadService, private location: PlatformLocation,
    private appService: AppService1) {
    location.onPopState(() => this.modalService.hide(1));
    this.rulesetId = this.localStorage.localStorageGetItem('rulesetId');
  }

  ngOnInit() {

    setTimeout(() => {

      this.character = this.bsModalRef.content.character ? this.bsModalRef.content.character : new Characters();
      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.pageId = this.bsModalRef.content.pageId;
      let model = this.bsModalRef.content.tile;
      let view = this.bsModalRef.content.view;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

      this.characterTileModel = this.characterStatTileService.characterStatTileModelData(model, this.characterId, this.pageId, view, this.pageDefaultData);
      this.characterStatTileFormModal = Object.assign({}, this.characterTileModel.characterStatTile);
      this.characterStatTileFormModal.color = this.characterTileModel.color;
      this.characterStatTileFormModal.shape = this.characterTileModel.shape;
      this.imageUrl = this.characterStatTileFormModal.imageUrl;

      this.isManual = this.characterStatTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.characterStatTileFormModal.fontSizeTitle);
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.characterStatTileFormModal.fontSize);
      }

      this.Initialize(view, this.characterStatTileFormModal);

      this.shapeClass = this.characterStatTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.characterStatTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
      this.showTitle = this.characterStatTileFormModal.showTitle;
      this.displayLinkImage = this.characterStatTileFormModal.displayLinkImage;
      if (this.characterTileModel.multiCharacterStats && this.characterTileModel.view == VIEW.EDIT) {
        if (this.characterStatTileFormModal.charactersCharacterStat.charactersCharacterStatId) {
          this.characterTileModel.multiCharacterStats.push({
            characterStatId: this.characterStatTileFormModal.charactersCharacterStat.charactersCharacterStatId,
            characterStatTypeId: this.characterStatTileFormModal.charactersCharacterStat.characterStat.characterStatTypeId,
            image: undefined
          });
        }
      }

    }, 0);
  }

  private Initialize(view, Tile) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.characterStatService.getLinkRecordsDetails<any>(this.characterId)
        .subscribe(data => {
          try {
            this._linkType = this.character.ruleSet.isItemEnabled ? "Item" : this.character.ruleSet.isSpellEnabled ? "Spell" : this.character.ruleSet.isAbilityEnabled ? "Ability" : "BuffAndEffect";
          } catch (e) { this._linkType = ""; }
          this.itemId = 0;
          this.spellId = 0;
          this.abilityId = 0;
          this.BuffAndEffectId = 0;
          if (this.characterTileModel.view === VIEW.EDIT) {
            if (this.characterTileModel.characterStatTile.charactersCharacterStat.linkType == STAT_LINK_TYPE.ITEM) {
              this.itemId = this.characterTileModel.characterStatTile.charactersCharacterStat.defaultValue;
            }
            else if (this.characterTileModel.characterStatTile.charactersCharacterStat.linkType == STAT_LINK_TYPE.SPELL) {
              this.spellId = this.characterTileModel.characterStatTile.charactersCharacterStat.defaultValue;
            }
            else if (this.characterTileModel.characterStatTile.charactersCharacterStat.linkType == STAT_LINK_TYPE.ABILITY) {
              this.abilityId = this.characterTileModel.characterStatTile.charactersCharacterStat.defaultValue;
            }
            else if (this.characterTileModel.characterStatTile.charactersCharacterStat.linkType == STAT_LINK_TYPE.BUFFANDEFFECT) {
              this.BuffAndEffectId = this.characterTileModel.characterStatTile.charactersCharacterStat.defaultValue;
            }
          }
          this.statLinkRecords = data;
          if (this.statLinkRecords) {
            if (this.statLinkRecords.length) {
              if (this.statLinkRecords.length > 0) {
                this.statLinkRecords.map((link) => {
                  switch (link.type) {
                    case STAT_LINK_TYPE.ITEM:
                      this.items.push({ itemId: link.id, name: link.name, itemImage: link.image, isItemEquiped: link.isItemEquiped });
                      break;
                    case STAT_LINK_TYPE.SPELL:
                      this.spells.push({ characterSpellId: link.id, name: link.name, imageUrl: link.image, isSpellMemorized: link.isSpellMemorized, spell: { characterSpellId: link.id, name: link.name, imageUrl: link.image } });
                      break;
                    case STAT_LINK_TYPE.ABILITY:
                      this.abilities.push({ characterAbilityId: link.id, name: link.name, imageUrl: link.image, isAbilityEnabled: link.isAbilityEnabled, ability: { characterAbilityId: link.id, name: link.name, imageUrl: link.image } });
                      break;
                    case STAT_LINK_TYPE.BUFFANDEFFECT:
                      this.BuffAndEffects.push({ characterBuffAndEffectId: link.id, name: link.name, imageUrl: link.image, isBuffAndEffectEnabled: link.isBuffAndEffectEnabled, BuffAndEffect: { characterBuffAndEffectId: link.id, name: link.name, imageUrl: link.image } });
                      break;
                    default:
                  }
                })
              }
            }
          }

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
            this.showMoreLinkRecords('item', this.items.length, "Show more");
          }
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
            this.showMoreLinkRecords('spell', this.spells.length, "Show more");
          }
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
            this.showMoreLinkRecords('ability', this.abilities.length, "Show more");
          }
          if (this.BuffAndEffects.length) {
            this.BuffAndEffects = Object.assign([], this.BuffAndEffects.map((x) => {
              if (this.BuffAndEffectId == x.characterBuffAndEffectId) {

                x.selected = true;
                this.showProperty('BuffAndEffects')
                this.selectedBuffAndEffect = x;
              }
              else {
                x.selected = false;
              }
              return x;
            }));
            this.showMoreLinkRecords('BuffAndEffect', this.BuffAndEffects.length, "Show more");
          }
        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });
      this.setColorOnInit();
      this.characterStatService.getCharactersCharacterStat_StatList<any[]>(this.characterId, -1, -1) //100=>for testing
        .subscribe(data => {
          // console.log(data);
          this.statsList = data;
          //changes for #456
          let countCommandSTAT = 0;
          this.statsList.map((x) => {
            if (x.characterStat.characterStatTypeId === STAT_TYPE.Command
              && x.charactersCharacterStatId === this.characterStatTileFormModal.charactersCharacterStatId) {
              countCommandSTAT += 1;
              if (countCommandSTAT === 1) this.hasCommand = true;
              else this.hasCommand = false;
            }
          });
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
        }, () => { });

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
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Error getting recent colors", error);
          if (Errors.sessionExpire) this.authService.logout(true);
          else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }, () => { });
      try {
        this.selectedStatType = view == VIEW.EDIT
          ? this.characterTileModel.characterStatTile.charactersCharacterStat.characterStat.characterStatTypeId
          : 0;
      } catch (err) { }
    }
  }

  showMoreCommands(_limit: number, _limitText: string) {
    if (_limitText == "Show more") {
      this.limitText = "Show less";
      this.limit = _limit;
    } else {
      this.limitText = "Show more";
      this.limit = 4;
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

  setColor(color: any, index: number = 0) {

    this.tileColor = color.bgColor;
    this.colorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.characterStatTileFormModal.titleTextColor = color.titleTextColor;
    this.characterStatTileFormModal.titleBgColor = color.titleBgColor;
    this.characterStatTileFormModal.bodyTextColor = color.bodyTextColor;
    this.characterStatTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.characterStatTileFormModal.titleTextColor,
      titleBgColor: this.characterStatTileFormModal.titleBgColor,
      bodyTextColor: this.characterStatTileFormModal.bodyTextColor,
      bodyBgColor: this.characterStatTileFormModal.bodyBgColor
    }
    this.defaultColorList.map((val) => { val.selected = false; });
  }
  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.characterStatTileFormModal.titleTextColor = color.titleTextColor;
    this.characterStatTileFormModal.titleBgColor = color.titleBgColor;
    this.characterStatTileFormModal.bodyTextColor = color.bodyTextColor;
    this.characterStatTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.characterStatTileFormModal.titleTextColor,
      titleBgColor: this.characterStatTileFormModal.titleBgColor,
      bodyTextColor: this.characterStatTileFormModal.bodyTextColor,
      bodyBgColor: this.characterStatTileFormModal.bodyBgColor
    }
    this.colorList.map((val) => { val.selected = false; });
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
              this.setColor(clr, index);
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


  opencolorpopup() {
    this.bsModalRef = this.modalService.show(ColorsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });

    this.bsModalRef.content.title = "Select Tile Colors";
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.selectedStatType = this.selectedStatType;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.characterStatTileFormModal.titleTextColor,
      titleBgColor: this.characterStatTileFormModal.titleBgColor,
      bodyTextColor: this.characterStatTileFormModal.bodyTextColor,
      bodyBgColor: this.characterStatTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.characterStatTileFormModal.titleTextColor = data.titleTextColor;
      this.characterStatTileFormModal.titleBgColor = data.titleBgColor;
      this.characterStatTileFormModal.bodyTextColor = data.bodyTextColor;
      this.characterStatTileFormModal.bodyBgColor = data.bodyBgColor;

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

  getStatValueEdit(event: any, stat: any) {

    this.characterStatId = stat.charactersCharacterStatId;
    this.characterStatTileFormModal.charactersCharacterStatId = stat.charactersCharacterStatId;
    this.selectedStatType = stat.characterStat.characterStatTypeId;

    this.characterTileModel.multiCharacterStats = [];
    this.characterTileModel.multiCharacterStats.push({
      characterStatId: stat.charactersCharacterStatId,
      characterStatTypeId: stat.characterStat.characterStatTypeId,
      image: undefined
    });

    this.selectLinkRecord(stat);
    if (stat.characterStat.characterStatTypeId == STAT_TYPE.Command) {
      this.hasCommand = true;
    } else this.hasCommand = false;
  }

  getStatValue(event: any, stat: any) {

    if (event.target.checked) {

      this.characterStatId = stat.charactersCharacterStatId;
      this.characterStatTileFormModal.charactersCharacterStatId = stat.charactersCharacterStatId;

      this.characterTileModel.multiCharacterStats.push({
        characterStatId: stat.charactersCharacterStatId,
        characterStatTypeId: stat.characterStat.characterStatTypeId,
        image: undefined
      });

      let countCommandSTAT = 0;
      this.characterTileModel.multiCharacterStats.map((x) => {
        if (x.characterStatTypeId === STAT_TYPE.Command) {
          countCommandSTAT += 1;
        }
      });
      if (countCommandSTAT === 1) {
        this.hasCommand = true;
      } else this.hasCommand = false;

    }
    else {
      this.characterTileModel.multiCharacterStats = this.characterTileModel.multiCharacterStats.filter(x => x.characterStatId != stat.charactersCharacterStatId);

      if (stat.characterStat.characterStatTypeId == STAT_TYPE.Command) {
        this.hasCommand = false;
      }
    }
    this.selectLinkRecord(stat);
  }

  setShowTitle(_showTitle: boolean) {
    this.showTitle = _showTitle;
    this.characterStatTileFormModal.showTitle = _showTitle;
  }
  setDisplayLinkImage(_displayLinkImage: boolean) {
    this.displayLinkImage = _displayLinkImage;
    this.characterStatTileFormModal.displayLinkImage = _displayLinkImage;
  }

  setDefaultColors(defaultColor: string) {
    if (!this.characterStatTileFormModal.titleTextColor)
      this.characterStatTileFormModal.titleTextColor = defaultColor;
    if (!this.characterStatTileFormModal.titleBgColor)
      this.characterStatTileFormModal.titleBgColor = defaultColor;
    if (!this.characterStatTileFormModal.bodyTextColor)
      this.characterStatTileFormModal.bodyTextColor = defaultColor;
    if (!this.characterStatTileFormModal.bodyBgColor)
      this.characterStatTileFormModal.bodyBgColor = defaultColor;
  }

  setShape(value: number) {
    this.characterStatTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }

  submitForm() {

    if (this.characterTileModel.characterId == 0 || this.characterTileModel.characterId == undefined) {
      this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.tileTypeId == 0 || this.characterTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Character Stat tile is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.view === VIEW.EDIT && (this.characterStatTileFormModal.charactersCharacterStatId == 0 || this.characterStatTileFormModal.charactersCharacterStatId == undefined)) {
      this.alertService.showMessage("", "Character Stat is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.view === VIEW.ADD && this.characterTileModel.multiCharacterStats == undefined) {
      this.alertService.showMessage("Please select atleast one character stat.", "", MessageSeverity.error);
    }
    else if (this.characterTileModel.view === VIEW.ADD && this.characterTileModel.multiCharacterStats.length == 0) {
      this.alertService.showMessage("Please select atleast one character stat.", "", MessageSeverity.error);
    }
    else {
      this.characterStatTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.characterTileModel.color = this.characterStatTileFormModal.color;
      this.characterTileModel.shape = this.characterStatTileFormModal.shape;

      //this.setDefaultColors(this.characterStatTileFormModal.color);
      this.characterTileModel.characterStatTile = this.characterStatTileFormModal;

      this.isLoading = true;
      let _msg = this.characterStatTileFormModal.characterStatTileId == 0 || this.characterStatTileFormModal.characterStatTileId === undefined
        ? "Creating Character Stat Tile..." : "Updating Character Stat Tile...";

      this.alertService.startLoadingMessage("", _msg);

      if (this.imageUrl != null)  /*image upload then submit */
        this.fileUpload();
      else
        this.addEditCharacterStatTile(this.characterTileModel);
    }
  }

  private addEditCharacterStatTile(modal) {
    if (this.isManual) {
      this.characterStatTileFormModal.isManual = true;
      this.characterStatTileFormModal.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.characterStatTileFormModal.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.characterStatTileFormModal.isManual = false;
    }
    this.isLoading = true;

    if (modal.view === VIEW.ADD) {
      if (modal.multiCharacterStats) {
        if (modal.multiCharacterStats.length) {
          if (modal.multiCharacterStats.length == 1) {
            if (modal.multiCharacterStats[0].characterStatTypeId == STAT_TYPE.LinkRecord) {
              this.statsList.map((st) => {
                if (st.charactersCharacterStatId == modal.multiCharacterStats[0].characterStatId) {

                  if (this.itemId) {
                    st.linkType = STAT_LINK_TYPE.ITEM;
                    st.defaultValue = this.itemId;
                    this.updateStatService(st)
                  }
                  else if (this.spellId) {
                    st.linkType = STAT_LINK_TYPE.SPELL;
                    st.defaultValue = this.spellId;
                    this.updateStatService(st)
                  }
                  else if (this.abilityId) {
                    st.linkType = STAT_LINK_TYPE.ABILITY;
                    st.defaultValue = this.abilityId;
                    this.updateStatService(st)
                  }
                  else if (this.BuffAndEffectId) {
                    st.linkType = STAT_LINK_TYPE.BUFFANDEFFECT;
                    st.defaultValue = this.BuffAndEffectId;
                    this.updateStatService(st)
                  }
                  else {
                    st.linkType = null;
                    st.defaultValue = 0;
                    this.updateStatService(st)
                  }
                }
              })

            }
          }
        }
      }
    }
    else if (modal.view === VIEW.EDIT) {
      if (modal.characterStatTile.charactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.LinkRecord) {
        if (this.itemId) {
          modal.characterStatTile.charactersCharacterStat.linkType = STAT_LINK_TYPE.ITEM;
          modal.characterStatTile.charactersCharacterStat.defaultValue = this.itemId;
          this.updateStatService(modal.characterStatTile.charactersCharacterStat)
        }
        else if (this.spellId) {
          modal.characterStatTile.charactersCharacterStat.linkType = STAT_LINK_TYPE.SPELL;
          modal.characterStatTile.charactersCharacterStat.defaultValue = this.spellId;
          this.updateStatService(modal.characterStatTile.charactersCharacterStat)
        }
        else if (this.abilityId) {
          modal.characterStatTile.charactersCharacterStat.linkType = STAT_LINK_TYPE.ABILITY;
          modal.characterStatTile.charactersCharacterStat.defaultValue = this.abilityId;
          this.updateStatService(modal.characterStatTile.charactersCharacterStat)
        }
        else if (this.BuffAndEffectId) {
          modal.characterStatTile.charactersCharacterStat.linkType = STAT_LINK_TYPE.BUFFANDEFFECT;
          modal.characterStatTile.charactersCharacterStat.defaultValue = this.BuffAndEffectId;
          this.updateStatService(modal.characterStatTile.charactersCharacterStat)
        }
        else {
          modal.characterStatTile.charactersCharacterStat.linkType = null;
          modal.characterStatTile.charactersCharacterStat.defaultValue = 0;
          this.updateStatService(modal.characterStatTile.charactersCharacterStat)
        }
      }
    }

    this.characterStatTileService.createCharacterStatTile(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.characterStatTile.characterStatTileId == 0 || modal.characterStatTile.characterStatTileId === undefined ? "Character Stat Tile has been added successfully." : "Character Stat Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);

          this.sharedService.updateCharacterList(data);
          this.close();
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.characterStatTile.characterStatTileId == 0 || modal.characterStatTile.characterStatTileId === undefined ? "Unable to Add " : "Unable to Update ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire)
            this.authService.logout(true);
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        },
      );
  }

  private fileUpload() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {

      if (this.imageUrl.indexOf(BLOB_TYPE.blob) > -1) {
        if (this.characterTileModel.view == VIEW.EDIT) this.characterStatTileFormModal.imageUrl = this.imageUrl;
        else
          this.characterTileModel.multiCharacterStats.map((x) => {
            if (x.characterStatTypeId === STAT_TYPE.Command && this.hasCommand) {
              x.image = this.imageUrl;
              this.characterStatTileFormModal.imageUrl = this.imageUrl;
            }
          });
        this.addEditCharacterStatTile(this.characterTileModel);
      } else {
        let type = "base64";
        let file = this.imageUrl;
        let extension = 'jpg';
        if (this.imageUrl.indexOf(BLOB_TYPE.base64) > -1) {
          type = "base64";
        }
        else {
          type = "url";
          try {
            var regex = /(?:\.([^.]+))?$/;
            extension = regex.exec(this.imageUrl)[1];
            extension = extension ? extension : 'jpg';
          } catch{ }
        }

        let data = {
          userId: user.id,
          file: this.imageUrl,
          extension: extension,
          type: type
        }

        this.fileUploadService.uploadImageToBlob<any>(data)
          .subscribe(
            data => {
              //this.characterTileModel.imageUrl = data.ImageUrl;
              this.imageUrl = data.ImageUrl;
              this.characterTileModel.multiCharacterStats.map((x) => {
                if (x.characterStatTypeId === STAT_TYPE.Command && this.hasCommand) {
                  x.image = this.imageUrl;
                  this.characterStatTileFormModal.imageUrl = this.imageUrl;
                }
              });
              this.addEditCharacterStatTile(this.characterTileModel);
            },
            error => {
              let Errors = Utilities.ErrorDetail('Error', error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              else this.addEditCharacterStatTile(this.characterTileModel);
            });
      }

    }
  }

  showProperty(evt) {
    if (evt == "Items") {
      this.itemsList = true;
      this.spellsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectsList = false;
      //this.linkTileFormModal.linkType = "Item";
      this._linkType = "Item";
    }
    else if (evt == "Spells") {
      this.spellsList = true;
      this.itemsList = false;
      this.abilitiesList = false;
      this.BuffAndEffectsList = false;
      //this.linkTileFormModal.linkType = "Spell";
      this._linkType = "Spell";
    }
    else if (evt == "Abilites") {
      this.abilitiesList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.BuffAndEffectsList = false;
      //this.linkTileFormModal.linkType = "Ability";
      this._linkType = "Ability";
    }
    else {
      this.BuffAndEffectsList = true;
      this.itemsList = false;
      this.spellsList = false;
      this.abilitiesList = false;
      //this.linkTileFormModal.linkType = "Ability";
      this._linkType = "BuffAndEffect";
    }
  }

  getItemValue(val: any) {
    this.abilityId = 0;
    this.spellId = 0;
    this.BuffAndEffectId = 0;
    this.selectedSpell = null;
    this.selectedAbility = null;
    this.selectedBuffAndEffect = null;
    this.itemId = val.itemId;
    this.selectedItem = val;
  }

  getAbilityValue(val: any) {
    this.itemId = 0;
    this.spellId = 0;
    this.BuffAndEffectId = 0;
    this.selectedItem = null;
    this.selectedSpell = null;
    this.selectedBuffAndEffect = null;
    this.abilityId = val.characterAbilityId;
    this.selectedAbility = val;

  }

  getSpellValue(val: any) {
    this.abilityId = 0;
    this.itemId = 0;
    this.BuffAndEffectId = 0;
    this.selectedItem = null;
    this.selectedAbility = null;
    this.selectedBuffAndEffect = null;
    this.spellId = val.characterSpellId;
    this.selectedSpell = val;

  }
  getBuffAndEffectValue(val: any) {
    this.itemId = 0;
    this.spellId = 0;
    this.abilityId = 0;
    this.selectedItem = null;
    this.selectedSpell = null;
    this.selectedAbility = null;
    this.BuffAndEffectId = val.characterBuffAndEffectId;
    this.selectedBuffAndEffect = val;

  }
  showMoreLinkRecords(fieldName: any, _limit: number, _limitText: string) {
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
    else if (fieldName == 'BuffAndEffect') {
      if (_limitText == "Show more") {
        this.limitTextBuffAndEffect = "Show less";
        this.limitBuffAndEffect = _limit;
      } else {
        this.limitTextBuffAndEffect = "Show more";
        this.limitBuffAndEffect = this.lengthOfRecordsToDisplay;
      }
    }
  }
  //isAnyLinkTypeStat() {
  //    this.characterTileModel.multiCharacterStats.map
  //}
  private updateStatService(charactersCharacterStat: CharactersCharacterStat) {
    this.characterStatService.updateCharactersCharacterStat(charactersCharacterStat).subscribe(
      data => {
      },
      error => {
        this.alertService.stopLoadingMessage();
        let _message = "Unable to update Character-CharacterStat Linked Record for this tile";
        let Errors = Utilities.ErrorDetail(_message, error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
        else
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      },
    )
    ///////////////////////////////
    let logStat = { characterStatId: charactersCharacterStat.characterStatId, characterId: charactersCharacterStat.characterId, RuleSetId: this.rulesetId }
    this.appService.updateSaveLogStat(logStat);
  }
  selectLinkRecord(stat: any) {
    if (this.characterTileModel.multiCharacterStats.length) {
      if (this.characterTileModel.multiCharacterStats.length == 1 && stat.characterStat.characterStatTypeId == STAT_TYPE.LinkRecord) {
        this.statsList.map((st) => {

          if (st.charactersCharacterStatId == this.characterTileModel.multiCharacterStats[0].characterStatId) {
            this.itemId = 0;
            this.spellId = 0;
            this.abilityId = 0;
            this.BuffAndEffectId = 0;
            //if (this.characterTileModel.view === VIEW.EDIT) {
            if (st.linkType == STAT_LINK_TYPE.ITEM) {
              this.itemId = st.defaultValue;
              this.showProperty('Items');
            }
            else if (st.linkType == STAT_LINK_TYPE.SPELL) {
              this.spellId = st.defaultValue;
              this.showProperty('Spells');
            }
            else if (st.linkType == STAT_LINK_TYPE.ABILITY) {
              this.abilityId = st.defaultValue;
              this.showProperty('Abilites');
            }
            else if (st.linkType == STAT_LINK_TYPE.BUFFANDEFFECT) {
              this.BuffAndEffectId = st.defaultValue;
              this.showProperty('BuffAndEffects');
            }
            //}
          }
        })

      }
    }
  }

  close() {
    this.bsModalRef.hide();
    this.event.emit(true);
    this.destroyModalOnInit()
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  removeImage() {
    this.imageUrl = null;
    this.characterStatTileFormModal.imageUrl = null;
  }

  cropImage(img: string, OpenDirectPopup: boolean, view: string) {

    this.bsModalRef = this.modalService.show(ImageSelectorComponent, {
      class: 'modal-primary modal-sm selectPopUpModal',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'none';
    this.bsModalRef.content.image = img;
    this.bsModalRef.content.view = view;
    this.bsModalRef.content.errorImage = 'https://rpgsmithsa.blob.core.windows.net/stock-icons/d20.png';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      //this.commandTileFormModal.imageUrl = data.base64;
      this.imageUrl = data.base64;
      this.fileToUpload = data.base64;
      this.showWebButtons = false;
    });
  }
  RemoveSelectedLinkRecord() {

    this.abilityId = 0;
    this.itemId = 0;
    this.spellId = 0;
    this.BuffAndEffectId = 0;
    this.selectedItem = null;
    this.selectedAbility = null;
    this.selectedSpell = null;
    this.selectedBuffAndEffect = null;
  }
  IsStatChecked(stat: any): boolean {
    if (this.characterTileModel.multiCharacterStats) {
      if (this.characterTileModel.multiCharacterStats.length) {

        if (this.characterTileModel.multiCharacterStats.filter(x => x.characterStatId == stat.charactersCharacterStatId).length) {
          return true;
        }
      }
    }
    return false;
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
