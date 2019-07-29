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
import { MoveLootSecondaryComponent } from './move-loot-secondary/move-loot-secondary.component';

@Component({
  selector: 'app-move-loot',
  templateUrl: './move-loot.component.html',
  styleUrls: ['./move-loot.component.scss']
})
export class MoveLootComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  itemsList: any[]=[];
  characterItemModal: any = new Items();
  searchText: string;
  allSelected: boolean = false;
  multiLootIds = [];
  selectedLootItem: any[]=[];

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private lootService: LootService,
    private sharedService: SharedService,
    private appService: AppService1
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.ruleSetId;
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;

      this.lootService.getItemMasterLootsForDelete<any>(this.rulesetId)
        .subscribe(data => {
          this.itemsList = data;
          debugger;
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { })
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
    this.multiLootIds = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.multiLootIds.push({ lootId: item.lootId });
      }
      return item;

    })
    if (this.multiLootIds == undefined) {
      this.alertService.showMessage("Please select new Loot to Delete.", "", MessageSeverity.error);
    }
    else if (this.multiLootIds.length == 0) {
      this.alertService.showMessage("Please select new Loot to Delete.", "", MessageSeverity.error);
    }
    else {
      this.deleteAllLootItems(itemMaster);
    }

  }
  deleteAllLootItems(itemMaster) {
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
          this.authService.logout(true);
        }
      }, () => { });
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
      text: "Search item(s)",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "bottom"
    };
  }

  SecondaryLoot(item) {
    this.close();
    this.bsModalRef = this.modalService.show(MoveLootSecondaryComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.rulesetId;
    this.bsModalRef.content.Name = item.itemName;
    this.bsModalRef.content.Image = item.itemImage;
  }

  Refresh() {
    this.initialize();
  }

}