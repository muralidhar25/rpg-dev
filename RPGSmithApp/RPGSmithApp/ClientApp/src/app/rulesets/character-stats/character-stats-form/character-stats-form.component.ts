import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';
import { CharacterStats, CustomToggle, CharacterStatCombo, CharacterStatToggle, StatsList, ConditionOperatorsList, CharacterStatConditionViewModel, CharacterStatDefaultValue, CharacterStatChoicesViewModels } from '../../../core/models/view-models/character-stats.model';
import { STAT_TYPE, DefaultValue_STAT_TYPE, STAT_NAME, TOGGLE_TYPE, VIEW } from '../../../core/models/enums';
import { Utilities } from '../../../core/common/utilities';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService, MessageSeverity } from '../../../core/common/alert.service';
import { CharacterStatService } from '../../../core/services/character-stat.service';
import { ChoiceService } from '../../../core/services/choice.service';
import { SharedService } from '../../../core/services/shared.service';
import { ImageSelectorComponent } from '../../../shared/image-interface/image-selector/image-selector.component';
import { DiceComponent } from '../../../shared/dice/dice/dice.component';
import { DiceService } from '../../../core/services/dice.service';
import { PlatformLocation } from '@angular/common';
import { ServiceUtil } from '../../../core/services/service-util';
import { User } from '../../../core/models/user.model';
import { DBkeys } from '../../../core/common/db-keys';
import { LocalStoreManager } from '../../../core/common/local-store-manager.service';

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
  displayChoices: boolean = false;
  otherStatchoice: boolean = false;

  choiceList: any[] = [];
  IsThisStatAlreayAssignedtoOtherStat: boolean = false;
  isGM: boolean = false;
  options(placeholder?: string, initOnClick?: boolean): Object {
    return Utilities.optionsFloala(160, placeholder, initOnClick);
  }
  erMessage: string = '';

  constructor(
    private router: Router, private bsModalRef: BsModalRef,
    private alertService: AlertService, private authService: AuthService,
    private charactersService: CharacterStatService, private choiceService: ChoiceService,
    private modalService: BsModalService, private sharedService: SharedService,
    private location: PlatformLocation, private localStorage: LocalStoreManager) {
    location.onPopState(() => this.modalService.hide(1));
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
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null) {
      this.authService.logout();
    }
    else {
      if (user.isGm) {
        this.isGM = user.isGm;
      }
    }
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
      debugger
      this.choiceList = this.bsModalRef.content.Choices;
      this.IsThisStatAlreayAssignedtoOtherStat = false;
      
      if (this.choiceList) {
        if (this.choiceList.length) {

          this.IsThisStatAlreayAssignedtoOtherStat =
            this.choiceList.filter(x =>
              x.isChoicesFromAnotherStat && x.selectedChoiceCharacterStatId == this.characterStatsFormModal.characterStatId
            ).length ? true : false;

          this.choiceList = this.choiceList.filter(x => x.characterStatId != this.characterStatsFormModal.characterStatId && !x.isChoicesFromAnotherStat)
          this.choiceList.map((x) => {
            x.selected = false;
            if (this.characterStatsFormModal.view == VIEW.DUPLICATE || this.characterStatsFormModal.view == VIEW.EDIT) {
              if (this.characterStatsFormModal.selectedChoiceCharacterStatId == x.characterStatId) {
                x.selected = true;
              }              
            }
          })
        }
      }




      if (this.characterStatsFormModal.characterStatConditionViewModel) {
        if (this.characterStatsFormModal.characterStatConditionViewModel.length) {
          this.characterStatsFormModal.characterStatConditionViewModel.map((x: CharacterStatConditionViewModel) => {
            x.compareValue_isNumeric = x.isNumeric;
            x.ifClauseStatText_isNumeric = x.isNumeric;
            x.compareValue_isValid = true;
            x.ifClauseStatText_isValid = true;
          })
        }
      }
      if (this.characterStatsFormModal.characterStatChoicesViewModels) {
        if (this.characterStatsFormModal.characterStatChoicesViewModels.length) {


          //// ///
          //this.getUniqueCharacterStatsChoices(this.characterStatsFormModal.characterStatChoicesViewModels);

          ////////this.characterStatsFormModal.characterStatChoicesViewModels.map((x: CharacterStatChoicesViewModels) => {
          ////////  this.choiceList.map((Ch) => {
          ////////    if (!Ch.selected) {
          ////////      if (Ch.characterStatChoiceId === x.characterStatChoiceId) {
          ////////        Ch.selected = true;
          ////////      }
          ////////      else { Ch.selected = false; }
          ////////    }
          ////////
          ////////
          ////////  })
          ////////})
        }
      }

      
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
      else {
        this.title = 'Add Character Stat';
        //this.getUniqueCharacterStatsChoices(null); // Get unique Choices on Add View
      }

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
          //this.LoadDefaultValues(this.characterStatsFormModal.characterStatDefaultValueViewModel, this.characterStatsFormModal, this.characterStatsFormModal.characterStatDefaultValueViewModel[0].type);
          this.LoadDefaultValues(this.characterStatsFormModal.characterStatDefaultValueViewModel, this.characterStatsFormModal, this.characterStatsFormModal.characterStatTypeId);
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

//  getUniqueCharacterStatsChoices(characteStatChoices) {
//    var Uniqueresult = [];
//    const map = new Map();
//    if (characteStatChoices)
//      characteStatChoices.filter(x => {
//        map.set(x.statName, true);
//        Uniqueresult.push(x);      

//    this.choiceList.filter(x => {
//      if (!map.has(x.statName)) {
//        map.set(x.statName, true);    // set any value to Map
//        Uniqueresult.push(x);
//      }
//    });

//    this.choiceList = Uniqueresult.sort((a, b) => a.statChoiceValue.localeCompare(b.statChoiceValue));
//})

//  }

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

  checkMultipleChoice(event) {
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


  validateCombo(characterStatCombo: CharacterStatCombo): boolean {

    if (characterStatCombo.minimum !== undefined) {
      if (characterStatCombo.minimum === null) {
        characterStatCombo.minimum = undefined;
      }
      else if (characterStatCombo.minimum.toString() === '') {
        characterStatCombo.minimum = undefined;
      }
    }
    if (characterStatCombo.maximum !== undefined) {
      if (characterStatCombo.maximum === null) {
        characterStatCombo.maximum = undefined;
      }
      else if (characterStatCombo.maximum.toString() === '') {
        characterStatCombo.maximum = undefined;
      }
    }

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
    else if (characterStat.statName.toLowerCase().trim() == "name" || characterStat.statName.toLowerCase().trim() == "description" || characterStat.statName.toLowerCase().replace(/ +/g, "") == "ruleset" || characterStat.statName.toLowerCase().trim() == "image") {
      this.alertService.showMessage("Invalid Character Stat Name", "The Name <Name> is reserved and not available to be created as a Character Stat, please select a different name.", MessageSeverity.error);
    }
    else {
      let validForm = true;

      if (characterStat.characterStatTypeName == STAT_NAME.Calculation) { // || characterStat.characterStatTypeName == 'Command') {
        let _calsComndValue = characterStat.characterStatTypeName == STAT_NAME.Calculation ? characterStat.characterStatCalculation : characterStat.characterStatCommand;

        let _statCalculationIds = this.OptionsToIDs();//characterStat.characterStatTypeName == 'Calculation' ? characterStat.characterStatCalculation : characterStat.characterStatCommand;
        if (characterStat.characterStatCalsComndViewModel.length == 0) {
          characterStat.characterStatCalsComndViewModel = [];
          characterStat.characterStatCalsComndViewModel.push({ id: 0, calculationCommandValue: _calsComndValue, statCalculationIds: _statCalculationIds });

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

        validForm = this.validateDefaultValue(characterStat.characterStatDefaultValueViewModel);
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


    if (modal.statName.toUpperCase() == STAT_NAME.CharName.toUpperCase() || modal.statName.toUpperCase() == STAT_NAME.CharDesc.toUpperCase()) {
      let message = 'The Character Stat Name "' + modal.statName + '" is reserved by the system, please select a different name and try again.';
      this.alertService.showMessage(message, "", MessageSeverity.error);
    }
    else {
      this.isLoading = true;
      let _msg = modal.characterStatId == 0 || modal.characterStatId === undefined ? "Creating Character Stat..." : "Updating Character Stat...";
      this.alertService.startLoadingMessage("", _msg);
      modal.statName = modal.statName.replace(/  +/g, ' ').trim();
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
  }

  duplicateCharacterStat(modal: CharacterStats) {

    this.isLoading = true;
    this.alertService.startLoadingMessage("", "Duplicating Character Stat...");
    modal.statName = modal.statName.replace(/  +/g, ' ').trim();
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
      
      item.match = item.match.split('').map((x) => {
        x = ServiceUtil.GetSpecialCharacterCodeForChar(x);
        return x;
      }).join('');

      item.match.split('+').map((x) => {
        item.match = item.match.replace('+', '__PLUS__')
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

      CalculationIds = CalculationIds.split('').map((x) => {
        x = ServiceUtil.GetSpecialCharacterCodeForChar(x);
        return x;
      }).join('');

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

    CalculationIds = ServiceUtil.GetCharacterFromSpecialCharacterCode(CalculationIds);
    
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
          if (characterStatsFormModal.characterStatDefaultValueViewModel.length > 1) {
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
        if (characterStatsFormModal.view == VIEW.ADD) {
          characterStatsFormModal.addToModScreen = true;
        }
        break;
      case STAT_TYPE.CurrentMax:
        debugger
        characterStatsFormModal.characterStatDefaultValueViewModel = [];
        defValues[0].type = DefaultValue_STAT_TYPE.Current;
        characterStatsFormModal.characterStatDefaultValueViewModel.push(Object.assign({}, defValues[0]));
        defValues[1].type = DefaultValue_STAT_TYPE.Max;
        characterStatsFormModal.characterStatDefaultValueViewModel.push(Object.assign({}, defValues[1]))
        if (characterStatsFormModal.view == VIEW.ADD) {
          characterStatsFormModal.addToModScreen = true;
        }
        break;
      case STAT_TYPE.ValueSubValue:
        debugger
        characterStatsFormModal.characterStatDefaultValueViewModel = [];
        defValues[0].type = DefaultValue_STAT_TYPE.Value;
        characterStatsFormModal.characterStatDefaultValueViewModel.push(Object.assign({}, defValues[0]))
        defValues[1].type = DefaultValue_STAT_TYPE.SubValue;
        characterStatsFormModal.characterStatDefaultValueViewModel.push(Object.assign({}, defValues[1]))
        if (characterStatsFormModal.view == VIEW.ADD) {
          characterStatsFormModal.addToModScreen = true;
        }
        break;
      case STAT_TYPE.Command:
        characterStatsFormModal.characterStatDefaultValueViewModel = [];
        defValues[0].type = DefaultValue_STAT_TYPE.Command;
        characterStatsFormModal.characterStatDefaultValueViewModel.push(defValues[0])
        if (characterStatsFormModal.view == VIEW.ADD) {
          characterStatsFormModal.addToModScreen = true;
        }
        break;
      case STAT_TYPE.Calculation:
        if (characterStatsFormModal.view == VIEW.ADD) {
          characterStatsFormModal.addToModScreen = true;
        }
        break;
      case STAT_TYPE.Combo:
        if (characterStatsFormModal.view == VIEW.ADD) {
          characterStatsFormModal.addToModScreen = true;
        }
        break;
      case STAT_TYPE.Choice:
        characterStatsFormModal.characterStatDefaultValueViewModel = [];
        defValues[0].type = DefaultValue_STAT_TYPE.choice;
        characterStatsFormModal.characterStatDefaultValueViewModel.push(defValues[0])
        if (characterStatsFormModal.view == VIEW.ADD) {
          characterStatsFormModal.addToModScreen = true;
        }
        break;

      default:
    }
  }
  private validateDefaultValue(characterStatDefaultValues: CharacterStatDefaultValue[]): boolean {
    let valid = true;

    characterStatDefaultValues.map((characterStatDefaultValue) => {
      if (characterStatDefaultValue.minimum !== undefined) {
        if (characterStatDefaultValue.minimum === null) {
          characterStatDefaultValue.minimum = undefined;
        }
        else if (characterStatDefaultValue.minimum.toString() === '') {
          characterStatDefaultValue.minimum = undefined;
        }
      }
      if (characterStatDefaultValue.maximum !== undefined) {
        if (characterStatDefaultValue.maximum === null) {
          characterStatDefaultValue.maximum = undefined;
        }
        else if (characterStatDefaultValue.maximum.toString() === '') {
          characterStatDefaultValue.maximum = undefined;
        }
      }
      if ((characterStatDefaultValue.minimum === undefined && characterStatDefaultValue.maximum !== undefined)
        || (+characterStatDefaultValue.minimum === null && +characterStatDefaultValue.maximum !== null)) {
        this.alertService.showMessage("", "The minimum value can not be empty if maximum value is provided.", MessageSeverity.error);
        valid = false;
      }
      else if ((characterStatDefaultValue.minimum !== undefined && characterStatDefaultValue.maximum === undefined)
        || (+characterStatDefaultValue.minimum !== null && +characterStatDefaultValue.maximum === null)) {
        this.alertService.showMessage("", "The maximum value can not be empty if minimum value is provided.", MessageSeverity.error);
        valid = false;
      }
      else if (characterStatDefaultValue.minimum !== undefined && characterStatDefaultValue.maximum !== undefined) {
        if (characterStatDefaultValue.minimum.toString() !== '' && characterStatDefaultValue.maximum.toString() !== '') {
          if ((+characterStatDefaultValue.minimum && +characterStatDefaultValue.maximum) || (+characterStatDefaultValue.minimum === 0 || +characterStatDefaultValue.maximum === 0)) {
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
          }
        }
        else {

          if (characterStatDefaultValue.minimum !== undefined && characterStatDefaultValue.maximum !== undefined) {

            if (characterStatDefaultValue.minimum.toString() === '' && characterStatDefaultValue.maximum.toString() === '') {
              characterStatDefaultValue.minimum = undefined;
              characterStatDefaultValue.maximum = undefined;
            }
            else if (characterStatDefaultValue.minimum.toString() !== '' && characterStatDefaultValue.maximum.toString() === '') {
              this.alertService.showMessage("", "The maximum value can not be empty if minimum value is provided.", MessageSeverity.error);
              valid = false;
            }
            else if (characterStatDefaultValue.minimum.toString() === '' && characterStatDefaultValue.maximum.toString() !== '') {
              this.alertService.showMessage("", "The minimum value can not be empty if maximum value is provided.", MessageSeverity.error);
              valid = false;
            }
          }


        }
        //else 
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
    let NewElseIfSortOrder: number = elseIndex + 1;

    let NewElseIf = new CharacterStatConditionViewModel(0, 1, '', '', NewElseIfSortOrder, 0, null, [], false, '', false, false, true, true);

    this.characterStatsFormModal.characterStatConditionViewModel.splice(elseIndex, 0, NewElseIf);

    //elseCondition.sortOrder = NewElseIf.sortOrder + 1;
    this.characterStatsFormModal.characterStatConditionViewModel.map((sc, index) => {
      sc.sortOrder = index + 1;
    })
  }
  removeCondition(indexToDelete, StatConditionViewModelList: CharacterStatConditionViewModel[]) {
    StatConditionViewModelList.splice(indexToDelete, 1);
    StatConditionViewModelList.map((sc, index) => {
      sc.sortOrder = index + 1;
    })
  }
  //conditionStatChanged(e: any, condition: CharacterStatConditionViewModel) {
  //    let selectedVal = e.target.value;
  //    this.characterStatsForConditions.map((stat: StatsList) => {
  //        if (stat.tempCharacterStatId == selectedVal) {
  //            condition.ifClauseStatId = stat.characterStatId;
  //            condition.ifClauseStattype = stat.ifClauseStattype;
  //            condition.isNumeric = stat.isNumeric;

  //        }
  //    })
  //}
  GetStatList(statsList: StatsList[]) {
    let newList: StatsList[] = [];
    newList.push({ tempCharacterStatId: "-1", characterStatId: -1, statName: "INVENTORYWEIGHT", typeId: -1, ifClauseStattype: 0, isNumeric: true })
    statsList.map((stat: StatsList) => {
      switch (stat.typeId) {
        case STAT_TYPE.Text:
          newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric: false })
          break;
        case STAT_TYPE.Number:
          newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric: true })
          break;
        case STAT_TYPE.CurrentMax:
          newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric: true })
          newList.push({ tempCharacterStatId: stat.characterStatId + '_1', characterStatId: stat.characterStatId, statName: stat.statName + "(current)", typeId: stat.typeId, ifClauseStattype: 1, isNumeric: true })
          newList.push({ tempCharacterStatId: stat.characterStatId + '_2', characterStatId: stat.characterStatId, statName: stat.statName + "(max)", typeId: stat.typeId, ifClauseStattype: 2, isNumeric: true })
          break;
        case STAT_TYPE.Choice:
          newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric: false })
          break;
        case STAT_TYPE.ValueSubValue:
          newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric: true })
          newList.push({ tempCharacterStatId: stat.characterStatId + '_1', characterStatId: stat.characterStatId, statName: stat.statName + "(value)", typeId: stat.typeId, ifClauseStattype: 1, isNumeric: true })
          newList.push({ tempCharacterStatId: stat.characterStatId + '_2', characterStatId: stat.characterStatId, statName: stat.statName + "(subValue)", typeId: stat.typeId, ifClauseStattype: 2, isNumeric: true })
          break;
        case STAT_TYPE.Combo:
          newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric: true })
          newList.push({ tempCharacterStatId: stat.characterStatId + '_1', characterStatId: stat.characterStatId, statName: stat.statName + "(number)", typeId: stat.typeId, ifClauseStattype: 1, isNumeric: true })
          newList.push({ tempCharacterStatId: stat.characterStatId + '_2', characterStatId: stat.characterStatId, statName: stat.statName + "(text)", typeId: stat.typeId, ifClauseStattype: 2, isNumeric: false })
          break;
        case STAT_TYPE.Calculation:
          newList.push({ tempCharacterStatId: stat.characterStatId.toString(), characterStatId: stat.characterStatId, statName: stat.statName, typeId: stat.typeId, ifClauseStattype: 0, isNumeric: true })
          break;
        default:
      }
    })

    return newList;
  }
  //IsStatSelected(stat: StatsList, condition: CharacterStatConditionViewModel) {

  //    if (condition.ifClauseStatId.toString() == stat.tempCharacterStatId && condition.ifClauseStatId == stat.characterStatId && condition.ifClauseStattype<=0) {
  //        return true;
  //    }
  //    else if (condition.ifClauseStatId == stat.characterStatId) {
  //        if (stat.tempCharacterStatId.indexOf('_') != -1) {
  //            if (stat.tempCharacterStatId.split('_')[1] === condition.ifClauseStattype.toString()) {
  //                return true;
  //            }
  //        }
  //    }
  //    return false;

  //}
  checkNum(event: any) {
    //const pattern = /^-?[0-9]\d*(\\d+)?$/g;
    //if (!pattern.test(event.target.value)) {  
    //            event.target.value = event.target.value.replace(/[^0-9]/g, "");
    //}
    return false;
  }
  ifClauseStatTextChanged(condition: CharacterStatConditionViewModel) {

    let res: boolean = this.IsStatStringContainsOnlyNumericResult(condition.ifClauseStatText);
    condition.ifClauseStatText_isNumeric = res;
    if (!isNaN(+condition.ifClauseStatText)) {
      condition.ifClauseStatText_isNumeric = condition.compareValue_isNumeric;
    }
    else {
      if (!isNaN(+condition.compareValue)) {
        condition.compareValue_isNumeric = condition.ifClauseStatText_isNumeric
      }
    }
    if (condition.compareValue == '') {
      condition.compareValue_isNumeric = condition.ifClauseStatText_isNumeric;
    }
    this.CommonConditionTextBoxChanged(condition);
  }
  CompareValueTextChanged(condition: CharacterStatConditionViewModel) {

    let res: boolean = this.IsStatStringContainsOnlyNumericResult(condition.compareValue);
    condition.compareValue_isNumeric = res;
    if (!isNaN(+condition.compareValue)) {
      condition.compareValue_isNumeric = condition.ifClauseStatText_isNumeric;
    }
    else {
      if (!isNaN(+condition.ifClauseStatText)) {
        condition.ifClauseStatText_isNumeric = condition.compareValue_isNumeric;
      }
    }
    if (condition.ifClauseStatText == '') {
      condition.ifClauseStatText_isNumeric = condition.compareValue_isNumeric;
    }
    this.CommonConditionTextBoxChanged(condition);
  }
  public CommonConditionTextBoxChanged(condition: CharacterStatConditionViewModel) {
    condition.compareValue_isValid = true;
    condition.ifClauseStatText_isValid = true;
    let errMsg = '';
    this.erMessage = errMsg;
    if (!isNaN(+condition.ifClauseStatText) && !isNaN(+condition.compareValue)) {
      condition.ifClauseStatText_isNumeric = true;
      condition.compareValue_isNumeric = true;
    }
    if (condition.ifClauseStatText_isNumeric && condition.compareValue_isNumeric) {
      condition.isNumeric = true;
    }
    else {
      condition.isNumeric = false;
    }


    var ifClauseStatTextString = condition.ifClauseStatText;
    var compareValueString = condition.compareValue;
    var myRegEx = /\[(.*?)\]/g;

    // Get an array containing the first capturing group for every match

    var matchesIfClauseStatText = this.getMatches(ifClauseStatTextString, myRegEx);
    var matchesCompareValueString = this.getMatches(compareValueString, myRegEx);

    let NotValidStatNames = '';
    let Matched_IfClauseStatText: boolean = true;
    let Matched_CompareValue: boolean = true;
    matchesIfClauseStatText.map((x) => {

      if (this.characterStatsForConditions.filter(csfc => csfc.statName.toUpperCase() == x.toUpperCase()).length == 0) {
        Matched_IfClauseStatText = false;
        condition.ifClauseStatText_isValid = false;
        NotValidStatNames += ' [' + x + '],';
      }

    });
    matchesCompareValueString.map((x) => {
      if (this.characterStatsForConditions.filter(csfc => csfc.statName.toUpperCase() == x.toUpperCase()).length == 0) {
        Matched_CompareValue = false;
        condition.compareValue_isValid = false;
        NotValidStatNames += ' [' + x + '],';
      }
    });

    if (!(Matched_IfClauseStatText && Matched_CompareValue)) {
      NotValidStatNames = NotValidStatNames.substring(0, NotValidStatNames.length - 1);
      errMsg = NotValidStatNames + ' is not valid stat name.'
    }
    this.erMessage = errMsg;
    //console.log(this.erMessage);
  }
  public IsStatStringContainsOnlyNumericResult(text: string): boolean {
    let calculationString: string = text;
    let finalCalcString: string = '';

    let inventoreyWeight = 1111;

    calculationString.toUpperCase().split("[INVENTORYWEIGHT]").map((item) => {
      calculationString = calculationString.toUpperCase().replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
    })
    if (calculationString) {
      calculationString = calculationString.trim();
    }

    let IDs: any[] = [];

    let NumericStatType = { CURRENT: 1, MAX: 2, VALUE: 3, SUBVALUE: 4, NUMBER: 5 };
    finalCalcString = calculationString;
    if (calculationString) {
      calculationString.split(/\[(.*?)\]/g).map((rec) => {

        let id = ''; let flag = false; let type = 0; let statType = 0;



        //let id = ''; let flag = false; let type = 0; let statType = 0;
        let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false; let isNum = false;

        if (rec.toUpperCase().split('(VALUE)').length > 1) { isValue = true; }
        if (rec.toUpperCase().split('(SUBVALUE)').length > 1) { isSubValue = true; }
        if (rec.toUpperCase().split('(CURRENT)').length > 1) { isCurrent = true; }
        if (rec.toUpperCase().split('(MAX)').length > 1) { isMax = true; }
        if (rec.toUpperCase().split('(Number)').length > 1) { isNum = true; }

        if (isValue || isSubValue || isCurrent || isMax || isNum) {
          if (isValue) {
            id = rec.toUpperCase().split('(VALUE)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.VALUE;
          }
          else if (isSubValue) {
            id = rec.toUpperCase().split('(SUBVALUE)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.SUBVALUE;
          }
          else if (isCurrent) {
            id = rec.toUpperCase().split('(CURRENT)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.CURRENT;
          }
          else if (isMax) {
            id = rec.toUpperCase().split('(MAX)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.MAX;
          }
          else if (isNum) {
            id = rec.toUpperCase().split('(Number)')[0].replace('[', '').replace(']', '');
            type = NumericStatType.NUMBER;
          }

        }
        else {
          id = rec.replace('[', '').replace(']', '');
          type = 0
        }
        this.characterStatsForConditions.map((q) => {
          if (!flag) {
            flag = (id.toUpperCase() == q.statName.toUpperCase());
            statType = q.typeId
          }
        })
        if (flag) {
          IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
        }
        else if (+id == -1) {
          IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
        }
      })
      IDs.map((rec) => {
        let TestNumber: number = 1;
        this.characterStatsForConditions.map((stat) => {
          if (rec.id.toUpperCase() == stat.statName.toUpperCase()) {
            let num = 0;
            switch (rec.statType) {
              case 3: //Number
                num = TestNumber
                break;
              case 5: //Current Max
                if (rec.type == 0)//current
                {
                  num = TestNumber
                }
                else if (rec.type == NumericStatType.CURRENT)//current
                {
                  num = TestNumber
                }
                else if (rec.type == NumericStatType.MAX)//Max
                {
                  num = TestNumber
                }
                break;
              case 7: //Val Sub-Val
                if (rec.type == 0)//value
                {
                  num = TestNumber
                }
                else if (rec.type == NumericStatType.VALUE)//value
                {
                  num = TestNumber
                }
                else if (rec.type == NumericStatType.SUBVALUE)//sub-value
                {
                  num = TestNumber
                }
                break;
              case 12: //Calculation
                num = TestNumber
                break;
              case STAT_TYPE.Combo: //Combo

                num = TestNumber
                break;
              default:
                break;
            }
            if (num)
              calculationString = calculationString.replace(rec.originaltext, num.toString());
            else
              calculationString = calculationString.replace(rec.originaltext, '0');
            //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
          }

        });

        finalCalcString = calculationString;
      });
    }
    ////////////////////////////////
    finalCalcString = finalCalcString.replace(/  +/g, ' ');
    finalCalcString = finalCalcString.replace(/RU/g, ' RU').replace(/RD/g, ' RD').replace(/KL/g, ' KL').replace(/KH/g, ' KH').replace(/DL/g, ' DL').replace(/DH/g, ' DH');
    finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '');
    finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '');
    let CalcStringForValue_Result: number = Utilities.InvalidValueForConditionStats;
    try {
      finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
        finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
        ? finalCalcString.trim().slice(0, -1)
        : finalCalcString.trim();
      let obj: any = +finalCalcString == 0 ? 0 : DiceService.commandInterpretationForConditionStatValueCalculations(finalCalcString, undefined, undefined)[0];
      let res = false;
      if (obj) {
        if (obj.calculationArray) {
          if (obj.calculationArray.length) {
            if (obj.calculationArray.length == obj.calculationArray.filter(x => x.static).length) {
              res = true;
            }
            //obj.calculationArray.map((o) => {
            //    if (!o.static) {
            //        res = false;
            //    }
            //})
          }
        }
      }
      return res;
    }
    catch (ex) {
      return false;
    }

  }
  public CheckConditionsAreValid(): boolean {


    if (this.characterStatsFormModal.characterStatTypeId == STAT_TYPE.Condition) {
      let res = true;
      if (this.characterStatsFormModal.characterStatConditionViewModel) {
        if (this.characterStatsFormModal.characterStatConditionViewModel.length) {
          this.characterStatsFormModal.characterStatConditionViewModel.map((x: CharacterStatConditionViewModel) => {
            if (x.compareValue_isNumeric != x.ifClauseStatText_isNumeric) {
              res = false;
            }
            else if (x.ifClauseStatText_isValid != x.compareValue_isValid) {
              res = false;
            }
          })
        }
      }
      return res;
    }
    else {
      return true;
    }
  }
  public getMatches(string, regex) {
    let index = 1; // default to the first capturing group
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
      matches.push(match[index]);
    }
    return matches;
  }

  defineChoices(defineChoices: boolean) {    
    this.choiceList.map((x) => {
      x.selected = false;
    })
    this.characterStatsFormModal.characterStatChoicesViewModels = [];
    this.characterStatsFormModal.characterStatChoicesViewModels
      .push({ characterStatChoiceId: 0, statChoiceValue: '' });
    this.characterStatsFormModal.isChoicesFromAnotherStat = false;
    this.characterStatsFormModal.selectedChoiceCharacterStatId = 0;

  }

  choicesfromOtherStat(choicesFromOther: boolean) {
    this.choiceList.map((x) => {
      x.selected = false;
    })
    this.characterStatsFormModal.characterStatChoicesViewModels = [];
    this.characterStatsFormModal.characterStatChoicesViewModels
      .push({ characterStatChoiceId: 0, statChoiceValue: '' });
    this.characterStatsFormModal.isChoicesFromAnotherStat = true;
    this.characterStatsFormModal.selectedChoiceCharacterStatId = 0;
  }
  updateCheckedOptions(option, event) {
if (event.target.checked)
this.characterStatsFormModal.selectedChoiceCharacterStatId=option.characterStatId;
//   option.selected = event.target.checked
//   if (event.target.checked) {
//     this.characterStatsFormModal.characterStatChoicesViewModels.push(option);
//   } else {
//     this.characterStatsFormModal.characterStatChoicesViewModels =
//this.characterStatsFormModal.characterStatChoicesViewModels.filter(e => e !== option);
//
//   }
//
 }
}
