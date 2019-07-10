import { Component, OnInit } from '@angular/core';
import { fadeInOut } from '../../../core/services/animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { CombatInitiativeComponent } from '../combat-initiative/combat-initiative.component';
import { Characters } from '../../../core/models/view-models/characters.model';
import { CombatDetails } from '../../../core/models/view-models/combat-details.model';
import { Utilities } from '../../../core/common/utilities';
import { AddCombatMonsterComponent } from '../add-combat-monster/add-monster-combat.component';
import { RemoveCombatMonsterComponent } from '../remove-combat-monster/remove-monster-combat.component';
import { combatantType } from '../../../core/models/enums';
import { CombatHealthComponent } from '../update-combat-health/update-combat-health.component';
import { DropItemsCombatMonsterComponent } from '../drop-monstercombat-items/drop-items-monstercombat.component';
import { CombatVisibilityComponent } from '../change-combat-visiblity/change-combat-visiblity.component';
import { CombatSettings } from '../../../core/models/view-models/combatSettings.model';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { AlertService } from '../../../core/common/alert.service';
import { DiceService } from '../../../core/services/dice.service';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { CombatBuffeffectDetailsComponent } from '../combat-buffeffects-details/combat-buffeffects-details.component';

@Component({
  selector: 'app-combat-playerview',
  templateUrl: './combat.playerview.component.html',
  styleUrls: ['./combat.playerview.component.scss'],
  animations: [fadeInOut]
 
})
export class CombatPlayerViewComponent implements OnInit {
  bsModalRef: BsModalRef;
  ruleSetId: number;
  character: Characters = new Characters();
  details = new CombatDetails();
  combatDetails: any;
  combatants: any;
  roundCounter: number;
  customDices: CustomDice[] = [];
  CurrentInitiativeValue: number;
  gametime: any;
  rulesetModel: Ruleset = new Ruleset();
  settings: CombatSettings = new CombatSettings();

  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }


  constructor(private modalService: BsModalService, private router: Router, private route: ActivatedRoute, private alertService: AlertService) {
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
    this.roundCounter = 1;

    this.combatDetails = {
      id: 1,
      name: 'ORC SHAMAN',
      image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
      stats: '<p>Hero Hitman ORC SHAMAN </p>',
      buffEffects: [
        {
          id: 1,
          name: 'Effect1',
          image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg'
        },
        {
          id: 2,
          name: '1215',
          image: 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png'

        }
      ],
      desc: '<p> this is Description</p>',
      items: [
        {
          id: 1,
          name: 'Arrow',
          image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/arrow.jpg'
        },
        {
          id: 2,
          name: 'Almut of Proof',
          image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/amuletdetectionlocation.jpg'

        }
      ],
      spells: [
        {
          id: 1,
          name: 'AlterSelf',
          image: 'https://rpgsmithsa.blob.core.windows.net/user-rpgshare-dnd5e/s20.jpg'
        },
        {
          id: 2,
          name: 'DeadSoul',
          image: 'https://rpgsmithsa.blob.core.windows.net/user-rpgshare-dnd5e/s21.jpg'

        }
      ],
      abilites: [
        {
          id: 1,
          name: 'Spell1',
          image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/arrow.jpg'
        },
        {
          id: 2,
          name: 'Spell_Boom',
          image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/amuletdetectionlocation.jpg'

        }
      ]
    };
    this.combatants = [
      {
        id: 1,
        name: 'Orc #2',
        type: combatantType.CHARACTER,
        healthCurrent: 50,
        healthMax: 100,
        buffEffect:
          [
            {
              id: 1,
              name: 'Visible',
              icon: 'icon-Rec-Visible'
            },
            {
              id: 2,
              name: 'CharStatcommand',
              icon: 'icon-CharStat-Command'
            },
          ],
        colorCode: 'green',
        frameColor: 'black',
        hidebtns: false,
        isCurrentTurn: true,
        initiativeValue: 'D4'
      },
      {
        id: 2,
        name: 'monster2',
        type: combatantType.MONSTER,
        healthCurrent: 60,
        healthMax: 100,
        buffEffect:
          [
            {
              id: 1,
              name: 'CharStatcommand',
              icon: 'icon-CharStat-Command',
             },

          ],
        colorCode: 'red',
        frameColor: 'red',
        hidebtns: false,
        isCurrentTurn: false,
        initiativeValue: 'D2'
      },
      {
        id: 3,
        name: 'Orc #3',
        type: combatantType.MONSTER,
        healthCurrent: 10,
        healthMax: 100,
        buffEffect:
          [
            {
              id: 1,
              name: 'Visible',
              icon: 'icon-Rec-Visible',
            },
            {
              id: 2,
              name: 'CharStatcommand',
              icon: 'icon-CharStat-Command',
             },
          ],
        colorCode: 'green',
        frameColor: 'Gray',
        hidebtns: false,
        isCurrentTurn: false,
        initiativeValue: 'D1'
      },
      {
        id: 4,
        name: 'Orc #4',
        type: combatantType.CHARACTER,
        healthCurrent: 50,
        healthMax: 100,
        buffEffect:
          [
            {
              id: 1,
              name: 'Visible',
              icon: 'icon-Rec-Visible',
            },
            {
              id: 2,
              name: 'CharStatcommand',
              icon: 'icon-CharStat-Command',
             },
          ],
        colorCode: 'green',
        frameColor: 'blue',
        hidebtns: false,
        isCurrentTurn: false,
        initiativeValue: 'D4'
      }
    ];

    //initiativeValue change
    this.combatants.map((x) => {
      if (x.initiativeValue) {
        let res = DiceService.rollDiceExternally(this.alertService, x.initiativeValue, this.customDices);
        if (isNaN(res)) {
          x.initiativeValue = 0;
        }
        else {
          x.initiativeValue = res;
        }

      } else {
        x.initiativeValue = 0;
      }
    })

    //adding Image and name in ruleset
    this.rulesetModel.ruleSetName = 'Orc Shaman';
    this.rulesetModel.imageUrl = 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg';
    this.CurrentInitiativeValue = this.combatants[0].initiativeValue;

    this.settings = {
      id: 0,
      combatId: 0,
      pcInitiativeFormula: '1D20 + [Init]',
      rollInitiativeForPlayer: false,
      rollInitiativeEveryRound: false,
      gameRoundLength: 6,
      xpDistributionforDeletedMonster: false,
      charcterXpStats: '',
      charcterHealthStats: '',
      accessMonsterDetails: false,
      groupInitiative: false,
      groupInitFormula: 'DefaultDiceValue',
      dropItemsForDeletedMonsters: false,
      monsterVisibleByDefault: true,
      displayMonsterRollResultInChat: false,
      showMonsterHealth: false,
      seeMonsterBuffEffects: false,
      seeMonsterItems: true,
    };

    //set time firsttime
    this.gametime = this.time_convert(this.settings.gameRoundLength);

  }
  openpopup() {
    console.log('Open popup');
    //this.bsModalRef = this.modalService.show(CharacterStatClusterTileComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
  }

  ngOnInit() { }
  Init() {
    console.log('init click');
    this.bsModalRef = this.modalService.show(CombatInitiativeComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.recordName = this.rulesetModel.ruleSetName;
    this.bsModalRef.content.recordImage = this.rulesetModel.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset';
    this.bsModalRef.content.isFromCampaignDetail = true;

  }
  command() { }
  dropItems() { }
  health() { }
  remove() { }

  monsterAdd() {
    console.log('monsterAdd');
    this.bsModalRef = this.modalService.show(AddCombatMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Monsters';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.rulesetID = this.ruleSetId;
  }
  monsterRemove() {
    console.log('monsterRemove');
    this.bsModalRef = this.modalService.show(RemoveCombatMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Remove Monsters';
    this.bsModalRef.content.button = 'Remove';
    this.bsModalRef.content.rulesetID = this.ruleSetId;

  }

  buffclicked(buffs) {
    console.log('buffclicked', buffs);
  }

  frameClick(item) {
    console.log('frameClick', item.frameColor);
    this.combatants.map(function (itm) {
      if (itm.frameColor == 'red') {
        itm.frameColor = '';
      }
      if (itm.id == item.id) {
        itm.frameColor = 'red';
      }
    })
    this.filldetails(item);
  }

  filldetails(item) {
    console.log(item);
    this.combatDetails = {
      name: item.name,
      image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg'
    }
  }

  nameClicked(item) {
    if (item.type == combatantType.MONSTER) {
      console.log('nameclicked', 'monster');
    }
    if (item.type == combatantType.CHARACTER) {
      console.log('nameclicked', 'chnaracter');
    }
  }

  //opens one to one chat
  target(item) {
    console.log('target',item);
  }

  markItem(item) {
    console.log('markitem', item);
  }
 
  //redirections of character Side
  redirectToItem(item) {
    //this.router.navigate(['/character/inventory', item.id]);
  }
  redirectTospell(item) {
    // this.router.navigate(['/character/spell', item.id]);
  }
  redirectToAbility(item) {
    //this.router.navigate(['/character/ability', item.id]);
  }
  redirectToChracterstat(item) {
    //this.router.navigate(['/character/character-stats', item.id]);
  }

  //Monster Side
  monsterCommand(item) {
    console.log('monsterCommand');
  }
  
  removeMonster(item) {
    console.log('removeMonster');
  }

  editMonster(item) {
    console.log('dropMonsterItems');
  }
  duplicateMonster(item) {
    console.log('duplicate');
  }
  deleteMonster(item) {
    console.log('deleteMonster');
  }


  //game Time conversion
  time_convert(value) {
    let pad = function (num, size) { return ('000' + num).slice(size * -1); };
    let time = value;
    let hours = Math.floor(time / 60 / 60);
    let minutes = Math.floor(time / 60) % 60;
    let seconds = Math.floor(time - minutes * 60);
    if (hours) {
      return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2)
    } else {
      return pad(minutes, 2) + ':' + pad(seconds, 2)
    }
  }

 
}
