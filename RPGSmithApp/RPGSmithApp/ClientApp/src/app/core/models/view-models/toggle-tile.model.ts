import { VIEW } from '../enums';

export class ToggleTile {
  constructor(toggleTileId?: number,
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
    view?: VIEW,
    tileToggle?: TileToggle,
    tileToggleId?: number,
    //onOff?: boolean,
    //yesNo?: boolean,
    //checkBox?: boolean,
    //customValue?: boolean,
    isManual?: boolean,
    fontSize?: number,
    fontSizeTitle?: number
  ) {
    this.toggleTileId = toggleTileId;
    this.characterTileId = characterTileId;
    this.rulesetTileId = rulesetTileId;
    this.title = title;
    this.color = color;
    this.bgColor = bgColor;
    this.titleTextColor = titleTextColor;
    this.titleBgColor = titleBgColor;
    this.bodyTextColor = bodyTextColor;
    this.bodyBgColor = bodyBgColor;
    this.shape = shape;
    this.sortOrder = sortOrder;
    this.view = view;
    this.tileToggleId = tileToggleId;
    this.tileToggle = tileToggle;
    this.isManual = isManual;
    this.fontSize = fontSize;
    this.fontSizeTitle = fontSizeTitle;
  }

  public toggleTileId: number;
  public characterTileId: number;
  public rulesetTileId: number;
  public title: string;
  public color: string;
  public bgColor: string;
  public titleTextColor: string;
  public titleBgColor: string;
  public bodyTextColor: string;
  public bodyBgColor: string;
  public shape: number;
  public sortOrder: number;
  public view: VIEW;
  public tileToggleId: number;
  public tileToggle: TileToggle;

  public isManual: boolean;
  public fontSize: number;
  public fontSizeTitle: number;
}


export class TileToggle {
  constructor(tileToggleId?: number, yesNo?: boolean, onOff?: boolean, showCheckbox?: boolean,
    display?: boolean, isCustom?: boolean, tileCustomToggles?: TileCustomToggle[]) {
    this.tileToggleId = tileToggleId;
    this.yesNo = yesNo;
    this.onOff = onOff;
    this.display = display;
    this.showCheckbox = showCheckbox;
    this.isCustom = isCustom;
    this.tileCustomToggles = tileCustomToggles;
  }
  public tileToggleId: number;
  //public characterStatToggleId: number;
  public yesNo: boolean;
  public onOff: boolean;
  public display: boolean;
  public showCheckbox: boolean;
  public isCustom: boolean;
  public tileCustomToggles: TileCustomToggle[];
}

export class TileCustomToggle {
  constructor(tileCustomToggleId?: number, toggleText?: string, image?: string) {
    this.tileCustomToggleId = tileCustomToggleId;
    this.toggleText = toggleText;
    this.image = image;
  }
  public tileCustomToggleId: number;
  public toggleText: string;
  public image: string;
}
