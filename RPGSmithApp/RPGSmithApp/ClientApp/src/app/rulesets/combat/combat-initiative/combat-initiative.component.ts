import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { initiative } from '../../../core/models/view-models/initiative.model';
import { DiceService } from '../../../core/services/dice.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { CombatItemsType, combatantType } from '../../../core/models/enums';
import { CombatService } from '../../../core/services/combat.service';
import { setTimeout } from 'timers';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
import { SharedService } from '../../../core/services/shared.service';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { ServiceUtil } from '../../../core/services/service-util';
@Component({
  selector: 'app-combat-initiative-monster',
  templateUrl: './combat-initiative.component.html',
  styleUrls: ['./combat-initiative.component.scss']
})
export class CombatInitiativeComponent implements OnInit {

  ruleSetId: number;
  initiative: initiative = new initiative();
  initiativeInfo = [];
  isLoading: boolean = false;
  combatItemsType = CombatItemsType;
  customDices: CustomDice[] = [];
  combatSettings: any;
  isInitialForCombatStart: boolean = false;
  constructor(
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private alertService: AlertService,
    private combatService: CombatService,
    private authService: AuthService,
    private sharedService: SharedService) {
    
  }

  ngOnInit() {
    setTimeout(() => {
      
      this.customDices = Object.assign([], this.bsModalRef.content.customDices);
      this.initiativeInfo = Object.assign([], this.bsModalRef.content.combatants);
      this.combatSettings = Object.assign({}, this.bsModalRef.content.settings);
      this.isInitialForCombatStart =this.bsModalRef.content.isInitialForCombatStart
      this.GetCombatantList();
    }, 0);
  }

  GetCombatantList() {
    
    if (this.isInitialForCombatStart) {
      this.initiativeInfo.map(pc => {
        if (pc.type == this.combatItemsType.CHARACTER) {
          debugger
          if (this.combatSettings && this.combatSettings.rollInitiativeForPlayer) {
            pc.initiativeCommand = this.combatSettings.pcInitiativeFormula;


            //if (pc.type == combatantType.CHARACTER) {
            let initiativecommand = pc.initiativeCommand
            let statdetails = { charactersCharacterStat: pc.character.diceRollViewModel.charactersCharacterStats, character: pc.character.diceRollViewModel.character };
            initiativecommand = ServiceUtil.getFinalCalculationString(this.combatSettings.pcInitiativeFormula, statdetails, pc.character.diceRollViewModel.charactersCharacterStats, pc.character.diceRollViewModel.character)
            //}

            let res = DiceService.rollDiceExternally(this.alertService, initiativecommand, this.customDices);
            if (isNaN(res)) {
              pc.initiativeValue = '';
            } else {
              pc.initiativeValue = res;
            }
          }
          else {
            pc.initiativeCommand = '';
            pc.initiativeValue = '';
          }
        }
        else {
          if (this.combatSettings && this.combatSettings.groupInitiative) {
            pc.initiativeCommand = this.combatSettings.groupInitFormula;
          }
          let res = DiceService.rollDiceExternally(this.alertService, pc.initiativeCommand, this.customDices);
          if (isNaN(res)) {
            pc.initiativeValue = '';
          } else {
            pc.initiativeValue = res;
          }
        }

      });
      this.SortInitiativeInfo();
    }
    else {
      this.initiativeInfo.map(pc => {
        if (pc.type == this.combatItemsType.CHARACTER) {
          pc.initiativeCommand = this.combatSettings.pcInitiativeFormula;
        }
      });
    }
    
  }


  close() {
    //this.saveInitiativeDetails();
    ////this.sharedService.updateCombatantList(this.initiativeInfo);
    ////this.bsModalRef.hide();
    this.bsModalRef.hide();
  }

  //Save Initiative Details
  saveInitiativeDetails() {
    
    this.isLoading = true;
    //let combatantList = this.initiativeInfo.map((rec) => {
    //  return {
    //    id: rec.id,
    //    combatId: rec.combatId,
    //    type: rec.type,
    //    characterId: rec.characterId,
    //    monsterId: rec.monsterId,
    //    sortOrder: rec.sortOrder,
    //    initiativeValue: rec.initiativeValue,
    //  };
    //});
    this.initiativeInfo.map((rec) => {
      rec.initiative = rec.initiativeValue ? rec.initiativeValue : 0;
    });
    this.combatService.saveCombatantList(this.initiativeInfo, this.ruleSetId).subscribe(res => {
      
      this.sharedService.updateCombatantList({ combatantList: this.initiativeInfo, isInitialForCombatStart:this.isInitialForCombatStart });
      this.bsModalRef.hide();
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

  //Re-Roll Dice on click
  ReRollDice(item) {
    debugger
    if (item.initiativeCommand) {
      let initiativecommand = item.initiativeCommand;
      if (item.type == combatantType.CHARACTER) {
        
        let statdetails = { charactersCharacterStat: item.character.diceRollViewModel.charactersCharacterStats, character: item.character.diceRollViewModel.character };
        initiativecommand = ServiceUtil.getFinalCalculationString(this.combatSettings.pcInitiativeFormula, statdetails, item.character.diceRollViewModel.charactersCharacterStats, item.character.diceRollViewModel.character)

      }
      let res = DiceService.rollDiceExternally(this.alertService, initiativecommand, this.customDices);
      if (isNaN(res)) {
        item.initiativeValue = 0;
      } else {
        item.initiativeValue = res;
      }
    }
    this.SortInitiativeInfo();
  }

  upclick(index) {
    if (index == 0) {
      return;
    }
    [this.initiativeInfo[index], this.initiativeInfo[index - 1]] = [this.initiativeInfo[index - 1], this.initiativeInfo[index]];
  }

  downclick(index) {
    if (index === this.initiativeInfo.length - 1) {
      return;
    }
    [this.initiativeInfo[index], this.initiativeInfo[index + 1]] = [this.initiativeInfo[index + 1], this.initiativeInfo[index]];
  }

  allCharactersReroll() {
    this.reRoll(CombatItemsType.CHARACTER);

  }
  BothCharcterAndMonster() {
    this.reRoll(CombatItemsType.ALL);
  }
  allMonstersReroll() {
    this.reRoll(CombatItemsType.MONSTER);
  }

  //Re-Roll All Characters & Monsters
  getCommandresults() {
    this.initiativeInfo.map((x) => {
      if (x.initiativeCommand) {
        debugger
        let initiativecommand = x.initiativeCommand;
        if (x.type == combatantType.CHARACTER) {
         
          let statdetails = { charactersCharacterStat: x.character.diceRollViewModel.charactersCharacterStats, character: x.character.diceRollViewModel.character };
          initiativecommand = ServiceUtil.getFinalCalculationString(this.combatSettings.pcInitiativeFormula, statdetails, x.character.diceRollViewModel.charactersCharacterStats, x.character.diceRollViewModel.character)

        }
        let res = DiceService.rollDiceExternally(this.alertService, initiativecommand, this.customDices);
        if (isNaN(res)) {
          x.initiativeValue = 0;
        } else {
          x.initiativeValue = res;
        }
      }
    });
    
      this.SortInitiativeInfo();
   
  }

  //used to reroll  on basis of type
  reRoll(type) {
    
    //Re-Roll All Characters
    if (type == CombatItemsType.CHARACTER) {
      this.initiativeInfo.map((x) => {
        if (x.initiativeCommand && x.type == type) {
          debugger
          let initiativecommand = x.initiativeCommand;
          let statdetails = { charactersCharacterStat: x.character.diceRollViewModel.charactersCharacterStats, character: x.character.diceRollViewModel.character };
          initiativecommand= ServiceUtil.getFinalCalculationString(this.combatSettings.pcInitiativeFormula, statdetails, x.character.diceRollViewModel.charactersCharacterStats, x.character.diceRollViewModel.character)

          let res = DiceService.rollDiceExternally(this.alertService, initiativecommand, this.customDices);
          if (isNaN(res)) {
            x.initiativeValue = 0;
          } else {
            x.initiativeValue = res;
          }
        }
      });
      this.SortInitiativeInfo();
    }
    //Re-Roll All Monsters
    if (type == CombatItemsType.MONSTER) {
      this.initiativeInfo.map((x) => {
        if (x.initiativeCommand && x.type == type) {
          let res = DiceService.rollDiceExternally(this.alertService, x.initiativeCommand, this.customDices);
          if (isNaN(res)) {
            x.initiativeValue = 0;
          } else {
            x.initiativeValue = res;
          }
        }
      });
      this.SortInitiativeInfo();
    }
    //Re-Roll All Characters & Monsters
    if (type == CombatItemsType.ALL) {
      this.getCommandresults();
    }
  }

  //Sort All Characters & Monsters
  SortInitiativeInfo() {
    this.initiativeInfo.sort((a, b) => b.initiativeValue - a.initiativeValue || a.type.localeCompare(b.type));
    this.initiativeInfo.map((rec,rec_index) => {
      rec.sortOrder = rec_index + 1;
    })
  }
  filterList() {
    this.SortInitiativeInfo();
  }
}
