import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../../core/common/alert.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { AppService1 } from '../../../../app.service';
import { User } from '../../../../core/models/user.model';
import { DBkeys } from '../../../../core/common/db-keys';
import { Utilities } from '../../../../core/common/utilities';
import { ItemsService } from '../../../../core/services/items.service';
import { ItemMasterService } from '../../../../core/services/item-master.service';

@Component({
  selector: 'app-drop-items',
  templateUrl: './drop-items.component.html',
  styleUrls: ['./drop-items.component.scss']
})
export class DropItemsComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  itemsList: any[] = [];
  searchText: string;
  allSelected: boolean = false;
  selectedItems = [];
  selectedLootPileItem: any[];
  page: number = 1;
  pageSize: number = 9999;
  lootPileList: any[] = [];
  characterCurrency = [];

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private appService: AppService1,
    private itemsService: ItemsService,
    private itemMasterService: ItemMasterService) { }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.ruleSetId;
      this.characterId = this.bsModalRef.content.characterId;
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.itemsService.getLootPilesListByCharacterId_Cache<any>(this.characterId, this.rulesetId)
        .subscribe(data => {
          this.lootPileList = data;
          this.selectedLootPileItem = [];
          this.selectedLootPileItem.push(this.lootPileList[0]);
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {
          this.itemsService.getItemsByCharacterId_sp_Cache<any>(this.characterId, this.rulesetId, this.page, this.pageSize, 3) // 3 for Alphabetical Sort
            .subscribe(data => {
              this.itemsList = data.ItemsList;

              this.itemsList.forEach(x => {
                x.qty = x.quantity;
              });

              this.characterCurrency = data.CurrencyList;
              try {
                this.characterCurrency.forEach((x, i) => {
                  x.selected = false;
                  x.total = x.amount;
                  x.amount = x.amount ? x.amount : 0;
                });
              } catch (err) { }

              this.isLoading = false;
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                this.authService.logout(true);
              }
            }, () => { })
        });
    }
  }

  setItemMaster(event: any, itemMaster: any) {
    this.itemsList.map((item) => {
      if (item.itemId == itemMaster.itemId) {
        item.selected = event.target.checked;
      }
      return item;
    })
  }

  currencyEnable(evt, currency) {
    currency.selected = evt.checked;
  }

  updateQuantity(currency) {
    currency.selected = true;
    currency.amount = currency.total >= currency.amount ? currency.amount : currency.total;
  }

  submitForm() {
    console.log('selectedLottPileItem', this.selectedLootPileItem);
    this.selectedItems = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.selectedItems.push({ itemId: item.itemId, quantity: item.quantity, qty: item.qty });
      }
      return item;

    });
    let isCurrencySelected = false;
    if (this.characterCurrency) {
      this.characterCurrency.map(c => {
        if (c.selected && c.amount) {
          isCurrencySelected = true;
        }
      });
    }
    if (this.selectedItems == undefined && !isCurrencySelected) {
      this.alertService.showMessage("Please select Item(s) or Currency to Drop.", "", MessageSeverity.error);
    }
    else if (this.selectedItems.length == 0 && !isCurrencySelected) {
      this.alertService.showMessage("Please select Item(s) or Currency to Drop.", "", MessageSeverity.error);
    }
    else if (this.selectedLootPileItem == undefined || this.selectedLootPileItem.length == 0) {
      this.alertService.showMessage("Please select Drop to Loot Pile", "", MessageSeverity.error);
    }
    else {
      this.DropSelectedItems();
    }

  }

  DropSelectedItems() {
    this.isLoading = true;
    let lootId: number = -1;
    if (this.selectedLootPileItem) {
      this.selectedLootPileItem.map(x => { lootId = x.lootId });
    }

    let selecetedItemCount = this.selectedItems.length;

    this.itemMasterService.getLootItemCount(this.rulesetId)
      .subscribe((data: any) => {
        let LootCount = data.lootCount;
        if (((LootCount + selecetedItemCount) < 200) || lootId != -1) {

          this.characterCurrency = this.characterCurrency.filter(x => x.selected === true);

          let model = {
            Items: this.selectedItems,
            CharacterCurrency: this.characterCurrency
          }

          this.alertService.showMessage("Dropping Item(s)", "", MessageSeverity.wait);
          this.itemsService.dropMultipleItemsWithCurrency<any>(model, lootId, this.rulesetId, this.characterId)
            .subscribe(data => {
              this.close();
              this.alertService.showMessage("Item(s) Dropped", "", MessageSeverity.success);
              this.appService.updateItemsList(true);
              this.isLoading = false;
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                this.authService.logout(true);
              }
            }, () => { });
        } else {
          this.isLoading = false;
          this.alertService.showMessage("The maximum number of Loot Items has been reached, 200. Please delete some loot items before attempting to drop items again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });


  }

  selectDeselectFilters(selected) {
    this.allSelected = selected;
    if (this.allSelected) {
      this.itemsList.map((item) => {
        item.selected = true;
      })
    }
    else {
      this.itemsList.map((item) => {
        item.selected = false;
      })
    }
  }
  close() {
    this.bsModalRef.hide();
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
      enableSearchFilter: false,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "top"
    };
  }

  quantityChangedOld(quantity, item) {
    this.itemsList.map((itm) => {
      if (itm.lootId == item.lootId) {
        itm.quantity = quantity >= 1 ? quantity : 1;
      }
    });
  }

  quantityChanged(item) {
    item.quantity = item.qty >= item.quantity ? item.quantity : item.qty;
  }

}
