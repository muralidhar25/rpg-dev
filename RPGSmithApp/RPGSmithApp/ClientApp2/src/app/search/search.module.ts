import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import  { SharedModule } from '../shared/shared.module';
import { SearchRoutingModule } from "./search-routing.module";

import { SearchComponent } from "./search/search.component";

@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    SharedModule,
    SearchRoutingModule
  ],
  providers: [
  ],
  exports: [
    SearchComponent
  ],
  entryComponents: [
    SearchComponent,
  ]
})
export class SearchModule {}
