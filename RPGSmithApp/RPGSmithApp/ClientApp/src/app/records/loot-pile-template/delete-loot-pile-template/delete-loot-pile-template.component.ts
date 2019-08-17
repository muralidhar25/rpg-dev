import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AppService1 } from '../../../app.service';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { SharedService } from '../../../core/services/shared.service';
import { LootService } from '../../../core/services/loot.service';

@Component({
  selector: 'app-delete-loot-pile-template',
  templateUrl: './delete-loot-pile-template.component.html',
  styleUrls: ['./delete-loot-pile-template.component.scss']
})
export class DeleteLootPileTemplateComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  itemsList: any;
  searchText: string;
  allSelected: boolean = false;
  selectedItems = [];
  page: number = 1;
  pageSize: number = 99999;

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private appService: AppService1,
    private sharedService: SharedService,
    private lootService: LootService) { }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.ruleSetId;
      //this.characterId = this.bsModalRef.content.characterId;
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.lootService.getByRuleSetId_sp<any>(this.rulesetId, this.page, this.pageSize)
        .subscribe(data => {
          debugger
          this.itemsList = data.lootTemplates;
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
    debugger
    this.itemsList.map((item) => {
      if (item.lootTemplateId == itemMaster.lootTemplateId) {
        item.selected = event.target.checked;
      }
      return item;
    })
  }

  submitForm() {
    debugger
    this.selectedItems = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.selectedItems.push({ lootTemplateId: item.lootTemplateId });
      }
      return item;

    })
    if (this.selectedItems == undefined) {
      this.alertService.showMessage("Please select Item to Delete.", "", MessageSeverity.error);
    }
    else if (this.selectedItems.length == 0) {
      this.alertService.showMessage("Please select Item to Delete.", "", MessageSeverity.error);
    }
    else {
      this.DeleteSelectedItems();
    }

  }
  DeleteSelectedItems() {
    this.isLoading = true;
    this.lootService.deleteLootTemplates<any>(this.selectedItems, this.rulesetId)
      .subscribe(data => {
        this.alertService.showMessage("Deleting Records", "", MessageSeverity.success);
        this.close();
        this.sharedService.updateItemsList(true);
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