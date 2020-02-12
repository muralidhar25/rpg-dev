import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { AlertService, DialogType, MessageSeverity } from "../../core/common/alert.service";
import { AuthService } from "../../core/auth/auth.service";
import { RulesetService } from "../../core/services/ruleset.service";
import { ConfigurationService } from "../../core/common/configuration.service";
import { CharactersService } from "../../core/services/characters.service";
import { SharedService } from "../../core/services/shared.service";
import { CommonService } from "../../core/services/shared/common.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { User } from "../../core/models/user.model";
import { DBkeys } from "../../core/common/db-keys";
import { Utilities } from "../../core/common/utilities";
import { Characters } from "../../core/models/view-models/characters.model";
import { AccountSettingsComponent } from "../../shared/accounts/account-settings/account-settings.component";
import { AppService1 } from "../../app.service";
import { MarketPlaceService } from "../../core/services/maketplace.service";
import { marketplaceListModel } from "../../core/models/marketplace.model";
import { MarketPlaceItemsType } from "../../core/models/enums";
import { PaymentComponent } from "../../shared/payment/payment.component";
import { CharactersFormComponent } from "../../shared/characters-form/characters-form.component";
import { ServiceUtil } from "../../core/services/service-util";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { CampaignService } from "../../core/services/campaign.service";
import { InviteAddCharctersFormComponent } from "../../shared/invite-add-charcters-form/invite-add-charcters-form.component";

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss']
})
export class CharactersComponent implements OnInit {

  query: string;
  page: number = 1;
  pageSize: number = 30;
  bsModalRef: BsModalRef;
  characters: any = [];
  rulesets: Ruleset[];
  rulesetId: number;
  showForm: boolean = false;
  hasAuth: boolean = false;
  isAdminUser: boolean = false;
  totalRuleSets: number = 1;
  isGmUser: boolean = false;
  characterSlot: number;
  marketplacelist: marketplaceListModel[] = [];
  invitation: any[] = [];
  invitationList: any;
  haveNewInvitation: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router, private alertService: AlertService, private marketPlaceService: MarketPlaceService,
    private authService: AuthService, private rulesetService: RulesetService, private Aroute: ActivatedRoute,
    private charactersService: CharactersService, private configurations: ConfigurationService,
    private modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService, public appService: AppService1,
    private campaignService: CampaignService) {
    this.Aroute.params.subscribe(params => {

      //this.destroyModalOnInit();
      this.initialize();
    });
    if (!this.authService.isLoggedIn) {
      this.authService.logout();
    } else
      this.hasAuth = true;

    this.sharedService.shouldUpdateCharacterList().subscribe(serviceJson => {

      if (serviceJson) {
        this.page = 1;
        this.pageSize = 30;
        this.initialize();
      }
    });
    this.appService.shouldUpdateCharacterList().subscribe(serviceJson => {

      if (serviceJson) {
        this.page = 1;
        this.pageSize = 30;
        this.initialize();
      }
    });
    this.appService.shouldUpdateCharacterSlotsCount().subscribe(serviceJson => {

      if (serviceJson) {
        this.characterSlot = +serviceJson;
      }
    });
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
    } catch (err) { }
  }

  ngOnInit() {
    this.destroyModalOnInit();
    //this.initialize(); Now its calling in constructor routes subscribe

    this.appService.updatCloseNotificationInterval(true);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.isGmUser = true;
      }
      this.characterSlot = user.characterSlot;

      this.invitationList = [];
      this.campaignService.CheckInvites<any>(user.id)
        .subscribe(data => {
          if (data) {
            if (data.length) {
              this.invitationList = data;
              console.log("invites => ", this.invitationList)
              this.haveNewInvitation = true;
            }
          } else {
            this.haveNewInvitation = false;
          }
        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });

      this.isAdminUser = user.roles.some(function (value) { return (value === "administrator") });
      this.isLoading = true;
      this.hasAuth = true;
      //if (!this.authService.hasEmailFb && this.authService.socialLogin === 'facebook') {
      //this.openAccountSettingsModal();
      //}
      this.rulesetService.getRulesetsCount(user.id)
        .subscribe(data => {
          this.totalRuleSets = data;
        },
          error => {
            this.totalRuleSets = 1;
          });
      this.charactersService.getCharactersByUserId_sp<any>(user.id, this.page, this.pageSize)
          .subscribe(data => {
            debugger
          this.totalRuleSets = data.RuleSet.length;
          this.characters = Utilities.responseData(data.CharactersList, this.pageSize);
          this.rulesets = data.RuleSet;
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("Error", error);
          if (Errors.sessionExpire) this.authService.logout(true);
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
      //this.rulesetService.getRulesetsByUserId<any[]>(user.id)
      //    .subscribe(data => {

      //        this.rulesets = data;
      //        this.isLoading = false;
      //    }, error => {
      //        this.isLoading = false;
      //        let Errors = Utilities.ErrorDetail("Error", error);
      //        if (Errors.sessionExpire) this.authService.logout(true);
      //    }, () => { });

      //resetting headers
      this.resetHeaderValues();
    }
  }

  onScroll() {

    ++this.page;

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.charactersService.getCharactersByUserId_sp<any>(user.id, this.page, this.pageSize)
        .subscribe(data => {

          var _CharactersList = data.CharactersList;
          for (var i = 0; i < _CharactersList.length; i++) {
            this.characters.push(_CharactersList[i]);
          }

        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
        }, () => { });
    }
  }

  newCharacter() {
    this.showAddModal();
  }
  //[routerLink]="['/character/dashboard', character.characterId]
  private showAddModal() {
    this.bsModalRef = this.modalService.show(CharactersFormComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    //this.bsModalRef.content.title = 'New Character';
    this.bsModalRef.content.title = 'New Standalone Character';
    this.bsModalRef.content.button = 'CREATE';
    this.bsModalRef.content.charactersModel = {
      characterId: 0,
      ruleSets: this.rulesets
    };
    this.bsModalRef.content.ruleSet = this.rulesets;
  }

  manageIcon(id: number) {
    this.characters.forEach(function (val) {
      if (id === val.characterId) {
        val.showIcon = true;
      } else {
        val.showIcon = false;
      }
    })
  }

  gotoDashboard(character: any) {
    if (character.inviteId) {
      this.localStorage.localStorageSetItem(DBkeys.IsPlayerCharacterLoading, true)
    }
    else {
      this.localStorage.localStorageSetItem(DBkeys.IsCharacterLoading, true)
    }

    //this.rulesetId = character.ruleSet == undefined ? 0 : character.ruleSet.ruleSetId;
      this.rulesetId = character.ruleSetId ? character.ruleSetId : 0;
    this.setRulesetId(this.rulesetId);

    this.appService.updateStartNotificationInterval(true);

    this.localStorage.localStorageSetItem(DBkeys.IsCharacterOpenedFromCampaign, false);
    this.router.navigate(['/character/dashboard', character.characterId])
    //this.router.navigate(['/character/dashboard', character.characterId], { skipLocationChange: true });
    //window.history.pushState('', '', '/character/dashboard')
  }

    editCharacter(character: Characters) {
      debugger
    this.bsModalRef = this.modalService.show(CharactersFormComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Character';
    this.bsModalRef.content.button = 'SAVE';
        this.bsModalRef.content.characterImage = character.imageUrl;
    this.bsModalRef.content.charactersModel = character;
    this.bsModalRef.content.ruleSet = this.rulesets;
  }

    duplicateCharacter(character: Characters) {
        debugger;
    this.bsModalRef = this.modalService.show(CharactersFormComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Duplicate Character';
    this.bsModalRef.content.button = 'DUPLICATE';
        this.bsModalRef.content.characterImage = character.imageUrl;
    this.bsModalRef.content.charactersModel = character;
    this.bsModalRef.content.ruleSet = this.rulesets;
  }

  deleteCharacter(character: Characters) {
    this.alertService.showDialog('Are you sure you want to delete "' + character.characterName + '" Character?',
      DialogType.confirm, () => this.deleteCharacterHelper(character), null, 'Yes', 'No');
  }

  private deleteCharacterHelper(character: Characters) {
    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Deleting Character");

    this.charactersService.deleteCharacters(character.characterId)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.commonService.UpdateCounts(); /*update charaters count*/

          this.alertService.showMessage("Character has been deleted successfully.", "", MessageSeverity.success);
          this.characters = this.characters.filter((val) => val.characterId != character.characterId);
          // this.initialize();
        },
        error => {

          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let _message = "Unable to Delete";
          let Errors = Utilities.ErrorDetail(_message, error);
          if (Errors.sessionExpire) {
            //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);

        });
  }

  private openAccountSettingsModal() {
    this.bsModalRef = this.modalService.show(AccountSettingsComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  private resetHeaderValues(): any {
    try {
      this.appService.updateAccountSetting1(-1);
      this.sharedService.updateAccountSetting(-1);
      this.localStorage.deleteData(DBkeys.HEADER_VALUE);
      this.localStorage.saveSyncedSessionData(null, DBkeys.HEADER_VALUE);
    } catch (err) { }
  }

  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);

  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      this.appService.updateAccountSetting1(false);
      this.sharedService.updateAccountSetting(false);
      this.localStorage.deleteData(DBkeys.HEADER_VALUE);
      //const modalContainer = document.querySelector('modal-container');
      //if (modalContainer !== null) {
      //    modalContainer.parentNode.removeChild(modalContainer);
      //}
    } catch (err) { }
  }
  BuyCharacterSlot() {

    let paymentInfo = this.marketplacelist.filter(x => x.marketPlaceId == MarketPlaceItemsType.CHARACTER_SLOT)[0];
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
    });

  }

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
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

  Accept(inviteId, invites) {
    this.isLoading = true;
    let rulesetid = invites.playerCampaignID;
    let invitedid = invites.id;
    this.rulesets = [];
    this.rulesets.push(invites.playerCampaign);

    this.isLoading = false;
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
      rulesetid: rulesetid,
      inviteid: invitedid
    };
    this.bsModalRef.content.ruleSet = this.rulesets;
    this.bsModalRef.content.rulesetid = rulesetid;
    this.bsModalRef.content.inviteid = invitedid;
    this.bsModalRef.content.invitationList = this.invitationList;

  }

  Decline(index, inviteId) {
    this.isLoading = true;
    this.campaignService.declineInvite<any>(inviteId)
      .subscribe(data => {
        if (data.isDeclined) {
          this.alertService.showStickyMessage('', "invitation decline", MessageSeverity.success);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
          this.invitationList.splice(index, 1);
          this.appService.updateInvitationlist(this.invitationList);
          if (this.invitationList.length == 0) {
            //this.close();
          }
        } else {
          this.alertService.showStickyMessage('', "Unable to decline invitation", MessageSeverity.error);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
        }
        this.isLoading = false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      }, () => { })

  }
  
}
