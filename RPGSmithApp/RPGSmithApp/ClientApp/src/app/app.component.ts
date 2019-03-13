
import { Component, Inject, ViewEncapsulation, OnInit, OnDestroy, ViewChildren, AfterViewInit, QueryList, ElementRef, HostListener  } from "@angular/core";
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
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
import { UserService } from "./core/common/user.service";
import { CommonService } from "./core/services/shared/common.service";
import { ItemMasterService } from "./core/services/item-master.service";
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
import { SearchType } from "./core/models/enums";
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
  bsModalRef: BsModalRef;
  isAppLoaded: boolean;
  placeHolderText: string = 'Characters';
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

  ruleset: Ruleset = new Ruleset();
  IsCharacterRecordScreen: boolean = false;
  IsRulesetRecordScreenActive: boolean = false;
  IsCharacterRecordScreenActive: boolean = false;

  URLFlag: boolean = false;
  RefreshURLFlag: boolean = false;
  previousUrl: string = ''
  currentUrl: string = ''
  previousUrlList: string[] = []
  characterNavigation: any = {};

  @HostListener('window:scroll', ['$event'])
  scrollTOTop(event) {
    if (window.pageYOffset > 0) {
      this.showScrollButton = true;
      //console.log("scrollY " + window.scrollY);
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
    private rulesetService: RulesetService, private userService: UserService, private charactersService: CharactersService, private localStorage: LocalStoreManager,
    private app1Service: AppService1, private activatedroute: ActivatedRoute,
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

    this.app1Service.shouldUpdateAccountSetting1().subscribe((serviceData) => {      
      if (serviceData) {
        this.headers = serviceData;
      }
      else if (serviceData == -1) {
        this.headers = undefined;;
      } else {
        this.headers = this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE);
      }
      let rid = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
      if (rid) {
        //console.log("rid", rid)
        this.rulesetService.getRulesetById<any>(rid)
          .subscribe(data => {
            
            this.ruleset = data;
          
            this.logoNavigation();
            this.setCharacterRedirection(this.router.url);
           
            if (
              this.router.url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS) > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS) > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES) > -1
            ) {
              this.IsCharacterRecordScreen = this.headers.headerLink =='ruleset'?false:true;

              this.IsCharacterRecordScreenActive = true;
              this.IsRulesetRecordScreenActive = false;
              //console.log("IsCharacterRecordScreen", this.IsCharacterRecordScreen)
            }
      
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS) > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS) > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES) > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS) > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS) > -1
              ||
              this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES) > -1) {
    
              this.IsCharacterRecordScreen = this.headers.headerLink == 'ruleset' ? false : true;

              this.IsCharacterRecordScreenActive = false;
              this.IsRulesetRecordScreenActive = true;
              //console.log("IsCharacterRecordScreen", this.IsCharacterRecordScreen)
            }
            else {
              
              this.IsCharacterRecordScreen = false;

              this.IsCharacterRecordScreenActive = false;
              this.IsRulesetRecordScreenActive = false;
              //console.log("IsCharacterRecordScreen", this.IsCharacterRecordScreen)
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
              this.router.url.toUpperCase().indexOf('/RULESET/ITEM-DETAILS') > -1) && this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/') == -1) {
              this.SearchType = SearchType.RULESETITEMS;
              this.SearchTypeText = 'Items';
            }
            else if (this.router.url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1 ||
              this.router.url.toUpperCase().indexOf('/CHARACTER/SPELL-DETAILS') > -1) {
              this.SearchType = SearchType.CHARACTERSPELLS;
              this.SearchTypeText = 'Spells';
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
              this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEM-DETAILS') > -1) {
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

            else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS) > -1) {
              this.SearchType = SearchType.RULESETITEMS;
              this.SearchTypeText = 'Items';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS) > -1) {
              this.SearchType = SearchType.CHARACTERITEMS;
              this.SearchTypeText = 'Items';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS) > -1) {
              this.SearchType = SearchType.RULESETSPELLS;
              this.SearchTypeText = 'Spells';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS) > -1) {
              this.SearchType = SearchType.CHARACTERSPELLS;
              this.SearchTypeText = 'Spells';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES) > -1) {
              this.SearchType = SearchType.RULESETABILITIES;
              this.SearchTypeText = 'Abilities';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES) > -1) {
              this.SearchType = SearchType.CHARACTERABILITIES;
              this.SearchTypeText = 'Abilities';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS) > -1) {
              this.SearchType = SearchType.RULESETITEMS;
              this.SearchTypeText = 'Items';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS) > -1) {
              this.SearchType = SearchType.RULESETSPELLS;
              this.SearchTypeText = 'Spells';
            } else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES) > -1) {
              this.SearchType = SearchType.RULESETABILITIES;
              this.SearchTypeText = 'Abilities';
            }
          },
            error => {

            });
      }
    });

    this.app1Service.shouldUpdateSearchText().subscribe((serviceData) => {
      
      this.searchCharRule = serviceData;
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
      if (target.className.endsWith("is-open"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
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
    this.rulesetService.getRulesetAndCharactrCount(user.id)
      .subscribe(data => {
        let model: any = data;
        //console.log('RulesetsCount: ' + data);
        this.rulesetsCount = model.rulesetCount;
        this.charactersCount = model.characetrCount;
      },
        error => {
          this.rulesetsCount = 0;
          this.charactersCount = 0;
        });
  }

  private initialize() {

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
              this.alertService.showMessage("Auto Logout Occurred Due to Session Inactivity", "", MessageSeverity.default);
            }
            else {
              this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            }
          }
          catch (e) {
            this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          }
        }
      }, 500);
    });
    //this.router.events.pairwise().subscribe((e) => {
    //  console.log('1111', e);
    //});
    //this.router.events.bufferCount(6).subscribe((e: any[]) => {
    //  console.log('2222', e[1].urlAfterRedirects);
    //});
    //this.router.events
    //  .filter(e => e.constructor.name === 'RoutesRecognized')
    //  .pairwise()
    //  .subscribe((e: any[]) => {
    //    console.log('3333', e[0].urlAfterRedirects);
    //  });
    this.router.events.subscribe(event => {
      
      if (event instanceof NavigationEnd) {
        
       this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        
        //if (this.previousUrl == this.currentUrl) {
        // // console.log('here is tied');
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
        this.logoNavigation();
        
        let url = (<NavigationStart>event).url;
       
        this.setCharacterRedirection(url);
        

        if (!Utilities.isGoingToAppNonLoginRoutes(url)) {
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
        this.showCharacterSearch = ((url.toLowerCase() == '/characters') || (url.toLowerCase() == '/'));
        if (url !== url.toLowerCase()) {
          //console.log('AppComponentOld Redriection:', (<NavigationStart>event).url.toLowerCase());
          this.router.navigateByUrl((<NavigationStart>event).url.toLowerCase());
        }
        
        if (
          url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1
          ||
          url.toUpperCase().indexOf('/CHARACTER/SPELL/') > -1
          ||
          url.toUpperCase().indexOf('/CHARACTER/ABILITY/') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS) > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS) > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES) > -1
        ) {
          this.IsCharacterRecordScreen = this.headers.headerLink == 'ruleset' ? false : true;

          this.IsCharacterRecordScreenActive = true;
          this.IsRulesetRecordScreenActive = false;

          
          //console.log("IsCharacterRecordScreen", this.IsCharacterRecordScreen)
        }
        else if (url.toUpperCase().indexOf('/CHARACTER/RULESET') > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS) > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS) > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES) > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS) > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS) > -1
          ||
          url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES) > -1
        ) {

          this.IsCharacterRecordScreen = this.headers.headerLink == 'ruleset' ? false : true;
          this.IsCharacterRecordScreenActive = false;
          this.IsRulesetRecordScreenActive = true;

          

          //console.log("IsCharacterRecordScreen", this.IsCharacterRecordScreen)
        }
        else {
          
          this.IsCharacterRecordScreen = false;

          this.IsCharacterRecordScreenActive = false;
          this.IsRulesetRecordScreenActive = false;
          //console.log("IsCharacterRecordScreen", this.IsCharacterRecordScreen)
        }

        
        this.SearchType = 0;
        this.SearchTypeText = '';
        
        if (url.toUpperCase().indexOf('/CHARACTER/INVENTORY/') > -1 ||
          url.toUpperCase().indexOf('/CHARACTER/INVENTORY-DETAILS') > -1) {
          this.SearchType = SearchType.CHARACTERITEMS;
          this.SearchTypeText = 'Items';
        }
        else if ((url.toUpperCase().indexOf('/RULESET/ITEM-MASTER/') > -1 ||
          url.toUpperCase().indexOf('/RULESET/ITEM-DETAILS') > -1)
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

        else if (url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEMS/') > -1 ||
          this.router.url.toUpperCase().indexOf('/CHARACTER/RULESET/ITEM-DETAILS') > -1) {
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

        else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETITEMS) > -1) {
          this.SearchType = SearchType.RULESETITEMS;
          this.SearchTypeText = 'Items';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS) > -1) {
          this.SearchType = SearchType.CHARACTERITEMS;
          this.SearchTypeText = 'Items';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS) > -1) {
          this.SearchType = SearchType.RULESETSPELLS;
          this.SearchTypeText = 'Spells';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS) > -1) {
          this.SearchType = SearchType.CHARACTERSPELLS;
          this.SearchTypeText = 'Spells';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES) > -1) {
          this.SearchType = SearchType.RULESETABILITIES;
          this.SearchTypeText = 'Abilities';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES) > -1) {
          this.SearchType = SearchType.CHARACTERABILITIES;
          this.SearchTypeText = 'Abilities';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETITEMS) > -1) {
          this.SearchType = SearchType.RULESETITEMS;
          this.SearchTypeText = 'Items';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS) > -1) {
          this.SearchType = SearchType.RULESETSPELLS;
          this.SearchTypeText = 'Spells';
        } else if (url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES) > -1) {
          this.SearchType = SearchType.RULESETABILITIES;
          this.SearchTypeText = 'Abilities';
        }
      }
    });
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
    
    this.router.navigate(['/search', searchQuery]);
  }

  // navigating to search page
  navigateToSearch(searchType: number, searchTxt: string) {

    
    if (!searchTxt) {
      searchTxt = '';
    }
    this.search = searchType;
    this.router.navigate(['/search/basic/' + searchType + '/' + searchTxt]);
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
          this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
            this.router.navigate(['/search/basic/' + SearchType.CHARACTERITEMS + '/', this.searchCharRule])
          );
          
        }
        //else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS) > -1) {
        // this.router.navigate(['/character/ability', this.headers.headerId]);
        //}
        else if (
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETSPELLS) > -1)
          ||
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETSPELLS) > -1)
        ) {
          this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
            this.router.navigate(['/search/basic/' + SearchType.CHARACTERSPELLS + '/', this.searchCharRule])
          );
          
        }
        //else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS) > -1) {
        //  this.router.navigate(['/character/ability', this.headers.headerId]);
        //}
        else if (
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.RULESETABILITIES) > -1)
          ||
          (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERRULESETABILITIES) > -1)
        ) {
          this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
            this.router.navigate(['/search/basic/' + SearchType.CHARACTERABILITIES + '/', this.searchCharRule])
          );
        }
        //else if (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES) > -1) {
        //  this.router.navigate(['/character/ability', this.headers.headerId]);
        //}


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

  logout() {
    this.authService.logout();
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
      (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERITEMS) > -1)
      
    ) {
      this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/search/basic/' + SearchType.CHARACTERRULESETITEMS + '/', this.searchCharRule])
      );
      
    }
    else if (
      (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERSPELLS) > -1)
    ) {
      this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/search/basic/' + SearchType.CHARACTERRULESETSPELLS + '/', this.searchCharRule])
      );
      
    }
    else if (
      (this.router.url.toUpperCase().indexOf('/SEARCH/BASIC/' + SearchType.CHARACTERABILITIES) > -1)
    ) {
      this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/search/basic/' + SearchType.CHARACTERRULESETABILITIES + '/', this.searchCharRule])
      );
      
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

  logoNavigation() {
    this.logoPath = '/characters';
    if (this.headers) {
      if (this.headers.headerLink == 'character') {
        this.logoPath = '/character/dashboard/' + this.headers.headerId;
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
}
