import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { LocalStoreManager } from './local-store-manager.service';
import { EndpointFactory } from './endpoint-factory.service';
import { ConfigurationService } from './configuration.service';
import { DBkeys } from './db-keys';

@Injectable()
export class FileUploadService extends EndpointFactory {

    private readonly uploadBingToBlobApi: string = this.configurations.baseUrl + "/api/Image/uploadBingToBlob";
    private readonly uploadBingToURLApi: string = this.configurations.baseUrl + "/api/Image/uploadURLToBlob";
    private readonly uploadBlobApi: string = this.configurations.baseUrl + "/api/Image/uploadBlobImage";
    private readonly uploadByUserApi: string = this.configurations.baseUrl + "/api/Image/uploadByUserId";

    constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
        super(http, configurations, injector);
    }

    fileUploadByUser<T>(userId: string, fileToUpload: File): Observable<T> {
        let endpointUrl = `${this.uploadByUserApi}?userId=${userId}`;

        const formData: FormData = new FormData();
        formData.append('UploadedImage', fileToUpload, fileToUpload.name);

        return this.http.post<T>(endpointUrl, formData, this.getRequestFileHeaders())
            //.map(() => { return true; })
            .catch(error => {
                return this.handleError(error, () => this.fileUploadByUser(userId, fileToUpload));
            });
    }

    fileUpload<T>(endpoint: string, fileToUpload: File): Observable<T> {
        const formData: FormData = new FormData();
        formData.append('UploadedImage', fileToUpload, fileToUpload.name);

        return this.http.post<T>(endpoint, formData, this.getRequestFileHeaders())
            //.map(() => { return true; })
            .catch(error => {
                return this.handleError(error, () => this.fileUpload(endpoint, fileToUpload));
            });
    }

    fileUploadFromBing<T>(file: string, ext: string): Observable<T> {
        let endpointUrl = `${this.uploadBingToBlobApi}?file=${file}&ext=${ext}`;

        return this.http.post<T>(endpointUrl, this.getRequestFileHeaders())
            //.map(() => { return true; })
            .catch(error => {
                return this.handleError(error, () => this.fileUploadFromBing(file, ext));
            });
    }

    fileUploadFromURL<T>(userId: string, file: string, ext: string): Observable<T> {
        let endpointUrl = `${this.uploadBingToURLApi}?userId=${userId}&file=${file}&ext=${ext}`;

        return this.http.post<T>(endpointUrl, this.getRequestFileHeaders())
            //.map(() => { return true; })
            .catch(error => {
                return this.handleError(error, () => this.fileUploadFromURL(userId, file, ext));
            });
    }
}
