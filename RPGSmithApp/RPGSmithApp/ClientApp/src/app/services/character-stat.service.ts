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

import { Ruleset } from '../models/view-models/ruleset.model';
import { CharacterStats, CharacterStatCombo, CharacterStatToggle, CharacterStatDefaultValue, CharacterStatConditionViewModel } from '../models/view-models/character-stats.model';
import { ICON, VIEW, STAT_NAME } from '../models/enums';
import { characterStatCombo } from '../models/tiles/character-stat-tile.model';

@Injectable()
export class CharacterStatService extends EndpointFactory {
    
    private ruleset: Ruleset;
    private characterStats: CharacterStats;

    private readonly _getUrl: string = "/api/characterstat/GetCharacterStats";
    private readonly _getCountUrl: string = "/api/characterstat/GetCharacterStatsCount";
    private readonly _createUrl: string = "/api/characterstat/CreateCharacterStat";
    private readonly _updateUrl: string = "/api/characterstat/UpdateCharacterStat";
    private readonly _deleteUrl: string = "/api/characterstat/DeleteCharacterStat";
    private readonly _deleteUrl_up: string = "/api/characterstat/DeleteCharacterStat_up";
    private readonly _getByIdUrl: string = "/api/characterstat/GetCharacterStatsByIdAndRuleSetId";
    private readonly _getByRulesetUrl: string = "/api/characterstat/GetCharacterStatsByRuleSetId"; 
    private readonly _sortOrderUrl: string = "/api/characterstat/UpdateCharacterStatSortOrder";
    private readonly _getTypesUrl: string = "/api/characterstat/CharacterStatTypeList";
    private readonly _getConditionOperatorsUrl: string = "/api/characterstat/getConditionOperators";
    private readonly _getCharcaterChoiceByIds: string = "/api/characterstat/getCharcaterChoiceByIds"

    private readonly getByRuleSetId_sp: string = this.configurations.baseUrl + "/api/characterstat/getByRuleSetId_sp";

    get getUrl() { return this.configurations.baseUrl + this._getUrl; }
    get getCountUrl() { return this.configurations.baseUrl + this._getCountUrl; }
    get createUrl() { return this.configurations.baseUrl + this._createUrl; }
    get updateUrl() { return this.configurations.baseUrl + this._updateUrl; }
    get deleteUrl() { return this.configurations.baseUrl + this._deleteUrl; }
    get deleteUrl_up() { return this.configurations.baseUrl + this._deleteUrl_up; }
    get getByIdUrl() { return this.configurations.baseUrl + this._getByIdUrl; }
    get getByRulesetUrl() { return this.configurations.baseUrl + this._getByRulesetUrl; }
    get sortOrderUrl() { return this.configurations.baseUrl + this._sortOrderUrl; }
    get getTypesUrl() { return this.configurations.baseUrl + this._getTypesUrl; }
    get getConditionOperatorsUrl() { return this.configurations.baseUrl + this._getConditionOperatorsUrl; }
    
    get getCharcaterChoiceByIdsUrl() { return this.configurations.baseUrl + this._getCharcaterChoiceByIds; }

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
        super(http, configurations, injector);
    }

    getCharacterStats<T>(page?: number, pageSize?: number): Observable<T> {
        let endpointUrl = page && pageSize ? `${this.getUrl}?page=${page}&pageSize=${pageSize}` : this.getUrl;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharacterStats(page, pageSize));
            });
    }

    getCharacterStatsCount<T>(): Observable<T> {
        let endpointUrl = this.getCountUrl;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharacterStatsCount());
            });
    }

    getCharcaterChoiceByIds<T>(characterchoiceids: string): Observable<T> {
        let endpointUrl = `${this.getCharcaterChoiceByIdsUrl}?characterhoiceIds=${characterchoiceids}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharcaterChoiceByIds(characterchoiceids));
            });
    }



    getCharacterStatsById<T>(Id: number, ruleSetId: number): Observable<T> {
        let endpointUrl = `${this.getByIdUrl}?id=${Id}&ruleSetId=${ruleSetId}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharacterStatsById(Id, ruleSetId));
            });
    }

    getCharacterStatsByRuleset<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.getByRulesetUrl}?id=${Id}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharacterStatsByRuleset(Id));
            });
    }

    getCharacterStatsByRuleset_sp<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.getByRuleSetId_sp}?rulesetId=${Id}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharacterStatsByRuleset(Id));
            });
    }

    createCharacterStats<T>(objCharacterStat: any): Observable<T> {

        let endpointUrl = this.createUrl;

        if (objCharacterStat.characterStatId == 0 || objCharacterStat.characterStatId === undefined)
            endpointUrl = this.createUrl;
        else
            endpointUrl = this.updateUrl;

        return this.http.post<T>(endpointUrl, JSON.stringify(objCharacterStat), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.createCharacterStats(objCharacterStat));
            });
    }

    duplicateCharacterStats<T>(characterStat: CharacterStats): Observable<CharacterStats> {
        characterStat.characterStatId = 0;
        let endpointUrl = this.createUrl;
        
        return this.http.post<T>(endpointUrl, JSON.stringify(characterStat), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.duplicateCharacterStats(characterStat));
            });
    }
    
    updateCharacterStats<T>(objCharacterStat: any): Observable<T> {

        return this.http.put<T>(this.updateUrl, JSON.stringify(objCharacterStat), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.updateCharacterStats(objCharacterStat));
            });
    }

    deleteCharacterStats<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.deleteUrl}?id=${Id}`;

        return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.deleteCharacterStats(Id));
            });
    }
    deleteCharacterStats_up<T>(characterStat: CharacterStats): Observable<T> {
        let endpointUrl = this.deleteUrl_up;//`${this.deleteUrl}?id=${Id}`;

        return this.http.post<T>(endpointUrl, JSON.stringify(characterStat), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.deleteCharacterStats_up(characterStat));
            });
    }

    sortOrderCharacterStats<T>(objCharacterStat: any): Observable<T> {

        return this.http.post<T>(this.sortOrderUrl, JSON.stringify(objCharacterStat), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.sortOrderCharacterStats(objCharacterStat));
            });
    }

    getCharacterStatTypeList<T>(): Observable<T> {

        return this.http.get<T>(this.getTypesUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharacterStatTypeList());
            });
    }
    getCharacterStatConditionOperatorList<T>(): Observable<T> {

        return this.http.get<T>(this.getConditionOperatorsUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharacterStatConditionOperatorList());
            });
    }

    getIcon(val: string) {
        
        let _icon: string = val;
        if (_icon.startsWith('Rich'))
            _icon = 'RichText';
        else if (_icon.startsWith('On'))
            _icon = 'OnOff';
        else if (_icon.startsWith('Yes'))
            _icon = 'YesNo';
        else if (_icon.startsWith('Value'))
            _icon = 'ValueSubValue';
        else if (_icon.startsWith('Current'))
            _icon = 'CurrentMax';
        else if (_icon.startsWith('Link'))
            _icon = 'LinkRecord';

        return ICON[_icon];
    }

    getOptions(characterStats: any) {
        
        let typeOptions: any;
        let Options: any[] = [];
        //InventoryWeight
        Options.push({ characterStatId: -1, type: 'InventoryWeight ', name: 'InventoryWeight', statIdentifier: 'InventoryWeight' });

        typeOptions = characterStats.map(x => {
            return { id: x.characterStatId, type: x.characterStatTypeViewModel.statTypeName, name: x.statName, statIdentifier: x.statIdentifier };
        }).filter(y => y.type == 'Number' || y.type.startsWith('Value') || y.type.startsWith('Current') || y.type.startsWith('Calculation') || y.type.startsWith('Combo'));

        typeOptions.forEach((val) => {
            Options = this.optionsList(val, Options);
        });
                
        return Options;
    }

    private optionsList(val: any, Options: any[]) {
       
        if (val.type.startsWith('Value')) {
            Options.push({ characterStatId: val.id, type: val.type, name: val.name + '[value]', statIdentifier: val.statIdentifier });
            Options.push({ characterStatId: val.id, type: val.type, name: val.name + '[sub-value]', statIdentifier: val.statIdentifier });
        }
        else if (val.type.startsWith('Current')) {
            Options.push({ characterStatId: val.id, type: val.type, name: val.name + '[current]', statIdentifier: val.statIdentifier });
            Options.push({ characterStatId: val.id, type: val.type, name: val.name + '[max]', statIdentifier: val.statIdentifier });
        }
        else {
            Options.push({ characterStatId: val.id, type: val.type, name: val.name, statIdentifier: val.statIdentifier });
        }        

        return Options;
    }
    private GetDefaultConditionValues() {
        let arr: CharacterStatConditionViewModel[] = [];
        
        let ifModel = new CharacterStatConditionViewModel(0, 1, '', '', 1, 0, null, [], false, '',false,false,true);
        let elseModel = new CharacterStatConditionViewModel(0, null, '', '', 2, 0, null, [], false, null, false, false,true);
        arr.push(ifModel);
        arr.push(elseModel);
        return arr;
    }
    getCharacterStatsFormModal(_characterStatsVM, _view) {
        if (_view === 'DUPLICATE' || _view === 'UPDATE') {
            return {
                characterStatId: _characterStatsVM.characterStatId,
                ruleSetId: _characterStatsVM.ruleSetId,
                statName: _view === 'DUPLICATE' ? '' : _characterStatsVM.statName,
                statDesc: _characterStatsVM.statDesc,
                isMultiSelect: _characterStatsVM.isMultiSelect,
                isActive: _characterStatsVM.isActive,
                sortOrder: _characterStatsVM.sortOrder,
                createdDate: _characterStatsVM.createdDate,
                modifiedDate: _characterStatsVM.modifiedDate,
                parentCharacterStatId: _characterStatsVM.parentCharacterStatId,
                characterStatTypeId: _characterStatsVM.characterStatTypeViewModel.characterStatTypeId,
                characterStatTypeName: _characterStatsVM.characterStatTypeViewModel.statTypeName,
                characterStatCalculation: _characterStatsVM.characterStatTypeViewModel.statTypeName == STAT_NAME.Calculation
                    ? _characterStatsVM.characterStatCalsComndViewModel.length == 0 ? '' : _characterStatsVM.characterStatCalsComndViewModel[0].calculationCommandValue : '',
                characterStatCommand: _characterStatsVM.characterStatTypeViewModel.statTypeName == STAT_NAME.Command
                    ? _characterStatsVM.characterStatCalsComndViewModel.length == 0 ? '' : _characterStatsVM.characterStatCalsComndViewModel[0].calculationCommandValue : '',
                characterStatTypeViewModel: _characterStatsVM.characterStatTypeViewModel,
                characterStatCalsComndViewModel: _characterStatsVM.characterStatCalsComndViewModel,
                characterStatChoicesViewModels: _characterStatsVM.characterStatChoicesViewModels,
                characterStatComboViewModel: _characterStatsVM.characterStatComboViewModel ? _characterStatsVM.characterStatComboViewModel : new characterStatCombo(),
                characterStatToggleViewModel: _characterStatsVM.characterStatToggleViewModel ? _characterStatsVM.characterStatToggleViewModel : new CharacterStatToggle(),
                //customToggleViewModel: _characterStatsVM.customToggleViewModel ? _characterStatsVM.customToggleViewModel : new CustomToggle(),
                characterStatDefaultValueViewModel: _characterStatsVM.characterStatDefaultValueViewModel ? _characterStatsVM.characterStatDefaultValueViewModel : [],
                characterStatConditionViewModel: _characterStatsVM.characterStatConditionViewModel ? _characterStatsVM.characterStatConditionViewModel : this.GetDefaultConditionValues(),
                view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT,
                icon: _characterStatsVM.icon  //_characterStatsVM.characterStatTypeViewModel.statTypeName //for now
            }
            //this.title = _view === 'DUPLICATE' ? 'Duplicate Character Stat' : 'Update Character Stat';
        }
        else {
            return {
                characterStatId: 0,
                ruleSetId: _characterStatsVM.ruleSetId,
                /*text is default type here*/
                characterStatTypeId: 1,
                characterStatTypeName: 'Text',
                characterStatTypeViewModel: {
                    characterStatTypeId: 1,
                    statTypeName: 'Text',
                    statTypeDesc: 'Use this type to input a Text value. e.g. Name, Birthplace, Occupation',
                    isNumeric: false
                },
                characterStatCalsComndViewModel: [],
                characterStatChoicesViewModels: [],
                characterStatComboViewModel: new CharacterStatCombo(),
                characterStatToggleViewModel: {
                    yesNo: false,
                    onOff: false,
                    display: true,
                    showCheckbox: true,
                    isCustom: false,
                    customToggles: []
                },
                //customToggleViewModel: new CustomToggle(),
                characterStatDefaultValueViewModel: [],
                characterStatConditionViewModel: this.GetDefaultConditionValues(),
                view: VIEW.ADD,
                icon: ICON.Text
            }
            //this.title = 'Add Character Stat';
        }
    }

}
