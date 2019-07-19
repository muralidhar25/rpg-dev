import { Component, OnInit } from '@angular/core';
import { fadeInOut } from '../../core/services/animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ActivatedRoute, Router } from "@angular/router";
import { CombatInitiativeComponent } from '../../rulesets/combat/combat-initiative/combat-initiative.component';
import { Characters } from '../../core/models/view-models/characters.model';
import { CombatDetails } from '../../core/models/view-models/combat-details.model';
import { Utilities } from '../../core/common/utilities';
import { combatantType, STAT_TYPE } from '../../core/models/enums';
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
import { ImageViewerComponent } from '../../shared/image-interface/image-viewer/image-viewer.component';
import { CharactersCharacterStat } from '../../core/models/view-models/characters-character-stats.model';
import { initiative } from '../../core/models/view-models/initiative.model';
import { setInterval } from 'timers';

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
    private charactersService: CharactersService,
    private router: Router) {
    this.route.params.subscribe(params => { this.characterId = params['id']; });

    this.rulesetModel.ruleSetName = 'Orc Shaman';
    this.rulesetModel.imageUrl = 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg';
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
        this.combatService.getCombatDetails(this.ruleSetId).subscribe(res => {
          if (res) {
            let combatModal: any = res;
            this.roundCounter = combatModal.round;
            this.CombatId = combatModal.id
            this.rulesetModel = combatModal.campaign;
            this.settings = combatModal.combatSettings;
            this.combatants = combatModal.combatantList;

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
              debugger
              let curretnCombatantList = this.combatants.filter(x => x.isCurrentTurn);
              let curretnCombatant = new initiative();
              if (curretnCombatantList.length) {
                curretnCombatant = curretnCombatantList[0];
                let valueofinitiative = curretnCombatant.initiativeValue;
                this.CurrentInitiativeValue = valueofinitiative;
              }

             

              //this.roundCounter = this.roundCounter + 1;
              ////convert time
              let roundTime = this.settings.gameRoundLength * this.roundCounter;
              this.gametime = this.time_convert(roundTime);
              this.frameClick(curretnCombatant)

              this.refreshPageData();
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
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.recordName = this.character.characterName;
    this.bsModalRef.content.recordImage = this.character.imageUrl;
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
      this.appService.updateOpenChatForCharacter(characterId);
    }
    
  }

  TargetBtn(item) {
    if (item) {
      this.combatants.map(x => {
        if (x.isOwnPlayer) {
          if (item.type == this.combatantsType.CHARACTER) {
            x.targetId = item.character.characterId;
            x.targetType = item.type;
          }
          if (item.type == this.combatantsType.MONSTER) {
            x.targetId = item.monster.monsterId;
            x.targetType = item.type;
          }
          this.SaveTarget(x);
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
    //let refreshPage = setInterval(() => {
    //  this.GetCombatDetails(false);
    //}, 5000);
  }
}
