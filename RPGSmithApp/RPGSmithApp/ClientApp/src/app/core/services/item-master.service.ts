import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";

import { ItemMaster } from '../models/view-models/item-master.model';
import { VIEW } from '../models/enums';
import { Bundle } from '../models/view-models/bundle.model';

@Injectable()
export class ItemMasterService extends EndpointFactory {

  private itemMaster: ItemMaster;

  private readonly getAllUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getAll";
  private readonly getCountUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getItemsCount";
  private readonly getItemCountUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getCharacterItemCount";
  private readonly getLootCountUrl: string = this.configurations.baseUrl + "/api/ItemMaster/get_ItemMaster_and_Loot_Count";
  private readonly createUrl: string = this.configurations.baseUrl + "/api/ItemMaster/create";
  private readonly updateUrl: string = this.configurations.baseUrl + "/api/ItemMaster/update";
  private readonly createBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/create";
  private readonly updateBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/update";
  private readonly deleteUrl: string = this.configurations.baseUrl + "/api/ItemMaster/delete";
  private readonly deleteBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/delete_up";
  private readonly deleteMonsterItemUrl: string = this.configurations.baseUrl + "/api/ItemMaster/deleteMonsterItem";

  private readonly deleteUrl_up: string = this.configurations.baseUrl + "/api/ItemMaster/delete_up";
  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getById";
  private readonly getMonsterItemByIdUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getMonsterItemById";
  private readonly DeleteTemplates: string = this.configurations.baseUrl + "/api/ItemMaster/DeleteTemplates";

  private readonly getLootByIdUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getLootById";
  private readonly GetLootPile: string = this.configurations.baseUrl + "/api/ItemMaster/GetLootPile";

  private readonly getDetailByIdUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/getDetailById";
  private readonly getByRulesetUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getByRuleSetId";
  private readonly getByRulesetUrl_add: string = this.configurations.baseUrl + "/api/ItemMaster/getByRuleSetId_add";
  private readonly getByRulesetUrl_addItems: string = this.configurations.baseUrl + "/api/ItemMaster/getByRuleSetId_addItems";
  private readonly getByRulesetUrl_sp: string = this.configurations.baseUrl + "/api/ItemMaster/getByRuleSetId_sp";
  private readonly getAvailableContainerItemLootsUrl: string = this.configurations.baseUrl + "/api/ItemMaster/GetAvailableContainerItemLoots";
  private readonly getAvailableItemsUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getAvailableItemLoots";

  private readonly uploadUrl: string = this.configurations.baseUrl + "/api/ItemMaster/uploadItemTemplateImage";
  private readonly duplicateUrl: string = this.configurations.baseUrl + "/api/ItemMaster/DuplicateItemMaster";
  private readonly duplicateBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/DuplicateBundle";
  private readonly AbilitySpellForItemsByRuleset_sp: string = this.configurations.baseUrl + "/api/ItemMaster/AbilitySpellForItemsByRuleset_sp";
  private readonly AbilitySpellForLootsByRuleset_sp: string = this.configurations.baseUrl + "/api/ItemMaster/AbilitySpellForLootsByRuleset_sp";
  private readonly getByBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/getItemsByBundleId";

  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  private itemMasterData: any;
  private AddItemsData: any;
  private AddLootData: any;
  private itemMasterDetail: any[] = [];
  public LootDetail: any[] = [];
  public LootPileDetail: any[] = [];
  private ItemMasterBundleDetail: any[] = [];
  private ViewType: any;

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getAllItemMaster<T>(): Observable<T> {

    return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAllItemMaster());
      });
  }

  getItemMasterCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterCount(Id));
      });
  }

  getCharacterItemCount<T>(RuleSetId: number, CharacterId): Observable<T> {
    let endpointUrl = `${this.getItemCountUrl}?rulesetId=${RuleSetId}&characterId=${CharacterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterItemCount(RuleSetId, CharacterId));
      });
  }

  getLootItemCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getLootCountUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLootItemCount(Id));
      });
  }

  getItemMasterById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterById(Id));
      });
  }

  getItemMasterById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    let record = this.itemMasterDetail.findIndex(x => x.itemMasterId == Id);

    if (record > -1) {
      return Observable.of(this.itemMasterDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.itemMasterDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getItemMasterById(Id));
        });
    }
  }

  getMonsterItemById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getMonsterItemByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterItemById(Id));
      });
  }

  getlootById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getLootByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getlootById(Id));
      });
  }

  getlootById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getLootByIdUrl}?id=${Id}`;

    let record = this.LootDetail.findIndex(x => x.lootId == Id);

    if (record > -1) {
      return Observable.of(this.LootDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.LootDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getlootById(Id));
        });
    }
  }

  getBundleById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getDetailByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBundleById(Id));
      });
  }

  getBundleById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getDetailByIdUrl}?id=${Id}`;

    let record = this.ItemMasterBundleDetail.findIndex(x => x.bundleId == Id);

    if (record > -1) {
      return Observable.of(this.ItemMasterBundleDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.ItemMasterBundleDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getBundleById(Id));
        });
    }
  }

  getItemMasterByRuleset<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterByRuleset(Id));
      });
  }

  getItemMasterByRuleset_add<T>(Id: number, includeBundles: boolean = false, includeLootTemplates: boolean = false): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}&includeBundles=${includeBundles}&includeLootTemplates=${includeLootTemplates}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterByRuleset_add(Id));
      });
  }

  getItemMasterByRuleset_add_Cache<T>(Id: number, includeBundles: boolean = false, includeLootTemplates: boolean = false, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.AddLootData = null;
    }
    if (this.AddLootData != null) {
      return Observable.of(this.AddLootData);
    }
    else {
      let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}&includeBundles=${includeBundles}&includeLootTemplates=${includeLootTemplates}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(addLootInfo => this.AddLootData = addLootInfo)
        .catch(error => {
          return this.handleError(error, () => this.getItemMasterByRuleset_add(Id));
        });
    }
  }

  getItemMasterByRuleset_addItems<T>(Id: number, includeBundles: boolean = false, includeLootTemplates: boolean = false, characterId: number = 0): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_addItems}?rulesetId=${Id}&includeBundles=${includeBundles}&includeLootTemplates=${includeLootTemplates}&characterId=${characterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterByRuleset_add(Id));
      });
  }

  getItemMasterByRuleset_addItems_Cache<T>(Id: number, includeBundles: boolean = false, includeLootTemplates: boolean = false, characterId: number = 0, isFromCharacterDashboard: boolean = false): Observable<T> {
    if (isFromCharacterDashboard) {
      this.AddItemsData = null;
    }
    if (this.AddItemsData != null) {
      return Observable.of(this.AddItemsData);
    }
    else {
      let endpointUrl = `${this.getByRulesetUrl_addItems}?rulesetId=${Id}&includeBundles=${includeBundles}&includeLootTemplates=${includeLootTemplates}&characterId=${characterId}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(addItemsInfo => this.AddItemsData = addItemsInfo)
        .catch(error => {
          return this.handleError(error, () => this.getItemMasterByRuleset_add(Id));
        });
    }
  }

  getBundleItems<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByBundleUrl}?bundleId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBundleItems(Id));
      });
  }

  getItemMasterByRuleset_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_sp}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterByRuleset_sp(Id));
      });
  }

  getItemMasterByRuleset_spWithPagination<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterByRuleset_spWithPagination(Id, page, pageSize));
      });
  }

  getItemMasterByRuleset_spWithPagination_Cache<T>(Id: number, page: number, pageSize: number, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.itemMasterData = null;
    }
    if (this.itemMasterData != null) {
      return Observable.of(this.itemMasterData);
    }
    else {
      let endpointUrl = `${this.getByRulesetUrl_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(itemMasterInfo => this.itemMasterData = itemMasterInfo)
        .catch(error => {
          return this.handleError(error, () => this.getItemMasterByRuleset_spWithPagination(Id, page, pageSize));
        });
    }
  }

  createPageLastViewsItemMasterTemplate<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.itemMasterData != null) {
        this.itemMasterData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViewsItemMasterTemplate<T>(pageLastViews));
      });
  }

  getAvailableContainerItemLoots<T>(rulesetId: number, itemMasterId: number): Observable<T> {
    let endpointUrl = `${this.getAvailableContainerItemLootsUrl}?rulesetId=${rulesetId}&itemMasterId=${itemMasterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAvailableContainerItemLoots(rulesetId, itemMasterId));
      });
  }
  getAvailableItems<T>(rulesetId: number, itemMasterId: number, containerItemId: number): Observable<T> {
    let endpointUrl = `${this.getAvailableItemsUrl}?rulesetId=${rulesetId}&itemMasterId=${itemMasterId}&containerItemId=${containerItemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAvailableItems(rulesetId, itemMasterId, containerItemId));
      });
  }

  createItemMaster<T>(itemMaster: ItemMaster): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;
    let endpointUrl = this.createUrl;

    if (itemMaster.itemMasterId == 0 || itemMaster.itemMasterId === undefined)
      endpointUrl = this.createUrl;
    else {
      endpointUrl = this.updateUrl;

      if (this.itemMasterDetail && this.itemMasterDetail.length) {
        let record = this.itemMasterDetail.findIndex(x => x.itemMasterId == itemMaster.itemMasterId);
        if (record > -1) {
          this.itemMasterDetail.splice(record, 1);
        }
      }
    }
    return this.http.post(endpointUrl, JSON.stringify(itemMaster), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createItemMaster(itemMaster));
      });
  }
  createBundle<T>(bundle: Bundle): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;

    let endpointUrl = this.createBundleUrl;

    if (bundle.bundleId == 0 || bundle.bundleId === undefined)
      endpointUrl = this.createBundleUrl;
    else {
      endpointUrl = this.updateBundleUrl;

      if (this.ItemMasterBundleDetail && this.ItemMasterBundleDetail.length) {
        let record = this.ItemMasterBundleDetail.findIndex(x => x.bundleId == bundle.bundleId);
        if (record > -1) {
          this.ItemMasterBundleDetail.splice(record, 1);
        }
      }
    }

    return this.http.post(endpointUrl, JSON.stringify(bundle), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createBundle(bundle));
      });
  }

  duplicateItemMaster<T>(itemMaster: ItemMaster): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;
    //itemMaster.itemMasterId = 0;
    let endpointUrl = this.duplicateUrl;

    return this.http.post(endpointUrl, JSON.stringify(itemMaster), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateItemMaster(itemMaster));
      });
  }
  duplicateBundle<T>(itemMaster: ItemMaster): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;
    //itemMaster.itemMasterId = 0;
    let endpointUrl = this.duplicateBundleUrl;

    return this.http.post(endpointUrl, JSON.stringify(itemMaster), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateBundle(itemMaster));
      });
  }

  updateItemMaster<T>(itemMaster: ItemMaster): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;

    if (this.itemMasterDetail && this.itemMasterDetail.length) {
      let record = this.itemMasterDetail.findIndex(x => x.itemMasterId == itemMaster.itemMasterId);
      if (record > -1) {
        this.itemMasterDetail.splice(record, 1);
      }
    }

    return this.http.put<T>(this.updateUrl, JSON.stringify(itemMaster), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateItemMaster(itemMaster));
      });
  }

  deleteItemMaster<T>(Id: number): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteItemMaster(Id));
      });
  }
  deleteItemMaster_up<T>(itemMaster: ItemMaster): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;
    let endpointUrl = this.deleteUrl_up;// `${this.deleteUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(itemMaster), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteItemMaster_up(itemMaster));
      });
  }
  deleteBundle<T>(bundle: Bundle): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;
    let endpointUrl = this.deleteBundleUrl;// `${this.deleteBundleUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(bundle), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteBundle(bundle));
      });
  }
  deleteMonsterItem<T>(Id: number): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;
    let endpointUrl = `${this.deleteMonsterItemUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteMonsterItem(Id));
      });
  }
  fileUpload(fileToUpload: File) {
    return this.fileUploadMethod<any>(fileToUpload);
  }

  private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
    return this.fileUploadService.fileUpload<T>(this.uploadUrl, fileToUpload);
  }

  //bind form model
  public itemMasterModelData(_itemTemplateVM: any, _view: string): any {

    if (_itemTemplateVM == null) return { itemMasterId: 0, ruleSetId: 0 };
    let itemMasterFormModal: any;
    if (_view === 'DUPLICATE' || _view === 'UPDATE') {
      itemMasterFormModal = {
        itemMasterId: _itemTemplateVM.itemMasterId,
        ruleSetId: _itemTemplateVM.ruleSetId,
        itemName: _view === 'DUPLICATE' ? '' : _itemTemplateVM.itemName,
        itemImage: _itemTemplateVM.itemImage,
        itemStats: _itemTemplateVM.itemStats,
        itemVisibleDesc: _itemTemplateVM.itemVisibleDesc,
        gmOnly: _itemTemplateVM.gmOnly,
        command: _itemTemplateVM.command,
        commandName: _itemTemplateVM.commandName,
        //commandVM: _itemTemplateVM.commandVM,
        itemCalculation: _itemTemplateVM.itemCalculation,
        value: _itemTemplateVM.value,
        volume: _itemTemplateVM.volume,
        weight: _itemTemplateVM.weight,
        isContainer: _itemTemplateVM.isContainer,
        isMagical: _itemTemplateVM.isMagical,
        isConsumable: _itemTemplateVM.isConsumable,
        isEquipped: _itemTemplateVM.isEquipped,
        containerWeightMax: _itemTemplateVM.containerWeightMax,
        containerWeightModifier: _itemTemplateVM.containerWeightModifier == undefined || _itemTemplateVM.containerWeightModifier == null ? 'None' : _itemTemplateVM.containerWeightModifier,
        containerVolumeMax: _itemTemplateVM.containerVolumeMax,

        percentReduced: _itemTemplateVM.percentReduced,
        totalWeightWithContents: _itemTemplateVM.totalWeightWithContents,

        metatags: _itemTemplateVM.metatags == null ? '' : _itemTemplateVM.metatags,
        rarity: _itemTemplateVM.rarity,
        ruleSet: _itemTemplateVM.ruleSet,
        showIcon: false,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        itemMasterAbilityVM: _itemTemplateVM.itemMasterAbilityVM == undefined ? [] : _itemTemplateVM.itemMasterAbilityVM,
        itemMasterPlayerVM: _itemTemplateVM.itemMasterPlayerVM == undefined ? [] : _itemTemplateVM.itemMasterPlayerVM,
        itemMasterSpellVM: _itemTemplateVM.itemMasterSpellVM == undefined ? [] : _itemTemplateVM.itemMasterSpellVM,

        currencyLabel: _itemTemplateVM.ruleSet == undefined ? ''
          : _itemTemplateVM.ruleSet.currencyLabel == undefined || _itemTemplateVM.ruleSet.currencyLabel == null ? '' : '(' + _itemTemplateVM.ruleSet.currencyLabel + ')',
        weightLabel: _itemTemplateVM.ruleSet == undefined ? ''
          : _itemTemplateVM.ruleSet.weightLabel == undefined || _itemTemplateVM.ruleSet.weightLabel == null ? '' : '(' + _itemTemplateVM.ruleSet.weightLabel + ')',
        volumeLabel: _itemTemplateVM.ruleSet == undefined ? ''
          : _itemTemplateVM.ruleSet.volumeLabel == undefined || _itemTemplateVM.ruleSet.volumeLabel == null ? '' : '(' + _itemTemplateVM.ruleSet.volumeLabel + ')',

        itemMasterSpell: _itemTemplateVM.itemMasterSpell == null ? [] : _itemTemplateVM.itemMasterSpell,
        itemMasterAbilities: _itemTemplateVM.itemMasterAbilities == null ? [] : _itemTemplateVM.itemMasterAbilities,
        itemMasterBuffAndEffects: _itemTemplateVM.itemMasterBuffAndEffects == null ? [] : _itemTemplateVM.itemMasterBuffAndEffects,
        itemMasterCommand: _itemTemplateVM.itemMasterCommand == null ? [] : _itemTemplateVM.itemMasterCommand,
        //associate spell-ability changes

        itemMasterSpellId: _itemTemplateVM.itemMasterSpell == undefined ? 0 : _itemTemplateVM.itemMasterSpell.length > 0 ? _itemTemplateVM.itemMasterSpell[0].spellId : 0,
        itemMasterAbilityId: _itemTemplateVM.itemMasterAbilities == undefined ? 0 : _itemTemplateVM.itemMasterAbilities.length > 0 ? _itemTemplateVM.itemMasterAbilities[0].abilityId : 0,

        spellDetail: _itemTemplateVM.itemMasterSpell == undefined ? undefined : _itemTemplateVM.itemMasterSpell.length > 0 ? _itemTemplateVM.itemMasterSpell[0].spell : undefined,
        abilityDetail: _itemTemplateVM.itemMasterAbilities == undefined ? undefined : _itemTemplateVM.itemMasterAbilities.length > 0 ? _itemTemplateVM.itemMasterAbilities[0].abilitiy ? _itemTemplateVM.itemMasterAbilities[0].abilitiy : _itemTemplateVM.itemMasterAbilities[0].ability : undefined,

        lootId: _itemTemplateVM.lootId,
        monsterItemId: _itemTemplateVM.itemId,
        isShow: _itemTemplateVM.isShow,
        //containedIn: _itemTemplateVM.containedIn,
        //quantity: _itemTemplateVM.quantity,
        //isIdentified: _itemTemplateVM.isIdentified,
        //isVisible: _itemTemplateVM.isVisible,
        totalWeight: _itemTemplateVM.totalWeight,

        containerItemId: _itemTemplateVM.containedIn,
        containerId: _itemTemplateVM.containedIn,

        containerName: _itemTemplateVM.container == null || _itemTemplateVM.container == undefined ? '' : _itemTemplateVM.container.itemName,
        containerItems: _itemTemplateVM.containerItems == null || _itemTemplateVM.containerItems == undefined ? [] : _itemTemplateVM.containerItems,

        quantity: _itemTemplateVM.quantity == null || _itemTemplateVM.quantity == 0 ? 1 : _itemTemplateVM.quantity,

        isIdentified: _itemTemplateVM.isIdentified,
        isVisible: _itemTemplateVM.isVisible,
        container: _itemTemplateVM.container,
        itemMasterLootCurrency: _itemTemplateVM.itemMasterLootCurrency
      }
    }
    else {
      itemMasterFormModal = {
        itemMasterId: 0,
        ruleSetId: _itemTemplateVM.ruleSetId,
        showIcon: false,
        view: VIEW.ADD,
        rarity: 'Common',
        isMagical: false,
        isConsumable: false,
        isContainer: false,
        ruleSet: _itemTemplateVM.ruleSet,
        containerWeightModifier: 'None',
        itemMasterAbilityVM: [],
        itemMasterPlayerVM: [],
        itemMasterSpellVM: [],
        commandVM: [],

        currencyLabel: _itemTemplateVM.ruleSet == undefined ? ''
          : _itemTemplateVM.ruleSet.currencyLabel == undefined || _itemTemplateVM.ruleSet.currencyLabel == null ? '' : '(' + _itemTemplateVM.ruleSet.currencyLabel + ')',
        weightLabel: _itemTemplateVM.ruleSet == undefined ? ''
          : _itemTemplateVM.ruleSet.weightLabel == undefined || _itemTemplateVM.ruleSet.weightLabel == null ? '' : '(' + _itemTemplateVM.ruleSet.weightLabel + ')',
        volumeLabel: _itemTemplateVM.ruleSet == undefined ? ''
          : _itemTemplateVM.ruleSet.volumeLabel == undefined || _itemTemplateVM.ruleSet.volumeLabel == null ? '' : '(' + _itemTemplateVM.ruleSet.volumeLabel + ')',

        itemMasterSpell: [],
        itemMasterAbilities: [],
        itemMasterBuffAndEffects: [],
        itemMasterCommand: [],
        itemMasterSpellId: 0,
        itemMasterAbilityId: 0,
        metatags: '',

        commandName: 'Default',

        lootId: 0,
        monsterItemId: 0,
        isShow: false,
        containedIn: null,
        quantity: 1,
        isIdentified: false,
        isVisible: false,
        totalWeight: 0,
        contains: [],
        containerItems: [],
        itemMasterLootCurrency: _itemTemplateVM.itemMasterLootCurrency
      }
    }
    return itemMasterFormModal;
  }
  getAbilitySpellForItemsByRuleset_sp<T>(Id: number, ItemId: number): Observable<T> {
    let endpointUrl = `${this.AbilitySpellForItemsByRuleset_sp}?rulesetId=${Id}&itemMasterId=${ItemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilitySpellForItemsByRuleset_sp(Id, ItemId));
      });
  }
  getAbilitySpellForLootsByRuleset_sp<T>(Id: number, ItemId: number): Observable<T> {
    let endpointUrl = `${this.AbilitySpellForLootsByRuleset_sp}?rulesetId=${Id}&LootID=${ItemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilitySpellForItemsByRuleset_sp(Id, ItemId));
      });
  }
  public bundleModelData(_bundleTemplateVM: any, _view: string): any {

    if (_bundleTemplateVM == null) return { bundleId: 0, ruleSetId: 0 };

    let bundleFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {
      bundleFormModal = {
        bundleId: _bundleTemplateVM.bundleId,
        ruleSetId: _bundleTemplateVM.ruleSetId,
        bundleName: _view === 'DUPLICATE' ? '' : _bundleTemplateVM.bundleName,
        bundleImage: _bundleTemplateVM.bundleImage,
        bundleVisibleDesc: _bundleTemplateVM.bundleVisibleDesc,
        gmOnly: _bundleTemplateVM.gmOnly,
        value: _bundleTemplateVM.value,
        volume: _bundleTemplateVM.volume,
        totalWeight: _bundleTemplateVM.totalWeight,
        metatags: _bundleTemplateVM.metatags == null ? '' : _bundleTemplateVM.metatags,
        rarity: _bundleTemplateVM.rarity,
        ruleSet: _bundleTemplateVM.ruleSet,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,

        currencyLabel: _bundleTemplateVM.ruleSet == undefined ? ''
          : _bundleTemplateVM.ruleSet.currencyLabel == undefined || _bundleTemplateVM.ruleSet.currencyLabel == null ? '' : '(' + _bundleTemplateVM.ruleSet.currencyLabel + ')',
        weightLabel: _bundleTemplateVM.ruleSet == undefined ? ''
          : _bundleTemplateVM.ruleSet.weightLabel == undefined || _bundleTemplateVM.ruleSet.weightLabel == null ? '' : '(' + _bundleTemplateVM.ruleSet.weightLabel + ')',
        volumeLabel: _bundleTemplateVM.ruleSet == undefined ? ''
          : _bundleTemplateVM.ruleSet.volumeLabel == undefined || _bundleTemplateVM.ruleSet.volumeLabel == null ? '' : '(' + _bundleTemplateVM.ruleSet.volumeLabel + ')',

      }
    }
    else {
      bundleFormModal = {
        bundleId: 0,
        ruleSetId: _bundleTemplateVM.ruleSetId,
        view: VIEW.ADD,
        rarity: 'Common',
        ruleSet: _bundleTemplateVM.ruleSet,
        currencyLabel: _bundleTemplateVM.ruleSet == undefined ? ''
          : _bundleTemplateVM.ruleSet.currencyLabel == undefined || _bundleTemplateVM.ruleSet.currencyLabel == null ? '' : '(' + _bundleTemplateVM.ruleSet.currencyLabel + ')',
        weightLabel: _bundleTemplateVM.ruleSet == undefined ? ''
          : _bundleTemplateVM.ruleSet.weightLabel == undefined || _bundleTemplateVM.ruleSet.weightLabel == null ? '' : '(' + _bundleTemplateVM.ruleSet.weightLabel + ')',
        volumeLabel: _bundleTemplateVM.ruleSet == undefined ? ''
          : _bundleTemplateVM.ruleSet.volumeLabel == undefined || _bundleTemplateVM.ruleSet.volumeLabel == null ? '' : '(' + _bundleTemplateVM.ruleSet.volumeLabel + ')',

        metatags: '',
      }
    }
    return bundleFormModal;
  }

  deleteTemplates<T>(TemplatesList: any, rulesetId: number): Observable<T> {
    this.itemMasterData = null;
    this.AddItemsData = null;
    this.AddLootData = null;
    let endpointURL = `${this.DeleteTemplates}?rulesetId=${rulesetId}`;
    return this.http.post<T>(endpointURL, JSON.stringify(TemplatesList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteTemplates(TemplatesList, rulesetId));
      });
  }

  getLootPile<T>(lootPileId: number): Observable<T> {
    let endpointUrl = `${this.GetLootPile}?lootPileId=${lootPileId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLootPile(lootPileId));
      });
  }

  getLootPile_Cache<T>(lootPileId: number): Observable<T> {
    let endpointUrl = `${this.GetLootPile}?lootPileId=${lootPileId}`;

    let record = this.LootPileDetail.findIndex(x => x.lootId == lootPileId);

    if (record > -1) {
      return Observable.of(this.LootPileDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.LootPileDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getLootPile(lootPileId));
        });
    }
  }

}

