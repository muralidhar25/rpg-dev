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
import { CommonService } from '../../../core/services/shared/common.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';


@Component({
    selector: 'app-drop-items-combat',
    templateUrl: './drop-items-monstercombat.component.html',
  styleUrls: ['./drop-items-monstercombat.component.scss']
})
export class DropItemsCombatMonsterComponent implements OnInit {

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
    monsterId: number;

    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService,
      private itemsService: ItemsService,
      private monsterTemplateService: MonsterTemplateService
    ) {
        this.route.params.subscribe(params => { this.characterId = params['id']; });
    }

    ngOnInit() {
        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
            this._view = this.bsModalRef.content.button;
            
            
            this.rulesetId = this.bsModalRef.content.rulesetID;
            this.monsterId = this.bsModalRef.content.monsterId;
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
          
          this.monsterTemplateService.getMonsterItemToDrop<any>(this.monsterId)
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
                if (itm.itemId !== _item.itemId) return _item;
              });
            }
      }
    }

  submitForm() {
    
    
    if (this.selectedItemsList.length) {
      this.isLoading = true;
      let _msg = 'Droping Monster Items ...';
      this.alertService.startLoadingMessage("", _msg);
      this.monsterTemplateService.dropMonsterItems(this.selectedItemsList, this.monsterId)
        .subscribe(data => {
          this.alertService.stopLoadingMessage();
          this.isLoading = false;
          this.close();
          this.sharedService.updateDropMonsterList(true);
        }, error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage(error, "", MessageSeverity.error);
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });
    } else {
      let message = 'Please select atleast one item to drop';
      this.alertService.showMessage(message, "", MessageSeverity.error);
    }
    
  }

  
    


    close() {
        this.bsModalRef.hide();
    }

}
