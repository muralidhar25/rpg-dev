import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, DialogType, MessageSeverity } from "../../../core/common/alert.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { AuthService } from "../../../core/auth/auth.service";
import { SharedService } from "../../../core/services/shared.service";
import { RulesetService } from "../../../core/services/ruleset.service";
import { User } from "../../../core/models/user.model";
import { DBkeys } from "../../../core/common/db-keys";
import { Utilities } from "../../../core/common/utilities";
import { ImageViewerComponent } from "../../../shared/image-interface/image-viewer/image-viewer.component";
import { PlatformLocation } from "@angular/common";
import { Bundle } from "../../../core/models/view-models/bundle.model";
import { MonsterTemplateService } from "../../../core/services/monster-template.service";
import { CreateMonsterGroupComponent } from "../moster-group/monster-group.component";
import { DeployMonsterComponent } from "../deploy-monster/deploy-monster.component";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../../core/models/view-models/characters.model";

@Component({
  selector: 'app-monster-bundle-details',
  templateUrl: './monster-bundle-details.component.html',
  styleUrls: ['./monster-bundle-details.component.scss']
})
export class MonsterBundleDetailsComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  actionText: string;
  bundleId: number;
  isDropdownOpen: boolean = false;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  bundleDetail: any = new Bundle();
  bundleItems: any[] = [];
  IsGm: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService,
    private monsterTemplateService: MonsterTemplateService, private rulesetService: RulesetService,
    private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.bundleId = params['id']; });
    this.sharedService.shouldUpdateMonsterTemplateList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
    });
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
      this.monsterTemplateService.getBundleById_Cache<any[]>(this.bundleId)
        .subscribe(data => {
          if (data)
            this.bundleDetail = this.monsterTemplateService.bundleModelData(data, "UPDATE");
          let mod: any = data;
          this.bundleItems = mod.monsterTemplateBundleItems;

          this.isLoading = false;
          this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

          //this.bundleDetail.forEach(function (val) { val.showIcon = false; });

          //////this.rulesetService.GetCopiedRulesetID(this.bundleDetail.ruleSetId, user.id).subscribe(data => {
          //////  let id: any = data
          //////  //this.ruleSetId = id;
          //////  this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          //////  this.isLoading = false;
          //////}, error => {
          //////  this.isLoading = false;
          //////  let Errors = Utilities.ErrorDetail("", error);
          //////  if (Errors.sessionExpire) {
          //////    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          //////    this.authService.logout(true);
          //////  }
          //////}, () => { });


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

  editMonsterTemplate(bundle: Bundle) {
    this.bsModalRef = this.modalService.show(CreateMonsterGroupComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Bundle';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.bundleVM = {
      bundleId: bundle.bundleId,
      ruleSetId: this.ruleSetId,
      bundleName: bundle.bundleName,
      bundleImage: bundle.bundleImage,
      bundleVisibleDesc: bundle.bundleVisibleDesc,

      metatags: bundle.metatags,
      addToCombat: bundle.addToCombat

    };
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.event.subscribe(data => {
      this.bundleId = data.bundleId;
      this.initialize();
    });
  }

  duplicateMonsterTemplate(bundle: Bundle) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.monsterTemplateService.getMonsterTemplateCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          //this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
          //  class: 'modal-primary modal-md',
          //  ignoreBackdropClick: true,
          //  keyboard: false
          //});
          //this.bsModalRef.content.title = 'Duplicate Item Template';
          //this.bsModalRef.content.button = 'DUPLICATE';
          //this.bsModalRef.content.fromDetail = true;
          //this.bsModalRef.content.itemMasterVM = itemMaster;
          //this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef = this.modalService.show(CreateMonsterGroupComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Edit Bundle';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef.content.bundleVM = {
            bundleId: bundle.bundleId,
            ruleSetId: this.ruleSetId,
            bundleName: bundle.bundleName,
            bundleImage: bundle.bundleImage,
            bundleVisibleDesc: bundle.bundleVisibleDesc,
            metatags: bundle.metatags,
            addToCombat: bundle.addToCombat
          };
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteMonsterTemplate(bundle: Bundle) {
    let message = "Are you sure you want to delete this " + bundle.bundleName
      + " item template? Note: Any item(s) previously deployed from this template will not be affected.";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteMonsterTemplateHelper(bundle), null, 'Yes', 'No');
  }

  private deleteMonsterTemplateHelper(bundle: Bundle) {
    bundle.ruleSetId = this.ruleSetId;
    this.isLoading = true;

    this.alertService.startLoadingMessage("", "Deleting Group");

    this.monsterTemplateService.deleteBundle(bundle)
      .subscribe(
        data => {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
          }, 200);
          this.alertService.showMessage("Group has been deleted successfully.", "", MessageSeverity.success);
          //this.initialize();
          this.router.navigate(['/ruleset/item-master', this.ruleSetId]);
        },
        error => {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
          }, 200);
          let _message = "Unable to Delete";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });



  }



  RedirectBack() {
    // this.router.navigate(['/ruleset/item-master', this.ruleSetId]);
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
  deployMonster(monsterInfo) {
    monsterInfo.isBundle = true;
    this.bsModalRef = this.modalService.show(DeployMonsterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Quantity";
    this.bsModalRef.content.monsterInfo = monsterInfo;
    this.bsModalRef.content.bundleItems = this.bundleItems
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
    this.bsModalRef.content.recordName = this.bundleDetail.ruleset.ruleSetName;
    this.bsModalRef.content.recordImage = this.bundleDetail.ruleset.imageUrl;
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
