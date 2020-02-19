import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastyModule } from 'ng2-toasty';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { PopoverModule } from "ngx-bootstrap/popover";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ChartsModule } from 'ng2-charts';
import { DragulaModule } from 'ng2-dragula';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { NgGridModule } from 'angular2-grid';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TagInputModule } from 'ngx-chips';

import { CoreModule } from "../core/core.module";
import { CachingInterceptor } from '../core/services/shared/caching-interceptor.service';
import { AppErrorHandler } from './app-error.handler';
import { AppTranslationService, TranslateLanguageLoader } from '../core/common/app-translation.service';

import { NotFoundComponent } from "./not-found/not-found.component";
import { AccountSettingsComponent } from './accounts/account-settings/account-settings.component';
import { ChangePasswordComponent } from './accounts/change-password/change-password.component';
import { AboutHelpComponent } from './accounts/about-help/about-help.component';
import { DeleteAccountComponent } from './accounts/delete-account/delete-account.component';

import { ImageInterfaceComponent } from './image-interface/image-interface.component';
import { ImageViewerComponent } from './image-interface/image-viewer/image-viewer.component';
import { ImageSelectorComponent } from './image-interface/image-selector/image-selector.component';
import { BingSearchComponent } from './image-interface/bing-search/bing-search.component';

import { MyImagesComponent } from './my-images/my-images.component';
import { CastComponent } from './cast/cast.component';
import { froalaEditorComponent } from './froalaEditor/froalaEditor.component';
//import { LoaderComponent } from '../shared/loader/loader.component';

import { CustomDiceComponent } from './custom-dice/custom-dice.component';
import { DiceTrayComponent } from './dice-tray/dice-tray.component';
import { AddCustomDiceComponent } from './add-custom-dice/add-custom-dice.component';
import { SelectCustomDiceIconComponent } from './select-custom-dice-icon/select-custom-dice-icon.component';

import { DiceRollComponent } from './dice/dice-roll/dice-roll.component';
import { DiceComponent } from './dice/dice/dice.component';
import { DiceSaveComponent } from './dice/dice-save/dice-save.component';

import { NumericCharacterStatComponent } from './numeric-character-stats/numeric-character-stat.component';

import { RouterModule } from "@angular/router";
import { AuthModule } from "../core/auth/auth.module";
import { CreateAbilitiesComponent } from "./create-abilities/create-abilities.component";
import { CreateSpellsComponent } from "./create-spells/create-spells.component";
import { InviteAddCharctersFormComponent } from "./invite-add-charcters-form/invite-add-charcters-form.component";
import { PaymentComponent } from "./payment/payment.component";
import { PlayerLootComponent } from "./player-loot/player-loot.component";
import { CharactersFormComponent } from "./characters-form/characters-form.component";
import { HandoutViewComponent } from "./handouts/handout-view/handout-view.component";
import { HandoutFileViewComponent } from "./handouts/handout-file-view/handout-file-view.component";
import { HandoutuploadComponent } from "./handouts/handout-upload/handoutupload.component";
import { HandoutNewFolderComponent } from "./handouts/handout-new-folder/handout-new-folder.component";
import { ContextMenuModule } from 'ngx-contextmenu';
import { HandoutRenameComponent } from "./handouts/handout-rename/handout-rename.component";
import { CampaignInviteComponent } from "../rulesets/campaign-invite/campaign-invite.component";
import { ProgressbarModule } from "ngx-bootstrap";
import { InputSingleResultCommandComponent } from "./input-single-result-command/input-single-result-command.component";
import { CreateBuffAndEffectsComponent } from "./create-buff-and-effects/create-buff-and-effects.component";
import { AddBuffAndEffectComponent } from "./buffs-and-effects/add-buffs-and-effects/add-buffs-and-effects.component";
import { AssignBuffAndEffectComponent } from "./buffs-and-effects/assign-buffs-and-effects/assign-buffs-and-effects.component";
import { CombatBuffeffectDetailsComponent } from "../rulesets/combat/combat-buffeffects-details/combat-buffeffects-details.component";
import { CombatHealthComponent } from "../rulesets/combat/update-combat-health/update-combat-health.component";
import { UpdateMonsterHealthComponent } from "./update-monster-health/update-monster-health.component";
import { PlayerLootSecondaryComponent } from "./player-loot/player-loot-secondary/player-loot-secondary.component";
import { EditorStatComponent } from "./editor-link-button/character-stat/stat.component";
import { EditorCommandComponent } from "./editor-link-button/command/command.component";
import { EditorExecuteComponent } from "./editor-link-button/execute/execute.component";
import { EditorLinkComponent } from "./editor-link-button/link/link.component";
import { AssignToCharacterComponent } from "./assign-to-character/assign-to-character.component";
import { FullScreenChatComponent } from "./full-screen-chat/full-screen-chat.component";
import { TakeLootPileItemsComponent } from "./take-loot-pile-items/take-loot-pile-items.component";
import { LoaderModule } from "./loader.module";

@NgModule({
  declarations: [
    NotFoundComponent,
    AccountSettingsComponent,
    ChangePasswordComponent,
    AboutHelpComponent,
    DeleteAccountComponent,
    MyImagesComponent,
    ImageInterfaceComponent,
    ImageViewerComponent,
    ImageSelectorComponent,
    BingSearchComponent,
    CastComponent,
    froalaEditorComponent,
    //LoaderComponent,
    CustomDiceComponent,
    DiceTrayComponent,
    AddCustomDiceComponent,
    SelectCustomDiceIconComponent,
    DiceRollComponent,
    DiceComponent,
    DiceSaveComponent,
    NumericCharacterStatComponent,
    CreateAbilitiesComponent,
    CreateSpellsComponent,
    InviteAddCharctersFormComponent,
    PaymentComponent,
    PlayerLootComponent,
    CharactersFormComponent,
    HandoutViewComponent,
    HandoutFileViewComponent,
    HandoutuploadComponent,
    HandoutNewFolderComponent,
    HandoutRenameComponent,
    CampaignInviteComponent,
    InputSingleResultCommandComponent,
    CreateBuffAndEffectsComponent,
    AddBuffAndEffectComponent,
    AssignBuffAndEffectComponent,
    CombatBuffeffectDetailsComponent,
    CombatHealthComponent,
    UpdateMonsterHealthComponent,
    PlayerLootSecondaryComponent,
    EditorStatComponent,
    EditorCommandComponent,
    EditorExecuteComponent,
    EditorLinkComponent,
    AssignToCharacterComponent,
    FullScreenChatComponent,
    TakeLootPileItemsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgxDatatableModule,
    ToastyModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    ChartsModule,
    DragulaModule,
    InfiniteScrollModule,
    AngularMultiSelectModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    ImageCropperModule,
    NgGridModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLanguageLoader
      }
    }),
    TagInputModule,
    CoreModule,
    AuthModule,
    ContextMenuModule, ProgressbarModule.forRoot(),
    LoaderModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },

    { provide: 'BASE_URL', useFactory: getBaseUrl },
    { provide: ErrorHandler, useClass: AppErrorHandler },
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    RouterModule,
    BsDropdownModule,
    CarouselModule,
    ChartsModule,
    ImageCropperModule,
    NgxDatatableModule,
    TooltipModule,
    ModalModule,
    InfiniteScrollModule,
    PopoverModule,
    FroalaEditorModule,
    FroalaViewModule,
    AngularMultiSelectModule,
    TagInputModule,
    NgGridModule,
    ToastyModule,
    DragulaModule,
    AuthModule,
    LoaderModule,
    NotFoundComponent,
    AccountSettingsComponent,
    ChangePasswordComponent,
    AboutHelpComponent,
    DeleteAccountComponent,
    MyImagesComponent,
    ImageInterfaceComponent,
    ImageViewerComponent,
    ImageSelectorComponent,
    BingSearchComponent,
    CastComponent,
    froalaEditorComponent,
    //LoaderComponent,
    CustomDiceComponent,
    DiceTrayComponent,
    AddCustomDiceComponent,
    SelectCustomDiceIconComponent,
    DiceRollComponent,
    DiceComponent,
    DiceSaveComponent,
    NumericCharacterStatComponent,
    CreateAbilitiesComponent,
    CreateSpellsComponent,
    InviteAddCharctersFormComponent,
    PaymentComponent,
    PlayerLootComponent,
    CharactersFormComponent,
    HandoutViewComponent,
    HandoutFileViewComponent,
    HandoutuploadComponent,
    HandoutNewFolderComponent,
    HandoutRenameComponent,
    CampaignInviteComponent,
    InputSingleResultCommandComponent,
    CreateBuffAndEffectsComponent,
    AddBuffAndEffectComponent,
    AssignBuffAndEffectComponent,
    CombatBuffeffectDetailsComponent,
    CombatHealthComponent,
    UpdateMonsterHealthComponent,
    PlayerLootSecondaryComponent,
    EditorStatComponent,
    EditorCommandComponent,
    EditorExecuteComponent,
    EditorLinkComponent,
    AssignToCharacterComponent,
    FullScreenChatComponent,
    TakeLootPileItemsComponent
  ],
  entryComponents: [
    AccountSettingsComponent,
    ChangePasswordComponent,
    AboutHelpComponent,
    CastComponent,
    froalaEditorComponent,
    ImageInterfaceComponent,
    BingSearchComponent,
    ImageSelectorComponent,
    DeleteAccountComponent,
    ImageViewerComponent,
    CustomDiceComponent,
    DiceTrayComponent,
    AddCustomDiceComponent,
    SelectCustomDiceIconComponent,
    MyImagesComponent,
    DiceRollComponent,
    DiceComponent,
    DiceSaveComponent,
    NumericCharacterStatComponent,
    CreateAbilitiesComponent,
    CreateSpellsComponent,
    InviteAddCharctersFormComponent,
    PaymentComponent,
    PlayerLootComponent,
    CharactersFormComponent,
    HandoutFileViewComponent,
    HandoutuploadComponent,
    HandoutViewComponent,
    HandoutNewFolderComponent,
    HandoutRenameComponent,
    CampaignInviteComponent,
    CreateBuffAndEffectsComponent,
    AddBuffAndEffectComponent,
    AssignBuffAndEffectComponent,
    CombatBuffeffectDetailsComponent,
    CombatHealthComponent,
    UpdateMonsterHealthComponent,
    PlayerLootSecondaryComponent,
    EditorStatComponent,
    EditorCommandComponent,
    EditorExecuteComponent,
    EditorLinkComponent,
    AssignToCharacterComponent,
    TakeLootPileItemsComponent
  ]
})
export class SharedModule { }



export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}
