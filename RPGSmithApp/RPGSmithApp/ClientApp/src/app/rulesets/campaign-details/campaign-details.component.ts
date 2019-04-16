import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { RulesetRecordCount } from '../../core/models/view-models/ruleset-record-count.model';
import { RulesetService } from '../../core/services/ruleset.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';
import { RulesetFormComponent } from '../ruleset-form/ruleset-form.component';
import { ShareRulesetComponent } from '../ruleset-helper/share-ruleset/share-ruleset.component';
import { VIEW } from '../../core/models/enums';
import { AppService1 } from '../../app.service';
import { PlatformLocation } from '@angular/common';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';
import { InvitePlayerComponent } from '../invite-player/invite-player.component';
import { ImageViewerComponent } from '../../shared/image-interface/image-viewer/image-viewer.component';
//import { CampaignInviteComponent } from '../campaign-invite/campaign-invite.component';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { CampaignService } from '../../core/services/campaign.service';
import { Utilities } from '../../core/common/utilities';
import { playerInviteListModel } from '../../core/models/campaign.model';
import { MessageSeverity, AlertService } from '../../core/common/alert.service';
import { ImageSearchService } from '../../core/services/shared/image-search.service';
 
@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.scss']
})
export class CampaignDetailsComponent implements OnInit {

  bsModalRef: BsModalRef;
  rulesetModel = new Ruleset();
  ruleSetId: number;
  rulesetForm: FormGroup;
  isLoading = false;
  rulesetRecordCount: any = new RulesetRecordCount();
  ruleset: any = new Ruleset();
  public event: EventEmitter<any> = new EventEmitter();
  invitedUsers: playerInviteListModel[]= [];
  //showIcon: boolean = false;
  playersSlots: number = 0;
  
  constructor( private formBuilder: FormBuilder, private router: Router, private localStorage: LocalStoreManager,
    private rulesetService: RulesetService, private sharedService: SharedService, private authService: AuthService,
    private modalService: BsModalService, public appService: AppService1, public campaignService: CampaignService,
    private location: PlatformLocation, private route: ActivatedRoute, private alertService: AlertService, private imageSearchService: ImageSearchService,) {

    this.route.params.subscribe(params => {
      this.ruleSetId = params['id'];
      
    });
    
   
  }

  ngOnInit() {
    this.initialize();
  }

  playersControls() {
    this.bsModalRef = this.modalService.show(PlayerControlsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
   
  }

  initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
      this.localStorage.deleteData(DBkeys.CURRENT_RULESET);
    } else { this.playersSlots = user.playerSlot }
    
    this.isLoading = true;
    this.rulesetService.getRulesetById<any>(this.ruleSetId)
      .subscribe(data => {
        this.ruleset = data;
        this.rulesetModel = data;
        this.setHeaderValues(this.ruleset);
        this.rulesetRecordCount = this.ruleset.recordCount;
        //this.isLoading = false;

        this.campaignService.getPlayerInviteList<any>(this.ruleSetId)
          .subscribe(data => {
            this.isLoading = false
            
            this.invitedUsers = data;
            this.invitedUsers.map((x: playerInviteListModel,index) => {
              x.showIcon = false;
              if (x.sendOn) {
                let date = new Date(x.sendOn.replace('T', ' '));
                let string = this.formatAMPM(date) ;
                string += ' ' + date.toDateString().replace(' ', '##').split('##')[1];
                x.sendOn = string;
                
              }
              if (!x.isAccepted) {
                this.bindInvitedPlayerImage(index);
              }
              
              
            })
          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          }, () => { });
      }, error => {
        this.isLoading = false;
        this.ruleset = new Ruleset();
      }, () => { });
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

  generalSetting(ruleset: Ruleset) {

    
    this.bsModalRef = this.modalService.show(RulesetFormComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false,
      initialState: {
        data: ruleset
      }
    });
    this.bsModalRef.content.title = 'Edit Campaign';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.ruleSetImage = ruleset.ruleSetImage;
    ruleset.view = VIEW.MANAGE;
    this.bsModalRef.content.rulesetModel = ruleset;
  }

  characterStats(ruleset: Ruleset) {

    this.rulesetService.ruleset = ruleset;
    this.router.navigate(['/ruleset/character-stats', ruleset.ruleSetId]);
  }

  gotoDashboard(ruleset: Ruleset) {

    this.rulesetService.ruleset = ruleset;
    this.router.navigate(['/ruleset/dashboard', ruleset.ruleSetId]);
  }
  item(ruleset: Ruleset) {

    this.rulesetService.ruleset = ruleset;
    this.router.navigate(['/ruleset/item-master', ruleset.ruleSetId]);
  }

  spell(ruleset: Ruleset) {
   
    this.rulesetService.ruleset = ruleset;
    this.router.navigate(['/ruleset/spell', ruleset.ruleSetId]);
  }

  ability(ruleset: Ruleset) {
    
    this.rulesetService.ruleset = ruleset;
    this.router.navigate(['/ruleset/ability', ruleset.ruleSetId]);
  }

  shareRuleset(ruleset: Ruleset) {
    
    this.bsModalRef = this.modalService.show(ShareRulesetComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.ruleset = ruleset;
  }

  
  close(back?: boolean) {
    this.bsModalRef.hide();
    //this.modalService.hide(1);
    if (back) {
      this.appService.updateAccountSetting1(false);
      this.sharedService.updateAccountSetting(false);
      this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    }
  }
  invitePlayer() {
    console.log('Player invite process');
    this.bsModalRef = this.modalService.show(InvitePlayerComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false,
      initialState: {
        data: this.ruleset
      }
    });
   
    this.bsModalRef.content.ruleSetImage = this.ruleset.ruleSetImage;
    this.bsModalRef.content.rulesetModel = this.ruleset;
    this.bsModalRef.content.event.subscribe(data => {
      
      if (data) {
       
        data.showIcon = false;
        if (data.sendOn) {
          let date = new Date(data.sendOn.replace('T', ' '));
          let string = this.formatAMPM(date);
          string += ' ' + date.toDateString().replace(' ', '##').split('##')[1];
          data.sendOn = string;
          
        }
        this.bindInvitedPlayerImage(this.invitedUsers.length);
        this.invitedUsers.push(data);
      }
      
    });
  }

  ViewImage(img) {
    if (img) {
      this.bsModalRef = this.modalService.show(ImageViewerComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });

      this.bsModalRef.content.ViewImageUrl = img.src;
      this.bsModalRef.content.ViewImageAlt = img.alt;
    }
  }
  manageIcon(invite: playerInviteListModel) {
    
    invite.showIcon = !invite.showIcon;
    //this.rulesets.forEach(function (val) {
    //  if (id === val.ruleSetId) {
    //    val.showIcon = true;
    //  } else {
    //    val.showIcon = false;
    //  }
   // })
  }

  cancleInvite(index, invite) {    
    this.campaignService.cancelInvite<any>(invite.inviteId)
      .subscribe(data => {
        
        this.isLoading = false
        if (data == true) {
          this.invitedUsers.splice(index, 1);
        } else {
          this.alertService.showStickyMessage('', "Unable to cancel invitation", MessageSeverity.error);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
        }     
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { });
   
  }
  //Invitepopup() {
  //  this.bsModalRef = this.modalService.show(CampaignInviteComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false,
  //    initialState: {
  //      data: this.ruleset
  //    }
  //  });
  //  this.bsModalRef.content.ruleSetImage = this.ruleset.ruleSetImage;
  //  this.bsModalRef.content.rulesetModel = this.ruleset;
  //}
  

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
  bindInvitedPlayerImage(index) {
    this.imageSearchService.getDefaultImage<any>('char')
      .subscribe(data => {
        this.invitedUsers[index].playerCharacterImage = data.imageUrl.result;        
      }, error => {
        this.invitedUsers[index].playerCharacterImage = "https://rpgsmithsa.blob.core.windows.net/stock-defimg-chars/MaleHuman.jpg";
      },
        () => { });
  }
  refreshCampaign() {
    this.initialize();
  }
  goToCharacter(characterID:number) {
    this.router.navigate(['/character/dashboard', characterID]);
  }

}
