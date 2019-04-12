import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { SharedModule } from '../shared/shared.module';
import { MarketplaceRoutingModule } from "./marketplace-routing.module";
import { MarketplacelistComponent } from "./marketplacelist/marketplacelist.component";
import { PaymentComponent } from "./payment/payment.component";

@NgModule({
  declarations: [
    MarketplacelistComponent,
    PaymentComponent
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
    PaymentComponent
  ],
  entryComponents: [
    PaymentComponent
  ]
})
export class MarketplaceModule {}
