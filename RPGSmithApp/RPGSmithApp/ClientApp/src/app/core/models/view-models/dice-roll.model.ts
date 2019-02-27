import { VIEW, DICE, DICE_ICON } from '../enums';

export class DiceRoll {
    constructor(characterCommandId?: number, command?: string, name?: string, characterId?: number, dice?: string, diceIcon?: string,
        diceNumber?: number, rolledCount?: number, randomNumbers?: number[], lastResult?: number, invalidCommandText?: string[], sign?: string,
        roundUp?: number, roundDown?: number, keepLowest?: number, keepHighest?: number, dropLowest?: number, dropHighest?: number, lastResultCalculation?: string,
        isShowReroll?: boolean, isAnimated?: boolean, isStatic?: boolean, RURD?: number, KHKL?: number, DHDL?: number, operator?: string, operatorValue?: number, isCustomDice?: boolean) {

        this.characterCommandId = characterCommandId;
        this.command = command;
        this.name = name;
        this.characterId = characterId;

        this.dice = dice;
        this.diceIcon = diceIcon;
        this.diceNumber = diceNumber;
        this.rolledCount = rolledCount;
        this.randomNumbers = randomNumbers;
        this.lastResult = lastResult;
        this.sign = sign;

        this.RURD = RURD;
        this.KHKL = KHKL;
        this.DHDL = DHDL;

        this.roundUp = roundUp;
        this.roundDown = roundDown;
        this.keepLowest = keepLowest;
        this.keepHighest = keepHighest;
        this.dropLowest = dropLowest;
        this.dropHighest = dropHighest;

        this.invalidCommandText = invalidCommandText;
        this.lastResultCalculation = lastResultCalculation;
        this.isShowReroll = isShowReroll;
        this.isAnimated = isAnimated;
        this.isStatic = isStatic;
        this.operator = operator;
        this.operatorValue = operatorValue;
        this.isCustomDice = isCustomDice;
    }

    public characterCommandId: number;
    public command: string;
    public name: string;
    public characterId: number;

    //public dice: DICE;
    public dice: string;
    public diceIcon: string;
    public diceNumber: number;
    public rolledCount: number;
    public randomNumbers: number[];
    public lastResult: number;
    public sign: string;

    public RURD: number;
    public KHKL: number;
    public DHDL: number;

    public roundUp: number;
    public roundDown: number;
    public keepLowest: number;
    public keepHighest: number;
    public dropLowest: number;
    public dropHighest: number;

    public invalidCommandText: string[];
    public lastResultCalculation: string;

    public isShowReroll: boolean;
    public isAnimated: boolean;
    public isStatic: boolean;
    public isCustomDice: boolean;
    public operator: string;
    public operatorValue: number;

}
