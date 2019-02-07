import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { FileUploadService } from '../../common/file-upload.service';
import { EndpointFactory } from '../../../core/common/endpoint-factory.service';
import { ExecuteTile } from '../../models/tiles/execute-tile.model';
import { CharacterTile } from '../../models/tiles/character-tile.model';
import { VIEW } from '../../models/enums';
import { CharacterDashboardPage } from '../../models/view-models/character-dashboard-page.model';

@Injectable()
export class ExecuteTileService extends EndpointFactory {

    private readonly createApi: string = this.configurations.baseUrl + "/api/CharatcerTile/create";
    private readonly updateApi: string = this.configurations.baseUrl + "/api/CharatcerTile/update";
    private readonly deleteApi: string = this.configurations.baseUrl + "/api/CharatcerTile/delete";

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
        private fileUploadService: FileUploadService) {
        super(http, configurations, injector);
    }
    createExecuteTile<T>(model: CharacterTile): Observable<T> {

        let endpoint = this.createApi;
        if (model.executeTile.executeTileId > 0)
            endpoint = this.updateApi;

        return this.http.post<T>(endpoint, JSON.stringify(model), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.createExecuteTile(model));
            });
    }

    deleteExecuteTile<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.deleteApi}?id=${Id}`;

        return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.deleteExecuteTile(Id));
            });
    }

    public executeTileModelData(model: any, characterId: number, pageId: number, view: string, pageDefaultData: CharacterDashboardPage): any {

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

                executeTile: {
                    executeTileId: model.executeTileId ? model.executeTileId : 0,
                    characterTileId: 0,
                    linkType: '',
                    spellId: 0,
                    abilityId: 0,
                    itemId: 0,
                    commandId: 0,
                    showTitle: true,
                    color: model.color ? model.color : '',
                    bgColor: model.bgColor ? model.bgColor : '',
                    shape: 0,

                    bodyBgColor: pageDefaultData.bodyBgColor,
                    bodyTextColor: pageDefaultData.bodyTextColor,
                    titleBgColor: pageDefaultData.titleBgColor,
                    titleTextColor: pageDefaultData.titleTextColor,

                    sortOrder: model.sortOrder ? model.sortOrder : 0,
                    view: view == 'add' ? VIEW.ADD : VIEW.EDIT,
                    multiAbilityIds: [],
                    multiItemIds: [],
                    multiSpellIds: []
                },
                noteTile: null,
                counterTile: null,
                imageTile: null,
                textTile: null,
                characterStatTile: null,
                linkTile: null,
                commandTile: null,
                multiCharacterStats: []
            };
        }
        return modelData;
    }

}
