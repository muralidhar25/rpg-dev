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

import { DBkeys } from '../common/db-keys';

import { CharacterDashboardLayout } from '../models/view-models/character-dashboard-layout.model';
import { ICON, VIEW } from '../models/enums';

@Injectable()
export class CharacterDashboardLayoutService extends EndpointFactory {

    private readonly getByCharacterIdUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardLayout/getByCharacterId";
    private readonly getCountByCharacterIdUrl: string = this.configurations.baseUrl + "api/CharacterDashboardLayout/GetCountByCharacterId";
    private readonly createUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardLayout/create";
    private readonly updateUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardLayout/update";
    private readonly deleteUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardLayout/delete";
    private readonly duplicateUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardLayout/duplicate";
    private readonly updateSortOrderUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardLayout/updateSortOrder";
    private readonly getByIdUrl: string = this.configurations.baseUrl + "/api/CharacterDashboardLayout/GetById";
    private readonly updateDefaultLayoutApi: string = this.configurations.baseUrl +"/api/CharacterDashboardLayout/UpdateDefaultLayout";
    private readonly updateDefaultLayoutPageApi: string = this.configurations.baseUrl +"/api/CharacterDashboardLayout/UpdateDefaultLayoutPage";

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
        private fileUploadService: FileUploadService) {
            super(http, configurations, injector);
    }

    getCharacterDashboardLayoutById<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.getByIdUrl}?id=${Id}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getCharacterDashboardLayoutById(Id));
            });
    }

    getLayoutsCountByCharacterId<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.getCountByCharacterIdUrl}?characterId=${Id}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getLayoutsCountByCharacterId(Id));
            });
    }

    getLayoutsByCharacterId<T>(Id: number, page: number, pageSize: number): Observable<T> {
        let endpointUrl = `${this.getByCharacterIdUrl}?characterId=${Id}&page=${page}&pageSize=${pageSize}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.getLayoutsByCharacterId(Id, page, pageSize));
            });
    }

    createCharacterDashboardLayout<T>(characterDashboardLayout: CharacterDashboardLayout): Observable<T> {

        let endpointUrl = this.createUrl;
        if (characterDashboardLayout.characterDashboardLayoutId == 0 || characterDashboardLayout.characterDashboardLayoutId === undefined)
            endpointUrl = this.createUrl;
        else
            endpointUrl = this.updateUrl;

        return this.http.post(endpointUrl, JSON.stringify(characterDashboardLayout), { headers: this.getRequestHeadersNew(), responseType: "text" })
            .catch(error => {
                return this.handleError(error, () => this.createCharacterDashboardLayout(characterDashboardLayout));
            });
    }

    updateCharacterDashboardLayout<T>(characterDashboardLayout: CharacterDashboardLayout): Observable<T> {

        return this.http.post<T>(this.updateUrl, JSON.stringify(characterDashboardLayout), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.updateCharacterDashboardLayout(characterDashboardLayout));
            });
    }

    duplicateCharacterDashboardLayout<T>(characterDashboardLayout: CharacterDashboardLayout): Observable<T> {

        return this.http.post<T>(this.duplicateUrl, JSON.stringify(characterDashboardLayout), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.duplicateCharacterDashboardLayout(characterDashboardLayout));
            });
    }

    deleteCharacterDashboardLayout<T>(Id: number): Observable<T> {
        let endpointUrl = `${this.deleteUrl}?id=${Id}`;

        return this.http.delete<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.deleteCharacterDashboardLayout(Id));
            });
    }

    sortOrderLayouts<T>(objLayouts: any): Observable<T> {

        return this.http.post<T>(this.updateSortOrderUrl, JSON.stringify(objLayouts), this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.sortOrderLayouts(objLayouts));
            });
    }

    updateDefaultLayout<T>(layoutId: number): Observable<T> {
        let endpoint = `${this.updateDefaultLayoutApi}?layoutId=${layoutId}`;
        return this.http.post<T>(endpoint, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.updateDefaultLayout(layoutId));
            });
    }

    updateDefaultLayoutPage<T>(layoutId: number, pageId:number): Observable<T> {
        let endpoint = `${this.updateDefaultLayoutPageApi}?layoutId=${layoutId}&pageId=${pageId}`;
        return this.http.post<T>(endpoint, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.updateDefaultLayoutPage(layoutId, pageId));
            });
    }

    //bind form model
    public abilityModelData(abilityVM: any, _view: string): any {

        if (abilityVM == null) return { abilityId: 0, ruleSetId: 0 };
        let abilityFormModal: any;

        if (_view === 'DUPLICATE' || _view === 'UPDATE') {

            abilityFormModal = {
                abilityId: abilityVM.abilityId,
                ruleSetId: abilityVM.ruleSetId,
                name: _view === 'DUPLICATE' ? '' : abilityVM.name,
                level: abilityVM.level == null || abilityVM.level == undefined ? '' : abilityVM.level,
                command: abilityVM.command,
                showUse: abilityVM.command == null || abilityVM.command == undefined || abilityVM.command == '' ? false : true,
                abilityCommandVM: abilityVM.abilityCommand == undefined ? [] : abilityVM.abilityCommand,
                maxNumberOfUses:abilityVM.maxNumberOfUses,
                currentNumberOfUses:abilityVM.currentNumberOfUses,
                description:abilityVM.description,
                stats:abilityVM.stats,
                imageUrl:abilityVM.imageUrl,
                isEnabled:abilityVM.isEnabled,
                ruleset: abilityVM.ruleset,
                showIcon: false,
                metatags: abilityVM.metatags == null || abilityVM.metatags == undefined ? '' : abilityVM.metatags,
                view: _view === 'DUPLICATE' ? VIEW.DUPLICATE : VIEW.EDIT
                //sortOrder: abilityVM.sortOrder
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
                level: ''
                //sortOrder: abilityVM.sortOrder
            }
        }

        return abilityFormModal;
    }


}
