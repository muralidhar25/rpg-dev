import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AuthService } from "../../../core/auth/auth.service";
import { AlertService, MessageSeverity } from "../../../core/common/alert.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { PageLastViewsService } from "../../../core/services/pagelast-view.service";
import { ItemMasterService } from "../../../core/services/item-master.service";
import { AppService1 } from "../../../app.service";
import { LootService } from "../../../core/services/loot.service";
import { User } from "../../../core/models/user.model";
import { DBkeys } from "../../../core/common/db-keys";
import { Utilities } from "../../../core/common/utilities";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../../core/models/view-models/characters.model";
import { HeaderValues } from "../../../core/models/headers.model";
import { PlayerLootComponent } from "../../../shared/player-loot/player-loot.component";
import { CharactersService } from "../../../core/services/characters.service";
import { SharedService } from "../../../core/services/shared.service";
import { CHATACTIVESTATUS, SYSTEM_GENERATED_MSG_TYPE } from "../../../core/models/enums";
import { TakeLootPileItemsComponent } from "../../../shared/take-loot-pile-items/take-loot-pile-items.component";
import { ServiceUtil } from "../../../core/services/service-util";

@Component({
  selector: 'app-char-loot',
  templateUrl: './char-loot.component.html',
  styleUrls: ['./char-loot.component.scss']
})
export class CharacterLootComponent implements OnInit {

  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
  characterId: number;
  ItemMasterList: any;
  ruleSet: any;
  pageLastView: any;
  noRecordFound: boolean = false;
  page: number = 1;
  scrollLoading: boolean = false;
  pageSize: number = 56;
  timeoutHandler: any;
  offset = (this.page - 1) * this.pageSize;
  IsGm: boolean = false;
  lootPileItems: any[] = [];
  headers: HeaderValues = new HeaderValues();
  LootList: any;
  character: any;
  pauseAbilityAdd: boolean;
  pauseAbilityCreate: boolean;
  pageRefresh: boolean;
  characterCurrencyList = [];
  isGM_Only: boolean = false;
  searchText: string;

  initLoad: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private pageLastViewsService: PageLastViewsService,
    private itemMasterService: ItemMasterService,
    public appService: AppService1,
    public lootService: LootService,
    private characterService: CharactersService,
    private sharedService: SharedService
  ) {

    this.sharedService.shouldUpdateLootList().subscribe(response => {
      if (response) {
        this.initLoad = true;
        this.initialize();
      }
    });

    this.appService.shouldUpdateFilterSearchRecords().subscribe(filterBy => {
      this.searchText = filterBy;
    });
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className.endsWith("is-show"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }

  ngOnInit() {
    this.route.params.subscribe(params => { this.characterId = params['id']; });
    this.destroyModalOnInit();
    this.initialize();
    this.showActionButtons(this.showActions);
  }
  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
      }

      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'character') {
          this.characterId = this.headers.headerId;
        }
      }

      this.isLoading = true;
      let rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      this.characterService.getCharactersById_Cache<any>(this.characterId)
        .subscribe(data => {
          this.character = data;
          this.setHeaderValues(this.character);
          if (this.character.characterId) {
            this.gameStatus(this.character.characterId);
          }
          this.characterCurrencyList = Object.assign([], data.characterCurrencyList);
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });


      this.lootService.getLootItemsForPlayers_Cache<any>(rulesetId, this.initLoad)
        .subscribe(data => {
          if (data && data.LootItems.length > 0) {
            this.LootList = data.LootItems;
            if (this.LootList) {
              this.ruleSet = this.LootList[0].ruleSet;
            }
          }
          if (data && data.ViewType) {
            if (data.ViewType.viewType == 'List') {
              this.isListView = true;
              this.isDenseView = false;
            }
            else if (data.ViewType.viewType == 'Dense') {
              this.isDenseView = true;
              this.isListView = false;
            }
            else {
              this.isListView = false;
              this.isDenseView = false;
            }
          }
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {
          this.onSearch();
        });

      this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'ItemMaster')
        .subscribe(data => {
          if (data !== null) {
            if (data.viewType == 'List') {
              this.isListView = true;
              this.isDenseView = false;
            }
            else if (data.viewType == 'Dense') {
              this.isDenseView = true;
              this.isListView = false;
            }
            else {
              this.isListView = false;
              this.isDenseView = false;
            }
          }

        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        });
    }
  }
  onScroll() {

    ++this.page;
    this.scrollLoading = true;
    this.lootService.getLootItemsById<any>(this.characterId, this.page, this.pageSize)
      .subscribe(data => {
        var _ItemMaster = data.ItemMaster;
        for (var i = 0; i < _ItemMaster.length; i++) {
          _ItemMaster[i].showIcon = false;
          this.ItemMasterList.push(_ItemMaster[i]);
        }
        this.scrollLoading = false;
      }, error => {
        this.isLoading = false;
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { })

  }
  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  showListView(view: boolean) {
    this.isListView = view;
    this.isDenseView = false;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'ItemMaster',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.lootService.createPageLastViews_CharacterLoot<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }

  showDenseview(view: boolean) {
    this.isListView = false;
    this.isDenseView = view;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'ItemMaster',
      viewType: 'Dense',
      UserId: user.id
    }

    this.lootService.createPageLastViews_CharacterLoot<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isDenseView = data.viewType == 'Dense' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
    setTimeout(() => {
      if (window.innerHeight > document.body.clientHeight) {
        this.onScroll();
      }
    }, 10)
  }

  manageIcon(id: number) {
    this.ItemMasterList.forEach(function (val) {
      if (id === val.lootId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  RedirectBack() {
    this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");    
    window.history.back();
  }

  GoToDetails(loot: any) {
    if (loot.isLootPile) {
      this.router.navigate(['/character/loot-pile-detail', loot.lootId]);
    } else {
      this.router.navigate(['/character/loot-detail', loot.lootId]);
    }
  }
  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
    } catch (err) { }
  }

  public clickAndHold(item: any) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  Show(item) {
    let show = item.isShow ? 'Hide' : 'Show';

    this.lootService.showLoot<any>(item.lootId, !item.isShow)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        item.isShow = !item.isShow;
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + show, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  Visible(item) {
    let visible = item.isVisible ? 'Hide' : 'Show';

    this.lootService.showLootPile<any>(item.lootId, !item.isVisible)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        item.isVisible = !item.isVisible;
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + visible, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  refresh() {
    //this.page = 1;
    //this.pageSize = 28;
    this.initialize();
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

  //Popup
  TakeLootPopup() {
    this.bsModalRef = this.modalService.show(PlayerLootComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.headers = this.headers;
    this.bsModalRef.content.characterCurrencyList = Object.assign([], this.characterCurrencyList);
  }

  //Take Loot
  TakeLoot(loot) {
    let _msg = "Taking Loot";
    this.alertService.startLoadingMessage("", _msg);
    let lootarr = [];
    lootarr.push({ lootId: loot.lootId, itemName: loot.itemName })
    this.TakeLootItems(lootarr, false);
  }

  // Take Loot Pile
  TakeAll(lootPile) {
    let _msg = "Taking Loot";
    this.alertService.startLoadingMessage("", _msg);
    let lootPileId = lootPile.lootId;
    this.itemMasterService.getLootPile<any>(lootPileId)
      .subscribe(data => {
        if (data) {
          this.lootPileItems = data.lootPileItems;
        }
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => {
        this.TakeLootItems(this.lootPileItems, true);
      });
  }

  TakeLootItems(lootItems, isLootPile) {

    this.itemMasterService.getCharacterItemCount(this.ruleSet.rulesetId, this.characterId)
      .subscribe((data: any) => {
        let ItemCount = data.itemCount;
        let selectedItemCount = 0;
        let multiLootIds = [];
        let lootId = 0;
        if (lootItems && lootItems.length) {
          selectedItemCount = lootItems.length;
          lootItems.map((x, i) => {
            multiLootIds.push({ lootId: x.lootId, name: x.itemName });
            if (i == 0) lootId = x.lootId;
          });
        } else {
          if (isLootPile) {
            this.alertService.stopLoadingMessage();
            this.alertService.showMessage("Selected loot pile is empty", "", MessageSeverity.warn);
          }

          return false;
        }

        let model = { characterId: this.characterId, multiLootIds: multiLootIds, lootId: lootId };
        if ((ItemCount + selectedItemCount) < 200) {

          this.lootService.lootItemsTakeByplayer<any>(model, false, true)
            .subscribe(data => {
              if (data) {
                if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
                  let ChatWithDiceRoll = [];
                  if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
                    ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
                  }
                  let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_TAKEN_BY_LOOT_MESSAGE, obj: { characterName: this.character.characterName, lootItems: model.multiLootIds ? model.multiLootIds : [] } }
                  ChatWithDiceRoll.push(chatMsgObject);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
                } else {
                  this.appService.updateChatWithTakenByLootMessage({ characterName: this.character.characterName, lootItems: model.multiLootIds ? model.multiLootIds : [] });
                }
                this.alertService.stopLoadingMessage();
                this.alertService.showMessage("Loot Taken", "", MessageSeverity.success);
                //this.sharedService.updateLootList(true);
                if (!isLootPile) {
                  this.LootList = this.LootList.filter((val) => val.lootId != model.multiLootIds[0].lootId);
                }
                this.initialize();
              }
            }, error => {
              this.alertService.stopLoadingMessage();
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => { });
        }
        else {
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("The maximum number of Items has been reached, 200. Please delete some Items and try again.", "", MessageSeverity.error);
        }
      }, error => {
        this.alertService.stopLoadingMessage();
      }, () => { });
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

  gameStatus(characterId?: any) {
    //api for player controls
    this.characterService.getPlayerControlsByCharacterId_Cache(characterId)
      .subscribe(data => {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user == null) {
            this.authService.logout();
          }
          else {
            if (data.isPlayerCharacter && data.isPlayerLinkedToCurrentCampaign) {
              this.isGM_Only = true;
            }
            if (user.isGm) {
              this.pageRefresh = user.isGm;
            }
            else if (data.isPlayerCharacter) {
              this.pageRefresh = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {
              if (!data.isPlayerLinkedToCurrentCampaign) {
                this.pauseAbilityAdd = data.pauseAbilityAdd;
                this.pauseAbilityCreate = data.pauseAbilityCreate;

                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }

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
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }

  TakeLootPileItems(loot) {
    this.itemMasterService.getLootPile<any>(loot.lootId)
      .subscribe(data => {
        if (data) {
          this.ruleSet = data.lootPileRuleSet;
          this.lootPileItems = data.lootPileItems;
          let LootPileDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");
          LootPileDetail.ruleSet = this.ruleSet;
          if (!loot.itemMasterLootCurrency.length) {
            loot.itemMasterLootCurrency = LootPileDetail.itemMasterLootCurrency ?
              (LootPileDetail.itemMasterLootCurrency.length > 0 ? LootPileDetail.itemMasterLootCurrency : data.currencyTypesList)
              : data.currencyTypesList;
          }
          this.isLoading = false;
        }
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => {
        this.bsModalRef = this.modalService.show(TakeLootPileItemsComponent, {
          class: 'modal-primary modal-md',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.LootPileId = loot.lootId;
        this.bsModalRef.content.ruleSetId = this.ruleSet.ruleSetId;
        this.bsModalRef.content.headers = this.headers;
        if (loot.itemMasterLootCurrency) {
          this.bsModalRef.content.itemMasterLootCurrency = ServiceUtil.DeepCopy(loot.itemMasterLootCurrency);
        }
      });
  }


  onSearch() {
    ++this.page;
    this.lootService.getLootItemsById<any>(this.characterId, this.page, this.pageSize)
      .subscribe(data => {
        let count = 0;
        var _ItemMaster = data.ItemMaster;
        for (var i = 0; i < _ItemMaster.length; i++) {
          _ItemMaster[i].showIcon = false;
          this.ItemMasterList.push(_ItemMaster[i]);

          count += 1;
          if (count == _ItemMaster.length - 1) {
            this.onSearch();
          }
        }
        this.scrollLoading = false;
      }, error => { });

  }

}
