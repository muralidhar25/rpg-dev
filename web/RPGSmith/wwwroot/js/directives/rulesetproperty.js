(function () {
    'use strict';

    var app = angular.module('rpgsmith-directives');

    app.directive('rulesetproperty', [function ($compile) {
            return {
                restrict: 'E',
                templateUrl: '/views/shared/rulesetproperty.html',
                scope: {
                    info: '=' 
                }
        }
    }]);


})();

