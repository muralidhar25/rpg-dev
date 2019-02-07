import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import  { SharedModule } from '../shared/shared.module';
import { CharactersRoutingModule } from "./characters-routing.module";
import { RecordsModule } from "../records/records.module";
import  { TileModule } from '../tile/tile.module';
import  { TileRulesetModule } from '../tile-ruleset/tile-ruleset.module';

import { CharactersComponent } from './characters/characters.component';
import { CharactersFormComponent } from './characters-form/characters-form.component';
import { CharacterTilesComponent } from './characters/character-tiles/character-tiles.component';

import { CharacterDashboardComponent } from './character-dashboard/character-dashboard.component';
import { LayoutFormComponent } from './character-dashboard/layout-form/layout-form.component';
import { PageFormComponent } from './character-dashboard/page-form/page-form.component';

import { CharacterItemsComponent } from './character-records/items/items.component';
import { AddItemComponent } from './character-records/items/add-item/add-item.component';
import { CharacterSpellsComponent } from './character-records/spells/spells.component';
import { AddCharacterSpellComponent } from './character-records/spells/add-spells/add-spells.component';
import { CreateSpellsComponent } from './character-records/spells/create-spells/create-spells.component';
import { CharacterAbilitiesComponent } from './character-records/abilities/abilities.component';
import { AddCharaterAbilityComponent } from './character-records/abilities/add-abilities/add-abilities.component';

import { CharacterItemDetailsComponent } from './character-records/items/item-details/item-details.component';
import { CharacterSpellDetailsComponent } from './character-records/spells/spell-details/spell-details.component';
import { CharacterAbilityDetailsComponent } from './character-records/abilities/ability-details/ability-details.component';
//TODO-NJ: Duplicate in records
import { CreateAbilitiesComponent } from './character-records/abilities/create-abilities/create-abilities.component';

import { CreateItemComponent } from './character-records/items/create-item/create-item.component';
import { EditItemComponent } from './character-records/items/edit-item/edit-item.component';
import { AddContainerComponent } from './character-records/items/add-container/add-container.component';
import { AddContainerItemComponent } from './character-records/items/add-container-item/add-container-item.component';

import { CharacterCharacterStatComponent } from './character-records/character-stats/character-stat.component';
import { AbilityRulesetDetailComponent } from './character-records/abilities/ability-ruleset-detail/ability-ruleset-detail.component';
import { SpellRulesetDetailComponent } from './character-records/spells/spell-ruleset-detail/spell-ruleset-detail.component';
import { LinkRecordComponent } from './character-records/character-stats/link-record/link-record.component';

import { CharacterStatsComponent } from './character-stats/character-stats/character-stats.component';
import { CharacterStatsFormComponent } from './character-stats/character-stats-form/character-stats-form.component';

@NgModule({
  declarations: [
    CharactersComponent,
    CharactersFormComponent,
    CharacterTilesComponent,

    CharacterDashboardComponent,
    LayoutFormComponent,
    PageFormComponent,

    CharacterItemsComponent,
    AddItemComponent,
    CharacterSpellsComponent,
    AddCharacterSpellComponent,
    CharacterAbilitiesComponent,
    AddCharaterAbilityComponent,
    CharacterItemDetailsComponent,
    CharacterSpellDetailsComponent,
    CharacterAbilityDetailsComponent,
    CreateItemComponent,
    EditItemComponent,
    AddContainerComponent,
    AddContainerItemComponent,
    CharacterCharacterStatComponent,
    AbilityRulesetDetailComponent,
    SpellRulesetDetailComponent,
    LinkRecordComponent,
    CreateAbilitiesComponent,
    CreateSpellsComponent,

    CharacterStatsComponent,
    CharacterStatsFormComponent
  ],
  imports: [
    SharedModule,
    CharactersRoutingModule,
    RecordsModule,
    TileModule,
    TileRulesetModule
  ],
  providers: [
  ],
  exports: [
    CharactersComponent,
    CharactersFormComponent,
    CharacterTilesComponent,

    CharacterDashboardComponent,
    LayoutFormComponent,
    PageFormComponent,

    CharacterItemsComponent,
    AddItemComponent,
    CharacterSpellsComponent,
    AddCharacterSpellComponent,
    CharacterAbilitiesComponent,
    AddCharaterAbilityComponent,
    CharacterItemDetailsComponent,
    CharacterSpellDetailsComponent,
    CharacterAbilityDetailsComponent,
    CreateItemComponent,
    EditItemComponent,
    AddContainerComponent,
    AddContainerItemComponent,
    CharacterCharacterStatComponent,
    AbilityRulesetDetailComponent,
    SpellRulesetDetailComponent,
    LinkRecordComponent,
    CreateAbilitiesComponent,
    CreateSpellsComponent,

    CharacterStatsComponent,
    CharacterStatsFormComponent
  ],
  entryComponents: [
    CharactersFormComponent,
    CharacterStatsFormComponent,
    LayoutFormComponent,
    PageFormComponent,
    AddContainerComponent,
    AddContainerItemComponent,
    AddItemComponent,
    CreateSpellsComponent,
    CreateAbilitiesComponent,
    CreateItemComponent,
    EditItemComponent,
    AddCharacterSpellComponent,
    AddCharaterAbilityComponent,
    LinkRecordComponent
  ]
})
export class CharactersModule {}
