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
import { CreateLootPileComponent } from "../create-loot-pile/create-loot-pile.component";
import { GiveawayComponent } from "../../loot/giveaway/giveaway.component";
import { AddLootPileComponent } from "../add-loot-pile/add-loot-pile.component";
import { AppService1 } from "../../../app.service";
import { ServiceUtil } from "../../../core/services/service-util";

@Component({
  selector: 'app-loot-pile-details',
  templateUrl: './loot-pile-details.component.html',
  styleUrls: ['./loot-pile-details.component.scss']
})

export class LootPileDetailsComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  actionText: string;
  lootPileId: number;
  isDropdownOpen: boolean = false;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  ItemMasterDetail: any = new ItemMaster();
  RuleSet: any;
  lootPileItems: any[] = [];
  CurrencyTypesList = [];

  IsGm: boolean = false;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, public appService: AppService1,
    private itemMasterService: ItemMasterService, private rulesetService: RulesetService, public lootService: LootService,
    private location: PlatformLocation,
    private commonService: CommonService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => { this.lootPileId = params['id']; this.initialize(); });

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
      this.itemMasterService.getLootPile_Cache<any>(this.lootPileId)
        .subscribe(data => {
          if (data) {
            this.RuleSet = data.lootPileRuleSet;
            this.lootPileItems = data.lootPileItems;
            this.ItemMasterDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");
            this.isLoading = false;
            this.ItemMasterDetail.ruleSet = this.RuleSet;
            this.CurrencyTypesList = data.currencyTypesList;

            this.ItemMasterDetail.itemMasterLootCurrency = this.ItemMasterDetail.itemMasterLootCurrency ?
              (this.ItemMasterDetail.itemMasterLootCurrency.length > 0 ? this.ItemMasterDetail.itemMasterLootCurrency : data.currencyTypesList)
              : data.currencyTypesList;
          }
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
    itemMaster.lootPileItems = this.lootPileItems;

    let lootPileVM = {
      lootId: itemMaster.lootId, ruleSetId: itemMaster.ruleSetId, name: itemMaster.itemName,
      imageUrl: itemMaster.itemImage, description: itemMaster.itemVisibleDesc, metatags: itemMaster.metatags,
      visible: itemMaster.isVisible, itemList: itemMaster.lootPileItems, gmOnly: itemMaster.gmOnly,
      itemMasterLootCurrency: itemMaster.itemMasterLootCurrency
    }

    this.bsModalRef = this.modalService.show(CreateLootPileComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Loot Pile';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.lootPileVM = lootPileVM;
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
    this.bsModalRef.content.event.subscribe(data => {
      this.lootPileId = data.itemMasterId;
      this.initialize();
    });
  }

  duplicateItemTemplate(itemMaster: any) {
    this.itemMasterService.getLootItemCount(this.ruleSetId)
      .subscribe((data: any) => {
        //this.alertService.stopLoadingMessage();
        let LootCount = data.lootCount;
        let ItemMasterCount = data.itemMasterCount;
        if (LootCount < 200 && ItemMasterCount < 2000) {
          itemMaster.lootPileItems = this.lootPileItems;
          let lootPileVM = {
            ruleSetId: itemMaster.ruleSetId, name: itemMaster.itemName, imageUrl: itemMaster.itemImage,
            description: itemMaster.itemVisibleDesc, metatags: itemMaster.metatags, visible: itemMaster.isVisible,
            itemList: itemMaster.lootPileItems, itemMasterLootCurrency: itemMaster.itemMasterLootCurrency
          }

          this.bsModalRef = this.modalService.show(CreateLootPileComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Loot Pile';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.lootPileVM = lootPileVM;
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.fromDetail = true;
          this.bsModalRef.content.currencyTypesList = this.CurrencyTypesList;
        }
        else {

          if (ItemMasterCount >= 2000) {
            this.alertService.showMessage("The maximum number of records to create item template has been reached, 2,000. Please delete some item templates and try again.", "", MessageSeverity.error);
          } else if (LootCount >= 200) {
            this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
          }

        }
      }, error => { }, () => { });

  }

  deleteItemTemplate(itemMaster: ItemMaster) {
    let message = "Are you sure you want to delete the " + itemMaster.itemName
      + " Loot Pile and all items contained within?";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteItemTemplateHelper(itemMaster), null, 'Yes', 'No');
  }

  private deleteItemTemplateHelper(itemMaster: ItemMaster) {
    itemMaster.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Loot");


    this.lootService.deleteLootItem<any>(itemMaster)
      .subscribe(async (data) => {
        await this.commonService.deleteRecordFromIndexedDB("loot", 'ItemMaster', 'lootId', itemMaster, true);
        setTimeout(() => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
        }, 200);
        this.alertService.showMessage("Loot Pile has been deleted successfully.", "", MessageSeverity.success);
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
  GoToRuleBuff(RulesetBuffID: number) {
    this.router.navigate(['/ruleset/buff-effect-details', RulesetBuffID]);
  }

  Visible(item) {

    let visible = item.isVisible ? 'Hide' : 'Show';

    this.lootService.showLootPile<any>(item.lootId, !item.isVisible)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        item.isVisible = !item.isVisible;

        if (item.isVisible) {//if item is show send message to everyone chat "New loot is availabe"
          this.appService.updateChatWithLootMessage(true);
        }
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + visible, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
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

  Give(item) {
    this.bsModalRef = this.modalService.show(GiveawayComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.giveAwayItem = item;
    this.bsModalRef.content.lootPileItems = this.lootPileItems;
    this.bsModalRef.content.isLootPile = true;
    this.bsModalRef.content.event.subscribe(data => {
      if (data) {
        this.router.navigate(['/ruleset/loot', this.ruleSetId]);
      }
    });
    this.bsModalRef.content.currencyTypesList = ServiceUtil.DeepCopy(item.itemMasterLootCurrency);
  }

  addLootPileItem(lootPileDetail) {
    this.bsModalRef = this.modalService.show(AddLootPileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Loot';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.LootPileDetail = lootPileDetail;
    this.bsModalRef.content.itemMasterLootCurrency = ServiceUtil.DeepCopy(this.ItemMasterDetail.itemMasterLootCurrency);
  }

}
