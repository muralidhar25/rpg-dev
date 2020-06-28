import { Component, OnInit } from '@angular/core';
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
import { VIEW, SYSTEM_GENERATED_MSG_TYPE, CHATACTIVESTATUS } from '../../../core/models/enums';
import { LootService } from '../../../core/services/loot.service';
import { AppService1 } from '../../../app.service';
import { ServiceUtil } from '../../../core/services/service-util';

@Component({
  selector: 'app-addloot',
  templateUrl: './addloot.component.html',
  styleUrls: ['./addloot.component.scss']
})
export class AddlootComponent implements OnInit {
  isLoading = false;
  title: string;
  _view: string;
  characterId: number;
  rulesetId: number;
  itemsList: any;
  lootTemplateList: any
  characterItems: any;
  characterItemModal: any = new Items();
  searchText: string;
  showLootTemplates: boolean = false;
  selectedLootTemplates: any[] = []
  lootPileList: any[] = [];
  selectedLootPileItem: any[];
  isVisible: boolean = false;
  selectedLootPileID = -1;

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
      this.characterItemModal = this.itemsService.itemModelData(_itemVM, this._view);
      this.characterId = this.characterItemModal.characterId;
      this.rulesetId = this.characterItemModal.rulesetId;
      this.characterItems = this.bsModalRef.content.characterItems;
      if (this.rulesetId == undefined)
        this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      let currencyTypesList = this.bsModalRef.content.currencyTypesList;
      try { currencyTypesList.forEach((x, i) => { x.lootId = 0; }); } catch (err) { }

      this.characterItemModal.itemMasterLootCurrency = currencyTypesList;

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
      this.itemsService.getLootPilesListByRuleSetId_Cache<any>(this.rulesetId)
        .subscribe(data => {
          this.lootPileList = data;
          this.selectedLootPileItem = [];
          this.selectedLootPileItem.push(this.lootPileList[0]);

          try {
            this.characterItemModal.itemMasterLootCurrency.forEach((x, i) => {
              x.selected = false; x.total = x.amount; x.amount = 0;
            });
          } catch (err) { }

        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {
          this.itemMasterService.getItemMasterByRuleset_add_Cache<any>(this.rulesetId, true, true)//true
            .subscribe(data => {
              this.itemsList = data.ItemMaster;
              this.lootTemplateList = data.LootTemplate

              this.itemsList.forEach(function (val) { val.showIcon = false; val.selected = false; val.quantity = 1; });
              this.lootTemplateList.forEach(function (val) { val.showIcon = false; val.selected = false; });
              this.isLoading = false;
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                this.authService.logout(true);
              }
            }, () => { });
        });
      ///////////////////////////////////////////////////////////

    }
  }
  setItemMaster(event: any, itemMaster: any) {
    //if (event.target.checked) {
    //    this.characterItemModal.multiItemMasters.push({ itemMasterId: itemMaster.itemMasterId });
    //}
    //else {
    //    this.characterItemModal.multiItemMasters
    //        .splice(this.characterItemModal.multiItemMasters.indexOf({ itemMasterId: itemMaster.itemMasterId }), 1);
    //}

    this.itemsList.map((item) => {
      if (item.itemMasterId == itemMaster.itemMasterId && item.isBundle == itemMaster.isBundle) {
        item.selected = event.target.checked;
      }
      return item;
    });
    this.lootTemplateList.map((item) => {
      if (item.lootTemplateId == itemMaster.lootTemplateId) {
        item.selected = event.target.checked;
      }
    });
    this.characterItemModal.itemMasterId = itemMaster.itemMasterId;
  }

  submitForm(itemMaster: any) {
    ////////////////////////////////////////////////////////////////////////
    this.selectedLootTemplates = [];

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
    this.itemsList.map((item) => {
      if (item.selected) {
        //if (item.isBundle) {
        //  this.characterItemModal.multiItemMasterBundles.push({ itemMasterBundleId: item.itemMasterId });
        //}
        //else {
        this.characterItemModal.multiItemMasters.push({ iD: item.itemMasterId, isBundle: item.isBundle, qty: item.quantity });
        //}
      }
      return item;
    })
    if (_itemMasterLootCurrency.length == 0 && ((this.characterItemModal.multiItemMasters == undefined && this.characterItemModal.multiItemMasterBundles.length == 0) && (this.selectedLootTemplates == undefined || this.selectedLootTemplates.length == 0))) {
      this.alertService.showMessage("Please select new Item Template or Random Loot or currency to Add.", "", MessageSeverity.error);
    }
    else if (_itemMasterLootCurrency.length == 0 && (this.characterItemModal.multiItemMasters.length == 0 && this.characterItemModal.multiItemMasterBundles.length == 0) && (this.selectedLootTemplates.length == 0)) {
      this.alertService.showMessage("Please select new Item Template or Random Loot or currency to Add.", "", MessageSeverity.error);
    }
    else if (this.characterItemModal.multiItemMasters && this.characterItemModal.multiItemMasters.length != 0 && (this.selectedLootPileItem == undefined || this.selectedLootPileItem.length == 0)) {
      this.alertService.showMessage("Please select Drop to Loot Pile for selected Item Templates.", "", MessageSeverity.error);
    }
    else {
      if (this.characterItemModal.view === VIEW.DUPLICATE) {
        //this.duplicateAbility(ability);
      }
      else {
        //this.selectedLootPileID = -1;
        if (this.selectedLootPileItem && this.selectedLootPileItem.length) {
          this.selectedLootPileID = this.selectedLootPileItem[0].lootId
        }
        this.addEditItem(itemMaster, this.selectedLootTemplates, this.selectedLootPileID);
      }
    }
  }

  addEditItem(modal: any, lootTemplate, selectedLootPileId: number) {
    //console.log('modal data', modal.multiItemMasters);
    this.isLoading = true;
    this.itemMasterService.getLootItemCount(this.rulesetId)
      .subscribe((data: any) => {
        //this.alertService.stopLoadingMessage();
        let LootCount = data.lootCount;
        let selecteLootItems = 0;
        if (modal.multiItemMasters && modal.multiItemMasters.length) {
          selecteLootItems = modal.multiItemMasters.length;
        }
        if ((LootCount + selecteLootItems) < 200) {

          if (selectedLootPileId > 0)
            modal.itemMasterLootCurrency = modal.itemMasterLootCurrency.filter(x => x.selected === true);

          this.lootService.addLootItem(modal.multiItemMasters, lootTemplate, this.rulesetId, selectedLootPileId, this.isVisible, [], modal.itemMasterLootCurrency)
            .subscribe(
              data => {
                //console.log(data);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();                
                let message = "Loot(s) added successfully.";
                if (data == "-1") message = "Currency Loot Pile created successfully.";
                this.alertService.showMessage(message, "", MessageSeverity.success);
                this.bsModalRef.hide();
                this.sharedService.updateItemsList(true);
                //this.appService.updateChatWithLootMessage(true);
                if (selectedLootPileId == -1) {
                  if (this.isVisible) {
                    if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
                      let ChatWithDiceRoll = [];
                      if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
                        ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
                      }
                      let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_LOOT_MESSAGE, obj: true }
                      ChatWithDiceRoll.push(chatMsgObject);
                      this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
                    } else {
                      this.appService.updateChatWithLootMessage(true);
                    }
                  }
                }

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

  duplicateItem(modal: any) {
    this.isLoading = true;
    this.itemsService.duplicateItem(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Loot has been duplicated successfully.", "", MessageSeverity.success);
          this.bsModalRef.hide();
          this.sharedService.updateItemsList(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to Duplicate ", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

        });
  }
  close() {
    this.bsModalRef.hide();
  }

  ShowLootItems() {
    this.showLootTemplates = !this.showLootTemplates;
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

  changeVisibility(event) {
    this.isVisible = event.target.checked;
  }

  AddToLootPile(event) {
    
    let _selectedLootPile = event ? event.length > 0 ? event[0] : null : null;
    if (_selectedLootPile) {
      if (_selectedLootPile.lootId == -1 || !_selectedLootPile.itemMasterLootCurrency) {
        _selectedLootPile.currencyTypesList.forEach((x, i) => {
          let _bindedCC = this.characterItemModal.itemMasterLootCurrency.find(item => item.currencyTypeId === x.currencyTypeId);
          x.selected = _bindedCC.selected ? _bindedCC.selected : false; x.lootId = 0;
          x.amount = _bindedCC.amount ? _bindedCC.amount : 0;
        });
        this.characterItemModal.itemMasterLootCurrency = _selectedLootPile.currencyTypesList;
      }
      else {
        _selectedLootPile.itemMasterLootCurrency.forEach((x, i) => {
          let _bindedCC = this.characterItemModal.itemMasterLootCurrency.find(item => item.currencyTypeId === x.currencyTypeId);
          x.selected = _bindedCC.selected ? _bindedCC.selected : false; x.lootId = 0;
          x.amount = _bindedCC.amount ? _bindedCC.amount : 0;
        });
        this.characterItemModal.itemMasterLootCurrency = _selectedLootPile.itemMasterLootCurrency;
      }
    }

    if (this.selectedLootPileItem && this.selectedLootPileItem.length) {
      this.selectedLootPileID = this.selectedLootPileItem[0].lootId
    }
    if (this.selectedLootPileID != -1) {
      this.isVisible = false;
    }
  }

  quantityChanged(quantity, item) {
    //this.selectedItemsList.map((itm) => {
    //  if (itm.itemMasterId == item.itemMasterId) {
    //    itm.qty = quantity >= 1 ? quantity : 1;
    //  }
    //});
    this.itemsList.map((itm) => {
      if (itm.itemMasterId == item.itemMasterId) {
        itm.quantity = quantity >= 1 ? quantity : 1;
      }
    });
  }

  currencyEnable(evt, currency) {
    currency.selected = evt.checked;
  }
}
