import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { ItemsService } from '../../../core/services/items.service';
import { combatantType } from '../../../core/models/enums';

@Component({
  selector: 'app-give-player-items',
  templateUrl: './give-player-items.component.html',
  styleUrls: ['./give-player-items.component.scss']
})
export class GivePlayerItemsComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  searchText: string;
  allSelected: boolean = false;
  selectedItems = [];
  combatantsList: any[] = [];
  giveTo_Combatant: any;
  playerItems: any;
  givenByPlayerID: number;
  combatantsType = combatantType;
  selectedItemsList: any[] = [];

  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    public modalService: BsModalService,
    private itemsService: ItemsService) { }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.ruleSetId;
      this.characterId = this.bsModalRef.content.characterId;
      this.giveTo_Combatant = this.bsModalRef.content.giveTo_Combatant;
      this.playerItems = this.bsModalRef.content.playerItems;
      this.combatantsList = this.bsModalRef.content.combatants;
      this.givenByPlayerID = this.bsModalRef.content.givenByPlayerID;

      this.playerItems.map(x => {
        x.selected = false;
        x.qty = x.quantity;
      });

    }, 0);
  }

  setItemMaster(event: any, itemMaster: any) {
    this.playerItems.map((item) => {
      if (item.itemId == itemMaster.itemId) {
        item.selected = event.target.checked;
        this.selectedItemsList.push(item);
      }
      return item;
    })
  }

  submitForm() {
    this.selectedItems = [];
    let invalidQty = false;
    this.playerItems.map((item) => {
      if (item.selected) {
        if (item.qty <= item.quantity) {
          this.selectedItems.push({ iD: item.itemId, qty: item.qty });
        } else {
          //this.alertService.showMessage("Quantity is greater than current quantity", "", MessageSeverity.error);
          invalidQty = true;
        }
      }
      return item;

    })
    if (this.selectedItems == undefined || this.selectedItems.length == 0) {
      if (invalidQty) {
        this.alertService.showMessage("The quantity to be given is greater than the quantity possessed. Please reduce this number and try again.", "", MessageSeverity.error);
      } else {
        this.alertService.showMessage("Please select Item(s) to Give", "", MessageSeverity.error);
      }
    }
    else {
      this.GiveSelectedItems();
    }

  }
  GiveSelectedItems() {

    this.isLoading = true;
    this.itemsService.GivePlayerItems<any>(this.selectedItems, this.giveTo_Combatant[0], this.givenByPlayerID, this.rulesetId)
      .subscribe(result => {
        this.isLoading = false;
        this.event.emit(true);
        this.close();
        this.alertService.showMessage("Items Given to " + this.giveTo_Combatant[0].name + "", "", MessageSeverity.success);
      }, error => {
        this.isLoading = false;
        this.close();
      });

  }

  selectDeselectFilters(selected) {
    this.allSelected = selected;
    if (this.allSelected) {
      this.playerItems.map((item) => {
        item.selected = true;
      })
    }
    else {
      this.playerItems.map((item) => {
        item.selected = false;
      })
    }
  }
  close() {
    this.bsModalRef.hide();
  }

  quantityChanged(quantity, item) {
    this.selectedItemsList.map((itm) => {
      if (itm.itemId == item.itemId) {
        if (itm.quantity >= quantity) {
          itm.qty = quantity >= 1 ? quantity : 1;
        } else {
          //itm.qty = itm.quantity;
          //this.alertService.showMessage("The quantity to be given is greater than the quantity possessed. Please reduce this number and try again.", "", MessageSeverity.error);
        }     
      }
    });
    this.playerItems.map((itm) => {
      if (itm.itemId == item.itemId) {
        if (itm.quantity >= quantity) {
          itm.qty = quantity >= 1 ? quantity : 1;
        } else {
          //itm.qty = itm.quantity;
        }     
      }
    });
  }

  get SelectedCombatantsSettings() {
    return {
      primaryKey: "id",
      labelKey: "name",
      text: "Select",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: false,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "top"
    };
  }

}
