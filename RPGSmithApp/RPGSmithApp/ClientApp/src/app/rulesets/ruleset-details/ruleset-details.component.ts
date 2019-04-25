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
import { VIEW, MarketPlaceItemsType } from '../../core/models/enums';
import { AppService1 } from '../../app.service';
import { PlatformLocation } from '@angular/common';
import { ImageViewerComponent } from '../../shared/image-interface/image-viewer/image-viewer.component';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { CampaignService } from '../../core/services/campaign.service';
import { Utilities } from '../../core/common/utilities';
import { MessageSeverity, AlertService, DialogType } from '../../core/common/alert.service';
import { ImageSearchService } from '../../core/services/shared/image-search.service';
import { CharactersService } from '../../core/services/characters.service';

@Component({
  selector: 'app-ruleset-details',
  templateUrl: './ruleset-details.component.html',
  styleUrls: ['./ruleset-details.component.scss']
})
export class RulesetDetailsComponent implements OnInit {

  bsModalRef: BsModalRef;
  rulesetModel = new Ruleset();
  ruleSetId: number;
 
  isLoading = false;
  rulesetRecordCount: any = new RulesetRecordCount();
  ruleset: any = new Ruleset();
  public event: EventEmitter<any> = new EventEmitter();
  playersSlots: number = 0;
  characters: any = [];
  randomImageList: string[] = [];
  GmCharacterSlotsCount: number = 0;

  constructor(
    private formBuilder: FormBuilder, private router: Router, private localStorage: LocalStoreManager,
    private rulesetService: RulesetService, private sharedService: SharedService,
    private authService: AuthService, private modalService: BsModalService,
    public appService: AppService1, public campaignService: CampaignService,
    private location: PlatformLocation, private route: ActivatedRoute,
    private alertService: AlertService, private imageSearchService: ImageSearchService,
    private charactersService: CharactersService
  ) {
    this.route.params.subscribe(params => {
      this.ruleSetId = params['id'];

    });

  }

  ngOnInit() {
    this.initialize();
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
        
        this.charactersService.getCharactersByRuleSetId<any>(this.ruleSetId)
          .subscribe(data => {
            console.log('datta atsa', data);
            this.characters = data;
           
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

  dice(ruleset: Ruleset) {
    console.log('Dice');
  }

  Dicetray(ruleset: Ruleset) {
    console.log('Dicetray');
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
 
  goToCharacter(characterID: number) {
    this.router.navigate(['/character/dashboard', characterID]);
  }
  
  private setRulesetId(rulesetId: number) {
    this.localStorage.deleteData(DBkeys.RULESET_ID);
    this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
  }
  


}
