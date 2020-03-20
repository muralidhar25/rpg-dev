import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';

import { VIEW } from '../models/enums';
import { CharacterSpells } from '../models/view-models/character-spells.model';

@Injectable()
export class CharacterSpellService extends EndpointFactory {

  private readonly _getAllUrl: string = "/api/CharacterSpell/getall";
  private readonly _getByIdUrl: string = "/api/CharacterSpell/GetById";
  private readonly _getByCharacterIdUrl: string = "/api/CharacterSpell/GetByCharacterId";
  private readonly _getSpellByCharacterIdUrl: string = "/api/CharacterSpell/GetSpellByCharacterId";

  private readonly _getCountUrl: string = "/api/CharacterSpell/getCountByCharacterId";
  private readonly _createUrl: string = "/api/CharacterSpell/create";
  private readonly _updateUrl: string = "/api/CharacterSpell/update";
  private readonly _deleteUrl: string = "/api/CharacterSpell/delete";
  private readonly _deleteUrl_up: string = "/api/CharacterSpell/delete_up";
  private readonly _toggleMemorizedCharacterSpellUrl: string = "/api/CharacterSpell/toggleMemorizedCharacterSpell";
  private readonly _duplicateUrl: string = "/api/CharacterSpell/DuplicateItem";
  private readonly RemoveSpells: string = "/api/CharacterSpell/removeSpells";

  private readonly getByCharacterId_api: string = this.configurations.baseUrl + "/api/CharacterSpell/getByCharacterId_sp";

  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  private SpellsData: any;
  public CharacterSpellDetail: any[] = [];
  private ViewType: any;

  get getAllUrl() { return this.configurations.baseUrl + this._getAllUrl; }
  get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
  get getByCharacterIdUrl() { return this.configurations.baseUrl + this._getByCharacterIdUrl; }
  get getSpellByCharacterIdUrl() { return this.configurations.baseUrl + this._getSpellByCharacterIdUrl; }

  get getCountUrl() { return this.configurations.baseUrl + this._getCountUrl; }
  get createUrl() { return this.configurations.baseUrl + this._createUrl; }
  get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
  get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
  get deleteUrl_up() { return this.configurations.baseUrl + this._deleteUrl_up; }
  get toggleMemorizedCharacterSpellUrl() { return this.configurations.baseUrl + this._toggleMemorizedCharacterSpellUrl; }
  get duplicateUrl() { return this.configurations.baseUrl + this._duplicateUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  getCharacterSpells<T>(): Observable<T> {

    return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterSpells());
      });
  }

  getCharacterSpellsCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterSpellsCount(Id));
      });
  }

  getCharacterSpellById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterSpellById(Id));
      });
  }

  getCharacterSpellById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    let record = this.CharacterSpellDetail.findIndex(x => x.characterSpellId == Id);
    if (record > -1) {
      return Observable.of(this.CharacterSpellDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.CharacterSpellDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getCharacterSpellById(Id));
        });
    }
  }

  getCharacterSpellsByCharacterId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterIdUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterSpellsByCharacterId(Id));
      });
  }
  getCharacterSpellByCharacterId<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getSpellByCharacterIdUrl}?characterId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterSpellByCharacterId(Id));
      });
  }

  getCharacterSpellsByCharacterId_sp<T>(characterId: number, rulesetId: number, page: number, pageSize: number, sortType: number): Observable<T> {
    let endpointUrl = `${this.getByCharacterId_api}?characterId=${characterId}&rulesetId=${rulesetId}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getCharacterSpellsByCharacterId_sp(characterId, rulesetId, page, pageSize, sortType));
      });
  }

  getCharacterSpellsByCharacterId_sp_Cache<T>(characterId: number, rulesetId: number, page: number, pageSize: number, sortType: number, isFromCharacterDashboard: boolean = false): Observable<T> {
    if (isFromCharacterDashboard) {
      this.SpellsData = null;
    }
    if (this.SpellsData != null) {
      return Observable.of(this.SpellsData);
    } else {
      let endpointUrl = `${this.getByCharacterId_api}?characterId=${characterId}&rulesetId=${rulesetId}&page=${page}&pageSize=${pageSize}&sortType=${sortType}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(spells => this.SpellsData = spells)
        .catch(error => {
          return this.handleError(error, () => this.getCharacterSpellsByCharacterId_sp(characterId, rulesetId, page, pageSize, sortType));
        });
    }
  }

  createPageLastViews<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.SpellsData != null) {
        this.SpellsData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews<T>(pageLastViews));
      });
  }

  createCharacterSpell<T>(CharacterSpell: CharacterSpells): Observable<T> {
    this.SpellsData = null;

    let endpointUrl = this.createUrl;

    //if (CharacterSpell.characterSpellId == 0 || CharacterSpell.characterSpellId === undefined)
    //    endpointUrl = this.createUrl;
    //else
    //    endpointUrl = this.updateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(CharacterSpell), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.createCharacterSpell(CharacterSpell));
      });
  }

  duplicateCharacterSpell<T>(CharacterSpell: CharacterSpells): Observable<T> {
    this.SpellsData = null;
    //CharacterSpell.itemId = 0;
    let endpointUrl = this.duplicateUrl;

    return this.http.post<T>(endpointUrl, JSON.stringify(CharacterSpell), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.duplicateCharacterSpell(CharacterSpell));
      });
  }

  updateCharacterSpell<T>(CharacterSpell: CharacterSpells): Observable<T> {
    this.SpellsData = null;

    return this.http.put<T>(this.updateUrl, JSON.stringify(CharacterSpell), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateCharacterSpell(CharacterSpell));
      });
  }

  deleteCharacterSpell<T>(Id: number): Observable<T> {
    this.SpellsData = null;
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteCharacterSpell(Id));
      });
  }
  deleteCharacterSpell_up<T>(Id: number, RulesetID: number): Observable<T> {
    this.SpellsData = null;
    let endpointUrl = `${this.deleteUrl_up}?id=${Id}&rulesetid=${RulesetID}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteCharacterSpell_up(Id, RulesetID));
      });
  }
  toggleMemorizedCharacterSpell<T>(Id: number): Observable<T> {
    this.SpellsData = null;
    let endpointUrl = `${this.toggleMemorizedCharacterSpellUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.toggleMemorizedCharacterSpell(Id));
      });
  }

  //bind form model
  public characterSpellModelData(_modelVM: any, _view: string): any {

    let FormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {
      FormModal = {
        spellId: _modelVM.spellId,
        characterId: _modelVM.characterId,
        rulesetId: _modelVM.ruleSetId,
        name: _view === 'DUPLICATE' ? '' : _modelVM.name,
        level: _modelVM.level,
        command: _modelVM.command,
        commandName: _modelVM.commandName,
        spellCommandVM: _modelVM.spellCommand == undefined ? [] : _modelVM.spellCommand,
        maxNumberOfUses: _modelVM.maxNumberOfUses,
        currentNumberOfUses: _modelVM.currentNumberOfUses,
        description: _modelVM.description,
        stats: _modelVM.stats,
        imageUrl: _modelVM.imageUrl,
        isEnabled: _modelVM.isEnabled,
        ruleset: _modelVM.ruleset,
        showIcon: false,
        metatags: _modelVM.metatags,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        multiSpells: _modelVM.multiSpells
        //sortOrder: _modelVM.sortOrder
      }
    }
    else {
      FormModal = {
        spellId: 0,
        characterId: _modelVM.characterId,
        rulesetId: _modelVM.ruleSetId,
        //spellCommandVM: [],
        isMemorized: false,
        ruleset: _modelVM.ruleset,
        showIcon: false,
        view: VIEW.ADD,
        multiSpells: [],
        commandName: 'Default'
        //sortOrder: _modelVM.sortOrder
      }
    }
    return FormModal;
  }

  public spellModelDetailData(spellVM: any, _view: string): any {

    if (spellVM == null) return { spellId: 0, ruleSetId: 0 };

    let spellFormModal: any;

    if (_view === 'DUPLICATE' || _view === 'UPDATE') {
      let spellDetailVM = spellVM.spell;
      spellFormModal = {
        spellId: spellDetailVM.spellId,
        ruleSetId: spellDetailVM.ruleSetId,
        characterId: spellVM.characterId,
        characterSpellId: spellVM.characterSpellId,
        name: _view === 'DUPLICATE' ? '' : spellDetailVM.name,
        school: spellDetailVM.school == null || spellDetailVM.school == undefined ? '' : spellDetailVM.school,
        class: spellDetailVM.class == null || spellDetailVM.class == undefined ? '' : spellDetailVM.class,
        levels: spellDetailVM.levels == null || spellDetailVM.levels == undefined ? '' : spellDetailVM.levels,
        command: spellDetailVM.command,
        commandName: spellDetailVM.commandName,
        showCast: spellDetailVM.command == null || spellDetailVM.command == undefined || spellDetailVM.command == '' ? false : true,
        spellCommandVM: spellDetailVM.spellCommand == undefined ? [] : spellDetailVM.spellCommand,
        spellBuffAndEffectVM: spellDetailVM.spellBuffAndEffects == undefined ? [] : spellDetailVM.spellBuffAndEffects,
        materialComponent: spellDetailVM.materialComponent,
        isMaterialComponent: spellDetailVM.isMaterialComponent,
        isSomaticComponent: spellDetailVM.isSomaticComponent,
        isVerbalComponent: spellDetailVM.isVerbalComponent,
        castingTime: spellDetailVM.castingTime,
        description: spellDetailVM.description,
        gmOnly: spellDetailVM.gmOnly,
        stats: spellDetailVM.stats,
        hitEffect: spellDetailVM.hitEffect,
        missEffect: spellDetailVM.missEffect,
        effectDescription: spellDetailVM.effectDescription,
        shouldCast: spellDetailVM.shouldCast,
        imageUrl: spellDetailVM.imageUrl,
        memorized: spellVM.isMemorized,
        ruleset: spellDetailVM.ruleset,
        metatags: spellDetailVM.metatags == null || spellDetailVM.metatags == undefined ? '' : spellDetailVM.metatags,
        showUse: spellDetailVM.command ? true : false,
        showIcon: false,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT
        //sortOrder: spellDetailVM.sortOrder
      }
    }
    else {
      spellFormModal = {
        spellId: 0,
        ruleSetId: spellVM.ruleSetId,
        showCast: false,
        spellCommandVM: [],
        spellBuffAndEffectVM: [],
        isMaterialComponent: false,
        isSomaticComponent: false,
        isVerbalComponent: false,
        shouldCast: false,
        memorized: false,
        ruleset: spellVM.ruleset,
        showUse: false,
        showIcon: false,
        view: VIEW.ADD,
        metatags: '',
        school: '',
        class: '',
        levels: '',
        commandName: 'Default'
        //sortOrder: spellVM.sortOrder
      }
    }

    return spellFormModal;
  }

  removeSpells<T>(spellsList: any, rulesetId: number): Observable<T> {
    this.SpellsData = null;
    let removeSpellsURL = `${this.RemoveSpells}?rulesetId=${rulesetId}`;
    return this.http.post<T>(removeSpellsURL, JSON.stringify(spellsList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.removeSpells(spellsList, rulesetId));
      });
  }


}
