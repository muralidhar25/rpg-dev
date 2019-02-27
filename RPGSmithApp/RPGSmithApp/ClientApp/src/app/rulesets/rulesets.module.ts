import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import  { SharedModule } from '../shared/shared.module';
import { RulesetsRoutingModule } from "./rulesets-routing.module";
import { RecordsModule } from "../records/records.module";
import  { TileModule } from '../tile/tile.module';
import  { TileRulesetModule } from '../tile-ruleset/tile-ruleset.module';

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
    RulesetAddInterfaceComponent 
  ],
  imports: [
    SharedModule,
    RulesetsRoutingModule,
    RecordsModule,
    TileModule,
    TileRulesetModule
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
    RulesetAddInterfaceComponent 
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
  ]
})
export class RulesetsModule {}
