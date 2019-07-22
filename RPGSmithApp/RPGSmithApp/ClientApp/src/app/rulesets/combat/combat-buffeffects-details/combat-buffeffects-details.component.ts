import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CombatMonsterTypeItems, CombatItemsType, combatantType } from '../../../core/models/enums';
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
import { AddBuffAndEffectComponent } from '../../../shared/buffs-and-effects/add-buffs-and-effects/add-buffs-and-effects.component';
import { combatant } from '../../../core/models/view-models/combatants.model';
import { AddRemoveAssociateBuffAndEffectsComponent } from '../../../records/monster/add-remove-associate-buff-effects/add-remove-associate-buff-effects.component';
import { CombatService } from '../../../core/services/combat.service';
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
  buffEffectList: any[] = [];
  type: any;
  selectedBuffAndEffectsList: any[] = [];
  ListBuffAndEffects: any[] = [];
  monster: any;
  monsterId: number;
  combatatntsType = combatantType
  hideEditBtn: boolean = false;
  // combatMonster   =  new AddMonster();

  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, private commonService: CommonService,
    private itemsService: ItemsService, private itemMasterService: ItemMasterService, private monsterTemplateService: MonsterTemplateService,
    private combatService: CombatService) {
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
      this.buffEffectList = this.bsModalRef.content.buffEffectList;
      this.type = this.bsModalRef.content.type;
      if (this.bsModalRef.content.monster) {
        this.monster = this.bsModalRef.content.monster;
        if (this.monster.monsterId) {
          this.monsterId = this.monster.monsterId;
        }
      }
      if (this.bsModalRef.content.character) {
        this.characterId = this.bsModalRef.content.character.characterId;
      }
      debugger
      this.hideEditBtn = this.bsModalRef.content.hideEditBtn  ? true : false;

      this.initialize();
      this.GetBuffsAndEffects();
    }, 0);

  }

  private initialize() {
    if (this.buffEffectList) {
      this.buffEffectList.map(x => {
        if (this.type == this.combatatntsType.MONSTER) {
          this.itemsList.push({
            recordId: x.buffAndEffectId,
            name: x.buffAndEffect.name,
            image: x.buffAndEffect.imageUrl,
            selected: false
          });
          this.selectedBuffAndEffectsList.push(x);
        }
        if (this.type == this.combatatntsType.CHARACTER) {
          this.itemsList.push({
            recordId: x.buffAndEffect.buffAndEffectId,
            name: x.buffAndEffect.name,
            image: x.buffAndEffect.imageUrl,
            selected: false
          });
          this.selectedBuffAndEffectsList.push({ text: x.buffAndEffect.name, value: x.buffAndEffect.buffAndEffectId, buffAndEffectId: x.buffAndEffect.buffAndEffectId, image: x.buffAndEffect.imageUrl });
        }
      });
    }

    //this.itemsList = [
    //  {
    //    recordId: 1,
    //    name: 'Monster1',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTER,
    //    quantity: 0
    //  },
    //  {
    //    recordId: 2,
    //    name: 'Monster2',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTERGROUP,
    //    quantity: 0
    //  },
    //  {
    //    recordId: 3,
    //    name: 'Monster3',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTERTEMPLATE,
    //    quantity: 0
    //  },
    //  {
    //    recordId: 4,
    //    name: 'Monster4',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTER,
    //    quantity: 0
    //  },
    //  {
    //    recordId: 5,
    //    name: 'Monster5',
    //    image: 'https://rpgsmithsa.blob.core.windows.net/user-248c6bae-fab3-4e1f-b91b-f674de70a65d/e21b5355-9824-4aa0-b3c0-274cf9255e45.jpg',
    //    selected: false,
    //    type: CombatMonsterTypeItems.MONSTERGROUP,
    //    quantity: 0
    //  }
    //]
  }

  GetBuffsAndEffects() {
    this.combatService.getBuffAndEffctList<any>(this.monsterId, this.rulesetId)
      .subscribe(data => {
        this.ListBuffAndEffects = data;
      }, error => {
      }, () => { });
  }

  edit() {
    this.close();
    //console.log('edit clicked');
    ////open modal
    //this.close();
    //this.bsModalRef = this.modalService.show(AddRemoveBuffEffectsComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
    //this.bsModalRef.content.title = 'Buff & Effects';
    //this.bsModalRef.content.button = 'Save';
    //this.bsModalRef.content.rulesetID = this.rulesetId;
    //this.bsModalRef.content.recordName = this.recordName;
    //this.bsModalRef.content.recordImage = this.recordImage;

    if (this.type == combatantType.CHARACTER) {
      this.bsModalRef = this.modalService.show(AddBuffAndEffectComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });

      this.bsModalRef.content.rulesetID = this.rulesetId;
      this.bsModalRef.content.characterID = this.characterId;
      this.bsModalRef.content.selectedBuffAndEffectsList = this.selectedBuffAndEffectsList;
      this.bsModalRef.content.pauseBuffAndEffectCreate = true;
    }
    if (this.type == combatantType.MONSTER) {
      this.bsModalRef = this.modalService.show(AddRemoveAssociateBuffAndEffectsComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = 'Select Buffs & Effects';
      this.bsModalRef.content.button = 'Save';
      this.bsModalRef.content.monster = this.monster;
      this.bsModalRef.content.selectedItems = this.selectedBuffAndEffectsList;
      this.bsModalRef.content.itemsList = this.ListBuffAndEffects;
      this.bsModalRef.content.recordName = this.recordName;
      this.bsModalRef.content.recordImage = this.recordImage;
    }

  }

  close() {
    this.bsModalRef.hide();
  }

  goToDetail(item) {
    if (this.type == combatantType.MONSTER) {
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
      this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
      this.router.navigate(['/ruleset/buff-effect-details', item.recordId]);
    }
    if (this.type == combatantType.CHARACTER) {
      this.GoToCharbuff(item.recordId);
    }
    this.close();
  }

  GoToCharbuff(RulesetBuffID: number) {
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_GM, true);
    this.localStorage.localStorageSetItem(DBkeys.IsComingFromCombatTracker_PC, false);
    this.router.navigate(['/character/buff-effect-detail', RulesetBuffID]);
  }

}
