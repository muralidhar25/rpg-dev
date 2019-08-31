import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { PlatformLocation } from '@angular/common';
import { Utilities } from '../../../core/common/utilities';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { CombatService } from '../../../core/services/combat.service';
import { combatantType } from '../../../core/models/enums';

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
  DummyValueForCharHealthStat: number = -9999

  public event: EventEmitter<any> = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.saveCounter();
    }
  }

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
    private alertService: AlertService, private authService: AuthService,
    private location: PlatformLocation, private combatService:CombatService) {
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
      }
      else if (this.combatInfo.type == combatantType.MONSTER) {
      this.monsterImage = this.combatInfo.monster.imageUrl;
      this.monsterName = this.combatInfo.monster.name;
        this.healthCurrent = this.combatInfo.monster.healthCurrent;
        this.healthMax = this.combatInfo.monster.healthMax;
      }
      //this.healthCurrent=this.combatInfo.monster.healthCurrent;
      //this.healthMax=this.combatInfo.monster.healthMax;
      ///////////////////////////////////////////////////////
      
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
    if (this.combatInfo.type == combatantType.CHARACTER) {
      this.combatInfo.character.healthCurrent = this.healthCurrent;
      this.combatInfo.character.healthMax = this.healthMax;
      this.event.emit(this.combatInfo);
      this.SaveCharacterHealth(this.combatInfo.character);
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
      let step: number =  1;
    this.healthCurrent += step;
  }

  decrementhealthcurr() {
    let step: number = 1;
    //if (this.healthCurrent == 1) {
    //  return false;
    //} else {
      this.healthCurrent -= step;
    //}
  }


  incrementHealthMax() {
    let step: number = 1;
    this.healthMax += step;
  }

  decrementHealthMax() {
    let step: number = 1;
    //if (this.healthMax == 1) {
    //  return false;
    //} else {
      this.healthMax -= step;
    //}
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
