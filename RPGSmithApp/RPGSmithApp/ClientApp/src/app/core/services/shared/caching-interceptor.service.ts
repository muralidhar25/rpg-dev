import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpResponse, HttpInterceptor, HttpHandler } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { startWith, tap } from 'rxjs/operators';
import 'rxjs/add/observable/of';

import { RequestCache } from './request-cache.service';
import { LocalStoreManager } from '../../common/local-store-manager.service';
import { AccountService } from '../../common/account.service';
import { DBkeys } from '../../common/db-keys';
import { Router } from '@angular/router';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  tokenRefreshed: boolean = false;

  constructor(private cache: RequestCache, private localStorage: LocalStoreManager, private accountService: AccountService
  , public router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let cachedResponse = (req.method == "POST" || req.method == "DELETE" || req.method == "PUT") ? undefined : this.cache.get(req);
    //const cachedResponse = this.cache.get(req);
    
    if (req.url.toLowerCase().indexOf("api/chat/listfriends") == -1) {
      this.refreshToken();
    }    
    try {
      if (req.method == "POST" || req.method == "DELETE" || req.method == "PUT") {

        //refresh count with any post/put/delete request.
        this.cache.cache.forEach(data => {          
            this.cache.cache.delete(data.url);         
        });

        //try {
        //  this.cache.cache.forEach(data => {
        //    if (data.url.toLowerCase().indexOf("api/RuleSet/GetRuleSetAndCharacterCount".toLowerCase()) > -1)
        //      this.cache.cache.delete(data.url);
        //  });
        //} catch (err) { }


        //var nReq = 0;
        //if (req.url.endsWith('/connect/token')) {
        //  this.cache.cache.clear();
        //}
        //else if (req.method == "DELETE") {
        //  this.cache.cache.clear();
        //}
        
        //this.cache.cache.forEach(data => {
        //  nReq += 1;
        //  var size = this.cache.cache.size;
        //  var postReqApi = req.url.split("api/")[1].split("/")[0].toLowerCase();
        //  var cachedApi = data.url.split("api/")[1].split("/")[0].toLowerCase();
        //  var useCache = true;

        //  try {
        //    if (req.url === data.url && req.method != "DELETE"
        //      && req.body.toLowerCase().replace(/ /g, '') === data.body.toLowerCase().replace(/ /g, '')) {
        //      useCache = false;
        //      
        //    }
        //  } catch (err) { }
        //  if (useCache && size - nReq <= 3 && size >= nReq
        //    && (postReqApi.indexOf(cachedApi) > -1 || cachedApi.indexOf(postReqApi) > -1)) {
        //    this.cache.cache.delete(data.url);
        //  } else if (useCache && (postReqApi.indexOf(cachedApi) > -1 || cachedApi.indexOf(postReqApi) > -1)) {
        //    this.cache.cache.delete(data.url);
        //  }
        //  if (postReqApi == "tileconfig") {
        //    if (cachedApi == "charatcertile") {
        //      this.cache.cache.delete(data.url);
        //    }
        //  }
        //  else if (postReqApi == "rulesettileconfig") {
        //    if (cachedApi == "rulesettile")
        //      this.cache.cache.delete(data.url);
        //  }
        //  else if (postReqApi == "GetCharactersById") { //Character/GetCharactersById
        //    if (cachedApi == "GetCharactersById")
        //      this.cache.cache.delete(data.url);
        //  }

        //  else if (postReqApi == "characterscharacterstat") {
        //    if (cachedApi == "charatcertile") {
        //      this.cache.cache.delete(data.url);
        //    }
        //  }
        //});

      }
      else if (req.url.toLowerCase().indexOf("characterscharacterstat") > -1) { //Character/GetCharactersById
        try {

          this.cache.cache.forEach(data => {
            var cachedApi = data.url.split("api/")[1].split('?')[0].toLowerCase();
            if (cachedApi == "characterscharacterstat/getbycharacterid") {
              this.cache.cache.delete(data.url);
            }
          });
        } catch (err) { }
      }
      else if (req.url.indexOf("GetCharactersById") > -1) { //Character/GetCharactersById
        try {
          this.cache.cache.forEach(data => {
            var cachedApi = data.url.split("api/")[1].split("/")[0].toLowerCase();
            if (cachedApi == "GetCharactersById") {
              this.cache.cache.delete(data.url);
            }
          });
        } catch (err) { }
      }
      if (req.url.indexOf("getPlayerControlsByCharacterId") > -1) { 
        try {
          this.cache.cache.forEach(data => {
            var cachedApi = data.url.split("api/")[1].split("/")[0].toLowerCase();
            if (cachedApi == "getPlayerControlsByCharacterId") {
              this.cache.cache.delete(data.url);
            }
          });
        } catch (err) { }
      }
      if (req.url.indexOf("GetLootItemsForPlayers") > -1) { 
        try {
          this.cache.cache.forEach(data => {
            var cachedApi = data.url.split("api/")[1].split("/")[0].toLowerCase();
            if (cachedApi == "GetLootItemsForPlayers") {
              this.cache.cache.delete(data.url);
            }
          });
        } catch (err) { }
      }

      
    } catch (err) { }

    
    return cachedResponse ? Observable.of(cachedResponse) : this.sendRequest(req, next, this.cache);
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler,
    cache: RequestCache): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          try {
            if (
              req.url.toUpperCase().indexOf("GETLOOTITEMSFORPLAYERS") > -1
              || req.url.toUpperCase().indexOf("GETITEMMASTERLOOTS") > -1
              || req.url.toUpperCase().indexOf("ISCOMBATUPDATED") > -1
              || req.url.toUpperCase().indexOf("GETCOMBATDETAILS") > -1
            ) {

            }
            else {
              cache.put(req, event);
            }
          } catch (e) {
            cache.put(req, event);
          }
        }
      })
    );
  }

  refreshToken() {
    try {
      let expireIn = this.localStorage.localStorageGetItem(DBkeys.TOKEN_EXPIRES_IN);
      let expireTime = new Date(expireIn)
      expireTime.setMinutes(expireTime.getMinutes() - 50);
      let nowDate = new Date();

      if (nowDate >= expireTime) {

        if (!this.tokenRefreshed) {
          this.tokenRefreshed = true;
          if (this.router.url.toUpperCase().indexOf('/LOGIN') == -1) {
            this.accountService.refreshLoggedInUser()
              .subscribe(user => {
                setTimeout(() => {
                  this.tokenRefreshed = false;
                }, 10000);
              },
                error => {
                  //this.alertService.resetStickyMessage();
                  //this.alertService.showStickyMessage("Refresh failed", "An error occured whilst refreshing logged in user information from the server", MessageSeverity.error, error);
                });
          }
          
        }

      }
    }
    catch (ex) { }
  }
}

