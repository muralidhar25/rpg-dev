import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, } from 'ngx-bootstrap';
import { Items } from '../../../../core/models/view-models/items.model';
import { CommonService } from '../../../../core/services/shared/common.service';
import { AlertService, MessageSeverity } from '../../../../core/common/alert.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ItemMasterService } from '../../../../core/services/item-master.service';
import { SharedService } from '../../../../core/services/shared.service';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { ItemsService } from '../../../../core/services/items.service';
import { User } from '../../../../core/models/user.model';
import { DBkeys } from '../../../../core/common/db-keys';
import { Utilities } from '../../../../core/common/utilities';
import { VIEW } from '../../../../core/models/enums';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {

  isLoading = false;
  title: string;
  _view: string;
  characterId: number;
  rulesetId: number;
  itemsList: any;
  characterItems: any;
  characterItemModal: any = new Items();
  searchText: string;
  selectedItemsList: any[] = [];
  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, private commonService: CommonService,
    private itemsService: ItemsService, private itemMasterService: ItemMasterService
  ) {
    this.route.params.subscribe(params => { this.characterId = params['id']; });
  }

  ngOnInit() {
    setTimeout(() => {
      
      this.title = this.bsModalRef.content.title;
      this._view = this.bsModalRef.content.button;
      let _itemVM = this.bsModalRef.content.itemVM;
      let currencyList = this.bsModalRef.content.currencyList;

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
      this.itemMasterService.getItemMasterByRuleset_addItems_Cache<any>(this.rulesetId, true, false, this.characterId)
        .subscribe(data => {
          this.itemsList = data.ItemMaster;
          this.itemsList.forEach(function (val) { val.showIcon = false; val.selected = false; val.quantity = 1; });

          this.characterItemModal.characterCurrency = data.CharacterCurrency;
          try {
            this.characterItemModal.characterCurrency.forEach((x, i) => {
              x.selected = false; x.total = x.amount; x.amount = 0;
            });
          } catch (err) { }

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

  currencyEnable(evt, currency) {
    currency.selected = evt.checked;
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
    this.itemsList.map((item) => {
      if (item.selected) {
        if (item.isBundle) {
          this.characterItemModal.multiItemMasterBundles.push({ itemMasterBundleId: item.itemMasterId });
        }
        else {
          this.characterItemModal.multiItemMasters.push({ itemMasterId: item.itemMasterId, qty: item.quantity });
        }
      }
      return item;
    })
    let isCurrencySelected = false;
    if (this.characterItemModal && this.characterItemModal.characterCurrency) {
      this.characterItemModal.characterCurrency.map(c => {
        if (c.selected && c.amount) {
          isCurrencySelected = true;
        }
      });
    }
    if ((this.characterItemModal.multiItemMasters == undefined && this.characterItemModal.multiItemMasterBundles.length == 0) && !isCurrencySelected) {
      //this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
      this.alertService.showMessage("Please select new Item Template or Currency to Add.", "", MessageSeverity.error);
    }
    else if ((this.characterItemModal.multiItemMasters.length == 0 && this.characterItemModal.multiItemMasterBundles.length == 0) && !isCurrencySelected) {
      this.alertService.showMessage("Please select new Item Template or Currency to Add.", "", MessageSeverity.error);
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
    this.isLoading = true;
    this.itemMasterService.getCharacterItemCount(this.rulesetId, this.characterId)
      .subscribe((data: any) => {
        let ItemCount = data.itemCount;
        let selectedItemCount = 0;
        if (modal.multiItemMasters && modal.multiItemMasters.length) {
          selectedItemCount += modal.multiItemMasters.length;
        }
        if (modal.multiItemMasterBundles && modal.multiItemMasterBundles.length) {
          selectedItemCount += modal.multiItemMasterBundles.length;
        }
        if ((ItemCount + selectedItemCount) < 200) {

          modal.characterCurrency = modal.characterCurrency.filter(x => x.selected === true);

          this.itemsService.addItem(modal)
            .subscribe(
              data => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let message = "Item(s) added successfully.";
                this.alertService.showMessage(message, "", MessageSeverity.success);
                this.bsModalRef.hide();
                this.sharedService.updateItemsList(true);
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
        else {
          this.isLoading = false;
          this.alertService.showMessage("The maximum number of Items has been reached, 200. Please delete some Items and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

  duplicateItem(modal: any) {
    this.isLoading = true;
    this.itemsService.duplicateItem(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Item has been duplicated successfully.", "", MessageSeverity.success);
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

  quantityChanged(quantity, item) {
    this.selectedItemsList.map((itm) => {
      if (itm.itemMasterId == item.itemMasterId) {
        itm.qty = quantity >= 1 ? quantity : 1;
      }
    });
    this.itemsList.map((itm) => {
      if (itm.itemMasterId == item.itemMasterId) {
        itm.quantity = quantity >= 1 ? quantity : 1;
      }
    });
  }

}
