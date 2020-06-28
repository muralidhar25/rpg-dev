import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { CharactersService } from '../../../core/services/characters.service';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
import { LootService } from '../../../core/services/loot.service';
import { SharedService } from '../../../core/services/shared.service';
import { MessageSeverity, AlertService } from '../../../core/common/alert.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';


@Component({
  selector: 'app-giveaway',
  templateUrl: './giveaway.component.html',
  styleUrls: ['./giveaway.component.scss']
})
export class GiveawayComponent implements OnInit {

  giveAwayItem: any;
  ruleSetId: number;
  characters: any = [];
  isLoading = false;
  selectercharacter: any;
  isFromLootGiveScreen: boolean = true;
  isLootPile: boolean = false;
  lootPileItems: any = [];
  isCharacters: boolean = true;
  monsters: any;
  allSelected: boolean = true;
  giveLootCurrency: any;

  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    private bsModalRef: BsModalRef,
    private charactersService: CharactersService,
    private authService: AuthService,
    private lootService: LootService,
    private sharedService: SharedService,
    private alertService: AlertService,
    private itemMasterService: ItemMasterService,
    private monsterTemplateService: MonsterTemplateService

  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.giveAwayItem = this.bsModalRef.content.giveAwayItem;
      this.lootPileItems = this.bsModalRef.content.lootPileItems;
      this.ruleSetId = this.giveAwayItem.ruleSet.ruleSetId;
      this.isLootPile = this.bsModalRef.content.isLootPile ? this.bsModalRef.content.isLootPile : false;
      let currencyTypesList = this.bsModalRef.content.currencyTypesList;
      try { currencyTypesList.forEach((x, i) => { x.lootId = 0; }); } catch (err) { }

      this.giveLootCurrency = currencyTypesList;
      if (this.giveLootCurrency) {
        this.giveLootCurrency.map(x => {
          x.amount = x.amount ? x.amount : 0;
        });
      }
      this.initialize();
    }, 0);

  }

  initialize() {
    if (this.lootPileItems && this.isLootPile) {
      this.lootPileItems.map(x => {
        x.selected = true;
        x.quantity = x.qty;
      });
    }

    this.isLoading = true;
    //get characters api call
    this.charactersService.getCharactersByRuleSetId<any>(this.ruleSetId, this.isFromLootGiveScreen)
      .subscribe(data => {
        this.characters = data;
        //this.isLoading = false;
      }, error => {
        //this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => {
        //get monsters api call
        this.monsterTemplateService.getMonstersByRuleSetId<any>(this.ruleSetId).subscribe(data => {
          this.monsters = data;
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });
      });

    //this.isLoading = true;
    //this.lootService.getItemsFromLootPile<any>(this.lootPileId)
    //  .subscribe(data => {
    //    this.itemsList = data;
    //    this.isLoading = false;
    //  }, error => {
    //    this.isLoading = false;
    //    let Errors = Utilities.ErrorDetail("", error);
    //    if (Errors.sessionExpire) {
    //      this.authService.logout(true);
    //    }
    //  }, () => { });
  }

  setCharacter(_selectedcharacter: any) {

    this.selectercharacter = _selectedcharacter;
  }

  close() {
    this.bsModalRef.hide();
  }
  Give() {
    //character
    if (this.isCharacters) {
      if (!(this.selectercharacter && this.selectercharacter.characterId)) {
        this.alertService.showMessage("Please select atleast one Character or Monster and try again.", "", MessageSeverity.error);
        return false;
      }
      if (this.isLootPile) {
        //model.characterId = this.characterId;
        //model.itemMasterId = null;
        this.isLoading = true;
        this.itemMasterService.getCharacterItemCount(this.ruleSetId, this.selectercharacter.characterId)
          .subscribe((data: any) => {
            let ItemCount = data.itemCount;
            let selectedItemCount = 0;
            let multiLootIds = [];
            if (this.lootPileItems) {
              this.lootPileItems.map(x => {
                if (x.selected) {
                  multiLootIds.push({ lootId: x.lootId, name: x.itemName, qty: x.qty });
                }
              });
            }
            let model = { characterId: this.selectercharacter.characterId, itemMasterId: null, multiItemMasterBundles: [], multiLootIds: multiLootIds };
            if (this.lootPileItems && this.lootPileItems.length) {
              selectedItemCount = this.lootPileItems.length;
            }
            if ((ItemCount + selectedItemCount) < 200) {

              this.lootService.lootItemsTakeByplayer<any>(model, false, false, false, true)
                .subscribe(data => {
                  if (data) {
                    if (data.message) {
                      this.alertService.showMessage(data.message, "", MessageSeverity.error);
                    } else {
                      this.alertService.showMessage("Adding Loot Item", "", MessageSeverity.success);
                    }
                    this.sharedService.updateItemsList(true);
                    this.event.emit(true);
                    this.close();
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

      } else {
        let _character = [];
        if (this.selectercharacter && this.selectercharacter.characterId) {
          _character.push({ iD: this.selectercharacter.characterId });

          let lootId = this.giveAwayItem.lootId;
          this.isLoading = true;
          this.lootService.giveItemTocharacter<any>(_character, lootId)
            .subscribe(data => {
              // console.log(data);
              this.isLoading = false;
              this.sharedService.updateItemsList(true);
              this.event.emit(true);
              this.close();
            }, error => {
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => { });
        } else {
          let message = 'Please select atleast one Character or Monster and try again.';
          this.alertService.showMessage(message, "", MessageSeverity.error);
        }
      }
    } else {  //Monster
      if (!(this.selectercharacter && this.selectercharacter.monsterId)) {
        this.alertService.showMessage("Please select atleast one Character or Monster and try again.", "", MessageSeverity.error);
        return false;
      }
      if (this.isLootPile) {
        this.isLoading = true;
        let monsterID = this.selectercharacter.monsterId;
        let multiLootIds = [];
        if (this.lootPileItems && this.lootPileItems.length) {
          this.lootPileItems.map(x => {
            if (x.selected) {
              multiLootIds.push({ lootId: x.lootId, name: x.itemName, qty: x.qty });
            }
          });
        }
        this.lootService.giveItemToMonster<any>(monsterID, multiLootIds).subscribe(data => {
          if (data) {
            if (data.message) {
              this.alertService.showMessage(data.message, "", MessageSeverity.error);
            } else {
              this.alertService.showMessage("Adding Loot Item", "", MessageSeverity.success);
            }
            this.sharedService.updateItemsList(true);
            this.event.emit(true);
            this.close();
          }
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });

      } else {
        this.isLoading = true;
        let multiLootIds = [];
        if (this.selectercharacter && this.selectercharacter.monsterId) {
          let monsterID = this.selectercharacter.monsterId;
          multiLootIds.push({ lootId: this.giveAwayItem.lootId, name: this.giveAwayItem.itemName });

          this.lootService.giveItemToMonster<any>(monsterID, multiLootIds)
            .subscribe(data => {
              if (data) {
                if (data.message) {
                  this.alertService.showMessage(data.message, "", MessageSeverity.error);
                } else {
                  this.alertService.showMessage("Adding Loot Item", "", MessageSeverity.success);
                }
                this.isLoading = false;
                this.sharedService.updateItemsList(true);
                this.event.emit(true);
                this.close();
              }
            }, error => {
              this.isLoading = false;
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => { });
        } else {
          let message = 'Please select atleast one Character or Monster and try again.';
          this.alertService.showMessage(message, "", MessageSeverity.error);
        }
      }
    }



  }

  showCharacters() {
    this.isCharacters = true;
  }

  showMonsters() {
    this.isCharacters = false;
  }

  setItemMaster(event: any, itemMaster: any) {
    this.lootPileItems.map((item) => {
      if (item.lootId == itemMaster.lootId) {
        item.selected = event.target.checked;
        if (!item.selected) {
          this.allSelected = false;
        }
      }
      return item;
    });

    let isAllSelected = this.lootPileItems.filter(x => !x.selected);
    if (!isAllSelected.length) {
      this.allSelected=true;
    }
  }

  quantityChanged(quantity, item) {
    this.lootPileItems.map((itm) => {
      if (itm.lootId == item.lootId) {
        itm.qty = quantity >= 1 ? quantity : itm.quantity;
      }
    });
  }

  selectDeselectAllItems(isSelected) {
    this.allSelected = isSelected;
    if (this.allSelected) {
      this.lootPileItems.map((item) => {
        item.selected = true;
      });
    }
    else {
      this.lootPileItems.map((item) => {
        item.selected = false;
      })
    }
  }


  currencyEnable(evt, currency) {
    currency.selected = evt.checked;
  }

  //updateQuantity(currency) {
  //  currency.selected = true;
  //  currency.amount = currency.total >= currency.amount ? currency.amount : currency.total;
  //}
}
