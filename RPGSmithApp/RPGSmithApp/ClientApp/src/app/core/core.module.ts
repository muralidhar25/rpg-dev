import { NgModule } from "@angular/core";

import { BackendLessProvider } from './common/backend-less';
import { AppTranslationService } from './common/app-translation.service';
import { ConfigurationService } from './common/configuration.service';
import { LocalStoreManager } from './common/local-store-manager.service';
import { EndpointFactory } from './common/endpoint-factory.service';
import { NotificationService } from './services/notification.service';
import { NotificationEndpoint } from './services/notification-endpoint.service';
import { AccountService } from './common/account.service';
import { AccountEndpoint } from './common/account-endpoint.service';
import { CommonService } from "./services/shared/common.service";

import { EqualValidator } from './directives/equal-validator.directive';
import { LastElementDirective } from './directives/last-element.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { BootstrapTabDirective } from './directives/bootstrap-tab.directive';
import { BootstrapToggleDirective } from './directives/bootstrap-toggle.directive';
import { BootstrapSelectDirective } from './directives/bootstrap-select.directive';
import { BootstrapDatepickerDirective } from './directives/bootstrap-datepicker.directive';
import { GroupByPipe } from './pipes/group-by.pipe';

import { RulesetService } from './services/ruleset.service';
import { RulesetEndpoint } from './services/ruleset-endpoint.service';
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

import { NoteTileService } from "./services/tiles/note-tile.service";
import { ImageTileService } from "./services/tiles/image-tile.service";
import { CommandTileService } from "./services/tiles/command-tile.service";
import { LinkTileService } from "./services/tiles/link-tile.service";
import { CounterTileService } from "./services/tiles/counter-tile.service";
import { CharacterStatTileService } from "./services/tiles/character-stat-tile.service";
import { ExecuteTileService } from "./services/tiles/execute-tile.service";
import { SearchService } from "./services/search.service";

import { TileService } from "./services/tile.service";
import { CharacterTileService } from "./services/character-tile.service";
import { ImageSearchService } from "./services/shared/image-search.service";
import { ColorService } from "./services/tiles/color.service";
import { RequestCache } from './services/shared/request-cache.service';
import { TextTileService } from "./services/tiles/text-tile.service";
import { MarketPlaceService } from "./services/maketplace.service";
import { CampaignService } from "./services/campaign.service";
import { LootService } from "./services/loot.service";
import { BuffAndEffectService } from "./services/buff-and-effect.service";
import { BuffAandEffectTileService } from "./services/tiles/buff-and-effect-tile.service";
import { MonsterTemplateService } from "./services/monster-template.service";
import { CombatService } from "./services/combat.service";
import { ToggleTileService } from "./services/tiles/toggle-tile.service";
import { CharacterStatClusterTileService } from "./services/tiles/character-stat-cluster-tile.service";
import { CurrencyTileService } from "./services/tiles/currency-tile.service";
import { OnlyNumberDirective } from "./directives/numbers-only.directive";
import { ExcelExportService } from "./services/excel.service";

@NgModule({
  declarations: [
    EqualValidator,
    LastElementDirective,
    AutofocusDirective,
    BootstrapTabDirective,
    BootstrapToggleDirective,
    BootstrapSelectDirective,
    BootstrapDatepickerDirective,
    OnlyNumberDirective,
    GroupByPipe,
    FilterPipe,
    FilterTilePipe,
    ContainsPipe,
    DiceGif,
  ],
  providers: [
    RequestCache,
    ConfigurationService,
    AppTranslationService,
    NotificationService,
    NotificationEndpoint,
    AccountService,
    AccountEndpoint,
    LocalStoreManager,
    EndpointFactory,
    CommonService,
    BackendLessProvider,
    RulesetService,
    RulesetEndpoint,
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
    TextTileService,
    MarketPlaceService,
    CampaignService,
    LootService, BuffAndEffectService,
    BuffAandEffectTileService,
    MonsterTemplateService,
    CombatService,
    ToggleTileService,
    CharacterStatClusterTileService,
    CurrencyTileService,
    ExcelExportService
    ],
  exports: [
    EqualValidator,
    LastElementDirective,
    AutofocusDirective,
    BootstrapTabDirective,
    BootstrapToggleDirective,
    BootstrapSelectDirective,
    BootstrapDatepickerDirective,
    OnlyNumberDirective,
    GroupByPipe,
    FilterPipe,
    FilterTilePipe,
    ContainsPipe,
    DiceGif,
  ]
})
export class CoreModule {}
