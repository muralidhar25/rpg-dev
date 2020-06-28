import { NgModule } from "@angular/core";

import  { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [

  ],
  imports: [
    /**
    TODO:
    Notes:
    1. This dependency adds about .5mb to initial rendering
    2. This component depends on a couple libraries and couple shared components.
    3. If we can isolate the libs and the shared components we can have the .5mb gain
    **/
    SharedModule
  ],
  providers: [
  ],
  exports: [

  ],
  entryComponents: []
})
export class MainModule {}
