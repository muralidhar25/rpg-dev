import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, DialogType, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { SharedService } from '../../core/services/shared.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { DragulaService } from 'ng2-dragula';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { RulesetTileService } from '../../core/services/ruleset-tile.service';
import { RulesetService } from '../../core/services/ruleset.service';
import { RulesetDashboardLayoutService } from '../../core/services/ruleset-dashboard-layout.service';
import { RulesetDashboardPageService } from '../../core/services/ruleset-dashboard-page.service';
import { RulesetTileConfigService } from '../../core/services/ruleset-tile-config.service';
import { PlatformLocation } from '@angular/common';
import { RulesetTileConfig } from '../../core/models/tiles/ruleset-tile-config.model';
import { NgGridItemEvent, NgGridConfig, NgGridItemConfig } from 'angular2-grid';
import { HeaderValues } from '../../core/models/headers.model';
import { RulesetDashboardPage } from '../../core/models/view-models/ruleset-dashboard-page.model';
import { STAT_TYPE, TILES, VIEW, Layout, SYSTEM_GENERATED_MSG_TYPE, CHATACTIVESTATUS } from '../../core/models/enums';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { AppService1 } from "../../app.service";
import { DBkeys } from '../../core/common/db-keys';
import { DiceRollComponent } from '../../shared/dice/dice-roll/dice-roll.component';
import { RulesetLayoutComponent } from '../ruleset-dashboard/ruleset-layout/ruleset-layout.component';
import { RulesetDashboardLayout } from '../../core/models/view-models/ruleset-dashboard-layout.model';
import { RulesetTile } from '../../core/models/tiles/ruleset-tile.model';
import { Utilities } from '../../core/common/utilities';
import { RulesetCounterTileComponent } from '../../tile-ruleset/counter/counter.component';
import { RulesetCharacterStatTileComponent } from '../../tile-ruleset/character-stat/character-stat.component';
import { RulesetCommandTileComponent } from '../../tile-ruleset/command/command.component';
import { RulesetTextTileComponent } from '../../tile-ruleset/text/text.component';
import { RulesetImageTileComponent } from '../../tile-ruleset/image/image.component';
import { RulesetNoteTileComponent } from '../../tile-ruleset/note/note.component';
import { Box, config } from '../../core/models/tiles/box.model';
import { RulesetEditCharacterStatComponent } from '../../tile-ruleset/character-stat/edit-character-stat/edit-character-stat.component';
import { RulesetEditCounterComponent } from '../../tile-ruleset/counter/edit-counter/edit-counter.component';
import { RulesetEditImageComponent } from '../../tile-ruleset/image/edit-image/edit-image.component';
import { RulesetEditNoteComponent } from '../../tile-ruleset/note/edit-note/edit-note.component';
import { RulesetTileComponent } from '../../tile-ruleset/tile.component';
import { RulesetPageComponent } from '../ruleset-dashboard/ruleset-page/ruleset-page.component';
import { User } from '../../core/models/user.model';
import { ServiceUtil } from '../../core/services/service-util';
import { RulesetEditTextComponent } from '../../tile-ruleset/text/edit-text/edit-text.component';
import { Characters } from '../../core/models/view-models/characters.model';
import { RulesetBuffAndEffectTileComponent } from '../../tile-ruleset/buff-and-effect/buff-and-effect.component';
import { RulesetToggleTileComponent } from '../../tile-ruleset/toggle/toggle.component';
import { EditRulesetCharacterStatClusterComponent } from '../../tile-ruleset/character-stat-cluster/edit-character-stat-cluster/edit-character-stat-cluster.component';
import { RulesetCharacterStatClusterTileComponent } from '../../tile-ruleset/character-stat-cluster/character-stat-cluster.component';
import { CastComponent } from '../../shared/cast/cast.component';
import { SpellsService } from '../../core/services/spells.service';
import { AbilityService } from '../../core/services/ability.service';
import { ItemMasterService } from '../../core/services/item-master.service';
import { MonsterTemplateService } from '../../core/services/monster-template.service';
import { BuffAndEffectService } from '../../core/services/buff-and-effect.service';

@Component({
  selector: 'app-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss']
})
export class CampaignDashboardComponent implements OnInit {
  public event: EventEmitter<any> = new EventEmitter();
  STAT_TYPE = STAT_TYPE;
  TILES = TILES;
  isLoading = false;
  bsModalRef: BsModalRef;
  isLayoutDropdownOpen: boolean = false;
  isPageDropdownOpen: boolean = false;
  //characterId: number;
  ruleSetId: number;
  //character: any = new Characters();
  ruleset: any = new Ruleset();
  //characterlayouts: any;
  rulesetlayouts: any;
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
  pageId: number = 0;
  LayoutId: number = 0;
  //pageDefaultData = new CharacterDashboardPage();
  pageDefaultData = new RulesetDashboardPage();
  showActions: boolean = true;
  actionText: string;

  text: string;
  largeImageTiles: any;
  image: string;
  //commandTiles: any;
  bgColor: string;
  noteTiles: any;
  public someValue: number = 5;
  public someMin: number = -10;
  public someMax: number = 10;
  boxes: Box[] = [];

  private Originalboxes: Box[] = [];
  private Deletedboxes: Box[] = [];
  private ResizeRelocateboxes: Box[] = [];

  hasAdded: boolean = false;
  IsMobileScreen: boolean = this.isMobile();

  private rgb: string = '#efefef';
  private curNum;
  IsComputerDevice: boolean = false;
  IsTabletDevice: boolean = false;
  IsMobileDevice: boolean = false;
  showManageIcons: boolean = true;

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

  IsTrashPage: boolean = false;

  trashedTile: boolean = false;
  StateChanged: boolean = false;
  ChangesSaved: boolean = false;
  finalTileList: RulesetTileConfig[] = [];
  noRecordFound: boolean = false;

  IsResizePage: boolean = false;
  IsEditPage: boolean = false;
  IsRelocatePage: boolean = false;
  IsMobilePanel: boolean = false;

  private BoxesCurrentPaylod: number = 1;
  private BoxesEditedIndex: number = 0;
  private itemPositions: Array<any> = [];
  private initial: boolean = true;
  private isRefreshed: boolean = false;
  preventClick: boolean = false;
  private currentGridItems: NgGridItemEvent[] = [];
  headers: HeaderValues = new HeaderValues();
  isManageTile: boolean = false;

  CharacterStatsValues: any;
  Layout = Layout;
  IsGm: boolean = false;

  timeoutHandler: any;
  editMode: boolean = false;

  constructor(private router: Router, private alertService: AlertService, private authService: AuthService, private sharedService: SharedService,
    private route: ActivatedRoute, private modalService: BsModalService,
    private localStorage: LocalStoreManager, private dragulaService: DragulaService,
    private rulesetTileService: RulesetTileService,
    private rulesetService: RulesetService,
    private layoutService: RulesetDashboardLayoutService,
    private pageService: RulesetDashboardPageService,
    private tileConfig: RulesetTileConfigService, public appService: AppService1,
    private SpellService: SpellsService, private AbilityService: AbilityService,
    private monsterService: MonsterTemplateService, private itemMasterService: ItemMasterService,
    private buffAndEffectService: BuffAndEffectService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.modalService.hide(1));

    dragulaService.drop.subscribe((value: any[]) => {

      const [bagName, e, el] = value;
      if (value[0] == 'bag-rulesetDashboardLayout') {
        this.onLayoutDrop(value.slice(1));
      }
      else if (value[0] == 'bag-rulesetDashboardPages') {
        this.onPageDrop(value.slice(1));
      }
    });

    dragulaService.over.subscribe((value) => { this.onOver(value.slice(1)); });
    dragulaService.out.subscribe((value) => { this.onOut(value.slice(1)); });

    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
    let isNewTab = false;
    let url = this.router.url.toLowerCase();
    if (url && url.split('?') && url.split('?')[1]) {
      let serachParams = new URLSearchParams(url.split('?')[1]);
      isNewTab = (serachParams.get("l") === "1");
    }
    if (isNewTab) {
      this.appService.updateOpenWindowInNewTab(true);
      if (this.ruleSetId) {
        let RuleSetID = ServiceUtil.DecryptID(this.ruleSetId);
        this.ruleSetId = +RuleSetID;
        let displayURL = '/ruleset/campaign-dashboard';
        let originalURl = '/ruleset/campaign-dashboard/' + RuleSetID;
        Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
      }
    }


    this.sharedService.shouldUpdateRulesetDashboardLayout().subscribe(serviceJson => {
      if (serviceJson) {

        this.page = 1;
        this.pageSize = 6;
        this.isLoading = true;
        this.layoutService.getSharedLayoutByRulesetId(this.ruleSetId, -1, -1)
          .subscribe(data => {
            this.rulesetlayouts = data;
            //if (this.rulesetlayouts.length == 1) {
            //    this.selectedlayout = this.rulesetlayouts[0];
            //}
            this.rulesetlayouts.map((item) => {
              if (item.isDefaultLayout) {
                this.selectedlayout = item;
                this.onLayoutSelect(this.selectedlayout);
              }
            })

            this.isLoading = false;
          }, error => {
            this.isLoading = false;
          }, () => {

          });
      }
    });

    this.sharedService.shouldUpdateRulesetDashboardPage().subscribe(serviceJson => {
      if (serviceJson) {
        //let m: any = serviceJson
        //let viewtype = m.view;
        this.isLoading = true;
        this.pageService.getPagesByLayoutId(this.selectedlayout.rulesetDashboardLayoutId)
          .subscribe(data => {

            this.selectedlayout.rulesetDashboardPages = data;
            var selectedLayoutId = this.selectedlayout.rulesetDashboardLayoutId;
            if (this.selectedlayout.rulesetDashboardPages.length == 1) {

              this.selectedPage = this.selectedlayout.rulesetDashboardPages[0];
            }
            this.rulesetlayouts.forEach(function (val) {
              if (selectedLayoutId == val.rulesetDashboardLayoutId) {
                val.rulesetDashboardPages = data;
              }
            });
            this.initialize(false);
            //if (viewtype === "duplicate" || viewtype === "add") {
            //    let model: any = data;
            //    if (model.length > 0) {
            //        this.selectedPage = model.filter(x => x.rulesetDashboardPageId == m.rulesetDashboardPageId);
            //        this.onPageSelect(this.selectedPage);
            //    }
            //}


          }, error => {
            //this.isLoading = false;
          }, () => {
          });
      }
    });

    this.sharedService.shouldUpdateRulesetDashboard().subscribe(serviceJson => {
      if (serviceJson) {
        if (serviceJson.length) {
          let result: any = serviceJson;
          result.map((item) => {
            this.addBox(item);
          })
        }
        else {
          this.addBox(serviceJson);
        }
        this.initialize(false);
      }
    });

    this.sharedService.shouldUpdateShareLayout().subscribe(data => {
      if (data) {
        this.initialize(false);
      }
    });

  }
  @HostListener('document:click', ['$event'])
  documentClick(e: any) {
    let target = e.target;
    if (target.className && target.className == "Editor_Command a-hyperLink" && !this.editMode) {
      this.GotoCommand(target.attributes["data-editor"].value);
    }
    if (target.className && !this.editMode) {
      if (target.className == "Editor_Ruleset_spellDetail a-hyperLink") {
        ServiceUtil.GotoSpellDetail(target.attributes["data-editor"].value, this.router);
      }
      else if (target.className == "Editor_Ruleset_abilityDetail a-hyperLink") {

        ServiceUtil.GotoAbilityDetail(target.attributes["data-editor"].value, this.router);
      }
      else if (target.className == "Editor_Ruleset_BuffAndEffectDetail a-hyperLink") {

        ServiceUtil.GotoBuffEffectDetail(target.attributes["data-editor"].value, this.router);
      }
      else if (target.className == "Editor_Ruleset_ItemTemplateDetail a-hyperLink") {

        if (target.attributes["data-isbundle"].value == "true") {
          ServiceUtil.GotoItemTemplateBundleDetail(target.attributes["data-editor"].value, this.router);
        } else {
          ServiceUtil.GotoItemTemplateDetail(target.attributes["data-editor"].value, this.router);
        }
      }
      else if (target.className == "Editor_Ruleset_MonsterTemplateDetail a-hyperLink") {

        if (target.attributes["data-isbundle"].value == "true") {
          ServiceUtil.GotoMonsterTemplateBundleDetail(target.attributes["data-editor"].value, this.router);
        } else {
          ServiceUtil.GotoMonsterTemplateDetail(target.attributes["data-editor"].value, this.router);
        }
      }
      else if (target.className == "Editor_Ruleset_MonsterDetail a-hyperLink") {

        ServiceUtil.GotoMonsterDetail(target.attributes["data-editor"].value, this.router);
      }
    }

    if ((target.className == "Editor_Ruleset_spellDetailExe a-hyperLink" || target.className == "Editor_Ruleset_abilityDetailExe a-hyperLink"
      || target.className == "Editor_Ruleset_BuffAndEffectDetailExe a-hyperLink" || target.className == "Editor_Ruleset_ItemTemplateDetailExe a-hyperLink"
      || target.className == "Editor_Ruleset_MonsterTemplateDetailExe a-hyperLink" || target.className == "Editor_Ruleset_MonsterDetailExe a-hyperLink")
      && !this.editMode) {

      this.ExecutePopup(target.attributes["data-editor"].value, target.className);
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

      if (this.rulesetlayouts != null || this.rulesetlayouts != undefined) {

        this.rulesetlayouts.forEach(function (val) {

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
        this.selectedlayout.rulesetDashboardPages.forEach(function (val) {
          val.showIcon = false;
        })
      }
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.destroyModalOnInit();
      this.validateDevice();
      this.initialize(true);
      this.showActionButtons(this.showActions);
      this.pageId = this.localStorage.localStorageGetItem('rPageID')
      this.localStorage.localStorageSetItem('rPageID', null);
      this.LayoutId = this.localStorage.localStorageGetItem('rLayoutID')
      this.localStorage.localStorageSetItem('rLayoutID', null);
    });
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
    //    setTimeout(() => {
    //        this.gridConfig = {
    //            'margins': this.getTileSize().margins,
    //            'draggable': true,
    //            'resizable': true,
    //            'max_cols': this.columnsInGrid,
    //            'max_rows': 0,
    //            'visible_cols': 0,
    //            'visible_rows': 0,
    //            'min_cols': 0,
    //            'min_rows': 0,
    //            'col_width': this.getTileSize().max,
    //            'row_height': this.getTileSize().max,
    //            'cascade': 'up',
    //            'min_width': this.getTileSize().min,
    //            'min_height': this.getTileSize().min,
    //            'fix_to_grid': false,
    //            'auto_style': true,
    //            //'auto_resize': false,
    //            'auto_resize': this.IsMobileScreen,
    //            'maintain_ratio': true,
    //            'prefer_new': true,
    //            'limit_to_screen': true,
    //            'center_to_screen': true,
    //            'resize_directions': this.IsMobileScreen ? [
    //                "bottomleft",
    //                "bottomright",
    //                "topright",
    //                "topleft",
    //                "right",
    //                "left",
    //                "bottom",
    //                "top"
    //            ] : [
    //                    "bottomleft",
    //                    "bottomright"
    //                ],
    //        };
    //        this.boxes = this.mapBoxes(this.tiles);
    //    }, 10);
    //}

    //let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    //if (user == null)
    //  this.authService.logout();
    //else {
    //  if (user.isGm) {
    //    this.IsGm = user.isGm;
    //  }
    //}
  }

  private initialize(IsInitialLoad) {
    this.showManageIcons = true;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
      }
      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'ruleset') {
          this.ruleSetId = this.headers.headerId;
        }
      }
      this.setRulesetId(this.ruleSetId);
      try {
        if (this.isManageTile) {
          if (window.innerWidth < 1200) {
            this.gridConfig.draggable = false;
            this.gridConfig.resizable = false;
            this.IsMobilePanel = true;
          } else {
            this.gridConfig.draggable = true;
            this.gridConfig.resizable = true;
            this.IsMobilePanel = false;
          }
        }
        this.isLoading = true;
        this.rulesetService.getRulesetById_CacheNew<any>(this.ruleSetId)
          .subscribe(data => {
            this.ruleset = data;
            this.rulesetModel = data;
            //this.isLoading = false;
            this.setHeaderValues(this.ruleset);
          }, error => {
            this.ruleset = new Ruleset();
            this.isLoading = false;
          }, () => { });
        //this.isLoading = true;
        this.layoutService.getSharedLayoutByRulesetId_Cache(this.ruleSetId, -1, -1, IsInitialLoad)
          .subscribe(data => {
            this.rulesetlayouts = data;
            if (this.LayoutId) {
              this.rulesetlayouts.map((item) => {
                if (item.rulesetDashboardLayoutId == this.LayoutId) {
                  //if (item.isDefaultLayout) {
                  this.selectedlayout = item;
                }
              })
              //this.selectedlayout
            }
            else {

              let isLayoutSelected = false;
              if (IsInitialLoad) {
                this.rulesetlayouts.map((item) => {
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

              //if (!isLayoutSelected) {
              //  this.rulesetlayouts.map((item) => {
              //    if (item.isSharedLayout) {
              //      this.selectedlayout = item;
              //    }
              //  })
              //}

              this.rulesetlayouts.map((item) => {
                if (item.isDefaultLayout) {
                  this.selectedlayout = item;
                }
              })

            }
            if (this.pageId) {
              this.rulesetlayouts.map((item) => {
                if (item.rulesetDashboardLayoutId == this.LayoutId) {
                  item.rulesetDashboardPages.map((pageItem) => {
                    if (pageItem.rulesetDashboardPageId == this.pageId) {
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
                  this.rulesetlayouts.map((item) => {
                    if (item.isDefaultComputer && this.IsComputerDevice) {
                      isLayoutSelected = true;
                      item.rulesetDashboardPages.map((pageItem) => {
                        if (pageItem.rulesetDashboardPageId == item.defaultPageId) {
                          this.selectedPage = pageItem;
                        }
                      })
                    }
                    else if (item.isDefaultTablet && this.IsTabletDevice) {
                      isLayoutSelected = true;
                      item.rulesetDashboardPages.map((pageItem) => {
                        if (pageItem.rulesetDashboardPageId == item.defaultPageId) {
                          this.selectedPage = pageItem;
                        }
                      })
                    }
                    else if (item.isDefaultMobile && this.IsMobileDevice) {
                      isLayoutSelected = true;
                      item.rulesetDashboardPages.map((pageItem) => {
                        if (pageItem.rulesetDashboardPageId == item.defaultPageId) {
                          this.selectedPage = pageItem;
                        }
                      })
                    }
                  })
                }
                if (!isLayoutSelected) {
                  this.rulesetlayouts.map((item) => {
                    if (item.isDefaultLayout) {
                      item.rulesetDashboardPages.map((pageItem) => {
                        if (pageItem.rulesetDashboardPageId == item.defaultPageId) {
                          this.selectedPage = pageItem;
                        }
                      })
                    }
                  })
                }

              }
            }

            if (!this.selectedPage && this.page1) {
              let isLayoutSelected = false;
              if (IsInitialLoad) {
                this.rulesetlayouts.map((item) => {
                  if (item.isDefaultComputer && this.IsComputerDevice) {
                    isLayoutSelected = true;
                    this.selectedPage = item.rulesetDashboardPages[0];
                  }
                  else if (item.isDefaultTablet && this.IsTabletDevice) {
                    isLayoutSelected = true;
                    this.selectedPage = item.rulesetDashboardPages[0];
                  }
                  else if (item.isDefaultMobile && this.IsMobileDevice) {
                    isLayoutSelected = true;
                    this.selectedPage = item.rulesetDashboardPages[0];
                  }
                })
              }

              if (!isLayoutSelected) {
                this.rulesetlayouts.map((item) => {
                  if (item.isDefaultLayout) {
                    this.selectedPage = item.rulesetDashboardPages[0];
                  }
                })
              }

              //this.initialize();
              //this.page1 = 0;
            }

            if (this.selectedPage) {
              if (this.selectedPage.rulesetDashboardPageId) {
                this.isLoading = true;
                //this.rulesetTileService.getTilesByPageIdRulesetId<string>(this.selectedPage.rulesetDashboardPageId, this.ruleSetId)
                this.rulesetTileService.getTilesByPageIdRulesetId_sp_Cache<string>(this.selectedPage.rulesetDashboardPageId, this.ruleSetId, IsInitialLoad)
                  .subscribe(data => {
                    this.tiles = data;
                    this.boxes = this.mapBoxes(data);
                    if (this.IsMobilePanel) {
                      this.openEditGrid();
                    }

                    this.isLoading = false;
                    try {
                      this.noRecordFound = !data.length;
                    } catch (err) { }
                  }, error => {
                    this.isLoading = false;
                  }, () => { });
              } else this.isLoading = false;

              if (this.selectedPage.rulesetDashboardPageId) {

                this.pageDefaultData = this.selectedPage;
                //this.pageService.getRulesetDashboardPageById<any>(this.selectedPage.rulesetDashboardPageId)
                //    .subscribe(data => {
                //        this.pageDefaultData = data;
                //    }, error => {
                //    }, () => { });
              }

            } else this.isLoading = false;
          }, error => {
            this.isLoading = false;
          }, () => {
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

  private setHeaderValues(ruleset: Ruleset): any {
    let headerValues = {
      headerName: ruleset.ruleSetName,
      headerImage: ruleset.imageUrl,
      headerId: ruleset.ruleSetId,
      headerLink: 'ruleset',
      hasHeader: true
    };
    this.appService.updateAccountSetting1(headerValues);
    this.sharedService.updateAccountSetting(headerValues);
    this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
  }

  showActionButtons(showActions) {
    this.showActions = !this.showActions;
    if (showActions) {
      this.actionText = 'Show Actions';
    } else {
      this.actionText = 'Hide Actions';
    }
  }
  checkTile(url: string, pageId: number, layoutId: number) {
    this.localStorage.deleteData('pageId');
    this.localStorage.saveSyncedSessionData(pageId, 'pageId');
    this.localStorage.localStorageSetItem('rPageID', pageId);
    this.localStorage.localStorageSetItem('rLayoutID', layoutId);
    this.router.navigate([url, this.ruleSetId]);
  }

  manageRoute(url: string) {
    this.router.navigate([url, this.ruleSetId]);
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
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.recordName = this.ruleset.ruleSetName;
    this.bsModalRef.content.recordImage = this.ruleset.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset'
    this.bsModalRef.content.isFromCampaignDetail = true;
  }
  manageIcon(id: number) {
    this.rulesetlayouts.forEach(function (val) {
      if (id === val.rulesetDashboardLayoutId) {
        val.showIcon = true;

      } else {
        val.showIcon = false;
      }
    })
  }

  onLayoutSelect(layout: any): void {

    this.selectedlayout = layout;
    this.selectedPage = layout.rulesetDashboardPages[0];
    this.selectedlayout.rulesetDashboardPages.map((pageItem) => {
      if (pageItem.rulesetDashboardPageId == this.selectedlayout.defaultPageId) {
        this.selectedPage = pageItem;
      }
    })

    this.tiles = null;
    if (this.selectedPage) {
      if (this.selectedPage.rulesetDashboardPageId) {
        this.isLoading = true;
        this.rulesetTileService.getTilesByPageIdRulesetId_sp<string>(this.selectedPage.rulesetDashboardPageId, this.ruleSetId)
          .subscribe(data => {

            this.isLoading = false;
            this.tiles = data;
            this.boxes = this.mapBoxes(data);
            try {
              this.noRecordFound = !data.length;
            } catch (err) { }
          }, error => {
            this.isLoading = false;
          }, () => { });
      }
      this.updateDefaultLayout(this.selectedPage.rulesetDashboardLayoutId);
    }
  }

  newLayout() {
    this.showAddModal();
  }

  private showAddModal() {
    this.bsModalRef = this.modalService.show(RulesetLayoutComponent, {
      class: 'modal-layout',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'New Layout';
    this.bsModalRef.content.button = 'SAVE';
    this.bsModalRef.content.rulesetId = this.ruleSetId;
    this.bsModalRef.content.isCampaignDashboardScreen = true;
  }

  editLayout(rulesetDashboardLayout: any) {
    this.bsModalRef = this.modalService.show(RulesetLayoutComponent, {
      class: 'modal-layout',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Layout';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.rulesetId = this.ruleSetId;
    this.bsModalRef.content.layoutFormModal = rulesetDashboardLayout;
    this.bsModalRef.content.layoutPages = rulesetDashboardLayout.rulesetDashboardPages;
    this.bsModalRef.content.isCampaignDashboardScreen = true;
  }

  duplicateLayout(rulesetDashboardLayout: any) {
    this.bsModalRef = this.modalService.show(RulesetLayoutComponent, {
      class: 'modal-layout',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Duplicate Layout';
    this.bsModalRef.content.button = 'DUPLICATE';
    this.bsModalRef.content.rulesetId = this.ruleSetId;
    this.bsModalRef.content.layoutFormModal = rulesetDashboardLayout;
    this.bsModalRef.content.layoutPages = rulesetDashboardLayout.rulesetDashboardPages;
    this.bsModalRef.content.isCampaignDashboardScreen = true;
  }

  deleteLayout(layout: RulesetDashboardLayout) {
    this.alertService.showDialog('Are you sure you want to delete the Layout named "' + layout.name + '" ?',
      DialogType.confirm, () => this.deleteLayoutHelper(layout.rulesetDashboardLayoutId), null, 'Yes', 'No');
  }
  private deleteLayoutHelper(layoutId: number) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Layout");

    this.layoutService.deleteRulesetDashboardLayout(layoutId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          this.alertService.showMessage("Layout has been deleted successfully.", "", MessageSeverity.success);

          if (this.selectedlayout.rulesetDashboardLayoutId == layoutId) {
            this.page = 1;
            this.pageSize = 6;
            //this.initialize();
            this.rulesetlayouts = this.rulesetlayouts.filter((val) => val.rulesetDashboardLayoutId != layoutId);
            if (this.rulesetlayouts.length) {
              this.onLayoutSelect(this.rulesetlayouts[0]);
            }
            //else {
            //    this.initialize();
            //}
          }
          else {
            this.rulesetlayouts = this.rulesetlayouts.filter((val) => val.rulesetDashboardLayoutId != layoutId);
            // this.sharedService.updateRulesetDashboardLayout(true);
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

    this.selectedlayout.rulesetDashboardPages.forEach(function (val) {
      if (id == val.rulesetDashboardPageId) {
        val.showIcon = true;

      } else {
        val.showIcon = false;
      }
    })

  }

  onPageSelect(page: any): void {
    this.isLoading = true;
    this.selectedPage = page;
    if (page.rulesetDashboardPageId) {
      this.rulesetTileService.getTilesByPageIdRulesetId_sp<any>(page.rulesetDashboardPageId, this.ruleSetId)
        .subscribe(data => {
          //getRulesetDashboardPageById
          this.tiles = data;
          this.boxes = this.mapBoxes(data);
          this.isLoading = false;
          try {
            this.noRecordFound = !data.length;
          } catch (err) { }
        }, error => {
          this.isLoading = false;
        }, () => { });
      if (page.rulesetDashboardLayoutId && this.selectedPage.rulesetDashboardPageId)
        this.updateDefaultLayoutPage(page.rulesetDashboardLayoutId, page.rulesetDashboardPageId);
    }
  }

  newPage() {
    this.showPageAddModal();
  }

  private showPageAddModal() {
    this.bsModalRef = this.modalService.show(RulesetPageComponent, {
      class: 'modal-page',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'New Page';
    this.bsModalRef.content.button = 'SAVE';
    this.bsModalRef.content.rulesetId = this.ruleSetId;
    this.bsModalRef.content.layoutId = this.selectedlayout.rulesetDashboardLayoutId;
  }

  editPage(rulesetDashboardPage: any) {
    this.bsModalRef = this.modalService.show(RulesetPageComponent, {
      class: 'modal-page',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Page';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.pageFormModal = rulesetDashboardPage;
    this.bsModalRef.content.rulesetId = this.ruleSetId;
  }

  duplicatePage(rulesetDashboardPage: any) {
    this.bsModalRef = this.modalService.show(RulesetPageComponent, {
      class: 'modal-page',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Duplicate Page';
    this.bsModalRef.content.button = 'DUPLICATE';
    this.bsModalRef.content.pageFormModal = rulesetDashboardPage;
    this.bsModalRef.content.rulesetId = this.ruleSetId;
  }

  deletePage(page: RulesetDashboardPage) {
    this.alertService.showDialog('Are you sure you want to delete the page named "' + page.name + '" ?',
      DialogType.confirm, () => this.deletePageHelper(page.rulesetDashboardPageId), null, 'Yes', 'No');
  }

  private deletePageHelper(pageId: number) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Page");

    this.pageService.deleteRulesetDashboardPage(pageId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Page has been deleted successfully.", "", MessageSeverity.success);

          if (this.selectedPage.rulesetDashboardPageId == pageId) {
            if (this.selectedlayout.rulesetDashboardPages.length) {
              this.selectedlayout.rulesetDashboardPages = this.selectedlayout.rulesetDashboardPages.filter((val) => val.rulesetDashboardPageId != pageId);
              this.selectedPage = this.selectedlayout.rulesetDashboardPages[0];
              this.onPageSelect(this.selectedPage);
            }

            //this.pageService.getPagesByLayoutId(this.selectedlayout.rulesetDashboardLayoutId)
            //    .subscribe(data => {
            //        this.selectedlayout.rulesetDashboardPages = data;

            //        if (data != null && data != undefined) {
            //            this.selectedPage = this.selectedlayout.rulesetDashboardPages[0];
            //            this.onPageSelect(this.selectedPage);
            //        }

            //        var selectedLayoutId = this.selectedlayout.rulesetDashboardLayoutId;
            //        this.rulesetlayouts.forEach(function (val) {
            //            if (selectedLayoutId == val.rulesetDashboardLayoutId) {
            //                val.rulesetDashboardPages = data;
            //            }

            //        });

            //    }, error => {
            //        this.isLoading = false;
            //    }, () => {

            //    });
          }
          else {
            if (this.selectedlayout.rulesetDashboardPages.length) {
              this.selectedlayout.rulesetDashboardPages = this.selectedlayout.rulesetDashboardPages.filter((val) => val.rulesetDashboardPageId != pageId);
            }
            else {
              this.sharedService.updateRulesetDashboardPage(true);
            }
            //this.sharedService.updateRulesetDashboardPage(true);
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

    //this.layoutService.getLayoutsByRulesetId<any[]>(this.ruleSetId, this.page, this.pageSize)
    //    .subscribe(data => {

    //        for (var i = 0; i < data.length; i++) {
    //            this.rulesetlayouts.push(data[i]);
    //        }


    //    }, error => {
    //        this.isLoading = false;
    //    }, () => {


    //    });

  }

  private onLayoutDrop(rulesetDashboardLayout: any) {

    let [el, target, source] = rulesetDashboardLayout;
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
        error => { console.log("error : ", error); }
      );
  }

  private onPageDrop(rulesetDashboardPages: any) {
    let [el, target, source] = rulesetDashboardPages;
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
        error => { console.log("error : ", error); }
      );
  }

  gotoDashboard() {
    this.router.navigate(['/ruleset/dashboard', this.ruleSetId]);
  }

  openTile() {
    this.editMode = true;
    this.UpdateTileConfigList(this.finalTileList);
    this.showManageIcons = false;
    this.bsModalRef = this.modalService.show(RulesetTileComponent, {
      class: 'modal-primary modal-md tooltipClass',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Tile";
    this.bsModalRef.content.pageId = this.selectedPage.rulesetDashboardPageId ?
      this.selectedPage.rulesetDashboardPageId : this.pageId;
    this.bsModalRef.content.rulesetId = this.ruleSetId;
    this.bsModalRef.content.ruleset = this.ruleset;
    this.bsModalRef.content.isCampaignDashboard = true;

    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.showManageIcons = data;
        this.initialize(true);
      }
      this.editMode = false;
    })
  }
  openTrashGrid() {
    this.IsTrashPage = true;
    this.gridConfig.draggable = false;
    this.gridConfig.resizable = false;
    this.Deletedboxes = [];
    this.Originalboxes = Object.assign([], this.boxes);
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

    //this.boxes = Object.assign([], this.Originalboxes);
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
  deleteMultipleTiles() {
    let TileIdList = [];
    this.Deletedboxes.map((box) => {
      TileIdList.push(box.tile.rulesetTileId);
    })
    if (TileIdList.length) {
      this.isLoading = true;
      this.rulesetTileService.deleteTileList(TileIdList)
        .subscribe(data => {
          //this.isLoading = false;
          this.IsTrashPage = false;

          this.IsResizePage = false;
          this.IsRelocatePage = false;
          this.IsEditPage = false;
          if (this.isManageTile) {
            this.gridConfig.draggable = !this.IsMobilePanel;
            this.gridConfig.resizable = !this.IsMobilePanel;
          }
          this.Deletedboxes = [];
          this.save();
        }, error => {
          this.isLoading = false;
        }, () => { });
    }
    else {
      this.IsTrashPage = false;
      this.IsTrashPage = false;
      this.IsResizePage = false;
      this.IsRelocatePage = false;
      this.IsEditPage = false;
      if (this.isManageTile) {
        this.gridConfig.draggable = !this.IsMobilePanel;
        this.gridConfig.resizable = !this.IsMobilePanel;
      }
      this.Deletedboxes = [];
      this.save();
    }

  }
  viewTile(tile: any, tileType: number, e: any) {

    if (e.target.className && e.target.className.indexOf("a-hyperLink") > -1) {
      return false;
    }
    if (!this.isManageTile) {
      //let _tile: any;
      let _tile = Object.assign({}, tile);
      switch (tileType) {
        case TILES.NOTE: {
          this.bsModalRef = this.modalService.show(RulesetEditNoteComponent, {
            class: 'modal-primary modal-lg',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.tile = _tile;
          this.bsModalRef.content.noteTile = _tile.noteTiles;
          this.bsModalRef.content.rulesetId = this.ruleSetId;
          this.bsModalRef.content.view = VIEW.MANAGE;
          this.bsModalRef.content.tileName = 'note';

          this.bsModalRef.content.pageId = this.selectedPage.rulesetDashboardPageId ?
            this.selectedPage.rulesetDashboardPageId : this.pageId;
          this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          break;
        }
        case TILES.IMAGE: {
          this.bsModalRef = this.modalService.show(RulesetEditImageComponent, {
            class: 'modal-primary modal-custom-image',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.tile = _tile;
          this.bsModalRef.content.imageTile = _tile.imageTiles;
          this.bsModalRef.content.tileName = 'image';
          this.bsModalRef.content.rulesetId = this.ruleSetId;
          this.bsModalRef.content.view = VIEW.MANAGE;

          this.bsModalRef.content.pageId = this.selectedPage.rulesetDashboardPageId ?
            this.selectedPage.rulesetDashboardPageId : this.pageId;
          this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          break;
        }
        case TILES.COUNTER: {
          this.bsModalRef = this.modalService.show(RulesetEditCounterComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.tile = _tile;
          this.bsModalRef.content.counterTile = _tile.counterTiles;
          this.bsModalRef.content.rulesetId = this.ruleSetId;
          this.bsModalRef.content.view = VIEW.MANAGE;
          this.bsModalRef.content.pageId = this.selectedPage.rulesetDashboardPageId ?
            this.selectedPage.rulesetDashboardPageId : this.pageId;
          this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          break;
        }
        case TILES.CHARACTERSTAT: {
          let characterStatTypeID = _tile.characterStatTiles.characterStat.characterStatType.characterStatTypeId;
          switch (characterStatTypeID) {
            case STAT_TYPE.Command:
              //  this.bsModalRef = this.modalService.show(DiceRollComponent, {
              //    class: 'modal-primary modal-md',
              //    ignoreBackdropClick: true,
              //    keyboard: false
              //  });
              //  this.bsModalRef.content.title = "Dice";
              //  this.bsModalRef.content.rulesetId = this.ruleSetId;
              //  this.bsModalRef.content.ruleset = this.ruleset;
              //  this.bsModalRef.content.tile = TILES.CHARACTERSTAT;
              //  this.bsModalRef.content.characterStatTile = _tile.characterStatTiles;
              ////  this.bsModalRef.content.isFromRulesetSharedLayout = true;             
              //  this.bsModalRef.content.characterId = 0;
              //  this.bsModalRef.content.character = new Characters();
              //  this.bsModalRef.content.recordName = this.ruleset.ruleSetName;
              //  this.bsModalRef.content.recordImage = this.ruleset.imageUrl;
              //  this.bsModalRef.content.recordType = 'ruleset'
              //  this.bsModalRef.content.isFromCampaignDetail = true;
              break;
            case STAT_TYPE.Condition:
              break;
            case STAT_TYPE.Toggle:
              break;
            case STAT_TYPE.LinkRecord:
              break;
            //default:
            //  let characterStat = _tile.characterStatTiles.characterStat;

            //  this.bsModalRef = this.modalService.show(RulesetEditCharacterStatComponent, {
            //    class: 'modal-primary modal-md',
            //    ignoreBackdropClick: true,
            //    keyboard: false
            //  });
            //  this.bsModalRef.content.tile = _tile;
            //  this.bsModalRef.content.characterStatTile = _tile.characterStatTiles;
            //  this.bsModalRef.content.tileName = 'link';
            //  this.bsModalRef.content.rulesetId = this.ruleSetId;
            //  this.bsModalRef.content.ruleset = this.ruleset;
            //  this.bsModalRef.content.pageId = this.pageId;
            //  this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
            //  this.bsModalRef.content.view = VIEW.MANAGE;
            //  break;
            default:
              let characterStat = _tile.characterStatTiles.characterStat;

              this.bsModalRef = this.modalService.show(RulesetEditCharacterStatComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
              });

              this.bsModalRef.content.tile = _tile;
              this.bsModalRef.content.characterStatTile = _tile.characterStatTiles;
              this.bsModalRef.content.tileName = 'link';
              this.bsModalRef.content.rulesetId = this.ruleSetId;
              this.bsModalRef.content.ruleset = this.ruleset;
              this.bsModalRef.content.pageId = this.selectedPage.rulesetDashboardPageId ?
                this.selectedPage.rulesetDashboardPageId : this.pageId;
              this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
              this.bsModalRef.content.view = VIEW.MANAGE;
              this.bsModalRef.content.isFromCampaignDetail = true;
              break;
          }
          break;
        }
        case TILES.LINK: {
          break;
        }
        case TILES.EXECUTE: {
          break;
        }
        case TILES.COMMAND: {

          this.bsModalRef = this.modalService.show(DiceRollComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = "Dice";
          this.bsModalRef.content.rulesetId = this.ruleSetId;
          this.bsModalRef.content.ruleset = this.ruleset;
          this.bsModalRef.content.tile = TILES.COMMAND;
          this.bsModalRef.content.commandTile = _tile.commandTiles;

          this.bsModalRef.content.characterId = 0;
          this.bsModalRef.content.character = new Characters();
          this.bsModalRef.content.recordName = this.ruleset.ruleSetName;
          this.bsModalRef.content.recordImage = this.ruleset.imageUrl;
          this.bsModalRef.content.isFromCampaignDetail = true;
          this.bsModalRef.content.recordType = 'ruleset'

          //this.bsModalRef = this.modalService.show(EditImageComponent, {
          //    class: 'modal-primary modal-md',
          //    ignoreBackdropClick: true,
          //    keyboard: false
          //});
          //this.bsModalRef.content.tile = _tile;
          //this.bsModalRef.content.commandTile = _tile.commandTiles;
          //this.bsModalRef.content.tileName = 'command';
          //this.bsModalRef.content.rulesetId = this.ruleSetId;
          //this.bsModalRef.content.view = VIEW.MANAGE;
          //this.bsModalRef.content.pageId = this.selectedPage.rulesetDashboardPageId ?
          //    this.selectedPage.rulesetDashboardPageId : this.pageId;
          //this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          break;
        }
        case TILES.TEXT: {
          this.bsModalRef = this.modalService.show(RulesetEditTextComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.tile = _tile;
          this.bsModalRef.content.textTile = _tile.textTiles;
          this.bsModalRef.content.tileName = 'image';
          this.bsModalRef.content.rulesetId = this.ruleSetId;
          this.bsModalRef.content.view = VIEW.MANAGE;

          this.bsModalRef.content.pageId = this.selectedPage.rulesetDashboardPageId ?
            this.selectedPage.rulesetDashboardPageId : this.pageId;
          this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          break;
        }
        case TILES.TOGGLE: {
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

          break;
        }
        case TILES.CHARACTERSTATCLUSTER: {
          this.bsModalRef = this.modalService.show(EditRulesetCharacterStatClusterComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.tile = _tile;
          this.bsModalRef.content.textTile = _tile.characterStatClusterTiles;
          this.bsModalRef.content.tileName = 'image';
          this.bsModalRef.content.rulesetId = this.ruleSetId;
          this.bsModalRef.content.view = VIEW.MANAGE;

          this.bsModalRef.content.pageId = this.selectedPage.rulesetDashboardPageId ?
            this.selectedPage.rulesetDashboardPageId : this.pageId;
          this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
          break;
        }
        default: break;
      }
    }

  }
  updateToggleTile(tile) {
    this.rulesetTileService.updateToggleTileValues(tile).subscribe(
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
  NextPrevPage(selectedlayout: any, next: any) {

    this.isLoading = true;
    let allPages = selectedlayout.rulesetDashboardPages;
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
      list = this.selectedlayout.rulesetDashboardPages;
      this.isPageDropdownOpen = true;
    }
    else {
      list = this.rulesetlayouts;
      this.isLayoutDropdownOpen = true;
    }
    var index = list.findIndex(stat => stat.name === item.name);
    const temp = list[index];
    const prevEl = list[index - 1];
    if (index > 0) {
      list.splice(index - 1, 1, temp);
      list.splice(index, 1, prevEl);
      if (IsPage) {
        this.selectedlayout.rulesetDashboardPages = list;
      }
      else {
        this.rulesetlayouts = list;
      }

      this.onChange(item, IsPage);
    }
  }

  scrollDown(item, IsPage, element) {
    this.SortClick = true
    let list;
    if (IsPage) {
      list = this.selectedlayout.rulesetDashboardPages;
      this.isPageDropdownOpen = true;
    }
    else {
      list = this.rulesetlayouts;
      this.isLayoutDropdownOpen = true;
    }
    var index = list.findIndex(stat => stat.name === item.name);
    const temp = list[index];
    const prevEl = list[index + 1];
    if (index !== list.length - 1) {
      list.splice(index + 1, 1, temp);
      list.splice(index, 1, prevEl);
      if (IsPage) {
        this.selectedlayout.rulesetDashboardPages = list;
      }
      else {
        this.rulesetlayouts = list;
      }
      this.onChange(item, IsPage);
    }
  }

  updateDefaultLayout(layoutId) {

    this.layoutService.updateDefaultLayout(layoutId)
      .subscribe(data => { },
        error => { console.log("updateDefaultLayout error : ", error); }
      );
  }

  updateDefaultLayoutPage(layoutId, pageId) {
    this.layoutService.updateDefaultLayoutPage(layoutId, pageId)
      .subscribe(data => { },
        error => { console.log("updateDefaultLayoutPage error : ", error); }
      );
  }

  private onChange(item: any, IsPage) {
    if (IsPage) {
      //this.onPageDrop(item);
      const rowData = Array.from(this.selectedlayout.rulesetDashboardPages);

      let _sortOrder = rowData.map((row: any, index: number) => {
        return {
          Id: row.rulesetDashboardPageId,
          SortOrder: index + 1
        }
      });
      this.sortOrderPages(_sortOrder);
    }
    else {
      // this.onLayoutDrop(item);
      const rowData = Array.from(this.rulesetlayouts);
      let _sortOrder = rowData.map((row: any, index: number) => {
        return {
          Id: row.rulesetDashboardLayoutId,
          SortOrder: index + 1
        }
      });
      this.sortOrderLayouts(_sortOrder);

    }
    //let [el, target, source] = item;

    //this.sortOrderRulesetStat(_sortOrder);
  }

  private mapBoxes(List) {
    let boxes: Box[] = [];
    let ngGridItemConfig: NgGridItemConfig;
    List.map((item, index) => {
      index = index + 1;

      if (item.hasOwnProperty("config") && item.config) { //Values set in DB
        ngGridItemConfig = { dragHandle: ".handle", payload: item.config.rulesetTileId, col: item.config.col, row: item.config.row, sizex: item.config.sizeX, sizey: item.config.sizeY, };
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
        ngGridItemConfig = this._generateDefaultItemConfig(item.rulesetTileId);
      }
      if (item.tileTypeId == TILES.CHARACTERSTAT) {
        if (item.characterStatTiles.characterStat.characterStatDefaultValues) {
          //  console.log('defultvales', item.characterStatTiles.characterStat.characterStatDefaultValues);
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.RichText) {
            //console.log('rich', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('richloop', stat.defaultValue);
              // item.characterStatTiles.characterStat.defaultValue =
            })

          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.Command) {
            //console.log('cmd', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('cmd', stat.defaultValue);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.Condition) {
            //console.log('Condition', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('Condition', stat.defaultValue);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.Calculation) {
            //console.log('Calculation', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('Calculation', stat.defaultValue);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.Choice) {
            //console.log('Choice', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('Choice', stat.defaultValue);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.Number) {
            //console.log('Number', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('Number', stat.defaultValue);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.CurrentMax) {
            //console.log('CurrentMax', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('CurrentMax', stat);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.OnOff) {
            //console.log('OnOff', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('OnOff', stat);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.YesNo) {
            //console.log('YesNo', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('YesNo', stat.defaultValue);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.Toggle) {
            //console.log('Toggle', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('Toggle', stat.defaultValue);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }
          if (item.characterStatTiles.characterStat.characterStatTypeId == STAT_TYPE.LinkRecord) {
            //console.log('LinkRecord', item.characterStatTiles.characterStat.characterStatDefaultValues);
            item.characterStatTiles.characterStat.characterStatDefaultValues.map((stat) => {
              //console.log('LinkRecord', stat.defaultValue);
              item.characterStatTiles.characterStat.defaultValue = stat.defaultValue;
            })
          }

          //switch (item.characterStatTiles.characterStat.characterStatTypeId) {
          //  case STAT_TYPE.Command:

          //  default:
          //}
        }
      }
      else if (item.tileTypeId == TILES.TEXT) {
        let AllChoices: any[] = [];
        // console.log('1531', item);
      }
      else if (item.tileTypeId == TILES.TOGGLE && item.toggleTiles) {

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
          if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues) {
            //  console.log('defultvales', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.RichText) {
              //console.log('rich', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('richloop', stat.defaultValue);
                // item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue =
              })

            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.Command) {
              //console.log('cmd', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('cmd', stat.defaultValue);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.Condition) {
              //console.log('Condition', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('Condition', stat.defaultValue);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.Calculation) {
              //console.log('Calculation', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('Calculation', stat.defaultValue);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.Choice) {
              //console.log('Choice', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('Choice', stat.defaultValue);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.Number) {
              //console.log('Number', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('Number', stat.defaultValue);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.CurrentMax) {
              //console.log('CurrentMax', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('CurrentMax', stat);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.OnOff) {
              //console.log('OnOff', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('OnOff', stat);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.YesNo) {
              //console.log('YesNo', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('YesNo', stat.defaultValue);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.Toggle) {
              //console.log('Toggle', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('Toggle', stat.defaultValue);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }
            if (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId == STAT_TYPE.LinkRecord) {
              //console.log('LinkRecord', item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues);
              item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatDefaultValues.map((stat) => {
                //console.log('LinkRecord', stat.defaultValue);
                item.characterStatClusterTiles.displayCharactersCharacterStat.defaultValue = stat.defaultValue;
              })
            }

            //switch (item.characterStatClusterTiles.displayCharactersCharacterStat.characterStatTypeId) {
            //  case STAT_TYPE.Command:

            //  default:
            //}
          }
        }
      }
      let box: Box = { config: ngGridItemConfig, tile: item, IsCharacter: false };
      boxes.push(box);
    })
    //console.log(boxes)
    return boxes;
  }

  private _generateDefaultItemConfig(rulesetTileId: number = 0): NgGridItemConfig {
    var item: NgGridItemConfig = { dragHandle: ".handle", payload: rulesetTileId, col: this.BoxesCurrentColumn, row: this.BoxesCurrentRow, sizex: 2, sizey: 2, };
    if (this.BoxesCurrentColumn < this.columnsInGrid - 1) {
      this.BoxesCurrentColumn = this.BoxesCurrentColumn + 2;
    }
    else {
      this.BoxesCurrentColumn = this.startIndex;
      this.BoxesCurrentRow = this.BoxesCurrentRow + 2;
    }
    return item;
  }

  /////////////////////////////////////////////////////////

  editTile(_editTile: any, tileType: number, boxIndex: number = 0) {
    // alert(this.preventClick);
    //if (!this.preventClick) {
    this.editMode = false;
    this.showManageIcons = false;
    let tile: RulesetTile = _editTile;
    this.UpdateTileConfigList(this.finalTileList);
    this.BoxesEditedIndex = boxIndex;
    switch (tileType) {
      case TILES.NOTE: {
        this.bsModalRef = this.modalService.show(RulesetNoteTileComponent, {
          class: 'modal-primary modal-lg modal-custom tile-popup',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Note Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.rulesetId = this.ruleSetId;
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
        this.bsModalRef = this.modalService.show(RulesetImageTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Image Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.rulesetId = this.ruleSetId;
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
        this.bsModalRef = this.modalService.show(RulesetCounterTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Counter Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.rulesetId = this.ruleSetId;
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
        this.bsModalRef = this.modalService.show(RulesetCharacterStatTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Character Stat Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.rulesetId = this.ruleSetId;
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
        this.bsModalRef.content.title = "Edit Command Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.rulesetId = this.ruleSetId;
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
        this.bsModalRef = this.modalService.show(RulesetTextTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Text Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.rulesetId = this.ruleSetId;
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
        this.bsModalRef = this.modalService.show(RulesetBuffAndEffectTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = "Edit Buffs & Effects Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.rulesetId = this.ruleSetId;
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
      case TILES.TOGGLE: {
        this.bsModalRef = this.modalService.show(RulesetToggleTileComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Toggle Tile';
        this.bsModalRef.content.rulesetId = this.ruleSetId;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;

        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            this.showManageIcons = data;
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
        this.bsModalRef.content.title = "Edit Character Stat Cluster Tile";
        this.bsModalRef.content.tile = tile;
        this.bsModalRef.content.rulesetId = this.ruleSetId;
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

  deleteTile(rulesetTile: RulesetTile, boxIndex: number = 0) {
    if (!this.preventClick) {
      if (rulesetTile.tileTypeId === TILES.NOTE)
        this.alertService.showDialog('Are you sure you want to delete this tile?',
          DialogType.confirm, () => this.deleteRulesetHelper(rulesetTile, boxIndex), null, 'Yes', 'No');
      else
        this.deleteRulesetHelper(rulesetTile, boxIndex);
    }
    this.preventClick = false;
  }

  private deleteRulesetHelper(rulesetTile: RulesetTile, boxIndex: number = 0) {
    //this.alertService.startLoadingMessage("", "Deleting Tile");
    this.isLoading = true;
    this.rulesetTileService.deleteTile(rulesetTile.rulesetTileId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Ruleset Tile has been deleted successfully.", "", MessageSeverity.success);
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
    const conf: NgGridItemConfig = this._generateDefaultItemConfig(tile.rulesetTileId);
    this.boxes.push({ config: conf, tile: tile, IsCharacter: false });
    let config: RulesetTileConfig = { rulesetTileId: conf.payload, payload: conf.payload, col: conf.col, row: conf.row, sizeX: conf.sizex, sizeY: conf.sizey };
    this.createUpdateTileConfig(config, false);
  }

  removeGridBox(index: number): void {
    this.isRefreshed = true;
    if (this.boxes[index]) {
      //this.deleteTileConfig(this.boxes[index].config.payload);
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
    //let config: TileConfig = { rulesetTileId: event.payload, payload: event.payload, col: event.col, row: event.row, sizeX: event.sizex, sizeY: event.sizey };
    //this.tileConfig.createTileConfig<TileConfig>(config)
    //    .subscribe(data => {
    //    }, error => {
    //    }, () => { });

  }

  onDrag(index: number, event: NgGridItemEvent, element?: any): void {
    this.preventClick = true;
    //alert(this.preventClick);
    //  this.trashedTile = false;
    if (this.IsMobileScreen) {
      this.trashedTile = false
    }
  }

  onChangeStart(event: NgGridItemEvent, index): void {
    //console.log('onChangeStart', event);
    //this.boxes[index].config.draggable = false;
    //let myVar = setTimeout(() => {
    //    this.boxes[index].config.draggable = true;
    //   clearTimeout(myVar);
    //}, 1000);


    //this.preventClick = true;
    //alert(this.preventClick);       
  }

  onDragStop(event: any, rulesetTile: RulesetTile, boxIndex: number = 0) {
    if (this.trashedTile) {
      this.preventClick = false;
      this.deleteTile(rulesetTile, boxIndex);
      this.trashedTile = false;
    }
  }

  onResize(box: any, index: number, event: NgGridItemEvent): void {
    //console.log( event.height + ' - ' + event.width);
    this.preventClick = true;
    //alert(this.preventClick);
  }

  removeTile(event: any, rulesetTile: RulesetTile, boxIndex: number = 0) {
    this.trashedTile = false;

    //try {
    //    let heightTile = event.currentTarget.childNodes[1].clientHeight;
    //    let widthTile = event.currentTarget.childNodes[1].clientWidth;

    //    console.log('widthTile', widthTile, 'heightTile', heightTile);

    //    let offsetLeftLI = this.ref.nativeElement.childNodes[1].childNodes[2].childNodes[1].childNodes[8].childNodes[1].childNodes[3].offsetLeft;
    //    let offsetTopLI = this.ref.nativeElement.childNodes[1].childNodes[2].childNodes[1].childNodes[8].childNodes[1].childNodes[3].offsetTop;

    //    if (event.pageX > (+offsetLeftLI - (widthTile / 2)) && event.pageY > (+offsetTopLI - (heightTile / 2))) {
    //       // this.deleteTile(rulesetTile, boxIndex);
    //    }

    //} catch (err) { }
  }

  trashTile() {
    this.trashedTile = true;
  }

  mouseout() {
    this.trashedTile = false;
  }

  grid_onItemChange(items) {
    this.currentGridItems = items
    if (this.initial) {
      let configList: RulesetTileConfig[] = [];
      items.map((item) => {
        //let config: RulesetTileConfig = { rulesetTileId: item.payload, payload: item.payload, col: item.col, row: item.row, sizeX: item.sizex, sizeY: item.sizey };
        //this.createUpdateTileConfig(config, false);

        configList.push({ rulesetTileId: item.payload, payload: item.payload, col: item.col, row: item.row, sizeX: item.sizex, sizeY: item.sizey });
      })
      this.createUpdateTileConfigList(configList, false);
      this.finalTileList = Object.assign(configList);
      this.initial = false;
    }
    if (this.isRefreshed) {
      let configList: RulesetTileConfig[] = [];
      items.map((item) => {
        //let config: RulesetTileConfig = { rulesetTileId: item.payload, payload: item.payload, col: item.col, row: item.row, sizeX: item.sizex, sizeY: item.sizey };
        //this.createUpdateTileConfig(config, true);
        configList.push({ rulesetTileId: item.payload, payload: item.payload, col: item.col, row: item.row, sizeX: item.sizex, sizeY: item.sizey });
      })
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

  createUpdateTileConfig(config: RulesetTileConfig, update: boolean) {
    this.tileConfig.createUpdateRulesetTileConfig<RulesetTileConfig>(config, update)
      .subscribe(data => {

      }, error => {

      }, () => { });
  }

  //deleteTileConfig(rulesetTileID) {

  //    this.tileConfig.deleteRulesetTileConfig<RulesetTileConfig>(rulesetTileID)
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
  createUpdateTileConfigList(configList: RulesetTileConfig[], update: boolean, viewLoader: boolean = true, redirectto: any = undefined, params: any = undefined) {
    if (update) {
      this.isLoading = viewLoader;
      if (this.StateChanged) {
        this.tileConfig.createUpdateRulesetTileConfigList<RulesetTileConfig[]>(configList, update)
          .subscribe(data => {
            this.isLoading = false;
            this.StateChanged = false;
            if (redirectto != undefined) {
              this.cancelCallback(redirectto, params);
            }
          }, error => {
            this.isLoading = false;
          }, () => { });
      }
      else {
        this.isLoading = false;
      }
    }
    else {
      this.tileConfig.createUpdateRulesetTileConfigList<RulesetTileConfig[]>(configList, update)
        .subscribe(data => {

        }, error => {
          this.isLoading = false;
        }, () => { });
    }

  }
  UpdateTileConfigList(configList: RulesetTileConfig[]) {
    this.tileConfig.createUpdateRulesetTileConfigList<RulesetTileConfig[]>(configList, true)
      .subscribe(data => {
        this.StateChanged = false;
      }, error => {
        this.isLoading = false;
      }, () => { });
  }
  saveAndGotoDashboard() {
    this.isManageTile = false;
    this.gridConfig.draggable = false;
    this.gridConfig.resizable = false;
    this.deleteMultipleTiles();
  }
  save(redirectto: any = undefined, params: any = undefined) {

    this.createUpdateTileConfigList(this.finalTileList, true, true, redirectto, params);

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
    if (redirectto == 1) {
      this.router.navigate(['/ruleset/campaign-dashboard/', this.ruleSetId]);
    }
    else if (redirectto == 2) {
      this.router.navigate(['/ruleset/item-master/', this.ruleSetId]);
    }
    else if (redirectto == 3) {
      this.router.navigate(['/ruleset/spell/', this.ruleSetId]);
    }
    else if (redirectto == 4) {
      this.router.navigate(['/ruleset/ability/', this.ruleSetId]);
    }
    else if (redirectto == 5) {
      this.router.navigate(['/ruleset/character-stats/', this.ruleSetId]);
    }
    else if (redirectto == 6) {
      this.onLayoutSelect(params);
    }
    else if (redirectto == 7) {
      this.onPageSelect(params);
    }
    else if (redirectto == 8) {
      this.editLayout(params)
    }
    else if (redirectto == 9) {
      this.duplicateLayout(params)
    }
    else if (redirectto == 10) {
      this.deleteLayout(params)
    }
    else if (redirectto == 11) {
      this.manageIcon(params)
    }
    else if (redirectto == 12) {
      this.editPage(params)
    }
    else if (redirectto == 13) {
      this.duplicatePage(params)
    }
    else if (redirectto == 14) {
      this.deletePage(params)
    }
    else if (redirectto == 15) {
      this.managePageIcon(params)
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
    else if (Width >= 751 && Width <= 768) {
      minSize = 47 / 2;
      maxSize = 57 / 2;
      margin = [4];
    }
    else {
      minSize = 50;
      maxSize = 60;
    }
    return Object.assign({}, { min: minSize, max: maxSize, margins: margin });
  }
  validateDevice() {
    if (window.innerWidth <= 767) {//mobile
      this.IsMobileDevice = true;
      this.IsTabletDevice = false;
      this.IsComputerDevice = false;
    }
    else if (window.innerWidth >= 768 && window.innerWidth <= 1200) {//tablet
      this.IsTabletDevice = true;
      this.IsMobileDevice = false;
      this.IsComputerDevice = false;
    }
    else if (window.innerWidth >= 1201) {//desktop
      this.IsComputerDevice = true;
      this.IsTabletDevice = false;
      this.IsMobileDevice = false;
    }
  }
  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  }

  private manageTile() {
    this.isManageTile = true;
    this.gridConfig.draggable = true;
    this.gridConfig.resizable = true;
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

  GotoCommand(cmd) {
    // TODO get char ID
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = cmd;
  }
  ExecutePopup(Id, className) {
    if (className == "Editor_Ruleset_spellDetailExe a-hyperLink" && Id) {
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      let spellDetail: any;
      //this.SpellService.get<any>(Id)
      //  .subscribe(data => {
      //    spellDetail = this.characterSpellService.spellModelDetailData(data, "UPDATE");
      this.SpellService.getspellsById<any>(Id)
        .subscribe(data => {
          if (data) {
            spellDetail = this.SpellService.spellModelData(data, "UPDATE");
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
              this.bsModalRef.content.Character = new Characters();
              this.bsModalRef.content.ButtonText = 'Cast';
              //this.bsModalRef.content.Character = new Characters();
              //this.bsModalRef.content.recordId = spellDetail.spellId;
              //this.bsModalRef.content.recordType = 'spell';

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
    else if (className == "Editor_Ruleset_ItemTemplateDetailExe a-hyperLink" && Id) {
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      let itemDetailExe: any;
      this.itemMasterService.getItemMasterById<any>(Id)
        .subscribe(data => {
          if (data) {
            itemDetailExe = this.itemMasterService.itemMasterModelData(data, "UPDATE");
            this.alertService.stopLoadingMessage();
            //this.isLoading = false;
            if (itemDetailExe.itemMasterCommand && itemDetailExe.itemMasterCommand.length) {
              this.bsModalRef = this.modalService.show(CastComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
              });

              this.bsModalRef.content.title = "Item Commands";
              this.bsModalRef.content.ListCommands = itemDetailExe.itemMasterCommand;
              this.bsModalRef.content.Command = itemDetailExe;
              this.bsModalRef.content.Character = new Characters();
              this.bsModalRef.content.ButtonText = 'Cast';
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
    else if (className == "Editor_Ruleset_abilityDetailExe a-hyperLink" && Id) {
      let AbilityDetailExe: any;
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      this.AbilityService.getAbilityById<any>(Id)
        .subscribe(data => {
          if (data) {
            AbilityDetailExe = this.AbilityService.abilityModelData(data, "UPDATE");
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
              this.bsModalRef.content.Character = new Characters();
              this.bsModalRef.content.ButtonText = 'Cast';
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
    else if (className == "Editor_Ruleset_BuffAndEffectDetailExe a-hyperLink" && Id) {
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      let buffAndEffectDetailExe;
      this.buffAndEffectService.getBuffAndEffectById<any>(Id)
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
              this.bsModalRef.content.Character = new Characters();
              this.bsModalRef.content.ButtonText = 'Cast';
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
    else if (className == "Editor_Ruleset_MonsterDetailExe a-hyperLink" && Id) {
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      let monsterDetailExe;
      this.monsterService.getMonsterById<any>(Id)
        .subscribe(data1 => {
          if (data1) {
            monsterDetailExe = this.monsterService.MonsterModelData(data1, "UPDATE");
            this.monsterService.getMonsterAssociateRecords_sp<any>(monsterDetailExe.monsterId, this.ruleSetId)
              .subscribe(data2 => {
                this.alertService.stopLoadingMessage();
                //this.isLoading = false;
                if (data2 && data2.monsterTemplateCommands.length) {
                  this.bsModalRef = this.modalService.show(CastComponent, {
                    class: 'modal-primary modal-md',
                    ignoreBackdropClick: true,
                    keyboard: false
                  });

                  this.bsModalRef.content.title = "Monster Commands";
                  this.bsModalRef.content.ListCommands = data2.monsterTemplateCommands;
                  this.bsModalRef.content.monsterId = Id;
                  this.bsModalRef.content.Command = monsterDetailExe;
                  this.bsModalRef.content.Character = new Characters();
                  this.bsModalRef.content.ButtonText = 'Cast';
                } else {
                  this.useCommand(monsterDetailExe)
                }

              }, error => {

              }, () => { });
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
    else if (className == "Editor_Ruleset_MonsterTemplateDetailExe a-hyperLink" && Id) {
      this.alertService.startLoadingMessage("", "Loading Commands...");
      //this.isLoading = true;
      let monsterTemplateDetailExe;
      this.monsterService.getMonsterTemplateById<any>(Id)
        .subscribe(data1 => {
          if (data1) {
            monsterTemplateDetailExe = this.monsterService.MonsterTemplateModelData(data1, "UPDATE");
            this.monsterService.getMonsterTemplateAssociateRecords_sp<any>(monsterTemplateDetailExe.monsterTemplateId, this.ruleSetId)
              .subscribe(data2 => {
                this.alertService.stopLoadingMessage();
                //this.isLoading = false;
                if (data2 && data2.monsterTemplateCommands.length) {
                  this.bsModalRef = this.modalService.show(CastComponent, {
                    class: 'modal-primary modal-md',
                    ignoreBackdropClick: true,
                    keyboard: false
                  });

                  this.bsModalRef.content.title = "Monster Template Commands";
                  this.bsModalRef.content.ListCommands = data2.monsterTemplateCommands;
                  this.bsModalRef.content.monsterTemplateId = Id;
                  this.bsModalRef.content.Command = monsterTemplateDetailExe;
                  this.bsModalRef.content.Character = new Characters();
                  this.bsModalRef.content.ButtonText = 'Cast';
                } else {
                  this.useCommand(monsterTemplateDetailExe)
                }

              }, error => {

              }, () => { });
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
  useCommand(Command: any) {
    let msg = "The command value for " + Command.name
      + " has not been provided. Edit this record to input one.";
    if (Command.command == undefined || Command.command == null || Command.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
    }
    else {
      //TODO
      this.useCommandHelper(Command);
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
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.isFromCampaignDetail = true;
    this.bsModalRef.content.command = Command.command;

    if (Command.hasOwnProperty("itemMasterId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.itemImage;
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
    else if (Command.hasOwnProperty("monsterTemplateId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.imageUrl;
    }
    else if (Command.hasOwnProperty("monsterId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.imageUrl;
      this.bsModalRef.content.recordType = 'monster';
      this.bsModalRef.content.recordId = Command.monsterId;
    }

    this.bsModalRef.content.event.subscribe(result => {
    });
  }
  GotoErrorMessageRecordNotFound() {
    let message = "No record found.";
    this.alertService.showMessage(message, "", MessageSeverity.error);
  }

  clickAndHold(tile, tileTypId, index) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  editRecord(tile, tileTypId, index) {
    this.timeoutHandler = setInterval(() => {
      if (!this.isManageTile) {
        this.editTile(tile, tileTypId, index);
      }
    }, 1000);
  }

}


