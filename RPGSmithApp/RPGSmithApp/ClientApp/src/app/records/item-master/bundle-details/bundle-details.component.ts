import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ItemMaster } from "../../../core/models/view-models/item-master.model";
import { ConfigurationService } from "../../../core/common/configuration.service";
import { AlertService, DialogType, MessageSeverity } from "../../../core/common/alert.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { AuthService } from "../../../core/auth/auth.service";
import { SharedService } from "../../../core/services/shared.service";
import { CommonService } from "../../../core/services/shared/common.service";
import { RulesetService } from "../../../core/services/ruleset.service";
import { ItemMasterService } from "../../../core/services/item-master.service";
import { User } from "../../../core/models/user.model";
import { DBkeys } from "../../../core/common/db-keys";
import { Utilities } from "../../../core/common/utilities";
import { CreateItemMsterComponent } from "../create-item/create-item.component";
import { ImageViewerComponent } from "../../../shared/image-interface/image-viewer/image-viewer.component";
import { PlatformLocation } from "@angular/common";
import { Bundle } from "../../../core/models/view-models/bundle.model";

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
  bundleItems: any[]= [];


  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
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
      this.isLoading = true;
      this.itemMasterService.getBundleById<any[]>(this.bundleId)
        .subscribe(data => {

          this.bundleDetail = this.itemMasterService.bundleModelData(data, "UPDATE");
          let mod: any = data;
          this.bundleItems = mod.itemMasterBundleItems;
          //this.bundleDetail.forEach(function (val) { val.showIcon = false; });
          this.rulesetService.GetCopiedRulesetID(this.bundleDetail.ruleSetId, user.id).subscribe(data => {
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

  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  editItemTemplate(itemMaster: ItemMaster) {
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

  }

  duplicateItemTemplate(itemMaster: ItemMaster) {
    //// this.alertService.startLoadingMessage("", "Checking records");      
    //this.itemMasterService.getItemMasterCount(this.ruleSetId)
    //  .subscribe(data => {
    //    //this.alertService.stopLoadingMessage();
    //    if (data < 2000) {
    //      this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
    //        class: 'modal-primary modal-md',
    //        ignoreBackdropClick: true,
    //        keyboard: false
    //      });
    //      this.bsModalRef.content.title = 'Duplicate Item Template';
    //      this.bsModalRef.content.button = 'DUPLICATE';
    //      this.bsModalRef.content.fromDetail = true;
    //      this.bsModalRef.content.itemMasterVM = itemMaster;
    //      this.bsModalRef.content.rulesetID = this.ruleSetId;
    //    }
    //    else {
    //      //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
    //      this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
    //    }
    //  }, error => { }, () => { });

  }

  deleteItemTemplate(itemMaster: ItemMaster) {
    //let message = "Are you sure you want to delete this " + itemMaster.itemName
    //  + " item template? Note: Any item(s) previously deployed from this template will not be affected.";

    //this.alertService.showDialog(message,
    //  DialogType.confirm, () => this.deleteItemTemplateHelper(itemMaster), null, 'Yes', 'No');
  }

  private deleteItemTemplateHelper(itemMaster: ItemMaster) {
    itemMaster.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Item");

   
    this.itemMasterService.deleteItemMaster_up(itemMaster)
      .subscribe(
        data => {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
          }, 200);
          this.alertService.showMessage("Item Template has been deleted successfully.", "", MessageSeverity.success);
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


  useItemTemplate(itemMaster: any) {

    let msg = "The command value for " + itemMaster.itemName
      + " Item Template has not been provided. Edit this record to input one.";

    if (itemMaster.ItemMasterCommand == undefined || itemMaster.ItemMasterCommand == null) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useItemTemplateHelper(itemMaster));
    }
    else if (itemMaster.ItemMasterCommand.length == 0) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useItemTemplateHelper(itemMaster));
    }
    else {
      //TODO  
      //this.useItemTemplateHelper(itemMaster);
    }
  }

  private useItemTemplateHelper(itemMaster: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Use Item Template");
    setTimeout(() => {
    this.isLoading = false;
      this.alertService.stopLoadingMessage();
    }, 200);
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
}