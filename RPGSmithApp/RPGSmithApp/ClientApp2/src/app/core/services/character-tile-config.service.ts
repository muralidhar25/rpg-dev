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
import { TileConfig } from '../models/tiles/character-tile-config.model';



@Injectable()
export class CharacterTileConfigService extends EndpointFactory {

  private readonly _createUrl: string = "/api/TileConfig/create";
  private readonly _updateUrl: string = "/api/TileConfig/update";
  private readonly _deleteUrl: string = "/api/TileConfig/delete";
  private readonly _getAllUrl: string = "/api/TileConfig/getall";
  private readonly _createListUrl: string = "/api/TileConfig/createList";
  private readonly _updateListUrl: string = "/api/TileConfig/updateList";

  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get getAllUrl() { return this.configurations.baseUrl + this._getAllUrl; }
  get createListUrl() { return this.configurations.baseUrl + this._createListUrl; }
  get updateListUrl() { return this.configurations.baseUrl + this._updateListUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  //getTilesConfigs<T>(Id: number): Observable<T> {
  //    let endpointUrl = `${this.getCountByPageIdCharacterId}?pageIdCharacterId=${Id}`;

  //    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
  //        .catch(error => {
  //            return this.handleError(error, () => this.getTilesCount(Id));
  //        });
  //}

  //getTilesById<T>(Id: number): Observable<T> {
  //    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

  //    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
  //        .catch(error => {
  //            return this.handleError(error, () => this.getTilesById(Id));
  //        });
  //}

  //getTilesByPageIdCharacterId<T>(Id: number, characterId: number): Observable<T> {
  //    let endpointUrl = `${this.getByPageIdCharacterId}?pageId=${Id}&characterId=${characterId}`;

  //    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
  //        .catch(error => {
  //            return this.handleError(error, () => this.getTilesByPageIdCharacterId(Id, characterId));
  //        });
  //}

  createUpdateTileConfig<T>(config: TileConfig, update: boolean): Observable<T> {
    let endpointUrl = this.createUrl;

    if (!update)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(config), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.createUpdateTileConfig(config, update));
      });
  }
  createUpdateTileConfigList<T>(configList: TileConfig[], update: boolean): Observable<T> {
    let endpointUrl = this.createListUrl;

    if (!update)
      endpointUrl = this.createListUrl;
    else
      endpointUrl = this.updateListUrl;

    return this.http.post(endpointUrl, JSON.stringify(configList), { headers: this.getRequestHeadersNew() })
      .catch(error => {
        return this.handleError(error, () => this.createUpdateTileConfigList(configList, update));
      });
  }
  //updateTile<T>(tile: Tile): Observable<T> {

  //    return this.http.put<T>(this.updateUrl, JSON.stringify(tile), this.getRequestHeaders())
  //        .catch(error => {
  //            return this.handleError(error, () => this.updateTile(tile));
  //        });
  //}

  deleteTileConfig<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteTileConfig(Id));
      });
  }

}
