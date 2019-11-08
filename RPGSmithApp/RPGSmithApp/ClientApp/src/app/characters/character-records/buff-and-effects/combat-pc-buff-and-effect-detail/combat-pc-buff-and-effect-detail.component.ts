import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';

import { PlatformLocation } from "@angular/common";
import { AlertService, MessageSeverity, DialogType } from "../../../../core/common/alert.service";
import { DBkeys } from "../../../../core/common/db-keys";
import { Utilities } from "../../../../core/common/utilities";
import { CreateBuffAndEffectsComponent } from "../../../../shared/create-buff-and-effects/create-buff-and-effects.component";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { BuffAndEffect } from "../../../../core/models/view-models/buff-and-effect.model";
import { ConfigurationService } from "../../../../core/common/configuration.service";
import { SharedService } from "../../../../core/services/shared.service";
import { BuffAndEffectService } from "../../../../core/services/buff-and-effect.service";
import { CommonService } from "../../../../core/services/shared/common.service";
import { RulesetService } from "../../../../core/services/ruleset.service";
import { LocalStoreManager } from "../../../../core/common/local-store-manager.service";
import { AuthService } from "../../../../core/auth/auth.service";
import { User } from "../../../../core/models/user.model";
import { HeaderValues } from "../../../../core/models/headers.model";
import { CharactersService } from "../../../../core/services/characters.service";
import { Characters } from "../../../../core/models/view-models/characters.model";
import { CastComponent } from "../../../../shared/cast/cast.component";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { ServiceUtil } from "../../../../core/services/service-util";
import { AppService1 } from "../../../../app.service";



@Component({
  selector: 'app-combat-pc-buff-and-effect-detail',
  templateUrl: './combat-pc-buff-and-effect-detail.component.html',
  styleUrls: ['./combat-pc-buff-and-effect-detail.component.scss']
})

export class CombatPC_BERulesetDetailsComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  isDropdownOpen: boolean = false;
  actionText: string;
  buffAndEffectId: number;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  buffAndEffectDetail: any = new BuffAndEffect();
  IsGm: boolean = false;
  headers: HeaderValues = new HeaderValues();
  characterId: number = 0;
  pauseBuffAndEffectCreate: boolean = false;
  pageRefresh: boolean;
  character: Characters = new Characters();
  isAlreadyAssigned: boolean = false;
  IsComingFromCombatTracker_GM: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
    private buffAndEffectService: BuffAndEffectService, private rulesetService: RulesetService, private charactersService: CharactersService,
    private location: PlatformLocation, private appService: AppService1) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.buffAndEffectId = params['id']; });
    this.sharedService.shouldUpdateBuffAndEffectList().subscribe(sharedServiceJson => {
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
  }

  private initialize() {
    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
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
      
      this.charactersService.getCharactersById<any>(this.characterId)
        .subscribe(data => {
          this.character = data;
          this.setHeaderValues(data);

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

      this.buffAndEffectService.getBuffAndEffectById<any>(this.buffAndEffectId)
        .subscribe(data => {
          if (data)
            this.buffAndEffectDetail = this.buffAndEffectService.BuffAndEffectsModelData(data, "UPDATE");
          if (!this.buffAndEffectDetail.ruleset) {
            this.buffAndEffectDetail.ruleset = data.ruleSet;
          }
          this.isAlreadyAssigned = data.isAssignedToAnyCharacter;
          debugger
          this.ruleSetId = this.buffAndEffectDetail.ruleSetId;
          this.rulesetService.GetCopiedRulesetID(this.buffAndEffectDetail.ruleSetId, user.id).subscribe(data => {
            let id: any = data
            //this.ruleSetId = id;
            this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
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

      //this.buffAndEffectService.getCharacterBuffAndEffectById<any>(this.buffAndEffectId)
      //  .subscribe(data => {
      //    debugger
      //    if (data)
      //      this.buffAndEffectDetail = this.buffAndEffectService.BuffAndEffectsModelData(data, "UPDATE");
      //    if (!this.buffAndEffectDetail.ruleset) {
      //      this.buffAndEffectDetail.ruleset = data.ruleSet;
      //    }
      //    this.character = data.character;
      //    if (this.character) {
      //      if (this.character.characterId) {
      //        this.isAlreadyAssigned = true;
      //      }
      //    }
          
      //    this.ruleSetId = this.buffAndEffectDetail.ruleSetId;
      //    this.rulesetService.GetCopiedRulesetID(this.buffAndEffectDetail.ruleSetId, user.id).subscribe(data => {
      //      let id: any = data
      //      //this.ruleSetId = id;
      //      this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
      //      this.isLoading = false;
      //    }, error => {
      //      this.isLoading = false;
      //      let Errors = Utilities.ErrorDetail("", error);
      //      if (Errors.sessionExpire) {
      //        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
      //        this.authService.logout(true);
      //      }
      //    }, () => { });

      //  }, error => {
      //    this.isLoading = false;
      //    let Errors = Utilities.ErrorDetail("", error);
      //    if (Errors.sessionExpire) {
      //      //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
      //      this.authService.logout(true);
      //    }
      //  }, () => { });
    }
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
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

  editBuffAndEffect(buffAndEffect: BuffAndEffect) {
    this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Buff & Effect';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.buffAndEffectVM = buffAndEffect;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.event.subscribe(data => {
      this.buffAndEffectId = data.buffAndEffectId;
      this.initialize();
    });
  }

  duplicateBuffAndEffect(buffAndEffect: BuffAndEffect) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.buffAndEffectService.getBuffAndEffectsCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Buff & Effect';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.fromDetail = true;
          this.bsModalRef.content.buffAndEffectVM = buffAndEffect;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef.content.characterID = this.characterId;
          this.bsModalRef.content.IsFromCharacter = true;

        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  

  deleteBuffAndEffect(buffAndEffect: BuffAndEffect, skipPopup = false) {
    if (!skipPopup) {
      let message = "Are you sure you want to delete this " + buffAndEffect.name
        + " Buff & Effect?";

      this.alertService.showDialog(message,
        DialogType.confirm, () => this.deleteBuffAndEffectHelper(buffAndEffect), null, 'Yes', 'No');
    }
    else {
      this.deleteBuffAndEffectHelper(buffAndEffect)
    }
    
  }

  private deleteBuffAndEffectHelper(buffAndEffect: BuffAndEffect) {
    buffAndEffect.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Buff & Effect");

    let characters: Characters[] = [];
    characters.push(new Characters(this.characterId))
    let buffsToDelete : BuffAndEffect[] = [];
    buffsToDelete.push(new BuffAndEffect(this.buffAndEffectDetail.buffAndEffectId))

    this.buffAndEffectService.assignBuffAndEffectToCharacter<any>([], [], [], buffsToDelete, this.characterId)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showMessage("Buff & Effect has been deleted successfully.", "", MessageSeverity.success);
        //this.router.navigate(['/character/dashboard', this.characterId]);
        this.isAlreadyAssigned = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });


   
  }  

  

  useBuffAndEffect(buffAndEffect: any) {
    if (this.buffAndEffectDetail.buffAndEffectCommandVM.length) {
      this.bsModalRef = this.modalService.show(CastComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });

      this.bsModalRef.content.title = "Buffs & Effects Commands"
      this.bsModalRef.content.ListCommands = this.buffAndEffectDetail.buffAndEffectCommandVM
      this.bsModalRef.content.Command = this.buffAndEffectDetail
      debugger
      this.bsModalRef.content.Character = this.character
    } else {
      this.useCommand(this.buffAndEffectDetail, buffAndEffect.characterAbilityId)
    }
  }
  useCommand(Command: any, buffAndEffectId: string = '') {
    let msg = "The command value for " + Command.name
      + " has not been provided. Edit this record to input one.";
    if (Command.command == undefined || Command.command == null || Command.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
    }
    else {
      //TODO
      this.useCommandHelper(Command, buffAndEffectId);
    }
  }
  private useCommandHelper(Command: any, buffAndEffectId: string = '') {
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
      this.bsModalRef.content.recordType = 'buffAndEffect';
      this.bsModalRef.content.recordId = buffAndEffectId;
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
  }

  RedirectBack() {
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.ruleSetId]);
    }   
    else {
      window.history.back();
    }
    
  }
  Redirect(path) {
    this.router.navigate([path, this.ruleSetId]);
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
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId(this.characterId)
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
            if (data.isPlayerCharacter || data.isCurrentCampaignPlayerCharacter) {              
              //this.pauseBuffAndEffectCreate = data.pauseBuffAndEffectCreate;

              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {
              this.pauseBuffAndEffectCreate = data.pauseBuffAndEffectCreate;

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
  refresh() {
    this.initialize();
  }
  Assign(buffAndEffectDetail: BuffAndEffect) {
    debugger
    this.isLoading = true;
    let characters: Characters[] = [];
    characters.push(new Characters(this.character.characterId));
    let nonSelectedBuffAndEffectsList: BuffAndEffect[] = [];
    let selectedBuffAndEffectsList: BuffAndEffect[] = [];
    selectedBuffAndEffectsList.push(new BuffAndEffect(buffAndEffectDetail.buffAndEffectId))
    this.buffAndEffectService.assignBuffAndEffectToCharacter<any>(selectedBuffAndEffectsList, characters, [], [], 0)
      .subscribe(data => {
        this.isLoading = false;
        this.isAlreadyAssigned = true;

      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });
  }

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
  }

  GotoCommand(cmd) {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = cmd;
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
}
