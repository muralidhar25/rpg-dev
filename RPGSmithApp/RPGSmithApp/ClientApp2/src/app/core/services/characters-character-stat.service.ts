import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { LocalStoreManager } from '../common/local-store-manager.service';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { DBkeys } from '../common/db-keys';

import { CharactersCharacterStat } from '../models/view-models/characters-character-stats.model';
import { ICON, VIEW } from '../models/enums';

@Injectable()
export class  CharactersCharacterStatService extends EndpointFactory {

  private readonly _getCharacterByIdApi: string = this.configurations.baseUrl + "/api/Character/GetCharactersById";

  private readonly _getByCharacterIdUrl: string = "/api/CharactersCharacterStat/getByCharacterId";
  private readonly _getByCharacterIdStatListUrl: string = "/api/CharactersCharacterStat/getStatListByCharacterId";
  private readonly _getNumericStatsByCharacterId: string = "/api/CharactersCharacterStat/getNumericStatsByCharacterId";
  private readonly _getNumericStatsByRulesetId: string = "/api/CharactersCharacterStat/GetNumericStatsByRulesetId";
  private readonly _createUrl: string = "/api/CharactersCharacterStat/create";
  private readonly _updateUrl: string = "/api/CharactersCharacterStat/update";
  private readonly _updatelistUrl: string = "/api/CharactersCharacterStat/updatelist";
  private readonly _getLinkRecordsDetailsUrl: string = "/api/CharactersCharacterStat/getLinkTypeRecords";
  private readonly _getConditionsValuesListUrl: string = "/api/CharactersCharacterStat/getConditionsValuesList";


  get getByCharacterIdUrl() { return this.configurations.baseUrl + this._getByCharacterIdUrl; }
  get getByCharacterIdStatListUrl() { return this.configurations.baseUrl + this._getByCharacterIdStatListUrl; }
  get getNumericStatsByCharacterId() { return this.configurations.baseUrl + this._getNumericStatsByCharacterId; }
  get getNumericStatsByRulesetId() { return this.configurations.baseUrl + this._getNumericStatsByRulesetId; }
  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get updatelistUrl() { return this.configurations.baseUrl + this._updatelistUrl; }
  get getLinkRecordsDetailsUrl() { return this.configurations.baseUrl + this._getLinkRecordsDetailsUrl; }
  get getConditionsValuesListUrl() { return this.configurations.baseUrl + this._getConditionsValuesListUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  getCharactersById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this._getCharacterByIdApi}?id=${Id}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharactersById(Id));
      });
  }

  getCharactersCharacterStat<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterIdUrl}?characterId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharactersCharacterStat(Id, page, pageSize));
      });
  }
  getCharactersCharacterStat_StatList<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterIdStatListUrl}?characterId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharactersCharacterStat_StatList(Id, page, pageSize));
      });
  }

  getNumericCharactersCharacterStat<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getNumericStatsByCharacterId}?characterId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getNumericCharactersCharacterStat(Id, page, pageSize));
      });
  }

  getNumericCharactersCharacterStatRuleset<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getNumericStatsByRulesetId}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getNumericCharactersCharacterStat(Id, page, pageSize));
      });
  }


  updateCharactersCharacterStat<T>(charactersCharacterStat: CharactersCharacterStat): Observable<T> {

    return this.http.post<T>(this.updateUrl, JSON.stringify(charactersCharacterStat), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateCharactersCharacterStat(charactersCharacterStat));
      });
  }

  updateCharactersCharacterStatList<T>(charactersCharacterStats: any): Observable<T> {

    charactersCharacterStats.forEach(item => {
      item.character = null;
    });

    return this.http.post<T>(this.updatelistUrl, JSON.stringify(charactersCharacterStats), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateCharactersCharacterStatList(charactersCharacterStats));
      });
  }
  getLinkRecordsDetails<T>(characterId: number): Observable<T> {
    let endpointUrl = `${this.getLinkRecordsDetailsUrl}?characterId=${characterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLinkRecordsDetails(characterId));
      });
  }
  getConditionsValuesList<T>(characterId: number): Observable<T> {
    let endpointUrl = `${this.getConditionsValuesListUrl}?characterId=${characterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getConditionsValuesList(characterId));
      });
  }

}
