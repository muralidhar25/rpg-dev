import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { CounterTile } from '../../../core/models/tiles/counter-tile.model';
import { CharacterTile } from '../../../core/models/tiles/character-tile.model';
import { CharacterDashboardPage } from '../../../core/models/view-models/character-dashboard-page.model';
import { ColorService } from '../../../core/services/tiles/color.service';
import { SharedService } from '../../../core/services/shared.service';
import { CounterTileService } from '../../../core/services/tiles/counter-tile.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';

import { PlatformLocation } from '@angular/common';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { Utilities } from '../../../core/common/utilities';
import { DiceService } from '../../../core/services/dice.service';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { RulesetService } from '../../../core/services/ruleset.service';
import { ServiceUtil } from '../../../core/services/service-util';
import { AssignToCharacterComponent } from '../../../shared/assign-to-character/assign-to-character.component';

@Component({
  selector: 'app-deploy-monster',
  templateUrl: './deploy-monster.component.html',
  styleUrls: ['./deploy-monster.component.scss']
})
export class DeployMonsterComponent implements OnInit {


  value: number;
  isLoading: boolean = false;
  isMouseDown: boolean = false;
  interval: any;
  monsterImage: any;
  title: string;
  monsterInfo: any;
  addToCombat: boolean = false;
  customDices: CustomDice[] = [];
  bundleItems: any[] = [];
  ruleSetId: number = 0;
  assignAlly: boolean = false;
  allyCharacterId: number;

  constructor(private bsModalRef: BsModalRef, private bsModalRef2: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
    private colorService: ColorService, private localStorage: LocalStoreManager, private counterTileService: CounterTileService,
    private alertService: AlertService, private authService: AuthService, private location: PlatformLocation,
    private monsterTemplateService: MonsterTemplateService, private rulesetService: RulesetService, ) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {

      this.title = this.bsModalRef.content.title;
      this.monsterInfo = this.bsModalRef.content.monsterInfo;
      this.monsterImage = (this.monsterInfo.imageUrl) ? this.monsterInfo.imageUrl : this.monsterInfo.bundleImage ? this.monsterInfo.bundleImage : '../assets/images/DefaultImages/monster.jpg';
      this.bundleItems = this.bsModalRef.content.bundleItems ? this.bsModalRef.content.bundleItems : [];
      this.ruleSetId = this.bsModalRef.content.rulesetId ? this.bsModalRef.content.rulesetId : this.monsterInfo.ruleSetId;
      this.value = 1;

      this.rulesetService.getCustomDice(this.ruleSetId)
        .subscribe(data => {

          this.customDices = data

        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        })

    }, 0);
  }



  close() {
    this.bsModalRef.hide();
    ///this.destroyModalOnInit();
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  changeCheckbox(event) {
    this.addToCombat = event.target.checked;
  }

  saveCounter() {
    if (this.assignAlly) {
      this.bsModalRef2 = this.modalService.show(AssignToCharacterComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef2.content.rulesetId = this.ruleSetId;
      this.bsModalRef2.content.assignAsAlly = true;
      this.bsModalRef2.content.event.subscribe(id => {
        if (id) {
          this.allyCharacterId = id;
          this.deployMonster();
        } else {
          this.assignAlly = false;
        }
      });
    } else {
      this.allyCharacterId = 0;
      this.deployMonster();
    }
  }

  deployMonster() {
    if (+this.value <= 0) {
      this.alertService.showMessage("Please enter a valid number", "", MessageSeverity.error);
      return false;
    }
    else {
      if (this.monsterInfo.isBundle) {
        this.alertService.startLoadingMessage("", "Deploying Monster Template...");
        let BundleItemsToDeploy: any = [];
        if (this.bundleItems) {
          if (this.bundleItems.length) {
            this.bundleItems.map((b) => {
              let itemQtyCount = +b.quantity;
              for (var i_itemQty = 0; i_itemQty < itemQtyCount; i_itemQty++) {
                let healthNumberArray = [];
                let armorClassNumberArray = [];
                let xpValueNumberArray = [];
                let challangeRatingNumberArray = [];
                var reItems = [];
                if (+this.value) {
                  for (var i = 0; i < this.value; i++) {
                    let health = DiceService.rollDiceExternally(this.alertService, b.monsterTemplate.health ? b.monsterTemplate.health : '0', this.customDices)
                    let armorClass = DiceService.rollDiceExternally(this.alertService, b.monsterTemplate.armorClass ? b.monsterTemplate.armorClass : '0', this.customDices)
                    let xpValue = DiceService.rollDiceExternally(this.alertService, b.monsterTemplate.xpValue ? b.monsterTemplate.xpValue : '0', this.customDices)
                    let challangeRating = DiceService.rollDiceExternally(this.alertService, b.monsterTemplate.challangeRating ? b.monsterTemplate.challangeRating : '0', this.customDices)
                    
                    healthNumberArray.push(health);
                    armorClassNumberArray.push(armorClass);
                    xpValueNumberArray.push(xpValue);
                    challangeRatingNumberArray.push(challangeRating);

                    if (b.monsterTemplate.isRandomizationEngine) {

                      let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(b.monsterTemplate.randomizationEngine);

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

                BundleItemsToDeploy.push({
                  qty: this.value,
                  monsterTemplateId: b.monsterTemplateId,
                  rulesetId: this.ruleSetId,
                  healthCurrent: healthNumberArray,
                  healthMax: healthNumberArray,
                  armorClass: armorClassNumberArray,
                  xpValue: xpValueNumberArray,
                  challangeRating: challangeRatingNumberArray,
                  addToCombat: this.addToCombat,
                  isBundle: this.monsterInfo.isBundle,
                  reItems: reItems,
                  characterId: this.allyCharacterId
                });
              }
            });
          }
        }
        this.monsterTemplateService.addMonster(BundleItemsToDeploy)
          .subscribe(data => {
            this.alertService.stopLoadingMessage();
            this.alertService.showMessage("Monster Group has been deployed successfully.", "", MessageSeverity.success);
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
        let healthNumberArray = [];
        let armorClassNumberArray = [];
        let xpValueNumberArray = [];
        let challangeRatingNumberArray = [];
        var reItems = [];
        if (+this.value) {
          for (var i = 0; i < this.value; i++) {
            let health = DiceService.rollDiceExternally(this.alertService, this.monsterInfo.health ? this.monsterInfo.health : '0', this.customDices)
            let armorClass = DiceService.rollDiceExternally(this.alertService, this.monsterInfo.armorClass ? this.monsterInfo.armorClass : '0', this.customDices)
            let xpValue = DiceService.rollDiceExternally(this.alertService, this.monsterInfo.xpValue ? this.monsterInfo.xpValue : '0', this.customDices)
            let challangeRating = DiceService.rollDiceExternally(this.alertService, this.monsterInfo.challangeRating ? this.monsterInfo.challangeRating : '0', this.customDices)

            //////889
            try {
              if (this.monsterInfo && this.monsterInfo.monsterTemplateCurrency) {
                this.monsterInfo.monsterTemplateCurrency.map(currency => {
                  if (currency.command) {
                    currency.amount = currency.command ? DiceService.rollDiceExternally(this.alertService, currency.command, this.customDices) : 0;
                  }
                });
              }
            } catch (ex) {

            }

            healthNumberArray.push(health);
            armorClassNumberArray.push(armorClass);
            xpValueNumberArray.push(xpValue);
            challangeRatingNumberArray.push(challangeRating);

            if (this.monsterInfo.isRandomizationEngine) {
              let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(this.monsterInfo.randomizationEngine);

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

        let deployMonsterInfo = {
          qty: this.value,
          monsterTemplateId: this.monsterInfo.monsterTemplateId,
          rulesetId: this.ruleSetId,
          healthCurrent: healthNumberArray,
          healthMax: healthNumberArray,
          armorClass: armorClassNumberArray,
          xpValue: xpValueNumberArray,
          challangeRating: challangeRatingNumberArray,
          addToCombat: this.addToCombat,
          isBundle: this.monsterInfo.isBundle,
          reItems: reItems,
          monsterCurrency: this.monsterInfo.monsterTemplateCurrency,
          characterId: this.allyCharacterId
        }
        this.alertService.startLoadingMessage("", "Deploying Monster Template...");
        this.monsterTemplateService.deployMonster<any>(deployMonsterInfo)
          .subscribe(data => {
            this.alertService.stopLoadingMessage();
            let message = "Monster Template has been deployed successfully.";
            //if (data !== "" && data !== null && data !== undefined && isNaN(parseInt(data))) message = data;
            this.alertService.showMessage(message, "", MessageSeverity.success);
            this.close()
          }, error => {
            this.alertService.stopLoadingMessage();
            this.isLoading = false;
            let _message = "Unable to deploy ";
            let Errors = Utilities.ErrorDetail(_message, error);
            //let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              this.authService.logout(true);
            }
          }, () => { });


      }
    }
  }

  increment() {
    let step: number = 1;
    this.value += step;
  }

  decrement() {
    let step: number = 1;
    if (this.value == 1) {
      return false;
    } else {
      this.value -= step;
    }
  }



  changeCurrentValue(event: any) {
    let value = +event.target.value;
  }


  mouseDown(type) {
    let time = new Date();
    time.setMilliseconds(time.getMilliseconds() + 600); //600 miliseconds delay to start the numbering
    this.isMouseDown = true;
    this.interval = setInterval(() => {
      if (time < new Date()) {
        if (this.isMouseDown) {
          if (type === -1)//Decrement
          {
            this.decrement();
          }
          if (type === 1)//Increment
          {
            this.increment();
          }
        }
      }
    }, 50);
  }
  mouseUp() {
    this.isMouseDown = false;
    clearInterval(this.interval);
    this.interval = undefined;
  }

  assignAsAlly(event) {
    this.assignAlly = event.target.checked;    
  }

}
