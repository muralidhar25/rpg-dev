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
    charactersCharacterStat?: CharactersCharacterStat,
    isManual?: boolean,
    fontSize?: number,
    fontSizeTitle?: number
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

    this.isManual = isManual;
    this.fontSize = fontSize;
    this.fontSizeTitle = fontSizeTitle;
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

  public isManual: boolean;
  public fontSize: number;
  public fontSizeTitle: number;
}


export class currentMax {
  current: any;
  max: any;
}
export class valSubVal {
  value: any;
  subValue: any;
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
