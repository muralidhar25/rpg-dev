import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {

    ruleSet: any = new Ruleset();
    tiles: any;
    characterId: any;
    pageId: number;
    pageDefaultData = new CharacterDashboardPage();

    constructor(private bsModalRef: BsModalRef, private modalService: BsModalService
        , private pageService: CharacterDashboardPageService) {
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
                 //   console.log(data);
                    
                    this.pageDefaultData = data;
                }, error => {
                }, () => { });
        }
    }

    getTiles() {        
        this.tiles = [
            { tileName: 'TEXT', tileTypeId: TILES.TEXT, icon: TILE_ICON.TEXT },
            { tileName: 'NOTE', tileTypeId: TILES.NOTE, icon: TILE_ICON.NOTE },
            { tileName: 'IMAGE', tileTypeId: TILES.IMAGE, icon: TILE_ICON.IMAGE },
            { tileName: 'COUNTER', tileTypeId: TILES.COUNTER, icon: TILE_ICON.COUNTER },
            { tileName: 'CHARACTER STAT', tileTypeId: TILES.CHARACTERSTAT, icon: TILE_ICON.CHARACTERSTAT },
        ];
        this.tiles.push({ tileName: 'COMMAND', tileTypeId: TILES.COMMAND, icon: TILE_ICON.COMMAND });
        if (this.ruleSet.isItemEnabled || this.ruleSet.isAbilityEnabled || this.ruleSet.isSpellEnabled) {
            this.tiles.push({ tileName: 'LINK', tileTypeId: TILES.LINK, icon: TILE_ICON.LINK });
            this.tiles.push({ tileName: 'EXECUTE', tileTypeId: TILES.EXECUTE, icon: TILE_ICON.EXECUTE });
        }
       
    }
    
    addTiles(tile:any, tileTypeId: number) {
        this.close();
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
                break;
            }
            case TILES.CHARACTERSTAT: {
                let char = new Characters();
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
                break;
            }
            default: break;
        }        
    }

    close() {
        this.bsModalRef.hide();
        //this.destroyModalOnInit();
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }

}
