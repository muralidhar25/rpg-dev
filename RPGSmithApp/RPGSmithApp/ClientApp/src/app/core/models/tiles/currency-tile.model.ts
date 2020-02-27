import { VIEW } from "../enums";

export class CurrencyTile {
  constructor(
    currencyTypeTileId?: number,
    characterTileId?: number,    
    color?: string,
    bgColor?: string,
    titleTextColor?: string,
    titleBgColor?: string,
    bodyTextColor?: string,
    bodyBgColor?: string,
    shape?: number,
    sortOrder?: number,
    showTitle?: boolean,
    view?: VIEW,
    rulesetTileId?: number,
    title?: string,
    characterCurrency?: any[],
    isManual?: boolean,
    fontSize?: number,
    fontSizeTitle?: number
  ) {
    this.currencyTypeTileId = currencyTypeTileId;
    this.characterTileId = characterTileId;    
    this.showTitle = showTitle;
    this.color = color;
    this.bgColor = bgColor;
    this.titleTextColor = titleTextColor;
    this.titleBgColor = titleBgColor;
    this.bodyTextColor = bodyTextColor;
    this.bodyBgColor = bodyBgColor;
    this.shape = shape;
    this.sortOrder = sortOrder;
    this.view = view;
    this.rulesetTileId = rulesetTileId;
    this.title = title;
    this.characterCurrency = characterCurrency;
    this.isManual = isManual;
    this.fontSize = fontSize;
    this.fontSizeTitle = fontSizeTitle;
  }

  public currencyTypeTileId: number;
  public characterTileId: number;
  public rulesetTileId: number;
 
  public showTitle: boolean;
  public color: string;
  public bgColor: string;
  public titleTextColor: string;
  public titleBgColor: string;
  public bodyTextColor: string;
  public bodyBgColor: string;
  public shape: number;
  public sortOrder: number;
  public view: VIEW;
  public title: string;
  public characterCurrency: any[];

  public isManual: boolean;
  public fontSize: number;
  public fontSizeTitle: number;
}
