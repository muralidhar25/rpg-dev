import { Component, OnInit, EventEmitter} from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { VIEW } from '../../../core/models/enums';
import { MessageSeverity, AlertService } from '../../../core/common/alert.service';
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
  selector: 'app-add-remove-associate-abilities',
  templateUrl: './add-remove-associate-abilities.component.html',
  styleUrls: ['./add-remove-associate-abilities.component.scss']
})
export class AddRemoveAssociateAbilitiesComponent implements OnInit {

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
     
      if (this.selectedItems.filter(a => a.abilityId == x.abilityId).length) {
        x.selected = true;
       
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
    
    
    
      this.isLoading = true;
    let _msg = 'Updating associated Abilities ...';
    this.alertService.startLoadingMessage("", _msg);
    
    this.monsterTemplateService.AddRemoveMonsterRecords(this.itemsList, this.monster.monsterId,'A')
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
