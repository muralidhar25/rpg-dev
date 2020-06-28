import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, DialogType, MessageSeverity } from "../../core/common/alert.service";
import { AuthService } from "../../core/auth/auth.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { PageLastViewsService } from "../../core/services/pagelast-view.service";
import { SharedService } from "../../core/services/shared.service";
import { ItemMasterService } from "../../core/services/item-master.service";
import { User } from "../../core/models/user.model";
import { DBkeys } from "../../core/common/db-keys";
import { Utilities } from "../../core/common/utilities";
import { AddItemMasterComponent } from "./add-item/add-item.component";
import { CreateItemMsterComponent } from "./create-item/create-item.component";
import { ItemMaster } from "../../core/models/view-models/item-master.model";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { AppService1 } from "../../app.service";
import { CreateBundleComponent } from "./create-bundle/create-bundle.component";
import { Bundle } from "../../core/models/view-models/bundle.model";
import { VIEW } from "../../core/models/enums";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";
import { DeleteTemplatesComponent } from "./delete-templates/delete-templates.component";
import { ServiceUtil } from "../../core/services/service-util";
import { CommonService } from "../../core/services/shared/common.service";

@Component({
  selector: 'app-item',
  templateUrl: './item-master.component.html',
  styleUrls: ['./item-master.component.scss']
})

export class ItemMasterComponent implements OnInit {

  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
  ruleSetId: number;
  ItemMasterList: any;
  RuleSet: any;
  pageLastView: any;
  noRecordFound: boolean = false;
  page: number = 1;
  scrollLoading: boolean = false;
  pageSize: number = 28;
  timeoutHandler: any;
  offset = (this.page - 1) * this.pageSize;
  backURL: string = '/rulesets';
  IsGm: boolean = false;
  searchText: string;
  actualItems: any;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private pageLastViewsService: PageLastViewsService,
    private sharedService: SharedService, private itemMasterService: ItemMasterService, public appService: AppService1,
    private commonService: CommonService) {
    this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
    let isNewTab = false;
    let url = this.router.url.toLowerCase();
    if (url && url.split('?') && url.split('?')[1]) {
      let serachParams = new URLSearchParams(url.split('?')[1]);
      isNewTab = (serachParams.get("l") === "1");
    }
    if (isNewTab) {
      this.appService.updateOpenWindowInNewTab(true);
      if (this.ruleSetId) {
        let RuleSetID = ServiceUtil.DecryptID(this.ruleSetId);
        this.ruleSetId = +RuleSetID;
        let displayURL = '/ruleset/item-master';
        let originalURl = '/ruleset/item-master/' + RuleSetID;
        Utilities.RedriectToPageWithoutId(originalURl, displayURL, this.router, 1);
      }
    }

    this.sharedService.shouldUpdateItemMasterList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        this.page = 1;
        this.pageSize = 28;
        this.upadteIndexedDB();
      }
    });

    this.appService.shouldUpdateFilterSearchRecords().subscribe(filterBy => {
      this.searchText = filterBy;
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
    //this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
    this.setRulesetId(this.ruleSetId);
    this.destroyModalOnInit();
    this.initialize();
    this.showActionButtons(this.showActions);
  }

  upadteIndexedDB() {
    this.isLoading = true;
    this.itemMasterService.getItemMasterByRuleset_spWithPagination_Cache<any>(this.ruleSetId, 1, 9999)
      .subscribe(async (data) => {
        await this.commonService.updateObjectStore("itemTemplates", data);
        this.initialize();

        //this.isLoading = false;
      }, error => {
        this.isLoading = false;
      }, () => { });
  }

  private async initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
        this.backURL = '/ruleset/campaign-details/' + this.ruleSetId;
      } else {
        this.backURL = '/ruleset/ruleset-details/' + this.ruleSetId;
      }

      await this.getDataFromIndexedDB();

      //this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'ItemMaster')
      //  .subscribe(data => {
      //    // if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      //    if (data !== null) {
      //      if (data.viewType == 'List') {
      //        this.isListView = true;
      //        this.isDenseView = false;
      //      }
      //      else if (data.viewType == 'Dense') {
      //        this.isDenseView = true;
      //        this.isListView = false;
      //      }
      //      else {
      //        this.isListView = false;
      //        this.isDenseView = false;
      //      }
      //    }

      //  }, error => {
      //    let Errors = Utilities.ErrorDetail("", error);
      //    if (Errors.sessionExpire) {
      //      this.authService.logout(true);
      //    }
      //  });
    }
  }

  redirectBackURL() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
        this.localStorage.localStorageSetItem(DBkeys.IsBackButton, "false");
        this.router.navigate(['/ruleset/campaign-details/' + this.ruleSetId]);
      } else {
        this.localStorage.localStorageSetItem(DBkeys.IsBackButton, "false");
        this.router.navigate(['/ruleset/ruleset-details/' + this.ruleSetId]);
      }
    }
  }

  onScroll(isAutoScroll: boolean = true) {
    //if (this.actualItems && this.pageSize < this.actualItems.length) {

    //  if (isAutoScroll) {
    //    this.scrollLoading = true;
    //  }
    //  this.pageSize += 28;
    //  this.ItemMasterList = this.actualItems.slice(0, this.pageSize);
    //  this.scrollLoading = false;
    //}

    ++this.page;

    if (isAutoScroll) {
      this.scrollLoading = true;
    }

    this.itemMasterService.getItemMasterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {

        var _ItemMaster = data.ItemMaster;
        for (var i = 0; i < _ItemMaster.length; i++) {
          _ItemMaster[i].showIcon = false;
          this.ItemMasterList.push(_ItemMaster[i]);
        }
        this.scrollLoading = false;

      }, error => {
        this.isLoading = false;
        this.scrollLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });

  }


  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  showListView(view: boolean) {
    this.isListView = view;
    this.isDenseView = false;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'ItemMaster',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.itemMasterService.createPageLastViewsItemMasterTemplate<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }
  showDenseview(view: boolean) {
    this.isListView = false;
    this.isDenseView = view;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'ItemMaster',
      viewType: 'Dense',
      UserId: user.id
    }

    this.itemMasterService.createPageLastViewsItemMasterTemplate<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isDenseView = data.viewType == 'Dense' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
    setTimeout(() => {
      if (window.innerHeight > document.body.clientHeight) {
        this.onScroll(false);
      }
    }, 10)
  }

  addItem() {

    this.bsModalRef = this.modalService.show(AddItemMasterComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  manageIcon(id: number) {
    this.ItemMasterList.forEach(function (val) {
      if (id === val.itemMasterId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    });
  }

  createItem() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.itemMasterService.getItemMasterCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create Item Template';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.itemMasterVM = {
            ruleSetId: this.ruleSetId,
            ruleSet: this.RuleSet
          };
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });


  }

  editItemTemplate(itemMaster: ItemMaster) {

    if (itemMaster.isBundle) {
      this.bsModalRef = this.modalService.show(CreateBundleComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Bundle';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.rulesetID = this.ruleSetId;
      this.bsModalRef.content.bundleVM = {
        bundleId: itemMaster.itemMasterId,
        ruleSetId: this.ruleSetId,
        bundleName: itemMaster.itemName,
        bundleImage: itemMaster.itemImage,
        bundleVisibleDesc: itemMaster.itemVisibleDesc,
        gmOnly: itemMaster.gmOnly,
        value: itemMaster.value,
        volume: itemMaster.volume,
        totalWeight: itemMaster.weight,
        metatags: itemMaster.metatags,
        rarity: itemMaster.rarity,
        ruleSet: this.RuleSet,
        weightLabel: itemMaster.weightLabel,
        currencyLabel: itemMaster.currencyLabel,
        volumeLabel: itemMaster.volumeLabel
      };
    }
    else {
      this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
        class: 'modal-primary modal-custom',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Edit Item Template';
      this.bsModalRef.content.button = 'UPDATE';
      this.bsModalRef.content.itemMasterVM = itemMaster;

      this.bsModalRef.content.rulesetID = this.ruleSetId;

      this.bsModalRef.content.event.subscribe(data => {
        if (data) {
          this.searchText = "";
        }
      });
    }



  }

  duplicateItemTemplate(itemMaster: ItemMaster) {

    // this.alertService.startLoadingMessage("", "Checking records");      
    this.itemMasterService.getItemMasterCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          if (itemMaster.isBundle) {
            this.bsModalRef = this.modalService.show(CreateBundleComponent, {
              class: 'modal-primary modal-custom',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.title = 'Edit Bundle';
            this.bsModalRef.content.button = 'DUPLICATE';
            this.bsModalRef.content.rulesetID = this.ruleSetId;
            this.bsModalRef.content.bundleVM = {
              bundleId: itemMaster.itemMasterId,
              ruleSetId: this.ruleSetId,
              bundleName: itemMaster.itemName,
              bundleImage: itemMaster.itemImage,
              bundleVisibleDesc: itemMaster.itemVisibleDesc,
              gmOnly: itemMaster.gmOnly,
              value: itemMaster.value,
              volume: itemMaster.volume,
              totalWeight: itemMaster.weight,
              metatags: itemMaster.metatags,
              rarity: itemMaster.rarity,
              ruleSet: this.RuleSet,
              weightLabel: itemMaster.weightLabel,
              currencyLabel: itemMaster.currencyLabel,
              volumeLabel: itemMaster.volumeLabel
            };
          }
          else {
            this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
              class: 'modal-primary modal-custom',
              ignoreBackdropClick: true,
              keyboard: false
            });
            this.bsModalRef.content.title = 'Duplicate Item Template';
            this.bsModalRef.content.button = 'DUPLICATE';
            this.bsModalRef.content.itemMasterVM = itemMaster;
            this.bsModalRef.content.rulesetID = this.ruleSetId;
          }
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteItemTemplate(itemMaster: ItemMaster) {

    let message = "Are you sure you want to delete this " + itemMaster.itemName
      + " item template? Note: Any item(s) previously deployed from this template will not be affected.";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteItemTemplateHelper(itemMaster), null, 'Yes', 'No');
  }

  private deleteItemTemplateHelper(itemMaster: ItemMaster) {
    itemMaster.ruleSetId = this.ruleSetId;
    this.isLoading = true;
    if (itemMaster.isBundle) {
      this.alertService.startLoadingMessage("", "Deleting Bundle");
      let bundleObj: Bundle = new Bundle(
        itemMaster.itemMasterId, itemMaster.ruleSetId, itemMaster.itemName, itemMaster.itemImage, itemMaster.itemVisibleDesc, itemMaster.value,
        itemMaster.volume, itemMaster.weight, new Ruleset(), VIEW.ADD, '', itemMaster.metatags, itemMaster.rarity, '', '', [], false, itemMaster.gmOnly
      );
      this.itemMasterService.deleteBundle(bundleObj)
        .subscribe(
          data => {
            setTimeout(() => {
              this.isLoading = false;
              this.alertService.stopLoadingMessage();
            }, 200);
            this.alertService.showMessage("Bundle has been deleted successfully.", "", MessageSeverity.success);
            this.ItemMasterList = this.ItemMasterList.filter((val) => val.itemMasterId != itemMaster.itemMasterId);
            this.updateDB(this.ItemMasterList);
            try {
              this.noRecordFound = !this.ItemMasterList.length;
            } catch (err) { }
            //this.initialize();
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
    else {
      this.alertService.startLoadingMessage("", "Deleting Item");

      //this.itemMasterService.deleteItemMaster(itemMaster.itemMasterId)
      //    .subscribe(
      //        data => {
      //            setTimeout(() => {
      //                this.isLoading = false;
      //                this.alertService.stopLoadingMessage();}, 200);
      //            this.alertService.showMessage("Item Template has been deleted successfully.", "", MessageSeverity.success);
      //            this.ItemMasterList = this.ItemMasterList.filter((val) => val.itemMasterId != itemMaster.itemMasterId);
      //            try {
      //                this.noRecordFound = !this.ItemMasterList.length;
      //            } catch (err) { }
      //            //this.initialize();
      //        },
      //        error => {
      //            setTimeout(() => {
      //                this.isLoading = false;
      //                this.alertService.stopLoadingMessage(); }, 200);
      //            let _message = "Unable to Delete";
      //            let Errors = Utilities.ErrorDetail(_message, error);
      //            if (Errors.sessionExpire) {
      //                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
      //                this.authService.logout(true);
      //            }
      //            else
      //                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      //        });

      this.itemMasterService.deleteItemMaster_up(itemMaster)
        .subscribe(
          data => {
            setTimeout(() => {
              this.isLoading = false;
              this.alertService.stopLoadingMessage();
            }, 200);
            this.alertService.showMessage("Item Template has been deleted successfully.", "", MessageSeverity.success);
            this.ItemMasterList = this.ItemMasterList.filter((val) => val.itemMasterId != itemMaster.itemMasterId);
            try {
              this.noRecordFound = !this.ItemMasterList.length;
            } catch (err) { }
            //this.initialize();
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

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  }

  public clickAndHold(item: any) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  public editRecord(record: any) {
    this.timeoutHandler = setInterval(() => {
      this.editItemTemplate(record);
    }, 1000);
  }
  private setHeaderValues(ruleset: Ruleset): any {
    try {
      let headerValues = {
        headerName: ruleset.ruleSetName,
        headerImage: ruleset.imageUrl ? ruleset.imageUrl : 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png',
        headerId: ruleset.ruleSetId,
        headerLink: 'ruleset',
        hasHeader: true
      };
      this.appService.updateAccountSetting1(headerValues);
      this.sharedService.updateAccountSetting(headerValues);
      this.localStorage.deleteData(DBkeys.HEADER_VALUE);
      this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
    } catch (err) { }
  }
  createBundle() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.itemMasterService.getItemMasterCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.bsModalRef = this.modalService.show(CreateBundleComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create Bundle';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.bundleVM = {
            ruleSetId: this.ruleSetId,
            ruleSet: this.RuleSet
          };
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });


  }
  GoToDetails(item: ItemMaster) {
    if (item.isBundle) {
      this.router.navigate(['/ruleset/bundle-details', item.itemMasterId]);
    }
    else {
      this.router.navigate(['/ruleset/item-details', item.itemMasterId]);
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

  DeleteTemplate() {
    this.bsModalRef = this.modalService.show(DeleteTemplatesComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
  }

  onSearch() {
    ++this.page;
    this.itemMasterService.getItemMasterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(data => {
        let count = 0;
        var _ItemMaster = data.ItemMaster;
        for (var i = 0; i < _ItemMaster.length; i++) {
          _ItemMaster[i].showIcon = false;
          this.ItemMasterList.push(_ItemMaster[i]);

          count += 1;
          if (count == _ItemMaster.length - 1) {
            this.onSearch();
          }

        }

      }, error => { });

  }

  async getDataFromIndexedDB() {
    const request = await window.indexedDB.open(DBkeys.IndexedDB, DBkeys.IndexedDBVersion);
    const ruleSetId = this.localStorage.getDataObject(DBkeys.RULESET_ID) ? parseFloat(this.localStorage.getDataObject(DBkeys.RULESET_ID)) : -1;
    const that = this;

    request.onsuccess = function (event) {
      const db = event.target['result'];

      if (db.objectStoreNames) {
        let campaignObjectStore = db.transaction("campaign", "readwrite").objectStore("campaign");

        let request = campaignObjectStore.get(ruleSetId);

        request.onerror = function (event) {
          console.log("[data retrieve error]");
        };

        request.onsuccess = async function (event) {
          let result = event.target.result;
          if (result && result.itemTemplates && result.itemTemplates.ItemMaster && result.itemTemplates.ItemMaster.length) {
            await that.getItemTemplateData(result.itemTemplates);
            setTimeout(() => {
              that.getData(result.itemTemplates.ItemMaster);
            }, 1000);
          } else {
            //hit api
            that.getDataFromAPI();
          }
        }
      }
    }
  }

  getDataFromAPI() {
    this.isLoading = true;
    this.itemMasterService.getItemMasterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
      .subscribe(async (data) => {
        await this.getItemTemplateData(data);
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => {

        this.onSearch();

        setTimeout(() => {
          if (window.innerHeight > document.body.clientHeight) {
            this.onScroll(false);
          }
        }, 10)
      });
  }

  getItemTemplateData(data) {
    if (data) {
      this.actualItems = data.ItemMaster;
      this.ItemMasterList = Utilities.responseData(data.ItemMaster, this.pageSize);
      this.ItemMasterList.forEach(function (val) { val.showIcon = false; });
    }

    if (data.ViewType) {
      if (data.ViewType.viewType == 'List') {
        this.isListView = true;
        this.isDenseView = false;
      }
      else if (data.ViewType.viewType == 'Dense') {
        this.isDenseView = true;
        this.isListView = false;
      }
      else {
        this.isListView = false;
        this.isDenseView = false;
      }
    }

    this.RuleSet = data.RuleSet;
    this.setHeaderValues(this.RuleSet);
    try {
      this.noRecordFound = !data.ItemMaster.length;
    } catch (err) { }
    this.isLoading = false;
  }


  getData(data) {
    if (data) {
      this.pageSize += 200;
      this.ItemMasterList = data.slice(0, this.pageSize)
    }
    if (this.pageSize < data.length) {
      setTimeout(() => {
        this.getData(data);
      }, 2000);
    }

  }

  async updateDB(itemTemplates) {
    const request = await window.indexedDB.open(DBkeys.IndexedDB, DBkeys.IndexedDBVersion);
    const ruleSetId = this.localStorage.getDataObject(DBkeys.RULESET_ID) ? parseFloat(this.localStorage.getDataObject(DBkeys.RULESET_ID)) : -1;
    const that = this;

    request.onsuccess = function (event) {
      const db = event.target['result'];

      if (db.objectStoreNames) {
        let campaignObjectStore = db.transaction("campaign", "readwrite").objectStore("campaign");

        let request = campaignObjectStore.get(ruleSetId);

        request.onerror = function (event) {
          console.log("[data retrieve error]");
        };

        request.onsuccess = async function (event) {
          let result = event.target.result;
          if (result && result.itemTemplates && result.itemTemplates.ItemMaster && result.itemTemplates.ItemMaster.length) {
            result.itemTemplates.ItemMaster = itemTemplates;
            that.commonService.updateObjectStore('itemTemplates', result.itemTemplates);
          }
        }
      }
    }
  }

}
