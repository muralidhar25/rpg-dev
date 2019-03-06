// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable } from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';
import { CharacterStatConditionViewModel } from '../models/view-models/character-stats.model';
import { STAT_TYPE } from '../models/enums';
import { DiceService } from './dice.service';
import { CharactersCharacterStat } from '../models/view-models/characters-character-stats.model';

@Injectable()
export class ServiceUtil {

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
}