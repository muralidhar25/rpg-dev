import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../core/common/configuration.service';
import { EndpointFactory } from '../../../core//common/endpoint-factory.service';
import { Color } from '../../models/tiles/color.model';
import { VIEW } from '../../models/enums';
import { AlertService, MessageSeverity } from '../../common/alert.service';
import { Utilities } from '../../common/utilities';

import { setTimeout } from 'timers';

@Injectable()
export class ColorService extends EndpointFactory {

  private readonly getRecentColorsApi: string = this.configurations.baseUrl + "/api/CharatcerTile/getRecentColors";
  private readonly getCoreColorsApi: string = this.configurations.baseUrl + "/api/CharatcerTile/getRPGCoreColors";
  private readonly AllReadyHaveColorApi: string = this.configurations.baseUrl + "/api/CharatcerTile/allReadyHaveColor";

  constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
    //private authService: AuthService, private alertService: AlertService) {
    super(http, configurations, injector);
  }

  getRPGCoreColors<T>(): Observable<T> {
    return this.http.get<T>(this.getCoreColorsApi, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRPGCoreColors());
      });
  }

  getRecentColors<T>(): Observable<T> {
    return this.http.get<T>(this.getRecentColorsApi, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.getRecentColors());
      });
  }
  AllReadyHaveColor<Boolean>(userId): Observable<Boolean> {
    let endpointUrl = `${this.AllReadyHaveColorApi}?userId=${userId}`;
    return this.http.get<Boolean>(endpointUrl, this.getRequestHeaders())
      .catch(error => {
        return this.handleError(error, () => this.AllReadyHaveColor(userId));
      });
  }
  public setDefaultRPGColors(view?: any): Color[] {

    //view = view.toLowerCase() == 'add' ? VIEW.ADD : VIEW.EDIT;
    let presetColors: Color[] = [];

    this.getRPGCoreColors<any>()
      .subscribe(data => {
        data.forEach(function (val, index) {
          presetColors.push({
            titleBgColor: val.titleBgColor,
            titleTextColor: val.titleTextColor,
            bodyBgColor: val.bodyBgColor,
            bodyTextColor: val.bodyTextColor,
            selected: false
          });
        });
      }, error => { }, () => { });

    //presetColors.push({ titleBgColor: '#FFFFFF', titleTextColor: '#000000', bodyBgColor: '#FFFFFF', bodyTextColor: '#000000', selected: true });
    //presetColors.push({ titleBgColor: '#D58917', titleTextColor: '#000000', bodyBgColor: '#d9c064', bodyTextColor: '#000000', selected: false });
    //presetColors.push({ titleBgColor: '#FFCD03', titleTextColor: '#000000', bodyBgColor: '#FFCD03', bodyTextColor: '#000000', selected: false });
    //presetColors.push({ titleBgColor: '#069774', titleTextColor: '#000000', bodyBgColor: '#2EBA9B', bodyTextColor: '#000000', selected: false });
    //presetColors.push({ titleBgColor: '#265256', titleTextColor: '#000000', bodyBgColor: '#2B787E', bodyTextColor: '#000000', selected: false });
    //presetColors.push({ titleBgColor: '#00774A', titleTextColor: '#000000', bodyBgColor: '#00774A', bodyTextColor: '#000000', selected: false });

    //presetColors.push({ titleBgColor: '#2973A8', titleTextColor: '#FFFFFF', bodyBgColor: '#6094BE', bodyTextColor: '#FFFFFF', selected: false });
    //presetColors.push({ titleBgColor: '#0A74B3', titleTextColor: '#FFFFFF', bodyBgColor: '#0A74B3', bodyTextColor: '#FFFFFF', selected: false });
    //presetColors.push({ titleBgColor: '#663796', titleTextColor: '#FFFFFF', bodyBgColor: '#9A59B4', bodyTextColor: '#FFFFFF', selected: false });
    //presetColors.push({ titleBgColor: '#952C21', titleTextColor: '#FFFFFF', bodyBgColor: '#E74D3F', bodyTextColor: '#FFFFFF', selected: false });
    //presetColors.push({ titleBgColor: '#374A5E', titleTextColor: '#FFFFFF', bodyBgColor: '#6C839B', bodyTextColor: '#FFFFFF', selected: false });
    //presetColors.push({ titleBgColor: '#000000', titleTextColor: '#FFFFFF', bodyBgColor: '#000000', bodyTextColor: '#FFFFFF', selected: false });

    return presetColors;
  }

  public setRPGColors(): Color[] {

    let presetColors: Color[] = [];

    this.getRecentColors<any>()
      .subscribe(data => {
        data.forEach(function (val, index) {

          presetColors.push({
            titleBgColor: val.titleBgColor,
            titleTextColor: val.titleTextColor,
            bodyBgColor: val.bodyBgColor,
            bodyTextColor: val.bodyTextColor,
            selected: index == 0 ? true : false
          });

        });

      }, error => {
        presetColors = null;
        //this.alertService.stopLoadingMessage();
        //let Errors = Utilities.ErrorDetail("Default Image Api", error);
        //if (Errors.sessionExpire) this.authService.logout(true);
        //else this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }, () => { });

    
    return presetColors;
  }

  getDefaultColors(): Color[] {
    let defaultRPGColors: Color[] = [];

    defaultRPGColors.push({ titleBgColor: '#FFFFFF', titleTextColor: '#000000', bodyBgColor: '#FFFFFF', bodyTextColor: '#000000', selected: false });
    defaultRPGColors.push({ titleBgColor: '#D58917', titleTextColor: '#000000', bodyBgColor: '#d9c064', bodyTextColor: '#000000', selected: false });
    defaultRPGColors.push({ titleBgColor: '#FFCD03', titleTextColor: '#000000', bodyBgColor: '#FFCD03', bodyTextColor: '#000000', selected: false });
    defaultRPGColors.push({ titleBgColor: '#069774', titleTextColor: '#000000', bodyBgColor: '#2EBA9B', bodyTextColor: '#000000', selected: false });
    defaultRPGColors.push({ titleBgColor: '#265256', titleTextColor: '#000000', bodyBgColor: '#2B787E', bodyTextColor: '#000000', selected: false });
    defaultRPGColors.push({ titleBgColor: '#00774A', titleTextColor: '#000000', bodyBgColor: '#00774A', bodyTextColor: '#000000', selected: false });

    return defaultRPGColors;
  }
}
