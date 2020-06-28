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

import { DBkeys } from '../common/db-keys';

import { RulesetDashboardLayout } from '../models/view-models/ruleset-dashboard-layout.model';
import { ICON, VIEW } from '../models/enums';

@Injectable()
export class RulesetDashboardLayoutService extends EndpointFactory {

  private readonly getByRulesetIdUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/getByRulesetId";
  private readonly getCountByRulesetIdUrl: string = this.configurations.baseUrl + "api/RulesetDashboardLayout/GetCountByRulesetId";
  private readonly createUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/create";
  private readonly updateUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/update";
  private readonly deleteUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/delete";
  private readonly duplicateUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/duplicate";
  private readonly updateSortOrderUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/updateSortOrder";
  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/GetById";
  private readonly updateDefaultLayoutApi: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/UpdateDefaultLayout";
  private readonly updateDefaultLayoutPageApi: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/UpdateDefaultLayoutPage";
  private readonly getSharedByRulesetIdUrl: string = this.configurations.baseUrl + "/api/RulesetDashboardLayout/getSharedLayoutByRulesetId";

  private campaignDashboardData: any;

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getRulesetDashboardLayoutById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRulesetDashboardLayoutById(Id));
      });
  }

  getLayoutsCountByRulesetId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountByRulesetIdUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLayoutsCountByRulesetId(Id));
      });
  }

  getLayoutsByRulesetId<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetIdUrl}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLayoutsByRulesetId(Id, page, pageSize));
      });
  }
  
  createRulesetDashboardLayout<T>(RulesetDashboardLayout: RulesetDashboardLayout): Observable<T> {

    this.campaignDashboardData = null;
    let endpointUrl = this.createUrl;
    if (RulesetDashboardLayout.rulesetDashboardLayoutId == 0 || RulesetDashboardLayout.rulesetDashboardLayoutId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(RulesetDashboardLayout), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createRulesetDashboardLayout(RulesetDashboardLayout));
      });
  }

  updateRulesetDashboardLayout<T>(RulesetDashboardLayout: RulesetDashboardLayout): Observable<T> {

    this.campaignDashboardData = null;
    this.campaignDashboardData = null;
    return this.http.post<T>(this.updateUrl, JSON.stringify(RulesetDashboardLayout), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateRulesetDashboardLayout(RulesetDashboardLayout));
      });
  }

  duplicateRulesetDashboardLayout<T>(RulesetDashboardLayout: RulesetDashboardLayout): Observable<T> {

    this.campaignDashboardData = null;
    return this.http.post<T>(this.duplicateUrl, JSON.stringify(RulesetDashboardLayout), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateRulesetDashboardLayout(RulesetDashboardLayout));
      });
  }

  deleteRulesetDashboardLayout<T>(Id: number): Observable<T> {
    this.campaignDashboardData = null;
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteRulesetDashboardLayout(Id));
      });
  }

  sortOrderLayouts<T>(objLayouts: any): Observable<T> {
    this.campaignDashboardData = null;

    return this.http.post<T>(this.updateSortOrderUrl, JSON.stringify(objLayouts), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.sortOrderLayouts(objLayouts));
      });
  }

  updateDefaultLayout<T>(layoutId: number): Observable<T> {
    this.campaignDashboardData = null;
    let endpoint = `${this.updateDefaultLayoutApi}?layoutId=${layoutId}`;
    return this.http.post<T>(endpoint, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateDefaultLayout(layoutId));
      });
  }

  updateDefaultLayoutPage<T>(layoutId: number, pageId: number): Observable<T> {
    this.campaignDashboardData = null;
    let endpoint = `${this.updateDefaultLayoutPageApi}?layoutId=${layoutId}&pageId=${pageId}`;
    return this.http.post<T>(endpoint, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateDefaultLayoutPage(layoutId, pageId));
      });
  }

  getSharedLayoutByRulesetId<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getSharedByRulesetIdUrl}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getSharedLayoutByRulesetId(Id, page, pageSize));
      });
  }

  getSharedLayoutByRulesetId_Cache<T>(Id: number, page: number, pageSize: number, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.campaignDashboardData = null;
    }
    if (this.campaignDashboardData != null) {
      return Observable.of(this.campaignDashboardData);
    }
    else {
      let endpointUrl = `${this.getSharedByRulesetIdUrl}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(capmaignDashboard => this.campaignDashboardData = capmaignDashboard)
        .catch(error => {
          return this.handleError(error, () => this.getSharedLayoutByRulesetId(Id, page, pageSize));
        });
    }
  }

  

}
