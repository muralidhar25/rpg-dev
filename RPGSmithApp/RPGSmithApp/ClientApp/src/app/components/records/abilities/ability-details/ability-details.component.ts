import { Component, OnInit, OnDestroy, Input, HostListener } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { AlertService, MessageSeverity, DialogType } from './../../../../services/alert.service';
import { AuthService } from "./../../../../services/auth.service";
import { ConfigurationService } from './../../../../services/configuration.service';
import { Utilities } from './../../../../services/utilities';
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DBkeys } from '../../../../services/db-Keys';
import { LocalStoreManager } from '../../../../services/local-store-manager.service';
import { SharedService } from "../../../../services/shared.service";
import { CommonService } from "../../../../services/shared/common.service";
import { AddAbilitiesComponent } from './../../abilities/add-abilities/add-abilities.component';
import { CreateAbilitiesComponent } from './../../abilities/create-abilities/create-abilities.component';

import { User } from '../../../../models/user.model';
import { Ability } from '../../../../models/view-models/ability.model';
import { AbilityService } from "../../../../services/ability.service";
import { ImageViewerComponent } from "../../../image-interface/image-viewer/image-viewer.component";
import { RulesetService } from "../../../../services/ruleset.service";

@Component({
    selector: 'app-ability-details',
    templateUrl: './ability-details.component.html',
    styleUrls: ['./ability-details.component.scss']
})

export class AbilityDetailsComponent implements OnInit {

    isLoading = false;
    showActions: boolean = true;
    isDropdownOpen: boolean = false;
    actionText: string;
    abilityId: number;
    ruleSetId: number;
    bsModalRef: BsModalRef;
    AbilityDetail: any = new Ability();

    constructor(
        private router: Router, private route: ActivatedRoute, private alertService: AlertService, private authService: AuthService,
        private configurations: ConfigurationService, public modalService: BsModalService, private localStorage: LocalStoreManager,
        private sharedService: SharedService, private commonService: CommonService,
        private abilityService: AbilityService, private rulesetService: RulesetService
    ) {
        this.route.params.subscribe(params => { this.abilityId = params['id']; });
        this.sharedService.shouldUpdateAbilityList().subscribe(sharedServiceJson => {
            if (sharedServiceJson) this.initialize();
        });
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
            this.isLoading = true;
            this.abilityService.getAbilityById<any[]>(this.abilityId)
                .subscribe(data => {
                    
                    this.AbilityDetail = this.abilityService.abilityModelData(data, "UPDATE");;
                    this.ruleSetId = this.AbilityDetail.ruleSetId;
                    //this.AbilityDetail.forEach(function (val) { val.showIcon = false; });
                    this.rulesetService.GetCopiedRulesetID(this.AbilityDetail.ruleSetId, user.id).subscribe(data => {
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

    @HostListener('document:click', ['$event.target'])
    documentClick(target: any) {
        try {
            if (target.className.endsWith("is-show"))
                this.isDropdownOpen = !this.isDropdownOpen;
            else this.isDropdownOpen = false;
        } catch (err) { this.isDropdownOpen = false; }
    }


    showActionButtons(showActions) {
        this.showActions = !showActions;
        if (showActions) {
            this.actionText = 'ACTIONS';// 'Show Actions';
        } else {
            this.actionText = 'HIDE';//'Hide Actions';
        }
    }

    editAbility(ability: Ability) {
        this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'Edit Ability';
        this.bsModalRef.content.button = 'UPDATE';
        this.bsModalRef.content.fromDetail = true;
        this.bsModalRef.content.abilityVM = ability;
        this.bsModalRef.content.rulesetID = this.ruleSetId;
        this.bsModalRef.content.event.subscribe(data => {
            this.abilityId = data.abilityId;
            this.initialize();
        });
    }

    duplicateAbility(ability: Ability) {
        // this.alertService.startLoadingMessage("", "Checking records");      
        this.abilityService.getAbilitiesCount(this.ruleSetId)
            .subscribe(data => {
                //this.alertService.stopLoadingMessage();
                if (data < 2000) {
                    this.bsModalRef = this.modalService.show(CreateAbilitiesComponent, {
                        class: 'modal-primary modal-md',
                        ignoreBackdropClick: true,
                        keyboard: false
                    });
                    this.bsModalRef.content.title = 'Duplicate Ability';
                    this.bsModalRef.content.button = 'DUPLICATE';
                    this.bsModalRef.content.fromDetail = true;
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
        //            //this.initialize();
        //            //this.location.replaceState('/'); 
        //            this.router.navigate(['/ruleset/ability', this.ruleSetId]);
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
                    //this.initialize();
                    //this.location.replaceState('/'); 
                    this.router.navigate(['/ruleset/ability', this.ruleSetId]);
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
        setTimeout(() => { this.isLoading = false; 
            this.alertService.stopLoadingMessage();
        }, 200);
    }
    RedirectBack() {
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
}
