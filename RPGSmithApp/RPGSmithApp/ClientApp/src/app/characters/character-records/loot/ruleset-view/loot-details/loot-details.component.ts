import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AlertService, MessageSeverity } from "../../../../../core/common/alert.service";
import { AuthService } from "../../../../../core/auth/auth.service";
import { LocalStoreManager } from "../../../../../core/common/local-store-manager.service";
import { ConfigurationService } from "../../../../../core/common/configuration.service";
import { SharedService } from "../../../../../core/services/shared.service";
import { CommonService } from "../../../../../core/services/shared/common.service";
import { ItemMasterService } from "../../../../../core/services/item-master.service";
import { LootService } from "../../../../../core/services/loot.service";
import { ItemsService } from "../../../../../core/services/items.service";
import { CharactersService } from "../../../../../core/services/characters.service";
import { DBkeys } from "../../../../../core/common/db-keys";
import { ServiceUtil } from "../../../../../core/services/service-util";
import { User } from "../../../../../core/models/user.model";
import { Characters } from "../../../../../core/models/view-models/characters.model";
import { HeaderValues } from "../../../../../core/models/headers.model";
import { Items } from "../../../../../core/models/view-models/items.model";
import { Utilities } from "../../../../../core/common/utilities";
import { ImageViewerComponent } from "../../../../../shared/image-interface/image-viewer/image-viewer.component";
import { DiceRollComponent } from "../../../../../shared/dice/dice-roll/dice-roll.component";

@Component({
  selector: 'app-loot-details',
  templateUrl: './loot-details.component.html',
  styleUrls: ['./loot-details.component.scss']
})

export class lootDetailsForCharComponent implements OnInit, OnDestroy {

  bsModalRef: BsModalRef;
  isLoading: boolean = false;
  showActions: boolean = true;
  isDropdownOpen: boolean = false;
  actionText: string;
  LootId: number;
  ruleSetId: number;
  characterId: number;
  character: Characters = new Characters();
  ItemDetail: any = new Items;
  navigationSubscription;
  headers: HeaderValues = new HeaderValues();
  charNav: any = {};
  pageRefresh: boolean;
  //itemWillGetDropped: boolean = false;
  pauseItemAdd: boolean;
  pauseItemCreate: boolean;
  IsComingFromCombatTracker_GM: boolean = false;
  IsComingFromCombatTracker_PC: boolean = false;
  doesCharacterHasAllies: boolean = false;

  RuleSet: any;
  isLootTaken = false;
  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
    private itemsService: ItemsService, private itemMasterService: ItemMasterService,
    private charactersService: CharactersService, public lootService: LootService
  ) {
    this.route.params.subscribe(params => { this.LootId = params['id']; });
    this.sharedService.shouldUpdateItemsList().subscribe(sharedData => {
      if (sharedData.onPage) this.ItemDetail.isEquipped = sharedData.isEquipped;
      else this.initialize();
    });

    this.navigationSubscription = this.router.events.subscribe((x: any) => {
      if (x instanceof NavigationEnd) {
        this.initialize();
      }
    })
  }
  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
      //if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE))
      //  this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
      if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE)) {
        if (this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerLink == 'character') {
          this.gameStatus(this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE).headerId);
        }
      }
      if (target.className.endsWith("is-show"))
        this.isDropdownOpen = !this.isDropdownOpen;
      else this.isDropdownOpen = false;
    } catch (err) { this.isDropdownOpen = false; }
  }

  ngOnInit() {
    this.IsComingFromCombatTracker_GM = ServiceUtil.setIsComingFromCombatTracker_GM_Variable(this.localStorage);
    this.IsComingFromCombatTracker_PC = ServiceUtil.setIsComingFromCombatTracker_PC_Variable(this.localStorage);
    this.showActionButtons(this.showActions);
    this.initialize();

    //let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    //let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    //if (char) {
    //  if (!icharNav) {
    //    this.charNav = {
    //      'items': '/character/inventory/' + char.headerId,
    //      'spells': '/character/spell/' + char.headerId,
    //      'abilities': '/character/ability/' + char.headerId
    //    };
    //  }
    //  else {
    //    if (!icharNav[char.headerId]) {
    //      this.charNav = {
    //        'items': '/character/inventory/' + char.headerId,
    //        'spells': '/character/spell/' + char.headerId,
    //        'abilities': '/character/ability/' + char.headerId
    //      };
    //    } else {
    //      this.charNav = icharNav[char.headerId];
    //    }
    //  }
    //}

  }

  ngOnDestroy() {
    if (this.navigationSubscription)
      this.navigationSubscription.unsubscribe();
  }


  private initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.headers = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
      if (this.headers) {
        if (this.headers.headerId && this.headers.headerLink == 'character') {
          this.characterId = this.headers.headerId;
        }
      }
      this.isLoading = true;
      this.itemMasterService.getlootById_Cache<any>(this.LootId)
        .subscribe(data => {
          if (data) {
            this.RuleSet = data.ruleSet;
            this.ItemDetail = this.itemMasterService.itemMasterModelData(data, "UPDATE");
           
            this.ruleSetId = this.RuleSet ? this.RuleSet.rulesetId:0;
            this.character.characterId = this.characterId;
            this.character.ruleSet = this.RuleSet;
            this.gameStatus(this.character.characterId);
          }
          //this.ItemDetail = this.itemsService.itemModelData(data, "UPDATE");
          //this.ruleSetId = this.ItemDetail.ruleSetId;
          //this.characterId = this.ItemDetail.characterId;
          //this.character = data.character;
          //this.gameStatus(this.character.characterId);
          //this.ItemDetail.forEach(function (val) { val.showIcon = false; });
          this.isLoading = false;
        }, error => {
          this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {


          this.charactersService.isAllyAssigned(this.characterId).subscribe(data => {
            if (data) {
              this.doesCharacterHasAllies = true;
            }
          }, error => {
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              this.authService.logout(true);
            }
          });

        });
      //this.itemsService.getItemById<any>(this.itemId)
      //  .subscribe(data => {
      //    debugger
      //    this.ItemDetail = this.itemsService.itemModelData(data, "UPDATE");
      //    this.ruleSetId = this.ItemDetail.ruleSetId;
      //    this.characterId = this.ItemDetail.characterId;
      //    this.character = data.character;
      //    this.gameStatus(this.character.characterId);
      //    //this.ItemDetail.forEach(function (val) { val.showIcon = false; });
      //    this.isLoading = false;
      //  }, error => {
      //    this.isLoading = false;
      //    let Errors = Utilities.ErrorDetail("", error);
      //    if (Errors.sessionExpire) {
      //      this.authService.logout(true);
      //    }
      //  }, () => { });
    }
  }

  takeLoot() {
    let model = { multiLootIds: [], characterId:this.characterId };
    model.multiLootIds.push({ lootId: this.LootId, name: this.ItemDetail.itemName })
    this.isLoading = true;
    this.lootService.lootItemsTakeByplayer<any>(model)
      .subscribe(data => {
        this.isLootTaken = true;
          this.alertService.showMessage("Loot taken successfully.", "", MessageSeverity.success);
          
        
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          this.authService.logout(true);
        }
      }, () => { });
  }

 

  
  
  
  

  

  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }

  redirectToItem(itemId: number) {
    if (itemId) {
      this.router.navigate(['/character/inventory-details', itemId]);
      //this.sharedService.updateItemsList({ onPage: false });
    }
  }

  gotoDashboard() {
    this.router.navigate(['/character/dashboard', this.characterId]);
  }

  RedirectBack() {
    if (this.IsComingFromCombatTracker_GM) {
      this.router.navigate(['/ruleset/combat', this.ruleSetId]);
    }
    else if (this.IsComingFromCombatTracker_PC) {
      this.router.navigate(['/character/combatplayer', + this.characterId]);
    }
    else {
      window.history.back();
    }    
    //window.history.back();
  }

  Redirect(path) {
    this.router.navigate([path, this.characterId]);
  }
  RedirectChar(path) {
    this.router.navigate([path]);
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

  private setCharacterID(CharacterID: number) {
    this.localStorage.deleteData(DBkeys.CHARACTER_ID);
    this.localStorage.saveSyncedSessionData(CharacterID, DBkeys.CHARACTER_ID);
  }

  refresh() {
    this.initialize();
  }
  gameStatus(characterId?: any) {
    //api for player controls
    this.charactersService.getPlayerControlsByCharacterId_Cache(characterId)
      .subscribe(data => {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        if (data) {
          if (user == null) {
            this.authService.logout();
          }
          else {
            //if (data.isPlayerCharacter || data.isCurrentCampaignPlayerCharacter) {
            //  this.itemWillGetDropped = true;
            //}
            if (user.isGm) {

              this.pageRefresh = user.isGm;
            }
            else if (data.isPlayerCharacter) {
              this.pageRefresh = data.isPlayerCharacter;
            }
            if (data.isPlayerCharacter) {
              //this.pauseItemAdd = data.pauseItemAdd;
              //this.pauseItemCreate = data.pauseItemCreate;
              //if (data.pauseGame) {
              //  this.router.navigate(['/characters']);
              //  this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
              //  setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              //}
              if (!data.isPlayerLinkedToCurrentCampaign) {
              this.pauseItemAdd = data.pauseItemAdd;
              this.pauseItemCreate = data.pauseItemCreate;
              if (data.pauseGame) {
                this.router.navigate(['/characters']);
                this.alertService.showStickyMessage('', "The GM has paused the game.", MessageSeverity.error);
                setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
              }
              }
              // this.pageRefresh = data.isPlayerCharacter;
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

  GetDescription(description) {
    return ServiceUtil.GetDescriptionWithStatValues(description, this.localStorage);
  }

  GotoCommand(cmd) {
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = cmd;
  }

}
