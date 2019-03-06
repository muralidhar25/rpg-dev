import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Provider } from 'ngx-social-login';
import { LocalStoreManager } from './../../common/local-store-manager.service';

import { EndpointFactory } from '../../../core/common/endpoint-factory.service';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from './../../common/utilities';
import { FileUploadService } from '../../common/file-upload.service';

@Injectable()
export class ImageSearchService extends EndpointFactory {

  private readonly _bingApi: string = this.configurations.baseUrl + "/api/Image/BingSearch";
  private readonly _blobStockApi: string = this.configurations.baseUrl + "/api/Image/BlobStock";
  private readonly _blobStockPagingApi: string = this.configurations.baseUrl + "/api/Image/BlobStockPaging";
  private readonly _myImagesApi: string = this.configurations.baseUrl + "/api/Image/MyImages";
  private readonly _myImagesPagingApi: string = this.configurations.baseUrl + "/api/Image/MyImagesPaging";
  private readonly _baseStringApi: string = this.configurations.baseUrl + "/api/Image/ConvertImageURLToBase64";
  private readonly _blobDefaultImageApi: string = this.configurations.baseUrl + "/api/Image/BlobGetDefaultImage";
  private readonly deleteImagesUrl: string = this.configurations.baseUrl + "/api/Image/DeleteBlob";
  private readonly uploadImagesUrl: string = this.configurations.baseUrl + "/api/Image/UploadImages";


  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getBingSearch<T>(query: string, count: number = 0): Observable<T> {
    let endpointUrl = `${this._bingApi}?q=${query}&count=${count}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBingSearch(query));
      });
  }

  getBlobStockSearch<T>(query: string): Observable<T> {
    let endpointUrl = `${this._blobStockApi}?q=${query}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBingSearch(query));
      });
  }
  getBlobStockPagingSearch<T>(Count: number, previousContainerNumber: number, previousContainerImageNumber: number): Observable<T> {
    let endpointUrl = `${this._blobStockPagingApi}?Count=${Count}&previousContainerNumber=${previousContainerNumber}&previousContainerImageNumber=${previousContainerImageNumber}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBlobStockPagingSearch(Count, previousContainerNumber, previousContainerImageNumber));
      });
  }

  getBlobMyImagesSearch<T>(query: string, userId: string): Observable<T> {
    let endpointUrl = `${this._myImagesApi}?q=${query}&id=${userId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBingSearch(query));
      });
  }
  getBlobMyImagesSearchPaging<T>(query: string, userId: string, count, previousContainerImageNumber): Observable<T> {
    let endpointUrl = `${this._myImagesPagingApi}?q=${query}&id=${userId}&count=${count}&previousContainerImageNumber=${previousContainerImageNumber}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBlobMyImagesSearchPaging(query, userId, count, previousContainerImageNumber));
      });
  }
  getBaseString<T>(url: string): Observable<T> {
    let endpointUrl = `${this._baseStringApi}?url=${url}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBingSearch(url));
      });
    //return this.http.post<T>(endpointUrl, this.getRequestFileHeaders())
    //    //.map(() => { return true; })
    //    .catch(error => {
    //        return this.handleError(error, () => this.getBingSearch(url));
    //    });


    //let endpointUrl = `${this._baseStringApi}`;

    //return this.http.post<T>(endpointUrl, url)
    //    .catch(error => {
    //        return this.handleError(error, () => this.getBingSearch(url));
    //    });
  }
  getDefaultImage<T>(query: string): Observable<T> {
    let endpointUrl = `${this._blobDefaultImageApi}?type=${query}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getDefaultImage(query));
      });
  }

  deleteImages<T>(blobs: any): Observable<T> {

    let endpointUrl = this.deleteImagesUrl;

    return this.http.post(endpointUrl, JSON.stringify(blobs), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.deleteImages(blobs));
      });
  }
  uploadImages<T>(imgList: File[], userid: string): Observable<T> {

    let endpointUrl = `${this.uploadImagesUrl}?userId=${userid}`;

    const formData: FormData = new FormData();

    for (var i = 0; i < imgList.length; i++) {
      formData.append('img' + i, imgList[i], imgList[i].name);
    }
    return this.http.post<T>(endpointUrl, formData, this.getRequestFileHeaders())
      //.map(() => { return true; })
      .catch(error => {
        return this.handleError(error, () => this.uploadImages(imgList, userid));
      });
  }
}