import { Component, OnInit } from '@angular/core';
import { Items } from '../../../core/models/view-models/items.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { LootService } from '../../../core/services/loot.service';
import { SharedService } from '../../../core/services/shared.service';
import { AppService1 } from '../../../app.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { DeleteLootSecondaryComponent } from './delete-loot-secondary/delete-loot-secondary.component';
import { ItemsService } from '../../../core/services/items.service';

@Component({
  selector: 'app-delete-all-loot-items',
  templateUrl: './delete-all-loot-items.component.html',
  styleUrls: ['./delete-all-loot-items.component.scss']
})
export class DeleteAllLootItemsComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  itemsList: any[] = [];
  itemsListLootPile: any[] = [];
  characterItemModal: any = new Items();
  searchText: string;
  //isloading: boolean = false;
  allSelected: boolean = false;
  multiLootIds = [];
  lootPileList: any[] = [];
  lootList: any;
  allPileSelected: boolean = false;

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private lootService: LootService,
    private appService: AppService1,
    private itemsService: ItemsService) { }

  ngOnInit() {
    setTimeout(() => {
      //console.log(this.bsModalRef.content.ruleSetId);
      this.rulesetId = this.bsModalRef.content.ruleSetId;
      this.lootList = this.bsModalRef.content.lootList ? this.bsModalRef.content.lootList : [];
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;

      this.itemsService.getLootPilesListByRuleSetId_Cache<any>(this.rulesetId)
        .subscribe(data => {
          this.lootPileList = data;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {
          this.lootService.getItemMasterLootsForDelete_Cache<any>(this.rulesetId)
            .subscribe(data => {
              let list = data;
              if (this.lootList.length<=0) {
                this.lootList = data;
              }
              this.itemsList = [];
              this.itemsListLootPile = [];

              this.lootList.map(x => {
                if (x.isLootPile) {
                  this.itemsListLootPile.push(x);
                } else {
                  this.itemsList.push(x);
                }
              });

              this.isLoading = false;
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => { })
        });
    }
  }

  setItemMaster(event: any, itemMaster: any) {
    this.itemsList.map((item) => {
      if (item.lootId == itemMaster.lootId) {
        item.selected = event.target.checked;
      }
      return item;
    });

    this.itemsListLootPile.map(x => {
      if (x.lootId == itemMaster.lootId) {
        x.selected = event.target.checked;
      }
    });
    this.lootList.map(x => {
      if (x.isLootPile) {
        if (x.lootId == itemMaster.lootId) {
          x.selected = event.target.checked;
        }
      } else {
        if (x.lootId == itemMaster.lootId) {
          x.selected = event.target.checked;
        }
      }
    });
  }

  submitForm() {
    this.multiLootIds = [];
    //this.itemsList.map((item) => {
    //  if (item.selected) {
    //    this.multiLootIds.push({ lootId: item.lootId, qty: item.quantity });
    //  }
    //});

    //this.itemsListLootPile.map(x => {
    //  if (x.selected) {
    //    this.multiLootIds.push({ lootId: x.lootId, qty: x.quantity });
    //  }
    //});

    this.lootList.map(x => {
      if (x.isLootPile) {
        if (x.selected) {
          this.multiLootIds.push({ lootId: x.lootId, qty: x.quantity });
        }
      } else {
        if (x.selected) {
          this.multiLootIds.push({ lootId: x.lootId, qty: x.quantity });
        }
      }
    });

    if (this.multiLootIds == undefined) {
      this.alertService.showMessage("Please select new Loot to Delete.", "", MessageSeverity.error);
    }
    else if (this.multiLootIds.length == 0) {
      this.alertService.showMessage("Please select new Loot to Delete.", "", MessageSeverity.error);
    }
    else {
      this.deleteAllLootItems();
    }

  }
  deleteAllLootItems() {
    this.isLoading = true;
    this.lootService.deleteAllLootItems<any>(this.multiLootIds)
      .subscribe(data => {
        this.alertService.showMessage("Deleting Loot Item", "", MessageSeverity.success);
        this.close();
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
  }

  selectDeselectFilters(selected, isLootPile=false) {
    if (isLootPile) {
    this.allPileSelected = selected;
      if (this.allPileSelected) {
        this.itemsListLootPile.map((item) => {
          item.selected = true;
        });
      }
      else {
        this.itemsListLootPile.map((item) => {
          item.selected = false;
        });
      }
    } else {
    this.allSelected = selected;
      if (this.allSelected) {
        this.itemsList.map((item) => {
          item.selected = true;
        });
      }
      else {
        this.itemsList.map((item) => {
          item.selected = false;
        });
      }
    }
  }
  close() {
    this.bsModalRef.hide();
  }

  SecondaryDelete(item) {
    this.close();
    this.bsModalRef = this.modalService.show(DeleteLootSecondaryComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.rulesetId;
    this.bsModalRef.content.Name = item.itemName;
    this.bsModalRef.content.Image = item.itemImage;
    this.bsModalRef.content.LootPileId = item.lootId;
    this.bsModalRef.content.lootList = this.lootList;
  }

  Refresh() {
    this.initialize();
  }

  quantityChanged(quantity, item) {
    this.itemsList.map((itm) => {
      if (itm.lootId == item.lootId) {
        itm.quantity = quantity >= 1 ? quantity : 1;
      }
    });
  }

}
