import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CharacterAbilities } from '../../../../core/models/view-models/character-abilities.model';
import { AlertService, MessageSeverity } from '../../../../core/common/alert.service';
import { CommonService } from '../../../../core/services/shared/common.service';
import { LocalStoreManager } from '../../../../core/common/local-store-manager.service';
import { SharedService } from '../../../../core/services/shared.service';
import { AbilityService } from '../../../../core/services/ability.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CharacterAbilityService } from '../../../../core/services/character-abilities.service';
import { DBkeys } from '../../../../core/common/db-keys';
import { User } from '../../../../core/models/user.model';
import { Utilities } from '../../../../core/common/utilities';
import { VIEW } from '../../../../core/models/enums';

@Component({
  selector: 'app-add-abilities',
  templateUrl: './add-abilities.component.html',
  styleUrls: ['./add-abilities.component.scss']
})
export class AddCharaterAbilityComponent implements OnInit {

  isLoading = false;
  title: string;
  _view: string;
  characterId: number;
  rulesetId: number;
  abilitiesList: any;
  characterAbilities: any;
  characterAbilityModal: any = new CharacterAbilities();
  searchText: string
  constructor(
    private router: Router, private bsModalRef: BsModalRef, private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager, private route: ActivatedRoute,
    private sharedService: SharedService, private commonService: CommonService,
    private abilityService: AbilityService, private characterAbilityService: CharacterAbilityService
  ) {
    this.route.params.subscribe(params => { this.characterId = params['id']; });
  }

  ngOnInit() {
    setTimeout(() => {

      this.title = this.bsModalRef.content.title;
      this._view = this.bsModalRef.content.button;
      let _abilityVM = this.bsModalRef.content.abilityVM;
      this.characterAbilityModal = this.characterAbilityService.abilityModelData(_abilityVM, this._view);
      this.characterId = this.characterAbilityModal.characterId;
      this.rulesetId = this.characterAbilityModal.rulesetId;
      this.characterAbilities = this.bsModalRef.content.characterAbilities;
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
      this.isLoading = true;
      this.abilityService.getAbilityByRuleset_add_Cache<any[]>(this.rulesetId)
        .subscribe(data => {
          this.abilitiesList = data;
          this.abilitiesList.forEach(function (val) { val.showIcon = false; val.selected = false; });
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

  setAbility(event: any, ability: any) {

    //if (event.target.checked) {
    //    this.characterAbilityModal.multiAbilities.push({ abilityId: ability.abilityId });
    //}
    //else {
    //    this.characterAbilityModal.multiAbilities
    //        .splice(this.characterAbilityModal.multiAbilities.indexOf({ abilityId: ability.abilityId }), 1);
    //}
    this.abilitiesList.map((abilityItem) => {
      if (abilityItem.abilityId == ability.abilityId) {
        abilityItem.selected = event.target.checked;
      }
      return abilityItem;
    })
    //this.characterAbilityModal.abilityId = ability.abilityId;
  }
  setEnableDisable(checked: boolean) {
    this.characterAbilityModal.isEnabled = checked;
  }

  submitForm(ability: any) {
    this.abilitiesList.map((abilityItem) => {
      if (abilityItem.selected) {
        this.characterAbilityModal.multiAbilities.push({ abilityId: abilityItem.abilityId });
      }
      return abilityItem;
    })
    if (this.characterAbilityModal.multiAbilities == undefined) {
      this.alertService.showMessage("Please select new Ability to Add.", "", MessageSeverity.error);
    }
    else if (this.characterAbilityModal.multiAbilities.length == 0) {
      this.alertService.showMessage("Please select new Ability to Add.", "", MessageSeverity.error);
    }
    else {
      if (this.characterAbilityModal.view === VIEW.DUPLICATE) {
        this.duplicateAbility(ability);
      }
      else {
        this.addEditAbility(ability);
      }
    }
  }

  addEditAbility(modal: any) {
    this.isLoading = true;
    this.characterAbilityService.createCharacterAbility(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Ability added successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.bsModalRef.hide();

          this.sharedService.UpdateCharacterAbilityList(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to Add", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  duplicateAbility(modal: any) {
    this.isLoading = true;
    this.characterAbilityService.duplicateCharacterAbility(modal)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Ability has been duplicated successfully.", "", MessageSeverity.success);
          this.bsModalRef.hide();
          this.sharedService.UpdateCharacterAbilityList(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Duplicate ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

        });
  }


  close() {
    this.bsModalRef.hide();
  }

}
