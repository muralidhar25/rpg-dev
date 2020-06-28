export class CustomDice {
    dices: any;
  constructor(customDiceId?: number, name?: string, icon?: string, isNumeric?: boolean, customDicetype?: number, results?: Results[]) {        
        this.customDiceId = customDiceId;
        this.name = name;
        this.icon = icon;
        this.isNumeric = isNumeric;
        this.customDicetype = customDicetype;
        this.results = results;
    }

    public customDiceId: number;
    public name: string;
    public icon: string;
    public isNumeric: boolean;
  public customDicetype: number;
    public results: Results[];
}

export class Results {
    public customDiceResultId: number;
    public name: string;
    //public number: number;
  public displayContent: string;
  //public IsNumeric: boolean;
  public deckIcon: string;
}
export class DefaultDice {
    public defaultDiceId: number;
    public name: string;
    public icon: string;
}
export class DiceTray {
    constructor(diceTrayId?: number, name?: string, customDiceId?: number, defaultDiceId?: number, isCustomDice?: boolean, isDefaultDice?: boolean, ruleSetId?: number, icon?: string, isValidCommandName?: boolean, sortOrder?: number) {
        this.diceTrayId = diceTrayId;
        this.name = name;
        this.icon = icon;
        this.customDiceId = customDiceId;
        this.defaultDiceId = defaultDiceId;
        this.isCustomDice = isCustomDice;
        this.isDefaultDice = isDefaultDice;
        this.ruleSetId = ruleSetId;
        this.sortOrder = sortOrder;
        this.isValidCommandName = isValidCommandName;
    }

    public diceTrayId: number;
    public name: string;
    public icon: string;
    public customDiceId: number;
    public defaultDiceId: number;
    public isCustomDice: boolean;
    public isDefaultDice: boolean;
    public ruleSetId: number;
    public sortOrder: number;
    public isValidCommandName: boolean;
}
