
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";

import { NotFoundComponent } from "./shared/not-found/not-found.component";
import { PublicModule } from "./public/public.module";
import { AuthGuard } from "./core/auth/auth-guard.service";
import { IncompatibleBrowserComponent } from './incompatible-browser/incompatible-browser.component';

import { LoginComponent } from "./public/login/login.component";

import { RegisterComponent } from "./public/register/register.component";

import { ForgotPasswordComponent } from "./public/forgot-password/forgot-password.component";
import { ForgotPasswordEmailComponent } from "./public/forgot-password/forgot-password-email/forgot-password-email.component";

import { ResetPasswordComponent } from "./public/reset-password/reset-password.component";
import { ResetPasswordSuccessComponent } from "./public/reset-password/reset-password-success/reset-password-success.component";

import { RegisterEmailConfirmationComponent } from './public/register/register-email-confirmation/register-email-confirmation.component';
import { EmailConfirmationComponent } from './public/register/email-confirmation/email-confirmation.component';
import { EmailConfirmationSuccessComponent } from './public/register/email-confirmation-success/email-confirmation-success.component';

import { PrivacyPolicyComponent } from './public/privacy-policy/privacy-policy.component';
import { TermsConditionComponent } from './public/terms-condition/terms-condition.component';

import { LogonWarningComponent } from './public/logon-warning/logon-warning.component';
import { FullScreenChatComponent } from './shared/full-screen-chat/full-screen-chat.component';

const charactersModule = "./characters/characters.module#CharactersModule";
const searchModule = "./search/search.module#SearchModule";
const rulesetsModule = "./rulesets/rulesets.module#RulesetsModule";
//const campaignsModule = "./campaign/campaigns.module#CampaignsModule";
const marketplaceModule = "./marketplace/marketplace.module#MarketplaceModule";

const routes: Routes = [
  {
    path: "",
    children: [
      { path: "", redirectTo: "login", pathMatch: "full" },
      { path: "login", component: LoginComponent, data: { title: "Login" }},
      { path: "register", component: RegisterComponent, data: { title: "Register" }},
      { path: "forgotpassword", component: ForgotPasswordComponent, data: { title: "Forgot Password" } },
      { path: "forgot-password-email", component: ForgotPasswordEmailComponent, data: { title: "Forgot Password Email" } },
      { path: "resetpassword", component: ResetPasswordComponent, data: { title: "Reset Password" } },
      { path: "reset-password-success", component: ResetPasswordSuccessComponent, data: { title: "Reset Password Success" } },
      { path: "register-email-confirmation", component: RegisterEmailConfirmationComponent, data: { title: "Register Email Confirmation" } },
      { path: "email-confirmation", component: EmailConfirmationComponent, data: { title: "Email Confirmation" } },
      { path: "email-confirmation-success", component: EmailConfirmationSuccessComponent, data: { title: "Email Confirmation" } },
      { path: "privacypolicy", component: PrivacyPolicyComponent, data: { title: "Privacy Policy" } },
      { path: "termscondition", component: TermsConditionComponent, data: { title: "Terms Condition" } },
      { path: "logonwarning", component: LogonWarningComponent, data: { title: "Logon warning attempts" } },
      { path: "full-screen-chat", component: FullScreenChatComponent, data: { title: "Chat" } },
    ]
  },
  {
    path: "",    
    children: [
      {
        path: "search",
        loadChildren: searchModule,
        canActivate: [AuthGuard]
      },
      {
        path: "rulesets",
        loadChildren: rulesetsModule,
        canActivate: [AuthGuard]
      },
{
        path: "ruleset",
        loadChildren: rulesetsModule,
        canActivate: [AuthGuard]
      },
      {
        path: "characters",
        loadChildren: charactersModule,
        canActivate: [AuthGuard]
      },
      {
        path: "character",
        loadChildren: charactersModule,
        canActivate: [AuthGuard]
      },
      //{
      //  path: "campaigns",
      //  loadChildren: campaignsModule,
      //  canActivate: [AuthGuard]
      //},
      //{
      //  path: "campaign",
      //  loadChildren: campaignsModule,
      //  canActivate: [AuthGuard]
      //},
      {
        path: "marketplace",
        loadChildren: marketplaceModule,
        canActivate: [AuthGuard]
      },
      {
        path: "",
        loadChildren: charactersModule,
        canActivate: [AuthGuard]
      },
    ]
  },
  { path: "browsercompatibility", component: IncompatibleBrowserComponent, canActivate: [AuthGuard], data: { title: "Check Browser Compatibility" } },
  { path: "home", redirectTo: "/", pathMatch: "full" },
  { path: "**", component: NotFoundComponent, data: { title: "Page Not Found" } },
];

@NgModule({
  imports: [PublicModule, RouterModule.forRoot(routes)],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [RouterModule]
})
export class AppRoutingModule { }
