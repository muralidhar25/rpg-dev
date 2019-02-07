
import { Component, Inject, ViewEncapsulation, OnInit, OnDestroy, ViewChildren, AfterViewInit, QueryList, ElementRef, HostListener  } from "@angular/core";
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
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

import { Permission } from './core/models/permission.model';
import { User } from './core/models/user.model';
import { LoginComponent } from "./public/login/login.component";
import { AccountSettingsComponent } from "./shared/accounts/account-settings/account-settings.component";
import { AboutHelpComponent } from './shared/accounts/about-help/about-help.component';
import { DBkeys } from "./core/common/db-keys";
import { HeaderValues } from "./core/models/headers.model";
import { Utilities } from "./core/common/utilities";
import { MyImagesComponent } from "./shared/my-images/my-images.component";
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

    isChrome: boolean = Utilities.IsCrome;
    isProceedWithoutChrome: boolean = false;

    rulesetsCount:number = 0;
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

        this.sharedService.shouldUpdateAccountSetting().subscribe((serviceData) => {
            if (serviceData) {
                this.headers = serviceData;
            }
            else if (serviceData == -1) {
                this.headers = undefined;;
            } else {
                this.headers = this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE);
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
                    this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                }
            }, 500);
        });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                let url = (<NavigationStart>event).url;
                this.showCharacterSearch = ((url.toLowerCase() == '/characters') || (url.toLowerCase() == '/'));
                if (url !== url.toLowerCase()) {
                    this.router.navigateByUrl((<NavigationStart>event).url.toLowerCase());
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

    gotoDashboard() {
        if (this.headers)
            if (this.headers.headerLink == 'character')
                this.router.navigate(['/character/dashboard', this.headers.headerId]);
    }

    // changing search placeholder name dynamically
    setPlaceholderText(value:any) {
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

    openAboutHelpModal(){
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
}
