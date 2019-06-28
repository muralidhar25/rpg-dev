import { VIEW } from "../enums";
import { Ruleset } from "./ruleset.model";

export class MonsterBundle {

  constructor(
    bundleId?: number, ruleSetId?: number, bundleName?: string, bundleImage?: string, bundleVisibleDesc?: string,
    ruleset?: Ruleset, view?: VIEW, metatags?: string, bundleItems?: MonsterBundleItems[]
  ) {
    this.bundleId = bundleId;
    this.ruleSetId = ruleSetId;
    this.bundleName = bundleName;
    this.bundleImage = bundleImage;
    this.bundleVisibleDesc = bundleVisibleDesc;
   
    
    this.metatags = metatags;
    
    this.ruleSet = ruleset;
    this.view = view;
   
    this.bundleItems = bundleItems;
  }

  public bundleId: number;
  public ruleSetId: number;
  public bundleName: string;
  public bundleImage: string;
  public bundleVisibleDesc: string;
 
  public metatags: string;
  public ruleSet: Ruleset;
  public view: VIEW;

  
  public bundleItems: MonsterBundleItems[];
}

export class MonsterBundleItems {

  constructor(
    bundleItemId?: number, bundleId?: number, monsterTemplateId?: number, quantity?: number
  ) {
    this.bundleItemId = bundleItemId;
    this.bundleId = bundleId;
    this.monsterTemplateId = monsterTemplateId;
    this.quantity = quantity;
  }

  public bundleItemId: number;
  public bundleId: number;
  public monsterTemplateId: number;
  public quantity: number;
}
