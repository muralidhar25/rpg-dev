import { NgModule } from "@angular/core";

import { SharedModule } from '../shared/shared.module';
import { RulesetsRoutingModule } from "./rulesets-routing.module";
import { RecordsModule } from "../records/records.module";
import { TileModule } from '../tile/tile.module';
import { TileRulesetModule } from '../tile-ruleset/tile-ruleset.module';

import { RulesetComponent } from './ruleset/ruleset.component';
import { RulesetFormComponent } from './ruleset-form/ruleset-form.component';
import { RulesetManageComponent } from './ruleset-form/ruleset-manage.component';
import { ShareRulesetComponent } from './ruleset-helper/share-ruleset/share-ruleset.component';
import { ImportRulesetComponent } from './ruleset-helper/import-ruleset/import-ruleset.component';
import { RulesetDashboardComponent } from './ruleset-dashboard/ruleset-dashboard/ruleset-dashboard.component';
import { RulesetLayoutComponent } from './ruleset-dashboard/ruleset-layout/ruleset-layout.component';
import { RulesetPageComponent } from './ruleset-dashboard/ruleset-page/ruleset-page.component';
import { RulesetAddComponent } from './ruleset-helper/ruleset-add/ruleset-add.component';
import { CharacterStatsFormComponent } from "./character-stats/character-stats-form/character-stats-form.component";
import { CharacterStatsComponent } from "./character-stats/character-stats/character-stats.component";
import { RulesetAddInterfaceComponent } from "./ruleset-helper/ruleset-add-interface/ruleset-add-interface.component";
import { CampaignsComponent } from "./campaigns/campaigns.component";
import { CampaignDetailsComponent } from "./campaign-details/campaign-details.component";
import { PlayerControlsComponent } from "./player-controls/player-controls.component";
import { InvitePlayerComponent } from './invite-player/invite-player.component';
import { RulesetDetailsComponent } from "./ruleset-details/ruleset-details.component";
import { CampaignDashboardComponent } from "./campaign-dashboard/campaign-dashboard.component";
import { CombatComponent } from "./combat/combat.component";
import { AddCombatMonsterComponent } from "./combat/add-combat-monster/add-monster-combat.component";
import { CombatVisibilityComponent } from "./combat/change-combat-visiblity/change-combat-visiblity.component";
import { AddRemoveBuffEffectsComponent } from "./combat/combat-buffeffects-addremove/combat-buffeffects-addremove.component";
import { CombatInitiativeComponent } from "./combat/combat-initiative/combat-initiative.component";

import { DropItemsCombatMonsterComponent } from "./combat/drop-monstercombat-items/drop-items-monstercombat.component";
import { RemoveCombatMonsterComponent } from "./combat/remove-combat-monster/remove-monster-combat.component";
import { SaveCombatMonsterComponent } from "./combat/save-combat-monster/save-combat-monster.component";
//import { CombatHealthComponent } from "./combat/update-combat-health/update-combat-health.component";
import { AccordionModule, ProgressbarModule } from "ngx-bootstrap";
import { NgCircleProgressModule } from "ng-circle-progress";
import { ContextMenuModule } from "ngx-contextmenu";
import { CombatGMPlayerViewComponent } from "./combat/gm-playerview/gm-playerview.component";
import { CharactersModule } from "../characters/characters.module";
import { CampaignUploadComponent } from "./campaign-upload/campaign-upload.component";

//import { CampaignInviteComponent } from './campaign-invite/campaign-invite.component';

@NgModule({
    declarations: [
        RulesetComponent,
        RulesetFormComponent,
        RulesetManageComponent,
        ShareRulesetComponent,
        ImportRulesetComponent,
        RulesetDashboardComponent,
        RulesetLayoutComponent,
        RulesetPageComponent,
        RulesetAddComponent,
        CharacterStatsComponent,
        CharacterStatsFormComponent,
        RulesetAddInterfaceComponent,
        CampaignsComponent,
        CampaignDetailsComponent,
        PlayerControlsComponent,
        InvitePlayerComponent,
        RulesetDetailsComponent,
        CampaignDashboardComponent,
        CombatComponent,
        AddCombatMonsterComponent,
        CombatVisibilityComponent,
        AddRemoveBuffEffectsComponent,
        CombatInitiativeComponent,
        DropItemsCombatMonsterComponent,
        RemoveCombatMonsterComponent,
        SaveCombatMonsterComponent,
        CombatGMPlayerViewComponent,
        CampaignUploadComponent

        //CampaignInviteComponent
    ],
    imports: [
        SharedModule,
        RulesetsRoutingModule,
        RecordsModule,
        TileModule,
        TileRulesetModule,
        AccordionModule,
        NgCircleProgressModule,
        ContextMenuModule,
      CharactersModule,
      ProgressbarModule.forRoot()
    ],
    providers: [
    ],
    exports: [
        RulesetComponent,
        RulesetFormComponent,
        RulesetManageComponent,
        ShareRulesetComponent,
        ImportRulesetComponent,
        RulesetDashboardComponent,
        RulesetLayoutComponent,
        RulesetPageComponent,
        RulesetAddComponent,
        CharacterStatsComponent,
        CharacterStatsFormComponent,
        RulesetAddInterfaceComponent,
        CampaignsComponent,
        CampaignDetailsComponent,
        PlayerControlsComponent,
        InvitePlayerComponent,
        RulesetDetailsComponent,
        CampaignDashboardComponent,
        CombatComponent,
        AddCombatMonsterComponent,
        CombatVisibilityComponent,
        AddRemoveBuffEffectsComponent,
        CombatInitiativeComponent,
        DropItemsCombatMonsterComponent,
        RemoveCombatMonsterComponent,
        SaveCombatMonsterComponent,
        CombatGMPlayerViewComponent,
        CampaignUploadComponent
        //CampaignInviteComponent
    ],
    entryComponents: [
        RulesetFormComponent,
        RulesetManageComponent,
        ShareRulesetComponent,
        ImportRulesetComponent,
        RulesetAddComponent,
        CharacterStatsFormComponent,
        RulesetLayoutComponent,
        RulesetPageComponent,
        PlayerControlsComponent,
        InvitePlayerComponent,
        CombatInitiativeComponent,
        AddCombatMonsterComponent,
        RemoveCombatMonsterComponent,
        SaveCombatMonsterComponent,
        DropItemsCombatMonsterComponent,
        CombatVisibilityComponent,
        AddRemoveBuffEffectsComponent,
        CampaignUploadComponent
        //CampaignInviteComponent
    ]
})
export class RulesetsModule { }
