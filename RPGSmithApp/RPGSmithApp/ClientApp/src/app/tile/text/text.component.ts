import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { CharacterTile } from '../../core/models/tiles/character-tile.model';
import { TextTile } from '../../core/models/tiles/text-tile.model';
import { CharacterDashboardPage } from '../../core/models/view-models/character-dashboard-page.model';
import { Color } from '../../core/models/tiles/color.model';
import { TextTileService } from '../../core/services/tiles/text-tile.service';
import { SharedService } from '../../core/services/shared.service';
import { ColorService } from '../../core/services/tiles/color.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SHAPE_CLASS, SHAPE, VIEW } from '../../core/models/enums';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { Utilities } from '../../core/common/utilities';
import { ColorsComponent } from '../colors/colors.component';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextTileComponent implements OnInit {

  textTitle: any;
  description: any;
  showWebButtons: boolean;
  isLoading: boolean;
  shapeClass: string;

  characterTileModel = new CharacterTile();
  TextTileFormModal = new TextTile();

  color: any;
  selectedColor: string;
  colorList: Color[] = [];
  tileColor: any;
  pageId: number;

  characterId: number;
  title: string;
  pageDefaultData = new CharacterDashboardPage();
  showMoreLessColorText: string = "Advanced";
  showMoreLessColorToggle: boolean = true;
  defaultColorList: any = [];
  colorModel: Color = new Color();
  showDemo: boolean = false;
  tile: number;
  selectedStatType: number = 0;
  selectedIndex: number;

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService, private colorService: ColorService,
    private textTileService: TextTileService, private alertService: AlertService, private authService: AuthService,
    private localStorage: LocalStoreManager) {
    this.color = this.selectedColor;
  }

  ngOnInit() {
    setTimeout(() => {

      this.characterId = this.bsModalRef.content.characterId;
      this.title = this.bsModalRef.content.title;
      this.pageId = this.bsModalRef.content.pageId;
      let model = this.bsModalRef.content.tile;
      let view = this.bsModalRef.content.view;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

      this.characterTileModel = this.textTileService.textTileModelData(model, this.characterId, this.pageId, view, this.pageDefaultData);
      this.TextTileFormModal = Object.assign({}, this.characterTileModel.textTile);
      this.TextTileFormModal.color = this.characterTileModel.color;
      this.TextTileFormModal.shape = this.characterTileModel.shape;

      this.shapeClass = this.TextTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.TextTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);

      this.Initialize(this.TextTileFormModal);
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
    this.TextTileFormModal.titleTextColor = color.titleTextColor;
    this.TextTileFormModal.titleBgColor = color.titleBgColor;
    this.TextTileFormModal.bodyTextColor = color.bodyTextColor;
    this.TextTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.TextTileFormModal.titleTextColor,
      titleBgColor: this.TextTileFormModal.titleBgColor,
      bodyTextColor: this.TextTileFormModal.bodyTextColor,
      bodyBgColor: this.TextTileFormModal.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });
  }

  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.TextTileFormModal.titleTextColor = color.titleTextColor;
    this.TextTileFormModal.titleBgColor = color.titleBgColor;
    this.TextTileFormModal.bodyTextColor = color.bodyTextColor;
    this.TextTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.TextTileFormModal.titleTextColor,
      titleBgColor: this.TextTileFormModal.titleBgColor,
      bodyTextColor: this.TextTileFormModal.bodyTextColor,
      bodyBgColor: this.TextTileFormModal.bodyBgColor
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
      titleTextColor: this.TextTileFormModal.titleTextColor,
      titleBgColor: this.TextTileFormModal.titleBgColor,
      bodyTextColor: this.TextTileFormModal.bodyTextColor,
      bodyBgColor: this.TextTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.TextTileFormModal.titleTextColor = data.titleTextColor;
      this.TextTileFormModal.titleBgColor = data.titleBgColor;
      this.TextTileFormModal.bodyTextColor = data.bodyTextColor;
      this.TextTileFormModal.bodyBgColor = data.bodyBgColor;

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
    if (!this.TextTileFormModal.titleTextColor) {
      this.TextTileFormModal.titleTextColor = defaultColor;
    }
    if (!this.TextTileFormModal.titleBgColor) {
      this.TextTileFormModal.titleBgColor = defaultColor;
    }
    if (!this.TextTileFormModal.bodyTextColor) {
      this.TextTileFormModal.bodyTextColor = defaultColor;
    }
    if (!this.TextTileFormModal.bodyBgColor) {
      this.TextTileFormModal.bodyBgColor = defaultColor;
    }
  }


  validateSubmit() {
    if (this.characterTileModel.characterId == 0 || this.characterTileModel.characterId == undefined) {
      this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    }
    else if (this.characterTileModel.tileTypeId == 0 || this.characterTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "text tile is not selected.", MessageSeverity.error);
    }
    else {

      this.TextTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.characterTileModel.color = this.TextTileFormModal.color;
      this.characterTileModel.shape = this.TextTileFormModal.shape;
      this.characterTileModel.shape = this.TextTileFormModal.shape;

      this.characterTileModel.textTile = this.TextTileFormModal;

      this.isLoading = true;
      const _msg = this.TextTileFormModal.textTileId == 0 || this.TextTileFormModal.textTileId === undefined
        ? "Creating Text Tile..." : "Updating Text Tile...";

      this.alertService.startLoadingMessage("", _msg);

      this.addEdittextTile(this.characterTileModel);

    }
  }
  submitForm() {
    this.validateSubmit();
  }


  private addEdittextTile(modal) {
    this.isLoading = true;
    this.textTileService.createTextTile(modal)
      .subscribe(
        data => {
          // console.log(data);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          const message = modal.textTile.textTileId == 0 || modal.textTile.textTileId === undefined
            ? "Text Tile has been added successfully." : "Text Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateCharacterList(data);
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          const _message = modal.textTile.textTileId == 0 || modal.textTile.textTileId === undefined
            ? "Unable to Add " : "Unable to Update ";
          const Errors = Utilities.ErrorDetail(_message, error);
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


  setShape(value: number) {
    this.TextTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }

}

