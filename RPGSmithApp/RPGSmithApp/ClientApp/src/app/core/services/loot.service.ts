import { Injectable, Injector } from '@angular/core';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../common/configuration.service';
import { Observable } from 'rxjs/Observable';
import { ItemMasterService } from './item-master.service';
 

@Injectable()
export class LootService extends EndpointFactory {
  private readonly _getLootUrl: string = "/api/ItemMaster/GetItemMasterLoots";

  private readonly _getAddLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/AddItemMastersToLoot";

  private readonly _getCreateLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/CreateItemMasterLoot";

  private readonly _getUpdateLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/UpdateItemMasterLoot";

  private readonly _getDeleteLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/deleteLoot_up";

  private readonly _getDeleteAllLootUrl: string = this.configurations.baseUrl + "/api/ItemMaster/deleteAllLoot_up";

  private readonly _getGiveLootItemUrl: string = "/api/ItemMaster/giveItemsToCharacters";

  private readonly _getGiveLootItemToMonsterUrl: string = "/api/ItemMaster/giveItemsToMonster";

  private readonly _getShowLootUrl: string = "/api/ItemMaster/ShowLoot";

  private readonly _getLootItemsForPlayersUrl: string = "/api/ItemMaster/GetLootItemsForPlayers";

  private readonly _lootItemsTakeByplayerUrl: string = "/api/item/addLootItems";

  private readonly _getItemMasterLootsForDeleteUrl: string = this.configurations.baseUrl + "/api/ItemMaster/GetItemMasterLootsForDelete";

  private readonly _getDuplicateLootItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/DuplicateLoot";
  private readonly CreateLootPile: string = this.configurations.baseUrl + "/api/ItemMaster/CreateLootPile";

  private readonly UpdateLootPile: string = this.configurations.baseUrl + "/api/ItemMaster/EditLootPile";

  private readonly GetLootPileItemsToAdd: string = this.configurations.baseUrl + "/api/ItemMaster/GetLootPileItemsToAdd";

  private readonly ShowLootPile: string = this.configurations.baseUrl + "/api/ItemMaster/ShowLootPile";
  private readonly DuplicateLootPile: string = this.configurations.baseUrl + "/api/ItemMaster/DuplicateLootPile";
  private readonly MoveLoot: string = this.configurations.baseUrl + "/api/ItemMaster/MoveLoot";
  private readonly GetItemsFromLootPile: string = this.configurations.baseUrl + "/api/ItemMaster/GetItemsFromLootPile";
  private readonly CreateLootPileTemplate: string = this.configurations.baseUrl + "/api/LootPileTemplate/CreateLootTemplate";
  private readonly UpdateLootPileTemplate: string = this.configurations.baseUrl + "/api/LootPileTemplate/update";
  private readonly GetByRuleSetId_sp: string = this.configurations.baseUrl + "/api/LootPileTemplate/GetByRuleSetId_sp";
  private readonly DuplicateLootPileTemplate: string = this.configurations.baseUrl + "/api/LootPileTemplate/duplicate";
  private readonly GetById: string = this.configurations.baseUrl + "/api/LootPileTemplate/getById";
  private readonly DeleteLootPileTemplate: string = this.configurations.baseUrl + "/api/LootPileTemplate/delete_up";
  private readonly DeleteLootTemplates: string = this.configurations.baseUrl + "/api/LootPileTemplate/DeleteLootTemplates";
  private readonly DeployToLoot: string = this.configurations.baseUrl + "/api/ItemMaster/DeployLootTemplate";

  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  private lootData: any;
  private randomLootData: any;
  private PlayerLootData: any;
  private LootsForDelete: any;
  private LootTemplateDetail: any[] = [];
  private ViewType: any;

  get getLootUrl() { return this.configurations.baseUrl + this._getLootUrl; }

  get getGivelootItemUrl() { return this.configurations.baseUrl + this._getGiveLootItemUrl; }

  get getGivelootItemToMonsterUrl() { return this.configurations.baseUrl + this._getGiveLootItemToMonsterUrl; }

  get getShowLootUrl() { return this.configurations.baseUrl + this._getShowLootUrl; }

  get getListItemsForPlayersUrl() { return this.configurations.baseUrl + this._getLootItemsForPlayersUrl;}

  get getLootItemsTakeByPlayerUrl() { return this.configurations.baseUrl + this._lootItemsTakeByplayerUrl;};


  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector, private itemMasterService: ItemMasterService) {
    super(http, configurations, injector);
  }

  getLootItemsById<T>(Id: number,page: number,pageSize: number): Observable<T> {
    let endpointUrl = `${this.getLootUrl}?rulesetID=${Id}&page=${page}&pageSize=${pageSize}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLootItemsById(Id,page,pageSize));
      });
  }

  getLootItemsById_Cache<T>(Id: number, page: number, pageSize: number, isFromCampaign: boolean=false): Observable<T> {
    if (isFromCampaign) {
      this.lootData = null;
    }
    if (this.lootData != null) {
      return Observable.of(this.lootData);
    }
    else {
      let endpointUrl = `${this.getLootUrl}?rulesetID=${Id}&page=${page}&pageSize=${pageSize}`;
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(lootInfo => this.lootData = lootInfo)
        .catch(error => {
          return this.handleError(error, () => this.getLootItemsById(Id, page, pageSize));
        });
    }
  }

  createPageLastViewsLoot<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.lootData != null) {
        this.lootData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViewsLoot<T>(pageLastViews));
      });
  }

  addLootItem<T>(item, lootTemplate, rulesetId: number, selectedLootPileId: number, isVisible: boolean, selectedLootItems, itemMasterLootCurrency?): Observable<T> {
    this.lootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this._getAddLootItemUrl}?rulesetID=${rulesetId}&selectedLootPileId=${selectedLootPileId}&isVisible=${isVisible}`;
    
    return this.http.post<T>(endpointUrl, JSON.stringify({ lootItemsToAdd: item, lootTemplatesToAdd: lootTemplate, lootItemsToLink: selectedLootItems, itemMasterLootCurrency: itemMasterLootCurrency }), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.addLootItem(item, lootTemplate, rulesetId, selectedLootPileId, isVisible, selectedLootItems));
      });
  }

  createLootItem<T>(item): Observable<T> {
    this.lootData = null;
    this.LootsForDelete = null;
    let endpointUrl = this._getCreateLootItemUrl;
    if (item.lootId == 0 || item.lootId === undefined)
      endpointUrl = this._getCreateLootItemUrl;
    else {
      endpointUrl = this._getUpdateLootItemUrl;

      if (this.itemMasterService.LootDetail && this.itemMasterService.LootDetail.length) {
        let record = this.itemMasterService.LootDetail.findIndex(x => x.lootId == item.lootId);
        if (record > -1) {
          this.itemMasterService.LootDetail.splice(record, 1);
        }
      }
    }
  
    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createLootItem(item));
      })
  }

  duplicateLootItem<T>(item): Observable<T> {
    this.lootData = null;
    this.LootsForDelete = null;
    let endpointUrl = this._getDuplicateLootItemUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateLootItem(item));
      })
  }
 
  giveItemTocharacter<T>(item, lootId): Observable<T> {
    this.lootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.getGivelootItemUrl}?lootId=${lootId}`;
    return this.http.post<T>(endpointUrl,JSON.stringify(item),this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.giveItemTocharacter(item, lootId));
      });
  }
 
  giveItemToMonster<T>(monsterID, lootIds): Observable<T> {
    this.lootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.getGivelootItemToMonsterUrl}`;
    return this.http.post<T>(endpointUrl, JSON.stringify({ monsterId: monsterID, multiLootIds: lootIds}),this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.giveItemTocharacter(monsterID, lootIds));
      });
  }

  showLoot<T>(LootID, IsShow): Observable<T> {
    this.lootData = null;
    this.LootsForDelete = null;
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

  getLootItemsForPlayers_Cache<T>(Id, isFromCharacterDashboard: boolean = false): Observable<T> {
    if (isFromCharacterDashboard) {
      this.PlayerLootData = null;
    }
    if (this.PlayerLootData != null) {
      return Observable.of(this.PlayerLootData);
    }
    else {
      let endpointUrl = `${this.getListItemsForPlayersUrl}?rulesetId=${Id}`;
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(playerLoot => this.PlayerLootData = playerLoot)
        .catch(error => {
          return this.handleError(error, () => this.getLootItemsForPlayers(Id));
        });
    }
  }

  createPageLastViews_CharacterLoot<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.PlayerLootData != null) {
        this.PlayerLootData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews_CharacterLoot<T>(pageLastViews));
      });
  }


  lootItemsTakeByplayer<T>(model, isTake = false, isTakeAll = false, isTakeFromPopup = false, isGiven = false): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.getLootItemsTakeByPlayerUrl}?isTake=${isTake}&isTakeAll=${isTakeAll}&isTakeFromPopup=${isTakeFromPopup}&isGiven=${isGiven}`;

    return this.http.post<T>(endpointUrl,JSON.stringify(model),this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.lootItemsTakeByplayer(model, isTake, isTakeAll));
      });
  }

  deleteAllLootItems<T>(model): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this._getDeleteAllLootUrl}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteAllLootItems(model));
      });
  }

  getItemMasterLootsForDelete<T>(Id): Observable<T> {
    this.lootData = null;
    let endpointUrl = `${this._getItemMasterLootsForDeleteUrl}?rulesetId=${Id}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterLootsForDelete(Id));
      });

  }

  getItemMasterLootsForDelete_Cache<T>(Id, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.LootsForDelete = null;
    }
    if (this.LootsForDelete != null) {
      return Observable.of(this.LootsForDelete);
    }
    else {
    this.lootData = null;
      let endpointUrl = `${this._getItemMasterLootsForDeleteUrl}?rulesetId=${Id}`;
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(lootForDelete => this.LootsForDelete = lootForDelete)
        .catch(error => {
          return this.handleError(error, () => this.getItemMasterLootsForDelete(Id));
        });
    }

  }

  deleteLootItem<T>(item): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = this._getDeleteLootItemUrl;
    
    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteLootItem(item));
      });
  }

  createLootPile<T>(lootPile): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = this.CreateLootPile;
    if (lootPile.lootId == 0 || lootPile.lootId === undefined)
      endpointUrl = this.CreateLootPile;
    else {
      endpointUrl = this.UpdateLootPile;

      if (this.itemMasterService.LootPileDetail && this.itemMasterService.LootPileDetail.length) {
        let record = this.itemMasterService.LootPileDetail.findIndex(x => x.lootId == lootPile.lootId);
        if (record > -1) {
          this.itemMasterService.LootPileDetail.splice(record, 1);
        }
      }
    }


    //let endpointUrl = `${this.CreateLootPile}`;
    return this.http.post<T>(endpointUrl, JSON.stringify(lootPile), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createLootPile(lootPile));
      })
  }

  getLootPileItemsToAdd<T>(ruleSetId: number): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.GetLootPileItemsToAdd}?rulesetID=${ruleSetId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLootPileItemsToAdd(ruleSetId));
      });
  }

  showLootPile<T>(LootPileID, IsVisible): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.ShowLootPile}?LootPileID=${LootPileID}&IsVisible=${IsVisible}`;
    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.showLootPile(LootPileID, IsVisible));
      });
  }

  duplicateLootPile<T>(item): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = this.DuplicateLootPile;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateLootPile(item));
      })
  }

  moveLoot<T>(items, lootPileId): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.MoveLoot}?LootPileID=${lootPileId}`;
    return this.http.post<T>(endpointUrl, JSON.stringify(items), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.moveLoot(items, lootPileId));
      });
  }

  getItemsFromLootPile<T>(lootPileId: number): Observable<T> {

    let endpointUrl = `${this.GetItemsFromLootPile}?lootPileId=${lootPileId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemsFromLootPile(lootPileId));
      });
  }

  createLootPileTemplate<T>(lootPile): Observable<T> {
    this.randomLootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = this.CreateLootPileTemplate;
    if (lootPile.lootTemplateId == 0 || lootPile.lootTemplateId === undefined)
      endpointUrl = this.CreateLootPileTemplate;
    else {
      endpointUrl = this.UpdateLootPileTemplate;
      
      if (this.LootTemplateDetail && this.LootTemplateDetail.length) {
        let record = this.LootTemplateDetail.findIndex(x => x.lootTemplateId == lootPile.lootTemplateId);
        if (record > -1) {
          this.LootTemplateDetail.splice(record, 1);
        }
      }
    }


    //let endpointUrl = `${this.CreateLootPile}`;
    return this.http.post<T>(endpointUrl, JSON.stringify(lootPile), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createLootPileTemplate(lootPile));
      })
  }

  getByRuleSetId_sp<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.GetByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getByRuleSetId_sp(Id, page, pageSize));
      });
  }

  getByRuleSetId_sp_Cache<T>(Id: number, page: number, pageSize: number, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.randomLootData = null;
    }
    if (this.randomLootData != null) {
      return Observable.of(this.randomLootData);
    }
    else {
      let endpointUrl = `${this.GetByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(lootInfo => this.randomLootData = lootInfo)
        .catch(error => {
          return this.handleError(error, () => this.getByRuleSetId_sp(Id, page, pageSize));
        });
    }
  }

  createPageLastViewsRandomLoot<T>(pageLastViews: any): Observable<T> {
    debugger
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      debugger
      this.ViewType = data;
      if (this.randomLootData != null) {
        this.randomLootData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViewsRandomLoot<T>(pageLastViews));
      });
  }

  duplicateLootPileTemplate<T>(item): Observable<T> {
    this.randomLootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = this.DuplicateLootPileTemplate;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateLootPileTemplate(item));
      })
  }

  deleteLootPileTemplate<T>(Id): Observable<T> {
    this.randomLootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.DeleteLootPileTemplate}?LootTemplateId=${Id}`;
    return this.http.post<T>(endpointUrl, JSON.stringify(Id), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteLootPileTemplate(Id));
      });
  }

  getTemplateDetailById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.GetById}?LootTemplateId=${Id}`;
    
      return this.http.get<T>(endpointUrl, this.getRequestHeaders())
        .catch(error => {
          return this.handleError(error, () => this.getTemplateDetailById(Id));
        });
  }

  getTemplateDetailById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.GetById}?LootTemplateId=${Id}`;
    
    let record = this.LootTemplateDetail.findIndex(x => x.lootTemplateId == Id);

    if (record > -1) {
      return Observable.of(this.LootTemplateDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.LootTemplateDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getTemplateDetailById(Id));
        });
    }
  }

  deleteLootTemplates<T>(TemplateList, Id): Observable<T> {
    this.randomLootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.DeleteLootTemplates}?LootTemplateId=${Id}`;
    return this.http.post<T>(endpointUrl, JSON.stringify(TemplateList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteLootTemplates(TemplateList, Id));
      });
  }

  deployToLoot<T>(itemList): Observable<T> {
    this.lootData = null;
    this.PlayerLootData = null;
    this.LootsForDelete = null;
    let endpointUrl = `${this.DeployToLoot}`;
    return this.http.post<T>(endpointUrl, JSON.stringify(itemList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deployToLoot(itemList));
      });
  }

}


