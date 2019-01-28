import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";

import { AlertService, MessageSeverity, DialogType } from '../../../services/alert.service';
import { AuthService } from "../../../services/auth.service";
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { Utilities } from '../../../services/utilities';
import { CharacterStatService } from "../../../services/character-stat.service";
import { ChoiceService } from "../../../services/choice.service";

import { CharacterStats, ICON, CharacterStatCombo, CharacterStatToggle, CustomToggle, CharacterStatDefaultValue, CharacterStatConditionViewModel, StatsList, ConditionOperatorsList, ConditionOperator } from '../../../models/view-models/character-stats.model';
import { VIEW, STAT_TYPE, STAT_NAME, TOGGLE_TYPE, DefaultValue_STAT_TYPE } from '../../../models/enums';
import { SharedService } from '../../../services/shared.service';
import { characterStatCombo } from '../../../models/tiles/character-stat-tile.model';
import { ImageSelectorComponent } from '../../image-interface/image-selector/image-selector.component';
import { DiceComponent } from '../../dice/dice/dice.component';

@Component({
    selector: 'app-character-stats-form',
    templateUrl: './character-stats-form.component.html',
    styleUrls: ['./character-stats-form.component.scss']
})
export class CharacterStatsFormComponent implements OnInit {

    characterStatsModel: any;
    characterStatsFormModal: any = new CharacterStats();
    characterStatComboViewModel = new CharacterStatCombo();
    characterStatToggleViewModel = new CharacterStatToggle();
    customToggleViewModel = new CustomToggle();
    characterStatModalType: string;
    title: string;
    isLoading = false;
    type: string = "Text";
    _ruleSetId: number;
    typeSelected: string;
    typeOptions: any;
    selectedOption: string = '';
    characterStatTypeList: any[] = [];
    _isFromCharacter: any;
    button: string;
    selectedID: string = '';
    selectedOptionWithIdsList: any[] = [];
    STAT = STAT_TYPE;
    showMoreLessColorToggle: boolean = true;
    toggleCustom: any = [];
    //MatchcaseForSelectedOption: string = '';
    showAdvancedFeaturesText: string = 'Advanced';
    showAdvancedFeaturesToggle: boolean = false;
    defaultCommandDice: string = '';
    characterStatsForConditions: StatsList[];
    ConditionOperators: ConditionOperatorsList[];
    options(placeholder?: string, initOnClick?: boolean): Object {
        return Utilities.optionsFloala(160, placeholder, initOnClick);
    }
    constructor(
        private router: Router, private bsModalRef: BsModalRef,
        private alertService: AlertService, private authService: AuthService,
        private charactersService: CharacterStatService, private choiceService: ChoiceService,
        private modalService: BsModalService, private sharedService: SharedService
    ) {
        this.sharedService.getCommandData().subscribe(diceCommand => {
            
            if (this.characterStatsFormModal.characterStatDefaultValueViewModel) {
                if (this.characterStatsFormModal.characterStatDefaultValueViewModel.length) {
                    if (this.characterStatsFormModal.characterStatDefaultValueViewModel[0].type == DefaultValue_STAT_TYPE.Command) {
                        this.characterStatsFormModal.characterStatDefaultValueViewModel[0].defaultValue = diceCommand.command
                    }
                }
            }
        });
    }

    ngOnInit() {
        setTimeout(() => {
            
            this.defaultCommandDice = '';
            this.characterStatTypeList = this.bsModalRef.content.characterStatTypeList;
            this.typeOptions = this.bsModalRef.content.typeOptions;
            let _view = this.button = this.bsModalRef.content.button;
            let _characterStatsVM = this.bsModalRef.content.characterStatTypeViewModel;
            this._isFromCharacter = this.bsModalRef.content.isFromCharacter;
            if (this.bsModalRef.content.button == 'UPDATE' || 'DUPLICATE') {
                this._ruleSetId = this.bsModalRef.content.ruleSetId ? this.bsModalRef.content.ruleSetId : this.bsModalRef.content.characterStatTypeViewModel.ruleSetId;
            }
            else {
                this._ruleSetId = this.bsModalRef.content.characterStatTypeViewModel.ruleSetId;
            }

            this.characterStatsFormModal = this.charactersService.getCharacterStatsFormModal(_characterStatsVM, _view);
            this.characterStatsFormModal.ruleSetId = this._ruleSetId;

            this.ConditionOperators = this.bsModalRef.content.ConditionOperators
            let characterStatsForConditions: StatsList[] = this.bsModalRef.content.characterStats;
            characterStatsForConditions = characterStatsForConditions.filter(x => x.typeId == STAT_TYPE.Text || x.typeId == STAT_TYPE.Number || x.typeId == STAT_TYPE.CurrentMax || x.typeId == STAT_TYPE.Choice || x.typeId == STAT_TYPE.ValueSubValue || x.typeId == STAT_TYPE.Combo || x.typeId == STAT_TYPE.Calculation)
            this.characterStatsForConditions = this.GetStatList(characterStatsForConditions);
            //if (this.characterStatsFormModal.characterStatConditionViewModel) {
            //    this.characterStatsFormModal.characterStatConditionViewModel.map((c: CharacterStatConditionViewModel) => {
            //        if (c.ifClauseStatId) {

            //        }
            //        c.statsList=
            //    })
            //}
            
            //this.characterStatsForConditions.push({ characterStatId: -1, statName:'InventoryWeight', typeId: -1 })
            
            
            
            if (_view === 'DUPLICATE' || _view === 'UPDATE')
                this.title = _view === 'DUPLICATE' ? 'Duplicate Character Stat' : 'Update Character Stat';
            else
                this.title = 'Add Character Stat';

            this.typeOptions.map((item) => {

                let MatchcaseForSelectedOption = '';
                let MatchcaseForID = '';
                MatchcaseForSelectedOption = 'SqrStrt_' + item.name.replace('[', 'SqrStrt_').replace(']', '_SqrEnd') + '_SqrEnd';

                if (item.name.toLowerCase().indexOf('[current]') !== -1) {
                    MatchcaseForID = '[' + item.characterStatId + '_1]';
                }
                else if (item.name.toLowerCase().indexOf('[value]') !== -1) {
                    MatchcaseForID = '[' + item.characterStatId + '_3]';
                }
                else if (item.name.toLowerCase().indexOf('[max]') !== -1) {
                    MatchcaseForID = '[' + item.characterStatId + '_2]';
                }
                else if (item.name.toLowerCase().indexOf('[sub-value]') !== -1) {
                    MatchcaseForID = '[' + item.characterStatId + '_4]';
                }
                else {
                    MatchcaseForID = '[' + item.characterStatId + ']';
                }

                this.selectedOptionWithIdsList.push(
                    { key: (this.selectedOptionWithIdsList.length + 1), id: item.characterStatId, option: item.name, match: MatchcaseForSelectedOption, matchID: MatchcaseForID }
                )
            })
            
            let characterStatDefaultValue: CharacterStatDefaultValue[] = [];
            characterStatDefaultValue.push(new CharacterStatDefaultValue());
            characterStatDefaultValue.push(new CharacterStatDefaultValue());
            if (_view === 'DUPLICATE' || _view === 'UPDATE') {
                
                if (this.characterStatsFormModal.characterStatDefaultValueViewModel.length) {
                    this.LoadDefaultValues(this.characterStatsFormModal.characterStatDefaultValueViewModel, this.characterStatsFormModal, this.characterStatsFormModal.characterStatDefaultValueViewModel[0].type);
                }
                else {
                    this.LoadDefaultValues(characterStatDefaultValue, this.characterStatsFormModal, this.characterStatsFormModal.characterStatTypeId);
                }                
            }
            else {                
                this.LoadDefaultValues(characterStatDefaultValue, this.characterStatsFormModal, STAT_TYPE.Text);
            }
        }, 0);
    }

    typeSelection(characterStatsFormModal: CharacterStats, _type: any) {
        if (_type.statTypeName == 'Choice' && characterStatsFormModal.characterStatChoicesViewModels.length == 0) {
            characterStatsFormModal.characterStatChoicesViewModels
                .push({ characterStatChoiceId: 0, statChoiceValue: '' });
        }

        characterStatsFormModal.characterStatTypeId = _type.characterStatTypeId;
        characterStatsFormModal.characterStatTypeName = _type.statTypeName;
        characterStatsFormModal.characterStatTypeViewModel.statTypeName = _type.statTypeName;
        this.typeSelected = _type.statTypeName;

        let characterStatDefaultValue: CharacterStatDefaultValue[] = [];
        characterStatDefaultValue.push(new CharacterStatDefaultValue());
        characterStatDefaultValue.push(new CharacterStatDefaultValue());
        this.LoadDefaultValues(characterStatDefaultValue, characterStatsFormModal, _type.characterStatTypeId);
        
     }

     onSelect(event) {
         if (event.currentTarget.value == 'Select character stat')
             this.selectedOption = '';
         else {            
             this.selectedOption = '[' + event.currentTarget.options[event.currentTarget.options.selectedIndex].label + ']';            
         }
     }

    onInsert(type: string) {
        if (type == STAT_NAME.Calculation) {
            this.characterStatsFormModal.characterStatCalculation = this.characterStatsFormModal.characterStatCalculation == undefined
                ? this.selectedOption : this.characterStatsFormModal.characterStatCalculation + this.selectedOption;
            }
        else if (type == STAT_NAME.Command)
            this.characterStatsFormModal.characterStatCommand = this.characterStatsFormModal.characterStatCommand == undefined
                ? this.selectedOption : this.characterStatsFormModal.characterStatCommand + this.selectedOption;
    }
    update_characterStatCalculation(value: string) {
        this.characterStatsFormModal.characterStatCalculation = value;
    }
    addChoice(choices: any): void {
        let _choices = choices;
        _choices.push({ characterStatChoiceId: 0, statChoiceValue: '' });
        this.characterStatsFormModal.characterStatChoicesViewModels = _choices;
    }

    removeChoice(choice: any): void {
        this.characterStatsFormModal.characterStatChoicesViewModels
            .splice(this.characterStatsFormModal.characterStatChoicesViewModels.indexOf(choice), 1);
    }
   
    checkMultipleChoice(event){
        this.characterStatsFormModal.isMultiSelect = event.target.checked;
    }

    selectedToggle(toggleViewModel: CharacterStatToggle, type) {
        toggleViewModel.display = type === TOGGLE_TYPE.DISPLAY ? true : false;
        toggleViewModel.yesNo = type === TOGGLE_TYPE.YESNO ? true : false;
        toggleViewModel.onOff = type === TOGGLE_TYPE.ONOFF ? true : false;
        toggleViewModel.isCustom = type === TOGGLE_TYPE.CUSTOM ? true : false;
        if (type === TOGGLE_TYPE.DISPLAY)
            toggleViewModel.showCheckbox = true;
        else if (type === TOGGLE_TYPE.CUSTOM) {
            toggleViewModel.customToggles = [];
            toggleViewModel.customToggles.push(
                { customToggleId: 0, image: '', toggleText: '' },
                { customToggleId: 0, image: '', toggleText: '' });
        }
    }

    setShowCheckbox(checked: boolean) {
        this.characterStatsFormModal.characterStatToggleViewModel.showCheckbox = checked;
    }

    addToggle(toggles: CustomToggle[]): void {
        toggles.push(
            { customToggleId: 0, image: '', toggleText: '' });
    }

    removeToggle(toggle: CustomToggle): void {
        this.characterStatsFormModal.characterStatToggleViewModel.customToggles
            .splice(this.characterStatsFormModal.characterStatToggleViewModel.customToggles.indexOf(toggle), 1);
    }

    addToggleImage(toggle: CustomToggle) {
        this.bsModalRef = this.modalService.show(ImageSelectorComponent, {
            class: 'modal-primary modal-sm selectPopUpModal',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = 'item';
        this.bsModalRef.content.image = toggle.image;
        this.bsModalRef.content.toggle = true;
        this.bsModalRef.content.view = toggle.image ? VIEW.EDIT : VIEW.ADD;
        this.bsModalRef.content.event.subscribe(data => {
            toggle.image = data.base64;
           // this.fileToUpload = data.file;
            toggle.toggleText = '';
        });
    }


    validateCombo(characterStatCombo: CharacterStatCombo) : boolean {
        if ((characterStatCombo.minimum === undefined && characterStatCombo.maximum !== undefined)
            || (characterStatCombo.minimum === null && characterStatCombo.maximum !== null)) {
            this.alertService.showMessage("", "The minimum value can not be empty if maximum value is provided.", MessageSeverity.error);
            return false;
        }
        else if ((characterStatCombo.minimum !== undefined && characterStatCombo.maximum === undefined)
            || (characterStatCombo.minimum !== null && characterStatCombo.maximum === null)) {
            this.alertService.showMessage("", "The maximum value can not be empty if minimum value is provided.", MessageSeverity.error);
            return false;
        }
        else if ((characterStatCombo.minimum && characterStatCombo.maximum) || (characterStatCombo.minimum === 0 || characterStatCombo.maximum === 0)) {
            if (+characterStatCombo.minimum > +characterStatCombo.maximum) {
                this.alertService.showMessage("", "The minimum value could not be greater than the maximum value.", MessageSeverity.error);
                return false;
            }
            else if (characterStatCombo.defaultValue !== undefined) {
                if (+characterStatCombo.minimum > +characterStatCombo.defaultValue
                    || +characterStatCombo.maximum < +characterStatCombo.defaultValue
                ) {
                    this.alertService.showMessage("", "The Default Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
                    return false;
                }
            }
            if (characterStatCombo.defaultValue !== undefined) {
                if (+characterStatCombo.minimum > +characterStatCombo.defaultValue
                    || +characterStatCombo.maximum < +characterStatCombo.defaultValue
                ) {
                     this.alertService.showMessage("", "The Current Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
                    return false;
                }
            }
        }
        return true;
    }

    submitForm(characterStat: CharacterStats) {
        
        //InventoryWeight name check
        if (characterStat.statName == STAT_NAME.InventoryWeight) {
            this.alertService.showMessage("Invalid Character Stat Name", "InventoryWeight is an existing built-in variable. Please select a different name.", MessageSeverity.error);
        }
        else if (characterStat.statName.toLowerCase().trim() == "name" || characterStat.statName.toLowerCase().trim() == "description" || characterStat.statName.toLowerCase().replace(/ +/g, "") == "ruleset" || characterStat.statName.toLowerCase().trim() == "image")
        {
            this.alertService.showMessage("Invalid Character Stat Name", "The Name <Name> is reserved and not available to be created as a Character Stat, please select a different name.", MessageSeverity.error);
        }
        else {
            let validForm = true;
            if (characterStat.characterStatTypeName == STAT_NAME.Calculation) { // || characterStat.characterStatTypeName == 'Command') {
                let _calsComndValue = characterStat.characterStatTypeName == STAT_NAME.Calculation ? characterStat.characterStatCalculation : characterStat.characterStatCommand;
                
                let _statCalculationIds = this.OptionsToIDs();//characterStat.characterStatTypeName == 'Calculation' ? characterStat.characterStatCalculation : characterStat.characterStatCommand;
                if (characterStat.characterStatCalsComndViewModel.length == 0) {
                    characterStat.characterStatCalsComndViewModel = [];
                    characterStat.characterStatCalsComndViewModel.push({ id: 0, calculationCommandValue: _calsComndValue, statCalculationIds: _statCalculationIds});

                } else {
                    characterStat.characterStatCalsComndViewModel[0].calculationCommandValue = _calsComndValue;
                    characterStat.characterStatCalsComndViewModel[0].statCalculationIds = _statCalculationIds;
                }
                characterStat.characterStatChoicesViewModels = [];
            }
            else if (characterStat.characterStatTypeName == STAT_NAME.Choice) {
                characterStat.characterStatChoicesViewModels = characterStat.characterStatChoicesViewModels
                    .filter(y => y.statChoiceValue.trim() !== '');

                characterStat.characterStatCalsComndViewModel = [];
            }
            else if (characterStat.characterStatTypeName == STAT_NAME.Combo) {
                validForm = this.validateCombo(characterStat.characterStatComboViewModel);
            }
            else if (characterStat.characterStatTypeName == STAT_NAME.Toggle) {
                if (!characterStat.characterStatToggleViewModel.isCustom)
                    characterStat.characterStatToggleViewModel.customToggles = [];
            }
            else if (characterStat.characterStatTypeName == STAT_NAME.Number) {
                validForm = this.validateDefaultValue(characterStat.characterStatDefaultValueViewModel);
            }
            else if (characterStat.characterStatTypeName == STAT_NAME.CurrentMax || characterStat.characterStatTypeName == "Current & Max") {
                validForm = this.validateDefaultValue(characterStat.characterStatDefaultValueViewModel);
            }
            else if (characterStat.characterStatTypeName == STAT_NAME.ValueSubValue || characterStat.characterStatTypeName == "Value & Sub-Value") {
                validForm = this.validateDefaultValue(characterStat.characterStatDefaultValueViewModel);
            }
            else {
                characterStat.characterStatCalsComndViewModel = [];
                characterStat.characterStatChoicesViewModels = [];
            }

            if (validForm) {
                if (characterStat.ruleSetId == 0 || characterStat.ruleSetId === undefined)
                    characterStat.ruleSetId = this._ruleSetId;

                if (this.characterStatsFormModal.view === VIEW.DUPLICATE) {
                    this.duplicateCharacterStat(characterStat);
                }
                else {
                    this.addEditCharacterStat(characterStat);
                }
            }
        }
    }

    addEditCharacterStat(modal: CharacterStats) {
        
        this.isLoading = true;
        let _msg = modal.characterStatId == 0 || modal.characterStatId === undefined ? "Creating Character Stat..." : "Updating Character Stat...";
        this.alertService.startLoadingMessage("", _msg);
        
        this.charactersService.createCharacterStats(modal)
            .subscribe(
                data => {
                    //console.log("data: ", data);
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();

                    let message = modal.characterStatId == 0 || modal.characterStatId === undefined ? "Character Stat has been added successfully." : "Character Stat has been updated successfully.";
                    this.alertService.showMessage(message, "", MessageSeverity.success);
                    this.close();
                    
                    if (this._isFromCharacter) {
                        this.sharedService.updateCharactersCharacterStats(true);
                    }
                    else {
                        this.sharedService.updateCharacterStatList(true);
                    }
                    //this.router.navigateByUrl('/ruleset', { skipLocationChange: true }).then(() => this.router.navigate(['/ruleset']));
                },
                error => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let _message = modal.characterStatId == 0 || modal.characterStatId === undefined ? "Unable to Add " : "Unable to Update ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else {
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                        setTimeout(() => { this.alertService.resetStickyMessage(); }, 2000);
                    }
                },
        );
    }

    duplicateCharacterStat(modal: CharacterStats) {

        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Duplicating Character Stat...");

        this.charactersService.duplicateCharacterStats(modal)
            .subscribe(
                data => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();

                    this.alertService.showMessage("Character Stat has been duplicated successfully.", "", MessageSeverity.success);
                    this.close();
                    this.sharedService.updateCharacterStatList(true);
                    // window.location.reload();
                },
                error => {
                    this.isLoading = false; 
                    this.alertService.stopLoadingMessage();
                    let _message = "Unable to Duplicate ";
                    let Errors = Utilities.ErrorDetail(_message, error);
                    if (Errors.sessionExpire) {
                        //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
                        this.authService.logout(true);
                    }
                    else {
                        this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
                        setTimeout(() => { this.alertService.resetStickyMessage(); }, 2000);
                    }
                });
    }


    close() {
        this.bsModalRef.hide();
        this.destroyModalOnInit();
    }
    OptionsToIDs() {
        
        let CalculationIds = this.characterStatsFormModal.characterStatCalculation;
        this.characterStatsFormModal.characterStatCalculation.split('[').map((item) => {
            CalculationIds = CalculationIds.replace('[', 'SqrStrt_').replace(']', '_SqrEnd');
        })
        this.selectedOptionWithIdsList.map((item, index) => {
            //  __plus__ strings are added because names can also contains the special characters
            item.match.split('+').map((x) => {
                item.match = item.match.replace('+','__PLUS__')
            })
            item.match.split('-').map((x) => {
                item.match = item.match.replace('-', '__MINUS__')
            })
            item.match.split('-').map((x) => {
                item.match = item.match.replace('-', '__DIVIDE__')
            })
            item.match.split('-').map((x) => {
                item.match = item.match.replace('-', '__MULTIPLY__')
            })

            CalculationIds.split('+').map((x) => {
                CalculationIds = CalculationIds.replace('+', '__PLUS__')
            })
            CalculationIds.split('-').map((x) => {
                CalculationIds = CalculationIds.replace('-', '__MINUS__')
            })
            CalculationIds.split('/').map((x) => {
                CalculationIds = CalculationIds.replace('/', '__DIVIDE__')
            })
            CalculationIds.split('*').map((x) => {
                CalculationIds = CalculationIds.replace('*', '__MULTIPLY__')
            })

            let expression = new RegExp(item.match.toUpperCase(), 'g');
            
            CalculationIds = CalculationIds.toUpperCase().replace(expression, item.matchID);

           
        })
        CalculationIds.split('__PLUS__').map((x) => {
            CalculationIds = CalculationIds.replace('__PLUS__', '+')
        })
        CalculationIds.split('__MINUS__').map((x) => {
            CalculationIds = CalculationIds.replace('__MINUS__', '-')
        })
        CalculationIds.split('__DIVIDE__').map((x) => {
            CalculationIds = CalculationIds.replace('__DIVIDE__', '/')
        })
        CalculationIds.split('__MULTIPLY__').map((x) => {
            CalculationIds = CalculationIds.replace('__MULTIPLY__', '*')
        })
       return CalculationIds;
    }
    showHidecustomFields() {
        this.showMoreLessColorToggle = !this.showMoreLessColorToggle;
    }
    private destroyModalOnInit(): void {
        try {
            this.modalService.hide(1);
            document.body.classList.remove('modal-open');            
        } catch (err) { }
    }
    showAdvancedFeatures() {
        
        if (!this.showAdvancedFeaturesToggle) {
            this.showAdvancedFeaturesText = "Show Less";

        } else {
            this.showAdvancedFeaturesText = 'Advanced';
        }
        this.showAdvancedFeaturesToggle = !this.showAdvancedFeaturesToggle;
    }
    openDiceModal(index, command) {
        this.bsModalRef = this.modalService.show(DiceComponent, {
            class: 'modal-primary modal-md dice-screen',
            ignoreBackdropClick: true,
            keyboard: false
        });
        this.bsModalRef.content.title = "Dice";
        this.bsModalRef.content.parentCommand = command;
        this.bsModalRef.content.inputIndex = index;
        
        this.bsModalRef.content.rulesetId = this.characterStatsFormModal.ruleSetId;
    }
    private LoadDefaultValues(DefaultValue: CharacterStatDefaultValue[], characterStatsFormModal: CharacterStats, characterStatTypeId: number) {
        
        let defValues = DefaultValue;//new CharacterStatDefaultValue()
        if (this.characterStatsFormModal.view === VIEW.DUPLICATE || this.characterStatsFormModal.view === VIEW.EDIT) {
            if (characterStatsFormModal.characterStatDefaultValueViewModel) {
                if (characterStatsFormModal.characterStatDefaultValueViewModel.length) {
                    defValues[0].characterStatDefaultValueId = characterStatsFormModal.characterStatDefaultValueViewModel[0].characterStatDefaultValueId;
                    if (characterStatsFormModal.characterStatDefaultValueViewModel.length>1) {
                        defValues[1].characterStatDefaultValueId = characterStatsFormModal.characterStatDefaultValueViewModel[1].characterStatDefaultValueId;
                    }
                    
                }
            }
        }     
        switch (characterStatTypeId) {
            case STAT_TYPE.Text:                           
                characterStatsFormModal.characterStatDefaultValueViewModel = [];                
                defValues[0].type = DefaultValue_STAT_TYPE.Text;
                characterStatsFormModal.characterStatDefaultValueViewModel.push(defValues[0])
                break;
            case STAT_TYPE.RichText:
                characterStatsFormModal.characterStatDefaultValueViewModel = [];
                defValues[0].type = DefaultValue_STAT_TYPE.RichText;
                characterStatsFormModal.characterStatDefaultValueViewModel.push(defValues[0])
                break;
            case STAT_TYPE.Number:
                characterStatsFormModal.characterStatDefaultValueViewModel = [];
                defValues[0].type = DefaultValue_STAT_TYPE.Number;
                characterStatsFormModal.characterStatDefaultValueViewModel.push(defValues[0])
                break;
            case STAT_TYPE.CurrentMax:
                characterStatsFormModal.characterStatDefaultValueViewModel = [];
                defValues[0].type = DefaultValue_STAT_TYPE.Current;
                characterStatsFormModal.characterStatDefaultValueViewModel.push(Object.assign({}, defValues[0]));
                defValues[1].type = DefaultValue_STAT_TYPE.Max;
                characterStatsFormModal.characterStatDefaultValueViewModel.push(Object.assign({}, defValues[1]))
                break;
            case STAT_TYPE.ValueSubValue:
                characterStatsFormModal.characterStatDefaultValueViewModel = [];
                defValues[0].type = DefaultValue_STAT_TYPE.Value;
                characterStatsFormModal.characterStatDefaultValueViewModel.push(Object.assign({}, defValues[0]))
                defValues[1].type = DefaultValue_STAT_TYPE.SubValue;
                characterStatsFormModal.characterStatDefaultValueViewModel.push(Object.assign({}, defValues[1]))
                break;
            case STAT_TYPE.Command:
                characterStatsFormModal.characterStatDefaultValueViewModel = [];
                defValues[0].type = DefaultValue_STAT_TYPE.Command;
                characterStatsFormModal.characterStatDefaultValueViewModel.push(defValues[0])
                break;


            default:
        }
    }
    private validateDefaultValue(characterStatDefaultValues: CharacterStatDefaultValue[]):boolean {
        let valid = true;
        
        characterStatDefaultValues.map((characterStatDefaultValue) => {
            if ((characterStatDefaultValue.minimum === undefined && characterStatDefaultValue.maximum !== undefined)
                || (+characterStatDefaultValue.minimum === null && +characterStatDefaultValue.maximum !== null)) {
                this.alertService.showMessage("", "The minimum value can not be empty if maximum value is provided.", MessageSeverity.error);
                valid= false;
            }
            else if ((characterStatDefaultValue.minimum !== undefined && characterStatDefaultValue.maximum === undefined)
                || (+characterStatDefaultValue.minimum !== null && +characterStatDefaultValue.maximum === null)) {
                this.alertService.showMessage("", "The maximum value can not be empty if minimum value is provided.", MessageSeverity.error);
                valid= false;
            }
            else if ((+characterStatDefaultValue.minimum && +characterStatDefaultValue.maximum) || (+characterStatDefaultValue.minimum === 0 || +characterStatDefaultValue.maximum === 0)) {
                if (+characterStatDefaultValue.minimum > +characterStatDefaultValue.maximum) {
                    this.alertService.showMessage("", "The minimum value could not be greater than the maximum value.", MessageSeverity.error);
                    valid = false;
                }
                else if (characterStatDefaultValue.defaultValue !== undefined) {
                    if (+characterStatDefaultValue.minimum > +characterStatDefaultValue.defaultValue
                        || +characterStatDefaultValue.maximum < +characterStatDefaultValue.defaultValue
                    ) {
                        this.alertService.showMessage("", "The value for this field must be between " + characterStatDefaultValue.minimum + " and " + characterStatDefaultValue.maximum + " value.", MessageSeverity.error);
                        valid = false;
                    }
                }
                //if (characterStatDefaultValue.defaultValue !== undefined) {
                //    if (+characterStatDefaultValue.minimum > +characterStatDefaultValue.defaultValue
                //        || +characterStatDefaultValue.maximum < +characterStatDefaultValue.defaultValue
                //    ) {
                //        this.alertService.showMessage("", "The Current Value would need to be a value that is no less than the minimum and no greater than the maximum.", MessageSeverity.error);
                //        valid = false;
                //    }
                //}
            }
           
        })
        return valid;

    }
    AddElseIfCondition(elseIndex) {
        let IndexPositionToInsert_ElseIf: number = elseIndex - 1;
        let NewElseIfSortOrder: number = elseIndex+1;

        let NewElseIf = new CharacterStatConditionViewModel(0, 0, 1, '', '', NewElseIfSortOrder, 0, null, 0, '', [], false);
        
        this.characterStatsFormModal.characterStatConditionViewModel.splice(elseIndex, 0, NewElseIf);

        //elseCondition.sortOrder = NewElseIf.sortOrder + 1;
        this.characterStatsFormModal.characterStatConditionViewModel.map((sc, index) => {
            sc.sortOrder = index + 1;
        })
    }
    removeCondition(indexToDelete, StatConditionViewModelList: CharacterStatConditionViewModel[]) {
        StatConditionViewModelList.splice(indexToDelete, 1);
        StatConditionViewModelList.map((sc,index) => {
            sc.sortOrder = index + 1;
        })
    }
    conditionStatChanged(e: any, condition: CharacterStatConditionViewModel) {
        let selectedVal = e.target.value;
        this.characterStatsForConditions.map((stat: StatsList) => {
            if (stat.tempCharacterStatId == selectedVal) {
                condition.ifClauseStatId = stat.characterStatId;
                condition.ifClauseStattype = stat.ifClauseStattype;
                condition.isNumeric = stat.isNumeric;
                
            }
        })
    }
    GetStatList(statsList: StatsList[]) {
        let newList: StatsList[] = [];
        statsList.map((stat: StatsList) => {
            switch (stat.typeId) {
                case STAT_TYPE.Text:
                    newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0,isNumeric:false })
                    break;
                case STAT_TYPE.Number:
                    newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric:true})
                    break;
                case STAT_TYPE.CurrentMax:
                    newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric:true})
                    newList.push({ tempCharacterStatId: stat.characterStatId + '_1', characterStatId: stat.characterStatId, statName: stat.statName + "(current)", typeId: stat.typeId, ifClauseStattype: 1, isNumeric:true })
                    newList.push({ tempCharacterStatId: stat.characterStatId + '_2', characterStatId: stat.characterStatId, statName: stat.statName + "(max)", typeId: stat.typeId, ifClauseStattype: 2, isNumeric:true})
                    break;
                case STAT_TYPE.Choice:
                    newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric:false })
                    break;
                case STAT_TYPE.ValueSubValue:
                    newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric:true })
                    newList.push({ tempCharacterStatId: stat.characterStatId + '_1', characterStatId: stat.characterStatId, statName: stat.statName + "(value)", typeId: stat.typeId, ifClauseStattype: 1, isNumeric:true })
                    newList.push({ tempCharacterStatId: stat.characterStatId + '_2', characterStatId: stat.characterStatId, statName: stat.statName + "(subValue)", typeId: stat.typeId, ifClauseStattype: 2, isNumeric:true})
                    break;
                case STAT_TYPE.Combo:
                    newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric:true})
                    newList.push({ tempCharacterStatId: stat.characterStatId + '_1', characterStatId: stat.characterStatId, statName: stat.statName + "(number)", typeId: stat.typeId, ifClauseStattype: 1, isNumeric:true })
                    newList.push({ tempCharacterStatId: stat.characterStatId + '_2', characterStatId: stat.characterStatId, statName: stat.statName + "(text)", typeId: stat.typeId, ifClauseStattype: 2, isNumeric:false })
                    break;
                case STAT_TYPE.Calculation:
                    newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric:true})
                    break;
                default:
            }
        })
        
        return newList;
    }
    IsStatSelected(stat: StatsList, condition: CharacterStatConditionViewModel) {
        
        if (condition.ifClauseStatId.toString() == stat.tempCharacterStatId && condition.ifClauseStatId == stat.characterStatId && condition.ifClauseStattype<=0) {
            return true;
        }
        else if (condition.ifClauseStatId == stat.characterStatId) {
            if (stat.tempCharacterStatId.indexOf('_') != -1) {
                if (stat.tempCharacterStatId.split('_')[1] === condition.ifClauseStattype.toString()) {
                    return true;
                }
            }
        }
        return false;

    }
    checkNum(event: any) {
        //const pattern = /^-?[0-9]\d*(\\d+)?$/g;
        //if (!pattern.test(event.target.value)) {  
        //            event.target.value = event.target.value.replace(/[^0-9]/g, "");
        //}
        return false;
    }
}
