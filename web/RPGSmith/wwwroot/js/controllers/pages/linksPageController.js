(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('linksPageController', ['$scope', '$transition', '$q', '$timeout', 'dialogs', 'toaster', 'navService', 'tileService',
        function ($scope, $transition, $q, $timeout, dialogs, toaster, navService, tileService) {

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
                debugger;
                navService.updateBody(true, false);
                debugger;
                var characterId = $transition.params().characterId;
                var result = tileService.GetAllTileTypesRelatedCharacter(characterId);
                result.then(function (data) {
                    debugger;
                    if (data.data.StatusCode == 200) {
                        debugger;
                        $scope.AllTilesData = data.data.PayLoad;
                        $scope.links = data.data.PayLoad.Links;
                        $scope.data = {
                            notes: $scope.links
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