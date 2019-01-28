import { VIEW } from '../enums';

export class itemMasterPlayer {
    constructor(playerId?: string, itemMasterId?: number, isVisable?: boolean) {
        this.playerId = playerId;
        this.itemMasterId = itemMasterId;
        this.isVisable = isVisable;
    }

    public playerId: string;
    public itemMasterId: number;
    public isVisable: boolean;
}
