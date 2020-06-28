import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AuthService } from '../../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../../core/common/alert.service';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { SharedService } from '../../../../core/services/shared.service';
import { CommonService } from '../../../../core/services/shared/common.service';
import { ItemsService } from '../../../../core/services/items.service';
import { DBkeys } from '../../../../core/common/db-keys';
import { Utilities } from '../../../../core/common/utilities';
import { User } from '../../../../core/models/user.model';

@Component({
    selector: 'app-add-container',
    templateUrl: './add-container.component.html',
    styleUrls: ['./add-container.component.scss']
})
export class AddContainerComponent implements OnInit {

    isLoading = false;
    title: string;
    _view: string;
    characterId: number;
    itemId: number;
    itemsList: any;
    containerModal: any;
    containerItemId: number;
    searchText: string
    button: string
    isFromDetailPage: boolean = false;
    itemToUpdate:any
    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService, private itemsService: ItemsService
    ) {
        
    }

    ngOnInit() {
        setTimeout(() => {
            this.button = this.bsModalRef.content.button;
            this.characterId = this.bsModalRef.content.characterId;
            this.itemId = this.bsModalRef.content.itemId;
            this.containerItemId = this.bsModalRef.content.containerItemId;
            this.containerModal = { characterId: this.characterId, itemId: this.itemId, containerItemId: this.containerItemId, itemName: '' }
            this.isFromDetailPage = this.bsModalRef.content.isFromDetailPage ? this.bsModalRef.content.isFromDetailPage : false;
            this.itemToUpdate = this.bsModalRef.content.itemToUpdate ? this.bsModalRef.content.itemToUpdate : undefined;
            if (this.isFromDetailPage) {
                this.button='Update'
            }
            this.initialize();
        }, 0);

    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            this.itemsService.getAvailableContainerItems<any>(this.characterId, this.itemId)
                .subscribe(data => {                    
                    this.itemsList = data;
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                }, () => { });
        }
    }

    public event: EventEmitter<any> = new EventEmitter();


    submitForm(containerModal: any) {
        if (this.isFromDetailPage) {
            this.isLoading = true;
            if (this.itemToUpdate != undefined) {
                this.itemToUpdate.containerItemId = containerModal.containerItemId;
                this.itemToUpdate.containedIn = containerModal.containerItemId;
                this.itemToUpdate.containerName = containerModal.itemName;

                try {
                    this.itemToUpdate.selected = containerModal.selected;
                    if (this.itemToUpdate.selected) this.itemToUpdate.contains = containerModal.Contains;
                    this.itemToUpdate.contains = this.itemToUpdate.contains.filter(item => item.itemId !== containerModal.containerItemId);
                } catch (err) { }
                this.updateItem(this.itemToUpdate);
            }
        }
        else {
            this.sharedService.UpdateContainerItem(containerModal);
            this.close();
        }
    }

    setItem(event: any, item: any) {
        
        this.containerModal.containerItemId = 0;
        if (event.target.checked) {
            this.containerModal.containerItemId = item.itemId;
            this.containerModal.itemName = item.name;
        }
        else
            this.containerModal.containerItemId = 0;
  }

  removeSelectedItem() {
    this.containerModal.containerItemId = 0;
    this.containerModal.itemName = '';
    let ele:any = document.getElementsByName("newitem");
    for (var i = 0; i < ele.length; i++)
      ele[i].checked = false;
  }

    close() {
        this.bsModalRef.hide();
    }
    updateItem(modal: any) {
        this.isLoading = true;

        this.itemsService.updateItem<any>(modal)
            .subscribe(
            data => {
                this.close();
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let message = "Item has been updated successfully";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.bsModalRef.hide();
                this.sharedService.updateItemsList(true);
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Update ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                },
            );
    }
}
