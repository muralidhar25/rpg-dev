(function () {
    'use strict';

    var module = angular.module('rpgsmith-services');
    
    module.factory('dataContext', [function () {

        var service = {
            profile: null,
            character: null,
            layout: null
        };

        return service;

    }]);

})();