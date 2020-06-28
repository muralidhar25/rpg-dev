import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { MonsterTemplate } from "../../../../core/models/view-models/monster-template.model";
import { MonsterDetailType, combatantType } from "../../../../core/models/enums";
import { AlertService, MessageSeverity, DialogType } from "../../../../core/common/alert.service";
import { AuthService } from "../../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../../core/common/local-store-manager.service";
import { SharedService } from "../../../../core/services/shared.service";
import { MonsterTemplateService } from "../../../../core/services/monster-template.service";
import { RulesetService } from "../../../../core/services/ruleset.service";
import { PlatformLocation } from "@angular/common";
import { ServiceUtil } from "../../../../core/services/service-util";
import { DBkeys } from "../../../../core/common/db-keys";
import { Utilities } from "../../../../core/common/utilities";
import { CastComponent } from "../../../../shared/cast/cast.component";
import { User } from "../../../../core/models/user.model";
import { Characters } from "../../../../core/models/view-models/characters.model";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { EditMonsterComponent } from "../../../../records/monster/edit-monster/edit-monster.component";
import { UpdateMonsterHealthComponent } from "../../../../shared/update-monster-health/update-monster-health.component";
import { CharactersService } from "../../../../core/services/characters.service";

@Component({
  selector: 'app-allies-details',
  templateUrl: './allies-details.component.html',
  styleUrls: ['./allies-details.component.scss']
})

export class AlliesDetailsComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  isDropdownOpen: boolean = false;
  actionText: string;
  monsterId: number;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  monsterDetail: any = new MonsterTemplate();
  buffAndEffectsList = [];
  selectedBuffAndEffects = [];
  selectedAbilities = [];
  selectedSpells = [];
  selectedAssociateMonsterTemplates = [];
  selectedItemMasters = [];

  ListBuffAndEffects = [];
  ListAbilities = [];
  ListSpells = [];
  ListAssociateMonsterTemplates = [];
  ListItemMasters = [];
  monsterDetailType = MonsterDetailType;
  _editMonster: any;
  IsGm: boolean = false;
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;
  isAssignedToCharacter: boolean = false;
  character: Characters;
  isGM_Only: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService,
    private monsterTemplateService: MonsterTemplateService, private rulesetService: RulesetService,
    private location: PlatformLocation, private charactersService: CharactersService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.monsterId = params['id']; });
    this.sharedService.shouldUpdateMonsterList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });
    this.sharedService.shouldUpdateDropMonsterList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });

  }

  ngOnInit() {
    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);
    this.initialize();
    this.showActionButtons(this.showActions);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
      }
      this.isLoading = true;
      this.monsterTemplateService.getMonsterById_Cache<any>(this.monsterId)
        .subscribe(data => {

          if (data) {
            this.monsterDetail = this.monsterTemplateService.MonsterModelData(data, "UPDATE");
            this._editMonster = data;
            if (!this.monsterDetail.ruleset) {
              this.monsterDetail.ruleset = data.ruleSet;
            }
            this.isLoading = false;
            this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
            this.ruleSetId = this.monsterDetail.ruleSetId;
            if (this.monsterDetail.characterId && this.monsterDetail.character) {
              this.gameStatus(this.monsterDetail.characterId);
              this.character = this.monsterDetail.character;
              this.isAssignedToCharacter = true;
            } else {
              this.isAssignedToCharacter = false;
            }

          }

          this.monsterTemplateService.getMonsterAssociateRecords_sp_Cache<any>(this.monsterDetail.monsterId, this.ruleSetId)
            .subscribe(data => {
              this.selectedBuffAndEffects = data.selectedBuffAndEffects;
              this.selectedAbilities = data.selectedAbilityList;
              this.selectedSpells = data.selectedSpellList;
              this.selectedItemMasters = data.selectedItemMasters;
              // this.associateMonsterTemplateList = data.monsterTemplatesList;                    
              this.selectedAssociateMonsterTemplates = data.selectedMonsterTemplates;

              this.ListBuffAndEffects = data.buffAndEffectsList;
              this.ListAbilities = data.abilityList;
              this.ListSpells = data.spellList;
              this.ListItemMasters = data.itemMasterList;
              this.ListAssociateMonsterTemplates = data.monsterTemplatesList;

            }, error => {

            }, () => { });

          //this.rulesetService.GetCopiedRulesetID(this.monsterDetail.ruleSetId, user.id).subscribe(data => {
          //  let id: any = data
          //  this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          //  this.isLoading = false;
          //}, error => {
          //  this.isLoading = false;
          //  let Errors = Utilities.ErrorDetail("", error);
          //  if (Errors.sessionExpire) {
          //    this.authService.logout(true);
          //  }
          //}, () => { });

        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
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


  editMonster(monster: any) {
    this.bsModalRef = this.modalService.show(EditMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Ally';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterVM = this._editMonster;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.isGM_Only = this.isGM_Only;
  }

  enableCombatTracker(monster: any) {
    //this.isLoading = true;
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

  useMonster() {
    let _monster = Object.assign({}, this._editMonster);


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
            this.bsModalRef.content.Character = new Characters();
            this.bsModalRef.content.recordType = 'monster';
            this.bsModalRef.content.recordId = this._editMonster.monsterId;
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
    this.bsModalRef.content.characterId = this.character.characterId;
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

  RedirectBack() {
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.ruleSetId]);
    }
    else if (this.IsComingFromCombatTracker_PC) {
      this.router.navigate(['/character/combatplayer', + this.character.characterId]);
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

  //GoToCharAbility(RulesetAbilityId: number) {
  //  this.router.navigate(['/ruleset/ability-details', RulesetAbilityId]);
  //}
  //GoToBuffEfects(buffAndEffectId: number) {
  //  this.router.navigate(['/ruleset/buff-effect-details', buffAndEffectId]);
  //}

  //GoToCharSpell(RulesetSpellID: number) {
  //  this.router.navigate(['/ruleset/spell-details', RulesetSpellID]);
  //}
  //GoToAssociateMonster(monsterTemplateId: number) {

  //  this.router.navigate(['/ruleset/monster-template-details', monsterTemplateId]);
  //}
  //GoToItems(Itemid: number) {

  //  this.router.navigate(['/ruleset/monster-item-details', Itemid]);
  //}

  //AddRemoveItems() {
  //  this.bsModalRef = this.modalService.show(AddRemoveAssociateItemsComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = 'Select Items';
  //  this.bsModalRef.content.button = 'Save';
  //  this.bsModalRef.content.monster = this.monsterDetail;
  //  this.bsModalRef.content.selectedItems = this.selectedItemMasters;
  //  this.bsModalRef.content.itemsList = this.ListItemMasters;
  //  this.bsModalRef.content.recordName = this.monsterDetail.name;
  //  this.bsModalRef.content.recordImage = this.monsterDetail.imageUrl;
  //}

  //AddRemoveMonsters() {

  //  this.bsModalRef = this.modalService.show(AddRemoveAssociateMonstersComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = 'Select Monsters';
  //  this.bsModalRef.content.button = 'Save';
  //  this.bsModalRef.content.monster = this.monsterDetail;
  //  this.bsModalRef.content.selectedItems = this.selectedAssociateMonsterTemplates;
  //  this.bsModalRef.content.itemsList = this.ListAssociateMonsterTemplates;
  //  this.bsModalRef.content.recordName = this.monsterDetail.name;
  //  this.bsModalRef.content.recordImage = this.monsterDetail.imageUrl;
  //}

  //AddRemoveAbilities() {

  //  this.bsModalRef = this.modalService.show(AddRemoveAssociateAbilitiesComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = 'Select Abilities';
  //  this.bsModalRef.content.button = 'Save';
  //  this.bsModalRef.content.monster = this.monsterDetail;
  //  this.bsModalRef.content.selectedItems = this.selectedAbilities;
  //  this.bsModalRef.content.itemsList = this.ListAbilities;
  //  this.bsModalRef.content.recordName = this.monsterDetail.name;
  //  this.bsModalRef.content.recordImage = this.monsterDetail.imageUrl;
  //}

  //AddRemoveBEs() {

  //  this.bsModalRef = this.modalService.show(AddRemoveAssociateBuffAndEffectsComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = 'Select Buffs & Effects';
  //  this.bsModalRef.content.button = 'Save';
  //  this.bsModalRef.content.monster = this.monsterDetail;
  //  this.bsModalRef.content.selectedItems = this.selectedBuffAndEffects;
  //  this.bsModalRef.content.itemsList = this.ListBuffAndEffects;
  //  this.bsModalRef.content.recordName = this.monsterDetail.name;
  //  this.bsModalRef.content.recordImage = this.monsterDetail.imageUrl;
  //}

  //AddRemoveSpells() {

  //  this.bsModalRef = this.modalService.show(AddRemoveAssociateSpellsComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = 'Select Spells';
  //  this.bsModalRef.content.button = 'Save';
  //  this.bsModalRef.content.monster = this.monsterDetail;
  //  this.bsModalRef.content.selectedItems = this.selectedSpells;
  //  this.bsModalRef.content.itemsList = this.ListSpells;
  //  this.bsModalRef.content.recordName = this.monsterDetail.name;
  //  this.bsModalRef.content.recordImage = this.monsterDetail.imageUrl;
  //}

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

  updateMonsterInfoProp(monster, type) {
    let monsterModel: any = new MonsterTemplate();
    monsterModel.armorClass = monster.monsterArmorClass;
    monsterModel.challangeRating = monster.monsterChallangeRating;
    monsterModel.healthCurrent = monster.monsterHealthCurrent;
    monsterModel.healthMax = monster.monsterHealthMax;
    monsterModel.monsterId = monster.monsterId;
    monsterModel.name = monster.name;
    monsterModel.imageUrl = monster.imageUrl;

    this.bsModalRef = this.modalService.show(UpdateMonsterHealthComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = type;
    this.bsModalRef.content.combatInfo = { monster: monsterModel, monsterId: monster.monsterId, type: combatantType.MONSTER };
    this.bsModalRef.content.event.subscribe(result => {

      if (result.type == MonsterDetailType.HEALTH && result.record.type == combatantType.MONSTER) {
        this.monsterDetail.monsterHealthCurrent = result.record.monster.healthCurrent;
        this.monsterDetail.monsterHealthMax = result.record.monster.healthMax;
      }
      else if (result.type == MonsterDetailType.RATING && result.record.type == combatantType.MONSTER) {
        this.monsterDetail.monsterChallangeRating = result.record.monster.challangeRating;
      }
      else if (result.type == MonsterDetailType.ARMOR && result.record.type == combatantType.MONSTER) {
        this.monsterDetail.monsterArmorClass = result.record.monster.armorClass;
      }
      //else if (result.type == MonsterDetailType.INITIATIVE && result.record.type == combatantType.MONSTER) {
      //  item.monster.healthCurrent = result.record.initiative;
      //}
      //else if (result.type == MonsterDetailType.XPVALUE && result.record.type == combatantType.MONSTER) {
      //  item.monster.healthCurrent = result.record.monster.xpValue;
      //}
    });
  }

  //GotoCommand(cmd) {
  //  // TODO get char ID
  //  this.bsModalRef = this.modalService.show(DiceRollComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = "Dice";
  //  this.bsModalRef.content.tile = -2;
  //  this.bsModalRef.content.characterId = this.character.characterId;
  //  this.bsModalRef.content.character = this.character;
  //  this.bsModalRef.content.command = cmd;
  //}

  //AssignToCharacter() {
  //  this.bsModalRef = this.modalService.show(AssignToCharacterComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.monster = this.monsterDetail;
  //  this.bsModalRef.content.rulesetId = this.ruleSetId;
  //}

  RemoveCharacterFromMonster() {
    let model = { characterId: null, monsterId: this.monsterId };

    this.isLoading = true;
    this.monsterTemplateService.assignMonsterTocharacter<any>(model)
      .subscribe(data => {
        this.monsterDetail.characterId = null;
        this.monsterDetail.character = null;

        this.isAssignedToCharacter = false;
        //this.sharedService.updateMonsterList(true);\
        this.router.navigate(['/character/allies', this.character.characterId]);
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
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
          this.router.navigate(['/character/allies', this.character.characterId]);
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
          this.bsModalRef.content.monsterVM = this._editMonster;
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


}
