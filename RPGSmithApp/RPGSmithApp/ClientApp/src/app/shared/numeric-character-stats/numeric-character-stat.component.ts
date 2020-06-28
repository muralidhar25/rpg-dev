import { Component, OnInit, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService } from "../../core/common/alert.service";
import { AuthService } from "../../core/auth/auth.service";
import { SharedService } from "../../core/services/shared.service";
import { CommonService } from "../../core/services/shared/common.service";
import { CharacterStatService } from "../../core/services/character-stat.service";
import { CharactersCharacterStatService } from "../../core/services/characters-character-stat.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { DBkeys } from "../../core/common/db-keys";
import { User } from "../../core/models/user.model";
import { Utilities } from "../../core/common/utilities";
import { PlatformLocation } from "@angular/common";
import { ServiceUtil } from "../../core/services/service-util";
import { Characters } from "../../core/models/view-models/characters.model";
import { CharactersService } from "../../core/services/characters.service";
import { STAT_TYPE, CONDITION_OPERATOR_ENUM } from "../../core/models/enums";
import { DiceService } from "../../core/services/dice.service";
import { CharacterStatConditionViewModel } from "../../core/models/view-models/character-stats.model";
import { setTimeout } from "timers";

@Component({
  selector: 'app-numeric-character-stat',
  templateUrl: './numeric-character-stat.component.html',
  styleUrls: ['./numeric-character-stat.component.scss']
})

export class NumericCharacterStatComponent implements OnInit {

  characterId: number;
  numericCharacterStats: any[] = [];
  page: number = 1;
  pageSize: number = 6;
  isFirst: boolean = true;
  isLoading = false;
  rulesetId: number;
  scrollLoading: boolean = false;
  characterCharStats:any=null
  character: Characters = new Characters();
  charactersCharacterStats: any;

  constructor(
    private charactersService: CharactersService,
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private bsModalRef: BsModalRef, private modalService: BsModalService, private localStorage: LocalStoreManager, private charactersCharacterStatService: CharactersCharacterStatService,
    private sharedService: SharedService, private commonService: CommonService, private characterStatService: CharacterStatService

    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.initialize();
  }

  ngOnInit() {
    
    this.initialize();
    
    setTimeout(() => {
      this.character = this.bsModalRef.content.character ? this.bsModalRef.content.character : new Characters();
      this.characterCharStats = this.bsModalRef.content.characterCharStats ? this.bsModalRef.content.characterCharStats : null;
      //console.log(this.character);
    
    }, 0);
    if (this.rulesetId == undefined)
      this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    //console.log(this.rulesetId);
  }

  
  private initialize() {
    let num: string = '0';
    //if (this.characterId) {
    //this.getCharactersCharacterStat();

    setTimeout(async () => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user == null)
        this.authService.logout();
      else {
        if (this.characterId) {
          this.isLoading = true;
          await this.getCharactersCharacterStat();//.then(result => console.log(result));
        }
        else {
          this.charactersCharacterStatService.getNumericCharactersCharacterStatRuleset<any[]>(this.rulesetId, this.page, this.pageSize)
            .subscribe(data => {
              this.numericCharacterStats = [];
              data.forEach((val) => {
                val.inventoryWeight = 0;
                val.icon = this.characterStatService.getIcon(val.characterStatType.statTypeName);
                this.numericCharacterStats.push(val);
              });
              this.getInventoryWeight();
            }, error => {
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              this.isLoading = false;
            }, () => {

            });
        }
        
      }

    }, 0);
  }

  private async getNumericCharactersCharacterStat() {
    let num: string = '0';
    this.charactersCharacterStatService.getNumericCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)
      .subscribe(data => {

        this.numericCharacterStats = [];
        data.forEach((val) => {
          val.inventoryWeight = 0;
          val.icon = this.characterStatService.getIcon(val.characterStat.characterStatType.statTypeName);

          if (val.characterStat.characterStatType.statTypeName == 'Condition') {
            let characterStatConditions = val.characterStat.characterStatConditions;
            val.characterStat.characterStatConditions.sort((a, b) => {

              return a.sortOrder - b.sortOrder
            })

            if (this.characterCharStats) {

              let result = ServiceUtil.conditionStat(val, this.character, this.characterCharStats);

              //changes
              if (isNaN(+result)) {
                num = result;
              } else {
                num = result;
              }
              val.defaultValue = num;
            }

          }

          if (val.characterStat && val.characterStat.characterStatTypeId == STAT_TYPE.Calculation) {
            val.calculationResultOld = ServiceUtil.GetDescriptionWithStatValues('[' + val.characterStat.statName + ']', this.localStorage);
            val.calculationResult = ServiceUtil.GetForCalsWithStatValues('[' + val.characterStat.statName + ']', this.charactersCharacterStats);
          }

          this.numericCharacterStats.push(val);
        });

        let InventoryWeight = this.numericCharacterStats.filter(val => val.charactersCharacterStatId === -1);
        if (InventoryWeight.length == 0)
          this.getInventoryWeight();
        else this.isLoading = false;

      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => {

      });
  }

  private async getCharactersCharacterStat() {
    try {
      this.charactersCharacterStatService.getConditionsValuesList<any[]>(this.characterId)
        .subscribe(async dataConditionsValuesList => {

          await this.charactersCharacterStatService.getCharactersCharacterStat<any[]>(this.characterId, 1, 999)
            .subscribe(async data => {
              this.charactersCharacterStats = data;// Utilities.responseData(data, 999);

              this.charactersCharacterStats.forEach(item => {

                item.icon = this.characterStatService.getIcon(item.characterStat.characterStatType.statTypeName);
                item.displayStatName = item.characterStat.statName;
                item.mobiledisplayStatName = item.characterStat.statName;

                if (item.characterStat.characterStatTypeId == STAT_TYPE.Calculation) {

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

                        if (+rec.id == -1 && item.character.inventoryWeight) {
                          CalcString = CalcString.replace(rec.originaltext, item.character.inventoryWeight);
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
                                  let characterStatConditionsfilter = dataConditionsValuesList.filter((CCS) => CCS.characterStat.characterStatId == rec.id);
                                  let characterStatConditions = characterStatConditionsfilter["0"].characterStat.characterStatConditions;
                                  let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, dataConditionsValuesList);
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
                //else if (item.characterStat.characterStatTypeId == STAT_TYPE.Condition) {
                //  try {
                //    let result = '';
                //    if (item.characterStat.characterStatConditions) {

                //      if (item.characterStat.characterStatConditions.length) {
                //        let SkipNextEntries: boolean = false;
                //        item.characterStat.characterStatConditions.map((Condition: CharacterStatConditionViewModel) => {
                //          if (!SkipNextEntries) {
                //            //let ConditionStatValue: string = this.GetValueFromStatsByStatID(Condition.ifClauseStatId, Condition.ifClauseStattype);

                //            let ConditionStatValue: string = '';
                //            if (Condition.ifClauseStatText) {
                //              ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(item.character.inventoryWeight, dataConditionsValuesList, Condition, false);
                //            }
                //            let operator = "";
                //            let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(item.character.inventoryWeight, dataConditionsValuesList, Condition, true);//Condition.compareValue;

                //            let ConditionTrueResult = Condition.result;

                //            if (Condition.sortOrder != item.characterStat.characterStatConditions.length) {//if and Else If Part
                //              if (Condition.conditionOperator) {

                //                if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUALS ||
                //                  Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.NOT_EQUALS ||
                //                  Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.GREATER_THAN ||
                //                  Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_GREATER_THAN ||
                //                  Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.LESS_THAN ||
                //                  Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_LESS_THAN) {

                //                  operator = Condition.conditionOperator.symbol;
                //                  let ConditionCheckString = '';
                //                  if (Condition.isNumeric) {
                //                    ConditionStatValue = ConditionStatValue ? ConditionStatValue : "0";
                //                    ValueToCompare = ValueToCompare ? ValueToCompare : "0";
                //                    ConditionCheckString = ConditionStatValue + ' ' + operator + ' ' + ValueToCompare;
                //                  }
                //                  else {
                //                    ConditionCheckString = ' "' + ConditionStatValue + '" ' + operator + ' "' + ValueToCompare + '" ';
                //                  }
                //                  ConditionCheckString = ConditionCheckString.toUpperCase();
                //                  let conditionCheck = eval(ConditionCheckString);
                //                  if ((typeof (conditionCheck)) == "boolean") {
                //                    if (conditionCheck) {
                //                      result = ConditionTrueResult;
                //                      SkipNextEntries = true;
                //                    }
                //                  }
                //                }
                //                else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_BLANK) {
                //                  if (!ConditionStatValue) {
                //                    result = ConditionTrueResult;
                //                    SkipNextEntries = true;
                //                  }
                //                }
                //                else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_NOT_BLANK) {
                //                  if (ConditionStatValue) {
                //                    result = ConditionTrueResult;
                //                    SkipNextEntries = true;
                //                  }
                //                }
                //                else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                //                  ValueToCompare = ValueToCompare ? ValueToCompare : '';
                //                  ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                //                  if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {
                //                    if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                //                      result = ConditionTrueResult;
                //                      SkipNextEntries = true;
                //                    }
                //                  }
                //                  else {
                //                    if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                //                      result = ConditionTrueResult;
                //                      SkipNextEntries = true;
                //                    }
                //                  }
                //                }
                //                else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                //                  ValueToCompare = ValueToCompare ? ValueToCompare : '';
                //                  ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                //                  if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {
                //                    if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                //                      result = ConditionTrueResult;
                //                      SkipNextEntries = true;
                //                    }
                //                  }
                //                  else {
                //                    if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                //                      result = ConditionTrueResult;
                //                      SkipNextEntries = true;
                //                    }
                //                  }
                //                }
                //              }
                //            }
                //            else {
                //              let ConditionFalseResult = Condition.result;
                //              result = ConditionFalseResult;
                //              SkipNextEntries = true;
                //            }
                //          }
                //        })
                //      }
                //    }
                //    //item.text = result;
                //    item.conditionNew = result;
                //  } catch (err) { }
                //}

              });

              //get all numeric Characters Character Stat
              this.getNumericCharactersCharacterStat();
            }, error => { }, () => { });

        }, error => { }, () => { });
    } catch (err) { }
    return this.charactersCharacterStats;
  }

  private getCalculationResult(value: string): number {
    try {
      if (value) {
        return this.charactersCharacterStats.map(x => {
          return { id: x.characterStatId, type: x.characterStatTypeViewModel.statTypeName, name: x.statName };
        }).filter(y => y.type == 'Number' || y.type.startsWith('Value') || y.type.startsWith('Current'));
      }
      else return 0;
    } catch (err) { return 0; }
  }

  private getInventoryWeight() {
    this.isLoading = true;
    this.charactersCharacterStatService.getCharactersById<any>(this.characterId)
      .subscribe(data => {
        let inventoryWeight = {
          'calculationResult': 0,
          'character': null,
          'characterId': data.characterId,
          'characterStat': {
            'characterStatTypeId': -1,
            'characterStatType': {
              'characterStatTypeId': -1,
              'characterStats': null,
              'isNumeric': false,
              'statTypeDesc': "",
              'statTypeName': "InventoryWeight"
            },
            'createdBy': data.createdBy,
            'ruleSetId': data.ruleSet ? data.ruleSet.ruleSetId : 0,
            'statDesc': "",
            'statName': "Inventory Weight"
          },
          'characterStatId': -1,
          'characterStatTiles': null,
          'charactersCharacterStatId': -1,
          'choice': null,
          'command': null,
          'current': 0,
          'icon': "icon-calculation",
          'isDeleted': false,
          'maximum': 0,
          'multiChoice': null,
          'number': 0,
          'onOff': false,
          'richText': null,
          'subValue': 0,
          'text': null,
          'value': 0,
          'yesNo': false,
          'inventoryWeight': data.inventoryWeight
        };
        this.numericCharacterStats = this.numericCharacterStats.filter(val => val.charactersCharacterStatId !== -1);
        //this.numericCharacterStats.push(inventoryWeight);
        this.numericCharacterStats.forEach((val) => {
          val.inventoryWeight = data.inventoryWeight;
        });
        this.isLoading = false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        this.isLoading = false;
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
  }

  onScroll() {
    this.scrollLoading = true;
    ++this.page;
    if (this.characterId) {
      this.charactersCharacterStatService.getNumericCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)
        .subscribe(data => {
          //let num=0;
          let num: string = '0';
          data.forEach((val) => {
            val.icon = this.characterStatService.getIcon(val.characterStat.characterStatType.statTypeName);
            if (val.characterStat.characterStatType.statTypeName == 'Condition') {
              let characterStatConditions = val.characterStat.characterStatConditions;
              val.characterStat.characterStatConditions.sort((a, b) => {
                return a.sortOrder - b.sortOrder
              })

              if (this.characterCharStats) {
                
                let result = ServiceUtil.conditionStat(val, this.character, this.characterCharStats);
                if (isNaN(+result)) {
                 // num = 0 ;
                  num = result;
                } else {
                  num = result;
                }
               
                val.defaultValue = num;
              }

            }
            if (val.characterStat && val.characterStat.characterStatTypeId == STAT_TYPE.Calculation) {
              val.calculationResultOld = ServiceUtil.GetDescriptionWithStatValues('[' + val.characterStat.statName + ']', this.localStorage)
              val.calculationResult = ServiceUtil.GetForCalsWithStatValues('[' + val.characterStat.statName + ']', this.charactersCharacterStats);
            }
            
          });

          for (var i = 0; i < data.length; i++) {
            this.numericCharacterStats.push(data[i]);
          }
          this.scrollLoading = false;
        }, error => {
          this.scrollLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {

        });
    } else {
      this.charactersCharacterStatService.getNumericCharactersCharacterStatRuleset<any[]>(this.rulesetId, this.page, this.pageSize)
        .subscribe(data => {

          data.forEach((val) => {
            val.icon = this.characterStatService.getIcon(val.characterStatType.statTypeName);
          });

          for (var i = 0; i < data.length; i++) {
            this.numericCharacterStats.push(data[i]);
          }
          this.scrollLoading = false;
        }, error => {
          this.scrollLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {

        });
    }
  }


  close() {
    this.bsModalRef.hide();
    return false;
  }


  public event: EventEmitter<any> = new EventEmitter();

  selectCharacterStat(chartype: any, name: any, type: any, characterStat: any) {

    let statName: any;
    let value: any;

    if (chartype == "Current & Max" && type == 1) {
      statName = "[" + name + "(c)]";
      value = characterStat.current ? characterStat.current : 0;
    }
    else if (chartype == "Current & Max" && type == 2) {
      statName = "[" + name + "(m)]";
      value = characterStat.maximum ? characterStat.maximum : 0;
    }
    else if (chartype == "Value & Sub-Value" && type == 1) {
      statName = "[" + name + "(v)]";
      value = characterStat.value ? characterStat.value : 0;
    }
    else if (chartype == "Value & Sub-Value" && type == 2) {
      statName = "[" + name + "(s)]";
      value = characterStat.subValue ? characterStat.subValue : 0;
    }
    else if (chartype == "InventoryWeight" && type == 1) {
      statName = "[" + chartype + "]";
      value = characterStat.inventoryWeight ? characterStat.inventoryWeight : 0;
    }
    else if (chartype == "Number") {
      statName = "[" + name + "]";
      value = characterStat.number ? characterStat.number : 0;
    }
    else if (chartype == "Calculation") {
      statName = "[" + name + "]";
      value = characterStat.calculationResult ? characterStat.calculationResult : 0;
    }
    else if (chartype == "Combo") {
      statName = "[" + name + "]";
      value = characterStat.defaultValue ? characterStat.defaultValue : 0;
    }
    else if (chartype == "Command") {
      statName = "[" + name + "]";
      value = characterStat.command;
    }
    else {
      statName = "[" + name + "]";
      value = 0;
    }

    this.bsModalRef.hide();
    this.event.emit({
      selectedType: chartype,
      selectedStat: statName,
      selectedStatValue: value,
      charactersCharacterStatId: characterStat.charactersCharacterStatId
    });
  }

}
