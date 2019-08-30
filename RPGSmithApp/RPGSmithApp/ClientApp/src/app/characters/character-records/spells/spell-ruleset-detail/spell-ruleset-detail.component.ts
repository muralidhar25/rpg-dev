import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Spell } from "../../../../core/models/view-models/spell.model";
import { Characters } from "../../../../core/models/view-models/characters.model";
import { AuthService } from "../../../../core/auth/auth.service";
import { AlertService, MessageSeverity, DialogType } from "../../../../core/common/alert.service";
import { ConfigurationService } from "../../../../core/common/configuration.service";
import { SharedService } from "../../../../core/services/shared.service";
import { SpellsService } from "../../../../core/services/spells.service";
import { RulesetService } from "../../../../core/services/ruleset.service";
import { CommonService } from "../../../../core/services/shared/common.service";
import { LocalStoreManager } from "../../../../core/common/local-store-manager.service";
import { CharactersService } from "../../../../core/services/characters.service";
import { User } from "../../../../core/models/user.model";
import { DBkeys } from "../../../../core/common/db-keys";
import { Utilities } from "../../../../core/common/utilities";
import { CastComponent } from "../../../../shared/cast/cast.component";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { CreateSpellsComponent } from "../../../../shared/create-spells/create-spells.component";
import { ServiceUtil } from "../../../../core/services/service-util";

@Component({
  selector: 'app-spell-ruleset-detail',
  templateUrl: './spell-ruleset-detail.component.html',
  styleUrls: ['./spell-ruleset-detail.component.scss']
})

export class SpellRulesetDetailComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  actionText: string;
  spellId: number;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  spellDetail: any = new Spell();
  character: Characters = new Characters();
  charNav: any = {};
  pauseSpellAdd: boolean;
  pauseSpellCreate: boolean;
  pageRefresh: boolean;
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
    private spellsService: SpellsService, private rulesetService: RulesetService, private charactersService: CharactersService,
  ) {
    this.route.params.subscribe(params => { this.spellId = params['id']; });
    this.sharedService.shouldUpdateSpellList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
    } catch (err) { }
  }

  ngOnInit() {
    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);

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
      this.spellsService.getspellsById<any[]>(this.spellId)
        .subscribe(data => {
          this.spellDetail = this.spellsService.spellModelData(data, "UPDATE");
          //this.spellDetail.forEach(function (val) { val.showIcon = false; });
          this.rulesetService.GetCopiedRulesetID(this.spellDetail.ruleSetId, user.id).subscribe(data => {
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

  editSpell(spell: Spell) {
    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Spell';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.spellVM = spell;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.event.subscribe(data => {
      this.spellId = data.spellId;
      this.initialize();
    });
  }

  duplicateSpell(spell: Spell) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.spellsService.getspellsCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 3000) {
          this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Spell';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.fromDetail = true;
          this.bsModalRef.content.spellVM = spell;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteSpell(spell: Spell) {
    let message = "Are you sure you want to delete this " + spell.name
      + " Spell? This will also remove the Spell from any character(s) / item(s) that may be associated with it.";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteSpellHelper(spell), null, 'Yes', 'No');
  }

  private deleteSpellHelper(spell: Spell) {
    spell.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Spell");

    //this.spellsService.deleteSpell(spell.spellId)
    //    .subscribe(
    //        data => {
    //            this.isLoading = false; 
    //            this.alertService.stopLoadingMessage();
    //            this.alertService.showMessage("Spell has been deleted successfully.", "", MessageSeverity.success);
    //            //this.initialize();
    //            this.router.navigate(['/ruleset/spell', this.ruleSetId]);
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
    this.spellsService.deleteSpell_up(spell)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Spell has been deleted successfully.", "", MessageSeverity.success);
          //this.initialize();
          this.router.navigate(['/ruleset/spell', this.ruleSetId]);
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


  memorizeSpell(spell: Spell) {
    //this.isLoading = true;
    let memorizeTxt = spell.memorized ? 'Unmemorize' : 'Memorize';
    this.spellsService.memorizedSpell(spell.spellId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.spellDetail.memorized = spell.memorized ? false : true;
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + memorizeTxt, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  //castSpell(spell: any) {
  //    let msg = "The command value for " + spell.name
  //        + " Spell has not been provided. Edit this record to input one.";

  //    if (spell.spellCommand == undefined || spell.spellCommand == null) {
  //        this.alertService.showDialog(msg, DialogType.alert, () => this.castSpellHelper(spell));
  //    }
  //    else if (spell.spellCommand.length == 0) {
  //        this.alertService.showDialog(msg, DialogType.alert, () => this.castSpellHelper(spell));
  //    }
  //    else {
  //        //TODO
  //        this.castSpellHelper(spell);
  //    }

  //}

  //private castSpellHelper(spell: any) {
  //    this.isLoading = true;
  //    this.alertService.startLoadingMessage("", "TODO => Cast Spell");
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
      this.router.navigate(['/character/combatplayer', this.character.characterId]);
    }
    else {
      this.router.navigate(['/character/spell', this.character.characterId]);
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
  castSpell(spell: any) {
    if (this.spellDetail.spellCommandVM.length) {
      this.bsModalRef = this.modalService.show(CastComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = "Spell Cast"
      this.bsModalRef.content.ListCommands = this.spellDetail.spellCommandVM
      this.bsModalRef.content.Command = this.spellDetail
      this.bsModalRef.content.Character = this.character
      this.bsModalRef.content.ButtonText = 'Cast'
    }
    else {
      this.useCommand(this.spellDetail)
    }
  }

  private castSpellHelper(spell: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Executing the default command associated with this " + spell.name + " Spell.");
    setTimeout(() => {
      this.isLoading = false;
      this.alertService.stopLoadingMessage();
    }, 200);
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
    if (Command.hasOwnProperty("spellId")) {
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
              //this.pauseSpellAdd = data.pauseSpellAdd;
              //this.pauseSpellCreate = data.pauseSpellCreate;

              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {
              this.pauseSpellAdd = data.pauseSpellAdd;
              this.pauseSpellCreate = data.pauseSpellCreate;

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
    // TODO get char ID
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
