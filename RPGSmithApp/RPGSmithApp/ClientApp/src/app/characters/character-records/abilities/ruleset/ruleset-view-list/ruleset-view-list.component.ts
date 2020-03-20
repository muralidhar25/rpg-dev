import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CharacterAbilities } from "../../../../../core/models/view-models/character-abilities.model";
import { Characters } from "../../../../../core/models/view-models/characters.model";
import { SharedService } from "../../../../../core/services/shared.service";
import { AbilityService } from "../../../../../core/services/ability.service";
import { AlertService, DialogType, MessageSeverity } from "../../../../../core/common/alert.service";
import { AuthService } from "../../../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../../../core/common/local-store-manager.service";
import { PageLastViewsService } from "../../../../../core/services/pagelast-view.service";
import { CharacterAbilityService } from "../../../../../core/services/character-abilities.service";
import { DBkeys } from "../../../../../core/common/db-keys";
import { User } from "../../../../../core/models/user.model";
import { Utilities } from "../../../../../core/common/utilities";
import { Ability } from "../../../../../core/models/view-models/ability.model";
import { DiceRollComponent } from "../../../../../shared/dice/dice-roll/dice-roll.component";
import { CreateAbilitiesComponent } from "../../../../../shared/create-abilities/create-abilities.component";
import { AppService1 } from "../../../../../app.service";
import { CharactersService } from "../../../../../core/services/characters.service";
import { ServiceUtil } from "../../../../../core/services/service-util";

@Component({
  selector: 'app-ruleset-view-list',
  templateUrl: './ruleset-view-list.component.html',
  styleUrls: ['./ruleset-view-list.component.scss']
})
export class AbilityRulesetViewListComponent implements OnInit {

  rulesetModel: any;
  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
  ruleSetId: number;
  abilityId: number;
  abilitiesList: any;
  pageLastView: any;
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;
  page: number = 1;
  pageSize: number = 56;
  offset = (this.page - 1) * this.pageSize;
  characterAbilityModal: any = new CharacterAbilities();
  character: any = new Characters();
  IsAddingRecord: boolean = false;
  charNav: any = {};
  pageRefresh: boolean;
  pauseAbilityAdd: boolean;
  pauseAbilityCreate: boolean;
  showManage: boolean = false;
  searchText: string;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private pageLastViewsService: PageLastViewsService,
    private abilityService: AbilityService, private characterAbilityService: CharacterAbilityService,
    public appService: AppService1, private charactersService: CharactersService) {
    //this.route.params.subscribe(params => { this.abilityId = params['id']; });
    this.sharedService.shouldUpdateAbilityList().subscribe(sharedServiceJson => {
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
      this.abilityService.getAbilityByRuleset_spWithPagination_Cache<any>(this.ruleSetId, this.page, this.pageSize)
        .subscribe(data => {

          this.abilitiesList = Utilities.responseData(data.Abilities, this.pageSize);
          this.rulesetModel = data.RuleSet;

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

          this.abilitiesList.forEach(function (val) { val.showIcon = false; });
          try {
            this.noRecordFound = !data.Abilities.length;
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

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetAbilities')
      //  .subscribe(data => {
      //    // if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      //    if (data !== null) {
      //      if (data.viewType == 'List') {
      //        this.isListView = true;
      //        this.isDenseView = false;
      //      }
      //      else if (data.viewType == 'Dense') {
      //        this.isDenseView = true;
      //        this.isListView = false;
      //      }
      //      else {
      //        this.isListView = false;
      //        this.isDenseView = false;
      //      }
      //    }
      //  }, error => {
      //    let Errors = Utilities.ErrorDetail("", error);
      //    if (Errors.sessionExpire) {
      //      this.authService.logout(true);
      //    }
      //  });
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
    //this.isLoading = true;
    this.abilityService.getAbilityByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {

        var _abilities = data.Abilities;
        for (var i = 0; i < _abilities.length; i++) {
          _abilities[i].showIcon = false;
          this.abilitiesList.push(_abilities[i]);
        }
        //this.isLoading = false;
        this.scrollLoading = false;
      }, error => {
        this.isLoading = false;
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });


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
      pageName: 'RulesetAbilities',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.abilityService.createPageLastViews<any>(this.pageLastView)
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
      pageName: 'RulesetAbilities',
      viewType: 'Dense',
      UserId: user.id
    }

    this.abilityService.createPageLastViews<any>(this.pageLastView)
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
    this.abilitiesList.forEach(function (val) {
      if (id === val.abilityId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  useAbility(ability: any) {

    let msg = "The command value for " + ability.name
      + " Ability has not been provided. Edit this record to input one.";

    if (ability.abilityCommand == undefined || ability.abilityCommand == null) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useAbilityHelper(ability));
    }
    else if (ability.abilityCommand.length == 0) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useAbilityHelper(ability));
    }
    else {
      //TODO
      this.useAbilityHelper(ability);
    }
  }

  private useAbilityHelper(ability: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Use Ability");
    //TODO- PENDING ACTION
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
  back() {
    this.router.navigate(['/character/ability', this.character.characterId]);
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

  editAbility(ability: Ability) {
    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Ability';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.abilityVM = ability;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
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
    //            this.abilitiesList = this.abilitiesList.filter((val) => val.abilityId != ability.abilityId);
    //            try {
    //                this.noRecordFound = !this.abilitiesList.length;
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
    this.abilityService.deleteAbility_up(ability)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Ability has been deleted successfully.", "", MessageSeverity.success);
          this.abilitiesList = this.abilitiesList.filter((val) => val.abilityId != ability.abilityId);
          try {
            this.noRecordFound = !this.abilitiesList.length;
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
        if (data) {
          let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
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

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
  }

}

