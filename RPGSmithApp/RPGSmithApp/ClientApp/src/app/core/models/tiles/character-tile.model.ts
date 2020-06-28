import { VIEW } from '../enums';
import { NoteTile } from './note-tile.model';
import { CounterTile } from './counter-tile.model';
import { ImageTile } from './image-tile.model';
import { LinkTile } from './link-tile.model';
import { ExecuteTile } from './execute-tile.model';
import { CommandTile } from './command-tile.model';
import { CharacterStatTile } from './character-stat-tile.model';
import { TextTile } from './text-tile.model';
import { BuffAndEffectTile } from './buff-and-effect-tile.model';
import { ToggleTile } from '../view-models/toggle-tile.model';
import { CharacterStatClusterTile } from './character-stat-cluster-tile.model';
import { CurrencyTile } from './currency-tile.model';

export class CharacterTile {
  constructor(characterTileId?: number,
    tileTypeId?: number,
    characterDashboardPageId?: number,
    characterId?: number,
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
    multiCharacterStats?: characterStatIds[],
    buffAndEffectTile?: BuffAndEffectTile,
    toggleTile?: ToggleTile,
    characterStatClusterTile?: CharacterStatClusterTile,
    currencyTile?: CurrencyTile
  ) {
    this.characterTileId = characterTileId,
      this.tileTypeId = tileTypeId,
      this.characterDashboardPageId = characterDashboardPageId,
      this.characterId = characterId,
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
      this.multiCharacterStats = multiCharacterStats,
      this.buffAndEffectTile = buffAndEffectTile,
      this.toggleTile = toggleTile,
      this.characterStatClusterTile = characterStatClusterTile,
      this.currencyTile = currencyTile
  }

  public characterTileId: number;
  public tileTypeId: number;
  public characterDashboardPageId: number;
  public characterId: number;
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
  public buffAndEffectTile: BuffAndEffectTile;
  public toggleTile: ToggleTile;
  public characterStatClusterTile: CharacterStatClusterTile;
  public currencyTile: CurrencyTile;
}

export class characterStatIds {
  characterStatId: number;
  characterStatTypeId: number;
  image: string;
}


