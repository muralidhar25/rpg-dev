
export class RulesetRecordCount {
  constructor(
    spellCount?: number,
    itemMasterCount?: number,
    abilityCount?: number,
    characterStatCount?: number,
    lootCount? : number
  ) {

        this.spellCount = spellCount;
        this.itemMasterCount = itemMasterCount;
        this.abilityCount = abilityCount;
        this.characterStatCount = characterStatCount;
        this.lootCount = lootCount;

    }

    public spellCount: number;
    public itemMasterCount: number;
    public abilityCount: number;
    public characterStatCount: number;
    public lootCount: number;
}

