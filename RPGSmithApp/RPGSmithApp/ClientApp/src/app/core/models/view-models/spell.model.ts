import { VIEW } from '../enums';
import { itemMasterAbility } from '../view-models/item-master-ability.model';
import { itemMasterSpell } from '../view-models/item-master-spell.model';
import { Ruleset } from '../view-models/ruleset.model';
import { spellCommand } from '../view-models/spellCommand.model';

export class Spell {
    constructor(
        spellId?: number, ruleSetId?: number, name?: string, school?: string, class_?: string, levels?: string, command?: string, spellCommandVM?: spellCommand[],
        materialComponent?: string, isSomaticComponent?: boolean, isVerbalComponent?: boolean, castingTime?: number,
        description?: string, stats?: string, hitEffect?: string, missEffect?: string, effectDescription?: string,
        shouldCast?: boolean, imageUrl?: string, memorized?: boolean, metatags?: string, isMaterialComponent?: boolean,
      view?: VIEW, showIcon?: boolean, sortOrder?: number, ruleset?: Ruleset, isFromCharacter?: boolean, isFromCharacterId?: number, spellBuffAndEffectVM?: any[],
      gmOnly?: string
    ) {
        this.spellId = spellId;
        this.ruleSetId = ruleSetId;
        this.name = name;
        this.school = school;
        this.class = class_;
        this.levels = levels;
        this.command = command;
        this.spellCommandVM = spellCommandVM;
        this.materialComponent = materialComponent;
        this.isMaterialComponent = isMaterialComponent;
        this.isSomaticComponent = isSomaticComponent;
        this.isVerbalComponent = isVerbalComponent;
        this.castingTime = castingTime;
        this.description = description;
        this.stats = stats;
        this.hitEffect = hitEffect;
        this.missEffect = missEffect;
        this.effectDescription = effectDescription;
        this.shouldCast = shouldCast;
        this.imageUrl = imageUrl;
        this.memorized = memorized;
        this.view = view;
        this.showIcon = showIcon;
        this.sortOrder = sortOrder;
        this.ruleset = ruleset;
        this.metatags = metatags;
        //this.itemMasterSpellVM = itemMasterSpellVM;

        this.isFromCharacter = isFromCharacter;
      this.isFromCharacterId = isFromCharacterId;
      this.spellBuffAndEffectVM = spellBuffAndEffectVM;
      this.gmOnly = gmOnly;
    }
    public spellId: number;
    public ruleSetId: number;
    public name: string;
    public school: string;
    public class: string;
    public levels: string;
    public command: string;
    public spellCommandVM: spellCommand[];
    public materialComponent: string;
    public castingTime: number;
    public description: string;
    public stats: string;
    public hitEffect: string;
    public missEffect: string;
    public effectDescription: string;
    public imageUrl: string;
    public isMaterialComponent: boolean;
    public isSomaticComponent: boolean;
    public isVerbalComponent: boolean;
    public shouldCast: boolean;
    public memorized: boolean;
    public view: VIEW;
    public showIcon: boolean;
    public sortOrder: number;
    public ruleset: Ruleset;
    public metatags: string;
    //public itemMasterSpellVM: itemMasterSpell[];

    public isFromCharacter: boolean;
  public isFromCharacterId: number;
  public spellBuffAndEffectVM: any[];
  public gmOnly: string;

}

