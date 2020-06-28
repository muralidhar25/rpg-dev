import { VIEW } from "../enums";
import { Ruleset } from "./ruleset.model";

export class Bundle {

  constructor(
    bundleId?: number, ruleSetId?: number, bundleName?: string, bundleImage?: string, bundleVisibleDesc?: string,
    value?: number, volume?: number, totalWeight?: number, ruleset?: Ruleset, view?: VIEW, currencyLabel?: string,
    metatags?: string, rarity?: string, weightLabel?: string, volumeLabel?: string, bundleItems?: BundleItems[],
    addToCombat?: boolean, gmOnly?: string
  ) {
    this.bundleId = bundleId;
    this.ruleSetId = ruleSetId;
    this.bundleName = bundleName;
    this.bundleImage = bundleImage;
    this.bundleVisibleDesc = bundleVisibleDesc;
    this.value = value;
    this.volume = volume;
    this.totalWeight = totalWeight;
    this.metatags = metatags;
    this.rarity = rarity;
    this.ruleSet = ruleset;
    this.view = view;
    this.weightLabel = weightLabel;
    this.currencyLabel = currencyLabel;
    this.volumeLabel = volumeLabel;
    this.bundleItems = bundleItems;
    this.addToCombat = addToCombat;
    this.gmOnly = gmOnly;
  }

  public bundleId: number;
  public ruleSetId: number;
  public bundleName: string;
  public bundleImage: string;
  public bundleVisibleDesc: string;
  public value: number;
  public volume: number;
  public totalWeight: number;
  public metatags: string;
  public rarity: string;
  public ruleSet: Ruleset;
  public view: VIEW;

  public weightLabel: string;
  public currencyLabel: string;
  public volumeLabel: string;
  public bundleItems: BundleItems[];

  public addToCombat: boolean;
  public gmOnly: string;
}

export class BundleItems {

  constructor(
    bundleItemId?: number, bundleId?: number, itemMasterId?: number, quantity?: number
  ) {
    this.bundleItemId = bundleItemId;
    this.bundleId = bundleId;
    this.itemMasterId = itemMasterId;
    this.quantity = quantity;
  }

  public bundleItemId: number;
  public bundleId: number;
  public itemMasterId: number;
  public quantity: number;
}
