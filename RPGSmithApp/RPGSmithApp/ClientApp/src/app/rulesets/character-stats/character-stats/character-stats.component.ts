import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter, HostListener } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { DragulaService, dragula } from 'ng2-dragula/ng2-dragula';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { ConditionOperator, CharacterStats } from '../../../core/models/view-models/character-stats.model';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AlertService, MessageSeverity, DialogType } from '../../../core/common/alert.service';
import { CharacterStatService } from '../../../core/services/character-stat.service';
import { SharedService } from '../../../core/services/shared.service';
import { RulesetService } from '../../../core/services/ruleset.service';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { DBkeys } from '../../../core/common/db-keys';
import { CharacterStatsFormComponent } from '../character-stats-form/character-stats-form.component';
import { STAT_TYPE } from '../../../core/models/enums';
import { Utilities } from '../../../core/common/utilities';
import { AppService1 } from '../../../app.service';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';
import { Characters } from '../../../core/models/view-models/characters.model';
import { User } from '../../../core/models/user.model';
import { ServiceUtil } from '../../../core/services/service-util';


@Component({
  selector: 'character-stats',
  templateUrl: './character-stats.component.html',
  styleUrls: ['./character-stats.component.scss']
})

export class CharacterStatsComponent implements OnInit {

  rulesetModel: any;
  showActions: boolean = true;
  actionText: string;
  query: string;
  ruleSetId: number;
  page?: number = 1;
  pagesize?: number = 10;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
  characterStatTypeList: any[] = [];
  isLoading = false;

  characterStats: any; //CharacterStats[];
  _typeOptions: any[] = [];
  noRecordFound: boolean = false;
  ConditionOperators: ConditionOperator[] = [];
  IsGm: boolean = false;
  searchText: string;

  constructor(
    private router: Router, private route: ActivatedRoute, private authService: AuthService, private localStorage: LocalStoreManager,
    private alertService: AlertService, private rulesetService: RulesetService,
    private charactersService: CharacterStatService, private modalService: BsModalService,
    private sharedService: SharedService, private dragulaService: DragulaService, public appService: AppService1
  ) {
    const bag: any = this.dragulaService.find('bag-characterStats');
    if (bag !== undefined) this.dragulaService.destroy('bag-characterStats');

    this.dragulaService.setOptions('bag-characterStats', {
      revertOnSpill: true,
      //copySortSource: false
    });

    dragulaService.drop.subscribe((value: any[]) => {
      const [bagName, e, el] = value;
      this.onDrop(value.slice(1));
    });

    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
    let isNewTab = false;
    let url = this.router.url.toLowerCase();
    if (url && url.split('?') && url.split('?')[1]) {
      let serachParams = new URLSearchParams(url.split('?')[1]);
      isNewTab = (serachParams.get("l") === "1");
    }
    if (isNewTab) {
      this.appService.updateOpenWindowInNewTab(true);
      if (this.ruleSetId) {
        let RuleSetID = ServiceUtil.DecryptID(this.ruleSetId);
        this.ruleSetId = +RuleSetID;
        let displayURL = '/ruleset/character-stats';
        let originalURl = '/ruleset/character-stats/' + RuleSetID;
        Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
      }
    }

    this.sharedService.shouldUpdateCharacterStattList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        this.initialize();
      }
    });
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className.endsWith("is-show"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }

  ngOnInit() {
    //this.route.params.subscribe(params => { this.ruleSetId = params['id']; }); let isNewTab = false;
    this.setRulesetId(this.ruleSetId);
    this.destroyModalOnInit();
    this.initialize();
    this.showActionButtons(this.showActions);

  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
      }
    }
    /*To get Character-stat Type List*/
    this.isLoading = true;
    this.charactersService.getCharacterStatTypeList<any[]>()
      .subscribe(
        data => {

          this.characterStatTypeList = data//.filter((val) => val.characterStatTypeId != 14);
          this.characterStatTypeList.forEach((val) => {
            val.icon = this.charactersService.getIcon(val.statTypeName);
          });
        },
        error => {
          console.log("Error: ", error);
        }, () => { });
    this.charactersService.getCharacterStatConditionOperatorList<any[]>()
      .subscribe(
        data => {

          this.ConditionOperators = data;

        },
        error => {
          console.log("Error: ", error);
        }, () => { });

    /*To get all the character-stat entries*/
    this.charactersService.getCharacterStatsByRuleset_Cache<CharacterStats[]>(this.ruleSetId)
      .subscribe(data => {
        this.isLoading = false;
        this.characterStats = data;

        this.characterStats.forEach((val) => {
          val.characterStatTypeId = val.characterStatTypeViewModel.characterStatTypeId
          val.icon = this.charactersService.getIcon(val.characterStatTypeViewModel.statTypeName);
        });
        try {
          this.noRecordFound = !data.length;
        } catch (err) { }
        this._typeOptions = this.charactersService.getOptions(data);
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });

    /*To get ruleset*/
    this.rulesetService.getRulesetById<Ruleset>(this.ruleSetId)
      .subscribe(data => {
        this.rulesetModel = data;
        this.setHeaderValues(data);
      }, error => { }, () => { });
  }

  private setHeaderValues(ruleset: Ruleset): any {
    try {
      let headerValues = {
        headerName: ruleset.ruleSetName,
        headerImage: ruleset.imageUrl ? ruleset.imageUrl : 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png',
        headerId: ruleset.ruleSetId,
        headerLink: 'ruleset',
        hasHeader: true
      };
      this.appService.updateAccountSetting1(headerValues);
      this.sharedService.updateAccountSetting(headerValues);
      this.localStorage.deleteData(DBkeys.HEADER_VALUE);
      this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
    } catch (err) { }
  }

  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  manageIcon(id: number) {
    this.characterStats.forEach(function (val) {
      if (id == val.characterStatId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    })
  }

  newCharacterStat() {
    this.bsModalRef = this.modalService.show(CharacterStatsFormComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'New Character Stat';
    this.bsModalRef.content.button = 'SAVE';
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.characterStatTypeViewModel = { ruleSetId: this.ruleSetId };
    this.bsModalRef.content.characterStatTypeList = this.characterStatTypeList;
    this.bsModalRef.content.typeOptions = this._typeOptions;
    this.bsModalRef.content.characterStats = this.characterStats.filter(x => x.characterStatTypeId != STAT_TYPE.Condition).map((x) => {
      return { characterStatId: x.characterStatId, statName: x.statName, typeId: x.characterStatTypeId }
    });
    this.bsModalRef.content.ConditionOperators = this.ConditionOperators;
    let result = this.characterStats.filter(s => s.characterStatTypeViewModel.characterStatTypeId == STAT_TYPE.Choice);
    this.bsModalRef.content.Choices = result;
  }

  editCharacterStat(CharacterStat: CharacterStats) {
    this.bsModalRef = this.modalService.show(CharacterStatsFormComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Character Stat';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.characterStatTypeViewModel = CharacterStat;
    this.bsModalRef.content.characterStatTypeList = this.characterStatTypeList;
    this.bsModalRef.content.typeOptions = this._typeOptions;
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.characterStats = this.characterStats.filter(x => x.characterStatTypeId != STAT_TYPE.Condition).map((x) => {
      return { characterStatId: x.characterStatId, statName: x.statName, typeId: x.characterStatTypeId }
    });
    this.bsModalRef.content.ConditionOperators = this.ConditionOperators;
    let result = this.characterStats.filter(s => s.characterStatTypeViewModel.characterStatTypeId == STAT_TYPE.Choice);
    this.bsModalRef.content.Choices = result;
  }

  duplicateCharacterStat(CharacterStat: CharacterStats) {
    this.bsModalRef = this.modalService.show(CharacterStatsFormComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Duplicate Character Stat';
    this.bsModalRef.content.button = 'DUPLICATE';
    this.bsModalRef.content.characterStatTypeViewModel = CharacterStat;
    this.bsModalRef.content.characterStatTypeList = this.characterStatTypeList;
    this.bsModalRef.content.typeOptions = this._typeOptions;
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.characterStats = this.characterStats.filter(x => x.characterStatTypeId != STAT_TYPE.Condition).map((x) => {
      return { characterStatId: x.characterStatId, statName: x.statName, typeId: x.characterStatTypeId }
    });
    this.bsModalRef.content.ConditionOperators = this.ConditionOperators;
    let result = this.characterStats.filter(s => s.characterStatTypeViewModel.characterStatTypeId == STAT_TYPE.Choice);
    this.bsModalRef.content.Choices = result;
  }

  deleteCharacterStat(CharacterStat: CharacterStats) {
    this.alertService.showDialog('Are you sure you want to delete?',
      DialogType.confirm, () => this.deleteCharacterStatHelper(CharacterStat), null, 'Yes', 'No');
  }

  private deleteCharacterStatHelper(CharacterStat: CharacterStats) {
    CharacterStat.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Character Stat");
    //this.charactersService.deleteCharacterStats<CharacterStats[]>(CharacterStat.characterStatId)
    //    .subscribe(
    //        data => {
    //            this.isLoading = false;
    //            this.alertService.stopLoadingMessage();

    //            this.alertService.showMessage("Character Stat has been deleted successfully.", "", MessageSeverity.success);
    //            this.characterStats = this.characterStats.filter((val) => val.characterStatId != CharacterStat.characterStatId);
    //            try {
    //                this.noRecordFound = !this.characterStats.length;
    //            } catch (err) { }
    //            //this.initialize();
    //        },
    //        error => {
    //            this.isLoading = false;
    //            this.alertService.stopLoadingMessage();

    //            let errorMessage = Utilities.findHttpResponseMessage("error_description", error);
    //            if (errorMessage)
    //                this.alertService.showStickyMessage("Unable to Delete", errorMessage, MessageSeverity.error, error);
    //            else if (error.error.error)
    //                this.alertService.showStickyMessage("Unable to Delete", error.error.error.message, MessageSeverity.error, error);
    //            else if (error.message)
    //                this.alertService.showStickyMessage("Unable to Delete", error.message, MessageSeverity.error, error);
    //            else if (error.error)
    //                this.alertService.showStickyMessage("Unable to Delete", error.statusText + ' ' + error.error, MessageSeverity.error, error);
    //            else
    //                this.alertService.showStickyMessage("Unable to Delete", error.statusText || error.status, MessageSeverity.error, error);
    //        });
    this.charactersService.deleteCharacterStats_up<CharacterStats[]>(CharacterStat)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          this.alertService.showMessage("Character Stat has been deleted successfully.", "", MessageSeverity.success);
          this.characterStats = this.characterStats.filter((val) => val.characterStatId != CharacterStat.characterStatId);
          this._typeOptions = this._typeOptions.filter((val) => val.characterStatId != CharacterStat.characterStatId);
          try {
            this.noRecordFound = !this.characterStats.length;
          } catch (err) { }
          //this.initialize();
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let errorMessage = Utilities.findHttpResponseMessage("error_description", error);
          if (errorMessage)
            this.alertService.showStickyMessage("Unable to Delete", errorMessage, MessageSeverity.error, error);
          else if (error.error.error)
            this.alertService.showStickyMessage("Unable to Delete", error.error.error.message, MessageSeverity.error, error);
          else if (error.message)
            this.alertService.showStickyMessage("Unable to Delete", error.message, MessageSeverity.error, error);
          else if (error.error)
            this.alertService.showStickyMessage("Unable to Delete", error.statusText + ' ' + error.error, MessageSeverity.error, error);
          else
            this.alertService.showStickyMessage("Unable to Delete", error.statusText || error.status, MessageSeverity.error, error);
        });
  }

  private onDrop(characterStat: any) {
    let [el, target, source] = characterStat;
    const rowData = Array.from(target.children);

    let _sortOrder = rowData.map((row: any, index: number) => {
      return {
        characterStatId: row.id,
        ruleSetId: row.attributes.rid.value,
        sortOrder: index + 1
      }
    });

    this.sortOrderCharacterStat(_sortOrder);
  }

  private onChange(characterStat: any) {
    let [el, target, source] = characterStat;
    const rowData = Array.from(this.characterStats);

    let _sortOrder = this.characterStats.map((row: any, index: number) => {
      return {
        characterStatId: row.characterStatId,
        ruleSetId: row.ruleSetId,
        sortOrder: index + 1
      }
    });

    this.sortOrderCharacterStat(_sortOrder);
  }

  private sortOrderCharacterStat(sortOrder: any[]) {
    this.charactersService.sortOrderCharacterStats(sortOrder)
      .subscribe(
        data => {
          //this.sharedService.updateCharacterStatList(true);
        },
        error => { console.log("error : ", error); }
      );
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  scrollUp(characterStat) {
    var index = this.characterStats.findIndex(stat => stat.characterStatId === characterStat.characterStatId);
    const temp = this.characterStats[index];
    const prevEl = this.characterStats[index - 1];
    if (index > 0) {
      this.characterStats.splice(index - 1, 1, temp);
      this.characterStats.splice(index, 1, prevEl);
      this.onChange(characterStat);
    }
  }

  scrollDown(characterStat) {
    var index = this.characterStats.findIndex(stat => stat.characterStatId === characterStat.characterStatId);
    const temp = this.characterStats[index];
    const prevEl = this.characterStats[index + 1];
    if (index !== this.characterStats.length - 1) {
      this.characterStats.splice(index + 1, 1, temp);
      this.characterStats.splice(index, 1, prevEl);
      this.onChange(characterStat);
    }
  }

  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  }
  RedirectBack() {
    this.localStorage.localStorageSetItem(DBkeys.IsBackButton, "false");
    window.history.back();
  }

  //openDiceRollModal() {
  //  this.bsModalRef = this.modalService.show(DiceRollComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = "Dice";
  //  this.bsModalRef.content.characterId = 0;
  //  this.bsModalRef.content.character = new Characters();
  //  this.bsModalRef.content.recordName = this.rulesetModel.ruleSetName;
  //  this.bsModalRef.content.recordImage = this.rulesetModel.imageUrl;
  //  this.bsModalRef.content.isFromCampaignDetail = true;
  //}
}
