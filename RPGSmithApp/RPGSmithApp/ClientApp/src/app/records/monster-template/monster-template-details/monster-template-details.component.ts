import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, MessageSeverity, DialogType } from "../../../core/common/alert.service";
import { AuthService } from "../../../core/auth/auth.service";
import { SharedService } from "../../../core/services/shared.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { User } from "../../../core/models/user.model";
import { DBkeys } from "../../../core/common/db-keys";
import { Utilities } from "../../../core/common/utilities";
import { ImageViewerComponent } from "../../../shared/image-interface/image-viewer/image-viewer.component";
import { PlatformLocation } from "@angular/common";
import { MonsterTemplate } from "../../../core/models/view-models/monster-template.model";
import { MonsterTemplateService } from "../../../core/services/monster-template.service";
import { CreateMonsterTemplateComponent } from "../create-monster-template/create-monster-template.component";
import { DeployMonsterComponent } from "../deploy-monster/deploy-monster.component";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../../core/models/view-models/characters.model";
import { CommonService } from "../../../core/services/shared/common.service";

@Component({
  selector: 'app-monster-template-details',
  templateUrl: './monster-template-details.component.html',
  styleUrls: ['./monster-template-details.component.scss']
})

export class MonsterTemplateDetailsComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  isDropdownOpen: boolean = false;
  actionText: string;
  monsterTemplateId: number;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  monsterTemplateDetail: any = new MonsterTemplate();
  buffAndEffectsList = [];
  selectedBuffAndEffects = [];
  selectedAbilities = [];
  selectedSpells = [];
  selectedAssociateMonsterTemplates = [];
  selectedItemMasters = [];
  xpValue: any;
  IsGm: boolean = false;
  CurrencyTypesList = [];
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService,
    private monsterTemplateService: MonsterTemplateService,
    private location: PlatformLocation,
    private commonService: CommonService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => {
      this.monsterTemplateId = params['id'];
      this.initialize();
    });
    //this.sharedService.shouldUpdateMonsterTemplateList().subscribe(sharedServiceJson => {
    //      if (sharedServiceJson) this.initialize();
    //  });
    this.sharedService.shouldUpdateMonsterTemplateDetailList().subscribe(sharedServiceJson => {
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
    //this.initialize();
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
      this.monsterTemplateService.getMonsterTemplateById_Cache<any>(this.monsterTemplateId)
        .subscribe(data => {
          if (data) {
            this.monsterTemplateDetail = this.monsterTemplateService.MonsterTemplateModelData(data, "UPDATE");
            this.xpValue = data.xpValue;
            this.monsterTemplateDetail.xPValue = data.xpValue;

            if (!this.monsterTemplateDetail.ruleset) {
              this.monsterTemplateDetail.ruleset = data.ruleSet;

            }
            this.ruleSetId = this.monsterTemplateDetail.ruleSetId;
          }

          this.isLoading = false;

          this.monsterTemplateService.getMonsterTemplateAssociateRecords_sp_Cache<any>(this.monsterTemplateId, this.ruleSetId)
            .subscribe(data => {

              this.selectedBuffAndEffects = data.selectedBuffAndEffects;
              this.selectedAbilities = data.selectedAbilityList;
              this.selectedSpells = data.selectedSpellList;
              this.CurrencyTypesList = data.currencyType;

              this.monsterTemplateDetail.randomizationEngine = data.randomizationEngine;
              if (this.monsterTemplateDetail.isRandomizationEngine) {
                this.selectedItemMasters = [];
                data.randomizationEngine.map(x => {
                  this.selectedItemMasters.push({ imageUrl: x.itemMaster.itemImage, itemId: 0, itemMasterId: x.itemMaster.itemMasterId, name: x.itemMaster.itemName, qty: 1, ruleSetId: this.monsterTemplateDetail.ruleSetId })
                });
              } else {
                this.selectedItemMasters = data.selectedItemMasters;
              }
              // this.associateMonsterTemplateList = data.monsterTemplatesList;
              this.selectedAssociateMonsterTemplates = data.selectedMonsterTemplates;

              this.monsterTemplateDetail.monsterTemplateCurrency = this.monsterTemplateDetail.monsterTemplateCurrency ?
                (this.monsterTemplateDetail.monsterTemplateCurrency.length > 0 ? this.monsterTemplateDetail.monsterTemplateCurrency : data.currencyType)
                : data.currencyType;

            }, error => {
              this.isLoading = false;
            }, () => { });

          this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

          ////this.rulesetService.GetCopiedRulesetID(this.monsterTemplateDetail.ruleSetId, user.id).subscribe(data => {
          ////  let id: any = data
          ////  //this.ruleSetId = id;
          ////  this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

          ////}, error => {
          ////  this.isLoading = false;
          ////  let Errors = Utilities.ErrorDetail("", error);
          ////  if (Errors.sessionExpire) {
          ////    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          ////    this.authService.logout(true);
          ////  }
          ////}, () => { });



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
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
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

  editMonsterTemplate(monsterTemplate: MonsterTemplate) {

    this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Monster Template';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.monsterTemplateVM = monsterTemplate;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
    this.bsModalRef.content.event.subscribe(data => {
      this.monsterTemplateId = data.monsterTemplateId;
      this.initialize();
    })
  }

  duplicateMonsterTemplate(monsterTemplate: MonsterTemplate) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.monsterTemplateService.getMonsterTemplateCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateMonsterTemplateComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Monster Template';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.monsterTemplateVM = monsterTemplate;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteMonsterTemplate(monsterTemplate: MonsterTemplate) {
    let message = "Are you sure you want to delete this " + monsterTemplate.name
      + " Monster Template?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteMonsterTemplateHelper(monsterTemplate), null, 'Yes', 'No');
  }

  private deleteMonsterTemplateHelper(monsterTemplate: MonsterTemplate) {
    monsterTemplate.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Monster Template");


    this.monsterTemplateService.deleteMonsterTemplate_up(monsterTemplate)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("monsterTemplates", 'monsterTemplates', 'monsterTemplateId', monsterTemplate, true);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Monster Template has been deleted successfully.", "", MessageSeverity.success);
          //this.initialize();
          //this.location.replaceState('/'); 
          this.router.navigate(['/ruleset/monster-template', this.ruleSetId]);
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


  useMonsterTemplate(monsterTemplate: any) {

    let msg = "The command value for " + monsterTemplate.name
      + " Monster Template has not been provided. Edit this record to input one.";

    if (monsterTemplate.monsterTemplateCommand == undefined || monsterTemplate.monsterTemplateCommand == null) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterTemplateHelper(monsterTemplate));
    }
    else if (monsterTemplate.monsterTemplateCommand.length == 0) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useMonsterTemplateHelper(monsterTemplate));
    }
    else {
      //TODO
      this.useMonsterTemplateHelper(monsterTemplate);
    }
  }

  private useMonsterTemplateHelper(monsterTemplate: MonsterTemplate) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Use Monster Template");
    //TODO- PENDING ACTION
    setTimeout(() => {
      this.isLoading = false;
      this.alertService.stopLoadingMessage();
    }, 200);
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
  GoToBuffEfects(buffAndEffectId: number) {
    this.router.navigate(['/ruleset/buff-effect-details', buffAndEffectId]);
  }

  GoToCharSpell(RulesetSpellID: number) {
    this.router.navigate(['/ruleset/spell-details', RulesetSpellID]);
  }
  GoToAssociateMonster(monsterTemplateId: number) {

    this.router.navigate(['/ruleset/monster-template-details', monsterTemplateId]);
  }
  GoToItems(Itemid: number) {

    this.router.navigate(['/ruleset/item-details', Itemid]);
  }

  deployMonster(monsterInfo) {
    this.bsModalRef = this.modalService.show(DeployMonsterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Quantity";
    this.bsModalRef.content.monsterInfo = monsterInfo;
    this.bsModalRef.content.rulesetId = this.ruleSetId
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
    this.bsModalRef.content.recordName = this.monsterTemplateDetail.ruleset.ruleSetName;
    this.bsModalRef.content.recordImage = this.monsterTemplateDetail.ruleset.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset'
    this.bsModalRef.content.isFromCampaignDetail = true;
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
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = cmd;
  }
}
