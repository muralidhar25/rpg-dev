import { NgModule } from "@angular/core";
import { LoaderComponent } from "./loader/loader.component";
import { CommonModule } from "@angular/common";
import { LoaderWithTipComponent } from "./loader-with-tip/loader-with-tip.component";
@NgModule({
  declarations: [
    LoaderComponent,
    LoaderWithTipComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
  ],
  exports: [
    LoaderComponent,
    LoaderWithTipComponent
  ],
  entryComponents: [
  ]
})
export class LoaderModule { }
