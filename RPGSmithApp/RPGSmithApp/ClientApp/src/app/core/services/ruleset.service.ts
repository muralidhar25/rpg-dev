import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { LocalStoreManager } from '../common/local-store-manager.service';
import { EndpointFactory } from '../common/endpoint-factory.service';
import { ConfigurationService } from '../common/configuration.service';
import { DBkeys } from '../common/db-keys';

import { RulesetEndpoint } from './ruleset-endpoint.service';
import { FileUploadService } from "../common/file-upload.service";
import { Ruleset } from '../models/view-models/ruleset.model';
import { CustomDice } from '../models/view-models/custome-dice.model';

@Injectable()
export class RulesetService {

  private readonly _uploadImgUrl: string = "/api/RuleSet/UpLoadRuleSetImage";
  get uploadImgUrl() { return this.configurations.baseUrl + this._uploadImgUrl; }

  private readonly _uploadImgBlobUrl: string = "/api/RuleSet/UpLoadRuleSetImageBlob";
  get uploadImgBlobUrl() { return this.configurations.baseUrl + this._uploadImgBlobUrl; }

  public ruleset: Ruleset;

  constructor(
    protected http: HttpClient,
    private router: Router,
    private configurations: ConfigurationService,
    private endpointFactory: EndpointFactory,
    private rulesetEndpoint: RulesetEndpoint,
    private fileUploadService: FileUploadService,
    private localStorage: LocalStoreManager) {
  }

  getRulesetById<T>(rulesetId: number): Observable<T> {
    return this.rulesetEndpoint.getRulesetById<T>(rulesetId);
  }

  getRulesets(page?: number, pageSize?: number) {
    return this.rulesetEndpoint.getRulesetsEndpoint<Ruleset[]>(page, pageSize);
  }

  getAllRuleSetByUserId(userId: string, page?: number, pageSize?: number) {
    return this.rulesetEndpoint.getAllRuleSetByUserId<any[]>(userId, page, pageSize);
  }
  getRuleSetToCreateCharacterByUserId(userId: string, page?: number, pageSize?: number) {
    return this.rulesetEndpoint.getRuleSetToCreateCharacterByUserId<any[]>(userId, page, pageSize);
  }

  getAllRulesets() {
    return this.rulesetEndpoint.getAllRulesetsEndpoint<Ruleset[]>();
  }

  getRulesetsCount(userId: string) {
    return this.rulesetEndpoint.getRulesetsCountEndpoint(userId);
  }
  getRulesetAndCharactrCount(userId: string) {
    return this.rulesetEndpoint.getRulesetAndCharactrCountEndpoint(userId);
  }

  getRulesetRecordCount(rulesetId: number) {
    return this.rulesetEndpoint.getRulesetRecordCountEndpoint(rulesetId);
  }

  getRulesetsByUserId<T>(userId: string): Observable<T> {
    return this.rulesetEndpoint.getRulesetsByUserEndpoint<T>(userId);
  }

  getCoreRulesets<T>(userId: string) {
    return this.rulesetEndpoint.getCoreRulesets<T>(userId);
  }

  getmockRulesets(page?: number, pageSize?: number) {
    return this.rulesetEndpoint.getmockRulesetsEndpoint<Ruleset[]>(page, pageSize);
  }

  createRuleset(ruleset: Ruleset): Observable<Ruleset> {
    return this.rulesetEndpoint.createRulesetEndpoint<Ruleset>(ruleset);
  }

  duplicateRuleset(ruleset: Ruleset): Observable<Ruleset> {
    //ruleset.id = 0;
    return this.rulesetEndpoint.duplicateRulesetEndpoint<Ruleset>(ruleset);
  }

  fileUpload(fileToUpload: File) {
    return this.fileUploadService.fileUpload<any>(this._uploadImgBlobUrl, fileToUpload);
  }

  updateRuleset(ruleset: Ruleset): Observable<Ruleset> {
    return this.rulesetEndpoint.updateRulesetEndpoint<Ruleset>(ruleset);
  }

  deleteRuleset(Id: number): Observable<Ruleset> {
    return this.rulesetEndpoint.deleteRulesetEndpoint<Ruleset>(<number>Id);
  }

  importRuleSet(code: string): Observable<Ruleset> {
    return this.rulesetEndpoint.importRuleSetsEndpoint(code);
  }

  addRuleSets<T>(rulesetIds: number[]): Observable<any> {
    return this.rulesetEndpoint.addRuleSets(rulesetIds);
  }

  shareRuleSetCode(email: string, code: string): Observable<any> {
    return this.rulesetEndpoint.shareRuleSetCodeEndpoint(email, code);
  }
  GetCopiedRulesetID(rulesetID: number, UserID: string) {
    return this.rulesetEndpoint.GetCopiedRulesetID(rulesetID, UserID);
  }

  //CustomDice part
  addEditCustomDice(customDices: CustomDice[], rulesetId: number): any {
    return this.rulesetEndpoint.addEditCustomDice(customDices, rulesetId);
  }
  getCustomDice(rulesetID: number): any {
    return this.rulesetEndpoint.getCustomDice(rulesetID);
  }
  getDefaultDices(): any {
    return this.rulesetEndpoint.getDefaultDices();
  }
  updateUserPurchasedRuleset<T>(ruleset: Ruleset): Observable<any> {
    return this.rulesetEndpoint.updateUserPurchasedRuleset(ruleset);
  }
  //
}
