import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { CombatSettings } from '../models/view-models/combatSettings.model';
import { initiative } from '../models/view-models/initiative.model';

@Injectable()
export class CombatService extends EndpointFactory {
  private readonly GetCombatDetails: string = this.configurations.baseUrl + "/api/Combat/GetCombatDetails";
  private readonly UpdateCombatSettings: string = this.configurations.baseUrl + "/api/Combat/UpdateCombatSettings";
  private readonly SaveCombatantList: string = this.configurations.baseUrl + "/api/Combat/SaveCombatantList";

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
    let updateCombatSettingsUrl = `${this.UpdateCombatSettings}`
    return this.http.post<T>(updateCombatSettingsUrl, JSON.stringify(settings), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateCombatSettings(settings));
      });
  }

  saveCombatantList<T>(combatants: any[]): Observable<T> {
    debugger;
    let saveInitiativeUrl = `${this.SaveCombatantList}`
    return this.http.post<T>(saveInitiativeUrl, JSON.stringify(combatants), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveCombatantList(combatants));
      });
  }


}
