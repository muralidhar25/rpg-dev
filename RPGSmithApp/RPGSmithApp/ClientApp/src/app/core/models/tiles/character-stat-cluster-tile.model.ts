import { VIEW } from '../enums';

export class CharacterStatClusterTile {
  constructor(characterStatClusterTileId?: number,
    characterTileId?: number,
    rulesetTileId?: number,
    title?: string,
    displayCharactersCharacterStatID?: number,
    color?: string,
    bgColor?: string,
    titleTextColor?: string,
    titleBgColor?: string,
    bodyTextColor?: string,
    bodyBgColor?: string,
    shape?: number,
    sortOrder?: number,
    clusterWithSortOrder?: string,
    view?: VIEW,
    isManual?: boolean,
    fontSize?: number,
    fontSizeTitle?: number
  ) {
    this.characterStatClusterTileId = characterStatClusterTileId;
    this.characterTileId = characterTileId;
    this.rulesetTileId = rulesetTileId;
    this.title = title;
    this.displayCharactersCharacterStatID = displayCharactersCharacterStatID;
    this.color = color;
    this.bgColor = bgColor;
    this.titleTextColor = titleTextColor;
    this.titleBgColor = titleBgColor;
    this.bodyTextColor = bodyTextColor;
    this.bodyBgColor = bodyBgColor;
    this.shape = shape;
    this.sortOrder = sortOrder;
    this.view = view;
    this.clusterWithSortOrder = clusterWithSortOrder;
    this.isManual = isManual;
    this.fontSize = fontSize;
    this.fontSizeTitle = fontSizeTitle;
  }

  public characterStatClusterTileId: number;
  public characterTileId: number;
  public rulesetTileId: number;
  public title: string;
  public displayCharactersCharacterStatID: number;
  public color: string;
  public bgColor: string;
  public titleTextColor: string;
  public titleBgColor: string;
  public bodyTextColor: string;
  public bodyBgColor: string;
  public shape: number;
  public sortOrder: number;
  public view: VIEW;
  public clusterWithSortOrder: string;

  public isManual: boolean;
  public fontSize: number;
  public fontSizeTitle: number;
}
