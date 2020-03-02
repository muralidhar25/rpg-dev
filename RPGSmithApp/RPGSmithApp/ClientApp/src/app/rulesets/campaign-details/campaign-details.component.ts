import { Component, OnInit, Input, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { RulesetRecordCount } from '../../core/models/view-models/ruleset-record-count.model';
import { RulesetService } from '../../core/services/ruleset.service';
import { LocalStoreManager } from '../../core/common/local-store-manager.service';
import { SharedService } from '../../core/services/shared.service';
import { DBkeys } from '../../core/common/db-keys';
import { RulesetFormComponent } from '../ruleset-form/ruleset-form.component';
import { ShareRulesetComponent } from '../ruleset-helper/share-ruleset/share-ruleset.component';
import { VIEW, MarketPlaceItemsType, CAMPAIGNDETAIL } from '../../core/models/enums';
import { AppService1 } from '../../app.service';
import { PlatformLocation } from '@angular/common';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';
import { InvitePlayerComponent } from '../invite-player/invite-player.component';
import { ImageViewerComponent } from '../../shared/image-interface/image-viewer/image-viewer.component';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { CampaignService } from '../../core/services/campaign.service';
import { Utilities } from '../../core/common/utilities';
import { playerInviteListModel, playerInviteSendModel } from '../../core/models/campaign.model';
import { MessageSeverity, AlertService, DialogType } from '../../core/common/alert.service';
import { ImageSearchService } from '../../core/services/shared/image-search.service';
import { PaymentComponent } from '../../shared/payment/payment.component';
import { marketplaceListModel } from '../../core/models/marketplace.model';
import { MarketPlaceService } from '../../core/services/maketplace.service';
import { HandoutuploadComponent } from '../../shared/handouts/handout-upload/handoutupload.component';
import { DiceRollComponent } from '../../shared/dice/dice-roll/dice-roll.component';
import { Characters } from '../../core/models/view-models/characters.model';
import { ChatParticipantStatus } from '../../ng-chat/core/chat-participant-status.enum';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { ServiceUtil } from '../../core/services/service-util';

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
  isItemMasterLoading = false;
  isBuffEffectLoading = false;
  isAblitiesLoading = false;
  isSpellsLoading = false;
  isMonsterLoading = false;
  isMonsterTemplate_AddLoading = false;
  rulesetRecordCount: any = new RulesetRecordCount();
  ruleset: any = new Ruleset();
  public event: EventEmitter<any> = new EventEmitter();
  invitedUsers: playerInviteListModel[] = [];
  //showIcon: boolean = false;
  playersSlots: number = 0;
  marketplacelist: marketplaceListModel[] = [];
  randomImageList: string[] = [];
  declinedUserList: playerInviteListModel[] = [];
  GmCharacterSlotsCount: number = 0;
  character: Characters = new Characters();
  CurrentlyOnlinePlayersCount: number = 0;
  CAMPAIGNDETAILS = CAMPAIGNDETAIL;

  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @Input() contextMenu: ContextMenuComponent;

  constructor(private router: Router, private localStorage: LocalStoreManager, private marketPlaceService: MarketPlaceService,
    private rulesetService: RulesetService, private sharedService: SharedService, private authService: AuthService,
    private modalService: BsModalService, public appService: AppService1, public campaignService: CampaignService,
    private location: PlatformLocation, private route: ActivatedRoute, private alertService: AlertService, private imageSearchService: ImageSearchService,
    private contextMenuService: ContextMenuService) {

    this.route.params.subscribe(params => {
      this.ruleSetId = params['id'];

    });

    this.appService.shouldUpdateRulesetDetails().subscribe(serviceJson => {

      if (serviceJson) {
        if (this.bsModalRef) {
          this.bsModalRef.hide();
        }
        this.initialize();
      }
    })
    this.appService.shouldUpdateChatCurrentParticipants().subscribe(serviceJson => {
      this.CurrentlyOnlinePlayersCount = 0;
      if (serviceJson) {
        if (serviceJson.length) {

          let participants = serviceJson.filter(x => !x.chattingTo);
          participants.map((x) => {
            this.invitedUsers.filter(z => z.playerCharacterId == x.characterID).map((s: any) => {
              if (x.status == ChatParticipantStatus.Online) {
                s.isConnected = true;
              }
              else {
                s.isConnected = false;
              }
            })
          })
          this.CurrentlyOnlinePlayersCount = participants.filter(x => x.status == ChatParticipantStatus.Online).length;
        }

      }
    });

  }

  ngOnInit() {
    this.destroyModalOnInit();
    this.initialize();
  }
  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }
  playersControls() {
    this.bsModalRef = this.modalService.show(PlayerControlsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false,
    });
    this.bsModalRef.content.rulesetId = this.ruleSetId;
  }

  initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
      this.localStorage.deleteData(DBkeys.CURRENT_RULESET);
    } else { this.playersSlots = user.playerSlot }

    this.isLoading = true;
    this.setRulesetId(this.ruleSetId);
    this.imageSearchService.getDefaultImageList<any>('char')
      .subscribe(data => {
        this.randomImageList = data;
      }, error => {

      },
        () => { });
      this.rulesetService.getRulesetById<any>(this.ruleSetId)
        .subscribe(data => {
          this.ruleset = data;
          this.rulesetModel = data;
          this.setHeaderValues(this.ruleset);
          this.rulesetRecordCount = this.ruleset.recordCount;
          this.declinedUserList = [];
          this.invitedUsers = [];
          this.campaignService.getPlayerInviteList<any>(this.ruleSetId)
            .subscribe(data => {
              this.invitedUsers = data;
              this.GmCharacterSlotsCount = this.invitedUsers.filter(x => !x.inviteId).length;
              this.declinedUserList = this.invitedUsers.filter(x => x.isDeclined);
              this.invitedUsers = this.invitedUsers.filter(x => !x.isDeclined);
              let names = '';
              this.invitedUsers.map((x: playerInviteListModel, index) => {
                x.showIcon = false;
                if (x.sendOn) {
                  let date = new Date(x.sendOn.replace('T', ' '));
                  let string = this.formatAMPM(date);
                  string += ' ' + date.toDateString().replace(' ', '##').split('##')[1];
                  x.sendOn = string;
                }
                if (!x.isAccepted) {
                  this.bindInvitedPlayerImage(index);
                }
              });
              if (this.declinedUserList.length) {
                this.declinedUserList.map((x, xIndex) => {
                  if (xIndex == this.declinedUserList.length - 1) {
                    if (x.isSendToUserName) {
                      names += x.playerUserName + " ";
                    }
                    else {
                      names += x.playerUserEmail + " ";
                    }
                  }
                  else {
                    if (x.isSendToUserName) {
                      names += x.playerUserName + ", ";
                    }
                    else {
                      names += x.playerUserEmail + ", ";
                    }
                  }
                });

                this.alertService.showDialog(names + " has declined your invitation.",
                  DialogType.confirm, () => this.RemoveResendInvites(this.declinedUserList, true), () => this.RemoveResendInvites(this.declinedUserList, false), "Resend", "Ok");
              }
              this.isLoading = false;
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
    }
  
  _counter = 0;
  private setHeaderValues(ruleset: Ruleset): any {
    try {
      if (this._counter == 0) {
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
        this._counter += 1;
      }
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
    this.bsModalRef.content.rulesetRecordCount = this.rulesetRecordCount;
    this.bsModalRef.content.RuleSet = this.ruleset;
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

  loot(ruleset: Ruleset) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
    }
    else {
      if (user.isGm) {
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/loot', ruleset.ruleSetId]);
      }
    }
  }
  buff_effects(ruleset: Ruleset) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
    }
    else {
      if (user.isGm) {
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/buff-effect', ruleset.ruleSetId]);
      }
    }
  }
  handOuts(ruleset: Ruleset) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
    }
    else {
      if (user.isGm) {
        this.rulesetService.ruleset = ruleset;
        this.bsModalRef = this.modalService.show(HandoutuploadComponent, {
          class: 'modal-primary modal-lg',
          ignoreBackdropClick: true,
          keyboard: false
        });
        this.bsModalRef.content.title = 'HandOuts';
        this.bsModalRef.content.ruleset = ruleset;
      }
    }
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
    //console.log('Player invite process');
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

        this.invitedUsers.push(data);
        this.bindInvitedPlayerImage(this.invitedUsers.length - 1);
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
    //console.log('here is cancle invit clicked');
    this.campaignService.cancelInvite<any>(invite.inviteId)
      .subscribe(data => {
        this.isLoading = false;
        if (data == true) {
          this.invitedUsers.splice(index, 1);
        } else {
          try {
            this.invitedUsers.splice(index, 1);

          } catch (e) {

          }
          //this.alertService.showStickyMessage('', "Unable to cancel invitation", MessageSeverity.error);
          //setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
        }
      }, error => {
        console.log('error', error);
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
    if (this.randomImageList.length) {
      let randomNum = Math.ceil((Math.random() * (this.randomImageList.length - 1)) + 0);
      this.invitedUsers[index].playerCharacterImage = this.randomImageList[randomNum];
    }
    else {
      this.invitedUsers[index].playerCharacterImage = "https://rpgsmithsa.blob.core.windows.net/stock-defimg-chars/MaleHuman.jpg";
    }
  }
  refreshCampaign() {
    this.initialize();
  }
  goToCharacter(characterID: number) {
    this.localStorage.localStorageSetItem(DBkeys.IsCharacterOpenedFromCampaign, true);
    this.router.navigate(['/character/dashboard', characterID]);
  }
  BuyPlayerSlot() {
    let paymentInfo = this.marketplacelist.filter(x => x.marketPlaceId == MarketPlaceItemsType.PLAYER_SLOT)[0];
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
        case MarketPlaceItemsType.PLAYER_SLOT:
          user.playerSlot = user.playerSlot + paymentDoneForItem.qty;
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
      this.playersSlots = this.playersSlots + paymentDoneForItem.qty;
    });

  }
  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  }
  removePlayerAndDeleteCharacter(index, invite: playerInviteListModel) {

    this.alertService.showDialog('This will remove "' + invite.playerCharacterName + '" from this campaign and delete their character including any items carried. Are you sure you would like to do this?',
      DialogType.confirm, () => this.removePlayerAndDeleteCharacterFinal(index, invite), () => { }, "Yes", "No");

  }
  removePlayerAndDeleteCharacterFinal(index, invite: playerInviteListModel) {
    this.campaignService.removePlayer<any>(invite)
      .subscribe(data => {
        this.invitedUsers.splice(index, 1);
        this.alertService.showStickyMessage('', "Player has been removed successfully.", MessageSeverity.success);
        setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
        else
          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
      }, () => { });
  }
  RemoveResendInvites(DeclinesInvites: playerInviteListModel[], resendInvite: boolean = false) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
    }
    else {
      DeclinesInvites.map((x) => {

        let modal: playerInviteSendModel = new playerInviteSendModel();

        if (x.isSendToUserName) {
          modal.userName = x.playerUserName;
        }
        else {
          modal.userName = x.playerUserEmail;
        }

        modal.sendByUserName = user.userName;
        modal.sendByUserId = user.id;
        modal.campaignId = this.rulesetModel.ruleSetId;
        modal.sendByCampaignImage = this.rulesetModel.imageUrl ? this.rulesetModel.imageUrl : 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png';
        modal.sendByCampaignName = this.rulesetModel.ruleSetName;
        this.campaignService.removePlayer<any>(x)
          .subscribe(data => {
            if (resendInvite) {
              this.campaignService.sendInvite<any>(modal)
                .subscribe(
                  data => {
                    if (data) {
                      this.alertService.showMessage("Invitation send successfully.", "", MessageSeverity.success);
                      data.showIcon = false;
                      if (data.sendOn) {
                        let date = new Date(data.sendOn.replace('T', ' '));
                        let string = this.formatAMPM(date);
                        string += ' ' + date.toDateString().replace(' ', '##').split('##')[1];
                        data.sendOn = string;

                      }

                      this.invitedUsers.push(data);
                      this.bindInvitedPlayerImage(this.invitedUsers.length - 1);
                    }
                  },
                  error => {
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                      this.authService.logout(true);
                    }

                  },
                );
            }

          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
            else {
              //this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            }
          }, () => { });


      })

    }

  }
  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.character.lastCommand = null;
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.recordName = this.rulesetModel.ruleSetName;
    this.bsModalRef.content.recordImage = this.rulesetModel.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset'
    this.bsModalRef.content.isFromCampaignDetail = true;
  }

  GetAcceptedPlayersCount(): number {
    return this.invitedUsers.filter(x => x.isAccepted).length;
  }
  dashboard(ruleset: Ruleset) {
    this.rulesetService.ruleset = ruleset;
    this.router.navigate(['/ruleset/campaign-dashboard', ruleset.ruleSetId]);
  }
  monsterTemplates() {
    this.router.navigate(['/ruleset/monster-template', this.ruleSetId]);
  }
  monsters() {
    this.router.navigate(['/ruleset/monster', this.ruleSetId]);
  }
  openCombatTracker() {
    this.router.navigate(['/ruleset/combat', this.ruleSetId]);
  }
  lootPiletemplate(ruleset: Ruleset) {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
    }
    else {
      if (user.isGm) {
        this.rulesetService.ruleset = ruleset;
        this.router.navigate(['/ruleset/loot-pile-template', ruleset.ruleSetId]);
      }
    }
  }
  public onContextMenu($event: MouseEvent, campaignDetail): void {
    this.contextMenuService.show.next({
      anchorElement: $event.target,
      // Optional - if unspecified, all context menu components will open
      contextMenu: this.contextMenu,
      event: <any>$event,
      item: campaignDetail,
    });
    $event.preventDefault();
    $event.stopPropagation();
  }

  openInNewTab(itemType) {
    switch (itemType) {
      case CAMPAIGNDETAIL.DASHBOARD:
        //window.open('/ruleset/campaign-dashboard');
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/campaign-dashboard/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.MONSTER_TEMPLATES:
        //window.open('/ruleset/monster-template');
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/monster-template/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.MONSTERS:
        //window.open('/ruleset/monster');
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/monster/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.DEFAULT_LAYOUTS:
        //window.open('/ruleset/dashboard');
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/dashboards/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.CHARACTER_STATS:
        //window.open('/ruleset/character-stats');
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/character-statss/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.ITEM_TEMPLATES:
        //window.open('/ruleset/item-master');
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/item-masters/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.SPELLS:
        //window.open('/ruleset/spell');
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/spells/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.ABILITIS:
        //window.open('/ruleset/ability');
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/abilitys/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.BUFFS_EFFECTS:
        //window.open('/ruleset/buff-effect' + this.ruleSetId);
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/buff-effect/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.RANDOM_LOOT:
        //window.open('/ruleset/loot-pile-template' + this.ruleSetId);
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/loot-pile-template/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;
      case CAMPAIGNDETAIL.LOOT:
        //window.open('/ruleset/loot' + this.ruleSetId);
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        this.router.navigate([]).then(result => { window.open(['/ruleset/loot/' + RuleSetId].toString() + '?l=1', '_blank'); });
        break;

      default:
    }
  }

  openInNewWindow(itemType) {
    switch (itemType) {
      case CAMPAIGNDETAIL.DASHBOARD:
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        window.open(['/ruleset/campaign-dashboard/' + RuleSetId].toString() + '?l=1', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.MONSTER_TEMPLATES:
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        window.open(['/ruleset/monster-template/' + RuleSetId].toString() + '?l=1', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.MONSTERS:
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        window.open(['/ruleset/monster/' + RuleSetId].toString() + '?l=1', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.DEFAULT_LAYOUTS:
        window.open('/ruleset/dashboard', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.CHARACTER_STATS:
        window.open('/ruleset/character-stats', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.ITEM_TEMPLATES:
        window.open('/ruleset/item-master', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.SPELLS:
        window.open('/ruleset/spell', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.ABILITIS:
        window.open('/ruleset/ability', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.BUFFS_EFFECTS:
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        window.open(['/ruleset/buff-effect/' + RuleSetId].toString() + '?l=1', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.RANDOM_LOOT:
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        window.open(['/ruleset/loot-pile-template/' + RuleSetId].toString() + '?l=1', '_blank', "top=100,left=200,width=700,height=500");
        break;
      case CAMPAIGNDETAIL.LOOT:
        var RuleSetId = ServiceUtil.EncryptID(this.ruleSetId);
        window.open(['/ruleset/loot/' + RuleSetId].toString() + '?l=1', '_blank', "top=100,left=200,width=700,height=500");
        break;

      default:
    }
  }
  

}
