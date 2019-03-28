import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CharactersComponent } from "./characters/characters.component";
import { CharacterItemDetailsComponent } from './character-records/items/item-details/item-details.component';
import { CharacterSpellDetailsComponent } from './character-records/spells/spell-details/spell-details.component';
import { CharacterAbilityDetailsComponent } from './character-records/abilities/ability-details/ability-details.component';
import { CharacterItemsComponent }  from './character-records/items/items.component';
import { CharacterSpellsComponent }  from './character-records/spells/spells.component';
import { CharacterAbilitiesComponent }  from './character-records/abilities/abilities.component';
import { CharacterCharacterStatComponent } from './character-records/character-stats/character-stat.component';
import { AbilityRulesetDetailComponent } from './character-records/abilities/ability-ruleset-detail/ability-ruleset-detail.component';
import { SpellRulesetDetailComponent } from './character-records/spells/spell-ruleset-detail/spell-ruleset-detail.component';
import { CharacterTilesComponent } from './characters/character-tiles/character-tiles.component';
import { CharacterDashboardComponent } from './character-dashboard/character-dashboard.component';
import { ItemRulesetViewListComponent } from "./character-records/items/ruleset/ruleset-view-list/ruleset-view-list.component";
import { SpellRulesetViewListComponent } from "./character-records/spells/ruleset/ruleset-view-list/ruleset-view-list.component";
import { AuthGuard } from "../core/auth/auth-guard.service";
import { AbilityRulesetViewListComponent } from "./character-records/abilities/ruleset/ruleset-view-list/ruleset-view-list.component";
import { RulesetViewItemDetailComponent } from "./character-records/items/ruleset/ruleset-view-item-detail/ruleset-view-item-detail.component";
import { RulesetViewSpellDetailComponent } from "./character-records/spells/ruleset/ruleset-view-spell-detail/ruleset-view-spell-detail.component";
import { RulesetViewAbilityDetailComponent } from "./character-records/abilities/ruleset/ruleset-view-ability-detail/ruleset-view-ability-detail.component";
import { RulesetViewBundleDetailComponent } from "./character-records/items/ruleset/ruleset-view-bundle-detail/ruleset-view-bundle-detail.component";

const routes: Routes = [
  { path: "", component: CharactersComponent , data: { title: "Home" }},
  { path: "inventory/:id", component: CharacterItemsComponent, data: { title: "Item"} },
  { path: "spell/:id", component: CharacterSpellsComponent,  data: { title: "Spells" } },
  { path: "ability/:id", component: CharacterAbilitiesComponent,  data: { title: "Abilities" } },
  { path: "character/character-stats/:id", component: CharacterCharacterStatComponent,  data: { title: "Character Stats" } },

  { path: "inventory-details/:id", component: CharacterItemDetailsComponent,  data: { title: "Item Details" } },
  { path: "spell-details/:id", component: CharacterSpellDetailsComponent,  data: { title: "Spell Details" } },
  { path: "ability-details/:id", component: CharacterAbilityDetailsComponent,  data: { title: "Ability Details" } },

  { path: "spell-detail/:id", component: SpellRulesetDetailComponent,  data: { title: "Spell Details" } },
  { path: "ability-detail/:id", component: AbilityRulesetDetailComponent,  data: { title: "Ability Details" } },

  { path: "tiles/:id", component: CharacterTilesComponent,  data: { title: "Tiles" } },
  { path: "dashboard/:id", component: CharacterDashboardComponent, data: { title: "Character Dashboard" } },
  { path: "ruleset/items/:id", component: ItemRulesetViewListComponent, canActivate: [AuthGuard], data: { title: "Items" } },
  { path: "ruleset/spells/:id", component: SpellRulesetViewListComponent, canActivate: [AuthGuard], data: { title: "Spells" } },
  { path: "ruleset/abilities/:id", component: AbilityRulesetViewListComponent, canActivate: [AuthGuard], data: { title: "Abilities" } },
  { path: "ruleset/item-details/:id", component: RulesetViewItemDetailComponent, canActivate: [AuthGuard], data: { title: "Items" } },
  { path: "ruleset/item-detail/:id", component: RulesetViewBundleDetailComponent, canActivate: [AuthGuard], data: { title: "Items" } },
  { path: "ruleset/spell-details/:id", component: RulesetViewSpellDetailComponent, canActivate: [AuthGuard], data: { title: "Spells" } },
  { path: "ruleset/ability-details/:id", component: RulesetViewAbilityDetailComponent, canActivate: [AuthGuard], data: { title: "Abilities" } },

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CharactersRoutingModule {}
