import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../../../services/alert.service';
import { AuthService } from "./../../../../services/auth.service";
import { ConfigurationService } from './../../../../services/configuration.service';
import { Utilities } from './../../../../services/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DBkeys } from '../../../../services/db-Keys';
import { LocalStoreManager } from '../../../../services/local-store-manager.service';
import { SharedService } from "../../../../services/shared.service";
import { CommonService } from "../../../../services/shared/common.service";
import { ItemMasterService } from "../../../../services/item-master.service";

import { AddItemMasterComponent } from './../../item-master/add-item/add-item.component';
import { CreateItemMsterComponent } from './../../item-master/create-item/create-item.component';
import { User } from '../../../../models/user.model';
import { ItemMaster } from './../../../../models/view-models/item-master.model';
import { ImageViewerComponent } from "../../../image-interface/image-viewer/image-viewer.component";
import { RulesetService } from "../../../../services/ruleset.service";

@Component({
    selector: 'app-item-details',
    templateUrl: './item-details.component.html',
    styleUrls: ['./item-details.component.scss']
})

export class ItemDetailsComponent implements OnInit {

    isLoading = false;
    showActions: boolean = true;
    actionText: string;
    itemMasterId: number;
    ruleSetId: number;
    bsModalRef: BsModalRef;
    ItemMasterDetail: any = new ItemMaster();
    
    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService,
        private itemMasterService: ItemMasterService, private rulesetService: RulesetService
    ) {
        this.route.params.subscribe(params => { this.itemMasterId = params['id']; });
        this.sharedService.shouldUpdateItemMasterList().subscribe(sharedServiceJson => {
            if (sharedServiceJson) this.initialize();
        });
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
            this.itemMasterService.getItemMasterById<any[]>(this.itemMasterId)
                .subscribe(data => {
                    this.ItemMasterDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");     
                    //this.ItemMasterDetail.forEach(function (val) { val.showIcon = false; });
                    this.rulesetService.GetCopiedRulesetID(this.ItemMasterDetail.ruleSetId, user.id).subscribe(data => {
                        let id: any=data
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
        this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Item Template';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.fromDetail = true;
        this.bsModalRef.content.itemMasterVM = itemMaster;
        this.bsModalRef.content.rulesetID = this.ruleSetId;
        this.bsModalRef.content.event.subscribe(data => {
            this.itemMasterId = data.itemMasterId;
            this.initialize();
        });
        
    }

    duplicateItemTemplate(itemMaster: ItemMaster) {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.itemMasterService.getItemMasterCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Duplicate Item Template';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.fromDetail = true;
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
        //                this.alertService.stopLoadingMessage();
        //            }, 200);
        //            this.alertService.showMessage("Item Template has been deleted successfully.", "", MessageSeverity.success);
        //            //this.initialize();
        //            this.router.navigate(['/ruleset/item-master', this.ruleSetId]);
        //        },
        //        error => {
        //            setTimeout(() => {
        //                this.isLoading = false;
        //                this.alertService.stopLoadingMessage();
        //            }, 200);
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
        setTimeout(() => { this.isLoading = false; 
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
