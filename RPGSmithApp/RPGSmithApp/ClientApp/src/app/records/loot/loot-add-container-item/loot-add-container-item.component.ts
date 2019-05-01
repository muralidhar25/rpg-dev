import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { SharedService } from '../../../core/services/shared.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ItemsService } from '../../../core/services/items.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { ItemMasterService } from '../../../core/services/item-master.service';

@Component({
  selector: 'app-loot-add-container-item',
  templateUrl: './loot-add-container-item.component.html',
  styleUrls: ['./loot-add-container-item.component.scss']
})
export class LootAddContainerItemComponent implements OnInit {

  isLoading = false;
  selected: boolean = false;
  title: string;
  _view: string;
  rulesetId: number;
  itemId: number;
  itemName: string;
  itemsList: any;
  containsModal: any;
  containerItemId: number;
  containsItems: any = [];
  searchText: string
  button: string
  isFromDetailPage: boolean = false;
  itemToUpdate: any
  constructor(
    private router: Router,
    private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, private commonService: CommonService, private itemMasterService: ItemMasterService
  ) {

  }

  ngOnInit() {
    setTimeout(() => {
      this.button = this.bsModalRef.content.button;
      this.rulesetId = this.bsModalRef.content.rulesetId;
      this.itemId = this.bsModalRef.content.itemId;
      this.containerItemId = this.bsModalRef.content.containerItemId;
      this.itemName = this.bsModalRef.content.itemName;
      this.containsItems = this.bsModalRef.content.contains == null || this.bsModalRef.content.contains == undefined ? [] : this.bsModalRef.content.contains;
      this.containsModal = {
        rulesetId: this.rulesetId,
        itemId: this.itemId,
        containerItemId: this.containerItemId,
        itemName: this.itemName,
        Contains: this.containsItems
      }
      this.isFromDetailPage = this.bsModalRef.content.isFromDetailPage ? this.bsModalRef.content.isFromDetailPage : false;
      this.itemToUpdate = this.bsModalRef.content.itemToUpdate ? this.bsModalRef.content.itemToUpdate : undefined;
      if (this.isFromDetailPage) {
        this.button = 'Save'
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
      this.itemMasterService.getAvailableItems<any>(this.rulesetId, this.itemId, this.containerItemId)
        .subscribe(data => {
          this.itemsList = data;
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

  submitForm(containsModal: any) {

    if (this.isFromDetailPage) {
      //this.isLoading = true;
      //if (this.itemToUpdate != undefined) {
      //  try {
      //    let items = this.containsItems;
      //    containsModal.Contains = items;
      //    containsModal.selected = true;
      //    this.itemToUpdate.contains = containsModal.Contains;
      //    this.itemToUpdate.selected = containsModal.selected;
      //    this.itemToUpdate.containerItems = containsModal.Contains;
      //  } catch (err) { }
      //  this.updateItem(this.itemToUpdate);
      //}
    }
    else {
      let items = this.containsItems;
      containsModal.Contains = items;
      containsModal.selected = true;
      this.sharedService.UpdateContainsItem(containsModal);
      this.close();
    }
  }

  setItem(event: any, item: any) {
    this.selected = false;
    if (event.target.checked) {

      const _containsItems = Object.assign([], this.containsItems);

      _containsItems.push({ text: item.itemName, value: item.lootId, itemId: item.lootId, image: item.itemImage });
      this.containsItems = _containsItems;
    }
    else {

      let _item = { text: item.itemName, value: item.lootId, itemId: item.lootId, image: item.itemImage };
      const index: number = this.containsItems.indexOf(_item);
      if (index !== -1) {
        this.containsItems.splice(index, 1);
      }
      else {
        const _arrayItems = Object.assign([], this.containsItems);
        this.containsItems = _arrayItems.filter(function (itm) {
          if (itm.itemId !== item.lootId) return item;
        });
      }
    }
  }

  close() {
    this.bsModalRef.hide();
  }
  //updateItem(modal: any) {
  //  this.isLoading = true;
  //  this.itemsService.updateItem<any>(modal)
  //    .subscribe(
  //      data => {
  //        this.close();
  //        this.isLoading = false;
  //        this.alertService.stopLoadingMessage();
  //        let message = "Item has been updated successfully";
  //        this.alertService.showMessage(message, "", MessageSeverity.success);
  //        this.bsModalRef.hide();
  //        this.sharedService.updateItemsList(true);
  //      },
  //      error => {
  //        this.isLoading = false;
  //        this.alertService.stopLoadingMessage();
  //        let _message = "Unable to Update ";
  //        let Errors = Utilities.ErrorDetail(_message, error);
  //        if (Errors.sessionExpire) {
  //          this.authService.logout(true);
  //        }
  //        else
  //          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //      },
  //    );
  //}

}
