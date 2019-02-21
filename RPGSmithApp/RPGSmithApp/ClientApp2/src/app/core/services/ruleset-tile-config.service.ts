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
import { RulesetTileConfig } from '../models/tiles/ruleset-tile-config.model';



@Injectable()
export class RulesetTileConfigService extends EndpointFactory {

  private readonly _createUrl: string = "/api/RulesetTileConfig/create";
  private readonly _updateUrl: string = "/api/RulesetTileConfig/update";
  private readonly _createUrlList: string = "/api/RulesetTileConfig/createlist";
  private readonly _updateUrlList: string = "/api/RulesetTileConfig/updatelist";
  private readonly _deleteUrl: string = "/api/RulesetTileConfig/delete";
  private readonly _getAllUrl: string = "/api/RulesetTileConfig/getall";

  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get createListUrl() { return this.configurations.baseUrl + this._createUrlList; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get updateListUrl() { return this.configurations.baseUrl + this._updateUrlList; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get getAllUrl() { return this.configurations.baseUrl + this._getAllUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  createUpdateRulesetTileConfig<T>(config: RulesetTileConfig, update: boolean): Observable<T> {
    let endpointUrl = this.createUrl;

    if (!update)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(config), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.createUpdateRulesetTileConfig(config, update));
      });
  }

  createUpdateRulesetTileConfigList<T>(configList: RulesetTileConfig[], update: boolean): Observable<T> {
    let endpointUrl = this.createListUrl;

    if (!update)
      endpointUrl = this.createListUrl;
    else
      endpointUrl = this.updateListUrl;

    return this.http.post(endpointUrl, JSON.stringify(configList), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.createUpdateRulesetTileConfigList(configList, update));
      });
  }
  deleteRulesetTileConfig<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteRulesetTileConfig(Id));
      });
  }

}
