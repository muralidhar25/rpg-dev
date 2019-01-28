import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../../services/alert.service';
import { AuthService } from "./../../../services/auth.service";
import { ConfigurationService } from './../../../services/configuration.service';
import { Utilities } from './../../../services/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DBkeys } from '../../../services/db-Keys';
import { LocalStoreManager } from '../../../services/local-store-manager.service';
import { SharedService } from "../../../services/shared.service";
import { CommonService } from "../../../services/shared/common.service";

import { AddSpellsComponent } from './add-spells/add-spells.component';
import { CreateSpellsComponent } from './create-spells/create-spells.component';
import { User } from '../../../models/user.model';
import { Spell } from '../../../models/view-models/spell.model';
import { SpellsService } from "../../../services/spells.service";
import { CastComponent } from '../../../components/shared/cast/cast.component';
import { PageLastViewsService } from "../../../services/pagelast-view.service";
import { Ruleset } from '../../../models/view-models/ruleset.model';
import { RulesetService } from "../../../services/ruleset.service";

@Component({
    selector: 'app-spells',
    templateUrl: './spells.component.html',
    styleUrls: ['./spells.component.scss']
})

export class SpellsComponent implements OnInit {

    rulesetModel: any;
    isLoading = false;
    isListView: boolean = false;
    showActions: boolean = true;
    actionText: string;
    bsModalRef: BsModalRef;
    ruleSetId: number;
    spellsList: any;
    pageLastView: any;
    noRecordFound: boolean = false;
    scrollLoading: boolean = false;

    page: number = 1;
    pageSize: number = 28;
    offset = (this.page - 1) * this.pageSize;

    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService, private spellsService: SpellsService,
        private pageLastViewsService: PageLastViewsService, private rulesetService: RulesetService
    ) {
        this.sharedService.shouldUpdateSpellList().subscribe(sharedServiceJson => {
            if (sharedServiceJson) {
                this.page = 1;
                this.pageSize = 28;
                this.initialize();
            }
        });
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
            this.isLoading = true;
            this.spellsService.getspellsByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
                .subscribe(data => {
                    
                    this.spellsList = Utilities.responseData(data.Spells, this.pageSize);
                    this.rulesetModel = data.RuleSet;
                    this.spellsList.forEach(function (val) { val.showIcon = false; });
                    try {
                        this.noRecordFound = !data.Spells.length;
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

            this.pageLastViewsService.getByUserIdPageName<any>(user.id, 'RulesetSpells')
                .subscribe(data => {
                    if (data !== null) this.isListView = data.viewType == 'List' ? true : false;
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
        
        this.spellsService.getspellsByRuleset_spWithPagination<any>(this.ruleSetId, this.page, this.pageSize)
            .subscribe(data => {
                
                var _spells = data.Spells;
                for (var i = 0; i < _spells.length; i++) {
                    _spells[i].showIcon = false;
                    this.spellsList.push(_spells[i]);
                }
                this.scrollLoading = false;
            }, error => {
                this.scrollLoading = false;
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                    this.authService.logout(true);
                }
            }, () => { });

        //this.charactersCharacterStatService.getCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)
           
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
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);

        this.pageLastView = {
            pageName: 'RulesetSpells',
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

    manageIcon(id: number) {
        this.spellsList.forEach(function (val) {
            if (id === val.spellId) {
                val.showIcon = true;
            } else {
                val.showIcon = false;
            }
        });
    }

    addSpell() {
        this.bsModalRef = this.modalService.show(AddSpellsComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
    }

    createSpell() {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.spellsService.getspellsCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Create New Spell';
                    this.bsModalRef.content.button = 'CREATE';
                    this.bsModalRef.content.ruleSetId = this.ruleSetId;
                    this.bsModalRef.content.spellVM = { ruleSetId: this.ruleSetId };
      //  console.log('ruleSetId: ' + this.ruleSetId);
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });  
  
    }

    editSpell(spell: Spell) {
        this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Spell';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.spellVM = spell;
        this.bsModalRef.content.rulesetID = this.ruleSetId;

    }

    duplicateSpell(spell: Spell) {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.spellsService.getspellsCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateSpellsComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Duplicate Spell';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.spellVM = spell;
                    this.bsModalRef.content.rulesetID = this.ruleSetId;
                }
                else {
                    //this.alertService.showStickyMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                    this.alertService.showMessage("The maximum number of records has been reached, 2,000. Please delete some records and try again.", "", MessageSeverity.error);
                }
            }, error => { }, () => { });          
    }

    deleteSpell(spell: Spell) {
        let message = "Are you sure you want to delete this " + spell.name
            + " Spell? This will also remove the Spell from any character(s) / item(s) that may be associated with it.";

        this.alertService.showDialog(message,
            DialogType.confirm, () => this.deleteSpellHelper(spell), null, 'Yes', 'No');
    }

    private deleteSpellHelper(spell: Spell) {
        spell.ruleSetId = this.ruleSetId;
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Deleting a Spell");

        //this.spellsService.deleteSpell(spell.spellId)
        //    .subscribe(
        //        data => {
        //            this.isLoading = false; 
        //            this.alertService.stopLoadingMessage();
        //            this.alertService.showMessage("Spell has been deleted successfully.", "", MessageSeverity.success);                    
        //            this.spellsList = this.spellsList.filter((val) => val.spellId != spell.spellId);
        //            try {
        //                this.noRecordFound = !this.spellsList.length;
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
        this.spellsService.deleteSpell_up(spell)
            .subscribe(
                data => {
                    this.isLoading = false;
                    this.alertService.stopLoadingMessage();
                    this.alertService.showMessage("Spell has been deleted successfully.", "", MessageSeverity.success);
                    this.spellsList = this.spellsList.filter((val) => val.spellId != spell.spellId);
                    try {
                        this.noRecordFound = !this.spellsList.length;
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
    
    memorizeSpell(spell: Spell) {
        this.isLoading = true;
        let memorizeTxt = spell.memorized ? 'Unmemorize' : 'Memorize';
        this.spellsService.memorizedSpell(spell.spellId)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    spell.memorized = spell.memorized ? false : true;
                },
                error => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let Errors = Utilities.ErrorDetail("Unable to " + memorizeTxt, error);
                    if (Errors.sessionExpire) {
                        this.authService.logout(true);
                    }
                    else
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                });
    }

    castSpell(spell: any) {
        this.bsModalRef = this.modalService.show(CastComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });    
        this.bsModalRef.content.title = "Spell Cast"  
        
        // let msg = "The command value for " + spell.name
        //     + " Spell has not been provided. Edit this record to input one.";

        // if (spell.spellCommand == undefined || spell.spellCommand == null) {
        //     this.alertService.showDialog(msg, DialogType.alert, () => this.castSpellHelper(spell));
        // }
        // else if (spell.spellCommand.length == 0) {
        //     this.alertService.showDialog(msg, DialogType.alert, () => this.castSpellHelper(spell));
        // }
        // else {
        //     //TODO
        //     this.castSpellHelper(spell);
        // }
    }

    private castSpellHelper(spell: any) {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "TODO => Cast Spell");
        setTimeout(() => {
            this.isLoading = false;
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
}
