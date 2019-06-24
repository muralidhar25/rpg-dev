import { Component, OnInit, EventEmitter} from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { VIEW } from '../../../core/models/enums';
import { MessageSeverity, AlertService } from '../../../core/common/alert.service';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { DBkeys } from '../../../core/common/db-keys';
import { Items } from '../../../core/models/view-models/items.model';
import { SharedService } from '../../../core/services/shared.service';
import { ItemsService } from '../../../core/services/items.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';


@Component({
    selector: 'app-drop-items-monster',
    templateUrl: './drop-items-monster.component.html',
    styleUrls: ['./drop-items-monster.component.scss']
})
export class DropItemsMonsterComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
    isLoading = false;
    title: string;
    _view: string;
    characterId: number;
    rulesetId: number;
    characterItems: any;
    characterItemModal: any = new Items();
    searchText: string;
    itemsList: any[] = [];
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
          this.characterItemModal = this.itemsService.itemModelData(_itemVM, this._view);
          this.rulesetId = this.bsModalRef.content.rulesetID;
          
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

           this.initialize();
        }, 0);
    }

  private initialize() {
    debugger;
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
          this.itemMasterService.getItemMasterByRuleset_add<any>(this.rulesetId, true)//true
                .subscribe(data => {
                  this.itemsList = data.ItemMaster;
                  this.itemsList.map((item) => {
                   item.quantity = 1;
                  });
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

      if (event.target.checked) {
        const _containsItems = Object.assign([], this.selectedItemsList);
        _containsItems.push({ text: itemMaster.itemName, itemId: itemMaster.itemMasterId, image: itemMaster.itemImage, quantity: itemMaster.quantity });
        this.selectedItemsList = _containsItems;
        } else {
            let _item = { text: itemMaster.itemName, itemId: itemMaster.itemMasterId, image: itemMaster.itemImage, quantity: itemMaster.quantity };
            const index: number = this.selectedItemsList.indexOf(_item);
            if (index !== -1) {
              this.selectedItemsList.splice(index, 1);
            }else {
              const _arrayItems = Object.assign([], this.selectedItemsList);
              this.selectedItemsList = _arrayItems.filter(function (itm) {
                if (itm.itemId !== _item.itemId) return _item;
              });
            }
      }
    }

  submitForm(itemMaster: any) {
    this.isLoading = true;
    console.log(this.selectedItemsList);
    
    this.isLoading = false;
    this.close();
  }

  
    //this.characterItemModal.multiItemMasterBundles = [];
    //    this.itemsList.map((item) => {
    //      if (item.selected) {
    //        if (item.isBundle) {
    //          this.characterItemModal.multiItemMasterBundles.push({ itemMasterBundleId: item.itemMasterId });
    //        }
    //        else {
    //          this.characterItemModal.multiItemMasters.push({  itemMasterId: item.itemMasterId });
    //        }
    //      }
    //        return item;
    //    })
    //if (this.characterItemModal.multiItemMasters == undefined && this.characterItemModal.multiItemMasterBundles.length == 0) {
    //        this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
    //    }
    //else if (this.characterItemModal.multiItemMasters.length == 0 && this.characterItemModal.multiItemMasterBundles.length == 0) {
    //        this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
    //    }        
    //    else {
    //        if (this.characterItemModal.view === VIEW.DUPLICATE) {
    //            //this.duplicateAbility(ability);
    //        }
    //        else {
    //            this.addEditItem(itemMaster);
    //        }
    //    }
    //}

    //addEditItem(modal: any) {
    //    this.isLoading = true;
    //    this.itemsService.addItem(modal)
    //        .subscribe(
    //            data => {
    //                this.isLoading = false; 
    //                this.alertService.stopLoadingMessage();
    //                let message = "Item(s) added successfully.";
    //                this.alertService.showMessage(message, "", MessageSeverity.success);
    //                this.bsModalRef.hide();
    //                this.sharedService.updateItemsList(true);
    //            },
    //            error => {
    //                this.isLoading = false; 
    //                this.alertService.stopLoadingMessage();
    //                let Errors = Utilities.ErrorDetail("Unable to Add", error);
    //                if (Errors.sessionExpire) {
    //                    this.authService.logout(true);
    //                }
    //                else
    //                    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
    //            },
    //    );
    //}

    //duplicateItem(modal: any) {
    //    this.isLoading = true;
    //    this.itemsService.duplicateItem(modal)
    //        .subscribe(
    //            data => {
    //                this.isLoading = false; 
    //                this.alertService.stopLoadingMessage();
    //                this.alertService.showMessage("Item has been duplicated successfully.", "", MessageSeverity.success);
    //                this.bsModalRef.hide();
    //                this.sharedService.updateItemsList(true);
    //            },
    //            error => {
    //                this.isLoading = false; 
    //                this.alertService.stopLoadingMessage();
    //                let Errors = Utilities.ErrorDetail("Unable to Duplicate ", error);
    //                if (Errors.sessionExpire) {
    //                    this.authService.logout(true);
    //                }
    //                else
    //                    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

    //            });
    //}


    close() {
        this.bsModalRef.hide();
    }

}
