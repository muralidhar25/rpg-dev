(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('countersPageController', ['$scope', '$transition', '$q', '$timeout', 'dialogs', 'toaster', 'navService', 'tileService',
        function ($scope, $transition, $q, $timeout, dialogs, toaster, navService,tileService) {

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
                var characterId = $transition.params().characterId;
                var result = tileService.GetAllTileTypesRelatedCharacter(characterId);
                result.then(function (data) {
                    debugger;
                    if (data.data.StatusCode == 200) {
                        $scope.AllTilesData = data.data.PayLoad;
                        $scope.counters = data.data.PayLoad.Counters;
                        $scope.data = {
                            counters: $scope.counters
                        }
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                alert(data.data.ErrorMessage);
                            }
                        }
                    }

                })
               

            })();
        }
    ]);

})();