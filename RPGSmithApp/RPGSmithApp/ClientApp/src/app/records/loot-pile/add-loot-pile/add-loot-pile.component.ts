import { Component, OnInit} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { Items } from '../../../core/models/view-models/items.model';
import { SharedService } from '../../../core/services/shared.service';
import { ItemsService } from '../../../core/services/items.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { VIEW } from '../../../core/models/enums';
import { LootService } from '../../../core/services/loot.service';
import { AppService1 } from '../../../app.service';
import { ServiceUtil } from '../../../core/services/service-util';

@Component({
  selector: 'app-add-loot-pile',
  templateUrl: './add-loot-pile.component.html',
  styleUrls: ['./add-loot-pile.component.scss']
})
export class AddLootPileComponent implements OnInit {
  isLoading = false;
  title: string;
  _view: string;
  characterId: number;
  rulesetId: number;
  itemsTemplateList: any;
  lootTemplateList: any
  LootList: any;
  characterItems: any;
  characterItemModal: any = new Items();
  searchText: string;
  showLootTemplates: boolean = false;
  showLootItemTemplates: boolean = false;
  showLoot: boolean = true;
  selectedLootTemplates: any[] = []
  lootPileList: any[] = [];
  selectedLootPileItem: any[];
  isVisible: boolean = false;
  selectedLootPileID: number;
  noRecordFound: boolean = false;
  LootPileItem: any;
  selectedLootItemsList: any[] = []
  itemMasterLootCurrency = [];

  constructor(private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService,
    private itemsService: ItemsService, private itemMasterService: ItemMasterService,
    private appService: AppService1, private lootService: LootService) {

  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;
      this._view = this.bsModalRef.content.button;
      let _itemVM = this.bsModalRef.content.itemVM;
      this.LootPileItem = this.bsModalRef.content.LootPileDetail;
      this.characterItemModal = this.itemsService.itemModelData(_itemVM, this._view);
      this.characterId = this.characterItemModal.characterId;
      this.rulesetId = this.characterItemModal.rulesetId;
      this.characterItems = this.bsModalRef.content.characterItems;
      if (this.rulesetId == undefined)
        this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      let currencyTypesList = this.bsModalRef.content.currencyTypesList;
      try { currencyTypesList.forEach((x, i) => { x.lootId = 0; }); } catch (err) { }

      this.itemMasterLootCurrency = this.bsModalRef.content.itemMasterLootCurrency ? this.bsModalRef.content.itemMasterLootCurrency : [];

      this.itemMasterLootCurrency = this.itemMasterLootCurrency ?
        (this.itemMasterLootCurrency.length > 0 ? this.itemMasterLootCurrency : currencyTypesList)
        : currencyTypesList;

      try {
        this.itemMasterLootCurrency.forEach((x, i) => {
          x.selected = false; x.total = x.amount; x.amount = 0;
        });
      } catch (err) { }

      this.characterItemModal.itemMasterLootCurrency = this.itemMasterLootCurrency;

      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      ////////////////////////////////////////////////////////
      this.lootService.getLootItemsById<any>(this.rulesetId, 1, 9999)
        .subscribe(data => {
          
          this.LootList = Utilities.responseData(data.ItemMaster, 9999);
          this.LootList.forEach(function (val) { val.showIcon = false; });
          this.LootList = this.LootList.filter(x => !x.isLootPile);
          try {
            this.noRecordFound = !data.ItemMaster.length;
          } catch (err) { }
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {
          this.itemsService.getLootPilesListByRuleSetId<any>(this.rulesetId)
            .subscribe(data => {
              this.lootPileList = data;
              this.selectedLootPileItem = [];
              this.lootPileList.map(x => {
                if (x.lootId == this.LootPileItem.lootId) {
              this.selectedLootPileItem.push(x);
                }
              });
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => {
              this.itemMasterService.getItemMasterByRuleset_add<any>(this.rulesetId, true, true)//true
                .subscribe(data => {
                  this.itemsTemplateList = data.ItemMaster;
                  this.lootTemplateList = data.LootTemplate

                  this.itemsTemplateList.forEach(function (val) { val.showIcon = false; val.selected = false; val.qty=1 });
                  this.lootTemplateList.forEach(function (val) { val.showIcon = false; val.selected = false; });
                  this.isLoading = false;
                }, error => {
                  this.isLoading = false;
                  let Errors = Utilities.ErrorDetail("", error);
                  if (Errors.sessionExpire) {
                    this.authService.logout(true);
                  }
                }, () => { });
            });
        });      
      ///////////////////////////////////////////////////////////

    }
  }

  currencyEnable(evt, currency) {
    currency.selected = evt.checked;
  }

  updateQuantity(currency) {
    currency.selected = true;
    currency.amount = currency.total >= currency.amount ? currency.amount : currency.total;
  }

  setItemMaster(event: any, itemMaster: any) {
    if (this.LootList) {
      this.LootList.map(item => {
        if (item.lootId == itemMaster.lootId) {
          item.selected = event.target.checked;
        }
      });
    }
    if (this.itemsTemplateList) {
      this.itemsTemplateList.map((item) => {
        if (item.itemMasterId == itemMaster.itemMasterId && item.isBundle == itemMaster.isBundle) {
          item.selected = event.target.checked;
        }
        return item;
      });
    }
    if (this.lootTemplateList) {
      this.lootTemplateList.map((item) => {
        if (item.lootTemplateId == itemMaster.lootTemplateId) {
          item.selected = event.target.checked;
        }
      });
    }

    //this.characterItemModal.itemMasterId = itemMaster.itemMasterId;
  }

  submitForm(itemMaster: any) {
    
    ////////////////////////////////////////////////////////////////////////
    this.selectedLootTemplates = [];
    this.selectedLootItemsList = [];
    let SelectedLootItem = this.LootList.filter(x => x.selected == true);
    SelectedLootItem.map(x => {
      this.selectedLootItemsList.push({ lootId: x.lootId, qty:x.quantity });
    });    

    let SelectedLootTemp = this.lootTemplateList.filter(x => x.selected == true);

    SelectedLootTemp.map((x) => {
      x.quantity = 1;

      var reItems = [];
      if (+x.quantity) {
        for (var i = 0; i < x.quantity; i++) {
          let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(x.lootTemplateRandomizationEngines);
          let currentItemsToDeploy = ServiceUtil.getItemsFromRandomizationEngine_WithMultipleSeletion(r_engine, this.alertService);
          if (currentItemsToDeploy && currentItemsToDeploy.length) {
            currentItemsToDeploy.map((re) => {
              re.deployCount = i + 1;
              reItems.push(re);
            });
          }
        }
      }
      this.selectedLootTemplates.push({
        qty: x.quantity,
        lootTemplateId: x.lootTemplateId,
        rulesetId: x.ruleSetId,
        reitems: reItems
      });


    });
    //////////////////////////////////////////////////////////////////////////

    let _itemMasterLootCurrency = ServiceUtil.DeepCopy(this.characterItemModal.itemMasterLootCurrency.filter(x => x.selected === true));

    this.characterItemModal.multiItemMasterBundles = [];
    this.characterItemModal.multiItemMasters = [];
    this.itemsTemplateList.map((item) => {
      if (item.selected) {
        this.characterItemModal.multiItemMasters.push({ iD: item.itemMasterId, isBundle: item.isBundle, qty: item.qty });
      }
      return item;
    })
    if (_itemMasterLootCurrency.length == 0 && ((this.characterItemModal.multiItemMasters == undefined && this.characterItemModal.multiItemMasterBundles.length == 0) && (this.selectedLootTemplates == undefined || this.selectedLootTemplates.length == 0) && (this.selectedLootItemsList == undefined || this.selectedLootItemsList.length == 0))) {
      this.alertService.showMessage("Please select new Item Template or Random Loot or Currency to Add.", "", MessageSeverity.error);
    }
    else if (_itemMasterLootCurrency.length == 0 && (this.characterItemModal.multiItemMasters.length == 0 && this.characterItemModal.multiItemMasterBundles.length == 0) && (this.selectedLootTemplates.length == 0) && (this.selectedLootItemsList.length == 0)) {
      this.alertService.showMessage("Please select new Item Template or Random Loot or Currency to Add.", "", MessageSeverity.error);
    }
    //else if (this.characterItemModal.multiItemMasters && this.characterItemModal.multiItemMasters.length != 0 && (this.selectedLootPileItem == undefined || this.selectedLootPileItem.length == 0)) {
    //  this.alertService.showMessage("Please select Drop to Loot Pile for selected Item Templates.", "", MessageSeverity.error);
    //}
    else {
      if (this.characterItemModal.view === VIEW.DUPLICATE) {
        //this.duplicateAbility(ability);
      }
      else {
        //this.selectedLootPileID = -1;
        if (this.selectedLootPileItem && this.selectedLootPileItem.length) {
          this.selectedLootPileID = this.selectedLootPileItem[0].lootId
        }
        this.addEditItem(itemMaster, this.selectedLootTemplates, this.selectedLootPileID, this.selectedLootItemsList);
      }
    }
  }

  addEditItem(modal: any, lootTemplate, selectedLootPileId: number, selectedLootItems) {

    this.isLoading = true;
    this.itemMasterService.getLootItemCount(this.rulesetId)
      .subscribe((data: any) => {
        let LootCount = data.lootCount;
        let selecteLootItems = 0;
        if (modal.multiItemMasters && modal.multiItemMasters.length) {
          selecteLootItems = modal.multiItemMasters.length;
        }
        if ((LootCount + selecteLootItems) < 200) {

          modal.itemMasterLootCurrency = modal.itemMasterLootCurrency.filter(x => x.selected === true);
          
          this.lootService.addLootItem(modal.multiItemMasters, lootTemplate, this.rulesetId, selectedLootPileId, this.isVisible, selectedLootItems, modal.itemMasterLootCurrency)
            .subscribe(
              data => {
                //console.log(data);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let message = "Currency / Loot(s) added successfully.";
                this.alertService.showMessage(message, "", MessageSeverity.success);
                this.bsModalRef.hide();
                this.sharedService.updateItemsList(true);
                this.sharedService.updateItemMasterDetailList(true);
                //this.appService.updateChatWithLootMessage(true);
                //if (selectedLootPileId == -1) {
                //  if (this.isVisible) {
                //    this.appService.updateChatWithLootMessage(true);
                //  }
                //}

              },
              error => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Unable to Add", error);
                if (Errors.sessionExpire) {
                  this.authService.logout(true);
                }
                else
                  this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
              },
            );
        }
        else {
          this.isLoading = false;
          this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

  close() {
    this.bsModalRef.hide();
  }

  ShowLoot() {
    this.showLoot = true;
    this.showLootTemplates = false;
    this.showLootItemTemplates = false;
  }

  ShowLootItemTemplates() {
    this.showLootItemTemplates = true;
    this.showLoot = false;
    this.showLootTemplates = false;
  }

  ShowLootItems() {
    this.showLootTemplates = true;
    this.showLoot = false;
    this.showLootItemTemplates = false;
  }
  get lootItemsSettings() {
    return {
      primaryKey: "lootId",
      labelKey: "itemName",
      text: "Search Loot Pile",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "top"
    };
  }

  //changeVisibility(event) {
  //  this.isVisible = event.target.checked;
  //}

  AddToLootPile(event) {
    if (this.selectedLootPileItem && this.selectedLootPileItem.length) {
      this.selectedLootPileID = this.selectedLootPileItem[0].lootId
    }
    if (this.selectedLootPileID != -1) {
      this.isVisible = false;
    }
  }

  quantityChanged(quantity, item) {
    this.itemsTemplateList.map((itm) => {
      if (itm.itemMasterId == item.itemMasterId) {
        itm.qty = quantity >= 1 ? quantity : 1;
      }
    });
  }

}
