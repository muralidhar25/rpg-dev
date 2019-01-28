import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { LocalStoreManager } from './local-store-manager.service';
import { EndpointFactory } from './endpoint-factory.service';
import { ConfigurationService } from './configuration.service';
import { AuthService } from "./auth.service";
import { DBkeys } from './db-Keys';
import { FileUploadService } from "./file-upload.service";

import { Ruleset } from '../models/view-models/ruleset.model';
import { Characters } from '../models/view-models/characters.model';
import { ICON, VIEW } from '../models/enums';

@Injectable()
export class CharactersService extends EndpointFactory {
    
    private ruleset: Ruleset;
    private characters: Characters;

    private readonly _getUrl: string = "/api/Character/GetCharacters";
    private readonly _createUrl: string = "/api/Character/CreateCharacter";
    private readonly _updateUrl: string = "/api/Character/UpdateCharacter";
    private readonly _deleteUrl: string = "/api/Character/DeleteCharacter";
    private readonly _getByIdUrl: string = "/api/Character/GetCharactersById";
    private readonly _getCharacters_charStatsByIdUrl: string = "/api/Character/GetCharacters_charStatsById";
    private readonly _getDiceTrayUrl: string = "/api/Character/GetDiceTray";
    private readonly _getByRulesetUrl: string = "/api/Character/GetCharactersByRuleSetId";
    private readonly _getByUserUrl: string = "/api/Character/GetCharactersByUserId"; 
    private readonly _uploadImgUrl: string = "/api/Character/UploadCharactersImage";
    private readonly _uploadImgBlobUrl: string = "/api/Character/UpLoadCharaterImageBlob";
    private readonly _getCountUrl: string = "/api/Character/GetCharactersCount";

    private readonly getByUserId_api: string = this.configurations.baseUrl + "/api/Character/getByUserId_sp";
    private readonly getCharactersByIdDiceApi: string = this.configurations.baseUrl + "/api/Character/GetCharactersByIdDice";

    get getUrl() { return this.configurations.baseUrl + this._getUrl; }
    get createUrl() { return this.configurations.baseUrl + this._createUrl; }
    get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
    get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
    get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
    get getCharacters_charStatsByIdUrl() { return this.configurations.baseUrl + this._getCharacters_charStatsByIdUrl; }
    get getDiceTrayUrl() { return this.configurations.baseUrl + this._getDiceTrayUrl; }    
    get getByRulesetUrl() { return this.configurations.baseUrl + this._getByRulesetUrl; }
    get getByUserUrl() { return this.configurations.baseUrl + this._getByUserUrl; }
    get uploadImgUrl() { return this.configurations.baseUrl + this._uploadImgUrl; }
    get uploadImgBlobUrl() { return this.configurations.baseUrl + this._uploadImgBlobUrl; }
    get getCountUrl() { return this.configurations.baseUrl + this._getCountUrl; }

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
        private fileUploadService: FileUploadService) {
        super(http, configurations, injector);
    }

    
    getCharactersById<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.getByIdUrl}?id=${Id}`;
        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharactersById(Id));
            });
    }
    getRuleset_charStats_ById<T>(rulesetId: number, characterId: number): Observable<T> {
        let endpointUrl = `${this.getCharacters_charStatsByIdUrl}?RulesetId=${rulesetId}&characterId=${characterId}`;
        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getRuleset_charStats_ById(rulesetId, characterId));
            });
    }
    getDiceTray<T>(rulesetId: number, characterId: number): Observable<T> {
        let endpointUrl = `${this.getDiceTrayUrl}?rulesetId=${rulesetId}&characterId=${characterId}`;
        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getDiceTray(rulesetId, characterId));
            });
    }
    getCharactersByIdDice<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.getCharactersByIdDiceApi}?id=${Id}`;
        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharactersById(Id));
            });
    }

    getCharactersByRuleSetId<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.getByRulesetUrl}?id=${Id}`;
        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharactersByRuleSetId(Id));
            });
    }

    getCharactersByUserId<T>(Id: string): Observable<T> {
        let endpointUrl = `${this.getByUserUrl}?id=${Id}`;
        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharactersByUserId(Id));
            });
    }

    getCharactersByUserId_sp<T>(userId: string, page: number, pageSize: number): Observable<T> {
        let endpointUrl = `${this.getByUserId_api}?userId=${userId}&page=${page}&pageSize=${pageSize}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharactersByUserId_sp(userId, page, pageSize));
            });
    }

    getCharactersCount(userId: string) {
        let endpointUrl = `${this.getCountUrl}?id=${userId}`;
        return this.http.get(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharactersCount(userId));
            });
    }

    createCharacter<T>(userObject: any): Observable<T> {

        let endpointUrl = this.createUrl;

        if (userObject.characterId == 0 || userObject.characterId === undefined)
            endpointUrl = this.createUrl;
        else
            endpointUrl = this.updateUrl;

        return this.http.post<T>(endpointUrl, JSON.stringify(userObject), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.createCharacter(userObject));
            });
    }

    duplicateCharacters<T>(characters: Characters): Observable<Characters> {
        characters.characterId = 0;
        let endpointUrl = this.createUrl;
        
        return this.http.post<T>(endpointUrl, JSON.stringify(characters), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.duplicateCharacters(characters));
            });
    }
    
    updateCharacters<T>(userObject: any): Observable<T> {

        return this.http.put<T>(this.updateUrl, JSON.stringify(userObject), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.updateCharacters(userObject));
            });
    }

    deleteCharacters<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.deleteUrl}?id=${Id}`;
        return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.deleteCharacters(Id));
            });
    }

    fileUpload(fileToUpload: File) {
        return this.fileUploadMethod<any>(fileToUpload);
    }

    private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
        return this.fileUploadService.fileUpload<T>(this.uploadImgBlobUrl, fileToUpload);
    }

    //bind form model
    public characterModelData(_modelVM: any, _view: string): any {
        
        let charactersFormModal: any;       

        if (_view === 'DUPLICATE' || _view === 'UPDATE') {

            var __ruleSets = _modelVM.ruleSets;
            if (_modelVM.ruleSets)
                __ruleSets = _modelVM.ruleSets.filter((x) => x.ruleSetId === _modelVM.ruleSet.ruleSetId);
            
            charactersFormModal = {
                characterId: _modelVM.characterId,
                characterName: _view === 'DUPLICATE' ? '' : _modelVM.characterName,
                characterDescription: _modelVM.characterDescription,
                characterImage: _modelVM.characterImage,
                ruleSetId: _modelVM.ruleSet.ruleSetId,
                //ruleSet: _modelVM.ruleSet,
                ruleSets: __ruleSets, //_modelVM.ruleSets,
                imageUrl: _modelVM.imageUrl,
                thumbnailUrl: _modelVM.thumbnailUrl,
                view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
                hasRuleset: __ruleSets == undefined ? false : __ruleSets.length == 0 ? false : true
            }
        }
        else {
            charactersFormModal = {
                characterId: _modelVM.characterId,
                ruleSets: _modelVM.ruleSets,
                view: VIEW.ADD,
                hasRuleset: _modelVM.ruleSets == undefined ? false : _modelVM.ruleSets.length == 0 ? false : true
            };
        }

        return charactersFormModal;
    }


}
