import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { CampaignService } from '../../core/services/campaign.service';
import { playerControlModel } from '../../core/models/campaign.model';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { Utilities } from '../../core/common/utilities';
import { AuthService } from '../../core/auth/auth.service';
import { AppService1 } from '../../app.service';

@Component({
  selector: 'app-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss']
})
export class PlayerControlsComponent implements OnInit {

  rulesetId: number;
  playerControls: any = new playerControlModel();
  isLoading: boolean = false;
  isloading: boolean = true;

  constructor(private bsModalRef: BsModalRef,
    private campaignService: CampaignService,
    private alertService: AlertService,
    private authService: AuthService,
    private appService: AppService1
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.rulesetId = this.bsModalRef.content.rulesetId;
      this.initialize(this.rulesetId);
    }, 0);
   
  }
  initialize(campaignId) {
    this.isLoading = true;
    this.campaignService.getPlayersControls(campaignId)
      .subscribe(data => {
        this.playerControls = data;
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
        else if (error.statusText == "Bad Request") {
          this.alertService.showStickyMessage('', error.error, MessageSeverity.error);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
        }
      }, () => {

      });
  }

  close() {
    this.bsModalRef.hide();
    // this.destroyModalOnInit();
  }

  setpauseGame(checked:boolean) {
    this.playerControls.pauseGame = checked;
  }
 
  AllowItemCreation(checked : boolean ) {
    this.playerControls.pauseItemCreate = checked;
  }

  AllowSpellcreation(checked: boolean) {
    this.playerControls.pauseSpellCreate = checked;
  }

  AllowAbilityCreation(checked: boolean) {
    this.playerControls.pauseAbilityCreate = checked;
  }
  AllowBuffAndEffectCreation(checked: boolean) {
    this.playerControls.pauseBuffAndEffectCreate = checked;
  }
  AllowItemAdditions(checked: boolean) {
    this.playerControls.pauseItemAdd = checked;
  }
 
  playerspellAdition(checked: boolean) {
    this.playerControls.pauseSpellAdd = checked;
  }
 
  playerAbilityAdditions(checked: boolean) {
    this.playerControls.pauseAbilityAdd = checked;
  }
  playerBuffAndEffectAdditions(checked: boolean) {
    this.playerControls.pauseBuffAndEffectAdd = checked;
    if (checked) {
      this.playerControls.pauseBuffAndEffectCreate = checked;
    }
  }

  //save players Controls
  save() {
    this.isloading = false;
    this.alertService.startLoadingMessage("", "Saving PlayerControls...");
    this.campaignService.UpdatePlayerControls<any>(this.playerControls)
      .subscribe(
      data => {
          this.alertService.stopLoadingMessage();       
        this.alertService.showMessage("Player Controls save successfully.", "", MessageSeverity.success);
          if (data) {
              this.bsModalRef.hide();
          }
         this.isloading = true;
        },
        error => {
          this.isloading = true;
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

  DeleteChatHistory() {
    this.isLoading = true;
    this.campaignService.DeleteChatHistory(this.rulesetId).subscribe(result => {
      if (result) {
        this.appService.updateClearChatWindow(true);
        let msg = "Chat Deleted Successfully";
        this.alertService.showMessage(msg, "", MessageSeverity.success);
      }
      this.isLoading = false;
      this.close();
    }, error => {
        this.isLoading = false;
      });
  }
}
