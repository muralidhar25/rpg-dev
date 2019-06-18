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

    constructor(private bsModalRef: BsModalRef, private modalService: BsModalService
      , private pageService: RulesetDashboardPageService, private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
    }

    ngOnInit() {
        setTimeout(() => {
            this.pageId = this.bsModalRef.content.pageId;
            this.rulesetId = this.bsModalRef.content.rulesetId;
            this.ruleSet = this.bsModalRef.content.ruleset;
            this.getTiles();
            this.Initialize();
        }, 0);
    }

    private Initialize() {
        if (this.pageId) {
            this.pageService.getRulesetDashboardPageById<any>(this.pageId)
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
      if (this.ruleSet.isBuffAndEffectEnabled) {
        this.tiles.push({ tileName: 'BUFFS & EFFECTS', tileTypeId: TILES.BUFFANDEFFECT, icon: TILE_ICON.BUFFANDEFFECT });
      }
      this.tiles.push({ tileName: 'COMMAND', tileTypeId: TILES.COMMAND, icon: TILE_ICON.COMMAND });
    }
    
    addTiles(tile:any, tileTypeId: number) {
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
