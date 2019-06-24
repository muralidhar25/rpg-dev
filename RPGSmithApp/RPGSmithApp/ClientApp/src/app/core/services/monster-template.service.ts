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

//import { Ability } from '../models/view-models/monster-template.model';
import { ICON, VIEW } from '../models/enums';
import { MonsterTemplate } from '../models/view-models/monster-template.model';

@Injectable()
export class MonsterTemplateService extends EndpointFactory {

  private readonly _getAllUrl: string = "/api/MonsterTemplate/getAll";
  private readonly _getCountUrl: string = "/api/MonsterTemplate/getCountByRuleSetId";
  private readonly _createUrl: string = "/api/MonsterTemplate/create";
  private readonly _updateUrl: string = "/api/MonsterTemplate/update";  
  private readonly _deleteUrl: string = "/api/MonsterTemplate/delete";
  private readonly _deleteUrl_up: string = "/api/MonsterTemplate/delete_up";
  private readonly _getByIdUrl: string = "/api/MonsterTemplate/GetById";
  private readonly _getByRulesetUrl: string = "/api/MonsterTemplate/getByRuleSetId";
  private readonly _getByRulesetUrl_add: string = "/api/MonsterTemplate/getByRuleSetId_add";
  private readonly _uploadUrl: string = "/api/MonsterTemplate/upLoadMonsterTemplateImageBlob";
  private readonly _duplicateUrl: string = "/api/MonsterTemplate/duplicate";

  

  //private readonly _enableAbilityUrl: string = "/api/MonsterTemplate/toggleEnableAbility";

  private readonly getByRuleSetId_sp: string = this.configurations.baseUrl + "/api/MonsterTemplate/getByRuleSetId_sp";
  private readonly getMonstersByRuleSetId_sp: string = this.configurations.baseUrl + "/api/MonsterTemplate/getMonsterByRuleSetId_sp";
  private readonly getMonsterTemplateCommands_api: string = this.configurations.baseUrl + "/api/MonsterTemplate/getCommands_sp";
  private readonly getMonsterTemplateAssociateRecords_sp_api: string = this.configurations.baseUrl + "/api/MonsterTemplate/SP_GetAssociateRecords";
  private readonly enableCombatTrackerUrl: string = this.configurations.baseUrl + "/api/MonsterTemplate/enableCombatTracker";
  private readonly createMonsterUrl: string = this.configurations.baseUrl +  "/api/MonsterTemplate/createMonster";
  private readonly updateMonsterUrl: string = this.configurations.baseUrl +  "/api/MonsterTemplate/updateMonster";
  

  private readonly deployMonster_api = this.configurations.baseUrl + "/api/MonsterTemplate/DeployMonsterTemplate";

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
  //get enableAbilityUrl() { return this.configurations.baseUrl + this._enableAbilityUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getMonsterTemplates<T>(): Observable<T> {

    return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplates());
      });
  }

  getMonsterTemplateCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateCount(Id));
      });
  }

  getMonsterTemplateById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateById(Id));
      });
  }

  getMonsterTemplateByRuleset<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateByRuleset(Id));
      });
  }
  //getMonsterTemplateByRuleset_add<T>(Id: number): Observable<T> {
  //  let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}`;

  //  return this.http.get<T>(endpointUrl, this.getRequestHeaders())
  //    .catch(error => {
  //      return this.handleError(error, () => this.getMonsterTemplateByRuleset_add(Id));
  //    });
  //}

  getMonsterTemplateByRuleset_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateByRuleset(Id));
      });
  }

  getMonsterTemplateByRuleset_spWithPagination<T>(Id: number, page: number, pageSize: number, sortType: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateByRuleset_spWithPagination(Id, page, pageSize,sortType));
      });
  }
  getMonsterByRuleset_spWithPagination<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getMonstersByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterByRuleset_spWithPagination(Id, page, pageSize));
      });
  }

  getMonsterTemplateCommands_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getMonsterTemplateCommands_api}?MonsterTemplateId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateCommands_sp(Id));
      });
  }
  getMonsterTemplateAssociateRecords_sp<T>(Id: number, rulesetId: number): Observable<T> {
    let endpointUrl = `${this.getMonsterTemplateAssociateRecords_sp_api}?MonsterTemplateId=${Id}&rulesetId=${rulesetId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateAssociateRecords_sp(Id, rulesetId));
      });
  }

  createMonsterTemplate<T>(MonsterTemplate: MonsterTemplate): Observable<T> {

    let endpointUrl = this.createUrl;

    if (MonsterTemplate.monsterTemplateId == 0 || MonsterTemplate.monsterTemplateId === undefined)
      endpointUrl = this.createUrl;
    else
      endpointUrl = this.updateUrl;

    return this.http.post(endpointUrl, JSON.stringify(MonsterTemplate), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createMonsterTemplate(MonsterTemplate));
      });
  }
  createMonster<T>(MonsterTemplate: MonsterTemplate): Observable<T> {

    let endpointUrl = this.createMonsterUrl;

    if (MonsterTemplate.monsterTemplateId == 0 || MonsterTemplate.monsterTemplateId === undefined)
      endpointUrl = this.createMonsterUrl;
    else
      endpointUrl = this.updateMonsterUrl;

    return this.http.post(endpointUrl, JSON.stringify(MonsterTemplate), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createMonster(MonsterTemplate));
      });
  }

  duplicateMonsterTemplate<T>(MonsterTemplate: MonsterTemplate): Observable<T> {
    //ability.abilityId = 0;
    let endpointUrl = this.duplicateUrl;

    return this.http.post(endpointUrl, JSON.stringify(MonsterTemplate), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateMonsterTemplate(MonsterTemplate));
      });
  }

  updateMonsterTemplate<T>(MonsterTemplate: MonsterTemplate): Observable<T> {

    return this.http.put<T>(this.updateUrl, JSON.stringify(MonsterTemplate), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateMonsterTemplate(MonsterTemplate));
      });
  }

  deleteMonsterTemplate<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteMonsterTemplate(Id));
      });
  }

  deleteMonsterTemplate_up<T>(MonsterTemplate: MonsterTemplate): Observable<T> {
    let endpointUrl = this.deleteUrl_up; //`${this.deleteUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(MonsterTemplate), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteMonsterTemplate_up(MonsterTemplate));
      });
  }

  deployMonster<T>(deployMonsterInfo): Observable<T>{
    let endpointUrl = this.deployMonster_api;

    return this.http.post<T>(endpointUrl, JSON.stringify(deployMonsterInfo), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deployMonster(deployMonsterInfo));
      });

  }
  //enableAbility<T>(Id: number): Observable<T> {
  //  let endpointUrl = `${this.enableAbilityUrl}?id=${Id}`;

  //  return this.http.post<T>(endpointUrl, this.getRequestHeaders())
  //    .catch(error => {
  //      return this.handleError(error, () => this.enableAbility(Id));
  //    });
  //}
  enableCombatTracker<T>(Id: number, enableCombatTracker:boolean): Observable<T> {
    let endpointUrl = `${this.enableCombatTrackerUrl}?monsterId=${Id}&enableCombatTracker=${enableCombatTracker}`;

    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.enableCombatTracker(Id, enableCombatTracker));
      });
  }

  fileUpload(fileToUpload: File) {
    return this.fileUploadMethod<any>(fileToUpload);
  }

  private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
    return this.fileUploadService.fileUpload<T>(this.uploadUrl, fileToUpload);
  }

  //bind form model
  public MonsterTemplateModelData(monsterTemplateVM: any, _view: string): any {

    if (monsterTemplateVM == null) return { monsterTemplateId: 0, ruleSetId: 0 };

    let monsterTemplateFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {

      monsterTemplateFormModal = {
        monsterTemplateId: monsterTemplateVM.monsterTemplateId,
        ruleSetId: monsterTemplateVM.ruleSetId,
        name: _view === 'DUPLICATE' ? '' : monsterTemplateVM.name,        
        command: monsterTemplateVM.command,
        commandName: monsterTemplateVM.commandName,
        showUse: monsterTemplateVM.command == null || monsterTemplateVM.command == undefined || monsterTemplateVM.command == '' ? false : true,
        monsterTemplateCommandVM: monsterTemplateVM.monsterTemplateCommand == undefined
          ?
          monsterTemplateVM.monsterTemplateCommandVM == undefined ? [] : monsterTemplateVM.monsterTemplateCommandVM
          : monsterTemplateVM.monsterTemplateCommand,
        
        description: monsterTemplateVM.description,
        stats: monsterTemplateVM.stats,
        imageUrl: monsterTemplateVM.imageUrl,
       
        ruleset: monsterTemplateVM.ruleset,
        showIcon: false,
        metatags: monsterTemplateVM.metatags == null || monsterTemplateVM.metatags == undefined ? '' : monsterTemplateVM.metatags,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        //sortOrder: monsterTemplateVM.sortOrder
        //monsterTemplateBuffAndEffects: monsterTemplateVM.monsterTemplateBuffAndEffects == null ? [] : monsterTemplateVM.monsterTemplateBuffAndEffects,
        //monsterTemplateBuffAndEffectVM: monsterTemplateVM.monsterTemplateBuffAndEffectVM == undefined ? [] : monsterTemplateVM.monsterTemplateBuffAndEffectVM,


        health:monsterTemplateVM.health,
        armorClass : monsterTemplateVM.armorClass,
        xPValue : monsterTemplateVM.xPValue,
        challangeRating : monsterTemplateVM.challangeRating,
        initiativeCommand : monsterTemplateVM.initiativeCommand,
        isRandomizationEngine : monsterTemplateVM.isRandomizationEngine,




        monsterTemplateBuffAndEffects: monsterTemplateVM.monsterTemplateBuffAndEffects == null ? [] : monsterTemplateVM.monsterTemplateBuffAndEffects,
        monsterTemplateBuffAndEffectVM: monsterTemplateVM.monsterTemplateBuffAndEffectVM == undefined ? [] : monsterTemplateVM.monsterTemplateBuffAndEffectVM,
        monsterTemplateAbilities: monsterTemplateVM.monsterTemplateAbilities == null ? [] : monsterTemplateVM.monsterTemplateAbilities,
        monsterTemplateAbilityVM: monsterTemplateVM.monsterTemplateAbilityVM == undefined ? [] : monsterTemplateVM.monsterTemplateAbilityVM,
        monsterTemplateSpells: monsterTemplateVM.monsterTemplateSpells == null ? [] : monsterTemplateVM.monsterTemplateSpells,
        monsterTemplateSpellVM: monsterTemplateVM.monsterTemplateSpellVM == undefined ? [] : monsterTemplateVM.monsterTemplateSpellVM,
        monsterTemplateAssociateMonsterTemplates: monsterTemplateVM.monsterTemplateAssociateMonsterTemplates == null ? [] : monsterTemplateVM.monsterTemplateAssociateMonsterTemplates,
        monsterTemplateAssociateMonsterTemplateVM: monsterTemplateVM.monsterTemplateAssociateMonsterTemplateVM == undefined ? [] : monsterTemplateVM.monsterTemplateAssociateMonsterTemplateVM,
      }
    }
    else {
      monsterTemplateFormModal = {
        monsterTemplateId: 0,
        ruleSetId: monsterTemplateVM.ruleSetId,
        showUse: false,
        monsterTemplateCommandVM: [],        
        ruleset: monsterTemplateVM.ruleset,
        showIcon: false,
        view: VIEW.ADD,
        metatags: '',
        level: '',
        commandName: 'Default',
        //sortOrder: monsterTemplateVM.sortOrder

        health : '',
        armorClass : '',
        xPValue :'',
        challangeRating : '',
        initiativeCommand : '',
        isRandomizationEngine : false,
        
       
       

        monsterTemplateBuffAndEffects: [],
        monsterTemplateBuffAndEffectVM: [],
        monsterTemplateAbilities: [],
        monsterTemplateAbilityVM: [],
        monsterTemplateSpells: [],
        monsterTemplateSpellVM: [],
        monsterTemplateAssociateMonsterTemplates: [],
        monsterTemplateAssociateMonsterTemplateVM: []
      }
    }

    return monsterTemplateFormModal;
  }

  public MonsterModelData(monsterVM: any, _view: string): any {
    let monsterTemplateVM = monsterVM.monsterTemplate;

    if (monsterTemplateVM == null) return { monsterTemplateId: 0, ruleSetId: 0 };

    let monsterTemplateFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {

      monsterTemplateFormModal = {
        monsterTemplateId: monsterTemplateVM.monsterTemplateId,
        ruleSetId: monsterTemplateVM.ruleSetId,
        name: _view === 'DUPLICATE' ? '' : monsterVM.name,
        command: monsterTemplateVM.command,
        commandName: monsterTemplateVM.commandName,
        showUse: monsterTemplateVM.command == null || monsterTemplateVM.command == undefined || monsterTemplateVM.command == '' ? false : true,
        monsterTemplateCommandVM: monsterTemplateVM.monsterTemplateCommand == undefined
          ?
          monsterTemplateVM.monsterTemplateCommandVM == undefined ? [] : monsterTemplateVM.monsterTemplateCommandVM
          : monsterTemplateVM.monsterTemplateCommand,

        description: monsterTemplateVM.description,
        stats: monsterTemplateVM.stats,
        imageUrl: monsterVM.imageUrl,

        ruleset: monsterTemplateVM.ruleset,
        showIcon: false,
        metatags: monsterVM.metatags == null || monsterVM.metatags == undefined ? '' : monsterVM.metatags,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        //sortOrder: monsterTemplateVM.sortOrder
        //monsterTemplateBuffAndEffects: monsterTemplateVM.monsterTemplateBuffAndEffects == null ? [] : monsterTemplateVM.monsterTemplateBuffAndEffects,
        //monsterTemplateBuffAndEffectVM: monsterTemplateVM.monsterTemplateBuffAndEffectVM == undefined ? [] : monsterTemplateVM.monsterTemplateBuffAndEffectVM,


        health: monsterTemplateVM.health,
        armorClass: monsterTemplateVM.armorClass,
        xPValue: monsterTemplateVM.xpValue,
        challangeRating: monsterTemplateVM.challangeRating,
        initiativeCommand: monsterTemplateVM.initiativeCommand,
        isRandomizationEngine: monsterTemplateVM.isRandomizationEngine,




        monsterTemplateBuffAndEffects: monsterTemplateVM.monsterTemplateBuffAndEffects == null ? [] : monsterTemplateVM.monsterTemplateBuffAndEffects,
        monsterTemplateBuffAndEffectVM: monsterTemplateVM.monsterTemplateBuffAndEffectVM == undefined ? [] : monsterTemplateVM.monsterTemplateBuffAndEffectVM,
        monsterTemplateAbilities: monsterTemplateVM.monsterTemplateAbilities == null ? [] : monsterTemplateVM.monsterTemplateAbilities,
        monsterTemplateAbilityVM: monsterTemplateVM.monsterTemplateAbilityVM == undefined ? [] : monsterTemplateVM.monsterTemplateAbilityVM,
        monsterTemplateSpells: monsterTemplateVM.monsterTemplateSpells == null ? [] : monsterTemplateVM.monsterTemplateSpells,
        monsterTemplateSpellVM: monsterTemplateVM.monsterTemplateSpellVM == undefined ? [] : monsterTemplateVM.monsterTemplateSpellVM,
        monsterTemplateAssociateMonsterTemplates: monsterTemplateVM.monsterTemplateAssociateMonsterTemplates == null ? [] : monsterTemplateVM.monsterTemplateAssociateMonsterTemplates,
        monsterTemplateAssociateMonsterTemplateVM: monsterTemplateVM.monsterTemplateAssociateMonsterTemplateVM == undefined ? [] : monsterTemplateVM.monsterTemplateAssociateMonsterTemplateVM,


        monsterHealthCurrent: monsterVM.healthCurrent,
        monsterHealthMax: monsterVM.healthMax,
        monsterArmorClass: monsterVM.armorClass,
        monsterChallangeRating: monsterVM.challangeRating,
        monsterXPValue: monsterVM.xPValue,
        //monsterImage: monsterVM.imageUrl,
        //monsterName: monsterVM.name,
        //monsterMetatags: monsterVM.metatags,
      }
    }
    else {
      monsterTemplateFormModal = {
        monsterTemplateId: 0,
        ruleSetId: monsterTemplateVM.ruleSetId,
        showUse: false,
        monsterTemplateCommandVM: [],
        ruleset: monsterTemplateVM.ruleset,
        showIcon: false,
        view: VIEW.ADD,
        metatags: '',
        level: '',
        commandName: 'Default',
        //sortOrder: monsterTemplateVM.sortOrder

        health: '',
        armorClass: '',
        xPValue: '',
        challangeRating: '',
        initiativeCommand: '',
        isRandomizationEngine: false,




        monsterTemplateBuffAndEffects: [],
        monsterTemplateBuffAndEffectVM: [],
        monsterTemplateAbilities: [],
        monsterTemplateAbilityVM: [],
        monsterTemplateSpells: [],
        monsterTemplateSpellVM: [],
        monsterTemplateAssociateMonsterTemplates: [],
        monsterTemplateAssociateMonsterTemplateVM: [],
        monsterHealthCurrent: '',
        monsterHealthMax: '',
        monsterArmorClass: '',
        monsterChallangeRating: '',
        monsterXPValue: '',
        //monsterImage: '',
        //monsterName: '',
        //monsterMetatags: '',
      }
    }

    return monsterTemplateFormModal;
  }


}
