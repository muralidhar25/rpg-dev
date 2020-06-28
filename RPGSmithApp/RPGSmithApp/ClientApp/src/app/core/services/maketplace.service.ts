import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { marketplaceModel } from '../../core/models/marketplace.model';


@Injectable()
export class MarketPlaceService extends EndpointFactory {
  private readonly _getmarketplaceUrl: string = '/api/marketplace/chargepayment';
  private readonly _getmarketplacelistUrl: string = '/api/marketplace/GetMarketPlaceList';

  get getmarketplaceUrl() { return this.configurations.baseUrl + this._getmarketplaceUrl; }
  get getmarketplacelistUrl() { return this.configurations.baseUrl + this._getmarketplacelistUrl; }

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    super(http, configurations, injector);
  }

  marketplacePayment<T>(marketplacemodal: marketplaceModel): Observable<T> {
    
    let endpointUrl = this.getmarketplaceUrl;
   
    return this.http.post(endpointUrl, JSON.stringify(marketplacemodal), { headers: this.getRequestHeadersNew(), responseType: "text" })
      .catch(error => {
        return this.handleError(error, () => this.marketplacePayment(marketplacemodal));
      });
   
  }

  getmarketplaceItems<T>(): Observable<T> {

    let endpointUrl = this.getmarketplacelistUrl;

    return this.http.get<T>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getmarketplaceItems());
      });
  }
}
