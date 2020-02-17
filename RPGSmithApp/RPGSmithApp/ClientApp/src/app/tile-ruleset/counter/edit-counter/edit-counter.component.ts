import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { RulesetCounterTileComponent } from '../counter.component';
import { CounterTile } from '../../../core/models/tiles/counter-tile.model';
import { RulesetTile } from '../../../core/models/tiles/ruleset-tile.model';
import { RulesetDashboardPage } from '../../../core/models/view-models/ruleset-dashboard-page.model';
import { SharedService } from '../../../core/services/shared.service';
import { ColorService } from '../../../core/services/tiles/color.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { CounterTileService } from '../../../core/services/tiles/counter-tile.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { VIEW } from '../../../core/models/enums';
import { Utilities } from '../../../core/common/utilities';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-edit-counter',
  templateUrl: './edit-counter.component.html',
  styleUrls: ['./edit-counter.component.scss']
})
export class RulesetEditCounterComponent implements OnInit {

  counterFormModel: any = new CounterTile();
  value: number;
  tileModel: any = new RulesetTile();;
  rulesetId: number;
  pageId: number;
  pageDefaultData = new RulesetDashboardPage();
  isLoading: boolean = false;

  adjustCounterValue: any;

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.saveCounter();
    }
    if (event.keyCode === 109) {  //key press "-"
      this.AdjustCounter(true, this.adjustCounterValue);
    }
    if (event.keyCode === 107) { //key press "+"
      this.AdjustCounter(false, this.adjustCounterValue);
    }
  }

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private sharedService: SharedService,
    private colorService: ColorService, private localStorage: LocalStoreManager, private counterTileService: CounterTileService,
    private alertService: AlertService, private authService: AuthService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    debugger
    setTimeout(() => {

      this.counterFormModel = Object.assign({}, this.bsModalRef.content.counterTile);
      this.value = this.counterFormModel.defaultValue;

      this.tileModel = Object.assign({}, this.bsModalRef.content.tile);
      this.rulesetId = this.bsModalRef.content.rulesetId;
      this.pageId = this.bsModalRef.content.pageId;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;
    }, 0);
  }

  edit() {
    try {
      this.tileModel.counterTiles.currentValue
        = this.counterFormModel.currentValue;
    } catch (err) { }

    this.close();
    let _tile: any = new RulesetTile();
    Object.assign(_tile, this.tileModel);

    this.bsModalRef = this.modalService.show(RulesetCounterTileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Edit Counter Tile";
    this.bsModalRef.content.tile = _tile;
    this.bsModalRef.content.rulesetId = this.rulesetId;
    this.bsModalRef.content.pageId = this.pageId;
    this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
    this.bsModalRef.content.view = VIEW.EDIT;
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

    let validForm = true;
    if (this.tileModel.rulesetId == 0 || this.tileModel.rulesetId == undefined) {
      this.alertService.showMessage("", "Ruleset is not selected.", MessageSeverity.error);
      validForm = false;
    }
    else if (this.tileModel.tileTypeId == 0 || this.tileModel.tileTypeId == undefined) {
      this.alertService.showMessage("", "Ruleset tile is not selected.", MessageSeverity.error);
      validForm = false;
    }
    else if ((this.counterFormModel.minimum === undefined && this.counterFormModel.maximum !== undefined)
      || (this.counterFormModel.minimum === null && this.counterFormModel.maximum !== null)) {
      this.alertService.showMessage("", "The minimum value can not be empty if maximum value is provided.", MessageSeverity.error);
      validForm = false;
    }
    else if ((this.counterFormModel.minimum !== undefined && this.counterFormModel.maximum === undefined)
      || (this.counterFormModel.minimum !== null && this.counterFormModel.maximum === null)) {
      this.alertService.showMessage("", "The maximum value can not be empty if minimum value is provided.", MessageSeverity.error);
      validForm = false;
    }
    else if ((this.counterFormModel.minimum && this.counterFormModel.maximum)
      || (this.counterFormModel.minimum === 0 || this.counterFormModel.maximum === 0)) {

      if (this.counterFormModel.minimum > this.counterFormModel.maximum) {
        this.alertService.showMessage("", "The minimum value could not be greater than the maximum value.", MessageSeverity.error);
        validForm = false;
      }
      else if (this.counterFormModel.defaultValue !== undefined) {
        if (this.counterFormModel.minimum > this.counterFormModel.defaultValue
          || this.counterFormModel.maximum < this.counterFormModel.defaultValue
        ) {
          this.alertService.showMessage("", "The Default Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
          validForm = false;
        }
      }
      if (this.counterFormModel.currentValue !== undefined) {
        if (this.counterFormModel.minimum > this.counterFormModel.currentValue
          || this.counterFormModel.maximum < this.counterFormModel.currentValue
        ) {
          if (validForm)
            this.alertService.showMessage("", "The Current Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
          validForm = false;
        }
      }
    }

    if (validForm) {

      this.tileModel.counterTile = this.counterFormModel;

      this.isLoading = true;
      let _msg = "Updating Counter Tile...";

      this.alertService.startLoadingMessage("", _msg);
      this.addEditCounterTile(this.tileModel);
      this.sharedService.updateShareLayout(true);
    }
  }

  private addEditCounterTile(modal) {

    this.isLoading = true;
    this.counterTileService.createRulesetCounterTile(modal)
      .subscribe(
        data => {
          // console.log(data);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();

          let message = "Counter Tile has been updated successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);
          this.sharedService.updateRulesetList(data);
          this.close();
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Update ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else {
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          }
        },
      );
  }

  increment() {

    let step: number = this.counterFormModel.step ? this.counterFormModel.step : 1;
    if (this.counterFormModel.minimum && this.counterFormModel.maximum) {

      this.counterFormModel.currentValue += step;
      if (this.counterFormModel.minimum > this.counterFormModel.currentValue) {
        this.setCurrentValue(this.counterFormModel.minimum);
        //this.alertService.resetStickyMessage();
        //this.alertService.showMessage("", "The Default Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
      }
      else if (this.counterFormModel.maximum < this.counterFormModel.currentValue) {
        this.setCurrentValue(this.counterFormModel.maximum);
      }
    }
    else {
      this.counterFormModel.currentValue += step;
    }
  }

  decrement() {
    let step: number = this.counterFormModel.step ? this.counterFormModel.step : 1;
    if (this.counterFormModel.minimum && this.counterFormModel.maximum) {

      this.counterFormModel.currentValue -= step;
      if (this.counterFormModel.minimum > this.counterFormModel.currentValue) {
        this.setCurrentValue(this.counterFormModel.minimum);
        //this.alertService.resetStickyMessage();
        //this.alertService.showMessage("", "The Default Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
      }
      else if (this.counterFormModel.maximum < this.counterFormModel.currentValue) {
        this.setCurrentValue(this.counterFormModel.maximum);
      }
    }
    else {
      this.counterFormModel.currentValue -= step;
    }
  }

  resetValue() {
    this.counterFormModel.currentValue = this.value;
  }

  changeCurrentValue(event: any) {
    let value = +event.target.value;
    if (this.counterFormModel.minimum && this.counterFormModel.maximum) {
      if (this.counterFormModel.minimum > +value) {
        value = this.counterFormModel.minimum;
        //this.alertService.resetStickyMessage();
        //this.alertService.showMessage("", "The Default Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
      }
      else if (this.counterFormModel.maximum < +value) {
        value = this.counterFormModel.maximum;
      }
    }

    this.setCurrentValue(value);
  }

  setCurrentValue(value: number) {
    //setTimeout(() => {
    this.counterFormModel.currentValue = value;
    //}, 0);
  }

  AdjustCounter(isMinus, value) {
    if (value == undefined) {
      this.alertService.showMessage("", "The value for this field can't empty! ", MessageSeverity.error);
      return false;
    }
    else {
      value = +value;
      this.counterFormModel.currentValue = +this.counterFormModel.currentValue;

      if (isMinus) {
          this.counterFormModel.currentValue = this.counterFormModel.currentValue - value;
          this.adjustCounterValue = undefined;

      } else {
          this.counterFormModel.currentValue = this.counterFormModel.currentValue + value;
          this.adjustCounterValue = undefined;
      }
    }
  }

}
