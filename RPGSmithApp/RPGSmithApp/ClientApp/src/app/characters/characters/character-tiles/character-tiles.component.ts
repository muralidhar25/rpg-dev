import { Component, OnInit, ViewEncapsulation, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { NgGrid, NgGridItem, NgGridConfig, NgGridItemConfig, NgGridItemEvent } from 'angular2-grid';
import { STAT_TYPE, TILES, VIEW, CONDITION_OPERATOR_ENUM, CHATACTIVESTATUS, SYSTEM_GENERATED_MSG_TYPE } from '../../../core/models/enums';
import { Characters } from '../../../core/models/view-models/characters.model';
import { Box, config } from '../../../core/models/tiles/box.model';
import { CharacterDashboardPage } from '../../../core/models/view-models/character-dashboard-page.model';
import { TileConfig } from '../../../core/models/tiles/character-tile-config.model';
import { CharactersCharacterStat } from '../../../core/models/view-models/characters-character-stats.model';
import { Router, ActivatedRoute } from '@angular/router';
import { CharactersService } from '../../../core/services/characters.service';
import { CharacterTileService } from '../../../core/services/character-tile.service';
import { CharacterDashboardPageService } from '../../../core/services/character-dashboard-page.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { SharedService } from '../../../core/services/shared.service';
import { AlertService, DialogType, MessageSeverity } from '../../../core/common/alert.service';
import { CharactersCharacterStatService } from '../../../core/services/characters-character-stat.service';
import { CharacterTileConfigService } from '../../../core/services/character-tile-config.service';
import { DBkeys } from '../../../core/common/db-keys';
import { User } from '../../../core/models/user.model';
import { Utilities } from '../../../core/common/utilities';
import { TileComponent } from '../../../tile/tile.component';
import { NoteTileComponent } from '../../../tile/note/note.component';
import { CharacterTile } from '../../../core/models/tiles/character-tile.model';
import { ImageTileComponent } from '../../../tile/image/image.component';
import { CounterTileComponent } from '../../../tile/counter/counter.component';
import { CharacterStatTileComponent } from '../../../tile/character-stat/character-stat.component';
import { LinkTileComponent } from '../../../tile/link/link.component';
import { ExecuteTileComponent } from '../../../tile/execute/execute.component';
import { CommandTileComponent } from '../../../tile/command/command.component';
import { TextTileComponent } from '../../../tile/text/text.component';
import { DiceService } from '../../../core/services/dice.service';
import { CharacterStatConditionViewModel } from '../../../core/models/view-models/character-stats.model';
import { ServiceUtil } from '../../../core/services/service-util';
import { AppService1 } from '../../../app.service';
import { BuffAndEffectTileComponent } from '../../../tile/buff-and-effect/buff-and-effect.component';
import { ToggleTileComponent } from '../../../tile/toggle/toggle.component';
import { CharacterStatClusterTileComponent } from '../../../tile/character-stat-cluster/character-stat-cluster.component';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';
import { CurrencyTileComponent } from '../../../tile/currency/currency.component';

@Component({
  selector: 'app-character-tiles',
  templateUrl: './character-tiles.component.html',
  styleUrls: ['./character-tiles.component.scss']
})
export class CharacterTilesComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  STAT_TYPE = STAT_TYPE;
  TILES = TILES;
  bsModalRef: BsModalRef;
  characterId: number;
  tiles: any = [];
  text: string;
  isLoading = false;
  largeImageTiles: any;
  image: string;
  commandTiles: any;
  bgColor: string;
  character: any = new Characters();
  noteTiles: any;
  public someValue: number = 5;
  public someMin: number = -10;
  public someMax: number = 10;
  pageId: number;
  boxes: Box[] = [];
  private Originalboxes: Box[] = [];
  private Deletedboxes: Box[] = [];
  private ResizeRelocateboxes: Box[] = [];


  hasAdded: boolean = false;
  IsMobileScreen: boolean = this.isMobile();
  IsMobilePanel: boolean = false;

  private rgb: string = '#efefef';
  private curNum;
  private columnsInGrid: number = 14;
  public gridConfig: NgGridConfig = {
    'margins': this.getTileSize().margins,
    'draggable': true,
    'resizable': true,
    'max_cols': this.columnsInGrid,
    'max_rows': 0,
    'visible_cols': 0,
    'visible_rows': 0,
    'min_cols': 0,
    'min_rows': 0,
    'col_width': this.getTileSize().max,
    'row_height': this.getTileSize().max,
    'cascade': 'up',
    'min_width': this.getTileSize().min,
    'min_height': this.getTileSize().min,
    'fix_to_grid': false,
    'auto_style': true,
    //'auto_resize': false,
    'auto_resize': this.IsMobileScreen,
    'maintain_ratio': true,
    'prefer_new': true,
    'limit_to_screen': true,
    'center_to_screen': true,
    'resize_directions': this.IsMobileScreen ? [
      "bottomleft",
      "bottomright",
      "topright",
      "topleft",
      "right",
      "left",
      "bottom",
      "top"
    ] : [
        "bottomleft",
        "bottomright"
      ],
  };
  trashedTile: boolean = false;
  StateChanged: boolean = false;

  //trashtileclass: string = '';
  IsTrashPage: boolean = false;
  IsResizePage: boolean = false;
  IsEditPage: boolean = false;
  IsRelocatePage: boolean = false;

  private startIndex: number = 1
  private BoxesCurrentRow: number = this.startIndex;
  private BoxesCurrentColumn: number = this.startIndex;
  private BoxesCurrentPaylod: number = 1;
  private BoxesEditedIndex: number = 0;
  private itemPositions: Array<any> = [];
  pageDefaultData = new CharacterDashboardPage();
  private initial: boolean = true;
  private isRefreshed: boolean = false;
  preventClick: boolean = false;
  private currentGridItems: NgGridItemEvent[] = [];
  showActions: boolean;
  noRecordFound: boolean = false;
  finalTileList: TileConfig[] = [];
  IsAnyTileUpdated: boolean = false;
  CharacterStatsValues: any;
  statLinkRecords: any;
  choiceArraySplitter: string = 'S###@Split@###S';
  ConditionsValuesList: CharactersCharacterStat[] = [];
  showManageIcons: boolean = true;
  editMode: boolean = false;

  constructor(private modalService: BsModalService, private charactersService: CharactersService, private characterTileService: CharacterTileService,
    private router: Router, private route: ActivatedRoute, private authService: AuthService, private pageService: CharacterDashboardPageService,
    private localStorage: LocalStoreManager, private sharedService: SharedService, private alertService: AlertService,
    private tileConfig: CharacterTileConfigService, private ref: ElementRef, private CCService: CharactersCharacterStatService
    , public appService: AppService1) {

    this.sharedService.shouldUpdateCharacterList().subscribe(serviceJson => {
      if (serviceJson) {
        if (this.BoxesEditedIndex) { //edited
          this.editBox(serviceJson)
        }
        else { //added
          if (serviceJson.length) {
            let result: any = serviceJson;
            result.map((item) => {
              this.addBox(item);
            })
          }
          else {
            this.addBox(serviceJson);
          }
        }
        this.Initialize();
      }
    });
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink" && !this.editMode) {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
    } catch (err) { }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.characterId = params['id'];
    });
    this.destroyModalOnInit();
    this.pageId = this.localStorage.getDataObject<number>('pageId');
    this.Initialize();

    window.addEventListener("resize", () => {
      // Get screen size (inner/outerWidth, inner/outerHeight)
      let dragable: boolean = this.gridConfig.draggable;
      let resizable: boolean = this.gridConfig.resizable;
      this.gridConfig = {
        'margins': this.getTileSize().margins,
        'draggable': dragable,
        'resizable': resizable,
        'max_cols': this.columnsInGrid,
        'max_rows': 0,
        'visible_cols': 0,
        'visible_rows': 0,
        'min_cols': 0,
        'min_rows': 0,
        'col_width': this.getTileSize().max,
        'row_height': this.getTileSize().max,
        'cascade': 'up',
        'min_width': this.getTileSize().min,
        'min_height': this.getTileSize().min,
        'fix_to_grid': false,
        'auto_style': true,
        //'auto_resize': false,
        'auto_resize': this.IsMobileScreen,
        'maintain_ratio': true,
        'prefer_new': true,
        'limit_to_screen': true,
        'center_to_screen': true,
        'resize_directions': this.IsMobileScreen ? [
          "bottomleft",
          "bottomright",
          "topright",
          "topleft",
          "right",
          "left",
          "bottom",
          "top"
        ] : [
            "bottomleft",
            "bottomright"
          ],
      };
      //this.boxes = this.mapBoxes(this.tiles);
    }, false);

    //window.onorientationchange = () => {
    //  setTimeout(() => {
    //    this.gridConfig = {
    //      'margins': this.getTileSize().margins,
    //      'draggable': true,
    //      'resizable': true,
    //      'max_cols': this.columnsInGrid,
    //      'max_rows': 0,
    //      'visible_cols': 0,
    //      'visible_rows': 0,
    //      'min_cols': 0,
    //      'min_rows': 0,
    //      'col_width': this.getTileSize().max,
    //      'row_height': this.getTileSize().max,
    //      'cascade': 'up',
    //      'min_width': this.getTileSize().min,
    //      'min_height': this.getTileSize().min,
    //      'fix_to_grid': false,
    //      'auto_style': true,
    //      //'auto_resize': false,
    //      'auto_resize': this.IsMobileScreen,
    //      'maintain_ratio': true,
    //      'prefer_new': true,
    //      'limit_to_screen': true,
    //      'center_to_screen': true,
    //      'resize_directions': this.IsMobileScreen ? [
    //        "bottomleft",
    //        "bottomright",
    //        "topright",
    //        "topleft",
    //        "right",
    //        "left",
    //        "bottom",
    //        "top"
    //      ] : [
    //          "bottomleft",
    //          "bottomright"
    //        ],
    //    };
    //    this.boxes = this.mapBoxes(this.tiles);
    //  }, 10);
    //}
    if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
      let ChatWithDiceRoll = [];
      if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
        ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
      }
      let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.TOGGLE_CHAT_PARTICIPANT_LIST, obj: true }
      ChatWithDiceRoll.push(chatMsgObject);
      this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
    } else {
      this.appService.updateToggleChatParticipantList(true);
    }
  }
  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }
  private Initialize() {
    this.showManageIcons = true;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (window.innerWidth < 1200) {
        this.gridConfig.draggable = false;
        this.gridConfig.resizable = false;
        this.IsMobilePanel = true;
      } else {
        this.gridConfig.draggable = true;
        this.gridConfig.resizable = true;
        this.IsMobilePanel = false;
      }
      let isManageCharacterTile = this.localStorage.localStorageGetItem(DBkeys.IsManageCharacterTile);
      this.isLoading = true;
      this.CCService.getConditionsValuesList_Cache<any[]>(this.characterId, isManageCharacterTile)
        .subscribe(data => {

          this.ConditionsValuesList = data;
          this.characterTileService.getTilesByPageIdCharacterId_Cache<string>(this.pageId, this.characterId, 0, false, isManageCharacterTile)
            .subscribe(data => {

              let model: any = data;
              this.CharacterStatsValues = model.characterStatsValues;
              this.statLinkRecords = model.statLinkRecords;
              data = model.data;
              if (this.hasAdded) {
                this.boxes = [];
              }
              this.tiles = data;

              let _boxes = this.mapBoxes(data);
              this.boxes = _boxes;
              if (this.IsMobilePanel) {
                this.openEditGrid();
              }

              try {
                this.noRecordFound = !data.length;
              } catch (err) { }
              setTimeout(() => { this.isLoading = false; }, 50);
            }, error => {
              this.isLoading = false;
            }, () => { });
        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });

      //this.isLoading = true;
      this.charactersService.getCharactersById_Cache<any>(this.characterId)
        .subscribe(data => {
          this.character = data;
          this.setHeaderValues(this.character);
          //this.isLoading = false;
        }, error => {
          this.character = new Characters();
          //this.isLoading = false;
        }, () => { });
      if (this.pageId) {
        this.pageService.getCharacterDashboardPageById_Cache<any>(this.pageId, isManageCharacterTile)
          .subscribe(data => {
            this.pageDefaultData = data;
          }, error => {
          }, () => { });
      }
    }
  }

  openTile() {
    if (this.character.ruleSet) {
      this.UpdateTileConfigList(this.finalTileList);
      this.showManageIcons = false;
      this.BoxesEditedIndex = 0;
      this.bsModalRef = this.modalService.show(TileComponent, {
        class: 'modal-primary modal-md tile-create-popup tooltipClass',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.characterId = this.characterId;
      this.bsModalRef.content.ruleSet = this.character.ruleSet;
      this.bsModalRef.content.pageId = this.pageId;
      this.bsModalRef.content.pageDefaultData = this.pageDefaultData;

      this.bsModalRef.content.event.subscribe(data => {
        if (data) {
          this.showManageIcons = data;
          this.localStorage.deleteData(DBkeys.IsManageCharacterTile);
          this.Initialize();
        }
      })
    }
  }
  openTrashGrid() {
    this.IsTrashPage = true;
    this.gridConfig.draggable = false;
    this.gridConfig.resizable = false;
    this.Deletedboxes = [];
    this.Originalboxes = Object.assign([], this.boxes);
    this.ResizeRelocateboxes = [];
  }
  openResize() {
    this.IsResizePage = true;
    //IsEditPage: boolean = false;
    //IsRelocatePage
    this.gridConfig.draggable = false;
    this.gridConfig.resizable = true;
    this.ResizeRelocateboxes = Object.assign([], this.boxes.map((box) => {
      box.config = Object.assign(new config, box.config);

      return Object.assign(new Box, box);
    }));
    this.Originalboxes = Object.assign([], this.boxes.map((box) => {
      box.config = Object.assign(new config, box.config);

      return Object.assign(new Box, box);
    }));
  }
  openRelocate() {
    this.IsRelocatePage = true;
    //IsEditPage: boolean = false;
    //IsRelocatePage
    this.gridConfig.draggable = true;
    this.gridConfig.resizable = false;
    //this.ResizeRelocateboxes = [];
    this.Originalboxes = Object.assign([], this.boxes);
    this.ResizeRelocateboxes = Object.assign([], this.boxes.map((box) => {
      box.config = Object.assign(new config, box.config);

      return Object.assign(new Box, box);
    }));
    this.Originalboxes = Object.assign([], this.boxes.map((box) => {
      box.config = Object.assign(new config, box.config);

      return Object.assign(new Box, box);
    }));
  }
  openEditGrid() {
    this.IsEditPage = true;
    //IsEditPage: boolean = false;
    //IsRelocatePage
    this.gridConfig.draggable = false;
    this.gridConfig.resizable = false;
    this.Originalboxes = Object.assign([], this.boxes);
    this.ResizeRelocateboxes = [];
  }
  backToNormal(doUpdate: boolean = true) {
    this.IsTrashPage = false;
    this.IsResizePage = false;
    this.IsRelocatePage = false;
    this.IsEditPage = false;
    this.gridConfig.draggable = !this.IsMobilePanel;
    this.gridConfig.resizable = !this.IsMobilePanel;
    if (this.ResizeRelocateboxes.length && doUpdate) {
      this.Deletedboxes = [];
      this.boxes = Object.assign([], this.ResizeRelocateboxes.map((box) => {
        box.config = Object.assign(new config, box.config);

        return Object.assign(new Box, box);
      }));
      this.ResizeRelocateboxes = [];
    }
    else if (this.Deletedboxes.length && doUpdate) {
      this.boxes = Object.assign([], this.Originalboxes);
    }

  }
  moveToTrash(box: Box, index: number) {
    this.Deletedboxes.push(box);
    this.removeGridBox(index);
    this.noRecordFound = !this.Originalboxes.length;
  }
  deleteMultipleTiles(restrictRedirect = true) {
    let TileIdList = [];
    this.Deletedboxes.map((box) => {
      TileIdList.push(box.tile.characterTileId);
    })
    if (TileIdList.length) {
      this.isLoading = true;
      this.characterTileService.deleteTileList(TileIdList)
        .subscribe(data => {
          //this.isLoading = false;
          this.IsTrashPage = false;
          this.IsResizePage = false;
          this.IsRelocatePage = false;
          this.IsEditPage = false;
          this.gridConfig.draggable = !this.IsMobilePanel;
          this.gridConfig.resizable = !this.IsMobilePanel;
          this.Deletedboxes = [];

          this.gotoDashboard(restrictRedirect);
        }, error => {
          this.isLoading = false;
        }, () => { });
    }
    else {
      this.IsTrashPage = false;
      this.IsResizePage = false;
      this.IsRelocatePage = false;
      this.IsEditPage = false;
      this.gridConfig.draggable = !this.IsMobilePanel;
      this.gridConfig.resizable = !this.IsMobilePanel;
      this.Deletedboxes = [];

      this.gotoDashboard(restrictRedirect);
    }

  }

  private setHeaderValues(character: Characters): any {
    let headerValues = {
      headerName: character.characterName,
      headerImage: character.imageUrl,
      headerId: character.characterId,
      headerLink: 'character',
      hasHeader: true
    };
    this.appService.updateAccountSetting1(headerValues);
    this.sharedService.updateAccountSetting(headerValues);
    this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
  }

  manageRoute(url: string) {
    this.router.navigate([url, this.characterId]);
  }
  saveAndGotoDashboard() {
    this.deleteMultipleTiles(false);
    //this.gotoDashboard()
  }
  gotoDashboard(redriectToEditMode: boolean = false) {
    this.createUpdateTileConfigList(this.finalTileList, true, true, true, redriectToEditMode);
    //this.router.navigate(['/character/dashboard', this.characterId]);
  }

  editTile(_editTile: any, tileType: number, boxIndex: number = 0) {
    // alert(this.preventClick);
    //if (!this.preventClick) {
    this.editMode = false;
    this.showManageIcons = false;
    let tile: CharacterTile = _editTile;
    this.BoxesEditedIndex = boxIndex;
    this.UpdateTileConfigList(this.finalTileList);
    switch (tileType) {
      case TILES.NOTE: {
        this.bsModalRef = this.modalService.show(NoteTileComponent, {
          class: 'modal-primary modal-lg modal-custom tile-popup',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Note Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        this.editMode = true;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
          }
          this.editMode = false;
        })
        break;
      }
      case TILES.IMAGE: {
        this.bsModalRef = this.modalService.show(ImageTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Image Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = "Edit Counter Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
          }
        })
        break;
      }
      case TILES.CHARACTERSTAT: {
        this.bsModalRef = this.modalService.show(CharacterStatTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Character Stat Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        this.bsModalRef.content.character = this.character;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = "Edit Link Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        this.bsModalRef.content.ruleSet = this.character.ruleSet;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = "Edit Execute Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        this.bsModalRef.content.ruleSet = this.character.ruleSet;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = "Edit Command Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = "Edit Text Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = "Edit Buffs and Effects Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        this.bsModalRef.content.ruleSet = this.character.ruleSet;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = 'Edit Toggle Tile';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            //this.event.emit(data);
            this.showManageIcons = data;
          }
        })
        break;
      }
      case TILES.CHARACTERSTATCLUSTER: {
        this.bsModalRef = this.modalService.show(CharacterStatClusterTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Character Stat Cluster Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = "Currency";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.currencyTile = tile.currencyTile;
        //this.bsModalRef.content.characterCurrency = tile.currencyTile ? Object.assign([], tile.currencyTile.characterCurrency) : [];
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
          }
        })
        break;
      }
      default: break;
    }
    // }
    this.preventClick = false;
  }

  deleteTile(characterTile: CharacterTile, boxIndex: number = 0) {
    if (!this.preventClick) {
      if (characterTile.tileTypeId === TILES.NOTE)
        this.alertService.showDialog('Are you sure you want to delete this tile?',
          DialogType.confirm, () => this.deleteCharacterHelper(characterTile, boxIndex), null, 'Yes', 'No');
      else
        this.deleteCharacterHelper(characterTile, boxIndex);
    }
    this.preventClick = false;
  }

  private deleteCharacterHelper(characterTile: CharacterTile, boxIndex: number = 0) {
    //this.alertService.startLoadingMessage("", "Deleting Tile");
    this.isLoading = true;
    this.characterTileService.deleteTile(characterTile.characterTileId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Character Tile has been deleted successfully.", "", MessageSeverity.success);
          this.removeGridBox(boxIndex)
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Delete";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire)
            this.authService.logout(true);
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }


  //--Resize work started--//
  editBox(tile): void {
    this.boxes.map((item, index) => {
      if (index == this.BoxesEditedIndex) {
        item.tile = tile;
      }
    })
  }
  addBox(tile): void {
    this.isRefreshed = true;
    const conf: NgGridItemConfig = this._generateDefaultItemConfig(tile.characterTileId);
    this.boxes.push({ config: conf, tile: tile, IsCharacter: false });
    let config: TileConfig = { characterTileId: conf.payload, payload: conf.payload, col: conf.col, row: conf.row, sizeX: conf.sizex, sizeY: conf.sizey };
    this.createUpdateTileConfig(config, false);
  }

  removeGridBox(index: number): void {
    this.isRefreshed = true;
    if (this.boxes[index]) {
      //if (actualDelete) {
      //    this.deleteTileConfig(this.boxes[index].config.payload);
      //}            
      this.boxes.splice(index, 1);
      try {
        this.noRecordFound = !this.boxes.length;
      } catch (err) { }
    }
  }

  changeDone(index: number, event: NgGridItemEvent): void {
    this.StateChanged = true;
    this.isRefreshed = true;
    this.currentGridItems.map((item, index) => {
      if (item.uid == event.uid) {
        if (item.col == event.col && item.row == event.row &&
          item.height == event.height && item.sizex == event.sizex && item.sizey == event.sizey &&
          item.left == event.left && item.top == event.top && item.width == event.width) {
          this.preventClick = false;
        }
        else {
          //this.preventClick = true;
        }
      }
      this.preventClick = false;
      //this.preventClick = true;
    });
    //let config: TileConfig = { characterTileId: event.payload, payload: event.payload, col: event.col, row: event.row, sizeX: event.sizex, sizeY: event.sizey };
    //this.createUpdateTileConfig(config, true);


  }

  onDrag(index: number, event: NgGridItemEvent, element?: any): void {
    this.preventClick = true;
    //alert(this.preventClick);
    //  this.trashedTile = false;
    if (this.IsMobileScreen) {
      this.trashedTile = false;
    }
  }

  onChangeStart(event: NgGridItemEvent): void {

    //this.preventClick = true;
    //alert(this.preventClick);       
  }

  onDragStop(event: any, characterTile: CharacterTile, boxIndex: number = 0) {
    if (this.trashedTile) {
      this.preventClick = false;
      this.deleteTile(characterTile, boxIndex);
      this.trashedTile = false;
    }
  }

  onResize(box: any, index: number, event: NgGridItemEvent): void {

    this.preventClick = true;
    //alert(this.preventClick);
  }

  removeTile(event: any, characterTile: CharacterTile, boxIndex: number = 0) {
    this.trashedTile = false;

    //try {
    //    let heightTile = event.currentTarget.childNodes[1].clientHeight;
    //    let widthTile = event.currentTarget.childNodes[1].clientWidth;



    //    let offsetLeftLI = this.ref.nativeElement.childNodes[1].childNodes[2].childNodes[1].childNodes[8].childNodes[1].childNodes[3].offsetLeft;
    //    let offsetTopLI = this.ref.nativeElement.childNodes[1].childNodes[2].childNodes[1].childNodes[8].childNodes[1].childNodes[3].offsetTop;

    //    if (event.pageX > (+offsetLeftLI - (widthTile / 2)) && event.pageY > (+offsetTopLI - (heightTile / 2))) {
    //       // this.deleteTile(characterTile, boxIndex);
    //    }

    //} catch (err) { }
  }

  trashTile() {
    this.trashedTile = true;
  }

  mouseout() {
    this.trashedTile = false;
  }

  private _generateDefaultItemConfig(characterTileId: number = 0): NgGridItemConfig {
    var item: NgGridItemConfig = { dragHandle: ".handle", payload: characterTileId, col: this.BoxesCurrentColumn, row: this.BoxesCurrentRow, sizex: 2, sizey: 2, };

    if (this.BoxesCurrentColumn < this.columnsInGrid - 1) {
      this.BoxesCurrentColumn = this.BoxesCurrentColumn + 2;
    }
    else {
      this.BoxesCurrentColumn = this.startIndex;
      this.BoxesCurrentRow = this.BoxesCurrentRow + 2;
    }
    return item;
  }
  //private _generateDefaultItemConfig_add(characterTileId: number = 0): NgGridItemConfig {

  //    var item: NgGridItemConfig = { dragHandle: ".handle", payload: characterTileId, col: this.BoxesCurrentColumn, row: this.BoxesCurrentRow, sizex: 2, sizey: 2, };

  //    if (this.BoxesCurrentColumn < this.columnsInGrid - 1) {
  //        this.BoxesCurrentColumn = this.BoxesCurrentColumn + 2;
  //    }
  //    else {
  //        this.BoxesCurrentColumn = this.startIndex;
  //        this.BoxesCurrentRow = this.BoxesCurrentRow + 2;
  //    }
  //    /////////////////////////////
  //    let lastRowConfig: NgGridItemConfig;
  //    let RowNum:number = 0;
  //    this.boxes.map((box) => {
  //        if (box.config.row > RowNum) {
  //            RowNum = box.config.row
  //            lastRowConfig = box.config;
  //        }
  //    })
  //    /////////////////////////////
  //    return item;
  //}
  private mapBoxes(List) {
    let boxes: Box[] = [];
    let ngGridItemConfig: NgGridItemConfig;
    let initialTile;
    //if (this.BoxesCurrentRow == this.startIndex && this.BoxesCurrentColumn == this.startIndex) {
    //    ngGridItemConfig = { dragHandle: ".handle", payload: this.BoxesCurrentPaylod, col: this.BoxesCurrentColumn, row: this.BoxesCurrentRow, draggable: false, resizable: false, fixed: true };
    //    initialTile = this.character
    //    this.BoxesCurrentPaylod = this.BoxesCurrentPaylod + 1;
    //}
    //if (this.BoxesCurrentColumn < this.columnsInGrid) {
    //    this.BoxesCurrentColumn = this.BoxesCurrentColumn + 1;
    //}
    //else {
    //    //this.BoxesCurrentColumn = this.startIndex;
    //    //this.BoxesCurrentRow = this.BoxesCurrentRow + 1;
    //}
    //let box: Box = { config: ngGridItemConfig, tile: initialTile, IsCharacter: true };
    //boxes.push(box);
    List.map((item, index) => {
      index = index + 1;

      if (item.hasOwnProperty("config") && item.config) { //Values set in DB
        ngGridItemConfig = { dragHandle: ".handle", payload: item.config.characterTileId, col: item.config.col, row: item.config.row, sizex: item.config.sizeX, sizey: item.config.sizeY, };
        this.BoxesCurrentColumn = item.config.col
        this.BoxesCurrentRow = item.config.row

        if (this.BoxesCurrentColumn < this.columnsInGrid - 1) {
          this.BoxesCurrentColumn = this.BoxesCurrentColumn + 2;
        }
        else {
          this.BoxesCurrentColumn = this.startIndex;
          this.BoxesCurrentRow = this.BoxesCurrentRow + 2;
        }

      }
      else {
        ngGridItemConfig = this._generateDefaultItemConfig(item.characterTileId);
      }
      ////////////////////////////////
      if (item.tileTypeId == TILES.CHARACTERSTAT) {
        if (item.characterStatTiles.charactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Calculation) {
          if (item.characterStatTiles.charactersCharacterStat.characterStat.characterStatCalcs.length) {

            let calculationIds = item.characterStatTiles.charactersCharacterStat.characterStat.characterStatCalcs[0].statCalculationIds;
            if (calculationIds) {
              let inventoreyWeight = this.CharacterStatsValues.character.inventoryWeight;
              try {
                this.CharacterStatsValues.characterCurrency.map(x => {
                  let _weight = x.weightValue * x.amount;
                  _weight = _weight ? _weight : 0;
                  inventoreyWeight += _weight;
                })
              } catch (err) { }

              calculationIds.split("[-1]").map((item) => {
                calculationIds = calculationIds.replace("[-1]", " " + inventoreyWeight + " ");
              })

              ////////////////////////////////////////////
              let Curnt_Stat = item.characterStatTiles.charactersCharacterStat;
              let finalCalcString = '';
              if (Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation != null && Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation != undefined) {
                Curnt_Stat.displayCalculation = Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation;
                let IDs: any[] = [];
                let CalcString = calculationIds;
                finalCalcString = CalcString;
                if (calculationIds) {
                  calculationIds.split(/\[(.*?)\]/g).map((rec) => {

                    let id = ''; let flag = false; let type = 0; let statType = 0;
                    if (rec.split('_').length > 1) {
                      id = rec.split('_')[0].replace('[', '').replace(']', '');
                      type = parseInt(rec.split('_')[1])
                    }
                    else {
                      id = rec.replace('[', '').replace(']', '');
                      type = 0
                    }
                    this.CharacterStatsValues.charactersCharacterStat.map((q) => {
                      if (!flag) {
                        flag = (parseInt(id) == q.characterStatId);
                        statType = q.characterStat.characterStatTypeId
                      }
                    })
                    if (flag) {
                      IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
                    }
                    else if (+id == -1) {
                      IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
                    }
                  })
                }
                IDs.map((rec) => {
                  if (+rec.id == -1 && this.character.inventoryWeight) {
                    CalcString = CalcString.replace(rec.originaltext, this.character.inventoryWeight);
                  } else {
                    this.CharacterStatsValues.charactersCharacterStat.map((stat) => {
                      if (rec.id == stat.characterStatId) {
                        let num = 0;
                        switch (rec.statType) {
                          case 3: //Number
                            num = stat.number
                            break;
                          case 5: //Current Max
                            if (rec.type == 1)//current
                            {
                              num = stat.current
                            }
                            else if (rec.type == 2)//Max
                            {
                              num = stat.maximum
                            }
                            break;
                          case 7: //Val Sub-Val
                            if (rec.type == 3)//value
                            {
                              num = +stat.value
                            }
                            else if (rec.type == 4)//sub-value
                            {
                              num = stat.subValue
                            }
                            break;
                          case 12: //Calculation
                            num = stat.calculationResult
                            break;
                          case STAT_TYPE.Combo: //Combo
                            num = stat.defaultValue
                            break;
                          case STAT_TYPE.Choice: //Choice

                            num = stat.defaultValue
                            break;
                          case STAT_TYPE.Condition: //Condition
                            let characterStatConditionsfilter = this.ConditionsValuesList.filter((Cs) => Cs.characterStatId == rec.id);
                            let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.CharacterStatsValues.charactersCharacterStat);
                            num = +result;
                            break;
                          default:
                            break;
                        }
                        if (num)
                          CalcString = CalcString.replace(rec.originaltext, num);
                        else
                          CalcString = CalcString.replace(rec.originaltext, 0);
                        //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
                      }

                    });
                  }
                  finalCalcString = CalcString;
                });
              }

              try {
                finalCalcString = finalCalcString.replace(/ /g, '');
                finalCalcString = finalCalcString.replace(/RU/g, ' RU').replace(/RD/g, ' RD').replace(/KL/g, ' KL').replace(/KH/g, ' KH').replace(/DL/g, ' DL').replace(/DH/g, ' DH');
                finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');

                finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
                  ? finalCalcString.trim().slice(0, -1)
                  : finalCalcString.trim();
                item.characterStatTiles.charactersCharacterStat.calculationResult = +finalCalcString == 0 ? 0 : DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
              }
              catch (ex) {
                item.characterStatTiles.charactersCharacterStat.calculationResult = 0;
                //Curnt_Stat.calculationResult = this.getCalculationResult(Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation);
              }
              if (isNaN(item.characterStatTiles.charactersCharacterStat.calculationResult)) {
                item.characterStatTiles.charactersCharacterStat.calculationResult = 0;
              }
              if (this.CharacterStatsValues.charactersCharacterStat) {
                if (this.CharacterStatsValues.charactersCharacterStat.length) {
                  this.CharacterStatsValues.charactersCharacterStat.map((UpdateStat) => {
                    if (UpdateStat.characterStatId == item.characterStatTiles.charactersCharacterStat.characterStatId) {
                      UpdateStat.calculationResult = item.characterStatTiles.charactersCharacterStat.calculationResult;
                    }
                  })
                }
              }
              ////////////////////////////////////////////

            }
            else {
              //For Old Records
              //////////////////////////////////////////////


              let calculationString: string = item.characterStatTiles.charactersCharacterStat.characterStat.characterStatCalcs[0].statCalculation.toUpperCase();
              let inventoreyWeight = this.CharacterStatsValues.character.inventoryWeight;
              try {
                this.CharacterStatsValues.characterCurrency.map(x => {
                  let _weight = x.weightValue * x.amount;
                  _weight = _weight ? _weight : 0;
                  inventoreyWeight += _weight;
                })
              } catch (err) { }

              let finalCalcString: string = '';

              calculationString.split("[INVENTORYWEIGHT]").map((item) => {
                calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
              })
              let IDs: any[] = [];
              finalCalcString = calculationString;
              if (calculationString) {
                calculationString.split(/\[(.*?)\]/g).map((rec) => {

                  let id = ''; let flag = false; let type = 0; let statType = 0;
                  if (rec.split('_').length > 1) {
                    id = rec.split('_')[0].replace('[', '').replace(']', '');
                    type = parseInt(rec.split('_')[1])
                  }
                  else {
                    id = rec.replace('[', '').replace(']', '');
                    type = 0
                  }
                  this.CharacterStatsValues.charactersCharacterStat.map((q) => {
                    if (!flag) {
                      flag = (id == q.characterStat.statName.toUpperCase());
                      statType = q.characterStat.characterStatTypeId
                    }
                  })
                  if (flag) {
                    IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
                  }
                  else if (+id == -1) {
                    IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
                  }
                })

                IDs.map((rec) => {
                  this.CharacterStatsValues.charactersCharacterStat.map((stat) => {
                    if (rec.id == stat.characterStat.statName.toUpperCase()) {
                      let num = 0;
                      switch (rec.statType) {
                        case 3: //Number
                          num = stat.number
                          break;
                        case 5: //Current Max
                          if (rec.type == 1)//current
                          {
                            num = stat.current
                          }
                          else if (rec.type == 2)//Max
                          {
                            num = stat.maximum
                          }
                          break;
                        case 7: //Val Sub-Val
                          if (rec.type == 3)//value
                          {
                            num = +stat.value
                          }
                          else if (rec.type == 4)//sub-value
                          {
                            num = stat.subValue
                          }
                          break;
                        case 12: //Calculation
                          num = stat.calculationResult
                          break;
                        case STAT_TYPE.Combo: //Combo
                          num = stat.defaultValue
                          break;
                        case STAT_TYPE.Choice: //Choice

                          num = stat.defaultValue
                          break;
                        case STAT_TYPE.Condition: //Condition
                          let characterStatConditionsfilter = this.ConditionsValuesList.filter((Cs) => Cs.characterStatId == rec.id);
                          let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.CharacterStatsValues.charactersCharacterStat);
                          num = +result;
                          break;
                        default:
                          break;
                      }
                      if (num)
                        calculationString = calculationString.replace(rec.originaltext, num.toString());
                      else
                        calculationString = calculationString.replace(rec.originaltext, '0');
                      //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
                    }

                  });

                  finalCalcString = calculationString;
                });
              }
              ////////////////////////////////                    
              finalCalcString = finalCalcString.replace(/  +/g, ' ');
              finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');
              finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '').replace(/\* 0/g, '').replace(/\/ 0/g, '');
              try {
                finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
                  finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
                  ? finalCalcString.trim().slice(0, -1)
                  : finalCalcString.trim();
                item.characterStatTiles.charactersCharacterStat.calculationResult = +finalCalcString == 0 ? 0 : DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
              }
              catch (ex) {
                item.characterStatTiles.charactersCharacterStat.calculationResult = 0;
                //Curnt_Stat.calculationResult = this.getCalculationResult(Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation);
              }
              if (isNaN(item.characterStatTiles.charactersCharacterStat.calculationResult)) {
                item.characterStatTiles.charactersCharacterStat.calculationResult = 0;
              }
              if (this.CharacterStatsValues.charactersCharacterStat) {
                if (this.CharacterStatsValues.charactersCharacterStat.length) {
                  this.CharacterStatsValues.charactersCharacterStat.map((UpdateStat) => {
                    if (UpdateStat.characterStatId == item.characterStatTiles.charactersCharacterStat.characterStatId) {
                      UpdateStat.calculationResult = item.characterStatTiles.charactersCharacterStat.calculationResult;
                    }
                  })

                }

              }
            }
          }
        }
        if (item.characterStatTiles.charactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Toggle) {
          if (item.characterStatTiles.charactersCharacterStat.isCustom) {
            item.characterStatTiles.charactersCharacterStat.characterCustomToggles.map((togg, index) => {
              if (index == 0) {
                togg.initial = true;
              }
              else {
                togg.initial = false;
              }
            })
          }
        }
        if (item.characterStatTiles.charactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Condition) {
          let result = '';

          if (item.characterStatTiles.charactersCharacterStat.characterStat.characterStatConditions) {
            if (item.characterStatTiles.charactersCharacterStat.characterStat.characterStatConditions.length) {
              let SkipNextEntries: boolean = false;
              item.characterStatTiles.charactersCharacterStat.characterStat.characterStatConditions.map((Condition: CharacterStatConditionViewModel) => {
                if (!SkipNextEntries) {
                  //let ConditionStatValue: string = this.GetValueFromStatsByStatID(Condition.ifClauseStatId, Condition.ifClauseStattype);
                  let ConditionStatValue: string = '';
                  if (Condition.ifClauseStatText) {
                    let _inventoreyWeight = this.CharacterStatsValues.character.inventoryWeight;
                    try {
                      this.CharacterStatsValues.characterCurrency.map(x => {
                        let _weight = x.weightValue * x.amount;
                        _weight = _weight ? _weight : 0;
                        _inventoreyWeight += _weight;
                      })
                    } catch (err) { }
                    ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(_inventoreyWeight, this.CharacterStatsValues.charactersCharacterStat, Condition, false);
                  }
                  let operator = "";
                  let _inventoreyWeight = this.CharacterStatsValues.character.inventoryWeight;
                  try {
                    this.CharacterStatsValues.characterCurrency.map(x => {
                      let _weight = x.weightValue * x.amount;
                      _weight = _weight ? _weight : 0;
                      _inventoreyWeight += _weight;
                    })
                  } catch (err) { }
                  let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(_inventoreyWeight, this.CharacterStatsValues.charactersCharacterStat, Condition, true); //Condition.compareValue;
                  let ConditionTrueResult = Condition.result;


                  if (Condition.sortOrder != item.characterStatTiles.charactersCharacterStat.characterStat.characterStatConditions.length) {//if and Else If Part
                    if (Condition.conditionOperator) {
                      //////////////////////////////////////////////////////////////////

                      if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUALS ||
                        Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.NOT_EQUALS ||
                        Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.GREATER_THAN ||
                        Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_GREATER_THAN ||
                        Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.LESS_THAN ||
                        Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_LESS_THAN) {

                        operator = Condition.conditionOperator.symbol;
                        let ConditionCheckString = '';
                        if (Condition.isNumeric) {
                          ConditionStatValue = ConditionStatValue ? ConditionStatValue : "0";
                          ValueToCompare = ValueToCompare ? ValueToCompare : "0";
                          ConditionCheckString = ConditionStatValue + ' ' + operator + ' ' + ValueToCompare;
                        }
                        else {
                          ConditionCheckString = ' "' + ConditionStatValue + '" ' + operator + ' "' + ValueToCompare + '" ';
                        }
                        ConditionCheckString = ConditionCheckString.toUpperCase();
                        let conditionCheck = eval(ConditionCheckString);
                        if ((typeof (conditionCheck)) == "boolean") {
                          if (conditionCheck) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                      }


                      else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_BLANK) {
                        if (!ConditionStatValue) {
                          result = ConditionTrueResult;
                          SkipNextEntries = true;
                        }
                      }
                      else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_NOT_BLANK) {
                        if (ConditionStatValue) {
                          result = ConditionTrueResult;
                          SkipNextEntries = true;
                        }
                      }
                      else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                        ValueToCompare = ValueToCompare ? ValueToCompare : '';
                        ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                        if (item.characterStatTiles.charactersCharacterStat.characterStat.isMultiSelect && item.characterStatTiles.charactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                          if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                        else {
                          if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                      }
                      else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                        ValueToCompare = ValueToCompare ? ValueToCompare : '';
                        ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                        if (item.characterStatTiles.charactersCharacterStat.characterStat.isMultiSelect && item.characterStatTiles.charactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                          if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                        else {
                          if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                      }
                      //////////////////////////////////////////////////////////////////
                    }
                  }
                  else {
                    let ConditionFalseResult = Condition.result;
                    result = ConditionFalseResult;
                    SkipNextEntries = true;
                  }
                }
              })
            }
          }
          item.characterStatTiles.charactersCharacterStat.text = result;
        }
      }
      else if (item.tileTypeId == TILES.TEXT) {
        let AllChoices: any[] = [];

        List.map((lst) => {
          if (lst.characterStatTiles) {
            if (lst.characterStatTiles.charactersCharacterStat) {
              if (lst.characterStatTiles.charactersCharacterStat.choice || lst.characterStatTiles.charactersCharacterStat.multiChoice) {
                lst.characterStatTiles.charactersCharacterStat.characterStat.characterStatChoices.map((ch) => {
                  AllChoices.push(ch);
                })
              }
            }
          }
        })
        let _SqrBrktStart = "_SQRBRKTSTART";
        let _SqrBrktEnd = "_SQRBRKTEND";
        let _InventoryWeight = "INVENTORYWEIGHT";
        let text = item.textTiles.text;

        if (this.CharacterStatsValues.charactersCharacterStat) {
          this.CharacterStatsValues.charactersCharacterStat.map((stat) => {

            if (item.textTiles.text) {
              if (item.textTiles.text.toUpperCase().indexOf("[" + _InventoryWeight + "]") > -1) {
                text = text.replace(/\[/g, _SqrBrktStart);
                text = text.replace(/\]/g, _SqrBrktEnd);
                let expText: string = (_SqrBrktStart + _InventoryWeight.toUpperCase() + _SqrBrktEnd).toUpperCase();
                if (text.toUpperCase().indexOf(expText) > -1) {
                  let expression = new RegExp(expText, 'g');

                  let value: string = this.CharacterStatsValues.character.inventoryWeight;

                  try {
                    this.CharacterStatsValues.characterCurrency.map(x => {
                      let _weight = x.weightValue * x.amount;
                      _weight = _weight ? _weight : 0;
                      value += _weight;
                    })
                  } catch (err) { }

                  text = text.toUpperCase().replace(expression, value);
                  item.textTiles.displaytext = text;
                  item.textTiles.displaytext = item.textTiles.displaytext.replace(new RegExp(_SqrBrktStart, 'g'), "[");
                  item.textTiles.displaytext = item.textTiles.displaytext.replace(new RegExp(_SqrBrktEnd, 'g'), "]");
                  //})
                }
              }
              if (item.textTiles.text.toUpperCase().indexOf("[" + stat.characterStat.statName.toUpperCase() + "]") > -1) {
                text = text.replace(/\[/g, _SqrBrktStart);
                text = text.replace(/\]/g, _SqrBrktEnd);
                //let expression = new RegExp("\[" + stat.characterStat.statName.toUpperCase() +"\]", 'g');
                let expText: string = (_SqrBrktStart + stat.characterStat.statName.toUpperCase() + _SqrBrktEnd).toUpperCase();
                if (text.toUpperCase().indexOf(expText) > -1) {
                  let expression = new RegExp(expText, 'g');
                  //item.textTiles.text.split(expression).map((x) => {
                  let value: string = "";
                  let defVal = expText.replace(new RegExp(_SqrBrktStart, 'g'), "[").replace(new RegExp(_SqrBrktEnd, 'g'), "]");
                  switch (stat.characterStat.characterStatTypeId) {
                    case STAT_TYPE.Choice:
                      if (stat.choice) {
                        AllChoices.map((ach) => {
                          if (stat.choice == ach.characterStatChoiceId) {
                            value = ach.statChoiceValue;
                          }
                        })

                      }
                      else if (stat.multiChoice) {
                        stat.multiChoice.split(';').map((mchid) => {
                          AllChoices.map((ach, index) => {
                            if (mchid == ach.characterStatChoiceId) {
                              value += ach.statChoiceValue + ", ";
                            }
                          })
                        })
                        if (value.length) {
                          value = value.substring(0, value.length - 2)
                        }
                      }
                      break;
                    case STAT_TYPE.Command:
                      value = stat.command;
                      break;
                    case STAT_TYPE.OnOff:
                      value = stat.onOff;
                      break;
                    case STAT_TYPE.RichText:
                      value = defVal;
                      break;
                    case STAT_TYPE.Text:
                      value = stat.text;
                      break;
                    case STAT_TYPE.YesNo:
                      value = stat.yesNo;
                      break;
                    case STAT_TYPE.Number:
                      value = stat.number
                      break;
                    case STAT_TYPE.CurrentMax:
                      value = stat.current + " / " + stat.maximum;
                      break;
                    case STAT_TYPE.ValueSubValue:
                      value = stat.value + " (" + stat.subValue + ")";
                      break;
                    case STAT_TYPE.Calculation:
                      value = stat.calculationResult
                      break;
                    case STAT_TYPE.Combo:
                      let defaultValue = +stat.defaultValue;
                      let combotext = stat.comboText ? stat.comboText : '';
                      value = (defaultValue + " / " + combotext).toString();
                      break;
                    case STAT_TYPE.Toggle:
                      switch (true) {
                        case stat.display:
                          value = defVal;
                          break;
                        case stat.yesNo:
                          value = stat.isYes ? "Yes" : "No";
                          break;
                        case stat.onOff:
                          value = stat.isOn ? "On" : "Off";
                          break;
                        case stat.isCustom:
                          value = defVal;
                          break;
                        default:
                      }
                      break;
                    case STAT_TYPE.Condition: //Condition
                      let characterStatConditionsfilter = this.ConditionsValuesList.filter((Cs) => Cs.characterStatId == stat.characterStat.characterStatId);
                      let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.CharacterStatsValues.charactersCharacterStat);
                      value = result;
                    default:
                      break;
                  }
                  text = text.toUpperCase().replace(expression, value);
                  item.textTiles.displaytext = text;
                  item.textTiles.displaytext = item.textTiles.displaytext.replace(new RegExp(_SqrBrktStart, 'g'), "[");
                  item.textTiles.displaytext = item.textTiles.displaytext.replace(new RegExp(_SqrBrktEnd, 'g'), "]");
                  //})
                }

              }

            }
          })
        }
      }
      else if (item.tileTypeId == TILES.TOGGLE && item.toggleTiles != null) {

        let isCustomToggleInitialSet = false;
        item.toggleTiles.tileToggle.tileCustomToggles.map((togg, index) => {
          if (togg.tileCustomToggleId == item.toggleTiles.customValue) {
            togg.initial = true;
            isCustomToggleInitialSet = true;
          }
          else {
            togg.initial = false;
          }
        })
        if (!isCustomToggleInitialSet) {
          item.toggleTiles.tileToggle.tileCustomToggles.map((togg, index) => {
            if (index == 0) {
              togg.initial = true;
            }
            else {
              togg.initial = false;
            }
          })
        }


      }
      else if (item.tileTypeId == TILES.CHARACTERSTATCLUSTER) {
        item.characterStatClusterTiles.showTitle = true;
        if (item.characterStatClusterTiles.displayCharactersCharacterStat) {
          if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.RichText) {
            item.characterStatClusterTiles.displayCharactersCharacterStat.richText = item.characterStatClusterTiles.displayCharactersCharacterStat.richText == null ? '' : item.characterStatClusterTiles.displayCharactersCharacterStat.richText;

          }
          if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Calculation) {
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatCalcs.length) {
              let calculationIds = item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatCalcs[0].statCalculationIds;

              if (calculationIds) {
                let inventoreyWeight = this.CharacterStatsValues.character.inventoryWeight;
                try {
                  this.CharacterStatsValues.characterCurrency.map(x => {
                    let _weight = x.weightValue * x.amount;
                    _weight = _weight ? _weight : 0;
                    inventoreyWeight += _weight;
                  })
                } catch (err) { }

                calculationIds.split("[-1]").map((item) => {
                  calculationIds = calculationIds.replace("[-1]", " " + inventoreyWeight + " ");
                });

                ////////////////////////////////////////////
                let Curnt_Stat = item.characterStatClusterTiles.displayCharactersCharacterStat;
                let finalCalcString = '';
                if (Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation != null && Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation != undefined) {
                  Curnt_Stat.displayCalculation = Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation;
                  let IDs: any[] = [];
                  let CalcString = calculationIds;
                  finalCalcString = CalcString;
                  if (calculationIds) {
                    calculationIds.split(/\[(.*?)\]/g).map((rec) => {

                      let id = ''; let flag = false; let type = 0; let statType = 0;
                      if (rec.split('_').length > 1) {
                        id = rec.split('_')[0].replace('[', '').replace(']', '');
                        type = parseInt(rec.split('_')[1])
                      }
                      else {
                        id = rec.replace('[', '').replace(']', '');
                        type = 0
                      }
                      this.CharacterStatsValues.charactersCharacterStat.map((q) => {
                        if (!flag) {
                          flag = (parseInt(id) == q.characterStatId);
                          statType = q.characterStat.characterStatTypeId
                        }
                      })
                      if (flag) {
                        IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
                      }
                      else if (+id == -1) {
                        IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
                      }
                    })

                  }
                  IDs.map((rec) => {
                    if (+rec.id == -1 && this.character.inventoryWeight) {
                      CalcString = CalcString.replace(rec.originaltext, this.character.inventoryWeight);
                    } else {
                      this.CharacterStatsValues.charactersCharacterStat.map((stat) => {
                        if (rec.id == stat.characterStatId) {
                          let num = 0;
                          switch (rec.statType) {
                            case 3: //Number
                              num = stat.number
                              break;
                            case 5: //Current Max
                              if (rec.type == 1)//current
                              {
                                num = stat.current
                              }
                              else if (rec.type == 2)//Max
                              {
                                num = stat.maximum
                              }
                              break;
                            case 7: //Val Sub-Val
                              if (rec.type == 3)//value
                              {
                                num = +stat.value
                              }
                              else if (rec.type == 4)//sub-value
                              {
                                num = stat.subValue
                              }
                              break;
                            case 12: //Calculation
                              num = stat.calculationResult
                              break;
                            case STAT_TYPE.Combo: //Combo

                              num = stat.defaultValue
                              break;
                            case STAT_TYPE.Choice: //Choice

                              num = stat.defaultValue
                              break;
                            case STAT_TYPE.Condition:
                              let characterStatConditionsfilter = this.ConditionsValuesList.filter((Cs) => Cs.characterStatId == rec.id);
                              let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.CharacterStatsValues.charactersCharacterStat);
                              num = +result;

                              break;
                            default:
                              break;
                          }

                          if (num)
                            CalcString = CalcString.replace(rec.originaltext, num);
                          else
                            CalcString = CalcString.replace(rec.originaltext, 0);
                          //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
                        }
                      });
                    }
                    finalCalcString = CalcString;

                  });
                }
                try {
                  finalCalcString = finalCalcString.replace(/ /g, '');
                  finalCalcString = finalCalcString.replace(/RU/g, ' RU').replace(/RD/g, ' RD').replace(/KL/g, ' KL').replace(/KH/g, ' KH').replace(/DL/g, ' DL').replace(/DH/g, ' DH');
                  finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');

                  finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
                    finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
                    finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
                    finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
                    ? finalCalcString.trim().slice(0, -1)
                    : finalCalcString.trim();

                  item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult = +finalCalcString == 0 ? 0 : DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
                }
                catch (ex) {
                  item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult = 0;
                  //Curnt_Stat.calculationResult = this.getCalculationResult(Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation);
                }
                if (isNaN(item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult)) {
                  item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult = 0;
                }
                if (this.CharacterStatsValues.charactersCharacterStat) {
                  if (this.CharacterStatsValues.charactersCharacterStat.length) {
                    this.CharacterStatsValues.charactersCharacterStat.map((UpdateStat) => {
                      if (UpdateStat.characterStatId == item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatId) {
                        UpdateStat.calculationResult = item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult;
                      }
                    })

                  }

                }
                ////////////////////////////////////////////

              }
              else {
                //For Old Records
                //////////////////////////////////////////////
                let calculationString: string = item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatCalcs[0].statCalculation.toUpperCase();
                let inventoreyWeight = this.CharacterStatsValues.character.inventoryWeight;
                try {
                  this.CharacterStatsValues.characterCurrency.map(x => {
                    let _weight = x.weightValue * x.amount;
                    _weight = _weight ? _weight : 0;
                    inventoreyWeight += _weight;
                  })
                } catch (err) { }

                let finalCalcString: string = '';

                calculationString.split("[INVENTORYWEIGHT]").map((item) => {
                  calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
                })
                let IDs: any[] = [];
                finalCalcString = calculationString;
                if (calculationString) {
                  calculationString.split(/\[(.*?)\]/g).map((rec) => {

                    let id = ''; let flag = false; let type = 0; let statType = 0;
                    if (rec.split('_').length > 1) {
                      id = rec.split('_')[0].replace('[', '').replace(']', '');
                      type = parseInt(rec.split('_')[1])
                    }
                    else {
                      id = rec.replace('[', '').replace(']', '');
                      type = 0
                    }
                    this.CharacterStatsValues.charactersCharacterStat.map((q) => {
                      if (!flag) {
                        flag = (id == q.characterStat.statName.toUpperCase());
                        statType = q.characterStat.characterStatTypeId
                      }
                    })
                    if (flag) {
                      IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
                    }
                    else if (+id == -1) {
                      IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
                    }
                  })
                  IDs.map((rec) => {
                    this.CharacterStatsValues.charactersCharacterStat.map((stat) => {
                      if (rec.id == stat.characterStat.statName.toUpperCase()) {
                        let num = 0;
                        switch (rec.statType) {
                          case 3: //Number
                            num = stat.number
                            break;
                          case 5: //Current Max
                            if (rec.type == 1)//current
                            {
                              num = stat.current
                            }
                            else if (rec.type == 2)//Max
                            {
                              num = stat.maximum
                            }
                            break;
                          case 7: //Val Sub-Val
                            if (rec.type == 3)//value
                            {
                              num = +stat.value
                            }
                            else if (rec.type == 4)//sub-value
                            {
                              num = stat.subValue
                            }
                            break;
                          case 12: //Calculation
                            num = stat.calculationResult
                            break;
                          case STAT_TYPE.Combo: //Combo

                            num = stat.defaultValue
                            break;
                          case STAT_TYPE.Choice: //Choice

                            num = stat.defaultValue
                            break;
                          case STAT_TYPE.Condition:
                            let characterStatConditionsfilter = this.ConditionsValuesList.filter((Cs) => Cs.characterStatId == rec.id);
                            let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.CharacterStatsValues.charactersCharacterStat);
                            num = +result;
                            break;
                          default:
                            break;
                        }
                        if (num)
                          calculationString = calculationString.replace(rec.originaltext, num.toString());
                        else
                          calculationString = calculationString.replace(rec.originaltext, '0');
                        //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
                      }

                    });

                    finalCalcString = calculationString;
                  });
                }
                ////////////////////////////////                    
                finalCalcString = finalCalcString.replace(/  +/g, ' ');
                finalCalcString = finalCalcString.replace(/RU/g, ' RU').replace(/RD/g, ' RD').replace(/KL/g, ' KL').replace(/KH/g, ' KH').replace(/DL/g, ' DL').replace(/DH/g, ' DH');
                finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');
                finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '').replace(/\* 0/g, '').replace(/\/ 0/g, '');
                try {
                  finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
                    finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
                    finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
                    finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
                    ? finalCalcString.trim().slice(0, -1)
                    : finalCalcString.trim();

                  item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult = +finalCalcString == 0 ? 0 : DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
                }
                catch (ex) {
                  item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult = 0;
                  //Curnt_Stat.calculationResult = this.getCalculationResult(Curnt_Stat.characterStat.characterStatCalcs[0].statCalculation);
                }
                if (isNaN(item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult)) {
                  item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult = 0;
                }

                if (this.CharacterStatsValues.charactersCharacterStat) {
                  if (this.CharacterStatsValues.charactersCharacterStat.length) {
                    this.CharacterStatsValues.charactersCharacterStat.map((UpdateStat) => {
                      if (UpdateStat.characterStatId == item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatId) {
                        UpdateStat.calculationResult = item.characterStatClusterTiles.displayCharactersCharacterStat.calculationResult;
                      }
                    })

                  }

                }
              }
            }
          }
          if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Toggle) {
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.isCustom) {
              let isCustomToggleInitialSet = false;
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterCustomToggles.map((togg, index) => {

                if (togg.customToggleId == item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue) {
                  togg.initial = true;
                  isCustomToggleInitialSet = true;
                }
                else {
                  togg.initial = false;
                }
              })
              if (!isCustomToggleInitialSet) {
                item.characterStatClusterTiles.displayCharactersCharacterStat.characterCustomToggles.map((togg, index) => {

                  if (index == 0) {
                    togg.initial = true;
                  }
                  else {
                    togg.initial = false;
                  }
                })
              }

            }
          }

          if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Condition) {
            let result = '';

            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatConditions) {
              if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatConditions.length) {
                let SkipNextEntries: boolean = false;
                item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatConditions.map((Condition: CharacterStatConditionViewModel) => {
                  if (!SkipNextEntries) {
                    //let ConditionStatValue: string = this.GetValueFromStatsByStatID(Condition.ifClauseStatId, Condition.ifClauseStattype);
                    let ConditionStatValue: string = '';
                    if (Condition.ifClauseStatText) {
                      let _inventoreyWeight = this.CharacterStatsValues.character.inventoryWeight;
                      try {
                        this.CharacterStatsValues.characterCurrency.map(x => {
                          let _weight = x.weightValue * x.amount;
                          _weight = _weight ? _weight : 0;
                          _inventoreyWeight += _weight;
                        })
                      } catch (err) { }
                      ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(_inventoreyWeight, this.CharacterStatsValues.charactersCharacterStat, Condition, false);
                    }
                    let operator = "";
                    let _inventoreyWeight = this.CharacterStatsValues.character.inventoryWeight;
                    try {
                      this.CharacterStatsValues.characterCurrency.map(x => {
                        let _weight = x.weightValue * x.amount;
                        _weight = _weight ? _weight : 0;
                        _inventoreyWeight += _weight;
                      })
                    } catch (err) { }
                    let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(_inventoreyWeight, this.CharacterStatsValues.charactersCharacterStat, Condition, true); //Condition.compareValue;
                    let ConditionTrueResult = Condition.result;


                    if (Condition.sortOrder != item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatConditions.length) {//if and Else If Part
                      if (Condition.conditionOperator) {
                        //////////////////////////////////////////////////////////////////

                        if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUALS ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.NOT_EQUALS ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.GREATER_THAN ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_GREATER_THAN ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.LESS_THAN ||
                          Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_LESS_THAN) {

                          operator = Condition.conditionOperator.symbol;
                          let ConditionCheckString = '';
                          if (Condition.isNumeric) {
                            ConditionStatValue = ConditionStatValue ? ConditionStatValue : "0";
                            ValueToCompare = ValueToCompare ? ValueToCompare : "0";
                            ConditionCheckString = ConditionStatValue + ' ' + operator + ' ' + ValueToCompare;
                          }
                          else {
                            ConditionCheckString = ' "' + ConditionStatValue + '" ' + operator + ' "' + ValueToCompare + '" ';
                          }
                          ConditionCheckString = ConditionCheckString.toUpperCase();
                          let conditionCheck = eval(ConditionCheckString);
                          if ((typeof (conditionCheck)) == "boolean") {
                            if (conditionCheck) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                        }


                        else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_BLANK) {
                          if (!ConditionStatValue) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                        else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_NOT_BLANK) {
                          if (ConditionStatValue) {
                            result = ConditionTrueResult;
                            SkipNextEntries = true;
                          }
                        }
                        else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
                          ValueToCompare = ValueToCompare ? ValueToCompare : '';
                          ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                          if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.isMultiSelect && item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                            if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                          else {
                            if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                        }
                        else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
                          ValueToCompare = ValueToCompare ? ValueToCompare : '';
                          ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
                          if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.isMultiSelect && item.characterStatClusterTiles.displayCharactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


                            if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                          else {
                            if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
                              result = ConditionTrueResult;
                              SkipNextEntries = true;
                            }
                          }
                        }
                        //////////////////////////////////////////////////////////////////
                      }
                    }
                    else {
                      let ConditionFalseResult = Condition.result;
                      result = ConditionFalseResult;
                      SkipNextEntries = true;
                    }
                  }
                })
              }
            }
            item.characterStatClusterTiles.displayCharactersCharacterStat.text = result;
          }
        }

      }
      ////////////////////////////////
      let box: Box = { config: ngGridItemConfig, tile: item, IsCharacter: false };
      boxes.push(box);
    })
    return boxes;
  }

  grid_onItemChange(items) {
    this.currentGridItems = items
    if (this.initial) {
      let configList: TileConfig[] = [];
      items.map((item) => {
        //let config: TileConfig = { characterTileId: item.payload, payload: item.payload, col: item.col, row: item.row, sizeX: item.sizex, sizeY: item.sizey };
        //this.createUpdateTileConfig(config, false);
        configList.push({ characterTileId: item.payload, payload: item.payload, col: item.col, row: item.row, sizeX: item.sizex, sizeY: item.sizey })
      })
      this.createUpdateTileConfigList(configList, false);
      this.finalTileList = Object.assign(configList);
      this.initial = false;
    }
    if (this.isRefreshed) {
      this.IsAnyTileUpdated = true;
      let configList: TileConfig[] = [];
      items.map((item) => {
        //let config: TileConfig = { characterTileId: item.payload, payload: item.payload, col: item.col, row: item.row, sizeX: item.sizex, sizeY: item.sizey };
        //this.createUpdateTileConfig(config, true);
        configList.push({ characterTileId: item.payload, payload: item.payload, col: item.col, row: item.row, sizeX: item.sizex, sizeY: item.sizey });

      })
      //this.createUpdateTileConfigList(configList, true);
      this.finalTileList = Object.assign(configList);
    }
    let lastrow = 0;
    let lastcol = 0;
    let lastsizex = 0;
    let lastsizey = 0;
    let uid = 0;
    items.map((item) => {
      if (item.row > lastrow) {
        lastrow = item.row;
      }
    });
    items.map((item) => {
      if (item.row == lastrow) {
        if (item.col > lastcol) {
          lastcol = item.col;
          uid = item.uid;
        }
      }
    });
    items.map((item) => {
      if (item.uid == uid) {
        this.BoxesCurrentColumn = item.col
        this.BoxesCurrentRow = item.row
        if (this.BoxesCurrentColumn < this.columnsInGrid - 1) {
          this.BoxesCurrentColumn = this.BoxesCurrentColumn + 2;
        }
        else {
          this.BoxesCurrentColumn = this.startIndex;
          this.BoxesCurrentRow = this.BoxesCurrentRow + 2;
        }
      }
    });
  }

  createUpdateTileConfig(config: TileConfig, update: boolean) {

    this.tileConfig.createUpdateTileConfig<TileConfig>(config, update)
      .subscribe(data => {

      }, error => {

      }, () => { });
  }
  UpdateTileConfigList(configList: TileConfig[]) {
    this.tileConfig.createUpdateTileConfigList<TileConfig[]>(configList, true)
      .subscribe(data => {
        this.StateChanged = false;
      }, error => {
        this.isLoading = false;
      }, () => { });
  }
  createUpdateTileConfigList(configList: TileConfig[], update: boolean, redriectToCharacter: boolean = false, viewLoader: boolean = true, redriectToEditMode: boolean = false) {
    if (update) {
      this.isLoading = viewLoader;
      if (this.IsAnyTileUpdated) {
        this.tileConfig.createUpdateTileConfigList<TileConfig[]>(configList, update)
          .subscribe(data => {
            this.StateChanged = false;

            if (redriectToEditMode) {
              this.router.navigate(['/character/tiles', this.characterId]);////////////
              this.isLoading = false;
            } else if (redriectToCharacter) {
              this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");
              this.router.navigate(['/character/dashboard', this.characterId]);
            }
          }, error => {
            this.isLoading = false;
          }, () => { });
      }
      else {
        if (redriectToEditMode) {
          this.router.navigate(['/character/tiles', this.characterId]);////////////
          this.isLoading = false;
        }
        else {
          this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");
          this.router.navigate(['/character/dashboard', this.characterId]);
        }
      }
    }
    else {
      this.tileConfig.createUpdateTileConfigList<TileConfig[]>(configList, update)
        .subscribe(data => {
          if (redriectToEditMode) {
            this.router.navigate(['/character/tiles', this.characterId]);////////////
            this.isLoading = false;
          }
          else if (redriectToCharacter) {
            this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");
            this.router.navigate(['/character/dashboard', this.characterId]);
          }
        }, error => {
          this.isLoading = false;
        }, () => { });
    }

  }

  //deleteTileConfig(characterTileID) {

  //    this.tileConfig.deleteTileConfig<TileConfig>(characterTileID)
  //        .subscribe(data => {

  //        }, error => {

  //        }, () => { });
  //}
  isMobile() {
    try { document.createEvent("TouchEvent"); return true; }
    catch (e) {
      if (window.innerWidth < 1201) { return true }
      return false;
    }
  }
  save(redirectto: any = undefined, params: any = undefined) {
    this.createUpdateTileConfigList(this.finalTileList, true, true);
    // this.createUpdateTileConfigList(this.finalTileList, true, true, redirectto, params);
  }
  navigateTo(redirectto: any, params: any = undefined) {

    if (this.StateChanged) {
      this.alertService.showDialog('You have unsaved changes, would you like to save those now?',
        DialogType.confirm, () => this.save(redirectto, params), () => this.cancelCallback(redirectto, params), "Yes", "No");
    }
    else {
      this.cancelCallback(redirectto, params);
    }
  }

  public cancelCallback(redirectto: any, params: any = undefined) {
    this.StateChanged = false;
    //if (redirectto == 1) {
    //    this.router.navigate(['/character/dashboard', this.characterId]);
    //}
    //else if (redirectto == 2) {
    //    this.router.navigate(['/ruleset/item-master/', this.characterId]);
    //}
    //else if (redirectto == 3) {
    //    this.router.navigate(['/ruleset/spell/', this.characterId]);
    //}
    //else if (redirectto == 4) {
    //    this.router.navigate(['/ruleset/ability/', this.characterId]);
    //}
    //else if (redirectto == 5) {
    //    this.router.navigate(['/character-stats/', this.characterId]);
    //}
    //else if (redirectto == 6) {
    //    this.onLayoutSelect(params);
    //}
    //else if (redirectto == 7) {
    //    this.onPageSelect(params);
    //}
  }
  getErrorImage(e: any = undefined, Tile: any = undefined) {
    try {
      switch (Tile.linkType) {
        case "Item":
          e.src = '../assets/images/DefaultImages/Item.jpg';
          break;
        case "Spell":
          e.src = '../assets/images/DefaultImages/Spell.jpg';
          break;
        case "Ability":
          e.src = '../assets/images/DefaultImages/ability.jpg';
          break;
        default:
          e.src = '../assets/images/DefaultImages/Spell.jpg';
          break;
      }
    }
    catch (ex) {
      e.src = '../assets/images/DefaultImages/Spell.jpg';
    }
  }
  getTileSize() {
    let Width = window.innerWidth;
    let minSize: number = 0;
    let maxSize: number = 0;
    let margin = [5];
    if (Width <= 315) {
      minSize = 10 / 2;
      maxSize = 20 / 2;
      margin = [1];
    }
    else if (Width >= 316 && Width <= 330) {
      minSize = 15 / 2;
      maxSize = 25 / 2;
      margin = [2];
    }
    else if (Width >= 331 && Width <= 350) {
      minSize = 18 / 2;
      maxSize = 28 / 2;
      margin = [2];
    }
    else if (Width >= 351 && Width <= 400) {
      minSize = 20 / 2;
      maxSize = 30 / 2;
      margin = [2];
    }
    else if (Width >= 401 && Width <= 450) {
      minSize = 25 / 2;
      maxSize = 33 / 2;
      margin = [2];
    }
    else if (Width >= 451 && Width <= 500) {
      minSize = 28 / 2;
      maxSize = 36 / 2;
      margin = [3];
    }
    else if (Width >= 501 && Width <= 550) {
      minSize = 30 / 2;
      maxSize = 39 / 2;
      margin = [3];
    }
    else if (Width >= 551 && Width <= 600) {
      minSize = 32 / 2;
      maxSize = 42 / 2;
      margin = [3];
    }
    else if (Width >= 601 && Width <= 650) {
      minSize = 37 / 2;
      maxSize = 47 / 2;
      margin = [3];
    }
    else if (Width >= 651 && Width <= 700) {
      minSize = 42 / 2;
      maxSize = 52 / 2;
      margin = [3];
    }
    else if (Width >= 701 && Width <= 750) {
      minSize = 47 / 2;
      maxSize = 57 / 2;
      margin = [4];
    }
    else if (Width >= 751 && Width <= 800) {
      minSize = 47 / 2;
      maxSize = 57 / 2;
      margin = [4];
    }
    else if (Width >= 801 && Width <= 850) {
      minSize = 52 / 2;
      maxSize = 62 / 2;
      margin = [4];
    }
    else if (Width >= 851 && Width <= 900) {
      minSize = 52 / 2;
      maxSize = 62 / 2;
      margin = [4];
    }
    else if (Width >= 901 && Width <= 950) {
      minSize = 57 / 2;
      maxSize = 67 / 2;
      margin = [5];
    }
    else if (Width >= 951 && Width <= 992) {
      minSize = 57 / 2;
      maxSize = 67 / 2;
      margin = [5];
    }
    else {
      minSize = 50;
      maxSize = 60;
    }
    return Object.assign({}, { min: minSize, max: maxSize, margins: margin });
  }
  GetLinkRecordImage(id, linkType) {
    let imagePath = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png';
    if (this.statLinkRecords) {
      if (this.statLinkRecords.length) {
        if (this.statLinkRecords.length > 0) {
          this.statLinkRecords.map((link) => {
            if (link.id == id && link.type == linkType) {
              imagePath = link.image;
            }
          })
        }
      }
    }
    return imagePath;

  }
  GetLinkRecordText(id, linkType) {
    let name = "";
    if (this.statLinkRecords) {
      if (this.statLinkRecords.length) {
        if (this.statLinkRecords.length > 0) {
          this.statLinkRecords.map((link) => {
            if (link.id == id && link.type == linkType) {
              name = link.name;
            }
          })
        }
      }
    }
    return name;

  }
  //GetValueFromStatsByStatID(ifClauseStatId: number, ifClauseStattype: number): string {
  //  let result = '';
  //  this.ConditionsValuesList.map((ccs: CharactersCharacterStat) => {
  //    if (ccs.characterStatId == ifClauseStatId) {
  //      switch (ccs.characterStat.characterStatTypeId) {
  //        case STAT_TYPE.Text:
  //          result = ccs.text;
  //          break;
  //        case STAT_TYPE.Number:
  //          result = ccs.number.toString();
  //          break;
  //        case STAT_TYPE.CurrentMax:
  //          if (ifClauseStattype == 2) {
  //            result = ccs.maximum.toString();
  //          }
  //          else {
  //            result = ccs.current.toString();
  //          }
  //          break;
  //        case STAT_TYPE.Choice:

  //          if (ccs.characterStat.isMultiSelect) {
  //            result = this.GetChoiceValue(ccs.multiChoice, ccs.characterStat.characterStatChoices)//ccs.multiChoice.replace(/;/g, this.choiceArraySplitter);
  //          }
  //          else {
  //            result = this.GetChoiceValue(ccs.choice, ccs.characterStat.characterStatChoices);
  //          }
  //          break;
  //        case STAT_TYPE.ValueSubValue:
  //          if (ifClauseStattype == 2) {
  //            result = ccs.subValue.toString();
  //          }
  //          else {
  //            result = ccs.value.toString();
  //          }
  //          break;
  //        case STAT_TYPE.Combo:
  //          if (ifClauseStattype == 2) {
  //            result = ccs.comboText;
  //          }
  //          else {
  //            result = ccs.defaultValue.toString();
  //          }
  //          break;
  //        case STAT_TYPE.Calculation:
  //          result = ccs.calculationResult.toString();
  //          break;

  //        default:
  //      }
  //    }
  //  })
  //  return result ? result : '';
  //}
  GetChoiceValue(ids, choicesList) {

    let result = '';
    if (choicesList && ids) {
      let idList = ids.split(';');
      if (choicesList.length) {
        idList.map((id) => {
          choicesList.map((choice) => {
            if (id == choice.characterStatChoiceId) {
              result += (choice.statChoiceValue + ",");
            }
          })
        })

      }
    }
    result = result ? result.substring(0, result.length - 1) : '';
    return result;
  }

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
  }

  GotoCommand(cmd) {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = cmd;
  }

  ngOnDestroy() {
    this.localStorage.deleteData(DBkeys.IsManageCharacterTile);
  }

}


