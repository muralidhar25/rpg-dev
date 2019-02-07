import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../../core/common/alert.service';
import { AuthService } from "./../../../core/auth/auth.service";
import { Utilities } from './../../../core/common/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DBkeys } from '../../../core/common/db-keys';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { SharedService } from "../../../core/services/shared.service";
import { ItemsService } from "../../../core/services/items.service";
import { ItemMasterService } from "../../../core/services/item-master.service";
import { RulesetService } from "../../../core/services/ruleset.service";

import { AddItemComponent } from './add-item/add-item.component';
import { CreateItemComponent } from './create-item/create-item.component';
import { EditItemComponent } from './edit-item/edit-item.component';
import { User } from '../../../core/models/user.model';
import { Items } from './../../../core/models/view-models/items.model';
import { ItemMaster } from './../../../core/models/view-models/item-master.model';
import { PageLastViewsService } from "../../../core/services/pagelast-view.service";
import { PageLastViews } from '../../../core/models/view-models/pagelast-view.model';
import { Characters } from "../../../core/models/view-models/characters.model";
import { CharactersService } from "../../../core/services/characters.service";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { CastComponent } from "../../../shared/cast/cast.component";

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.scss']
})

export class CharacterItemsComponent implements OnInit {

    isLoading = false;
    isListView: boolean = false;
    showActions: boolean = true;
    actionText: string;
    bsModalRef: BsModalRef;
    isDropdownOpen: boolean = false;
    characterId: number;
    ruleSetId: number;
    ItemsList: any;
    ruleSet: any;
    pageLastView: any;
    character: any = new Characters();
    noRecordFound: boolean = false;
    scrollLoading: boolean = false;
    page: number = 1;
    pageSize: number = 28;
    ContainedItemsToDelete: any[];
    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private pageLastViewsService: PageLastViewsService,
        private sharedService: SharedService, private itemMasterService: ItemMasterService, private rulesetService: RulesetService,
        private itemsService: ItemsService, private charactersService: CharactersService
    ) {
        this.sharedService.shouldUpdateItemsList().subscribe(sharedServiceJson => {
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
        this.route.params.subscribe(params => { this.characterId = params['id']; });
        this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
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
            this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize)
                .subscribe(data => {

                    this.ItemsList = Utilities.responseData(data.ItemsList, this.pageSize);
                    this.ruleSet = data.RuleSet;
                    this.character = data.Character;
                    this.setHeaderValues(data.Character);

                    try {
                        this.ItemsList.forEach(function (val) {
                            val.showIcon = false;
                            val.showUse = val.command == null || val.command == undefined || val.command == '' ? false : true;
                        });
                    } catch (err) { }
                    try { this.noRecordFound = !data.ItemsList.length; } catch (err) { }
                    this.isLoading = false;

                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                }, () => { });

            //this.itemsService.getItemsByCharacterId<any[]>(this.characterId)
            //    .subscribe(data => {
            //        this.ItemsList = data;
            //        try {
            //            this.ItemsList.forEach(function (val) {
            //                val.showIcon = false;
            //                val.showUse = val.command == null || val.command == undefined || val.command == '' ? false : true;
            //            });
            //        } catch (err) { }
            //        try {
            //            this.noRecordFound = !data.length;
            //        } catch (err) { }
            //        this.isLoading = false;
            //    }, error => {
            //        this.isLoading = false;
            //        let Errors = Utilities.ErrorDetail("", error);
            //        if (Errors.sessionExpire) {
            //            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            //            this.authService.logout(true);
            //        }
            //    }, () => { });

            //this.rulesetService.getRulesetById<any>(this.ruleSetId)
            //    .subscribe(data => {
            //        this.ruleSet = data;
            //    }, error => {
            //        let Errors = Utilities.ErrorDetail("", error);
            //        if (Errors.sessionExpire) {
            //            this.authService.logout(true);
            //        }
            //    });

            this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'CharacterItems')
                .subscribe(data => {
                    if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
                }, error => {
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                });

            //this.charactersService.getCharactersById<any>(this.characterId)
            //    .subscribe(data => {
            //        this.character = data;
            //        //this.isLoading = false;
            //        this.setHeaderValues(this.character);
            //    }, error => {
            //        this.character = new Characters();
            //        //this.isLoading = false;
            //    }, () => { });
        }
    }

    onScroll() {

        ++this.page;
        this.scrollLoading = true;

        this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize)
            .subscribe(data => {

                var _ItemsList = data.ItemsList;
                for (var i = 0; i < _ItemsList.length; i++) {
                    _ItemsList[i].showIcon = false;
                    try {
                        _ItemsList[i].showUse = _ItemsList[i].command == null || _ItemsList[i].command == undefined || _ItemsList[i].command == '' ? false : true;
                    } catch (err) { }
                    this.ItemsList.push(_ItemsList[i]);
                }
                this.scrollLoading = false;

            }, error => {
                this.scrollLoading = false;
                this.isLoading = false;
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
            pageName: 'CharacterItems',
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


    manageIcon(id: number) {
        this.ItemsList.forEach(function (val) {
            if (id === val.itemId) {
                val.showIcon = true;
            } else {
                val.showIcon = false;
            }
        });
    }

    addItem() {
        this.bsModalRef = this.modalService.show(AddItemComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Add Items';
        this.bsModalRef.content.button = 'ADD';
        this.bsModalRef.content.itemVM = { characterId: this.characterId };
        this.bsModalRef.content.characterItems = this.ItemsList;
    }

    createItem() {
        // this.alertService.startLoadingMessage("", "Checking records");
        this.itemMasterService.getItemMasterCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateItemComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });

                    this.bsModalRef.content.title = 'Create Item';
                    this.bsModalRef.content.button = 'CREATE';
                    this.bsModalRef.content.characterId = this.characterId;
                    this.bsModalRef.content.rulesetId = this.ruleSetId;
                    this.bsModalRef.content.isFromCharacter = true;
                    this.bsModalRef.content.isFromCharacterId = +this.characterId;
                    this.bsModalRef.content.itemsVM = { characterId: this.characterId, ruleSet: this.ruleSet };
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });

    }

    editItem(item: any) {
        this.bsModalRef = this.modalService.show(EditItemComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Item';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.fromDetail = false;
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
                    this.bsModalRef.content.fromDetail = false;
                    this.bsModalRef.content.itemVM = item;
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });

    }

    deleteItem(item: Items) {
        //this.isLoading = true;
        this.itemsService.GetNestedContainerItems(item.itemId)
            .subscribe(
            data => {
                let itemsList:any = data;
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
                this.ContainedItemsToDelete = itemsList;
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

    private deleteItemHelper(item: any, itemsList:any) {
         this.alertService.startLoadingMessage("", "Deleting Item");
        //this.itemsService.deleteItem(item.itemId)
        //    .subscribe(
        //        data => {
        //            setTimeout(() => {
        //                this.isLoading = false;
        //                this.alertService.stopLoadingMessage();
        //            }, 100);
        //            this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
        //            // this.initialize();
        //            this.ItemsList = this.ItemsList.filter((val) => val.itemId != item.itemId);
        //            try {
        //                this.noRecordFound = !this.ItemsList.length;
        //            } catch (err) { }
        //        },
        //        error => {
        //            this.isLoading = false;
        //            this.alertService.stopLoadingMessage();
        //            let _message = "Unable to Delete";
        //            let Errors = Utilities.ErrorDetail(_message, error);
        //            if (Errors.sessionExpire) {
        //                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
        //                this.authService.logout(true);
        //            }
        //            else
        //                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        //    });
        item.character = this.character;
        //item.characters.ruleSetId = this.ruleSet.id;
        item.character.ruleSet = this.ruleSet;
        this.itemsService.deleteItem_up(item, itemsList)
            .subscribe(
                data => {
                    setTimeout(() => {
                        //this.isLoading = false;
                        this.alertService.stopLoadingMessage();
                    }, 100);

                    this.ContainedItemsToDelete.push(item);
                    this.ContainedItemsToDelete.map((RecDelItem) => {
                        this.ItemsList = this.ItemsList.filter((val) => val.itemId != RecDelItem.itemId);
                    })

                    this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
                    //this.isLoading = TRUE;
                    //this.initialize();

                    try {
                        this.noRecordFound = !this.ItemsList.length;
                    } catch (err) { }
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

    equippedItem(item: Items) {
        //this.isLoading = true;
        let equipTxt = item.isEquipped ? 'Unequipped' : 'Equipped';
        this.itemsService.toggleEquippedItem(item.itemId)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    item.isEquipped = item.isEquipped ? false : true;
                    //this.sharedService.updateItemsList(true);
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
    useItem(item: any) {

        if (item.itemId) {
            this.itemsService.getItemCommands_sp<any>(item.itemId)
                .subscribe(data => {
                    if (data.length > 0) {
                        this.bsModalRef = this.modalService.show(CastComponent, {
                            class: 'modal-primary modal-md',
                            ignoreBackdropClick: true,
                            keyboard: false
                        });

                        this.bsModalRef.content.title = "Item Commands";
                        this.bsModalRef.content.ListCommands = data;
                        this.bsModalRef.content.Command = item;
                        this.bsModalRef.content.Character = this.character;
                    } else {
                        this.useCommand(item);
                    }
                }, error => { }, () => { });
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

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }

    openDiceRollModal() {
        this.bsModalRef = this.modalService.show(DiceRollComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.characterId = this.characterId;
        this.bsModalRef.content.character = this.character;
        this.bsModalRef.content.recordName = this.character.characterName;
        this.bsModalRef.content.recordImage = this.character.imageUrl;
    }

    private setHeaderValues(character: Characters): any {
        let headerValues = {
            headerName: character.characterName,
            headerImage: character.imageUrl,
            headerId: character.characterId,
            headerLink: 'character',
            hasHeader: true
        };
        this.sharedService.updateAccountSetting(headerValues);
        this.localStorage.deleteData(DBkeys.HEADER_VALUE);
        this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
    }
}
