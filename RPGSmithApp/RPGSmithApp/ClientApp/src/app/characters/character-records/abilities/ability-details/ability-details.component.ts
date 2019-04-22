import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Characters } from "../../../../core/models/view-models/characters.model";
import { Ability } from "../../../../core/models/view-models/ability.model";
import { ConfigurationService } from "../../../../core/common/configuration.service";
import { AuthService } from "../../../../core/auth/auth.service";
import { AlertService, MessageSeverity, DialogType } from "../../../../core/common/alert.service";
import { CommonService } from "../../../../core/services/shared/common.service";
import { RulesetService } from "../../../../core/services/ruleset.service";
import { LocalStoreManager } from "../../../../core/common/local-store-manager.service";
import { CharacterAbilityService } from "../../../../core/services/character-abilities.service";
import { SharedService } from "../../../../core/services/shared.service";
import { AbilityService } from "../../../../core/services/ability.service";
import { DBkeys } from "../../../../core/common/db-keys";
import { User } from "../../../../core/models/user.model";
import { Utilities } from "../../../../core/common/utilities";
import { CastComponent } from "../../../../shared/cast/cast.component";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { CreateAbilitiesComponent } from "../../../../shared/create-abilities/create-abilities.component";
import { HeaderValues } from "../../../../core/models/headers.model";
import { CharactersService } from "../../../../core/services/characters.service";


@Component({
    selector: 'app-ability-details',
    templateUrl: './ability-details.component.html',
    styleUrls: ['./ability-details.component.scss']
})

export class CharacterAbilityDetailsComponent implements OnInit {

    bsModalRef: BsModalRef; 
    isLoading = false;
    showActions: boolean = true;
    isDropdownOpen: boolean = false;
    actionText: string;
    abilityId: number;
    ruleSetId: number;
    characterId: number;
    character: Characters = new Characters();
    AbilityDetail: any = new Ability();
    charNav: any = {};
    headers: HeaderValues = new HeaderValues();
  pageRefresh: boolean;

    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService, private characterAbilityService: CharacterAbilityService,
      private abilityService: AbilityService, private rulesetService: RulesetService,
      private charactersService: CharactersService
    ) {
        this.route.params.subscribe(params => { this.abilityId = params['id']; });
        this.sharedService.shouldUpdateAbilityList().subscribe(sharedServiceJson => {
            if (sharedServiceJson.onPage) this.AbilityDetail.isEnabled = sharedServiceJson.isEnabled;
            else this.initialize();
        });
    }

    @HostListener('document:click', ['$event.target'])
    documentClick(target: any) {
      
      try {
        if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE))
          this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
            if (target.className.endsWith("is-show"))
                this.isDropdownOpen = !this.isDropdownOpen;
            else this.isDropdownOpen = false;
        } catch (err) { this.isDropdownOpen = false; }
    }

    ngOnInit() {
        this.initialize();
        this.showActionButtons(this.showActions);

        let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
        let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
        if (!icharNav) {
          this.charNav = {
            'items': '/character/inventory/' + char.headerId,
            'spells': '/character/spell/' + char.headerId,
            'abilities': '/character/ability/' + char.headerId
          };
        }
        else {
          if (!icharNav[char.headerId]) {
            this.charNav = {
              'items': '/character/inventory/' + char.headerId,
              'spells': '/character/spell/' + char.headerId,
              'abilities': '/character/ability/' + char.headerId
            };
          } else {
            this.charNav = icharNav[char.headerId];
          }
        }
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
            if (this.headers) {
              if (this.headers.headerId && this.headers.headerLink == 'character') {
                this.characterId = this.headers.headerId;
              }
            }
          this.isLoading = true;
          this.gameStatus(this.characterId);
            this.characterAbilityService.getCharacterAbilityById<any>(this.abilityId)
                .subscribe(data => {
                  
                    this.AbilityDetail = this.characterAbilityService.abilityModelDetailData(data, "UPDATE");
                    this.AbilityDetail.currentNumberOfUses = data.currentNumberOfUses ? data.currentNumberOfUses : 0;
                    this.AbilityDetail.maxNumberOfUses = data.maxNumberOfUses ? data.maxNumberOfUses : 0;
                    //this.ruleSetId = this.AbilityDetail.ruleSetId;
                    this.characterId = data.characterId;
                    this.character = data.character;
                    this.rulesetService.GetCopiedRulesetID(this.AbilityDetail.ruleSetId, user.id).subscribe(data => {
                        let id: any = data
                        this.ruleSetId = id;
                        this.isLoading = false;
                    }, error => {
                        this.isLoading = false;
                        let Errors = Utilities.ErrorDetail("", error);
                        if (Errors.sessionExpire) {
                            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                            this.authService.logout(true);
                        }
                    }, () => { });
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

    showActionButtons(showActions) {
        this.showActions = !showActions;
        if (showActions) {
            this.actionText = 'ACTIONS';//'Show Actions';
        } else {
            this.actionText = 'HIDE';//'Hide Actions';
        }
    }

    editAbility(ability: any) {
        this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Ability';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.fromDetail = true;
        this.bsModalRef.content.abilityVM = ability;
        this.bsModalRef.content.isFromCharacter = true;
        this.bsModalRef.content.isFromCharacterId = +this.characterId;
        this.bsModalRef.content.isFromCharacterAbilityId = ability.characterAbilityId;
        this.bsModalRef.content.isFromCharacterAbilityCurrent = ability.currentNumberOfUses == null ? 0 : ability.currentNumberOfUses;
        this.bsModalRef.content.isFromCharacterAbilityMax = ability.maxNumberOfUses == null ? 0 : ability.maxNumberOfUses;
        this.bsModalRef.content.rulesetID = this.ruleSetId
    }

    duplicateAbility(ability: any) {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.abilityService.getAbilitiesCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
                        class: 'modal-primary modal-custom',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Duplicate Ability';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.fromDetail = true;
                    this.bsModalRef.content.abilityVM = ability;
                    this.bsModalRef.content.isFromCharacter = true;
                    this.bsModalRef.content.isFromCharacterId = +this.characterId;
                    this.bsModalRef.content.isFromCharacterAbilityId = ability.characterAbilityId;
                    this.bsModalRef.content.isFromCharacterAbilityCurrent = ability.currentNumberOfUses == null ? 0 : ability.currentNumberOfUses;
                    this.bsModalRef.content.isFromCharacterAbilityMax = ability.maxNumberOfUses == null ? 0 : ability.maxNumberOfUses;
                    this.bsModalRef.content.rulesetID = this.ruleSetId
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });  
    }

    deleteAbility(ability: Ability) {
        let message = "Are you sure you want to remove " + ability.name + " from this Character?";
        this.alertService.showDialog(message,
            DialogType.confirm, () => this.deleteAbilityHelper(ability), null, 'Yes', 'No');
    }

    private deleteAbilityHelper(ability: Ability) {
        ability.ruleSetId = this.ruleSetId;
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting a Ability");

        this.characterAbilityService.deleteCharacterAbility_up(this.abilityId, this.ruleSetId)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Ability has been deleted successfully.", "", MessageSeverity.success);
                    //this.initialize();
                    //this.location.replaceState('/'); 
                    this.router.navigate(['/character/ability', this.characterId]);
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to Delete", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    enableAbility1(ability: Ability) {
        let enableTxt = ability.isEnabled ? 'Disable' : 'Enable';
        this.abilityService.enableAbility(ability.abilityId)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.AbilityDetail.isEnabled = ability.isEnabled ? false : true;
                    this.sharedService.updateAbilityList({ isEnabled: this.AbilityDetail.isEnabled, onPage: true });
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to " + enableTxt, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    enableAbility(ability: any) {
        //this.isLoading = true;
        let enableTxt = ability.isEnabled ? 'Disable' : 'Enable';
        this.characterAbilityService.toggleEnableCharacterAbility(ability.characterAbilityId)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.AbilityDetail.isEnabled = ability.isEnabled ? false : true;
                    this.sharedService.updateAbilityList({ isEnabled: this.AbilityDetail.isEnabled, onPage: true });
                    //this.initialize();
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to " + enableTxt, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }
    useAbility(ability: any) {
        if (this.AbilityDetail.abilityCommandVM.length) {
            this.bsModalRef = this.modalService.show(CastComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });

            this.bsModalRef.content.title = "Ability Commands"
            this.bsModalRef.content.ListCommands = this.AbilityDetail.abilityCommandVM
            this.bsModalRef.content.Command = this.AbilityDetail
            this.bsModalRef.content.Character = this.character
        } else {
            this.useCommand(this.AbilityDetail, ability.characterAbilityId)
        }
    }
    useCommand(Command: any, abilityId: string = '') {
        let msg = "The command value for " + Command.name
            + " has not been provided. Edit this record to input one.";
        if (Command.command == undefined || Command.command == null || Command.command == '') {
            this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
        }
        else {
            //TODO
          this.useCommandHelper(Command, abilityId);
        }
    }
  private useCommandHelper(Command: any, abilityId: string = '') {
        this.bsModalRef = this.modalService.show(DiceRollComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.tile = -2;
        this.bsModalRef.content.characterId = this.character.characterId;
        this.bsModalRef.content.character = this.character;
        this.bsModalRef.content.command = Command.command;
        if (Command.hasOwnProperty("abilityId")) {
            this.bsModalRef.content.recordName = Command.name;
            this.bsModalRef.content.recordImage = Command.imageUrl;
            this.bsModalRef.content.recordType = 'ability';
            this.bsModalRef.content.recordId = abilityId;
        }
        this.bsModalRef.content.event.subscribe(result => {
        });
    }
  RedirectBack() {
    //this.router.navigate(['/character/ability', this.characterId]);
        window.history.back();
    }

    Redirect(path) {
        this.router.navigate([path, this.characterId]);
  }

  RedirectChar(path) {
        this.router.navigate([path]);
    }

    gotoDashboard() {
        this.router.navigate(['/character/dashboard', this.characterId]);
    }
    ViewImage(img) {
        if (img) {
            this.bsModalRef = this.modalService.show(ImageViewerComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.ViewImageUrl = img.src;
            this.bsModalRef.content.ViewImageAlt = img.alt;
        }
    }

  refresh() {
    this.initialize();
  }
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId(this.characterId)
      .subscribe(data => {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user.isGm) {
            this.pageRefresh = user.isGm;
          }
          else if (data.isPlayerCharacter) {
            this.pageRefresh = data.isPlayerCharacter;
          }
         else if (data.isDeletedInvite) {
            this.router.navigate(['/characters']);
            this.alertService.showStickyMessage('', "Player Deleted by GM", MessageSeverity.error);
            setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
          }
          else {
            if (data.pauseGame) {
              this.router.navigate(['/characters']);
              this.alertService.showStickyMessage('', "Game Paused By GM", MessageSeverity.error);
              setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
            }
           // this.pageRefresh = data.isPlayerCharacter;
          }
        } 
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }
}
