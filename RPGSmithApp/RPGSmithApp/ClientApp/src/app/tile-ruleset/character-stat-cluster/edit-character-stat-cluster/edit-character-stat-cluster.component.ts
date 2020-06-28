import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { STAT_TYPE, VIEW, CONDITION_OPERATOR_ENUM, DefaultValue_STAT_TYPE, TILES, STAT_LINK_TYPE } from '../../../core/models/enums';
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
import { CharacterStats, CharacterStatConditionViewModel, CharacterStatDefaultValue } from '../../../core/models/view-models/character-stats.model';
import { DiceRollComponent } from '../../../shared/dice/dice-roll/dice-roll.component';

import { PlatformLocation } from '@angular/common';
import { RulesetCharacterStatTileComponent } from '../../character-stat/character-stat.component';
import { CharacterStatClusterTile } from '../../../core/models/tiles/character-stat-cluster-tile.model';
import { CharacterStatService } from '../../../core/services/character-stat.service';
import { RulesetService } from '../../../core/services/ruleset.service';
import { CharactersService } from '../../../core/services/characters.service';
import { User } from '../../../ng-chat/core/user';
import { ServiceUtil } from '../../../core/services/service-util';
import { DiceService } from '../../../core/services/dice.service';
import { CommandTile } from '../../../core/models/tiles/command-tile.model';
import { LinkRecordComponent } from '../../../characters/character-records/character-stats/link-record/link-record.component';
import { RulesetCharacterStatClusterTileComponent } from '../character-stat-cluster.component';
import { CharacterStatClusterTileService } from '../../../core/services/tiles/character-stat-cluster-tile.service';
import { RulesetDashboardPage } from '../../../core/models/view-models/ruleset-dashboard-page.model';

@Component({
  selector: 'app-edit-character-stat-cluster',
  templateUrl: './edit-character-stat-cluster.component.html',
  styleUrls: ['./edit-character-stat-cluster.component.scss']
})

export class EditRulesetCharacterStatClusterComponent implements OnInit {
  public event: EventEmitter<any> = new EventEmitter();
  STAT_TYPE = STAT_TYPE;
  rulesetId: number;

  CharacterStatClusterTile: any;
  title: string;
  ruleSet: any;
  tile: any;
  isLoading: boolean = false;
  pageId: number;
  pageDefaultData = new RulesetDashboardPage();

  isSharedLayout: boolean = false;

  options(placeholder?: string, initOnClick?: boolean): Object {
    //console.log(Utilities.optionsFloala(200, placeholder, initOnClick, true))
    return Utilities.optionsFloala(200, placeholder, initOnClick, true);
  }

  statLinkRecords: any = [];
  ConditionsValuesList: CharactersCharacterStat[] = [];
  CharacterStats: any;
  page: number = 1;
  pageSize: number = 999999;
  noRecordFound: boolean = false;
  CharacterStatListToDisplay: CharacterStats[] = [];
  CharacterStatListToDisplay_Old: CharacterStats[] = [];
  DefVal_STATTYPE = DefaultValue_STAT_TYPE;
  isMouseDown: boolean = false;
  interval: any;
  STAT_LINK_TYPE = STAT_LINK_TYPE;
  OpenSortOrder: boolean = false;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      //this.saveStat(this.CharacterStatTypeID);     
    }
  }

  constructor(
    private bsModalRef: BsModalRef, private alertService: AlertService, private sharedService: SharedService,
    private authService: AuthService, private modalService: BsModalService, private localStorage: LocalStoreManager,
    private characterStatService: CharacterStatService, private charactersService: CharactersService,
    private rulesetService: RulesetService, private clusterTileService: CharacterStatClusterTileService,
    private charactersCharacterStatService: CharactersCharacterStatService, private location: PlatformLocation) {
    location.onPopState(() => this.modalService.hide(1));
  }

  ngOnInit() {

    setTimeout(() => {

      if (this.rulesetId == undefined)
        this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      this.tile = this.bsModalRef.content.tile;
      this.CharacterStatClusterTile = this.tile.characterStatClusterTiles
      
      this.pageId = this.bsModalRef.content.pageId;
      this.pageDefaultData = this.bsModalRef.content.pageDefaultData;
      this.isSharedLayout = this.bsModalRef.content.isSharedLayout;
      this.CharacterStats = this.CharacterStatClusterTile.clusterCharactersCharacterStats ? this.CharacterStatClusterTile.clusterCharactersCharacterStats : [];
      this.Initialize();
    }, 0);
  }

  private Initialize() {

    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
     // this.isLoading = true;
      

      this.bindTile();


    }
    //this.charactersService.getCharactersById<any>(this.characterId)
    //  .subscribe(data => {
    //    this.character = data;
    //    //this.isLoading = false;
    //    this.setHeaderValues(this.character);
    //    this.rulesetId = data.ruleSet.ruleSetId
    //  }, error => {
    //    let Errors = Utilities.ErrorDetail("", error);
    //    if (Errors.sessionExpire) {
    //      this.authService.logout(true);
    //    }
    //  }, () => { });
    this.rulesetService.getRulesetById<any>(this.rulesetId)
      .subscribe(data => {
        this.ruleSet = data;
      }, error => {
        let Errors = Utilities.ErrorDetail("", error);
        if (Errors.sessionExpire) {
          this.authService.logout(true);
        }
      });
    //this.characterStatService.getCharacterStatTypeList<any[]>()
    //  .subscribe(
    //    data => {
    //      this.characterStatTypeList = data;

    //      this.characterStatTypeList.forEach((val) => {
    //        val.icon = this.characterStatService.getIcon(val.statTypeName);
    //      });
    //    },
    //    error => {
    //      console.log("Error: ", error);
    //    }, () => { });
  }

  bindTile() {
    debugger
    if (this.CharacterStatClusterTile.clusterWithSortOrder) {
      let ids = this.CharacterStatClusterTile.clusterWithSortOrder.split(',');

      ids.map((id) => {
        let charCharStat = this.CharacterStats.find(x => x.characterStatId == id);
        if (charCharStat) {
          this.CharacterStatListToDisplay.push(charCharStat);
        }

      });
      ///bind default values
      this.CharacterStatListToDisplay.map((cs:any) => {
        let characterStat:any = cs;
        let CharacterStatTypeID = characterStat.characterStatTypeId;        

        let defaultValue1 = '';
        let defaultValue2 = '';
        if (characterStat.characterStatDefaultValues) {
          if (characterStat.characterStatDefaultValues.length) {
            defaultValue1 = characterStat.characterStatDefaultValues[0].defaultValue ? characterStat.characterStatDefaultValues[0].defaultValue : '';
          }
          if (characterStat.characterStatDefaultValues.length > 1) {
            defaultValue2 = characterStat.characterStatDefaultValues[1].defaultValue ? characterStat.characterStatDefaultValues[1].defaultValue : '';
          }
        }

        switch (CharacterStatTypeID) {
          case STAT_TYPE.Text:
            cs.valText = defaultValue1//this.charactersCharacterStat.text;
            break;
          case STAT_TYPE.RichText:
            cs.valRichText = defaultValue1// this.charactersCharacterStat.richText;
            break;
          case STAT_TYPE.Number:
            cs.valNumber = defaultValue1//this.charactersCharacterStat.number.toString();
            cs.defValNumber = defaultValue2//this.charactersCharacterStat.number.toString();
            break;
          case STAT_TYPE.CurrentMax:
            let rescurrentMax: currentMax = { current: defaultValue1.toString(), max: defaultValue2.toString() };
            cs.valCurrentMax = Object.assign({}, rescurrentMax);
            cs.defValCurrentMax = Object.assign({}, rescurrentMax);
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
            cs.valValueSubValue = Object.assign({}, resvalSubVal);
            cs.defValValueSubValue = Object.assign({}, resvalSubVal);
            break;
          
          case STAT_TYPE.Calculation:
            cs.valCalculationResult = "";//this.charactersCharacterStat.calculationResult.toString();
            cs.valCalculationFormula = characterStat.characterStatCalcs.length ? characterStat.characterStatCalcs[0].statCalculation : '' ;
            break;
          case STAT_TYPE.Command:
            cs.valCommand = defaultValue1;
            break;
          case STAT_TYPE.Toggle:
            cs.valToggle = defaultValue1;
            break;
          case STAT_TYPE.Combo:
            let defaultValueNum = '';
            let defaultValueText = '';
            if (characterStat.characterStatCombos) {

              defaultValueNum = characterStat.characterStatCombos.defaultValue;


              defaultValueText = characterStat.characterStatCombos.defaultText ? characterStat.characterStatCombos.defaultText : '';

            }
            cs.valNumber = defaultValueNum;
            cs.defValNumber = defaultValueNum;
            cs.valText = defaultValueText;
            break;
        }
      })
      ////////////////////////
      this.CharacterStatListToDisplay_Old = Object.assign([], this.CharacterStatListToDisplay);

    }

  }

  private getCalculationResult(value: string): number {
    try {
      if (value) {
        //value = value.
        return this.CharacterStats.map(x => {
          return { id: x.characterStatId, type: x.characterStatTypeViewModel.statTypeName, name: x.statName };
        }).filter(y => y.type == 'Number' || y.type.startsWith('Value') || y.type.startsWith('Current'));
      }
      else return 0;
    } catch (err) { return 0; }
  }



  get multichoiceSettings() {
    return {
      primaryKey: "statChoiceValue",
      labelKey: "statChoiceValue",
      text: "select choice(s)",
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: false,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: true,
      position: "bottom"
    };
  }
  get singlechoiceSettings() {
    return {
      primaryKey: "statChoiceValue",
      labelKey: "statChoiceValue",
      text: "select choice",
      enableCheckAll: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      singleSelection: true,
      limitSelection: false,
      enableSearchFilter: true,
      classes: "myclass custom-class ",
      showCheckbox: false,
      position: "bottom"
    };
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
  public inputValidator(event: any, id: any, type: any) {


    const pattern = /^[0-9]*$/g;
    let IsNegative: boolean = false;
    if (event.target.value.length) {
      if (event.target.value.charAt(0) === '-') {
        IsNegative = true;
      }
    }
    if (!pattern.test(event.target.value)) {
      if (event.target.value !== "-") {
        if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
          event.target.value = event.target.value.replace(/[^0-9]/g, "");
          if (IsNegative) {
            event.target.value = '-' + event.target.value;
            event.target.value = event.target.value.replace(/--/g, "-");
          }
        }
      }

      this.CharacterStats.forEach(function (val) {
        if (id === val.characterStatId) {

          if (type == "value") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.value = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "subvalue") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.subValue = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "current") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.current = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "maximum") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.maximum = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }

          }
          else if (type == "number") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.number = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "combo") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.defaultValue = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }
          else if (type == "choice") {
            if (event.target.value !== "-") {
              if (!(/^-?\d*\.?\d+$/g.test(event.target.value))) {
                val.defaultValue = event.target.value.replace(/[^0-9]/g, "")
              }
              if (IsNegative) {
                event.target.value = '-' + event.target.value;
                event.target.value = event.target.value.replace(/--/g, "-");
              }
            }
          }


        }
      })
    }
  }
  DefaultDefValueOnchange(event: any, characterstat: any, DefVal_STATTYPE: DefaultValue_STAT_TYPE) {
    if (characterstat.characterStat.characterStatDefaultValues.length) {
      let DefVal = new CharacterStatDefaultValue();
      switch (DefVal_STATTYPE) {
        case DefaultValue_STAT_TYPE.Number:
          DefVal = characterstat.characterStat.characterStatDefaultValues[0];
          break;
        case DefaultValue_STAT_TYPE.Current:
          DefVal = characterstat.characterStat.characterStatDefaultValues[0];
          break;
        case DefaultValue_STAT_TYPE.Max:
          DefVal = characterstat.characterStat.characterStatDefaultValues[1];
          break;
        case DefaultValue_STAT_TYPE.Value:
          DefVal = characterstat.characterStat.characterStatDefaultValues[0];
          break;
        case DefaultValue_STAT_TYPE.SubValue:
          DefVal = characterstat.characterStat.characterStatDefaultValues[1];
          break;
        case DefaultValue_STAT_TYPE.choice:
          DefVal = characterstat.characterStat.characterStatDefaultValues[0];
          break;
        default:
      }
      let defaultTextboxValue = event.target.value;
      try {
        DefVal.maximum = DefVal.maximum;
        if (isNaN(DefVal.maximum)) {
          DefVal.maximum = 0;
        }
      } catch (e) {
        DefVal.maximum = 0;
      }
      try {
        DefVal.minimum = DefVal.minimum;
        if (isNaN(DefVal.minimum)) {
          DefVal.minimum = 0;
        }
      } catch (e) {
        DefVal.minimum = 0;
      }
      if (+DefVal.minimum == 0 && +DefVal.maximum == 0) {
        //this.IsFormValid = true;
        event.target.classList.remove('textbox-error');
      }
      else if (+defaultTextboxValue >= +DefVal.minimum && +defaultTextboxValue <= +DefVal.maximum) {
        //this.IsFormValid = true;
        event.target.classList.remove('textbox-error');
      }
      else {
        //this.IsFormValid = false;
        event.target.classList.add('textbox-error');
        this.alertService.showMessage("The value for this field must be between " + DefVal.minimum + " and " + DefVal.maximum + " value", "", MessageSeverity.error);

      }
    }
  }
  mouseDown(eventtype, CharacterStatTypeID: number, charCharacterStat, type?: number) {
    let time = new Date();
    time.setMilliseconds(time.getMilliseconds() + 600); //600 miliseconds delay to start the numbering
    this.isMouseDown = true;
    this.interval = setInterval(() => {
      if (time < new Date()) {
        if (this.isMouseDown) {
          if (eventtype === -1)//Decrement
          {
            this.decrement(CharacterStatTypeID, charCharacterStat, type);
          }
          if (eventtype === 1)//Increment
          {
            this.increment(CharacterStatTypeID, charCharacterStat, type);
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
  increment(CharacterStatTypeID: number, charCharacterStat, type?: number) {

    let obj: any = charCharacterStat.characterStat;
    let DefaultValuesList: any = obj.characterStatDefaultValues;
    switch (CharacterStatTypeID) {
      case STAT_TYPE.Number:
        debugger
        let nummax = 0;
        let nummin = 0;
        charCharacterStat.number = charCharacterStat.number == null ? 0 : charCharacterStat.number;
        if (DefaultValuesList) {
          if (DefaultValuesList.length) {
            nummax = DefaultValuesList[0].maximum ? DefaultValuesList[0].maximum : 0;
            nummin = DefaultValuesList[0].minimum ? DefaultValuesList[0].minimum : 0;
          }
        }
        if (!(nummax == 0 && nummin == 0)) {
          if (parseInt(charCharacterStat.number) >= nummin && parseInt(charCharacterStat.number) < nummax) {
            charCharacterStat.number = (parseInt(charCharacterStat.number) + 1).toString();
          }
          else {
            charCharacterStat.number = (parseInt(charCharacterStat.number)).toString();
          }
        }
        else {
          charCharacterStat.number = (parseInt(charCharacterStat.number) + 1).toString();
        }

        //this.updateCharacterStat(type);
        break;
      case STAT_TYPE.CurrentMax:
        debugger
        charCharacterStat.current = charCharacterStat.current == null ? 0 : charCharacterStat.current;
        charCharacterStat.maximum = charCharacterStat.maximum == null ? 0 : charCharacterStat.maximum;
        if (type == 1) {
          let curmax = 0;
          let curmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              curmax = DefaultValuesList[0].maximum ? DefaultValuesList[0].maximum : 0;
              curmin = DefaultValuesList[0].minimum ? DefaultValuesList[0].minimum : 0;
            }
          }
          if (!(curmax == 0 && curmin == 0)) {
            if (parseInt(charCharacterStat.current) >= curmin && parseInt(charCharacterStat.current) < curmax) {
              charCharacterStat.current = (parseInt(charCharacterStat.current) + 1).toString();
            }
            else {
              charCharacterStat.current = (parseInt(charCharacterStat.current)).toString();
            }
          }
          else {
            charCharacterStat.current = (parseInt(charCharacterStat.current) + 1).toString();
          }
          //this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) + 1).toString() });
        }
        else if (type == 2) {
          let maxmax = 0;
          let maxmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              maxmax = DefaultValuesList[1].maximum ? DefaultValuesList[1].maximum : 0;;
              maxmin = DefaultValuesList[1].minimum ? DefaultValuesList[1].minimum : 0;;
            }
          }
          if (!(maxmax == 0 && maxmin == 0)) {
            if (parseInt(charCharacterStat.maximum) >= maxmin && parseInt(charCharacterStat.maximum) < maxmax) {
              charCharacterStat.maximum = (parseInt(charCharacterStat.maximum) + 1).toString();
            }
            else {
              charCharacterStat.maximum = (parseInt(charCharacterStat.maximum)).toString();
            }
          }
          else {
            charCharacterStat.maximum = (parseInt(charCharacterStat.maximum) + 1).toString();
          }
          // this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) + 1).toString() });
        }
        //this.updateCharacterStat(type);
        break;
      case STAT_TYPE.ValueSubValue:
        charCharacterStat.value = charCharacterStat.value == null ? 0 : charCharacterStat.value;
        charCharacterStat.subValue = charCharacterStat.subValue == null ? 0 : charCharacterStat.subValue;
        if (type == 1) {
          let valmax = 0;
          let valmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              valmax = DefaultValuesList[0].maximum ? DefaultValuesList[0].maximum : 0;
              valmin = DefaultValuesList[0].minimum ? DefaultValuesList[0].minimum : 0;
            }
          }

          if (!(valmax == 0 && valmin == 0)) {
            if (parseInt(charCharacterStat.value) >= valmin && parseInt(charCharacterStat.value) < valmax) {
              charCharacterStat.value = (parseInt(charCharacterStat.value) + 1).toString();
            }
            else {
              charCharacterStat.value = (parseInt(charCharacterStat.value)).toString();
            }
          }
          else {
            charCharacterStat.value = (parseInt(charCharacterStat.value) + 1).toString();
          }
          //this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) + 1).toString() });
        }
        else if (type == 2) {
          let submax = 0;
          let submin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              submax = DefaultValuesList[1].maximum ? DefaultValuesList[1].maximum : 0;
              submin = DefaultValuesList[1].minimum ? DefaultValuesList[1].maximum : 0;
            }
          }
          if (!(submax == 0 && submin == 0)) {
            if (parseInt(charCharacterStat.subValue) >= submin && parseInt(charCharacterStat.subValue) < submax) {
              charCharacterStat.subValue = (parseInt(charCharacterStat.subValue) + 1).toString();
            }
            else {
              charCharacterStat.subValue = (parseInt(charCharacterStat.subValue)).toString();
            }
          }
          else {
            charCharacterStat.subValue = (parseInt(charCharacterStat.subValue) + 1).toString();
          }
          //this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) + 1).toString() });
        }
        //this.updateCharacterStat(type);
        break;
      case STAT_TYPE.Combo:
        charCharacterStat.defaultValue = charCharacterStat.defaultValue == null ? 0 : charCharacterStat.defaultValue;
        let max = charCharacterStat.maximum ? charCharacterStat.maximum : 0;
        let min = charCharacterStat.minimum ? charCharacterStat.minimum : 0;
        if (!(max == 0 && min == 0)) {
          if (parseInt(charCharacterStat.defaultValue) >= min && parseInt(charCharacterStat.defaultValue) < max) {
            charCharacterStat.defaultValue = (parseInt(charCharacterStat.defaultValue) + 1).toString();
          }
          else {
            charCharacterStat.defaultValue = (parseInt(charCharacterStat.defaultValue)).toString();
          }
        }
        else {
          charCharacterStat.defaultValue = (parseInt(charCharacterStat.defaultValue) + 1).toString();
        }
        break;
      case STAT_TYPE.Choice:
        let choicemax = 0;
        let choicemin = 0;
        charCharacterStat.number = charCharacterStat.number == null ? 0 : charCharacterStat.number;
        if (DefaultValuesList) {
          if (DefaultValuesList.length) {
            choicemax = DefaultValuesList[0].maximum ? DefaultValuesList[0].maximum : 0;
            choicemin = DefaultValuesList[0].minimum ? DefaultValuesList[0].minimum : 0;
          }
        }
        if (!(choicemax == 0 && choicemin == 0)) {
          if (parseInt(charCharacterStat.number) >= choicemin && parseInt(charCharacterStat.number) < choicemax) {
            charCharacterStat.number = (parseInt(charCharacterStat.number) + 1).toString();
          }
          else {
            charCharacterStat.number = (parseInt(charCharacterStat.number)).toString();
          }
        }
        else {
          charCharacterStat.number = (parseInt(charCharacterStat.number) + 1).toString();
        }

        //this.updateCharacterStat(type);
        break;
    }
  }

  decrement(CharacterStatTypeID: number, charCharacterStat, type?: number) {
    let obj: any = charCharacterStat.characterStat;
    let DefaultValuesList: any = obj.characterStatDefaultValues;

    switch (CharacterStatTypeID) {
      case STAT_TYPE.Number:
        charCharacterStat.number = charCharacterStat.number == null ? 0 : charCharacterStat.number;
        let nummax = 0;
        let nummin = 0;
        if (DefaultValuesList) {
          if (DefaultValuesList.length) {
            nummax = DefaultValuesList[0].maximum ? DefaultValuesList[0].maximum : 0;
            nummin = DefaultValuesList[0].minimum ? DefaultValuesList[0].minimum : 0;
          }
        }
        if (!(nummax == 0 && nummin == 0)) {
          if (parseInt(charCharacterStat.number) > nummin && parseInt(charCharacterStat.number) <= nummax) {
            charCharacterStat.number = (parseInt(charCharacterStat.number) - 1).toString();
          }
          else {
            charCharacterStat.number = (parseInt(charCharacterStat.number)).toString();
          }
        }
        else {
          charCharacterStat.number = (parseInt(charCharacterStat.number) - 1).toString();
        }
        //this.valNumber = (parseInt(this.valNumber) - 1).toString();
        //this.updateCharacterStat(type);
        break;
      case STAT_TYPE.CurrentMax:
        charCharacterStat.current = charCharacterStat.current == null ? 0 : charCharacterStat.current;
        charCharacterStat.maximum = charCharacterStat.maximum == null ? 0 : charCharacterStat.maximum;
        if (type == 1) {
          let curmax = 0;
          let curmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              curmax = DefaultValuesList[0].maximum ? DefaultValuesList[0].maximum : 0;
              curmin = DefaultValuesList[0].minimum ? DefaultValuesList[0].minimum : 0;
            }
          }
          if (!(curmax == 0 && curmin == 0)) {
            if (parseInt(charCharacterStat.current) > curmin && parseInt(charCharacterStat.current) <= curmax) {
              charCharacterStat.current = (parseInt(charCharacterStat.current) - 1).toString();
            }
            else {
              charCharacterStat.current = (parseInt(charCharacterStat.current)).toString();
            }
          }
          else {
            charCharacterStat.current = (parseInt(charCharacterStat.current) - 1).toString();
          }
          //this.valCurrentMax = Object.assign(this.valCurrentMax, { current: (parseInt(this.valCurrentMax.current) - 1).toString() });
        }
        else if (type == 2) {
          let maxmax = 0;
          let maxmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              maxmax = DefaultValuesList[1].maximum ? DefaultValuesList[1].maximum : 0;
              maxmin = DefaultValuesList[1].minimum ? DefaultValuesList[1].minimum : 0;
            }
          }
          if (!(maxmax == 0 && maxmin == 0)) {
            if (parseInt(charCharacterStat.maximum) > maxmin && parseInt(charCharacterStat.maximum) <= maxmax) {
              charCharacterStat.maximum = (parseInt(charCharacterStat.maximum) - 1).toString();
            }
            else {
              charCharacterStat.maximum = (parseInt(charCharacterStat.maximum)).toString();
            }
          }
          else {
            charCharacterStat.maximum = (parseInt(charCharacterStat.maximum) - 1).toString();
          }
          // this.valCurrentMax = Object.assign(this.valCurrentMax, { max: (parseInt(this.valCurrentMax.max) - 1).toString() });
        }
        //this.updateCharacterStat(type);
        break;
      case STAT_TYPE.ValueSubValue:
        charCharacterStat.value = charCharacterStat.value == null ? 0 : charCharacterStat.value;
        charCharacterStat.subValue = charCharacterStat.subValue == null ? 0 : charCharacterStat.subValue;
        if (type == 1) {
          let valmax = 0;
          let valmin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              valmax = DefaultValuesList[0].maximum ? DefaultValuesList[0].maximum : 0;
              valmin = DefaultValuesList[0].minimum ? DefaultValuesList[0].minimum : 0;
            }
          }
          if (!(valmax == 0 && valmin == 0)) {
            if (parseInt(charCharacterStat.value) > valmin && parseInt(charCharacterStat.value) <= valmax) {
              charCharacterStat.value = (parseInt(charCharacterStat.value) - 1).toString();
            }
            else {
              charCharacterStat.value = (parseInt(charCharacterStat.value)).toString();
            }
          }
          else {
            charCharacterStat.value = (parseInt(charCharacterStat.value) - 1).toString();
          }
          // this.valValueSubValue = Object.assign(this.valValueSubValue, { value: (parseInt(this.valValueSubValue.value) - 1).toString() });
        }
        else if (type == 2) {
          let submax = 0;
          let submin = 0;
          if (DefaultValuesList) {
            if (DefaultValuesList.length) {
              submax = DefaultValuesList[1].maximum ? DefaultValuesList[1].maximum : 0;
              submin = DefaultValuesList[1].minimum ? DefaultValuesList[1].minimum : 0;
            }
          }
          if (!(submax == 0 && submin == 0)) {
            if (parseInt(charCharacterStat.subValue) > submin && parseInt(charCharacterStat.subValue) <= submax) {
              charCharacterStat.subValue = (parseInt(charCharacterStat.subValue) - 1).toString();
            }
            else {
              charCharacterStat.subValue = (parseInt(charCharacterStat.subValue)).toString();
            }
          }
          else {
            charCharacterStat.subValue = (parseInt(charCharacterStat.subValue) - 1).toString();
          }
          //this.valValueSubValue = Object.assign(this.valValueSubValue, { subValue: (parseInt(this.valValueSubValue.subValue) - 1).toString() });
        }
        //this.updateCharacterStat(type);
        break;
      case STAT_TYPE.Combo:
        debugger
        charCharacterStat.defaultValue = charCharacterStat.defaultValue == null ? 0 : charCharacterStat.defaultValue;
        let max = charCharacterStat.maximum;
        let min = charCharacterStat.minimum;
        if (!(max == 0 && min == 0)) {
          if (parseInt(charCharacterStat.defaultValue) > min && parseInt(charCharacterStat.defaultValue) <= max) {
            charCharacterStat.defaultValue = (parseInt(charCharacterStat.defaultValue) - 1).toString();
          }
          else {
            charCharacterStat.defaultValue = (parseInt(charCharacterStat.defaultValue)).toString();
          }
        }
        else {
          charCharacterStat.defaultValue = (parseInt(charCharacterStat.defaultValue) - 1).toString();
        }
        break;
      case STAT_TYPE.Choice:
        charCharacterStat.number = charCharacterStat.number == null ? 0 : charCharacterStat.number;
        let choicemax = 0;
        let choicemin = 0;
        if (DefaultValuesList) {
          if (DefaultValuesList.length) {
            choicemax = DefaultValuesList[0].maximum ? DefaultValuesList[0].maximum : 0;
            choicemin = DefaultValuesList[0].minimum?DefaultValuesList[0].minimum: 0;
          }
        }
        if (!(choicemax == 0 && choicemin == 0)) {
          if (parseInt(charCharacterStat.number) > choicemin && parseInt(charCharacterStat.number) <= choicemax) {
            charCharacterStat.number = (parseInt(charCharacterStat.number) - 1).toString();
          }
          else {
            charCharacterStat.number = (parseInt(charCharacterStat.number)).toString();
          }
        }
        else {
          charCharacterStat.number = (parseInt(charCharacterStat.number) - 1).toString();
        }
        //this.valNumber = (parseInt(this.valNumber) - 1).toString();
        //this.updateCharacterStat(type);
        break;
    }
  }
  //diceRoll(command) {
  //  let commandTile = new CommandTile();
  //   commandTile.command= command ;

  //  this.bsModalRef = this.modalService.show(DiceRollComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = "Dice";
  //  this.bsModalRef.content.characterId = this.characterId;
  //  this.bsModalRef.content.character = this.character;   
  //  this.bsModalRef.content.recordName = this.character.characterName;
  //  this.bsModalRef.content.recordImage = this.character.imageUrl;
  //  this.bsModalRef.content.tile = TILES.COMMAND;
  //  this.bsModalRef.content.commandTile = commandTile

  //}
  selectYesNo(filterVal: any, characterstatId: number) {
    
    this.CharacterStats.forEach(function (val) {
      if (characterstatId === val.characterStatId) {
        val.yesNo = filterVal;
      }
    })
  }
  selectIsYesNo(filterVal: any, characterstatId: number) {
    //this.isModelChange = true;
    this.CharacterStats.forEach(function (val) {
      if (characterstatId === val.characterStatId) {
        val.isYes = filterVal;
      }
    })
  }
  selectDisplay(filterVal: any, characterstatId: number) {
   // this.isModelChange = true;
    this.CharacterStats.forEach(function (val) {
      if (characterstatId === val.characterStatId) {
        //val.showCheckbox = filterVal;
        val.showCheckbox = !val.showCheckbox;
      }
    })
  }
  selectOnOff(filterVal: any, characterstatId: number) {
    //this.isModelChange = true;
    this.CharacterStats.forEach(function (val) {
      if (characterstatId === val.characterStatId) {
        val.onOff = filterVal;
      }
    })
  }
  selectIsOnOff(filterVal: any, characterstatId: number) {
   // this.isModelChange = true;
    this.CharacterStats.forEach(function (val) {
      if (characterstatId === val.characterStatId) {
        val.isOn = filterVal;
      }
    })
  }
  //linkRecordToStat(characterstat: CharactersCharacterStat) {
  //  this.bsModalRef = this.modalService.show(LinkRecordComponent, {
  //    class: 'modal-primary modal-md',
  //    ignoreBackdropClick: true,
  //    keyboard: false
  //  });
  //  this.bsModalRef.content.title = "Edit Link Tile";
  //  this.bsModalRef.content.characterId = this.characterId;
  //  this.bsModalRef.content.ruleSet = this.ruleSet;
  //  this.bsModalRef.content.title = "Link Record";
  //  this.bsModalRef.content.isFromClusterTile = true;
  //  this.bsModalRef.content.characterstat = Object.assign({}, characterstat);
  //  this.bsModalRef.content.event.subscribe(data => {
  //    debugger
  //    switch (data.type) {
  //      case STAT_LINK_TYPE.ITEM:
  //        characterstat.linkType = STAT_LINK_TYPE.ITEM;
  //        characterstat.defaultValue = data.item.itemId;
  //        //this.isModelChange = true;
  //        break;
  //      case STAT_LINK_TYPE.SPELL:
  //        characterstat.linkType = STAT_LINK_TYPE.SPELL;
  //        characterstat.defaultValue = data.spell.characterSpellId;
  //        //this.isModelChange = true;
  //        break;
  //      case STAT_LINK_TYPE.ABILITY:
  //        characterstat.linkType = STAT_LINK_TYPE.ABILITY;
  //        characterstat.defaultValue = data.ability.characterAbilityId;
  //        //this.isModelChange = true;
  //        break;
  //      case STAT_LINK_TYPE.BUFFANDEFFECT:
  //        characterstat.linkType = STAT_LINK_TYPE.BUFFANDEFFECT;
  //        characterstat.defaultValue = data.buffAndEffect.characterBuffAndEffectId;
  //       // this.isModelChange = true;
  //        break;
  //      case '':
  //        characterstat.linkType = null;
  //        characterstat.defaultValue = 0;
  //        //this.isModelChange = true;
  //        break;
  //      default:
  //    }

  //  });
  //}
  GetLinkRecordImage(id, linkType) {

    let imagePath = '';
    if (this.statLinkRecords) {
      if (this.statLinkRecords.length) {
        if (this.statLinkRecords.length > 0) {
          this.statLinkRecords.map((link) => {
            if (link.id == id && link.type == linkType) {
              imagePath = link.image;
            }
          })
        }
      }
    }
    if (imagePath == '') {
      switch (linkType) {
        case STAT_LINK_TYPE.ITEM:
          imagePath = '../assets/images/DefaultImages/Item.jpg';
          break;
        case STAT_LINK_TYPE.SPELL:
          imagePath = '../assets/images/DefaultImages/Spell.jpg';
          break;
        case STAT_LINK_TYPE.ABILITY:
          imagePath = '../assets/images/DefaultImages/ability.jpg';
          break;

        default:
          imagePath = 'https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png';
          break;
      }
    }
    return imagePath;
  }
  GetLinkRecordName(id, linkType) {

    let name = '';
    if (this.statLinkRecords) {
      if (this.statLinkRecords.length) {
        if (this.statLinkRecords.length > 0) {
          this.statLinkRecords.map((link) => {
            if (link.id == id && link.type == linkType) {
              name = link.name;
            }
          })
        }
      }
    }
    return name;

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
      this.bsModalRef.content.ruleset = this.ruleSet;
      this.bsModalRef.content.showDetailsByDefault = true;
      this.bsModalRef.content.numberToAdd = numberToAdd;
      this.bsModalRef.content.isFromCampaignDetail = true;

      //this.bsModalRef.content.event.subscribe(result => {
      //  if (typeId === STAT_TYPE.Number) {
      //    //this.valNumber = +this.valNumber + result;
      //  }
      //  else if (typeId === STAT_TYPE.ValueSubValue) {
      //    if (type === 1)
      //      this.valValueSubValue.value = +this.valValueSubValue.value + result;
      //    else if (type === 2)
      //      this.valValueSubValue.subValue = +this.valValueSubValue.subValue + result;
      //  }
      //});
    }
  }
  editTile() {
    this.close();
    this.bsModalRef = this.modalService.show(RulesetCharacterStatClusterTileComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Edit Character Stat Cluster Tile";
    this.bsModalRef.content.tile = this.tile;
    this.bsModalRef.content.rulesetId = this.rulesetId;
    this.bsModalRef.content.pageId = this.pageId;
    this.bsModalRef.content.pageDefaultData = this.pageDefaultData;
    this.bsModalRef.content.view = VIEW.EDIT;    
  }
  ShowSortOrderScreen() {
    this.OpenSortOrder = true;
  }
  upclick(index) {
    if (index == 0) {
      return;
    }
    [this.CharacterStatListToDisplay[index], this.CharacterStatListToDisplay[index - 1]] = [this.CharacterStatListToDisplay[index - 1], this.CharacterStatListToDisplay[index]];
  }

  downclick(index) {
    if (index === this.CharacterStatListToDisplay.length - 1) {
      return;
    }
    [this.CharacterStatListToDisplay[index], this.CharacterStatListToDisplay[index + 1]] = [this.CharacterStatListToDisplay[index + 1], this.CharacterStatListToDisplay[index]];
  }
  closeSortOrder() {
    this.OpenSortOrder = false;
    this.CharacterStatListToDisplay =Object.assign([],this.CharacterStatListToDisplay_Old);
  }
  saveSortOrder() {
    //save sortorder...
    
    let selectedStats = this.CharacterStatListToDisplay;
    let selectedStatIds = [];
    selectedStats.map((s) => {
      selectedStatIds.push(s.characterStatId);
    })
    let newSortedIds: string = selectedStatIds.join(',');
    this.isLoading = true;
    let characterClusterTileId: number = this.CharacterStatClusterTile.characterStatClusterTileId;
    this.clusterTileService.updateRulesetSortOrder(characterClusterTileId, newSortedIds)
      .subscribe(
      data => {
        this.CharacterStatClusterTile.clusterWithSortOrder = newSortedIds;
          // console.log(data);
          this.isLoading = false;
          this.OpenSortOrder = false;
          this.CharacterStatListToDisplay_Old = Object.assign([], this.CharacterStatListToDisplay);
        },
        error => {
          console.log(error);
          this.isLoading = false;          
        },
      );
    
  }
  //save(characterstats: any, redirectto: any) {
  //  debugger
  //  //if (redirectto == 99) {
  //  //  this.isLoading = true;
  //  //  }
  //  let valid = true;
  //  characterstats.map((cs) => {
  //    if (cs.characterStat.characterStatTypeId == STAT_TYPE.Combo) {
  //      if (!(+cs.minimum == 0 && +cs.maximum == 0)) {
  //        if (!(+cs.defaultValue >= +cs.minimum && +cs.defaultValue <= +cs.maximum)) {
  //          valid = false;
  //        }
  //      }
  //    }
  //    if (cs.characterStat.characterStatTypeId == STAT_TYPE.Number || cs.characterStat.characterStatTypeId == STAT_TYPE.CurrentMax ||
  //      cs.characterStat.characterStatTypeId == STAT_TYPE.ValueSubValue) {
  //      if (cs.characterStat.characterStatDefaultValues.length) {
  //        switch (cs.characterStat.characterStatTypeId) {
  //          case STAT_TYPE.Number:
  //            let defval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[0];
  //            if (!(+defval.minimum == 0 && +defval.maximum == 0)) {
  //              if (!(+cs.number >= +defval.minimum && +cs.number <= +defval.maximum)) {
  //                valid = false;
  //              }
  //            }
  //            break;
  //          case STAT_TYPE.CurrentMax:
  //            let CurDefval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[0];
  //            if (!(+CurDefval.minimum == 0 && +CurDefval.maximum == 0)) {
  //              if (!(+cs.current >= +CurDefval.minimum && +cs.current <= +CurDefval.maximum)) {
  //                valid = false;
  //              }
  //            }
  //            let MaxDefval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[1];
  //            if (!(+MaxDefval.minimum == 0 && +MaxDefval.maximum == 0)) {
  //              if (!(+cs.maximum >= +MaxDefval.minimum && +cs.maximum <= +MaxDefval.maximum)) {
  //                valid = false;
  //              }
  //            }
  //            break;
  //          case STAT_TYPE.ValueSubValue:

  //            let ValDefval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[0];
  //            if (!(+ValDefval.minimum == 0 && +ValDefval.maximum == 0)) {
  //              if (!(+cs.value >= +ValDefval.minimum && +cs.value <= +ValDefval.maximum)) {
  //                valid = false;
  //              }
  //            }
  //            let SubDefval: CharacterStatDefaultValue = cs.characterStat.characterStatDefaultValues[1];
  //            if (!(+SubDefval.minimum == 0 && +SubDefval.maximum == 0)) {
  //              if (!(+cs.subValue >= +SubDefval.minimum && +cs.subValue <= +SubDefval.maximum)) {
  //                valid = false;
  //              }
  //            }
  //            break;


  //          default:
  //        }
  //      }

  //    }
  //  })
  //  if (!valid) {
  //    //alert('falseff')
  //    this.alertService.showMessage("", "Please fill the correct values.", MessageSeverity.error);
  //    return false;
  //  }

  //  let _msg = "Updating Character Stat Cluster";
  //  this.isLoading = true;

  //  this.alertService.startLoadingMessage("", _msg);
  //  //if (redirectto != 99) {
  //  //  this.alertService.startLoadingMessage("", _msg);
  //  //}


  //  characterstats.forEach(item => {

  //    if (item.current == "") {
  //      item.current = 0;
  //    }

  //    if (item.maximum == "") {
  //      item.maximum = 0;
  //    }

  //    if (item.value == "") {
  //      item.value = 0;
  //    }

  //    if (item.subValue == "") {
  //      item.subValue = 0;
  //    }

  //    if (item.characterStat.characterStatType.statTypeName == "Choice" && item.characterStat.isMultiSelect == true) {

  //      item.multiChoice = "";
  //      item.selectedCharacterChoices.forEach(item2 => {
  //        item.multiChoice = item.multiChoice + item2.characterStatChoiceId + ';'
  //      });

  //      if (item.multiChoice != null && item.multiChoice != '')
  //        item.multiChoice = item.multiChoice.slice(0, -1);
  //    }

  //    if (item.characterStat.characterStatType.statTypeName == "Choice" && item.characterStat.isMultiSelect == false) {

  //      item.choice = "";
  //      item.selectedCharacterChoices.forEach(item2 => {
  //        item.choice = item.choice + item2.characterStatChoiceId + ';'
  //      });

  //      if (item.choice != null && item.choice != '')
  //        item.choice = item.choice.slice(0, -1);
  //    }

  //    if (item.characterStat.characterStatType.statTypeName == "Command") {
  //      if (item.displaycommand != null && item.displaycommand != "")
  //        item.command = item.displaycommand;//this.manageCommandSave(item.displaycommand);

  //      //alert(item.displaycommand);
  //    }

  //    if (item.characterStat.characterStatType.statTypeName == "Calculation") {

  //      // item.calculationResult =
  //      if (item.characterStat.characterStatCalcs.length) {
  //        let finalCalcString = '';
  //        if (item.characterStat.characterStatCalcs[0].statCalculation != null && item.characterStat.characterStatCalcs[0].statCalculation != undefined) {
  //          item.displayCalculation = item.characterStat.characterStatCalcs[0].statCalculation;
  //          let IDs: any[] = [];
  //          let CalcString = item.characterStat.characterStatCalcs[0].statCalculationIds;
  //          if (item.characterStat.characterStatCalcs[0].statCalculationIds) {
  //            item.characterStat.characterStatCalcs[0].statCalculationIds.split(/\[(.*?)\]/g).map((rec) => {

  //              let id = ''; let flag = false; let type = 0; let statType = 0;
  //              if (rec.split('_').length > 1) {
  //                id = rec.split('_')[0].replace('[', '').replace(']', '');
  //                type = parseInt(rec.split('_')[1])
  //              }
  //              else {
  //                id = rec.replace('[', '').replace(']', '');
  //                type = 0
  //              }
  //              this.charactersCharacterStats.map((q) => {
  //                if (!flag) {
  //                  flag = (parseInt(id) == q.characterStatId);
  //                  statType = q.characterStat.characterStatTypeId
  //                }
  //              })
  //              if (flag) {
  //                IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
  //              }
  //              else if (+id == -1) {
  //                IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
  //              }
  //            })
  //          }
  //          IDs.map((rec) => {
  //            if (+rec.id == -1 && this.character.inventoryWeight) {
  //              CalcString = CalcString.replace(rec.originaltext, this.character.inventoryWeight);
  //            } else {
  //              this.charactersCharacterStats.map((stat) => {
  //                if (rec.id == stat.characterStatId) {
  //                  let num = 0;
  //                  switch (rec.statType) {
  //                    case 3: //Number
  //                      num = stat.number
  //                      break;
  //                    case 5: //Current Max
  //                      if (rec.type == 1)//current
  //                      {
  //                        num = stat.current
  //                      }
  //                      else if (rec.type == 2)//Max
  //                      {
  //                        num = stat.maximum
  //                      }
  //                      break;
  //                    case 7: //Val Sub-Val
  //                      if (rec.type == 3)//value
  //                      {
  //                        num = +stat.value
  //                      }
  //                      else if (rec.type == 4)//sub-value
  //                      {
  //                        num = stat.subValue
  //                      }
  //                      break;
  //                    case 12: //Calculation
  //                      num = stat.calculationResult
  //                      break;
  //                    case STAT_TYPE.Combo: //Combo
  //                      num = stat.defaultValue
  //                      break;
  //                    case STAT_TYPE.Choice: //Choice
  //                      num = stat.defaultValue
  //                      break;
  //                    case STAT_TYPE.Condition: //condition
  //                      let characterStatConditionsfilter = this.ConditionsValuesList.filter((CCS) => CCS.characterStat.characterStatId == rec.id);
  //                      let characterStatConditions = characterStatConditionsfilter["0"].characterStat.characterStatConditions;
  //                      let result = ServiceUtil.conditionStat(characterStatConditionsfilter["0"], this.character, this.ConditionsValuesList);
  //                      num = +result;
  //                      break;
  //                    default:
  //                      break;
  //                  }
  //                  if (num)
  //                    CalcString = CalcString.replace(rec.originaltext, num);
  //                  //else
  //                  //CalcString = CalcString.replace(rec.originaltext, 0);
  //                  //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
  //                }

  //              });
  //            }
  //            finalCalcString = CalcString;
  //          });
  //        }
  //        try {
  //          finalCalcString = (finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '+ 0' ||
  //            finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '- 0' ||
  //            finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '* 0' ||
  //            finalCalcString.trim().substr(finalCalcString.trim().length - 1) == '/ 0')
  //            ? finalCalcString.trim().slice(0, -1)
  //            : finalCalcString.trim();
  //          item.calculationResult = DiceService.commandInterpretation(finalCalcString, undefined, undefined)[0].calculationResult;
  //        }
  //        catch (ex) {
  //          item.calculationResult = this.getCalculationResult(item.characterStat.characterStatCalcs[0].statCalculation);
  //        }
  //        if (isNaN(item.calculationResult)) {
  //          item.calculationResult = 0;
  //        }
  //      }
  //    }

  //    if (item.characterStat.characterStatTypeId == STAT_TYPE.Condition) {

  //      let result = '';
  //      if (item.characterStat.characterStatConditions) {

  //        if (item.characterStat.characterStatConditions.length) {
  //          let SkipNextEntries: boolean = false;
  //          item.characterStat.characterStatConditions.map((Condition: CharacterStatConditionViewModel) => {
  //            if (!SkipNextEntries) {
  //              //let ConditionStatValue: string = this.GetValueFromStatsByStatID(Condition.ifClauseStatId, Condition.ifClauseStattype);

  //              let ConditionStatValue: string = '';
  //              if (Condition.ifClauseStatText) {
  //                ConditionStatValue = ServiceUtil.GetClaculatedValuesOfConditionStats(this.character.inventoryWeight, this.ConditionsValuesList, Condition, false);
  //              }
  //              let operator = "";
  //              let ValueToCompare = ServiceUtil.GetClaculatedValuesOfConditionStats(this.character.inventoryWeight, this.ConditionsValuesList, Condition, true);//Condition.compareValue;

  //              let ConditionTrueResult = Condition.result;


  //              if (Condition.sortOrder != item.characterStat.characterStatConditions.length) {//if and Else If Part
  //                if (Condition.conditionOperator) {
  //                  //////////////////////////////////////////////////////////////////

  //                  if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUALS ||
  //                    Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.NOT_EQUALS ||
  //                    Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.GREATER_THAN ||
  //                    Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_GREATER_THAN ||
  //                    Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.LESS_THAN ||
  //                    Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.EQUAL_TO_OR_LESS_THAN) {

  //                    operator = Condition.conditionOperator.symbol;
  //                    let ConditionCheckString = '';
  //                    if (Condition.isNumeric) {
  //                      ConditionStatValue = ConditionStatValue ? ConditionStatValue : "0";
  //                      ValueToCompare = ValueToCompare ? ValueToCompare : "0";
  //                      ConditionCheckString = ConditionStatValue + ' ' + operator + ' ' + ValueToCompare;
  //                    }
  //                    else {
  //                      ConditionCheckString = ' "' + ConditionStatValue + '" ' + operator + ' "' + ValueToCompare + '" ';
  //                    }
  //                    ConditionCheckString = ConditionCheckString.toUpperCase();
  //                    let conditionCheck = eval(ConditionCheckString);
  //                    if ((typeof (conditionCheck)) == "boolean") {
  //                      if (conditionCheck) {
  //                        result = ConditionTrueResult;
  //                        SkipNextEntries = true;
  //                      }
  //                    }
  //                  }


  //                  else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_BLANK) {
  //                    if (!ConditionStatValue) {
  //                      result = ConditionTrueResult;
  //                      SkipNextEntries = true;
  //                    }
  //                  }
  //                  else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.IS_NOT_BLANK) {
  //                    if (ConditionStatValue) {
  //                      result = ConditionTrueResult;
  //                      SkipNextEntries = true;
  //                    }
  //                  }
  //                  //else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
  //                  //    ValueToCompare = ValueToCompare ? ValueToCompare : '';
  //                  //    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
  //                  //    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {

  //                  //        let choicesArr: any[] = ConditionStatValue.split(this.choiceArraySplitter);
  //                  //        choicesArr = choicesArr.map((z) => {
  //                  //            return z.toUpperCase();
  //                  //        })
  //                  //        if (choicesArr.indexOf(ValueToCompare.toUpperCase()) > -1) {
  //                  //            result = ConditionTrueResult;
  //                  //            SkipNextEntries = true;
  //                  //        }
  //                  //    }
  //                  //    else {
  //                  //        if (ConditionStatValue.toUpperCase() == ValueToCompare.toUpperCase()) {
  //                  //            result = ConditionTrueResult;
  //                  //            SkipNextEntries = true;
  //                  //        }
  //                  //    }
  //                  //}
  //                  //else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
  //                  //    ValueToCompare = ValueToCompare ? ValueToCompare : '';
  //                  //    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
  //                  //    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {

  //                  //        let choicesArr: any[] = ConditionStatValue.split(this.choiceArraySplitter);
  //                  //        choicesArr = choicesArr.map((z) => {
  //                  //            return z.toUpperCase();
  //                  //        })
  //                  //        if (choicesArr.indexOf(ValueToCompare.toUpperCase()) == -1) {
  //                  //            result = ConditionTrueResult;
  //                  //            SkipNextEntries = true;
  //                  //        }
  //                  //    }
  //                  //    else {
  //                  //        if (ConditionStatValue.toUpperCase() != ValueToCompare.toUpperCase()) {
  //                  //            result = ConditionTrueResult;
  //                  //            SkipNextEntries = true;
  //                  //        }
  //                  //    }
  //                  //}
  //                  else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.CONTAINS) {
  //                    ValueToCompare = ValueToCompare ? ValueToCompare : '';
  //                    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
  //                    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


  //                      if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
  //                        result = ConditionTrueResult;
  //                        SkipNextEntries = true;
  //                      }
  //                    }
  //                    else {
  //                      if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) > -1) {
  //                        result = ConditionTrueResult;
  //                        SkipNextEntries = true;
  //                      }
  //                    }
  //                  }
  //                  else if (Condition.conditionOperator.name == CONDITION_OPERATOR_ENUM.DOES_NOT_CONTAIN) {
  //                    ValueToCompare = ValueToCompare ? ValueToCompare : '';
  //                    ConditionStatValue = ConditionStatValue ? ConditionStatValue : '';
  //                    if (item.characterStat.isMultiSelect && item.characterStat.characterStatTypeId == STAT_TYPE.Choice) {


  //                      if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
  //                        result = ConditionTrueResult;
  //                        SkipNextEntries = true;
  //                      }
  //                    }
  //                    else {
  //                      if (ConditionStatValue.toUpperCase().indexOf(ValueToCompare.toUpperCase()) == -1) {
  //                        result = ConditionTrueResult;
  //                        SkipNextEntries = true;
  //                      }
  //                    }
  //                  }
  //                  //////////////////////////////////////////////////////////////////
  //                }
  //              }
  //              else {
  //                let ConditionFalseResult = Condition.result;
  //                result = ConditionFalseResult;
  //                SkipNextEntries = true;
  //              }
  //            }
  //          })
  //        }
  //      }
  //      item.text = result;
  //    }

  //  });

  //  this.charactersCharacterStatService.updateCharactersCharacterStatList(characterstats)
  //    .subscribe(
  //    data => {
  //      this.isLoading = false;
  //        this.alertService.stopLoadingMessage();
  //        let message = "Characters stat cluster has been updated successfully.";
  //        this.alertService.showMessage(message, "", MessageSeverity.success);
  //        //if (redirectto != 99) {
  //        //  this.alertService.showMessage(message, "", MessageSeverity.success);
  //        //}
  //        this.close();

          
  //      },
  //      error => {
  //        this.isLoading = false;
  //        this.alertService.stopLoadingMessage();
  //        let _message = "Unable to Update ";
  //        let Errors = Utilities.ErrorDetail(_message, error);
  //        if (Errors.sessionExpire) {
  //          //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
  //          this.authService.logout(true);
  //        }
  //        else
  //          this.alertService.showStickyMessage(Errors.summary, Errors.errorMessage, MessageSeverity.error, error);
  //      },
  //    );


  //  // this.router.navigate(['/character/dashboard', this.characterId]);
  //}
}
