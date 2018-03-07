"use strict";

function dice_initialize(container) {
    debugger;
    //$t.remove($t.id('loading_text'));
    var modaPOPUP = $t.id('myModal');
    var canvas = $t.id('canvas');
    // canvas.style.width = window.innerWidth - 1 + 'px';
    // canvas.style.height = window.innerHeight - 1 + 'px';
    // canvas.style.width	 = modaPOPUP.innerWidth - 1 + 'px';
    // canvas.style.height = modaPOPUP.innerHeight - 1 + 'px';
    canvas.style.width = 570 - 1 + 'px';
    canvas.style.height = 500 - 1 + 'px';
    //var label = $t.id('label');
    var rollresult = $t.id('rollresult');
    var set = $t.id('set');
    var customset = $t.id('customset');
    //var selector_div = $t.id('selector_div');
    //var info_div = $t.id('info_div');
    var result_div = $t.id('sethelp');    //[Customr Code]  RavTeja.

    var lastrunresult = $t.id('lastrunresult');

    on_set_change();


    $t.dice.use_true_random = false;

    function on_set_change(ev) { set.style.width = set.value.length + 3 + 'ex'; }
    //$t.bind(set, 'keyup', on_set_change);
    //$t.bind(set, 'mousedown', function (ev) { ev.stopPropagation(); });
    //$t.bind(set, 'mouseup', function (ev) { ev.stopPropagation(); });
    //$t.bind(set, 'focus', function (ev) { $t.set(container, { class: '' }); });
    //$t.bind(set, 'blur', function (ev) { $t.set(container, { class: 'noselect' }); });

    //$t.bind($t.id('clear'), ['mouseup', 'touchend'], function (ev) {
    //    ev.stopPropagation();
    //    set.value = '0';
    //    on_set_change();

    //    //[Customer Code]  RavTeja.
    //    result_div.innerHTML = 'choose your dice set by clicking the dices or by direct input of notation,<br/>tap and drag on free space of screen or hit throw button to roll';
    //});

    var box = new $t.dice.dice_box(canvas, { w: 500, h: 300 });
    box.animate_selector = false;

    $t.bind(window, 'resize', function () {
        canvas.style.width = modaPOPUP.innerWidth - 1 + 'px';
        canvas.style.height = modaPOPUP.innerHeight - 1 + 'px';
        //canvas.style.width = window.innerWidth - 1 + 'px';
        //canvas.style.height = window.innerHeight - 1 + 'px';
        box.reinit(canvas, { w: 500, h: 300 });
    });

    function show_selector() {
        //info_div.style.display = 'none';
        //selector_div.style.display = 'block';
        box.draw_selector();
    }


    function before_roll(vectors, notation, callback) {
        debugger;
        //info_div.style.display = 'block';
        //selector_div.style.display = 'none';
        // do here rpc call or whatever to get your own result of throw.
        // then callback with array of your result, example:
        // callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
        callback();
    }

    function notation_getter() {
        set.value = diceselectcommandtrace();    //[Customr Code]  RavTeja.
        return $t.dice.parse_notation(set.value);
    }

    function after_roll(notation, result) {
        var res = result.join(' ');
        if (notation.constant) res += ' +' + notation.constant;
        if (result.length > 1) res += ' = ' +
            (result.reduce(function (s, a) { return s + a; }) + notation.constant);


        res = diceafterrolltrace(notation, result);

        debugger;

        rollresult.value = res;
        localStorage.setItem("rollresult", rollresult.value);
        //info_div.style.display = 'inline-block';
        lastrunresult.value = res;
        //result_div.innerHTML = res;    //[Customr Code]  RavTeja.
    }

    box.bind_mouse(container, notation_getter, before_roll, after_roll);

    //box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);



    //$t.bind(container, ['mouseup'], function (ev) {
    //    debugger;
    //    ev.stopPropagation();
    //    if (selector_div.style.display == 'none') {
    //        if (!box.rolling) show_selector();
    //        box.rolling = false;
    //        return;
    //    }
    //    var name = box.search_dice_by_mouse(ev);
    //    if (name != undefined) {      //[Customr Code]  RavTeja.
    //        customset.value = customset.value + ' + ' + name
    //    }
    //    if (name != undefined) {
    //        var notation = $t.dice.parse_notation(set.value);
    //        notation.set.push(name);
    //        //set.value = $t.dice.stringify_notation(notation);     //[Customr Code]  RavTeja.
    //        on_set_change();
    //    }
    //});

    var params = $t.get_url_params();
    if (params.notation) {
        set.value = params.notation;
    }
    if (params.roll) {
        $t.raise_event($t.id('throw'), 'mouseup');
    }
    else {
        show_selector();
    }


   // box.bind_customthrow(notation_getter, before_roll, after_roll);

    this.rolediceagain = function () {
        box.bind_customthrow(notation_getter, before_roll, after_roll);
    }
}
