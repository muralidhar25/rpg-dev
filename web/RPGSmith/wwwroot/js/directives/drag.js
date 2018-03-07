(function () {
    'use strict';
    
    var app = angular.module('rpgsmith-directives');

    app.directive('droppable', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            scope: {
                onDroppableDrop: '&',
                onDroppableOver: '&',
                onDroppableOut: '&'
            },
            link: function (scope, element, attrs, controller, ngModel) {
                element.droppable({
                    //accept: '*',
                    //greedy: true,
                    tolerance: 'pointer',
                    over: function (event, ui) {
                        scope.onDroppableOver({ event: event, ui: ui });
                    },
                    out: function (event, ui) {
                        scope.onDroppableOut({ event: event });
                    },
                    drop: function (event, ui) {
                        scope.onDroppableDrop({ event: event, ui: ui });
                    }
                });
            }
        };
    }]);

    app.directive('rpgsmithBody', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, controller, ngModel) {
                scope.$root.$on('rpgsmithSetBodyClass', function (event, data) {
                    if (data.remove)
                        element.removeClass(data.remove);
                    if (data.add)
                        element.addClass(data.add);
                });
            }
        }
    }]);

})();