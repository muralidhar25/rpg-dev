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
import { combatantType, COMBAT_SETTINGS, CombatItemsType, STAT_TYPE } from '../../core/models/enums';
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
import { EditMonsterComponent } from '../../records/monster/edit-monster/edit-monster.component';
import { CreateMonsterTemplateComponent } from '../../records/monster-template/create-monster-template/create-monster-template.component';
import { Observable, Subscription } from 'rxjs';
import { ItemsService } from '../../core/services/items.service';
import { DBkeys } from '../../core/common/db-keys';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { ServiceUtil } from '../../core/services/service-util';
import { RulesetService } from '../../core/services/ruleset.service';
import { CharactersCharacterStat } from '../../core/models/view-models/characters-character-stats.model';

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
  combatants: any[] = [];
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
  delayResumeTurn: boolean = false;
  sub: Subscription;
  characterId: any;
  noDescripttionAvailable: string = 'No Descripttion Available';
  DummyValueForCharHealthStat: number = -9999

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
    private monsterTemplateService: MonsterTemplateService,
    private itemsService: ItemsService,
    private localStorage: LocalStoreManager,

    private rulesetService: RulesetService, ) {
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });

    this.sharedService.shouldUpdateCombatantList().subscribe(combatantListJson => {
      if (combatantListJson) {
        //{ combatantList: this.initiativeInfo, isInitialForCombatStart:this.isInitialForCombatStart }
        this.combatants = combatantListJson.combatantList;
        if (combatantListJson.isInitialForCombatStart) {
          this.nextTurn();
          if (this.roundCounter > 1) {
            this.combatants.map((rec) => {
              rec.isCurrentTurn = false;
            })
            this.combatants[0].isCurrentTurn = true;
            this.curretnCombatant = this.combatants[0];
            let valueofinitiative = this.combatants[0].initiativeValue;
            this.CurrentInitiativeValue = valueofinitiative;

            //this.roundCounter = this.roundCounter + 1;
            ////convert time
            let roundTime = this.settings.gameRoundLength * this.roundCounter;
            this.gametime = this.time_convert(roundTime);
            this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
          }
        }
      }
    });

    this.sharedService.shouldUpdateMonsterBuffEffect().subscribe(mbe => {
      if (mbe) {
        this.combatants.map(x => {
          if (x.type == combatantType.MONSTER) {
            if (mbe.monsterId == x.monster.monsterId) {
              if (mbe.monsterBuffAndEffects.length) {
                x.monster.monsterBuffAndEffects = mbe.monsterBuffAndEffects.map((m_rec) => {
                  return { buffAndEffectId: m_rec.buffAndEffectId, monsterId: mbe.monsterId, id: 0, isDeleted: false, monster: null, buffAndEffect: m_rec }
                });
              }
            }
          }
        });
      }
    });

    this.sharedService.shouldUpdateCharacterBuffEffect().subscribe(cbe => {
      if (cbe) {

        this.combatants.map(x => {
          if (x.type == combatantType.CHARACTER) {
            if (cbe.characterId == x.character.characterId) {
              if (cbe.characterBuffAndEffects.length) {
                x.character.characterBuffAndEffects = cbe.characterBuffAndEffects.map((c_rec) => {
                  return {
                    buffAndEffectID: c_rec.buffAndEffectId, character: null, characterBuffAandEffectId: 0, characterId: cbe.characterId, isDeleted: null, buffAndEffect: { buffAndEffectId: c_rec.buffAndEffectId, name: c_rec.text, imageUrl: c_rec.image }
                  }
                });
              }

            }
          }
        });
      }
    });

    //this.sharedService.shouldUpdateMonsterVisibility().subscribe(v => {
    //    
    //  if (this.curretnCombatant) {
    //    this.curretnCombatant.visibility = v;
    //  }
    //});

    //////////roundcounter
    ////////this.roundCounter = 1;

    ////////this.combatantDetails = {
    ////////  id: 1,
    ////////  name: 'ORC SHAMAN',
    ////////  image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    ////////  stats: '<p>Hero Hitman ORC SHAMAN </p>',
    ////////  buffEffects: [
    ////////    {
    ////////      id: 1,
    ////////      name: 'Effect1',
    ////////      image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg'
    ////////    },
    ////////    {
    ////////      id: 2,
    ////////      name: '1215',
    ////////      image: 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png'

    ////////    }
    ////////  ],
    ////////  desc: '<p> this is Description</p>',
    ////////  items: [
    ////////    {
    ////////      id: 1,
    ////////      name: 'Arrow',
    ////////      image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/arrow.jpg'
    ////////    },
    ////////    {
    ////////      id: 2,
    ////////      name: 'Almut of Proof',
    ////////      image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/amuletdetectionlocation.jpg'

    ////////    }
    ////////  ],
    ////////  spells: [
    ////////    {
    ////////      id: 1,
    ////////      name: 'AlterSelf',
    ////////      image: 'https://rpgsmithsa.blob.core.windows.net/user-rpgshare-dnd5e/s20.jpg'
    ////////    },
    ////////    {
    ////////      id: 2,
    ////////      name: 'DeadSoul',
    ////////      image: 'https://rpgsmithsa.blob.core.windows.net/user-rpgshare-dnd5e/s21.jpg'

    ////////    }
    ////////  ],
    ////////  abilites: [
    ////////    {
    ////////      id: 1,
    ////////      name: 'Spell1',
    ////////      image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/arrow.jpg'
    ////////    },
    ////////    {
    ////////      id: 2,
    ////////      name: 'Spell_Boom',
    ////////      image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/amuletdetectionlocation.jpg'

    ////////    }
    ////////  ]
    ////////};

    //////////Mock data
    ////////this.combatants = [
    ////////  {
    ////////    id: 1,
    ////////    name: 'Orc #2',
    ////////    type: combatantType.CHARACTER,
    ////////    healthCurrent: 50,
    ////////    healthMax: 100,
    ////////    buffEffect:
    ////////      [
    ////////        {
    ////////          id: 1,
    ////////          name: 'Visible',
    ////////          icon: 'icon-Rec-Visible'
    ////////        },
    ////////        {
    ////////          id: 2,
    ////////          name: 'CharStatcommand',
    ////////          icon: 'icon-CharStat-Command'
    ////////        },
    ////////      ],
    ////////    colorCode: 'green',
    ////////    frameColor: 'black',
    ////////    hidebtns: false,
    ////////    isCurrentTurn: true,
    ////////    initiativeValue: 'D4',
    ////////    visiblity: true
    ////////  },
    ////////  {
    ////////    id: 2,
    ////////    name: 'monster2',
    ////////    type: combatantType.MONSTER,
    ////////    healthCurrent: 60,
    ////////    healthMax: 100,
    ////////    buffEffect:
    ////////      [
    ////////        {
    ////////          id: 1,
    ////////          name: 'CharStatcommand',
    ////////          icon: 'icon-CharStat-Command'
    ////////        },

    ////////      ],
    ////////    colorCode: 'red',
    ////////    frameColor: 'red',
    ////////    hidebtns: false,
    ////////    isCurrentTurn: false,
    ////////    initiativeValue: 'D2',
    ////////    visiblity: false
    ////////  },
    ////////  {
    ////////    id: 3,
    ////////    name: 'Orc #3',
    ////////    type: combatantType.MONSTER,
    ////////    healthCurrent: 10,
    ////////    healthMax: 100,
    ////////    buffEffect:
    ////////      [
    ////////        {
    ////////          id: 1,
    ////////          name: 'Visible',
    ////////          icon: 'icon-Rec-Visible'
    ////////        },
    ////////        {
    ////////          id: 2,
    ////////          name: 'CharStatcommand',
    ////////          icon: 'icon-CharStat-Command'
    ////////        },
    ////////      ],
    ////////    colorCode: 'green',
    ////////    frameColor: 'Gray',
    ////////    hidebtns: false,
    ////////    isCurrentTurn: false,
    ////////    initiativeValue: 'D1',
    ////////    visiblity: true
    ////////  }
    ////////]

    //////////initiativeValue change
    ////////this.combatants.map((x) => {
    ////////  if (x.initiativeValue) {
    ////////    let res = DiceService.rollDiceExternally(this.alertService, x.initiativeValue, this.customDices);
    ////////    if (isNaN(res)) {
    ////////      x.initiativeValue = 0;
    ////////    }
    ////////    else {
    ////////      x.initiativeValue = res;
    ////////    }

    ////////  } else {
    ////////    x.initiativeValue = 0;
    ////////  }
    ////////})

    //////////adding Image and name in ruleset
    ////////this.rulesetModel.ruleSetName = 'Orc Shaman';
    ////////this.rulesetModel.imageUrl = 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg';
    ////////this.CurrentInitiativeValue = this.combatants[0].initiativeValue;

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
    this.setRulesetId(this.ruleSetId);
    this.destroyModalOnInit();
    this.rulesetService.getCustomDice(this.ruleSetId)
      .subscribe(data => {
        this.customDices = data

      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
    this.GetCombatDetails();
    //this.GetCombatantList();
  }

  //api call after every 10 seconds
  ngAfterViewInit() {
    //this.sub = Observable.interval(4000)
    //  .subscribe((val) => {
    //    this.GetCombatDetails(false);
    //  });
  }

  // Combat Settings
  GetCombatDetails(ShowLoader = true) {
    if (ShowLoader) {
      this.isLoading = true;
    }

    this.combatService.getCombatDetails(this.ruleSetId).subscribe(res => {
      if (res) {
        let combatModal: any = res;
        this.roundCounter = combatModal.round;
        this.showCombatOptions = combatModal.isStarted;
        this.CombatId = combatModal.id
        this.rulesetModel = combatModal.campaign;
        this.settings = combatModal.combatSettings;
        if (this.settings.monsterVisibleByDefault) {
          this.combatants = combatModal.combatantList;
        } else {
          this.combatants = [];
          let combatantsWithoutMonster = combatModal.combatantList;;
          combatantsWithoutMonster.map(x => {
            if (x.type == this.combatItemsType.CHARACTER) {
              this.combatants.push(x);
            }
          });
        }

        this.combatants.map((x) => {
          //for character layer View
          x.isOwnPlayer = true;

          x.initiativeValue = x.initiative;
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


          if (x.type == this.combatItemsType.CHARACTER) {
            debugger
            if (x.character.diceRollViewModel.charactersCharacterStats) {
              let statFoundFlag: boolean = false;
              let charStat: CharactersCharacterStat = null;
              this.settings.charcterHealthStats.split(/\[(.*?)\]/g).map((rec) => {
                if (rec && !statFoundFlag) {
                  let charStatList = x.character.diceRollViewModel.charactersCharacterStats.filter(x => x.characterStat.statName == rec);
                  if (charStatList.length) {
                    charStat = charStatList[0];
                  }
                  statFoundFlag = true;
                }
              });

              x.character.healthCurrent = this.DummyValueForCharHealthStat;
              x.character.healthMax = this.DummyValueForCharHealthStat;
              if (charStat) {
                x.character.healthStatId = charStat.charactersCharacterStatId;
                if (charStat.characterStat.characterStatTypeId == STAT_TYPE.CurrentMax) {
                  x.character.healthCurrent = +charStat.current;
                  x.character.healthMax = +charStat.maximum;
                }
                else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.ValueSubValue) {
                  x.character.healthCurrent = +charStat.value;
                  x.character.healthMax = +charStat.subValue;
                }
                else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.Number) {
                  x.character.healthCurrent = +charStat.number;
                }
                else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.Combo) {
                  x.character.healthCurrent = +charStat.defaultValue;
                }
              }
            }
          }
        });

        // Game Time
        this.gametime = this.time_convert(this.settings.gameRoundLength);

        this.frameClick(this.combatants[0]);

        this.isCharacterItemEnabled = combatModal.isCharacterItemEnabled;
        this.isCharacterSpellEnabled = combatModal.isCharacterSpellEnabled;
        this.isCharacterAbilityEnabled = combatModal.isCharacterAbilityEnabled;

        if (this.roundCounter > 1) {
          this.curretnCombatant = this.combatants.filter(x => x.isCurrentTurn);
          let valueofinitiative = this.curretnCombatant.initiativeValue;
          this.CurrentInitiativeValue = valueofinitiative;

          //this.roundCounter = this.roundCounter + 1;
          ////convert time
          let roundTime = this.settings.gameRoundLength * this.roundCounter;
          this.gametime = this.time_convert(roundTime);
        }
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
  //      
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
  Init(isInitialForCombatStart = false) {
    this.bsModalRef = this.modalService.show(CombatInitiativeComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.customDices = this.customDices;
    this.bsModalRef.content.combatants = this.combatants;
    this.bsModalRef.content.settings = this.settings;
    this.bsModalRef.content.isInitialForCombatStart = isInitialForCombatStart;
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

  // Detail Pane Methods
  //command() {
  //  if (this.currentCombatantDetail) {
  //    this.monsterCommand(this.currentCombatantDetail);
  //  }
  //}

  //dropItems() {
  //  if (this.currentCombatantDetail) {
  //    this.dropMonsterItems(this.currentCombatantDetail);
  //  }
  //}

  DelayResumeTurn() {
    this.delayResumeTurn = !this.delayResumeTurn;
  }

  // Remove monster from Detail pane
  //remove() {
  //  if (this.currentCombatantDetail) {
  //    let message = "Are you sure you want to remove this monster?";
  //    this.alertService.showDialog(message,
  //      DialogType.confirm, () => this.RemoveOrDeleteMonster(item, false), null, 'Yes', 'No');
  //  }
  //}

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
    //this.frameClick(this.curretnCombatant)
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
        if (this.roundCounter != 0 && this.settings.rollInitiativeEveryRound) {
          this.Init(true);
        }
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
      //this.frameClick(this.curretnCombatant)
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
    //console.log('progressHealth', item);
    //CombatHealthComponent
    //if (item.type == this.combatItemsType.MONSTER) {
    this.bsModalRef = this.modalService.show(CombatHealthComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Health";
    this.bsModalRef.content.combatInfo = item;
    this.bsModalRef.content.event.subscribe(result => {
      if (result.type == combatantType.CHARACTER) {
        item.character.healthCurrent = result.character.healthCurrent;
        item.character.healthMax = result.character.healthMax;
      }
      else if (result.type == combatantType.MONSTER) {
        item.monster.healthCurrent = result.monster.healthCurrent;
        item.monster.healthMax = result.monster.healthMax;
      }
    });
    //}

  }
  buffclicked(buffs) {
    console.log('buffclicked', buffs);
  }
  frameClick(item) {
    debugger
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
  redirectToSpell(item) {
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
    this.bsModalRef.content.isFromCombat = true;
    if (monster.hasOwnProperty("monsterId")) {
      this.bsModalRef.content.recordName = monster.name;
      this.bsModalRef.content.recordImage = monster.imageUrl;
      this.bsModalRef.content.recordType = 'monster';
      this.bsModalRef.content.recordId = monster.monsterId;
    }
    this.bsModalRef.content.event.subscribe(result => {
      let msg = "Monster rolled result = " + result;
      if (this.settings.displayMonsterRollResultInChat) {
        this.SendSystemMessageToChat(msg);
      }
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
    let message = "Are you sure you want to remove this monster?";
    this.alertService.showDialog(message,
      DialogType.confirm, () => this.RemoveOrDeleteMonster(item, false), null, 'Yes', 'No');
  }

  RemoveOrDeleteMonster(item, del) {
    this.isLoading = true;
    let _msg = ' Removing Monster ....';
    this.alertService.startLoadingMessage("", _msg);
    let monstersToRemove = [];
    monstersToRemove.push({ monsterId: item.monster.monsterId });
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
    this.bsModalRef = this.modalService.show(EditMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Monster';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterVM = item.monster.monsterId;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.isFromCombatScreen = true;
  }
  duplicateMonster(item) {
    this.monsterTemplateService.getMonsterTemplateCount(this.ruleSetId)
      .subscribe(data => {
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate New Monster';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.monsterTemplateVM = item.monster.monsterId;
          this.bsModalRef.content.isCreatingFromMonsterScreen = true;
          this.bsModalRef.content.isCreatingFromMonsterDetailScreen = true;
          this.bsModalRef.content.isFromCombatScreen = true;
        }
        else {
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }
  deleteMonster(item) {
    let message = "Are you sure you want to delete this monster?";
    this.alertService.showDialog(message,
      DialogType.confirm, () => this.RemoveOrDeleteMonster(item, true), null, 'Yes', 'No');
    ;
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

      this.Init(true);
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
      this.GetCombatDetails();
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
    this.UpdateCombatSettings(this.settings, type);
  }

  UpdateCombatSettings(settings: CombatSettings, type) {
    //this.isLoading = true;
    this.combatService.updateCombatSettings(this.settings).subscribe(res => {
      if (type == COMBAT_SETTINGS.CHARACTER_TARGET_HEALTH_STAT) {
        this.GetCombatDetails();
      }
      //let result = res;
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

  buffEffectclick(item) {
    console.log('cliked');
    this.bsModalRef = this.modalService.show(CombatBuffeffectDetailsComponent, {
      class: 'modal-primary',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Buff & Effects';
    this.bsModalRef.content.button = 'Edit';
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.hideEditBtn = false;
    if (item.type == this.combatItemsType.CHARACTER) {
      this.bsModalRef.content.recordName = item.character.characterName;
      this.bsModalRef.content.recordImage = item.character.imageUrl;
      this.bsModalRef.content.buffEffectList = item.character.characterBuffAndEffects;
      this.bsModalRef.content.type = item.type;
      this.bsModalRef.content.character = item;
      //this.bsModalRef.content.characterId = item.character.characterId;
    }
    if (item.type == this.combatItemsType.MONSTER) {
      this.bsModalRef.content.recordName = item.monster.name;
      this.bsModalRef.content.recordImage = item.monster.imageUrl;
      this.bsModalRef.content.buffEffectList = item.monster.monsterBuffAndEffects;
      this.bsModalRef.content.type = item.type;
      this.bsModalRef.content.monster = item;
    }
  }

  CombatantBuff_EffectDetail(currentCombatantDetail, item) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.router.navigate(['/ruleset/buff-effect-details', item.buffAndEffectId]);
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      //this.router.navigate(['/character/buff-effect-details', item.characterBuffAandEffectId]);
      this.characterId = currentCombatantDetail.character.characterId;
      this.GoToCharbuff(item.buffAndEffect.buffAndEffectId);
    }
  }
  //Item Details
  CombatantItemDetail(currentCombatantDetail, item) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.router.navigate(['/ruleset/monster-item-details', item.itemId]);
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      this.router.navigate(['/character/inventory-details', item.itemId]);
    }

  }
  //Spell Details
  CombatantSpellDetail(currentCombatantDetail, item) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.router.navigate(['/ruleset/spell-details', item.spellId]);
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      //this.router.navigate(['/character/spell-details', item.characterSpellId]);
      this.characterId = currentCombatantDetail.character.characterId;
      this.GoToCharSpell(item.spell.spellId);
    }
  }
  //Ability Details
  CombatantAbilityDetail(currentCombatantDetail, item) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.router.navigate(['/ruleset/ability-details', item.abilityId]);
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      //this.router.navigate(['/character/ability-details', item.characterAbilityId]);
      this.characterId = currentCombatantDetail.character.characterId;
      this.GoToCharAbility(item.ability.abilityId);
    }
  }


  GoToCharSpell(RulesetSpellID: number) {

    this.isLoading = true;
    this.itemsService.GetCharSpellID(RulesetSpellID, this.characterId)
      .subscribe(
        data => {
          this.setCharacterID(this.characterId);
          this.isLoading = false;
          if (data) {
            let model: any = data;
            this.router.navigate(['/character/spell-details', model.characterSpellId]);
          }
          else {
            this.router.navigate(['/character/spell-detail', RulesetSpellID]);
          }
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail(error, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }
  GoToCharbuff(RulesetBuffID: number) {
    this.router.navigate(['/character/buff-effect-detail', RulesetBuffID]);
  }
  GoToCharAbility(RulesetAbilityId: number) {
    this.isLoading = true;
    this.itemsService.GetCharAbilityID(RulesetAbilityId, this.characterId)
      .subscribe(
        data => {
          this.setCharacterID(this.characterId);
          this.isLoading = false;
          if (data) {
            let model: any = data;
            this.router.navigate(['/character/ability-details', model.characterAbilityId]);
          }
          else {
            this.router.navigate(['/character/ability-detail', RulesetAbilityId]);
          }
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail(error, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  private setCharacterID(CharacterID: number) {
    this.localStorage.deleteData(DBkeys.CHARACTER_ID);
    this.localStorage.saveSyncedSessionData(CharacterID, DBkeys.CHARACTER_ID);
  }
  getFinalCommandString(inputString: string, statDetails: any, charactersCharacterStats: any, character: any) {
    return ServiceUtil.getFinalCalculationString(inputString, statDetails, charactersCharacterStats, character);
  }

  isValidSingleNumberCommand(inputString, includesCharacterStats) {
    /////code to delete/////////////
    //
    //if (item.type == combatantType.CHARACTER) {
    //  let statdetails = { charactersCharacterStat: item.character.diceRollViewModel.charactersCharacterStats, character: item.character.diceRollViewModel.character };
    //  var ressss = this.getFinalCommandString(command, statdetails, item.character.diceRollViewModel.charactersCharacterStats, item.character.diceRollViewModel.character)
    //}

    //////////////////
    let command: string = inputString;
    if (includesCharacterStats) {
      command = command.replace(/\[(.*?)\]/g, "0");
    }

    if (command) {
      if (command.toLowerCase().indexOf(' and') > -1) {
        return false;
      }
      if (command.indexOf('"') > -1) {
        return false;
      }
      if (command.indexOf("'") > -1) {
        return false;
      }
    }
    try {
      let number = DiceService.rollDiceExternally(this.alertService, command, this.customDices);
      if (isNaN(number)) {
        return false;
      }
      else {
        return true;
      }
    }
    catch (e) {
      return false;
    }
  }
  private setHeaderValues(ruleset: Ruleset): any {
    try {
      let headerValues = {
        headerName: ruleset.ruleSetName,
        headerImage: ruleset.imageUrl ? ruleset.imageUrl : 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png',
        headerId: ruleset.ruleSetId,
        headerLink: 'ruleset',
        hasHeader: true
      };
      this.appService.updateAccountSetting1(headerValues);
      this.sharedService.updateAccountSetting(headerValues);
      this.localStorage.deleteData(DBkeys.HEADER_VALUE);
      this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
    } catch (err) { }
  }
  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  }
  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

}
