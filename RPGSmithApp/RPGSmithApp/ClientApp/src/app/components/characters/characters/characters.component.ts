import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from '../../../services/alert.service';
import { AuthService } from "../../../services/auth.service";
import { ConfigurationService } from '../../../services/configuration.service';
import { Utilities } from '../../../services/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { RulesetService } from "../../../services/ruleset.service";
import { Ruleset } from '../../../models/view-models/ruleset.model';
import { CharactersService } from '../../../services/characters.service';
import { CharactersFormComponent } from '../characters-form/characters-form.component';
import { AccountSettingsComponent } from "../../accounts/account-settings/account-settings.component";
import { Characters } from '../../../models/view-models/characters.model';
import { VIEW } from '../../../models/enums';
import { User } from '../../../models/user.model';
import { DBkeys } from '../../../services/db-Keys';
import { LocalStoreManager } from '../../../services/local-store-manager.service';
import { SharedService } from "../../../services/shared.service";
import { CommonService } from "../../../services/shared/common.service";

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss']
})
export class CharactersComponent implements OnInit {

    query: string;
    page: number = 1;
    pageSize: number = 30;
    bsModalRef: BsModalRef;
    characters: any = [];
    rulesets: Ruleset[];
    rulesetId: number;
    isLoading = false;
    showForm: boolean = false;
    hasAuth: boolean = false;
    isAdminUser: boolean = false;
    totalRuleSets: number = 1;
    constructor(
        private router: Router, private alertService: AlertService,
        private authService: AuthService, private rulesetService: RulesetService,
        private charactersService: CharactersService, private configurations: ConfigurationService,
        private modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService
    ) {
         if (!this.authService.isLoggedIn) {
             this.authService.logout();
         } else
             this.hasAuth = true;

        this.sharedService.shouldUpdateCharacterList().subscribe(serviceJson => {
            
            if (serviceJson) {
                this.page = 1;
                this.pageSize = 30;
                this.initialize();
            }
        });
    }

    ngOnInit() {
        this.destroyModalOnInit();
        this.initialize();
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isAdminUser = user.roles.some(function (value) { return (value === "administrator") });
            this.isLoading = true;
            this.hasAuth = true;
            //if (!this.authService.hasEmailFb && this.authService.socialLogin === 'facebook') {
                //this.openAccountSettingsModal();
            //}
            this.rulesetService.getRulesetsCount(user.id)
                .subscribe(data => {
                    this.totalRuleSets = data;
                },
                    error => {
                        this.totalRuleSets = 1;
                    });
            this.charactersService.getCharactersByUserId_sp<any>(user.id, this.page, this.pageSize)
                .subscribe(data => {
                    this.totalRuleSets = data.RuleSet.length;
                    this.characters = Utilities.responseData(data.CharactersList, this.pageSize);
                    this.rulesets = data.RuleSet;
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("Error", error);
                    if (Errors.sessionExpire) this.authService.logout(true);
                }, () => { });

            //this.rulesetService.getRulesetsByUserId<any[]>(user.id)
            //    .subscribe(data => {
                    
            //        this.rulesets = data;
            //        this.isLoading = false;
            //    }, error => {
            //        this.isLoading = false;
            //        let Errors = Utilities.ErrorDetail("Error", error);
            //        if (Errors.sessionExpire) this.authService.logout(true);
            //    }, () => { });

            //resetting headers
            this.resetHeaderValues();
        }
    }

    onScroll() {

        ++this.page;

        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.charactersService.getCharactersByUserId_sp<any>(user.id, this.page, this.pageSize)
                .subscribe(data => {

                    var _CharactersList = data.CharactersList;
                    for (var i = 0; i < _CharactersList.length; i++) {
                        this.characters.push(_CharactersList[i]);
                    }

                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                }, () => { });
        }
    }

    newCharacter() {
        this.showAddModal();
    }
    //[routerLink]="['/character/dashboard', character.characterId]
    private showAddModal() {
        this.bsModalRef = this.modalService.show(CharactersFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'New Character';
        this.bsModalRef.content.button = 'SAVE';
        this.bsModalRef.content.charactersModel = {
            characterId: 0,
            ruleSets: this.rulesets
        };
        this.bsModalRef.content.ruleSet = this.rulesets;
    }
    
    manageIcon(id: number) {
        this.characters.forEach(function (val) {
            if (id === val.characterId) {
                val.showIcon = true;
            } else {
                val.showIcon = false;
            }
        })
    }

    gotoDashboard(character: Characters) {        
        this.rulesetId = character.ruleSet == undefined ? 0 : character.ruleSet.ruleSetId;
        this.setRulesetId(this.rulesetId);
        this.router.navigate(['/character/dashboard', character.characterId])
    }

    editCharacter(character: Characters) {
        this.bsModalRef = this.modalService.show(CharactersFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Character';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.characterImage = character.characterImage;
        this.bsModalRef.content.charactersModel = character;
        this.bsModalRef.content.ruleSet = this.rulesets;
    }

    duplicateCharacter(character: Characters) {
        this.bsModalRef = this.modalService.show(CharactersFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Duplicate Character';
        this.bsModalRef.content.button = 'DUPLICATE';
        this.bsModalRef.content.characterImage = character.characterImage;
        this.bsModalRef.content.charactersModel = character;
        this.bsModalRef.content.ruleSet = this.rulesets;
    }

    deleteCharacter(character: Characters) {
        this.alertService.showDialog('Are you sure you want to delete "' + character.characterName + '" Character?',
            DialogType.confirm, () => this.deleteCharacterHelper(character), null, 'Yes', 'No');
    }

    private deleteCharacterHelper(character: Characters) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting Character");

        this.charactersService.deleteCharacters(character.characterId)
            .subscribe(
            data => {                    
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    this.commonService.UpdateCounts(); /*update charaters count*/

                    this.alertService.showMessage("Character has been deleted successfully.", "", MessageSeverity.success);                    
                    this.characters = this.characters.filter((val) => val.characterId != character.characterId);
                   // this.initialize();
                },
            error => {
                
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Delete";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

            });
    }

    private openAccountSettingsModal() {
        this.bsModalRef = this.modalService.show(AccountSettingsComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
    }

    private resetHeaderValues(): any {
        try {
            this.sharedService.updateAccountSetting(-1);
            this.localStorage.deleteData(DBkeys.HEADER_VALUE);
            this.localStorage.saveSyncedSessionData(null, DBkeys.HEADER_VALUE);
        } catch (err) { }
    }

    private setRulesetId(rulesetId: number) {
        this.localStorage.deleteData(DBkeys.RULESET_ID);
        this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
        //console.log(' rulesetId => '+ this.localStorage.getDataObject<number>(DBkeys.RULESET_ID));
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            this.sharedService.updateAccountSetting(false);
            this.localStorage.deleteData(DBkeys.HEADER_VALUE);
            //const modalContainer = document.querySelector('modal-container');
            //if (modalContainer !== null) {
            //    modalContainer.parentNode.removeChild(modalContainer);
            //}
        } catch (err) { }
    }
}
