// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable } from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';
import { CharacterStatConditionViewModel } from '../models/view-models/character-stats.model';
import { STAT_TYPE } from '../models/enums';
import { DiceService } from './dice.service';

@Injectable()
export class ServiceUtil {

    //inventoryWeight=this.character.inventoryWeight
    //CharacterStatsValues=this.charactersCharacterStats
    public static GetClaculatedValuesOfConditionStats(inventoryWeight: any, CharacterStatsValues: any, Condition: CharacterStatConditionViewModel,IsCompareValue:boolean): string {
        let CalcStringForValue = IsCompareValue ? Condition.compareValue : Condition.ifClauseStatText;
        if (CalcStringForValue === '' || CalcStringForValue === null || CalcStringForValue === undefined) {
            CalcStringForValue = '';
            return CalcStringForValue;
        }
        else if (!isNaN(+CalcStringForValue) || !Condition.isNumeric) {
            return CalcStringForValue;
        }
        let CalcStringForValue_Result: number = 0;
        //////////////////////////////////////////////
        let calculationString: string = CalcStringForValue.toUpperCase();
        let inventoreyWeight = inventoryWeight;
        let finalCalcString: string = '';

        calculationString.split("[INVENTORYWEIGHT]").map((item) => {
            calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
        })
        let IDs: any[] = [];
        finalCalcString = calculationString;
        let NumericStatType = { CURRENT: 1, MAX: 2, VALUE: 3, SUBVALUE: 4, NUMBER: 5 };
        if (calculationString) {
            calculationString.split(/\[(.*?)\]/g).map((rec) => {

                let id = ''; let flag = false; let type = 0; let statType = 0;



                //let id = ''; let flag = false; let type = 0; let statType = 0;
                let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false; let isNum = false;

                if (rec.toUpperCase().split('(VALUE)').length > 1) { isValue = true; }
                if (rec.toUpperCase().split('(SUBVALUE)').length > 1) { isSubValue = true; }
                if (rec.toUpperCase().split('(CURRENT)').length > 1) { isCurrent = true; }
                if (rec.toUpperCase().split('(MAX)').length > 1) { isMax = true; }
                if (rec.toUpperCase().split('(Number)').length > 1) { isNum = true; }

                if (isValue || isSubValue || isCurrent || isMax || isNum) {
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
                        let num = 0;
                        switch (rec.statType) {
                            case STAT_TYPE.Number: //Number
                                num = stat.number
                                break;
                            case STAT_TYPE.CurrentMax: //Current Max
                                if (rec.type == 0)//current
                                {
                                    num = stat.current
                                }
                                else if (rec.type == NumericStatType.CURRENT)//current
                                {
                                    num = stat.current
                                }
                                else if (rec.type == NumericStatType.MAX)//Max
                                {
                                    num = stat.maximum
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
                                    num = stat.subValue
                                }
                                break;
                            case STAT_TYPE.Calculation: //Calculation
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
        finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '');
        finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '');
        try {
            finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
                finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
                finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
                finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
                ? finalCalcString.trim().slice(0, -1)
                : finalCalcString.trim();
            CalcStringForValue_Result = +finalCalcString == 0 ? 0 : DiceService.commandInterpretationForConditionStatValueCalculations(finalCalcString, undefined, undefined)[0].calculationResult;
        }
        catch (ex) {
            CalcStringForValue_Result = 0;
        }
        if (isNaN(CalcStringForValue_Result)) {
            CalcStringForValue_Result = 0;
        }
        return CalcStringForValue_Result.toString();
    }

}
