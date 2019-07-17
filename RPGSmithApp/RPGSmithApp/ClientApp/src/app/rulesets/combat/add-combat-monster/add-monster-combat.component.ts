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
import { CombatService } from '../../../core/services/combat.service';
import { DiceService } from '../../../core/services/dice.service';
import { ServiceUtil } from '../../../core/services/service-util';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
//import { AddMonster } from '../../../core/models/view-models/addMonster.model';


@Component({
    selector: 'app-add-combat-monster',
    templateUrl: './add-monster-combat.component.html',
    styleUrls: ['./add-monster-combat.component.scss']
})
export class AddCombatMonsterComponent implements OnInit {

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
  customDices: CustomDice[]=[];
 // combatMonster   =  new AddMonster();

    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
      private sharedService: SharedService, private commonService: CommonService,
      private itemsService: ItemsService, private combatService: CombatService, private monsterTemplateService: MonsterTemplateService
    ) {
        this.route.params.subscribe(params => { this.characterId = params['id']; });
    }

    ngOnInit() {
        setTimeout(() => {

            this.title = this.bsModalRef.content.title;
          this._view = this.bsModalRef.content.button;
          this.customDices = this.bsModalRef.content.customDices;
            this.rulesetId = this.bsModalRef.content.rulesetID;
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

           this.initialize();
        }, 0);
    }

  private initialize() {

    //this.itemsList = [
    //  {
    //      recordId: 1,
    //      name: 'Monster1',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTER,
    //      quantity: 0
    //  },
    //  {
    //    recordId: 2,
    //    name: 'Monster2',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTERGROUP,
    //    quantity: 0
    //  },
    //  {
    //    recordId:3,
    //    name: 'Monster3',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTERTEMPLATE,
    //    quantity: 0
    //  },
    //  {
    //    recordId: 4,
    //    name: 'Monster4',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTER,
    //    quantity: 0
    //  },
    //  {
    //    recordId: 5,
    //    name: 'Monster5',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTERGROUP,
    //    quantity: 0
    //  }
    //]

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.combatService.getCombat_AddMonstersList<any>(this.rulesetId)
        .subscribe(data => {
          debugger
          this.itemsList = [];
          if (data) {
            this.itemsList = data.map((rec, index) => {
              let type = '';
              if (rec.monsterId == null && rec.isBundle == false) {
                type = CombatMonsterTypeItems.MONSTERTEMPLATE
              }
              if (rec.monsterId == null && rec.isBundle == true) {
                type = CombatMonsterTypeItems.MONSTERGROUP
              }
              if (rec.monsterId != null && rec.isBundle == false) {
                type = CombatMonsterTypeItems.MONSTER
              }
              return {
                recordId: (index + 1),
                name: rec.name,
                image: rec.imageUrl,
                selected: false,
                type: type,
                quantity: 1,
                record:rec
              }
            })
          }
          //this.itemsList = data.ItemMaster;
          //this.itemsList.map((item) => {
          // item.quantity = 1;
          //});
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }

          else {
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          }
        }, () => { });
    }
  }

  setItemMaster(event: any, itemMaster: any) {
    itemMaster.selected = event.target.checked;
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
      
      let monstertemplatelist = this.selectedItemsList.filter(function (itm) {
        if (itm.type == CombatMonsterTypeItems.MONSTERTEMPLATE)
          return true;
      })
      
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
        this.bsModalRef.content.customDices = this.customDices;
      } else {
        this.AddMonsters();
      }
    } else {
      let message = 'Please select atleast one Monster';
      this.alertService.showMessage(message, "", MessageSeverity.error);
    }
   
  }

  AddMonsters() {

    let DeployedMonstersList = this.selectedItemsList.filter(itm => itm.type == CombatMonsterTypeItems.MONSTER);
    
    //let Non_DeployedMonstersList = this.selectedItemsList.filter((itm) => { itm.type != CombatMonsterTypeItems.MONSTER });
    //if (Non_DeployedMonstersList.length) {

    //}
    this.isLoading = true;
    let _msg = ' Adding Monster ....';
    this.alertService.startLoadingMessage("", _msg);

    var selectedMonsterGroups: any = [];
    this.selectedItemsList.map((rec) => {
      let x = rec.record;
      x.quantity = rec.quantity;

      if (x.isBundle) {
        if (x.bundleItems) {
          if (x.bundleItems.length) {
            x.bundleItems.map((bi) => {

              let itemQtyCount = +bi.quantity;
              for (var i_itemQty = 0; i_itemQty < itemQtyCount; i_itemQty++) {
                let healthNumberArray = [];
                let armorClassNumberArray = [];
                let xpValueNumberArray = [];
                let challangeRatingNumberArray = [];
                var reItems = [];
                if (+x.quantity) {
                  for (var i = 0; i < x.quantity; i++) {
                    let health = DiceService.rollDiceExternally(this.alertService, bi.monsterTemplate.health ? bi.monsterTemplate.health : '0', this.customDices)
                    let armorClass = DiceService.rollDiceExternally(this.alertService, bi.monsterTemplate.armorClass ? bi.monsterTemplate.armorClass : '0', this.customDices)
                    let xpValue = DiceService.rollDiceExternally(this.alertService, bi.monsterTemplate.xpValue ? bi.monsterTemplate.xpValue : '0', this.customDices)
                    let challangeRating = DiceService.rollDiceExternally(this.alertService, bi.monsterTemplate.challangeRating ? bi.monsterTemplate.challangeRating : '0', this.customDices)


                    healthNumberArray.push(health);
                    armorClassNumberArray.push(armorClass);
                    xpValueNumberArray.push(xpValue);
                    challangeRatingNumberArray.push(challangeRating);

                    if (bi.monsterTemplate.isRandomizationEngine) {

                      let currentItemsToDeploy = ServiceUtil.getItemsFromRandomizationEngine(bi.monsterTemplate.randomizationEngine, this.alertService);
                      if (currentItemsToDeploy && currentItemsToDeploy.length) {
                        currentItemsToDeploy.map((re) => {
                          re.deployCount = i + 1;
                          reItems.push(re);
                        });
                      }
                    }

                  }
                }
                selectedMonsterGroups.push({
                  qty: x.quantity,
                  monsterTemplateId: bi.monsterTemplateId,
                  rulesetId: bi.monsterTemplate.ruleSetId,
                  healthCurrent: healthNumberArray,
                  healthMax: healthNumberArray,
                  armorClass: armorClassNumberArray,
                  xpValue: xpValueNumberArray,
                  challangeRating: challangeRatingNumberArray,
                  addToCombat: true,
                  isBundle: false, // as this will insert as a single item now.
                  reItems: reItems
                });
              }
            })
          }
        }
      }
    });

    this.monsterTemplateService.addMonster(selectedMonsterGroups) /////Adding Groups To Monsters and Combat
      .subscribe(data => {

        
          let selectedDeployedMonster = DeployedMonstersList.map((D_Monster) => {
            return D_Monster.record;
        })
        debugger
          this.combatService.AddMonstersOnly(selectedDeployedMonster) /////Adding Deployed Monsters to Combat.
            .subscribe(data => {
              this.alertService.stopLoadingMessage();
              this.alertService.showMessage("Monsters has been added successfully.", "", MessageSeverity.success);
              this.isLoading = false;
              this.close();
            }, error => {
              this.isLoading = false;
              this.alertService.stopLoadingMessage();
              this.alertService.showMessage(error, "", MessageSeverity.error);
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              else {
                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
              }
            }, () => { });
              
      }, error => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showMessage(error, "", MessageSeverity.error);
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
        else {
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }
      }, () => { });


  }
  close() {
        this.bsModalRef.hide();
   }

}