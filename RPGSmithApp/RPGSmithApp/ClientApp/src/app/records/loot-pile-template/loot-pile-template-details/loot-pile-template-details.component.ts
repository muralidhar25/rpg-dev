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
import { LootService } from "../../../core/services/loot.service";
import { CreateLootPileTemplateComponent } from "../create-loot-pile-template/create-loot-pile-template.component";
import { ServiceUtil } from "../../../core/services/service-util";

@Component({
  selector: 'app-loot-pile-template-details',
  templateUrl: './loot-pile-template-details.component.html',
  styleUrls: ['./loot-pile-template-details.component.scss']
})

export class LootPileTemplateDetailsComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  actionText: string;
  lootTemplateId: number;
  isDropdownOpen: boolean = false;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  ItemMasterDetail: any = new ItemMaster();
  RuleSet: any;
  CurrencyTypesList = [];

  IsGm: boolean = false;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService,
    private rulesetService: RulesetService, public lootService: LootService,
    private location: PlatformLocation,
    private commonService: CommonService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.lootTemplateId = params['id']; this.initialize(); });

    this.sharedService.shouldUpdateItemMasterDetailList().subscribe(sharedServiceJson => {

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
      this.lootService.getTemplateDetailById_Cache<any>(this.lootTemplateId)
        .subscribe(data => {
          if (data) {
            this.RuleSet = data.ruleSet;
            this.ItemMasterDetail = data;
            this.CurrencyTypesList = data.currencyType;

            this.ItemMasterDetail.lootTemplateCurrency = this.ItemMasterDetail.lootTemplateCurrency ?
              (this.ItemMasterDetail.lootTemplateCurrency.length > 0 ? this.ItemMasterDetail.lootTemplateCurrency : this.ItemMasterDetail.currencyType)
              : this.ItemMasterDetail.currencyType;

            //LootTemplateCurrency
            //this.ItemMasterDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");
          }
          this.isLoading = false;
          this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

          ////this.rulesetService.GetCopiedRulesetID(this.ItemMasterDetail.ruleSetId, user.id)
          ////  .subscribe(data => {
          ////    let id: any = data
          ////    this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
          ////    this.isLoading = false;
          ////  }, error => {
          ////    this.isLoading = false;
          ////    let Errors = Utilities.ErrorDetail("", error);
          ////    if (Errors.sessionExpire) {
          ////      //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          ////      this.authService.logout(true);
          ////    }
          ////  }, () => { });

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
    this.bsModalRef = this.modalService.show(CreateLootPileTemplateComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Random Loot';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.lootPileVM = itemMaster;
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
    //this.bsModalRef.content.event.subscribe(data => {
    //  this.lootTemplateId = data.itemMasterId;
    //  this.initialize();
    //});


  }

  duplicateItemTemplate(itemMaster: any) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.bsModalRef = this.modalService.show(CreateLootPileTemplateComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Duplicate Random Loot';
    this.bsModalRef.content.button = 'DUPLICATE';
    this.bsModalRef.content.lootPileVM = itemMaster;
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;

  }

  deleteItemTemplate(itemMaster: any) {
    let message = "Are you sure you want to delete this " + itemMaster.name
      + " Random Loot?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteItemTemplateHelper(itemMaster), null, 'Yes', 'No');
  }

  private deleteItemTemplateHelper(itemMaster: any) {
    itemMaster.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Random Loot");


    this.lootService.deleteLootPileTemplate<any>(itemMaster.lootTemplateId)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("randomLoot", 'lootTemplates', 'lootTemplateId', itemMaster, true);
        setTimeout(() => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
        }, 200);
        this.alertService.showMessage("Random Loot has been deleted successfully.", "", MessageSeverity.success);
        //this.initialize();        
        this.router.navigate(['/ruleset/loot-pile-template', itemMaster.ruleSetId]);
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

  redirectToItem(itemId: number) {
    if (itemId) {
      this.router.navigate(['/ruleset/loot-details', itemId]);
      //this.sharedService.updateItemsList({ onPage: false });
    }
  }

  Show(item) {
    let show = item.isShow ? 'Hide' : 'Show';

    this.lootService.showLoot<any>(item.lootTemplateId, !item.isShow)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        item.isShow = !item.isShow;
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + show, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  DeployLootPile(item) {
    let lootToDeploy = [];
    var reItems = [];
    let r_engine = ServiceUtil.GetRandomizationEngineForMultipleItemSelection(item.lootTemplateRandomizationEngines);
    let currentItemsToDeploy = ServiceUtil.getItemsFromRandomizationEngine_WithMultipleSeletion(r_engine, this.alertService);
    if (currentItemsToDeploy && currentItemsToDeploy.length) {
      currentItemsToDeploy.map((re) => {
        re.deployCount = 1;
        reItems.push(re);
      });
    }

    lootToDeploy.push({
      qty: 1,
      lootTemplateId: item.lootTemplateId,
      rulesetId: item.ruleSetId,
      reitems: reItems
    });


    this.alertService.startLoadingMessage("", "Deploying Random Loot");

    this.lootService.deployToLoot<any>(lootToDeploy)
      .subscribe(data => {
        setTimeout(() => {
          this.alertService.stopLoadingMessage();
        }, 200);
        this.alertService.showMessage("Loot Pile " + item.name + " Has Been Deployed", "", MessageSeverity.success);

      }, error => {
        setTimeout(() => {
          this.alertService.stopLoadingMessage();
        }, 200);
        let _message = "Unable to Deploy";
        let Errors = Utilities.ErrorDetail(_message, error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
        else {
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        }
      });

  }

  GotoCommand(cmd) {
    // TODO get Char ID
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
