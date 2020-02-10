import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../core/models/view-models/ruleset.model';
import { RulesetDashboardPage } from '../core/models/view-models/ruleset-dashboard-page.model';
import { RulesetDashboardPageService } from '../core/services/ruleset-dashboard-page.service';
import { TILES, TILE_ICON, VIEW } from '../core/models/enums';
import { RulesetNoteTileComponent } from './note/note.component';
import { RulesetImageTileComponent } from './image/image.component';
import { RulesetCounterTileComponent } from './counter/counter.component';
import { RulesetCharacterStatTileComponent } from './character-stat/character-stat.component';
import { RulesetCommandTileComponent } from './command/command.component';
import { RulesetTextTileComponent } from './text/text.component';
import { PlatformLocation } from '@angular/common';
import { RulesetBuffAndEffectTileComponent } from './buff-and-effect/buff-and-effect.component';
import { RulesetToggleTileComponent } from './toggle/toggle.component';
import { RulesetCharacterStatClusterTileComponent } from './character-stat-cluster/character-stat-cluster.component';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class RulesetTileComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  ruleSet: Ruleset = new Ruleset();
  tiles: any;
  rulesetId: number;
  pageId: number;
  pageDefaultData = new RulesetDashboardPage();
  isCampaignDashboard: boolean = false;

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService
    , private pageService: RulesetDashboardPageService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.pageId = this.bsModalRef.content.pageId;
      this.rulesetId = this.bsModalRef.content.rulesetId;
      this.ruleSet = this.bsModalRef.content.ruleset;
      this.isCampaignDashboard = this.bsModalRef.content.isCampaignDashboard ? true : false;
      this.getTiles();
      this.Initialize();
    }, 0);
  }

  private Initialize() {
    if (this.pageId) {
      this.pageService.getRulesetDashboardPageById<any>(this.pageId)
        .subscribe(data => {
          this.pageDefaultData = data;
        }, error => {
        }, () => { });
    }
  }

  getTiles() {
    this.tiles = [
      { tileName: 'CHARACTER STAT', tileTypeId: TILES.CHARACTERSTAT, icon: TILE_ICON.CHARACTERSTAT, tooltip: "Displays the value of a given character stat. Selecting the tile will launch an interface to update this value in most cases." },
      { tileName: 'TEXT', tileTypeId: TILES.TEXT, icon: TILE_ICON.TEXT, tooltip: "Used to display a small amount of text. This text can also include character stat variables if desired. [InventoryWeight] for example." },
      { tileName: 'NOTE', tileTypeId: TILES.NOTE, icon: TILE_ICON.NOTE, tooltip: "Store and display a large amount rich text content with this tile." },
      { tileName: 'IMAGE', tileTypeId: TILES.IMAGE, icon: TILE_ICON.IMAGE, tooltip: "Display an Image with this tile. Selecting the tile will launch a larger view of the image." },
    ];
    if (this.isCampaignDashboard) {
      this.tiles.push({ tileName: 'CHAR STAT CLUSTER', tileTypeId: TILES.CHARACTERSTATCLUSTER, icon: TILE_ICON.CHARACTERSTATCLUSTER, tooltip: "When selected, this tile will display several character stats as configured. The tile itself can display 1 character stat or some provided text." });
    }
    this.tiles.push({ tileName: 'COMMAND', tileTypeId: TILES.COMMAND, icon: TILE_ICON.COMMAND, tooltip: "Create a command and store it in this tile. Selecting this tile will execute the stored command instantly." });
    this.tiles.push({ tileName: 'COUNTER', tileTypeId: TILES.COUNTER, icon: TILE_ICON.COUNTER, tooltip: "Display a numeric value in this tile. Selecting the tile will allow you to update the value of this number." });
    this.tiles.push({ tileName: 'TOGGLE', tileTypeId: TILES.TOGGLE, icon: TILE_ICON.TOGGLE, tooltip: "Configure some standard or custom visual indicators with this tile which include either text, images, or both. Selecting the tile will scroll through the various configured states of this tile." });

    if (this.ruleSet.isBuffAndEffectEnabled) {
      this.tiles.push({ tileName: 'BUFFS & EFFECTS', tileTypeId: TILES.BUFFANDEFFECT, icon: TILE_ICON.BUFFANDEFFECT, tooltip: "Displays all the buffs and effects currently associated with this character. Selecting a specific buff and effect will open the details for that given record." });
    }
  }

  addTiles(tile: any, tileTypeId: number) {
    this.close(true);
    switch (tileTypeId) {
      case TILES.NOTE: {
        this.bsModalRef = this.modalService.show(RulesetNoteTileComponent, {
          class: 'modal-primary modal-lg tile-popup  modal-custom',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Note Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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
        this.bsModalRef = this.modalService.show(RulesetImageTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Image Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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
        this.bsModalRef = this.modalService.show(RulesetCounterTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Counter Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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
        this.bsModalRef = this.modalService.show(RulesetCharacterStatTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Character Stat Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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
      case TILES.LINK: {
        break;
      }
      case TILES.EXECUTE: {
        break;
      }
      case TILES.COMMAND: {
        this.bsModalRef = this.modalService.show(RulesetCommandTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Command Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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
        this.bsModalRef = this.modalService.show(RulesetTextTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Text Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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
        this.bsModalRef = this.modalService.show(RulesetBuffAndEffectTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Buffs & Effects Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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
      case TILES.TOGGLE: {
        this.bsModalRef = this.modalService.show(RulesetToggleTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Toggle Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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

        this.bsModalRef = this.modalService.show(RulesetCharacterStatClusterTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Add Character Stat Cluster Tile';
        this.bsModalRef.content.rulesetId = this.rulesetId;
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
      default: break;
    }
  }

  close(check: boolean = false) {
    if (check) {
      this.bsModalRef.hide();
      this.event.emit(false);
    } else {
      this.bsModalRef.hide();
      this.event.emit(true);
    }
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

}
