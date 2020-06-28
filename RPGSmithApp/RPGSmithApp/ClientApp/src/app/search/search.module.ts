import { NgModule, ErrorHandler } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import  { SharedModule } from '../shared/shared.module';
import { SearchRoutingModule } from "./search-routing.module";

import { SearchComponent } from "./search/search.component";
import { BasicSearchComponent } from "./basic-search/basic-search.component";
import { RecordsModule } from "../records/records.module";
import { CharactersModule } from "../characters/characters.module";

@NgModule({
  declarations: [
    SearchComponent,
    BasicSearchComponent
  ],
  imports: [
    SharedModule,
    SearchRoutingModule,
    RecordsModule,
    CharactersModule
  ],
  providers: [
  ],
  exports: [
    SearchComponent,
    BasicSearchComponent
  ],
  entryComponents: [
    SearchComponent,
  ]
})
export class SearchModule {}
