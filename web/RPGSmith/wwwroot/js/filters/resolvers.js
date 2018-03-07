(function(r) {
    'use strict';

    var module = angular.module('rpgsmith-filters');

    module.filter('counter', ['$sce', 'dataContext', function($sce, dataContext) {

        var filter = function(key) {

            var counter = (dataContext.character.counters || []).find(function(c) { return key === c.name });
            if (counter)
                return counter.displayValue;
            return '';
        }

        filter.$stateful = true;
        return filter;

    }]);

    module.filter('corestat', ['$sce', 'dataContext', function ($sce, dataContext) {

        var filter = function (key) {

            var counter = (dataContext.character.coreStats || []).find(function (c) { return key === c.code });
            if (counter)
                return counter.name;
            return '';
        }

        filter.$stateful = true;
        return filter;

    }]);

})();
