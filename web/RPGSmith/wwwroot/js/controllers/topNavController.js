(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('topNavController', ['$scope','$location', 'navService', '$rootScope', '$state', 'authService', 'rulesetDataShareService', 'toaster', 'characterService', '$browser', 'rulesetService', '$localStorage','$window',
        function ($scope,$location, navService, $rootScope, $state, authService, rulesetDataShareService, toaster, characterService, $browser, rulesetService, $localStorage, $window) {
            debugger;
            var menuItems = ['Characters', 'Rulesets', 'AccountSettings'];

            var menuItemIndex = menuItems.indexOf($state.params.menuSelected);
			$scope.resetModel = {};
            if (menuItemIndex > -1) {
                $scope.activeMenu = menuItems[menuItemIndex];
            }
            //$scope.data = $rootScope.logindata;
            $scope.navService = navService;
            $scope.data = $localStorage.firstLoginController;
            $("#loading").fadeOut("slow");

            //$scope.data = rulesetDataShareService.getImageandName();
			
            $scope.noop = function () {
                angular.noop();
            };
            $scope.gohome = function () {
                return navService.gotoCharacters();
            }
            $scope.hasNav = function (name) {
                return navService.hasNav(name);
            }
            $scope.toggleNav = function (name) {
                navService.toggleNav(name);
            };

            $scope.newstyles = function (data) {
                if (data.ProfileImage) {
                    return {
                        'background-size': '100% 100%',
                        'background-repeat': 'no-repeat',
                        'width': '120px',
                        'height': '120px'
                    }
                }
                return {
                    'background-color': 'transparent'
                }

            };

            $scope.getThumbNail = function () {
                if ($scope.data.ProfileImage)
                    return $scope.data.ProfileImage;
                return null;
            }
            $scope.CharacterRulesetCount = function ()
            {
                characterService.GetHeaderContentsCounts().then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.HeaderContents = data.data.PayLoad;
                        rulesetDataShareService.SetDisplayCharacterRulesetCount($scope.HeaderContents);
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                alert(data.data.ErrorMessage);
                            }
                        }
                    }
                });
            }
            $scope.ProfileImageUpload = function (input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('#profileImage')
                            .attr('src', e.target.result)
                            .width(120)
                            .height(120);
                        $scope.data.ProfileImage = e.target.result;
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            }

            $scope.AccountSettings = function () {
                  $("#loading").css("display", "block");
                $scope.resetModel = {};
                $scope.resetModel.newpassword = "";
                $scope.resetModel.confirmpassword = "";
                $scope.resetModel.oldpassword = "";
                $state.go("profile.AccountSettings");
                $("#loading").fadeOut("slow");
            }

			$scope.loadResetPage = function () {
				console.log("Search Params: ",$location.search().userid);
				$("#loading").css("display", "block");
				$scope.resetModel = {};
				$scope.resetModel.newpassword = "";
				$scope.resetModel.confirmpassword = "";
				authService.authentication.authenticated = true;;
				$("#loading").fadeOut("slow");
			}


            $scope.Cancel = function () {
                //$("#loading").css("display", "block");
                $window.history.back();
              //  $state.go("profile.characters");
                //$("#loading").fadeOut("slow");
            }

            $scope.Update = function () {
                var profile =
                    {
                        username: $scope.data.Name,
                        Email: $scope.data.Email,
                        ProfileImage: $scope.data.ProfileImage
                    };
                var data = authService.updateprofile(profile);
                data.then(function (data) {
                    if (data.data.StatusCode == 200) {
                        toaster.pop('success', "Details Updated Successfully");
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                toaster.pop('success', data.data.ErrorMessage);
                            }
                        }
                    }
                });
            }
            $scope.cancel = function () {
               // $("#loading").css("display", "block");
                $state.go("profile.AccountSettings");
               // $("#loading").fadeOut("slow");
            }

            $scope.ReSetPassword = function () {
                $state.go("profile.ResetPassword");
            }
            $scope.EditData = function () {
                $state.go("profile.EditProfile");
            }
            $scope.onloadFun = function () {
                $("#loading").fadeOut("slow");
            }
            $scope.ResetProfilePassword = function (resetModel) {
                //$("#loading").css("display", "block");
				console.log("ResetModel:", resetModel);
				console.log("PasswordHash:", $scope.data.PasswordHash);
				
				//var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,12}$/;
				//CHanged requirements to any 8 characters
				var regex = new RegExp("^(?=.{8,})");
                if (resetModel.oldpassword == "" ||resetModel.oldpassword == null || angular.isUndefined(resetModel.oldpassword) == true)
                {
                    toaster.pop('Warning', "Please Enter Old Password");
                    $("#loading").fadeOut("slow");
                }
               else if (resetModel.oldpassword != $scope.data.PasswordHash) {
                    toaster.pop('Warning', "Old Password is not same.");
                    $("#loading").fadeOut("slow");
                }
                else if (resetModel.newpassword == $scope.data.PasswordHash) {
                    toaster.pop('Warning', "New Password Should not Be Same as Old Password");
                    $("#loading").fadeOut("slow");
                }
                else if (resetModel.oldpassword != "" && resetModel.newpassword == undefined && resetModel.confirmpassword == undefined) {
                    toaster.pop('Warning', "Please Enter New Password");
                    $("#loading").fadeOut("slow");
                }
                else if (!regex.test(resetModel.newpassword)) {
                    toaster.pop('Warning', "New Password should be atleast 8 characters long");
                    $("#loading").fadeOut("slowest");
                }
                else if (resetModel.newpassword != resetModel.confirmpassword) {
                    toaster.pop('Warning', "Confirm Password Should Be same As Password");
                    $("#loading").fadeOut("slower");
                }
                else {

                    var resetpass = {
                        Password: resetModel.newpassword,
						ConfirmPassword: resetModel.confirmpassword,
						UserId: $location.search().userid
                    };
                    var pass = authService.Resetpassword(resetpass)
                    pass.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            toaster.pop('success', "Password Updated Successfully");
                            $scope.resetModel = {}
                            $scope.resetModel.newpassword = "";
                            $scope.resetModel.confirmpassword = "";
                            $scope.resetModel.oldpassword = "";
                            $("#loading").fadeOut("slow");
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    alert(data.data.ErrorMessage);
                                    $("#loading").fadeOut("slow");
                                }
                            }
                        }
                    });
                }
			}

			$scope.signoutGoogle = function () {
				if (gapi == null || gapi.auth2 == null || gapi.auth2.getAuthInstance() == null)
					return;
				
				gapi.auth2.getAuthInstance().disconnect();
				
				googleUser = null;

			}

			
            $scope.signout = function () {
				$("#loading").css("display", "block");
				//Clear any google logins
				$scope.signoutGoogle();
                var logout = authService.logout();
                logout.then(function (data) {
                    $("#loading").fadeOut("slow");
                    if (data.data.StatusCode == 200) {
                        var savedData = {};
                        var savedspell = {};
                        var savedability = {};
                        var savedcorestat = {};
                        rulesetDataShareService.setRulesetItems(savedData)
                        rulesetDataShareService.setRulesetSpells(savedspell)
                        rulesetDataShareService.setRulesetAbilities(savedability)
                        rulesetDataShareService.setcorestat(savedcorestat)
                        localStorage.clear();
                        authService.authentication.authenticated = false;
                        $state.go('login');
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                alert(data.data.ErrorMessage);
                                $("#loading").fadeOut("slow");
                            }
                        }
                    }
                })
            }
        }]);
})();