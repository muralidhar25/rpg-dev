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
  private readonly _getPlayerInviteListUrl: string = '/api/campaign/getInvitedPlayers';
  private readonly _cancelInviteUrl: string = '/api/campaign/cancelInvite';
  private readonly _getCheckInvitesListUrl: string = '/api/campaign/getReceivedInvites';
  private readonly _declineInvitesListUrl: string = '/api/Campaign/DeclineInvite';
  private readonly _answerLaterInvitesListUrl: string = '/api/Campaign/AnswerLaterInvite';


  get sendInviteUrl() { return this.configurations.baseUrl + this._sendInviteUrlUrl; }
  get getPlayerInviteListUrl() { return this.configurations.baseUrl + this._getPlayerInviteListUrl; }
  get cancelInviteUrl() { return this.configurations.baseUrl + this._cancelInviteUrl; }
  get getCheckInvitesListUrl() { return this.configurations.baseUrl + this._getCheckInvitesListUrl; }
  get getDeclineInviteUrl() { return this.configurations.baseUrl + this._declineInvitesListUrl; }
  get getAnswerlaterInviteUrl() { return this.configurations.baseUrl + this._answerLaterInvitesListUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  sendInvite<T>(playerInviteSendModel: playerInviteSendModel): Observable<T> {
    
    let endpointUrl = this.sendInviteUrl;
   
    return this.http.post(endpointUrl, JSON.stringify(playerInviteSendModel), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.sendInvite(playerInviteSendModel));
      });
   
  }

  getPlayerInviteList<T>(rulesetId:number): Observable<T> {

    let endpointUrl = `${this.getPlayerInviteListUrl}?rulesetId=${rulesetId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPlayerInviteList(rulesetId));
      });
  }
  CheckInvites<T>(userId: string): Observable<T> {

    let endpointUrl = `${this.getCheckInvitesListUrl}?userid=${userId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.CheckInvites(userId));
      });
  }
  cancelInvite<T>(inviteId: number): Observable<T> {

    let endpointUrl = `${this.cancelInviteUrl}?inviteID=${inviteId}`;

    return this.http.post(endpointUrl, JSON.stringify({}), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.cancelInvite(inviteId));
      });

  }

  declineInvite<T>(inviteId: number): Observable<T> {

    let endpointUrl = `${this.getDeclineInviteUrl}?inviteID=${inviteId}`;
    console.log(endpointUrl);
    return this.http.post(endpointUrl, JSON.stringify({}), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.declineInvite(inviteId));
      });

  }

  answerLaterInvite<T>(inviteId: number): Observable<T> {
   
    let endpointUrl = `${this.getAnswerlaterInviteUrl}?inviteID=${inviteId}`;
    console.log(endpointUrl);
    return this.http.post(endpointUrl, JSON.stringify({}), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.answerLaterInvite(inviteId));
      });

  }

}
