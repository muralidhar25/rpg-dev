(function (r) {
    'use strict';

    var module = angular.module('rpgsmith-services');

    module.factory('characterCoreStatFactory', ['dataContext', function (dataContext) {

        var CoreStat = function CoreStat() {
        };
        
        CoreStat.prototype.onPropertyChanged = function (args) {
            //if (args.propertyName === 'value' || args.propertyName === 'mask')
            //    this.displayValue = formatValue(this.mask, this.value);
        };

        //CoreStat.prototype.formatValue = function(mask, value) {
        //    return formatValue(mask, value);
        //};

        CoreStat.typeInitializer = function (tile) {
            //tile.displayValue = formatValue(tile.mask, tile.value);
        };

        var service = {
            CoreStat: CoreStat
        };

        return service;

    }]);

})();
