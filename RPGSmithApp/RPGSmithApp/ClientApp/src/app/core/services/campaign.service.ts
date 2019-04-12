import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { playerInviteSendModel } from '../models/campaign.model';


@Injectable()
export class CampaignService extends EndpointFactory {
  private readonly _sendInviteUrlUrl: string = '/api/campaign/SendPlayerInvite';
  //private readonly _getmarketplacelistUrl: string = '/api/marketplace/GetMarketPlaceList';

  get sendInviteUrl() { return this.configurations.baseUrl + this._sendInviteUrlUrl; }
  //get getmarketplacelistUrl() { return this.configurations.baseUrl + this._getmarketplacelistUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  sendInvite<T>(playerInviteSendModel: playerInviteSendModel): Observable<T> {
    
    let endpointUrl = this.sendInviteUrl;
   
    return this.http.post(endpointUrl, JSON.stringify(playerInviteSendModel), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.sendInvite(playerInviteSendModel));
      });
   
  }

  //getmarketplaceItems<T>(): Observable<T> {

  //  let endpointUrl = this.getmarketplacelistUrl;

  //  return this.http.get<T>(endpointUrl, this.getRequestHeaders())
  //    .catch(error => {
  //      return this.handleError(error, () => this.getmarketplaceItems());
  //    });
  //}
}
