import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Items } from "../../../../../core/models/view-models/items.model";
import { Characters } from "../../../../../core/models/view-models/characters.model";
import { AlertService, DialogType, MessageSeverity } from "../../../../../core/common/alert.service";
import { AuthService } from "../../../../../core/auth/auth.service";
import { PageLastViewsService } from "../../../../../core/services/pagelast-view.service";
import { LocalStoreManager } from "../../../../../core/common/local-store-manager.service";
import { ItemMasterService } from "../../../../../core/services/item-master.service";
import { SharedService } from "../../../../../core/services/shared.service";
import { ItemsService } from "../../../../../core/services/items.service";
import { DBkeys } from "../../../../../core/common/db-keys";
import { User } from "../../../../../core/models/user.model";
import { Utilities } from "../../../../../core/common/utilities";
import { ItemMaster } from "../../../../../core/models/view-models/item-master.model";
import { DiceRollComponent } from "../../../../../shared/dice/dice-roll/dice-roll.component";
import { CreateItemMsterComponent } from "../../../../../records/item-master/create-item/create-item.component";
import { AppService1 } from "../../../../../app.service";
import { CharactersService } from "../../../../../core/services/characters.service";
import { ServiceUtil } from "../../../../../core/services/service-util";

@Component({
  selector: 'app-ruleset-view-list',
  templateUrl: './ruleset-view-list.component.html',
  styleUrls: ['./ruleset-view-list.component.scss']
})
export class ItemRulesetViewListComponent implements OnInit {
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
  pageSize: number = 56;
  offset = (this.page - 1) * this.pageSize;
  charNav: any = {};

  characterItemModal: any = new Items();
  character: any = new Characters();
  IsAddingRecord: boolean = false;
  pageRefresh: boolean;
  pauseItemAdd: boolean;
  pauseItemCreate: boolean;
  showManage: boolean = false;
  searchText: string;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private pageLastViewsService: PageLastViewsService,
    private sharedService: SharedService, private itemMasterService: ItemMasterService, private itemsService: ItemsService
    , public appService: AppService1, private charactersService: CharactersService
  ) {
    this.sharedService.shouldUpdateItemMasterList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        this.page = 1;
        this.pageSize = 28;
        this.initialize();
      }
    });

    this.appService.shouldUpdateFilterSearchRecords().subscribe(filterBy => {
      this.searchText = filterBy;
    });

  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
      //if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE))
      //  this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
      if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE)) {
        if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerLink == 'character') {
          this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
        }
      }
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
      this.isLoading = true;
      this.gameStatus(this.character.characterId);
      this.itemMasterService.getItemMasterByRuleset_spWithPagination_Cache<any>(this.ruleSetId, this.page, this.pageSize)
        .subscribe(data => {
          this.ItemMasterList = Utilities.responseData(data.ItemMaster, this.pageSize);
          this.ItemMasterList.forEach(function (val) { val.showIcon = false; });
          this.RuleSet = data.RuleSet;

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
        }, () => {
          setTimeout(() => {
            if (window.innerHeight > document.body.clientHeight) {
              this.onScroll(false);
            }
          }, 10)
        });

      ////this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'ItemMaster')
      ////  .subscribe(data => {
      ////    //if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
      ////    if (data !== null) {
      ////      if (data.viewType == 'List') {
      ////        this.isListView = true;
      ////        this.isDenseView = false;
      ////      }
      ////      else if (data.viewType == 'Dense') {
      ////        this.isDenseView = true;
      ////        this.isListView = false;
      ////      }
      ////      else {
      ////        this.isListView = false;
      ////        this.isDenseView = false;
      ////      }
      ////    }
      ////  }, error => {
      ////    let Errors = Utilities.ErrorDetail("", error);
      ////    if (Errors.sessionExpire) {
      ////      this.authService.logout(true);
      ////    }
      ////  });
    }
  }

  onScroll(isAutoScroll: boolean = true) {

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

  //addItem() {

  //    this.bsModalRef = this.modalService.show(AddItemMasterComponent, {
  //        class: 'modal-primary modal-md',
  //        ignoreBackdropClick: true,
  //        keyboard: false
  //    });
  //}

  manageIcon(id: number) {
    this.ItemMasterList.forEach(function (val) {
      if (id === val.itemMasterId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
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
  AddItem(itemMaster: ItemMaster) {

    this.IsAddingRecord = true;
    this.alertService.startLoadingMessage("", "Adding item to character");
    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (char) {
      if (char.headerId) {
        this.characterItemModal.multiItemMasters = [];
        this.characterItemModal.multiItemMasterBundles = [];
        //this.characterItemModal.multiItemMasters.push({ itemMasterId: itemMaster.itemMasterId });
        if (itemMaster.isBundle) {
          this.characterItemModal.multiItemMasterBundles.push({ itemMasterBundleId: itemMaster.itemMasterId });
        }
        else {
          this.characterItemModal.multiItemMasters.push({ itemMasterId: itemMaster.itemMasterId });
        }


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
  back() {
    this.router.navigate(['/character/inventory', this.character.characterId]);
    //window.history.back();
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

    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (char) {
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

  }

  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = this.character.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.recordName = this.character.characterName;
    this.bsModalRef.content.recordImage = this.character.imageUrl;
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
  GoToDetails(item: ItemMaster) {
    if (item.isBundle) {
      this.router.navigate(['/character/ruleset/item-detail', item.itemMasterId]);
    }
    else {
      this.router.navigate(['/character/ruleset/item-details', item.itemMasterId]);
    }
  }
  refresh() {
    this.page = 1;
    this.pageSize = 28;
    this.initialize();
  }
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId(characterId)
      .subscribe(data => {
        this.showManage = true;
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user == null) {
            this.authService.logout();
          }
          else {
            if (user.isGm) {
              this.pageRefresh = user.isGm;
            }
            else if (data.isPlayerCharacter) {
              this.pageRefresh = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {
              this.showManage = data.isPlayerLinkedToCurrentCampaign;
              //this.pauseItemAdd = data.pauseItemAdd;
              //this.pauseItemCreate = data.pauseItemCreate;
              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {
                //this.showManage = false;
                this.pauseItemAdd = data.pauseItemAdd;
                this.pauseItemCreate = data.pauseItemCreate;
                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }
              }
            } else {
              this.showManage = true;
            }
            if (data.isDeletedInvite) {
              this.router.navigate(['/characters']);
              this.alertService.showStickyMessage('', "Your " + data.name + " character has been deleted by the GM", MessageSeverity.error);
              setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
            }
          }
        }
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
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
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = cmd;
  }

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
  }

}
