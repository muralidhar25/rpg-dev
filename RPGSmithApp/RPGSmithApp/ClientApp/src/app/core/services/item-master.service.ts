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

import { ItemMaster } from '../models/view-models/item-master.model';
import { ICON, VIEW } from '../models/enums';
import { Bundle } from '../models/view-models/bundle.model';

@Injectable()
export class ItemMasterService extends EndpointFactory {

  private itemMaster: ItemMaster;

  private readonly getAllUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getAll";
  private readonly getCountUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getItemsCount";
  private readonly createUrl: string = this.configurations.baseUrl + "/api/ItemMaster/create";
  private readonly updateUrl: string = this.configurations.baseUrl + "/api/ItemMaster/update";
  private readonly createBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/create";
  private readonly updateBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/update";
  private readonly deleteUrl: string = this.configurations.baseUrl + "/api/ItemMaster/delete";
  private readonly deleteBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/delete";
  
  private readonly deleteUrl_up: string = this.configurations.baseUrl + "/api/ItemMaster/delete_up";
  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getById";
  private readonly getDetailByIdUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/getDetailById";  
  private readonly getByRulesetUrl: string = this.configurations.baseUrl + "/api/ItemMaster/getByRuleSetId";
  private readonly getByRulesetUrl_add: string = this.configurations.baseUrl + "/api/ItemMaster/getByRuleSetId_add";
  private readonly getByRulesetUrl_sp: string = this.configurations.baseUrl + "/api/ItemMaster/getByRuleSetId_sp";
  private readonly uploadUrl: string = this.configurations.baseUrl + "/api/ItemMaster/uploadItemTemplateImage";
  private readonly duplicateUrl: string = this.configurations.baseUrl + "/api/ItemMaster/DuplicateItemMaster";
  private readonly duplicateBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/DuplicateBundle";  
  private readonly AbilitySpellForItemsByRuleset_sp: string = this.configurations.baseUrl + "/api/ItemMaster/AbilitySpellForItemsByRuleset_sp";
  private readonly getByBundleUrl: string = this.configurations.baseUrl + "/api/ItemMasterBundle/getItemsByBundleId";
  
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

  getItemMasterById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterById(Id));
      });
  }
  getBundleById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getDetailByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBundleById(Id));
      });
  }
  getItemMasterByRuleset<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterByRuleset(Id));
      });
  }
  getItemMasterByRuleset_add<T>(Id: number,includeBundles:boolean =false): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}&includeBundles=${includeBundles}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getItemMasterByRuleset_add(Id));
      });
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

  createItemMaster<T>(itemMaster: ItemMaster): Observable<T> {

    let endpointUrl = this.createUrl;

    if (itemMaster.itemMasterId == 0 || itemMaster.itemMasterId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(itemMaster), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createItemMaster(itemMaster));
      });
  }
  createBundle<T>(bundle: Bundle): Observable<T> {

    let endpointUrl = this.createBundleUrl;

    if (bundle.bundleId == 0 || bundle.bundleId === undefined)
      endpointUrl = this.createBundleUrl;
    else
      endpointUrl = this.updateBundleUrl;

    return this.http.post(endpointUrl, JSON.stringify(bundle), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createBundle(bundle));
      });
  }

  duplicateItemMaster<T>(itemMaster: ItemMaster): Observable<T> {
    //itemMaster.itemMasterId = 0;
    let endpointUrl = this.duplicateUrl;

    return this.http.post(endpointUrl, JSON.stringify(itemMaster), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateItemMaster(itemMaster));
      });
  }
  duplicateBundle<T>(itemMaster: ItemMaster): Observable<T> {
    //itemMaster.itemMasterId = 0;
    let endpointUrl = this.duplicateBundleUrl;

    return this.http.post(endpointUrl, JSON.stringify(itemMaster), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateBundle(itemMaster));
      });
  }

  updateItemMaster<T>(itemMaster: ItemMaster): Observable<T> {

    return this.http.put<T>(this.updateUrl, JSON.stringify(itemMaster), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateItemMaster(itemMaster));
      });
  }

  deleteItemMaster<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteItemMaster(Id));
      });
  }
  deleteItemMaster_up<T>(itemMaster: ItemMaster): Observable<T> {
    let endpointUrl = this.deleteUrl_up;// `${this.deleteUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(itemMaster), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteItemMaster_up(itemMaster));
      });
  }
  deleteBundle<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteBundleUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteBundle(Id));
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
        itemMasterCommand: _itemTemplateVM.itemMasterCommand == null ? [] : _itemTemplateVM.itemMasterCommand,
        //associate spell-ability changes

        itemMasterSpellId: _itemTemplateVM.itemMasterSpell == undefined ? 0 : _itemTemplateVM.itemMasterSpell.length > 0 ? _itemTemplateVM.itemMasterSpell[0].spellId : 0,
        itemMasterAbilityId: _itemTemplateVM.itemMasterAbilities == undefined ? 0 : _itemTemplateVM.itemMasterAbilities.length > 0 ? _itemTemplateVM.itemMasterAbilities[0].abilityId : 0,

        spellDetail: _itemTemplateVM.itemMasterSpell == undefined ? undefined : _itemTemplateVM.itemMasterSpell.length > 0 ? _itemTemplateVM.itemMasterSpell[0].spell : undefined,
        abilityDetail: _itemTemplateVM.itemMasterAbilities == undefined ? undefined : _itemTemplateVM.itemMasterAbilities.length > 0 ? _itemTemplateVM.itemMasterAbilities[0].abilitiy : undefined
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
        itemMasterCommand: [],
        itemMasterSpellId: 0,
        itemMasterAbilityId: 0,
        metatags: '',

        commandName: 'Default',
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
}

