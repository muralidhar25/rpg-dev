import { VIEW } from '../enums';
import { CharacterStats } from '../view-models/character-stats.model';
import { Characters } from './characters.model';

export class CharactersCharacterStat {
    constructor(
        charactersCharacterStatId?: number, characterStatId?: number, characterId?: number, text?: string, richText?: string, choice?: string,
        multiChoice?: string, command?: string, yesNo?: boolean, toggle?: string, comboText?: string, onOff?: boolean, value?: number,
        subValue?: number, view?: VIEW, showIcon?: boolean, current?: number, maximum?: number, calculationResult?: number, selectedmultichoices?:any,
        number?: number, isDeleted?: boolean, characterstat?: CharacterStats, character?: Characters,
        minimum?: number, defaultValue?: number, isOn?: boolean, isYes?: boolean, isCustom?: boolean, display?: boolean, showCheckbox?: boolean, customToggleId?: number, linkType?:string
    ) {
        this.charactersCharacterStatId = charactersCharacterStatId;
        this.characterStatId = characterStatId;
        this.characterId = characterId;
        this.text = text;
        this.richText = richText;
        this.choice = choice;
        this.multiChoice = multiChoice;
        this.command = command;
        this.yesNo = yesNo;
        this.onOff = onOff;
        this.value = value;
        this.subValue = subValue;
        this.current = current;
        this.maximum = maximum;
        this.minimum = minimum;
        this.defaultValue = defaultValue;
        this.comboText = comboText;
        this.view = view;
        this.showIcon = showIcon;
        this.calculationResult = calculationResult;
        this.number = number;
        this.isDeleted = isDeleted;
        this.characterStat = characterstat;
        this.selectedmultichoices = selectedmultichoices;
        this.character = character;
        this.toggle = toggle;
        this.isOn = isOn;
        this.isYes = isYes;
        this.isCustom = isCustom;
        this.display = display;
        this.showCheckbox = showCheckbox;
        this.customToggleId = customToggleId;
        this.linkType = linkType;
    }

    public charactersCharacterStatId: number;
    public characterStatId: number;
    public characterId: number;
    public text: string;
    public richText: string;
    public choice: string;
    public multiChoice: string;
    public command: string;
    public yesNo: boolean;
    public onOff: boolean;
    public value: number;
    public subValue: number;
    public current: number;
    public maximum: number;
    public minimum: number;
    public defaultValue: number;
    public comboText: string;
    public calculationResult: number;
    public number: number;
    public isDeleted: boolean;
    public isOn: boolean;
    public isYes: boolean;
    public isCustom: boolean;
    public display: boolean;
    public showCheckbox: boolean;
    public customToggleId: number;
    public view: VIEW;
    public showIcon: boolean;
    public selectedmultichoices: any;
    public characterStat: CharacterStats;
    public character: Characters;
    public toggle: string;
    public linkType: string;

}
