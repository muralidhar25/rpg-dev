import { VIEW } from '../enums';
import { RulesetRecordCount } from '../view-models/ruleset-record-count.model';
import { CurrencyViewModel } from './currency-view-model.model';

export class Ruleset {

  constructor(ruleSetId?: number, ruleSetName?: string, ruleSetDesc?: string, isActive?: boolean, userId?: string, ruleSetImage?: string,
    defaultDice?: string, currencyLabel?: string, weightLabel?: string, distanceLabel?: string, volumeLabel?: string,
    view?: VIEW, showIcon?: boolean, sortOrder?: number, isCoreContent?: boolean, parentRuleSetId?: number,
    imageUrl?: string, thumbnailUrl?: string, recordCount?: RulesetRecordCount, shareCode?: string,
    isItemEnabled?: boolean, isSpellEnabled?: boolean, isAbilityEnabled?: boolean, isAllowSharing?: boolean, isAdmin?: boolean, isBuffAndEffectEnabled?: boolean,
    currencyName?: string, currencyWeight?: number, currencyBaseUnit?: number, currencyVM?: CurrencyViewModel[], 
  ) {

    this.ruleSetId = ruleSetId;
    this.ruleSetName = ruleSetName;
    this.ruleSetDesc = ruleSetDesc;
    this.isActive = isActive;
    this.defaultDice = defaultDice;
    this.currencyLabel = currencyLabel;
    this.weightLabel = weightLabel;
    this.distanceLabel = distanceLabel;
    this.volumeLabel = volumeLabel;
    this.userId = userId;
    this.ruleSetImage = ruleSetImage;
    this.sortOrder = sortOrder;
    this.view = view;
    this.showIcon = showIcon;
    this.isCoreContent = isCoreContent;
    this.parentRuleSetId = parentRuleSetId;
    this.parentRuleSetId = parentRuleSetId;
    this.parentRuleSetId = parentRuleSetId;
    this.imageUrl = imageUrl;
    this.thumbnailUrl = thumbnailUrl;
    this.recordCount = recordCount;
    this.isItemEnabled = isItemEnabled;
    this.isSpellEnabled = isSpellEnabled;
    this.isAbilityEnabled = isAbilityEnabled;
    this.isBuffAndEffectEnabled = isBuffAndEffectEnabled;

    this.isAllowSharing = isAllowSharing;
    this.isAdmin = isAdmin;
    this.shareCode = shareCode;
    this.currencyName = currencyName;
    this.currencyWeight = currencyWeight;
    this.currencyBaseUnit = currencyBaseUnit;
    this.currencyVM = currencyVM;
  }

  public ruleSetId: number;
  public ruleSetName: string;
  public isActive: boolean;
  public userId: string;
  public ruleSetDesc: string;
  public defaultDice: string;
  public currencyLabel: string;
  public weightLabel: string;
  public distanceLabel: string;
  public volumeLabel: string;
  public ruleSetImage: string;
  public sortOrder: number;
  public view: VIEW;
  public showIcon: boolean;
  public isCoreContent: boolean;
  public parentRuleSetId: number;
  public imageUrl: string;
  public thumbnailUrl: string;
  public recordCount: RulesetRecordCount;
  public isItemEnabled: boolean;
  public isSpellEnabled: boolean;
  public isAbilityEnabled: boolean;
  public isBuffAndEffectEnabled: boolean;
  public isAllowSharing: boolean;
  public isAdmin: boolean;
  public shareCode: string;
  public currencyName: string;
  public currencyWeight: number;
  public currencyBaseUnit: number;
  public currencyVM: CurrencyViewModel[];
}

// export enum VIEW {
//     ADD = "add",
//     EDIT = "edit",
//     DUPLICATE = "duplicate",
//     MANAGE = "manage"
// }
