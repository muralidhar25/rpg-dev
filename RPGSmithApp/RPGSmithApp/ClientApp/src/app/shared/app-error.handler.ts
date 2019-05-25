// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable, ErrorHandler } from "@angular/core";
import { AlertService, MessageSeverity } from '../core/common/alert.service';


@Injectable()
export class AppErrorHandler extends ErrorHandler {

    //private alertService: AlertService;

    constructor() {
        super();
    }


    handleError(error: any) {
        //if (this.alertService == null) {
        //    this.alertService = this.injector.get(AlertService);
        //}

        //this.alertService.showStickyMessage("Fatal Error!", "An unresolved error has occured. Please reload the page to correct this error", MessageSeverity.warn);
        //this.alertService.showStickyMessage("Unhandled Error", error.message || error, MessageSeverity.error, error);
      //debugger
      console.error("Fatal Error-", error);
      
      if (error.error) {
        if (error.error.message) {
          window.location.reload(true);
        }
        else {
          if (confirm("Fatal Error!\nAn unresolved error has occured. Do you want to reload the page to correct this?\n\nError: " + error.message))
            window.location.reload(true);
        }
      } else {
     
      //if (error.error.message != undefined) {
        if (confirm("Fatal Error!\nAn unresolved error has occured. Do you want to reload the page to correct this?\n\nError: " + error.message))
          window.location.reload(true);
      //}
      //else {
       // window.location.reload(true);
      //}
        
      }
        super.handleError(error);
    }
}
