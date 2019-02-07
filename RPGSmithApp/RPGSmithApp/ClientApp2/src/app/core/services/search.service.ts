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

@Injectable()
export class SearchService extends EndpointFactory {

    private readonly searchCharacterApi: string = this.configurations.baseUrl + "/api/Search/SearchCharacter";

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector,
        private fileUploadService: FileUploadService) {
        super(http, configurations, injector);
    }

    searchCharacters<T>(query: string, userId:string): Observable<T> {
        let endpointUrl = `${this.searchCharacterApi}?q=${query}&userId=${userId}`;

        return this.http.get<T>(endpointUrl, this.getRequestHeaders())
            .catch(error => {
                return this.handleError(error, () => this.searchCharacters(query, userId));
            });
    }

}
