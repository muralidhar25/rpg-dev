import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { VIEW, SHAPE, SHAPE_CLASS } from '../../core/models/enums';
import { Color } from '../../core/models/tiles/color.model';
import { ColorService } from '../../core/services/tiles/color.service';
import { AuthService } from '../../core/auth/auth.service';
import { SharedService } from '../../core/services/shared.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { Utilities } from '../../core/common/utilities';
import { CharactersCharacterStat } from '../../core/models/view-models/characters-character-stats.model';
import { CharacterStatClusterTile } from '../../core/models/tiles/character-stat-cluster-tile.model';
import { CharacterStatClusterTileService } from '../../core/services/tiles/character-stat-cluster-tile.service';
import { CharacterStats } from '../../core/models/view-models/character-stats.model';
import { ColorsComponent } from '../../tile/colors/colors.component';
import { RulesetTile } from '../../core/models/tiles/ruleset-tile.model';
import { RulesetDashboardPage } from '../../core/models/view-models/ruleset-dashboard-page.model';
import { CharacterStatService } from '../../core/services/character-stat.service';

@Component({
  selector: 'app-character-stat-cluster',
  templateUrl: './character-stat-cluster.component.html',
  styleUrls: ['./character-stat-cluster.component.scss']
})
export class RulesetCharacterStatClusterTileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  textTitle: any;
  description: any;
  showWebButtons: boolean;
  isLoading: boolean;
  shapeClass: string;

  rulesetTileModel = new RulesetTile();
  ClusterTileFormModal = new CharacterStatClusterTile();

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

  displayCharacterStat: CharacterStats[] = [];
  CharacterStatsList: CharacterStats[] = [];
  ClusterCharacterStatsList: any[] = [];
  query: string = '';

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
    private clusterTileService: CharacterStatClusterTileService, private alertService: AlertService, private authService: AuthService,
    private localStorage: LocalStoreManager, public charactersService: CharacterStatService) {
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

      this.rulesetTileModel = this.clusterTileService.clusterTileRulesetModelData(model, this.rulesetId, this.pageId, view, this.pageDefaultData);
      this.ClusterTileFormModal = Object.assign({}, this.rulesetTileModel.characterStatClusterTile);
      this.ClusterTileFormModal.color = this.rulesetTileModel.color;
      this.ClusterTileFormModal.shape = this.rulesetTileModel.shape;

      this.isManual = this.ClusterTileFormModal.isManual ? true : false;
      if (this.isManual) {
        this.selectedFontSize = this.fontOptions.filter(x => x.value == this.ClusterTileFormModal.fontSize);
        this.selectedFontSizeTitle = this.fontOptions.filter(x => x.value == this.ClusterTileFormModal.fontSizeTitle);
      }

      this.shapeClass = this.ClusterTileFormModal.shape == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (this.ClusterTileFormModal.shape == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);


      this.Initialize(this.ClusterTileFormModal);
    }, 0);

  }

  private Initialize(Tile) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.setColorOnInit();
      this.charactersService.getCharacterStatsByRuleset<CharacterStats[]>(this.rulesetId) //100=>for testing
        .subscribe((data: any) => {
          if (data && data.length) {


            this.CharacterStatsList = data;
            //this.CharacterStatsList.map((ccs:any) => {
            //  ccs.statName = ccs.characterStat.statName;
            //})
            this.ClusterCharacterStatsList = Object.assign([], this.CharacterStatsList)
            this.ClusterCharacterStatsList.map((cs) => {
              cs.selected = false;
            });
            if (this.rulesetTileModel.view == VIEW.EDIT) {
              this.displayCharacterStat = Object.assign([], this.CharacterStatsList.filter(x => (x.characterStatId == this.ClusterTileFormModal.displayCharactersCharacterStatID)));
              if (this.displayCharacterStat && this.displayCharacterStat.length) {
                let dummyCharStat: any = new CharactersCharacterStat();
                dummyCharStat.characterStatId = -1;
                dummyCharStat.statName = "<None>";
                let dummyStatArr = [];
                dummyStatArr.push(dummyCharStat);
                this.CharacterStatsList = dummyStatArr.concat(this.CharacterStatsList);
              }
              if (this.ClusterTileFormModal.clusterWithSortOrder) {
                let selectedIds = this.ClusterTileFormModal.clusterWithSortOrder.split(',');
                selectedIds.map((id) => {
                  this.ClusterCharacterStatsList.map((cs) => {
                    if (id == cs.characterStatId) {
                      cs.selected = true;
                    }

                  });
                })
              }
            }
          }
          // = data;                
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
          //this.isLoading = false;
        }, error => {
          //this.isLoading = false;
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
    this.ClusterTileFormModal.titleTextColor = color.titleTextColor;
    this.ClusterTileFormModal.titleBgColor = color.titleBgColor;
    this.ClusterTileFormModal.bodyTextColor = color.bodyTextColor;
    this.ClusterTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.ClusterTileFormModal.titleTextColor,
      titleBgColor: this.ClusterTileFormModal.titleBgColor,
      bodyTextColor: this.ClusterTileFormModal.bodyTextColor,
      bodyBgColor: this.ClusterTileFormModal.bodyBgColor
    }

    this.defaultColorList.map((val) => { val.selected = false; });
  }

  setdefaultColor(color: any) {

    this.tileColor = color.bgColor;
    this.defaultColorList.forEach(function (val) {
      val.selected = false;
    });
    color.selected = true;
    this.ClusterTileFormModal.titleTextColor = color.titleTextColor;
    this.ClusterTileFormModal.titleBgColor = color.titleBgColor;
    this.ClusterTileFormModal.bodyTextColor = color.bodyTextColor;
    this.ClusterTileFormModal.bodyBgColor = color.bodyBgColor;
    this.bsModalRef.content.color = this.tileColor;
    this.bsModalRef.content.colorModel = {
      titleTextColor: this.ClusterTileFormModal.titleTextColor,
      titleBgColor: this.ClusterTileFormModal.titleBgColor,
      bodyTextColor: this.ClusterTileFormModal.bodyTextColor,
      bodyBgColor: this.ClusterTileFormModal.bodyBgColor
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
      titleTextColor: this.ClusterTileFormModal.titleTextColor,
      titleBgColor: this.ClusterTileFormModal.titleBgColor,
      bodyTextColor: this.ClusterTileFormModal.bodyTextColor,
      bodyBgColor: this.ClusterTileFormModal.bodyBgColor
    }

    this.bsModalRef.content.event.subscribe(data => {
      this.selectedColor = data.color;
      this.tileColor = this.selectedColor;
      this.ClusterTileFormModal.titleTextColor = data.titleTextColor;
      this.ClusterTileFormModal.titleBgColor = data.titleBgColor;
      this.ClusterTileFormModal.bodyTextColor = data.bodyTextColor;
      this.ClusterTileFormModal.bodyBgColor = data.bodyBgColor;

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
    if (!this.ClusterTileFormModal.titleTextColor) {
      this.ClusterTileFormModal.titleTextColor = defaultColor;
    }
    if (!this.ClusterTileFormModal.titleBgColor) {
      this.ClusterTileFormModal.titleBgColor = defaultColor;
    }
    if (!this.ClusterTileFormModal.bodyTextColor) {
      this.ClusterTileFormModal.bodyTextColor = defaultColor;
    }
    if (!this.ClusterTileFormModal.bodyBgColor) {
      this.ClusterTileFormModal.bodyBgColor = defaultColor;
    }
  }


  validateSubmit() {
    if (!(this.displayCharacterStat
      && this.displayCharacterStat.length
      && this.displayCharacterStat[0]
      && this.displayCharacterStat[0].characterStatId > 0
    )) {
      this.displayCharacterStat = [];
    }
    if (this.rulesetTileModel.rulesetId == 0 || this.rulesetTileModel.rulesetId == undefined) {
      this.alertService.showMessage("", "Ruleset is not selected.", MessageSeverity.error);
    }
    else if (this.rulesetTileModel.tileTypeId == 0 || this.rulesetTileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Char Stat Cluster tile is not selected.", MessageSeverity.error);
    }
    else if (!this.ClusterTileFormModal.title && !this.displayCharacterStat.length) {
      this.alertService.showMessage("", "Please either fill Title or select Display Character Stat.", MessageSeverity.error);
    }
    else if (!(this.ClusterCharacterStatsList && this.ClusterCharacterStatsList.filter(x => x.selected).length)) {
      this.alertService.showMessage("", "Please select atleast one Cluster Character Stat.", MessageSeverity.error);
    }
    else {

      if (this.displayCharacterStat && this.displayCharacterStat.length && this.displayCharacterStat[0] && this.displayCharacterStat[0].characterStatId > 0) {
        this.ClusterTileFormModal.displayCharactersCharacterStatID = this.displayCharacterStat[0].characterStatId;
      }
      else {
        this.ClusterTileFormModal.displayCharactersCharacterStatID = null;
      }

      let selectedStats = this.ClusterCharacterStatsList.filter(x => x.selected);
      let selectedStatIds = [];
      selectedStats.map((s) => {
        selectedStatIds.push(s.characterStatId);
      })
      let idsString: string = selectedStatIds.join(',');
      this.ClusterTileFormModal.clusterWithSortOrder = idsString;

      this.ClusterTileFormModal.color = this.tileColor ? this.tileColor : '#343038';
      this.rulesetTileModel.color = this.ClusterTileFormModal.color;
      this.rulesetTileModel.shape = this.ClusterTileFormModal.shape;
      this.rulesetTileModel.shape = this.ClusterTileFormModal.shape;

      this.rulesetTileModel.characterStatClusterTile = this.ClusterTileFormModal;

      this.isLoading = true;
      const _msg = this.ClusterTileFormModal.characterStatClusterTileId == 0 || this.ClusterTileFormModal.characterStatClusterTileId === undefined
        ? "Creating Char Stat Cluster Tile..." : "Updating Char Stat Cluster Tile...";

      this.alertService.startLoadingMessage("", _msg);

      this.addEditClusterTile(this.rulesetTileModel);

    }
  }
  submitForm() {
    this.validateSubmit();
  }


  private addEditClusterTile(modal: RulesetTile) {
    if (this.isManual) {
      this.ClusterTileFormModal.isManual = true;
      this.ClusterTileFormModal.fontSizeTitle = this.selectedFontSizeTitle && this.selectedFontSizeTitle.length ? this.selectedFontSizeTitle[0].value : 20;
      this.ClusterTileFormModal.fontSize = this.selectedFontSize && this.selectedFontSize.length ? this.selectedFontSize[0].value : 20;
    } else {
      this.ClusterTileFormModal.isManual = false;
    }

    this.isLoading = true;
    this.clusterTileService.createRulesetClusterTile(modal)
      .subscribe(
        data => {
          // console.log(data);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          const message = modal.characterStatClusterTile.characterStatClusterTileId == 0 || modal.characterStatClusterTile.characterStatClusterTileId === undefined
            ? "Char Stat Cluster Tile has been added successfully." : "Char Stat Cluster Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateRulesetDashboard(data);
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          const _message = modal.characterStatClusterTile.characterStatClusterTileId == 0 || modal.characterStatClusterTile.characterStatClusterTileId === undefined
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


  setShape(value: number) {
    this.ClusterTileFormModal.shape = value;
    this.shapeClass = value == SHAPE.ROUNDED ? SHAPE_CLASS.ROUNDED : (value == SHAPE.CIRCLE ? SHAPE_CLASS.CIRCLE : SHAPE_CLASS.SQUARE);
  }
  get singleSelectSettings() {
    return {
      primaryKey: "characterStatId",
      labelKey: "statName",
      text: "select character stat",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "bottom"
    };
  }
  SelectStat(e, stat) {
    stat.selected = e.target.checked;
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
