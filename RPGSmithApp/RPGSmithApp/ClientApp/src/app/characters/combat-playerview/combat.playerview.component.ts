import { Component, OnInit } from '@angular/core';
import { fadeInOut } from '../../core/services/animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ActivatedRoute } from "@angular/router";
import { CombatInitiativeComponent } from '../../rulesets/combat/combat-initiative/combat-initiative.component';
import { Characters } from '../../core/models/view-models/characters.model';
import { CombatDetails } from '../../core/models/view-models/combat-details.model';
import { Utilities } from '../../core/common/utilities';
import { combatantType } from '../../core/models/enums';
import { CombatSettings } from '../../core/models/view-models/combatSettings.model';
import { CustomDice } from '../../core/models/view-models/custome-dice.model';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { DiceRollComponent } from '../../shared/dice/dice-roll/dice-roll.component';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { CombatService } from '../../core/services/combat.service';
import { AuthService } from '../../core/auth/auth.service';
import { AddCombatMonsterComponent } from '../../rulesets/combat/add-combat-monster/add-monster-combat.component';
import { RemoveCombatMonsterComponent } from '../../rulesets/combat/remove-combat-monster/remove-monster-combat.component';
import { DBkeys } from '../../core/common/db-keys';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AppService1 } from '../../app.service';
import { SharedService } from '../../core/services/shared.service';
import { CharactersService } from '../../core/services/characters.service';
import { CombatBuffeffectDetailsComponent } from '../../rulesets/combat/combat-buffeffects-details/combat-buffeffects-details.component';
import { initiative } from '../../core/models/view-models/initiative.model';

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
  combatantsType = combatantType;
  isLoading: boolean = false;
  CombatId: number;
  isCharacterItemEnabled: boolean = false;
  isCharacterSpellEnabled: boolean = false;
  isCharacterAbilityEnabled: boolean = false;
  characterId: number = 0;
  currentCombatantDetail: any;
  ownPlayer: any[] = [];
  Target: any[] = [];

  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }


  constructor(
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private combatService: CombatService,
    private authService: AuthService,
    private localStorage: LocalStoreManager,
    private appService: AppService1,
    private sharedService: SharedService,
    private charactersService: CharactersService) {

    this.route.params.subscribe(params => { this.characterId = params['id']; });
    //this.roundCounter = 1;

    //this.combatDetails = {
    //  id: 1,
    //  name: 'ORC SHAMAN',
    //  image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //  stats: '<p>Hero Hitman ORC SHAMAN </p>',
    //  buffEffects: [
    //    {
    //      id: 1,
    //      name: 'Effect1',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg'
    //    },
    //    {
    //      id: 2,
    //      name: '1215',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png'

    //    }
    //  ],
    //  desc: '<p> this is Description</p>',
    //  items: [
    //    {
    //      id: 1,
    //      name: 'Arrow',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/arrow.jpg'
    //    },
    //    {
    //      id: 2,
    //      name: 'Almut of Proof',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/amuletdetectionlocation.jpg'

    //    }
    //  ],
    //  spells: [
    //    {
    //      id: 1,
    //      name: 'AlterSelf',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/user-rpgshare-dnd5e/s20.jpg'
    //    },
    //    {
    //      id: 2,
    //      name: 'DeadSoul',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/user-rpgshare-dnd5e/s21.jpg'

    //    }
    //  ],
    //  abilites: [
    //    {
    //      id: 1,
    //      name: 'Spell1',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/arrow.jpg'
    //    },
    //    {
    //      id: 2,
    //      name: 'Spell_Boom',
    //      image: 'https://rpgsmithsa.blob.core.windows.net/core-dnd5e/amuletdetectionlocation.jpg'

    //    }
    //  ]
    //};
    //this.combatants = [
    //  {
    //    id: 1,
    //    name: 'Orc #2',
    //    type: combatantType.CHARACTER,
    //    healthCurrent: 50,
    //    healthMax: 100,
    //    buffEffect:
    //      [
    //        {
    //          id: 1,
    //          name: 'Visible',
    //          icon: 'icon-Rec-Visible'
    //        },
    //        {
    //          id: 2,
    //          name: 'CharStatcommand',
    //          icon: 'icon-CharStat-Command'
    //        },
    //      ],
    //    colorCode: 'green',
    //    frameColor: 'black',
    //    hidebtns: false,
    //    isCurrentTurn: true,
    //    initiativeValue: 'D4'
    //  },
    //  {
    //    id: 2,
    //    name: 'monster2',
    //    type: combatantType.MONSTER,
    //    healthCurrent: 60,
    //    healthMax: 100,
    //    buffEffect:
    //      [
    //        {
    //          id: 1,
    //          name: 'CharStatcommand',
    //          icon: 'icon-CharStat-Command',
    //         },

    //      ],
    //    colorCode: 'red',
    //    frameColor: 'red',
    //    hidebtns: false,
    //    isCurrentTurn: false,
    //    initiativeValue: 'D2'
    //  },
    //  {
    //    id: 3,
    //    name: 'Orc #3',
    //    type: combatantType.MONSTER,
    //    healthCurrent: 10,
    //    healthMax: 100,
    //    buffEffect:
    //      [
    //        {
    //          id: 1,
    //          name: 'Visible',
    //          icon: 'icon-Rec-Visible',
    //        },
    //        {
    //          id: 2,
    //          name: 'CharStatcommand',
    //          icon: 'icon-CharStat-Command',
    //         },
    //      ],
    //    colorCode: 'green',
    //    frameColor: 'Gray',
    //    hidebtns: false,
    //    isCurrentTurn: false,
    //    initiativeValue: 'D1'
    //  },
    //  {
    //    id: 4,
    //    name: 'Orc #4',
    //    type: combatantType.CHARACTER,
    //    healthCurrent: 50,
    //    healthMax: 100,
    //    buffEffect:
    //      [
    //        {
    //          id: 1,
    //          name: 'Visible',
    //          icon: 'icon-Rec-Visible',
    //        },
    //        {
    //          id: 2,
    //          name: 'CharStatcommand',
    //          icon: 'icon-CharStat-Command',
    //         },
    //      ],
    //    colorCode: 'green',
    //    frameColor: 'blue',
    //    hidebtns: false,
    //    isCurrentTurn: false,
    //    initiativeValue: 'D4'
    //  }
    //];

    //initiativeValue change
    //this.combatants.map((x) => {
    //  if (x.initiativeValue) {
    //    let res = DiceService.rollDiceExternally(this.alertService, x.initiativeValue, this.customDices);
    //    if (isNaN(res)) {
    //      x.initiativeValue = 0;
    //    }
    //    else {
    //      x.initiativeValue = res;
    //    }

    //  } else {
    //    x.initiativeValue = 0;
    //  }
    //})

    //adding Image and name in ruleset
    this.rulesetModel.ruleSetName = 'Orc Shaman';
    this.rulesetModel.imageUrl = 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg';
    //this.CurrentInitiativeValue = this.combatants[0].initiativeValue;

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
  openpopup() {
    console.log('Open popup');
    //this.bsModalRef = this.modalService.show(CharacterStatClusterTileComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
  }

  ngOnInit() {
    this.GetCombatDetails();
    this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.destroyModalOnInit();
  }
  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }
  GetCombatDetails() {
    this.isLoading = true;
    //////////////
    this.charactersService.getCharactersById<any>(this.characterId)
      .subscribe(data => {
        this.character = data;
        this.rulesetModel = data.ruleSet;
        this.ruleSetId = this.rulesetModel.ruleSetId;
        //this.isLoading = false;
        this.setHeaderValues(this.character);
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        } else {
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }
      }, () => {
        this.combatService.getCombatDetails(this.ruleSetId).subscribe(res => {
          if (res) {
            let combatModal: any = res;
            this.roundCounter = combatModal.round;
            this.CombatId = combatModal.id
            this.rulesetModel = combatModal.campaign;
            this.settings = combatModal.combatSettings;
            if (this.settings.monsterVisibleByDefault) {
              this.combatants = combatModal.combatantList;
            } else {
              let combatantsWithoutMonster = combatModal.combatantList;;
              combatantsWithoutMonster.map(x => {
                if (x.type == this.combatantsType.CHARACTER) {
                  this.combatants.push(x);
                }
              });
            }

            this.combatants.map((x) => {
              x.initiativeValue = x.initiative;
              if (!x.combatId) {
                x.combatId = combatModal.id;
              }
              if (!x.visibilityColor) {
                if (x.type == this.combatantsType.CHARACTER) {
                  x.visibilityColor = "green";
                }
                else if (x.type == this.combatantsType.MONSTER) {
                  x.visibilityColor = "red";
                }
              }
              // Own player
              if (x.type == this.combatantsType.CHARACTER && x.character.characterId == this.characterId) {
                x.isOwnPlayer = true;
                ////this.ownPlayer.push(x);
              } else {
                x.isOwnPlayer = false;
              }

            });

            // Game Time
            this.gametime = this.time_convert(this.settings.gameRoundLength);

            this.frameClick(this.combatants[0]);

            this.isCharacterItemEnabled = combatModal.isCharacterItemEnabled;
            this.isCharacterSpellEnabled = combatModal.isCharacterSpellEnabled;
            this.isCharacterAbilityEnabled = combatModal.isCharacterAbilityEnabled;

            if (this.roundCounter > 1) {
              debugger
              let curretnCombatantList = this.combatants.filter(x => x.isCurrentTurn);
              let curretnCombatant = new initiative();
              if (curretnCombatantList.length) {
                curretnCombatant = curretnCombatantList[0];
              }

              let valueofinitiative = curretnCombatant.initiativeValue;
              this.CurrentInitiativeValue = valueofinitiative;

              //this.roundCounter = this.roundCounter + 1;
              ////convert time
              let roundTime = this.settings.gameRoundLength * this.roundCounter;
              this.gametime = this.time_convert(roundTime);
              this.frameClick(curretnCombatant)
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
      });
    /////////////////   
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
    if (item.type == this.combatantsType.CHARACTER) {
      this.bsModalRef.content.recordName = item.character.characterName;
      this.bsModalRef.content.recordImage = item.character.imageUrl;
      this.bsModalRef.content.buffEffectList = item.character.characterBuffAndEffects;
      this.bsModalRef.content.type = item.type;
      this.bsModalRef.content.character = item;
        debugger
      //this.bsModalRef.content.characterId = item.character.characterId;
      if (item.isOwnPlayer) {
        this.bsModalRef.content.hideEditBtn = false;
      } else {
        this.bsModalRef.content.hideEditBtn = true;
      }
    }
    if (item.type == this.combatantsType.MONSTER) {
      this.bsModalRef.content.recordName = item.monster.name;
      this.bsModalRef.content.recordImage = item.monster.imageUrl;
      this.bsModalRef.content.buffEffectList = item.monster.monsterBuffAndEffects;
      this.bsModalRef.content.type = item.type;
      this.bsModalRef.content.monster = item;
      this.bsModalRef.content.hideEditBtn = true;
    }
  }

  frameClick(item) {
    this.currentCombatantDetail = item;
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

  //opens one to one chat
  ChatBtn(item) {
    console.log('target', item);
  }

  TargetBtn(item) {
    debugger
    if (item) {
      this.Target = [];
        if (item.type == this.combatantsType.CHARACTER) {
          this.Target.push({ name: item.character.characterName, image: item.character.imageUrl });
        }
        if (item.type == this.combatantsType.MONSTER) {
          this.Target.push({ name: item.monster.name, image: item.monster.imageUrl });
        }
      this.combatants.map(x => {
        if (x.isOwnPlayer) {
          x.Target = this.Target;
        }
      });
    }

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

  private setHeaderValues(character: Characters): any {
    let headerValues = {
      headerName: character.characterName,
      headerImage: character.imageUrl,
      headerId: character.characterId,
      headerLink: 'character',
      hasHeader: true
    };
    this.appService.updateAccountSetting1(headerValues);
    this.sharedService.updateAccountSetting(headerValues);
    this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
  }
}
