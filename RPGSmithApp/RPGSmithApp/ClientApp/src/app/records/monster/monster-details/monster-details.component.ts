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
import { DropItemsMonsterComponent } from "../drop-items-monster/drop-items-monster.component";
import { EditMonsterComponent } from "../edit-monster/edit-monster.component";
import { CastComponent } from "../../../shared/cast/cast.component";
import { Characters } from "../../../core/models/view-models/characters.model";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
//import { CreateMonsterTemplateComponent } from "../create-monster-template/create-monster-template.component";
//import { DeployMonsterComponent } from "../deploy-monster/deploy-monster.component";
//import { DropItemsMonsterComponent } from "../drop-items-monster/drop-items-monster.component";
//import { CreateMonsterGroupComponent } from "../moster-group/monster-group.component";



@Component({
  selector: 'app-monster-details',
  templateUrl: './monster-details.component.html',
  styleUrls: ['./monster-details.component.scss']
})

export class MonsterDetailsComponent implements OnInit {

    isLoading = false;
    showActions: boolean = true;
    isDropdownOpen: boolean = false;
    actionText: string;
    monsterTemplateId: number;
    ruleSetId: number;
  bsModalRef: BsModalRef;
 // monsterTemplateDetail: any = new MonsterTemplate();
  monsterDetail: any = new MonsterTemplate();
  buffAndEffectsList = [];
  selectedBuffAndEffects = [];
  selectedAbilities = [];
  selectedSpells = [];
  selectedAssociateMonsterTemplates = [];
  selectedItemMasters = [];
  _editMonster: any;

  IsGm: boolean = false;
    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService,
      private monsterTemplateService:MonsterTemplateService, private rulesetService: RulesetService,
      private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
      this.route.params.subscribe(params => { this.monsterTemplateId = params['id']; });
      this.sharedService.shouldUpdateMonsterTemplateList().subscribe(sharedServiceJson => {
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
          if (user.isGm) {
            this.IsGm = user.isGm;            
          }
          this.isLoading = true;
          this.monsterTemplateService.getMonsterById<any>(this.monsterTemplateId)
            .subscribe(data => {

              if (data)
                this.monsterDetail = this.monsterTemplateService.MonsterModelData(data, "UPDATE");
              this._editMonster = data;
              console.log('monsterDetail', this.monsterDetail);
              if (!this.monsterDetail.ruleset) {
                this.monsterDetail.ruleset = data.ruleSet;

               }
              this.ruleSetId = this.monsterDetail.ruleSetId;

                this.monsterTemplateService.getMonsterTemplateAssociateRecords_sp<any>(this.monsterTemplateId, this.ruleSetId)
                  .subscribe(data => {
                    this.selectedBuffAndEffects = data.selectedBuffAndEffects;
                    this.selectedAbilities = data.selectedAbilityList;
                    this.selectedSpells = data.selectedSpellList;
                    this.selectedItemMasters = data.selectedItemMasters;
                   // this.associateMonsterTemplateList = data.monsterTemplatesList;
                    this.selectedAssociateMonsterTemplates = data.selectedMonsterTemplates;

                  }, error => {

                  }, () => { });
             
              this.rulesetService.GetCopiedRulesetID(this.monsterDetail.ruleSetId, user.id).subscribe(data => {
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


      
  

  editMonster(monster: any) {
    this.bsModalRef = this.modalService.show(EditMonsterComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Monster';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterVM = this._editMonster;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    debugger
  }

  duplicateMonster(monster: any) {


  }

  deleteMonster(monster: any) {


  }

  //deleteMonsterTemplate(monsterTemplate: MonsterTemplate) {
  //  let message = "Are you sure you want to delete this " + monsterTemplate.name
  //    + " Monster Template?";

  //  this.alertService.showDialog(message,
  //    DialogType.confirm, () => this.deleteMonsterTemplateHelper(monsterTemplate), null, 'Yes', 'No');
  //}

  //private deleteMonsterTemplateHelper(monsterTemplate: MonsterTemplate) {
  //  monsterTemplate.ruleSetId = this.ruleSetId;
  //  this.isLoading = true;
  //  this.alertService.startLoadingMessage("", "Deleting a Monster Template");


  //  this.monsterTemplateService.deleteMonsterTemplate_up(monsterTemplate)
  //    .subscribe(
  //      data => {
  //        this.isLoading = false;
  //        this.alertService.stopLoadingMessage();
  //        this.alertService.showMessage("Monster Template has been deleted successfully.", "", MessageSeverity.success);
  //        //this.initialize();
  //        //this.location.replaceState('/'); 
  //        this.router.navigate(['/ruleset/monster-template', this.ruleSetId]);
  //        //this.initialize();
  //      },
  //      error => {
  //        this.isLoading = false;
  //        this.alertService.stopLoadingMessage();
  //        let Errors = Utilities.ErrorDetail("Unable to Delete", error);
  //        if (Errors.sessionExpire) {
  //          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
  //          this.authService.logout(true);
  //        }
  //        else
  //          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //      });
  //}

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
   
  dropMonsterItems() {
      this.bsModalRef = this.modalService.show(DropItemsMonsterComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Drop Items';
      this.bsModalRef.content.button = 'Drop';
      this.bsModalRef.content.monsterId = this._editMonster.monsterId;
      this.bsModalRef.content.rulesetID = this.ruleSetId;
    }
  
  useMonster() {

    let _monstertemplate = Object.assign({}, this._editMonster.monsterTemplate);
    _monstertemplate.imageUrl = this._editMonster.imageUrl;
    _monstertemplate.name = this._editMonster.name;

    if (_monstertemplate.monsterTemplateId) {
      this.monsterTemplateService.getMonsterTemplateCommands_sp<any>(_monstertemplate.monsterTemplateId)
        .subscribe(data => {
          if (data.length > 0) {
            this.bsModalRef = this.modalService.show(CastComponent, {
              class: 'modal-primary modal-md',
              ignoreBackdropClick: true,
              keyboard: false
            });

            this.bsModalRef.content.title = "Monster Commands";
            this.bsModalRef.content.ListCommands = data;
            this.bsModalRef.content.Command = _monstertemplate;
            this.bsModalRef.content.Character = new Characters();
            this.bsModalRef.content.recordType = 'monster';
            this.bsModalRef.content.recordId = this._editMonster.monsterId;
          } else {

            this.useCommand(_monstertemplate, this._editMonster);
          }
        }, error => { }, () => { });
    }
  }

  useCommand(monsterTemplate: any, monster) {
   
    let msg = "The command value for " + monster.name
      + " Monster has not been provided. Edit this record to input one.";
    if (monsterTemplate.command == undefined || monsterTemplate.command == null || monsterTemplate.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterTemplateHelper(monsterTemplate, monster));
    }else {
      //TODO
      this.useMonsterTemplateHelper(monsterTemplate, monster);
    }
  }

  private useMonsterTemplateHelper(monsterTemplate: MonsterTemplate, monster) {

    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = monsterTemplate.command;
    if (monsterTemplate.hasOwnProperty("monsterTemplateId")) {
      this.bsModalRef.content.recordName = monster.name;
      this.bsModalRef.content.recordImage = monster.imageUrl;
      this.bsModalRef.content.recordType = 'monster';
      this.bsModalRef.content.recordId = monster.monsterId;
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
  }

   

   
    RedirectBack() {
      //this.router.navigate(['/ruleset/ability', this.ruleSetId]);
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

  GoToCharAbility(RulesetAbilityId: number) {
    this.router.navigate(['/ruleset/ability-details', RulesetAbilityId]);
  }
  GoToBuffEfects(buffAndEffectId : number) {
    this.router.navigate(['/ruleset/buff-effect-details', buffAndEffectId]);
  }

  GoToCharSpell(RulesetSpellID: number) {
    this.router.navigate(['/ruleset/spell-details', RulesetSpellID]);
  }
  GoToAssociateMonster(monsterTemplateId:number) {

    this.router.navigate(['/ruleset/monster-template-details', monsterTemplateId]);
  }
  GoToItems(Itemid:number) {

    this.router.navigate(['/ruleset/item-details', Itemid]);
  }

  
  

  
}
