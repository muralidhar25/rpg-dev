import { Component, OnInit, HostListener } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, DialogType, MessageSeverity } from "../../../core/common/alert.service";
import { AuthService } from "../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { SharedService } from "../../../core/services/shared.service";
import { PageLastViewsService } from "../../../core/services/pagelast-view.service";
import { MonsterTemplateService } from "../../../core/services/monster-template.service";
import { AppService1 } from "../../../app.service";
import { Utilities } from "../../../core/common/utilities";
import { DBkeys } from "../../../core/common/db-keys";
import { User } from "../../../core/models/user.model";
import { EditMonsterComponent } from "../../../records/monster/edit-monster/edit-monster.component";
import { CastComponent } from "../../../shared/cast/cast.component";
import { Characters } from "../../../core/models/view-models/characters.model";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { CharactersService } from "../../../core/services/characters.service";
import { ServiceUtil } from "../../../core/services/service-util";

@Component({
  selector: 'app-allies',
  templateUrl: './allies.component.html',
  styleUrls: ['./allies.component.scss']
})

export class AlliesComponent implements OnInit {

  rulesetModel: any;
  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  ruleSetId: number;
  characterId: number;
  monsterId: number;
  monsterList: any;
  pageLastView: any;
  isDropdownOpen: boolean = false;
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;
  page: number = 1;
  timeoutHandler: any;
  pageSize: number = 56;
  offset = (this.page - 1) * this.pageSize;
  backURL: string = '/rulesets';
  Alphabetical: boolean = false;
  ChallangeRating: boolean = false;
  Health: boolean = false;
  monstersFilter: any = {
    type: 1,
    name: 'Alphabetical',
    icon: '',
    viewableCount: 0
  };
  alphabetCount: number;
  ChallangeRatingCount: number;
  HealthCount: number;
  character: Characters;
  isGM_Only: boolean = false;
  searchText: string;

  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;

  constructor(private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private sharedService: SharedService,
    private pageLastViewsService: PageLastViewsService, private monsterTemplateService: MonsterTemplateService,
    public appService: AppService1, private charactersService: CharactersService, private router: Router) {

    this.sharedService.shouldUpdateMonsterList().subscribe(sharedServiceJson => {
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
      if (target.className.endsWith("is-show"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }

  ngOnInit() {
    this.route.params.subscribe(params => { this.characterId = params['id']; });
    this.gameStatus(this.characterId);
    this.destroyModalOnInit();
    this.initialize();
    this.showActionButtons(this.showActions);

  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

    let localStorageFilters = this.localStorage.getDataObject<number>('monstersFilters');
    if (localStorageFilters != null) {
      this.monstersFilter = localStorageFilters;
    }

    if (user == null)
      this.authService.logout();
    else {
      this.getFilters();

      this.isLoading = true;
      this.monsterTemplateService.getMonsterByRuleset_spWithPagination_Cache_Allies<any>(this.ruleSetId, this.page, this.pageSize, this.monstersFilter.type, this.characterId)
        .subscribe(data => {
          if (data.Character) {
            this.character = data.Character;
            this.characterId = data.Character.characterId;
            this.setHeaderValues(this.character);
          }
          if (data.RuleSet)
            this.monsterList = Utilities.responseData(data.monsters, this.pageSize);
          if (this.monstersFilter.type == 1) {
            this.monstersFilter.viewableCount = data.FilterAplhabetCount;
            this.alphabetCount = data.FilterAplhabetCount;
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

          if (this.monstersFilter.type == 2) {
            this.ChallangeRatingCount = data.FilterCRCount;
          }
          if (this.monstersFilter.type == 3) {
            this.HealthCount = data.FilterHealthCount;
          }

          this.applyFilters(this.monstersFilter.type, true);
          this.rulesetModel = data.RuleSet;
          this.monsterList.forEach(function (val) { val.showIcon = false; val.xPValue = val.xpValue });
          try {
            this.noRecordFound = !data.monsters.length;
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

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetMonsters')
      //  .subscribe(data => {
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


    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);
  }

  onScroll(isAutoScroll: boolean = true) {
    ++this.page;
    if (isAutoScroll) {
      this.scrollLoading = true;
    }

    this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monstersFilter.type, this.characterId)
      .subscribe(data => {
        var _monster = data.monsters;
        for (var i = 0; i < _monster.length; i++) {
          _monster[i].showIcon = false;
          _monster[i].xPValue = _monster[i].xpValue;
          this.monsterList.push(_monster[i]);
        }

        this.scrollLoading = false;
        if (this.monstersFilter.type == 1) {
          this.monstersFilter.viewableCount = data.FilterAplhabetCount;
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.monstersFilter.type == 2) {
          this.ChallangeRatingCount = data.FilterCRCount;
        }
        if (this.monstersFilter.type == 3) {
          this.HealthCount = data.FilterHealthCount;
        }

        this.applyFilters(this.monstersFilter.type, true);
      }, error => {
        this.isLoading = false;
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
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
      pageName: 'RulesetMonsters',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.monsterTemplateService.createPageLastViewsAllies<any>(this.pageLastView)
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
      pageName: 'RulesetMonsters',
      viewType: 'Dense',
      UserId: user.id
    }

    this.monsterTemplateService.createPageLastViewsAllies<any>(this.pageLastView)
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
    this.monsterList.forEach(function (val) {
      if (id === val.monsterId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  editMonster(monster: any) {
    this.bsModalRef = this.modalService.show(EditMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Ally';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterVM = monster;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.isGM_Only = this.isGM_Only;
  }

  enableCombatTracker(monster: any) {
    let enableTxt = monster.addToCombatTracker ? 'Disable' : 'Enable';
    let enableCombatTracker = !monster.addToCombatTracker;
    this.monsterTemplateService.enableCombatTracker(monster.monsterId, enableCombatTracker)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          monster.addToCombatTracker = enableCombatTracker;
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

  useMonster(monster: any) {
    let _monster = Object.assign({}, monster);

    if (_monster.monsterId) {
      this.monsterTemplateService.getMonsterCommands_sp<any>(_monster.monsterId)
        .subscribe(data => {
          if (data.length > 0) {
            this.bsModalRef = this.modalService.show(CastComponent, {
              class: 'modal-primary modal-md',
              ignoreBackdropClick: true,
              keyboard: false
            });

            this.bsModalRef.content.title = "Monster Commands";
            this.bsModalRef.content.ListCommands = data;
            this.bsModalRef.content.Command = _monster;
            this.bsModalRef.content.Character = this.character;
            this.bsModalRef.content.recordType = 'monster';
            this.bsModalRef.content.recordId = _monster.monsterId;
          } else {
            this.useCommand(_monster);
          }
        }, error => { }, () => { });
    }
  }

  useCommand(monster: any) {
    let msg = "The command value for " + monster.name
      + " Monster has not been provided. Edit this record to input one.";
    if (monster.command == undefined || monster.command == null || monster.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterHelper(monster));
    } else {
      //TODO
      this.useMonsterHelper(monster);
    }
  }

  private useMonsterHelper(monster: any) {

    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = monster.command;
    if (monster.hasOwnProperty("monsterId")) {
      this.bsModalRef.content.recordName = monster.name;
      this.bsModalRef.content.recordImage = monster.imageUrl;
      this.bsModalRef.content.recordType = 'monster';
      this.bsModalRef.content.recordId = monster.monsterId;
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

  public clickAndHold(item: any) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  public editRecord(record: any) {
    this.timeoutHandler = setInterval(() => {
      this.editMonster(record);
    }, 1000);
  }
  private setHeaderValues(character: Characters): any {
    try {
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

  applyFilters(present_filter, apply_same = false, IsCalledFromClickFunction = false) {
    if (present_filter == 1) {
      this.Alphabetical = true;
      this.Health = false;
      this.ChallangeRating = false;
    }
    if (present_filter == 2) {
      this.ChallangeRating = true;
      this.Alphabetical = false;
      this.Health = false;
    }
    if (present_filter == 3) {
      this.Health = true;
      this.Alphabetical = false;
      this.ChallangeRating = false;
    }
    this.monstersFilter.type = present_filter;
    if (IsCalledFromClickFunction) {
      this.isLoading = true;
      this.page = 1
      this.pageSize = 28;
      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monstersFilter.type, this.characterId)
        .subscribe(data => {
          if (data.Character) {
            this.character = data.Character;
            this.characterId = data.Character.characterId;
            this.setHeaderValues(this.character);
          }
          if (data.RuleSet)
            this.monsterList = Utilities.responseData(data.monsters, this.pageSize);
          this.rulesetModel = data.RuleSet;
          this.monsterList.forEach(function (val) { val.showIcon = false; val.xPValue = val.xpValue });
          try {
            this.noRecordFound = !data.monsters.length;
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
  }
  ImplementFilter() {
    this.monstersFilter.viewableCount = this.alphabetCount;

    switch (this.monstersFilter.type) {
      case 1: // Alphabetical
      default:
        this.monstersFilter.viewableCount = this.alphabetCount;
        this.monstersFilter.name = 'Alphabetical';
        this.monstersFilter.icon = '';
        break;
      case 2: //challange Rating
        this.monstersFilter.viewableCount = this.ChallangeRatingCount;
        this.monstersFilter.name = 'ChallangeRating';
        this.monstersFilter.icon = '';
        break;
      case 3: //Health
        this.monstersFilter.viewableCount = this.HealthCount;
        this.monstersFilter.name = 'Health';
        this.monstersFilter.icon = 'icon icon-Health';
        break;
    }
    this.localStorage.saveSyncedSessionData(this.monstersFilter, 'monstersFilter');

  }
  getFilters() {
    if (this.monstersFilter.type == 2 || this.monstersFilter.type == 3) {
      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 1)
        .subscribe(data => {
          this.alphabetCount = data.FilterAplhabetCount;
        }, error => { }, () => { });
    }
    if (this.monstersFilter.type == 1 || this.monstersFilter.type == 3) {

      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 2)
        .subscribe(data => {
          this.ChallangeRatingCount = data.FilterCRCount;
        }, error => { }, () => { });
    }
    if (this.monstersFilter.type == 1 || this.monstersFilter.type == 2) {

      this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, 3)
        .subscribe(data => {
          this.HealthCount = data.FilterHealthCount;
        }, error => { }, () => { });
    }
  }


  deleteMonster(monster: any) {
    let message = "Are you sure you want to delete this " + monster.name
      + " Ally?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteMonsterHelper(monster), null, 'Yes', 'No');
  }

  private deleteMonsterHelper(monster: any) {
    monster.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting an Ally");


    this.monsterTemplateService.deleteMonster_up(monster)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Ally has been deleted successfully.", "", MessageSeverity.success);
          //this.router.navigate(['/character/allies', this.character.characterId]);
          this.monsterList = this.monsterList.filter((val) => val.monsterId != monster.monsterId);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to Delete", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  duplicateMonster(monster: any) {
    this.monsterTemplateService.getMonsterCountByRuleSetId(this.ruleSetId)
      .subscribe((data: any) => {
        //let MonsterTemplateCount = data.monsterTemplateCount;
        let MonsterCount = data.monsterCount;
        if (MonsterCount < 200) {

          this.bsModalRef = this.modalService.show(EditMonsterComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Ally';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.monsterVM = monster;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef.content.isGM_Only = this.isGM_Only;
        }
        else {
          if (MonsterCount >= 200) {
            this.alertService.showMessage("The maximum number of monsters has been reached, 200. Please delete some monsters and try again.", "", MessageSeverity.error);
          }
        }
      }, error => { }, () => { });

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
            if (data.isPlayerCharacter) {
              if (!data.isPlayerLinkedToCurrentCampaign) {
                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }
              }
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

  onSearch() {
    ++this.page;
    this.monsterTemplateService.getMonsterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize, this.monstersFilter.type, this.characterId)
      .subscribe(data => {
        let count = 0;
        var _monster = data.monsters;
        for (var i = 0; i < _monster.length; i++) {
          _monster[i].showIcon = false;
          _monster[i].xPValue = _monster[i].xpValue;
          this.monsterList.push(_monster[i]);

          count += 1;
          if (count == _monster.length - 1) {
            this.onSearch();
          }

        }

        if (this.monstersFilter.type == 1) {
          this.monstersFilter.viewableCount = data.FilterAplhabetCount;
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.monstersFilter.type == 2) {
          this.ChallangeRatingCount = data.FilterCRCount;
        }
        if (this.monstersFilter.type == 3) {
          this.HealthCount = data.FilterHealthCount;
        }

        this.applyFilters(this.monstersFilter.type, true);
      }, error => { });

  }

  RedirectBack() {
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.ruleSetId]);
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

}
