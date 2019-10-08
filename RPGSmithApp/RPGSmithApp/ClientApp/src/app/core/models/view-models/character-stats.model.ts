import { VIEW } from '../enums';
import { Ruleset } from './ruleset.model';
import { characterStatChoices, characterStatCalcs } from '../tiles/character-stat-tile.model';

export class CharacterStats {

    constructor(characterStatId?: number, ruleSetId?: number, statName?: string, statDesc?: string, isMultiSelect?: boolean, characterStatCalculationIds?: string, 
        isActive?: boolean, sortOrder?: any, createdDate?: any, modifiedDate?: any, parentCharacterStatId?: number, characterStatComboViewModel?: CharacterStatCombo
        , characterStatTypeId?: number, characterStatTypeName?: string, characterStatCalculation?: string, characterStatCommand?: string,
        characterStatTypeViewModel?: CharacterStatTypeViewModel, characterStatCalsComndViewModel?: CharacterStatCalsComndViewModel[],
        characterStatChoicesViewModels?: CharacterStatChoicesViewModels[], view?: VIEW, icon?: ICON, characterStatChoices?: characterStatChoices[],
        characterStatCalcs?: characterStatCalcs[], characterStatToggleViewModel?: CharacterStatToggle, characterStatDefaultValueViewModel?: CharacterStatDefaultValue[], characterStatConditionViewModel?: CharacterStatConditionViewModel[],
      addToModScreen?: boolean, isChoiceNumeric?: boolean, isChoicesFromAnotherStat?: boolean,
      selectedChoiceCharacterStatId?: number, alertPlayer?: boolean, alertGM?: boolean) {
        this.characterStatId = characterStatId;
        this.ruleSetId = ruleSetId;
        this.statName = statName; 
        this.statDesc = statDesc;
        this.isMultiSelect = isMultiSelect;
        this.isActive = isActive;
        this.sortOrder = sortOrder;
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
        this.parentCharacterStatId = parentCharacterStatId;
        this.characterStatTypeId = characterStatTypeId;
        this.characterStatTypeName = characterStatTypeName;
        this.characterStatCalculation = characterStatCalculation;
        this.characterStatCalculationIds = characterStatCalculationIds;
        this.characterStatCommand = characterStatCommand;
        this.characterStatTypeViewModel = characterStatTypeViewModel;
        this.characterStatCalsComndViewModel = characterStatCalsComndViewModel;
        this.characterStatChoicesViewModels = characterStatChoicesViewModels;
        this.view = view;
        this.icon = icon;
        this.characterStatChoices = characterStatChoices;
        this.characterStatCalcs = characterStatCalcs;
        this.characterStatComboViewModel = characterStatComboViewModel;
        this.characterStatToggleViewModel = characterStatToggleViewModel;
        this.characterStatDefaultValueViewModel = characterStatDefaultValueViewModel;
      this.characterStatConditionViewModel = characterStatConditionViewModel;
      this.addToModScreen = addToModScreen;
      this.isChoiceNumeric = isChoiceNumeric;
      this.isChoicesFromAnotherStat = isChoicesFromAnotherStat;
      this.selectedChoiceCharacterStatId = selectedChoiceCharacterStatId;
      this.alertPlayer = alertPlayer;
      this.alertGM = alertGM;
    }

    public characterStatId: number;
    public ruleSetId: number;
    public statName: string;
    public statDesc: string;
    public isMultiSelect: boolean;
    public isActive: boolean;  
    public sortOrder: any; 
    public createdDate: any;
    public modifiedDate: any;
    public parentCharacterStatId: number;
    public characterStatTypeId: number;
    public characterStatTypeName: string;
    public characterStatCalculation: string;
    public characterStatCalculationIds: string;
    public characterStatCommand: string;

    public characterStatTypeViewModel: CharacterStatTypeViewModel;
    public characterStatComboViewModel: CharacterStatCombo;
    public characterStatToggleViewModel: CharacterStatToggle;
    public characterStatDefaultValueViewModel: CharacterStatDefaultValue[];
    public characterStatConditionViewModel: CharacterStatConditionViewModel[];
    public characterStatCalsComndViewModel: CharacterStatCalsComndViewModel[];
    public characterStatChoicesViewModels: CharacterStatChoicesViewModels[];
    public view: VIEW;
    public icon: ICON;
    public characterStatChoices: characterStatChoices[];
  public characterStatCalcs: characterStatCalcs[];
  public addToModScreen: boolean;
  public isChoiceNumeric: boolean;
  public isChoicesFromAnotherStat: boolean;
public selectedChoiceCharacterStatId :number;
  public alertPlayer: boolean;
  public alertGM: boolean;
}  

export class CharacterStatTypeViewModel{
    constructor(characterStatTypeId?: number, statTypeName?: string, statTypeDesc?: string,
        isNumeric?: boolean, icon?: ICON, typeId?: number) {
        this.characterStatTypeId = characterStatTypeId;
        this.typeId = typeId;
        this.statTypeName = statTypeName;
        this.statTypeDesc = statTypeDesc;
        this.isNumeric = isNumeric;
        this.icon = icon;
    }

    public characterStatTypeId: number;
    public typeId: number;
    public statTypeName: string;
    public statTypeDesc: string;
    public isNumeric: boolean;
    public icon: ICON;
}

export class CharacterStatCombo {
    constructor(characterStatComboId?: number, maximum?: number, minimum?: number,
        defaultValue?: number, defaultText?:string)
    {
        this.characterStatComboId = characterStatComboId;
        this.maximum = maximum;
        this.minimum = minimum;
        this.defaultValue = defaultValue;
        this.defaultText = defaultText;
    }
    public characterStatComboId: number;
    public maximum: number;
    public minimum: number;
    public defaultValue: number;
    public defaultText: string;
}

export class CharacterStatToggle {
    constructor(characterStatToggleId?: number, yesNo?: boolean, onOff?: boolean, showCheckbox?: boolean,
        display?: boolean, isCustom?: boolean, customToggles?: CustomToggle[]) {
        this.characterStatToggleId = characterStatToggleId;
        this.yesNo = yesNo;
        this.onOff = onOff;
        this.display = display;
        this.showCheckbox = showCheckbox;
        this.isCustom = isCustom;
        this.customToggles = customToggles;
    }
    public characterStatToggleId: number;
    public yesNo: boolean;
    public onOff: boolean;
    public display: boolean;
    public showCheckbox: boolean;
    public isCustom: boolean;
    public customToggles: CustomToggle[];
}

export class CustomToggle {
    constructor(customToggleId?: number, toggleText?: string, image?: string) {
        this.customToggleId = customToggleId;
        this.toggleText = toggleText;
        this.image = image;
    }
    public customToggleId: number;
    public toggleText: string;
    public image: string;
}

export class CharacterStatCalsComndViewModel{
    constructor(id?: number, calculationCommandValue?: string, statCalculationIds?: string){
        this.id = id;
        this.calculationCommandValue = calculationCommandValue;
        this.statCalculationIds = statCalculationIds;

    }

    public id: number;
    public calculationCommandValue: string;
    public statCalculationIds: string;
}


export class CharacterStatChoicesViewModels{
    constructor(characterStatChoiceId?: number, statChoiceValue?: string){
        this.characterStatChoiceId = characterStatChoiceId;
        this.statChoiceValue = statChoiceValue;
    }

    public characterStatChoiceId: number;
    public statChoiceValue: string;
}

export class Choices {    
    public id: number;
    public rulesetId: number;
    public value: string;
}

export enum ICON {
    Text = "icon-CharStat-Text",
    RichText = "icon-text",
    Choice = "icon-choice",
    OnOff = "icon-on-off",
    YesNo = "icon-yes-no",
    Number = "icon-number",
    ValueSubValue = "icon-value-subval",
    CurrentMax = "icon-slider",
    Calculation = "icon-calculation",
    Command = "icon-dice",
    Toggle = "icon-yes-no",
    Combo = "icon-CharStat-OnOff"
}
//export class CharacterStatText {
//    constructor(characterStatId?: number, defaultValue?: string) {
//        this.characterStatId = characterStatId;
//        this.defaultValue = defaultValue;
//    }
//    public characterStatId: number; 
//    public defaultValue: string;
//}
//export class CharacterStatRichText {
//    constructor(characterStatId?: number, defaultValue?: string) {
//        this.characterStatId = characterStatId;
//        this.defaultValue = defaultValue;
//    }
//    public characterStatId: number;
//    public defaultValue: string;
//}
export class CharacterStatDefaultValue {
    constructor(characterStatDefaultValueId?: number, characterStatId?: number, defaultValue?: string, maximum?: number, minimum?: number, type?: number) {
        this.characterStatDefaultValueId = characterStatDefaultValueId ? characterStatDefaultValueId : 0;

        this.characterStatId = characterStatId ? characterStatId : 0;
        this.defaultValue = defaultValue ? defaultValue : '';
        this.maximum = maximum ;
        this.minimum = minimum ;
        this.type = type ? type : 0;
    }


    public characterStatDefaultValueId: number;
    public characterStatId: number;
    public defaultValue: string;
    public maximum: number;
    public minimum: number;
    public type: number;
}
export class CharacterStatConditionViewModel {
    constructor(characterStatConditionId: number, conditionOperatorID: number, compareValue: string, result: string, sortOrder: number, characterStatId: number, conditionOperator: ConditionOperator, statsList?: StatsList[], isNumeric?: boolean, ifClauseStatText?: string, ifClauseStatText_isNumeric?: boolean, compareValue_isNumeric?: boolean, ifClauseStatText_isValid?: boolean, compareValue_isValid?: boolean) {
        this.characterStatConditionId = characterStatConditionId ? characterStatConditionId : 0;

        //this.ifClauseStatId = (ifClauseStatId == null || ifClauseStatId == undefined) ? null : ifClauseStatId;
        this.conditionOperatorID = conditionOperatorID ? conditionOperatorID : null;
        this.compareValue = compareValue ? compareValue : '';
        this.result = result ? result : '';
        this.sortOrder = sortOrder ? sortOrder : 0;
        this.characterStatId = characterStatId ? characterStatId : 0;
        this.conditionOperator = conditionOperator ? conditionOperator : new ConditionOperator();
        //this.ifClauseStattype = ifClauseStattype ? ifClauseStattype : 0;
        //this.tempIfClauseStatId = tempIfClauseStatId ? tempIfClauseStatId : '';
        this.statsList = statsList ? statsList : [];
        this.isNumeric = isNumeric;
        this.ifClauseStatText = ifClauseStatText ? ifClauseStatText : '';
        this.ifClauseStatText_isNumeric = ifClauseStatText_isNumeric
        this.compareValue_isNumeric = compareValue_isNumeric
        this.ifClauseStatText_isValid = ifClauseStatText_isValid
        this.compareValue_isValid = compareValue_isValid
    }
    public characterStatConditionId: number;
    //public tempIfClauseStatId: string;
    //public ifClauseStatId: number;
    public conditionOperatorID: number;
    public compareValue: string;
    public result: string;
    public sortOrder: number;
    public characterStatId: number;
    public conditionOperator: ConditionOperator;
    //public ifClauseStattype: number;
    public statsList: StatsList[];
    public isNumeric: boolean;
    public ifClauseStatText: string;
    public ifClauseStatText_isNumeric: boolean;
    public compareValue_isNumeric: boolean;
    public ifClauseStatText_isValid: boolean;
    public compareValue_isValid: boolean;
    
}
export class ConditionOperator {
    constructor(conditionOperatorId?: number, name?: string, symbol?: string, isNumeric?: boolean) {
        this.conditionOperatorId = conditionOperatorId ? conditionOperatorId : 0;
        this.name = name ? name : '';
        this.symbol = symbol ? symbol : '';
        this.isNumeric = isNumeric ? isNumeric:false;
    }
    public conditionOperatorId: number;
    public name: string;
    public symbol: string;
    public isNumeric: boolean;
}

export class StatsList{

    constructor(characterStatId?: number, statName?: string, typeId?: number, ifClauseStattype?: number, tempCharacterStatId?: string, isNumeric?: boolean) {
        this.characterStatId = characterStatId;        
        this.statName = statName;
        this.typeId = typeId;
        this.ifClauseStattype = ifClauseStattype;
        this.tempCharacterStatId = tempCharacterStatId;
        this.isNumeric = isNumeric;
    }
    public tempCharacterStatId: string;
    public characterStatId: number;
    public statName: string;
    public typeId: number;
    public ifClauseStattype: number;
    public isNumeric: boolean;

}
export class ConditionOperatorsList  {

    constructor(conditionOperatorId?: number, name?: string, isNumeric?: boolean) {
        this.conditionOperatorId = conditionOperatorId;
        this.name = name;
        this.isNumeric = isNumeric;
    }
    public conditionOperatorId: number;
    public name: string;
    public isNumeric: boolean;
} 
