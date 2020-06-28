import { VIEW } from "../enums";

export class BuffAndEffectTile {
  constructor(
    buffAndEffectTileId?: number,
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
    displayLinkImage?: boolean,
    view?: VIEW,
    multiBuffAndEffectsIds?: number[],
    rulesetTileId?: number,
    title?: string,
    isManual?: boolean,
    fontSize?: number,
    fontSizeTitle?: number
  ) {
    this.buffAndEffectTileId = buffAndEffectTileId;
    this.characterTileId = characterTileId;
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
    this.multiBuffAndEffectsIds = multiBuffAndEffectsIds;
    this.rulesetTileId = rulesetTileId;
    this.title = title;
    this.isManual = isManual;
    this.fontSize = fontSize;
    this.fontSizeTitle = fontSizeTitle;
  }

  public buffAndEffectTileId: number;
  public characterTileId: number;
  public rulesetTileId: number;

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
  public title: string;

  public multiBuffAndEffectsIds: number[];

  public isManual: boolean;
  public fontSize: number;
  public fontSizeTitle: number;
}
