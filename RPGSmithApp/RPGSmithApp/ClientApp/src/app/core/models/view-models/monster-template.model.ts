import { VIEW } from '../enums';
import { Ruleset } from '../view-models/ruleset.model';
import { MonsterTemplateCommand } from './monster-template-command.model';
import { randomization } from './randomization.model ';
import { randomizationSearch } from './randomizationSearch.model';

export class MonsterTemplate {
  constructor(
    monsterTemplateId?: number, ruleSetId?: number, name?: string, command?: string, description?: string, stats?: string, imageUrl?: string,
    monsterTemplateCommandVM?: MonsterTemplateCommand[], view?: VIEW, showIcon?: boolean, ruleset?: Ruleset, metatags?: string,
    health?: string, armorClass?: string, xPValue?: string, challangeRating?: string, initiativeCommand?: string, isRandomizationEngine?: boolean,
    monsterTemplateBuffAndEffectVM?: any[], monsterTemplateAbilityVM?: any[], monsterTemplateSpellVM?: any[], monsterTemplateAssociateMonsterTemplateVM?: any[],
    monsterHealthCurrent?: number,
    monsterHealthMax?: number,
    monsterArmorClass?: number,
    monsterChallangeRating?: number,
    monsterXPValue?: number, monsterTemplateItemMasterVM?: any[],
    monsterImage?: string,
    monsterName?: string,
    monsterMetatags?: string,
    monsterId?: number,
    addToCombatTracker?: boolean,
    isBundle?: boolean,
    monsterTemplateItemVM?: any[],
    randomizationEngine?: randomization[],
    REitems?: any[],
    gmOnly?: string,
    gold?: string,
    silver?: string,
    copper?: string,
    platinum?: string,
    electrum?: string,
    monsterTemplateCurrency?: any[],
    monsterCurrency?: any[],
    randomizationSearchEngine?: randomizationSearch[]
  ) {
    this.monsterTemplateId = monsterTemplateId;
    this.ruleSetId = ruleSetId;
    this.name = name;
    this.command = command;
    this.monsterTemplateCommandVM = monsterTemplateCommandVM;
    this.description = description;
    this.stats = stats;
    this.imageUrl = imageUrl;
    this.view = view;
    this.showIcon = showIcon;
    this.ruleset = ruleset;
    this.metatags = metatags;
    this.health = health;
    this.armorClass = armorClass;
    this.xPValue = xPValue;
    this.challangeRating = challangeRating;
    this.initiativeCommand = initiativeCommand;
    this.isRandomizationEngine = isRandomizationEngine;
    this.monsterTemplateBuffAndEffectVM = monsterTemplateBuffAndEffectVM;
    this.monsterTemplateAbilityVM = monsterTemplateAbilityVM;
    this.monsterTemplateSpellVM = monsterTemplateSpellVM;
    this.monsterTemplateAssociateMonsterTemplateVM = monsterTemplateAssociateMonsterTemplateVM;
    this.monsterTemplateItemMasterVM = monsterTemplateItemMasterVM;
    this.monsterHealthCurrent = monsterHealthCurrent;
    this.monsterHealthMax = monsterHealthMax;
    this.monsterArmorClass = monsterArmorClass;
    this.monsterChallangeRating = monsterChallangeRating;
    this.monsterXPValue = monsterXPValue;
    this.monsterImage = monsterImage;
    this.monsterName = monsterName;
    this.monsterMetatags = monsterMetatags;
    this.monsterId = monsterId;
    this.addToCombatTracker = addToCombatTracker;
    this.isBundle = isBundle;
    this.monsterTemplateItemVM = monsterTemplateItemVM;
    this.randomizationEngine = randomizationEngine;
    this.REitems = REitems;
    this.gmOnly = this.gmOnly;
    this.gold = gold;
    this.silver = silver;
    this.copper = copper;
    this.platinum = platinum;
    this.electrum = electrum;
    this.monsterTemplateCurrency = monsterTemplateCurrency;
    this.monsterCurrency = monsterCurrency;
    this.randomizationSearchEngine = randomizationSearchEngine;
  }

  public monsterTemplateId: number;
  public ruleSetId: number;
  public name: string;
  public command: string;
  public monsterTemplateCommandVM: MonsterTemplateCommand[];
  public description: string;
  public stats: string;
  public imageUrl: string;
  public ruleset: Ruleset;
  public metatags: string;
  public view: VIEW;
  public showIcon: boolean;
  public health: string;
  public armorClass: string;
  public xPValue: string;
  public challangeRating: string;
  public initiativeCommand: string;
  public isRandomizationEngine: boolean;
  public monsterTemplateBuffAndEffectVM: any[];
  public monsterTemplateAbilityVM: any[];
  public monsterTemplateSpellVM: any[];
  public monsterTemplateAssociateMonsterTemplateVM: any[];
  public monsterTemplateItemMasterVM: any[];  
  public monsterTemplateBuffAndEffects: any[];
  public monsterTemplateAbilities: any[];
  public monsterTemplateSpells: any[];
  public monsterTemplateAssociateMonsterTemplates: any[];
  public monsterTemplateItemMasters: any[];
  public monsterHealthCurrent: number;
  public monsterHealthMax: number;
  public monsterArmorClass: number;
  public monsterChallangeRating: number;
  public monsterXPValue: number;
  public monsterImage: string;
  public monsterName: string;
  public monsterMetatags: string;
  public monsterId: number;
  public addToCombatTracker: boolean;
  public isBundle: boolean;
  public monsterTemplateItemVM: any[];
  public randomizationEngine: randomization[];
  public REitems: any[];
  public gmOnly: string;
  public gold: string;
  public silver: string;
  public copper: string;
  public platinum: string;
  public electrum: string;
  public monsterTemplateCurrency?: any[];
  public monsterCurrency?: any[];
  public randomizationSearchEngine: randomizationSearch[];
  //public monsterImage: string;
  //public monsterName: string;
  //public monsterMetatags: string;

}
