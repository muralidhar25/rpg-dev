import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Color } from '../../core/models/tiles/color.model';
import { ImageError, SHAPE, SHAPE_CLASS, VIEW, TOGGLE_TYPE } from '../../core/models/enums';
import { SharedService } from '../../core/services/shared.service';
import { ColorService } from '../../core/services/tiles/color.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { Utilities } from '../../core/common/utilities';
import { ImageSelectorComponent } from '../../shared/image-interface/image-selector/image-selector.component';
import { PlatformLocation } from '@angular/common';
import { ToggleTile, TileToggle, TileCustomToggle } from '../../core/models/view-models/toggle-tile.model';
import { ToggleTileService } from '../../core/services/tiles/toggle-tile.service';
import { RulesetTile } from '../../core/models/tiles/ruleset-tile.model';
import { RulesetDashboardPage } from '../../core/models/view-models/ruleset-dashboard-page.model';
import { ColorsComponent } from '../../tile/colors/colors.component';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class RulesetToggleTileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();

  color: any;
  fileToUpload: File = null;
  showWebButtons: boolean;
  tileColor: any;
  selectedColor: any;
  colorList: Color[] = [];
  isLoading: boolean;
  shapeClass: string;

  title: string;
  imageUrl: string;
  rulesetTileModel = new RulesetTile();
  toggleTileFormModal = new ToggleTile();
  tileToggleViewModel = new TileToggle();
  customToggleViewModel = new TileCustomToggle();

  pageId: number;
  rulesetId: number;
  pageDefaultData = new RulesetDashboardPage();
  uploadFromBing: boolean = false;
  bingImageUrl: string;
  bingImageExt: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showMoreLessColorText: string = "Advanced";
  showMoreLessColorToggle: boolean = true;
  defaultColorList: any = [];
  colorModel: Color = new Color();
  showDemo: boolean = false;
  tile: number;
  selectedStatType: number = 0;
  selectedIndex: number;
  imageErrorMessage: string = ImageError.MESSAGE;

  isManual: boolean = true;
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

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService, private colorService: ColorService,
    private alertService: AlertService, private authService: AuthService,
    private toggleTileService: ToggleTileService,
    private localStorage: LocalStoreManager, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.rulesetId;
      this.title = this.bsModalRef.content.title;
      this.pageId = this.bsModalRef.content.pageId;
      let model = this.bsModalRef.content.tile;
      let view = this.bsModalRef.content.view;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

      this.rulesetTileModel = this.toggleTileService.ToggleTileRulesetModelData(model, this.rulesetId, this.pageId, view, this.pageDefaultData);

      this.toggleTileFormModal = Object.assign({}, this.rulesetTileModel.toggleTile);

      this.toggleTileFormModal.color = this.toggleTileFormModal.color;
      this.toggleTileFormModal.shape = this.toggleTileFormModal.shape;

      this.shapeClass = this.toggleTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.toggleTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);

      this.isManual = this.toggleTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.toggleTileFormModal.fontSize);
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.toggleTileFormModal.fontSizeTitle);
      }

      if (this.rulesetTileModel.view == VIEW.EDIT) {
        this.tileToggleViewModel = Object.assign({}, this.toggleTileFormModal.tileToggle);
      }

      this.Initialize(this.toggleTileFormModal);

    }, 0);
  }

  private Initialize(Tile) {
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
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Error getting recent colors", error);
          if (Errors.sessionExpire) this.authService.logout(true);
          else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }, () => { });
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
  setColor(color: any) {
    this.tileColor = color.bgColor;
    this.colorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.toggleTileFormModal.titleTextColor = color.titleTextColor;
    this.toggleTileFormModal.titleBgColor = color.titleBgColor;
    this.toggleTileFormModal.bodyTextColor = color.bodyTextColor;
    this.toggleTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.toggleTileFormModal.titleTextColor,
      titleBgColor: this.toggleTileFormModal.titleBgColor,
      bodyTextColor: this.toggleTileFormModal.bodyTextColor,
      bodyBgColor: this.toggleTileFormModal.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });
  }

  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.toggleTileFormModal.titleTextColor = color.titleTextColor;
    this.toggleTileFormModal.titleBgColor = color.titleBgColor;
    this.toggleTileFormModal.bodyTextColor = color.bodyTextColor;
    this.toggleTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.toggleTileFormModal.titleTextColor,
      titleBgColor: this.toggleTileFormModal.titleBgColor,
      bodyTextColor: this.toggleTileFormModal.bodyTextColor,
      bodyBgColor: this.toggleTileFormModal.bodyBgColor
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

  opencolorpopup() {
    this.bsModalRef = this.modalService.show(ColorsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Select Tile Colors";
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.toggleTileFormModal.titleTextColor,
      titleBgColor: this.toggleTileFormModal.titleBgColor,
      bodyTextColor: this.toggleTileFormModal.bodyTextColor,
      bodyBgColor: this.toggleTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.toggleTileFormModal.titleTextColor = data.titleTextColor;
      this.toggleTileFormModal.titleBgColor = data.titleBgColor;
      this.toggleTileFormModal.bodyTextColor = data.bodyTextColor;
      this.toggleTileFormModal.bodyBgColor = data.bodyBgColor;

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
    if (!this.toggleTileFormModal.titleTextColor)
      this.toggleTileFormModal.titleTextColor = defaultColor;
    if (!this.toggleTileFormModal.titleBgColor)
      this.toggleTileFormModal.titleBgColor = defaultColor;
    if (!this.toggleTileFormModal.bodyTextColor)
      this.toggleTileFormModal.bodyTextColor = defaultColor;
    if (!this.toggleTileFormModal.bodyBgColor)
      this.toggleTileFormModal.bodyBgColor = defaultColor;
  }

  setShape(value: number) {
    this.toggleTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }

  validateImageSize() {
    if ((this.fileToUpload.size / 1024) <= 250) {
      return true;
    }
    return false;
  }
  validateSubmit() {
    this.toggleTileFormModal.tileToggle = this.tileToggleViewModel;
    console.log(this.toggleTileFormModal);

    if (this.rulesetTileModel.rulesetId == 0 || this.rulesetTileModel.rulesetId == undefined) {
      this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    }
    else if (this.rulesetTileModel.tileTypeId == 0 || this.rulesetTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Toggle tile is not selected.", MessageSeverity.error);
    }
    else {
      this.toggleTileFormModal.title = this.toggleTileFormModal.title ? this.toggleTileFormModal.title.trim() : undefined;

      this.toggleTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.rulesetTileModel.color = this.toggleTileFormModal.color;
      this.rulesetTileModel.shape = this.toggleTileFormModal.shape;
      this.rulesetTileModel.toggleTile = this.toggleTileFormModal;

      this.isLoading = true;
      let _msg = this.toggleTileFormModal.toggleTileId == 0 || this.toggleTileFormModal.toggleTileId === undefined ? "Creating Toggle Tile..." : "Updating Toggle Tile...";

      this.alertService.startLoadingMessage("", _msg);
      console.log(this.rulesetTileModel);
      this.addToggleTile(this.rulesetTileModel);
      this.isLoading = false;
    }
  }

  submitForm() {
    this.validateSubmit();
  }

  //private fileUploadFromBing(file: string, ext: string) {
  //    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
  //    if (user == null)
  //        this.authService.logout(true);
  //    else {
  //        this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
  //            .subscribe(
  //                data => {                        
  //                    this.imageUrl = data.ImageUrl;
  //                    //this.rulesetFormModal.thumbnailUrl = data.ThumbnailUrl;
  //                  this.addToggleTile(this.rulesetTileModel);
  //                },
  //                error => {
  //                    let Errors = Utilities.ErrorDetail('Error', error);
  //                    if (Errors.sessionExpire) {
  //                        this.authService.logout(true);
  //                    } else this.addToggleTile(this.rulesetTileModel);
  //                });
  //    }
  //}

  private addToggleTile(modal: RulesetTile) {
    //used to save toggle tile functionlaity

    if (this.isManual) {
      this.toggleTileFormModal.isManual = true;
      this.toggleTileFormModal.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.toggleTileFormModal.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.toggleTileFormModal.isManual = false;
    }

    this.isLoading = true;
    this.toggleTileService.createRulesetToggleTile(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let message = modal.toggleTile.toggleTileId == 0 || modal.toggleTile.toggleTileId === undefined ? "Toggle Tile has been added successfully." : "Toggle Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateRulesetDashboard(data)
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.toggleTile.toggleTileId == 0 || modal.toggleTile.toggleTileId === undefined ? "Unable to Add " : "Unable to Update ";
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
    this.destroyModalOnInit()
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }
  showButtons() {
    this.showWebButtons = true;
  }

  hideButtons() {
    this.showWebButtons = false;
  }

  setShowCheckbox(checked: boolean) {
    this.tileToggleViewModel.showCheckbox = checked;
  }

  selectedToggle(toggleViewModel: TileToggle, type) {
    toggleViewModel.display = type === TOGGLE_TYPE.DISPLAY ? true : false;
    toggleViewModel.yesNo = type === TOGGLE_TYPE.YESNO ? true : false;
    toggleViewModel.onOff = type === TOGGLE_TYPE.ONOFF ? true : false;
    toggleViewModel.isCustom = type === TOGGLE_TYPE.CUSTOM ? true : false;
    if (type === TOGGLE_TYPE.DISPLAY)
      toggleViewModel.showCheckbox = true;
    else if (type === TOGGLE_TYPE.CUSTOM) {
      toggleViewModel.tileCustomToggles = [];
      toggleViewModel.tileCustomToggles.push(
        { tileCustomToggleId: 0, image: '', toggleText: '' },
        { tileCustomToggleId: 0, image: '', toggleText: '' });
    }
  }

  addToggleImage(toggle: TileCustomToggle) {
    this.bsModalRef = this.modalService.show(ImageSelectorComponent, {
      class: 'modal-primary modal-sm selectPopUpModal',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'item';
    this.bsModalRef.content.image = toggle.image;
    this.bsModalRef.content.toggle = true;
    this.bsModalRef.content.view = toggle.image ? VIEW.EDIT : VIEW.ADD;
    this.bsModalRef.content.event.subscribe(data => {
      toggle.image = data.base64;
      // this.fileToUpload = data.file;
      toggle.toggleText = '';
    });
  }

  removeToggle(toggle: TileCustomToggle): void {
    this.tileToggleViewModel.tileCustomToggles
      .splice(this.tileToggleViewModel.tileCustomToggles.indexOf(toggle), 1);
  }
  showHidecustomFields() {
    this.showMoreLessColorToggle = !this.showMoreLessColorToggle;
  }
  addToggle(toggles: TileCustomToggle[]): void {
    toggles.push(
      { tileCustomToggleId: 0, image: '', toggleText: '' });
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
