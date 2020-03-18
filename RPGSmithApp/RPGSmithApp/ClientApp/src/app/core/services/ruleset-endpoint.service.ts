
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { CustomDice } from '../models/view-models/custome-dice.model';
import { Ruleset } from '../models/view-models/ruleset.model';

@Injectable()
export class RulesetEndpoint extends EndpointFactory {

  private readonly _getUrl: string = "/api/RuleSet/GetRuleSets";
  private readonly _getByUserUrl: string = "/api/RuleSet/GetRuleSetByUserId";
  private readonly _getAllUrl: string = "/api/RuleSet/GetAllRuleSets";
  private readonly _getCountUrl: string = "/api/RuleSet/GetRuleSetsCount";
  private readonly _getRCCountUrl: string = "/api/RuleSet/GetRuleSetAndCharacterCount";
  private readonly _getRulesetRecordCountUrl: string = "/api/RuleSet/getRulesetRecordCountById"; //
  private readonly _createUrl: string = "/api/RuleSet/CreateRuleSet";
  private readonly _uploadImgUrl: string = "/api/RuleSet/UpLoadRuleSetImage";
  private readonly _updateUrl: string = "/api/RuleSet/UpdateRuleSet";
  private readonly _deleteUrl: string = "/api/RuleSet/DeleteRuleSet";
  private readonly _duplicateUrl: string = "/api/RuleSet/DuplicateRuleSet";
  private readonly _addEditCustomDiceUrl: string = "/api/RuleSet/addEditCustomDice";
  private readonly _getCustomDiceUrl: string = "/api/RuleSet/GetCustomDice";
  private readonly _getDefaultDiceUrl: string = "/api/RuleSet/GetDefaultDice";  
  

  private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/RuleSet/GetRuleSetById";
  private readonly getAllRuleSetByUserIdUrl: string = this.configurations.baseUrl + "/api/RuleSet/GetAllRuleSetByUserId";
  private readonly getRuleSetToCreateCharacterByUserIdUrl: string = this.configurations.baseUrl + "/api/RuleSet/GetRuleSetToCreateCharacterByUserId";
  private readonly importRuleSet: string = this.configurations.baseUrl + "/api/RuleSet/ImportRuleSet";
  private readonly shareRuleSetCodeApi: string = this.configurations.baseUrl + "/api/RuleSet/ShareRuleSetCode";
  private readonly getCoreRulesetsApi: string = this.configurations.baseUrl + "/api/RuleSet/GetCoreRuleSets";
  private readonly addRulesetsApi: string = this.configurations.baseUrl + "/api/RuleSet/addRuleSets";
  private readonly updateUserPurchasedRulesetApi: string = this.configurations.baseUrl + "/api/RuleSet/updateUserPurchasedRuleset";
  private readonly updateLastCommandUrl: string = this.configurations.baseUrl + "/api/RuleSet/UpdateLastCommand";
  private readonly createCommandUrl: string = this.configurations.baseUrl + "/api/RuleSet/createCommand";
  private readonly updateCommandUrl: string = this.configurations.baseUrl + "/api/RuleSet/updateCommand";
  private readonly deleteCommandUrl: string = this.configurations.baseUrl + "/api/RuleSet/deleteCommand";

  private readonly exportApi: string = this.configurations.baseUrl + "/api/RuleSet/Export";
  private readonly importApi: string = this.configurations.baseUrl + "/api/RuleSet/Import";
  private readonly importItemTemplateUrl: string = this.configurations.baseUrl + "/api/RuleSet/Import_ItemTemplate";

  private readonly ImportSpellsUrl: string = this.configurations.baseUrl + "/api/RuleSet/Import_Spell";

  private readonly ImportAbilityUrl: string = this.configurations.baseUrl + "/api/RuleSet/Import_Ability";

  private readonly GetCopiedRulesetIDApi: string = this.configurations.baseUrl + "/api/RuleSet/GetCopiedRulesetID";

  private Camp_DashboardData: any;
  private campaignDetails: any;
  private Rulesets: any[] = [];

  get getUrl() { return this.configurations.baseUrl + this._getUrl; }
  get getByUserUrl() { return this.configurations.baseUrl + this._getByUserUrl; }
  get getAllUrl() { return this.configurations.baseUrl + this._getAllUrl; }
  get getCountUrl() { return this.configurations.baseUrl + this._getCountUrl; }
  get getRCCountUrl() { return this.configurations.baseUrl + this._getRCCountUrl; }
  get getRulesetRecordCountUrl() { return this.configurations.baseUrl + this._getRulesetRecordCountUrl; }
  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get uploadImgUrl() { return this.configurations.baseUrl + this._uploadImgUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get duplicateUrl() { return this.configurations.baseUrl + this._duplicateUrl; }
  get addEditCustomDiceUrl() { return this.configurations.baseUrl + this._addEditCustomDiceUrl; }
  get getCustomDiceApi() { return this.configurations.baseUrl + this._getCustomDiceUrl; }
  get getDefaultDiceApi() { return this.configurations.baseUrl + this._getDefaultDiceUrl; }


  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  getRulesetById<T>(rulesetId: number): Observable<T> {
      let endpointUrl = `${this.getByIdUrl}?id=${rulesetId}`;

      return this.http.get(endpointUrl, this.getRequestHeaders())
        .catch(error => {
          return this.handleError(error, () => this.getRulesetById(rulesetId));
        });
  }

  getRulesetById_Cache<T>(rulesetId: number, isFromCampaigns: any): Observable<T> {
    if (isFromCampaigns) {
      return Observable.of(this.campaignDetails);
    }
    else {
      let endpointUrl = `${this.getByIdUrl}?id=${rulesetId}`;

      return this.http.get(endpointUrl, this.getRequestHeaders()).map(res => res).do(campaignDetailsInfo => this.campaignDetails = campaignDetailsInfo)
        .catch(error => {
          return this.handleError(error, () => this.getRulesetById(rulesetId));
        });
    }
  }
  getRulesetById_CacheNew<T>(rulesetId: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${rulesetId}`;

    let record = this.Rulesets.findIndex(x => x.ruleSetId == rulesetId);
    if (record > -1) {
      return Observable.of(this.Rulesets[record]);
    } else {
      return this.http.get(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.Rulesets.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getRulesetById(rulesetId));
        });
    }
  }
  
  getRulesetsEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
    let endpointUrl = page && pageSize ? `${this.getUrl}?page=${page}&pageSize=${pageSize}` : this.getUrl;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRulesetsEndpoint(page, pageSize));
      });
  }

  getAllRuleSetByUserId<T>(id?: string, page?: number, pageSize?: number): Observable<T> {
    let endpointUrl = `${this.getAllRuleSetByUserIdUrl}?id=${id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAllRuleSetByUserId(id, page, pageSize));
      });
  }

  getRuleSetToCreateCharacterByUserId<T>(id?: string, page?: number, pageSize?: number): Observable<T> {
    let endpointUrl = `${this.getRuleSetToCreateCharacterByUserIdUrl}?id=${id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRuleSetToCreateCharacterByUserId(id, page, pageSize));
      });
  }

  getAllRulesetsEndpoint<T>(): Observable<T> {
    return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getAllRulesetsEndpoint());
      });
  }

  getRulesetsCountEndpoint(userId: string) {
    let endpointUrl = `${this.getCountUrl}?id=${userId}`;

    return this.http.get(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRulesetsCountEndpoint(userId));
      });
  }

  getRulesetAndCharactrCountEndpoint(userId: string) {
    let endpointUrl = `${this.getRCCountUrl}?id=${userId}`;

    return this.http.get(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRulesetAndCharactrCountEndpoint(userId));
      });
  }

  getRulesetRecordCountEndpoint(rulesetId: number): any {
    let endpointUrl = `${this.getRulesetRecordCountUrl}?id=${rulesetId}`;

    return this.http.get(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRulesetRecordCountEndpoint(rulesetId));
      });
  }

  getRulesetsByUserEndpoint<T>(Id: string): Observable<T> {
    let endpointUrl = `${this.getByUserUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRulesetsByUserEndpoint(Id));
      });
  }

  getCoreRulesets<T>(Id: string): Observable<T> {
    let endpointUrl = `${this.getCoreRulesetsApi}?id=${Id}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCoreRulesets(Id));
      });
  }

  getmockRulesetsEndpoint<T>(page?: number, pageSize?: number): Observable<T> {

    return this.http.get<T>(this.getUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getmockRulesetsEndpoint(page, pageSize));
      });
  }

  createRulesetEndpoint<T>(userObject: any): Observable<T> {

    let rulesetUrl = this.createUrl;

    if (userObject.ruleSetId == 0 || userObject.ruleSetId === undefined)
      rulesetUrl = this.createUrl;
    else
      rulesetUrl = this.updateUrl;

    return this.http.post<T>(rulesetUrl, JSON.stringify(userObject), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createRulesetEndpoint(userObject));
      });
  }

  UploadImgEndpoint<T>(fileToUpload: File): Observable<T> {

    return this.http.post<T>(this.uploadImgUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.UploadImgEndpoint(fileToUpload));
      });
  }

  updateRulesetEndpoint<T>(userObject: any): Observable<T> {

    return this.http.put<T>(this.updateUrl, JSON.stringify(userObject), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateRulesetEndpoint(userObject));
      });
  }

  deleteRulesetEndpoint<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteRulesetEndpoint(Id));
      });
  }

  duplicateRulesetEndpoint<T>(userObject: any): Observable<T> {

    /*as duplicate api is not created*/
    //let rulesetUrl = this.createUrl;
    //userObject.ruleSetId = 0;
    //return this.http.post<T>(rulesetUrl, JSON.stringify(userObject), this.getRequestHeaders())
    //    .catch(error => {
    //        return this.handleError(error, () => this.createRulesetEndpoint(userObject));
    //    });

    return this.http.post<T>(this.duplicateUrl, JSON.stringify(userObject), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateRulesetEndpoint(userObject));
      });
  }

  importRuleSetsEndpoint<T>(code: string): Observable<T> {

    let importRuleSetApi = `${this.importRuleSet}?code=${code}`;
    return this.http.get<T>(importRuleSetApi, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.importRuleSetsEndpoint(code));
      });
  }

  //addRuleSet
  addRuleSets<T>(rulesetIds: number[]): Observable<T> {

    return this.http.post<T>(this.addRulesetsApi, rulesetIds, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.addRuleSets(rulesetIds));
      });
  }
  updateUserPurchasedRuleset<T>(ruleset: Ruleset): Observable<T> {

    return this.http.post<T>(this.updateUserPurchasedRulesetApi, JSON.stringify(ruleset), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateUserPurchasedRuleset(ruleset));
      });
  }

  shareRuleSetCodeEndpoint<T>(email: string, code: string): Observable<T> {

    let shareCodeEndpoint = `${this.shareRuleSetCodeApi}?email=${email}&code=${code}`;

    return this.http.post<T>(shareCodeEndpoint, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.shareRuleSetCodeEndpoint(email, code));
      });
  }
  GetCopiedRulesetID<T>(rulesetID: number, UserID: string): Observable<T> {
    let GetCopiedRulesetIDEndpoint = `${this.GetCopiedRulesetIDApi}?rulesetID=${rulesetID}&UserID=${UserID}`;

    return this.http.get<T>(GetCopiedRulesetIDEndpoint, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.GetCopiedRulesetID(rulesetID, UserID));
      });
  }
  addEditCustomDice<T>(customDices: CustomDice[], rulesetId: number): any {
    let Endpoint = `${this.addEditCustomDiceUrl}?rulesetID=${rulesetId}`;
    return this.http.post<T>(Endpoint, JSON.stringify(customDices), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.addEditCustomDice(customDices, rulesetId));
      });
  }
  getCustomDice<T>(rulesetID: number): any {
    let getCustomDiceEndpoint = `${this.getCustomDiceApi}?rulesetID=${rulesetID}`;

    return this.http.get<T>(getCustomDiceEndpoint, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCustomDice(rulesetID));
      });
  }
  getDefaultDices<T>(): any {
    let getDefaultDiceEndpoint = `${this.getDefaultDiceApi}`;

    return this.http.get<T>(getDefaultDiceEndpoint, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getDefaultDices());
      });
  }

  updateLastCommand<T>(model: any): Observable<T> {

    let endpointUrl = this.updateLastCommandUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateLastCommand(model));
      });
  }

  addOrEdit<T>(model: any): Observable<T> {

    let endpointUrl = this.createUrl;

    if (model.rulesetCommandId == 0 || model.rulesetCommandId === undefined)
      endpointUrl = this.createCommandUrl;
    else
      endpointUrl = this.updateCommandUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(model), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.addOrEdit(model));
      });
  }

  delete<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.deleteCommandUrl}?id=${Id}`;
    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.delete(Id));
      });
    }

    exportRecord<T>(model: any): Observable<T> {
        return this.http.post<T>(this.exportApi, JSON.stringify(model), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.addOrEdit(model));
            });
    }

    importRecord<T>(model: any): Observable<T> {
        return this.http.post<T>(this.importApi, JSON.stringify(model), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.addOrEdit(model));
            });
    }
    importItemTemplates<T>(model: any): Observable<T> {
      return this.http.post<T>(this.importItemTemplateUrl, JSON.stringify(model), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.addOrEdit(model));
            });
  }
  ImportSpells<T>(model: any): Observable<T> {
    return this.http.post<T>(this.ImportSpellsUrl, JSON.stringify(model), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.addOrEdit(model));
            });
  }
  ImportAbilities<T>(model: any): Observable<T> {
    return this.http.post<T>(this.ImportAbilityUrl, JSON.stringify(model), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.addOrEdit(model));
            });
  } 
}

