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
import { PaymentComponent } from '../payment/payment.component';
import { MarketPlaceService } from '../../core/services/maketplace.service';
import { marketplaceListModel } from '../../core/models/marketplace.model';


@Component({
  selector: 'app-marketplacelist',
  templateUrl: './marketplacelist.component.html',
  styleUrls: ['./marketplacelist.component.scss']
})
export class MarketplacelistComponent implements OnInit {

  marketplacelist: marketplaceListModel[] = [];

  MarketPlaceItemsType = MarketPlaceItemsType;
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
    private  marketPlaceService : MarketPlaceService
  ) {
   
   
  }

  ngOnInit() {
    this.initialize();
  }

  
  initialize() {
    //user id 
   let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user != null) {
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
      console.log(this.marketplacelist);
      this.isLoading = false;
    },
      error => {
        console.log(error);
        this.isLoading = false;
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
      
    });
  }
}
