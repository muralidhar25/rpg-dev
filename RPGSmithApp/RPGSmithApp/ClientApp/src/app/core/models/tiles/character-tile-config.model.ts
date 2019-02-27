export class TileConfig {
    constructor(
        characterTileId?: number,
        //rulesetTileId?: number,
        payload?: number,
        col?: number,
        row?: number,
        sizeX?: number,
        sizeY?: number,
    ) {
        this.characterTileId = characterTileId,
        //this.rulesetTileId = rulesetTileId,
        this.payload = payload,
        this.col = col,
        this.row = row,
        this.sizeX = sizeX,
        this.sizeY = sizeY
    }

    public characterTileId: number;
    //public rulesetTileId: number;
    public payload: number;
    public col: number;
    public row: number;
    public sizeX: number;
    public sizeY: number;
}

