import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { PlatformLocation } from '@angular/common';
import { Utilities } from '../../../core/common/utilities';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { CombatService } from '../../../core/services/combat.service';
import { combatantType, STAT_TYPE } from '../../../core/models/enums';

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
  monsterName: string;
  title: string;
  combatInfo: any;
  addToCombat: boolean = false;
  customDices: CustomDice[] = [];
  healthCurrent: any;
  healthMax: any;
  DummyValueForCharHealthStat: number = -9999;
  characterStatTypeId: number;
  healthCurrentAdjust: number;
  healthMaxAdjust: number;
  resetHealthCurrentMax: number;
  resetHealthMax: number;

  public event: EventEmitter<any> = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.saveCounter();
    }
    if (event.keyCode === 109) {  //key press "-"
      if (this.healthCurrentAdjust) {
        this.AdjustHealthCurr(true, this.healthCurrentAdjust)
      }
      if (this.healthMaxAdjust) {
        this.AdjustHealthMax(true, this.healthMaxAdjust)
      }
    }
    if (event.keyCode === 107) { //key press "+"
      if (this.healthCurrentAdjust) {
        this.AdjustHealthCurr(false, this.healthCurrentAdjust)
      }
      if (this.healthMaxAdjust) {
        this.AdjustHealthMax(false, this.healthMaxAdjust)
      }
    }
  }

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
    private alertService: AlertService, private authService: AuthService,
    private location: PlatformLocation, private combatService: CombatService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;

      //combatInfo
      this.combatInfo = this.bsModalRef.content.combatInfo;
      if (this.combatInfo.type == combatantType.CHARACTER) {
        this.monsterImage = this.combatInfo.character.imageUrl;
        this.monsterName = this.combatInfo.character.characterName;
        this.healthCurrent = this.combatInfo.character.healthCurrent;
        this.healthMax = this.combatInfo.character.healthMax;
        this.resetHealthCurrentMax = this.combatInfo.character.healthMax;
        this.characterStatTypeId = this.combatInfo.character.charStat.characterStat.characterStatTypeId;
      }
      else if (this.combatInfo.type == combatantType.MONSTER) {
        this.monsterImage = this.combatInfo.monster.imageUrl;
        this.monsterName = this.combatInfo.monster.name;
        this.healthCurrent = this.combatInfo.monster.healthCurrent;
        this.healthMax = this.combatInfo.monster.healthMax;
        this.resetHealthCurrentMax = this.combatInfo.monster.healthMax;
      }
      ///////////////////////////////////////////////////////

      //this.value = 1;

      //this.rulesetService.getCustomDice(this.monsterInfo.ruleSetId)
      //  .subscribe(data => {
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
    if (this.combatInfo.type == combatantType.CHARACTER) {
      this.combatInfo.character.healthCurrent = this.healthCurrent;
      this.combatInfo.character.healthMax = this.healthMax;
      this.event.emit(this.combatInfo);
      //this.SaveCharacterHealth(this.combatInfo.character);
      let obj: any = this.combatInfo.character.charStat.characterStat;
      let DefaultValuesList: any = obj.characterStatDefaultValues;
      switch (this.characterStatTypeId) {
        case STAT_TYPE.Number:
          let nummax = 0;
          let nummin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              nummax = DefaultValuesList[0].maximum;
              nummin = DefaultValuesList[0].minimum;
            }
          }

          if (!(nummax == 0 && nummin == 0)) {
            if (parseInt(this.healthCurrent) >= nummin && parseInt(this.healthCurrent) <= nummax) {
              this.combatInfo.character.healthCurrent = +this.healthCurrent;
              this.SaveCharacterHealth(this.combatInfo.character);
            }
            else {
              this.alertService.showMessage("", "The value for this field must be between " + nummin + " and " + nummax + " value.", MessageSeverity.error);
              return false;
            }
          }
          else {
            this.combatInfo.character.healthCurrent = this.healthCurrent == null ? null : +this.healthCurrent;
            this.SaveCharacterHealth(this.combatInfo.character);
          }

          break;
        case STAT_TYPE.CurrentMax:
          let curmax = 0;
          let curmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              curmax = DefaultValuesList[0].maximum;
              curmin = DefaultValuesList[0].minimum;
            }
          }

          let maxmax = 0;
          let maxmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              maxmax = DefaultValuesList[1].maximum;
              maxmin = DefaultValuesList[1].minimum;
            }
          }
          let valid = true;


          if (!(curmax == 0 && curmin == 0)) {
            if (parseInt(this.healthCurrent) >= curmin && parseInt(this.healthCurrent) <= curmax) {
              //this.updateStatService(charactersCharacterStat);
            }
            else {
              this.alertService.showMessage("", "The max value for Current field must be between " + maxmin + " and " + maxmax + " value.", MessageSeverity.error);
              return false;

            }
          }
          if (!(maxmax == 0 && maxmin == 0)) {
            if (parseInt(this.healthMax) >= maxmin && parseInt(this.healthMax) <= maxmax) {
              //this.updateStatService(charactersCharacterStat);
            }
            else {
              this.alertService.showMessage("", "The max value for this Healthmax must be between " + maxmin + " and " + maxmax + " value.", MessageSeverity.error);
              return false;
            }
          }
          if (!(maxmax == 0 && maxmin == 0)) {
            if (parseInt(this.healthMax) >= parseInt(this.healthCurrent)) {
              //this.updateStatService(charactersCharacterStat);
            }
            else {
              this.alertService.showMessage("", "The Health Max value " + this.healthMax + " must be Greater then Health current" + this.healthCurrent + " value.", MessageSeverity.error);
              return false;
            }
          }
          if (valid) {
            this.combatInfo.character.healthCurrent = +this.healthCurrent;
            this.combatInfo.character.healthMax = +this.healthMax;
            this.SaveCharacterHealth(this.combatInfo.character);
          }
          break;
        case STAT_TYPE.ValueSubValue:
          let valmax = 0;
          let valmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              valmax = DefaultValuesList[0].maximum;
              valmin = DefaultValuesList[0].minimum;
            }
          }
          let submax = 0;
          let submin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              submax = DefaultValuesList[1].maximum;
              submin = DefaultValuesList[1].minimum;
            }
          }

          let validval = true;
          if (!(valmax == 0 && valmin == 0)) {
            if (parseInt(this.healthCurrent) >= valmin && parseInt(this.healthCurrent) <= valmax) {
              //this.updateStatService(charactersCharacterStat);
            }
            else {
              this.alertService.showMessage("", "The value for this field must be between " + valmin + " and " + valmax + " value.", MessageSeverity.error);
              validval = false;
            }
          }

          if (!(submax == 0 && submin == 0)) {
            if (parseInt(this.healthMax) >= submin && parseInt(this.healthMax) <= submax) {
              //this.updateStatService(charactersCharacterStat);
            }
            else {
              this.alertService.showMessage("", "The sub value for this field must be between " + submin + " and " + submax + " value.", MessageSeverity.error);
              validval = false;
            }
          }

          if (validval) {
            this.combatInfo.character.healthCurrent = +this.healthCurrent;
            this.combatInfo.character.healthMax = +this.healthMax;
            this.SaveCharacterHealth(this.combatInfo.character);
          }
          break;
        case STAT_TYPE.Combo:
          let max = this.combatInfo.character.charStat.maximum;
          let min = this.combatInfo.character.charStat.minimum;
          this.combatInfo.character.healthCurrent = +this.healthCurrent;
          if (!(max == 0 && min == 0)) {
            if (parseInt(this.healthCurrent) >= min && parseInt(this.healthCurrent) <= max) {
              this.SaveCharacterHealth(this.combatInfo.character);
            }
            else {
              this.alertService.showMessage("", "The value for this field must be between " + min + " and " + max + " value.", MessageSeverity.error);
              return false;
            }
          }
          else {
            this.SaveCharacterHealth(this.combatInfo.character);
          }
          break;
      }
    }
    else if (this.combatInfo.type == combatantType.MONSTER) {
      this.combatInfo.monster.healthCurrent = this.healthCurrent;
      this.combatInfo.monster.healthMax = this.healthMax;
      this.event.emit(this.combatInfo);
      this.SaveMonsterHealth(this.combatInfo.monster);
    }


    this.close();
  }

  SaveCharacterHealth(characterHealth) {
    this.isLoading = true;
    // let CCStatId = this.combatInfo.character.healthStatId;
    this.combatService.saveCharacterHealth(characterHealth).subscribe(res => {
      //let result = res;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  SaveMonsterHealth(monsterHealth) {
    this.isLoading = true;
    this.combatService.saveMonsterHealth(monsterHealth).subscribe(res => {
      //let result = res;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  incrementhealthcurr() {
    let step: number = 1;

    if (this.combatInfo.type == combatantType.CHARACTER) {
      let obj: any = this.combatInfo.character.charStat.characterStat;
      let DefaultValuesList: any = obj.characterStatDefaultValues;
      switch (this.characterStatTypeId) {
        case STAT_TYPE.Number:
          let nummax = 0;
          let nummin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              nummax = DefaultValuesList[0].maximum;
              nummin = DefaultValuesList[0].minimum;
            }
          }
          if (!(nummax == 0 && nummin == 0)) {
            if (parseInt(this.healthCurrent) >= nummin && parseInt(this.healthCurrent) < nummax) {
              this.healthCurrent = (parseInt(this.healthCurrent) + 1).toString();
            }
            else {
              this.healthCurrent = (parseInt(this.healthCurrent)).toString();
            }
          }
          else {
            this.healthCurrent = (parseInt(this.healthCurrent) + 1).toString();
          }
          break;
        case STAT_TYPE.CurrentMax:
          //type ===== 1
          let curmax = 0;
          let curmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              curmax = DefaultValuesList[0].maximum;
              curmin = DefaultValuesList[0].minimum;
            }
          }
          if (!(curmax == 0 && curmin == 0)) {
            if (parseInt(this.healthCurrent) >= curmin && parseInt(this.healthCurrent) < curmax) {
              this.healthCurrent = (parseInt(this.healthCurrent) + 1).toString();
            }
            else {
              this.healthCurrent = (parseInt(this.healthCurrent)).toString();
            }
          }
          else {
            this.healthCurrent = (parseInt(this.healthCurrent) + 1).toString();
          }
          break;
        case STAT_TYPE.ValueSubValue:
          let valmax = 0;
          let valmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              valmax = DefaultValuesList[0].maximum;
              valmin = DefaultValuesList[0].minimum;
            }
          }

          if (!(valmax == 0 && valmin == 0)) {
            if (parseInt(this.healthCurrent) >= valmin && parseInt(this.healthCurrent) < valmax) {
              this.healthCurrent = (parseInt(this.healthCurrent) + 1).toString();
            }
            else {
              this.healthCurrent = (parseInt(this.healthCurrent)).toString();
            }
          }
          else {
            this.healthCurrent = (parseInt(this.healthCurrent) + 1).toString();
          }
          break;
        case STAT_TYPE.Combo:
          let max = this.combatInfo.character.charStat.maximum;
          let min = this.combatInfo.character.charStat.minimum;
          if (!(max == 0 && min == 0)) {
            if (parseInt(this.healthCurrent) >= min && parseInt(this.healthCurrent) < max) {
              this.healthCurrent = (parseInt(this.healthCurrent) + 1).toString();
            }
            else {
              this.healthCurrent = (parseInt(this.healthCurrent)).toString();
            }
          }
          else {
            this.healthCurrent = (parseInt(this.healthCurrent) + 1).toString();
          }
          break;
      }
    }
    else {
      this.healthCurrent += step;
    }
  }

  decrementhealthcurr() {
    let step: number = 1;
    if (this.combatInfo.type == combatantType.CHARACTER) {
      let obj: any = this.combatInfo.character.charStat.characterStat;
      let DefaultValuesList: any = obj.characterStatDefaultValues;

      switch (this.characterStatTypeId) {
        case STAT_TYPE.Number:
          let nummax = 0;
          let nummin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              nummax = DefaultValuesList[0].maximum;
              nummin = DefaultValuesList[0].minimum;
            }
          }
          if (!(nummax == 0 && nummin == 0)) {
            if (parseInt(this.healthCurrent) > nummin && parseInt(this.healthCurrent) <= nummax) {
              this.healthCurrent = (parseInt(this.healthCurrent) - 1).toString();
            }
            else {
              this.healthCurrent = (parseInt(this.healthCurrent)).toString();
            }
          }
          else {
            this.healthCurrent = (parseInt(this.healthCurrent) - 1).toString();
          }
          break;
        case STAT_TYPE.CurrentMax:
          let curmax = 0;
          let curmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              curmax = DefaultValuesList[0].maximum;
              curmin = DefaultValuesList[0].minimum;
            }
          }
          if (!(curmax == 0 && curmin == 0)) {
            if (parseInt(this.healthCurrent) > curmin && parseInt(this.healthCurrent) <= curmax) {
              this.healthCurrent = (parseInt(this.healthCurrent) - 1).toString();
            }
            else {
              this.healthCurrent = (parseInt(this.healthCurrent)).toString();
            }
          }
          else {
            this.healthCurrent = (parseInt(this.healthCurrent) - 1).toString();
          }
          break;
        case STAT_TYPE.ValueSubValue:
          let valmax = 0;
          let valmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              valmax = DefaultValuesList[0].maximum;
              valmin = DefaultValuesList[0].minimum;
            }
          }
          if (!(valmax == 0 && valmin == 0)) {
            if (parseInt(this.healthCurrent) > valmin && parseInt(this.healthCurrent) <= valmax) {
              this.healthCurrent = (parseInt(this.healthCurrent) - 1).toString();
            }
            else {
              this.healthCurrent = (parseInt(this.healthCurrent)).toString();
            }
          }
          else {
            this.healthCurrent = (parseInt(this.healthCurrent) - 1).toString();
          }
          break;
        case STAT_TYPE.Combo:
          let max = this.combatInfo.character.charStat.maximum;
          let min = this.combatInfo.character.charStat.minimum;
          if (!(max == 0 && min == 0)) {
            if (parseInt(this.healthCurrent) > min && parseInt(this.healthCurrent) <= max) {
              this.healthCurrent = (parseInt(this.healthCurrent) - 1).toString();
            }
            else {
              this.healthCurrent = (parseInt(this.healthCurrent)).toString();
            }
          }
          else {
            this.healthCurrent = (parseInt(this.healthCurrent) - 1).toString();
          }
          break;
      }
    }
    else {
      //if (this.healthCurrent == 1) {
      //  return false;
      //} else {
      this.healthCurrent -= step;
      //}
    }
  }


  incrementHealthMax() {
    let step: number = 1;
    if (this.combatInfo.type == combatantType.CHARACTER) {
      let obj: any = this.combatInfo.character.charStat.characterStat;
      let DefaultValuesList: any = obj.characterStatDefaultValues;
      switch (this.characterStatTypeId) {
        case STAT_TYPE.CurrentMax:
          //type=====2
          let maxmax = 0;
          let maxmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              maxmax = DefaultValuesList[1].maximum;
              maxmin = DefaultValuesList[1].minimum;
            }
          }
          if (!(maxmax == 0 && maxmin == 0)) {
            if (parseInt(this.healthMax) >= maxmin && parseInt(this.healthMax) < maxmax) {
              this.healthMax = (parseInt(this.healthMax) + 1).toString();
            }
            else {
              this.healthMax = (parseInt(this.healthMax)).toString();
            }
          }
          else {
            this.healthMax = (parseInt(this.healthMax) + 1).toString();
          }
          break;
        case STAT_TYPE.ValueSubValue:
          // type =========== 2
          let submax = 0;
          let submin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              submax = DefaultValuesList[1].maximum;
              submin = DefaultValuesList[1].minimum;
            }
          }
          if (!(submax == 0 && submin == 0)) {
            if (parseInt(this.healthMax) >= submin && parseInt(this.healthMax) < submax) {
              this.healthMax = (parseInt(this.healthMax) + 1).toString();
            }
            else {
              this.healthMax = (parseInt(this.healthMax)).toString();
            }
          }
          else {
            this.healthMax = (parseInt(this.healthMax) + 1).toString();
          }
          break;
      }
    }
    else {

      this.healthMax += step;
    }
  }

  decrementHealthMax() {
    let step: number = 1;
    if (this.combatInfo.type == combatantType.CHARACTER) {
      let obj: any = this.combatInfo.character.charStat.characterStat;
      let DefaultValuesList: any = obj.characterStatDefaultValues;

      switch (this.characterStatTypeId) {
        case STAT_TYPE.CurrentMax:
          let maxmax = 0;
          let maxmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              maxmax = DefaultValuesList[1].maximum;
              maxmin = DefaultValuesList[1].minimum;
            }
          }
          if (!(maxmax == 0 && maxmin == 0)) {
            if (parseInt(this.healthMax) > maxmin && parseInt(this.healthMax) <= maxmax) {
              this.healthMax = (parseInt(this.healthMax) - 1).toString();
            }
            else {
              this.healthMax = (parseInt(this.healthMax)).toString();
            }
          }
          else {
            this.healthMax = (parseInt(this.healthMax) - 1).toString();
          }
          break;
        case STAT_TYPE.ValueSubValue:
          let submax = 0;
          let submin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              submax = DefaultValuesList[1].maximum;
              submin = DefaultValuesList[1].minimum;
            }
          }
          if (!(submax == 0 && submin == 0)) {
            if (parseInt(this.healthMax) > submin && parseInt(this.healthMax) <= submax) {
              this.healthMax = (parseInt(this.healthMax) - 1).toString();
            }
            else {
              this.healthMax = (parseInt(this.healthMax)).toString();
            }
          }
          else {
            this.healthMax = (parseInt(this.healthMax) - 1).toString();
          }
          break;
      }
    }
    else {
      //if (this.healthMax == 1) {
      //  return false;
      //} else {
      this.healthMax -= step;
      //}
    }

  }

  changeHealthMax(event: any) {
    //this.healthCurrent = +event.target.value;
  }


  changeHealthCurrent(event: any) {
    //this.healthMax = +event.target.value;
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

  AdjustHealthCurr(isMinus, value) {
    if (value == undefined) {
      this.alertService.showMessage("", "The value for this field can't empty! ", MessageSeverity.error);
      return false;
    }
    else {
      if (isMinus) {
        //decrement
        //if (this.healthCurrent > value) {
        this.healthCurrent = this.healthCurrent - value;
        this.healthCurrentAdjust = undefined;
        //}
      } else {
        //increment
        this.healthCurrent = this.healthCurrent + value;
        this.healthCurrentAdjust = undefined;
      }
    }
  }

  AdjustHealthMax(isMinus, value) {
    if (value == undefined) {
      this.alertService.showMessage("", "The value for this field can't empty! ", MessageSeverity.error);
      return false;
    }
    else {
      if (isMinus) {
        //decrement
        //if (this.healthMax > value) {
        this.healthMax = this.healthMax - value;
        this.healthMaxAdjust = undefined;
        //}
      } else {
        //increment
        this.healthMax = this.healthMax + value;
        this.healthMaxAdjust = undefined;
      }
    }
  }

  resetHealth(isCurrent) {
    if (isCurrent) {
      this.healthCurrent = this.healthMax;
    }
  }
}
