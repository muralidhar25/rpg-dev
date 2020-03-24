import { Injectable, Injector } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";
import { Ruleset } from '../models/view-models/ruleset.model';
import { Characters } from '../models/view-models/characters.model';
import { VIEW } from '../models/enums';

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
  private readonly GetIsAllyAssigned: string = "/api/Character/GetIsAllyAssigned";

  private readonly getByUserId_api: string = this.configurations.baseUrl + "/api/Character/getByUserId_sp";
  private readonly getCharactersByIdDiceApi: string = this.configurations.baseUrl + "/api/Character/GetCharactersByIdDice";

  private readonly _getPlayerControlsByCharacterIdUrl: string = "/api/campaign/getPlayerControlsByCharacterId";
  private readonly _IsGmAccessingPlayerCharacterUrl: string = "/api/campaign/isGmAccessingPlayerCharacterUrl";
  private readonly _updatePublicPrivateRollUrl: string = "/api/Character/UpdatePublicPrivateRoll";
  private readonly _leaveChatUrl: string = "/api/chat/leaveChat";
  private readonly _getDiceRollModelUrl: string = "/api/Ruleset/GetDiceRollData";

  private CharactersById: any;
  private AllyAssigned: any;  
  private Characters: any[] = [];  
  private PlayerControls: any[] = [];  

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

  get playerControlsUrl() { return this.configurations.baseUrl + this._getPlayerControlsByCharacterIdUrl; }
  get IsGmAccessingPlayerCharacterUrl() { return this.configurations.baseUrl + this._IsGmAccessingPlayerCharacterUrl; }
  get updatePublicPrivateRollUrl() { return this.configurations.baseUrl + this._updatePublicPrivateRollUrl; }
  get leaveChatUrl() { return this.configurations.baseUrl + this._leaveChatUrl; }
  get getDiceRollModelUrl() { return this.configurations.baseUrl + this._getDiceRollModelUrl; }
  

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService) {
    super(http, configurations, injector);
  }

  getDiceRollModel<T>(rulesetId: number, characterId: number): Observable<T> {
    let endpointUrl = `${this.getDiceRollModelUrl}?RuleSetID=${rulesetId}&CharacterID=${characterId}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getDiceRollModel(rulesetId, characterId));
      });
  }
  getCharactersById<T>(Id: number): Observable<T> {
      let endpointUrl = `${this.getByIdUrl}?id=${Id}`;
      return this.http.get<T>(endpointUrl, this.getRequestHeaders())
        .catch(error => {
          return this.handleError(error, () => this.getCharactersById(Id));
        });
  }
  getCharactersById_Cache<T>(Id: number): Observable<T> {
    let record = this.Characters && this.Characters.length ? this.Characters.findIndex(x => x.characterId == Id) : -1;

    if (record > -1) {
      return Observable.of(this.Characters[record]);
    } else {
      let endpointUrl = `${this.getByIdUrl}?id=${Id}`;
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.Characters.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getCharactersById(Id));
        });
    }
  }
  //getCharactersById_Cache<T>(Id: number, isFromCampaigns: any): Observable<T> {
  //  if (isFromCampaigns) {
  //    return Observable.of(this.CharactersById);
  //  }
  //  else {
  //    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;
  //    return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(CharactersByIdInfo => this.CharactersById = CharactersByIdInfo)
  //      .catch(error => {
  //        return this.handleError(error, () => this.getCharactersById(Id));
  //      });
  //  }
  //}
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

  getCharactersByRuleSetId<T>(Id: number, isFromLootGiveScreen: boolean = false): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl}?id=${Id}&isFromLootGiveScreen=${isFromLootGiveScreen}`;
    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharactersByRuleSetId(Id, isFromLootGiveScreen));
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
    //characters.characterId = 0;
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

    if (_view === 'DUPLICATE' || _view === 'SAVE') {

      var __ruleSets = _modelVM.ruleSets;
      if (_modelVM.ruleSets)
        __ruleSets = _modelVM.ruleSets.filter((x) => x.ruleSetId === _modelVM.ruleSetId);
      
      if (__ruleSets) {
        if (!__ruleSets.length) {
          __ruleSets = [];
          __ruleSets.push(_modelVM.ruleSet);
        }
      }

      charactersFormModal = {
        characterId: _modelVM.characterId,
        characterName: _view === 'DUPLICATE' ? '' : _modelVM.characterName,
        characterDescription: _modelVM.characterDescription,
          characterImage: _modelVM.imageUrl,
        ruleSetId: _modelVM.ruleSetId,
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

  getPlayerControlsByCharacterId(characterId: number) {
    let endpointUrl = `${this.playerControlsUrl}?characterID=${characterId}`;
    return this.http.get(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getPlayerControlsByCharacterId(characterId));
      });
  }

  getPlayerControlsByCharacterId_Cache(characterId: number) {

    let record = this.PlayerControls && this.PlayerControls.length ? this.PlayerControls.findIndex(x => x.characterId == characterId) : -1;

    if (record > -1) {
      return Observable.of(this.PlayerControls[record]);
    } else {
      let endpointUrl = `${this.playerControlsUrl}?characterID=${characterId}`;
      return this.http.get(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.PlayerControls.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getPlayerControlsByCharacterId(characterId));
        });
    }
  }
  getIsGmAccessingPlayerCharacter(characterId: number) {
    let endpointUrl = `${this.IsGmAccessingPlayerCharacterUrl}?characterID=${characterId}`;
    return this.http.get(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getIsGmAccessingPlayerCharacter(characterId));
      });
  }

  updatePublicPrivateRoll(isPublic: boolean, isCharacter: boolean, recordId: number) {
    let endpointUrl = `${this.updatePublicPrivateRollUrl}?isPublic=${isPublic}&isCharacter=${isCharacter}&recordId=${recordId}`;
    return this.http.get(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updatePublicPrivateRoll(isPublic, isCharacter, recordId));
      });
  }
  leaveChat(chatConnectonID:string) {
    let endpointUrl = `${this.leaveChatUrl}?chatConnectonID=${chatConnectonID}`;
    return this.http.get(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.leaveChat(chatConnectonID));
      });
  }

  isAllyAssigned(characterId: number) {
    let endpointUrl = `${this.GetIsAllyAssigned}?characterID=${characterId}`;
    return this.http.get(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.isAllyAssigned(characterId));
      });
  }

  isAllyAssigned_Cache(characterId: number, isFromCampaigns: any) {
    if (isFromCampaigns) {
      return Observable.of(this.AllyAssigned);
    }
    else {
      let endpointUrl = `${this.GetIsAllyAssigned}?characterID=${characterId}`;
      return this.http.get(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.AllyAssigned = data)
        .catch(error => {
          return this.handleError(error, () => this.isAllyAssigned(characterId));
        });
    }
  }
}
