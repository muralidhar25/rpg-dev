import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ModalModule } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ToastyModule } from 'ng2-toasty';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { NgxSocialLoginModule } from 'ngx-social-login';

import { AuthModule } from "./core/auth/auth.module";
import { CommonModule } from "./core/common/common.module";
import { PublicModule } from "./public/public.module";
import  { MainModule } from './main/main.module';
import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from './app.component';

import { IncompatibleBrowserComponent } from "./incompatible-browser/incompatible-browser.component";
import { AccordionModule, AccordionConfig } from 'ngx-bootstrap/accordion';


//import { AdsenseModule } from 'ng2-adsense';
import {
  AppTranslationService,
  TranslateLanguageLoader
} from './core/common/app-translation.service';
import { AppService1 } from './app.service';
//import { CampaignInviteComponent } from './rulesets/campaign-invite/campaign-invite.component';
import { ContextMenuModule } from 'ngx-contextmenu';
import { NgChatModule } from './ng-chat/ng-chat.module';
import { AdsenseModule } from 'ng2-adsense';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { CombatChatModule } from './combat-chat/combat-chat.module';
//import { LoaderComponent } from './shared/loader/loader.component';
import { LoaderModule } from './shared/loader.module';

@NgModule({
  declarations: [
    AppComponent,
    IncompatibleBrowserComponent,
    //LoaderComponent
   // CampaignInviteComponent
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ToastyModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useClass: TranslateLanguageLoader
        }
    }),
    LoaderModule,
    ModalModule.forRoot(),
    CarouselModule.forRoot(),
    ContextMenuModule.forRoot(),
    AccordionModule.forRoot(),
    NgxSocialLoginModule.init(
        {
            //'648640285849-3labmk96l8d4q372jc82ljrfcg73f9fs.apps.googleusercontent.com'
            google: {
                //client_id: '138970610928-4vthtjh8uhl77kfn3rp8h2dubhkdh4je.apps.googleusercontent.com'
                client_id: '648640285849-3labmk96l8d4q372jc82ljrfcg73f9fs.apps.googleusercontent.com'
            },
            facebook: {
                initOptions: {
                    appId: '1000184723477923' //'1455000857892141'
                }, loginOptions: {
                    scope: "email"
                }
            }
        }
    ),
    //AdsenseModule.forRoot({
    //  adClient: 'ca-pub-2730708357991854',
    //  adSlot: 2668335997,
    //}),
    AuthModule,
    CommonModule,
    PublicModule,
    AppRoutingModule,
    MainModule,
    NgChatModule,
    CombatChatModule,
    AdsenseModule.forRoot({
      adClient: 'ca-pub-8705225834552505'
    }),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      showInnerStroke :false
    })
  ],
  providers: [
    AppService1,
    { provide: AccordionConfig, useValue: { closeOthers: false } },
  ],
  exports: [
   // CampaignInviteComponent,
    //LoaderComponent
  ],
  entryComponents: [
  //  CampaignInviteComponent,
    //LoaderComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
