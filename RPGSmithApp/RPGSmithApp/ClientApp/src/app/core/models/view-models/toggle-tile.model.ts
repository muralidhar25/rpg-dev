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
    tileToggleViewModel?: TileToggle
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
    this.tileToggleViewModel = tileToggleViewModel;
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
  public tileToggleViewModel: TileToggle;
}


export class TileToggle {
  constructor(characterStatToggleId?: number, yesNo?: boolean, onOff?: boolean, showCheckbox?: boolean,
    display?: boolean, isCustom?: boolean, customToggles?: CustomTileToggle[]) {
    this.characterStatToggleId = characterStatToggleId;
    this.yesNo = yesNo;
    this.onOff = onOff;
    this.display = display;
    this.showCheckbox = showCheckbox;
    this.isCustom = isCustom;
    this.customTileToggles = customToggles;
  }
  public characterStatToggleId: number;
  public yesNo: boolean;
  public onOff: boolean;
  public display: boolean;
  public showCheckbox: boolean;
  public isCustom: boolean;
  public customTileToggles: CustomTileToggle[];
}

export class CustomTileToggle {
  constructor(customToggleId?: number, toggleText?: string, image?: string) {
    this.customToggleId = customToggleId;
    this.toggleText = toggleText;
    this.image = image;
  }
  public customToggleId: number;
  public toggleText: string;
  public image: string;
}
