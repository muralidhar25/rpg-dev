
export class RulesetRecordCount {
    constructor(spellCount?: number, itemMasterCount?: number, abilityCount?: number, characterStatCount?: number) {

        this.spellCount = spellCount;
        this.itemMasterCount = itemMasterCount;
        this.abilityCount = abilityCount;
        this.characterStatCount = characterStatCount;
    }

    public spellCount: number;
    public itemMasterCount: number;
    public abilityCount: number;
    public characterStatCount: number;

}

