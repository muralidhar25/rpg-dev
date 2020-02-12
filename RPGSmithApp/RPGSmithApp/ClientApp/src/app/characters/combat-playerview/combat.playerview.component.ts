import { Component, OnInit, HostListener } from '@angular/core';
import { fadeInOut } from '../../core/services/animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ActivatedRoute, Router } from "@angular/router";
import { CombatInitiativeComponent } from '../../rulesets/combat/combat-initiative/combat-initiative.component';
import { Characters } from '../../core/models/view-models/characters.model';
import { CombatDetails } from '../../core/models/view-models/combat-details.model';
import { Utilities } from '../../core/common/utilities';
import { combatantType, STAT_TYPE, MonsterDetailType, CHATACTIVESTATUS, SYSTEM_GENERATED_MSG_TYPE } from '../../core/models/enums';
import { CombatSettings } from '../../core/models/view-models/combatSettings.model';
import { CustomDice } from '../../core/models/view-models/custome-dice.model';
import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { DiceRollComponent } from '../../shared/dice/dice-roll/dice-roll.component';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { CombatService } from '../../core/services/combat.service';
import { AuthService } from '../../core/auth/auth.service';
import { DBkeys } from '../../core/common/db-keys';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { AppService1 } from '../../app.service';
import { SharedService } from '../../core/services/shared.service';
import { CharactersService } from '../../core/services/characters.service';
import { CombatBuffeffectDetailsComponent } from '../../rulesets/combat/combat-buffeffects-details/combat-buffeffects-details.component';
import { ImageViewerComponent } from '../../shared/image-interface/image-viewer/image-viewer.component';
import { CharactersCharacterStat } from '../../core/models/view-models/characters-character-stats.model';
import { initiative } from '../../core/models/view-models/initiative.model';
import { CombatHealthComponent } from '../../rulesets/combat/update-combat-health/update-combat-health.component';
import { setTimeout } from 'timers';
import { ItemsService } from '../../core/services/items.service';
import { EditItemComponent } from '../character-records/items/edit-item/edit-item.component';
import { CreateSpellsComponent } from '../../shared/create-spells/create-spells.component';
import { CreateAbilitiesComponent } from '../../shared/create-abilities/create-abilities.component';
import { CreateBuffAndEffectsComponent } from '../../shared/create-buff-and-effects/create-buff-and-effects.component';
import { EditMonsterComponent } from '../../records/monster/edit-monster/edit-monster.component';
import { CastComponent } from '../../shared/cast/cast.component';
import { DropItemsMonsterComponent } from '../../records/monster/drop-items-monster/drop-items-monster.component';
import { MonsterTemplateService } from '../../core/services/monster-template.service';
import { GivePlayerItemsComponent } from './give-player-items/give-player-items.component';

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
  combatants: any[] = [];
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
  DummyValueForCharHealthStat: number = -9999;
  noStatProvided: string = "No Stat Provided"
  noCharacterDescriptionProvided: string = 'No Character Description Provided';
  noMonsterDescriptionProvided: string = "No Monster Description Provided"
  noBuffs_EffectsAvailable: string = 'No Buffs & Effects Available';
  noItemsAvailable: string = 'No Items Available';
  noSpellsAvailable: string = 'No Spells Available';
  noAbilitiesAvailable: string = 'No Abilities Available';
  noCommandsAvailable: string = 'No Commands Available';
  refreshPage: any;
  initialLoad: boolean = false;
  curretnCombatant: any;
  isCombatStarted: boolean = false;
  timeoutHandler: any;
  doesCharacterHasAllies: boolean = false;
  monsterDetailType = MonsterDetailType;
  isDropdownOpenNewWindow: boolean = false;

  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className.endsWith("newWindow-toggle-btn")) {
        this.isDropdownOpenNewWindow = !this.isDropdownOpenNewWindow;
      }
      else {
        this.isDropdownOpenNewWindow = false;
      }
    } catch (err) { this.isDropdownOpenNewWindow = false; }
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
    private charactersService: CharactersService,
    private router: Router,
    private itemsService: ItemsService,
    private monsterTemplateService: MonsterTemplateService) {
    this.route.params.subscribe(params => { this.characterId = params['id']; });

    this.rulesetModel.ruleSetName = 'Orc Shaman';
    this.rulesetModel.imageUrl = 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg';

    this.appService.shouldUupdateMonsterForPlayerView().subscribe(monster => {
      if (monster) {
        let updatedItems = monster._items && monster._items.length ?
          monster._items.map(item => {
            return {
              itemId: item.itemId,
              itemName: item.name,
              itemImage: item.imageUrl,
              monsterId: monster.monsterId,
            }
          })
          : [];

        let updatedSpells = monster._spells && monster._spells.length ?
          monster._spells.map(spell => {
            return {
              spellId: spell.spellId,
              spell: {
                name: spell.name,
                imageUrl: spell.imageUrl,
              },
              monsterId: monster.monsterId,
            }
          })
          : [];

        let updatedAbilities = monster._abilities && monster._abilities.length ?
          monster._abilities.map(ability => {
            return {
              abilityId: ability.abilityId,
              ability: {
                name: ability.name,
                imageUrl: ability.imageUrl,
              },
              monsterId: monster.monsterId,
            }
          })
          : [];

        let updatedBuff_Effects = monster._buffEffects && monster._buffEffects.length ?
          monster._buffEffects.map(buffEffect => {
            return {
              buffAndEffectId: buffEffect.buffAndEffectId,
              buffAndEffect: {
                name: buffEffect.name,
                imageUrl: buffEffect.imageUrl,
              },
              monsterId: monster.monsterId,
            }
          })
          : [];

        let obj = Object.assign(this.currentCombatantDetail.monster, {
          armorClass: monster.monsterArmorClass,
          challangeRating: monster.monsterChallangeRating,
          command: monster.command,
          commandName: monster.commandName,
          description: monster.description,
          healthCurrent: monster.monsterHealthCurrent,
          healthMax: monster.monsterHealthMax,
          imageUrl: monster.imageUrl,
          itemMasterMonsterItems: updatedItems,
          monsterAbilitys: updatedAbilities,
          monsterBuffAndEffects: updatedBuff_Effects,
          monsterSpells: updatedSpells,
          name: monster.name,
          stats: monster.stats,
          xpValue: monster.monsterXPValue
        });
        this.currentCombatantDetail.monster = obj;
        //this.combatants.map((_c) => {
        //  if (_c) {

        //  }
        //})
      }
    });
  }

  ngOnInit() {


    this.charactersService.isAllyAssigned(this.characterId).subscribe(data => {
      if (data) {
        this.doesCharacterHasAllies = true;
      }
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      }
    });

    this.GetCombatDetails();

    this.destroyModalOnInit();
  }
  ngOnDestroy() {
    if (this.refreshPage) {
      clearInterval(this.refreshPage)
    }
  }
  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }
  GetCombatDetails(ShowLoader = true) {
    if (ShowLoader) {
      this.isLoading = true;
    }

    //////////////
    this.charactersService.getCharactersById<any>(this.characterId)
      .subscribe(data => {
        this.character = data;
        this.rulesetModel = data.ruleSet;
        this.ruleSetId = this.rulesetModel.ruleSetId;
        //this.isLoading = false;
        this.setHeaderValues(this.character);
        this.characterId = data.characterId;

      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        } else {
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }
      }, () => {
        //init=true;
        this.initialLoad = true;
        this.bindCombatantInitiatives();

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
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.recordName = this.character.characterName;
    this.bsModalRef.content.recordImage = this.character.imageUrl;
  }

  progressHealth(item) {
    this.bsModalRef = this.modalService.show(CombatHealthComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Health";
    this.bsModalRef.content.combatInfo = item;
    this.bsModalRef.content.event.subscribe(result => {
      this.appService.updateCombatantDetailFromGM(true);
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

  buffEffectclick(item) {
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
    if (item.type == combatantType.CHARACTER) {
      let characterId = item.character.characterId;
      if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
        let ChatWithDiceRoll = [];
        if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
          ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
        }
        let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.OPEN_CHAT_FOR_CHARACTER, obj: characterId }
        ChatWithDiceRoll.push(chatMsgObject);
        this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
      } else {
        this.appService.updateOpenChatForCharacter(characterId);
      }
    }

  }

  TargetBtn(item) {
    if (item) {
      this.combatants.map(x => {
        if (this.currentCombatantDetail.type == combatantType.MONSTER && (this.currentCombatantDetail.monster.characterId && this.currentCombatantDetail.monster.characterId == this.characterId)) {
          if (x.type == combatantType.MONSTER && x.monster.monsterId == this.currentCombatantDetail.monster.monsterId) {
            if (item.type == combatantType.CHARACTER) {
              x.targetId = item.character.characterId;
              x.targetType = item.type;
            }
            if (item.type == combatantType.MONSTER) {
              x.targetId = item.monster.monsterId;
              x.targetType = item.type;
            }
            this.SaveTarget(x);
          }
        } else {
          if (x.isOwnPlayer) {
            if (item.type == combatantType.CHARACTER) {
              x.targetId = item.character.characterId;
              x.targetType = item.type;
            }
            if (item.type == combatantType.MONSTER) {
              x.targetId = item.monster.monsterId;
              x.targetType = item.type;
            }
            this.SaveTarget(x);
          }
        }
      });
    }

  }
  RemoveTargetBtn(item) {
    if (item) {
      this.combatants.map(x => {
        if (item.type == combatantType.MONSTER && (item.monster.characterId && item.monster.characterId == this.characterId)) {
          if (x.type == combatantType.MONSTER && x.monster.monsterId == item.monster.monsterId) {
            x.targetId = 0;
            x.targetType = null;
            this.SaveTarget(x);
          }
        } else {
          if (x.isOwnPlayer) {
            x.targetId = 0;
            x.targetType = null;
            this.SaveTarget(x);
          }
        }
      });
    }
  }
  SaveTarget(combatatnt) {
    this.combatService.saveTarget(combatatnt).subscribe(res => {
      //let result = res;
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  getTargetImage(item) {
    let imageUrl = '';
    if (item.targetType == this.combatantsType.MONSTER) {
      this.combatants.map(x => {
        if (x.type == this.combatantsType.MONSTER) {
          if (x.monster.monsterId == item.targetId) {
            imageUrl = x.monster.imageUrl;
          }
        }

      });
    }
    else if (item.targetType == this.combatantsType.CHARACTER) {
      this.combatants.map(x => {
        if (x.type == this.combatantsType.CHARACTER) {
          if (x.character.characterId == item.targetId) {
            imageUrl = x.character.imageUrl;
          }
        }

      });
    }
    return imageUrl;
  }

  getTargetName(item) {
    let name = '';
    if (item.targetType == this.combatantsType.MONSTER) {
      this.combatants.map(x => {
        if (x.type == this.combatantsType.MONSTER) {
          if (x.monster.monsterId == item.targetId) {
            name = x.monster.name;
          }
        }

      });
    }
    else if (item.targetType == this.combatantsType.CHARACTER) {
      this.combatants.map(x => {
        if (x.type == this.combatantsType.CHARACTER) {
          if (x.character.characterId == item.targetId) {
            name = x.character.characterName;
          }
        }

      });
    }
    return name;
  }

  TargetClick(item) {
    this.combatants.map(x => {
      if (x.type == combatantType.MONSTER && x.monsterId == item.targetId && item.targetType == combatantType.MONSTER) {
        this.frameClick(x);
      }
      else if (x.type == combatantType.CHARACTER && x.characterId == item.targetId && item.targetType == combatantType.CHARACTER) {
        this.frameClick(x);
      }
    });
  }

  ImageDeatil(itemDetail, imgref) {
    if (itemDetail.type == this.combatantsType.MONSTER) {
      if (itemDetail.monster.characterId && itemDetail.monster.characterId == this.characterId) {
        this.router.navigate(['/character/allies-detail', itemDetail.monster.monsterId]);
      } else if (this.settings.accessMonsterDetails) {
        this.router.navigate(['/character/player-monster-details', itemDetail.monster.monsterId]);
      } else {
        this.ViewImage(imgref);
      }
    }
    if (itemDetail.type == this.combatantsType.CHARACTER) {
      this.ViewImage(imgref)
    }
    //this.ViewImage(imgref)

  }

  ViewImage(img) {
    if (img) {
      this.bsModalRef = this.modalService.show(ImageViewerComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.ViewImageUrl = img.src;
      this.bsModalRef.content.ViewImageAlt = img.alt;
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
  refreshPageData() {

    if (this.localStorage.localStorageGetItem(DBkeys.IsConnected)) {
      this.refreshPage = setInterval(() => {
        //console.log("update");
        this.combatService.isCombatUpdatedAndCurrentTurn(this.CombatId).subscribe(data => {
          //console.log("res ", data);
          let res: any = data;
          if (res) {
            if (res.isCombatUdated) {
              if (this.refreshPage) {
                clearInterval(this.refreshPage)
              }
              //init=false;
              this.initialLoad = false;
              setTimeout(() => {
                this.combatService.markCombatAsUpdatedFlagFalse(this.CombatId).subscribe(res => {
                  this.bindCombatantInitiatives();
                }, error => {
                  this.bindCombatantInitiatives();
                });
              }, 1000)

            }
            if (res.currentTurnCombatantId) {

              let curretnCombatant = this.combatants.find(x => x.id == res.currentTurnCombatantId);
              if (curretnCombatant) {
                let valueofinitiative = curretnCombatant.initiativeValue;
                this.CurrentInitiativeValue = valueofinitiative;
                //this.currentCombatantDetail = curretnCombatant;
                this.roundCounter = res.currentRound;
                if (this.roundCounter > 1) {

                  let roundTime = this.settings.gameRoundLength * this.roundCounter;
                  this.gametime = this.time_convert(roundTime);

                }
                this.combatants.map((x) => {
                  x.isCurrentTurn = false;
                  if (x.id == res.currentTurnCombatantId) {
                    x.isCurrentTurn = true;
                  }
                })
              }

            }



          }

        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          } else {
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          }
        });
        //this.bindCombatantInitiatives();
      }, 1500);
    }
  }
  bindCombatantInitiatives() {
    this.combatService.getCombatDetails(this.ruleSetId, true, 0).subscribe(res => {
      if (res) {
        let combatModal: any = res;
        this.roundCounter = combatModal.round;
        this.CombatId = combatModal.id
        this.rulesetModel = combatModal.campaign;
        this.settings = combatModal.combatSettings;
        this.combatants = combatModal.combatantList;
        this.isCombatStarted = combatModal.isStarted;

        this.appService.updateCombatStarted(combatModal.isStarted);

        //let unknownMonsterNameCount = 1;
        this.appService.updateCombatantDetailFromGM(true);
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
            x.frameColor = 'blue';
            ////this.ownPlayer.push(x);
          } else {
            x.isOwnPlayer = false;
          }

          if (x.type == this.combatantsType.CHARACTER) {
            if (x.character.diceRollViewModel.charactersCharacterStats) {
              let statFoundFlag: boolean = false;
              let charStat: CharactersCharacterStat = null;
              this.settings.charcterHealthStats.split(/\[(.*?)\]/g).map((rec) => {
                if (rec && !statFoundFlag) {
                  let charStatList = x.character.diceRollViewModel.charactersCharacterStats.filter(x => x.characterStat.statName.toUpperCase() == rec.toUpperCase());
                  if (charStatList.length) {
                    charStat = charStatList[0];
                  }
                  statFoundFlag = true;
                }
              });

              x.character.healthCurrent = this.DummyValueForCharHealthStat;
              x.character.healthMax = this.DummyValueForCharHealthStat;
              if (charStat) {
                x.character.charStat = charStat;
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

          if (x.type == this.combatantsType.MONSTER) {
            if (x.visibleToPc && !x.showMonsterName) {
              x.monster.name = x.hiddenMonsterName;
              //x.monster.name = "Unknown #" + unknownMonsterNameCount;
              // unknownMonsterNameCount = unknownMonsterNameCount + 1;
            }
          }

        });

        // Game Time
        this.gametime = this.time_convert(this.settings.gameRoundLength);

        //if (this.combatants.length) {
        //  this.frameClick(this.combatants[0]);
        //}


        this.isCharacterItemEnabled = combatModal.isCharacterItemEnabled;
        this.isCharacterSpellEnabled = combatModal.isCharacterSpellEnabled;
        this.isCharacterAbilityEnabled = combatModal.isCharacterAbilityEnabled;
        let curretnCombatantList = this.combatants.filter(x => x.isCurrentTurn);
        //let curretnCombatant = new initiative();
        this.curretnCombatant = new initiative();
        if (curretnCombatantList.length) {
          this.curretnCombatant = curretnCombatantList[0];
          let valueofinitiative = this.curretnCombatant.initiativeValue;
          this.CurrentInitiativeValue = valueofinitiative;
        }
        if (this.initialLoad) {
          this.frameClick(this.curretnCombatant);
        } else {
          this.frameClick(this.currentCombatantDetail);
        }


        if (this.roundCounter > 1) {
          //this.roundCounter = this.roundCounter + 1;
          ////convert time
          let roundTime = this.settings.gameRoundLength * this.roundCounter;
          this.gametime = this.time_convert(roundTime);
          //this.frameClick(curretnCombatant)


        }
        //////////
        this.refreshPageData();
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
  description(text) {
    if (text) {
      var encodedStr = text;
      var parser = new DOMParser;
      var dom = parser.parseFromString(
        '<!doctype html><body>' + encodedStr,
        'text/html');
      var decodedString = dom.body.textContent;
      return decodedString;
    }
    return '';
  }
  // Buff_EffectDetail
  CombatantBuff_EffectDetail(currentCombatantDetail, item) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.router.navigate(['/character/combat-pc-buff-effect-detail', item.buffAndEffectId]);
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      if (currentCombatantDetail.isOwnPlayer) {
        this.CombatantBuff_EffectDetail_OwnPlayer(currentCombatantDetail, item);
      } else {
        this.router.navigate(['/character/combat-pc-buff-effect-detail', item.buffAndEffect.buffAndEffectId]);
      }
    }
  }
  // Buff_EffectDetail
  CombatantBuff_EffectDetail_OwnPlayer(currentCombatantDetail, item) {
    //if (currentCombatantDetail.type == combatantType.MONSTER) {
    //  this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
    //  this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
    //  this.router.navigate(['/ruleset/buff-effect-details', item.buffAndEffectId]);
    //}
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      //this.router.navigate(['/character/buff-effect-details', item.characterBuffAandEffectId]);
      this.characterId = currentCombatantDetail.character.characterId;
      this.GoToCharbuff(item.buffAndEffect.buffAndEffectId);
    }
  }

  // Item Details
  CombatantItemDetail(currentCombatantDetail, item) {
    //if (currentCombatantDetail.type == combatantType.MONSTER) {
    //  this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
    //  this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
    //  this.router.navigate(['/ruleset/monster-item-details', item.itemId]);
    //}
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
      this.router.navigate(['/character/inventory-details', item.itemId]);
    }
  }

  // Spell Details
  CombatantSpellDetail(currentCombatantDetail, item) {
    //if (currentCombatantDetail.type == combatantType.MONSTER) {
    //  this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
    //  this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
    //  this.router.navigate(['/ruleset/spell-details', item.spellId]);
    //}
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      //this.router.navigate(['/character/spell-details', item.characterSpellId]);
      this.characterId = currentCombatantDetail.character.characterId;
      this.GoToCharSpell(item.spell.spellId);
    }
  }

  // Ability Details
  CombatantAbilityDetail(currentCombatantDetail, item) {
    //if (currentCombatantDetail.type == combatantType.MONSTER) {
    //  this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
    //  this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
    //  this.router.navigate(['/ruleset/ability-details', item.abilityId]);
    //}
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      //this.router.navigate(['/character/ability-details', item.characterAbilityId]);
      this.characterId = currentCombatantDetail.character.characterId;
      this.GoToCharAbility(item.ability.abilityId);
    }
  }

  // Saved Commands
  CombatantCommands(currentCombatantDetail, item) {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = item.command;
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
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
            this.router.navigate(['/character/spell-details', model.characterSpellId]);
          }
          else {
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
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
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
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
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
            this.router.navigate(['/character/ability-details', model.characterAbilityId]);
          }
          else {
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, true);
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

  MarkTurnAsComplete() {
    let skipIsCurrentTurnCheck: boolean = false;
    for (let i = 0; i < this.combatants.length; i++) {
      if ((this.combatants[i].isCurrentTurn == true && this.combatants[i + 1]) || (skipIsCurrentTurnCheck && this.combatants[i + 1])) {
        this.combatants[i].isCurrentTurn = false;
        if (this.combatants[i + 1].delayTurn) {
          skipIsCurrentTurnCheck = true;
          continue;
        }
        this.combatants[i + 1].isCurrentTurn = true;
        this.curretnCombatant = this.combatants[i + 1];
        let valueofinitiative = this.combatants[i + 1].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;
        this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter, true);
        //this.frameClick(this.curretnCombatant)
        return;
      }
      else if (!this.combatants[i + 1]) {
        if (this.roundCounter != 0 && this.settings.rollInitiativeEveryRound) {
          //this.Init(true);
        }
        this.combatants[i].isCurrentTurn = false;
        if (this.combatants[i - i].delayTurn) {
          i = -1;
          skipIsCurrentTurnCheck = true;
          this.roundCounter = this.roundCounter + 1;
          //convert time
          let roundTime = this.settings.gameRoundLength * this.roundCounter;
          this.gametime = this.time_convert(roundTime);
          continue;
        }
        this.combatants[i - i].isCurrentTurn = true;
        this.curretnCombatant = this.combatants[i - i];
        let valueofinitiative = this.combatants[i - i].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;

        this.roundCounter = this.roundCounter + 1;
        //convert time
        let roundTime = this.settings.gameRoundLength * this.roundCounter;
        this.gametime = this.time_convert(roundTime);
        this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter, true);
        //this.frameClick(this.curretnCombatant)
        return;
      }

    }
  }

  SaveCombatantTurn(curretnCombatant, roundCount, CharacterHasChangedTurn) {
    //this.isLoading = true;
    this.combatService.saveCombatantTurn(curretnCombatant, roundCount, CharacterHasChangedTurn).subscribe(res => {
      this.appService.updateCombatantDetailFromGM(true);
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

  clickAndHold() {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  editBuff_Effect(buff_Effect, currentCombatantDetail) {
    this.timeoutHandler = setInterval(() => {
      this.EditBuff_Effect(buff_Effect, currentCombatantDetail);
    }, 1000);
  }

  EditBuff_Effect(buff_Effect, currentCombatantDetail) {
    this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Buff & Effect';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.buffAndEffectVM = buff_Effect;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.isEditingWithoutDetail = true;
    this.bsModalRef.content.combatant = currentCombatantDetail;
  }

  editItem(item) {
    this.timeoutHandler = setInterval(() => {
      this.EditItem(item);
    }, 1000);
  }

  EditItem(item) {
    this.bsModalRef = this.modalService.show(EditItemComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Item';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.itemVM = item;
    this.bsModalRef.content.isEditingWithoutDetail = true;
  }

  editSpell(spell, currentCombatantDetail) {
    this.timeoutHandler = setInterval(() => {
      this.EditSpell(spell, currentCombatantDetail);
    }, 1000);
  }

  EditSpell(spell, currentCombatantDetail) {
    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Spell';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.spellVM = spell;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.isFromCharacter = true;
    this.bsModalRef.content.isFromCharacterId = +this.characterId;
    this.bsModalRef.content.isEditingWithoutDetail = true;
    this.bsModalRef.content.combatant = currentCombatantDetail;
  }

  editAbility(ability, currentCombatantDetail) {
    this.timeoutHandler = setInterval(() => {
      this.EditAbility(ability, currentCombatantDetail);
    }, 1000);
  }

  EditAbility(ability, currentCombatantDetail) {
    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Ability';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.abilityVM = ability;
    this.bsModalRef.content.isFromCharacter = true;
    this.bsModalRef.content.isFromCharacterId = +this.characterId;
    this.bsModalRef.content.isFromCharacterAbilityId = ability.characterAbilityId;
    this.bsModalRef.content.rulesetID = this.ruleSetId
    this.bsModalRef.content.isEditingWithoutDetail = true;
    this.bsModalRef.content.combatant = currentCombatantDetail;
  }

  editMonster(monster, currentCombatantDetail) {
    this.timeoutHandler = setInterval(() => {
      this.EditMonster(monster, currentCombatantDetail);
    }, 1000);
  }

  EditMonster(monster, currentCombatantDetail) {
    this.bsModalRef = this.modalService.show(EditMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Monster';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterVM = currentCombatantDetail.monster.monsterId;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.isFromCombatScreen = true;
  }

  updateMonster(item, type) {
    //this.bsModalRef = this.modalService.show(UpdateMonsterHealthComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
    //this.bsModalRef.content.title = type;
    //this.bsModalRef.content.combatInfo = item;
    //this.bsModalRef.content.event.subscribe(result => {
    //  //if (result.type == combatantType.CHARACTER) {
    //  //  item.character.healthCurrent = result.character.healthCurrent;
    //  //  item.character.healthMax = result.character.healthMax;
    //  //}
    //  if (result.type == MonsterDetailType.HEALTH && result.record.type == combatantType.MONSTER) {
    //    item.monster.healthCurrent = result.record.monster.healthCurrent;
    //    item.monster.healthMax = result.record.monster.healthMax;
    //  }
    //  else if (result.type == MonsterDetailType.RATING && result.record.type == combatantType.MONSTER) {
    //    item.monster.challangeRating = result.record.monster.challangeRating;
    //  }
    //  else if (result.type == MonsterDetailType.ARMOR && result.record.type == combatantType.MONSTER) {
    //    item.monster.armorClass = result.record.monster.armorClass;
    //  }
    //  else if (result.type == MonsterDetailType.INITIATIVE && result.record.type == combatantType.MONSTER) {
    //    item.initiative = result.record.initiative;
    //  }
    //  else if (result.type == MonsterDetailType.XPVALUE && result.record.type == combatantType.MONSTER) {
    //    item.monster.xpValue = result.record.monster.xpValue;
    //  }
    //});
  }

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
            this.bsModalRef.content.Ruleset = this.rulesetModel;
            this.bsModalRef.content.displayRollResultInChat_AfterAllChecks = this.settings.displayMonsterRollResultInChat;
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
    this.bsModalRef.content.isFromCampaignDetail = true;
    this.bsModalRef.content.displayRollResultInChat_AfterAllChecks = this.settings.displayMonsterRollResultInChat;
    if (monster.hasOwnProperty("monsterId")) {
      this.bsModalRef.content.recordName = monster.name;
      this.bsModalRef.content.recordImage = monster.imageUrl;
      this.bsModalRef.content.recordType = 'monster';
      this.bsModalRef.content.recordId = monster.monsterId;
    }
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
  }

  GiveItems(item) {
    let giveTo_Combatant = [];
    let PlayerItems: any;
    let newcombatants = [];
    let givenByPlayerID = 0;
    this.combatants.map(x => {
      if (x.type == this.combatantsType.CHARACTER && x.isOwnPlayer) {
        PlayerItems = x.character.items;
        givenByPlayerID = x.character.characterId
      }
      if (x.type == this.combatantsType.CHARACTER && !x.isOwnPlayer) {
        newcombatants.push({
          id: x.character.characterId,
          name: x.character.characterName,
          imageUrl: x.character.imageUrl,
          type: x.type
        });
      }
      if (x.type == this.combatantsType.MONSTER && !x.isOwnPlayer) {
        newcombatants.push({
          id: x.monster.monsterId,
          name: x.monster.name,
          imageUrl: x.monster.imageUrl,
          type: x.type
        });
      }

    });


    if (item.type == this.combatantsType.CHARACTER) {
      giveTo_Combatant.push({
        id: item.character.characterId,
        name: item.character.characterName,
        imageUrl: item.character.imageUrl,
        type: item.type
      });
    }
    if (item.type == this.combatantsType.MONSTER) {
      giveTo_Combatant.push({
        id: item.monster.monsterId,
        name: item.monster.name,
        imageUrl: item.monster.imageUrl,
        type: item.type
      });
    }

    this.bsModalRef = this.modalService.show(GivePlayerItemsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.giveTo_Combatant = giveTo_Combatant;
    this.bsModalRef.content.playerItems = PlayerItems;
    this.bsModalRef.content.combatants = newcombatants;
    this.bsModalRef.content.givenByPlayerID = givenByPlayerID;
    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.GetCombatDetails();
      }
    });
  }

  LaunchChatStyleCombatTracker() {
    this.appService.updateOpenCombatChat(true);
  }

}
