import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Characters } from "../../../core/models/view-models/characters.model";
import { SharedService } from "../../../core/services/shared.service";
import { SpellsService } from "../../../core/services/spells.service";
import { AlertService, MessageSeverity, DialogType } from "../../../core/common/alert.service";
import { AuthService } from "../../../core/auth/auth.service";
import { CharacterSpellService } from "../../../core/services/character-spells.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { PageLastViewsService } from "../../../core/services/pagelast-view.service";
import { CharactersService } from "../../../core/services/characters.service";
import { DBkeys } from "../../../core/common/db-keys";
import { User } from "../../../core/models/user.model";
import { Utilities } from "../../../core/common/utilities";
import { AddCharacterSpellComponent } from "./add-spells/add-spells.component";
import { CastComponent } from "../../../shared/cast/cast.component";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { CreateSpellsComponent } from "../../../shared/create-spells/create-spells.component";
import { AppService1 } from "../../../app.service";
import { HeaderValues } from "../../../core/models/headers.model";
import { ServiceUtil } from "../../../core/services/service-util";
import { RemoveSpellsComponent } from "./remove-spells/remove-spells.component";

@Component({
  selector: 'app-spells',
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss']
})

export class CharacterSpellsComponent implements OnInit {

  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  characterId: number;
  rulesetId: number;
  spellsList: any;
  isDropdownOpen: boolean = false;
  pageLastView: any;
  character: any = new Characters();
  ruleSet: any;
  timeoutHandler: any;
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;
  headers: HeaderValues = new HeaderValues();
  page: number = 1;
  pageSize: number = 56;
  spellFilter: any = {
    type: 1,
    name: 'Alphabetical',
    icon: '',
    viewableCount: 0
  };
  charNav: any = {};
  LevelCount: number;
  alphabetCount: number;
  ReadiedCount: number;
  Alphabetical: boolean = false;
  Readied: boolean = false;
  Level: boolean = false;
  pauseSpellAdd: boolean;
  pauseSpellCreate: boolean;
  pageRefresh: boolean;
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;
  doesCharacterHasAllies: boolean = false;
  isGM_Only: boolean = false;
  searchText: string;

  initLoad: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private pageLastViewsService: PageLastViewsService,
    private spellsService: SpellsService, private characterSpellService: CharacterSpellService,
    private charactersService: CharactersService, public appService: AppService1) {

    this.sharedService.shouldUpdateCharacterSpellList().subscribe(sharedServiceJson => {
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
    let localStorageFilters = this.localStorage.getDataObject<number>('spellFilter');
    if (localStorageFilters != null) {
      this.spellFilter = localStorageFilters;
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
      this.isLoading = true;
      this.getFilters();

      this.gameStatus(this.characterId);
      this.characterSpellService.getCharacterSpellsByCharacterId_sp_Cache<any>(this.characterId, this.rulesetId, this.page, this.pageSize, this.spellFilter.type, this.initLoad)
        .subscribe(data => {
          this.spellsList = Utilities.responseData(data.CharacterSpellList, this.pageSize);
          if (this.spellFilter.type == 1) {
            //this.alphabetCount = this.spellsList.length;
            this.alphabetCount = data.FilterAplhabetCount;
          }
          if (this.spellFilter.type == 2) {
            //let result = this.spellsList.filter(s => s.isMemorized);
            //this.ReadiedCount = result.length;
            this.ReadiedCount = data.FilterReadiedCount;
          }
          if (this.spellFilter.type == 3) {
            //this.LevelCount = this.spellsList.length;
            this.LevelCount = data.FilterLevelCount;
          }

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

          this.applyFilters(this.spellFilter.type, true);
          this.ruleSet = data.RuleSet;
          this.character = data.Character;
          this.setHeaderValues(this.character);
          try {
            this.spellsList.forEach(function (val) {
              val.showIcon = false;
              val.showCast = val.spell.command == null || val.spell.command == undefined || val.spell.command == '' ? false : true;
              val.name = val.spell.name;
            });
          } catch (err) { }
          try {
            this.noRecordFound = !data.CharacterSpellList.length;
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

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'CharacterSpells')
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
    }
  }

  onScroll(isAutoScroll: boolean = true) {

    ++this.page;
    if (isAutoScroll) {
      this.scrollLoading = true;
    }

    this.characterSpellService.getCharacterSpellsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, this.spellFilter.type)
      .subscribe(data => {

        var _characterSpellList = data.CharacterSpellList;
        for (var i = 0; i < _characterSpellList.length; i++) {
          _characterSpellList[i].showIcon = false;
          try {
            _characterSpellList[i].showUse = _characterSpellList[i].spell.command == null || _characterSpellList[i].spell.command == undefined || _characterSpellList[i].spell.command == '' ? false : true;
          } catch (err) { }
          this.spellsList.push(_characterSpellList[i]);
        }
        this.scrollLoading = false;

        if (this.spellFilter.type == 1) {
          //this.alphabetCount = this.spellsList.length;
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.spellFilter.type == 2) {
          //let result = this.spellsList.filter(s => s.isMemorized);
          //this.ReadiedCount = result.length;
          this.ReadiedCount = data.FilterReadiedCount;
        }
        if (this.spellFilter.type == 3) {
          //this.LevelCount = this.spellsList.length;
          this.LevelCount = data.FilterLevelCount;
        }

        this.applyFilters(this.spellFilter.type, true);

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
      pageName: 'CharacterSpells',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.characterSpellService.createPageLastViews<any>(this.pageLastView)
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
      pageName: 'CharacterSpells',
      viewType: 'Dense',
      UserId: user.id
    }
    this.characterSpellService.createPageLastViews<any>(this.pageLastView)
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
        this.onScroll();
      }
    }, 10)
  }
  manageIcon(id: number) {
    this.spellsList.forEach(function (val) {
      if (id === val.characterSpellId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  addSpell() {
    this.bsModalRef = this.modalService.show(AddCharacterSpellComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Spell';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.spellVM = { characterId: this.characterId };
    this.bsModalRef.content.characterSpells = this.spellsList;
  }

  createSpell() {
    // this.alertService.startLoadingMessage("", "Checking records");   
    this.spellsService.getspellsCount(this.rulesetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 3000) {
          this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create New Spell';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.rulesetId;
          this.bsModalRef.content.isFromCharacter = true;
          this.bsModalRef.content.isFromCharacterId = +this.characterId;
          this.bsModalRef.content.spellVM = { ruleSetId: this.rulesetId };
          this.bsModalRef.content.isGM_Only = this.isGM_Only;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  editSpell(spell: any) {
    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });

    this.bsModalRef.content.title = 'Edit Character Spell';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.isFromCharacter = true;
    this.bsModalRef.content.isFromCharacterId = +this.characterId;
    this.bsModalRef.content.isFromCharacterSpellId = spell.characterSpellId;
    this.bsModalRef.content.isFromCharacterSpellMemorized = spell.memorized;

    this.bsModalRef.content.spellVM = spell.spell;
    this.bsModalRef.content.rulesetID = this.rulesetId;
    this.bsModalRef.content.isGM_Only = this.isGM_Only;
  }

  duplicateSpell(spell: any) {
    // this.alertService.startLoadingMessage("", "Checking records");   
    this.spellsService.getspellsCount(this.rulesetId)
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
          this.bsModalRef.content.isFromCharacter = true;
          this.bsModalRef.content.isFromCharacterId = +this.characterId;

          this.bsModalRef.content.spellVM = spell.spell;
          this.bsModalRef.content.rulesetID = this.rulesetId;
          this.bsModalRef.content.isGM_Only = this.isGM_Only;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteSpell(spell: any) {
    let name = spell ? (spell.spell ? spell.spell.name : 'spell') : 'spell';
    this.alertService.showDialog('Are you sure you want to remove ' + name + ' from this Character?',
      DialogType.confirm, () => this.deleteSpellHelper(spell), null, 'Yes', 'No');
  }

  private deleteSpellHelper(spell: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Spell");

    this.characterSpellService.deleteCharacterSpell_up(spell.characterSpellId, this.rulesetId)
      .subscribe(
        data => {
          if (spell.isMemorized) {
            this.ReadiedCount = this.ReadiedCount - 1;
          }
          this.alphabetCount = this.alphabetCount - 1;
          this.LevelCount = this.LevelCount - 1;
          this.ImplementFilter();
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Character Spell has been deleted successfully.", "", MessageSeverity.success);
          this.spellsList = this.spellsList.filter((val) => val.characterSpellId != spell.characterSpellId);
          try {
            this.noRecordFound = !this.spellsList.length;
          } catch (err) { }
          // this.initialize();
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

  memorizeSpell(spell: any) {
    //this.isLoading = true;    
    this.ReadiedCount = spell.isMemorized ? this.ReadiedCount - 1 : this.ReadiedCount + 1;
    let memorizeTxt = spell.isMemorized ? 'Unmemorize' : 'Memorize';
    this.characterSpellService.toggleMemorizedCharacterSpell(spell.characterSpellId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          spell.isMemorized = spell.isMemorized ? false : true;
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

  castSpell(spell: any) {

    if (spell.spellId) {
      this.spellsService.getSpellCommands_sp<any>(spell.spellId, 0)
        .subscribe(data => {
          if (data.length > 0) {
            this.bsModalRef = this.modalService.show(CastComponent, {
              class: 'modal-primary modal-md',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.title = "Spell Cast";
            this.bsModalRef.content.ListCommands = data;
            this.bsModalRef.content.Command = spell.spell;
            this.bsModalRef.content.Character = this.character;
            this.bsModalRef.content.ButtonText = 'Cast';
            this.bsModalRef.content.recordType = 'spell';
            this.bsModalRef.content.recordId = spell.characterSpellId;
          } else {
            this.useCommand(spell.spell, spell.characterSpellId)
          }
        }, error => { }, () => { });
    }

  }
  useCommand(Command: any, spellId: string = '') {
    let msg = "The command value for " + Command.name
      + " has not been provided. Edit this record to input one.";
    if (Command.command == undefined || Command.command == null || Command.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
    }
    else {
      //TODO
      this.useCommandHelper(Command, spellId);
    }
  }
  private useCommandHelper(Command: any, spellId: string = '') {
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
      this.bsModalRef.content.recordType = 'spell';
      this.bsModalRef.content.recordId = spellId;
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
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
    //  this.spellFilter.type = present_filter;
    //} else {
    //  if (present_filter == 3) {
    //    this.spellFilter.type = 1;
    //  }
    //  else {
    //    this.spellFilter.type = present_filter + 1;
    //  }
    //}
    if (present_filter == 1) {
      this.Alphabetical = true;
      this.Readied = false;
      this.Level = false;

    }
    else if (present_filter == 2) {
      this.Alphabetical = false;
      this.Readied = true;
      this.Level = false;
    }
    else {
      this.Alphabetical = false;
      this.Readied = false;
      this.Level = true;
    }


    this.spellFilter.type = present_filter;
    if (IsCalledFromClickFunction) {
      this.isLoading = true;
      this.page = 1
      this.pageSize = 28;

      this.characterSpellService.getCharacterSpellsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, this.spellFilter.type)
        .subscribe(data => {
          this.spellsList = Utilities.responseData(data.CharacterSpellList, this.pageSize);

          try {
            this.spellsList.forEach(function (val) {
              val.showIcon = false;
              val.showCast = val.spell.command == null || val.spell.command == undefined || val.spell.command == '' ? false : true;
              val.name = val.spell.name;
            });
          } catch (err) { }
          try {
            this.noRecordFound = !data.CharacterSpellList.length;
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

  public clickAndHold(item: any) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  public editRecord(record: any) {
    this.timeoutHandler = setInterval(() => {
      this.editSpell(record);
    }, 1000);
  }
  ImplementFilter() {
    //this.spellFilter.viewableCount = this.spellsList.length;
    this.spellFilter.viewableCount = this.alphabetCount;

    switch (this.spellFilter.type) {
      case 1: // Alphabetical
      default:
        //this.spellsList.sort(function (a, b) {
        //  if (a["spell"]["name"] == b["spell"]["name"]) {
        //    return 0;
        //  }

        //  return (a["spell"]["name"] < b["spell"]["name"]) ? -1 : 1;
        //});

        this.spellFilter.name = 'Alphabetical';
        this.spellFilter.icon = '';
        break;
      case 2: // Readied
        //this.spellsList.sort(function (a, b) {
        //  if (a["isMemorized"] == b["isMemorized"]) {
        //    return (a["spell"]["name"] < b["spell"]["name"]) ? -1 : (a["spell"]["name"] > b["spell"]["name"]) ? 1 : 0;
        //  }
        //  else {
        //    return (a["isMemorized"] > b["isMemorized"]) ? -1 : 1;
        //  }
        //});

        this.spellFilter.viewableCount = this.ReadiedCount;
        //this.spellFilter.viewableCount = 0;
        //this.spellsList.map((item) => {
        //  if (item.isMemorized) {
        //    this.spellFilter.viewableCount++;
        //  }
        //});

        this.spellFilter.name = 'Readied';
        this.spellFilter.icon = 'icon-Rec-Memorized';
        break;
      case 3: // Level Sort
        //this.spellsList.sort(function ($a, $b) {
        //  var aLevel = 0;
        //  if ($a["spell"]["levels"]) {
        //    aLevel = parseInt($a["spell"]["levels"]);
        //  }

        //  var bLevel = 0;
        //  if ($b["spell"]["levels"]) {
        //    bLevel = parseInt($b["spell"]["levels"]);
        //  }

        //  if (aLevel == bLevel) {
        //    return ($a["spell"]["name"] < $b["spell"]["name"]) ? -1 : ($a["spell"]["name"] > $b["spell"]["name"]) ? 1 : 0;
        //  }
        //  else {
        //    return (aLevel > bLevel) ? -1 : 1;
        //  }
        //});

        this.spellFilter.name = 'Level';
        this.spellFilter.icon = '';
        break;
    }

    this.localStorage.saveSyncedSessionData(this.spellFilter, 'spellFilter');
  }

  getFilters() {
    if (this.spellFilter.type == 2 || this.spellFilter.type == 3) {
      this.characterSpellService.getCharacterSpellsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, 1)
        .subscribe(data => {
          //this.alphabetCount = data.CharacterSpellList.length;
          this.alphabetCount = data.FilterAplhabetCount;
        }, error => {
        }, () => { });
    }
    if (this.spellFilter.type == 1 || this.spellFilter.type == 3) {
      this.characterSpellService.getCharacterSpellsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, 2)
        .subscribe(data => {
          //let result = data.CharacterSpellList.filter(s => s.isMemorized);
          //this.ReadiedCount = result.length;
          this.ReadiedCount = data.FilterReadiedCount;
        }, error => {
        }, () => { });
    }
    if (this.spellFilter.type == 1 || this.spellFilter.type == 2) {
      this.characterSpellService.getCharacterSpellsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, 3)
        .subscribe(data => {
          //this.LevelCount = data.CharacterSpellList.length;
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
    this.charactersService.getPlayerControlsByCharacterId_Cache(characterId)
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

  RemoveSpell() {
    this.bsModalRef = this.modalService.show(RemoveSpellsComponent, {
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
    this.characterSpellService.getCharacterSpellsByCharacterId_sp<any>(this.characterId, this.rulesetId, this.page, this.pageSize, this.spellFilter.type)
      .subscribe(data => {
        let count = 0;
        var _characterSpellList = data.CharacterSpellList;
        for (var i = 0; i < _characterSpellList.length; i++) {
          _characterSpellList[i].showIcon = false;
          try {
            _characterSpellList[i].showUse = _characterSpellList[i].spell.command == null || _characterSpellList[i].spell.command == undefined || _characterSpellList[i].spell.command == '' ? false : true;
            _characterSpellList[i].name = _characterSpellList[i].spell.name;
          } catch (err) { }
          this.spellsList.push(_characterSpellList[i]);

          count += 1;
          if (count == _characterSpellList.length - 1) {
            this.onSearch();
          }
        }
        this.scrollLoading = false;

        if (this.spellFilter.type == 1) {
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.spellFilter.type == 2) {
          this.ReadiedCount = data.FilterReadiedCount;
        }
        if (this.spellFilter.type == 3) {
          this.LevelCount = data.FilterLevelCount;
        }

        this.applyFilters(this.spellFilter.type, true);

      }, error => { });

  }

}
