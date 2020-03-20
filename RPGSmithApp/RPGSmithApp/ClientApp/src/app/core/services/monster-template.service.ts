import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";

//import { Ability } from '../models/view-models/monster-template.model';
import { VIEW } from '../models/enums';
import { MonsterTemplate } from '../models/view-models/monster-template.model';
import { MonsterBundle } from '../models/view-models/monster-bundle.model';
import { Bundle } from '../models/view-models/bundle.model';

@Injectable()
export class MonsterTemplateService extends EndpointFactory {

  private readonly _getAllUrl: string = "/api/MonsterTemplate/getAll";
  private readonly _getCountUrl: string = "/api/MonsterTemplate/getCountByRuleSetId";
  private readonly _getMonsterCountUrl: string = "/api/MonsterTemplate/getMonsterCountByRuleSetId";
  private readonly _createUrl: string = "/api/MonsterTemplate/create";
  private readonly _updateUrl: string = "/api/MonsterTemplate/update";
  private readonly _deleteUrl: string = "/api/MonsterTemplate/delete";
  private readonly _deleteUrl_up: string = "/api/MonsterTemplate/delete_up";
  private readonly _getByIdUrl: string = "/api/MonsterTemplate/GetById";
  private readonly _getByRulesetUrl: string = "/api/MonsterTemplate/getByRuleSetId";
  private readonly _getByRulesetUrl_add: string = "/api/MonsterTemplate/getByRuleSetId_add";
  private readonly _uploadUrl: string = "/api/MonsterTemplate/upLoadMonsterTemplateImageBlob";
  private readonly _duplicateUrl: string = "/api/MonsterTemplate/duplicate";
  private readonly DeleteMonsterTemplates: string = "/api/MonsterTemplate/DeleteMonsterTemplates";
  private readonly DeleteMonsters: string = "/api/MonsterTemplate/DeleteMonsters";
  private readonly AssignMonsterTocharacter: string = "/api/MonsterTemplate/AssignMonsterTocharacter";
  private readonly _duplicateMonsterUrl: string = "/api/MonsterTemplate/duplicateMonster";

  private monsterData: any;
  private monsterTemplateData: any;
  private addMonstersData: any;
  private alliesData: any;
  private MonsterDetail: any[] = [];
  private AssociateRecords: any[] = [];
  private MonsterTemplateDetail: any[] = [];
  private MonsterTemplateAssociateRecords: any[] = [];
  private MonsterBundleDetail: any[] = [];
  private ViewType: any;



  //private readonly _enableAbilityUrl: string = "/api/MonsterTemplate/toggleEnableAbility";

  private readonly getByRuleSetId_sp: string = this.configurations.baseUrl + "/api/MonsterTemplate/getByRuleSetId_sp";
  private readonly getMonstersByRuleSetId_sp: string = this.configurations.baseUrl + "/api/MonsterTemplate/getMonsterByRuleSetId_sp";
  private readonly getMonsterTemplateCommands_api: string = this.configurations.baseUrl + "/api/MonsterTemplate/getCommands_sp";
  private readonly getMonsterCommands_api: string = this.configurations.baseUrl + "/api/MonsterTemplate/getMonsterCommands_sp";

  private readonly getMonsterTemplateAssociateRecords_sp_api: string = this.configurations.baseUrl + "/api/MonsterTemplate/SP_GetAssociateRecords";
  private readonly getMonsterAssociateRecords_sp_api: string = this.configurations.baseUrl + "/api/MonsterTemplate/SP_GetMonsterAssociateRecords";

  private readonly enableCombatTrackerUrl: string = this.configurations.baseUrl + "/api/MonsterTemplate/enableCombatTracker";
  private readonly createMonsterUrl: string = this.configurations.baseUrl + "/api/MonsterTemplate/createMonster";
  private readonly updateMonsterUrl: string = this.configurations.baseUrl + "/api/MonsterTemplate/updateMonster";

  private readonly deployMonster_api = this.configurations.baseUrl + "/api/MonsterTemplate/DeployMonsterTemplate";
  private readonly getMonsterByIdUrl = this.configurations.baseUrl + "/api/MonsterTemplate/GetMonsterById";
  private readonly getMonsterItemsToDropUrl = this.configurations.baseUrl + "/api/MonsterTemplate/GetMonsterItemsToDrop";
  private readonly dropMonsterItemsUrl = this.configurations.baseUrl + "/api/MonsterTemplate/dropMonsterItems";
  private readonly dropMonsterItemsWithCurrencyApi = this.configurations.baseUrl + "/api/MonsterTemplate/DropMonsterItemsWithCurrency";
  private readonly addRemoveMonsterRecordsUrl = this.configurations.baseUrl + "/api/MonsterTemplate/addRemoveMonsterRecords";

  private readonly addMonsterUrl = this.configurations.baseUrl + "/api/MonsterTemplate/AddMonsters";
  private readonly deleteMonsterUrl_up = this.configurations.baseUrl + "/api/MonsterTemplate/deleteMonster_up";
  private readonly getByBundleUrl: string = this.configurations.baseUrl + "/api/MonsterTemplateBundle/getItemsByBundleId";

  private readonly createBundleUrl: string = this.configurations.baseUrl + "/api/MonsterTemplateBundle/create";
  private readonly updateBundleUrl: string = this.configurations.baseUrl + "/api/MonsterTemplateBundle/update";
  private readonly duplicateBundleUrl: string = this.configurations.baseUrl + "/api/MonsterTemplateBundle/DuplicateBundle";
  private readonly deleteBundleUrl: string = this.configurations.baseUrl + "/api/MonsterTemplateBundle/delete_up";
  private readonly getDetailByIdUrl: string = this.configurations.baseUrl + "/api/MonsterTemplateBundle/getDetailById";

  private readonly GetMonstersByRulesetId: string = this.configurations.baseUrl + "/api/MonsterTemplate/GetMonstersByRulesetId";

  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  get getAllUrl() { return this.configurations.baseUrl + this._getAllUrl; }
  get getCountUrl() { return this.configurations.baseUrl + this._getCountUrl; }
  get getMonsterCountUrl() { return this.configurations.baseUrl + this._getMonsterCountUrl; }
  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get deleteUrl_up() { return this.configurations.baseUrl + this._deleteUrl_up; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  get getByRulesetUrl() { return this.configurations.baseUrl + this._getByRulesetUrl; }
  get getByRulesetUrl_add() { return this.configurations.baseUrl + this._getByRulesetUrl_add; }

  get uploadUrl() { return this.configurations.baseUrl + this._uploadUrl; }
  get duplicateUrl() { return this.configurations.baseUrl + this._duplicateUrl; }
  get duplicateMonsterUrl() { return this.configurations.baseUrl + this._duplicateMonsterUrl; }
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

  getMonsterCountByRuleSetId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this._getMonsterCountUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterCountByRuleSetId(Id));
      });
  }

  getMonsterTemplateById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateById(Id));
      });
  }

  getMonsterTemplateById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    let record = this.MonsterTemplateDetail.findIndex(x => x.monsterTemplateId == Id);

    if (record > -1) {
      return Observable.of(this.MonsterTemplateDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.MonsterTemplateDetail.push(data))
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateById(Id));
        });
    }
  }

  getMonsterById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getMonsterByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterById(Id));
      });
  }

  getMonsterById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getMonsterByIdUrl}?id=${Id}`;

    let record = this.MonsterDetail.findIndex(x => x.monsterId == Id);

    if (record > -1) {
      return Observable.of(this.MonsterDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.MonsterDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getMonsterById(Id));
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

    let record = this.MonsterBundleDetail.findIndex(x => x.bundleId == Id);

    if (record > -1) {
      return Observable.of(this.MonsterBundleDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.MonsterBundleDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getBundleById(Id));
        });
    }
  }
  getMonsterTemplateByRuleset<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateByRuleset(Id));
      });
  }
  getMonsterTemplateByRuleset_add<T>(Id: number, includeBundles: boolean = false): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}&includeBundles=${includeBundles}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateByRuleset_add(Id, includeBundles));
      });
  }
  getMonsterTemplateByRuleset_add_Cache<T>(Id: number, includeBundles: boolean = false, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.addMonstersData = null;
    }
    if (this.addMonstersData != null) {
      return Observable.of(this.addMonstersData);
    }
    else {
      let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}&includeBundles=${includeBundles}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(addMonsterInfo => this.addMonstersData = addMonsterInfo)
        .catch(error => {
          return this.handleError(error, () => this.getMonsterTemplateByRuleset_add(Id, includeBundles));
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
  getMonsterTemplateByRuleset_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateByRuleset(Id));
      });
  }

  getMonsterTemplateByRuleset_spWithPagination_Cache<T>(Id: number, page: number, pageSize: number, sortType: number, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.monsterTemplateData = null;
    }
    if (this.monsterTemplateData != null) {
      return Observable.of(this.monsterTemplateData);
    }
    else {
      let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(monsterTempInfo => this.monsterTemplateData = monsterTempInfo)
        .catch(error => {
          return this.handleError(error, () => this.getMonsterTemplateByRuleset_spWithPagination(Id, page, pageSize, sortType));
        });
    }
  }

  getMonsterTemplateByRuleset_spWithPagination<T>(Id: number, page: number, pageSize: number, sortType: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateByRuleset_spWithPagination(Id, page, pageSize, sortType));
      });
  }

  getMonsterByRuleset_spWithPagination_Cache<T>(Id: number, page: number, pageSize: number, sortType: number, characterId: number = null, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.monsterData = null;
    }
    if (this.monsterData != null) {
      return Observable.of(this.monsterData);
    } else {
      let endpointUrl = `${this.getMonstersByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}&sortType=${sortType}&characterId=${characterId}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(monster => this.monsterData = monster)
        .catch(error => {
          return this.handleError(error, () => this.getMonsterByRuleset_spWithPagination(Id, page, pageSize, sortType, characterId));
        });
    }
  }

  createPageLastViews<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.monsterData != null) {
        this.monsterData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews<T>(pageLastViews));
      });
  }

  createPageLastViewsAllies<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.alliesData != null) {
        this.alliesData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews<T>(pageLastViews));
      });
  }

  createPageLastViewsMonsterTemplate<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.monsterTemplateData != null) {
        this.monsterTemplateData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViewsMonsterTemplate<T>(pageLastViews));
      });
  }

  getMonsterByRuleset_spWithPagination<T>(Id: number, page: number, pageSize: number, sortType: number, characterId: number = null): Observable<T> {
    let endpointUrl = `${this.getMonstersByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}&sortType=${sortType}&characterId=${characterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterByRuleset_spWithPagination(Id, page, pageSize, sortType, characterId));
      });
  }

  getMonsterByRuleset_spWithPagination_Cache_Allies<T>(Id: number, page: number, pageSize: number, sortType: number, characterId: number = null, isFromCharacterDashboard: boolean = false): Observable<T> {
    if (isFromCharacterDashboard) {
      this.alliesData = null;
    }
    if (this.alliesData != null) {
      return Observable.of(this.alliesData);
    } else {
      let endpointUrl = `${this.getMonstersByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}&sortType=${sortType}&characterId=${characterId}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(allies => this.alliesData = allies)
        .catch(error => {
          return this.handleError(error, () => this.getMonsterByRuleset_spWithPagination(Id, page, pageSize, sortType, characterId));
        });
    }
  }

  getMonsterTemplateCommands_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getMonsterTemplateCommands_api}?MonsterTemplateId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateCommands_sp(Id));
      });
  }
  getMonsterCommands_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getMonsterCommands_api}?monsterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterCommands_sp(Id));
      });
  }
  getMonsterTemplateAssociateRecords_sp<T>(Id: number, rulesetId: number, MonsterID: number = 0): Observable<T> {
    let endpointUrl = `${this.getMonsterTemplateAssociateRecords_sp_api}?MonsterTemplateId=${Id}&rulesetId=${rulesetId}&MonsterID=${MonsterID}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterTemplateAssociateRecords_sp(Id, rulesetId));
      });
  }
  getMonsterTemplateAssociateRecords_sp_Cache<T>(Id: number, rulesetId: number, MonsterID: number = 0): Observable<T> {
    let endpointUrl = `${this.getMonsterTemplateAssociateRecords_sp_api}?MonsterTemplateId=${Id}&rulesetId=${rulesetId}&MonsterID=${MonsterID}`;

    let record = this.MonsterTemplateAssociateRecords.findIndex(x => x.monsterTemplateId == MonsterID);

    if (record > -1) {
      return Observable.of(this.MonsterTemplateAssociateRecords[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.MonsterTemplateAssociateRecords.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getMonsterTemplateAssociateRecords_sp(Id, rulesetId));
        });
    }
  }
  getMonsterAssociateRecords_sp<T>(MonsterID: number, rulesetId: number): Observable<T> {
    let endpointUrl = `${this.getMonsterAssociateRecords_sp_api}?MonsterID=${MonsterID}&rulesetId=${rulesetId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterAssociateRecords_sp(MonsterID, rulesetId));
      });
  }
  getMonsterAssociateRecords_sp_Cache<T>(MonsterID: number, rulesetId: number): Observable<T> {
    let endpointUrl = `${this.getMonsterAssociateRecords_sp_api}?MonsterID=${MonsterID}&rulesetId=${rulesetId}`;

    let record = this.AssociateRecords.findIndex(x => x.monsterId == MonsterID);

    if (record > -1) {
      return Observable.of(this.AssociateRecords[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.AssociateRecords.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getMonsterAssociateRecords_sp(MonsterID, rulesetId));
        });
    }
  }

  getMonsterItemToDrop<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getMonsterItemsToDropUrl}?monsterId=${Id}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonsterItemToDrop(Id));
      });
  }

  dropMonsterItems<T>(monsterItems, monsterId): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointUrl = `${this.dropMonsterItemsUrl}?monsterId=${monsterId}`;
    return this.http.post(endpointUrl, JSON.stringify(monsterItems), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.dropMonsterItems(monsterItems, monsterId));
      });
  }

  dropMonsterItemsWithCurrency<T>(monsterItems, monsterId): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointUrl = `${this.dropMonsterItemsWithCurrencyApi}?monsterId=${monsterId}`;
    return this.http.post(endpointUrl, JSON.stringify(monsterItems), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.dropMonsterItems(monsterItems, monsterId));
      });
  }

  AddRemoveMonsterRecords<T>(records, monsterId, type): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    let endpointUrl = `${this.addRemoveMonsterRecordsUrl}?monsterId=${monsterId}&type=${type}`;
    return this.http.post(endpointUrl, JSON.stringify(records), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.AddRemoveMonsterRecords(records, monsterId, type));
      });
  }

  addMonster<T>(monsters): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    let endpointUrl = `${this.addMonsterUrl}`;

    return this.http.post(endpointUrl, JSON.stringify(monsters), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.addMonster(monsters));
      });
  }


  createMonsterTemplate<T>(MonsterTemplate: MonsterTemplate, isCreatingFromMonsterScreen: boolean, armorClass: number, health: number, challangeRating: number, xpValue: number): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;

    let endpointUrl = `${this.createUrl}?isCreatingFromMonsterScreen=${isCreatingFromMonsterScreen}&armorClass=${armorClass}&health=${health}&challangeRating=${challangeRating}&xpValue=${xpValue}`;

    if (MonsterTemplate.monsterTemplateId == 0 || MonsterTemplate.monsterTemplateId === undefined)
      endpointUrl = `${this.createUrl}?isCreatingFromMonsterScreen=${isCreatingFromMonsterScreen}&armorClass=${armorClass}&health=${health}&challangeRating=${challangeRating}&xpValue=${xpValue}`;
    else {
      endpointUrl = this.updateUrl;

      if (this.MonsterTemplateDetail && this.MonsterTemplateDetail.length) {
        let record = this.MonsterTemplateDetail.findIndex(x => x.monsterTemplateId == MonsterTemplate.monsterTemplateId);
        if (record > -1) {
          this.MonsterTemplateDetail.splice(record, 1);
        }
      }
    }

    return this.http.post(endpointUrl, JSON.stringify(MonsterTemplate), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createMonsterTemplate(MonsterTemplate, isCreatingFromMonsterScreen, armorClass, health, challangeRating, xpValue));
      });
  }
  createMonster<T>(MonsterTemplate: MonsterTemplate): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    let endpointUrl = this.createMonsterUrl;

    if (MonsterTemplate.monsterTemplateId == 0 || MonsterTemplate.monsterTemplateId === undefined)
      endpointUrl = this.createMonsterUrl;
    else {
      endpointUrl = this.updateMonsterUrl;

      //update only monster
      if (this.MonsterDetail && this.MonsterDetail.length) {
        let record = this.MonsterDetail.findIndex(x => x.monsterId == MonsterTemplate.monsterId);
        if (record > -1) {
          this.MonsterDetail.splice(record, 1);
        }
      }
    }

    return this.http.post(endpointUrl, JSON.stringify(MonsterTemplate), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createMonster(MonsterTemplate));
      });
  }
  createBundle<T>(bundle: MonsterBundle): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
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
  duplicateMonsterTemplate<T>(MonsterTemplate: MonsterTemplate, isCreatingFromMonsterScreen: boolean, armorClass: number, health: number, challangeRating: number, xpValue: number): Observable<T> {
    //ability.abilityId = 0;
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointUrl = `${this.duplicateUrl}?isCreatingFromMonsterScreen=${isCreatingFromMonsterScreen}&armorClass=${armorClass}&health=${health}&challangeRating=${challangeRating}&xpValue=${xpValue}`;

    return this.http.post(endpointUrl, JSON.stringify(MonsterTemplate), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateMonsterTemplate(MonsterTemplate, isCreatingFromMonsterScreen, armorClass, health, challangeRating, xpValue));
      });
  }
  duplicateBundle<T>(model: any): Observable<T> {
    //itemMaster.itemMasterId = 0;
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointUrl = this.duplicateBundleUrl;

    return this.http.post(endpointUrl, JSON.stringify(model), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateBundle(model));
      });
  }
  updateMonsterTemplate<T>(MonsterTemplate: MonsterTemplate): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    return this.http.put<T>(this.updateUrl, JSON.stringify(MonsterTemplate), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateMonsterTemplate(MonsterTemplate));
      });
  }

  deleteMonsterTemplate<T>(Id: number): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteMonsterTemplate(Id));
      });
  }

  deleteMonsterTemplate_up<T>(MonsterTemplate: MonsterTemplate): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointUrl = this.deleteUrl_up; //`${this.deleteUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(MonsterTemplate), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteMonsterTemplate_up(MonsterTemplate));
      });
  }
  deleteMonster_up<T>(Monster: any): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointUrl = this.deleteMonsterUrl_up; //`${this.deleteUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(Monster), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteMonster_up(Monster));
      });
  }
  deleteBundle<T>(bundle: Bundle): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointUrl = this.deleteBundleUrl;// `${this.deleteBundleUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(bundle), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteBundle(bundle));
      });
  }
  deployMonster<T>(deployMonsterInfo): Observable<T> {
    this.monsterData = null;
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
  enableCombatTracker<T>(Id: number, enableCombatTracker: boolean): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
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
        monsterTemplateCommandVM: monsterTemplateVM.monsterTemplateCommands == undefined
          ?
          monsterTemplateVM.monsterTemplateCommandVM == undefined ? [] : monsterTemplateVM.monsterTemplateCommandVM
          : monsterTemplateVM.monsterTemplateCommands,

        description: monsterTemplateVM.description,
        gmOnly: monsterTemplateVM.gmOnly,
        stats: monsterTemplateVM.stats,
        imageUrl: monsterTemplateVM.imageUrl,

        ruleset: monsterTemplateVM.ruleset,
        showIcon: false,
        metatags: monsterTemplateVM.metatags == null || monsterTemplateVM.metatags == undefined ? '' : monsterTemplateVM.metatags,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        //sortOrder: monsterTemplateVM.sortOrder
        //monsterTemplateBuffAndEffects: monsterTemplateVM.monsterTemplateBuffAndEffects == null ? [] : monsterTemplateVM.monsterTemplateBuffAndEffects,
        //monsterTemplateBuffAndEffectVM: monsterTemplateVM.monsterTemplateBuffAndEffectVM == undefined ? [] : monsterTemplateVM.monsterTemplateBuffAndEffectVM,


        health: monsterTemplateVM.health,
        armorClass: monsterTemplateVM.armorClass,
        xPValue: monsterTemplateVM.xPValue ? monsterTemplateVM.xPValue : monsterTemplateVM.xpValue,
        challangeRating: monsterTemplateVM.challangeRating,
        initiativeCommand: monsterTemplateVM.initiativeCommand,
        isRandomizationEngine: monsterTemplateVM.isRandomizationEngine,

        monsterTemplateCurrency: monsterTemplateVM.monsterTemplateCurrency,
        monsterCurrency: monsterTemplateVM.monsterTemplateCurrency,

        monsterTemplateBuffAndEffects: monsterTemplateVM.monsterTemplateBuffAndEffects == null ? [] : monsterTemplateVM.monsterTemplateBuffAndEffects,
        monsterTemplateBuffAndEffectVM: monsterTemplateVM.monsterTemplateBuffAndEffectVM == undefined ? [] : monsterTemplateVM.monsterTemplateBuffAndEffectVM,
        monsterTemplateAbilities: monsterTemplateVM.monsterTemplateAbilities == null ? [] : monsterTemplateVM.monsterTemplateAbilities,
        monsterTemplateAbilityVM: monsterTemplateVM.monsterTemplateAbilityVM == undefined ? [] : monsterTemplateVM.monsterTemplateAbilityVM,
        monsterTemplateSpells: monsterTemplateVM.monsterTemplateSpells == null ? [] : monsterTemplateVM.monsterTemplateSpells,
        monsterTemplateSpellVM: monsterTemplateVM.monsterTemplateSpellVM == undefined ? [] : monsterTemplateVM.monsterTemplateSpellVM,
        monsterTemplateAssociateMonsterTemplates: monsterTemplateVM.monsterTemplateAssociateMonsterTemplates == null ? [] : monsterTemplateVM.monsterTemplateAssociateMonsterTemplates,
        monsterTemplateAssociateMonsterTemplateVM: monsterTemplateVM.monsterTemplateAssociateMonsterTemplateVM == undefined ? [] : monsterTemplateVM.monsterTemplateAssociateMonsterTemplateVM,

        monsterTemplateItemMasters: monsterTemplateVM.monsterTemplateItemMasters == null ? [] : monsterTemplateVM.monsterTemplateItemMasters,
        monsterTemplateItemMasterVM: monsterTemplateVM.monsterTemplateItemMasterVM == undefined ? [] : monsterTemplateVM.monsterTemplateItemMasterVM,
        randomizationEngine: monsterTemplateVM.randomizationEngine ? [] : monsterTemplateVM.randomizationEngine,
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

        monsterTemplateCurrency: monsterTemplateVM.monsterTemplateCurrency,
        monsterCurrency: monsterTemplateVM.monsterTemplateCurrency,

        monsterTemplateBuffAndEffects: [],
        monsterTemplateBuffAndEffectVM: [],
        monsterTemplateAbilities: [],
        monsterTemplateAbilityVM: [],
        monsterTemplateSpells: [],
        monsterTemplateSpellVM: [],
        monsterTemplateAssociateMonsterTemplates: [],
        monsterTemplateAssociateMonsterTemplateVM: [],
        monsterTemplateItemMasters: [],
        monsterTemplateItemMasterVM: [],

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
        //monsterTemplateCommandVM: monsterTemplateVM.monsterTemplateCommand == undefined
        //  ?
        //  monsterTemplateVM.monsterTemplateCommandVM == undefined ? [] : monsterTemplateVM.monsterTemplateCommandVM
        //  : monsterTemplateVM.monsterTemplateCommand,
        monsterTemplateCommandVM: monsterVM.monsterCommands == undefined
          ?
          monsterVM.monsterTemplateCommandVM == undefined ? [] : monsterVM.monsterTemplateCommandVM
          : monsterVM.monsterCommands,

        description: monsterTemplateVM.description,
        gmOnly: monsterTemplateVM.gmOnly,
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

        monsterTemplateCurrency: monsterTemplateVM ? monsterTemplateVM.monsterTemplateCurrency : [],
        monsterCurrency: monsterVM.monsterCurrency ? monsterVM.monsterCurrency : (monsterTemplateVM ? monsterTemplateVM.monsterTemplateCurrency : []),

        monsterTemplateBuffAndEffects: monsterTemplateVM.monsterTemplateBuffAndEffects == null ? [] : monsterTemplateVM.monsterTemplateBuffAndEffects,
        monsterTemplateBuffAndEffectVM: monsterTemplateVM.monsterTemplateBuffAndEffectVM == undefined ? [] : monsterTemplateVM.monsterTemplateBuffAndEffectVM,
        monsterTemplateAbilities: monsterTemplateVM.monsterTemplateAbilities == null ? [] : monsterTemplateVM.monsterTemplateAbilities,
        monsterTemplateAbilityVM: monsterTemplateVM.monsterTemplateAbilityVM == undefined ? [] : monsterTemplateVM.monsterTemplateAbilityVM,
        monsterTemplateSpells: monsterTemplateVM.monsterTemplateSpells == null ? [] : monsterTemplateVM.monsterTemplateSpells,
        monsterTemplateSpellVM: monsterTemplateVM.monsterTemplateSpellVM == undefined ? [] : monsterTemplateVM.monsterTemplateSpellVM,
        monsterTemplateAssociateMonsterTemplates: monsterTemplateVM.monsterTemplateAssociateMonsterTemplates == null ? [] : monsterTemplateVM.monsterTemplateAssociateMonsterTemplates,
        monsterTemplateAssociateMonsterTemplateVM: monsterTemplateVM.monsterTemplateAssociateMonsterTemplateVM == undefined ? [] : monsterTemplateVM.monsterTemplateAssociateMonsterTemplateVM,

        addToCombatTracker: monsterVM.addToCombatTracker,
        monsterHealthCurrent: monsterVM.healthCurrent,
        monsterHealthMax: monsterVM.healthMax,
        monsterArmorClass: monsterVM.armorClass,
        monsterChallangeRating: monsterVM.challangeRating,
        monsterXPValue: monsterVM.xPValue ? monsterVM.xPValue : monsterVM.xpValue ? monsterVM.xpValue : 0,
        monsterImage: monsterVM.imageUrl,
        monsterName: monsterVM.name,
        monsterMetatags: monsterVM.metatags,
        monsterId: monsterVM.monsterId,
        characterId: monsterVM.characterId ? monsterVM.characterId : 0,
        character: monsterVM.character ? monsterVM.character : null
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

        monsterTemplateCurrency: monsterTemplateVM ? monsterTemplateVM.monsterTemplateCurrency : [],
        monsterCurrency: monsterVM.monsterCurrency ? monsterVM.monsterCurrency : (monsterTemplateVM ? monsterTemplateVM.monsterTemplateCurrency : []),

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
        metatags: _bundleTemplateVM.metatags == null ? '' : _bundleTemplateVM.metatags,
        ruleSet: _bundleTemplateVM.ruleSet,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        addToCombat: _bundleTemplateVM.addToCombat
      }
    }
    else {
      bundleFormModal = {
        bundleId: 0,
        ruleSetId: _bundleTemplateVM.ruleSetId,
        view: VIEW.ADD,
        ruleSet: _bundleTemplateVM.ruleSet,
        metatags: '',
        addToCombat: false
      }
    }
    return bundleFormModal;
  }

  deleteMonsterTemplates<T>(TemplatesList: any, rulesetId: number): Observable<T> {
    this.monsterTemplateData = null;
    this.monsterData = null;
    this.addMonstersData = null;
    let endpointURL = `${this.DeleteMonsterTemplates}?rulesetId=${rulesetId}`;
    return this.http.post<T>(endpointURL, JSON.stringify(TemplatesList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteMonsterTemplates(TemplatesList, rulesetId));
      });
  }
  deleteMonsters<T>(monstersList: any, rulesetId: number): Observable<T> {
    //this.monsterTemplateData = null;
    this.monsterData = null;
    let endpointURL = `${this.DeleteMonsters}?rulesetId=${rulesetId}`;
    return this.http.post<T>(endpointURL, JSON.stringify(monstersList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteMonsters(monstersList, rulesetId));
      });
  }

  assignMonsterTocharacter<T>(model): Observable<T> {
    this.monsterData = null;
    this.alliesData = null;
    let endpointUrl = `${this.AssignMonsterTocharacter}`;
    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.assignMonsterTocharacter(model));
      });
  }
  duplicateMonster<T>(MonsterTemplate: any, addToCombat: boolean, characterId: number): Observable<T> {
    //this.monsterTemplateData = null;
    this.monsterData = null;
    let endpointUrl = `${this.duplicateMonsterUrl}?addToCombat=${addToCombat}&characterId=${characterId}`;
    return this.http.post(endpointUrl, JSON.stringify(MonsterTemplate), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateMonster(MonsterTemplate, addToCombat, characterId));
      });
  }

  getMonstersByRuleSetId<T>(ruleSetId: number): Observable<T> {
    let endpointUrl = `${this.GetMonstersByRulesetId}?ruleSetId=${ruleSetId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getMonstersByRuleSetId(ruleSetId));
      });
  }

}
