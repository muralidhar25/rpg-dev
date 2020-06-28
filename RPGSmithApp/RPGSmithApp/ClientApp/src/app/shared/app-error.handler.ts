// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

import { Injectable, ErrorHandler, Injector } from "@angular/core";
import { AlertService, MessageSeverity, DialogType } from '../core/common/alert.service';
import { LocalStoreManager } from "../core/common/local-store-manager.service";
import { DBkeys } from "../core/common/db-keys";
import { User } from "../core/models/user.model";
import { ConfigurationService } from "../core/common/configuration.service";


@Injectable()
export class AppErrorHandler extends ErrorHandler {

    //private alertService: AlertService;
  commonErrorMessage: string = "<span class='custom-common-error-message'><span class='err-heading d-block text-center'><b>ERROR</b></span><br/>"+

  "<span>Whoops, that shouldn’t happen. We got an error but not to worry, a quick refresh normally takes care of the issue.</span><br/><br/>"+
  "<span>Press OK to refresh. If the problem persists, please consider opening a bug launched through the Help/About screen accessible via the stack menu on the top right.</span></span>";
  constructor(private alertService: AlertService, private localStorage: LocalStoreManager,private configurations: ConfigurationService   
    //private userService: UserService, private router: Router,
  ) {
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
        if (error.message === "Http failure response for (unknown url): 0 Unknown Error") {
          if (!this.localStorage.localStorageGetItem(DBkeys.ChatHttpFailure)) {
            this.localStorage.localStorageSetItem(DBkeys.ChatHttpFailure, true)
            this.alertService.showDialog("The chat session was closed due to inactivity, click OK to refresh the page and relaunch chat.",
              DialogType.confirm, () => { window.location.reload(true); }, () => { window.location.reload(true); }, "OK", "Cancel");
          }
          else {
            //window.location.reload(true);
          }

          //if (confirm("The chat session was closed due to inactivity, click OK to refresh the page and relaunch chat."))
          //  window.location.reload(true);
        }
        else {
          debugger
          //if (confirm("Fatal Error!\nAn unresolved error has occured. Do you want to reload the page to correct this?\n\nError: " + error.message))
           // window.location.reload(true);
          //---------------------------
          //if (!this.localStorage.localStorageGetItem(DBkeys.ErrorOccured)) {
            //this.localStorage.localStorageSetItem(DBkeys.ErrorOccured, true)
          try {
            let errModel = {
              Error: JSON.stringify(error.message),
              ErrorStack: JSON.stringify(error.stack),
              Headers: JSON.stringify(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE)),
              CurrentUser: JSON.stringify(this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER)),
              CurrentUrl: window.location.href
            }
            var http = new XMLHttpRequest();
            var url = this.configurations.baseUrl + "/api/account/saveErrorLog";
            var params = errModel;
            http.open('POST', url, true);
            //Send the proper header information along with the request
            http.setRequestHeader('Content-type', 'application/json');
            http.onreadystatechange = function () {//Call a function when the state changes.
              if (http.readyState == 4 && http.status == 200) {
                //alert(http.responseText);
              }
            }
            http.send(JSON.stringify(params));
          }
          catch (e) { }
            //if (confirm("Fatal Error!\nAn unresolved error has occured. Do you want to reload the page to correct this?\n\nError: " + error.message))
            //  window.location.reload(true);
            this.alertService.showDialog(this.commonErrorMessage,
              DialogType.confirm,
              () => {window.location.reload(true); },
              () => {  window.location.reload(true); },
              "OK", "Cancel");
          //}
        }
      } else {
     debugger
        //if (confirm("Fatal Error!\nAn unresolved error has occured. Do you want to reload the page to correct this?\n\nError: " + error.message))
          //window.location.reload(true);
          //---------------------------
       // if (!this.localStorage.localStorageGetItem(DBkeys.ErrorOccured)) {
          //this.localStorage.localStorageSetItem(DBkeys.ErrorOccured, true)
        try {
          let errModel = {
            Error: JSON.stringify(error.message),
            ErrorStack: JSON.stringify(error.stack),
            Headers: JSON.stringify(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE)),
            CurrentUser: JSON.stringify(this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER)),
            CurrentUrl: window.location.href
          }
          var http = new XMLHttpRequest();
          var url = this.configurations.baseUrl + "/api/account/saveErrorLog";
          var params = errModel;
          http.open('POST', url, true);
          //Send the proper header information along with the request
          http.setRequestHeader('Content-type', 'application/json');
          http.onreadystatechange = function () {//Call a function when the state changes.
            if (http.readyState == 4 && http.status == 200) {
              //alert(http.responseText);
            }
          }
          http.send(JSON.stringify(params));
        }
        catch (e) { }
          //if (confirm("Fatal Error!\nAn unresolved error has occured. Do you want to reload the page to correct this?\n\nError: " + error.message))
          //  window.location.reload(true);
          this.alertService.showDialog(this.commonErrorMessage,
            DialogType.confirm,
            () => { window.location.reload(true); },
            () => { window.location.reload(true); },
            "OK", "Cancel");
        //}
      
        
      }
        super.handleError(error);
    }
}
