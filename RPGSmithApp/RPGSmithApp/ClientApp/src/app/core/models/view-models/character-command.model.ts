import { VIEW, DICE } from '../enums';

export class CharacterCommand {
  constructor(characterCommandId?: number, rulesetCommandId?: number, command?: string, name?: string, characterId?: number,
    lastResult?: number, lastResultTotal?: number, lastResultNumbers?: string, diceCommandArray?: DiceCommand[], invalidCommandText?: string[],
    validCommandText?: string[], lastSavedCommand?: string, isCustomNumericCommand?: boolean, isCustomDice?: boolean, actualCommand?: string, selectedResultCommand?: string,
    cmdToRoll?: string) {
    this.characterCommandId = characterCommandId;
    this.rulesetCommandId = rulesetCommandId;
    this.command = command;
    this.lastSavedCommand = lastSavedCommand;
    this.name = name;
    this.characterId = characterId;
    this.lastResult = lastResult;
    this.lastResultNumbers = lastResultNumbers;
    this.lastResultTotal = lastResultTotal;
    this.diceCommandArray = diceCommandArray;
    this.invalidCommandText = invalidCommandText;
    this.validCommandText = validCommandText;
    this.isCustomNumericCommand = isCustomNumericCommand;
    this.isCustomDice = isCustomDice;
    this.actualCommand = actualCommand;
    this.selectedResultCommand = selectedResultCommand;
    this.cmdToRoll = cmdToRoll;
  }

  public characterCommandId: number;
  public rulesetCommandId: number;
  public command: string;
  public lastSavedCommand: string;
  public name: string;
  public characterId: number;
  public lastResult: number;
  public lastResultNumbers: string;
  public lastResultTotal: number;
  public diceCommandArray: DiceCommand[];
  public invalidCommandText: string[];
  public validCommandText: string[];
  public isCustomNumericCommand: boolean;
  public isCustomDice: boolean;
  public actualCommand: string;
  public selectedResultCommand: string;
  public cmdToRoll: string;

}

export class DiceCommand {
  public dice: string;
  public command: string;
  public result: string;
}
