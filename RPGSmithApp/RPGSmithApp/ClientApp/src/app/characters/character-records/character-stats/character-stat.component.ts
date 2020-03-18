import { Component, OnInit, OnChanges, SimpleChanges, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { LinkRecordComponent } from "./link-record/link-record.component";
import { Characters } from "../../../core/models/view-models/characters.model";
import { DefaultValue_STAT_TYPE, STAT_LINK_TYPE, STAT_TYPE, CONDITION_OPERATOR_ENUM } from "../../../core/models/enums";
import { CharactersCharacterStat } from "../../../core/models/view-models/characters-character-stats.model";
import { SharedService } from "../../../core/services/shared.service";
import { AlertService, DialogType, MessageSeverity } from "../../../core/common/alert.service";
import { AuthService } from "../../../core/auth/auth.service";
import { CharactersCharacterStatService } from "../../../core/services/characters-character-stat.service";
import { CharacterStatService } from "../../../core/services/character-stat.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { RulesetService } from "../../../core/services/ruleset.service";
import { DBkeys } from "../../../core/common/db-keys";
import { User } from "../../../core/models/user.model";
import { Utilities } from "../../../core/common/utilities";
import { DiceService } from "../../../core/services/dice.service";
import { CharactersService } from "../../../core/services/characters.service";
import { CharacterStatConditionViewModel, CharacterStats, CharacterStatDefaultValue } from "../../../core/models/view-models/character-stats.model";
import { ServiceUtil } from "../../../core/services/service-util";
import { froalaEditorComponent } from "../../../shared/froalaEditor/froalaEditor.component";
import { NumericCharacterStatComponent } from "../../../shared/numeric-character-stats/numeric-character-stat.component";
import { DiceComponent } from "../../../shared/dice/dice/dice.component";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { CharacterStatsFormComponent } from "../../../rulesets/character-stats/character-stats-form/character-stats-form.component";
import { AppService1 } from "../../../app.service";
import { BuffAndEffect } from "../../../core/models/view-models/buff-and-effect.model";
import { AddBuffAndEffectComponent } from "../../../shared/buffs-and-effects/add-buffs-and-effects/add-buffs-and-effects.component";
import { BuffAndEffectService } from "../../../core/services/buff-and-effect.service";


@Component({
  selector: 'app-character-stat',
  templateUrl: './character-stat.component.html',
  styleUrls: ['./character-stat.component.scss']
})

export class CharacterCharacterStatComponent implements OnInit, OnChanges {

  isLoading = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  characterId: number;
  rulesetId: number;
  abilitiesList: any;
  isDropdownOpen: boolean = false;
  pageLastView: any;
  ruleSet: any;
  charactersCharacterStats: any;
  Old_charactersCharacterStats: any[] = [];
  scrollLoading: boolean = false;
  page: number = 1;
  pageSize: number = 30;
  offset = (this.page - 1) * this.pageSize;
  isModelChange: boolean = false;
  isSaved: boolean = false;
  character: any = new Characters();
  characterStatTypeList: any[] = [];
  _typeOptions: any[] = [];
  noRecordFound: boolean = false;
  DefVal_STATTYPE = DefaultValue_STAT_TYPE;
  STAT_LINK_TYPE = STAT_LINK_TYPE;
  statLinkRecords: any = [];
  choiceArraySplitter: string = 'S###@Split@###S';
  ConditionsValuesList: CharactersCharacterStat[] = []
  charNav: any = {};

  BuffAndEffectsList: any[] = [];
  selectedBuffAndEffectsList: any[] = [];
  pageRefresh: boolean;
  isPlayerCharacter: boolean = false;
  isPlayerLinkedToCurrentCampaign: boolean = false;
  //showBuffEffects: boolean = false;
  pauseBuffAndEffectAdd: boolean = false
  pauseBuffAndEffectCreate: boolean = false
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;
  doesCharacterHasAllies: boolean = false;
  BEShareService: any;
  searchText: string;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private charactersCharacterStatService: CharactersCharacterStatService,
    private sharedService: SharedService, private characterStatService: CharacterStatService, private charactersService: CharactersService,
    private rulesetService: RulesetService, public appService: AppService1, private buffAndEffectService: BuffAndEffectService
  ) {
    this.route.params.subscribe(params => { this.characterId = params['id']; });
    this.sharedService.shouldUpdateCharactersCharacterStats().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });

    this.sharedService.getCommandData().subscribe(diceCommand => {
      this.isModelChange = true;
      this.charactersCharacterStats.forEach(function (val) {
        if (diceCommand.parentIndex === val.charactersCharacterStatId) {
          val.displaycommand = diceCommand.command;
          val.command = diceCommand.command;
        }
      })
    });
    this.BEShareService = this.sharedService.shouldUpdateCharactersCharacterStatsBuffs().subscribe(data => {
      setTimeout(() => {
        if (data) {
          let res = JSON.parse(data)
          this.selectedBuffAndEffectsList.push({ text: res.name, value: res.buffAndEffectId, buffAndEffectId: res.buffAndEffectId, image: res.imageUrl })
          this.SelectBuffAndEffects();
        }

      }, 1000);

    });
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
      //if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE))
      //  this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
      if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE)) {
        if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerLink == 'character') {
          this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
        }
      }
      if (target.className.endsWith("is-show"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }
  ngOnDestroy() {
    if (this.BEShareService) {
      this.BEShareService.unsubscribe();
    }

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

    if (this.rulesetId == undefined)
      this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);

    this.destroyModalOnInit();
    this.initialize();
    this.showActionButtons(this.showActions);

    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (char) {
      if (!icharNav) {
        this.charNav = {
          'items': '/character/inventory/' + char.headerId,
          'spells': '/character/spell/' + char.headerId,
          'abilities': '/character/ability/' + char.headerId
        };
      }
      else {
        if (!icharNav[char.headerId]) {
          this.charNav = {
            'items': '/character/inventory/' + char.headerId,
            'spells': '/character/spell/' + char.headerId,
            'abilities': '/character/ability/' + char.headerId
          };
        } else {
          this.charNav = icharNav[char.headerId];
        }
      }
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    this.isModelChange = true;
  }

  cancelClick() {
    this.isLoading = true;
    this.isModelChange = false;
    this.page = 1;
    this.pageSize = 30;
    this.initialize();
  }

  navigateTo(redirectto: any) {

    var isconfirm = false;
    if (this.isModelChange == true) {
      this.alertService.showDialog('You have unsaved changes, would you like to save those now?',
        DialogType.confirm, () => this.save(this.charactersCharacterStats, redirectto), () => this.cancelCallback(redirectto), "Yes", "No");
    }
    else {
      this.cancelCallback(redirectto);
    }
  }

  public cancelCallback(redirectto: any) {
    if (redirectto == 1) {

      //this.router.navigate(['/character/ability/', this.characterId]);
      this.router.navigate([this.charNav.items]);
    }
    else if (redirectto == 2) {

      //this.router.navigate(['/character/spell/', this.characterId]);
      this.router.navigate([this.charNav.spells]);
    }
    else if (redirectto == 3) {

      //this.router.navigate(['/character/inventory/', this.characterId]);
      this.router.navigate([this.charNav.abilities]);
    }
    else if (redirectto == 4) {
      if (this.IsComingFromCombatTracker_GM) {
        this.router.navigate(['/ruleset/combat', this.rulesetId]);
      }
      else if (this.IsComingFromCombatTracker_PC) {
        this.router.navigate(['/character/combatplayer', + this.characterId]);
      }
      else {
        this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");
        this.router.navigate(['/character/dashboard', this.characterId]);
      }
      //this.router.navigate(['/character/dashboard/', this.characterId]);
    }
    else if (redirectto == 5) {

      this.router.navigate(['/ruleset/character-stats', this.rulesetId]);
    }
  }

  public mychange(event) {
    this.isModelChange = true;
  }

  private initialize() {

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.gameStatus(this.characterId);
      this.charactersCharacterStatService.getLinkRecordsDetails<any>(this.characterId)
        .subscribe(data => {
          this.statLinkRecords = data;
        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });

      this.charactersCharacterStatService.getConditionsValuesList<any[]>(this.characterId)
        .subscribe(data => {
          this.ConditionsValuesList = data;
          this.charactersCharacterStatService.getCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)
            .subscribe(data => {
              let oldData = Utilities.responseData(data, this.pageSize);
              this.charactersCharacterStats = Utilities.responseData(data, this.pageSize);
              try {
                this.noRecordFound = !data.length;
              } catch (err) { }
              this.isLoading = false;

              //this.save(this.charactersCharacterStats, 99);
              this.charactersCharacterStats.forEach(item => {

                item.icon = this.characterStatService.getIcon(item.characterStat.characterStatType.statTypeName);

                if (item.current == 0) {
                  item.current = "";
                }
                if (item.maximum == 0) {
                  item.maximum = "";
                }
                if (item.value == 0) {
                  item.value = "";
                }
                if (item.subValue == 0) {
                  item.subValue = "";
                }


                if (item.characterStat.characterStatType.statTypeName == 'Command') {
                  if (item.command != null && item.command != "")
                    item.displaycommand = item.command; //this.manageCommandDisplay(item.command);
                }

                //if (item.characterStat.statName.length > 8) {
                //    item.displayStatName = item.characterStat.statName.substr(0, 8);
                //}
                //else {
                item.displayStatName = item.characterStat.statName;
                //}

                //if (item.characterStat.statName.length > 6) {
                //    item.mobiledisplayStatName = item.characterStat.statName.substr(0, 6);
                //}
                //else {
                item.mobiledisplayStatName = item.characterStat.statName;
                //}

                if (item.characterStat.characterStatType.statTypeName == 'Rich Text') {
                  if (item.richText != null && item.richText != "")
                    item.displayRichText = item.richText.replace(/(<([^>]+)>)/ig, "");
                }

                if (item.characterStat.characterStatType.statTypeName == 'Calculation') {

                  if (item.characterStat.characterStatCalcs.length) {

                    let finalCalcString = '';
                    if (item.characterStat.characterStatCalcs[0].statCalculation != null && item.characterStat.characterStatCalcs[0].statCalculation != undefined) {  //&& item.characterStat.characterStatCalcs[0].statCalculation.length > 34) {
                      item.displayCalculation = item.characterStat.characterStatCalcs[0].statCalculation; //.substr(0, 34) + "...";
                      let IDs: any[] = [];
                      let CalcString = item.characterStat.characterStatCalcs[0].statCalculationIds;

                      if (item.characterStat.characterStatCalcs[0].statCalculationIds) {

                        item.characterStat.characterStatCalcs[0].statCalculationIds.split(/\[(.*?)\]/g).map((rec) => {

                          let id = ''; let flag = false; let type = 0; let statType = 0;
                          if (rec.split('_').length > 1) {
                            id = rec.split('_')[0].replace('[', '').replace(']', '');
                            type = parseInt(rec.split('_')[1])
                          }
                          else {
                            id = rec.replace('[', '').replace(']', '');
                            type = 0
                          }

                          this.charactersCharacterStats.map((q) => {
                            if (!flag) {
                              flag = (parseInt(id) == q.characterStatId);
                              statType = q.characterStat.characterStatTypeId
                            }
                          })

                          if (flag) {
                            IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
                          }
                          else if (+id == -1) {
                            IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
                          }
                        })


                      }
                      IDs.map((rec) => {

                        if (+rec.id == -1 && this.character.inventoryWeight) {
                          CalcString = CalcString.replace(rec.originaltext, this.character.inventoryWeight);
                        } else {
                          this.charactersCharacterStats.map((stat) => {
                            if (rec.id == stat.characterStatId) {
                              let num = 0;
                              switch (rec.statType) {
                                case 3: //Number
                                  num = stat.number
                                  break;
                                case 5: //Current Max
                                  if (rec.type == 1)//current
                                  {
                                    num = stat.current
                                  }
                                  else if (rec.type == 2)//Max
                                  {
                                    num = stat.maximum
                                  }
                                  break;
                                case 7: //Val Sub-Val
                                  if (rec.type == 3)//value
                                  {
                                    num = +stat.value
                                  }
                                  else if (rec.type == 4)//sub-value
                                  {
                                    num = stat.subValue
                                  }
                                  break;
                                case 12: //Calculation
                                  num = stat.calculationResult
                                  break;
                                case STAT_TYPE.Combo: //Combo
                                  num = stat.defaultValue
                                  break;
                                case STAT_TYPE.Choice: //Choice
                                  num = stat.defaultValue
                                  break;
                                case STAT_TYPE.Condition: //condition
                                  let characterStatConditionsfilter = this.ConditionsValuesList.filter((CCS) => CCS.characterStat.characterStatId == rec.id);
                                  let characterStatConditions = characterStatConditionsfilter["0"].characterStat.characterStatConditions;
                                  let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.ConditionsValuesList);
                                  num = +result;
                                  break;
                                default:
                                  break;
                              }
                              if (num)
                                CalcString = CalcString.replace(rec.originaltext, num);
                              //else
                              //    CalcString = CalcString.replace(rec.originaltext, 0);
                            }
                          });
                        }

                        finalCalcString = CalcString;
                      });
                    }
                    //else {
                    //    item.displayCalculation = item.characterStat.characterStatCalcs[0].statCalculation;
                    //}
                    //if (item.characterStat.characterStatCalcs[0].statCalculation != null && item.characterStat.characterStatCalcs[0].statCalculation != undefined && item.characterStat.characterStatCalcs[0].statCalculation.length > 8) {
                    //item.displayMobileCalculation = item.characterStat.characterStatCalcs[0].statCalculation.substr(0, 8) + "...";
                    //}
                    // else {
                    item.displayMobileCalculation = item.characterStat.characterStatCalcs[0].statCalculation;
                    //}
                    try {
                      //finalCalcString = finalCalcString.replace("/()/g", "0");
                      finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
                        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
                        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
                        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
                        ? finalCalcString.trim().slice(0, -1)
                        : finalCalcString.trim();
                      item.calculationResult = DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
                    }
                    catch (ex) {
                      item.calculationResult = this.getCalculationResult(item.characterStat.characterStatCalcs[0].statCalculation);
                    }
                    if (isNaN(item.calculationResult)) {
                      item.calculationResult = 0;
                    }
                    //item.calculationResult = this.getCalculationResult(item.characterStat.characterStatCalcs[0].statCalculation);
                  }
                }

                if (item.characterStat.characterStatTypeId == STAT_TYPE.Condition) {

                  let result = '';
                  if (item.characterStat.characterStatConditions) {

                    if (item.characterStat.characterStatConditions.length) {
                      let SkipNextEntries: boolean = false;
                      item.characterStat.characterStatConditions.map((Condition: CharacterStatConditionViewModel) => {
                        if (!SkipNextEntries) {
                          //let ConditionStatValue: string = this.GetValueFromStatsByStatID(Condition.ifClauseStatId, Condition.ifClauseStattype);

                          let ConditionStatValue: string = '';
                          if (Condition.ifClauseStatText) {
                            ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(this.character.inventoryWeight, this.ConditionsValuesList, Condition, false);
                          }
                          let operator = "";
                          let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(this.character.inventoryWeight, this.ConditionsValuesList, Condition, true);//Condition.compareValue;

                          let ConditionTrueResult = Condition.result;


                          if (Condition.sortOrder != item.characterStat.characterStatConditions.length) {//if and Else If Part
                            if (Condition.conditionOperator) {
                              //////////////////////////////////////////////////////////////////

                              if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUALS ||
                                Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.NOT_EQUALS ||
                                Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.GREATER_THAN ||
                                Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_GREATER_THAN ||
                                Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.LESS_THAN ||
                                Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_LESS_THAN) {

                                operator = Condition.conditionOperator.symbol;
                                let ConditionCheckString = '';
                                if (Condition.isNumeric) {
                                  ConditionStatValue = ConditionStatValue ? ConditionStatValue : "0";
                                  ValueToCompare = ValueToCompare ? ValueToCompare : "0";
                                  ConditionCheckString = ConditionStatValue + ' ' + operator + ' ' + ValueToCompare;
                                }
                                else {
                                  ConditionCheckString = ' "' + ConditionStatValue + '" ' + operator + ' "' + ValueToCompare + '" ';
                                }
                                ConditionCheckString = ConditionCheckString.toUpperCase();
                                let conditionCheck = eval(ConditionCheckString);
                                if ((typeof (conditionCheck)) == "boolean") {
                                  if (conditionCheck) {
                                    result = ConditionTrueResult;
                                    SkipNextEntries = true;
                                  }
                                }
                              }


                              else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_BLANK) {
                                if (!ConditionStatValue) {
                                  result = ConditionTrueResult;
                                  SkipNextEntries = true;
                                }
                              }
                              else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_NOT_BLANK) {
                                if (ConditionStatValue) {
                                  result = ConditionTrueResult;
                                  SkipNextEntries = true;
                                }
                              }
                              //else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                              //    ValueToCompare = ValueToCompare ? ValueToCompare : '';
                              //    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                              //    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {

                              //        let choicesArr: any[] = ConditionStatValue.split(this.choiceArraySplitter);
                              //        choicesArr = choicesArr.map((z) => {
                              //            return z.toUpperCase();
                              //        })
                              //        if (choicesArr.indexOf(ValueToCompare.toUpperCase()) > -1) {
                              //            result = ConditionTrueResult;
                              //            SkipNextEntries = true;
                              //        }
                              //    }
                              //    else {
                              //        if (ConditionStatValue.toUpperCase() == ValueToCompare.toUpperCase()) {
                              //            result = ConditionTrueResult;
                              //            SkipNextEntries = true;
                              //        }
                              //    }
                              //}
                              //else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                              //    ValueToCompare = ValueToCompare ? ValueToCompare : '';
                              //    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                              //    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {

                              //        let choicesArr: any[] = ConditionStatValue.split(this.choiceArraySplitter);
                              //        choicesArr= choicesArr.map((z) => {
                              //            return z.toUpperCase();
                              //        })
                              //        if (choicesArr.indexOf(ValueToCompare.toUpperCase()) == -1) {
                              //            result = ConditionTrueResult;
                              //            SkipNextEntries = true;
                              //        }
                              //    }
                              //    else {
                              //        if (ConditionStatValue.toUpperCase() != ValueToCompare.toUpperCase()) {
                              //            result = ConditionTrueResult;
                              //            SkipNextEntries = true;
                              //        }
                              //    }
                              //}
                              else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                                ValueToCompare = ValueToCompare ? ValueToCompare : '';
                                ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                                if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                                  if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                                    result = ConditionTrueResult;
                                    SkipNextEntries = true;
                                  }
                                }
                                else {
                                  if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                                    result = ConditionTrueResult;
                                    SkipNextEntries = true;
                                  }
                                }
                              }
                              else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                                ValueToCompare = ValueToCompare ? ValueToCompare : '';
                                ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                                if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                                  if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                                    result = ConditionTrueResult;
                                    SkipNextEntries = true;
                                  }
                                }
                                else {
                                  if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                                    result = ConditionTrueResult;
                                    SkipNextEntries = true;
                                  }
                                }
                              }
                              //////////////////////////////////////////////////////////////////
                            }
                          }
                          else {
                            let ConditionFalseResult = Condition.result;
                            result = ConditionFalseResult;
                            SkipNextEntries = true;
                          }
                        }
                      })
                    }
                  }
                  item.text = result;
                }
              });

              if (oldData && oldData.length) {
                oldData.map((z) => {
                  let newStat = this.charactersCharacterStats.find(d => d.charactersCharacterStatId == z.charactersCharacterStatId)

                  if (newStat) {
                    this.Old_charactersCharacterStats.push(Object.assign({}, newStat));
                  }
                })
              }

              setTimeout(() => {
                if (window.innerHeight > document.body.clientHeight) {
                  //this.onScroll();
                }
              }, 10)
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => {



            });
        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });


    }
    this.charactersService.getCharactersById<any>(this.characterId)
      .subscribe(data => {
        this.character = data;
        //this.isLoading = false;
        this.setHeaderValues(this.character);
        this.rulesetId = data.ruleSet.ruleSetId
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
    this.rulesetService.getRulesetById<any>(this.rulesetId)
      .subscribe(data => {
        this.ruleSet = data;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
    this.characterStatService.getCharacterStatTypeList<any[]>()
      .subscribe(
        data => {
          this.characterStatTypeList = data;

          this.characterStatTypeList.forEach((val) => {
            val.icon = this.characterStatService.getIcon(val.statTypeName);
          });
        },
        error => {
          console.log("Error: ", error);
        }, () => { });
    this.characterStatService.getCharacterStatsByRuleset<CharacterStats[]>(this.rulesetId)
      .subscribe(data => {

        // this.isLoading = false;
        //this.characterStats = data;
        //this.characterStats.forEach((val) => {
        //    val.icon = this.characterStatService.getIcon(val.characterStatTypeViewModel.statTypeName);
        //});
        this._typeOptions = this.characterStatService.getOptions(data);
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });

    this.buffAndEffectService.getBuffAndEffectAssignedToCharacter<any[]>(this.characterId)
      .subscribe(data => {
        if (data) {
          if (data.length) {
            this.selectedBuffAndEffectsList = data.map((x) => {
              return { text: x.name, value: x.buffAndEffectId, buffAndEffectId: x.buffAndEffectId, image: x.imageUrl }
            })
            this.BuffAndEffectsList = data.map((x) => {
              return { text: x.name, value: x.buffAndEffectId, buffAndEffectId: x.buffAndEffectId, image: x.imageUrl }
            })
          }
        }

      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });

  }

  private getCalculationResult(value: string): number {
    try {
      if (value) {
        //value = value.
        return this.charactersCharacterStats.map(x => {
          return { id: x.characterStatId, type: x.characterStatTypeViewModel.statTypeName, name: x.statName };
        }).filter(y => y.type == 'Number' || y.type.startsWith('Value') || y.type.startsWith('Current'));
      }
      else return 0;
    } catch (err) { return 0; }
  }

  //public manageCommandDisplay(command: any) {
  //    var result = this.getFromBetween.get(command, "[", "]");

  //    var ifItemExsist = false;

  //    result.forEach(item => {

  //        var subvalue = this.getFromBetween.get(item, "(", ")");

  //        if (subvalue.length > 0) {
  //            var endindex = item.indexOf("(");
  //            item = item.substr(0, endindex);
  //            this.charactersCharacterStats.forEach(function (val) {

  //                if (item == val.characterStatId) {
  //                    command = command.replace("[" + item + "(" + subvalue + ")]", "[" + val.characterStat.statName + "(" + subvalue + ")]");
  //                    ifItemExsist = true;
  //                }
  //            });

  //            if (!ifItemExsist) {

  //                command = command.replace("[" + item + "(" + subvalue + ")]", "[Character Stat Not Found]");
  //            }

  //            ifItemExsist = false;

  //        }
  //        else {

  //            this.charactersCharacterStats.forEach(function (val) {
  //                if (item == val.characterStatId) {
  //                    command = command.replace("[" + item + "]", "[" + val.characterStat.statName + "]");
  //                    ifItemExsist = true;
  //                }
  //            });
  //            if (!ifItemExsist) {
  //                command = command.replace("[" + item + "]", "[Character Stat Not Found]");
  //            }
  //            ifItemExsist = false;
  //        }
  //    });
  //    return command;
  //}

  manageCommandSave(command: any) {

    var result = this.getFromBetween.get(command, "[", "]");

    result.forEach(item => {
      var subvalue = this.getFromBetween.get(item, "(", ")");
      if (subvalue.length > 0) {
        var endindex = item.indexOf("(");
        item = item.substr(0, endindex);
        this.charactersCharacterStats.forEach(function (val) {
          if (item == val.characterStat.statName) {
            command = command;//.replace("[" + item + "(" + subvalue + ")]", "[" + val.characterStat.characterStatId + "(" + subvalue + ")]");
          }
        });
      }
      else {

        this.charactersCharacterStats.forEach(function (val) {
          if (item == val.characterStat.statName) {
            command = command;//.replace("[" + item + "]", "[" + val.characterStat.characterStatId + "]");
          }
        });
      }
    });

    return command;
  }

  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  save(characterstats: any, redirectto: any) {
    //if (redirectto == 99) {
    //  this.isLoading = true;
    //  }
    let valid = true;
    characterstats.map((cs) => {
      if (cs.characterStat.characterStatTypeId == STAT_TYPE.Combo) {
        if (!(+cs.minimum == 0 && +cs.maximum == 0)) {
          if (!(+cs.defaultValue >= +cs.minimum && +cs.defaultValue <= +cs.maximum)) {

            valid = false;
            this.alertService.showMessage("The value for " + cs.displayStatName + " field must be between " + cs.minimum + " and " + cs.maximum + " value", "", MessageSeverity.error);
          }
        }
      }
      if (cs.characterStat.characterStatTypeId == STAT_TYPE.Number || cs.characterStat.characterStatTypeId == STAT_TYPE.CurrentMax ||
        cs.characterStat.characterStatTypeId == STAT_TYPE.ValueSubValue) {
        if (cs.characterStat.characterStatDefaultValues.length) {
          switch (cs.characterStat.characterStatTypeId) {
            case STAT_TYPE.Number:
              let defval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[0];
              if (!(+defval.minimum == 0 && +defval.maximum == 0)) {
                if (!(+cs.number >= +defval.minimum && +cs.number <= +defval.maximum)) {

                  this.alertService.showMessage("The value for " + cs.displayStatName + " field must be between " + defval.minimum + " and " + defval.maximum + " value", "", MessageSeverity.error);
                  valid = false;
                }
              }
              break;
            case STAT_TYPE.CurrentMax:
              let CurDefval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[0];
              if (!(+CurDefval.minimum == 0 && +CurDefval.maximum == 0)) {
                if (!(+cs.current >= +CurDefval.minimum && +cs.current <= +CurDefval.maximum)) {

                  this.alertService.showMessage("The value for " + cs.displayStatName + " field must be between " + CurDefval.minimum + " and " + CurDefval.maximum + " value", "", MessageSeverity.error);
                  valid = false;
                }
              }
              let MaxDefval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[1];
              if (!(+MaxDefval.minimum == 0 && +MaxDefval.maximum == 0)) {
                if (!(+cs.maximum >= +MaxDefval.minimum && +cs.maximum <= +MaxDefval.maximum)) {

                  this.alertService.showMessage("The value for " + cs.displayStatName + " field must be between " + MaxDefval.minimum + " and " + MaxDefval.maximum + " value", "", MessageSeverity.error);
                  valid = false;
                }
              }
              break;
            case STAT_TYPE.ValueSubValue:

              let ValDefval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[0];
              if (!(+ValDefval.minimum == 0 && +ValDefval.maximum == 0)) {
                if (!(+cs.value >= +ValDefval.minimum && +cs.value <= +ValDefval.maximum)) {

                  this.alertService.showMessage("The value for " + cs.displayStatName + " field must be between " + ValDefval.minimum + " and " + ValDefval.maximum + " value", "", MessageSeverity.error);
                  valid = false;
                }
              }
              let SubDefval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[1];
              if (!(+SubDefval.minimum == 0 && +SubDefval.maximum == 0)) {
                if (!(+cs.subValue >= +SubDefval.minimum && +cs.subValue <= +SubDefval.maximum)) {

                  this.alertService.showMessage("The value for " + cs.displayStatName + " field must be between " + SubDefval.minimum + " and " + SubDefval.maximum + " value", "", MessageSeverity.error);
                  valid = false;
                }
              }
              break;


            default:
          }
        }

      }
    })
    if (!valid) {

      //alert('falseff')
      return false;
    }

    let _msg = "Updating Character Stats..";
    this.isLoading = true;

    this.alertService.startLoadingMessage("", _msg);
    //if (redirectto != 99) {
    //  this.alertService.startLoadingMessage("", _msg);
    //}


    characterstats.forEach(item => {

      if (item.current == "") {
        item.current = 0;
      }

      if (item.maximum == "") {
        item.maximum = 0;
      }

      if (item.value == "") {
        item.value = 0;
      }

      if (item.subValue == "") {
        item.subValue = 0;
      }

      if (item.characterStat.characterStatType.statTypeName == "Choice" && item.characterStat.isMultiSelect == true) {

        item.multiChoice = "";
        item.selectedCharacterChoices.forEach(item2 => {
          item.multiChoice = item.multiChoice + item2.characterStatChoiceId + ';'
        });

        if (item.multiChoice != null && item.multiChoice != '')
          item.multiChoice = item.multiChoice.slice(0, -1);
      }

      if (item.characterStat.characterStatType.statTypeName == "Choice" && item.characterStat.isMultiSelect == false) {

        item.choice = "";
        item.selectedCharacterChoices.forEach(item2 => {
          item.choice = item.choice + item2.characterStatChoiceId + ';'
        });

        if (item.choice != null && item.choice != '')
          item.choice = item.choice.slice(0, -1);
      }

      if (item.characterStat.characterStatType.statTypeName == "Command") {
        if (item.displaycommand != null && item.displaycommand != "")
          item.command = item.displaycommand;//this.manageCommandSave(item.displaycommand);

        //alert(item.displaycommand);
      }

      if (item.characterStat.characterStatType.statTypeName == "Calculation") {

        // item.calculationResult =
        if (item.characterStat.characterStatCalcs.length) {
          let finalCalcString = '';
          if (item.characterStat.characterStatCalcs[0].statCalculation != null && item.characterStat.characterStatCalcs[0].statCalculation != undefined) {
            item.displayCalculation = item.characterStat.characterStatCalcs[0].statCalculation;
            let IDs: any[] = [];
            let CalcString = item.characterStat.characterStatCalcs[0].statCalculationIds;
            if (item.characterStat.characterStatCalcs[0].statCalculationIds) {
              item.characterStat.characterStatCalcs[0].statCalculationIds.split(/\[(.*?)\]/g).map((rec) => {

                let id = ''; let flag = false; let type = 0; let statType = 0;
                if (rec.split('_').length > 1) {
                  id = rec.split('_')[0].replace('[', '').replace(']', '');
                  type = parseInt(rec.split('_')[1])
                }
                else {
                  id = rec.replace('[', '').replace(']', '');
                  type = 0
                }
                this.charactersCharacterStats.map((q) => {
                  if (!flag) {
                    flag = (parseInt(id) == q.characterStatId);
                    statType = q.characterStat.characterStatTypeId
                  }
                })
                if (flag) {
                  IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
                }
                else if (+id == -1) {
                  IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
                }
              })
            }
            IDs.map((rec) => {
              if (+rec.id == -1 && this.character.inventoryWeight) {
                CalcString = CalcString.replace(rec.originaltext, this.character.inventoryWeight);
              } else {
                this.charactersCharacterStats.map((stat) => {
                  if (rec.id == stat.characterStatId) {
                    let num = 0;
                    switch (rec.statType) {
                      case 3: //Number
                        num = stat.number
                        break;
                      case 5: //Current Max
                        if (rec.type == 1)//current
                        {
                          num = stat.current
                        }
                        else if (rec.type == 2)//Max
                        {
                          num = stat.maximum
                        }
                        break;
                      case 7: //Val Sub-Val
                        if (rec.type == 3)//value
                        {
                          num = +stat.value
                        }
                        else if (rec.type == 4)//sub-value
                        {
                          num = stat.subValue
                        }
                        break;
                      case 12: //Calculation
                        num = stat.calculationResult
                        break;
                      case STAT_TYPE.Combo: //Combo
                        num = stat.defaultValue
                        break;
                      case STAT_TYPE.Choice: //Choice
                        num = stat.defaultValue
                        break;
                      case STAT_TYPE.Condition: //condition
                        let characterStatConditionsfilter = this.ConditionsValuesList.filter((CCS) => CCS.characterStat.characterStatId == rec.id);
                        let characterStatConditions = characterStatConditionsfilter["0"].characterStat.characterStatConditions;
                        let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.ConditionsValuesList);
                        num = +result;
                        break;
                      default:
                        break;
                    }
                    if (num)
                      CalcString = CalcString.replace(rec.originaltext, num);
                    //else
                    //CalcString = CalcString.replace(rec.originaltext, 0);
                    //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
                  }

                });
              }
              finalCalcString = CalcString;
            });
          }
          try {
            finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
              finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
              finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
              finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
              ? finalCalcString.trim().slice(0, -1)
              : finalCalcString.trim();
            item.calculationResult = DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
          }
          catch (ex) {
            item.calculationResult = this.getCalculationResult(item.characterStat.characterStatCalcs[0].statCalculation);
          }
          if (isNaN(item.calculationResult)) {
            item.calculationResult = 0;
          }
        }
      }

      if (item.characterStat.characterStatTypeId == STAT_TYPE.Condition) {

        let result = '';
        if (item.characterStat.characterStatConditions) {

          if (item.characterStat.characterStatConditions.length) {
            let SkipNextEntries: boolean = false;
            item.characterStat.characterStatConditions.map((Condition: CharacterStatConditionViewModel) => {
              if (!SkipNextEntries) {
                //let ConditionStatValue: string = this.GetValueFromStatsByStatID(Condition.ifClauseStatId, Condition.ifClauseStattype);

                let ConditionStatValue: string = '';
                if (Condition.ifClauseStatText) {
                  ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(this.character.inventoryWeight, this.ConditionsValuesList, Condition, false);
                }
                let operator = "";
                let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(this.character.inventoryWeight, this.ConditionsValuesList, Condition, true);//Condition.compareValue;

                let ConditionTrueResult = Condition.result;


                if (Condition.sortOrder != item.characterStat.characterStatConditions.length) {//if and Else If Part
                  if (Condition.conditionOperator) {
                    //////////////////////////////////////////////////////////////////

                    if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUALS ||
                      Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.NOT_EQUALS ||
                      Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.GREATER_THAN ||
                      Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_GREATER_THAN ||
                      Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.LESS_THAN ||
                      Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_LESS_THAN) {

                      operator = Condition.conditionOperator.symbol;
                      let ConditionCheckString = '';
                      if (Condition.isNumeric) {
                        ConditionStatValue = ConditionStatValue ? ConditionStatValue : "0";
                        ValueToCompare = ValueToCompare ? ValueToCompare : "0";
                        ConditionCheckString = ConditionStatValue + ' ' + operator + ' ' + ValueToCompare;
                      }
                      else {
                        ConditionCheckString = ' "' + ConditionStatValue + '" ' + operator + ' "' + ValueToCompare + '" ';
                      }
                      ConditionCheckString = ConditionCheckString.toUpperCase();
                      let conditionCheck = eval(ConditionCheckString);
                      if ((typeof (conditionCheck)) == "boolean") {
                        if (conditionCheck) {
                          result = ConditionTrueResult;
                          SkipNextEntries = true;
                        }
                      }
                    }


                    else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_BLANK) {
                      if (!ConditionStatValue) {
                        result = ConditionTrueResult;
                        SkipNextEntries = true;
                      }
                    }
                    else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_NOT_BLANK) {
                      if (ConditionStatValue) {
                        result = ConditionTrueResult;
                        SkipNextEntries = true;
                      }
                    }
                    //else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                    //    ValueToCompare = ValueToCompare ? ValueToCompare : '';
                    //    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                    //    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {

                    //        let choicesArr: any[] = ConditionStatValue.split(this.choiceArraySplitter);
                    //        choicesArr = choicesArr.map((z) => {
                    //            return z.toUpperCase();
                    //        })
                    //        if (choicesArr.indexOf(ValueToCompare.toUpperCase()) > -1) {
                    //            result = ConditionTrueResult;
                    //            SkipNextEntries = true;
                    //        }
                    //    }
                    //    else {
                    //        if (ConditionStatValue.toUpperCase() == ValueToCompare.toUpperCase()) {
                    //            result = ConditionTrueResult;
                    //            SkipNextEntries = true;
                    //        }
                    //    }
                    //}
                    //else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                    //    ValueToCompare = ValueToCompare ? ValueToCompare : '';
                    //    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                    //    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {

                    //        let choicesArr: any[] = ConditionStatValue.split(this.choiceArraySplitter);
                    //        choicesArr = choicesArr.map((z) => {
                    //            return z.toUpperCase();
                    //        })
                    //        if (choicesArr.indexOf(ValueToCompare.toUpperCase()) == -1) {
                    //            result = ConditionTrueResult;
                    //            SkipNextEntries = true;
                    //        }
                    //    }
                    //    else {
                    //        if (ConditionStatValue.toUpperCase() != ValueToCompare.toUpperCase()) {
                    //            result = ConditionTrueResult;
                    //            SkipNextEntries = true;
                    //        }
                    //    }
                    //}
                    else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                      ValueToCompare = ValueToCompare ? ValueToCompare : '';
                      ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                      if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                        if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                          result = ConditionTrueResult;
                          SkipNextEntries = true;
                        }
                      }
                      else {
                        if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                          result = ConditionTrueResult;
                          SkipNextEntries = true;
                        }
                      }
                    }
                    else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                      ValueToCompare = ValueToCompare ? ValueToCompare : '';
                      ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                      if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                        if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                          result = ConditionTrueResult;
                          SkipNextEntries = true;
                        }
                      }
                      else {
                        if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                          result = ConditionTrueResult;
                          SkipNextEntries = true;
                        }
                      }
                    }
                    //////////////////////////////////////////////////////////////////
                  }
                }
                else {
                  let ConditionFalseResult = Condition.result;
                  result = ConditionFalseResult;
                  SkipNextEntries = true;
                }
              }
            })
          }
        }
        item.text = result;
      }

    });
    let alerToGM = false;
    let alertToPlayer = false;

    if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {         //AlertToPlayer
      alerToGM = false;
      alertToPlayer = true;
    } else if (this.isPlayerCharacter && !this.isPlayerLinkedToCurrentCampaign) { //AlertToGM
      alerToGM = true;
      alertToPlayer = false;
    }

    this.charactersCharacterStatService.updateCharactersCharacterStatList(characterstats, alerToGM, alertToPlayer)
      .subscribe(
        data => {
          this.page = 1;
          this.pageSize = 30;

          this.appService.updateDiceCommandFromCharacterStat(true);
          this.alertService.stopLoadingMessage();
          let message = "Characters stats has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          //if (redirectto != 99) {
          //  this.alertService.showMessage(message, "", MessageSeverity.success);
          //}

          ServiceUtil.BindCharCharDetailsInLocalStorage(this.characterId, this.charactersCharacterStatService, this.localStorage, true, true, -1, this.alertService, this.Old_charactersCharacterStats, this.characterStatService);

          if (redirectto == 0) {

            //this.sharedService.updateCharactersCharacterStats(true);
            this.isModelChange = false;
            this.router.navigate(['/character/dashboard', this.characterId]);
          }
          else if (redirectto == 1) {
            //this.router.navigate(['/character/ability/', this.characterId]);
            this.router.navigate([this.charNav.abilities]);
          }
          else if (redirectto == 2) {
            //this.router.navigate(['/character/spell/', this.characterId]);
            this.router.navigate([this.charNav.spells]);
          }
          else if (redirectto == 3) {
            //this.router.navigate(['/character/inventory/', this.characterId]);
            this.router.navigate([this.charNav.items]);
          }
          else if (redirectto == 4) {
            if (this.IsComingFromCombatTracker_GM) {
              this.router.navigate(['/ruleset/combat', this.rulesetId]);
            }
            else if (this.IsComingFromCombatTracker_PC) {
              this.router.navigate(['/character/combatplayer', + this.characterId]);
            }
            else {
              this.router.navigate(['/character/dashboard', this.characterId]);
            }
            //this.router.navigate(['/character/dashboard/', this.characterId]);
          }
          else if (redirectto == 5) {
            this.router.navigate(['/ruleset/character-stats', this.rulesetId]);
          }
          //else if (redirectto == 99) {
          //  this.isLoading = false;
          //}
          else {
            this.router.navigate(['/character/dashboard', this.characterId]);
          }
          //setTimeout(() => { this.isLoading = false; }, 500);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Update ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        },
      );


    // this.router.navigate(['/character/dashboard', this.characterId]);
  }

  selectChoice(filterVal: any, characterstatId: number) {
    this.charactersCharacterStats.forEach(function (val) {
      if (characterstatId === val.charactersCharacterStatId) {
        val.choice = filterVal;
      }
    })
  }

  selectYesNo(filterVal: any, characterstatId: number) {
    this.isModelChange = true;
    this.charactersCharacterStats.forEach(function (val) {
      if (characterstatId === val.charactersCharacterStatId) {
        val.yesNo = filterVal;
      }
    })
  }
  selectIsYesNo(filterVal: any, characterstatId: number) {
    this.isModelChange = true;
    this.charactersCharacterStats.forEach(function (val) {
      if (characterstatId === val.charactersCharacterStatId) {
        val.isYes = filterVal;
      }
    })
  }
  selectDisplay(filterVal: any, characterstatId: number) {
    this.isModelChange = true;
    this.charactersCharacterStats.forEach(function (val) {
      if (characterstatId === val.charactersCharacterStatId) {
        //val.showCheckbox = filterVal;
        val.showCheckbox = !val.showCheckbox;
      }
    })
  }

  selectOnOff(filterVal: any, characterstatId: number) {
    this.isModelChange = true;
    this.charactersCharacterStats.forEach(function (val) {
      if (characterstatId === val.charactersCharacterStatId) {
        val.onOff = filterVal;
      }
    })
  }
  selectIsOnOff(filterVal: any, characterstatId: number) {
    this.isModelChange = true;
    this.charactersCharacterStats.forEach(function (val) {
      if (characterstatId === val.charactersCharacterStatId) {
        val.isOn = filterVal;
      }
    })
  }
  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  get multichoiceSettings() {
    return {
      primaryKey: "statChoiceValue",
      labelKey: "statChoiceValue",
      text: "select choice(s)",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "bottom"
    };
  }
  get multichoiceBuffEffectsSettings() {
    return {
      primaryKey: "buffAndEffectId",
      labelKey: "buffAndEffectId",
      text: "select Buffs & Effects",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "bottom"
    };
  }
  get singlechoiceSettings() {
    return {
      primaryKey: "statChoiceValue",
      labelKey: "statChoiceValue",
      text: "select choice",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "bottom"
    };
  }

  //Here the multiselect methods
  onItemSelect(item: any) {
    //console.log(item);
  }
  OnItemDeSelect(item: any) {
    //console.log(item);
  }
  onSelectAll(items: any) {
    //console.log(items);
  }
  onDeSelectAll(items: any) {
    //console.log(items);
  }

  onScroll() {

    ++this.page;
    this.scrollLoading = true;

    this.charactersCharacterStatService.getCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)
      .subscribe(data => {

        for (var i = 0; i < data.length; i++) {
          this.charactersCharacterStats.push(data[i]);
        }

        // this.isLoading = false;
        this.scrollLoading = false;
        this.charactersCharacterStats.forEach(item => {

          item.icon = this.characterStatService.getIcon(item.characterStat.characterStatType.statTypeName);

          if (item.current == 0) {

            item.current = "";
          }

          if (item.maximum == 0) {

            item.maximum = "";
          }

          if (item.value == 0) {

            item.value = "";
          }

          if (item.subValue == 0) {

            item.subValue = "";
          }

          if (item.characterStat.characterStatType.statTypeName == 'Command') {

            if (item.command != null && item.command != "")
              item.displaycommand = item.command; //this.manageCommandDisplay(item.command);

          }

          //if (item.characterStat.statName.length > 8) {


          //    item.displayStatName = item.characterStat.statName.substr(0, 8);

          //}
          //else {
          item.displayStatName = item.characterStat.statName;
          //}

          //if (item.characterStat.statName.length > 6) {

          //    item.mobiledisplayStatName = item.characterStat.statName.substr(0, 6);

          //}
          //else {
          item.mobiledisplayStatName = item.characterStat.statName;
          //}

          if (item.characterStat.characterStatType.statTypeName == 'Rich Text') {
            if (item.richText != null && item.richText != "")
              item.displayRichText = item.richText.replace(/(<([^>]+)>)/ig, "");
          }

          if (item.characterStat.characterStatType.statTypeName == 'Calculation') {

            if (item.characterStat.characterStatCalcs.length) {
              let finalCalcString = '';
              if (item.characterStat.characterStatCalcs[0].statCalculation != null && item.characterStat.characterStatCalcs[0].statCalculation != undefined) {  //&& item.characterStat.characterStatCalcs[0].statCalculation.length > 34) {
                item.displayCalculation = item.characterStat.characterStatCalcs[0].statCalculation; //.substr(0, 34) + "...";
                let IDs: any[] = [];
                let CalcString = item.characterStat.characterStatCalcs[0].statCalculationIds;

                if (item.characterStat.characterStatCalcs[0].statCalculationIds) {
                  item.characterStat.characterStatCalcs[0].statCalculationIds.split(/\[(.*?)\]/g).map((rec) => {

                    let id = ''; let flag = false; let type = 0; let statType = 0;
                    if (rec.split('_').length > 1) {
                      id = rec.split('_')[0].replace('[', '').replace(']', '');
                      type = parseInt(rec.split('_')[1])
                    }
                    else {
                      id = rec.replace('[', '').replace(']', '');
                      type = 0
                    }

                    this.charactersCharacterStats.map((q) => {
                      if (!flag) {
                        flag = (parseInt(id) == q.characterStatId);
                        statType = q.characterStat.characterStatTypeId
                      }
                    })
                    if (flag) {
                      IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
                    }
                    else if (+id == -1) {
                      IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
                    }
                  })
                }
                IDs.map((rec) => {
                  if (+rec.id == -1 && this.character.inventoryWeight) {
                    CalcString = CalcString.replace(rec.originaltext, this.character.inventoryWeight);
                  } else {
                    this.charactersCharacterStats.map((stat) => {
                      if (rec.id == stat.characterStatId) {
                        let num = 0;
                        switch (rec.statType) {
                          case 3: //Number
                            num = stat.number
                            break;
                          case 5: //Current Max
                            if (rec.type == 1)//current
                            {
                              num = stat.current
                            }
                            else if (rec.type == 2)//Max
                            {
                              num = stat.maximum
                            }
                            break;
                          case 7: //Val Sub-Val
                            if (rec.type == 3)//value
                            {
                              num = +stat.value
                            }
                            else if (rec.type == 4)//sub-value
                            {
                              num = stat.subValue
                            }
                            break;
                          case 12: //Calculation
                            num = stat.calculationResult
                            break;
                          case STAT_TYPE.Combo: //Combo
                            num = stat.defaultValue
                            break;
                          case STAT_TYPE.Choice: //Choice
                            num = stat.defaultValue
                            break;
                          case STAT_TYPE.Condition: //condition
                            let characterStatConditionsfilter = this.ConditionsValuesList.filter((CCS) => CCS.characterStat.characterStatId == rec.id);
                            let characterStatConditions = characterStatConditionsfilter["0"].characterStat.characterStatConditions;
                            let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.ConditionsValuesList);
                            num = +result;
                            break;
                          default:
                            break;
                        }
                        if (num)
                          CalcString = CalcString.replace(rec.originaltext, num);
                        //else
                        //CalcString = CalcString.replace(rec.originaltext, "1 - 1");
                      }

                    })
                  }
                  finalCalcString = CalcString;
                });
                //if()
              }
              //else {
              //    item.displayCalculation = item.characterStat.characterStatCalcs[0].statCalculation;
              //}
              //if (item.characterStat.characterStatCalcs[0].statCalculation != null && item.characterStat.characterStatCalcs[0].statCalculation != undefined && item.characterStat.characterStatCalcs[0].statCalculation.length > 8) {
              //item.displayMobileCalculation = item.characterStat.characterStatCalcs[0].statCalculation.substr(0, 8) + "...";
              //}
              // else {
              item.displayMobileCalculation = item.characterStat.characterStatCalcs[0].statCalculation;
              //}
              try {
                finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
                  ? finalCalcString.trim().slice(0, -1)
                  : finalCalcString.trim();

                //finalCalcString = finalCalcString.replace("+ 0 +", "").replace("+ 0 +", "").replace("+ 0 +", "").replace("+ 0 +", "").replace("+ 0 +", "").replace("+ 0 +", "").replace("+ 0 +", "")

                item.calculationResult = DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
              }
              catch (ex) {
                item.calculationResult = this.getCalculationResult(item.characterStat.characterStatCalcs[0].statCalculation);
              }
              if (isNaN(item.calculationResult)) {
                item.calculationResult = 0;
              }
              //item.calculationResult = this.getCalculationResult(item.characterStat.characterStatCalcs[0].statCalculation);
            }
          }

          if (item.characterStat.characterStatTypeId == STAT_TYPE.Condition) {

            let result = '';
            if (item.characterStat.characterStatConditions) {

              if (item.characterStat.characterStatConditions.length) {
                let SkipNextEntries: boolean = false;
                item.characterStat.characterStatConditions.map((Condition: CharacterStatConditionViewModel) => {
                  if (!SkipNextEntries) {
                    //let ConditionStatValue: string = this.GetValueFromStatsByStatID(Condition.ifClauseStatId, Condition.ifClauseStattype);

                    let ConditionStatValue: string = '';
                    if (Condition.ifClauseStatText) {
                      ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(this.character.inventoryWeight, this.ConditionsValuesList, Condition, false);
                    }
                    let operator = "";
                    let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(this.character.inventoryWeight, this.ConditionsValuesList, Condition, true);//Condition.compareValue;

                    let ConditionTrueResult = Condition.result;


                    if (Condition.sortOrder != item.characterStat.characterStatConditions.length) {//if and Else If Part
                      if (Condition.conditionOperator) {
                        //////////////////////////////////////////////////////////////////

                        if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUALS ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.NOT_EQUALS ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.GREATER_THAN ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_GREATER_THAN ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.LESS_THAN ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_LESS_THAN) {

                          operator = Condition.conditionOperator.symbol;
                          let ConditionCheckString = '';
                          if (Condition.isNumeric) {
                            ConditionStatValue = ConditionStatValue ? ConditionStatValue : "0";
                            ValueToCompare = ValueToCompare ? ValueToCompare : "0";
                            ConditionCheckString = ConditionStatValue + ' ' + operator + ' ' + ValueToCompare;
                          }
                          else {
                            ConditionCheckString = ' "' + ConditionStatValue + '" ' + operator + ' "' + ValueToCompare + '" ';
                          }
                          ConditionCheckString = ConditionCheckString.toUpperCase();
                          let conditionCheck = eval(ConditionCheckString);
                          if ((typeof (conditionCheck)) == "boolean") {
                            if (conditionCheck) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                        }


                        else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_BLANK) {
                          if (!ConditionStatValue) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                        else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_NOT_BLANK) {
                          if (ConditionStatValue) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                        //else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                        //    ValueToCompare = ValueToCompare ? ValueToCompare : '';
                        //    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                        //    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {

                        //        let choicesArr: any[] = ConditionStatValue.split(this.choiceArraySplitter);
                        //        choicesArr = choicesArr.map((z) => {
                        //            return z.toUpperCase();
                        //        })
                        //        if (choicesArr.indexOf(ValueToCompare.toUpperCase()) > -1) {
                        //            result = ConditionTrueResult;
                        //            SkipNextEntries = true;
                        //        }
                        //    }
                        //    else {
                        //        if (ConditionStatValue.toUpperCase() == ValueToCompare.toUpperCase()) {
                        //            result = ConditionTrueResult;
                        //            SkipNextEntries = true;
                        //        }
                        //    }
                        //}
                        //else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                        //    ValueToCompare = ValueToCompare ? ValueToCompare : '';
                        //    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                        //    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {

                        //        let choicesArr: any[] = ConditionStatValue.split(this.choiceArraySplitter);
                        //        choicesArr = choicesArr.map((z) => {
                        //            return z.toUpperCase();
                        //        })
                        //        if (choicesArr.indexOf(ValueToCompare.toUpperCase()) == -1) {
                        //            result = ConditionTrueResult;
                        //            SkipNextEntries = true;
                        //        }
                        //    }
                        //    else {
                        //        if (ConditionStatValue.toUpperCase() != ValueToCompare.toUpperCase()) {
                        //            result = ConditionTrueResult;
                        //            SkipNextEntries = true;
                        //        }
                        //    }
                        //}
                        else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                          ValueToCompare = ValueToCompare ? ValueToCompare : '';
                          ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                          if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                            if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                          else {
                            if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                        }
                        else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                          ValueToCompare = ValueToCompare ? ValueToCompare : '';
                          ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                          if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                            if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                          else {
                            if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                        }
                        //////////////////////////////////////////////////////////////////
                      }
                    }
                    else {
                      let ConditionFalseResult = Condition.result;
                      result = ConditionFalseResult;
                      SkipNextEntries = true;
                    }
                  }
                })
              }
            }
            item.text = result;
          }
        });
        if (data && data.length) {
          data.map((z) => {
            let newStat = this.charactersCharacterStats.find(d => d.charactersCharacterStatId == z.charactersCharacterStatId)

            if (newStat) {
              this.Old_charactersCharacterStats.push(Object.assign({}, newStat));
            }
          })
        }
      }, error => {
        //this.isLoading = false;
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => {



      });
  }

  manageRuleSetCharacterStats() {

    this.router.navigate(['/ruleset/character-stats', this.rulesetId]);
  }


  private editRichText(value, id, name) {
    this.bsModalRef = this.modalService.show(froalaEditorComponent, {
      class: 'modal-primary  modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.richtextValue = value;
    this.bsModalRef.content.characterStatId = id;
    this.bsModalRef.content.characterStatName = name;
    this.bsModalRef.content.event.subscribe(data => {

      this.charactersCharacterStats.forEach(function (val) {
        if (data.id === val.charactersCharacterStatId) {

          val.richText = data.richtextValue;

          if (data.richtextValue != null && data.richtextValue != "")
            val.displayRichText = data.richtextValue.replace(/(<([^>]+)>)/ig, "");
        }
      })
      this.isModelChange = true;
      this.bsModalRef.hide();
    });
  }


  addMod(id: number) {
    this.bsModalRef = this.modalService.show(NumericCharacterStatComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.event.subscribe(data => {

      this.charactersCharacterStats.forEach(function (val) {
        if (id === val.charactersCharacterStatId) {

          if (val.displaycommand != "" && val.displaycommand != null) {
            val.displaycommand = val.displaycommand + " + " + data.selectedStat;
          } else {
            val.displaycommand = data.selectedStat;
          }
        }
      })
      this.isModelChange = true;
      this.bsModalRef.hide();
    });

  }

  getFromBetween = {
    results: [],
    string: "",
    getFromBetween: function (sub1, sub2) {
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
      var SP = this.string.indexOf(sub1) + sub1.length;
      var string1 = this.string.substr(0, SP);
      var string2 = this.string.substr(SP);
      var TP = string1.length + string2.indexOf(sub2);
      return this.string.substring(SP, TP);
    },
    removeFromBetween: function (sub1, sub2) {
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
      var removal = sub1 + this.getFromBetween(sub1, sub2) + sub2;
      this.string = this.string.replace(removal, "");
    },
    getAllResults: function (sub1, sub2) {
      // first check to see if we do have both substrings
      if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

      // find one result
      var result = this.getFromBetween(sub1, sub2);
      // push it to the results array
      this.results.push(result);
      // remove the most recently found one from the string
      this.removeFromBetween(sub1, sub2);

      // if there's more substrings
      if (this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
        this.getAllResults(sub1, sub2);
      }
      else return;
    },
    get: function (string, sub1, sub2) {
      this.results = [];
      this.string = string;
      this.getAllResults(sub1, sub2);
      return this.results;
    }
  };

  public inputValidator(event: any, id: any, type: any) {


    const pattern = /^[0-9]*$/g;
    let IsNegative: boolean = false;
    if (event.target.value.length) {
      if (event.target.value.charAt(0) === '-') {
        IsNegative = true;
      }
    }
    if (!pattern.test(event.target.value)) {
      if (event.target.value !== "-") {
        if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
          event.target.value = event.target.value.replace(/[^0-9]/g, "");
          if (IsNegative) {
            event.target.value = '-' + event.target.value;
            event.target.value = event.target.value.replace(/--/g, "-");
          }
        }
      }

      this.charactersCharacterStats.forEach(function (val) {
        if (id === val.charactersCharacterStatId) {

          if (type == "value") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.value = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "subvalue") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.subValue = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "current") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.current = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "maximum") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.maximum = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }

          }
          else if (type == "number") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.number = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "combo") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.defaultValue = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "choice") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.defaultValue = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }


        }
      })
    }
  }

  openDiceModal(index, command) {
    this.bsModalRef = this.modalService.show(DiceComponent, {
      class: 'modal-primary modal-md dice-screen',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.parentCommand = command;
    this.bsModalRef.content.inputIndex = index;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.rulesetId = this.rulesetId;

    this.bsModalRef.content.closeevent.subscribe(data => {
      //command = data.command;

      this.bsModalRef.hide();
    });
  }

  isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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


    //let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (!icharNav) {
      this.charNav = {
        'items': '/character/inventory/' + character.characterId,
        'spells': '/character/spell/' + character.characterId,
        'abilities': '/character/ability/' + character.characterId
      };
    }
    else {
      if (!icharNav[character.characterId]) {
        this.charNav = {
          'items': '/character/inventory/' + character.characterId,
          'spells': '/character/spell/' + character.characterId,
          'abilities': '/character/ability/' + character.characterId
        };
      } else {
        this.charNav = icharNav[character.characterId];
      }
    }
  }
  newCharacterStat() {
    this.bsModalRef = this.modalService.show(CharacterStatsFormComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'New Character Stat';
    this.bsModalRef.content.button = 'SAVE';
    this.bsModalRef.content.ruleSetId = this.rulesetId;
    this.bsModalRef.content.characterStatTypeViewModel = { ruleSetId: this.rulesetId };
    this.bsModalRef.content.characterStatTypeList = this.characterStatTypeList;
    this.bsModalRef.content.typeOptions = this._typeOptions;
    this.bsModalRef.content.isFromCharacter = true;
  }
  comboDefValueOnchange(event: any, characterStat: any) {
    try {

      characterStat.maximum = parseInt(characterStat.maximum);
      if (isNaN(characterStat.maximum)) {
        characterStat.maximum = 0;
      }
    } catch (e) {
      characterStat.maximum = 0;
    }
    try {
      characterStat.minimum = parseInt(characterStat.minimum);
      if (isNaN(characterStat.minimum)) {
        characterStat.minimum = 0;
      }
    } catch (e) {
      characterStat.minimum = 0;
    }
    if (+characterStat.minimum == 0 && +characterStat.maximum == 0) {
      //this.IsFormValid = true;
      event.target.classList.remove('textbox-error');
    }
    else if (+characterStat.defaultValue >= +characterStat.minimum && +characterStat.defaultValue <= +characterStat.maximum) {
      //this.IsFormValid = true;
      event.target.classList.remove('textbox-error');
    }
    else {
      //this.IsFormValid = false;
      event.target.classList.add('textbox-error');
      this.alertService.showMessage("The value for this field must be between " + characterStat.minimum + " and " + characterStat.maximum + " value", "", MessageSeverity.error);
    }

  }
  DefaultDefValueOnchange(event: any, characterstat: any, DefVal_STATTYPE: DefaultValue_STAT_TYPE) {
    if (characterstat.characterStat.characterStatDefaultValues.length) {
      let DefVal = new CharacterStatDefaultValue();
      switch (DefVal_STATTYPE) {
        case DefaultValue_STAT_TYPE.Number:
          DefVal = characterstat.characterStat.characterStatDefaultValues[0];
          break;
        case DefaultValue_STAT_TYPE.Current:
          DefVal = characterstat.characterStat.characterStatDefaultValues[0];
          break;
        case DefaultValue_STAT_TYPE.Max:
          DefVal = characterstat.characterStat.characterStatDefaultValues[1];
          break;
        case DefaultValue_STAT_TYPE.Value:
          DefVal = characterstat.characterStat.characterStatDefaultValues[0];
          break;
        case DefaultValue_STAT_TYPE.SubValue:
          DefVal = characterstat.characterStat.characterStatDefaultValues[1];
          break;
        case DefaultValue_STAT_TYPE.choice:
          DefVal = characterstat.characterStat.characterStatDefaultValues[0];
          break;
        default:
      }
      let defaultTextboxValue = event.target.value;
      try {
        DefVal.maximum = DefVal.maximum;
        if (isNaN(DefVal.maximum)) {
          DefVal.maximum = 0;
        }
      } catch (e) {
        DefVal.maximum = 0;
      }
      try {
        DefVal.minimum = DefVal.minimum;
        if (isNaN(DefVal.minimum)) {
          DefVal.minimum = 0;
        }
      } catch (e) {
        DefVal.minimum = 0;
      }
      if (+DefVal.minimum == 0 && +DefVal.maximum == 0) {
        //this.IsFormValid = true;
        event.target.classList.remove('textbox-error');
      }
      else if (+defaultTextboxValue >= +DefVal.minimum && +defaultTextboxValue <= +DefVal.maximum) {
        //this.IsFormValid = true;
        event.target.classList.remove('textbox-error');
      }
      else {
        //this.IsFormValid = false;
        event.target.classList.add('textbox-error');
        this.alertService.showMessage("The value for this field must be between " + DefVal.minimum + " and " + DefVal.maximum + " value", "", MessageSeverity.error);

      }
    }
  }
  linkRecordToStat(characterstat: CharactersCharacterStat) {
    this.bsModalRef = this.modalService.show(LinkRecordComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Edit Link Tile";
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.ruleSet = this.character.ruleSet;
    this.bsModalRef.content.title = "Link Record";
    this.bsModalRef.content.characterstat = Object.assign({}, characterstat);
    this.bsModalRef.content.event.subscribe(data => {
      switch (data.type) {
        case STAT_LINK_TYPE.ITEM:
          characterstat.linkType = STAT_LINK_TYPE.ITEM;
          characterstat.defaultValue = data.item.itemId;
          this.isModelChange = true;
          break;
        case STAT_LINK_TYPE.SPELL:
          characterstat.linkType = STAT_LINK_TYPE.SPELL;
          characterstat.defaultValue = data.spell.characterSpellId;
          this.isModelChange = true;
          break;
        case STAT_LINK_TYPE.ABILITY:
          characterstat.linkType = STAT_LINK_TYPE.ABILITY;
          characterstat.defaultValue = data.ability.characterAbilityId;
          this.isModelChange = true;
          break;
        case STAT_LINK_TYPE.BUFFANDEFFECT:
          characterstat.linkType = STAT_LINK_TYPE.BUFFANDEFFECT;
          characterstat.defaultValue = data.buffAndEffect.characterBuffAndEffectId;
          this.isModelChange = true;
          break;
        case '':
          characterstat.linkType = null;
          characterstat.defaultValue = 0;
          this.isModelChange = true;
          break;
        default:
      }

    });
  }
  GetLinkRecordImage(id, linkType) {

    let imagePath = '';
    if (this.statLinkRecords) {
      if (this.statLinkRecords.length) {
        if (this.statLinkRecords.length > 0) {
          this.statLinkRecords.map((link) => {
            if (link.id == id && link.type == linkType) {
              imagePath = link.image;
            }
          })
        }
      }
    }
    if (imagePath == '') {
      switch (linkType) {
        case STAT_LINK_TYPE.ITEM:
          imagePath = '../assets/images/DefaultImages/Item.jpg';
          break;
        case STAT_LINK_TYPE.SPELL:
          imagePath = '../assets/images/DefaultImages/Spell.jpg';
          break;
        case STAT_LINK_TYPE.ABILITY:
          imagePath = '../assets/images/DefaultImages/ability.jpg';
          break;

        default:
          imagePath = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png';
          break;
      }
    }
    return imagePath;
  }
  GetLinkRecordName(id, linkType) {

    let name = '';
    if (this.statLinkRecords) {
      if (this.statLinkRecords.length) {
        if (this.statLinkRecords.length > 0) {
          this.statLinkRecords.map((link) => {
            if (link.id == id && link.type == linkType) {
              name = link.name;
            }
          })
        }
      }
    }
    return name;

  }
  GetValueFromStatsByStatID(ifClauseStatId: number, ifClauseStattype: number): string {
    let result = '';
    this.ConditionsValuesList.map((ccs: CharactersCharacterStat) => {
      if (ccs.characterStatId == ifClauseStatId) {
        switch (ccs.characterStat.characterStatTypeId) {
          case STAT_TYPE.Text:
            result = ccs.text;
            break;
          case STAT_TYPE.Number:
            result = ccs.number.toString();
            break;
          case STAT_TYPE.CurrentMax:
            if (ifClauseStattype == 2) {
              result = ccs.maximum.toString();
            }
            else {
              result = ccs.current.toString();
            }
            break;
          case STAT_TYPE.Choice:

            if (ccs.characterStat.isMultiSelect) {
              result = this.GetChoiceValue(ccs.multiChoice, ccs.characterStat.characterStatChoices)//ccs.multiChoice.replace(/;/g, this.choiceArraySplitter);
            }
            else {
              result = this.GetChoiceValue(ccs.choice, ccs.characterStat.characterStatChoices);
            }
            break;
          case STAT_TYPE.ValueSubValue:
            if (ifClauseStattype == 2) {
              result = ccs.subValue.toString();
            }
            else {
              result = ccs.value.toString();
            }
            break;
          case STAT_TYPE.Combo:
            if (ifClauseStattype == 2) {
              result = ccs.comboText;
            }
            else {
              result = ccs.defaultValue.toString();
            }
            break;
          case STAT_TYPE.Choice: //Choice
            result = ccs.defaultValue.toString();
            break;
          case STAT_TYPE.Calculation:
            result = ccs.calculationResult.toString();
            break;

          default:
        }
      }
    })
    return result ? result : '';
  }
  GetChoiceValue(ids, choicesList) {

    let result = '';
    if (choicesList && ids) {
      let idList = ids.split(';');
      if (choicesList.length) {
        idList.map((id) => {
          choicesList.map((choice) => {
            if (id == choice.characterStatChoiceId) {
              result += (choice.statChoiceValue + ",");
            }
          })
        })

      }
    }
    result = result ? result.substring(0, result.length - 1) : '';
    return result;
  }

  refresh() {
    this.page = 1;
    this.pageSize = 30;
    this.initialize();
  }
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId(characterId)
      .subscribe(data => {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (data.isPlayerCharacter) {
            this.isPlayerCharacter = data.isPlayerCharacter;
            this.isPlayerLinkedToCurrentCampaign = data.isPlayerLinkedToCurrentCampaign;
          }
          if (user == null) {
            this.authService.logout();
          }
          else {
            if (user.isGm) {
              this.pageRefresh = user.isGm;
            }
            else if (data.isPlayerCharacter) {
              this.pageRefresh = data.isPlayerCharacter;
              //this.isPlayerCharacter = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {

              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}

              //this.pauseBuffAndEffectAdd = data.pauseBuffAndEffectAdd;
              //this.pauseBuffAndEffectCreate = data.pauseBuffAndEffectCreate;

              if (!data.isPlayerLinkedToCurrentCampaign) {
                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }

                this.pauseBuffAndEffectAdd = data.pauseBuffAndEffectAdd;
                this.pauseBuffAndEffectCreate = data.pauseBuffAndEffectCreate;
              }

            }
            //if (data.isPlayerCharacter || data.isCurrentCampaignPlayerCharacter) {
            //  this.showBuffEffects = true;
            //}
            if (data.isDeletedInvite) {
              this.router.navigate(['/characters']);
              this.alertService.showStickyMessage('', "Your " + data.name + " character has been deleted by the GM", MessageSeverity.error);
              setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
            }
          }
        }
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }
  SelectBuffAndEffects() {
    this.bsModalRef = this.modalService.show(AddBuffAndEffectComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });

    this.bsModalRef.content.rulesetID = this.rulesetId;
    this.bsModalRef.content.characterID = this.characterId;
    this.bsModalRef.content.selectedBuffAndEffectsList = this.selectedBuffAndEffectsList;
    this.bsModalRef.content.pauseBuffAndEffectCreate = this.pauseBuffAndEffectCreate;
    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.selectedBuffAndEffectsList = data;
      }
    });
  }
  selectedBuffAndEffectsListChanged(item) {

    let characters: Characters[] = [];
    characters.push(this.character)
    let nonSelectedBuffAndEffectsList: BuffAndEffect[] = [];
    nonSelectedBuffAndEffectsList = this.BuffAndEffectsList.map(x => {
      if (this.selectedBuffAndEffectsList.filter(SC => SC.buffAndEffectId == x.buffAndEffectId).length) {

      }
      else {
        return x;
      }

    })
    nonSelectedBuffAndEffectsList = nonSelectedBuffAndEffectsList.filter(SC => SC)
    this.buffAndEffectService.assignBuffAndEffectToCharacter<any>(this.selectedBuffAndEffectsList, characters, [], nonSelectedBuffAndEffectsList, this.characterId)
      .subscribe(data => {


      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });
  }

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
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
}
