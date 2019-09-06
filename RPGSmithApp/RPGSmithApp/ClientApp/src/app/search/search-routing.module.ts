import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { SearchComponent } from "./search/search.component";
import { BasicSearchComponent } from "./basic-search/basic-search.component";

const routes: Routes = [
  { path: "", component: SearchComponent, data: { title: "Search" } },
  { path: ":searchType", component: SearchComponent, data: { title: "Search" } },
  { path: ":searchType/:searchText", component: SearchComponent, data: { title: "Search" } },
  { path: "basic/:searchType", component: BasicSearchComponent, data: { title: "Basic Search" } },
  { path: "basic/:searchType/:searchText", component: BasicSearchComponent, data: { title: "Basic Search" } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule {}
