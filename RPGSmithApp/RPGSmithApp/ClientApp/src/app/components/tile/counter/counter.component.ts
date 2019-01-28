import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ColorsComponent } from './../colors/colors.component';
import { CounterTileService } from '../../../services/tiles/counter-tile.service';
import { CounterTile } from '../../../models/tiles/counter-tile.model';
import { AlertService, MessageSeverity } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { VIEW, SHAPE, SHAPE_CLASS } from '../../../models/enums';
import { Utilities } from '../../../services/utilities';
import { SharedService } from "../../../services/shared.service";
import { ColorService } from '../../../services/tiles/color.service';
import { CharacterTile } from '../../../models/tiles/character-tile.model';
import { Color } from '../../../models/tiles/color.model';
import { CharacterDashboardPage } from '../../../models/view-models/character-dashboard-page.model';
import { User } from '../../../models/user.model';
import { DBkeys } from '../../../services/db-Keys';
import { LocalStoreManager } from '../../../services/local-store-manager.service';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterTileComponent implements OnInit {
    color: any;
    selectedColor: string;
    shapeClass: string;
    tileColor: any;
    colorList: Color[] = [];
    isLoading: boolean;

    characterTileModel:any = new CharacterTile();
    counterTileFormModal:any = new CounterTile();
    pageId: number;
    characterId: number;
    title: string;

    showMoreLessColorText: string = "Advanced";
    showMoreLessColorToggle: boolean = true;
    defaultColorList: any = [];
    colorModel: Color = new Color();
    showDemo: boolean = false;
    tile: number;
    selectedStatType: number = 0;
    selectedIndex: number;
    pageDefaultData = new CharacterDashboardPage();

    constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
        private colorService: ColorService, private localStorage: LocalStoreManager, private counterTileService: CounterTileService,
        private alertService: AlertService, private authService: AuthService) {
    }

    ngOnInit() {

        setTimeout(() => {
            
            this.characterId = this.bsModalRef.content.characterId;
            this.title = this.bsModalRef.content.title;
            this.pageId = this.bsModalRef.content.pageId;
            let model = this.bsModalRef.content.tile;
            let view = this.bsModalRef.content.view;
            this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

            this.characterTileModel = this.counterTileService.counterTileModelData(model, this.characterId, this.pageId, view, this.pageDefaultData);
            this.counterTileFormModal = Object.assign({}, this.characterTileModel.counterTile);
            this.counterTileFormModal.color = this.characterTileModel.color;
            this.counterTileFormModal.shape = this.characterTileModel.shape;
            this.shapeClass = this.counterTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.counterTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);

            this.Initialize(this.counterTileFormModal);
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
                    data.forEach((val, index)=> {
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
        this.counterTileFormModal.titleTextColor = color.titleTextColor;
        this.counterTileFormModal.titleBgColor = color.titleBgColor;
        this.counterTileFormModal.bodyTextColor = color.bodyTextColor;
        this.counterTileFormModal.bodyBgColor = color.bodyBgColor;
        this.bsModalRef.content.colorModel = {
            titleTextColor: this.counterTileFormModal.titleTextColor,
            titleBgColor: this.counterTileFormModal.titleBgColor,
            bodyTextColor: this.counterTileFormModal.bodyTextColor,
            bodyBgColor: this.counterTileFormModal.bodyBgColor
        }

        this.defaultColorList.map((val) => { val.selected = false; });
    }
   
    setdefaultColor(color: any) {

        this.tileColor = color.bgColor;
        this.defaultColorList.forEach(function (val) {
            val.selected = false;
        });
        color.selected = true;
        this.counterTileFormModal.titleTextColor = color.titleTextColor;
        this.counterTileFormModal.titleBgColor = color.titleBgColor;
        this.counterTileFormModal.bodyTextColor = color.bodyTextColor;
        this.counterTileFormModal.bodyBgColor = color.bodyBgColor;
        this.bsModalRef.content.color = this.tileColor;
        this.bsModalRef.content.colorModel = {
            titleTextColor: this.counterTileFormModal.titleTextColor,
            titleBgColor: this.counterTileFormModal.titleBgColor,
            bodyTextColor: this.counterTileFormModal.bodyTextColor,
            bodyBgColor: this.counterTileFormModal.bodyBgColor
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
            titleTextColor: this.counterTileFormModal.titleTextColor,
            titleBgColor: this.counterTileFormModal.titleBgColor,
            bodyTextColor: this.counterTileFormModal.bodyTextColor,
            bodyBgColor: this.counterTileFormModal.bodyBgColor
        }

        this.bsModalRef.content.event.subscribe(data => {
            this.selectedColor = data.color;
            this.tileColor = this.selectedColor;
            this.counterTileFormModal.titleTextColor = data.titleTextColor;
            this.counterTileFormModal.titleBgColor = data.titleBgColor;
            this.counterTileFormModal.bodyTextColor = data.bodyTextColor;
            this.counterTileFormModal.bodyBgColor = data.bodyBgColor;

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
        if (!this.counterTileFormModal.titleTextColor)
            this.counterTileFormModal.titleTextColor = defaultColor;
        if (!this.counterTileFormModal.titleBgColor)
            this.counterTileFormModal.titleBgColor = defaultColor;
        if (!this.counterTileFormModal.bodyTextColor)
            this.counterTileFormModal.bodyTextColor = defaultColor;
        if (!this.counterTileFormModal.bodyBgColor)
            this.counterTileFormModal.bodyBgColor = defaultColor;
    }

    setShape(value: number) {
        this.counterTileFormModal.shape = value;
        this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
    }

    submitForm() {
        
        let validForm = true;
        if (this.characterTileModel.characterId == 0 || this.characterTileModel.characterId == undefined) {
            this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
            validForm = false;
        }
        else if (this.characterTileModel.tileTypeId == 0 || this.characterTileModel.tileTypeId == undefined) {
            this.alertService.showMessage("", "Character tile is not selected.", MessageSeverity.error);
            validForm = false;
        }
        else if ((this.counterTileFormModal.minimum === undefined && this.counterTileFormModal.maximum !== undefined)
            || (this.counterTileFormModal.minimum === null && this.counterTileFormModal.maximum !== null)) {
            this.alertService.showMessage("", "The minimum value can not be empty if maximum value is provided.", MessageSeverity.error);
            validForm = false;
        }
        else if ((this.counterTileFormModal.minimum !== undefined && this.counterTileFormModal.maximum === undefined)
            || (this.counterTileFormModal.minimum !== null && this.counterTileFormModal.maximum === null)) {
            this.alertService.showMessage("", "The maximum value can not be empty if minimum value is provided.", MessageSeverity.error);
            validForm = false;
        }
        else if ((this.counterTileFormModal.minimum && this.counterTileFormModal.maximum)
            || (this.counterTileFormModal.minimum === 0 || this.counterTileFormModal.maximum === 0)) {
            
            if (this.counterTileFormModal.minimum > this.counterTileFormModal.maximum) {
                this.alertService.showMessage("", "The minimum value could not be greater than the maximum value.", MessageSeverity.error);
                validForm = false;
            }
            else if (this.counterTileFormModal.defaultValue !== undefined) {
                if (this.counterTileFormModal.minimum > this.counterTileFormModal.defaultValue
                    || this.counterTileFormModal.maximum < this.counterTileFormModal.defaultValue
                ) {
                    this.alertService.showMessage("", "The Default Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
                    validForm = false;
                }
            }
            if (this.counterTileFormModal.currentValue !== undefined) {
                if (this.counterTileFormModal.minimum > this.counterTileFormModal.currentValue
                    || this.counterTileFormModal.maximum < this.counterTileFormModal.currentValue
                ) {
                    if (validForm)
                        this.alertService.showMessage("", "The Current Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
                    validForm = false;
                }
            }
        }

        if (validForm) {

            //if (this.characterTileModel.counterTile.minimum === undefined && this.characterTileModel.counterTile.maximum === undefined) {
            //    this.characterTileModel.counterTile.minimum = -1;
            //    this.characterTileModel.counterTile.maximum = -1;
            //}

            this.counterTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
            this.characterTileModel.color = this.counterTileFormModal.color;
            this.characterTileModel.shape = this.counterTileFormModal.shape;
            //this.setDefaultColors(this.counterTileFormModal.color);
            this.characterTileModel.counterTile = this.counterTileFormModal;

            this.isLoading = true;
            let _msg = this.counterTileFormModal.counterTileId == 0 || this.counterTileFormModal.counterTileId === undefined ? "Creating Counter Tile..." : "Updating Counter Tile...";

            this.alertService.startLoadingMessage("", _msg);
            this.addEditCounterTile(this.characterTileModel);
        }
    }  

    private addEditCounterTile(modal) {
        
        this.isLoading = true;
        this.counterTileService.createCounterTile(modal)
            .subscribe(
                data => {
                   // console.log(data);
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();

                    let message = modal.counterTile.counterTileId == 0 || modal.counterTile.counterTileId === undefined ? "Counter Tile has been added successfully." : "Counter Tile has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.sharedService.updateCharacterList(data);
                    this.close();
                },
                error => {
                    console.log(error);
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = modal.counterTile.counterTileId == 0 || modal.counterTile.counterTileId === undefined ? "Unable to Add " : "Unable to Update ";
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
        this.destroyModalOnInit();
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }
   
}
