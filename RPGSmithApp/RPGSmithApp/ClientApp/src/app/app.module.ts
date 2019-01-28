
import { NgModule, ErrorHandler } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, EmailValidator, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { TagInputModule } from 'ngx-chips';
import { RlTagInputModule } from 'angular2-tag-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { HttpClientModule } from '@angular/common/http';
import { DragulaModule } from 'ng2-dragula';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { NgGridModule } from 'angular2-grid';
//backend less 
import { BackendLessProvider } from './common/backend-less';

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastyModule } from 'ng2-toasty';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { PopoverModule } from "ngx-bootstrap/popover";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppErrorHandler } from './app-error.handler';
import { AppTitleService } from './services/app-title.service';
import { AppTranslationService, TranslateLanguageLoader } from './services/app-translation.service';
import { ConfigurationService } from './services/configuration.service';
import { AlertService } from './services/alert.service';
import { LocalStoreManager } from './services/local-store-manager.service';
import { EndpointFactory } from './services/endpoint-factory.service';
import { NotificationService } from './services/notification.service';
import { NotificationEndpoint } from './services/notification-endpoint.service';
import { AccountService } from './services/account.service';
import { AccountEndpoint } from './services/account-endpoint.service';
import { UserService } from './services/user.service';
import { CommonService } from "./services/shared/common.service";

import { JwtInterceptor } from './common/jwt-interceptor';

import { EqualValidator } from './directives/equal-validator.directive';
import { LastElementDirective } from './directives/last-element.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { BootstrapTabDirective } from './directives/bootstrap-tab.directive';
import { BootstrapToggleDirective } from './directives/bootstrap-toggle.directive';
import { BootstrapSelectDirective } from './directives/bootstrap-select.directive';
import { BootstrapDatepickerDirective } from './directives/bootstrap-datepicker.directive';
import { GroupByPipe } from './pipes/group-by.pipe';

import { AppComponent } from "./components/app.component";
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from "./components/login/login.component";
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsConditionComponent } from './components/terms-condition/terms-condition.component';

import { HomeComponent } from "./components/home/home.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { LogonWarningComponent } from './components/shared/logon-warning.component';

import { BannerDemoComponent } from "./components/controls/banner-demo.component";
import { TodoDemoComponent } from "./components/controls/todo-demo.component";
import { StatisticsDemoComponent } from "./components/controls/statistics-demo.component";
import { NotificationsViewerComponent } from "./components/controls/notifications-viewer.component";
import { SearchBoxComponent } from "./components/controls/search-box.component";
import { UserInfoComponent } from "./components/controls/user-info.component";
import { UserPreferencesComponent } from "./components/controls/user-preferences.component";
import { UsersManagementComponent } from "./components/controls/users-management.component";
import { RolesManagementComponent } from "./components/controls/roles-management.component";
import { RoleEditorComponent } from "./components/controls/role-editor.component";
import { NgxSocialLoginModule } from 'ngx-social-login';
import { RulesetService } from './services/ruleset.service';
import { RulesetEndpoint } from './services/ruleset-endpoint.service';
import { FileUploadService } from './services/file-upload.service';
import { CharacterStatService } from './services/character-stat.service';
import { CharactersService } from './services/characters.service';
import { SharedService } from './services/shared.service';
import { ChoiceService } from './services/choice.service';
import { ItemMasterService } from './services/item-master.service';
import { SpellsService } from './services/spells.service';
import { AbilityService } from './services/ability.service';
import { ItemsService } from "./services/items.service";
import { CharacterAbilityService } from './services/character-abilities.service';
import { CharacterSpellService } from './services/character-spells.service';
import { PageLastViewsService } from './services/pagelast-view.service';
import { CharacterCommandService } from './services/character-command.service';
import { CharactersCharacterStatService } from './services/characters-character-stat.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CharacterDashboardLayoutService } from './services/character-dashboard-layout.service';
import { CharacterDashboardPageService } from './services/character-dashboard-page.service';
import { CharacterTileConfigService } from './services/character-tile-config.service';

import { RulesetDashboardLayoutService } from './services/ruleset-dashboard-layout.service';
import { RulesetDashboardPageService } from './services/ruleset-dashboard-page.service';
import { RulesetTileConfigService } from './services/ruleset-tile-config.service';
import { RulesetTileService } from './services/ruleset-tile.service';

//Pipes
import { FilterPipe } from "./pipes/filter.pipe";
import { FilterTilePipe } from "./pipes/filter-tile.pipe";
import { ContainsPipe } from "./pipes/contains.pipe";
import { DiceGif } from './pipes/dice-gif.pipe'

import { RegisterEmailConfirmationComponent } from './components/register/register-email-confirmation/register-email-confirmation.component';
import { EmailConfirmationComponent } from './components/register/email-confirmation/email-confirmation.component';
import { EmailConfirmationSuccessComponent } from './components/register/email-confirmation-success/email-confirmation-success.component';
import { ForgotPasswordEmailComponent } from './components/forgot-password/forgot-password-email/forgot-password-email.component';
import { ResetPasswordSuccessComponent } from './components/reset-password/reset-password-success/reset-password-success.component';
import { AccountSettingsComponent } from './components/accounts/account-settings/account-settings.component';
import { ChangePasswordComponent } from'./components/accounts/change-password/change-password.component';
import { AboutHelpComponent } from './components/accounts/about-help/about-help.component';

import { RulesetComponent } from './components/rulesets/ruleset/ruleset.component';
import { RulesetFormComponent } from './components/rulesets/ruleset-form/ruleset-form.component';
import { RulesetManageComponent } from './components/rulesets/ruleset-form/ruleset-manage.component';

import { CharactersComponent } from './components/characters/characters/characters.component';
import { CharactersFormComponent } from './components/characters/characters-form/characters-form.component';
import { CharacterDashboardComponent } from './components/character-dashboard/character-dashboard.component';

import { CharacterStatsComponent } from './components/character-stats/character-stats/character-stats.component';
import { CharacterStatsFormComponent } from './components/character-stats/character-stats-form/character-stats-form.component';

//records -> ruleset
import { ItemDetailsComponent } from './components/records/item-master/item-details/item-details.component';
import { SpellDetailsComponent  } from './components/records/spells/spell-details/spell-details.component';
import { AbilityDetailsComponent } from './components/records/abilities/ability-details/ability-details.component';
import { ItemMasterComponent } from './components/records/item-master/item-master.component';
import { AddItemMasterComponent } from './components/records/item-master/add-item/add-item.component';
import { CreateItemMsterComponent } from './components/records/item-master/create-item/create-item.component';
import { SpellsComponent } from './components/records/spells/spells.component';
import { AddSpellsComponent } from './components/records/spells/add-spells/add-spells.component';
import { CreateSpellsComponent } from './components/records/spells/create-spells/create-spells.component';
import { AbilitiesComponent } from './components/records/abilities/abilities.component';
import { AddAbilitiesComponent } from './components/records/abilities/add-abilities/add-abilities.component';
import { CreateAbilitiesComponent } from './components/records/abilities/create-abilities/create-abilities.component';
//charcter level records
import { CharacterItemsComponent } from './components/character-records/items/items.component';
import { AddItemComponent } from './components/character-records/items/add-item/add-item.component';
import { CharacterSpellsComponent } from './components/character-records/spells/spells.component';
import { AddCharacterSpellComponent } from './components/character-records/spells/add-spells/add-spells.component';
import { CharacterAbilitiesComponent } from './components/character-records/abilities/abilities.component';
import { AddCharaterAbilityComponent } from './components/character-records/abilities/add-abilities/add-abilities.component';

import { CharacterItemDetailsComponent } from './components/character-records/items/item-details/item-details.component';
import { CharacterSpellDetailsComponent } from './components/character-records/spells/spell-details/spell-details.component';
import { CharacterAbilityDetailsComponent } from './components/character-records/abilities/ability-details/ability-details.component';

import { CreateItemComponent } from './components/character-records/items/create-item/create-item.component';
import { EditItemComponent } from './components/character-records/items/edit-item/edit-item.component';
import { AddContainerComponent } from './components/character-records/items/add-container/add-container.component';
import { AddContainerItemComponent } from './components/character-records/items/add-container-item/add-container-item.component';

import { LoaderComponent } from './components/shared/loader/loader.component';
import { CastComponent } from './components/shared/cast/cast.component';
import { DiceRollComponent } from './components/dice/dice-roll/dice-roll.component';
import { DiceComponent } from './components/dice/dice/dice.component';
import { DiceSaveComponent } from './components/dice/dice-save/dice-save.component';
import { CharacterCharacterStatComponent } from './components/character-records/character-stats/character-stat.component';
import { froalaEditorComponent } from "./components/froalaEditor/froalaEditor.component";
import { NumericCharacterStatComponent } from './components/character-records/numeric-character-stats/numeric-character-stat.component';
import { LayoutFormComponent } from './components/character-dashboard/layout-form/layout-form.component';
import { PageFormComponent } from './components/character-dashboard/page-form/page-form.component';
import { CharacterTilesComponent } from './components/characters/characters/character-tiles/character-tiles.component';
import { TileComponent } from './components/tile/tile.component';
import { NoteTileComponent } from './components/tile/note/note.component';
import { CounterTileComponent } from './components/tile/counter/counter.component';
import { CharacterStatTileComponent } from './components/tile/character-stat/character-stat.component';
import { LinkTileComponent } from './components/tile/link/link.component';
import { CommandTileComponent } from './components/tile/command/command.component';
import { ImageTileComponent } from './components/tile/image/image.component';
import { ExecuteTileComponent } from './components/tile/execute/execute.component';
import { ColorsComponent } from './components/tile/colors/colors.component';
import { NoteTileService } from "./services/tiles/note-tile.service";
import { ImageTileService } from "./services/tiles/image-tile.service";
import { CommandTileService } from "./services/tiles/command-tile.service";
import { LinkTileService } from "./services/tiles/link-tile.service";
import { CounterTileService } from "./services/tiles/counter-tile.service";
import { CharacterStatTileService } from "./services/tiles/character-stat-tile.service";
import { ExecuteTileService } from "./services/tiles/execute-tile.service";
import { SearchComponent } from './components/search/search/search.component';
import { SearchService } from "./services/search.service";
import { EditNoteComponent } from './components/tile/note/edit-note/edit-note.component';
import { EditImageComponent } from './components/tile/image/edit-image/edit-image.component';
import { EditCounterComponent } from './components/tile/counter/edit-counter/edit-counter.component';
import { EditCharacterStatComponent } from './components/tile/character-stat/edit-character-stat/edit-character-stat.component';
import { TileService } from "./services/tile.service";
import { CharacterTileService } from "./services/character-tile.service";
import { ImageSearchService } from "./services/shared/image-search.service"; 

import { ShareRulesetComponent } from './components/rulesets/ruleset-helper/share-ruleset/share-ruleset.component';
import { ImportRulesetComponent } from './components/rulesets/ruleset-helper/import-ruleset/import-ruleset.component';

import { ImageInterfaceComponent } from "./components/image-interface/image-interface.component";
import { BingSearchComponent } from './components/image-interface/bing-search/bing-search.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageSelectorComponent } from './components/image-interface/image-selector/image-selector.component';
import { ColorService } from "./services/tiles/color.service";
import { UseLinkComponent } from './components/tile/link/use-link/use-link.component';
import { UseExecuteComponent } from './components/tile/execute/use-execute/use-execute.component';
import { AccountTermsComponent } from './components/accounts/account-terms/account-terms.component';
import { DeleteAccountComponent } from './components/accounts/delete-account/delete-account.component';
import { RulesetDashboardComponent } from './components/rulesets/ruleset-dashboard/ruleset-dashboard/ruleset-dashboard.component';
import { RulesetLayoutComponent } from './components/rulesets/ruleset-dashboard/ruleset-layout/ruleset-layout.component';
import { RulesetPageComponent } from './components/rulesets/ruleset-dashboard/ruleset-page/ruleset-page.component';
import { RulesetAddComponent } from './components/rulesets/ruleset-helper/ruleset-add/ruleset-add.component';
import { ImageViewerComponent } from './components/image-interface/image-viewer/image-viewer.component';

import { RulesetTileComponent } from './components/tile-ruleset/tile.component';
import { RulesetNoteTileComponent } from './components/tile-ruleset/note/note.component';
import { RulesetEditNoteComponent } from './components/tile-ruleset/note/edit-note/edit-note.component';
import { RulesetImageTileComponent } from './components/tile-ruleset/image/image.component';
import { RulesetEditImageComponent } from './components/tile-ruleset/image/edit-image/edit-image.component';
import { RulesetCounterTileComponent } from './components/tile-ruleset/counter/counter.component';
import { RulesetEditCounterComponent } from './components/tile-ruleset/counter/edit-counter/edit-counter.component';
import { RulesetCommandTileComponent } from './components/tile-ruleset/command/command.component';
import { RulesetCharacterStatTileComponent } from './components/tile-ruleset/character-stat/character-stat.component';
import { RulesetEditCharacterStatComponent } from './components/tile-ruleset/character-stat/edit-character-stat/edit-character-stat.component';


import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestCache } from './services/shared/request-cache.service';
import { CachingInterceptor } from './services/shared/caching-interceptor.service';
import { AbilityRulesetDetailComponent } from './components/character-records/abilities/ability-ruleset-detail/ability-ruleset-detail.component';
import { SpellRulesetDetailComponent } from './components/character-records/spells/spell-ruleset-detail/spell-ruleset-detail.component';
import { IncompatibleBrowserComponent } from './components/incompatible-browser/incompatible-browser.component';
import { CustomDiceComponent } from './components/shared/custom-dice/custom-dice.component';
import { DiceTrayComponent } from './components/shared/dice-tray/dice-tray.component';
import { AddCustomDiceComponent } from './components/shared/add-custom-dice/add-custom-dice.component';
import { SelectCustomDiceIconComponent } from './components/shared/select-custom-dice-icon/select-custom-dice-icon.component';
import { MyImagesComponent } from './components/shared/my-images/my-images.component';
import { TextTileComponent } from './components/tile/text/text.component';
import { EditTextComponent } from './components/tile/text/edit-text/edit-text.component';
import { RulesetTextTileComponent } from './components/tile-ruleset/text/text.component';
import { RulesetEditTextComponent } from './components/tile-ruleset/text/edit-text/edit-text.component';
import { TextTileService } from "./services/tiles/text-tile.service";
import { LinkRecordComponent } from './components/character-records/character-stats/link-record/link-record.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        TagInputModule,
        RlTagInputModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: TranslateLanguageLoader
            }
        }),
        NgxDatatableModule,
        ToastyModule.forRoot(),
        TooltipModule.forRoot(),
        PopoverModule.forRoot(),
        BsDropdownModule.forRoot(),
        CarouselModule.forRoot(),
        ModalModule.forRoot(),
        ChartsModule,
        NgxSocialLoginModule.init(
            {
                //'648640285849-3labmk96l8d4q372jc82ljrfcg73f9fs.apps.googleusercontent.com'
                google: {
                    //client_id: '138970610928-4vthtjh8uhl77kfn3rp8h2dubhkdh4je.apps.googleusercontent.com'
                    client_id: '648640285849-3labmk96l8d4q372jc82ljrfcg73f9fs.apps.googleusercontent.com'
                },
                facebook: {
                    initOptions: {
                        appId: '1000184723477923' //'1455000857892141'
                    }, loginOptions: {
                        scope: "email"
                    }
                }
            }
        ),
        DragulaModule,
        InfiniteScrollModule,
        AngularMultiSelectModule,
        FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
        ImageCropperModule,
        NgGridModule
    ],
    declarations: [
        AppComponent,
        RegisterComponent,
        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        PrivacyPolicyComponent,
        TermsConditionComponent,
        HomeComponent,
        SettingsComponent,
        UsersManagementComponent, UserInfoComponent, UserPreferencesComponent,
        RolesManagementComponent, RoleEditorComponent,
        NotFoundComponent,
        NotificationsViewerComponent,
        LogonWarningComponent,
        SearchBoxComponent,
        StatisticsDemoComponent, TodoDemoComponent, BannerDemoComponent,
        EqualValidator,
        LastElementDirective,
        AutofocusDirective,
        BootstrapTabDirective,
        BootstrapToggleDirective,
        BootstrapSelectDirective,
        BootstrapDatepickerDirective,
        GroupByPipe,
        RulesetComponent,
        RulesetFormComponent,
        RulesetManageComponent,
        RegisterEmailConfirmationComponent,
        EmailConfirmationComponent,
        EmailConfirmationSuccessComponent,
        ForgotPasswordEmailComponent,
        ResetPasswordSuccessComponent,
        AccountSettingsComponent,
        ChangePasswordComponent,
        AboutHelpComponent,
        CharacterStatsComponent,
        CharactersComponent,
        CharactersFormComponent,
        CharacterStatsFormComponent,
        CharacterDashboardComponent,
        CharacterItemDetailsComponent,
        CharacterSpellDetailsComponent,
        CharacterAbilityDetailsComponent,
        ItemDetailsComponent,
        SpellDetailsComponent,
        AbilityDetailsComponent,
        ItemMasterComponent,
        AddItemMasterComponent,
        AddContainerComponent,
        AddContainerItemComponent,
        CreateItemMsterComponent,
        SpellsComponent,
        AddSpellsComponent,
        CreateSpellsComponent,
        AbilitiesComponent,
        AddAbilitiesComponent,
        CreateAbilitiesComponent,
        CharacterItemsComponent,
        AddItemComponent,
        CreateItemComponent,
        EditItemComponent,
        CharacterSpellsComponent,
        AddCharacterSpellComponent,
        CharacterAbilitiesComponent,
        AddCharaterAbilityComponent,
        LoaderComponent,
        FilterPipe,
        FilterTilePipe,
        ContainsPipe,
        DiceGif,
        CastComponent,
        DiceRollComponent,
        DiceComponent,
        DiceSaveComponent,
        CharacterCharacterStatComponent,
        froalaEditorComponent,
        NumericCharacterStatComponent,
        LayoutFormComponent,
        PageFormComponent,
        CharacterTilesComponent,
        TileComponent,
        NoteTileComponent,
        CounterTileComponent,
        CharacterStatTileComponent,
        LinkTileComponent,
        CommandTileComponent,
        ImageTileComponent,
        ExecuteTileComponent,
        ColorsComponent,
        ImageInterfaceComponent,
        EditNoteComponent,
        EditImageComponent,
        EditCounterComponent,
        EditCharacterStatComponent,
        SearchComponent,
        BingSearchComponent,
        ImageSelectorComponent,
        UseLinkComponent,
        ShareRulesetComponent,
        ImportRulesetComponent,
        UseExecuteComponent,
        AccountTermsComponent,
        DeleteAccountComponent,
        RulesetDashboardComponent,
        RulesetLayoutComponent,
        RulesetPageComponent,
        RulesetAddComponent,
        ImageViewerComponent,      
        RulesetTileComponent,
        RulesetAddComponent,
        RulesetNoteTileComponent,
        RulesetEditNoteComponent,
        RulesetImageTileComponent,
        RulesetEditImageComponent,
        RulesetCounterTileComponent,
        RulesetEditCounterComponent,
        RulesetCommandTileComponent,
        RulesetCharacterStatTileComponent,
        RulesetEditCharacterStatComponent,
        AbilityRulesetDetailComponent,
        SpellRulesetDetailComponent,
        IncompatibleBrowserComponent,
        CustomDiceComponent,
        DiceTrayComponent,
        AddCustomDiceComponent,
        SelectCustomDiceIconComponent,
        MyImagesComponent,
        TextTileComponent,
        EditTextComponent,
        RulesetTextTileComponent,
        RulesetEditTextComponent,
        LinkRecordComponent,
    ],
    providers: [

        RequestCache,
        { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },

        { provide: 'BASE_URL', useFactory: getBaseUrl },
        { provide: ErrorHandler, useClass: AppErrorHandler },
        AlertService,
        ConfigurationService,
        AppTitleService,
        AppTranslationService,
        NotificationService,
        NotificationEndpoint,
        AccountService,
        AccountEndpoint,
        LocalStoreManager,
        EndpointFactory,
        UserService,
        CommonService,
        BackendLessProvider,
        RulesetService,
        RulesetEndpoint,
        FileUploadService,
        CharacterStatService,
        CharactersService,
        SharedService,
        ChoiceService,
        ItemMasterService,
        SpellsService,
        AbilityService,
        ItemsService,
        CharacterAbilityService,
        CharacterSpellService,
        PageLastViewsService,
        CharacterCommandService,
        CharactersCharacterStatService,
        CharacterDashboardLayoutService,
        CharacterDashboardPageService,
        CharacterTileConfigService,
        CharacterTileService,
        NoteTileService,
        ImageTileService,
        CommandTileService,
        LinkTileService,
        CounterTileService,
        CharacterStatTileService,
        ExecuteTileService,
        SearchService,
        ExecuteTileService,
        TileService,
        ImageSearchService,
        ColorService,
        RulesetDashboardLayoutService,
        RulesetDashboardPageService,
        RulesetTileConfigService,
        RulesetTileService,
        TextTileService

    ],
    entryComponents: [
        AccountSettingsComponent,
        ChangePasswordComponent,
        AboutHelpComponent,
        CharactersFormComponent,
        RulesetFormComponent,
        RulesetManageComponent,
        CharacterStatsFormComponent,
        AddItemMasterComponent,
        AddContainerComponent,
        AddContainerItemComponent,
        AddItemComponent,
        CreateItemMsterComponent,
        AddSpellsComponent,
        CreateSpellsComponent,
        AddAbilitiesComponent,
        CreateAbilitiesComponent,
        CreateItemComponent,
        EditItemComponent,
        AddCharacterSpellComponent,
        AddCharaterAbilityComponent,
        CastComponent,
        DiceRollComponent,
        DiceComponent,
        DiceSaveComponent,
        froalaEditorComponent,
        NumericCharacterStatComponent,
        LayoutFormComponent,
        PageFormComponent,
        TileComponent,
        NoteTileComponent,
        CounterTileComponent,
        CharacterStatTileComponent,
        LinkTileComponent,
        CommandTileComponent,
        ImageTileComponent,
        ColorsComponent,
        ExecuteTileComponent,
        ImageInterfaceComponent,
        EditNoteComponent,
        EditImageComponent,
        EditCounterComponent,
        EditCharacterStatComponent,
        SearchComponent,
        BingSearchComponent,
        ImageSelectorComponent,
        UseLinkComponent,
        UseExecuteComponent,
        ShareRulesetComponent,
        ImportRulesetComponent,
        AccountTermsComponent,
        DeleteAccountComponent,
        RulesetAddComponent,
        ImageViewerComponent,
        RulesetAddComponent,
        ImageViewerComponent,
        RulesetTileComponent,
        RulesetAddComponent,
        RulesetLayoutComponent,
        RulesetPageComponent,
        RulesetNoteTileComponent,
        RulesetEditNoteComponent,
        RulesetImageTileComponent,
        RulesetEditImageComponent,
        RulesetCounterTileComponent,
        RulesetEditCounterComponent,
        RulesetCommandTileComponent,
        RulesetCharacterStatTileComponent,
        RulesetEditCharacterStatComponent,
        CustomDiceComponent,
        DiceTrayComponent,
        AddCustomDiceComponent,
        SelectCustomDiceIconComponent,
        MyImagesComponent,
        TextTileComponent,
        EditTextComponent,
        RulesetTextTileComponent,
        RulesetEditTextComponent,
        LinkRecordComponent,
    ],
    exports: [
        LoaderComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}
