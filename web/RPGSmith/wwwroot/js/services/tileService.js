(function () {
    'use strict';

    var app = angular.module('rpgsmith-services');

    app.factory('tileService', ['$http', '$rootScope', '$state', '$localStorage', 'authService',
        function ($http, $rootScope, $state, $localStorage, authService) {

            var navs = {};
            var service = {};
            var _controller = "/api/Tile";
            service.topNav = {};
            service.GetTileTypes = function () {
                return $http.get(_controller + "/GetTileTypes");
            }
            service.AddTile = function (NewTile) {
                return $http.post(_controller + "/Create", NewTile);
            }

            service.UpdateTile = function (UpdateTile) {
                return $http.post(_controller + "/Update", UpdateTile);
            }
            service.deleteTile = function (Tile) {
                //var TileID = { 'TileID': ID };
                return $http.post(_controller + "/DeleteTile", Tile);
            }
            service.GetAllTileTypesRelatedCharacter = function (ID) {
                var CharacterProfileID = { 'CharacterProfileID': ID };
                return $http.post(_controller + "/GetAllTileTypesRelatedCharacter", CharacterProfileID);
            }
            //service.InsertNewTab = function (TabViewModel) {
            //    return $http.post('/Tab/MarketExpenseTypeInsert', TabViewModel);
            //}

            return service;
        }]);

})();