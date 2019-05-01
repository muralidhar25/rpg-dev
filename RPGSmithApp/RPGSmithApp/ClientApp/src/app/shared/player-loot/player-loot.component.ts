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
  rulesetId: number;
  itemsList: any;
  characterItemModal: any = new Items();
  searchText: string;
  //isloading: boolean = false;

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
      this.characterItemModal.characterId = this.bsModalRef.content.headers.headerId;
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
            console.log(data);
          this.characterItemModal.itemMasterId = -1 ;
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
        this.characterItemModal.multiLootIds.push({ lootId: item.lootId });
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
        this.alertService.showMessage("Adding Loot Item", "", MessageSeverity.success);
        this.close();
        this.appService.updateItemsList(true);
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
