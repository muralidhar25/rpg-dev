import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { RulesetRecordCount } from '../../core/models/view-models/ruleset-record-count.model';
import { AppService1 } from '../../app.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';
import { CampaignService } from '../../core/services/campaign.service';
import { playerInviteSendModel } from '../../core/models/campaign.model';
import { Utilities } from '../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-invite-player',
  templateUrl: './invite-player.component.html',
  styleUrls: ['./invite-player.component.scss']
})
export class InvitePlayerComponent implements OnInit {

  username: string = '';
  errorMsg: boolean = false;

  public event: EventEmitter<any> = new EventEmitter();
  rulesetModel = new Ruleset();
  isloading : boolean = false;
  rulesetRecordCount: any = new RulesetRecordCount();
  loggedInUserId: string;
  loggedInUsername: string;

  constructor(private bsModalRef: BsModalRef,
              private sharedService: SharedService,
              private localStorage: LocalStoreManager,
              public appService: AppService1,
    private alertService: AlertService,
    public campaignService: CampaignService,
    private authService: AuthService,
   ){ }

  ngOnInit() {
    setTimeout(() => {
      let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
      if (user == null) {
        this.authService.logout();
      }
      else {
        this.loggedInUserId = user.id;
        this.loggedInUsername = user.userName;
      }
      

      //console.log(this.bsModalRef.content.rulesetModel);
      this.rulesetModel = this.bsModalRef.content.rulesetModel == undefined
        ? new Ruleset() : this.bsModalRef.content.rulesetModel;
        
        this.setHeaderValues(this.rulesetModel);
      }, 0);
  }
  close() {
    this.bsModalRef.hide();
  }


  SendInvite(username: string) {
    
    let modal: playerInviteSendModel = new playerInviteSendModel();
    modal.campaignId = this.rulesetModel.ruleSetId;
    modal.sendByCampaignImage = this.rulesetModel.imageUrl ? this.rulesetModel.imageUrl : 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png';
    modal.sendByCampaignName = this.rulesetModel.ruleSetName;
    modal.sendByUserId = this.loggedInUserId;
    modal.sendByUserName = this.loggedInUsername;
    modal.userName = username;
    this.isloading = true;
    this.alertService.startLoadingMessage("", "Sending invite...");
    this.campaignService.sendInvite<any>(modal)
      .subscribe(
      data => {
        this.alertService.stopLoadingMessage();
        this.close();
        this.alertService.showMessage("Invitation send successfully.", "", MessageSeverity.success);
          //if (data) {
          //  console.log(username);
          //  this.bsModalRef.hide();
          //} else {
          //  this.errorMsg = true;
          //}
       // console.log(data);
        this.event.emit(data);
        this.isloading = false;
        },
      error => {
        this.isloading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else if (error.statusText == "Bad Request") {
            this.alertService.showStickyMessage('', error.error, MessageSeverity.error);
            setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
          }
        },
      );

    
    
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
}
