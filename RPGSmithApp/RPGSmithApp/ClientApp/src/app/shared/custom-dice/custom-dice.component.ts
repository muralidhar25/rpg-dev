import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { CustomDice, DiceTray } from '../../core/models/view-models/custome-dice.model';
import { VIEW } from '../../core/models/enums';
import { SharedService } from '../../core/services/shared.service';
import { RulesetService } from '../../core/services/ruleset.service';
import { AlertService } from '../../core/common/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { Utilities } from '../../core/common/utilities';
import { AddCustomDiceComponent } from '../add-custom-dice/add-custom-dice.component';
import { SelectCustomDiceIconComponent } from '../select-custom-dice-icon/select-custom-dice-icon.component';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'app-custom-dice',
    templateUrl: './custom-dice.component.html',
    styleUrls: ['./custom-dice.component.scss']
})
export class CustomDiceComponent implements OnInit {
    ruleset: Ruleset;
    customDices: CustomDice[] = [];
    VIEW = VIEW;
    isLoading: boolean = false;
    CdiceTray: DiceTray[] = [];
    constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
        private sharedService: SharedService, private rulesetService: RulesetService,
      private alertService: AlertService, private authService: AuthService
      , private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));  }

    ngOnInit() {

        setTimeout(() => {
            if (this.bsModalRef.content.CDdiceTray) {
                this.CdiceTray = Object.assign([], this.bsModalRef.content.CDdiceTray)
            }
            if (this.bsModalRef.content.customDices) {
                //this.customDices = this.bsModalRef.content.customDices;
                this.customDices = Object.assign([], this.bsModalRef.content.customDices);
            }
            else {
                this.customDices = [];
                this.initialize();
            }
        }, 0);
    }

    initialize(customDice?: any) {

        this.isLoading = true;
        this.rulesetService.getCustomDice(this.ruleset.ruleSetId)
            .subscribe(data => {
                this.isLoading = false;
                this.customDices = data;

            }, error => {
                this.isLoading = false;
                this.alertService.stopLoadingMessage();
                let Errors = Utilities.ErrorDetail("", error);
                if (Errors.sessionExpire) {
                    this.authService.logout(true);
                }
            }, () => { });
    }

    openAddCustomDice(ruleset: Ruleset, customDice?: CustomDice) {
        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(AddCustomDiceComponent, {
          class: 'modal-primary modal-md selectDiceModal',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.ruleset = ruleset;
        this.bsModalRef.content.customDice = customDice ? Object.assign({}, customDice) : new CustomDice();
        //this.bsModalRef.content.customDiceOld = customDice ? Object.assign({}, customDice) : new CustomDice();
        this.bsModalRef.content.customDices = Object.assign([], this.customDices);
        this.bsModalRef.content.view = customDice ? VIEW.EDIT : VIEW.ADD;
        this.bsModalRef.content.event.subscribe(data => {
            this.customDices.push(data);
        });

    }

    removeDice(dice: any): void {
        
        this.customDices.splice(this.customDices.indexOf(dice), 1);
        if (this.CdiceTray.length) {
            this.CdiceTray = this.CdiceTray.filter(x => x.name != dice.name);            
        }        
    }

    openSelectDiceIcon(ruleset?: Ruleset, customDice?: CustomDice) {
        this.bsModalRef.hide();
        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(SelectCustomDiceIconComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.ruleset = ruleset;
        this.bsModalRef.content.customDice = customDice ? customDice : new CustomDice();
        this.bsModalRef.content.customDices = this.customDices;
        this.bsModalRef.content.view = "CustomDice";
        this.bsModalRef.content.event.subscribe(data => {
            this.customDices.push(data);
        });
    }
    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
        } catch (err) { }
    }
    submitForm() {
        this.isLoading = true;
        //if (this.ruleset.view=='edit') {
        //    this.rulesetService.addEditCustomDice(this.customDices, this.ruleset.ruleSetId)
        //        .subscribe(data => {
        //            this.isLoading = false;
        //            this.alertService.stopLoadingMessage();
        //            let message = "Dice updated successfully."
        //            this.alertService.showMessage(message, "", MessageSeverity.success);
        //            this.bsModalRef.hide();
        //            this.sharedService.updateCustomeDice(this.customDices);
        //        }, error => {
        //            this.isLoading = false;
        //            this.alertService.stopLoadingMessage();
        //            let Errors = Utilities.ErrorDetail("", error);
        //            if (Errors.sessionExpire) {
        //                this.authService.logout(true);
        //            }
        //        }, () => { });
        //}
        //else {      
        this.isLoading = false;
        this.bsModalRef.hide();
        this.sharedService.updateCustomeDice(this.customDices);
        if (this.CdiceTray.length) {
            this.sharedService.updateCustomeDice({ diceTray: this.CdiceTray, isDiceTray: true })
        } 
        //}

    }
    close() {
        this.bsModalRef.hide();
        this.bsModalRef.content.ruleset = this.ruleset;
        //this.destroyModalOnInit();
    }
    public event: EventEmitter<any> = new EventEmitter();
}
