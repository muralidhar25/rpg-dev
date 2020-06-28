import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Characters } from "../../../../core/models/view-models/characters.model";
import { Items } from "../../../../core/models/view-models/items.model";
import { AlertService, DialogType, MessageSeverity } from "../../../../core/common/alert.service";
import { AuthService } from "../../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../../core/common/local-store-manager.service";
import { ItemMasterService } from "../../../../core/services/item-master.service";
import { SharedService } from "../../../../core/services/shared.service";
import { ItemsService } from "../../../../core/services/items.service";
import { User } from "../../../../core/models/user.model";
import { DBkeys } from "../../../../core/common/db-keys";
import { EditItemComponent } from "../edit-item/edit-item.component";
import { Utilities } from "../../../../core/common/utilities";
import { CastComponent } from "../../../../shared/cast/cast.component";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { AddContainerComponent } from "../add-container/add-container.component";
import { AddContainerItemComponent } from "../add-container-item/add-container-item.component";
import { HeaderValues } from "../../../../core/models/headers.model";
import { CharactersService } from "../../../../core/services/characters.service";
import { ServiceUtil } from "../../../../core/services/service-util";
import { AppService1 } from "../../../../app.service";
import { DropSingleItemComponent } from "../drop-signle-item/drop-signle-item.component";

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})

export class CharacterItemDetailsComponent implements OnInit, OnDestroy {

  bsModalRef: BsModalRef;
  isLoading: boolean = false;
  showActions: boolean = true;
  isDropdownOpen: boolean = false;
  actionText: string;
  itemId: number;
  ruleSetId: number;
  rulesetIdForExecute: number
  characterId: number;
  character: Characters = new Characters();
  ItemDetail: any = new Items;
  navigationSubscription;
  headers: HeaderValues = new HeaderValues();
  charNav: any = {};
  pageRefresh: boolean;
  //itemWillGetDropped: boolean = false;
  pauseItemAdd: boolean;
  pauseItemCreate: boolean;
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;
  doesCharacterHasAllies: boolean = false;
  isGM_Only: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService,
    private itemsService: ItemsService, private itemMasterService: ItemMasterService, public appService: AppService1,
    private charactersService: CharactersService) {

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
  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className) {
        if (target.className == "Editor_Command a-hyperLink") {
          this.GotoCommand(target.attributes["data-editor"].value);
        }
      }
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
    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);
    this.showActionButtons(this.showActions);
    this.initialize();

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

  ngOnDestroy() {
    if (this.navigationSubscription)
      this.navigationSubscription.unsubscribe();
  }


  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'character') {
          this.characterId = this.headers.headerId;
        }
      }
      this.isLoading = true;
      this.itemsService.getItemById_Cache<any>(this.itemId)
        .subscribe(data => {
          this.ItemDetail = this.itemsService.itemModelData(data, "UPDATE");
          console.log("this.ItemDetail", this.ItemDetail);
          this.ruleSetId = this.ItemDetail.ruleSet.ruleSetId;
          if (this.ItemDetail && this.ItemDetail.character && this.ItemDetail.character.ruleSetId) {
            this.rulesetIdForExecute = this.ItemDetail.character.ruleSetId;
          }
          this.isLoading = false;

          this.characterId = this.ItemDetail.characterId;
          this.character = data.character;
          if (this.character && this.character.characterId) {
            this.gameStatus(this.character.characterId);
          }
          this.setHeaderValues(data.character);
          //this.ItemDetail.forEach(function (val) { val.showIcon = false; });
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {

          this.charactersService.isAllyAssigned(this.characterId).subscribe(data => {
            if (data) {
              this.doesCharacterHasAllies = true;
            }
          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          });

        });
    }
  }

  editItem(item: any) {
    this.bsModalRef = this.modalService.show(EditItemComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Item';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.itemVM = item;
    this.bsModalRef.content.isGM_Only = this.isGM_Only;
  }

  duplicateItem(item: any) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.itemMasterService.getCharacterItemCount(this.ruleSetId, this.characterId)
      .subscribe((data: any) => {
        let ItemCount = data.itemCount;
        let ItemMasterCount = data.itemMasterCount;
        //this.alertService.stopLoadingMessage();
        if (ItemMasterCount < 2000 && ItemCount < 200) {
          this.bsModalRef = this.modalService.show(EditItemComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Duplicate Item';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.fromDetail = true;
          this.bsModalRef.content.itemVM = item;
          this.bsModalRef.content.isGM_Only = this.isGM_Only;
        }
        else {
          if (ItemMasterCount >= 2000) {
            this.alertService.showMessage("The maximum number of Item Templates has been reached, 2,000. Please delete some Item Templates and try again.", "", MessageSeverity.error);
          } else if (ItemCount >= 200) {
            this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
          }
        }
      }, error => { }, () => { });

  }

  deleteItem(item: any) {
    //this.itemsService.GetNestedContainerItems(item.itemId)
    //  .subscribe(
    //    data => {
    //      let itemsList: any = data;
    //      this.isLoading = false;
    //      let message: string = 'Are you sure you want to drop "' + item.name + '" ?';
    //      if (item.containerItems) {
    //        if (itemsList.length) {
    //          message += '</br></br>This will also remove the following contained items:</br>';
    //          //item.containerItems.map((itm: any, index) => {
    //          //    if (index == item.containerItems.length - 1) {
    //          //        message += itm.name;
    //          //    }
    //          //    else {
    //          //        message += itm.name + ", ";
    //          //    }
    //          //})
    //          itemsList.map((itm: any, index) => {
    //            if (index == itemsList.length - 1) {
    //              message += itm.name;
    //            }
    //            else {
    //              message += itm.name + ", ";
    //            }
    //          })
    //        }
    //      }
    //      this.alertService.showDialog(message,
    //        DialogType.confirm, () => this.deleteItemHelper(item, itemsList), null, 'Yes', 'No');
    //    },
    //    error => {
    //      this.isLoading = false;
    //      this.alertService.stopLoadingMessage();
    //      let _message = "Unable to Drop";
    //      let Errors = Utilities.ErrorDetail(_message, error);
    //      if (Errors.sessionExpire) {
    //        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
    //        this.authService.logout(true);
    //      }
    //      else
    //        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
    //    });

    this.bsModalRef = this.modalService.show(DropSingleItemComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.item = item;
  }

  private deleteItemHelper(item: any, itemsList: any) {
    this.isLoading = true;
    if (this.pageRefresh) {
      this.alertService.startLoadingMessage("", "Dropping " + item.name);
    } else {
      this.alertService.startLoadingMessage("", "Dropping " + item.name);
    }


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
          if (this.pageRefresh) {
            //this.alertService.showMessage("Item has been dropped successfully.", "", MessageSeverity.success);
            this.alertService.showMessage(item.name + " has been dropped", "", MessageSeverity.success);
          } else {
            //this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
            this.alertService.showMessage(item.name + " has been dropped", "", MessageSeverity.success);
          }

          //this.initialize();
          this.router.navigate(['/character/inventory', item.characterId]);
        },
        error => {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
          }, 200);
          let _message = "Unable to Drop";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  GetMultipleCommands(item) {
    this.bsModalRef = this.modalService.show(CastComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Item Commands"
    this.bsModalRef.content.ListCommands = this.ItemDetail.itemCommandVM
    this.bsModalRef.content.Command = this.ItemDetail
    this.bsModalRef.content.Character = this.character;
    if (item.isConsumable) {
      this.bsModalRef.content.isConsumable = true;
    }
  }

  useItem(item: any) {
    if (this.ItemDetail.itemCommandVM.length) {
      if (item.isConsumable) {
        if (item.quantity <= 0) {
          let msg = "The Quantity for this " + item.name
            + " item is " + item.quantity + " Would you like to continue?";
          this.alertService.showDialog(msg, DialogType.confirm, () => this.GetMultipleCommands(item), null, 'Yes', 'No');
        } else {
          this.GetMultipleCommands(item);
        }
      } else {
        this.GetMultipleCommands(item);
      }
    } else {
      this.useCommand(this.ItemDetail, item.itemId)
    }
  }
  useCommand(Command: any, itemId: string = '') {
    if (Command.isConsumable) {
      if (Command.quantity <= 0) {
        let msg = "The Quantity for this " + Command.name
          + " item is " + Command.quantity + " Would you like to continue?";
        //if (Command.command == undefined || Command.command == null || Command.command == '') {
        //  this.alertService.showDialog(msg, DialogType.confirm, () => this.CommandUsed(Command), null, 'Yes', 'No');
        //} else {
        //  this.useCommandHelper(Command, itemId);
        //}
        this.alertService.showDialog(msg, DialogType.confirm, () => this.useCommandHelper(Command, itemId), null, 'Yes', 'No');
      } else {
        if (Command.command == undefined || Command.command == null || Command.command == '') {
          this.CommandUsed(Command);
        } else {
          this.useCommandHelper(Command, itemId);
        }
      }

    } else {
      let msg = "The command value for " + Command.name + " has not been provided. Edit this record to input one.";
      if (Command.command == undefined || Command.command == null || Command.command == '') {
        this.alertService.showDialog(msg, DialogType.alert, () => this.useCommandHelper(Command));
      }
      else {
        //TODO
        this.useCommandHelper(Command, itemId);
      }
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
    this.bsModalRef.content.characterId = this.character.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = Command.command;
    if (Command.hasOwnProperty("itemId")) {
      this.bsModalRef.content.recordName = Command.name;
      this.bsModalRef.content.recordImage = Command.itemImage;
      this.bsModalRef.content.recordType = 'item';
      this.bsModalRef.content.recordId = itemId;
      if (Command.isConsumable) {
        setTimeout(() => {
          this.CommandUsed(Command);
        }, 4000);
        //this.itemsService.ReduceItemQty(Command.itemId).subscribe(result => {
        //  if (result) {
        //    this.ItemDetail.quantity = result;
        //    this.ItemDetail.totalWeight = this.ItemDetail.weight * this.ItemDetail.quantity;
        //  }
        //}, error => {
        //  let Errors = Utilities.ErrorDetail("", error);
        //  if (Errors.sessionExpire) {
        //    this.authService.logout(true);
        //  }
        //});
      }
    }
    this.bsModalRef.content.event.subscribe(result => {
    });
  }

  //Reduce Item's Quantity
  CommandUsed(Command) {
    let ruleSetId;
    if (this.ItemDetail) {
      ruleSetId = this.ItemDetail.ruleSet.ruleSetId;
    }
    this.itemsService.ReduceItemQty(Command.itemId, ruleSetId).subscribe(result => {
      let msg = "The " + Command.name + " has been used. " + result + " number of uses remain.";
      this.alertService.showMessage(msg, "", MessageSeverity.success);
      this.ItemDetail.quantity = result;
      this.ItemDetail.totalWeight = this.ItemDetail.weight * this.ItemDetail.quantity;
      if (result == 0) {
        this.router.navigate(['/character/inventory', this.character.characterId]);
      }
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      }
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
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.ruleSetId]);
    }
    else if (this.IsComingFromCombatTracker_PC) {
      this.router.navigate(['/character/combatplayer', + this.characterId]);
    }
    else {
      window.history.back();
    }
    //window.history.back();
  }

  Redirect(path) {
    this.router.navigate([path, this.characterId]);
  }
  RedirectChar(path) {
    this.router.navigate([path]);
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
            let model: any = data;
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
  GoToCharbuff(RulesetBuffID: number) {
    this.router.navigate(['/character/buff-effect-detail', RulesetBuffID]);
  }
  GoToCharAbility(RulesetAbilityId: number) {
    this.isLoading = true;
    this.itemsService.GetCharAbilityID(RulesetAbilityId, this.characterId)
      .subscribe(
        data => {
          this.setCharacterID(this.characterId);
          this.isLoading = false;
          if (data) {
            let model: any = data;
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
  refresh() {
    this.initialize();
  }
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId_Cache(characterId)
      .subscribe(data => {

        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user == null) {
            this.authService.logout();
          }
          else {
            if (data.isPlayerCharacter && data.isPlayerLinkedToCurrentCampaign) {
              this.isGM_Only = true;
            }

            //if (data.isPlayerCharacter || data.isCurrentCampaignPlayerCharacter) {
            //  this.itemWillGetDropped = true;
            //}
            if (user.isGm) {

              this.pageRefresh = user.isGm;
            }
            else if (data.isPlayerCharacter) {
              this.pageRefresh = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {
              //this.pauseItemAdd = data.pauseItemAdd;
              //this.pauseItemCreate = data.pauseItemCreate;
              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {
                this.pauseItemAdd = data.pauseItemAdd;
                this.pauseItemCreate = data.pauseItemCreate;
                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }
              }
              // this.pageRefresh = data.isPlayerCharacter;
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
  GoToBuffEffect() {

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

  GotoCommand(cmd) {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = cmd;
  }

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
  }

  Show_Hide_item(item: Items) {
    this.itemsService.toggle_Show_Hide_Item(item.itemId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.ItemDetail.isVisible = this.ItemDetail.isVisible ? false : true;
        },
        error => {
          this.isLoading = false;
        });
  }


}
