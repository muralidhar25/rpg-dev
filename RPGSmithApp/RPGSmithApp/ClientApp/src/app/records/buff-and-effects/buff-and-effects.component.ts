import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, DialogType, MessageSeverity } from "../../core/common/alert.service";
import { AuthService } from "../../core/auth/auth.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { PageLastViewsService } from "../../core/services/pagelast-view.service";
import { SharedService } from "../../core/services/shared.service";
import { AppService1 } from "../../app.service";
import { DBkeys } from "../../core/common/db-keys";
import { Utilities } from "../../core/common/utilities";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";
import { User } from "../../core/models/user.model";
import { CreateBuffAndEffectsComponent } from "../../shared/create-buff-and-effects/create-buff-and-effects.component";
import { BuffAndEffect } from "../../core/models/view-models/buff-and-effect.model";
import { BuffAndEffectService } from "../../core/services/buff-and-effect.service";
import { ServiceUtil } from "../../core/services/service-util";
import { AssignBuffAndEffectComponent } from "../../shared/buffs-and-effects/assign-buffs-and-effects/assign-buffs-and-effects.component";
import { DeleteRecordsComponent } from "./delete-records/delete-records.component";
import { CommonService } from "../../core/services/shared/common.service";

@Component({
  selector: 'app-buff-and-effects',
  templateUrl: './buff-and-effects.component.html',
  styleUrls: ['./buff-and-effects.component.scss']
})

export class BuffAndEffectComponent implements OnInit {

  rulesetModel: any;
  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  ruleSetId: number;
  buffAndEffectId: number;
  buffAndEffectsList: any;
  pageLastView: any;
  isDropdownOpen: boolean = false;
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;
  page: number = 1;
  timeoutHandler: any;
  pageSize: number = 56;
  offset = (this.page - 1) * this.pageSize;
  backURL: string = '/rulesets';
  IsGm: boolean = false;
  searchText: string;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private pageLastViewsService: PageLastViewsService,
    private buffAndEffectService: BuffAndEffectService, public appService: AppService1,
    private commonService: CommonService) {

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
        let displayURL = '/ruleset/buff-effect';
        let originalURl = '/ruleset/buff-effect/' + RuleSetID;
        Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
      }
    }

    this.sharedService.shouldUpdateBuffAndEffectList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        this.page = 1;
        this.pageSize = 28;
        this.upadteIndexedDB();
      }
    });

    this.appService.shouldUpdateFilterSearchRecords().subscribe(filterBy => {
      this.searchText = filterBy;
    });
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
      if (target.className.endsWith("is-show"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }

  ngOnInit() {
    //this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
    this.setRulesetId(this.ruleSetId);
    this.destroyModalOnInit();
    this.initialize();
    this.showActionButtons(this.showActions);
  }

  upadteIndexedDB() {
    this.isLoading = true;
    this.buffAndEffectService.getBuffAndEffectByRuleset_spWithPagination_Cache<any>(this.ruleSetId, 1, 9999)
      .subscribe(async (data) => {
        await this.commonService.updateObjectStore("buffAndEffects", data);
        this.initialize();

        //this.isLoading = false;
      }, error => {
        this.isLoading = false;
      }, () => { });
  }

  private async initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
        this.backURL = '/ruleset/campaign-details/' + this.ruleSetId;
      } else {
        this.backURL = '/ruleset/ruleset-details/' + this.ruleSetId;
      }

      await this.getDataFromIndexedDB();

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetBuffAndEffects')
      //  .subscribe(data => {
      //    //if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      //    if (data !== null) {
      //      if (data.viewType == 'List') {
      //        this.isListView = true;
      //        this.isDenseView = false;
      //      }
      //      else if (data.viewType == 'Dense') {
      //        this.isDenseView = true;
      //        this.isListView = false;
      //      }
      //      else {
      //        this.isListView = false;
      //        this.isDenseView = false;
      //      }
      //    }

      //  }, error => {
      //    let Errors = Utilities.ErrorDetail("", error);
      //    if (Errors.sessionExpire) {
      //      this.authService.logout(true);
      //    }
      //  });
    }
  }

  redirectBackURL() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
        this.localStorage.localStorageSetItem(DBkeys.IsBackButton, "false");
        this.router.navigate(['/ruleset/campaign-details/' + this.ruleSetId]);
      } else {
        this.localStorage.localStorageSetItem(DBkeys.IsBackButton, "false");
        this.router.navigate(['/ruleset/ruleset-details/' + this.ruleSetId]);
      }
    }
  }

  onScroll(isAutoScroll: boolean = true) {

    ++this.page;
    if (isAutoScroll) {
      this.scrollLoading = true;
    }
    this.buffAndEffectService.getBuffAndEffectByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {

        var _buffAndEffects = data.buffAndEffects;
        for (var i = 0; i < _buffAndEffects.length; i++) {
          _buffAndEffects[i].showIcon = false;
          this.buffAndEffectsList.push(_buffAndEffects[i]);
        }
        //this.isLoading = false;
        this.scrollLoading = false;
      }, error => {
        this.isLoading = false;
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });


  }

  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  showListView(view: boolean) {
    this.isListView = view;
    this.isDenseView = false;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'RulesetBuffAndEffects',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.buffAndEffectService.createPageLastViews<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }

  showDenseview(view: boolean) {
    this.isListView = false;
    this.isDenseView = view;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'RulesetBuffAndEffects',
      viewType: 'Dense',
      UserId: user.id
    }

    this.buffAndEffectService.createPageLastViews<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isDenseView = data.viewType == 'Dense' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
    setTimeout(() => {
      if (window.innerHeight > document.body.clientHeight) {
        this.onScroll(false);
      }
    }, 10)
  }
  manageIcon(id: number) {
    this.buffAndEffectsList.forEach(function (val) {
      if (id === val.buffAndEffectId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  createBuffAndEffect() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.buffAndEffectService.getBuffAndEffectsCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 200) {
          this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create New Buff & Effect';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.buffAndEffectVM = { ruleSetId: this.ruleSetId };
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

  editBuffAndEffect(buffAndEffect: BuffAndEffect) {
    this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Buff & Effect';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.buffAndEffectVM = buffAndEffect;
    this.bsModalRef.content.rulesetID = this.ruleSetId;

    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.searchText = "";
      }
    });
  }

  duplicateBuffAndEffect(buffAndEffect: BuffAndEffect) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.buffAndEffectService.getBuffAndEffectsCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 200) {
          this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Buff & Effect';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.buffAndEffectVM = buffAndEffect;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteBuffAndEffect(buffAndEffect: BuffAndEffect) {
    let message = "Are you sure you want to delete this " + buffAndEffect.name
      + " Buff & Effect?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteBuffAndEffectHelper(buffAndEffect), null, 'Yes', 'No');
  }

  private deleteBuffAndEffectHelper(buffAndEffect: BuffAndEffect) {
    buffAndEffect.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Buff & Effect");

    this.buffAndEffectService.deleteBuffAndEffect_up(buffAndEffect)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Buff & Effect has been deleted successfully.", "", MessageSeverity.success);
          this.buffAndEffectsList = this.buffAndEffectsList.filter((val) => val.buffAndEffectId != buffAndEffect.buffAndEffectId);
          this.updateDB(this.buffAndEffectsList);
          try {
            this.noRecordFound = !this.buffAndEffectsList.length;
          } catch (err) { }
          //this.initialize();
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to Delete", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  useBuffAndEffect(buffAndEffect: any) {

    let msg = "The command value for " + buffAndEffect.name
      + " Buff & Effect has not been provided. Edit this record to input one.";

    if (buffAndEffect.buffAndEffectCommand == undefined || buffAndEffect.buffAndEffectCommand == null) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useBuffAndEffectHelper(buffAndEffect));
    }
    else if (buffAndEffect.buffAndEffectCommand.length == 0) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useBuffAndEffectHelper(buffAndEffect));
    }
    else {
      //TODO
      this.useBuffAndEffectHelper(buffAndEffect);
    }
  }

  private useBuffAndEffectHelper(buffAndEffect: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Use Buff & Effect");
    //TODO- PENDING ACTION
    setTimeout(() => {
      this.isLoading = false;
      this.alertService.stopLoadingMessage();
    }, 200);
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  }

  public clickAndHold(item: any) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  public editRecord(record: any) {
    this.timeoutHandler = setInterval(() => {
      this.editBuffAndEffect(record);
    }, 1000);
  }
  private setHeaderValues(ruleset: Ruleset): any {
    try {
      let headerValues = {
        headerName: ruleset.ruleSetName,
        headerImage: ruleset.imageUrl ? ruleset.imageUrl : '../assets/images/BnE/Def_BnE.jpg',
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

  openDiceRollModal() {

    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.recordName = this.rulesetModel.ruleSetName;
    this.bsModalRef.content.recordImage = this.rulesetModel.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset'
    this.bsModalRef.content.isFromCampaignDetail = true;
  }
  Assign(buffAndEffect: any) {
    this.bsModalRef = this.modalService.show(AssignBuffAndEffectComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.BuffAndEffectToAssign = buffAndEffect;
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.event.subscribe(data => {
      if (data == true) {
        buffAndEffect.isAssignedToAnyCharacter = data;
      } else if (data == false) {
        buffAndEffect.isAssignedToAnyCharacter = data;
      }

    });
  }
  openBuffDetail(buffAndEffectId) {

    this.router.navigate(['/ruleset/buff-effect-details', buffAndEffectId]);
  }

  DeleteRecords() {
    this.bsModalRef = this.modalService.show(DeleteRecordsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
  }

  GotoCommand(cmd) {
    // TODO get char ID
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = cmd;
  }

  onSearch() {
    ++this.page;
    this.buffAndEffectService.getBuffAndEffectByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {
        let count = 0;
        var _buffAndEffects = data.buffAndEffects;
        for (var i = 0; i < _buffAndEffects.length; i++) {
          _buffAndEffects[i].showIcon = false;
          this.buffAndEffectsList.push(_buffAndEffects[i]);

          count += 1;
          if (count == _buffAndEffects.length - 1) {
            this.onSearch();
          }

        }
      }, error => { });
  }

  async getDataFromIndexedDB() {
    const request = await window.indexedDB.open(DBkeys.IndexedDB, DBkeys.IndexedDBVersion);
    const ruleSetId = this.localStorage.getDataObject(DBkeys.RULESET_ID) ? parseFloat(this.localStorage.getDataObject(DBkeys.RULESET_ID)) : -1;
    const that = this;

    request.onsuccess = function (event) {
      const db = event.target['result'];

      if (db.objectStoreNames) {
        let campaignObjectStore = db.transaction("campaign", "readwrite").objectStore("campaign");

        let request = campaignObjectStore.get(ruleSetId);

        request.onerror = function (event) {
          console.log("[data retrieve error]");
        };

        request.onsuccess = async function (event) {
          let result = event.target.result;
          if (result && result.buffAndEffects && result.buffAndEffects.buffAndEffects && result.buffAndEffects.buffAndEffects.length) {
            await that.getBuffEffectData(result.buffAndEffects);
            setTimeout(() => {
              that.getData(result.buffAndEffects.buffAndEffects);
            }, 1000);
          } else {
            //hit api
            that.getDataFromAPI();
          }
        }
      }
    }
  }

  getDataFromAPI() {
    this.isLoading = true;
    this.buffAndEffectService.getBuffAndEffectByRuleset_spWithPagination_Cache<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(async (data) => {
        await this.getBuffEffectData(data);
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => {

        this.onSearch();

        setTimeout(() => {
          if (window.innerHeight > document.body.clientHeight) {
            this.onScroll(false);
          }
        }, 10)
      });
  }

  getBuffEffectData(data) {
    //check for ruleset
    if (data.buffAndEffects)
      this.buffAndEffectsList = Utilities.responseData(data.buffAndEffects, this.pageSize);

    if (data.ViewType) {
      if (data.ViewType.viewType == 'List') {
        this.isListView = true;
        this.isDenseView = false;
      }
      else if (data.ViewType.viewType == 'Dense') {
        this.isDenseView = true;
        this.isListView = false;
      }
      else {
        this.isListView = false;
        this.isDenseView = false;
      }
    }


    this.rulesetModel = data.RuleSet;
    this.setHeaderValues(this.rulesetModel);
    this.buffAndEffectsList.forEach(function (val) { val.showIcon = false; });
    try {
      this.noRecordFound = !data.buffAndEffects.length;
    } catch (err) { }
    this.isLoading = false;
  }

  getData(data) {
    if (data) {
      this.pageSize += 200;
      this.buffAndEffectsList = data.slice(0, this.pageSize)
    }
    if (this.pageSize < data.length) {
      setTimeout(() => {
        this.getData(data);
      }, 2000);
    }

  }

  async updateDB(buffAndEffects) {
    const request = await window.indexedDB.open(DBkeys.IndexedDB, DBkeys.IndexedDBVersion);
    const ruleSetId = this.localStorage.getDataObject(DBkeys.RULESET_ID) ? parseFloat(this.localStorage.getDataObject(DBkeys.RULESET_ID)) : -1;
    const that = this;

    request.onsuccess = function (event) {
      const db = event.target['result'];

      if (db.objectStoreNames) {
        let campaignObjectStore = db.transaction("campaign", "readwrite").objectStore("campaign");

        let request = campaignObjectStore.get(ruleSetId);

        request.onerror = function (event) {
          console.log("[data retrieve error]");
        };

        request.onsuccess = async function (event) {
          let result = event.target.result;
          if (result && result.buffAndEffects && result.buffAndEffects.buffAndEffects && result.buffAndEffects.buffAndEffects.length) {
            result.buffAndEffects.buffAndEffects = buffAndEffects;
            that.commonService.updateObjectStore('buffAndEffects', result.buffAndEffects);
          }
        }
      }
    }
  }

}
