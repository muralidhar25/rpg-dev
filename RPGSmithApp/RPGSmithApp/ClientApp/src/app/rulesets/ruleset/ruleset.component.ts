import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { fadeInOut } from "../../core/services/animations";
import { AlertService, DialogType, MessageSeverity } from "../../core/common/alert.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { AuthService } from "../../core/auth/auth.service";
import { ConfigurationService } from "../../core/common/configuration.service";
import { RulesetService } from "../../core/services/ruleset.service";
import { SharedService } from "../../core/services/shared.service";
import { CommonService } from "../../core/services/shared/common.service";
import { DBkeys } from "../../core/common/db-keys";
import { User } from "../../core/models/user.model";
import { Utilities } from "../../core/common/utilities";
import { RulesetFormComponent } from "../ruleset-form/ruleset-form.component";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { RulesetManageComponent } from "../ruleset-form/ruleset-manage.component";
import { VIEW, MarketPlaceItemsType } from "../../core/models/enums";
import { ImportRulesetComponent } from "../ruleset-helper/import-ruleset/import-ruleset.component";
import { AppService1 } from "../../app.service";
import { DefaultDice } from "../../core/models/view-models/custome-dice.model";
import { MarketPlaceService } from "../../core/services/maketplace.service";
import { marketplaceListModel } from "../../core/models/marketplace.model";
import { PaymentComponent } from "../../shared/payment/payment.component";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";

@Component({
  selector: 'app-ruleset',
  templateUrl: './ruleset.component.html',
    styleUrls: ['./ruleset.component.scss'],
    animations: [fadeInOut]
})

export class RulesetComponent implements OnInit, OnDestroy {

    openManage: boolean = false;;
    page?: number = 1;
    pagesize?: number = 30;
    bsModalRef: BsModalRef;
    rulesets: any; //Ruleset[];
    isLoading = false;
    isDropdownOpen: boolean = false;
    showForm: boolean = false;
    showPlus: boolean = true;
  isAdminUser: boolean = false;
  defaultDicesForNewUsers: DefaultDice[] =[];
  rulesetSlots: number;
  marketplacelist: marketplaceListModel[] = [];

    constructor(
        private router: Router, private alertService: AlertService, private localStorage: LocalStoreManager,
      private authService: AuthService, private configurations: ConfigurationService, private marketPlaceService: MarketPlaceService,
        private rulesetService: RulesetService, private modalService: BsModalService, private modalService1: BsModalService,
      private sharedService: SharedService, private commonService: CommonService, public appService: AppService1
    ) {
        if (!this.authService.isLoggedIn) {
            this.authService.logout();
        }
      this.sharedService.shouldUpdateRulesetList().subscribe(ruleset => {
          if (ruleset) {
                this.openManage = false;
              this.initialize(ruleset);
              this.sharedService.updateManageOpen(null);
          }
        });
    }

    @HostListener('document:click', ['$event.target'])
    documentClick(target: any) {        
      try {
        if (target.className && target.className == "Editor_Command a-hyperLink") {
          this.GotoCommand(target.attributes["data-editor"].value);
        }  
            if (target.className.endsWith("not-plus"))
                this.showPlus = false;
            else if (target.className.endsWith("is-plus"))
                this.showPlus = !this.showPlus;
            else this.showPlus = true;

            if (target.className.endsWith("is-show"))
                this.isDropdownOpen = !this.isDropdownOpen;
            else this.isDropdownOpen = false;
        } catch (err) { this.isDropdownOpen = false; this.showPlus = true;}
    }
   
  ngOnInit() {
      this.destroyModalOnInit();
      let ruleset = this.localStorage.getDataObject<any>(DBkeys.CURRENT_RULESET);
    this.initialize(ruleset);

    this.appService.updatCloseNotificationInterval(true);
  }

  ngOnDestroy() {}

    private resetHeaderValues(): any {
      try {
        this.appService.updateAccountSetting1(-1);
            this.sharedService.updateAccountSetting(-1);
            this.localStorage.deleteData(DBkeys.HEADER_VALUE);
            this.localStorage.saveSyncedSessionData(undefined, DBkeys.HEADER_VALUE);
        } catch (err) { }
    }
    
  private initialize(ruleset?: any) {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (user == null)
        {
          this.authService.logout();
          this.localStorage.deleteData(DBkeys.CURRENT_RULESET);
        }
      
        else {
          if (user.isGm) {
            this.router.navigate(['/rulesets/campaigns']);
          }
          else {
            this.rulesetSlots = user.rulesetSlot;
            this.isAdminUser = user.roles.some(function (value) { return (value === "administrator") });
            this.isLoading = true;
            this.rulesetService.getDefaultDices()
              .subscribe(data => {
                this.defaultDicesForNewUsers = data;
              }, error => {
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  this.authService.logout(true);
                }
              }, () => { });
            this.rulesetService.getRulesetsByUserId(user.id)
              .subscribe(data => {
                this.rulesets = data;
                this.isLoading = false;
                if (ruleset && !this.openManage) {
                  let rulesetData = ruleset;
                  this.manageRuleset(ruleset);
                  ruleset = null;
                  this.openManage = true;
                  this.localStorage.deleteData(DBkeys.CURRENT_RULESET);
                }
              }, error => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                  this.authService.logout(true);
                }
                this.localStorage.deleteData(DBkeys.CURRENT_RULESET);
              }, () => { });
            this.marketPlaceService.getmarketplaceItems<any>().subscribe(data => {

              this.marketplacelist = data;

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
            //setTimeout(() => {
            //    if (ruleset && !this.isLoading) this.manageRuleset(ruleset);
            //}, 200);

            //resting headers
            this.resetHeaderValues();
          }
          
        }
    }

    addRuleset() {
        //this.bsModalRef = this.modalService.show(RulesetAddComponent, {
        //    class: 'modal-primary modal-md',
        //    ignoreBackdropClick: true,
        //    keyboard: false
        //});
        //this.bsModalRef.content.rulesets = this.rulesets;
        //this.bsModalRef.content.eventEmitter.subscribe(result => {
        //    if (result) {
        //        this.initialize();
        //    }
        //});
        this.router.navigate(['/ruleset/add']);
    }

    createRuleset() {
        this.bsModalRef = this.modalService.show(RulesetFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Create Rule Set';
        this.bsModalRef.content.button = 'NEXT';      
      this.bsModalRef.content.rulesetModel = { ruleSetId: 0, defaultDices: this.defaultDicesForNewUsers };

      this.bsModalRef.content.event.subscribe(data => {
        this.localStorage.saveSyncedSessionData(data, DBkeys.CURRENT_RULESET);
        this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
          this.router.navigate(["rulesets"]));
      });
    }

  manageRuleset(ruleset: Ruleset) {

    let id = ruleset.ruleSetId;
    this.setRulesetId(id);
    this.router.navigate(['/ruleset/ruleset-details/' + id]);


        //console.log('mange ruleset popup');
        //if (!document.getElementsByClassName('mng-ruleset-popup').length) {
        //    this.setRulesetId(ruleset.ruleSetId);
        //    setTimeout(() => {
        //        this.bsModalRef = this.modalService1.show(RulesetManageComponent, {
        //            class: 'modal-primary modal-md mng-ruleset-popup',
        //            ignoreBackdropClick: true,
        //            keyboard: false
        //        });
        //        this.bsModalRef.content.title = 'Rule Set Properties';
        //        ruleset.view = VIEW.EDIT;
        //        this.bsModalRef.content.ruleset = ruleset;
        //        this.bsModalRef.content.recordCount = ruleset.recordCount;   
        //    }, 100);
                  
        //}       
    }
    private setRulesetId(rulesetId: number) {
        this.localStorage.deleteData(DBkeys.RULESET_ID);
        this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
    }
    manageIcon(id: number) {
        this.rulesets.forEach(function (val) {
            if (id === val.ruleSetId) {
                val.showIcon = true;
            } else {
                val.showIcon = false;
            }
        })
    }

    editRuleset(ruleset: Ruleset) {
        this.bsModalRef = this.modalService.show(RulesetFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Rule Set';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.ruleSetImage = ruleset.ruleSetImage;
      this.bsModalRef.content.rulesetModel = ruleset;

      //this.bsModalRef.content.event.subscribe(data => {
      //  this.localStorage.saveSyncedSessionData(data, DBkeys.CURRENT_RULESET);
      //  this.router.navigateByUrl('/characters', { skipLocationChange: true }).then(() =>
      //    this.router.navigate(["rulesets"]));
      //});
    }

    duplicateRuleset(ruleset: Ruleset) {
        this.bsModalRef = this.modalService.show(RulesetFormComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Duplicate Rule Set';
        this.bsModalRef.content.button = 'DUPLICATE';
        this.bsModalRef.content.ruleSetImage = ruleset.ruleSetImage;
        this.bsModalRef.content.rulesetModel = ruleset;
    }

    deleteRuleset(ruleset: Ruleset) {
        this.alertService.showDialog('Are you sure you want to delete "' + ruleset.ruleSetName + '" ruleset and all its characters?',
            DialogType.confirm, () => this.deleteRulesetHelper(ruleset), null, 'Yes', 'No');
    }

    private deleteRulesetHelper(ruleset: Ruleset) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting Ruleset");

        this.rulesetService.deleteRuleset(ruleset.ruleSetId)
            .subscribe(
            data => {
                this.isLoading = false; 
                this.alertService.stopLoadingMessage();
                this.commonService.UpdateCounts(); /*update charaters count*/
                this.alertService.showMessage("Ruleset has been deleted successfully.", "", MessageSeverity.success);
                this.rulesets = this.rulesets.filter((val) => val.ruleSetId != ruleset.ruleSetId);
                //this.initialize();
            },
            error => {
                this.isLoading = false; 
                this.alertService.stopLoadingMessage();

                let Errors = Utilities.ErrorDetail("Unable to Delete", error);
                if (Errors.sessionExpire) {
                    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                    this.authService.logout(true);
                }
                else
                    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

            });
    }
    
    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
          this.appService.updateAccountSetting1(false);
            this.sharedService.updateAccountSetting(false);
            this.localStorage.deleteData(DBkeys.HEADER_VALUE);
        } catch (err) { }
    }

    importRuleset() {
        this.bsModalRef = this.modalService.show(ImportRulesetComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });    
        this.bsModalRef.content.rulesetModel = { ruleSetId: 0 };
  }
  BuyRulesetSlot() {    
    let paymentInfo = this.marketplacelist.filter(x => x.marketPlaceId == MarketPlaceItemsType.RULESET_SLOT)[0];
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
        case MarketPlaceItemsType.RULESET_SLOT:
          user.rulesetSlot = user.rulesetSlot + paymentDoneForItem.qty;
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
      this.rulesetSlots = this.rulesetSlots + paymentDoneForItem.qty;
    });

  }

  GotoCommand(cmd) {
    // TODO get char ID
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
