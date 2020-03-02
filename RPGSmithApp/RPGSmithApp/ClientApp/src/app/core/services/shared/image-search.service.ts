import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../../../core/common/endpoint-factory.service';
import { ConfigurationService } from '../../../core/common/configuration.service';

@Injectable()
export class ImageSearchService extends EndpointFactory {

  private readonly _bingApi: string = this.configurations.baseUrl + "/api/Image/BingSearch";
  private readonly _blobStockApi: string = this.configurations.baseUrl + "/api/Image/BlobStock";
  private readonly _blobStockPagingApi: string = this.configurations.baseUrl + "/api/Image/BlobStockPaging";
  private readonly _myImagesApi: string = this.configurations.baseUrl + "/api/Image/MyImages";
  private readonly _myImagesPagingApi: string = this.configurations.baseUrl + "/api/Image/MyImagesPaging";
  private readonly _baseStringApi: string = this.configurations.baseUrl + "/api/Image/ConvertImageURLToBase64";
  private readonly _blobDefaultImageApi: string = this.configurations.baseUrl + "/api/Image/BlobGetDefaultImage";
  private readonly _blobDefaultImageListApi: string = this.configurations.baseUrl + "/api/Image/BlobGetDefaultImageList";

  private readonly deleteImagesUrl: string = this.configurations.baseUrl + "/api/Image/DeleteBlob";
  private readonly uploadImagesUrl: string = this.configurations.baseUrl + "/api/Image/UploadImages";

  private readonly myHandoutsUrl: string = this.configurations.baseUrl + "/api/Image/MyHandouts";

  private readonly uploadhandoutsUrl: string = this.configurations.baseUrl + "/api/Image/uploadhandoutByUserId";
  private readonly uploadhandoutFoldersUrl: string = this.configurations.baseUrl + "/api/Image/uploadhandoutFolderByUserId";
  private readonly renameFileUrl: string = this.configurations.baseUrl + "/api/Image/RenameFile";
  private readonly moveCopyFileUrl: string = this.configurations.baseUrl + "/api/Image/CopyMoveFile";
  private readonly DeleteFolderUrl: string = this.configurations.baseUrl + "/api/Image/DeleteFolder";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
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
  getDefaultImageList<T>(query: string): Observable<T> {
    let endpointUrl = `${this._blobDefaultImageListApi}?type=${query}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getDefaultImage(query));
      });
  }
  deleteImages<T>(blobs: any, prefixToGetFolderContent: string = ''): Observable<T> {

    let endpointUrl = `${this.deleteImagesUrl}?prefixToGetFolderContent=${prefixToGetFolderContent}`;

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

  getListOfUploads<T>(userId, count, previousContainerImageNumber, prefixToGetFolderContent, campaignID): Observable<T> {
    let endpointUrl = `${this.myHandoutsUrl}?userId=${userId}&count=${count}&previousContainerImageNumber=${previousContainerImageNumber}&prefixToGetFolderContent=${prefixToGetFolderContent}&campaignID=${campaignID}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getListOfUploads(userId, count, previousContainerImageNumber, prefixToGetFolderContent, campaignID));
      });
  }

  uploadHandouts<T>(imgList: File[], userid: string, campaignID): Observable<T> {

    let endpointUrl = `${this.uploadhandoutsUrl}?userId=${userid}&campaignID=${campaignID}`;

    const formData: FormData = new FormData();

    for (var i = 0; i < imgList.length; i++) {
      formData.append('img' + i, imgList[i], imgList[i].name);
    }
    return this.http.post<T>(endpointUrl, formData, this.getRequestFileHeaders())
      //.map(() => { return true; })
      .catch(error => {
        return this.handleError(error, () => this.uploadHandouts(imgList, userid, campaignID));
      });
  }
  uploadHandoutFolder<T>(imgList: File[], userid: string, folderName: string, campaignID): Observable<T> {

    let endpointUrl = `${this.uploadhandoutFoldersUrl}?userId=${userid}&folderName=${folderName}&campaignID=${campaignID}`;

    const formData: FormData = new FormData();

    for (var i = 0; i < imgList.length; i++) {
      formData.append('img' + i, imgList[i], imgList[i].name);
    }
    return this.http.post<T>(endpointUrl, formData, this.getRequestFileHeaders())
      //.map(() => { return true; })
      .catch(error => {
        return this.handleError(error, () => this.uploadHandouts(imgList, userid, campaignID));
      });
  }
  renameFile<T>(userId: string, campaignID: number, oldFileName: string, newFileName: string, prefixToGetFolderContent: string = ''): Observable<T> {

    let endpointUrl = `${this.renameFileUrl}?userId=${userId}&campaignID=${campaignID}&oldFileName=${oldFileName}&newFileName=${newFileName}&prefixToGetFolderContent=${prefixToGetFolderContent}`;

    return this.http.post(endpointUrl, JSON.stringify({}), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.renameFile(userId, campaignID, oldFileName, newFileName, prefixToGetFolderContent));
      });
  }
  moveCopyFile<T>(userId: string, campaignID: number, FileNameToMove: string, FolderNameToPasteFile: string, prefixToGetFolderContent: string = '', isCopy: boolean = false): Observable<T> {

    let endpointUrl = `${this.moveCopyFileUrl}?userId=${userId}&campaignID=${campaignID}&FileNameToMove=${FileNameToMove}&FolderNameToPasteFile=${FolderNameToPasteFile}&prefixToGetFolderContent=${prefixToGetFolderContent}&isCopy=${isCopy}`;

    return this.http.post(endpointUrl, JSON.stringify({}), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.moveCopyFile(userId, campaignID, FileNameToMove, FolderNameToPasteFile, prefixToGetFolderContent));
      });
  }
  deleteFolder<T>(userId: string, campaignID: number, prefixToGetFolderContent: string = ''): Observable<T> {

    let endpointUrl = `${this.DeleteFolderUrl}?userId=${userId}&campaignID=${campaignID}&prefixToGetFolderContent=${prefixToGetFolderContent}`;

    return this.http.post(endpointUrl, JSON.stringify({}), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.deleteFolder(userId, campaignID, prefixToGetFolderContent));
      });
  }
}
