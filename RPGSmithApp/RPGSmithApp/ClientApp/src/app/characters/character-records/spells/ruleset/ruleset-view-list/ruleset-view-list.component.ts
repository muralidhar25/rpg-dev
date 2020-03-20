import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CharacterSpells } from "../../../../../core/models/view-models/character-spells.model";
import { Characters } from "../../../../../core/models/view-models/characters.model";
import { AlertService, MessageSeverity, DialogType } from "../../../../../core/common/alert.service";
import { AuthService } from "../../../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../../../core/common/local-store-manager.service";
import { SharedService } from "../../../../../core/services/shared.service";
import { SpellsService } from "../../../../../core/services/spells.service";
import { PageLastViewsService } from "../../../../../core/services/pagelast-view.service";
import { CharacterSpellService } from "../../../../../core/services/character-spells.service";
import { DBkeys } from "../../../../../core/common/db-keys";
import { User } from "../../../../../core/models/user.model";
import { Utilities } from "../../../../../core/common/utilities";
import { CastComponent } from "../../../../../shared/cast/cast.component";
import { Spell } from "../../../../../core/models/view-models/spell.model";
import { DiceRollComponent } from "../../../../../shared/dice/dice-roll/dice-roll.component";
import { CreateSpellsComponent } from "../../../../../shared/create-spells/create-spells.component";
import { AppService1 } from "../../../../../app.service";
import { CharactersService } from "../../../../../core/services/characters.service";
import { ServiceUtil } from "../../../../../core/services/service-util";

@Component({
  selector: 'app-ruleset-view-list',
  templateUrl: './ruleset-view-list.component.html',
  styleUrls: ['./ruleset-view-list.component.scss']
})
export class SpellRulesetViewListComponent implements OnInit {
  rulesetModel: any;
  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  isDropdownOpen: boolean = false;
  bsModalRef: BsModalRef;
  ruleSetId: number;
  spellsList: any;
  pageLastView: any;
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;
  charNav: any = {};

  page: number = 1;
  pageSize: number = 56;
  offset = (this.page - 1) * this.pageSize;
  characterSpellModal: any = new CharacterSpells();
  character: any = new Characters();
  IsAddingRecord: boolean = false;
  pageRefresh: boolean;
  pauseSpellAdd: boolean;
  pauseSpellCreate: boolean;
  showManage: boolean = false;
  searchText: string;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private spellsService: SpellsService,
    private pageLastViewsService: PageLastViewsService, private characterSpellService: CharacterSpellService,
    public appService: AppService1, private charactersService: CharactersService
  ) {
    this.sharedService.shouldUpdateSpellList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        this.page = 1;
        this.pageSize = 28;
        this.initialize();
      }
    });
    this.appService.shouldUpdateFilterSearchRecords().subscribe(filterBy => {
      this.searchText = filterBy;
    });
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
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

  ngOnInit() {
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
    this.setRulesetId(this.ruleSetId);
    this.destroyModalOnInit();
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
      this.gameStatus(this.character.characterId);

      this.spellsService.getspellsByRuleset_spWithPagination_Cache<any>(this.ruleSetId, this.page, this.pageSize)
        .subscribe(data => {

          this.spellsList = Utilities.responseData(data.Spells, this.pageSize);
          this.rulesetModel = data.RuleSet;
          this.spellsList.forEach(function (val) { val.showIcon = false; });

          if (data.ViewType) {
            if (data.ViewType.viewType == 'List') {
              this.isListView = true;
              this.isDenseView = false;
            }
            else if (data.ViewType.viewType == 'Dense') {
              this.isDenseView = true;
              this.isListView = false;
            }
            else {
              this.isListView = false;
              this.isDenseView = false;
            }
          }

          try {
            this.noRecordFound = !data.Spells.length;
          } catch (err) { }
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {
          setTimeout(() => {
            if (window.innerHeight > document.body.clientHeight) {
              this.onScroll(false);
            }
          }, 10)
        });

      ////this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetSpells')
      ////  .subscribe(data => {
      ////    // if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      ////    if (data !== null) {
      ////      if (data.viewType == 'List') {
      ////        this.isListView = true;
      ////        this.isDenseView = false;
      ////      }
      ////      else if (data.viewType == 'Dense') {
      ////        this.isDenseView = true;
      ////        this.isListView = false;
      ////      }
      ////      else {
      ////        this.isListView = false;
      ////        this.isDenseView = false;
      ////      }
      ////    }
      ////  }, error => {
      ////    let Errors = Utilities.ErrorDetail("", error);
      ////    if (Errors.sessionExpire) {
      ////      this.authService.logout(true);
      ////    }
      ////  });
    }
    ///*To get ruleset*/
    //this.rulesetService.getRulesetById<Ruleset>(this.ruleSetId)
    //    .subscribe(data => {
    //        this.rulesetModel = data;
    //    }, error => { }, () => { });
  }

  onScroll(isAutoScroll: boolean = true) {

    ++this.page;
    if (isAutoScroll) {
      this.scrollLoading = true;
    }

    this.spellsService.getspellsByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {

        var _spells = data.Spells;
        for (var i = 0; i < _spells.length; i++) {
          _spells[i].showIcon = false;
          this.spellsList.push(_spells[i]);
        }
        this.scrollLoading = false;
      }, error => {
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });

    //this.charactersCharacterStatService.getCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)

  }

  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  showListView(view: boolean) {
    this.isListView = view;
    this.isDenseView = false;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'RulesetSpells',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.spellsService.createPageLastViews<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }

  showDenseview(view: boolean) {
    this.isListView = false;
    this.isDenseView = view;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'RulesetSpells',
      viewType: 'Dense',
      UserId: user.id
    }

    this.spellsService.createPageLastViews<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isDenseView = data.viewType == 'Dense' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
    setTimeout(() => {
      if (window.innerHeight > document.body.clientHeight) {
        this.onScroll(false);
      }
    }, 10)
  }

  manageIcon(id: number) {
    this.spellsList.forEach(function (val) {
      if (id === val.spellId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }



  castSpell(spell: any) {
    this.bsModalRef = this.modalService.show(CastComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Spell Cast"

    // let msg = "The command value for " + spell.name
    //     + " Spell has not been provided. Edit this record to input one.";

    // if (spell.spellCommand == undefined || spell.spellCommand == null) {
    //     this.alertService.showDialog(msg, DialogType.alert, () => this.castSpellHelper(spell));
    // }
    // else if (spell.spellCommand.length == 0) {
    //     this.alertService.showDialog(msg, DialogType.alert, () => this.castSpellHelper(spell));
    // }
    // else {
    //     //TODO
    //     this.castSpellHelper(spell);
    // }
  }

  private castSpellHelper(spell: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Cast Spell");
    setTimeout(() => {
      this.isLoading = false;
      this.alertService.stopLoadingMessage();
    }, 200);
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  }
  AddSpell(spell: Spell) {
    this.IsAddingRecord = true;

    this.alertService.startLoadingMessage("", "Adding spell to character");
    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (char) {
      if (char.headerId) {
        this.characterSpellModal.multiSpells = [];
        this.characterSpellModal.multiSpells.push({ spellId: spell.spellId });
        this.characterSpellModal.characterId = char.headerId;
        this.characterSpellModal.spellId = spell.spellId;
        this.characterSpellModal.isMemorized = false;

        this.characterSpellService.createCharacterSpell(this.characterSpellModal)
          .subscribe(
            data => {
              this.IsAddingRecord = false;
              this.alertService.stopLoadingMessage();
              let message = "This spell has been added to your character.";
              this.alertService.showMessage(message, "", MessageSeverity.success);
              //this.sharedService.UpdateCharacterSpellList(true);
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
            },
          );
      }
    }
  }
  back() {
    this.router.navigate(['/character/spell', this.character.characterId]);
    // window.history.back();
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

  editSpell(spell: Spell) {
    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Spell';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.spellVM = spell;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
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
    //            this.spellsList = this.spellsList.filter((val) => val.spellId != spell.spellId);
    //            try {
    //                this.noRecordFound = !this.spellsList.length;
    //            } catch (err) { }
    //            //this.initialize();
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
          this.spellsList = this.spellsList.filter((val) => val.spellId != spell.spellId);
          try {
            this.noRecordFound = !this.spellsList.length;
          } catch (err) { }
          //this.initialize();
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
    this.page = 1;
    this.pageSize = 28;
    this.initialize();
  }
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId(characterId)
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
              //this.pauseSpellAdd = data.pauseSpellAdd;
              //this.pauseSpellCreate = data.pauseSpellCreate;
              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {
                //this.showManage = false;
                this.pauseSpellAdd = data.pauseSpellAdd;
                this.pauseSpellCreate = data.pauseSpellCreate;
                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }
              }

            } else {
              this.showManage = true;
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

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
  }

}
