(function () {
    'use strict';

    var app = angular.module('rpgsmith-services');

    app.factory('layoutService', ['$http','$rootScope', '$state', '$localStorage', 'authService',
        function ($http,$rootScope, $state, $localStorage, authService) {

        var navs = {};
        var service = {};
        //var _controller = "/Layout";
        var _controller = "/api/Layout";
        service.topNav = {};

        service.create = function (LayoutViewModel) {
            return $http.post(_controller + "/Create", LayoutViewModel);
        }
        service.update = function (LayoutViewModel) {
            return $http.post(_controller + "/Update", LayoutViewModel);
        }
        service.copyLayout = function (LayoutViewModel) {
            return $http.post(_controller + "/Copy", LayoutViewModel);
        }
        
        service.GetNewLayout = function () {
            return $http.get(_controller + "/GetNewLayout");
        }
        service.loadLayout = function (ID) {
            var LayoutId = { 'LayoutId': ID };
            return $http.post(_controller + "/GetLayouByLayoutId", LayoutId);
        }
        service.GetDice = function (characterId) {
            return $http.get(_controller + "/GetDiceList/?characterProfileId=" + characterId);
        }
        service.SaveDice = function (DiceModel) {
            return $http.post(_controller + "/SaveVirtualDice", DiceModel);
        }
        service.deleteLayout = function (deleteLayout) {
            //var LayoutId = { 'LayoutId': ID };
            return $http.post(_controller + "/DeleteLayout", deleteLayout);
        }
        service.GetDefaultDice = function(characterId) {
            return $http.get(_controller + "/GetDefaultDiceByCharacter/?CharacterProfileID=" + characterId);
        }
        service.GetCharacterLayouts = function (CharacterId) {
            return $http.get("/api/Layout/Get/?CharacterProfileId=" + CharacterId);
        }
        //service.InsertNewTab = function (TabViewModel) {
        //    return $http.post('/Tab/MarketExpenseTypeInsert', TabViewModel);
        //}

        return service;
    }]);    

})();