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

@Component({
  selector: 'app-delete-all-loot-items',
  templateUrl: './delete-all-loot-items.component.html',
  styleUrls: ['./delete-all-loot-items.component.scss']
})
export class DeleteAllLootItemsComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  itemsList: any;
  characterItemModal: any = new Items();
  searchText: string;
  //isloading: boolean = false;
  allSelected: boolean = false;
  multiLootIds = [];
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
      console.log(this.bsModalRef.content.ruleSetId);
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
          console.log(data);
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
        this.multiLootIds.push({ lootId: item.lootId});
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
    console.log(itemMaster);
    this.isLoading = true;
    console.log(this.multiLootIds);
    this.lootService.deleteAllLootItems<any>(this.multiLootIds)
      .subscribe(data => {
             // console.log('data',data);
             //if (data) {
             //       if (data.message) {
             //         this.alertService.showMessage(data.message, "", MessageSeverity.error);
             //       } else {
                
             //       }
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
}
