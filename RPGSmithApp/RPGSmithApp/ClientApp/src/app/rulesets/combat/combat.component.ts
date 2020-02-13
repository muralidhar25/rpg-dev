import { Component, OnInit, HostListener, ViewChild, Input } from '@angular/core';
import { fadeInOut } from '../../core/services/animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CombatInitiativeComponent } from './combat-initiative/combat-initiative.component';
import { Router, ActivatedRoute } from "@angular/router";
import { Characters } from '../../core/models/view-models/characters.model';
import { CombatDetails } from '../../core/models/view-models/combat-details.model';
import { Utilities } from '../../core/common/utilities';
import { AddCombatMonsterComponent } from './add-combat-monster/add-monster-combat.component';
import { RemoveCombatMonsterComponent } from './remove-combat-monster/remove-monster-combat.component';
import { combatantType, COMBAT_SETTINGS, CombatItemsType, STAT_TYPE, MonsterDetailType, SYSTEM_GENERATED_MSG_TYPE, CHATACTIVESTATUS } from '../../core/models/enums';
import { CombatHealthComponent } from './update-combat-health/update-combat-health.component';
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
import { Subscription } from 'rxjs';
import { ItemsService } from '../../core/services/items.service';
import { DBkeys } from '../../core/common/db-keys';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { ServiceUtil } from '../../core/services/service-util';
import { RulesetService } from '../../core/services/ruleset.service';
import { CharactersCharacterStat } from '../../core/models/view-models/characters-character-stats.model';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { ImageViewerComponent } from '../../shared/image-interface/image-viewer/image-viewer.component';
import { UpdateMonsterHealthComponent } from '../../shared/update-monster-health/update-monster-health.component';
import { CreateBuffAndEffectsComponent } from '../../shared/create-buff-and-effects/create-buff-and-effects.component';
import { EditItemComponent } from '../../characters/character-records/items/edit-item/edit-item.component';
import { CreateSpellsComponent } from '../../shared/create-spells/create-spells.component';
import { CreateAbilitiesComponent } from '../../shared/create-abilities/create-abilities.component';
import { EditMonsterItemComponent } from '../../records/monster/edit-item/edit-item.component';
import { CharactersCharacterStatService } from '../../core/services/characters-character-stat.service';
import { AddRemoveAssociateBuffAndEffectsComponent } from '../../records/monster/add-remove-associate-buff-effects/add-remove-associate-buff-effects.component';
import { AddBuffAndEffectComponent } from '../../shared/buffs-and-effects/add-buffs-and-effects/add-buffs-and-effects.component';


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
  isDropdownOpenNewWindow: boolean = false;
  isCharacterItemEnabled: boolean = false;
  isCharacterSpellEnabled: boolean = false;
  isCharacterAbilityEnabled: boolean = false;
  CombatId: number = 0;
  delayResumeTurn: boolean = false;
  sub: Subscription;
  characterId: any;
  DummyValueForCharHealthStat: number = -9999;
  charXPStatNames: string[] = [];
  charHealthStatNames: string[] = [];
  defaultColorList = [
    {
      rpgCoreColorId: 1,
      titleTextColor: "#FFFFFF",
      titleBgColor: "#000000",
      bodyTextColor: "#FFFFFF",
      bodyBgColor: "black",
    },
    {
      rpgCoreColorId: 2,
      titleTextColor: "#000000",
      titleBgColor: "#D58917",
      bodyTextColor: "#000000",
      bodyBgColor: "red",


    },
    {
      rpgCoreColorId: 3,
      titleTextColor: "#FFFFFF",
      titleBgColor: "#069774",
      bodyTextColor: "#FFFFFF",
      bodyBgColor: "orange",

    },
    {
      rpgCoreColorId: 4,
      titleTextColor: "#000000",
      titleBgColor: "#E1B500",
      bodyTextColor: "#000000",
      bodyBgColor: "yellow",
    },
    {
      rpgCoreColorId: 5,
      titleTextColor: "#FFFFFF",
      titleBgColor: "#265256",
      bodyTextColor: "#FFFFFF",
      bodyBgColor: "green",

    },
    {
      rpgCoreColorId: 10,
      titleTextColor: "#FFFFFF",
      titleBgColor: "#800080",
      bodyTextColor: "#FFFFFF",
      bodyBgColor: "purple",
    },
    {
      rpgCoreColorId: 6,
      titleTextColor: "#FFFFFF",
      titleBgColor: "#004229",
      bodyTextColor: "#FFFFFF",
      bodyBgColor: "blue",
    },
    {
      rpgCoreColorId: 7,
      titleTextColor: "#FFFFFF",
      titleBgColor: "#2973A8",
      bodyTextColor: "#FFFFFF",
      bodyBgColor: "brown",
    },
    {
      rpgCoreColorId: 8,
      titleTextColor: "#FFFFFF",
      titleBgColor: "#04466D",
      bodyTextColor: "#FFFFFF",
      bodyBgColor: "grey",
    },
    {
      rpgCoreColorId: 9,
      titleTextColor: "#000000",
      titleBgColor: "#663796",
      bodyTextColor: "#000000",
      bodyBgColor: "lightcyan",

    }
  ]
  noStatProvided: string = "No Stat Provided"
  noCharacterDescriptionProvided: string = 'No Character Description Provided';
  noMonsterDescriptionProvided: string = "No Monster Description Provided"
  noBuffs_EffectsAvailable: string = 'No Buffs & Effects Assigned';
  noItemsAvailable: string = 'No Items Added';
  noSpellsAvailable: string = 'No Spells Assigned';
  noAbilitiesAvailable: string = 'No Abilities Assigned';
  noCommandsAvailable: string = 'No Commands Available';
  noGMOnlyTextProvided: string = 'No GM Only Provided';
  monsterDetailType = MonsterDetailType;
  timeoutHandler: any;
  refreshFlag: boolean = false;
  refreshPCDataModel: any;

  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: any) {
    //console.log(event);
    if (event.keyCode === 32 && (event.target == document.body || event.target.nodeName == 'BUTTON') && this.showCombatOptions) {
      event.preventDefault();
      this.nextTurn();
    }
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
      if (target.className.endsWith("setting-toggle-btn")) {
        this.isDropdownOpen = !this.isDropdownOpen;
      }
      else if (target.className.endsWith("newWindow-toggle-btn")) {
        this.isDropdownOpenNewWindow = !this.isDropdownOpenNewWindow;
      }
      else if (this.hasSomeParentTheClass(target, 'setting-toggle')) {
        this.isDropdownOpenNewWindow = false;
        this.isDropdownOpen = true;
      }
      else if (this.hasSomeParentTheClass(target, 'newWindow-toggle')) {
        this.isDropdownOpen = false;
        this.isDropdownOpenNewWindow = true;
      }
      else {
        this.isDropdownOpen = false;
        this.isDropdownOpenNewWindow = false;
      }
    } catch (err) { this.isDropdownOpen = false; this.isDropdownOpenNewWindow = false; }
  }

  hasSomeParentTheClass(element, classname) {
    if (element.className.split(' ').indexOf(classname) >= 0) return true;
    return element.parentNode && this.hasSomeParentTheClass(element.parentNode, classname);
  }

  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @Input() contextMenu: ContextMenuComponent;

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
    private charactersCharacterStatService: CharactersCharacterStatService,

    private rulesetService: RulesetService,
    private contextMenuService: ContextMenuService) {
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });

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
      let displayURL = '/ruleset/combat';
      let originalURl = '/ruleset/combats/' + this.ruleSetId;
      Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
    }


    this.sharedService.shouldUpdateCombatantListForAddDeleteMonsters().subscribe(combatantListJson => {

      if (combatantListJson) {
        this.combatService.markCombatAsUpdatedFlag(this.CombatId).subscribe(res => {
          let result = res;
        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          } else {
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          }
        });

        ///////////////////////////////////////////////////////////////////////////////////////////

        //{ flag: combatantListFlag, selectedDeployedMonsters: selectedDeployedMonsters}

        if (combatantListJson.flag) {
          if (combatantListJson.selectedDeployedMonsters && combatantListJson.selectedDeployedMonsters.length) {
            this.GetCombatDetails(true, combatantListJson.selectedDeployedMonsters);
          }
          else {
            this.GetCombatDetails(true);
          }
        }
        else {
          this.GetCombatDetails();
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        //this.GetCombatDetails();
      }
    });

    this.sharedService.shouldUpdateCombatantList().subscribe(combatantListJson => {

      if (combatantListJson) {
        //{ combatantList: this.initiativeInfo, isInitialForCombatStart:this.isInitialForCombatStart }
        this.combatants = combatantListJson.combatantList;
        if (combatantListJson.isStartCombatClick) { //start combat
          this.isLoading = true;
          this.combatService.StartCombat(this.CombatId, true).subscribe(res => {
            this.showCombatOptions = true;
            let msg = "Combat Started";
            this.SendSystemMessageToChat(msg);

            this.isLoading = false;
            //this.GetCombatDetails(true);
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
              else {
                x.monster.monsterBuffAndEffects = [];
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
              else {
                x.character.characterBuffAndEffects = [];
              }

            }
          }
        });
      }
    });

    this.appService.shouldUpdateCombatantDetailFromChat().subscribe(isFromChat => {
      if (isFromChat) {
        this.GetCombatDetails(false);
      }
    });
  }
  ngOnDestroy() {
    if (this.refreshPCDataModel) {
      clearInterval(this.refreshPCDataModel)
    }
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
  GetCombatDetails(ShowLoader = true, selectedDeployedMonsters: any = [], recentlyEndedCombatId: number = 0) {

    if (ShowLoader) {
      this.isLoading = true;
    }

    this.combatService.getCombatDetails(this.ruleSetId, false, recentlyEndedCombatId).subscribe(res => {
      if (res) {
        let combatModal: any = res;
        this.roundCounter = combatModal.round;
        this.showCombatOptions = combatModal.isStarted;
        this.CombatId = combatModal.id
        this.rulesetModel = combatModal.campaign;
        this.setHeaderValues(this.rulesetModel);
        this.settings = combatModal.combatSettings;

        this.combatants = combatModal.combatantList;

        let characterFlag = false;
        this.charXPStatNames = [];
        this.charHealthStatNames = [];
        this.combatants.map(x => {
          if (x.type == combatantType.CHARACTER && !characterFlag) {
            characterFlag = true;
            if (x.character.diceRollViewModel && x.character.diceRollViewModel.charactersCharacterStats && x.character.diceRollViewModel.charactersCharacterStats.length) {
              x.character.diceRollViewModel.charactersCharacterStats.map(ccs => {
                if (ccs.characterStat && ccs.characterStat.statName) {
                  if (ccs.characterStat.characterStatTypeId == STAT_TYPE.Number) {
                    this.charXPStatNames.push('[' + ccs.characterStat.statName + ']');
                    this.charHealthStatNames.push('[' + ccs.characterStat.statName + ']');
                  }
                  else if (ccs.characterStat.characterStatTypeId == STAT_TYPE.CurrentMax) {
                    this.charHealthStatNames.push('[' + ccs.characterStat.statName + ']');
                  }
                  else if (ccs.characterStat.characterStatTypeId == STAT_TYPE.ValueSubValue) {
                    this.charHealthStatNames.push('[' + ccs.characterStat.statName + ']');
                  }
                  else if (ccs.characterStat.characterStatTypeId == STAT_TYPE.Combo) {
                    this.charHealthStatNames.push('[' + ccs.characterStat.statName + ']');
                  }
                }
              });
            }

          }
        });

        //if (this.settings.monsterVisibleByDefault) {
        //  this.combatants = combatModal.combatantList;
        //} else {
        //  this.combatants = [];
        //  let combatantsWithoutMonster = combatModal.combatantList;;
        //  combatantsWithoutMonster.map(x => {
        //    if (x.type == this.combatItemsType.CHARACTER) {
        //      this.combatants.push(x);
        //    }
        //  });
        //}

        let isFrameSelected_Flag = false;
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

          if (x.isCurrentSelected) {
            this.frameClick(x);
            isFrameSelected_Flag = true
          }
        });

        // Game Time
        this.gametime = this.time_convert(this.settings.gameRoundLength);
        if (!isFrameSelected_Flag) {
          if (this.combatants.length) {
            this.frameClick(this.combatants[0]);
          }
        }

        this.isCharacterItemEnabled = combatModal.isCharacterItemEnabled;
        this.isCharacterSpellEnabled = combatModal.isCharacterSpellEnabled;
        this.isCharacterAbilityEnabled = combatModal.isCharacterAbilityEnabled;

        let curretnCombatantList = this.combatants.filter(x => x.isCurrentTurn);
        if (curretnCombatantList.length) {
          this.curretnCombatant = curretnCombatantList[0];
          let valueofinitiative = this.curretnCombatant.initiativeValue;
          this.CurrentInitiativeValue = valueofinitiative;
        }

        if (this.roundCounter > 1) {
          //this.roundCounter = this.roundCounter + 1;
          ////convert time
          let roundTime = this.settings.gameRoundLength * this.roundCounter;
          this.gametime = this.time_convert(roundTime);
        }

        if (!(selectedDeployedMonsters && selectedDeployedMonsters.length)) {

          selectedDeployedMonsters = [];
          let monsterCombatants = this.combatants.filter(x => (x.type == combatantType.MONSTER && x.initiative == null));
          monsterCombatants.map((m) => {
            selectedDeployedMonsters.push(m.monster);
          })
        }
        if (selectedDeployedMonsters && selectedDeployedMonsters.length) {
          let resultOfGroupInitiative = 0;
          let resultOfGroupInitiativeFilled_Flag = false;
          selectedDeployedMonsters.map((rec_deployedMonster) => {

            this.combatants.map((rec_C) => {

              if (rec_C.type == combatantType.MONSTER && rec_C.monsterId == rec_deployedMonster.monsterId) {

                if (this.settings && this.settings.groupInitiative) {

                  rec_C.initiativeCommand = this.settings.groupInitFormula;
                }

                let res: any;

                // Start code to get common value for monsters
                if (this.settings && this.settings.groupInitiative) {
                  let monsterInitativeValue = [];
                  this.combatants.map(x => {
                    if (x.type == combatantType.MONSTER) {
                      monsterInitativeValue.push(x.initiativeValue);
                    }
                  });

                  var mostCommon = 1;
                  var m = 0;
                  var mostCommonInitativeValue;
                  for (var i = 0; i < monsterInitativeValue.length; i++) {
                    for (var j = i; j < monsterInitativeValue.length; j++) {
                      if (monsterInitativeValue[i] == monsterInitativeValue[j])
                        m++;
                      if (mostCommon < m) {
                        mostCommon = m;
                        mostCommonInitativeValue = monsterInitativeValue[i];
                      }
                    }
                    m = 0;
                  }
                  res = mostCommonInitativeValue;

                  //this.combatants.map(x => {
                  //  if (x.type == combatantType.MONSTER) {
                  //    x.initiativeValue = mostCommonInitativeValue;
                  //  }
                  //});
                }
                else {
                  res = DiceService.rollDiceExternally(this.alertService, rec_C.initiativeCommand, this.customDices);
                }
                // End code to get common value for monsters



                if (this.settings && this.settings.groupInitiative && !resultOfGroupInitiativeFilled_Flag) {
                  if (isNaN(res)) {
                    resultOfGroupInitiative = 0;
                  } else {
                    resultOfGroupInitiative = res;
                  }
                  resultOfGroupInitiativeFilled_Flag = true;
                }
                if (this.settings && this.settings.groupInitiative && resultOfGroupInitiativeFilled_Flag) {
                  rec_C.initiativeValue = resultOfGroupInitiative;
                } else {
                  if (isNaN(res)) {
                    rec_C.initiativeValue = 0;
                  } else {
                    rec_C.initiativeValue = res;
                  }
                }

                rec_C.initiative = rec_C.initiativeValue;
                rec_deployedMonster.initiativeValue = rec_C.initiativeValue;

              }
            })




            //let OldIndexToRemove = this.combatants.findIndex(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId)

            //let combatant_List = Object.assign([], this.combatants);
            //combatant_List.sort((a, b) => b.initiativeValue - a.initiativeValue || a.type.localeCompare(b.type));

            //let NewIndexToAdd = combatant_List.findIndex(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId);
            //let NewItemToAdd = combatant_List.find(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId);

            //this.combatants.splice(OldIndexToRemove,1);
            //this.combatants.splice((NewIndexToAdd), 0, NewItemToAdd);            

            ////this.combatants.sort((a, b) => b.initiativeValue - a.initiativeValue || a.type.localeCompare(b.type));
            //this.combatants.map((rec, rec_index) => {
            //  rec.sortOrder = rec_index + 1;
            //})

          })

          selectedDeployedMonsters.sort((a, b) => b.initiativeValue - a.initiativeValue);

          let Oldcombatants = Object.assign([], this.combatants);
          let newcombatants = [];
          selectedDeployedMonsters.map((rec_deployedMonster) => {
            if (Oldcombatants.find(x => x.monsterId != rec_deployedMonster.monsterId)) {
              newcombatants.push(Oldcombatants.find(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId));

            }
            Oldcombatants = Oldcombatants.filter(x => x.monsterId != rec_deployedMonster.monsterId);


          })
          newcombatants.map((rec_deployedMonster) => {
            var insertedIndex = Oldcombatants.push(rec_deployedMonster);
            insertedIndex = insertedIndex - 1;

            let combatant_List = Object.assign([], Oldcombatants);
            combatant_List.sort((a, b) => b.initiativeValue - a.initiativeValue || a.type.localeCompare(b.type));

            let NewIndexToAdd = combatant_List.findIndex(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId);

            Oldcombatants.splice(insertedIndex, 1);
            Oldcombatants.splice((NewIndexToAdd), 0, rec_deployedMonster);
          })
          Oldcombatants.map((rec, rec_index) => {
            rec.sortOrder = rec_index + 1;
          });
          this.combatants = Oldcombatants;

          //selectedDeployedMonsters.map((rec_deployedMonster) => {          





          //  let combatant_List = Object.assign([], Oldcombatants);
          //  combatant_List.sort((a, b) => b.initiativeValue - a.initiativeValue || a.type.localeCompare(b.type));

          //  let NewIndexToAdd = combatant_List.findIndex(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId);
          //  let NewItemToAdd = combatant_List.find(x => x.type == combatantType.MONSTER && x.monsterId == rec_deployedMonster.monsterId);

          //  this.combatants.splice(OldIndexToRemove, 1);
          //  this.combatants.splice((NewIndexToAdd), 0, NewItemToAdd);

          //  //this.combatants.sort((a, b) => b.initiativeValue - a.initiativeValue || a.type.localeCompare(b.type));
          //  this.combatants.map((rec, rec_index) => {
          //    rec.sortOrder = rec_index + 1;
          //  })

          //})

          //console.log('save', this.combatants)
          if (this.showCombatOptions) {
            this.combatService.saveSortOrder(this.combatants).subscribe(res => {

              this.combatService.saveCombatantList(this.combatants, this.ruleSetId).subscribe(res => {
                this.combatService.markCombatAsUpdatedFlag(this.CombatId).subscribe(res => {

                }, error => {

                });

              }, error => {
                this.isLoading = false;
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  this.authService.logout(true);
                } else {
                  this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                }
              });

            }, error => {
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              } else {
                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
              }
            });

          }


          //update initiative of added monster using selectedDeployedMonsters



        }
        if (!this.refreshPCDataModel) {
          this.refreshPCDataModelPageData();
        }
        //if (!this.refreshPCDataModel && this.showCombatOptions) {
        //  this.refreshPCDataModelPageData();
        //}
        //else if (!this.showCombatOptions) {
        //  if (this.refreshPCDataModel) {
        //    clearInterval(this.refreshPCDataModel)
        //  }
        //}
        this.BindMonstersName();
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
      this.appService.updateCombatantDetailFromGM(true);
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
    if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
      let ChatWithDiceRoll = [];
      if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
        ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
      }
      let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_FROM_COMBAT, obj: message }
      ChatWithDiceRoll.push(chatMsgObject);
      this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
    } else {
      this.appService.updateChatFromCombat(message);
    }
  }

  openpopup() {
    //console.log('Open popup');
    //this.bsModalRef = this.modalService.show(CharacterStatClusterTileComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
  }

  //open Initiative popup
  Init(isInitialForCombatStart = false, isStartCombatClick = false) {
    this.bsModalRef = this.modalService.show(CombatInitiativeComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.customDices = this.customDices;
    this.bsModalRef.content.combatants = this.combatants;
    this.bsModalRef.content.settings = this.settings;
    this.bsModalRef.content.isInitialForCombatStart = isInitialForCombatStart; //do re-roll the initiatives.
    this.bsModalRef.content.isStartCombatClick = isStartCombatClick; //start the combat from popup.
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


  DelayTurn(currentCombat) {

    currentCombat.delayTurn = true;
    this.combatants.map(x => {
      if (x.type == combatantType.MONSTER && x.monsterId == currentCombat.monsterId && currentCombat.isCurrentTurn) {
        this.nextTurn();
      }
      if (x.type == combatantType.CHARACTER && x.characterId == currentCombat.characterId && currentCombat.isCurrentTurn) {
        this.nextTurn();
      }
    });
    this.SaveDelayTurn(currentCombat);
  }

  ResumeTurn(currentCombat) {
    let message = "Place Before/After current combatant";
    this.alertService.showDialog(message,
      DialogType.confirm, () => this.PlaceBefore(currentCombat), () => this.PlaceAfter(currentCombat), 'Before', 'After');
    currentCombat.delayTurn = false;
    this.SaveDelayTurn(currentCombat);
  }

  PlaceBefore(currentCombat) {
    this.combatants = this.combatants.filter(x => x.id != currentCombat.id);
    let combats = Object.assign([], this.combatants);
    combats.map((x, index) => {
      if (x.isCurrentTurn) {
        this.combatants.map(y => {
          x.isCurrentTurn = false;
        });
        currentCombat.isCurrentTurn = true;
        this.combatants.splice(index, 0, currentCombat);
      }
    });
    this.SaveCombatantTurn(currentCombat, this.roundCounter);
    this.SaveSortOrder(this.combatants);
  }

  PlaceAfter(currentCombat) {
    this.combatants = this.combatants.filter(x => x.id != currentCombat.id);
    let combats = Object.assign([], this.combatants);
    combats.map((x, index) => {
      if (x.isCurrentTurn) {
        this.combatants.splice(index + 1, 0, currentCombat);
      }
    });
    this.SaveSortOrder(this.combatants);
  }

  SaveDelayTurn(delayTurn) {
    this.combatService.saveDelayTurn(delayTurn).subscribe(res => {
      let result = res;
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  SaveSortOrder(combatants, refreshList = false) {
    this.combatants.map((x, index) => {
      x.sortOrder = index + 1;
    });
    this.combatService.saveSortOrder(combatants).subscribe(res => {
      if (refreshList) {
        this.appService.updateCombatantDetailFromGM(true);
        this.GetCombatDetails();
      }
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  monsterAdd() {
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
    //console.log('monsterRemove');
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
    let skipIsCurrentTurnCheck: boolean = false;
    let skipIsCurrentTurnCheck_Count: number = 0;
    for (let i = 0; i < this.combatants.length; i++) {
      if ((this.combatants[i].isCurrentTurn && this.combatants[i - 1]) || skipIsCurrentTurnCheck) {
        this.combatants[i].isCurrentTurn = false;

        let indexToSetCurrentTurn = i - 1;

        this.combatants[indexToSetCurrentTurn].isCurrentTurn = true;
        this.curretnCombatant = this.combatants[indexToSetCurrentTurn];
        let valueofinitiative = this.combatants[indexToSetCurrentTurn].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;

        if (this.combatants[indexToSetCurrentTurn].delayTurn) {
          // this.combatants[i].isCurrentTurn = true;
          this.prevTurn();
          break;
        }

        this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
        this.frameClick(this.curretnCombatant)


        return;
      }

      else if (!this.combatants[i - 1] && this.roundCounter > 1 && this.combatants[i].isCurrentTurn) {
        let index = this.combatants.length - 1;
        this.combatants[i].isCurrentTurn = false;
        //if (this.combatants[i + index].delayTurn) {
        //  goToPreviousTurn = true;
        //  continue;
        //}
        this.curretnCombatant = this.combatants[i + index];
        this.combatants[i + index].isCurrentTurn = true;
        let valueofinitiative = this.combatants[i + index].initiativeValue;
        this.CurrentInitiativeValue = valueofinitiative;

        if (this.combatants[i + index].delayTurn) {
          // this.combatants[i].isCurrentTurn = true;
          this.roundCounter = this.roundCounter - 1;
          //convert time
          let roundTime = this.settings.gameRoundLength * this.roundCounter;
          this.gametime = this.time_convert(roundTime);
          this.prevTurn();
          break;
        }

        this.roundCounter = this.roundCounter - 1;
        //convert time
        let roundTime = this.settings.gameRoundLength * this.roundCounter;
        this.gametime = this.time_convert(roundTime);
        this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
        this.frameClick(this.curretnCombatant)
        return;
      }
    }

  }
  nextTurn(DontSave: boolean = false) {
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
        if (!DontSave) {
          this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
        }
        this.frameClick(this.curretnCombatant)
        return;
      }
      else if (!this.combatants[i + 1]) {
        if (this.roundCounter != 0 && this.settings.rollInitiativeEveryRound) {
          this.Init(true);
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
        if (!DontSave) {
          this.SaveCombatantTurn(this.curretnCombatant, this.roundCounter);
        }
        this.frameClick(this.curretnCombatant)
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
  buffclicked(buffs) {
    //console.log('buffclicked', buffs);
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
    });

    this.SaveSelectedCombatant(item);
  }

  SaveSelectedCombatant(selectedCombatant) {
    selectedCombatant.isCurrentSelected = true;
    this.combatService.saveSelectedCombatant(selectedCombatant).subscribe(res => {
      let result = res;
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }

  nameClicked(item) {
    this.frameClick(item);
    //if (item.type == combatantType.MONSTER) {
    //  this.router.navigate(['/ruleset/monster-details', item.monster.monsterId]);
    //}
    //if (item.type == combatantType.CHARACTER) {
    //  this.router.navigate(['/character/dashboard', item.character.characterId]);
    //}
  }

  Hidebtns(item) {
    item.hidebtns = true;
  }
  showbtns(item) {
    item.hidebtns = false;
  }

  //redirections of character Side
  redirectToItem(item) {
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
    this.router.navigate(['/character/inventory', item.character.characterId]);
  }
  redirectToSpell(item) {
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
    this.router.navigate(['/character/spell', item.character.characterId]);
  }
  redirectToAbility(item) {
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
    this.router.navigate(['/character/ability', item.character.characterId]);
  }
  redirectToChracterstat(item) {
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
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
    //this.bsModalRef.content.event.subscribe(result => {
    //  let msg = "Monster rolled result = " + result;
    //  if (this.settings.displayMonsterRollResultInChat) {
    //    this.SendSystemMessageToChat(msg);
    //  }
    //});
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
    this.bsModalRef.content.monsterCurrency = ServiceUtil.DeepCopy(item.monsterCurrency);
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
    let ruleset_XP_CharacterStatId = this.get_Ruleset_XP_CharacterStatID();
    this.isLoading = true;
    let _msg = ' Removing Monster ....';
    this.alertService.startLoadingMessage("", _msg);
    let monstersToRemove = [];
    monstersToRemove.push({ monsterId: item.monster.monsterId });
    this.combatService.removeMonsters(monstersToRemove, del, true, this.ruleSetId, ruleset_XP_CharacterStatId)
      .subscribe(data => {
        this.alertService.stopLoadingMessage();
        this.isLoading = false;
        this.combatants.map(x => {
          if (x.type == combatantType.MONSTER && x.monsterId == item.monsterId && item.isCurrentTurn) {
            this.nextTurn();
          }
        });
        this.combatants = this.combatants.filter(x => (x.type == combatantType.CHARACTER) || (x.type == combatantType.MONSTER && x.monsterId != item.monsterId));
        let remove_Selected_Monster_Flag = false;
        this.combatants.map(c => {
          if (c.isCurrentTurn) {
            this.frameClick(c);
            remove_Selected_Monster_Flag = true;
          }
        });
        if (!remove_Selected_Monster_Flag) {
          if (this.combatants.length) {
            this.frameClick(this.combatants[0]);
          }
        }
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
          this.bsModalRef.content.monsterIdToDuplicate = item.monster.monsterId;
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
    this.Init(true, true);

    //let _msg = "Starting Combat..";
    //this.alertService.startLoadingMessage("", _msg);
    //this.combatService.StartCombat(this.CombatId, true).subscribe(res => {

    //  //this.alertService.stopLoadingMessage();

    //  //let message = "Combat has been starter successfully.";
    //  //this.alertService.showMessage(message, "", MessageSeverity.success);

    //  this.Init(true);
    //  this.showCombatOptions = true;
    //  let msg = "Combat Started";
    //  this.SendSystemMessageToChat(msg);

    //  this.isLoading = false;
    //}, error => {
    //  this.alertService.stopLoadingMessage();
    //  this.isLoading = false;
    //  let Errors = Utilities.ErrorDetail("", error);
    //  if (Errors.sessionExpire) {
    //    this.authService.logout(true);
    //  } else {
    //    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
    //  }
    //});

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

      //let message = "Combat has been ended successfully.";
      //this.alertService.showMessage(message, "", MessageSeverity.success);

      this.showCombatOptions = false;
      let msg = "Combat Ended";
      this.SendSystemMessageToChat(msg);

      this.isLoading = false;
      this.GetCombatDetails(true, [], this.CombatId);
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
      case COMBAT_SETTINGS.SHOW_MONSTER_NAMES_BY_DEFAULT:
        this.settings.showMonsterNameByDefault = e.target.checked;
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
      if (type == COMBAT_SETTINGS.CHARACTER_TARGET_HEALTH_STAT || type == COMBAT_SETTINGS.PC_INITIATIVE_FORMULA || type == COMBAT_SETTINGS.ROLL_INITIATIVE_FOR_PLAYER_CHARACTERS || type == COMBAT_SETTINGS.GROUP_INITIATIVE || type == COMBAT_SETTINGS.GROUPINIT_FORMULA) {
        this.GetCombatDetails(false);
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

  updateInitiativeCommandforMonster() {
    this.combatants
  }

  updateInitiativeCommandforCharacter() {

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
    if (item.type == CombatItemsType.CHARACTER && !item.character.characterBuffAndEffects.length) {
      this.bsModalRef = this.modalService.show(AddBuffAndEffectComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });

      this.bsModalRef.content.rulesetID = this.ruleSetId;
      this.bsModalRef.content.characterID = item.character.characterId;
      this.bsModalRef.content.selectedBuffAndEffectsList = [];
      this.bsModalRef.content.pauseBuffAndEffectCreate = true;
    } else if (item.type == CombatItemsType.MONSTER && !item.monster.monsterBuffAndEffects.length) {
      let ListBuffAndEffects: any[] = [];
      this.combatService.getBuffAndEffctList<any>(item.monster.monsterId, this.ruleSetId)
        .subscribe(data => {
          ListBuffAndEffects = data;
        }, error => {
        }, () => {
          this.bsModalRef = this.modalService.show(AddRemoveAssociateBuffAndEffectsComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Select Buffs & Effects';
          this.bsModalRef.content.button = 'Save';
          this.bsModalRef.content.monster = item.monster;
          this.bsModalRef.content.selectedItems = [];
          this.bsModalRef.content.itemsList = ListBuffAndEffects;
          this.bsModalRef.content.recordName = item.monster.name;
          this.bsModalRef.content.recordImage = item.monster.imageUrl;
        });      
    }
    else {
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
  }

  CombatantBuff_EffectDetail(currentCombatantDetail, item) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
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
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
      this.router.navigate(['/ruleset/monster-item-details', item.itemId]);
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
      this.router.navigate(['/character/inventory-details', item.itemId]);
    }

  }
  //Spell Details
  CombatantSpellDetail(currentCombatantDetail, item) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
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
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
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
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
            this.router.navigate(['/character/spell-details', model.characterSpellId]);
          }
          else {
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
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
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
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
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
            this.router.navigate(['/character/ability-details', model.characterAbilityId]);
          }
          else {
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
            this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
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
  private get_Ruleset_XP_CharacterStatID(): number {
    let Ruleset_XP_CharacterStatID: number = 0;
    this.combatants.map((x) => {
      if (x.type == this.combatItemsType.CHARACTER && Ruleset_XP_CharacterStatID == 0) {
        if (x.character.diceRollViewModel.charactersCharacterStats) {
          let statFoundFlag: boolean = false;
          let charStat: CharactersCharacterStat = null;
          this.settings.charcterXpStats.split(/\[(.*?)\]/g).map((rec) => {
            if (rec && !statFoundFlag) {
              let charStatList = x.character.diceRollViewModel.charactersCharacterStats.filter(x => x.characterStat.statName.toUpperCase() == rec.toUpperCase());
              if (charStatList.length) {
                charStat = charStatList[0];
              }
              statFoundFlag = true;
            }
          });
          if (charStat) {
            Ruleset_XP_CharacterStatID = charStat.characterStatId;
          }
        }
      }
    })
    return Ruleset_XP_CharacterStatID;
  }

  //clickAndHold(monster) {
  //  if (monster.type == combatantType.MONSTER) {
  //    this.editMonster(monster);  
  //  }    
  //}

  clickAndHold(monster) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  editRecord(monster) {
    this.timeoutHandler = setInterval(() => {
      this.editMonster(monster);
    }, 1000);
  }

  ImageDeatil(itemDetail, imgref) {
    if (itemDetail.type == combatantType.MONSTER) {
      //if (this.settings.accessMonsterDetails) {
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
      this.router.navigate(['/ruleset/monster-details', itemDetail.monster.monsterId]);
      //} else {
      //  this.ViewImage(imgref);
      //}
    }
    if (itemDetail.type == combatantType.CHARACTER) {
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
      this.router.navigate(['/character/dashboard', itemDetail.character.characterId]);
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

  updateMonster(item, type) {
    this.bsModalRef = this.modalService.show(UpdateMonsterHealthComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = type;
    this.bsModalRef.content.combatInfo = item;
    this.bsModalRef.content.event.subscribe(result => {
      //if (result.type == combatantType.CHARACTER) {
      //  item.character.healthCurrent = result.character.healthCurrent;
      //  item.character.healthMax = result.character.healthMax;
      //}
      if (result.type == MonsterDetailType.HEALTH && result.record.type == combatantType.MONSTER) {
        this.appService.updateCombatantDetailFromGM(true);
        item.monster.healthCurrent = result.record.monster.healthCurrent;
        item.monster.healthMax = result.record.monster.healthMax;
      }
      else if (result.type == MonsterDetailType.RATING && result.record.type == combatantType.MONSTER) {
        item.monster.challangeRating = result.record.monster.challangeRating;
      }
      else if (result.type == MonsterDetailType.ARMOR && result.record.type == combatantType.MONSTER) {
        item.monster.armorClass = result.record.monster.armorClass;
      }
      else if (result.type == MonsterDetailType.INITIATIVE && result.record.type == combatantType.MONSTER) {
        item.initiative = result.record.initiative;
      }
      else if (result.type == MonsterDetailType.XPVALUE && result.record.type == combatantType.MONSTER) {
        item.monster.xpValue = result.record.monster.xpValue;
      }
    });
  }
  public onContextMenu($event: MouseEvent, item: any): void {

    this.contextMenuService.show.next({
      anchorElement: $event.target,
      // Optional - if unspecified, all context menu components will open
      contextMenu: this.contextMenu,
      event: <any>$event,
      item: item,
    });
    $event.preventDefault();
    $event.stopPropagation();
  }
  setdefaultColor(color, item) {

    item.visibilityColor = color.bodyBgColor;
    this.saveVisibilityDetails(item);

  }
  ShowMonsterName(item, flag) {
    item.showMonsterName = flag;
    this.saveVisibilityDetails(item);
  }
  ShowVisibility(item) {

    item.visibleToPc = true;
    this.saveVisibilityDetails(item);
  }
  HideVisibility(item) {

    item.visibleToPc = false;
    this.saveVisibilityDetails(item);
  }
  saveVisibilityDetails(currentItem) {

    this.BindMonstersName();
    this.combatService.saveVisibilityDetails(currentItem).subscribe(res => {
      this.appService.updateCombatantDetailFromGM(true);
    }, error => {

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

  getTargetImage(item) {
    let imageUrl = '';
    if (item.targetType == combatantType.MONSTER) {
      this.combatants.map(x => {
        if (x.type == combatantType.MONSTER) {
          if (x.monster.monsterId == item.targetId) {
            imageUrl = x.monster.imageUrl;
          }
        }

      });
    }
    else if (item.targetType == combatantType.CHARACTER) {
      this.combatants.map(x => {
        if (x.type == combatantType.CHARACTER) {
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
    if (item.targetType == combatantType.MONSTER) {
      this.combatants.map(x => {
        if (x.type == combatantType.MONSTER) {
          if (x.monster.monsterId == item.targetId) {
            name = x.monster.name;
          }
        }

      });
    }
    else if (item.targetType == combatantType.CHARACTER) {
      this.combatants.map(x => {
        if (x.type == combatantType.CHARACTER) {
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

  refreshPCDataModelPageData() {

    if (this.localStorage.localStorageGetItem(DBkeys.IsConnected)) {
      this.refreshPCDataModel = setInterval(() => {
        //console.log("update");
        this.combatService.getCombatDetails_PCModelData(this.ruleSetId).subscribe(data => {
          //console.log("res ", data);
          let res: any = data;
          if (res && res.combatantList) {
            if (res.combatantList.length) {
              let falg = true;
              res.combatantList.map((_rec_pc) => {
                this.combatants.map((_rec_combatant) => {

                  if ((res.hasCharacterChangedTurn && falg) && (res.currentCombatantTurnID > 0) && (_rec_combatant.isCurrentTurn) && (res.currentCombatantTurnID != _rec_combatant.id)) {                    falg = false;                    this.combatService.update_HasCharacterChangedTurn(this.CombatId, false).subscribe(res => {                      if (res) {                        this.nextTurn(true);                      }                    }, error => {                      //this.isLoading = false;                      let Errors = Utilities.ErrorDetail("", error);                      if (Errors.sessionExpire) {                        this.authService.logout(true);                      } else {                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);                      }                    });                  }

                  if (_rec_combatant.type == combatantType.CHARACTER && _rec_combatant.characterId == _rec_pc.characterId) {

                    ////////update target
                    _rec_combatant.targetType = _rec_pc.targetType;
                    _rec_combatant.targetId = _rec_pc.targetId;
                    ////////update target end

                    ////////update health
                    if (_rec_pc.character.diceRollViewModel.charactersCharacterStats) {
                      let statFoundFlag: boolean = false;
                      let charStat: CharactersCharacterStat = null;
                      this.settings.charcterHealthStats.split(/\[(.*?)\]/g).map((rec) => {
                        if (rec && !statFoundFlag) {
                          let charStatList = _rec_pc.character.diceRollViewModel.charactersCharacterStats.filter(x => x.characterStat.statName.toUpperCase() == rec.toUpperCase());
                          if (charStatList.length) {
                            charStat = charStatList[0];
                          }
                          statFoundFlag = true;
                        }
                      });

                      _rec_combatant.character.healthCurrent = this.DummyValueForCharHealthStat;
                      _rec_combatant.character.healthMax = this.DummyValueForCharHealthStat;
                      if (charStat) {
                        _rec_combatant.character.healthStatId = charStat.charactersCharacterStatId;
                        if (charStat.characterStat.characterStatTypeId == STAT_TYPE.CurrentMax) {
                          _rec_combatant.character.healthCurrent = +charStat.current;
                          _rec_combatant.character.healthMax = +charStat.maximum;
                        }
                        else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.ValueSubValue) {
                          _rec_combatant.character.healthCurrent = +charStat.value;
                          _rec_combatant.character.healthMax = +charStat.subValue;
                        }
                        else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.Number) {
                          _rec_combatant.character.healthCurrent = +charStat.number;
                        }
                        else if (charStat.characterStat.characterStatTypeId == STAT_TYPE.Combo) {
                          _rec_combatant.character.healthCurrent = +charStat.defaultValue;
                        }
                      }
                    }
                    ////////update health end

                    ////////update B&E
                    _rec_combatant.character.characterBuffAndEffects = _rec_pc.character.characterBuffAndEffects;
                    ////////update B&E end

                  }
                })
              })
            }

          }
        }, error => {

        });
      }, 3000);
    }
  }

  RemoveTargetBtn(item) {
    if (item) {
      let upadatedCombatant = item;
      upadatedCombatant.targetId = 0;
      upadatedCombatant.targetType = null;
      console.log(upadatedCombatant);
      this.SaveTarget(upadatedCombatant);
      //this.combatants.map(x => {
      //  if (x.type == combatantType.MONSTER && item.type == x.type && x.monster.monsterId == item.monster.monsterId && x.monster.characterId) {
      //    if (item.monster.characterId && item.monster.characterId == x.monster.characterId) {
      //        x.targetId = 0;
      //        x.targetType = null;
      //      this.SaveTarget(x);
      //    }
      //  } else {
      //    if (x.type == combatantType.CHARACTER && item.type == x.type && x.character.characterId == item.character.characterId) {
      //      if (x.isOwnPlayer) {
      //        x.targetId = 0;
      //        x.targetType = null;
      //        this.SaveTarget(x);
      //      }
      //    }
      //  }
      //});
    }
  }

  SaveTarget(combatatnt) {

    this.combatService.saveTarget(combatatnt, true).subscribe(res => {
      this.GetCombatDetails(false);
      //this.combatants.map(x => {
      //  if (x.id = combatatnt.id) {
      //    x.targetId = 0;
      //    x.targetType = null;
      //  }
      //});

      //if (this.currentCombatantDetail.id == combatatnt.id) {
      //  this.currentCombatantDetail.targetId = 0;
      //  this.currentCombatantDetail.targetType = null;
      //}

    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      } else {
        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }
    });
  }
  BindMonstersName() {
    let unknownMonsterNameCount = 1;
    this.combatants.map(x => {
      if (x.type == combatantType.MONSTER) {
        if (x.visibleToPc && !x.showMonsterName) {
          x.monster.unKonwnName = "Unknown #" + unknownMonsterNameCount;
          unknownMonsterNameCount = unknownMonsterNameCount + 1;
        }

      }
    });
  }

  GotoCommand(cmd) {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = cmd;
  }

  OpenGMInNewTab() {
    let RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
    this.router.navigate([]).then(result => { window.open(['/ruleset/combats/' + RuleSetId].toString() + '?newTab=1', '_blank'); });
    //this.router.navigate(['/ruleset/combat/'], { queryParams: { id:this.ruleSetId}, skipLocationChange: true }); 
  }
  OpenGMInNewWindow() {
    let RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
    window.open(['/ruleset/combats/' + RuleSetId].toString() + '?newTab=1', '_blank', "top=100,left=200,width=700,height=500")
  }

  OpenPlayerInNewTab() {
    //this.ruleSetId = CryptoJS.AES.encrypt(this.ruleSetId.toString(), this.KEY);
    let RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
    this.router.navigate([]).then(result => { window.open(['/ruleset/gm-playerview/' + RuleSetId].toString() + '?newTab=1', '_blank'); });
  }

  OpenPlayerInNewWindow() {
    let RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
    window.open(['/ruleset/gm-playerview/' + RuleSetId].toString() + '?newTab=1', '_blank', "top=100,left=200,width=800,height=500")
  }

  CombatantCommands(item, currentCombatantDetail) {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = item.command;
    this.bsModalRef.content.isFromCampaignDetail = true;
  }

  editBuff_Effect(buff_Effect, currentCombatantDetail) {
    this.timeoutHandler = setInterval(() => {
      this.EditBuff_Effect(buff_Effect, currentCombatantDetail);
    }, 1000);
  }

  EditBuff_Effect(buff_Effect, currentCombatantDetail) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
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
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
      this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Buff & Effect';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.fromDetail = false;
      this.bsModalRef.content.IsFromCharacter = true;
      this.bsModalRef.content.buffAndEffectVM = buff_Effect;
      this.bsModalRef.content.rulesetID = this.ruleSetId;
      this.bsModalRef.content.isEditingWithoutDetail = true;
      this.bsModalRef.content.userID = currentCombatantDetail.character.userId;
    }
  }

  editItem(item, currentCombatantDetail) {
    this.timeoutHandler = setInterval(() => {
      this.EditItem(item, currentCombatantDetail);
    }, 1000);
  }

  EditItem(item, currentCombatantDetail) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.bsModalRef = this.modalService.show(EditMonsterItemComponent, {
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
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
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
  }

  editSpell(spell, currentCombatantDetail) {
    this.timeoutHandler = setInterval(() => {
      this.EditSpell(spell, currentCombatantDetail);
    }, 1000);
  }

  EditSpell(spell, currentCombatantDetail) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
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
      this.bsModalRef.content.isEditingWithoutDetail = true;
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {
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
      this.bsModalRef.content.isFromCharacterId = currentCombatantDetail.character.characterId;
      this.bsModalRef.content.isEditingWithoutDetail = true;
      this.bsModalRef.content.userID = currentCombatantDetail.character.userId;
    }
  }

  editAbility(ability, currentCombatantDetail) {
    this.timeoutHandler = setInterval(() => {
      this.EditAbility(ability, currentCombatantDetail);
    }, 1000);
  }

  EditAbility(ability, currentCombatantDetail) {
    if (currentCombatantDetail.type == combatantType.MONSTER) {
      this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Ability';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.fromDetail = false;
      this.bsModalRef.content.abilityVM = ability;
      this.bsModalRef.content.rulesetID = this.ruleSetId;
      this.bsModalRef.content.isEditingWithoutDetail = true;
    }
    if (currentCombatantDetail.type == combatantType.CHARACTER) {

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
      this.bsModalRef.content.isFromCharacterId = currentCombatantDetail.character.characterId;
      this.bsModalRef.content.isFromCharacterAbilityId = ability.characterAbilityId;
      this.bsModalRef.content.rulesetID = this.ruleSetId
      this.bsModalRef.content.isEditingWithoutDetail = true;
      this.bsModalRef.content.userID = currentCombatantDetail.character.userId;
    }
  }


  GetMultipleCommands(item, data, charStat) {
    this.bsModalRef = this.modalService.show(CastComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });

    this.bsModalRef.content.title = "Item Commands";
    this.bsModalRef.content.ListCommands = data;
    this.bsModalRef.content.Command = item;
    this.bsModalRef.content.Character = this.character;
    this.bsModalRef.content.recordType = 'item';
    this.bsModalRef.content.recordId = item.itemId;
    this.bsModalRef.content.charStat = charStat;
    if (item.isConsumable) {
      this.bsModalRef.content.isConsumable = true;
    }
  }

  useItem(item: any) {
    if (item.characterId) {
      let charStat: any
      this.charactersCharacterStatService.getCharactersCharacterStat<any>(item.characterId, 1, 9999).subscribe(charStats => {
        if (charStats) {
          charStat = charStats;
          console.log("charStats => ", charStats);
        }
      }, error => { }, () => {
        if (item.itemId) {
          this.itemsService.getItemCommands_sp<any>(item.itemId)
            .subscribe(data => {
              if (data.length > 0) {

                if (item.isConsumable) {
                  if (item.quantity <= 0) {
                    let msg = "The Quantity for this " + item.name
                      + " item is " + item.quantity + " Would you like to continue?";
                    this.alertService.showDialog(msg, DialogType.confirm, () => this.GetMultipleCommands(item, data, charStat), null, 'Yes', 'No');
                  } else {
                    this.GetMultipleCommands(item, data, charStat);
                  }
                } else {
                  this.GetMultipleCommands(item, data, charStat);
                }
              } else {
                this.useCommand_Item(item, item.itemId, charStat);
              }
            }, error => { }, () => { });
        }
      });


    }
  }

  useCommand_Item(Command: any, itemId: string = '', charStat: any) {
    if (Command.isConsumable) {
      if (Command.quantity <= 0) {
        let msg = "The Quantity for this " + Command.name
          + " item is " + Command.quantity + " Would you like to continue?";
        this.alertService.showDialog(msg, DialogType.confirm, () => this.useCommandHelper(Command, itemId, charStat), null, 'Yes', 'No');
      } else {
        if (Command.command == undefined || Command.command == null || Command.command == '') {
          this.CommandUsed(Command);
        } else {
          this.useCommandHelper(Command, itemId, charStat);
        }
      }
    } else {
      let msg = "The command value for " + Command.name + " has not been provided. Edit this record to input one.";
      if (Command.command == undefined || Command.command == null || Command.command == '') {
        this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command, '', charStat));
      }
      else {
        //TODO
        this.useCommandHelper(Command, itemId, charStat);
      }
    }

  }

  private useCommandHelper(Command: any, itemId: string = '', charStat: any) {

    if (this.currentCombatantDetail.type == combatantType.CHARACTER) {
      this.characterId = this.currentCombatantDetail.character.characterId;
    }

    if (Command.command == undefined || Command.command == null || Command.command == '') {
      this.CommandUsed(Command);
    } else {
      this.bsModalRef = this.modalService.show(DiceRollComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = "Dice";
      this.bsModalRef.content.tile = -2;
      this.bsModalRef.content.characterId = this.characterId;
      this.bsModalRef.content.character = this.character;
      this.bsModalRef.content.command = Command.command;
      if (Command.hasOwnProperty("itemId")) {
        this.bsModalRef.content.recordName = Command.name;
        this.bsModalRef.content.recordImage = Command.itemImage;
        this.bsModalRef.content.recordType = 'item';
        this.bsModalRef.content.recordId = itemId;
        if (Command.isConsumable) {
          this.bsModalRef.content.charStat = charStat;
          setTimeout(() => {
            this.CommandUsed(Command);
          }, 4000);
        }
      }
      this.bsModalRef.content.event.subscribe(result => {
      });
    }
  }

  //Reduce Item's Quantity
  CommandUsed(Command) {
    this.itemsService.ReduceItemQty(Command.itemId, this.ruleSetId).subscribe(result => {
      let msg = "The " + Command.name + " has been used. " + result + " number of uses remain.";
      this.alertService.showMessage(msg, "", MessageSeverity.success);
      //this.ItemsList.map(x => {
      //  if (x.itemId == Command.itemId) {
      //    x.quantity = result;
      //    x.totalWeight = x.weight * x.quantity;
      //  }
      //});
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      }
    });
  }

  LaunchChatStyleCombatTracker() {
    this.appService.updateOpenCombatChat(true);
  }


}
