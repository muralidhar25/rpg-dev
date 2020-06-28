import { VIEW } from '../enums';

export class ImageTile {
  constructor(imageTileId?: number,
    characterTileId?: number,
    rulesetTileId?: number,
    title?: string,
    imageUrl?: string,
    color?: string,
    bgColor?: string,
    titleTextColor?: string,
    titleBgColor?: string,
    bodyTextColor?: string,
    bodyBgColor?: string,
    shape?: number,
    sortOrder?: number,
    view?: VIEW,
    isManual?: boolean,
    fontSize?: number,
    fontSizeTitle?: number
  ) {
    this.imageTileId = imageTileId;
    this.characterTileId = characterTileId;
    this.rulesetTileId = rulesetTileId;
    this.title = title;
    this.imageUrl = imageUrl;
    this.color = color;
    this.bgColor = bgColor;
    this.titleTextColor = titleTextColor;
    this.titleBgColor = titleBgColor;
    this.bodyTextColor = bodyTextColor;
    this.bodyBgColor = bodyBgColor;

    this.shape = shape;
    this.sortOrder = sortOrder;
    this.view = view;
    this.isManual = isManual;
    this.fontSize = fontSize;
    this.fontSizeTitle = fontSize;
  }

  public imageTileId: number;
  public characterTileId: number;
  public rulesetTileId: number;
  public title: string;
  public imageUrl: string;
  public color: string;
  public bgColor: string;
  public titleTextColor: string;
  public titleBgColor: string;
  public bodyTextColor: string;
  public bodyBgColor: string;

  public shape: number;
  public sortOrder: number;
  public view: VIEW;

  public isManual: boolean;
  public fontSize: number;
  public fontSizeTitle: number;
}
