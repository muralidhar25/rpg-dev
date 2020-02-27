import { Injectable, Injector } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { FileUploadService } from '../../common/file-upload.service';
import { EndpointFactory } from '../../../core/common/endpoint-factory.service';
import { CharacterTile } from '../../models/tiles/character-tile.model';
import { VIEW } from '../../models/enums';
import { CharacterDashboardPage } from '../../models/view-models/character-dashboard-page.model';
import { RulesetTile } from '../../models/tiles/ruleset-tile.model';
import { RulesetDashboardPage } from '../../models/view-models/ruleset-dashboard-page.model';

@Injectable()
export class CurrencyTileService extends EndpointFactory {

  private readonly createApi: string = this.configurations.baseUrl + "/api/CharatcerTile/create";
  private readonly updateApi: string = this.configurations.baseUrl + "/api/CharatcerTile/update";
  private readonly deleteApi: string = this.configurations.baseUrl + "/api/CharatcerTile/delete";
  private readonly rulesetCreateApi: string = this.configurations.baseUrl + "/api/RulesetTile/create";
  private readonly rulesetUpdateApi: string = this.configurations.baseUrl + "/api/RulesetTile/update";
  private readonly rulesetDeleteApi: string = this.configurations.baseUrl + "/api/RulesetTile/delete";
  private readonly saveCharacterCurrencyApi: string = this.configurations.baseUrl + "/api/CharatcerTile/saveCharacterCurrency";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  createCurrencyTile<T>(model: CharacterTile): Observable<T> {

    let endpoint = this.createApi;
    if (model.currencyTile.currencyTypeTileId > 0)
      endpoint = this.updateApi;

    return this.http.post<T>(endpoint, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createCurrencyTile(model));
      });
  }  

  deleteCurrencyTile<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteApi}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteCurrencyTile(Id));
      });
  }

  public currencyTileModelData(model: any, characterId: number, pageId: number, view: string, pageDefaultData: CharacterDashboardPage): any {

    view = view.toLowerCase() == 'add' ? VIEW.ADD : VIEW.EDIT;
    let modelData = new CharacterTile();

    if (view == VIEW.EDIT) {
      modelData = {
        characterTileId: model.characterTileId,
        tileTypeId: model.tileTypeId,
        characterDashboardPageId: model.characterDashboardPageId,
        characterId: model.characterId,
        color: model.color ? model.color : '',
        bgColor: model.bgColor ? model.bgColor : '',
        shape: model.shape ? model.shape : 0,
        sortOrder: model.sortOrder ? model.sortOrder : 0,
        LocationX: model.LocationX ? model.LocationX : 0,
        LocationY: model.LocationY ? model.LocationY : 0,
        Height: model.Height ? model.Height : 144,
        Width: model.Width ? model.Width : 144,
        view: VIEW.EDIT,

        noteTile: model.noteTiles,
        counterTile: model.counterTiles,
        imageTile: model.imageTiles,
        textTile: model.textTiles,
        characterStatTile: model.characterStatTiles,
        linkTile: model.linkTiles,
        executeTile: model.executeTiles,
        commandTile: model.commandTiles,
        toggleTile: model.toggleTiles,
        multiCharacterStats: [],
        buffAndEffectTile: model.buffAndEffectTiles,
        characterStatClusterTile: model.characterStatClusterTiles,
        currencyTile: model.currencyTile
      };
    }
    else {

      modelData = {
        characterTileId: model.characterTileId ? model.characterTileId : 0,
        tileTypeId: model.tileTypeId ? model.tileTypeId : 0,
        characterDashboardPageId: pageId,
        characterId: characterId,
        color: model.color ? model.color : '',
        bgColor: model.bgColor ? model.bgColor : '',
        shape: model.shape ? model.shape : 0,
        sortOrder: model.sortOrder ? model.sortOrder : 0,
        LocationX: model.LocationX ? model.LocationX : 0,
        LocationY: model.LocationY ? model.LocationY : 0,
        Height: model.Height ? model.Height : 144,
        Width: model.Width ? model.Width : 144,
        view: VIEW.ADD,

        linkTile: null,
        noteTile: null,
        counterTile: null,
        imageTile: null,
        textTile: null,
        characterStatTile: null,
        executeTile: null,
        commandTile: null,
        toggleTile: null,
        characterStatClusterTile:null,
        multiCharacterStats: [],
        buffAndEffectTile: null,
        currencyTile: {
          currencyTypeTileId: model.currencyTypeTileId ? model.currencyTypeTileId : 0,
          characterTileId: 0,
          rulesetTileId:0,          
          showTitle: true,
          color: model.color ? model.color : '',
          bgColor: model.bgColor ? model.bgColor : '',
          shape: 0,
          bodyBgColor: pageDefaultData.bodyBgColor,
          bodyTextColor: pageDefaultData.bodyTextColor,
          titleBgColor: pageDefaultData.titleBgColor,
          titleTextColor: pageDefaultData.titleTextColor,
          sortOrder: model.sortOrder ? model.sortOrder : 0,
          view: VIEW.ADD,
          title: model.title ? model.title : '',
          characterCurrency: [],
          isManual: model.isManual ? model.isManual : false,
          fontSize: model.fontSize ? model.fontSize : 0,
          fontSizeTitle: model.fontSizeTitle ? model.fontSizeTitle : 0
        }
      };
    }

    return modelData;
  }

  saveCharacterCurrency<T>(model: any): Observable<T> {
    return this.http.post<T>(this.saveCharacterCurrencyApi, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createCurrencyTile(model));
      });
  }

}
