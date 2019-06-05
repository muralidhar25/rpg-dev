import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { ConfigurationService } from "../../core/common/configuration.service";
import { AbilityService } from "../../core/services/ability.service";
import { RulesetService } from "../../core/services/ruleset.service";
import { AuthService } from "../../core/auth/auth.service";
import { PageLastViewsService } from "../../core/services/pagelast-view.service";
import { CommonService } from "../../core/services/shared/common.service";
import { LocalStoreManager } from "../../core/common/local-store-manager.service";
import { SharedService } from "../../core/services/shared.service";
import { AlertService, DialogType, MessageSeverity } from "../../core/common/alert.service";
import { User } from "../../core/models/user.model";
import { DBkeys } from "../../core/common/db-keys";
import { Utilities } from "../../core/common/utilities";
import { CreateAbilitiesComponent } from "../../shared/create-abilities/create-abilities.component";
import { AddAbilitiesComponent } from "./add-abilities/add-abilities.component";
import { Ability } from "../../core/models/view-models/ability.model";
import { Ruleset } from "../../core/models/view-models/ruleset.model";
import { AppService1 } from "../../app.service";
import { DiceRollComponent } from "../../shared/dice/dice-roll/dice-roll.component";
import { Characters } from "../../core/models/view-models/characters.model";

@Component({
    selector: 'app-abilities',
    templateUrl: './abilities.component.html',
    styleUrls: ['./abilities.component.scss']
})

export class AbilitiesComponent implements OnInit {

    rulesetModel: any;
    isLoading = false;
  isListView: boolean = false;
  isDenseView: boolean = false; 
    showActions: boolean = true;
    actionText: string;
    bsModalRef: BsModalRef;
    ruleSetId: number;
    abilityId: number;
    abilitiesList: any;
    pageLastView: any;
    isDropdownOpen: boolean = false;
    noRecordFound: boolean = false;
    scrollLoading: boolean = false;
    page: number = 1;
    timeoutHandler: any;
    pageSize: number = 28;
    offset = (this.page - 1) * this.pageSize;
  backURL: string = '/rulesets';
  IsGm: boolean = false;
    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService, private pageLastViewsService: PageLastViewsService,
      private abilityService: AbilityService, private rulesetService: RulesetService, public appService: AppService1
    ) {
        //this.route.params.subscribe(params => { this.abilityId = params['id']; });
        this.sharedService.shouldUpdateAbilityList().subscribe(sharedServiceJson => {
            if (sharedServiceJson) {
                this.page = 1;
                this.pageSize = 28;
                this.initialize();
            }
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
        this.route.params.subscribe(params => { this.ruleSetId = params['id']; });
        this.setRulesetId(this.ruleSetId);
        this.destroyModalOnInit();
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
            this.backURL = '/ruleset/campaign-details/' + this.ruleSetId;
          }
            this.isLoading = true;
            this.abilityService.getAbilityByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
              .subscribe(data => {
               //check for ruleset
                if (data.RuleSet)
                this.abilitiesList = Utilities.responseData(data.Abilities, this.pageSize);
               
                  this.rulesetModel = data.RuleSet;
                  this.setHeaderValues(this.rulesetModel);
                    this.abilitiesList.forEach(function (val) { val.showIcon = false; });
                    try {
                        this.noRecordFound = !data.Abilities.length;
                    } catch (err) { }
                    this.isLoading = false;
                }, error => {
                    this.isLoading = false;
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                }, () => { });

            this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetAbilities')
                .subscribe(data => {
                    //if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
                  if (data !== null) {
                    if (data.viewType == 'List') {
                      this.isListView = true;
                      this.isDenseView = false;
                    }
                    else if (data.viewType == 'Dense') {
                      this.isDenseView = true;
                      this.isListView = false;
                    }
                    else {
                      this.isListView = false;
                      this.isDenseView = false;
                    }
                  }

                }, error => {
                    let Errors = Utilities.ErrorDetail("", error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                });
        }
        ///*To get ruleset*/
        //this.rulesetService.getRulesetById<Ruleset>(this.ruleSetId)
        //    .subscribe(data => {
        //        this.rulesetModel = data;               
        //    }, error => { }, () => { });
    }

    onScroll() {

        ++this.page;
        this.scrollLoading = true;
        //this.isLoading = true;
        this.abilityService.getAbilityByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
            .subscribe(data => {

                var _abilities = data.Abilities;
                for (var i = 0; i < _abilities.length; i++) {
                    _abilities[i].showIcon = false;
                    this.abilitiesList.push(_abilities[i]);
                }
                //this.isLoading = false;
                this.scrollLoading = false;
            }, error => {
                this.isLoading = false;
                this.scrollLoading = false;
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

    showListView(view: boolean) {
      this.isListView = view;
      this.isDenseView = false;
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

        this.pageLastView = {
            pageName: 'RulesetAbilities',
            viewType: this.isListView ? 'List' : 'Grid',
            UserId: user.id
        }

        this.pageLastViewsService.createPageLastViews<any>(this.pageLastView)
            .subscribe(data => {
                if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
            }, error => {
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                    this.authService.logout(true);
                }
            });
    }

  showDenseview(view: boolean) {
    this.isListView = false;
    this.isDenseView = view;
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

    this.pageLastView = {
      pageName: 'RulesetAbilities',
      viewType: 'Dense',
      UserId: user.id
    }

    this.pageLastViewsService.createPageLastViews<any>(this.pageLastView)
      .subscribe(data => {
        if (data !== null) this.isDenseView = data.viewType == 'Dense' ? true : false;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
  }
    manageIcon(id: number) {
        this.abilitiesList.forEach(function (val) {
            if (id === val.abilityId) {
                val.showIcon = true;
            } else {
                val.showIcon = false;
            }
        });
    }
        
    addAbility() {
        this.bsModalRef = this.modalService.show(AddAbilitiesComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
    }

    createAbility() {
       // this.alertService.startLoadingMessage("", "Checking records");      
        this.abilityService.getAbilitiesCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data<2000) {
                    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
                        class: 'modal-primary modal-custom',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Create New Ability';
                    this.bsModalRef.content.button = 'CREATE';
                    this.bsModalRef.content.ruleSetId = this.ruleSetId;
                    this.bsModalRef.content.abilityVM = { ruleSetId: this.ruleSetId };
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);                                        
                }
            }, error => { }, () => { });        
    }

    editAbility(ability: Ability) {
        this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
            class: 'modal-primary modal-custom',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Ability';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.abilityVM = ability;
        this.bsModalRef.content.rulesetID = this.ruleSetId;
    }

    duplicateAbility(ability: Ability) {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.abilityService.getAbilitiesCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
                        class: 'modal-primary modal-custom',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Duplicate Ability';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.abilityVM = ability;
                    this.bsModalRef.content.rulesetID = this.ruleSetId;
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });     
       
    }

    deleteAbility(ability: Ability) {
        let message = "Are you sure you want to delete this " + ability.name
            + " Ability? This will also remove the Ability from any character(s) / item(s) that may be associated with it.";

        this.alertService.showDialog(message,
            DialogType.confirm, () => this.deleteAbilityHelper(ability), null, 'Yes', 'No');
    }

    private deleteAbilityHelper(ability: Ability) {
        ability.ruleSetId = this.ruleSetId;
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting a Ability");

        //this.abilityService.deleteAbility(ability.abilityId)
        //    .subscribe(
        //        data => {
        //            this.isLoading = false; 
        //            this.alertService.stopLoadingMessage();
        //            this.alertService.showMessage("Ability has been deleted successfully.", "", MessageSeverity.success);
        //            this.abilitiesList = this.abilitiesList.filter((val) => val.abilityId != ability.abilityId);
        //            try {
        //                this.noRecordFound = !this.abilitiesList.length;
        //            } catch (err) { }
        //            //this.initialize();
        //        },
        //        error => {
        //            this.isLoading = false; 
        //            this.alertService.stopLoadingMessage();
        //            let Errors = Utilities.ErrorDetail("Unable to Delete", error);
        //            if (Errors.sessionExpire) {
        //                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
        //                this.authService.logout(true);
        //            }
        //            else
        //                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
        //        });
        this.abilityService.deleteAbility_up(ability)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Ability has been deleted successfully.", "", MessageSeverity.success);
                    this.abilitiesList = this.abilitiesList.filter((val) => val.abilityId != ability.abilityId);
                    try {
                        this.noRecordFound = !this.abilitiesList.length;
                    } catch (err) { }
                    //this.initialize();
                },
                error => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to Delete", error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    enableAbility(ability: Ability) {
        //this.isLoading = true;
        let enableTxt = ability.isEnabled ? 'Disable' : 'Enable';
        this.abilityService.enableAbility(ability.abilityId)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    ability.isEnabled = ability.isEnabled ? false : true;
                },
                error => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to " + enableTxt, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    useAbility(ability: any) {
        
        let msg = "The command value for " + ability.name
            + " Ability has not been provided. Edit this record to input one.";

        if (ability.abilityCommand == undefined || ability.abilityCommand == null) {
            this.alertService.showDialog(msg, DialogType.alert, () => this.useAbilityHelper(ability));
        }
        else if (ability.abilityCommand.length == 0) {
            this.alertService.showDialog(msg, DialogType.alert, () => this.useAbilityHelper(ability));
        }
        else {
            //TODO
            this.useAbilityHelper(ability);
        }
    }

    private useAbilityHelper(ability: any) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "TODO => Use Ability");
        //TODO- PENDING ACTION
        setTimeout(() => { this.isLoading = false; 
            this.alertService.stopLoadingMessage();
        }, 200);
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }

    private setRulesetId(rulesetId: number) {
        this.localStorage.deleteData(DBkeys.RULESET_ID);
        this.localStorage.saveSyncedSessionData(rulesetId, DBkeys.RULESET_ID);
    }

    public clickAndHold(item: any) {
        if (this.timeoutHandler) {
            clearInterval(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    public editRecord(record: any) {
        this.timeoutHandler = setInterval(() => {
            this.editAbility(record);
        }, 1000);
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

  openDiceRollModal() {
    
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });    
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.recordName = this.rulesetModel.ruleSetName;
    this.bsModalRef.content.recordImage = this.rulesetModel.imageUrl;
    this.bsModalRef.content.recordType = 'ruleset'
    this.bsModalRef.content.isFromCampaignDetail = true;
  }
}
