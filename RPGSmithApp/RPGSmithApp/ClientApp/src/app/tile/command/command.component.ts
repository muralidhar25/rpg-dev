import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Color } from '../../core/models/tiles/color.model';
import { CharacterTile } from '../../core/models/tiles/character-tile.model';
import { CommandTile } from '../../core/models/tiles/command-tile.model';
import { CharacterDashboardPage } from '../../core/models/view-models/character-dashboard-page.model';
import { ImageError, SHAPE, SHAPE_CLASS, VIEW } from '../../core/models/enums';
import { SharedService } from '../../core/services/shared.service';
import { ColorService } from '../../core/services/tiles/color.service';
import { CommandTileService } from '../../core/services/tiles/command-tile.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { FileUploadService } from '../../core/common/file-upload.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { Utilities } from '../../core/common/utilities';
import { ColorsComponent } from '../colors/colors.component';
import { DiceComponent } from '../../shared/dice/dice/dice.component';
import { ImageSelectorComponent } from '../../shared/image-interface/image-selector/image-selector.component';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss']
})
export class CommandTileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();

  commandTitle: any;
  commandContent: any;
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
  characterTileModel = new CharacterTile();
  commandTileFormModal = new CommandTile();
  pageId: number;
  characterId: number;
  pageDefaultData = new CharacterDashboardPage();
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
    private commandTileService: CommandTileService, private alertService: AlertService, private authService: AuthService,
    private fileUploadService: FileUploadService, private localStorage: LocalStoreManager, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    //this.sharedService.getCommandData().subscribe(diceCommand => {
    //    if (+diceCommand.parentIndex === -1) {
    //        this.commandTileFormModal.command = diceCommand.command;
    //    }
    //});
  }

  ngOnInit() {
    setTimeout(() => {
      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.pageId = this.bsModalRef.content.pageId;
      let model = this.bsModalRef.content.tile;
      let view = this.bsModalRef.content.view;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

      this.characterTileModel = this.commandTileService.commandTileModelData(model, this.characterId, this.pageId, view, this.pageDefaultData);
      this.commandTileFormModal = Object.assign({}, this.characterTileModel.commandTile);
      this.commandTileFormModal.color = this.characterTileModel.color;
      this.commandTileFormModal.shape = this.characterTileModel.shape;
      this.shapeClass = this.commandTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.commandTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
      this.imageUrl = this.commandTileFormModal.imageUrl;

      this.isManual = this.commandTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.commandTileFormModal.fontSizeTitle);
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.commandTileFormModal.fontSize);
      }

      this.bingImageUrl = this.commandTileFormModal.imageUrl;

      this.Initialize(this.commandTileFormModal);

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
    this.commandTileFormModal.titleTextColor = color.titleTextColor;
    this.commandTileFormModal.titleBgColor = color.titleBgColor;
    this.commandTileFormModal.bodyTextColor = color.bodyTextColor;
    this.commandTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.commandTileFormModal.titleTextColor,
      titleBgColor: this.commandTileFormModal.titleBgColor,
      bodyTextColor: this.commandTileFormModal.bodyTextColor,
      bodyBgColor: this.commandTileFormModal.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });
  }

  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.commandTileFormModal.titleTextColor = color.titleTextColor;
    this.commandTileFormModal.titleBgColor = color.titleBgColor;
    this.commandTileFormModal.bodyTextColor = color.bodyTextColor;
    this.commandTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.commandTileFormModal.titleTextColor,
      titleBgColor: this.commandTileFormModal.titleBgColor,
      bodyTextColor: this.commandTileFormModal.bodyTextColor,
      bodyBgColor: this.commandTileFormModal.bodyBgColor
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
      titleTextColor: this.commandTileFormModal.titleTextColor,
      titleBgColor: this.commandTileFormModal.titleBgColor,
      bodyTextColor: this.commandTileFormModal.bodyTextColor,
      bodyBgColor: this.commandTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.commandTileFormModal.titleTextColor = data.titleTextColor;
      this.commandTileFormModal.titleBgColor = data.titleBgColor;
      this.commandTileFormModal.bodyTextColor = data.bodyTextColor;
      this.commandTileFormModal.bodyBgColor = data.bodyBgColor;

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
    if (!this.commandTileFormModal.titleTextColor)
      this.commandTileFormModal.titleTextColor = defaultColor;
    if (!this.commandTileFormModal.titleBgColor)
      this.commandTileFormModal.titleBgColor = defaultColor;
    if (!this.commandTileFormModal.bodyTextColor)
      this.commandTileFormModal.bodyTextColor = defaultColor;
    if (!this.commandTileFormModal.bodyBgColor)
      this.commandTileFormModal.bodyBgColor = defaultColor;
  }

  setShape(value: number) {
    this.commandTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }

  validateImageSize() {
    if ((this.fileToUpload.size / 1024) <= 250) {
      return true;
    }
    return false;
  }
  validateSubmit() {
    if (this.characterTileModel.characterId == 0 || this.characterTileModel.characterId == undefined) {
      this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.tileTypeId == 0 || this.characterTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Command tile is not selected.", MessageSeverity.error);
    }
    else {
      this.commandTileFormModal.title = this.commandTileFormModal.title ? this.commandTileFormModal.title.trim() : undefined;
      this.commandTileFormModal.imageUrl = this.commandTileFormModal.imageUrl ? this.commandTileFormModal.imageUrl.trim() : undefined;
      if (!this.commandTileFormModal.title && !this.commandTileFormModal.imageUrl && !this.commandTileFormModal.command) {
        //this.alertService.showMessage("", "An Image or a Title must be present. Please provide either to save.", MessageSeverity.error);
        this.alertService.showMessage("", "An Image or a Title And command must be present. Please provide command to save.", MessageSeverity.error);
        return false;
      }
      else {
        this.commandTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
        this.characterTileModel.color = this.commandTileFormModal.color;
        this.characterTileModel.shape = this.commandTileFormModal.shape;
        this.characterTileModel.commandTile = this.commandTileFormModal;

        this.isLoading = true;
        let _msg = this.commandTileFormModal.commandTileId == 0 || this.commandTileFormModal.commandTileId === undefined ? "Creating Command Tile..." : "Updating Command Tile...";

        this.alertService.startLoadingMessage("", _msg);
        if (this.fileToUpload != null) {
          /*image upload then submit */
          this.fileUpload();
        }
        else if (this.bingImageUrl !== this.commandTileFormModal.imageUrl) {
          try {
            var regex = /(?:\.([^.]+))?$/;
            var extension = regex.exec(this.commandTileFormModal.imageUrl)[1];
            extension = extension ? extension : 'jpg';
          } catch{ }
          this.fileUploadFromBing(this.commandTileFormModal.imageUrl, extension);
        }
        else {
          this.addEditCommandTile(this.characterTileModel);
        }
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
            this.imageUrl = data.ImageUrl;
            //this.rulesetFormModal.thumbnailUrl = data.ThumbnailUrl;
            this.addEditCommandTile(this.characterTileModel);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.addEditCommandTile(this.characterTileModel);
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
            this.commandTileFormModal.imageUrl = data.ImageUrl;
            this.imageUrl = data.ImageUrl;
            this.addEditCommandTile(this.characterTileModel);
          },
          error => {
            let Errors = Utilities.ErrorDetail('Error', error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            } else this.addEditCommandTile(this.characterTileModel);
          });
    }
  }

  private fileUploadOLD() {
    //file upload
    this.commandTileService.fileUpload(this.fileToUpload)
      .subscribe(
        data => {
          this.commandTileFormModal.imageUrl = data.ImageUrl;
          this.imageUrl = data.ImageUrl;

          this.addEditCommandTile(this.characterTileModel);
        },
        error => {
          console.log(error);
          this.addEditCommandTile(this.characterTileModel);
        });
  }

  private addEditCommandTile(modal) {

    if (this.isManual) {
      this.commandTileFormModal.isManual = true;
      this.commandTileFormModal.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.commandTileFormModal.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.commandTileFormModal.isManual = false;
    }

    this.isLoading = true;
    this.commandTileService.createCommandTile(modal)
      .subscribe(
        data => {
          // console.log(data);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let message = modal.commandTile.commandTileId == 0 || modal.commandTile.commandTileId === undefined ? "Command Tile has been added successfully." : "Command Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateCharacterList(data);
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = modal.commandTile.commandTileId == 0 || modal.commandTile.commandTileId === undefined ? "Unable to Add " : "Unable to Update ";
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

  CheckedSavedCommand(eve) {
    this.commandTileFormModal.isCommandChecked = eve.target.checked;
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
        this.commandTileFormModal.imageUrl = event.target.result;
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

  openDiceModal(index, command) {

    this.bsModalRef = this.modalService.show(DiceComponent, {
      class: 'modal-primary modal-md dice-screen',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.parentCommand = command;
    this.bsModalRef.content.inputIndex = index;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.closeevent.subscribe(diceCommand => {
      this.commandTileFormModal.command = diceCommand.command;
    });
  }

  removeImage() {
    this.imageUrl = null;
    this.commandTileFormModal.imageUrl = null;
    this.fileToUpload = null;
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
      this.commandTileFormModal.imageUrl = data.base64;
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
