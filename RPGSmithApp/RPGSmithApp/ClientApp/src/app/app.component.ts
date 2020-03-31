
import { Component, Inject, ViewEncapsulation, OnInit, ViewChildren, AfterViewInit, QueryList, HostListener } from "@angular/core";
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import * as J from 'jquery';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { DOCUMENT } from '@angular/platform-browser';

import { AlertService, AlertDialog, DialogType, AlertMessage, MessageSeverity } from './core/common/alert.service';
import { NotificationService } from "./core/services/notification.service";
import { AppTranslationService } from "./core/common/app-translation.service";
import { AccountService } from './core/common/account.service';
import { LocalStoreManager } from './core/common/local-store-manager.service';
import { AppTitleService } from './core/common/app-title.service';
import { AuthService } from './core/auth/auth.service';
import { ConfigurationService } from './core/common/configuration.service';
import { RulesetService } from "./core/services/ruleset.service";
import { CharacterStatService } from "./core/services/character-stat.service";
import { CharactersService } from "./core/services/characters.service";
import { CommonService } from "./core/services/shared/common.service";
import { SharedService } from "./core/services/shared.service";
import { ServiceUtil } from "./core/services/service-util";

import { Permission } from './core/models/permission.model';
import { User } from './core/models/user.model';
import { LoginComponent } from "./public/login/login.component";
import { AccountSettingsComponent } from "./shared/accounts/account-settings/account-settings.component";
import { AboutHelpComponent } from './shared/accounts/about-help/about-help.component';
import { DBkeys } from "./core/common/db-keys";
import { HeaderValues } from "./core/models/headers.model";
import { Utilities } from "./core/common/utilities";
import { MyImagesComponent } from "./shared/my-images/my-images.component";
import { Ruleset } from "./core/models/view-models/ruleset.model";
import { AppService1 } from "./app.service";
import { SearchType, EDITOR_LINK_BUTTON, CHATACTIVESTATUS, SYSTEM_GENERATED_MSG_TYPE } from "./core/models/enums";
import { CampaignService } from "./core/services/campaign.service";
import { playerInviteListModel } from "./core/models/campaign.model";
import { CampaignInviteComponent } from "./rulesets/campaign-invite/campaign-invite.component";
import { LootService } from "./core/services/loot.service";
import { HandoutViewComponent } from "./shared/handouts/handout-view/handout-view.component";
import { SignalRGroupAdapter } from "./core/common/signalr-group-adapter";
import { SignalRAdapter } from "./core/common/signalr-adapter";
import { HttpClient } from '@angular/common/http';
import { HandoutuploadComponent } from "./shared/handouts/handout-upload/handoutupload.component";
import { EditorStatComponent } from "./shared/editor-link-button/character-stat/stat.component";
import { EditorLinkComponent } from "./shared/editor-link-button/link/link.component";
import { EditorExecuteComponent } from "./shared/editor-link-button/execute/execute.component";
import { EditorCommandComponent } from "./shared/editor-link-button/command/command.component";
import { CharactersCharacterStatService } from "./core/services/characters-character-stat.service";
import { merge } from "rxjs/observable/merge";
import { fromEvent } from "rxjs/observable/fromEvent";
import { Observable, Observer } from "rxjs";
import { SignalRCombatGroupAdapter } from "./core/common/signalr-combat-group-adapter";

declare var $: any;


//ONLY FOR PROD
//declare let ga: Function;

var alertify: any = require('./assets/scripts/alertify.js');

@Component({
  selector: "app-root",
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  //host: { '(window:scroll)': 'track($event)' }
})

export class AppComponent implements OnInit, AfterViewInit {
  showCharacterSearch: boolean = false;
  showCampaignSearch: boolean = false;
  bsModalRef: BsModalRef;
  isAppLoaded: boolean;
  placeHolderText: string = '';
  isUserLoggedIn: boolean;
  shouldShowLoginModal: boolean;
  removePrebootScreen: boolean;
  newNotificationCount = 0;
  isDropdownOpen: boolean = false;
  searchText: string = "";
  searchCharRule: string = "";
  logoPath = '/characters';
  SearchTypeText: string = "";
  SearchType: number = 0;
  isCharacterItem: number = 0;
  search: any;
  isChrome: boolean = Utilities.IsCrome;
  isProceedWithoutChrome: boolean = false;

  rulesetsCount: number = 0;
  charactersCount: number = 0;
  _username: string = "";
  _profileImage: string = "";

  headers: HeaderValues = new HeaderValues();

  showScrollButton: boolean = false;
  beginY: any;

  appTitle = "RPG Smith";
  appLogoLarge = "../assets/images/" + Utilities.LogoImage;// "../assets/images/logo-full.png";
  appLogoSmall = "../assets/images/logo-small.svg";

  stickyToasties: number[] = [];

  dataLoadingConsecutiveFailurs = 0;
  notificationsLoadingSubscription: any;

  @ViewChildren('loginModal,loginControl')
  modalLoginControls: QueryList<any>;

  loginModal: ModalDirective;
  loginControl: LoginComponent;

  ruleset: any = new Ruleset();
  IsCharacterRecordScreen: boolean = false;
  IsRulesetRecordScreenActive: boolean = false;
  IsCharacterRecordScreenActive: boolean = false;

  URLFlag: boolean = false;
  RefreshURLFlag: boolean = false;
  previousUrl: string = ''
  currentUrl: string = ''
  previousUrlList: string[] = []
  characterNavigation: any = {};
  dashbaordUser: boolean = false;
  isGmUser: boolean = false;
  redirectUrl: string = '';
  haveNewInvitation: boolean = false;
  haveCheckedNewInvitation: boolean = false;
  invitationList: playerInviteListModel[] = [];
  isAdmin: boolean = false;
  haveLootItems: boolean = false;
  haveHandOutItems: boolean = false;

  //changes related to chat
  title = 'app';
  currentTheme = 'dark-theme';
  triggeredEvents = [];
  fileUploadUrl: string = `${SignalRAdapter.serverBaseUrl}api/chat/UploadFile`;
  userId: string = "offline-demo";
  username: string;
  signalRAdapter: SignalRGroupAdapter;
  signalRCombatAdapter: SignalRCombatGroupAdapter;
  ChatHalfScreen: boolean = false;
  ShowAds: boolean = true;
  isPlayerCharacter: boolean = false;
  isPlayerLinkedToCurrentCampaign: boolean = false;
  isCurrentCampaignPlayerCharacter: boolean = false
  showCombatBtn: boolean = false;
  combatUrl: any;
  cId: number;
  characterId: number = 0;
  showCampaignBtn: boolean = false;
  //loadingMessageId: number = 0;
  RecordLoadingMessage: string = '';
  showLoadingRecordMessage: boolean = false;
  CheckChatStateInCurrentWindow: any;
  chatMsgsForNewWindow: any;
  chatActiveStatus = CHATACTIVESTATUS;
  startChat: boolean;
  CheckStatNotification: any;
  showOpen_ExitChatBtn: boolean = false;
  updatedStatValues: any;
  showOpenChatBtn: boolean = false;
  showExitChatBtn: boolean = false;
  isOpenChatClicked: boolean = false;

  newWindowOpend: boolean = false;
  isCampaignLoading: boolean = true;

  @HostListener('window:scroll', ['$event'])
  scrollTOTop(event) {
    if (window.pageYOffset > 0) {
      this.showScrollButton = true;
    }
    else {
      this.showScrollButton = false;
    }

  }

  get notificationsTitle() {

    let gT = (key: string) => this.translationService.getTranslation(key);

    if (this.newNotificationCount)
      return `${gT("app.Notifications")} (${this.newNotificationCount} ${gT("app.New")})`;
    else
      return gT("app.Notifications");
  }

  constructor(private storageManager: LocalStoreManager, private toastyService: ToastyService, private toastyConfig: ToastyConfig,
    private accountService: AccountService, private alertService: AlertService, private notificationService: NotificationService,
    private appTitleService: AppTitleService, private authService: AuthService, private translationService: AppTranslationService, private sharedService: SharedService,
    public configurations: ConfigurationService, public router: Router, private modalService: BsModalService, private commonService: CommonService,
    private rulesetService: RulesetService, private charactersService: CharactersService, private localStorage: LocalStoreManager,
    private app1Service: AppService1, public campaignService: CampaignService, private lootService: LootService,
    private http: HttpClient, private charactersCharacterStatService: CharactersCharacterStatService,
    private characterStatService: CharacterStatService,
    //public googleAnalyticsEventsService: GoogleAnalyticsEventsService,
    @Inject(DOCUMENT) private document: Document
  ) {
    //=>> Below GA code is only for PROD
    //this.router.events.subscribe(event => {
    //    if (event instanceof NavigationEnd) {
    //        ga('set', 'page', event.urlAfterRedirects);
    //        ga('send', 'pageview');
    //    }
    //});
    ////////////

    this.createOnline$().subscribe(isOnline => {
      if (isOnline) {
        this.localStorage.localStorageSetItem(DBkeys.IsConnected, true);
      }
      else {
        this.localStorage.localStorageSetItem(DBkeys.IsConnected, false);
      }
    });

    this.app1Service.shouldUpdateStartNotificationInterval().subscribe(res => {
      if (res) {
        if (!this.CheckStatNotification) {
          this.CheckNotifications();
        }
      }
    });

    this.app1Service.shouldUpdatCloseNotificationInterval().subscribe(res => {
      if (res) {
        if (this.CheckStatNotification) {
          clearInterval(this.CheckStatNotification);
          this.CheckStatNotification = null;
        }
      }
    });

    ////////////
    this.sharedService.shouldUpdateEditorCommand().subscribe(result => {
      if (result) {
        result.htmlEditor.insert(result.htmlToInsert);
      }
    });

    this.app1Service.shouldUpdateCombatStarted().subscribe(result => {
      if (this.ruleset) {
        this.ruleset.isCombatStarted = result ? true : false;
      }
    });

    this.app1Service.shouldUpdateAccountSetting1().subscribe((serviceData) => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user) {
        this.isAdmin = user.roles.some(function (value) { return (value === "administrator") });
        this.ShowAds = !user.removeAds;
        if (!user.hasOwnProperty("isGm")) {
          if (this.authService.idToken) {
            this.authService.updateSocialLoginUserValuesFromToken(this.authService.idToken, user)
          }
        }
        if (user.isGm) {
          this.isGmUser = true;
          //this.logoPath = '/rulesets/campaigns';
          //if (this.headers) {
          //  if (this.headers.headerLink == 'ruleset') {
          //    this.logoPath = '/ruleset/campaign-details/' + this.headers.headerId;
          //  }
          //}
          this.ShowAds = false;
          if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)
            && !(
              this.router.url.toUpperCase().indexOf('/RULESETS/CAMPAIGNS') > -1
              && this.router.url.toUpperCase().indexOf('/CHARACTERS') > -1
            )

          ) {
            this.logoPath = '/ruleset/campaign-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
            this.showOpen_ExitChatBtn = true;
          }
          else {
            this.logoPath = '/rulesets/campaigns';
            this.showOpen_ExitChatBtn = false;
          }
          if (this.router.url.toUpperCase().indexOf('/RULESETS/CAMPAIGNS') > -1) {
            this.logoPath = '/rulesets/campaigns';
            this.leaveChat(true);
            this.showOpen_ExitChatBtn = false;

            //this.signalRAdapter = undefined;
          } else if (this.router.url.toUpperCase().indexOf('/CHARACTERS') > -1) {
            this.logoPath = '/rulesets/campaigns';
            this.leaveChat(true);
            this.showOpen_ExitChatBtn = false;
            //this.signalRAdapter = undefined;
          }

          if (this.router.url.toUpperCase().indexOf('/RULESET/') > -1 && this.router.url.toUpperCase().indexOf('CHARACTER/RULESET') == -1
            && this.router.url.toUpperCase().indexOf('/RULESET/ADD') == -1) {
            if (!this.signalRAdapter && user) {
              let model: any = user;
              model.campaignID = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
              //this.signalRAdapter = new SignalRGroupAdapter(user, this.http, this.storageManager);

              if (!this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab)) {
                //console.log(11111111111111);
                this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
              }
            }
          }
          //else {
          //  this.signalRAdapter = undefined;
          //}
        }
        else {
          this.isGmUser = false;
          if (this.router.url.toUpperCase() == ('/CHARACTER') || this.router.url.toUpperCase() == ('/CHARACTERS')
            || this.router.url.toUpperCase() == ('/RULESET') || this.router.url.toUpperCase() == ('/RULESETS')
          ) {
            this.leaveChat(true);
            //this.showOpen_ExitChatBtn = false;
            //this.signalRAdapter = undefined;
          }
        }

        //if (!this.haveCheckedNewInvitation) {
        this.invitationList = [];
        this.haveNewInvitation = false;
        this.campaignService.CheckInvites<any>(user.id)
          .subscribe(data => {
            this.haveCheckedNewInvitation = true;

            if (data) {
              if (data.length) {

                this.invitationList = data;
                this.haveNewInvitation = true;
                this.NotifyUserForPendingInvites();
              }
            }
          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          }, () => { });
        //}

      }
      else { //is user!
        this.leaveChat(true);
        this.ShowAds = false;
        //this.showOpen_ExitChatBtn = false;
        //this.signalRAdapter = undefined;
      }

      if (serviceData) {
        this.headers = serviceData;
      }
      else if (serviceData == -1) {
        this.headers = undefined;
      } else {
        this.headers = this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE);
      }
      //this.haveLootItems = false;
      //this.haveHandOutItems = false;
      //this.showCombatBtn = false;
      this.combatUrl = '';
      this.cId = 0;
      if (this.headers) {
        if (this.headers.headerLink == "character") {
          this.cId = this.headers.headerId;
          if (this.cId) {
            ServiceUtil.BindCharCharDetailsInLocalStorage(this.cId, this.charactersCharacterStatService, this.localStorage, false, false, 0, undefined, [], this.characterStatService);
          }
          this.characterId = this.headers.headerId;
          this.charactersService.getPlayerControlsByCharacterId(this.headers.headerId)
            .subscribe(data => {

              this.haveHandOutItems = false;
              this.showCombatBtn = false;
              this.isPlayerCharacter = false;
              if (data) {
                this.isPlayerCharacter = data.isPlayerCharacter;
                this.isPlayerLinkedToCurrentCampaign = data.isPlayerLinkedToCurrentCampaign;
                if (data.isPlayerCharacter || data.isCurrentCampaignPlayerCharacter) {
                  if (this.router.url.toUpperCase().indexOf('/CHARACTER') > -1) {
                    this.showCombatBtn = true;
                  }

                  // Player CharacterView Url
                  this.combatUrl = ['/character/combatplayer', + this.cId];

                  if (!this.signalRAdapter && user) { //get player control 265
                    let model: any = user;
                    if (this.headers) {
                      if (this.headers.headerId && data.isPlayerCharacter) {
                        model.characterID = this.headers.headerId;
                        //this.signalRAdapter = new SignalRGroupAdapter(user, this.http, this.storageManager);
                        if (!this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab)) {
                          if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {
                            //console.log(22222222222);
                            this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
                          } else {
                            //console.log(3333333333333, user, false, this.router.url);
                            this.initializeSignalRAdapter(user, this.http, this.storageManager, false, this.router.url);
                          }
                        }
                      }
                    }

                  }
                  else if (!data.isPlayerCharacter && !user.isGm) {
                    this.leaveChat(true);
                    //this.showOpen_ExitChatBtn = false;
                    //this.signalRAdapter = undefined;
                  }
                  if (this.router.url.toUpperCase().indexOf('/CHARACTER') > -1) {
                    this.haveHandOutItems = true;
                    let _rulesetId = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
                    this.lootService.getLootItemsForPlayers<any>(_rulesetId)
                      .subscribe(data1 => {
                        this.haveLootItems = false;
                        if (data1) {
                          if (data1.length) {
                            this.haveLootItems = true;

                          }
                        }
                      }, error => {
                        let Errors = Utilities.ErrorDetail("", error);
                        if (Errors.sessionExpire) {
                          this.authService.logout(true);
                        }
                      }, () => { });
                  }
                  else {
                    this.haveLootItems = false;
                  }
                } else {
                  this.haveLootItems = false;
                }
              } else {
                this.haveLootItems = false;
              }
            }, error => {
              let Errors = Utilities.ErrorDetail("", error);
            });
        } else {
          this.haveLootItems = false;
          //this.isPlayerCharacter = false;

          //this.haveLootItems = false;
          this.haveHandOutItems = false;
          this.showCombatBtn = false;
        }
      } else {
        this.haveLootItems = false;
        //this.isPlayerCharacter = false;

        // this.haveLootItems = false;
        this.haveHandOutItems = false;
        this.showCombatBtn = false;
      }
      let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
      if (rid) {
        this.rulesetService.getRulesetById<any>(rid)
          .subscribe(data => {
            if (this.router.url.toUpperCase().indexOf('/CHARACTER/') > -1 || (this.router.url.toUpperCase().indexOf('/RULESET/') > -1 && this.router.url.toUpperCase().indexOf('/RULESET/ADD') == -1)) {

              if (!this.CheckStatNotification) {
                this.CheckNotifications();
              }
            }
            this.ruleset = data;

            this.logoNavigation(this.router.url);
            this.setCharacterRedirection(this.router.url);


            this.showCharacterSearch = ((this.router.url.toLowerCase() == '/character/dashboard'));

            if (this.router.url.toUpperCase().indexOf('/CHARACTER/DASHBOARD/') > -1
              || this.router.url.toUpperCase().indexOf('/CHARACTERS/DASHBOARD/') > -1
              || this.router.url.toUpperCase().indexOf('/CHARACTER/COMBATPLAYER/') > -1
            ) {
              this.showCharacterSearch = true;
              this.dashbaordUser = true;
              this.showCampaignSearch = false;
            } else if (this.router.url.toUpperCase().indexOf('/RULESET/CAMPAIGN-DETAILS') > -1
              || this.router.url.toUpperCase().indexOf('/RULESET/COMBAT/') > -1
              || this.router.url.toUpperCase().indexOf('/RULESET/CAMPAIGN-DASHBOARD/') > -1
            ) {
              this.showCharacterSearch = false;

              this.showCampaignSearch = true;
            }
            else {
              this.showCharacterSearch = false;
              this.showCampaignSearch = false;
            }

            if (
              this.router.url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERLOOT + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERBUFFANDEFFECT + '/') > -1
            ) {
              this.IsCharacterRecordScreen = this.headers ? this.headers.headerLink == 'ruleset' ? false : true : true;

              this.IsCharacterRecordScreenActive = true;
              this.IsRulesetRecordScreenActive = false;
            }

            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERLOOT + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETBUFFEFFECT + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETBUFFANDEFFECT + '/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETCHARACTERITEMS + '/') > -1) {

              this.IsCharacterRecordScreen = this.headers ? this.headers.headerLink == 'ruleset' ? false : true : true;

              this.IsCharacterRecordScreenActive = false;
              this.IsRulesetRecordScreenActive = true;
            }
            else {

              this.IsCharacterRecordScreen = false;

              this.IsCharacterRecordScreenActive = false;
              this.IsRulesetRecordScreenActive = false;
            }

            this.SearchType = 0;
            this.SearchTypeText = '';
            this.isCharacterItem = 0;

            if (this.router.url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/INVENTORY-DETAILS') > -1) {
              this.SearchType = SearchType.CHARACTERITEMS;
              this.SearchTypeText = 'Items';
            }
            else if ((this.router.url.toUpperCase().indexOf('/RULESET/ITEM-MASTER/') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/ITEM-DETAILS') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/BUNDLE-DETAILS') > -1) && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {
              this.SearchType = SearchType.RULESETITEMS;
              this.SearchTypeText = 'Items';
            }
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/SPELL-DETAILS') > -1) {
              this.SearchType = SearchType.CHARACTERSPELLS;
              this.SearchTypeText = 'Spells';
            }
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT-DETAIL/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT-DETAILS/') > -1) {
              this.SearchType = SearchType.CHARACTERBUFFANDEFFECT;
              this.SearchTypeText = 'Buffs & Effects';
            }
            else if ((this.router.url.toUpperCase().indexOf('/RULESET/SPELL/') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/SPELL-DETAILS') > -1)
              && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {

              this.SearchType = SearchType.RULESETSPELLS;
              this.SearchTypeText = 'Spells';
            }
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/ABILITY-DETAILS') > -1) {
              this.SearchType = SearchType.CHARACTERABILITIES;
              this.SearchTypeText = 'Abilities';
            }
            else if ((this.router.url.toUpperCase().indexOf('/RULESET/ABILITY/') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/ABILITY-DETAILS') > -1)
              && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {
              this.SearchType = SearchType.RULESETABILITIES;
              this.SearchTypeText = 'Abilities';
            }

            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEMS/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEM-DETAIL') > -1) {
              this.SearchType = SearchType.CHARACTERRULESETITEMS;
              this.SearchTypeText = 'Items';
            }
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/SPELLS/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/SPELL-DETAILS') > -1) {
              this.SearchType = SearchType.CHARACTERRULESETSPELLS;
              this.SearchTypeText = 'Spells';
            }
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ABILITIES/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ABILITY-DETAILS') > -1) {
              this.SearchType = SearchType.CHARACTERRULESETABILITIES;
              this.SearchTypeText = 'Abilities';
            }
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/LOOT-PILE-DETAILS/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/LOOT-DETAILS') > -1) {
              this.SearchType = SearchType.CHARACTERLOOT;
              this.SearchTypeText = 'Loot';
            }
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT-DETAIL/') > -1) {
              this.SearchType = SearchType.CHARACTERRULESETBUFFEFFECT;
              this.SearchTypeText = 'Buffs & Effects';
            }

            else if ((this.router.url.toUpperCase().indexOf('/RULESET/LOOT/') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/LOOT-DETAILS') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/LOOT-PILE-DETAILS') > -1
            )
              && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1
            ) {
              this.SearchType = SearchType.RULESETLOOT;
              this.SearchTypeText = 'Loots';
            }
            else if (this.router.url.toUpperCase().indexOf('/RULESET/LOOT-PILE-TEMPLATE/') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/LOOT-PILE-TEMPLATE-DETAILS') > -1) {
              this.SearchType = SearchType.RULESETLOOTTEMPLATE;
              this.SearchTypeText = 'Random Loot';
            }
            else if (this.router.url.toUpperCase().indexOf('/RULESET/MONSTER/') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/MONSTER-DETAILS') > -1) {
              this.SearchType = SearchType.RULESETMONSTER;
              this.SearchTypeText = 'Monsters';
            }
            else if (this.router.url.toUpperCase().indexOf('/RULESET/MONSTER-TEMPLATE/') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/MONSTER-TEMPLATE-DETAILS') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/MONSTER-BUNDLE-DETAILS') > -1) {
              this.SearchType = SearchType.RULESETMONSTERTEMPLATE;
              this.SearchTypeText = 'Monster Templates';
            }
            else if ((this.router.url.toUpperCase().indexOf('/RULESET/BUFF-EFFECT/') > -1 ||
              this.router.url.toUpperCase().indexOf('/RULESET/BUFF-EFFECT-DETAILS') > -1)
              && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1
            ) {
              this.SearchType = SearchType.RULESETBUFFANDEFFECT;
              this.SearchTypeText = 'Buffs & Effects';
            }

            else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS + '/') > -1) {
              this.SearchType = SearchType.RULESETITEMS;
              this.SearchTypeText = 'Items';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS + '/') > -1) {
              this.SearchType = SearchType.CHARACTERITEMS;
              this.SearchTypeText = 'Items';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS + '/') > -1) {
              this.SearchType = SearchType.RULESETSPELLS;
              this.SearchTypeText = 'Spells';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS + '/') > -1) {
              this.SearchType = SearchType.CHARACTERSPELLS;
              this.SearchTypeText = 'Spells';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES + '/') > -1) {
              this.SearchType = SearchType.RULESETABILITIES;
              this.SearchTypeText = 'Abilities';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES + '/') > -1) {
              this.SearchType = SearchType.CHARACTERABILITIES;
              this.SearchTypeText = 'Abilities';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS + '/') > -1) {
              this.SearchType = SearchType.RULESETITEMS;
              this.SearchTypeText = 'Items';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS + '/') > -1) {
              this.SearchType = SearchType.RULESETSPELLS;
              this.SearchTypeText = 'Spells';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES + '/') > -1) {
              this.SearchType = SearchType.RULESETABILITIES;
              this.SearchTypeText = 'Abilities';
            }
            else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETLOOT + '/') > -1) {
              this.SearchType = SearchType.RULESETLOOT;
              this.SearchTypeText = 'Loots';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETLOOTTEMPLATE + '/') > -1) {
              this.SearchType = SearchType.RULESETLOOTTEMPLATE;
              this.SearchTypeText = 'Random Loot';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETMONSTER + '/') > -1) {
              this.SearchType = SearchType.RULESETMONSTER;
              this.SearchTypeText = 'Monsters';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETMONSTERTEMPLATE + '/') > -1) {
              this.SearchType = SearchType.RULESETMONSTERTEMPLATE;
              this.SearchTypeText = 'Monster Templates';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETBUFFANDEFFECT + '/') > -1) {
              this.SearchType = SearchType.RULESETBUFFANDEFFECT;
              this.SearchTypeText = 'Buffs & Effects';
            }
            else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERLOOT + '/') > -1) {
              this.SearchType = SearchType.CHARACTERLOOT;
              this.SearchTypeText = 'Buffs & Effects';
            }
            else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERBUFFANDEFFECT + '/') > -1) {
              this.SearchType = SearchType.CHARACTERBUFFANDEFFECT;
              this.SearchTypeText = 'Buffs & Effects';
            }
            else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETBUFFEFFECT + '/') > -1) {
              this.SearchType = SearchType.RULESETBUFFANDEFFECT;
              this.SearchTypeText = 'Buffs & Effects';
            }

          },
            error => {

            });
      }
    });

    this.app1Service.shouldUpdateLootMessageClicked().subscribe((serviceData) => {
      if (this.isPlayerCharacter) {
        this.playerLoot();
      }
      else {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user) {
          if (user.isGm) {
            if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)) {
              this.router.navigate(['/ruleset/loot', this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)]);
            }

          }
        }
      }

      ////////this.searchCharRule = serviceData;
    });
    this.app1Service.shouldUpdateSearchText().subscribe((serviceData) => {

      this.searchCharRule = serviceData;
    });
    this.app1Service.shouldupdateInvitationlist().subscribe((serviceData) => {

      this.invitationList = serviceData;
    });
    this.app1Service.shouldUpdateChatHalfScreen().subscribe((serviceData) => {

      this.ChatHalfScreen = serviceData ? true : false;
    });
    this.app1Service.shouldUpdateAddRemove().subscribe((serviceData) => {

      if (serviceData) {
        this.ShowAds = false;
      }
      else {
        this.ShowAds = true;
      }

    });

    this.app1Service.shouldUpdateOpenChatInNewTab().subscribe(response => {
      if (response) {
        this.leaveChat(false, true);
        this.localStorage.localStorageSetItem(DBkeys.ChatInNewTab, true);
        //this.router.navigate([]).then(result => { window.open(['/full-screen-chat'].toString(), '_blank'); });
        window.open(['/full-screen-chat'].toString(), '_blank', "top=100,left=200,width=800,height=500");
      }
    });

    this.app1Service.shouldUpdateStartChatInNewTab().subscribe(response => {
      if (response) {

        if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab)) {
          let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
          if (user) {
            if (user.isGm) {
              if (!this.signalRAdapter && user) {

                if (this.headers) {
                  if (this.headers.headerLink == "ruleset") {
                    //if (this.router.url.toUpperCase().indexOf('/RULESET/') > -1 && this.router.url.toUpperCase().indexOf('CHARACTER/RULESET') == -1
                    //  && this.router.url.toUpperCase().indexOf('/RULESET/ADD') == -1) {
                    let model: any = user;
                    model.campaignID = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
                    setTimeout(() => {
                      //console.log(44444444444444444444);
                      this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
                    }, 1000);
                  }
                }
                //}
              }
            }
            if (this.headers) {
              if (this.headers.headerLink == "character") {
                if (!this.signalRAdapter && user) {
                  this.charactersService.getPlayerControlsByCharacterId(this.headers.headerId)
                    .subscribe(data => {
                      this.isPlayerCharacter = data.isPlayerCharacter;
                      this.isPlayerLinkedToCurrentCampaign = data.isPlayerLinkedToCurrentCampaign;
                      let model: any = user;

                      if (this.headers.headerId && this.isPlayerCharacter) {
                        model.characterID = this.headers.headerId;
                        if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {
                          setTimeout(() => {
                            //console.log(555555555555);
                            this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
                          }, 1000);
                        } else {
                          setTimeout(() => {
                            //console.log(66666666666666, user, false, this.router.url);
                            this.initializeSignalRAdapter(user, this.http, this.storageManager, false, this.router.url);
                          }, 1000);
                        }
                      }
                    }, error => {
                      let Errors = Utilities.ErrorDetail("", error);
                      if (Errors.sessionExpire) {
                        this.authService.logout(true);
                      }
                    }, () => { });


                }
              }
            }
          }
        }
      }
    });

    this.app1Service.shouldUpdateOpenChatInPreviousTab().subscribe(response => {
      if (response) {
        this.leaveChat();
        this.localStorage.localStorageSetItem(DBkeys.ChatInNewTab, false);
        window.opener = self;
        window.close();
        //let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        //if (user) {
        //  if (user.isGm) {
        //    this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
        //  } else {
        //    if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {
        //      this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
        //    } else {
        //      this.initializeSignalRAdapter(user, this.http, this.storageManager, false, this.router.url);
        //    }
        //  }
        //}
      }
    });

    this.app1Service.shouldUpdateGetValuesForNotification().subscribe(Condition_charStatValues => {
      if (Condition_charStatValues && Condition_charStatValues.length) {
        this.updatedStatValues = Condition_charStatValues;
      }
    });

    this.app1Service.shouldUpdateSaveLogStat().subscribe(logStat => {
      if (logStat) {
        if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {          // AlertToPlayer
          logStat.alertToPlayer = true;
          logStat.alertToGM = false;
          this.characterStatService.logCharacterStatUpdate(logStat).subscribe(result => {
          }, error => { });
        } else if (this.isPlayerCharacter && !this.isPlayerLinkedToCurrentCampaign) {  // AlertToGM
          logStat.alertToPlayer = false;
          logStat.alertToGM = true;
          this.characterStatService.logCharacterStatUpdate(logStat).subscribe(result => {
          }, error => { });
        } else {

        }


      }
    });
    this.app1Service.shouldUpdateShowIcons().subscribe(_ruleSet => {
      if (_ruleSet) {
        this.headers = this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE);
        let isCampaignCharacter = this.localStorage.getData('isCampaignCharacter');
        if (this.headers && this.headers.headerLink == 'ruleset') {
          this.ruleset.isItemEnabled = _ruleSet.isItemEnabled;
          this.ruleset.haveLootItems = _ruleSet.haveLootItems;
          this.ruleset.haveHandOutItems = _ruleSet.haveHandOutItems;

          this.showCombatBtn = true;
          if (this.ruleset.haveLootItems) {
            this.haveLootItems = true;
          }
          if (this.ruleset.haveHandOutItems) {
            this.haveHandOutItems = true;
          }
        } else if (this.headers && this.headers.headerLink == 'character' && isCampaignCharacter == true) {
          this.showCombatBtn = true;
          this.haveHandOutItems = true;
          this.haveLootItems = true;
          let ruleSetId = this.localStorage.getDataObject<any>(DBkeys.RULESET_ID);
          this.lootService.getLootItemsForPlayers<any>(ruleSetId)
            .subscribe(data1 => {
              if (data1 && data1.length) {
                this.haveLootItems = true;
              } else {
                this.haveLootItems = false;
              }
            }, error => { });
        }
      }
    });

    this.app1Service.shouldUpdateShowChatBtn().subscribe(participants => {
      if (participants && participants.length) {
        if (!this.signalRAdapter) {
          this.OpenChat();
        }
        this.showOpenChatBtn = false;
        //this.showExitChatBtn = true;
        //this.showOpen_ExitChatBtn = true;
      } else {
        //this.showOpen_ExitChatBtn = false;
        //if (this.isOpenChatClicked) {
        //  this.showExitChatBtn = true;
        //  this.showOpen_ExitChatBtn = true;
        //} else {
        //  this.showExitChatBtn = false;
        //  this.showOpenChatBtn = true;
        //  this.showOpen_ExitChatBtn = true;
        //}
      }
    });

    this.app1Service.shouldUpdateOpenWindowInNewTab().subscribe(isOpen => {
      if (isOpen) {
        this.newWindowOpend = true;
        this.leaveChat(true);
      }
    });

    this.app1Service.shouldUpdateOpenCombatChat().subscribe(isCombat => {
      if (isCombat) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user) {
          if (user.isGm) {
            this.localStorage.localStorageSetItem(DBkeys.IsRulesetCombat, true);
            this.OpenCombatChat(user, this.http, this.storageManager, true, this.router.url);
          } else {
            if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {
              this.localStorage.localStorageSetItem(DBkeys.IsRulesetCombat, true);
              this.OpenCombatChat(user, this.http, this.storageManager, true, this.router.url);
            } else {
              this.localStorage.localStorageSetItem(DBkeys.IsRulesetCombat, false);
              this.OpenCombatChat(user, this.http, this.storageManager, false, this.router.url);
            }
          }
        }
      }
    });
    this.app1Service.shouldUpdateCloseCombatChat().subscribe(isCombat => {
      if (isCombat) {
        this.closeCombatChat();
      }
    });

    this.app1Service.isCampaignLoading.subscribe(isLoading => {
      if (!isLoading) {
        this.isCampaignLoading = false;
        //console.log("isCampaignLoading => ", this.isCampaignLoading);
      }
    });

    this.storageManager.initialiseStorageSyncListener();

    translationService.addLanguages(["en", "fr", "de", "pt", "ar", "ko"]);
    translationService.setDefaultLanguage('en');

    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'top-right';
    this.toastyConfig.limit = 100;
    this.toastyConfig.showClose = true;
    this.isDropdownOpen = false;
    this.appTitleService.appName = this.appTitle;

    if (this.isUserLoggedIn)
      this.commonService.GetUserDetail();
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className.indexOf("combatTracker") > -1) {
        this.GoToPCCombat();
      } else if (target.className.indexOf("LootAvailable") > -1 || target.className.indexOf("LootTaken") > -1) {
        if (this.isPlayerCharacter) {
          if (this.isPlayerLinkedToCurrentCampaign) {
            let ruleSetId = this.localStorage.getDataObject<any>(DBkeys.RULESET_ID);
            if (ruleSetId) {
              this.GoToLoot();
            }
          }
          else {
            this.playerLoot();
          }

        } else {
          let ruleSetId = this.localStorage.getDataObject<any>(DBkeys.RULESET_ID);
          if (ruleSetId) {
            this.GoToLoot();
          }
        }
        //if (this.isPlayerCharacter) {
        //  this.playerLoot();
        //} else {
        //  this.GoToLoot();
        //}
      }
      if (target.className.endsWith("is-open"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }

  createOnline$() {
    return merge<boolean>(
      fromEvent(window, 'offline').map(() => false),
      fromEvent(window, 'online').map(() => true),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

  ngAfterViewInit() {

    this.modalLoginControls.changes.subscribe((controls: QueryList<any>) => {
      controls.forEach(control => {
        if (control) {
          if (control instanceof LoginComponent) {
            this.loginControl = control;
            this.loginControl.modalClosedCallback = () => this.loginModal.hide();
          }
          else {
            this.loginModal = control;
            this.loginModal.show();
          }
        }
      });
    });



  }

  CheckNotifications() {
    this.CheckStatNotification = setInterval(() => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      let isGM = false;
      if (user) {
        isGM = user.isGm;
      }

      if ((isGM && !this.isPlayerCharacter && this.headers && this.headers.headerLink == "ruleset") || (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign)) {
        this.localStorage.localStorageSetItem(DBkeys.IsRuleset, true);
        let rulesetId = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
        if (rulesetId) {
          this.characterStatService.GetStatNotificationForGM(rulesetId).subscribe(result => {
            let alertMsgs = '';
            let IDs = [];
            let characterId = 0;
            let characterName = '';
            let alertMsgData = [];
            if (result && result.length) {
              this.app1Service.updateGetCurrentCharacterStatData(true);
              result.map(x => {
                characterId = this.characterId ? this.characterId : x.characterId;
                characterName = x.character.characterName;
                //alertMsgs += x.character.characterName + "'s " + x.characterStat.statName + " value has changed. <br />";
                IDs.push({ iD: x.id });
              });
              if (characterId) {
                this.characterStatService.getStatAlertNotifications(characterId).subscribe(notificationData => {
                  if (notificationData && notificationData.length) {
                    alertMsgData = notificationData;
                  }
                }, error => { }, () => {
                  if (alertMsgData) {
                    alertMsgData.map(msg => {
                      //alertMsgs += "The " + msg.characterStatName + " value has changed to " + msg.characterStatValue + ". <br />";
                      alertMsgs += characterName + "'s " + msg.characterStatName + " value has changed. <br />";
                    });
                  }
                  if (alertMsgs) {
                    this.alertService.showDialog(alertMsgs, DialogType.alert, () => { });
                    this.ReadNotification(IDs);
                    this.ReadAlertMsgs(characterId);
                  }
                });
              }
              //this.alertService.showDialog(alertMsgs, DialogType.alert, () => { });
              //this.ReadNotification(IDs);
            }
          }, error => { });
        }
      }
      else if (this.isPlayerCharacter && !this.isPlayerLinkedToCurrentCampaign) {
        this.localStorage.localStorageSetItem(DBkeys.IsCharacter, true);
        if (this.headers) {
          if (this.headers.headerLink == "character") {
            this.characterId = this.headers.headerId;
            this.characterStatService.GetStatNotificationForPlayer(this.characterId).subscribe(result => {
              let alertMsgs = '';
              let IDs = [];
              let alertMsgData = [];
              if (result && result.length) {
                this.app1Service.updateGetCurrentCharacterStatData(true);
                this.characterStatService.getStatAlertNotifications(this.characterId).subscribe(notificationData => {
                  if (notificationData && notificationData.length) {
                    alertMsgData = notificationData;
                  }
                }, error => { }, () => {
                  let ccs = [];
                  let local_Storage = this.localStorage.localStorageGetItem(DBkeys.CHAR_CHAR_STAT_DETAILS);
                  if (local_Storage && local_Storage.charactersCharacterStats) {
                    ccs = local_Storage.charactersCharacterStats;
                  }
                  result.map(x => {
                    if (this.updatedStatValues) {
                      this.updatedStatValues.map(newStat => {
                        if (newStat.tile && newStat.tile.characterStatTiles && newStat.tile.characterStatTiles.charactersCharacterStat) {
                          if (newStat.tile.characterStatTiles.charactersCharacterStat.characterStat.characterStatId == x.characterStatId) {
                            let value = ServiceUtil.GetDescriptionWithStatValues('[' + x.characterStat.statName + ']', local_Storage)
                            //if (newStat.tile.characterStatTiles.charactersCharacterStat.text != value) {
                            //alertMsgs += "The " + x.characterStat.statName + " value has changed to " + newStat.tile.characterStatTiles.charactersCharacterStat.text + ". <br />";
                            IDs.push({ iD: x.id });
                            //}
                          }
                        }
                      });
                    }
                  });
                  if (alertMsgData) {
                    alertMsgData.map(msg => {
                      alertMsgs += "The " + msg.characterStatName + " value has changed to " + msg.characterStatValue + ". <br />";
                    });
                  }
                  if (alertMsgs) {
                    this.alertService.showDialog(alertMsgs, DialogType.alert, () => { });
                    this.ReadNotification(IDs);
                    this.ReadAlertMsgs(this.characterId);
                  }
                });
              }
            }, error => { });
          }
        }
      }
    }, 15000);
  }


  ReadNotification(IDs) {
    this.characterStatService.DeleteNotification(IDs).subscribe(result => { }, error => { });
  }

  ReadAlertMsgs(characterId) {
    this.characterStatService.deleteStatAlertNotifications(characterId).subscribe(result => { }, error => { }, () => { });
  }

  onLoginModalShown() {
    this.alertService.showStickyMessage("Session Expired", "Your Session has expired. Please log in again", MessageSeverity.warn);
  }

  onLoginModalHidden() {
    this.alertService.resetStickyMessage();
    this.loginControl.reset();
    this.shouldShowLoginModal = false;

    if (this.authService.isSessionExpired)
      this.alertService.showStickyMessage("Session Expired", "Your Session has expired. Please log in again to renew your session", MessageSeverity.warn);
  }

  onLoginModalHide() {
    this.alertService.resetStickyMessage();
  }

  updateCount() {
    //this.commonService.UpdateCounts();
    //this.rulesetsCount = this.commonService._rulesetCount();
    //this.charactersCount = this.commonService._characterCount();
    this.rulesetsCount = undefined;
    this.charactersCount = undefined;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    if (user) {
      this.isGmUser = user.isGm;
    }
    this.rulesetService.getRulesetAndCharactrCount(user.id)
      .subscribe(data => {
        let model: any = data;
        this.rulesetsCount = model.rulesetCount;
        this.charactersCount = model.characetrCount;
      },
        error => {
          this.rulesetsCount = 0;
          this.charactersCount = 0;
        });
  }

  private initialize() {
    this.chatMsgsForNewWindow = setInterval(() => {
      if (this.signalRAdapter) {
        if (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON && this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) == true) {
          if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
            let msgs = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
            let newMsgArray = Object.assign([], msgs);
            msgs.map((msg, index) => {
              switch (msg.type) {
                case SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_DICE_ROLL:
                  this.app1Service.updateChatWithDiceRoll(msg.obj);
                  newMsgArray.splice(index, 1);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, newMsgArray);
                  break;
                case SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_LOOT_MESSAGE:
                  this.app1Service.updateChatWithLootMessage(msg.obj);
                  newMsgArray.splice(index, 1);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, newMsgArray);
                  break;
                case SYSTEM_GENERATED_MSG_TYPE.TOGGLE_CHAT_PARTICIPANT_LIST:
                  this.app1Service.updateToggleChatParticipantList(msg.obj);
                  newMsgArray.splice(index, 1);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, newMsgArray);
                  break;
                case SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_TAKEN_BY_LOOT_MESSAGE:
                  this.app1Service.updateChatWithTakenByLootMessage(msg.obj);
                  newMsgArray.splice(index, 1);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, newMsgArray);
                  break;
                case SYSTEM_GENERATED_MSG_TYPE.CHAT_REMOVE_INTERVALS:
                  this.app1Service.updateChatRemoveIntervals(msg.obj);
                  newMsgArray.splice(index, 1);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, newMsgArray);
                  break;
                case SYSTEM_GENERATED_MSG_TYPE.CHAT_FROM_COMBAT:
                  this.app1Service.updateChatFromCombat(msg.obj);
                  newMsgArray.splice(index, 1);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, newMsgArray);
                  break;
                case SYSTEM_GENERATED_MSG_TYPE.OPEN_CHAT_FOR_CHARACTER:
                  this.app1Service.updateOpenChatForCharacter(msg.obj);
                  newMsgArray.splice(index, 1);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, newMsgArray);
                  break;
                case SYSTEM_GENERATED_MSG_TYPE.LEAVE_CHAT:
                  this.leaveChat();
                  this.localStorage.localStorageSetItem(DBkeys.ChatInNewTab, false);
                  newMsgArray.splice(index, 1);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, newMsgArray);
                  window.opener = self;
                  window.close();
                  break;
                default:
              }
            });
          }
        }
      }

    }, 5000);

    this.CheckChatStateInCurrentWindow = setInterval(() => {
      if ((this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.OFF) && (this.router.url.indexOf("full-screen-chat") > -1)) {
        //this.showOpen_ExitChatBtn = false;
        this.leaveChat(true);
        window.opener = self;
        window.close();
      }
      if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) == false) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user) {
          if (user.isGm) {
            if (!this.signalRAdapter && user) {
              if (this.router.url.toUpperCase().indexOf('/RULESET/') > -1 && this.router.url.toUpperCase().indexOf('CHARACTER/RULESET') == -1
                && this.router.url.toUpperCase().indexOf('/RULESET/ADD') == -1) {
                let model: any = user;
                model.campaignID = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
                //console.log(7777777777777);
                this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
              }
            }
          }


          if (this.headers) {
            if (this.headers.headerLink == "character") {
              if (!this.signalRAdapter && user) {

                let model: any = user;

                if (this.headers.headerId && this.isPlayerCharacter) {
                  model.characterID = this.headers.headerId;
                  if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {
                    //console.log(88888888888);
                    this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
                  } else {
                    //console.log(9999999999999, user, false, this.router.url);
                    this.initializeSignalRAdapter(user, this.http, this.storageManager, false, this.router.url);
                  }
                }

              }
            }
          }
        }
      }
      else {
        //if (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON && this.router.url.indexOf("full-screen-chat") > -1) {
        //  if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab)) {
        //    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        //    if (user) {
        //      if (user.isGm) {
        //        if (!this.signalRAdapter && user) {
        //          this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
        //        }
        //      }
        //      if (!this.signalRAdapter && user) {
        //        if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {
        //          this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
        //        } else {
        //          this.initializeSignalRAdapter(user, this.http, this.storageManager, false, this.router.url);
        //        }
        //      }
        //    }
        //  }
        //} else {
        //  this.localStorage.localStorageSetItem(DBkeys.ChatActiveStatus, CHATACTIVESTATUS.OFF);
        //  this.leaveChat();
        //}
      }
    }, 2000);

    if (this.isUserLoggedIn) this.updateCount();

    if (this.isUserLoggedIn) {
      this.commonService.GetUserDetail();
      let _user = this.commonService.getUserDetails();
      if (_user != null) {
        this._username = _user.userName == undefined ? _user.fullName : _user.userName;
        this._profileImage = _user.profileImage;
      }
    }

  }

  ngOnInit() {
    //this.logoNavigation();

    this.isUserLoggedIn = this.authService.isLoggedIn;
    this.initialize();

    // 1 sec to ensure all the effort to get the css animation working is appreciated :|, Preboot screen is removed .5 sec later
    setTimeout(() => this.isAppLoaded = true, 1000);
    setTimeout(() => this.removePrebootScreen = true, 1500);
    setTimeout(() => {
      if (this.isUserLoggedIn) {
        this.alertService.resetStickyMessage();

        //if (!this.authService.isSessionExpired)
        //this.alertService.showMessage("Login", `Welcome ${this.userName}!`, MessageSeverity.default);
        //else
        //    this.alertService.showStickyMessage("Session Expired", "Your Session has expired. Please log in again", MessageSeverity.warn);
      }
    }, 2000);


    this.alertService.getDialogEvent().subscribe(alert => this.showDialog(alert));
    this.alertService.getMessageEvent().subscribe(message => this.showToast(message, false));
    this.alertService.getStickyMessageEvent().subscribe(message => this.showToast(message, true));

    this.authService.reLoginDelegate = () => this.shouldShowLoginModal = true;

    this.authService.getLoginStatusEvent().subscribe(isLoggedIn => {

      this.isUserLoggedIn = isLoggedIn;

      if (this.isUserLoggedIn) {
        this.initNotificationsLoading();
      }
      else {
        this.unsubscribeNotifications();
      }

      setTimeout(() => {
        if (!this.isUserLoggedIn) {
          try {
            if (this.localStorage.localStorageGetItem(DBkeys.IsLogonKickedOut)) {
              this.localStorage.localStorageSetItem(DBkeys.IsLogonKickedOut, false);
              this.alertService.showMessage("Auto Logout Occurred Due to Session Inactivity.", "", MessageSeverity.default);
            }
            else {
              this.alertService.showMessage("Logged Out Successfully.", "", MessageSeverity.default);
            }
          }
          catch (e) {
            this.alertService.showMessage("Logged Out Successfully.", "", MessageSeverity.default);
          }
        }
      }, 500);
    });
    //this.router.events.pairwise().subscribe((e) => {
    //});
    //this.router.events.bufferCount(6).subscribe((e: any[]) => {
    //});
    //this.router.events
    //  .filter(e => e.constructor.name === 'RoutesRecognized')
    //  .pairwise()
    //  .subscribe((e: any[]) => {
    //  });
    this.router.events.subscribe(event => {

      if (event instanceof NavigationEnd) {

        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;

        //if (this.previousUrl == this.currentUrl) {
        //  this.router.navigate(['/search/basic/' + this.search + '/' +this.searchCharRule])
        //}

        if (this.previousUrl) {
          if (this.previousUrlList.length) {
            if (this.previousUrlList[this.previousUrlList.length - 1] != this.previousUrl) {
              this.previousUrlList.push(this.previousUrl);
            }
          }
          else {
            this.previousUrlList.push(this.previousUrl);
          }
        }
      };
      if (event instanceof NavigationStart) {
        //undefined.toLowercase();
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user) {
          this.isAdmin = user.roles.some(function (value) { return (value === "administrator") });
          this.ShowAds = !user.removeAds;
          if (!user.hasOwnProperty("isGm")) {
            if (this.authService.idToken) {
              this.authService.updateSocialLoginUserValuesFromToken(this.authService.idToken, user)
            }

          }
          if (user.isGm) {
            this.isGmUser = true;
            //this.logoPath = '/rulesets/campaigns';
            //if (this.headers) {
            //  if (this.headers.headerLink == 'ruleset') {
            //    this.logoPath = '/ruleset/campaign-details/' + this.headers.headerId;
            //  }
            //}
            this.ShowAds = false;
            if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)) {
              this.logoPath = '/ruleset/campaign-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
              this.showOpen_ExitChatBtn = true;
            }
            else {
              this.logoPath = '/rulesets/campaigns';
              this.showOpen_ExitChatBtn = false;
            }
            if ((<NavigationStart>event).url.toUpperCase().indexOf('/RULESETS/CAMPAIGNS') > -1) {
              this.logoPath = '/rulesets/campaigns';
              this.leaveChat(true);
              this.showOpen_ExitChatBtn = false;
              //this.signalRAdapter = undefined;
            } else if ((<NavigationStart>event).url.toUpperCase().indexOf('/CHARACTERS') > -1) {
              this.logoPath = '/rulesets/campaigns';
              this.leaveChat(true);
              this.showOpen_ExitChatBtn = false;
              //this.signalRAdapter = undefined;
            }

            if ((<NavigationStart>event).url.toUpperCase().indexOf('/RULESET/') > -1 && (<NavigationStart>event).url.toUpperCase().indexOf('CHARACTER/RULESET') == -1
              && (<NavigationStart>event).url.toUpperCase().indexOf('/RULESET/ADD') == -1) {
              if (!this.signalRAdapter && user) {
                let model: any = user;
                model.campaignID = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
                //this.signalRAdapter = new SignalRGroupAdapter(user, this.http, this.storageManager);

                if (!this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab)) {

                  //console.log(1010101010101010);
                  this.initializeSignalRAdapter(user, this.http, this.storageManager, true, (<NavigationStart>event).url);
                }
              }
            }
            //else {
            //  this.signalRAdapter = undefined;
            //}
          }
          else {
            this.isGmUser = false;
            if (
              (<NavigationStart>event).url.toUpperCase() == ('/CHARACTER') || (<NavigationStart>event).url.toUpperCase() == ('/CHARACTERS')
              || (<NavigationStart>event).url.toUpperCase() == ('/RULESET') || (<NavigationStart>event).url.toUpperCase() == ('/RULESETS')
            ) {
              this.leaveChat(true);
              //this.showOpen_ExitChatBtn = false;
              //this.signalRAdapter = undefined;
            }
          }
          //if (!this.haveCheckedNewInvitation) {
          this.invitationList = [];
          this.haveNewInvitation = false;
          this.campaignService.CheckInvites<any>(user.id)
            .subscribe(data => {
              this.haveCheckedNewInvitation = true;

              if (data) {
                if (data.length) {
                  this.invitationList = data;
                  this.haveNewInvitation = true;
                  this.NotifyUserForPendingInvites();
                }
              }
            }, error => {
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => { });
          //}
          //this.haveLootItems = false;
          //this.haveHandOutItems = false;
          //this.showCombatBtn = false;
          this.combatUrl = '';
          this.cId = 0;
          if (this.headers) {
            if (this.headers.headerLink == "character") {
              this.cId = this.headers.headerId;
              if (this.cId) {
                ServiceUtil.BindCharCharDetailsInLocalStorage(this.cId, this.charactersCharacterStatService, this.localStorage, false, false, 0, undefined, [], this.characterStatService);
              }
              this.characterId = this.headers.headerId;
              this.charactersService.getPlayerControlsByCharacterId(this.headers.headerId)
                .subscribe(data => {

                  this.showCombatBtn = false;
                  this.haveHandOutItems = false;
                  this.isPlayerCharacter = false;
                  if (data) {
                    this.isPlayerCharacter = data.isPlayerCharacter;
                    this.isPlayerLinkedToCurrentCampaign = data.isPlayerLinkedToCurrentCampaign;
                    if (data.isPlayerCharacter || data.isCurrentCampaignPlayerCharacter) {
                      if (url.toUpperCase().indexOf('/CHARACTER') > -1) {
                        this.showCombatBtn = true;
                      }

                      // Player CharacterView Url
                      this.combatUrl = ['/character/combatplayer', + this.cId];
                      if (!this.signalRAdapter && user) {
                        let model: any = user;
                        if (this.headers) {
                          if (this.headers.headerId && data.isPlayerCharacter) {
                            model.characterID = this.headers.headerId;
                            //model.Id = this.headers.headerId;
                            //this.signalRAdapter = new SignalRGroupAdapter(user, this.http, this.storageManager);

                            if (!this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab)) {
                              if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {

                                //console.log(121212121212121212);
                                this.initializeSignalRAdapter(user, this.http, this.storageManager, true, (<NavigationStart>event).url);
                              } else {
                                //console.log(1313131313131313);
                                this.initializeSignalRAdapter(user, this.http, this.storageManager, false, (<NavigationStart>event).url);
                              }
                            }
                          }
                        }

                      }
                      else if (!data.isPlayerCharacter && !user.isGm) {
                        this.leaveChat(true);
                        //this.showOpen_ExitChatBtn = false;
                        //this.signalRAdapter = undefined;
                      }
                      if ((<NavigationStart>event).url.toUpperCase().indexOf('/CHARACTER') > -1) {
                        this.haveHandOutItems = true;
                        let _rulesetId = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
                        this.lootService.getLootItemsForPlayers<any>(_rulesetId)
                          .subscribe(data1 => {
                            this.haveLootItems = false;
                            if (data1) {
                              if (data1.length) {
                                this.haveLootItems = true;

                              }
                            }
                          }, error => {
                            let Errors = Utilities.ErrorDetail("", error);
                            if (Errors.sessionExpire) {
                              this.authService.logout(true);
                            }
                          }, () => { });
                      }
                      else {
                        this.haveLootItems = false;
                      }
                    } else {
                      this.haveLootItems = false;
                    }
                  } else {
                    this.haveLootItems = false;
                  }
                }, error => {
                  let Errors = Utilities.ErrorDetail("", error);
                });
            } else {
              this.haveLootItems = false;
              //this.isPlayerCharacter = false;

              //this.haveLootItems = false;
              this.haveHandOutItems = false;
              this.showCombatBtn = false;
            }
          } else {
            this.haveLootItems = false;
            //this.isPlayerCharacter = false;

            //this.haveLootItems = false;
            this.haveHandOutItems = false;
            this.showCombatBtn = false;
          }
        }
        else {
          this.leaveChat(true);
          //this.signalRAdapter = undefined;
          this.ShowAds = false;
        }
        this.logoNavigation((<NavigationStart>event).url);

        let url = (<NavigationStart>event).url;

        this.setCharacterRedirection(url);

        if (!Utilities.isGoingToAppNonLoginRoutes(url)) {
          if (url.toUpperCase().indexOf('/CHARACTER/') > -1 || (url.toUpperCase().indexOf('/RULESET/') > -1 && url.toUpperCase().indexOf('/RULESET/ADD') == -1)) {

            if (!this.CheckStatNotification) {
              this.CheckNotifications();
            }
          }
          if (!this.router.navigated) {

            if (!this.RefreshURLFlag && url != '/') {
              this.RefreshURLFlag = true;
              Utilities.RefreshPage(url, this.router, this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE), this.localStorage.getDataObject<number>(DBkeys.RULESET_ID), this.localStorage);

            }
          }

          else if (this.router.navigated && url.toUpperCase().indexOf('/SEARCH/BASIC') == -1 && url != '/') {

            this.localStorage.localStorageSetItem("LastAccessedPage", url);
            if (+url.split('/')[url.split('/').length - 1] && !this.URLFlag) {
              let NewUrl = url.replace('/' + url.split('/')[url.split('/').length - 1], '')

              //if (+url.split('/')[url.split('/').length - 1]) {
              //  this.lastPrevIdUsed = this.lastIdUsed;
              //  this.lastIdUsed = +url.split('/')[url.split('/').length - 1];
              //}
              this.URLFlag = true;

              Utilities.RedriectToPageWithoutId(url, NewUrl, this.router, 1);
              //this.router.navigate([url], { skipLocationChange: true });
              //window.history.pushState('', '', NewUrl)


              //window.history.pushState('', '', url)
              //window.history.replaceState('', '', NewUrl)

            }
            else {
              let prevUrl = this.previousUrl

              if (+this.previousUrl.split('/')[this.previousUrl.split('/').length - 1]) {
                prevUrl = this.previousUrl.replace('/' + this.previousUrl.split('/')[this.previousUrl.split('/').length - 1], '')
              }

              if (url == prevUrl) {
                if (this.previousUrlList) {
                  if (this.previousUrlList[this.previousUrlList.length - 1] === this.previousUrl && this.previousUrlList.length > 2) {
                    this.currentUrl = this.previousUrlList[this.previousUrlList.length - 1]
                    this.previousUrlList.splice(this.previousUrlList.length - 1, 1);
                  }
                }

                let NewUrl = url;
                if (+url.split('/')[url.split('/').length - 1]) {
                  NewUrl = url.replace('/' + url.split('/')[url.split('/').length - 1], '')
                }

                if (this.previousUrlList) {
                  if (this.previousUrlList[this.previousUrlList.length - 1] === this.previousUrl && this.previousUrlList.length > 2) {

                    Utilities.RedriectToPageWithoutId(this.previousUrlList[this.previousUrlList.length - 1], NewUrl, this.router, 2);

                    //this.router.navigate([this.previousUrlList[this.previousUrlList.length - 1]], { skipLocationChange: true });
                    //window.history.pushState('', '', NewUrl)
                  }
                  else if (this.previousUrl.toUpperCase().indexOf('/CHARACTER/CHARACTER-STATS/') != -1
                    || this.previousUrl.toUpperCase().indexOf('/CHARACTER/') != -1
                    || this.previousUrl.toUpperCase().indexOf('/RULESET/') != -1) {
                    Utilities.RedriectToPageWithoutId(this.previousUrl, NewUrl, this.router, 3)
                  }
                  else {
                    //Utilities.RedriectToPageWithoutId(this.previousUrl, NewUrl, this.router,3);

                    //this.router.navigate([this.previousUrl], { skipLocationChange: true });
                    //window.history.pushState('', '', NewUrl)
                  }
                }
                else {
                  Utilities.RedriectToPageWithoutId(this.previousUrl, NewUrl, this.router, 4);

                  //this.router.navigate([this.previousUrl], { skipLocationChange: true });
                  //window.history.pushState('', '', NewUrl)

                }
                //this.router.navigate([this.previousUrl], { skipLocationChange: true });
                //window.history.pushState('', '', NewUrl)
                //window.history.pushState('', '', this.previousUrl)
                //window.history.replaceState('', '', NewUrl)
              }
              else {
                if (!this.URLFlag) {
                  this.URLFlag = true;
                  Utilities.RefreshPage(url, this.router, this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE), this.localStorage.getDataObject<number>(DBkeys.RULESET_ID), this.localStorage);

                }
              }
            }
          }
        }


        this.URLFlag = false;

        this.showCharacterSearch = ((url.toLowerCase() == '/character/dashboard'));

        if (url.toUpperCase().indexOf('/CHARACTER/DASHBOARD/') > -1
          || url.toUpperCase().indexOf('/CHARACTERS/DASHBOARD/') > -1
          || url.toUpperCase().indexOf('/CHARACTER/COMBATPLAYER/') > -1
        ) {
          this.showCharacterSearch = true;
          this.dashbaordUser = true;
          this.showCampaignSearch = false;
        }
        else if (url.toUpperCase().indexOf('/RULESET/CAMPAIGN-DETAILS') > -1
          || url.toUpperCase().indexOf('/RULESET/COMBAT/') > -1
          || url.toUpperCase().indexOf('/RULESET/CAMPAIGN-DASHBOARD/') > -1
        ) {
          this.showCharacterSearch = false;

          this.showCampaignSearch = true;
        }
        else {
          this.showCharacterSearch = false;
          this.showCampaignSearch = false;
        }



        if (url !== url.toLowerCase()) {

          this.router.navigateByUrl((<NavigationStart>event).url.toLowerCase());
        }

        if (
          url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1
          ||
          url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1
          ||
          url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERLOOT + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERBUFFANDEFFECT + '/') > -1
        ) {
          this.IsCharacterRecordScreen = this.headers ? this.headers.headerLink == 'ruleset' ? false : true : true;

          this.IsCharacterRecordScreenActive = true;
          this.IsRulesetRecordScreenActive = false;


        }
        else if (url.toUpperCase().indexOf('/CHARACTER/RULESET') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERLOOT + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETBUFFEFFECT + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETBUFFANDEFFECT + '/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETCHARACTERITEMS + '/') > -1
        ) {

          this.IsCharacterRecordScreen = this.headers ? this.headers.headerLink == 'ruleset' ? false : true : true;
          this.IsCharacterRecordScreenActive = false;
          this.IsRulesetRecordScreenActive = true;

        }
        else {

          this.IsCharacterRecordScreen = false;

          this.IsCharacterRecordScreenActive = false;
          this.IsRulesetRecordScreenActive = false;
        }


        this.SearchType = 0;
        this.SearchTypeText = '';

        if (url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1 ||
          url.toUpperCase().indexOf('/CHARACTER/INVENTORY-DETAILS') > -1) {
          this.SearchType = SearchType.CHARACTERITEMS;
          this.SearchTypeText = 'Items';
        }
        else if ((url.toUpperCase().indexOf('/RULESET/ITEM-MASTER/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/ITEM-DETAILS') > -1 ||
          url.toUpperCase().indexOf('/RULESET/BUNDLE-DETAILS') > -1)
          && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {
          this.SearchType = SearchType.RULESETITEMS;
          this.SearchTypeText = 'Items';
        }
        else if (url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1 ||
          url.toUpperCase().indexOf('/CHARACTER/SPELL-DETAILS') > -1) {
          this.SearchType = SearchType.CHARACTERSPELLS;
          this.SearchTypeText = 'Spells';
        }
        else if ((url.toUpperCase().indexOf('/RULESET/SPELL/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/SPELL-DETAILS') > -1)
          && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {
          this.SearchType = SearchType.RULESETSPELLS;
          this.SearchTypeText = 'Spells';
        }
        else if (url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1 ||
          url.toUpperCase().indexOf('/CHARACTER/ABILITY-DETAILS') > -1) {
          this.SearchType = SearchType.CHARACTERABILITIES;
          this.SearchTypeText = 'Abilities';
        }
        else if ((url.toUpperCase().indexOf('/RULESET/ABILITY/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/ABILITY-DETAILS') > -1) && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {
          this.SearchType = SearchType.RULESETABILITIES;
          this.SearchTypeText = 'Abilities';
        }
        else if (url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT-DETAIL/') > -1 ||
          url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT-DETAILS/') > -1) {
          this.SearchType = SearchType.CHARACTERBUFFANDEFFECT;
          this.SearchTypeText = 'Buffs & Effects';
        }
        else if (url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEMS/') > -1 ||
          this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEM-DETAIL') > -1) {
          this.SearchType = SearchType.RULESETITEMS;
          this.SearchTypeText = 'Items';
        }
        else if (url.toUpperCase().indexOf('/CHARACTER/RULESET/SPELLS/') > -1 ||
          this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/SPELL-DETAILS') > -1) {
          this.SearchType = SearchType.RULESETSPELLS;
          this.SearchTypeText = 'Spells';
        }
        else if (url.toUpperCase().indexOf('/CHARACTER/RULESET/ABILITIES/') > -1 ||
          this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ABILITY-DETAILS') > -1) {
          this.SearchType = SearchType.RULESETABILITIES;
          this.SearchTypeText = 'Abilities';
        }
        else if (url.toUpperCase().indexOf('/CHARACTER/RULESET/LOOT-PILE-DETAILS/') > -1 ||
          url.toUpperCase().indexOf('/CHARACTER/RULESET/LOOT-DETAILS') > -1) {
          this.SearchType = SearchType.CHARACTERLOOT;
          this.SearchTypeText = 'Loot';
        }
        else if (this.router.url.toUpperCase().indexOf('/CHARACTER/BUFF-EFFECT-DETAIL/') > -1) {
          this.SearchType = SearchType.CHARACTERRULESETBUFFEFFECT;
          this.SearchTypeText = 'Buffs & Effects';
        }
        else if ((url.toUpperCase().indexOf('/RULESET/LOOT/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/LOOT-DETAILS') > -1 ||
          url.toUpperCase().indexOf('/RULESET/LOOT-PILE-DETAILS') > -1)
          && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1
        ) {
          this.SearchType = SearchType.RULESETLOOT;
          this.SearchTypeText = 'Loots';
        }
        else if (url.toUpperCase().indexOf('/RULESET/LOOT-PILE-TEMPLATE/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/LOOT-PILE-TEMPLATE-DETAILS') > -1) {
          this.SearchType = SearchType.RULESETLOOTTEMPLATE;
          this.SearchTypeText = 'Random Loot';
        }
        else if (url.toUpperCase().indexOf('/RULESET/MONSTER/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/MONSTER-DETAILS') > -1) {
          this.SearchType = SearchType.RULESETMONSTER;
          this.SearchTypeText = 'Monsters';
        }
        else if ((url.toUpperCase().indexOf('/RULESET/MONSTER-TEMPLATE/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/MONSTER-TEMPLATE-DETAILS') > -1 ||
          url.toUpperCase().indexOf('/RULESET/MONSTER-BUNDLE-DETAILS') > -1)
          && url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1
        ) {
          this.SearchType = SearchType.RULESETMONSTERTEMPLATE;
          this.SearchTypeText = 'Monster Templates';
        }
        else if ((url.toUpperCase().indexOf('/RULESET/BUFF-EFFECT/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/BUFF-EFFECT-DETAILS') > -1)
          && url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {
          this.SearchType = SearchType.RULESETBUFFANDEFFECT;
          this.SearchTypeText = 'Buffs & Effects';
        }


        else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS + '/') > -1) {
          this.SearchType = SearchType.RULESETITEMS;
          this.SearchTypeText = 'Items';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS + '/') > -1) {
          this.SearchType = SearchType.CHARACTERITEMS;
          this.SearchTypeText = 'Items';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS + '/') > -1) {
          this.SearchType = SearchType.RULESETSPELLS;
          this.SearchTypeText = 'Spells';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS + '/') > -1) {
          this.SearchType = SearchType.CHARACTERSPELLS;
          this.SearchTypeText = 'Spells';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES + '/') > -1) {
          this.SearchType = SearchType.RULESETABILITIES;
          this.SearchTypeText = 'Abilities';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES + '/') > -1) {
          this.SearchType = SearchType.CHARACTERABILITIES;
          this.SearchTypeText = 'Abilities';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS + '/') > -1) {
          this.SearchType = SearchType.RULESETITEMS;
          this.SearchTypeText = 'Items';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS + '/') > -1) {
          this.SearchType = SearchType.RULESETSPELLS;
          this.SearchTypeText = 'Spells';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES + '/') > -1) {
          this.SearchType = SearchType.RULESETABILITIES;
          this.SearchTypeText = 'Abilities';
        }
        else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETLOOT + '/') > -1) {
          this.SearchType = SearchType.RULESETLOOT;
          this.SearchTypeText = 'Loots';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETLOOTTEMPLATE + '/') > -1) {
          this.SearchType = SearchType.RULESETLOOTTEMPLATE;
          this.SearchTypeText = 'Random Loot';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETMONSTER + '/') > -1) {
          this.SearchType = SearchType.RULESETMONSTER;
          this.SearchTypeText = 'Monsters';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETMONSTERTEMPLATE + '/') > -1) {
          this.SearchType = SearchType.RULESETMONSTERTEMPLATE;
          this.SearchTypeText = 'Monster Templates';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETBUFFANDEFFECT + '/') > -1) {
          this.SearchType = SearchType.RULESETBUFFANDEFFECT;
          this.SearchTypeText = 'Buffs & Effects';
        }
        else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERLOOT + '/') > -1) {
          this.SearchType = SearchType.CHARACTERLOOT;
          this.SearchTypeText = 'Buffs & Effects';
        }
        else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERBUFFANDEFFECT + '/') > -1) {
          this.SearchType = SearchType.CHARACTERBUFFANDEFFECT;
          this.SearchTypeText = 'Buffs & Effects';
        }
        else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETBUFFEFFECT + '/') > -1) {
          this.SearchType = SearchType.RULESETBUFFANDEFFECT;
          this.SearchTypeText = 'Buffs & Effects';
        }
      }
    });
    this.fEditor();
  }

  fEditor() {
    let that = this;
    $.FroalaEditor.DefineIconTemplate('brackets', '<i class="icon-Variable squareBrackets"></i>');
    $.FroalaEditor.DefineIcon('bracketsIcon', { NAME: 'squareBrackets', template: 'brackets' });
    $.FroalaEditor.RegisterCommand('my_dropdown', {
      title: 'Variables',
      icon: 'bracketsIcon',
      type: 'dropdown',
      focus: true,
      undo: true,
      refreshAfterCallback: true,
      options: {
        'Stat': 'Character Stat',
        'Link': 'Link',
        'Execute': 'Execute',
        'Command': 'Command'
      },
      callback: function (cmd, val) {
        that.EditorDropDown(val, this.html);
      },
      // Callback on refresh.
      refresh: function ($btn) {
      },
      // Callback on dropdown show.
      refreshOnShow: function ($btn, $dropdown) {
      }
    });
    $.FroalaEditor.RegisterCommand('my_dropdown2', {
      title: 'Variables',
      icon: 'bracketsIcon',
      type: 'dropdown',
      focus: true,
      undo: true,
      refreshAfterCallback: true,
      options: {
        'Stat': 'Character Stat',
        'Command': 'Command'
      },
      callback: function (cmd, val) {
        that.EditorDropDown(val, this.html);
      },
      // Callback on refresh.
      refresh: function ($btn) {
      },
      // Callback on dropdown show.
      refreshOnShow: function ($btn, $dropdown) {
      }
    });
  }

  EditorDropDown(val, editorHtml) {
    let result: string = '';
    switch (val) {
      case EDITOR_LINK_BUTTON.STAT:
        this.bsModalRef = this.modalService.show(EditorStatComponent, {
          class: 'modal-primary modal-md modal-with-max-zindex',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Select Character Stat';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.rulesetId = this.ruleset.ruleSetId;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            let totalLength = data.length;
            data.map((x, index) => {
              if (x.characterStatName) {
                if (index == totalLength - 1) {
                  result = '[' + x.characterStatName.toString() + ']';
                } else {
                  result = '[' + x.characterStatName.toString() + '] <br/>';
                }
                result =
                  editorHtml.insert(result);
              }
            });
          }
        });
        break;
      case EDITOR_LINK_BUTTON.LINK:
        // open popup
        this.bsModalRef = this.modalService.show(EditorLinkComponent, {
          class: 'modal-primary modal-md modal-with-max-zindex',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Select Record to Link';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.ruleset = this.ruleset;
        this.bsModalRef.content.isRulesetLevel = (this.router.url.toUpperCase().indexOf('/CHARACTER') > -1) ? false : true;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            let totalLength = data.length;
            data.map((x, index) => {
              if (x.link) {
                if (index == totalLength - 1) {
                  result = x.link.toString();
                } else {
                  result = x.link.toString() + '<br/>';
                }
                editorHtml.insert(result);
              }
            });
          }
        });
        break;
      case EDITOR_LINK_BUTTON.EXECUTE:
        // open popup
        this.bsModalRef = this.modalService.show(EditorExecuteComponent, {
          class: 'modal-primary modal-md modal-with-max-zindex',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Select Record to Execute';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.ruleset = this.ruleset;
        this.bsModalRef.content.isRulesetLevel = (this.router.url.toUpperCase().indexOf('/CHARACTER') > -1) ? false : true;
        this.bsModalRef.content.event.subscribe(data => {
          if (data) {
            let totalLength = data.length;
            data.map((x, index) => {
              if (x.execute) {
                if (index == totalLength - 1) {
                  result = x.execute.toString();
                } else {
                  result = x.execute.toString() + '<br/>';
                }
                editorHtml.insert(result);
              }
            });
            //result = data.toString();
            //editorHtml.insert(result);
          }
        });
        break;
      case EDITOR_LINK_BUTTON.COMMAND:
        // open popup
        this.bsModalRef = this.modalService.show(EditorCommandComponent, {
          class: 'modal-primary modal-md modal-with-max-zindex',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'Input Command';
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.rulesetId = this.ruleset.ruleSetId;
        this.bsModalRef.content.editor = editorHtml;
        //this.bsModalRef.content.event.subscribe(data => {
        //  if (data) {
        //    result = data.toString();
        //    editorHtml.insert(result);
        //  }
        //});
        break;
    }
    return result;
  }

  ngOnDestroy() {
    this.unsubscribeNotifications();
  }

  private unsubscribeNotifications() {
    if (this.notificationsLoadingSubscription)
      this.notificationsLoadingSubscription.unsubscribe();
  }

  initNotificationsLoading() {

    this.notificationsLoadingSubscription = this.notificationService.getNewNotificationsPeriodically()
      .subscribe(notifications => {
        this.dataLoadingConsecutiveFailurs = 0;
        this.newNotificationCount = notifications.filter(n => !n.isRead).length;
      },
        error => {
          this.alertService.logError(error);

          if (this.dataLoadingConsecutiveFailurs++ < 20)
            setTimeout(() => this.initNotificationsLoading(), 5000);
          else
            this.alertService.showStickyMessage("Load Error", "Loading new notifications from the server failed!", MessageSeverity.error);
        });
  }

  markNotificationsAsRead() {

    let recentNotifications = this.notificationService.recentNotifications;

    if (recentNotifications.length) {
      this.notificationService.readUnreadNotification(recentNotifications.map(n => n.id), true)
        .subscribe(response => {
          for (let n of recentNotifications) {
            n.isRead = true;
          }

          this.newNotificationCount = recentNotifications.filter(n => !n.isRead).length;
        },
          error => {
            this.alertService.logError(error);
            this.alertService.showMessage("Notification Error", "Marking read notifications failed", MessageSeverity.error);

          });
    }
  }

  // going to search page
  goToSearch(searchText: string) {
    let searchQuery = searchText;
    this.searchText = "";
    searchText = searchText ? searchText : '__empty__';
    searchText = encodeURIComponent(searchText);
    this.router.navigate(['/search/' + SearchType.EVERYTHING + '/' + searchText]);
  }

  // navigating to search page
  navigateToSearch(searchType: number, searchTxt: string) {


    if (!searchTxt) {
      searchTxt = '';
    }
    this.search = searchType;
    searchTxt = searchTxt ? searchTxt : '__empty__';
    searchTxt = encodeURIComponent(searchTxt);
    this.router.navigate(['/search/basic/' + searchType + '/' + searchTxt]);
  }

  //Search Filter
  SearchFilter(SearchType, searchCharRule) {
    //console.log("SearchType, searchCharRule => ", SearchType, searchCharRule);
    this.app1Service.updateFilterSearchRecords(searchCharRule);
  }

  gotoDashboard() {

    if (this.headers) {

      if (this.IsCharacterRecordScreen && this.IsRulesetRecordScreenActive) {

        if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEM') > -1) {
          this.router.navigate(['character/inventory', this.headers.headerId]);
        }
        else if (this.router.url.toUpperCase().indexOf('CHARACTER/RULESET/SPELL') > -1) {
          this.router.navigate(['/character/spell', this.headers.headerId]);
        }
        else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ABILIT') > -1) {
          this.router.navigate(['/character/ability', this.headers.headerId]);
        }

        else if (
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS) > -1)
          ||
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS) > -1)
        ) {
          //this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/search/basic/' + SearchType.CHARACTERITEMS + '/', this.searchCharRule])
          //);

        }
        //else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS) > -1) {
        // this.router.navigate(['/character/ability', this.headers.headerId]);
        //}
        else if (
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS + '/') > -1)
          ||
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS + '/') > -1)
        ) {
          //this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/search/basic/' + SearchType.CHARACTERSPELLS + '/', this.searchCharRule])
          //);

        }
        //else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS) > -1) {
        //  this.router.navigate(['/character/ability', this.headers.headerId]);
        //}
        else if (
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES + '/') > -1)
          ||
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES + '/') > -1)
        ) {
          //this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/search/basic/' + SearchType.CHARACTERABILITIES + '/', this.searchCharRule])
          //);
        }
        //else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES) > -1) {
        //  this.router.navigate(['/character/ability', this.headers.headerId]);
        //}
        else if (
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETBUFFANDEFFECT + '/') > -1)
          ||
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETBUFFEFFECT + '/') > -1)
        ) {
          //this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/search/basic/' + SearchType.CHARACTERBUFFANDEFFECT + '/', this.searchCharRule])
          //);
        }

      }
      else if (this.headers.headerLink == 'character') {
        this.router.navigate(['/character/dashboard', this.headers.headerId]);
      }
    }
  }

  // changing search placeholder name dynamically
  setPlaceholderText(value: any) {
    this.placeHolderText = value;
  }
  setHeaderToNull(url) {
    this.headers = null;
    this.router.navigate(url);
  }
  GoTo(url) {

    if (this.headers) {
      if (this.headers.headerLink == 'character' && this.isPlayerCharacter) {
        if (!this.isPlayerLinkedToCurrentCampaign) {
          if (!this.localStorage.localStorageGetItem(DBkeys.IsCharacterOpenedFromCampaign)) {
            this.alertService.showDialog('Exit the Character, ' + this.headers.headerName + '?',
              DialogType.confirm, () => this.setHeaderToNull(url), () => { }, "Yes", "No");
            return false;
          }
        }
        else {
          var ruleset = this.localStorage.localStorageGetItem(DBkeys.rulesetforChat);
          var rulesetName = '';
          if (ruleset) {
            rulesetName = ruleset.ruleSetName;
          }
          this.alertService.showDialog('Exit the Campaign, ' + rulesetName + '?',
            DialogType.confirm, () => this.setHeaderToNull(url), () => { }, "Yes", "No");
          return false;
        }
      }
      else if (this.headers.headerLink == 'character' && !this.isPlayerCharacter) {
        this.alertService.showDialog('Exit the Character, ' + this.headers.headerName + '?',
          DialogType.confirm, () => this.setHeaderToNull(url), () => { }, "Yes", "No");
        return false;
      }
      else if (this.headers.headerLink == 'ruleset') {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user && user.isGm) {

          this.alertService.showDialog('Exit the Campaign, ' + this.headers.headerName + '?',
            DialogType.confirm, () => this.setHeaderToNull(url), () => { }, "Yes", "No");
          return false;
        }
        else {
          this.alertService.showDialog('Exit the Ruleset, ' + this.headers.headerName + '?',
            DialogType.confirm, () => this.setHeaderToNull(url), () => { }, "Yes", "No");
          return false;
        }
      }

      //if (this.logoPath && this.logoPath.indexOf('/character')>-1) {
      //  if (!this.localStorage.localStorageGetItem(DBkeys.IsCharacterOpenedFromCampaign)) {
      //    this.alertService.showDialog('Exit Character?',
      //      DialogType.confirm, () => this.setHeaderToNull(url), () => { }, "Yes", "No");
      //    return false;
      //  }

      //} else if (this.logoPath && this.logoPath.indexOf('/ruleset') > -1) {
      //  let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      //  if (user && user.isGm) {

      //    this.alertService.showDialog('Exit Campaign?',
      //      DialogType.confirm, () => this.setHeaderToNull(url), () => { }, "Yes", "No");
      //    return false;
      //  }
      //  //else {
      //  //  this.alertService.showDialog('Exit Ruleset?',
      //  //    DialogType.confirm, () => this.setHeaderToNull(url), () => { }, "Yes", "No");
      //  //  return false;
      //  //}

      //}

    }
    this.setHeaderToNull(url);
  }
  showDialog(dialog: AlertDialog) {

    alertify.set({
      labels: {
        ok: dialog.okLabel || "OK",
        cancel: dialog.cancelLabel || "Cancel"
      }
    });

    switch (dialog.type) {
      case DialogType.alert:
        alertify.alert(dialog.message);

        break
      case DialogType.confirm:
        alertify
          .confirm(dialog.message, (e) => {
            if (e) {
              dialog.okCallback();
            }
            else {
              if (dialog.cancelCallback)
                dialog.cancelCallback();
            }
          });

        break;
      case DialogType.prompt:
        alertify
          .prompt(dialog.message, (e, val) => {
            if (e) {
              dialog.okCallback(val);
            }
            else {
              if (dialog.cancelCallback)
                dialog.cancelCallback();
            }
          }, dialog.defaultValue);

        break;
    }
  }

  showToast(message: AlertMessage, isSticky: boolean) {

    if (message == null) {
      for (let id of this.stickyToasties.slice(0)) {
        this.toastyService.clear(id);
      }

      return;
    }

    let toastOptions: ToastOptions = {
      title: message.summary,
      msg: message.detail,
      timeout: isSticky ? 0 : 4000
    };

    if (isSticky) {
      toastOptions.onAdd = (toast: ToastData) => this.stickyToasties.push(toast.id);

      toastOptions.onRemove = (toast: ToastData) => {
        let index = this.stickyToasties.indexOf(toast.id, 0);

        if (index > -1) {
          this.stickyToasties.splice(index, 1);
        }

        toast.onAdd = null;
        toast.onRemove = null;
      };
    }

    switch (message.severity) {
      case MessageSeverity.default: this.toastyService.default(toastOptions); break
      case MessageSeverity.info: this.toastyService.info(toastOptions); break;
      case MessageSeverity.success: this.toastyService.success(toastOptions); break;
      case MessageSeverity.error: this.toastyService.error(toastOptions); break
      case MessageSeverity.warn: this.toastyService.warning(toastOptions); break;
      case MessageSeverity.wait: this.toastyService.wait(toastOptions); break;
    }
  }

  logout(isButtonClick: boolean=false) {
    this.closeCombatChat();
    this.authService.logout(false, isButtonClick);
    this.authService.redirectLogoutUser();
  }

  getYear() {
    return new Date().getUTCFullYear();
  }

  get socialLogin(): string {
    return this.authService.socialLogin;
  }

  get userName(): string {
    return this.authService.currentUser ? this.authService.currentUser.userName == undefined ? this.authService.currentUser.fullName : this.authService.currentUser.userName : this._username;
  }

  get profileImage(): string {
    return this.authService.currentUser ? this.authService.currentUser.profileImage : this._profileImage;
  }

  get fullName(): string {
    return this.authService.currentUser ? this.authService.currentUser.fullName : "";
  }

  get canViewCustomers() {
    return this.accountService.userHasPermission(Permission.viewUsersPermission); //eg. viewCustomersPermission
  }

  get canViewProducts() {
    return this.accountService.userHasPermission(Permission.viewUsersPermission); //eg. viewProductsPermission
  }

  get canViewOrders() {
    return true; //eg. viewOrdersPermission
  }

  openAccountSettingsModal() {
    this.bsModalRef = this.modalService.show(AccountSettingsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  openAboutHelpModal() {
    this.bsModalRef = this.modalService.show(AboutHelpComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  private scrollToTop() {
    //alert(this.document.documentElement.scrollTop);
    //this.document.body.scrollTop = this.document.documentElement.scrollTop = 0;
    jQuery('html, body').animate({ scrollTop: 0 }, 500);
  }
  openMyImages() {
    this.bsModalRef = this.modalService.show(MyImagesComponent, {
      class: 'modal-primary modal-lg',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }
  gotoRulesetViewForCharacter() {

    let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

    if (this.router.url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1) {
      this.router.navigate(['/character/ruleset/items', rid]);
    }
    else if (this.router.url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1) {
      this.router.navigate(['/character/ruleset/spells', rid]);
    }
    else if (this.router.url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1) {
      this.router.navigate(['/character/ruleset/abilities', rid]);
    }

    else if (
      (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS + '/') > -1)

    ) {
      //this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/search/basic/' + SearchType.CHARACTERRULESETITEMS + '/', this.searchCharRule])
      //);

    }
    else if (
      (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS + '/') > -1)
    ) {
      //this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/search/basic/' + SearchType.CHARACTERRULESETSPELLS + '/', this.searchCharRule])
      //);

    }
    else if (
      (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES + '/') > -1)
    ) {
      //this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/search/basic/' + SearchType.CHARACTERRULESETABILITIES + '/', this.searchCharRule])
      //);

    }
    else if (
      (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERBUFFANDEFFECT + '/') > -1)
    ) {
      //this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/search/basic/' + SearchType.CHARACTERRULESETBUFFEFFECT + '/', this.searchCharRule])
      //);

    }
  }
  gotoRulesetView() {

    let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEMS/') > -1) {
      this.router.navigate(['/ruleset/item-master', rid]);
    }
    else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/SPELLS/') > -1) {
      this.router.navigate(['/ruleset/spell', rid]);
    }
    else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ABILITIES/') > -1) {
      this.router.navigate(['/ruleset/ability', rid]);
    }
  }

  redirectHome() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm && this.headers && this.headers.headerLink == 'ruleset') {
        if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)) {
          this.localStorage.localStorageSetItem(DBkeys.IsBackButton, "false");
          this.router.navigate(['/ruleset/campaign-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)]);
        }
      } else {
        if (user.isGm) {
          if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)) {
            this.localStorage.localStorageSetItem(DBkeys.IsBackButton, "false");
            this.router.navigate(['/ruleset/campaign-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)]);
          }
        } else {
          if (this.headers && this.headers.headerLink == 'character') {
            this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");
            this.router.navigate(['/character/dashboard/' + this.headers.headerId]);
          } else {
            if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)) {
              this.localStorage.localStorageSetItem(DBkeys.IsBackButton, "false");
              this.router.navigate(['/ruleset/ruleset-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)]);
            }
          }
        }
      }
    }
  }

  logoNavigation(url) {
    this.logoPath = '/characters';
    //if (this.headers) {
    //  if (this.headers.headerLink == 'character') {
    //    this.logoPath = '/character/dashboard/' + this.headers.headerId;
    //  }
    //}
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user) {
      if (user.isGm) {

        if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)) {
          this.logoPath = '/ruleset/campaign-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
          this.showOpen_ExitChatBtn = true;
        }
        else {
          this.logoPath = '/rulesets/campaigns';
          this.showOpen_ExitChatBtn = false;
        }
        if (url.toUpperCase().indexOf('/RULESETS/CAMPAIGNS') > -1) {
          this.logoPath = '/rulesets/campaigns';
          this.showOpen_ExitChatBtn = false;
        } else if (url.toUpperCase().indexOf('/CHARACTERS') > -1) {
          this.logoPath = '/rulesets/campaigns';
          this.showOpen_ExitChatBtn = false;
        }

        if (this.isPlayerCharacter) {
          if (this.isPlayerLinkedToCurrentCampaign) {
            this.logoPath = '/ruleset/campaign-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
            this.showOpen_ExitChatBtn = true;
          }
          else {
            if (this.headers) {
              if (this.headers.headerLink == 'character') {
                //this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");
                this.logoPath = '/character/dashboard/' + this.headers.headerId;
              }
            }
            //this.logoPath = '/rulesets/campaigns';
          }
        }
        //if (url.toUpperCase().indexOf('/CHARACTER/') > -1) {
        //  if (this.headers) {
        //    if (this.headers.headerLink == 'character') {
        //      this.logoPath = '/character/dashboard/' + this.headers.headerId;
        //    }
        //  }
        //}
        //if (this.headers) {
        //  if (this.headers.headerLink == 'ruleset') {
        //    this.logoPath = '/ruleset/campaign-details/' + this.headers.headerId;
        //  }
        //}
      } else {
        if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)) {
          this.logoPath = '/ruleset/ruleset-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
        }
      }
    }
    if (this.headers) {
      if (user && user.isGm) {
        if (this.localStorage.getDataObject<User>(DBkeys.RULESET_ID)) {
          this.logoPath = '/ruleset/campaign-details/' + this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
        }
      } else {
        if (this.headers.headerLink == 'character') {
          this.logoPath = '/character/dashboard/' + this.headers.headerId;
        }
      }
    }


  }

  setCharacterRedirection(url) {
    if (this.headers) {
      if (this.headers.headerId) {
        let cid = 0;
        if (this.headers.headerLink == 'character') {
          cid = this.headers.headerId;
        }

        let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

        let storageNavigation = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
        if (storageNavigation) {
          this.characterNavigation = storageNavigation;
        }

        if (typeof (cid) != 'undefined') {
          this.characterNavigation = Utilities.setCharacterRedirection(url,
            cid,
            rid,
            this.characterNavigation
          );

          if (cid > 0) {
            this.localStorage.localStorageSetItem(DBkeys.CHARACTER_NAVIGATION, this.characterNavigation);
          }

        }
      }
    }
  }

  //RedirecttoUrl() {
  //  Utilities.Kickstarterlink();
  //}
  gotoUrl() {
    this.redirectUrl = Utilities.getHelpLinkUrl(this.router.url);
  }
  checkInvites() {
    this.bsModalRef = this.modalService.show(CampaignInviteComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.invitationList = this.invitationList;

  }

  playerLoot() {
    this.router.navigate(['/character/loot/', this.characterId]);
    //this.bsModalRef = this.modalService.show(PlayerLootComponent, {
    //  class: 'modal-primary modal-md',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
    //this.bsModalRef.content.headers = this.headers;
  }
  handOuts() {

    this.bsModalRef = this.modalService.show(HandoutViewComponent, {
      class: 'modal-primary modal-lg',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.rulesetId = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
    //let _rulesetId = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);

    //this.router.navigate(['/character/handouts/', _rulesetId]);
  }
  onEventTriggered(event: string): void {
    this.triggeredEvents.push(event);
  }
  initializeSignalRAdapter(user: any, http, storageManager, IsRuleset: boolean, currentUrl) {
    this.startChat = this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON ? true : false
    this.showOpen_ExitChatBtn = this.startChat;
    if (!this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus)) {
      this.localStorage.localStorageSetItem(DBkeys.ChatActiveStatus, CHATACTIVESTATUS.ON);
      this.startChat = true;
      this.showOpen_ExitChatBtn = true;
      //this.showExitChatBtn = true;
    }
    if (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON) {
      this.localStorage.localStorageSetItem(DBkeys.IsGMCampaignChat, IsRuleset);
      //this.storageManager.getDataObject<ChatConnection[]>(DBkeys.chatConnections);
      let url = currentUrl.toLowerCase();
      let isNewTab = false;
      if (url.indexOf("/combats/") > -1 || url.indexOf("/gm-playerview/") > -1) {
        isNewTab = true;
      }

      let rulesetID = this.localStorage.getDataObject<User>(DBkeys.RULESET_ID);
      if (rulesetID && !isNewTab) {
        this.rulesetService.getRulesetById<Ruleset>(+rulesetID).subscribe((data: Ruleset) => {
          this.localStorage.localStorageSetItem(DBkeys.rulesetforChat, data);
          if (!this.signalRAdapter && !this.newWindowOpend) {
            if (IsRuleset) {
              user.campaignID = rulesetID;
              user.characterID = 0;
            }
            this.signalRAdapter = new SignalRGroupAdapter(user, http, storageManager, IsRuleset);
            //this.signalRCombatAdapter = new SignalRGroupAdapter(user, http, storageManager, IsRuleset);
            this.showOpen_ExitChatBtn = true;
            this.showExitChatBtn = true;
          }
        });
      }

      //this.localStorage.localStorageSetItem(DBkeys.rulesetNameforChat, this.ruleset.ruleSetName);
      //if (ServiceUtil.IsCurrentlyRulesetOpen) {
      //  this.localStorage.localStorageSetItem(DBkeys.rulesetNameforChat, this.headers.headerName);
      //}
    }
  }
  leaveChat(isRemovingChat = false, dontAdd_CHAT_REMOVE_INTERVALS_in_LocalStore = false) {

    if (!this.signalRAdapter && this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
      let ChatWithDiceRoll = [];
      if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
        ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
      }
      let leaveChatMsgFlag = ChatWithDiceRoll.find(x => x.type == SYSTEM_GENERATED_MSG_TYPE.LEAVE_CHAT);
      if (!leaveChatMsgFlag) {
        let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.LEAVE_CHAT, obj: true }
        ChatWithDiceRoll.push(chatMsgObject);
        this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
      }

    }
    if (this.signalRAdapter) {
      this.charactersService.leaveChat(this.signalRAdapter.userId)
        .subscribe(data => {

          if (this.signalRAdapter) {
            this.signalRAdapter.LeaveChat();
          }

          this.signalRAdapter = undefined;
          if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
            if (!dontAdd_CHAT_REMOVE_INTERVALS_in_LocalStore) {
              let ChatWithDiceRoll = [];
              if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
                ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
              }
              let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_REMOVE_INTERVALS, obj: true }
              ChatWithDiceRoll.push(chatMsgObject);
              this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
            }
          } else {
            this.app1Service.updateChatRemoveIntervals(true);
          }
          if (isRemovingChat) {
            //this.localStorage.deleteData(DBkeys.ChatActiveStatus);
            this.localStorage.deleteData(DBkeys.ChatInNewTab);
            this.localStorage.deleteData(DBkeys.ChatMsgsForNewChatWindow);
          }
          if (!this.signalRAdapter) {
            this.app1Service.updateChatRemoveIntervals(true);
          }
        }, error => {
          this.signalRAdapter = undefined;
          if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
            if (!dontAdd_CHAT_REMOVE_INTERVALS_in_LocalStore) {
              let ChatWithDiceRoll = [];
              if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
                ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
              }
              let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_REMOVE_INTERVALS, obj: true }
              ChatWithDiceRoll.push(chatMsgObject);
              this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
            }
          } else {
            this.app1Service.updateChatRemoveIntervals(true);
          }
          if (isRemovingChat) {
            //this.localStorage.deleteData(DBkeys.ChatActiveStatus);
            this.localStorage.deleteData(DBkeys.ChatInNewTab);
            this.localStorage.deleteData(DBkeys.ChatMsgsForNewChatWindow);
          }
          if (!this.signalRAdapter) {
            this.app1Service.updateChatRemoveIntervals(true);
          }
        });


    }
    else {
      this.signalRAdapter = undefined;
    }

  }
  NotifyUserForPendingInvites() {

    if (this.localStorage.getData(DBkeys.NotifyForPendingInvites)) {
      if (this.localStorage.getData(DBkeys.NotifyForPendingInvites) == true) {
        this.localStorage.saveSessionData(false, DBkeys.NotifyForPendingInvites)
        this.alertService.showDialog(Utilities.notifyForPendingInvitesMessage,
          DialogType.alert, () => { });

      }
    }

  }
  GoToCombat() {

    let ruleSetId = this.localStorage.getDataObject<any>(DBkeys.RULESET_ID);
    if (ruleSetId) {
      this.router.navigate(['/ruleset/combat', ruleSetId]);
    }
  }
  GoToLoot() {
    let ruleSetId = this.localStorage.getDataObject<any>(DBkeys.RULESET_ID);
    if (ruleSetId) {
      this.router.navigate(['/ruleset/loot', ruleSetId]);
    }
  }
  GoToHandOuts() {
    let ruleSetId = this.localStorage.getDataObject<any>(DBkeys.RULESET_ID);
    let ruleset = this.ruleset ? Object.assign({}, this.ruleset) : new Ruleset();
    if (ruleSetId) {
      if (!ruleset.ruleSetId) {
        ruleset.ruleSetId = ruleSetId;
      }
      this.bsModalRef = this.modalService.show(HandoutuploadComponent, {
        class: 'modal-primary modal-lg',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'HandOuts';
      this.bsModalRef.content.ruleset = ruleset;
    }
  }
  isRulesetRoute(): boolean {
    this.headers = this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE);
    //console.log(this.headers)
    if (this.headers && this.headers.headerLink == 'ruleset') {
      return true;
    } else if (this.headers && this.headers.headerLink == 'character') {
      return false;
    }
    //if (this.isGmUser
    //  && this.router.url.toUpperCase().indexOf('/RULESET/') > -1
    //  && this.router.url.toUpperCase().indexOf('CHARACTER/RULESET/') == -1) {
    //  return true;
    //}
    //else {
    //  return false;
    //}
  }
  GoToPCCombat() {

    if (this.isPlayerCharacter) {
      if (this.isPlayerLinkedToCurrentCampaign) {
        let ruleSetId = this.localStorage.getDataObject<any>(DBkeys.RULESET_ID);
        if (ruleSetId) {
          this.haveLootItems = false;
          this.haveHandOutItems = false;
          this.showCombatBtn = false;
          this.router.navigate(['/ruleset/combat', ruleSetId]);
        }
      }
      else {
        this.router.navigate(this.combatUrl);
      }

    } else {
      let ruleSetId = this.localStorage.getDataObject<any>(DBkeys.RULESET_ID);
      if (ruleSetId) {
        this.haveLootItems = false;
        this.haveHandOutItems = false;
        this.showCombatBtn = false;
        this.router.navigate(['/ruleset/combat', ruleSetId]);
      }
    }
  }

  GoToCampaigns() {
    this.localStorage.deleteData(DBkeys.ChatActiveStatus);
    this.router.navigate(['rulesets/campaigns']);
    this.showOpen_ExitChatBtn = false;
  }

  ExitChat() {
    this.localStorage.localStorageSetItem(DBkeys.ChatActiveStatus, CHATACTIVESTATUS.OFF);
    this.showOpenChatBtn = true;
    this.showExitChatBtn = false;
    this.isOpenChatClicked = false;
    this.startChat = false;
    this.leaveChat(true);
    this.localStorage.localStorageSetItem(DBkeys.ChatInNewTab, false);
  }

  OpenChat() {
    this.app1Service.updateHavingParticipant(true);
    this.isOpenChatClicked = true;
    this.showExitChatBtn = true;
    this.showOpenChatBtn = false;
    this.localStorage.localStorageSetItem(DBkeys.ChatActiveStatus, CHATACTIVESTATUS.ON);
    this.startChat = true;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user) {
      if (user.isGm) {
        this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
      } else {
        if (this.isPlayerCharacter && this.isPlayerLinkedToCurrentCampaign) {
          this.initializeSignalRAdapter(user, this.http, this.storageManager, true, this.router.url);
        } else {
          this.initializeSignalRAdapter(user, this.http, this.storageManager, false, this.router.url);
        }
      }
    }
  }

  OpenCombatChat(user: any, http, storageManager, IsRuleset: boolean, currentUrl) {
    if (!this.signalRCombatAdapter) {
      this.signalRCombatAdapter = new SignalRCombatGroupAdapter(user, http, storageManager, IsRuleset);
    }
  }
  closeCombatChat() {
    if (this.signalRCombatAdapter) {
      this.charactersService.leaveChat(this.signalRCombatAdapter.userId)
        .subscribe(data => {
          if (this.signalRCombatAdapter) {
            this.signalRCombatAdapter.LeaveChat();
          }
          this.signalRCombatAdapter = undefined;
        }, error => {
          this.signalRCombatAdapter = undefined;
        });
    }
    else {
      this.signalRCombatAdapter = undefined;
    }
  }
}
