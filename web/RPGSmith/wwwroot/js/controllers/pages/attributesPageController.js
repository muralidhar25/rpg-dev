(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('attributesPageController', ['$scope', '$q', '$timeout', '$transition', 'dialogs', 'toaster', 'navService', 'dataService',
        function ($scope, $q, $timeout, $transition, dialogs, toaster, navService, dataService) {
            
            $scope.data = null;

            $scope.menuHamburger = {
                opened: false,
                menus: navService.getCommonHamburger([]),
                menuClick: function (item) {
                    $scope.menuCharacter.opened = false;
                }
            };

            $scope.menuCharacter = {
                opened: false,
                menus: navService.getCommonCharacterNav([]),
                menuClick: function (item) {
                    $scope.menuCharacter.opened = false;
                }
            };

            navService.registerNav('hamburger', $scope.menuHamburger);
            navService.registerNav('character', $scope.menuCharacter);
            
            (function () {                
                navService.updateBody(true, false);

                $timeout(function () {                    
                    $scope.data = {
                        corestats: dataService.character.campaign.coreStats
                    };
                });

            })();
        }
    ]);

})();