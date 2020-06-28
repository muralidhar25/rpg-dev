import { Component, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { SYSTEM_GENERATED_MSG_TYPE, CHATACTIVESTATUS } from '../../../core/models/enums';
import { MessageSeverity, AlertService } from '../../../core/common/alert.service';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { DBkeys } from '../../../core/common/db-keys';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { AppService1 } from '../../../app.service';
import { ItemMasterService } from '../../../core/services/item-master.service';


@Component({
  selector: 'app-drop-items-monster',
  templateUrl: './drop-items-monster.component.html',
  styleUrls: ['./drop-items-monster.component.scss']
})
export class DropItemsMonsterComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  isLoading = false;
  title: string;
  _view: string;
  characterId: number;
  rulesetId: number;
  characterItems: any;
  searchText: string;
  itemsList: any[] = [];
  selectedItemsList: any[] = [];
  monsterId: number;
  monsterName: string = '';
  monsterImage: string = '';
  allSelected: boolean = false;
  selectedLootPileItem: any;
  monsterCurrency = [];
  isAllCurrecySelected: boolean = false;

  constructor(
    private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService,
    private appService: AppService1,
    private monsterTemplateService: MonsterTemplateService,
    private itemMasterService: ItemMasterService
  ) {
    this.route.params.subscribe(params => { this.characterId = params['id']; });
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;
      this._view = this.bsModalRef.content.button;
      this.monsterName = this.bsModalRef.content.monsterName;
      this.monsterImage = this.bsModalRef.content.monsterImage;

      this.rulesetId = this.bsModalRef.content.rulesetID;
      this.monsterId = this.bsModalRef.content.monsterId;
      if (this.rulesetId == undefined)
        this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      this.monsterCurrency = this.bsModalRef.content.monsterCurrency;
      try {
        this.monsterCurrency.forEach((x, i) => {
          x.selected = false;
          x.total = x.amount;
          x.amount = x.amount ? x.amount:0;
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
      this.isLoading = true;

      this.monsterTemplateService.getMonsterItemToDrop<any>(this.monsterId)
        .subscribe(data => {
          this.itemsList = data;
          this.itemsList.map(x => {
            x.selected = false;
            x.quantity = x.qty;
          });
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

  setItemMaster(event: any, itemMaster: any) {
    itemMaster.selected = event.target.checked;
    if (event.target.checked) {
      const _containsItems = Object.assign([], this.selectedItemsList);
      _containsItems.push(itemMaster);
      this.selectedItemsList = _containsItems;
    } else {
      let _item = itemMaster;
      const index: number = this.selectedItemsList.indexOf(_item);
      if (index !== -1) {
        this.selectedItemsList.splice(index, 1);
      } else {
        const _arrayItems = Object.assign([], this.selectedItemsList);
        this.selectedItemsList = _arrayItems.filter(function (itm) {
          if (itm.itemId !== _item.itemId) return _item;
        });
      }
    }

    if (this.selectedItemsList.length === this.itemsList.length) {
      this.allSelected = true;
    }
    else {
      this.allSelected = false;
    }
  }

  submitForm() {
    console.log('selectedLottPileItem', this.selectedLootPileItem);
    let __monsterCurrency = this.monsterCurrency.filter(x => x.selected === true);

    if (this.selectedItemsList.length || __monsterCurrency.length) {
      let selecetedItemCount = this.selectedItemsList.length;
      this.itemMasterService.getLootItemCount(this.rulesetId)
        .subscribe((data: any) => {
          let LootCount = data.lootCount;
          if ((LootCount + selecetedItemCount) < 200) {
            this.isLoading = true;
            let _msg = 'Droping Monster Items ...';
            this.alertService.startLoadingMessage("", _msg);

            this.monsterCurrency = this.monsterCurrency.filter(x => x.selected === true);

            let model = {
              selectedItemsList: this.selectedItemsList,
              monsterCurrency: this.monsterCurrency
            }

            this.monsterTemplateService.dropMonsterItemsWithCurrency(model, this.monsterId)
              .subscribe(data => {
                //if (data) {
                this.event.emit(data);
                //}
                this.alertService.stopLoadingMessage();
                this.isLoading = false;
                this.close();

                if (this.localStorage.localStorageGetItem(DBkeys.ChatInNewTab) && (this.localStorage.localStorageGetItem(DBkeys.ChatActiveStatus) == CHATACTIVESTATUS.ON)) {
                  let ChatWithDiceRoll = [];
                  if (this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow)) {
                    ChatWithDiceRoll = this.localStorage.localStorageGetItem(DBkeys.ChatMsgsForNewChatWindow);
                  }
                  let chatMsgObject = { type: SYSTEM_GENERATED_MSG_TYPE.CHAT_WITH_LOOT_MESSAGE, obj: true }
                  ChatWithDiceRoll.push(chatMsgObject);
                  this.localStorage.localStorageSetItem(DBkeys.ChatMsgsForNewChatWindow, ChatWithDiceRoll);
                } else {
                  this.appService.updateChatWithLootMessage(true);
                }
                this.sharedService.updateDropMonsterList(true);
                this.sharedService.updateCombatantListForAddDeleteMonsters(true);
              }, error => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                this.alertService.showMessage(error, "", MessageSeverity.error);
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  this.authService.logout(true);
                }
              }, () => { });
          } else {
            this.isLoading = false;
            this.alertService.showMessage("The maximum number of Loot Items has been reached, 200. Please delete some loot items before attempting to drop items again.", "", MessageSeverity.error);
          }
        }, error => { }, () => { });
    }
    else {
      let message = 'Please select atleast one item or currency to drop';
      this.alertService.showMessage(message, "", MessageSeverity.error);
    }

  }

  close() {
    this.bsModalRef.hide();
  }
  selectDeselectFilters(isSelectAll) {
    this.allSelected = isSelectAll;
    this.selectedItemsList = [];
    if (this.allSelected) {
      this.itemsList.map((item) => {
        item.selected = true;
        this.selectedItemsList.push(item);
      })
    }
    else {
      this.itemsList.map((item) => {
        item.selected = false;
      })
    }
  }

  selectDeselectCurrency(isSelectAll) {
    this.isAllCurrecySelected = isSelectAll;
    if (this.isAllCurrecySelected) {
      this.monsterCurrency.map(c => {
        c.selected = true;
      });
    } else {
      this.monsterCurrency.map(c => {
        c.selected = false;
      });
    }


  }


  get lootItemsSettings() {
    return {
      primaryKey: "lootItemId",
      labelKey: "name",
      text: "Search item(s)",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "bottom"
    };
  }

  currencyEnable(evt, currency) {
    currency.selected = evt.checked;
  }

  updateQuantity(currency) {
    currency.selected = true;
    currency.amount = currency.total >= currency.amount ? currency.amount : currency.total;
  }

  updateItemQuantity(item, qty) {
    item.qty = item.quantity >= qty ? qty : item.quantity;
  }

}
