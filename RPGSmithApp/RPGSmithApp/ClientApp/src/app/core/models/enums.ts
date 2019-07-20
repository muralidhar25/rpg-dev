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
  Condition = "icon-CharStat-Condition"
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
  LinkRecord = 18,
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
  choice = 14
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
  Condition = "Condition",
  CharName = "CharName",
  CharDesc = "CharDesc"
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
  DX = "icon-Gen-dx",
  DECK = "icon-Dice-deck"
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
  TEXT = 8,
  BUFFANDEFFECT = 9,
  TOGGLE = 10
}

export enum TILE_ICON {
  TEXT = "icon-CharStat-Text",
  NOTE = "icon-note",
  IMAGE = "icon-image",
  COUNTER = "icon-counter",
  CHARACTERSTAT = "icon-attribute",
  LINK = "icon-link",
  EXECUTE = "icon-execute",
  COMMAND = "icon-dice",
  BUFFANDEFFECT = "icon-BnE",
  TOGGLE = "icon-CharStat-Yes-No"
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
  ABILITY = "ability",
  BUFFANDEFFECT = "be"
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
export enum BLOB_TYPE {
  blob = "rpgsmithsa.blob.core.windows.net",
  base64 = "data:image"
}
export enum DEVICE {
  COMPUTER = "Computer",
  TABLET = "Tablet",
  MOBILE = "Mobile",
}
export enum SearchType {
  RULESETITEMS = 1,
  CHARACTERITEMS = 2,
  RULESETSPELLS = 3,
  CHARACTERSPELLS = 4,
  RULESETABILITIES = 5,
  CHARACTERABILITIES = 6,
  CHARACTERRULESETITEMS = 7,
  CHARACTERRULESETSPELLS = 8,
  CHARACTERRULESETABILITIES = 9,
  EVERYTHING = -1
}

export enum CustomDiceResultType {
  NUMBER = 1,
  TEXT = 2,
  IMAGE = 3,
}

export enum MarketPlaceItemsType {
  GMPERMANENT = 1,
  GM_1_YEAR = 2,
  CAMPAIGN_SLOT = 3,
  PLAYER_SLOT = 4,
  CHARACTER_SLOT = 5,
  REMOVE_ADDS = 6,
  ADDITIONAL_STORAGE = 7,
  BUY_US_A_COFFEE = 8,
  RULESET_SLOT = 9
}

export enum Layout {
  SharedLayoutName = "Shared",
}

export enum CombatItemsType {
  CHARACTER = "character",
  MONSTER = "monster",
  ALL = "all",

}

export enum CombatMonsterTypeItems {
  MONSTER = 'monster',
  MONSTERTEMPLATE = 'monstertemplate',
  MONSTERGROUP = 'monsterGroup',

}

export enum combatantType {
  CHARACTER = "character",
  MONSTER = "monster"
}

export enum COMBAT_SETTINGS {
  PC_INITIATIVE_FORMULA = 1,
  ROLL_INITIATIVE_FOR_PLAYER_CHARACTERS = 2,
  ROLL_INITIATIVE_EVERY_ROUND = 3,
  IN_GAME_ROUND_LENGTH = 4,
  AUTO_XP_DISTRIBUTION_FOR_DELETED_MONSTERS = 5,
  CHARACTER_TARGET_XP_STAT = 6,
  CHARACTER_TARGET_HEALTH_STAT = 7,
  ACCESS_MONSTER_DETAILS = 8,
  GROUP_INITIATIVE = 9,
  GROUPINIT_FORMULA = 10,
  AUTO_DROP_ITEMS_FOR_DELETED_MONSTERS = 11,
  MONSTERS_ARE_VISIBLE_BY_DEFAULT = 12,
  DISPLAY_MONSTER_ROLL_RESULTS_IN_CHAT = 13,
  SHOW_MONSTER_HEALTH = 14,
  SEE_MONSTER_BUFFS_EFFECTS = 15,
  SEE_MONSTER_ITEMS = 16
}

export enum MonsterDetailType {
  HEALTH = "Health",
  RATING = "Challenge Rating",
  ARMOR = "Armor Class",
  INITIATIVE = "Initiative",
  XPVALUE="Xp Value"

}
