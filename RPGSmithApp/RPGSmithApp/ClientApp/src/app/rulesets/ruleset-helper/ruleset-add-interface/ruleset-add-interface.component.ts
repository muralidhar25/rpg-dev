import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RulesetService } from '../../../core/services/ruleset.service';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { CommonService } from '../../../core/services/shared/common.service';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { Utilities } from '../../../core/common/utilities';
import { PaymentComponent } from '../../../shared/payment/payment.component';
import { marketplaceListModel } from '../../../core/models/marketplace.model';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';
import { Characters } from '../../../core/models/view-models/characters.model';

@Component({
  selector: 'app-ruleset-add-interface',
  templateUrl: './ruleset-add-interface.component.html',
  styleUrls: ['./ruleset-add-interface.component.scss']
})
export class RulesetAddInterfaceComponent implements OnInit {
  bsModalRef: BsModalRef;
    isLoading = false;
    _view: string;
    rulesetsList: any;
    addedRuleset: any;
    multiRulesets: number[] = [];
    public eventEmitter: EventEmitter<any> = new EventEmitter();

    constructor(private router: Router,
        private alertService: AlertService,
        private authService: AuthService,
        private localStorage: LocalStoreManager,
        private route: ActivatedRoute,
        private sharedService: SharedService,
      private modalService: BsModalService, private commonService: CommonService,
    private rulesetService: RulesetService) { }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
    } catch (err) { }
  }

    ngOnInit() {
        setTimeout(() => {
            //this.addedRuleset = this.bsModalRef.content.rulesets;
            this.initialize();
        }, 0);
  }
    private initialize() {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
            this.authService.logout();
        else {
            this.isLoading = true;
            this.rulesetService.getCoreRulesets<any[]>(user.id)
                .subscribe(data => {
                    //console.log('idata', data);
                    this.rulesetsList = data;
                    this.rulesetsList.forEach(function (val) { val.showIcon = false; });
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                }, () => { });
        }
    }
  addRuleSet(ruleSet) {
    if (ruleSet.ruleSetId) {
      let ruleSetId = ruleSet.ruleSetId;

      if (ruleSet.isAlreadyPurchased) {
        this.addRuleSetFinal(ruleSetId);
      }
      else {
        if (ruleSet.price) {
          this.buyRuleset(ruleSet);
        }
        else {
          this.addRuleSetFinal(ruleSetId);
        }
      }
    }
  }
    RedirectBack() {
      this.router.navigate(['/rulesets']);
        //window.history.back();
    }

    htmltoPlainText(text) {
        return text ? new DOMParser().parseFromString(String(text).replace(/<[^>]+>/gm, ''), "text/html").documentElement.textContent : '';
    }
  addRuleSetFinal(ruleSetId) {
    //if (this.multiRulesets.length > 0) {
    //this.isLoading = true;
    this.alertService.startLoadingMessage("", "Adding Ruleset");
    let ruleSets = [];
    ruleSets.push(ruleSetId);
    this.rulesetService.addRuleSets<any>(ruleSets)
      .subscribe(
        data => {
          let IsGM: boolean = false;
          let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
          if (user == null)
            this.authService.logout();
          else {
            if (user.isGm) {
              IsGM = true;
            }
          }
          // this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let message = "Rule Set(s) have been added successfully.";
          this.alertService.showMessage(message, "", MessageSeverity.success);

          //if (IsGM) {
          //  this.router.navigate(['/rulesets/campaigns']);
          //}
          //else {
          //  this.router.navigate(['/rulesets']);
          //}

          if (data > 0) {
            if (user.isGm) {
              this.router.navigate(['/ruleset/campaign-details/' + data]);
            } else {
              this.router.navigate(['/ruleset/ruleset-details/' + data]);
            }
          } else {
            if (IsGM) {
            this.router.navigate(['/rulesets/campaigns']);
          }
          else {
            this.router.navigate(['/rulesets']);
          }
          }

          
          //this.eventEmitter.emit(true);
        },
        error => {
          // this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Add ";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
      //}
  }
  buyRuleset(ruleSet) {
    let paymentInfo: marketplaceListModel = new marketplaceListModel(-1, -1, ruleSet.ruleSetName, ruleSet.ruleSetName, '', ruleSet.price, 1, '', false);// = this.marketplacelist.filter(x => x.marketPlaceId == MarketPlaceItemsType.PLAYER_SLOT)[0];
    this.bsModalRef = this.modalService.show(PaymentComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'payment';
    this.bsModalRef.content.paymentInfo = paymentInfo;
    //this.bsModalRef.content.RulesetToPurchase = ruleSet;
    this.bsModalRef.content.event.subscribe(data => {
      let paymentDoneForItem: marketplaceListModel = data.item;
      
      this.rulesetService.updateUserPurchasedRuleset<any>(ruleSet)
        .subscribe(
          data => {
            this.addRuleSetFinal(ruleSet.ruleSetId);
          },
          error => {
            // this.isLoading = false;
            this.alertService.stopLoadingMessage();
            let _message = "Unable to Add ";
            let Errors = Utilities.ErrorDetail(_message, error);
            if (Errors.sessionExpire) {
              //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              this.authService.logout(true);
            }
            else
              this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
          });
     
    });
  }
  description(text) {
    if (text) {

      var encodedStr = text;

      var parser = new DOMParser;
      var dom = parser.parseFromString(
        '<!doctype html><body>' + encodedStr,
        'text/html');
      var decodedString = dom.body.textContent;


      return decodedString;

    }
    return '';
  }

  GotoCommand(cmd) {
    // TODO get Char ID
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = cmd;
  }
}
