import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { CombatSettings } from '../models/view-models/combatSettings.model';

@Injectable()
export class CombatService extends EndpointFactory {
  private readonly GetCombatDetails: string = this.configurations.baseUrl + "/api/Combat/GetCombatDetails";
  private readonly UpdateCombatSettings: string = this.configurations.baseUrl + "/api/Combat/UpdateCombatSettings";
  private readonly GetInitiativeDetails: string = this.configurations.baseUrl + "/api/Combat/GetInitiativeDetails";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  getCombatDetails<T>(CampaignID: number): Observable<T> {
    let endpointUrl = `${this.GetCombatDetails}?CampaignId=${CampaignID}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCombatDetails(CampaignID));
      });
  }

  updateCombatSettings<T>(settings: CombatSettings): Observable<T> {
    let updateUrl = `${this.UpdateCombatSettings}`
    return this.http.post<T>(updateUrl, JSON.stringify(settings), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateCombatSettings(settings));
      });
  }

  //getInitiativeDetails<T>(CampaignID: number): Observable<T> {
  //  debugger;
  //  let endpointUrl = `${this.GetInitiativeDetails}?CampaignId=${CampaignID}`;

  //  return this.http.get<T>(endpointUrl, this.getRequestHeaders())
  //    .catch(error => {
  //      return this.handleError(error, () => this.getInitiativeDetails(CampaignID));
  //    });
  //}


}
