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
import { MonsterTemplateService } from '../../../core/services/monster-template.service';


@Component({
    selector: 'save-combat-monster',
    templateUrl: './save-combat-monster.component.html',
  styleUrls: ['./save-combat-monster.component.scss']
})
export class SaveCombatMonsterComponent implements OnInit {

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
  isChecked: boolean = false;
    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService,
      private itemsService: ItemsService, private itemMasterService: ItemMasterService, private monsterTemplateService: MonsterTemplateService
    ) {
        this.route.params.subscribe(params => { this.characterId = params['id']; });
    }

    ngOnInit() {
        setTimeout(() => {
            
            this.title = this.bsModalRef.content.title;
            this._view = this.bsModalRef.content.button;
            //this.rulesetId = this.bsModalRef.content.rulesetID;
          this.itemsList = this.bsModalRef.content.selectedItems;
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

           this.initialize();
        }, 0);
    }

  private initialize() {
  
        //let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        //if (user == null)
        //    this.authService.logout();
        //else {
        //    this.isLoading = true;
        //  this.itemMasterService.getItemMasterByRuleset_add<any>(this.rulesetId, false)//true
        //        .subscribe(data => {
        //          this.itemsList = data.ItemMaster;
        //          this.itemsList.map((item) => {
        //           item.quantity = 1;
        //          });
        //            this.isLoading = false;
        //        }, error => {
        //            this.isLoading = false;
        //            let Errors = Utilities.ErrorDetail("", error);
        //            if (Errors.sessionExpire) {
        //                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
        //                this.authService.logout(true);
        //            }
        //        }, () => { });
        //}
    }

  setItemMaster(event: any, itemMaster: any) {

      if (event.target.checked) {
        const _containsItems = Object.assign([], this.selectedItemsList);
        _containsItems.push(itemMaster);
        this.selectedItemsList = _containsItems;
        } else {
        let _item = itemMaster;
            const index: number = this.selectedItemsList.indexOf(_item);
            if (index !== -1) {
              this.selectedItemsList.splice(index, 1);
            }else {
              const _arrayItems = Object.assign([], this.selectedItemsList);
              this.selectedItemsList = _arrayItems.filter(function (itm) {
                if (itm.recordId !== _item.recordId) return _item;
              });
            }
      }
    }

  submitForm() {
    console.log(this.isChecked);
    console.log('this.selectedItemsList',this.selectedItemsList);
    if (this.selectedItemsList.length) {
      this.isLoading = true;
      let _msg = ' Adding Monster ....';
      this.alertService.startLoadingMessage("", _msg);
      this.alertService.stopLoadingMessage();
          this.isLoading = false;
          this.close();
      //this.monsterTemplateService.addMonster(this.selectedItemsList)
      //  .subscribe(data => {
      //    this.alertService.stopLoadingMessage();
      //    this.isLoading = false;
      //    this.close();
      //  }, error => {
      //    this.isLoading = false;
      //    this.alertService.stopLoadingMessage();
      //    this.alertService.showMessage(error, "", MessageSeverity.error);
      //    let Errors = Utilities.ErrorDetail("", error);
      //    if (Errors.sessionExpire) {
      //      this.authService.logout(true);
      //    }
      //  }, () => { });
    } else {
      let message = 'Please select atleast one Monster';
      this.alertService.showMessage(message, "", MessageSeverity.error);
    }
   
  }

  quantityChanged(quantity, item) {
       this.selectedItemsList.map(function (itm) {
         if (itm.recordId == item.recordId) {
           itm.quantity = quantity;
         }
      });
  }

  removeItem(item: any) {
    this.itemsList = this.itemsList.filter(x => x.recordId != item.recordId);
  }
  close() {
        this.bsModalRef.hide();
   }
  checkValue(event) {
    console.log(event);
    this.isChecked = event.target.checked;
  }
}
