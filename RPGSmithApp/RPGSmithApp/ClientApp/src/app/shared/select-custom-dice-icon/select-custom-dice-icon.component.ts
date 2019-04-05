import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { DICE_ICON } from '../../core/models/enums';
import { CustomDice } from '../../core/models/view-models/custome-dice.model';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { AddCustomDiceComponent } from '../add-custom-dice/add-custom-dice.component';
import { CustomDiceComponent } from '../custom-dice/custom-dice.component';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-select-custom-dice-icon',
  templateUrl: './select-custom-dice-icon.component.html',
  styleUrls: ['./select-custom-dice-icon.component.scss']
})
export class SelectCustomDiceIconComponent implements OnInit {
    public event: EventEmitter<any> = new EventEmitter();
    iconsList: any;
    selectedIcon: string = DICE_ICON.DX;
    customDice = new CustomDice();
    customDices: any;
    ruleset: Ruleset;
    view: string;
    viewType: string;
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService
    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1)); }

    ngOnInit() {
        this.getIconsList();
        setTimeout(() => {
            this.customDice = this.bsModalRef.content.customDice;
            this.customDices = this.bsModalRef.content.customDices;
            this.view = this.bsModalRef.content.view; //== VIEW.ADD || !this.bsModalRef.content.view ? 'Save' : 'Update';

            this.viewType = this.bsModalRef.content.viewType ? this.bsModalRef.content.viewType:'';
            this.ruleset = this.bsModalRef.content.ruleset;
        }, 0);
    }
    
    submitForm(icon: string) {
        this.customDice.icon = icon;
        this.close();
    }

    close() {
        this.bsModalRef.hide();
        
        if (this.view == "AddCustomDice") {
            this.bsModalRef = this.modalService.show(AddCustomDiceComponent, {
              class: 'modal-primary modal-md selectDiceModal',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.customDice = this.customDice;
            this.bsModalRef.content.customDices = this.customDices;
            this.bsModalRef.content.ruleset = this.ruleset;
            this.bsModalRef.content.view = this.viewType;
        } else {
            this.bsModalRef = this.modalService.show(CustomDiceComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.ruleset = this.ruleset;
            //this.bsModalRef.content.customDice = this.customDice;
            this.bsModalRef.content.customDices = this.customDices;
            //this.customDices.push(this.customDice);
        }
        //this.bsModalRef = this.modalService.show(AddCustomDiceComponent, {
        //    class: 'modal-primary modal-md',
        //    ignoreBackdropClick: true,
        //    keyboard: false
        //});
        //this.bsModalRef.content.customDice = this.customDice;
        //this.bsModalRef.content.customDices = this.customDices;
        //this.bsModalRef.content.ruleset = this.ruleset;
    }

    getIconsList() {
        this.iconsList = [];
        for (const _icon in DICE_ICON) {
            if (_icon != 'D100') {
                if (!Number(_icon)) {
                    this.iconsList.push(DICE_ICON[_icon]);
                }
            }
        }
    }

}
