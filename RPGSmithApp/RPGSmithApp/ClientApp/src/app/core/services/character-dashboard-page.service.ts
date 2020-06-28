import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { CharacterDashboardPage } from '../models/view-models/character-dashboard-page.model';

@Injectable()
export class CharacterDashboardPageService extends EndpointFactory {

  private readonly getByCharacterIdUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardPage/getByCharacterId";
  private readonly getByLayoutIdUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardPage/getByLayoutId";
  private readonly getCountByCharacterIdUrl: string = this.configurations.baseUrl + "api/CharacterDashboardPage/GetCountByCharacterId";
  private readonly getCountByLayoutIdUrl: string = this.configurations.baseUrl + "api/CharacterDashboardPage/GetCountByLayoutId";
  private readonly createUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardPage/create";
  private readonly updateUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardPage/update";
  private readonly updateSortOrderUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardPage/updateSortOrder";
  private readonly deleteUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardPage/delete";
  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardPage/GetById";
  private readonly duplicateUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardPage/duplicate";

  private CharacterDashboardPageById: any;

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  getCharacterDashboardPageById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterDashboardPageById(Id));
      });
  }

  getCharacterDashboardPageById_Cache<T>(Id: number, isFromCampaigns: any): Observable<T> {
    if (isFromCampaigns) {
      return Observable.of(this.CharacterDashboardPageById);
    }
    else {
      console.log("6666");
      let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.CharacterDashboardPageById = data)
        .catch(error => {
          return this.handleError(error, () => this.getCharacterDashboardPageById(Id));
        });
    }
  }

  getPagesCountByCharacterId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountByCharacterIdUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPagesCountByCharacterId(Id));
      });
  }

  getPagesCountByLayoutId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountByLayoutIdUrl}?layoutId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPagesCountByLayoutId(Id));
      });
  }

  getPagesByCharacterId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterIdUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPagesByCharacterId(Id));
      });
  }

  getPagesByLayoutId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByLayoutIdUrl}?layoutId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPagesByLayoutId(Id));
      });
  }

  createeditCharacterDashboardPage<T>(characterDashboardPage: CharacterDashboardPage): Observable<T> {

    let endpointUrl = this.createUrl;

    if (characterDashboardPage.characterDashboardPageId == 0 || characterDashboardPage.characterDashboardPageId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(characterDashboardPage), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createeditCharacterDashboardPage(characterDashboardPage));
      });
  }

  duplicateCharacterDashboardPage<T>(characterDashboardPage: CharacterDashboardPage): Observable<T> {

    return this.http.post<T>(this.duplicateUrl, JSON.stringify(characterDashboardPage), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateCharacterDashboardPage(characterDashboardPage));
      });
  }

  deleteCharacterDashboardPage<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteCharacterDashboardPage(Id));
      });
  }

  sortOrderPages<T>(objPages: any): Observable<T> {

    return this.http.post<T>(this.updateSortOrderUrl, JSON.stringify(objPages), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.sortOrderPages(objPages));
      });
  }

}
