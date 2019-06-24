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
import { EditMonsterComponent } from "./edit-monster/edit-monster.component";
import { CreateMonsterTemplateComponent } from "../monster-template/create-monster-template/create-monster-template.component";

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
    pageSize: number = 28;
    offset = (this.page - 1) * this.pageSize;
  backURL: string = '/rulesets';
  IsGm: boolean = false;
    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService, private pageLastViewsService: PageLastViewsService,
      private monsterTemplateService: MonsterTemplateService, private rulesetService: RulesetService, public appService: AppService1
    ) {
        
      this.sharedService.shouldUpdateMonsterList().subscribe(sharedServiceJson => {
            if (sharedServiceJson) {
                this.page = 1;
                this.pageSize = 28;
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
        this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
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
            this.backURL = '/ruleset/campaign-details/' + this.ruleSetId;
          }
          this.isLoading = true;
          this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
              .subscribe(data => {
               //check for ruleset
                if (data.RuleSet)
                  this.monsterList = Utilities.responseData(data.monsters, this.pageSize);

                this.rulesetModel = data.RuleSet;
                  this.setHeaderValues(this.rulesetModel);
                this.monsterList.forEach(function (val) { val.showIcon = false; val.xPValue = val.xpValue });
                    try {
                      this.noRecordFound = !data.monsters.length;
                    } catch (err) { }
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                }, () => { });

          this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetMonsters')
                .subscribe(data => {
                    //if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
                  if (data !== null) {
                    if (data.viewType == 'List') {
                      this.isListView = true;
                      this.isDenseView = false;
                    }
                    else if (data.viewType == 'Dense') {
                      this.isDenseView = true;
                      this.isListView = false;
                    }
                    else {
                      this.isListView = false;
                      this.isDenseView = false;
                    }
                  }

                }, error => {
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                });
        }
        ///*To get ruleset*/
        //this.rulesetService.getRulesetById<Ruleset>(this.ruleSetId)
        //    .subscribe(data => {
        //        this.rulesetModel = data;               
        //    }, error => { }, () => { });
    }

    onScroll() {

        ++this.page;
        this.scrollLoading = true;
      //this.isLoading = true;
      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
            .subscribe(data => {

              var _monster = data.monsters;
              for (var i = 0; i < _monster.length; i++) {
                _monster[i].showIcon = false;
                _monster[i].xPValue = _monster[i].xpValue;

                this.monsterList.push(_monster[i]);
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
          pageName: 'RulesetMonsters',
            viewType: this.isListView ? 'List' : 'Grid',
            UserId: user.id
        }

        this.pageLastViewsService.createPageLastViews<any>(this.pageLastView)
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

    this.pageLastViewsService.createPageLastViews<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isDenseView = data.viewType == 'Dense' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
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
        
    //addAbility() {
    //    this.bsModalRef = this.modalService.show(AddAbilitiesComponent, {
    //        class: 'modal-primary modal-md',
    //        ignoreBackdropClick: true,
    //        keyboard: false
    //    });
    //}

  createMonster() {
       // this.alertService.startLoadingMessage("", "Checking records");      
        this.monsterTemplateService.getMonsterTemplateCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data<2000) {
                  this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
                        class: 'modal-primary modal-custom',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                  this.bsModalRef.content.title = 'Create New Monster';
                    this.bsModalRef.content.button = 'CREATE';
                    this.bsModalRef.content.ruleSetId = this.ruleSetId;
                  this.bsModalRef.content.monsterTemplateVM = { ruleSetId: this.ruleSetId };
                  this.bsModalRef.content.isCreatingFromMonsterScreen = true;

                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);                                        
                }
            }, error => { }, () => { });        
    }

  editMonster(monster: any) {
      this.bsModalRef = this.modalService.show(EditMonsterComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
    this.bsModalRef.content.title = 'Edit Monster Template';
        this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterVM = monster;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    debugger
    }

  ////duplicateMonsterTemplate(monsterTemplate: MonsterTemplate) {
  ////      // this.alertService.startLoadingMessage("", "Checking records");      
  ////      this.monsterTemplateService.getMonsterTemplateCount(this.ruleSetId)
  ////          .subscribe(data => {
  ////              //this.alertService.stopLoadingMessage();
  ////              if (data < 2000) {
  ////                this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
  ////                      class: 'modal-primary modal-custom',
  ////                      ignoreBackdropClick: true,
  ////                      keyboard: false
  ////                  });
  ////                this.bsModalRef.content.title = 'Duplicate Monster Template';
  ////                  this.bsModalRef.content.button = 'DUPLICATE';
  ////                this.bsModalRef.content.monsterTemplateVM = monsterTemplate;
  ////                  this.bsModalRef.content.rulesetID = this.ruleSetId;
  ////              }
  ////              else {
  ////                  //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
  ////                  this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
  ////              }
  ////          }, error => { }, () => { });     
       
  ////  }

  //deleteMonster(monster: Monster) {
  //  let message = "Are you sure you want to delete this " + monster.name
  //    + " Monster?";

  //      this.alertService.showDialog(message,
  //        DialogType.confirm, () => this.deleteMonsterHelper(monster), null, 'Yes', 'No');
  //  }

  //private deleteMonsterHelper(monster: Monster) {
  //  monsterTemplate.ruleSetId = this.ruleSetId;
  //      this.isLoading = true;
  //  this.alertService.startLoadingMessage("", "Deleting a Monster");

       
  //  this.monsterTemplateService.deleteMonster_up(monster)
  //          .subscribe(
  //              data => {
  //                  this.isLoading = false;
  //                  this.alertService.stopLoadingMessage();
  //                this.alertService.showMessage("Monster has been deleted successfully.", "", MessageSeverity.success);
  //                this.monsterList = this.monsterList.filter((val) => val.monsterId != monster.monsterId);
  //                  try {
  //                      this.noRecordFound = !this.monsterList.length;
  //                  } catch (err) { }
  //                  //this.initialize();
  //              },
  //              error => {
  //                  this.isLoading = false;
  //                  this.alertService.stopLoadingMessage();
  //                  let Errors = Utilities.ErrorDetail("Unable to Delete", error);
  //                  if (Errors.sessionExpire) {
  //                      //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
  //                      this.authService.logout(true);
  //                  }
  //                  else
  //                      this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //              });
  //  }

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

  //useMonster(monsterTemplate: any, monsterName: string) {
        
  //  let msg = "The command value for " + monsterName
  //        + " Monster has not been provided. Edit this record to input one.";

  //  if (monsterTemplate.monsterTemplateCommand == undefined || monsterTemplate.monsterTemplateCommand == null) {
  //    this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterTemplateHelper(monsterTemplate));
  //      }
  //  else if (monsterTemplate.monsterTemplateCommand.length == 0) {
  //    this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterTemplateHelper(monsterTemplate));
  //      }
  //      else {
  //          //TODO
  //    this.useMonsterTemplateHelper(monsterTemplate);
  //      }
  //  }

  //private useMonsterTemplateHelper(monsterTemplate: MonsterTemplate) {
  //      this.isLoading = true;
  //  this.alertService.startLoadingMessage("", "TODO => Use Monster Template");
  //      //TODO- PENDING ACTION
  //      setTimeout(() => { this.isLoading = false; 
  //          this.alertService.stopLoadingMessage();
  //      }, 200);
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
  
  addMonster() { }
}
