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
import { CampaignsComponent } from "./campaigns/campaigns.component";
import { CampaignDetailsComponent } from './campaign-details/campaign-details.component';
import { LootComponent } from "../records/loot/loot.component";
import { RulesetDetailsComponent } from "./ruleset-details/ruleset-details.component";
import { CampaignDashboardComponent } from "./campaign-dashboard/campaign-dashboard.component";
import { BuffAndEffectDetailsComponent } from "../records/buff-and-effects/buff-and-effect-details/buff-and-effect-details.component";
import { BuffAndEffectComponent } from "../records/buff-and-effects/buff-and-effects.component";
import { MonsterTemplateComponent } from "../records/monster-template/monster-template.component";
import { MonsterTemplateDetailsComponent } from "../records/monster-template/monster-template-details/monster-template-details.component";
import { MonsterComponent } from "../records/monster/monster.component";
import { MonsterDetailsComponent } from "../records/monster/monster-details/monster-details.component";
import { MonsterBundleDetailsComponent } from "../records/monster-template/monster-bundle-details/monster-bundle-details.component";
import { LootDetailsComponent } from "../records/loot/loot-details/loot-details.component";
import { MonsterItemDetailsComponent } from "../records/monster/monster-item-details/monster-item-details.component";
import { CombatComponent } from "./combat/combat.component";
import { LootPileTemplateDetailsComponent } from "../records/loot-pile-template/loot-pile-template-details/loot-pile-template-details.component";
import { LootPileTemplateComponent } from "../records/loot-pile-template/loot-pile-template.component";
import { LootPileDetailsComponent } from "../records/loot-pile/loot-pile-details/loot-pile-details.component";
import { CombatGMPlayerViewComponent } from "./combat/gm-playerview/gm-playerview.component";


const routes: Routes = [
  { path: "", component: RulesetComponent, data: { title: "Rulesets" } },
  { path: "item-master/:id", component: ItemMasterComponent, data: { title: "Item Template" } },
  { path: "item-masters/:id", component: ItemMasterComponent, data: { title: "Item Template" } },
  { path: "spell/:id", component: SpellsComponent, data: { title: "Spells" } },
  { path: "spells/:id", component: SpellsComponent, data: { title: "Spells" } },
  { path: "ability/:id", component: AbilitiesComponent, data: { title: "Abilities" } },
  { path: "abilitys/:id", component: AbilitiesComponent, data: { title: "Abilities" } },
  { path: "buff-effect/:id", component: BuffAndEffectComponent, data: { title: "Buffs & Effects" } },
  { path: "monster-template/:id", component: MonsterTemplateComponent, data: { title: "Monster Templates" } },
  { path: "monster/:id", component: MonsterComponent, data: { title: "Monsters" } },

  { path: "item-details/:id", component: ItemDetailsComponent, data: { title: "Item Details" } },
  { path: "bundle-details/:id", component: BundleDetailsComponent, data: { title: "Bundle Details" } },
  { path: "spell-details/:id", component: SpellDetailsComponent, data: { title: "Spell Details" } },
  { path: "ability-details/:id", component: AbilityDetailsComponent, data: { title: "Ability Details" } },
  { path: "buff-effect-details/:id", component: BuffAndEffectDetailsComponent, data: { title: "Buffs & Effects Details" } },
  { path: "monster-template-details/:id", component: MonsterTemplateDetailsComponent, data: { title: "Monster Template Details" } },
  { path: "monster-bundle-details/:id", component: MonsterBundleDetailsComponent, data: { title: "Monster Bundle Details" } },
  { path: "loot-details/:id", component: LootDetailsComponent, data: { title: "Loot Details" } },
  { path: "monster-item-details/:id", component: MonsterItemDetailsComponent, data: { title: "Monster Item Details" } },
  { path: "loot-pile-template-details/:id", component: LootPileTemplateDetailsComponent, data: { title: "Random Loot Details" } },
  { path: "loot-pile-details/:id", component: LootPileDetailsComponent, data: { title: "Loot Pile Details" } },
  
  ///ruleset/monster-details
  { path: "monster-details/:id", component: MonsterDetailsComponent, data: { title: "Monster Details" } },
  { path: "dashboard/:id", component: RulesetDashboardComponent, data: { title: "Ruleset Dashboard" } },
  { path: "dashboards/:id", component: RulesetDashboardComponent, data: { title: "Ruleset Dashboard" } },
  { path: "character-stats/:id", component: CharacterStatsComponent, data: { title: "Character Stats" } },
  { path: "character-statss/:id", component: CharacterStatsComponent, data: { title: "Character Stats" } },
  { path: "add", component: RulesetAddInterfaceComponent, canActivate: [AuthGuard], data: { title: "Add Ruleset" } },
  { path: "campaigns", component: CampaignsComponent, data: { title: "Campaigns" } },
  { path: "campaign-details/:id", component: CampaignDetailsComponent, data: { title: "CampaignDetails" } },
  { path: "campaign-dashboard/:id", component: CampaignDashboardComponent, data: { title: "Campaign Dashboard" } },
  { path: "ruleset-details/:id", component: RulesetDetailsComponent , data: { title: "RulesetDetails" } },
  { path: "loot/:id", component: LootComponent, data: { title: "Loot" } },
  { path: "combat/:id", component: CombatComponent, data: { title: "combat" } },
  { path: "combats/:id", component: CombatComponent, data: { title: "combat" } },
  { path: "gm-playerview/:id", component: CombatGMPlayerViewComponent, data: { title: "combat" } },
  { path: "loot-pile-template/:id", component: LootPileTemplateComponent, data: { title: "Loot Pile" } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RulesetsRoutingModule {}
