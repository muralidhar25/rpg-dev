import { Injectable } from '@angular/core';

import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import '@app/helpers/rxjs-operators';

//@Injectable()
export class BaseService {
  protected http: HttpClient;
  //protected securityService: OidcSecurityService;
  protected endpoint: string;

  public options =
    {
      headers: new HttpHeaders(),
      params: new HttpParams()
    };

  constructor(http: HttpClient, baseEndpoint: string = ''
  ) {
    this.http = http;
    this.endpoint = baseEndpoint;
    this.setHeaders();
  }

  protected setHeaders() {
    this.options.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
  }

  protected getEntity<T>(params: HttpParams = null, endpoint: string = this.endpoint): Observable<T> {
    if (params)
      this.options.params = params;

    return this.http
      .get<T>(endpoint, this.options)
      .catch(this.handleError);
  }

  protected findEntities<T>(params: HttpParams = null, endpoint: string = this.endpoint): Observable<Array<T>> {
    if (params)
      this.options.params = params;

    return this.http
      .get<Array<T>>(endpoint, this.options)
      .catch(this.handleError);
  }

  protected addEntity<T>(data: T, endpoint: string = this.endpoint): Observable<T> {
    return this.http
      .post<T>
      (
      endpoint,
      data,
      this.options
      )
      .catch(this.handleError);
  }

  protected updateEntity<T>(data: T, id: string, endpoint: string = this.endpoint): Observable<T> {
    return this.http
      .put<T>
      (
      endpoint + '/' + id,
      data,
      this.options
      )
      .catch(this.handleError);
  }

  protected deleteEntity<T>(data: T, id: string, endpoint: string = this.endpoint): Observable<T> {
    return this.http
      .delete<T>
      (
      endpoint + '/' + id,
      this.options
      )
      .catch(this.handleError);

  }

  protected extractData(res: Response) {
    let data = res.json() || [];
    return data;
  }

  protected handleError(error: any) {
    let errMsg =
      (error.message) ? error.message
        : error.status ? `${error.status} - ${error.statusText}`
          : 'Server error';

    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
