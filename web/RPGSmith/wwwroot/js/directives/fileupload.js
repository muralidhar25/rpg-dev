(function() {
    'use strict';

    var app = angular.module('rpgsmith-directives');


    app.directive('fileModel', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        debugger;
                        modelSetter(scope, element[0].files[0]);
                        debugger;
                        evt.target.value = "";
                        //evt.target.value = element[0].files[0];
                    });
                });
            }
        };
    }]);



})();