import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { BuffAndEffect } from "../../../core/models/view-models/buff-and-effect.model";
import { AlertService, DialogType, MessageSeverity } from "../../../core/common/alert.service";
import { AuthService } from "../../../core/auth/auth.service";
import { ConfigurationService } from "../../../core/common/configuration.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { SharedService } from "../../../core/services/shared.service";
import { CommonService } from "../../../core/services/shared/common.service";
import { RulesetService } from "../../../core/services/ruleset.service";
import { PlatformLocation } from "@angular/common";
import { BuffAndEffectService } from "../../../core/services/buff-and-effect.service";
import { User } from "../../../core/models/user.model";
import { DBkeys } from "../../../core/common/db-keys";
import { Utilities } from "../../../core/common/utilities";
import { CreateBuffAndEffectsComponent } from "../../../shared/create-buff-and-effects/create-buff-and-effects.component";
import { ImageViewerComponent } from "../../../shared/image-interface/image-viewer/image-viewer.component";


@Component({
  selector: 'app-buff-and-effect-details',
  templateUrl: './buff-and-effect-details.component.html',
  styleUrls: ['./buff-and-effect-details.component.scss']
})

export class BuffAndEffectDetailsComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  isDropdownOpen: boolean = false;
  actionText: string;
  buffAndEffectId: number;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  buffAndEffectDetail: any = new BuffAndEffect();
  IsGm: boolean = false;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
    private buffAndEffectService: BuffAndEffectService, private rulesetService: RulesetService,
    private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.buffAndEffectId = params['id']; });
    this.sharedService.shouldUpdateBuffAndEffectList().subscribe(sharedServiceJson => {
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
      this.buffAndEffectService.getBuffAndEffectById<any>(this.buffAndEffectId)
        .subscribe(data => {

          if (data)
            this.buffAndEffectDetail = this.buffAndEffectService.BuffAndEffectsModelData(data, "UPDATE");
          if (!this.buffAndEffectDetail.ruleset) {
            this.buffAndEffectDetail.ruleset = data.ruleSet;
          }

          this.ruleSetId = this.buffAndEffectDetail.ruleSetId;
          this.rulesetService.GetCopiedRulesetID(this.buffAndEffectDetail.ruleSetId, user.id).subscribe(data => {
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

  editBuffAndEffect(buffAndEffect: BuffAndEffect) {
    this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Buff & Effect';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.buffAndEffectVM = buffAndEffect;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.event.subscribe(data => {
      this.buffAndEffectId = data.buffAndEffectId;
      this.initialize();
    });
  }

  duplicateBuffAndEffect(buffAndEffect: BuffAndEffect) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.buffAndEffectService.getBuffAndEffectsCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Buff & Effect';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.fromDetail = true;
          this.bsModalRef.content.buffAndEffectVM = buffAndEffect;
          this.bsModalRef.content.rulesetID = this.ruleSetId;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  

  deleteBuffAndEffect(buffAndEffect: BuffAndEffect) {
    let message = "Are you sure you want to delete this " + buffAndEffect.name
      + " Buff & Effect?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteBuffAndEffectHelper(buffAndEffect), null, 'Yes', 'No');
  }

  private deleteBuffAndEffectHelper(buffAndEffect: BuffAndEffect) {
    buffAndEffect.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting a Buff & Effect");

    this.buffAndEffectService.deleteBuffAndEffect_up(buffAndEffect)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Buff & Effect has been deleted successfully.", "", MessageSeverity.success);
          //this.initialize();
          //this.location.replaceState('/'); 
          this.router.navigate(['/ruleset/buff-effect', this.ruleSetId]);
         
          
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

  

  useBuffAndEffect(buffAndEffect: any) {

    let msg = "The command value for " + buffAndEffect.name
      + " Buff & Effect has not been provided. Edit this record to input one.";

    if (buffAndEffect.buffAndEffectCommand == undefined || buffAndEffect.buffAndEffectCommand == null) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useBuffAndEffectHelper(buffAndEffect));
    }
    else if (buffAndEffect.buffAndEffectCommand.length == 0) {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useBuffAndEffectHelper(buffAndEffect));
    }
    else {
      //TODO
      this.useBuffAndEffectHelper(buffAndEffect);
    }
  }

  private useBuffAndEffectHelper(buffAndEffect: any) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "TODO => Use Buff & Effect");
    //TODO- PENDING ACTION
    setTimeout(() => {
      this.isLoading = false;
      this.alertService.stopLoadingMessage();
    }, 200);
  }

  RedirectBack() {
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
