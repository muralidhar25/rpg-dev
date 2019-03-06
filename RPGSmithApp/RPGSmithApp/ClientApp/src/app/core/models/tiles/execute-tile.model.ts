import { VIEW } from "../enums";

export class ExecuteTile {
    constructor(executeTileId?: number,
        characterTileId?: number,
        linkType?: string,
        spellId?: number,
        abilityId?: number,
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
        view?: VIEW,
        multiSpellIds?: number[],
        multiAbilityIds?: number[],
        multiItemIds?: number[],
    ) {
        this.executeTileId = executeTileId;
        this.characterTileId = characterTileId;
        this.linkType = linkType;
        this.spellId = spellId;
        this.abilityId = abilityId;
        this.itemId = itemId;
        this.showTitle = showTitle;
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
    }

    public executeTileId: number;
    public characterTileId: number;
    public linkType: string;
    public spellId: number;
    public abilityId: number;
    public itemId: number;
    public showTitle: boolean;
    public commandId: number;
    public color: string;
    public bgColor: string;
    public titleTextColor: string;
    public titleBgColor: string;
    public bodyTextColor: string;
    public bodyBgColor: string;

    public shape: number;
    public sortOrder: number;
    public view: VIEW;
    public multiSpellIds: number[];
    public multiAbilityIds: number[];
    public multiItemIds: number[];
}