import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { PlatformLocation } from '@angular/common';
import { CombatService } from '../../../core/services/combat.service';
import { CURRENCY_TYPE } from '../../../core/models/enums';
import { CurrencyTileService } from '../../../core/services/tiles/currency-tile.service';
import { Utilities } from '../../../core/common/utilities';
import { ServiceUtil } from '../../../core/services/service-util';

@Component({
  selector: 'app-edit-currency',
  templateUrl: './edit-currency.component.html',
  styleUrls: ['./edit-currency.component.scss']
})
export class EditCurrencyComponent implements OnInit {

  isLoading: boolean = false;
  isMouseDown: boolean = false;
  interval: any;
  title: string;
  currencyList = [];
  CURRENCY_TYPE = CURRENCY_TYPE;
  public event: EventEmitter<any> = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.saveCurrency();
    }
  }

  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
    private alertService: AlertService, private authService: AuthService, private currencyTileService: CurrencyTileService,
    private location: PlatformLocation, private combatService: CombatService) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {
    setTimeout(() => {
      this.title = this.bsModalRef.content.title;
      let _currencyList = this.bsModalRef.content.tileCurrency;
      this.currencyList = ServiceUtil.DeepCopy(Object.assign([], _currencyList)); //[..._currencyList]);
    }, 0);
  }

  close() {
    this.bsModalRef.hide();
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
    } catch (err) { }
  }

  saveCurrency() {
    this.isLoading = true;
    this.currencyTileService.saveCharacterCurrency(this.currencyList)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let message = "Character currencies have been updated successfully.";
        this.alertService.showMessage(message, "", MessageSeverity.success);
        this.event.emit(this.currencyList);
        this.bsModalRef.hide();
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Save";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        },
      )
  }

  increment(currency: any) {
    currency.amount = currency.amount ? +currency.amount : 0;
    currency.amount = +currency.amount + 1;
  }

  decrement(currency: any) {
    currency.amount = currency.amount ? +currency.amount : 0;
    currency.amount = +currency.amount - 1;
  }

  mouseDown(type, currency) {
    let time = new Date();
    time.setMilliseconds(time.getMilliseconds() + 600); //600 miliseconds delay to start the numbering
    this.isMouseDown = true;
    this.interval = setInterval(() => {
      if (time < new Date()) {
        if (this.isMouseDown) {
          if (type === -1)//Decrement
          {
            this.decrement(currency);
          }
          if (type === 1)//Increment
          {
            this.increment(currency);
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
