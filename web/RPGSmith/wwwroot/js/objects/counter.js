(function (r) {
    'use strict';

    var module = angular.module('rpgsmith-services');

    module.factory('counterFactory', ['dataContext', function (dataContext) {

        var Counter = function Counter() {
        };

        var formatValue = function(mask, value) {
            return format(mask, value);
        };

        var updateValue = function (counter, value) {

            if (counter.min != null && value < counter.min)
                value = counter.min;
            if (counter.max != null && value > counter.max)
                value = counter.max;

            if (value !== counter.value) {
                counter.value = value;
                return true;
            }

            return false;
        };

        Counter.prototype.onPropertyChanged = function (args) {
            if (args.propertyName === 'value' || args.propertyName === 'mask')
                this.displayValue = formatValue(this.mask, this.value);
        };

        Counter.prototype.increment = function () {
            return updateValue(this, this.value + this.step);
        };

        Counter.prototype.decrement = function () {
            return updateValue(this, this.value - this.step);
        };

        Counter.prototype.reset = function () {
            return updateValue(this, this.defaultValue || 0);
        };

        Counter.prototype.formatValue = function(mask, value) {
            return formatValue(mask, value);
        };

        Counter.typeInitializer = function (tile) {
            tile.displayValue = formatValue(tile.mask, tile.value);
        };

        var service = {
            Counter: Counter
        };

        return service;

    }]);

})();
