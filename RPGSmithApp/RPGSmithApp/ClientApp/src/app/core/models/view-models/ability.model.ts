import { VIEW } from '../enums';
import { itemMasterAbility } from '../view-models/item-master-ability.model';
import { itemMasterSpell } from '../view-models/item-master-spell.model';
import { Ruleset } from '../view-models/ruleset.model';
import { abilityCommand } from '../view-models/abilityCommand.model';

export class Ability {
    constructor(
        abilityId?: number, ruleSetId?: number, name?: string, level?: number, command?: string, maxNumberOfUses?: number,
        currentNumberOfUses?: number, description?: string, stats?: string, imageUrl?: string, abilityCommandVM?: abilityCommand[],
      isEnabled?: boolean, view?: VIEW, showIcon?: boolean, sortOrder?: number, ruleset?: Ruleset, metatags?: string,
      isFromCharacter?: boolean, isFromCharacterId?: number, abilityBuffAndEffectVM?: any[], gmOnly?: string
    ) {
        this.abilityId = abilityId;
        this.ruleSetId = ruleSetId;
        this.name = name;
        this.level = level;
        this.command = command;
        this.abilityCommandVM = abilityCommandVM;
        this.maxNumberOfUses = maxNumberOfUses;
        this.currentNumberOfUses = currentNumberOfUses;
        this.description = description;
        this.stats = stats;
        this.imageUrl = imageUrl;
        this.isEnabled = isEnabled;
        this.view = view;
        this.showIcon = showIcon;
        this.sortOrder = sortOrder;
        this.ruleset = ruleset;
        this.metatags = metatags;

        this.isFromCharacter = isFromCharacter;
      this.isFromCharacterId = isFromCharacterId;
      this.abilityBuffAndEffectVM = abilityBuffAndEffectVM;
      this.gmOnly = gmOnly;
    }

    public abilityId: number;
    public ruleSetId: number;
    public name: string;
    public level: number;
    public command: string;
    public abilityCommandVM: abilityCommand[];
    public maxNumberOfUses: number;
    public currentNumberOfUses: number;
    public description: string;
    public stats: string;
    public imageUrl: string;
    public isEnabled: boolean;
    public ruleset: Ruleset;
    public metatags: string;
    public view: VIEW;
    public showIcon: boolean;
    public sortOrder: number;

    public isFromCharacter: boolean;
  public isFromCharacterId: number;
  public abilityBuffAndEffectVM: any[];
  public gmOnly: string;
}
