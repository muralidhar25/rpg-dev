import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ItemMaster } from "../../../../../core/models/view-models/item-master.model";
import { Ruleset } from "../../../../../core/models/view-models/ruleset.model";
import { Characters } from "../../../../../core/models/view-models/characters.model";
import { SharedService } from "../../../../../core/services/shared.service";
import { LocalStoreManager } from "../../../../../core/common/local-store-manager.service";
import { ConfigurationService } from "../../../../../core/common/configuration.service";
import { ItemMasterService } from "../../../../../core/services/item-master.service";
import { Items } from "../../../../../core/models/view-models/items.model";
import { CommonService } from "../../../../../core/services/shared/common.service";
import { ItemsService } from "../../../../../core/services/items.service";
import { AuthService } from "../../../../../core/auth/auth.service";
import { AlertService, DialogType, MessageSeverity } from "../../../../../core/common/alert.service";
import { RulesetService } from "../../../../../core/services/ruleset.service";
import { DBkeys } from "../../../../../core/common/db-keys";
import { User } from "../../../../../core/models/user.model";
import { Utilities } from "../../../../../core/common/utilities";
import { ImageViewerComponent } from "../../../../../shared/image-interface/image-viewer/image-viewer.component";
import { CreateItemMsterComponent } from "../../../../../records/item-master/create-item/create-item.component";
import { AppService1 } from "../../../../../app.service";

@Component({
  selector: 'app-ruleset-view-item-detail',
  templateUrl: './ruleset-view-item-detail.component.html',
  styleUrls: ['./ruleset-view-item-detail.component.scss']
})
export class RulesetViewItemDetailComponent implements OnInit {

    isLoading = false;
    showActions: boolean = true;
    actionText: string;
    itemMasterId: number;
    ruleSetId: number;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
    ItemMasterDetail: any = new ItemMaster();
    ruleset: Ruleset = new Ruleset();
    charNav: any = {};

    characterItemModal: any = new Items();
    character: any = new Characters();
    IsAddingRecord: boolean = false;
    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService,
      private itemMasterService: ItemMasterService, private rulesetService: RulesetService, private itemsService: ItemsService
      , public appService: AppService1
    ) {
        this.route.params.subscribe(params => { this.itemMasterId = params['id']; });
        this.sharedService.shouldUpdateItemMasterList().subscribe(sharedServiceJson => {
            if (sharedServiceJson) this.initialize();
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
        this.initialize();
      this.showActionButtons(this.showActions);

      let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
        let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
        if (!icharNav) {
          this.charNav = {
            'items': '/character/inventory/' + char.headerId,
            'spells': '/character/spell/' + char.headerId,
            'abilities': '/character/ability/' + char.headerId
          };
        }
        else {
          if (!icharNav[char.headerId]) {
            this.charNav = {
              'items': '/character/inventory/' + char.headerId,
              'spells': '/character/spell/' + char.headerId,
              'abilities': '/character/ability/' + char.headerId
            };
          } else {
            this.charNav = icharNav[char.headerId];
          }
        }
    }

    private initialize() {

        let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
        if (char) {
            if (char.headerId) {
                this.character.characterName = char.headerName;
                this.character.imageUrl = char.headerImage;
                this.character.characterId = char.headerId;
                this.setHeaderValues(this.character);
            }
        }


        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
            this.isLoading = true;
            this.rulesetService.getRulesetById<any>(this.ruleSetId)
                .subscribe(data => {
                    this.ruleset = data;
                },
                error => {
                });
            this.itemMasterService.getItemMasterById<any[]>(this.itemMasterId)
                .subscribe(data => {
                    this.ItemMasterDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");
                    //this.ItemMasterDetail.forEach(function (val) { val.showIcon = false; });
                    this.rulesetService.GetCopiedRulesetID(this.ItemMasterDetail.ruleSetId, user.id).subscribe(data => {
                        let id: any = data
                        //this.ruleSetId = id;
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

  RedirectBack() {
    //this.router.navigate(['/character/ruleset/items', this.ruleSetId]);
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
    AddItem(itemMaster: ItemMaster) {
        this.IsAddingRecord = true;
        
        this.alertService.startLoadingMessage("", "Adding item to character");
        let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
        if (char) {
            if (char.headerId) {
                this.characterItemModal.multiItemMasters = [];
                this.characterItemModal.multiItemMasters.push({ itemMasterId: itemMaster.itemMasterId });
                this.characterItemModal.characterId = char.headerId;
                this.characterItemModal.itemMasterId = itemMaster.itemMasterId;
                this.itemsService.addItem(this.characterItemModal)
                    .subscribe(
                        data => {
                            this.IsAddingRecord = false;
                            this.alertService.stopLoadingMessage();
                            let message = "This item has been added to your character.";
                            this.alertService.showMessage(message, "", MessageSeverity.success);
                            //this.sharedService.updateItemsList(true);
                        },
                        error => {
                            this.IsAddingRecord = false;
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
        }

    }
    private setHeaderValues(character: Characters): any {
        let headerValues = {
            headerName: character.characterName,
            headerImage: character.imageUrl,
            headerId: character.characterId,
            headerLink: 'character',
            hasHeader: true
      };
      this.appService.updateAccountSetting1(headerValues);
        this.sharedService.updateAccountSetting(headerValues);
        this.localStorage.deleteData(DBkeys.HEADER_VALUE);
        this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
    }

    editItemTemplate(itemMaster: ItemMaster) {
        this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
            class: 'modal-primary modal-custom',
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
                        class: 'modal-primary modal-custom',
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
}

