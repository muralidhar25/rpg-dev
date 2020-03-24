import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";
import { Tile } from '../models/view-models/tile.model';
import { ToggleTile } from '../models/view-models/toggle-tile.model';

@Injectable()
export class CharacterTileService extends EndpointFactory {

  private readonly _createUrl: string = "/api/CharatcerTile/create";
  private readonly _updateUrl: string = "/api/CharatcerTile/update";
  private readonly _deleteUrl: string = "/api/CharatcerTile/delete";
  private readonly _getByIdUrl: string = "/api/CharatcerTile/GetById";
  private readonly _getByPageIdCharacterId: string = "/api/CharatcerTile/getByPageIdCharacterId";
  private readonly _getByPageIdCharacterId_sp: string = "/api/CharatcerTile/getByPageIdCharacterId_sp";
  private readonly _getSharedLayoutByPageIdRulesetId_sp: string = "/api/CharatcerTile/getSharedLayoutByPageIdRulesetId_sp";
  private readonly _getCountByPageIdCharacterId: string = "/api/CharatcerTile/getCountByPageIdCharacterId";
  private readonly _getRecentColorsApi: string = "/api/CharatcerTile/getRecentColors";
  private readonly _deleteTileListApi: string = "/api/CharatcerTile/deleteTileList";
  private readonly _updateToggleTileValuesUrl: string = "/api/CharatcerTile/updateToggleTileValues";

  private TilesByPageIdCharacterId: any;

  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  get getByPageIdCharacterId() { return this.configurations.baseUrl + this._getByPageIdCharacterId; }
  get getByPageIdCharacterId_sp() { return this.configurations.baseUrl + this._getByPageIdCharacterId_sp; }
  get getSharedLayoutByPageIdRulesetId_sp() { return this.configurations.baseUrl + this._getSharedLayoutByPageIdRulesetId_sp; }
  get getCountByPageIdCharacterId() { return this.configurations.baseUrl + this._getCountByPageIdCharacterId; }
  get getRecentColorsApi() { return this.configurations.baseUrl + this._getRecentColorsApi; }
  get deleteTileListUrl() { return this.configurations.baseUrl + this._deleteTileListApi; }
  get updateToggleTileValuesUrl() { return this.configurations.baseUrl + this._updateToggleTileValuesUrl; }


  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
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

  getTilesByPageIdCharacterId<T>(Id: number, characterId: number, rulesetId: number=0, isSharedLayout: boolean= false): Observable<T> {
    let endpointUrl
    if (!isSharedLayout) {
      endpointUrl = `${this.getByPageIdCharacterId_sp}?pageId=${Id}&characterId=${characterId}`;
    }
    else {
      endpointUrl = `${this.getSharedLayoutByPageIdRulesetId_sp}?pageId=${Id}&characterId=${characterId}&rulesetId=${rulesetId}`;
    }
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getTilesByPageIdCharacterId(Id, characterId,rulesetId,isSharedLayout));
      });
  }

  getTilesByPageIdCharacterId_Cache<T>(Id: number, characterId: number, rulesetId: number = 0, isSharedLayout: boolean = false, isFromCampaigns: any): Observable<T> {
    if (isFromCampaigns && this.TilesByPageIdCharacterId) {
      return Observable.of(this.TilesByPageIdCharacterId);
    }
    else {
      let endpointUrl
      if (!isSharedLayout) {
        endpointUrl = `${this.getByPageIdCharacterId_sp}?pageId=${Id}&characterId=${characterId}`;
      }
      else {
        endpointUrl = `${this.getSharedLayoutByPageIdRulesetId_sp}?pageId=${Id}&characterId=${characterId}&rulesetId=${rulesetId}`;
      }
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.TilesByPageIdCharacterId = data)
        .catch(error => {
          return this.handleError(error, () => this.getTilesByPageIdCharacterId(Id, characterId, rulesetId, isSharedLayout));
        });
    }
  }
  //getTilesByPageIdCharacterId_sp<T>(Id: number, characterId: number): Observable<T> {
  //    let endpointUrl = `${this.getByPageIdCharacterId_sp}?pageId=${Id}&characterId=${characterId}`;

  //    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
  //        .catch(error => {
  //            return this.handleError(error, () => this.getTilesByPageIdCharacterId_sp(Id, characterId));
  //        });
  //}

  getRecentColors<T>(): Observable<T> {
    return this.http.get<T>(this.getRecentColorsApi, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRecentColors());
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
  updateToggleTileValues<T>(tile: ToggleTile): Observable<T> {

    return this.http.post<T>(this.updateToggleTileValuesUrl, JSON.stringify(tile), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateToggleTileValues(tile));
      });
  }

  deleteTile<T>(Id: number): Observable<T> {
    this.TilesByPageIdCharacterId = null;
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteTile(Id));
      });
  }
  deleteTileList<T>(TileIds: number[]): Observable<T> {
    this.TilesByPageIdCharacterId = null;
    let endpointUrl = this.deleteTileListUrl;

    return this.http.post(endpointUrl, JSON.stringify(TileIds), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.deleteTileList(TileIds));
      });
  }

}
