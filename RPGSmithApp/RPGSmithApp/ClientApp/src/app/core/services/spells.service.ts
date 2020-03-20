import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { FileUploadService } from "../common/file-upload.service";

import { Spell } from '../models/view-models/spell.model';
import { VIEW } from '../models/enums';
import { CharacterSpellService } from './character-spells.service';

@Injectable()
export class SpellsService extends EndpointFactory {

  private readonly _getAllUrl: string = "/api/Spell/getAll";
  private readonly _getCountUrl: string = "/api/Spell/getCountByRuleSetId";
  private readonly _createUrl: string = "/api/Spell/create";
  private readonly _updateUrl: string = "/api/Spell/update";
  private readonly _deleteUrl: string = "/api/Spell/delete";
  private readonly _deleteUrl_up: string = "/api/Spell/delete_up";
  private readonly _getByIdUrl: string = "/api/Spell/GetById";
  private readonly _getByRulesetUrl: string = "/api/Spell/getByRuleSetId";
  private readonly _getByRulesetUrl_add: string = "/api/Spell/getByRuleSetId_add";
  private readonly _uploadUrl: string = "/api/Spell/upLoadSpellImageBlob";
  private readonly _duplicateUrl: string = "/api/Spell/duplicateSpell";
  private readonly _memorizedSpellUrl: string = "/api/Spell/toggleMemorizedSpell";

  private readonly getByRuleSetId_sp: string = this.configurations.baseUrl + "/api/Spell/getByRuleSetId_sp";
  private readonly getSpellCommands_api: string = this.configurations.baseUrl + "/api/Spell/getSpellCommands_sp";
  private readonly DeleteSpells: string = this.configurations.baseUrl + "/api/Spell/DeleteSpells";

  private readonly _createOrUpdateUrl: string = this.configurations.baseUrl + "/api/PageLastView/CreateOrUpdate";

  private spellsData: any;
  private AddSpellsData: any;
  private spellDetail: any[] = [];
  private ViewType: any;

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
  get memorizedSpellUrl() { return this.configurations.baseUrl + this._memorizedSpellUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
    private fileUploadService: FileUploadService, private characterSpellService: CharacterSpellService) {
    super(http, configurations, injector);
  }

  getspells<T>(): Observable<T> {

    return this.http.get<T>(this.getAllUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getspells());
      });
  }

  getspellsCount<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getCountUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getspellsCount(Id));
      });
  }

  getspellsById<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getspellsById(Id));
      });
  }

  getspellsById_Cache<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

    let record = this.spellDetail.findIndex(x => x.spellId == Id);

    if (record > -1) {
      return Observable.of(this.spellDetail[record]);
    } else {
      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(data => this.spellDetail.push(data))
        .catch(error => {
          return this.handleError(error, () => this.getspellsById(Id));
        });
    }
  }

  getspellsByRuleset<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getspellsByRuleset(Id));
      });
  }

  getspellsByRuleset_add<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getspellsByRuleset_add(Id));
      });
  }

  getspellsByRuleset_add_Cache<T>(Id: number, isFromCharacterDashboard: boolean = false): Observable<T> {
    if (isFromCharacterDashboard) {
      this.AddSpellsData = null;
    }
    if (this.AddSpellsData != null) {
      return Observable.of(this.AddSpellsData);
    }
    else {
      let endpointUrl = `${this.getByRulesetUrl_add}?rulesetId=${Id}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(addSpellsInfo => this.AddSpellsData = addSpellsInfo)
        .catch(error => {
          return this.handleError(error, () => this.getspellsByRuleset_add(Id));
        });
    }
  }

  getspellsByRuleset_sp<T>(Id: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getspellsByRuleset(Id));
      });
  }

  getspellsByRuleset_spWithPagination<T>(Id: number, page: number, pageSize: number): Observable<T> {
    let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getspellsByRuleset_spWithPagination(Id, page, pageSize));
      });
  }

  getspellsByRuleset_spWithPagination_Cache<T>(Id: number, page: number, pageSize: number, isFromCampaign: boolean = false): Observable<T> {
    if (isFromCampaign) {
      this.spellsData = null;
    }
    if (this.spellsData != null) {
      return Observable.of(this.spellsData);
    }
    else {
      let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}&page=${page}&pageSize=${pageSize}`;

      return this.http.get<T>(endpointUrl, this.getRequestHeaders()).map(res => res).do(spellsInfo => this.spellsData = spellsInfo)
        .catch(error => {
          return this.handleError(error, () => this.getspellsByRuleset_spWithPagination(Id, page, pageSize));
        });
    }
  }

  createPageLastViews<T>(pageLastViews: any): Observable<T> {
    let endpointUrl = this._createOrUpdateUrl;
    return this.http.post<T>(endpointUrl, JSON.stringify(pageLastViews), this.getRequestHeaders()).map(res => res).do(data => {
      this.ViewType = data;
      if (this.spellsData != null) {
        this.spellsData.ViewType.viewType = this.ViewType.viewType;
      }
    })
      .catch(error => {
        return this.handleError(error, () => this.createPageLastViews<T>(pageLastViews));
      });
  }

  getSpellCommands_sp<T>(Id: number, rulesetId: number): Observable<T> {
    let endpointUrl = `${this.getSpellCommands_api}?spellId=${Id}&rulesetId=${rulesetId}`;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getspellsByRuleset(Id));
      });
  }

  createSpell<T>(spell: Spell): Observable<T> {
    this.spellsData = null;
    this.AddSpellsData = null;

    let endpointUrl = this.createUrl;

    if (spell.spellId == 0 || spell.spellId === undefined)
      endpointUrl = this.createUrl;
    else {
      endpointUrl = this.updateUrl;

      if (this.spellDetail && this.spellDetail.length) {
        let record = this.spellDetail.findIndex(x => x.spellId == spell.spellId);
        if (record > -1) {
          this.spellDetail.splice(record, 1);
        }
      } else if (this.characterSpellService.CharacterSpellDetail && this.characterSpellService.CharacterSpellDetail.length) {
        let record = this.characterSpellService.CharacterSpellDetail.findIndex(x => x.characterSpellId == spell.spellId);
        if (record > -1) {
          this.characterSpellService.CharacterSpellDetail.splice(record, 1);
        }
      }
    }

    return this.http.post(endpointUrl, JSON.stringify(spell), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.createSpell(spell));
      });
  }

  duplicateSpell<T>(spell: Spell): Observable<T> {
    //spell.spellId = 0;
    this.spellsData = null;
    this.AddSpellsData = null;
    let endpointUrl = this.duplicateUrl;

    return this.http.post(endpointUrl, JSON.stringify(spell), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.duplicateSpell(spell));
      });
  }

  updateSpell<T>(spell: Spell): Observable<T> {
    this.spellsData = null;
    this.AddSpellsData = null;

    return this.http.put<T>(this.updateUrl, JSON.stringify(spell), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.updateSpell(spell));
      });
  }

  deleteSpell<T>(Id: number): Observable<T> {
    this.spellsData = null;
    this.AddSpellsData = null;
    let endpointUrl = `${this.deleteUrl}?id=${Id}`;

    return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteSpell(Id));
      });
  }
  deleteSpell_up<T>(spell: Spell): Observable<T> {
    this.spellsData = null;
    this.AddSpellsData = null;
    let endpointUrl = this._deleteUrl_up; //`${this.deleteUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, JSON.stringify(spell), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteSpell_up(spell));
      });
  }

  memorizedSpell<T>(Id: number): Observable<T> {
    this.spellsData = null;
    this.AddSpellsData = null;
    let endpointUrl = `${this.memorizedSpellUrl}?id=${Id}`;

    return this.http.post<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.memorizedSpell(Id));
      });
  }

  fileUpload(fileToUpload: File) {
    return this.fileUploadMethod<any>(fileToUpload);
  }

  private fileUploadMethod<T>(fileToUpload: File): Observable<T> {
    return this.fileUploadService.fileUpload<T>(this.uploadUrl, fileToUpload);
  }

  //bind form model
  public spellModelData(spellVM: any, _view: string): any {

    if (spellVM == null) return { spellId: 0, ruleSetId: 0 };

    let spellFormModal: any;
    if (_view === 'DUPLICATE' || _view === 'UPDATE') {
      spellFormModal = {
        spellId: spellVM.spellId,
        ruleSetId: spellVM.ruleSetId,
        characterId: spellVM.characterId,
        name: _view === 'DUPLICATE' ? '' : spellVM.name,
        school: spellVM.school == null || spellVM.school == undefined ? '' : spellVM.school,
        class: spellVM.class == null || spellVM.class == undefined ? '' : spellVM.class,
        levels: spellVM.levels == null || spellVM.levels == undefined ? '' : spellVM.levels,
        command: spellVM.command,
        commandName: spellVM.commandName,
        showCast: spellVM.command == null || spellVM.command == undefined || spellVM.command == '' ? false : true,
        spellCommandVM: spellVM.spellCommandVM == undefined ? spellVM.spellCommand == undefined ? [] : spellVM.spellCommand : spellVM.spellCommandVM,
        materialComponent: spellVM.materialComponent,
        isMaterialComponent: spellVM.isMaterialComponent,
        isSomaticComponent: spellVM.isSomaticComponent,
        isVerbalComponent: spellVM.isVerbalComponent,
        castingTime: spellVM.castingTime,
        description: spellVM.description,
        gmOnly: spellVM.gmOnly,
        stats: spellVM.stats,
        hitEffect: spellVM.hitEffect,
        missEffect: spellVM.missEffect,
        effectDescription: spellVM.effectDescription,
        shouldCast: spellVM.shouldCast,
        imageUrl: spellVM.imageUrl,
        memorized: spellVM.memorized,
        ruleset: spellVM.ruleset,
        metatags: spellVM.metatags == null || spellVM.metatags == undefined ? '' : spellVM.metatags,
        showIcon: false,
        view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
        spellBuffAndEffects: spellVM.spellBuffAndEffects == null ? [] : spellVM.spellBuffAndEffects,
        spellBuffAndEffectVM: spellVM.spellBuffAndEffectVM == undefined ? [] : spellVM.spellBuffAndEffectVM,
        //sortOrder: spellVM.sortOrder
      }
    }
    else {
      spellFormModal = {
        spellId: 0,
        ruleSetId: spellVM.ruleSetId,
        showCast: false,
        spellCommandVM: [],
        isMaterialComponent: false,
        isSomaticComponent: false,
        isVerbalComponent: false,
        shouldCast: false,
        memorized: false,
        ruleset: spellVM.ruleset,
        showIcon: false,
        view: VIEW.ADD,
        metatags: '',
        school: '',
        class: '',
        levels: '',
        commandName: 'Default',
        //sortOrder: spellVM.sortOrder
        spellBuffAndEffects: [],
        spellBuffAndEffectVM: []
      }
    }

    return spellFormModal;
  }


  deleteSpells<T>(SpellsList: any, rulesetId: number): Observable<T> {
    this.spellsData = null;
    this.AddSpellsData = null;
    let endpointURL = `${this.DeleteSpells}?rulesetId=${rulesetId}`;
    return this.http.post<T>(endpointURL, JSON.stringify(SpellsList), this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.deleteSpells(SpellsList, rulesetId));
      });
  }


}
