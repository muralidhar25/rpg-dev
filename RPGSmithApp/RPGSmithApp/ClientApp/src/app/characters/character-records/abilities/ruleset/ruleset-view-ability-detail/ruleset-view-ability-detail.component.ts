import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Characters } from "../../../../../core/models/view-models/characters.model";
import { Ruleset } from "../../../../../core/models/view-models/ruleset.model";
import { Ability } from "../../../../../core/models/view-models/ability.model";
import { CharacterAbilities } from "../../../../../core/models/view-models/character-abilities.model";
import { ConfigurationService } from "../../../../../core/common/configuration.service";
import { AlertService, DialogType, MessageSeverity } from "../../../../../core/common/alert.service";
import { AuthService } from "../../../../../core/auth/auth.service";
import { SharedService } from "../../../../../core/services/shared.service";
import { CommonService } from "../../../../../core/services/shared/common.service";
import { AbilityService } from "../../../../../core/services/ability.service";
import { RulesetService } from "../../../../../core/services/ruleset.service";
import { CharactersService } from "../../../../../core/services/characters.service";
import { LocalStoreManager } from "../../../../../core/common/local-store-manager.service";
import { CharacterAbilityService } from "../../../../../core/services/character-abilities.service";
import { DBkeys } from "../../../../../core/common/db-keys";
import { User } from "../../../../../core/models/user.model";
import { Utilities } from "../../../../../core/common/utilities";
import { ImageViewerComponent } from "../../../../../shared/image-interface/image-viewer/image-viewer.component";
import { CastComponent } from "../../../../../shared/cast/cast.component";
import { DiceRollComponent } from "../../../../../shared/dice/dice-roll/dice-roll.component";
import { CreateAbilitiesComponent } from "../../../../../shared/create-abilities/create-abilities.component";
import { AppService1 } from "../../../../../app.service";

@Component({
  selector: 'app-ruleset-view-ability-detail',
  templateUrl: './ruleset-view-ability-detail.component.html',
  styleUrls: ['./ruleset-view-ability-detail.component.scss']
})
export class RulesetViewAbilityDetailComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  isDropdownOpen: boolean = false;
  actionText: string;
  abilityId: number;
  ruleSetId: number;
  //isDropdownOpen: boolean = false;
  bsModalRef: BsModalRef;
  AbilityDetail: any = new Ability();
  character: Characters = new Characters();
  ruleset: Ruleset = new Ruleset();
  charNav: any = {};

  characterAbilityModal: any = new CharacterAbilities();
  IsAddingRecord: boolean = false;
  pageRefresh: boolean;
  pauseAbilityAdd: boolean;
  pauseAbilityCreate: boolean;
  showManage: boolean = false;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
    private abilityService: AbilityService, private rulesetService: RulesetService, private charactersService: CharactersService,
    private characterAbilityService: CharacterAbilityService, public appService: AppService1
  ) {
    this.route.params.subscribe(params => { this.abilityId = params['id']; });
    this.sharedService.shouldUpdateAbilityList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });
  }
  //@HostListener('document:click', ['$event.target'])
  //documentClick(target: any) {
  //  try {
  //    if (target.className.endsWith("is-show"))
  //      this.isDropdownOpen = !this.isDropdownOpen;
  //    else this.isDropdownOpen = false;
  //  } catch (err) { this.isDropdownOpen = false; }
  //}

  ngOnInit() {
    this.initialize();
    this.showActionButtons(this.showActions);

    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (char) {
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

  }

  private initialize() {
    this.character.characterId = this.localStorage.getDataObject<number>(DBkeys.CHARACTER_ID);

    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (char) {
      if (char.headerId) {
        this.character.characterName = char.headerName;
        this.character.imageUrl = char.headerImage;
        this.character.characterId = char.headerId;
        this.setHeaderValues(this.character);
      }
    }


    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      this.rulesetService.getRulesetById_CacheNew<any>(this.ruleSetId)
        .subscribe(data => {
          this.ruleset = data;
        },
          error => {
          });

      this.gameStatus(this.character.characterId);

      this.charactersService.getCharactersById_Cache<any>(this.character.characterId)
        .subscribe(data => {
          this.character = data;

        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { });
      this.abilityService.getAbilityById_Cache<any[]>(this.abilityId)
        .subscribe(data => {
          this.AbilityDetail = this.abilityService.abilityModelData(data, "UPDATE");;
          this.ruleSetId = this.AbilityDetail.ruleSetId;
          this.isLoading = false;
          //this.AbilityDetail.forEach(function (val) { val.showIcon = false; });

          ////this.rulesetService.GetCopiedRulesetID(this.AbilityDetail.ruleSetId, user.id).subscribe(data => {
          ////  let id: any = data
          ////  this.ruleSetId = id;
          ////  this.isLoading = false;
          ////}, error => {
          ////  this.isLoading = false;
          ////  let Errors = Utilities.ErrorDetail("", error);
          ////  if (Errors.sessionExpire) {
          ////    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          ////    this.authService.logout(true);
          ////  }
          ////}, () => { });

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

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
      //if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE))
      //  this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
      if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE)) {
        if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerLink == 'character') {
          this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
        }
      }
      if (target.className.endsWith("is-show"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }


  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';// 'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  RedirectBack() {
    //this.router.navigate(['/character/ruleset/abilities', this.ruleSetId]);
    window.history.back();
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
      this.bsModalRef.content.recordType = 'ch-rs-ability';
      this.bsModalRef.content.recordId = ability.abilityId;
    } else {
      this.useCommand(this.AbilityDetail, ability.abilityId);
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
      this.bsModalRef.content.recordType = 'ch-rs-ability';
      this.bsModalRef.content.recordId = abilityId;
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
  }
  Redirect(path) {
    this.router.navigate([path, this.character.characterId]);
  }
  AddAbility(ability: Ability) {

    this.IsAddingRecord = true;
    this.alertService.startLoadingMessage("", "Adding ability to character");
    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (char) {
      if (char.headerId) {
        this.characterAbilityModal.multiAbilities = [];
        this.characterAbilityModal.multiAbilities.push({ abilityId: ability.abilityId });
        this.characterAbilityModal.characterId = char.headerId;
        this.characterAbilityModal.abilityId = ability.abilityId;
        this.characterAbilityModal.isEnabled = false;

        this.characterAbilityService.createCharacterAbility(this.characterAbilityModal)
          .subscribe(
            data => {
              this.IsAddingRecord = false;
              this.alertService.stopLoadingMessage();
              let message = "This ability has been added to your character.";
              this.alertService.showMessage(message, "", MessageSeverity.success);
              //this.sharedService.UpdateCharacterAbilityList(true);
            },
            error => {
              this.IsAddingRecord = false;
              this.alertService.stopLoadingMessage();
              let Errors = Utilities.ErrorDetail("Unable to Add", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              else
                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            });
      }
    }
  }
  private setHeaderValues(character: Characters): any {
    let headerValues = {
      headerName: character.characterName,
      headerImage: character.imageUrl,
      headerId: character.characterId,
      headerLink: 'character',
      hasHeader: true
    };
    this.appService.updateAccountSetting1(headerValues);
    this.sharedService.updateAccountSetting(headerValues);
    this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
  }
  editAbility(ability: Ability) {
    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Ability';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.abilityVM = ability;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.event.subscribe(data => {
      this.abilityId = data.abilityId;
      this.initialize();
    });
  }

  duplicateAbility(ability: Ability) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.abilityService.getAbilitiesCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Ability';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.fromDetail = true;
          this.bsModalRef.content.abilityVM = ability;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteAbility(ability: Ability) {
    let message = "Are you sure you want to delete this " + ability.name
      + " Ability? This will also remove the Ability from any character(s) / item(s) that may be associated with it.";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteAbilityHelper(ability), null, 'Yes', 'No');
  }

  private deleteAbilityHelper(ability: Ability) {
    ability.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Ability");

    //this.abilityService.deleteAbility(ability.abilityId)
    //    .subscribe(
    //        data => {
    //            this.isLoading = false; 
    //            this.alertService.stopLoadingMessage();
    //            this.alertService.showMessage("Ability has been deleted successfully.", "", MessageSeverity.success);
    //            //this.initialize();
    //            //this.location.replaceState('/'); 
    //            this.router.navigate(['/ruleset/ability', this.ruleSetId]);
    //        },
    //        error => {
    //            this.isLoading = false; 
    //            this.alertService.stopLoadingMessage();
    //            let Errors = Utilities.ErrorDetail("Unable to Delete", error);
    //            if (Errors.sessionExpire) {
    //                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
    //                this.authService.logout(true);
    //            }
    //            else
    //                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
    //        });
    this.abilityService.deleteAbility_up(ability)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Ability has been deleted successfully.", "", MessageSeverity.success);
          //this.initialize();
          //this.location.replaceState('/'); 
          this.router.navigate(['/ruleset/ability', this.ruleSetId]);
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
  refresh() {
    this.initialize();
  }
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId_Cache(characterId)
      .subscribe(data => {
        this.showManage = true;
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user == null) {
            this.authService.logout();
          }
          else {
            if (user.isGm) {
              this.pageRefresh = user.isGm;
            }
            else if (data.isPlayerCharacter) {
              this.pageRefresh = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {
              this.showManage = data.isPlayerLinkedToCurrentCampaign;
              //this.pauseAbilityAdd = data.pauseAbilityAdd;
              //this.pauseAbilityCreate = data.pauseAbilityCreate;
              //if (data.pauseGame) {                
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {
                //this.showManage = false;
                this.pauseAbilityAdd = data.pauseAbilityAdd;
                this.pauseAbilityCreate = data.pauseAbilityCreate;
                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }
              }
            }
            else {
              this.showManage = true;
            }
            if (data.isDeletedInvite) {
              this.router.navigate(['/characters']);
              this.alertService.showStickyMessage('', "Your " + data.name + " character has been deleted by the GM", MessageSeverity.error);
              setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
            }
          }

          // this.pageRefresh = data.isPlayerCharacter;
        }
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }

  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = this.character.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.recordName = this.character.characterName;
    this.bsModalRef.content.recordImage = this.character.imageUrl;
  }
  GoToRuleBuff(RulesetBuffID: number) {
    this.router.navigate(['/ruleset/buff-effect-details', RulesetBuffID]);
  }
  GotoCommand(cmd) {
    // TODO get characterID
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = cmd;
  }
}
