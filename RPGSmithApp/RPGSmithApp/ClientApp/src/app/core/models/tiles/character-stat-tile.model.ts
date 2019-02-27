import { VIEW } from '../enums';
import { CharactersCharacterStat } from '../view-models/characters-character-stats.model';

export class CharacterStatTile {
    constructor(characterStatTileId?: number,
        characterTileId?: number,
        rulesetStatTileId?: number,
        rulesetTileId?: number,

        charactersCharacterStatId?: number,
        characterStatId?: number,
        showTitle?: boolean,
      displayLinkImage?: boolean,
        color?: string,
        bgColor?: string,
        titleTextColor?: string,
        titleBgColor?: string,
        bodyTextColor?: string,
        bodyBgColor?: string,
        shape?: number,
        sortOrder?: number,
        view?: VIEW,
        imageUrl?: string,
        charactersCharacterStat?: CharactersCharacterStat
    ) {
        this.characterStatTileId = characterStatTileId;
        this.characterTileId = characterTileId;
        this.charactersCharacterStatId = charactersCharacterStatId;
        this.characterStatId = characterStatId;
        this.rulesetStatTileId = rulesetStatTileId;
        this.rulesetTileId = rulesetTileId;

        this.showTitle = showTitle;
      this.displayLinkImage = displayLinkImage;
        this.color = color;
        this.bgColor = bgColor;
        this.titleTextColor = titleTextColor;
        this.titleBgColor = titleBgColor;
        this.bodyTextColor = bodyTextColor;
        this.bodyBgColor = bodyBgColor;
        this.shape = shape;
        this.sortOrder = sortOrder;
        this.view = view;
        this.imageUrl = imageUrl;
        this.charactersCharacterStat = charactersCharacterStat;
    }

    public characterStatTileId: number;
    public characterTileId: number;
    public charactersCharacterStatId: number;
    public characterStatId: number;

    public rulesetStatTileId: number;
    public rulesetTileId: number;
    //public charactersCharacterStatId: number;

    public showTitle: boolean;
  public displayLinkImage: boolean;
    public color: string;
    public bgColor: string;
    public titleTextColor: string;
    public titleBgColor: string;
    public bodyTextColor: string;
    public bodyBgColor: string;
    public shape: number;
    public sortOrder: number;
    public view: VIEW;
    public imageUrl: string;
    public charactersCharacterStat: CharactersCharacterStat;
}


export class currentMax {
    current: string;
    max: string;
}
export class valSubVal {
    value: string;
    subValue: string;
}
export class choice {
    key: number;
    value: string;
    selected: boolean;
    isMultiSelect?: boolean;
}
export class characterStatChoices {
    characterStatChoiceId: number;
    characterStatId: number;
    isDeleted: boolean
    statChoiceValue: string
}

export class characterStatCalcs {

    characterStatCalcId: number;
    characterStatId: number;
    isDeleted: boolean
    statCalculation: string
}
export class characterStatCombo {

    characterStatCalcId: number;
    characterStatId: number;
    isDeleted: boolean
    statCalculation: string
}
