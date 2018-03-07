(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('loginController', ['$scope', '$window', '$log', '$state', 'authService', 'navService', 'previousState', '$rootScope', 'toaster', 'dialogs', 'rulesetDataShareService', '$localStorage',
        function ($scope, $window, $log, $state, authService, navService, previousState, $rootScope, toaster, dialogs, rulesetDataShareService, $localStorage) {

            $scope.profileimagesrc = "http://www.advacto.com/images/user.jpg";

            $scope.mode = 1;

			$scope.registersuccess = false;
			$scope.useremail = "";
			$scope.name = "";
			angular.element(document).ready(function () {
				angular.element(window).keydown(function () {
					if (event.keyCode == 13) {
						event.preventDefault();
						return false;
					}
				});
			});
            var LoginData = rulesetDataShareService.getloginData();
            if (!authService.authentication.authenticated) {
				debugger;
				
                $scope.data = {};
                if (LoginData.rememberMe == true) {
                    $scope.data.username = LoginData.username;
                    $scope.data.password = LoginData.password;
                    $scope.data.rememberMe = LoginData.rememberMe;
                }
                var LocalStorageLoginData = JSON.parse(localStorage.getItem("LoginData"));
                if (LocalStorageLoginData != null) {
                    if (LocalStorageLoginData.rememberMe) {
                        $scope.data.username = LocalStorageLoginData.username;
                        $scope.data.password = LocalStorageLoginData.password;
                        $scope.data.rememberMe = LocalStorageLoginData.rememberMe;
                    }
                    else {
                        localStorage.setItem("LoginData", JSON.stringify(LoginData));
                        $scope.data.username == "";
                        $scope.data.password == "";
                    }
                }
            }
            else {
                var LocalStorageLoginData = JSON.parse(localStorage.getItem("LoginData"));
                if (LocalStorageLoginData != null) {
                    $scope.data = {};
                    if (LocalStorageLoginData.rememberMe) {
                        $scope.data.username = LocalStorageLoginData.username;
                        $scope.data.password = LocalStorageLoginData.password;
                        $scope.data.rememberMe = LocalStorageLoginData.rememberMe;
                    }
                    else {
                        localStorage.setItem("LoginData", JSON.stringify(LoginData));
                        $scope.data.username == "";
                        $scope.data.password == "";
                    }
                }
			}

            $scope.passwordKeyPress = function ($event) {
                if ($scope.mode === 1 && $event.which === 13)
                    $scope.action();
            };

            $scope.rememberKeyPress = function ($event) {
                $scope.data.rememberMe = !$scope.data.rememberMe;
            };

			$scope.showTerms = function () {
				var newCharacterData = {
					id: 0,
					name: "",
					file: null,
					RulesetID: 0
				}
				var dlg = dialogs.create('/views/dialogs/termsAndServices.html', 'dialogAddNewCharacter',
					{ mode: 1, characterData: newCharacterData  }
				);

				dlg.result.then(function (res) {
					if (res != 'cancel') {
						
						//toaster.pop('success', 'Character Created Successfully');
					}
				});
			};

            $scope.setMode = function (mode) {
                $scope.mode = mode;
            };

            $scope.profileImageUpload = function (input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        $('#profileImage')
                            .attr('src', e.target.result)
                            .width(120)
                            .height(120);
                        $scope.data.profileimage = e.target.result;
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            }

            $scope.gotoLoginPage = function () {

                navService.gotoLogin(true);
            }
            $scope.Cancel = function () {
                $scope.mode = 1;
            }
            $scope.isUserRegistered = function (Email, Id, accessToken) {
                $.ajax({
                    url: 'api/Account/GoogleLogin',
                    method: 'GET',
                    data: {
                        Email: Email,
                        AccesKey: Id,
                        AccountType: 'Google'
                    },
                    success: function (data) {
                        if (data.StatusCode == 200) {
                            $scope.logindata = data.PayLoad;
                            authService.Exlogin();
                            $localStorage.firstLoginController = $scope.logindata; 
                            navService.gotoCharacters(true);
                        }
                        else {
                            if (data.StatusCode == 400)
                            {
                                window.location.href = "/views/home/login.html";
                            }
                        }
                    },
                    error: function (request, status, error) {
                        alert(request.responseText);
                    }
                });
            }

            $scope.isFBUserRegistered = function (credentials) {
                $.ajax({
                    url: "api/account/facebooklogin",
                    type: "POST",
                    data: credentials,
                    success: function (data) {
                        if (data.StatusCode == 200) {
                            $rootScope.logindata = data.PayLoad;
                            authService.Exlogin();
                            navService.gotoCharacters(true);
                        }
                        else {
                            if (data.StatusCode == 400) {
                                window.location.href = "/views/home/login.html";
                            }
                        }
                 
                    },
                    error: function (request, status, error) {
                        console.log(request.responseText);
                    }
                });
            }

           

            $scope.action = function () {
				$("#loading").css("display", "block");
				switch ($scope.mode) {
                    case 1:
						if ( (!$scope.data.email || $scope.data.email == "") && $scope.data.password == "") {
                            toaster.pop('error', "Please enter Email And Password");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        else if (($scope.data.email != "") && ($scope.data.password == "" || $scope.data.password == null)) {
							toaster.pop('error', "Please enter Email And Password");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        else if (($scope.data.email == "" || $scope.data.email == null) && ($scope.data.password != "")) {
                            toaster.pop('error', "Please enter Email");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        authService
                            .login($scope.data.email, $scope.data.password, $scope.data.rememberMe)
                            .then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.logindata = data.data.PayLoad;
                                    $scope.logindata.rememberMe = $scope.data.rememberMe;
                                    navService.gotoCharacters(true);
                                    $localStorage.firstLoginController = $scope.logindata; 
                                    rulesetDataShareService.setloginData($scope.data);
                                    localStorage.setItem("LoginData", JSON.stringify($scope.data));
                                    //rulesetDataShareService.setImageandName($scope.logindata);
                                }
                                else {
                                    if (data.data.StatusCode == 400) {
                                        if (data.data.PayLoad == "Invalid Email /password") {
                                            toaster.pop('error', data.data.PayLoad);
                                            $("#loading").fadeOut("slow");
                                        }
                                        else
                                        {
                                            toaster.pop('error', "Please Enter valid UserId and password");
                                            $("#loading").fadeOut("slow");
                                        }
                                    }
                                }
                            })
                            .catch(function () {
                                alert('TODO: login failed');
                            });
                        break;
                    case 2:
                        if (($scope.data.username == null || $scope.data.username == "") && ($scope.data.email == null || $scope.data.email == "" || $scope.data.email == undefined) && ($scope.data.password == null || $scope.data.password == "") && ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "")) {
                            toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        if (($scope.data.username == null || $scope.data.username == "") && ($scope.data.email == null || $scope.data.email == "") && ($scope.data.password != null || $scope.data.password != "") && ($scope.data.confirmPassword != null || $scope.data.confirmPassword != "")) {
                            if ($scope.data.email == undefined) {

                            }
                            else {
                                toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                                $("#loading").fadeOut("slow");
                                break;
                            }

                        }
                        if (($scope.data.username == null || $scope.data.username == "") && ($scope.data.email != null || $scope.data.email != "" || $scope.data.email != undefined) && ($scope.data.password == null || $scope.data.password == "") && ($scope.data.confirmPassword != null || $scope.data.confirmPassword != "")) {
                            toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        if (($scope.data.username == null || $scope.data.username == "") && ($scope.data.email != null || $scope.data.email != "" || $scope.data.email != undefined) && ($scope.data.password != null || $scope.data.password != "") && ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "")) {
                            toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        if (($scope.data.username != null || $scope.data.username != "") && ($scope.data.email == null || $scope.data.email == "") && ($scope.data.password == null || $scope.data.password == "") && ($scope.data.confirmPassword != null || $scope.data.confirmPassword != "")) {
                            if ($scope.data.email == undefined) {

                            }
                            else {
                                toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                                $("#loading").fadeOut("slow");
                                break;
                            }
                        }
                        if (($scope.data.username != null || $scope.data.username != "") && ($scope.data.email == null || $scope.data.email == "") && ($scope.data.password != null || $scope.data.password != "") && ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "")) {
                            if ($scope.data.email == undefined) {

                            }
                            else {
                                toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                                $("#loading").fadeOut("slow");
                                break;
                            }
                        }
                        if (($scope.data.username != null || $scope.data.username != "") && ($scope.data.email != null || $scope.data.email != "" || $scope.data.email != undefined) && ($scope.data.password == null || $scope.data.password == "") && ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "")) {
                            toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        if (($scope.data.username == null || $scope.data.username == "") && ($scope.data.email == null || $scope.data.email == "") && ($scope.data.password == null || $scope.data.password == "") && ($scope.data.confirmPassword != null || $scope.data.confirmPassword != "")) {
                            if ($scope.data.email == undefined) {

                            }
                            else {
                                toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                                $("#loading").fadeOut("slow");
                                break;
                            }
                        }
                        if (($scope.data.username == null || $scope.data.username == "") && ($scope.data.email != null || $scope.data.email != "" || $scope.data.email != undefined) && ($scope.data.password == null || $scope.data.password == "") && ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "")) {
                            toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        if (($scope.data.username == null || $scope.data.username == "") && ($scope.data.email == null || $scope.data.email == "") && ($scope.data.password != null || $scope.data.password != "") && ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "")) {
                            if ($scope.data.email == undefined) {

                            }
                            else {
                                toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                                $("#loading").fadeOut("slow");
                                break;
                            }
                        }
                        if (($scope.data.username == null || $scope.data.username == "") && ($scope.data.email != null || $scope.data.email != "" || $scope.data.email != undefined) && ($scope.data.password == null || $scope.data.password == "") && ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "")) {
                            toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        if (($scope.data.username != null || $scope.data.username != "") && ($scope.data.email == null || $scope.data.email == "") && ($scope.data.password == null || $scope.data.password == "") && ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "")) {
                            if ($scope.data.email == undefined) {

                            }
                            else {
                                toaster.pop('error', "Please Fill All (*) Fields in Register Page");
                                $("#loading").fadeOut("slow");
                                break;
                            }
                        }
                        if ($scope.data.username == null || $scope.data.username == "") {
                            toaster.pop('error', "Please Fill User Name");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        if ($scope.data.email == null || $scope.data.email == "") {
                            toaster.pop('error', "Please Fill Email Address");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        else {
                            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                            if (reg.test($scope.data.email) == false) {
                                toaster.pop('error', "Please Enter Valid Email Address");
                                $("#loading").fadeOut("slow");
                                break;
                            }
                        }
                        if ($scope.data.password == null || $scope.data.password == "")
                        {
                            toaster.pop('error', "Please Fill Password");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        else {
							var regex = new RegExp("^(?=.{8,})");
                            if (!regex.test($scope.data.password)) {
                                toaster.pop('error', "Password should be atleast 8 characters");
                                $("#loading").fadeOut("slow");
                                break;
                            }
                        }
                        if ($scope.data.confirmPassword == null || $scope.data.confirmPassword == "") {
                            toaster.pop('error', "Please Fill Confirm Password");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        else if ($scope.data.password != $scope.data.confirmPassword) {
                            toaster.pop('error', "Confirm Password Should Be same As Password");
                            $("#loading").fadeOut("slow");
                            break;
                        }
                        else if ($scope.data.password === $scope.data.confirmPassword) {
                            authService
                                .register($scope.data.username, $scope.data.email, $scope.data.password, $scope.data.confirmPassword, $scope.data.profileimage)
                                .then(
                                function (data) {
									if (data.data.StatusCode == 200) {
										$scope.useremail = $scope.data.email;
										$scope.name = $scope.data.username;
                                        toaster.pop('success', "Registered Successfully.Activation link has been sent to the registered email.");
                                        $scope.data.username = "";
                                        $scope.data.email = "";
                                        $scope.data.password = "";
                                        $scope.data.confirmPassword = "";
                                        $scope.data.profileimage = "";
                                        $scope.data.profileimagesrc = "";
                                        $rootScope.logindata = data.data.PayLoad;
										$("#loading").fadeOut("slow");
										$scope.registersuccess = true;
                                    }
                                    else {
                                        if (data.data.StatusCode == 400) {
                                            $scope.error = data.data.ErrorMessage;
                                            toaster.pop('error', $scope.error);
                                            $("#loading").fadeOut("slow");
                                            //alert($scope.error);
                                        }
                                    }
                                });
                        }
                        else {
                            toaster.pop('error', "Passwords do not match");
                            $("#loading").fadeOut("slow");
                        }
                        break;
                    case 3:
                        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                        if (reg.test($scope.data.email) == false) {
                            toaster.pop('error', "Please enter valid Email Address.");
                            $("#loading").fadeOut("slow");
                        }
                        else
                        {
                            authService.ForgotPassword($scope.data.email);
                            toaster.pop('success', "We have sent a  link to your " + $scope.data.email + ". Please Reset your Password.");
                            $scope.data.email = "";
                            $("#loading").fadeOut("slow");

                        }
                        break;
                    case 6:
                        navService.gotoCharacters(true);
                        break;
                }
            }
        }
    ]);


})();


 