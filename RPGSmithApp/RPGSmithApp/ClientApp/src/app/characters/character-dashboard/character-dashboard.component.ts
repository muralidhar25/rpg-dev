import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../core/common/alert.service';
import { AuthService } from "./../../core/auth/auth.service";
import { Utilities } from './../../core/common/utilities';
import { ServiceUtil } from './../../core/services/service-util';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { SharedService } from "./../../core/services/shared.service";

import { DBkeys } from './../../core/common/db-keys';
import { User } from './../../core/models/user.model';
import { LocalStoreManager } from './../../core/common/local-store-manager.service';
import { Characters } from './../../core/models/view-models/characters.model';
import { CharactersService } from './../../core/services/characters.service';
import { DiceRollComponent } from '../../shared/dice/dice-roll/dice-roll.component';
import { CharacterDashboardLayoutService } from "./../../core/services/character-dashboard-layout.service";
import { CharacterDashboardPageService } from "./../../core/services/character-dashboard-page.service";
import { CharacterDashboardLayout } from './../../core/models/view-models/character-dashboard-layout.model';
import { CharacterDashboardPage } from './../../core/models/view-models/character-dashboard-page.model';
import { LayoutFormComponent } from './layout-form/layout-form.component';
import { PageFormComponent } from './page-form/page-form.component';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { TileComponent } from "../../tile/tile.component";
import { CharacterTileService } from '../../core/services/character-tile.service';
import { EditNoteComponent } from "../../tile/note/edit-note/edit-note.component";
import { EditCounterComponent } from "../../tile/counter/edit-counter/edit-counter.component";
import { EditCharacterStatComponent } from "../../tile/character-stat/edit-character-stat/edit-character-stat.component";
import { EditImageComponent } from "../../tile/image/edit-image/edit-image.component";

import { NoteTileComponent } from '../../tile/note/note.component';
import { VIEW, TILES, STAT_TYPE, STAT_LINK_TYPE, CONDITION_OPERATOR_ENUM } from '../../core/models/enums';
import { Box } from '../../core/models/tiles/box.model';
import { NgGridConfig, NgGridItemConfig } from 'angular2-grid';
import { ItemsService } from "../../core/services/items.service";
import { AbilityService } from "../../core/services/ability.service";
import { SpellsService } from "../../core/services/spells.service";
import { CastComponent } from "../../shared/cast/cast.component";
import { DiceService } from "../../core/services/dice.service";
import { CharactersCharacterStat } from "../../core/models/view-models/characters-character-stats.model";
import { CharactersCharacterStatService } from "../../core/services/characters-character-stat.service";
import { EditTextComponent } from "../../tile/text/edit-text/edit-text.component";
import { CharacterStatConditionViewModel } from "../../core/models/view-models/character-stats.model";
import { AppService1 } from "../../app.service";
import { HeaderValues } from "../../core/models/headers.model";
import { BuffAndEffectService } from "../../core/services/buff-and-effect.service";
import { AddBuffAndEffectComponent } from "../../shared/buffs-and-effects/add-buffs-and-effects/add-buffs-and-effects.component";
import { EditCharacterStatClusterComponent } from "../../tile/character-stat-cluster/edit-character-stat-cluster/edit-character-stat-cluster.component";
import { CharacterSpellService } from "../../core/services/character-spells.service";
import { CharacterAbilityService } from "../../core/services/character-abilities.service";
import { MonsterTemplateService } from "../../core/services/monster-template.service";
import { CharacterTile } from "../../core/models/tiles/character-tile.model";
import { ImageTileComponent } from "../../tile/image/image.component";
import { CounterTileComponent } from "../../tile/counter/counter.component";
import { CharacterStatTileComponent } from "../../tile/character-stat/character-stat.component";
import { LinkTileComponent } from "../../tile/link/link.component";
import { ExecuteTileComponent } from "../../tile/execute/execute.component";
import { CommandTileComponent } from "../../tile/command/command.component";
import { TextTileComponent } from "../../tile/text/text.component";
import { BuffAndEffectTileComponent } from "../../tile/buff-and-effect/buff-and-effect.component";
import { ToggleTileComponent } from "../../tile/toggle/toggle.component";
import { CharacterStatClusterTileComponent } from "../../tile/character-stat-cluster/character-stat-cluster.component";
import { EditCurrencyComponent } from "../../tile/currency/edit-currency/edit-currency.component";
import { CurrencyTileComponent } from "../../tile/currency/currency.component";
import { Subscription } from "rxjs";
import { ItemMasterService } from "../../core/services/item-master.service";
import { LootService } from "../../core/services/loot.service";


@Component({
  selector: 'app-character-dashboard',
  templateUrl: './character-dashboard.component.html',
  styleUrls: ['./character-dashboard.component.scss']
})

export class CharacterDashboardComponent implements OnInit {

  STAT_TYPE = STAT_TYPE;
  TILES = TILES;
  isLoading = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  isLayoutDropdownOpen: boolean = false;
  isPageDropdownOpen: boolean = false;
  characterId: number;
  character: any = new Characters();
  characterlayouts: any;
  selectedlayout: any;
  foldClass: any = 'dropdown-menu input-list-items border-none';
  pagedrpClass: any = 'dropdown-menu input-list-items1 border-none';
  selectedPage: any;
  page: number = 1;
  pageSize: number = 6;
  page1: number = 1;
  pageSize1: number = 6;
  tiles: any = [];
  SortClick: boolean = false;
  rulesetModel: any;
  private startIndex: number = 1
  private BoxesCurrentRow: number = this.startIndex;
  private BoxesCurrentColumn: number = this.startIndex;
  private columnsInGrid: number = 14;
  headers: HeaderValues = new HeaderValues();
  pageRefresh: boolean;
  doesCharacterHasAllies: boolean = false;
  editMode: boolean = false;

  IsMobileScreen: boolean = this.isMobile();
  //public gridConfig: NgGridConfig = {
  //    'margins': [5],
  //    'draggable': false,
  //    'resizable': false,
  //    'max_cols': this.columnsInGrid,
  //    'max_rows': 0,
  //    'visible_cols': 0,
  //    'visible_rows': 0,
  //    'min_cols': 0,
  //    'min_rows': 0,
  //    'col_width': 70,
  //    'row_height': 70,
  //    'cascade': 'left',
  //    'min_width': 50,
  //    'min_height': 50,
  //    'fix_to_grid': false,
  //    'auto_style': true,
  //    'auto_resize': true,
  //    'maintain_ratio': true,
  //    'prefer_new': true,
  //    'limit_to_screen': false,
  //    'center_to_screen': true,
  //    'resize_directions': [
  //        "bottomleft",
  //        "bottomright",
  //        "bottom",
  //    ],
  //};
  IsComputerDevice: boolean = false;
  IsTabletDevice: boolean = false;
  IsMobileDevice: boolean = false;
  isSharedLayout: boolean = false;
  public gridConfig: NgGridConfig = {
    'margins': this.getTileSize().margins,
    'draggable': false,
    'resizable': false,
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
    'resize_directions': [
      "bottomleft",
      "bottomright"
    ],
  };
  pageId: number = 0;
  LayoutId: number = 0;
  pageDefaultData = new CharacterDashboardPage();
  //tempPageId: number = 0;
  //tempLayoutId: number = 0;
  private boxes: Box[] = [];
  noRecordFound: boolean = false;
  CharacterStatsValues: any;
  statLinkRecords: any;
  choiceArraySplitter: string = 'S###@Split@###S';
  ConditionsValuesList: CharactersCharacterStat[] = [];
  charNav: any = {};
  haspageRefresh: boolean;

  pauseBuffAndEffectAdd: boolean = false;
  pauseBuffAndEffectCreate: boolean = false;

  timeoutHandler: any;

  subs: Subscription;

  isInventoryLoading: boolean = false;
  isRulesetViewInventoryLoading: boolean = false;
  isAlliesLoading: boolean = false;
  isAbilitiesLoading: boolean = false;
  isRulesetViewAbilityLoading: boolean = false;
  isSpellsLoading: boolean = false;
  isRulesetSpellsLoading: boolean = false;
  isLootLoading: boolean = false;
  //isAddItemsLoading: boolean = false;


  constructor(
    private router: Router, private alertService: AlertService, private authService: AuthService, private sharedService: SharedService,
    private route: ActivatedRoute, private modalService: BsModalService, private characterTileService: CharacterTileService,
    private localStorage: LocalStoreManager, private charactersService: CharactersService,
    private layoutService: CharacterDashboardLayoutService, private pageService: CharacterDashboardPageService,
    private dragulaService: DragulaService, private itemsService: ItemsService, private abilityService: AbilityService,
    private spellsService: SpellsService, private CCService: CharactersCharacterStatService, public appService: AppService1,
    private buffAndEffectService: BuffAndEffectService,
    private characterSpellService: CharacterSpellService,
    private characterAbilityService: CharacterAbilityService,
    private monsterTemplateService: MonsterTemplateService,
    private itemMasterService: ItemMasterService,
    private lootService: LootService) {

    dragulaService.drop.subscribe((value: any[]) => {

      const [bagName, e, el] = value;
      if (value[0] == 'bag-characterDashboardLayout') {
        this.onLayoutDrop(value.slice(1));
      }
      else if (value[0] == 'bag-characterDashboardPages') {
        this.onPageDrop(value.slice(1));
      }
    });

    dragulaService.over.subscribe((value) => { this.onOver(value.slice(1)); });
    dragulaService.out.subscribe((value) => { this.onOut(value.slice(1)); });

    this.route.params.subscribe(params => {
      this.characterId = params['id'];
    });

    this.sharedService.shouldUpdateCharacterDashboardLayout().subscribe(serviceJson => {
      if (serviceJson) {

        this.page = 1;
        this.pageSize = 6;

        this.layoutService.getLayoutsByCharacterId(this.characterId, -1, -1)
          .subscribe(data => {
            this.characterlayouts = data;
            //if (this.characterlayouts.length == 1) {
            //    this.selectedlayout = this.characterlayouts[0];
            //}

            //let isLayoutSelected = false;
            //this.characterlayouts.map((item) => {
            //    if (item.isDefaultComputer && this.IsComputerDevice) {
            //        isLayoutSelected = true;
            //        this.selectedlayout = item;
            //        this.onLayoutSelect(this.selectedlayout);
            //    }
            //    else if (item.isDefaultTablet && this.IsTabletDevice) {
            //        isLayoutSelected = true;
            //        this.selectedlayout = item;
            //        this.onLayoutSelect(this.selectedlayout);
            //    }
            //    else if (item.isDefaultMobile && this.IsMobileDevice) {
            //        isLayoutSelected = true;
            //        this.selectedlayout = item;
            //        this.onLayoutSelect(this.selectedlayout);
            //    }
            //})
            //if (!isLayoutSelected) {
            for (var lay = 0; lay < this.characterlayouts.length; lay++) {
              if (this.characterlayouts[lay].isDefaultLayout) {
                this.selectedlayout = this.characterlayouts[lay];
                this.onLayoutSelect(this.selectedlayout);
                break;
              }
            }
            ////////////this.characterlayouts.map((item) => {
            ////////////  if (item.isDefaultLayout) {

            ////////////    this.selectedlayout = item;
            ////////////    this.onLayoutSelect(this.selectedlayout);
            ////////////  }
            ////////////})
            //}

            //this.isLoading = false;
          }, error => {
            this.isLoading = false;
          }, () => {

          });
      }
    });

    this.sharedService.shouldUpdateCharacterDashboardPage().subscribe(serviceJson => {

      if (serviceJson) {
        this.pageService.getPagesByLayoutId(this.selectedlayout.characterDashboardLayoutId)
          .subscribe(data => {
            this.selectedlayout.characterDashboardPages = data;
            var selectedLayoutId = this.selectedlayout.characterDashboardLayoutId;
            if (this.selectedlayout.characterDashboardPages.length == 1) {
              this.selectedPage = this.selectedlayout.characterDashboardPages[0];
            }
            this.characterlayouts.forEach(function (val) {

              if (selectedLayoutId == val.characterDashboardLayoutId) {
                val.characterDashboardPages = data;
              }

            });
            this.initialize(false);
          }, error => {
            this.isLoading = false;
          }, () => {
          });
      }
    });

    this.sharedService.shouldUpdateCharacterList().subscribe(serviceJson => {
      if (serviceJson) {
        // console.log(serviceJson);
        if (typeof serviceJson === 'object' && serviceJson.hasOwnProperty('perventLoading')) {
          this.initialize(false, serviceJson.perventLoading);
        } else if (typeof serviceJson === 'object' && serviceJson.hasOwnProperty('counterTiles')) {
          if (serviceJson.counterTiles) {
            this.initialize(false, true);
          } else {
            this.initialize(false, false);
          }
        } else {

          this.initialize(false, false);
        }
      }
    });

    this.appService.shouldUpdateGetCurrentCharacterStatData().subscribe(CurrentData => {
      if (CurrentData) {
        this.layoutService.getLayoutsByCharacterId(this.characterId, -1, -1)
          .subscribe(data => {
            this.characterlayouts = data;
            if (this.LayoutId) {
              this.characterlayouts.map((item) => {
                if (item.characterDashboardLayoutId == this.LayoutId) {
                  if (!this.selectedlayout) {
                    this.selectedlayout = item;
                  }
                }
              });
            }
            else {

              let isLayoutSelected = false;

              this.characterlayouts.map((item) => {
                if (item.isDefaultComputer && this.IsComputerDevice) {
                  isLayoutSelected = true;
                  if (!this.selectedlayout) {
                    this.selectedlayout = item;
                  }
                }
                else if (item.isDefaultTablet && this.IsTabletDevice) {
                  isLayoutSelected = true;
                  if (!this.selectedlayout) {
                    this.selectedlayout = item;
                  }
                }
                else if (item.isDefaultMobile && this.IsMobileDevice) {
                  isLayoutSelected = true;
                  if (!this.selectedlayout) {
                    this.selectedlayout = item;
                  }
                }
              });

              if (!isLayoutSelected) {
                for (var lay = 0; lay < this.characterlayouts.length; lay++) {
                  if (this.characterlayouts[lay].isDefaultLayout) {
                    if (!this.selectedlayout) {
                      this.selectedlayout = this.characterlayouts[lay];
                    }
                    break;
                  }
                }
              }

            }
            if (this.pageId) {
              this.characterlayouts.map((item) => {
                if (item.characterDashboardLayoutId == this.LayoutId) {
                  item.characterDashboardPages.map((pageItem) => {
                    if (pageItem.characterDashboardPageId == this.pageId) {
                      if (!this.selectedPage) {
                        this.selectedPage = pageItem;
                      }
                    }
                  })
                }
              })
            }
            else {
              if (this.selectedlayout != null || this.selectedlayout != undefined) {
                let isLayoutSelected = false;
                this.characterlayouts.map((item) => {
                  if (item.isDefaultComputer && this.IsComputerDevice) {
                    isLayoutSelected = true;
                    item.characterDashboardPages.map((pageItem) => {
                      if (pageItem.characterDashboardPageId == item.defaultPageId) {
                        if (!this.selectedPage) {
                          this.selectedPage = pageItem;
                        }
                      }
                    })
                  }
                  else if (item.isDefaultTablet && this.IsTabletDevice) {
                    isLayoutSelected = true;
                    item.characterDashboardPages.map((pageItem) => {
                      if (pageItem.characterDashboardPageId == item.defaultPageId) {
                        if (!this.selectedPage) {
                          this.selectedPage = pageItem;
                        }
                      }
                    })
                  }
                  else if (item.isDefaultMobile && this.IsMobileDevice) {
                    isLayoutSelected = true;
                    item.characterDashboardPages.map((pageItem) => {
                      if (pageItem.characterDashboardPageId == item.defaultPageId) {
                        if (!this.selectedPage) {
                          this.selectedPage = pageItem;
                        }
                      }
                    })
                  }
                });

                if (!isLayoutSelected) {
                  for (var lay1 = 0; lay1 < this.characterlayouts.length; lay1++) {
                    let item = this.characterlayouts[lay1];
                    if (item.isDefaultLayout) {
                      item.characterDashboardPages.map((pageItem) => {
                        if (pageItem.characterDashboardPageId == item.defaultPageId) {
                          if (!this.selectedPage) {
                            this.selectedPage = pageItem;
                          }
                        }
                      })
                      break;
                    }
                  }
                }

              }
            }
            if (!this.selectedPage && this.page1) {
              let isLayoutSelected = false;
              this.characterlayouts.map((item) => {
                if (item.isDefaultComputer && this.IsComputerDevice) {
                  isLayoutSelected = true;
                  this.selectedPage = item.characterDashboardPages[0];
                }
                else if (item.isDefaultTablet && this.IsTabletDevice) {
                  isLayoutSelected = true;
                  this.selectedPage = item.characterDashboardPages[0];
                }
                else if (item.isDefaultMobile && this.IsMobileDevice) {
                  isLayoutSelected = true;
                  this.selectedPage = item.characterDashboardPages[0];
                }
              });

              if (!isLayoutSelected) {
                for (var lay1 = 0; lay1 < this.characterlayouts.length; lay1++) {
                  let item = this.characterlayouts[lay1];
                  if (item.isDefaultLayout) {
                    this.selectedPage = item.characterDashboardPages[0];
                    break;
                  }
                }
              }
            }
            if (this.selectedPage) {
              if (this.selectedPage.characterDashboardPageId) {

                //#641 start
                this.updateDefaultLayout(this.selectedPage.characterDashboardLayoutId)
                if (this.selectedPage.characterDashboardLayoutId && this.selectedPage.characterDashboardPageId)
                  this.updateDefaultLayoutPage(this.selectedPage.characterDashboardLayoutId, this.selectedPage.characterDashboardPageId);
                //#641 end

                let rulesetId = 0;
                if (this.selectedPage.characterDashboardLayoutId == -1) {
                  this.isSharedLayout = true;
                  rulesetId = this.character.ruleSetId;
                }
                else {
                  this.isSharedLayout = false;
                }

                this.characterTileService.getTilesByPageIdCharacterId<string>(this.selectedPage.characterDashboardPageId, this.characterId, rulesetId, this.isSharedLayout)
                  .subscribe(data => {
                    let model: any = data;
                    this.CharacterStatsValues = model.characterStatsValues;
                    this.appService.updateGetValuesForNotification(CurrentData);
                    this.statLinkRecords = model.statLinkRecords;
                    data = model.data;
                    this.tiles = data;
                    this.CCService.getConditionsValuesList<any[]>(this.characterId)
                      .subscribe(data => {
                        this.ConditionsValuesList = data;

                      }, error => {
                        this.ConditionsValuesList = [];
                      }, () => {
                        this.boxes = this.mapBoxes(data);
                        this.appService.updateGetValuesForNotification(this.boxes);
                        this.isLoading = false;
                      });

                    try {
                      this.noRecordFound = !data.length;
                    } catch (err) { }

                  }, error => {
                  }, () => { });
              }

              if (this.selectedPage.characterDashboardPageId) {
                this.pageService.getCharacterDashboardPageById<any>(this.selectedPage.characterDashboardPageId)
                  .subscribe(data => {
                    this.pageDefaultData = data;
                  }, error => {
                  }, () => { });
              }

            }
          }, error => {
          }, () => {
          });
      }
    });

    this.getObjectStore();
  }

  async getObjectStore() {
    const that = this;
    const request = await window.indexedDB.open(DBkeys.IndexedDB, DBkeys.IndexedDBVersion);

    request.onsuccess = function (event) {
      console.log('[onsuccess]', request.result);
      that.appService.objectStore = event.target['result'];
    };
  }

  @HostListener('document:click', ['$event'])
  documentClick(e: any) {
    let target = e.target;
    e.stopPropagation();
    if (target.className && target.className == "Editor_Command a-hyperLink" && !this.editMode) {
      this.GotoCommand(target.attributes["data-editor"].value);
    }
    if (target.className && !this.editMode) {
      if (target.className == "Editor_itemDetail a-hyperLink") {
        this.GotoItemDetail(target.attributes["data-editor"].value);
      } else if (target.className == "Editor_spellDetail a-hyperLink") {
        this.GotoSpellDetail(target.attributes["data-editor"].value);
      } else if (target.className == "Editor_abilityDetail a-hyperLink") {
        this.GotoAbilityDetail(target.attributes["data-editor"].value);
      } else if (target.className == "Editor_BuffAndEffectDetail a-hyperLink") {
        this.GotoBuffEffectDetail(target.attributes["data-editor"].value);
      }
      else if (target.className == "Editor_Ruleset_spellDetail a-hyperLink") {
        this.GotoErrorMessage();
        //this.GotoBuffEffectDetail(target.attributes["data-editor"].value);
      }
      else if (target.className == "Editor_Ruleset_abilityDetail a-hyperLink") {
        this.GotoErrorMessage();
        //this.GotoBuffEffectDetail(target.attributes["data-editor"].value);
      }
      else if (target.className == "Editor_Ruleset_BuffAndEffectDetail a-hyperLink") {
        this.GotoErrorMessage();
        //this.GotoBuffEffectDetail(target.attributes["data-editor"].value);
      }
      else if (target.className == "Editor_Ruleset_ItemTemplateDetail a-hyperLink") {
        this.GotoErrorMessage();
        //this.GotoBuffEffectDetail(target.attributes["data-editor"].value);
      }
      else if (target.className == "Editor_Ruleset_MonsterTemplateDetail a-hyperLink") {
        this.GotoErrorMessage();
        //this.GotoBuffEffectDetail(target.attributes["data-editor"].value);
      }
      else if (target.className == "Editor_Ruleset_MonsterDetail a-hyperLink") {
        this.GotoErrorMessage();
        //this.GotoBuffEffectDetail(target.attributes["data-editor"].value);
      }
    }

    if ((target.className == "Editor_itemDetailExe a-hyperLink" || target.className == "Editor_spellDetailExe a-hyperLink"
      || target.className == "Editor_abilityDetailExe a-hyperLink" || target.className == "Editor_BuffAndEffectDetailExe a-hyperLink")
      && !this.editMode) {
      this.ExecutePopup(target.attributes["data-editor"].value, target.className);
    }
    else if ((target.className == "Editor_Ruleset_spellDetailExe a-hyperLink" || target.className == "Editor_Ruleset_abilityDetailExe a-hyperLink"
      || target.className == "Editor_Ruleset_BuffAndEffectDetailExe a-hyperLink" || target.className == "Editor_Ruleset_ItemTemplateDetailExe a-hyperLink"
      || target.className == "Editor_Ruleset_MonsterTemplateDetailExe a-hyperLink" || target.className == "Editor_Ruleset_MonsterDetailExe a-hyperLink")
      && !this.editMode) {
      this.GotoErrorMessage();
    }

    //if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE))
    //  this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
    if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE)) {
      if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerLink == 'character') {
        this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
      }
    }

    if (!this.SortClick) {
      try {
        if (target.className.endsWith("is-layout-show")) {
          this.isLayoutDropdownOpen = !this.isLayoutDropdownOpen;
        }
        else if (target.classList.contains("show-layout-drp")) {
          this.isLayoutDropdownOpen = true;
        }
        else {

          this.isLayoutDropdownOpen = false;
        }
      } catch (err) { this.isLayoutDropdownOpen = false; }


      try {
        if (target.className.endsWith("is-page-show")) {
          this.isPageDropdownOpen = !this.isPageDropdownOpen;
        }
        else if (target.classList.contains("show-page-drp")) {
          this.isPageDropdownOpen = true;
        }
        else {
          this.isPageDropdownOpen = false;
        }
      } catch (err) { this.isPageDropdownOpen = false; }
    }
    this.SortClick = false;
    if (this.isLayoutDropdownOpen) {

      this.foldClass = 'dropdown-menu show-dropdown input-list-items border-none';
    }
    else {

      this.foldClass = 'dropdown-menu input-list-items border-none';

      if (this.characterlayouts != null || this.characterlayouts != undefined) {

        this.characterlayouts.forEach(function (val) {

          val.showIcon = false;
        });
      }

    }

    if (this.isPageDropdownOpen) {
      this.pagedrpClass = 'dropdown-menu show-dropdown input-list-items border-none';
    }
    else {
      this.pagedrpClass = 'dropdown-menu input-list-items border-none';
      if (this.selectedlayout) {
        this.selectedlayout.characterDashboardPages.forEach(function (val) {
          val.showIcon = false;
        })
      }
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event) {
    this.localStorage.deleteData(DBkeys.IsCharacterBackButton);
  }

  ngOnInit() {

    //if (this.appService.CharacterInitLoad && this.appService.CharacterInitLoad.observers && this.appService.CharacterInitLoad.observers.length === 0) {
    //  this.getAllRecords(true);
    //  this.appService.CharacterInitLoad.subscribe(id => {
    //    if (id) {
    //      this.characterId = id;
    //      this.getAllRecords(true);
    //    } else {
    //      this.getAllRecords(false);
    //    }
    //  })
    //}
    let backButton = this.localStorage.localStorageGetItem(DBkeys.IsCharacterBackButton);
    this.initialize(backButton ? false : true);

    this.charactersService.isAllyAssigned_Cache(this.characterId, backButton).subscribe(data => {
      if (data) {
        this.doesCharacterHasAllies = true;
      }
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      }
    });

    this.destroyModalOnInit();
    this.validateDevice();
    this.showActionButtons(this.showActions);
    this.pageId = this.localStorage.localStorageGetItem('cPageID')
    this.localStorage.localStorageSetItem('cPageID', null);
    this.LayoutId = this.localStorage.localStorageGetItem('cLayoutID')
    this.localStorage.localStorageSetItem('cLayoutID', null);
    window.addEventListener("resize", () => {
      // Get screen size (inner/outerWidth, inner/outerHeight)
      this.gridConfig = {
        'margins': this.getTileSize().margins,
        'draggable': false,
        'resizable': false,
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
        'resize_directions': [
          "bottomleft",
          "bottomright",
          "topleft"
        ],
      };
      this.boxes = this.mapBoxes(this.tiles);
    }, false);
    //window.onorientationchange = () => {
    //  setTimeout(() => {
    //    this.gridConfig = {
    //      'margins': this.getTileSize().margins,
    //      'draggable': false,
    //      'resizable': false,
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
    //      'resize_directions': [
    //        "bottomleft",
    //        "bottomright",
    //        "topleft"
    //      ],
    //    };
    //    this.boxes = this.mapBoxes(this.tiles);
    //    //this.initialize(true);
    //  }, 10);
    //}

    //let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (!icharNav) {
      this.charNav = {
        'items': '/character/inventory/' + this.characterId,
        'spells': '/character/spell/' + this.characterId,
        'abilities': '/character/ability/' + this.characterId
      };
    }
    else {
      if (!icharNav[this.characterId]) {
        this.charNav = {
          'items': '/character/inventory/' + this.characterId,
          'spells': '/character/spell/' + this.characterId,
          'abilities': '/character/ability/' + this.characterId
        };
      }
      else {
        this.charNav = icharNav[this.characterId];
      }
    }
  }

  private initialize(IsInitialLoad, preventLoading = false, layoutId = 0) {

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'character') {
          this.characterId = this.headers.headerId;
        }
      }
      try {
        let backButton = this.localStorage.localStorageGetItem(DBkeys.IsCharacterBackButton);
        this.gameStatus(this.characterId);
        this.CCService.getConditionsValuesList_Cache<any[]>(this.characterId, backButton)
          .subscribe(data => {
            this.ConditionsValuesList = data;
          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          }, () => { });

        if (preventLoading || backButton) {
          this.isLoading = false;
        } else {
          this.isLoading = true;
        }

        this.localStorage.deleteData('isCampaignCharacter');
        this.charactersService.getCharactersById_Cache<any>(this.characterId)
          .subscribe(data => {
            this.character = data;

            if (this.appService.objectStore) {
              let campaignObjectStore = this.appService.objectStore.transaction("character", "readwrite").objectStore("character");
              campaignObjectStore.add(data);
            }

            this.getAllRecords(!this.localStorage.localStorageGetItem(DBkeys.IsCharacterBackButton));

            this.rulesetModel = data.ruleSet;
            this.localStorage.localStorageSetItem('isCampaignCharacter', this.character.isCampaignCharacter);
            //this.isLoading = false;
            this.setHeaderValues(this.character);
          }, error => {
            this.character = new Characters();
            this.isLoading = false;
          }, () => {
            if (preventLoading || backButton) {
              this.isLoading = false;
            } else {
              this.isLoading = true;
            }

            this.layoutService.getLayoutsByCharacterId_Cache(this.characterId, -1, -1, backButton)
              .subscribe(data => {
                this.characterlayouts = data;
                if (this.LayoutId) {
                  this.characterlayouts.map((item) => {
                    if (item.characterDashboardLayoutId == this.LayoutId) {
                      //if (item.isDefaultLayout) {
                      this.selectedlayout = item;
                    }
                  })
                  //this.selectedlayout
                }
                else {

                  let isLayoutSelected = false;

                  if (IsInitialLoad) {
                    this.characterlayouts.map((item) => {
                      if (item.isDefaultComputer && this.IsComputerDevice) {
                        isLayoutSelected = true;
                        this.selectedlayout = item;
                        // this.onLayoutSelect(this.selectedlayout);
                      }
                      else if (item.isDefaultTablet && this.IsTabletDevice) {
                        isLayoutSelected = true;
                        this.selectedlayout = item;
                        // this.onLayoutSelect(this.selectedlayout);
                      }
                      else if (item.isDefaultMobile && this.IsMobileDevice) {
                        isLayoutSelected = true;
                        this.selectedlayout = item;
                        //this.onLayoutSelect(this.selectedlayout);
                      }
                    })
                  }

                  if (!isLayoutSelected) {
                    for (var lay = 0; lay < this.characterlayouts.length; lay++) {
                      if (this.characterlayouts[lay].isDefaultLayout) {
                        this.selectedlayout = this.characterlayouts[lay];
                        break;
                      }
                    }
                    //this.characterlayouts.map((item) => {
                    //  if (item.isDefaultLayout) {
                    //    this.selectedlayout = item;
                    //  }
                    //})
                  }

                }
                if (this.pageId) {
                  this.characterlayouts.map((item) => {
                    if (item.characterDashboardLayoutId == this.LayoutId) {
                      item.characterDashboardPages.map((pageItem) => {
                        if (pageItem.characterDashboardPageId == this.pageId) {
                          this.selectedPage = pageItem;
                        }
                      })
                    }
                  })
                }
                else {
                  if (this.selectedlayout != null || this.selectedlayout != undefined) {
                    let isLayoutSelected = false;
                    if (IsInitialLoad) {
                      this.characterlayouts.map((item) => {
                        if (item.isDefaultComputer && this.IsComputerDevice) {
                          isLayoutSelected = true;
                          item.characterDashboardPages.map((pageItem) => {
                            if (pageItem.characterDashboardPageId == item.defaultPageId) {
                              this.selectedPage = pageItem;
                            }
                          })
                        }
                        else if (item.isDefaultTablet && this.IsTabletDevice) {
                          isLayoutSelected = true;
                          item.characterDashboardPages.map((pageItem) => {
                            if (pageItem.characterDashboardPageId == item.defaultPageId) {
                              this.selectedPage = pageItem;
                            }
                          })
                        }
                        else if (item.isDefaultMobile && this.IsMobileDevice) {
                          isLayoutSelected = true;
                          item.characterDashboardPages.map((pageItem) => {
                            if (pageItem.characterDashboardPageId == item.defaultPageId) {
                              this.selectedPage = pageItem;
                            }
                          })
                        }
                      })
                    }

                    if (!isLayoutSelected) {
                      for (var lay1 = 0; lay1 < this.characterlayouts.length; lay1++) {
                        let item = this.characterlayouts[lay1];
                        if (item.isDefaultLayout) {
                          item.characterDashboardPages.map((pageItem) => {
                            if (pageItem.characterDashboardPageId == item.defaultPageId) {
                              this.selectedPage = pageItem;
                            }
                          })
                          break;
                        }
                      }
                      //this.characterlayouts.map((item) => {
                      //  if (item.isDefaultLayout) {
                      //    item.characterDashboardPages.map((pageItem) => {
                      //      if (pageItem.characterDashboardPageId == item.defaultPageId) {
                      //        this.selectedPage = pageItem;
                      //      }
                      //    })
                      //  }
                      //})
                    }

                  }
                }
                if (!this.selectedPage && this.page1) {
                  let isLayoutSelected = false;
                  if (IsInitialLoad) {
                    this.characterlayouts.map((item) => {
                      if (item.isDefaultComputer && this.IsComputerDevice) {
                        isLayoutSelected = true;
                        this.selectedPage = item.characterDashboardPages[0];
                      }
                      else if (item.isDefaultTablet && this.IsTabletDevice) {
                        isLayoutSelected = true;
                        this.selectedPage = item.characterDashboardPages[0];
                      }
                      else if (item.isDefaultMobile && this.IsMobileDevice) {
                        isLayoutSelected = true;
                        this.selectedPage = item.characterDashboardPages[0];
                      }
                    })
                  }

                  if (!isLayoutSelected) {
                    for (var lay1 = 0; lay1 < this.characterlayouts.length; lay1++) {
                      let item = this.characterlayouts[lay1];
                      if (item.isDefaultLayout) {
                        this.selectedPage = item.characterDashboardPages[0];
                        break;
                      }
                    }
                    //this.characterlayouts.map((item) => {
                    //  if (item.isDefaultLayout) {
                    //    this.selectedPage = item.characterDashboardPages[0];
                    //  }
                    //})
                  }

                  //this.initialize();
                  //this.page1 = 0;
                }
                if (this.selectedPage) {
                  if (this.selectedPage.characterDashboardPageId) {
                    if (preventLoading || backButton) {
                      this.isLoading = false;
                    } else {
                      this.isLoading = true;
                    }

                    //#641 start
                    this.updateDefaultLayout(this.selectedPage.characterDashboardLayoutId)
                    if (this.selectedPage.characterDashboardLayoutId && this.selectedPage.characterDashboardPageId)
                      this.updateDefaultLayoutPage(this.selectedPage.characterDashboardLayoutId, this.selectedPage.characterDashboardPageId);
                    //#641 end

                    let rulesetId = 0;
                    if (this.selectedPage.characterDashboardLayoutId == -1) {
                      this.isSharedLayout = true;
                      rulesetId = this.character.ruleSetId;
                    }
                    else {
                      this.isSharedLayout = false;
                    }

                    if (preventLoading || backButton) {
                      this.isLoading = false;
                    } else {
                      this.isLoading = true;
                    }
                    //this.isLoading = true;
                    this.characterTileService.getTilesByPageIdCharacterId_Cache<string>(this.selectedPage.characterDashboardPageId, this.characterId, rulesetId, this.isSharedLayout, backButton)
                      .subscribe(data => {
                        let model: any = data;
                        this.CharacterStatsValues = model.characterStatsValues;
                        this.statLinkRecords = model.statLinkRecords;
                        data = model.data;
                        this.tiles = data;
                        this.CCService.getConditionsValuesList_Cache<any[]>(this.characterId, backButton)
                          .subscribe(data => {
                            this.ConditionsValuesList = data;

                          }, error => {
                            this.ConditionsValuesList = [];
                          }, () => {
                            this.boxes = this.mapBoxes(data);
                            this.isLoading = false;
                          });

                        try {
                          this.noRecordFound = !data.length;
                        } catch (err) { }

                      }, error => {
                        this.isLoading = false;
                      }, () => { });
                  } else {

                    this.isLoading = false;
                  }

                  if (this.selectedPage.characterDashboardPageId) {
                    this.pageService.getCharacterDashboardPageById_Cache<any>(this.selectedPage.characterDashboardPageId, backButton)
                      .subscribe(data => {
                        this.pageDefaultData = data;
                      }, error => {
                      }, () => { });
                  }

                } else {
                  this.isLoading = false;
                }
              }, error => {
                this.isLoading = false;
              }, () => {
              });

            //this.gameStatus(this.characterId);
          });

      } catch (err) { }

    }
  }

  private onOver(args) {
    let [el, target, source] = args;
    target.classList.add("targetContainer");
  }

  private onOut(args) {
    let [el, target, source] = args;
    target.classList.remove("targetContainer");
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

    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (!icharNav) {
      this.charNav = {
        'items': '/character/inventory/' + character.characterId,
        'spells': '/character/spell/' + character.characterId,
        'abilities': '/character/ability/' + character.characterId
      };
    }
    else {
      if (!icharNav[character.characterId]) {
        this.charNav = {
          'items': '/character/inventory/' + character.characterId,
          'spells': '/character/spell/' + character.characterId,
          'abilities': '/character/ability/' + character.characterId
        };
      } else {
        this.charNav = icharNav[character.characterId];
      }
    }
  }

  showActionButtons(showActions) {
    this.showActions = !this.showActions;
    if (showActions) {
      this.actionText = 'SHOW';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  checkTile(url: string, pageId: number, layoutId: number) {
    this.localStorage.deleteData('pageId');
    this.localStorage.saveSyncedSessionData(pageId, 'pageId');
    this.localStorage.localStorageSetItem('cPageID', pageId);
    this.localStorage.localStorageSetItem('cLayoutID', layoutId);
    this.localStorage.localStorageSetItem(DBkeys.IsManageCharacterTile, "true");
    this.router.navigate([url, this.characterId]);
  }

  manageRoute(url: string, charID = '') {
    if (charID == 'false') {
      this.router.navigate([url]);
    }
    else {
      this.router.navigate([url, charID]);
    }

    //this.router.navigate([url, this.characterId], { skipLocationChange: true });
    //window.history.pushState('', '', url + "/" + this.characterId)
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.recordName = this.character.characterName;
    this.bsModalRef.content.recordImage = this.character.imageUrl;
  }

  manageIcon(id: number) {
    this.characterlayouts.forEach(function (val) {
      if (id === val.characterDashboardLayoutId) {
        val.showIcon = true;

      } else {
        val.showIcon = false;
      }
    })

  }

  onLayoutSelect(layout: any): void {
    this.selectedlayout = layout;

    this.selectedPage = layout.characterDashboardPages[0];
    this.selectedlayout.characterDashboardPages.map((pageItem) => {
      if (pageItem.characterDashboardPageId == this.selectedlayout.defaultPageId) {
        this.selectedPage = pageItem;

      }
    })
    this.tiles = null;
    if (this.selectedPage) {
      if (this.selectedPage.characterDashboardPageId) {
        let rulesetId = 0;
        if (this.selectedPage.characterDashboardLayoutId == -1) {
          this.isSharedLayout = true;
          rulesetId = this.character.ruleSetId;
        }
        else {
          this.isSharedLayout = false;
        }
        this.isLoading = true;
        let backButton = this.localStorage.localStorageGetItem(DBkeys.IsCharacterBackButton);
        this.characterTileService.getTilesByPageIdCharacterId_Cache<string>(this.selectedPage.characterDashboardPageId, this.characterId, rulesetId, this.isSharedLayout, backButton)
          .subscribe(data => {
            //this.isLoading = false;
            let model: any = data;
            this.CharacterStatsValues = model.characterStatsValues;
            this.statLinkRecords = model.statLinkRecords;
            data = model.data;
            this.tiles = data;
            this.CCService.getConditionsValuesList<any[]>(this.characterId)
              .subscribe(data => {
                this.ConditionsValuesList = data;

              }, error => {
                this.ConditionsValuesList = [];
              }, () => {
                this.boxes = this.mapBoxes(data);
                this.isLoading = false;
              });
            //this.boxes = this.mapBoxes(data);
            try {
              this.noRecordFound = !data.length;
            } catch (err) { }
          }, error => {
            this.isLoading = false;
          }, () => { });
      }
      this.updateDefaultLayout(this.selectedPage.characterDashboardLayoutId);
    }
  }

  newLayout() {
    this.showAddModal();
  }

  private showAddModal() {
    this.bsModalRef = this.modalService.show(LayoutFormComponent, {
      class: 'modal-layout',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'New Layout';
    this.bsModalRef.content.button = 'SAVE';
    this.bsModalRef.content.characterId = this.characterId;
  }

  editLayout(characterDashboardLayout: any) {
    this.bsModalRef = this.modalService.show(LayoutFormComponent, {
      class: 'modal-layout',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Layout';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.layoutFormModal = characterDashboardLayout;
    this.bsModalRef.content.layoutPages = characterDashboardLayout.characterDashboardPages;
  }

  duplicateLayout(characterDashboardLayout: any) {
    this.bsModalRef = this.modalService.show(LayoutFormComponent, {
      class: 'modal-layout',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Duplicate Layout';
    this.bsModalRef.content.button = 'DUPLICATE';
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.layoutFormModal = characterDashboardLayout;
    this.bsModalRef.content.layoutPages = characterDashboardLayout.characterDashboardPages;
  }

  deleteLayout(layout: CharacterDashboardLayout) {
    this.alertService.showDialog('Are you sure you want to delete the Layout named "' + layout.name + '" ?',
      DialogType.confirm, () => this.deleteLayoutHelper(layout.characterDashboardLayoutId), null, 'Yes', 'No');
  }

  private deleteLayoutHelper(layoutId: number) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Layout");
    this.layoutService.deleteCharacterDashboardLayout(layoutId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          this.alertService.showMessage("Layout has been deleted successfully.", "", MessageSeverity.success);

          if (this.selectedlayout.characterDashboardLayoutId == layoutId) {
            this.page = 1;
            this.pageSize = 6;
            this.characterlayouts = this.characterlayouts.filter((val) => val.characterDashboardLayoutId != layoutId);
            if (this.characterlayouts.length) {
              this.onLayoutSelect(this.characterlayouts[0]);
            }
            //this.initialize();

          }
          else {
            this.characterlayouts = this.characterlayouts.filter((val) => val.characterDashboardLayoutId != layoutId);
            // this.sharedService.updateCharacterDashboardLayout(true);
          }
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Delete";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  managePageIcon(id: number) {
    this.selectedlayout.characterDashboardPages.forEach(function (val) {
      if (id == val.characterDashboardPageId) {
        val.showIcon = true;

      } else {
        val.showIcon = false;
      }
    })

  }

  onPageSelect(page: any): void {
    this.isLoading = true;
    this.selectedPage = page;
    if (page.characterDashboardPageId) {
      let rulesetId = 0;
      if (this.selectedPage.characterDashboardLayoutId == -1) {
        this.isSharedLayout = true;
        rulesetId = this.character.ruleSetId;
      }
      else {
        this.isSharedLayout = false;
      }
      this.isLoading = true;
      this.characterTileService.getTilesByPageIdCharacterId<string>(this.selectedPage.characterDashboardPageId, this.characterId, rulesetId, this.isSharedLayout)
        .subscribe(data => {
          //getCharacterDashboardPageById
          let model: any = data;
          this.CharacterStatsValues = model.characterStatsValues;
          this.statLinkRecords = model.statLinkRecords;
          data = model.data;
          this.tiles = data;
          this.CCService.getConditionsValuesList<any[]>(this.characterId)
            .subscribe(data => {
              this.ConditionsValuesList = data;

            }, error => {
              this.ConditionsValuesList = [];
            }, () => {
              this.boxes = this.mapBoxes(data);
              this.isLoading = false;
            });
          //this.boxes = this.mapBoxes(data);
          try {
            this.noRecordFound = !data.length;
          } catch (err) { }
          //this.isLoading = false;
        }, error => {
          this.isLoading = false;
        }, () => { });
      if (page.characterDashboardLayoutId && this.selectedPage.characterDashboardPageId)
        this.updateDefaultLayoutPage(page.characterDashboardLayoutId, page.characterDashboardPageId);
    }
  }

  newPage() {
    this.showPageAddModal();
  }

  private showPageAddModal() {

    this.bsModalRef = this.modalService.show(PageFormComponent, {
      class: 'modal-page',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'New Page';
    this.bsModalRef.content.button = 'SAVE';
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.layoutId = this.selectedlayout.characterDashboardLayoutId;
  }

  editPage(characterDashboardPage: any) {
    this.bsModalRef = this.modalService.show(PageFormComponent, {
      class: 'modal-page',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Page';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.pageFormModal = characterDashboardPage;
    this.bsModalRef.content.characterId = this.characterId;
  }

  duplicatePage(characterDashboardPage: any) {
    this.bsModalRef = this.modalService.show(PageFormComponent, {
      class: 'modal-page',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Duplicate Page';
    this.bsModalRef.content.button = 'DUPLICATE';
    this.bsModalRef.content.pageFormModal = characterDashboardPage;
    this.bsModalRef.content.characterId = this.characterId;
  }

  deletePage(page: CharacterDashboardPage) {
    this.alertService.showDialog('Are you sure you want to delete the page named "' + page.name + '" ?',
      DialogType.confirm, () => this.deletePageHelper(page.characterDashboardPageId), null, 'Yes', 'No');
  }

  private deletePageHelper(pageId: number) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Page");

    this.pageService.deleteCharacterDashboardPage(pageId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Page has been deleted successfully.", "", MessageSeverity.success);

          if (this.selectedPage.characterDashboardPageId == pageId) {
            if (this.selectedlayout.characterDashboardPages.length) {
              this.selectedlayout.characterDashboardPages = this.selectedlayout.characterDashboardPages.filter((val) => val.characterDashboardPageId != pageId);
              this.selectedPage = this.selectedlayout.characterDashboardPages[0];
              this.onPageSelect(this.selectedPage);
            }

            //this.pageService.getPagesByLayoutId(this.selectedlayout.characterDashboardLayoutId)
            //    .subscribe(data => {
            //        this.selectedlayout.characterDashboardPages = data;

            //        if (data != null && data != undefined) {
            //            this.selectedPage = this.selectedlayout.characterDashboardPages[0];
            //            this.onPageSelect(this.selectedPage);
            //        }

            //        var selectedLayoutId = this.selectedlayout.characterDashboardLayoutId;
            //        this.characterlayouts.forEach(function (val) {
            //            if (selectedLayoutId == val.characterDashboardLayoutId) {
            //                val.characterDashboardPages = data;
            //            }

            //        });

            //    }, error => {
            //        this.isLoading = false;
            //    }, () => {

            //    });
          }
          else {
            if (this.selectedlayout.characterDashboardPages.length) {
              this.selectedlayout.characterDashboardPages = this.selectedlayout.characterDashboardPages.filter((val) => val.characterDashboardPageId != pageId);
            }
            else {
              this.sharedService.updateCharacterDashboardPage(true);
            }
            //this.sharedService.updateCharacterDashboardPage(true);
          }
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Delete";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

        });
  }

  onLayoutScroll() {
    ++this.page;

    //this.layoutService.getLayoutsByCharacterId<any[]>(this.characterId, this.page, this.pageSize)
    //    .subscribe(data => {

    //        for (var i = 0; i < data.length; i++) {
    //            this.characterlayouts.push(data[i]);
    //        }


    //    }, error => {
    //        this.isLoading = false;
    //    }, () => {


    //    });

  }

  private onLayoutDrop(characterDashboardLayout: any) {

    let [el, target, source] = characterDashboardLayout;
    const rowData = Array.from(target.children);

    let _sortOrder = rowData.map((row: any, index: number) => {
      return {
        Id: row.id,
        SortOrder: index + 1
      }
    });


    this.sortOrderLayouts(_sortOrder);
  }

  private sortOrderLayouts(sortOrder: any[]) {
    this.layoutService.sortOrderLayouts(sortOrder)
      .subscribe(
        data => {
        },
        error => { /*console.log("error : ", error);*/ }
      );
  }

  private onPageDrop(characterDashboardPages: any) {
    let [el, target, source] = characterDashboardPages;
    const rowData = Array.from(target.children);

    let _sortOrder = rowData.map((row: any, index: number) => {
      return {
        Id: row.id,
        SortOrder: index + 1
      }
    });
    this.sortOrderPages(_sortOrder);
  }

  private sortOrderPages(sortOrder: any[]) {
    this.pageService.sortOrderPages(sortOrder)
      .subscribe(
        data => {
        },
        error => { /*console.log("error : ", error);*/ }
      );
  }

  gotoDashboard() {
    this.router.navigate(['/character/dashboard', this.characterId]);
  }

  openTile() {
    this.bsModalRef = this.modalService.show(TileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Tile";
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = {};
  }

  viewTile(tile: any, tileType: number, e: any) {

    if (e.target.className && e.target.className.indexOf("a-hyperLink") > -1) {
      return false;
    }
    this.editMode = false;
    //let _tile: any;
    let _tile = Object.assign({}, tile);
    switch (tileType) {
      case TILES.NOTE: {
        if (!this.isSharedLayout) {
          this.bsModalRef = this.modalService.show(NoteTileComponent, {
            class: 'modal-primary modal-lg modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = "Edit Note Tile";
          this.bsModalRef.content.tile = _tile;
          this.bsModalRef.content.characterId = this.characterId;
          this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ? this.selectedPage.characterDashboardPageId : this.pageId;
          this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          this.bsModalRef.content.view = VIEW.EDIT;
          this.bsModalRef.content.autoFocusEditor = true;
          this.editMode = true;

          this.bsModalRef.content.event.subscribe(data => {
            if (data) {
              //this.showManageIcons = data;
            }
            this.editMode = false;
          })
        }
        else {
          this.bsModalRef = this.modalService.show(EditNoteComponent, {
            class: 'modal-primary modal-lg',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.tile = _tile;
          this.bsModalRef.content.noteTile = _tile.noteTiles;
          this.bsModalRef.content.characterId = this.characterId;
          this.bsModalRef.content.view = VIEW.MANAGE;
          this.bsModalRef.content.tileName = 'note';

          this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ?
            this.selectedPage.characterDashboardPageId : this.pageId;
          this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          this.bsModalRef.content.isSharedLayout = this.isSharedLayout;
        }
        break;
      }
      case TILES.IMAGE: {
        this.bsModalRef = this.modalService.show(EditImageComponent, {
          class: 'modal-primary modal-custom-image',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.tile = _tile;
        this.bsModalRef.content.imageTile = _tile.imageTiles;
        this.bsModalRef.content.tileName = 'image';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.view = VIEW.MANAGE;

        this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ?
          this.selectedPage.characterDashboardPageId : this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.isSharedLayout = this.isSharedLayout;
        break;
      }
      case TILES.COUNTER: {
        this.bsModalRef = this.modalService.show(EditCounterComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.tile = _tile;
        this.bsModalRef.content.counterTile = _tile.counterTiles;
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.view = VIEW.MANAGE;
        this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ?
          this.selectedPage.characterDashboardPageId : this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.isSharedLayout = this.isSharedLayout;
        break;
      }
      case TILES.CHARACTERSTAT: {
        let characterStatTypeID = _tile.characterStatTiles.charactersCharacterStat.characterStat.characterStatTypeId;
        switch (characterStatTypeID) {
          case STAT_TYPE.Command:
            this.bsModalRef = this.modalService.show(DiceRollComponent, {
              class: 'modal-primary modal-md',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.title = "Dice";
            this.bsModalRef.content.characterId = this.characterId;
            this.bsModalRef.content.character = this.character;
            this.bsModalRef.content.tile = TILES.CHARACTERSTAT;
            this.bsModalRef.content.characterStatTile = _tile.characterStatTiles;
            this.bsModalRef.content.recordName = this.character.characterName;
            this.bsModalRef.content.recordImage = this.character.imageUrl;
            break;

          case STAT_TYPE.RichText:
            this.bsModalRef = this.modalService.show(EditCharacterStatComponent, {
              class: 'modal-primary modal-custom',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.tile = _tile;
            this.bsModalRef.content.characterStatTile = _tile.characterStatTiles;
            this.bsModalRef.content.tileName = 'Rich';
            this.bsModalRef.content.characterId = this.characterId;
            this.bsModalRef.content.character = this.character;
            this.bsModalRef.content.pageId = this.pageId;
            this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
            this.bsModalRef.content.view = VIEW.MANAGE;
            this.bsModalRef.content.showEditor = true;
            this.bsModalRef.content.isSharedLayout = this.isSharedLayout;
            break;
          case STAT_TYPE.Toggle:

            if (_tile.characterStatTiles.charactersCharacterStat.yesNo) {
              _tile.characterStatTiles.charactersCharacterStat.isYes = !_tile.characterStatTiles.charactersCharacterStat.isYes
              this.updateStatService(_tile.characterStatTiles.charactersCharacterStat);
            }
            else if (_tile.characterStatTiles.charactersCharacterStat.onOff) {
              _tile.characterStatTiles.charactersCharacterStat.isOn = !_tile.characterStatTiles.charactersCharacterStat.isOn
              this.updateStatService(_tile.characterStatTiles.charactersCharacterStat);
            }
            else if (_tile.characterStatTiles.charactersCharacterStat.display) {
              _tile.characterStatTiles.charactersCharacterStat.showCheckbox = !_tile.characterStatTiles.charactersCharacterStat.showCheckbox;
              this.updateStatService(_tile.characterStatTiles.charactersCharacterStat);
            }
            else if (_tile.characterStatTiles.charactersCharacterStat.isCustom) {

              let initialIndex: number = -1;
              _tile.characterStatTiles.charactersCharacterStat.characterCustomToggles.map((togg, index) => {
                if (togg.initial) {
                  initialIndex = index;
                }
              })
              _tile.characterStatTiles.charactersCharacterStat.characterCustomToggles.map((togg, index) => {
                togg.initial = false;
                if ((initialIndex + 1) == _tile.characterStatTiles.charactersCharacterStat.characterCustomToggles.length) {
                  if (index == 0) {
                    togg.initial = true;
                    _tile.characterStatTiles.charactersCharacterStat.defaultValue = togg.customToggleId;
                  }
                }
                else {
                  if ((initialIndex + 1) == index) {
                    togg.initial = true;
                    _tile.characterStatTiles.charactersCharacterStat.defaultValue = togg.customToggleId;
                  }
                }
              })

              this.updateStatService(_tile.characterStatTiles.charactersCharacterStat);
            }

            break;

          case STAT_TYPE.LinkRecord:

            try {
              if (_tile.characterStatTiles.charactersCharacterStat.linkType == STAT_LINK_TYPE.SPELL) {
                this.router.navigate(['/character/spell-details', _tile.characterStatTiles.charactersCharacterStat.defaultValue]);
              }
              else if (_tile.characterStatTiles.charactersCharacterStat.linkType == STAT_LINK_TYPE.ABILITY) {
                this.router.navigate(['/character/ability-details', _tile.characterStatTiles.charactersCharacterStat.defaultValue]);
              }
              else if (_tile.characterStatTiles.charactersCharacterStat.linkType == STAT_LINK_TYPE.ITEM) {
                this.router.navigate(['/character/inventory-details', _tile.characterStatTiles.charactersCharacterStat.defaultValue]);
              }
              else if (_tile.characterStatTiles.charactersCharacterStat.linkType == STAT_LINK_TYPE.BUFFANDEFFECT) {
                this.router.navigate(['/character/buff-effect-details', _tile.characterStatTiles.charactersCharacterStat.defaultValue]);
              }
            } catch (err) { }
            break;
          //case STAT_TYPE.Condition:
          //    this.bsModalRef = this.modalService.show(EditTextComponent, {
          //        class: 'modal-primary modal-md',
          //        ignoreBackdropClick: true,
          //        keyboard: false
          //    });
          //    this.bsModalRef.content.tile = _tile;
          //    this.bsModalRef.content.textTile = _tile.textTiles;
          //    this.bsModalRef.content.tileName = 'image';
          //    this.bsModalRef.content.characterId = this.characterId;
          //    this.bsModalRef.content.view = VIEW.MANAGE;

          //    this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ?
          //        this.selectedPage.characterDashboardPageId : this.pageId;
          //    this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          //    break;
          default:
            let characterStat = _tile.characterStatTiles.charactersCharacterStat.characterStat;

            this.bsModalRef = this.modalService.show(EditCharacterStatComponent, {
              class: 'modal-primary modal-md',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.tile = _tile;
            this.bsModalRef.content.characterStatTile = _tile.characterStatTiles;
            this.bsModalRef.content.tileName = 'link';
            this.bsModalRef.content.characterId = this.characterId;
            this.bsModalRef.content.character = this.character;
            this.bsModalRef.content.pageId = this.pageId;
            this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
            this.bsModalRef.content.view = VIEW.MANAGE;
            this.bsModalRef.content.isSharedLayout = this.isSharedLayout;
            break;

        }
        break;
      }
      case TILES.LINK: {
        //this.bsModalRef = this.modalService.show(UseLinkComponent, {
        //    class: 'modal-primary modal-md',
        //    ignoreBackdropClick: true,
        //    keyboard: false
        //});
        //this.bsModalRef.content.tile = _tile.linkTiles;
        //this.bsModalRef.content.tileName = 'link';
        //this.bsModalRef.content.characterId = this.characterId;
        //this.bsModalRef.content.view = VIEW.MANAGE;

        try {
          if (_tile.linkTiles.linkType == 'Spell')
            this.router.navigate(['/character/spell-details', _tile.linkTiles.spell.characterSpellId]);
          else if (_tile.linkTiles.linkType == 'Ability')
            this.router.navigate(['/character/ability-details', _tile.linkTiles.ability.characterAbilityId]);
          else if (_tile.linkTiles.linkType == 'Item')
            this.router.navigate(['/character/inventory-details', _tile.linkTiles.item.itemId]);
          else if (_tile.linkTiles.linkType == 'BuffAndEffect')
            this.router.navigate(['/character/buff-effect-details', _tile.linkTiles.buffAndEffect.characterBuffAandEffectId]);
          else if (_tile.linkTiles.linkType == 'Allies')
            this.router.navigate(['/character/allies-detail', _tile.linkTiles.ally.monsterId]);
        } catch (err) { }
        break;
      }
      case TILES.EXECUTE: {
        let _executeTile = _tile.executeTiles;
        //linkType
        switch (_executeTile.linkType) {
          case "Spell": {
            if (_executeTile.spell && _executeTile.spell.spellId) {
              this.spellsService.getSpellCommands_sp<any>(_executeTile.spell.spellId, 0)
                .subscribe(data => {

                  if (data.length > 0) {
                    this.bsModalRef = this.modalService.show(CastComponent, {
                      class: 'modal-primary modal-md',
                      ignoreBackdropClick: true,
                      keyboard: false
                    });
                    this.bsModalRef.content.title = "Spell Cast";
                    this.bsModalRef.content.ListCommands = data;
                    this.bsModalRef.content.Command = _executeTile.spell.spell;
                    this.bsModalRef.content.Character = this.character;
                    this.bsModalRef.content.ButtonText = 'Cast';
                  } else {
                    this.useCommand(_executeTile.spell.spell)
                  }
                }, error => { }, () => { });
            }
            break;
          }
          case "Item": {
            if (_executeTile.item && _executeTile.item.itemId) {
              this.itemsService.getItemCommands_sp<any>(_executeTile.item.itemId)
                .subscribe(data => {

                  if (data.length > 0) {
                    this.bsModalRef = this.modalService.show(CastComponent, {
                      class: 'modal-primary modal-md',
                      ignoreBackdropClick: true,
                      keyboard: false
                    });

                    this.bsModalRef.content.title = "Item Commands";
                    this.bsModalRef.content.ListCommands = data;
                    this.bsModalRef.content.Command = _executeTile.item;
                    this.bsModalRef.content.Character = this.character;
                    if (_executeTile.item.isConsumable) {
                      this.bsModalRef.content.isConsumable = true;
                    }
                  } else {
                    this.useCommand(_executeTile.item);
                  }
                }, error => { }, () => { });
            }
            break;
          }
          case "Ability": {
            if (_executeTile.ability && _executeTile.ability.abilityId) {
              this.abilityService.getAbilityCommands_sp<any>(_executeTile.ability.abilityId, 0)
                .subscribe(data => {
                  if (data.length > 0) {
                    this.bsModalRef = this.modalService.show(CastComponent, {
                      class: 'modal-primary modal-md',
                      ignoreBackdropClick: true,
                      keyboard: false
                    });

                    this.bsModalRef.content.title = "Ability Commands";
                    this.bsModalRef.content.ListCommands = data;
                    this.bsModalRef.content.AbilityId = _executeTile.ability.abilityId;
                    this.bsModalRef.content.Command = _executeTile.ability.ability;
                    this.bsModalRef.content.Character = this.character;
                  } else {
                    this.useCommand(_executeTile.ability.ability)
                  }
                }, error => { }, () => { });
            }
            break;
          }
          case "BuffAndEffect": {
            if (_executeTile.buffAndEffect && _executeTile.buffAndEffect.buffAndEffectID) {
              this.buffAndEffectService.getBuffAndEffectCommands_sp<any>(_executeTile.buffAndEffect.buffAndEffectID)
                .subscribe(data => {
                  if (data.length > 0) {
                    this.bsModalRef = this.modalService.show(CastComponent, {
                      class: 'modal-primary modal-md',
                      ignoreBackdropClick: true,
                      keyboard: false
                    });

                    this.bsModalRef.content.title = "Buffs & Effects Commands";
                    this.bsModalRef.content.ListCommands = data;
                    this.bsModalRef.content.BuffAndEffectID = _executeTile.buffAndEffect.buffAndEffectID;
                    this.bsModalRef.content.Command = _executeTile.buffAndEffect.buffAndEffect;
                    this.bsModalRef.content.Character = this.character;
                  } else {
                    this.useCommand(_executeTile.buffAndEffect.buffAndEffect)
                  }
                }, error => { }, () => { });
            }
            break;
          }
          case "Allies": {
            if (_executeTile.ally && _executeTile.ally.monsterId) {
              this.monsterTemplateService.getMonsterCommands_sp<any>(_executeTile.ally.monsterId)
                .subscribe(data => {
                  if (data.length > 0) {
                    this.bsModalRef = this.modalService.show(CastComponent, {
                      class: 'modal-primary modal-md',
                      ignoreBackdropClick: true,
                      keyboard: false
                    });

                    this.bsModalRef.content.title = "Ally Commands";
                    this.bsModalRef.content.ListCommands = data;
                    this.bsModalRef.content.Command = _executeTile.ally;  //Monster
                    this.bsModalRef.content.Character = this.character;
                    this.bsModalRef.content.recordType = 'monster';
                    this.bsModalRef.content.recordId = _executeTile.ally.monsterId;
                  }
                  else {
                    this.useCommand(_executeTile.ally)
                  }
                }, error => { }, () => { });
            }
            break;
          }
          default: break;
        }

        //this.bsModalRef = this.modalService.show(DiceRollComponent, {
        //    class: 'modal-primary modal-md',
        //    ignoreBackdropClick: true,
        //    keyboard: false
        //});
        //this.bsModalRef.content.title = "Dice";
        //this.bsModalRef.content.characterId = this.characterId;
        //this.bsModalRef.content.character = this.character;
        //this.bsModalRef.content.tile = TILES.EXECUTE;
        //this.bsModalRef.content.executeTile = _tile.executeTiles;
        //this.bsModalRef.content.ruleSet = this.character.ruleSet;
        break;
      }
      case TILES.COMMAND: {

        this.bsModalRef = this.modalService.show(DiceRollComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.character = this.character;
        this.bsModalRef.content.tile = TILES.COMMAND;
        this.bsModalRef.content.commandTile = _tile.commandTiles;
        this.bsModalRef.content.recordName = this.character.characterName;
        this.bsModalRef.content.recordImage = this.character.imageUrl;
        //this.bsModalRef = this.modalService.show(EditImageComponent, {
        //    class: 'modal-primary modal-md',
        //    ignoreBackdropClick: true,
        //    keyboard: false
        //});
        //this.bsModalRef.content.tile = _tile;
        //this.bsModalRef.content.commandTile = _tile.commandTiles;
        //this.bsModalRef.content.tileName = 'command';
        //this.bsModalRef.content.characterId = this.characterId;
        //this.bsModalRef.content.view = VIEW.MANAGE;
        //this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ?
        //    this.selectedPage.characterDashboardPageId : this.pageId;
        //this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        break;
      }
      case TILES.TEXT: {
        this.bsModalRef = this.modalService.show(EditTextComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.tile = _tile;
        this.bsModalRef.content.textTile = _tile.textTiles;
        this.bsModalRef.content.tileName = 'image';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.view = VIEW.MANAGE;

        this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ?
          this.selectedPage.characterDashboardPageId : this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.isSharedLayout = this.isSharedLayout;
        break;
      }
      case TILES.TOGGLE: {
        if (!this.isSharedLayout) {

          if (_tile.toggleTiles.tileToggle.yesNo) {
            _tile.toggleTiles.yesNo = !_tile.toggleTiles.yesNo
            this.updateToggleTile(_tile.toggleTiles);
          }
          else if (_tile.toggleTiles.tileToggle.onOff) {
            _tile.toggleTiles.onOff = !_tile.toggleTiles.onOff
            this.updateToggleTile(_tile.toggleTiles)
          }
          else if (_tile.toggleTiles.tileToggle.display) {
            _tile.toggleTiles.checkBox = !_tile.toggleTiles.checkBox;
            this.updateToggleTile(_tile.toggleTiles)
          }
          else if (_tile.toggleTiles.tileToggle.isCustom) {

            let initialIndex: number = -1;
            _tile.toggleTiles.tileToggle.tileCustomToggles.map((togg, index) => {
              if (togg.initial) {
                initialIndex = index;
              }
            })
            _tile.toggleTiles.tileToggle.tileCustomToggles.map((togg, index) => {
              togg.initial = false;
              if ((initialIndex + 1) == _tile.toggleTiles.tileToggle.tileCustomToggles.length) {
                if (index == 0) {
                  togg.initial = true;
                  _tile.toggleTiles.customValue = togg.tileCustomToggleId;
                }
              }
              else {
                if ((initialIndex + 1) == index) {
                  togg.initial = true;
                  _tile.toggleTiles.customValue = togg.tileCustomToggleId;
                }
              }
            })

            this.updateToggleTile(_tile.toggleTiles)
          }
        }


        break;
      }
      case TILES.CHARACTERSTATCLUSTER: {
        this.bsModalRef = this.modalService.show(EditCharacterStatClusterComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.tile = _tile;
        this.bsModalRef.content.characterStatClusterTile = _tile.characterStatClusterTiles;
        this.bsModalRef.content.tileName = 'cluster';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.view = VIEW.MANAGE;

        this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ?
          this.selectedPage.characterDashboardPageId : this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.isSharedLayout = this.isSharedLayout;
        break;
      }
      case TILES.CURRENCY: {
        let _characterCurrency = Object.assign([], _tile.currencyTile.characterCurrency);
        _characterCurrency = _tile.currencyTile ? _characterCurrency : [];

        this.bsModalRef = this.modalService.show(EditCurrencyComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Currency";
        this.bsModalRef.content.tile = _tile;
        this.bsModalRef.content.currencyTile = Object.assign([], _tile.currencyTile);

        this.bsModalRef.content.tileCurrency = Object.assign([], _characterCurrency);

        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.view = VIEW.MANAGE;

        this.bsModalRef.content.pageId = this.selectedPage.characterDashboardPageId ? this.selectedPage.characterDashboardPageId : this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.isSharedLayout = this.isSharedLayout;
        this.bsModalRef.content.event.subscribe(result => {
          _tile.currencyTile.characterCurrency = result;
        });
      }
      default: break;
    }
  }
  updateToggleTile(tile) {
    this.characterTileService.updateToggleTileValues(tile).subscribe(
      data => {
        //this.alertService.stopLoadingMessage();
        //this.alertService.showMessage("Character stat has been saved successfully.", "", MessageSeverity.success);
      },
      error => {
        this.alertService.stopLoadingMessage();
        let _message = "Unable to Save";
        let Errors = Utilities.ErrorDetail(_message, error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
        else
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      },
    )
  }
  useCommand(Command: any) {
    if (Command.isConsumable) {
      let msg = "The Quantity for this " + Command.name
        + " item is " + Command.quantity + " Would you like to continue?";
      if (Command.command == undefined || Command.command == null || Command.command == '') {
        this.alertService.showDialog(msg, DialogType.confirm, () => this.CommandUsed(Command), null, 'Yes', 'No');
      } else {
        this.useCommandHelper(Command);
      }
    } else {
      let msg = "The command value for " + Command.name + " has not been provided. Edit this record to input one.";
      if (Command.command == undefined || Command.command == null || Command.command == '') {
        this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
      }
      else {
        //TODO
        this.useCommandHelper(Command);
      }
    }
  }

  private useCommandHelper(Command: any) {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.character.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = Command.command;
    if (Command.hasOwnProperty("itemId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.itemImage;
      if (Command.isConsumable) {

        let ruleSetId;
        if (this.rulesetModel) {
          ruleSetId = this.rulesetModel.ruleSetId;
        }
        this.itemsService.ReduceItemQty(Command.itemId, ruleSetId).subscribe(result => {
          if (result) {
            //this.initialize(false);
          }
        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        });
      }
    }
    else if (Command.hasOwnProperty("spellId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.imageUrl;
    }
    else if (Command.hasOwnProperty("abilityId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.imageUrl;
    }
    else if (Command.hasOwnProperty("buffAndEffectId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.imageUrl;
    }
    else if (Command.hasOwnProperty("monsterId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.imageUrl;
    }

    this.bsModalRef.content.event.subscribe(result => {
    });
  }

  //Reduce Item's Quantity
  CommandUsed(Command) {
    let ruleSetId;
    if (this.rulesetModel) {
      ruleSetId = this.rulesetModel.ruleSetId;
    }
    this.itemsService.ReduceItemQty(Command.itemId, ruleSetId).subscribe(result => {
      if (result) {
        let msg = "The " + Command.name + " has been used. " + result + " number of uses remain.";
        this.alertService.showMessage(msg, "", MessageSeverity.success);
        this.initialize(false);
      }
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      }
    });

  }

  NextPrevPage(selectedlayout: any, next: any) {

    this.isLoading = true;
    let allPages = selectedlayout.characterDashboardPages;
    let _selectedPage = this.selectedPage;
    let _selectedIndex = allPages.indexOf(_selectedPage);

    if (next) {
      if ((allPages.length - 1) > _selectedIndex)
        this.onPageSelect(allPages[_selectedIndex + 1]);
      else
        this.onPageSelect(allPages[0]);
    }
    else {
      if (_selectedIndex > 0)
        this.onPageSelect(allPages[_selectedIndex - 1]);
      else
        this.onPageSelect(allPages[allPages.length - 1]);
    }
  }

  scrollUp(item, IsPage, element) {
    this.SortClick = true
    let list;
    if (IsPage) {
      list = this.selectedlayout.characterDashboardPages;
      this.isPageDropdownOpen = true;
    }
    else {
      list = this.characterlayouts;
      this.isLayoutDropdownOpen = true;
    }
    var index = list.findIndex(stat => stat.name === item.name);
    const temp = list[index];
    const prevEl = list[index - 1];
    if (index > 0) {
      list.splice(index - 1, 1, temp);
      list.splice(index, 1, prevEl);
      if (IsPage) {
        this.selectedlayout.characterDashboardPages = list;
      }
      else {
        this.characterlayouts = list;
      }

      this.onChange(item, IsPage);
    }
  }

  scrollDown(item, IsPage, element) {
    this.SortClick = true
    let list;
    if (IsPage) {
      list = this.selectedlayout.characterDashboardPages;
      this.isPageDropdownOpen = true;
    }
    else {
      list = this.characterlayouts;
      this.isLayoutDropdownOpen = true;
    }
    var index = list.findIndex(stat => stat.name === item.name);
    const temp = list[index];
    const prevEl = list[index + 1];
    if (index !== list.length - 1) {
      list.splice(index + 1, 1, temp);
      list.splice(index, 1, prevEl);
      if (IsPage) {
        this.selectedlayout.characterDashboardPages = list;
      }
      else {
        this.characterlayouts = list;
      }
      this.onChange(item, IsPage);
    }
  }

  updateDefaultLayout(layoutId) {
    this.layoutService.updateDefaultLayout(layoutId, this.characterId)
      .subscribe(data => { },
        error => { /*console.log("updateDefaultLayout error : ", error);*/ }
      );
  }

  updateDefaultLayoutPage(layoutId, pageId) {
    let backButton = this.localStorage.localStorageGetItem(DBkeys.IsCharacterBackButton);
    this.layoutService.updateDefaultLayoutPage_Cache(layoutId, pageId, backButton)
      .subscribe(data => { },
        error => { /*console.log("updateDefaultLayoutPage error : ", error);*/ }
      );
  }

  private onChange(item: any, IsPage) {
    if (IsPage) {
      //this.onPageDrop(item);
      const rowData = Array.from(this.selectedlayout.characterDashboardPages);

      let _sortOrder = rowData.map((row: any, index: number) => {
        return {
          Id: row.characterDashboardPageId,
          SortOrder: index + 1
        }
      });
      this.sortOrderPages(_sortOrder);
    }
    else {
      // this.onLayoutDrop(item);
      const rowData = Array.from(this.characterlayouts);
      let _sortOrder = rowData.map((row: any, index: number) => {
        return {
          Id: row.characterDashboardLayoutId,
          SortOrder: index + 1
        }
      });
      this.sortOrderLayouts(_sortOrder);

    }
    //let [el, target, source] = item;

    //this.sortOrderCharacterStat(_sortOrder);
  }

  private mapBoxes(List) {
    let boxes: Box[] = [];
    let ngGridItemConfig: NgGridItemConfig;
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
        if (item.characterStatTiles.charactersCharacterStat.characterStat.characterStatTypeId == STAT_TYPE.RichText) {
          item.characterStatTiles.charactersCharacterStat.richText = item.characterStatTiles.charactersCharacterStat.richText == null ? '' : item.characterStatTiles.charactersCharacterStat.richText;

        }
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
                calculationIds = calculationIds.replace("[-1]", " " + Utilities.DecimalNumber(inventoreyWeight) + " ");
              });

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
                calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + Utilities.DecimalNumber(inventoreyWeight) + " ");
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
            let isCustomToggleInitialSet = false;
            item.characterStatTiles.charactersCharacterStat.characterCustomToggles.map((togg, index) => {

              if (togg.customToggleId == item.characterStatTiles.charactersCharacterStat.defaultValue) {
                togg.initial = true;
                isCustomToggleInitialSet = true;
              }
              else {
                togg.initial = false;
              }
            })
            if (!isCustomToggleInitialSet) {
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
                    ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(Utilities.DecimalNumber(_inventoreyWeight), this.CharacterStatsValues.charactersCharacterStat, Condition, false);
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
                  let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(Utilities.DecimalNumber(_inventoreyWeight), this.CharacterStatsValues.charactersCharacterStat, Condition, true); //Condition.compareValue;
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
                    case STAT_TYPE.Condition:
                      let characterStatConditionsfilter = this.ConditionsValuesList.filter((Cs) => Cs.characterStatId == stat.characterStat.characterStatId);
                      let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.CharacterStatsValues.charactersCharacterStat);
                      value = result;
                      break;
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
                  calculationIds = calculationIds.replace("[-1]", " " + Utilities.DecimalNumber(inventoreyWeight) + " ");
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
                  calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + Utilities.DecimalNumber(inventoreyWeight) + " ");
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
                      ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(Utilities.DecimalNumber(_inventoreyWeight), this.CharacterStatsValues.charactersCharacterStat, Condition, false);
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
                    let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(Utilities.DecimalNumber(_inventoreyWeight), this.CharacterStatsValues.charactersCharacterStat, Condition, true); //Condition.compareValue;
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
  isMobile() {
    try { document.createEvent("TouchEvent"); return true; }
    catch (e) {
      if (window.innerWidth < 769) { return true }
      return false;
    }
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
  private updateStatService(charactersCharacterStat: CharactersCharacterStat) {
    this.CCService.updateCharactersCharacterStat(charactersCharacterStat).subscribe(
      data => {
        //this.alertService.stopLoadingMessage();
        //this.alertService.showMessage("Character stat has been saved successfully.", "", MessageSeverity.success);
        let logStat = { characterStatId: charactersCharacterStat.characterStatId, characterId: charactersCharacterStat.characterId, RuleSetId: this.rulesetModel.ruleSetId }
        this.appService.updateSaveLogStat(logStat);
      },
      error => {
        if (charactersCharacterStat.yesNo) {
          charactersCharacterStat.isYes = !charactersCharacterStat.isYes
        }
        else if (charactersCharacterStat.onOff) {
          charactersCharacterStat.isOn = !charactersCharacterStat.isOn
        }
        else if (charactersCharacterStat.display) {
          charactersCharacterStat.showCheckbox = !charactersCharacterStat.showCheckbox;
        }
        this.alertService.stopLoadingMessage();
        let _message = "Unable to Save";
        let Errors = Utilities.ErrorDetail(_message, error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
        else
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      },
    )
    ////////////////////////////

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
  validateDevice() {
    if (window.innerWidth <= 767) {//mobile
      this.IsMobileDevice = true;
      this.IsTabletDevice = false;
      this.IsComputerDevice = false;
    }
    else if (window.innerWidth >= 768 && window.innerWidth <= 991) {//tablet
      this.IsTabletDevice = true;
      this.IsMobileDevice = false;
      this.IsComputerDevice = false;
    }
    else if (window.innerWidth >= 992) {//desktop
      this.IsComputerDevice = true;
      this.IsTabletDevice = false;
      this.IsMobileDevice = false;
    }
  }
  description(text) {

    if (text) {

      var encodedStr = text;

      var parser = new DOMParser;
      var dom = parser.parseFromString(
        '<!doctype html><body>' + encodedStr,
        'text/html');
      var decodedString = dom.body.textContent;


      return decodedString;
      //text = text.replace(/<{1}[^<>]{1,}>{1}/g, " ");
      ////if (text.length >= 100) {
      ////  let trimmedString = text.substring(0, 100);
      ////  trimmedString += '...';
      ////  return trimmedString;
      ////}
      //return text;
    }
    return '';
  }
  refresh() {
    this.LayoutId = this.selectedlayout.characterDashboardLayoutId;
    this.initialize(true, false, this.LayoutId);
  }
  gameStatus(characterId?: any) {
    //api for player controls
    //alert(characterId)
    this.charactersService.getPlayerControlsByCharacterId_Cache(characterId)
      .subscribe(data => {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user == null) {
            this.authService.logout();
          }
          else {
            if (user.isGm) {
              this.pageRefresh = user.isGm;
            }
            else if (data.isPlayerCharacter) {
              this.pageRefresh = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {
              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              //this.pauseBuffAndEffectAdd = data.pauseBuffAndEffectAdd;
              //this.pauseBuffAndEffectCreate = data.pauseBuffAndEffectCreate;
              if (!data.isPlayerLinkedToCurrentCampaign) {

                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }

                this.pauseBuffAndEffectAdd = data.pauseBuffAndEffectAdd;
                this.pauseBuffAndEffectCreate = data.pauseBuffAndEffectCreate;

              }
            }
            if (data.isDeletedInvite) {
              this.router.navigate(['/characters']);
              this.alertService.showStickyMessage('', "Your " + data.name + " character has been deleted by the GM", MessageSeverity.error);
              setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
            }
          }
        }

      }, error => {
        let Errors = Utilities.ErrorDetail("", error);


        //if (Errors.sessionExpire) {
        //  this.authService.logout(true);
        //}
      });
  }
  AssignBuffsToCharacter(buffsList) {

    if (!this.pauseBuffAndEffectAdd) {
      let selectedbuffs = [];

      if (buffsList) {
        if (buffsList.length) {
          buffsList.map((x) => {
            if (x.buffAndEffect) {
              selectedbuffs.push({ text: x.buffAndEffect.name, value: x.buffAndEffectID, buffAndEffectId: x.buffAndEffectID, image: x.buffAndEffect.imageUrl })
            }
          })
        }
      }


      this.bsModalRef = this.modalService.show(AddBuffAndEffectComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });

      this.bsModalRef.content.rulesetID = this.rulesetModel.ruleSetId;
      this.bsModalRef.content.characterID = this.characterId;
      this.bsModalRef.content.selectedBuffAndEffectsList = selectedbuffs;
      this.bsModalRef.content.pauseBuffAndEffectCreate = this.pauseBuffAndEffectCreate;
      this.bsModalRef.content.event.subscribe(data => {
        if (data) {
          this.initialize(true);
        }
      });
    }

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
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = cmd;
  }

  GotoItemDetail(itemId) {
    this.router.navigate(['/character/inventory-details/', itemId]);
  }
  GotoSpellDetail(spellId) {
    this.router.navigate(['/character/spell-details/', spellId]);
  }
  GotoAbilityDetail(abilityId) {
    this.router.navigate(['/character/ability-details/', abilityId]);
  }
  GotoBuffEffectDetail(buffEffectId) {
    this.router.navigate(['/character/buff-effect-details/', buffEffectId]);
  }
  GotoErrorMessage() {
    let message = "Sorry, You can't access the template records.";
    this.alertService.showMessage(message, "", MessageSeverity.error);
  }
  GotoErrorMessageRecordNotFound() {
    let message = "The targeted record has been removed.";
    this.alertService.showMessage(message, "", MessageSeverity.error);
  }
  ExecutePopup(Id, className) {
    if (className == "Editor_spellDetailExe a-hyperLink" && Id) {
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      let spellDetail: any;
      this.characterSpellService.getCharacterSpellById<any>(Id)
        .subscribe(data => {
          if (data) {
            spellDetail = this.characterSpellService.spellModelDetailData(data, "UPDATE");
            this.alertService.stopLoadingMessage();
            //this.isLoading = false;
            if (spellDetail.spellCommandVM && spellDetail.spellCommandVM.length) {
              this.bsModalRef = this.modalService.show(CastComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
              });
              this.bsModalRef.content.title = "Spell Cast";
              this.bsModalRef.content.ListCommands = spellDetail.spellCommandVM;
              this.bsModalRef.content.Command = spellDetail;
              this.bsModalRef.content.Character = this.character;
              this.bsModalRef.content.ButtonText = 'Cast';
            } else {
              this.useCommand(spellDetail)
            }
          }
          else {
            this.GotoErrorMessageRecordNotFound();
          }

        }, error => {
          this.alertService.stopLoadingMessage();
          //this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {

        });

    }
    else if (className == "Editor_itemDetailExe a-hyperLink" && Id) {
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      let itemDetailExe: any;
      this.itemsService.getItemById<any>(Id)
        .subscribe(data => {
          if (data) {
            itemDetailExe = this.itemsService.itemModelData(data, "UPDATE");
            this.alertService.stopLoadingMessage();
            //this.isLoading = false;
            if (itemDetailExe.itemCommandVM && itemDetailExe.itemCommandVM.length) {
              this.bsModalRef = this.modalService.show(CastComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
              });

              this.bsModalRef.content.title = "Item Commands";
              this.bsModalRef.content.ListCommands = itemDetailExe.itemCommandVM;
              this.bsModalRef.content.Command = itemDetailExe;
              this.bsModalRef.content.Character = this.character;
              if (itemDetailExe.isConsumable) {
                this.bsModalRef.content.isConsumable = true;
              }
            } else {
              this.useCommand(itemDetailExe);
            }
          }
          else {
            this.GotoErrorMessageRecordNotFound();
          }

        }, error => {
          this.alertService.stopLoadingMessage();
          //this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {

        });
    }
    else if (className == "Editor_abilityDetailExe a-hyperLink" && Id) {
      let AbilityDetailExe: any;
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      this.characterAbilityService.getCharacterAbilityById<any>(Id)
        .subscribe(data => {
          if (data) {
            AbilityDetailExe = this.characterAbilityService.abilityModelDetailData(data, "UPDATE");
            this.alertService.stopLoadingMessage();
            //this.isLoading = false;
            if (AbilityDetailExe.abilityCommandVM && AbilityDetailExe.abilityCommandVM.length) {
              this.bsModalRef = this.modalService.show(CastComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
              });

              this.bsModalRef.content.title = "Ability Commands";
              this.bsModalRef.content.ListCommands = AbilityDetailExe.abilityCommandVM;
              this.bsModalRef.content.AbilityId = Id;
              this.bsModalRef.content.Command = AbilityDetailExe;
              this.bsModalRef.content.Character = this.character;
            } else {
              this.useCommand(AbilityDetailExe)
            }
          }
          else {
            this.GotoErrorMessageRecordNotFound();
          }

        }, error => {
          this.alertService.stopLoadingMessage();
          //this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {
        });

    }
    else if (className == "Editor_BuffAndEffectDetailExe a-hyperLink" && Id) {
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      let buffAndEffectDetailExe;
      this.buffAndEffectService.getCharacterBuffAndEffectById<any>(Id)
        .subscribe(data => {
          if (data) {
            buffAndEffectDetailExe = this.buffAndEffectService.BuffAndEffectsModelData(data, "UPDATE");
            this.alertService.stopLoadingMessage();
            //this.isLoading = false;
            if (buffAndEffectDetailExe && buffAndEffectDetailExe.buffAndEffectCommandVM.length) {
              this.bsModalRef = this.modalService.show(CastComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
              });

              this.bsModalRef.content.title = "Buffs & Effects Commands";
              this.bsModalRef.content.ListCommands = buffAndEffectDetailExe.buffAndEffectCommandVM;
              this.bsModalRef.content.BuffAndEffectID = Id;
              this.bsModalRef.content.Command = buffAndEffectDetailExe;
              this.bsModalRef.content.Character = this.character;
            } else {
              this.useCommand(buffAndEffectDetailExe)
            }
          }
          else {
            this.GotoErrorMessageRecordNotFound();
          }

        }, error => {
          this.alertService.stopLoadingMessage();
          //this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {
        });
    }
  }

  GoToAllies() {
    this.router.navigate(['/character/allies/', this.characterId]);
  }

  clickAndHold(tile, tileTypId, index) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  editRecord(tile, tileTypId, index) {
    this.timeoutHandler = setInterval(() => {
      this.editTile(tile, tileTypId, index);
    }, 1000);
  }

  editTile(_editTile: any, tileType: number, boxIndex: number = 0) {
    //this.showManageIcons = false;
    let tile: CharacterTile = _editTile;
    //this.BoxesEditedIndex = boxIndex;
    //this.UpdateTileConfigList(this.finalTileList);
    this.editMode = false;
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
            //this.showManageIcons = data;
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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})
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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})
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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})
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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})
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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})
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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})

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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})

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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})
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
        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.event.emit(data);
        //  }
        //})
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

        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})

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
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    this.showManageIcons = data;
        //  }
        //})
        break;
      }
      default: break;
    }
  }

  getAllRecords(val?) {
    this.getInventory(val);
    this.getRulesetInventory(val);
    this.getLootPileListToDropItems(val);
    this.getAddItems(val);
    this.getAllies(val);
    this.getAbilities(val);
    this.getAddAbilities(val);
    this.getRulesetAbility(val);
    this.getSpells(val);
    this.getRulesetSpells(val);
    this.getAddSpells(val);
    this.getLoot(val);
  }

  //get Inventory/Items
  getInventory(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.isInventoryLoading = true;
    this.itemsService.getItemsByCharacterId_sp_Cache<any>(this.characterId, ruleSetId, 1, 9999, 1, initLoading)
      .subscribe(data => {
        //console.log("Inventory Data =>", data);
        this.updateObjectStore("inventory", data);
        this.isInventoryLoading = false;

      }, error => {
        this.isInventoryLoading = false;
      }, () => {
      });
  }

  getRulesetInventory(initLoading) {
    this.isRulesetViewInventoryLoading = true;
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.itemMasterService.getItemMasterByRuleset_spWithPagination_Cache<any>(ruleSetId, 1, 9999, initLoading)
      .subscribe(data => {

        this.updateObjectStore("rulesetInventory", data);
        this.isRulesetViewInventoryLoading = false;
      }, error => {
        this.isRulesetViewInventoryLoading = false;
      }, () => {
      });
  }

  //Drop items
  // RULE SET DB
  getLootPileListToDropItems(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.itemsService.getLootPilesListByCharacterId_Cache<any>(this.characterId, ruleSetId, initLoading)
      .subscribe(data => {
      }, error => { }, () => { });
  }

  //add Items
  // RULESET DB
  getAddItems(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.itemMasterService.getItemMasterByRuleset_addItems_Cache<any>(ruleSetId, true, false, this.characterId, initLoading)
      .subscribe(data => {
        //this.isAddItemsLoading = false;
      }, error => {
        //this.isAddItemsLoading = false;
      }, () => { });
  }

  //get Allies
  getAllies(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.isAlliesLoading = true;
    this.monsterTemplateService.getMonsterByRuleset_spWithPagination_Cache_Allies<any>(ruleSetId, 1, 9999, 1, this.characterId, initLoading)
      .subscribe(data => {
        this.updateObjectStore("allies", data);
        this.isAlliesLoading = false;
      }, error => {
        this.isAlliesLoading = false;
      }, () => { });
  }

  //get Abilities
  getAbilities(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.isAbilitiesLoading = true;
    this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp_Cache<any>(this.characterId, ruleSetId, 1, 9999, 1, initLoading)
      .subscribe(data => {
        this.isAbilitiesLoading = false;
        this.updateObjectStore("abilities", data);
      }, error => {
        this.isAbilitiesLoading = false;
      }, () => { });
  }

  //add Abilities
  // RULESET DB
  getAddAbilities(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.abilityService.getAbilityByRuleset_add_Cache<any[]>(ruleSetId, initLoading)
      .subscribe(data => {
      }, error => { }, () => { });
  }

  getRulesetAbility(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.isRulesetViewAbilityLoading = true;
    this.abilityService.getAbilityByRuleset_spWithPagination_Cache<any>(ruleSetId, 1, 9999, initLoading)
      .subscribe(data => {
        this.isRulesetViewAbilityLoading = false;
        this.updateObjectStore("rulesetAbility", data);
      }, error => {
        this.isRulesetViewAbilityLoading = false;
      }, () => { });
  }

  //get Spells
  getSpells(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.isSpellsLoading = true;
    this.characterSpellService.getCharacterSpellsByCharacterId_sp_Cache<any>(this.characterId, ruleSetId, 1, 9999, 1, initLoading)
      .subscribe(data => {
        this.isSpellsLoading = false;
        this.updateObjectStore("spell", data);
      }, error => {
        this.isSpellsLoading = false;
      }, () => { });
  }

  getRulesetSpells(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.isRulesetSpellsLoading = true;
    this.spellsService.getspellsByRuleset_spWithPagination_Cache<any>(ruleSetId, 1, 9999, initLoading)
      .subscribe(data => {
        this.isRulesetSpellsLoading = false;
        this.updateObjectStore("rulesetSpell", data);
      }, error => {
        this.isRulesetSpellsLoading = false;
      }, () => {      });
  }

  //add Spells
  // RULE SET DB
  getAddSpells(initLoading) {
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.spellsService.getspellsByRuleset_add_Cache<any[]>(ruleSetId, initLoading)
      .subscribe(data => {
      }, error => {}, () => { });
  }

  //get Loot
  getLoot(initLoading) {
    this.isLootLoading = true;
    let ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.lootService.getLootItemsForPlayers_Cache<any>(ruleSetId, initLoading)
      .subscribe(data => {
        this.isLootLoading = false;
        this.updateObjectStore("loot", data);
      }, error => {
        this.isLootLoading = false;
      }, () => {      });
  }

  updateObjectStore(key, data) {
    if (this.appService.objectStore) {
      let campaignObjectStore = this.appService.objectStore.transaction("character", "readwrite").objectStore("character");
      let request = campaignObjectStore.get(this.characterId);

      request.onerror = function (event) {
        console.log("[data retrieve error]");
      };

      request.onsuccess = function (event) {
        let result = event.target.result;

        if (result) {
          result[key] = data;
          let requestUpdate = campaignObjectStore.put(result);
          requestUpdate.onerror = function (event) {
            console.log("[data update error]");
          };
          requestUpdate.onsuccess = function (event) {
            console.log("[data update success]");
          };
        }
      };
    }
  }

  ngOnDestroy() {
    this.localStorage.deleteData(DBkeys.IsCharacterBackButton);
  }

}
