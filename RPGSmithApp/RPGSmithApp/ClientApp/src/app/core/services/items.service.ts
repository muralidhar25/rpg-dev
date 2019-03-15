import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { LocalStoreManager } from '../common/local-store-manager.service';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";
import { AuthService } from "../auth/auth.service";
import { DBkeys } from '../common/db-keys';

import { ICON, VIEW } from '../models/enums';
import { Items } from '../models/view-models/items.model';
import { Characters } from '../models/view-models/characters.model';

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
  private readonly deleteUrl: string = this.configurations.baseUrl + "/api/Item/delete";
  private readonly deleteUrl_up: string = this.configurations.baseUrl + "/api/Item/delete_up";
  private readonly GetNestedContainerItems_url: string = this.configurations.baseUrl + "/api/Item/GetNestedContainerItems";
  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/Item/GetById";
  private readonly getByCharacterIdUrl: string = this.configurations.baseUrl + "/api/Item/getByCharacterId";
  private readonly getItemByCharacterIdUrl: string = this.configurations.baseUrl + "/api/Item/getItemByCharacterId";
  private readonly getAvailableContainerItemsUrl: string = this.configurations.baseUrl + "/api/Item/getAvailableContainerItems";
  private readonly getAvailableItemsUrl: string = this.configurations.baseUrl + "/api/Item/GetAvailableItems";
  private readonly toggleEquippedUrl: string = this.configurations.baseUrl + "/api/Item/toggleEquippedItem";
  private readonly duplicateUrl: string = this.configurations.baseUrl + "/api/Item/DuplicateItem";
  private readonly uploadUrl: string = this.configurations.baseUrl + "/api/Item/uploadItemImage";

  private readonly getByCharacterId_api: string = this.configurations.baseUrl + "/api/Item/getByCharacterId_sp";
  private readonly getAbilitySpellForItems_api: string = this.configurations.baseUrl + "/api/Item/AbilitySpellForItemsByRuleset_sp";
  private readonly getItemCommands_api: string = this.configurations.baseUrl + "/api/Item/getItemCommands_sp";

  private readonly GetCharSpellIDUrl: string = this.configurations.baseUrl + "/api/Item/GetCharSpellIDUrl";
  private readonly GetCharAbilityIDUrl: string = this.configurations.baseUrl + "/api/Item/GetCharAbilityIDUrl";

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

  getAvailableContainerItems<T>(characterId: number, itemId: number): Observable<T> {
    let endpointUrl = `${this.getAvailableContainerItemsUrl}?characterId=${characterId}&itemId=${itemId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAvailableContainerItems(characterId, itemId));
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

    let endpointUrl = this.addUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.addItem(item));
      });
  }

  resetItemToOriginal<T>(item: Items): Observable<T> {

    return this.http.post<T>(this.resetUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.resetItemToOriginal(item));
      });
  }

  createItem<T>(item: Items): Observable<T> {

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
    //Item.itemId = 0;
    let endpointUrl = this.duplicateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateItem(item));
      });
  }

  updateItem<T>(item: Items): Observable<T> {

    return this.http.post<T>(this.updateUrl, JSON.stringify(item), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateItem(item));
      });
  }

  deleteItem<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteItem(Id));
      });
  }
  deleteItem_up<T>(item: Items, itemsList: any): Observable<T> {
    let endpointUrl = this.deleteUrl_up;//`${this.deleteUrl}?id=${Id}`;
    let model = { item: item, ContainedItemsList: itemsList };
    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteItem_up(item, itemsList));
      });
  }
  toggleEquippedItem<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.toggleEquippedUrl}?id=${Id}`;

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
        characterId: _itemVM.characterId,
        itemMasterId: _itemVM.itemMasterId,
        isIdentified: false,
        isVisible: false,
        isEquipped: false,
        showIcon: false,
        view: VIEW.ADD,
        itemAbilities: [],
        itemSpells: [],

        commandName: 'Default',
        multiItemMasters: []
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

        currencyLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.currencyLabel == undefined || _itemVM.ruleSet.currencyLabel == null ? '' : '(' + _itemVM.ruleSet.currencyLabel + ')',
        weightLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.weightLabel == undefined || _itemVM.ruleSet.weightLabel == null ? '' : '(' + _itemVM.ruleSet.weightLabel + ')',
        volumeLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.volumeLabel == undefined || _itemVM.ruleSet.volumeLabel == null ? '' : '(' + _itemVM.ruleSet.volumeLabel + ')',

        itemMasterSpell: _itemTemplateVM.itemMasterSpell == null ? [] : _itemTemplateVM.itemMasterSpell,
        itemMasterAbilities: _itemTemplateVM.itemMasterAbilities == null ? [] : _itemTemplateVM.itemMasterAbilities,
        itemMasterCommand: _itemTemplateVM.itemMasterCommand == null ? [] : _itemTemplateVM.itemMasterCommand,
        itemMasterCommandVM: _itemTemplateVM.itemMasterCommandVM == null ? [] : _itemTemplateVM.itemMasterCommandVM,
        //associate spell-ability changes

        itemMasterSpellId: _itemTemplateVM.itemMasterSpell == undefined ? 0 : _itemTemplateVM.itemMasterSpell.length > 0 ? _itemTemplateVM.itemMasterSpell[0].spellId : 0,
        itemMasterAbilityId: _itemTemplateVM.itemMasterAbilities == undefined ? 0 : _itemTemplateVM.itemMasterAbilities.length > 0 ? _itemTemplateVM.itemMasterAbilities[0].abilityId : 0,

        spellDetail: _itemTemplateVM.itemMasterSpell == undefined ? undefined : _itemTemplateVM.itemMasterSpell.length > 0 ? _itemTemplateVM.itemMasterSpell[0].spell : undefined,
        abilityDetail: _itemTemplateVM.itemMasterAbilities == undefined ? undefined : _itemTemplateVM.itemMasterAbilities.length > 0 ? _itemTemplateVM.itemMasterAbilities[0].abilitiy : undefined
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
        commandVM: [],
        currencyLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.currencyLabel == undefined || _itemVM.ruleSet.currencyLabel == null ? '' : '(' + _itemVM.ruleSet.currencyLabel + ')',
        weightLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.weightLabel == undefined || _itemVM.ruleSet.weightLabel == null ? '' : '(' + _itemVM.ruleSet.weightLabel + ')',
        volumeLabel: _itemVM.ruleSet == undefined ? ''
          : _itemVM.ruleSet.volumeLabel == undefined || _itemVM.ruleSet.volumeLabel == null ? '' : '(' + _itemVM.ruleSet.volumeLabel + ')',

        itemMasterSpell: [],
        itemMasterAbilities: [],
        itemMasterCommandVM: [],
        itemMasterCommand: [],
        itemMasterSpellId: 0,
        itemMasterAbilityId: 0
      }
    }
    return itemMasterFormModal;
  }


}
