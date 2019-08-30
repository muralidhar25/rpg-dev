import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { STAT_TYPE, VIEW } from '../../../core/models/enums';
import { Ruleset } from '../../../core/models/view-models/ruleset.model';
import { Characters } from '../../../core/models/view-models/characters.model';
import { CharacterStatTile, currentMax, choice, valSubVal } from '../../../core/models/tiles/character-stat-tile.model';
import { CharactersCharacterStat } from '../../../core/models/view-models/characters-character-stats.model';
import { RulesetDashboardPage } from '../../../core/models/view-models/ruleset-dashboard-page.model';
import { Utilities } from '../../../core/common/utilities';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { SharedService } from '../../../core/services/shared.service';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CharactersCharacterStatService } from '../../../core/services/characters-character-stat.service';
import { DBkeys } from '../../../core/common/db-keys';
import { CharacterStats } from '../../../core/models/view-models/character-stats.model';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';
import { RulesetCharacterStatTileComponent } from '../character-stat.component';
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

export class RulesetEditCharacterStatComponent implements OnInit {

    STAT_TYPE = STAT_TYPE;
    rulesetId: number;
    Ruleset: Ruleset;
    Character: Characters;
    CharacterID: number;
    CharacterStatTile: any;
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
    valToggle: string;
    valCombo: string;
    valtitle: string;
    defValNumber: string;
    defValCurrentMax: currentMax;
    defValValueSubValue: valSubVal;
    defaultCharacterStats: any;
    tile: any;
  charactersCharacterStat: CharactersCharacterStat;
  CharacterStat: any;
    pageId: number;
    pageDefaultData = new RulesetDashboardPage();
  showRichEditor: boolean = false;
  isFromCampaignDetail: boolean = true;

    options(placeholder?: string, initOnClick?: boolean): Object {
        return Utilities.optionsFloala(200, placeholder, initOnClick);
    }

    constructor(
        private bsModalRef: BsModalRef, private alertService: AlertService, private sharedService: SharedService,
        private authService: AuthService, private modalService: BsModalService, private localStorage: LocalStoreManager,
      private CCService: CharactersCharacterStatService, private location: PlatformLocation) {
      location.onPopState(() => this.modalService.hide(1));
  }

  @HostListener('document:click', ['$event.target'])
  documentClick(target: any) {
    try {
      if (target.className && target.className == "Editor_Command a-hyperLink") {
        this.GotoCommand(target.attributes["data-editor"].value);
      }
    } catch (err) { }
  }

    ngOnInit() {
      debugger
        setTimeout(() => {
            if (this.rulesetId == undefined)
                this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

            this.tile = this.bsModalRef.content.tile;
          this.CharacterStatTile = this.bsModalRef.content.characterStatTile;
          this.isFromCampaignDetail = this.bsModalRef.content.isFromCampaignDetail;
            //this.Character = this.CharacterStatTile.charactersCharacterStat.character
            //this.CharacterID = this.CharacterStatTile.charactersCharacterStat.character.characterId
            //this.defaultCharacterStats = this.CharacterStatTile.charactersCharacterStat.character.charactersCharacterStats;

            //this.pageId = this.bsModalRef.content.pageId;
            //this.pageDefaultData = this.bsModalRef.content.pageDefaultData;

            this.Initialize();
        }, 0);
    }
  private Initialize(CharacterStatTypeID?: number) {
      debugger
        //this.charactersCharacterStat = this.CharacterStatTile.charactersCharacterStat;
        //this.selectedChoiceId = +this.charactersCharacterStat.choice;
    let characterStat: CharacterStats = this.CharacterStatTile.characterStat;
    this.CharacterStat = characterStat;
        this.title = characterStat.statName ? characterStat.statName : '';
        this.CharacterStatTypeID = characterStat.characterStatTypeId;
        this.CharacterStatTypeDesc = characterStat.statDesc;

    let defaultValue1 = '';
    let defaultValue2 = '';
    if (this.CharacterStat.characterStatDefaultValues) {
      if (this.CharacterStat.characterStatDefaultValues.length) {
        defaultValue1 = this.CharacterStat.characterStatDefaultValues[0].defaultValue ? this.CharacterStat.characterStatDefaultValues[0].defaultValue:'';
      }
      if (this.CharacterStat.characterStatDefaultValues.length>1) {
        defaultValue2 = this.CharacterStat.characterStatDefaultValues[1].defaultValue ? this.CharacterStat.characterStatDefaultValues[1].defaultValue : '';
      }
    }

        switch (this.CharacterStatTypeID) {
            case STAT_TYPE.Text:
            this.valText = defaultValue1//this.charactersCharacterStat.text;
                break;
            case STAT_TYPE.RichText:
            this.valRichText = defaultValue1// this.charactersCharacterStat.richText;
                break;
            case STAT_TYPE.Number:
            this.valNumber = defaultValue1//this.charactersCharacterStat.number.toString();
            this.defValNumber = defaultValue2//this.charactersCharacterStat.number.toString();
                break;
            case STAT_TYPE.CurrentMax:
            let rescurrentMax: currentMax = { current: defaultValue1.toString(), max: defaultValue2.toString() };
                this.valCurrentMax = Object.assign({}, rescurrentMax);
                this.defValCurrentMax = Object.assign({}, rescurrentMax);
                break;
            case STAT_TYPE.Choice:
                //if (characterStat.isMultiSelect) {
                //    let tempIds: number[] = [];
                //    this.charactersCharacterStat.multiChoice.split(';').map((item) => {
                //        tempIds.push(parseInt(item));
                //    })
                //    characterStat.characterStatChoices.map((item) => {
                //        this.valChoices.push({ key: item.characterStatChoiceId, value: item.statChoiceValue, selected: tempIds.indexOf(item.characterStatChoiceId) > -1, isMultiSelect: true })
                //    })
                //}
                //else {
                //    let tempId: number = +this.charactersCharacterStat.choice;
                //    characterStat.characterStatChoices.map((item) => {
                //        this.valChoices.push({ key: item.characterStatChoiceId, value: item.statChoiceValue, selected: tempId == item.characterStatChoiceId, isMultiSelect: false })
                //    })
                //}
                break;
            case STAT_TYPE.ValueSubValue:
            let resvalSubVal: valSubVal = { value: defaultValue1.toString(), subValue: defaultValue2.toString() };
                this.valValueSubValue = Object.assign({}, resvalSubVal);
                this.defValValueSubValue = Object.assign({}, resvalSubVal);
                break;
            //case STAT_TYPE.OnOff:
            //this.valOnOff = defaultValue1;
            //    break;
            //case STAT_TYPE.YesNo:
            //this.valYesNo = defaultValue1;
            //    break;
            case STAT_TYPE.Calculation:
            this.valCalculationResult = "";//this.charactersCharacterStat.calculationResult.toString();
            this.valCalculationFormula = this.CharacterStat.characterStatCalcs[0].statCalculation;
                break;
            case STAT_TYPE.Command:
            this.valCommand = defaultValue1;
                break;
            case STAT_TYPE.Toggle:
            this.valToggle = defaultValue1;
                break;
          case STAT_TYPE.Combo:
            let defaultValueNum = '';
            let defaultValueText = '';
            if (this.CharacterStat.characterStatCombos) {
              
              defaultValueNum = this.CharacterStat.characterStatCombos.defaultValue;
              
              
              defaultValueText = this.CharacterStat.characterStatCombos.defaultText ? this.CharacterStat.characterStatCombos.defaultText : '';
              
            }
            this.valNumber = defaultValueNum;
            this.defValNumber = defaultValueNum;
            this.valText = defaultValueText;
                break;
        }
        //this.textItems = [
        //    {  text: 'Common1', selected:true },
        //    { text: 'Uncommon1', selected: false },
        //    { text: 'Rare1', selected: false },
        //    { text: 'Unique1', selected: false }

        //];
    }

    //saveStat(characterStatTypeId: number) {
    //    let charactersCharacterStat: CharactersCharacterStat = this.CharacterStatTile.charactersCharacterStat;
    //    switch (characterStatTypeId) {
    //        case STAT_TYPE.Text:
    //            charactersCharacterStat.text = this.valText;
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //        case STAT_TYPE.RichText:
    //            charactersCharacterStat.richText = this.valRichText;
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //        case STAT_TYPE.Number:
    //            charactersCharacterStat.number = +this.valNumber;
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //        case STAT_TYPE.CurrentMax:
    //            charactersCharacterStat.current = +this.valCurrentMax.current;
    //            charactersCharacterStat.maximum = +this.valCurrentMax.max;
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //        case STAT_TYPE.Choice:
    //            if (this.charactersCharacterStat.characterStat.isMultiSelect) {
    //                let _multiChoice = '';
    //                this.valChoices.map((val, index) => {
    //                    if (val.selected && val.isMultiSelect) {
    //                        let _seperator = (_multiChoice === '') ? '' : ';';
    //                        _multiChoice += _seperator + val.key;
    //                    }
    //                });
    //                charactersCharacterStat.multiChoice = _multiChoice;
    //            } else {
    //                charactersCharacterStat.choice = this.selectedChoiceId.toString();
    //            }
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //        case STAT_TYPE.ValueSubValue:
    //            charactersCharacterStat.value = +this.valValueSubValue.value;
    //            charactersCharacterStat.subValue = +this.valValueSubValue.subValue;
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //        case STAT_TYPE.OnOff:
    //            charactersCharacterStat.onOff = this.valOnOff;
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //        case STAT_TYPE.YesNo:
    //            charactersCharacterStat.yesNo = this.valYesNo;
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //        case STAT_TYPE.Calculation:
    //            break;
    //        case STAT_TYPE.Command:
    //            break;
    //        case STAT_TYPE.Toggle:
    //            break;
    //        case STAT_TYPE.Combo:
    //            charactersCharacterStat.defaultValue = +this.valNumber;
    //            charactersCharacterStat.comboText = this.valText;
    //            this.updateStatService(charactersCharacterStat);
    //            break;
    //  }      
    //}

    //private updateStatService(charactersCharacterStat: CharactersCharacterStat) {
    //    this.CCService.updateCharactersCharacterStat(charactersCharacterStat).subscribe(
    //        data => {
    //            //this.CharacterStatTile.charactersCharacterStat
    //            //    = Object.assign(this.CharacterStatTile.charactersCharacterStat, charactersCharacterStat);
    //            this.alertService.stopLoadingMessage();
    //            this.alertService.showMessage("Character stat has been saved successfully.", "", MessageSeverity.success);
    //          this.sharedService.updateShareLayout(true);
    //            this.close(true);
    //        },
    //        error => {
    //            this.alertService.stopLoadingMessage();
    //            let _message = "Unable to Save";
    //            let Errors = Utilities.ErrorDetail(_message, error);
    //            if (Errors.sessionExpire) {
    //                //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
    //                this.authService.logout(true);
    //            }
    //            else
    //                this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
    //        },
    //    )
    //}

    //onChange(statTypeId:number, value: any, event?: any) {
    //    switch (statTypeId) {
    //        case STAT_TYPE.Text: this.valText = value; break;
    //        case STAT_TYPE.RichText:
    //            break;
    //        case STAT_TYPE.Number:
    //            break;
    //        case STAT_TYPE.CurrentMax:
    //            break;
    //        case STAT_TYPE.Choice:
    //            let choice = value;
    //            if (!choice.isMultiSelect) {
    //                this.valChoices.map((val) => {
    //                    val.selected = false;
    //                });
    //            } 
    //            choice.selected = event.target.checked;
    //            this.selectedChoiceId = event.target.checked ? choice.key : undefined;
    //            break;
    //        case STAT_TYPE.ValueSubValue:
    //            break;
    //        case STAT_TYPE.OnOff: this.valOnOff = value; break;
    //        case STAT_TYPE.YesNo: this.valYesNo = value; break;
    //        case STAT_TYPE.Calculation:
    //            break;
    //        case STAT_TYPE.Command:
    //            break;
    //        case STAT_TYPE.Toggle:
    //            break;
    //        case STAT_TYPE.Combo: this.valText = value; break;
    //    }
    //}

    editStat(characterStatTypeId: number) {
        this.close();
        this.bsModalRef = this.modalService.show(RulesetCharacterStatTileComponent, {
            class: 'modal-primary modal-md',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Edit Character Stat Tile";
        this.bsModalRef.content.tile = this.tile;
        this.bsModalRef.content.rulesetId = this.CharacterID;
        this.bsModalRef.content.pageId = this.pageId;
        this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
        this.bsModalRef.content.view = VIEW.EDIT;
        
    }

    //reset(CharacterStatTypeID: number, type?: number) {
        
    //    switch (this.CharacterStatTypeID) {
    //        case STAT_TYPE.Number:
    //            this.valNumber = this.defValNumber;
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.CurrentMax:
    //            if (type == 1) {
    //                this.valCurrentMax = Object.assign(this.valCurrentMax, { current: this.valCurrentMax.max });
    //            }
    //            else if (type == 2) {
    //                this.valCurrentMax = Object.assign(this.valCurrentMax, { max: this.defValCurrentMax.max });
    //            }
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.ValueSubValue:
    //            if (type == 1) {
    //                this.valValueSubValue = Object.assign(this.valValueSubValue, { value: this.defValValueSubValue.value });
    //            }
    //            else if (type == 2) {
    //                this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: this.defValValueSubValue.subValue });
    //            }
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.Combo:
    //            this.valNumber = this.defValNumber;
    //            break;
    //    }
    //}

    //updateCharacterStat(type?: number) {
    //    let CStat: CharactersCharacterStat = this.CharacterStatTile.charactersCharacterStat;
        
    //    switch (this.CharacterStatTypeID) {
    //        case STAT_TYPE.Number:
    //            CStat.number = +this.valNumber;
    //            break;
    //        case STAT_TYPE.CurrentMax:
    //            if (type == 1) {
    //                CStat = Object.assign(CStat, { current: this.valCurrentMax.current});
    //            }
    //            else if (type == 2) {
    //                CStat = Object.assign(CStat, { maximum: this.valCurrentMax.max });
    //            }
    //            break;
    //        case STAT_TYPE.ValueSubValue:
    //            if (type == 1) {
    //                CStat = Object.assign(CStat, { value: this.valValueSubValue.value});
    //            }
    //            else if (type == 2) {
    //                CStat = Object.assign(CStat, { subValue: this.valValueSubValue.subValue });
    //            }
    //            break;
    //        case STAT_TYPE.Combo:
    //            CStat.defaultValue = +this.valNumber;
    //            CStat.comboText = this.valText;
    //            break;
    //    }
    //    this.CCService.updateCharactersCharacterStat(CStat).subscribe(
    //        data => {
    //            this.CharacterStatTile.charactersCharacterStat = Object.assign(this.CharacterStatTile.charactersCharacterStat, CStat)
    //        },
    //        error => {
    //        },
    //    )
    //}

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
        if (+numberToAdd) {
            this.bsModalRef.hide();
            this.bsModalRef = this.modalService.show(DiceRollComponent, {
                class: 'modal-primary modal-md',
                ignoreBackdropClick: true,
                keyboard: false
            });
            this.bsModalRef.content.title = "Dice";
            this.bsModalRef.content.tile = -3;
            this.bsModalRef.content.rulesetId = this.rulesetId;
            this.bsModalRef.content.ruleset = this.Ruleset;
            this.bsModalRef.content.showDetailsByDefault = true;
          this.bsModalRef.content.numberToAdd = numberToAdd;
          this.bsModalRef.content.isFromCampaignDetail = this.isFromCampaignDetail;

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
        }
    }

    //increment(CharacterStatTypeID: number, type?: number) {
    //    switch (this.CharacterStatTypeID) {
    //        case STAT_TYPE.Number:
    //            this.valNumber = (parseInt(this.valNumber) + 1).toString();
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.CurrentMax:
    //            if (type == 1) {
    //                this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) + 1).toString() });
    //            }
    //            else if (type == 2) {
    //                this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) + 1).toString() });
    //            }
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.ValueSubValue:
    //            if (type == 1) {
    //                this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) + 1).toString() });
    //            }
    //            else if (type == 2) {
    //                this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) + 1).toString() });
    //            }
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.Combo:
    //            this.valNumber = (parseInt(this.valNumber) + 1).toString();
    //            break;
    //    }
    //}

    //decrement(CharacterStatTypeID: number, type?: number) {
    //    switch (this.CharacterStatTypeID) {
    //        case STAT_TYPE.Number:
    //            this.valNumber = (parseInt(this.valNumber) - 1).toString();
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.CurrentMax:
    //            if (type == 1) {
    //                this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) - 1).toString() });
    //            }
    //            else if (type == 2) {
    //                this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) - 1).toString() });
    //            }
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.ValueSubValue:
    //            if (type == 1) {
    //                this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) - 1).toString() });
    //            }
    //            else if (type == 2) {
    //                this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) - 1).toString() });
    //            }
    //            //this.updateCharacterStat(type);
    //            break;
    //        case STAT_TYPE.Combo:
    //            this.valNumber = (parseInt(this.valNumber) - 1).toString();
    //            break;
    //    }
    //}

    setClass(text: any) {
        text.selected = true;

    }

  GotoCommand(cmd) {
    // TODO get char ID
    this.bsModalRef = this.modalService.show(DiceRollComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Dice";
    this.bsModalRef.content.tile = -2;
    this.bsModalRef.content.characterId = 0;
    this.bsModalRef.content.character = new Characters();
    this.bsModalRef.content.command = cmd;
  }
    
}
