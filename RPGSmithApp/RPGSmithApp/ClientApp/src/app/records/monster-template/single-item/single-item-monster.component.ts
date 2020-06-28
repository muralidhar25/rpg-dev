import { Component, OnInit, EventEmitter} from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { DBkeys } from '../../../core/common/db-keys';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';


@Component({
    selector: 'app-single-item-monster',
    templateUrl: './single-item-monster.component.html',
    styleUrls: ['./single-item-monster.component.scss']
})
export class SingleItemMonsterComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
    isLoading = false;
    title: string;
    _view: string;
    characterId: number;
    rulesetId: number;
    characterItems: any;
    searchText: string;
    itemsList: any[] = [];
   SelectedItems: any[] = [];
  constructor(private bsModalRef: BsModalRef,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private route: ActivatedRoute,
    private itemMasterService: ItemMasterService) {
        this.route.params.subscribe(params => { this.characterId = params['id']; });
    }

    ngOnInit() {
        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
            this._view = this.bsModalRef.content.button;
            this.rulesetId = this.bsModalRef.content.rulesetID;
            let SelectedBuffs: any[] = this.bsModalRef.content.SelectedItemsList;
          if (SelectedBuffs) {
            if (SelectedBuffs.length) {
              this.SelectedItems = SelectedBuffs;
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
                  this.itemsList = data.ItemMaster;
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

  setItemMaster(event: any, itemMaster: any) {
    //this.SelectedItems = [];
    if (event.target.checked) {
      const _containsItems = Object.assign([], this.SelectedItems);
      _containsItems.push({ text: itemMaster.itemName, itemId: itemMaster.itemMasterId, image: itemMaster.itemImage });
      this.SelectedItems = _containsItems;
    } else {
      let _item = { text: itemMaster.itemName, itemId: itemMaster.itemMasterId, image: itemMaster.itemImage, };
      const index: number = this.SelectedItems.indexOf(_item);
      if (index !== -1) {
        this.SelectedItems.splice(index, 1);
      } else {
        const _arrayItems = Object.assign([], this.SelectedItems);
        this.SelectedItems = _arrayItems.filter(function (itm) {
          if (itm.itemId !== _item.itemId) return _item;
        });
      }

    }
  }

  submitForm() {
    this.isLoading = true;
    //this.SelectedItems = this.SelectedItems.slice(-1).pop();
    this.event.emit(this.SelectedItems);
    this.isLoading = false;
    this.close();
  }

  close() {
    this.bsModalRef.hide();
  }

}
