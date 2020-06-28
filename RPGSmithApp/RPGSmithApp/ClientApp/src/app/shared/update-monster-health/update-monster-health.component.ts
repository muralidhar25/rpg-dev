import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { combatantType, MonsterDetailType } from '../../core/models/enums';
import { CustomDice } from '../../core/models/view-models/custome-dice.model';
import { CombatService } from '../../core/services/combat.service';
import { Utilities } from '../../core/common/utilities';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-update-monster-health',
  templateUrl: './update-monster-health.component.html',
  styleUrls: ['./update-monster-health.component.scss']
})
export class UpdateMonsterHealthComponent implements OnInit {

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
  DummyValueForCharHealthStat: number = -9999;
  monsterName: string;
  monsterDetailType = MonsterDetailType;

  public event: EventEmitter<any> = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.saveCounter();
    }
  }

  constructor(private bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private alertService: AlertService,
    private location: PlatformLocation,
    private combatService: CombatService,
    private authService: AuthService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {

      this.title = this.bsModalRef.content.title;
      this.monsterImage = this.combatInfo.monster.imageUrl;
      this.monsterName = this.combatInfo.monster.name;
      //combatInfo
      this.combatInfo = this.bsModalRef.content.combatInfo;
      //if (this.combatInfo.type == combatantType.CHARACTER) {
      //  this.healthCurrent = this.combatInfo.character.healthCurrent;
      //  this.healthMax = this.combatInfo.character.healthMax;
      //}

      if (this.title == MonsterDetailType.HEALTH) {
        this.healthCurrent = +this.combatInfo.monster.healthCurrent;
        this.healthMax = +this.combatInfo.monster.healthMax;
      }

      //title == monsterDetailType.RATING || title == monsterDetailType.ARMOR || title == monsterDetailType.XPVALUE || title == monsterDetailType.INITIATIVE
      if (this.title == MonsterDetailType.RATING) {
        this.healthCurrent = +this.combatInfo.monster.challangeRating;
      }
      else if (this.title == MonsterDetailType.ARMOR) {
        this.healthCurrent = +this.combatInfo.monster.armorClass;
      }
      else if (this.title == MonsterDetailType.INITIATIVE) {
        this.healthCurrent = +this.combatInfo.initiative;
      }
      else if (this.title == MonsterDetailType.XPVALUE) {
        this.healthCurrent = this.combatInfo.monster.xpValue;
      }


    }, 10);
  }



  close() {
    this.bsModalRef.hide();
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }



  saveCounter() {
    //if (this.combatInfo.type == combatantType.CHARACTER) {
    //  this.combatInfo.character.healthCurrent = this.healthCurrent;
    //  this.combatInfo.character.healthMax = this.healthMax;
    //  this.event.emit(this.combatInfo);
    //  this.SaveCharacterHealth(this.combatInfo.character);
    //}
    if (this.combatInfo.type == combatantType.MONSTER && this.title == MonsterDetailType.HEALTH) {
      this.combatInfo.monster.healthCurrent = this.healthCurrent;
      this.combatInfo.monster.healthMax = this.healthMax;
      this.event.emit({ type: MonsterDetailType.HEALTH, record: this.combatInfo });
      this.SaveMonsterHealth(this.combatInfo.monster);
    }
    else if (this.title == MonsterDetailType.RATING) {
      this.combatInfo.monster.challangeRating = this.healthCurrent;
      this.event.emit({ type: MonsterDetailType.RATING, record: this.combatInfo });
      this.UpdateMonsterDetails(this.combatInfo, this.title);
    }
    else if (this.title == MonsterDetailType.ARMOR) {
      this.combatInfo.monster.armorClass = this.healthCurrent;
      this.event.emit({ type: MonsterDetailType.ARMOR, record: this.combatInfo });
      this.UpdateMonsterDetails(this.combatInfo, this.title);
    }
    else if (this.title == MonsterDetailType.INITIATIVE) {
      this.combatInfo.initiative = this.healthCurrent;
      this.event.emit({ type: MonsterDetailType.INITIATIVE, record: this.combatInfo });
      this.UpdateMonsterDetails(this.combatInfo, this.title);
    }
    else if (this.title == MonsterDetailType.XPVALUE) {
      this.combatInfo.monster.xpValue = this.healthCurrent;
      this.event.emit({ type: MonsterDetailType.XPVALUE, record: this.combatInfo });
      this.UpdateMonsterDetails(this.combatInfo, this.title);
    }

    this.close();
  }

  UpdateMonsterDetails(combat, type) {
    this.isLoading = true;
    this.combatService.updateMonsterDetails(combat, type).subscribe(res => {
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

  SaveCharacterHealth(characterHealth) {
    // this.isLoading = true;
    //// let CCStatId = this.combatInfo.character.healthStatId;
    // this.combatService.saveCharacterHealth(characterHealth).subscribe(res => {
    //  //let result = res;
    //   this.isLoading = false;
    // }, error => {
    //   this.isLoading = false;
    //   let Errors = Utilities.ErrorDetail("", error);
    //   if (Errors.sessionExpire) {
    //     this.authService.logout(true);
    //   } else {
    //     this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
    //   }
    // });
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
    this.healthCurrent += step;
  }

  decrementhealthcurr() {
    let step: number = 1;
    if (this.title == MonsterDetailType.HEALTH) {
      this.healthCurrent -= step;
    } else {
      if (this.healthCurrent == 1) {
        return false;
      } else {
        this.healthCurrent -= step;
      }
    }
  }

  incrementHealthMax() {
    let step: number = 1;
    this.healthMax += step;
  }

  decrementHealthMax() {
    let step: number = 1;
    if (this.title == MonsterDetailType.HEALTH) {
      this.healthMax -= step;
    } else {
      if (this.healthMax == 1) {
        return false;
      } else {
        this.healthMax -= step;
      }
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

}
