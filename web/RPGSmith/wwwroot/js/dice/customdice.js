"use strict";

var customarray = [];

var diceinitializer;

function dicenotationvalidator(commandStr) {
    debugger;
    var known_types = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
    var validationresult;
    var no = commandStr.split('@');
    var dr0 = /\s*(\d*)([a-z]+)(\d+)(\s*\+\s*(\d+)){0,1}\s*(\+|$)/gi;
    var dr1 = /(\b)*(\d+)(\b)*/gi;
    var ret = { set: [], constant: 0, result: [], error: false }, res;
    while (res = dr0.exec(no[0])) {
        var command = res[2];
        if (command != 'd') { ret.error = true; continue; }
        var count = parseInt(res[1]);
        if (res[1] == '') count = 1;
        var type = 'd' + res[3];
        if (known_types.indexOf(type) == -1) { ret.error = true; continue; }
        while (count--) ret.set.push(type);
        if (res[5]) ret.constant += parseInt(res[5]);
    }
    while (res = dr1.exec(no[1])) {
        ret.result.push(parseInt(res[2]));
    }

    if (ret == undefined || ret == null) {
        validationresult = false;
    }
    else {
        if (ret.set.length != 0) {
            validationresult = true;
        }

    }

    return validationresult;
}



function dicerollwithcommand(command) {

    debugger;

    //if (!dicenotationvalidator(command)) {
    //    alert("Invalid Command");
    //}

    $('#canvas').children().remove();
    $('#canvas').append('<canvas width="1365" height="345"></canvas>');

    $t.id('set').value = command


    var da = $t.id('diceareaforroll');

    //dice_initialize(da);   //mode=1 is the select mode.

    //var savedattackoptions = $t.id('savedattackoptions');
    //savedattackoptions.style.display = 'block';

    var roll = $t.id('diceRollTrigger');
    roll.style.display = 'inline-block';

    var addmod = $t.id('addmod');
    addmod.style.display = 'inline-block';

    var diceareaforselection = $t.id('diceareaforselection');
    diceareaforselection.style.display = 'none';

    var showdicerollresult = $t.id('showdicerollresult');
    showdicerollresult.style.display = 'none';

    var diceareaforroll = $t.id('diceareaforroll');
    diceareaforroll.style.display = 'block';

    var defaultDiceSelect = $t.id('defaultDiceSelect');
    defaultDiceSelect.style.display = 'none';

    if (diceinitializer == undefined || diceinitializer == null) {
        diceinitializer = new dice_initialize(da);
        diceinitializer.rolediceagain();
    }
    else {
        diceinitializer = new dice_initialize(da);
        diceinitializer.rolediceagain();
    }
    //box.start_throw(notation_getter,before_roll,after_roll);  // Need to check the code for the roll.

}

function diceselectcommandtrace_temp() {
    debugger;
    var localvar = "";
    customarray = [];
    var finalvar = "";
    var dicecommandaftertrace = [];
    var dicecommandaftertracestr = "";

    var dice = $("#customset").val();

    for (var i = 0; i < dice.length; i++) {
        if (dice[i] != "+" && dice[i] != "/" && dice[i] != "-" && dice[i] != "*") {
            localvar = localvar + dice[i];
            if (i == dice.length - 1) {
                customarray.push(localvar);
            }
        }
        else if (dice[i] == "+" || dice[i] == "/" || dice[i] == "-" && dice[i] != "*") {
            customarray.push(localvar);
            customarray.push(dice[i]);
            localvar = "";
        }
    }

    for (var j = 0; j < customarray.length; j++) {
        var dice1 = /\s*(\d*)([a-z]+)(\d+)(\s*\+\s*(\d+)){0,1}\s*(\+|$)/gi;
        var dice2 = /(\b)*(\d+)(\b)*/gi;

        if (dice1.test(customarray[j]) == true && dice2.test(customarray[j]) == true) {
            dicecommandaftertrace.push(customarray[j]);
            dicecommandaftertrace.push("+");
            dicecommandaftertracestr = dicecommandaftertracestr + customarray[j];
            dicecommandaftertracestr = dicecommandaftertracestr + "+";
        }
    }

    return dicecommandaftertracestr;

}

function diceselectcommandtrace() {
    debugger;
    var localvar = "";
    customarray = [];
    var customdicearray = [];
    var finalvar = "";
    var dicecommandaftertrace = [];
    var dicecommandaftertracestr = "";
    var known_types = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

    var customset = $t.id('customset');

    var customdiceset = customset.value;

    var paranthesisCommand = 1;

    var tempcustomdicearray = [];

    for (var i = 0; i < customdiceset.length; i++) {

        if (customdiceset[i] == "(") {
            paranthesisCommand = 2;
            continue;
        }

        if (customdiceset[i] == ")") {
            tempcustomdicearray.push(localvar);
            paranthesisCommand = 3;
        }

        if (paranthesisCommand == 1) {
            if (customdiceset[i] != "+" && customdiceset[i] != "/" && customdiceset[i] != "-" && customdiceset[i] != "*") {
                localvar = localvar + customdiceset[i];
                if (i == customdiceset.length - 1) {
                    customdicearray.push(localvar);
                }
            }
            else if (customdiceset[i] == "+" || customdiceset[i] == "/" || customdiceset[i] == "-" || customdiceset[i] == "*") {
                customdicearray.push(localvar);
                customdicearray.push(customdiceset[i]);
                localvar = "";
            }
        }
        else if (paranthesisCommand == 2) {
            if (customdiceset[i] != "+" && customdiceset[i] != "/" && customdiceset[i] != "-" && customdiceset[i] != "*") {
                localvar = localvar + customdiceset[i];
                if (i == customdiceset.length - 1) {
                    tempcustomdicearray.push(localvar);
                }
            }
            else if (customdiceset[i] == "+" || customdiceset[i] == "/" || customdiceset[i] == "-" || customdiceset[i] == "*") {
                tempcustomdicearray.push(localvar);
                tempcustomdicearray.push(customdiceset[i]);
                localvar = "";
            }
        }
        else if (paranthesisCommand == 3) {
            if (tempcustomdicearray.length > 1) {
                customdicearray.push("(");
                for (var j = 0; j < tempcustomdicearray.length; j++) {
                    customdicearray.push(tempcustomdicearray[j]);
                }
                customdicearray.push(")");
            }
            else {
                customdicearray.push("(" + tempcustomdicearray[0] + ")");
            }
            paranthesisCommand = 1;
        }
    }

    var currentselecteddiceadded = false;

    for (var j = 0; j < customdicearray.length; j++) {
        var customarraynotation = customdicearray[j].trim();
        var customarrayno = customarraynotation.split('@');
        var customarraydicecommand = /\s*(\d*)([a-z]+)(\d+)(\s*\+\s*(\d+)){0,1}\s*(\+|$)/gi;
        var customarraycount = 0;
        var customarraytype = "";
        var newcustomarrayvalue = "";

        var res = [];
        if (!customarrayno[0].includes(' ')) {
            res = customarraydicecommand.exec(customarrayno[0]);
        }

        var customarraynowithfunc = [];

        var iscommandvalid = true;

        var command = '';

        var commandtype = '';

        var customarraynowithfuncavail = false;

        if (res == null || res == "" || res == undefined) {
            customarraynowithfuncavail = false;
            customarraynowithfunc = customarrayno[0].split(' ');
            if (customarraynowithfunc.length == 2) {
                res = customarraydicecommand.exec(customarraynowithfunc[0]);
                if (customarraynowithfunc[1] == "RD" || customarraynowithfunc[1] == "RU") {
                    iscommandvalid = true;
                }
                else if (customarraynowithfunc[1].startsWith("KL") || customarraynowithfunc[1].startsWith("KH") || customarraynowithfunc[1].startsWith("DL") || customarraynowithfunc[1].startsWith("DH")) {
                    var commandcheck = customarraynowithfunc[1]
                    diceSpecialOperatorStr = commandcheck.trim();
                    diceSpecialOperatorCmd = diceSpecialOperatorStr.substring(0, 2);
                    diceSpecialOperatorValue = diceSpecialOperatorStr.charAt(2);
                    if (isNumeric(diceSpecialOperatorValue)) {
                        diceSpecialOperatorValue = parseInt(diceSpecialOperatorValue);
                        iscommandvalid = true;
                    }
                    else {
                        iscommandvalid = false;
                    }
                }
            }
        }

        if (res != null && res != undefined) {
            if (res.length > 0) {
                command = res[2];
                commandtype = res[2] + res[3];
            }
        }

        if (command == 'd' && known_types.indexOf(commandtype) > -1 && iscommandvalid == true) {
            if (res[1] == '') {
                customarraycount = 1;
            }
            else {
                customarraycount = parseInt(res[1]);
            }
            dicecommandaftertrace.push(customarraycount + command + res[3]);
        }

    }

    customarray = customdicearray;

    for (var j = 0; j < dicecommandaftertrace.length; j++) {
        dicecommandaftertracestr = dicecommandaftertracestr + dicecommandaftertrace[j];
        dicecommandaftertracestr = dicecommandaftertracestr + "+";
    }
    debugger;
    return dicecommandaftertracestr;

}

function diceresultafterroll(notation, result, totalresult) {

    var known_types = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

    for (i = 0; i < known_types.length; i++) {
        var diceNotationIndex = -1;
        var diceType = known_types[i]
        var diceResult = $t.id('showdicerollresult_' + diceType);

        var eachDiceResultSum = 0;

        for (j = 0; j < notation.set.length; j++) {
            if (diceType == notation.set[j]) {
                diceNotationIndex = j;
            }
            else {
                diceNotationIndex = -1;
            }
            if (diceNotationIndex > -1) {
                eachDiceResultSum = eachDiceResultSum + result[diceNotationIndex];
            }
        }

        if (diceResult.innerHTML != null && diceResult.innerHTML != undefined && diceResult.innerHTML != "") {
            diceResult.innerHTML = eachDiceResultSum;
        }

    }

    var diceSumResult = $t.id('showdicerollresult_Sum');
    diceSumResult.innerHTML = totalresult;

    var showdicerollResult = $t.id('canvas');
    showdicerollResult.style.display = 'none';

    var showdicerollResult = $t.id('showdicerollresult');
    showdicerollResult.style.display = 'block';

}




function diceafterrolltrace(notation, result) {
    debugger;

    var known_types = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
    var fresult = 0;
    var diceCurrentIndex = 0;
    var resultwithdiceroll = [];

    var dicerollresultbytype = {};

    customdicearray = customarray;

    if (result.length <= 0) {
        alert('error in result');
        return;
    }

    for (var i = 0; i < notation.set.length; i++) {
        var dicetype = notation.set[i];

        if (dicerollresultbytype[dicetype] == undefined) {
            dicerollresultbytype[dicetype] = [];
        }

        dicerollresultbytype[dicetype].push(result[i]);
    }


    for (var j = 0; j < customdicearray.length; j++) {

        var customarraynotation = customdicearray[j].trim();
        var customarrayno = customarraynotation.split('@');
        var customarraydicecommand = /\s*(\d*)([a-z]+)(\d+)(\s*\+\s*(\d+)){0,1}\s*(\+|$)/gi;
        var customarraycount = 0;
        var customarraytype = "";
        var newcustomarrayvalue = "";

        var diceSpecialOperatorStr = "";
        var diceSpecialOperatorCmd = "";
        var diceSpecialOperatorValue = 0;

        var res = [];
        if (!customarrayno[0].includes(' ')) {
            res = customarraydicecommand.exec(customarrayno[0]);
        }

        var customarraynowithfunc = [];

        var iscommandvalid = true;

        var command = '';

        var commandtype = '';

        if (res == null || res == "" || res == undefined) {
            customarraynowithfuncavail = false;
            customarraynowithfunc = customarrayno[0].split(' ');
            if (customarraynowithfunc.length == 2) {
                res = customarraydicecommand.exec(customarraynowithfunc[0]);
                //command = res[2];
                if (customarraynowithfunc[1] == "RD" || customarraynowithfunc[1] == "RU") {
                    iscommandvalid = true;
                }
                else if (customarraynowithfunc[1].startsWith("KL") || customarraynowithfunc[1].startsWith("KH") || customarraynowithfunc[1].startsWith("DL") || customarraynowithfunc[1].startsWith("DH")) {
                    var commandcheck = customarraynowithfunc[1]
                    diceSpecialOperatorStr = commandcheck.trim();
                    diceSpecialOperatorCmd = diceSpecialOperatorStr.substring(0, 2);
                    diceSpecialOperatorValue = diceSpecialOperatorStr.charAt(2);
                    if (isNumeric(diceSpecialOperatorValue)) {
                        diceSpecialOperatorValue = parseInt(diceSpecialOperatorValue);
                        iscommandvalid = true;
                    }
                    else {
                        iscommandvalid = false;
                    }
                }
            }
        }

        if (res != null && res != undefined) {
            if (res.length > 0) {
                command = res[2];
                commandtype = res[2] + res[3];
            }
        }

        if (command == 'd' && known_types.indexOf(commandtype) > -1 && iscommandvalid == true) {

            var dicefinalresultwithcommand = 0;

            if (res[1] == '') {
                customarraycount = 1;
            }
            else {
                customarraycount = parseInt(res[1]);
            }
            customarraytype = 'd' + res[3];

            var diceresultarraywithcommand = dicerollresultbytype[customarraytype]

            if (customarraynowithfunc.length == 0) {
                for (var k = 0; k < customarraycount; k++) {
                    dicefinalresultwithcommand = dicefinalresultwithcommand + dicerollresultbytype[customarraytype].pop();
                }
            }
            else if (customarraynowithfunc.length == 2) {
                if (customarraynowithfunc[1].includes("KL") || customarraynowithfunc[1].includes("KH") || customarraynowithfunc[1].includes("DL") || customarraynowithfunc[1].includes("DH")) {
                    var tempdicerollresultbytype = [];
                    for (var k = 0; k < customarraycount; k++) {
                        tempdicerollresultbytype.push(dicerollresultbytype[customarraytype].pop());
                    }
                    tempdicerollresultbytype.sort();
                    for (var k = 0; k < customarraycount; k++) {
                        debugger;
                        if (diceSpecialOperatorCmd == "KL") {
                            if (k < diceSpecialOperatorValue) {
                                dicefinalresultwithcommand = dicefinalresultwithcommand + tempdicerollresultbytype.pop();
                            }
                            else {
                                tempdicerollresultbytype.pop();
                            }
                        }
                        else if (diceSpecialOperatorCmd == "KH") {
                            if (k >= tempdicerollresultbytype.length - diceSpecialOperatorValue) {
                                dicefinalresultwithcommand = dicefinalresultwithcommand + tempdicerollresultbytype.pop();
                            }
                            else {
                                tempdicerollresultbytype.pop();
                            }
                        }
                        else if (diceSpecialOperatorCmd == "DL") {
                            if (k >= tempdicerollresultbytype.length - diceSpecialOperatorValue) {
                                tempdicerollresultbytype.pop();
                            }
                            else {
                                dicefinalresultwithcommand = dicefinalresultwithcommand + tempdicerollresultbytype.pop();
                            }
                        }
                        else if (diceSpecialOperatorCmd == "DH") {
                            if (k >= tempdicerollresultbytype.length - diceSpecialOperatorValue) {
                                dicefinalresultwithcommand = dicefinalresultwithcommand + tempdicerollresultbytype.pop();
                            }
                            else {
                                tempdicerollresultbytype.pop();
                            }
                        }
                    }
                }
                else if (customarraynowithfunc[1] == "RD" || customarraynowithfunc[1] == "RU") {
                    for (var k = 0; k < customarraycount; k++) {
                        dicefinalresultwithcommand = dicefinalresultwithcommand + dicerollresultbytype[customarraytype].pop();
                    }
                    dicefinalresultwithcommand = dicefinalresultwithcommand + ' ' + customarraynowithfunc[1];
                }
            }

            resultwithdiceroll.push(dicefinalresultwithcommand);
        }
        else {
            resultwithdiceroll.push(customarraynotation);
        }

    }


   
    debugger;
    var resultAfterDiceRoll = calculateDiceCommandResult(resultwithdiceroll);
    //localStorage.setItem("resultAfterDiceRoll", resultAfterDiceRoll);

    diceresultafterroll(notation, result, resultAfterDiceRoll);

    return resultAfterDiceRoll;
}

function calculateDiceCommandResult(resultwithdiceroll) {

    var fresult = 0;

    var tempresultwithdicerollwithparanthesis = [];

    var tempresultwithdicerollinsideparanthesis = [];

    var paranthesisCommand = 1;

    var paranthesisStartIndex = -1;

    var tempresultaftercalculation = 0;

    var tempresultaftercalculationinsideparanthesis = 0;

    for (var i = 0; i < resultwithdiceroll.length; i++) {
        if (resultwithdiceroll[i] == "(") {
            paranthesisCommand = 2;
            paranthesisStartIndex = i;
            continue;
        }
        else if (resultwithdiceroll[i] == ")" && i == resultwithdiceroll.length - 1) {
            tempresultaftercalculationinsideparanthesis = calculateCommandResult(tempresultwithdicerollinsideparanthesis);
            tempresultwithdicerollwithparanthesis.push(tempresultaftercalculationinsideparanthesis);
            paranthesisCommand = 1;
        }
        else if (resultwithdiceroll[i] == ")") {
            paranthesisCommand = 3;
            paranthesisStartIndex = i;
        }
        else {
            if (paranthesisCommand == 1) {
                tempresultwithdicerollwithparanthesis.push(resultwithdiceroll[i]);
            }
            else if (paranthesisCommand == 2) {
                tempresultwithdicerollinsideparanthesis.push(resultwithdiceroll[i]);
            }
            else if (paranthesisCommand == 3) {
                tempresultaftercalculationinsideparanthesis = calculateCommandResult(tempresultwithdicerollinsideparanthesis);
                tempresultwithdicerollwithparanthesis.push(tempresultaftercalculationinsideparanthesis);
                paranthesisCommand = 1;
            }
        }
    }

    fresult = calculateCommandResult(tempresultwithdicerollwithparanthesis);

    return fresult;
}

function calculateCommandResult(resultwithdiceroll) {
    debugger;

    var resultwithdicerollAfterMultiply = [];
    var operand1 = "";
    var operand2 = "";
    var operator = "";

    var fresult = 0;

    if (resultwithdiceroll.length == 1) {
        fresult = resultwithdiceroll[0];
    }
    else {
        //Caculating the array for multipliction.
        var resultAfterEachOperator = [];
        var resultBeforeEachOperator = resultwithdiceroll;
        for (var operatorCount = 1; operatorCount <= 4; operatorCount++) {

            operand1 = "";
            operator = "";
            operand2 = "";

            for (var i = 0; i < resultBeforeEachOperator.length; i++) {

                var resultBeforeEachOperatorAsChar = resultBeforeEachOperator[i];

                if (!isNumeric(resultBeforeEachOperatorAsChar)) {
                    resultBeforeEachOperatorAsChar = resultBeforeEachOperatorAsChar.trim();
                }

                if (isNumeric(resultBeforeEachOperatorAsChar)) {
                    resultBeforeEachOperatorAsChar = parseInt(resultBeforeEachOperatorAsChar);
                }

                if (operand1 == "" && resultBeforeEachOperatorAsChar != '+' && resultBeforeEachOperatorAsChar != '-' && resultBeforeEachOperatorAsChar != '*' && resultBeforeEachOperatorAsChar != '/') {
                    operand1 = resultBeforeEachOperatorAsChar;
                    continue;
                }
                else if (operator == "" && resultBeforeEachOperatorAsChar.length == 1) {
                    operator = resultBeforeEachOperatorAsChar;
                    continue;
                }
                else if (operand2 == "") {
                    operand2 = resultBeforeEachOperatorAsChar;
                }

                if (operator != "" && operand1 != "" && operand2 != "") {
                    if (operator == "*" && operatorCount == 1) {
                        var tempresult = operand1 * operand2;
                        resultAfterEachOperator.pop();
                        resultAfterEachOperator.push(tempresult);
                    }
                    else if (operator == "/" && operatorCount == 2) {
                        var operand2Array = operand2.split(' ');
                        var operand2Num = 0;
                        var operand2Func = null;
                        if (operand2Array.length > 1) {
                            operand2Num = operand2Array[0];
                            operand2Func = operand2Array[1];
                        }
                        else {
                            operand2Num = operand2Array[0];
                        }
                        var tempresult = operand1 / operand2Num;
                        if (operand2Func == "RD") {
                            resultAfterEachOperator.pop();
                            resultAfterEachOperator.push(Math.floor(tempresult));
                        }
                        else if (operand2Func == "RU") {
                            resultAfterEachOperator.pop();
                            resultAfterEachOperator.push(Math.ceil(tempresult));
                        }
                        else {
                            resultAfterEachOperator.push(tempresult);
                            operand1 = tempresult;

                        }
                    }
                    else if (operator == "-" && operatorCount == 3) {
                        var tempresult = operand1 - operand2;
                        resultAfterEachOperator.pop();
                        resultAfterEachOperator.push(tempresult);
                        operand1 = tempresult;

                    }
                    else if (operator == "+" && operatorCount == 4) {
                        var tempresult = 0;
                        if (isNumeric(operand1) && isNumeric(operand2)) {
                            tempresult = operand1 + operand2;
                        }
                        else {
                            tempresult = operand1 + operand2;
                        }
                        resultAfterEachOperator.pop();
                        resultAfterEachOperator.push(tempresult);
                        operand1 = tempresult;
                    }
                    else {
                        if (resultAfterEachOperator.length > 0) {
                            resultAfterEachOperator.push(operator);
                            resultAfterEachOperator.push(operand2);
                        }
                        else {
                            resultAfterEachOperator.push(operand1);
                            resultAfterEachOperator.push(operator);
                            resultAfterEachOperator.push(operand2);
                        }
                        operand1 = operand2;
                    }
                    operator = "";
                    operand2 = "";
                }
            }
            resultBeforeEachOperator = resultAfterEachOperator;
            resultAfterEachOperator = [];
            if (resultBeforeEachOperator.length == 1) {
                break;
            }
        }
        if (resultBeforeEachOperator.length == 1) {
            fresult = resultBeforeEachOperator[0];
        }
    }

    return fresult;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//This function is used to select the dice command and also roll the dice.
function dicerollwithoutcommand() {

    debugger;

    var defaultDiceSelect = $t.id('defaultDiceSelect');
    defaultDiceSelect.style.display = 'none';

    var roll = $t.id('diceRollTrigger');
    roll.style.display = 'block';

    var addmod = $t.id('addmod');
    addmod.style.display = 'block';

}

function DiceCommandRoll() {
    debugger;
    $('#canvas').children().remove();
    $('#canvas').append('<canvas width="1365" height="345"></canvas>');

    var showdicerollResult = $t.id('canvas');
    showdicerollResult.style.display = 'block';

    var diceareaforselection = $t.id('diceareaforselection');
    diceareaforselection.style.display = 'none';

    var showdicerollresult = $t.id('showdicerollresult');
    showdicerollresult.style.display = 'none';

    var defaultDiceSelect = $t.id('defaultDiceSelect');
    defaultDiceSelect.style.display = 'none';

    var diceareaforroll = $t.id('diceareaforroll');
    diceareaforroll.style.display = 'block';

    var savedattackoptions = $t.id('savedattackoptions');
    savedattackoptions.style.display = 'block';

    var addmod = $t.id('addmod');
    addmod.style.display = 'block';

    var lastDiceRollResult = $t.id('lastDiceRollResult');
    lastDiceRollResult.style.display = 'block';

    var customset = $t.id('customset');

    var customsetatroll = $t.id('customsetatroll');
    customsetatroll.value = customset.value;

    var da = $t.id('diceareaforroll');
   
    diceinitializer = new dice_initialize(da);
    diceinitializer.rolediceagain();
}

//This function is used to clear the select dice command.
function diceCommandClear() {
    debugger;
    var customset = $t.id('customset');
    customset.value = "";
}

//This function is used to select the dice command only
function diceselectcommand() {
    debugger;

    var selectedCommand = "";

    //Here hide the dice roll screen.

    var savedattackoptions = $t.id('savedattackoptions');
    savedattackoptions.style.display = 'none';

    var addmod = $t.id('addmod');
    addmod.style.display = 'none';

    var diceRollTrigger = $t.id('diceRollTrigger');
    diceRollTrigger.style.display = 'none';

    var dicesavecommand = $t.id('dicesavecommand');
    dicesavecommand.style.display = 'none';

    var lastDiceRollResult = $t.id('lastDiceRollResult');
    lastDiceRollResult.style.display = 'none';

    var defaultDiceSelect = $t.id('defaultDiceSelect');
    defaultDiceSelect.style.display = 'block';

    return selectedCommand;

}

function parsecustomdice_notation(notation) {
    debugger;
    var known_types = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

    var no = notation.split('@');
    var dr0 = /\s*(\d*)([a-z]+)(\d+)(\s*\+\s*(\d+)){0,1}\s*(\+|$)/gi;
    var dr1 = /(\b)*(\d+)(\b)*/gi;
    var ret = { set: [], constant: 0, result: [], error: false }, res;
    while (res = dr0.exec(no[0])) {
        var command = res[2];
        if (command != 'd') { ret.error = true; continue; }
        var count = parseInt(res[1]);
        if (res[1] == '') count = 1;
        var type = 'd' + res[3];
        if (known_types.indexOf(type) == -1) { ret.error = true; continue; }
        while (count--) ret.set.push(type);
        if (res[5]) ret.constant += parseInt(res[5]);
    }
    while (res = dr1.exec(no[1])) {
        ret.result.push(parseInt(res[2]));
    }
    return ret;
}

//Used to get the dice command in select mode.
function dicecommandsearch(dicename) {
    debugger;
    if (dicename == undefined) {
        return;
    }

    var localvar = "";

    var dicecommandaftertracestr = "";

    var customset = $t.id('customset');

    var customdiceset = customset.value;

    var customdicearray = [];

    var currentselecteddicenotation = dicename;
    var currentselecteddiceno = currentselecteddicenotation.split('@');
    var dicecommandexpression = /\s*(\d*)([a-z]+)(\d+)(\s*\+\s*(\d+)){0,1}\s*(\+|$)/gi;
    var dicecommandsplitresult = dicecommandexpression.exec(currentselecteddiceno[0]);
    var currentselecteddicecommand = dicecommandsplitresult[2];
    var currentselecteddicecount = 0;
    var currentselecteddicetype = "";

    if (currentselecteddicecommand == 'd') {
        if (dicecommandsplitresult[1] == '') {
            currentselecteddicecount = 1;
        }
        else {
            currentselecteddicecount = parseInt(dicecommandsplitresult[1]);
        }
        currentselecteddicetype = 'd' + dicecommandsplitresult[3];
    }

    for (var i = 0; i < customdiceset.length; i++) {
        if (customdiceset[i] != "+" && customdiceset[i] != "/" && customdiceset[i] != "-" && customdiceset[i] != "*") {
            localvar = localvar + customdiceset[i];
            if (i == customdiceset.length - 1) {
                customdicearray.push(localvar);
            }
        }
        else if (customdiceset[i] == "+" || customdiceset[i] == "/" || customdiceset[i] == "-" || customdiceset[i] != "*") {
            customdicearray.push(localvar);
            customdicearray.push(customdiceset[i]);
            localvar = "";
        }
    }

    var currentselecteddiceadded = false;

    for (var j = 0; j < customdicearray.length; j++) {
        var customarraynotation = customdicearray[j].trim();
        var customarrayno = customarraynotation.split('@');
        var customarraydicecommand = /\s*(\d*)([a-z]+)(\d+)(\s*\+\s*(\d+)){0,1}\s*(\+|$)/gi;
        var customarraycount = 0;
        var customarraytype = "";
        var newcustomarrayvalue = "";

        var res = [];
        if (!customarrayno[0].includes(' ')) {
            res = customarraydicecommand.exec(customarrayno[0]);
        }

        var customarraynowithfunc = [];

        var customarraynowithfuncavail = false;

        if (res == null || res == "" || res == undefined) {
            customarraynowithfunc = customarrayno[0].split(' ');
            if (customarraynowithfunc.length == 2) {
                res = customarraydicecommand.exec(customarraynowithfunc[0]);
                customarraynowithfuncavail = true;
            }
            else {
                continue;
            }
        }

        var command = res[2];
        if (command == 'd') {
            if (res[1] == '') {
                customarraycount = 1;
            }
            else {
                customarraycount = parseInt(res[1]);
            }
            customarraytype = 'd' + res[3];
        }

        if (customarraytype == currentselecteddicetype) {

            customarraycount = customarraycount + 1;
            newcustomarrayvalue = customarraycount + customarraytype;
            if (customarraynowithfuncavail == true) {
                customdicearray[j] = newcustomarrayvalue + ' ' + customarraynowithfunc[1];
            }
            else {
                customdicearray[j] = newcustomarrayvalue
            }

            currentselecteddiceadded = true;
        }
    }

    if (currentselecteddiceadded == false) {
        if (customdicearray.length > 0) {
            customdicearray.push('+');
            customdicearray.push(dicename);
        }
        else {
            customdicearray.push(dicename);
        }
    }

    if (customdicearray.length > 0) {
        for (var j = 0; j < customdicearray.length; j++) {
            dicecommandaftertracestr = dicecommandaftertracestr.trim() + ' ' + customdicearray[j].trim();
        }
    }

    customset.value = dicecommandaftertracestr.trim();

}

function stringifycustomdice_notation(nn) {
    var dict = {}, notation = '';
    for (var i in nn.set)
        if (!dict[nn.set[i]]) dict[nn.set[i]] = 1; else ++dict[nn.set[i]];
    for (var i in dict) {
        if (notation.length) notation += ' + ';
        notation += (dict[i] > 1 ? dict[i] : '') + i;
    }
    if (nn.constant) notation += ' + ' + nn.constant;
    return notation;
}

function customrolediceagain() {
    debugger;

    var showdicerollResult = $t.id('canvas');
    showdicerollResult.style.display = 'block';

    var showdicerollResult = $t.id('showdicerollresult');
    showdicerollResult.style.display = 'none';

    diceinitializer.rolediceagain();
}

function dicerollcomplete() {
    debugger;
    var diceareaforroll = $t.id('diceareaforroll');
    diceareaforroll.style.display = 'none';
    var diceareaforselection = $t.id('diceareaforselection');
    diceareaforselection.style.display = 'block';
}