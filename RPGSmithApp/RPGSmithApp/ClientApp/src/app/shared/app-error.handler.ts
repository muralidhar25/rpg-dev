// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable, ErrorHandler } from "@angular/core";
import { AlertService, MessageSeverity, DialogType } from '../core/common/alert.service';
import { LocalStoreManager } from "../core/common/local-store-manager.service";
import { DBkeys } from "../core/common/db-keys";


@Injectable()
export class AppErrorHandler extends ErrorHandler {

    //private alertService: AlertService;

  constructor(private alertService: AlertService, private localStorage: LocalStoreManager,) {
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
      //this.alertService.showDialog("The chat session was closed due to inactivity, click OK to refresh the page and relaunch chat.",
      //  DialogType.confirm, () => { window.location.reload(true); }, () => { window.location.reload(true); }, "OK", "Cancel");
      if (error.error) {
        if (error.message==="Http failure response for (unknown url): 0 Unknown Error") {
          if (!this.localStorage.localStorageGetItem(DBkeys.ChatHttpFailure)) {
            this.localStorage.localStorageSetItem(DBkeys.ChatHttpFailure, true)
            this.alertService.showDialog("The chat session was closed due to inactivity, click OK to refresh the page and relaunch chat.",
              DialogType.confirm, () => { window.location.reload(true); }, () => { window.location.reload(true); }, "OK","Cancel");
          }
          else {
            //window.location.reload(true);
          }
          
          //if (confirm("The chat session was closed due to inactivity, click OK to refresh the page and relaunch chat."))
          //  window.location.reload(true);
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
