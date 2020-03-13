import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { Items } from '../../core/models/view-models/items.model';
import { Utilities } from '../../core/common/utilities';
import { LootService } from '../../core/services/loot.service';
import { SharedService } from '../../core/services/shared.service';
import { AppService1 } from '../../app.service';
import { PlayerLootSecondaryComponent } from './player-loot-secondary/player-loot-secondary.component';
import { ItemMasterService } from '../../core/services/item-master.service';
import { SYSTEM_GENERATED_MSG_TYPE, CHATACTIVESTATUS } from '../../core/models/enums';

@Component({
  selector: 'app-player-loot',
  templateUrl: './player-loot.component.html',
  styleUrls: ['./player-loot.component.scss']
})
export class PlayerLootComponent implements OnInit {

  isLoading = false;
  characterId: number;
  characterName: string = '';
  rulesetId: number;
  itemsList: any;
  characterItemModal: any = new Items();
  searchText: string;
  //isloading: boolean = false;
  allSelected: boolean = false;
  lootPileList: any[] = [];
  headers: any[] = [];

  constructor(

    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private lootService: LootService,
    private sharedService: SharedService,
    private appService: AppService1,
    private itemMasterService: ItemMasterService

  ) {

  }

  ngOnInit() {
    
    if (this.rulesetId == undefined)
      this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    setTimeout(() => {
      this.headers = this.bsModalRef.content.headers;
      this.characterId = this.bsModalRef.content.headers.headerId
      this.characterItemModal.characterId = this.bsModalRef.content.headers.headerId;
      this.characterName = this.bsModalRef.content.headers.headerName;
      let characterCurrency = Object.assign([], this.bsModalRef.content.characterCurrencyList);
      this.characterItemModal.characterCurrency = Object.assign([], characterCurrency);
      try {
        this.characterItemModal.characterCurrency.forEach((x, i) => {
          x.selected = false; x.total = x.amount; x.amount = 0;
        });
      } catch (err) { }
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.allSelected = false;
      this.isLoading = true;
      this.lootService.getLootItemsForPlayers_Cache<any>(this.rulesetId)
        .subscribe(data => {
          if (data) {

            let list = data;
            this.itemsList = [];
            this.lootPileList = [];

            list.map(x => {
              x.qty = x.quantity;
              if (x.isLootPile) {
                this.lootPileList.push(x);
              } else {
                this.itemsList.push(x);
              }
            });

            this.characterItemModal.itemMasterId = -1;
            //this.itemsList = data;
            if (this.itemsList.filter(x => x.selected == true).length === data.length)
              this.allSelected = true;
            //else this.allSelected = false;

            //this.allSelected = true;
            //this.itemsList.map(x => {
            //  if (x.selected == false)
            //    this.allSelected = false;
            //})

          }
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

  close() {
    this.bsModalRef.hide();
  }

  currencyEnable(evt, currency) {
    currency.selected = evt.checked;
  }

  updateQuantity(currency) {
    currency.selected = true;
    currency.amount = currency.total >= currency.amount ? currency.amount : currency.total;
  }

  setItemMaster(event: any, itemMaster: any) {
    this.itemsList.map((item) => {
      if (item.lootId == itemMaster.lootId) {
        item.selected = event.target.checked;
      }
      if (item.selected == false) this.allSelected = false;

      return item;
    })
    //this.allSelected = true;
    if (this.itemsList.filter(x => x.selected == true).length === this.itemsList.length)
      this.allSelected = true;

  }

  submitForm(itemMaster: any) {
    this.characterItemModal.multiLootIds = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.characterItemModal.multiLootIds.push({ lootId: item.lootId, name: item.itemName, quantity: item.quantity, qty: item.qty });
      }
      return item;

    });
    if (this.characterItemModal.multiLootIds == undefined) {
      this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
    }
    else if (this.characterItemModal.multiLootIds == 0) {
      this.alertService.showMessage("Please select new Item Template to Add.", "", MessageSeverity.error);
    }
    else {
      this.addEditItem(itemMaster);
    }
  }

  addEditItem(model) {
    this.isLoading = true;
    this.itemMasterService.getCharacterItemCount(this.rulesetId, this.characterId)
      .subscribe((data: any) => {
        let ItemCount = data.itemCount;
        let selectedItemCount = 0;
        if (model.multiLootIds && model.multiLootIds.length) {
          selectedItemCount = model.multiLootIds.length;
        }
        if ((ItemCount + selectedItemCount) < 200) {

          model.characterCurrency = model.characterCurrency.filter(x => x.selected === true);

          this.lootService.lootItemsTakeByplayer<any>(model, false, false, true)
            .subscribe(data => {
              if (data) {
                if (data.message) {
                  this.alertService.showMessage(data.message, "", MessageSeverity.error);
                } else {
                  this.alertService.showMessage("Adding Loot Item", "", MessageSeverity.success);
                }
                this.close();
                this.appService.updateItemsList(true);
                this.sharedService.updateLootList(true);
                if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
                  let ChatWithDiceRoll = [];
                  if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
                    ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
                  }
                  let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_TAKEN_BY_LOOT_MESSAGE, obj: { characterName: this.characterName, lootItems: model.multiLootIds ? model.multiLootIds : [] } }
                  ChatWithDiceRoll.push(chatMsgObject);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
                } else {
                  this.appService.updateChatWithTakenByLootMessage({ characterName: this.characterName, lootItems: model.multiLootIds ? model.multiLootIds : [] });
                }
              }
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
          this.isLoading = false;
          this.alertService.showMessage("The maximum number of Items has been reached, 200. Please delete some Items and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

  selectDeselectFilters(selected) {

    this.allSelected = selected;

    if (this.allSelected) {

      this.itemsList.map((item) => {
        item.selected = true;
      })

    }
    else {
      this.itemsList.map((item) => {
        item.selected = false;
      })

    }
  }

  refresh() {
    this.initialize();
  }

  SecondaryLoot(item) {
    this.close();
    this.bsModalRef = this.modalService.show(PlayerLootSecondaryComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.LootPileId = item.lootId;
    this.bsModalRef.content.ruleSetId = this.rulesetId;
    this.bsModalRef.content.headers = this.headers;
    this.bsModalRef.content.itemMasterLootCurrency = item.itemMasterLootCurrency;
    this.bsModalRef.content.characterCurrency = this.characterItemModal.characterCurrency;    
  }

  quantityChanged(item) {
    item.quantity = item.qty >= item.quantity ? item.quantity : item.qty;
    //this.itemsList.map((itm) => {
    //  if (itm.lootId == item.lootId) {
    //    itm.quantity = quantity >= 1 ? quantity : 1;
    //  }
    //});
  }

}
