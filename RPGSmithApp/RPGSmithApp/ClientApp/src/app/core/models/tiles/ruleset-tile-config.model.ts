export class RulesetTileConfig {
    constructor(
        rulesetTileId?: number,
        payload?: number,
        col?: number,
        row?: number,
        sizeX?: number,
        sizeY?: number,
    ) {
       this.rulesetTileId = rulesetTileId,
        this.payload = payload,
        this.col = col,
        this.row = row,
        this.sizeX = sizeX,
        this.sizeY = sizeY
    }

    public rulesetTileId: number;
    public payload: number;
    public col: number;
    public row: number;
    public sizeX: number;
    public sizeY: number;
}

