import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AbilityService } from "../../core/services/ability.service";
import { AuthService } from "../../core/auth/auth.service";
import { PageLastViewsService } from "../../core/services/pagelast-view.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { SharedService } from "../../core/services/shared.service";
import { AlertService, DialogType, MessageSeverity } from "../../core/common/alert.service";
import { User } from "../../core/models/user.model";
import { DBkeys } from "../../core/common/db-keys";
import { Utilities } from "../../core/common/utilities";
import { CreateAbilitiesComponent } from "../../shared/create-abilities/create-abilities.component";
import { AddAbilitiesComponent } from "./add-abilities/add-abilities.component";
import { Ability } from "../../core/models/view-models/ability.model";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { AppService1 } from "../../app.service";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";
import { DeleteAbilitiesComponent } from "./delete-abilities/delete-abilities.component";
import { ServiceUtil } from "../../core/services/service-util";
import { CommonService } from "../../core/services/shared/common.service";

@Component({
  selector: 'app-abilities',
  templateUrl: './abilities.component.html',
  styleUrls: ['./abilities.component.scss']
})

export class AbilitiesComponent implements OnInit {

  rulesetModel: any;
  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  ruleSetId: number;
  abilityId: number;
  abilitiesList: any;
  pageLastView: any;
  isDropdownOpen: boolean = false;
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;
  page: number = 1;
  timeoutHandler: any;
  pageSize: number = 28;
  offset = (this.page - 1) * this.pageSize;
  backURL: string = '/rulesets';
  IsGm: boolean = false;
  searchText: string;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private pageLastViewsService: PageLastViewsService,
    private abilityService: AbilityService, public appService: AppService1,
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
        let displayURL = '/ruleset/ability';
        let originalURl = '/ruleset/ability/' + RuleSetID;
        Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
      }
    }

    this.sharedService.shouldUpdateAbilityList().subscribe(sharedServiceJson => {
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
    //this.getDataFromIndexedDB();
    this.destroyModalOnInit();
    this.initialize();
    this.showActionButtons(this.showActions);
  }

  upadteIndexedDB() {
    this.isLoading = true;
    this.abilityService.getAbilityByRuleset_spWithPagination_Cache<any>(this.ruleSetId, 1, 9999)
      .subscribe(async (data) => {
        await this.commonService.updateObjectStore("ability", data);
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

      //this.pageLastViewsService.getByUserIdPageName_Cache<any>(user.id, 'RulesetAbilities')
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
    ///*To get ruleset*/
    //this.rulesetService.getRulesetById<Ruleset>(this.ruleSetId)
    //    .subscribe(data => {
    //        this.rulesetModel = data;               
    //    }, error => { }, () => { });
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
    this.abilityService.getAbilityByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {

        var _abilities = data.Abilities;
        for (var i = 0; i < _abilities.length; i++) {
          _abilities[i].showIcon = false;
          this.abilitiesList.push(_abilities[i]);
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
      pageName: 'RulesetAbilities',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.abilityService.createPageLastViews<any>(this.pageLastView)
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
      pageName: 'RulesetAbilities',
      viewType: 'Dense',
      UserId: user.id
    }

    this.abilityService.createPageLastViews<any>(this.pageLastView)
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
    this.abilitiesList.forEach(function (val) {
      if (id === val.abilityId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  addAbility() {
    this.bsModalRef = this.modalService.show(AddAbilitiesComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  createAbility() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.abilityService.getAbilitiesCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create New Ability';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.abilityVM = { ruleSetId: this.ruleSetId };
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

  editAbility(ability: Ability) {
    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Ability';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.abilityVM = ability;
    this.bsModalRef.content.rulesetID = this.ruleSetId;

    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.searchText = "";
      }
    });

  }

  duplicateAbility(ability: Ability) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.abilityService.getAbilitiesCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Ability';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.abilityVM = ability;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteAbility(ability: Ability) {
    let message = "Are you sure you want to delete this " + ability.name
      + " Ability? This will also remove the Ability from any character(s) / item(s) that may be associated with it.";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteAbilityHelper(ability), null, 'Yes', 'No');
  }

  private deleteAbilityHelper(ability: Ability) {
    ability.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Ability");

    //this.abilityService.deleteAbility(ability.abilityId)
    //    .subscribe(
    //        data => {
    //            this.isLoading = false; 
    //            this.alertService.stopLoadingMessage();
    //            this.alertService.showMessage("Ability has been deleted successfully.", "", MessageSeverity.success);
    //            this.abilitiesList = this.abilitiesList.filter((val) => val.abilityId != ability.abilityId);
    //            try {
    //                this.noRecordFound = !this.abilitiesList.length;
    //            } catch (err) { }
    //            //this.initialize();
    //        },
    //        error => {
    //            this.isLoading = false; 
    //            this.alertService.stopLoadingMessage();
    //            let Errors = Utilities.ErrorDetail("Unable to Delete", error);
    //            if (Errors.sessionExpire) {
    //                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
    //                this.authService.logout(true);
    //            }
    //            else
    //                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
    //        });
    this.abilityService.deleteAbility_up(ability)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Ability has been deleted successfully.", "", MessageSeverity.success);
          this.abilitiesList = this.abilitiesList.filter((val) => val.abilityId != ability.abilityId);
          this.updateDB(this.abilitiesList);
          try {
            this.noRecordFound = !this.abilitiesList.length;
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

  enableAbility(ability: Ability) {
    //this.isLoading = true;
    let enableTxt = ability.isEnabled ? 'Disable' : 'Enable';
    this.abilityService.enableAbility(ability.abilityId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          ability.isEnabled = ability.isEnabled ? false : true;
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + enableTxt, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  useAbility(ability: any) {

    let msg = "The command value for " + ability.name
      + " Ability has not been provided. Edit this record to input one.";

    if (ability.abilityCommand == undefined || ability.abilityCommand == null) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useAbilityHelper(ability));
    }
    else if (ability.abilityCommand.length == 0) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useAbilityHelper(ability));
    }
    else {
      //TODO
      this.useAbilityHelper(ability);
    }
  }

  private useAbilityHelper(ability: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Use Ability");
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
      this.editAbility(record);
    }, 1000);
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

  DeleteAbility() {
    this.bsModalRef = this.modalService.show(DeleteAbilitiesComponent, {
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
    this.abilityService.getAbilityByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {
        let count = 0;
        var _abilities = data.Abilities;
        for (var i = 0; i < _abilities.length; i++) {
          _abilities[i].showIcon = false;
          this.abilitiesList.push(_abilities[i]);

          count += 1;
          if (count == _abilities.length - 1) {
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
          if (result && result.ability && result.ability.Abilities && result.ability.Abilities.length) {
            await that.getAbilitiesData(result.ability);
            setTimeout(() => {
              that.getData(result.ability.Abilities);
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
    this.abilityService.getAbilityByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(async (data) => {

        await this.getAbilitiesData(data);
        
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
        }, 10);
      });
  }

  getAbilitiesData(data) {
    //check for ruleset
    if (data.Abilities)
      this.abilitiesList = Utilities.responseData(data.Abilities, this.pageSize);

    //get view Type
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
    this.abilitiesList.forEach(function (val) { val.showIcon = false; });
    try {
      this.noRecordFound = !data.Abilities.length;
    } catch (err) { }
    this.isLoading = false;
  }

  getData(data) {
    if (data) {
      this.pageSize += 200;
      this.abilitiesList = data.slice(0, this.pageSize)
    }
    if (this.pageSize < data.length) {
      setTimeout(() => {
        this.getData(data);
      }, 2000);
    }

  }

  async updateDB(Abilities) {
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
          if (result && result.ability && result.ability.Abilities && result.ability.Abilities.length) {
            result.ability.Abilities = Abilities;
            that.commonService.updateObjectStore('ability', result.ability);
          }
        }
      }
    }
  }

}
