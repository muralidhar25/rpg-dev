import { Component, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { ItemMaster } from "../../../../../core/models/view-models/item-master.model";
import { Ruleset } from "../../../../../core/models/view-models/ruleset.model";
import { Characters } from "../../../../../core/models/view-models/characters.model";
import { SharedService } from "../../../../../core/services/shared.service";
import { LocalStoreManager } from "../../../../../core/common/local-store-manager.service";
import { ConfigurationService } from "../../../../../core/common/configuration.service";
import { ItemMasterService } from "../../../../../core/services/item-master.service";
import { Items } from "../../../../../core/models/view-models/items.model";
import { CommonService } from "../../../../../core/services/shared/common.service";
import { ItemsService } from "../../../../../core/services/items.service";
import { AuthService } from "../../../../../core/auth/auth.service";
import { AlertService, DialogType, MessageSeverity } from "../../../../../core/common/alert.service";
import { RulesetService } from "../../../../../core/services/ruleset.service";
import { DBkeys } from "../../../../../core/common/db-keys";
import { User } from "../../../../../core/models/user.model";
import { Utilities } from "../../../../../core/common/utilities";
import { ImageViewerComponent } from "../../../../../shared/image-interface/image-viewer/image-viewer.component";
import { CreateItemMsterComponent } from "../../../../../records/item-master/create-item/create-item.component";
import { AppService1 } from "../../../../../app.service";
import { Bundle } from "../../../../../core/models/view-models/bundle.model";
import { CreateBundleComponent } from "../../../../../records/item-master/create-bundle/create-bundle.component";
import { CharactersService } from "../../../../../core/services/characters.service";

@Component({
  selector: 'app-ruleset-view-bundle-detail',
  templateUrl: './ruleset-view-bundle-detail.component.html',
  styleUrls: ['./ruleset-view-bundle-detail.component.scss']
})
export class RulesetViewBundleDetailComponent implements OnInit {

  isLoading = false;
  showActions: boolean = true;
  actionText: string;
  bundleId: number;
  ruleSetId: number;
  bsModalRef: BsModalRef;
  isDropdownOpen: boolean = false;
  bundleDetail: any = new Bundle();
  ruleset: Ruleset = new Ruleset();
  charNav: any = {};

  characterItemModal: any = new Items();
  character: any = new Characters();
  IsAddingRecord: boolean = false;
  bundleItems: any[] = [];
  pageRefresh: boolean;

  constructor(
    private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
    private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
    private sharedService: SharedService, private commonService: CommonService,
    private itemMasterService: ItemMasterService, private rulesetService: RulesetService, private itemsService: ItemsService
    , public appService: AppService1, private charactersService: CharactersService
  ) {
    this.route.params.subscribe(params => { this.bundleId = params['id']; });
    this.sharedService.shouldUpdateItemMasterList().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.initialize();
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

    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    let icharNav = this.localStorage.localStorageGetItem(DBkeys.CHARACTER_NAVIGATION);
    if (!icharNav) {
      this.charNav = {
        'items': '/character/inventory/' + char.headerId,
        'spells': '/character/spell/' + char.headerId,
        'abilities': '/character/ability/' + char.headerId
      };
    }
    else {
      if (!icharNav[char.headerId]) {
        this.charNav = {
          'items': '/character/inventory/' + char.headerId,
          'spells': '/character/spell/' + char.headerId,
          'abilities': '/character/ability/' + char.headerId
        };
      } else {
        this.charNav = icharNav[char.headerId];
      }
    }
  }

  private initialize() {

    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (char) {
      if (char.headerId) {
        this.character.characterName = char.headerName;
        this.character.imageUrl = char.headerImage;
        this.character.characterId = char.headerId;
        this.setHeaderValues(this.character);
      }
    }


    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
      this.isLoading = true;
      //api for player controls
      this.charactersService.getPlayerControlsByCharacterId(this.character.characterId)
        .subscribe(data => {
          if (data) {
         
            if (data.pauseGame) {
              this.router.navigate['/characters'];
            }
            this.pageRefresh = data.isPlayerCharacter;

          }
        }, error => {
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        });
      this.rulesetService.getRulesetById<any>(this.ruleSetId)
        .subscribe(data => {
          this.ruleset = data;
        },
          error => {
          });   

      this.itemMasterService.getBundleById<any[]>(this.bundleId)
        .subscribe(data => {

          this.bundleDetail = this.itemMasterService.bundleModelData(data, "UPDATE");
          let mod: any = data;
          this.bundleItems = mod.itemMasterBundleItems;
          //this.bundleDetail.forEach(function (val) { val.showIcon = false; });
          this.rulesetService.GetCopiedRulesetID(this.bundleDetail.ruleSetId, user.id).subscribe(data => {
            let id: any = data
            //this.ruleSetId = id;
            this.ruleSetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
            this.isLoading = false;
          }, error => {
            this.isLoading = false;
            let Errors = Utilities.ErrorDetail("", error);
            if (Errors.sessionExpire) {
              //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
              this.authService.logout(true);
            }
          }, () => { });


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

  showActionButtons(showActions) {
    this.showActions = !showActions;
    if (showActions) {
      this.actionText = 'ACTIONS';//'Show Actions';
    } else {
      this.actionText = 'HIDE';//'Hide Actions';
    }
  }
  RedirectBack() {
    //this.router.navigate(['/character/ruleset/items', this.ruleSetId]);
    window.history.back();
  }
  Redirect(path) {
    this.router.navigate([path, this.ruleSetId]);
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
  AddItem(bundle: Bundle) {
    this.IsAddingRecord = true;

    this.alertService.startLoadingMessage("", "Adding item to character");
    let char: any = this.localStorage.getDataObject<any>(DBkeys.HEADER_VALUE);
    if (char) {
      if (char.headerId) {
        this.characterItemModal.multiItemMasters = [];
        //this.characterItemModal.multiItemMasters.push({ itemMasterId: itemMaster.itemMasterId });
        
          this.characterItemModal.multiItemMasterBundles.push({ itemMasterBundleId: bundle.bundleId });
        
        this.characterItemModal.characterId = char.headerId;
        this.characterItemModal.itemMasterId = bundle.bundleId;
        this.itemsService.addItem(this.characterItemModal)
          .subscribe(
            data => {
              this.IsAddingRecord = false;
              this.alertService.stopLoadingMessage();
              let message = "This item has been added to your character.";
              this.alertService.showMessage(message, "", MessageSeverity.success);
              //this.sharedService.updateItemsList(true);
            },
            error => {
              this.IsAddingRecord = false;
              this.alertService.stopLoadingMessage();
              let Errors = Utilities.ErrorDetail("Unable to Add", error);
              if (Errors.sessionExpire) {
                this.authService.logout(true);
              }
              else
                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            },
          );
      }
    }

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

  editItemTemplate(bundle: Bundle) {
    //this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
    //  class: 'modal-primary modal-custom',
    //  ignoreBackdropClick: true,
    //  keyboard: false
    //});
    //this.bsModalRef.content.title = 'Edit Item Template';
    //this.bsModalRef.content.button = 'UPDATE';
    //this.bsModalRef.content.fromDetail = true;
    //this.bsModalRef.content.itemMasterVM = itemMaster;
    //this.bsModalRef.content.rulesetID = this.ruleSetId;
    //this.bsModalRef.content.event.subscribe(data => {
    //  this.bundleId = data.itemMasterId;
    //  this.initialize();
    //});
    this.bsModalRef = this.modalService.show(CreateBundleComponent, {
      class: 'modal-primary modal-custom',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = 'Edit Bundle';
    this.bsModalRef.content.button = 'UPDATE';
    this.bsModalRef.content.rulesetID = this.ruleSetId;
    this.bsModalRef.content.bundleVM = {
      bundleId: bundle.bundleId,
      ruleSetId: this.ruleSetId,
      bundleName: bundle.bundleName,
      bundleImage: bundle.bundleImage,
      bundleVisibleDesc: bundle.bundleVisibleDesc,
      value: bundle.value,
      volume: bundle.volume,
      totalWeight: bundle.totalWeight,
      metatags: bundle.metatags,
      rarity: bundle.rarity,
      //ruleSet : this.RuleSet,
      weightLabel: bundle.weightLabel,
      currencyLabel: bundle.currencyLabel,
      volumeLabel: bundle.volumeLabel
    };
    this.bsModalRef.content.fromDetail = true;
    this.bsModalRef.content.event.subscribe(data => {
      this.bundleId = data.bundleId;
      this.initialize();
    });
  }

  duplicateItemTemplate(bundle: Bundle) {
    // this.alertService.startLoadingMessage("", "Checking records");      
    this.itemMasterService.getItemMasterCount(this.ruleSetId)
      .subscribe(data => {
        //this.alertService.stopLoadingMessage();
        if (data < 2000) {
          //this.bsModalRef = this.modalService.show(CreateItemMsterComponent, {
          //  class: 'modal-primary modal-md',
          //  ignoreBackdropClick: true,
          //  keyboard: false
          //});
          //this.bsModalRef.content.title = 'Duplicate Item Template';
          //this.bsModalRef.content.button = 'DUPLICATE';
          //this.bsModalRef.content.fromDetail = true;
          //this.bsModalRef.content.itemMasterVM = itemMaster;
          //this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef = this.modalService.show(CreateBundleComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
          });
          this.bsModalRef.content.title = 'Edit Bundle';
          this.bsModalRef.content.button = 'DUPLICATE';
          this.bsModalRef.content.rulesetID = this.ruleSetId;
          this.bsModalRef.content.bundleVM = {
            bundleId: bundle.bundleId,
            ruleSetId: this.ruleSetId,
            bundleName: bundle.bundleName,
            bundleImage: bundle.bundleImage,
            bundleVisibleDesc: bundle.bundleVisibleDesc,
            value: bundle.value,
            volume: bundle.volume,
            totalWeight: bundle.totalWeight,
            metatags: bundle.metatags,
            rarity: bundle.rarity,
            //ruleSet: this.RuleSet,
            weightLabel: bundle.weightLabel,
            currencyLabel: bundle.currencyLabel,
            volumeLabel: bundle.volumeLabel
          };
        }
        else {
          //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
          this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
        }
      }, error => { }, () => { });

  }

  deleteItemTemplate(bundle: Bundle) {
    let message = "Are you sure you want to delete this " + bundle.bundleName
      + " item template? Note: Any item(s) previously deployed from this template will not be affected.";

    this.alertService.showDialog(message,
      DialogType.confirm, () => this.deleteItemTemplateHelper(bundle), null, 'Yes', 'No');
  }

  private deleteItemTemplateHelper(bundle: Bundle) {
    bundle.ruleSetId = this.ruleSetId;
    this.isLoading = true;

    this.alertService.startLoadingMessage("", "Deleting Bundle");

   
    this.itemMasterService.deleteBundle(bundle)
      .subscribe(
        data => {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
          }, 200);
          this.alertService.showMessage("Bundle has been deleted successfully.", "", MessageSeverity.success);
          //this.initialize();
          this.router.navigate(['/ruleset/item-master', this.ruleSetId]);
        },
        error => {
          setTimeout(() => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
          }, 200);
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
  refresh() {
    this.initialize();
  }
}
