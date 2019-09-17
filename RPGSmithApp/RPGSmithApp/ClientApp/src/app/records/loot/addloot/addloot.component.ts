import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { Items } from '../../../core/models/view-models/items.model';
import { SharedService } from '../../../core/services/shared.service';
import { ItemsService } from '../../../core/services/items.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { VIEW } from '../../../core/models/enums';
import { LootService } from '../../../core/services/loot.service';
import { AppService1 } from '../../../app.service';
import { ServiceUtil } from '../../../core/services/service-util';

@Component({
  selector: 'app-addloot',
  templateUrl: './addloot.component.html',
  styleUrls: ['./addloot.component.scss']
})
export class AddlootComponent implements OnInit {
  isLoading = false;
  title: string;
  _view: string;
  characterId: number;
  rulesetId: number;
  itemsList: any;
  lootTemplateList: any
  characterItems: any;
  characterItemModal: any = new Items();
  searchText: string;
  showLootTemplates: boolean = false;
  selectedLootTemplates: any[] = []
  lootPileList: any[] = [];
  selectedLootPileItem: any[];
  isVisible: boolean = false;
  selectedLootPileID = -1;

  constructor(private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, private commonService: CommonService,
    private itemsService: ItemsService, private itemMasterService: ItemMasterService,
    private appService: AppService1, private lootService: LootService) {

  }

  ngOnInit() {
    setTimeout(() => {

      this.title = this.bsModalRef.content.title;
      this._view = this.bsModalRef.content.button;
      let _itemVM = this.bsModalRef.content.itemVM;
      this.characterItemModal = this.itemsService.itemModelData(_itemVM, this._view);
      this.characterId = this.characterItemModal.characterId;
      this.rulesetId = this.characterItemModal.rulesetId;
      this.characterItems = this.bsModalRef.content.characterItems;
      if (this.rulesetId == undefined)
        this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      ////////////////////////////////////////////////////////
      this.itemsService.getLootPilesListByRuleSetId<any>(this.rulesetId)
        .subscribe(data => {
          this.lootPileList = data;
          this.selectedLootPileItem = [];
          this.selectedLootPileItem.push(this.lootPileList[0]);
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => {
          this.itemMasterService.getItemMasterByRuleset_add<any>(this.rulesetId, true, true)//true
            .subscribe(data => {
              this.itemsList = data.ItemMaster;
              this.lootTemplateList = data.LootTemplate

              this.itemsList.forEach(function (val) { val.showIcon = false; val.selected = false; });
              this.lootTemplateList.forEach(function (val) { val.showIcon = false; val.selected = false; });
              this.isLoading = false;
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                this.authService.logout(true);
              }
            }, () => { });
        });
      ///////////////////////////////////////////////////////////

    }
  }
  setItemMaster(event: any, itemMaster: any) {
    //if (event.target.checked) {
    //    this.characterItemModal.multiItemMasters.push({ itemMasterId: itemMaster.itemMasterId });
    //}
    //else {
    //    this.characterItemModal.multiItemMasters
    //        .splice(this.characterItemModal.multiItemMasters.indexOf({ itemMasterId: itemMaster.itemMasterId }), 1);
    //}

    this.itemsList.map((item) => {
      if (item.itemMasterId == itemMaster.itemMasterId && item.isBundle == itemMaster.isBundle) {
        item.selected = event.target.checked;
      }
      return item;
    });
    this.lootTemplateList.map((item) => {
      if (item.lootTemplateId == itemMaster.lootTemplateId) {
        item.selected = event.target.checked;
      }
    });
    this.characterItemModal.itemMasterId = itemMaster.itemMasterId;
  }

  submitForm(itemMaster: any) {
    ////////////////////////////////////////////////////////////////////////
    this.selectedLootTemplates = [];

    let SelectedLootTemp = this.lootTemplateList.filter(x => x.selected == true);

    SelectedLootTemp.map((x) => {
      x.quantity = 1;

      var reItems = [];
      if (+x.quantity) {
        for (var i = 0; i < x.quantity; i++) {

          let currentItemsToDeploy = ServiceUtil.getItemsFromRandomizationEngine(x.lootTemplateRandomizationEngines, this.alertService);
          if (currentItemsToDeploy && currentItemsToDeploy.length) {
            currentItemsToDeploy.map((re) => {
              re.deployCount = i + 1;
              reItems.push(re);
            });
          }
        }
      }
      this.selectedLootTemplates.push({
        qty: x.quantity,
        lootTemplateId: x.lootTemplateId,
        rulesetId: x.ruleSetId,
        reitems: reItems
      });


    });
    //////////////////////////////////////////////////////////////////////////



    this.characterItemModal.multiItemMasterBundles = [];
    this.characterItemModal.multiItemMasters = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        //if (item.isBundle) {
        //  this.characterItemModal.multiItemMasterBundles.push({ itemMasterBundleId: item.itemMasterId });
        //}
        //else {
        this.characterItemModal.multiItemMasters.push({ iD: item.itemMasterId, isBundle: item.isBundle });
        //}
      }
      return item;
    })
    if ((this.characterItemModal.multiItemMasters == undefined && this.characterItemModal.multiItemMasterBundles.length == 0) && (this.selectedLootTemplates == undefined || this.selectedLootTemplates.length == 0)) {
      this.alertService.showMessage("Please select new Item Template or Loot Template to Add.", "", MessageSeverity.error);
    }
    else if ((this.characterItemModal.multiItemMasters.length == 0 && this.characterItemModal.multiItemMasterBundles.length == 0) && (this.selectedLootTemplates.length == 0)) {
      this.alertService.showMessage("Please select new Item Template or Loot Template to Add.", "", MessageSeverity.error);
    }
    else if (this.characterItemModal.multiItemMasters && this.characterItemModal.multiItemMasters.length != 0 && (this.selectedLootPileItem == undefined || this.selectedLootPileItem.length == 0)) {
      this.alertService.showMessage("Please select Drop to Loot Pile for selected Item Templates.", "", MessageSeverity.error);
    }
    else {
      if (this.characterItemModal.view === VIEW.DUPLICATE) {
        //this.duplicateAbility(ability);
      }
      else {
        //this.selectedLootPileID = -1;
        if (this.selectedLootPileItem && this.selectedLootPileItem.length) {
          this.selectedLootPileID = this.selectedLootPileItem[0].lootId
        }
        this.addEditItem(itemMaster, this.selectedLootTemplates, this.selectedLootPileID);
      }
    }
  }

  addEditItem(modal: any, lootTemplate, selectedLootPileId: number) {
    //console.log('modal data', modal.multiItemMasters);
    this.isLoading = true;
    this.itemMasterService.getLootItemCount(this.rulesetId)
      .subscribe((data: any) => {
        //this.alertService.stopLoadingMessage();
        let LootCount = data.lootCount;
        let selecteLootItems = 0;
        if (modal.multiItemMasters && modal.multiItemMasters.length) {
          selecteLootItems = modal.multiItemMasters.length;
        }
        if ((LootCount + selecteLootItems) < 200) {
          this.lootService.addLootItem(modal.multiItemMasters, lootTemplate, this.rulesetId, selectedLootPileId, this.isVisible, [])
            .subscribe(
              data => {
                //console.log(data);
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let message = "Loot(s) added successfully.";
                this.alertService.showMessage(message, "", MessageSeverity.success);
                this.bsModalRef.hide();
                this.sharedService.updateItemsList(true);
                //this.appService.updateChatWithLootMessage(true);
                if (selectedLootPileId == -1) {
                  if (this.isVisible) {
                    this.appService.updateChatWithLootMessage(true);
                  }
                }
                
              },
              error => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("Unable to Add", error);
                if (Errors.sessionExpire) {
                  this.authService.logout(true);
                }
                else
                  this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
              },
            );
        }
        else {
          this.isLoading = false;
          this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

  duplicateItem(modal: any) {
    this.isLoading = true;
    this.itemsService.duplicateItem(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Loot has been duplicated successfully.", "", MessageSeverity.success);
          this.bsModalRef.hide();
          this.sharedService.updateItemsList(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to Duplicate ", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

        });
  }
  close() {
    this.bsModalRef.hide();
  }

  ShowLootItems() {
    this.showLootTemplates = !this.showLootTemplates;
  }
  get lootItemsSettings() {
    return {
      primaryKey: "lootId",
      labelKey: "itemName",
      text: "Search Loot Pile",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "top"
    };
  }

  changeVisibility(event) {
    this.isVisible = event.target.checked;
  }

  AddToLootPile(event) {
    if (this.selectedLootPileItem && this.selectedLootPileItem.length) {
      this.selectedLootPileID = this.selectedLootPileItem[0].lootId
    }
    if (this.selectedLootPileID != -1) {
      this.isVisible = false;
    }
  }
}
