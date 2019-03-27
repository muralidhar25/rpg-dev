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
    BundleDetailsComponent
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
    BundleDetailsComponent
  ],
  entryComponents: [
    AddItemMasterComponent,
    CreateItemMsterComponent,
    AddSpellsComponent,
    AddAbilitiesComponent,
    CreateBundleComponent
  ]
})
export class RecordsModule {}
