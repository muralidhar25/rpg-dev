import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, DialogType, MessageSeverity } from "../../../core/common/alert.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { AuthService } from "../../../core/auth/auth.service";
import { SharedService } from "../../../core/services/shared.service";
import { RulesetService } from "../../../core/services/ruleset.service";
import { ItemMasterService } from "../../../core/services/item-master.service";
import { User } from "../../../core/models/user.model";
import { DBkeys } from "../../../core/common/db-keys";
import { Utilities } from "../../../core/common/utilities";
import { ImageViewerComponent } from "../../../shared/image-interface/image-viewer/image-viewer.component";
import { PlatformLocation } from "@angular/common";
import { Bundle } from "../../../core/models/view-models/bundle.model";
import { CreateBundleComponent } from "../create-bundle/create-bundle.component";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../../core/models/view-models/characters.model";

@Component({
  selector: 'app-bundle-details',
  templateUrl: './bundle-details.component.html',
  styleUrls: ['./bundle-details.component.scss']
})
export class BundleDetailsComponent implements OnInit {

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
    private itemMasterService: ItemMasterService, private rulesetService: RulesetService,
    private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.bundleId = params['id']; });
    this.sharedService.shouldUpdateItemMasterList().subscribe(sharedServiceJson => {
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
      this.itemMasterService.getBundleById_Cache<any[]>(this.bundleId)
        .subscribe(data => {
          if (data)
            this.bundleDetail = this.itemMasterService.bundleModelData(data, "UPDATE");
          let mod: any = data;
          this.bundleItems = mod.itemMasterBundleItems;
          this.isLoading = false;
          this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

          //this.bundleDetail.forEach(function (val) { val.showIcon = false; });

          //this.rulesetService.GetCopiedRulesetID(this.bundleDetail.ruleSetId, user.id).subscribe(data => {
          //  let id: any = data
          //  //this.ruleSetId = id;
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
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  editItemTemplate(bundle: Bundle) {
    //this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
    //this.bsModalRef.content.title = 'Edit Item Template';
    //this.bsModalRef.content.button = 'UPDATE';
    //this.bsModalRef.content.fromDetail = true;
    //this.bsModalRef.content.itemMasterVM = itemMaster;
    //this.bsModalRef.content.rulesetID = this.ruleSetId;
    //this.bsModalRef.content.event.subscribe(data => {
    //  this.bundleId = data.bundleId;
    //  this.initialize();
    //});
    this.bsModalRef = this.modalService.show(CreateBundleComponent, {
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
      value: bundle.value,
      volume: bundle.volume,
      totalWeight: bundle.totalWeight,
      metatags: bundle.metatags,
      rarity: bundle.rarity,
      //ruleSet : this.RuleSet,
      weightLabel: bundle.weightLabel,
      currencyLabel: bundle.currencyLabel,
      volumeLabel: bundle.volumeLabel
    };
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.event.subscribe(data => {
      this.bundleId = data.bundleId;
      this.initialize();
    });
  }

  duplicateItemTemplate(bundle: Bundle) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.itemMasterService.getItemMasterCount(this.ruleSetId)
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
          this.bsModalRef = this.modalService.show(CreateBundleComponent, {
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
            value: bundle.value,
            volume: bundle.volume,
            totalWeight: bundle.totalWeight,
            metatags: bundle.metatags,
            rarity: bundle.rarity,
            //ruleSet: this.RuleSet,
            weightLabel: bundle.weightLabel,
            currencyLabel: bundle.currencyLabel,
            volumeLabel: bundle.volumeLabel
          };
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteItemTemplate(bundle: Bundle) {
    let message = "Are you sure you want to delete this " + bundle.bundleName
      + " item template? Note: Any item(s) previously deployed from this template will not be affected.";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteItemTemplateHelper(bundle), null, 'Yes', 'No');
  }

  private deleteItemTemplateHelper(bundle: Bundle) {
    bundle.ruleSetId = this.ruleSetId;
    this.isLoading = true;

    this.alertService.startLoadingMessage("", "Deleting Bundle");

    this.itemMasterService.deleteBundle(bundle)
      .subscribe(
        data => {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
          }, 200);
          this.alertService.showMessage("Bundle has been deleted successfully.", "", MessageSeverity.success);
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
