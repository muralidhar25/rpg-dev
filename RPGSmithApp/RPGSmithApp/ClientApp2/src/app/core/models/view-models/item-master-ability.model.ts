import { VIEW } from '../enums';

export class itemMasterAbility {
    constructor(itemMasterId?: number, abilityId?: number) {
        this.itemMasterId = itemMasterId;
        this.abilityId = abilityId;
    }

    public itemMasterId: number;
    public abilityId: number;
}
