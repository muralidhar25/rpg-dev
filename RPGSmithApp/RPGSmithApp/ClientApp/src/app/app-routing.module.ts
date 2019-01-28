
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from "./components/login/login.component";
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

import { RegisterEmailConfirmationComponent } from './components/register/register-email-confirmation/register-email-confirmation.component';
import { EmailConfirmationComponent } from './components/register/email-confirmation/email-confirmation.component';
import { EmailConfirmationSuccessComponent } from './components/register/email-confirmation-success/email-confirmation-success.component';
import { ForgotPasswordEmailComponent } from './components/forgot-password/forgot-password-email/forgot-password-email.component';
import { ResetPasswordSuccessComponent } from './components/reset-password/reset-password-success/reset-password-success.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsConditionComponent } from './components/terms-condition/terms-condition.component';
import { LogonWarningComponent } from './components/shared/logon-warning.component';
import { RulesetComponent } from './components/rulesets/ruleset/ruleset.component';

import { CharactersComponent } from './components/characters/characters/characters.component';
import { CharacterTilesComponent } from './components/characters/characters/character-tiles/character-tiles.component';
import { CharacterStatsComponent } from './components/character-stats/character-stats/character-stats.component';
import { CharacterDashboardComponent } from './components/character-dashboard/character-dashboard.component';

import { ItemMasterComponent } from './components/records/item-master/item-master.component';
import { SpellsComponent } from './components/records/spells/spells.component';
import { AbilitiesComponent } from './components/records/abilities/abilities.component';

import { ItemDetailsComponent } from './components/records/item-master/item-details/item-details.component';
import { SpellDetailsComponent  } from './components/records/spells/spell-details/spell-details.component';
import { AbilityDetailsComponent } from './components/records/abilities/ability-details/ability-details.component';
import { CharacterItemDetailsComponent } from './components/character-records/items/item-details/item-details.component';
import { CharacterSpellDetailsComponent } from './components/character-records/spells/spell-details/spell-details.component';
import { CharacterAbilityDetailsComponent } from './components/character-records/abilities/ability-details/ability-details.component';

import { CharacterItemsComponent }  from './components/character-records/items/items.component';
import { CharacterSpellsComponent }  from './components/character-records/spells/spells.component';
import { CharacterAbilitiesComponent }  from './components/character-records/abilities/abilities.component';
import { CharacterCharacterStatComponent } from './components/character-records/character-stats/character-stat.component';

import { HomeComponent } from "./components/home/home.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { SearchComponent } from './components/search/search/search.component';

import { RulesetDashboardComponent } from './components/rulesets/ruleset-dashboard/ruleset-dashboard/ruleset-dashboard.component';
import { AbilityRulesetDetailComponent } from './components/character-records/abilities/ability-ruleset-detail/ability-ruleset-detail.component';
import { SpellRulesetDetailComponent } from './components/character-records/spells/spell-ruleset-detail/spell-ruleset-detail.component';
import { IncompatibleBrowserComponent } from './components/incompatible-browser/incompatible-browser.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: "", component: CharactersComponent, canActivate: [AuthGuard], data: { title: "Home" } },

            { path: "register", component: RegisterComponent, data: { title: "Register" } },
            { path: "login", component: LoginComponent, data: { title: "Login" } },

            { path: "register-email-confirmation", component: RegisterEmailConfirmationComponent, data: { title: "Register Email Confirmation" } },
            { path: "email-confirmation", component: EmailConfirmationComponent, data: { title: "Email Confirmation" } },
            { path: "email-confirmation-success", component: EmailConfirmationSuccessComponent, data: { title: "Email Confirmation" } },
            { path: "forgot-password-email", component: ForgotPasswordEmailComponent, data: { title: "Forgot Password Email" } },
            { path: "reset-password-success", component: ResetPasswordSuccessComponent, data: { title: "Reset Password Success" } },
            
            { path: "logonwarning", component: LogonWarningComponent, data: { title: "Logon warning attempts" } },
            { path: "forgotpassword", component: ForgotPasswordComponent, data: { title: "Forgot Password" } },
            { path: "resetpassword", component: ResetPasswordComponent, data: { title: "Reset Password" } },
            { path: "privacypolicy", component: PrivacyPolicyComponent, data: { title: "Privacy Policy" } },
            { path: "termscondition", component: TermsConditionComponent, data: { title: "Terms Condition" } },

            { path: "search", component: SearchComponent, canActivate: [AuthGuard], data: { title: "Search" } },
            { path: "search/:q", component: SearchComponent, canActivate: [AuthGuard], data: { title: "Search" } },

            { path: "characters", component: CharactersComponent, canActivate: [AuthGuard], data: { title: "Characters" } },
            { path: "rulesets", component: RulesetComponent, canActivate: [AuthGuard], data: { title: "Rulesets" } },
    
            { path: "character/inventory/:id", component: CharacterItemsComponent, canActivate: [AuthGuard], data: { title: "Item"} },
            { path: "character/spell/:id", component: CharacterSpellsComponent, canActivate: [AuthGuard], data: { title: "Spells" } },
            { path: "character/ability/:id", component: CharacterAbilitiesComponent, canActivate: [AuthGuard], data: { title: "Abilities" } },
            { path: "character/character-stats/:id", component: CharacterCharacterStatComponent, canActivate: [AuthGuard], data: { title: "Character Stats" } },

            { path: "character/inventory-details/:id", component: CharacterItemDetailsComponent, canActivate: [AuthGuard], data: { title: "Item Details" } },
            { path: "character/spell-details/:id", component: CharacterSpellDetailsComponent, canActivate: [AuthGuard], data: { title: "Spell Details" } },
            { path: "character/ability-details/:id", component: CharacterAbilityDetailsComponent, canActivate: [AuthGuard], data: { title: "Ability Details" } },

            { path: "character/spell-detail/:id", component: SpellRulesetDetailComponent, canActivate: [AuthGuard], data: { title: "Spell Details" } },
            { path: "character/ability-detail/:id", component: AbilityRulesetDetailComponent, canActivate: [AuthGuard], data: { title: "Ability Details" } },

            { path: "character/tiles/:id", component: CharacterTilesComponent, canActivate: [AuthGuard], data: { title: "Tiles" } },
            { path: "character/dashboard/:id", component: CharacterDashboardComponent, canActivate: [AuthGuard], data: { title: "Character Dashboard" } },
            { path: "character-stats/:id", component: CharacterStatsComponent, canActivate: [AuthGuard], data: { title: "Character Stats" } },

            { path: "ruleset/item-master/:id", component: ItemMasterComponent, canActivate: [AuthGuard], data: { title: "Item Template" } },
            { path: "ruleset/spell/:id", component: SpellsComponent, canActivate: [AuthGuard], data: { title: "Spells" } },
            { path: "ruleset/ability/:id", component: AbilitiesComponent, canActivate: [AuthGuard], data: { title: "Abilities" } },

            { path: "ruleset/item-details/:id", component: ItemDetailsComponent, canActivate: [AuthGuard], data: { title: "Item Details" } },
            { path: "ruleset/spell-details/:id", component: SpellDetailsComponent, canActivate: [AuthGuard], data: { title: "Spell Details" } },
            { path: "ruleset/ability-details/:id", component: AbilityDetailsComponent, canActivate: [AuthGuard], data: { title: "Ability Details" } },

            { path: "ruleset/dashboard/:id", component: RulesetDashboardComponent, canActivate: [AuthGuard], data: { title: "Ruleset Dashboard" } },

            { path: "browsercompatibility", component: IncompatibleBrowserComponent, canActivate: [AuthGuard], data: { title: "Check Browser Compatibility" } },

            { path: "home", redirectTo: "/", pathMatch: "full" },
            { path: "**", component: NotFoundComponent, data: { title: "Page Not Found" } },
        ])
    ],
    exports: [
        RouterModule
    ],
    providers: [
        AuthService, AuthGuard
    ]
})
export class AppRoutingModule { }
