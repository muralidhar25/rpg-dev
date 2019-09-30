import { VIEW } from '../enums';
import { Ruleset } from '../view-models/ruleset.model';
import { BuffAndEffectCommand } from './buff-and-effect-command.model';

export class BuffAndEffect {
  constructor(
    buffAndEffectId?: number, ruleSetId?: number, name?: string, command?: string, description?: string, stats?: string, imageUrl?: string,
    buffAndEffectCommandVM?: BuffAndEffectCommand[], view?: VIEW, showIcon?: boolean, sortOrder?: number, ruleset?: Ruleset,
    metatags?: string, isFromCharacter?: boolean, isFromCharacterId?: number, gmOnly?: string
  ) {
    this.buffAndEffectId = buffAndEffectId;
    this.ruleSetId = ruleSetId;
    this.name = name;
    this.command = command;
    this.buffAndEffectCommandVM = buffAndEffectCommandVM;
    this.description = description;
    this.stats = stats;
    this.imageUrl = imageUrl;
    this.view = view;
    this.showIcon = showIcon;
    this.sortOrder = sortOrder;
    this.ruleset = ruleset;
    this.metatags = metatags;

    this.isFromCharacter = isFromCharacter;
    this.isFromCharacterId = isFromCharacterId;
    this.gmOnly = gmOnly;
  }

  public buffAndEffectId: number;
  public ruleSetId: number;
  public name: string;
  public command: string;
  public buffAndEffectCommandVM: BuffAndEffectCommand[];
  public description: string;
  public stats: string;
  public imageUrl: string;
  public ruleset: Ruleset;
  public metatags: string;
  public view: VIEW;
  public showIcon: boolean;
  public sortOrder: number;
  public isFromCharacter: boolean;
  public isFromCharacterId: number;
  public gmOnly: string;
}
