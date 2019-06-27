import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { Items } from '../../../core/models/view-models/items.model';
import { SharedService } from '../../../core/services/shared.service';
import { ItemsService } from '../../../core/services/items.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { VIEW } from '../../../core/models/enums';
import { LootService } from '../../../core/services/loot.service';
import { AppService1 } from '../../../app.service';

@Component({
  selector: 'app-addloot',
  templateUrl: './addloot.component.html',
  styleUrls: ['./addloot.component.scss']
})
export class AddlootComponent implements OnInit {
  isLoading = false;
  title: string;
  _view: string;
  characterId: number;
  rulesetId: number;
  itemsList: any;
  characterItems: any;
  characterItemModal: any = new Items();
  searchText: string;

  constructor(private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, private commonService: CommonService,
    private itemsService: ItemsService, private itemMasterService: ItemMasterService,
    private appService: AppService1,private lootService: LootService) {

  }

  ngOnInit() {
    setTimeout(() => {

      this.title = this.bsModalRef.content.title;
      this._view = this.bsModalRef.content.button;
      let _itemVM = this.bsModalRef.content.itemVM;
      this.characterItemModal = this.itemsService.itemModelData(_itemVM, this._view);
      this.characterId = this.characterItemModal.characterId;
      this.rulesetId = this.characterItemModal.rulesetId;
      this.characterItems = this.bsModalRef.content.characterItems;
      if (this.rulesetId == undefined)
        this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.itemMasterService.getItemMasterByRuleset_add<any>(this.rulesetId, true)//true
        .subscribe(data => {
          this.itemsList = data.ItemMaster;

          this.itemsList.forEach(function (val) { val.showIcon = false; val.selected = false; });
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
    //if (event.target.checked) {
    //    this.characterItemModal.multiItemMasters.push({ itemMasterId: itemMaster.itemMasterId });
    //}
    //else {
    //    this.characterItemModal.multiItemMasters
    //        .splice(this.characterItemModal.multiItemMasters.indexOf({ itemMasterId: itemMaster.itemMasterId }), 1);
    //}

    this.itemsList.map((item) => {
      if (item.itemMasterId == itemMaster.itemMasterId && item.isBundle == itemMaster.isBundle) {
        item.selected = event.target.checked;
      }
      return item;
    })
    this.characterItemModal.itemMasterId = itemMaster.itemMasterId;
  }

  submitForm(itemMaster: any) {
 
    this.characterItemModal.multiItemMasterBundles = [];
    this.characterItemModal.multiItemMasters = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        //if (item.isBundle) {
        //  this.characterItemModal.multiItemMasterBundles.push({ itemMasterBundleId: item.itemMasterId });
        //}
        //else {
        this.characterItemModal.multiItemMasters.push({ iD: item.itemMasterId, isBundle: item.isBundle });
        //}
      }
      return item;
    })
    if (this.characterItemModal.multiItemMasters == undefined && this.characterItemModal.multiItemMasterBundles.length == 0) {
      this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
    }
    else if (this.characterItemModal.multiItemMasters.length == 0 && this.characterItemModal.multiItemMasterBundles.length == 0) {
      this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
    }
    else {
      if (this.characterItemModal.view === VIEW.DUPLICATE) {
        //this.duplicateAbility(ability);
      }
      else {
        this.addEditItem(itemMaster);
      }
    }
  }

  addEditItem(modal: any) {
    //console.log('modal data', modal.multiItemMasters);
    this.isLoading = true;
    this.lootService.addLootItem(modal.multiItemMasters, this.rulesetId)
      .subscribe(
      data => {
        //console.log(data);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Loot(s) added successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.bsModalRef.hide();
          this.sharedService.updateItemsList(true);
        this.appService.updateChatWithLootMessage(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to Add", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        },
      );
  }

  duplicateItem(modal: any) {
    this.isLoading = true;
    this.itemsService.duplicateItem(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Loot has been duplicated successfully.", "", MessageSeverity.success);
          this.bsModalRef.hide();
          this.sharedService.updateItemsList(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to Duplicate ", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

        });
  }
  close() {
    this.bsModalRef.hide();
  }
}
