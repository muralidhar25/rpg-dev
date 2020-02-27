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
import { BuffAndEffectTile } from '../../core/models/tiles/buff-and-effect-tile.model';
import { BuffAandEffectTileService } from '../../core/services/tiles/buff-and-effect-tile.service';

@Component({
  selector: 'app-buff-and-effect',
  templateUrl: './buff-and-effect.component.html',
  styleUrls: ['./buff-and-effect.component.scss']
})
export class BuffAndEffectTileComponent implements OnInit {

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
  selectedIndex: number;
  defaultColorList: any = [];

  limitBuffAndEffect: number = 4;
  tileColor: any;
  title: string;
  isLoading: boolean = false;

  //  isBuffAndEffectloaded: boolean = false;
  // BuffAndEffects: any;

  BuffAndEffectList: boolean;
  showMoreLessColorToggle: boolean = true;
  selectedColor: string;
  colorList: Color[] = [];

  BuffAndEffectId: number = 0;
  showTitle: boolean = true;
  shapeClass: string;

  buffAndEffectTileFormModal = new BuffAndEffectTile();
  characterTileModel = new CharacterTile();
  pageId: number;
  characterId: number;
  //_linkType: any;
  query: string = '';
  pageDefaultData = new CharacterDashboardPage();
  VIEW = VIEW;
  displayboth: boolean = false;
  displayLinkImage: boolean = true;

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
    private buffAndEffectTileService: BuffAandEffectTileService,
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
      this.characterTileModel = this.buffAndEffectTileService.buffAndEffectTileModelData(model, this.characterId, this.pageId, view, this.pageDefaultData);
      this.buffAndEffectTileFormModal = Object.assign({}, this.characterTileModel.buffAndEffectTile);
      this.buffAndEffectTileFormModal.color = this.characterTileModel.color;
      this.buffAndEffectTileFormModal.shape = this.characterTileModel.shape;
      this.showTitle = this.buffAndEffectTileFormModal.showTitle;
      this.displayLinkImage = this.buffAndEffectTileFormModal.displayLinkImage;
      if (this.showTitle && this.displayLinkImage) {
        this.displayboth = true;
      }
      this.shapeClass = this.buffAndEffectTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.buffAndEffectTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);

      this.isManual = this.buffAndEffectTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.buffAndEffectTileFormModal.fontSizeTitle);
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.buffAndEffectTileFormModal.fontSize);
      }

      this.initialize(this.buffAndEffectTileFormModal);
    }, 0);
  }

  private initialize(Tile) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.setColorOnInit();
      //if (this.ruleSet.isBuffAndEffectEnabled) {
      //  this.buffAndEffectService.getBuffAndEffectAssignedToCharacter<any[]>(this.characterId)
      //    .subscribe(data => {
      //      //console.log(data);
      //      this.BuffAndEffects = data;
      //      this.isBuffAndEffectloaded = true;
      //      if (this.BuffAndEffects.length) {
      //        this.BuffAndEffects = Object.assign([], this.BuffAndEffects.map((x) => {
      //          x.selected = false;
      //          return x;
      //        }));
      //        this.showMoreCommands('BuffAndEffect', this.BuffAndEffects.length, "Show more");
      //      }

      //      if (this.characterTileModel.view == VIEW.EDIT) {
      //        this.BuffAndEffects = Object.assign([], this.BuffAndEffects.map((x) => {
      //          x.selected = false;
      //          debugger
      //          if (this.buffAndEffectTileFormModal.multiBuffAndEffectsIds.filter((q: any) => q.characterBuffAndEffectId == x.characterBuffAndEffectId).length) {
      //            x.selected = true;
      //          }

      //          return x;
      //        }));
      //      }
      //        this.isLoading = false;


      //    }, error => {
      //      this.isLoading = false;
      //      this.isBuffAndEffectloaded = true;
      //    }, () => { });
      //} else {
      //  this.isBuffAndEffectloaded = true;
      //}
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
  //    this.buffAndEffectTileFormModal.showTitle = _showTitle;
  //}

  setShowTitle(_showTitle: boolean) {
    this.displayboth = false;
    this.showTitle = _showTitle;
    this.displayLinkImage = false;
    this.buffAndEffectTileFormModal.displayLinkImage = this.displayLinkImage;
    this.buffAndEffectTileFormModal.showTitle = _showTitle;
  }
  setbothDisplayLinkImage(displayboth: boolean) {
    this.displayboth = true;
    this.showTitle = displayboth;
    this.displayLinkImage = displayboth;
    this.buffAndEffectTileFormModal.showTitle = displayboth;
    this.buffAndEffectTileFormModal.displayLinkImage = displayboth;
  }
  setDisplayLinkImage(_displayLinkImage: boolean) {
    this.displayboth = false;
    this.showTitle = false;
    this.displayLinkImage = _displayLinkImage;
    this.buffAndEffectTileFormModal.showTitle = false;
    this.buffAndEffectTileFormModal.displayLinkImage = _displayLinkImage;
  }

  showMoreCommands(fieldName: any, _limit: number, _limitText: string) {


    if (fieldName == 'BuffAndEffect') {
      if (_limitText == "Show more") {
        this.limitTextBuffAndEffect = "Show less";
        this.limitBuffAndEffect = _limit;
      } else {
        this.limitTextBuffAndEffect = "Show more";
        this.limitBuffAndEffect = 4;
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
    this.buffAndEffectTileFormModal.titleTextColor = color.titleTextColor;
    this.buffAndEffectTileFormModal.titleBgColor = color.titleBgColor;
    this.buffAndEffectTileFormModal.bodyTextColor = color.bodyTextColor;
    this.buffAndEffectTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.buffAndEffectTileFormModal.titleTextColor,
      titleBgColor: this.buffAndEffectTileFormModal.titleBgColor,
      bodyTextColor: this.buffAndEffectTileFormModal.bodyTextColor,
      bodyBgColor: this.buffAndEffectTileFormModal.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });
  }

  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.buffAndEffectTileFormModal.titleTextColor = color.titleTextColor;
    this.buffAndEffectTileFormModal.titleBgColor = color.titleBgColor;
    this.buffAndEffectTileFormModal.bodyTextColor = color.bodyTextColor;
    this.buffAndEffectTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.buffAndEffectTileFormModal.titleTextColor,
      titleBgColor: this.buffAndEffectTileFormModal.titleBgColor,
      bodyTextColor: this.buffAndEffectTileFormModal.bodyTextColor,
      bodyBgColor: this.buffAndEffectTileFormModal.bodyBgColor
    }
    this.colorList.map((val) => { val.selected = false; });
  }

  setShape(value: number) {
    this.buffAndEffectTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }

  //getBuffAndEffectValue(val: any) {  
  //  this.buffAndEffectTileFormModal.multiBuffAndEffectsIds = [];

  // // this.buffAndEffectTileFormModal.buffAndEffectId = val.characterBuffAndEffectId;


  //  this.buffAndEffectTileFormModal.multiBuffAndEffectsIds.push(val.characterBuffAndEffectId);
  //}


  //getBuffAndEffectValueList(e: any, val: any) {
  //  if (e.target.checked) {



  //    //this.buffAndEffectTileFormModal.multiItemIds = [];
  //    //this.buffAndEffectTileFormModal.multiSpellIds = [];

  //  //  this.buffAndEffectTileFormModal.buffAndEffectId = val.characterBuffAndEffectId;


  //    this.BuffAndEffects.map((x) => {
  //      if (x.characterBuffAndEffectId == val.characterBuffAndEffectId)
  //        x.selected = true;
  //    });

  //    //this.buffAndEffectTileFormModal.multiAbilityIds.push(val.characterAbilityId);
  //  }
  //  else {
  //    this.BuffAndEffects.map((x) => {
  //      if (x.characterBuffAndEffectId == val.characterBuffAndEffectId)
  //        x.selected = false;
  //    });
  //    //this.buffAndEffectTileFormModal.multiAbilityIds.splice(this.buffAndEffectTileFormModal.multiAbilityIds.indexOf(val.characterAbilityId), 1);
  //  }
  //  this.buffAndEffectTileFormModal.multiBuffAndEffectsIds = [];
  //  this.BuffAndEffects.map((x) => {
  //    if (x.selected) {
  //      this.buffAndEffectTileFormModal.multiBuffAndEffectsIds.push(x.characterBuffAndEffectId);
  //    }
  //  });
  //}

  opencolorpopup() {
    this.bsModalRef = this.modalService.show(ColorsComponent, {
      class: 'modal-primary modal-md selectPopUpModal',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Select Tile Colors";
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.buffAndEffectTileFormModal.titleTextColor,
      titleBgColor: this.buffAndEffectTileFormModal.titleBgColor,
      bodyTextColor: this.buffAndEffectTileFormModal.bodyTextColor,
      bodyBgColor: this.buffAndEffectTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.buffAndEffectTileFormModal.titleTextColor = data.titleTextColor;
      this.buffAndEffectTileFormModal.titleBgColor = data.titleBgColor;
      this.buffAndEffectTileFormModal.bodyTextColor = data.bodyTextColor;
      this.buffAndEffectTileFormModal.bodyBgColor = data.bodyBgColor;

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
    if (!this.buffAndEffectTileFormModal.titleTextColor)
      this.buffAndEffectTileFormModal.titleTextColor = defaultColor;
    if (!this.buffAndEffectTileFormModal.titleBgColor)
      this.buffAndEffectTileFormModal.titleBgColor = defaultColor;
    if (!this.buffAndEffectTileFormModal.bodyTextColor)
      this.buffAndEffectTileFormModal.bodyTextColor = defaultColor;
    if (!this.buffAndEffectTileFormModal.bodyBgColor)
      this.buffAndEffectTileFormModal.bodyBgColor = defaultColor;
  }

  submitForm() {
    if (this.characterTileModel.characterId == 0 || this.characterTileModel.characterId == undefined) {
      this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.tileTypeId == 0 || this.characterTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Buffs & Effects tile is not selected.", MessageSeverity.error);
    }

    //else if (!this.buffAndEffectTileFormModal.multiBuffAndEffectsIds.length) {
    //  this.alertService.showMessage("", "Please select at least one Buff/Effect.", MessageSeverity.error);
    //}
    else {
      this.buffAndEffectTileFormModal.title = this.buffAndEffectTileFormModal.title ? this.buffAndEffectTileFormModal.title.trim() : undefined;

      this.buffAndEffectTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.characterTileModel.color = this.buffAndEffectTileFormModal.color;
      this.characterTileModel.shape = this.buffAndEffectTileFormModal.shape;
      this.characterTileModel.buffAndEffectTile = this.buffAndEffectTileFormModal;
      //this.setDefaultColors(this.buffAndEffectTileFormModal.color);
      this.buffAndEffectTileFormModal.showTitle = this.showTitle;
      this.buffAndEffectTileFormModal.displayLinkImage = this.displayLinkImage;

      this.isLoading = true;
      let _msg = this.buffAndEffectTileFormModal.buffAndEffectTileId == 0 || this.buffAndEffectTileFormModal.buffAndEffectTileId === undefined
        ? "Creating Buffs And Effects Tile..." : "Updating Buffs And Effects Tile...";
      this.alertService.startLoadingMessage("", _msg);
      this.addEditBuffAndEffectTile(this.characterTileModel);
    }
  }

  private addEditBuffAndEffectTile(modal) {

    //console.log(modal);
    this.isLoading = true;

    // modal.multiBuffAndEffectsIds = this.buffAndEffectTileFormModal.multiBuffAndEffectsIds
    //let flag = false;
    //if (modal.buffAndEffectTile.multiBuffAndEffectsIds.length) {
    //  if (modal.buffAndEffectTile.multiBuffAndEffectsIds[0].buffAndEffectTileId) {
    //    modal.buffAndEffectTile.multiBuffAndEffectsIds = modal.buffAndEffectTile.multiBuffAndEffectsIds.map((x) => {
    //      return { BuffAndEffectTileId: 0, CharacterBuffAndEffectId: x.characterBuffAndEffectId }
    //    })
    //    flag = true;
    //  }
    //}
    //if (!flag) {
    //  modal.buffAndEffectTile.multiBuffAndEffectsIds = modal.buffAndEffectTile.multiBuffAndEffectsIds.map((x) => {
    //    return { BuffAndEffectTileId: 0, CharacterBuffAndEffectId: x }
    //  })
    //}

    if (this.isManual) {
      this.buffAndEffectTileFormModal.isManual = true;
      this.buffAndEffectTileFormModal.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.buffAndEffectTileFormModal.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.buffAndEffectTileFormModal.isManual = false;
    }

    this.buffAndEffectTileService.createBuffAndEffectTile(modal)
      .subscribe(
        data => {

          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let message = modal.buffAndEffectTile.buffAndEffectTileId == 0 || modal.buffAndEffectTile.buffAndEffectTileId === undefined ? "Buffs & Effects Tile has been added successfully." : "Buffs & Effects Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateCharacterList(data);
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.buffAndEffectTile.buffAndEffectTileId == 0 || modal.buffAndEffectTile.buffAndEffectTileId === undefined ? "Unable to Add " : "Unable to Update ";
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
    //this.characterStatTileFormModal.showTitle = fontStyle;
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
