import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ColorsComponent } from '../../tile/colors/colors.component';
import { TextTileService } from '../../../services/tiles/text-tile.service';
import { TextTile } from '../../../models/tiles/text-tile.model';
import { AuthService } from '../../../services/auth.service';
import { Utilities } from '../../../services/utilities';
import { SharedService } from "../../../services/shared.service";
import { RulesetTile } from '../../../models/tiles/ruleset-tile.model';
import { Color } from '../../../models/tiles/color.model';
import { ColorService } from '../../../services/tiles/color.service';
import { RulesetDashboardPage } from '../../../models/view-models/ruleset-dashboard-page.model';
import { VIEW, TILES, SHAPE, SHAPE_CLASS } from '../../../models/enums';
import { FileUploadService } from "../../../services/file-upload.service";
import { AlertService, MessageSeverity, DialogType } from '../../../services/alert.service';
import { DBkeys } from '../../../services/db-Keys';
import { User } from '../../../models/user.model';
import { LocalStoreManager } from '../../../services/local-store-manager.service';
import { RulesetTileService } from '../../../services/ruleset-tile.service';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class RulesetTextTileComponent implements OnInit {

    textTitle: any;
    description: any;
    showWebButtons: boolean;
    isLoading: boolean;
    shapeClass: string;

    rulesetTileModel = new RulesetTile();
    textTileFormModal = new TextTile();

    color: any;
    selectedColor: string;
    colorList: Color[] = [];
    tileColor: any;
    pageId: number;

    rulesetId: number;
    title: string;
    pageDefaultData = new RulesetDashboardPage();
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
        private fileUploadService: FileUploadService, private localStorage: LocalStoreManager, private rulesetTileService: RulesetTileService) {
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

            this.rulesetTileModel = this.textTileService.textTileRulesetModelData(model, this.rulesetId, this.pageId, view, this.pageDefaultData);
            this.textTileFormModal = Object.assign({}, this.rulesetTileModel.textTile);
            this.textTileFormModal.color = this.rulesetTileModel.color;
            this.textTileFormModal.shape = this.rulesetTileModel.shape;
            this.shapeClass = this.textTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.textTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);

            this.Initialize(this.textTileFormModal);
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
        this.textTileFormModal.titleTextColor = color.titleTextColor;
        this.textTileFormModal.titleBgColor = color.titleBgColor;
        this.textTileFormModal.bodyTextColor = color.bodyTextColor;
        this.textTileFormModal.bodyBgColor = color.bodyBgColor;
        this.bsModalRef.content.colorModel = {
            titleTextColor: this.textTileFormModal.titleTextColor,
            titleBgColor: this.textTileFormModal.titleBgColor,
            bodyTextColor: this.textTileFormModal.bodyTextColor,
            bodyBgColor: this.textTileFormModal.bodyBgColor
        }

        this.defaultColorList.map((val) => { val.selected = false; });

    }
    setdefaultColor(color: any) {

        this.tileColor = color.bgColor;
        this.defaultColorList.forEach(function (val) {
            val.selected = false;
        });
        color.selected = true;
        this.textTileFormModal.titleTextColor = color.titleTextColor;
        this.textTileFormModal.titleBgColor = color.titleBgColor;
        this.textTileFormModal.bodyTextColor = color.bodyTextColor;
        this.textTileFormModal.bodyBgColor = color.bodyBgColor;
        this.bsModalRef.content.color = this.tileColor;
        this.bsModalRef.content.colorModel = {
            titleTextColor: this.textTileFormModal.titleTextColor,
            titleBgColor: this.textTileFormModal.titleBgColor,
            bodyTextColor: this.textTileFormModal.bodyTextColor,
            bodyBgColor: this.textTileFormModal.bodyBgColor
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
            titleTextColor: this.textTileFormModal.titleTextColor,
            titleBgColor: this.textTileFormModal.titleBgColor,
            bodyTextColor: this.textTileFormModal.bodyTextColor,
            bodyBgColor: this.textTileFormModal.bodyBgColor
        }

        this.bsModalRef.content.event.subscribe(data => {
            this.selectedColor = data.color;
            this.tileColor = this.selectedColor;
            this.textTileFormModal.titleTextColor = data.titleTextColor;
            this.textTileFormModal.titleBgColor = data.titleBgColor;
            this.textTileFormModal.bodyTextColor = data.bodyTextColor;
            this.textTileFormModal.bodyBgColor = data.bodyBgColor;

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
        if (!this.textTileFormModal.titleTextColor)
            this.textTileFormModal.titleTextColor = defaultColor;
        if (!this.textTileFormModal.titleBgColor)
            this.textTileFormModal.titleBgColor = defaultColor;
        if (!this.textTileFormModal.bodyTextColor)
            this.textTileFormModal.bodyTextColor = defaultColor;
        if (!this.textTileFormModal.bodyBgColor)
            this.textTileFormModal.bodyBgColor = defaultColor;
    }

    validateSubmit() {
        if (this.rulesetTileModel.rulesetId == 0 || this.rulesetTileModel.rulesetId == undefined) {
            this.alertService.showMessage("", "Ruleset is not selected.", MessageSeverity.error);
        }
        else if (this.rulesetTileModel.tileTypeId == 0 || this.rulesetTileModel.tileTypeId == undefined) {
            this.alertService.showMessage("", "text tile is not selected.", MessageSeverity.error);
        }
        else {

            this.textTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
            this.rulesetTileModel.color = this.textTileFormModal.color;
            this.rulesetTileModel.shape = this.textTileFormModal.shape;
            this.rulesetTileModel.shape = this.textTileFormModal.shape;

            this.rulesetTileModel.textTile = this.textTileFormModal;

            this.isLoading = true;
            let _msg = this.textTileFormModal.textTileId == 0 || this.textTileFormModal.textTileId === undefined ? "Creating Text Tile..." : "Updating Text Tile...";

            this.alertService.startLoadingMessage("", _msg);
            this.addEdittextTile(this.rulesetTileModel);
        }
    }
    submitForm() {
        this.validateSubmit();
    }

    private addEdittextTile(modal) {
        this.isLoading = true;
        this.textTileService.createRulesetTextTile(modal)
            .subscribe(
                data => {
                    // console.log(data);
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();

                    let message = modal.textTile.textTileId == 0 || modal.textTile.textTileId === undefined ? "Text Tile has been added successfully." : "Text Tile has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.sharedService.updateRulesetDashboard(data);
                    this.close();
                },
                error => {
                    console.log(error);
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = modal.textTile.textTileId == 0 || modal.textTile.textTileId === undefined ? "Unable to Add " : "Unable to Update ";
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
        this.textTileFormModal.shape = value;
        this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
    }
}
