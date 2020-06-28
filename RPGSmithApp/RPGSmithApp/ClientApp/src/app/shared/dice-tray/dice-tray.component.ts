import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Ruleset } from '../../core/models/view-models/ruleset.model';
import { CustomDice, DefaultDice, DiceTray } from '../../core/models/view-models/custome-dice.model';
import { DICE_ICON, DICE } from '../../core/models/enums';
import { AlertService, MessageSeverity } from '../../core/common/alert.service';
import { SharedService } from '../../core/services/shared.service';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'app-dice-tray',
    templateUrl: './dice-tray.component.html',
    styleUrls: ['./dice-tray.component.scss']
})
export class DiceTrayComponent implements OnInit {
    public event: EventEmitter<any> = new EventEmitter();
    ruleset = new Ruleset();
    customDice = new CustomDice();
    DTcustomDices: CustomDice[]=[];
    ICON = DICE_ICON;
    diceicons = DICE;
    defaultDices: DefaultDice[] = [];
    diceTray: DiceTray[] = [];
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService, private alertService: AlertService, private sharedService: SharedService
    , private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1)); }

    ngOnInit() {        
        setTimeout(() => {
            
            this.ruleset = this.bsModalRef.content.ruleset;
            this.defaultDices = Object.assign([], this.bsModalRef.content.defaultDices);
            this.defaultDices.push({ defaultDiceId: 0, name: '@@DX@@', icon: "icon-Gen-dx" });
            this.DTcustomDices = Object.assign([], this.bsModalRef.content.DTcustomDices);
            this.initialize();
        }, 0);
        ////this.getIconsList();
        //this.defaultDices = Object.assign([], this.bsModalRef.content.defaultDices);
        //this.defaultDices.push({ defaultDiceId: 0, name:'@@DX@@' })
        //this.bsModalRef.content.diceTray;
        //setTimeout(() => {
        //   this.initialize();
        //}, 0);
    }
    initialize() {
        
        //this.customDice.icon = this.customDice.icon ? this.customDice.icon : DICE_ICON.DX;
        if (this.diceTray.length == 0) {
            if (!this.customDice.dices) {
                if (this.defaultDices) {
                    this.customDice.dices = [];
                    this.defaultDices.map((val) => {
                        if (val.name.toUpperCase() !== '@@DX@@')
                            this.customDice.dices.push({ id: 0, name: val.name, iconClass: val.icon, isValidCommandName: true });
                    });
                    this.BindDiceTray(this.customDice.dices);
                }
            }
        }
        else {
            this.customDice.dices = []
            this.diceTray.map((dt) => {
                this.customDice.dices.push({ id: 0, name: dt.name, iconClass: dt.icon, isValidCommandName: dt.isValidCommandName });
            })
            this.BindDiceTray(this.customDice.dices);
        }
        
    }
    addDice(dices: any): void {
        let _dices = dices;
        _dices.push({ id: 0, name: '', iconClass: "" });
        this.customDice.dices = _dices;
        this.BindDiceTray(this.customDice.dices);
    }
    removeDice(dice: any): void {
        this.customDice.dices
            .splice(this.customDice.dices.indexOf(dice), 1);
        this.BindDiceTray(this.customDice.dices);
    }
    resetToDefault() {
        //if (!this.defaultDices)
        //    this.getIconsList();

        this.customDice.dices = [];
        this.defaultDices.map((val) => {
            if (val.name.toUpperCase() !== '@@DX@@')
                this.customDice.dices.push({ id: 0, name: val.name, iconClass: val.icon, isValidCommandName:true });
        });
        this.BindDiceTray(this.customDice.dices);
    }

    close(dicetray) {
        this.bsModalRef.hide();
    }

    //getIconsList() {
    //    this.iconsList = [];
    //    for (const _icon in DICE_ICON) {
    //        if (!Number(_icon)) {
    //            this.iconsList.push(_icon);
    //        }
    //    }
    //}
  UpdateDice(event: any, dice: any, indexNumber: number) {
      
        this.customDice.dices.map((d,index) => {
            if (index == indexNumber) {
                d.name = event.target.value;
            }
        })
    this.BindDiceTray(this.customDice.dices);
    
    }
    BindDiceTray(dices: any) {
        
        this.diceTray = [];
        this.customDice.dices = dices.map((d, index) => {            
            let diceTrayItem: DiceTray = {
                diceTrayId: 0,
                customDiceId: null,
                defaultDiceId: null,
                icon: null,
                isCustomDice: false,
                isDefaultDice: false,
                name: '',
                ruleSetId: this.ruleset.ruleSetId,
                isValidCommandName: false,
                sortOrder:index
            };

            let IsCustomDice = false;
            let IsDefaultDice = false;
            let IsFateDice = false;
            let defaultDiceId = null;
            let icon = null;
            let name = null;
          let customDiceId = null;

          let tempValue:string = d.name;
          if (tempValue.endsWith('!')) {
            tempValue = tempValue.substring(0, tempValue.length-1);
          }

          if (tempValue.charAt(0).toUpperCase() == 'D' && tempValue.substring(1, tempValue.length) && /^[0-9]*$/g.test(tempValue.substring(1, tempValue.length))) {  //Dice eg. D1,D2,D{Num}

                this.defaultDices.map((val) => {
                  if (val.name.toUpperCase() == tempValue.toUpperCase()) {
                        IsDefaultDice = true;
                        defaultDiceId = val.defaultDiceId;
                        icon = val.icon;
                    name = d.name;
                    }
                });
                if (IsDefaultDice) { //eg. D4,D6,D8,D10,D12,D20,D100
                    diceTrayItem = {
                        diceTrayId: 0,
                        customDiceId: null,
                        defaultDiceId: defaultDiceId,
                        icon: icon,
                        isCustomDice: false,
                        isDefaultDice: IsDefaultDice,
                        name: name,
                        ruleSetId: this.ruleset.ruleSetId,
                        isValidCommandName: true,
                        sortOrder: index
                    };
                    d.iconClass = diceTrayItem.icon;
                    d.isValidCommandName = true;
                }
                else { //D{Num} other then D4,D6,D8,D10,D12,D20,D100
                    diceTrayItem = {
                        diceTrayId: 0,
                        customDiceId: null,
                        defaultDiceId: null,
                        icon: "icon-Gen-dx",
                        isCustomDice: false,
                        isDefaultDice: false,
                        name: d.name,
                        ruleSetId: this.ruleset.ruleSetId,
                        isValidCommandName: true,
                        sortOrder: index
                    };
                    d.iconClass = diceTrayItem.icon;
                    d.isValidCommandName = true;
                }
            }
            //else if (d.name.toUpperCase().startsWith('DF')) {  //Dice eg. DFxyz, Fate dice
          else if (d.name.toUpperCase() == 'DF') {  //Dice eg. DFxyz, Fate dice  
                diceTrayItem = {
                    diceTrayId: 0,
                    customDiceId: null,
                    defaultDiceId: null,
                    icon: "icon-Dice-d6-bg",
                    isCustomDice: false,
                    isDefaultDice: false,
                    name: d.name,
                    ruleSetId: this.ruleset.ruleSetId,
                    isValidCommandName: true,
                    sortOrder: index
                };
                d.iconClass = diceTrayItem.icon;
                d.isValidCommandName = true;
            }
            else if (d.name.toUpperCase()=='DECK' || d.name.toUpperCase()=='DOC') {  //Dice eg. DFxyz, Fate dice                
              diceTrayItem = {
                diceTrayId: 0,
                customDiceId: null,
                defaultDiceId: null,
                icon: "icon-Dice-deck",
                isCustomDice: false,
                isDefaultDice: false,
                name: d.name,
                ruleSetId: this.ruleset.ruleSetId,
                isValidCommandName: true,
                sortOrder: index
              };
              d.iconClass = diceTrayItem.icon;
              d.isValidCommandName = true;
            }
            else {  //Dice eg. CustomDice

                this.DTcustomDices.map((cd) => {
                    if (cd.name.toUpperCase() === d.name.toUpperCase()) {
                        IsCustomDice = true;
                        customDiceId = cd.customDiceId;
                        icon = cd.icon;
                        name = cd.name;
                    }
                })
                if (IsCustomDice) { //is CustomDice
                    diceTrayItem = {
                        diceTrayId: 0,
                        customDiceId: customDiceId,
                        defaultDiceId: null,
                        icon: icon,
                        isCustomDice: IsCustomDice,
                        isDefaultDice: false,
                        name: name,
                        ruleSetId: this.ruleset.ruleSetId,
                        isValidCommandName: true,
                        sortOrder: index
                    };
                    d.iconClass = diceTrayItem.icon;
                    d.isValidCommandName = true;
                }
                else {
                    diceTrayItem = {
                        diceTrayId: 0,
                        customDiceId: null,
                        defaultDiceId: null,
                        icon: "icon-Gen-dx",
                        isCustomDice: false,
                        isDefaultDice: false,
                        name: d.name,
                        ruleSetId: this.ruleset.ruleSetId,
                        isValidCommandName: false,
                        sortOrder: index
                    };
                    d.iconClass = diceTrayItem.icon;
                    d.isValidCommandName = false;
                }

            }
            this.diceTray.push(diceTrayItem);
            return d;
        })
    }
    
    submitForm() {
        
        let AreAllDiceValid = this.diceTray.length>0;
        this.diceTray.map((d) => {
            if (d.isValidCommandName == false) {
                AreAllDiceValid = false;
            }
        })
        if (AreAllDiceValid) {
            this.submit();
        }
        else {
            if (this.diceTray.length == 0) {
                this.alertService.showMessage("Atleast one dice is necessary.", "", MessageSeverity.error);
            }
            else {
                this.alertService.showMessage("Please enter a valid custom dice.", "", MessageSeverity.error);
            }
            
        }
    }
    submit() {
        
      this.bsModalRef.hide();
      
        this.sharedService.updateCustomeDice({diceTray: this.diceTray, isDiceTray:true })
    }
}
