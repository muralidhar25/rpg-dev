import { Component, OnInit, EventEmitter} from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CombatMonsterTypeItems, CombatItemsType } from '../../../core/models/enums';
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
import { SaveCombatMonsterComponent } from '../save-combat-monster/save-combat-monster.component';
//import { AddMonster } from '../../../core/models/view-models/addMonster.model';


@Component({
    selector: 'app-addremove-buffeffects-combat',
    templateUrl: './combat-buffeffects-addremove.component.html',
  styleUrls: ['./combat-buffeffects-addremove.component.scss']
})
export class AddRemoveBuffEffectsComponent implements OnInit {

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
  recordImage: any;
  recordName: any;
 // combatMonster   =  new AddMonster();

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
            this.rulesetId = this.bsModalRef.content.rulesetID;
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          this.recordImage = this.bsModalRef.content.recordImage;
            this.recordName = this.bsModalRef.content.recordName;
           this.initialize();
        }, 0);
    }

  private initialize() {
   
    this.itemsList = [
      {
          recordId: 1,
          name: 'Monster1',
          image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTER,
          quantity: 0
      },
      {
        recordId: 2,
        name: 'Monster2',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTERGROUP,
        quantity: 0
      },
      {
        recordId:3,
        name: 'Monster3',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTERTEMPLATE,
        quantity: 0
      },
      {
        recordId: 4,
        name: 'Monster4',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTER,
        quantity: 0
      },
      {
        recordId: 5,
        name: 'Monster5',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTERGROUP,
        quantity: 0
      }
    ]

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
    //debugger;
   
   
    if (this.selectedItemsList.length) {
      console.log('selecteditem list', this.selectedItemsList);
      let monstertemplatelist = this.selectedItemsList.filter(function (itm) {
        if (itm.type == CombatMonsterTypeItems.MONSTERTEMPLATE)
          return true;
      })
      console.log('monstertemplatelist', monstertemplatelist);
      if (monstertemplatelist.length) {
        this.close();
        this.bsModalRef = this.modalService.show(SaveCombatMonsterComponent, {
          class: 'modal-primary modal-custom',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Monsters';
        this.bsModalRef.content.button = 'Add';
        this.bsModalRef.content.selectedItems = this.selectedItemsList;
      } else {
        this.close();
      }
    } else {
      let message = 'Please select atleast one Monster';
      this.alertService.showMessage(message, "", MessageSeverity.error);
    }
   
  }

  
  close() {
        this.bsModalRef.hide();
   }

}
