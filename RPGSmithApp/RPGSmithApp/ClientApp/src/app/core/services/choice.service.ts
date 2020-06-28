import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';

@Injectable()
export class ChoiceService extends EndpointFactory {

  private readonly _getUrl: string = "/api/Choice/GetChoice";
  private readonly _createUrl: string = "/api/Choice/CreateChoice";
  private readonly _updateUrl: string = "/api/Choice/UpdateChoice";
  private readonly _deleteUrl: string = "/api/Choice/DeleteChoice";
  private readonly _getByIdUrl: string = "/api/Choice/GetChoiceById";
  private readonly _getByRulesetUrl: string = "/api/Choice/GetChoicesByRuleSetId";

  get getUrl() { return this.configurations.baseUrl + this._getUrl; }
  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  get getByRulesetUrl() { return this.configurations.baseUrl + this._getByRulesetUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  getChoice<T>(page?: number, pageSize?: number): Observable<T> {
    let endpointUrl = page && pageSize ? `${this.getUrl}?page=${page}&pageSize=${pageSize}` : this.getUrl;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getChoice(page, pageSize));
      });
  }

  getChoiceById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getChoiceById(Id));
      });
  }

  getChoiceByRuleset<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getChoiceByRuleset(Id));
      });
  }

  createChoice<T>(userObject: any): Observable<T> {

    let endpointUrl = this.createUrl;

    if (userObject.id == 0 || userObject.id === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(userObject), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createChoice(userObject));
      });
  }

  duplicateChoice<T>(choice: any): Observable<any> {
    choice.id = 0;
    let endpointUrl = this.createUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(choice), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateChoice(choice));
      });
  }

  updateChoice<T>(userObject: any): Observable<T> {

    return this.http.put<T>(this.updateUrl, JSON.stringify(userObject), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateChoice(userObject));
      });
  }

  deleteChoice<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteChoice(Id));
      });
  }


}
