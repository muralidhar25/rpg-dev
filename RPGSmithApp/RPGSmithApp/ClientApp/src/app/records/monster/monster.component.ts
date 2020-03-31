import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { RulesetService } from "../../core/services/ruleset.service";
import { AuthService } from "../../core/auth/auth.service";
import { PageLastViewsService } from "../../core/services/pagelast-view.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { SharedService } from "../../core/services/shared.service";
import { AlertService, DialogType, MessageSeverity } from "../../core/common/alert.service";
import { User } from "../../core/models/user.model";
import { DBkeys } from "../../core/common/db-keys";
import { Utilities } from "../../core/common/utilities";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { AppService1 } from "../../app.service";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";
import { MonsterTemplateService } from "../../core/services/monster-template.service";
import { EditMonsterComponent } from "./edit-monster/edit-monster.component";
import { CreateMonsterTemplateComponent } from "../monster-template/create-monster-template/create-monster-template.component";
import { DropItemsMonsterComponent } from "./drop-items-monster/drop-items-monster.component";
import { AddMonsterComponent } from "./Add-monster/add-monster.component";
import { CastComponent } from "../../shared/cast/cast.component";
import { CustomDice } from "../../core/models/view-models/custome-dice.model";
import { DeleteMonstersComponent } from "./delete-monsters/delete-monsters.component";
import { ServiceUtil } from "../../core/services/service-util";
import { CommonService } from "../../core/services/shared/common.service";

@Component({
  selector: 'app-monster',
  templateUrl: './monster.component.html',
  styleUrls: ['./monster.component.scss']
})

export class MonsterComponent implements OnInit {

  rulesetModel: any;
  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  ruleSetId: number;
  monsterId: number;
  monsterList: any;
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
  Alphabetical: boolean = false;
  ChallangeRating: boolean = false;
  Health: boolean = false;
  monstersFilter: any = {
    type: 1,
    name: 'Alphabetical',
    icon: '',
    viewableCount: 0
  };
  alphabetCount: number;
  ChallangeRatingCount: number;
  HealthCount: number;
  customDices: CustomDice[] = [];
  CurrencyTypesList = [];
  searchText: string;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private pageLastViewsService: PageLastViewsService,
    private monsterTemplateService: MonsterTemplateService,
    private rulesetService: RulesetService, public appService: AppService1,
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
        let displayURL = '/ruleset/monster';
        let originalURl = '/ruleset/monster/' + RuleSetID;
        Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
      }
    }

    this.sharedService.shouldUpdateMonsterList().subscribe(sharedServiceJson => {
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
    this.rulesetService.getCustomDice(this.ruleSetId)
      .subscribe(data => {

        this.customDices = data

      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      })
  }

  upadteIndexedDB() {
    this.isLoading = true;
    this.monsterTemplateService.getMonsterByRuleset_spWithPagination_Cache<any>(this.ruleSetId, 1, 9999, 1, null)
      .subscribe(async (data) => {
        await this.commonService.updateObjectStore("monsters", data);
        this.initialize();

        //this.isLoading = false;
      }, error => {
        this.isLoading = false;
      }, () => { });
  }

  private async initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    let localStorageFilters = this.localStorage.getDataObject<number>('monstersFilters');
    if (localStorageFilters != null) {
      this.monstersFilter = localStorageFilters;
    }

    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
        this.backURL = '/ruleset/campaign-details/' + this.ruleSetId;
      } else {
        this.backURL = '/ruleset/ruleset-details/' + this.ruleSetId;
      }

      this.getFilters();

      await this.getDataFromIndexedDB();

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetMonsters')
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
    this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monstersFilter.type)
      .subscribe(data => {

        var _monster = data.monsters;
        for (var i = 0; i < _monster.length; i++) {
          _monster[i].showIcon = false;
          _monster[i].xPValue = _monster[i].xpValue;

          this.monsterList.push(_monster[i]);
        }
        //this.isLoading = false;
        this.scrollLoading = false;
        if (this.monstersFilter.type == 1) {
          //this.monstersFilter.viewableCount = this.monsterList.length;
          //this.alphabetCount = this.monsterList.length;
          this.monstersFilter.viewableCount = data.FilterAplhabetCount;
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.monstersFilter.type == 2) {
          //let result = this.monsterList.filter(s => s.challangeRating);
          //this.ChallangeRatingCount = result.length;
          this.ChallangeRatingCount = data.FilterCRCount;
        }
        if (this.monstersFilter.type == 3) {
          //let result = this.monsterList.filter(s => s.healthCurrent || s.healthMax);
          //this.HealthCount = result.length;
          this.HealthCount = data.FilterHealthCount;
        }

        //this.applyFilters(this.monstersFilter.type, true);
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
      pageName: 'RulesetMonsters',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.monsterTemplateService.createPageLastViews<any>(this.pageLastView)
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
      pageName: 'RulesetMonsters',
      viewType: 'Dense',
      UserId: user.id
    }

    this.monsterTemplateService.createPageLastViews<any>(this.pageLastView)
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
    this.monsterList.forEach(function (val) {
      if (id === val.monsterId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  createMonster() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.monsterTemplateService.getMonsterCountByRuleSetId(this.ruleSetId)
      .subscribe((data: any) => {
        //this.alertService.stopLoadingMessage();
        let MonsterTemplateCount = data.monsterTemplateCount;
        let MonsterCount = data.monsterCount;
        if (MonsterTemplateCount < 2000 && MonsterCount < 200) {
          this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create New Monster';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.monsterTemplateVM = { ruleSetId: this.ruleSetId, monsterCurrency: this.CurrencyTypesList };
          this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
          this.bsModalRef.content.isCreatingFromMonsterScreen = true;

        }
        else {
          if (MonsterTemplateCount >= 2000) {
            this.alertService.showMessage("The maximum number of records to create monster template has been reached, 2,000. Please delete some monster templates and try again.", "", MessageSeverity.error);
          } else if (MonsterCount >= 200) {
            //this.alertService.showMessage("The maximum number of monsters has been reached, 200. Please delete some monsters and try again.", "", MessageSeverity.error);
            this.alertService.showMessage("The total number of monsters that can be deployed at one time is 200, You currently have " + MonsterCount + " deployed. Please reduce the requested amount and try again.", "", MessageSeverity.error);
          }
        }
      }, error => { }, () => { });
  }

  editMonster(monster: any) {

    this.bsModalRef = this.modalService.show(EditMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Monster';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterVM = monster;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.isGM_Only = true;
    this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;

    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.searchText = "";
      }
    });
  }

  duplicateMonster(monster: any) {

    monster.monsterTemplate.xPValue = monster.monsterTemplate.xpValue;
    monster.monsterTemplate.imageUrl = monster.imageUrl;
    monster.monsterTemplate.metatags = monster.metatags;
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.monsterTemplateService.getMonsterCountByRuleSetId(this.ruleSetId)
      .subscribe((data: any) => {
        //this.alertService.stopLoadingMessage();
        //let MonsterTemplateCount = data.monsterTemplateCount;
        let MonsterCount = data.monsterCount;
        if (MonsterCount < 200) {

          this.bsModalRef = this.modalService.show(EditMonsterComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate New Monster';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.monsterVM = monster;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef.content.isGM_Only = true;
          this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;

          //this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
          //  class: 'modal-primary modal-custom',
          //  ignoreBackdropClick: true,
          //  keyboard: false
          //});
          //this.bsModalRef.content.title = 'Duplicate New Monster';
          //this.bsModalRef.content.button = 'DUPLICATE';
          //this.bsModalRef.content.ruleSetId = this.ruleSetId;

          //this.bsModalRef.content.monsterTemplateVM = monster.monsterTemplate;
          //this.bsModalRef.content.isCreatingFromMonsterScreen = true;
        }
        else {
          if (MonsterCount >= 200) {
            //this.alertService.showMessage("The maximum number of monsters has been reached, 200. Please delete some monsters and try again.", "", MessageSeverity.error);
            this.alertService.showMessage("The total number of monsters that can be deployed at one time is 200, You currently have " + MonsterCount + " deployed. Please reduce the requested amount and try again.", "", MessageSeverity.error);
          }
        }
      }, error => { }, () => { });

  }

  deleteMonster(monster: any) {
    let message = "Are you sure you want to delete this " + monster.name
      + " Monster?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteMonsterHelper(monster), null, 'Yes', 'No');
  }

  private deleteMonsterHelper(monster: any) {
    monster.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Monster");


    this.monsterTemplateService.deleteMonster_up(monster)
      .subscribe(
        data => {
          if (monster.healthCurrent || monster.healthMax) {
            this.HealthCount = this.HealthCount - 1;
          }
          if (monster.challangeRating) {
            this.ChallangeRatingCount = this.ChallangeRatingCount - 1;
          }
          this.alphabetCount = this.alphabetCount - 1;
          this.ImplementFilter();
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Monster has been deleted successfully.", "", MessageSeverity.success);
          this.monsterList = this.monsterList.filter((val) => val.monsterId != monster.monsterId);
          this.updateDB(this.monsterList);
          try {
            this.noRecordFound = !this.monsterList.length;
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

  enableCombatTracker(monster: any) {
    //this.isLoading = true;
    let enableTxt = monster.addToCombatTracker ? 'Disable' : 'Enable';
    let enableCombatTracker = !monster.addToCombatTracker;
    this.monsterTemplateService.enableCombatTracker(monster.monsterId, enableCombatTracker)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          monster.addToCombatTracker = enableCombatTracker;
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

  useMonster(monster: any) {
    let _monster = Object.assign({}, monster);


    if (_monster.monsterId) {
      this.monsterTemplateService.getMonsterCommands_sp<any>(_monster.monsterId)
        .subscribe(data => {
          if (data.length > 0) {
            this.bsModalRef = this.modalService.show(CastComponent, {
              class: 'modal-primary modal-md',
              ignoreBackdropClick: true,
              keyboard: false
            });

            this.bsModalRef.content.title = "Monster Commands";
            this.bsModalRef.content.ListCommands = data;
            this.bsModalRef.content.Command = _monster;
            this.bsModalRef.content.Character = new Characters();
            this.bsModalRef.content.recordType = 'monster';
            this.bsModalRef.content.recordId = _monster.monsterId;
          } else {

            this.useCommand(_monster);
          }
        }, error => { }, () => { });
    }
  }

  useCommand(monster: any) {

    let msg = "The command value for " + monster.name
      + " Monster has not been provided. Edit this record to input one.";
    if (monster.command == undefined || monster.command == null || monster.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterHelper(monster));
    } else {
      //TODO
      this.useMonsterHelper(monster);
    }
  }

  private useMonsterHelper(monster: any) {

    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = monster.command;
    if (monster.hasOwnProperty("monsterId")) {
      this.bsModalRef.content.recordName = monster.name;
      this.bsModalRef.content.recordImage = monster.imageUrl;
      this.bsModalRef.content.recordType = 'monster';
      this.bsModalRef.content.recordId = monster.monsterId;
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
  }


  //useMonster(monster: any) {
  //  //let _monstertemplate = monster.monsterTemplate;
  //  let _monstertemplate = Object.assign({}, monster.monsterTemplate);
  //    _monstertemplate.imageUrl = monster.imageUrl;
  //    _monstertemplate.name = monster.name;
  //  if (_monstertemplate.monsterTemplateId) {
  //    this.monsterTemplateService.getMonsterTemplateCommands_sp<any>(_monstertemplate.monsterTemplateId)
  //      .subscribe(data => {
  //        if (data.length > 0) {
  //          this.bsModalRef = this.modalService.show(CastComponent, {
  //            class: 'modal-primary modal-md',
  //            ignoreBackdropClick: true,
  //            keyboard: false
  //          });

  //          this.bsModalRef.content.title = "Monster Commands";
  //          this.bsModalRef.content.ListCommands = data;
  //          this.bsModalRef.content.Command = _monstertemplate;
  //          this.bsModalRef.content.Character = new Characters();
  //          this.bsModalRef.content.recordType = 'monster';
  //          this.bsModalRef.content.recordId = monster.monsterId;
  //        } else {
  //          this.useCommand(_monstertemplate, monster);
  //        }
  //      }, error => { }, () => { });
  //  }

  //}



  //useCommand(monsterTemplate: any, monster) {

  //  let msg = "The command value for " + monster.name
  //        + " Monster has not been provided. Edit this record to input one.";

  //    if (monsterTemplate.command == undefined || monsterTemplate.command == null || monsterTemplate.command == '') {
  //          this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterTemplateHelper(monsterTemplate, monster));
  //     }else {
  //            //TODO
  //          this.useMonsterTemplateHelper(monsterTemplate, monster);
  //    }
  //  }

  //private useMonsterTemplateHelper(monsterTemplate: MonsterTemplate, monster) {

  //    this.bsModalRef = this.modalService.show(DiceRollComponent, {
  //      class: 'modal-primary modal-md',
  //      ignoreBackdropClick: true,
  //      keyboard: false
  //    });
  //    this.bsModalRef.content.title = "Dice";
  //    this.bsModalRef.content.tile = -2;
  //    this.bsModalRef.content.characterId = 0;
  //  this.bsModalRef.content.character = new Characters();
  //  this.bsModalRef.content.command = monsterTemplate.command;
  //  if (monsterTemplate.hasOwnProperty("monsterTemplateId")) {
  //    this.bsModalRef.content.recordName = monster.name;
  //    this.bsModalRef.content.recordImage = monster.imageUrl;
  //    this.bsModalRef.content.recordType = 'monster';
  //    this.bsModalRef.content.recordId = monster.monsterId;
  //    }
  //    this.bsModalRef.content.event.subscribe(result => {
  //    });

  //  }

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
      this.editMonster(record);
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

  addMonster() {
    this.bsModalRef = this.modalService.show(AddMonsterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Monsters';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.customDices = this.customDices;
  }

  dropMonsterItems(monster: any) {
    this.bsModalRef = this.modalService.show(DropItemsMonsterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Drop Items';
    this.bsModalRef.content.button = 'Drop';
    this.bsModalRef.content.monsterId = monster.monsterId;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.monsterName = monster.name;
    this.bsModalRef.content.monsterImage = monster.imageUrl;
    let _currency = monster.monsterCurrency ? monster.monsterCurrency.length > 0 ? monster.monsterCurrency : this.CurrencyTypesList : this.CurrencyTypesList;
    this.bsModalRef.content.monsterCurrency = ServiceUtil.DeepCopy(_currency);
    this.bsModalRef.content.event.subscribe(data => {
      monster.itemsCount = +data;
    });
  }

  applyFilters(present_filter, apply_same = false, IsCalledFromClickFunction = false) {
    if (present_filter == 1) {
      this.Alphabetical = true;
      this.Health = false;
      this.ChallangeRating = false;
    }
    if (present_filter == 2) {
      this.ChallangeRating = true;
      this.Alphabetical = false;
      this.Health = false;
    }
    if (present_filter == 3) {
      this.Health = true;
      this.Alphabetical = false;
      this.ChallangeRating = false;
    }
    this.monstersFilter.type = present_filter;
    if (IsCalledFromClickFunction) {
      this.isLoading = true;
      this.page = 1
      this.pageSize = 28;
      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monstersFilter.type)
        .subscribe(data => {
          if (data.RuleSet)
            this.monsterList = Utilities.responseData(data.monsters, this.pageSize);
          this.rulesetModel = data.RuleSet;
          this.setHeaderValues(this.rulesetModel);
          this.monsterList.forEach(function (val) { val.showIcon = false; val.xPValue = val.xpValue });
          try {
            this.noRecordFound = !data.monsters.length;
          } catch (err) { }
          this.ImplementFilter();
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { });
    }
  }
  ImplementFilter() {
    //this.monstersFilter.viewableCount = this.monsterList.length;
    this.monstersFilter.viewableCount = this.alphabetCount;

    switch (this.monstersFilter.type) {
      case 1: // Alphabetical
      default:
        //this.monstersFilter.viewableCount = this.monsterList.length;
        this.monstersFilter.viewableCount = this.alphabetCount;
        this.monstersFilter.name = 'Alphabetical';
        this.monstersFilter.icon = '';
        break;
      case 2: //challange Rating
        this.monstersFilter.viewableCount = this.ChallangeRatingCount;
        //this.monstersFilter.viewableCount = 0;
        //this.monsterList.map((item) => {
        //  if (item.challangeRating) {
        //    this.monstersFilter.viewableCount++;
        //  }
        //})
        this.monstersFilter.name = 'ChallangeRating';
        this.monstersFilter.icon = '';
        break;
      case 3: //Health
        this.monstersFilter.viewableCount = this.HealthCount;
        //this.monstersFilter.viewableCount = 0;
        //this.monsterList.map((item) => {
        //  if (item.healthCurrent || item.healthMax) {
        //    this.monstersFilter.viewableCount++;
        //  }
        //})
        this.monstersFilter.name = 'Health';
        this.monstersFilter.icon = 'icon icon-Health';
        break;
    }
    this.localStorage.saveSyncedSessionData(this.monstersFilter, 'monstersFilter');

  }
  getFilters() {
    if (this.monstersFilter.type == 2 || this.monstersFilter.type == 3) {
      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 1)
        .subscribe(data => {
          //this.alphabetCount = data.monsters.length;
          this.alphabetCount = data.FilterAplhabetCount;
        }, error => {


        }, () => { });
    }
    if (this.monstersFilter.type == 1 || this.monstersFilter.type == 3) {

      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 2)
        .subscribe(data => {
          //let result = data.monsters.filter(s => s.challangeRating);
          //this.ChallangeRatingCount = result.length;
          this.ChallangeRatingCount = data.FilterCRCount;
        }, error => {

        }, () => { });
    }
    if (this.monstersFilter.type == 1 || this.monstersFilter.type == 2) {

      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 3)
        .subscribe(data => {
          //let result = data.monsters.filter(s => s.healthCurrent || s.healthMax);
          //this.HealthCount = result.length;
          this.HealthCount = data.FilterHealthCount;
        }, error => {

        }, () => { });

    }
  }

  DeleteMonsters() {
    this.bsModalRef = this.modalService.show(DeleteMonstersComponent, {
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
    this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monstersFilter.type)
      .subscribe(data => {
        let count = 0;
        var _monster = data.monsters;
        for (var i = 0; i < _monster.length; i++) {
          _monster[i].showIcon = false;
          _monster[i].xPValue = _monster[i].xpValue;
          this.monsterList.push(_monster[i]);
          count += 1;
          if (count == _monster.length - 1) {
            this.onSearch();
          }
        }

        if (this.monstersFilter.type == 1) {
          this.monstersFilter.viewableCount = data.FilterAplhabetCount;
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.monstersFilter.type == 2) {
          this.ChallangeRatingCount = data.FilterCRCount;
        }
        if (this.monstersFilter.type == 3) {
          this.HealthCount = data.FilterHealthCount;
        }
        //this.applyFilters(this.monstersFilter.type, true);
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
          if (result && result.monsters && result.monsters.monsters && result.monsters.monsters.length) {
            await that.getMonstersData(result.monsters);
            setTimeout(() => {
              that.getData(result.monsters.monsters);
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
    this.monsterTemplateService.getMonsterByRuleset_spWithPagination_Cache<any>(this.ruleSetId, this.page, this.pageSize, this.monstersFilter.type)
      .subscribe(async (data) => {
        await this.getMonstersData(data);
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
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

  getMonstersData(data) {
    //check for ruleset
    if (data.monsters)
      this.monsterList = Utilities.responseData(data.monsters, this.pageSize);

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


    if (this.monstersFilter.type == 1) {
      //this.monstersFilter.viewableCount = this.monsterList.length;
      //this.alphabetCount = this.monsterList.length;
      this.monstersFilter.viewableCount = data.FilterAplhabetCount;
      this.alphabetCount = data.FilterAplhabetCount;

    }
    if (this.monstersFilter.type == 2) {
      //let result = this.monsterList.filter(s => s.challangeRating);
      //this.ChallangeRatingCount = result.length;
      this.ChallangeRatingCount = data.FilterCRCount;
    }
    if (this.monstersFilter.type == 3) {
      //let result = this.monsterList.filter(s => s.healthCurrent || s.healthMax);
      //this.HealthCount = result.length;
      this.HealthCount = data.FilterHealthCount;
    }

    //this.applyFilters(this.monstersFilter.type, true);
    this.rulesetModel = data.RuleSet;
    this.setHeaderValues(this.rulesetModel);
    this.monsterList.forEach(function (val) { val.showIcon = false; val.xPValue = val.xpValue });
    try {
      this.noRecordFound = !data.monsters.length;
    } catch (err) { }

    this.CurrencyTypesList = data.CurrencyTypes;
    this.isLoading = false;
  }

  getData(data) {
    if (data) {
      this.pageSize += 200;
      this.monsterList = data.slice(0, this.pageSize)
    }
    if (this.pageSize < data.length) {
      setTimeout(() => {
        this.getData(data);
      }, 2000);
    }

  }

  async updateDB(monsters) {
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
          if (result && result.monsters && result.monsters.monsters && result.monsters.monsters.length) {
            result.monsters.monsters = monsters;
            that.commonService.updateObjectStore('monsters', result.monsters);
          }
        }
      }
    }
  }


}
