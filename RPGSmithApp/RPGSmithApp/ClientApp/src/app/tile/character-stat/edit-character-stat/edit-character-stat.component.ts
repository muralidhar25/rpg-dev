import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { STAT_TYPE, VIEW } from '../../../core/models/enums';
import { Characters } from '../../../core/models/view-models/characters.model';
import { CharacterStatTile, currentMax, choice, valSubVal } from '../../../core/models/tiles/character-stat-tile.model';
import { CharactersCharacterStat } from '../../../core/models/view-models/characters-character-stats.model';
import { CharacterDashboardPage } from '../../../core/models/view-models/character-dashboard-page.model';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CharactersCharacterStatService } from '../../../core/services/characters-character-stat.service';
import { DBkeys } from '../../../core/common/db-keys';
import { CharacterStats } from '../../../core/models/view-models/character-stats.model';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';
import { CharacterStatTileComponent } from '../character-stat.component';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'app-edit-character-stat',
    templateUrl: './edit-character-stat.component.html',
    styleUrls: ['./edit-character-stat.component.scss']
})
//class currentMax {
//    current: number;
//    max: number;
//}
//class valSubVal {
//    value: number;
//    subValue: number;
//}

export class EditCharacterStatComponent implements OnInit {

    STAT_TYPE = STAT_TYPE;
    rulesetId: number;
    Character: Characters;
    CharacterID: number;
    CharacterStatTile: CharacterStatTile;
    CharacterStatTypeID: number;
    CharacterStatTypeDesc: string;
    title: string;
    valText: string;
    valRichText: string;
    valNumber: string;
    valCurrentMax: currentMax = new currentMax();
    selectedChoiceId: number;
    valChoice: choice;
    valChoices: choice[] = [];
    valValueSubValue: valSubVal;
    valOnOff: boolean;
    valYesNo: boolean;
    valCalculationResult: string;
    valCalculationFormula: string;
    valCommand: string;
    valtitle: string;
    defValNumber: string;
    defValCurrentMax: currentMax;
    defValValueSubValue: valSubVal;
    defaultCharacterStats: any;
    tile: any;
    charactersCharacterStat: CharactersCharacterStat;
    pageId: number;
    pageDefaultData = new CharacterDashboardPage();
    showRichEditor: boolean = false;
    isMouseDown: boolean = false;
    interval: any;
  isNotValidNumber: boolean = false;
    
  options(placeholder?: string, initOnClick?: boolean): Object {
    //console.log(Utilities.optionsFloala(200, placeholder, initOnClick, true))
        return Utilities.optionsFloala(200, placeholder, initOnClick,true);
    }

    constructor(
        private bsModalRef: BsModalRef, private alertService: AlertService, private sharedService: SharedService,
        private authService: AuthService, private modalService: BsModalService, private localStorage: LocalStoreManager,
      private CCService: CharactersCharacterStatService, private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
    }

    ngOnInit() {

        setTimeout(() => {
            
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);
            
            this.tile = this.bsModalRef.content.tile;
            this.CharacterStatTile = this.bsModalRef.content.characterStatTile;     
            this.Character = this.bsModalRef.content.character; //this.CharacterStatTile.charactersCharacterStat.character
            this.CharacterID = this.bsModalRef.content.characterId;//this.CharacterStatTile.charactersCharacterStat.character.characterId
            //this.defaultCharacterStats = this.CharacterStatTile.charactersCharacterStat.character.charactersCharacterStats;

            this.pageId = this.bsModalRef.content.pageId;
          this.pageDefaultData = this.bsModalRef.content.pageDefaultData;
          this.showRichEditor = this.bsModalRef.content.showEditor ? this.bsModalRef.content.showEditor : false;

            this.Initialize();
        }, 0);
    }
    private Initialize(CharacterStatTypeID?: number) {
        this.charactersCharacterStat = this.CharacterStatTile.charactersCharacterStat;
        this.selectedChoiceId = +this.charactersCharacterStat.choice;
        let characterStat: CharacterStats = this.charactersCharacterStat.characterStat;
        this.title = characterStat.statName ? characterStat.statName : '';
        this.CharacterStatTypeID = characterStat.characterStatTypeId;
        this.CharacterStatTypeDesc = characterStat.statDesc;
        
        switch (this.CharacterStatTypeID) {
            case STAT_TYPE.Text:
                this.valText = this.charactersCharacterStat.text;
                break;
            case STAT_TYPE.RichText:
                this.valRichText = this.charactersCharacterStat.richText == null ? '' : this.charactersCharacterStat.richText;
                break;
            case STAT_TYPE.Number:
                this.valNumber = this.charactersCharacterStat.number == null ? "" : this.charactersCharacterStat.number.toString();
                this.defValNumber = this.charactersCharacterStat.number == null ? "" : this.charactersCharacterStat.number.toString();
                break;
            case STAT_TYPE.CurrentMax:
                let rescurrentMax: currentMax = { current: this.charactersCharacterStat.current.toString(), max: this.charactersCharacterStat.maximum.toString() };
                this.valCurrentMax = Object.assign({}, rescurrentMax);
                this.defValCurrentMax = Object.assign({}, rescurrentMax);
                break;
          case STAT_TYPE.Choice:
            this.valNumber = this.charactersCharacterStat.defaultValue == null ? "" : this.charactersCharacterStat.defaultValue.toString();
            this.defValNumber = this.charactersCharacterStat.defaultValue == null ? "" : this.charactersCharacterStat.defaultValue.toString();
                if (characterStat.isMultiSelect) {
                    let tempIds: number[] = [];
                    if (this.charactersCharacterStat.multiChoice) {
                        this.charactersCharacterStat.multiChoice.split(';').map((item) => {
                            tempIds.push(parseInt(item));
                        })
                        characterStat.characterStatChoices.map((item) => {
                            this.valChoices.push({ key: item.characterStatChoiceId, value: item.statChoiceValue, selected: tempIds.indexOf(item.characterStatChoiceId) > -1, isMultiSelect: true })
                        })
                    }
                    else {
                        characterStat.characterStatChoices.map((item) => {
                            this.valChoices.push({ key: item.characterStatChoiceId, value: item.statChoiceValue, selected: false, isMultiSelect: true })
                        })
                    }
                }
                else {
                    let tempId: number = +this.charactersCharacterStat.choice;
                    if (characterStat.characterStatChoices) {
                        characterStat.characterStatChoices.map((item) => {
                            this.valChoices.push({ key: item.characterStatChoiceId, value: item.statChoiceValue, selected: tempId == item.characterStatChoiceId, isMultiSelect: false })
                        })
                    }                   
                }
                break;
            case STAT_TYPE.ValueSubValue:
                let resvalSubVal: valSubVal = { value: this.charactersCharacterStat.value.toString(), subValue: this.charactersCharacterStat.subValue.toString() };
                this.valValueSubValue = Object.assign({}, resvalSubVal);
                this.defValValueSubValue = Object.assign({}, resvalSubVal);
                break;
            case STAT_TYPE.OnOff:
                this.valOnOff = this.charactersCharacterStat.onOff;
                break;
            case STAT_TYPE.YesNo:
                this.valYesNo = this.charactersCharacterStat.yesNo;
                break;
            case STAT_TYPE.Calculation:
                this.valCalculationResult = this.charactersCharacterStat.calculationResult.toString();
                this.valCalculationFormula = characterStat.characterStatCalcs.length? characterStat.characterStatCalcs[0].statCalculation:'';
                break;
            case STAT_TYPE.Command:
                this.valCommand = this.charactersCharacterStat.command;
                break;
            case STAT_TYPE.Combo:
                this.valNumber = this.charactersCharacterStat.defaultValue? this.charactersCharacterStat.defaultValue.toString():"0";
                this.defValNumber = this.charactersCharacterStat.defaultValue? this.charactersCharacterStat.defaultValue.toString():'0';
                this.valText = this.charactersCharacterStat.comboText? this.charactersCharacterStat.comboText.toString():'';
                break;
            case STAT_TYPE.Condition:
                this.valText = this.charactersCharacterStat.text;
                break;
        }
        //this.textItems = [
        //    {  text: 'Common1', selected:true },
        //    { text: 'Uncommon1', selected: false },
        //    { text: 'Rare1', selected: false },
        //    { text: 'Unique1', selected: false }

        //];
        let obj: any = this.CharacterStatTile.charactersCharacterStat.characterStat;
        let DefaultValuesList: any = obj.characterStatDefaultValues;
        if (DefaultValuesList) {
            if (DefaultValuesList.length) {
                DefaultValuesList.map((dfv) => {
                    if (!isNaN(+dfv.maximum)) {
                        dfv.maximum = +dfv.maximum;
                    } else {
                        dfv.maximum = 0;
                    }
                    if (!isNaN(+dfv.minimum)) {
                        dfv.minimum = +dfv.minimum;
                    } else {
                        dfv.minimum = 0;
                    }
                })
            }
        }
    }

    saveStat(characterStatTypeId: number) {
        let charactersCharacterStat: CharactersCharacterStat = this.CharacterStatTile.charactersCharacterStat;
        this.isNotValidNumber = false;
        let obj: any = this.CharacterStatTile.charactersCharacterStat.characterStat;
        let DefaultValuesList: any = obj.characterStatDefaultValues;

        switch (characterStatTypeId) {
            case STAT_TYPE.Text:
                charactersCharacterStat.text = this.valText;
                this.updateStatService(charactersCharacterStat);
                break;
            case STAT_TYPE.RichText:
                charactersCharacterStat.richText = this.valRichText == null ? '' : this.valRichText;
                this.updateStatService(charactersCharacterStat);
                break;
            case STAT_TYPE.Number:
                let nummax = 0;
                let nummin = 0;
                if (DefaultValuesList) {
                    if (DefaultValuesList.length) {
                        nummax = DefaultValuesList[0].maximum;
                        nummin = DefaultValuesList[0].minimum;
                    }
                }
                

                if (!(nummax == 0 && nummin == 0)) {
                    if (parseInt(this.valNumber) >= nummin && parseInt(this.valNumber) <= nummax) {
                        charactersCharacterStat.number = +this.valNumber;
                        this.updateStatService(charactersCharacterStat);
                    }
                    else {
                        this.alertService.showMessage("", "The value for this field must be between " + nummin + " and " + nummax + " value.", MessageSeverity.error);
                        return false;
                    }
                }
                else {
                    charactersCharacterStat.number = this.valNumber == null ? null : +this.valNumber;
                    this.updateStatService(charactersCharacterStat);
                }
                
                break;
            case STAT_TYPE.CurrentMax:
                let curmax = 0;
                let curmin = 0;
                if (DefaultValuesList) {
                    if (DefaultValuesList.length) {
                        curmax = DefaultValuesList[0].maximum;
                        curmin = DefaultValuesList[0].minimum;
                    }
                }

                let maxmax = 0;
                let maxmin = 0;
                if (DefaultValuesList) {
                    if (DefaultValuesList.length) {
                        maxmax = DefaultValuesList[1].maximum;
                        maxmin = DefaultValuesList[1].minimum;
                    }
                }
                let valid = true;
                

                if (!(curmax == 0 && curmin == 0)) {
                    if (parseInt(this.valCurrentMax.current) >= curmin && parseInt(this.valCurrentMax.current) <= curmax) {
                        //this.updateStatService(charactersCharacterStat);
                    }
                    else {
                        this.alertService.showMessage("", "The current value for this field must be between " + curmin + " and " + curmax + " value.", MessageSeverity.error);
                        valid =  false;
                    }
                }

                if (!(maxmax == 0 && maxmin == 0)) {
                    if (parseInt(this.valCurrentMax.max) >= maxmin && parseInt(this.valCurrentMax.max) <= maxmax) {
                        //this.updateStatService(charactersCharacterStat);
                    }
                    else {
                        this.alertService.showMessage("", "The max value for this field must be between " + maxmin + " and " + maxmax + " value.", MessageSeverity.error);
                        valid = false;
                    }
                }

                if (valid) {
                    charactersCharacterStat.current = +this.valCurrentMax.current;
                    charactersCharacterStat.maximum = +this.valCurrentMax.max;
                    this.updateStatService(charactersCharacterStat);
                }
                
                break;
          case STAT_TYPE.Choice:
            let save_flag = false;
            let choicemax = 0;
            let choicemin = 0;
            if (DefaultValuesList) {
              if (DefaultValuesList.length) {
                choicemax = DefaultValuesList[0].maximum;
                choicemin = DefaultValuesList[0].minimum;
              }
            }


            if (!(choicemax == 0 && choicemin == 0)) {
              if (parseInt(this.valNumber) >= choicemin && parseInt(this.valNumber) <= choicemax) {
                charactersCharacterStat.defaultValue = +this.valNumber;
                //this.updateStatService(charactersCharacterStat);
                save_flag = true;
              }
              else {
                this.alertService.showMessage("", "The value for this field must be between " + choicemin + " and " + choicemax + " value.", MessageSeverity.error);
                return false;
              }
            }
            else {
              charactersCharacterStat.defaultValue = this.valNumber == null ? null : +this.valNumber;
              save_flag = true;//this.updateStatService(charactersCharacterStat);
            }
                if (this.charactersCharacterStat.characterStat.isMultiSelect) {
                    let _multiChoice = '';
                    this.valChoices.map((val, index) => {
                        if (val.selected && val.isMultiSelect) {
                            let _seperator = (_multiChoice === '') ? '' : ';';
                            _multiChoice += _seperator + val.key;
                        }
                    });
                    charactersCharacterStat.multiChoice = _multiChoice;
                } else {
                  charactersCharacterStat.choice = this.selectedChoiceId ? this.selectedChoiceId.toString():'';
            }
            if (save_flag) {
              this.updateStatService(charactersCharacterStat);
            }
                
                break;
            case STAT_TYPE.ValueSubValue:
                let valmax = 0;
                let valmin = 0;
                if (DefaultValuesList) {
                    if (DefaultValuesList.length) {
                        valmax = DefaultValuesList[0].maximum;
                        valmin = DefaultValuesList[0].minimum;
                    }
                }
                let submax = 0;
                let submin = 0;
                if (DefaultValuesList) {
                    if (DefaultValuesList.length) {
                        submax = DefaultValuesList[1].maximum;
                        submin = DefaultValuesList[1].minimum;
                    }
                }
              
                
                let validval = true;
                if (!(valmax == 0 && valmin == 0)) {
                    if (parseInt(this.valValueSubValue.value) >= valmin && parseInt(this.valValueSubValue.value) <= valmax) {
                        //this.updateStatService(charactersCharacterStat);
                    }
                    else {
                        this.alertService.showMessage("", "The value for this field must be between " + valmin + " and " + valmax + " value.", MessageSeverity.error);
                        validval = false;
                    }
                }

                if (!(submax == 0 && submin == 0)) {
                    if (parseInt(this.valValueSubValue.subValue) >= submin && parseInt(this.valValueSubValue.subValue) <= submax) {
                        //this.updateStatService(charactersCharacterStat);
                    }
                    else {
                        this.alertService.showMessage("", "The sub value for this field must be between " + submin + " and " + submax + " value.", MessageSeverity.error);
                        validval = false;
                    }
                }

                if (validval) {
                    charactersCharacterStat.value = +this.valValueSubValue.value;
                    charactersCharacterStat.subValue = +this.valValueSubValue.subValue;
                    this.updateStatService(charactersCharacterStat);
                }
                
                break;
            case STAT_TYPE.OnOff:
                charactersCharacterStat.onOff = this.valOnOff;
                this.updateStatService(charactersCharacterStat);
                break;
            case STAT_TYPE.YesNo:
                charactersCharacterStat.yesNo = this.valYesNo;
                this.updateStatService(charactersCharacterStat);
                break;
            case STAT_TYPE.Calculation:
                break;
            case STAT_TYPE.Command:
                break;
            case STAT_TYPE.Combo:
                let max = this.CharacterStatTile.charactersCharacterStat.maximum;
                let min = this.CharacterStatTile.charactersCharacterStat.minimum;
                charactersCharacterStat.defaultValue = +this.valNumber;
                charactersCharacterStat.comboText = this.valText;
                if (!(max == 0 && min == 0)) {
                    if (parseInt(this.valNumber) >= min && parseInt(this.valNumber) <= max) {
                        this.updateStatService(charactersCharacterStat);
                    }
                    else {
                        this.alertService.showMessage("", "The value for this field must be between " + min + " and " + max +" value.", MessageSeverity.error);
                        return false;
                    }
                }
                else {
                    this.updateStatService(charactersCharacterStat);
                }
                break;
        }
    }

    private updateStatService(charactersCharacterStat: CharactersCharacterStat) {
        this.CCService.updateCharactersCharacterStat(charactersCharacterStat).subscribe(
            data => {
                //this.CharacterStatTile.charactersCharacterStat
                //    = Object.assign(this.CharacterStatTile.charactersCharacterStat, charactersCharacterStat);
                this.alertService.stopLoadingMessage();
              this.alertService.showMessage("Character stat has been saved successfully.", "", MessageSeverity.success);
              
                 let  result:any = {
                      status: true,
                      perventLoading: true
                 }
             
              this.sharedService.updateCharacterList(result);
                this.close(true);
            },
            error => {
                this.alertService.stopLoadingMessage();
                let _message = "Unable to Save";
                let Errors = Utilities.ErrorDetail(_message, error);
                if (Errors.sessionExpire) {
                    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                    this.authService.logout(true);
                }
                else
                    this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
            },
        )
    }

    onChange(statTypeId:number, value: any, event?: any) {
        switch (statTypeId) {
            case STAT_TYPE.Text: this.valText = value; break;
            case STAT_TYPE.RichText:
                break;
            case STAT_TYPE.Number:
                break;
            case STAT_TYPE.CurrentMax:
                break;
            case STAT_TYPE.Choice:
                let choice = value;
                if (!choice.isMultiSelect) {
                    this.valChoices.map((val) => {
                        val.selected = false;
                    });
                } 
                choice.selected = event.target.checked;
                this.selectedChoiceId = event.target.checked ? choice.key : undefined;
                break;
            case STAT_TYPE.ValueSubValue:
                break;
            case STAT_TYPE.OnOff: this.valOnOff = value; break;
            case STAT_TYPE.YesNo: this.valYesNo = value; break;
            case STAT_TYPE.Calculation: break;
            case STAT_TYPE.Command: break;
            case STAT_TYPE.Combo: this.valText = value; break;
        }
    }

    editStat(characterStatTypeId: number) {
        this.close();
        this.bsModalRef = this.modalService.show(CharacterStatTileComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Edit Character Stat Tile";
        this.bsModalRef.content.tile = this.tile;
        this.bsModalRef.content.characterId = this.CharacterID;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        
    }

    reset(CharacterStatTypeID: number, type?: number) {
        
        switch (this.CharacterStatTypeID) {
            case STAT_TYPE.Number:
                this.valNumber = this.defValNumber;
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.CurrentMax:
                if (type == 1) {
                    this.valCurrentMax = Object.assign(this.valCurrentMax, { current: this.valCurrentMax.max });
                }
                else if (type == 2) {
                    this.valCurrentMax = Object.assign(this.valCurrentMax, { max: this.defValCurrentMax.max });
                }
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.ValueSubValue:
                if (type == 1) {
                    this.valValueSubValue = Object.assign(this.valValueSubValue, { value: this.defValValueSubValue.value });
                }
                else if (type == 2) {
                    this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: this.defValValueSubValue.subValue });
                }
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.Combo:
                this.valNumber = this.defValNumber;
            break;
          case STAT_TYPE.Choice:
            this.valNumber = this.defValNumber;
            //this.updateCharacterStat(type);
            break;
        }
    }

    updateCharacterStat(type?: number) {
        let CStat: CharactersCharacterStat = this.CharacterStatTile.charactersCharacterStat;
        
        switch (this.CharacterStatTypeID) {
            case STAT_TYPE.Number:
                CStat.number = +this.valNumber;
                break;
            case STAT_TYPE.CurrentMax:
                if (type == 1) {
                    CStat = Object.assign(CStat, { current: this.valCurrentMax.current});
                }
                else if (type == 2) {
                    CStat = Object.assign(CStat, { maximum: this.valCurrentMax.max });
                }
                break;
            case STAT_TYPE.ValueSubValue:
                if (type == 1) {
                    CStat = Object.assign(CStat, { value: this.valValueSubValue.value});
                }
                else if (type == 2) {
                    CStat = Object.assign(CStat, { subValue: this.valValueSubValue.subValue });
                }
                break;
            case STAT_TYPE.Combo:
                CStat.defaultValue = +this.valNumber;
                CStat.comboText = this.valText;
                break;
        }
        this.CCService.updateCharactersCharacterStat(CStat).subscribe(
            data => {
                this.CharacterStatTile.charactersCharacterStat = Object.assign(this.CharacterStatTile.charactersCharacterStat, CStat)
            },
            error => {
            },
        )
    }

    close(all?: boolean) {
        this.bsModalRef.hide();
        if (all)
            this.destroyModalOnInit();
    }

    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');
            //$(".modal-backdrop").remove();
        } catch (err) { }
    }

    dice(numberToAdd: number, typeId?: number, type?: number) {
        
        //if (+numberToAdd) {
            this.bsModalRef.hide();
            this.bsModalRef = this.modalService.show(DiceRollComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.title = "Dice";
            this.bsModalRef.content.tile = -3;
            this.bsModalRef.content.characterId = this.Character.characterId;
            this.bsModalRef.content.character = this.Character;
            this.bsModalRef.content.showDetailsByDefault = true;
            this.bsModalRef.content.numberToAdd = numberToAdd;

            this.bsModalRef.content.event.subscribe(result => {
                if (typeId === STAT_TYPE.Number) {
                    //this.valNumber = +this.valNumber + result;
                }
                else if (typeId === STAT_TYPE.ValueSubValue) {
                    if (type === 1)
                        this.valValueSubValue.value = +this.valValueSubValue.value + result;
                    else if (type === 2)
                        this.valValueSubValue.subValue = +this.valValueSubValue.subValue + result;
                }
            });
        //}
    }

    increment(CharacterStatTypeID: number, type?: number) {
        
        let obj: any = this.CharacterStatTile.charactersCharacterStat.characterStat;
        let DefaultValuesList: any = obj.characterStatDefaultValues;
        switch (this.CharacterStatTypeID) {            
            case STAT_TYPE.Number:
                let nummax = 0;
                let nummin = 0;
                if (DefaultValuesList) {
                    if (DefaultValuesList.length) {
                        nummax = DefaultValuesList[0].maximum;
                        nummin = DefaultValuesList[0].minimum;
                    }
                }
                if (!(nummax == 0 && nummin == 0)) {
                    if (parseInt(this.valNumber) >= nummin && parseInt(this.valNumber) < nummax) {
                        this.valNumber = (parseInt(this.valNumber) + 1).toString();
                    }
                    else {
                        this.valNumber = (parseInt(this.valNumber)).toString();
                    }
                }
                else {
                    this.valNumber = (parseInt(this.valNumber) + 1).toString();
                }
                
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.CurrentMax:
                if (type == 1) {
                    let curmax = 0;
                    let curmin = 0;
                    if (DefaultValuesList) {
                        if (DefaultValuesList.length) {
                            curmax = DefaultValuesList[0].maximum;
                            curmin = DefaultValuesList[0].minimum;
                        }
                    }
                    if (!(curmax == 0 && curmin == 0)) {
                        if (parseInt(this.valCurrentMax.current) >= curmin && parseInt(this.valCurrentMax.current) < curmax) {
                            this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) + 1).toString() });
                        }
                        else {
                            this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current)).toString() });
                        }
                    }
                    else {
                        this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) + 1).toString() });
                    }
                    //this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) + 1).toString() });
                }
                else if (type == 2) {
                    let maxmax = 0;
                    let maxmin = 0;
                    if (DefaultValuesList) {
                        if (DefaultValuesList.length) {
                            maxmax = DefaultValuesList[1].maximum;
                            maxmin = DefaultValuesList[1].minimum;
                        }
                    }
                    if (!(maxmax == 0 && maxmin == 0)) {
                        if (parseInt(this.valCurrentMax.max) >= maxmin && parseInt(this.valCurrentMax.max) < maxmax) {
                            this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) + 1).toString() });
                        }
                        else {
                            this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max)).toString() });
                        }
                    }
                    else {
                        this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) + 1).toString() });
                    }
                   // this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) + 1).toString() });
                }
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.ValueSubValue:
                if (type == 1) {
                    let valmax = 0;
                    let valmin = 0;
                    if (DefaultValuesList) {
                        if (DefaultValuesList.length) {
                            valmax = DefaultValuesList[0].maximum;
                            valmin = DefaultValuesList[0].minimum;
                        }
                    }

                    if (!(valmax == 0 && valmin == 0)) {
                        if (parseInt(this.valValueSubValue.value) >= valmin && parseInt(this.valValueSubValue.value) < valmax) {
                            this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) + 1).toString() });
                        }
                        else {
                            this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) ).toString() });
                        }
                    }
                    else {
                        this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) + 1).toString() });
                    }
                    //this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) + 1).toString() });
                }
                else if (type == 2) {
                    let submax = 0;
                    let submin = 0;
                    if (DefaultValuesList) {
                        if (DefaultValuesList.length) {
                            submax = DefaultValuesList[1].maximum;
                            submin = DefaultValuesList[1].minimum;
                        }
                    }
                    if (!(submax == 0 && submin == 0)) {
                        if (parseInt(this.valValueSubValue.subValue) >= submin && parseInt(this.valValueSubValue.subValue) < submax) {
                            this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) + 1).toString() });
                        }
                        else {
                            this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue)).toString() });
                        }
                    }
                    else {
                        this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) + 1).toString() });
                    }
                    //this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) + 1).toString() });
                }
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.Combo:
                let max = this.CharacterStatTile.charactersCharacterStat.maximum;
                let min = this.CharacterStatTile.charactersCharacterStat.minimum;
                if (!(max == 0 && min == 0)) {
                    if (parseInt(this.valNumber) >= min && parseInt(this.valNumber) < max) {
                        this.valNumber = (parseInt(this.valNumber) + 1).toString();
                    }
                    else {
                        this.valNumber = (parseInt(this.valNumber)).toString();
                    }
                }
                else {
                    this.valNumber = (parseInt(this.valNumber) + 1).toString();
                }
            break;
          case STAT_TYPE.Choice:
            let choicemax = 0;
            let choicemin = 0;
            if (DefaultValuesList) {
              if (DefaultValuesList.length) {
                choicemax = DefaultValuesList[0].maximum;
                choicemin = DefaultValuesList[0].minimum;
              }
            }
            if (!(choicemax == 0 && choicemin == 0)) {
              if (parseInt(this.valNumber) >= choicemin && parseInt(this.valNumber) < choicemax) {
                this.valNumber = (parseInt(this.valNumber) + 1).toString();
              }
              else {
                this.valNumber = (parseInt(this.valNumber)).toString();
              }
            }
            else {
              this.valNumber = (parseInt(this.valNumber) + 1).toString();
            }

            //this.updateCharacterStat(type);
            break;
        }
    }

    decrement(CharacterStatTypeID: number, type?: number) {
        let obj: any = this.CharacterStatTile.charactersCharacterStat.characterStat;
        let DefaultValuesList: any = obj.characterStatDefaultValues;

        switch (this.CharacterStatTypeID) {
            case STAT_TYPE.Number:
                let nummax = 0;
                let nummin = 0;
                if (DefaultValuesList) {
                    if (DefaultValuesList.length) {
                        nummax = DefaultValuesList[0].maximum;
                        nummin = DefaultValuesList[0].minimum;
                    }
                }
                if (!(nummax == 0 && nummin == 0)) {
                    if (parseInt(this.valNumber) > nummin && parseInt(this.valNumber) <= nummax) {
                        this.valNumber = (parseInt(this.valNumber) - 1).toString();
                    }
                    else {
                        this.valNumber = (parseInt(this.valNumber)).toString();
                    }
                }
                else {
                    this.valNumber = (parseInt(this.valNumber) - 1).toString();
                }
                //this.valNumber = (parseInt(this.valNumber) - 1).toString();
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.CurrentMax:
                if (type == 1) {
                    let curmax = 0;
                    let curmin = 0;
                    if (DefaultValuesList) {
                        if (DefaultValuesList.length) {
                            curmax = DefaultValuesList[0].maximum;
                            curmin = DefaultValuesList[0].minimum;
                        }
                    }
                    if (!(curmax == 0 && curmin == 0)) {
                        if (parseInt(this.valCurrentMax.current) > curmin && parseInt(this.valCurrentMax.current) <= curmax) {
                            this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) - 1).toString() });
                        }
                        else {
                            this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current)).toString() });
                        }
                    }
                    else {
                        this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) - 1).toString() });
                    }
                    //this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) - 1).toString() });
                }
                else if (type == 2) {
                    let maxmax = 0;
                    let maxmin = 0;
                    if (DefaultValuesList) {
                        if (DefaultValuesList.length) {
                            maxmax = DefaultValuesList[1].maximum;
                            maxmin = DefaultValuesList[1].minimum;
                        }
                    }
                    if (!(maxmax == 0 && maxmin == 0)) {
                        if (parseInt(this.valCurrentMax.max) > maxmin && parseInt(this.valCurrentMax.max) <= maxmax) {
                            this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) - 1).toString() });
                        }
                        else {
                            this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max)).toString() });
                        }
                    }
                    else {
                        this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) - 1).toString() });
                    }
                   // this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) - 1).toString() });
                }
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.ValueSubValue:
                if (type == 1) {
                    let valmax = 0;
                    let valmin = 0;
                    if (DefaultValuesList) {
                        if (DefaultValuesList.length) {
                            valmax = DefaultValuesList[0].maximum;
                            valmin = DefaultValuesList[0].minimum;
                        }
                    }
                    if (!(valmax == 0 && valmin == 0)) {
                        if (parseInt(this.valValueSubValue.value) > valmin && parseInt(this.valValueSubValue.value) <= valmax) {
                            this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) - 1).toString() });
                        }
                        else {
                            this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value)).toString() });
                        }
                    }
                    else {
                        this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) - 1).toString() });
                    }
                   // this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) - 1).toString() });
                }
                else if (type == 2) {
                    let submax = 0;
                    let submin = 0;
                    if (DefaultValuesList) {
                        if (DefaultValuesList.length) {
                            submax = DefaultValuesList[1].maximum;
                            submin = DefaultValuesList[1].minimum;
                        }
                    }
                    if (!(submax == 0 && submin == 0)) {
                        if (parseInt(this.valValueSubValue.subValue) > submin && parseInt(this.valValueSubValue.subValue) <= submax) {
                            this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) - 1).toString() });
                        }
                        else {
                            this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue)).toString() });
                        }
                    }
                    else {
                        this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) - 1).toString() });
                    }
                    //this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) - 1).toString() });
                }
                //this.updateCharacterStat(type);
                break;
            case STAT_TYPE.Combo:
                let max = this.CharacterStatTile.charactersCharacterStat.maximum;
                let min = this.CharacterStatTile.charactersCharacterStat.minimum;
                if (!(max == 0 && min == 0)) {
                    if (parseInt(this.valNumber) > min && parseInt(this.valNumber) <= max) {
                        this.valNumber = (parseInt(this.valNumber) - 1).toString();
                    }
                    else {
                        this.valNumber = (parseInt(this.valNumber)).toString();
                    }
                }
                else {
                    this.valNumber = (parseInt(this.valNumber) - 1).toString();
                }
            break;
          case STAT_TYPE.Choice:
            let choicemax = 0;
            let choicemin = 0;
            if (DefaultValuesList) {
              if (DefaultValuesList.length) {
                choicemax = DefaultValuesList[0].maximum;
                choicemin = DefaultValuesList[0].minimum;
              }
            }
            if (!(choicemax == 0 && choicemin == 0)) {
              if (parseInt(this.valNumber) > choicemin && parseInt(this.valNumber) <= choicemax) {
                this.valNumber = (parseInt(this.valNumber) - 1).toString();
              }
              else {
                this.valNumber = (parseInt(this.valNumber)).toString();
              }
            }
            else {
              this.valNumber = (parseInt(this.valNumber) - 1).toString();
            }
            //this.valNumber = (parseInt(this.valNumber) - 1).toString();
            //this.updateCharacterStat(type);
            break;
        }
    }

    setClass(text: any) {
        text.selected = true;

    }
    mouseDown(eventtype, CharacterStatTypeID: number, type?: number) {
        let time = new Date();
        time.setMilliseconds(time.getMilliseconds() + 600); //600 miliseconds delay to start the numbering
        this.isMouseDown = true;
        this.interval = setInterval(() => {
            if (time < new Date()) {
                if (this.isMouseDown) {
                    if (eventtype === -1)//Decrement
                    {
                        this.decrement(CharacterStatTypeID, type);
                    }
                    if (eventtype === 1)//Increment
                    {
                        this.increment(CharacterStatTypeID, type);
                    }
                }
            }
        }, 50);
    }
    mouseUp() {
        this.isMouseDown = false;
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
