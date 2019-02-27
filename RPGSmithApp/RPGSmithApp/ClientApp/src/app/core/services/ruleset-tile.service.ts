import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";
import { Tile } from '../models/view-models/tile.model';
import { RulesetTile } from '../models/tiles/ruleset-tile.model';

@Injectable()
export class RulesetTileService extends EndpointFactory {

  private readonly _createUrl: string = "/api/RulesetTile/create";
  private readonly _updateUrl: string = "/api/RulesetTile/update";
  private readonly _deleteUrl: string = "/api/RulesetTile/delete";
  private readonly _getByIdUrl: string = "/api/RulesetTile/GetById";
  private readonly _getByPageIdRulesetId: string = "/api/RulesetTile/getByPageIdRulesetId";
  private readonly _getByPageIdRulesetId_sp: string = "/api/RulesetTile/getByPageIdRulesetId_sp";
  private readonly _getCountByPageIdRulesetId: string = "/api/RulesetTile/getCountByPageIdRulesetId";
  private readonly _getRecentColorsApi: string = "/api/RulesetTile/getRecentColors";
  private readonly _deleteTileListApi: string = "/api/RulesetTile/deleteTileList";

  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  get getByPageIdRulesetId() { return this.configurations.baseUrl + this._getByPageIdRulesetId; }
  get getByPageIdRulesetId_sp() { return this.configurations.baseUrl + this._getByPageIdRulesetId_sp; }
  get getCountByPageIdRulesetId() { return this.configurations.baseUrl + this._getCountByPageIdRulesetId; }
  get getRecentColorsApi() { return this.configurations.baseUrl + this._getRecentColorsApi; }
  get deleteTileListUrl() { return this.configurations.baseUrl + this._deleteTileListApi; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }
  createRulesetCharacterStatTile<T>(model: RulesetTile): Observable<T> {

    let endpoint = this.createUrl;
    if (model.characterStatTile.characterStatTileId > 0)
      endpoint = this.updateUrl;

    return this.http.post<T>(endpoint, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createRulesetCharacterStatTile(model));
      });
  }
  getTilesCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountByPageIdRulesetId}?pageIdRulesetId=${Id}`;

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

  getTilesByPageIdRulesetId<T>(Id: number, RulesetId: number): Observable<T> {
    let endpointUrl = `${this.getByPageIdRulesetId}?pageId=${Id}&rulesetId=${RulesetId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getTilesByPageIdRulesetId(Id, RulesetId));
      });
  }
  getTilesByPageIdRulesetId_sp<T>(Id: number, RulesetId: number): Observable<T> {
    let endpointUrl = `${this.getByPageIdRulesetId_sp}?pageId=${Id}&rulesetId=${RulesetId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getTilesByPageIdRulesetId_sp(Id, RulesetId));
      });
  }

  getRecentColors<T>(): Observable<T> {
    return this.http.get<T>(this.getRecentColorsApi, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRecentColors());
      });
  }


  createTile<T>(tile: RulesetTile): Observable<T> {

    let endpointUrl = this.createUrl;

    if (tile.rulesetId == 0 || tile.rulesetId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(tile), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createTile(tile));
      });
  }

  updateTile<T>(tile: RulesetTile): Observable<T> {

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
  deleteTileList<T>(TileIds: number[]): Observable<T> {
    let endpointUrl = this.deleteTileListUrl;

    return this.http.post(endpointUrl, JSON.stringify(TileIds), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.deleteTileList(TileIds));
      });
  }
}

