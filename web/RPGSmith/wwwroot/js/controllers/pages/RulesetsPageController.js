(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('ruleSetPageController', ['$scope', '$timeout', '$location', '$state', '$window', '$element', 'dialogs', 'navService', 'rulesetService', 'rulesetDataShareService', 'toaster', '$log', 'tileService',
        function ($scope, $timeout, $location, $state, $window, $element, dialogs, navService, rulesetService, rulesetDataShareService, toaster, $log, tileService) {

            $scope.action = "";
            $scope.spellslist = true;
			$scope.limit = 2;
			$scope.showimagebtns = false;

            $scope.$on("$destroy", function () {
                rulesetDataShareService.setRulesetData($scope.NewRuleSet);
            });
            function GetRulesets() {
                rulesetService.GetRuleSets().then(function (data) {
                    $("#loading").fadeOut("slow");
                    if (data.data.StatusCode == 200) {
                        $scope.RuleSets = data.data.PayLoad;
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                toaster.pop("error", data.data.ErrorMessage);
                            }
                        }
                    }
                });
			}

			$scope.OpenFile = function () {
				$(".input-image").find("input[type=file]").click();
				//var input = $('input[type=file]');//.val();
				//input.click();
				//return false;
			}
			

            $scope.ImportRuleSet = function () {
                var dlg = dialogs.create('/views/dialogs/rulesetimport.html', 'dialogImportRuleset',
                    { ruleSetId: 25 }//Need to implement logic
                );

                dlg.result.then(function (res) {
                    GetRulesets();
                    var Rid = res;
                    var getData = rulesetService.GetNewRulesetByRuleSetId(Rid);
                    getData.then(function (data) {
                        $("#loading").fadeOut("slow");
                        if (data.data.StatusCode == 200) {
                            $scope.NewRuleSet = data.data.PayLoad
                            $scope.ItemProperties = $scope.NewRuleSet.RuleSetMetaData.ItemProperties;
                            $scope.SpellProperties = $scope.NewRuleSet.RuleSetMetaData.SpellProperties;
                            $scope.AbilityProperties = $scope.NewRuleSet.RuleSetMetaData.AbilityProperties;
                            $scope.CoreStatProperties = $scope.NewRuleSet.RuleSetMetaData.Corestats;

                            $scope.NewRuleSet.ImportRquired = true;

                            rulesetDataShareService.setRulesetData(null);
                            rulesetDataShareService.setRulesetData($scope.NewRuleSet);

                            if ($scope.NewRuleSet.Corestats.length == 0) {
                                $scope.NewRuleSet.IsAddDisabled = false;
                                $scope.iscorestatsadded = false;
                            }
                            else {
                                $scope.NewRuleSet.IsAddDisabled = true;
                                $scope.iscorestatsadded = true;
                            }
                            if ($scope.NewRuleSet.Items.length == 0) {
                                $scope.isitemsadded = false;
                            }
                            else {
                                $scope.isitemsadded = true;
                            }
                            if ($scope.NewRuleSet.Spells.length == 0) {
                                $scope.isspellsadded = false;
                            }
                            else {
                                $scope.isspellsadded = true;
                            }
                            if ($scope.NewRuleSet.Abilities.length == 0) {
                                $scope.isabilitiesadded = false;
                            }
                            else {
                                $scope.isabilitiesadded = true;
                            }

                            if (angular.equals({}, rulesetDataShareService.getruleset()) == false) {
                                $scope.NewRuleSet = rulesetDataShareService.getruleset();
                                if ($scope.NewRuleSet.Corestats != null) {
                                    if ($scope.NewRuleSet.Corestats.length > 0) {
                                        $scope.iscorestatsadded = true;
                                    }
                                }
                                if ($scope.NewRuleSet.Items != null) {
                                    if ($scope.NewRuleSet.Items.length > 0) {
                                        $scope.isitemsadded = true;
                                    }
                                }
                                if ($scope.NewRuleSet.Spells != null) {
                                    if ($scope.NewRuleSet.Spells.length > 0) {
                                        $scope.isspellsadded = true;
                                    }
                                }
                                if ($scope.NewRuleSet.Abilities != null) {
                                    if ($scope.NewRuleSet.Abilities.length > 0) {
                                        $scope.isabilitiesadded = true;
                                    }
                                }
                            }
                         

                            for (var i = 0; i < $scope.NewRuleSet.Corestats.length; i++) {
                                var result = $scope.NewRuleSet.Corestats[i];
                                for (var k = 0; k < $scope.Types.length; k++) {
                                    if ($scope.Types[k].TypeId == result.TypeId) {
                                        result.TypeName = $scope.Types[k].Name;
                                    }
                                }
                            }
                            $scope.ItemsCount = $scope.NewRuleSet.Items.length;
                            $scope.SpellsCount = $scope.NewRuleSet.Spells.length;
                            $scope.AbilitiesCount = $scope.NewRuleSet.Abilities.length;
                            if (CopyOrUpdate == 0) {
                                $scope.NewRuleSet.Action = "Copy";
                                $scope.NewRuleSet.ActionIcon = "fa fa-clone";
                                $scope.NewRuleSet.Heading = "Copy Ruleset Details";
                            }
                            else {
                                $scope.NewRuleSet.Action = "Update";
                                $scope.NewRuleSet.ActionIcon = "fa fa-pencil-square-o";
                                $scope.NewRuleSet.Heading = "Update Ruleset Details for " + $scope.NewRuleSet.Name;
                            }
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        }
                    },
                        function () {
                            toaster.pop("error", 'Error in getting records');
                        });


                });
            }
            if ($state.params.action == 1) {
                $("#loading").css("display", "block");
                rulesetService.GetRuleSets().then(function (data) {
                    $("#loading").fadeOut("slow");
                    if (data.data.StatusCode == 200) {
                        $scope.RuleSets = data.data.PayLoad;
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                toaster.pop("error", data.data.ErrorMessage);
                            }
                        }
                    }
                });

                $scope.RulesetData = function () {
                    rulesetService.GetRuleSets().then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.RuleSets = data.data.PayLoad;
                            $scope.HeaderContents = rulesetDataShareService.getDisplayCharacterRulesetCount();
                            $scope.HeaderContents.TotalRuleSetCount = $scope.RuleSets.length;
                            $("#loading").fadeOut("slow");
                            toaster.pop('success', $scope.payload);
                        }
                    });
                }
                $scope.rulesets = function () {
                    $state.go('profile.NewRuleSet', { 'RuleSetId': 0, 'isNew': 1, 'IsAddRuleSet': 1 });
                }
                $scope.editRuleSet = function (ruleset) {
                    $scope.CopyOrUpdate = 1;
                    $state.go('profile.NewRuleSet', { 'RuleSetId': ruleset.Id, 'isNew': 1, 'CopyOrUpdate': 1 });
                }
                $scope.copyRuleSet = function (ruleset) {
                    $scope.CopyOrUpdate = 0;
                    $state.go('profile.NewRuleSet', { 'RuleSetId': ruleset.Id, 'isNew': 1, 'CopyOrUpdate': 0 });
                }
                $scope.deleteRuleSet = function (ruleset, counter) {
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'You are about to delete ' + ruleset.Name + '. Are you sure?',
                        { size: "sm" }
                    );
                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                $("#loading").css("display", "block");
                                var ruleSetId = ruleset.Id;
                                var Rulesetdelete = rulesetService.DeleteRuleSet(ruleset.Id);
                                Rulesetdelete.then(function (data) {
                                    $("#loading").fadeOut("slow");
                                    if (data.data.StatusCode == 200) {
                                        var deletedRuleSetIndex = -1;
                                        for (var i = 0; i < $scope.RuleSets.length; i++) {
                                            if ($scope.RuleSets[i].Id == ruleSetId) {
                                                deletedRuleSetIndex = i;
                                            }
                                        }
                                        if (deletedRuleSetIndex > -1) {
                                            $scope.RuleSets.splice(deletedRuleSetIndex, 1);
                                            toaster.pop('success', "RuleSet Deleted Successfully");
                                        }
                                    }
                                    else {
                                        if (data.data.StatusCode == 400) {
                                            if (data.data.ShowToUser == true) {
                                                toaster.pop('error', data.data.ErrorMessage);
                                            }
                                        }
                                    }
                                })
                            }

                        });
                   
                }
                // Export Ruleset
                $scope.exportRuleSet = function (ruleset, counter) {
                    $("#loading").css("display", "block");
                    var Result = rulesetService.ImportRuleset(ruleset.Id);
                    Result.then(function (data) {
                        $("#loading").fadeOut("slow");
                        if (data.data != "") {
                            var anchor = angular.element('<a/>');
                            anchor.attr({
                                href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data.data),
                                target: '_blank',
                                download: "Ruleset_" + ruleset.Name + ".csv"
                            })[0].click();
                        }

                    }
                    );
                }


            }
            else if ($state.params.action == 2) {

                if (angular.equals({}, rulesetDataShareService.getRulesetData()) == false) {
                    $scope.NewRuleSet = rulesetDataShareService.getRulesetData();
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
                                toaster.pop("error", data.data.ErrorMessage);
                            }
                        }
                    }
                });

                $scope.iscorestatsadded = false;
                $scope.isitemsadded = false;
                $scope.isspellsadded = false;
                $scope.isabilitiesadded = false;
                $scope.tabName = "ITEM";

                var RuleSetId = $state.params.RuleSetId;

                var CopyOrUpdate = $state.params.CopyOrUpdate;

                if ($state.params.isNew == 1) {
                    if (parseInt(RuleSetId) > 0) {
                        UpdateRuleSet(parseInt(RuleSetId), CopyOrUpdate);
                    }
                    else {
                        AddRuleSet();
                    }
                }
                else {
                    if (angular.equals({}, rulesetDataShareService.getRulesetData()) == false) {
                        $scope.NewRuleSet = rulesetDataShareService.getRulesetData();
                        $scope.ItemProperties = $scope.NewRuleSet.RuleSetMetaData.ItemProperties;
                        $scope.SpellProperties = $scope.NewRuleSet.RuleSetMetaData.SpellProperties;
                        $scope.AbilityProperties = $scope.NewRuleSet.RuleSetMetaData.AbilityProperties;
                        $scope.CoreStatProperties = $scope.NewRuleSet.RuleSetMetaData.Corestats;
                    }

                    if ($scope.NewRuleSet.Corestats != null) {
                        if ($scope.NewRuleSet.Corestats.length == 0) {
                            $scope.NewRuleSet.IsAddDisabled = false;
                            $scope.iscorestatsadded = false;
                        }
                        else {
                            $scope.NewRuleSet.IsAddDisabled = true;
                            $scope.iscorestatsadded = true;
                        }
                    }
                    else
                        $scope.iscorestatsadded = false;


                    if ($scope.NewRuleSet.Items != null) {
                        if ($scope.NewRuleSet.Items.length == 0) {
                            $scope.isitemsadded = false;
                        }
                        else {
                            $scope.isitemsadded = true;
                        }
                    }
                    else
                        $scope.isitemsadded = false;


                    if ($scope.NewRuleSet.Spells != null) {
                        if ($scope.NewRuleSet.Spells.length == 0) {
                            $scope.isspellsadded = false;
                        }
                        else {
                            $scope.isspellsadded = true;
                        }
                    }
                    else
                        $scope.isspellsadded = false;


                    if ($scope.NewRuleSet.Abilities != null) {
                        if ($scope.NewRuleSet.Abilities.length == 0) {
                            $scope.isabilitiesadded = false;
                        }
                        else {
                            $scope.isabilitiesadded = true;
                        }
                    }
                    else
                        $scope.isabilitiesadded = false;

                }
                $scope.tab = 1;

                $scope.setTab = function (newTab) {
                    if (newTab == 1) {
                        $scope.tabName = "ITEM";
                    }
                    else if (newTab == 2) {
                        $scope.tabName = "SPELL";
                    }
                    else if (newTab == 3) {
                        $scope.tabName = "ABILITY";
                    }
                    $scope.tab = newTab;
                };

                $scope.isSet = function (tabNum) {
                    return $scope.tab === tabNum;
                };
                $scope.GetRulesets = function () {
                    $window.localStorage.setItem("RuleSetId", 0);
                    $state.go("profile.AddNewRuleSet");

                };
                $scope.BackCharacters = function () {
                    return navService.gotoCharacters();
                }

                $scope.ImportRuleSet = function (ruleset) {
                    var dlg = dialogs.create('/views/dialogs/rulesetimport.html', 'dialogImportRuleset',
                        { ruleSetId: $scope.NewRuleSet.Id }
                    );

                    dlg.result.then(function (res) {

                        var Rid = res;
                        var getData = rulesetService.GetNewRulesetByRuleSetId(Rid);
                        getData.then(function (data) {
                            $("#loading").fadeOut("slow");
                            if (data.data.StatusCode == 200) {
                                $scope.NewRuleSet = data.data.PayLoad
                                $scope.ItemProperties = $scope.NewRuleSet.RuleSetMetaData.ItemProperties;
                                $scope.SpellProperties = $scope.NewRuleSet.RuleSetMetaData.SpellProperties;
                                $scope.AbilityProperties = $scope.NewRuleSet.RuleSetMetaData.AbilityProperties;
                                $scope.CoreStatProperties = $scope.NewRuleSet.RuleSetMetaData.Corestats;

                                $scope.NewRuleSet.ImportRquired = true;

                                rulesetDataShareService.setRulesetData(null);
                                rulesetDataShareService.setRulesetData($scope.NewRuleSet);

                                if ($scope.NewRuleSet.Corestats.length == 0) {
                                    $scope.NewRuleSet.IsAddDisabled = false;
                                    $scope.iscorestatsadded = false;
                                }
                                else {
                                    $scope.NewRuleSet.IsAddDisabled = true;
                                    $scope.iscorestatsadded = true;
                                }
                                if ($scope.NewRuleSet.Items.length == 0) {
                                    $scope.isitemsadded = false;
                                }
                                else {
                                    $scope.isitemsadded = true;
                                }
                                if ($scope.NewRuleSet.Spells.length == 0) {
                                    $scope.isspellsadded = false;
                                }
                                else {
                                    $scope.isspellsadded = true;
                                }
                                if ($scope.NewRuleSet.Abilities.length == 0) {
                                    $scope.isabilitiesadded = false;
                                }
                                else {
                                    $scope.isabilitiesadded = true;
                                }

                                if (angular.equals({}, rulesetDataShareService.getruleset()) == false) {
                                    $scope.NewRuleSet = rulesetDataShareService.getruleset();
                                    if ($scope.NewRuleSet.Corestats != null) {
                                        if ($scope.NewRuleSet.Corestats.length > 0) {
                                            $scope.iscorestatsadded = true;
                                        }
                                    }
                                    if ($scope.NewRuleSet.Items != null) {
                                        if ($scope.NewRuleSet.Items.length > 0) {
                                            $scope.isitemsadded = true;
                                        }
                                    }
                                    if ($scope.NewRuleSet.Spells != null) {
                                        if ($scope.NewRuleSet.Spells.length > 0) {
                                            $scope.isspellsadded = true;
                                        }
                                    }
                                    if ($scope.NewRuleSet.Abilities != null) {
                                        if ($scope.NewRuleSet.Abilities.length > 0) {
                                            $scope.isabilitiesadded = true;
                                        }
                                    }
                                }
                               

                                for (var i = 0; i < $scope.NewRuleSet.Corestats.length; i++) {
                                    var result = $scope.NewRuleSet.Corestats[i];
                                    for (var k = 0; k < $scope.Types.length; k++) {
                                        if ($scope.Types[k].TypeId == result.TypeId) {
                                            result.TypeName = $scope.Types[k].Name;
                                        }
                                    }
                                }
                                $scope.ItemsCount = $scope.NewRuleSet.Items.length;
                                $scope.SpellsCount = $scope.NewRuleSet.Spells.length;
                                $scope.AbilitiesCount = $scope.NewRuleSet.Abilities.length;
                                if (CopyOrUpdate == 0) {
                                    $scope.NewRuleSet.Action = "Copy";
                                    $scope.NewRuleSet.ActionIcon = "fa fa-clone";
                                    $scope.NewRuleSet.Heading = "Copy Ruleset Details";
                                }
                                else {
                                    $scope.NewRuleSet.Action = "Update";
                                    $scope.NewRuleSet.ActionIcon = "fa fa-pencil-square-o";
                                    $scope.NewRuleSet.Heading = "Update Ruleset Details for " + $scope.NewRuleSet.Name;
                                }
                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }
                            }
                        },
                            function () {
                                toaster.pop("error", 'Error in getting records');
                            });


                    });
                }
                $scope.addNewCoreStat = function () {
                    $scope.OperationTypeMode = "Create"
                    $scope.CoreStatsInGrid = [];
                    $scope.CoreStatProperties.Name = "";
                    if ($scope.NewRuleSet.Corestats != null) {
                        for (var i = 0; i < $scope.NewRuleSet.Corestats.length; i++) {
                            if ($scope.NewRuleSet.Corestats[i].TypeId == 14 || $scope.NewRuleSet.Corestats[i].TypeId == 5 || $scope.NewRuleSet.Corestats[i].TypeId == 6) {
                                $scope.CoreStatsInGrid.push($scope.NewRuleSet.Corestats[i]);
                            }
                        }
                        $scope.CoreStatsNameInGrid = $scope.NewRuleSet.Corestats;
                    }
                    $scope.CoreStatProperties.TypeId = "";
                    $scope.CoreStatProperties.Description = "";
                    $scope.IsButtonDisabled = true;
                    $scope.CoreStatProperties.Heading = "New Character Stats Details";
                    $scope.isInDatabaseCoreStat = true;
                    $scope.pageName = "New Character stat";
                    $scope.buttontext = "Save";
                    var dlg = dialogs.create('/views/dialogs/addnewcorestat.html', 'dialogCreateCoreStat',
                        { scope: $scope.CoreStatProperties, btntext: $scope.buttontext, tabname: $scope.pageName, IsenableBtn: $scope.IsButtonDisabled, CoreStatsInGrid: $scope.CoreStatsInGrid, CoreStatsNameInGrid: $scope.CoreStatsNameInGrid, CoreStatMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                        if (res != 'cancel') {
                            if ($scope.NewRuleSet.Corestats == null || $scope.NewRuleSet.Corestats == undefined) {
                                $scope.NewRuleSet.Corestats = [];
                            }
                            $scope.NewRuleSet.Corestats.push(res);

                            //rulesetDataShareService.setRulesetData($scope.NewRuleSet);

                            //rulesetDataShareService.setcorestat($scope.NewRuleSet.Corestats);
                            $scope.iscorestatsadded = true;
                        }
                    });
                };



                $scope.createitems = function () {
                    $scope.buttontext = "Create";
                    $scope.tabName = "Create New Item";
                    $scope.IsButtonDisabled = false;
                    $scope.isBtnShow = false;
                    $scope.OperationTypeMode = "Create"
                    var weight = "";
                    var volume = "";
                    $scope.Content_ItemProperties = [];
                    if ($scope.NewRuleSet.Items != null) {
                        for (var i = 0; i < $scope.NewRuleSet.Items.length; i++) {
                            $scope.Content_ItemProperties.push($scope.NewRuleSet.Items[i].ItemProperties[0].Value.Text.value);
                        }
                    }
                    for (var i = 0; i < $scope.NewRuleSet.Rulesetproperty.length; i++) {
                        if ($scope.NewRuleSet.Rulesetproperty[i].TypeId == 7) {
                            weight = $scope.NewRuleSet.Rulesetproperty[i].Units.selectedUnit;
                        }
                    }
                    for (var j = 0; j < $scope.ItemProperties.length; j++) {
                        if ($scope.ItemProperties[j].TypeId == 7) {
                            $scope.ItemProperties[j].Value.Weight.units.selectedUnit = weight;
                        }
                    }
                    for (var i = 0; i < $scope.NewRuleSet.Rulesetproperty.length; i++) {
                        if (($scope.NewRuleSet.Rulesetproperty[i].TypeId == 1) && ($scope.NewRuleSet.Rulesetproperty[i].Name.indexOf('Volume') > -1)) {
                            volume = $scope.NewRuleSet.Rulesetproperty[i].Value.Text.value;
                        }
                    }
                    for (var j = 0; j < $scope.ItemProperties.length; j++) {
                        if ($scope.ItemProperties[j].TypeId == 13) {
                            $scope.ItemProperties[j].Value.Volume.units.selectedUnit = volume;
                        }
                    }
					console.log("$scope.ItemProperties: ", $scope.ItemProperties);
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCreateItem',
						{ OpenBingSearch: $scope.OpenBingSearch, OpenFile: $scope.OpenFile, scope: $scope.ItemProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Content_ItemProperties: $scope.Content_ItemProperties, ItemMode: $scope.OperationTypeMode, Spells: $scope.NewRuleSet.Spells, Abilities: $scope.NewRuleSet.Abilities }
                    );

                    dlg.result.then(function (res) {
                        if ($scope.NewRuleSet.Items == null || $scope.NewRuleSet.Items == undefined) {
                            $scope.NewRuleSet.Items = [];
                        }

                        if (res != "cancel") {
                            var NewItem = {}
                            NewItem.ItemProperties = res.Properties;
                            NewItem.AssociatedSpells = res.AssociatedSpells;
                            NewItem.AssociatedAbilities = res.AssociatedAbilities;

                          
                            $scope.NewRuleSet.Items.push(NewItem);
                            //rulesetDataShareService.set($scope.NewRuleSet.Items);
                            $scope.isitemsadded = true;
                        }
                    });


                };

                $scope.createspells = function () {
                    $scope.buttontext = "Create";
                    $scope.tabName = "Create New Spell";
                    $scope.isBtnShow = false;
                    $scope.OperationTypeMode = "Create"
                    var weight = "";
                    var volume = "";
                    $scope.Content_SpellProperties = [];
                    if ($scope.NewRuleSet.Spells != null) {
                        for (var i = 0; i < $scope.NewRuleSet.Spells.length; i++) {
                            $scope.Content_SpellProperties.push($scope.NewRuleSet.Spells[i].SpellProperties[0].Value.Text.value);
                        }
                    }
                    for (var i = 0; i < $scope.NewRuleSet.Rulesetproperty.length; i++) {
                        if ($scope.NewRuleSet.Rulesetproperty[i].TypeId == 7) {
                            weight = $scope.NewRuleSet.Rulesetproperty[i].Units.selectedUnit;
                        }
                    }
                    for (var j = 0; j < $scope.SpellProperties.length; j++) {
                        if ($scope.SpellProperties[j].TypeId == 7) {
                            $scope.SpellProperties[j].Value.Weight.units.selectedUnit = weight;
                        }
                    }
                    for (var i = 0; i < $scope.NewRuleSet.Rulesetproperty.length; i++) {
                        if (($scope.NewRuleSet.Rulesetproperty[i].TypeId == 1) && ($scope.NewRuleSet.Rulesetproperty[i].Name.indexOf('Volume') > -1)) {
                            volume = $scope.NewRuleSet.Rulesetproperty[i].Value.Text.value;
                        }
                    }
                    for (var j = 0; j < $scope.SpellProperties.length; j++) {
                        if ($scope.SpellProperties[j].TypeId == 13) {
                            $scope.SpellProperties[j].Value.Volume.units.selectedUnit = volume;
                        }
                    }
                    var dlg = dialogs.create('/views/dialogs/createspells.html', 'dialogCreateSpell',
                        { scope: $scope.SpellProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, Content_SpellProperties: $scope.Content_SpellProperties, SpellMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                        if ($scope.NewRuleSet.Spells == null || $scope.NewRuleSet.Spells == undefined) {
                            $scope.NewRuleSet.Spells = [];
                        }

                        if (res != "cancel") {
                            var SpellProperties = { "SpellProperties": res };
                            $scope.NewRuleSet.Spells.push(SpellProperties);
                            //rulesetDataShareService.setspell($scope.NewRuleSet.Spells);
                            $scope.isspellsadded = true;
                        }
                    });
                };

                $scope.createabilities = function () {
                    $scope.buttontext = "Create";
                    $scope.tabName = "Create New Ability";
                    $scope.isBtnShow = false;
                    $scope.OperationTypeMode = "Create"
                    var weight = "";
                    var volume = "";
                    $scope.Content_AbilityProperties = [];
                    if ($scope.NewRuleSet.Abilities != null) {
                        for (var i = 0; i < $scope.NewRuleSet.Abilities.length; i++) {
                            $scope.Content_AbilityProperties.push($scope.NewRuleSet.Abilities[i].AbilityProperties[0].Value.Text.value);
                        }
                    }
                    for (var i = 0; i < $scope.NewRuleSet.Rulesetproperty.length; i++) {
                        if ($scope.NewRuleSet.Rulesetproperty[i].TypeId == 7) {
                            weight = $scope.NewRuleSet.Rulesetproperty[i].Units.selectedUnit;
                        }
                    }
                    for (var j = 0; j < $scope.AbilityProperties.length; j++) {
                        if ($scope.AbilityProperties[j].TypeId == 7) {
                            $scope.AbilityProperties[j].Value.Weight.units.selectedUnit = weight;
                        }
                    }
                    for (var i = 0; i < $scope.NewRuleSet.Rulesetproperty.length; i++) {
                        if (($scope.NewRuleSet.Rulesetproperty[i].TypeId == 1) && ($scope.NewRuleSet.Rulesetproperty[i].Name.indexOf('Volume') > -1)) {
                            volume = $scope.NewRuleSet.Rulesetproperty[i].Value.Text.value;
                        }
                    }
                    for (var j = 0; j < $scope.AbilityProperties.length; j++) {
                        if ($scope.AbilityProperties[j].TypeId == 13) {
                            $scope.AbilityProperties[j].Value.Volume.units.selectedUnit = volume;
                        }
                    }
                    var dlg = dialogs.create('/views/dialogs/createabilities.html', 'dialogCreateAbility',
                        { scope: $scope.AbilityProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, Content_AbilityProperties: $scope.Content_AbilityProperties, AbilityMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                        if ($scope.NewRuleSet.Abilities == null || $scope.NewRuleSet.Abilities == undefined) {
                            $scope.NewRuleSet.Abilities = [];
                        }
                        if (res != "cancel") {
                            var AbilityProperties = { "AbilityProperties": res };
                            $scope.NewRuleSet.Abilities.push(AbilityProperties);
                            //rulesetDataShareService.setability($scope.NewRuleSet.Abilities);
                            $scope.isabilitiesadded = true;
                        }

                    });
                };


                $scope.showallCorestats = function () {
                    $state.go("profile.Corestats", { RuleSetId: $scope.NewRuleSet.Id });
                    //  rulesetDataShareService.setruleset($scope.NewRuleSet);
                }


                $scope.showallitems = function () {
                    $state.go("profile.Items", { RuleSetId: $scope.NewRuleSet.Id });
                    //rulesetDataShareService.setruleset($scope.NewRuleSet);
                }

                $scope.ShowallSpells = function () {
                    $state.go("profile.Spells", { RuleSetId: $scope.NewRuleSet.Id });
                    //rulesetDataShareService.setruleset($scope.NewRuleSet);

                }
                $scope.ShowallAbilities = function () {
                    $state.go("profile.Abilities", { RuleSetId: $scope.NewRuleSet.Id });
                    // rulesetDataShareService.setruleset($scope.NewRuleSet);

                }


                $scope.save = function () {
                    var ruleset = $scope.NewRuleSet;
                    $("#loading").css("display", "block");
                    switch ($scope.NewRuleSet.Action) {
                        case "Copy":
                            var Rulesetadd = rulesetService.copyRuleSet(ruleset);
                            break;
                        case "Update":
                            var Rulesetadd = rulesetService.updateRuleSet(ruleset);
                            break;
                        default:
                            var Rulesetadd = rulesetService.saveRuleSet(ruleset);
                            break;
                    }
                    Rulesetadd.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.payload = data.data.PayLoad
                            switch ($scope.NewRuleSet.Action) {
                                case "Add":
                                    toaster.pop('success', "RuleSet Added Successfully.");
                                    $timeout($state.go('profile.AddNewRuleSet'), 500);
                                    break;
                                case "Copy":
                                    toaster.pop('success', "RuleSet Copied Successfully.");
                                    $timeout($state.go('profile.AddNewRuleSet'), 500);
                                    break;
                                default:
                                    toaster.pop('success', $scope.payload);
                                    $timeout($state.go('profile.AddNewRuleSet'), 500);
                                    break;
                            }
                            $("#loading").fadeOut("slow");
                            rulesetService.GetRuleSets();
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                $("#loading").fadeOut("slow");
                                if (data.data.ShowToUser == true) {
                                    //$timeout($state.go('profile.AddNewRuleSet'), 500);
                                    toaster.pop('error', data.data.ErrorMessage);
                                }
                            }
                        }
                    },
                        function () {
                            //$timeout($state.go('profile.AddNewRuleSet'), 500);
                            toaster.pop('error', "Error in getting records");
                            //alert('Error in getting records');
                        });
                }

                $scope.cancel = function () {
                    if ($state.params.IsAddRuleSet == 1) {
                        $state.go('profile.AddNewRuleSet');
                    }
                    else {
                        $state.go('profile.characters');
                    }
                }



            }
            else if ($state.params.action == 3) {
              
                //$scope.lists = false;
                //$scope.list = true;
                //$scope.RulesetId = $state.params.RuleSetId;
                $scope.RulesetId = parseInt($state.params.RuleSetId);

                var url = $location.absUrl().split('?')[0];
                if (url.indexOf("Corestats") > 0) {
                    if (angular.equals({}, rulesetDataShareService.getcorestat()) == false) {
                        $scope.Corestats = rulesetDataShareService.getcorestat();
                        if ($scope.Corestats.length > 0) {
                            $scope.lists = false;
                            $scope.list = true;
                        }
                        else {
                            $scope.lists = true;
                            $scope.list = false;
                        }
                    }
                    else {
                        var corestats = rulesetService.GetRulesetCorestats(parseInt($state.params.RuleSetId));
                        corestats.then(function (data) {

                            if (data.data.StatusCode == 200) {
                                $scope.Corestats = data.data.PayLoad;
                                rulesetService.GetTypes().then(function (data) {

                                    if (data.data.StatusCode == 200) {
                                        $scope.Types = data.data.PayLoad;
                                        rulesetDataShareService.setcorestat($scope.Corestats);
                                        for (var i = 0; i < $scope.Types.length; i++) {
                                            for (var j = 0; j < $scope.Corestats.length; j++) {
                                                if ($scope.Types[i].TypeId == $scope.Corestats[j].TypeId) {
                                                    $scope.Corestats[j].TypeName = $scope.Types[i].Name;
                                                }
                                            }

                                        }
                                        if ($scope.Corestats.length > 0) {
                                            $scope.lists = false;
                                            $scope.list = true;
                                        }
                                        else {
                                            $scope.lists = true;
                                            $scope.list = false;
                                        }
                                        $state.go("profile.Corestats", { RuleSetId: parseInt($state.params.RuleSetId) })
                                        $("#loading").fadeOut("slow");
                                    }
                                    else {
                                        if (data.data.StatusCode == 400) {
                                            if (data.data.ShowToUser == true) {
                                                $("#loading").fadeOut("slow");
                                                toaster.pop("error", data.data.ErrorMessage);
                                                toaster.pop("error", data.data.ErrorMessage);
                                            }
                                        }
                                    }
                                });

                            }
                        })
                    }
                }
                else {
                    if (parseInt(RuleSetId) > 0) {
                        UpdateRuleSet(parseInt(RuleSetId), CopyOrUpdate);
                    }
                }


                $scope.addNewCoreStat = function () {

                    var corestatsmetadata = rulesetService.GetCorestatsMetadata();
                    corestatsmetadata.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.Corestats = rulesetDataShareService.getcorestat();
                            $scope.CoreStatProperties = data.data.PayLoad.RuleSetMetaData.Corestats;
                            $scope.OperationTypeMode = "Create"
                            $scope.CoreStatsInGrid = [];
                            $scope.CoreStatProperties.Name = "";
                            if ($scope.Corestats != null) {
                                for (var i = 0; i < $scope.Corestats.length; i++) {
                                    if ($scope.Corestats[i].TypeId == 14 || $scope.Corestats[i].TypeId == 5 || $scope.Corestats[i].TypeId == 6) {
                                        $scope.CoreStatsInGrid.push($scope.Corestats[i]);
                                    }
                                }
                                $scope.CoreStatsNameInGrid = $scope.Corestats;
                            }
                            $scope.CoreStatProperties.TypeId = "";
                            $scope.CoreStatProperties.Description = "";
                            $scope.IsButtonDisabled = true;
                            $scope.CoreStatProperties.Heading = "New Character Stats Details";
                            $scope.isInDatabaseCoreStat = true;
                            $scope.pageName = "New Character stat";
                            $scope.buttontext = "Save";
                            var dlg = dialogs.create('/views/dialogs/addnewcorestat.html', 'dialogCreateCoreStat',
                                { scope: $scope.CoreStatProperties, btntext: $scope.buttontext, tabname: $scope.pageName, IsenableBtn: $scope.IsButtonDisabled, CoreStatsInGrid: $scope.CoreStatsInGrid, CoreStatsNameInGrid: $scope.CoreStatsNameInGrid, CoreStatMode: $scope.OperationTypeMode }
                            );

                            dlg.result.then(function (res) {
                                if (res != 'cancel') {
                                    $scope.Corestatlist = [];
                                    //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                    res.RulesetId = $scope.RulesetId;
                                    $scope.Corestatlist.push(res);
                                    var savecorestat = rulesetService.CreateCorestats($scope.Corestatlist);
                                    savecorestat.then(function (data) {
                                        if (data.data.StatusCode == 200) {
                                            //$scope.Corestats = data.data.PayLoad.Result;
                                            $scope.Corestats = data.data.PayLoad;
                                            rulesetDataShareService.setcorestat($scope.Corestats);
                                            rulesetService.GetTypes().then(function (data) {

                                                if (data.data.StatusCode == 200) {
                                                    $scope.Types = data.data.PayLoad;
                                                    //$scope.Types = rulesetDataShareService.getRpgtypeData()
                                                    for (var i = 0; i < $scope.Types.length; i++) {
                                                        for (var j = 0; j < $scope.Corestats.length; j++) {
                                                            if ($scope.Types[i].TypeId == $scope.Corestats[j].TypeId) {
                                                                $scope.Corestats[j].TypeName = $scope.Types[i].Name;
                                                            }
                                                        }

                                                    }
                                                    if ($scope.Corestats.length > 0) {
                                                        $scope.lists = false;
                                                        $scope.list = true;
                                                    }
                                                    else {
                                                        $scope.lists = true;
                                                        $scope.list = false;
                                                    }

                                                    $state.go("profile.Corestats", { RuleSetId: $scope.RulesetId })
                                                }
                                            })

                                        }
                                        else if (data.data.StatusCode == 400) {
                                            if (data.data.ShowToUser == true)
                                            {
                                                toaster.pop("error", data.data.ErrorMessage);
                                            }
                                            
                                        }
                                    })
                                }
                            });
                        }
                    })

                };


                $scope.editCoreStat = function (coreStat) {
                    $scope.action = "update";
                    $window.localStorage.setItem("RuleSetId", coreStat.Id);
                    $window.localStorage.setItem("Action", "edit");
                    $scope.isInDatabaseCoreStat = false;
                    var resultdata = rulesetService.GetCoreStatById(coreStat.Id);
                    resultdata.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.CoreStatProperties = data.data.PayLoad;
                            $scope.CoreStatProperties.Heading = "Edit CoreStats Details";
                            var dlg = dialogs.create('/views/dialogs/addnewcorestat.html', 'dialogCreateCoreStat',
                                { scope: $scope.CoreStatProperties }
                            );

                            dlg.result.then(function (res) {
                                if (res != 'cancel') {
                                    if ($scope.NewRuleSet.Corestats == null || $scope.NewRuleSet.Corestats == undefined) {
                                        $scope.NewRuleSet.Corestats = [];
                                    }
                                    $scope.NewRuleSet.Corestats.push(res);
                                    $scope.iscorestatsadded = true;
                                }
                            });
                            $scope.CoreStatProperties.Action = "Update";
                            $scope.CoreStatProperties.Heading = "Update Ruleset Details for " + $scope.CoreStatProperties.Name;
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        }
                    },
                        function () {
                            toaster.pop("error", 'Error in getting records');

                        });

                }

                $scope.deleteCoreStat = function (coreStat) {
                    var IsConf = confirm('You are about to delete ' + coreStat.Name + '. Are you sure?');
                    if (IsConf) {
                        var CoreStatdelete = rulesetService.DeleteCoreStat(coreStat.Id);
                        $state.go("profile.AddNewRuleSet");
                    }
                }
                $scope.deleteCorestats = function (corestatindex) {
                    $scope.NewRuleSet.Corestats.splice(corestatindex, 1);
                }

                $scope.ShowChoice = function () {

                    if ($scope.TypeId == "2") {
                        $scope.result = true;
                    }
                    else {
                        $scope.result = false;

                    }
                }

                var Choices = [];
                $scope.AddChoices = { Choices: [] };
                $scope.AddChoice = function () {
                    $scope.AddChoices.Choices.push('');
                }

                //For Corestats
                $scope.CopyCorestat = function (item, count) {
                    $scope.Corestats = rulesetDataShareService.getcorestat();
                    $scope.pageName = "Copying Corestat";
                    $scope.buttontext = "Copy";
                    $scope.IsButtonDisabled = false;
                    $scope.OperationTypeMode = "Copy"
                    $scope.CoreStatsInGrid = [];

                    if ($scope.Corestats != null) {
                        for (var i = 0; i < $scope.Corestats.length; i++) {
                            if ($scope.Corestats[i].TypeId == 14 || $scope.Corestats[i].TypeId == 5 || $scope.Corestats[i].TypeId == 6) {
                                $scope.CoreStatsInGrid.push($scope.Corestats[i]);
                            }
                        }
                        $scope.CoreStatsNameInGrid = $scope.Corestats;
                    }
                    var dlg = dialogs.create('/views/dialogs/addnewcorestat.html', 'dialogCopyCoreStat',
                        { scope: item, btntext: $scope.buttontext, tabname: $scope.pageName, IsenableBtn: $scope.IsButtonDisabled, CoreStatsNameInGrid: $scope.CoreStatsNameInGrid, CoreStatsInGrid: $scope.CoreStatsInGrid, CoreStatMode: $scope.OperationTypeMode}
                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            $scope.CorestatList = [];
                            $scope.CorestatList.push(res);
                            var copycorestat = rulesetService.CopyCorestats($scope.CorestatList);
                            copycorestat.then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.Corestats = data.data.PayLoad;
                                    rulesetDataShareService.setcorestat($scope.Corestats);
                                    rulesetService.GetTypes().then(function (data) {

                                        if (data.data.StatusCode == 200) {
                                            $scope.Types = data.data.PayLoad;
                                            //$scope.Types = rulesetDataShareService.getRpgtypeData()
                                            for (var i = 0; i < $scope.Types.length; i++) {
                                                for (var j = 0; j < $scope.Corestats.length; j++) {
                                                    if ($scope.Types[i].TypeId == $scope.Corestats[j].TypeId) {
                                                        $scope.Corestats[j].TypeName = $scope.Types[i].Name;
                                                    }
                                                }

                                            }
                                            if ($scope.Corestats.length > 0) {
                                                $scope.lists = false;
                                                $scope.list = true;
                                            }
                                            else {
                                                $scope.lists = true;
                                                $scope.list = false;
                                            }

                                            $state.go("profile.Corestats", { RuleSetId: $scope.RulesetId })
                                        }
                                    })
                                    $state.go("profile.Corestats", { RuleSetId: $scope.NewRuleSet.Id })
                                }
                                else if (data.data.StatusCode == 400)
                                {
                                    if (data.data.ShowToUser == true) {
                                        toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }

                            })
                            //$scope.NewRuleSet.Corestats.push(res);
                        }
                    });
                } 

                $scope.EditCorestat = function (item, count) {
                    $scope.Corestats = rulesetDataShareService.getcorestat();
                    $scope.pageName = "Editing Corestat";
                    $scope.buttontext = "Update";
                    $scope.IsButtonDisabled = false;
                    $scope.OperationTypeMode = "Edit"
                    $scope.CoreStatsInGrid = [];
                    if ($scope.Corestats != null) {
                        for (var i = 0; i < $scope.Corestats.length; i++) {
                            if ($scope.Corestats[i].TypeId == 14 || $scope.Corestats[i].TypeId == 5 || $scope.Corestats[i].TypeId == 6) {
                                $scope.CoreStatsInGrid.push($scope.Corestats[i]);
                            }
                        }
                        $scope.CoreStatsNameInGrid = $scope.Corestats;
                    }
                    var dlg = dialogs.create('/views/dialogs/addnewcorestat.html', 'dialogCopyCoreStat',
                        { scope: item, btntext: $scope.buttontext, IsenableBtn: $scope.IsButtonDisabled, tabname: $scope.pageName, CoreStatsNameInGrid: $scope.CoreStatsNameInGrid, CoreStatMode: $scope.OperationTypeMode, CoreStatsInGrid: $scope.CoreStatsInGrid }
                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            $scope.CorestatList = [];
                            $scope.CorestatList.push(res);
                            var editcorestat = rulesetService.UpdateCorestats($scope.CorestatList);
                            editcorestat.then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    //$scope.Corestats = data.data.PayLoad;
                                    //$scope.Corestats = data.data.PayLoad.Result;
                                    $scope.Corestats = data.data.PayLoad;

                                    rulesetService.GetTypes().then(function (data) {

                                        if (data.data.StatusCode == 200) {
                                            $scope.Types = data.data.PayLoad;
                                            //$scope.Types = rulesetDataShareService.getRpgtypeData()
                                            for (var i = 0; i < $scope.Types.length; i++) {
                                                for (var j = 0; j < $scope.Corestats.length; j++) {
                                                    if ($scope.Types[i].TypeId == $scope.Corestats[j].TypeId) {
                                                        $scope.Corestats[j].TypeName = $scope.Types[i].Name;
                                                    }
                                                }
                                            }
                                            if ($scope.Corestats.length > 0) {
                                                $scope.lists = false;
                                                $scope.list = true;
                                            }
                                            else {
                                                $scope.lists = true;
                                                $scope.list = false;
                                            }
                                            $state.go("profile.Corestats", { RuleSetId: $scope.Corestats[0].RulesetId })
                                        }
                                    })
                                    $state.go("profile.Corestats", { RuleSetId: $scope.Corestats[0].RulesetId })
                                }
                                else if (data.data.StatusCode == 400) {

                                    if (data.data.ShowToUser == true) {
                                        toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }
                            })

                          

                        }
                    });
                }

                $scope.RemoveCorestat = function (item) {
                    $scope.Corestats = rulesetDataShareService.getcorestat();

                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Corestat, "' + item.Name + '"',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                $scope.CorestatList = [];
                                $scope.CorestatList.push(item);
                                //$scope.Corestat = item;
                                var deletecorestat = rulesetService.DeleteCorestats($scope.CorestatList);
                                deletecorestat.then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                        $scope.Corestats = data.data.PayLoad;
                                        rulesetService.GetTypes().then(function (data) {

                                            if (data.data.StatusCode == 200) {
                                                $scope.Types = data.data.PayLoad;
                                                //$scope.Types = rulesetDataShareService.getRpgtypeData()
                                                for (var i = 0; i < $scope.Types.length; i++) {
                                                    for (var j = 0; j < $scope.Corestats.length; j++) {
                                                        if ($scope.Types[i].TypeId == $scope.Corestats[j].TypeId) {
                                                            $scope.Corestats[j].TypeName = $scope.Types[i].Name;
                                                        }
                                                    }

                                                }
                                                if ($scope.Corestats.length > 0) {
                                                    $scope.lists = false;
                                                    $scope.list = true;
                                                }
                                                else {
                                                    $scope.lists = true;
                                                    $scope.list = false;
                                                }

                                                //$state.go("profile.Corestats", { RuleSetId: $scope.RulesetId })
                                            }
                                        })
                                        //$state.go("profile.Corestats", { RuleSetId: $scope.NewRuleSet.Id });
                                    }
                                    else if (data.data.StatusCode == 400)
                                    {
                                        if (data.data.ShowToUser == true) {
                                            toaster.pop("error", data.data.ErrorMessage);
                                        }
                                    }
                                })
                            }
                        })
                   
                };

                $scope.BackCoreStat = function () {
                    //$scope.NewRuleSet = rulesetDataShareService.getruleset();
                    //rulesetDataShareService.setruleset($scope.NewRuleSet);
                    $state.go("profile.AddNewRuleSet");
                    $("#loading").fadeOut("slow");
                }

            }
            else if ($state.params.action == 4) {
                $scope.RulesetId = parseInt($state.params.RuleSetId);
                var url = $location.absUrl().split('?')[0];
                if (url.indexOf("Items") > 0) {
                    if (angular.equals({}, rulesetDataShareService.getRulesetItems()) == false) {
                        $scope.RulesetItems = rulesetDataShareService.getRulesetItems();
                        if ($scope.RulesetItems == null || $scope.RulesetItems == undefined || $scope.RulesetItems == {}) {
                            $scope.RulesetItems = [];
                        }
                        if ($scope.RulesetItems.length > 0) {
                            $scope.list = true;
                            $scope.grid = true;
                            $scope.Itemlist = false;
                        }
                        else {
                            $scope.Itemlist = true;
                            $scope.list = false;
                            $scope.grid = false
                        }
                    }
                    else {
                        var items = rulesetService.GetRulesetItems($scope.RulesetId);
                        items.then(function (data) {
                            if (data.data.StatusCode == 200) {
                                //$scope.Ruleset = data.data.PayLoad;
                                $scope.RulesetItems = data.data.PayLoad;
                                if ($scope.RulesetItems == null || $scope.RulesetItems == undefined || $scope.RulesetItems == {}) {
                                    $scope.RulesetItems = [];
                                }
                                rulesetDataShareService.setRulesetItems($scope.RulesetItems);
                                if ($scope.RulesetItems.length > 0) {
                                    $scope.list = true;
                                    $scope.grid = true;
                                    $scope.Itemlist = false;
                                }
                                else {
                                    $scope.list = false;
                                    $scope.grid = false;
                                    $scope.Itemlist = true;
                                }
                                $state.go("profile.Items", { RuleSetId: $scope.RulesetId })
                                $("#loading").fadeOut("slow");
                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.ShowToUser == true) {
                                    $("#loading").fadeOut("slow");
                                    toaster.pop("error", data.data.ErrorMessage);


                                }
                            }

                        })
                    }
                }
                else if (url.indexOf("Spells") > 0) {
                    if (angular.equals({}, rulesetDataShareService.getRulesetSpells()) == false) {
                        $scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                        if ($scope.RulesetSpells.length > 0) {
                            $scope.list = true;
                            $scope.grid = true;
                            $scope.Itemlist = false;
                        }
                        else {
                            $scope.list = false;
                            $scope.grid = false;
                            $scope.Itemlist = true;
                        }
                        //$state.go("profile.Spells", { RuleSetId: $scope.Ruleset.Id })
                    }
                    else {
                        var spells = rulesetService.GetRulesetSpells($scope.RulesetId);
                        spells.then(function (data) {
                            if (data.data.StatusCode == 200) {
                                //$scope.Ruleset = data.data.PayLoad;
                                $scope.RulesetSpells = data.data.PayLoad;
                                rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);
                                if ($scope.RulesetSpells.length > 0) {
                                    $scope.list = true;
                                    $scope.grid = true;
                                    $scope.Itemlist = false;
                                }
                                else {
                                    $scope.list = false;
                                    $scope.grid = false;
                                    $scope.Itemlist = true;
                                }
                                $state.go("profile.Spells", { RuleSetId: $scope.RulesetId });
                                $("#loading").fadeOut("slow");
                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.ShowToUser == true) {
                                    $("#loading").fadeOut("slow");
                                    toaster.pop("error", data.data.ErrorMessage);

                                }
                            }

                        })
                    }
                }
                else if (url.indexOf("Abilities") > 0) {
                    if (angular.equals({}, rulesetDataShareService.getRulesetAbilities()) == false) {
                        $scope.RulesetAbilities = rulesetDataShareService.getRulesetAbilities();
                        if ($scope.RulesetAbilities.length > 0) {
                            $scope.list = true;
                            $scope.grid = true;
                            $scope.Itemlist = false;
                        }
                        else {
                            $scope.list = false;
                            $scope.grid = false;
                            $scope.Itemlist = true;
                        }
                        //$state.go("profile.Abilities", { RuleSetId: $scope.NewRuleSet.Id })
                    }
                    else {
                        var abilities = rulesetService.GetRulesetAbilities($scope.RulesetId);
                        abilities.then(function (data) {
                            if (data.data.StatusCode == 200) {
                                //$scope.Ruleset = data.data.PayLoad;
                                $scope.RulesetAbilities = data.data.PayLoad;
                                rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);
                                if ($scope.RulesetAbilities.length > 0) {
                                    $scope.list = true;
                                    $scope.grid = true;
                                    $scope.Itemlist = false;
                                }
                                else {
                                    $scope.list = false;
                                    $scope.grid = false;
                                    $scope.Itemlist = true;
                                }
                                $state.go("profile.Abilities", { RuleSetId: $scope.RulesetId })
                                $("#loading").fadeOut("slow");
                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.ShowToUser == true) {
                                    $("#loading").fadeOut("slow");
                                    toaster.pop("error", data.data.ErrorMessage);

                                }
                            }

                        })

                    }
                }
                else {
                    if (parseInt($scope.RulesetId) > 0) {
                        UpdateRuleSet($scope.RulesetId, CopyOrUpdate);
                    }
                }

                $scope.BackItem = function () {
                    // $scope.NewRuleSet = rulesetDataShareService.getruleset();
                    //rulesetDataShareService.setruleset($scope.NewRuleSet);
                    //$state.go("profile.NewRuleSet");
                    $state.go("profile.AddNewRuleSet");
                    $("#loading").fadeOut("slow");
                }

                $scope.BackSpell = function () {
                    //$scope.NewRuleSet = rulesetDataShareService.getruleset();
                    //rulesetDataShareService.setruleset($scope.NewRuleSet);

                    // $state.go("profile.NewRuleSet");
                    $state.go("profile.AddNewRuleSet");
                    $("#loading").fadeOut("slow");
                }

                $scope.BackAbility = function () {
                    // $scope.NewRuleSet = rulesetDataShareService.getruleset();
                    //rulesetDataShareService.setruleset($scope.NewRuleSet);

                    // $state.go("profile.NewRuleSet");
                    $state.go("profile.AddNewRuleSet");
                    $("#loading").fadeOut("slow");
                }

                $scope.showlist = function () {
                    $scope.list = true;
                    $scope.grid = false;
                }

                $scope.showgrid = function () {
                    $scope.list = false;
                    $scope.grid = true;
                }

                //For Items
                $scope.CreateItem = function () {
                    //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                    var itemsmetadata = rulesetService.GetItemsMetadata($scope.RulesetId);
                    itemsmetadata.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            //$scope.RulesetItems = rulesetDataShareService.get();
                            $scope.ItemProperties = data.data.PayLoad.RuleSetMetaData.ItemProperties;
                            $scope.Rulesetproperty = data.data.PayLoad.Rulesetproperty;
                            $scope.Spells = data.data.PayLoad.Spells;
                            rulesetDataShareService.setRulesetSpells($scope.Spells);
                            $scope.Abilities = data.data.PayLoad.Abilities;
                            rulesetDataShareService.setRulesetAbilities($scope.Abilities);
                            $scope.buttontext = "Create";
                            $scope.tabName = "Create New Item";
                            $scope.IsButtonDisabled = false;
                            $scope.isBtnShow = false;
                            $scope.OperationTypeMode = "Create"
                            var weight = "";
							var volume = "";
							var currency = "";
                            $scope.Content_ItemProperties = [];
                            if ($scope.RulesetItems != null) {
                                for (var i = 0; i < $scope.RulesetItems.length; i++) {
                                    $scope.Content_ItemProperties.push($scope.RulesetItems[i].ItemProperties[0].Value.Text.value);
                                }
							}
							for (var i = 0; i < $scope.Rulesetproperty.length; i++) {
								if ($scope.Rulesetproperty[i].TypeId == 1 && ($scope.Rulesetproperty[i].Name.indexOf('Currency Label') > -1)) {
									currency = $scope.Rulesetproperty[i].Value.Text.value;
								}
							}
							for (var j = 0; j < $scope.ItemProperties.length; j++) {
								if ($scope.ItemProperties[j].TypeId == 14) {
									$scope.ItemProperties[j].Value.Text = currency;
								}
							}
                            for (var i = 0; i < $scope.Rulesetproperty.length; i++) {
								if ($scope.Rulesetproperty[i].TypeId == 1 && ($scope.Rulesetproperty[i].Name.indexOf('Weight') > -1)) {
									weight = $scope.Rulesetproperty[i].Value.Text.value;
                                }
                            }
                            for (var j = 0; j < $scope.ItemProperties.length; j++) {
                                if ($scope.ItemProperties[j].TypeId == 7) {
                                    $scope.ItemProperties[j].Value.Weight.units.selectedUnit = weight;
                                }
                            }
                            for (var i = 0; i < $scope.Rulesetproperty.length; i++) {
                                if (($scope.Rulesetproperty[i].TypeId == 1) && ($scope.Rulesetproperty[i].Name.indexOf('Volume') > -1)) {
                                    volume = $scope.Rulesetproperty[i].Value.Text.value;
                                }
                            }
                            for (var j = 0; j < $scope.ItemProperties.length; j++) {
                                if ($scope.ItemProperties[j].TypeId == 13) {
                                    $scope.ItemProperties[j].Value.Volume.units.selectedUnit = volume;
                                }
                            }
							console.log("$scope.ItemProperties: ", $scope.ItemProperties);
                            var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCreateItem',
                                { scope: $scope.ItemProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Content_ItemProperties: $scope.Content_ItemProperties, ItemMode: $scope.OperationTypeMode, Spells: $scope.Spells, Abilities: $scope.Abilities }
                            );

                            dlg.result.then(function (res) {

                             

                                if (res != "cancel") {
                                    var NewItem = {}
									NewItem.ItemProperties = res.Properties;
									console.log("res.Properties: ", res.Properties);
                                    NewItem.AssociatedSpells = res.AssociatedSpells;
                                    NewItem.AssociatedAbilities = res.AssociatedAbilities;
                                    NewItem.RulesetID = $scope.RulesetId;
                                    //var ItemProperties = { "ItemProperties": res.Properties };
                                    //var AssociatedSpells = { "AssociatedSpells": res.AssociatedSpells };
                                    //$scope.NewRuleSet.Items.push(ItemProperties);
                                    //$scope.NewRuleSet.Items.push(AssociatedSpells);
                                    $scope.ItemList = [];
                                    $scope.ItemList.push(NewItem);
                                    var saveitem = rulesetService.CreateItems($scope.ItemList);
                                    saveitem.then(function (data) {
                                        if (data.data.StatusCode == 200) {
                                            //$scope.Ruleset = data.data.PayLoad.Result;
                                            var createdRulesetItems = [];
                                            //createdRulesetItems = data.data.PayLoad.Result;
                                            createdRulesetItems = data.data.PayLoad;
                                            for (var i = 0; i < createdRulesetItems.length; i++) {
                                                $scope.RulesetItems.push(createdRulesetItems[i]);
                                            }
                                            rulesetDataShareService.setRulesetItems($scope.RulesetItems);
                                            if ($scope.RulesetItems.length > 0) {
                                                $scope.list = true;
                                                $scope.grid = true;
                                                $scope.Itemlist = false;
                                            }
                                            else {
                                                $scope.list = false;
                                                $scope.grid = false;
                                                $scope.Itemlist = true;
                                            }
                                            $("#loading").fadeOut("slow");
                                            //$state.go("profile.Items", { RuleSetId: $scope.Ruleset.Id })
                                        }
                                        else if (data.data.StatusCode == 400) {
                                            if (data.data.ShowToUser == true) {
                                                toaster.pop("error", data.data.ErrorMessage);

                                            }
                                        }
                                       
                                    });

                                }
                                $("#loading").fadeOut("slow");
                            });
                        }
                        else if (data.data.StatusCode == 400) {
                            if (data.ShowToUser == true) {
                                toaster.pop("error", data.data.ErrorMessage);

                            }
                        }
                    })
                };

                $scope.CopyItem = function (item, count) {
                    //$scope.RulesetItems = rulesetDataShareService.getRulesetItems();
                    //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                    var spells = rulesetService.GetRulesetSpells($scope.RulesetId);
                    spells.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.Spells = data.data.PayLoad;
                            var abilities = rulesetService.GetRulesetAbilities($scope.RulesetId);
                            abilities.then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.Abilities = data.data.PayLoad;
                                    $scope.pageName = "Copying Item";
                                    $scope.buttontext = "Copy";
                                    $scope.IsButtonDisabled = true;
                                    $scope.isBtnShow = true;
                                    $scope.OperationTypeMode = "Copy"
                                    $scope.Content_ItemProperties = [];
                                    $scope.SelectAssociatedSpells = true;
                                    $scope.SelectAssociatedAbilities = true;
                                    if ($scope.RulesetItems != null) {
                                        for (var i = 0; i < $scope.RulesetItems.length; i++) {
                                            $scope.Content_ItemProperties.push($scope.RulesetItems[i].ItemProperties[0].Value.Text.value);
                                        }
                                    }
                                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCopyItem',
                                        { scope: item.ItemProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, ItemMode: $scope.OperationTypeMode, Spells: $scope.Spells, AssociatedSpells: $scope.RulesetItems[count].AssociatedSpells, Abilities: $scope.Abilities, AssociatedAbilities: $scope.RulesetItems[count].AssociatedAbilities, Content_ItemProperties: $scope.Content_ItemProperties, SelectAssociatedSpells: $scope.SelectAssociatedSpells, SelectAssociatedAbilities: $scope.SelectAssociatedAbilities }
                                    );

                                    dlg.result.then(function (res) {
                                       // $("#loading").css("display", "block");
                                        if (res != "cancel") {
                                            var ItemProperties = { "ItemProperties": res.ItemProperties };
                                            for (var i = 0; i < ItemProperties.ItemProperties.length; i++) {
                                                ItemProperties.ItemProperties[i].ContentId = 0;
                                            }
                                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                            var NewItem = {}
                                            //NewItem.ItemProperties = res.Properties;
                                            NewItem.ItemProperties = res.ItemProperties;
                                            NewItem.AssociatedSpells = res.AssociatedSpells;
                                            NewItem.AssociatedAbilities = res.AssociatedAbilities;
                                            NewItem.RulesetId = $scope.RulesetId;
                                            //$scope.RuleSetItems.push(ItemProperties);
                                            $scope.ItemList = [];
                                            $scope.ItemList.push(NewItem);
                                            var copyitem = rulesetService.CopyItems($scope.ItemList);
                                            copyitem.then(function (data) {
                                                $("#loading").fadeOut("slow");
                                                if (data.data.StatusCode == 200) {
                                                    //$scope.Ruleset = data.data.PayLoad.Result;
                                                    var createdRulesetItems = [];
                                                    //createdRulesetItems = data.data.PayLoad.Result;
                                                    createdRulesetItems = data.data.PayLoad;
                                                    for (var i = 0; i < createdRulesetItems.length; i++) {
                                                        $scope.RulesetItems.push(createdRulesetItems[i]);
                                                    }
                                                    rulesetDataShareService.setRulesetItems($scope.RulesetItems);
                                                    if ($scope.RulesetItems.length > 0) {
                                                        $scope.list = true;
                                                        $scope.grid = true;
                                                        $scope.Itemlist = false;
                                                    }
                                                    else {
                                                        $scope.list = false;
                                                        $scope.grid = false;
                                                        $scope.Itemlist = true;
                                                    }

                                                    //$state.go("profile.Items", { RuleSetId: $scope.Ruleset.Id })
                                                }
                                                else if (data.data.StatusCode == 400) {
                                                    if (data.data.ShowToUser == true) {
                                                        toaster.pop("error", data.data.ErrorMessage);

                                                    }
                                                }
                                               
                                            });
                                        }

                                        $("#loading").fadeOut("slow");
                                    });
                                }
                            })
                        }
                    })
                    // $scope.Spells = rulesetDataShareService.getspell();
                    //$scope.Abilities = rulesetDataShareService.getability();

                }

                $scope.EditItem = function (item, count) {
                    //$scope.RulesetItems = rulesetDataShareService.getRulesetItems();
                    //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                    var spells = rulesetService.GetRulesetSpells($scope.RulesetId);
                    spells.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.Spells = data.data.PayLoad;
                            var abilities = rulesetService.GetRulesetAbilities($scope.RulesetId);
                            abilities.then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.Abilities = data.data.PayLoad;
                                    $scope.pageName = "Editing Item";
                                    $scope.buttontext = "Update";
                                    $scope.IsButtonDisabled = true;
                                    $scope.isBtnShow = true;
                                    $scope.OperationTypeMode = "Edit"

                                    //var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCreateItem',
                                    //    { scope: $scope.ItemProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Content_ItemProperties: $scope.Content_ItemProperties, ItemMode: $scope.OperationTypeMode, AssociatedSpells: $scope.NewRuleSet.Spells, AssociatedAbilities: $scope.NewRuleSet.Abilities }
                                    //);

                                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCopyItem',
                                        { scope: item.ItemProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, ItemMode: $scope.OperationTypeMode, Spells: $scope.Spells, AssociatedSpells: $scope.RulesetItems[count].AssociatedSpells, Abilities: $scope.Abilities, AssociatedAbilities: $scope.RulesetItems[count].AssociatedAbilities }
                                    );

                                    dlg.result.then(function (res) {
                                       // $("#loading").css("display", "block");
                                        if (res != "cancel") {
                                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                            var NewItem = {}
                                            //NewItem.ItemProperties = res.Properties;
                                            NewItem.ItemProperties = res.ItemProperties;
                                            NewItem.AssociatedSpells = res.AssociatedSpells;
                                            NewItem.AssociatedAbilities = res.AssociatedAbilities;
                                            NewItem.RulesetId = $scope.RulesetId;
                                            $scope.ItemList = [];
                                            $scope.ItemList.push(NewItem);
                                            var edititem = rulesetService.UpdateItems($scope.ItemList);
                                            edititem.then(function (data) {
                                                $("#loading").fadeOut("slow");
                                                if (data.data.StatusCode == 200) {
                                                    //$scope.Corestats = data.data.PayLoad;
                                                    //$scope.Ruleset = data.data.PayLoad.Result;
                                                    //$scope.RulesetItems = data.data.PayLoad.Result;

                                                   // var updatedRulesetItems = data.data.PayLoad.Result;
                                                    var updatedRulesetItems = data.data.PayLoad;

                                                    for (var i = 0; i < updatedRulesetItems.length; i++) {
                                                        for (var j = 0; j < $scope.RulesetItems.length; j++) {
                                                            if (updatedRulesetItems[i].ItemProperties[0].ContentId == $scope.RulesetItems[j].ItemProperties[0].ContentId) {
                                                                $scope.RulesetItems[j] = updatedRulesetItems[i];
                                                            }
                                                        }
                                                    }

                                                    rulesetDataShareService.setRulesetItems($scope.RulesetItems);

                                                    if ($scope.RulesetItems.length > 0) {
                                                        $scope.list = true;
                                                        $scope.grid = true;
                                                        $scope.Itemlist = false;
                                                    }
                                                    else {
                                                        $scope.list = false;
                                                        $scope.grid = false;
                                                        $scope.Itemlist = true;
                                                    }
                                                    //$state.go("profile.Items", { RuleSetId: $scope.Ruleset.Id })
                                                    // $state.go("profile.Items")
                                                }
                                                else if (data.data.StatusCode == 400) {
                                                    if (data.data.ShowToUser == true) {
                                                        toaster.pop("error", data.data.ErrorMessage);

                                                    }
                                                }
                                            })

                                            //$scope.NewRuleSet.Items[count] = NewItem;

                                        }
                                        $("#loading").fadeOut("slow");
                                    });
                                }
                               
                            })
                        }
                    });
                    //$scope.Spells = rulesetDataShareService.getspell();
                    //$scope.Abilities = rulesetDataShareService.getability();

                }

                $scope.Removeitem = function (item) {
                   
                    //var index = -1;
                    //$scope.RulesetItems = rulesetDataShareService.get();

                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Item, "' + item.ItemProperties[0].Value.Text.value + '"',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                           // $("#loading").css("display", "block");
                            if (res == "yes") {
                                var deleteItemList = [];
                                //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                item.RulesetId = $scope.RulesetId;
                                deleteItemList.push(item);
                                //$scope.Corestat = item;
                                var deleteitems = rulesetService.DeleteItems(deleteItemList);
                                deleteitems.then(function (data) {
                                    
                                    $("#loading").fadeOut("slow");
                                    if (data.data.StatusCode == 200) {
                                        //$scope.Ruleset = data.data.PayLoad;
                                        //var deletedRulesetItems = data.data.PayLoad.Result;
                                        var deletedRulesetItems = data.data.PayLoad;

                                        var deletedRulesetItemIndexs = [];
                                        for (var i = 0; i < deletedRulesetItems.length; i++) {
                                            for (var j = 0; j < $scope.RulesetItems.length; j++) {
                                                if (deletedRulesetItems[i].ItemProperties[0].ContentId == $scope.RulesetItems[j].ItemProperties[0].ContentId) {
                                                    deletedRulesetItemIndexs.push(j);
                                                }
                                            }
                                        }

                                        for (var i = 0; i < deletedRulesetItemIndexs.length; i++) {
                                            $scope.RulesetItems.splice(deletedRulesetItemIndexs[i], 1);
                                        }

                                        rulesetDataShareService.setRulesetItems($scope.RulesetItems);

                                        if ($scope.RulesetItems.length > 0) {
                                            $scope.list = true;
                                            $scope.grid = true;
                                            $scope.Itemlist = false;
                                        }
                                        else {
                                            $scope.list = false;
                                            $scope.grid = false;
                                            $scope.Itemlist = true;
                                        }
                                        //$state.go("profile.Items", { RuleSetId: $scope.RulesetId })
                                    }
                                    else if (data.data.StatusCode == 400) {
                                        if (data.data.ShowToUser == true) {
                                            toaster.pop("error", data.data.ErrorMessage);

                                        }
                                    }
                                });
                            }
                            $("#loading").fadeOut("slow");
                        })
                  


                };

                //For Spells


                $scope.CreateSpell = function () {

                    //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                    var spellsmetadata = rulesetService.GetSpellsMetadata($scope.RulesetId);
                    spellsmetadata.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                            $scope.SpellProperties = data.data.PayLoad.RuleSetMetaData.SpellProperties;
                            $scope.Rulesetproperty = data.data.PayLoad.Rulesetproperty;
                            $scope.buttontext = "Create";
                            $scope.tabName = "Create New Spell";
                            $scope.isBtnShow = false;
                            $scope.OperationTypeMode = "Create"
                            var weight = "";
                            var volume = "";
                            $scope.Content_SpellProperties = [];
                            if ($scope.RulesetSpells != null) {
                                for (var i = 0; i < $scope.RulesetSpells.length; i++) {
                                    $scope.Content_SpellProperties.push($scope.RulesetSpells[i].SpellProperties[0].Value.Text.value);
                                }
                            }
                            for (var i = 0; i < $scope.Rulesetproperty.length; i++) {
                                if ($scope.Rulesetproperty[i].TypeId == 7) {
                                    weight = $scope.Rulesetproperty[i].Units.selectedUnit;
                                }
                            }
                            for (var j = 0; j < $scope.SpellProperties.length; j++) {
                                if ($scope.SpellProperties[j].TypeId == 7) {
                                    $scope.SpellProperties[j].Value.Weight.units.selectedUnit = weight;
                                }
                            }
                            for (var i = 0; i < $scope.Rulesetproperty.length; i++) {
                                if (($scope.Rulesetproperty[i].TypeId == 1) && ($scope.Rulesetproperty[i].Name.indexOf('Volume') > -1)) {
                                    volume = $scope.Rulesetproperty[i].Value.Text.value;
                                }
                            }
                            for (var j = 0; j < $scope.SpellProperties.length; j++) {
                                if ($scope.SpellProperties[j].TypeId == 13) {
                                    $scope.SpellProperties[j].Value.Volume.units.selectedUnit = volume;
                                }
                            }
                            var dlg = dialogs.create('/views/dialogs/createspells.html', 'dialogCreateSpell',
                                { scope: $scope.SpellProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, Content_SpellProperties: $scope.Content_SpellProperties, SpellMode: $scope.OperationTypeMode }
                            );

                            dlg.result.then(function (res) {
                               // $("#loading").css("display", "block");

                                if (res != "cancel") {
                                    var SpellProperties = res;
                                    var newspell = {}
                                    newspell.SpellProperties = SpellProperties;
                                    newspell.RulesetID = $scope.RulesetId;

                                    $scope.SpellList = [];
                                    $scope.SpellList.push(newspell);
                                    var savespell = rulesetService.CreateSpells($scope.SpellList);
                                    savespell.then(function (data) {
                                        $("#loading").fadeOut("slow");
                                        if (data.data.StatusCode == 200) {

                                            
                                            //$scope.Ruleset = data.data.PayLoad.Result;
                                            var createdRulesetSpells = [];
                                            //createdRulesetSpells = data.data.PayLoad.Result;
                                            createdRulesetSpells = data.data.PayLoad;
                                            for (var i = 0; i < createdRulesetSpells.length; i++) {
                                                $scope.RulesetSpells.push(createdRulesetSpells[i]);
                                            }
                                            rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);
                                            if ($scope.RulesetSpells.length > 0) {
                                                $scope.list = true;
                                                $scope.grid = true;
                                                $scope.Itemlist = false;
                                            }
                                            else {
                                                $scope.list = false;
                                                $scope.grid = false;
                                                $scope.Itemlist = true;
                                            }
                                            //$state.go("profile.Spells", { RuleSetId: $scope.Ruleset.Id })
                                        }
                                        else if (data.data.StatusCode == 400) {
                                            if (data.data.ShowToUser == true) {
                                                toaster.pop("error", data.data.ErrorMessage);

                                            }
                                        }
                                    });

                                }
                                $("#loading").fadeOut("slow");
                            });
                        }
                       
                    })

                };

                $scope.CopySpell = function (item, count) {
                    $scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                    $scope.pageName = "Copying Spell";
                    $scope.buttontext = "Copy";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Copy"
                    $scope.Content_SpellProperties = [];
                    if ($scope.RulesetSpells != null) {
                        for (var i = 0; i < $scope.RulesetSpells.length; i++) {
                            $scope.Content_SpellProperties.push($scope.RulesetSpells[i].SpellProperties[0].Value.Text.value);
                        }
                    }
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCopySpell',
                        { scope: item.SpellProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, Content_SpellProperties: $scope.Content_SpellProperties, SpellMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                       // $("#loading").css("display", "block");
                        if (res != "cancel") {

                            var SpellProperties = res;
                            for (var i = 0; i < SpellProperties.length; i++) {
                                SpellProperties[i].ContentId = 0;
                            }
                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                            var NewSpell = {}
                            //NewItem.ItemProperties = res.Properties;
                            NewSpell.SpellProperties = SpellProperties;
                            NewSpell.RulesetId = $scope.RulesetId;
                            var SpellList = [];
                            SpellList.push(NewSpell);
                            var copyspell = rulesetService.CopySpells(SpellList);
                            copyspell.then(function (data) {
                                $("#loading").fadeOut("slow");
                                if (data.data.StatusCode == 200) {
                                    //$scope.RulesetSpells = data.data.PayLoad.Result;
                                    var createdRulesetSpells = [];
                                    //createdRulesetSpells = data.data.PayLoad.Result;
                                    createdRulesetSpells = data.data.PayLoad;
                                    for (var i = 0; i < createdRulesetSpells.length; i++) {
                                        $scope.RulesetSpells.push(createdRulesetSpells[i]);
                                    }

                                    rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);

                                    if ($scope.RulesetSpells.length > 0) {
                                        $scope.list = true;
                                        $scope.grid = true;
                                        $scope.Itemlist = false;
                                    }
                                    else {
                                        $scope.list = false;
                                        $scope.grid = false;
                                        $scope.Itemlist = true;
                                    }
                                    //$state.go("profile.Spells", { RuleSetId: $scope.Ruleset.Id })
                                }
                                else if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        toaster.pop("error", data.data.ErrorMessage);

                                    }
                                }
                            });
                            //$scope.NewRuleSet.Spells.push(SpellProperties);

                        }
                        $("#loading").fadeOut("slow");

                    });
                }

                $scope.EditSpell = function (item, count) {
                    $scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                    $scope.pageName = "Editing Spell";
                    $scope.buttontext = "Update";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Edit"
                    var dlg = dialogs.create('/views/dialogs/createspells.html', 'dialogCopySpell',
                        { scope: item.SpellProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, SpellMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                       // $("#loading").css("display", "block");
                        if (res != "cancel") {
                            var SpellProperties = res;
                            //$scope.NewRuleSet.Spells[count] = SpellProperties
                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                            var NewSpell = {}
                            //NewItem.ItemProperties = res.Properties;
                            NewSpell.SpellProperties = SpellProperties;
                            NewSpell.RulesetId = $scope.RulesetId;
                            var SpellList = [];
                            SpellList.push(NewSpell);
                            var editspell = rulesetService.UpdateSpells(SpellList);
                            editspell.then(function (data) {
                                $("#loading").fadeOut("slow");
                                if (data.data.StatusCode == 200) {
                                    //$scope.RulesetSpells = data.data.PayLoad.Result;

                                    //var updatedRulesetSpells = data.data.PayLoad.Result;
                                    var updatedRulesetSpells = data.data.PayLoad;

                                    for (var i = 0; i < updatedRulesetSpells.length; i++) {
                                        for (var j = 0; j < $scope.RulesetSpells.length; j++) {
                                            if (updatedRulesetSpells[i].SpellProperties[0].ContentId == $scope.RulesetSpells[j].SpellProperties[0].ContentId) {
                                                $scope.RulesetSpells[j] = updatedRulesetSpells[i];
                                            }
                                        }
                                    }

                                    rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);

                                    if ($scope.RulesetSpells.length > 0) {
                                        $scope.list = true;
                                        $scope.grid = true;
                                        $scope.Itemlist = false;
                                    }
                                    else {
                                        $scope.list = false;
                                        $scope.grid = false;
                                        $scope.Itemlist = true;
                                    }
                                    //$state.go("profile.Spells", { RuleSetId: $scope.Ruleset.Id })

                                }
                                else if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        toaster.pop("error", data.data.ErrorMessage);

                                    }
                                }
                               
                            });
                        }
                        $("#loading").fadeOut("slow");
                    });
                }

                $scope.RemoveSpell = function (item) {
                    //$scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                    //var index = -1;
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Spell, "' + item.SpellProperties[0].Value.Text.value + '"',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                           // $("#loading").css("display", "block");
                            if (res == "yes") {
                                $scope.SpellList = [];
                                //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                item.RulesetId = $scope.RulesetId;
                                $scope.SpellList.push(item);
                                //$scope.Corestat = item;
                                var deletespells = rulesetService.DeleteSpells($scope.SpellList);
                                deletespells.then(function (data) {
                                    $("#loading").fadeOut("slow");
                                    if (data.data.StatusCode == 200) {
                                        //$scope.RulesetSpells = data.data.PayLoad.Result;
                                        //rulesetDataShareService.setRulesetItems($scope.RulesetSpells);

                                       // var deletedRulesetSpells = data.data.PayLoad.Result;
                                        var deletedRulesetSpells = data.data.PayLoad;

                                        var deletedRulesetSpellIndexs = [];
                                        for (var i = 0; i < deletedRulesetSpells.length; i++) {
                                            for (var j = 0; j < $scope.RulesetSpells.length; j++) {
                                                if (deletedRulesetSpells[i].SpellProperties[0].ContentId == $scope.RulesetSpells[j].SpellProperties[0].ContentId) {
                                                    deletedRulesetSpellIndexs.push(j);
                                                }
                                            }
                                        }

                                        for (var i = 0; i < deletedRulesetSpellIndexs.length; i++) {
                                            $scope.RulesetSpells.splice(deletedRulesetSpellIndexs[i], 1);
                                        }

                                        rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);

                                        if ($scope.RulesetSpells.length > 0) {
                                            $scope.list = true;
                                            $scope.grid = true;
                                            $scope.Itemlist = false;
                                        }
                                        else {
                                            $scope.list = false;
                                            $scope.grid = false;
                                            $scope.Itemlist = true;
                                        }
                                        //$state.go("profile.Spells", { RuleSetId: $scope.Ruleset.Id })
                                    }
                                    else if (data.data.StatusCode == 400) {
                                        if (data.data.ShowToUser == true) {
                                            toaster.pop("error", data.data.ErrorMessage);

                                        }
                                    }
                                })
                            }
                            $("#loading").fadeOut("slow");
                        })

                };
                //For Abilitiies

                $scope.CreateAbility = function () {
                    //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                    var abilitiesmetadata = rulesetService.GetAbilitiesMetadata($scope.RulesetId);
                    abilitiesmetadata.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.RulesetAbilities = rulesetDataShareService.getRulesetAbilities();
                            $scope.AbilityProperties = data.data.PayLoad.RuleSetMetaData.AbilityProperties;
                            $scope.Rulesetproperty = data.data.PayLoad.Rulesetproperty;
                            $scope.buttontext = "Create";
                            $scope.tabName = "Create Ability";
                            $scope.isBtnShow = false;
                            $scope.OperationTypeMode = "Create"
                            var weight = "";
                            var volume = "";
                            $scope.Content_AbilityProperties = [];
                            if ($scope.RulesetAbilities != null) {
                                for (var i = 0; i < $scope.RulesetAbilities.length; i++) {
                                    $scope.Content_AbilityProperties.push($scope.RulesetAbilities[i].AbilityProperties[0].Value.Text.value);
                                }
                            }
                            for (var i = 0; i < $scope.Rulesetproperty.length; i++) {
                                if ($scope.Rulesetproperty[i].TypeId == 7) {
                                    weight = $scope.Rulesetproperty[i].Units.selectedUnit;
                                }
                            }
                            for (var j = 0; j < $scope.AbilityProperties.length; j++) {
                                if ($scope.AbilityProperties[j].TypeId == 7) {
                                    $scope.AbilityProperties[j].Value.Weight.units.selectedUnit = weight;
                                }
                            }
                            for (var i = 0; i < $scope.Rulesetproperty.length; i++) {
                                if (($scope.Rulesetproperty[i].TypeId == 1) && ($scope.Rulesetproperty[i].Name.indexOf('Volume') > -1)) {
                                    volume = $scope.Rulesetproperty[i].Value.Text.value;
                                }
                            }
                            for (var j = 0; j < $scope.AbilityProperties.length; j++) {
                                if ($scope.AbilityProperties[j].TypeId == 13) {
                                    $scope.AbilityProperties[j].Value.Volume.units.selectedUnit = volume;
                                }
                            }
                            var dlg = dialogs.create('/views/dialogs/createabilities.html', 'dialogCreateAbility',
                                { scope: $scope.AbilityProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, Content_AbilityProperties: $scope.Content_AbilityProperties, AbilityMode: $scope.OperationTypeMode }
                            );

                            dlg.result.then(function (res) {

                               // $("#loading").css("display", "block");
                                if (res != "cancel") {
                                    var AbilityProperties = res;
                                    var NewsAbility = {}
                                    NewsAbility.AbilityProperties = AbilityProperties;
                                    NewsAbility.RulesetID = $scope.RulesetId;
                                    $scope.AbilityList = [];
                                    $scope.AbilityList.push(NewsAbility);
                                    var saveability = rulesetService.CreateAbilities($scope.AbilityList);
                                    saveability.then(function (data) {
                                        $("#loading").fadeOut("slow");
                                        if (data.data.StatusCode == 200) {
                                            //$scope.Ruleset = data.data.PayLoad.Result;
                                            //$scope.RulesetAbilities = data.data.PayLoad.Result;

                                            var createdRulesetAbilities = [];
                                            //createdRulesetAbilities = data.data.PayLoad.Result;
                                            createdRulesetAbilities = data.data.PayLoad;
                                            for (var i = 0; i < createdRulesetAbilities.length; i++) {
                                                $scope.RulesetAbilities.push(createdRulesetAbilities[i]);
                                            }
                                            rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);

                                            if ($scope.RulesetAbilities.length > 0) {
                                                $scope.list = true;
                                                $scope.grid = true;
                                                $scope.Itemlist = false;
                                            }
                                            else {
                                                $scope.list = false;
                                                $scope.grid = false;
                                                $scope.Itemlist = true;
                                            }
                                            //$state.go("profile.Abilities", { RuleSetId: $scope.NewRuleSet.Id })
                                        }
                                        else if (data.data.StatusCode == 400) {
                                            if (data.data.ShowToUser == true) {
                                                toaster.pop("error", data.data.ErrorMessage);


                                            }
                                        }
                                    });

                                }
                               
                            });
                        }
                        $("#loading").fadeOut("slow");
                    });

                };

                $scope.CopyAbility = function (item, count) {
                    //$scope.RulesetAbilities = rulesetDataShareService.getability();
                    $scope.pageName = "Copying Ability";
                    $scope.buttontext = "Copy";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Copy"
                    $scope.Content_AbilityProperties = [];
                    if ($scope.RulesetAbilities != null) {
                        for (var i = 0; i < $scope.RulesetAbilities.length; i++) {
                            $scope.Content_AbilityProperties.push($scope.RulesetAbilities[i].AbilityProperties[0].Value.Text.value);
                        }
                    }
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCopyAbility',
                        { scope: item.AbilityProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, Content_AbilityProperties: $scope.Content_AbilityProperties, AbilityMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                      //  $("#loading").css("display", "block");
                        if (res != "cancel") {
                            var AbilityProperties = res;
                            for (var i = 0; i < AbilityProperties.length; i++) {
                                AbilityProperties[i].ContentId = 0;
                            }
                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                            var NewAbility = {}
                            //NewItem.ItemProperties = res.Properties;
                            NewAbility.AbilityProperties = AbilityProperties;
                            NewAbility.RulesetId = $scope.RulesetId;
                            $scope.AbilityList = [];
                            $scope.AbilityList.push(NewAbility);
                            var copyability = rulesetService.CopyAbilities($scope.AbilityList);
                            copyability.then(function (data) {
                                $("#loading").fadeOut("slow");
                                if (data.data.StatusCode == 200) {

                                    var createdRulesetAbilities = [];
                                    //createdRulesetAbilities = data.data.PayLoad.Result;
                                    createdRulesetAbilities = data.data.PayLoad;
                                    for (var i = 0; i < createdRulesetAbilities.length; i++) {
                                        $scope.RulesetAbilities.push(createdRulesetAbilities[i]);
                                    }

                                    rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);

                                    if ($scope.RulesetAbilities.length > 0) {
                                        $scope.list = true;
                                        $scope.grid = true;
                                        $scope.Itemlist = false;
                                    }
                                    else {
                                        $scope.list = false;
                                        $scope.grid = false;
                                        $scope.Itemlist = true;
                                    }
                                    //$state.go("profile.Abilities", { RuleSetId: $scope.NewRuleSet.Id })
                                }
                                else if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        toaster.pop("error", data.data.ErrorMessage);

                                    }
                                }
                            });
                        }

                        $("#loading").fadeOut("slow");
                    });
                }

                $scope.EditAbility = function (item, count) {
                    $scope.pageName = "Editing Ability";
                    $scope.buttontext = "Update";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Edit"
                    var dlg = dialogs.create('/views/dialogs/createabilities.html', 'dialogCopyAbility',
                        { scope: item.AbilityProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, AbilityMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                       // $("#loading").css("display", "block");
                        if (res != "cancel") {
                            var AbilityProperties = res;
                            //$scope.NewRuleSet.Spells[count] = SpellProperties
                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                            var NewAbility = {}
                            //NewItem.ItemProperties = res.Properties;
                            NewAbility.AbilityProperties = AbilityProperties;
                            NewAbility.RulesetId = $scope.RulesetId;
                            $scope.AbilityList = [];
                            $scope.AbilityList.push(NewAbility);
                            var editability = rulesetService.UpdateAbilities($scope.AbilityList);
                            editability.then(function (data) {
                                $("#loading").fadeOut("slow");
                                if (data.data.StatusCode == 200) {

                                   //var updatedRulesetAbilities = data.data.PayLoad.Result;
                                    var updatedRulesetAbilities = data.data.PayLoad;

                                    for (var i = 0; i < updatedRulesetAbilities.length; i++) {
                                        for (var j = 0; j < $scope.RulesetAbilities.length; j++) {
                                            if (updatedRulesetAbilities[i].AbilityProperties[0].ContentId == $scope.RulesetAbilities[j].AbilityProperties[0].ContentId) {
                                                $scope.RulesetAbilities[j] = updatedRulesetAbilities[i];
                                            }
                                        }
                                    }

                                    rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);

                                    if ($scope.RulesetAbilities.length > 0) {
                                        $scope.list = true;
                                        $scope.grid = true;
                                        $scope.Itemlist = false;
                                    }
                                    else {
                                        $scope.list = false;
                                        $scope.grid = false;
                                        $scope.Itemlist = true;
                                    }
                                   //$state.go("profile.Abilities", { RuleSetId: $scope.NewRuleSet.Id })

                                }
                                else if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        toaster.pop("error", data.data.ErrorMessage);

                                    }
                                }
                            });
                        }
                        $("#loading").fadeOut("slow");
                    });
                }

                $scope.RemoveAbility = function (item) {
                    //$scope.RulesetAbilities = rulesetDataShareService.getability();
                    //var index = -1;
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Ability, "' + item.AbilityProperties[0].Value.Text.value + '"',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                         //   $("#loading").css("display", "block");
                            if (res == "yes") {
                                $scope.AbilityList = [];
                                //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                item.RulesetID = $scope.RulesetId;
                                $scope.AbilityList.push(item);
                                //$scope.Corestat = item;
                                var deleteabilities = rulesetService.DeleteAbilities($scope.AbilityList);
                                deleteabilities.then(function (data) {
                                    $("#loading").fadeOut("slow");
                                    if (data.data.StatusCode == 200) {

                                        //var deletedRulesetAbilities = data.data.PayLoad.Result;
                                        var deletedRulesetAbilities = data.data.PayLoad;

                                        var deletedRulesetAbilityIndexs = [];
                                        for (var i = 0; i < deletedRulesetAbilities.length; i++) {
                                            for (var j = 0; j < $scope.RulesetAbilities.length; j++) {
                                                if (deletedRulesetAbilities[i].AbilityProperties[0].ContentId == $scope.RulesetAbilities[j].AbilityProperties[0].ContentId) {
                                                    deletedRulesetAbilityIndexs.push(j);
                                                }
                                            }
                                        }

                                        for (var i = 0; i < deletedRulesetAbilityIndexs.length; i++) {
                                            $scope.RulesetAbilities.splice(deletedRulesetAbilityIndexs[i], 1);
                                        }

                                        rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);

                                        if ($scope.RulesetAbilities.length > 0) {
                                            $scope.list = true;
                                            $scope.grid = true;
                                            $scope.Itemlist = false;
                                        }
                                        else {
                                            $scope.list = false;
                                            $scope.grid = false;
                                            $scope.Itemlist = true;
                                        }
                                        //$state.go("profile.Abilities", { RuleSetId: $scope.NewRuleSet.Id })
                                    }
                                    else if (data.data.StatusCode == 400) {
                                        if (data.data.ShowToUser == true) {
                                            toaster.pop("error", data.data.ErrorMessage);

                                        }
                                    }
                                })
                            }
                            $("#loading").fadeOut("slow");
                        })


                };

                $scope.ShowAllItemProperties = function (index) {
                    $state.go("profile.RulesetItemDetails", { index: index, RuleSetId: $scope.RulesetId });
                } 

                $scope.ShowAllSpellsContent = function (index) {
                    //alert("Testing Aleart");
                    $state.go("profile.RulesetSpellDetails", { index: index, RuleSetId: $scope.RulesetId });
                }

                $scope.ShowAllAbilityContent = function (index) {
                    $state.go("profile.RulesetAbilityDetails", { index: index, RuleSetId: $scope.RulesetId });
                }

            }
            else if ($state.params.action == 5) {
                $scope.RulesetId = parseInt($state.params.RuleSetId);
                $scope.initialClientObjectId = 0;
                if (angular.equals({}, rulesetDataShareService.getRulesetData()) == false) {
                    $scope.NewRuleSet = rulesetDataShareService.getRulesetData();
                }
                else {
                    if (parseInt(RuleSetId) > 0) {
                        UpdateRuleSet(parseInt(RuleSetId), CopyOrUpdate);
                    }
                }
				
                if ($state.params.contentType == 1) {
                    $scope.RulesetItems = rulesetDataShareService.getRulesetItems();
                    $scope.RulesetContent = $scope.RulesetItems[$state.params.index];
					console.log("$scope.RulesetContent: ", $scope.RulesetContent);
                    // Setting ClientObjectId For Tiles.
                    for (var i = 0; i < $scope.RulesetContent.ItemProperties.length; i++) {
                        var ItemPropertyLst = $scope.RulesetContent.ItemProperties[i];
                        if (ItemPropertyLst.Id == 0 || ItemPropertyLst.Id == undefined || ItemPropertyLst.Id == "") {
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                            ItemPropertyLst.tile.ClientObjectId = $scope.initialClientObjectId;
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                        }
                    }
                }
                else if ($state.params.contentType == 2) {
                    $scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                    $scope.RulesetContent = $scope.RulesetSpells[$state.params.index];
                    // Setting ClientObjectId For Tiles.
                    for (var i = 0; i < $scope.RulesetContent.SpellProperties.length; i++) {
                        var spellPropertyLst = $scope.RulesetContent.SpellProperties[i];
                        if (spellPropertyLst.Id == 0 || spellPropertyLst.Id == undefined || spellPropertyLst.Id == "") {
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                            spellPropertyLst.tile.ClientObjectId = $scope.initialClientObjectId;
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                        }
                    }
                    //   $scope.LinkExecuteTileContent = $scope.NewRuleSet;
                }
                else if ($state.params.contentType == 3) {
                    $scope.RulesetAbilities = rulesetDataShareService.getRulesetAbilities();
                    $scope.RulesetContent = $scope.RulesetAbilities[$state.params.index];
                    // Setting ClientObjectId For Tiles.
                    for (var i = 0; i < $scope.RulesetContent.AbilityProperties.length; i++) {
                        var abilityPropertyLst = $scope.RulesetContent.AbilityProperties[i];
                        if (abilityPropertyLst.Id == 0 || abilityPropertyLst.Id == undefined || abilityPropertyLst.Id == "") {
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                            abilityPropertyLst.tile.ClientObjectId = $scope.initialClientObjectId;
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                        }
                    }
                    //   $scope.LinkExecuteTileContent = $scope.NewRuleSet;
                }

                $scope.BackContent = function (val) {
                    $scope.RulesetId = rulesetDataShareService.getRulesetsData();
                    if (val == 1) {

                        $state.go("profile.Items", { RuleSetId: $scope.RulesetId });
                    }
                    else if (val == 2) {
                        $state.go("profile.Spells", { RuleSetId: $scope.RulesetId });
                    }
                    else if (val == 3) {
                        $state.go("profile.Abilities", { RuleSetId: $scope.RulesetId });
                    }
                }
                //For Detail Screen Editing,Copying,Removing of Item.
                $scope.CopyItem = function (item) {
                    
                    //$scope.RulesetItems = rulesetDataShareService.getRulesetItems();
                    //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                    var spells = rulesetService.GetRulesetSpells($scope.RulesetId);
                    spells.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.Spells = data.data.PayLoad;
                            var abilities = rulesetService.GetRulesetAbilities($scope.RulesetId);
                            abilities.then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.Abilities = data.data.PayLoad;
                                    $scope.pageName = "Copying Item";
                                    $scope.buttontext = "Copy";
                                    $scope.IsButtonDisabled = true;
                                    $scope.isBtnShow = true;
                                    $scope.OperationTypeMode = "Copy"
                                    $scope.Content_ItemProperties = [];
                                    if ($scope.RulesetItems != null) {
                                        for (var i = 0; i < $scope.RulesetItems.length; i++) {
                                            $scope.Content_ItemProperties.push($scope.RulesetItems[i].ItemProperties[0].Value.Text.value);
                                        }
                                    }
                                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCopyItem',
                                        { scope: item.ItemProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, ItemMode: $scope.OperationTypeMode, Spells: $scope.Spells, AssociatedSpells: $scope.RulesetContent.AssociatedSpells, Abilities: $scope.Abilities, AssociatedAbilities: $scope.RulesetContent.AssociatedAbilities, Content_ItemProperties: $scope.Content_ItemProperties }
                                    );

                                    dlg.result.then(function (res) {
                                        
                                        if (res != "cancel") {
                                            var ItemProperties = { "ItemProperties": res.ItemProperties };
                                            for (var i = 0; i < ItemProperties.ItemProperties.length; i++) {
                                                ItemProperties.ItemProperties[i].ContentId = 0;
                                            }
                                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                            var NewItem = {}
                                            //NewItem.ItemProperties = res.Properties;
                                            NewItem.ItemProperties = res.ItemProperties;
                                            NewItem.AssociatedSpells = res.AssociatedSpells;
                                            NewItem.AssociatedAbilities = res.AssociatedAbilities;
                                            NewItem.RulesetId = $scope.RulesetId;
                                            //$scope.RuleSetItems.push(ItemProperties);
                                            $scope.ItemList = [];
                                            $scope.ItemList.push(NewItem);
                                            var copyitem = rulesetService.CopyItems($scope.ItemList);
                                            copyitem.then(function (data) {
                                             
                                                if (data.data.StatusCode == 200) {
                                                    //$scope.Ruleset = data.data.PayLoad.Result;
                                                    var createdRulesetItems = [];
                                                    createdRulesetItems = data.data.PayLoad;
                                                    for (var i = 0; i < createdRulesetItems.length; i++) {
                                                        $scope.RulesetItems.push(createdRulesetItems[i]);
                                                    }
                                                    rulesetDataShareService.setRulesetItems($scope.RulesetItems);
                                                    if ($scope.RulesetItems.length > 0) {
                                                        $scope.list = true;
                                                        $scope.grid = true;
                                                        $scope.Itemlist = false;
                                                    }
                                                    else {
                                                        $scope.list = false;
                                                        $scope.grid = false;
                                                        $scope.Itemlist = true;
                                                    }
                                                    $state.go("profile.Items", { RuleSetId: $scope.RulesetId })
                                                }
                                                else if (data.data.StatusCode == 400) {
                                                    if (data.ShowToUser == true) {
                                                        toaster.pop("error", data.data.ErrorMessage);

                                                    }
                                                }

                                            });
                                        }


                                    });
                                }
                            })
                        }
                    })
                    // $scope.Spells = rulesetDataShareService.getspell();
                    //$scope.Abilities = rulesetDataShareService.getability();

                }

                $scope.EditItem = function (item) {
                    //$scope.RulesetItems = rulesetDataShareService.getRulesetItems();
                    //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                    var spells = rulesetService.GetRulesetSpells($scope.RulesetId);
                    spells.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.Spells = data.data.PayLoad;
                            var abilities = rulesetService.GetRulesetAbilities($scope.RulesetId);
                            abilities.then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.Abilities = data.data.PayLoad;
                                    $scope.pageName = "Editing Item";
                                    $scope.buttontext = "Update";
                                    $scope.IsButtonDisabled = true;
                                    $scope.isBtnShow = true;
                                    $scope.OperationTypeMode = "Edit"

                                    //var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCreateItem',
                                    //    { scope: $scope.ItemProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Content_ItemProperties: $scope.Content_ItemProperties, ItemMode: $scope.OperationTypeMode, AssociatedSpells: $scope.NewRuleSet.Spells, AssociatedAbilities: $scope.NewRuleSet.Abilities }
                                    //);

                                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCopyItem',
                                        { scope: item.ItemProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, ItemMode: $scope.OperationTypeMode, Spells: $scope.Spells, AssociatedSpells: $scope.RulesetContent.AssociatedSpells, Abilities: $scope.Abilities, AssociatedAbilities: $scope.RulesetContent.AssociatedAbilities }
                                    );

                                    dlg.result.then(function (res) {
                                        if (res != "cancel") {
                                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                            var NewItem = {}
                                            //NewItem.ItemProperties = res.Properties;
                                            NewItem.ItemProperties = res.ItemProperties;
                                            NewItem.AssociatedSpells = res.AssociatedSpells;
                                            NewItem.AssociatedAbilities = res.AssociatedAbilities;
                                            NewItem.RulesetId = $scope.RulesetId;
                                            $scope.ItemList = [];
                                            $scope.ItemList.push(NewItem);
                                            var edititem = rulesetService.UpdateItems($scope.ItemList);
                                            edititem.then(function (data) {
                                                if (data.data.StatusCode == 200) {
                                                 
                                                    var updatedRulesetItems = data.data.PayLoad;

                                                    for (var i = 0; i < updatedRulesetItems.length; i++) {
                                                        for (var j = 0; j < $scope.RulesetItems.length; j++) {
                                                            if (updatedRulesetItems[i].ItemProperties[0].ContentId == $scope.RulesetItems[j].ItemProperties[0].ContentId) {
                                                                $scope.RulesetItems[j] = updatedRulesetItems[i];
                                                            }
                                                        }
                                                    }

                                                    rulesetDataShareService.setRulesetItems($scope.RulesetItems);

                                                    if ($scope.RulesetItems.length > 0) {
                                                        $scope.list = true;
                                                        $scope.grid = true;
                                                        $scope.Itemlist = false;
                                                    }
                                                    else {
                                                        $scope.list = false;
                                                        $scope.grid = false;
                                                        $scope.Itemlist = true;
                                                    }
                                                    $state.go("profile.Items", { RuleSetId: $scope.RulesetId })
                                                    // $state.go("profile.Items")
                                                }
                                            })

                                            //$scope.NewRuleSet.Items[count] = NewItem;

                                        }
                                    });
                                }
                            })
                        }
                    });
                  
                }
                $scope.Removeitem = function (item) {
                    //var index = -1;
                    //$scope.RulesetItems = rulesetDataShareService.get();

                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Item, "' + item.ItemProperties[0].Value.Text.value + '"',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                var deleteItemList = [];
                                //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                //item.RulesetId = $scope.RulesetId;
                                deleteItemList.push(item);
                                //$scope.Corestat = item;
                                var deleteitems = rulesetService.DeleteItems(deleteItemList);
                                deleteitems.then(function (data) {
                                    debugger;
                                    if (data.data.StatusCode == 200) {
                                        //$scope.Ruleset = data.data.PayLoad;
                                        var deletedRulesetItems = data.data.PayLoad;

                                        var deletedRulesetItemIndexs = [];
                                        for (var i = 0; i < deletedRulesetItems.length; i++) {
                                            for (var j = 0; j < $scope.RulesetItems.length; j++) {
                                                if (deletedRulesetItems[i].ItemProperties[0].ContentId == $scope.RulesetItems[j].ItemProperties[0].ContentId) {
                                                    deletedRulesetItemIndexs.push(j);
                                                }
                                            }
                                        }

                                        for (var i = 0; i < deletedRulesetItemIndexs.length; i++) {
                                            $scope.RulesetItems.splice(deletedRulesetItemIndexs[i], 1);
                                        }

                                        rulesetDataShareService.setRulesetItems($scope.RulesetItems);

                                        if ($scope.RulesetItems.length > 0) {
                                            $scope.list = true;
                                            $scope.grid = true;
                                            $scope.Itemlist = false;
                                        }
                                        else {
                                            $scope.list = false;
                                            $scope.grid = false;
                                            $scope.Itemlist = true;
                                        }
                                        $state.go("profile.Items", { RuleSetId: $scope.RulesetId })
                                    }
                                })
                            }
                        })

                };
                //For Detail Screen Editing,Copying,Removing of Spell.
                $scope.CopySpell = function (item) {
                    $scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                    $scope.pageName = "Copying Spell";
                    $scope.buttontext = "Copy";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Copy"
                    $scope.Content_SpellProperties = [];
                    if ($scope.RulesetSpells != null) {
                        for (var i = 0; i < $scope.RulesetSpells.length; i++) {
                            $scope.Content_SpellProperties.push($scope.RulesetSpells[i].SpellProperties[0].Value.Text.value);
                        }
                    }
                    var dlg = dialogs.create('/views/dialogs/createspells.html', 'dialogCopySpell',
                        { scope: item.SpellProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, Content_SpellProperties: $scope.Content_SpellProperties, SpellMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            var SpellProperties = res;
                            for (var i = 0; i < SpellProperties.length; i++) {
                                SpellProperties[i].ContentId = 0;
                            }
                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                            var NewSpell = {}
                            //NewItem.ItemProperties = res.Properties;
                            NewSpell.SpellProperties = SpellProperties;
                            NewSpell.RulesetId = $scope.RulesetId;
                            var SpellList = [];
                            SpellList.push(NewSpell);
                            var copyspell = rulesetService.CopySpells(SpellList);
                            copyspell.then(function (data) {

                                if (data.data.StatusCode == 200) {
                                    //$scope.RulesetSpells = data.data.PayLoad.Result;
                                    var createdRulesetSpells = [];
                                    createdRulesetSpells = data.data.PayLoad;
                                    for (var i = 0; i < createdRulesetSpells.length; i++) {
                                        $scope.RulesetSpells.push(createdRulesetSpells[i]);
                                    }

                                    rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);

                                    if ($scope.RulesetSpells.length > 0) {
                                        $scope.list = true;
                                        $scope.grid = true;
                                        $scope.Itemlist = false;
                                    }
                                    else {
                                        $scope.list = false;
                                        $scope.grid = false;
                                        $scope.Itemlist = true;
                                    }
                                    $state.go("profile.Spells", { RuleSetId: $scope.RulesetId })
                                }

                            });
                            //$scope.NewRuleSet.Spells.push(SpellProperties);

                        }

                    });
                }

                $scope.EditSpell = function (item) {
                    $scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                    $scope.pageName = "Editing Spell";
                    $scope.buttontext = "Update";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Edit"
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCopySpell',
                        { scope: item.SpellProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, SpellMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            var SpellProperties = res;
                            //$scope.NewRuleSet.Spells[count] = SpellProperties
                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                            var NewSpell = {}
                            //NewItem.ItemProperties = res.Properties;
                            NewSpell.SpellProperties = SpellProperties;
                            NewSpell.RulesetId = $scope.RulesetId;
                            var SpellList = [];
                            SpellList.push(NewSpell);
                            var editspell = rulesetService.UpdateSpells(SpellList);
                            editspell.then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    //$scope.RulesetSpells = data.data.PayLoad.Result;

                                    var updatedRulesetSpells = data.data.PayLoad;

                                    for (var i = 0; i < updatedRulesetSpells.length; i++) {
                                        for (var j = 0; j < $scope.RulesetSpells.length; j++) {
                                            if (updatedRulesetSpells[i].SpellProperties[0].ContentId == $scope.RulesetSpells[j].SpellProperties[0].ContentId) {
                                                $scope.RulesetSpells[j] = updatedRulesetSpells[i];
                                            }
                                        }
                                    }

                                    rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);

                                    if ($scope.RulesetSpells.length > 0) {
                                        $scope.list = true;
                                        $scope.grid = true;
                                        $scope.Itemlist = false;
                                    }
                                    else {
                                        $scope.list = false;
                                        $scope.grid = false;
                                        $scope.Itemlist = true;
                                    }
                                    $state.go("profile.Spells", { RuleSetId: $scope.RulesetId })

                                }
                            });
                        }
                    });
                }
                $scope.RemoveSpell = function (item) {
                    //$scope.RulesetSpells = rulesetDataShareService.getRulesetSpells();
                    //var index = -1;
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Spell, "' + item.SpellProperties[0].Value.Text.value + '"',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                $scope.SpellList = [];
                                //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                item.RulesetId = $scope.RulesetId;
                                $scope.SpellList.push(item);
                                //$scope.Corestat = item;
                                var deletespells = rulesetService.DeleteSpells($scope.SpellList);
                                deletespells.then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                        //$scope.RulesetSpells = data.data.PayLoad.Result;
                                        //rulesetDataShareService.setRulesetItems($scope.RulesetSpells);

                                        var deletedRulesetSpells = data.data.PayLoad;

                                        var deletedRulesetSpellIndexs = [];
                                        for (var i = 0; i < deletedRulesetSpells.length; i++) {
                                            for (var j = 0; j < $scope.RulesetSpells.length; j++) {
                                                if (deletedRulesetSpells[i].SpellProperties[0].ContentId == $scope.RulesetSpells[j].SpellProperties[0].ContentId) {
                                                    deletedRulesetSpellIndexs.push(j);
                                                }
                                            }
                                        }

                                        for (var i = 0; i < deletedRulesetSpellIndexs.length; i++) {
                                            $scope.RulesetSpells.splice(deletedRulesetSpellIndexs[i], 1);
                                        }

                                        rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);

                                        if ($scope.RulesetSpells.length > 0) {
                                            $scope.list = true;
                                            $scope.grid = true;
                                            $scope.Itemlist = false;
                                        }
                                        else {
                                            $scope.list = false;
                                            $scope.grid = false;
                                            $scope.Itemlist = true;
                                        }
                                        $state.go("profile.Spells", { RuleSetId: $scope.RulesetId })
                                    }
                                })
                            }
                        })

                };
                //For Detail Screen Editing,Copying,Removing of Ability.
                $scope.CopyAbility = function (item, count) {
                    //$scope.RulesetAbilities = rulesetDataShareService.getability();
                    $scope.pageName = "Copying Ability";
                    $scope.buttontext = "Copy";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Copy"
                    $scope.Content_AbilityProperties = [];
                    if ($scope.RulesetAbilities != null) {
                        for (var i = 0; i < $scope.RulesetAbilities.length; i++) {
                            $scope.Content_AbilityProperties.push($scope.RulesetAbilities[i].AbilityProperties[0].Value.Text.value);
                        }
                    }
                    var dlg = dialogs.create('/views/dialogs/createabilities.html', 'dialogCopyAbility',
                        { scope: item.AbilityProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, Content_AbilityProperties: $scope.Content_AbilityProperties, AbilityMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            var AbilityProperties = res;
                            for (var i = 0; i < AbilityProperties.length; i++) {
                                AbilityProperties[i].ContentId = 0;
                            }
                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                            var NewAbility = {}
                            //NewItem.ItemProperties = res.Properties;
                            NewAbility.AbilityProperties = AbilityProperties;
                            NewAbility.RulesetId = $scope.RulesetId;
                            $scope.AbilityList = [];
                            $scope.AbilityList.push(NewAbility);
                            var copyability = rulesetService.CopyAbilities($scope.AbilityList);
                            copyability.then(function (data) {
                                if (data.data.StatusCode == 200) {

                                    var createdRulesetAbilities = [];
                                    createdRulesetAbilities = data.data.PayLoad;
                                    for (var i = 0; i < createdRulesetAbilities.length; i++) {
                                        $scope.RulesetAbilities.push(createdRulesetAbilities[i]);
                                    }

                                    rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);

                                    if ($scope.RulesetAbilities.length > 0) {
                                        $scope.list = true;
                                        $scope.grid = true;
                                        $scope.Itemlist = false;
                                    }
                                    else {
                                        $scope.list = false;
                                        $scope.grid = false;
                                        $scope.Itemlist = true;
                                    }
                                    $state.go("profile.Abilities", { RuleSetId: $scope.RulesetId })
                                }

                            });
                        }


                    });
                }

                $scope.EditAbility = function (item, count) {
                    $scope.pageName = "Editing Ability";
                    $scope.buttontext = "Update";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Edit"
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCopyAbility',
                        { scope: item.AbilityProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, AbilityMode: $scope.OperationTypeMode }
                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            var AbilityProperties = res;
                            //$scope.NewRuleSet.Spells[count] = SpellProperties
                            //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                            var NewAbility = {}
                            //NewItem.ItemProperties = res.Properties;
                            NewAbility.AbilityProperties = AbilityProperties;
                            NewAbility.RulesetId = $scope.RulesetId;
                            $scope.AbilityList = [];
                            $scope.AbilityList.push(NewAbility);
                            var editability = rulesetService.UpdateAbilities($scope.AbilityList);
                            editability.then(function (data) {
                                if (data.data.StatusCode == 200) {

                                    var updatedRulesetAbilities = data.data.PayLoad;

                                    for (var i = 0; i < updatedRulesetAbilities.length; i++) {
                                        for (var j = 0; j < $scope.RulesetAbilities.length; j++) {
                                            if (updatedRulesetAbilities[i].AbilityProperties[0].ContentId == $scope.RulesetAbilities[j].AbilityProperties[0].ContentId) {
                                                $scope.RulesetAbilities[j] = updatedRulesetAbilities[i];
                                            }
                                        }
                                    }

                                    rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);

                                    if ($scope.RulesetAbilities.length > 0) {
                                        $scope.list = true;
                                        $scope.grid = true;
                                        $scope.Itemlist = false;
                                    }
                                    else {
                                        $scope.list = false;
                                        $scope.grid = false;
                                        $scope.Itemlist = true;
                                    }
                                    $state.go("profile.Abilities", { RuleSetId: $scope.RulesetId })

                                }
                            });
                        }

                    });
                }

                $scope.RemoveAbility = function (item) {
                    //$scope.RulesetAbilities = rulesetDataShareService.getability();
                    //var index = -1;
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Ability, "' + item.AbilityProperties[0].Value.Text.value + '"',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                $scope.AbilityList = [];
                                //$scope.RulesetId = rulesetDataShareService.getRulesetsData();
                                item.RulesetID = $scope.RulesetId;
                                $scope.AbilityList.push(item);
                                //$scope.Corestat = item;
                                var deleteabilities = rulesetService.DeleteAbilities($scope.AbilityList);
                                deleteabilities.then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                        var deletedRulesetAbilities = data.data.PayLoad;

                                        var deletedRulesetAbilityIndexs = [];
                                        for (var i = 0; i < deletedRulesetAbilities.length; i++) {
                                            for (var j = 0; j < $scope.RulesetAbilities.length; j++) {
                                                if (deletedRulesetAbilities[i].AbilityProperties[0].ContentId == $scope.RulesetAbilities[j].AbilityProperties[0].ContentId) {
                                                    deletedRulesetAbilityIndexs.push(j);
                                                }
                                            }
                                        }

                                        for (var i = 0; i < deletedRulesetAbilityIndexs.length; i++) {
                                            $scope.RulesetAbilities.splice(deletedRulesetAbilityIndexs[i], 1);
                                        }

                                        rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);

                                        if ($scope.RulesetAbilities.length > 0) {
                                            $scope.list = true;
                                            $scope.grid = true;
                                            $scope.Itemlist = false;
                                        }
                                        else {
                                            $scope.list = false;
                                            $scope.grid = false;
                                            $scope.Itemlist = true;
                                        }
                                        $state.go("profile.Abilities", { RuleSetId: $scope.RulesetId})
                                    }
                                })
                            }
                        })


                };
                //For Tiles
                $scope.ShowTiles = function (val) {
                    var tilesmetadata = rulesetService.GetTilesMetadataForRuleset();
                    tilesmetadata.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.TileTypes = data.data.PayLoad.RuleSetMetaData.TileTypes;
                            $scope.ItemPropertyForTile = data.data.PayLoad.RuleSetMetaData.ItemProperty;

                            $scope.Tile = data.data.PayLoad.RuleSetMetaData.Tile;
                            for (var i = 0; i < $scope.TileTypes.length; i++) {
                                if ($scope.TileTypes[i].TileType == "Attribute") {
                                    var index = 2;
                                    if (index != -1) {
                                        $scope.TileTypes.splice(index, 1);
                                    }
                                }
                            }
                            var dlg = dialogs.create('/views/dialogs/tile-type-picker.html', 'dialogTileTypes',
                                { scope: $scope.TileTypes }
                            );
                            dlg.result.then(function (res) {
                                if (res.TileType == "Note") {
                                    $scope.Tile.TileTypeId = res.TileId;
                                    $scope.Tile.TileTypeName = res.TileType;
                                    $scope.Tile.Value = res.Value;
                                    var dlg = dialogs.create('/views/dialogs/tile-editor-1.html', 'NoteTile',
                                        { scope: $scope.Tile }
                                    );
                                    dlg.result.then(function (res) {
                                        if (res != "cancel") {
                                            res.Height = "5";
                                            res.Width = "5";
                                            res.X = "0";
                                            res.Y = "0";
                                            res.IsSync = false;
                                            res.SyncDate = Date.now();
                                            var tile = { "tile": res };
                                            var ItemPropertyForTile = $scope.ItemPropertyForTile;
                                            ItemPropertyForTile.tile = res;
                                            val.push(ItemPropertyForTile);

                                        }
                                        $scope.ClientScopeChange = true;
                                    });
                                }
                                else if (res.TileType == "Counter") {
                                    $scope.Tile.TileTypeId = res.TileId;
                                    $scope.Tile.TileTypeName = res.TileType;
                                    $scope.Tile.Value = res.Value;
                                    var dlg = dialogs.create('/views/dialogs/tile-editor-2.html', 'NoteTile',
                                        { scope: $scope.Tile }
                                    );
                                    dlg.result.then(function (res) {
                                        if (res != "cancel") {
                                            res.Height = "5";
                                            res.Width = "5";
                                            res.X = "0";
                                            res.Y = "0";
                                            res.IsSync = false;
                                            res.SyncDate = Date.now();
                                            var tile = { "tile": res };
                                            var ItemPropertyForTile = $scope.ItemPropertyForTile;
                                            ItemPropertyForTile.tile = res;
                                            val.push(ItemPropertyForTile);
                                        }
                                        $scope.ClientScopeChange = true;

                                    });
                                }
                                
                                else if (res.TileType == "Link") {
                                    
                                    $scope.RuleSetContentForLinkExecuteTile = {};
                                    if (angular.equals({}, rulesetDataShareService.getRulesetItems()) == false) {
                                        $scope.RuleSetContentForLinkExecuteTile.Items = rulesetDataShareService.getRulesetItems();
                                    }
                                    else
                                    {
                                        var items = rulesetService.GetRulesetItems(parseInt($state.params.RuleSetId));
                                        items.then(function (data) {
                                            if (data.data.StatusCode == 200) {
                                                //$scope.Ruleset = data.data.PayLoad;
                                                $scope.RuleSetContentForLinkExecuteTile.RulesetItems = data.data.PayLoad;
                                                rulesetDataShareService.setRulesetItems($scope.RuleSetContentForLinkExecuteTile.Items);
                                                $("#loading").fadeOut("slow");
                                            }
                                            else if (data.data.StatusCode == 400) {
                                                if (data.ShowToUser == true) {
                                                    $("#loading").fadeOut("slow");
                                                    toaster.pop("error", data.data.ErrorMessage);


                                                }
                                            }

                                        })
                                    }

                                    if (angular.equals({}, rulesetDataShareService.getRulesetSpells()) == false) {
                                        $scope.RuleSetContentForLinkExecuteTile.Spells = rulesetDataShareService.getRulesetSpells();
                                    }
                                    else
                                    {
                                        var spells = rulesetService.GetRulesetSpells(parseInt($state.params.RuleSetId));
                                        spells.then(function (data) {
                                            if (data.data.StatusCode == 200) {
                                                //$scope.Ruleset = data.data.PayLoad;
                                                $scope.RuleSetContentForLinkExecuteTile.Spells = data.data.PayLoad;
                                                rulesetDataShareService.setRulesetSpells($scope.RuleSetContentForLinkExecuteTile.Spells);
                                                $("#loading").fadeOut("slow");
                                            }
                                            else if (data.data.StatusCode == 400) {
                                                if (data.ShowToUser == true) {
                                                    $("#loading").fadeOut("slow");
                                                    toaster.pop("error", data.data.ErrorMessage);

                                                }
                                            }

                                        })
                                    }
                                    if (angular.equals({}, rulesetDataShareService.getRulesetAbilities()) == false) {
                                        $scope.RuleSetContentForLinkExecuteTile.Abilities = rulesetDataShareService.getRulesetAbilities();
                                    }
                                    else {
                                        var abilities = rulesetService.GetRulesetAbilities(parseInt($state.params.RuleSetId));
                                        abilities.then(function (data) {
                                            if (data.data.StatusCode == 200) {
                                                //$scope.Ruleset = data.data.PayLoad;
                                                $scope.RuleSetContentForLinkExecuteTile.Abilities = data.data.PayLoad;
                                                rulesetDataShareService.setRulesetAbilities($scope.RuleSetContentForLinkExecuteTile.Abilities);
                                                $("#loading").fadeOut("slow");
                                            }
                                            else if (data.data.StatusCode == 400) {
                                                if (data.ShowToUser == true) {
                                                    $("#loading").fadeOut("slow");
                                                    toaster.pop("error", data.data.ErrorMessage);

                                                }
                                            }

                                        })
                                    }
                                    $scope.Tile.TileTypeId = res.TileId;
                                    $scope.Tile.TileTypeName = res.TileType;
                                    $scope.Tile.Value = res.Value;

                                    var dlg = dialogs.create('/views/dialogs/tile-editor-4.html', 'NoteTile',
                                        { scope: $scope.Tile, RuleSetContentForLinkExecuteTile: $scope.RuleSetContentForLinkExecuteTile }
                                    );
                                    dlg.result.then(function (res) {
                                        if (res != "cancel") {
                                            res.Height = "5";
                                            res.Width = "5";
                                            res.X = "0";
                                            res.Y = "0";
                                            res.IsSync = false;
                                            res.SyncDate = Date.now();
                                            var tile = { "tile": res };
                                            var ItemPropertyForTile = $scope.ItemPropertyForTile;
                                            ItemPropertyForTile.tile = res;
                                            val.push(ItemPropertyForTile);

                                        }
                                        $scope.ClientScopeChange = true;

                                    });
                                }
                                else if (res.TileType == "Execute") {
                                   
                                    $scope.RuleSetContentForLinkExecuteTile = {};
                                    if (angular.equals({}, rulesetDataShareService.getRulesetItems()) == false) {
                                        $scope.RuleSetContentForLinkExecuteTile.Items = rulesetDataShareService.getRulesetItems();
                                    }
                                    else {
                                        var items = rulesetService.GetRulesetItems(parseInt($state.params.RuleSetId));
                                        items.then(function (data) {
                                            if (data.data.StatusCode == 200) {
                                                //$scope.Ruleset = data.data.PayLoad;
                                                $scope.RuleSetContentForLinkExecuteTile.RulesetItems = data.data.PayLoad;
                                                rulesetDataShareService.setRulesetItems($scope.RuleSetContentForLinkExecuteTile.Items);
                                                $("#loading").fadeOut("slow");
                                            }
                                            else if (data.data.StatusCode == 400) {
                                                if (data.ShowToUser == true) {
                                                    $("#loading").fadeOut("slow");
                                                    toaster.pop("error", data.data.ErrorMessage);

                                                }
                                            }

                                        })
                                    }

                                    if (angular.equals({}, rulesetDataShareService.getRulesetSpells()) == false) {
                                        $scope.RuleSetContentForLinkExecuteTile.Spells = rulesetDataShareService.getRulesetSpells();
                                    }
                                    else {
                                        var spells = rulesetService.GetRulesetSpells(parseInt($state.params.RuleSetId));
                                        spells.then(function (data) {
                                            if (data.data.StatusCode == 200) {
                                                //$scope.Ruleset = data.data.PayLoad;
                                                $scope.RuleSetContentForLinkExecuteTile.Spells = data.data.PayLoad;
                                                rulesetDataShareService.setRulesetSpells($scope.RuleSetContentForLinkExecuteTile.Spells);
                                                $("#loading").fadeOut("slow");
                                            }
                                            else if (data.data.StatusCode == 400) {
                                                if (data.ShowToUser == true) {
                                                    $("#loading").fadeOut("slow");
                                                    toaster.pop("error", data.data.ErrorMessage);

                                                }
                                            }

                                        })
                                    }
                                    if (angular.equals({}, rulesetDataShareService.getRulesetAbilities()) == false) {
                                        $scope.RuleSetContentForLinkExecuteTile.Abilities = rulesetDataShareService.getRulesetAbilities();
                                    }
                                    else {
                                        var abilities = rulesetService.GetRulesetAbilities(parseInt($state.params.RuleSetId));
                                        abilities.then(function (data) {
                                            if (data.data.StatusCode == 200) {
                                                //$scope.Ruleset = data.data.PayLoad;
                                                $scope.RuleSetContentForLinkExecuteTile.Abilities = data.data.PayLoad;
                                                rulesetDataShareService.setRulesetAbilities($scope.RuleSetContentForLinkExecuteTile.Abilities);
                                                $("#loading").fadeOut("slow");
                                            }
                                            else if (data.data.StatusCode == 400) {
                                                if (data.ShowToUser == true) {
                                                    $("#loading").fadeOut("slow");
                                                    toaster.pop("error", data.data.ErrorMessage);

                                                }
                                            }

                                        })
                                    }

                                    $scope.Tile.TileTypeId = res.TileId;
                                    $scope.Tile.TileTypeName = res.TileType;
                                    $scope.Tile.Value = res.Value;
                                    var dlg = dialogs.create('/views/dialogs/tile-editor-5.html', 'NoteTile',
                                        { scope: $scope.Tile, RuleSetContentForLinkExecuteTile: $scope.RuleSetContentForLinkExecuteTile }
                                    );
                                    dlg.result.then(function (res) {
                                        if (res != "cancel") {
                                            res.Height = "5";
                                            res.Width = "5";
                                            res.X = "0";
                                            res.Y = "0";
                                            res.IsSync = false;
                                            res.SyncDate = Date.now();
                                            var tile = { "tile": res };
                                            var ItemPropertyForTile = $scope.ItemPropertyForTile;
                                            ItemPropertyForTile.tile = res;
                                            val.push(ItemPropertyForTile);
                                        }
                                        $scope.ClientScopeChange = true;
                                    })

                                }
                                else if (res.TileType == "Command") {
                                    $scope.Tile.TileTypeId = res.TileId;
                                    $scope.Tile.TileTypeName = res.TileType;
                                    $scope.Tile.Value = res.Value;
                                    var dlg = dialogs.create('/views/dialogs/tile-editor-6.html', 'NoteTile',
                                        { scope: $scope.Tile }
                                    );
                                    dlg.result.then(function (res) {

                                        if (res != "cancel") {
                                            res.Height = "5";
                                            res.Width = "5";
                                            res.X = "0";
                                            res.Y = "0";
                                            res.IsSync = false;
                                            res.SyncDate = Date.now();
                                            var tile = { "tile": res };
                                            var ItemPropertyForTile = $scope.ItemPropertyForTile;
                                            ItemPropertyForTile.tile = res;
                                            val.push(ItemPropertyForTile);
                                        }

                                        $scope.ClientScopeChange = true;

                                    });
                                }
                                else if (res.TileType == "Image") {
                                    $scope.Tile.TileTypeId = res.TileId;
                                    $scope.Tile.TileTypeName = res.TileType;
                                    $scope.Tile.Value = res.Value;
                                    var dlg = dialogs.create('/views/dialogs/tile-editor-7.html', 'NoteTile',
                                        { scope: $scope.Tile }
                                    );
                                    dlg.result.then(function (res) {
                                        if (res != "cancel") {
                                            res.Height = "5";
                                            res.Width = "5";
                                            res.X = "0";
                                            res.Y = "0";
                                            res.IsSync = false;
                                            res.SyncDate = Date.now();
                                            var tile = { "tile": res };
                                            var ItemPropertyForTile = $scope.ItemPropertyForTile;
                                            ItemPropertyForTile.tile = res;
                                            val.push(ItemPropertyForTile);
                                        }

                                        $scope.ClientScopeChange = true;
                                    });

                                }
                            })

                        }
                    })
                    //var TileTypes = $scope.NewRuleSet.RuleSetMetaData.TileTypes;
                }

                $scope.SaveTilesForRuleset = function (tilecontent, Num) {
                    //$scope.NewLayout = rulesetDataShareService.getLayoutData();

                    if (Num == 1) {
                        //$scope.SelectedItemContent = tilecontent;
                        var RulesetTiles = {}
                        RulesetTiles.ItemProperties = tilecontent;
                        RulesetTiles.SpellProperties = null;
                        RulesetTiles.AbilityProperties = null
                        var items = rulesetService.SaveRulesetTiles(RulesetTiles).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.RulesetContent = data.data.PayLoad.Result;
                                toaster.pop('success', "Tile Added Successfully");
                            }
                        });
                    }
                    else if (Num == 2) {
                        var RulesetTiles = {}
                        RulesetTiles.ItemProperties = null;
                        RulesetTiles.SpellProperties = tilecontent;
                        RulesetTiles.AbilityProperties = null
                        var items = rulesetService.SaveRulesetTiles(RulesetTiles).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.RulesetContent = data.data.PayLoad.Result;
                                toaster.pop('success', "Tile Added Successfully");
                            }
                        });
                    }
                    else if (Num == 3) {
                        var RulesetTiles = {}
                        RulesetTiles.ItemProperties = null;
                        RulesetTiles.SpellProperties = null;
                        RulesetTiles.AbilityProperties = tilecontent
                        var items = rulesetService.SaveRulesetTiles(RulesetTiles).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.RulesetContent = data.data.PayLoad.Result;
                                toaster.pop('success', "Tile Added Successfully");
                            }
                        });
                    }
                }

                $scope.stackOptions = {
                    height: 150,
                    width: 400,
                    cellHeight: 30,
                    minWidth: 1,

                    pixelWidth: 35,
                    verticalMargin: 5,
                    alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

                    resizable: {
                        handles: 'e, se, s, sw, w'
                    },
                    draggable: {
                        refreshPositions: true,
                        handle: '.grid-stack-item-content'
                    }
                };

                $scope.onDragStart = function (event, ui) {
                    $timeout(function () {
                        $scope.state.tileDragging = true;
                    });
                };

                $scope.onDragStop = function (event, ui) {
                    $timeout(function () {
                        $scope.state.tileDragging = false;
                    });
                };

                $scope.state = {
                    tilesEditing: false,
                    tileDragging: false,
                    tileDeleteId: null
                };

                $scope.moveWidget = function () {
                    $scope.widgets[0].x = 1;
                    $scope.widgets[0].width = 2;
                    $scope.widgets[0].height = 2;
                };

                $scope.widgets = [{ x: 0, y: 0, width: 1, height: 1 }, { x: 0, y: 0, width: 3, height: 1 }];
                $scope.onChange = function (event, items) {
                    $log.log("onChange event: " + event + " items:" + items);
                };

                $scope.onResizeStop = function (event, ui) {
                    $log.log("onResizeStop event: " + event + " ui:" + ui);
                };

                $scope.onItemAdded = function (item) {
                    $log.log("onItemAdded item: " + item);
                };

                $scope.onItemRemoved = function (item) {
                    $log.log("onItemRemoved item: " + item);
                };


                $scope.ShowAssociatedSpells = function (index) {
                    $state.go("profile.RulesetSpellDetails", { index: index });
                }

                $scope.ShowAllSpellsContent = function (index) {
                    //alert("Testing Aleart");

                    $state.go("profile.RulesetSpellDetails", { index: index });
                }

                $scope.ShowAssociatedSpells = function (index) {
                    //alert("Testing Aleart");

                    $state.go("profile.RulesetSpellDetails", { index: index });
                }


            }

            function UpdateRuleSet(Id, CopyOrUpdate) {
                $("#loading").css("display", "block");
                var getData = rulesetService.GetNewRulesetByRuleSetId(Id);
                getData.then(function (data) {
                    $("#loading").fadeOut("slow");
                    if (data.data.StatusCode == 200) {
                        $scope.NewRuleSet = data.data.PayLoad
                        $scope.ItemProperties = $scope.NewRuleSet.RuleSetMetaData.ItemProperties;
                        $scope.SpellProperties = $scope.NewRuleSet.RuleSetMetaData.SpellProperties;
                        $scope.AbilityProperties = $scope.NewRuleSet.RuleSetMetaData.AbilityProperties;
                        $scope.CoreStatProperties = $scope.NewRuleSet.RuleSetMetaData.Corestats;

                        $scope.NewRuleSet.ImportRquired = true;

                        rulesetDataShareService.setRulesetData(null);
                        rulesetDataShareService.setRulesetData($scope.NewRuleSet);

                        if ($scope.NewRuleSet.Corestats.length == 0) {
                            $scope.NewRuleSet.IsAddDisabled = false;
                            $scope.iscorestatsadded = false;
                        }
                        else {
                            $scope.NewRuleSet.IsAddDisabled = true;
                            $scope.iscorestatsadded = true;
                        }
                        if ($scope.NewRuleSet.Items.length == 0) {
                            $scope.isitemsadded = false;
                        }
                        else {
                            $scope.isitemsadded = true;
                        }
                        if ($scope.NewRuleSet.Spells.length == 0) {
                            $scope.isspellsadded = false;
                        }
                        else {
                            $scope.isspellsadded = true;
                        }
                        if ($scope.NewRuleSet.Abilities.length == 0) {
                            $scope.isabilitiesadded = false;
                        }
                        else {
                            $scope.isabilitiesadded = true;
                        }

                        if (angular.equals({}, rulesetDataShareService.getruleset()) == false) {
                            $scope.NewRuleSet = rulesetDataShareService.getruleset();
                            if ($scope.NewRuleSet.Corestats != null) {
                                if ($scope.NewRuleSet.Corestats.length > 0) {
                                    $scope.iscorestatsadded = true;
                                }
                            }
                            if ($scope.NewRuleSet.Items != null) {
                                if ($scope.NewRuleSet.Items.length > 0) {
                                    $scope.isitemsadded = true;
                                }
                            }
                            if ($scope.NewRuleSet.Spells != null) {
                                if ($scope.NewRuleSet.Spells.length > 0) {
                                    $scope.isspellsadded = true;
                                }
                            }
                            if ($scope.NewRuleSet.Abilities != null) {
                                if ($scope.NewRuleSet.Abilities.length > 0) {
                                    $scope.isabilitiesadded = true;
                                }
                            }
                        }
                        //if (angular.equals({}, rulesetDataShareService.getRulesetcontent()) == false) {
                        //    $scope.RulesetContent = rulesetDataShareService.getRulesetcontent();
                        //    $scope.isabilitiesadded = true;
                        //}

                        for (var i = 0; i < $scope.NewRuleSet.Corestats.length; i++) {
                            var result = $scope.NewRuleSet.Corestats[i];
                            for (var k = 0; k < $scope.Types.length; k++) {
                                if ($scope.Types[k].TypeId == result.TypeId) {
                                    result.TypeName = $scope.Types[k].Name;
                                }
                            }
                        }
                        $scope.ItemsCount = $scope.NewRuleSet.Items.length;
                        $scope.SpellsCount = $scope.NewRuleSet.Spells.length;
                        $scope.AbilitiesCount = $scope.NewRuleSet.Abilities.length;
                        if (CopyOrUpdate == 0) {
                            $scope.NewRuleSet.Action = "Copy";
                            $scope.NewRuleSet.ActionIcon = "fa fa-clone";
                            $scope.NewRuleSet.Heading = "Copy Ruleset Details";
                        }
                        else {
                            $scope.NewRuleSet.Action = "Update";
                            $scope.NewRuleSet.ActionIcon = "fa fa-pencil-square-o";
                            $scope.NewRuleSet.Heading = "Update Ruleset Details for " + $scope.NewRuleSet.Name;
                        }
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                toaster.pop("error", data.data.ErrorMessage);
                            }
                        }
                    }
                },
                    function () {
                        toaster.pop("error", 'Error in getting records');

                    });
            }

            function AddRuleSet() {
                $("#loading").css("display", "block");
                rulesetService.GetNewRuleset().then(function (data) {
                    $("#loading").fadeOut("slow");
                    if (data.data.StatusCode == 200) {
                        $scope.NewRuleSet = data.data.PayLoad
                        $scope.ItemProperties = $scope.NewRuleSet.RuleSetMetaData.ItemProperties;
                        $scope.SpellProperties = $scope.NewRuleSet.RuleSetMetaData.SpellProperties;
                        $scope.AbilityProperties = $scope.NewRuleSet.RuleSetMetaData.AbilityProperties;
                        $scope.CoreStatProperties = $scope.NewRuleSet.RuleSetMetaData.Corestats;

                        rulesetDataShareService.setRulesetData(null);
                        rulesetDataShareService.setRulesetData($scope.NewRuleSet);

                       

                        $scope.NewRuleSet.IsAddDisabled = false;
                        $scope.NewRuleSet.Action = "Add";
                        $scope.NewRuleSet.ActionIcon = "fa fa-plus";
                        $scope.NewRuleSet.Heading = "Add New Ruleset";
                    }
                    else {
                        if (data.data.StatusCode == 400) {
                            if (data.data.ShowToUser == true) {
                                toaster.pop("error", data.data.ErrorMessage);
                            }
                        }
                    }
                });
            }
            $scope.onDeleteDrop = function (event, ui) {
                var tile = GridStackUI.Utils.getNodeData(ui.helper);
                var ClientObjectTileId = ui.helper[0].dataset.gsId;

                var deletedTileIndex = -1;
                if ($scope.RulesetContent.ItemProperties != undefined && $scope.RulesetContent.ItemProperties != null && $scope.RulesetContent.ItemProperties != "")
                {
                    for (var i = 0; i < $scope.RulesetContent.ItemProperties.length; i++) {
                        var ItemPropertyLst = $scope.RulesetContent.ItemProperties[i];
                        if (ItemPropertyLst.Id == 0 || ItemPropertyLst.Id == undefined || ItemPropertyLst.Id == "") {
                            if (ClientObjectTileId == $scope.RulesetContent.ItemProperties[i].tile.ClientObjectId) {
                                deletedTileIndex = i;
                            }
                        }
                    }

                    if ($scope.RulesetContent.ItemProperties[deletedTileIndex].tile.TileId == 0) {
                        $scope.RulesetContent.ItemProperties.splice(deletedTileIndex, 1);
                    }
                    else {
                        tileService.deleteTile($scope.RulesetContent.ItemProperties[deletedTileIndex].tile).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.RulesetContent.ItemProperties.splice(deletedTileIndex, 1);
                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        });
                    }
                }

                else if ($scope.RulesetContent.SpellProperties != undefined && $scope.RulesetContent.SpellProperties != null && $scope.RulesetContent.SpellProperties != "") {
                    for (var i = 0; i < $scope.RulesetContent.SpellProperties.length; i++) {
                        var spellPropertyLst = $scope.RulesetContent.SpellProperties[i];
                        if (spellPropertyLst.Id == 0 || spellPropertyLst.Id == undefined || spellPropertyLst.Id == "") {
                            if (ClientObjectTileId == $scope.RulesetContent.SpellProperties[i].tile.ClientObjectId) {
                                    deletedTileIndex = i;
                                }
                            }
                        }

                    if ($scope.RulesetContent.SpellProperties[deletedTileIndex].tile.TileId == 0) {
                        $scope.RulesetContent.SpellProperties.splice(deletedTileIndex, 1);
                        }
                        else {
                        tileService.deleteTile($scope.RulesetContent.SpellProperties[deletedTileIndex].tile).then(function (data) {
                                if (data.data.StatusCode == 200) {
                                    $scope.RulesetContent.SpellProperties.splice(deletedTileIndex, 1);
                                }
                                else if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }
                            });
                        }
                }
                else if ($scope.RulesetContent.AbilityProperties != undefined && $scope.RulesetContent.AbilityProperties != null && $scope.RulesetContent.AbilityProperties != "") {
                    for (var i = 0; i < $scope.RulesetContent.AbilityProperties.length; i++) {
                        var abilityPropertyLst = $scope.RulesetContent.AbilityProperties[i];
                        if (abilityPropertyLst.Id == 0 || abilityPropertyLst.Id == undefined || abilityPropertyLst.Id == "") {
                            if (ClientObjectTileId == $scope.RulesetContent.AbilityProperties[i].tile.ClientObjectId) {
                                deletedTileIndex = i;
                            }
                        }
                    }

                    if ($scope.RulesetContent.AbilityProperties[deletedTileIndex].tile.TileId == 0) {
                        $scope.RulesetContent.AbilityProperties.splice(deletedTileIndex, 1);
                    }
                    else {
                        tileService.deleteTile($scope.RulesetContent.AbilityProperties[deletedTileIndex].tile).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.RulesetContent.AbilityProperties.splice(deletedTileIndex, 1);
                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        });
                    }
                }
                

                
            };
            $scope.onDeleteDropCharacterItem = function (event, ui) {
                var tile = GridStackUI.Utils.getNodeData(ui.helper);
                var TileId = ui.helper[0].dataset.gsId;
                if (TileId)
                    tileService.deleteTile(parseInt(TileId)).then(function (data) {
                        if (data.data.StatusCode == 200) {
                            //$scope.RuleSet = $scope.NewRuleSet;
                            $scope.RuleSetItems = rulesetDataShareService.getRulesetItems();
                            $scope.RuleSetSpells = rulesetDataShareService.getRulesetSpells();
                            $scope.RuleSetAbilities = rulesetDataShareService.getRulesetAbilities();
                            for (var i = 0; i < $scope.RuleSetItems.length; i++) {
                                var Item = $scope.RuleSetItems[i];
                                var ItemPropertyLst = Item.ItemProperties;
                                for (var j = 0; j < ItemPropertyLst.length; j++) {
                                    var TileItemProperties = ItemPropertyLst[j];
                                    if (ItemPropertyLst[j].ContentTypeId == null) {
                                        var RemainingTiles = [];
                                        if (j != 0) {
                                            RemainingTiles.push(ItemPropertyLst[j]);
                                        }
                                        if (ItemPropertyLst[j].tile.TileId == parseInt(TileId)) {
                                            if (j == 0) {
                                                ItemPropertyLst.splice(j, 1);
                                                TileItemProperties = RemainingTiles;
                                            }
                                            else {
                                                ItemPropertyLst.splice(j, 1);
                                            }
                                        }
                                    }
                                }
                            }
                            for (var i = 0; i < $scope.RuleSetSpells.length; i++) {
                                var Spell = $scope.RuleSetSpells[i];
                                var SpellPropertyLst = Spell.SpellProperties;
                                for (var j = 0; j < SpellPropertyLst.length; j++) {
                                    var TileSpellProperties = SpellPropertyLst[j];
                                    if (SpellPropertyLst[j].ContentTypeId == null) {
                                        var RemainingTiles = [];
                                        if (j != 0) {
                                            RemainingTiles.push(SpellPropertyLst[j]);
                                        }
                                        if (SpellPropertyLst[j].tile.TileId == parseInt(TileId)) {
                                            if (j == 0) {
                                                SpellPropertyLst.splice(j, 1);
                                                TileSpellProperties = RemainingTiles;
                                            }
                                            else {
                                                SpellPropertyLst.splice(j, 1);
                                            }
                                        }
                                    }
                                }
                            }
                            for (var i = 0; i < $scope.RuleSetAbilities.length; i++) {
                                var Ability = $scope.RuleSetAbilities[i];
                                var AbilityPropertyLst = Ability.AbilityProperties;
                                for (var j = 0; j < AbilityPropertyLst.length; j++) {
                                    var TileAbilityProperties = AbilityPropertyLst[j];
                                    if (AbilityPropertyLst[j].ContentTypeId == null) {
                                        var RemainingTiles = [];
                                        if (j != 0) {
                                            RemainingTiles.push(SpellPropertyLst[j]);
                                        }
                                        if (AbilityPropertyLst[j].tile.TileId == parseInt(TileId)) {
                                            if (j == 0) {
                                                AbilityPropertyLst.splice(j, 1);
                                                TileAbilityProperties = RemainingTiles;
                                            }
                                            else {
                                                AbilityPropertyLst.splice(j, 1);
                                            }
                                        }
                                    }
                                }
                            }
                            //$scope.NewRuleSet = [];
                            //$scope.NewRuleSet = $scope.RuleSet;
                            toaster.pop('success', "Tile deleted Successfully.");
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        }
                    });
			};

			//Bing Search
			$scope.OpenBingSearch = function () {
				$scope.buttontext = "Ok";
				$scope.pageName = "Bing Image Search";
				var dlg = dialogs.create('/views/search/BingSearch.html', 'dialogGeneralSettings',
					{ btntext: $scope.buttontext, tabname: $scope.pageName, BingSearch: $scope.BingSearch }
				);
				dlg.result.then(function (res) {
					if (res != 'cancel') {
						
					}
				});

			}

            // For New Design

            $scope.RulesetGeneralSettings = function () {
                var settings = rulesetService.GetGeneralSettingsMetadata();
                settings.then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.GeneralSettingsMetadata = data.data.PayLoad.Rulesetproperty;
                        $scope.buttontext = "Next";
                        $scope.pageName = "New Rule Set";
                        var dlg = dialogs.create('/views/dialogs/rulesetgeneralsettings.html', 'dialogGeneralSettings',
							{ OpenBingSearch: $scope.OpenBingSearch,OpenFile: $scope.OpenFile, scope: $scope.GeneralSettingsMetadata, btntext: $scope.buttontext, tabname: $scope.pageName, BingSearch: $scope.BingSearch}
                        );
                        dlg.result.then(function (res) {
                            if (res != 'cancel') {
                                GetRulesets();
                                $state.go('profile.AddNewRuleSet');
                                toaster.pop("success", "Rule Set created successfully");
                                $("#loading").fadeOut("slow");
                            }
                        });
                    }
                    else if (data.data.StatusCode == 400) {
                        if (data.data.ShowToUser == true) {
                            toaster.pop("error", data.data.ErrorMessage);
                        }
                    }
                })

			}

			$scope.ManageRuleset = function (val) {
               // $("#loading").css("display", "block");
				console.log("Val: ", val);
				var editsettings = rulesetService.GetRuleSetGeneralSettings(val);
				editsettings.then(function (data) {
					console.log("editsettings: ", editsettings);
					if (data.data.StatusCode == 200) {
						$scope.GeneralSettings = data.data.PayLoad;
						$scope.buttontext = "Update";
						$scope.pageName = "Edit Rule Set";
						$scope.Disabled = "Edit";
						$scope.DisableName = true;

						//Pass the ruleset in the dialog here
						$scope.RulesetId = val;
						rulesetDataShareService.setRulesetsData($scope.RulesetId);
						var dlg = dialogs.create('/views/dialogs/manageruleset.html', 'dialogManageRuleset',
							{ scope: $scope.GeneralSettings}
						);
						dlg.result.then(function (res, Id) {
							if (res == "General") {
								$("#loading").css("display", "block");
								$scope.RulesetId = rulesetDataShareService.getRulesetsData();
								$scope.EditGeneralSettings($scope.RulesetId);
							} else if (res == "Corestat") {
								$("#loading").css("display", "block");
								$scope.RulesetId = rulesetDataShareService.getRulesetsData();
								var corestats = rulesetService.GetRulesetCorestats($scope.RulesetId);
								corestats.then(function (data) {
									$("#loading").fadeOut("slow");
									if (data.data.StatusCode == 200) {
										$scope.Corestats = data.data.PayLoad;
										rulesetService.GetTypes().then(function (data) {
											if (data.data.StatusCode == 200) {
												$scope.Types = data.data.PayLoad;
												rulesetDataShareService.setcorestat($scope.Corestats);
												for (var i = 0; i < $scope.Types.length; i++) {
													for (var j = 0; j < $scope.Corestats.length; j++) {
														if ($scope.Types[i].TypeId == $scope.Corestats[j].TypeId) {
															$scope.Corestats[j].TypeName = $scope.Types[i].Name;
														}
													}
												}
												if ($scope.Corestats.length > 0) {
													$scope.lists = true;
													$scope.list = false;
												}
												else {
													$scope.lists = false;
													$scope.list = true;
												}
												$state.go("profile.Corestats", { RuleSetId: $scope.RulesetId })
											}
											else {
												if (data.data.StatusCode == 400) {
													if (data.data.ShowToUser == true) {
														toaster.pop("error", data.data.ErrorMessage);
													}
												}
											}
										});

									}
								})
							}
							else if (res == "Items") {
								$("#loading").css("display", "block");
								$scope.RulesetId = rulesetDataShareService.getRulesetsData();
								var items = rulesetService.GetRulesetItems($scope.RulesetId);
								items.then(function (data) {
									$("#loading").fadeOut("slow");
									if (data.data.StatusCode == 200) {
										//$scope.Ruleset = data.data.PayLoad;
										$scope.RulesetItems = data.data.PayLoad;
										rulesetDataShareService.setRulesetItems($scope.RulesetItems);
										if ($scope.RulesetItems.length > 0) {
											$scope.list = true;
											$scope.grid = true;
											$scope.Itemlist = false;
										}
										else {
											$scope.list = false;
											$scope.grid = false;
											$scope.Itemlist = true;
										}
										$state.go("profile.Items", { RuleSetId: $scope.RulesetId })
									}
									else if (data.data.StatusCode == 400) {
										if (data.ShowToUser == true) {
											toaster.pop("error", data.data.ErrorMessage);
										}
									}

								})
							}
							else if (res == "Spells") {
								$("#loading").css("display", "block");
								$scope.RulesetId = rulesetDataShareService.getRulesetsData();
								var spells = rulesetService.GetRulesetSpells($scope.RulesetId);
								spells.then(function (data) {
									$("#loading").fadeOut("slow");
									if (data.data.StatusCode == 200) {
										//$scope.Ruleset = data.data.PayLoad;
										$scope.RulesetSpells = data.data.PayLoad;
										rulesetDataShareService.setRulesetSpells($scope.RulesetSpells);
										if ($scope.RulesetSpells.length > 0) {
											$scope.list = true;
											$scope.grid = true;
											$scope.Itemlist = false;
										}
										else {
											$scope.list = false;
											$scope.grid = false;
											$scope.Itemlist = true;
										}
										$state.go("profile.Spells", { RuleSetId: $scope.RulesetId })
									}
									else if (data.data.StatusCode == 400) {
										if (data.ShowToUser == true) {
											toaster.pop("error", data.data.ErrorMessage);
										}
									}

								})
							}

							else if (res == "Abilities") {
								$("#loading").css("display", "block");
								$scope.RulesetId = rulesetDataShareService.getRulesetsData();
								var abilities = rulesetService.GetRulesetAbilities($scope.RulesetId);
								abilities.then(function (data) {
									$("#loading").fadeOut("slow");
									if (data.data.StatusCode == 200) {
										//$scope.Ruleset = data.data.PayLoad;
										$scope.RulesetAbilities = data.data.PayLoad;
										rulesetDataShareService.setRulesetAbilities($scope.RulesetAbilities);
										if ($scope.RulesetAbilities.length > 0) {
											$scope.list = true;
											$scope.grid = true;
											$scope.Itemlist = false;
										}
										else {
											$scope.list = false;
											$scope.grid = false;
											$scope.Itemlist = true;
										}
										$state.go("profile.Abilities", { RuleSetId: $scope.RulesetId })
									}
									else if (data.data.StatusCode == 400) {
										if (data.ShowToUser == true) {
											toaster.pop("error", data.data.ErrorMessage);

										}
									}

								})
							}
							$("#loading").fadeOut("slow");
						})
					}
				});
                
            }

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

            $scope.hideConteextMenu = function (c) {
                var cardActionsHover = angular.element(c.target).parents(".card").find(".card-actions");
                cardActionsHover.removeClass("show");
                cardActionsHover.addClass("hide");
            };

            $scope.EditGeneralSettings = function (val) {
                var editsettings = rulesetService.GetRuleSetGeneralSettings(val)
                editsettings.then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.GeneralSettings = data.data.PayLoad;
                        $scope.buttontext = "Update";
                        $scope.pageName = "Edit Rule Set";
                        $scope.Disabled = "Edit";
                        $scope.DisableName = true;
                        var dlg = dialogs.create('/views/dialogs/rulesetgeneralsettings.html', 'dialogGeneralSettings',
							{ openManageRuleset: $scope.ManageRuleset, scope: $scope.GeneralSettings, btntext: $scope.buttontext, tabname: $scope.pageName, IsenableBtn: $scope.IsButtonDisabled, CoreStatsInGrid: $scope.CoreStatsInGrid, CoreStatsNameInGrid: $scope.CoreStatsNameInGrid, CoreStatMode: $scope.OperationTypeMode, Disabled: $scope.Disabled, DisableName: $scope.DisableName, BingSearch: $scope.BingSearch}
						);

                        dlg.result.then(function (res) {
                            if (res != "cancel") {
                                // $state.go("profile.AddNewRuleSet")
                                var editedRuleSetIndex = -1;
                                for (var i = 0; i < $scope.RuleSets.length; i++) {
                                    if ($scope.RuleSets[i].Id == res[0].RulesetId) {
                                        editedRuleSetIndex = i;
                                    }
                                }
                                if (editedRuleSetIndex > -1) {
                                    $scope.RuleSets[editedRuleSetIndex].Name = res[0].RulesetName;
                                    $scope.RuleSets[editedRuleSetIndex].Rulesetproperty = res;
                                }
                                toaster.pop('success', "Ruleset Updated Successfully");
                            }
                        })
                    }
                })
            }

            $scope.CopyRuleSet = function (item) {
                item.Rulesetproperty[0].RulesetId = item.Id;
                $scope.buttontext = "Copy";
                $scope.pageName = "Copy Ruleset";
                $scope.Disabled = "Copy";
                $scope.DisableName = false;
                var dlg = dialogs.create('/views/dialogs/rulesetgeneralsettings.html', 'dialogGeneralSettings',
                    { scope: item.Rulesetproperty, btntext: $scope.buttontext, tabname: $scope.pageName, IsenableBtn: $scope.IsButtonDisabled, CoreStatsInGrid: $scope.CoreStatsInGrid, CoreStatsNameInGrid: $scope.CoreStatsNameInGrid, CoreStatMode: $scope.OperationTypeMode, Disabled: $scope.Disabled, DisableName: $scope.DisableName}
                );

                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        GetRulesets();
                        //  $state.go("profile.AddNewRuleSet")
                        toaster.pop('success', res);
                    }
                })

            }


            $scope.GridViewTrigger = function (e) {
                var gridViewTrigger = angular.element(e.target);
                gridViewTrigger.parent().children().removeClass("selected");
                gridViewTrigger.addClass("selected");

                angular.element(".card-list").removeClass("view-list");
            }

            $scope.ListViewTrigger = function (e) {
                var listViewTrigger = angular.element(e.target);
                listViewTrigger.parent().children().removeClass("selected");
                listViewTrigger.addClass("selected");

                angular.element(".card-list").addClass("view-list");
            }


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


            $scope.hideConteextMenu = function (c) {
                var cardActionsHover = angular.element(c.target).parents(".card").find(".card-actions");
                cardActionsHover.removeClass("show");
                cardActionsHover.addClass("hide");
            };

            function b64toBlob(b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob = new Blob(byteArrays, { type: contentType });
                return blob;
            }

        }
    ])
})();