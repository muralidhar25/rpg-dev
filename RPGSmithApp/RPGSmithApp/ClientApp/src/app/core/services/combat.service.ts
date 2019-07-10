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
  private readonly GetCombatAddMonstersList: string = this.configurations.baseUrl + "/api/Combat/GetCombat_AddMonsterList";
  private readonly AddDeployedMonstersToCombat: string = this.configurations.baseUrl + "/api/Combat/AddDeployedMonstersToCombat";
  private readonly GetCombatMonstersList: string = this.configurations.baseUrl + "/api/Combat/GetCombat_MonstersList";
  private readonly Combat_RemoveMonsters: string = this.configurations.baseUrl + "/api/Combat/RemoveMonsters";
  
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
  
  getCombat_AddMonstersList<T>(CampaignID: number): Observable<T> {
    let endpointUrl = `${this.GetCombatAddMonstersList}?CampaignId=${CampaignID}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCombat_AddMonstersList(CampaignID));
      });
  }
  getCombat_MonstersList<T>(CampaignID: number): Observable<T> {
    let endpointUrl = `${this.GetCombatMonstersList}?CampaignId=${CampaignID}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCombat_MonstersList(CampaignID));
      });
  }
  AddMonstersOnly<T>(SelectedDeployedMonsters:any[]): Observable<T> {
    let url = `${this.AddDeployedMonstersToCombat}`
    return this.http.post<T>(url, JSON.stringify(SelectedDeployedMonsters), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.AddMonstersOnly(SelectedDeployedMonsters));
      });
  }
  removeMonsters<T>(monsters: any[], shouldDeleteMonsters: boolean): Observable<T> {
    let url = `${this.Combat_RemoveMonsters}?deleteMonster=${shouldDeleteMonsters}`
    return this.http.post<T>(url, JSON.stringify(monsters), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.removeMonsters(monsters, shouldDeleteMonsters));
      });
  }
}
