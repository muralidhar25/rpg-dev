(function (r) {
    'use strict';

    GridStackUI.Utils.getNode = function (el) {
        return el.data('_gridstack_node');
    };

    GridStackUI.Utils.getNodeData = function (el) {
        return el.data('_item_data');
    };

    Math.clamp = function (num, min, max) {
        if (num <= min) return min;
        if (max <= num) return max;
        return num;
    };

    Math.randomInteger = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    r.obj2Styles = function(obj) {

        if (obj) {

            var str = '';

            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str += '; '
                    str += p;
                    str += ': ';
                    str += obj[p]
                }
            }

            if (str.length > 1)
                return str.substring(2);
        }

        return '';
    };

    r.styles2Obj = function(str) {

        var regex = /([\w-]*)\s*:\s*([^;]*)/g;
        var match, obj = {};

        while (match = regex.exec(str))
            obj[match[1]] = match[2].trim();

        return obj;
    };

    r.isNullOrWhiteSpace = function (v) {
        return v == null || (/^\s*$/).test(v);
    }

    r.tileTypes = {
        note: { id: 1, name: "Note" },
        counter: { id: 2, name: "Counter" },
        attribute: { id: 3, name: "Attribute" },
        command: { id: 3, name: "Command" },
        inventory: { id: 4, name: "Inventory" },
        equipment: { id: 5, name: "Equipment" }
    };

    //r.isUndefinedOrNull = function (val) {
    //    return angular.isUndefined(val) || val === null;
    //};

    r.isEmpty = function (value) {
        // The == is by design.
        return (value == null) || value.length === 0;
    };

    r.fillArray = function (src, dest, converter) {

        if (typeof converter !== 'function')
            converter = function (item) { return item; }

        if (dest) {
            dest.length = 0;
            if (src)
                src.forEach(function (item) { dest.push(converter(item)); });
        }
    };

})(window.rpgsmith = window.rpgsmith || {});