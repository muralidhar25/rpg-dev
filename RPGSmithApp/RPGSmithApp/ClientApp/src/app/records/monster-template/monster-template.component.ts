import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ConfigurationService } from "../../core/common/configuration.service";
import { RulesetService } from "../../core/services/ruleset.service";
import { AuthService } from "../../core/auth/auth.service";
import { PageLastViewsService } from "../../core/services/pagelast-view.service";
import { CommonService } from "../../core/services/shared/common.service";
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
import { MonsterTemplate } from "../../core/models/view-models/monster-template.model";
import { CreateMonsterTemplateComponent } from "./create-monster-template/create-monster-template.component";
import { DeployMonsterComponent } from "./deploy-monster/deploy-monster.component";
import { CreateMonsterGroupComponent } from "./moster-group/monster-group.component";
import { Bundle } from "../../core/models/view-models/bundle.model";
import { VIEW } from "../../core/models/enums";
import { CustomDice } from "../../core/models/view-models/custome-dice.model";
import { DeleteMonsterTempltesComponent } from "./delete-monster-templates/delete-monster-templates.component";
import { ServiceUtil } from "../../core/services/service-util";


@Component({
  selector: 'app-monster-template',
  templateUrl: './monster-template.component.html',
  styleUrls: ['./monster-template.component.scss']
})

export class MonsterTemplateComponent implements OnInit {

  rulesetModel: any;
  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  ruleSetId: number;
  monsterTemplateId: number;
  monsterTemplateList: any;
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
  Alphabetical: boolean = false;
  ChallangeRating: boolean = false;
  Health: boolean = false;
  monsterFilter: any = {
    type: 1,
    name: 'Alphabetical',
    icon: '',
    viewableCount: 0
  };
  alphabetCount: number;
  ChallangeRatingCount: number;
  HealthCount: number;
  CurrencyTypesList = [];
  searchText: string;
  actualRecords: any;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private pageLastViewsService: PageLastViewsService,
    private monsterTemplateService: MonsterTemplateService, public appService: AppService1,
    private commonService: CommonService) {
    //this.route.params.subscribe(params => { this.monsterTemplateId = params['id']; });
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
        let displayURL = '/ruleset/monster-template';
        let originalURl = '/ruleset/monster-template/' + RuleSetID;
        Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
      }
    }

    this.sharedService.shouldUpdateMonsterTemplateList().subscribe(sharedServiceJson => {
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
    this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination_Cache<any>(this.ruleSetId, 1, 9999, 1)
      .subscribe(async (data) => {
        await this.commonService.updateObjectStore("monsterTemplates", data);
        this.initialize();

        //this.isLoading = false;
      }, error => {
        this.isLoading = false;
      }, () => { });
  }

  private async initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    let localStorageFilters = this.localStorage.getDataObject<number>('monsterFilters');
    if (localStorageFilters != null) {
      this.monsterFilter = localStorageFilters;
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

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetMonsterTemplates')
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
    //if (this.actualRecords && this.pageSize < this.actualRecords.length) {

    //  if (isAutoScroll) {
    //    this.scrollLoading = true;
    //  }
    //  this.pageSize += 28;
    //  this.monsterTemplateList = this.actualRecords.slice(0, this.pageSize);
    //  this.scrollLoading = false;
    //}

    ++this.page;
    if (isAutoScroll) {
      this.scrollLoading = true;
    }
    this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monsterFilter.type)
      .subscribe(data => {

        var _monsterTemplates = data.monsterTemplates;
        for (var i = 0; i < _monsterTemplates.length; i++) {
          _monsterTemplates[i].showIcon = false;
          _monsterTemplates[i].xPValue = _monsterTemplates[i].xpValue;

          this.monsterTemplateList.push(_monsterTemplates[i]);
        }
        this.scrollLoading = false;

        if (this.monsterFilter.type == 1) {
          //this.alphabetCount = this.monsterTemplateList.length;
          this.alphabetCount = data.FilterAplhabetCount;
        }

        if (this.monsterFilter.type == 2) {
          //let result = this.monsterTemplateList.filter(s => s.challangeRating);
          //this.ChallangeRatingCount = result.length;
          this.ChallangeRatingCount = data.FilterCRCount;
        }

        if (this.monsterFilter.type == 3) {
          //let result = this.monsterTemplateList.filter(s => s.health);
          //this.HealthCount = result.length;
          this.HealthCount = data.FilterHealthCount;
        }
        this.applyFilters(this.monsterFilter.type, true);

      }, error => {
        this.isLoading = false;
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
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
      pageName: 'RulesetMonsterTemplates',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.monsterTemplateService.createPageLastViewsMonsterTemplate<any>(this.pageLastView)
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
      pageName: 'RulesetMonsterTemplates',
      viewType: 'Dense',
      UserId: user.id
    }

    this.monsterTemplateService.createPageLastViewsMonsterTemplate<any>(this.pageLastView)
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
  manageIcon(id: number, isBundle: boolean = false) {
    this.monsterTemplateList.forEach(function (val) {
      if (id === val.monsterTemplateId && isBundle === val.isBundle) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  //addAbility() {
  //    this.bsModalRef = this.modalService.show(AddAbilitiesComponent, {
  //        class: 'modal-primary modal-md',
  //        ignoreBackdropClick: true,
  //        keyboard: false
  //    });
  //}

  createMonsterTemplate() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.monsterTemplateService.getMonsterTemplateCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create New Monster Template';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.monsterTemplateVM = { ruleSetId: this.ruleSetId, monsterTemplateCurrency: this.CurrencyTypesList };
          this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

  editMonsterTemplate(monsterTemplate: MonsterTemplate) {
    if (monsterTemplate.isBundle) {
      this.bsModalRef = this.modalService.show(CreateMonsterGroupComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Group';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.rulesetID = this.ruleSetId;
      this.bsModalRef.content.bundleVM = {
        bundleId: monsterTemplate.monsterTemplateId,
        ruleSetId: this.ruleSetId,
        bundleName: monsterTemplate.name,
        bundleImage: monsterTemplate.imageUrl,
        bundleVisibleDesc: monsterTemplate.description,
        gmOnly: monsterTemplate.gmOnly,
        metatags: monsterTemplate.metatags,
        ruleSet: this.rulesetModel,
        addToCombat: monsterTemplate.isRandomizationEngine //isRandomizationEngine is user for addToCombat   
      };
    }
    else {
      this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Monster Template';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.monsterTemplateVM = monsterTemplate;
      this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
      this.bsModalRef.content.rulesetID = this.ruleSetId;
      this.bsModalRef.content.event.subscribe(data => {
        if (data) {
          this.searchText = "";
        }
      });
    }

  }

  duplicateMonsterTemplate(monsterTemplate: MonsterTemplate) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.monsterTemplateService.getMonsterTemplateCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {

          if (monsterTemplate.isBundle) {
            this.bsModalRef = this.modalService.show(CreateMonsterGroupComponent, {
              class: 'modal-primary modal-custom',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.title = 'Edit Group';
            this.bsModalRef.content.button = 'DUPLICATE';
            this.bsModalRef.content.rulesetID = this.ruleSetId;
            this.bsModalRef.content.bundleVM = {
              bundleId: monsterTemplate.monsterTemplateId,
              ruleSetId: this.ruleSetId,
              bundleName: monsterTemplate.name,
              bundleImage: monsterTemplate.imageUrl,
              bundleVisibleDesc: monsterTemplate.description,
              gmOnly: monsterTemplate.gmOnly,
              metatags: monsterTemplate.metatags,
              ruleSet: this.rulesetModel,
              addToCombat: monsterTemplate.isRandomizationEngine //isRandomizationEngine is user for addToCombat
            };
          }
          else {
            this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
              class: 'modal-primary modal-custom',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.title = 'Duplicate Monster Template';
            this.bsModalRef.content.button = 'DUPLICATE';
            this.bsModalRef.content.monsterTemplateVM = monsterTemplate;
            this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
            this.bsModalRef.content.rulesetID = this.ruleSetId;
          }

        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteMonsterTemplate(monsterTemplate: MonsterTemplate) {
    let message = "Are you sure you want to delete this " + monsterTemplate.name
      + " Monster Template?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteMonsterTemplateHelper(monsterTemplate), null, 'Yes', 'No');
  }

  private deleteMonsterTemplateHelper(monsterTemplate: MonsterTemplate) {
    monsterTemplate.ruleSetId = this.ruleSetId;
    this.isLoading = true;

    if (monsterTemplate.isBundle) {
      this.alertService.startLoadingMessage("", "Deleting Bundle");
      let bundleObj: Bundle = new Bundle(
        monsterTemplate.monsterTemplateId, monsterTemplate.ruleSetId, monsterTemplate.name, monsterTemplate.imageUrl, monsterTemplate.description, 0,
        0, 0, new Ruleset(), VIEW.ADD, '', monsterTemplate.metatags, '', '', '', [], monsterTemplate.isRandomizationEngine, monsterTemplate.gmOnly //isRandomizationEngine is user for addToCombat
      );
      this.monsterTemplateService.deleteBundle(bundleObj)
        .subscribe(
          data => {
            if (monsterTemplate.health) {
              this.HealthCount = this.HealthCount - 1;
            }
            if (monsterTemplate.challangeRating) {
              this.ChallangeRatingCount = this.ChallangeRatingCount - 1;
            }
            this.alphabetCount = this.alphabetCount - 1;
            this.ImplementFilter();

            setTimeout(() => {
              this.isLoading = false;
              this.alertService.stopLoadingMessage();
            }, 200);
            this.alertService.showMessage("Group has been deleted successfully.", "", MessageSeverity.success);
            this.monsterTemplateList = this.monsterTemplateList.filter((val) => val.monsterTemplateId != monsterTemplate.monsterTemplateId);
            this.updateDB(this.monsterTemplateList);
            try {
              this.noRecordFound = !this.monsterTemplateList.length;
            } catch (err) { }
            //this.initialize();
          },
          error => {
            setTimeout(() => {
              this.isLoading = false;
              this.alertService.stopLoadingMessage();
            }, 200);
            let _message = "Unable to Delete";
            let Errors = Utilities.ErrorDetail(_message, error);
            if (Errors.sessionExpire) {
              //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              this.authService.logout(true);
            }
            else
              this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          });
    }
    else {
      this.alertService.startLoadingMessage("", "Deleting a Monster Template");
      this.monsterTemplateService.deleteMonsterTemplate_up(monsterTemplate)
        .subscribe(
          data => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
            this.alertService.showMessage("Monster Template has been deleted successfully.", "", MessageSeverity.success);
            this.monsterTemplateList = this.monsterTemplateList.filter((val) => val.monsterTemplateId != monsterTemplate.monsterTemplateId);
            try {
              this.noRecordFound = !this.monsterTemplateList.length;
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
  }

  //enableAbility(ability: Ability) {
  //    //this.isLoading = true;
  //    let enableTxt = ability.isEnabled ? 'Disable' : 'Enable';
  //    this.abilityService.enableAbility(ability.abilityId)
  //        .subscribe(
  //            data => {
  //                this.isLoading = false; 
  //                this.alertService.stopLoadingMessage();
  //                ability.isEnabled = ability.isEnabled ? false : true;
  //            },
  //            error => {
  //                this.isLoading = false; 
  //                this.alertService.stopLoadingMessage();
  //                let Errors = Utilities.ErrorDetail("Unable to " + enableTxt, error);
  //                if (Errors.sessionExpire) {
  //                    this.authService.logout(true);
  //                }
  //                else
  //                    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //            });
  //}

  useMonsterTemplate(monsterTemplate: any) {

    let msg = "The command value for " + monsterTemplate.name
      + " Monster Template has not been provided. Edit this record to input one.";

    if (monsterTemplate.monsterTemplateCommand == undefined || monsterTemplate.monsterTemplateCommand == null) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterTemplateHelper(monsterTemplate));
    }
    else if (monsterTemplate.monsterTemplateCommand.length == 0) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterTemplateHelper(monsterTemplate));
    }
    else {
      //TODO
      this.useMonsterTemplateHelper(monsterTemplate);
    }
  }

  private useMonsterTemplateHelper(monsterTemplate: MonsterTemplate) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Use Monster Template");
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
      this.editMonsterTemplate(record);
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

  deployMonster(item) {

    this.bsModalRef = this.modalService.show(DeployMonsterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Quantity";
    this.bsModalRef.content.monsterInfo = item;
    this.bsModalRef.content.rulesetId = this.ruleSetId
    if (item.isBundle) {
      this.bsModalRef.content.bundleItems = item.bundleItems
    }
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

    this.monsterFilter.type = present_filter;
    if (IsCalledFromClickFunction) {
      this.isLoading = true;
      this.page = 1
      this.pageSize = 28;
      this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monsterFilter.type)
        .subscribe(data => {

          if (data.RuleSet)
            this.monsterTemplateList = Utilities.responseData(data.monsterTemplates, this.pageSize);

          this.rulesetModel = data.RuleSet;

          this.setHeaderValues(this.rulesetModel);

          this.monsterTemplateList.forEach(function (val) { val.showIcon = false; val.xPValue = val.xpValue });

          try {
            this.noRecordFound = !data.monsterTemplates.length;
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

    //this.monsterFilter.viewableCount = this.monsterTemplateList.length;
    this.monsterFilter.viewableCount = this.alphabetCount;

    switch (this.monsterFilter.type) {
      case 1: // Alphabetical
      default:
        //this.monsterFilter.viewableCount = this.monsterTemplateList.length;
        this.monsterFilter.viewableCount = this.alphabetCount;
        this.monsterFilter.name = 'Alphabetical';
        this.monsterFilter.icon = '';
        break;
      case 2: //challange Rating
        this.monsterFilter.viewableCount = this.ChallangeRatingCount;
        //this.monsterFilter.viewableCount = 0;
        //this.monsterTemplateList.map((item) => {
        //  if (item.challangeRating) {
        //    this.monsterFilter.viewableCount++;
        //  }
        //})
        this.monsterFilter.name = 'ChallangeRating';
        this.monsterFilter.icon = '';
        break;
      case 3: //Health
        this.monsterFilter.viewableCount = this.HealthCount;
        //this.monsterFilter.viewableCount = 0;
        //this.monsterTemplateList.map((item) => {
        //  if (item.health) {
        //    this.monsterFilter.viewableCount++;
        //  }
        //})
        this.monsterFilter.name = 'Health';
        this.monsterFilter.icon = 'icon icon-Health';
        break;
    }
    this.localStorage.saveSyncedSessionData(this.monsterFilter, 'monsterFilter');

  }


  getFilters() {

    if (this.monsterFilter.type == 2 || this.monsterFilter.type == 3) {
      this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 1)
        .subscribe(data => {
          //this.alphabetCount = data.monsterTemplates.length;
          this.alphabetCount = data.FilterAplhabetCount;

        }, error => {

        }, () => { });
    }
    if (this.monsterFilter.type == 1 || this.monsterFilter.type == 3) {

      this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 2)
        .subscribe(data => {
          //let result = data.monsterTemplates.filter(s => s.challangeRating);
          //this.ChallangeRatingCount = result.length;
          this.ChallangeRatingCount = data.FilterCRCount;
        }, error => {

        }, () => { });

    }
    if (this.monsterFilter.type == 1 || this.monsterFilter.type == 2) {
      this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 3)
        .subscribe(data => {
          //let result = data.monsterTemplates.filter(s => s.health);
          //this.HealthCount = result.length;
          this.HealthCount = data.FilterHealthCount;
        }, error => {

        }, () => { });

    }
  }
  createMonsterGroup() {




    // this.alertService.startLoadingMessage("", "Checking records");      
    this.monsterTemplateService.getMonsterTemplateCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateMonsterGroupComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create Monster Group';
          this.bsModalRef.content.button = 'Create';
          this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef.content.bundleVM = {
            ruleSetId: this.ruleSetId,
            ruleSet: this.rulesetModel
          };

        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }
  GoToDetails(monsterTemplate: MonsterTemplate) {
    if (monsterTemplate.isBundle) {
      this.router.navigate(['/ruleset/monster-bundle-details', monsterTemplate.monsterTemplateId]);
    }
    else {
      this.router.navigate(['/ruleset/monster-template-details', monsterTemplate.monsterTemplateId]);
    }
  }

  DeleteTemplates() {
    this.bsModalRef = this.modalService.show(DeleteMonsterTempltesComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    //this.bsModalRef.content.characterId = this.characterId;
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
    this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monsterFilter.type)
      .subscribe(data => {
        var _monsterTemplates = data.monsterTemplates;
        let count = 0;
        for (var i = 0; i < _monsterTemplates.length; i++) {
          _monsterTemplates[i].showIcon = false;
          _monsterTemplates[i].xPValue = _monsterTemplates[i].xpValue;

          this.monsterTemplateList.push(_monsterTemplates[i]);
          count += 1;
          if (count == _monsterTemplates.length - 1) {
            this.onSearch();
          }
        }

        if (this.monsterFilter.type == 1) {
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.monsterFilter.type == 2) {
          this.ChallangeRatingCount = data.FilterCRCount;
        }
        if (this.monsterFilter.type == 3) {
          this.HealthCount = data.FilterHealthCount;
        }
        this.applyFilters(this.monsterFilter.type, true);

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
          if (result && result.monsterTemplates && result.monsterTemplates.monsterTemplates && result.monsterTemplates.monsterTemplates.length) {
            await that.getMonsterTemplateData(result.monsterTemplates);
            setTimeout(() => {
              that.getData(result.monsterTemplates.monsterTemplates);
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
    this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monsterFilter.type)
      .subscribe(async (data) => {
        await this.getMonsterTemplateData(data);
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

  getMonsterTemplateData(data) {
    //check for ruleset
    if (data.monsterTemplates) {
      this.actualRecords = data.monsterTemplates;
      this.monsterTemplateList = Utilities.responseData(data.monsterTemplates, this.pageSize);
    }
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

    if (this.monsterFilter.type == 1) {
      //this.monsterFilter.viewableCount = this.monsterTemplateList.length;
      //this.alphabetCount = this.monsterTemplateList.length;
      this.monsterFilter.viewableCount = data.FilterAplhabetCount;
      this.alphabetCount = data.FilterAplhabetCount;
    }
    if (this.monsterFilter.type == 2) {
      //let result = this.monsterTemplateList.filter(s => s.challangeRating);
      //this.ChallangeRatingCount = result.length;
      this.ChallangeRatingCount = data.FilterCRCount;
    }
    if (this.monsterFilter.type == 3) {
      //let result = this.monsterTemplateList.filter(s => s.health);
      //this.HealthCount = result.length;
      this.HealthCount = data.FilterHealthCount;
    }

    this.applyFilters(this.monsterFilter.type, true);

    this.rulesetModel = data.RuleSet;
    this.setHeaderValues(this.rulesetModel);
    this.monsterTemplateList.forEach(function (val) { val.showIcon = false; val.xPValue = val.xpValue });
    try {
      this.noRecordFound = !data.monsterTemplates.length;
    } catch (err) { }

    this.CurrencyTypesList = data.CurrencyTypes;
    this.isLoading = false;

  }


  getData(data) {
    if (data) {
      this.pageSize += 200;
      this.monsterTemplateList = data.slice(0, this.pageSize)
    }
    if (this.pageSize < data.length) {
      setTimeout(() => {
        this.getData(data);
      }, 2000);
    }

  }

  async updateDB(monsterTemplates) {
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
          if (result && result.monsterTemplates && result.monsterTemplates.monsterTemplates && result.monsterTemplates.monsterTemplates.length) {
            result.monsterTemplates.monsterTemplates = monsterTemplates;
            that.commonService.updateObjectStore('monsterTemplates', result.monsterTemplates);
          }
        }
      }
    }
  }

}
