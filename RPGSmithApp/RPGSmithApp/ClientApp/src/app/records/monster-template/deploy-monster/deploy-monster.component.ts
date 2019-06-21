import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { CounterTile } from '../../../core/models/tiles/counter-tile.model';
import { CharacterTile } from '../../../core/models/tiles/character-tile.model';
import { CharacterDashboardPage } from '../../../core/models/view-models/character-dashboard-page.model';
import { ColorService } from '../../../core/services/tiles/color.service';
import { SharedService } from '../../../core/services/shared.service';
import { CounterTileService } from '../../../core/services/tiles/counter-tile.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';

import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-deploy-monster',
  templateUrl: './deploy-monster.component.html',
  styleUrls: ['./deploy-monster.component.scss']
})
export class DeployMonsterComponent implements OnInit {

 
  value: number;
  isLoading: boolean = false;
  isMouseDown: boolean = false;
  interval: any;
  monsterImage: any;
  title: string;
  monsterInfo: any;

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
    private colorService: ColorService, private localStorage: LocalStoreManager, private counterTileService: CounterTileService,
    private alertService: AlertService, private authService: AuthService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;
      this.monsterInfo = this.bsModalRef.content.monsterInfo;
      this.monsterImage = this.monsterInfo.imageUrl;
      this.value = 1;
    }, 0);
  }

  

  close() {
    this.bsModalRef.hide();
    ///this.destroyModalOnInit();
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }

  saveCounter() {
    console.log(this.value);
    //debugger
    //let validForm = true;
    //if (this.tileModel.characterId == 0 || this.tileModel.characterId == undefined) {
    //  if (this.isSharedLayout) {
    //    this.alertService.showMessage("", "Disallowed, only the GM can update this counter.", MessageSeverity.error);
    //  }
    //  else {
    //    this.alertService.showMessage("", "Character is not selected.", MessageSeverity.error);
    //  }
    //  validForm = false;
    //}
    //else if (this.tileModel.tileTypeId == 0 || this.tileModel.tileTypeId == undefined) {
    //  this.alertService.showMessage("", "Character tile is not selected.", MessageSeverity.error);
    //  validForm = false;
    //}
    //else if ((this.counterFormModel.minimum === undefined && this.counterFormModel.maximum !== undefined)
    //  || (this.counterFormModel.minimum === null && this.counterFormModel.maximum !== null)) {
    //  this.alertService.showMessage("", "The minimum value can not be empty if maximum value is provided.", MessageSeverity.error);
    //  validForm = false;
    //}
    //else if ((this.counterFormModel.minimum !== undefined && this.counterFormModel.maximum === undefined)
    //  || (this.counterFormModel.minimum !== null && this.counterFormModel.maximum === null)) {
    //  this.alertService.showMessage("", "The maximum value can not be empty if minimum value is provided.", MessageSeverity.error);
    //  validForm = false;
    //}
    //else if ((this.counterFormModel.minimum && this.counterFormModel.maximum)
    //  || (this.counterFormModel.minimum === 0 || this.counterFormModel.maximum === 0)) {

    //  if (this.counterFormModel.minimum > this.counterFormModel.maximum) {
    //    this.alertService.showMessage("", "The minimum value could not be greater than the maximum value.", MessageSeverity.error);
    //    validForm = false;
    //  }
    //  else if (this.counterFormModel.defaultValue !== undefined) {
    //    if (this.counterFormModel.minimum > this.counterFormModel.defaultValue
    //      || this.counterFormModel.maximum < this.counterFormModel.defaultValue
    //    ) {
    //      this.alertService.showMessage("", "The Default Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
    //      validForm = false;
    //    }
    //  }
    //  if (this.counterFormModel.currentValue !== undefined) {
    //    if (this.counterFormModel.minimum > this.counterFormModel.currentValue
    //      || this.counterFormModel.maximum < this.counterFormModel.currentValue
    //    ) {
    //      if (validForm)
    //        this.alertService.showMessage("", "The Current Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
    //      validForm = false;
    //    }
    //  }
    //}

    //if (validForm) {

    //  this.tileModel.counterTile = this.counterFormModel;

    //  this.isLoading = true;
    //  let _msg = "Updating Counter Tile...";

    //  this.alertService.startLoadingMessage("", _msg);
    //  this.addEditCounterTile(this.tileModel);
    //}
  }



  increment() {
      let step: number =  1;
      this.value += step;
  }

  decrement() {
    let step: number = 1;
    if (this.value == 1) {
      return false;
    } else {
      this.value -= step;
    }
  }

  resetValue() {
    this.value = 1;
  }

  changeCurrentValue(event: any) {
    let value = +event.target.value;
  }

//  setCurrentValue(value: number) {
//    //setTimeout(() => {
//    this.counterFormModel.currentValue = value;
//    //}, 0);
//  }
  mouseDown(type) {
    let time = new Date();
    time.setMilliseconds(time.getMilliseconds() + 600); //600 miliseconds delay to start the numbering
    this.isMouseDown = true;
    this.interval = setInterval(() => {
      if (time < new Date()) {
        if (this.isMouseDown) {
          if (type === -1)//Decrement
          {
            this.decrement();
          }
          if (type === 1)//Increment
          {
            this.increment();
          }
        }
      }
    }, 50);
  }
  mouseUp() {
    this.isMouseDown = false;
    clearInterval(this.interval);
    this.interval = undefined;
  }
}
