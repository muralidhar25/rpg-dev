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

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
    private colorService: ColorService, private localStorage: LocalStoreManager, private counterTileService: CounterTileService,
    private alertService: AlertService, private authService: AuthService, private location: PlatformLocation,
    private monsterTemplateService: MonsterTemplateService, private rulesetService: RulesetService, ) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;
      this.monsterInfo = this.bsModalRef.content.monsterInfo;
      this.monsterImage = this.monsterInfo.imageUrl;
      this.value = 1;
      debugger
      this.rulesetService.getCustomDice(this.monsterInfo.ruleSetId)
        .subscribe(data => {
          debugger
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
    console.log(event);
    this.addToCombat = event.target.checked;
  }

  saveCounter() {
    let health = DiceService.rollDiceExternally(this.alertService, this.monsterInfo.health ? this.monsterInfo.health : '0', this.customDices)
    let armorClass = DiceService.rollDiceExternally(this.alertService, this.monsterInfo.armorClass ? this.monsterInfo.armorClass : '0', this.customDices)
    let xpValue = DiceService.rollDiceExternally(this.alertService, this.monsterInfo.xpValue ? this.monsterInfo.xpValue : '0', this.customDices)
    let challangeRating = DiceService.rollDiceExternally(this.alertService, this.monsterInfo.challangeRating ? this.monsterInfo.challangeRating : '0', this.customDices)
    let deployMonsterInfo = {
      qty: this.value,
      monsterTemplateId: this.monsterInfo.monsterTemplateId,
      rulesetId: this.monsterInfo.ruleSetId,
      healthCurrent: health,
      healthMax: health,
      armorClass: armorClass ,
      xpValue: xpValue,
      challangeRating: challangeRating,
      addToCombat: this.addToCombat,
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



  increment() {
      let step: number =  1;
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
}
