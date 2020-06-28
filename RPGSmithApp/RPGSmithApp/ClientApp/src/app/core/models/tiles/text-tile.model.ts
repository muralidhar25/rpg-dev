import { VIEW } from '../enums';

export class TextTile {
  constructor(textTileId?: number,
    characterTileId?: number,
    rulesetTileId?: number,
    title?: string,
    text?: string,
    color?: string,
    bgColor?: string,
    titleTextColor?: string,
    titleBgColor?: string,
    bodyTextColor?: string,
    bodyBgColor?: string,
    shape?: number,
    sortOrder?: number,
    view?: VIEW,
    isManualTitle?: boolean,
    fontSizeTitle?: number,
    isManualText?: boolean,
    fontSizeText?: number
  ) {
    this.textTileId = textTileId;
    this.characterTileId = characterTileId;
    this.rulesetTileId = rulesetTileId;
    this.title = title;
    this.text = text;
    this.color = color;
    this.bgColor = bgColor;
    this.titleTextColor = titleTextColor;
    this.titleBgColor = titleBgColor;
    this.bodyTextColor = bodyTextColor;
    this.bodyBgColor = bodyBgColor;

    this.shape = shape;
    this.sortOrder = sortOrder;
    this.view = view;
    this.isManualTitle = isManualTitle;
    this.fontSizeTitle = fontSizeTitle;
    this.isManualText = isManualText;
    this.fontSizeText = fontSizeText;
  }

  public textTileId: number;
  public characterTileId: number;
  public rulesetTileId: number;
  public title: string;
  public text: string;
  public color: string;
  public bgColor: string;
  public titleTextColor: string;
  public titleBgColor: string;
  public bodyTextColor: string;
  public bodyBgColor: string;

  public shape: number;
  public sortOrder: number;
  public view: VIEW;

  public isManualTitle: boolean;
  public fontSizeTitle: number;
  public isManualText: boolean;
  public fontSizeText: number;
}
