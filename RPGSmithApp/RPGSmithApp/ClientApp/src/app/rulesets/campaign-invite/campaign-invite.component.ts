import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { RulesetRecordCount } from '../../core/models/view-models/ruleset-record-count.model';
import { AppService1 } from '../../app.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';
import { User } from "../../core/models/user.model";

@Component({
  selector: 'app-campaign-invite',
  templateUrl: './campaign-invite.component.html',
  styleUrls: ['./campaign-invite.component.scss']
})
export class CampaignInviteComponent implements OnInit {
  rulesetModel = new Ruleset();
  rulesetRecordCount: any = new RulesetRecordCount();
  userName: string; 
  constructor(private bsModalRef: BsModalRef,
            private sharedService: SharedService,
            private localStorage: LocalStoreManager,
            public appService: AppService1
  ) {}

  ngOnInit() {
   let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
   
    this.userName = user.userName;

    setTimeout(() => {
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

  AcceptInvite() {
    console.log('AcceptInvite');
  }

  Decline() {
    console.log('Decline');
  }
  AnswerLater() {
    console.log('Answer later');
  }
}
