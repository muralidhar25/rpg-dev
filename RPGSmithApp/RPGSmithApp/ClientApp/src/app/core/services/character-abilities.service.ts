import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';

import { VIEW } from '../models/enums';
import { CharacterAbilities } from '../models/view-models/character-abilities.model';

@Injectable()
export class CharacterAbilityService extends EndpointFactory {

  private readonly _getAllUrl: string = "/api/CharacterAbility/getall";
  private readonly _getByIdUrl: string = "/api/CharacterAbility/GetById";
  private readonly _getByCharacterIdUrl: string = "/api/CharacterAbility/GetByCharacterId";
  private readonly _getAbilityByCharacterIdUrl: string = "/api/CharacterAbility/GetAbilityByCharacterId";
  private readonly _getCountUrl: string = "/api/CharacterAbility/getCountByCharacterId";
  private readonly _createUrl: string = "/api/CharacterAbility/create";
  private readonly _updateUrl: string = "/api/CharacterAbility/update";
  private readonly _deleteUrl: string = "/api/CharacterAbility/delete";
  private readonly _deleteUrl_up: string = "/api/CharacterAbility/delete_up";
  private readonly _toggleEnableCharacterAbilityUrl: string = "/api/CharacterAbility/toggleEnableCharacterAbility";
  private readonly _duplicateUrl: string = "/api/CharacterAbility/DuplicateItem";
  private readonly RemoveAbilities: string = "/api/CharacterAbility/RemoveAbilities";

  private readonly getByCharacterId_api: string = this.configurations.baseUrl + "/api/CharacterAbility/getByCharacterId_sp";

  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  private AbilitiesData: any;
  public CharacterAbilityDetail: any[] = [];
  private ViewType: any;

  get getAllUrl() { return this.configurations.baseUrl + this._getAllUrl; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  get getByCharacterIdUrl() { return this.configurations.baseUrl + this._getByCharacterIdUrl; }
  get getAbilityByCharacterIdUrl() { return this.configurations.baseUrl + this._getAbilityByCharacterIdUrl; }

  get getCountUrl() { return this.configurations.baseUrl + this._getCountUrl; }
  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get deleteUrl_up() { return this.configurations.baseUrl + this._deleteUrl_up; }
  get toggleEnableCharacterAbilityUrl() { return this.configurations.baseUrl + this._toggleEnableCharacterAbilityUrl; }
  get duplicateUrl() { return this.configurations.baseUrl + this._duplicateUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  getAllCharacterAbilities<T>(): Observable<T> {

    return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAllCharacterAbilities());
      });
  }

  getCharacterAbilitiesCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterAbilitiesCount(Id));
      });
  }

  getCharacterAbilityById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterAbilityById(Id));
      });
  }

  getCharacterAbilityById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    let record = this.CharacterAbilityDetail.findIndex(x => x.characterAbilityId == Id);

    if (record > -1) {
      return Observable.of(this.CharacterAbilityDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.CharacterAbilityDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getCharacterAbilityById(Id));
        });
    }
  }

  getCharacterAbilitiesByCharacterId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterIdUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterAbilitiesByCharacterId(Id));
      });
  }
  getCharacterAbilityByCharacterId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getAbilityByCharacterIdUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterAbilityByCharacterId(Id));
      });
  }

  getCharacterAbilitiesByCharacterId_sp<T>(characterId: number, rulesetId: number, page: number, pageSize: number, sortType: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterId_api}?characterId=${characterId}&rulesetId=${rulesetId}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterAbilitiesByCharacterId_sp(characterId, rulesetId, page, pageSize, sortType));
      });
  }

  getCharacterAbilitiesByCharacterId_sp_Cache<T>(characterId: number, rulesetId: number, page: number, pageSize: number, sortType: number, isFromCharacterDashboard: boolean = false): Observable<T> {
    if (isFromCharacterDashboard) {
      this.AbilitiesData = null;
    }
    if (this.AbilitiesData != null) {
      return Observable.of(this.AbilitiesData);
    } else {
      let endpointUrl = `${this.getByCharacterId_api}?characterId=${characterId}&rulesetId=${rulesetId}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(abilities => this.AbilitiesData = abilities)
        .catch(error => {
          return this.handleError(error, () => this.getCharacterAbilitiesByCharacterId_sp(characterId, rulesetId, page, pageSize, sortType));
        });
    }
  }

  createPageLastViews<T>(pageLastViews: any): Observable<T> {

    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.AbilitiesData != null) {
        this.AbilitiesData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews<T>(pageLastViews));
      });
  }

  createCharacterAbility<T>(CharacterAbility: CharacterAbilities): Observable<T> {

    this.AbilitiesData = null;
    let endpointUrl = this.createUrl;
    //if (CharacterAbility.characterAbilityId == 0 || CharacterAbility.characterAbilityId === undefined)
    //    endpointUrl = this.createUrl;
    //else
    //    endpointUrl = this.updateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(CharacterAbility), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createCharacterAbility(CharacterAbility));
      });
  }

  duplicateCharacterAbility<T>(CharacterAbility: CharacterAbilities): Observable<T> {
    this.AbilitiesData = null;
    //CharacterAbility.itemId = 0;
    let endpointUrl = this.duplicateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(CharacterAbility), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateCharacterAbility(CharacterAbility));
      });
  }

  updateCharacterAbility<T>(CharacterAbility: CharacterAbilities): Observable<T> {
    this.AbilitiesData = null;

    return this.http.put<T>(this.updateUrl, JSON.stringify(CharacterAbility), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateCharacterAbility(CharacterAbility));
      });
  }

  deleteCharacterAbility<T>(Id: number): Observable<T> {
    this.AbilitiesData = null;
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteCharacterAbility(Id));
      });
  }
  deleteCharacterAbility_up<T>(Id: number, RulesetID: number): Observable<T> {
    this.AbilitiesData = null;
    let endpointUrl = `${this.deleteUrl_up}?id=${Id}&rulesetid=${RulesetID}`;

    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteCharacterAbility_up(Id, RulesetID));
      });
  }

  toggleEnableCharacterAbility<T>(Id: number): Observable<T> {
    this.AbilitiesData = null;
    let endpointUrl = `${this.toggleEnableCharacterAbilityUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.toggleEnableCharacterAbility(Id));
      });
  }

  //bind form model
  public abilityModelData(abilityVM: any, _view: string): any {

    let abilityFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {

      abilityFormModal = {
        abilityId: abilityVM.abilityId,
        characterId: abilityVM.characterId,
        rulesetId: abilityVM.ruleSetId,
        name: _view === 'DUPLICATE' ? '' : abilityVM.name,
        level: abilityVM.level,
        command: abilityVM.command,
        abilityCommandVM: abilityVM.abilityCommand == undefined ? [] : abilityVM.abilityCommand,
        maxNumberOfUses: abilityVM.maxNumberOfUses,
        currentNumberOfUses: abilityVM.currentNumberOfUses,
        description: abilityVM.description,
        stats: abilityVM.stats,
        imageUrl: abilityVM.imageUrl,
        isEnabled: abilityVM.isEnabled,
        ruleset: abilityVM.ruleset,
        showIcon: false,
        metatags: abilityVM.metatags,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        multiAbilities: abilityVM.multiAbilities
        //sortOrder: abilityVM.sortOrder
      }
    }
    else {
      abilityFormModal = {
        abilityId: 0,
        characterId: abilityVM.characterId,
        rulesetId: abilityVM.ruleSetId,
        abilityCommandVM: [],
        isEnabled: false,
        ruleset: abilityVM.ruleset,
        showIcon: false,
        view: VIEW.ADD,
        multiAbilities: []
        //sortOrder: abilityVM.sortOrder
      }
    }

    return abilityFormModal;
  }

  public abilityModelDetailData(abilityDetailVM: any, _view: string): any {
    let abilityFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {

      let abilityVM = abilityDetailVM.ability;

      abilityFormModal = {
        abilityId: abilityVM.abilityId,
        characterId: abilityDetailVM.characterId,
        characterAbilityId: abilityDetailVM.characterAbilityId,
        rulesetId: abilityVM.ruleSetId,
        name: _view === 'DUPLICATE' ? '' : abilityVM.name,
        level: abilityVM.level,
        command: abilityVM.command,
        commandName: abilityVM.commandName,
        abilityCommandVM: abilityVM.abilityCommand == undefined ? [] : abilityVM.abilityCommand,
        abilityBuffAndEffectsVM: abilityVM.abilityBuffAndEffects == undefined ? [] : abilityVM.abilityBuffAndEffects,
        maxNumberOfUses: abilityVM.maxNumberOfUses,
        currentNumberOfUses: abilityVM.currentNumberOfUses,
        description: abilityVM.description,
        gmOnly: abilityVM.gmOnly,
        stats: abilityVM.stats,
        imageUrl: abilityVM.imageUrl,
        isEnabled: abilityDetailVM.isEnabled,
        ruleset: abilityVM.ruleset,
        ruleSetId: abilityVM.ruleSetId,
        showIcon: false,
        showUse: abilityVM.command ? true : false,
        metatags: abilityVM.metatags,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        multiAbilities: abilityVM.multiAbilities
        //sortOrder: abilityVM.sortOrder
      }
    }
    else {
      abilityFormModal = {
        abilityId: 0,
        characterId: abilityDetailVM.characterId,
        rulesetId: abilityDetailVM.ruleSetId,
        abilityCommandVM: [],
        abilityBuffAndEffectsVM: [],
        isEnabled: false,
        ruleset: abilityDetailVM.ruleset,
        ruleSetId: abilityDetailVM.ruleSetId,
        showIcon: false,
        showUse: false,
        view: VIEW.ADD,
        multiAbilities: [],
        commandName: 'Default'
        //sortOrder: abilityVM.sortOrder
      }
    }

    return abilityFormModal;
  }

  removeAbilities<T>(AbilitiesList: any, rulesetId: number): Observable<T> {
    this.AbilitiesData = null;
    let removeAbilitiesURL = `${this.RemoveAbilities}?rulesetId=${rulesetId}`;
    return this.http.post<T>(removeAbilitiesURL, JSON.stringify(AbilitiesList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.removeAbilities(AbilitiesList, rulesetId));
      });
  }

}
