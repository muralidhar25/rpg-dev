import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { BuffAndEffectService } from '../../../core/services/buff-and-effect.service';
import { SharedService } from '../../../core/services/shared.service';

@Component({
  selector: 'app-delete-records',
  templateUrl: './delete-records.component.html',
  styleUrls: ['./delete-records.component.scss']
})
export class DeleteRecordsComponent implements OnInit {

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
    private sharedService: SharedService,
    private buffAndEffectService: BuffAndEffectService) { }

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
      this.buffAndEffectService.getBuffAndEffectByRuleset_spWithPagination_Cache<any>(this.rulesetId, this.page, this.pageSize)
        .subscribe(data => {
          this.itemsList = data.buffAndEffects;
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
      if (item.buffAndEffectId == itemMaster.buffAndEffectId) {
        item.selected = event.target.checked;
      }
      return item;
    })
  }

  submitForm() {
    this.selectedItems = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.selectedItems.push({ buffAndEffectId: item.buffAndEffectId });
      }
      return item;

    })
    if (this.selectedItems == undefined) {
      this.alertService.showMessage("Please select Records to Delete.", "", MessageSeverity.error);
    }
    else if (this.selectedItems.length == 0) {
      this.alertService.showMessage("Please select Records to Delete.", "", MessageSeverity.error);
    }
    else {
      this.RemoveSelectedItems();
    }

  }
  RemoveSelectedItems() {
    this.isLoading = true;
    this.buffAndEffectService.deleteRecords<any>(this.selectedItems, this.rulesetId)
      .subscribe(data => {
        this.alertService.showMessage("Deleting Records", "", MessageSeverity.success);
        this.close();
        this.sharedService.updateBuffAndEffectList(true);
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
