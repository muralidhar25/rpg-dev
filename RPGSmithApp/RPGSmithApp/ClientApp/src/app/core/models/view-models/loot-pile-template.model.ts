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
      REitems?: any[]
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
}
