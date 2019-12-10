import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../core/models/view-models/ruleset.model';
import { CharacterDashboardPage } from '../core/models/view-models/character-dashboard-page.model';
import { CharacterDashboardPageService } from '../core/services/character-dashboard-page.service';
import { TILES, TILE_ICON, VIEW } from '../core/models/enums';
import { NoteTileComponent } from './note/note.component';
import { ImageTileComponent } from './image/image.component';
import { CounterTileComponent } from './counter/counter.component';
import { Characters } from '../core/models/view-models/characters.model';
import { CharacterStatTileComponent } from './character-stat/character-stat.component';
import { LinkTileComponent } from './link/link.component';
import { ExecuteTileComponent } from './execute/execute.component';
import { CommandTileComponent } from './command/command.component';
import { TextTileComponent } from './text/text.component';
import { PlatformLocation } from '@angular/common';
import { BuffAndEffectTileComponent } from './buff-and-effect/buff-and-effect.component';
import { ToggleTileComponent } from './toggle/toggle.component';
import { CharacterStatClusterTileComponent } from './character-stat-cluster/character-stat-cluster.component';
import { CurrencyTileComponent } from './currency/currency.component';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();

  ruleSet: any = new Ruleset();
  tiles: any;
  characterId: any;
  pageId: number;
  pageDefaultData = new CharacterDashboardPage();

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService
    , private pageService: CharacterDashboardPageService
    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.pageId = this.bsModalRef.content.pageId;
      this.characterId = this.bsModalRef.content.characterId;
      this.ruleSet = this.bsModalRef.content.ruleSet;
      this.getTiles();
      this.Initialize();
    }, 0);
  }

  private Initialize() {
    if (this.pageId) {
      this.pageService.getCharacterDashboardPageById<any>(this.pageId)
        .subscribe(data => {
          // console.log(data);
          this.pageDefaultData = data;
        }, error => {
        }, () => { });
    }
  }

  //getTiles() {
  //  this.tiles = [
  //    { tileName: 'TEXT', tileTypeId: TILES.TEXT, icon: TILE_ICON.TEXT },
  //    { tileName: 'NOTE', tileTypeId: TILES.NOTE, icon: TILE_ICON.NOTE },
  //    { tileName: 'IMAGE', tileTypeId: TILES.IMAGE, icon: TILE_ICON.IMAGE },
  //    { tileName: 'COUNTER', tileTypeId: TILES.COUNTER, icon: TILE_ICON.COUNTER },
  //    { tileName: 'TOGGLE', tileTypeId: TILES.TOGGLE, icon: TILE_ICON.TOGGLE },
  //    { tileName: 'CHARACTER STAT', tileTypeId: TILES.CHARACTERSTAT, icon: TILE_ICON.CHARACTERSTAT },
  //    { tileName: 'CHAR STAT CLUSTER', tileTypeId: TILES.CHARACTERSTATCLUSTER, icon: TILE_ICON.CHARACTERSTATCLUSTER },      
  //  ];
  //  if (this.ruleSet.isBuffAndEffectEnabled) {
  //    this.tiles.push({ tileName: 'BUFFS & EFFECTS', tileTypeId: TILES.BUFFANDEFFECT, icon: TILE_ICON.BUFFANDEFFECT });
  //  }
  //  if (this.ruleSet.isItemEnabled || this.ruleSet.isAbilityEnabled || this.ruleSet.isSpellEnabled || this.ruleSet.isBuffAndEffectEnabled) {
  //    this.tiles.push({ tileName: 'LINK', tileTypeId: TILES.LINK, icon: TILE_ICON.LINK });
  //    this.tiles.push({ tileName: 'EXECUTE', tileTypeId: TILES.EXECUTE, icon: TILE_ICON.EXECUTE });
  //  }
    
  //  this.tiles.push({ tileName: 'COMMAND', tileTypeId: TILES.COMMAND, icon: TILE_ICON.COMMAND });
  //}

  getTiles() {
    this.tiles = [
      { tileName: 'CHARACTER STAT', tileTypeId: TILES.CHARACTERSTAT, icon: TILE_ICON.CHARACTERSTAT, tooltip:"Displays the value of a given character stat. Selecting the tile will launch an interface to update this value in most cases." },
      { tileName: 'TEXT', tileTypeId: TILES.TEXT, icon: TILE_ICON.TEXT, tooltip:"Used to display a small amount of text. This text can also include character stat variables if desired. [InventoryWeight] for example." },
      { tileName: 'NOTE', tileTypeId: TILES.NOTE, icon: TILE_ICON.NOTE, tooltip: "Store and display a large amount rich text content with this tile." },
      { tileName: 'IMAGE', tileTypeId: TILES.IMAGE, icon: TILE_ICON.IMAGE, tooltip: "Display an Image with this tile. Selecting the tile will launch a larger view of the image." },
      { tileName: 'CHAR STAT CLUSTER', tileTypeId: TILES.CHARACTERSTATCLUSTER, icon: TILE_ICON.CHARACTERSTATCLUSTER, tooltip: "When selected, this tile will display several character stats as configured. The tile itself can display 1 character stat or some provided text." },
      { tileName: 'COMMAND', tileTypeId: TILES.COMMAND, icon: TILE_ICON.COMMAND, tooltip: "Create a command and store it in this tile. Selecting this tile will execute the stored command instantly." },
      { tileName: 'COUNTER', tileTypeId: TILES.COUNTER, icon: TILE_ICON.COUNTER, tooltip: "Display a numeric value in this tile. Selecting the tile will allow you to update the value of this number." },
      { tileName: 'TOGGLE', tileTypeId: TILES.TOGGLE, icon: TILE_ICON.TOGGLE, tooltip: "Configure some standard or custom visual indicators with this tile which include either text, images, or both. Selecting the tile will scroll through the various configured states of this tile." },
    ];
    if (this.ruleSet.isBuffAndEffectEnabled) {
      this.tiles.push({ tileName: 'BUFFS & EFFECTS', tileTypeId: TILES.BUFFANDEFFECT, icon: TILE_ICON.BUFFANDEFFECT, tooltip: "Displays all the buffs and effects currently associated with this character. Selecting a specific buff and effect will open the details for that given record." });
    }
    if (this.ruleSet.isItemEnabled || this.ruleSet.isAbilityEnabled || this.ruleSet.isSpellEnabled || this.ruleSet.isBuffAndEffectEnabled) {
      this.tiles.push({ tileName: 'LINK', tileTypeId: TILES.LINK, icon: TILE_ICON.LINK, tooltip: "Create a connection to an inventory item, spell, or ability record associated with this character. Selecting the tile will launch the details for the target record." });
      this.tiles.push({ tileName: 'EXECUTE', tileTypeId: TILES.EXECUTE, icon: TILE_ICON.EXECUTE, tooltip: "Create a connection to an inventory item, spell, or ability record which has at least 1 command associated. Selecting this tile will execute the command or launch a screen to select the command you wish to execute." });
    }
    this.tiles.push({ tileName: 'CURRENCY', tileTypeId: TILES.CURRENCY, icon: TILE_ICON.CURRENCY, tooltip:"Displays the various amounts of currency this character possesses. When selected, provides an interface to update these amounts (if allowed by the GM)." });
  }

  addTiles(tile: any, tileTypeId: number) {
    this.close(true);
    switch (tileTypeId) {
      case TILES.NOTE: {
        this.bsModalRef = this.modalService.show(NoteTileComponent, {
          class: 'modal-primary modal-lg  modal-custom tile-popup',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Note Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.event.subscribe(data => {
           if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.IMAGE: {
        this.bsModalRef = this.modalService.show(ImageTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Image Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.event.subscribe(data => {
           if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.COUNTER: {
        this.bsModalRef = this.modalService.show(CounterTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Counter Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.CHARACTERSTAT: {
        const char = new Characters();
        char.characterId = this.characterId;
        char.ruleSet = this.ruleSet;
        this.bsModalRef = this.modalService.show(CharacterStatTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Character Stat Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.character = char;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.LINK: {
        
        this.bsModalRef = this.modalService.show(LinkTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Link Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.ruleSet = this.ruleSet;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.EXECUTE: {
        this.bsModalRef = this.modalService.show(ExecuteTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Execute Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.ruleSet = this.ruleSet;
        this.bsModalRef.content.event.subscribe(data => {
           if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.COMMAND: {
        this.bsModalRef = this.modalService.show(CommandTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Command Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.event.subscribe(data => {
           if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.TEXT: {
        this.bsModalRef = this.modalService.show(TextTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Text Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.BUFFANDEFFECT: {
        
        this.bsModalRef = this.modalService.show(BuffAndEffectTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Buffs & Effects Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.ruleSet = this.ruleSet;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.TOGGLE: {
        this.bsModalRef = this.modalService.show(ToggleTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Toggle Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.CHARACTERSTATCLUSTER: {
        const char = new Characters();
        char.characterId = this.characterId;
        char.ruleSet = this.ruleSet;
        this.bsModalRef = this.modalService.show(CharacterStatClusterTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Character Stat Cluster Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.character = char;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      case TILES.CURRENCY: {

        this.bsModalRef = this.modalService.show(CurrencyTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Currency Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.ADD;
        this.bsModalRef.content.ruleSet = this.ruleSet;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.event.emit(data);
          }
        })
        break;
      }
      default: break;
    }
  }

  close(check: boolean=false) {
    if (check) {
      this.bsModalRef.hide();
    } else {
      this.bsModalRef.hide();
      this.event.emit(true);
    }
    //this.bsModalRef.hide();
    // this.destroyModalOnInit();
  }

  // private destroyModalOnInit(): void {
  //    try {
  //        this.modalService.hide(1);
  //        document.body.classList.remove('modal-open');
  //    } catch (err) { }
  // }

}
