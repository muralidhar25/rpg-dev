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
import { ImageViewerComponent } from "../../../shared/image-interface/image-viewer/image-viewer.component";
import { PlatformLocation } from "@angular/common";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../../core/models/view-models/characters.model";
import { CreatelootComponent } from "../createloot/createloot.component";
import { LootService } from "../../../core/services/loot.service";

@Component({
  selector: 'app-loot-details',
  templateUrl: './loot-details.component.html',
  styleUrls: ['./loot-details.component.scss']
})

export class LootDetailsComponent implements OnInit {

    isLoading = false;
    showActions: boolean = true;
    actionText: string;
  LootId: number;
  isDropdownOpen: boolean = false;
    ruleSetId: number;
    bsModalRef: BsModalRef;
  ItemMasterDetail: any = new ItemMaster();
  RuleSet: any;

  IsGm: boolean = false;
    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService,
      private itemMasterService: ItemMasterService, private rulesetService: RulesetService, public lootService: LootService,
      private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
      this.route.params.subscribe(params => { this.LootId = params['id']; });
      
      this.sharedService.shouldUpdateItemMasterDetailList().subscribe(sharedServiceJson => {
        debugger
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
          if (user.isGm) {
            this.IsGm = user.isGm;
          }
            this.isLoading = true;
          this.itemMasterService.getlootById<any>(this.LootId)
              .subscribe(data => {
                console.log('data', data.ruleSet);
                if (data)
                  debugger;
                    this.RuleSet = data.ruleSet;
                    this.ItemMasterDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");     
                    //this.ItemMasterDetail.forEach(function (val) { val.showIcon = false; });
                    this.rulesetService.GetCopiedRulesetID(this.ItemMasterDetail.ruleSetId, user.id).subscribe(data => {

                      let id: any = data
                      
                        //this.ruleSetId = id;
                      this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
                      debugger
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
    
  editItemTemplate(itemMaster: any) {
    this.bsModalRef = this.modalService.show(CreatelootComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Loot';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.itemMasterVM = itemMaster;
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.event.subscribe(data => {
      this.LootId = data.itemMasterId;
      this.initialize();
    });
        
        
    }

    duplicateItemTemplate(itemMaster: ItemMaster) {
        // this.alertService.startLoadingMessage("", "Checking records");      
      this.bsModalRef = this.modalService.show(CreatelootComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Duplicate Loot';
      this.bsModalRef.content.button = 'DUPLICATE';
      this.bsModalRef.content.itemMasterVM = itemMaster;
      this.bsModalRef.content.rulesetID = this.ruleSetId;
      this.bsModalRef.content.fromDetail = true;
        
    }

    deleteItemTemplate(itemMaster: ItemMaster) {
        let message = "Are you sure you want to delete this " + itemMaster.itemName
            + " item template?";

        this.alertService.showDialog(message,
            DialogType.confirm, () => this.deleteItemTemplateHelper(itemMaster), null, 'Yes', 'No');
    }

    private deleteItemTemplateHelper(itemMaster: ItemMaster) {
        itemMaster.ruleSetId = this.ruleSetId;
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting Loot");


      this.lootService.deleteLootItem<any>(itemMaster)
        .subscribe(data => {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
          }, 200);
          this.alertService.showMessage("Loot has been deleted successfully.", "", MessageSeverity.success);
          //this.initialize();
          this.router.navigate(['/ruleset/loot', this.ruleSetId]);
        }, error => {
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

        })

        
    }


    useItemTemplate(itemMaster: any) {
        
        let msg = "The command value for " + itemMaster.itemName
          + " loot has not been provided. Edit this record to input one.";

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
        setTimeout(() => { this.isLoading = false; 
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

  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.recordName = this.RuleSet.ruleSetName;
    this.bsModalRef.content.recordImage = this.RuleSet.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset'
    this.bsModalRef.content.isFromCampaignDetail = true;
  }
}