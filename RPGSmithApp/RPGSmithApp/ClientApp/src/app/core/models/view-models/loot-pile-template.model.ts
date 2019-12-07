import { randomization } from "./randomization.model ";

export class CreateLootPileTemplate {
  constructor(
    lootPileTemplateId?: number,
    ruleSetId?: number,
    name?: string,
    description?: string,
    imageUrl?: string,
    metatags?: string,
    characterID?: number,
    monsterID?: number,
    isDeleted?: boolean,
    lootTemplateRandomizationEngines?: randomization[],
    REitems?: any[],
    gmOnly?: string,
    gold?: string,
    silver?: string,
    copper?: string,
    platinum?: string,
    electrum?: string
  ) {
    this.lootPileTemplateId = lootPileTemplateId;
    this.ruleSetId = ruleSetId;
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.metatags = metatags;
    this.characterID = characterID;
    this.monsterID = monsterID;
    this.isDeleted = isDeleted;
    this.lootTemplateRandomizationEngines = lootTemplateRandomizationEngines;
    this.REitems = REitems;
    this.gmOnly = gmOnly;
    this.gold = gold;
    this.silver = silver;
    this.copper = copper;
    this.platinum = platinum;
    this.electrum = electrum;
  }

  public lootPileTemplateId: number;
  public ruleSetId: number;
  public name: string;
  public description: string;
  public imageUrl: string;
  public metatags: string;
  public characterID: number;
  public monsterID: number;
  public isDeleted: boolean;
  public lootTemplateRandomizationEngines: randomization[];
  public REitems: any[];
  public gmOnly: string;
  public gold: string;
  public silver: string;
  public copper: string;
  public platinum: string;
  public electrum: string;
}
