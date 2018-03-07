(function () {
    'use strict';

    var module = angular.module('rpgsmith-services');

    module.factory('authInterceptor', ['$rootScope', function ($rootScope) {
        var service = {};

        service.responseError = function (response) {
            if (response.status === 401)
                $rootScope.$broadcast('httpUnauthorized');
            return response;
        };

        return service;
    }]);

    module.factory('authService', ['$http', '$q', '$state', '$localStorage',
        function ($http, $q, $state, $localStorage) {


            var authentication =
                {
                authenticated: false
                };

            var resetAuthentication = function ()
            {
                delete $localStorage.authorizationData;
                authentication.authenticated = false;
                authentication.username = null;
            }
            var service = {};
            service.authentication = authentication;
            service.init = function ()
            {
                var data = $localStorage.authorizationData;
                if (data)
                {
                    authentication.authenticated = true;
                }
            }
            service.ExternalGoogle = function ()
            {
                var data =
                    {
                    provider: 'Google',
                    returnUrl: null
                };
                $http
                    .post('/api/Account/ExternalLogin', data)
                    .then(
                    function (result) {
                        window.location.href = result.data;
                    },
                    function (err, status) {
                        resetAuthentication();
                        deferred.reject(err);
                    });

            }
            service.GetServiceUrl = function ()
            {
                var LocationUrl = '';
                $http
                    .get('http://localhost:61492/api/Account/ExternalLogins?returnUrl=%2F&generateState=true')
                    .then(
                    function (result) {
                        LocationUrl = result.ExternalLoginViewModel.Url;
                        return LocationUrl;
                    });


                $http({
                    url: "http://localhost:61492/api/Account/ExternalLogins?returnUrl=%2F&generateState=true",
                    method: "GET",
                    contentType: "application/xml",
                }).then(function (response, status) {
                    var result123 = response;
                });


                $(document).ready(function () {

                    $.ajax({
                        type: "GET",
                        url: "http://localhost:61492/api/Account/ExternalLogins?returnUrl=%2F&generateState=true",
                        dataType: "xml",
                        success: function (xml) {
                            var data123 = xml;
                        },
                        error: function (err) {
                            alert("An error occurred while processing XML file.");
                        }
                    });
                });

            }

            service.logout = function () {
                return $http.post("/api/Account/LogOff");

            }

            service.login = function (username, password, remember)
            {
                var data = {
                    Email: username,
                    Password: password,
                    RememberMe: remember
                };

                var deferred = $q.defer();
                $http
                    .post('/api/Account/Login', data)
                    .then(
                    function (result) {

                        resetAuthentication();

                        $localStorage.authorizationData = {
                        };

                        authentication.authenticated = true;
                        deferred.resolve(result);
                    },
                    function (err, status) {
                        resetAuthentication();
                        deferred.reject(err);
                    });

                return deferred.promise;
            };


            service.Exlogin = function () {
                var deferred = $q.defer();
                resetAuthentication();
                $localStorage.authorizationData = {
                };
                authentication.authenticated = true;
            };


            service.register = function (username, email, password, confirmPassword, profileimage) {

                var data = {
                    username: username,
                    Email: email,
                    Password: password,
                    ConfirmPassword: confirmPassword,
                    ProfileImage: profileimage
                };

                var deferred = $q.defer();

                $http
                    .post('/api/Account/Register', data)
                    .then(
                    function (result) {

                        resetAuthentication();

                        $localStorage.authorizationData = {
                        };

                        authentication.authenticated = true;
                        deferred.resolve(result);
                    },
                    function (err, status) {
                        resetAuthentication();
                        deferred.reject(err);
                    });

                return deferred.promise;
            }
            service.updateprofile = function (profile) {
                return $http.post("/api/Profile/UpdateProfile", profile);
            }
            service.Resetpassword = function (resetpass) {
                return $http.post("/api/Profile/ResetPassword", resetpass);
            }
            service.ForgotPassword = function (email) {
                var data = {
					Email: email,
               };
                return $http.post("/api/Account/ForgotPassword", data);
            }
            

            return service;

        }]);

})();