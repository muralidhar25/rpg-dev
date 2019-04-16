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
  public event: EventEmitter<any> = new EventEmitter();
  constructor(private bsModalRef: BsModalRef,
            private sharedService: SharedService,
            private localStorage: LocalStoreManager,
            public appService: AppService1,
    public campaignService: CampaignService,
    private alertService: AlertService,
    public authService: AuthService,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
   let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
   
    this.userName = user.userName;

    setTimeout(() => {
     
      this.invitationList = this.bsModalRef.content.invitationList;
      console.log(this.invitationList);
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
    // this.destroyModalOnInit();
  }

 
  Decline(index, inviteId) {
    this.campaignService.declineInvite<any>(inviteId)
      .subscribe(data => {
        if (data.isDeclined) {
          this.alertService.showStickyMessage('', "invitation decline", MessageSeverity.success);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
          this.invitationList.splice(index, 1);
          if (this.invitationList.length == 0) {
            this.close();
          }
        } else {
          this.alertService.showStickyMessage('', "Unable to decline invitation", MessageSeverity.error);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
        }
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { })
  
  }
  AnswerLater(inviteId) {
    console.log('Answer later', inviteId);
    this.campaignService.answerLaterInvite<any>(inviteId)
      .subscribe(data => {
        console.log(data);
      })
  }

  AcceptInvite(inviteId, invites) {
    this.rulesetid = invites.playerCampaignID;
    this.invitedid = invites.id;
    this.rulesets = [];
    this.rulesets.push(invites.playerCampaign);
    console.log(this.rulesets);
   // this.close();
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
    //this.bsModalRef.content.invitationList = this.invitationList;
    
    this.bsModalRef.content.event.subscribe(data => {
      console.log(data);
      this.invitationList = this.invitationList.filter(x => x.id != data);
      if (!this.invitationList.length) {
        this.close();
      }
      
    });
  }


  backward() {
    console.log('backward');
  }
  forward() {
    console.log('forward');
  }
}
