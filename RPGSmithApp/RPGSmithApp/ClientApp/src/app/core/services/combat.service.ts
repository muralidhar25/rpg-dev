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
  private readonly GetCombatDetails_PcModelData: string = this.configurations.baseUrl + "/api/Combat/GetCombatDetailsForPCUpdates";
  private readonly UpdateCombatSettings: string = this.configurations.baseUrl + "/api/Combat/UpdateCombatSettings";
  private readonly SaveCombatantList: string = this.configurations.baseUrl + "/api/Combat/SaveCombatantList";

  private readonly GetCombatAddMonstersList: string = this.configurations.baseUrl + "/api/Combat/GetCombat_AddMonsterList";
  private readonly AddDeployedMonstersToCombat: string = this.configurations.baseUrl + "/api/Combat/AddDeployedMonstersToCombat";
  private readonly GetCombatMonstersList: string = this.configurations.baseUrl + "/api/Combat/GetCombat_MonstersList";
  private readonly Combat_RemoveMonsters: string = this.configurations.baseUrl + "/api/Combat/RemoveMonsters";
  private readonly SaveCombatantTurn: string = this.configurations.baseUrl + "/api/Combat/SaveCombatantTurn";
  private readonly SaveVisibilityDetails: string = this.configurations.baseUrl + "/api/Combat/SaveVisibilityDetails";
  private readonly SaveMonsterHealth: string = this.configurations.baseUrl + "/api/Combat/SaveMonsterHealth";
  private readonly SaveCharacterHealthUrl: string = this.configurations.baseUrl + "/api/Combat/SaveCharacterHealth";
  private readonly SP_GetMonsterAssociateBEs: string = this.configurations.baseUrl + "/api/Combat/SP_GetMonsterAssociateBEs";
  private readonly SaveTarget: string = this.configurations.baseUrl + "/api/Combat/SaveTarget";
  private readonly Combat_Start: string = this.configurations.baseUrl + "/api/Combat/Combat_Start";
  private readonly SaveSortOrder: string = this.configurations.baseUrl + "/api/Combat/SaveSortOrder";
  private readonly SaveDelayTurn: string = this.configurations.baseUrl + "/api/Combat/SaveDelayTurn";
  private readonly SaveSelectedCombatant: string = this.configurations.baseUrl + "/api/Combat/SaveSelectedCombatant";
  private readonly UpdateMonsterDetails: string = this.configurations.baseUrl + "/api/Combat/UpdateMonsterDetails";
  private readonly isCombatUpdatedUrl: string = this.configurations.baseUrl + "/api/Combat/IsCombatUpdated";
  private readonly markCombatAsUpdatedFlagUrl: string = this.configurations.baseUrl + "/api/Combat/MarkCombatAsUpdatedFlag";
  private readonly markCombatAsUpdatedFlagFalseUrl: string = this.configurations.baseUrl + "/api/Combat/MarkCombatAsUpdatedFlagFalse";
  private readonly update_hasCharacterChangedTurn: string = this.configurations.baseUrl + "/api/Combat/update_hasCharacterChangedTurn";
  


  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  getCombatDetails<T>(CampaignID: number, isPCView: boolean, recentlyEndedCombatId: number): Observable<T> {
    let endpointUrl = `${this.GetCombatDetails}?CampaignId=${CampaignID}&isPCView=${isPCView}&recentlyEndedCombatId=${recentlyEndedCombatId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCombatDetails(CampaignID, isPCView, recentlyEndedCombatId));
      });
  }

  getCombatDetails_PCModelData<T>(CampaignID: number): Observable<T> {
    let endpointUrl = `${this.GetCombatDetails_PcModelData}?CampaignId=${CampaignID}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCombatDetails_PCModelData(CampaignID));
      });
  }

  updateCombatSettings<T>(settings: CombatSettings): Observable<T> {
    let updateCombatSettingsUrl = `${this.UpdateCombatSettings}`
    return this.http.post<T>(updateCombatSettingsUrl, JSON.stringify(settings), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateCombatSettings(settings));
      });
  }
  update_HasCharacterChangedTurn<T>(CombatId:number, flag:boolean): Observable<T> {
    let endpoint = `${this.update_hasCharacterChangedTurn}?CombatId=${CombatId}&flag=${flag}`
    return this.http.post<T>(endpoint, {}, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.update_HasCharacterChangedTurn<T>(CombatId, flag));
      });
  }

  saveCombatantList<T>(combatants: any[], CampaignID: number): Observable<T> {
    let saveInitiativeUrl = `${this.SaveCombatantList}?CampaignID=${CampaignID}`
    return this.http.post<T>(saveInitiativeUrl, JSON.stringify(combatants), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveCombatantList(combatants, CampaignID));
      });
  }

  saveCombatantTurn<T>(curretnCombatant, roundCount: number, CharacterHasChangedTurn:boolean=false): Observable<T> {
    let saveCombatantTurn = `${this.SaveCombatantTurn}?roundCount=${roundCount}&CharacterHasChangedTurn=${CharacterHasChangedTurn}`
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

  removeMonsters<T>(monsters: any[], shouldDeleteMonsters: boolean, isFromCombatScreen: boolean, CampaignId: number, XP_Ruleset_CharacterStatID: number): Observable<T> {
    let url = `${this.Combat_RemoveMonsters}?deleteMonster=${shouldDeleteMonsters}&CampaignId=${CampaignId}&XP_Ruleset_CharacterStatID=${XP_Ruleset_CharacterStatID}&isFromCombatScreen=${isFromCombatScreen}`
    return this.http.post<T>(url, JSON.stringify(monsters), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.removeMonsters(monsters, shouldDeleteMonsters, isFromCombatScreen, CampaignId, XP_Ruleset_CharacterStatID));
      });
  }

  StartCombat<T>(CombatId: number, Start: boolean): Observable<T> {
    let url = `${this.Combat_Start}?CombatId=${CombatId}&Start=${Start}`
    return this.http.post<T>(url, JSON.stringify({}), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.StartCombat(CombatId, Start));
      });
  }

  saveVisibilityDetails<T>(currentItem): Observable<T> {
    let saveInitiativeUrl = `${this.SaveVisibilityDetails}`
    return this.http.post<T>(saveInitiativeUrl, JSON.stringify(currentItem), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveVisibilityDetails(currentItem));
      });
  }

  saveMonsterHealth<T>(mosnterHealth): Observable<T> {
    debugger;
    let saveMonsterHealthUrl = `${this.SaveMonsterHealth}`
    return this.http.post<T>(saveMonsterHealthUrl, JSON.stringify(mosnterHealth), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveMonsterHealth(mosnterHealth));
      });
  }

  saveCharacterHealth<T>(characterHealth): Observable<T> {
    let endpointUrl = `${this.SaveCharacterHealthUrl}`
    return this.http.post<T>(endpointUrl, JSON.stringify(characterHealth), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveCharacterHealth(characterHealth));
      });
  }

  getBuffAndEffctList<T>(monsterId: number, rulesetId: number): Observable<T> {
    let url = `${this.SP_GetMonsterAssociateBEs}?monsterId=${monsterId}&rulesetId=${rulesetId}`
    return this.http.get<T>(url, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffctList(monsterId, rulesetId));
      });
  }

  saveTarget<T>(target, isFromGMScreen:boolean =false): Observable<T> {
    let endpointUrl = `${this.SaveTarget}?isFromGMScreen=${isFromGMScreen}`
    return this.http.post<T>(endpointUrl, JSON.stringify(target), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveTarget(target));
      });
  }

  saveSortOrder<T>(sortOrder): Observable<T> {
    let url = `${this.SaveSortOrder}`
    return this.http.post<T>(url, JSON.stringify(sortOrder), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveSortOrder(sortOrder));
      });
  }

  saveDelayTurn<T>(delayTurn): Observable<T> {
    let url = `${this.SaveDelayTurn}`
    return this.http.post<T>(url, JSON.stringify(delayTurn), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveDelayTurn(delayTurn));
      });
  }

  saveSelectedCombatant<T>(isCurrentSelected): Observable<T> {
    let url = `${this.SaveSelectedCombatant}`
    return this.http.post<T>(url, JSON.stringify(isCurrentSelected), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.saveSelectedCombatant(isCurrentSelected));
      });
  }

  updateMonsterDetails<T>(combat, type): Observable<T> {
    let url = `${this.UpdateMonsterDetails}?type=${type}`
    return this.http.post<T>(url, JSON.stringify(combat), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateMonsterDetails(combat, type));
      });
  }


  isCombatUpdatedAndCurrentTurn<T>(combatId: number): Observable<T> {
    let url = `${this.isCombatUpdatedUrl}?combatId=${combatId}`
    return this.http.get<T>(url, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.isCombatUpdatedAndCurrentTurn(combatId));
      });
  }

  markCombatAsUpdatedFlag<T>(combatId: number): Observable<T> {
    let url = `${this.markCombatAsUpdatedFlagUrl}?combatId=${combatId}`
    return this.http.post<T>(url, JSON.stringify({}), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.markCombatAsUpdatedFlag(combatId));
      });
  }
  markCombatAsUpdatedFlagFalse<T>(combatId: number): Observable<T> {
    let url = `${this.markCombatAsUpdatedFlagFalseUrl}?combatId=${combatId}`
    return this.http.post<T>(url, JSON.stringify({}), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.markCombatAsUpdatedFlagFalse(combatId));
      });
  }

}
