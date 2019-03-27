import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { RulesetComponent } from './ruleset/ruleset.component';
import { ItemMasterComponent } from '../records/item-master/item-master.component';
import { SpellsComponent } from '../records/spells/spells.component';
import { AbilitiesComponent } from '../records/abilities/abilities.component';
import { ItemDetailsComponent } from '../records/item-master/item-details/item-details.component';
import { SpellDetailsComponent  } from '../records/spells/spell-details/spell-details.component';
import { AbilityDetailsComponent } from '../records/abilities/ability-details/ability-details.component';
import { RulesetDashboardComponent } from './ruleset-dashboard/ruleset-dashboard/ruleset-dashboard.component';
import { CharacterStatsComponent } from "./character-stats/character-stats/character-stats.component";
import { RulesetAddInterfaceComponent } from "./ruleset-helper/ruleset-add-interface/ruleset-add-interface.component";
import { AuthGuard } from "../core/auth/auth-guard.service";
import { BundleDetailsComponent } from "../records/item-master/bundle-details/bundle-details.component";

const routes: Routes = [
  { path: "", component: RulesetComponent, data: { title: "Rulesets" } },
  { path: "item-master/:id", component: ItemMasterComponent,  data: { title: "Item Template" } },
  { path: "spell/:id", component: SpellsComponent,  data: { title: "Spells" } },
  { path: "ability/:id", component: AbilitiesComponent,  data: { title: "Abilities" } },

  { path: "item-details/:id", component: ItemDetailsComponent,  data: { title: "Item Details" } },
  { path: "item-details/:id", component: ItemDetailsComponent,  data: { title: "Item Details" } },
  { path: "bundle-details/:id", component: BundleDetailsComponent,  data: { title: "Bundle Details" } },
  { path: "spell-details/:id", component: SpellDetailsComponent,  data: { title: "Spell Details" } },
  { path: "ability-details/:id", component: AbilityDetailsComponent,  data: { title: "Ability Details" } },

  { path: "dashboard/:id", component: RulesetDashboardComponent, data: { title: "Ruleset Dashboard" } },
  { path: "character-stats/:id", component: CharacterStatsComponent, data: { title: "Character Stats" } },
  { path: "add", component: RulesetAddInterfaceComponent, canActivate: [AuthGuard], data: { title: "Add Ruleset" } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RulesetsRoutingModule {}
