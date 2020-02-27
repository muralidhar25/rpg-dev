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
export class CharacterStatTileService extends EndpointFactory{

  private readonly createApi: string = this.configurations.baseUrl + "/api/CharatcerTile/create";
  private readonly updateApi: string = this.configurations.baseUrl + "/api/CharatcerTile/update";
  private readonly deleteApi: string = this.configurations.baseUrl + "/api/CharatcerTile/delete";
  private readonly rulesetCreateApi: string = this.configurations.baseUrl + "/api/RulesetTile/create";
  private readonly rulesetUpdateApi: string = this.configurations.baseUrl + "/api/RulesetTile/update";
  private readonly rulesetDeleteApi: string = this.configurations.baseUrl + "/api/RulesetTile/delete";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }
  createCharacterStatTile<T>(model: CharacterTile): Observable<T> {

    let endpoint = this.createApi;
    if (model.characterStatTile.characterStatTileId > 0)
      endpoint = this.updateApi;

    return this.http.post<T>(endpoint, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createCharacterStatTile(model));
      });
  }

  deleteCharacterStatTile<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteApi}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteCharacterStatTile(Id));
      });
  }

  public characterStatTileModelData(model: any, characterId: number, pageId: number, view: string, pageDefaultData: CharacterDashboardPage): any {
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
        executeTile: model.executeTile,
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
        view: view == 'add' ? VIEW.ADD : VIEW.EDIT,

        characterStatTile: {
          characterStatTileId: model.characterStatTileId ? model.characterStatTileId : 0,
          characterTileId: model.characterTileId ? model.characterTileId : 0,

          rulesetStatTileId: model.rulesetStatTileId ? model.rulesetStatTileId : 0,
          rulesetTileId: model.rulesetTileId ? model.rulesetTileId : 0,

          characterStatId: model.characterStatId,
          charactersCharacterStatId: model.charactersCharacterStatId,
          showTitle: true,
          color: model.color ? model.color : '',
          bgColor: model.bgColor ? model.bgColor : '',
          shape: 0,
          sortOrder: model.sortOrder ? model.sortOrder : 0,

          bodyBgColor: pageDefaultData.bodyBgColor,
          bodyTextColor: pageDefaultData.bodyTextColor,
          titleBgColor: pageDefaultData.titleBgColor,
          titleTextColor: pageDefaultData.titleTextColor,
          charactersCharacterStat: model.charactersCharacterStat,
          imageUrl: model.imageUrl,
          view: view == 'add' ? VIEW.ADD : VIEW.EDIT,
          displayLinkImage: true,
          isManual: model.isManual ? model.isManual : false,
          fontSize: model.fontSize ? model.fontSize : 0,
          fontSizeTitle: model.fontSizeTitle ? model.fontSizeTitle : 0
        },
        noteTile: null,
        imageTile: null,
        textTile: null,
        commandTile: null,
        linkTile: null,
        executeTile: null,
        counterTile: null,
        toggleTile: null,
        multiCharacterStats: [],
        buffAndEffectTile: null,
        characterStatClusterTile: null,
        currencyTile: null
      };
    }

    return modelData;
  }

  /**
   * Ruleset Tiles
   */

  createRulesetCharacterStatTile<T>(model: RulesetTile): Observable<T> {

    let endpoint = this.rulesetCreateApi;
    if (model.characterStatTile.characterStatTileId > 0)
      endpoint = this.updateApi;

    return this.http.post<T>(endpoint, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createRulesetCharacterStatTile(model));
      });
  }

  deleteRulesetCharacterStatTile<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.rulesetDeleteApi}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteRulesetCharacterStatTile(Id));
      });
  }

  public rulesetCharacterStatTileModelData(model: any, rulesetId: number, pageId: number, view: string, pageDefaultData: RulesetDashboardPage): any {
    view = view.toLowerCase() == 'add' ? VIEW.ADD : VIEW.EDIT;
    let modelData = new RulesetTile();

    if (view == VIEW.EDIT) {
      modelData = {
        rulesetTileId: model.rulesetTileId,
        tileTypeId: model.tileTypeId,
        rulesetDashboardPageId: model.rulesetDashboardPageId,
        rulesetId: model.rulesetId,
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
        executeTile: model.executeTile,
        commandTile: model.commandTiles,
        multiCharacterStats: [],
        buffAndEffectTile: model.buffAndEffectTiles,
        toggleTile: model.toggleTiles,
        characterStatClusterTile: model.characterStatClusterTiles
      };
    }
    else {
      modelData = {
        rulesetTileId: model.rulesetTileId ? model.rulesetTileId : 0,
        tileTypeId: model.tileTypeId ? model.tileTypeId : 0,
        rulesetDashboardPageId: pageId,
        rulesetId: rulesetId,
        color: model.color ? model.color : '',
        bgColor: model.bgColor ? model.bgColor : '',
        shape: model.shape ? model.shape : 0,
        sortOrder: model.sortOrder ? model.sortOrder : 0,

        LocationX: model.LocationX ? model.LocationX : 0,
        LocationY: model.LocationY ? model.LocationY : 0,
        Height: model.Height ? model.Height : 144,
        Width: model.Width ? model.Width : 144,
        view: view == 'add' ? VIEW.ADD : VIEW.EDIT,

        characterStatTile: {
          characterStatTileId: model.characterStatTileId ? model.characterStatTileId : 0,
          characterTileId: model.characterTileId ? model.characterTileId : 0,

          rulesetStatTileId: model.rulesetStatTileId ? model.rulesetStatTileId : 0,
          rulesetTileId: model.rulesetTileId ? model.rulesetTileId : 0,

          charactersCharacterStatId: model.charactersCharacterStatId,
          characterStatId: model.characterStatId,
          showTitle: true,
          color: model.color ? model.color : '',
          bgColor: model.bgColor ? model.bgColor : '',
          shape: 0,
          sortOrder: model.sortOrder ? model.sortOrder : 0,

          bodyBgColor: pageDefaultData.bodyBgColor,
          bodyTextColor: pageDefaultData.bodyTextColor,
          titleBgColor: pageDefaultData.titleBgColor,
          titleTextColor: pageDefaultData.titleTextColor,
          charactersCharacterStat: model.charactersCharacterStat,
          imageUrl: model.imageUrl,
          view: view == 'add' ? VIEW.ADD : VIEW.EDIT,
          displayLinkImage: false,
          isManual: model.isManual ? model.isManual : false,
          fontSize: model.fontSize ? model.fontSize : 0,
          fontSizeTitle: model.fontSizeTitle ? model.fontSizeTitle : 0
        },
        noteTile: null,
        imageTile: null,
        textTile: null,
        commandTile: null,
        linkTile: null,
        executeTile: null,
        counterTile: null,
        multiCharacterStats: [],
        buffAndEffectTile: null,
        toggleTile: null,
        characterStatClusterTile:null
      };
    }

    return modelData;
  }

}
