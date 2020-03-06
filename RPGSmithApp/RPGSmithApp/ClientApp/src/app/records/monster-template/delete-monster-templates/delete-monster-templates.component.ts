import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AppService1 } from '../../../app.service';
import { CharacterSpellService } from '../../../core/services/character-spells.service';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { User } from '../../../ng-chat/core/user';
import { ItemMasterService } from '../../../core/services/item-master.service';
import { SpellsService } from '../../../core/services/spells.service';
import { AbilityService } from '../../../core/services/ability.service';
import { BuffAndEffectService } from '../../../core/services/buff-and-effect.service';
import { MonsterTemplateService } from '../../../core/services/monster-template.service';
import { SharedService } from '../../../core/services/shared.service';

@Component({
  selector: 'app-delete-monster-templates',
  templateUrl: './delete-monster-templates.component.html',
  styleUrls: ['./delete-monster-templates.component.scss']
})
export class DeleteMonsterTempltesComponent implements OnInit {

  isLoading = false;
  characterId: number;
  rulesetId: number;
  itemsList: any;
  searchText: string;
  allSelected: boolean = false;
  selectedItems = [];
  page: number = 1;
  pageSize: number = 99999;

  constructor(
    private bsModalRef: BsModalRef,
    private alertService: AlertService,
    private authService: AuthService,
    public modalService: BsModalService,
    private localStorage: LocalStoreManager,
    private appService: AppService1,
    private sharedService: SharedService,
    private monsterTemplateService: MonsterTemplateService) { }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.ruleSetId;
      this.characterId = this.bsModalRef.content.characterId;
      this.initialize();
    }, 0);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.isLoading = true;
      this.monsterTemplateService.getMonsterTemplateByRuleset_spWithPagination_Cache<any>(this.rulesetId, this.page, this.pageSize, 3) // 3 Alphabet sorting
        .subscribe(data => {
          this.itemsList = data.monsterTemplates;
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { })
    }
  }

  setItemMaster(event: any, itemMaster: any) {
    this.itemsList.map((item) => {
      if (item.monsterTemplateId == itemMaster.monsterTemplateId) {
        item.selected = event.target.checked;
      }
      return item;
    })
  }

  submitForm() {
    this.selectedItems = [];
    this.itemsList.map((item) => {
      if (item.selected) {
        this.selectedItems.push({ monsterTemplateId: item.monsterTemplateId, isBundle: item.isBundle});
      }
      return item;

    })
    if (this.selectedItems == undefined) {
      this.alertService.showMessage("Please select Records to Delete.", "", MessageSeverity.error);
    }
    else if (this.selectedItems.length == 0) {
      this.alertService.showMessage("Please select Records to Delete.", "", MessageSeverity.error);
    }
    else {
      this.RemoveSelectedItems();
    }

  }
  RemoveSelectedItems() {
    this.isLoading = true;
    this.monsterTemplateService.deleteMonsterTemplates<any>(this.selectedItems, this.rulesetId)
      .subscribe(data => {
        this.alertService.showMessage("Deleting Records", "", MessageSeverity.success);
              this.close();
        this.sharedService.updateMonsterTemplateList(true);
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
  close() {
    this.bsModalRef.hide();
  }
}
