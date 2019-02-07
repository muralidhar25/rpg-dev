import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute, NavigationEnd } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../../../core/common/alert.service';
import { AuthService } from "./../../../../core/auth/auth.service";
import { ConfigurationService } from './../../../../core/common/configuration.service';
import { Utilities } from './../../../../core/common/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DBkeys } from '../../../../core/common/db-keys';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { SharedService } from "../../../../core/services/shared.service";
import { CommonService } from "../../../../core/services/shared/common.service";
import { ItemsService } from "../../../../core/services/items.service";
import { ItemMasterService } from "../../../../core/services/item-master.service";
import { EditItemComponent } from './../edit-item/edit-item.component';
import { User } from '../../../../core/models/user.model';
import { Items } from './../../../../core/models/view-models/items.model';
import { Item } from "angular2-multiselect-dropdown/menu-item";
import { navigationCancelingError } from "@angular/router/src/shared";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../../../core/models/view-models/characters.model";
import { CastComponent } from "../../../../shared/cast/cast.component";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { AddContainerComponent } from "../add-container/add-container.component";
import { AddContainerItemComponent } from "../add-container-item/add-container-item.component";

@Component({
    selector: 'app-item-details',
    templateUrl: './item-details.component.html',
    styleUrls: ['./item-details.component.scss']
})

export class CharacterItemDetailsComponent implements OnInit, OnDestroy {

    bsModalRef: BsModalRef;
    isLoading: boolean = false;
    showActions: boolean = true;
    actionText: string;
    itemId: number;
    ruleSetId: number;
    characterId: number;
    character: Characters = new Characters();
    ItemDetail: any = new Items;
    navigationSubscription;

    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService,
        private itemsService: ItemsService, private itemMasterService: ItemMasterService
    ) {
        this.route.params.subscribe(params => { this.itemId = params['id']; });
        this.sharedService.shouldUpdateItemsList().subscribe(sharedData => {
            if (sharedData.onPage) this.ItemDetail.isEquipped = sharedData.isEquipped;
            else this.initialize();
        });

        this.navigationSubscription = this.router.events.subscribe((x: any) => {
            if (x instanceof NavigationEnd) {
                this.initialize();
            }
        })
    }

    ngOnInit() {
        this.showActionButtons(this.showActions);
        this.initialize();
    }

    ngOnDestroy() {
        if (this.navigationSubscription)
            this.navigationSubscription.unsubscribe();
    }

    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            this.itemsService.getItemById<any>(this.itemId)
                .subscribe(data => {
                    
                    this.ItemDetail = this.itemsService.itemModelData(data, "UPDATE");
                    this.ruleSetId = this.ItemDetail.ruleSetId;
                    this.characterId = this.ItemDetail.characterId;
                    this.character = data.character;
                    //this.ItemDetail.forEach(function (val) { val.showIcon = false; });
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

    editItem(item: any) {
        this.bsModalRef = this.modalService.show(EditItemComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Item';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.fromDetail = true;
        this.bsModalRef.content.itemVM = item;
    }

    duplicateItem(item: any) {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.itemMasterService.getItemMasterCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(EditItemComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Duplicate Item';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.fromDetail = true;
                    this.bsModalRef.content.itemVM = item;
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });

    }

    deleteItem(item: any) {
        //this.isLoading = true;
        this.itemsService.GetNestedContainerItems(item.itemId)
            .subscribe(
                data => {
                    let itemsList: any = data;
                    this.isLoading = false;

                    let message: string = 'Are you sure you want to remove "' + item.name + '" from this Character ?';
                    if (item.containerItems) {
                        if (itemsList.length) {
                            message += '</br></br>This will also remove the following contained items:</br>';
                            //item.containerItems.map((itm: any, index) => {
                            //    if (index == item.containerItems.length - 1) {
                            //        message += itm.name;
                            //    }
                            //    else {
                            //        message += itm.name + ", ";
                            //    }

                            //})
                            itemsList.map((itm: any, index) => {
                                if (index == itemsList.length - 1) {
                                    message += itm.name;
                                }
                                else {
                                    message += itm.name + ", ";
                                }

                            })
                        }
                    }
                    this.alertService.showDialog(message,
                        DialogType.confirm, () => this.deleteItemHelper(item, itemsList), null, 'Yes', 'No');
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
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

    private deleteItemHelper(item: any, itemsList: any) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting Item");

        //this.itemsService.deleteItem(item.itemId)
        //    .subscribe(
        //        data => {
        //            setTimeout(() => {
        //                this.isLoading = false;
        //                this.alertService.stopLoadingMessage();
        //            }, 200);
        //            this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
        //            //this.initialize();
        //            this.router.navigate(['/character/inventory', item.characterId]);
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
        item.character = this.character;
        //item.characters.ruleSetId = this.ruleSet.id;
        item.character.ruleSet.ruleSetId = this.ruleSetId;
        this.itemsService.deleteItem_up(item, itemsList)
            .subscribe(
                data => {
                    setTimeout(() => {
                        this.isLoading = false;
                        this.alertService.stopLoadingMessage();
                    }, 200);
                    this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
                    //this.initialize();
                    this.router.navigate(['/character/inventory', item.characterId]);
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
    useItem(item: any) {
        if (this.ItemDetail.itemCommandVM.length) {
            this.bsModalRef = this.modalService.show(CastComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.title = "Item Commands"
            this.bsModalRef.content.ListCommands = this.ItemDetail.itemCommandVM
            this.bsModalRef.content.Command = this.ItemDetail
            this.bsModalRef.content.Character = this.character
        } else {
            this.useCommand(this.ItemDetail)
        }
    }
    useCommand(Command: any) {
        let msg = "The command value for " + Command.name
            + " has not been provided. Edit this record to input one.";
        if (Command.command == undefined || Command.command == null || Command.command == '') {
            this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
        }
        else {
            //TODO
            this.useCommandHelper(Command);
        }
    }
    private useCommandHelper(Command: any) {
        this.bsModalRef = this.modalService.show(DiceRollComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.tile = -2;
        this.bsModalRef.content.characterId = this.character.characterId;
        this.bsModalRef.content.character = this.character;
        this.bsModalRef.content.command = Command.command;
        if (Command.hasOwnProperty("itemId")) {
            this.bsModalRef.content.recordName = Command.name;
            this.bsModalRef.content.recordImage = Command.itemImage;
        }
        this.bsModalRef.content.event.subscribe(result => {
        });
    }

    equippedItem(item: any) {
        //this.isLoading = true;
        let equipTxt = item.isEquipped ? 'Unequipped' : 'Equipped';
        this.itemsService.toggleEquippedItem(item.itemId)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.ItemDetail.isEquipped = item.isEquipped ? false : true;
                    this.sharedService.updateItemsList({ isEquipped: this.ItemDetail.isEquipped, onPage: true });
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to " + equipTxt, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    showActionButtons(showActions) {
        this.showActions = !showActions;
        if (showActions) {
            this.actionText = 'ACTIONS';//'Show Actions';
        } else {
            this.actionText = 'HIDE';//'Hide Actions';
        }
    }

    redirectToItem(itemId: number) {
        if (itemId) {
            this.router.navigate(['/character/inventory-details', itemId]);
            //this.sharedService.updateItemsList({ onPage: false });
        }
    }

    gotoDashboard() {
        this.router.navigate(['/character/dashboard', this.characterId]);
    }

    RedirectBack() {
        window.history.back();
    }

    Redirect(path) {
        this.router.navigate([path, this.characterId]);
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
    GoToCharSpell(RulesetSpellID: number) {
        
        this.isLoading = true;
        this.itemsService.GetCharSpellID(RulesetSpellID, this.characterId)
            .subscribe(
            data => {
                this.setCharacterID(this.characterId);
                    this.isLoading = false;
                    if (data) {
                        let model:any = data;
                        this.router.navigate(['/character/spell-details', model.characterSpellId]);
                    }
                    else {
                        this.router.navigate(['/character/spell-detail', RulesetSpellID]);
                    }
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail(error, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }
    GoToCharAbility(RulesetAbilityId: number) {
        this.isLoading = true;
        this.itemsService.GetCharAbilityID(RulesetAbilityId, this.characterId)
            .subscribe(
            data => {
                this.setCharacterID(this.characterId);
                    this.isLoading = false;
                    if (data) {
                        let model:any = data;
                        this.router.navigate(['/character/ability-details', model.characterAbilityId]);
                    }
                    else {
                        this.router.navigate(['/character/ability-detail', RulesetAbilityId]);
                    }
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail(error, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    private setCharacterID(CharacterID: number) {
        this.localStorage.deleteData(DBkeys.CHARACTER_ID);
        this.localStorage.saveSyncedSessionData(CharacterID, DBkeys.CHARACTER_ID);
    }
    addContainer(item: any) {
        this.bsModalRef = this.modalService.show(AddContainerComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });

        this.bsModalRef.content.title = 'Select Container';
        this.bsModalRef.content.button = 'SELECT';
        this.bsModalRef.content.characterId = item.characterId;
        this.bsModalRef.content.itemId = item.itemId;
        this.bsModalRef.content.containerItemId = item.containerItemId;
        this.bsModalRef.content.isFromDetailPage = true;
        this.bsModalRef.content.itemToUpdate = item;
       
    }
    addContainerItem(item: any) {
        this.bsModalRef = this.modalService.show(AddContainerItemComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        let _contains = item.containerItems.map(item => {
            return { text: item.name, value: item.itemId, itemId: item.itemId };
        });
        item.contains = _contains;
        this.bsModalRef.content.title = 'Select Item';
        this.bsModalRef.content.button = 'SELECT';
        this.bsModalRef.content.characterId = item.characterId;
        this.bsModalRef.content.itemId = item.itemId;
        this.bsModalRef.content.itemName = item.containerName;
        this.bsModalRef.content.contains = item.contains;
        this.bsModalRef.content.containerItemId = item.containerItemId;
        this.bsModalRef.content.isFromDetailPage = true;
        this.bsModalRef.content.itemToUpdate = item;
     
    }
}
