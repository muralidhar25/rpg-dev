import {
  EventEmitter,
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { NgForm } from '@angular/forms';
import { marketplaceModel, marketplaceListModel } from '../../core/models/marketplace.model';
import { MarketPlaceService } from '../../core/services/maketplace.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { Utilities } from '../../core/common/utilities';
import { AuthService } from "../../core/auth/auth.service";
import { AlertService, MessageSeverity, DialogType } from '../../core/common/alert.service';
import { MarketPlaceItemsType } from '../../core/models/enums';
import { retry } from 'rxjs/operators';

declare var stripe: any;
declare var elements: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements AfterViewInit, OnDestroy, OnInit {

  public event: EventEmitter<any> = new EventEmitter();
  @ViewChild('cardInfo') cardInfo: ElementRef;
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;
  paymentInfo: marketplaceListModel = new marketplaceListModel();
  userId: string;
  marketplaceDetails: marketplaceModel = new marketplaceModel();
  MARKETPLACEITEMSTYPE = MarketPlaceItemsType;
  isLoading: boolean = false;
  constructor(private bsModalRef: BsModalRef,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private marketplaceService: MarketPlaceService,
    private alertService: AlertService,
    private localStorage: LocalStoreManager) {}

  ngOnInit() {
    setTimeout(() => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);      
      if (user == null) {
        this.authService.logout();
      }
      else {
        this.userId = user.id;
      }
      this.paymentInfo = this.bsModalRef.content.paymentInfo;
      this.marketplaceDetails.marketPlaceId = this.paymentInfo.marketPlaceId;
      this.marketplaceDetails.price = this.paymentInfo.price;
      this.marketplaceDetails.qty = this.paymentInfo.qty;
      this.marketplaceDetails.description = this.paymentInfo.title + ' for UserID: ' + this.userId;
    }, 0);
  }

  ngAfterViewInit() {
    
    this.card = elements.create('card');
    this.card.mount(this.cardInfo.nativeElement);

    this.card.addEventListener('change', this.cardHandler);
  }
  ngOnDestroy() {
    this.card.removeEventListener('change', this.cardHandler);
    this.card.destroy();
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }
  async onSubmit(form: NgForm) {
    this.isLoading = true;
    const { token, error } = await stripe.createToken(this.card);

    if (error) {
      this.alertService.showMessage(error.message, "", MessageSeverity.error)
      console.log('Something is wrong:', error);
      this.isLoading = false;
    } else {
      let stripe_tokenid = token.id;
      this.marketplaceDetails.sourceToken = stripe_tokenid;
      this.chargePayment(this.marketplaceDetails);
      // ...send the token to the your backend to process the charge
    }
  }
  close() {
    this.bsModalRef.hide();
  }

  chargePayment(details) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Processing payment...");
    this.marketplaceService.marketplacePayment<any>(details)
      .subscribe(
      data => {
        
        let paymentdetails = JSON.parse(data);
      
        this.alertService.stopLoadingMessage();
        //  { "paymentSuccessed": true, "userUpdated": true, "message": "Payment Successful." }
        if (paymentdetails.paymentSuccessed && paymentdetails.userUpdated) {
          this.paymentInfo.qty=this.marketplaceDetails.qty ;
            this.event.emit({
              payment_done: details,
              item: this.paymentInfo
          });
          this.alertService.showMessage(paymentdetails.message, "", MessageSeverity.success);
          
          } else {
         
          this.alertService.showMessage(paymentdetails.message, "", MessageSeverity.error);
        }
        this.isLoading = false;
        this.close();
        },
      error => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        this.close();
        },
    );
    
  }
  public inputValidator(event: any) {
    let eventInstance = event;
    eventInstance = eventInstance || window.event;
    let key = eventInstance.keyCode || eventInstance.which;
    if ((47 < key) && (key < 58) || key == 8) {
      return true;
    } else {
      if (eventInstance.preventDefault)
        eventInstance.preventDefault();
      eventInstance.returnValue = false;
      return false;
    } //if
  }
  getTotal(price, qty) {
    return +price * +qty;
  }
  getTotalIsNotValid(price, qty) {
    try {
      if ((+price * +qty) <= 0) {
        return true;
      }
      return isNaN(+price * +qty);
    } catch (e) {
      return true;
    }
  }

}


 
