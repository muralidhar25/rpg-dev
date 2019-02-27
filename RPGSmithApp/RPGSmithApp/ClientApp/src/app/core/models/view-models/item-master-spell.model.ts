import { VIEW } from '../enums';

export class itemMasterSpell {
    constructor(itemMasterId?: number, spellId?: number) {
        this.itemMasterId = itemMasterId;
        this.spellId = spellId;
    }

    public itemMasterId: number;
    public spellId: number;
}
