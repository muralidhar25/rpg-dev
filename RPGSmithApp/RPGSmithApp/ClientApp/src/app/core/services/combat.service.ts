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

  private readonly GetCombatAddMonstersList: string = this.configurations.baseUrl + "/api/Combat/GetCombat_AddMonsterList";
  private readonly AddDeployedMonstersToCombat: string = this.configurations.baseUrl + "/api/Combat/AddDeployedMonstersToCombat";
  private readonly GetCombatMonstersList: string = this.configurations.baseUrl + "/api/Combat/GetCombat_MonstersList";
  private readonly Combat_RemoveMonsters: string = this.configurations.baseUrl + "/api/Combat/RemoveMonsters";
  private readonly SaveCombatantTurn: string = this.configurations.baseUrl + "/api/Combat/SaveCombatantTurn";
  private readonly SaveVisibilityDetails: string = this.configurations.baseUrl + "api/Combat/SaveVisibilityDetails";

  private readonly Combat_Start: string = this.configurations.baseUrl + "/api/Combat/Combat_Start";
  
  
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

  saveCombatantList<T>(combatants: any[], CampaignID:number): Observable<T> {
    let saveInitiativeUrl = `${this.SaveCombatantList}?CampaignID=${CampaignID}`
    return this.http.post<T>(saveInitiativeUrl, JSON.stringify(combatants), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveCombatantList(combatants, CampaignID));
      });
  }

  saveCombatantTurn<T>(curretnCombatant, roundCount: number): Observable<T> {
    let saveCombatantTurn = `${this.SaveCombatantTurn}?roundCount=${roundCount}`
    return this.http.post<T>(saveCombatantTurn, JSON.stringify(curretnCombatant), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveCombatantTurn(curretnCombatant, roundCount));
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
  AddMonstersOnly<T>(SelectedDeployedMonsters: any[]): Observable<T> {
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

  StartCombat<T>(CombatId: number, Start:boolean): Observable<T> {
    let url = `${this.Combat_Start}?CombatId=${CombatId}&Start=${Start}`
    return this.http.post<T>(url, JSON.stringify({}), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.StartCombat(CombatId, Start));
      });
  }

  saveVisibilityDetails<T>(currentItem): Observable<T> {
    debugger
    let saveInitiativeUrl = `${this.SaveCombatantList}`
    return this.http.post<T>(saveInitiativeUrl, JSON.stringify(currentItem),  this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveVisibilityDetails(currentItem));
      });
  }
}
