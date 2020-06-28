import { VIEW } from "../enums";

export class ExecuteTile {
  constructor(executeTileId?: number,
    characterTileId?: number,
    linkType?: string,
    spellId?: number,
    abilityId?: number,
    buffAndEffectId?: number,
    allyId?: number,
    itemId?: number,
    color?: string,
    bgColor?: string,
    titleTextColor?: string,
    titleBgColor?: string,
    bodyTextColor?: string,
    bodyBgColor?: string,

    shape?: number,
    sortOrder?: number,
    commandId?: number,
    showTitle?: boolean,
    displayLinkImage?: boolean,
    view?: VIEW,
    multiSpellIds?: number[],
    multiAbilityIds?: number[],
    multiItemIds?: number[],
    multiBuffAndEffectIds?: number[],
    multiAllyIds?: number[],
    isManual?: boolean,
    fontSize?: number,
    fontSizeTitle?: number
  ) {
    this.executeTileId = executeTileId;
    this.characterTileId = characterTileId;
    this.linkType = linkType;
    this.spellId = spellId;
    this.abilityId = abilityId;
    this.buffAndEffectId = buffAndEffectId;
    this.allyId = allyId;
    this.itemId = itemId;
    this.showTitle = showTitle;
    this.displayLinkImage = displayLinkImage;
    this.commandId = commandId;
    this.color = color;
    this.bgColor = bgColor;
    this.titleTextColor = titleTextColor;
    this.titleBgColor = titleBgColor;
    this.bodyTextColor = bodyTextColor;
    this.bodyBgColor = bodyBgColor;

    this.shape = shape;
    this.sortOrder = sortOrder;
    this.view = view;
    this.multiSpellIds = multiSpellIds;
    this.multiAbilityIds = multiAbilityIds;
    this.multiItemIds = multiItemIds;
    this.multiBuffAndEffectIds = multiBuffAndEffectIds;
    this.multiAllyIds = multiAllyIds;
    this.isManual = isManual;
    this.fontSize = fontSize;
    this.fontSizeTitle = fontSizeTitle;
  }

  public executeTileId: number;
  public characterTileId: number;
  public linkType: string;
  public spellId: number;
  public abilityId: number;
  public buffAndEffectId: number;
  public allyId: number;
  public itemId: number;
  public showTitle: boolean;
  public commandId: number;
  public color: string;
  public bgColor: string;
  public titleTextColor: string;
  public titleBgColor: string;
  public bodyTextColor: string;
  public bodyBgColor: string;
  public displayLinkImage: boolean;
  public shape: number;
  public sortOrder: number;
  public view: VIEW;
  public multiSpellIds: number[];
  public multiAbilityIds: number[];
  public multiItemIds: number[];
  public multiBuffAndEffectIds: number[];
  public multiAllyIds: number[];
  public isManual: boolean;
  public fontSize: number;
  public fontSizeTitle: number;
}
