
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { FileUploadService } from '../../common/file-upload.service';
import { EndpointFactory } from '../../../core/common/endpoint-factory.service';
import { ImageTile } from '../../models/tiles/image-tile.model';
import { CharacterTile } from '../../models/tiles/character-tile.model';
import { VIEW } from '../../models/enums';
import { CharacterDashboardPage } from '../../models/view-models/character-dashboard-page.model';
import { RulesetTile } from '../../models/tiles/ruleset-tile.model';
import { RulesetDashboardPage } from '../../models/view-models/ruleset-dashboard-page.model';

@Injectable()
export class TextTileService extends EndpointFactory {

  private readonly createApi: string = this.configurations.baseUrl + "/api/CharatcerTile/create";
  private readonly updateApi: string = this.configurations.baseUrl + "/api/CharatcerTile/update";
  private readonly deleteApi: string = this.configurations.baseUrl + "/api/CharatcerTile/delete";
  private readonly rulesetCreateApi: string = this.configurations.baseUrl + "/api/RulesetTile/create";
  private readonly rulesetUpdateApi: string = this.configurations.baseUrl + "/api/RulesetTile/update";
  private readonly rulesetDeleteApi: string = this.configurations.baseUrl + "/api/RulesetTile/delete";

  //private readonly uploadUrl: string = "/api/Ability/upLoadAbilityImageBlob";
  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  createTextTile<T>(model: CharacterTile): Observable<T> {

    let endpoint = this.createApi;
    if (model.textTile.textTileId > 0)
      endpoint = this.updateApi;

    return this.http.post<T>(endpoint, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createTextTile(model));
      });
  }

  //deleteImageTile<T>(Id: number): Observable<T> {
  //    let endpointUrl = `${this.deleteApi}?id=${Id}`;

  //    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
  //        .catch(error => {
  //            return this.handleError(error, () => this.deleteImageTile(Id));
  //        });
  //}

  public textTileModelData(model: any, characterId: number, pageId: number, view: string, pageDefaultData: CharacterDashboardPage): any {

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
        multiCharacterStats: []
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

        textTile: {
          textTileId: model.textTileId ? model.textTileId : 0,
          characterTileId: model.characterTileId ? model.characterTileId : 0,
          rulesetTileId: model.rulesetTileId ? model.rulesetTileId : 0,
          title: '',
          text: model.text ? model.text : '',
          color: model.color ? model.color : '',
          bgColor: model.bgColor ? model.bgColor : '',
          shape: 0,

          bodyBgColor: pageDefaultData.bodyBgColor,
          bodyTextColor: pageDefaultData.bodyTextColor,
          titleBgColor: pageDefaultData.titleBgColor,
          titleTextColor: pageDefaultData.titleTextColor,

          sortOrder: model.sortOrder ? model.sortOrder : 0,
          view: view == 'add' ? VIEW.ADD : VIEW.EDIT
        },
        imageTile: null,
        noteTile: null,
        counterTile: null,
        linkTile: null,
        characterStatTile: null,
        executeTile: null,
        commandTile: null,
        multiCharacterStats: []
      };
    }
    return modelData;
  }

  /**
   * Ruleset tiles
   */

  createRulesetTextTile<T>(model: RulesetTile): Observable<T> {

    let endpoint = this.rulesetCreateApi;
    if (model.textTile.textTileId > 0)
      endpoint = this.rulesetUpdateApi;

    return this.http.post<T>(endpoint, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createRulesetTextTile(model));
      });
  }

  //deleteRulesetImageTile<T>(Id: number): Observable<T> {
  //    let endpointUrl = `${this.rulesetDeleteApi}?id=${Id}`;

  //    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
  //        .catch(error => {
  //            return this.handleError(error, () => this.deleteRulesetImageTile(Id));
  //        });
  //}

  //fileUpload(fileToUpload: File) {
  //    return this.fileUploadMethod<any>(fileToUpload);
  //}

  //private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
  //    return this.fileUploadService.fileUpload<T>(this.uploadUrl, fileToUpload);
  //}

  public textTileRulesetModelData(model: any, rulesetId: number, pageId: number, view: string, pageDefaultData: RulesetDashboardPage): any {

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
        multiCharacterStats: []
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

        textTile: {
          textTileId: model.textTileId ? model.textTileId : 0,
          characterTileId: model.characterTileId ? model.characterTileId : 0,
          rulesetTileId: model.rulesetTileId ? model.rulesetTileId : 0,
          title: '',
          text: model.text ? model.text : '',
          color: model.color ? model.color : '',
          bgColor: model.bgColor ? model.bgColor : '',
          shape: 0,

          bodyBgColor: pageDefaultData.bodyBgColor,
          bodyTextColor: pageDefaultData.bodyTextColor,
          titleBgColor: pageDefaultData.titleBgColor,
          titleTextColor: pageDefaultData.titleTextColor,

          sortOrder: model.sortOrder ? model.sortOrder : 0,
          view: view == 'add' ? VIEW.ADD : VIEW.EDIT
        },
        noteTile: null,
        imageTile: null,
        counterTile: null,
        linkTile: null,
        characterStatTile: null,
        executeTile: null,
        commandTile: null,
        multiCharacterStats: []
      };
    }
    return modelData;
  }

}
