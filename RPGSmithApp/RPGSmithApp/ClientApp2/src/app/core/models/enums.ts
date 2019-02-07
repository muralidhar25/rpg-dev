// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

export enum Gender {
    None,
    Female,
    Male
}

export enum VIEW {
    ADD = "add",
    EDIT = "edit",
    DUPLICATE = "duplicate",
    MANAGE = "manage",
    IMPORT = "import"
}

export enum ICON {
    Text = "icon-CharStat-Text",
    RichText = "icon-text",
    Choice = "icon-choice",
    OnOff = "icon-on-off",
    YesNo = "icon-yes-no",
    Number = "icon-number",
    ValueSubValue = "icon-value-subval",
    CurrentMax = "icon-slider",
    Calculation = "icon-calculation",
    Command = "icon-dice",
    Toggle = "icon-yes-no",
    Combo = "icon-Charstat-Combo",
    LinkRecord = "icon-Tile-Link",
    Condition ="icon-CharStat-Condition"
}

export enum STAT_TYPE {
    Text = 1,
    RichText = 2,
    Number = 3,
    CurrentMax = 5,
    Choice = 6,
    ValueSubValue = 7,
    OnOff = 9,
    YesNo = 10,
    Calculation = 12,
    Command = 13,
    Toggle = 14,
    Combo = 15,
    LinkRecord=18,
    Condition = 19
}
export enum DefaultValue_STAT_TYPE {
    Text = 1,
    RichText = 2,
    Number = 3,
    Current = 4,
    Max = 5,
    Value = 6,
    SubValue = 7,
    Command = 8,

    OnOff = 9,
    YesNo = 10,
    Calculation = 11,    
    Toggle = 12,
    Combo = 12,
}
export enum STAT_NAME {
    Text = "Text",
    RichText = "RichText",
    Number = "Number",
    CurrentMax = "CurrentMax",
    Choice = "Choice",
    ValueSubValue = "ValueSubValue",
    OnOff = "OnOff",
    YesNo = "YesNo",
    Calculation = "Calculation",
    Command = "Command",
    Toggle = "Toggle",
    Combo = "Combo",
    InventoryWeight = "InventoryWeight",
    Condition = "Condition"
}

export enum TOGGLE_TYPE {
    DISPLAY = "display",
    YESNO = "yesno",
    ONOFF = "onoff",
    CUSTOM = "custom"
}

export enum DICE {
    D4 = 4,
    D6 = 6,
    D8 = 8,
    D10 = 10,
    D12 = 12,
    D20 = 20,
    D100 = 100
    //Dx = Dx
}

export enum DICE_ICON {
    D4 = "icon-d4-thin",
    D6 = "icon-d6-thin",
    D8 = "icon-d8-thin",
    D10 = "icon-d10-thin",
    D12 = "icon-d12-thin",
    D20 = "icon-d20-thin",
    D100 = "icon-d100-thin",
    DX = "icon-Gen-dx"
}

export enum COMMAND_OPERATOR {
    RU,
    RD,
    KL,
    KH,
    DL,
    DH
}
export enum IMAGE {
    WEB = "Web",
    STOCK = "Stock Images",
    MYIMAGES = "My Images"
}

export enum TILES {
    NOTE = 1,
    IMAGE = 2,
    COUNTER = 3,
    CHARACTERSTAT = 4,
    LINK = 5,
    EXECUTE = 6,
    COMMAND = 7,
    TEXT=8
}

export enum TILE_ICON {
    TEXT = "icon-CharStat-Text",
    NOTE = "icon-note",
    IMAGE = "icon-image",
    COUNTER = "icon-counter",
    CHARACTERSTAT = "icon-attribute",
    LINK = "icon-link",
    EXECUTE = "icon-execute",
    COMMAND = "icon-dice"
}
export enum ImageError {
    MESSAGE = "High resolution images will affect loading times and diminish performance. Do you still want to upload ?",
}

export enum SHAPE {
    SQUARE = 0,
    ROUNDED = 50,
    CIRCLE = 100
}

export enum SHAPE_CLASS {
    SQUARE = "square",
    ROUNDED = "rectangle",
    CIRCLE = "circle"
}
export enum STAT_LINK_TYPE {
    ITEM = "item",
    SPELL = "spell",
    ABILITY = "ability"
}
export enum CONDITION_OPERATOR_ENUM {
    EQUALS = "Equals",
    NOT_EQUALS = "Not equals",
    IS_BLANK = "Is blank",
    IS_NOT_BLANK = "Is not blank",
    CONTAINS = "Contains",
    DOES_NOT_CONTAIN = "Does not contain",
    GREATER_THAN = "Greater than",
    EQUAL_TO_OR_GREATER_THAN = "Equal to or greater than",
    LESS_THAN = "Less than",
    EQUAL_TO_OR_LESS_THAN = "Equal to or less than",
}
export enum FATE_DICE {
    plus = "+",
    zero = "",
    minus = "-"
}
