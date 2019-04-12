import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { RulesetRecordCount } from '../../core/models/view-models/ruleset-record-count.model';
import { AppService1 } from '../../app.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';

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

  rulesetRecordCount: any = new RulesetRecordCount();

  constructor(private bsModalRef: BsModalRef,
              private sharedService: SharedService,
              private localStorage: LocalStoreManager,
              public appService: AppService1
   ){ }

  ngOnInit() {
    setTimeout(() => {
      console.log(this.bsModalRef.content.rulesetModel);
      this.rulesetModel = this.bsModalRef.content.rulesetModel == undefined
        ? new Ruleset() : this.bsModalRef.content.rulesetModel;
        
        this.setHeaderValues(this.rulesetModel);
      }, 0);
  }
  close() {
    this.bsModalRef.hide();
  }

  SendInvite(username : string) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(username)) {
      console.log(username);
      this.bsModalRef.hide();
    } else {
      this.errorMsg = true;
    }
    this.event.emit({
      Username: username
    });
    
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
