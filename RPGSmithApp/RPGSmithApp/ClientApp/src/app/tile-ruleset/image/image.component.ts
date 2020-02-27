import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { RulesetTile } from '../../core/models/tiles/ruleset-tile.model';
import { ImageTile } from '../../core/models/tiles/image-tile.model';
import { Color } from '../../core/models/tiles/color.model';
import { RulesetDashboardPage } from '../../core/models/view-models/ruleset-dashboard-page.model';
import { ImageError, SHAPE_CLASS, SHAPE, VIEW } from '../../core/models/enums';
import { FileUploadService } from '../../core/common/file-upload.service';
import { ImageTileService } from '../../core/services/tiles/image-tile.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { RulesetTileService } from '../../core/services/ruleset-tile.service';
import { SharedService } from '../../core/services/shared.service';
import { AuthService } from '../../core/auth/auth.service';
import { ColorService } from '../../core/services/tiles/color.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { Utilities } from '../../core/common/utilities';
import { ColorsComponent } from '../../tile/colors/colors.component';
import { ImageSelectorComponent } from '../../shared/image-interface/image-selector/image-selector.component';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class RulesetImageTileComponent implements OnInit {
  public event: EventEmitter<any> = new EventEmitter();
  imageTitle: any;
  description: any;
  showWebButtons: boolean;
  fileToUpload: File = null;
  isLoading: boolean;
  shapeClass: string;

  rulesetTileModel = new RulesetTile();
  imageTileFormModal = new ImageTile();

  color: any;
  selectedColor: string;
  colorList: Color[] = [];
  tileColor: any;
  pageId: number;
  imageUrl: string;

  rulesetId: number;
  title: string;
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
  imageErrorMessage: string = ImageError.MESSAGE

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
    private imageTileService: ImageTileService, private alertService: AlertService, private authService: AuthService,
    private fileUploadService: FileUploadService, private localStorage: LocalStoreManager, private rulesetTileService: RulesetTileService,
    private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.color = this.selectedColor;
  }

  ngOnInit() {
    setTimeout(() => {

      this.rulesetId = this.bsModalRef.content.rulesetId;
      this.title = this.bsModalRef.content.title;
      this.pageId = this.bsModalRef.content.pageId;
      let model = this.bsModalRef.content.tile;
      let view = this.bsModalRef.content.view;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

      this.rulesetTileModel = this.imageTileService.imageTileRulesetModelData(model, this.rulesetId, this.pageId, view, this.pageDefaultData);
      this.imageTileFormModal = Object.assign({}, this.rulesetTileModel.imageTile);
      this.imageTileFormModal.color = this.rulesetTileModel.color;
      this.imageTileFormModal.shape = this.rulesetTileModel.shape;
      this.imageUrl = this.imageTileFormModal.imageUrl;

      this.bingImageUrl = this.imageTileFormModal.imageUrl;
      this.shapeClass = this.imageTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.imageTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);

      this.isManual = this.imageTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.imageTileFormModal.fontSize);
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.imageTileFormModal.fontSizeTitle);
      }

      this.Initialize(this.imageTileFormModal);
    }, 0);

  }

  private Initialize(Tile) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.setColorOnInit();
      this.rulesetTileService.getRecentColors<any>()
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
    this.imageTileFormModal.titleTextColor = color.titleTextColor;
    this.imageTileFormModal.titleBgColor = color.titleBgColor;
    this.imageTileFormModal.bodyTextColor = color.bodyTextColor;
    this.imageTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.imageTileFormModal.titleTextColor,
      titleBgColor: this.imageTileFormModal.titleBgColor,
      bodyTextColor: this.imageTileFormModal.bodyTextColor,
      bodyBgColor: this.imageTileFormModal.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });

  }
  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.imageTileFormModal.titleTextColor = color.titleTextColor;
    this.imageTileFormModal.titleBgColor = color.titleBgColor;
    this.imageTileFormModal.bodyTextColor = color.bodyTextColor;
    this.imageTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.imageTileFormModal.titleTextColor,
      titleBgColor: this.imageTileFormModal.titleBgColor,
      bodyTextColor: this.imageTileFormModal.bodyTextColor,
      bodyBgColor: this.imageTileFormModal.bodyBgColor
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
      titleTextColor: this.imageTileFormModal.titleTextColor,
      titleBgColor: this.imageTileFormModal.titleBgColor,
      bodyTextColor: this.imageTileFormModal.bodyTextColor,
      bodyBgColor: this.imageTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.imageTileFormModal.titleTextColor = data.titleTextColor;
      this.imageTileFormModal.titleBgColor = data.titleBgColor;
      this.imageTileFormModal.bodyTextColor = data.bodyTextColor;
      this.imageTileFormModal.bodyBgColor = data.bodyBgColor;

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
    if (!this.imageTileFormModal.titleTextColor)
      this.imageTileFormModal.titleTextColor = defaultColor;
    if (!this.imageTileFormModal.titleBgColor)
      this.imageTileFormModal.titleBgColor = defaultColor;
    if (!this.imageTileFormModal.bodyTextColor)
      this.imageTileFormModal.bodyTextColor = defaultColor;
    if (!this.imageTileFormModal.bodyBgColor)
      this.imageTileFormModal.bodyBgColor = defaultColor;
  }

  validateImageSize() {
    if ((this.fileToUpload.size / 1024) <= 250) {
      return true;
    }
    return false;
  }
  validateSubmit() {
    if (this.rulesetTileModel.rulesetId == 0 || this.rulesetTileModel.rulesetId == undefined) {
      this.alertService.showMessage("", "Ruleset is not selected.", MessageSeverity.error);
    }
    else if (this.rulesetTileModel.tileTypeId == 0 || this.rulesetTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Image tile is not selected.", MessageSeverity.error);
    }
    else {

      this.imageTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.rulesetTileModel.color = this.imageTileFormModal.color;
      this.rulesetTileModel.shape = this.imageTileFormModal.shape;
      this.rulesetTileModel.shape = this.imageTileFormModal.shape;

      this.rulesetTileModel.imageTile = this.imageTileFormModal;

      this.isLoading = true;
      let _msg = this.imageTileFormModal.imageTileId == 0 || this.imageTileFormModal.imageTileId === undefined ? "Creating Image Tile..." : "Updating Image Tile...";

      this.alertService.startLoadingMessage("", _msg);
      if (this.fileToUpload != null) {
        /*image upload then submit */
        this.fileUpload();
      }
      else if (this.bingImageUrl !== this.imageTileFormModal.imageUrl) {
        try {
          var regex = /(?:\.([^.]+))?$/;
          var extension = regex.exec(this.imageTileFormModal.imageUrl)[1];
          extension = extension ? extension : 'jpg';
        } catch{ }
        this.fileUploadFromBing(this.imageTileFormModal.imageUrl, extension);
      }
      else {
        this.addEditImageTile(this.rulesetTileModel);
      }
    }
  }
  submitForm() {
    this.validateSubmit();
  }

  private fileUploadFromBing(file: string, ext: string) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadFromURL<any>(user.id, file, ext)
        .subscribe(
          data => {
            this.imageTileFormModal.imageUrl = data.ImageUrl;
            this.imageUrl = data.ImageUrl;
            this.addEditImageTile(this.rulesetTileModel);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.addEditImageTile(this.rulesetTileModel);
          });
    }
  }

  private fileUpload() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {
      this.fileUploadService.fileUploadByUser<any>(user.id, this.fileToUpload)
        .subscribe(
          data => {
            this.imageTileFormModal.imageUrl = data.ImageUrl;
            this.imageUrl = data.ImageUrl;
            this.addEditImageTile(this.rulesetTileModel);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.addEditImageTile(this.rulesetTileModel);
          });
    }
  }

  private fileUploadOLD() {
    //file upload
    this.imageTileService.fileUpload(this.fileToUpload)
      .subscribe(
        data => {
          this.imageTileFormModal.imageUrl = data.ImageUrl;
          this.imageUrl = data.ImageUrl;
          this.addEditImageTile(this.rulesetTileModel);
        },
        error => {
          console.log(error);
          this.addEditImageTile(this.rulesetTileModel);
        });
  }

  private addEditImageTile(modal) {
    if (this.isManual) {
      this.imageTileFormModal.isManual = true;
      this.imageTileFormModal.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.imageTileFormModal.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.imageTileFormModal.isManual = false;
    }

    this.isLoading = true;
    this.imageTileService.createRulesetImageTile(modal)
      .subscribe(
        data => {
          // console.log(data);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let message = modal.imageTile.imageTileId == 0 || modal.imageTile.imageTileId === undefined ? "Image Tile has been added successfully." : "Image Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateRulesetDashboard(data);
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.imageTile.imageTileId == 0 || modal.imageTile.imageTileId === undefined ? "Unable to Add " : "Unable to Update ";
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


  readTempUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event: any) => {
        this.imageTileFormModal.imageUrl = event.target.result;
        this.imageUrl = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
      this.imageChangedEvent = event;
    }
  }
  fileInput(_files: FileList) {
    this.fileToUpload = _files.item(0);
    this.showWebButtons = false;
  }



  setShape(value: number) {
    this.imageTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }

  selectImage() {
    //this.bsModalRef = this.modalService.show(ImageInterfaceComponent, {
    //    class: 'modal-primary modal-md',
    //    ignoreBackdropClick: true,
    //    keyboard: false
    //});
    //this.bsModalRef.content.title = 'Search Image';
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
    this.bsModalRef.content.errorImage = '../assets/images/DefaultImages/Spell.jpg';
    //this.bsModalRef.content.imageChangedEvent = this.imageChangedEvent; //base 64 || URL
    this.bsModalRef.content.event.subscribe(data => {
      this.imageTileFormModal.imageUrl = data.base64;
      this.imageUrl = data.base64;
      this.fileToUpload = data.file;
      this.showWebButtons = false;
    });
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(image: string) {
    this.croppedImage = image;
  }
  imageLoaded() {
    // show cropper
  }
  loadImageFailed() {
    // show message
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
