import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";

import { VIEW } from '../models/enums';
import { Items } from '../models/view-models/items.model';

@Injectable()
export class ItemsService extends EndpointFactory {
  GetCharacterAbilityID(RulesetAbilityId: number): any {
    throw new Error("Method not implemented.");
  }
  GetCharacterSpellID(RulesetSpellID: number): any {
    throw new Error("Method not implemented.");
  }

  private readonly getAllUrl: string = this.configurations.baseUrl + "/api/Item/getall";
  private readonly getCountUrl: string = this.configurations.baseUrl + "/api/Item/getCountByCharacterId";
  private readonly addUrl: string = this.configurations.baseUrl + "/api/Item/add";
  private readonly resetUrl: string = this.configurations.baseUrl + "/api/Item/reset";
  private readonly createUrl: string = this.configurations.baseUrl + "/api/Item/create";
  private readonly updateUrl: string = this.configurations.baseUrl + "/api/Item/update";
  private readonly updateMonsterUrl: string = this.configurations.baseUrl + "/api/Item/updateMonster";
  
  private readonly deleteUrl: string = this.configurations.baseUrl + "/api/Item/delete";
  private readonly deleteUrl_up: string = this.configurations.baseUrl + "/api/Item/delete_up";
  private readonly GetNestedContainerItems_url: string = this.configurations.baseUrl + "/api/Item/GetNestedContainerItems";
  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/Item/GetById";
  private readonly getByCharacterIdUrl: string = this.configurations.baseUrl + "/api/Item/getByCharacterId";
  private readonly getItemByCharacterIdUrl: string = this.configurations.baseUrl + "/api/Item/getItemByCharacterId";
  private readonly getAvailableContainerItemsUrl: string = this.configurations.baseUrl + "/api/Item/getAvailableContainerItems";
  private readonly getAvailableMonsterContainerItemsUrl: string = this.configurations.baseUrl + "/api/Item/getAvailableMonsterContainerItems";
  
  private readonly getAvailableItemsUrl: string = this.configurations.baseUrl + "/api/Item/GetAvailableItems";
  private readonly toggleEquippedUrl: string = this.configurations.baseUrl + "/api/Item/toggleEquippedItem";
  private readonly toggle_Show_Hide_Item_Url: string = this.configurations.baseUrl + "/api/Item/Toggle_Show_Hide_Item";
  private readonly duplicateUrl: string = this.configurations.baseUrl + "/api/Item/DuplicateItem";
  private readonly uploadUrl: string = this.configurations.baseUrl + "/api/Item/uploadItemImage";

  private readonly getByCharacterId_api: string = this.configurations.baseUrl + "/api/Item/getByCharacterId_sp";
  private readonly getAbilitySpellForItems_api: string = this.configurations.baseUrl + "/api/Item/AbilitySpellForItemsByRuleset_sp";
  private readonly getItemCommands_api: string = this.configurations.baseUrl + "/api/Item/getItemCommands_sp";
  private readonly reduceItemQty: string = this.configurations.baseUrl + "/api/Item/ReduceItemQty";
  private readonly givePlayerItems: string = this.configurations.baseUrl + "/api/Item/GivePlayerItems";

  private readonly GetCharSpellIDUrl: string = this.configurations.baseUrl + "/api/Item/GetCharSpellIDUrl";
  private readonly GetCharAbilityIDUrl: string = this.configurations.baseUrl + "/api/Item/GetCharAbilityIDUrl";
  private readonly DropMultipleItems: string = this.configurations.baseUrl + "/api/Item/DropMultipleItems";
  private readonly DropMultipleItemsWithCurrencyApi: string = this.configurations.baseUrl + "/api/Item/DropMultipleItemsWithCurrency";
  private readonly GetLootPilesListByCharacterId: string = this.configurations.baseUrl + "/api/ItemMaster/GetLootPilesListByCharacterId";
  private readonly GetLootPilesListByRuleSetId: string = this.configurations.baseUrl + "/api/ItemMaster/GetLootPilesListByRuleSetId";

  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  private inventoryData: any;
  private LootPilesListData: any;
  private addLootPileList: any;
  private CharacterItemDetail: any[] = [];
  private ViewType: any;


  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getItemCommands_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getItemCommands_api}?itemId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemCommands_sp(Id));
      });
  }

  getItems<T>(): Observable<T> {

    return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItems());
      });
  }

  getAbilitySpellForItems_sp<T>(characterId: number, rulesetId: number, itemId: number): Observable<T> {
    let endpointUrl = `${this.getAbilitySpellForItems_api}?characterId=${characterId}&rulesetId=${rulesetId}&itemId=${itemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilitySpellForItems_sp(characterId, rulesetId, itemId));
      });
  }

  getItemsCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemsCount(Id));
      });
  }

  getItemById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemById(Id));
      });
  }

  getItemById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    let record = this.CharacterItemDetail.findIndex(x => x.itemId == Id);
    if (record > -1) {
      return Observable.of(this.CharacterItemDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.CharacterItemDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getItemById(Id));
        });
    }
  }

  getItemsByCharacterId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterIdUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemsByCharacterId(Id));
      });
  }

  getItemByCharacterId<T>(Id: number): Observable<T> { //No Circular reference data
    let endpointUrl = `${this.getItemByCharacterIdUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemByCharacterId(Id));
      });
  }

  getItemsByCharacterId_sp<T>(characterId: number, rulesetId: number, page: number, pageSize: number, sortType: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterId_api}?characterId=${characterId}&rulesetId=${rulesetId}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemsByCharacterId_sp(characterId, rulesetId, page, pageSize, sortType));
      });
  }

  getItemsByCharacterId_sp_Cache<T>(characterId: number, rulesetId: number, page: number, pageSize: number, sortType: number, isFromCharacterDashboard: boolean = false): Observable<T> {
    if (isFromCharacterDashboard) {
      this.inventoryData = null;
    }
    if (this.inventoryData != null) {
      return Observable.of(this.inventoryData);
    }
    else {
      let endpointUrl = `${this.getByCharacterId_api}?characterId=${characterId}&rulesetId=${rulesetId}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(inventoryInfo => this.inventoryData = inventoryInfo)
        .catch(error => {
          return this.handleError(error, () => this.getItemsByCharacterId_sp(characterId, rulesetId, page, pageSize, sortType));
        });
    }
  }

  createPageLastViews<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.inventoryData != null) {
        this.inventoryData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews<T>(pageLastViews));
      });
  }

  getAvailableContainerItems<T>(characterId: number, itemId: number): Observable<T> {
    let endpointUrl = `${this.getAvailableContainerItemsUrl}?characterId=${characterId}&itemId=${itemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAvailableContainerItems(characterId, itemId));
      });
  }
  getAvailableMonsterContainerItems<T>(rulesetId: number, itemId: number): Observable<T> {
    let endpointUrl = `${this.getAvailableMonsterContainerItemsUrl}?rulesetId=${rulesetId}&itemId=${itemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAvailableMonsterContainerItems(rulesetId, itemId));
      });
  }
  GetCharSpellID<T>(RulesetSpellID: number, characterId: number): Observable<T> {
    let endpointUrl = `${this.GetCharSpellIDUrl}?RulesetSpellID=${RulesetSpellID}&characterId=${characterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.GetCharSpellID(RulesetSpellID, characterId));
      });
  }
  GetCharAbilityID<T>(RulesetAbilityID: number, characterId: number): Observable<T> {
    let endpointUrl = `${this.GetCharAbilityIDUrl}?RulesetAbilityID=${RulesetAbilityID}&characterId=${characterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.GetCharAbilityID(RulesetAbilityID, characterId));
      });
  }

  /*To get those items which are not contained yet.*/
  getAvailableItems<T>(characterId: number, itemId: number, containerItemId: number): Observable<T> {
    let endpointUrl = `${this.getAvailableItemsUrl}?characterId=${characterId}&itemId=${itemId}&containerItemId=${containerItemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAvailableItems(characterId, itemId, containerItemId));
      });
  }
  GetNestedContainerItems<T>(itemId: number): Observable<T> {
    let endpointUrl = `${this.GetNestedContainerItems_url}?itemid=${itemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.GetNestedContainerItems(itemId));
      });
  }

  addItem<T>(item: Items): Observable<T> {

    this.inventoryData = null;
    let endpointUrl = this.addUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.addItem(item));
      });
  }

  resetItemToOriginal<T>(item: Items): Observable<T> {

    this.inventoryData = null;
    return this.http.post<T>(this.resetUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.resetItemToOriginal(item));
      });
  }

  createItem<T>(item: Items): Observable<T> {
    this.inventoryData = null;
    let endpointUrl = this.createUrl;

    if (item.itemId == 0 || item.itemId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createItem(item));
      });
  }

  duplicateItem<T>(item: Items): Observable<T> {
    this.inventoryData = null;
    //Item.itemId = 0;
    let endpointUrl = this.duplicateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateItem(item));
      });
  }

  updateItem<T>(item: Items): Observable<T> {
    this.inventoryData = null;

    return this.http.post<T>(this.updateUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateItem(item));
      });
  }
  updateMonsterItem<T>(item: any): Observable<T> {
    this.inventoryData = null;

    if (this.CharacterItemDetail && this.CharacterItemDetail.length) {
      let record = this.CharacterItemDetail.findIndex(x => x.itemId == item.itemId);
      if (record > -1) {
        this.CharacterItemDetail.splice(record, 1);
      }
    }

    return this.http.post<T>(this.updateMonsterUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateMonsterItem(item));
      });
  }

  deleteItem<T>(Id: number): Observable<T> {
    this.inventoryData = null;
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteItem(Id));
      });
  }
  deleteItem_up<T>(item: Items, itemsList: any): Observable<T> {
    this.inventoryData = null;
    let endpointUrl = this.deleteUrl_up;//`${this.deleteUrl}?id=${Id}`;
    let model = { item: item, ContainedItemsList: itemsList };
    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteItem_up(item, itemsList));
      });
  }
  toggleEquippedItem<T>(Id: number): Observable<T> {
    this.inventoryData = null;
    let endpointUrl = `${this.toggleEquippedUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.toggleEquippedItem(Id));
      });
  }
  toggle_Show_Hide_Item<T>(Id: number): Observable<T> {
    this.inventoryData = null;
    let endpointUrl = `${this.toggle_Show_Hide_Item_Url}?id=${Id}`;

    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.toggleEquippedItem(Id));
      });
  }

  fileUpload(fileToUpload: File) {
    return this.fileUploadMethod<any>(fileToUpload);
  }

  private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
    return this.fileUploadService.fileUpload<T>(this.uploadUrl, fileToUpload);
  }

  //bind form model
  public itemModelData(_itemVM: any, _view: string): any {

    if (_itemVM == null) return {
      itemId: 0,
      ruleSetId: 0,
      characterId: 0,
      itemMasterId: 0,
      showUse: false
    };

    let itemFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {
      itemFormModal = {
        itemId: _itemVM.itemId,
        name: _view === 'DUPLICATE' ? '' : _itemVM.name,
        description: _itemVM.description,
        gmOnly: _itemVM.gmOnly,
        itemImage: _itemVM.itemImage,
        isEquipped: _itemVM.isEquipped,
        isIdentified: _itemVM.isIdentified,
        isVisible: _itemVM.isVisible,
        quantity: _itemVM.quantity,
        totalWeight: _itemVM.totalWeight,

        command: _itemVM.command,
        commandName: _itemVM.commandName,
        showUse: _itemVM.command == null || _itemVM.command == undefined || _itemVM.command == '' ? false : true,
        itemCommandVM: _itemVM.itemCommandVM == undefined ? [] : _itemVM.itemCommandVM,

        isConsumable: _itemVM.isConsumable,
        isMagical: _itemVM.isMagical,
        itemCalculation: _itemVM.itemCalculation,
        metatags: _itemVM.metatags,
        rarity: _itemVM.rarity,
        value: _itemVM.value,
        volume: _itemVM.volume,
        weight: _itemVM.weight,

        itemStats: _itemVM.itemStats,
        containerWeightMax: _itemVM.containerWeightMax,
        containerVolumeMax: _itemVM.containerVolumeMax,
        percentReduced: _itemVM.percentReduced,
        totalWeightWithContents: _itemVM.totalWeightWithContents,
        containerWeightModifier: _itemVM.containerWeightModifier == undefined || _itemVM.containerWeightModifier == null ? 'None' : _itemVM.containerWeightModifier,

        isContainer: _itemVM.isContainer,
        containedIn: _itemVM.containedIn,
        container: _itemVM.container,
        containerName: _itemVM.container == null || _itemVM.container == undefined ? '' : _itemVM.container.name,
        containerItemId: _itemVM.containedIn,
        containerItems: _itemVM.containerItems == null || _itemVM.containerItems == undefined
          ? [] : _view === 'DUPLICATE' ? [] : _itemVM.containerItems,

        parentItemId: _itemVM.parentItemId,
        isDeleted: _itemVM.isDeleted,
        character: _itemVM.character,
        characterId: _itemVM.characterId,

        ruleSet: _itemVM.ruleSet == null || _itemVM.ruleSet == undefined ? {} : _itemVM.ruleSet,

        currencyLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.currencyLabel == undefined || _itemVM.ruleSet.currencyLabel == null ? '' : '(' + _itemVM.ruleSet.currencyLabel + ')',
        weightLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.weightLabel == undefined || _itemVM.ruleSet.weightLabel == null ? '' : '(' + _itemVM.ruleSet.weightLabel + ')',
        volumeLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.volumeLabel == undefined || _itemVM.ruleSet.volumeLabel == null ? '' : '(' + _itemVM.ruleSet.volumeLabel + ')',

        itemMaster: _itemVM.itemMaster,
        itemMasterId: _itemVM.itemMasterId,

        itemAbilities: _itemVM.itemAbilities == null || _itemVM.itemAbilities == undefined ? [] : _itemVM.itemAbilities,
        itemSpells: _itemVM.itemSpells == null || _itemVM.itemSpells == undefined ? [] : _itemVM.itemSpells,
        itemBuffAndEffects: _itemVM.itemBuffAndEffects == null || _itemVM.itemBuffAndEffects == undefined ? [] : _itemVM.itemBuffAndEffects,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,

        characterCurrency: _itemVM.currencyList
      }
    }
    else {
      itemFormModal = {
        itemId: 0,
        containerItemId: 0,
        containerName: '',
        showUse: false,
        itemCommandVM: [],
        characterId: _itemVM.characterId,
        itemMasterId: _itemVM.itemMasterId,
        isIdentified: false,
        isVisible: false,
        isEquipped: false,
        showIcon: false,
        view: VIEW.ADD,
        itemAbilities: [],
        itemSpells: [],
        itemBuffAndEffects:[],
        commandName: 'Default',
        multiItemMasters: [],
        multiItemMasterBundles: [],
        characterCurrency: _itemVM.currencyList
      }
    }
    return itemFormModal;
  }

  public itemMasterModelData(_itemVM: any, _view: string): any {

    if (_itemVM == null) return { itemId: 0, ruleSetId: 0 };

    let itemMasterFormModal: any;
    let _itemTemplateVM: any = _itemVM.itemMaster;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {
      itemMasterFormModal = {

        itemId: _itemVM.itemId,
        name: _itemVM.name,
        description: _itemVM.description,
        characterId: _itemVM.characterId,
        itemImage: _itemVM.itemImage,
        //ContainedIn
        containerItemId: _itemVM.containedIn,
        containerId: _itemVM.containedIn,
        containerName: _itemVM.container == null || _itemVM.container == undefined ? '' : _itemVM.container.name,
        containerItems: _itemVM.containerItems == null || _itemVM.containerItems == undefined ? [] : _itemVM.containerItems,

        quantity: _itemVM.quantity == null || _itemVM.quantity == 0 ? 1 : _itemVM.quantity,
        totalWeight: _itemVM.totalWeight,
        isIdentified: _itemVM.isIdentified,
        isVisible: _itemVM.isVisible,
        isEquipped: _itemVM.isEquipped,

        character: _itemVM.character,
        itemMaster: _itemVM.itemMaster,

        itemMasterId: _itemVM.itemMasterId,
        ruleSetId: _itemTemplateVM.ruleSetId,
        itemName: _view === 'DUPLICATE' ? '' : _itemTemplateVM.itemName,
        itemStats: _itemTemplateVM.itemStats,
        itemVisibleDesc: _itemTemplateVM.itemVisibleDesc,
        command: _itemTemplateVM.command,
        commandName: _itemTemplateVM.commandName,
        showUse: _itemTemplateVM.command == null || _itemTemplateVM.command == undefined || _itemTemplateVM.command == '' ? false : true,

        itemCalculation: _itemTemplateVM.itemCalculation,
        value: _itemTemplateVM.value,
        volume: _itemTemplateVM.volume,
        weight: _itemTemplateVM.weight,
        isContainer: _itemTemplateVM.isContainer,
        isMagical: _itemTemplateVM.isMagical,
        isConsumable: _itemTemplateVM.isConsumable,
        containerWeightMax: _itemTemplateVM.containerWeightMax,
        containerWeightModifier: _itemTemplateVM.containerWeightModifier == undefined || _itemTemplateVM.containerWeightModifier == null ? 'None' : _itemTemplateVM.containerWeightModifier,
        containerVolumeMax: _itemTemplateVM.containerVolumeMax,

        percentReduced: _itemTemplateVM.percentReduced,
        totalWeightWithContents: _itemTemplateVM.totalWeightWithContents,

        metatags: _itemTemplateVM.metatags == null ? '' : _itemTemplateVM.metatags,
        rarity: _itemTemplateVM.rarity,
        ruleset: _itemVM.ruleSet,
        showIcon: false,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,

        itemMasterAbilityVM: _itemTemplateVM.itemMasterAbilityVM == undefined ? [] : _itemTemplateVM.itemMasterAbilityVM,
        itemMasterPlayerVM: _itemTemplateVM.itemMasterPlayerVM == undefined ? [] : _itemTemplateVM.itemMasterPlayerVM,
        itemMasterSpellVM: _itemTemplateVM.itemMasterSpellVM == undefined ? [] : _itemTemplateVM.itemMasterSpellVM,
        itemMasterBuffAndEffectVM: _itemTemplateVM.itemMasterBuffAndEffectVM == undefined ? [] : _itemTemplateVM.itemMasterBuffAndEffectVM,

        currencyLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.currencyLabel == undefined || _itemVM.ruleSet.currencyLabel == null ? '' : '(' + _itemVM.ruleSet.currencyLabel + ')',
        weightLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.weightLabel == undefined || _itemVM.ruleSet.weightLabel == null ? '' : '(' + _itemVM.ruleSet.weightLabel + ')',
        volumeLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.volumeLabel == undefined || _itemVM.ruleSet.volumeLabel == null ? '' : '(' + _itemVM.ruleSet.volumeLabel + ')',

        itemMasterSpell: _itemTemplateVM.itemMasterSpell == null ? [] : _itemTemplateVM.itemMasterSpell,
        itemMasterAbilities: _itemTemplateVM.itemMasterAbilities == null ? [] : _itemTemplateVM.itemMasterAbilities,
        itemMasterBuffAndEffects: _itemTemplateVM.itemMasterBuffAndEffects == null ? [] : _itemTemplateVM.itemMasterBuffAndEffects,
        itemMasterCommand: _itemTemplateVM.itemMasterCommand == null ? [] : _itemTemplateVM.itemMasterCommand,
        itemMasterCommandVM: _itemTemplateVM.itemMasterCommandVM == null ? [] : _itemTemplateVM.itemMasterCommandVM,
        //associate spell-ability changes

        itemMasterSpellId: _itemTemplateVM.itemMasterSpell == undefined ? 0 : _itemTemplateVM.itemMasterSpell.length > 0 ? _itemTemplateVM.itemMasterSpell[0].spellId : 0,
        itemMasterAbilityId: _itemTemplateVM.itemMasterAbilities == undefined ? 0 : _itemTemplateVM.itemMasterAbilities.length > 0 ? _itemTemplateVM.itemMasterAbilities[0].abilityId : 0,
        itemMasterBuffAndEffectId: _itemTemplateVM.itemMasterBuffAndEffects == undefined ? 0 : _itemTemplateVM.itemMasterBuffAndEffects.length > 0 ? _itemTemplateVM.itemMasterBuffAndEffects[0].buffAndEffectId : 0,

        spellDetail: _itemTemplateVM.itemMasterSpell == undefined ? undefined : _itemTemplateVM.itemMasterSpell.length > 0 ? _itemTemplateVM.itemMasterSpell[0].spell : undefined,
        abilityDetail: _itemTemplateVM.itemMasterAbilities == undefined ? undefined : _itemTemplateVM.itemMasterAbilities.length > 0 ? _itemTemplateVM.itemMasterAbilities[0].abilitiy : undefined,
       buffAndEffectDetail: _itemTemplateVM.itemMasterBuffAndEffects == undefined ? undefined : _itemTemplateVM.itemMasterBuffAndEffects.length > 0 ? _itemTemplateVM.itemMasterBuffAndEffects[0].buffAndEffectId : undefined
      }
    }
    else {
      itemMasterFormModal = {
        itemId: 0,
        quantity: 1,
        totalWeight: 0,
        isIdentified: false,
        isVisible: false,
        isEquipped: false,
        commandName: 'Default',
        containerItemId: 0,
        containerItems: [],
        contains: [],
        showUse: false,
        metatags: '',
        itemMasterId: 0,
        ruleSetId: 0,
        showIcon: false,
        view: VIEW.ADD,
        rarity: 'Common',
        isMagical: false,
        isConsumable: false,
        isContainer: false,
        ruleSet: _itemVM.ruleSet,
        containerWeightModifier: 'None',
        itemMasterAbilityVM: [],
        itemMasterPlayerVM: [],
        itemMasterSpellVM: [],
        itemMasterBuffAndEffectVM: [],
        commandVM: [],
        currencyLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.currencyLabel == undefined || _itemVM.ruleSet.currencyLabel == null ? '' : '(' + _itemVM.ruleSet.currencyLabel + ')',
        weightLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.weightLabel == undefined || _itemVM.ruleSet.weightLabel == null ? '' : '(' + _itemVM.ruleSet.weightLabel + ')',
        volumeLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.volumeLabel == undefined || _itemVM.ruleSet.volumeLabel == null ? '' : '(' + _itemVM.ruleSet.volumeLabel + ')',

        itemMasterSpell: [],
        itemMasterAbilities: [],
        itemMasterBuffAndEffects: [],
        itemMasterCommandVM: [],
        itemMasterCommand: [],
        itemMasterSpellId: 0,
        itemMasterAbilityId: 0,
        itemMasterBuffAndEffectId: 0
      }
    }
    return itemMasterFormModal;
  }

  public monsterItemModelData(_itemVM: any, _view: string): any {
    debugger;
    if (_itemVM == null) return {
      itemId: 0,
      ruleSetId: 0,
      characterId: 0,
      itemMasterId: 0,
      showUse: false
    };

    let itemFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {
      itemFormModal = {
        itemId: _itemVM.monsterItemId,
        name: _view === 'DUPLICATE' ? '' : _itemVM.itemName,
        description: _itemVM.itemVisibleDesc,
        itemImage: _itemVM.itemImage,
        isEquipped: _itemVM.isEquipped,
        isIdentified: _itemVM.isIdentified,
        isVisible: _itemVM.isVisible,
        quantity: _itemVM.quantity,
        totalWeight: _itemVM.totalWeight,

        command: _itemVM.command,
        commandName: _itemVM.commandName,
        showUse: _itemVM.command == null || _itemVM.command == undefined || _itemVM.command == '' ? false : true,
        itemCommandVM: _itemVM.itemMasterCommand == undefined ? [] : _itemVM.itemMasterCommand,

        isConsumable: _itemVM.isConsumable,
        isMagical: _itemVM.isMagical,
        itemCalculation: _itemVM.itemCalculation,
        metatags: _itemVM.metatags,
        rarity: _itemVM.rarity,
        value: _itemVM.value,
        volume: _itemVM.volume,
        weight: _itemVM.weight,

        itemStats: _itemVM.itemStats,
        containerWeightMax: _itemVM.containerWeightMax,
        containerVolumeMax: _itemVM.containerVolumeMax,
        percentReduced: _itemVM.percentReduced,
        totalWeightWithContents: _itemVM.totalWeightWithContents,
        containerWeightModifier: _itemVM.containerWeightModifier == undefined || _itemVM.containerWeightModifier == null ? 'None' : _itemVM.containerWeightModifier,

        isContainer: _itemVM.isContainer,
        containedIn: _itemVM.containedIn,
        container: _itemVM.container,
        containerName: _itemVM.containerName,
        containerItemId: _itemVM.containedIn,
        containerItems: _itemVM.containerItems == null || _itemVM.containerItems == undefined
          ? [] : _view === 'DUPLICATE' ? [] : _itemVM.containerItems,

        //parentItemId: _itemVM.parentItemId,
        //isDeleted: _itemVM.isDeleted,
        //character: _itemVM.character,
        //characterId: _itemVM.characterId,

        ruleSet: _itemVM.ruleSet == null || _itemVM.ruleSet == undefined ? {} : _itemVM.ruleSet,

        currencyLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.currencyLabel == undefined || _itemVM.ruleSet.currencyLabel == null ? '' : '(' + _itemVM.ruleSet.currencyLabel + ')',
        weightLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.weightLabel == undefined || _itemVM.ruleSet.weightLabel == null ? '' : '(' + _itemVM.ruleSet.weightLabel + ')',
        volumeLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.volumeLabel == undefined || _itemVM.ruleSet.volumeLabel == null ? '' : '(' + _itemVM.ruleSet.volumeLabel + ')',

        itemMaster: _itemVM.itemMaster,
        itemMasterId: _itemVM.itemMasterId,

        itemAbilities: _itemVM.itemMasterAbilities == null || _itemVM.itemMasterAbilities == undefined ? [] : _itemVM.itemMasterAbilities,
        itemSpells: _itemVM.itemMasterSpell == null || _itemVM.itemMasterSpell == undefined ? [] : _itemVM.itemMasterSpell,
        itemBuffAndEffects: _itemVM.itemMasterBuffAndEffects == null || _itemVM.itemMasterBuffAndEffects == undefined ? [] : _itemVM.itemMasterBuffAndEffects,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
      }
    }
    else {
      itemFormModal = {
        itemId: 0,
        containerItemId: 0,
        containerName: '',
        showUse: false,
        itemCommandVM: [],
        //characterId: _itemVM.characterId,
        itemMasterId: _itemVM.itemMasterId,
        isIdentified: false,
        isVisible: false,
        isEquipped: false,
        showIcon: false,
        view: VIEW.ADD,
        itemAbilities: [],
        itemSpells: [],
        itemBuffAndEffects: [],
        commandName: 'Default',
        multiItemMasters: [],
        multiItemMasterBundles: []
      }
    }
    return itemFormModal;
  }

  dropMultipleItems<T>(itemList: any, lootPileId: number, rulesetId: number, characterId: number): Observable<T> {
    this.inventoryData = null;
    let dropMultipleItemsURL = `${this.DropMultipleItems}?DropToLootPileId=${lootPileId}&rulesetId=${rulesetId}&CharacterId=${characterId}`;
    return this.http.post<T>(dropMultipleItemsURL, JSON.stringify(itemList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.dropMultipleItems(itemList, lootPileId,rulesetId, characterId));
      });
  }

  dropMultipleItemsWithCurrency<T>(itemList: any, lootPileId: number, rulesetId: number, characterId: number): Observable<T> {
    this.inventoryData = null;
    let dropMultipleItemsURL = `${this.DropMultipleItemsWithCurrencyApi}?DropToLootPileId=${lootPileId}&rulesetId=${rulesetId}&CharacterId=${characterId}`;
    return this.http.post<T>(dropMultipleItemsURL, JSON.stringify(itemList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.dropMultipleItems(itemList, lootPileId, rulesetId, characterId));
      });
  }

  getLootPilesListByCharacterId<T>(characterId: number, rulesetId: number): Observable<T> {
    let endpointUrl = `${this.GetLootPilesListByCharacterId}?CharacterId=${characterId}&RulesetId=${rulesetId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLootPilesListByCharacterId(characterId, rulesetId));
      });
  }

  getLootPilesListByCharacterId_Cache<T>(characterId: number, rulesetId: number, isFromCharacterDashboard: boolean = false): Observable<T> {
    if (isFromCharacterDashboard) {
      this.LootPilesListData = null;
    }
    if (this.LootPilesListData != null) {
      return Observable.of(this.LootPilesListData);
    }
    else {
      let endpointUrl = `${this.GetLootPilesListByCharacterId}?CharacterId=${characterId}&RulesetId=${rulesetId}`;
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(LootPilesListInfo => this.LootPilesListData = LootPilesListInfo)
        .catch(error => {
          return this.handleError(error, () => this.getLootPilesListByCharacterId(characterId, rulesetId));
        });
    }
  }

  getLootPilesListByRuleSetId<T>(rulesetId: number): Observable<T> {
    let endpointUrl = `${this.GetLootPilesListByRuleSetId}?RulesetId=${rulesetId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getLootPilesListByRuleSetId(rulesetId));
      });
  }

  getLootPilesListByRuleSetId_Cache<T>(rulesetId: number, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.addLootPileList = null;
    }
    if (this.addLootPileList != null) {
      return Observable.of(this.addLootPileList);
    }
    else {
      let endpointUrl = `${this.GetLootPilesListByRuleSetId}?RulesetId=${rulesetId}`;
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(addLootPileInfo => this.addLootPileList = addLootPileInfo)
        .catch(error => {
          return this.handleError(error, () => this.getLootPilesListByRuleSetId(rulesetId));
        });
    }
  }

  ReduceItemQty<T>(itemId: number, ruleSetId: number): Observable<T> {
    this.inventoryData = null;
    let reduceItemQtyURL = `${this.reduceItemQty}?ItemId=${itemId}&RuleSetId=${ruleSetId}`;
    return this.http.post<T>(reduceItemQtyURL, JSON.stringify({}), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.ReduceItemQty(itemId, ruleSetId));
      });
  }

  GivePlayerItems<T>(items: any, giveTo: any, givenByPlayerID: number, ruleSetId: number): Observable<T> {
    this.inventoryData = null;
    let givePlayerItemsURL = `${this.givePlayerItems}?givenByPlayerID=${givenByPlayerID}&ruleSetId=${ruleSetId}`;
    return this.http.post<T>(givePlayerItemsURL, JSON.stringify({ items: items, giveTo: giveTo}), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.GivePlayerItems(items, giveTo, givenByPlayerID, ruleSetId));
      });
  }

}
