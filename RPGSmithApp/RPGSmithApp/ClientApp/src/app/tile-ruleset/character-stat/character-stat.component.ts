import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { RulesetTile } from '../../core/models/tiles/ruleset-tile.model';
import { Color } from '../../core/models/tiles/color.model';
import { CharacterStatTile } from '../../core/models/tiles/character-stat-tile.model';
import { VIEW, SHAPE_CLASS, SHAPE, STAT_TYPE, BLOB_TYPE } from '../../core/models/enums';
import { RulesetDashboardPage } from '../../core/models/view-models/ruleset-dashboard-page.model';
import { SharedService } from '../../core/services/shared.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { ColorService } from '../../core/services/tiles/color.service';
import { AuthService } from '../../core/auth/auth.service';
import { RulesetTileService } from '../../core/services/ruleset-tile.service';
import { CharacterStatService } from '../../core/services/character-stat.service';
import { CharacterStatTileService } from '../../core/services/tiles/character-stat-tile.service';
import { CharactersCharacterStatService } from '../../core/services/characters-character-stat.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from '../../core/models/user.model';
import { CharacterStats } from '../../core/models/view-models/character-stats.model';
import { Utilities } from '../../core/common/utilities';
import { ColorsComponent } from '../../tile/colors/colors.component';
import { PlatformLocation } from '@angular/common';
import { ImageSelectorComponent } from '../../shared/image-interface/image-selector/image-selector.component';
import { FileUploadService } from '../../core/common/file-upload.service';

@Component({
  selector: 'app-character-stat',
  templateUrl: './character-stat.component.html',
  styleUrls: ['./character-stat.component.scss']
})
export class RulesetCharacterStatTileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  content: any;
  color: any;
  limitText: string = "Show more";
  limit: number = 4;
  stats: any;
  isLoading: boolean = false;
  title: string;
  statsList: Array<any> = [];
  selectedColor: string;
  shapeClass: string;
  colorList: Color[] = [];
  characterStatId: any;
  tileColor: any;
  rangeValue: number;
  VIEW = VIEW;

  rulesetTileModel = new RulesetTile();
  characterStatTileFormModal = new CharacterStatTile();
  pageId: number;
  rulesetId: number;
  showTitle: boolean = true;
  query: string = '';
  pageDefaultData = new RulesetDashboardPage();
  selectedStatType: number = 0;

  showMoreLessColorText: string = "Advanced";
  showMoreLessColorToggle: boolean = true;
  defaultColorList: any = [];
  colorModel: Color = new Color();
  showDemo: boolean = false;
  tile: number;
  hasCommand: boolean;
  showWebButtons: boolean;
  imageUrl: string;
  fileToUpload: File = null;

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

  constructor(private bsModalRef: BsModalRef, private sharedService: SharedService,
    private colorService: ColorService, private modalService: BsModalService, public localStorage: LocalStoreManager,
    private authService: AuthService,
    private rulesetTileService: RulesetTileService,
    private charactersService: CharacterStatService,
    public characterStatTileService: CharacterStatTileService,
    public characterStatService: CharactersCharacterStatService,
    private alertService: AlertService
    , private location: PlatformLocation, private fileUploadService: FileUploadService) {
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

      this.rulesetTileModel = this.characterStatTileService.rulesetCharacterStatTileModelData(model, this.rulesetId, this.pageId, view, this.pageDefaultData);
      this.characterStatTileFormModal = Object.assign({}, this.rulesetTileModel.characterStatTile);
      this.characterStatTileFormModal.color = this.rulesetTileModel.color;
      this.characterStatTileFormModal.shape = this.rulesetTileModel.shape;

      this.imageUrl = this.characterStatTileFormModal.imageUrl;

      this.isManual = this.characterStatTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.characterStatTileFormModal.fontSize);
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.characterStatTileFormModal.fontSizeTitle);
      }

      this.Initialize(view, this.characterStatTileFormModal);

      this.shapeClass = this.characterStatTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.characterStatTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
      this.showTitle = this.characterStatTileFormModal.showTitle;
    }, 0);
  }

  private Initialize(view, Tile) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.setColorOnInit();
      /*To get all the character-stat entries*/
      this.charactersService.getCharacterStatsByRuleset<CharacterStats[]>(this.rulesetId)
        .subscribe(data => {
          this.isLoading = false;
          this.statsList = data;
          //changes for #540
          let countCommandSTAT = 0;
          this.statsList.map((x) => {

            if (x.characterStatTypeViewModel.characterStatTypeId === STAT_TYPE.Command
              && x.characterStatId === this.rulesetTileModel.characterStatTile.characterStatId) {
              countCommandSTAT += 1;
              if (countCommandSTAT === 1) this.hasCommand = true;
              else this.hasCommand = false;
            }
          });
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { });
      //this.characterStatService.getCharactersCharacterStat<any[]>(this.rulesetId, -1, -1) //100=>for testing
      //    .subscribe(data => {
      //        // console.log(data);
      //        this.statsList = data;
      //        this.isLoading = false;
      //    }, error => {
      //        this.isLoading = false;
      //    }, () => { });

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
        }, error => {
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Error getting recent colors", error);
          if (Errors.sessionExpire) this.authService.logout(true);
          else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }, () => { });
      try {

        this.selectedStatType = view == VIEW.EDIT
          ? this.rulesetTileModel.characterStatTile.charactersCharacterStat.characterStat.characterStatTypeId
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

    this.characterStatId = stat.characterStatId;
    this.characterStatTileFormModal.characterStatId = stat.characterStatId;
    this.selectedStatType = stat.characterStatTypeViewModel.characterStatTypeId;
    this.rulesetTileModel.multiCharacterStats = [];
    this.rulesetTileModel.multiCharacterStats.push({
      characterStatId: stat.characterStatId,
      characterStatTypeId: stat.characterStatTypeViewModel.characterStatTypeId,
      image: undefined
    });


    if (stat.characterStatTypeViewModel.characterStatTypeId == STAT_TYPE.Command) {
      this.hasCommand = true;
    } else this.hasCommand = false;
  }

  getStatValue(event: any, stat: any) {

    if (event.target.checked) {

      this.characterStatId = stat.characterStatId;
      this.characterStatTileFormModal.characterStatId = stat.characterStatId;
      //this.selectedStatType = stat.characterStatTypeViewModel.characterStatTypeId;

      this.rulesetTileModel.multiCharacterStats.push({
        characterStatId: stat.characterStatId,
        characterStatTypeId: stat.characterStatTypeViewModel.characterStatTypeId,
        image: undefined
      });


      let countCommandSTAT = 0;
      this.rulesetTileModel.multiCharacterStats.map((x) => {
        if (x.characterStatTypeId === STAT_TYPE.Command) {
          countCommandSTAT += 1;
        }
      });
      if (countCommandSTAT === 1) {
        this.hasCommand = true;
      } else this.hasCommand = false;
    }
    else {
      this.rulesetTileModel.multiCharacterStats = this.rulesetTileModel.multiCharacterStats.filter(x => x.characterStatId != stat.characterStatId);
      //this.rulesetTileModel.multiCharacterStats
      //    .splice(this.rulesetTileModel.multiCharacterStats.indexOf({
      //        characterStatId: stat.characterStatId,
      //        characterStatTypeId: stat.characterStatTypeViewModel.characterStatTypeId
      //    }), 1);


      if (stat.characterStatTypeViewModel.characterStatTypeId == STAT_TYPE.Command) {
        this.hasCommand = false;
      }
    }
  }


  setShowTitle(_showTitle: boolean) {
    this.showTitle = _showTitle;
    this.characterStatTileFormModal.showTitle = _showTitle;
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
    if (this.rulesetTileModel.rulesetId == 0 || this.rulesetTileModel.rulesetId == undefined) {
      this.alertService.showMessage("", "Ruleset is not selected.", MessageSeverity.error);
    }
    else if (this.rulesetTileModel.tileTypeId == 0 || this.rulesetTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Ruleset Stat tile type is not selected.", MessageSeverity.error);
    }
    else if (this.rulesetTileModel.view === VIEW.EDIT && (this.characterStatTileFormModal.characterStatId == 0 || this.characterStatTileFormModal.characterStatId == undefined)) {
      this.alertService.showMessage("", "Character Stat is not selected.", MessageSeverity.error);
    }
    else if (this.rulesetTileModel.view === VIEW.ADD && this.rulesetTileModel.multiCharacterStats == undefined) {
      this.alertService.showMessage("Please select atleast one character stat.", "", MessageSeverity.error);
    }
    else if (this.rulesetTileModel.view === VIEW.ADD && this.rulesetTileModel.multiCharacterStats.length == 0) {
      this.alertService.showMessage("Please select atleast one character stat.", "", MessageSeverity.error);
    }
    else {

      this.characterStatTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.rulesetTileModel.color = this.characterStatTileFormModal.color;
      this.rulesetTileModel.shape = this.characterStatTileFormModal.shape;

      //this.setDefaultColors(this.characterStatTileFormModal.color);
      this.rulesetTileModel.characterStatTile = this.characterStatTileFormModal;

      this.isLoading = true;
      let _msg = this.characterStatTileFormModal.characterStatTileId == 0 || this.characterStatTileFormModal.characterStatTileId === undefined
        ? "Creating Character Stat Tile..." : "Updating Character Stat Tile...";

      this.alertService.startLoadingMessage("", _msg);


      if (this.imageUrl != null)  /*image upload then submit */
        this.fileUpload();
      else
        this.addEditCharacterStatTile(this.rulesetTileModel);
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
    this.rulesetTileService.createRulesetCharacterStatTile(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = modal.characterStatTile.characterStatTileId == 0 || modal.characterStatTile.characterStatTileId === undefined ? "Character Stat Tile has been added successfully." : "Character Stat Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);

          this.sharedService.updateRulesetDashboard(data);
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
  IsStatChecked(stat: any): boolean {
    if (this.rulesetTileModel.multiCharacterStats) {
      if (this.rulesetTileModel.multiCharacterStats.length) {
        if (this.rulesetTileModel.multiCharacterStats.filter(x => x.characterStatId == stat.characterStatId).length) {
          return true;
        }
      }
    }
    return false;
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
  private fileUpload() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout(true);
    else {

      if (this.imageUrl.indexOf(BLOB_TYPE.blob) > -1) {
        if (this.rulesetTileModel.view == VIEW.EDIT) this.characterStatTileFormModal.imageUrl = this.imageUrl;
        else
          this.rulesetTileModel.multiCharacterStats.map((x) => {
            if (x.characterStatTypeId === STAT_TYPE.Command && this.hasCommand) {
              x.image = this.imageUrl;
              this.characterStatTileFormModal.imageUrl = this.imageUrl;
            }
          });
        this.addEditCharacterStatTile(this.rulesetTileModel);
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
              this.rulesetTileModel.multiCharacterStats.map((x) => {
                if (x.characterStatTypeId === STAT_TYPE.Command && this.hasCommand) {
                  x.image = this.imageUrl;
                  this.characterStatTileFormModal.imageUrl = this.imageUrl;
                }
              });
              this.rulesetTileModel.characterStatTile.imageUrl = data.ImageUrl;
              this.addEditCharacterStatTile(this.rulesetTileModel);
            },
            error => {
              let Errors = Utilities.ErrorDetail('Error', error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              else this.addEditCharacterStatTile(this.rulesetTileModel);
            });
      }

    }
  }
  removeImage() {
    this.imageUrl = null;
    this.characterStatTileFormModal.imageUrl = null;
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
