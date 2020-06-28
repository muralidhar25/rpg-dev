import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";

@Injectable()
export class PageLastViewsService extends EndpointFactory {

  private readonly _getAllUrl: string = this.configurations.baseUrl + "/api/PageLastView/GetAllByUserId";
  private readonly _getByUserIdPageUrl: string = this.configurations.baseUrl + "/api/PageLastView/GetByUserIdPageName";
  private readonly _createUrl: string = this.configurations.baseUrl + "/api/PageLastView/create";
  private readonly _updateUrl: string = this.configurations.baseUrl + "/api/PageLastView/update";
  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getAllByUserId<T>(): Observable<T> {

    return this.http.get<T>(this._getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAllByUserId());
      });
  }

  getByUserIdPageName<T>(userId: string, pageName: string): Observable<T> {
    let endpointUrl = `${this._getByUserIdPageUrl}?userId=${userId}&pageName=${pageName}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getByUserIdPageName(userId, pageName));
      });
  }

  getByUserIdPageName_Cache<T>(userId: string, pageName: string): Observable<T> {
    let endpointUrl = `${this._getByUserIdPageUrl}?userId=${userId}&pageName=${pageName}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getByUserIdPageName(userId, pageName));
      });
  }

  createPageLastViews<T>(pageLastViews: any): Observable<T> {

    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews<T>(pageLastViews));
      });
  }


}

