import { Component, OnInit } from '@angular/core';
import { fadeInOut } from '../../../core/services/animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ActivatedRoute, Router } from "@angular/router";
import { setTimeout } from 'timers';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { CombatService } from '../../../core/services/combat.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AppService1 } from '../../../app.service';
import { SharedService } from '../../../core/services/shared.service';
import { CombatDetails } from '../../../core/models/view-models/combat-details.model';
import { CustomDice } from '../../../core/models/view-models/custome-dice.model';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { CombatSettings } from '../../../core/models/view-models/combatSettings.model';
import { combatantType, STAT_TYPE } from '../../../core/models/enums';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';
import { CombatHealthComponent } from '../update-combat-health/update-combat-health.component';
import { CombatBuffeffectDetailsComponent } from '../combat-buffeffects-details/combat-buffeffects-details.component';
import { ImageViewerComponent } from '../../../shared/image-interface/image-viewer/image-viewer.component';
import { DBkeys } from '../../../core/common/db-keys';
import { CharactersCharacterStat } from '../../../core/models/view-models/characters-character-stats.model';
import { initiative } from '../../../core/models/view-models/initiative.model';
import { RulesetService } from '../../../core/services/ruleset.service';
import { Characters } from '../../../core/models/view-models/characters.model';
import { ServiceUtil } from '../../../core/services/service-util';

@Component({
  selector: 'app-gm-playerview',
  templateUrl: './gm-playerview.component.html',
  styleUrls: ['./gm-playerview.component.scss'],
  animations: [fadeInOut]

})
export class CombatGMPlayerViewComponent implements OnInit {

  bsModalRef: BsModalRef;
  ruleSetId: number;
  //character: Characters = new Characters();
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
  //characterId: number = 0;
  currentCombatantDetail: any;
  ownPlayer: any[] = [];
  DummyValueForCharHealthStat: number = -9999;
  noBuffs_EffectsAvailable: string = 'No Buffs & Effects Available';
  noItemsAvailable: string = 'No Items Available';
  refreshPage: any;
  initialLoad: boolean = false;
  isCombatStarted: boolean = false;

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
    private rulesetService: RulesetService,
    private router: Router) {
    //this.route.params.subscribe(params => { this.characterId = params['id']; });

    this.route.params.subscribe(params => {
      this.ruleSetId = params['id'];
    });
    let isNewTab = false;
    let url = this.router.url.toLowerCase();
    if (url && url.split('?') && url.split('?')[1]) {
      let serachParams = new URLSearchParams(url.split('?')[1]);
      isNewTab = (serachParams.get("newtab") === "1");
    }

    if (isNewTab) {
      if (this.ruleSetId) {
        let RuleSetID = ServiceUtil.DecryptID(this.ruleSetId);
        this.ruleSetId = +RuleSetID;
      }
      let displayURL = '/ruleset/gm-playerview';
      let originalURl = '/ruleset/gm-playerview/' + this.ruleSetId;
      Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
    }

  }

  ngOnInit() {
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
    this.rulesetService.getRulesetById<Ruleset>(this.ruleSetId)
      .subscribe(data => {
        //this.character = data;
        this.rulesetModel = data;
        this.ruleSetId = this.rulesetModel.ruleSetId;
        //this.isLoading = false;
        //this.setHeaderValues(this.character);
        //this.characterId = data.characterId;

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
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.recordName = this.rulesetModel.ruleSetName;
    this.bsModalRef.content.recordImage = this.rulesetModel.imageUrl;
    //this.bsModalRef.content.recordType = 'ruleset';
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
  //ChatBtn(item) {
  //  if (item.type == combatantType.CHARACTER) {
  //    let characterId = item.character.characterId;
  //    this.appService.updateOpenChatForCharacter(characterId);
  //  }

  //}

  //TargetBtn(item) {
  //  if (item) {
  //    this.combatants.map(x => {
  //      if (x.isOwnPlayer) {
  //        if (item.type == this.combatantsType.CHARACTER) {
  //          x.targetId = item.character.characterId;
  //          x.targetType = item.type;
  //        }
  //        if (item.type == this.combatantsType.MONSTER) {
  //          x.targetId = item.monster.monsterId;
  //          x.targetType = item.type;
  //        }
  //        this.SaveTarget(x);
  //      }
  //    });
  //  }

  //}

  //RemoveTargetBtn(item) {
  //  if (item) {
  //    this.combatants.map(x => {
  //      if (x.isOwnPlayer) {          
  //          x.targetId = 0;
  //          x.targetType = null;          
  //        this.SaveTarget(x);
  //      }
  //    });
  //  }
  //}

  //SaveTarget(combatatnt) {
  //  this.combatService.saveTarget(combatatnt).subscribe(res => {
  //    //let result = res;
  //  }, error => {
  //    let Errors = Utilities.ErrorDetail("", error);
  //    if (Errors.sessionExpire) {
  //      this.authService.logout(true);
  //    } else {
  //      this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //    }
  //  });
  //}

  //getTargetImage(item) {
  //  let imageUrl = '';
  //  if (item.targetType == this.combatantsType.MONSTER) {
  //    this.combatants.map(x => {
  //      if (x.type == this.combatantsType.MONSTER) {
  //        if (x.monster.monsterId == item.targetId) {
  //          imageUrl = x.monster.imageUrl;
  //        }
  //      }

  //    });
  //  }
  //  else if (item.targetType == this.combatantsType.CHARACTER) {
  //    this.combatants.map(x => {
  //      if (x.type == this.combatantsType.CHARACTER) {
  //        if (x.character.characterId == item.targetId) {
  //          imageUrl = x.character.imageUrl;
  //        }
  //      }

  //    });
  //  }
  //  return imageUrl;
  //}

  //getTargetName(item) {
  //  let name = '';
  //  if (item.targetType == this.combatantsType.MONSTER) {
  //    this.combatants.map(x => {
  //      if (x.type == this.combatantsType.MONSTER) {
  //        if (x.monster.monsterId == item.targetId) {
  //          name = x.monster.name;
  //        }
  //      }

  //    });
  //  }
  //  else if (item.targetType == this.combatantsType.CHARACTER) {
  //    this.combatants.map(x => {
  //      if (x.type == this.combatantsType.CHARACTER) {
  //        if (x.character.characterId == item.targetId) {
  //          name = x.character.characterName;
  //        }
  //      }

  //    });
  //  }
  //  return name;
  //}

  //TargetClick(item) {
  //  this.combatants.map(x => {
  //    if (x.type == combatantType.MONSTER && x.monsterId == item.targetId && item.targetType == combatantType.MONSTER) {
  //      this.frameClick(x);
  //    }
  //    else if (x.type == combatantType.CHARACTER && x.characterId == item.targetId && item.targetType == combatantType.CHARACTER) {
  //      this.frameClick(x);
  //    }
  //  });
  //}

  ImageDeatil(itemDetail, imgref) {
    if (itemDetail.type == this.combatantsType.MONSTER) {
      if (this.settings.accessMonsterDetails) {
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

  //private setHeaderValues(character: Characters): any {
  //  let headerValues = {
  //    headerName: character.characterName,
  //    headerImage: character.imageUrl,
  //    headerId: character.characterId,
  //    headerLink: 'character',
  //    hasHeader: true
  //  };
  //  this.appService.updateAccountSetting1(headerValues);
  //  this.sharedService.updateAccountSetting(headerValues);
  //  this.localStorage.deleteData(DBkeys.HEADER_VALUE);
  //  this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
  //}

  refreshPageData() {

    if (this.localStorage.localStorageGetItem(DBkeys.IsConnected)) {
      this.refreshPage = setInterval(() => {
        this.combatService.isCombatUpdatedAndCurrentTurn(this.CombatId).subscribe(data => {
          let res: any = data;
          if (res) {
            if (res.isCombatUdated) {
              if (this.refreshPage) {
                clearInterval(this.refreshPage)
              }
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
          //if (x.type == this.combatantsType.CHARACTER && x.character.characterId == this.characterId) {
          //  x.isOwnPlayer = true;
          //  x.frameColor = 'blue';
          //} else {
          x.isOwnPlayer = false;
          //}

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
            }
          }

        });

        // Game Time
        this.gametime = this.time_convert(this.settings.gameRoundLength);

        this.isCharacterItemEnabled = combatModal.isCharacterItemEnabled;
        this.isCharacterSpellEnabled = combatModal.isCharacterSpellEnabled;
        this.isCharacterAbilityEnabled = combatModal.isCharacterAbilityEnabled;
        let curretnCombatantList = this.combatants.filter(x => x.isCurrentTurn);
        let curretnCombatant = new initiative();
        if (curretnCombatantList.length) {
          curretnCombatant = curretnCombatantList[0];
          let valueofinitiative = curretnCombatant.initiativeValue;
          this.CurrentInitiativeValue = valueofinitiative;
        }
        if (this.initialLoad) {
          this.frameClick(curretnCombatant);
        } else {
          this.frameClick(this.currentCombatantDetail);
        }


        if (this.roundCounter > 1) {
          let roundTime = this.settings.gameRoundLength * this.roundCounter;
          this.gametime = this.time_convert(roundTime);
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
  CombatantBuff_EffectDetail(currentCombatantDetail, item) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.router.navigate(['/character/combat-pc-buff-effect-detail', item.buffAndEffectId]);
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      this.router.navigate(['/character/combat-pc-buff-effect-detail', item.buffAndEffect.buffAndEffectId]);
    }
  }
}
