import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { SharedService } from "../../core/services/shared.service";
import { AlertService, DialogType, MessageSeverity } from "../../core/common/alert.service";
import { SpellsService } from "../../core/services/spells.service";
import { PageLastViewsService } from "../../core/services/pagelast-view.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { AuthService } from "../../core/auth/auth.service";
import { User } from "../../core/models/user.model";
import { DBkeys } from "../../core/common/db-keys";
import { Utilities } from "../../core/common/utilities";
import { AddSpellsComponent } from "./add-spells/add-spells.component";
import { CreateSpellsComponent } from "../../shared/create-spells/create-spells.component";
import { Spell } from "../../core/models/view-models/spell.model";
import { CastComponent } from "../../shared/cast/cast.component";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { AppService1 } from "../../app.service";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";
import { DeleteSpellsComponent } from "./delete-spells/delete-spells.component";
import { ServiceUtil } from "../../core/services/service-util";
import { setTimeout } from "timers";
import { CommonService } from "../../core/services/shared/common.service";

@Component({
  selector: 'app-spells',
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss']
})

export class SpellsComponent implements OnInit {

  rulesetModel: any;
  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
  ruleSetId: number;
  spellsList: any;
  pageLastView: any;
  timeoutHandler: any;
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;

  page: number = 1;
  pageSize: number = 56;
  offset = (this.page - 1) * this.pageSize;
  backURL: string = '/rulesets';
  IsGm: boolean = false;
  searchText: string;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private spellsService: SpellsService,
    private pageLastViewsService: PageLastViewsService, public appService: AppService1,
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
        let displayURL = '/ruleset/spell';
        let originalURl = '/ruleset/spell/' + RuleSetID;
        Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
      }
    }

    this.sharedService.shouldUpdateSpellList().subscribe(sharedServiceJson => {
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

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetSpells')
      //  .subscribe(data => {
      //    // if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
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

  upadteIndexedDB() {
    this.isLoading = true;
    this.spellsService.getspellsByRuleset_spWithPagination_Cache<any>(this.ruleSetId, 1, 9999)
      .subscribe(async (data) => {
        await this.commonService.updateObjectStore("spell", data);
        this.initialize();

        //this.isLoading = false;
      }, error => {
        this.isLoading = false;
      }, () => { });
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

    this.spellsService.getspellsByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {

        var _spells = data.Spells;
        for (var i = 0; i < _spells.length; i++) {
          _spells[i].showIcon = false;
          this.spellsList.push(_spells[i]);
        }
        this.scrollLoading = false;
      }, error => {
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });

    //this.charactersCharacterStatService.getCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)

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
      pageName: 'RulesetSpells',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.spellsService.createPageLastViews<any>(this.pageLastView)
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
    this.isDenseView = view;
    this.isListView = false;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'RulesetSpells',
      viewType: 'Dense',
      UserId: user.id
    }

    this.spellsService.createPageLastViews<any>(this.pageLastView)
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
    this.spellsList.forEach(function (val) {
      if (id === val.spellId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  addSpell() {
    this.bsModalRef = this.modalService.show(AddSpellsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  createSpell() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.spellsService.getspellsCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 3000) {
          this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create New Spell';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.spellVM = { ruleSetId: this.ruleSetId };
          //  console.log('ruleSetId: ' + this.ruleSetId);
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  editSpell(spell: Spell) {
    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Spell';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.spellVM = spell;
    this.bsModalRef.content.rulesetID = this.ruleSetId;

    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.searchText = "";
      }
    });

  }

  duplicateSpell(spell: Spell) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.spellsService.getspellsCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 3000) {
          this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Spell';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.spellVM = spell;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

  deleteSpell(spell: Spell) {
    let message = "Are you sure you want to delete this " + spell.name
      + " Spell? This will also remove the Spell from any character(s) / item(s) that may be associated with it.";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteSpellHelper(spell), null, 'Yes', 'No');
  }

  private deleteSpellHelper(spell: Spell) {
    spell.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Spell");

    //this.spellsService.deleteSpell(spell.spellId)
    //    .subscribe(
    //        data => {
    //            this.isLoading = false; 
    //            this.alertService.stopLoadingMessage();
    //            this.alertService.showMessage("Spell has been deleted successfully.", "", MessageSeverity.success);                    
    //            this.spellsList = this.spellsList.filter((val) => val.spellId != spell.spellId);
    //            try {
    //                this.noRecordFound = !this.spellsList.length;
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
    this.spellsService.deleteSpell_up(spell)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Spell has been deleted successfully.", "", MessageSeverity.success);
          this.spellsList = this.spellsList.filter((val) => val.spellId != spell.spellId);
          this.updateDB(this.spellsList);
          try {
            this.noRecordFound = !this.spellsList.length;
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

  memorizeSpell(spell: Spell) {
    this.isLoading = true;
    let memorizeTxt = spell.memorized ? 'Unmemorize' : 'Memorize';
    this.spellsService.memorizedSpell(spell.spellId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          spell.memorized = spell.memorized ? false : true;
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + memorizeTxt, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  castSpell(spell: any) {
    this.bsModalRef = this.modalService.show(CastComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Spell Cast"

    // let msg = "The command value for " + spell.name
    //     + " Spell has not been provided. Edit this record to input one.";

    // if (spell.spellCommand == undefined || spell.spellCommand == null) {
    //     this.alertService.showDialog(msg, DialogType.alert, () => this.castSpellHelper(spell));
    // }
    // else if (spell.spellCommand.length == 0) {
    //     this.alertService.showDialog(msg, DialogType.alert, () => this.castSpellHelper(spell));
    // }
    // else {
    //     //TODO
    //     this.castSpellHelper(spell);
    // }
  }

  private castSpellHelper(spell: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Cast Spell");
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
      this.editSpell(record);
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

  DeleteSpell() {
    this.bsModalRef = this.modalService.show(DeleteSpellsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
  }

  GotoCommand(cmd) {
    // TODO get charID
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
    this.spellsService.getspellsByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {
        let count = 0;
        var _spells = data.Spells;
        for (var i = 0; i < _spells.length; i++) {
          _spells[i].showIcon = false;
          this.spellsList.push(_spells[i]);
          count += 1;
          if (count == _spells.length - 1) {
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
          if (result && result.spell && result.spell.Spells && result.spell.Spells.length) {
            await that.getSpellsData(result.spell);
            setTimeout(() => {
              that.getData(result.spell.Spells);
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
    this.spellsService.getspellsByRuleset_spWithPagination_Cache<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(async (data) => {
        await this.getSpellsData(data);
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

  getSpellsData(data) {
    this.spellsList = Utilities.responseData(data.Spells, this.pageSize);
    //get View Type
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
    this.spellsList.forEach(function (val) { val.showIcon = false; });
    try {
      this.noRecordFound = !data.Spells.length;
    } catch (err) { }
    this.isLoading = false;
  }

  getData(data) {
    if (data) {
      this.pageSize += 200;
      this.spellsList = data.slice(0, this.pageSize)
    }
    if (this.pageSize < data.length) {
      setTimeout(() => {
        this.getData(data);
      }, 2000);
    }

  }

  async updateDB(Spells) {
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
          if (result && result.spell && result.spell.Spells && result.spell.Spells.length) {
            result.spell.Spells = Spells;
            that.commonService.updateObjectStore('spell', result.spell);
          }
        }
      }
    }
  }

}
