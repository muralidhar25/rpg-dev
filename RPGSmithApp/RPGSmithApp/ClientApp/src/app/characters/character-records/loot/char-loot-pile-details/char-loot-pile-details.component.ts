import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ItemMaster } from "../../../../core/models/view-models/item-master.model";
import { AlertService, MessageSeverity } from "../../../../core/common/alert.service";
import { AuthService } from "../../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../../core/common/local-store-manager.service";
import { LootService } from "../../../../core/services/loot.service";
import { ItemMasterService } from "../../../../core/services/item-master.service";
import { PlatformLocation } from "@angular/common";
import { User } from "../../../../core/models/user.model";
import { DBkeys } from "../../../../core/common/db-keys";
import { Utilities } from "../../../../core/common/utilities";
import { ImageViewerComponent } from "../../../../shared/image-interface/image-viewer/image-viewer.component";
import { DiceRollComponent } from "../../../../shared/dice/dice-roll/dice-roll.component";
import { HeaderValues } from "../../../../core/models/headers.model";
import { CharactersService } from "../../../../core/services/characters.service";
import { Characters } from "../../../../core/models/view-models/characters.model";
import { AppService1 } from "../../../../app.service";
import { SharedService } from "../../../../core/services/shared.service";

@Component({
  selector: 'app-char-loot-pile-details',
  templateUrl: './char-loot-pile-details.component.html',
  styleUrls: ['./char-loot-pile-details.component.scss']
})

export class CharacterLootPileDetailsComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  actionText: string;
  lootPileId: number;
  isDropdownOpen: boolean = false;
  characterId: number;
  bsModalRef: BsModalRef;
  LootPileDetail: any = new ItemMaster();
  ruleSet: any;
  lootPileItems: any[] = [];
  IsGm: boolean = false;
  character: any;
  headers: HeaderValues = new HeaderValues();
  pauseAbilityAdd: boolean;
  pauseAbilityCreate: boolean;
  pageRefresh: boolean;
  isGM_Only: boolean = false;

  constructor(
    private router: Router, private route: ActivatedRoute,
    private alertService: AlertService, private authService: AuthService,
    public modalService: BsModalService, private localStorage: LocalStoreManager,
    private itemMasterService: ItemMasterService, public lootService: LootService,
    private location: PlatformLocation, private characterService: CharactersService,
    private appService: AppService1, private sharedService: SharedService) {
    location.onPopState(() => this.modalService.hide(1));
    this.route.params.subscribe(params => {
      this.lootPileId = params['id']; this.initialize();
    });
  }
  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className.endsWith("is-show"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }

  ngOnInit() {
    this.initialize();
    this.showActionButtons(this.showActions);
  }

  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      if (user.isGm) {
        this.IsGm = user.isGm;
      }

      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'character') {
          this.characterId = this.headers.headerId;
        }
      }

      //api to get character details
      this.characterService.getCharactersById<any>(this.characterId)
        .subscribe(data => {
          this.character = data;
          this.setHeaderValues(this.character);
          if (this.character.characterId) {
            this.gameStatus(this.character.characterId);
          }

        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });

      //api to get loot pile details 
      this.isLoading = true;
      this.itemMasterService.getLootPile<any>(this.lootPileId)
        .subscribe(data => {
          if (data) {
            this.ruleSet = data.lootPileRuleSet;
            this.lootPileItems = data.lootPileItems;
            this.LootPileDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");
            this.LootPileDetail.ruleSet = this.ruleSet;
            this.isLoading = false;
          }

        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => { });
    }
  }

  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  RedirectBack() {
    window.history.back();
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

  openDiceRollModal() {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.recordName = this.character.characterName;
    this.bsModalRef.content.recordImage = this.character.imageUrl;
  }

  Visible(item) {
    let visible = item.isVisible ? 'Hide' : 'Show';
    this.lootService.showLootPile<any>(item.lootId, !item.isVisible)
      .subscribe(data => {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        item.isVisible = !item.isVisible;
      },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to " + visible, error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        });
  }

  TakeLootPile(lootPile) {
    let _msg = "Taking Loot";
    this.alertService.startLoadingMessage("", _msg);
    this.TakeLootItems(lootPile);
  }

  TakeLootItems(lootPile) {
    this.itemMasterService.getCharacterItemCount(this.ruleSet.rulesetId, this.characterId)
      .subscribe((data: any) => {
        let ItemCount = data.itemCount;
        let selectedItemCount = 0;
        let multiLootIds = [];
        if (this.lootPileItems && this.lootPileItems.length) {
          selectedItemCount = this.lootPileItems.length;
          this.lootPileItems.map(x => {
            multiLootIds.push({ lootId: x.lootId, name: x.itemName });
          });
        } else {
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("Selected loot pile is empty", "", MessageSeverity.warn);
          return false;
        }

        let model = { characterId: this.characterId, multiLootIds: multiLootIds };
        if ((ItemCount + selectedItemCount) < 200) {

          this.lootService.lootItemsTakeByplayer<any>(model)
            .subscribe(data => {
              if (data) {
                this.appService.updateChatWithTakenByLootMessage({ characterName: this.character.characterName, lootItems: model.multiLootIds ? model.multiLootIds : [] });
                this.alertService.stopLoadingMessage();
                this.alertService.showMessage("Loot Taken", "", MessageSeverity.success);
                this.router.navigate(['/character/loot', this.characterId]);
              }
            }, error => {
              this.alertService.stopLoadingMessage();
              let Errors = Utilities.ErrorDetail("", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
            }, () => { });
        }
        else {
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage("The maximum number of Items has been reached, 200. Please delete some Items and try again.", "", MessageSeverity.error);
        }
      }, error => {
        this.alertService.stopLoadingMessage();
      }, () => { });

  }

  private setHeaderValues(character: Characters): any {
    let headerValues = {
      headerName: character.characterName,
      headerImage: character.imageUrl,
      headerId: character.characterId,
      headerLink: 'character',
      hasHeader: true
    };
    this.appService.updateAccountSetting1(headerValues);
    this.sharedService.updateAccountSetting(headerValues);
    this.localStorage.deleteData(DBkeys.HEADER_VALUE);
    this.localStorage.saveSyncedSessionData(headerValues, DBkeys.HEADER_VALUE);
  }

  gameStatus(characterId?: any) {
    //api for player controls
    this.characterService.getPlayerControlsByCharacterId(characterId)
      .subscribe(data => {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user == null) {
            this.authService.logout();
          }
          else {
            if (data.isPlayerCharacter && data.isPlayerLinkedToCurrentCampaign) {
              this.isGM_Only = true;
            }
            if (user.isGm) {
              this.pageRefresh = user.isGm;
            }
            else if (data.isPlayerCharacter) {
              this.pageRefresh = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {
              if (!data.isPlayerLinkedToCurrentCampaign) {
                this.pauseAbilityAdd = data.pauseAbilityAdd;
                this.pauseAbilityCreate = data.pauseAbilityCreate;

                if (data.pauseGame) {
                  this.router.navigate(['/characters']);
                  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
                }

              }
            }
            if (data.isDeletedInvite) {
              this.router.navigate(['/characters']);
              this.alertService.showStickyMessage('', "Your " + data.name + " character has been deleted by the GM", MessageSeverity.error);
              setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
            }
          }
        }
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }

}
