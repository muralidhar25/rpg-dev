import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { LootService } from '../../../core/services/loot.service';
import { SharedService } from '../../../core/services/shared.service';
import { AppService1 } from '../../../app.service';
import { ItemsService } from '../../../core/services/items.service';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { PlayerLootComponent } from '../player-loot.component';
import { User } from '../../../core/models/user.model';
import { Items } from '../../../core/models/view-models/items.model';
import { ItemMasterService } from '../../../core/services/item-master.service';

@Component({
  selector: 'app-player-loot-secondary',
  templateUrl: './player-loot-secondary.component.html',
  styleUrls: ['./player-loot-secondary.component.scss']
})
export class PlayerLootSecondaryComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  itemsList: any[] = [];
  searchText: string;
  allSelected: boolean = false;
  multiLootIds = [];
  lootPileId: number;
  selectedLootPileItem: any[];
  lootPileList: any[] = [];
  characterItemModal: any = new Items();
  headers: any[] = [];

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private lootService: LootService,
    private sharedService: SharedService,
    private appService: AppService1,
    private itemsService: ItemsService,
    private itemMasterService: ItemMasterService) { }

  ngOnInit() {
    setTimeout(() => {
      debugger
      this.rulesetId = this.bsModalRef.content.ruleSetId;
      this.lootPileId = this.bsModalRef.content.LootPileId;
      this.headers = this.bsModalRef.content.headers;
      this.characterId = this.bsModalRef.content.headers.headerId;
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.lootService.getItemsFromLootPile<any>(this.lootPileId)
        .subscribe(data => {
          debugger
          this.itemsList = data;
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

  setItemMaster(event: any, itemMaster: any) {
    this.itemsList.map((item) => {
      if (item.lootId == itemMaster.lootId) {
        item.selected = event.target.checked;
      }
      return item;
    })
  }

  submitForm(itemMaster: any) {
    this.characterItemModal.multiLootIds = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.characterItemModal.multiLootIds.push({ lootId: item.lootId, name: item.itemName });
      }
      return item;

    })
    if (this.characterItemModal.multiLootIds == undefined) {
      this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
    }
    else if (this.characterItemModal.multiLootIds == 0) {
      this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
    }
    else {
      this.addEditItem(itemMaster);
    }

  }
  addEditItem(model) {
    model.characterId = this.characterId;
    model.itemMasterId = null;
    this.isLoading = true;
    this.itemMasterService.getCharacterItemCount(this.rulesetId, this.characterId)
      .subscribe((data: any) => {
        let ItemCount = data.itemCount;
        let selectedItemCount = 0;
        if (model.multiLootIds && model.multiLootIds.length) {
          selectedItemCount = model.multiLootIds.length;
        }
        if ((ItemCount + selectedItemCount) < 200) {

    this.lootService.lootItemsTakeByplayer<any>(model)
      .subscribe(data => {
        if (data) {
          if (data.message) {
            this.alertService.showMessage(data.message, "", MessageSeverity.error);
          } else {
            this.alertService.showMessage("Adding Loot Item", "", MessageSeverity.success);
          }
          this.close();
          this.appService.updateItemsList(true);
        }
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
        else {
          this.isLoading = false;
          this.alertService.showMessage("The maximum number of Items has been reached, 200. Please delete some Items and try again.", "", MessageSeverity.error);
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

  Loot() {
    this.close();
    this.bsModalRef = this.modalService.show(PlayerLootComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.headers = this.headers;
    //this.bsModalRef.content.ruleSetId = this.rulesetId;
  }

  refresh() {
    this.initialize();
  }

}
