(function () {
    'use strict';


    var module = angular.module('rpgsmith-dialogs');

    module.controller('dialogAddNewCharacter',
        ['$scope', '$state', '$q', '$uibModalInstance', 'Upload', 'data', 'rulesetService', 'characterService', 'toaster',
            function ($scope, $state, $q, $uibModalInstance, Upload, data, rulesetService, characterService, toaster) {
                //$scope.character = {};

                //$scope.character.Action = data.mode;

                $scope.character = data.characterData;
				$scope.showimagebtns = false;
                //$scope.file = null;
                if (data.mode == 1) {

                    $scope.pageHeading = "New Character";
                    $scope.pageButton = "Save"

                    $scope.disableNameControl = false;
                    $scope.disableAllControls = false;

                    $scope.mode = 1;
                }
                else if (data.mode == 2) {

                    $scope.pageHeading = "Edit Character";
                    $scope.pageButton = "Save"

                    $scope.disableNameControl = true;
                    $scope.disableAllControls = false;

                    $scope.mode = 2;

                }
                else {
                    $scope.pageHeading = "Duplicate Character";
                    $scope.pageButton = "Save"


                    $scope.character.name = "";

                    $scope.disableNameControl = false;
                    $scope.disableAllControls = true;

                    $scope.mode = 3;
                }

                $scope.cancel = function () {
                    //$("#loading").css("display", "block");
                    $uibModalInstance.dismiss('Canceled');
                   // $("#loading").fadeOut("slow");
                };

                $scope.getThumbNail = function () {
                    if ($scope.file)
                        return $scope.file;
                    var c = $scope.item;
                    if (c.id && c.portrait)
                        return '/characterdata/' + c.id + '/' + c.portrait;
                    return null;
				}
				//Upload file
				$scope.OpenFile = function () {
					console.log("Open and upload file...");
					$("#newCharacterImage").click();
					//var input = $('input[type=file]');//.val();
					//input.click();
					//return false;
				}
                $scope.characterImageUpload = function (input) {
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            $scope.file = e.target.result
                            $scope.character.file = $scope.file;
                        };
                        reader.readAsDataURL(input.files[0]);
                    }
                }
                $scope.save = function () {
                    //$("#loading").css("display", "block");
                    var character = {};
                    if ($scope.mode == 1 && $scope.character.id == 0) {
                        character = {
                            Id: 0,
                            Name: $scope.character.name,
                            Portrait: $scope.character.file,
                            RulesetID: $scope.character.RulesetID,
                        };
                        if ($scope.character.RulesetID > 0) {
                            var addcharacter = characterService.saveCharacter(character);
                            addcharacter.then(function (res) {
                                if (res.data.StatusCode == 200) {
                                    //$("#loading").fadeOut("slow");
                                    $uibModalInstance.close(res.data.PayLoad);

                                }
                                else {
                                    if (res.data.StatusCode == 400) {
                                        if (res.data.ShowToUser == true) {
                                            toaster.pop('error', res.data.ErrorMessage);
                                            //$("#loading").fadeOut("slow");
                                        }
                                    }
                                }
                            });
                        }
                        else
                        {
                            toaster.pop('error', 'Please select one ruleset');
                        }
                        }
                        else {
                            var data;
                            if ($scope.mode == 2) {
                                character = {
                                    Id: $scope.character.id,
                                    Name: $scope.character.name,
                                    Portrait: $scope.character.file,
                                    RulesetID: $scope.character.RulesetID,
                                };
                                data = characterService.EditCharacter(character);
                            }
                            else if ($scope.mode == 3) {
                                character = {
                                    Id: $scope.character.id,
                                    Name: $scope.character.name,
                                    Portrait: $scope.character.file,
                                    RulesetID: $scope.character.RulesetID,
                                };
                                data = characterService.CopyCharacter(character);
                            }
                            data.then(function (res) {
                                if (res.data.StatusCode == 200) {
                                    //$("#loading").fadeOut("slow");

                                $uibModalInstance.close(res.data.PayLoad);
                            }
                            else {
                                if (res.data.StatusCode == 400) {
                                    if (res.data.ShowToUser == true) {
                                        toaster.pop('error', res.data.ErrorMessage);
                                        //$("#loading").fadeOut("slow");
                                    }
                                }
                            }

                        })
                    }
                }

                rulesetService.GetRuleSets().then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.RuleSets = data.data.PayLoad;
                        //$("#loading").fadeOut("slow");
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                toaster.pop('error', data.data.ErrorMessage);

                                //$("#loading").fadeOut("slow");
                            }
                        }
                    }
                });
                $scope.manageRuleSets = function () {
                    $uibModalInstance.dismiss('Canceled');
                    $state.go('profile.AddNewRuleSet');
                }

            }]);

    module.controller('dialogEditCharacter',
        ['$scope', '$q', '$uibModalInstance', 'Upload', 'data',
            function ($scope, $q, $uibModalInstance, Upload, data) {
                $scope.isEdit = data.isEdit;
                $scope.item = data.item;
                $scope.file = null;

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('Canceled');
                };

                $scope.getThumbNail = function () {

                    if ($scope.file)
                        return $scope.file;

                    var c = $scope.item;
                    if (c.id && c.portrait)
                        return '/characterdata/' + c.id + '/' + c.portrait;

                    return null;
                }

                $scope.save = function () {

                  

                };

            }]);

    module.controller('dialogLayoutRename', ['$scope', '$uibModalInstance', 'data', 'rulesetService', function ($scope, $uibModalInstance, data, rulesetService) {
        $scope.Tab = data.scope;
        $scope.TabHeading = data.State;
        $scope.ButtonText = data.btntext;
        $scope.cancel = function () {
            $uibModalInstance.dismiss('Canceled');
        };

        $scope.save = function () {

            $uibModalInstance.close($scope.Tab);
        };

        $scope.hitEnter = function (evt) {
            if (evt.which === 13 && !(angular.equals($scope.name, null) || angular.equals($scope.name, '')))
                $scope.save();
        };
        $scope.cancel = function () {

            $uibModalInstance.dismiss('Canceled');
        };

        $scope.SaveCorestat = function () {
            $uibModalInstance.close($scope.CoreStatProperties);
        }
    }]);

    module.controller('dialogTabRename', ['$scope', '$uibModalInstance', 'data', 'rulesetService', function ($scope, $uibModalInstance, data, rulesetService) {
        $scope.Tab = data.scope;
        $scope.TabHeading = data.State;
        $scope.ButtonText = data.btntext;
        $scope.cancel = function () {
            $uibModalInstance.dismiss('Canceled');
        };

        $scope.save = function () {
            $uibModalInstance.close($scope.Tab);
        };

        $scope.hitEnter = function (evt) {
            if (evt.which === 13 && !(angular.equals($scope.name, null) || angular.equals($scope.name, '')))
                $scope.save();
        };
        $scope.cancel = function () {
            //$("#loading").css("display", "block");
            $uibModalInstance.dismiss('Canceled');
            //$("#loading").fadeOut("slow");
        };

        $scope.SaveCorestat = function () {
            $uibModalInstance.close($scope.CoreStatProperties);
        }
    }]);

    module.controller('dialogTileTypes', ['$scope', '$uibModalInstance', 'data', 'dialogs', 'tileService', function ($scope, $uibModalInstance, data, dialogs, tileService) {

        $scope.tileTypes = data.scope;
        $scope.cancel = function () {
           // $("#loading").css("display", "block");
            $uibModalInstance.dismiss('Canceled');
            //$("#loading").fadeOut("slow");
        };

        $scope.choosetile = function (tile) {
            $uibModalInstance.close(tile);
        }

        $scope.cancel = function () {
           // $("#loading").css("display", "block");
            $uibModalInstance.dismiss('Canceled');
           // $("#loading").fadeOut("slow");
        };

    }]);

    module.controller('dialogAddTile', ['$scope', '$uibModalInstance', 'data', 'tileService', function ($scope, $uibModalInstance, data, tileService) {
        $scope.Tiles = data.scope;

    }]);

   
    module.controller('dialogCreateCoreStat', ['$scope', '$uibModalInstance', 'data', 'toaster', 'rulesetService', function ($scope, $uibModalInstance, data, toaster, rulesetService) {

		
		$scope.OperationTypeMode = data.CoreStatMode;
        $scope.CoreStatProperties = data.scope;
        $scope.CoreStatsInGrid = data.CoreStatsInGrid;
        $scope.CoreStatsNameInGrid = data.CoreStatsNameInGrid;
        $scope.CoreStatProperties.Value.Choices.choices = [];
        $scope.tabName = data.tabname;
        $scope.buttontext = data.btntext;
		$scope.IsButtonDisabled = data.IsenableBtn;
		$scope.CoreStatProperties.Value.Choices.choices.push({ ChoiceName: '' });
        if ($scope.OperationTypeMode == "Create") {
            $scope.DisableField = false;
        }
        rulesetService.GetTypes().then(function (data) {
            if (data.data.StatusCode == 200) {
				$scope.Types = data.data.PayLoad;
				console.log("data.data.PayLoad", data.data.PayLoad);
                $scope.weight = data.data.PayLoad[6].Units
                $scope.Height = data.data.PayLoad[8].Units
                $scope.Volume = data.data.PayLoad[9].Units
            }
            else {
                if (data.data.StatusCode == 400) {
                    if (data.data.ShowToUser == true) {
                        toaster.pop('error', data.data.ErrorMessage);
                    }
                }
            }
        });
        $scope.CoreStatOnChange = function () {
            if ($scope.CoreStatProperties.TypeId == undefined) {
                $scope.IsButtonDisabled = true;
                $scope.ShowChoices = false;
                $scope.ShowCalculation = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = false;
            }
            else if ($scope.CoreStatProperties.TypeId == 2) {
                $scope.ShowChoices = true;
                $scope.IsButtonDisabled = false;
                $scope.ShowCalculation = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = false;
            }
            else if ($scope.CoreStatProperties.TypeId == 16) {
                $scope.ShowCalculation = true;
                $scope.IsButtonDisabled = false;
                $scope.ShowChoices = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = false;
            }
            else if ($scope.CoreStatProperties.TypeId == 5) {
                $scope.ShowCalculation = false;
                $scope.IsButtonDisabled = false;
                $scope.ShowChoices = false;
                $scope.ShowValueandSubvalue = true;
                $scope.ShowCurrentMaxValue = false;
            }
            else if ($scope.CoreStatProperties.TypeId == 6) {
                $scope.ShowCalculation = false;
                $scope.IsButtonDisabled = false;
                $scope.ShowChoices = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = true;
            }
            else if ($scope.CoreStatProperties.TypeId > 0 || $scope.CoreStatProperties.Name != "") {
                $scope.ShowChoices = false;
                $scope.ShowCalculation = false;
                $scope.IsButtonDisabled = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = false;
            }
            else {
                $scope.IsButtonDisabled = false;
            }
        }

       
        $scope.AddValueSubvalue = function (value) {
            if (value == 'Value') {
                $scope.valueName = value;
            }
            else if (value == 'SubValue') {
                $scope.valueName = value;
            }
        }

        $scope.Addcurrentmax = function (value) {
            if (value == 'CurrentValue') {
                $scope.CurrentMaxvalue = value;
            }
            else if (value == 'MaxValue') {
                $scope.CurrentMaxvalue = value;
            }
        }
        $scope.ExistCoreStatOnChange = function () {
            if ($scope.CoreStatsInGrid.Name != undefined) {
                var a = "[abc]";
                a = a.replace("abc", $scope.CoreStatsInGrid.Name.Name);
                $scope.tempVar = a;
            }
            else {
                if ($scope.Formula == "" || $scope.Formula == undefined) {
                    $scope.Formula = "";
                }
                else {
                    $scope.Formula = $scope.Formula;
                }
            }
        }
        $scope.CreateFormula = function () {
            if ($scope.Formula == "" || $scope.Formula == undefined) {
                $scope.Formula = $scope.tempVar;
            }
            else if ($scope.Formula != "") {
                $scope.Formula = $scope.Formula + "" + $scope.tempVar;
            }
        }
        $scope.addChoice = function () {
            $scope.CoreStatProperties.Value.Choices.choices.push({ ChoiceName: '' });
        }
        $scope.RemoveChoice = function (choice) {
            var idx = $scope.CoreStatProperties.Value.Choices.choices.indexOf(choice);
            $scope.CoreStatProperties.Value.Choices.choices.splice(idx, 1);
        }
       
        $scope.SaveCorestat = function () {
            //$scope.CoreStatsNameInGrid = rulesetDataShareService.getRulesetCoreStatData();
			//alert("Test");
            if ($scope.CoreStatProperties.Name == "" || $scope.CoreStatProperties.Name === undefined || $scope.CoreStatProperties.Name == null) {
                toaster.pop('error', "Please enter CoreStat Name");
                return;
            }
            else if ($scope.CoreStatProperties.TypeId == 0 || $scope.CoreStatProperties.TypeId === undefined || $scope.CoreStatProperties.TypeId == "") {
                toaster.pop('error', "Please Select CoreStat Type");
                return;
            }
            else if ($scope.CoreStatsNameInGrid != undefined) {
                for (var i = 0; i < $scope.CoreStatsNameInGrid.length; i++) {
                    if ($scope.CoreStatsNameInGrid[i].Name === undefined) {
                        toaster.pop('error', "Please enter CoreStat Name");
                        return;
                    }
                   
                }
            }
            for (var k = 0; k < $scope.Types.length; k++) {
                if ($scope.Types[k].TypeId == $scope.CoreStatProperties.TypeId) {
                    $scope.CoreStatProperties.TypeName = $scope.Types[k].Name;
                    if (($scope.Types[k].TypeId == 16) && ($scope.CoreStatProperties.TypeId == 16)) {
                        $scope.CoreStatProperties.Value.Calculation.formulae = $scope.Formula;
                    }
                   
                }
            }
            $uibModalInstance.close($scope.CoreStatProperties);

        }


        $scope.cancel = function () {

            $uibModalInstance.close('cancel');
        }


    }]);

    module.controller('dialogAddCorestatValues', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'rulesetDataShareService', function ($scope, $uibModalInstance, data, rulesetService, rulesetDataShareService) {

        $scope.characters = data.scope;
        $scope.SaveCorestatValues = function () {
           // $("#loading").css("display", "block");
            rulesetDataShareService.setcorestatvalue($scope.characters);
            $uibModalInstance.close($scope.characters);
        }
        $scope.cancel = function () {

            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('dialogAssociatedSpells', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'dialogs', function ($scope, $uibModalInstance, data, characterService, dialogs) {

        $scope.Spells = data.scope;

        var AssociatedSpells = data.associatedspells;

        if (AssociatedSpells != null && AssociatedSpells != undefined) {
            for (var i = 0; i < $scope.Spells.length; i++) {
                for (var j = 0; j < AssociatedSpells.length; j++) {
                    if ($scope.Spells[i].SpellProperties[0].Value.Text.value == AssociatedSpells[j].SpellProperties[0].Value.Text.value) {
                        $scope.Spells[i].Selected = true;
                    }
                }
            }
        }
        $scope.SaveAssociatedSpells = function () {
            var exampleArray = [];
            for (var i = 0; i < $scope.Spells.length; i++) {
                if ($scope.Spells[i].Selected) {
                    exampleArray.push($scope.Spells[i]);
                }
            }
            $uibModalInstance.close(exampleArray)
        }

        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }


    }]);

	module.controller('dialogAssociatedRulesetItems', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'dialogs', function ($scope, $uibModalInstance, data, characterService, dialogs) {

		$scope.RulesetItems = data.scope;

		$scope.SaveAssociatedRulesetItems = function () {
			console.log("In rulesetsItems: " + $scope.RulesetItems.length);
			var exampleArray = [];
			for (var i = 0; i < $scope.RulesetItems.length; i++) {
				console.log("$scope.RulesetItems[i].Selected: " + $scope.RulesetItems[i].Selected);
				if ($scope.RulesetItems[i].Selected) {
					exampleArray.push($scope.RulesetItems[i]);
				}
			}
			$uibModalInstance.close(exampleArray)
		}


		$scope.cancel = function () {
			$uibModalInstance.close('cancel');
		}


	}]);

	module.controller('dialogAssociatedRulesetSpells', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'dialogs', function ($scope, $uibModalInstance, data, characterService, dialogs) {

		$scope.RulesetSpells = data.scope;

		$scope.SaveAssociatedRulesetSpells = function () {
			console.log("In rulesetsItems: " + $scope.RulesetSpells.length);
			var exampleArray = [];
			for (var i = 0; i < $scope.RulesetSpells.length; i++) {
				console.log("$scope.RulesetItems[i].Selected: " + $scope.RulesetSpells[i].Selected);
				if ($scope.RulesetSpells[i].Selected) {
					exampleArray.push($scope.RulesetSpells[i]);
				}
			}
			$uibModalInstance.close(exampleArray)
		}


		$scope.cancel = function () {
			$uibModalInstance.close('cancel');
		}


	}]);

	module.controller('dialogAssociatedRulesetAbilities', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'dialogs', function ($scope, $uibModalInstance, data, characterService, dialogs) {

		$scope.RulesetAbilities = data.scope;

		$scope.SaveAssociatedRulesetAbilities = function () {
			console.log("In rulesetsAbilities: " + $scope.RulesetAbilities.length);
			var exampleArray = [];
			for (var i = 0; i < $scope.RulesetAbilities.length; i++) {
				console.log("$scope.RulesetItems[i].Selected: " + $scope.RulesetAbilities[i].Selected);
				if ($scope.RulesetAbilities[i].Selected) {
					exampleArray.push($scope.RulesetAbilities[i]);
				}
			}
			$uibModalInstance.close(exampleArray)
		}


		$scope.cancel = function () {
			$uibModalInstance.close('cancel');
		}


	}]);

    module.controller('dialogAssociatedAbilities', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'dialogs', function ($scope, $uibModalInstance, data, characterService, dialogs) {
        $scope.Abilities = data.scope;

        var AssociatedAbilities = data.associatedabilities;

        if (AssociatedAbilities != null && AssociatedAbilities != undefined) {
            for (var i = 0; i < $scope.Abilities.length; i++) {
                for (var j = 0; j < AssociatedAbilities.length; j++) {
                    if ($scope.Abilities[i].AbilityProperties[0].Value.Text.value == AssociatedAbilities[j].AbilityProperties[0].Value.Text.value) {
                        $scope.Abilities[i].Selected = true;
                    }
                }
            }
        }
        $scope.SaveAssociatedAbilities = function () {
            var exampleArray = [];
            for (var i = 0; i < $scope.Abilities.length; i++) {
                if ($scope.Abilities[i].Selected) {
                    exampleArray.push($scope.Abilities[i]);
                }
            }
            $uibModalInstance.close(exampleArray)
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('dialogCreateItem', ['$scope', '$uibModalInstance', 'data', 'toaster', 'rulesetService', 'dialogs', function ($scope, $uibModalInstance, data, toaster, rulesetService, dialogs) {

        var Spells = data.Spells;
        var Abilities = data.Abilities;

        $scope.Properties = data.scope;
        $scope.tabName = data.tabName;
        $scope.buttontext = data.btntext;
        $scope.IsBtnDisabled = data.IsBtnDisabled;
        $scope.Content_ItemProperties = data.Content_ItemProperties;
        $scope.ShowAssociatedSpells = true;
        $scope.ShowAssociatedAbilities = true;
		$scope.showimagebtns = false;
		console.log("$scope.Properties: ", $scope.Properties);
		//Upload file
		$scope.OpenFile = function () {
			console.log("Open and upload file...");
			$("#newRulesetImage").click();
			//var input = $('input[type=file]');//.val();
			//input.click();
			//return false;
		}

		$scope.ItemImageUpload = function (input) {
			console.log("File Input: ", input);
			$scope.showimagebtns = false;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					//console.log("e.target.result: "+e.target.result);
					$scope.$apply(function () {

						$scope.Properties[1].Value.Image.image = e.target.result;
					});


				};
				reader.readAsDataURL(input.files[0]);

			}
		}
        $scope.OpenAssociatedSpells = function () {
            var dlg = dialogs.create('/views/dialogs/AssociatedSpells.html', 'dialogAssociatedSpells',
                { scope: Spells, associatedspells: $scope.AssociatedSpells }
            );

            dlg.result.then(function (res) {
                $scope.AssociatedSpells = res;
            });
        }

        $scope.OpenAssociatedAbilities = function () {
            var dlg = dialogs.create('/views/dialogs/AssociatedAbilities.html', 'dialogAssociatedAbilities',
                { scope: Abilities, associatedabilities: $scope.AssociatedAbilities }
            );

            dlg.result.then(function (res) {
                $scope.AssociatedAbilities = res;
            });
        }

        $scope.Create = function () {
            if ($scope.Content_ItemProperties != undefined) {
                for (var i = 0; i < $scope.Content_ItemProperties.length; i++) {
                    if ($scope.Content_ItemProperties[i].toLowerCase() == $scope.Properties[0].Value.Text.value.toLowerCase()) {
                        toaster.pop('Error', "Please enter unique Item Name");
                        return;
                    }
                }
            }

            var createItemResult = {};
            for (var i = 0; i < $scope.Properties.length; i++) {
                if ($scope.Properties[i].TypeId == 2) {
                    $scope.Properties[i].Value.Choices.SelectedChoiceName = $scope.Properties[i].Value.Choices.selectedchoice.ChoiceName;
                    $scope.Properties[i].Value.Choices.selectedchoice = "";
				}
				if ($scope.Properties[i].TypeId == 14) {
					$scope.Properties[i].Value.Text = null;
				}
            }
            createItemResult.Properties = $scope.Properties;
            createItemResult.AssociatedSpells = $scope.AssociatedSpells;
            createItemResult.AssociatedAbilities = $scope.AssociatedAbilities;

            $uibModalInstance.close(createItemResult);
            //$uibModalInstance.close($scope.Properties);
        }

        $scope.ItemcloseDialog = function () {

            $uibModalInstance.close($scope.CoreStatProperties);
        }

        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('dialogCreateSpell', ['$scope', '$uibModalInstance', 'data', 'toaster', 'rulesetService', function ($scope, $uibModalInstance, data, toaster, rulesetService) {
        $scope.OperationTypeMode = data.SpellMode;
        $scope.Content_SpellProperties = data.Content_SpellProperties;
        $scope.Properties = data.scope;
        $scope.tabName = data.tabName;
        $scope.buttontext = data.btntext;
        $scope.Create = function () {
            if ($scope.Content_SpellProperties != undefined) {
                for (var i = 0; i < $scope.Content_SpellProperties.length; i++) {
                    if ($scope.Content_SpellProperties[i].toLowerCase() == $scope.Properties[0].Value.Text.value.toLowerCase()) {
                        toaster.pop('Error', "Please enter unique Spell Name");
                        return;
                    }
                }
            }
            $uibModalInstance.close($scope.Properties);
		}
		//Upload file
		$scope.OpenFile = function () {
			console.log("Open and upload file...");
			$("#newRulesetImage").click();
			//var input = $('input[type=file]');//.val();
			//input.click();
			//return false;
		}

		$scope.ItemImageUpload = function (input) {
			console.log("File Input: ", input);
			$scope.showimagebtns = false;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					//console.log("e.target.result: "+e.target.result);
					$scope.$apply(function () {

						$scope.Properties[1].Value.Image.image = e.target.result;
					});


				};
				reader.readAsDataURL(input.files[0]);

			}
		}
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }
    }]);

    module.controller('dialogCreateAbility', ['$scope', '$uibModalInstance', 'data', 'toaster', 'rulesetService', function ($scope, $uibModalInstance, data, toaster, rulesetService) {
        $scope.OperationTypeMode = data.AbilityMode;
        $scope.Content_AbilityProperties = data.Content_AbilityProperties;
        $scope.Properties = data.scope;
        $scope.tabName = data.tabName;
        $scope.buttontext = data.btntext;
        $scope.ShowAssociatedSpells = false;
		$scope.ShowAssociatedAbilities = false;
		$scope.showimagebtns = false;
		//Upload file
		$scope.OpenFile = function () {
			console.log("Open and upload file...");
			$("#newRulesetImage").click();
			//var input = $('input[type=file]');//.val();
			//input.click();
			//return false;
		}

		$scope.ItemImageUpload = function (input) {
			console.log("File Input: ", input);
			$scope.showimagebtns = false;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					//console.log("e.target.result: "+e.target.result);
					$scope.$apply(function () {

						$scope.Properties[1].Value.Image.image = e.target.result;
					});


				};
				reader.readAsDataURL(input.files[0]);

			}
		}
        $scope.Create = function () {
            if ($scope.Content_AbilityProperties != undefined) {
                for (var i = 0; i < $scope.Content_AbilityProperties.length; i++) {
                    if ($scope.Content_AbilityProperties[i].toLowerCase() == $scope.Properties[0].Value.Text.value.toLowerCase()) {
                        toaster.pop('Error', "Please enter unique Ability Name");
                        return;
                    }
                }
            }
            for (var i = 0; i < $scope.Properties.length; i++) {
                if ($scope.Properties[i].TypeId == 2) {
                    $scope.Properties[i].Value.Choices.SelectedChoiceName = $scope.Properties[i].Value.Choices.selectedchoice.ChoiceName;
                    $scope.Properties[i].Value.Choices.selectedchoice = "";
                }
            }
            $uibModalInstance.close($scope.Properties);
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }
    }]);

    module.controller('ShowAllTileContent', ['$scope', '$uibModalInstance', 'data', 'rulesetService', function ($scope, $uibModalInstance, data, rulesetService) {

        $scope.Content = data.scope;
        $scope.ShowAssociatedSpells = false;
        $scope.ShowAssociatedAbilities = false;
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }
    }]);

    module.controller('dialogTabReorder', ['$scope', '$uibModalInstance', '$filter', 'data', function ($scope, $uibModalInstance, $filter, data) {
        $scope.temp = data;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('Canceled');
        };

        $scope.save = function () {
            $uibModalInstance.close($scope.items);
        };

        $scope.hitEnter = function (evt) {
            if (evt.which === 13 && !(angular.equals($scope.name, null) || angular.equals($scope.name, '')))
                $scope.save();
        };

        (function () {

            var copy = (data.items || []).slice();

            data.sorter(copy);
            $scope.items = copy;
        })();

    }]);
   
    module.controller('dialogCopyCoreStat', ['$scope', '$uibModalInstance', 'data', 'toaster', 'rulesetService', function ($scope, $uibModalInstance, data, toaster, rulesetService) {
        $scope.OperationTypeMode = data.CoreStatMode;
        $scope.CoreStatProperties = data.scope;
        $scope.CoreStatsInGrid = data.CoreStatsInGrid;
        $scope.CoreStatsNameInGrid = data.CoreStatsNameInGrid;
        $scope.tabName = data.tabname;
        $scope.copyitem = data.item;
        $scope.count = data.count;
        $scope.buttontext = data.btntext;
        $scope.IsButtonDisabled = data.IsenableBtn;
        $scope.OperationTypeMode = data.CoreStatMode;
        if ($scope.OperationTypeMode == "Edit") {
            $scope.DisablecopyFields = false;
            $scope.DisableNameField = true;
        }
        else if ($scope.OperationTypeMode == "Copy") {
            $scope.CoreStatProperties.Name = "";
            $scope.DisablecopyFields = true;
            $scope.DisableNameField = false;
        }
        if ($scope.CoreStatProperties.TypeId == 2) {
            $scope.ShowChoices = true;
            $scope.ShowCalculation = false;
            $scope.ShowValueandSubvalue = false;
            $scope.ShowCurrentMaxValue = false;
        }
        if ($scope.CoreStatProperties.TypeId == 16) {
            $scope.ShowCalculation = true;
            $scope.ShowChoices = false;
            $scope.ShowValueandSubvalue = false;
            $scope.ShowCurrentMaxValue = false;
            $scope.Formula = $scope.CoreStatProperties.Value.Calculation.formulae;
        }
        if ($scope.CoreStatProperties.TypeId == 5) {
            $scope.ValSub = $scope.CoreStatProperties.ValSub;
            $scope.ShowCalculation = false;
            $scope.ShowChoices = false;
            $scope.ShowValueandSubvalue = true;
            $scope.IsButtonDisabled = false;
            $scope.ShowCurrentMaxValue = false;
        }
        if ($scope.CoreStatProperties.TypeId == 6) {
            $scope.CurrentMaxVal = $scope.CoreStatProperties.CurrentMaxVal;
            $scope.ShowCalculation = false;
            $scope.ShowChoices = false;
            $scope.ShowValueandSubvalue = false;
            $scope.IsButtonDisabled = false;
            $scope.ShowCurrentMaxValue = true;
        }

        rulesetService.GetTypes().then(function (data) {
            if (data.data.StatusCode == 200) {
                $scope.Types = data.data.PayLoad;
                $scope.weight = data.data.PayLoad[6].Units
                $scope.Height = data.data.PayLoad[8].Units
                $scope.Volume = data.data.PayLoad[9].Units
            }
            else {
                if (data.data.StatusCode == 400) {
                    if (data.data.ShowToUser == true) {
                        alert(data.data.ErrorMessage);
                    }
                }
            }
        });
        $scope.addChoice = function () {
            $scope.CoreStatProperties.Value.Choices.choices.push({ ChoiceName: '' });
        }
        $scope.RemoveChoice = function (choice) {
            var idx = $scope.CoreStatProperties.Value.Choices.choices.indexOf(choice);
            $scope.CoreStatProperties.Value.Choices.choices.splice(idx, 1);
        }
        $scope.CoreStatOnChange = function () {
            if ($scope.CoreStatProperties.TypeId == undefined) {
                $scope.IsButtonDisabled = true;
                $scope.ShowChoices = false;
                $scope.ShowCalculation = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = false;
            }
            if ($scope.CoreStatProperties.TypeId == 2) {
                $scope.ShowChoices = true;
                $scope.IsButtonDisabled = false;
                $scope.ShowCalculation = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = false;
            }
            else {
                $scope.ShowChoices = false;
            }
            if ($scope.CoreStatProperties.TypeId == 16) {
                $scope.ShowCalculation = true;
                $scope.IsButtonDisabled = false;
                $scope.ShowChoices = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = false;
            }
            else {
                $scope.ShowCalculation = false;
            }
            if ($scope.CoreStatProperties.TypeId == 5) {
                $scope.ShowCalculation = false;
                $scope.IsButtonDisabled = false;
                $scope.ShowChoices = false;
                $scope.ShowValueandSubvalue = true;
                $scope.ShowCurrentMaxValue = false;
            }
            else {
                $scope.ShowValueandSubvalue = false;
            }
            if ($scope.CoreStatProperties.TypeId == 6) {
                $scope.ShowCalculation = false;
                $scope.IsButtonDisabled = false;
                $scope.ShowChoices = false;
                $scope.ShowValueandSubvalue = false;
                $scope.ShowCurrentMaxValue = true;
            }
            else {
                $scope.ShowCurrentMaxValue = false;
            }
        }
        $scope.AddValueSubvalue = function (value) {
            if (value == 'Value') {
                $scope.valueName = value;
            }
            else if (value == 'SubValue') {
                $scope.valueName = value;
            }
        }
        $scope.Addcurrentmax = function (value) {
            if (value == 'CurrentValue') {
                $scope.CurrentMaxvalue = value;
            }
            else if (value == 'MaxValue') {
                $scope.CurrentMaxvalue = value;
            }
        }
      
        $scope.ExistCoreStatOnChange = function () {
            if ($scope.CoreStatsInGrid.Name != undefined) {
                var a = "[abc]";
                a = a.replace("abc", $scope.CoreStatsInGrid.Name.Name);
                $scope.tempVar = a;
            }
            else {
                if ($scope.Formula == "" || $scope.Formula == undefined) {
                    $scope.Formula = "";
                }
                else {
                    $scope.Formula = $scope.Formula;
                }
            }
        }
        $scope.CreateFormula = function () {
            if ($scope.Formula == "" || $scope.Formula == undefined) {
                $scope.Formula = $scope.tempVar;
            }
            else if ($scope.Formula != "") {
                $scope.Formula = $scope.Formula + "" + $scope.tempVar;
            }
        }
        
        $scope.SaveCorestat = function () {
            //$scope.CoreStatsNameInGrid = rulesetDataShareService.getRulesetCoreStatData();
            //$scope.CoreStatsNameInGrid = $scope.CoreStatsNameInGrid;
            if ($scope.CoreStatProperties.Name == "" || $scope.CoreStatProperties.Name === undefined || $scope.CoreStatProperties.Name == null) {
                toaster.pop('error', "Please enter CoreStat Name");
                return;
            }
            else if ($scope.CoreStatProperties.TypeId == 0 || $scope.CoreStatProperties.TypeId === undefined || $scope.CoreStatProperties.TypeId == "") {
                toaster.pop('error', "Please Select CoreStat Type");
                return;
            }
            else if ($scope.CoreStatsNameInGrid != undefined) {
                for (var i = 0; i < $scope.CoreStatsNameInGrid.length; i++) {
                    if ($scope.CoreStatsNameInGrid[i].TypeId == 5) {
                      
                    }
                    else if ($scope.CoreStatsNameInGrid[i].TypeId == 6) {
                      
                    }
                  
                }
            }
            for (var k = 0; k < $scope.Types.length; k++) {
                $scope.valueName = $scope.ValSub;
                $scope.CurrentMaxvalue = $scope.CurrentMaxVal;
                if ($scope.Types[k].TypeId == $scope.CoreStatProperties.TypeId) {
                    $scope.CoreStatProperties.TypeName = $scope.Types[k].Name;
                    if (($scope.Types[k].TypeId == 16) && ($scope.CoreStatProperties.TypeId == 16)) {
                        $scope.CoreStatProperties.Value.Calculation.formulae = $scope.Formula;
                    }
                   
                }
                //}

            }
            $uibModalInstance.close($scope.CoreStatProperties);
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('dialogCopyItem', ['$scope', '$uibModalInstance', 'data', 'toaster', 'rulesetService', 'characterService', 'dialogs', function ($scope, $uibModalInstance, data, toaster, rulesetService, characterService, dialogs) {


        $scope.AssociatedSpells = data.AssociatedSpells;
        $scope.AssociatedAbilities = data.AssociatedAbilities;

        var Spells = data.Spells;
        var Abilities = data.Abilities;
        $scope.OperationTypeMode = data.ItemMode;
        $scope.Content_ItemProperties = data.Content_ItemProperties;
        $scope.Properties = data.scope;
        $scope.contentType = data.contentType
        $scope.tabName = data.tabName;
        $scope.copyitem = data.item;
        $scope.count = data.count;
        $scope.buttontext = data.btntext;
        $scope.IsBtnDisabled = data.IsBtnDisabled;
        $scope.ShowAssociatedSpells = true;
        $scope.ShowAssociatedAbilities = true;
        $scope.SelectAssociatedSpells = data.SelectAssociatedSpells ;
		$scope.SelectAssociatedAbilities = data.SelectAssociatedAbilities;
		//Upload file
		$scope.OpenFile = function () {
			console.log("Open and upload file...");
			$("#newRulesetImage").click();
			//var input = $('input[type=file]');//.val();
			//input.click();
			//return false;
		}

		$scope.ItemImageUpload = function (input) {
			console.log("File Input: ", input);
			$scope.showimagebtns = false;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					//console.log("e.target.result: "+e.target.result);
					$scope.$apply(function () {

						$scope.Properties[1].Value.Image.image = e.target.result;
					});


				};
				reader.readAsDataURL(input.files[0]);

			}
		}
        $scope.Create = function () {
            if ($scope.Content_ItemProperties != undefined) {
                for (var i = 0; i < $scope.Content_ItemProperties.length; i++) {
                    if ($scope.Content_ItemProperties[i].toLowerCase() == $scope.Properties[0].Value.Text.value.toLowerCase()) {
                        //toaster.pop('Error', "Please enter unique Item Name");
                        alert("Please enter unique Item Name");
                        return;
                    }
                }
            }

            var createItemResult = {};
           
            createItemResult.ItemProperties = $scope.Properties;
            createItemResult.AssociatedSpells = $scope.AssociatedSpells;
            createItemResult.AssociatedAbilities = $scope.AssociatedAbilities;

            $uibModalInstance.close(createItemResult);
        }

        $scope.OpenAssociatedSpells = function () {
            var dlg = dialogs.create('/views/dialogs/AssociatedSpells.html', 'dialogAssociatedSpells',
                { scope: Spells, associatedspells: $scope.AssociatedSpells }
            );

            dlg.result.then(function (res) {
                $scope.AssociatedSpells = res;
            });
        }

        $scope.OpenAssociatedAbilities = function () {
            var dlg = dialogs.create('/views/dialogs/AssociatedAbilities.html', 'dialogAssociatedAbilities',
                { scope: Abilities, associatedabilities: $scope.AssociatedAbilities }
            );

            dlg.result.then(function (res) {
                $scope.AssociatedAbilities = res;
            });
        }

        $scope.DropItem = function () {
            if ($scope.Properties[0].CharacterItemId != undefined) {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    'Are you sure you want to delete this Item, "' + $scope.Properties[0].Value.Text.value + '", and all associated pages, tabs, and tiles?',
                    {}
                );

                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            var deleteitem = characterService.DeleteCharacterContent($scope.Properties[0].CharacterItemId).then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.Properties.Action = "Delete";
                                    $uibModalInstance.close($scope.Properties);
                                }


                            })
                        }

                    })
            }
            else if ($scope.Properties[0].CharacterSpellValueId != undefined) {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    'Are you sure you want to delete this Spell, "' + $scope.Properties[0].Value.Text.value + '"?',
                    {}
                );

                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            var deletespell = characterService.DeleteCharacterSpellContent($scope.Properties[0].CharacterSpellId).then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.Properties.Action = "Delete";
                                    $uibModalInstance.close($scope.Properties);
                                }


                            })
                        }

                    })
            }
            else if ($scope.Properties[0].CharacterAbilityValueId != undefined) {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    'Are you sure you want to delete this Ability, "' + $scope.Properties[0].Value.Text.value + '",?',
                    {}
                );

                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            var deleteability = characterService.DeleteCharacterAbilityContent($scope.Properties[0].CharacterAbilityId).then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.Properties.Action = "Delete";
                                    $uibModalInstance.close($scope.Properties);
                                }

                            });
                        }

                    });
            }


            //$uibModalInstance.close($scope.Properties);
        }
        $scope.EditItem = function () {
            $scope.pageName = "Editing Item";
            $scope.buttontext = "Update";
            $scope.IsButtonDisabled = true;
            $scope.isBtnShow = true;
            var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                { scope: $scope.Properties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow }

            );

            dlg.result.then(function (res) {
                $scope.Properties = res;
                $scope.Properties.Action = "Edit";
                $uibModalInstance.close($scope.Properties);
            });
        }
        $scope.DuplicateItem = function () {
            $scope.pageName = "Copying Item";
            $scope.buttontext = "Copy";
            $scope.IsButtonDisabled = true;
            $scope.isBtnShow = true;
            var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                { scope: item.CharacterItemsValues, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow }

            );
            dlg.result.then(function (res) {
                $scope.Properties = res;
                $scope.Properties.Action = "Copy";
                $uibModalInstance.close($scope.Properties);
            });

        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }
    }]);
    module.controller('dialogCopySpell', ['$scope', '$uibModalInstance', 'data', 'toaster', 'rulesetService', function ($scope, $uibModalInstance, data, toaster, rulesetService) {
        $scope.OperationTypeMode = data.SpellMode;
        $scope.Content_SpellProperties = data.Content_SpellProperties;
        $scope.Properties = data.scope;
        $scope.tabName = data.tabName;
        $scope.copyitem = data.item;
        $scope.count = data.count;
        $scope.buttontext = data.btntext;

        $scope.SelectAssociatedSpells = false;
		$scope.ShowAssociatedAbilities = false;
		$scope.showimagebtns = false;
		//Upload file
		$scope.OpenFile = function () {
			console.log("Open and upload file...");
			$("#newRulesetImage").click();
			//var input = $('input[type=file]');//.val();
			//input.click();
			//return false;
		}

		$scope.ItemImageUpload = function (input) {
			console.log("File Input: ", input);
			$scope.showimagebtns = false;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					//console.log("e.target.result: "+e.target.result);
					$scope.$apply(function () {

						$scope.Properties[1].Value.Image.image = e.target.result;
					});


				};
				reader.readAsDataURL(input.files[0]);

			}
		}
        $scope.Create = function () {
            if ($scope.Content_SpellProperties != undefined) {
                for (var i = 0; i < $scope.Content_SpellProperties.length; i++) {
                    if ($scope.Content_SpellProperties[i].toLowerCase() == $scope.Properties[0].Value.Text.value.toLowerCase()) {
                        //toaster.pop('Error', "Please enter unique Spell Name");
                        toaster.pop('error', 'Please enter unique Spell Name');

                        return;
                    }
                }
            }
            $uibModalInstance.close($scope.Properties);
        }


        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('dialogCopyAbility', ['$scope', '$uibModalInstance', 'data', 'toaster', 'rulesetService', function ($scope, $uibModalInstance, data, toaster, rulesetService) {
        $scope.OperationTypeMode = data.AbilityMode;
        $scope.Content_AbilityProperties = data.Content_AbilityProperties;
        $scope.Properties = data.scope;
        $scope.tabName = data.tabName;
        $scope.copyitem = data.item;
        $scope.count = data.count;
        $scope.buttontext = data.btntext;

        $scope.SelectAssociatedSpells = false;
		$scope.ShowAssociatedAbilities = false;
		$scope.showimagebtns = false;
		//Upload file
		$scope.OpenFile = function () {
			console.log("Open and upload file...");
			$("#newRulesetImage").click();
			//var input = $('input[type=file]');//.val();
			//input.click();
			//return false;
		}

		$scope.ItemImageUpload = function (input) {
			console.log("File Input: ", input);
			$scope.showimagebtns = false;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					//console.log("e.target.result: "+e.target.result);
					$scope.$apply(function () {

						$scope.Properties[1].Value.Image.image = e.target.result;
					});


				};
				reader.readAsDataURL(input.files[0]);

			}
		}
        $scope.Create = function () {
            if ($scope.Content_AbilityProperties != undefined) {
                for (var i = 0; i < $scope.Content_AbilityProperties.length; i++) {
                    if ($scope.Content_AbilityProperties[i].toLowerCase() == $scope.Properties[0].Value.Text.value.toLowerCase()) {
                        //toaster.pop('Error', "Please enter unique Ability Name");
                        //alert("Please enter unique Ability Name");
                        toaster.pop('error', "Please enter unique Ability Name");
                        return;
                    }
                }
            }
            $uibModalInstance.close($scope.Properties);
        }


        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('ShowItems', ['$scope', '$rootScope', '$uibModalInstance', 'data', 'characterService', 'dialogs', function ($scope, $rootScope, $uibModalInstance, data, characterService, dialogs) {

        $scope.Properties = data.scope;
        $scope.EditItem = function (item, count, num) {
            if (num == 1) {
                $scope.pageName = "Editing Item";
                $scope.buttontext = "Update";
                $scope.IsButtonDisabled = true;
                $scope.isBtnShow = true;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                    { scope: item.CharacterItemsValues, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Fullscope: item }

                );

                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        if (count == 0) {
                            $scope.RemainingItemData = [];
                            for (var k = 0; k < $scope.Properties.length; k++) {
                                if (k != 0) {
                                    $scope.RemainingItemData.push($scope.Properties[k].CharacterItemsValues);

                                }
                            }
                            var ItemProperties = { "CharacterItemsValues": res };
                            $scope.Properties.splice(count);
                            $scope.Properties.push(ItemProperties);
                            for (var j = 0; j < $scope.RemainingItemData.length; j++) {
                                var RemainingItemProperties = { "CharacterItemsValues": $scope.RemainingItemData[j] };
                                $scope.Properties.push(RemainingItemProperties);
                            }

                        }
                        else {
                            var ItemProperties = { "CharacterItemsValues": res };
                            $scope.Properties.splice(count);
                            $scope.Properties.push(ItemProperties);
                        }
                    }
                });
            }
            else if (num == 2) {
                $scope.pageName = "Editing Spell";
                $scope.buttontext = "Update";
                $scope.isBtnShow = true;
                //var indexcount = count - 1;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                    { scope: item.CharacterSpellsValues, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullSpellscope: item }

                );

                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        if (count == 0) {
                            $scope.RemainingSpellData = [];
                            for (var k = 0; k < $scope.Properties.length; k++) {
                                if (k != 0) {
                                    $scope.RemainingSpellData.push($scope.Properties[k].CharacterSpellsValues);

                                }
                            }
                            var SpellProperties = { "CharacterSpellsValues": res };
                            $scope.Properties.splice(count);
                            $scope.Properties.push(SpellProperties);
                            for (var j = 0; j < $scope.RemainingSpellData.length; j++) {
                                var RemainingSpellProperties = { "CharacterSpellsValues": $scope.RemainingSpellData[j] };
                                $scope.Properties.push(RemainingSpellProperties);
                            }

                        }
                        else {
                            var SpellProperties = { "CharacterSpellsValues": res };
                            $scope.Properties.splice(count);
                            $scope.Properties.push(SpellProperties);
                        }
                    }
                });
            }
            else if (num == 3) {
                $scope.pageName = "Editing Ability";
                $scope.buttontext = "Update";
                $scope.isBtnShow = true;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                    { scope: item.CharacterAbilitiesValues, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullAbilityScope: item }

                );

                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        if (count == 0) {
                            $scope.RemainingAbilityData = [];
                            for (var k = 0; k < $scope.Properties.length; k++) {
                                if (k != 0) {
                                    $scope.RemainingAbilityData.push($scope.Properties[k].CharacterAbilitiesValues);
                                }
                            }
                            var AbilityProperties = { "CharacterAbilitiesValues": res };
                            $scope.Properties.splice(count);
                            $scope.Properties.push(AbilityProperties);
                            for (var j = 0; j < $scope.RemainingAbilityData.length; j++) {
                                var RemainingAbilityProperties = { "CharacterAbilitiesValues": $scope.RemainingAbilityData[j] };
                                $scope.Properties.push(RemainingAbilityProperties);
                            }
                        }
                        else {
                            var AbilityProperties = { "CharacterAbilitiesValues": res };
                            $scope.Properties.splice(count);
                            $scope.Properties.push(AbilityProperties);
                        }
                    }

                });
            }


        };
        $scope.CopyItem = function (item, index, num) {
            if (num == 1) {
                $scope.pageName = "Copying Item";
                $scope.buttontext = "Copy";
                $scope.IsButtonDisabled = true;
                $scope.isBtnShow = true;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                    { scope: item.CharacterItemsValues, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Fullscope: item }

                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        var ItemProperties = { "CharacterItemsValues": res };
                        $scope.Properties.push(ItemProperties);
                    }
                });
            }
            else if (num == 2) {
                $scope.pageName = "Copying Spell";
                $scope.buttontext = "Copy";
                $scope.isBtnShow = true;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                    { scope: item.CharacterSpellsValues, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullSpellscope: item }

                );

                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        var SpellProperties = { "CharacterSpellsValues": res };
                        $scope.Properties.push(SpellProperties);

                    }

                });
            }
            else if (num == 3) {
                $scope.pageName = "Copying Ability";
                $scope.buttontext = "Copy";
                $scope.isBtnShow = true;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                    { scope: item.CharacterAbilitiesValues, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullAbilityScope: item }

                );

                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        var AbilityProperties = { "CharacterAbilitiesValues": res };
                        $scope.Properties.push(AbilityProperties);
                    }


                });
            }

        };
        $scope.ShowAllItemProperties = function (item, count) {
            var dlg = dialogs.create('/views/dialogs/characteritemcontent.html', 'dialogCopyItem',
                { scope: item.CharacterItemsValues }
            );
            dlg.result.then(function (res) {
                if (res.Action == "Delete") {
                    var index = -1;
                    var deleteitem = eval($scope.Properties);
                    //deleteitem[i].CharacterItemsValues.Action = "Delete";
                    for (var i = 0; i < deleteitem.length; i++) {
                        if (deleteitem[i].CharacterItemsValues === res) {
                            index = i;
                            break;
                        }
                    }
                    $scope.Properties.splice(index, 1);
                    //if (index === -1) {
                    //    alert("Something gone wrong");
                    //}

                }
                else if (res.Action == "Edit") {
                    if (count == 0) {
                        $scope.RemainingItemData = [];
                        for (var k = 0; k < $scope.Properties.length; k++) {
                            if (k != 0) {
                                $scope.RemainingItemData.push($scope.Properties[k].CharacterItemsValues);

                            }
                        }
                        var ItemProperties = { "CharacterItemsValues": res };
                        $scope.Properties.splice(count);
                        $scope.Properties.push(ItemProperties);
                        for (var j = 0; j < $scope.RemainingItemData.length; j++) {
                            var RemainingItemProperties = { "CharacterItemsValues": $scope.RemainingItemData[j] };
                            $scope.Properties.push(RemainingItemProperties);
                        }

                    }
                    else {
                        var ItemProperties = { "CharacterItemsValues": res };
                        $scope.Properties.splice(count);
                        $scope.Properties.push(ItemProperties);
                    }
                }
                else if (res.Action == "Copy") {
                    var ItemProperties = { "CharacterItemsValues": res };
                    $scope.Properties.push(ItemProperties);
                }
            });
        }
        $scope.ShowAllSpellProperties = function (item, count) {
            var dlg = dialogs.create('/views/dialogs/characterspellcontent.html', 'dialogCopyItem',
                { scope: item.CharacterSpellsValues }
            );
            dlg.result.then(function (res) {
                if (res.Action == "Delete") {
                    var index = -1;
                    var deletespell = eval($scope.Properties);
                    //deletespell[i].CharacterSpellsValues.Action = "Delete";
                    for (var i = 0; i < deletespell.length; i++) {
                        if (deletespell[i].CharacterSpellsValues === res) {
                            index = i;
                            break;
                        }
                    }
                    $scope.Properties.splice(index, 1);
                    //if (index === -1) {
                    //    alert("Something gone wrong");
                    //}

                }
                else if (res.Action == "Edit") {
                    if (count == 0) {
                        $scope.RemainingSpellData = [];
                        for (var k = 0; k < $scope.Properties.length; k++) {
                            if (k != 0) {
                                $scope.RemainingSpellData.push($scope.Properties[k].CharacterSpellsValues);

                            }
                        }
                        var SpellProperties = { "CharacterSpellsValues": res };
                        $scope.Properties.splice(count);
                        $scope.Properties.push(SpellProperties);
                        for (var j = 0; j < $scope.RemainingSpellData.length; j++) {
                            var RemainingSpellProperties = { "CharacterSpellsValues": $scope.RemainingSpellData[j] };
                            $scope.Properties.push(RemainingSpellProperties);
                        }

                    }
                    else {
                        var SpellProperties = { "CharacterSpellsValues": res };
                        $scope.Properties.splice(count);
                        $scope.Properties.push(SpellProperties);
                    }
                }
                else if (res.Action == "Copy") {
                    var SpellProperties = { "CharacterSpellsValues": res };
                    $scope.Properties.push(SpellProperties);
                }
            });
        }
        $scope.ShowAllAbilityProperties = function (item, count) {
            var dlg = dialogs.create('/views/dialogs/characterabilitycontent.html', 'dialogCopyItem',
                { scope: item.CharacterAbilitiesValues }
            );
            dlg.result.then(function (res) {
                if (res.Action == "Delete") {
                    var index = -1;
                    var deleteability = eval($scope.Properties);
                    // deleteability[i].CharacterAbilitiesValues.Action = "Delete";
                    for (var i = 0; i < deleteability.length; i++) {
                        if (deleteability[i].CharacterAbilitiesValues === res) {
                            index = i;
                            break;
                        }
                    }
                    $scope.Properties.splice(index, 1);
                    //if (index === -1) {
                    //    alert("Something gone wrong");
                    //}

                }
                else if (res.Action == "Edit") {
                    if (count == 0) {
                        $scope.RemainingAbilityData = [];
                        for (var k = 0; k < $scope.Properties.length; k++) {
                            if (k != 0) {
                                $scope.RemainingAbilityData.push($scope.Properties[k].CharacterAbilitiesValues);

                            }
                        }
                        var AbilityProperties = { "CharacterAbilitiesValues": res };
                        $scope.Properties.splice(count);
                        $scope.Properties.push(AbilityProperties);
                        for (var j = 0; j < $scope.RemainingAbilityData.length; j++) {
                            var RemainingAbilityProperties = { "CharacterAbilitiesValues": $scope.RemainingAbilityData[j] };
                            $scope.Properties.push(RemainingAbilityProperties);
                        }

                    }
                    else {
                        var AbilityProperties = { "CharacterAbilitiesValues": res };
                        $scope.Properties.splice(count);
                        $scope.Properties.push(AbilityProperties);
                    }
                }
                else if (res.Action == "Copy") {
                    var AbilityProperties = { "CharacterAbilitiesValues": res };
                    $scope.Properties.push(AbilityProperties);
                }
            });
        }
        $scope.Removeitem = function (item, Num) {
            if (Num == 1) {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    'Are you sure you want to delete this Item, "' + item.CharacterItemsValues[0].Value.Text.value + '", and all associated pages, tabs, and tiles?',
                    {}
                );

                dlg.result.then(
                    function (res) {

                    
                        if (res == "yes") {
                            var deleteitem = characterService.DeleteCharacterContent(item.CharacterItemsValues[0].CharacterItemId).then(function (data) {
                              
                                if (data.data.StatusCode == 200) {
                                    var index = -1;
                                    var deleteitem = eval($scope.Properties);
                                    for (var i = 0; i < deleteitem.length; i++) {
                                        if (deleteitem[i].CharacterItemsValues === item.CharacterItemsValues) {
                                            index = i;
                                            break;
                                        }
                                    }
                                    $scope.Properties.splice(index, 1);

                                  
                                }

                               
                            })
                        }

                    })

            }
            else if (Num == 2) {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    'Are you sure you want to delete this Spell, "' + item.CharacterSpellsValues[0].Value.Text.value + '",?',
                    {}
                );

                dlg.result.then(
                    function (res) {
                       
                        if (res == "yes") {
                            var deleteitem = characterService.DeleteCharacterSpellContent(item.CharacterSpellsValues[0].CharacterSpellId).then(function (data) {
                               
                                if (data.data.StatusCode == 200) {
                                    var index = -1;
                                    var deletespell = eval($scope.Properties);
                                    for (var i = 0; i < deletespell.length; i++) {
                                        if (deletespell[i].CharacterSpellsValues === item.deletespell) {
                                            index = i;
                                            break;
                                        }
                                    }
                                    $scope.Properties.splice(index, 1);
                                  
                                }

                                //$uibModalInstance.close($scope.Properties);
                            })
                        }

                    })
            }
            else if (Num == 3) {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    'Are you sure you want to delete this Ability, "' + item.CharacterAbilitiesValues[0].Value.Text.value + '",?',
                    {}
                );

                dlg.result.then(
                    function (res) {
                        
                        if (res == "yes") {
                            var deleteitem = characterService.DeleteCharacterAbilityContent(item.CharacterAbilitiesValues[0].CharacterAbilityId).then(function (data) {
                               
                                if (data.data.StatusCode == 200) {
                                    var index = -1;
                                    var deleteability = eval($scope.Properties);
                                    for (var i = 0; i < deleteability.length; i++) {
                                        if (deleteability[i].CharacterAbilitiesValues === item.deleteability) {
                                            index = i;
                                            break;
                                        }
                                    }
                                    $scope.Properties.splice(index, 1);
                                   
                                }

                                //$uibModalInstance.close($scope.Properties);
                            })
                        }

                    })
            }

            //$uibModalInstance.close($scope.Properties);
        }

        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('dialogEditCharacterItem', ['$scope', '$uibModalInstance', 'data', 'characterService', 'dialogs', 'rulesetDataShareService', function ($scope, $uibModalInstance, data, characterService, dialogs, rulesetDataShareService) {
        debugger;
        $scope.AssociatedSpells = data.AssocSpells;
        $scope.AssociatedAbilities = data.AssocAbilities;

        $scope.ShowAssociatedSpells = true;
        $scope.ShowAssociatedAbilities = true;

        if (data.tabName == "Editing Spell" || data.tabName == "Copying Spell" || data.tabName == "Editing Ability" || data.tabName == "Copying Ability") {
            $scope.ShowAssociatedSpells = false;
            $scope.ShowAssociatedAbilities = false;
        }

        $scope.Properties = data.scope;
        $scope.Items = data.Fullscope;
        $scope.Spells = data.FullSpellscope;
        $scope.Abilities = data.FullAbilityScope;
        $scope.tabName = data.tabName;
        $scope.copyitem = data.item;
        $scope.count = data.count;
        $scope.buttontext = data.btntext;
        $scope.IsBtnDisabled = data.IsBtnDisabled;
        $scope.OperationTypeMode = data.OperationTypeMode;
        $scope.SelectAssociatedSpells = data.SelectAssociatedSpells;
        $scope.SelectAssociatedAbilities = data.SelectAssociatedAbilities;
        $scope.CharacterId = data.CharacterId;

        $scope.Create = function () {
          
            $("#loading").css("display", "block");
            $scope.OperationTypeMode = "Create";
            if ($scope.Properties[0].CharacterItemId != undefined) {
                if ($scope.AssociatedSpellsChanged != undefined) {
                    $scope.Items.AssociatedSpells = $scope.AssociatedSpellsChanged
                }
                if ($scope.AssociatedAbilitiesChanged != undefined) {
                    $scope.Items.AssociatedAbilities = $scope.AssociatedAbilitiesChanged
                }
                if ($scope.Items == undefined) {

                    var Items = {
                        CharacterItemId: $scope.Properties[0].CharacterItemId,
                        CharacterItemsValues: $scope.Properties
                    };
                    $scope.Items = Items;
                }
                else {
                    $scope.Items.CharacterItemsValues = $scope.Properties;
                }
            }
            else if ($scope.Properties[0].CharacterSpellId != undefined) {
                if ($scope.Spells == undefined) {
                    var Spells = {
                        CharacterSpellId: $scope.Properties[0].CharacterSpellId,
                        CharacterSpellsValues: $scope.Properties
                    };
                    $scope.Spells = Spells;
                }
                else {
                    $scope.Spells.CharacterSpellsValues = $scope.Properties;
                }
            }
            else if ($scope.Properties[0].CharacterAbilityId != undefined) {
                if ($scope.Abilities == undefined) {
                    var Abilities = {
                        CharacterAbilityId: $scope.Properties[0].CharacterAbilityId,
                        CharacterAbilitiesValues: $scope.Properties
                    };
                    $scope.Abilities = Abilities;
                }
                else {
                    $scope.Abilities.CharacterAbilitiesValues = $scope.Properties;
                }
            }
            if ($scope.buttontext == "Update" && $scope.Items != undefined) {
                var CharacterContent = {
                    CharacterItem: $scope.Items,
                    CharacterSpell: null,
                    CharacterAbility: null
                };

                var edititem = characterService.EditCharacterContent(CharacterContent).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $uibModalInstance.close(data.data.PayLoad.CharacterItem);
                        $("#loading").fadeOut("slow");
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                        }
                    }
                })
            }
            else if ($scope.buttontext == "Copy" && $scope.Items != undefined) {
                var CharacterContent = {
                    CharacterItem: $scope.Items,
                    CharacterSpell: null,
                    CharacterAbility: null
                };
                var copyitem = characterService.CopyCharacterContent(CharacterContent).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $uibModalInstance.close(data.data.PayLoad.CharacterItem);
                        $("#loading").fadeOut("slow");
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                        }
                    }
                })
            }
            else if ($scope.buttontext == "Update" && $scope.Spells != undefined) {
                var CharacterContent = {
                    CharacterItem: null,
                    CharacterSpell: $scope.Spells,
                    CharacterAbility: null
                };
                var editspell = characterService.EditCharacterContent(CharacterContent).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $uibModalInstance.close(data.data.PayLoad.CharacterSpell);
                        $("#loading").fadeOut("slow");
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                        }
                    }
                })
            }
            else if ($scope.buttontext == "Copy" && $scope.Spells != undefined) {
                var CharacterContent = {
                    CharacterItem: null,
                    CharacterSpell: $scope.Spells,
                    CharacterAbility: null
                };
                var copyspell = characterService.CopyCharacterContent(CharacterContent).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        //$scope.Properties = data.data.PayLoad.CharacterSpell.CharacterSpellsProperties;
                        $uibModalInstance.close(data.data.PayLoad.CharacterSpell);
                        $("#loading").fadeOut("slow");
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                        }
                    }
                })
            }

            else if ($scope.buttontext == "Update" && $scope.Abilities != undefined) {
                var CharacterContent = {
                    CharacterItem: null,
                    CharacterSpell: null,
                    CharacterAbility: $scope.Abilities
                };
                var editability = characterService.EditCharacterContent(CharacterContent).then(function (data) {
                    if (data.data.StatusCode == 200) {
                      
                        $uibModalInstance.close(data.data.PayLoad.CharacterAbility);
                        $("#loading").fadeOut("slow");
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                        }
                    }
                })
            }
            else if ($scope.buttontext == "Copy" && $scope.Abilities != undefined) {
                var CharacterContent = {
                    CharacterItem: null,
                    CharacterSpell: null,
                    CharacterAbility: $scope.Abilities
                };
                var copyability = characterService.CopyCharacterContent(CharacterContent).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        //$scope.Properties = data.data.PayLoad.CharacterAbility.CharacterAbilitiesProperties;
                        $uibModalInstance.close(data.data.PayLoad.CharacterAbility);
                        $("#loading").fadeOut("slow");
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                        }
                    }
                })
            }
            //$uibModalInstance.close($scope.Properties);
        }

        $scope.OpenAssociatedSpells = function () {
            var Spells = rulesetDataShareService.getLayoutSpellInventoryData();
            if (angular.equals({}, Spells) == false) {
                var dlg = dialogs.create('/views/dialogs/CharacterAssociatedSpells.html', 'dialogCharacterAssociatedSpells',
                    { scope: Spells.CharacterSpells, associatedspells: $scope.AssociatedSpells }
                );
                dlg.result.then(function (res) {
                    $scope.AssociatedSpellsChanged = res;
                });
            }
            else {
                var spellcontent = characterService.GetCharacterSpellContent($scope.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var Spells = data.data.PayLoad;
                        rulesetDataShareService.setLayoutSpellInventoryData(Spells);
                        var dlg = dialogs.create('/views/dialogs/CharacterAssociatedSpells.html', 'dialogCharacterAssociatedSpells',
                            { scope: Spells.CharacterSpells, associatedspells: $scope.AssociatedSpells }
                        );
                        dlg.result.then(function (res) {
                            $scope.AssociatedSpellsChanged = res;
                        });
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                        }
                    }
                })
            }
        }

        $scope.OpenAssociatedAbilities = function () {
            var Abilities = rulesetDataShareService.getLayoutAbilityInventoryData();
            if (angular.equals({}, Abilities) == false) {
                var dlg = dialogs.create('/views/dialogs/CharacterAssociatedAbilities.html', 'dialogCharacterAssociatedAbilities',
                    { scope: Abilities.CharacterAbilities, associatedabilities: $scope.AssociatedAbilities }
                );

                dlg.result.then(function (res) {
                    $scope.AssociatedAbilitiesChanged = res;
                });
            }
            else {
                var abilitycontent = characterService.GetCharacterAbilityContent($scope.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var Abilities = data.data.PayLoad;
                        rulesetDataShareService.setLayoutAbilityInventoryData(Abilities);
                        var dlg = dialogs.create('/views/dialogs/CharacterAssociatedAbilities.html', 'dialogCharacterAssociatedAbilities',
                            { scope: Abilities.CharacterAbilities, associatedabilities: $scope.AssociatedAbilities }
                        );

                        dlg.result.then(function (res) {
                            $scope.AssociatedAbilitiesChanged = res;
                        });
                    }
                })
            }
        }

        $scope.cancel = function () {
            //$("#loading").css("display", "block");
            $uibModalInstance.close('cancel');
            //$("#loading").fadeOut("slow");
        }
    }]);

    module.controller('dialogCharacterAssociatedSpells', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'dialogs', function ($scope, $uibModalInstance, data, characterService, dialogs) {
        $scope.Spells = data.scope;

        var AssociatedSpells = data.associatedspells;

        if (AssociatedSpells != null && AssociatedSpells != undefined) {
            for (var i = 0; i < $scope.Spells.length; i++) {
                for (var j = 0; j < AssociatedSpells.length; j++) {
                    if ($scope.Spells[i].CharacterSpellsProperties[0].Value.Text.value == AssociatedSpells[j].CharacterSpellsProperties[0].Value.Text.value) {
                        $scope.Spells[i].Selected = true;
                    }
                }
            }
        }
        $scope.SaveAssociatedSpells = function () {
            var exampleArray = [];
            for (var i = 0; i < $scope.Spells.length; i++) {
                if ($scope.Spells[i].Selected) {
                    exampleArray.push($scope.Spells[i]);
                }
            }
            $uibModalInstance.close(exampleArray)
        }
        $scope.cancel = function () {
            //$("#loading").css("display", "block");
            $uibModalInstance.close('cancel');
            //$("#loading").fadeOut("slow");
        }
    }]);

    module.controller('dialogCharacterAssociatedAbilities', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'dialogs', function ($scope, $uibModalInstance, data, characterService, dialogs) {
        $scope.Abilities = data.scope;

        var AssociatedAbilities = data.associatedabilities;

        if (AssociatedAbilities != null && AssociatedAbilities != undefined) {
            for (var i = 0; i < $scope.Abilities.length; i++) {
                for (var j = 0; j < AssociatedAbilities.length; j++) {
                    if ($scope.Abilities[i].CharacterAbilitiesProperties[0].Value.Text.value == AssociatedAbilities[j].CharacterAbilitiesProperties[0].Value.Text.value) {
                        $scope.Abilities[i].Selected = true;
                    }
                }
            }
        }
        $scope.SaveAssociatedAbilities = function () {
            var exampleArray = [];
            for (var i = 0; i < $scope.Abilities.length; i++) {
                if ($scope.Abilities[i].Selected) {
                    exampleArray.push($scope.Abilities[i]);
                }
            }
            $uibModalInstance.close(exampleArray)
        }
        $scope.cancel = function () {
            //$("#loading").css("display", "block");
            $uibModalInstance.close('cancel');
            //$("#loading").fadeOut("slow");
        }

    }]);

    module.controller('dialogCreateInventoryItem', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'characterService', 'rulesetDataShareService', 'dialogs','toaster', function ($scope, $uibModalInstance, data, rulesetService, characterService, rulesetDataShareService, dialogs,toaster) {

        $scope.Properties = data.scope;
        $scope.tabName = data.tabName;
        $scope.buttontext = data.btntext;
        $scope.IsBtnDisabled = data.IsBtnDisabled;
        $scope.InventoryItems = data.NewInventory;
        $scope.CharacterId = data.CharacterId;

        $scope.ShowAssociatedSpells = true;
        $scope.ShowAssociatedAbilities = true;

        $scope.OpenAssociatedSpells = function () {
            var Spells = rulesetDataShareService.getLayoutSpellInventoryData();
            if (angular.equals({}, Spells) == false) {
                var dlg = dialogs.create('/views/dialogs/CharacterAssociatedSpells.html', 'dialogCharacterAssociatedSpells',
                    { scope: Spells.CharacterSpells, associatedspells: $scope.AssociatedSpells }
                );
                dlg.result.then(function (res) {
                    $scope.AssociatedSpells = res;
                });
            }
            else {
                var spellcontent = characterService.GetCharacterSpellContent($scope.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var Spells = data.data.PayLoad;
                        rulesetDataShareService.setLayoutSpellInventoryData(Spells);
                        var dlg = dialogs.create('/views/dialogs/CharacterAssociatedSpells.html', 'dialogCharacterAssociatedSpells',
                            { scope: Spells.CharacterSpells, associatedspells: $scope.AssociatedSpells }
                        );
                        dlg.result.then(function (res) {
                            $scope.AssociatedSpells = res;
                        });
                    }
                })
            }
        }

        $scope.OpenAssociatedAbilities = function () {
            var Abilities = rulesetDataShareService.getLayoutAbilityInventoryData();
            if (angular.equals({}, Abilities) == false) {
                var dlg = dialogs.create('/views/dialogs/CharacterAssociatedAbilities.html', 'dialogCharacterAssociatedAbilities',
                    { scope: Abilities.CharacterAbilities, associatedabilities: $scope.AssociatedAbilities }
                );

                dlg.result.then(function (res) {
                    $scope.AssociatedAbilities = res;
                });
            }
            else {
                var abilitycontent = characterService.GetCharacterAbilityContent($scope.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var Abilities = data.data.PayLoad;
                        rulesetDataShareService.setLayoutAbilityInventoryData(Abilities);
                        var dlg = dialogs.create('/views/dialogs/CharacterAssociatedAbilities.html', 'dialogCharacterAssociatedAbilities',
                            { scope: Abilities.CharacterAbilities, associatedabilities: $scope.AssociatedAbilities }
                        );

                        dlg.result.then(function (res) {
                            $scope.AssociatedAbilities = res;
                        });
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                        }
                    }
                })
            }
        }
        $scope.Create = function () {
            $("#loading").css("display", "block");
            if ($scope.Properties[0].CharacterItemId != undefined) {
                $scope.InventoryItems.CharacterItems.CharacterProfileId = $scope.CharacterId;
                $scope.InventoryItems.CharacterItems.CharacterItemsProperties = $scope.Properties;
                $scope.InventoryItems.CharacterItems.AssociatedSpells = $scope.AssociatedSpells;
                $scope.InventoryItems.CharacterItems.AssociatedAbilities = $scope.AssociatedAbilities;
            }
            var InventoryItems = [];
            InventoryItems.push($scope.InventoryItems.CharacterItems);
            var items = characterService.CreateCharacterInventoryItems(InventoryItems).then(function (data) {
                if (data.data.StatusCode == 200) {
                    if (data.data.PayLoad.length != 0) {
                        for (var i = 0; i < data.data.PayLoad.length; i++) {
                            $scope.Properties = data.data.PayLoad[i];
                        }
                    }
                    $uibModalInstance.close($scope.Properties);
                    $("#loading").fadeOut("slow");
                }
                else if (data.data.StatusCode == 400) {
                    if (data.data.ShowToUser == true)
                    {
                        toaster.pop('error', data.data.ErrorMessage);
                    }
                }
            })
        }

        $scope.ItemcloseDialog = function () {

            $uibModalInstance.close($scope.CoreStatProperties);
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('dialogCreateInventorySpell', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'characterService', function ($scope, $uibModalInstance, data, rulesetService, characterService) {

        $scope.Properties = data.scope;
        $scope.tabName = data.tabName;
        $scope.buttontext = data.btntext;
        $scope.IsBtnDisabled = data.IsBtnDisabled;
        $scope.InventorySpells = data.NewInventory;
        $scope.CharacterId = data.CharacterId;
        $scope.Create = function () {
            //$("#loading").css("display", "block");
            if ($scope.Properties[0].CharacterSpellId != undefined) {
                $scope.InventorySpells.CharacterSpells.CharacterProfileId = $scope.CharacterId;
                $scope.InventorySpells.CharacterSpells.CharacterSpellsProperties = $scope.Properties;
            }
            var InventorySpells = [];
            InventorySpells.push($scope.InventorySpells.CharacterSpells);
            var items = characterService.CreateCharacterInventorySpells(InventorySpells).then(function (data) {
                if (data.data.StatusCode == 200) {
                    if (data.data.PayLoad.length != 0) {
                        for (var i = 0; i < data.data.PayLoad.length; i++) {
                            $scope.Properties = data.data.PayLoad[i];
                        }
                    }
                    $uibModalInstance.close($scope.Properties);
                    $("#loading").fadeOut("slow");
                }
                else if (data.data.StatusCode == 400) {
                    if (data.data.ShowToUser == true) {
                        toaster.pop('error', data.data.ErrorMessage);
                    }
                }
            });
        }
        $scope.ItemcloseDialog = function () {

            $uibModalInstance.close($scope.CoreStatProperties);
        }
        $scope.cancel = function () {
          //  $("#loading").css("display", "block");
            $uibModalInstance.close('cancel');
           // $("#loading").fadeOut("slow");
        }

    }]);

    module.controller('dialogCreateInventoryAbility', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'characterService', function ($scope, $uibModalInstance, data, rulesetService, characterService) {

        $scope.Properties = data.scope;
        $scope.tabName = data.tabName;
        $scope.buttontext = data.btntext;
        $scope.IsBtnDisabled = data.IsBtnDisabled;
        $scope.InventoryAbility = data.NewInventory;
        $scope.CharacterId = data.CharacterId;
        $scope.Create = function () {
            if ($scope.Properties[0].CharacterAbilityId != undefined) {
                $scope.InventoryAbility.CharacterAbilities.CharacterProfileId = $scope.CharacterId;
                $scope.InventoryAbility.CharacterAbilities.CharacterAbilitiesProperties = $scope.Properties;
            }
            var InventoryAbility = [];
            InventoryAbility.push($scope.InventoryAbility.CharacterAbilities);
            var items = characterService.CreateCharacterInventoryAbility(InventoryAbility).then(function (data) {
                if (data.data.StatusCode == 200) {
                    if (data.data.PayLoad.length != 0) {
                        for (var i = 0; i < data.data.PayLoad.length; i++) {
                            $scope.Properties = data.data.PayLoad[i];
                        }
                    }
                    $uibModalInstance.close($scope.Properties);
                }
               else if (data.data.StatusCode == 400) {
                    if (data.data.ShowToUser == true)
                    {
                        toaster.pop('error', data.data.ErrorMessage);
                    }
                }
            })
        }

        $scope.ItemcloseDialog = function () {

            $uibModalInstance.close($scope.CoreStatProperties);
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    //TileContoller dialogs

    module.controller('NoteTile', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'toaster', 'dialogs', 'rulesetDataShareService', function ($scope, $uibModalInstance, data, rulesetService, toaster, dialogs, rulesetDataShareService) {
        $scope.NoteTile = data.scope;
        $scope.LinkExecuteTileContent = rulesetDataShareService.getLinkTileData();
        if (angular.equals({}, $scope.LinkExecuteTileContent) == true) {
            $scope.LinkExecuteTileContent = data.RuleSetContentForLinkExecuteTile;
            if (angular.isUndefined($scope.LinkExecuteTileContent) == true) {
                $scope.LinkExecuteTileContent = data.fullscope;
            }
        }
        $scope.Fullscope = data.fullscope;
        $scope.Modes = data.mode;
       
        $scope.TileBorder = function () {

            var dlg = dialogs.create('/views/dialogs/SelectTileBorder.html', 'dialogTileBorder',
                { scope: $scope.NoteTile.Styles }

            );

            dlg.result.then(function (res) {
                switch (res.shadow) {
                    case "Use default":
                        res.shadow = "10px 10px";
                        break;
                    case "Yes":
                        res.shadow = "10px 10px 5px grey";
                        break;
                    case "No":
                        res.shadow = "";
                        break;
                    default:
                        res.shadow = "";
                        break;

                }
                if (res.shadow == null || res.shadow == "") res.shadow = "";
                if (res.backgroundColor == null || res.backgroundColor == "#008fff" || res.shadow == "") res.backgroundColor = "";
                if (res.color == null || res.shadow == "") res.color = "";
                if (res.radius == null || res.shadow == "") res.radius = "";
                if (res.style == null || res.shadow == "") res.style = "";
                if (res.width == null || res.shadow == "") res.width = "";
                $scope.NoteTile.Styles = res;
            });
        }
        $scope.TileTitleBackground = function () {

            var dlg = dialogs.create('/views/dialogs/SelectTileTitleBackground.html', 'dialogTileBorder',
                { scope: $scope.NoteTile.Styles }

            );

            dlg.result.then(function (res) {
               
                $scope.NoteTile.Styles = res;
            });
        }

        //Getting Unique id
        function uniqId() {
            return Math.round(new Date().getTime() + (Math.random() * 100));
        }
        $scope.SaveTile = function () {
            $("#loading").css("display", "block");
            if (angular.isUndefined($scope.NoteTile.Styles) == false) {
                if ($scope.NoteTile.Styles != null) {
                    //$scope.NoteTile.Styles.backgroundColor = $("#backgroundcolor").val();
                }
            }
            if ($scope.NoteTile.EditClientId == 0) {
                $scope.NoteTile.EditClientId = uniqId();
            }
            $uibModalInstance.close($scope.NoteTile);
            $("#loading").fadeOut("slow");
        }

        $scope.SaveCounterTile = function () {
            $("#loading").css("display", "block");
            if ($scope.NoteTile.Value.Counter.Min > $scope.NoteTile.Value.Counter.Max) {
                toaster.pop('error', "Min Value Should be Less Than Max Value ");
            }
            else {
                if ($scope.NoteTile.Styles != null) {
                    $scope.NoteTile.Styles.backgroundColor = $("#backgroundcolor").val();
                }
                if ($scope.NoteTile.EditClientId == 0) {
                    $scope.NoteTile.EditClientId = uniqId();
                }
                $uibModalInstance.close($scope.NoteTile);
                $("#loading").fadeOut("slow");
            }
        }
        $scope.SaveAttributeTile = function () {
            for (var i = 0; i < $scope.NoteTile.CorestatValues.length; i++) {
                if ($scope.NoteTile.CorestatValues[i].Name != null) {
                    if ($scope.NoteTile.Value.Attribute.CorestatValue == $scope.NoteTile.CorestatValues[i].Name) {
                        $scope.NoteTile.Value.Attribute.CoreStatValue = $scope.NoteTile.CorestatValues[i].Value;
                        if ($scope.NoteTile.CorestatValues[i].Id == 0) {
                            toaster.pop("error", "CoreStats Values are not saved for " + $scope.NoteTile.CorestatValues[i].Name + "  CoreStat");
                            return false;
                        }
                        $scope.NoteTile.Value.Attribute.CoreStatValueId = $scope.NoteTile.CorestatValues[i].Id;
                        $scope.NoteTile.Value.Attribute.TypeId = $scope.NoteTile.CorestatValues[i].TypeId;
                        $scope.NoteTile.Value.Attribute.CharacterProfileId = $scope.NoteTile.CorestatValues[i].CharacterId;
                        $scope.NoteTile.Value.Attribute.CorestatValue = $scope.NoteTile.CorestatValues[i].Name;
                        $scope.NoteTile.Value.Attribute.AttributeContent = $scope.NoteTile.CorestatValues[i];
                        $scope.NoteTile.Value.Attribute.Name = $scope.NoteTile.CorestatValues[i].Name;
                        $scope.NoteTile.Value.Attribute.SelectedCorestatValue = $scope.NoteTile.CorestatValues[i].Name;
                        if ($scope.NoteTile.Value.Attribute.TypeId == 1) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Text:" + $scope.NoteTile.CorestatValues[i].Value.Text.value;
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 2) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Choices:" + $scope.NoteTile.CorestatValues[i].Value.Choices;
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 3) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "On/Off:" + $scope.NoteTile.CorestatValues[i].Value.OnOrOff.value;
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 4) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Yes/No:" + $scope.NoteTile.CorestatValues[i].Value.YesOrNo.value;
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 5) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Value:" + $scope.NoteTile.CorestatValues[i].Value.ValueAndSubValue.value + " " + "Sub Value:" + $scope.NoteTile.CorestatValues[i].Value.ValueAndSubValue.subvalue;
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 6) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Current Value:" + $scope.NoteTile.CorestatValues[i].Value.CurrentAndMaxValue.CurrentValue + " " + "Max Value:" + $scope.NoteTile.CorestatValues[i].Value.CurrentAndMaxValue.MaxValue;
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 7) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Weight:" + $scope.NoteTile.CorestatValues[i].Value.Weight.value
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 8) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Image:" + $scope.NoteTile.CorestatValues[i].Value.Image.image
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 12) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Height:" + $scope.NoteTile.CorestatValues[i].Value.Height.value + $scope.NoteTile.CorestatValues[i].Value.Height.units.selectedUnit;
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 13) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Volume:" + $scope.NoteTile.CorestatValues[i].Value.Volume.value.depthvalue + "  " + $scope.NoteTile.CorestatValues[i].Value.Volume.units.selectedUnit;
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 14) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Number:" + $scope.NoteTile.CorestatValues[i].Value.Number.value
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 15) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Dice:" + $scope.NoteTile.CorestatValues[i].Value.DefaultDice.value
                        }
                        else if ($scope.NoteTile.Value.Attribute.TypeId == 19) {
                            $scope.NoteTile.Value.Attribute.CorestatValues = "Text Area:" + $scope.NoteTile.CorestatValues[i].Value.TextArea.value
                        }
                        rulesetDataShareService.setTilelst($scope.NoteTile);
                    }
                }
            }
            if ($scope.NoteTile.EditClientId == 0) {
                $scope.NoteTile.EditClientId = uniqId();
            }
            $uibModalInstance.close($scope.NoteTile);
            $("#loading").fadeOut("slow");
        }


        $scope.SaveLinkTile = function () {
			$("#loading").css("display", "block");
			debugger;
            var IsItem = false; var IsSpell = false; var IsAbility = false;
            if (angular.isUndefined($scope.NoteTile.LinkTileItems) == false) {
                if ($scope.NoteTile.Value.Link.SelectedPropertyValue == "Items") {
                    for (var i = 0; i < $scope.NoteTile.LinkTileItems.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.NoteTile.LinkTileItems[i].ItemProperties[0].Value.Text.value) {
                            IsItem = true;
                        }
                    }
                }
                else if ($scope.NoteTile.Value.Link.SelectedPropertyValue == "Spells") {
                    for (var i = 0; i < $scope.NoteTile.LinkTileSpells.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.NoteTile.LinkTileSpells[i].SpellProperties[0].Value.Text.value) {
                            IsSpell = true;
                        }
                    }
                }
                else if ($scope.NoteTile.Value.Link.SelectedPropertyValue == "Abilities") {
                    for (var i = 0; i < $scope.NoteTile.LinkTileAbilities.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.NoteTile.LinkTileAbilities[i].AbilityProperties[0].Value.Text.value) {
                            IsAbility = true;
                        }
                    }
                }
                if (IsItem == true) {
					for (var i = 0; i < $scope.NoteTile.LinkTileItems.length; i++) {
						console.log("$scope.NoteTile.Value.Link.SelectedProperty: ", $scope.NoteTile.Value.Link.SelectedProperty);
						console.log("$scope.NoteTile.LinkTileItems[i].ItemProperties[0].Value.Text.value: ", $scope.NoteTile.LinkTileItems[i].ItemProperties[0].Value.Text.value);
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.NoteTile.LinkTileItems[i].ItemProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Link.Title = $scope.NoteTile.Value.Link.Title;
                            $scope.NoteTile.Value.Link.SelectedPropertyValueImage = $scope.NoteTile.LinkTileItems[i].ItemProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Link.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Link.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Link.SelectedProperty = $scope.NoteTile.LinkTileItems[i].ItemProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Link.Content = $scope.NoteTile.LinkTileItems[i];
                        }
                    }
                }
                else if (IsSpell == true) {
                    for (var i = 0; i < $scope.NoteTile.LinkTileSpells.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.NoteTile.LinkTileSpells[i].SpellProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Link.Title = $scope.NoteTile.Value.Link.Title;
                            $scope.NoteTile.Value.Link.SelectedPropertyValueImage = $scope.NoteTile.LinkTileSpells[i].SpellProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Link.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Link.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Link.SelectedProperty = $scope.NoteTile.LinkTileSpells[i].SpellProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Link.Content = $scope.NoteTile.LinkTileSpells[i];
                        }
                    }
                }
                else if (IsAbility == true) {
                    for (var i = 0; i < $scope.NoteTile.LinkTileAbilities.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.NoteTile.LinkTileAbilities[i].AbilityProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Link.Title = $scope.NoteTile.Value.Link.Title;
                            $scope.NoteTile.Value.Link.SelectedPropertyValueImage = $scope.NoteTile.LinkTileAbilities[i].AbilityProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Link.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Link.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Link.SelectedProperty = $scope.NoteTile.LinkTileAbilities[i].AbilityProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Link.Content = $scope.NoteTile.LinkTileAbilities[i];
                        }
                    }
                }

            }
            else {
                if (angular.isUndefined($scope.LinkExecuteTileContent) == true) {
                    $scope.LinkExecuteTileContent = {};
                    var RuleSetTileContents = rulesetDataShareService.getRulesetData();
                    $scope.LinkExecuteTileContent.Items = RuleSetTileContents.Items;
                    $scope.LinkExecuteTileContent.Spells = RuleSetTileContents.Spells;
                    $scope.LinkExecuteTileContent.Abilities = RuleSetTileContents.Abilities;
                }
                if ($scope.NoteTile.Value.Link.SelectedPropertyValue == "Items") {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Items.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.LinkExecuteTileContent.Items[i].ItemProperties[0].Value.Text.value) {
                            IsItem = true;
                        }
                    }
                }
                else if ($scope.NoteTile.Value.Link.SelectedPropertyValue == "Spells") {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Spells.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.LinkExecuteTileContent.Spells[i].SpellProperties[0].Value.Text.value) {
                            IsSpell = true;
                        }
                    }
                }
                else if ($scope.NoteTile.Value.Link.SelectedPropertyValue == "Abilities") {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Abilities.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.LinkExecuteTileContent.Abilities[i].AbilityProperties[0].Value.Text.value) {
                            IsAbility = true;
                        }
                    }
                }
                if (IsItem == true) {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Items.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.LinkExecuteTileContent.Items[i].ItemProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Link.Title = $scope.NoteTile.Value.Link.Title;
                            $scope.NoteTile.Value.Link.SelectedPropertyValueImage = $scope.LinkExecuteTileContent.Items[i].ItemProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Link.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Link.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Link.SelectedProperty = $scope.LinkExecuteTileContent.Items[i].ItemProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Link.Content = $scope.LinkExecuteTileContent.Items[i];
                        }
                    }
                }
                else if (IsSpell == true) {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Spells.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.LinkExecuteTileContent.Spells[i].SpellProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Link.Title = $scope.NoteTile.Value.Link.Title;
                            $scope.NoteTile.Value.Link.SelectedPropertyValueImage = $scope.LinkExecuteTileContent.Spells[i].SpellProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Link.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Link.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Link.SelectedProperty = $scope.LinkExecuteTileContent.Spells[i].SpellProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Link.Content = $scope.LinkExecuteTileContent.Spells[i];
                        }
                    }
                }
                else if (IsAbility == true) {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Abilities.length; i++) {
                        if ($scope.NoteTile.Value.Link.SelectedProperty == $scope.LinkExecuteTileContent.Abilities[i].AbilityProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Link.Title = $scope.NoteTile.Value.Link.Title;
                            $scope.NoteTile.Value.Link.SelectedPropertyValueImage = $scope.LinkExecuteTileContent.Abilities[i].AbilityProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Link.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Link.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Link.SelectedProperty = $scope.LinkExecuteTileContent.Abilities[i].AbilityProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Link.Content = $scope.LinkExecuteTileContent.Abilities[i];
                        }
                    }
                }
            }
            if ($scope.NoteTile.Styles != null) {
                $scope.NoteTile.Styles.backgroundColor = $("#backgroundcolor").val();
            }
            if ($scope.NoteTile.EditClientId == 0) {
                $scope.NoteTile.EditClientId = uniqId();
            }
            $uibModalInstance.close($scope.NoteTile);
            $("#loading").fadeOut("slow");
        }
        $scope.SaveExecuteTile = function () {
            $("#loading").css("display", "block");
            var IsItem = false; var IsSpell = false; var IsAbility = false;
            if (angular.isUndefined($scope.NoteTile.ExecuteTileItems) == false) {
                if ($scope.NoteTile.Value.Execute.SelectedPropertyValue == "Items") {
                    for (var i = 0; i < $scope.NoteTile.ExecuteTileItems.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.NoteTile.ExecuteTileItems[i].ItemProperties[0].Value.Text.value) {
                            IsItem = true;
                        }
                    }
                }
                else if ($scope.NoteTile.Value.Execute.SelectedPropertyValue == "Spells") {
                    for (var i = 0; i < $scope.NoteTile.ExecuteTileSpells.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.NoteTile.ExecuteTileSpells[i].SpellProperties[0].Value.Text.value) {
                            IsSpell = true;
                        }
                    }
                }
                else if ($scope.NoteTile.Value.Execute.SelectedPropertyValue == "Abilities") {
                    for (var i = 0; i < $scope.NoteTile.ExecuteTileAbilities.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.NoteTile.ExecuteTileAbilities[i].AbilityProperties[0].Value.Text.value) {
                            IsAbility = true;
                        }
                    }
                }
                if (IsItem == true) {
                    for (var i = 0; i < $scope.NoteTile.ExecuteTileItems.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.NoteTile.ExecuteTileItems[i].ItemProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Execute.Name = $scope.NoteTile.Value.Execute.Name;
                            $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = $scope.NoteTile.ExecuteTileItems[i].ItemProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Execute.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Execute.SelectedProperty = $scope.NoteTile.ExecuteTileItems[i].ItemProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Execute.Command = "";
                            $scope.NoteTile.Value.Execute.CommandLastResult = "";
                            //  rulesetDataShareService.setTilelst($scope.NoteTile);
                            $scope.NoteTile.Value.Execute.Content = $scope.NoteTile.ExecuteTileItems[i];
                        }
                    }
                }
                else if (IsSpell == true) {
                    for (var i = 0; i < $scope.NoteTile.ExecuteTileSpells.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.NoteTile.ExecuteTileSpells[i].SpellProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Execute.Name = $scope.NoteTile.Value.Execute.Name;
                            $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = $scope.NoteTile.ExecuteTileSpells[i].SpellProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Execute.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Execute.SelectedProperty = $scope.NoteTile.ExecuteTileSpells[i].SpellProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Execute.Command = "";
                            $scope.NoteTile.Value.Execute.CommandLastResult = "";
                            $scope.NoteTile.Value.Execute.Content = $scope.NoteTile.ExecuteTileSpells[i];
                            // rulesetDataShareService.setTilelst($scope.NoteTile);
                            $scope.NoteTile.Value.Execute.Content = $scope.NoteTile.ExecuteTileSpells[i];
                        }
                    }
                }
                else if (IsAbility == true) {
                    for (var i = 0; i < $scope.NoteTile.ExecuteTileAbilities.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedPropertyValue == $scope.NoteTile.ExecuteTileAbilities[i].AbilityProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Execute.Name = $scope.NoteTile.Value.Execute.Name;
                            $scope.NoteTile.Value.Execute.SelectedPropertyValue = $scope.NoteTile.ExecuteTileAbilities[i].AbilityProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Execute.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Execute.SelectedProperty = $scope.NoteTile.ExecuteTileAbilities[i].AbilityProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Execute.Command = $scope.NoteTile.Value.Execute.Command;
                            $scope.NoteTile.Value.Execute.CommandLastResult = $scope.NoteTile.Value.Execute.CommandLastResult;
                            //  rulesetDataShareService.setTilelst($scope.NoteTile);
                            $scope.NoteTile.Value.Execute.Content = $scope.NoteTile.ExecuteTileAbilities[i];
                        }
                    }
                }
            }
            else {
                if (angular.isUndefined($scope.LinkExecuteTileContent) == true) {
                    $scope.LinkExecuteTileContent = {};
                    var RuleSetTileContents = rulesetDataShareService.getRulesetData();
                    $scope.LinkExecuteTileContent.Items = RuleSetTileContents.Items;
                    $scope.LinkExecuteTileContent.Spells = RuleSetTileContents.Spells;
                    $scope.LinkExecuteTileContent.Abilities = RuleSetTileContents.Abilities;
                }
                if ($scope.NoteTile.Value.Execute.SelectedPropertyValue == "Items") {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Items.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.LinkExecuteTileContent.Items[i].ItemProperties[0].Value.Text.value) {
                            IsItem = true;
                        }
                    }
                }
                else if ($scope.NoteTile.Value.Execute.SelectedPropertyValue == "Spells") {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Spells.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.LinkExecuteTileContent.Spells[i].SpellProperties[0].Value.Text.value) {
                            IsSpell = true;
                        }
                    }
                }
                else if ($scope.NoteTile.Value.Execute.SelectedPropertyValue == "Abilities") {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Abilities.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.LinkExecuteTileContent.Abilities[i].AbilityProperties[0].Value.Text.value) {
                            IsAbility = true;
                        }
                    }
                }
                if (IsItem == true) {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Items.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.LinkExecuteTileContent.Items[i].ItemProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Execute.Name = $scope.NoteTile.Value.Execute.Title;
                            $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = $scope.LinkExecuteTileContent.Items[i].ItemProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Execute.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Execute.SelectedProperty = $scope.LinkExecuteTileContent.Items[i].ItemProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Execute.Command = "";
                            $scope.NoteTile.Value.Execute.CommandLastResult = "";
                            //  rulesetDataShareService.setTilelst($scope.NoteTile);
                            $scope.NoteTile.Value.Execute.Content = $scope.LinkExecuteTileContent.Items[i];
                        }
                    }
                }
                else if (IsSpell == true) {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Spells.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedProperty == $scope.LinkExecuteTileContent.Spells[i].SpellProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Execute.Name = $scope.NoteTile.Value.Execute.Title;
                            $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = $scope.LinkExecuteTileContent.Spells[i].SpellProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Execute.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Execute.SelectedProperty = $scope.LinkExecuteTileContent.Spells[i].SpellProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Execute.Command = "";
                            $scope.NoteTile.Value.Execute.CommandLastResult = "";
                            $scope.NoteTile.Value.Execute.Content = $scope.LinkExecuteTileContent.Spells[i];
                            // rulesetDataShareService.setTilelst($scope.NoteTile);
                            $scope.NoteTile.Value.Execute.Content = $scope.LinkExecuteTileContent.Spells[i];
                        }
                    }
                }
                else if (IsAbility == true) {
                    for (var i = 0; i < $scope.LinkExecuteTileContent.Abilities.length; i++) {
                        if ($scope.NoteTile.Value.Execute.SelectedPropertyValue == $scope.LinkExecuteTileContent.Abilities[i].AbilityProperties[0].Value.Text.value) {
                            $scope.NoteTile.Value.Execute.Name = $scope.NoteTile.Value.Execute.Title;
                            $scope.NoteTile.Value.Execute.SelectedPropertyValue = $scope.LinkExecuteTileContent.Abilities[i].AbilityProperties[1].Value.Image.image;
                            if ($scope.NoteTile.Value.Execute.SelectedPropertyValueImage == null) {
                                $scope.NoteTile.Value.Execute.SelectedPropertyValueImage = "";
                            }
                            $scope.NoteTile.Value.Execute.SelectedProperty = $scope.LinkExecuteTileContent.Abilities[i].AbilityProperties[0].Value.Text.value;
                            $scope.NoteTile.Value.Execute.Command = $scope.NoteTile.Value.Execute.Command;
                            $scope.NoteTile.Value.Execute.CommandLastResult = $scope.NoteTile.Value.Execute.CommandLastResult;
                            //  rulesetDataShareService.setTilelst($scope.NoteTile);
                            $scope.NoteTile.Value.Execute.Content = $scope.LinkExecuteTileContent.Abilities[i];
                        }
                    }
                }
            }
            if ($scope.NoteTile.Styles != null) {
                $scope.NoteTile.Styles.backgroundColor = $("#backgroundcolor").val();
            }
            if ($scope.NoteTile.EditClientId == 0) {
                $scope.NoteTile.EditClientId = uniqId();
            }
            $uibModalInstance.close($scope.NoteTile)
            $("#loading").fadeOut("slow");
        }
        $scope.SaveCommandTile = function () {
            $("#loading").css("display", "block");
            if ($scope.NoteTile.Value.Command.command != null) {
                var command = $scope.NoteTile.Value.Command.command;
                if (!dicenotationvalidator(command)) {
                    toaster.pop('error', "Invalid Command");
                }
                else {
                    if ($scope.NoteTile.Styles != null) {
                        $scope.NoteTile.Styles.backgroundColor = $("#backgroundcolor").val();
                    }
                    $scope.NoteTile.Value.Command.commandLastResult = localStorage.getItem("rollresult");
                    if ($scope.NoteTile.EditClientId == 0) {
                        $scope.NoteTile.EditClientId = uniqId();
                    }
                    $uibModalInstance.close($scope.NoteTile);
                    $("#loading").fadeOut("slow");
                }
            }

        }
        $scope.SaveImageTile = function () {
            $("#loading").css("display", "block");
            if ($scope.NoteTile.Styles != null) {
                $scope.NoteTile.Styles.backgroundColor = $("#backgroundcolor").val();
            }
            if ($scope.NoteTile.EditClientId == 0) {
                $scope.NoteTile.EditClientId = uniqId();
            }
            $uibModalInstance.close($scope.NoteTile);
            $("#loading").fadeOut("slow");
        }
        $scope.cancel = function () {
          //  $("#loading").css("display", "block");
            $uibModalInstance.close('cancel');
          //  $("#loading").fadeOut("slow");
        }
    }]);
    module.controller('ShowAllTileContent', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'toaster', 'dialogs', 'layoutService', function ($scope, $uibModalInstance, data, rulesetService, toaster, dialogs, layoutService) {

        $scope.Content = data.scope;
        if ($scope.Content.TileTypeName == "Attribute") {
            if ($scope.Content.Value.Attribute.AttributeContent.TypeId == 5) {
                $scope.Value = $scope.Content.Value.Attribute.AttributeContent.Value.ValueAndSubValue.value;
                $scope.Subvalue = $scope.Content.Value.Attribute.AttributeContent.Value.ValueAndSubValue.subvalue;
                $scope.ValueSubValue = true;
                $scope.CurrentMax = false;
                $scope.Number = false;
            }
            else if ($scope.Content.Value.Attribute.AttributeContent.TypeId == 6) {
                $scope.Currentvalue = $scope.Content.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue.CurrentValue;
                $scope.Maxvalue = $scope.Content.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue.MaxValue;
                $scope.ValueSubValue = false;
                $scope.CurrentMax = true;
                $scope.Number = false;
            }
            else if ($scope.Content.Value.Attribute.AttributeContent.TypeId == 14) {
                $scope.Numbers = $scope.Content.Value.Attribute.AttributeContent.Value.Number.value;
                $scope.ValueSubValue = false;
                $scope.CurrentMax = false;
                $scope.Number = true;
            }
        }
        $scope.SaveCounterUpdatedValue = function () {
            if ($scope.Content.Value.Counter.Value > $scope.Content.Value.Counter.Max) {
                toaster.pop('error', "Value Should Not be Greater Than Max Value ");
            }
            else {
                $uibModalInstance.close($scope.Content);
            }

        }

        $scope.Increment = function (val) {
            if (val == 1) {
                var val = $scope.Maxvalue;
                val += 1;
                $scope.Maxvalue = val;
            }
            else if (val == 2) {
                var val = $scope.Currentvalue;
                val += 1;
                $scope.Currentvalue = val;
            }
            else if (val == 3) {
                var val = $scope.Value;
                val += 1;
                $scope.Value = val;
            }
            else if (val == 4) {
                var val = $scope.Subvalue;
                val += 1;
                $scope.Subvalue = val;
            }
            else if (val == 5) {
                var val = $scope.Numbers;
                val += 1;
                $scope.Numbers = val;
            }
        }
        $scope.Decrement = function (val) {
            if (val == 1) {
                var val = $scope.Maxvalue;
                val -= 1;
                $scope.Maxvalue = val;
            }
            else if (val == 2) {
                var val = $scope.Currentvalue;
                val -= 1;
                $scope.Currentvalue = val;
            }
            else if (val == 3) {
                var val = $scope.Value;
                val -= 1;
                $scope.Value = val;
            }
            else if (val == 4) {
                var val = $scope.Subvalue;
                val -= 1;
                $scope.Subvalue = val;
            }
            else if (val == 5) {
                var val = $scope.Numbers;
                val -= 1;
                $scope.Numbers = val;
            }
        }
        $scope.Reset = function (val) {
            if (val == 1) {
                var dlg = dialogs.confirm(
                    'Confirm Reset',
                    'Are you sure you want to reset Max Value to "' + $scope.Content.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue.MaxValue + '"?',
                    { size: 'md' }
                );

                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            $scope.Maxvalue = $scope.Content.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue.MaxValue;
                        }

                    });
            }
            else if (val == 2) {
                var dlg = dialogs.confirm(
                    'Confirm Reset',
                    'Are you sure you want to reset Current Value to "' + $scope.Content.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue.CurrentValue + '"?',
                    { size: 'md' }
                );

                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            $scope.Currentvalue = $scope.Content.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue.CurrentValue;
                        }

                    });
            }
            else if (val == 3) {
                var dlg = dialogs.confirm(
                    'Confirm Reset',
                    'Are you sure you want to reset Value to "' + $scope.Content.Value.Attribute.AttributeContent.Value.ValueAndSubValue.value + '"?',
                    { size: 'md' }
                );

                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            $scope.Value = $scope.Content.Value.Attribute.AttributeContent.Value.ValueAndSubValue.value;
                        }

                    });
            }
            else if (val == 4) {
                var dlg = dialogs.confirm(
                    'Confirm Reset',
                    'Are you sure you want to reset Sub Value to "' + $scope.Content.Value.Attribute.AttributeContent.Value.ValueAndSubValue.subvalue + '"?',
                    { size: 'md' }
                );

                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            $scope.Subvalue = $scope.Content.Value.Attribute.AttributeContent.Value.ValueAndSubValue.subvalue;
                        }

                    });
            }
            else if (val == 5) {
                var dlg = dialogs.confirm(
                    'Confirm Reset',
                    'Are you sure you want to reset Number to "' + $scope.Content.Value.Attribute.AttributeContent.Value.Number.value + '"?',
                    { size: 'md' }
                );

                dlg.result.then(
                    function (res) {
                        if (res == "yes") {
                            $scope.Numbers = $scope.Content.Value.Attribute.AttributeContent.Value.Number.value;
                        }

                    });
            }

        }
        $scope.SaveAttributeCorestatValue = function () {
            if ($scope.Content.Value.Attribute.AttributeContent.TypeId == 6) {
              
            }
            else if ($scope.Content.Value.Attribute.AttributeContent.TypeId == 5) {
                //$scope.Content.Value.Attribute.CoreStatValue.ValueAndSubValue = "value:" + $scope.Value + "subvalue:" + $scope.Subvalue;
                $scope.Content.Value.Attribute.CoreStatValue.ValueAndSubValue.value = $scope.Value;
                $scope.Content.Value.Attribute.CoreStatValue.ValueAndSubValue.subvalue = $scope.Subvalue;
            }
            else if ($scope.Content.Value.Attribute.AttributeContent.TypeId == 14) {
                //$scope.Content.Value.Attribute.CoreStatValue.Number = "value:" + $scope.Numbers;
                $scope.Content.Value.Attribute.CoreStatValue.Number.value = $scope.Numbers;
            }
            $uibModalInstance.close($scope.Content);
        }
        $scope.DiceRoll = function (val) {
            if (val == 1) {
                var defaultdice = layoutService.GetDefaultDice($scope.Content.Value.Attribute.AttributeContent.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var command = data.data.PayLoad + "+" + $scope.Maxvalue;
                        $scope.Content.Command = command;
                        var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                            { scope: $scope.Content, mode: 2 }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {

                            }
                        });
                        //dicerollwithcommand(command)
                    }
                    else if (data.data.StatusCode == 400) {
                        alert(data.data.ErrorMessage);
                    }
                })
            }
            else if (val == 2) {
                var defaultdice = layoutService.GetDefaultDice($scope.Content.Value.Attribute.AttributeContent.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var command = data.data.PayLoad + "+" + $scope.Currentvalue;
                        $scope.Content.Command = command;
                        var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                            { scope: $scope.Content, mode: 2 }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {

                            }
                        });
                    }
                    else if (data.data.StatusCode == 400) {
                        alert(data.data.ErrorMessage);
                    }
                })
            }
            else if (val == 3) {
                var defaultdice = layoutService.GetDefaultDice($scope.Content.Value.Attribute.AttributeContent.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var command = data.data.PayLoad + "+" + $scope.Value;
                        $scope.Content.Command = command;
                        var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                            { scope: $scope.Content, mode: 2 }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {

                            }
                        });
                    }
                    else if (data.data.StatusCode == 400) {
                        alert(data.data.ErrorMessage);
                    }
                })
            }
            else if (val == 4) {
                var defaultdice = layoutService.GetDefaultDice($scope.Content.Value.Attribute.AttributeContent.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var command = data.data.PayLoad + "+" + $scope.Subvalue;
                        $scope.Content.Command = command;
                        var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                            { scope: $scope.Content, mode: 2 }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {

                            }
                        });
                    }
                    else if (data.data.StatusCode == 400) {
                        alert(data.data.ErrorMessage);
                    }
                })
            }
            else if (val == 5) {
                var defaultdice = layoutService.GetDefaultDice($scope.Content.Value.Attribute.AttributeContent.CharacterId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        var command = data.data.PayLoad + "+" + $scope.Numbers;
                        $scope.Content.Command = command;
                        var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                            { scope: $scope.Content, mode: 2 }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {

                            }
                        });
                    }
                    else if (data.data.StatusCode == 400) {
                        alert(data.data.ErrorMessage);
                    }
                })
            }
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

    module.controller('dialogTileBorder', ['$scope', '$uibModalInstance', 'data', 'dialogs', function ($scope, $uibModalInstance, data, dialogs, tileService) {

        $scope.TileBorders = data.scope;
        $scope.cancel = function () {
          //  $("#loading").css("display", "block");
            $uibModalInstance.dismiss('Canceled');
            //$("#loading").fadeOut("slow");
        };

        $scope.SaveTileBorder = function () {
            $scope.TileBorders.color = $("#bordercolor").val();
            $uibModalInstance.close($scope.TileBorders);

        }
        $scope.SaveTileBackgrounds = function () {
            $scope.TileBorders.titletextcolor = $("#titletextcolor").val();
            $scope.TileBorders.titlebackgroundcolor = $("#titlebackgroundcolor").val();
            $scope.TileBorders.bodytextcolor = $("#bodytextcolor").val();
            $scope.TileBorders.bodybackgroundColor = $("#bodybackgroundColor").val();
            $uibModalInstance.close($scope.TileBorders);
        }

    }]);
    module.controller('dialogImportRulesetinCharecter', ['$scope', '$uibModalInstance', 'data', 'characterService', 'toaster', function ($scope, $uibModalInstance, data, characterService, toaster) {
        var characterProfileId = data.characterProfileId;
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }


        $scope.rulesetFileUpload = function (input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $scope.file = e.target.result
                };
                reader.readAsDataURL(input.files[0]);
                $scope.fileName = input.files[0].name;
            }
        }


        $scope.uploadFile = function () {
            var importRuleSet = {
                RuleSetId: characterProfileId,
                File: $scope.file,
            };

         
            characterService.uploadFileToUrl(characterProfileId, $scope.file, $scope.fileName).then(function (data) {

                if (data.data.StatusCode == 200) {
                    if (data.data.PayLoad == "Sucess") {
                        toaster.pop('success', 'Ruleset Imported Sucessfully');
                        $uibModalInstance.close(data.data.PayLoad);
                    }
                    else {
                        toaster.pop('error', data.data.ErrorMessage);
                        // $uibModalInstance.close(data.data.PayLoad);
                    }

                }
                else if (data.data.StatusCode == 400) {
                    toaster.pop('error', data.data.ErrorMessage);
                }

            });
        }

    }]);



    module.controller('dialogImportRuleset', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'toaster', function ($scope, $uibModalInstance, data, rulesetService, toaster) {

        var ruleSetId = data.ruleSetId;

        $scope.rulesetFileUpload = function (input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                   
                    $scope.file = e.target.result
                    //$scope.character.file = $scope.file;
                };
                reader.readAsDataURL(input.files[0]);
                $scope.fileName = input.files[0].name;
            }
        }

        $scope.uploadFile = function () {

            var importRuleSet = {
                RuleSetId: ruleSetId,
                File: $scope.file,
            };
            if (angular.isUndefined($scope.file) == true)
            {
                toaster.pop('error', 'Please select zip file');
                return false;
            }
            rulesetService.uploadFileToUrl(ruleSetId, $scope.file, $scope.fileName, $scope.RuleSetName).then(function (data) {
                if (data.data.StatusCode == 200) {

                    toaster.pop('success', 'Ruleset Imported Sucessfully');
                    $uibModalInstance.close(data.data.PayLoad);
                }

                else {
                    toaster.pop('error', data.data.ErrorMessage);
                   
                }
            });

        
        }
        $scope.cancel = function () {

            $uibModalInstance.close('');
        }
    }]);

  

    module.controller('dialogDefaultDiceSelect', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'layoutService', 'dialogs', 'rulesetDataShareService', function ($scope, $uibModalInstance, data, rulesetService, layoutService, dialogs, rulesetDataShareService) {
        $scope.Result = data.scope;
        $scope.CharacterId = data.CharacterId;
        $scope.Dicelist = data.Dice;
        $scope.Lastresult = data.LastResult;
        $scope.Corestats = rulesetDataShareService.getLayoutData();
        if ($scope.Result != undefined && $scope.Result != null) {
            if ($scope.Result.length <= 0) {
                $scope.ShowNonNumericCorestats = true;
            }
        }
        $uibModalInstance.rendered.then(function () {
            if (data.mode == 1) {
                //dice_initialize(document.body);
                if ($scope.Result != undefined && $scope.Result != null && $scope.Result != "")
                {
                    $("#customset").val($scope.Result);
                }
                diceselectcommand();
            }
            else if (data.mode == 2) {

                if ($scope.Result.length <= 0) {
                    $scope.ShowNonNumericCorestats = true;
                }

                $scope.DiceVisible = false;
                if ($scope.Result.TileTypeName == "Execute") {
                    if ($scope.Result.ItemProperties != null) {
                        if ($scope.Result.ItemProperties[10].Value.Text.value != null) {
                            var command = $scope.Result.ItemProperties[10].Value.Text.value;
                            $("#customset").val(command);
                        }
                        else {
                            var command = "4d6 + d20";
                            $("#customset").val(command);
                        }
                    }
                }
                else if ($scope.Result.TileTypeName == "Command") {
                    if ($scope.Result.Value.Command.command != null) {
                        var command = $scope.Result.Value.Command.command;
                        $("#customset").val(command);
                    }
                }
                else if ($scope.Result.TileTypeName == "Attribute") {
                    var command = $scope.Result.Command;
                    $("#customset").val(command);
                }
                else {
                    var command = "4d6 + d20";
                    $("#customset").val(command);
                }

                dicerollwithcommand(command)
            }
            else if (data.mode == 3) {

                var dice = layoutService.GetDice($scope.Result);
                dice.then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.DiceList = data.data.PayLoad;
                        $scope.DiceVisible = true;
                    }
                });

                dicerollwithoutcommand();

            }
        });

        $scope.DefaultDiceSelect = function () {

            var dice = $("#customset").val();
            $uibModalInstance.close(dice);
        }

        $scope.DiceSaveCommand = function () {

            var dice = $("#customset").val();
            //var result = $("div#sethelp")[0].innerHTML;
            if (dicenotationvalidator(dice)) {
                var dlg = dialogs.create('/views/dialogs/adddicename.html', 'dialogDefaultDiceSelect',
                    { scope: dice, Dice: $scope.DiceList, LastResult: $scope.Lastresult, CharacterId: $scope.Result }
                );
                dlg.result.then(function (res) {

                    $scope.DiceList = res;
                })
            } else {
                alert('Invalid Command');
            }
        }

        $scope.save = function () {
            var dicesave =
                {
                    CharacterId: $scope.CharacterId,
                    Name: $scope.Name,
                    Command: $scope.Result,
                    LastRunResult: $scope.Lastresult
                };
            var savedice = layoutService.SaveDice(dicesave);
            savedice.then(function (data) {
                if (data.data.StatusCode == 200) {
                    $scope.Dicelist.push(dicesave);
                    $uibModalInstance.close($scope.Dicelist);
                }
            })

        }
        $scope.ShowCommand = function (name) {
            for (var i = 0; i < $scope.DiceList.length; i++) {
                if (name == $scope.DiceList[i].Name) {
                    $("#customset").val($scope.DiceList[i].Command);
                }
            }
        }
        $scope.AddNumericCorestats = function () {
            $scope.NumericCorestats = [];
            for (var i = 0; i < $scope.Corestats.CorestatValues.length; i++) {
                if ($scope.Corestats.CorestatValues[i].TypeId == 5 || $scope.Corestats.CorestatValues[i].TypeId == 6 || $scope.Corestats.CorestatValues[i].TypeId == 14)
                    $scope.NumericCorestats.push($scope.Corestats.CorestatValues[i].Name);
            }
            var dlg = dialogs.create('/views/dialogs/addnumericcorestats.html', 'dialogDefaultDiceSelect',
                { scope: $scope.NumericCorestats }
            );
            dlg.result.then(function (res) {
            })

        }
        

        $scope.ShowCorestatValue = function () {
            $scope.CurrentMaxValue = false;
            $scope.ValueSubValue = false;
            $scope.Number = false;
            for (var i = 0; i < $scope.Corestats.CorestatValues.length; i++) {
                if ($scope.corestattype == $scope.Corestats.CorestatValues[i].CorestatName) {
                    if ($scope.Corestats.CorestatValues[i].Value.CurrentAndMaxValue != null) {
                        $scope.CurrentMaxValue = true;
                        $scope.ValueSubValue = false;
                        $scope.Number = false;
                        $scope.currenttext = false;
                        $scope.maxtext = false;
                        $scope.subvaltext = false;
                        $scope.valtext = false;
                        $scope.CurrentMaxVal = false;
                    }
                    else if ($scope.Corestats.CorestatValues[i].Value.ValueAndSubValue != null) {
                        $scope.CurrentMaxValue = false;
                        $scope.ValueSubValue = true;
                        $scope.Number = false;
                        $scope.currenttext = false;
                        $scope.maxtext = false;
                        $scope.subvaltext = false;
                        $scope.valtext = false;
                        $scope.ValSub = false;
                    }
                    else if ($scope.Corestats.CorestatValues[i].Value.Number != null) {
                        $scope.CurrentMaxValue = false;
                        $scope.ValueSubValue = false;
                        $scope.Number = true;
                        $scope.currenttext = false;
                        $scope.maxtext = false;
                        $scope.subvaltext = false;
                        $scope.valtext = false;
                        $scope.number = $scope.Corestats.CorestatValues[1].Value.Number.value;
                    }
                }
            }
        }

       
        $scope.showcurrentmax = function (value) {
            $scope.currenttext = true;
            $scope.maxtext = false;
            $scope.subvaltext = false;
            $scope.valtext = false;
            for (var i = 0; i < $scope.Corestats.CorestatValues.length; i++) {
                if ($scope.corestattype == $scope.Corestats.CorestatValues[i].CorestatName) {
                    if (value == 'MaxValue') {
                        $scope.value = 'MaxValue';
                        $scope.maxtext = true;
                        $scope.currenttext = false;
                        $scope.max = $scope.Corestats.CorestatValues[i].Value.CurrentAndMaxValue.MaxValue;
                    }
                    else if (value == 'CurrentValue') {
                        $scope.value = 'CurrentValue';
                        $scope.maxtext = false;
                        $scope.currenttext = true;
                        $scope.current = $scope.Corestats.CorestatValues[i].Value.CurrentAndMaxValue.CurrentValue;
                    }
                }
            }
        }

       
        $scope.showValueSubvalue = function (value) {
            $scope.currenttext = false;
            $scope.maxtext = false;
            $scope.subvaltext = true;
            $scope.valtext = false;
            for (var i = 0; i < $scope.Corestats.CorestatValues.length; i++) {
                if ($scope.corestattype == $scope.Corestats.CorestatValues[i].CorestatName) {
                    if (value == 'Value') {
                        $scope.value = 'Value';
                        $scope.valtext = true;
                        $scope.subvaltext = false;
                        $scope.val = $scope.Corestats.CorestatValues[i].Value.ValueAndSubValue.value;
                    }
                    else if (value == 'SubValue') {
                        $scope.value = 'SubValue';
                        $scope.valtext = false;
                        $scope.subvaltext = true;
                        $scope.subval = $scope.Corestats.CorestatValues[i].Value.ValueAndSubValue.subvalue;
                    }
                }
            }
        }
        $scope.SaveCorestatValues = function () {

            //if ($scope.checked && !$scope.subvalue && !$scope.currentvalue) {
            for (var i = 0; i < $scope.Corestats.CorestatValues.length; i++) {
                if ($scope.corestatype == $scope.Corestats.CorestatValues[i].Name) {
                    var diceresult = $("#customset").val();
                    if ($scope.Corestats.CorestatValues[i].Value.CurrentAndMaxValue != null) {
                        if ($scope.value == 'MaxValue' && $scope.Corestats.CorestatValues[i].Value.CurrentAndMaxValue.MaxValue != null) {
                            $scope.value = diceresult + " +" + $scope.Corestats.CorestatValues[i].Value.CurrentAndMaxValue.MaxValue;
                        }
                        else if ($scope.value == 'CurrentValue' && $scope.Corestats.CorestatValues[i].Value.CurrentAndMaxValue.CurrentValue != null) {
                            $scope.value = diceresult + " +" + $scope.Corestats.CorestatValues[i].Value.CurrentAndMaxValue.CurrentValue;
                        }
                        $("#customset").val($scope.value);
                        $uibModalInstance.dismiss($("#customset").val($scope.value));
                    }
                    else if ($scope.Corestats.CorestatValues[i].Value.ValueAndSubValue != null) {
                        if ($scope.value == 'Value' && $scope.Corestats.CorestatValues[i].Value.ValueAndSubValue.value != null) {
                            $scope.value = diceresult + " +" + $scope.Corestats.CorestatValues[i].Value.ValueAndSubValue.value;
                        }
                        else if ($scope.value == 'SubValue' && $scope.Corestats.CorestatValues[i].Value.ValueAndSubValue.subvalue != null) {
                            $scope.value = diceresult + " +" + $scope.Corestats.CorestatValues[i].Value.ValueAndSubValue.subvalue;
                        }
                        $("#customset").val($scope.value);
                        $uibModalInstance.dismiss($("#customset").val($scope.value));
                    }
                    else if ($scope.corestatype == $scope.Corestats.CorestatValues[i].Name) {
                        var diceresult = $("#customset").val();
                        $scope.value = diceresult + "+" + $scope.Corestats.CorestatValues[i].Value.Number.value;
                        $("#customset").val($scope.value);
                        $uibModalInstance.dismiss($("#customset").val($scope.value));

                    }

                }
            }
        }
        
        $scope.Tracing = function () {
            diceselectcommandtrace();
        }
        $scope.cancel = function () {

            $uibModalInstance.close('');
        }




    }]);


    //For New Design

    module.controller('dialogGeneralSettings', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'toaster', 'dialogs', function ($scope, $uibModalInstance, data, rulesetService, toaster, dialogs) {
        //if (data.btntext == "Copy")
        //{
        //    data.scope[0].RulesetName = "";
        //}
		$scope.showimagebtns = false;
		$scope.GeneralSettings = data.scope;
		$scope.imageLoaded = false;
		console.log("$scope.GeneralSettings : ", $scope.GeneralSettings);
		$scope.buttontext = data.btntext;
        $scope.pageName = data.tabname;
        $scope.Disabled = data.Disabled;
        $scope.DisableName = data.DisableName;
        $scope.RulesetData = function () {
            rulesetService.GetRuleSets().then(function (data) {
                if (data.data.StatusCode == 200) {
                    $scope.RuleSets = data.data.PayLoad;
                    $scope.HeaderContents = rulesetDataShareService.getDisplayCharacterRulesetCount();
                    $scope.HeaderContents.TotalRuleSetCount = $scope.RuleSets.length;
                    $("#loading").fadeOut("slow");
                }
            });
        }
		$scope.OpenFile = function () {
			$("#newRulesetImage").click();
			//var input = $('input[type=file]');//.val();
			//input.click();
			//return false;
		}
		$scope.ItemImageUpload = function (input) {
			console.log("File Input: ", input);
			$scope.showimagebtns = false;
			if (input.files && input.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					//console.log("e.target.result: "+e.target.result);
					$scope.$apply(function () {
						$scope.GeneralSettings[2].Value.Image.image = e.target.result;
					});
					
					
				};
				reader.readAsDataURL(input.files[0]);
				
			}
		}

		$scope.OpenManageRuleset = function () {
			console.log("OPenManageRuleSet");
			data.openManageRuleset($scope.GeneralSettings[0].RulesetId);
		}

		$scope.OpenBingSearch = function () {
			console.log("OPenManageRuleSet");
			data.OpenBingSearch();
		}

		$scope.ManageRuleset = function () {
			console.log("$Scope.generalsettings: "+ $scope.GeneralSettings[0].RulesetId);
            $("#loading").css("display", "block");
            if ($scope.GeneralSettings[0].RulesetId == 0) {
                var savesettings = rulesetService.CreateGeneralSettings($scope.GeneralSettings);
                savesettings.then(function (data) {
                    //$("#loading").fadeOut("slow");
                    if (data.data.StatusCode == 200)
                    {
                        $scope.GeneralSettings = data.data.PayLoad;
                        $uibModalInstance.close($scope.GeneralSettings);
                        $("#loading").fadeOut("slow");
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop('error', data.data.ErrorMessage);
                            $("#loading").fadeOut("slow");
                        }
                    }
                })
            }
            else if ($scope.GeneralSettings[0].RulesetId != 0 && $scope.buttontext == "Update") {
                var updategeneralsettings = rulesetService.UpdateGeneralSettings($scope.GeneralSettings);
                updategeneralsettings.then(function (data) {
           
                    $("#loading").fadeOut("slow");
                    if (data.data.StatusCode == 200) {
                        $scope.GeneralSettings = data.data.PayLoad;
                        $uibModalInstance.close($scope.GeneralSettings);
                        $("#loading").fadeOut("slow");
                    }
                })
            }

            else if ($scope.GeneralSettings[0].RulesetId != 0 && $scope.buttontext == "Copy") {
                var _rulesetID = $scope.GeneralSettings[0].RulesetId;
                var Name = $scope.GeneralSettings[0].RulesetName;
                var CopyRuleset = rulesetService.CopyRulesetByRulesetId(_rulesetID, Name);
                CopyRuleset.then(function (data) {
           
                    $("#loading").fadeOut("slow");
                    if (data.data.StatusCode == 200) {
                        //$scope.GeneralSettings = data.data.PayLoad.Result;
                        $uibModalInstance.close(data.data.PayLoad.Result);
                        $("#loading").fadeOut("slow");
                    }
                })
            }
        }
        $scope.cancel = function () {
           // $("#loading").css("display", "block");
            $uibModalInstance.close('cancel');
           // $("#loading").fadeOut("slow");
        }

    }]);
    module.controller('dialogManageRuleset', ['$scope', '$uibModalInstance', 'data', 'rulesetService', 'toaster', 'dialogs', 'rulesetDataShareService', '$interval', function ($scope, $uibModalInstance, data, rulesetService, toaster, dialogs, rulesetDataShareService, $interval) {

		console.log("RulesetGeneralSettings: ", data.scope);
		$scope.GeneralSettings = data.scope;
		//$scope.RulesetID = data.scope;
        $scope.ShowAllRulesetContent = function (value) {
            $scope.Response = value;
            //$scope.Response.RulesetID = $scope.RulesetID;
            $uibModalInstance.close($scope.Response);

        }

        $scope.ExportRuleSet = function () {
            var rulesetId = rulesetDataShareService.getRulesetsData();
            rulesetService.ExportRuleset(rulesetId);
           // $interval(toaster.pop("success", "RuleSet Exported Successfully."), 45000);
        }

        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }

    }]);

})();