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

import { Ability } from '../models/view-models/ability.model';
import { ICON, VIEW } from '../models/enums';

@Injectable()
export class AbilityService extends EndpointFactory {

  private readonly _getAllUrl: string = "/api/Ability/getAll";
  private readonly _getCountUrl: string = "/api/Ability/getCountByRuleSetId";
  private readonly _createUrl: string = "/api/Ability/create";
  private readonly _updateUrl: string = "/api/Ability/update";
  private readonly _deleteUrl: string = "/api/Ability/delete";
  private readonly _deleteUrl_up: string = "/api/Ability/delete_up";
  private readonly _getByIdUrl: string = "/api/Ability/GetById";
  private readonly _getByRulesetUrl: string = "/api/Ability/getByRuleSetId";
  private readonly _getByRulesetUrl_add: string = "/api/Ability/getByRuleSetId_add";
  private readonly _uploadUrl: string = "/api/Ability/upLoadAbilityImageBlob";
  private readonly _duplicateUrl: string = "/api/Ability/duplicateAbility";
  private readonly _enableAbilityUrl: string = "/api/Ability/toggleEnableAbility";

  private readonly getByRuleSetId_sp: string = this.configurations.baseUrl + "/api/Ability/getByRuleSetId_sp";
  private readonly getAbilityCommands_api: string = this.configurations.baseUrl + "/api/Ability/getAbilityCommands_sp";
  private readonly DeleteAbilities: string = this.configurations.baseUrl + "/api/Ability/DeleteAbilities";

  get getAllUrl() { return this.configurations.baseUrl + this._getAllUrl; }
  get getCountUrl() { return this.configurations.baseUrl + this._getCountUrl; }
  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get deleteUrl_up() { return this.configurations.baseUrl + this._deleteUrl_up; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  get getByRulesetUrl() { return this.configurations.baseUrl + this._getByRulesetUrl; }
  get getByRulesetUrl_add() { return this.configurations.baseUrl + this._getByRulesetUrl_add; }

  get uploadUrl() { return this.configurations.baseUrl + this._uploadUrl; }
  get duplicateUrl() { return this.configurations.baseUrl + this._duplicateUrl; }
  get enableAbilityUrl() { return this.configurations.baseUrl + this._enableAbilityUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getAbilities<T>(): Observable<T> {

    return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilities());
      });
  }

  getAbilitiesCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilitiesCount(Id));
      });
  }

  getAbilityById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilityById(Id));
      });
  }

  getAbilityByRuleset<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilityByRuleset(Id));
      });
  }
  getAbilityByRuleset_add<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilityByRuleset_add(Id));
      });
  }

  getAbilityByRuleset_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilityByRuleset(Id));
      });
  }

  getAbilityByRuleset_spWithPagination<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilityByRuleset_spWithPagination(Id, page, pageSize));
      });
  }

  getAbilityCommands_sp<T>(Id: number, rulesetId: number): Observable<T> {
    let endpointUrl = `${this.getAbilityCommands_api}?abilityId=${Id}&rulesetId=${rulesetId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAbilityByRuleset(Id));
      });
  }

  createAbility<T>(ability: Ability): Observable<T> {

    let endpointUrl = this.createUrl;

    if (ability.abilityId == 0 || ability.abilityId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(ability), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createAbility(ability));
      });
  }

  duplicateAbility<T>(ability: Ability): Observable<T> {
    //ability.abilityId = 0;
    let endpointUrl = this.duplicateUrl;

    return this.http.post(endpointUrl, JSON.stringify(ability), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateAbility(ability));
      });
  }

  updateAbility<T>(ability: Ability): Observable<T> {

    return this.http.put<T>(this.updateUrl, JSON.stringify(ability), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateAbility(ability));
      });
  }

  deleteAbility<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteAbility(Id));
      });
  }

  deleteAbility_up<T>(ability: Ability): Observable<T> {
    let endpointUrl = this.deleteUrl_up; //`${this.deleteUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(ability), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteAbility_up(ability));
      });
  }
  enableAbility<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.enableAbilityUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.enableAbility(Id));
      });
  }

  fileUpload(fileToUpload: File) {
    return this.fileUploadMethod<any>(fileToUpload);
  }

  private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
    return this.fileUploadService.fileUpload<T>(this.uploadUrl, fileToUpload);
  }

  //bind form model
  public abilityModelData(abilityVM: any, _view: string): any {

    if (abilityVM == null) return { abilityId: 0, ruleSetId: 0 };

    let abilityFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {

      abilityFormModal = {
        abilityId: abilityVM.abilityId,
        ruleSetId: abilityVM.ruleSetId,
        characterId: abilityVM.characterId,
        name: _view === 'DUPLICATE' ? '' : abilityVM.name,
        level: abilityVM.level == null || abilityVM.level == undefined ? '' : abilityVM.level,
        command: abilityVM.command,
        commandName: abilityVM.commandName,
        showUse: abilityVM.command == null || abilityVM.command == undefined || abilityVM.command == '' ? false : true,
        abilityCommandVM: abilityVM.abilityCommand == undefined
          ?
          abilityVM.abilityCommandVM == undefined ? [] : abilityVM.abilityCommandVM
          : abilityVM.abilityCommand,
        maxNumberOfUses: abilityVM.maxNumberOfUses,
        currentNumberOfUses: abilityVM.currentNumberOfUses,
        description: abilityVM.description,
        gmOnly: abilityVM.gmOnly,
        stats: abilityVM.stats,
        imageUrl: abilityVM.imageUrl,
        isEnabled: abilityVM.isEnabled,
        ruleset: abilityVM.ruleset,
        showIcon: false,
        metatags: abilityVM.metatags == null || abilityVM.metatags == undefined ? '' : abilityVM.metatags,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        //sortOrder: abilityVM.sortOrder
        abilityBuffAndEffects: abilityVM.abilityBuffAndEffects == null ? [] : abilityVM.abilityBuffAndEffects,
        abilityBuffAndEffectVM: abilityVM.abilityBuffAndEffectVM == undefined ? [] : abilityVM.abilityBuffAndEffectVM,
      }
    }
    else {
      abilityFormModal = {
        abilityId: 0,
        ruleSetId: abilityVM.ruleSetId,
        showUse: false,
        abilityCommandVM: [],
        isEnabled: false,
        ruleset: abilityVM.ruleset,
        showIcon: false,
        view: VIEW.ADD,
        metatags: '',
        level: '',
        commandName: 'Default',
        //sortOrder: abilityVM.sortOrder
        abilityBuffAndEffects: [],
        abilityBuffAndEffectVM: []
      }
    }

    return abilityFormModal;
  }

  deleteAbilities<T>(AbilitiesList: any, rulesetId:number): Observable<T> {
    let deleteAbilitiesURL = `${this.DeleteAbilities}?rulesetId=${rulesetId}`;
    return this.http.post<T>(deleteAbilitiesURL, JSON.stringify(AbilitiesList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteAbilities(AbilitiesList, rulesetId));
      });
  } 
}
