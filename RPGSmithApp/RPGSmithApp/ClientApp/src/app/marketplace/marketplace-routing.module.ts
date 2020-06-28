import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "../core/auth/auth-guard.service";

import { MarketplacelistComponent } from "./marketplacelist/marketplacelist.component";



const routes: Routes = [
  { path: "", component: MarketplacelistComponent, data: { title: "Market Place" } }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceRoutingModule { }

