import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { SharedModule } from '../shared/shared.module';
import { MarketplaceRoutingModule } from "./marketplace-routing.module";
import { MarketplacelistComponent } from "./marketplacelist/marketplacelist.component";


@NgModule({
  declarations: [
    MarketplacelistComponent,
    
  ],
  imports: [
    SharedModule,
    MarketplaceRoutingModule,
    FormsModule
  ],
  providers: [
  ],
  exports: [
    MarketplacelistComponent,
    
  ],
  entryComponents: [
    
  ]
})
export class MarketplaceModule {}
