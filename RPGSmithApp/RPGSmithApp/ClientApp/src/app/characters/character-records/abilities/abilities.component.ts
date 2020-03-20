import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Characters } from "../../../core/models/view-models/characters.model";
import { AlertService, MessageSeverity, DialogType } from "../../../core/common/alert.service";
import { AuthService } from "../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { SharedService } from "../../../core/services/shared.service";
import { AbilityService } from "../../../core/services/ability.service";
import { CharacterAbilityService } from "../../../core/services/character-abilities.service";
import { PageLastViewsService } from "../../../core/services/pagelast-view.service";
import { DBkeys } from "../../../core/common/db-keys";
import { User } from "../../../core/models/user.model";
import { Utilities } from "../../../core/common/utilities";
import { AddCharaterAbilityComponent } from "./add-abilities/add-abilities.component";
import { CastComponent } from "../../../shared/cast/cast.component";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { CharactersService } from "../../../core/services/characters.service";
import { CreateAbilitiesComponent } from "../../../shared/create-abilities/create-abilities.component";
import { AppService1 } from "../../../app.service";
import { HeaderValues } from "../../../core/models/headers.model";
import { ServiceUtil } from "../../../core/services/service-util";
import { RemoveAbilitiesComponent } from "./remove-abilities/remove-abilities.component";

@Component({
  selector: 'app-abilities',
  templateUrl: './abilities.component.html',
  styleUrls: ['./abilities.component.scss']
})

export class CharacterAbilitiesComponent implements OnInit {

  isLoading = false;
  isListView: boolean = false;
  showActions: boolean = true;
  isDenseView: boolean = false;
  actionText: string;
  bsModalRef: BsModalRef;
  characterId: number;
  rulesetId: number;
  abilitiesList: any;
  isDropdownOpen: boolean = false;
  pageLastView: any;
  ruleSet: any;
  timeoutHandler: any;
  character: any = new Characters();
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;
  page: number = 1;
  headers: HeaderValues = new HeaderValues();
  pageSize: number = 56;
  abilityFilter: any = {
    type: 1,
    name: 'Alphabetical',
    icon: '',
    viewableCount: 0
  };
  charNav: any = {};
  AlphabeticalCount: number;
  EnableCount: number;
  LevelCount: number;
  Alphabetical: boolean = false;
  Enabled: boolean = false;
  Level: boolean = false;
  pauseAbilityAdd: boolean;
  pauseAbilityCreate: boolean;
  pageRefresh: boolean;
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;
  doesCharacterHasAllies: boolean = false;
  isGM_Only: boolean = false;
  searchText: string;
  initLoad: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private charactersService: CharactersService,
    private sharedService: SharedService, private pageLastViewsService: PageLastViewsService, private abilityService: AbilityService,
    private characterAbilityService: CharacterAbilityService, public appService: AppService1) {

    this.sharedService.shouldUpdateCharacterAbilityList().subscribe(sharedServiceJson => {
      this.route.params.subscribe(params => { this.characterId = params['id']; });
      if (sharedServiceJson) {
        this.initLoad = true;
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
    this.route.params.subscribe(params => { this.characterId = params['id']; });

    this.charactersService.isAllyAssigned(this.characterId).subscribe(data => {
      if (data) {
        this.doesCharacterHasAllies = true;
      }
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      }
    });

    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);

    if (this.rulesetId == undefined)
      this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

    //this.rulesetService.getRulesetById<any>(this.rulesetId)
    //    .subscribe(data => {
    //        this.ruleSet = data;
    //    }, error => {
    //        let Errors = Utilities.ErrorDetail("", error);
    //        if (Errors.sessionExpire) {
    //            this.authService.logout(true);
    //        }
    //    });

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
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    let localStorageFilters = this.localStorage.getDataObject<number>('abilityFilter');
    if (localStorageFilters != null) {
      this.abilityFilter = localStorageFilters;
    }

    if (user == null)
      this.authService.logout();
    else {
      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'character') {
          this.characterId = this.headers.headerId;
        }
      }
      this.getFilters();

      this.isLoading = true;
      this.gameStatus(this.characterId);


      this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp_Cache<any>(this.characterId, this.rulesetId, this.page, this.pageSize, this.abilityFilter.type, this.initLoad)
        .subscribe(data => {
          this.abilitiesList = Utilities.responseData(data.characterAbilityList, this.pageSize);

          if (this.abilityFilter.type == 1) {
            //this.AlphabeticalCount = this.abilitiesList.length;
            this.AlphabeticalCount = data.FilterAplhabetCount;
          }
          if (this.abilityFilter.type == 2) {
            //let result = this.abilitiesList.filter(s => s.isEnabled);
            //this.EnableCount = result.length;
            this.EnableCount = data.FilterEnabledCount;
          }
          if (this.abilityFilter.type == 3) {
            //this.LevelCount = this.abilitiesList.length;
            this.LevelCount = data.FilterLevelCount;
          }
          this.applyFilters(this.abilityFilter.type, true);

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

          this.ruleSet = data.RuleSet;
          this.character = data.Character;
          this.setHeaderValues(this.character);
          try {
            this.abilitiesList.forEach(function (val) {
              val.showIcon = false;
              val.showUse = val.ability.command == null || val.ability.command == undefined || val.ability.command == '' ? false : true;
              val.name = val.ability.name;
            });
          } catch (err) { }
          try {
            this.noRecordFound = !data.characterAbilityList.length;
          } catch (err) { }
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {

          this.onSearch();

          setTimeout(() => {
            if (window.innerHeight > document.body.clientHeight) {
              this.onScroll(false);
            }
          }, 10)
        });

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'CharacterAbilities')
      //  .subscribe(data => {
      //    //if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
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

      //this.charactersService.getCharactersById<any>(this.characterId)
      //    .subscribe(data => {
      //        this.character = data;
      //        this.isLoading = false;
      //        this.setHeaderValues(this.character);
      //    }, error => {
      //        this.character = new Characters();
      //        this.isLoading = false;
      //    }, () => { });
    }
  }

  onScroll(isAutoScroll: boolean = true) {

    ++this.page;
    if (isAutoScroll) {
      this.scrollLoading = true;
    }

    this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, this.abilityFilter.type)
      .subscribe(data => {

        var _characterAbilityList = data.characterAbilityList;
        for (var i = 0; i < _characterAbilityList.length; i++) {
          _characterAbilityList[i].showIcon = false;
          _characterAbilityList[i].name = _characterAbilityList[i].ability.name;
          try {
            _characterAbilityList[i].showUse = _characterAbilityList[i].ability.command == null || _characterAbilityList[i].ability.command == undefined || _characterAbilityList[i].ability.command == '' ? false : true;
          } catch (err) { }
          this.abilitiesList.push(_characterAbilityList[i]);
        }
        this.scrollLoading = false;

        this.applyFilters(this.abilityFilter.type, true);

        if (this.abilityFilter.type == 1) {
          //this.AlphabeticalCount = this.abilitiesList.length;
          this.AlphabeticalCount = data.FilterAplhabetCount;
        }
        if (this.abilityFilter.type == 2) {
          //let result = this.abilitiesList.filter(s => s.isEnabled);
          //this.EnableCount = result.length;
          this.EnableCount = data.FilterEnabledCount;
        }
        if (this.abilityFilter.type == 3) {
          //this.LevelCount = this.abilitiesList.length;
          this.LevelCount = data.FilterLevelCount;
        }
      }, error => {
        this.scrollLoading = false;
        this.isLoading = false;
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
      pageName: 'CharacterAbilities',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.characterAbilityService.createPageLastViews<any>(this.pageLastView)
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
      pageName: 'CharacterAbilities',
      viewType: 'Dense',
      UserId: user.id
    }
    this.characterAbilityService.createPageLastViews<any>(this.pageLastView)
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
      if (id === val.characterAbilityId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  addAbility() {
    this.bsModalRef = this.modalService.show(AddCharaterAbilityComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Ability';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.abilityVM = { characterId: this.characterId };
    this.bsModalRef.content.characterAbilities = this.abilitiesList;
  }

  createAbility() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.abilityService.getAbilitiesCount(this.rulesetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create New Ability';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.rulesetId;
          this.bsModalRef.content.isFromCharacter = true;
          this.bsModalRef.content.isFromCharacterId = +this.characterId;

          this.bsModalRef.content.abilityVM = { ruleSetId: this.rulesetId, ruleSet: this.ruleSet };
          this.bsModalRef.content.rulesetID = this.rulesetId;
          this.bsModalRef.content.isGM_Only = this.isGM_Only;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  editAbility(ability: any) {
    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Character Ability';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.isFromCharacter = true;
    this.bsModalRef.content.isFromCharacterId = +this.characterId;
    this.bsModalRef.content.isFromCharacterAbilityId = ability.characterAbilityId;
    this.bsModalRef.content.isFromCharacterAbilityEnable = ability.isEnabled;
    this.bsModalRef.content.isFromCharacterAbilityCurrent = ability.currentNumberOfUses == null ? 0 : ability.currentNumberOfUses;
    this.bsModalRef.content.isFromCharacterAbilityMax = ability.maxNumberOfUses == null ? 0 : ability.maxNumberOfUses;
    this.bsModalRef.content.abilityVM = ability.ability;
    this.bsModalRef.content.rulesetID = this.rulesetId;
    this.bsModalRef.content.isGM_Only = this.isGM_Only;
  }

  duplicateAbility(ability: any) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.abilityService.getAbilitiesCount(this.rulesetId)
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
          this.bsModalRef.content.isFromCharacter = true;
          this.bsModalRef.content.isFromCharacterId = +this.characterId;
          this.bsModalRef.content.isFromCharacterAbilityId = ability.characterAbilityId;
          this.bsModalRef.content.isFromCharacterAbilityCurrent = ability.currentNumberOfUses == null ? 0 : ability.currentNumberOfUses;
          this.bsModalRef.content.isFromCharacterAbilityMax = ability.maxNumberOfUses == null ? 0 : ability.maxNumberOfUses;
          this.bsModalRef.content.abilityVM = ability.ability;
          this.bsModalRef.content.isGM_Only = this.isGM_Only;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteAbility(ability: any) {
    let name = ability ? (ability.ability ? ability.ability.name : 'spell') : 'spell';
    this.alertService.showDialog('Are you sure you want to remove ' + name + ' from this Character?',
      DialogType.confirm, () => this.deleteAbilityHelper(ability), null, 'Yes', 'No');
  }

  private deleteAbilityHelper(ability: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Ability");

    this.characterAbilityService.deleteCharacterAbility_up(ability.characterAbilityId, this.rulesetId)
      .subscribe(
        data => {
          if (ability.isEnabled) {
            this.EnableCount = this.EnableCount - 1;
          }
          this.AlphabeticalCount = this.AlphabeticalCount - 1;
          this.LevelCount = this.LevelCount - 1;
          this.ImplementFilter();
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Character Ability has been removed successfully.", "", MessageSeverity.success);
          this.abilitiesList = this.abilitiesList.filter((val) => val.characterAbilityId != ability.characterAbilityId);
          try {
            this.noRecordFound = !this.abilitiesList.length;
          } catch (err) { }
          //this.initialize();
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to Remove", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  enableAbility(ability: any) {
    this.EnableCount = ability.isEnabled ? this.EnableCount - 1 : this.EnableCount + 1;
    //this.isLoading = true;
    let enableTxt = ability.isEnabled ? 'Disable' : 'Enable';
    this.characterAbilityService.toggleEnableCharacterAbility(ability.characterAbilityId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          ability.isEnabled = ability.isEnabled ? false : true;
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

    if (ability.abilityId) {
      this.abilityService.getAbilityCommands_sp<any>(ability.abilityId, 0)
        .subscribe(data => {
          if (data.length > 0) {
            this.bsModalRef = this.modalService.show(CastComponent, {
              class: 'modal-primary modal-md',
              ignoreBackdropClick: true,
              keyboard: false
            });

            this.bsModalRef.content.title = "Ability Commands";
            this.bsModalRef.content.ListCommands = data;
            this.bsModalRef.content.AbilityId = ability.abilityId;
            this.bsModalRef.content.Command = ability.ability;
            this.bsModalRef.content.Character = this.character;
            this.bsModalRef.content.recordType = 'ability';
            this.bsModalRef.content.recordId = ability.characterAbilityId;
          } else {
            this.useCommand(ability.ability, ability.characterAbilityId)
          }
        }, error => { }, () => { });
    }

    //if (ability.ability.abilityCommand.length) {
    //    this.bsModalRef = this.modalService.show(CastComponent, {
    //        class: 'modal-primary modal-md',
    //        ignoreBackdropClick: true,
    //        keyboard: false
    //    });

    //    this.bsModalRef.content.title = "Ability Commands";
    //    //this.bsModalRef.content.ListCommands = ability.ability.abilityCommand; 
    //    this.bsModalRef.content.AbilityId = ability.abilityId; 
    //    this.bsModalRef.content.Command = ability.ability;
    //    this.bsModalRef.content.Character = this.character;
    //} else {
    //    this.useCommand(ability.ability)
    //}
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

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.recordName = this.character.characterName;
    this.bsModalRef.content.recordImage = this.character.imageUrl;
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

    //let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (!icharNav) {
      this.charNav = {
        'items': '/character/inventory/' + character.characterId,
        'spells': '/character/spell/' + character.characterId,
        'abilities': '/character/ability/' + character.characterId
      };
    }
    else {
      if (!icharNav[character.characterId]) {
        this.charNav = {
          'items': '/character/inventory/' + character.characterId,
          'spells': '/character/spell/' + character.characterId,
          'abilities': '/character/ability/' + character.characterId
        };
      } else {
        this.charNav = icharNav[character.characterId];
      }
    }
  }

  applyFilters(present_filter, apply_same = false, IsCalledFromClickFunction = false) {
    //if (apply_same) {
    //  this.abilityFilter.type = present_filter;
    //} else {
    //  if (present_filter == 3) {
    //    this.abilityFilter.type = 1;
    //  }
    //  else {
    //    this.abilityFilter.type = present_filter + 1;
    //  }
    //}

    if (present_filter == 1) {
      this.Alphabetical = true;
      this.Enabled = false;
      this.Level = false;

    }
    else if (present_filter == 2) {
      this.Alphabetical = false;
      this.Enabled = true;
      this.Level = false;
    }
    else {
      this.Alphabetical = false;
      this.Enabled = false;
      this.Level = true;
    }



    this.abilityFilter.type = present_filter;

    if (IsCalledFromClickFunction) {
      this.isLoading = true;
      this.page = 1
      this.pageSize = 28;

      this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, this.abilityFilter.type)
        .subscribe(data => {
          this.abilitiesList = Utilities.responseData(data.characterAbilityList, this.pageSize);

          try {
            this.abilitiesList.forEach(function (val) {
              val.showIcon = false;
              val.showUse = val.ability.command == null || val.ability.command == undefined || val.ability.command == '' ? false : true;
              val.name = val.ability.name;
            });
          } catch (err) { }
          try {
            this.noRecordFound = !data.characterAbilityList.length;
          } catch (err) { }


          this.ImplementFilter();
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });

    }
    else {
      this.ImplementFilter();
    }



  }

  //private scrollToTop() {
  //  jQuery('html, body').animate({ scrollTop: 0 }, 500);
  //}

  public clickAndHold(record: any) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  public editRecord(record: any) {
    this.timeoutHandler = setInterval(() => {
      this.editAbility(record);
    }, 1000);
  }
  ImplementFilter() {
    //this.abilityFilter.viewableCount = this.abilitiesList.length;
    this.abilityFilter.viewableCount = this.AlphabeticalCount;

    switch (this.abilityFilter.type) {
      case 1: // Alphabetical
      default:
        //this.abilitiesList.sort(function (a, b) {
        //  if (a["ability"]["name"] == b["ability"]["name"]) {
        //    return 0;
        //  }
        //  return (a["ability"]["name"] < b["ability"]["name"]) ? -1 : 1;
        //});

        this.abilityFilter.name = 'Alphabetical';
        this.abilityFilter.icon = '';
        break;
      case 2: // Enabled
        //this.abilitiesList.sort(function (a, b) {
        //  if (a["isEnabled"] == b["isEnabled"]) {
        //    return 0;
        //  }
        //  return (a["isEnabled"] > b["isEnabled"]) ? -1 : 1;
        //});

        this.abilityFilter.viewableCount = this.EnableCount;
        //this.abilityFilter.viewableCount = 0;
        //this.abilitiesList.map((item) => {
        //  if (item.isEnabled) {
        //    this.abilityFilter.viewableCount++;
        //  }
        //});

        this.abilityFilter.name = 'Enabled';
        this.abilityFilter.icon = 'icon-Rec-Enabled';
        break;
      case 3: // Level Sort
        //this.abilitiesList.sort(function ($a, $b) {
        //  var aLevel = 0;
        //  if ($a["ability"]["level"]) {
        //    aLevel = parseInt($a["ability"]["level"]);
        //  }

        //  var bLevel = 0;
        //  if ($b["ability"]["level"]) {
        //    bLevel = parseInt($b["ability"]["level"]);
        //  }

        //  if (aLevel == bLevel) {
        //    return ($a["ability"]["name"] < $b["ability"]["name"]) ? -1 : ($a["ability"]["name"] > $b["ability"]["name"]) ? 1 : 0;
        //  }
        //  else {
        //    return (aLevel > bLevel) ? -1 : 1;
        //  }
        //});
        this.abilityFilter.viewableCount = this.LevelCount;
        this.abilityFilter.name = 'Level';
        this.abilityFilter.icon = '';
        break;
    }

    this.localStorage.saveSyncedSessionData(this.abilityFilter, 'abilityFilter');
  }

  getFilters() {
    if (this.abilityFilter.type == 2 || this.abilityFilter.type == 3) {
      this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, 1)
        .subscribe(data => {
          //this.AlphabeticalCount = data.characterAbilityList.length;
          this.AlphabeticalCount = data.FilterAplhabetCount;
        }, error => {
        }, () => { });
    }
    if (this.abilityFilter.type == 1 || this.abilityFilter.type == 3) {
      this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, 2)
        .subscribe(data => {
          //let result = data.characterAbilityList.filter(s => s.isEnabled);
          //this.EnableCount = result.length;
          this.EnableCount = data.FilterEnabledCount;
        }, error => {
        }, () => { });
    }
    if (this.abilityFilter.type == 1 || this.abilityFilter.type == 2) {
      this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, 3)
        .subscribe(data => {
          //this.LevelCount = data.characterAbilityList.length;
          this.LevelCount = data.FilterLevelCount;
        }, error => {
        }, () => { });
    }
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
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user == null) {
            this.authService.logout();
          }
          else {
            if (data.isPlayerCharacter && data.isPlayerLinkedToCurrentCampaign) {
              this.isGM_Only = true;
            }
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
  RedirectBack() {
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.rulesetId]);
    }
    else if (this.IsComingFromCombatTracker_PC) {
      this.router.navigate(['/character/combatplayer', + this.characterId]);
    }
    else {
      this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");
      this.router.navigate(['/character/dashboard', this.characterId]);
    }
    //window.history.back();
  }

  RemoveAbility() {
    this.bsModalRef = this.modalService.show(RemoveAbilitiesComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.rulesetId;
    this.bsModalRef.content.characterId = this.characterId;
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

  onSearch() {

    ++this.page;

    this.characterAbilityService.getCharacterAbilitiesByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, this.abilityFilter.type)
      .subscribe(data => {
        let count = 0;
        var _characterAbilityList = data.characterAbilityList;
        for (var i = 0; i < _characterAbilityList.length; i++) {
          _characterAbilityList[i].showIcon = false;
          _characterAbilityList[i].name = _characterAbilityList[i].ability.name;
          try {
            _characterAbilityList[i].showUse = _characterAbilityList[i].ability.command == null || _characterAbilityList[i].ability.command == undefined || _characterAbilityList[i].ability.command == '' ? false : true;
          } catch (err) { }
          this.abilitiesList.push(_characterAbilityList[i]);

          count += 1;
          if (count == _characterAbilityList.length - 1) {
            this.onSearch();
          }

        }

        this.applyFilters(this.abilityFilter.type, true);

        if (this.abilityFilter.type == 1) {
          this.AlphabeticalCount = data.FilterAplhabetCount;
        }
        if (this.abilityFilter.type == 2) {
          this.EnableCount = data.FilterEnabledCount;
        }
        if (this.abilityFilter.type == 3) {
          this.LevelCount = data.FilterLevelCount;
        }
      }, error => { });

  }

}
