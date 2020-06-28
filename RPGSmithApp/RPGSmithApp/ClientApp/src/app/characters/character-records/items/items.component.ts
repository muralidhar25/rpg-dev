import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { AddItemComponent } from './add-item/add-item.component';
import { CreateItemComponent } from './create-item/create-item.component';
import { EditItemComponent } from './edit-item/edit-item.component';
import { Characters } from "../../../core/models/view-models/characters.model";
import { SharedService } from "../../../core/services/shared.service";
import { AlertService, MessageSeverity, DialogType } from "../../../core/common/alert.service";
import { PageLastViewsService } from "../../../core/services/pagelast-view.service";
import { ItemMasterService } from "../../../core/services/item-master.service";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { AuthService } from "../../../core/auth/auth.service";
import { CharactersService } from "../../../core/services/characters.service";
import { ItemsService } from "../../../core/services/items.service";
import { DBkeys } from "../../../core/common/db-keys";
import { User } from "../../../core/models/user.model";
import { Utilities } from "../../../core/common/utilities";
import { Items } from "../../../core/models/view-models/items.model";
import { CastComponent } from "../../../shared/cast/cast.component";
import { DiceRollComponent } from "../../../shared/dice/dice-roll/dice-roll.component";
import { AppService1 } from "../../../app.service";
import { HeaderValues } from "../../../core/models/headers.model";
import { ServiceUtil } from "../../../core/services/service-util";
import { DropItemsComponent } from "./drop-items/drop-items.component";
import { setTimeout } from "timers";
import { DropSingleItemComponent } from "./drop-signle-item/drop-signle-item.component";


@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class CharacterItemsComponent implements OnInit {

  isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false;
  showActions: boolean = true;
  actionText: string;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
  characterId: number;
  ruleSetId: number;
  ItemsList: any;
  ruleSet: any;
  pageLastView: any;
  timeoutHandler: any;
  headers: HeaderValues = new HeaderValues();
  character: any = new Characters();
  noRecordFound: boolean = false;
  scrollLoading: boolean = false;
  page: number = 1;
  pageSize: number = 56;
  ContainedItemsToDelete: any[];
  pauseItemAdd: boolean;
  pauseItemCreate: boolean;
  inventoryFilter: any = {
    type: 1,
    name: 'Uncontained',
    icon: 'icon-Rec-Container',
    viewableCount: 0
  };
  charNav: any = {};
  containerCount: number;
  alphabetCount: number;
  equippedCount: number;
  visibleCount: number;
  Uncontained: boolean = false;
  Equipped: boolean = false;
  Alphabetical: boolean = false;
  Visible: boolean = false;
  pageRefresh: boolean;
  //itemWillGetDropped: boolean = false;
  isPlayerCharacter: boolean = false;
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;
  doesCharacterHasAllies: boolean = false;
  isGM_Only: boolean = false;
  currencyList = [];
  searchText: string;
  initLoad: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private pageLastViewsService: PageLastViewsService,
    private sharedService: SharedService, private itemMasterService: ItemMasterService,
    private itemsService: ItemsService, private charactersService: CharactersService, public appService: AppService1
  ) {
    this.sharedService.shouldUpdateItemsList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        this.initLoad = true;
        this.page = 1;
        this.pageSize = 28;
        this.initialize();
      }
    });
    this.appService.shouldUpdateItemsList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) {
        this.page = 1;
        this.pageSize = 28;
        this.initialize();
      }
    });

    this.appService.shouldUpdateFilterSearchRecords().subscribe(filterBy => {
      this.searchText = filterBy;
    });

    //var el = document.getElementById('ind');
    //el.addEventListener('long-press', function(e) {

    //    // stop the event from bubbling up
    //    e.preventDefault()


    //});
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

    this.route.params.subscribe(params => {
      this.characterId = params['id'];
    });


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

    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);

    this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    this.destroyModalOnInit();
    this.initialize();
    this.showActionButtons(this.showActions);

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

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    let localStorageFilters = this.localStorage.getDataObject<number>('inventoryFilter');
    if (localStorageFilters != null) {
      this.inventoryFilter = localStorageFilters;
    }

    if (user == null)
      this.authService.logout();
    else {
      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'character') {
          this.characterId = this.headers.headerId;
        }
      }
      this.getFilters();

      this.isLoading = true;

      this.gameStatus(this.characterId);

      this.itemsService.getItemsByCharacterId_sp_Cache<any>(this.characterId, this.ruleSetId, this.page, this.pageSize, this.inventoryFilter.type, this.initLoad)
        .subscribe(data => {

          this.ItemsList = Utilities.responseData(data.ItemsList, this.pageSize);
          this.currencyList = data.CurrencyList;

          if (this.currencyList) {
            this.currencyList.map(x => {
              x.amount = Utilities.DecimalNumber(+x.amount);
              x.weightValue = Utilities.DecimalNumber(+x.weightValue);
              x.calculatedAmount = Utilities.DecimalNumber(x.amount * x.weightValue);
            });
          }

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

          if (this.inventoryFilter.type == 1) {
            //this.containerCount = this.ItemsList.length;
            this.containerCount = data.FilterUnContainedCount;
          }
          if (this.inventoryFilter.type == 2) {
            //let result = data.ItemsList.filter(s => s.isEquipped);
            //this.equippedCount = result.length;
            this.equippedCount = data.FilterEquippedCount;
          }
          if (this.inventoryFilter.type == 3) {
            //this.alphabetCount = this.ItemsList.length;
            this.alphabetCount = data.FilterAplhabetCount;
          }
          if (this.inventoryFilter.type == 4) {

            //let result = this.ItemsList.filter(s => s.isVisible);
            //this.visibleCount = result.length;
            this.visibleCount = data.FilterVisibleCount;

          }
          this.applyFilters(this.inventoryFilter.type, true);

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
        }, () => {

          this.onSearch();

          setTimeout(() => {
            if (window.innerHeight > document.body.clientHeight) {
              this.onScroll(false);
            }
          }, 10)
        });

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

      ////this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'CharacterItems')
      ////  .subscribe(data => {
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

  onScroll(isAutoScroll: boolean = true) {

    ++this.page;
    if (isAutoScroll) {
      this.scrollLoading = true;
    }

    this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize, this.inventoryFilter.type)
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

        if (this.inventoryFilter.type == 1) {

          //this.containerCount = this.ItemsList.length;
          this.containerCount = data.FilterUnContainedCount;
        }
        if (this.inventoryFilter.type == 2) {
          //let result = this.ItemsList.filter(s => s.isEquipped);
          //this.equippedCount = result.length;
          this.equippedCount = data.FilterEquippedCount;
        }
        if (this.inventoryFilter.type == 3) {
          //this.alphabetCount = this.ItemsList.length;
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.inventoryFilter.type == 4) {
          //let result = this.ItemsList.filter(s => s.isVisible);
          //this.visibleCount = result.length;
          this.visibleCount = data.FilterVisibleCount;
        }
        this.applyFilters(this.inventoryFilter.type, true);


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
    this.isDenseView = false;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'CharacterItems',
      viewType: this.isListView ? 'List' : 'Grid',
      UserId: user.id
    }

    this.itemsService.createPageLastViews<any>(this.pageLastView)
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
      pageName: 'CharacterItems',
      viewType: 'Dense',
      UserId: user.id
    }
    this.itemsService.createPageLastViews<any>(this.pageLastView)
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
    //this.sharedServiceSubscriber.unsubscribe();
    this.bsModalRef = this.modalService.show(AddItemComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Add Items';
    this.bsModalRef.content.button = 'ADD';
    this.bsModalRef.content.itemVM = { characterId: this.characterId };
    this.bsModalRef.content.characterItems = this.ItemsList;
    this.bsModalRef.content.currencyList = this.currencyList;
  }

  createItem() {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.itemMasterService.getCharacterItemCount(this.ruleSetId, this.characterId)
      .subscribe((data: any) => {
        let ItemCount = data.itemCount;
        let ItemMasterCount = data.itemMasterCount;
        //this.alertService.stopLoadingMessage();
        if (ItemMasterCount < 2000 && ItemCount < 200) {
          this.bsModalRef = this.modalService.show(CreateItemComponent, {
            class: 'modal-primary modal-custom',
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
          this.bsModalRef.content.isGM_Only = this.isGM_Only;
        }
        else {
          if (ItemMasterCount >= 2000) {
            this.alertService.showMessage("The maximum number of Item Templates for this Rule Set as been reached. Please delete some Item Templates and try again.", "", MessageSeverity.error);
          } else if (ItemCount >= 200) {
            this.alertService.showMessage("The maximum number of records has been reached, 200. Please delete some records and try again.", "", MessageSeverity.error);
          }


        }
      }, error => { }, () => { });

  }

  editItem(item: any) {
    this.bsModalRef = this.modalService.show(EditItemComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Item';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.fromDetail = false;
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
          this.bsModalRef.content.fromDetail = false;
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

  deleteItem(item: Items, deleted) {
    //this.isLoading = true;
    this.itemsService.GetNestedContainerItems(item.itemId)
      .subscribe(
        data => {
          let message: string = '';
          let itemsList: any = data;
          this.isLoading = false;

          message = 'Are you sure you want to delete "' + item.name + '" ?';

          if (item.containerItems) {
            if (itemsList.length) {
              message += '</br></br>This will also delete the following contained items:</br>';
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

          if (deleted || !this.isPlayerCharacter) {
            if (deleted) {
              this.alertService.showDialog(message,
                DialogType.confirm, () => this.deleteItemHelper(item, itemsList, deleted), null, 'Yes', 'No');
            } else {
              //message = 'Are you sure you want to drop "' + item.name + '" ?';
              //this.alertService.showDialog(message,
              //  DialogType.confirm, () => this.deleteItemHelper(item, itemsList, deleted), null, 'Yes', 'No');

              this.bsModalRef = this.modalService.show(DropSingleItemComponent, {
                class: 'modal-primary modal-custom',
                ignoreBackdropClick: true,
                keyboard: false
              });
              this.bsModalRef.content.ruleSetId = this.ruleSetId;
              this.bsModalRef.content.characterId = this.characterId;
              this.bsModalRef.content.item = item;
            }
          }
          else {
            if (!deleted) {
              //message = 'Are you sure you want to drop "' + item.name + '" ?';
              //this.alertService.showDialog(message,
              //  DialogType.confirm, () => this.deleteItemHelper(item, itemsList, deleted), null, 'Yes', 'No');

              this.bsModalRef = this.modalService.show(DropSingleItemComponent, {
                class: 'modal-primary modal-custom',
                ignoreBackdropClick: true,
                keyboard: false
              });
              this.bsModalRef.content.ruleSetId = this.ruleSetId;
              this.bsModalRef.content.characterId = this.characterId;
              this.bsModalRef.content.item = item;
            }
          }

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

  private deleteItemHelper(item: any, itemsList: any, deleted: boolean) {
    if (this.pageRefresh) {
      //this.alertService.startLoadingMessage("", "Dropping " + item.name);
      if (deleted) {
        this.alertService.startLoadingMessage("", "Deleting " + item.name);
      } else {
        this.alertService.startLoadingMessage("", "Dropping " + item.name);
      }
    } else {
      //this.alertService.startLoadingMessage("", "Deleting " + item.name);
      if (deleted) {
        this.alertService.startLoadingMessage("", "Deleting " + item.name);
      } else {
        this.alertService.startLoadingMessage("", "Dropping " + item.name);
      }
    }
    if (deleted) {
      this.itemsService.deleteItem(item.itemId)
        .subscribe(data => {
          //setTimeout(() => {
          //this.isLoading = false;
          this.alertService.stopLoadingMessage();
          //}, 100);
          this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
          // this.initialize();                    
          this.ItemsList = this.ItemsList.filter((val) => val.itemId != item.itemId);
          try {
            this.noRecordFound = !this.ItemsList.length;
          } catch (err) { }
        },
          error => {
            //this.isLoading = false;
            this.alertService.stopLoadingMessage();
            let _message = "Unable to Delete";
            let Errors = Utilities.ErrorDetail(_message, error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
            else {
              this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            }
          });
    } else {

      item.character = this.character;
      //item.characters.ruleSetId = this.ruleSet.id;
      item.character.ruleSet = this.ruleSet;
      this.itemsService.deleteItem_up(item, itemsList)
        .subscribe(
          data => {
            if (item.isEquipped) {
              this.equippedCount = this.equippedCount - 1;
            }
            if (item.isVisible) {
              this.visibleCount = this.visibleCount - 1;
            }
            this.alphabetCount = this.alphabetCount - 1;
            this.containerCount = this.containerCount - 1;
            this.ImplementFilter();
            setTimeout(() => {
              //this.isLoading = false;
              this.alertService.stopLoadingMessage();
            }, 100);

            this.ContainedItemsToDelete.push(item);
            this.ContainedItemsToDelete.map((RecDelItem) => {
              this.ItemsList = this.ItemsList.filter((val) => val.itemId != RecDelItem.itemId);
            })

            if (this.pageRefresh) {
              //this.alertService.showMessage("Item has been dropped successfully.", "", MessageSeverity.success);
              //this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
              if (deleted) {
                this.alertService.showMessage(item.name + " has been deleted", "", MessageSeverity.success);
              } else {
                this.alertService.showMessage(item.name + " has been dropped", "", MessageSeverity.success);
              }
            } else {
              if (deleted) {
                this.alertService.showMessage(item.name + " has been deleted", "", MessageSeverity.success);
              } else {
                this.alertService.showMessage(item.name + " has been dropped", "", MessageSeverity.success);
              }
              //this.alertService.showMessage("Item has been deleted successfully.", "", MessageSeverity.success);
              //this.alertService.startLoadingMessage("", "Deleting " + item.name);
            }

            //this.isLoading = TRUE;
            //this.initialize();

            try {
              this.noRecordFound = !this.ItemsList.length;
            } catch (err) { }
          },
          error => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();

            let _message = "";
            if (deleted) {
              _message = "Unable to Delete";
            } else {
              _message = "Unable to Drop";
            }
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

  equippedItem(item: Items) {
    //this.isLoading = true;
    this.equippedCount = item.isEquipped ? this.equippedCount - 1 : this.equippedCount + 1;
    let equipTxt = item.isEquipped ? 'Unequipped' : 'Equipped';
    this.itemsService.toggleEquippedItem(item.itemId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          item.isEquipped = item.isEquipped ? false : true;
          this.ImplementFilter();
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


  Show_Hide_item(item: Items) {
    this.visibleCount = item.isVisible ? this.visibleCount - 1 : this.visibleCount + 1;
    this.itemsService.toggle_Show_Hide_Item(item.itemId)
      .subscribe(
        data => {
          this.isLoading = false;
          item.isVisible = item.isVisible ? false : true;
          this.ImplementFilter();
        },
        error => {
          this.isLoading = false;
        });
  }

  GetMultipleCommands(item, data) {
    this.bsModalRef = this.modalService.show(CastComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });

    this.bsModalRef.content.title = "Item Commands";
    this.bsModalRef.content.ListCommands = data;
    this.bsModalRef.content.Command = item;
    this.bsModalRef.content.Character = this.character;
    this.bsModalRef.content.recordType = 'item';
    this.bsModalRef.content.recordId = item.itemId;
    if (item.isConsumable) {
      this.bsModalRef.content.isConsumable = true;
    }
  }

  useItem(item: any) {
    if (item.itemId) {
      this.itemsService.getItemCommands_sp<any>(item.itemId)
        .subscribe(data => {
          if (data.length > 0) {

            if (item.isConsumable) {
              if (item.quantity <= 0) {
                let msg = "The Quantity for this " + item.name
                  + " item is " + item.quantity + " Would you like to continue?";
                this.alertService.showDialog(msg, DialogType.confirm, () => this.GetMultipleCommands(item, data), null, 'Yes', 'No');
              } else {
                this.GetMultipleCommands(item, data);
              }
            } else {
              this.GetMultipleCommands(item, data);
            }
            //this.bsModalRef = this.modalService.show(CastComponent, {
            //  class: 'modal-primary modal-md',
            //  ignoreBackdropClick: true,
            //  keyboard: false
            //});

            //this.bsModalRef.content.title = "Item Commands";
            //this.bsModalRef.content.ListCommands = data;
            //this.bsModalRef.content.Command = item;
            //this.bsModalRef.content.Character = this.character;
            //this.bsModalRef.content.recordType = 'item';
            //this.bsModalRef.content.recordId = item.itemId;
            //if (item.isConsumable) {
            //  this.bsModalRef.content.isConsumable = true;
            //}
          } else {
            this.useCommand(item, item.itemId);
          }
        }, error => { }, () => { });
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
    if (Command.command == undefined || Command.command == null || Command.command == '') {
      this.CommandUsed(Command);
    } else {
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

          //    this.ItemsList.map(x => {
          //      if (x.itemId == Command.itemId) {
          //        x.quantity = result;
          //        x.totalWeight = x.weight * x.quantity;
          //      }
          //    });
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
  }

  //Reduce Item's Quantity
  CommandUsed(Command) {
    let _ruleSetId;
    if (this.ruleSetId) {
      _ruleSetId = this.ruleSetId;
    }
    this.itemsService.ReduceItemQty(Command.itemId, _ruleSetId).subscribe(result => {
      let msg = "The " + Command.name + " has been used. " + result + " number of uses remain.";
      this.alertService.showMessage(msg, "", MessageSeverity.success);
      this.ItemsList.map(x => {
        if (x.itemId == Command.itemId) {
          x.quantity = result;
          x.totalWeight = x.weight * x.quantity;
        }
      });
      if (result == 0) {
        this.page = 1;
        this.pageSize = 28;
        this.initialize();
      }
    }, error => {
      let Errors = Utilities.ErrorDetail("", error);
      if (Errors.sessionExpire) {
        this.authService.logout(true);
      }
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
    this.appService.updateAccountSetting1(headerValues);
    this.sharedService.updateAccountSetting(headerValues);
    this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);


    //let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (!icharNav) {
      this.charNav = {
        'items': '/character/inventory/' + character.characterId,
        'spells': '/character/spell/' + character.characterId,
        'abilities': '/character/ability/' + character.characterId
      };
    }
    else {
      if (!icharNav[character.characterId]) {
        this.charNav = {
          'items': '/character/inventory/' + character.characterId,
          'spells': '/character/spell/' + character.characterId,
          'abilities': '/character/ability/' + character.characterId
        };
      } else {
        this.charNav = icharNav[character.characterId];
      }
    }
  }

  applyFilters(present_filter, apply_same = false, IsCalledFromClickFunction = false) {
    //if (apply_same) {
    //  this.inventoryFilter.type = present_filter;
    //} else {
    //  if (present_filter == 4) {
    //    this.inventoryFilter.type = 1;
    //  }
    //  else {
    //    this.inventoryFilter.type = present_filter + 1;
    //  }
    //}
    if (present_filter == 1) {
      this.Uncontained = true;
      this.Equipped = false;
      this.Alphabetical = false;
      this.Visible = false;
    }
    else if (present_filter == 2) {
      this.Uncontained = false;
      this.Equipped = true;
      this.Alphabetical = false;
      this.Visible = false;
    }
    else if (present_filter == 3) {
      this.Uncontained = false;
      this.Equipped = false;
      this.Alphabetical = true;
      this.Visible = false;
    }
    else {
      this.Uncontained = false;
      this.Equipped = false;
      this.Alphabetical = false;
      this.Visible = true;
    }

    this.inventoryFilter.type = present_filter;
    if (IsCalledFromClickFunction) {
      this.isLoading = true;
      this.page = 1
      this.pageSize = 28;
      this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize, this.inventoryFilter.type)
        .subscribe(data => {

          this.ItemsList = Utilities.responseData(data.ItemsList, this.pageSize);
          try {
            this.ItemsList.forEach(function (val) {
              val.showIcon = false;
              val.showUse = val.command == null || val.command == undefined || val.command == '' ? false : true;
            });
          } catch (err) { }
          try { this.noRecordFound = !data.ItemsList.length; } catch (err) { }

          this.ImplementFilter();
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
    else {
      this.ImplementFilter();
    }

  }

  //private scrollToTop() {
  //  jQuery('html, body').animate({ scrollTop: 0 }, 500);
  //}

  public clickAndHold(item: any) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  public editRecord(item: any) {
    this.timeoutHandler = setInterval(() => {
      this.editItem(item);
    }, 1000);
  }
  ImplementFilter() {
    //this.inventoryFilter.viewableCount = this.ItemsList.length;
    this.inventoryFilter.viewableCount = this.alphabetCount;

    switch (this.inventoryFilter.type) {
      case 1: // Conainter
      default:
        this.inventoryFilter.viewableCount = this.containerCount;
        //this.inventoryFilter.viewableCount = 0;
        //this.ItemsList.map((item) => {
        //  if (item.containedIn == 0) {
        //    this.inventoryFilter.viewableCount++;
        //  }
        //});

        this.inventoryFilter.name = 'Uncontained';
        this.inventoryFilter.icon = 'icon-Rec-Container';
        break;
      case 2: // Equipped
        //this.ItemsList.sort(function (a, b) {
        //  if (a["isEquipped"] == b["isEquipped"]) {
        //    return (a["name"] < b["name"]) ? -1 : (a["name"] > b["name"]) ? 1 : 0;
        //  }
        //  else {
        //    return (a["isEquipped"] > b["isEquipped"]) ? -1 : 1;
        //  }
        //});

        this.inventoryFilter.viewableCount = this.equippedCount;
        //this.inventoryFilter.viewableCount = 0;
        //this.ItemsList.map((item) => {
        //  if (item.isEquipped) {
        //    this.inventoryFilter.viewableCount++;
        //  }
        //});

        this.inventoryFilter.name = 'Equipped';
        this.inventoryFilter.icon = 'icon-Rec-Equipped';
        break;
      case 3: // Alphabetical
        //this.ItemsList.sort(function (a, b) {
        //  if (a["name"] == b["name"]) {
        //    return 0;
        //  }
        //  return (a["name"] < b["name"]) ? -1 : 1;
        //});

        this.inventoryFilter.name = 'Alphabetical';
        this.inventoryFilter.icon = '';
        break;
      case 4: // Visible
        this.inventoryFilter.viewableCount = this.visibleCount;
        //this.inventoryFilter.viewableCount = 0;
        //this.ItemsList.map((item) => {
        //  if (item.isVisible) {
        //    this.inventoryFilter.viewableCount++;
        //  }
        //});

        this.inventoryFilter.name = 'Visible';
        this.inventoryFilter.icon = 'icon-Rec-Visible';
        break;
    }

    this.localStorage.saveSyncedSessionData(this.inventoryFilter, 'inventoryFilter');
  }

  getFilters() {
    if (this.inventoryFilter.type == 2 || this.inventoryFilter.type == 3 || this.inventoryFilter.type == 4) {

      this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize, 1)
        .subscribe(data => {
          //this.containerCount = data.ItemsList.length;
          this.containerCount = data.FilterUnContainedCount;
        }, error => {
        }, () => { });
    }
    if (this.inventoryFilter.type == 1 || this.inventoryFilter.type == 3 || this.inventoryFilter.type == 4) {
      this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize, 2)
        .subscribe(data => {
          //let result = data.ItemsList.filter(s => s.isEquipped);
          //this.equippedCount = result.length;
          this.equippedCount = data.FilterEquippedCount;
        }, error => {
        }, () => { });
    }
    if (this.inventoryFilter.type == 1 || this.inventoryFilter.type == 2 || this.inventoryFilter.type == 4) {
      this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize, 3)
        .subscribe(data => {
          //this.alphabetCount = data.ItemsList.length;
          this.alphabetCount = data.FilterAplhabetCount;
        }, error => {
        }, () => { });
    }
    if (this.inventoryFilter.type == 1 || this.inventoryFilter.type == 2 || this.inventoryFilter.type == 2) {
      this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize, 4)
        .subscribe(data => {
          //let result = data.ItemsList.filter(s => s.isVisible);
          //this.visibleCount = result.length;
          this.visibleCount = data.FilterVisibleCount;
        }, error => {
        }, () => { });
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
              this.isPlayerCharacter = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {
              this.isPlayerCharacter = data.isPlayerCharacter
              //this.pauseItemAdd = data.pauseItemAdd;
              //this.pauseItemCreate = data.pauseItemCreate;

              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {                this.pauseItemAdd = data.pauseItemAdd;                this.pauseItemCreate = data.pauseItemCreate;                if (data.pauseGame) {                  this.router.navigate(['/characters']);                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);                }              }
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
  RedirectBack() {
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.ruleSetId]);
    }
    else if (this.IsComingFromCombatTracker_PC) {
      this.router.navigate(['/character/combatplayer', + this.characterId]);
    }
    else {
      this.localStorage.localStorageSetItem(DBkeys.IsCharacterBackButton, "false");
      this.router.navigate(['/character/dashboard', this.characterId]);
    }
    //window.history.back();
  }

  DropItem() {
    this.bsModalRef = this.modalService.show(DropItemsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleSetId = this.ruleSetId;
    this.bsModalRef.content.characterId = this.characterId;
  }

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
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

  onSearch() {
    ++this.page;

    this.itemsService.getItemsByCharacterId_sp<any>(this.characterId, this.ruleSetId, this.page, this.pageSize, this.inventoryFilter.type)
      .subscribe(data => {
        let count = 0;
        var _ItemsList = data.ItemsList;
        for (var i = 0; i < _ItemsList.length; i++) {
          _ItemsList[i].showIcon = false;
          try {
            _ItemsList[i].showUse = _ItemsList[i].command == null || _ItemsList[i].command == undefined || _ItemsList[i].command == '' ? false : true;
          } catch (err) { }
          this.ItemsList.push(_ItemsList[i]);

          count += 1;
          if (count == _ItemsList.length - 1) {
            this.onSearch();
          }
        }

        if (this.inventoryFilter.type == 1) {
          this.containerCount = data.FilterUnContainedCount;
        }
        if (this.inventoryFilter.type == 2) {
          this.equippedCount = data.FilterEquippedCount;
        }
        if (this.inventoryFilter.type == 3) {
          this.alphabetCount = data.FilterAplhabetCount;
        }
        if (this.inventoryFilter.type == 4) {
          this.visibleCount = data.FilterVisibleCount;
        }
        this.applyFilters(this.inventoryFilter.type, true);

      }, error => { });

  }

}
