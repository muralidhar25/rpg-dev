import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { AlertService, MessageSeverity, DialogType } from '../../../../services/alert.service';
import { ConfigurationService } from '../../../../services/configuration.service';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AuthService } from "../../../../services/auth.service";
import { SharedService } from '../../../../services/shared.service';
import { Utilities } from '../../../../services/utilities';
import { DBkeys } from '../../../../services/db-Keys';
import { LocalStoreManager } from '../../../../services/local-store-manager.service';
import { CommonService } from "../../../../services/shared/common.service";
import { ItemsService } from "../../../../services/items.service";
import { ItemMasterService } from "../../../../services/item-master.service";

import { User } from '../../../../models/user.model';
import { Items } from '../../../../models/view-models/items.model';
import { ItemMaster } from '../../../../models/view-models/item-master.model';
import { VIEW } from '../../../../models/enums';
import { FilterPipe } from "../../../../pipes/filter.pipe";
import { ContainsPipe } from "../../../../pipes/contains.pipe";

@Component({
    selector: 'app-add-item',
    templateUrl: './add-item.component.html',
    styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {

    isLoading = false;
    title: string;
    _view: string;
    characterId: number;
    rulesetId: number;
    itemsList: any;
    characterItems: any;
    characterItemModal: any = new Items();
    searchText:string
    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService,
        private itemsService: ItemsService, private itemMasterService: ItemMasterService
    ) {
        this.route.params.subscribe(params => { this.characterId = params['id']; });
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
            this.itemMasterService.getItemMasterByRuleset_add<any>(this.rulesetId)
                .subscribe(data => {
                    this.itemsList = data.ItemMaster;
                    
                    this.itemsList.forEach(function (val) { val.showIcon = false; val.selected = false; });
                    this.isLoading = false;
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

    setItemMaster(event: any, itemMaster: any) {

        //if (event.target.checked) {
        //    this.characterItemModal.multiItemMasters.push({ itemMasterId: itemMaster.itemMasterId });
        //}
        //else {
        //    this.characterItemModal.multiItemMasters
        //        .splice(this.characterItemModal.multiItemMasters.indexOf({ itemMasterId: itemMaster.itemMasterId }), 1);
        //}
        
        this.itemsList.map((item) => {
            if (item.itemMasterId == itemMaster.itemMasterId) {
                item.selected = event.target.checked;
            }
            return item;
        })
        this.characterItemModal.itemMasterId = itemMaster.itemMasterId;
    }

    submitForm(itemMaster: any) {
        this.itemsList.map((item) => {
            if (item.selected) {
                this.characterItemModal.multiItemMasters.push({ itemMasterId: item.itemMasterId });
            }
            return item;
        })
        if (this.characterItemModal.multiItemMasters == undefined) {
            this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
        }
        else if (this.characterItemModal.multiItemMasters.length == 0) {
            this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
        }
        else {
            if (this.characterItemModal.view === VIEW.DUPLICATE) {
                //this.duplicateAbility(ability);
            }
            else {
                this.addEditItem(itemMaster);
            }
        }
    }

    addEditItem(modal: any) {
        this.isLoading = true;
        this.itemsService.addItem(modal)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let message = "Item(s) added successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                    this.sharedService.updateItemsList(true);
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

    duplicateItem(modal: any) {
        this.isLoading = true;
        this.itemsService.duplicateItem(modal)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Item has been duplicated successfully.", "", MessageSeverity.success);
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

}
