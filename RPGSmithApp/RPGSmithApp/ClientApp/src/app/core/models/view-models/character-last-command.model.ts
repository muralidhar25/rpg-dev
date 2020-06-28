import { VIEW, DICE } from '../enums';

export class CharacterLastCommand {
    constructor(characterId?: number, lastCommand?: string, lastCommandResult?: string,
      lastCommandValues?: string, lastCommandTotal?: number, lastCommandResultColor?: string) {
        this.characterId = characterId;
        this.lastCommand = lastCommand;
        this.lastCommandResult = lastCommandResult;
      this.lastCommandResultColor = lastCommandResultColor;
        this.lastCommandValues = lastCommandValues;
        this.lastCommandTotal = lastCommandTotal;
    }

    public characterId: number;
    public lastCommand: string;
    public lastCommandResult: string;
  public lastCommandResultColor: string;
    public lastCommandValues: string;
    public lastCommandTotal: number;
}

export class RuleSetLastCommand {
  constructor(rulesetId?: number, lastCommand?: string, lastCommandResult?: string,
    lastCommandValues?: string, lastCommandTotal?: number, lastCommandResultColor?: string) {
    this.rulesetId = rulesetId;
    this.lastCommand = lastCommand;
    this.lastCommandResult = lastCommandResult;
    this.lastCommandResultColor = lastCommandResultColor;
    this.lastCommandValues = lastCommandValues;
    this.lastCommandTotal = lastCommandTotal;
  }

  public rulesetId: number;
  public lastCommand: string;
  public lastCommandResult: string;
  public lastCommandResultColor: string;
  public lastCommandValues: string;
  public lastCommandTotal: number;
}


