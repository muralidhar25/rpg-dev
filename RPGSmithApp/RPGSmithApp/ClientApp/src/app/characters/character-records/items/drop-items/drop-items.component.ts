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
  selectedLootPileItem: any;
  page: number = 1;
  pageSize: number = 99999;

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private appService: AppService1,
    private itemsService: ItemsService) { }

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
      debugger
      this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, 3) // 3 for Alphabetical Sort
        .subscribe(data => {
          this.itemsList = data.ItemsList;
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
      if (item.itemId == itemMaster.itemId) {
        item.selected = event.target.checked;
      }
      return item;
    })
  }

  submitForm() {
    console.log('selectedLottPileItem', this.selectedLootPileItem);
    this.selectedItems = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.selectedItems.push({ itemId: item.itemId});
      }
      return item;

    })
    if (this.selectedItems == undefined) {
      this.alertService.showMessage("Please select Item(s) to Drop.", "", MessageSeverity.error);
    }
    else if (this.selectedItems.length == 0) {
      this.alertService.showMessage("Please select Item(s) to Drop.", "", MessageSeverity.error);
    }
    else {
      this.DropSelectedItems();
    }

  }
  DropSelectedItems() {
    this.isLoading = true;
    this.itemsService.dropMultipleItems<any>(this.selectedItems)
      .subscribe(data => {
              this.alertService.showMessage("Dropping Item(s)", "", MessageSeverity.success);
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

  get lootItemsSettings() {
    return {
      primaryKey: "lootItemId",
      labelKey: "name",
      text: "Search item(s)",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "bottom"
    };
  }

}
