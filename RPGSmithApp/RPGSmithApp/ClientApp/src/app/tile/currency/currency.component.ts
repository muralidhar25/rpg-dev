import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { Color } from '../../core/models/tiles/color.model';
import { CharacterTile } from '../../core/models/tiles/character-tile.model';
import { CharacterDashboardPage } from '../../core/models/view-models/character-dashboard-page.model';
import { VIEW, SHAPE, SHAPE_CLASS } from '../../core/models/enums';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { AuthService } from '../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { ColorService } from '../../core/services/tiles/color.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { Utilities } from '../../core/common/utilities';
import { ColorsComponent } from '../colors/colors.component';
import { PlatformLocation } from '@angular/common';
import { CurrencyTile } from '../../core/models/tiles/currency-tile.model';
import { CurrencyTileService } from '../../core/services/tiles/currency-tile.service';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyTileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  ruleSet: any = new Ruleset();
  limitTextBuffAndEffect: string = "Show more";
  showMoreLessColorText: string = "Advanced";
  color: any;
  colorModel: Color = new Color();
  view: any;
  showDemo: boolean = false;
  tile: number;
  selectedStatType: number = 0;
  defaultColorList: any = [];

  limitCurrency: number = 4;
  tileColor: any;
  title: string;
  isLoading: boolean = false;

  showMoreLessColorToggle: boolean = true;
  selectedColor: string;
  colorList: Color[] = [];

  showTitle: boolean = true;
  shapeClass: string;

  currencyTileFormModal = new CurrencyTile();
  characterTileModel = new CharacterTile();
  pageId: number;
  characterId: number;
  query: string = '';
  pageDefaultData = new CharacterDashboardPage();
  VIEW = VIEW;

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
    private localStorage: LocalStoreManager, private authService: AuthService, private colorService: ColorService,
    private currencyTileService: CurrencyTileService,
    private alertService: AlertService, private location: PlatformLocation) {
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
      //this.characterTileModel = this.buffAndEffectTileService.buffAndEffectTileModelData(model, this.characterId, this.pageId, view, this.pageDefaultData);
      this.characterTileModel = this.currencyTileService.currencyTileModelData(model, this.characterId, this.pageId, view, this.pageDefaultData);
      this.currencyTileFormModal = Object.assign({}, this.characterTileModel.currencyTile);
      this.currencyTileFormModal.color = this.characterTileModel.color;
      this.currencyTileFormModal.shape = this.characterTileModel.shape;
      this.showTitle = this.currencyTileFormModal.showTitle;

      this.shapeClass = this.currencyTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.currencyTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);

      this.isManual = this.currencyTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.currencyTileFormModal.fontSizeTitle);
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.currencyTileFormModal.fontSize);
      }

      this.initialize(this.currencyTileFormModal);
    }, 0);
  }

  private initialize(Tile) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.setColorOnInit();
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

  showMoreCommands(fieldName: any, _limit: number, _limitText: string) {
    if (fieldName == 'Currency') {
      if (_limitText == "Show more") {
        this.limitTextBuffAndEffect = "Show less";
        this.limitCurrency = _limit;
      } else {
        this.limitTextBuffAndEffect = "Show more";
        this.limitCurrency = 4;
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
    this.currencyTileFormModal.titleTextColor = color.titleTextColor;
    this.currencyTileFormModal.titleBgColor = color.titleBgColor;
    this.currencyTileFormModal.bodyTextColor = color.bodyTextColor;
    this.currencyTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.currencyTileFormModal.titleTextColor,
      titleBgColor: this.currencyTileFormModal.titleBgColor,
      bodyTextColor: this.currencyTileFormModal.bodyTextColor,
      bodyBgColor: this.currencyTileFormModal.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });
  }

  setdefaultColor(color: any) {
    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.currencyTileFormModal.titleTextColor = color.titleTextColor;
    this.currencyTileFormModal.titleBgColor = color.titleBgColor;
    this.currencyTileFormModal.bodyTextColor = color.bodyTextColor;
    this.currencyTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.currencyTileFormModal.titleTextColor,
      titleBgColor: this.currencyTileFormModal.titleBgColor,
      bodyTextColor: this.currencyTileFormModal.bodyTextColor,
      bodyBgColor: this.currencyTileFormModal.bodyBgColor
    }
    this.colorList.map((val) => { val.selected = false; });
  }

  setShape(value: number) {
    this.currencyTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
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
      titleTextColor: this.currencyTileFormModal.titleTextColor,
      titleBgColor: this.currencyTileFormModal.titleBgColor,
      bodyTextColor: this.currencyTileFormModal.bodyTextColor,
      bodyBgColor: this.currencyTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.currencyTileFormModal.titleTextColor = data.titleTextColor;
      this.currencyTileFormModal.titleBgColor = data.titleBgColor;
      this.currencyTileFormModal.bodyTextColor = data.bodyTextColor;
      this.currencyTileFormModal.bodyBgColor = data.bodyBgColor;

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
    if (!this.currencyTileFormModal.titleTextColor)
      this.currencyTileFormModal.titleTextColor = defaultColor;
    if (!this.currencyTileFormModal.titleBgColor)
      this.currencyTileFormModal.titleBgColor = defaultColor;
    if (!this.currencyTileFormModal.bodyTextColor)
      this.currencyTileFormModal.bodyTextColor = defaultColor;
    if (!this.currencyTileFormModal.bodyBgColor)
      this.currencyTileFormModal.bodyBgColor = defaultColor;
  }

  submitForm() {
    if (this.characterTileModel.characterId == 0 || this.characterTileModel.characterId == undefined) {
      this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.tileTypeId == 0 || this.characterTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Currency tile is not selected.", MessageSeverity.error);
    }
    else {
      this.currencyTileFormModal.title = this.currencyTileFormModal.title ? this.currencyTileFormModal.title.trim() : undefined;
      this.currencyTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.characterTileModel.color = this.currencyTileFormModal.color;
      this.characterTileModel.shape = this.currencyTileFormModal.shape;
      this.characterTileModel.currencyTile = this.currencyTileFormModal;
      this.currencyTileFormModal.showTitle = this.showTitle;

      this.isLoading = true;
      let _msg = this.currencyTileFormModal.currencyTypeTileId == 0 || this.currencyTileFormModal.currencyTypeTileId === undefined
        ? "Creating Currency Tile..." : "Updating Currency Tile...";
      this.alertService.startLoadingMessage("", _msg);
      this.addEditCurrencyTile(this.characterTileModel);
    }
  }

  private addEditCurrencyTile(modal) {

    if (this.isManual) {
      this.currencyTileFormModal.isManual = true;
      this.currencyTileFormModal.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.currencyTileFormModal.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.currencyTileFormModal.isManual = false;
    }

    this.isLoading = true;

    this.currencyTileService.createCurrencyTile(modal)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let message = modal.currencyTile.currencyTypeTileId == 0 || modal.currencyTile.currencyTypeTileId === undefined ? "Currency Tile has been added successfully." : "Currency Tile has been updated successfully.";
        this.alertService.showMessage(message, "", MessageSeverity.success);
        this.sharedService.updateCharacterList(data);
        this.close();
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.currencyTile.currencyTypeTileId == 0 || modal.currencyTile.currencyTypeTileId === undefined ? "Unable to Add " : "Unable to Update ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else {
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          }
        });
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
