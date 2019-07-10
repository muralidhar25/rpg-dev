import { Component, OnInit, EventEmitter} from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CombatMonsterTypeItems, CombatItemsType } from '../../../core/models/enums';
import { MessageSeverity, AlertService } from '../../../core/common/alert.service';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { DBkeys } from '../../../core/common/db-keys';
import { Items } from '../../../core/models/view-models/items.model';
import { SharedService } from '../../../core/services/shared.service';
import { ItemsService } from '../../../core/services/items.service';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { SaveCombatMonsterComponent } from '../save-combat-monster/save-combat-monster.component';
import { AddRemoveBuffEffectsComponent } from '../combat-buffeffects-addremove/combat-buffeffects-addremove.component';
//import { AddMonster } from '../../../core/models/view-models/addMonster.model';


@Component({
    selector: 'app-buffeffects-combat-details',
    templateUrl: './combat-buffeffects-details.component.html',
  styleUrls: ['./combat-buffeffects-details.component.scss']
})
export class CombatBuffeffectDetailsComponent implements OnInit {

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
  recordImage: any;
  recordName: any;
 // combatMonster   =  new AddMonster();

    constructor(
        private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
        public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
        private sharedService: SharedService, private commonService: CommonService,
      private itemsService: ItemsService, private itemMasterService: ItemMasterService, private monsterTemplateService: MonsterTemplateService
    ) {
        this.route.params.subscribe(params => { this.characterId = params['id']; });
    }

    ngOnInit() {
        setTimeout(() => {

            this.title = this.bsModalRef.content.title;
            this._view = this.bsModalRef.content.button;
            this.rulesetId = this.bsModalRef.content.rulesetID;
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
              this.recordName = this.bsModalRef.content.recordName;
              this.recordImage = this.bsModalRef.content.recordImage;
           this.initialize();
        }, 0);
    }

  private initialize() {
   
    this.itemsList = [
      {
          recordId: 1,
          name: 'Monster1',
          image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTER,
          quantity: 0
      },
      {
        recordId: 2,
        name: 'Monster2',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTERGROUP,
        quantity: 0
      },
      {
        recordId:3,
        name: 'Monster3',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTERTEMPLATE,
        quantity: 0
      },
      {
        recordId: 4,
        name: 'Monster4',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTER,
        quantity: 0
      },
      {
        recordId: 5,
        name: 'Monster5',
        image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
        selected: false,
        type: CombatMonsterTypeItems.MONSTERGROUP,
        quantity: 0
      }
    ]

        
    }

  
  edit() {
    console.log('edit clicked');
    //open modal
    this.close();
    this.bsModalRef = this.modalService.show(AddRemoveBuffEffectsComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Buff & Effects';
    this.bsModalRef.content.button = 'Save';
    this.bsModalRef.content.rulesetID = this.rulesetId;
    this.bsModalRef.content.recordName = this.recordName;
    this.bsModalRef.content.recordImage = this.recordImage;
  }

  
  close() {
        this.bsModalRef.hide();
   }

}
