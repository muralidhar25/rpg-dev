import { VIEW } from '../enums';
import { NoteTile } from './note-tile.model';
import { CounterTile } from './counter-tile.model';
import { ImageTile } from './image-tile.model';
import { LinkTile } from './link-tile.model';
import { ExecuteTile } from './execute-tile.model';
import { CommandTile } from './command-tile.model';
import { CharacterStatTile } from './character-stat-tile.model';
import { characterStatIds } from './character-tile.model';
import { TextTile } from './text-tile.model';

export class RulesetTile {
    constructor(rulesetTileId?: number,
        tileTypeId?: number,
        rulesetDashboardPageId?: number,
        rulesetId?: number,
        color?: string,
        bgColor?: string,
        shape?: number,
        sortOrder?: number,

        LocationX?: number,
        LocationY?: number,
        Height?: number,
        Width?: number,

        view?: VIEW,
        noteTile?: NoteTile,
        counterTile?: CounterTile,
        imageTile?: ImageTile,
        textTile?: TextTile,
        characterStatTile?: CharacterStatTile,
        linkTile?: LinkTile,
        executeTile?: ExecuteTile,
        commandTile?: CommandTile,
        multiCharacterStats?: characterStatIds[]

    ) {
        this.rulesetTileId = rulesetTileId,
            this.tileTypeId = tileTypeId,
            this.rulesetDashboardPageId = rulesetDashboardPageId,
            this.rulesetId = rulesetId,
            this.color = color,
            this.bgColor = bgColor,
            this.shape = shape,
            this.sortOrder = sortOrder,

            this.LocationX = LocationX,
            this.LocationY = LocationY,
            this.Height = Height,
            this.Width = Width,

            this.view = view,
            this.noteTile = noteTile,
            this.counterTile = counterTile,
            this.imageTile = imageTile,
            this.textTile = textTile,
            this.characterStatTile = characterStatTile,
            this.linkTile = linkTile,
            this.executeTile = executeTile,
            this.commandTile = commandTile,
            this.multiCharacterStats = multiCharacterStats
    }

    public rulesetTileId: number;
    public tileTypeId: number;
    public rulesetDashboardPageId: number;
    public rulesetId: number;
    public color: string;
    public bgColor: string;
    public shape: number;
    public sortOrder: number;

    public LocationX: number;
    public LocationY: number;
    public Height: number;
    public Width: number;

    public view: VIEW;
    public noteTile: NoteTile;
    public counterTile: CounterTile;
    public imageTile: ImageTile;
    public textTile: TextTile;
    public characterStatTile: CharacterStatTile;
    public linkTile: LinkTile;
    public executeTile: ExecuteTile;
    public commandTile: CommandTile;
    public multiCharacterStats: characterStatIds[];
}
