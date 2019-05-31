import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { SharedService } from '../../core/services/shared.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { CommonService } from '../../core/services/shared/common.service';
import { User } from '../../core/models/user.model';
import { DBkeys } from '../../core/common/db-keys';
import { MarketPlaceItemsType } from '../../core/models/enums';
import { MarketPlaceService } from '../../core/services/maketplace.service';
import { marketplaceListModel, marketplaceModel } from '../../core/models/marketplace.model';
import { Utilities } from '../../core/common/utilities';
import { PaymentComponent } from '../../shared/payment/payment.component';
import { AppService1 } from '../../app.service';


@Component({
  selector: 'app-marketplacelist',
  templateUrl: './marketplacelist.component.html',
  styleUrls: ['./marketplacelist.component.scss']
})
export class MarketplacelistComponent implements OnInit {

  marketplacelist: marketplaceListModel[] = [];

  MARKETPLACEITEMSTYPE = MarketPlaceItemsType;
  bsModalRef: BsModalRef;
  userId: string = '';
  isLoading: boolean = false;
  constructor(private alertService: AlertService,
    private authService: AuthService,
    private localStorage: LocalStoreManager,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private commonService: CommonService,
    private router: Router,
    private modalService: BsModalService,
    private marketPlaceService: MarketPlaceService, private appService: AppService1
  ) {
   
   
  }

  ngOnInit() {
    this.initialize();
  }

  
  initialize() {
    //user id 
   let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
    }
    else {
      this.userId = user.id;
    }
    this.getmarketplacelist();
    //this.marketplacelist = [
    //  {
    //    title: 'GM Account(Permanent)',
    //    desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ',
    //    type: 'Permanent',
    //    price: 50,
    //    marketPlaceId: this.MarketPlaceItemsType.GMPERMANENT
    //  },
    //  {
    //    title: 'GM Account (Subscription 1-Year)',
    //    desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ',
    //    type: 'Permanent',
    //    price: 20,
    //    marketPlaceId: this.MarketPlaceItemsType.GM_1_YEAR
    //  },
    //  {
    //    title: '+1 Campaign/Rule Set',
    //    desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ',
    //    type: 'Permanent',
    //    price: 5,
    //    marketPlaceId: this.MarketPlaceItemsType.CAMPAIGN_RULE_SET
    //  },
    //  {
    //    title: '+1 Player Slot (GM Only)',
    //    desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ',
    //    type: 'Permanent',
    //    price: 5,
    //    marketPlaceId: this.MarketPlaceItemsType.PLAYER_SLOT
    //  },
    //  {
    //    title: '+1 Character Slot',
    //    desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ',
    //    type: 'Permanent',
    //    price: 3,
    //    marketPlaceId: this.MarketPlaceItemsType.CHARACTER_SLOT
    //  },
    //  {
    //    title: 'Remove Adds',
    //    desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ',
    //    type: 'Permanent',
    //    price: '5',
    //    marketPlaceId: this.MarketPlaceItemsType.REMOVE_ADDS
    //  },
    //  {
    //    title: 'Additional Storage Space',
    //    desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ',
    //    type: 'Permanent',
    //    price: 0,
    //    marketPlaceId: this.MarketPlaceItemsType.ADDITIONAL_STORAGE
    //  },
    //  {
    //    title: 'Buy us a coffee?',
    //    desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. ',
    //    type: 'Permanent',
    //    price: 0,
    //    marketPlaceId: this.MarketPlaceItemsType.BUY_US_A_COFFEE
    //  }
    //];
  }

  getmarketplacelist() {
    this.isLoading = true;
    this.marketPlaceService.getmarketplaceItems<any>().subscribe(data => {
     
      this.marketplacelist = data;
      this.isLoading = false;
    },
      error => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
        this.localStorage.deleteData(DBkeys.CURRENT_RULESET);
      }
    );
  }
 
  RedirectBack() {
    window.history.back();
  }

  select(paymentInfo) { 
    this.bsModalRef = this.modalService.show(PaymentComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'payment';
    this.bsModalRef.content.paymentInfo = paymentInfo;

    this.bsModalRef.content.event.subscribe(data => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user == null) {
        this.authService.logout();
      }

      let paymentDoneForItem: marketplaceListModel = data.item;
      switch (paymentDoneForItem.marketPlaceId) {
        case MarketPlaceItemsType.GMPERMANENT:
          user.isGm = true;
          user.removeAds = true;
          user.campaignSlot = user.rulesetSlot;
          user.playerSlot = 5;
          break;
        case MarketPlaceItemsType.GM_1_YEAR:
          user.isGm = true;
          user.removeAds = true;
          user.campaignSlot = user.rulesetSlot;
          user.playerSlot = 5;
          break;
        case MarketPlaceItemsType.CAMPAIGN_SLOT:
          user.campaignSlot = user.campaignSlot + paymentDoneForItem.qty;
          break;
        case MarketPlaceItemsType.RULESET_SLOT:
          user.rulesetSlot = user.rulesetSlot + paymentDoneForItem.qty;
          break;
        case MarketPlaceItemsType.PLAYER_SLOT:
          user.playerSlot = user.playerSlot + paymentDoneForItem.qty;
          break;
        case MarketPlaceItemsType.CHARACTER_SLOT:
          user.characterSlot = user.characterSlot + paymentDoneForItem.qty;
          break;
        case MarketPlaceItemsType.REMOVE_ADDS:
          user.removeAds = true;
          
          this.appService.UpdateAddRemove(user.removeAds);
          break;
        case MarketPlaceItemsType.ADDITIONAL_STORAGE:
          user.storageSpace = user.storageSpace + (paymentDoneForItem.qty*1000);
          break;
        case MarketPlaceItemsType.BUY_US_A_COFFEE:
          break;


        default:
          break;
      }
      
      if (this.localStorage.sessionExists(DBkeys.CURRENT_USER)) {
        this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
      }
      else {
        this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
      }
      this.initialize();
    });
  }
  public inputValidator(event: any) {
    let eventInstance= event;
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
  

}
