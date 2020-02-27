import { VIEW } from '../enums';

export class CounterTile {
  constructor(counterTileId?: number,
    characterTileId?: number,
    rulesetTileId?: number,
    title?: string,
    color?: string,
    bgColor?: string,
    titleTextColor?: string,
    titleBgColor?: string,
    bodyTextColor?: string,
    bodyBgColor?: string,
    shape?: number,
    sortOrder?: number,
    defaultValue?: number,
    currentValue?: number,
    maximum?: number,
    minimum?: number,
    step?: number,
    view?: VIEW,
    isManual?: boolean,
    fontSize?: number,
    fontSizeTitle?: number
  ) {
    this.counterTileId = counterTileId;
    this.characterTileId = characterTileId;
    this.rulesetTileId = rulesetTileId;
    this.title = title;
    this.defaultValue = defaultValue;
    this.currentValue = currentValue;
    this.maximum = maximum;
    this.minimum = minimum;
    this.step = step;
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
    this.fontSizeTitle = fontSizeTitle;
  }

  public counterTileId: number;
  public characterTileId: number;
  public rulesetTileId: number;
  public title: string;
  public defaultValue: number;
  public currentValue: number;
  public maximum: number;
  public minimum: number;
  public step: number;
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

