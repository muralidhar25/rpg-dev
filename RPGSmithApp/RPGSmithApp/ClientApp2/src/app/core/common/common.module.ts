import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";

import { LocalStoreManager } from './local-store-manager.service';
import { AccountService } from './account.service';
import { AccountEndpoint } from './account-endpoint.service';
import { ConfigurationService } from './configuration.service';
import { AlertService } from './alert.service';
import { UserService } from './user.service';
import { FileUploadService } from './file-upload.service';
import { AppTitleService } from './app-title.service';

import {
  AppTranslationService,
  TranslateLanguageLoader
 } from './app-translation.service';
import { EndpointFactory } from './endpoint-factory.service';

@NgModule({
  declarations: [
  ],
  providers: [
    LocalStoreManager,
    AccountService,
    ConfigurationService,
    AppTranslationService,
    TranslateLanguageLoader,
    EndpointFactory,
    AccountEndpoint,
    AlertService,
    UserService,
    FileUploadService,
    AppTitleService
    ],
  exports: [
  ]
})
export class CommonModule {}
