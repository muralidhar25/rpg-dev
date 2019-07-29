export class CreateLootPile {
    constructor(
      lootPileId?: number,
      ruleSetId?: number,
      name?: string,
      description?: string,
      imageUrl?: string,
      metatags?: string,
      visible?: boolean,
      characterID?: number,
      monsterID?: number,
      isDeleted?: boolean,
      itemList?: any[]
    ) {
      this.lootPileId = lootPileId;
      this.ruleSetId = ruleSetId;
      this.name = name;
      this.description = description;
      this.imageUrl = imageUrl;
      this.metatags = metatags;
      this.visible = visible;
      this.characterID = characterID;
      this.monsterID = monsterID;
      this.isDeleted = isDeleted;
      this.itemList = itemList;
    }

  public lootPileId: number;
  public ruleSetId: number;
  public name: string;
  public description: string;
  public imageUrl: string;
  public metatags: string;
  public visible: boolean
  public characterID: number;
  public monsterID: number;
  public isDeleted: boolean;
  public itemList: any[];
}
