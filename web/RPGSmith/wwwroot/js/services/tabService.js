(function () {
    'use strict';

    var app = angular.module('rpgsmith-services');

    app.factory('tabService', ['$http','$rootScope', '$state', '$localStorage', 'authService',
        function ($http,$rootScope, $state, $localStorage, authService) {

        var navs = {};
        var service = {};
        var _controller = "/api/Tab";
        service.topNav = {};

        service.GetTabs = function (LayoutId) {
            return $http.get(_controller + "/GetTabListByLayoutId/?LayoutId="+LayoutId);
        }

        service.AddTab = function (NewTab) {
            return $http.post(_controller + "/Create" , NewTab);
        }
        service.UpdateTab = function (tabmodel) {
            return $http.post(_controller + "/Update", tabmodel);
        }

        service.deleteTab = function (deleteTab) {
            //var TabID = { 'TabID': ID };
            return $http.post(_controller + "/DeleteTab", deleteTab);
        }
        //service.InsertNewTab = function (TabViewModel) {
        //    return $http.post('/Tab/MarketExpenseTypeInsert', TabViewModel);
        //}

        return service;
    }]);    

})();