import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { CustomDice } from '../../core/models/view-models/custome-dice.model';
import { DICE_ICON, VIEW } from '../../core/models/enums';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { SharedService } from '../../core/services/shared.service';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { CustomDiceComponent } from '../custom-dice/custom-dice.component';
import { SelectCustomDiceIconComponent } from '../select-custom-dice-icon/select-custom-dice-icon.component';

@Component({
    selector: 'app-add-custom-dice',
    templateUrl: './add-custom-dice.component.html',
    styleUrls: ['./add-custom-dice.component.scss']
})
export class AddCustomDiceComponent implements OnInit {

    public event: EventEmitter<any> = new EventEmitter();

    customDice = new CustomDice();
    customDice1 = new CustomDice();
    customDices: any=[];
    OldcustomDices: any=[];
    ICON = DICE_ICON;
    view: string;
    ruleset: Ruleset;
    IsFirstLetterNumeric: boolean = false;
    customDiceIndex: number;

    constructor(private bsModalRef: BsModalRef, private modalService: BsModalService,
        private sharedService: SharedService, private alertService: AlertService) { }

    ngOnInit() {
        setTimeout(() => {
            
            this.customDices.map((d, index) => {
                if (d.name == this.customDice.name) {
                    this.customDiceIndex = index
                }
            })            
            this.customDice = Object.assign({}, this.bsModalRef.content.customDice);
            if (this.customDice.name == undefined) {
                this.customDice.isNumeric = true;
                this.addResult(this.customDice.results)
                this.addResult(this.customDice.results)
            }
            else {
                if (this.customDice.results.length < 2) {
                    this.customDice.results.map((x) => {
                        if (this.customDice.results.length < 2) {
                            this.addResult(this.customDice.results)
                        }
                    })
                }
            }
            //let res = Object.assign([], this.bsModalRef.content.customDiceOld)
            //this.tempCustomDiceResults = Object.assign([], res.results);

            this.customDice.name = this.customDice.name ? this.customDice.name.slice(1, this.customDice.name.length) : this.customDice.name;
            if (this.bsModalRef.content.customDice.results) {
                this.customDice.results = Object.assign([], this.bsModalRef.content.customDice.results.map((r) => {
                    return Object.assign({}, r);
                }));
            }
            

            this.customDices = Object.assign([], this.bsModalRef.content.customDices);
            this.OldcustomDices = Object.assign([], this.bsModalRef.content.customDices);
            //this.OldcustomDices = Object.assign([], this.OldcustomDices.map((old, index) => {
            //    old.results = Object.assign([], this.bsModalRef.content.customDices[index].results);
            //    return old;
            //}));
            this.ruleset = this.bsModalRef.content.ruleset;
            this.view = this.bsModalRef.content.view == VIEW.ADD || !this.bsModalRef.content.view ? 'Save' : 'Update';
            this.initialize();
        }, 0);
    }

    initialize() {
        this.customDice.icon = this.customDice.icon ? this.customDice.icon : this.ICON.DX;
        if (!this.customDice.results) {
            this.customDice.results = [];
            this.customDice.results.push({ customDiceResultId: 0, name: '' });
        }
    }

    addResult(results: any): void {
        let _results = Object.assign([], results);
        _results.push({ customDiceResultId: 0, name: '' });
        this.customDice.results = _results;
    }

    removeResult(result: any): void {
        this.customDice.results
            .splice(this.customDice.results.indexOf(result), 1);
    }
    setNumeric(_isNumeric: boolean) {
        this.customDice.isNumeric = _isNumeric;
        //let regex = /^-?[0-9]\d*(\\d+)?$/g; // negative positive number expression.
        //this.customDice.results.map((res) => {
        //    if (_isNumeric) {
        //        res.IsNumeric = regex.test(res.name);
        //    }
        //    else {
        //        res.IsNumeric = _isNumeric;
        //    }
        //})
    }
    submitForm() {
        
        let name = 'D' + this.customDice.name;
        let index = this.customDices.findIndex(x => x.name.toLowerCase() == name.toLowerCase());
        if (
            (this.customDiceIndex != this.customDices.findIndex(x => x.name.toLowerCase() == name.toLowerCase()))
            &&
            (this.customDices.filter(x => x.name.toLowerCase() == name.toLowerCase()).length > 0)
        ) {
            this.alertService.showMessage("Cannot duplicate Dice Name", "", MessageSeverity.error);
        }
        else if (this.customDice.results.length < 2) {
            this.alertService.showMessage("Dice must have two result", "", MessageSeverity.error);
        }
        else if (name.toUpperCase().startsWith('DF')) {
            this.customDice.name = '';
            this.alertService.showMessage("", "The Dice name 'DF' is already reserved for Fate/Fudge Dice, please select a different name to continue.", MessageSeverity.error);
            return false;
        }
        else {
            this.customDice.name = 'D' + this.customDice.name;
            if (this.view == 'Save')
                this.customDices.push(this.customDice);
            else {
                let dices = this.customDices.map((d, index) => {
                    //if (d.name == this.customDice.name) {
                    if (index == this.customDiceIndex) {
                        d = this.customDice;
                    }
                    return d;
                })
                this.customDices = Object.assign([], dices);
            }
            this.bsModalRef.hide();
            this.bsModalRef = this.modalService.show(CustomDiceComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.customDices = this.customDices;
            this.bsModalRef.content.ruleset = this.ruleset;
        }
        //this.event.emit(this.customDice);
        
    }

    openSelectDiceIcon(ruleset: Ruleset, customDice: CustomDice) {
        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(SelectCustomDiceIconComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        customDice.name = 'D' + customDice.name;
        this.bsModalRef.content.ruleset = ruleset;
        this.bsModalRef.content.customDice = customDice ? customDice : new CustomDice();
        this.bsModalRef.content.customDices = this.customDices;
        this.bsModalRef.content.view = "AddCustomDice"
        this.bsModalRef.content.viewType = this.view == 'Save' ? VIEW.ADD : VIEW.EDIT;
        this.bsModalRef.content.event.subscribe(data => {
            //this.customDices.push(data);
        });
    }


    close(ruleset: Ruleset) {
        
        this.OldcustomDices.map((rec) => {

        })
        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(CustomDiceComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.customDices = this.OldcustomDices;
        this.bsModalRef.content.ruleset = ruleset;
        //this.destroyModalOnInit();
    }

    checkName(e: any) {
        let regexp = /^[a-zA-Z]/;
        if (e.target.value) {
            if (!regexp.test(e.target.value.charAt(0))) {
                this.IsFirstLetterNumeric = true;
            }
            else {
                this.IsFirstLetterNumeric = false;
            }
        }
        else {
            this.IsFirstLetterNumeric = false;
        }
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }

    checkNameIsValid(e) {        
        let regexp = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;
        if (e.target.value) {
            if (regexp.test(e.target.value)) {
                this.alertService.showMessage("", "No Special Characters allowed in the Name, Only letters and numbers.", MessageSeverity.error);
            }            
        }
        if (e.target.value.toUpperCase().startsWith('F')) {
            this.customDice.name = '';
            this.alertService.showMessage("", "The Dice name 'DF' is already reserved for Fate/Fudge Dice, please select a different name to continue.", MessageSeverity.error);
            return false;
        }
    }
}
