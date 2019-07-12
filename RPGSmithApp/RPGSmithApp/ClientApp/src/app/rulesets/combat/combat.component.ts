import { Component, OnInit, HostListener } from '@angular/core';
import { fadeInOut } from '../../core/services/animations';
//import { CharacterStatClusterTileComponent } from './character-stat-cluster-tile/character-stat-cluster-tile.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CombatInitiativeComponent } from './combat-initiative/combat-initiative.component';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { Characters } from '../../core/models/view-models/characters.model';
import { CombatDetails } from '../../core/models/view-models/combat-details.model';
import { Utilities } from '../../core/common/utilities';
import { AddCombatMonsterComponent } from './add-combat-monster/add-monster-combat.component';
import { RemoveCombatMonsterComponent } from './remove-combat-monster/remove-monster-combat.component';
import { combatantType, COMBAT_SETTINGS, CombatItemsType } from '../../core/models/enums';
import { combatant } from '../../core/models/view-models/combatants.model';
import { CombatHealthComponent } from './update-combat-health/update-combat-health.component';
import { DropItemsCombatMonsterComponent } from './drop-monstercombat-items/drop-items-monstercombat.component';
import { CombatVisibilityComponent } from './change-combat-visiblity/change-combat-visiblity.component';
import { CombatSettings } from '../../core/models/view-models/combatSettings.model';
import { CustomDice } from '../../core/models/view-models/custome-dice.model';
import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { DiceService } from '../../core/services/dice.service';
import { DiceRollComponent } from '../../shared/dice/dice-roll/dice-roll.component';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { CombatBuffeffectDetailsComponent } from './combat-buffeffects-details/combat-buffeffects-details.component';
import { CombatService } from '../../core/services/combat.service';
import { AuthService } from '../../core/auth/auth.service';
import { SharedService } from '../../core/services/shared.service';
import { AppService1 } from '../../app.service';
import { MonsterTemplateService } from '../../core/services/monster-template.service';
import { CastComponent } from '../../shared/cast/cast.component';
import { DropItemsMonsterComponent } from '../../records/monster/drop-items-monster/drop-items-monster.component';

@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  styleUrls: ['./combat.component.scss'],
  animations: [fadeInOut]
})
export class CombatComponent implements OnInit {
  bsModalRef: BsModalRef;
  ruleSetId: number;
  character: Characters = new Characters();
  details = new CombatDetails();
  combatantDetails: any;
  combatants: any[];
  roundCounter: number;
  customDices: CustomDice[] = [];
  CurrentInitiativeValue: number;
  gametime: any;
  rulesetModel: Ruleset = new Ruleset();
  settings: CombatSettings = new CombatSettings();
  COMBAT_SETTINGS = COMBAT_SETTINGS;
  showCombatOptions: boolean = false;
  isLoading: boolean = false;
  combatItemsType = CombatItemsType;
  curretnCombatant: any;
  currentCombatantDetail: any;
  isDropdownOpen: boolean = false;
  isCharacterItemEnabled: boolean = false;
  isCharacterSpellEnabled: boolean = false;
  isCharacterAbilityEnabled: boolean = false;
  CombatId: number = 0;
  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    //console.log(event);
    if (event.keyCode === 32) {
      this.nextTurn();
    }
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className.endsWith("setting-toggle-btn")) {
        this.isDropdownOpen = !this.isDropdownOpen;
      }
      else if (this.hasSomeParentTheClass(target, 'setting-toggle'))
        this.isDropdownOpen = true;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }

  hasSomeParentTheClass(element, classname) {
    if (element.className.split(' ').indexOf(classname) >= 0) return true;
    return element.parentNode && this.hasSomeParentTheClass(element.parentNode, classname);
  }
  constructor(private modalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private combatService: CombatService,
    private authService: AuthService,
    private sharedService: SharedService,
    private appService: AppService1,
    private monsterTemplateService: MonsterTemplateService) {
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });

    this.sharedService.shouldUpdateCombatantList().subscribe(combatantListJson => {
      if (combatantListJson) {
        this.combatants = combatantListJson;
      }
    });

    //this.sharedService.shouldUpdateMonsterVisibility().subscribe(v => {
    //    debugger
    //  if (this.curretnCombatant) {
    //    this.curretnCombatant.visibility = v;
    //  }
    //});

    //roundcounter
    this.roundCounter = 1;

    this.combatantDetails = {
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

    //Mock data
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
        initiativeValue: 'D4',
        visiblity: true
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
              icon: 'icon-CharStat-Command'
            },

          ],
        colorCode: 'red',
        frameColor: 'red',
        hidebtns: false,
        isCurrentTurn: false,
        initiativeValue: 'D2',
        visiblity: false
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
              icon: 'icon-Rec-Visible'
            },
            {
              id: 2,
              name: 'CharStatcommand',
              icon: 'icon-CharStat-Command'
            },
          ],
        colorCode: 'green',
        frameColor: 'Gray',
        hidebtns: false,
        isCurrentTurn: false,
        initiativeValue: 'D1',
        visiblity: true
      }
    ]

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

    //this.settings = {
    //  id: 0,
    //  combatId: 0,
    //  pcInitiativeFormula: '1D20 + [Init]',
    //  rollInitiativeForPlayer: false,
    //  rollInitiativeEveryRound: false,
    //  gameRoundLength: 6,
    //  xpDistributionforDeletedMonster: false,
    //  charcterXpStats: '',
    //  charcterHealthStats: '',
    //  accessMonsterDetails: false,
    //  groupInitiative: false,
    //  groupInitFormula: 'DefaultDiceValue',
    //  dropItemsForDeletedMonsters: false,
    //  monsterVisibleByDefault: true,
    //  displayMonsterRollResultInChat: false,
    //  showMonsterHealth: false,
    //  seeMonsterBuffEffects: false,
    //  seeMonsterItems: true,
    //};

    //set time firsttime
    //this.gametime = this.time_convert(this.settings.gameRoundLength);

  }

  ngOnInit() {
    this.GetCombatDetails();
    //this.GetCombatantList();
  }

  // Combat Settings
  GetCombatDetails() {
    this.isLoading = true;
    this.combatService.getCombatDetails(this.ruleSetId).subscribe(res => {
      if (res) {
        let combatModal: any = res;
        this.roundCounter = combatModal.round;
        this.showCombatOptions = combatModal.isStarted;
        this.CombatId = combatModal.id

        this.settings = combatModal.combatSettings;
        this.combatants = combatModal.combatantList;
        debugger
        this.combatants.map((x) => {
          if (!x.combatId) {
            x.combatId = combatModal.id;
          }
          if (!x.visibilityColor) {
            if (x.type == this.combatItemsType.CHARACTER) {
              x.visibilityColor = "green";
            }
            else if (x.type == this.combatItemsType.MONSTER) {
              x.visibilityColor = "red";
            }
          }
        });

        // Game Time
        this.gametime = this.time_convert(this.settings.gameRoundLength);

        this.isCharacterItemEnabled = combatModal.isCharacterItemEnabled;
        this.isCharacterSpellEnabled = combatModal.isCharacterSpellEnabled;
        this.isCharacterAbilityEnabled = combatModal.isCharacterAbilityEnabled;
      }
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

  ////Combatant List
  //GetCombatantList() {
  //  this.isLoading = true;
  //  this.combatService.getCombatDetails(this.ruleSetId).subscribe(res => {
  //    if (res) {
  //      debugger;
  //      let model: any = res;
  //      this.combatants = model.combatantList;
  //      this.combatants.forEach(item => {
  //        if (!item.visibilityColor) {
  //          if (item.type == this.combatItemsType.CHARACTER) {
  //            item.visibilityColor = "green";
  //          }
  //          else if (item.type == this.combatItemsType.MONSTER) {
  //            item.visibilityColor = "red";
  //          }
  //        }

  //      });

  //    }
  //    this.isLoading = false;
  //  }, error => {
  //    this.isLoading = false;
  //    let Errors = Utilities.ErrorDetail("", error);
  //    if (Errors.sessionExpire) {
  //      this.authService.logout(true);
  //    } else {
  //      this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //    }
  //  });
  //}

  // Current Turn
  SaveCombatantTurn(curretnCombatant, roundCount) {
    debugger;
    //this.isLoading = true;
    this.combatService.saveCombatantTurn(curretnCombatant, roundCount).subscribe(res => {
      let result = res;
      //this.isLoading = false;
    }, error => {
      //this.isLoading = false;
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  // Send message to chat
  SendSystemMessageToChat(message) {
    this.appService.updateChatFromCombat(message);
  }

  openpopup() {
    console.log('Open popup');
    //this.bsModalRef = this.modalService.show(CharacterStatClusterTileComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
  }

  //open Initiative popup
  Init() {
    this.bsModalRef = this.modalService.show(CombatInitiativeComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
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

  //combatant Detail Pane Methods
  command() { }
  dropItems() { }
  health() { }

  // Remove monster from Detail pane
  remove() {
    if (this.currentCombatantDetail) {
      this.RemoveOrDeleteMonster(this.currentCombatantDetail, false);
    }
  }

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
    this.bsModalRef.content.customDices = this.customDices
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

  prevTurn() {
    //console.log('prev');
    for (let i = 0; i < this.combatants.length; i++) {
      if (this.combatants[i].isCurrentTurn && this.combatants[i - 1]) {
        this.combatants[i].isCurrentTurn = false;
        this.combatants[i - 1].isCurrentTurn = true;
        this.curretnCombatant = this.combatants[i - 1];
        let valueofinitiative = this.combatants[i - 1].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;
        this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
        return;
      }

      else if (!this.combatants[i - 1] && this.roundCounter > 1 && this.combatants[i].isCurrentTurn) {
        console.log(this.combatants[i - 1]);
        console.log(i);
        console.log(this.combatants[i].isCurrentTurn);
        let index = this.combatants.length - 1;
        this.combatants[i].isCurrentTurn = false;
        this.curretnCombatant = this.combatants[i + index];
        this.combatants[i + index].isCurrentTurn = true;
        let valueofinitiative = this.combatants[i + index].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;
        this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
        return;
      }
    }
  }
  nextTurn() {
    for (let i = 0; i < this.combatants.length; i++) {
      if (this.combatants[i].isCurrentTurn == true && this.combatants[i + 1]) {
        this.combatants[i].isCurrentTurn = false;
        this.combatants[i + 1].isCurrentTurn = true;
        this.curretnCombatant = this.combatants[i + 1];
        let valueofinitiative = this.combatants[i + 1].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;
        this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
        return;
      }
      else if (!this.combatants[i + 1]) {
        this.combatants[i].isCurrentTurn = false;
        this.combatants[i - i].isCurrentTurn = true;
        this.curretnCombatant = this.combatants[i - 1];
        let valueofinitiative = this.combatants[i - i].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;
        this.roundCounter = this.roundCounter + 1;
        //convert time
        let roundTime = this.settings.gameRoundLength * this.roundCounter;
        this.gametime = this.time_convert(roundTime);
        this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
        return;
      }

    }
  }

  changeColor(item) {
    //console.log('colorchange', item);
    this.bsModalRef = this.modalService.show(CombatVisibilityComponent, {
      class: 'modal-primary modal-sm smallPopup',
      ignoreBackdropClick: false,
      keyboard: false
    });
    this.bsModalRef.content.title = "Change Visibility";
    this.bsModalRef.content.color = item.visibilityColor;
    this.bsModalRef.content.item = item;
    this.bsModalRef.content.event.subscribe(result => {
      //  console.log('resultEmiited', result);
      item.visibilityColor = result.bodyBgColor;
    });
    this.sharedService.shouldUpdateMonsterVisibility().subscribe(v => {
      item.visibleToPc = v;
    });
  }
  progressHealth(item) {
    console.log('progressHealth', item);
    //CombatHealthComponent
    this.bsModalRef = this.modalService.show(CombatHealthComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Health";
    this.bsModalRef.content.combatInfo = item;
  }
  buffclicked(buffs) {
    console.log('buffclicked', buffs);
  }
  frameClick(item) {
    this.currentCombatantDetail = item;
    this.combatants.map(function (itm) {
      if (itm.frameColor) {
        itm.frameColor = '';
      }
      if (itm.id == item.id) {
        itm.frameColor = 'red';
      }
    })
  }
  nameClicked(item) {
    if (item.type == combatantType.MONSTER) {
      this.router.navigate(['/ruleset/monster-details', item.monster.monsterId]);
    }
    if (item.type == combatantType.CHARACTER) {
      this.router.navigate(['/character/dashboard', item.character.characterId]);
    }
  }

  Hidebtns(item) {
    item.hidebtns = true;
  }
  showbtns(item) {
    item.hidebtns = false;
  }

  //redirections of character Side
  redirectToItem(item) {
    this.router.navigate(['/character/inventory', item.character.characterId]);
  }
  redirectTospell(item) {
    this.router.navigate(['/character/spell', item.character.characterId]);
  }
  redirectToAbility(item) {
    this.router.navigate(['/character/ability', item.character.characterId]);
  }
  redirectToChracterstat(item) {
    this.router.navigate(['/character/character-stats', item.character.characterId]);
  }

  //Monster Side
  monsterCommand(item) {

    let _monster = Object.assign({}, item.monster);


    if (_monster.monsterId) {
      this.monsterTemplateService.getMonsterCommands_sp<any>(_monster.monsterId)
        .subscribe(data => {
          if (data.length > 0) {
            this.bsModalRef = this.modalService.show(CastComponent, {
              class: 'modal-primary modal-md',
              ignoreBackdropClick: true,
              keyboard: false
            });

            this.bsModalRef.content.title = "Monster Commands";
            this.bsModalRef.content.ListCommands = data;
            this.bsModalRef.content.Command = _monster;
            this.bsModalRef.content.Character = new Characters();
            this.bsModalRef.content.recordType = 'monster';
            this.bsModalRef.content.recordId = _monster.monsterId;
          } else {

            this.useCommand(_monster);
          }
        }, error => { }, () => { });
    }


  }
  useCommand(monster: any) {

    let msg = "The command value for " + monster.name
      + " Monster has not been provided. Edit this record to input one.";
    if (monster.command == undefined || monster.command == null || monster.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterHelper(monster));
    } else {
      //TODO
      this.useMonsterHelper(monster);
    }
  }

  private useMonsterHelper(monster: any) {

    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = monster.command;
    if (monster.hasOwnProperty("monsterId")) {
      this.bsModalRef.content.recordName = monster.name;
      this.bsModalRef.content.recordImage = monster.imageUrl;
      this.bsModalRef.content.recordType = 'monster';
      this.bsModalRef.content.recordId = monster.monsterId;
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
  }
  dropMonsterItems(item) {
    let monster = item.monster;
    this.bsModalRef = this.modalService.show(DropItemsMonsterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Drop Items';
    this.bsModalRef.content.button = 'Drop';
    this.bsModalRef.content.monsterId = monster.monsterId;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.monsterName = monster.name;
    this.bsModalRef.content.monsterImage = monster.imageUrl;
    //console.log('dropMonsterItems');
    ////DropItemsCombatMonsterComponent
    //this.bsModalRef = this.modalService.show(DropItemsCombatMonsterComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
    //this.bsModalRef.content.title = 'Drop Items';
    //this.bsModalRef.content.button = 'Drop';
    //this.bsModalRef.content.monsterId = 0;
    //this.bsModalRef.content.rulesetID = 0;
  }
  removeCurrentMonster(item) {
    this.RemoveOrDeleteMonster(item, false);
  }

  RemoveOrDeleteMonster(item, del) {
    this.isLoading = true;
    let _msg = ' Removing Monster ....';
    this.alertService.startLoadingMessage("", _msg);
    let monstersToRemove = item.map((m) => {
      return { monsterId: m.monster.monsterId };
    });
    this.combatService.removeMonsters(monstersToRemove, del)
      .subscribe(data => {
        this.alertService.stopLoadingMessage();
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showMessage(error, "", MessageSeverity.error);
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        } else {
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }
      }, () => { });
  }

  editMonster(item) {
    console.log('dropMonsterItems');
  }
  duplicateMonster(item) {
    console.log('duplicate');
  }
  deleteMonster(item) {
    this.RemoveOrDeleteMonster(item, true);
  }

  //startcombat
  startCombat() {
    //this.roundCounter = 1;
    let _msg = "Starting Combat..";
    this.alertService.startLoadingMessage("", _msg);
    this.combatService.StartCombat(this.CombatId, true).subscribe(res => {

      this.alertService.stopLoadingMessage();

      let message = "Combat has been starter successfully.";
      this.alertService.showMessage(message, "", MessageSeverity.success);

      this.Init();
      this.showCombatOptions = true;
      let msg = "Combat Started";
      this.SendSystemMessageToChat(msg);

      this.isLoading = false;
    }, error => {
      this.alertService.stopLoadingMessage();
      this.isLoading = false;
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });

  }

  endCombat() {
    let message = "Are you sure you want to end the combat?";
    this.alertService.showDialog(message,
      DialogType.confirm, () => this.stopCombat(), null, 'Yes', 'No');
  }

  //endCombat
  stopCombat() {
    debugger;
    let _msg = "Ending Combat..";
    this.alertService.startLoadingMessage("", _msg);
    //this.router.navigate(['/ruleset/combatplayer', this.ruleSetId]);
    this.combatService.StartCombat(this.CombatId, false).subscribe(res => {

      this.alertService.stopLoadingMessage();

      let message = "Combat has been ended successfully.";
      this.alertService.showMessage(message, "", MessageSeverity.success);

      this.showCombatOptions = false;
      let msg = "Combat Ended";
      this.SendSystemMessageToChat(msg);

      this.isLoading = false;
    }, error => {
      this.alertService.stopLoadingMessage();
      this.isLoading = false;
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });

  }

  //change settings here
  UpdateSettings(e, type) {
    switch (type) {
      case COMBAT_SETTINGS.PC_INITIATIVE_FORMULA:
        this.settings.pcInitiativeFormula = e.target.value;
        break;
      case COMBAT_SETTINGS.ROLL_INITIATIVE_FOR_PLAYER_CHARACTERS:
        this.settings.rollInitiativeForPlayer = e.target.checked;
        break;
      case COMBAT_SETTINGS.ROLL_INITIATIVE_EVERY_ROUND:
        this.settings.rollInitiativeEveryRound = e.target.checked;
        break;
      case COMBAT_SETTINGS.IN_GAME_ROUND_LENGTH:
        this.settings.gameRoundLength = e.target.value;
        break;
      case COMBAT_SETTINGS.AUTO_XP_DISTRIBUTION_FOR_DELETED_MONSTERS:
        this.settings.xpDistributionforDeletedMonster = e.target.checked;
        break;
      case COMBAT_SETTINGS.CHARACTER_TARGET_XP_STAT:
        this.settings.charcterXpStats = e.target.value;
        break;
      case COMBAT_SETTINGS.CHARACTER_TARGET_HEALTH_STAT:
        this.settings.charcterHealthStats = e.target.value;
        break;
      case COMBAT_SETTINGS.ACCESS_MONSTER_DETAILS:
        this.settings.accessMonsterDetails = e.target.checked;
        break;
      case COMBAT_SETTINGS.GROUP_INITIATIVE:
        this.settings.groupInitiative = e.target.checked;
        break;
      case COMBAT_SETTINGS.GROUPINIT_FORMULA:
        this.settings.groupInitFormula = e.target.value;
        break;
      case COMBAT_SETTINGS.AUTO_DROP_ITEMS_FOR_DELETED_MONSTERS:
        this.settings.dropItemsForDeletedMonsters = e.target.checked;
        break;
      case COMBAT_SETTINGS.MONSTERS_ARE_VISIBLE_BY_DEFAULT:
        this.settings.monsterVisibleByDefault = e.target.checked;
        break;
      case COMBAT_SETTINGS.DISPLAY_MONSTER_ROLL_RESULTS_IN_CHAT:
        this.settings.displayMonsterRollResultInChat = e.target.checked;
        break;
      case COMBAT_SETTINGS.SHOW_MONSTER_HEALTH:
        this.settings.showMonsterHealth = e.target.checked;
        break;
      case COMBAT_SETTINGS.SEE_MONSTER_BUFFS_EFFECTS:
        this.settings.seeMonsterBuffEffects = e.target.checked;
        break;
      case COMBAT_SETTINGS.SEE_MONSTER_ITEMS:
        this.settings.seeMonsterItems = e.target.checked;
        break;

      default:
    }
    this.UpdateCombatSettings(this.settings);
  }

  UpdateCombatSettings(settings: CombatSettings) {
    //this.isLoading = true;
    this.combatService.updateCombatSettings(this.settings).subscribe(res => {
      let result = res;
      //this.isLoading = false;
    }, error => {
      //this.isLoading = false;
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  //change Settings Functions
  //changeAcessMonster(event) {
  //  this.settings.accessMonsterDetails = event.target.checked;
  //}
  //changemonsterGroup(event) {
  //  this.settings. monsterGroup = event.target.checked;
  //}
  //dropItemsForDeletedMonsters(event) {
  //  this.settings.dropItemsForDeltedMonsters = event.target.checked;
  //}
  //changeMonsterVisibility(event) {
  //  this.settings.monsterVisibleByDefault = event.target.checked;
  //  console.log('settings', this.settings);
  //}
  //changeshowHealth(event) {
  //  this.settings.showHealth = event.target.checked;
  //}
  //changeSeeMonsterBuffEffects(event) {
  //  this.settings.seeMonsterBuffEffects = event.target.checked;
  //}
  //changeSeeMonsterItems(event) {
  //  this.settings.seeMonsterItems = event.target.checked;
  //}
  //diplayresultinchat(event) {
  //  this.settings.displayMonsterRollResultInChat = event.target.checked;
  //}
  //changeRollInitiativeForPlayer(event) {
  //  this.settings.rollInitiativeForPlayer = event.target.checked;
  //}
  //changeRollInitiativeEveryRound(event) {
  //  this.settings.rollInitiativeEveryRound = event.target.checked;
  //  console.log('settings', this.settings);
  //}

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

  buffEffectclick() {
    console.log('cliked');
    this.bsModalRef = this.modalService.show(CombatBuffeffectDetailsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Buff & Effects';
    this.bsModalRef.content.button = 'Edit';
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.recordName = this.rulesetModel.ruleSetName;
    this.bsModalRef.content.recordImage = this.rulesetModel.ruleSetImage;

  }
}
