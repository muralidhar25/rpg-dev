import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ability } from "../../../../core/models/view-models/ability.model";
import { Characters } from "../../../../core/models/view-models/characters.model";
import { AlertService, DialogType, MessageSeverity } from "../../../../core/common/alert.service";
import { AuthService } from "../../../../core/auth/auth.service";
import { SharedService } from "../../../../core/services/shared.service";
import { LocalStoreManager } from "../../../../core/common/local-store-manager.service";
import { RulesetService } from "../../../../core/services/ruleset.service";
import { CharactersService } from "../../../../core/services/characters.service";
import { AbilityService } from "../../../../core/services/ability.service";
import { DBkeys } from "../../../../core/common/db-keys";
import { User } from "../../../../core/models/user.model";
import { Utilities } from "../../../../core/common/utilities";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { CastComponent } from "../../../../shared/cast/cast.component";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { CreateAbilitiesComponent } from "../../../../shared/create-abilities/create-abilities.component";
import { ServiceUtil } from "../../../../core/services/service-util";


@Component({
  selector: 'app-ability-ruleset-detail',
  templateUrl: './ability-ruleset-detail.component.html',
  styleUrls: ['./ability-ruleset-detail.component.scss']
})

export class AbilityRulesetDetailComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  isDropdownOpen: boolean = false;
  actionText: string;
  abilityId: number;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  AbilityDetail: any = new Ability();
  character: Characters = new Characters();
  charNav: any = {};
  pauseAbilityAdd: boolean;
  pauseAbilityCreate: boolean;
  pageRefresh: boolean;
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService,
    private abilityService: AbilityService, private rulesetService: RulesetService, private charactersService: CharactersService
  ) {
    this.route.params.subscribe(params => { this.abilityId = params['id']; });
    this.sharedService.shouldUpdateAbilityList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });
  }

  ngOnInit() {
    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);
    this.initialize();
    this.showActionButtons(this.showActions);

    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (char) {
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

  }

  private initialize() {
    this.character.characterId = this.localStorage.getDataObject<number>(DBkeys.CHARACTER_ID);
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.charactersService.getCharactersById<any>(this.character.characterId)
        .subscribe(data => {
          this.character = data;
          if (this.character.characterId) {
            this.gameStatus(this.character.characterId);
          }

        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { });
      this.abilityService.getAbilityById<any[]>(this.abilityId)
        .subscribe(data => {

          this.AbilityDetail = this.abilityService.abilityModelData(data, "UPDATE");

          this.ruleSetId = this.AbilityDetail.ruleSetId;
          //this.AbilityDetail.forEach(function (val) { val.showIcon = false; });
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
            class: 'modal-primary modal-custom',
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

  enableAbility(ability: Ability) {
    //this.isLoading = true;
    let enableTxt = ability.isEnabled ? 'Disable' : 'Enable';
    this.abilityService.enableAbility(ability.abilityId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          ability.isEnabled = ability.isEnabled ? false : true;
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

  //useAbility(ability: any) {
  //    let msg = "The command value for " + ability.name
  //        + " Ability has not been provided. Edit this record to input one.";

  //    if (ability.abilityCommand == undefined || ability.abilityCommand == null) {
  //        this.alertService.showDialog(msg, DialogType.alert, () => this.useAbilityHelper(ability));
  //    }
  //    else if (ability.abilityCommand.length == 0) {
  //        this.alertService.showDialog(msg, DialogType.alert, () => this.useAbilityHelper(ability));
  //    }
  //    else {
  //        //TODO
  //        this.useAbilityHelper(ability);
  //    }

  //}

  //private useAbilityHelper(ability: any) {
  //    this.isLoading = true;
  //    this.alertService.startLoadingMessage("", "TODO => Use Ability");
  //    setTimeout(() => {
  //    this.isLoading = false;
  //        this.alertService.stopLoadingMessage();
  //    }, 200);
  //}
  RedirectBack() {
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.ruleSetId]);
    }
    else if (this.IsComingFromCombatTracker_PC) {
      this.router.navigate(['/character/combatplayer', + this.character.characterId]);
    }
    else {
      this.router.navigate(['/character/ability', this.character.characterId]);
    }


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
    } else {
      this.useCommand(this.AbilityDetail)
    }
  }
  useCommand(Command: any) {
    let msg = "The command value for " + Command.name
      + " has not been provided. Edit this record to input one.";
    if (Command.command == undefined || Command.command == null || Command.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
    }
    else {
      //TODO
      this.useCommandHelper(Command);
    }
  }
  private useCommandHelper(Command: any) {
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
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
  }
  Redirect(path) {
    this.router.navigate([path, this.character.characterId]);
  }

  RedirectChar(path) {
    this.router.navigate([path]);
  }
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId(characterId)
      .subscribe(data => {
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
              //this.pauseAbilityAdd = data.pauseAbilityAdd;
              //this.pauseAbilityCreate = data.pauseAbilityCreate;
              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {
                this.pauseAbilityAdd = data.pauseAbilityAdd;
                this.pauseAbilityCreate = data.pauseAbilityCreate;

                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }

              }
              // this.pageRefresh = data.isPlayerCharacter;
            }
            if (data.isDeletedInvite) {
              this.router.navigate(['/characters']);
              this.alertService.showStickyMessage('', "Your " + data.name + " character has been deleted by the GM", MessageSeverity.error);
              setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
            }
          }
        }
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }
  GoToRuleBuff(RulesetBuffID: number) {
    this.router.navigate(['/ruleset/buff-effect-details', RulesetBuffID]);
  }

  GotoCommand(cmd) {
    //TODO get characterID
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
