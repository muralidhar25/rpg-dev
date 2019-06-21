import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import  { SharedModule } from '../shared/shared.module';

import { ItemDetailsComponent } from './item-master/item-details/item-details.component';
import { SpellDetailsComponent  } from './spells/spell-details/spell-details.component';
import { AbilityDetailsComponent } from './abilities/ability-details/ability-details.component';
import { ItemMasterComponent } from './item-master/item-master.component';
import { AddItemMasterComponent } from './item-master/add-item/add-item.component';
import { CreateItemMsterComponent } from './item-master/create-item/create-item.component';
import { SpellsComponent } from './spells/spells.component';
import { AddSpellsComponent } from './spells/add-spells/add-spells.component';
import { AbilitiesComponent } from './abilities/abilities.component';
import { AddAbilitiesComponent } from './abilities/add-abilities/add-abilities.component';
import { CreateBundleComponent } from './item-master/create-bundle/create-bundle.component';
import { BundleDetailsComponent } from './item-master/bundle-details/bundle-details.component';
import { LootComponent } from "./loot/loot.component";
import { GiveawayComponent } from "./loot/giveaway/giveaway.component";
import { AddlootComponent } from "./loot/addloot/addloot.component";
import { CreatelootComponent } from "./loot/createloot/createloot.component";
import { LootAddContainerItemComponent } from "./loot/loot-add-container-item/loot-add-container-item.component";
import { LootAddContainerComponent } from "./loot/loot-add-container/loot-add-container.component";
import { DeleteAllLootItemsComponent } from "./loot/delete-all-loot-items/delete-all-loot-items.component";
import { BuffAndEffectComponent } from "./buff-and-effects/buff-and-effects.component";
import { BuffAndEffectDetailsComponent } from "./buff-and-effects/buff-and-effect-details/buff-and-effect-details.component";
import { MonsterTemplateComponent } from "./monster-template/monster-template.component";
import { CreateMonsterTemplateComponent } from "./monster-template/create-monster-template/create-monster-template.component";
import { AddItemMonsterComponent } from "./monster-template/Add-items-monster/add-item-monster.component";
import { DeployMonsterComponent } from "./monster-template/deploy-monster/deploy-monster.component";
import { MonsterTemplateDetailsComponent } from "./monster-template/monster-template-details/monster-template-details.component";


@NgModule({
  declarations: [
    ItemDetailsComponent,
    SpellDetailsComponent,
    AbilityDetailsComponent,
    ItemMasterComponent,
    AddItemMasterComponent,
    CreateItemMsterComponent,
    SpellsComponent,
    AddSpellsComponent,
    AbilitiesComponent,
    AddAbilitiesComponent,
    CreateBundleComponent,
    BundleDetailsComponent,
    LootComponent,
    GiveawayComponent,
    AddlootComponent,
    CreatelootComponent,
    LootAddContainerItemComponent,
    LootAddContainerComponent,
    DeleteAllLootItemsComponent,
    BuffAndEffectComponent,
    BuffAndEffectDetailsComponent,
    MonsterTemplateComponent,
    CreateMonsterTemplateComponent,
    AddItemMonsterComponent,
    DeployMonsterComponent, MonsterTemplateDetailsComponent 
  ],
  imports: [
    SharedModule
  ],
  providers: [
  ],
  exports: [
    ItemDetailsComponent,
    SpellDetailsComponent,
    AbilityDetailsComponent,
    ItemMasterComponent,
    AddItemMasterComponent,
    CreateItemMsterComponent,
    SpellsComponent,
    AddSpellsComponent,
    AbilitiesComponent,
    AddAbilitiesComponent,
    CreateBundleComponent,
    BundleDetailsComponent,
    LootComponent,
    GiveawayComponent,
    AddlootComponent,
    CreatelootComponent,
    LootAddContainerItemComponent,
    LootAddContainerComponent,
    DeleteAllLootItemsComponent,
    BuffAndEffectComponent,
    BuffAndEffectDetailsComponent,
    MonsterTemplateComponent,
    CreateMonsterTemplateComponent,
    AddItemMonsterComponent,
    DeployMonsterComponent, MonsterTemplateDetailsComponent 
  ],
  entryComponents: [
    AddItemMasterComponent,
    CreateItemMsterComponent,
    AddSpellsComponent,
    AddAbilitiesComponent,
    CreateBundleComponent,
    GiveawayComponent,
    AddlootComponent,
    CreatelootComponent,
    LootAddContainerItemComponent,
    LootAddContainerComponent,
    DeleteAllLootItemsComponent,
    CreateMonsterTemplateComponent,
    AddItemMonsterComponent,
    DeployMonsterComponent, MonsterTemplateDetailsComponent 
  ]
})
export class RecordsModule {}
