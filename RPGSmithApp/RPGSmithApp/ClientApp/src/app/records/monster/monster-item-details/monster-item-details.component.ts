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
import { CreateItemMsterComponent } from "../../item-master/create-item/create-item.component";
import { EditMonsterItemComponent } from "../edit-item/edit-item.component";
import { CastComponent } from "../../../shared/cast/cast.component";
import { ServiceUtil } from "../../../core/services/service-util";

@Component({
  selector: 'app-monster-item-details',
  templateUrl: './monster-item-details.component.html',
  styleUrls: ['./monster-item-details.component.scss']
})

export class MonsterItemDetailsComponent implements OnInit {

    isLoading = false;
    showActions: boolean = true;
    actionText: string;
  itemId: number;
  isDropdownOpen: boolean = false;
    ruleSetId: number;
    bsModalRef: BsModalRef;
  ItemDetail: any = new ItemMaster();
  RuleSet: any;
  monsterId: number = 0;
  IsComingFromCombatTracker_GM: boolean = false;

  IsGm: boolean = false;
    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService,
      private itemMasterService: ItemMasterService, private rulesetService: RulesetService,
      private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
      this.route.params.subscribe(params => { this.itemId = params['id']; });
        this.sharedService.shouldUpdateMonsterTemplateDetailList().subscribe(sharedServiceJson => {
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
    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
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
          this.itemMasterService.getMonsterItemById<any>(this.itemId)
              .subscribe(data => {
                if (data)
                  debugger;
                this.monsterId = data.monsterId;
                    this.RuleSet = data.ruleSet;
                    this.ItemDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");     
                    //this.ItemDetail.forEach(function (val) { val.showIcon = false; });
                    this.rulesetService.GetCopiedRulesetID(this.ItemDetail.ruleSetId, user.id).subscribe(data => {

                      let id: any = data
                      
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
    
  editItemTemplate(itemMaster: any) {
    
    this.bsModalRef = this.modalService.show(EditMonsterItemComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Item';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
    this.bsModalRef.content.itemVM = itemMaster;
        //this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
        //    class: 'modal-primary modal-custom',
        //    ignoreBackdropClick: true,
        //    keyboard: false
        //});
        //this.bsModalRef.content.title = 'Edit Item';
        //this.bsModalRef.content.button = 'UPDATE';
        //this.bsModalRef.content.fromDetail = true;
        //this.bsModalRef.content.itemMasterVM = itemMaster;
        //this.bsModalRef.content.rulesetID = this.ruleSetId;
        //this.bsModalRef.content.event.subscribe(data => {
        //  this.itemId = data.itemMasterId;
        //    this.initialize();
        //});
        
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
                    this.bsModalRef.content.title = 'Duplicate Item';
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

  deleteItem(itemMaster: ItemMaster) {
      
        let message = "Are you sure you want to delete this " + itemMaster.itemName
            + " item?";

        this.alertService.showDialog(message,
            DialogType.confirm, () => this.deleteItemTemplateHelper(itemMaster), null, 'Yes', 'No');
    }

    private deleteItemTemplateHelper(itemMaster: any) {
        itemMaster.ruleSetId = this.ruleSetId;
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting Item");

      
      this.itemMasterService.deleteMonsterItem(itemMaster.monsterItemId)
            .subscribe(
                data => {
                    setTimeout(() => {
                        this.isLoading = false;
                        this.alertService.stopLoadingMessage();
                    }, 200);
                    this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
                  //this.initialize();
                  this.router.navigate(['/ruleset/monster-details', this.monsterId]);
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
    if (this.ItemDetail.itemMasterCommand.length) {
      this.bsModalRef = this.modalService.show(CastComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = "Item Commands"
      this.bsModalRef.content.ListCommands = this.ItemDetail.itemMasterCommand
      this.bsModalRef.content.Command = this.ItemDetail
      this.bsModalRef.content.Character = new Characters();
    } else {
      this.useCommand(this.ItemDetail, item.itemId)
    }
  }
  useCommand(Command: any, itemId: string = '') {
    let msg = "The command value for " + Command.name
      + " has not been provided. Edit this record to input one.";
    if (Command.command == undefined || Command.command == null || Command.command == '') {
      this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
    }
    else {
      //TODO
      this.useCommandHelper(Command, itemId);
    }
  }
  private useCommandHelper(Command: any, itemId: string = '') {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = Command.command;
    if (Command.hasOwnProperty("itemId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.itemImage;
      this.bsModalRef.content.recordType = 'item';
      this.bsModalRef.content.recordId = itemId;
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
  }

  RedirectBack() {
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.ruleSetId]);
    }
    else {
      window.history.back();
    }
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
  GoToBuffEfects(buffAndEffectId: number) {
    this.router.navigate(['/ruleset/buff-effect-details', buffAndEffectId]);
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
 
}
