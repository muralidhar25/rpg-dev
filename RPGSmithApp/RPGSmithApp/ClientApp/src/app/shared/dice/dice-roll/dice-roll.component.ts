import { Component, OnInit, HostListener, EventEmitter } from "@angular/core";
import 'rxjs/add/operator/switchMap';
import { Router } from "@angular/router";
import { BsModalService, BsModalRef, ModalDirective, TooltipModule } from 'ngx-bootstrap';
import { DiceService } from "../../../core/services/dice.service";
import { FATE_DICE, TILES, STAT_TYPE, DICE_ICON, DICE } from "../../../core/models/enums";
import { Characters } from "../../../core/models/view-models/characters.model";
import { CharacterCommand } from "../../../core/models/view-models/character-command.model";
import { DiceRoll } from "../../../core/models/view-models/dice-roll.model";
import { CustomDice, DiceTray, DefaultDice } from "../../../core/models/view-models/custome-dice.model";
import { LocalStoreManager } from "../../../core/common/local-store-manager.service";
import { AlertService, MessageSeverity } from "../../../core/common/alert.service";
import { CharactersCharacterStatService } from "../../../core/services/characters-character-stat.service";
import { CharactersService } from "../../../core/services/characters.service";
import { AuthService } from "../../../core/auth/auth.service";
import { SharedService } from "../../../core/services/shared.service";
import { CharacterCommandService } from "../../../core/services/character-command.service";
import { RulesetService } from "../../../core/services/ruleset.service";
import { DBkeys } from "../../../core/common/db-keys";
import { User } from "../../../core/models/user.model";
import { Utilities } from "../../../core/common/utilities";
import { CharacterLastCommand } from "../../../core/models/view-models/character-last-command.model";
import { DiceSaveComponent } from "../dice-save/dice-save.component";
import { NumericCharacterStatComponent } from "../../numeric-character-stats/numeric-character-stat.component";
import { PlatformLocation } from "@angular/common";
import { Observable } from "rxjs";


@Component({
  selector: "app-dice-roll",
  templateUrl: './dice-roll.component.html',
  styleUrls: ['./dice-roll.component.scss'],
  providers: [DiceService]
})

export class DiceRollComponent implements OnInit {

  FATE = FATE_DICE;
  isLoading = false;
  title: string;
  page: number = 1;
  pageSize: number = 20;
  activeCommand: number;
  activeAndCommand: number;
  limit: number = 3;
  limitText: string = "Show more";
  diceSection: boolean;
  rollSection: boolean;
  timeoutHandler: any;
  rulesetId: number;
  characterId: number;
  character: Characters = new Characters();
  mainCommandText: string = "";
  characterCommandModel: any = new CharacterCommand();
  characterCommandData: any;
  diceRollModel: any = new Array<DiceRoll>();
  diceRolledData: any = new Array<DiceRoll>();
  characterMultipleCommands: any = [];
  addModArray: any = [];
  loadingResult: boolean = false;
  charactersCharacterStats: any;
  isShowReroll: number = -1;
  standardDICE: any[] = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'];
  showDetailsByDefault: boolean = false;
  numberToAdd: number;
  showShowDiceBtn: boolean = false;
  isFromTile: boolean = false;  
  oldCommandSaved: string = undefined;
  private readonly AND_Error_Message: string = "Only 5 ‘AND’s allowed in one command string. Please update your command and try again.";
  private readonly COMMAND_Error = "Invalid Command. Please check the command string and try again.";
  private HasError: number;
  calculationStringArray: any = [];
  spinner: boolean = false;
  showTotal: boolean = true;
  statdetails: any;
  recordName: string;
  recordImage: string;
  recordType: string;
  recordId: string;
  diceNav: string;
  customDices: CustomDice[] = [];
  diceTray: DiceTray[] = [];
  defaultDices: DefaultDice[] = [];
  HideResult: boolean = false;
  cascadeDiceEffectCount: number = 0;
  cascadeDiceEffectCurrentCount: number = 0;
  cascadeDiceDisplayLength: number = 0;
  totalAndLimit = 6;
  //allCommandsWithText: string[] = [];
  //beforeResultText: string = '';
  //afterResultText: string = '';
  displayCurrentRollBtn: boolean = false;
  rollAgainBtnText: string = 'Roll Again';


  constructor(
    private router: Router, public modalService: BsModalService, private bsModalRef: BsModalRef, private alertService: AlertService,
    private charactersCharacterStatService: CharactersCharacterStatService, private charactersService: CharactersService,
    private localStorage: LocalStoreManager, private authService: AuthService, private sharedService: SharedService,
    private characterCommandService: CharacterCommandService, private _diceService: DiceService,
    private rulesetService: RulesetService

    , private location: PlatformLocation) {   
    location.onPopState(() => this.modalService.hide(1));
    this.diceSection = true;
    this.rollSection = false;
    this.sharedService.shouldUpdateDice().subscribe(serviceJson => {
      if (serviceJson) { this.Initialize(); }
    });
    this.sharedService.shouldUpdateCharactersCharacterStats().subscribe(sharedServiceJson => {
      if (sharedServiceJson) this.Initialize();
    });
  }
  getCharacter() {
    this.charactersService.getCharactersById<any>(this.characterId)
      .subscribe(data => {
        this.character = data;
        this.isLoading = false;
      }, error => {
        this.character = new Characters();
        this.isLoading = false;
      }, () => { });
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.rulesetId == undefined)
        this.rulesetId = this.localStorage.getDataObject<number>(DBkeys.RULESET_ID);

      console.log('this.bsModalRef', this.bsModalRef);
      this.showTotal = false;
      this.title = this.bsModalRef.content.title;
      this.characterId = this.bsModalRef.content.characterId;
      this.recordName = this.bsModalRef.content.recordName ? this.bsModalRef.content.recordName : '';
      this.recordImage = this.bsModalRef.content.recordImage ? this.bsModalRef.content.recordImage : '';
      this.recordType = this.bsModalRef.content.recordType ? this.bsModalRef.content.recordType : '';
      this.recordId = this.bsModalRef.content.recordId ? this.bsModalRef.content.recordId : '';

      this.diceRedirection();

      //this.character = this.bsModalRef.content.character;
      //if (this.character.lastCommandResult)
      //    this.calculationStringArray = DiceService.getCalculationStringArray(this.character.lastCommandResult);

      //this.character = undefined;
      this.charactersService.getCharactersById<any>(this.characterId)
        .subscribe(data => {
          this.character = data;          
          this.showTotal = true;
          try {
            if (this.character.lastCommandResult)
              this.calculationStringArray = DiceService.getCalculationStringArray(this.character.lastCommandResult);
          } catch (err) { }
        }, error => {
          this.character = new Characters();
        }, () => { });
      this.isLoading = true;
      this.diceRollModel = this.characterCommandService.DiceRollData(this.characterId);
      this.characterCommandModel = this.characterCommandService.commandModelData({ characterId: this.characterId, character: this.character }, "ADD");
      this.diceRolledData = this.characterCommandService.DiceRollData(this.characterId);

      this.isFromTile = this.bsModalRef.content.tile ? true : false;
     
      if (this.isFromTile) {
        this.rollSection = true;
        this.isLoading = true;
      }

      this.charactersService.getRuleset_charStats_ById<any>(this.rulesetId, this.characterId)
        .subscribe(data => {
          
          let model: any = data;
          this.statdetails = model.characterCharacterstats;
          this.customDices = model.customDices;
          
          this.customDices= DiceService.BindDeckCustomDices(this.customDices);
          this.diceTray = model.diceTray;
          this.defaultDices = model.defaultDices;
          let ruleset = model.ruleSet;
          if (this.diceTray)
            if (this.diceTray.length > 0) {
              this.diceRollModel = this.characterCommandService.DiceRollDataFromDiceTray(this.characterId, this.customDices, this.diceTray, this.defaultDices);
              this.diceRolledData = this.characterCommandService.DiceRollDataFromDiceTray(this.characterId, this.customDices, this.diceTray, this.defaultDices);
            }

          //for character tile & records
          if (this.isFromTile) {

            if (+this.bsModalRef.content.tile == TILES.EXECUTE) {
              let executeFormModel = this.bsModalRef.content.executeTile;
              let executeTile = executeFormModel.linkType == 'Spell' ? executeFormModel.spell.spell : executeFormModel.linkType == 'Ability' ? executeFormModel.ability.ability : executeFormModel.linkType == 'Item' ? executeFormModel.item : {};

              this.characterCommandModel.command = executeTile.command;
              this.onClickRoll(this.characterCommandModel, executeTile.command);
            }
            else if (+this.bsModalRef.content.tile == TILES.COMMAND) {            
              let commandTile = this.bsModalRef.content.commandTile;

              this.characterCommandModel.command = commandTile.command;
              this.onClickRoll(this.characterCommandModel, commandTile.command);
            }
            else if (+this.bsModalRef.content.tile == TILES.CHARACTERSTAT) {             
              let characterStatTile = this.bsModalRef.content.characterStatTile;

              this.characterCommandModel.command = characterStatTile.charactersCharacterStat.command;
              this.onClickRoll(this.characterCommandModel, this.characterCommandModel.command);
            }
            else if (+this.bsModalRef.content.tile == -1) {              
              this.numberToAdd = undefined;// this.bsModalRef.content.numberToAdd
              this.showShowDiceBtn = this.showDetailsByDefault = true;
            }
            else if (+this.bsModalRef.content.tile == -2) {              
              let command = this.bsModalRef.content.command;
              this.characterCommandModel.command = command;
              this.onClickRoll(this.characterCommandModel, command);
            }
            else if (+this.bsModalRef.content.tile == -3) {              
              //this.numberToAdd = this.bsModalRef.content.numberToAdd
              this.showShowDiceBtn = true;
              this.showDetailsByDefault = false;
              let old = ruleset.defaultDice; //this.character.lastCommand;
              this.oldCommandSaved = old;
              let command = '';
              if (!this.numberToAdd)
                command = ruleset.defaultDice; //+ " + 0"; //this.character.lastCommand + " + 0"
              else if (this.numberToAdd.toString() === '0')
                command = ruleset.defaultDice; //this.character.lastCommand
              else if (this.numberToAdd ? this.numberToAdd.toString().charAt(0) === '-' : false)
                command = ruleset.defaultDice ? ruleset.defaultDice + " " + this.numberToAdd.toString() : this.numberToAdd.toString();
              else
                command = ruleset.defaultDice ? ruleset.defaultDice + " + " + this.numberToAdd.toString() : this.numberToAdd.toString();
              //if (command != "0") {
              //    let arr = this.commandInterpretationArray(command)
              //    let Orgtemp = [];
              //    let temp = [];
              //    let loopVar = arr[0].commandArray
              //    for (var i = loopVar.length - 1; i >= 0; i--) {
              //        if (!isNaN(parseInt(loopVar[i].dice))) {
              //            temp.push({ dice: parseInt(loopVar[i].dice), sign: loopVar[i].sign })
              //        }
              //        else {
              //            break;
              //        }
              //    }
              //    loopVar.map((num) => {
              //        if (isNaN(parseInt(num.dice))) {////////////
              //            Orgtemp.push({ dice: num.dice, sign: num.sign })
              //        }
              //    })
              //    let str = '99';
              //    temp.map((num, index) => {
              //        str += num.sign + num.dice;
              //    })
              //    let strres = '';
              //    if (parseInt(str) == 99) {
              //        Orgtemp.push({ dice: DiceService.commandInterpretation(str)[0].calculationResult, sign: " + " })
              //    }
              //    str = '';
              //    Orgtemp.map((item, index) => {
              //        if (index == Orgtemp.length - 1) {
              //            if ((+item.dice - 99) != 0) {
              //                str += item.sign + (+item.dice - 99).toString();
              //            }

              //        } else {
              //            if (index == 0)
              //                str += item.dice;
              //            else
              //                str += item.sign + item.dice;
              //        }

              //    })
              //    command = str;
              //}              
              this.characterCommandModel.command = command;
              this.onClickRoll(this.characterCommandModel, command);

              //this.isLoading = false;
            }
          }
          setTimeout(() => {
            if (this.isLoading) this.isLoading = false;
          }, 200);

        }, error => {
          this.isLoading = false;
        }, () => { });

      this.Initialize();
    }, 0);
  }
  private Initialize() {
    let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    if (user == null)
      this.authService.logout();
    else {
      //this.isLoading = true;
      this.characterCommandService.getByCharacterId<any>(this.characterId)
        .subscribe(data => {
          this.characterCommandData = data;//.slice(0, 3);
          //this.isLoading = false;
        }, error => {
          //this.isLoading = false;
          //let Errors = Utilities.ErrorDetail("", error);
          //if (Errors.sessionExpire) {
          //    //this.alertService.showMessage("Session Ended!", "", MessageSeverity.default);
          //    this.authService.logout(true);
          //}
        }, () => { });

      this.charactersCharacterStatService.getCharactersCharacterStat<any[]>(this.characterId, this.page, this.pageSize)
        .subscribe(data => {
          this.charactersCharacterStats = data;
          //this.isLoading = false;
        }, error => {
          //this.isLoading = false;
          let Errors = Utilities.ErrorDetail("", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
        }, () => {

          this.charactersCharacterStats.forEach(item => {
            item.number = item.number == 0 ? "" : item.number;
            item.current = item.current == 0 ? "" : item.current;
            item.maximum = item.maximum == 0 ? "" : item.maximum;
            item.value = item.value == 0 ? "" : item.value;
            item.subValue = item.subValue == 0 ? "" : item.subValue;
          });
        });
      if (this.showDetailsByDefault) {
        this.showDetailsByDefault = false;
        //    this.showLastResult(this.character);
      }

    }
  }

  generateDiceCommand(dice: DiceRoll, characterCommandModel: CharacterCommand) {

    //To get dice calculation
    characterCommandModel = DiceService.generateDiceCommand(dice, characterCommandModel);
  }

  //DICE BUTTON CLICK
  commandOnDiceClick(dice: DiceRoll) {
    
    // characterCommandModel: CharacterCommand
    let _command = '';

    if (!this.characterCommandModel.command || this.characterCommandModel.command == '') {
      this.characterCommandModel.command = dice.dice;
      dice.rolledCount = 1;
    }
    else {

      _command = this.characterCommandModel.command;
      _command = _command ? _command.trim().toUpperCase() : _command;

      let AND_LIMIT = DiceService.splitWithoutEmpty(_command, 'AND');
      if (AND_LIMIT.length > this.totalAndLimit) {
        this.alertService.resetStickyMessage();
        this.alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
        setTimeout(() => { this.alertService.resetStickyMessage(); }, 1200);
        return false;
      }

      //add mod & validate command            
      let commandToValidate = _command;
      this.addModArray.map(mod => {
        //let charactersCharacterStatId = mod.charactersCharacterStatId;
        //let selectedStatValue = mod.selectedStatValue;
        let selectedStat: string = mod.selectedStat;
        commandToValidate = commandToValidate.replace(selectedStat.toUpperCase(), "D");
      });
      
        commandToValidate = commandToValidate.replace(/\[([^\]]+)\]/g, '1');
      
      let isValidCommand = DiceService.validateCommandTextNew(commandToValidate);
      if (!isValidCommand) {
        this.alertService.resetStickyMessage();
        this.alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
        setTimeout(() => { this.alertService.resetStickyMessage(); }, 1200);
        //this.recycleDice();
        //this.characterCommandModel.command = _command;
        return false;
      }

      let lastSign = _command.substr(_command.length - 1, 1);
      if (lastSign === '+' || lastSign === '-' || lastSign === '/' || lastSign === '*') {
        dice.sign = ' ' + lastSign + ' ';
      } else {
        dice.sign = ' + ';
      }

      let cmdText: string = '';
      let diceExist: boolean = false;
      let _addPlus: string;

      //let diceRollList = DiceService.diceOnRollCount(_command); //D4 AND D6
      let diceRollList = DiceService.diceOnSelectOnRoll(_command, false, this.diceTray);

      var IndexAND = diceRollList.map(x => {
        if (x.commandText === 'AND') return true; else return false;
      });
      let lastIndexAND = IndexAND.lastIndexOf(true);
      let _rolledCount = 1;

      for (var val in diceRollList) {

        //diceRollList.map(x => {
        //    if (x.dice === dice.dice) _rolledCount += x.rolledCount;
        //});

        if (!diceRollList[val].isStatic && !diceExist && diceRollList[val].dice === dice.dice
          && lastIndexAND < +val) {
          var _diceRollModel = this.diceRollModel.find((model) => model.dice === diceRollList[val].dice);
          if (_diceRollModel) {
            _diceRollModel.rolledCount += 1;
            _diceRollModel.command = _diceRollModel.rolledCount + diceRollList[val].dice;

            diceRollList[val].diceRolledCount += 1;
            diceRollList[val].commandText = this.getQuotesCommandText(
              diceRollList[val].commandText, _diceRollModel.rolledCount, diceRollList[val].dice);
            //this.characterCommandModel.command += ' + ' + dice.dice;
            diceExist = true;
            cmdText = cmdText == ''
              ?
              (
                diceRollList[val].sign.trim() == '-'
                  ?
                  diceRollList[val].sign + diceRollList[val].commandText
                  :
                  diceRollList[val].commandText
              )
              :
              (
                cmdText.trim().endsWith('AND')
                  ? (
                    diceRollList[val].sign.trim() == '-'
                      ?
                      cmdText + diceRollList[val].sign + diceRollList[val].commandText
                      :
                      cmdText + diceRollList[val].commandText
                  )
                  :
                  cmdText + diceRollList[val].sign + diceRollList[val].commandText
              );
          }
        } else if (diceRollList[val].isStatic && diceRollList[val].commandText.trim() == 'AND') {
          cmdText = cmdText == '' ? diceRollList[val].commandText : cmdText + ' ' + diceRollList[val].commandText + ' ';
        } else {
          cmdText = cmdText == '' ?
            (
              diceRollList[val].sign.trim() == '-'
                ? diceRollList[val].sign + diceRollList[val].commandText
                :
                diceRollList[val].commandText
            )
            :
            cmdText.trim().endsWith('AND')
              ?
              (
                diceRollList[val].sign.trim() == '-'
                  ?
                  cmdText + diceRollList[val].sign + diceRollList[val].commandText
                  :
                  cmdText + diceRollList[val].commandText
              )
              :
              cmdText + diceRollList[val].sign + diceRollList[val].commandText;
        }
      }
      this.characterCommandModel.command = cmdText;
      if (!diceExist) {
        cmdText = this.characterCommandModel.command;
        this.characterCommandModel.command = cmdText + dice.sign + dice.dice;
        dice.rolledCount = _rolledCount;
      }

    }
  }

  generateCommandOnChange(command: string, diceRollModel: DiceRoll[]) {
    
    if (!command) {
      this.recycleDice();
      return false;
    }
    else if (command.trim() === '') {
      this.recycleDice();
      return false;
    }

    let AND_LIMIT = DiceService.splitWithoutEmpty(command.trim().toUpperCase(), 'AND');
    if (AND_LIMIT.length > this.totalAndLimit) {
      this.alertService.resetStickyMessage();
      this.alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
      setTimeout(() => { this.alertService.resetStickyMessage(); }, 1200);
      this.recycleDice();
      this.characterCommandModel.command = command;
      return false;
    }
    let commandIfERROR = command;
    //////////////////////////////////////////////
    try {
      if (this.characterId > 0) {
        ////////////////////////////////
        let calculationString: string = command;
        let inventoreyWeight = this.statdetails.character.inventoryWeight;
        let finalCalcString: string = '';

        try {
          commandIfERROR = calculationString;
          this.commandStatInCommand(calculationString).subscribe(res => {
            calculationString = res;
          });
        } catch (err) { }


        calculationString.split("[INVENTORYWEIGHT]").map((item) => {
          calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
        })
        let IDs: any[] = [];
        finalCalcString = calculationString;
        if (calculationString) {
          calculationString = DiceService.hideTextCommandSquareBraces(calculationString);
          calculationString.split(/\[(.*?)\]/g).map((rec) => {

            let id = ''; let flag = false; let type = 0; let statType = 0;
            let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

            if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
            if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
            if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
            if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

            if (isValue || isSubValue || isCurrent || isMax) {
              if (isValue) {
                id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
                type = 3
              }
              else if (isSubValue) {
                id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
                type = 4
              }
              else if (isCurrent) {
                id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
                type = 1
              }
              else if (isMax) {
                id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
                type = 2
              }

            }
            else {
              id = rec.replace('[', '').replace(']', '');
              type = 0
            }
            this.statdetails.charactersCharacterStat.map((q) => {
              if (id == q.characterStat.statName.toUpperCase()) {
                flag = (id == q.characterStat.statName.toUpperCase());
                statType = q.characterStat.characterStatTypeId
              }
            })
            if (flag) {
              IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
            }
            else if (+id == -1) {
              IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
            }
          })
          calculationString = DiceService.showTextCommandSquareBraces(calculationString);
          IDs.map((rec) => {
            //console.log('---rec.id ', rec.id)
            this.statdetails.charactersCharacterStat.map((stat) => {
              if (rec.id == stat.characterStat.statName.toUpperCase()) {
                let num = 0; let isCMD = false;
                let cmd = "";
                switch (rec.statType) {
                  case STAT_TYPE.Number: //Number
                    num = stat.number
                    break;
                  case STAT_TYPE.CurrentMax: //Current Max
                    if (rec.type == 1)//current
                    {
                      num = stat.current
                    }
                    else if (rec.type == 2)//Max
                    {
                      num = stat.maximum
                    }
                    break;
                  case STAT_TYPE.ValueSubValue: //Val Sub-Val
                    if (rec.type == 3)//value
                    {
                      num = +stat.value
                    }
                    else if (rec.type == 4)//sub-value
                    {
                      num = stat.subValue
                    }
                    break;
                  case STAT_TYPE.Calculation: //Calculation
                    num = stat.calculationResult
                    break;
                  case STAT_TYPE.Combo: //Combo
                    num = stat.defaultValue
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
        finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');
        finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '').replace(/\* 0/g, '').replace(/\/ 0/g, '');
        command = finalCalcString;
      }
    } catch (err) { }
    //////////////////////////////////////////////

    //add mod & validate command            
    let commandToValidate = command.trim();
    this.addModArray.map(mod => {
      //let charactersCharacterStatId = mod.charactersCharacterStatId;
      //let selectedStatValue = mod.selectedStatValue;
      let selectedStat: string = mod.selectedStat;
      commandToValidate = commandToValidate.replace(selectedStat.toUpperCase(), "D");
    });

    let isValidCommand = DiceService.validateCommandTextNew(commandToValidate);
    if (!isValidCommand) {
      command = commandIfERROR;
      this.alertService.resetStickyMessage();
      this.alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
      setTimeout(() => { this.alertService.resetStickyMessage(); }, 1200);
      this.recycleDice();
      this.characterCommandModel.command = command;
      return false;
    }


    command = command.toUpperCase();
    //let diceRollList = DiceService.diceOnRollCount(command);
    let diceRollList = DiceService.diceOnSelectOnRoll(command, false, this.diceTray);

    diceRollModel.forEach((val) => {
      val.rolledCount = 0;
    });

    for (var val in diceRollList) {
      if (!diceRollList[val].isStatic) {
        var _diceRollModel = diceRollModel.find((dice) => dice.dice == diceRollList[val].dice);
        if (_diceRollModel)
          _diceRollModel.rolledCount = _diceRollModel.rolledCount + Number(diceRollList[val].diceRolledCount);
      }
    }

    this.sharedService.UpdateDice(true);
  }

  recycleDice() {
    if (this.diceTray.length > 0) {
      this.diceRollModel = this.characterCommandService.DiceRollDataFromDiceTray(this.characterId, this.customDices, this.diceTray, this.defaultDices);

    }
    else {
      this.diceRollModel = this.characterCommandService.DiceRollData(this.characterId);
    }

    this.characterCommandModel = this.characterCommandService.commandModelData({ characterId: this.characterId, character: this.character }, "ADD");
    this.activeCommand = 0;
  }

  showMoreCommands(_limit: number, _limitText: string) {
    if (_limitText == "Show more") {
      this.limitText = "Show less";
      this.limit = _limit;
    } else {
      this.limitText = "Show more";
      this.limit = 3;
    }
  }

  showLastResult(character: Characters) {

    this.spinner = true;
    this.charactersService.getCharactersByIdDice<any>(this.characterId)
      .subscribe(data => {
        this.character = data;
        this.isLoading = false;
        this.spinner = false;
        this.showLastResults(this.character);
      }, error => {
        this.isLoading = false;
        this.spinner = false;
        this.authService.logout();
      }, () => { });
  }

  showLastResults(character: Characters) {

    let characterCommand = new CharacterCommand();
    characterCommand.characterId = character.characterId;
    characterCommand.command = character.lastCommand;

    try {
      this.characterMultipleCommands = DiceService.commandInterpretation(characterCommand.command, undefined, this.addModArray, this.customDices);

      this.characterMultipleCommands.map((_characterMultipleCommands, _Cindex) => {


        let __characterMultipleCommands = _characterMultipleCommands;

        /****/
        let command = characterCommand.command.split(' AND ')[_Cindex]; //( 1 + 2 + 6 )  - 8 + 7
        let calculationStringForArray = character.lastCommandValues.split(' AND ')[_Cindex]; //.replace(/  /g, ' ');

        //3D6=2,3,5 - 4D8=2,4,6,8 + 7=7 + 3D10=5,9,10
        //let _calculationStringArrayList = calculationStringForArray.split(' ').filter((val) => val);
        let _calculationStringArrayList = DiceService.splitByMultiSeparator(calculationStringForArray, ['+', '-', '/', '*']);

        /*****/

        let _lastCommandResult = character.lastCommandResult.split(' AND ')[_Cindex];

        __characterMultipleCommands.calculationIndex = 0;
        __characterMultipleCommands.calculationCommand = command;
        __characterMultipleCommands.calculationArray.forEach((diceRoll, index) => {

          if (diceRoll.dice && diceRoll.diceIcon && diceRoll.static == false) {
            let diceLastValues: string = _calculationStringArrayList[index].split('=')[1]; //3D6=2,3,5 => 2,3,5
            let lastRandomNumbers = diceLastValues.trim().split(',').join(' + '); //2 + 3 + 5

            diceRoll.randomNumbers = lastRandomNumbers;
            diceRoll.randomNumbersAfter = '( ' + lastRandomNumbers + ' )';

            if (diceRoll.isExploded) {
              let lastTotalDiceResultsLength = diceLastValues.split(',').length;//loop for getting count and creating dummy array of randomNumbersList of old records
              if (lastTotalDiceResultsLength > diceRoll.randomNumbersList.length) {
                let itemsCountToPush = +lastTotalDiceResultsLength - +diceRoll.randomNumbersList.length;
                for (var i = +diceRoll.randomNumbersList.length; i < lastTotalDiceResultsLength; i++) {
                  let dummyArrObj = {
                    index: i,
                    isAnimated: false,
                    isHighest: false,
                    isKept: false,
                    isLowest: false,
                    isMax: false,
                    isMin: true,
                    isShowReroll: false,
                    number: 0
                  }
                  diceRoll.randomNumbersList.push(dummyArrObj);
                }
              }
              else if (lastTotalDiceResultsLength < diceRoll.randomNumbersList.length) {
                let itemsCountToRemove = +diceRoll.randomNumbersList.length - +lastTotalDiceResultsLength;
                diceRoll.randomNumbersList.splice(0, itemsCountToRemove);
              }
            }
            diceRoll.randomNumbersList.forEach((random, indx) => {

              let _lastRandomNumbersList = diceLastValues.split(',');
              let current_lastRandomNumbersList = parseInt(_lastRandomNumbersList[indx]);
              if (isNaN(current_lastRandomNumbersList) && diceRoll.isCustomDice) {
                random.isMax = false;
                random.isMin = false;
                random.number = _lastRandomNumbersList[indx];
                // random.number = current_lastRandomNumbersList;
              } else {
                random.isMax = diceRoll.diceNumber === +_lastRandomNumbersList[indx] ? true : false;
                random.isMin = +_lastRandomNumbersList[indx] == 1 ? true : false;
                random.number = +_lastRandomNumbersList[indx];
              }

            });

            if (diceRoll.isCustomDice && !diceRoll.isCustomNumeric) {
              diceRoll.randomNumbersListAfter = diceLastValues.split(',').filter((val) => val);
            } else {
              diceRoll.randomNumbersListAfter = diceLastValues.split(',').filter((val) => !isNaN(parseInt(val)));
            }
            try {
              diceRoll.randomNumbersSum = eval(lastRandomNumbers);
              diceRoll.randomNumbersSumAfter = eval(lastRandomNumbers);
            }
            catch (ex) {
              diceRoll.randomNumbersSum = 0;
              diceRoll.randomNumbersSumAfter = 0;
            }
          }
          else {
            let diceLastValues: string = _calculationStringArrayList[index].split('=')[1]; //7=7 => 7
            let lastRandomNumbersStatic = diceLastValues.trim();

            diceRoll.randomCount = lastRandomNumbersStatic;
            diceRoll.randomNumbers = lastRandomNumbersStatic;
            diceRoll.randomNumbersAfter = lastRandomNumbersStatic;
            diceRoll.randomNumbersList = [];
            diceRoll.randomNumbersListAfter = lastRandomNumbersStatic.split('').filter((val) => +val);
            try {
              diceRoll.randomNumbersSum = eval(lastRandomNumbersStatic);
              diceRoll.randomNumbersSumAfter = eval(lastRandomNumbersStatic);
            }
            catch (e) {
              diceRoll.randomNumbersSum = 0;
              diceRoll.randomNumbersSumAfter = 0;
            }

          }
        });

        let val_Eval = 0;
        try {
          val_Eval = eval(character.lastCommandResult.split(' AND ')[_Cindex]);
        }
        catch (e) {
          val_Eval = 0;
        }
        __characterMultipleCommands.calculationResult = Math.round(val_Eval);
        if (__characterMultipleCommands.calculationCommand.indexOf('RU') > -1)
          __characterMultipleCommands.calculationResult = Math.ceil(val_Eval);
        else if (__characterMultipleCommands.calculationCommand.indexOf('RD') > -1)
          __characterMultipleCommands.calculationResult = Math.floor(val_Eval);

        __characterMultipleCommands.calculationString = character.lastCommandResult.split(' AND ')[_Cindex];

        //this.characterMultipleCommands[0] = __characterMultipleCommands;


      })



      //this.onClickRoll(characterCommand, '', __characterMultipleCommands);
      this.onClickRoll(characterCommand, '', this.characterMultipleCommands[0]);
    }
    catch (err) {
      this.onClickRoll(characterCommand, '', undefined);
    }
  }
  commandStatInCommand(command: string): Observable<string> {
    try {
      ////////////////////////////////
      let calculationString: string = command.toUpperCase();
      let inventoreyWeight = this.statdetails.character.inventoryWeight;
      let finalCalcString: string = '';
      calculationString.split("[INVENTORYWEIGHT]").map((item) => {
        calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
      })
      let IDs: any[] = [];
      finalCalcString = calculationString;
      if (calculationString) {

        calculationString = DiceService.hideTextCommandSquareBraces(calculationString);
        calculationString.split(/\[(.*?)\]/g).map((rec) => {

          let id = ''; let flag = false; let type = 0; let statType = 0;
          let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

          if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
          if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
          if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
          if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

          if (isValue || isSubValue || isCurrent || isMax) {
            if (isValue) {
              id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
              type = 3
            }
            else if (isSubValue) {
              id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
              type = 4
            }
            else if (isCurrent) {
              id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
              type = 1
            }
            else if (isMax) {
              id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
              type = 2
            }

          }
          else {
            id = rec.replace('[', '').replace(']', '');
            type = 0
          }
          this.statdetails.charactersCharacterStat.map((q) => {
            if (id == q.characterStat.statName.toUpperCase()) {
              flag = (id == q.characterStat.statName.toUpperCase());
              statType = q.characterStat.characterStatTypeId
            }
          })
          if (flag) {
            IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
          }
          else if (+id == -1) {
            IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
          }
        })

        calculationString = DiceService.showTextCommandSquareBraces(calculationString);

        //console.log('IDs ', IDs)
        IDs.map((rec) => {
          this.statdetails.charactersCharacterStat.map((stat) => {
            if (rec.id == stat.characterStat.statName.toUpperCase()) {
              let num = 0; let isCMD = false;
              let whileCMD = "";
              switch (rec.statType) {
                case STAT_TYPE.Command:
                  num = -1;
                  whileCMD = stat.command;
                  //console.log('---stat.command ', whileCMD)
                  do {
                    isCMD = false;
                    this.commandStatTypeInCommand(whileCMD).subscribe((x) => {
                      //this.cmd = x.originaltext
                      x.map((val, i) => {
                        this.statdetails.charactersCharacterStat.map((_stat, j) => {
                          if (rec.id == val.characterStat.statName.toUpperCase()) { console.log('error referenced: ', rec.id) }
                          else if (val.characterStat.statName.toUpperCase() == _stat.characterStat.statName.toUpperCase()) {
                            switch (val.characterStat.characterStatTypeId) {
                              case STAT_TYPE.Command:
                                isCMD = true;
                                whileCMD = whileCMD.replace('[' + val.characterStat.statName.toUpperCase() + ']', _stat.command);
                                break;
                              default:
                                isCMD = false;
                                //cmd = _preCMD.replace(val.originaltext, stat.command);
                                break;
                            }
                          }
                        })
                      })
                      //calculationString = calculationString.replace(x.originaltext, num.toString());
                    });
                  }
                  while (isCMD);

                  if (!isCMD) {
                    num == -2; isCMD = true;
                    whileCMD = whileCMD.replace(rec.originaltext, stat.command);
                  }
                  //while (temp != 0);
                  break;
                default:
                  break;
              }
              if (num == -1 && isCMD) {
                calculationString = calculationString.replace(rec.originaltext, whileCMD);
              }
              else if (num == -2 && isCMD) {
                calculationString = calculationString.replace(rec.originaltext, whileCMD);
              }
              ////else if (num)
              ////calculationString = calculationString.replace(rec.originaltext, num.toString());
              //// else
              //// calculationString = calculationString.replace(rec.originaltext, '0');
              //CalcString = CalcString.replace(rec.originaltext, "(" + num + ")");
            }

          });
          finalCalcString = calculationString;
        });
        return Observable.of(finalCalcString);
      }
      return Observable.of(finalCalcString);
    } catch (err) { }
  }

  commandStatTypeInCommand(cmd: string): Observable<any> {
    try {
      let data = [];

      cmd = DiceService.hideTextCommandSquareBraces(cmd);
      cmd.split(/\[(.*?)\]/g).map((rec) => {
        let id = ''; let flag = false; let type = 0; let statType = 0;
        let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

        if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
        if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
        if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
        if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

        if (isValue || isSubValue || isCurrent || isMax) {
          if (isValue) {
            id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
            type = 3
          }
          else if (isSubValue) {
            id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
            type = 4
          }
          else if (isCurrent) {
            id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
            type = 1
          }
          else if (isMax) {
            id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
            type = 2
          }

        }
        else {
          id = rec.replace('[', '').replace(']', '');
          type = 0
        }
        this.statdetails.charactersCharacterStat.map((q) => {
          if (id == q.characterStat.statName.toUpperCase()) {
            if (q.characterStat.characterStatTypeId == STAT_TYPE.Command) {
              data.push(q);
              //console.log('----------------------commandStatTypeInCommand: ', id);
            }
          }
        })
      });
      cmd = DiceService.showTextCommandSquareBraces(cmd);
      return Observable.of(data);

    } catch (err) { }
  }
  onClickRoll(characterCommand: CharacterCommand, _mainCommandText: string, lastResultArray?: any) {
  
    let anyCommandIsCustomWithNonNumeric = false;
    this.loadingResult = false;
    let command = characterCommand.command;
    let commandIfERROR = characterCommand.command;
    if (!command && this.isFromTile) {
      this.alertService.showMessage("The command associated with this record has been removed. Please update the record to resolve.", "", MessageSeverity.error);
       if (this.diceSection = true) {
            this.rollSection = false;
          }
          else if (this.rollSection = true) {
            this.diceSection = false;
            }
    }
    else if (!command) {
      this.alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
       if (this.diceSection = true) {
            this.rollSection = false;
          }
          else if (this.rollSection = true) {
            this.diceSection = false;
            }
    }
    else if (command.trim() == '') {
      this.alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
       if (this.diceSection = true) {
            this.rollSection = false;
          }
          else if (this.rollSection = true) {
            this.diceSection = false;
            }
    }
    else {
     
      this.mainCommandText = !_mainCommandText || _mainCommandText == "" ? command : _mainCommandText;
      command = this.mainCommandText.toUpperCase();
      console.log('here is command length', command.length );
      if (command.length >= 500) {
        this.alertService.showMessage("A maximum of 500 characters is allowed for a command. Please adjust your command string and try again.", "", MessageSeverity.error);
         if (this.diceSection = true) {
            this.rollSection = false;
          }
          else if (this.rollSection = true) {
            this.diceSection = false;
            }
      }
      else {

        let AND_LIMIT = DiceService.splitWithoutEmpty(command.trim().toUpperCase(), 'AND');
        if (AND_LIMIT.length > this.totalAndLimit) {
          this.alertService.resetStickyMessage();
          this.alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1000);
          this.recycleDice();
          this.characterCommandModel.command = this.mainCommandText;
          return false;
        }
        //////////////////////////////////////////////
        try {
          if (this.characterId > 0) {
            ////////////////////////////////
            let calculationString: string = command;
            let inventoreyWeight = this.statdetails.character.inventoryWeight;
            let finalCalcString: string = '';
            try {
              commandIfERROR = calculationString;
              this.commandStatInCommand(calculationString).subscribe(res => {
                calculationString = res;
              });
            } catch (err) { }


            calculationString.split("[INVENTORYWEIGHT]").map((item) => {
              calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
            })
            let IDs: any[] = [];
            finalCalcString = calculationString;
            if (calculationString) {
              
              calculationString= DiceService.hideTextCommandSquareBraces(calculationString);
              calculationString.split(/\[(.*?)\]/g).map((rec) => {
              
                let id = ''; let flag = false; let type = 0; let statType = 0;
                let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

                if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
                if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
                if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
                if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

                if (isValue || isSubValue || isCurrent || isMax) {
                  if (isValue) {
                    id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
                    type = 3
                  }
                  else if (isSubValue) {
                    id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
                    type = 4
                  }
                  else if (isCurrent) {
                    id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
                    type = 1
                  }
                  else if (isMax) {
                    id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
                    type = 2
                  }

                }
                else {
                  id = rec.replace('[', '').replace(']', '');
                  type = 0
                }
                this.statdetails.charactersCharacterStat.map((q) => {
                  if (!flag) {
                    flag = (id == q.characterStat.statName.toUpperCase());
                    statType = q.characterStat.characterStatTypeId
                  }
                })
                if (flag) {
                  IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
                }
                else if (+id == -1) {
                  IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
                }
              })

              
              calculationString = DiceService.showTextCommandSquareBraces(calculationString);

              IDs.map((rec) => {
                this.statdetails.charactersCharacterStat.map((stat) => {
                  if (rec.id == stat.characterStat.statName.toUpperCase()) {
                    let num = 0;
                    switch (rec.statType) {
                      case 3: //Number
                        num = stat.number
                        break;
                      case 5: //Current Max
                        if (rec.type == 1)//current
                        {
                          num = stat.current
                        }
                        else if (rec.type == 2)//Max
                        {
                          num = stat.maximum
                        }
                        break;
                      case 7: //Val Sub-Val
                        if (rec.type == 3)//value
                        {
                          num = +stat.value
                        }
                        else if (rec.type == 4)//sub-value
                        {
                          num = stat.subValue
                        }
                        break;
                      case 12: //Calculation
                        num = stat.calculationResult
                        break;
                      case STAT_TYPE.Combo: //Combo
                        num = stat.defaultValue
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
            finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');
            finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '').replace(/\* 0/g, '').replace(/\/ 0/g, '');
            command = finalCalcString;
          }
        } catch (err) { }

        //////////////////////////////////////////////
        //add mod & validate command            
        let commandToValidate = command.trim();
        this.addModArray.map(mod => {
          //let charactersCharacterStatId = mod.charactersCharacterStatId;
          //let selectedStatValue = mod.selectedStatValue;
          let selectedStat: string = mod.selectedStat;
          commandToValidate = commandToValidate.replace(selectedStat.toUpperCase(), "D");
        });

        let isValidCommand = DiceService.validateCommandTextNew(commandToValidate);
        let isValidCommand99 = DiceService.validateCommand99Limit(commandToValidate);
        if (!isValidCommand || !isValidCommand99) {
          this.alertService.resetStickyMessage();
          command = commandIfERROR;
          this.alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
          setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
          this.recycleDice();
          this.characterCommandModel.command = this.mainCommandText;
          if (this.diceSection = true) {
            this.rollSection = false;
          }
          else if (this.rollSection = true) {
            this.diceSection = false;
            }
            return false;
        }

        if (this.customDices.length > 0) {
          let dArray = DiceService.commandInterpretation(command, undefined, this.addModArray, this.customDices);
          let IsCmdValid = true;
          dArray.map((darr) => {
            darr.calculationArray.map((d) => {
              let valid = true;
              if (d.dice.length >= 2) {
                valid = false
                let arr = d.dice.split('D');
                let CountOfDice = 1;
                if (arr.length > 1) {
                  if (/^-?[0-9]\d*(\\d+)?$/g.test(arr[0])) {
                    CountOfDice = parseInt(arr[0]);
                  }
                }
                if (d.dice.toUpperCase().charAt(arr[0].length) == 'D' && /^[a-zA-Z]/.test(d.dice.toUpperCase().charAt(arr[0].length + 1))) {
                  this.customDices.map((cd) => {
                    if (d.dice == cd.name) {
                      valid = true
                    }
                  })

                  try {
                    if (!valid && !d.dice.toUpperCase().split('D')[1].startsWith('F')) {
                      IsCmdValid = false;
                    }
                  } catch { if (!valid) IsCmdValid = false; }
                }

              }
            })
          })

          if (!IsCmdValid) {
            command = commandIfERROR;
            this.alertService.showMessage("Please enter a valid command.", "", MessageSeverity.error);
            if (this.diceSection = true) {
              this.rollSection = false;
            }
            else if (this.rollSection = true) {
              this.diceSection = false;
            }
            return false;
          }
        }


        let __characterMultipleCommands: any;
        if (lastResultArray) {
          __characterMultipleCommands = lastResultArray;
          __characterMultipleCommands = lastResultArray;
          this.loadingResult = true;
        }
        else {
          this.characterMultipleCommands = DiceService.commandInterpretation(command, undefined, this.addModArray, this.customDices);

          __characterMultipleCommands = this.characterMultipleCommands[0];
        }
        //if (this.customDices.length>0) {

        //}


        let __calculationCommand = __characterMultipleCommands.calculationCommand.toString();
        let __calculationResult = __characterMultipleCommands.calculationResult;
        let __calculationString = __characterMultipleCommands.calculationString;
        let __isCustomNumericCommand = false;
        if (__characterMultipleCommands.isCustomNumericCommand) {
          __isCustomNumericCommand = __characterMultipleCommands.isCustomNumericCommand;
        }

        try {
          if (__calculationString.split("((").length - 1 === __calculationString.split("))").length - 1) {
            __calculationString = __calculationString.replace('((', '(').replace('))', ')');
          }
        } catch (err) { }
        if (__calculationString.length > 1) {
          __calculationString = __calculationString.replace(/  /g, ' ');
          __calculationString.split('+ -').map((x) => {
            __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          })
          __calculationString.split('+ *').map((x) => {
            __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          })
          __calculationString.split('+ /').map((x) => {
            __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          })
          __calculationString.split('+ +').map((x) => {
            __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          })
          __calculationString.split('- -').map((x) => {
            __calculationString = __calculationString.replace('- -', '-')
          })
        }
        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');

        this.diceRolledData = __characterMultipleCommands.calculationArray;
        /*********************************************************************************/
        let commandTxt = __calculationCommand;
        this.activeAndCommand = 0;
        //let processCommandWithResult = this.processCommandWithResult(commandTxt, characterCommand);



        this.diceRolledData.forEach(diceRoll => {
          if (!diceRoll.static && !lastResultArray)
            diceRoll.randomNumbersList.forEach(num => { num.isAnimated = true; });
          else
            diceRoll.randomNumbersList.forEach(num => { num.isAnimated = false; });

          //----variable to hide Exploded dice----//
          //let StartHidingDice = false;

          if (!lastResultArray) {

            diceRoll.randomNumbersList.map((randomNumberObj, index) => {
              if (((index) + 1 > diceRoll.randomCount) && diceRoll.isExploded) {
                randomNumberObj.hideExplode = true;
              }
              //randomNumberObj.hideExplode = StartHidingDice;
              //if (diceRoll.isExploded && (diceRoll.diceNumber == randomNumberObj.number)) {
              //    randomNumberObj.hideExplode = StartHidingDice;

              //    StartHidingDice = true;

              //}
              //else if (diceRoll.isExploded && (diceRoll.diceNumber != randomNumberObj.number)) {
              //    StartHidingDice = false;
              //}
            })

          }


          //--END variable to hide Exploded dice--//
        });

        this.characterCommandModel.command = __calculationCommand;
        this.characterCommandModel.lastResult = __calculationResult;
        this.characterCommandModel.lastResultNumbers = __calculationString;
        this.characterCommandModel.isCustomNumericCommand = __isCustomNumericCommand;
        this.characterCommandModel.isCustomDice = __characterMultipleCommands.isResultWithCustomDice

        this.character.lastCommand = commandTxt;
        this.character.lastCommandResult = __calculationString;

        //let textResult = this.fillBeforeAndAfterText(characterCommand.command, true);
        //this.beforeResultText = textResult.start;
        //this.afterResultText = textResult.end;
        if (this.characterMultipleCommands) {
          if (this.characterMultipleCommands.length > 1) {
            this.displayCurrentRollBtn = true;
            this.rollAgainBtnText = 'Roll Current  Again';
          } else {
            this.displayCurrentRollBtn = false;
            this.rollAgainBtnText = 'Roll Again';
          }
        }
        
        setTimeout(() => {
          //this.characterCommandModel.lastResult = __calculationResult;
          //this.characterCommandModel.lastResultNumbers = __calculationString;

          /*Update Last command if command is saved in charatcer command*/
          try {

            const characterLastCommand = new CharacterLastCommand();
            characterLastCommand.characterId = characterCommand.characterId;
            characterLastCommand.lastCommand = commandTxt;
            characterLastCommand.lastCommandResult = __calculationString;
            characterLastCommand.lastCommandTotal = __calculationResult;

            let lastCommandValues: string = "";
            this.diceRolledData.forEach((diceRoll, index) => {

              if (diceRoll.dice && diceRoll.diceIcon) {
                lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
                  diceRoll.randomCount + diceRoll.dice
                  + "=" + diceRoll.randomNumbersListAfter.toString();
              } else {
                lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
                  + "=" + diceRoll.randomNumbersListAfter.toString();
              }

            });

            characterLastCommand.lastCommandValues = lastCommandValues; //

            this.character.lastCommand = this.characterCommandModel.command;
            this.character.lastCommandResult = this.characterCommandModel.lastResultNumbers;
            this.character.lastCommandValues = lastCommandValues;
            this.character.lastCommandTotal = characterLastCommand.lastCommandTotal;

            /**/
            if (this.oldCommandSaved) {
              //characterLastCommand.lastCommand = this.oldCommandSaved;
            }

            //alert(this.isFromTile);
            //if (!this.isFromTile)
            //////Save multiple command using AND keyword/////////
            
            if (this.characterMultipleCommands) {
              if (this.characterMultipleCommands.length > 1) {
                this.characterMultipleCommands.map((cmd, index) => {
                  if (cmd.calculationArray) {
                    if (cmd.calculationArray.length) {
                      cmd.calculationArray.map((x) => {
                        if (x.isCustomDice && !x.isCustomNumeric) {
                          anyCommandIsCustomWithNonNumeric = true;
                        }
                      })
                    }
                  }
                  if (index > 0) {

                    characterLastCommand.lastCommand += " AND " + cmd.calculationCommand;
                    characterLastCommand.lastCommandResult += " AND " + cmd.calculationString;
                    //characterLastCommand.lastCommandTotal += " AND " + __calculationResult;

                    let lastCommandValues: string = "";
                    let _diceRolledData = cmd.calculationArray;
                    _diceRolledData.forEach((diceRoll, index) => {

                      if (diceRoll.dice && diceRoll.diceIcon) {
                        lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
                          diceRoll.randomCount + diceRoll.dice
                          + "=" + diceRoll.randomNumbersListAfter.toString();
                      } else {
                        lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
                          + "=" + diceRoll.randomNumbersListAfter.toString();
                      }

                    });

                    characterLastCommand.lastCommandValues += " AND " + lastCommandValues; //
                  }
                })
              }
            }
            //////////////////////////////////////////////////////

            //if (!anyCommandIsCustomWithNonNumeric) {
            this.updateLastCommand(characterLastCommand);
            // }

            this.HideResult = false;

            this.diceRolledData.forEach(diceRoll => {
              if (!diceRoll.static)
               diceRoll.randomNumbersList.forEach(num => {
                  num.isAnimated = num.hideExplode ? true : false;
                  num.isMax = diceRoll.diceNumber === num.number ? true : false;
                  num.isMin = num.number === 1 ? true : false;
                  if (num.hideExplode) {

                    this.HideResult = true;
                  }
                });
            });
            //------Show rolling hidden Exploded dice and Then stop Rolling------//
            if (this.HideResult) {
              this.cascadeDiceEffectCount = 0;
              this.cascadeDiceEffectCurrentCount = 0;
              this.cascadeDiceDisplayLength = 0;
              this.CascadeExplodeDice();
            }
            //----END Show rolling hidden Exploded dice and Then stop Rolling----//


            this.calculationStringArray = DiceService.getCalculationStringArray(__calculationString, this.diceRolledData);
            this.characterMultipleCommands[0].calculationStringArray = this.calculationStringArray;
          } catch (err) { }



          //color maximum & minimum
          //let _maxNum: number = 0;
          //let _minNum: number = 0;

          //this.diceRolledData.forEach(diceRoll => {
          //    let _maxN = Math.max.apply(Math, diceRoll.randomNumbersListAfter);
          //    let _minN = Math.min.apply(Math, diceRoll.randomNumbersListAfter);

          //    _maxNum = +_maxN > _maxNum ? +_maxN : _maxNum;
          //    _minNum = +_minN > _minNum ? (_minNum == 0 ? +_minN : _minNum) : +_minN;
          //});

          this.loadingResult = true;
        }, 1200);

        this.diceSection = false;
        this.rollSection = true;

      }
    }
  }

  //important method *****OLD****
  private processCommandWithResult(commandTxt: string, characterCommand: CharacterCommand) {

    //let commandList = DiceService.diceOnRollCount(command); //old

    let commandList = DiceService.diceOnSelectOnRoll(commandTxt);

    let lastResultSum: number = 0;
    let lastResultNumbers: string = '';
    let _addPlus: string;
    this.diceRolledData = new Array<DiceRoll>();

    //var _diceRoll = this.diceRollModel.find((dice) => dice.dice == commandList[val].dice);

    for (var val in commandList) {

      if (!commandList[val]) continue;

      for (var _i = 0; _i < commandList[val].diceRolledCount; _i++) {

        const _diceRoll = new DiceRoll();
        _diceRoll.characterCommandId = characterCommand.characterCommandId;
        _diceRoll.characterId = this.characterId;
        _diceRoll.command = commandList[val].commandText;
        _diceRoll.dice = commandList[val].dice;
        _diceRoll.diceIcon = DICE_ICON[commandList[val].dice];
        _diceRoll.diceNumber = Number(DICE[commandList[val].dice]);
        _diceRoll.rolledCount = commandList[val].diceRolledCount;
        _diceRoll.roundUp = 0;
        _diceRoll.roundUp = 0;
        _diceRoll.keepLowest = 0;
        _diceRoll.keepHighest = 0;
        _diceRoll.dropLowest = 0;
        _diceRoll.dropHighest = 0;
        _diceRoll.sign = commandList[val].sign;
        _diceRoll.isStatic = commandList[val].isStatic;
        _diceRoll.operator = commandList[val].operator ? commandList[val].operator : '';
        _diceRoll.operatorValue = commandList[val].operatorValue ? commandList[val].operatorValue : 0;
        _diceRoll.RURD = 0; _diceRoll.KHKL = 0; _diceRoll.DHDL = 0;

        //if static command
        if (commandList[val].isStatic && commandList[val].commandText.trim() === 'AND') {
          _diceRoll.randomNumbers = [];
          // _diceRoll.randomNumbers.push(+commandList[val].commandText);
          _diceRoll.lastResult = commandList[val].commandText;
          _addPlus = ' ';
          _diceRoll.dice = commandList[val].commandText;
        }
        else if (commandList[val].isStatic) {
          _diceRoll.randomNumbers = [];
          _diceRoll.randomNumbers.push(+commandList[val].commandText);
          _diceRoll.lastResult = +commandList[val].commandText;
          _addPlus = commandList[val].sign ? commandList[val].sign : '';
          _diceRoll.dice = _addPlus + commandList[val].commandText;
        }
        //if command is dice without operator
        else if (!commandList[val].isStatic && commandList[val].operator === '' && commandList[val].operatorValue === 0) {
          _diceRoll.randomNumbers = [];
          let randomNum = DiceService.getRandomNumber(1, _diceRoll.diceNumber);
          _diceRoll.randomNumbers.push(randomNum);
          _diceRoll.lastResult = randomNum;
          _addPlus = commandList[val].sign;
        }
        //if command is dice with operator RU/RD
        else if (!commandList[val].isStatic && (commandList[val].operator === 'RU' || commandList[val].operator === 'RD')) {

          _diceRoll.randomNumbers = [];
          let randomNum = DiceService.getRandomNumber(1, _diceRoll.diceNumber);
          _diceRoll.RURD = randomNum;

          let randomNumRURD = randomNum / commandList[val].operatorValue;
          if (commandList[val].operator === 'RU') {
            _diceRoll.roundUp = commandList[val].operatorValue;
            randomNumRURD = Math.ceil(randomNumRURD);
            _diceRoll.RURD = randomNumRURD;
          }
          else if (commandList[val].operator === 'RD') {
            _diceRoll.roundDown = commandList[val].operatorValue;
            randomNumRURD = Math.floor(randomNumRURD);
            _diceRoll.RURD = randomNumRURD;
          }

          _diceRoll.randomNumbers.push(randomNum);
          _diceRoll.lastResult = randomNum;
          _addPlus = commandList[val].sign;
        }
        //if command is dice with operator KL/KH/DH/DL
        else if (!commandList[val].isStatic && commandList[val].operator !== '') {
          _diceRoll.randomNumbers = [];
          //
          switch (commandList[val].operator) {
            case 'KH': {
              _diceRoll.keepHighest = commandList[val].operatorValue;
              break;
            }
            case 'KL': {
              _diceRoll.keepLowest = commandList[val].operatorValue;
              break;
            }
            case 'DH': {
              _diceRoll.dropHighest = commandList[val].operatorValue;
              break;
            }
            case 'DL': {
              _diceRoll.dropLowest = commandList[val].operatorValue;
              break;
            }
          }

          _diceRoll.randomNumbers.push(DiceService.getRandomNumber(1, _diceRoll.diceNumber));
          _diceRoll.lastResult = DiceService.getRandomNumber(1, _diceRoll.diceNumber);
          _addPlus = commandList[val].sign;
        }

        if (commandList[val].diceRolledCount === (Number(_i) + 1)
          && commandList.length === (Number(val) + 1)) {
          _addPlus = '';
        }

        if (!commandList[val].isStatic && (commandList[val].operator === 'RU' || commandList[val].operator === 'RD')) {

          if (commandList[val].sign.trim() == '+')
            lastResultSum += _diceRoll.RURD;
          else if (commandList[val].sign.trim() == '-')
            lastResultSum -= _diceRoll.RURD;
          else if (commandList[val].sign.trim() == '*')
            lastResultSum *= _diceRoll.RURD;

          lastResultNumbers += lastResultNumbers == ''
            ? (commandList[val].sign.trim() == '-' ? commandList[val].sign + _diceRoll.RURD : _diceRoll.RURD)
            : commandList[val].sign + _diceRoll.RURD;
        }
        else {

          if (commandList[val].sign.trim() == '+')
            lastResultSum += _diceRoll.lastResult;
          else if (commandList[val].sign.trim() == '-')
            lastResultSum -= _diceRoll.lastResult;
          else if (commandList[val].sign.trim() == '*')
            lastResultSum *= _diceRoll.lastResult;

          lastResultNumbers += lastResultNumbers == ''
            ? (commandList[val].sign.trim() == '-' ? commandList[val].sign + _diceRoll.lastResult : _diceRoll.lastResult)
            : commandList[val].sign + _diceRoll.lastResult;
        }

        this.diceRolledData.push(_diceRoll);
      }
    }

    //let array = this.diceRolledData; //=> 3D4 KH1 + 2D6 DL2 => 
    //D4 D4 D4 => 2 3 1 //=> 
    //KL/KH/DL/DH => 2

    //3D4 KH1 + 2D6 DL2
    //3d4 kh1 => d4 d4 d4

    //3 + 2 + 1 + 5 + 3 => 3

    //d4 3 kh 1
    //d4 2 kh 1 //
    //d4 1 kh 1 =>
    //d6 5 dl 2 =>
    //d6 3 dl 2
    let __lastResultNumbers: string = '';
    let __lastResultSum: number = 0;
    let DiceInCommand = [];
    let __diceRolledData = this.diceRolledData;
    __diceRolledData.map(x => {
      if (DiceInCommand.indexOf(x.dice) < 0) DiceInCommand.push(x.dice);
    });

    //.splice(0,length-1)

    DiceInCommand.forEach((val) => {

      var _diceData = __diceRolledData.filter((model) => model.dice === val);

      if (_diceData.length > 0) {
        //sort asc
        _diceData.sort(function (a, b) {
          return (a.lastResult > b.lastResult) ? 1 : ((b.lastResult > a.lastResult) ? -1 : 0);
        });
        //_diceData.sort((one, two) => (one > two ? -1 : 1)); //1 3 4 6

        let operator = _diceData[0].operator;
        let operatorValue = _diceData[0].operatorValue;

        switch (operator) {
          case 'KH': {
            //keep highest- remove lowest
            if (_diceData.length >= operatorValue)
              _diceData.splice(0, _diceData.length - operatorValue);
            break;
          }
          case 'KL': {
            //keep lowest- remove highest
            if (_diceData.length >= operatorValue)
              _diceData.splice(operatorValue, _diceData.length);
            break;
          }
          case 'DH': {
            //drop highest- keep lowest
            if (_diceData.length >= operatorValue)
              _diceData.splice(_diceData.length - operatorValue, _diceData.length);
            break;
          }
          case 'DL': {
            //drop lowest- keep highest
            if (_diceData.length >= operatorValue)
              _diceData.splice(0, operatorValue);
            break;
          }
          default: {
            break;
          }
        }

        _diceData.forEach((val) => {

          if (val.operator === 'RD') {
            if (val.sign.trim() == '+')
              __lastResultSum += val.RURD;
            else if (val.sign.trim() == '-')
              __lastResultSum -= val.RURD;
            else if (val.sign.trim() == '*')
              __lastResultSum *= val.RURD;

            __lastResultNumbers += __lastResultNumbers == '' ? (val.sign.trim() == '-' ? val.sign + val.lastResult : val.lastResult) : val.sign + val.RURD;
          }
          else {

            if (val.sign.trim() == '+')
              __lastResultSum += val.lastResult;
            else if (val.sign.trim() == '-')
              __lastResultSum -= val.lastResult;
            else if (val.sign.trim() == '*')
              __lastResultSum *= val.lastResult;

            __lastResultNumbers += __lastResultNumbers == '' ? (val.sign.trim() == '-' ? val.sign + val.lastResult : val.lastResult) : val.sign + val.lastResult;
          }

        });

      }

    });
    lastResultSum = __lastResultSum;
    lastResultNumbers = __lastResultNumbers;

    return {
      lastResultSum: lastResultSum,
      lastResultNumbers: lastResultNumbers,
      diceRolledData: this.diceRolledData
    };
  }

  updateLastCommand(characterLastCommand: CharacterLastCommand) {
    //this.isLoading = true;
    this.characterCommandService.updateLastCommand<any>(characterLastCommand)
      .subscribe(
        data => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          this.character = data;
          //this.alertService.showMessage("Last command has been saved.", "", MessageSeverity.success);
          //this.bsModalRef.hide();
          //this.destroyModalOnInit();
          //this.sharedService.UpdateDice(true);
        },
        error => {
          this.isLoading = false;
          this.alertService.stopLoadingMessage();
          let Errors = Utilities.ErrorDetail("Unable to save last command.", error);
          if (Errors.sessionExpire) {
            this.authService.logout(true);
          }
          else
            this.alertService.showStickyMessage(Errors.summary, 'Please check the command string and try again.', MessageSeverity.error, error);
        },
      );
  }

  //COMMAND SEPARATED BY AND - CLICK
  onAndCommandClick(commandData: any, characterCommand: CharacterCommand, index: number) {

    this.loadingResult = true;
    this.activeAndCommand = index;

    let __characterMultipleCommands = commandData; //this.characterMultipleCommands[index];
    let __calculationArray = __characterMultipleCommands.calculationArray;

    let __calculationCommand = __characterMultipleCommands.calculationCommand.toString();
    let __calculationResult = __characterMultipleCommands.calculationResult;
    let __calculationString = __characterMultipleCommands.calculationString;

    let __isCustomNumericCommand = false;
    if (__characterMultipleCommands.isCustomNumericCommand) {
      __isCustomNumericCommand = __characterMultipleCommands.isCustomNumericCommand;
    }

    try {
      if (__calculationString.split("((").length - 1 === __calculationString.split("))").length - 1) {
        __calculationString = __calculationString.replace('((', '(').replace('))', ')');
      }
    } catch (err) { }
    //__calculationString = __calculationString.replace('((', '(').replace('))', ')');
    if (__calculationString.length > 1) {
      __calculationString = __calculationString.replace(/  /g, ' ');
      __calculationString.split('+ -').map((x) => {
        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
      })
      __calculationString.split('+ *').map((x) => {
        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
      })
      __calculationString.split('+ /').map((x) => {
        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
      })
      __calculationString.split('+ +').map((x) => {
        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
      })
      __calculationString.split('- -').map((x) => {
        __calculationString = __calculationString.replace('- -', '-')
      })
    }
    __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');

    let commandTxt = __calculationCommand;
    this.diceRolledData = __calculationArray;

    //let textResult = this.fillBeforeAndAfterText(commandTxt,false);
    //this.beforeResultText = textResult.start;
    //this.afterResultText = textResult.end;
    //this.beforeResultText = '';
    //this.afterResultText = '';

    this.diceRolledData.forEach(diceRoll => {
      if (!diceRoll.static)
        diceRoll.randomNumbersList.forEach(num => {
          num.isAnimated = false;
          num.isMax = diceRoll.diceNumber === num.number ? true : false;
          num.isMin = num.number === 1 ? true : false;
        });
    });

    if (index > 0) {
      setTimeout(() => {

        /*Update Last command if command is saved in charatcer command*/
        //try {

        //    const characterLastCommand = new CharacterLastCommand();
        //    characterLastCommand.characterId = characterCommand.characterId;
        //    characterLastCommand.lastCommand = commandTxt;
        //    characterLastCommand.lastCommandResult = __calculationString;
        //    characterLastCommand.lastCommandTotal = __calculationResult;
        //    let lastCommandValues: string = "";
        //    this.diceRolledData.forEach((diceRoll, index) => {

        //        if (diceRoll.dice && diceRoll.diceIcon) {
        //            lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
        //                diceRoll.randomCount + diceRoll.dice
        //                + "=" + diceRoll.randomNumbersListAfter.toString();
        //        } else {
        //            lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
        //                + "=" + diceRoll.randomNumbersListAfter.toString();
        //        }

        //    });

        //    characterLastCommand.lastCommandValues = lastCommandValues; //

        //    this.character.lastCommand = this.characterCommandModel.command;
        //    this.character.lastCommandResult = this.characterCommandModel.lastResultNumbers;
        //    this.character.lastCommandValues = lastCommandValues;
        //    this.character.lastCommandTotal = characterLastCommand.lastCommandTotal;
        //    /**/
        //    this.updateLastCommand(characterLastCommand);

        //    this.diceRolledData.forEach(diceRoll => {
        //        if (!diceRoll.static)
        //            diceRoll.randomNumbersList.forEach(num => {
        //                num.isAnimated = false;
        //                num.isMax = diceRoll.diceNumber === num.number ? true : false;
        //                num.isMin = num.number === 1 ? true : false;
        //            });
        //    });

        //    //this.calculationStringArray = DiceService.getCalculationStringArray(__calculationString, this.diceRolledData);
        //    //this.characterMultipleCommands[0].calculationStringArray = this.calculationStringArray;
        //} catch (err) { }

      }, 100);
    }

    this.characterCommandModel.lastResult = __calculationResult;
    this.characterCommandModel.lastResultNumbers = __calculationString;
    this.characterCommandModel.command = __calculationCommand;
    this.characterCommandModel.isCustomNumericCommand = __isCustomNumericCommand;
    this.characterCommandModel.isCustomDice = __characterMultipleCommands.isResultWithCustomDice
    /*********************************************************************************/

    /**OLD CODE *
    let AND_LIMIT = DiceService.splitWithoutEmpty(command, 'AND');
    if (AND_LIMIT.length > 5) {
        this.alertService.resetStickyMessage();
        this.alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
        setTimeout(() => { this.alertService.resetStickyMessage(); }, 1200);
        this.recycleDice();
        this.characterCommandModel.command = command;
        return false;
    }

    let isValidCommand = DiceService.validateCommandText(command.trim());
    if (!isValidCommand) {
        this.alertService.resetStickyMessage();
        this.alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
        setTimeout(() => { this.alertService.resetStickyMessage(); }, 1600);
        this.recycleDice();
        this.characterCommandModel.command = command;
        return false;
    }
    ***/

    /*********************************************************************************/

    /***** OLD CODE
    let commandTxt = command;
    //let processCommandWithResult = this.processCommandWithResult(commandTxt, characterCommand);
    
    let processCommandWithResult = this.showANDResult(commandData, this.character);

    //this.diceRolledData.forEach(diceRoll => {
    //    if (!diceRoll.isStatic)
    //        diceRoll.isAnimated = true;
    //});

    //setTimeout(() => {
        commandData.lastResultSum = processCommandWithResult.lastResultSum;
        commandData.lastResultNumbers = processCommandWithResult.lastResultNumbers;

        this.characterCommandModel.lastResult = processCommandWithResult.lastResultSum;
        this.characterCommandModel.lastResultNumbers = processCommandWithResult.lastResultNumbers;

        /******Update Last command if command is saved in charatcer command
        //try {
        //    const characterLastCommand = new CharacterLastCommand();
        //    characterLastCommand.characterId = characterCommand.characterId;
        //    characterLastCommand.lastCommand = commandTxt;
        //    characterLastCommand.lastCommandResult = processCommandWithResult.lastResultNumbers;

        //    this.updateLastCommand(characterLastCommand);

        //    this.character.lastCommand = commandTxt;
        //    this.character.lastCommandResult = processCommandWithResult.lastResultNumbers;
        //} catch (err) { }

        ////this.diceRolledData.forEach(diceRoll => {
        ////    if (!diceRoll.isStatic)
        ////        diceRoll.isAnimated = false;
        ////});
    //}, 1200);

    //this.diceSection = false;
    //this.rollSection = true;
    */

  }

  singleDiceReRoll(dice: any, numberList: any, diceIndex: number, numberIndex: number) {

    this.loadingResult = false;

    numberList = dice.randomNumbersList[numberIndex];
    numberList.index = numberIndex;
    numberList.isAnimated = true;
    numberList.isShowReroll = false;

    setTimeout(() => {
      numberList.isAnimated = false;
      numberList = dice.randomNumbersList[numberIndex];
      numberList.index = numberIndex;
      //for static modifier
      if (isNaN(dice.diceNumber)) dice.diceNumber = 99;

      numberList.isAnimated = false;
      //numberList.isShowReroll = true;

      if (dice.isCustomDice) {

        this.customDices.map((d) => {
          if (d.name.toUpperCase() == dice.dice.toUpperCase()) {
            let randomIndex = (Math.floor((Math.random() * (d.results.length)) + 1)) - 1;
            let randomResult = d.results[randomIndex].name;
            numberList.number = randomResult;
          }
        })
        //If FATE dice
        let diceExist = dice.dice.toUpperCase().split('D')[1];
        if (diceExist) {
          if (diceExist.startsWith('F')) {
            let randomIndex = (Math.floor((Math.random() * (3)) + 1)) - 1;
            numberList.number = [-1, 0, 1][randomIndex];
          }
        }
      }
      else {
        numberList.number = DiceService.getRandomNumber(1, dice.diceNumber);
      }

      numberList.isKept = false;



      if (dice.isExploded && !dice.isCustomDice && (numberList.number == dice.diceNumber)) {
        //Exploded on Reroll

        let tempNewNunberListObj = Object.assign({}, dice.randomNumbersList[numberIndex]);
        let NewNumber = Object.assign({}, { num: numberList.number });
        let Index = numberIndex + 1;
        do {
          //NewNumber = numberList.number;
          tempNewNunberListObj.number = NewNumber.num;
          tempNewNunberListObj.index = Index;
          //dice.randomNumbersList.push(tempNewNunberListObj);
          let newItemToInsert = {
            index: Index,
            isAnimated: tempNewNunberListObj.isAnimated,
            isHighest: tempNewNunberListObj.isHighest,
            isKept: tempNewNunberListObj.isKept,
            isLowest: tempNewNunberListObj.isLowest,
            isMax: tempNewNunberListObj.isMax,
            isMin: tempNewNunberListObj.isMin,
            isShowReroll: tempNewNunberListObj.isShowReroll,
            number: NewNumber.num
          }
          newItemToInsert.isMax = dice.diceNumber === +newItemToInsert.number ? true : false;
          newItemToInsert.isMin = +newItemToInsert.number == 1 ? true : false;
          //dice.randomNumbersList.splice(Index, 0, newItemToInsert);
          dice.randomNumbersList.push(newItemToInsert);
          NewNumber = Object.assign({}, { num: DiceService.getRandomNumber(1, dice.diceNumber) });
          Index = Index + 1;
        } while (tempNewNunberListObj.number == dice.diceNumber);
      }
      else {
        dice.randomNumbersList[numberIndex] = numberList;
      }

      var _sortedNumbersList = dice.randomNumbersList;//.sort(function (a, b) { return (a.number > b.number) ? 1 : ((b.number > a.number) ? -1 : 0); });

      let operator = dice.operator.toUpperCase();
      let operatorNumber = dice.operatorNumber;
      let randomCount = dice.randomCount;
      let num = 0;


      //to remove sort from dice
      var ___sortedNumbersToShowSort = Object.assign([], dice.randomNumbersList);
      var _sortedNumbersSort = ___sortedNumbersToShowSort.sort(function (a, b) { return (a.number > b.number) ? 1 : ((b.number > a.number) ? -1 : 0); });
      //.sort((n1, n2) => n1 - n2);

      var sortedRandomNumbersToShowSort: any = [];
      _sortedNumbersSort.forEach((val) => { sortedRandomNumbersToShowSort.push(val); });

      let _randmLIST = sortedRandomNumbersToShowSort.map((x, index) => {
        num += 1;

        return {
          index: index,
          number: x.number,
          isChecked: false,
          isKept: operator == "KH" ? (num > (randomCount - operatorNumber) ? true : false)
            : (operator == "KL" ? (num > operatorNumber ? false : true)
              : (operator == "DH" ? (num > (randomCount - operatorNumber) ? false : true)
                : (operator == "DL" ? (num > operatorNumber ? true : false)
                  : true)))
        };
      });
      //////////////

      let keptCount = 0;
      _sortedNumbersList = _sortedNumbersList.map(x => {
        //num += 1;

        let _isKept = false;
        switch (operator) {
          case "KH": case "KL": case "DH": case "DL":
            for (var nmbr in _randmLIST) {
              if (_randmLIST[nmbr].number === x.number && _randmLIST[nmbr].isKept == true) {
                if (_randmLIST[nmbr].isChecked == false) {
                  // && +nmbr >= index
                  //&& keptCount <= operatorNumber) {
                  _isKept = true;
                  keptCount += 1;
                  _randmLIST[nmbr].isChecked = true;
                  break;
                }
              }
            }
            break;
          default: _isKept = true; break;
        }

        return {
          number: x.number,
          isHighest: false,
          isLowest: false,
          isShowReroll: x.isShowReroll,
          isAnimated: x.isAnimated,
          isKept: _isKept
          //isKept: operator == "KH" ? (num > (randomCount - operatorNumber) ? true : false)
          //    : (operator == "KL" ? (num > operatorNumber ? false : true)
          //        : (operator == "DH" ? (num > (randomCount - operatorNumber) ? false : true)
          //            : (operator == "DL" ? (num > operatorNumber ? true : false)
          //                : true)))
        };
      });

      let sortedRandomNumbers = [];
      if (_sortedNumbersList.length > 0) {
        _sortedNumbersList.forEach((val) => {
          if (val.isKept) sortedRandomNumbers.push(val.number);
        });
      }

      dice.randomNumbersListAfter = sortedRandomNumbers;

      let _randomNumbersListAfter = dice.randomNumbersListAfter;
      // _randomNumbersListAfter[numberIndex] = numberList.number;

      let seperator = ' + ';
      if (dice.isCustomDice && !dice.isCustomNumeric) {
        seperator = ' , ';
      }
      dice.randomNumbersAfter = _randomNumbersListAfter.length > 1 ? ' ( ' + _randomNumbersListAfter.join(seperator) + ' ) '
        : _randomNumbersListAfter.join(seperator);

      try { dice.randomNumbersAfter = dice.randomNumbersAfter.replace(/\+ -/g, '-'); } catch (err) { }
      dice.randomNumbersSumAfter = _randomNumbersListAfter.reduce((a, b) => a + b, 0);

      let _calculationIndex = this.diceRolledData[0].calculationIndex;
      let _characterMultipleCommands = this.characterMultipleCommands[_calculationIndex].calculationArray;

      let __calculationResult = 0;
      let __calculationString = "";
      let _calculationStringForResult = "";
      let checkLastCommandString = "";
      let _operator = "";
      let isCustom = false;
      for (var cmdArr in _characterMultipleCommands) {
        if (_characterMultipleCommands[cmdArr].isCustomDice && !_characterMultipleCommands[cmdArr].isCustomNumeric) {
          isCustom = true;
          let checkLastCommandStringReplaceTo = "";
          let rNumAfter = _characterMultipleCommands[cmdArr].randomNumbersAfter ? _characterMultipleCommands[cmdArr].randomNumbersAfter : 0;
          checkLastCommandString += _characterMultipleCommands[cmdArr].sign + rNumAfter;

          _operator = _characterMultipleCommands[cmdArr].operator;

          __calculationString += __calculationString == "" ? rNumAfter
            : _characterMultipleCommands[cmdArr].sign + rNumAfter;

          _calculationStringForResult = __calculationString;
          if (checkLastCommandStringReplaceTo !== "") {
            _calculationStringForResult = _calculationStringForResult.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
          }

          checkLastCommandString = rNumAfter;
        }
        else {
          let checkLastCommandStringReplaceTo = "";
          let rNumAfter = _characterMultipleCommands[cmdArr].randomNumbersAfter ? _characterMultipleCommands[cmdArr].randomNumbersAfter : 0;
          checkLastCommandString += _characterMultipleCommands[cmdArr].sign + rNumAfter;

          if (checkLastCommandString.length > 1) {
            checkLastCommandString = checkLastCommandString.replace(/  /g, ' ');
            checkLastCommandString.split('+ -').map((x) => {
              checkLastCommandString = checkLastCommandString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
            })
            checkLastCommandString.split('+ *').map((x) => {
              checkLastCommandString = checkLastCommandString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
            })
            checkLastCommandString.split('+ /').map((x) => {
              checkLastCommandString = checkLastCommandString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
            })
            checkLastCommandString.split('+ +').map((x) => {
              checkLastCommandString = checkLastCommandString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
            })
            checkLastCommandString.split('- -').map((x) => {
              checkLastCommandString = checkLastCommandString.replace('- -', '-');
            })
          }
          checkLastCommandString = checkLastCommandString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');

          _operator = _characterMultipleCommands[cmdArr].operator;
          if (_operator == 'RU') {
            checkLastCommandStringReplaceTo = Math.ceil(eval(checkLastCommandString)).toString();
          } else if (_operator == 'RD') {
            checkLastCommandStringReplaceTo = Math.floor(eval(checkLastCommandString)).toString();
          }

          __calculationString += __calculationString == "" ? rNumAfter
            : _characterMultipleCommands[cmdArr].sign + rNumAfter;

          _calculationStringForResult = __calculationString;
          if (checkLastCommandStringReplaceTo !== "") {
            _calculationStringForResult = _calculationStringForResult.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
          }

          checkLastCommandString = rNumAfter;
        }

      }


      try {
        if (__calculationString.split("((").length - 1 === __calculationString.split("))").length - 1) {
          __calculationString = __calculationString.replace('((', '(').replace('))', ')');
        }
      } catch (err) { }
      //__calculationString = __calculationString.replace('((', '(').replace('))', ')');
      if (__calculationString.length > 1) {
        __calculationString = __calculationString.replace(/  /g, ' ');
        __calculationString.split('+ -').map((x) => {
          __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        __calculationString.split('+ *').map((x) => {
          __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        __calculationString.split('+ /').map((x) => {
          __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        __calculationString.split('+ +').map((x) => {
          __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        __calculationString.split('- -').map((x) => {
          __calculationString = __calculationString.replace('- -', '-')
        })
      }
      __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');

      this.characterMultipleCommands[_calculationIndex].calculationString = __calculationString;
      if (isCustom) {
        this.characterMultipleCommands[_calculationIndex].calculationResult = 0;

        this.characterCommandModel.lastResult = 0;
      }
      else {
        if (_calculationStringForResult.length > 1) {
          _calculationStringForResult = _calculationStringForResult.replace(/  /g, ' ');
          _calculationStringForResult.split('+ -').map((x) => {
            _calculationStringForResult = _calculationStringForResult.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          })
          _calculationStringForResult.split('+ *').map((x) => {
            _calculationStringForResult = _calculationStringForResult.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          })
          _calculationStringForResult.split('+ /').map((x) => {
            _calculationStringForResult = _calculationStringForResult.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          })
          _calculationStringForResult.split('+ +').map((x) => {
            _calculationStringForResult = _calculationStringForResult.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          })
          _calculationStringForResult.split('- -').map((x) => {
            _calculationStringForResult = _calculationStringForResult.replace('- -', '-');
          })
        }
        _calculationStringForResult = _calculationStringForResult.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');
        this.characterMultipleCommands[_calculationIndex].calculationResult = Math.round(eval(_calculationStringForResult)); // Math.floor(eval(__calculationString));

        this.characterCommandModel.lastResult = Math.round(eval(_calculationStringForResult)); // Math.floor(eval(__calculationString));;
      }

      this.characterCommandModel.lastResultNumbers = __calculationString;
      this.characterCommandModel.lastSavedCommand = this.characterMultipleCommands[_calculationIndex].calculationCommand;
      //color maximum & minimum
      //let _maxNum: number = 0;
      //let _minNum: number = 0;

      //this.diceRolledData.forEach(diceRoll => {
      //    let _maxN = Math.max.apply(Math, diceRoll.randomNumbersListAfter);
      //    let _minN = Math.min.apply(Math, diceRoll.randomNumbersListAfter);
      //    _maxNum = +_maxN > _maxNum ? +_maxN : _maxNum;
      //    _minNum = +_minN > _minNum ? (_minNum == 0 ? +_minN : _minNum) : +_minN;
      //});

      this.diceRolledData.forEach(diceRoll => {
        if (!diceRoll.static)
          diceRoll.randomNumbersList.forEach(num => {
            num.isMax = diceRoll.diceNumber === num.number ? true : false;
            num.isMin = num.number === 1 ? true : false;
          });
      });

      //lastResult: 14
      //lastResultNumbers: "( 1 + 4 + 4 ) - ( 3 + 4 + 5 + 6 ) + 7 +  ( 4 + 6 + 6 ) "
      //lastSavedCommand: "3D6 - 4D8 + 7 + 3D10"

      this.characterMultipleCommands[_calculationIndex].calculationStringArray = DiceService.getCalculationStringArray(__calculationString, this.diceRolledData);

      const characterLastCommand = new CharacterLastCommand();
      characterLastCommand.characterId = this.characterId;
      characterLastCommand.lastCommand = this.characterCommandModel.lastSavedCommand;
      characterLastCommand.lastCommandResult = this.characterCommandModel.lastResultNumbers;
      characterLastCommand.lastCommandTotal = this.characterCommandModel.lastResult;

      let lastCommandValues: string = "";
      this.diceRolledData.forEach((diceRoll, index) => {

        if (diceRoll.dice && diceRoll.diceIcon) {
          lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
            diceRoll.randomCount + diceRoll.dice
            + "=" + diceRoll.randomNumbersListAfter.toString();
        } else {
          lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
            + "=" + diceRoll.randomNumbersListAfter.toString();
        }

      });

      characterLastCommand.lastCommandValues = lastCommandValues;

      //////Save multiple command using AND keyword/////////
      let anyCommandIsCustomWithNonNumeric = false;
      if (this.characterMultipleCommands) {
        if (this.characterMultipleCommands.length > 1) {
          this.characterMultipleCommands.map((cmd, index) => {
            if (cmd.calculationArray) {
              if (cmd.calculationArray.length) {
                cmd.calculationArray.map((x) => {
                  if (x.isCustomDice && !x.isCustomNumeric) {
                    anyCommandIsCustomWithNonNumeric = true;
                  }
                })
              }
            }
            if (index == 0) {
              characterLastCommand.lastCommand = cmd.calculationCommand;
              characterLastCommand.lastCommandResult = cmd.calculationString;
              characterLastCommand.lastCommandTotal = this.characterCommandModel.lastResult;

              let lastCommandValues: string = "";
              let _diceRolledData = cmd.calculationArray;
              _diceRolledData.forEach((diceRoll, index) => {

                if (diceRoll.dice && diceRoll.diceIcon) {
                  lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
                    diceRoll.randomCount + diceRoll.dice
                    + "=" + diceRoll.randomNumbersListAfter.toString();
                } else {
                  lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
                    + "=" + diceRoll.randomNumbersListAfter.toString();
                }

              });

              characterLastCommand.lastCommandValues = lastCommandValues; //
            }
            else if (index > 0) {

              characterLastCommand.lastCommand += " AND " + cmd.calculationCommand;
              characterLastCommand.lastCommandResult += " AND " + cmd.calculationString;
              //characterLastCommand.lastCommandTotal += " AND " + __calculationResult;

              let lastCommandValues: string = "";
              let _diceRolledData = cmd.calculationArray;
              _diceRolledData.forEach((diceRoll, index) => {

                if (diceRoll.dice && diceRoll.diceIcon) {
                  lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
                    diceRoll.randomCount + diceRoll.dice
                    + "=" + diceRoll.randomNumbersListAfter.toString();
                } else {
                  lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
                    + "=" + diceRoll.randomNumbersListAfter.toString();
                }

              });

              characterLastCommand.lastCommandValues += " AND " + lastCommandValues; //
            }
          })
        }
      }
      //////////////////////////////////////////////////////
      //if (!anyCommandIsCustomWithNonNumeric) {
      this.updateLastCommand(characterLastCommand);
      //}


      this.character.lastCommand = this.characterCommandModel.lastSavedCommand;
      this.character.lastCommandResult = this.characterCommandModel.lastResultNumbers;
      this.character.lastCommandTotal = this.characterCommandModel.lastResult;

      this.loadingResult = true;
    }, 1500);
  }


  //SINGLE DICE ROLL CLICK -NEW
  singleDiceRollNew(dice: any, numberList: any, diceIndex: number, numberIndex: number) {

    this.loadingResult = false;
    numberList.isAnimated = true;
    numberList.isShowReroll = false;

    setTimeout(() => {
      //for static modifier
      if (isNaN(dice.diceNumber)) dice.diceNumber = 100;
      numberList.isAnimated = false;

      if (!dice.static) {
        numberList.number = DiceService.getRandomNumber(1, dice.diceNumber);

        let _randomNumbersListAfter = dice.randomNumbersListAfter;
        _randomNumbersListAfter[numberIndex] = numberList.number;
        dice.randomNumbersAfter = _randomNumbersListAfter.length > 1 ? ' ( ' + _randomNumbersListAfter.join(" + ") + ' ) '
          : _randomNumbersListAfter.join(" + ");
        dice.randomNumbersSumAfter = _randomNumbersListAfter.reduce((a, b) => a + b, 0);
      }

      let _calculationIndex = this.diceRolledData[0].calculationIndex;
      let _characterMultipleCommands = this.characterMultipleCommands[_calculationIndex].calculationArray;

      let __calculationResult = 0;
      let __calculationString = "";
      let _calculationStringForResult = "";
      let checkLastCommandString = "";
      let _operator = "";

      for (var cmdArr in _characterMultipleCommands) {

        let checkLastCommandStringReplaceTo = "";
        checkLastCommandString += _characterMultipleCommands[cmdArr].sign + _characterMultipleCommands[cmdArr].randomNumbersAfter;

        _operator = _characterMultipleCommands[cmdArr].operator;
        if (_operator == 'RU') {
          checkLastCommandStringReplaceTo = Math.ceil(eval(checkLastCommandString)).toString();
        } else if (_operator == 'RD') {
          checkLastCommandStringReplaceTo = Math.floor(eval(checkLastCommandString)).toString();
        }

        __calculationString += __calculationString == "" ? _characterMultipleCommands[cmdArr].randomNumbersAfter
          : _characterMultipleCommands[cmdArr].sign + _characterMultipleCommands[cmdArr].randomNumbersAfter;

        _calculationStringForResult = __calculationString;
        if (checkLastCommandStringReplaceTo !== "") {
          _calculationStringForResult = _calculationStringForResult.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
        }

        checkLastCommandString = _characterMultipleCommands[cmdArr].randomNumbersAfter;
      }

      try {
        if (__calculationString.split("((").length - 1 === __calculationString.split("))").length - 1) {
          __calculationString = __calculationString.replace('((', '(').replace('))', ')');
        }
      } catch (err) { }
      //__calculationString = __calculationString.replace('((', '(').replace('))', ')');
      if (__calculationString.length > 1) {
        __calculationString = __calculationString.replace(/  /g, ' ');
        __calculationString.split('+ -').map((x) => {
          __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        __calculationString.split('+ *').map((x) => {
          __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        __calculationString.split('+ /').map((x) => {
          __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        __calculationString.split('+ +').map((x) => {
          __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        __calculationString.split('- -').map((x) => {
          __calculationString = __calculationString.replace('- -', '-')
        })
      }
      __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');

      this.characterMultipleCommands[_calculationIndex].calculationString = __calculationString;
      this.characterMultipleCommands[_calculationIndex].calculationStringArray = DiceService.getCalculationStringArray(__calculationString);
      this.characterMultipleCommands[_calculationIndex].calculationResult = Math.round(eval(_calculationStringForResult)); // Math.floor(eval(__calculationString));

      this.characterCommandModel.lastResult = Math.round(eval(_calculationStringForResult)); // Math.floor(eval(__calculationString));;
      this.characterCommandModel.lastResultNumbers = __calculationString;

      this.loadingResult = true;
    }, 2000);
  }

  showANDResult(commandData: any, character: Characters) {

    character.lastCommand = commandData.command;
    character.lastCommandResult = commandData.lastResultNumbers;
    this.calculationStringArray = DiceService.getCalculationStringArray(commandData.lastResultNumbers);

    this.diceRolledData = commandData.diceRolledData;
    this.activeAndCommand = commandData.index;

    //this.characterCommandModel.lastResult = lastResultSum;
    //this.characterCommandModel.lastResultNumbers = lastResultNumbers;
    //this.characterCommandModel.command = character.lastCommand;

    return {
      lastResultSum: commandData.lastResultSum,
      lastResultNumbers: commandData.lastResultNumbers,
      diceRolledData: commandData.diceRolledData
    };
  }

  showReroll(dice: any, NumbersList: any, index: number) {

    NumbersList = dice.randomNumbersList[index];
    NumbersList.index = index;

    if (!dice.static) {
      NumbersList.isAnimated = false;
      NumbersList.isShowReroll = true;

      //this.diceRolledData[index].isShowReroll = true;
      setTimeout(() => {
        NumbersList.isShowReroll = false;
      }, 3000);
    }
  }

  singleDiceRoll(dice: DiceRoll, index: number) {

    this.loadingResult = false;
    dice.isAnimated = true;
    dice.isShowReroll = false;
    //this.diceRolledData.forEach(diceRoll => { diceRoll.isShowReroll = false; });

    setTimeout(() => {
      //for static modifier
      //if (isNaN(dice.diceNumber)) dice.diceNumber = 100;
      this.diceRolledData[index].isAnimated = false;
      try {

        dice.sign = dice.sign ? dice.sign : '';
        let oldLastResult = dice.lastResult;
        dice.lastResult = dice.diceNumber ? DiceService.getRandomNumber(1, dice.diceNumber) : dice.lastResult;
        dice.dice = dice.diceNumber ? dice.dice : dice.sign + dice.lastResult;
        this.characterCommandModel.lastResult += dice.lastResult - oldLastResult;
        let numbers = this.characterCommandModel.lastResultNumbers.split('+');
        let _new = false;
        for (var x = 0; x < numbers.length; x++) {
          // numbers.forEach((val) => {
          numbers[x] = numbers[x].trim();
          if (+numbers[x] === +oldLastResult && !_new) {
            numbers[x] = dice.lastResult; _new = true;
          }
        };
        this.characterCommandModel.lastResultNumbers = numbers.join(' + ');
      } catch (err) { }

      this.loadingResult = true;
      let _index = +this.activeAndCommand - 1;
      this.characterMultipleCommands[_index].lastResultSum = this.characterCommandModel.lastResult;
      this.characterMultipleCommands[_index].lastResultNumbers = this.characterCommandModel.lastResultNumbers;
      this.characterMultipleCommands[_index].diceRolledData = this.diceRolledData;

    }, 2000);
  }

  copyCommandText(characterCommandModel: CharacterCommand) {
    let commandText = characterCommandModel.command;
    DiceService.copyToClipboard(commandText);
  }

  copyCommandResultText(characterCommandModel: CharacterCommand) {
    let commandResultText = characterCommandModel.lastResultNumbers + ' = ' + characterCommandModel.lastResult;
    DiceService.copyToClipboard(commandResultText);
  }

  onClickDice(mainCommandText: any) {
    this.characterCommandModel.command = mainCommandText;
    this.diceSection = true;
    this.rollSection = false;
  }

  bindDiceCommand(commandData: any, diceRollModel: any) {

    let _command = commandData.command ? commandData.command.toUpperCase() : '';
    commandData.characterId = this.characterId;
    commandData.character = this.character;
    this.characterCommandModel = this.characterCommandService.commandModelData(commandData, "EDIT");
    this.characterCommandModel.command = commandData.command;
    this.characterCommandModel.characterCommandId = commandData.characterCommandId;

    //bind command-dice
    this.generateCommandOnChange(_command, diceRollModel);
    this.activeCommand = commandData.characterCommandId;
  }

  public clickAndHold(command: any) {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  public editSavedCommand(command: any) {
    this.timeoutHandler = setInterval(() => {
      this.editDiceCommand(command);
    }, 2000);
  }

  saveDiceCommand(characterCommandModel: any) {

    let command = characterCommandModel.command;
    if (!command) {
      this.alertService.showStickyMessage('', 'Please enter a command.', MessageSeverity.error);
      setTimeout(() => { this.alertService.resetStickyMessage(); }, 1800);
      return false;
    }
    if (command === '') {
      this.alertService.showStickyMessage('', 'Please enter a command.', MessageSeverity.error);
      setTimeout(() => { this.alertService.resetStickyMessage(); }, 1800);
      return false;
    }

    let AND_LIMIT = DiceService.splitWithoutEmpty(command.trim().toUpperCase(), 'AND');
    if (AND_LIMIT.length > this.totalAndLimit) {
      this.alertService.resetStickyMessage();
      this.alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
      setTimeout(() => { this.alertService.resetStickyMessage(); }, 1200);
      return false;
    }
    //////////////////////////////////////////////
    try {
      if (this.characterId > 0) {
        ////////////////////////////////
        let calculationString: string = command;
        let inventoreyWeight = this.statdetails.character.inventoryWeight;
        let finalCalcString: string = '';
        calculationString.split("[INVENTORYWEIGHT]").map((item) => {
          calculationString = calculationString.replace("[INVENTORYWEIGHT]", " " + inventoreyWeight + " ");
        })
        let IDs: any[] = [];
        finalCalcString = calculationString;
        if (calculationString) {

          calculationString = DiceService.hideTextCommandSquareBraces(calculationString);

          calculationString.split(/\[(.*?)\]/g).map((rec) => {

            let id = ''; let flag = false; let type = 0; let statType = 0;
            let isValue = false; let isSubValue = false; let isCurrent = false; let isMax = false;

            if (rec.toUpperCase().split('(V)').length > 1) { isValue = true; }
            if (rec.toUpperCase().split('(S)').length > 1) { isSubValue = true; }
            if (rec.toUpperCase().split('(C)').length > 1) { isCurrent = true; }
            if (rec.toUpperCase().split('(M)').length > 1) { isMax = true; }

            if (isValue || isSubValue || isCurrent || isMax) {
              if (isValue) {
                id = rec.toUpperCase().split('(V)')[0].replace('[', '').replace(']', '');
                type = 3
              }
              else if (isSubValue) {
                id = rec.toUpperCase().split('(S)')[0].replace('[', '').replace(']', '');
                type = 4
              }
              else if (isCurrent) {
                id = rec.toUpperCase().split('(C)')[0].replace('[', '').replace(']', '');
                type = 1
              }
              else if (isMax) {
                id = rec.toUpperCase().split('(M)')[0].replace('[', '').replace(']', '');
                type = 2
              }

            }
            else {
              id = rec.replace('[', '').replace(']', '');
              type = 0
            }
            this.statdetails.charactersCharacterStat.map((q) => {
              if (!flag) {
                flag = (id == q.characterStat.statName.toUpperCase());
                statType = q.characterStat.characterStatTypeId
              }
            })
            if (flag) {
              IDs.push({ id: id, type: isNaN(type) ? 0 : type, originaltext: "[" + rec + "]", statType: statType })
            }
            else if (+id == -1) {
              IDs.push({ id: id, type: 0, originaltext: "[" + rec + "]", statType: -1 })
            }
          })
          calculationString = DiceService.showTextCommandSquareBraces(calculationString);

          IDs.map((rec) => {
            this.statdetails.charactersCharacterStat.map((stat) => {
              if (rec.id == stat.characterStat.statName.toUpperCase()) {
                let num = 0;
                switch (rec.statType) {
                  case 3: //Number
                    num = stat.number
                    break;
                  case 5: //Current Max
                    if (rec.type == 1)//current
                    {
                      num = stat.current
                    }
                    else if (rec.type == 2)//Max
                    {
                      num = stat.maximum
                    }
                    break;
                  case 7: //Val Sub-Val
                    if (rec.type == 3)//value
                    {
                      num = +stat.value
                    }
                    else if (rec.type == 4)//sub-value
                    {
                      num = stat.subValue
                    }
                    break;
                  case 12: //Calculation
                    num = stat.calculationResult
                    break;
                  case STAT_TYPE.Combo: //Combo
                    num = stat.defaultValue
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
        finalCalcString = finalCalcString.replace(/\+0/g, '').replace(/\-0/g, '').replace(/\*0/g, '').replace(/\/0/g, '');
        finalCalcString = finalCalcString.replace(/\+ 0/g, '').replace(/\- 0/g, '').replace(/\* 0/g, '').replace(/\/ 0/g, '');
        command = finalCalcString;
      }
    } catch (err) { }
    //////////////////////////////////////////////
    //add mod & validate command            
    let commandToValidate = command.trim();
    this.addModArray.map(mod => {
      //let charactersCharacterStatId = mod.charactersCharacterStatId;
      //let selectedStatValue = mod.selectedStatValue;
      let selectedStat: string = mod.selectedStat;
      commandToValidate = commandToValidate.replace(selectedStat.toUpperCase(), "D");
    });

    let isValidCommand = DiceService.validateCommandTextNew(commandToValidate);
    if (!isValidCommand) {
      this.alertService.resetStickyMessage();
      this.alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
      setTimeout(() => { this.alertService.resetStickyMessage(); }, 2000);
      return false;
    } else {

      this.bsModalRef = this.modalService.show(DiceSaveComponent, {
        class: 'modal-primary modal-md',
        ignoreBackdropClick: true,
        keyboard: false
      });
      this.bsModalRef.content.title = characterCommandModel.characterCommandId ? "Edit New Saved Command" : "New Saved Command";
      this.bsModalRef.content.view = characterCommandModel.characterCommandId ? 'EDIT' : 'SAVE';
      this.bsModalRef.content.characterId = this.characterId;
      this.bsModalRef.content.character = this.character;
      this.bsModalRef.content.command = command;
      this.bsModalRef.content.characterCommand = characterCommandModel;
      this.bsModalRef.content.addModArray = this.addModArray;
    }

  }

  editDiceCommand(command: any) {

    this.bsModalRef = this.modalService.show(DiceSaveComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.title = "Edit Saved Command";
    this.bsModalRef.content.view = 'EDIT';
    this.bsModalRef.content.characterId = this.characterId;
    this.bsModalRef.content.character = this.character;
    this.bsModalRef.content.command = command.command;
    this.bsModalRef.content.characterCommand = command;
  }


  addMod() {
    this.bsModalRef = this.modalService.show(NumericCharacterStatComponent, {
      class: 'modal-primary modal-md',
      ignoreBackdropClick: true,
      keyboard: false
    });
    this.bsModalRef.content.characterId = this.characterId;

    this.bsModalRef.content.event.subscribe(data => {
      //let _selectedStat: string = data.selectedStat;
      data.selectedStat = data.selectedStat.toString().toUpperCase();
      this.addModArray.push(data);
      this.characterCommandModel.command = this.characterCommandModel.command
        ? this.characterCommandModel.command + ' + ' + data.selectedStat
        : data.selectedStat;
      this.bsModalRef.hide();
    });
  }

  public event: EventEmitter<any> = new EventEmitter();
  saveDiceResultTile(result) {
    this.close(false);
    this.event.emit(result);
  }

  close(destroyAll?: boolean) {
    this.bsModalRef.hide();
    if (this.showShowDiceBtn) {
      this.event.emit(this.characterCommandModel.lastResult);
    }
    if (destroyAll) {
      this.destroyModalOnInit();
    }
  }

  private destroyModalOnInit(): void {
    try {
      this.modalService.hide(1);
      document.body.classList.remove('modal-open');
      //$(".modal-backdrop").remove();
    } catch (err) { }
  }
  public commandInterpretationArray(command: string): any[] {

    let _commandInterpretationArray = [];
    let commandText = command.trim().toUpperCase();

    //Split multiple commands -AND
    let multiCommandArray = this.splitWithoutEmpty(commandText, 'AND');

    let diceARRAY = [];
    for (var cmd in multiCommandArray) {
      let _commandText = multiCommandArray[cmd];
      _commandText = _commandText.trim();

      diceARRAY = this.splitCommandToArray(_commandText);
      //split command again if it has parenthesis
      for (var arr in diceARRAY) {
        if (diceARRAY[arr].parenthesis) {
          let _commandTxt = diceARRAY[arr].dice.replace('(', '').replace(')', '');
          _commandTxt = diceARRAY[arr].sign + _commandTxt;
          diceARRAY[arr].diceArray = this.splitCommandToArray(_commandTxt);
        }
      }

      _commandInterpretationArray.push({
        command: _commandText,
        commandArray: diceARRAY,
        calculationString: "",
        calculationResult: 0
      });
    }

    return _commandInterpretationArray;
  }
  public splitWithoutEmpty(str: string, splitter: string) {
    return str.split(splitter).filter((val) => val.trim());
  }
  public splitCommandToArray(_commandText: string): any[] {
    let diceARRAY = [];
    let parenthesis = false;
    let addMod = false;
    let diceValue = "";
    let diceSign = " + ";
    let diceOperation = "";

    for (var x = 0; x < _commandText.length; x++) {

      if (addMod || parenthesis || (_commandText[x] != '+' && _commandText[x] != "-" && _commandText[x] != "*" && _commandText[x] != "/")) {
        diceValue += _commandText[x];
        if (_commandText[x] == '(') { //|| parenthesis) {
          //diceSign = _commandText[x - 1]
          parenthesis = true;
        }
        else if (_commandText[x] == ')') {
          if (diceValue.trim() !== '')
            diceARRAY.push({
              dice: diceValue.trim(),
              sign: diceSign,
              diceArray: [],
              parenthesis: true,
              static: +diceValue.trim() ? true : false,
              diceInterpretationArray: {}
            });
          parenthesis = false;
          diceValue = '';
        }
        else if (x == _commandText.length - 1) {
          if (diceValue.trim() !== '')
            diceARRAY.push({
              dice: diceValue.trim(),
              sign: diceSign,
              diceArray: [],
              parenthesis: false,
              static: +diceValue.trim() ? true : false,
              diceInterpretationArray: this.diceInterpretationArray(diceValue.trim())
            });
          diceValue = '';
        }
      }
      else if (_commandText[x] == '+' || _commandText[x] == "-" || _commandText[x] == "*" || _commandText[x] == "/") {
        if (diceValue.trim() !== '')
          diceARRAY.push({
            dice: diceValue.trim(),
            sign: diceSign,
            diceArray: [],
            parenthesis: false,
            static: +diceValue.trim() ? true : false,
            diceInterpretationArray: this.diceInterpretationArray(diceValue.trim())
          });
        diceSign = ' ' + _commandText[x] + ' ';
        diceValue = '';
      }
      else {
        //INVALID
      }
    }

    return diceARRAY;
  }
  public diceInterpretationArray(dice: string): any {
    let _diceInterpretationArray: any;
    let diceNumber = 0; //2D4 = 4
    let randomCount = 0;//2D4 = 2
    let randomNumbers = "";//4D4 = 2+3+3+4
    let randomNumbersSum = 0;//4D4 = 12
    let operator = ""; //KH1 = KH
    let operatorNumber = 0; //KH1 = 1
    let randomNumbersAfter = "";
    let randomNumbersSumAfter = 0;
    let sortedRandomNumbers: number[] = [];
    let sortedRandomNumbersToShow: number[] = [];
    let operatorSign;
    let diceWithoutMultipleSign: boolean = false;

    //example: D4, 2D8, 4D6 KH3, 5 RD
    let diceArray = this.splitWithoutEmpty(dice, ' ');
    for (var diceArr in diceArray) {

      if (+diceArr == 0) {
        let _dice = diceArray[diceArr];
        _dice = _dice.trim().toUpperCase();
        if (_dice.indexOf('D') > -1) {
          let diceValArray = _dice.split('D')
          randomCount = diceValArray[0] == "" ? 1 : (+diceValArray[0] < 1 ? 1 : +diceValArray[0]);
          diceNumber = diceValArray[1].trim() == "" ? 1 : +diceValArray[1];
          for (var x = 1; x <= randomCount; x++) {
            let _getRandom = this.getRandomNumber(1, diceNumber);
            if (x == randomCount) {
              randomNumbers += _getRandom;
            }
            else {
              randomNumbers += _getRandom + ',';
            }
            randomNumbersSum += _getRandom;
          }

          //sort random number ASC order=1,2,3,4,5
          let _randomNumber = randomNumbers.split(',').map(function (item) {
            return parseInt(item, 10);
          });

          var sortedNumbersToShow: number[] = [];

          var _sortedNumbers = _randomNumber.sort((n1, n2) => n1 - n2);
          _sortedNumbers.forEach((val) => { sortedNumbersToShow.push(val); });

          sortedRandomNumbersToShow = sortedNumbersToShow;
          //sortedRandomNumbers = _sortedNumbers;
          randomNumbers = _sortedNumbers.join(" + ");
        } else if (+_dice) {
          randomCount = +_dice;
          randomNumbers = _dice;
          randomNumbersSum = +_dice;
          sortedRandomNumbers.push(+randomNumbers);
        }
        else {
          //INVALID
          this.HasError = -1;
        }
      }
      else if (+diceArr == 1) {
        let _dice = diceArray[diceArr];
        _dice = _dice.trim().toUpperCase();
        if ((_dice.indexOf('RU') > -1) || (_dice.indexOf('RD') > -1)) {
          operator = diceArray[diceArr].trim();
        }
        else if (_dice.indexOf('KL') > -1) {
          let __dice = _dice.trim(); // diceArray[diceArr].trim();
          let operatorValArray = this.splitWithoutEmpty(__dice, 'KL');
          operator = "KL";
          operatorNumber = +operatorValArray[0].trim();

          if (randomCount >= operatorNumber) {
            //sortedRandomNumbers.splice(operatorNumber, sortedRandomNumbers.length);
          } else {
            //INVALID
            this.HasError = -2;
          }
        }
        else if (_dice.indexOf('KH') > -1) {
          let __dice = _dice.trim(); // diceArray[diceArr].trim();
          let operatorValArray = this.splitWithoutEmpty(__dice, 'KH');
          operator = "KH";
          operatorNumber = +operatorValArray[0].trim();

          if (randomCount >= operatorNumber) {
            //sortedRandomNumbers.splice(0, sortedRandomNumbers.length - operatorNumber);
          } else {
            //INVALID
            this.HasError = -3;
          }
        }
        else if (_dice.indexOf('DL') > -1) {
          let __dice = _dice.trim(); // diceArray[diceArr].trim();
          let operatorValArray = this.splitWithoutEmpty(__dice, 'DL');
          operator = "DL";
          operatorNumber = +operatorValArray[0].trim();

          if (randomCount >= operatorNumber) {
            //sortedRandomNumbers.splice(0, operatorNumber);
          } else {
            //INVALID
            this.HasError = -4;
          }
        }
        else if (_dice.indexOf('DH') > -1) {
          let __dice = _dice.trim(); // diceArray[diceArr].trim();
          let operatorValArray = this.splitWithoutEmpty(__dice, 'DH');
          operator = "DH";
          operatorNumber = +operatorValArray[0].trim();
          //1,2,3,4,5
          if (randomCount >= operatorNumber) {
            //sortedRandomNumbers.splice(sortedRandomNumbers.length - operatorNumber, sortedRandomNumbers.length);
          } else {
            //INVALID
            this.HasError = -5;
          }
        }
        else if (+_dice) {
          randomCount = +_dice;
          randomNumbers = _dice;
          randomNumbersSum = +_dice;
          sortedRandomNumbers.push(+randomNumbers);
          diceWithoutMultipleSign = true;
        }
        else {
          //INVALID
          this.HasError = -6;
        }
      }
    }
  }
  public getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  public CascadeExplodeDice() {
    let cascadeNumbersArray = [];
    this.diceRolledData.map((diceRoll) => {
      cascadeNumbersArray = cascadeNumbersArray.concat(this.GetCascadeNumbersArray(diceRoll));
      //this.cascadeDiceEffectCount = 0;
      //this.cascadeDiceDisplayLength = 0;
      //this.cascadeDiceEffectCurrentCount = 0;

      //this.cascadeDiceEffectCount = cascadeNumbersArray.length;
      //this.cascadeDiceDisplayLength = cascadeNumbersArray[this.cascadeDiceEffectCurrentCount].length;
      //this.cascadeDiceEffectCurrentCount = this.cascadeDiceEffectCurrentCount + 1;
      //this.CascadeExplodeDiceTimeOutCall(cascadeNumbersArray);
    })


    //let cascadeNumbersArray = this.GetCascadeNumbersArray(this.diceRolledData[0]);      

    this.cascadeDiceEffectCount = cascadeNumbersArray.length;
    this.cascadeDiceDisplayLength = cascadeNumbersArray[this.cascadeDiceEffectCurrentCount].length;
    this.cascadeDiceEffectCurrentCount = this.cascadeDiceEffectCurrentCount + 1;
    this.CascadeExplodeDiceTimeOutCall(cascadeNumbersArray);


  }
  CascadeExplodeDiceTimeOutCall(cascadeNumbersArray) {
    try { this.cascadeDiceDisplayLength += cascadeNumbersArray[this.cascadeDiceEffectCurrentCount].length; }
    catch (ex) { }

    setTimeout(() => {
      this.diceRolledData.map((diceRoll, index) => {
        if (!diceRoll.static) {

          diceRoll.randomNumbersList.map((num, index) => {


            if (num.hideExplode && index < this.cascadeDiceDisplayLength) {
              num.isAnimated = num.hideExplode ? true : false;
              num.hideExplode = false;
            }

            //if (((index + 1) > diceRoll.randomCount) ) {

            //}
          });
        }
      });
      setTimeout(() => {
        this.diceRolledData.map((diceRoll, index) => {
          if (!diceRoll.static) {

            diceRoll.randomNumbersList.map((num, index) => {
              if (index < this.cascadeDiceDisplayLength) {
                num.isAnimated = false;

              }

            });
          }
        });


        if (this.cascadeDiceEffectCount <= 2) {
          this.HideResult = false;
        } else {
          this.cascadeDiceEffectCurrentCount = this.cascadeDiceEffectCurrentCount + 1;
          this.cascadeDiceEffectCount = this.cascadeDiceEffectCount - 1;
          this.CascadeExplodeDiceTimeOutCall(cascadeNumbersArray);
        }
        //////////////////////////////////
        //check all dices are visible now
        let displayResult = true;
        this.diceRolledData.map((diceRoll, index) => {
          diceRoll.randomNumbersList.map((num, index) => {
            if (num.isAnimated) {
              displayResult = false;
            }
          });
        });
        if (displayResult) {
          this.HideResult = false;
        }
        //////////////////////////////////
      }, 2000);
    }, 1);
  }
  GetCascadeNumbersArray(diceRoll): any[] {

    let CascaseArrayOfExplodedDice = [];
    let numArray = diceRoll.randomNumbersListAfter;
    console.log(diceRoll.randomNumbersListAfter);

    let mainNumArr = numArray.slice(0, diceRoll.randomCount);
    CascaseArrayOfExplodedDice.push(mainNumArr);

    let explodeLength = mainNumArr.filter(x => x == diceRoll.diceNumber).length;

    let removeNumberLength = mainNumArr.length;
    while (explodeLength != 0) {
      let newArr = numArray.slice((removeNumberLength), ((removeNumberLength) + explodeLength));
      explodeLength = newArr.filter(x => x == diceRoll.diceNumber).length;
      removeNumberLength = removeNumberLength + newArr.length;
      CascaseArrayOfExplodedDice.push(newArr);

    }
    //if (diceRoll.randomCount < diceRoll.randomNumbersList.length) {
    //    diceRoll.randomNumbersList.map((num,index) => {
    //        if (index + 1 > diceRoll.randomCount) {

    //        }
    //    })
    //}
    console.log(CascaseArrayOfExplodedDice);
    return CascaseArrayOfExplodedDice;
  }
  public fillBeforeAndAfterText(command: string, IsInitialRoll: boolean = false) {
    //if (IsInitialRoll) {
    //  this.allCommandsWithText = DiceService.splitWithoutEmpty(command, ' ');
    //}

    return DiceService.fillBeforeAndAfterText(command);
  }

  diceRedirection() {
    switch (this.recordType) {
      case 'item':
        this.diceNav = '/character/inventory-details/' + this.recordId;
        break;

      case 'spell':
        this.diceNav = '/character/spell-details/' + this.recordId;
        break;

      case 'ability':
        this.diceNav = '/character/ability-details/' + this.recordId;
        break;

      case 'ch-rs-ability':
        this.diceNav = '/character/ruleset/ability-details/' + this.recordId;
        break;

      case 'ch-rs-spell':
        this.diceNav = '/character/ruleset/spell-details/' + this.recordId;
        break;

      default:
        this.diceNav = '/character/dashboard';
        break;
    }
  }

  navigateDice(diceNav) {
    this.bsModalRef.hide();
    this.router.navigate([diceNav]);
  }
  getQuotesCommandText(oldText: string, NewDiceCountNumber: number, Dice: string): string {
    if (NewDiceCountNumber>2) {
      let OldUpdatedDiceValue = (NewDiceCountNumber - 1).toString() + Dice;
      let newUpdatedDiceValue = NewDiceCountNumber.toString() + Dice;
      return oldText.replace(OldUpdatedDiceValue, newUpdatedDiceValue);
    }    
    return NewDiceCountNumber.toString() + Dice;
  }

  onClickRollAll(characterCommandModel, mainCommandText) {
    this.onClickRoll(characterCommandModel, mainCommandText);
  }
}
