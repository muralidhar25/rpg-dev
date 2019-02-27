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
import { Tile } from '../models/view-models/tile.model';



@Injectable()
export class TileService extends EndpointFactory {


  private readonly _createUrl: string = "/api/Tile/create";
  private readonly _updateUrl: string = "/api/Tile/update";
  private readonly _deleteUrl: string = "/api/Tile/delete";
  private readonly _getByIdUrl: string = "/api/Tile/GetById";
  private readonly _getByPageIdCharacterId: string = "/api/Tile/getByPageIdCharacterId";

  private readonly _getCountByPageIdCharacterId: string = "/api/Tile/getCountByPageIdCharacterId";


  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  get getByPageIdCharacterId() { return this.configurations.baseUrl + this._getByPageIdCharacterId; }
  get getCountByPageIdCharacterId() { return this.configurations.baseUrl + this._getCountByPageIdCharacterId; }
  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getTilesCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountByPageIdCharacterId}?pageIdCharacterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getTilesCount(Id));
      });
  }

  getTilesById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getTilesById(Id));
      });
  }

  getTilesByPageIdCharacterId<T>(Id: number, characterId: number): Observable<T> {
    let endpointUrl = `${this.getByPageIdCharacterId}?pageId=${Id}&characterId=${characterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getTilesByPageIdCharacterId(Id, characterId));
      });
  }

  createTile<T>(tile: Tile): Observable<T> {

    let endpointUrl = this.createUrl;

    if (tile.characterId == 0 || tile.characterId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(tile), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createTile(tile));
      });
  }



  updateTile<T>(tile: Tile): Observable<T> {

    return this.http.put<T>(this.updateUrl, JSON.stringify(tile), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateTile(tile));
      });
  }

  deleteTile<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteTile(Id));
      });
  }

}
