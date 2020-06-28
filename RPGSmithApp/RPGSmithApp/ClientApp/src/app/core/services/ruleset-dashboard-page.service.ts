import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { LocalStoreManager } from '../common/local-store-manager.service';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";
import { AuthService } from "../auth/auth.service";
import { DBkeys } from '../common/db-keys';

import { RulesetDashboardPage } from '../models/view-models/ruleset-dashboard-page.model';
import { ICON, VIEW } from '../models/enums';

@Injectable()
export class RulesetDashboardPageService extends EndpointFactory {

  private readonly getByRulesetIdUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardPage/getByRulesetId";
  private readonly getByLayoutIdUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardPage/getByLayoutId";
  private readonly getCountByRulesetIdUrl: string = this.configurations.baseUrl + "api/RulesetDashboardPage/GetCountByRulesetId";
  private readonly getCountByLayoutIdUrl: string = this.configurations.baseUrl + "api/RulesetDashboardPage/GetCountByLayoutId";
  private readonly createUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardPage/create";
  private readonly updateUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardPage/update";
  private readonly updateSortOrderUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardPage/updateSortOrder";
  private readonly deleteUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardPage/delete";
  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardPage/GetById";
  private readonly duplicateUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardPage/duplicate";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getRulesetDashboardPageById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRulesetDashboardPageById(Id));
      });
  }

  getPagesCountByRulesetId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountByRulesetIdUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPagesCountByRulesetId(Id));
      });
  }

  getPagesCountByLayoutId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountByLayoutIdUrl}?layoutId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPagesCountByLayoutId(Id));
      });
  }

  getPagesByRulesetId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetIdUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPagesByRulesetId(Id));
      });
  }

  getPagesByLayoutId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByLayoutIdUrl}?layoutId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPagesByLayoutId(Id));
      });
  }

  createEditRulesetDashboardPage<T>(RulesetDashboardPage: RulesetDashboardPage): Observable<T> {

    let endpointUrl = this.createUrl;

    if (RulesetDashboardPage.rulesetDashboardPageId == 0 || RulesetDashboardPage.rulesetDashboardPageId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(RulesetDashboardPage), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createEditRulesetDashboardPage(RulesetDashboardPage));
      });
  }

  duplicateRulesetDashboardPage<T>(RulesetDashboardPage: RulesetDashboardPage): Observable<T> {

    return this.http.post<T>(this.duplicateUrl, JSON.stringify(RulesetDashboardPage), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateRulesetDashboardPage(RulesetDashboardPage));
      });
  }

  deleteRulesetDashboardPage<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteRulesetDashboardPage(Id));
      });
  }

  sortOrderPages<T>(objPages: any): Observable<T> {

    return this.http.post<T>(this.updateSortOrderUrl, JSON.stringify(objPages), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.sortOrderPages(objPages));
      });
  }

}

