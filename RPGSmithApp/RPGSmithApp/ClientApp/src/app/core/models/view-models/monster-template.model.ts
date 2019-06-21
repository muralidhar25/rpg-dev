import { VIEW } from '../enums';
import { Ruleset } from '../view-models/ruleset.model';
import { MonsterTemplateCommand } from './monster-template-command.model';

export class MonsterTemplate {
  constructor(
    monsterTemplateId?: number, ruleSetId?: number, name?: string, command?: string, description?: string, stats?: string, imageUrl?: string,
    monsterTemplateCommandVM?: MonsterTemplateCommand[], view?: VIEW, showIcon?: boolean, ruleset?: Ruleset, metatags?: string,
    health?: string, armorClass?: string, xPValue?: string, challangeRating?: string, initiativeCommand?: string, isRandomizationEngine?: boolean,
    monsterTemplateBuffAndEffectVM?: any[], monsterTemplateAbilityVM?: any[], monsterTemplateSpellVM?: any[], monsterTemplateAssociateMonsterTemplateVM?: any[]
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
  public monsterTemplateBuffAndEffects: any[];
  public monsterTemplateAbilities: any[];
  public monsterTemplateSpells: any[];
  public monsterTemplateAssociateMonsterTemplates: any[];
}