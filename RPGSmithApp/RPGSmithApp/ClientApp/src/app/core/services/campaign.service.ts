import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { playerInviteSendModel, playerInviteListModel, playerControlModel } from '../models/campaign.model';


@Injectable()
export class CampaignService extends EndpointFactory {
  private readonly _sendInviteUrlUrl: string = '/api/campaign/SendPlayerInvite';
  private readonly _getPlayerInviteListUrl: string = '/api/campaign/getInvitedPlayers';
  private readonly _cancelInviteUrl: string = '/api/campaign/cancelInvite';
  private readonly _getCheckInvitesListUrl: string = '/api/campaign/getReceivedInvites';
  private readonly _declineInvitesListUrl: string = '/api/Campaign/DeclineInvite';
  private readonly _answerLaterInvitesListUrl: string = '/api/Campaign/AnswerLaterInvite';
  private readonly _removePlayerUrl: string = '/api/Campaign/removePlayerFromCampaign';
  private readonly _getPlayerControls: string = '/api/campaign/getPlayerControlsByCampaignId';
  private readonly _UpdatePlayerControls: string = '/api/campaign/updatePlayerControls';


  get sendInviteUrl() { return this.configurations.baseUrl + this._sendInviteUrlUrl; }
  get getPlayerInviteListUrl() { return this.configurations.baseUrl + this._getPlayerInviteListUrl; }
  get cancelInviteUrl() { return this.configurations.baseUrl + this._cancelInviteUrl; }
  get getCheckInvitesListUrl() { return this.configurations.baseUrl + this._getCheckInvitesListUrl; }
  get getDeclineInviteUrl() { return this.configurations.baseUrl + this._declineInvitesListUrl; }
  get getAnswerlaterInviteUrl() { return this.configurations.baseUrl + this._answerLaterInvitesListUrl; }
  get removePlayerUrl() { return this.configurations.baseUrl + this._removePlayerUrl; }
  get getPlayerControlUrl() { return this.configurations.baseUrl + this._getPlayerControls }
  get getUpdatePlayerControlUrl() { return this.configurations.baseUrl + this._UpdatePlayerControls }

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
    //console.log(endpointUrl);
    return this.http.post(endpointUrl, JSON.stringify({}), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.declineInvite(inviteId));
      });

  }

  answerLaterInvite<T>(inviteId: number): Observable<T> {
   
    let endpointUrl = `${this.getAnswerlaterInviteUrl}?inviteID=${inviteId}`;
    return this.http.post(endpointUrl, JSON.stringify({}), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.answerLaterInvite(inviteId));
      });

  }
  removePlayer<T>(invite: playerInviteListModel): Observable<T> {

    let endpointUrl = `${this.removePlayerUrl}`;
    return this.http.post(endpointUrl, JSON.stringify(invite), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.removePlayer(invite));
      });

  }

  getPlayersControls<T>(campaignid: string): Observable<T> {
  
    let endpointUrl = `${this.getPlayerControlUrl}?campaignID=${campaignid}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPlayersControls(campaignid));
      });
  }

  UpdatePlayerControls<T>(playerControlModel : playerControlModel): Observable<T> {

    let endpointUrl = this.getUpdatePlayerControlUrl;
   
    return this.http.post(endpointUrl, JSON.stringify(playerControlModel), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.UpdatePlayerControls(playerControlModel));
      });

  }

}
