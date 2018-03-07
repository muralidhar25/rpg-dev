(function () {
    'use strict';

    var app = angular.module('rpgsmith-directives');

    app.directive('pageslideMenu', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/shared/pageslide-menu.html',
            scope: {
                menuClick: '&?',
                menus: '='
            },
            link: function (scope, element, attrs, controller, ngModel) {
                debugger;
              
                scope.hasMenus = function (menu) {
                    return menu && angular.isArray(menu.menus);
                };

                scope.onItemClick = function (menu) {

                    if (menu.disabled)
                        return;

                    scope.menuClick()(menu);

                    if (typeof menu.action === 'function') {
                        menu.action(menu);
                    }
                };
            }
        }
    }]);


})();