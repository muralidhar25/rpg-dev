import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";


import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';

@NgModule({
  declarations: [
  ],
  providers: [
    AuthService,
    AuthGuard
    ],
  exports: [
  ]
})
export class AuthModule {}
