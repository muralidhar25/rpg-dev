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
  selector: 'app-add-items-for-monster',
  templateUrl: './add-items-for-monster.component.html',
  styleUrls: ['./add-items-for-monster.component.scss']
})
export class AddItemsForMonstersOnlyComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
    isLoading = false;
    title: string;
    _view: string;
    characterId: number;
    rulesetId: number;
    characterItems: any;
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
          this.rulesetId = this.bsModalRef.content.rulesetID;

          //let selectedItems: any[] = this.bsModalRef.content.SelectedItemsList;
          //if (selectedItems) {
          //  if (selectedItems.length) {
          //    this.selectedItemsList = selectedItems;
          //  }
          //}
          let SelectedItems: any[] = this.bsModalRef.content.SelectedItemsList;
          if (SelectedItems) {
            if (SelectedItems.length) {
              this.selectedItemsList = SelectedItems;
            }
          }
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
          this.itemMasterService.getItemMasterByRuleset_add<any>(this.rulesetId, false)//true
            .subscribe(data => {
              this.itemsList = Object.assign([], data.ItemMaster);
                  this.itemsList.map((item) => {
                    item.quantity = 1;
                    if (this.selectedItemsList && this.selectedItemsList.length>=1) {
                      this.selectedItemsList.map(x => {
                        if (x.itemMasterId == item.itemMasterId) {
                          item.quantity = x.qty;
                          item.selected = true;
                        } 
                      });
                    }                   
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
        _containsItems.push({ name: itemMaster.itemName, itemId: itemMaster.itemId ? itemMaster.itemId : 0, itemMasterId: itemMaster.itemMasterId, image: itemMaster.itemImage, qty: itemMaster.quantity });
        this.selectedItemsList = _containsItems;
        } else {
        let _item = { name: itemMaster.itemName, itemId: itemMaster.itemId ? itemMaster.itemId : 0,  itemMasterId: itemMaster.itemMasterId, image: itemMaster.itemImage, qty: itemMaster.quantity };
            const index: number = this.selectedItemsList.indexOf(_item);
            if (index !== -1) {
              this.selectedItemsList.splice(index, 1);
            }else {
              const _arrayItems = Object.assign([], this.selectedItemsList);
              this.selectedItemsList = _arrayItems.filter(function (itm) {
                if (itm.itemMasterId !== _item.itemMasterId) return _item;
              });
            }
      }
    }

  submitForm() {
    this.isLoading = true;
    this.event.emit(this.selectedItemsList);
    this.isLoading = false;
    this.close();
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
  

    close() {
        this.bsModalRef.hide();
    }

}
