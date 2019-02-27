
import { NoteTile } from '../tiles/note-tile.model';
import { ImageTile } from '../tiles/image-tile.model';
import { CounterTile } from '../tiles/counter-tile.model';
import { CharacterStats } from './character-stats.model';
import { ExecuteTile } from '../tiles/execute-tile.model';
import { LinkTile } from '../tiles/link-tile.model';
import { CommandTile } from '../tiles/command-tile.model';

export class Tile {
    constructor(
        TileTypeId?: number, CharacterDashboardPageId?: number, CharacterId?: number, Color?: string, Shape?: string, LocationX?: number, LocationY?: number, Height?: number, Width?: number, NoteTile?: NoteTile[],
        IsDeleted?: boolean, ImageTile?: ImageTile[], CounterTile?: CounterTile[], CharacterStatTile?: CharacterStats[],
        ExecuteTile?: ExecuteTile[], LinkTile?: LinkTile[], CommandTile?: CommandTile[]
    ) {
        this.tileTypeId = TileTypeId;
        this.characterDashboardPageId = CharacterDashboardPageId;
        this.characterId = CharacterId;
        this.color = Color;
        this.shape = Shape;
        this.locationX = LocationX;
        this.locationY = LocationY;
        this.height = Height;
        this.width = Width;
        this.isDeleted = IsDeleted;
        this.noteTile = NoteTile;
        this.imageTile = ImageTile;
        this.counterTile = CounterTile;
        this.characterStatTile = CharacterStatTile;
        this.executeTile = ExecuteTile;
        this.linkTile = LinkTile;
        this.commandTile = CommandTile;
        
        //this.itemMasterSpellVM = itemMasterSpellVM;

        
    }
    public tileTypeId: number;
    public characterDashboardPageId: number;
    public characterId: number;
    public color: string;
    public shape: string;
    public locationX : number;
    public locationY: number;
    public height: number;
    public width: number;
    public isDeleted: boolean;
    public noteTile: NoteTile[];
    public imageTile: ImageTile[];
    public counterTile: CounterTile[];
    public characterStatTile: CharacterStats[];
    public executeTile: ExecuteTile[];
    public linkTile: LinkTile[];
    public commandTile: CommandTile[];
    
}

