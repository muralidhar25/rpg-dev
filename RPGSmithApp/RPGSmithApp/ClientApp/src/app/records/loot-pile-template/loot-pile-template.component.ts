import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService, DialogType, MessageSeverity } from '../../core/common/alert.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { PageLastViewsService } from '../../core/services/pagelast-view.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppService1 } from "../../app.service";
import { Utilities } from "../../core/common/utilities";
import { User } from "../../core/models/user.model";
import { DBkeys } from "../../core/common/db-keys";
import { ItemMaster } from "../../core/models/view-models/item-master.model";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";
import { LootService } from "../../core/services/loot.service";
import { GiveawayComponent } from "../loot/giveaway/giveaway.component";
import { DeleteAllLootItemsComponent } from "../loot/delete-all-loot-items/delete-all-loot-items.component";
import { AddLootPileComponent } from "../loot-pile/add-loot-pile/add-loot-pile.component";
import { CreateLootPileTemplateComponent } from "./create-loot-pile-template/create-loot-pile-template.component";
import { DeleteLootPileTemplateComponent } from "./delete-loot-pile-template/delete-loot-pile-template.component";
import { ServiceUtil } from "../../core/services/service-util";

@Component({
  selector: 'app-loot-pile-template',
  templateUrl: './loot-pile-template.component.html',
  styleUrls: ['./loot-pile-template.component.scss']
})
export class LootPileTemplateComponent implements OnInit {

  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
  ruleSetId: number;
  ItemMasterList: any;
  RuleSet: any;
  pageLastView: any;
  noRecordFound: boolean = false;
  page: number = 1;
  scrollLoading: boolean = false;
  pageSize: number = 28;
  timeoutHandler: any;
  offset = (this.page - 1) * this.pageSize;
  backURL: string = '/rulesets';
  IsGm: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private pageLastViewsService: PageLastViewsService,
    private sharedService: SharedService,
    public appService: AppService1,
    public lootService: LootService
  ) {

    this.sharedService.shouldUpdateItemsList().subscribe(sharedServiceJson => {

      if (sharedServiceJson) {
        this.page = 1;
        this.pageSize = 28;
        this.initialize();
      }
    });

    this.appService.shouldUpdateItemsList().subscribe(sharedServiceJson => {
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
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
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

      //this.lootService.getLootItemsById<any>(this.ruleSetId, this.page, this.pageSize)
      //  .subscribe(data => {
      //    //console.log(data);
      //    this.ItemMasterList = Utilities.responseData(data.ItemMaster, this.pageSize);
      //    this.ItemMasterList.forEach(function (val) { val.showIcon = false; });
      //    this.RuleSet = data.RuleSet;
      //    this.setHeaderValues(this.RuleSet);
      //    try {
      //      this.noRecordFound = !data.ItemMaster.length;
      //    } catch (err) { }
      //    this.isLoading = false;
      //  }, error => {
      //    this.isLoading = false;
      //    let Errors = Utilities.ErrorDetail("", error);
      //    if (Errors.sessionExpire) {
      //      //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
      //      this.authService.logout(true);
      //    }
      //  }, () => { })


      this.lootService.getByRuleSetId_sp<any>(this.ruleSetId, this.page, this.pageSize)
        .subscribe(data => {
          debugger

          //console.log(data);
          this.ItemMasterList = Utilities.responseData(data.lootTemplates, this.pageSize);
          this.ItemMasterList.forEach(function (val) { val.showIcon = false; });
          this.RuleSet = data.RuleSet;
          this.setHeaderValues(this.RuleSet);
          try {
            this.noRecordFound = !data.lootTemplates.length;
          } catch (err) { }
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {
          setTimeout(() => {
            if (window.innerHeight > document.body.clientHeight) {
              this.onScroll();
            }
          }, 10)
        })


      this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'ItemMaster')
        .subscribe(data => {
          // if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
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
  }
  onScroll() {

    ++this.page;
    this.scrollLoading = true;
    this.lootService.getByRuleSetId_sp<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {
        // console.log(data);
        var _ItemMaster = data.lootTemplates;
        for (var i = 0; i < _ItemMaster.length; i++) {
          _ItemMaster[i].showIcon = false;
          this.ItemMasterList.push(_ItemMaster[i]);
        }
        this.scrollLoading = false;
      }, error => {
        this.isLoading = false;
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { })

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
      pageName: 'ItemMaster',
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
      pageName: 'ItemMaster',
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
    setTimeout(() => {
      if (window.innerHeight > document.body.clientHeight) {
        this.onScroll();
      }
    }, 10)
  }

  addItem() {
    this.bsModalRef = this.modalService.show(AddLootPileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Loot Pile';
    this.bsModalRef.content.button = 'ADD';
    //this.bsModalRef.content.event.subscribe(data => {
    //  debugger
    //  console.log(data);
    //});
  }

  manageIcon(id: number) {
    debugger
    this.ItemMasterList.forEach(function (val) {
      if (id === val.lootTemplateId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  createItem() {
    this.bsModalRef = this.modalService.show(CreateLootPileTemplateComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Create Random Loot';
    this.bsModalRef.content.button = 'CREATE';
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.lootPileVM = {
      ruleSetId: this.ruleSetId,
      ruleSet: this.RuleSet
    };


  }

  editItemTemplate(itemMaster: any) {
    this.bsModalRef = this.modalService.show(CreateLootPileTemplateComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Random Loot';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.lootPileVM = itemMaster;
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
  }

  duplicateItemTemplate(itemMaster: any) {
    this.bsModalRef = this.modalService.show(CreateLootPileTemplateComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Duplicate Random Loot';
    this.bsModalRef.content.button = 'DUPLICATE';
    this.bsModalRef.content.lootPileVM = itemMaster;
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
  }

  GoToDetails(item: any) {
    this.router.navigate(['/ruleset/loot-pile-template-details', item.lootTemplateId]);
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
      this.editItemTemplate(record);
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


  //Give(item) {
  //  this.bsModalRef = this.modalService.show(GiveawayComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.giveAwayItem = item;
  //}
  //Show(item) {

  //  let show = item.isShow ? 'Hide' : 'Show';

  //  this.lootService.showLoot<any>(item.lootTemplateId, !item.isShow)
  //    .subscribe(data => {
  //      this.isLoading = false;
  //      this.alertService.stopLoadingMessage();
  //      item.isShow = !item.isShow;
  //    },
  //      error => {
  //        this.isLoading = false;
  //        this.alertService.stopLoadingMessage();
  //        let Errors = Utilities.ErrorDetail("Unable to " + show, error);
  //        if (Errors.sessionExpire) {
  //          this.authService.logout(true);
  //        }
  //        else
  //          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //      });
  //}
  refresh() {
    this.page = 1;
    this.pageSize = 28;
    this.initialize();
  }

  deleteItemTemplate(itemMaster: any) {

    let message = "Are you sure you want to delete this " + itemMaster.name + " Random Loot?";
    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteLootItem(itemMaster), null, 'Yes', 'No');
  }

  deleteLootItem(itemMaster: any) {
    this.alertService.startLoadingMessage("", "Deleting Random Loot");

    //this.isLoading = true;
    this.lootService.deleteLootPileTemplate<any>(itemMaster.lootTemplateId)
      .subscribe(data => {
        setTimeout(() => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
        }, 200);
        this.alertService.showMessage("Random Loot Item has been deleted successfully.", "", MessageSeverity.success);
        this.ItemMasterList = this.ItemMasterList.filter((val) => val.lootTemplateId != itemMaster.lootTemplateId);
        try {
          this.noRecordFound = !this.ItemMasterList.length;
        } catch (err) { }
      }, error => {
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
        else {
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }

      })
  }

  DeleteLootTemplate() {
    //console.log('delete All');
    this.bsModalRef = this.modalService.show(DeleteLootPileTemplateComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;

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
    this.bsModalRef.content.recordName = this.RuleSet.ruleSetName;
    this.bsModalRef.content.recordImage = this.RuleSet.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset'
    this.bsModalRef.content.isFromCampaignDetail = true;
  }

  DeployLootPile(item) {
    let lootToDeploy = [];
    var reItems = [];
    let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(item.lootTemplateRandomizationEngines);
    let currentItemsToDeploy = ServiceUtil.getItemsFromRandomizationEngine_WithMultipleSeletion(r_engine, this.alertService);
    if (currentItemsToDeploy && currentItemsToDeploy.length) {
      currentItemsToDeploy.map((re) => {
        re.deployCount = 1;
        reItems.push(re);
      });
    }

    lootToDeploy.push({
      qty: 1,
      lootTemplateId: item.lootTemplateId,
      rulesetId: item.ruleSetId,
      reitems: reItems
    });


    this.alertService.startLoadingMessage("", "Deploying Random Loot");

    this.lootService.deployToLoot<any>(lootToDeploy)
      .subscribe(data => {
        setTimeout(() => {
          this.alertService.stopLoadingMessage();
        }, 200);
        this.alertService.showMessage("Loot Pile " + item.name + " Has Been Deployed", "", MessageSeverity.success);

      }, error => {
        setTimeout(() => {
          this.alertService.stopLoadingMessage();
        }, 200);
        let _message = "Unable to Deploy";
        let Errors = Utilities.ErrorDetail(_message, error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
        else {
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }
      });

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
}
