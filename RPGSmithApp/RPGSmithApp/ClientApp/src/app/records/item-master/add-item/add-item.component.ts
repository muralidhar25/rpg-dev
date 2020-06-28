import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { PlatformLocation } from '@angular/common';
import { DBkeys } from '../../../core/common/db-keys';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { Utilities } from '../../../core/common/utilities';
import { SharedService } from '../../../core/services/shared.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemMasterComponent implements OnInit {

  rulesetId: number;
  isLoading = false;
  itemsList: any[] = [];

  constructor(
    private route: ActivatedRoute, private alertService: AlertService, private bsModalRef: BsModalRef, private sharedService: SharedService,
    private modalService: BsModalService, private authService: AuthService, private itemMasterService: ItemMasterService,
    private location: PlatformLocation, private localStorage: LocalStoreManager) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.title;
      this.itemsList = this.bsModalRef.content.itemsList;
      if (this.rulesetId == undefined)
        this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      this.initialize();
    }, 0);
  }
  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      //this.isLoading = true;
      
    }
  }
  submitForm() {
    if (this.itemsList.filter(x => x.selected).length) {
      this.sharedService.updateAddItemMastersList(this.itemsList.filter(x => x.selected));
      this.close();
    }
    else {
      this.alertService.showMessage("Please select atleast one Item Template to Add.", "", MessageSeverity.error);
    }
  }
  setItemMaster(event: any, itemMaster: any) {
    this.itemsList.map((item) => {
      if (item.itemMasterId == itemMaster.itemMasterId) {
        item.selected = event.target.checked;
      }
      return item;
    })
    
  }
  close() {
    this.bsModalRef.hide();
  }

}
