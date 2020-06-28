import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { MessageSeverity, AlertService } from '../../../core/common/alert.service';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { DBkeys } from '../../../core/common/db-keys';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { DiceService } from '../../../core/services/dice.service';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { ServiceUtil } from '../../../core/services/service-util';
import { AssignToCharacterComponent } from '../../../shared/assign-to-character/assign-to-character.component';


@Component({
  selector: 'app-add-monster',
  templateUrl: './add-monster.component.html',
  styleUrls: ['./add-monster.component.scss']
})
export class AddMonsterComponent implements OnInit {

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
  customDices: CustomDice[] = [];
  addToCombat: boolean = false;
  assignAlly: boolean = false;
  allyCharacterId: number;
  constructor(
    private bsModalRef: BsModalRef, private bsModalRef2: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService,
    private monsterTemplateService: MonsterTemplateService
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
      this.customDices = this.bsModalRef.content.customDices;
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.monsterTemplateService.getMonsterTemplateByRuleset_add_Cache<any>(this.rulesetId, true)//true
        .subscribe(data => {

          this.itemsList = data.MonsterTemplate;
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

  setMonsterTemplate(event: any, MonsterTemplate: any) {

    if (event.target.checked) {
      const _containsItems = Object.assign([], this.selectedItemsList);
      _containsItems.push(MonsterTemplate);
      this.selectedItemsList = _containsItems;
    } else {
      let _item = MonsterTemplate;
      const index: number = this.selectedItemsList.indexOf(_item);
      if (index !== -1) {
        this.selectedItemsList.splice(index, 1);
      } else {
        const _arrayItems = Object.assign([], this.selectedItemsList);
        this.selectedItemsList = _arrayItems.filter(function (itm) {
          if (itm.monsterTemplateId !== _item.monsterTemplateId) return _item;
        });
      }
      if (this.selectedItemsList.length < 1) {
        this.assignAlly = false;
      }

    }
  }

  submitForm() {

      if (this.assignAlly) {
        this.bsModalRef2 = this.modalService.show(AssignToCharacterComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef2.content.rulesetId = this.rulesetId;
        this.bsModalRef2.content.assignAsAlly = true;
        this.bsModalRef2.content.event.subscribe(id => {
          if (id) {
            this.allyCharacterId = id;
            this.addMonsters();
          } else {
            this.assignAlly = false;
          }
        });
      } else {
        this.allyCharacterId = 0;
        this.addMonsters();
      }
  }

  addMonsters() {

    if (this.selectedItemsList.length) {
      var selectedMonsters: any = [];

      this.selectedItemsList.map((x) => {



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
                        let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(bi.monsterTemplate.randomizationEngine);
                        let currentItemsToDeploy = ServiceUtil.getItemsFromRandomizationEngine_WithMultipleSeletion(r_engine, this.alertService);
                        if (currentItemsToDeploy && currentItemsToDeploy.length) {
                          currentItemsToDeploy.map((re) => {
                            re.deployCount = i + 1;
                            reItems.push(re);
                          });
                        }
                      }

                    }
                  }
                  selectedMonsters.push({
                    qty: x.quantity,
                    monsterTemplateId: bi.monsterTemplateId,
                    rulesetId: bi.monsterTemplate.ruleSetId,
                    healthCurrent: healthNumberArray,
                    healthMax: healthNumberArray,
                    armorClass: armorClassNumberArray,
                    xpValue: xpValueNumberArray,
                    challangeRating: challangeRatingNumberArray,
                    addToCombat: this.addToCombat,
                    isBundle: false, // as this will insert as a single item now.
                    reItems: reItems,
                    characterId: this.allyCharacterId
                  });
                }


              })
            }
          }


        }
        else {
          let healthNumberArray = [];
          let armorClassNumberArray = [];
          let xpValueNumberArray = [];
          let challangeRatingNumberArray = [];
          var reItems = [];
          if (+x.quantity) {
            for (var i = 0; i < x.quantity; i++) {
              let health = DiceService.rollDiceExternally(this.alertService, x.health ? x.health : '0', this.customDices)
              let armorClass = DiceService.rollDiceExternally(this.alertService, x.armorClass ? x.armorClass : '0', this.customDices)
              let xpValue = DiceService.rollDiceExternally(this.alertService, x.xpValue ? x.xpValue : '0', this.customDices)
              let challangeRating = DiceService.rollDiceExternally(this.alertService, x.challangeRating ? x.challangeRating : '0', this.customDices)


              healthNumberArray.push(health);
              armorClassNumberArray.push(armorClass);
              xpValueNumberArray.push(xpValue);
              challangeRatingNumberArray.push(challangeRating);

              if (x.isRandomizationEngine) {
                let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(x.randomizationEngine);
                let currentItemsToDeploy = ServiceUtil.getItemsFromRandomizationEngine_WithMultipleSeletion(r_engine, this.alertService);
                if (currentItemsToDeploy && currentItemsToDeploy.length) {
                  currentItemsToDeploy.map((re) => {
                    re.deployCount = i + 1;
                    reItems.push(re);
                  });
                }
              }
            }
          }
          selectedMonsters.push({
            qty: x.quantity,
            monsterTemplateId: x.monsterTemplateId,
            rulesetId: x.ruleSetId,
            healthCurrent: healthNumberArray,
            healthMax: healthNumberArray,
            armorClass: armorClassNumberArray,
            xpValue: xpValueNumberArray,
            challangeRating: challangeRatingNumberArray,
            addToCombat: this.addToCombat,
            isBundle: x.isBundle,
            reitems: reItems,
            characterId: this.allyCharacterId
          });
        }

      });
      this.isLoading = true;
      let _msg = ' Adding Monster ....';
      this.alertService.startLoadingMessage("", _msg);
      let monstersQuantity = 0;
      selectedMonsters.map(m => {
        if (m.qty) {
          monstersQuantity += m.qty;
        }
      });

      let selectedMonster_With_Qty = monstersQuantity;
      this.monsterTemplateService.getMonsterCountByRuleSetId(this.rulesetId)
        .subscribe((data: any) => {
          let MonsterCount = data.monsterCount;
          if ((MonsterCount + selectedMonster_With_Qty) <= 200) {
            this.monsterTemplateService.addMonster(selectedMonsters)
              .subscribe(data => {

                this.alertService.stopLoadingMessage();
                this.alertService.showMessage("Monsters has been added successfully.", "", MessageSeverity.success);
                this.isLoading = false;
                this.close();
                this.sharedService.updateMonsterList(true);
              }, error => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                this.alertService.showMessage(error, "", MessageSeverity.error);
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  this.authService.logout(true);
                }
              }, () => { });
          }
          else {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
            //this.alertService.showMessage("The maximum number of monsters has been reached, 200. Please delete some monsters and try again.", "", MessageSeverity.error);
            this.alertService.showStickyMessage("The total number of monsters that can be deployed at one time is 200, You currently have " + MonsterCount + " deployed. Please reduce the requested amount and try again.", "", MessageSeverity.error);

            setTimeout(() => { this.alertService.resetStickyMessage(); }, 10000);

            this.selectedItemsList = [];
          }
        }, error => { }, () => { });
    } else {
      let message = 'Please select atleast one Monster';
      this.alertService.showMessage(message, "", MessageSeverity.error);
    }
  }

  quantityChanged(quantity, item) {
    this.selectedItemsList.map(function (itm) {
      if (itm.monsterTemplateId == item.monsterTemplateId) {
        itm.quantity = quantity;
      }
    });
  }
  close() {
    this.bsModalRef.hide();
  }
  changeCheckbox(event) {
    this.addToCombat = event.target.checked;
  }
  assignAsAlly(event) {
    this.assignAlly = event.target.checked;
  }
}
