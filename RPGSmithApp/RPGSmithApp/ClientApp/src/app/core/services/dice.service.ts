import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { DICE, DICE_ICON, COMMAND_OPERATOR, CustomDiceResultType } from '../models/enums';
import { CharacterCommand, DiceCommand } from '../models/view-models/character-command.model';
import { DiceRoll } from '../models/view-models/dice-roll.model';
import { CustomDice, DiceTray, Results } from '../models/view-models/custome-dice.model';
import { Utilities } from '../common/utilities';
import { AlertService } from '../common/alert.service';

@Injectable()
export class DiceService {

  private static SelectedDiceWithValue: any = {};
  private static SelectedOperatorWithValue: any = {};
  private static Error: string = "";
  private static HasError: number;
  public static totalAndLimit: number = 6;
  private static readonly  AND_Error_Message: string = "Only 5 ‘AND’s allowed in one command string. Please update your command and try again.";
  private static readonly COMMAND_Error = "Invalid Command. Please check the command string and try again.";
  public static colorResult: any;

  //public static isInvalidFECommand: boolean = false;
  public static copyToClipboard(value: string) {
    let copiedBox = document.createElement('textarea');
    copiedBox.style.position = 'fixed';
    copiedBox.style.left = '0';
    copiedBox.style.top = '0';
    copiedBox.style.opacity = '0';
    copiedBox.value = value;
    document.body.appendChild(copiedBox);
    copiedBox.focus();
    copiedBox.select();
    document.execCommand('copy');
    document.body.removeChild(copiedBox);
  }


  /**
   * @method commandInterpretation
   * @param command
  */

  public static commandInterpretation(command: string, numberToAdd?: number, modArray?: any, customDices: CustomDice[] = [],mainCommandText:string=''): any {
  
    let _commandInterpretationArrayList = [];
    let _calculationCommand = "";

    if (!command) return [];
    //example command:  d4 + 2d6 * d8 - 2d10 kh1 / d12 + (d20 + d100 / 5) AND (4d6 kh3 / 5 ru) + (4d6 kh2 / 5 rd)
    let _commandInterpretationArray = this.commandInterpretationArray(command, customDices, mainCommandText);
    let diceARRAY = [];
    let isInvalidFECommand = false;
    //iteration for AND
    for (var cmd in _commandInterpretationArray) {
      if (_commandInterpretationArray[cmd].isInvalidFECommand) {
        isInvalidFECommand = true;
      }
     
      let _finalInterpretationArray = [];
      let _calculationString = "";
      let _calculationString_withColor = "";
      let _calculationStringForResult = "";
      let _operator = "";
      let _commandArray = _commandInterpretationArray[cmd].commandArray;
      let checkLastCommandString = '';
      
      //iteration for command
      for (var cmdArr in _commandArray) {
        let _sign = ' ' + _commandArray[cmdArr].sign + ' ';
        if (_commandArray[cmdArr].parenthesis) {
          let __calculationString = "";
          let __calculationString_withColor = "";
          let _diceArray = _commandArray[cmdArr].diceArray;

          for (var diceArr in _diceArray) {
            if (_diceArray[diceArr].isFeDice) {
              __calculationString +=
                __calculationString == ""
                ?
                (_calculationString == "" ? (_sign.trim() == '-' ? _sign : '') : _sign) + ' ( ' + (_diceArray[diceArr].sign.trim() == '-' ? _diceArray[diceArr].sign : '') + _diceArray[diceArr].diceInterpretationArray.feTotal
                  :
                  _diceArray[diceArr].sign + _diceArray[diceArr].diceInterpretationArray.feTotal;

              __calculationString_withColor +=
                __calculationString_withColor == ""
                  ?
                  (_calculationString_withColor == "" ? (_sign.trim() == '-' ? _sign : '') : _sign) + ' ( ' + (_diceArray[diceArr].sign.trim() == '-' ? _diceArray[diceArr].sign : '') + _diceArray[diceArr].diceInterpretationArray.feTotal
                  :
                  _diceArray[diceArr].sign + _diceArray[diceArr].diceInterpretationArray.feTotal;
              //'( ' + _diceArray[diceArr].diceInterpretationArray.feTotal + ' ';
            }
            else {
              __calculationString += __calculationString == "" ? (_calculationString == "" ? (_sign.trim() == '-' ? _sign : '') : _sign) + ' ( ' + (_diceArray[diceArr].sign.trim() == '-' ? _diceArray[diceArr].sign : '') + _diceArray[diceArr].diceInterpretationArray.randomNumbersAfter
                : _diceArray[diceArr].sign + _diceArray[diceArr].diceInterpretationArray.randomNumbersAfter;
              __calculationString_withColor += __calculationString_withColor == "" ? (_calculationString_withColor == "" ? (_sign.trim() == '-' ? _sign : '') : _sign) + ' ( ' + (_diceArray[diceArr].sign.trim() == '-' ? _diceArray[diceArr].sign : '') + this.GetColoredNumber(_diceArray[diceArr].diceInterpretationArray)
                : _diceArray[diceArr].sign + this.GetColoredNumber(_diceArray[diceArr].diceInterpretationArray);
            }
            

            _finalInterpretationArray.push(this.calsInterpretationArray(_diceArray[diceArr], +cmd));

            if (_diceArray.length - 1 === +diceArr) {
              //if (!_commandArray[cmdArr].isCustomDice)
              _calculationString += __calculationString + ' ) ';
              _calculationString_withColor += __calculationString_withColor + ' ) ';
            }

            ///20-dec-18
            let checkLastCommandStringReplaceTo = "";
            checkLastCommandString += _diceArray[diceArr].sign + _diceArray[diceArr].diceInterpretationArray.randomNumbersAfter;

            try {
              _operator = _diceArray[diceArr].diceInterpretationArray.operator;
              if (_operator == 'RU') {
                checkLastCommandStringReplaceTo = Math.ceil(eval(checkLastCommandString)).toString();
              } else if (_operator == 'RD') {
                checkLastCommandStringReplaceTo = Math.floor(eval(checkLastCommandString)).toString();
              }
            } catch (err) { }

            _calculationStringForResult = _calculationString.replace(/  /g, ' ');
            if (checkLastCommandStringReplaceTo !== "") {
              _calculationStringForResult = _calculationStringForResult.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
            }
            checkLastCommandString = _diceArray[diceArr].diceInterpretationArray.randomNumbersAfter;
          }

        }
        else if (_commandArray[cmdArr].addMod) {

          let modValue: number = 0;
          if (modArray)
            modArray.map(mod => {
              //let charactersCharacterStatId = mod.charactersCharacterStatId;
              //let selectedStatValue = mod.selectedStatValue;
              let selectedStat: string = mod.selectedStat;
              if (_commandArray[cmdArr].dice === selectedStat) {
                modValue = +mod.selectedStatValue;
              }
            });

          try {
            _commandArray[cmdArr].diceInterpretationArray.randomNumbers = modValue;
            _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter = modValue;
            //_commandArray[cmdArr].diceInterpretationArray.randomNumbersList = modValue;
            //_commandArray[cmdArr].diceInterpretationArray.randomNumbersListAfter = modValue;
            _commandArray[cmdArr].diceInterpretationArray.randomNumbersSum = +modValue;
            _commandArray[cmdArr].diceInterpretationArray.randomNumbersSumAfter = +modValue;
            _commandArray[cmdArr].static = true;

            _finalInterpretationArray.push(this.calsInterpretationArray(_commandArray[cmdArr], +cmd));
          } catch (err) { }

          //if (!_commandArray[cmdArr].isCustomDice)
          _calculationString += _calculationString == "" ? (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + modValue : _sign + modValue;
          _calculationString_withColor += _calculationString_withColor == "" ? (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + modValue : _sign + modValue;

          _calculationStringForResult = _calculationString;
        }
        else {
          let checkLastCommandStringReplaceTo = "";
          checkLastCommandString += _commandArray[cmdArr].sign + _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter;

          try {
            _operator = _commandArray[cmdArr].diceInterpretationArray.operator;
            if (_operator == 'RU') {
              checkLastCommandStringReplaceTo = Math.ceil(eval(checkLastCommandString)).toString();
            } else if (_operator == 'RD') {
              checkLastCommandStringReplaceTo = Math.floor(eval(checkLastCommandString)).toString();
            }
          } catch (err) { }

          //if (!_commandArray[cmdArr].isCustomDice)
          
          if (this.IsImageDiceWithNonNumeric(_commandArray[cmdArr].dice, customDices)) {
            _calculationString +=
              _calculationString == "" ?
                (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + '[Image]'
                :
                _sign + '[Image]';
            _calculationString_withColor +=
              _calculationString_withColor == "" ?
                (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + '[Image]'
                :
                _sign + '[Image]';
          }
          else {
            _calculationString +=
              _calculationString == ""
              ?
              (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter
                :
                _sign + _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter;
          
            _calculationString_withColor +=
              _calculationString_withColor == ""
              ?
              (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + this.GetColoredNumber(_commandArray[cmdArr].diceInterpretationArray)
                :
              _sign + this.GetColoredNumber(_commandArray[cmdArr].diceInterpretationArray);
          }
          //debugger;
          //let coloerdNumber = this.GetColoredNumber(_commandArray[cmdArr].diceInterpretationArray);
          //console.log("coloerdNumber", coloerdNumber);

          _finalInterpretationArray.push(this.calsInterpretationArray(_commandArray[cmdArr], +cmd));

          _calculationStringForResult = _calculationString.replace(/  /g, ' ');
          if (checkLastCommandStringReplaceTo !== "") {
            //let newstring = _calculationStringForResult.replace('(', '').replace(')', '').replace(/ /g, '');
            //let res = newstring.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
            //checkLastCommandString = checkLastCommandString.replace(/ /g, '');
            //_calculationStringForResult = newstring.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
            _calculationStringForResult = _calculationStringForResult.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
          }

          checkLastCommandString = _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter;
        }

        if (_commandArray[cmdArr].isCustomDice) {

          //_calculationString = '';
          //if (_commandArray[cmdArr].isCustomNumeric) {
          //    _calculationString += _commandArray[cmdArr].diceInterpretationArray.randomNumbersListAfter.join(' + ');
          //}
          //else {
          //    _calculationString += _commandArray[cmdArr].diceInterpretationArray.randomNumbersListAfter.join(', ');
          //}
          _calculationString = _calculationString.replace(/  /g, ' ');
          _calculationString_withColor = _calculationString_withColor.replace(/  /g, ' ');
          _calculationStringForResult = _calculationString.replace(/  /g, ' ');


        }

      }

      //_calculationString = _calculationString.replace(/  /g, ' ');
      try {
        if (_calculationString.split("((").length - 1 === _calculationString.split("))").length - 1) {
          _calculationString = _calculationString.replace('((', '(').replace('))', ')');
          _calculationString_withColor = _calculationString_withColor.replace('((', '(').replace('))', ')');
        }
      } catch (err) { }
      if (_calculationString.length > 1) {
        _calculationString = _calculationString.replace(/  /g, ' ');
        _calculationString_withColor = _calculationString_withColor.replace(/  /g, ' ');
        _calculationString.split('+ -').map((x) => {
          _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        _calculationString.split('+ *').map((x) => {
          _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        _calculationString.split('+ /').map((x) => {
          _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        _calculationString.split('+ +').map((x) => {
          _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        _calculationString.split('- -').map((x) => {
          _calculationString = _calculationString.replace('- -', '-');
          _calculationString_withColor = _calculationString_withColor.replace('- -', '-');
        })
      }
      _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');
      _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');

      if (numberToAdd) {

        _calculationString = _calculationString + ' + ' + numberToAdd;
        _calculationString_withColor = _calculationString_withColor + ' + ' + numberToAdd;
        _calculationStringForResult = _calculationStringForResult + ' + ' + numberToAdd;
        _commandInterpretationArray[cmd] = Object.assign(_commandInterpretationArray[cmd], { command: _commandInterpretationArray[cmd].command + ' + ' + numberToAdd })
      }

      //let _calculationStringArray = this.splitByMultiSeparator(calculationStringForArray, ['+', '-', '/', '*']);

      _calculationString = _calculationString.replace(/  /g, ' ');
      _calculationString_withColor = _calculationString_withColor.replace(/  /g, ' ');

      let _calculationStringArray = this.getCalculationStringArray(_calculationString, undefined);

      let __result = 0;

      let __IsResultWithCustomDice = true;
      try {

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
        __result = Math.round(eval(_calculationStringForResult));
        if (_commandInterpretationArray[cmd].command.indexOf('RU') > -1)
          __result = Math.ceil(eval(_calculationStringForResult));
        else if (_commandInterpretationArray[cmd].command.indexOf('RD') > -1)
          __result = Math.floor(eval(_calculationStringForResult));
        __IsResultWithCustomDice = false;


        let IsNonNumericCommandIncluded: boolean = false;
        _commandArray.map((c) => {
          if (c.isCustomDice && !c.isCustomNumeric) {
            IsNonNumericCommandIncluded = true;
          }
        })

        if (IsNonNumericCommandIncluded) {
          __IsResultWithCustomDice = true;
          if (isNaN(__result)) {
            __result = 0;
          }
        }

        //if (_commandInterpretationArray[cmd].isCustomNumericCommand) {

        //}
        //if (_commandArray[0].isCustomDice && !_commandInterpretationArray[cmd].isCustomNumericCommand) {
        //    __result = 0
        //    __IsResultWithCustomDice = true;
        //}
      }
      catch (exe) {
        __result = 0
        __IsResultWithCustomDice = true;

      }
      
      let textResult = this.fillBeforeAndAfterText(_commandInterpretationArray[cmd].command);
      let beforeResultText = textResult.start;
      let afterResultText = textResult.end;
      _commandInterpretationArrayList.push({
        calculationString: _calculationString,
        calculationStringArray: _calculationStringArray,
        calculationResult: __result, //Math.round(eval(_calculationStringForResult)), //Math.floor(eval(_calculationString))
        calculationCommand: _commandInterpretationArray[cmd].command,
        calculationMainCommand: _commandInterpretationArray[cmd].mainCommand,
        calculationArray: _finalInterpretationArray,
        calculationIndex: +cmd,
        isResultWithCustomDice: __IsResultWithCustomDice,
        isCustomNumericCommand: _commandInterpretationArray[cmd].isCustomNumericCommand ? true : false,
        beforeResult: beforeResultText,
        afterResult: afterResultText,
        isInvalidFECommand: isInvalidFECommand,
        calculationStringColor: _calculationString_withColor
      });
    }

    return _commandInterpretationArrayList;
  }

  public static GetColoredNumber(cmdArrar) {
    let randomNumbersAfterString = cmdArrar.randomNumbersAfter
    let coloredNumber = cmdArrar.randomNumbersList;
    
    //let numsCheked = [];
    coloredNumber.map(y => {
      let Number = '';
      //if (!numsCheked.find(x=>x==y.number)) {
      //  if (y.number && y.number == 1) {
      //    Number = '<span style="color:red;"><b class="bold-command-result">' + y.number + '</b></span>'
      //  } else if (y.number && y.number == cmdArrar.diceNumber) {
      //    Number = '<span style="color:green;"><b class="bold-command-result">' + y.number + '</b></span>'
      //  } else if (cmdArrar.diceNumber){
      //    Number = '<span style="color:white;"><b class="bold-command-result">' + y.number + '</b></span>'
      //  }
      //  else {
      //    Number = '<span style="color: #a7a2a2;">' + y.number + '</span>';
      //  }
      //  numsCheked.push(y.number);
      //  let expression = new RegExp(y.number,'g');
      //  randomNumbersAfterString=randomNumbersAfterString.replace(expression, Number);
      //}

      if (cmdArrar.diceNumber) {
        if (y.number && y.number == 1) {
          Number = '<span style="color:red;"><b class="bold-command-result">' + y.number + '</b></span>'
        } else if (y.number && y.number == cmdArrar.diceNumber) {
          Number = '<span style="color:green;"><b class="bold-command-result">' + y.number + '</b></span>'
        } else {
          Number = '<span style="color:white;"><b class="bold-command-result">' + y.number + '</b></span>'
        }
      } else {
        Number = '<span style="color: #a7a2a2;">' + y.number + '</span>';
      }
      if (y.number && y.number == 1) {
        let expression = new RegExp(" " + y.number + " ");
        randomNumbersAfterString = randomNumbersAfterString.replace(expression, " " + Number + " ");
      } else {
        let expression = new RegExp(" " + y.number + " ", 'g');
        randomNumbersAfterString = randomNumbersAfterString.replace(expression, " " + Number + " ");
      }
     
    });
    return randomNumbersAfterString;

  }
  private static calsInterpretationArray(_commandArray: any, _calculationIndex: number): any {
    let _diceInterpretationArray = _commandArray.diceInterpretationArray;
    if (_commandArray.isCustomDice) {
      return {
        dice: _commandArray.dice,
        diceIcon: _commandArray.iconClass,
        diceNumber: 0,
        operator: '',
        operatorNumber: '',
        randomCount: _diceInterpretationArray.randomCount,
        randomNumbers: _diceInterpretationArray.randomNumbers,
        randomNumbersList: _diceInterpretationArray.randomNumbersList,
        randomNumbersListAfter: _diceInterpretationArray.randomNumbersListAfter,
        randomNumbersSum: '',
        randomNumbersAfter: _diceInterpretationArray.randomNumbersAfter,
        randomNumbersSumAfter: '',
        sign: _commandArray.sign,
        static: false,
        calculationIndex: _calculationIndex,
        isCustomDice: true,
        isCustomNumeric: _commandArray.isCustomNumeric,
        isExploded: _commandArray.isExploded,
        feCommand: '',
        allDicesPresentInFE:[]
      }
    }
    return {
      dice: _commandArray.static ? "" : (+_diceInterpretationArray.diceNumber == 0 ? "" : "D" + _diceInterpretationArray.diceNumber),
      diceIcon: this.getDiceIcon(_commandArray.static ? "" : (+_diceInterpretationArray.diceNumber == 0 ? "" : "D" + _diceInterpretationArray.diceNumber)),
      diceNumber: _diceInterpretationArray.diceNumber,
      operator: _diceInterpretationArray.operator,
      operatorNumber: _diceInterpretationArray.operatorNumber,
      randomCount: _diceInterpretationArray.randomCount,
      randomNumbers: _diceInterpretationArray.randomNumbers,
      randomNumbersList: _diceInterpretationArray.randomNumbersList,
      randomNumbersListAfter: _diceInterpretationArray.randomNumbersListAfter,
      randomNumbersSum: _diceInterpretationArray.randomNumbersSum,
      randomNumbersAfter: _diceInterpretationArray.randomNumbersAfter,
      randomNumbersSumAfter: _diceInterpretationArray.randomNumbersSumAfter,
      sign: _commandArray.sign,
      static: _commandArray.static,
      calculationIndex: _calculationIndex,
      isCustomDice: false,
      isCustomNumeric: false,
      isExploded: _commandArray.isExploded,
      feCommand: _commandArray.dice,
      allDicesPresentInFE:_diceInterpretationArray.allDicesPresentInFE
    };
  }

  public static commandInterpretationArray(command: string, customDices: CustomDice[] = [], mainCommandText: string = ''): any[] {    
    let _commandInterpretationArray = [];
    let commandText = command.trim().toUpperCase();

    //Split multiple commands -AND
    let multiCommandArray = this.splitWithoutEmpty(commandText, 'AND');
    let multiMainCommandArray = this.splitWithoutEmpty(mainCommandText, 'AND');
   
    let diceARRAY = [];
    for (var cmd in multiCommandArray) {
      let _commandText = multiCommandArray[cmd];
      _commandText = _commandText.trim();

      diceARRAY = this.splitCommandToArray(_commandText, customDices);
  
      //split command again if it has parenthesis
      for (var arr in diceARRAY) {
        
        if (diceARRAY[arr].parenthesis) {
          let _commandTxt = diceARRAY[arr].dice.replace('(', '').replace(')', '');
          _commandTxt = diceARRAY[arr].sign + _commandTxt;
          
          let IsFEDice = _commandTxt.indexOf('FE') > -1 ? true : false;
          diceARRAY[arr].diceArray = this.splitCommandToArray(_commandTxt, [], IsFEDice);
          //diceARRAY[arr].FeCommand = _commandTxt;
         
        }
      }

      let IsCustomNumericCommand = false;
      let isInvalidFECommand = false;
      if (customDices.length > 0) {
        IsCustomNumericCommand = true;

        diceARRAY.map((cmd) => {
          if (!cmd.isCustomNumeric) {
            IsCustomNumericCommand = false;
          }          
        })
      }
      diceARRAY.map((cmd) => {        
        if (cmd.diceArray) {
          if (cmd.diceArray.length) {
            cmd.diceArray.map((x) => {
              if (x.isInvalidFECommand) {
                isInvalidFECommand = true;
              }
            })
           
          }
          
        }
      })
      
      _commandInterpretationArray.push({
        command: _commandText,
        commandArray: diceARRAY,
        calculationString: "",
        calculationResult: 0,
        isCustomNumericCommand: IsCustomNumericCommand,
        isInvalidFECommand: isInvalidFECommand,
        mainCommand: multiMainCommandArray[cmd]
      });
    }

    
    return _commandInterpretationArray;
  }

  public static splitCommandToArray(_commandText: string, customDices: CustomDice[] = [], IsFeDice = false): any[] {
    
    let diceARRAY = [];
    let parenthesis = false;
    let addMod = false;
    let diceValue = "";
    let diceSign = " + ";
    let diceOperation = "";
    let isSingleQuotes = false;
    let isDoubleQuotes = false;
    let isSingleQuotesStarted = false;
    let isDoubleQuotesStarted = false;

    for (var x = 0; x < _commandText.length; x++) {
      
      if (isSingleQuotes || isDoubleQuotes || addMod || parenthesis || (_commandText[x] != '+' && _commandText[x] != "-" && _commandText[x] != "*" && _commandText[x] != "/") || (IsFeDice && diceValue.toUpperCase().indexOf('FE')>-1)) {
        diceValue += _commandText[x];
        if (_commandText[x] == '(' && !addMod && !isSingleQuotesStarted && !isDoubleQuotesStarted) { //|| parenthesis) {
          //diceSign = _commandText[x - 1]
          parenthesis = true;
        }
        else if (_commandText[x] == ')' && !addMod && !isSingleQuotesStarted && !isDoubleQuotesStarted) {
          if (diceValue.trim() !== '') {
            
            diceARRAY.push({
              dice: diceValue.trim(),
              sign: diceSign,
              diceArray: [],
              parenthesis: true,
              addMod: false,
              static: +diceValue.trim() ? true : false, // : (+diceValue.split("D")[1] > 0 ? false : true),
              diceInterpretationArray: {}
            });
          }
          parenthesis = false;
          diceValue = '';
        }

        else if (_commandText[x] == '[' && !isSingleQuotesStarted && !isDoubleQuotesStarted) { //|| parenthesis) {
          //diceSign = _commandText[x - 1]
          addMod = true;
        }
        else if (_commandText[x] == ']' && !isSingleQuotesStarted && !isDoubleQuotesStarted) {
          if (diceValue.trim() !== '') {
            
            diceARRAY.push({
              dice: diceValue.trim(),
              sign: diceSign,
              diceArray: [],
              parenthesis: false,
              addMod: true,
              static: +diceValue.trim() ? true : false, // : (+diceValue.split("D")[1] > 0 ? false : true),
              diceInterpretationArray: {
                diceNumber: 0,
                randomCount: 0,
                randomNumbers: "",
                randomNumbersList: [],
                randomNumbersListAfter: [],
                randomNumbersSum: 0,
                randomNumbersAfter: "0",
                randomNumbersSumAfter: "0",
                operator: '',
                operatorNumber: 0,
                isInvalidFECommand: false,
                isFeDice:false
              }
            });
          }
          addMod = false;
          diceValue = '';
        }
        else if (_commandText[x] == "'" && !isSingleQuotesStarted) {
          isSingleQuotes = true;
          //diceValue += diceValue;
          isSingleQuotesStarted = true;
        }
        else if (_commandText[x] == "'" && isSingleQuotesStarted) {
          isSingleQuotes = false;
          //diceValue += diceValue;
          isSingleQuotesStarted = false;
        }
        else if (_commandText[x] == '"' && !isDoubleQuotesStarted) {
          isDoubleQuotes = true;
          //diceValue += diceValue;
          isDoubleQuotesStarted = true;
        }
        else if (_commandText[x] == '"' && isDoubleQuotesStarted) {
          isDoubleQuotes = false;
          //diceValue += diceValue;
          isDoubleQuotesStarted = false;
        }
        

        if (x == _commandText.length - 1 && !isDoubleQuotesStarted && !isSingleQuotesStarted) {
          if (diceValue.trim() !== '') {
            let temp_diceInterpretationArray = this.diceInterpretationArray(diceValue.trim(), IsFeDice);
            diceARRAY.push({
              dice: diceValue.trim(),
              sign: diceSign,
              diceArray: [],
              parenthesis: false,
              addMod: false,
              static: +diceValue.trim() ? true : false, //(+diceValue.split("D")[1] > 0 ? false : true),
              diceInterpretationArray: temp_diceInterpretationArray,
              isInvalidFECommand: this.CheckValidFECommand(temp_diceInterpretationArray),
              isFeDice: this.CheckIsFECommand(temp_diceInterpretationArray)
            });
          }
          diceValue = '';
        }
      }
      else if ((_commandText[x] == '+' || _commandText[x] == "-" || _commandText[x] == "*" || _commandText[x] == "/") && !IsFeDice) {
        if (diceValue.trim() !== '') {
          let temp_diceInterpretationArray = this.diceInterpretationArray(diceValue.trim(), IsFeDice);
          diceARRAY.push({
            dice: diceValue.trim(),
            sign: diceSign,
            diceArray: [],
            parenthesis: false,
            addMod: false,
            //isCustom: false,
            static: +diceValue.trim() ? true : false, //(+diceValue.split("D")[1] > 0 ? false : true),
            diceInterpretationArray: temp_diceInterpretationArray,
            isInvalidFECommand: this.CheckValidFECommand(temp_diceInterpretationArray),
            isFeDice: this.CheckIsFECommand(temp_diceInterpretationArray)
          });
        }
        diceSign = ' ' + _commandText[x] + ' ';
        diceValue = '';
      }
      else {
        //INVALID
      }
    }

    if (diceARRAY.length > 0 && customDices.length > 0) {
      diceARRAY.map((d) => {
        d.isCustomDice = false;
        d.isCustomNumeric = false;
        //Explode
        d.isExploded = false;
        //let exRandomCount = 0;

        //skip letter D from Dice Name------Start--------

        //let diceValArray = d.dice.split('D')
   
        let diceValArray = d.dice.replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_')

        //skip letter D from Dice Name------End--------


        //exRandomCount = diceValArray[0] == "" ? 1 : (+diceValArray[0] < 1 ? 1 : +diceValArray[0]);
        if (d.dice.indexOf('!') > 1) {
          let diceValueExcludeExplode = diceValArray[1].indexOf('!') > -1 ? diceValArray[1].replace(/!/g, '') : diceValArray[1];

          if (diceValArray[1].indexOf('!') > -1) {
            if (!(diceValArray[1].split('!').length > 2) && !(+diceValueExcludeExplode == 1)) {
              d.isExploded = true;
            }
          }
        }
        // End Explode
        if (d.dice.length >= 2) {

          //skip letter D from Dice Name------Start--------

          //let arr = d.dice.split('D');

          let arr = d.dice.replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_');

          //skip letter D from Dice Name------End--------

          let CountOfDice = 1;
          if (arr.length > 1) {
            if (/^-?[0-9]\d*(\\d+)?$/g.test(arr[0])) {
              CountOfDice = parseInt(arr[0]);
            }
          }
          if (d.dice.toUpperCase().charAt(arr[0].length) == 'D' && /^[a-zA-Z]/.test(d.dice.toUpperCase().charAt(arr[0].length + 1))) {
            let _randomNumbersList = [];
            let _randomNumbersListAfter = [];
            //customDices.map((x) => {
            let cDice: CustomDice[] = customDices.filter(x => x.name.toUpperCase() == "D" + arr[1].toUpperCase());
            //if (x.name.toUpperCase() == d.dice.toUpperCase()) {
            if (cDice.length > 0) {
              for (var i = 0; i < CountOfDice; i++) {
                let randomIndex = (Math.floor((Math.random() * (cDice[0].results.length)) + 1)) - 1;
                let resultName = cDice[0].results[randomIndex].name;
                if (cDice[0].isNumeric) {
                  if (!resultName) {
                    resultName = "0";
                  }
                }
                let randomResult = resultName;
                _randomNumbersListAfter.push(randomResult);
                _randomNumbersList.push({
                  index: i,
                  number: randomResult,
                  isMax: false,
                  isMin: false,
                  isHighest: false,
                  isLowest: false,
                  isShowReroll: false,
                  isAnimated: false,
                  isKept: false
                })
              }
              //int randomIndex

              //2Dt1 => Dt1=a,b,1,2,c =>
              //d.dice=Dt1
              //d.isCustom=true

              //2Dsx1=> 1,3,5,7 =>
              //d.dice=Dsx1
              //=> ranmcount=2=>

              //}
              // })
              let seperator = cDice[0].isNumeric ? ' + ' : ' , ';
              d.diceInterpretationArray = {
                diceNumber: 0,
                randomCount: CountOfDice, //2
                randomNumbers: _randomNumbersListAfter.join(" + "),
                randomNumbersAfter: _randomNumbersListAfter.length > 1 ? ' ( ' + _randomNumbersListAfter.join(seperator) + ' ) ' : _randomNumbersListAfter.join(seperator),
                randomNumbersList: _randomNumbersList,//[{a,sign,isRoll},{c,...}]
                randomNumbersListAfter: _randomNumbersListAfter,//[a,c]
                randomNumbersSum: 0,

                randomNumbersSumAfter: "",
                operator: '',
                operatorNumber: 0
              }
              d.isCustomDice = true;
              d.dice = cDice[0].name;
              d.iconClass = cDice[0].icon;
              d.isCustomNumeric = cDice[0].isNumeric;
            }
            //fate dice changes
            else if (arr[1].toUpperCase() =='F') {
           // else if (arr[1].toUpperCase().startsWith('F')) {
              for (var i = 0; i < CountOfDice; i++) {
                let randomIndex = (Math.floor((Math.random() * (3)) + 1)) - 1;
                let resultName = [-1, 0, 1][randomIndex];

                let randomResult = resultName;
                _randomNumbersListAfter.push(randomResult);
                _randomNumbersList.push({
                  index: i,
                  number: randomResult,
                  isMax: false,
                  isMin: false,
                  isHighest: false,
                  isLowest: false,
                  isShowReroll: false,
                  isAnimated: false,
                  isKept: false
                })
              }

              let seperator = ' + ';
              d.diceInterpretationArray = {
                diceNumber: 0,
                randomCount: CountOfDice,
                randomNumbers: _randomNumbersListAfter.join(" + "),
                randomNumbersAfter: _randomNumbersListAfter.length > 1 ? ' ( ' + _randomNumbersListAfter.join(seperator) + ' ) ' : _randomNumbersListAfter.join(seperator),
                randomNumbersList: _randomNumbersList,
                randomNumbersListAfter: _randomNumbersListAfter,
                randomNumbersSum: 0,

                randomNumbersSumAfter: "",
                operator: '',
                operatorNumber: 0
              }
              d.isCustomDice = true;
              d.dice = d.dice.toUpperCase();
              d.iconClass = "icon-Dice-d6-bg";
              d.isCustomNumeric = true;
            }
            else {
              //d.diceInterpretationArray = {
              //    diceNumber: 0,
              //    randomCount: 0, //2
              //    randomNumbers: "",
              //    randomNumbersList: [],//[{a,sign,isRoll},{c,...}]
              //    randomNumbersListAfter: [],//[a,c]
              //    randomNumbersSum: 0,
              //    randomNumbersAfter: "",
              //    randomNumbersSumAfter: "",
              //    operator: '',
              //    operatorNumber: 0
              //}
              d.dice = '';
              d.iconClass = '';
              d.isCustomDice = false;
              d.isCustomNumeric = false;
            }
          }
          else {
            d.isCustomNumeric = true;
          }

        }
      })
    }
    else {
      diceARRAY.map((d) => {
        d.isCustomDice = false;
        d.isCustomNumeric = false;

        //Explode
        d.isExploded = false;
        //let exRandomCount = 0;
          //skip letter D from Dice Name------Start--------

        // let diceValArray = d.dice.split('D')

        let diceValArray = d.dice.replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_');
        
          //skip letter D from Dice Name------End--------
        //exRandomCount = diceValArray[0] == "" ? 1 : (+diceValArray[0] < 1 ? 1 : +diceValArray[0]);
        if (d.dice.indexOf('!') > 1) {
          let diceValueExcludeExplode = diceValArray[1].indexOf('!') > -1 ? diceValArray[1].replace(/!/g, '') : diceValArray[1];

          if (diceValArray[1].indexOf('!') > -1) {
            if (!(diceValArray[1].split('!').length > 2) && !(+diceValueExcludeExplode == 1)) {
              d.isExploded = true;
            }
          }
        }

        // End Explode
        if (d.dice.length >= 2) {
            //skip letter D from Dice Name------Start--------

          //let arr = d.dice.split('D');

          let arr = d.dice.replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_');
          //skip letter D from Dice Name------End--------
          let CountOfDice = 1;
          if (arr.length > 1) {
            if (/^-?[0-9]\d*(\\d+)?$/g.test(arr[0])) {
              CountOfDice = parseInt(arr[0]);
            }
          }
          if (d.dice.toUpperCase().charAt(arr[0].length) == 'D' && /^[a-zA-Z]/.test(d.dice.toUpperCase().charAt(arr[0].length + 1))) {
            let _randomNumbersList = [];
            let _randomNumbersListAfter = [];
            if (arr[1].toUpperCase() == 'F') {
            //if (arr[1].toUpperCase().startsWith('F')) {
              for (var i = 0; i < CountOfDice; i++) {
                let randomIndex = (Math.floor((Math.random() * (3)) + 1)) - 1;
                let resultName = [-1, 0, 1][randomIndex];

                let randomResult = resultName;
                _randomNumbersListAfter.push(randomResult);
                _randomNumbersList.push({
                  index: i,
                  number: randomResult,
                  isMax: false,
                  isMin: false,
                  isHighest: false,
                  isLowest: false,
                  isShowReroll: false,
                  isAnimated: false,
                  isKept: false
                })
              }

              let seperator = ' + ';
              d.diceInterpretationArray = {
                diceNumber: 0,
                randomCount: CountOfDice,
                randomNumbers: _randomNumbersListAfter.join(" + "),
                randomNumbersAfter: _randomNumbersListAfter.length > 1 ? ' ( ' + _randomNumbersListAfter.join(seperator) + ' ) ' : _randomNumbersListAfter.join(seperator),
                randomNumbersList: _randomNumbersList,
                randomNumbersListAfter: _randomNumbersListAfter,
                randomNumbersSum: 0,

                randomNumbersSumAfter: "",
                operator: '',
                operatorNumber: 0
              }
              d.isCustomDice = true;
              d.dice = d.dice.toUpperCase();
              d.iconClass = "icon-Dice-d6-bg";
              d.isCustomNumeric = true;
            }
          }
          else {
            d.isCustomNumeric = true;
          }

        }
      })
    }
    return diceARRAY;
  }

  public static diceInterpretationArray(dice: string, IsFeDice: boolean = false): any {
    let isInvalidFECommand = false;
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
    let sortedRandomNumbersSign: string[] = [];
    let sortedRandomNumbersToShow: number[] = [];
    let sortedRandomNumbersToShowSort: number[] = [];
    let operatorSign;
    let diceWithoutMultipleSign: boolean = false;

    let isMultipleSign: boolean = false;
    let isAddSign: boolean = false;
    let isMinusSign: boolean = false;
    let isDivideSign: boolean = false;

    //example: D4, 2D8, 4D6 KH3, 5 RD
    //let diceArray = this.splitWithoutEmpty(dice, ' ');

    let diceArray: any;
    let IsFE_Dice: boolean=false;
    
    if (IsFeDice) {
      IsFE_Dice = true;
      let FEArray = this.splitWithoutEmpty(dice, 'FE');
      diceArray = FEArray;
      let FE_New_Array: any[] = [];
      FEArray.map((fe) => {
        let flag = true;
        if (fe) {
          if (fe.toUpperCase().indexOf('D')>-1) {
            let fe_variables_arr = this.splitWithoutEmpty(fe, ' ');
            if (fe_variables_arr.length>1) {
              fe_variables_arr.map((fe_var) => {
                if (fe_var) {
                  if (fe_var.toUpperCase().indexOf('D') > -1) {
                    flag = false;

                    let tmpVal = fe.replace(fe_var, '');
                    FE_New_Array.push(tmpVal);
                    FE_New_Array.push(fe_var);
                  }
                }
              })
            }
          }
        }
        if (flag && fe) {
          FE_New_Array.push(fe);
        }  
      })
      if (FE_New_Array.length) {
        diceArray = FE_New_Array;
      }
    }
    else {
      diceArray = this.splitWithoutEmpty(dice, ' ');
    }
    
    let diceArr_fake = 0;
    
    for (var diceArr_original in diceArray) {
      let _dice = diceArray[diceArr_original]
      if (!this.IsAllowedText(_dice)) {
        let diceArr = diceArr_fake;
        if (+diceArr == 0) {
          //let _dice = diceArray[diceArr];
          _dice = _dice.trim().toUpperCase();

          if (_dice.length > 1) {
            //let flag = true;
            //_dice.split('').map((x,index) => {
            //  if (x == '(' && flag) {
            //    _dice.substring(0,)
            //  }
            //})
            _dice = _dice.replace(/\(/g, ' ')
          }
          if (_dice.indexOf('D') > -1) {
            
            let isExplodDice = false;
            let isDiceExploded = false;

            //skip letter D from Dice Name------Start--------
            //let diceValArray = _dice.split('D');
            
            let diceValArray = _dice.replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_');

            //skip letter D from Dice Name----- End---------

           
            randomCount = diceValArray[0] == "" ? 1 : (+diceValArray[0] < 1 ? 1 : +diceValArray[0]);
            let diceValueExcludeExplode = diceValArray[1];
            if (_dice.indexOf('!') > 1) {
              diceValueExcludeExplode = diceValArray[1].indexOf('!') > -1 ? diceValArray[1].replace(/!/g, '') : diceValArray[1];

              if (diceValArray[1].indexOf('!') > -1) {
                if (diceValArray[1].split('!').length > 2) {
                  this.HasError = -1;
                }
                if (+diceValueExcludeExplode == 1) {
                  this.HasError = -1;
                }
                if (!(diceValArray[1].split('!').length > 2) && !(+diceValueExcludeExplode == 1)) {
                  isExplodDice = true;
                }
              }
            }
            diceNumber = diceValueExcludeExplode.trim() == "" ? 1 : +diceValueExcludeExplode;

            for (var x = 1; x <= randomCount; x++) {
              let _getRandom = this.getRandomNumber(1, diceNumber);

              //if (isExplodDice) {
              //    if (diceValueExcludeExplode == _getRandom) { // Dice is Exploded..
              //        isDiceExploded = true;
              //        randomCount = randomCount + 1;
              //    }
              //}
              if (x == randomCount) {
                randomNumbers += _getRandom;
              }
              else {
                randomNumbers += _getRandom + ',';
              }
              randomNumbersSum += _getRandom;

            }

            //randomNumbers.split(',').map((item)=> {
            //    if (isExplodDice) {
            //        if (diceValueExcludeExplode == item) { // Dice is Exploded..
            //            let New_randomCount: number = 1;
            //            let isFirstNumberOfExplodedDice = true;                                
            //            for (var x = 1; x <= New_randomCount; x++) {                                    
            //                let _getRandom = this.getRandomNumber(1, diceNumber);

            //                //if (isExplodDice) {
            //                    if (diceValueExcludeExplode == _getRandom) { // Dice is Exploded..
            //                        isDiceExploded = true;
            //                        New_randomCount = New_randomCount + 1;
            //                    }
            //                //}                                    
            //                if (x == New_randomCount) {
            //                    if (isFirstNumberOfExplodedDice) {
            //                        randomNumbers += ',';
            //                        isFirstNumberOfExplodedDice = false;
            //                    }
            //                    randomNumbers += _getRandom;
            //                }
            //                else {
            //                    if (isFirstNumberOfExplodedDice) {
            //                        randomNumbers += ',';
            //                        isFirstNumberOfExplodedDice = false;
            //                    }
            //                    randomNumbers += _getRandom + ',';
            //                }

            //                randomNumbersSum += _getRandom;

            //            }
            //        }
            //    }
            //});

            if (isExplodDice) {
              //randomNumbers = "4,4,4,4,5";
              let explodeLength = randomNumbers.split(',').filter(x => x == diceValueExcludeExplode).length;
              let CascaseArrayOfExplodedDice = [];
              CascaseArrayOfExplodedDice.push(randomNumbers.split(','));

              while (explodeLength > 0) {
                let newArr = this.getArrayOfNumbersByLength(explodeLength, diceNumber);
                explodeLength = newArr.filter(x => x == diceValueExcludeExplode).length;
                CascaseArrayOfExplodedDice.push(newArr);
              }
              var RandomNumberListWithExplosion = [].concat.apply([], CascaseArrayOfExplodedDice);
              randomNumbers = RandomNumberListWithExplosion.join(',')
              randomNumbersSum = RandomNumberListWithExplosion.reduce((a, b) => +a + +b, 0);
            }

            //sort random number ASC order=1,2,3,4,5
            let _randomNumber = randomNumbers.split(',').map(function (item) {
              return parseInt(item, 10);
            });

            ////to remove sort from dice/////
            var ___sortedNumbersToShowSort: number[] = Object.assign([], _randomNumber);
            var _sortedNumbersSort = ___sortedNumbersToShowSort.sort((n1, n2) => n1 - n2);
            _sortedNumbersSort.forEach((val) => { sortedRandomNumbersToShowSort.push(val); });
            //////////////

            var sortedNumbersToShow: number[] = [];
            var _sortedNumbers = _randomNumber;//.sort((n1, n2) => n1 - n2);
            _sortedNumbers.forEach((val) => { sortedNumbersToShow.push(val); });

            sortedRandomNumbersToShow = sortedNumbersToShow;
            //sortedRandomNumbers = _sortedNumbers;
            randomNumbers = _sortedNumbers.join(" + ");
          } else if (+_dice || _dice=="0") {
            randomCount = +_dice;
            randomNumbers = _dice;
            randomNumbersSum = +_dice;


            let symbol = '+';
            if (+diceArr != 0) {
              if (diceArray[+diceArr - 1] == "-") {
                symbol = diceArray[+diceArr - 1];
              }
              if (diceArray[+diceArr - 1] == "*") {
                symbol = diceArray[+diceArr - 1];
              }
              if (diceArray[+diceArr - 1] == "/") {
                symbol = diceArray[+diceArr - 1];
              }
            }
            sortedRandomNumbersSign.push(symbol);
            sortedRandomNumbers.push(+randomNumbers);
          }
          else {
            //INVALID
            this.HasError = -1;
          }
        }
        else if (+diceArr == 1) {
          try {
            //let _dice = diceArray[diceArr];
            _dice = _dice.trim().toUpperCase();
            if (_dice.length > 1) {
              //let flag = true;
              //_dice.split('').map((x,index) => {
              //  if (x == '(' && flag) {
              //    _dice.substring(0,)
              //  }
              //})
              _dice = _dice.replace(/\(/g, ' ')
            }
            
            if ((_dice.indexOf('RU') > -1) || (_dice.indexOf('RD') > -1)) {
              operator = diceArray[diceArr].trim();
            }
            else if (_dice.indexOf('KL') > -1) {
              let __dice = _dice.trim(); //diceArray[diceArr].trim();
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
              let __dice = _dice.trim(); //diceArray[diceArr].trim();
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
              let __dice = _dice.trim(); //diceArray[diceArr].trim();
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
              let __dice = _dice.trim(); //diceArray[diceArr].trim();
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
            else if (IsFE_Dice) {
              let __dice = _dice.trim(); //diceArray[diceArr].trim();
              let operatorValArray = this.splitWithoutEmpty(__dice, 'FE');
              operator = "FE";
              //operatorNumber = +operatorValArray[0].trim();
              //1,2,3,4,5
              //if (randomCount >= operatorNumber) {
              //  //sortedRandomNumbers.splice(sortedRandomNumbers.length - operatorNumber, sortedRandomNumbers.length);
              //} else {
              //  //INVALID
              //  this.HasError = -5;
              //}
            }
            else if (+_dice || _dice == "0") {
              randomCount = +_dice;
              randomNumbers = _dice;
              randomNumbersSum = +_dice;
              diceWithoutMultipleSign = true;

              let symbol = '+';
              if (+diceArr != 0) {
                if (diceArray[+diceArr - 1] == "-") {
                  symbol = diceArray[+diceArr - 1];
                }
                if (diceArray[+diceArr - 1] == "*") {
                  symbol = diceArray[+diceArr - 1];
                }
                if (diceArray[+diceArr - 1] == "/") {
                  symbol = diceArray[+diceArr - 1];
                }
              }
              sortedRandomNumbersSign.push(symbol);
              sortedRandomNumbers.push(+randomNumbers);
            }
            else {
              //INVALID
              this.HasError = -6;
            }
          } catch (err) {
            this.HasError = -6;
          }
        }
        else if (+diceArr >= 1) {
          try {
           // let _dice = diceArray[diceArr];
            _dice = _dice.trim().toUpperCase();
            if (_dice.length > 1) {
              //let flag = true;
              //_dice.split('').map((x,index) => {
              //  if (x == '(' && flag) {
              //    _dice.substring(0,)
              //  }
              //})
              _dice = _dice.replace(/\(/g, ' ')
            }
            
            if ((_dice.indexOf('RU') > -1) || (_dice.indexOf('RD') > -1)) {
              operator = diceArray[diceArr].trim();
            }
            else if (_dice.indexOf('KL') > -1) {
              let __dice = _dice.trim(); //diceArray[diceArr].trim();
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
              let __dice = _dice.trim(); //diceArray[diceArr].trim();
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
            else if (IsFE_Dice) {
              let __dice = _dice.trim(); //diceArray[diceArr].trim();
              let operatorValArray = this.splitWithoutEmpty(__dice, 'FE');
              operator = "FE";
              //operatorNumber = +operatorValArray[0].trim();
              ////1,2,3,4,5
              //if (randomCount >= operatorNumber) {
              //  //sortedRandomNumbers.splice(sortedRandomNumbers.length - operatorNumber, sortedRandomNumbers.length);
              //} else {
              //  //INVALID
              //  this.HasError = -5;
              //}
            }
            else if (+_dice || _dice == "0") {
              randomCount = +_dice;
              randomNumbers = _dice;
              randomNumbersSum = +_dice;
              //sortedRandomNumbers.push(+randomNumbers);
              diceWithoutMultipleSign = true;

              let symbol = '+';
              if (+diceArr != 0) {
                if (diceArray[+diceArr - 1] == "-") {
                  symbol = diceArray[+diceArr - 1];
                }
                if (diceArray[+diceArr - 1] == "*") {
                  symbol = diceArray[+diceArr - 1];
                }
                if (diceArray[+diceArr - 1] == "/") {
                  symbol = diceArray[+diceArr - 1];
                }
              }
              sortedRandomNumbersSign.push(symbol);
              sortedRandomNumbers.push(+randomNumbers);

            }
            else {
              //INVALID
              this.HasError = -6;
            }
          } catch (err) {
            this.HasError = -6;
          }
        }
        diceArr_fake = diceArr_fake + 1;
      }
    }

    let num = 0;
    let _maxNum = Math.max.apply(Math, sortedRandomNumbersToShow);
    let _minNum = Math.min.apply(Math, sortedRandomNumbersToShow);
    operator = operator.toUpperCase();

   
    let CalculativeString = '';
    let AllDicesPresentInFE: any[] = [];
    let _randmLIST:any[]=[]
    let __randomNumbersList: any[] = []

    if (IsFeDice) {


      let CurrentDiceNewResults: any;
      let New_sortedRandomNumbersToShowSort = [];
      let NewRandomNumList: any[] = [];
      let Flag_ToInsertNumbrersInNewRandomNumList = false;
      diceArray.map((Fe_Instance, index) => {

        if (Fe_Instance.toUpperCase().indexOf('D') > -1) {
          CurrentDiceNewResults = this.diceInterpretationArray(Fe_Instance, false)
          AllDicesPresentInFE.push(CurrentDiceNewResults);
          Flag_ToInsertNumbrersInNewRandomNumList = true;
        }
        else if (Fe_Instance.toUpperCase().indexOf('D') == -1) {
          //let diceValue = '';
          //if (Fe_Instance.toUpperCase().indexOf('D') > -1) {
          //  let temp_arr = this.splitWithoutEmpty(Fe_Instance, ' ');
          //  temp_arr.map((x) => {
          //    if (x.toUpperCase().indexOf('D') > -1) {

          //    }
          //  })

          //}
          //else {
          //  let arr = this.splitWithoutEmpty(Fe_Instance, ' ');
          //  arr= arr.map((x) => {
          //    if (x.trim()) {
          //      return x;
          //    }
          //  })
          //}
          if (Fe_Instance.indexOf('>=') > -1 || Fe_Instance.indexOf('<=') > -1) {
            Fe_Instance = Fe_Instance.replace('+', ' + ').replace('-', ' - ').replace('>=', ' >= ').replace('<=', ' <= ');
          } else {
            Fe_Instance = Fe_Instance.replace('+', ' + ').replace('-', ' - ').replace('>', ' > ').replace('<', ' < ').replace('=', ' = ');
          }
          
          let arr = this.splitWithoutEmpty(Fe_Instance, ' ');



          if (arr.length == 4) {



            if (arr[0].trim() != '>' && arr[0].trim() != '<' && arr[0].trim() != '=' && arr[0].trim() != '>=' && arr[0].trim() != '<=') {
              isInvalidFECommand = true;
              //alert('wrong commnd1')
            }
            if (arr[1].trim() == '') {
              isInvalidFECommand = true;
              // alert('wrong commnd2')
            }
            if (isNaN(+arr[1].trim())) {
              isInvalidFECommand = true;
              //alert('wrong commnd2.1')
            }
            if (arr[2].trim() != '+' && arr[2].trim() != '-') {
              isInvalidFECommand = true;
              //alert('wrong commnd3')
            }
            if (arr[3].trim() == '') {
              isInvalidFECommand = true;
              // alert('wrong commnd4')
            }
            if (isNaN(+arr[3].trim())) {
              isInvalidFECommand = true;
              //alert('wrong commnd4.1')
            }


            let FE_Comparison = arr[0];
            let FE_ComparisonValue = arr[1];
            let FE_Result = arr[2];
            FE_Result = FE_Result + arr[3];




            New_sortedRandomNumbersToShowSort = CurrentDiceNewResults.randomNumbersListAfter
            
            
            New_sortedRandomNumbersToShowSort.map((RandomNum) => {
              if (Flag_ToInsertNumbrersInNewRandomNumList) {
                NewRandomNumList.push({ randomNum: RandomNum, diceNumber: CurrentDiceNewResults.diceNumber });
              }

              if (FE_Comparison == "=") {
                FE_Comparison = '==';
              }
              let comparisonString = RandomNum + ' ' + FE_Comparison + ' ' + FE_ComparisonValue;
              
              try {
                if (eval(comparisonString)) {
                  CalculativeString += FE_Result;
                } else {
                  CalculativeString += '+0';
                }
              }
              catch (ex) {
                isInvalidFECommand = true;
              }
            })

            Flag_ToInsertNumbrersInNewRandomNumList = false;
            //let newRndmList = {
            //  index: 0,
            //  number: +eval(CalculativeString),
            //  isChecked: false,
            //  isKept: false,
            //};

          }
          else {
            isInvalidFECommand = true; //this variable is used in diceroll.ts file
            //alert('wrong commnd5')
          }
        }
      })
     
      //let newRndmList: number[] = [];
      //newRndmList.push(+eval(CalculativeString));


      //sortedRandomNumbersToShowSort = newRndmList;
      //sortedRandomNumbersToShow = newRndmList;

      //sortedRandomNumbersToShowSort = [];
      //sortedRandomNumbersToShow = [];
      //sortedRandomNumbersToShowSort = NewRandomNumList;
      //sortedRandomNumbersToShow = NewRandomNumList;

      _randmLIST = NewRandomNumList.map((x, index) => {
        num += 1;
        return {
          index: index,
          number: x.randomNum,
          isChecked: false,
          isKept: operator == "KH" ? (num > (randomCount - operatorNumber) ? true : false)
            : (operator == "KL" ? (num > operatorNumber ? false : true)
              : (operator == "DH" ? (num > (randomCount - operatorNumber) ? false : true)
                : (operator == "DL" ? (num > operatorNumber ? true : false)
                  : true))),
          diceNumber: x.diceNumber
        };
      });
      //to check KH,KL,DH,DL with sorting
      let keptCount = 0;
      __randomNumbersList = NewRandomNumList.map((x, index) => {

        let _isKept = false;
        switch (operator) {
          case "KH": case "KL": case "DH": case "DL":
            for (var nmbr in _randmLIST) {
              if (_randmLIST[nmbr].number === x && _randmLIST[nmbr].isKept == true) {
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
          index: index,
          number: x.randomNum,
          isMax: +_maxNum === x ? true : false,
          isMin: +_minNum === x ? true : false,
          isHighest: false,
          isLowest: false,
          isShowReroll: false,
          isAnimated: false,
          isKept: _isKept,
          diceNumber: x.diceNumber
          //isKept: operator == "KH" ? (num > (randomCount - operatorNumber) ? true : false)
          //    : (operator == "KL" ? (num > operatorNumber ? false : true)
          //        : (operator == "DH" ? (num > (randomCount-operatorNumber) ? false : true)
          //            : (operator == "DL" ? (num > operatorNumber ? true : false)
          //                : true))),

        };
      });
    }
    else {
      _randmLIST = sortedRandomNumbersToShowSort.map((x, index) => {
        num += 1;
        return {
          index: index,
          number: x,
          isChecked: false,
          isKept: operator == "KH" ? (num > (randomCount - operatorNumber) ? true : false)
            : (operator == "KL" ? (num > operatorNumber ? false : true)
              : (operator == "DH" ? (num > (randomCount - operatorNumber) ? false : true)
                : (operator == "DL" ? (num > operatorNumber ? true : false)
                  : true))),
          diceNumber: 0
        };
      });
      //to check KH,KL,DH,DL with sorting
      let keptCount = 0;
      __randomNumbersList = sortedRandomNumbersToShow.map((x, index) => {

        let _isKept = false;
        switch (operator) {
          case "KH": case "KL": case "DH": case "DL":
            for (var nmbr in _randmLIST) {
              if (_randmLIST[nmbr].number === x && _randmLIST[nmbr].isKept == true) {
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
          index: index,
          number: x,
          isMax: +_maxNum === x ? true : false,
          isMin: +_minNum === x ? true : false,
          isHighest: false,
          isLowest: false,
          isShowReroll: false,
          isAnimated: false,
          isKept: _isKept,
          diceNumber:0
          //isKept: operator == "KH" ? (num > (randomCount - operatorNumber) ? true : false)
          //    : (operator == "KL" ? (num > operatorNumber ? false : true)
          //        : (operator == "DH" ? (num > (randomCount-operatorNumber) ? false : true)
          //            : (operator == "DL" ? (num > operatorNumber ? true : false)
          //                : true))),

        };
      });
    }





    if (__randomNumbersList.length > 0) {
      sortedRandomNumbers = [];
      __randomNumbersList.forEach((val) => {
        if (val.isKept) {
          let symbol = '+';
          //if (+diceArr != 0) {
          //  let symbol = diceArray[+diceArr - 1];
          //}
          sortedRandomNumbersSign.push(symbol);
          sortedRandomNumbers.push(val.number);
        }
      });
      // __randomNumbersList = __randomNumbersList.filter((val) => val.isKept == true);
    }

    
    let command = '';
    let temp_randomNumbersAfter = +dice ? sortedRandomNumbers.join(" + ")
      : (diceWithoutMultipleSign ? sortedRandomNumbers.join(" * ")
        : (sortedRandomNumbers.length > 1 ? ' ( ' + sortedRandomNumbers.join(" + ") + ' ) ' : sortedRandomNumbers.join(" + ")));

    if (sortedRandomNumbersSign.length) {
      sortedRandomNumbers.map((x, index) => {
        if (index == 0 && sortedRandomNumbersSign[index] != '+') {
          command += " " + sortedRandomNumbersSign[index] + " " + x;
        }
        else if (index == 0 && sortedRandomNumbersSign[index] == '+') {
          command += " " + x;
        }
        else {
          command += " " + sortedRandomNumbersSign[index] + " " + x;
        }
      })
      if (sortedRandomNumbersSign.length > 1) {
        temp_randomNumbersAfter = ' ( ' + command + ' ) ';
      }
      else {
        temp_randomNumbersAfter = command;
      }
      
    }
   

    //if (isAddSign || isMultipleSign || isMinusSign || isDivideSign) {
    //  switch (true) {
    //    case isAddSign:
    //      temp_randomNumbersAfter = +dice ? sortedRandomNumbers.join(" + ")
            
    //          : (sortedRandomNumbers.length > 1 ? ' ( ' + sortedRandomNumbers.join(" + ") + ' ) ' : sortedRandomNumbers.join(" + "));
    //      break;
    //    case isMultipleSign:
    //      temp_randomNumbersAfter = +dice ? sortedRandomNumbers.join(" * ")
            
    //          : (sortedRandomNumbers.length > 1 ? ' ( ' + sortedRandomNumbers.join(" * ") + ' ) ' : sortedRandomNumbers.join(" * "));
    //      break;
    //    case isMinusSign:
    //      temp_randomNumbersAfter = +dice ? sortedRandomNumbers.join(" - ")
            
    //          : (sortedRandomNumbers.length > 1 ? ' ( ' + sortedRandomNumbers.join(" - ") + ' ) ' : sortedRandomNumbers.join(" - "));
    //      break;
    //    case isDivideSign:
    //      temp_randomNumbersAfter = +dice ? sortedRandomNumbers.join(" / ")           
    //          : (sortedRandomNumbers.length > 1 ? ' ( ' + sortedRandomNumbers.join(" / ") + ' ) ' : sortedRandomNumbers.join(" / "));
    //      break;

    //    default:
    //      break;
    //  }
    //}
    let feTotal = 0;
    try {
      feTotal = +eval(CalculativeString);
    } catch (ex) { feTotal = 0; }

    _diceInterpretationArray = {
      diceNumber: diceNumber,
      randomCount: randomCount,
      randomNumbers: randomNumbers,
      randomNumbersList: __randomNumbersList, //main list
      randomNumbersListAfter: sortedRandomNumbers,
      randomNumbersSum: randomNumbersSum,
      randomNumbersAfter: temp_randomNumbersAfter,
      randomNumbersSumAfter: diceWithoutMultipleSign ? sortedRandomNumbers.reduce((a, b) => a * b, 0)
        : sortedRandomNumbers.reduce((a, b) => a + b, 0),
      operator: operator,
      operatorNumber: operatorNumber,
      isInvalidFECommand: isInvalidFECommand,
      feTotal: feTotal,
      allDicesPresentInFE: AllDicesPresentInFE,
      isFeDice: IsFeDice
    };

    //handle 0 - as dice
    if (_diceInterpretationArray.diceNumber == 0 && _diceInterpretationArray.randomCount == 0) {
      _diceInterpretationArray.randomNumbers = "0";
      _diceInterpretationArray.randomNumbersAfter = "0";
      _diceInterpretationArray.randomNumbersList = [];
      _diceInterpretationArray.randomNumbersListAfter = [];
    }
    
    return _diceInterpretationArray;
  }

  public static validateCommandTextNew(commandText: string): boolean {
    
    if (commandText.trim() === '+' || commandText.trim() === '/' || commandText.trim() === '*') return false;
    //else if (commandText.split("(").length - 1 !== commandText.split(")").length - 1) {
    //  
    
    //  return false
    //}
    else if ((commandText.split("/").length - 1 < ((commandText.split("RU").length - 1) + (commandText.split("RD").length - 1))) && !this.RU_RD_ContainsInQuotes(commandText)) {
      
      
      
      
      return false
    }

    commandText = commandText.trim().toUpperCase(); //
    //for multiple command
    let multiCommandArray = this.splitWithoutEmpty(commandText, 'AND');
    if (multiCommandArray.length === 0) return false; // if entered AND in textbox
    else if (multiCommandArray.length > this.totalAndLimit) return false;

    for (var command in multiCommandArray) {

      let _commandText = multiCommandArray[command];

      if (!_commandText) continue;
      else if (_commandText.trim() === '') continue; //if empty
      else if (+_commandText.trim()) continue; //if command is static modifier

      let diceARRAY = [];
      let parenthesis = false;
      let isSingleQuotes = false;
      let isDoubleQuotes = false;
      let isSingleQuotesStarted = false;
      let isDoubleQuotesStarted = false;
      let diceValue = "";
      let diceSign = " + ";
      let diceOperation = "";

      _commandText = _commandText.trim().toUpperCase();
      
      for (var x = 0; x < _commandText.length; x++) {
        this.HasError = 0;
        if (isSingleQuotes || isDoubleQuotes|| parenthesis || (_commandText[x] != '+' && _commandText[x] != "-" && _commandText[x] != "*" && _commandText[x] != "/")) {
          diceValue += _commandText[x];
          if (_commandText[x] == '(' && !isSingleQuotesStarted && !isDoubleQuotesStarted) { //|| parenthesis) {
            //diceSign = _commandText[x - 1]
            parenthesis = true;
          }
          else if (_commandText[x] == ')' && !isSingleQuotesStarted && !isDoubleQuotesStarted) {
            parenthesis = false;
            diceValue = '';
          }
          else if (_commandText[x] == "'" && !isSingleQuotesStarted) {
            isSingleQuotes = true;
            //diceValue += diceValue;
            isSingleQuotesStarted = true;
          }
          else if (_commandText[x] == "'" && isSingleQuotesStarted)  {
            isSingleQuotes = false;
            //diceValue += diceValue;
            isSingleQuotesStarted = false;
          }
          else if (_commandText[x] == '"' && !isDoubleQuotesStarted) {
            isDoubleQuotes = true;
            //diceValue += diceValue;
            isDoubleQuotesStarted = true;
          }
          else if (_commandText[x] == '"' && isDoubleQuotesStarted) {
            isDoubleQuotes = false;
            //diceValue += diceValue;
            isDoubleQuotesStarted = false;
          }
          else if (x == _commandText.length - 1) {
            this.diceInterpretationArray(diceValue.trim());
            diceValue = '';
          }
        }
        else if (_commandText[x] == '+' || _commandText[x] == "-" || _commandText[x] == "*" || _commandText[x] == "/") {
          this.diceInterpretationArray(diceValue.trim())
          diceSign = ' ' + _commandText[x] + ' ';
          diceValue = '';
        }
        else {
          //INVALID
          return false;
        }
        if (this.HasError < 0) return false;
      }

    }
    return true;
  }

  public static containsCustomDice(value: string): boolean {
    if (!value) return false;
    value = value.trim();
    //
    for (const _dice in DICE) {
      if (!Number(_dice)) {
        if (value.endsWith(_dice)) {

          let splitDice = this.splitWithoutEmpty(value, _dice);
          if (splitDice.length === 0) {
            this.SelectedDiceWithValue = {
              dice: _dice,
              rolledCount: 1
            };
            return true;
          }

          //if dice like 4 D4 i.e. invalid
          let invalidDice = splitDice[0].toString().split(' ');
          if (invalidDice.length > 1) return false;

          let diceNum = splitDice[0].toString();
          if (+diceNum) {
            if ((+diceNum) <= 99) {
              this.SelectedDiceWithValue = {
                dice: _dice,
                rolledCount: +diceNum
              };
              return true;
            }
          }
          return false;
        }
      }
    }
    return false;
  }

  public static getDiceIcon(value: string): string {

    if (!value) return "";
    else if (value == "") return "";

    value = value.trim();
    for (const _dice in DICE) {
      if (!Number(_dice)) {
        if (value.toUpperCase() == _dice.toUpperCase()) {
          return DICE_ICON[_dice];
        }
      }
    }
    if (value.indexOf('D') > -1) return DICE_ICON['DX'];
    return "";
  }

  public static getCalculationStringArray(_calculationString: string, diceRolledData?: any): any {

    let calculationStringForArray = _calculationString.replace(/  /g, ' ');
    let _calculationStringArrayList = calculationStringForArray.split(' ');
    let _calculationStringArray = [];
    let _maxNum: number = 0;
    let _minNum: number = 0;

    if (diceRolledData) {
      diceRolledData.forEach(diceRoll => {
        let diceStart = 0; let perenthesis = false;
        let length = diceRoll.randomNumbersList.length;
        diceRoll.randomNumbersList.forEach(num => {
          diceStart += 1; // num.isKept ? diceStart + 1 : diceStart;
          //length = num.isKept ? length : length - 1;

          if (num.isKept) {
            if (diceStart == 1 && _calculationStringArray.length > 1) {
              _calculationStringArray.push({
                text: diceRoll.sign,
                isMax: false,
                isMin: false
              });
            }
            if (diceStart == 1 && length > 1 && !perenthesis) {
              _calculationStringArray.push({
                text: ' ( ',
                isMax: false,
                isMin: false
              });
              perenthesis = true;
            }
            if (!diceRoll.static) {
              _calculationStringArray.push({
                text: num.number,
                isMax: num.isMax,
                isMin: num.isMin
              });
              if (length !== diceStart) {
                _calculationStringArray.push({
                  text: ' + ',
                  isMax: false,
                  isMin: false
                });
              }
            }
            if (diceStart > 1 && length == diceStart && perenthesis) {
              _calculationStringArray.push({
                text: ' ) ',
                isMax: false,
                isMin: false
              });
            }
          }
        });

        if (diceRoll.static) {
          _calculationStringArray.push({
            text: diceRoll.sign + ' ' + diceRoll.randomNumbersSum,
            isMax: false,
            isMin: false
          });
        }
        else if (diceRoll.randomNumbersList.length == 0 && diceRoll.operator) {
          _calculationStringArray.push({
            text: diceRoll.sign + ' ' + diceRoll.randomNumbersSum,
            isMax: false,
            isMin: false
          });
        }
      });
    }
    else {
      let calculationStringForArray = _calculationString.replace(/  /g, ' ');
      let _calculationStringArrayList = calculationStringForArray.split(' ');
      let _calculationStringArray = [];
      let _maxNum: number = 0;
      let _minNum: number = 0;
      _calculationStringArrayList.forEach(value => {

        if (!isNaN(parseInt(value, 10))) {
          _maxNum = +value > _maxNum ? +value : _maxNum;
          _minNum = +value > _minNum ? (_minNum == 0 ? +value : _minNum) : +value;
        }
      });
      _calculationStringArrayList.forEach(value => {
        if (!isNaN(parseInt(value, 10))) {
          _calculationStringArray.push({
            text: value,
            isMax: _maxNum === +value ? true : false,
            isMin: _minNum === +value ? true : false
          });
        }
        else {
          _calculationStringArray.push({
            text: value,
            isMax: false,
            isMin: false
          });
        }
      });
    }
    return _calculationStringArray;
  }

  /** * ******************************************* */


  public static generateDiceCommand(dice: DiceRoll, characterCommandModel: CharacterCommand) {

    //calculate current/clicked dice
    dice.rolledCount += 1;
    dice.randomNumbers.push(this.getRandomNumber(1, dice.diceNumber));
    dice.lastResult = dice.randomNumbers.reduce((x, y) => x + y, 0);

    //filter dice if duplicated
    characterCommandModel.diceCommandArray = characterCommandModel.diceCommandArray.filter(function (cmd) {
      if (cmd.dice !== dice.dice) return cmd;
    });

    //created array of all dices
    const _diceCommand = new DiceCommand();
    _diceCommand.dice = dice.dice;
    _diceCommand.command = dice.rolledCount == 1 ? dice.dice : dice.rolledCount + dice.dice;
    _diceCommand.result = dice.randomNumbers.join(' + ');
    characterCommandModel.diceCommandArray.push(_diceCommand);

    let _commandDice: string = '';
    let _lastResultDice: string = '';
    let _addPlus: string;

    //get command & last result full text from dice array
    for (const _command in characterCommandModel.diceCommandArray) {
      _addPlus = ' + ';
      if (characterCommandModel.diceCommandArray.length == (Number(_command) + 1)) {
        _addPlus = '';
      }
      _commandDice += characterCommandModel.diceCommandArray[_command].command + _addPlus;
      _lastResultDice += characterCommandModel.diceCommandArray[_command].result + _addPlus;
    }

    //calculate last result sum
    let _lastResultDiceSum: number = 0;
    _lastResultDice.split('+').map(function (_value) {

      if (!isNaN(parseInt(_value.trim(), 10)))
        _lastResultDiceSum += parseInt(_value.trim(), 10);
    });

    characterCommandModel.command = _commandDice;
    characterCommandModel.lastResultNumbers = '(' + _lastResultDice + ')';
    characterCommandModel.lastResult = _lastResultDiceSum;

    return characterCommandModel;

  }

  //not used =>
  public static commandResult_OnDiceWindow(command: string) {

    //=> issue with AND case
    //split command if multiple groups of rolls at once => AND
    //let commands = command.split('AND');
    //commands.forEach(function (val) {
    //});

    let diceRollList = new Array<DiceRoll>();
    let characterCommandModel: CharacterCommand;

    //split command based on '+' or '-'
    let diceValues = this.splitByMultiSeparator(command, ['+', '-', '/', '*']); // d4 + 3d5 + 4d6 DL3 + 4d6 DH3 + 4D4 KH3 + 5d20 KL2 -7  
    for (var val in diceValues) {
      //diceValues.forEach(function (value) {

      let value = diceValues[val];

      if (!value) continue;
      else if (value.trim() === '') continue;

      value = value.trim();

      let _diceRoll = new DiceRoll();
      _diceRoll.randomNumbers = [];
      _diceRoll.invalidCommandText = [];

      //##1## check if value is static not a dice command
      //var staticDiceVal = parseInt(value, 10);
      if (+value) {
        _diceRoll.command = value;
        _diceRoll.randomNumbers.push(+value);

        //add dice to list
        diceRollList.push(_diceRoll);
        continue;
      }

      //##2## check if value is not a dice command or invalid
      let _commandDiceValues: any = this.commandInludesDice(value);

      if (!_commandDiceValues) {
        _diceRoll.command = "Invalid Command";
        _diceRoll.invalidCommandText.push(value);

        //add dice to list
        diceRollList.push(_diceRoll);
        continue;
      }

      //##3## check if value is a dice command
      let _commandText = _commandDiceValues.command;
      const _commandDice = _commandDiceValues.dice;

      //check if command has keep highest/lowest
      if (_commandDice) {
        if (_commandDice.toUpperCase().indexOf('KH') > -1) {
          //let KHxValue = _diceRoll.command.split();

        }
        if (_commandDice.toUpperCase().indexOf('KL') > -1) {

        }
        //check if command has drop highest/lowest
        if (_commandDice.toUpperCase().indexOf('DH') > -1) {

        }
        if (_commandDice.toUpperCase().indexOf('DL') > -1) {

        }
      }

      _diceRoll.dropHighest = 0;
      _diceRoll.dropLowest = 0;
      _diceRoll.keepHighest = 0;
      _diceRoll.keepLowest = 0;

      _diceRoll.command = _commandText;
      _diceRoll.dice = _commandDice; //eg. D4
      _diceRoll.diceIcon = DICE_ICON[_commandDice]; //eg. icon-d4-thin
      _diceRoll.diceNumber = Number(DICE[_commandDice]); //eg. 4

      let noOfDice = '';
      var index = _commandText.indexOf(_commandDice);
      if (index != -1) {
        noOfDice = _commandText.substring(0, index);
      }

      _diceRoll.rolledCount = 1; //eg. 1 for D4, 2 for 2D10 etc.
      if (+noOfDice) {
        //let _noOfDice = parseInt(noOfDice, 10);
        //if (!isNaN(_noOfDice)) {
        _diceRoll.rolledCount = +noOfDice == 0 ? 1 : +noOfDice;
        //}
      }
      let _randomNumber = Math.floor(Math.random() * (_diceRoll.diceNumber - 1 + 1)) + 1;
      _diceRoll.randomNumbers.push(_randomNumber);
      //_diceRoll.randomNumbers.push(this.getRandomNumber(1, _diceRoll.diceNumber));

      //add dice to list
      diceRollList.push(_diceRoll);
    }//);

    //created array of all dices
    //let characterCommandModel: CharacterCommand;
    diceRollList.forEach(function (dice) {
      const _diceCommand = new DiceCommand();
      _diceCommand.dice = dice.dice;
      _diceCommand.command = dice.command; //rolledCount == 1 ? dice.dice : dice.rolledCount + dice.dice;
      _diceCommand.result = dice.randomNumbers.join(' + ');
      characterCommandModel.diceCommandArray.push(_diceCommand);
    });

    let dice: DiceRoll;
    let _commandDice: string = '';
    let _lastResultDice: string = '';
    let _addPlus: string;

    //get command & last result full text from dice array
    for (const _command in characterCommandModel.diceCommandArray) {
      _addPlus = ' + ';
      if (characterCommandModel.diceCommandArray.length == (Number(_command) + 1)) {
        _addPlus = '';
      }
      _commandDice += characterCommandModel.diceCommandArray[_command].command + _addPlus;
      _lastResultDice += characterCommandModel.diceCommandArray[_command].result + _addPlus;
    }

    //calculate last result sum
    let _lastResultDiceSum: number = 0;
    _lastResultDice.split('+').map(function (_value) {

      if (!isNaN(parseInt(_value.trim(), 10)))
        _lastResultDiceSum += parseInt(_value.trim(), 10);
    });

    characterCommandModel.command = _commandDice;
    characterCommandModel.lastResultNumbers = '(' + _lastResultDice + ')';
    characterCommandModel.lastResult = _lastResultDiceSum;

    return characterCommandModel;

  }

  // old method =>
  public static diceOnRollCount(command: string, diceTray?: DiceTray[]) {
    if (!diceTray) {
      diceTray = [];
    }
    let diceRollList = []; // new Array<DiceRoll>();

    let diceValues = this.splitByMultiSeparator(command, ['+', '-', '*']);

    for (var val in diceValues) {

      let value = diceValues[val];

      if (!value) continue;
      else if (value.trim() === '') continue;

      value = value.trim();

      //##1## continue if value is static => not a dice command
      if (+value) continue;

      //##2## check if value is not a dice command or invalid
      let _commandDiceValues: any;
      if (diceTray.length) {
        _commandDiceValues = this.commandInludesDiceInDiceTray(value, diceTray);
      }
      else {
        _commandDiceValues = this.commandInludesDice(value);
      }
      if (!_commandDiceValues) continue;

      //##3## check if value is a dice command
      let _commandText = _commandDiceValues.command;
      const _commandDice = _commandDiceValues.dice; //eg. D4
      let diceRolledCount = 1; //eg. 1 for D4, 2 for 2D10 etc.

      let noOfDiceRolled = '';
      var index = _commandText.indexOf(_commandDice);
      if (index != -1) {
        noOfDiceRolled = _commandText.substring(0, index);
      }

      if (+noOfDiceRolled)
        diceRolledCount = +noOfDiceRolled == 0 ? 1 : +noOfDiceRolled;

      //add dice to list
      diceRollList.push({ dice: _commandDice, diceRolledCount: diceRolledCount, commandText: _commandText });
    }

    return diceRollList;
  }

  //new main-
  public static diceOnSelectOnRoll(commandText: string, hasAnd?: boolean, diceTray?: DiceTray[]): any[] {
    
    if (!diceTray) {
      diceTray = [];
    }
    let CommandLIST: any = [];
    if (!commandText) return CommandLIST;

    commandText = commandText.trim().toUpperCase(); //
    //for multiple command
    let multiCommandArray = this.splitWithoutEmpty(commandText, 'AND');

    for (var cmd in multiCommandArray) {
      //ONLY FOR FIRST COMMAND
      let _commandText = multiCommandArray[cmd];
      _commandText = _commandText.trim().toUpperCase();

      //split each dice from command //eg. 2D4 - D6 KL1 + x D10 / 2 RD / 1 - 2
      //let diceValues = this.splitByMultiSeparator(_commandText, ['+', '-', '*']);    

      //split each dice with math operators/sign i.e. + -

      let diceValues = this.getCommandSigns(_commandText);

      for (var val in diceValues) {
        
        //checks for null or undefined
        let value = diceValues[val]
        if (!value) continue;
        else if (!value.dice) continue;

        value = value.dice;
        if (value.trim() === '') continue;
        else if (+value.trim()) {
          //if command value is static modifier
          CommandLIST.push({
            dice: '',
            diceRolledCount: 1,
            commandText: value.trim(), //for static => command is its value
            operator: '',
            operatorValue: 0,
            isStatic: true,
            isMod: false,
            sign: ' ' + diceValues[val].sign + ' '
          });
          continue
        }
        else {

          value = value.trim().toUpperCase();

          // if command value has dice only => without operator
          this.SelectedDiceWithValue = {};
          let IsDiceOnly: boolean;
          if (diceTray.length) {
            IsDiceOnly = this.containsDiceInDiceTray(value, diceTray);
          }
          else {
            IsDiceOnly = this.containsDice(value);
          }
          if (IsDiceOnly) {
            CommandLIST.push({
              dice: this.SelectedDiceWithValue.dice,
              diceRolledCount: this.SelectedDiceWithValue.rolledCount,
              commandText: value.trim(),
              operator: '',
              operatorValue: 0,
              isStatic: false,
              isMod: false,
              sign: ' ' + diceValues[val].sign + ' '
            });
            continue;
          }

          let hasDiceWithOperator = false;
          let hasOperator = this.containsAny(value, ['RU', 'RD']);
          try {
            if (hasOperator) {
              this.SelectedDiceWithValue = {};
              this.SelectedOperatorWithValue = {};
              hasDiceWithOperator = this.containsAny(value, ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100']);
              if (hasDiceWithOperator) {
                hasOperator = false;
                let _opValues = this.splitByMultiSeparator(value, ['/']);
                //if (_opValues.length > 2) return false; //command must have two values i.e dice & operator

                if (_opValues) {
                  hasDiceWithOperator = this.containsDice(_opValues[0]);
                  hasOperator = this.containsRURDOperator(_opValues[1]);
                }
              }

              if (hasDiceWithOperator && hasOperator) {
                CommandLIST.push({
                  dice: this.SelectedDiceWithValue.dice,
                  diceRolledCount: this.SelectedDiceWithValue.rolledCount,
                  commandText: value.trim(),
                  operator: this.SelectedOperatorWithValue.operator,
                  operatorValue: +this.SelectedOperatorWithValue.value,
                  isStatic: false,
                  isMod: false,
                  sign: ' ' + diceValues[val].sign + ' '
                });
                continue;
              }
            }
          } catch (err) { }

          try {
            this.SelectedDiceWithValue = {};
            this.SelectedOperatorWithValue = {};
            hasOperator = this.containsAny(value, ['KL', 'KH', 'DL', 'DH']);
            if (hasOperator) {
              hasDiceWithOperator = this.containsAny(value, ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100']);
              if (hasDiceWithOperator) {
                hasOperator = false;
                let _opValues = this.splitByMultiSeparator(value, [' ']);
                //if (_opValues.length > 2) return false;

                if (_opValues) {
                  hasDiceWithOperator = this.containsDice(_opValues[0]);
                  hasOperator = this.containsOperator(_opValues[1]);
                }
              }
              if (hasDiceWithOperator && hasOperator) {
                CommandLIST.push({
                  dice: this.SelectedDiceWithValue.dice,
                  diceRolledCount: this.SelectedDiceWithValue.rolledCount,
                  commandText: value.trim(),
                  operator: this.SelectedOperatorWithValue.operator,
                  operatorValue: +this.SelectedOperatorWithValue.value,
                  isStatic: false,
                  isMod: false,
                  sign: ' ' + diceValues[val].sign + ' '
                });
                continue;
              }
            }
          } catch (err) { }

          let valueIndex: string = value;
          let isNumber: boolean = false;
          try {
            if (valueIndex.indexOf('/') > 0) {
              hasDiceWithOperator = this.containsAny(value, ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100']);
              if (hasDiceWithOperator) {
                let _opValues = this.splitByMultiSeparator(value, ['/']);

                if (_opValues) {
                  hasDiceWithOperator = this.containsDice(_opValues[0]);
                  isNumber = +_opValues[1] ? true : false;
                  valueIndex = +_opValues[1] ? _opValues[1] : '0';
                }
              }
              if (hasDiceWithOperator && isNumber) {
                CommandLIST.push({
                  dice: this.SelectedDiceWithValue.dice,
                  diceRolledCount: this.SelectedDiceWithValue.rolledCount,
                  commandText: value.trim(),
                  operator: 'RD', //Default
                  operatorValue: +valueIndex,
                  isStatic: false,
                  isMod: false,
                  sign: ' ' + diceValues[val].sign + ' '
                });
                continue;
              }
            }
          } catch (err) { }

          //add mod values
          let valueIfMod: string = value;
          valueIfMod = valueIfMod.trim();
          if (valueIfMod.startsWith("[") && valueIfMod.endsWith("]")) {
            CommandLIST.push({
              dice: '',
              diceRolledCount: 1,
              commandText: value.trim(), //for mod => command is its value
              operator: '',
              operatorValue: 0,
              isStatic: false,
              isMod: true,
              sign: ' ' + diceValues[val].sign + ' '
            });
            continue;
          }

        }
      }

      if ((multiCommandArray.length == 1 && commandText.endsWith('AND'))
        || (multiCommandArray.length !== (Number(cmd) + 1))
        || (multiCommandArray.length === (Number(cmd) + 1) && commandText.endsWith('AND')))
        CommandLIST.push({
          dice: '',
          diceRolledCount: 1,
          commandText: 'AND', //for static => command is its value
          operator: '',
          operatorValue: 0,
          isStatic: true,
          isMod: false,
          sign: ''
        });
    }
    return CommandLIST;
  }

  //validation checks-old
  public static validateCommandText(commandText: string): boolean {

    if (commandText.trim() === '+' || commandText.trim() === '-') return false;

    commandText = commandText.trim().toUpperCase(); //
    //for multiple command
    let multiCommandArray = this.splitWithoutEmpty(commandText, 'AND');
    if (multiCommandArray.length === 0) return false; // if entered AND in textbox
    else if (multiCommandArray.length > this.totalAndLimit) return false;

    for (var command in multiCommandArray) {

      let _commandText = multiCommandArray[command];

      if (!_commandText) continue;
      else if (_commandText.trim() === '') continue; //if empty
      else if (+_commandText.trim()) continue; //if command is static modifier

      _commandText = _commandText.trim().toUpperCase();

      //split each dice from command
      let diceValues = this.splitByMultiSeparator(_commandText, ['+', '-', '*']);    // 2D4 + D6 KL1 + x D10 / 2 RD / 1 - 2
      for (var val in diceValues) {

        let value = diceValues[val].toString();

        if (!value) continue;
        else if (value.trim() === '') continue;
        else if (+value.trim()) continue;
        else {

          value = value.trim().toUpperCase();

          let IsValidDice: boolean = this.containsDice(value);
          if (IsValidDice) continue;

          let hasDiceWithOperator = false;

          let hasOperator = this.containsAny(value, ['RU', 'RD']);
          try {
            if (hasOperator) {
              hasDiceWithOperator = this.containsAny(value, ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100']);
              if (hasDiceWithOperator) {
                hasOperator = false;
                let _opValues = this.splitByMultiSeparator(value, ['/']);
                if (_opValues.length > 2) return false; //command must have two values i.e dice & operator

                if (_opValues) {
                  hasDiceWithOperator = this.containsDice(_opValues[0]);
                  hasOperator = this.containsRURDOperator(_opValues[1]);
                }
              }
              if (hasDiceWithOperator && hasOperator) {
                //if (+this.SelectedDiceWithValue.rolledCount < +this.SelectedOperatorWithValue.value)
                //return false;
                continue;
              }
            }
          } catch (err) {
            return false;
          }

          try {
            hasOperator = this.containsAny(value, ['KL', 'KH', 'DL', 'DH']);
            if (hasOperator) {
              hasDiceWithOperator = this.containsAny(value, ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100']);
              if (hasDiceWithOperator) {
                hasOperator = false;
                let _opValues = this.splitByMultiSeparator(value, [' ']);
                if (_opValues.length > 2) return false;

                if (_opValues) {
                  hasDiceWithOperator = this.containsDice(_opValues[0]);
                  hasOperator = this.containsOperator(_opValues[1]);
                }
              }
              if (hasDiceWithOperator && hasOperator) {
                if (+this.SelectedDiceWithValue.rolledCount < +this.SelectedOperatorWithValue.value)
                  return false;
                continue;
              }
            }
          } catch (err) {
            return false;
          }

          let valueIndex: string = value;
          let isNumber: boolean = false;
          try {
            if (valueIndex.indexOf('/') > 0) {
              hasDiceWithOperator = this.containsAny(value, ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100']);
              if (hasDiceWithOperator) {
                let _opValues = this.splitByMultiSeparator(value, ['/']);
                if (_opValues.length > 2) return false; //command must have two values i.e dice & operator

                if (_opValues) {
                  hasDiceWithOperator = this.containsDice(_opValues[0]);
                  isNumber = +_opValues[1] ? true : false;
                }
              }
              if (hasDiceWithOperator && isNumber) {
                //if (+this.SelectedDiceWithValue.rolledCount < +this.SelectedOperatorWithValue.value)
                //return false;
                continue;
              }
            }
          } catch (err) {
            return false;
          }

          //if reached here => invalid command
          return false;
        }
      }
    }
    return true;
  }

  public static validateCommand99Limit(commandText: string): boolean {
    let isVALID = true;
    try {
      if (commandText.trim() === '+' || commandText.trim() === '-') return false;
      commandText = commandText.trim().toUpperCase(); //

      //for multiple command
      let multiCommandArray = this.splitWithoutEmpty(commandText, 'AND');
      if (multiCommandArray.length === 0) return false; // if entered AND in textbox
      else if (multiCommandArray.length > this.totalAndLimit) return false;

      for (var command in multiCommandArray) {

        let _commandText = multiCommandArray[command];

        if (!_commandText) continue;
        else if (_commandText.trim() === '') continue; //if empty
        else if (+_commandText.trim()) continue; //if command is static modifier

        _commandText = _commandText.trim().toUpperCase();
        //split each dice from command
        let diceValues = this.splitByMultiSeparator(_commandText, ['+', '-', '*']);
        for (var val in diceValues) {

          let value = diceValues[val].toString();
          if (!value) continue;
          else if (value.trim() === '') continue; //if empty
          else if (+value.trim()) continue; //if command is static modifier
          else {
            try {
              value = value.trim().toUpperCase();
              let splitDice = value.split("D");
              let diceNum = splitDice[0].toString();
              if (+diceNum) {
                if ((+diceNum) > 99) {
                  return false;
                }
              }
            } catch (err) { }
            isVALID = true;
          }
        }
      }
    } catch (err) { }
    return isVALID;;
  }

  /**
  //*****COMMON METHODS BELOW
  **/

  public static containsDice(value: string): boolean {
    
    if (!value) return false;
    //value = value.trim();
    value = this.removeQuotesContent(value.trim());
    for (const _dice in DICE) {
      if (!Number(_dice)) {
        if (value.endsWith(_dice)) {

          let splitDice = this.splitWithoutEmpty(value, _dice);
          if (splitDice.length === 0) {
            this.SelectedDiceWithValue = {
              dice: _dice,
              rolledCount: 1
            };
            return true;
          }

          //if dice like 4 D4 i.e. invalid
          let invalidDice = splitDice[0].toString().split(' ');
          if (invalidDice.length > 1) return false;

          let diceNum = splitDice[0].toString();
          if (+diceNum) {
            if ((+diceNum) <= 99) {
              this.SelectedDiceWithValue = {
                dice: _dice,
                rolledCount: +diceNum
              };
              return true;
            }
          }
          return false;
        }
      }
    }
    return false;
  }

  public static containsDiceInDiceTray(value: string, diceTray?: DiceTray[]): boolean {
    
    if (!diceTray) {
      diceTray = [];
    }
    if (!value) return false;
    value = this.removeQuotesContent(value.trim());
    for (const dice in diceTray) {
      // if (!Number(_dice)) {
      let _dice = diceTray[dice].name.toUpperCase()
      if (value.endsWith(_dice)) { //==

        let splitDice = this.splitWithoutEmpty(value, _dice);//d4,4=
        if (splitDice.length === 0) {
          this.SelectedDiceWithValue = {
            dice: _dice,
            rolledCount: 1
          };
          return true;
        }

        //if dice like 4 D4 i.e. invalid
        let invalidDice = splitDice[0].toString().split(' ');
        if (invalidDice.length > 1) return false;

        let diceNum = splitDice[0].toString();
        if (+diceNum) {
          if ((+diceNum) <= 99) {
            this.SelectedDiceWithValue = {
              dice: _dice,
              rolledCount: +diceNum
            };
            return true;
          }
        }
        return false;
      }
      // }
    }


    return false;
  }

  public static containsOperator(value: string): boolean {
    if (!value) return false;
    value = value.trim();
    for (const operator in COMMAND_OPERATOR) {
      if (!Number(operator)) {
        if (value.startsWith(operator)) {

          let splitOpVal = this.splitWithoutEmpty(value, operator);
          if (splitOpVal.length === 0) return false; //must have 1 value

          let opNum = splitOpVal[0].toString();
          if (+opNum) {
            if ((+opNum) <= 99) {
              this.SelectedOperatorWithValue = {
                operator: operator,
                value: +opNum
              }
              return true;
            }
          }
          return false;
        }
      }
    }
    return false;
  }

  public static containsRURDOperator(value: string): boolean {
    if (!value) return false;
    value = value.trim();
    for (const operator in COMMAND_OPERATOR) {
      if (!Number(operator)) {
        if (operator === 'RU' || operator === 'RD') {
          if (value.endsWith(operator)) {

            let splitOpVal = this.splitWithoutEmpty(value, operator);
            if (splitOpVal.length === 0) return false;

            let opNum = splitOpVal[0].toString();
            if (+opNum) {
              if ((+opNum) <= 99) {
                this.SelectedOperatorWithValue = {
                  operator: operator,
                  value: +opNum
                }
                return true;
              }
            }
            return false;
          }
        }
      }
    }
    return false;
  }

  public static containsAny(str, contains): boolean {
    for (var x = 0; x != contains.length; x++) {
      var _value = contains[x];
      if (str.indexOf(_value) != - 1) {
        return true;
      }
    }
    return false;
  }

  public static getCommandSigns(commandText: string) {
    
    //let replace = /\+/gi;
    commandText = commandText.replace(/\+/gi, "#+");
    //replace = /\-/gi;
    commandText = commandText.replace(/\-/gi, "#-");
    //replace = /\*/gi;
    commandText = commandText.replace(/\*/gi, "#*");
    //replace = /\//gi;
    commandText = commandText.replace(/\//gi, "#/");

    let signs: any = [];
    let _splitCommand = commandText.split('#').filter((val) => val);
    
    for (var val in _splitCommand) {
      let sign = _splitCommand[val] ? _splitCommand[val].trim().charAt(0) : '';
      //not implementing divide as we already have symbol divide(/) in RU/RD 
      switch (sign) {
        case '+':
        case '-':
        case '*':
        case '/': {
          signs.push({ dice: _splitCommand[val].substring(1).trim(), sign: sign, index: +val + 1, diceText: _splitCommand[val].substring(1).trim()});
          break;
        }
        default: {
          signs.push({ dice: _splitCommand[val].trim(), sign: '+', index: +val + 1, diceText: _splitCommand[val].trim() });
          break;
        }
      }
    }

    return signs;
  }

  public static calculateEpression(expression) {
    var total = 0;
    expression = expression.match(/[+\-]*(\.\d+|\d+(\.\d+)?)/g) || [];
    while (expression.length) {
      total += parseFloat(expression.shift());
    }
    return total;
  }

  public static getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static splitWithoutEmpty(str: string, splitter: string) {
    if (splitter == ' ') {
      var matchArr = [];
      var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
      var match = myRegexp.exec(str);
      while (match != null) {
        // matched text: match[0]
        // match start: match.index
        // capturing group n: match[n]
        
        matchArr.push(match[0])
        match = myRegexp.exec(str);
      }

      matchArr.map((x) => {
        if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x)) {
          let dummy = x.replace(/ /g, '#SPACE#');
          str = str.replace(x, dummy);
        }
      })

      let res = str.split(splitter).filter((val) => val.trim());
      res=  res.map((x) => {
        x = x.replace(/#SPACE#/g, ' ');
        return x;
      })
      return res;
    }
    if (splitter.toUpperCase() == 'AND') {
      
      
      var matchArr = [];
      var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
      var match = myRegexp.exec(str);
      while (match != null) {
        // matched text: match[0]
        // match start: match.index
        // capturing group n: match[n]
        
        matchArr.push(match[0])
        match = myRegexp.exec(str);
      }

      matchArr.map((x) => {
        if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x)) {
          let dummy = x.replace(/AND/g, '#AN#');
          str = str.replace(x, dummy);
        }
      })

      let res = str.split(splitter).filter((val) => val.trim());
      res = res.map((x) => {
        x = x.replace(/#AN#/g, 'AND');
        return x;
      })
      return res;
    }
    //if (splitter.toUpperCase() == 'KL' || splitter.toUpperCase() == 'KH' || splitter.toUpperCase() == 'DL' || splitter.toUpperCase() ==  'DH') {
    //  
    //  var matchArr = [];
    //  var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    //  var match = myRegexp.exec(str);
    //  while (match != null) {
    //    // matched text: match[0]
    //    // match start: match.index
    //    // capturing group n: match[n]
    //   
    //    matchArr.push(match[0])
    //    match = myRegexp.exec(str);
    //  }

    //  matchArr.map((x) => {
    //    if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x)) {
    //      str = str.replace(x,'')
    //    }
    //  })

    //  let res = str.split(splitter).filter((val) => val.trim());     
    //  return res;
    //}
    else {
      return str.split(splitter).filter((val) => val.trim());
    }
  }

  public static splitANDWithOutEmpty(str, separator) {
    str = str.replace("and", "AND");
    return str.split(separator).filter((val) => val.trim());
  }

  public static toUpperAND = (command) => command ? command.replace("and", "AND") : command;  

  public static splitByMultiSeparator(str, separator) {
    var tempVal = separator[0];
    for (var i = 1; i < separator.length; i++) {
      str = str.split(separator[i]).join(tempVal);
    }
    try { str = str.split(tempVal).filter((val) => val.trim()); }
    catch (err) { str = str.split(tempVal); }
    return str;
  }

  public static splitByMultiSeparatorWithValues(str, separator) {
    //first separator as a temporary join character

    var tempVal = separator[0];
    var arrayOfMathSign = [];
    arrayOfMathSign.push(separator[0]);

    for (var i = 1; i < separator.length; i++) {
      str = str.split(separator[i]).join(tempVal);
      arrayOfMathSign.push(separator[i]);
    }
    str = str.split(tempVal).filter((val) => val);
    return str;
  }

  public static getCommandAccessType(str: string) {
    str = str.toLowerCase();
    if ((str.indexOf('/pri') > -1) || (str.indexOf('/private') > -1)) { return "private" }
    else if ((str.indexOf('/pub') > -1) || (str.indexOf('/public') > -1)) { return "public" }
    else { return "public" }
  }

  public static isPrivatePublicCommand(str: string) {
    str = str.toLowerCase();
    if (str.startsWith('/pri') || str.startsWith('/private')
      || str.startsWith('/pub') || str.startsWith('/public')) {
      return true
    }
    else return false;
  }

  public static checkPrivatePublicCommand(command: string): boolean {
    let result: boolean = false;
    try {
      let mypriPubArray = this.splitWithoutEmpty(command.trim().toUpperCase(), 'AND');
      mypriPubArray.forEach((_cmd_, indx) => {
        if (this.isPrivatePublicCommand(_cmd_.toLowerCase().trim())) {
          result = true;
        }
      })
    } catch (error) { return result; }
    return result;
  }

  public static commandInludesDice(command: string) { //5D10 => 5D100 KL4

    if (!command) return null;

    let data: any;
    for (const _dice in DICE) {
      if (!Number(_dice)) {
        if (command.trim().endsWith(_dice)) {

          data = {
            command: command,//5D10
            dice: _dice //D10
          }
          return data;
        }
      }
    }

    return null;
  }

  public static replacePriPub = (command: string) => { return command.replace(/\/private|\/public|\/pri|\/pub/gi, '').trim(); }   

  public static commandInludesDiceInDiceTray(command: string, diceTray: DiceTray[]) { //5D10 => 5D100 KL4

    if (!command) return null;

    let data: any;
    for (const dice in diceTray) {
      let _dice = diceTray[dice].name.toUpperCase()
      //if (!Number(_dice)) {
      if (command.trim().endsWith(_dice)) {

        data = {
          command: command,//5D10
          dice: _dice //D10
        }
        return data;
      }
      //}
    }

    return null;
  }

  public static getValueBefore(str, separator) {
    var index = str.indexOf(separator);
    if (index != -1) {
      return str.substring(0, index);
    }
    return '';
  }

  public static compareDice(first, last) {
    if (first.dice < last.dice)
      return -1;
    if (first.dice > last.dice)
      return 1;
    return 0;
  }

  public static getCommandWithSigns(commandText: string) {

    let replace = /\+/gi;
    commandText = commandText.replace(replace, "#+");
    replace = /\-/gi;
    commandText = commandText.replace(replace, "#-");
    //replace = /\*/gi;
    //commandText = commandText.replace(replace, "#*");

    let signs: any = [];
    let _splitCommand = commandText.split('#').filter((val) => val);

    for (var val in _splitCommand) {
      let sign = _splitCommand[val] ? _splitCommand[val].trim().charAt(0) : '';
      //not implementing divide as we already have symbol divide(/) in RU/RD 
      switch (sign) {
        case '+':
        case '-':
          //case '*':
          {
            signs.push({ dice: _splitCommand[val].substring(1).trim(), sign: sign, index: +val + 1 });
            break;
          }
        default: {
          signs.push({ dice: _splitCommand[val].trim(), sign: '+', index: +val + 1 });
          break;
        }
      }
    }
    return signs;
  }
  public static commandInterpretationForConditionStatValueCalculations(command: string, numberToAdd?: number, modArray?: any, customDices: CustomDice[] = []): any {

    let _commandInterpretationArrayList = [];
    let _calculationCommand = "";

    if (!command) return [];
    //example command:  d4 + 2d6 * d8 - 2d10 kh1 / d12 + (d20 + d100 / 5) AND (4d6 kh3 / 5 ru) + (4d6 kh2 / 5 rd)
    let _commandInterpretationArray = this.commandInterpretationArray(command, customDices);

    let diceARRAY = [];

    //iteration for AND
    for (var cmd in _commandInterpretationArray) {

      let _finalInterpretationArray = [];
      let _calculationString = "";
      let _calculationString_withColor = "";
      let _calculationStringForResult = "";
      let _operator = "";
      let _commandArray = _commandInterpretationArray[cmd].commandArray;
      let checkLastCommandString = '';
      //iteration for command
      for (var cmdArr in _commandArray) {
        let _sign = ' ' + _commandArray[cmdArr].sign + ' ';
        if (_commandArray[cmdArr].parenthesis) {
          let __calculationString = "";
          let __calculationString_withColor = "";
          let _diceArray = _commandArray[cmdArr].diceArray;

          for (var diceArr in _diceArray) {

            __calculationString +=  __calculationString == "" ?
              (_calculationString == "" ? (_sign.trim() == '-' ? _sign : '') : _sign) + ' ( ' + (_diceArray[diceArr].sign.trim() == '-' ? _diceArray[diceArr].sign : '') + _diceArray[diceArr].diceInterpretationArray.randomNumbersAfter
              : _diceArray[diceArr].sign + _diceArray[diceArr].diceInterpretationArray.randomNumbersAfter;

            __calculationString_withColor += __calculationString_withColor == "" ?
              (_calculationString_withColor == "" ? (_sign.trim() == '-' ? _sign : '') : _sign) + ' ( ' + (_diceArray[diceArr].sign.trim() == '-' ? _diceArray[diceArr].sign : '') + this.GetColoredNumber(_diceArray[diceArr].diceInterpretationArray)
              : _diceArray[diceArr].sign + this.GetColoredNumber(_diceArray[diceArr].diceInterpretationArray);


            _finalInterpretationArray.push(this.calsInterpretationArray(_diceArray[diceArr], +cmd));

            if (_diceArray.length - 1 === +diceArr) {
              //if (!_commandArray[cmdArr].isCustomDice)
              _calculationString += __calculationString + ' ) ';
              _calculationString_withColor += __calculationString_withColor + ' ) ';
            }

            ///20-dec-18
            let checkLastCommandStringReplaceTo = "";
            checkLastCommandString += _diceArray[diceArr].sign + _diceArray[diceArr].diceInterpretationArray.randomNumbersAfter;

            try {
              _operator = _diceArray[diceArr].diceInterpretationArray.operator;
              if (_operator == 'RU') {
                checkLastCommandStringReplaceTo = Math.ceil(eval(checkLastCommandString)).toString();
              } else if (_operator == 'RD') {
                checkLastCommandStringReplaceTo = Math.floor(eval(checkLastCommandString)).toString();
              }
            } catch (err) { }

            _calculationStringForResult = _calculationString.replace(/  /g, ' ');
            if (checkLastCommandStringReplaceTo !== "") {
              _calculationStringForResult = _calculationStringForResult.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
            }
            checkLastCommandString = _diceArray[diceArr].diceInterpretationArray.randomNumbersAfter;
          }

        }
        else if (_commandArray[cmdArr].addMod) {

          let modValue: number = Utilities.InvalidValueForConditionStats;
          if (modArray)
            modArray.map(mod => {
              //let charactersCharacterStatId = mod.charactersCharacterStatId;
              //let selectedStatValue = mod.selectedStatValue;
              let selectedStat: string = mod.selectedStat;
              if (_commandArray[cmdArr].dice === selectedStat) {
                modValue = +mod.selectedStatValue;
              }
            });

          try {
            _commandArray[cmdArr].diceInterpretationArray.randomNumbers = modValue;
            _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter = modValue;
            //_commandArray[cmdArr].diceInterpretationArray.randomNumbersList = modValue;
            //_commandArray[cmdArr].diceInterpretationArray.randomNumbersListAfter = modValue;
            _commandArray[cmdArr].diceInterpretationArray.randomNumbersSum = +modValue;
            _commandArray[cmdArr].diceInterpretationArray.randomNumbersSumAfter = +modValue;
            _commandArray[cmdArr].static = true;

            _finalInterpretationArray.push(this.calsInterpretationArray(_commandArray[cmdArr], +cmd));
          } catch (err) { }

          //if (!_commandArray[cmdArr].isCustomDice)
          _calculationString += _calculationString == "" ? (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + modValue : _sign + modValue;
          _calculationString_withColor += _calculationString_withColor == "" ? (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + modValue : _sign + modValue;

          _calculationStringForResult = _calculationString;
        }
        else {
          let checkLastCommandStringReplaceTo = "";
          checkLastCommandString += _commandArray[cmdArr].sign + _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter;

          try {
            _operator = _commandArray[cmdArr].diceInterpretationArray.operator;
            if (_operator == 'RU') {
              checkLastCommandStringReplaceTo = Math.ceil(eval(checkLastCommandString)).toString();
            } else if (_operator == 'RD') {
              checkLastCommandStringReplaceTo = Math.floor(eval(checkLastCommandString)).toString();
            }
          } catch (err) { }

          //if (!_commandArray[cmdArr].isCustomDice)
          _calculationString += _calculationString == "" ? (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter
            : _sign + _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter;

          _calculationString_withColor += _calculationString_withColor == "" ?
            (_commandArray[cmdArr].sign.trim() == '-' ? _sign : '') + this.GetColoredNumber(_commandArray[cmdArr].diceInterpretationArray)
            : _sign + this.GetColoredNumber(_commandArray[cmdArr].diceInterpretationArray);

          _finalInterpretationArray.push(this.calsInterpretationArray(_commandArray[cmdArr], +cmd));

          _calculationStringForResult = _calculationString.replace(/  /g, ' ');
          if (checkLastCommandStringReplaceTo !== "") {
            //let newstring = _calculationStringForResult.replace('(', '').replace(')', '').replace(/ /g, '');
            //let res = newstring.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
            //checkLastCommandString = checkLastCommandString.replace(/ /g, '');
            //_calculationStringForResult = newstring.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
            _calculationStringForResult = _calculationStringForResult.replace(checkLastCommandString, checkLastCommandStringReplaceTo);
          }

          checkLastCommandString = _commandArray[cmdArr].diceInterpretationArray.randomNumbersAfter;
        }

        if (_commandArray[cmdArr].isCustomDice) {

          //_calculationString = '';
          //if (_commandArray[cmdArr].isCustomNumeric) {
          //    _calculationString += _commandArray[cmdArr].diceInterpretationArray.randomNumbersListAfter.join(' + ');
          //}
          //else {
          //    _calculationString += _commandArray[cmdArr].diceInterpretationArray.randomNumbersListAfter.join(', ');
          //}
          _calculationString = _calculationString.replace(/  /g, ' ');
          _calculationString_withColor = _calculationString_withColor.replace(/  /g, ' ');
          _calculationStringForResult = _calculationString.replace(/  /g, ' ');


        }

      }

      //_calculationString = _calculationString.replace(/  /g, ' ');
      try {
        if (_calculationString.split("((").length - 1 === _calculationString.split("))").length - 1) {
          _calculationString = _calculationString.replace('((', '(').replace('))', ')');
          _calculationString_withColor = _calculationString_withColor.replace('((', '(').replace('))', ')');
        }
      } catch (err) { }
      if (_calculationString.length > 1) {
        _calculationString = _calculationString.replace(/  /g, ' ');
        _calculationString_withColor = _calculationString_withColor.replace(/  /g, ' ');
        _calculationString.split('+ -').map((x) => {
          _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        _calculationString.split('+ *').map((x) => {
          _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        _calculationString.split('+ /').map((x) => {
          _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        _calculationString.split('+ +').map((x) => {
          _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
          _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
        })
        _calculationString.split('- -').map((x) => {
          _calculationString = _calculationString.replace('- -', '-');
          _calculationString_withColor = _calculationString_withColor.replace('- -', '-');
        })
      }
      _calculationString = _calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');
      _calculationString_withColor = _calculationString_withColor.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');

      if (numberToAdd) {

        _calculationString = _calculationString + ' + ' + numberToAdd;
        _calculationString_withColor = _calculationString_withColor + ' + ' + numberToAdd;
        _calculationStringForResult = _calculationStringForResult + ' + ' + numberToAdd;
        _commandInterpretationArray[cmd] = Object.assign(_commandInterpretationArray[cmd], { command: _commandInterpretationArray[cmd].command + ' + ' + numberToAdd })
      }

      //let _calculationStringArray = this.splitByMultiSeparator(calculationStringForArray, ['+', '-', '/', '*']);

      _calculationString = _calculationString.replace(/  /g, ' ');
      _calculationString_withColor = _calculationString_withColor.replace(/  /g, ' ');

      let _calculationStringArray = this.getCalculationStringArray(_calculationString, undefined);

      let __result = 0;

      let __IsResultWithCustomDice = true;
      try {

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
        __result = Math.round(eval(_calculationStringForResult));
        if (_commandInterpretationArray[cmd].command.indexOf('RU') > -1)
          __result = Math.ceil(eval(_calculationStringForResult));
        else if (_commandInterpretationArray[cmd].command.indexOf('RD') > -1)
          __result = Math.floor(eval(_calculationStringForResult));
        __IsResultWithCustomDice = false;


        let IsNonNumericCommandIncluded: boolean = false;
        _commandArray.map((c) => {
          if (c.isCustomDice && !c.isCustomNumeric) {
            IsNonNumericCommandIncluded = true;
          }
        })

        if (IsNonNumericCommandIncluded) {
          __IsResultWithCustomDice = true;
          if (isNaN(__result)) {
            __result = Utilities.InvalidValueForConditionStats;
          }
        }

        //if (_commandInterpretationArray[cmd].isCustomNumericCommand) {

        //}
        //if (_commandArray[0].isCustomDice && !_commandInterpretationArray[cmd].isCustomNumericCommand) {
        //    __result = 0
        //    __IsResultWithCustomDice = true;
        //}
      }
      catch (exe) {
        __result = Utilities.InvalidValueForConditionStats
        __IsResultWithCustomDice = true;

      }
      _commandInterpretationArrayList.push({
        calculationString: _calculationString,
        calculationStringArray: _calculationStringArray,
        calculationResult: __result, //Math.round(eval(_calculationStringForResult)), //Math.floor(eval(_calculationString))
        calculationCommand: _commandInterpretationArray[cmd].command,
        calculationArray: _finalInterpretationArray,
        calculationIndex: +cmd,
        isResultWithCustomDice: __IsResultWithCustomDice,
        isCustomNumericCommand: _commandInterpretationArray[cmd].isCustomNumericCommand ? true : false,
        calculationStringColor: _calculationString_withColor
      });
    }

    return _commandInterpretationArrayList;
  }
  public static getArrayOfNumbersByLength(length: number, diceNumber: number): any[] {
    let arr = [];
    for (var i = 0; i < length; i++) {
      let number = this.getRandomNumber(1, diceNumber);
      arr.push(number.toString());
    }
    return arr;
  }
  public static IsAllowedText(str: string): boolean {
    str = str.trim();
    if (str.startsWith('"') && str.endsWith('"')) {
      return true;
    }
    else if (str.startsWith("'") && str.endsWith("'")) {
      return true;
    }
    else {
      return false;
    }
  }
  public static fillBeforeAndAfterText(command: string) {
    let commandArr = DiceService.splitWithoutEmpty(command, ' ');

    let Initial_flag = true;
    let startString = '';
    let endString = '';
    commandArr.map((x => {
      if (DiceService.IsAllowedText(x)) {
        if (Initial_flag) {
          startString = startString + " " + x + " ";
        } else {
          endString = endString + " " + x + " ";
        }
      }
      else {
        Initial_flag = false;
      }
    }))
    return { start: startString, end: endString };
  }

  //public static RU_RD_OnlyContainsInQuotes(commandText): boolean {
  //  
  //  let RU_totalCount: number = (commandText.match(/RU/g) || []).length;
  //  let RD_totalCount: number = (commandText.match(/RD/g) || []).length;

  //  let Quotes_RU_Count: number = 0;
  //  let Quotes_RD_Count: number = 0;

  //  var matchArr = [];
  //  var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
  //  var match = myRegexp.exec(commandText);
  //  while (match != null) {
  //    // matched text: match[0]
  //    // match start: match.index
  //    // capturing group n: match[n]
  //    
  //    matchArr.push(match[0])
  //    match = myRegexp.exec(commandText);
  //  }

  //  matchArr.map((x) => {
  //    if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x)) {
  //      Quotes_RU_Count += (x.match(/RU/g) || []).length;
  //      Quotes_RD_Count += (x.match(/RD/g) || []).length;
  //    }
  //  })
  //  if (RU_totalCount === Quotes_RU_Count && RD_totalCount === Quotes_RD_Count) {
  //    return true;
  //  }
  //  return false;
  //}
  public static RU_RD_ContainsInQuotes(commandText): boolean {
    
    //let RU_totalCount: number = (commandText.match(/RU/g) || []).length;
    //let RD_totalCount: number = (commandText.match(/RD/g) || []).length;

    let Quotes_RU_Count: number = 0;
    let Quotes_RD_Count: number = 0;

    var matchArr = [];
    var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    var match = myRegexp.exec(commandText);
    while (match != null) {
      // matched text: match[0]
      // match start: match.index
      // capturing group n: match[n]
      
      matchArr.push(match[0])
      match = myRegexp.exec(commandText);
    }

    matchArr.map((x) => {
      if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x)) {
        Quotes_RU_Count += (x.match(/RU/g) || []).length;
        Quotes_RD_Count += (x.match(/RD/g) || []).length;
      }
    })
    if (Quotes_RU_Count || Quotes_RD_Count) {
      return true;
    }
    return false;
  }
  //public static isSquareBracesEndInQuotes(commandText) {
  //  let BracketEnd_totalCount: number = (commandText.match(/\[/g) || []).length;

  //  let Quotes_BracketEnd_Count: number = 0;

  //  let flag = false;
  //  var matchArr = [];
  //  var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
  //  var match = myRegexp.exec(commandText);
  //  while (match != null) {
  //    matchArr.push(match[0])
  //    match = myRegexp.exec(commandText);
  //  }

  //  matchArr.map((x) => {
  //    if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x) && !flag) {
  //      flag = x.split(']').length>0 ? true : false
  //    }
  //  })
  //}
  public static hideTextCommandSquareBraces(calculationString:string):string {
    var matchArr = [];
    var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    var match = myRegexp.exec(calculationString);
    while (match != null) {
      // matched text: match[0]
      // match start: match.index
      // capturing group n: match[n]
     
      matchArr.push(match[0])
      match = myRegexp.exec(calculationString);
    }

    matchArr.map((x) => {
      if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x)) {
        let temp = x;
        temp = temp.replace(/\[/g, '_SqrBrktStart_')
        temp = temp.replace(/\]/g, '_SqrBrktEnd_')
        calculationString = calculationString.replace(x, temp);
       
      }
    })
    return calculationString;
  }
  public static showTextCommandSquareBraces(calculationString: string): string {
    var matchArr = [];
    var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    var match = myRegexp.exec(calculationString);
    while (match != null) {
      // matched text: match[0]
      // match start: match.index
      // capturing group n: match[n]
      
      matchArr.push(match[0])
      match = myRegexp.exec(calculationString);
    }

    matchArr.map((x) => {
      if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x)) {
        let temp = x;
        temp = temp.replace(/_SqrBrktStart_/g, '[')
        temp = temp.replace(/_SqrBrktEnd_/g, ']')
        calculationString = calculationString.replace(x, temp);

      }
    })
    return calculationString;
  }

  public static BindDeckCustomDices(customDices: CustomDice[]): CustomDice[] {
    let DeckDices = this.GetDeckDices();
    if (customDices) {
      if (customDices.length) {
        customDices.push(DeckDices.DOC)
        customDices.push(DeckDices.DECK)
        return customDices;
      }
    }
    let newDices: CustomDice[] = [];
    newDices.push(DeckDices.DOC)
    newDices.push(DeckDices.DECK)
    return newDices;
  }

  public static GetDeckDices() {
    let DocResults: Results[] = [
      { customDiceResultId: 1, name: 'Two of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Two of Spades-min.png' },
      { customDiceResultId: 2, name: 'Three of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Three of Spades-min.png' },
      { customDiceResultId: 3, name: 'Four of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Four of Spades-min.png' },
      { customDiceResultId: 4, name: 'Five of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Five of Spades-min.png' },
      { customDiceResultId: 5, name: 'Six of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Six of Spades-min.png' },
      { customDiceResultId: 6, name: 'Seven of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Seven of Spades-min.png'},
      { customDiceResultId: 7, name: 'Eight of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Eight of Spades-min.png'},
      { customDiceResultId: 8, name: 'Nine of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Nine of Spades-min.png'},
      { customDiceResultId: 9, name: 'Ten of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Ten of Spades-min.png'},
      { customDiceResultId: 10, name: 'Jack of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Jack of Spades-min.png' },
      { customDiceResultId: 11, name: 'Queen of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Queen of Spades-min.png'},
      { customDiceResultId: 12, name: 'King of Spades', displayContent: '', deckIcon: '../assets/images/card-images/King of Spades-min.png' },
      { customDiceResultId: 13, name: 'Ace of Spades', displayContent: '', deckIcon: '../assets/images/card-images/Ace of Spades-min.png'  },
      { customDiceResultId: 14, name: 'Two of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Two of Hearts-min.png' },
      { customDiceResultId: 15, name: 'Three of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Three of Hearts-min.png'},
      { customDiceResultId: 16, name: 'Four of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Four of Hearts-min.png'  },
      { customDiceResultId: 17, name: 'Five of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Five of Hearts-min.png' },
      { customDiceResultId: 18, name: 'Six of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Six of Hearts-min.png'  },
      { customDiceResultId: 19, name: 'Seven of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Seven of Hearts-min.png' },
      { customDiceResultId: 20, name: 'Eight of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Eight of Hearts-min.png' },
      { customDiceResultId: 21, name: 'Nine of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Nine of Hearts-min.png' },
      { customDiceResultId: 22, name: 'Ten of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Ten of Hearts-min.png'   },
      { customDiceResultId: 23, name: 'Jack of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Jack of Hearts-min.png'},
      { customDiceResultId: 24, name: 'Queen of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Queen of Hearts-min.png'   },
      { customDiceResultId: 25, name: 'King of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/King of hearts-min.png'  },
      { customDiceResultId: 26, name: 'Ace of Hearts', displayContent: '', deckIcon: '../assets/images/card-images/Ace of Hearts-min.png' },
      { customDiceResultId: 27, name: 'Two of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Two of Diamonds-min.png' },
      { customDiceResultId: 28, name: 'Three of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/three of diamonds-min.png' },
      { customDiceResultId: 29, name: 'Four of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Four of Diamonds-min.png' },
      { customDiceResultId: 30, name: 'Five of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Five of Diamonds-min.png'},
      { customDiceResultId: 31, name: 'Six of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Six of Diamonds-min.png' },
      { customDiceResultId: 32, name: 'Seven of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Seven of Diamonds-min.png'},
      { customDiceResultId: 33, name: 'Eight of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Eight of Diamonds-min.png' },
      { customDiceResultId: 34, name: 'Nine of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Nine of Diamonds-min.png'  },
      { customDiceResultId: 35, name: 'Ten of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Ten of Diamonds-min.png' },
      { customDiceResultId: 36, name: 'Jack of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Jack of Diamonds-min.png'  },
      { customDiceResultId: 37, name: 'Queen of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Queen of Diamonds-min.png'  },
      { customDiceResultId: 38, name: 'King of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/King of Dianìmonds-min.png'  },
      { customDiceResultId: 39, name: 'Ace of Diamonds', displayContent: '', deckIcon: '../assets/images/card-images/Ace of Diamonds-min.png' },
      { customDiceResultId: 40, name: 'Two of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Two of Clubs-min.png'  },
      { customDiceResultId: 41, name: 'Three of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Three of Clubs-min.png'  },
      { customDiceResultId: 42, name: 'Four of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Four of Clubs-min.png'  },
      { customDiceResultId: 43, name: 'Five of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Five of Clubs-min.png' },
      { customDiceResultId: 44, name: 'Six of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Six of Clubs-min.png'  },
      { customDiceResultId: 45, name: 'Seven of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Seven of Clubs-min.png'  },
      { customDiceResultId: 46, name: 'Eight of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Eight of Clubs-min.png'  },
      { customDiceResultId: 47, name: 'Nine of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Nine of Clubs-min.png'  },
      { customDiceResultId: 48, name: 'Ten of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Ten of Clubs-min.png' },
      { customDiceResultId: 49, name: 'Jack of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Jack of Clubs-min.png'   },
      { customDiceResultId: 50, name: 'Queen of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Queen of Clubs-min.png' },
      { customDiceResultId: 51, name: 'King of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/King of Clubs-min.png'  },
      { customDiceResultId: 52, name: 'Ace of Clubs', displayContent: '', deckIcon: '../assets/images/card-images/Ace of Clubs-min.png' },
    ];

    let DOC = new CustomDice(-1, "DOC", DICE_ICON.DECK, false, CustomDiceResultType.TEXT, DocResults);


    let DeckResults = Object.assign([], DocResults);
    DeckResults.push({ customDiceResultId: 53, name: 'Joker', displayContent: '', deckIcon: '../assets/images/card-images/joker-min.png' })
    DeckResults.push({ customDiceResultId: 54, name: 'Joker', displayContent: '', deckIcon: '../assets/images/card-images/joker-min.png' })

    
    let DECK = new CustomDice(-2, "DECK", DICE_ICON.DECK, false,CustomDiceResultType.TEXT, DeckResults)

    return { DOC: DOC, DECK: DECK };
  }
  public static removeQuotesContent(str): string {
    var matchArr = [];
    var myRegexp = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    var match = myRegexp.exec(str);
    while (match != null) {
      // matched text: match[0]
      // match start: match.index
      // capturing group n: match[n]
      
      matchArr.push(match[0])
      match = myRegexp.exec(str);
    }

    matchArr.map((x) => {
      if (/(["'])(?:(?=(\\?))\2.)*?\1/g.test(x)) {
        str = str.replace(x, '');

      }
    })
  return str.trim();
  }
  public static IsImageDiceWithNonNumeric(diceName, customDices:CustomDice[]):boolean {
    if (diceName) {
      let Cdice_s: CustomDice[] = customDices.filter(x => x.name == diceName);
      if (Cdice_s.length) {
        let Cdice: CustomDice = Cdice_s[0];
        if (Cdice.customDicetype == CustomDiceResultType.IMAGE) {
          if (!Cdice.isNumeric) {
            return true;
          }
          
        }
      }
    }
    return false;
  }
  public static CheckValidFECommand(temp_diceInterpretationArray) {
    if (temp_diceInterpretationArray.isInvalidFECommand) {
      return true;
    }
    return false;
  }
  public static CheckIsFECommand(temp_diceInterpretationArray) {
    if (temp_diceInterpretationArray.isFeDice) {
      return true;
    }
    return false;
  }
  public static rollDiceExternally(alertService: AlertService, CommandString: string, customDices: CustomDice[], IsDiceRolledFromChat: boolean=false) {
    let statdetails: any = [];
    let charactersCharacterStats: any = [];
    let diceRolledData: any = [];
    let characterMultipleCommands: any;
    let _mainCommandText = CommandString;
    let calculationStringArray: any;
    let characterCommandModel:any = {};
    let totalAndLimit: number = IsDiceRolledFromChat ? 6 : 1;
    //if (!IsRollCurrentAgain) {
    //  IsRollCurrentAgain = false;
    //}
    //if (!lastResultArray) {
    //  lastResultArray = undefined;
    //}
    //let OldCommandForRollCurrentAgain: any = undefined;
    //if (IsRollCurrentAgain) {
    //  OldCommandForRollCurrentAgain = characterMultipleCommands;
    //}
    let anyCommandIsCustomWithNonNumeric = false;
    //this.loadingResult = false;
    let command = CommandString;
    let commandIfERROR = CommandString;

    //if (!command && isFromTile) {
    //  alertService.showMessage("The command associated with this record has been removed. Please update the record to resolve.", "", MessageSeverity.error);
    //  if (this.diceSection = true) {
    //    this.rollSection = false;
    //  }
    //  else if (this.rollSection = true) {
    //    this.diceSection = false;
    //  }
    //}
    //else if (!command) {
    //  alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
    //  if (this.diceSection = true) {
    //    this.rollSection = false;
    //  }
    //  else if (this.rollSection = true) {
    //    this.diceSection = false;
    //  }
    //}
    //else if (command.trim() == '') {
    //  alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
    //  if (this.diceSection = true) {
    //    this.rollSection = false;
    //  }
    //  else if (this.rollSection = true) {
    //    this.diceSection = false;
    //  }
    //}
   

    _mainCommandText= !_mainCommandText || _mainCommandText == "" ? command : _mainCommandText;
    command = _mainCommandText ? _mainCommandText.toUpperCase() : "";
    
    if (command.length >= 500) {
      
      //alertService.showMessage("A maximum of 500 characters is allowed for a command. Please adjust your command string and try again.", "", MessageSeverity.error);
      return "error";
      }
      else {

        let AND_LIMIT = DiceService.splitWithoutEmpty(command.trim().toUpperCase(), 'AND');
        if (AND_LIMIT.length > totalAndLimit) {
          //alertService.resetStickyMessage();
          //alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
          //setTimeout(() => { alertService.resetStickyMessage(); }, 1000);
          
          characterCommandModel.command = _mainCommandText;
          return "error2";
          ////////////////////////////return false;
        }
        //////////////////////////////////////////////
       

        //////////////////////////////////////////////
        //add mod & validate command            
        let commandToValidate = command.trim();

        //this.addModArray.map(mod => {
        //  //let charactersCharacterStatId = mod.charactersCharacterStatId;
        //  //let selectedStatValue = mod.selectedStatValue;
        //  let selectedStat: string = mod.selectedStat;
        //  commandToValidate = commandToValidate.replace(selectedStat.toUpperCase(), "D");
        //});
        //if (isFromCampaignDetail) {
        //  if (commandToValidate) {
        //    commandToValidate = commandToValidate.replace(/\[(.*?)\]/g, "0");
        //  }
        //}
        let isValidCommand = DiceService.validateCommandTextNew(commandToValidate);
        let isValidCommand99 = DiceService.validateCommand99Limit(commandToValidate);
        if (!isValidCommand || !isValidCommand99) {
          //alertService.resetStickyMessage();
          command = commandIfERROR;
          //alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
          //setTimeout(() => { alertService.resetStickyMessage(); }, 1600);
         
          characterCommandModel.command = _mainCommandText;
          return "error3";
          //return 0;
          ////////////////////////////return false;
        }

        if (customDices.length > 0) {
          let dArray = DiceService.commandInterpretation(command, undefined, [], customDices);
          let IsCmdValid = true;
          dArray.map((darr) => {
            darr.calculationArray.map((d) => {

              let valid = true;
              if (d.dice.length >= 2) {
                valid = false
                //skip letter D from Dice Name------Start--------
                //let arr = d.dice.split('D');
                let arr = d.dice.replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_');
                //skip letter D from Dice Name------End--------

                let CountOfDice = 1;
                if (arr.length > 1) {
                  if (/^-?[0-9]\d*(\\d+)?$/g.test(arr[0])) {
                    CountOfDice = parseInt(arr[0]);
                  }
                }
                if (d.dice.toUpperCase().charAt(arr[0].length) == 'D' && /^[a-zA-Z]/.test(d.dice.toUpperCase().charAt(arr[0].length + 1))) {
                  customDices.map((cd) => {
                    if (d.dice == cd.name) {
                      valid = true
                    }
                  })

                  try {
                    //skip letter D from Dice Name------Start--------
                    // if (!valid && !d.dice.toUpperCase().split('D')[1].startsWith('F')) {
                    //if (!valid && !d.dice.toUpperCase().replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_')[1].startsWith('F')) {

                    if (!valid && d.dice.toUpperCase().replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_')[1] != 'F') {
                      //skip letter D from Dice Name------End--------
                      IsCmdValid = false;
                    }
                  } catch { if (!valid) IsCmdValid = false; }
                }

              }
            })
          })

          if (!IsCmdValid) {
            command = commandIfERROR;
            //alertService.showMessage("Please enter a valid command.", "", MessageSeverity.error);
            return "error4";
           // return 0;
          ////////////////////////////return false;
          }
        }


        let __characterMultipleCommands: any;
        //if (lastResultArray) {
        //  __characterMultipleCommands = lastResultArray;
        //  __characterMultipleCommands = lastResultArray;
        //  this.loadingResult = true;
        //}
        //else if (IsRollCurrentAgain) {
        //  try {
        //    let newCharacterMultipleCommands = DiceService.commandInterpretation(command, undefined, this.addModArray, this.customDices, _mainCommandText.toUpperCase());
        //    let newResultOfCurrentCommandSelected = newCharacterMultipleCommands[this.activeAndCommand];

        //    OldCommandForRollCurrentAgain = OldCommandForRollCurrentAgain.map((oldCmd, oldCmdIndex) => {
        //      if (oldCmdIndex == this.activeAndCommand) {
        //        oldCmd = newResultOfCurrentCommandSelected;
        //      }
        //      return oldCmd;
        //    })

        //    characterMultipleCommands = OldCommandForRollCurrentAgain;
        //    __characterMultipleCommands = newResultOfCurrentCommandSelected;


        //  }
        //  catch (e) {
        //    characterMultipleCommands = DiceService.commandInterpretation(command, undefined, this.addModArray, this.customDices, _mainCommandText.toUpperCase());
        //    __characterMultipleCommands = characterMultipleCommands[0];
        //  }
        //}
        //else {
          characterMultipleCommands = DiceService.commandInterpretation(command, undefined, [], customDices, _mainCommandText.toUpperCase());

          __characterMultipleCommands = characterMultipleCommands[0];
        //}

        //if (this.customDices.length>0) {

        //}
        let isInvalidFECommand = false;
        if (characterMultipleCommands) {
          if (characterMultipleCommands.length) {
            characterMultipleCommands.map((x) => {
              if (x.isInvalidFECommand) {
                //alertService.showMessage("Please enter a valid command.", "", MessageSeverity.error);
                isInvalidFECommand = true;
                return false;
              }
            })
          }
        }
        if (isInvalidFECommand) {
          //alertService.showMessage("Please enter a valid command.", "", MessageSeverity.error);
          return "error5";
          //return 0;
          ////////////////////////////return false;
        }
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

        diceRolledData = __characterMultipleCommands.calculationArray;
        /*********************************************************************************/
        let commandTxt = __calculationCommand;
        //if (!IsRollCurrentAgain) {
        //  this.activeAndCommand = 0;
        //}

        //let processCommandWithResult = this.processCommandWithResult(commandTxt, characterCommand);



        diceRolledData.forEach(diceRoll => {
          if (!diceRoll.static)
            diceRoll.randomNumbersList.forEach(num => { num.isAnimated = true; });
          else
            diceRoll.randomNumbersList.forEach(num => { num.isAnimated = false; });

          //----variable to hide Exploded dice----//
          //let StartHidingDice = false;

          //if (!lastResultArray) {

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

          //}


          //--END variable to hide Exploded dice--//
        });

        //this.characterCommandModel.command = __calculationCommand;
        characterCommandModel.command = _mainCommandText;
        characterCommandModel.lastResult = __calculationResult;
        characterCommandModel.lastResultNumbers = __calculationString;
        characterCommandModel.isCustomNumericCommand = __isCustomNumericCommand;
        characterCommandModel.isCustomDice = __characterMultipleCommands.isResultWithCustomDice

        
        //character.lastCommand = commandTxt;
        //character.lastCommandResult = __calculationString;
        //let textResult = this.fillBeforeAndAfterText(characterCommand.command, true);
        //this.beforeResultText = textResult.start;
        //this.afterResultText = textResult.end;
        //if (characterMultipleCommands) {
        //  if (characterMultipleCommands.length > 1) {
        //    this.displayCurrentRollBtn = true;
        //    this.rollAgainBtnText = 'Roll Current  Again';
        //  } else {
        //    this.displayCurrentRollBtn = false;
        //    this.rollAgainBtnText = 'Roll Again';
        //  }
        //}

       
          //this.characterCommandModel.lastResult = __calculationResult;
          //this.characterCommandModel.lastResultNumbers = __calculationString;

          /*Update Last command if command is saved in charatcer command*/
          try {

            //const characterLastCommand = new CharacterLastCommand();
            //characterLastCommand.characterId = character.characterId;
            //characterLastCommand.lastCommand = commandTxt;
            //characterLastCommand.lastCommandResult = __calculationString;
            //characterLastCommand.lastCommandTotal = __calculationResult;

            let lastCommandValues: string = "";
            diceRolledData.forEach((diceRoll, index) => {
              let numberString = '';
              diceRoll.randomNumbersList.map((x, xIndex) => {
                if (xIndex == diceRoll.randomNumbersList.length - 1) {
                  numberString += x.number;
                }
                else {
                  numberString += x.number + ",";
                }
              })
              if (diceRoll.dice && diceRoll.diceIcon) {
                lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
                  diceRoll.randomCount + diceRoll.dice
                  + "=" + numberString.toString();
                //+ "=" + diceRoll.randomNumbersListAfter.toString();
              } else {
                lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
                  + "=" + numberString.toString();
                //+ "=" + diceRoll.randomNumbersListAfter.toString();
              }

            });

          //  characterLastCommand.lastCommandValues = lastCommandValues; //

            
            /**/
           

            //alert(isFromTile);
            //if (!isFromTile)
            //////Save multiple command using AND keyword/////////

            if (characterMultipleCommands) {
              if (characterMultipleCommands.length > 1) {
                characterMultipleCommands.map((cmd, index) => {
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

              //      characterLastCommand.lastCommand += " AND " + cmd.calculationCommand;
              //      characterLastCommand.lastCommandResult += " AND " + cmd.calculationString;
                    //characterLastCommand.lastCommandTotal += " AND " + __calculationResult;

                    let lastCommandValues: string = "";
                    let _diceRolledData = cmd.calculationArray;
                    _diceRolledData.forEach((diceRoll, index) => {
                      let numberString = '';
                      diceRoll.randomNumbersList.map((x, xIndex) => {
                        if (xIndex == diceRoll.randomNumbersList.length - 1) {
                          numberString += x.number;
                        }
                        else {
                          numberString += x.number + ",";
                        }
                      })

                      if (diceRoll.dice && diceRoll.diceIcon) {
                        lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
                          diceRoll.randomCount + diceRoll.dice
                          + "=" + numberString.toString();
                        //+ "=" + diceRoll.randomNumbersListAfter.toString();
                      } else {
                        lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
                          + "=" + numberString.toString();
                        //+ "=" + diceRoll.randomNumbersListAfter.toString();
                      }

                    });

             //       characterLastCommand.lastCommandValues += " AND " + lastCommandValues; //
                  }
                })
              }
            }
            //////////////////////////////////////////////////////

            //if (!anyCommandIsCustomWithNonNumeric) {
            //this.updateLastCommand(characterLastCommand);
            // }

            //this.HideResult = false;

            //diceRolledData.forEach(diceRoll => {
            //  if (!diceRoll.static)
            //    diceRoll.randomNumbersList.forEach(num => {
            //      num.isAnimated = num.hideExplode ? true : false;
            //      num.isMax = diceRoll.diceNumber === num.number ? true : false;
            //      num.isMin = num.number === 1 ? true : false;
            //      if (num.hideExplode) {

            //        this.HideResult = true;
            //      }
            //    });
            //});
            //------Show rolling hidden Exploded dice and Then stop Rolling------//
            //if (this.HideResult) {
            //  this.cascadeDiceEffectCount = 0;
            //  this.cascadeDiceEffectCurrentCount = 0;
            //  this.cascadeDiceDisplayLength = 0;
            //  this.CascadeExplodeDice();
            //}
            //----END Show rolling hidden Exploded dice and Then stop Rolling----//


            calculationStringArray = DiceService.getCalculationStringArray(__calculationString, diceRolledData);
            characterMultipleCommands[0].calculationStringArray = calculationStringArray;
          } catch (err) { }

      if (!IsDiceRolledFromChat) {
        return characterMultipleCommands[0].calculationResult
      }
      else {
        return { characterCommandModel: characterCommandModel, characterMultipleCommands: characterMultipleCommands };
      }
        
          //color maximum & minimum
          //let _maxNum: number = 0;
          //let _minNum: number = 0;

          //this.diceRolledData.forEach(diceRoll => {
          //    let _maxN = Math.max.apply(Math, diceRoll.randomNumbersListAfter);
          //    let _minN = Math.min.apply(Math, diceRoll.randomNumbersListAfter);

          //    _maxNum = +_maxN > _maxNum ? +_maxN : _maxNum;
          //    _minNum = +_minN > _minNum ? (_minNum == 0 ? +_minN : _minNum) : +_minN;
          //});
          //if (!lastResultArray) {
          //  //if (this.isDicePublicRoll || this.isSkipDicePublicRollcheck) {
          //  if (this.isDicePublicRoll) {
          //    //this.isSkipDicePublicRollcheck = false;
          //    this.appService.updateChatWithDiceRoll({ characterCommandModel: this.characterCommandModel, characterMultipleCommands: characterMultipleCommands });
          //  }
          //}
         // this.loadingResult = true;
       

        //this.diceSection = false;
        //this.rollSection = true;

      
    }
  }
  //public static rollDiceExternally_with_And(alertService: AlertService, CommandString: string, customDices: CustomDice[], IsDiceRolledFromChat: boolean = false) {
  //  let statdetails: any = [];
  //  let charactersCharacterStats: any = [];
  //  let diceRolledData: any = [];
  //  let characterMultipleCommands: any;
  //  let _mainCommandText = CommandString;
  //  let calculationStringArray: any;
  //  let characterCommandModel: any = {};
  //  let totalAndLimit: number = 6;
  //  //if (!IsRollCurrentAgain) {
  //  //  IsRollCurrentAgain = false;
  //  //}
  //  //if (!lastResultArray) {
  //  //  lastResultArray = undefined;
  //  //}
  //  //let OldCommandForRollCurrentAgain: any = undefined;
  //  //if (IsRollCurrentAgain) {
  //  //  OldCommandForRollCurrentAgain = characterMultipleCommands;
  //  //}
  //  let anyCommandIsCustomWithNonNumeric = false;
  //  //this.loadingResult = false;
  //  let command = CommandString;
  //  let commandIfERROR = CommandString;

  //  //if (!command && isFromTile) {
  //  //  alertService.showMessage("The command associated with this record has been removed. Please update the record to resolve.", "", MessageSeverity.error);
  //  //  if (this.diceSection = true) {
  //  //    this.rollSection = false;
  //  //  }
  //  //  else if (this.rollSection = true) {
  //  //    this.diceSection = false;
  //  //  }
  //  //}
  //  //else if (!command) {
  //  //  alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
  //  //  if (this.diceSection = true) {
  //  //    this.rollSection = false;
  //  //  }
  //  //  else if (this.rollSection = true) {
  //  //    this.diceSection = false;
  //  //  }
  //  //}
  //  //else if (command.trim() == '') {
  //  //  alertService.showMessage("Please enter a command.", "", MessageSeverity.error);
  //  //  if (this.diceSection = true) {
  //  //    this.rollSection = false;
  //  //  }
  //  //  else if (this.rollSection = true) {
  //  //    this.diceSection = false;
  //  //  }
  //  //}


  //  _mainCommandText = !_mainCommandText || _mainCommandText == "" ? command : _mainCommandText;
  //  command = _mainCommandText.toUpperCase();
  //  debugger
  //  if (command.length >= 500) {

  //    //alertService.showMessage("A maximum of 500 characters is allowed for a command. Please adjust your command string and try again.", "", MessageSeverity.error);
  //    return "error";
  //  }
  //  else {

  //    let AND_LIMIT = DiceService.splitWithoutEmpty(command.trim().toUpperCase(), 'AND');
  //    if (AND_LIMIT.length > totalAndLimit) {
  //      //alertService.resetStickyMessage();
  //      //alertService.showStickyMessage('', this.AND_Error_Message, MessageSeverity.error);
  //      //setTimeout(() => { alertService.resetStickyMessage(); }, 1000);

  //      characterCommandModel.command = _mainCommandText;
  //      return "error2";
  //      ////////////////////////////return false;
  //    }
  //    //////////////////////////////////////////////


  //    //////////////////////////////////////////////
  //    //add mod & validate command            
  //    let commandToValidate = command.trim();

  //    //this.addModArray.map(mod => {
  //    //  //let charactersCharacterStatId = mod.charactersCharacterStatId;
  //    //  //let selectedStatValue = mod.selectedStatValue;
  //    //  let selectedStat: string = mod.selectedStat;
  //    //  commandToValidate = commandToValidate.replace(selectedStat.toUpperCase(), "D");
  //    //});
  //    //if (isFromCampaignDetail) {
  //    //  if (commandToValidate) {
  //    //    commandToValidate = commandToValidate.replace(/\[(.*?)\]/g, "0");
  //    //  }
  //    //}
  //    let isValidCommand = DiceService.validateCommandTextNew(commandToValidate);
  //    let isValidCommand99 = DiceService.validateCommand99Limit(commandToValidate);
  //    if (!isValidCommand || !isValidCommand99) {
  //      //alertService.resetStickyMessage();
  //      command = commandIfERROR;
  //      //alertService.showStickyMessage('', this.COMMAND_Error, MessageSeverity.error);
  //      //setTimeout(() => { alertService.resetStickyMessage(); }, 1600);

  //      characterCommandModel.command = _mainCommandText;
  //      return "error3";
  //      //return 0;
  //      ////////////////////////////return false;
  //    }

  //    if (customDices.length > 0) {
  //      let dArray = DiceService.commandInterpretation(command, undefined, [], customDices);
  //      let IsCmdValid = true;
  //      dArray.map((darr) => {
  //        darr.calculationArray.map((d) => {

  //          let valid = true;
  //          if (d.dice.length >= 2) {
  //            valid = false
  //            //skip letter D from Dice Name------Start--------
  //            //let arr = d.dice.split('D');
  //            let arr = d.dice.replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_');
  //            //skip letter D from Dice Name------End--------

  //            let CountOfDice = 1;
  //            if (arr.length > 1) {
  //              if (/^-?[0-9]\d*(\\d+)?$/g.test(arr[0])) {
  //                CountOfDice = parseInt(arr[0]);
  //              }
  //            }
  //            if (d.dice.toUpperCase().charAt(arr[0].length) == 'D' && /^[a-zA-Z]/.test(d.dice.toUpperCase().charAt(arr[0].length + 1))) {
  //              customDices.map((cd) => {
  //                if (d.dice == cd.name) {
  //                  valid = true
  //                }
  //              })

  //              try {
  //                //skip letter D from Dice Name------Start--------
  //                // if (!valid && !d.dice.toUpperCase().split('D')[1].startsWith('F')) {
  //                //if (!valid && !d.dice.toUpperCase().replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_')[1].startsWith('F')) {

  //                if (!valid && d.dice.toUpperCase().replace(/\D/, '_#CapitalD#_').split('_#CapitalD#_')[1] != 'F') {
  //                  //skip letter D from Dice Name------End--------
  //                  IsCmdValid = false;
  //                }
  //              } catch { if (!valid) IsCmdValid = false; }
  //            }

  //          }
  //        })
  //      })

  //      if (!IsCmdValid) {
  //        command = commandIfERROR;
  //        //alertService.showMessage("Please enter a valid command.", "", MessageSeverity.error);
  //        return "error4";
  //        // return 0;
  //        ////////////////////////////return false;
  //      }
  //    }


  //    let __characterMultipleCommands: any;
  //    //if (lastResultArray) {
  //    //  __characterMultipleCommands = lastResultArray;
  //    //  __characterMultipleCommands = lastResultArray;
  //    //  this.loadingResult = true;
  //    //}
  //    //else if (IsRollCurrentAgain) {
  //    //  try {
  //    //    let newCharacterMultipleCommands = DiceService.commandInterpretation(command, undefined, this.addModArray, this.customDices, _mainCommandText.toUpperCase());
  //    //    let newResultOfCurrentCommandSelected = newCharacterMultipleCommands[this.activeAndCommand];

  //    //    OldCommandForRollCurrentAgain = OldCommandForRollCurrentAgain.map((oldCmd, oldCmdIndex) => {
  //    //      if (oldCmdIndex == this.activeAndCommand) {
  //    //        oldCmd = newResultOfCurrentCommandSelected;
  //    //      }
  //    //      return oldCmd;
  //    //    })

  //    //    characterMultipleCommands = OldCommandForRollCurrentAgain;
  //    //    __characterMultipleCommands = newResultOfCurrentCommandSelected;


  //    //  }
  //    //  catch (e) {
  //    //    characterMultipleCommands = DiceService.commandInterpretation(command, undefined, this.addModArray, this.customDices, _mainCommandText.toUpperCase());
  //    //    __characterMultipleCommands = characterMultipleCommands[0];
  //    //  }
  //    //}
  //    //else {
  //    characterMultipleCommands = DiceService.commandInterpretation(command, undefined, [], customDices, _mainCommandText.toUpperCase());

  //    __characterMultipleCommands = characterMultipleCommands[0];
  //    //}

  //    //if (this.customDices.length>0) {

  //    //}
  //    let isInvalidFECommand = false;
  //    if (characterMultipleCommands) {
  //      if (characterMultipleCommands.length) {
  //        characterMultipleCommands.map((x) => {
  //          if (x.isInvalidFECommand) {
  //            //alertService.showMessage("Please enter a valid command.", "", MessageSeverity.error);
  //            isInvalidFECommand = true;
  //            return false;
  //          }
  //        })
  //      }
  //    }
  //    if (isInvalidFECommand) {
  //      //alertService.showMessage("Please enter a valid command.", "", MessageSeverity.error);
  //      return "error5";
  //      //return 0;
  //      ////////////////////////////return false;
  //    }
  //    let __calculationCommand = __characterMultipleCommands.calculationCommand.toString();
  //    let __calculationResult = __characterMultipleCommands.calculationResult;
  //    let __calculationString = __characterMultipleCommands.calculationString;
  //    let __isCustomNumericCommand = false;
  //    if (__characterMultipleCommands.isCustomNumericCommand) {
  //      __isCustomNumericCommand = __characterMultipleCommands.isCustomNumericCommand;
  //    }

  //    try {
  //      if (__calculationString.split("((").length - 1 === __calculationString.split("))").length - 1) {
  //        __calculationString = __calculationString.replace('((', '(').replace('))', ')');
  //      }
  //    } catch (err) { }
  //    if (__calculationString.length > 1) {
  //      __calculationString = __calculationString.replace(/  /g, ' ');
  //      __calculationString.split('+ -').map((x) => {
  //        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
  //      })
  //      __calculationString.split('+ *').map((x) => {
  //        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
  //      })
  //      __calculationString.split('+ /').map((x) => {
  //        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
  //      })
  //      __calculationString.split('+ +').map((x) => {
  //        __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+');
  //      })
  //      __calculationString.split('- -').map((x) => {
  //        __calculationString = __calculationString.replace('- -', '-')
  //      })
  //    }
  //    __calculationString = __calculationString.replace('+ -', '-').replace('+ *', '*').replace('+ /', '/').replace('+ +', '+').replace('- -', '-');

  //    diceRolledData = __characterMultipleCommands.calculationArray;
  //    /*********************************************************************************/
  //    let commandTxt = __calculationCommand;
  //    //if (!IsRollCurrentAgain) {
  //    //  this.activeAndCommand = 0;
  //    //}

  //    //let processCommandWithResult = this.processCommandWithResult(commandTxt, characterCommand);



  //    diceRolledData.forEach(diceRoll => {
  //      if (!diceRoll.static)
  //        diceRoll.randomNumbersList.forEach(num => { num.isAnimated = true; });
  //      else
  //        diceRoll.randomNumbersList.forEach(num => { num.isAnimated = false; });

  //      //----variable to hide Exploded dice----//
  //      //let StartHidingDice = false;

  //      //if (!lastResultArray) {

  //      diceRoll.randomNumbersList.map((randomNumberObj, index) => {
  //        if (((index) + 1 > diceRoll.randomCount) && diceRoll.isExploded) {
  //          randomNumberObj.hideExplode = true;
  //        }
  //        //randomNumberObj.hideExplode = StartHidingDice;
  //        //if (diceRoll.isExploded && (diceRoll.diceNumber == randomNumberObj.number)) {
  //        //    randomNumberObj.hideExplode = StartHidingDice;

  //        //    StartHidingDice = true;

  //        //}
  //        //else if (diceRoll.isExploded && (diceRoll.diceNumber != randomNumberObj.number)) {
  //        //    StartHidingDice = false;
  //        //}
  //      })

  //      //}


  //      //--END variable to hide Exploded dice--//
  //    });

  //    //this.characterCommandModel.command = __calculationCommand;
  //    characterCommandModel.command = _mainCommandText;
  //    characterCommandModel.lastResult = __calculationResult;
  //    characterCommandModel.lastResultNumbers = __calculationString;
  //    characterCommandModel.isCustomNumericCommand = __isCustomNumericCommand;
  //    characterCommandModel.isCustomDice = __characterMultipleCommands.isResultWithCustomDice


  //    //character.lastCommand = commandTxt;
  //    //character.lastCommandResult = __calculationString;
  //    //let textResult = this.fillBeforeAndAfterText(characterCommand.command, true);
  //    //this.beforeResultText = textResult.start;
  //    //this.afterResultText = textResult.end;
  //    //if (characterMultipleCommands) {
  //    //  if (characterMultipleCommands.length > 1) {
  //    //    this.displayCurrentRollBtn = true;
  //    //    this.rollAgainBtnText = 'Roll Current  Again';
  //    //  } else {
  //    //    this.displayCurrentRollBtn = false;
  //    //    this.rollAgainBtnText = 'Roll Again';
  //    //  }
  //    //}


  //    //this.characterCommandModel.lastResult = __calculationResult;
  //    //this.characterCommandModel.lastResultNumbers = __calculationString;

  //    /*Update Last command if command is saved in charatcer command*/
  //    try {

  //      //const characterLastCommand = new CharacterLastCommand();
  //      //characterLastCommand.characterId = character.characterId;
  //      //characterLastCommand.lastCommand = commandTxt;
  //      //characterLastCommand.lastCommandResult = __calculationString;
  //      //characterLastCommand.lastCommandTotal = __calculationResult;

  //      let lastCommandValues: string = "";
  //      diceRolledData.forEach((diceRoll, index) => {
  //        let numberString = '';
  //        diceRoll.randomNumbersList.map((x, xIndex) => {
  //          if (xIndex == diceRoll.randomNumbersList.length - 1) {
  //            numberString += x.number;
  //          }
  //          else {
  //            numberString += x.number + ",";
  //          }
  //        })
  //        if (diceRoll.dice && diceRoll.diceIcon) {
  //          lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
  //            diceRoll.randomCount + diceRoll.dice
  //            + "=" + numberString.toString();
  //          //+ "=" + diceRoll.randomNumbersListAfter.toString();
  //        } else {
  //          lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
  //            + "=" + numberString.toString();
  //          //+ "=" + diceRoll.randomNumbersListAfter.toString();
  //        }

  //      });

  //      //  characterLastCommand.lastCommandValues = lastCommandValues; //


  //      /**/


  //      //alert(isFromTile);
  //      //if (!isFromTile)
  //      //////Save multiple command using AND keyword/////////

  //      if (characterMultipleCommands) {
  //        if (characterMultipleCommands.length > 1) {
  //          characterMultipleCommands.map((cmd, index) => {
  //            if (cmd.calculationArray) {
  //              if (cmd.calculationArray.length) {
  //                cmd.calculationArray.map((x) => {
  //                  if (x.isCustomDice && !x.isCustomNumeric) {
  //                    anyCommandIsCustomWithNonNumeric = true;
  //                  }
  //                })
  //              }
  //            }
  //            if (index > 0) {

  //              //      characterLastCommand.lastCommand += " AND " + cmd.calculationCommand;
  //              //      characterLastCommand.lastCommandResult += " AND " + cmd.calculationString;
  //              //characterLastCommand.lastCommandTotal += " AND " + __calculationResult;

  //              let lastCommandValues: string = "";
  //              let _diceRolledData = cmd.calculationArray;
  //              _diceRolledData.forEach((diceRoll, index) => {
  //                let numberString = '';
  //                diceRoll.randomNumbersList.map((x, xIndex) => {
  //                  if (xIndex == diceRoll.randomNumbersList.length - 1) {
  //                    numberString += x.number;
  //                  }
  //                  else {
  //                    numberString += x.number + ",";
  //                  }
  //                })

  //                if (diceRoll.dice && diceRoll.diceIcon) {
  //                  lastCommandValues += (index === 0 ? '' : diceRoll.sign) +
  //                    diceRoll.randomCount + diceRoll.dice
  //                    + "=" + numberString.toString();
  //                  //+ "=" + diceRoll.randomNumbersListAfter.toString();
  //                } else {
  //                  lastCommandValues += (index === 0 ? '' : diceRoll.sign) + diceRoll.randomCount
  //                    + "=" + numberString.toString();
  //                  //+ "=" + diceRoll.randomNumbersListAfter.toString();
  //                }

  //              });

  //              //       characterLastCommand.lastCommandValues += " AND " + lastCommandValues; //
  //            }
  //          })
  //        }
  //      }
  //      //////////////////////////////////////////////////////

  //      //if (!anyCommandIsCustomWithNonNumeric) {
  //      //this.updateLastCommand(characterLastCommand);
  //      // }

  //      //this.HideResult = false;

  //      //diceRolledData.forEach(diceRoll => {
  //      //  if (!diceRoll.static)
  //      //    diceRoll.randomNumbersList.forEach(num => {
  //      //      num.isAnimated = num.hideExplode ? true : false;
  //      //      num.isMax = diceRoll.diceNumber === num.number ? true : false;
  //      //      num.isMin = num.number === 1 ? true : false;
  //      //      if (num.hideExplode) {

  //      //        this.HideResult = true;
  //      //      }
  //      //    });
  //      //});
  //      //------Show rolling hidden Exploded dice and Then stop Rolling------//
  //      //if (this.HideResult) {
  //      //  this.cascadeDiceEffectCount = 0;
  //      //  this.cascadeDiceEffectCurrentCount = 0;
  //      //  this.cascadeDiceDisplayLength = 0;
  //      //  this.CascadeExplodeDice();
  //      //}
  //      //----END Show rolling hidden Exploded dice and Then stop Rolling----//


  //      calculationStringArray = DiceService.getCalculationStringArray(__calculationString, diceRolledData);
  //      characterMultipleCommands[0].calculationStringArray = calculationStringArray;
  //    } catch (err) { }

  //    if (!IsDiceRolledFromChat) {
  //      return characterMultipleCommands[0].calculationResult
  //    }
  //    else {
  //      return { characterCommandModel: characterCommandModel, characterMultipleCommands: characterMultipleCommands };
  //    }

  //    //color maximum & minimum
  //    //let _maxNum: number = 0;
  //    //let _minNum: number = 0;

  //    //this.diceRolledData.forEach(diceRoll => {
  //    //    let _maxN = Math.max.apply(Math, diceRoll.randomNumbersListAfter);
  //    //    let _minN = Math.min.apply(Math, diceRoll.randomNumbersListAfter);

  //    //    _maxNum = +_maxN > _maxNum ? +_maxN : _maxNum;
  //    //    _minNum = +_minN > _minNum ? (_minNum == 0 ? +_minN : _minNum) : +_minN;
  //    //});
  //    //if (!lastResultArray) {
  //    //  //if (this.isDicePublicRoll || this.isSkipDicePublicRollcheck) {
  //    //  if (this.isDicePublicRoll) {
  //    //    //this.isSkipDicePublicRollcheck = false;
  //    //    this.appService.updateChatWithDiceRoll({ characterCommandModel: this.characterCommandModel, characterMultipleCommands: characterMultipleCommands });
  //    //  }
  //    //}
  //    // this.loadingResult = true;


  //    //this.diceSection = false;
  //    //this.rollSection = true;


  //  }
  //}
}


