import { Component, OnInit, EventEmitter } from '@angular/core';
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
  selector: 'app-combat-health-monster',
  templateUrl: './update-combat-health.component.html',
  styleUrls: ['./update-combat-health.component.scss']
})
export class CombatHealthComponent implements OnInit {
   
  value: number;
  isLoading: boolean = false;
  isMouseDown: boolean = false;
  interval: any;
  monsterImage: any;
  title: string;
  combatInfo: any;
  addToCombat: boolean = false;
  customDices: CustomDice[] = [];
  healthCurrent: any;
  healthMax: any;

  public event: EventEmitter<any> = new EventEmitter();

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
    private colorService: ColorService, private localStorage: LocalStoreManager, private counterTileService: CounterTileService,
    private alertService: AlertService, private authService: AuthService, private location: PlatformLocation,
    private monsterTemplateService: MonsterTemplateService, private rulesetService: RulesetService, ) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      debugger
      this.title = this.bsModalRef.content.title;

      //combatInfo
      this.combatInfo = this.bsModalRef.content.combatInfo;
      this.healthCurrent=this.combatInfo.monster.healthCurrent;
      this.healthMax=this.combatInfo.monster.healthMax;
      
      //this.value = 1;
      
      //this.rulesetService.getCustomDice(this.monsterInfo.ruleSetId)
      //  .subscribe(data => {
      //    debugger
      //    this.customDices = data

      //  }, error => {
      //    let Errors = Utilities.ErrorDetail("", error);
      //    if (Errors.sessionExpire) {
      //      this.authService.logout(true);
      //    }
      //  })
      
    }, 10);
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

 

  saveCounter() {
    this.combatInfo.monster.healthCurrent = this.healthCurrent;
    this.combatInfo.monster.healthMax = this.healthMax;
    this.event.emit(this.combatInfo);
  }



  incrementhealthcurr() {
      let step: number =  1;
    this.combatInfo.healthCurrent += step;
  }

  decrementhealthcurr() {
    let step: number = 1;
    if (this.combatInfo.healthCurrent == 1) {
      return false;
    } else {
      this.combatInfo.healthCurrent -= step;
    }
  }


  incrementHealthMax() {
    let step: number = 1;
    this.combatInfo.healthMax += step;
  }

  decrementHealthMax() {
    let step: number = 1;
    if (this.combatInfo.healthMax == 1) {
      return false;
    } else {
      this.combatInfo.healthMax -= step;
    }
  }

  changeHealthMax(event: any) {
    let value = +event.target.value;
  }


  changeHealthCurrent(event: any) {
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
            this.decrementhealthcurr();
          }
          if (type === 1)//Increment
          {
            this.incrementhealthcurr();
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

  mouseDownHealthMax(type) {
    let time = new Date();
    time.setMilliseconds(time.getMilliseconds() + 600); //600 miliseconds delay to start the numbering
    this.isMouseDown = true;
    this.interval = setInterval(() => {
      if (time < new Date()) {
        if (this.isMouseDown) {
          if (type === -1)//Decrement
          {
            this.decrementHealthMax();
          }
          if (type === 1)//Increment
          {
            this.incrementHealthMax();
          }
        }
      }
    }, 50);
  }
  mouseUpHealthMax() {
    this.isMouseDown = false;
    clearInterval(this.interval);
    this.interval = undefined;
  }

}
