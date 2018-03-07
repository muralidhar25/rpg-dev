(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');
    app.controller('charactersPageController', ['$scope', '$state', '$window', 'dialogs', '$timeout', '$transition', 'toaster', 'navService', 'characterService', 'rulesetService', 'rulesetDataShareService', 'authService',
        function ($scope, $state, $window, dialogs, $timeout, $transition, toaster, navService, characterService, rulesetService, rulesetDataShareService, authService) {
            //Event Handlers for Characters Page.
            $scope.file = "";
            $scope.showBtn = false;
            $scope.Imagesrc = "http://www.advacto.com/images/user.jpg";
            $scope.characterAdd = function () {
                $state.go('profile.addnewcharacterdialog');
            };

            $scope.characterSubmitForm = function (valid) {
                valid = false;
            }
            $scope.CharacterRuleSetOnChange = function () {
                if ($scope.character.RulesetID > 0) {

                    $scope.character.Button = false;
                }
                else {
                    $scope.character.Button = true;
                }
            }
            $scope.newCharacter = function () {

                var newCharacterData = {
                    id: 0,
                    name: "",
                    file: null,
                    RulesetID: 0
                }

                var dlg = dialogs.create('/views/dialogs/character-addnew.html', 'dialogAddNewCharacter',
                    { mode: 1, characterData: newCharacterData }
                );

                dlg.result.then(function (res) {
                    if (res != 'cancel') {
                        $scope.characters.push(res);
                        toaster.pop('success', 'Character Created Successfully');
                    }
                });
            };
            $scope.GetRulesets = function () {
                $state.go('profile.AddNewRuleSet');
            };
            $scope.EditData = function () {
                $state.go('profile.EditProfile');
            }
            $scope.ReSetPassword = function () {
                $state.go('profile.ResetPassword');
            }
            $scope.newstyles = function (c) {
                if (c.Portrait) {
                    return {
                        'background-size': '100% 100%',
                        'background-repeat': 'no-repeat',
                        'width': '120px',
                        'height': '120px'
                    }
                }
                return {
                    'background-color': 'transparent',
                    'background-repeat': 'no-repeat',
                    'width': '120px',
                    'height': '120px'
                }
            };
            $scope.getStyles = function (c) {
                if (c.Portrait) {
                    return {
                        'background-image': 'url(' + c.Id + '/' + c.Portrait + ')',
                        'background-color': 'white',
                        'width': '10%',
                        'height': '10%'
                    }
                }
                else {
                    return {
                        'background-color': 'transparent',
                        'width': '10%',
                        'height': '10%'
                    }
                }

            };
            //characterService.GetHeaderContentsCounts();
            characterService.GetCharacters().then(function (data) {
                if (data.data.StatusCode == 200) {
                    $scope.characters = data.data.PayLoad;
                    //$scope.HeaderContents = rulesetDataShareService.getDisplayCharacterRulesetCount();
                    //$scope.HeaderContents.TotalCharactersCount = $scope.characters.length;
                }
                else {
                    if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            alert(data.data.ErrorMessage);
                        }
                    }
                }
            });

            $scope.GetCharacters = function () {
                characterService.GetCharacters().then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.characters = data.data.PayLoad;
                        //$scope.HeaderContents = rulesetDataShareService.getDisplayCharacterRulesetCount();
                        //$scope.HeaderContents.TotalCharactersCount = $scope.characters.length;
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

            rulesetService.GetRuleSets().then(function (data) {
                if (data.data.StatusCode == 200) {
                    $scope.RuleSets = data.data.PayLoad;
                    $scope.HeaderContents = rulesetDataShareService.getDisplayCharacterRulesetCount();
                    $scope.HeaderContents.TotalRuleSetCount = $scope.RuleSets.length;
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

            $scope.GetRuleset = function () {
                rulesetService.GetRuleSets().then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.RuleSets = data.data.PayLoad;
                        //$scope.HeaderContents = rulesetDataShareService.getDisplayCharacterRulesetCount();
                        //$scope.HeaderContents.TotalRuleSetCount = $scope.RuleSets.length;
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

            $scope.getThumbNail = function () {
                if ($scope.varRoot.file)
                    return $scope.varRoot.file;
                return null;
            }
            $scope.characterImageUpload = function (input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('#characterImage')
                            .attr('src', e.target.result)
                            .width(120)
                            .height(120);
                        $scope.file = e.target.result
                        $scope.character.file = $scope.file;
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            }
            $scope.tilePickerApi = {
                messageId: null,
                beforeSelect: function () {
                    toaster.clear('*');
                    $scope.tilePickerApi.messageId = toaster.pop({
                        type: 'note',
                        body: 'Click a character to ' + $scope.tilePickerApi.action + ' it.',
                        timeout: 0
                    });
                },
                onClose: function () {
                    if ($scope.tilePickerApi.messageId)
                        toaster.clear($scope.tilePickerApi.messageId);
                }
            };
            $scope.addNewRuleSet = function () {
                $state.go('profile.NewRuleSet');
            }
            $scope.cancel = function () {
                //$("#loading").css("display", "block");
                $window.history.back();
                $scope.character.name = "";
                $scope.character.file = "";
                $scope.character.RulesetID = "";

            }
            $scope.save = function () {
                $("#loading").css("display", "block");
                var character = {
                    Id: $scope.character.id,
                    Name: $scope.character.name,
                    Portrait: $scope.character.file,
                    RulesetID: $scope.character.RulesetID,
                    Heading: $scope.character.Heading,
                    Action: $scope.character.Action
                };

                if ($scope.character.RulesetID > 0) {
                    if ($scope.character.id == 0) {
                        var addcharacter = characterService.saveCharacter(character);
                        addcharacter.then(function (res) {
                            if (res.data.StatusCode == 200) {
                                $scope.character.name = "";
                                $scope.character.file = "";
                                $scope.character.RulesetID = "";
                                $scope.createcharacter = res.PayLoad;
                                $("#loading").fadeOut("slow");
                                toaster.pop('success', "Character Created Successfully");
                            }
                            else {
                                if (res.data.StatusCode == 400) {

                                    if (res.data.ShowToUser == true) {
                                        toaster.pop('error', res.data.ErrorMessage);
                                        $("#loading").fadeOut("slow");
                                    }
                                }
                            }

                        });
                    }
                    else {
                        var data;
                        if ($scope.character.Action == "New") {
                            data = characterService.saveCharacter(character);
                        }
                        else if ($scope.character.Action == "edit") {
                            data = characterService.EditCharacter(character);
                        }
                        else {
                            data = characterService.CopyCharacter(character);
                        }
                        data.then(function (res) {
                            if (res.data.StatusCode == 200) {
                                $scope.character.name = "";
                                $scope.character.file = "";
                                $scope.character.RulesetID = "";
                                $scope.createcharacter = res.PayLoad;
                                $("#loading").fadeOut("slow");
                                toaster.pop('success', "Character Created Successfully");
                            }
                            else {
                                if (res.data.StatusCode == 400) {

                                    if (res.data.ShowToUser == true) {
                                        //alert(res.data.ErrorMessage);
                                        toaster.pop('error', res.data.ErrorMessage);
                                        $("#loading").fadeOut("slow");
                                    }
                                }
                            }

                        })
                    }

                } else {
                    toaster.pop('error', 'Please select one ruleset');
                }
            }



            $scope.copyCharacter = function (characterData) {

                var copyCharacterData = {
                    id: characterData.Id,
                    name: characterData.Name,
                    file: characterData.Portrait,
                    RulesetID: characterData.RulesetId,
                };

                var dlg = dialogs.create('/views/dialogs/character-addnew.html', 'dialogAddNewCharacter',
                    { mode: 3, characterData: copyCharacterData }
                );

                dlg.result.then(function (res) {
                    if (res != 'cancel') {
                        $scope.characters.push(res);
                        toaster.pop('success', 'Character Copied Successfully');
                    }
                });

            }

            $scope.editCharacter = function (characterData) {

                var editCharacterData = {
                    id: characterData.Id,
                    name: characterData.Name,
                    file: characterData.Portrait,
                    RulesetID: characterData.RulesetId,
                }

                var dlg = dialogs.create('/views/dialogs/character-addnew.html', 'dialogAddNewCharacter',
                    { mode: 2, characterData: editCharacterData }
                );

                dlg.result.then(function (res) {
                    if (res != 'cancel') {

                        var editedCharacterIndex = -1;
                        for (var i = 0; i < $scope.characters.length; i++) {
                            if ($scope.characters[i].Id == editCharacterData.id) {
                                editedCharacterIndex = i;
                            }
                        }
                        if (editedCharacterIndex > -1) {
                            $scope.characters[editedCharacterIndex] = res;
                            toaster.pop('success', "Character Edited Successfully");
                        }
                        
                    }
                });
            }

            $scope.selectCharacter = function (c) {
                if ($scope.tilePickerApi.selecting) {
                    $scope.tilePickerApi.endSelect(c);
                }
                else {
                    if ($scope.tilePickerApi.selecting)
                        $scope.tilePickerApi.endSelect(c);

                    else {
                        $state.go('profile.character.layout', { characterId: c.Id, action: 1, isNew: 1 });
                        //$transition.router.stateService.go('profile.character.layout', { characterId: c.Id, action: 1, isNew: 1 });
                        //$("#loading").css("display", "block");
                    }

                }
            };


            $scope.showContextMenu = function (c) {
                var cardActionsHover = angular.element(c.target).parents(".card").find(".card-actions");

                if (cardActionsHover.hasClass("hide")) {
                    cardActionsHover.removeClass("hide");
                    cardActionsHover.addClass("show");
                }
                else {
                    cardActionsHover.removeClass("show");
                    cardActionsHover.addClass("hide");
                }

            };


            $scope.hideContextMenu = function (c) {
                var cardActionsHover = angular.element(c.target).parents(".card").find(".card-actions");
                cardActionsHover.removeClass("show");
                cardActionsHover.addClass("hide");
            };


            $scope.characterDelete = function (item) {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    'Are you sure you want to delete this Character, "' + item.Name + '", and all associated pages, tabs, and tiles?',
                    { size: "sm" }
                );
                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            $("#loading").css("display", "block");
                            var characterId = item.Id;
                            var deletes = characterService.Deletecharacter(characterId);
                            deletes.then(function (res) {
                                if (res.data.StatusCode == 200) {
                                    var deletedCharacterIndex = -1;
                                    for (var i = 0; i < $scope.characters.length; i++) {
                                        if ($scope.characters[i].Id == characterId) 
                                        {
                                            deletedCharacterIndex = i;
                                        }
                                    }
                                    if (deletedCharacterIndex > -1) {
                                        $scope.characters.splice(deletedCharacterIndex, 1);
                                        toaster.pop('success', "Character Deleted Successfully");
                                    }
                                    $("#loading").fadeOut("slow");
                                }
                                else {
                                    if (res.data.StatusCode == 400) {
                                        if (res.data.ShowToUser == true) {
                                            toaster.pop('error', res.data.ErrorMessage);
                                            $("#loading").fadeOut("slow");
                                        }
                                    }
                                }
                            })
                        }

                    });
            }
            
        }
    ])
})();