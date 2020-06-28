import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastyModule } from 'ng2-toasty';

import { RouterModule } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { AccountTermsComponent } from "./account-terms/account-terms.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { ForgotPasswordEmailComponent } from "./forgot-password/forgot-password-email/forgot-password-email.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { ResetPasswordSuccessComponent } from "./reset-password/reset-password-success/reset-password-success.component";
import { RegisterEmailConfirmationComponent } from './register/register-email-confirmation/register-email-confirmation.component';
import { EmailConfirmationComponent } from './register/email-confirmation/email-confirmation.component';
import { EmailConfirmationSuccessComponent } from './register/email-confirmation-success/email-confirmation-success.component';

import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionComponent } from './terms-condition/terms-condition.component';

import { LogonWarningComponent } from './logon-warning/logon-warning.component';
import { LoaderModule } from "../shared/loader.module";


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    AccountTermsComponent,
    ForgotPasswordComponent,
    ForgotPasswordEmailComponent,
    ResetPasswordComponent,
    ResetPasswordSuccessComponent,
    RegisterEmailConfirmationComponent,
    EmailConfirmationComponent,
    EmailConfirmationSuccessComponent,
    PrivacyPolicyComponent,
    TermsConditionComponent,
    LogonWarningComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToastyModule,
    LoaderModule
  ],
  providers: [],
  entryComponents:[
    AccountTermsComponent
  ],
  exports: [
    
  ]
})
export class PublicModule {}
