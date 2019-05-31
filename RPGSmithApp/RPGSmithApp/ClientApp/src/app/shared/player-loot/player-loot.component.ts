import { Component, OnInit} from '@angular/core';
import { BsModalService, BsModalRef} from 'ngx-bootstrap';
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

@Component({
  selector: 'app-player-loot',
  templateUrl: './player-loot.component.html',
  styleUrls: ['./player-loot.component.scss']
})
export class PlayerLootComponent implements OnInit {

  isLoading = false;
  characterId: number;
  characterName: string='';
  rulesetId: number;
  itemsList: any;
  characterItemModal: any = new Items();
  searchText: string;
  //isloading: boolean = false;
  allSelected: boolean = false;
  constructor(

    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private lootService: LootService,
    private sharedService: SharedService,
    private appService: AppService1,

  ) {

  }

  ngOnInit() {
    if (this.rulesetId == undefined)
      this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
    setTimeout(() => {
      this.characterId = this.bsModalRef.content.headers.headerId
      this.characterItemModal.characterId = this.bsModalRef.content.headers.headerId;
      this.characterName = this.bsModalRef.content.headers.headerName
    }, 0);
    this.initialize();
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.lootService.getLootItemsForPlayers<any>(this.rulesetId)
        .subscribe(data => {
          if (data) {
            
            this.characterItemModal.itemMasterId = -1;
            this.itemsList = data;
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


  setItemMaster(event: any, itemMaster: any) {
    this.itemsList.map((item) => {
      if (item.lootId == itemMaster.lootId) {
        item.selected = event.target.checked;
      }
      return item;
    })
  }
  submitForm(itemMaster: any) {
    this.characterItemModal.multiLootIds = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.characterItemModal.multiLootIds.push({ lootId: item.lootId, name: item.itemName});
      }
      return item;
     
    })
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
    this.lootService.lootItemsTakeByplayer<any>(model)
      .subscribe(data => {
        if (data) {
          if (data.message) {
            this.alertService.showMessage(data.message, "", MessageSeverity.error);
            } else {
              this.alertService.showMessage("Adding Loot Item", "", MessageSeverity.success);
          }
          this.close();
          this.appService.updateItemsList(true);
          this.appService.updateChatWithTakenByLootMessage(this.characterName);
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
}
