import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService, DialogType, MessageSeverity } from '../../core/common/alert.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { ItemMasterService } from '../../core/services/item-master.service';
import { PageLastViewsService } from '../../core/services/pagelast-view.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppService1 } from "../../app.service";
import { Utilities } from "../../core/common/utilities";
import { User } from "../../core/models/user.model";
import { DBkeys } from "../../core/common/db-keys";
import { ItemMaster } from "../../core/models/view-models/item-master.model";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { VIEW } from "../../core/models/enums";
import { Bundle } from "../../core/models/view-models/bundle.model";
import { GiveawayComponent } from "./giveaway/giveaway.component";
import { LootService } from "../../core/services/loot.service";
import { AddlootComponent } from "./addloot/addloot.component";
import { CreatelootComponent } from "./createloot/createloot.component";
import { error } from "util";
import { DeleteAllLootItemsComponent } from "./delete-all-loot-items/delete-all-loot-items.component";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";
import { CreateLootPileComponent } from "../loot-pile/create-loot-pile/create-loot-pile.component";
import { MoveLootComponent } from "./move-loot/move-loot.component";
import { AddLootPileComponent } from "../loot-pile/add-loot-pile/add-loot-pile.component";

@Component({
  selector: 'app-loot',
  templateUrl: './loot.component.html',
  styleUrls: ['./loot.component.scss']
})
export class LootComponent implements OnInit {

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
  lootPileItems: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private pageLastViewsService: PageLastViewsService,
    private sharedService: SharedService,
    private itemMasterService: ItemMasterService,
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

      this.lootService.getLootItemsById<any>(this.ruleSetId, this.page, this.pageSize)
        .subscribe(data => {
          //console.log(data);
          this.ItemMasterList = Utilities.responseData(data.ItemMaster, this.pageSize);
          this.ItemMasterList.forEach(function (val) { val.showIcon = false; });
          this.RuleSet = data.RuleSet;
          this.setHeaderValues(this.RuleSet);
          try {
            this.noRecordFound = !data.ItemMaster.length;
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
    this.lootService.getLootItemsById<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {
        // console.log(data);
        var _ItemMaster = data.ItemMaster;
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
    this.bsModalRef = this.modalService.show(AddlootComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Loot';
    this.bsModalRef.content.button = 'ADD';
  }

  addLootPileItem(lootPileDetail) {
    this.bsModalRef = this.modalService.show(AddLootPileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Loot';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.LootPileDetail = lootPileDetail
  }

  manageIcon(id: number) {
    this.ItemMasterList.forEach(function (val) {
      if (id === val.lootId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  createItem() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.itemMasterService.getLootItemCount(this.ruleSetId)
      .subscribe((data: any) => {
        //this.alertService.stopLoadingMessage();
        let LootCount = data.lootCount;
        let ItemMasterCount = data.itemMasterCount;
        if (LootCount < 200 && ItemMasterCount < 2000) {
          this.bsModalRef = this.modalService.show(CreatelootComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create Loot';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.itemMasterVM = {
            ruleSetId: this.ruleSetId,
            ruleSet: this.RuleSet
          };
        }
        else {

          if (ItemMasterCount >= 2000) {
            this.alertService.showMessage("The maximum number of records to create item template has been reached, 2,000. Please delete some item templates and try again.", "", MessageSeverity.error);
          } else if (LootCount >= 200) {
            this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
          }

        }
      }, error => { }, () => { });


  }

  getLootPileItems(lootPileId) {
    this.itemMasterService.getLootPile<any>(lootPileId)
      .subscribe(data => {
        if (data) {
          this.lootPileItems = data.lootPileItems;
        }
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });
  }

  editItemTemplate(itemMaster: any) {
    if (itemMaster.isLootPile) {
      console.log("LootPileId", itemMaster.isLootPile);
      this.itemMasterService.getLootPile<any>(itemMaster.lootId)
        .subscribe(data => {
          if (data) {
            data.lootPileItems;

            ////////////////////////////////////////////////////
            itemMaster.lootPileItems = data.lootPileItems//this.lootPileItems;
            let lootPileVM = { lootId: itemMaster.lootId, ruleSetId: itemMaster.ruleSetId, name: itemMaster.itemName, imageUrl: itemMaster.itemImage, description: itemMaster.itemVisibleDesc, gmOnly: itemMaster.gmOnly, metatags: itemMaster.metatags, visible: itemMaster.isVisible, itemList: itemMaster.lootPileItems }

            this.bsModalRef = this.modalService.show(CreateLootPileComponent, {
              class: 'modal-primary modal-custom',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.title = 'Edit Loot Pile';
            this.bsModalRef.content.button = 'UPDATE';
            this.bsModalRef.content.lootPileVM = lootPileVM;
            this.bsModalRef.content.ruleSetId = this.ruleSetId;
            this.bsModalRef.content.fromDetail = true;
            //this.bsModalRef.content.event.subscribe(data => {
            //  this.lootPileId = data.itemMasterId;
            //  this.initialize();
            //});

            ////////////////////////////////////////////////////
          }
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { });

    } else {
      this.bsModalRef = this.modalService.show(CreatelootComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Loot';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.itemMasterVM = itemMaster;
      this.bsModalRef.content.rulesetID = this.ruleSetId;
    }



  }

  duplicateItemTemplate(itemMaster: any) {
    this.itemMasterService.getLootItemCount(this.ruleSetId)
      .subscribe((data: any) => {
        //this.alertService.stopLoadingMessage();
        let LootCount = data.lootCount;
        let ItemMasterCount = data.itemMasterCount;
        if (LootCount < 200 && ItemMasterCount < 2000) {
          if (itemMaster.isLootPile) {
            this.itemMasterService.getLootPile<any>(itemMaster.lootId)
              .subscribe(data => {
                if (data) {
                  data.lootPileItems;
                  //////////////////////////////////////
                  itemMaster.lootPileItems = data.lootPileItems //this.lootPileItems;
                  let lootPileVM = { ruleSetId: itemMaster.ruleSetId, name: itemMaster.itemName, imageUrl: itemMaster.itemImage, description: itemMaster.itemVisibleDesc, gmOnly: itemMaster.gmOnly, metatags: itemMaster.metatags, visible: itemMaster.isVisible, itemList: itemMaster.lootPileItems }
                  this.bsModalRef = this.modalService.show(CreateLootPileComponent, {
                    class: 'modal-primary modal-custom',
                    ignoreBackdropClick: true,
                    keyboard: false
                  });
                  this.bsModalRef.content.title = 'Duplicate Loot Pile';
                  this.bsModalRef.content.button = 'DUPLICATE';
                  this.bsModalRef.content.lootPileVM = lootPileVM;
                  this.bsModalRef.content.ruleSetId = this.ruleSetId;
                  this.bsModalRef.content.fromDetail = true;
                  /////////////////////////////////////
                }
              }, error => {
                this.isLoading = false;
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                  this.authService.logout(true);
                }
              }, () => { });


          } else {
            this.bsModalRef = this.modalService.show(CreatelootComponent, {
              class: 'modal-primary modal-custom',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.title = 'Duplicate Loot';
            this.bsModalRef.content.button = 'DUPLICATE';
            this.bsModalRef.content.itemMasterVM = itemMaster;
            this.bsModalRef.content.rulesetID = this.ruleSetId;
          }
        }
        else {

          if (ItemMasterCount >= 2000) {
            this.alertService.showMessage("The maximum number of records to create item template has been reached, 2,000. Please delete some item templates and try again.", "", MessageSeverity.error);
          } else if (LootCount >= 200) {
            this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
          }

        }
      }, error => { }, () => { });

  }




  GoToDetails(item: any) {
    if (item.isLootPile) {
      this.router.navigate(['/ruleset/loot-pile-details', item.lootId]);
    } else {
      this.router.navigate(['/ruleset/loot-details', item.lootId]);
    }


  }

  //useItemTemplate(itemMaster: any) {

  //  let msg = "The command value for " + itemMaster.itemName
  //    + " Item Template has not been provided. Edit this record to input one.";

  //  if (itemMaster.ItemMasterCommand == undefined || itemMaster.ItemMasterCommand == null) {
  //    this.alertService.showDialog(msg, DialogType.alert, () => this.useItemTemplateHelper(itemMaster));
  //  }
  //  else if (itemMaster.ItemMasterCommand.length == 0) {
  //    this.alertService.showDialog(msg, DialogType.alert, () => this.useItemTemplateHelper(itemMaster));
  //  }
  //  else {
  //    //TODO  
  //    //this.useItemTemplateHelper(itemMaster);
  //  }
  //}

  //private useItemTemplateHelper(itemMaster: any) {
  //  this.isLoading = true;
  //  this.alertService.startLoadingMessage("", "TODO => Use Item Template");
  //  setTimeout(() => {
  //  this.isLoading = false;
  //    this.alertService.stopLoadingMessage();
  //  }, 200);
  //}

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


  Give(item) {
    this.bsModalRef = this.modalService.show(GiveawayComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.giveAwayItem = item;
  }

  GiveLootPile(item) {
    this.alertService.startLoadingMessage("Fetching LootPile Items");
    //api////
    let lootPileItems = [];
    this.itemMasterService.getLootPile<any>(item.lootId)
      .subscribe(data => {
        this.alertService.stopLoadingMessage();
        if (data) {
          lootPileItems = data.lootPileItems;
        }
      }, error => {
        this.alertService.stopLoadingMessage();
      }, () => {
        this.bsModalRef = this.modalService.show(GiveawayComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.giveAwayItem = item;
        this.bsModalRef.content.lootPileItems = lootPileItems;
        this.bsModalRef.content.isLootPile = true;
      });

  }

  Show(item) {

    let show = item.isShow ? 'Hide' : 'Show';

    this.lootService.showLoot<any>(item.lootId, !item.isShow)
      .subscribe(data => {        
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        item.isShow = !item.isShow;

        if (item.isShow) {//if item is show send message to everyone chat "New loot is availabe"
          this.appService.updateChatWithLootMessage(true);
        }
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + show, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  Visible(item) {

    let visible = item.isVisible ? 'Hide' : 'Show';

    this.lootService.showLootPile<any>(item.lootId, !item.isVisible)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        item.isVisible = !item.isVisible;
        if (item.isVisible) {//if item is show send message to everyone chat "New loot is availabe"
          this.appService.updateChatWithLootMessage(true);
        }
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + visible, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  refresh() {
    this.page = 1;
    this.pageSize = 28;
    this.initialize();
  }

  deleteItemTemplate(itemMaster: ItemMaster) {

    let message = "Are you sure you want to delete this " + itemMaster.itemName + " Loot?";
    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteLootItem(itemMaster), null, 'Yes', 'No');
  }

  deleteLootItem(itemMaster: any) {
    this.alertService.startLoadingMessage("", "Deleting Loot");

    //this.isLoading = true;
    this.lootService.deleteLootItem<any>(itemMaster)
      .subscribe(data => {
        setTimeout(() => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
        }, 200);
        this.alertService.showMessage("Loot has been deleted successfully.", "", MessageSeverity.success);
        this.ItemMasterList = this.ItemMasterList.filter((val) => val.lootId != itemMaster.lootId);
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

  deleteAll() {
    //console.log('delete All');
    this.bsModalRef = this.modalService.show(DeleteAllLootItemsComponent, {
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

  createPile() {
    this.bsModalRef = this.modalService.show(CreateLootPileComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Create Loot Pile';
    this.bsModalRef.content.button = 'CREATE';
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.lootPileVM = {
      ruleSetId: this.ruleSetId,
      ruleSet: this.RuleSet
    };
  }

  moveLoot() {
    this.bsModalRef = this.modalService.show(MoveLootComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
  }
}
