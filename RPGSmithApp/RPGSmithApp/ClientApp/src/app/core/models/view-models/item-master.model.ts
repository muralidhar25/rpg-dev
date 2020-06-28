/// <reference path="item-master-spell.model.ts" />
import { VIEW } from '../enums';
import { itemMasterAbility } from '../view-models/item-master-ability.model';
import { itemMasterPlayer } from '../view-models/item-master-player.model';
import { itemMasterSpell } from '../view-models/item-master-spell.model';
import { Ruleset } from '../view-models/ruleset.model';
import { CommandVM } from '../view-models/commandVM.model';

export class ItemMaster {

  constructor(
    itemMasterId?: number, ruleSetId?: number, itemName?: string, itemImage?: string, itemStats?: string, itemVisibleDesc?: string,
    command?: string, commandName?: string, itemCalculation?: string, value?: number, volume?: number, weight?: number, commandVM?: CommandVM[],
    isContainer?: boolean, isMagical?: boolean, isConsumable?: boolean, containerWeightMax?: number, containerWeightModifier?: string, containerVolumeMax?: number,
    metatags?: string, rarity?: string, showIcon?: boolean, ruleset?: Ruleset, view?: VIEW, //associatedSpellId?: any[], associatedAbilityId?: any[],
    itemMasterAbilityVM?: itemMasterAbility[], itemMasterPlayerVM?: itemMasterPlayer[], itemMasterSpellVM?: itemMasterSpell[],
    currencyLabel?: string, weightLabel?: string, volumeLabel?: string, percentReduced?: number, totalWeightWithContents?: number, isBundle?: boolean,
    gmOnly?: string) {

    this.itemMasterId = itemMasterId;
    this.ruleSetId = ruleSetId;
    this.itemName = itemName;
    this.itemImage = itemImage;
    this.itemStats = itemStats;
    this.itemVisibleDesc = itemVisibleDesc;
    this.command = command;
    this.commandName = commandName;
    this.commandVM = commandVM;
    this.itemCalculation = itemCalculation;
    this.value = value;
    this.volume = volume;
    this.weight = weight;
    this.isContainer = isContainer;
    this.isMagical = isMagical;
    this.isConsumable = isConsumable;
    this.containerWeightMax = containerWeightMax;
    this.containerWeightModifier = containerWeightModifier;
    this.containerVolumeMax = containerVolumeMax;
    this.metatags = metatags;
    this.rarity = rarity;
    //this.associatedSpellId = associatedSpellId;
    //this.associatedAbilityId = associatedAbilityId;
    this.ruleSet = ruleset;
    this.itemMasterAbilityVM = itemMasterAbilityVM;
    this.itemMasterPlayerVM = itemMasterPlayerVM;
    this.itemMasterSpellVM = itemMasterSpellVM;
    this.showIcon = showIcon;
    this.view = view;
    this.percentReduced = percentReduced;
    this.totalWeightWithContents = totalWeightWithContents;

    this.currencyLabel = currencyLabel;
    this.weightLabel = weightLabel;
    this.volumeLabel = volumeLabel;
    this.isBundle = isBundle;
    this.gmOnly = gmOnly;
  }

  public itemMasterId: number;
  public ruleSetId: number;
  public itemName: string;
  public itemImage: string;
  public itemStats: string;
  public itemVisibleDesc: string;
  public command: string;
  public commandName: string;
  public commandVM: CommandVM[];
  public itemCalculation: string;
  public value: number;
  public volume: number;
  public weight: number;
  public isContainer: boolean;
  public isMagical: boolean;
  public isConsumable: boolean;
  public containerWeightMax: number;
  public containerWeightModifier: string;
  public containerVolumeMax: number;
  public metatags: string;
  public rarity: string;
  //public associatedSpellId: any[];
  //public associatedAbilityId: any[];
  public ruleSet: Ruleset;
  public itemMasterAbilityVM: itemMasterAbility[];
  public itemMasterPlayerVM: itemMasterPlayer[];
  public itemMasterSpellVM: itemMasterSpell[];
  public view: VIEW;
  public showIcon: boolean;

  public percentReduced: number;
  public totalWeightWithContents: number;

  public currencyLabel: string;
  public weightLabel: string;
  public volumeLabel: string;
  public isBundle: boolean;
  public gmOnly: string;
}


