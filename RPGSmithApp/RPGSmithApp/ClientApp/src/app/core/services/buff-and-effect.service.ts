import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";

import { VIEW } from '../models/enums';
import { BuffAndEffect } from '../models/view-models/buff-and-effect.model';
import { ServiceUtil } from './service-util';
import { Characters } from '../models/view-models/characters.model';

@Injectable()
export class BuffAndEffectService extends EndpointFactory {

 // private readonly _getAllUrl: string = "/api/BuffAndEffect/getAll";
  private readonly _getCountUrl: string = "/api/BuffAndEffect/getCountByRuleSetId";
  private readonly _createUrl: string = "/api/BuffAndEffect/create";
  private readonly _updateUrl: string = "/api/BuffAndEffect/update";
  //private readonly _deleteUrl: string = "/api/BuffAndEffect/delete";
  private readonly _deleteUrl_up: string = "/api/BuffAndEffect/delete_up";
  private readonly _getByIdUrl: string = "/api/BuffAndEffect/GetById";
 // private readonly _getByRulesetUrl: string = "/api/BuffAndEffect/getByRuleSetId";
  private readonly _getByRulesetUrl_add: string = "/api/BuffAndEffect/getByRuleSetId_add";
  private readonly _uploadUrl: string = "/api/BuffAndEffect/upLoadImageBlob";
  private readonly _duplicateUrl: string = "/api/BuffAndEffect/duplicate";

  private readonly getByRuleSetId_sp: string = this.configurations.baseUrl + "/api/BuffAndEffect/getByRuleSetId_sp";
  private readonly getCommands_api: string = this.configurations.baseUrl + "/api/BuffAndEffect/getCommands_sp";
  private readonly _assignBuffAndEffectToCharacterURL: string = "/api/BuffAndEffect/assignBuffAndEffectToCharacter";
  private readonly _getBuffAndEffectAssignedToCharacterURL: string = "/api/BuffAndEffect/getBuffAndEffectAssignedToCharacter";
  private readonly _getOnlyByRulesetUrl: string = "/api/BuffAndEffect/GetOnlyCharactersByRuleSetId";
  private readonly _getCharacterBuffAndEffectByIdUrl: string = "/api/BuffAndEffect/getCharacterBuffAndEffectById";
  private readonly DeleteRecords: string = "/api/BuffAndEffect/DeleteRecords";

  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  private buffEffectsData: any;
  private buffAndEffectDetail: any[]=[];
  private CharacterBuffAndEffectDetail: any[]=[];
  private ViewType: any;
  

  //get getAllUrl() { return this.configurations.baseUrl + this._getAllUrl; }
  get getCountUrl() { return this.configurations.baseUrl + this._getCountUrl; }
  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  //get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get deleteUrl_up() { return this.configurations.baseUrl + this._deleteUrl_up; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  //get getByRulesetUrl() { return this.configurations.baseUrl + this._getByRulesetUrl; }
  get getByRulesetUrl_add() { return this.configurations.baseUrl + this._getByRulesetUrl_add; }

  get uploadUrl() { return this.configurations.baseUrl + this._uploadUrl; }
  get duplicateUrl() { return this.configurations.baseUrl + this._duplicateUrl; }
  get assignBuffAndEffectToCharacterURL() { return this.configurations.baseUrl + this._assignBuffAndEffectToCharacterURL; }
  get getBuffAndEffectAssignedToCharacterURL() { return this.configurations.baseUrl + this._getBuffAndEffectAssignedToCharacterURL; }
  get getOnlyByRulesetUrl() { return this.configurations.baseUrl + this._getOnlyByRulesetUrl; }
  get getCharacterBuffAndEffectByIdUrl() { return this.configurations.baseUrl + this._getCharacterBuffAndEffectByIdUrl; }
  
  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  //getBuffAndEffects<T>(): Observable<T> {

  //  return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
  //    .catch(error => {
  //      return this.handleError(error, () => this.getBuffAndEffects());
  //    });
  //}

  getBuffAndEffectsCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffectsCount(Id));
      });
  }
  getCharacterBuffAndEffectById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCharacterBuffAndEffectByIdUrl}?CharacterBuffAndEffectID=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffectsCount(Id));
      });
  }
  getCharacterBuffAndEffectById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCharacterBuffAndEffectByIdUrl}?CharacterBuffAndEffectID=${Id}`;

    let record = this.CharacterBuffAndEffectDetail.findIndex(x => x.characterBuffAndEffectId == Id);
    if (record > -1) {
      return Observable.of(this.CharacterBuffAndEffectDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.CharacterBuffAndEffectDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getBuffAndEffectsCount(Id));
        });
    }
  }

  getBuffAndEffectById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffectById(Id));
      });
  }

  getBuffAndEffectById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    let record = this.buffAndEffectDetail.findIndex(x => x.buffAndEffectId == Id);

    if (record > -1) {
      return Observable.of(this.buffAndEffectDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.buffAndEffectDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getBuffAndEffectById(Id));
        });
    }
  }

  //getBuffAndEffectByRuleset<T>(Id: number): Observable<T> {
  //  let endpointUrl = `${this.getByRulesetUrl}?rulesetId=${Id}`;

  //  return this.http.get<T>(endpointUrl, this.getRequestHeaders())
  //    .catch(error => {
  //      return this.handleError(error, () => this.getBuffAndEffectByRuleset(Id));
  //    });
  //}
  getBuffAndEffectByRuleset_add<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffectByRuleset_add(Id));
      });
  }
  getBuffAndEffectAssignedToCharacter<T>(characterId: number): Observable<T> {
    let endpointUrl = `${this.getBuffAndEffectAssignedToCharacterURL}?characterId=${characterId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffectAssignedToCharacter(characterId));
      });
  }

  getBuffAndEffectByRuleset_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffectByRuleset_sp(Id));
      });
  }

  getBuffAndEffectByRuleset_spWithPagination<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffectByRuleset_spWithPagination(Id, page, pageSize));
      });
  }

  getBuffAndEffectByRuleset_spWithPagination_Cache<T>(Id: number, page: number, pageSize: number, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.buffEffectsData = null;
    }
    if (this.buffEffectsData != null) {
      return Observable.of(this.buffEffectsData);
    }
    else {
      let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(buffEffectsInfo => this.buffEffectsData = buffEffectsInfo)
        .catch(error => {
          return this.handleError(error, () => this.getBuffAndEffectByRuleset_spWithPagination(Id, page, pageSize));
        });
    }
  }

  createPageLastViews<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.buffEffectsData != null) {
        this.buffEffectsData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews<T>(pageLastViews));
      });
  }

  getBuffAndEffectCommands_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCommands_api}?buffAndEffectID=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getBuffAndEffectCommands_sp(Id));
      });
  }
  getOnlyCharactersByRuleSetId<T>(Id: number, buffAndEffectId: number): Observable<T> {
    let endpointUrl = `${this.getOnlyByRulesetUrl}?id=${Id}&buffAndEffectId=${buffAndEffectId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getOnlyCharactersByRuleSetId(Id, buffAndEffectId));
      });
  }
  createBuffAndEffect<T>(buffAndEffect: BuffAndEffect, IsFromCharacter: boolean, characterID: number): Observable<T> {
    this.buffEffectsData = null;
    let endpointUrl = this.createUrl + '?IsFromCharacter=' + IsFromCharacter + '&characterID=' + characterID;;

    if (buffAndEffect.buffAndEffectId == 0 || buffAndEffect.buffAndEffectId === undefined)
      endpointUrl = this.createUrl + '?IsFromCharacter=' + IsFromCharacter + '&characterID=' + characterID;
    else {
      endpointUrl = this.updateUrl;

      if (this.buffAndEffectDetail && this.buffAndEffectDetail.length) {
        let record = this.buffAndEffectDetail.findIndex(x => x.buffAndEffectId == buffAndEffect.buffAndEffectId);
        if (record > -1) {
          this.buffAndEffectDetail.splice(record, 1);
        }
      } else if (this.CharacterBuffAndEffectDetail && this.CharacterBuffAndEffectDetail.length) {
        let record = this.CharacterBuffAndEffectDetail.findIndex(x => x.characterBuffAndEffectId == buffAndEffect.buffAndEffectId);
        if (record > -1) {
          this.CharacterBuffAndEffectDetail.splice(record, 1);
        }
      }
        
    }


    return this.http.post(endpointUrl, JSON.stringify(buffAndEffect), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createBuffAndEffect(buffAndEffect, IsFromCharacter, characterID));
      });
  }

  duplicateBuffAndEffect<T>(buffAndEffect: BuffAndEffect, IsFromCharacter: boolean, characterID:number): Observable<T> {
    this.buffEffectsData = null;
    let endpointUrl = this.duplicateUrl + '?IsFromCharacter=' + IsFromCharacter + '&characterID=' + characterID;

    return this.http.post(endpointUrl, JSON.stringify(buffAndEffect), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateBuffAndEffect(buffAndEffect, IsFromCharacter, characterID));
      });
  }

  updateBuffAndEffect<T>(buffAndEffect: BuffAndEffect): Observable<T> {
    this.buffEffectsData = null;

    if (this.buffAndEffectDetail && this.buffAndEffectDetail.length) {
      let record = this.buffAndEffectDetail.findIndex(x => x.buffAndEffectId == buffAndEffect.buffAndEffectId);
      if (record > -1) {
        this.buffAndEffectDetail.splice(record, 1);
      }
    }

    return this.http.put<T>(this.updateUrl, JSON.stringify(buffAndEffect), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateBuffAndEffect(buffAndEffect));
      });
  }

  //deleteBuffAndEffect<T>(Id: number): Observable<T> {
  //  let endpointUrl = `${this.deleteUrl}?id=${Id}`;

  //  return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
  //    .catch(error => {
  //      return this.handleError(error, () => this.deleteBuffAndEffect(Id));
  //    });
  //}

  deleteBuffAndEffect_up<T>(buffAndEffect: BuffAndEffect): Observable<T> {
    this.buffEffectsData = null;
    let endpointUrl = this.deleteUrl_up; //`${this.deleteUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(buffAndEffect), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteBuffAndEffect_up(buffAndEffect));
      });
  }

  assignBuffAndEffectToCharacter<T>(buffAndEffectList: BuffAndEffect[], characters: Characters[], nonSelectedCharacters: Characters[], nonSelectedBuffAndEffectsList: BuffAndEffect[], CharacterID:number): Observable<T> {
    this.buffEffectsData = null;
    let endpointUrl = `${this.assignBuffAndEffectToCharacterURL}?CharacterID=${CharacterID}`;

    return this.http.post<T>(endpointUrl, JSON.stringify({ buffAndEffectList: buffAndEffectList, characters: characters, nonSelectedCharacters: nonSelectedCharacters, nonSelectedBuffAndEffectsList: nonSelectedBuffAndEffectsList }), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.assignBuffAndEffectToCharacter(buffAndEffectList, characters, nonSelectedCharacters, nonSelectedBuffAndEffectsList, CharacterID));
      });
  }

  fileUpload(fileToUpload: File) {
    return this.fileUploadMethod<any>(fileToUpload);
  }

  private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
    return this.fileUploadService.fileUpload<T>(this.uploadUrl, fileToUpload);
  }

  //bind form model
  public BuffAndEffectsModelData(BuffAndEffectVM: any, _view: string): any {

    if (BuffAndEffectVM == null) return { buffAndEffectId: 0, ruleSetId: 0 };

    let buffAndEffectFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {

      buffAndEffectFormModal = {
        buffAndEffectId: BuffAndEffectVM.buffAndEffectId,
        ruleSetId: BuffAndEffectVM.ruleSetId,
        characterId: BuffAndEffectVM.characterId,
        name: _view === 'DUPLICATE' ? '' : BuffAndEffectVM.name,
        
        command: BuffAndEffectVM.command,
        commandName: BuffAndEffectVM.commandName,
        showUse: BuffAndEffectVM.command == null || BuffAndEffectVM.command == undefined || BuffAndEffectVM.command == '' ? false : true,
        buffAndEffectCommandVM: BuffAndEffectVM.buffAndEffectCommand == undefined
          ?
          BuffAndEffectVM.buffAndEffectCommandVM == undefined ? [] : BuffAndEffectVM.buffAndEffectCommandVM
          : BuffAndEffectVM.buffAndEffectCommand,
      
        description: BuffAndEffectVM.description,
        gmOnly: BuffAndEffectVM.gmOnly,
        stats: BuffAndEffectVM.stats,
        imageUrl: BuffAndEffectVM.imageUrl ? BuffAndEffectVM.imageUrl : ServiceUtil.DefaultBuffAndEffectImage,
       
        ruleset: BuffAndEffectVM.ruleset,
        showIcon: false,
        metatags: BuffAndEffectVM.metatags == null || BuffAndEffectVM.metatags == undefined ? '' : BuffAndEffectVM.metatags,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT
        //sortOrder: BuffAndEffectVM.sortOrder
      }
    }
    else {
      buffAndEffectFormModal = {
        buffAndEffectId: 0,
        ruleSetId: BuffAndEffectVM.ruleSetId,
        showUse: false,
        buffAndEffectCommandVM: [],
        isEnabled: false,
        ruleset: BuffAndEffectVM.ruleset,
        showIcon: false,
        view: VIEW.ADD,
        metatags: '',
        commandName: 'Default',
        imageUrl: ServiceUtil.DefaultBuffAndEffectImage,
        //sortOrder: BuffAndEffectVM.sortOrder
      }
    }

    return buffAndEffectFormModal;
  }
  
  deleteRecords<T>(BuffEffectList: any, rulesetId: number): Observable<T> {
    this.buffEffectsData = null;
    let endpointURL = `${this.DeleteRecords}?rulesetId=${rulesetId}`;
    return this.http.post<T>(endpointURL, JSON.stringify(BuffEffectList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteRecords(BuffEffectList, rulesetId));
      });
  }

}
