import { Injectable, Injector } from '@angular/core';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from '../common/file-upload.service';
import { Observable } from 'rxjs/Observable';
 

@Injectable()
export class LootService extends EndpointFactory {

  private readonly _getLootUrl: string = "/api/ItemMaster/GetItemMasterLoots";

  private readonly _getAddLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/AddItemMastersToLoot";

  private readonly _getCreateLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/CreateItemMasterLoot";

  private readonly _getUpdateLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/UpdateItemMasterLoot";

  private readonly _getDeleteLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/deleteLoot_up";

  private readonly _getDeleteAllLootUrl: string = this.configurations.baseUrl + "/api/ItemMaster/deleteAllLoot_up";

  private readonly _getGiveLootItemUrl: string = "/api/ItemMaster/giveItemsToCharacters";

  private readonly _getShowLootUrl: string = "/api/ItemMaster/ShowLoot";

  private readonly _getLootItemsForPlayersUrl: string = "/api/ItemMaster/GetLootItemsForPlayers";

  private readonly _lootItemsTakeByplayerUrl: string = "/api/item/addLootItems";

  private readonly _getItemMasterLootsForDeleteUrl: string = this.configurations.baseUrl + "/api/ItemMaster/GetItemMasterLootsForDelete";

  private readonly _getDuplicateLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/DuplicateLoot";


  get getLootUrl() { return this.configurations.baseUrl + this._getLootUrl; }

  get getGivelootItemUrl() { return this.configurations.baseUrl + this._getGiveLootItemUrl; }

  get getShowLootUrl() { return this.configurations.baseUrl + this._getShowLootUrl; }

  get getListItemsForPlayersUrl() { return this.configurations.baseUrl + this._getLootItemsForPlayersUrl;}

  get getLootItemsTakeByPlayerUrl() { return this.configurations.baseUrl + this._lootItemsTakeByplayerUrl;};


  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getLootItemsById<T>(Id: number,page: number,pageSize: number): Observable<T> {
    let endpointUrl = `${this.getLootUrl}?rulesetID=${Id}&page=${page}&pageSize=${pageSize}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLootItemsById(Id,page,pageSize));
      });
  }
  addLootItem<T>(item): Observable<T> {

    let endpointUrl = this._getAddLootItemUrl;
    
    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.addLootItem(item));
      });
  }

  createLootItem<T>(item): Observable<T> {

    let endpointUrl = this._getCreateLootItemUrl;
    if (item.lootId == 0 || item.lootId === undefined)
      endpointUrl = this._getCreateLootItemUrl;
    else
      endpointUrl = this._getUpdateLootItemUrl;
  
    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createLootItem(item));
      })
  }

  duplicateLootItem<T>(item): Observable<T> {
    let endpointUrl = this._getDuplicateLootItemUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateLootItem(item));
      })
  }
 
  giveItemTocharacter<T>(item, lootId): Observable<T> {
    let endpointUrl = `${this.getGivelootItemUrl}?lootId=${lootId}`;
    return this.http.post<T>(endpointUrl,JSON.stringify(item),this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.giveItemTocharacter(item, lootId));
      });
  }

  showLoot<T>(LootID, IsShow): Observable<T> {
   
    let endpointUrl = `${this.getShowLootUrl}?LootID=${LootID}&IsShow=${IsShow}`;
    return this.http.post<T>(endpointUrl,this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.showLoot(LootID,IsShow));
      });
  }

  getLootItemsForPlayers<T>(Id): Observable<T> {
    let endpointUrl = `${this.getListItemsForPlayersUrl}?rulesetId=${Id}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLootItemsForPlayers(Id));
      });
  }

  
  lootItemsTakeByplayer<T>(model): Observable<T> {
   
    let endpointUrl = `${this.getLootItemsTakeByPlayerUrl}`;

    return this.http.post<T>(endpointUrl,JSON.stringify(model),this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.lootItemsTakeByplayer(model));
      });
  }



  deleteAllLootItems<T>(model): Observable<T> {
    
    let endpointUrl = `${this._getDeleteAllLootUrl}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteAllLootItems(model));
      });
  }

  getItemMasterLootsForDelete<T>(Id): Observable<T> {
    let endpointUrl = `${this._getItemMasterLootsForDeleteUrl}?rulesetId=${Id}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterLootsForDelete(Id));
      });

  }

  deleteLootItem<T>(item): Observable<T> {
    let endpointUrl = this._getDeleteLootItemUrl;
    //console.log(item);
    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteLootItem(item));
      });
  }

}


