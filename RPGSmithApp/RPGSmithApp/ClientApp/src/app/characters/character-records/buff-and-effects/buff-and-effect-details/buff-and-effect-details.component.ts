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



@Component({
  selector: 'app-buff-and-effect-details',
  templateUrl: './buff-and-effect-details.component.html',
  styleUrls: ['./buff-and-effect-details.component.scss']
})

export class CharBuffAndEffectDetailsComponent implements OnInit {

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
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
    private buffAndEffectService: BuffAndEffectService, private rulesetService: RulesetService, private charactersService: CharactersService,
    private location: PlatformLocation) {
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
      this.buffAndEffectService.getCharacterBuffAndEffectById<any>(this.buffAndEffectId)
        .subscribe(data => {

          if (data)
            this.buffAndEffectDetail = this.buffAndEffectService.BuffAndEffectsModelData(data, "UPDATE");
          if (!this.buffAndEffectDetail.ruleset) {
            this.buffAndEffectDetail.ruleset = data.ruleSet;
          }

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
    }
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
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

  

  deleteBuffAndEffect(buffAndEffect: BuffAndEffect) {
    let message = "Are you sure you want to delete this " + buffAndEffect.name
      + " Buff & Effect?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteBuffAndEffectHelper(buffAndEffect), null, 'Yes', 'No');
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
        this.router.navigate(['/character/dashboard', this.characterId]);
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

    let msg = "The command value for " + buffAndEffect.name
      + " Buff & Effect has not been provided. Edit this record to input one.";

    if (buffAndEffect.buffAndEffectCommand == undefined || buffAndEffect.buffAndEffectCommand == null) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useBuffAndEffectHelper(buffAndEffect));
    }
    else if (buffAndEffect.buffAndEffectCommand.length == 0) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useBuffAndEffectHelper(buffAndEffect));
    }
    else {
      //TODO
      this.useBuffAndEffectHelper(buffAndEffect);
    }
  }

  private useBuffAndEffectHelper(buffAndEffect: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Use Buff & Effect");
    //TODO- PENDING ACTION
    setTimeout(() => {
      this.isLoading = false;
      this.alertService.stopLoadingMessage();
    }, 200);
  }

  RedirectBack() {
    window.history.back();
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
              this.pauseBuffAndEffectCreate = data.pauseBuffAndEffectCreate;


              if (data.pauseGame) {
                this.router.navigate(['/characters']);
                this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
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
}
