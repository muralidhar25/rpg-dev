import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Items } from '../../../../core/models/view-models/items.model';
import { AlertService, MessageSeverity } from '../../../../core/common/alert.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { LootService } from '../../../../core/services/loot.service';
import { SharedService } from '../../../../core/services/shared.service';
import { AppService1 } from '../../../../app.service';
import { User } from '../../../../core/models/user.model';
import { DBkeys } from '../../../../core/common/db-keys';
import { Utilities } from '../../../../core/common/utilities';
import { MoveLootComponent } from '../move-loot.component';
import { ItemsService } from '../../../../core/services/items.service';

@Component({
  selector: 'app-move-loot-secondary',
  templateUrl: './move-loot-secondary.component.html',
  styleUrls: ['./move-loot-secondary.component.scss']
})
export class MoveLootSecondaryComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  itemsList: any[] = [];
  characterItemModal: any = new Items();
  searchText: string;
  allSelected: boolean = false;
  multiLootIds = [];
  Name: string;
  Image: string;
  lootPileId: number;
  selectedLootPileItem: any[];
  lootPileList: any[] = [];

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private lootService: LootService,
    private sharedService: SharedService,
    private appService: AppService1,
    private itemsService: ItemsService) { }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.ruleSetId;
      this.Name = this.bsModalRef.content.Name;
      this.Image = this.bsModalRef.content.Image;
      this.lootPileId = this.bsModalRef.content.LootPileId;
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;

      this.itemsService.getLootPilesListByRuleSetId<any>(this.rulesetId)
        .subscribe(data => {
          this.lootPileList = data;
          debugger
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
    })
  }

  submitForm() {
    this.multiLootIds = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.multiLootIds.push({ lootId: item.lootId });
      }
      return item;

    })
    if (this.multiLootIds == undefined) {
      this.alertService.showMessage("Please select new Loot to Move.", "", MessageSeverity.error);
    }
    else if (this.multiLootIds.length == 0) {
      this.alertService.showMessage("Please select new Loot to Move.", "", MessageSeverity.error);
    }
    else if (this.selectedLootPileItem == undefined || this.selectedLootPileItem.length == 0) {
      this.alertService.showMessage("Please select Drop to Loot Pile", "", MessageSeverity.error);
    }
    else {
      this.MoveLootItems();
    }

  }
  MoveLootItems() {
    let lootId: number;
    if (this.selectedLootPileItem) {
      this.selectedLootPileItem.map(x => { lootId = x.lootId });
    }
    this.isLoading = true;
    this.lootService.moveLoot<any>(this.multiLootIds, lootId)
      .subscribe(data => {
        this.alertService.showMessage("Moving Loot Item", "", MessageSeverity.success);
        this.close();
        this.appService.updateItemsList(true);
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => {
        this.MoveLoot();
      });
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

  MoveLoot() {
    this.close();
    this.bsModalRef = this.modalService.show(MoveLootComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.rulesetId;
  }

  Refresh() {
    this.initialize();
  }

}
