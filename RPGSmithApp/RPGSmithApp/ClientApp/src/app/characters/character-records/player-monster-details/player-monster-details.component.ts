import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService, MessageSeverity, DialogType } from "../../../core/common/alert.service";
import { AuthService } from "../../../core/auth/auth.service";
import { SharedService } from "../../../core/services/shared.service";
import { ConfigurationService } from "../../../core/common/configuration.service";
import { RulesetService } from "../../../core/services/ruleset.service";
import { CommonService } from "../../../core/services/shared/common.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { User } from "../../../core/models/user.model";
import { DBkeys } from "../../../core/common/db-keys";
import { Utilities } from "../../../core/common/utilities";
import { ImageViewerComponent } from "../../../shared/image-interface/image-viewer/image-viewer.component";
import { PlatformLocation } from "@angular/common";
import { MonsterTemplate } from "../../../core/models/view-models/monster-template.model";
import { MonsterTemplateService } from "../../../core/services/monster-template.service";
import { Characters } from "../../../core/models/view-models/characters.model";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { CharactersService } from "../../../core/services/characters.service";
import { AppService1 } from "../../../app.service";
import { ServiceUtil } from "../../../core/services/service-util";




@Component({
  selector: 'app-player-monster-details',
  templateUrl: './player-monster-details.component.html',
  styleUrls: ['./player-monster-details.component.scss']
})

export class PlayerMonsterDetailsComponent implements OnInit {

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
  _editMonster: any;
  headers: any;
  characterId: number;
  ruleset: any;
  character: any;
  doesCharacterHasAllies: boolean = false;

  IsGm: boolean = false;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
    private monsterTemplateService: MonsterTemplateService, private rulesetService: RulesetService,
    private location: PlatformLocation,
    private storageManager: LocalStoreManager,
    private charactersService: CharactersService,
    private appService: AppService1) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.monsterId = params['id']; });
    this.sharedService.shouldUpdateMonsterList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });
    this.sharedService.shouldUpdateDropMonsterList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });

  }
  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
    } catch (err) { this.isDropdownOpen = false; }
  }

  ngOnInit() {
    this.headers = this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (this.headers) {
      if (this.headers.headerLink == "character") {
        this.characterId = this.headers.headerId;


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

      }
    }
    this.GetCharacterById();
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
            this.ruleSetId = this.monsterDetail.ruleSetId;
          }
          this.isLoading = false;
          this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

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

            }, error => { }, () => { });

          //this.rulesetService.GetCopiedRulesetID(this.monsterDetail.ruleSetId, user.id).subscribe(data => {
          //  let id: any = data
          //  //this.ruleSetId = id;
          //  this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          //  this.isLoading = false;
          //}, error => {
          //  this.isLoading = false;
          //  let Errors = Utilities.ErrorDetail("", error);
          //  if (Errors.sessionExpire) {
          //    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          //    this.authService.logout(true);
          //  }
          //}, () => { });

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
      this.actionText = 'ACTIONS';// 'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  RedirectBack() {
    //this.headers = this.storageManager.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (this.headers) {
      if (this.headers.headerLink == "character") {
        this.router.navigate(['/character/combatplayer', this.headers.headerId]);
      }
    }
   
    
    //window.history.back();
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

  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.recordName = this.monsterDetail.ruleset.ruleSetName;
    this.bsModalRef.content.recordImage = this.monsterDetail.ruleset.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset'
    this.bsModalRef.content.isFromCampaignDetail = true;
  }

  GetCharacterById() {
    this.isLoading = true;
    this.charactersService.getCharactersById<any>(this.characterId)
      .subscribe(data => {
        this.character = data;
        this.characterId = data.characterId;
        this.ruleset = data.ruleSet;
        this.ruleSetId = this.ruleset.ruleSetId;
        //this.isLoading = false;
        this.setHeaderValues(this.character);
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        } else {
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }
      }, () => { });
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
}
