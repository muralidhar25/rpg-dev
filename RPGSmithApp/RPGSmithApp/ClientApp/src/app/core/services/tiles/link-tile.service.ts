import { Injectable, Injector } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { FileUploadService } from '../../common/file-upload.service';
import { EndpointFactory } from '../../../core/common/endpoint-factory.service';
import { LinkTile } from '../../models/tiles/link-tile.model';
import { CharacterTile } from '../../models/tiles/character-tile.model';
import { VIEW } from '../../models/enums';
import { CharacterDashboardPage } from '../../models/view-models/character-dashboard-page.model';

@Injectable()
export class LinkTileService extends EndpointFactory {

  private readonly createApi: string = this.configurations.baseUrl + "/api/CharatcerTile/create";
  private readonly updateApi: string = this.configurations.baseUrl + "/api/CharatcerTile/update";
  private readonly deleteApi: string = this.configurations.baseUrl + "/api/CharatcerTile/delete";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }
  createlinkTile<T>(model: CharacterTile): Observable<T> {
    let endpoint = this.createApi;
    if (model.linkTile.linkTileId > 0)
      endpoint = this.updateApi;

    return this.http.post<T>(endpoint, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createlinkTile(model));
      });
  }

  deletelinkTile<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteApi}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deletelinkTile(Id));
      });
  }

  public linkTileModelData(model: any, characterId: number, pageId: number, view: string, pageDefaultData: CharacterDashboardPage): any {

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

        linkTile: {
          linkTileId: model.linkTileId ? model.linkTileId : 0,
          characterTileId: 0,
          linkType: '',
          spellId: 0,
          abilityId: 0,
          itemId: 0,
          showTitle: true,
          displayLinkImage: true,
          color: model.color ? model.color : '',
          bgColor: model.bgColor ? model.bgColor : '',
          shape: 0,

          bodyBgColor: pageDefaultData.bodyBgColor,
          bodyTextColor: pageDefaultData.bodyTextColor,
          titleBgColor: pageDefaultData.titleBgColor,
          titleTextColor: pageDefaultData.titleTextColor,

          sortOrder: model.sortOrder ? model.sortOrder : 0,
          view: VIEW.ADD,
          multiAbilityIds: [],
          multiItemIds: [],
          multiSpellIds: [],
          buffAndEffectId:0,
          multiBuffAndEffectsIds: [],
          allyId: 0,
          multiAllyIds: [],
          isManual: model.isManual ? model.isManual : false,
          fontSize: model.fontSize ? model.fontSize : 0,
          fontSizeTitle: model.fontSizeTitle ? model.fontSizeTitle : 0
        },
        noteTile: null,
        counterTile: null,
        imageTile: null,
        textTile: null,
        characterStatTile: null,
        executeTile: null,
        commandTile: null,
        toggleTile: null,
        multiCharacterStats: [],
        buffAndEffectTile: null,
        characterStatClusterTile: null,
        currencyTile: null
      };
    }

    return modelData;
  }

}
