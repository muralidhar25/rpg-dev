import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PlatformLocation } from '@angular/common';
import { BuffAndEffectService } from '../../../core/services/buff-and-effect.service';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
import { BuffAndEffect } from '../../../core/models/view-models/buff-and-effect.model';
import { Characters } from '../../../core/models/view-models/characters.model';
import { CreateBuffAndEffectsComponent } from '../../create-buff-and-effects/create-buff-and-effects.component';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { SharedService } from '../../../core/services/shared.service';



@Component({
  selector: 'app-add-buffs-and-effects',
  templateUrl: './add-buffs-and-effects.component.html',
  styleUrls: ['./add-buffs-and-effects.component.scss']
})
export class AddBuffAndEffectComponent implements OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  isLoading: boolean = false;
  ruleSetId: number = 0;
  characterID: number = 0;
  buffsEffectsList: any[] = [];
  selectedBuffAndEffectsList: any[] = [];
  pauseBuffAndEffectCreate: boolean = false;
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private location: PlatformLocation,
    private buffAndEffectService: BuffAndEffectService, private authService: AuthService, private alertService: AlertService,
    private sharedService: SharedService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.pauseBuffAndEffectCreate = this.bsModalRef.content.pauseBuffAndEffectCreate ? this.bsModalRef.content.pauseBuffAndEffectCreate : false;
      this.ruleSetId = this.bsModalRef.content.rulesetID ? this.bsModalRef.content.rulesetID : 0;
      this.characterID = this.bsModalRef.content.characterID ? this.bsModalRef.content.characterID : 0;
      let SelectedBuffs: any[] = this.bsModalRef.content.selectedBuffAndEffectsList;
      if (SelectedBuffs) {
        if (SelectedBuffs.length) {
          this.selectedBuffAndEffectsList = SelectedBuffs;
        }
      }
      this.initialize();
    }, 0);
  }
  initialize() {
    this.isLoading = true;
    this.buffAndEffectService.getBuffAndEffectByRuleset_add<any>(this.ruleSetId)
      .subscribe(data => {
        this.buffsEffectsList = data;
        //console.log('aaaaaaa',data)
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
  close() {
    this.bsModalRef.hide();
  }
  setItem(event: any, _buffAndEffect: BuffAndEffect) {
    if (event.target.checked) {
      const _containsItems = Object.assign([], this.selectedBuffAndEffectsList);

      _containsItems.push({ text: _buffAndEffect.name, value: _buffAndEffect.buffAndEffectId, buffAndEffectId: _buffAndEffect.buffAndEffectId, image: _buffAndEffect.imageUrl });
      this.selectedBuffAndEffectsList = _containsItems;
    }
    else {

      let _item = { text: _buffAndEffect.name, value: _buffAndEffect.buffAndEffectId, buffAndEffectId: _buffAndEffect.buffAndEffectId, image: _buffAndEffect.imageUrl };
      const index: number = this.selectedBuffAndEffectsList.indexOf(_item);
      if (index !== -1) {
        this.selectedBuffAndEffectsList.splice(index, 1);
      }
      else {
        const _arrayItems = Object.assign([], this.selectedBuffAndEffectsList);
        this.selectedBuffAndEffectsList = _arrayItems.filter(function (itm) {
          if (itm.buffAndEffectId !== _buffAndEffect.buffAndEffectId) return _buffAndEffect;
        });
      }
    }
  }
  submitForm() {
    this.isLoading = true;
    let characters: Characters[] = [];
    characters.push(new Characters(this.characterID));
    let nonSelectedBuffAndEffectsList: BuffAndEffect[] = [];
    nonSelectedBuffAndEffectsList = this.buffsEffectsList.map(x => {
      if (this.selectedBuffAndEffectsList.filter(SC => SC.buffAndEffectId == x.buffAndEffectId).length) {

      }
      else {
        return x;
      }

    })
    nonSelectedBuffAndEffectsList = nonSelectedBuffAndEffectsList.filter(SC => SC)
    this.buffAndEffectService.assignBuffAndEffectToCharacter<any>(this.selectedBuffAndEffectsList, characters, [], nonSelectedBuffAndEffectsList, this.characterID)
      .subscribe(data => {
        this.event.emit(this.selectedBuffAndEffectsList);
        this.sharedService.updateCharacterBuffEffect({ characterId: this.characterID, characterBuffAndEffects: this.selectedBuffAndEffectsList });
        this.isLoading = false;
        this.close();

      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });
  }
  CreateBuff() {

    // this.alertService.startLoadingMessage("", "Checking records");      
    this.buffAndEffectService.getBuffAndEffectsCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          this.close();
          this.bsModalRef = this.modalService.show(CreateBuffAndEffectsComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Create New Buff & Effect';
          this.bsModalRef.content.button = 'CREATE';
          this.bsModalRef.content.ruleSetId = this.ruleSetId;
          this.bsModalRef.content.buffAndEffectVM = { ruleSetId: this.ruleSetId };
          this.bsModalRef.content.characterID = this.characterID;
          this.bsModalRef.content.IsFromCharacter = true;
          this.bsModalRef.content.selectedBuffAndEffectsList = this.selectedBuffAndEffectsList;
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });
  }

}
