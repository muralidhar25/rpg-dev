// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable } from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';
import { CharacterStatConditionViewModel } from '../models/view-models/character-stats.model';
import { STAT_TYPE, CONDITION_OPERATOR_ENUM, STAT_LINK_TYPE } from '../models/enums';
import { DiceService } from './dice.service';
import { CharactersCharacterStat } from '../models/view-models/characters-character-stats.model';
import { HeaderValues } from '../models/headers.model';
import { DBkeys } from '../common/db-keys';
import { LocalStoreManager } from '../common/local-store-manager.service';
import { Observable } from 'rxjs';
import { CharactersCharacterStatService } from './characters-character-stat.service';
import { Characters } from '../models/view-models/characters.model';
import { randomization } from '../models/view-models/randomization.model ';
import { AlertService, DialogType } from '../common/alert.service';
import { CharacterStatService } from './character-stat.service';

let characterStatService: CharacterStatService;

@Injectable()
export class ServiceUtil {

  //constructor(public characterStatService: CharacterStatService) {

  //}

  ConditionsValuesList: CharactersCharacterStat[] = [];

  //inventoryWeight=this.character.inventoryWeight
  //CharacterStatsValues=this.charactersCharacterStats
  public static GetClaculatedValuesOfConditionStats(inventoryWeight: any, CharacterStatsValues: any, Condition: CharacterStatConditionViewModel, IsCompareValue: boolean): string {
    let CalcStringForValue = IsCompareValue ? Condition.compareValue : Condition.ifClauseStatText;
    if (CalcStringForValue === '' || CalcStringForValue === null || CalcStringForValue === undefined) {
      CalcStringForValue = '';
      return CalcStringForValue;
    }
    else if (!isNaN(+CalcStringForValue)) {     //|| !Condition.isNumeric
      return CalcStringForValue;
    }
    let CalcStringForValue_Result: number = 0;
    //////////////////////////////////////////////
    let calculationString: string = CalcStringForValue.toUpperCase();
    let inventoreyWeight = inventoryWeight ? inventoryWeight : 0;
    let finalCalcString: string = '';

    calculationString.split("[INVENTORYWEIGHT]").map((item) => {
      calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
      finalCalcString = calculationString;
    })
    let IDs: any[] = [];

    let NumericStatType = { CURRENT: 1, MAX: 2, VALUE: 3, SUBVALUE: 4, NUMBER: 5, COMBOTEXT: 6 };
    let DoCalculate = false;
    if (calculationString) {
      calculationString.split(/\[(.*?)\]/g).map((rec) => {

        let id = ''; let flag = false; let type = 0; let statType = 0;



        //let id = ''; let flag = false; let type = 0; let statType = 0;
        let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false; let isNum = false; let isComboText = false;

        if (rec.toUpperCase().split('(VALUE)').length > 1) { isValue = true; }
        if (rec.toUpperCase().split('(SUBVALUE)').length > 1) { isSubValue = true; }
        if (rec.toUpperCase().split('(CURRENT)').length > 1) { isCurrent = true; }
        if (rec.toUpperCase().split('(MAX)').length > 1) { isMax = true; }
        if (rec.toUpperCase().split('(Number)').length > 1) { isNum = true; }
        if (rec.toUpperCase().split('(Text)').length > 1) { isNum = true; }

        if (isValue || isSubValue || isCurrent || isMax || isNum || isComboText) {
          if (isValue) {
            id = rec.toUpperCase().split('(VALUE)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.VALUE;
          }
          else if (isSubValue) {
            id = rec.toUpperCase().split('(SUBVALUE)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.SUBVALUE;
          }
          else if (isCurrent) {
            id = rec.toUpperCase().split('(CURRENT)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.CURRENT;
          }
          else if (isMax) {
            id = rec.toUpperCase().split('(MAX)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.MAX;
          }
          else if (isNum) {
            id = rec.toUpperCase().split('(Number)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.NUMBER;
          }
          else if (isComboText) {
            id = rec.toUpperCase().split('(Text)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.COMBOTEXT;
          }

        }
        else {
          id = rec.replace('[', '').replace(']', '');
          type = 0
        }
        CharacterStatsValues.map((q) => {
          if (!flag) {
            flag = (id.toUpperCase() == q.characterStat.statName.toUpperCase());
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
      IDs.map((rec) => {
        CharacterStatsValues.map((stat) => {
          if (rec.id.toUpperCase() == stat.characterStat.statName.toUpperCase()) {
            DoCalculate = true;
            let num = 0;
            let choices = '';
            let Ischoices = false;
            switch (rec.statType) {
              case STAT_TYPE.Number: //Number
                num = stat.number
                break;
              case STAT_TYPE.CurrentMax: //Current Max
                if (rec.type == 0)//current
                {
                  num = +stat.current
                }
                else if (rec.type == NumericStatType.CURRENT)//current
                {
                  num = +stat.current
                }
                else if (rec.type == NumericStatType.MAX)//Max
                {
                  num = +stat.maximum
                }
                break;
              case STAT_TYPE.ValueSubValue: //Val Sub-Val
                if (rec.type == 0)//value
                {
                  num = +stat.value
                }
                else if (rec.type == NumericStatType.VALUE)//value
                {
                  num = +stat.value
                }
                else if (rec.type == NumericStatType.SUBVALUE)//sub-value
                {
                  num = +stat.subValue
                }
                break;
              case STAT_TYPE.Calculation: //Calculation

                num = +stat.calculationResult
                num = this.CalculateResultOfCalculation(stat, CharacterStatsValues, inventoreyWeight);
                break;
              case STAT_TYPE.Combo: //Combo


                if (rec.type == 0) {
                  num = +stat.defaultValue
                }
                else if (rec.type == NumericStatType.NUMBER) {
                  num = +stat.defaultValue
                }
                else if (rec.type == NumericStatType.COMBOTEXT) {
                  DoCalculate = false;
                  Ischoices = true;
                  choices = stat.comboText
                }
                break;
              case STAT_TYPE.Text:
                DoCalculate = false;
                Ischoices = true;
                choices = stat.text;
                break;
              case STAT_TYPE.Choice:
                DoCalculate = false
                Ischoices = true;

                if (stat.characterStat.isMultiSelect) {
                  num = -1;
                  if (stat.multiChoice) {
                    if (CharacterStatsValues.filter(x => x.charactersCharacterStatId == stat.charactersCharacterStatId).length) {
                      choices = this.GetChoiceValue(stat.multiChoice, CharacterStatsValues.filter(x => x.charactersCharacterStatId == stat.charactersCharacterStatId)[0].characterStat.characterStatChoices) //stat.characterStat.characterStatChoices)      
                    }

                  }
                }
                else {
                  num = -1
                  if (stat.choice) {
                    if (CharacterStatsValues.filter(x => x.charactersCharacterStatId == stat.charactersCharacterStatId).length) {
                      choices = this.GetChoiceValue(stat.choice, CharacterStatsValues.filter(x => x.charactersCharacterStatId == stat.charactersCharacterStatId)[0].characterStat.characterStatChoices);
                    }

                  }
                }

                break;
              default:
                break;
            }
            if (Ischoices) {
              calculationString = calculationString.replace(rec.originaltext, choices.toString());
            }
            else if (num)
              calculationString = calculationString.replace(rec.originaltext, num.toString());
            else
              calculationString = calculationString.replace(rec.originaltext, '0');
            //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
          }

        });

        finalCalcString = calculationString;
      });
    }
    ////////////////////////////////                    
    finalCalcString = finalCalcString.replace(/  +/g, ' ');
    finalCalcString = finalCalcString.replace(/RU/g, ' RU').replace(/RD/g, ' RD').replace(/KL/g, ' KL').replace(/KH/g, ' KH').replace(/DL/g, ' DL').replace(/DH/g, ' DH');
    finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '');
    finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '');
    try {
      finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
        ? finalCalcString.trim().slice(0, -1)
        : finalCalcString.trim();
      if (DoCalculate) {
        CalcStringForValue_Result = +finalCalcString == 0 ? 0 : DiceService.commandInterpretationForConditionStatValueCalculations(finalCalcString, undefined, undefined)[0].calculationResult;
      }
      else {
        return finalCalcString;
      }

    }
    catch (ex) {
      CalcStringForValue_Result = 0;
    }
    if (isNaN(CalcStringForValue_Result)) {
      CalcStringForValue_Result = 0;
    }
    return CalcStringForValue_Result.toString();
  }

  public static CalculateResultOfCalculation(characterCharacterStat: CharactersCharacterStat, characterCharacterStatList: any, inventoreyWeight: number): number {
    if (characterCharacterStat.characterStat.characterStatCalcs) {
      //For Old Records
      //////////////////////////////////////////////
      let calculationString: string = characterCharacterStat.characterStat.characterStatCalcs[0].statCalculation.toUpperCase();
      //let inventoreyWeight = inventoryWeight;
      let finalCalcString: string = '';

      calculationString.split("[INVENTORYWEIGHT]").map((item) => {
        calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
      })
      let IDs: any[] = [];
      finalCalcString = calculationString;
      if (calculationString) {
        calculationString.split(/\[(.*?)\]/g).map((rec) => {

          let id = ''; let flag = false; let type = 0; let statType = 0;
          if (rec.split('_').length > 1) {
            id = rec.split('_')[0].replace('[', '').replace(']', '');
            type = parseInt(rec.split('_')[1])
          }
          else {
            id = rec.replace('[', '').replace(']', '');
            type = 0
          }
          characterCharacterStatList.map((q) => {
            if (!flag) {
              flag = (id == q.characterStat.statName.toUpperCase());
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
        IDs.map((rec) => {
          characterCharacterStatList.map((stat) => {
            if (rec.id == stat.characterStat.statName.toUpperCase()) {
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
                case STAT_TYPE.Choice:

                  num = stat.defaultValue
                  break;
                default:
                  break;
              }
              if (num)
                calculationString = calculationString.replace(rec.originaltext, num.toString());
              else
                calculationString = calculationString.replace(rec.originaltext, '0');
              //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
            }

          });

          finalCalcString = calculationString;
        });
      }
      ////////////////////////////////                    
      finalCalcString = finalCalcString.replace(/  +/g, ' ');
      finalCalcString = finalCalcString.replace(/RU/g, ' RU').replace(/RD/g, ' RD').replace(/KL/g, ' KL').replace(/KH/g, ' KH').replace(/DL/g, ' DL').replace(/DH/g, ' DH');
      finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');
      finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '').replace(/\* 0/g, '').replace(/\/ 0/g, '');
      try {
        finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
          finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
          finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
          finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
          ? finalCalcString.trim().slice(0, -1)
          : finalCalcString.trim();
        characterCharacterStat.calculationResult = +finalCalcString == 0 ? 0 : DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
      }
      catch (ex) {
        characterCharacterStat.calculationResult = 0;
        //Curnt_Stat.calculationResult = this.getCalculationResult(Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation);
      }
      if (isNaN(characterCharacterStat.calculationResult)) {
        characterCharacterStat.calculationResult = 0;
      }
      return characterCharacterStat.calculationResult;
    }
  }
  public static GetChoiceValue(ids, choicesList) {

    let result = '';
    if (choicesList && ids) {
      let idList = ids.split(';');
      if (choicesList.length) {
        idList.map((id) => {
          choicesList.map((choice) => {
            if (id == choice.characterStatChoiceId) {
              result += (choice.statChoiceValue + ", ");
            }
          })
        })

      }
    }
    result = result ? result.substring(0, result.length - 2) : '';
    return result;
  }

  public static conditionStat(item, _character, charactersCharacterStats) {
    //let _character: any = this.character;

    let result = '';
    if (item.characterStat.characterStatConditions) {
      if (item.characterStat.characterStatConditions.length) {

        let SkipNextEntries: boolean = false;
        item.characterStat.characterStatConditions.sort((a, b) => {

          return a.sortOrder - b.sortOrder
        })
        item.characterStat.characterStatConditions.map((Condition: CharacterStatConditionViewModel) => {

          if (!SkipNextEntries) {
            //let ConditionStatValue: string = this.GetValueFromStatsByStatID(Condition.ifClauseStatId, Condition.ifClauseStattype);

            let ConditionStatValue: string = '';
            if (Condition.ifClauseStatText) {

              ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(_character.inventoryWeight, charactersCharacterStats, Condition, false);
            }
            let operator = "";
            let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(_character.inventoryWeight, charactersCharacterStats, Condition, true);//Condition.compareValue;

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
                  let conditionCheck;
                  try {
                    conditionCheck = eval(ConditionCheckString);
                  } catch (ex) {
                    conditionCheck = false;
                  }
                  //let conditionCheck = eval(ConditionCheckString);
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

    return result;

  }
  public static GetSpecialCharacterCodeForChar(char: string): string {
    if (char) {

      if (
        (char.charCodeAt(0) >= 33
          && char.charCodeAt(0) <= 47)
        ||
        (char.charCodeAt(0) >= 58
          && char.charCodeAt(0) <= 64)
        ||
        (char.charCodeAt(0) >= 91
          && char.charCodeAt(0) <= 96)
        ||
        (char.charCodeAt(0) >= 123
          && char.charCodeAt(0) <= 126)
      ) {
        return "CHARCODESTART" + char.charCodeAt(0) + "CHARCODEEND";
      }

    }
    return char;
  }

  public static GetCharacterFromSpecialCharacterCode(Code: string): string {
    if (Code) {

      for (var i = 33; i <= 126; i++) {

        if (
          (i >= 33
            && i <= 47)
          ||
          (i >= 58
            && i <= 64)
          ||
          (i >= 91
            && i <= 96)
          ||
          (i >= 123
            && i <= 126)
        ) {
          let string = "CHARCODESTART" + i + "CHARCODEEND";
          let expression = new RegExp(string.toUpperCase(), 'g');
          Code = Code.replace(expression, String.fromCharCode(i))
        }
      }

    }
    return Code;
  }

  public static GetCalcuationsResults(calculationString: string, statdetails, charactersCharacterStats, character) {
    let IDs: any[] = [];
    calculationString = calculationString.toUpperCase();
    let finalCalcString = calculationString;
    if (calculationString) {
      calculationString = DiceService.hideTextCommandSquareBraces(calculationString);
      calculationString.split(/\[(.*?)\]/g).map((rec) => {

        let id = ''; let flag = false; let type = 0; let statType = 0;
        let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

        if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
        if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
        if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
        if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

        if (isValue || isSubValue || isCurrent || isMax) {
          if (isValue) {
            id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
            type = 3
          }
          else if (isSubValue) {
            id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
            type = 4
          }
          else if (isCurrent) {
            id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
            type = 1
          }
          else if (isMax) {
            id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
            type = 2
          }

        }
        else {
          id = rec.replace('[', '').replace(']', '');
          type = 0
        }
        statdetails.charactersCharacterStat.map((q) => {
          if (!flag) {
            flag = (id == q.characterStat.statName.toUpperCase());
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


      calculationString = DiceService.showTextCommandSquareBraces(calculationString);

      IDs.map((rec) => {
        statdetails.charactersCharacterStat.map((stat) => {
          if (rec.id == stat.characterStat.statName.toUpperCase()) {
            let num: string = '0';
            //let conditionResult = "";
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
                  num = stat.value
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
              case STAT_TYPE.Choice: //Combo
                num = stat.defaultValue
                break;
              case STAT_TYPE.Condition:
                let characterStatConditionsfilter = charactersCharacterStats.filter((stat) => stat.characterStat.statName.toUpperCase() == rec.id);
                let characterStatConditions = characterStatConditionsfilter["0"].characterStat.characterStatConditions;
                let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], character, charactersCharacterStats);

                //let result = this.conditionStat(characterStatConditions);

                //if (isNaN(+result)) {
                //  num = 0;
                //} else {
                //  num = +result;
                //}
                num = result;
                break;
              default:
                break;
            }
            //calculationString = calculationString.replace(rec.originaltext, conditionResult);

            if (num) {

              calculationString = calculationString.replace(rec.originaltext, num.toString());
            }

            else {
              calculationString = calculationString.replace(rec.originaltext, '0');
            }

            //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
          }

        });

        finalCalcString = calculationString;
      });
    }
    ////////////////////////////////                    
    finalCalcString = finalCalcString.replace(/  +/g, ' ');
    finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');
    finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '').replace(/\* 0/g, '').replace(/\/ 0/g, '');
    return finalCalcString;
  }
  public static IsCurrentlyRulesetOpen(localStorage: LocalStoreManager): boolean {
    let IsCharacter: boolean = false;
    let IsRuleset: boolean = false;
    let headers = localStorage.getDataObject<HeaderValues>(DBkeys.HEADER_VALUE);
    if (headers) {
      if (headers.headerLink == 'ruleset') {
        IsRuleset = true;
        return true;
      }
      else if (headers.headerLink == 'character') {
        IsCharacter = true;
        return false;
      }
    }
    return undefined;
  }
  public static GetCurrentRulesetID(localStorage: LocalStoreManager): number {
    let IsCharacter: boolean = false;
    let IsRuleset: boolean = false;
    let headers = localStorage.getDataObject<HeaderValues>(DBkeys.HEADER_VALUE);
    if (headers) {
      if (headers.headerLink == 'ruleset') {
        return headers.headerId;
      }
    }
    return 0;
  }
  public static GetCurrentCharacterID(localStorage: LocalStoreManager): number {
    let IsCharacter: boolean = false;
    let IsRuleset: boolean = false;
    let headers = localStorage.getDataObject<HeaderValues>(DBkeys.HEADER_VALUE);
    if (headers) {
      if (headers.headerLink == 'character') {
        return headers.headerId;
      }
    }
    return 0;
  }
  public static CurrentCharacters_RulesetID(localStorage: LocalStoreManager): number {
    return localStorage.getDataObject<any>(DBkeys.RULESET_ID);
  }
  public static DefaultBuffAndEffectImage: string = '../assets/images/BnE/Def_BnE.jpg';
  //public static getItemsFromRandomizationEngine(REList, alertService) {
  //  //var REList = JSON.parse('[{"randomizationEngineId":20,"percentage":90,"qty":"D8 + D100","sortOrder":0,"itemMasterId":8894,"isOr":false,"isDeleted":false,"itemMaster":{"itemMasterId":8894,"ruleSetId":0,"itemName":"10 loot","itemImage":"https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Book.jpg","itemStats":null,"itemVisibleDesc":null,"command":null,"itemCalculation":null,"value":0,"volume":0,"weight":0,"isContainer":false,"containerWeightMax":0,"containerVolumeMax":0,"containerWeightModifier":null,"percentReduced":0,"totalWeightWithContents":0,"isMagical":false,"isConsumable":false,"metatags":null,"rarity":null,"parentItemMasterId":null,"isDeleted":null,"commandName":null,"itemMaster1":null,"ruleSet":null,"itemMasters1":null,"itemMasterAbilities":null,"itemMasterBuffAndEffects":null,"itemMasterPlayers":null,"itemMasterSpell":null,"itemMasterCommand":null,"itemMasterLoot":null,"items":null}},{"randomizationEngineId":21,"percentage":10,"qty":"100","sortOrder":1,"itemMasterId":9005,"isOr":true,"isDeleted":false,"itemMaster":{"itemMasterId":9005,"ruleSetId":0,"itemName":"1111","itemImage":"https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Armor.jpg","itemStats":null,"itemVisibleDesc":null,"command":null,"itemCalculation":null,"value":0,"volume":0,"weight":0,"isContainer":false,"containerWeightMax":0,"containerVolumeMax":0,"containerWeightModifier":null,"percentReduced":0,"totalWeightWithContents":0,"isMagical":false,"isConsumable":false,"metatags":null,"rarity":null,"parentItemMasterId":null,"isDeleted":null,"commandName":null,"itemMaster1":null,"ruleSet":null,"itemMasters1":null,"itemMasterAbilities":null,"itemMasterBuffAndEffects":null,"itemMasterPlayers":null,"itemMasterSpell":null,"itemMasterCommand":null,"itemMasterLoot":null,"items":null}},{"randomizationEngineId":22,"percentage":70,"qty":"D10 + D8","sortOrder":2,"itemMasterId":8903,"isOr":false,"isDeleted":false,"itemMaster":{"itemMasterId":8903,"ruleSetId":0,"itemName":"1111_4","itemImage":"https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Crossbow.jpg","itemStats":null,"itemVisibleDesc":null,"command":null,"itemCalculation":null,"value":0,"volume":0,"weight":0,"isContainer":false,"containerWeightMax":0,"containerVolumeMax":0,"containerWeightModifier":null,"percentReduced":0,"totalWeightWithContents":0,"isMagical":false,"isConsumable":false,"metatags":null,"rarity":null,"parentItemMasterId":null,"isDeleted":null,"commandName":null,"itemMaster1":null,"ruleSet":null,"itemMasters1":null,"itemMasterAbilities":null,"itemMasterBuffAndEffects":null,"itemMasterPlayers":null,"itemMasterSpell":null,"itemMasterCommand":null,"itemMasterLoot":null,"items":null}},{"randomizationEngineId":23,"percentage":30,"qty":"25","sortOrder":3,"itemMasterId":8897,"isOr":true,"isDeleted":false,"itemMaster":{"itemMasterId":8897,"ruleSetId":0,"itemName":"14 loot","itemImage":"./assets/images/DefaultImages/Item.jpg","itemStats":null,"itemVisibleDesc":null,"command":null,"itemCalculation":null,"value":0,"volume":0,"weight":0,"isContainer":false,"containerWeightMax":0,"containerVolumeMax":0,"containerWeightModifier":null,"percentReduced":0,"totalWeightWithContents":0,"isMagical":false,"isConsumable":false,"metatags":null,"rarity":null,"parentItemMasterId":null,"isDeleted":null,"commandName":null,"itemMaster1":null,"ruleSet":null,"itemMasters1":null,"itemMasterAbilities":null,"itemMasterBuffAndEffects":null,"itemMasterPlayers":null,"itemMasterSpell":null,"itemMasterCommand":null,"itemMasterLoot":null,"items":null}}]')
  //  let AndArray = [];
  //  let OrArray = [];
  //  let Items = [];
  //  REList.map((item, index) => {

  //    if (index == 0) {
  //      OrArray.push(item);
  //    }
  //    if (item.isOr && index != 0) {
  //      OrArray.push(item);
  //    }
  //    if ((!item.isOr && index != 0) || index == REList.length - 1) {
  //      AndArray.push(OrArray);
  //      OrArray = [];
  //      OrArray.push(item);

  //      if (!item.isOr && index == REList.length - 1) {
  //        AndArray.push(OrArray);
  //      }
  //    }


  //  });


  //  AndArray.map((Or) => {
  //    let totalPercentRunning: number = 0;
  //    let rolledPercentageValue = DiceService.rollDiceExternally(alertService, "D100", []);

  //    let skip_Or = false;

  //    Or.map(x => {
  //      totalPercentRunning = totalPercentRunning + +x.percentage;
  //      if (+totalPercentRunning >= +rolledPercentageValue && !skip_Or) {
  //        let CurrentQty = DiceService.rollDiceExternally(alertService, x.qty, []);

  //        Items.push({ itemMasterId: x.itemMasterId, qty: CurrentQty });
  //        skip_Or = true;
  //      }

  //    });

  //  });

  //  return Items;

  //}

    public static getItemsFromRandomizationEngine_WithMultipleSeletion(REList, alertService) {
    //var REList = JSON.parse('[{"randomizationEngineId":20,"percentage":90,"qty":"D8 + D100","sortOrder":0,"itemMasterId":8894,"isOr":false,"isDeleted":false,"itemMaster":{"itemMasterId":8894,"ruleSetId":0,"itemName":"10 loot","itemImage":"https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Book.jpg","itemStats":null,"itemVisibleDesc":null,"command":null,"itemCalculation":null,"value":0,"volume":0,"weight":0,"isContainer":false,"containerWeightMax":0,"containerVolumeMax":0,"containerWeightModifier":null,"percentReduced":0,"totalWeightWithContents":0,"isMagical":false,"isConsumable":false,"metatags":null,"rarity":null,"parentItemMasterId":null,"isDeleted":null,"commandName":null,"itemMaster1":null,"ruleSet":null,"itemMasters1":null,"itemMasterAbilities":null,"itemMasterBuffAndEffects":null,"itemMasterPlayers":null,"itemMasterSpell":null,"itemMasterCommand":null,"itemMasterLoot":null,"items":null}},{"randomizationEngineId":21,"percentage":10,"qty":"100","sortOrder":1,"itemMasterId":9005,"isOr":true,"isDeleted":false,"itemMaster":{"itemMasterId":9005,"ruleSetId":0,"itemName":"1111","itemImage":"https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Armor.jpg","itemStats":null,"itemVisibleDesc":null,"command":null,"itemCalculation":null,"value":0,"volume":0,"weight":0,"isContainer":false,"containerWeightMax":0,"containerVolumeMax":0,"containerWeightModifier":null,"percentReduced":0,"totalWeightWithContents":0,"isMagical":false,"isConsumable":false,"metatags":null,"rarity":null,"parentItemMasterId":null,"isDeleted":null,"commandName":null,"itemMaster1":null,"ruleSet":null,"itemMasters1":null,"itemMasterAbilities":null,"itemMasterBuffAndEffects":null,"itemMasterPlayers":null,"itemMasterSpell":null,"itemMasterCommand":null,"itemMasterLoot":null,"items":null}},{"randomizationEngineId":22,"percentage":70,"qty":"D10 + D8","sortOrder":2,"itemMasterId":8903,"isOr":false,"isDeleted":false,"itemMaster":{"itemMasterId":8903,"ruleSetId":0,"itemName":"1111_4","itemImage":"https://rpgsmithsa.blob.core.windows.net/stock-defimg-items/Crossbow.jpg","itemStats":null,"itemVisibleDesc":null,"command":null,"itemCalculation":null,"value":0,"volume":0,"weight":0,"isContainer":false,"containerWeightMax":0,"containerVolumeMax":0,"containerWeightModifier":null,"percentReduced":0,"totalWeightWithContents":0,"isMagical":false,"isConsumable":false,"metatags":null,"rarity":null,"parentItemMasterId":null,"isDeleted":null,"commandName":null,"itemMaster1":null,"ruleSet":null,"itemMasters1":null,"itemMasterAbilities":null,"itemMasterBuffAndEffects":null,"itemMasterPlayers":null,"itemMasterSpell":null,"itemMasterCommand":null,"itemMasterLoot":null,"items":null}},{"randomizationEngineId":23,"percentage":30,"qty":"25","sortOrder":3,"itemMasterId":8897,"isOr":true,"isDeleted":false,"itemMaster":{"itemMasterId":8897,"ruleSetId":0,"itemName":"14 loot","itemImage":"./assets/images/DefaultImages/Item.jpg","itemStats":null,"itemVisibleDesc":null,"command":null,"itemCalculation":null,"value":0,"volume":0,"weight":0,"isContainer":false,"containerWeightMax":0,"containerVolumeMax":0,"containerWeightModifier":null,"percentReduced":0,"totalWeightWithContents":0,"isMagical":false,"isConsumable":false,"metatags":null,"rarity":null,"parentItemMasterId":null,"isDeleted":null,"commandName":null,"itemMaster1":null,"ruleSet":null,"itemMasters1":null,"itemMasterAbilities":null,"itemMasterBuffAndEffects":null,"itemMasterPlayers":null,"itemMasterSpell":null,"itemMasterCommand":null,"itemMasterLoot":null,"items":null}}]')
    let AndArray = [];
    let OrArray = [];
      let Items = [];
    REList.map((item, index) => {

      if (index == 0) {
        OrArray.push(item);
      }
      if (item.isOr && index != 0) {
        OrArray.push(item);
      }
      if ((!item.isOr && index != 0) || index == REList.length - 1) {
        AndArray.push(OrArray);
        OrArray = [];
        OrArray.push(item);

        //if (!item.isOr && index == REList.length - 1 && AndArray.length == 0) {
        //  AndArray.push(OrArray);
        //  }
          if (!item.isOr && index == REList.length - 1 ) {
              AndArray.push(OrArray);
          }
      }
    });

        if (AndArray.length >1) {
            AndArray.pop();
        }
    AndArray.map((Or) => {
      let totalPercentRunning: number = 0;
      let rolledPercentageValue = DiceService.rollDiceExternally(alertService, "D100", []);

      let skip_Or = false;

      Or.map(x => {
        totalPercentRunning = totalPercentRunning + +x.percentage;
        if (+totalPercentRunning >= +rolledPercentageValue && !skip_Or) {

          x.selectedItem.map((s_item) => {
            let CurrentQty = DiceService.rollDiceExternally(alertService, x.qty, []);

            //Items.push({ itemMasterId: s_item.itemMasterId, qty: CurrentQty });
            Items.push({ itemMasterId: s_item.itemId, qty: CurrentQty });
          })

          skip_Or = true;
        }

      });

    });
       
    return Items;

  }

  public static GetRandomizationEngineForMultipleItemSelection(randomizationInfo) {
    let RandomEngineList = [];
    let SortOrderNumberList: number[] =
      randomizationInfo.map((re) => {
        return re.sortOrder
      })
    let sortOrder_num = 0;

    let get_UniqueValuesFromArray = (list) => list.filter((v, i) => list.indexOf(v) === i);

    let SortOrderNumberList_Unique = get_UniqueValuesFromArray(SortOrderNumberList)
    if (SortOrderNumberList_Unique && SortOrderNumberList_Unique.length) {
      RandomEngineList =
        SortOrderNumberList_Unique.map((SortNumber, index) => {
          let commonRE = randomizationInfo.filter(x => x.sortOrder === SortNumber)
          if (commonRE && commonRE.length) {
            let RandomEngine = new randomization();
            RandomEngine.isDeleted = commonRE[0].isDeleted;
            RandomEngine.isOr = commonRE[0].isOr;

            RandomEngine.percentage = commonRE[0].percentage;
            RandomEngine.qty = commonRE[0].qty;
            RandomEngine.quantityString = commonRE[0].quantityString;
            RandomEngine.randomizationEngineId = commonRE[0].randomizationEngineId;
            RandomEngine.sortOrder = SortNumber;
            RandomEngine.selectedItem = [];

            commonRE.map((C_RE) => {
              RandomEngine.selectedItem.push({ image: C_RE.itemMaster ? C_RE.itemMaster.itemImage : '', itemId: C_RE.itemMaster ? C_RE.itemMaster.itemMasterId : C_RE.itemMasterId, text: C_RE.itemMaster ? C_RE.itemMaster.itemName : '' });
            });

            return RandomEngine;
          }
        });
    }
    return RandomEngineList;
  }

  public static commandStatTypeInCommand(cmd: string, statdetails: any): Observable<any> {
    try {
      let data = [];

      cmd = DiceService.hideTextCommandSquareBraces(cmd);
      cmd.split(/\[(.*?)\]/g).map((rec) => {
        let id = ''; let flag = false; let type = 0; let statType = 0;
        let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

        if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
        if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
        if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
        if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

        if (isValue || isSubValue || isCurrent || isMax) {
          if (isValue) {
            id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
            type = 3
          }
          else if (isSubValue) {
            id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
            type = 4
          }
          else if (isCurrent) {
            id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
            type = 1
          }
          else if (isMax) {
            id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
            type = 2
          }

        }
        else {
          id = rec.replace('[', '').replace(']', '');
          type = 0
        }
        statdetails.charactersCharacterStat.map((q) => {
          if (id == q.characterStat.statName.toUpperCase()) {
            if (q.characterStat.characterStatTypeId == STAT_TYPE.Command) {
              data.push(q);
            }
          }
        })
      });
      cmd = DiceService.showTextCommandSquareBraces(cmd);
      return Observable.of(data);

    } catch (err) { }
  }
  public static commandStatInCommand(command: string, statdetails: any): Observable<string> {
    try {
      ////////////////////////////////
      let calculationString: string = command.toUpperCase();
      let inventoreyWeight = statdetails.character.inventoryWeight;
      let finalCalcString: string = '';
      calculationString.split("[INVENTORYWEIGHT]").map((item) => {
        calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
      })
      let IDs: any[] = [];
      finalCalcString = calculationString;
      if (calculationString) {

        calculationString = DiceService.hideTextCommandSquareBraces(calculationString);
        calculationString.split(/\[(.*?)\]/g).map((rec) => {

          let id = ''; let flag = false; let type = 0; let statType = 0;
          let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

          if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
          if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
          if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
          if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

          if (isValue || isSubValue || isCurrent || isMax) {
            if (isValue) {
              id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
              type = 3
            }
            else if (isSubValue) {
              id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
              type = 4
            }
            else if (isCurrent) {
              id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
              type = 1
            }
            else if (isMax) {
              id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
              type = 2
            }

          }
          else {
            id = rec.replace('[', '').replace(']', '');
            type = 0
          }
          statdetails.charactersCharacterStat.map((q) => {
            if (id == q.characterStat.statName.toUpperCase()) {
              flag = (id == q.characterStat.statName.toUpperCase());
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

        calculationString = DiceService.showTextCommandSquareBraces(calculationString);


        IDs.map((rec) => {
          statdetails.charactersCharacterStat.map((stat) => {
            if (rec.id == stat.characterStat.statName.toUpperCase()) {
              let num = 0; let isCMD = false;
              let whileCMD = "";
              switch (rec.statType) {
                case STAT_TYPE.Command:
                  num = -1;
                  whileCMD = stat.command;

                  do {
                    isCMD = false;
                    this.commandStatTypeInCommand(whileCMD, statdetails).subscribe((x) => {
                      //this.cmd = x.originaltext
                      x.map((val, i) => {
                        statdetails.charactersCharacterStat.map((_stat, j) => {
                          if (rec.id == val.characterStat.statName.toUpperCase()) { console.log('error referenced: ', rec.id) }
                          else if (val.characterStat.statName.toUpperCase() == _stat.characterStat.statName.toUpperCase()) {
                            switch (val.characterStat.characterStatTypeId) {
                              case STAT_TYPE.Command:
                                isCMD = true;
                                whileCMD = whileCMD.replace('[' + val.characterStat.statName.toUpperCase() + ']', _stat.command);
                                break;
                              default:
                                isCMD = false;
                                //cmd = _preCMD.replace(val.originaltext, stat.command);
                                break;
                            }
                          }
                        })
                      })
                      //calculationString = calculationString.replace(x.originaltext, num.toString());
                    });
                  }
                  while (isCMD);

                  if (!isCMD) {
                    num == -2; isCMD = true;
                    whileCMD = whileCMD.replace(rec.originaltext, stat.command);
                  }
                  //while (temp != 0);
                  break;
                default:
                  break;
              }
              if (num == -1 && isCMD) {
                calculationString = calculationString.replace(rec.originaltext, whileCMD);
              }
              else if (num == -2 && isCMD) {
                calculationString = calculationString.replace(rec.originaltext, whileCMD);
              }
              ////else if (num)
              ////calculationString = calculationString.replace(rec.originaltext, num.toString());
              //// else
              //// calculationString = calculationString.replace(rec.originaltext, '0');
              //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
            }

          });
          finalCalcString = calculationString;
        });
        return Observable.of(finalCalcString);
      }
      return Observable.of(finalCalcString);
    } catch (err) { }
  }
  public static getFinalCalculationString(inputString: string, statdetails: any, charactersCharacterStats: any, character: any): string {
    //////////////////////////////////////////////
    try {

      ////////////////////////////////
      let calculationString: string = inputString;
      let inventoreyWeight = statdetails.character.inventoryWeight;
      let finalCalcString: string = '';
      try {
        this.commandStatInCommand(calculationString, statdetails).subscribe(res => {
          calculationString = res;
        });
      } catch (err) { }


      calculationString.split("[INVENTORYWEIGHT]").map((item) => {
        calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
      })
      let IDs: any[] = [];
      finalCalcString = calculationString;
      if (calculationString) {
        calculationString = DiceService.hideTextCommandSquareBraces(calculationString);
        calculationString.split(/\[(.*?)\]/g).map((rec) => {

          let id = ''; let flag = false; let type = 0; let statType = 0;
          let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

          if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
          if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
          if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
          if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

          if (isValue || isSubValue || isCurrent || isMax) {
            if (isValue) {
              id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
              type = 3
            }
            else if (isSubValue) {
              id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
              type = 4
            }
            else if (isCurrent) {
              id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
              type = 1
            }
            else if (isMax) {
              id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
              type = 2
            }

          }
          else {
            id = rec.replace('[', '').replace(']', '');
            type = 0
          }
          statdetails.charactersCharacterStat.map((q) => {
            if (!flag) {
              flag = (id == q.characterStat.statName.toUpperCase());
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


        calculationString = DiceService.showTextCommandSquareBraces(calculationString);

        IDs.map((rec) => {
          statdetails.charactersCharacterStat.map((stat) => {
            if (rec.id == stat.characterStat.statName.toUpperCase()) {
              let num: string = '0';
              //let conditionResult = "";
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
                    num = stat.value
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
                case STAT_TYPE.Choice: //Combo
                  num = stat.defaultValue
                  break;
                case STAT_TYPE.Condition:
                  let characterStatConditionsfilter = charactersCharacterStats.filter((stat) => stat.characterStat.statName.toUpperCase() == rec.id);
                  let characterStatConditions = characterStatConditionsfilter["0"].characterStat.characterStatConditions;
                  let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], character, charactersCharacterStats);
                  //console.log(result);
                  //let result = this.conditionStat(characterStatConditions);
                  //console.log(result);
                  //if (isNaN(+result)) {
                  //  num = 0;
                  //} else {
                  //  num = +result;
                  //}
                  // num = result;
                  num = ServiceUtil.GetCalcuationsResults(result, statdetails, charactersCharacterStats, character);

                  break;
                default:
                  break;
              }
              //calculationString = calculationString.replace(rec.originaltext, conditionResult);
              //console.log('calc',calculationString);
              if (num) {

                calculationString = calculationString.replace(rec.originaltext, num.toString());
              }

              else {
                calculationString = calculationString.replace(rec.originaltext, '0');
              }

              //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
            }

          });

          finalCalcString = calculationString;

        });
      }
      ////////////////////////////////
      finalCalcString = finalCalcString.replace(/\[(.*?)\]/g, "0");
      finalCalcString = finalCalcString.replace(/  +/g, ' ');
      finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');
      finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '').replace(/\* 0/g, '').replace(/\/ 0/g, '');

      return finalCalcString;

    } catch (err) {

      return '0';
    }

    //////////////////////////////////////////////
  }
  public static setIsComingFromCombatTracker_GM_Variable(localStorage): boolean {
    let IsComingFromCombatTracker = localStorage.localStorageGetItem(DBkeys.IsComingFromCombatTracker_GM) ? true : false;
    localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, false);
    return IsComingFromCombatTracker;
  }
  public static setIsComingFromCombatTracker_PC_Variable(localStorage): boolean {
    let IsComingFromCombatTracker = localStorage.localStorageGetItem(DBkeys.IsComingFromCombatTracker_PC) ? true : false;
    localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
    return IsComingFromCombatTracker;
  }

  public static BindCharCharDetailsInLocalStorage(
    characterId: number,
    charactersCharacterStatService: CharactersCharacterStatService,
    localStorage: LocalStoreManager,
    refreshData: boolean = false,
    ShowAlert: boolean = false,
    characterStatIdUpdated: number = 0,
    alertService: AlertService = undefined,
    Old_CharCharacterstatsList = [],
    characterStatService: CharacterStatService): any {
    let localStorageVariable = localStorage.localStorageGetItem(DBkeys.CHAR_CHAR_STAT_DETAILS);
    if (localStorageVariable && localStorageVariable.characterId == characterId && !refreshData) {

    }
    else {
      localStorage.localStorageSetItem(DBkeys.CHAR_CHAR_STAT_DETAILS, { characterId: 0, charactersCharacterStats: null, statLinkRecords: null });
      charactersCharacterStatService.getCharCharStatDetails<any>(characterId)
        .subscribe((data: any) => {
          if (data) {
            let statLinkRecords = data.linkRecordsDetails;
            let ConditionsValuesList = data.conditionsValuesLists;
            let charactersCharacterStats: any[] = data.charactersCharacterStats;
            let character: any = new Characters();

            if (charactersCharacterStats.length && charactersCharacterStats[0] && charactersCharacterStats[0].character) {

              character = charactersCharacterStats[0].character;
            }

            charactersCharacterStats.forEach(item => {
              //item.icon = this.characterStatService.getIcon(item.characterStat.characterStatType.statTypeName);
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

                        charactersCharacterStats.map((q) => {
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
                      });

                    }
                    IDs.map((rec) => {

                      if (+rec.id == -1 && character.inventoryWeight) {
                        CalcString = CalcString.replace(rec.originaltext, character.inventoryWeight);
                      } else {
                        charactersCharacterStats.map((stat) => {
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
                                let characterStatConditionsfilter = ConditionsValuesList.filter((CCS) => CCS.characterStat.characterStatId == rec.id);
                                let characterStatConditions = characterStatConditionsfilter["0"].characterStat.characterStatConditions;
                                let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], character, ConditionsValuesList);
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
                    item.calculationResult = this.getCalculationResult(item.characterStat.characterStatCalcs[0].statCalculation, charactersCharacterStats);
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
                          ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(character.inventoryWeight, ConditionsValuesList, Condition, false);
                        }
                        let operator = "";
                        let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(character.inventoryWeight, ConditionsValuesList, Condition, true);//Condition.compareValue;

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
            let Obj: any = { characterId: characterId, charactersCharacterStats: charactersCharacterStats, statLinkRecords: statLinkRecords };
            localStorage.localStorageSetItem(DBkeys.CHAR_CHAR_STAT_DETAILS, Obj)

            let characterStatsUpdated = [];
            if (characterStatIdUpdated == -1 && Old_CharCharacterstatsList && Old_CharCharacterstatsList.length) {

              Old_CharCharacterstatsList.map((_Old_CCS) => {
                let OLD_Value = _Old_CCS.value;
                let OLD_Number = _Old_CCS.number;
                let OLD_SubValue = _Old_CCS.subValue;
                let OLD_Current = _Old_CCS.current;
                let OLD_Maximum = _Old_CCS.maximum;
                //let OLD_CalculationResult = _Old_CCS.calculationResult;
                let OLD_Minimum = _Old_CCS.minimum;
                let OLD_DefaultValue = _Old_CCS.defaultValue;

                if (Obj.charactersCharacterStats && Obj.charactersCharacterStats.length) {
                  var newUpdatedCharCharStat = Obj.charactersCharacterStats.find(x => x.charactersCharacterStatId == _Old_CCS.charactersCharacterStatId);
                  if (newUpdatedCharCharStat) {
                    if (
                      newUpdatedCharCharStat.value != OLD_Value
                      || newUpdatedCharCharStat.number != OLD_Number
                      || newUpdatedCharCharStat.subValue != OLD_SubValue
                      || newUpdatedCharCharStat.current != OLD_Current
                      || newUpdatedCharCharStat.maximum != OLD_Maximum
                      || newUpdatedCharCharStat.defaultValue != OLD_DefaultValue
                    ) {

                      characterStatsUpdated.push(newUpdatedCharCharStat)
                    }

                  }
                }
              })

            }
            else {
              var newUpdatedCharCharStat = Obj.charactersCharacterStats.find(x => x.characterStatId == characterStatIdUpdated);
              characterStatsUpdated.push(newUpdatedCharCharStat)
            }

            if (characterStatsUpdated && characterStatsUpdated.length) {
              let conditionStatIdsReflected = [];

              characterStatsUpdated.map((_rec) => {
                if (ShowAlert && _rec.characterStatId && alertService) {
                  let updatedStatName = '';

                  if (Obj.charactersCharacterStats && Obj.charactersCharacterStats.length) {
                    var charCharStat = Obj.charactersCharacterStats.find(x => x.characterStatId == _rec.characterStatId);
                    if (charCharStat && charCharStat.characterStat && charCharStat.characterStat.statName) {
                      updatedStatName = '[' + charCharStat.characterStat.statName + ']';

                      Obj.charactersCharacterStats.map((_ccs) => {
                        if (_ccs.characterStat.characterStatTypeId == STAT_TYPE.Condition && _ccs.characterStat.alertPlayer) {

                          if (_ccs.characterStat.characterStatConditions) {
                            let conditionStatObj = null;
                            _ccs.characterStat.characterStatConditions.map((cond) => {
                              if (!conditionStatObj && (cond.ifClauseStatText.toUpperCase().indexOf(updatedStatName.toUpperCase()) > -1 || cond.compareValue.toUpperCase().indexOf(updatedStatName.toUpperCase()) > -1)) {
                                conditionStatObj = _ccs.characterStat;
                              }
                            })
                            if (conditionStatObj) {
                              conditionStatIdsReflected.push(_ccs);
                            }
                          }
                        }
                      });
                    }
                  }

                }
              });

              if (conditionStatIdsReflected && conditionStatIdsReflected.length) {
                let alertMsgs = '';
                let notificationData = [];
                let characterId = 0;
                conditionStatIdsReflected.map(x => {
                  let value = ServiceUtil.GetDescriptionWithStatValues('[' + x.characterStat.statName + ']', localStorageVariable)
                  if (x.text != value) {
                    alertMsgs += "The " + x.characterStat.statName + " value has changed to " + x.text + ". <br />";
                    characterId = x.characterId;
                    notificationData.push({ characterId: x.characterId, characterStatId: x.characterStatId, characterStatName: x.characterStat.statName, characterStatValue: x.text });
                  }
                });
                if (alertMsgs) {
                  alertService.showDialog(alertMsgs, DialogType.alert, () => { });
                  characterStatService.saveStatAlertNotifications(notificationData, characterId).subscribe(result => { }, error => { }, () => { });
                }
              }
            }
          }
        }, error => {

        }, () => { });
    }

  }

  private static getCalculationResult(value: string, charactersCharacterStats): number {
    try {
      if (value) {
        //value = value.
        return charactersCharacterStats.map(x => {
          return { id: x.characterStatId, type: x.characterStatTypeViewModel.statTypeName, name: x.statName };
        }).filter(y => y.type == 'Number' || y.type.startsWith('Value') || y.type.startsWith('Current'));
      }
      else return 0;
    } catch (err) { return 0; }
  }
  public static GetDescriptionWithStatValues(desc, localStorage) {
    try {
      if (desc) {
        let localStorage_ = localStorage.localStorageGetItem(DBkeys.CHAR_CHAR_STAT_DETAILS);
        let localStorage_variable = localStorage_ ? localStorage_ : localStorage;
        if (localStorage_variable && localStorage_variable.characterId > 0 && localStorage_variable.charactersCharacterStats && localStorage_variable.charactersCharacterStats.length) {
          let localStorage_CharCharStats: any[] = localStorage_variable.charactersCharacterStats

          if (localStorage_CharCharStats) {


            var matchArr = [];
            var myRegexp = /\[(.*?)\]/g;
            var match = myRegexp.exec(desc);
            while (match != null) {
              // matched text: match[0]
              // match start: match.index
              // capturing group n: match[n]

              matchArr.push(match[0])
              match = myRegexp.exec(desc);
            }
            if (matchArr && matchArr.length) {
              matchArr.map((match) => {
                var charStatNameToFind = match;
                if (charStatNameToFind) {
                  //match.split('[').map((m) => {
                  //  charStatNameToFind = match.replace('[', '');
                  //})
                  //match.split(']').map((m) => {
                  //  charStatNameToFind = match.replace(']', '');
                  //})
                  charStatNameToFind = charStatNameToFind.replace('[', '');
                  charStatNameToFind = charStatNameToFind.replace(']', '');


                  var stat = localStorage_CharCharStats.find(ccs => ccs.displayStatName.toUpperCase() == charStatNameToFind.toUpperCase());
                  if (stat) {
                    switch (stat.characterStat.characterStatTypeId) {
                      case STAT_TYPE.Text:
                        var value = stat.text;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        desc = desc.replace(match, value);
                        break;
                      case STAT_TYPE.RichText:
                        var value = stat.richText;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        desc = desc.replace(match, value);
                        break;
                      case STAT_TYPE.Number:
                        var value = stat.number;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        desc = desc.replace(match, value);
                        break;
                      case STAT_TYPE.Calculation:
                        var value = stat.calculationResult;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        desc = desc.replace(match, value);
                        break;
                      case STAT_TYPE.Command:
                        var value = stat.command;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        desc = desc.replace(match, value);
                        break;
                      case STAT_TYPE.Condition:
                        var value = stat.text;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        desc = desc.replace(match, value);
                        break;
                      case STAT_TYPE.Choice:
                        var num = stat.defaultValue
                        var choices = '';
                        var value: any = '';

                        let choicesTextArr = [];
                        if (stat.selectedCharacterChoices && stat.selectedCharacterChoices.length) {
                          stat.selectedCharacterChoices.map((choice) => {
                            choicesTextArr.push(choice.statChoiceValue);
                          })
                        }
                        if (stat.characterStat.isMultiSelect && choicesTextArr.length) {
                          choices = choicesTextArr.join(',');
                        }
                        else if (!stat.characterStat.isMultiSelect && choicesTextArr.length) {
                          choices = choicesTextArr[0];
                        }

                        if (stat.characterStat.isChoiceNumeric) {
                          value = num + ' / ';
                        }
                        else {
                          value = choices;
                        }

                        desc = desc.replace(match, value);
                        break;
                      case STAT_TYPE.Combo:
                        var text = stat.comboText;
                        var num = stat.defaultValue;
                        if (text == null || text == undefined) {
                          text = '';
                        }
                        if (num == null || num == undefined) {
                          num = '';
                        }
                        //var value = num + ' / ' + text;

                        desc = desc.replace(match, num + ' / ' + text);
                        break;
                      case STAT_TYPE.CurrentMax:
                        var current = stat.current;
                        if (current == null || current == undefined) {
                          current = '';
                        }
                        var maximum = stat.maximum;
                        if (maximum == null || maximum == undefined) {
                          maximum = '';
                        }
                        desc = desc.replace(match, current + ' / ' + maximum);

                        break;
                      case STAT_TYPE.ValueSubValue:
                        var value = stat.value;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        var subValue = stat.subValue;
                        if (subValue == null || subValue == undefined) {
                          subValue = '';
                        }
                        desc = desc.replace(match, value + '(' + subValue + ')');
                        break;
                      case STAT_TYPE.LinkRecord:
                        if (localStorage_variable.statLinkRecords && localStorage_variable.statLinkRecords.length) {
                          let statLinkRecords = localStorage_variable.statLinkRecords;
                          let name = "";
                          if (stat.defaultValue && stat.linkType) {
                            if (statLinkRecords && statLinkRecords.length && statLinkRecords.length > 0) {
                              statLinkRecords.map((link) => {
                                if (link.id == stat.defaultValue && link.type == stat.linkType) {
                                  name = link.name;
                                }
                              })
                            }
                            if (name) {
                              switch (stat.linkType) {
                                case STAT_LINK_TYPE.ABILITY:
                                  var value: any = '<a class="Editor_itemDetail a-hyperLink" data - Editor="' + stat.defaultValue + '" >' + name + ' </a>';
                                  desc = desc.replace(match, value);
                                  break;
                                case STAT_LINK_TYPE.SPELL:
                                  var value: any = '<a class="Editor_spellDetail a-hyperLink" data-Editor="' + stat.defaultValue + '">' + name + '</a>';
                                  desc = desc.replace(match, value);
                                  break;
                                case STAT_LINK_TYPE.ITEM:
                                  var value: any = '<a class="Editor_abilityDetail a-hyperLink" data-Editor="' + stat.defaultValue + '">' + name + '</a>';
                                  desc = desc.replace(match, value);
                                  break;
                                case STAT_LINK_TYPE.BUFFANDEFFECT:
                                  var value: any = '<a class="Editor_BuffAndEffectDetail a-hyperLink" data-Editor="' + stat.defaultValue + '">' + name + '</a>';
                                  desc = desc.replace(match, value);
                                  break;
                                default:
                                  break;
                              }

                            }
                          }

                        }
                        break;
                      case STAT_TYPE.Toggle:
                        switch (true) {
                          case stat.yesNo:
                            var value: any = stat.isYes ? 'YES' : 'NO';
                            desc = desc.replace(match, value);
                            break;
                          case stat.onOff:
                            var value: any = stat.isOn ? 'ON' : 'OFF';
                            desc = desc.replace(match, value);
                            break;
                          case stat.display:
                            var value: any = stat.showCheckbox ? 'TRUE' : 'FALSE';
                            desc = desc.replace(match, value);
                            break;
                          case stat.isCustom:
                            //var value: any = stat.showCheckbox ? 'TRUE' : 'FALSE';
                            //desc = desc.replace(match, value);
                            break;
                          default:
                            break;
                        }
                        break;


                      default:
                        break;
                    }
                  }
                }
              })
              //desc = desc.replace('[Deity]', 100)
              return desc;
            }

          }
        }
      }
      return desc;
    }
    catch (ex) {
      return desc;
    }
  }
  //public static GetDescriptionWithStatValues(description, localStorage) {
  //  if (description) {
  //  description = description.replace('[magicC]', "5");
  //  description = description.replace('[magicC]', "5");
  //  description = description.replace('[magicC]', "5");
  //  description = description.replace('[magicC]', "5");
  //  description = description.replace('[magicC]', "5");
  //  }

  //  return description;
  //}
   
  public static GetForCalsWithStatValues(statName, charactersCharacterStats) {
    try {
      if (statName) {
        ////let localStorage_variable = localStorage.localStorageGetItem(DBkeys.CHAR_CHAR_STAT_DETAILS);
        //let localStorage_variable = localStorage;
        if (charactersCharacterStats) {

          let localStorage_CharCharStats: any[] = charactersCharacterStats

          if (localStorage_CharCharStats) {


            var matchArr = [];
            var myRegexp = /\[(.*?)\]/g;
            var match = myRegexp.exec(statName);
            while (match != null) {
              // matched text: match[0]
              // match start: match.index
              // capturing group n: match[n]

              matchArr.push(match[0])
              match = myRegexp.exec(statName);
            }
            if (matchArr && matchArr.length) {
              matchArr.map((match) => {
                var charStatNameToFind = match;
                if (charStatNameToFind) {
                  //match.split('[').map((m) => {
                  //  charStatNameToFind = match.replace('[', '');
                  //})
                  //match.split(']').map((m) => {
                  //  charStatNameToFind = match.replace(']', '');
                  //})
                  charStatNameToFind = charStatNameToFind.replace('[', '');
                  charStatNameToFind = charStatNameToFind.replace(']', '');


                  var stat = localStorage_CharCharStats.find(ccs => ccs.displayStatName.toUpperCase() == charStatNameToFind.toUpperCase());
                  if (stat) {
                    switch (stat.characterStat.characterStatTypeId) {
                      case STAT_TYPE.Number:
                        var value = stat.number;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        statName = statName.replace(match, value);
                        break;
                      case STAT_TYPE.Calculation:
                        var value = stat.calculationResult;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        statName = statName.replace(match, value);
                        break;
                      case STAT_TYPE.Condition:
                        var value = stat.text;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        statName = statName.replace(match, value);
                        break;
                      case STAT_TYPE.Choice:
                        var num = stat.defaultValue
                        var choices = '';
                        var value: any = '';

                        let choicesTextArr = [];
                        if (stat.selectedCharacterChoices && stat.selectedCharacterChoices.length) {
                          stat.selectedCharacterChoices.map((choice) => {
                            choicesTextArr.push(choice.statChoiceValue);
                          })
                        }
                        if (stat.characterStat.isMultiSelect && choicesTextArr.length) {
                          choices = choicesTextArr.join(',');
                        }
                        else if (!stat.characterStat.isMultiSelect && choicesTextArr.length) {
                          choices = choicesTextArr[0];
                        }

                        if (stat.characterStat.isChoiceNumeric) {
                          value = num + ' / ';
                        }
                        else {
                          value = choices;
                        }

                        statName = statName.replace(match, value);
                        break;
                      case STAT_TYPE.Combo:
                        var text = stat.comboText;
                        var num = stat.defaultValue;
                        if (text == null || text == undefined) {
                          text = '';
                        }
                        if (num == null || num == undefined) {
                          num = '';
                        }
                        //var value = num + ' / ' + text;

                        statName = statName.replace(match, num + ' / ' + text);
                        break;
                      case STAT_TYPE.CurrentMax:
                        var current = stat.current;
                        if (current == null || current == undefined) {
                          current = '';
                        }
                        var maximum = stat.maximum;
                        if (maximum == null || maximum == undefined) {
                          maximum = '';
                        }
                        statName = statName.replace(match, current + ' / ' + maximum);

                        break;
                      case STAT_TYPE.ValueSubValue:
                        var value = stat.value;
                        if (value == null || value == undefined) {
                          value = '';
                        }
                        var subValue = stat.subValue;
                        if (subValue == null || subValue == undefined) {
                          subValue = '';
                        }
                        statName = statName.replace(match, value + '(' + subValue + ')');
                        break;
                      
                      default:
                        break;
                    }
                  }
                }
              })
              //desc = desc.replace('[Deity]', 100)
              return statName;
            }

          }
        }
      }
      return statName;
    }
    catch (ex) {
      return statName;
    }
  }


  public static EncryptID(id) {
    let encryptedId = '';
    encryptedId = Number(+id * 2 + 89898989 - (+id)).toString(16);
    return encryptedId;
  }
  public static DecryptID(encryptedId) {
    let decryptedId = '';
    decryptedId = (parseInt(encryptedId, 16) - 89898989).toString();
    return decryptedId;
  }

  public static GotoItemTemplateDetail(id, router) {
    router.navigate(['/ruleset/item-details/', id]);
  }
  public static GotoItemTemplateBundleDetail(id, router) {
    router.navigate(['/ruleset/bundle-details/', id]);
  }
  public static GotoSpellDetail(id, router) {
    router.navigate(['/ruleset/spell-details/', id]);
  }
  public static GotoAbilityDetail(id, router) {
    router.navigate(['/ruleset/ability-details/', id]);
  }
  public static GotoBuffEffectDetail(id, router) {
    router.navigate(['/ruleset/buff-effect-details/', id]);
  }
  public static GotoMonsterDetail(id, router) {
    router.navigate(['/ruleset/monster-details/', id]);
  }
  public static GotoMonsterTemplateDetail(id, router) {
    router.navigate(['/ruleset/monster-template-details/', id]);
  }
  public static GotoMonsterTemplateBundleDetail(id, router) {
    router.navigate(['/ruleset/monster-bundle-details/', id]);
  }

  public static DeepCopy(obj: any): any {
    let clonedObject;

    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Array) {
      clonedObject = [];
      for (let i = 0; i < obj.length; i++) {
        clonedObject[i] = Object.assign({}, obj[i]);
      }
      return clonedObject;
    }
    if (obj instanceof Date) {
      clonedObject = new Date(obj.valueOf());
      return clonedObject;
    }
    if (obj instanceof RegExp) {
      clonedObject = RegExp(obj.source, obj.flags);
      return clonedObject;
    }
    if (obj instanceof Object) {
      clonedObject = new obj.constructor();
      for (const attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          clonedObject[attr] = Object.assign({}, obj[attr]);
        }
      }
      return clonedObject;
    }
  }


}
