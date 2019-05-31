import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { RulesetRecordCount } from '../../core/models/view-models/ruleset-record-count.model';
import { AppService1 } from '../../app.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from "../../core/models/user.model";
import { playerInviteListModel } from '../../core/models/campaign.model';
import { CampaignService } from '../../core/services/campaign.service';
import { Utilities } from '../../core/common/utilities';
import { AuthService } from '../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { InviteAddCharctersFormComponent } from '../../shared/invite-add-charcters-form/invite-add-charcters-form.component';
import { CharactersService } from '../../core/services/characters.service';
import { MarketPlaceService } from '../../core/services/maketplace.service';
import { marketplaceListModel } from '../../core/models/marketplace.model';
import { MarketPlaceItemsType } from '../../core/models/enums';
import { PaymentComponent } from '../../shared/payment/payment.component';



@Component({
  selector: 'app-campaign-invite',
  templateUrl: './campaign-invite.component.html',
  styleUrls: ['./campaign-invite.component.scss']
})
export class CampaignInviteComponent implements OnInit {
  rulesetModel = new Ruleset();
  rulesetRecordCount: any = new RulesetRecordCount();
  invitationList: playerInviteListModel[] = [];
  userName: string;
  showIndicator = false;
  rulesets: Ruleset[];
  rulesetid: number;
  invitedid: number;
  isloading: boolean = false;
  NoCharacterSlotsAvailable: boolean = false;
  marketplacelist: marketplaceListModel[] = [];
  characterSlot: number = 0;
  buyCharacterBtnText:string=''
 constructor(private bsModalRef: BsModalRef,
   private sharedService: SharedService,
   private appService: AppService1,
            private localStorage: LocalStoreManager,
   public campaignService: CampaignService,
   public characterService: CharactersService,
    private alertService: AlertService,
    public authService: AuthService,
   private modalService: BsModalService, private marketPlaceService: MarketPlaceService
  ) {}

  ngOnInit() {
   
    

    setTimeout(() => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user) {
        this.userName = user.userName;
        this.isloading = true;
        this.characterService.getCharactersCount(user.id).subscribe(data => {          
          this.characterSlot = data;          
          this.marketPlaceService.getmarketplaceItems<any>().subscribe(data => {
            this.isloading = false;
            this.marketplacelist = data;
            this.marketplacelist.map((m) => {
              if (m.marketPlaceId == MarketPlaceItemsType.CHARACTER_SLOT) {
                this.buyCharacterBtnText = m.title + " $" + m.price;
              }
              
            })
            if (this.characterSlot >= user.characterSlot) {
              this.alertService.showStickyMessage('', "No Character Slots are Available.", MessageSeverity.error);
              setTimeout(() => { this.alertService.resetStickyMessage(); }, 2000);
              this.NoCharacterSlotsAvailable = true;
            }
            else {
              this.NoCharacterSlotsAvailable = false;
            }

          },
            error => {
              this.isloading = false;
              this.alertService.stopLoadingMessage();
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              this.localStorage.deleteData(DBkeys.CURRENT_RULESET);
            }
          )
        },
          error => {
            this.isloading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          },
          () => { }
        );
        
      }
      else {
        this.authService.logout();
      }
      this.invitationList = this.bsModalRef.content.invitationList;
      //console.log(this.invitationList);
      this.rulesetModel = this.bsModalRef.content.rulesetModel == undefined
        ? new Ruleset() : this.bsModalRef.content.rulesetModel;
     
      this.setHeaderValues(this.rulesetModel);
      
    }, 0);
    
  }
  private setHeaderValues(ruleset: Ruleset): any {
    try {
      let headerValues = {
        headerName: ruleset.ruleSetName,
        headerImage: ruleset.imageUrl ? ruleset.imageUrl : 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png',
        headerId: ruleset.ruleSetId,
        headerLink: 'ruleset',
        hasHeader: true
      };
      this.appService.updateAccountSetting1(headerValues);
      this.sharedService.updateAccountSetting(headerValues);
      this.localStorage.deleteData(DBkeys.HEADER_VALUE);
      this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
    } catch (err) { }
  }
  close() {
    this.bsModalRef.hide();
  }

 
  Decline(index, inviteId) {
    this.isloading = true;
    this.campaignService.declineInvite<any>(inviteId)
      .subscribe(data => {
        if (data.isDeclined) {
          this.alertService.showStickyMessage('', "invitation decline", MessageSeverity.success);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
          this.invitationList.splice(index, 1);
          this.appService.updateInvitationlist(this.invitationList);
          if (this.invitationList.length == 0) {
            this.close();
          }
        } else {
          this.alertService.showStickyMessage('', "Unable to decline invitation", MessageSeverity.error);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
        }
        this.isloading = false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { })
  
  }
  AnswerLater(inviteId) {
    this.isloading = true;
    //console.log('Answer later', inviteId);
    this.campaignService.answerLaterInvite<any>(inviteId)
      .subscribe(data => {
        //console.log(data);
      })
    this.close();
    this.isloading = false;
  }

  AcceptInvite(inviteId, invites) {
    this.isloading = true;
    this.rulesetid = invites.playerCampaignID;
    this.invitedid = invites.id;
    this.rulesets = [];
    this.rulesets.push(invites.playerCampaign);
   
    this.close();
    this.isloading = false;
    this.bsModalRef = this.modalService.show(InviteAddCharctersFormComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'New Character';
    this.bsModalRef.content.button = 'CREATE';
    this.bsModalRef.content.charactersModel = {
      characterId: 0,
      ruleSets: this.rulesets,
      rulesetid: this.rulesetid,
      inviteid: this.invitedid
    };
    this.bsModalRef.content.ruleSet = this.rulesets;
    this.bsModalRef.content.rulesetid = this.rulesetid;
    this.bsModalRef.content.inviteid = this.invitedid;
    this.bsModalRef.content.invitationList = this.invitationList;
    
  }


  backward() {
    //console.log('backward');
  }
  forward() {
    //console.log('forward');
  }
  BuyCharacterSlot() {

    let paymentInfo = this.marketplacelist.filter(x => x.marketPlaceId == MarketPlaceItemsType.CHARACTER_SLOT)[0];
    this.close();
    this.bsModalRef = this.modalService.show(PaymentComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'payment';
    this.bsModalRef.content.paymentInfo = paymentInfo;
    this.bsModalRef.content.isFromCampaignInviteModel = true;

    this.bsModalRef.content.event.subscribe(data => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user == null) {
        this.authService.logout();
      }

      let paymentDoneForItem: marketplaceListModel = data.item;
      switch (paymentDoneForItem.marketPlaceId) {
        case MarketPlaceItemsType.CHARACTER_SLOT:
          user.characterSlot = user.characterSlot + paymentDoneForItem.qty;
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
      this.characterSlot = this.characterSlot + paymentDoneForItem.qty;
      
      this.appService.updateCharacterSlotsCount(this.characterSlot);
      if (this.characterSlot >= user.characterSlot) {
        this.NoCharacterSlotsAvailable = true;
      }
      else {
        this.NoCharacterSlotsAvailable = false;
      }
      this.bsModalRef = this.modalService.show(CampaignInviteComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.invitationList = this.invitationList;
    });

  }
}
