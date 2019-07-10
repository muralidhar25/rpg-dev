import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { initiative } from '../../../core/models/view-models/initiative.model';
import { DiceService } from '../../../core/services/dice.service';
import { AlertService } from '../../../core/common/alert.service';
import { CombatItemsType } from '../../../core/models/enums';
import { CombatService } from '../../../core/services/combat.service';
import { setTimeout } from 'timers';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
@Component({
  selector: 'app-combat-initiative-monster',
  templateUrl: './combat-initiative.component.html',
  styleUrls: ['./combat-initiative.component.scss']
})
export class CombatInitiativeComponent implements OnInit {

  ruleSetId: number;

  initiative: initiative = new initiative();

  initiativeInfo = [];

  constructor(
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private alertService: AlertService,
    private combatService: CombatService,
    private authService: AuthService) {
    this.initiativeInfo = [
      {
        name: 'Aron',
        initiativeCommand: 'D4',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        initiativeValue: '20',
        type: CombatItemsType.MONSTER,

      },
      {
        name: 'Newton',
        initiativeCommand: 'D4',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        initiativeValue: '1',
        type: CombatItemsType.MONSTER
      },
      {
        name: 'Trelo',
        initiativeCommand: 'D4',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        initiativeValue: '2',
        type: CombatItemsType.CHARACTER
      },
      {
        name: 'Doc',
        initiativeCommand: 'D4',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        initiativeValue: '3',
        type: CombatItemsType.MONSTER
      },
      {
        name: 'Ram',
        initiativeCommand: 'D4',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        initiativeValue: '4',
        type: CombatItemsType.CHARACTER
      },
      {
        name: 'Clark',
        initiativeCommand: 'D4',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        initiativeValue: '5',
        type: CombatItemsType.MONSTER
      }

    ];

    this.getCommandresults();

  }

  ngOnInit() {
    setTimeout(() => {
      this.ruleSetId = this.bsModalRef.content.ruleSetId;
      this.combatService.getCombatDetails(this.ruleSetId).subscribe(res => {
        debugger
        let result = res;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
    }, 0);

  }


  close() {
    this.bsModalRef.hide();
  }

  command(item) {
    console.log(item);
    if (item.initiativeCommand) {
      let res = DiceService.rollDiceExternally(this.alertService, item.initiativeCommand, []);
      if (isNaN(res)) {
        item.initiativeValue = 0;
      } else {
        item.initiativeValue = res;
      }
    }

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

  getCommandresults(all = false) {
    debugger;
    this.initiativeInfo.map((x) => {
      if (x.initiativeCommand) {
        let res = DiceService.rollDiceExternally(this.alertService, x.initiativeCommand, []);
        if (isNaN(res)) {
          x.initiativeValue = 0;
        } else {
          x.initiativeValue = res;
        }
      }
    });
    if (all == false) {
      this.initiativeInfo.sort((a, b) => b.initiativeValue - a.initiativeValue || a.type.localeCompare(b.type))
      console.log('sorted', this.initiativeInfo);
    }
  }

  //used to reroll  on basis of type
  reRoll(type) {
    if (type == CombatItemsType.CHARACTER) {
      this.initiativeInfo.map((x) => {
        if (x.initiativeCommand && x.type == type) {
          let res = DiceService.rollDiceExternally(this.alertService, x.initiativeCommand, []);
          if (isNaN(res)) {
            x.initiativeValue = 0;
          } else {
            x.initiativeValue = res;
          }
        }
      })
    }
    if (type == CombatItemsType.MONSTER) {
      this.initiativeInfo.map((x) => {
        if (x.initiativeCommand && x.type == type) {
          let res = DiceService.rollDiceExternally(this.alertService, x.initiativeCommand, []);
          if (isNaN(res)) {
            x.initiativeValue = 0;
          } else {
            x.initiativeValue = res;
          }
        }
      })
    }
    if (type == CombatItemsType.ALL) {
      this.getCommandresults(true);
    }
  }
}
