import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
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

@Component({
    selector: 'app-item',
    templateUrl: './item-master.component.html',
    styleUrls: ['./item-master.component.scss']
})

export class ItemMasterComponent implements OnInit {

    isLoading = false;
    isListView: boolean = false;
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

    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService, 
        public modalService: BsModalService, private localStorage: LocalStoreManager, private pageLastViewsService: PageLastViewsService,
      private sharedService: SharedService, private itemMasterService: ItemMasterService, public appService: AppService1
    ) {
        this.sharedService.shouldUpdateItemMasterList().subscribe(sharedServiceJson => {
            if (sharedServiceJson) {
                this.page = 1;
                this.pageSize = 28;
                this.initialize();
            }
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
        this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
        this.setRulesetId(this.ruleSetId);
        this.destroyModalOnInit();
        this.initialize();
      this.showActionButtons(this.showActions);      
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            this.itemMasterService.getItemMasterByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
                .subscribe(data => {                    
                    this.ItemMasterList = Utilities.responseData(data.ItemMaster, this.pageSize);
                    this.ItemMasterList.forEach(function (val) { val.showIcon = false; });
                  this.RuleSet = data.RuleSet;
                  this.setHeaderValues(this.RuleSet);
                    try {
                        this.noRecordFound = !data.ItemMaster.length;
                    } catch (err) { }
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                }, () => { });

            this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'ItemMaster')
                .subscribe(data => {
                    if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
                }, error => {
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                });
        }
    }

    onScroll() {

        ++this.page;
        this.scrollLoading = true;

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
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

        this.pageLastView = {
            pageName: 'ItemMaster',
            viewType: this.isListView ? 'List' : 'Grid',
            UserId: user.id
        }

        this.pageLastViewsService.createPageLastViews<any>(this.pageLastView)
            .subscribe(data => {
                if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
            }, error => {
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                    this.authService.logout(true);
                }
            });
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
        this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Item Template';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.itemMasterVM = itemMaster;

        this.bsModalRef.content.rulesetID = this.ruleSetId;
        
    }

    duplicateItemTemplate(itemMaster: ItemMaster) {
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
                    this.bsModalRef.content.title = 'Duplicate Item Template';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.itemMasterVM = itemMaster;
                    this.bsModalRef.content.rulesetID = this.ruleSetId;
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
        setTimeout(() => { this.isLoading = false;
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
        headerImage: ruleset.imageUrl ? ruleset.imageUrl : 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RuleSetWhite.png',
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
}