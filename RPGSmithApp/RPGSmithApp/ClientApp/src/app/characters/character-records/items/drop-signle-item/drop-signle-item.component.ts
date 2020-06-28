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
import { ServiceUtil } from '../../../../core/services/service-util';

@Component({
  selector: 'app-drop-signle-item',
  templateUrl: './drop-signle-item.component.html',
  styleUrls: ['./drop-signle-item.component.scss']
})
export class DropSingleItemComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  selectedItems = [];
  selectedLootPileItem: any[];
  lootPileList: any[] = [];
  item: any;
  itemQty: number;
  originalQty: number;
  isMouseDown: boolean = false;
  interval: any;

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
      //this.itemName = this.bsModalRef.content.itemName;
      //this.itemImage = this.bsModalRef.content.itemImage;
      this.item = this.bsModalRef.content.item;
      if (this.item) {
        this.originalQty = ServiceUtil.DeepCopy(this.item.quantity);
        this.itemQty = this.item.quantity;
      }

      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.itemsService.getLootPilesListByCharacterId<any>(this.characterId, this.rulesetId)
        .subscribe(data => {
          this.lootPileList = data;
          this.selectedLootPileItem = [];
          this.selectedLootPileItem.push(this.lootPileList[0]);
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });
    }
  }


  submitForm() {
    this.selectedItems = [];
    this.selectedItems.push({ itemId: this.item.itemId, quantity: this.itemQty, qty: this.originalQty });

    if (this.selectedLootPileItem == undefined || this.selectedLootPileItem.length == 0) {
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

          let model = {
            Items: this.selectedItems,
            CharacterCurrency: [] //no currency here - may be in future
          }

          this.itemsService.dropMultipleItemsWithCurrency<any>(model, lootId, this.rulesetId, this.characterId)
            .subscribe(data => {
              this.alertService.showMessage("Dropping Item", "", MessageSeverity.success);
              this.close();
              this.appService.updateItemsList(true);
              this.isLoading = false;
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => { });
        } else {
          this.isLoading = false;
          this.alertService.showMessage("The maximum number of Loot Items has been reached, 200. Please delete some loot items before attempting to drop items again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
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
      classes: "myclass custom-class t-center",
      showCheckbox: false,
      position: "top"
    };
  }

  quantityChanged(item, qty) {
    if (qty) {
      this.itemQty = item.quantity >= qty ? qty : item.quantity;
    } else {
      this.itemQty = item.quantity;
    }

  }

  increaseQty(item) {
    let step: number = 1;
    this.itemQty += step;
    if (this.itemQty > item.quantity) {
      this.itemQty = item.quantity;
    }
  }

  decreaseQty(item) {
    let step: number = 1;
    if (this.itemQty>1) {
      this.itemQty -= step;
    }
  }

  mouseDownChangeQty(type, item) {
    let time = new Date();
    time.setMilliseconds(time.getMilliseconds() + 600); //600 miliseconds delay to start the numbering
    this.isMouseDown = true;
    this.interval = setInterval(() => {
      if (time < new Date()) {
        if (this.isMouseDown) {
          if (type === -1)//Decrement
          {
            this.decreaseQty(item);
          }
          if (type === 1)//Increment
          {
            this.increaseQty(item);
          }
        }
      }
    }, 50);
  }
  mouseUpChangeQty() {
    this.isMouseDown = false;
    clearInterval(this.interval);
    this.interval = undefined;
  }

}
