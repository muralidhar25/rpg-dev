import { Component, OnInit, EventEmitter} from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { VIEW } from '../../../core/models/enums';
import { MessageSeverity, AlertService, DialogType } from '../../../core/common/alert.service';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { DBkeys } from '../../../core/common/db-keys';
import { Items } from '../../../core/models/view-models/items.model';
import { SharedService } from '../../../core/services/shared.service';
import { ItemsService } from '../../../core/services/items.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { MonsterTemplate } from '../../../core/models/view-models/monster-template.model';


@Component({
  selector: 'app-add-remove-associate-items',
  templateUrl: './add-remove-associate-items.component.html',
  styleUrls: ['./add-remove-associate-items.component.scss']
})
export class AddRemoveAssociateItemsComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
    isLoading = false;
    title: string;
    _view: string;
    searchText: string;
  itemsList: any[] = [];
  selectedItems: any[] = [];
  monster: MonsterTemplate;
  recordName: string = '';
  recordImage: string = '';
  allSelected: boolean = false;
    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService,
      private itemsService: ItemsService,
      private monsterTemplateService: MonsterTemplateService
    ) {
        
    }

    ngOnInit() {
        setTimeout(() => {
            this.title = this.bsModalRef.content.title;
            this._view = this.bsModalRef.content.button;
          this.recordName = this.bsModalRef.content.recordName;
          this.recordImage = this.bsModalRef.content.recordImage;            
          this.monster = this.bsModalRef.content.monster;

          
         
          this.selectedItems = this.bsModalRef.content.selectedItems;
          this.itemsList = this.bsModalRef.content.itemsList;
          
           this.initialize();
        }, 0);
    }

  private initialize() {
    this.itemsList.map((x) => {
      x.selected = false;
      x.itemId = 0;
      if (this.selectedItems.filter(a => a.itemMasterId == x.itemMasterId).length) {
        x.selected = true;
        x.itemId = this.selectedItems.filter(a => a.itemMasterId == x.itemMasterId)[0].itemId;
      }
    })
        
    }

  setItem(event: any, item: any) {
    item.selected = event.target.checked;    

    if (this.itemsList.filter(x => x.selected).length === this.itemsList.length) {
      this.allSelected = true;
    }
    else {
      this.allSelected = false;
    }
  }

  submitForm() {
    
    debugger
    let itemsName = '';
    this.selectedItems.map((x) => {
      if (this.itemsList.filter(a => a.itemId == x.itemId && !a.selected).length) {
        itemsName += " " + x.name+',';
      }
    })

    if (itemsName) {
      itemsName = itemsName.substring(0, itemsName.length-1)
      this.alertService.showDialog("Are you sure you want to delete these items " + itemsName + ".",
        DialogType.confirm, () => this.AddRemoveItems(), () => { this.close() }, "Ok", "Cancel");
    }
    else {
      this.AddRemoveItems()
    }
      
   
    
  }
  AddRemoveItems() {
    this.isLoading = true;
    let _msg = 'Updating associated Items ...';
    this.alertService.startLoadingMessage("", _msg);
    debugger
    this.monsterTemplateService.AddRemoveMonsterRecords(this.itemsList, this.monster.monsterId, 'I')
      .subscribe(data => {
        //if (data) {
        this.event.emit(data);
        //}
        this.alertService.stopLoadingMessage();
        this.isLoading = false;
        this.close();
        this.sharedService.updateMonsterList(true);
      }, error => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showMessage(error, "", MessageSeverity.error);
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
  }
  
    


    close() {
        this.bsModalRef.hide();
  }

  selectDeselectFilters(isSelectAll) {
    this.allSelected = isSelectAll;
    
    debugger
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
}
