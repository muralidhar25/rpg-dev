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
      itemList?: any[],
      gmOnly?: string,
      gold?: string,
      silver?: string,
      copper?: string,
      platinum?: string,
      electrum?: string
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
      this.gmOnly = gmOnly;
      this.gold = gold;
      this.silver = silver;
      this.copper = copper;
      this.platinum = platinum;
      this.electrum = electrum;
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
  public gmOnly: string;
  public gold: string;
  public silver: string;
  public copper: string;
  public platinum: string;
  public electrum: string;
}
