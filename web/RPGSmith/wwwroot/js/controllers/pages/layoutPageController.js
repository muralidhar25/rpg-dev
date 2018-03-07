(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('layoutPageController', ['$scope', 'characterService', '$q', '$window', '$transition', '$state', '$timeout', '$interval', '$log', 'dialogs', 'navService', 'rulesetDataShareService', 'layoutService', 'tabService', '$compile', 'rulesetService', 'toaster', 'tileService',
        function ($scope, characterService, $q, $window, $transition, $state, $timeout, $interval, $log, dialogs, navService, rulesetDataShareService, layoutService, tabService, $compile, rulesetService, toaster, tileService) {

            $scope.$on("$destroy", function () {
                //if ($scope.ClientScopeChange == true) {
                //    var dlg = dialogs.confirm(
                //        'Confirm Delete',
                //        'The updated data is not saved yet. Do you want to save before exiting?',
                //        { size: 'sm' }
                //    );

                //    dlg.result.then(
                //        function (btn) {

                //            //saveLayoutwithTimer();
                //        }
                //    );
                //}
                //else {

                //}
            });
			
            $scope.initialClientObjectId = 1000;

            $scope.ClientScopeChange = false;

            if ($state.params.action == 1) {

                $scope.isLayoutSavingInProgress = false;

                if ($state.params.isNew == 1) {

                    rulesetDataShareService.setLayoutData({});

                    rulesetDataShareService.setCharacterLayoutsData({});

                    rulesetDataShareService.setcorestatvalue({});

                    rulesetDataShareService.setLayoutItemInventoryMetaData({});
                    rulesetDataShareService.setLayoutSpellInventoryMetaData({});
                    rulesetDataShareService.setLayoutAbilityInventoryMetaData({});

                    rulesetDataShareService.setLayoutItemInventoryData({});
                    rulesetDataShareService.setLayoutSpellInventoryData({});
                    rulesetDataShareService.setLayoutAbilityInventoryData({});
                    rulesetDataShareService.setLayoutRulesetItemInventoryData({});
                    rulesetDataShareService.setLayoutRulesetSpellInventoryData({});
                    rulesetDataShareService.setLayoutRulesetAbilityInventoryData({});

                    var defaultLayout = layoutService.GetCharacterLayouts($state.params.characterId);

                    defaultLayout.then(function (data) {
                        if (data.data.StatusCode == 200) {
                            var layouts = setClientObjectId(data.data.PayLoad);
                            $scope.Layouts = layouts;
                            $scope.NewLayout = $scope.Layouts[0];    
                            $scope.LinkExecuteTileContent = $scope.NewLayout.RulesetViewModel;
                            rulesetDataShareService.setLinkTileData($scope.LinkExecuteTileContent);
                            $scope.selectedLayoutName = $scope.NewLayout.Name;

                            $scope.selectedPageName = $scope.NewLayout.TabList[0].TabName;

                            rulesetDataShareService.setLayoutData($scope.NewLayout);

                            rulesetDataShareService.setCharacterLayoutsData($scope.Layouts);
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
                else {
                    if (angular.equals({}, rulesetDataShareService.getLayoutData()) == false) {
                        $scope.NewLayout = rulesetDataShareService.getLayoutData();

                        $scope.selectedLayoutName = $scope.NewLayout.Name;
                        $scope.selectedPageName = $scope.NewLayout.TabList[0].TabName;
                    }
                    if (angular.equals({}, rulesetDataShareService.getCharacterLayoutsData()) == false) {
                        $scope.Layouts = rulesetDataShareService.getCharacterLayoutsData();
                    }
                    if (angular.equals({}, rulesetDataShareService.getCharacterLayoutsData()) == false) {
                        $scope.characters = rulesetDataShareService.setcorestatvalue();
                    }


                }

                
                var layoutAdd = function () {
                    var Scope = $scope.NewLayout;
                    Scope.LayoutId = $scope.NewLayout.LayoutId;
                    $scope.TabHeading = "Add Layout Name";
                    $scope.Buttontext = "Save";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: Scope, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );

                    dlg.result.then(function (name) {
                        name.LayoutId = 0;
                        name.Name = name.TabName;
                        name.TabName = "";
                        var FirstTabArray;
                        for (var i = 0; i < name.TabList.length; i++) {
                            if (i == 0) {
                                FirstTabArray = name.TabList[i];
                            }
                        }
                        name.TabList = [];
                        name.TabList.push(FirstTabArray)
                        name.TabList[0].LayoutId = 0;
                        name.TabList[0].TabId = 0;
                        name.TabList[0].TabName = "Default";
                        name.TabList[0].TabOrder = 0;
                        name.TabList[0].TileList = [];
                        name.IsDefault = true;

                        layoutService.create(name).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                //FillCharacterLayoutsInLeftSideMenu();
                                $scope.NewLayout = data.data.PayLoad;

                                $("#loading").fadeOut("slow");
                                toaster.pop('success', "Layout Added Successfully.");

                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        $("#loading").fadeOut("slow");
                                         toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }
                            }
                        });
                        //$timeout(function () {

                        //    var tab = dataService.createTab({
                        //        name: name,
                        //        order: $scope.LayoutTabs.length
                        //    });

                        //    $scope.LayoutTabs.push(tab);
                        //    $scope.state.tilesEditing = false;

                        //    $timeout(function () {
                        //        $scope.tabSet.index = tab.order;
                        //        updateTabs();
                        //    });
                        //});
                    });
                };



                var tabAdd = function () {
                    var Scope = $scope.NewLayout.LayoutMetaData.Tab;
                    Scope.LayoutId = $scope.NewLayout.LayoutId;
                    $scope.TabHeading = "Add Page Name";
                    $scope.Buttontext = "Save";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: Scope, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );

                    dlg.result.then(function (res) {
                        if ($scope.NewLayout.TabList == null || $scope.NewLayout.TabList == undefined) {
                            $scope.NewLayout.TabList = [];
                        }
                        else {
                            res.ClientObjectId = $scope.initialClientObjectId;
                            res.IsSync = false;
                            res.SyncDate = Date.now();
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                            $scope.NewLayout.TabList.push(res);
                            $scope.onTabSelected(res, $scope.NewLayout.TabList.length - 1);
                            $scope.ClientScopeChange = true;
                        }

                    });
                };

                $scope.AddNewtab = function () {
                    var Scope = $scope.NewLayout.LayoutMetaData.Tab;
                    Scope.LayoutId = $scope.NewLayout.LayoutId;
                    $scope.TabHeading = "Add Page Name";
                    $scope.Buttontext = "Save";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: Scope, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );

                    dlg.result.then(function (res) {
                        if ($scope.NewLayout.TabList == null || $scope.NewLayout.TabList == undefined) {
                            $scope.NewLayout.TabList = [];
                        }
                        else {
                            res.ClientObjectId = $scope.initialClientObjectId;
                            res.IsSync = false;
                            res.SyncDate = Date.now();
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;

                            tabService.AddTab(res).then(function (data) {
                                if (data.data.StatusCode == 200) {

                                    //$scope.NewLayout.TabList.push(res);

                                    for (var i = 0; i < $scope.Layouts.length; i++) {
                                        if ($scope.Layouts[i].LayoutId == data.data.PayLoad.LayoutId) {
                                            $scope.Layouts[i].TabList.push(data.data.PayLoad);
                                            $scope.NewLayout = $scope.Layouts[i];
                                        }
                                    }
                                    $scope.onTabSelected(res, $scope.NewLayout.TabList.length - 1);
                                    $("#loading").fadeOut("slow");
                                    toaster.pop('success', "Tab Added Successfully.");

                                }
                                else {
                                    if (data.data.StatusCode == 400) {
                                        if (data.data.ShowToUser == true) {
                                            $("#loading").fadeOut("slow");
                                             toaster.pop("error", data.data.ErrorMessage);
                                        }
                                    }
                                }
                            });
                            $scope.ClientScopeChange = true;

                        }

                    });
                }

                $scope.layoutAdd = function () {
                    var Scope = $scope.NewLayout;
                    Scope.LayoutId = $scope.NewLayout.LayoutId;
                    $scope.TabHeading = "Add Layout Name";
                    $scope.Buttontext = "Save";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: Scope, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );

                    dlg.result.then(function (name) {
                        name.LayoutId = 0;
                        name.Name = name.TabName;
                        name.TabName = "";
                        var FirstTabArray;
                        for (var i = 0; i < name.TabList.length; i++) {
                            if (i == 0) {
                                FirstTabArray = name.TabList[i];
                            }
                        }
                        name.TabList = [];
                        name.TabList.push(FirstTabArray)
                        name.TabList[0].LayoutId = 0;
                        name.TabList[0].TabId = 0;
                        name.TabList[0].TabName = "Default";
                        name.TabList[0].TabOrder = 0;
                        name.TabList[0].TileList = [];
                        name.IsDefault = true;

                        layoutService.create(name).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                //FillCharacterLayoutsInLeftSideMenu();
                                $scope.NewLayout = data.data.PayLoad;
                                $scope.Layouts.push(data.data.PayLoad);
                                $scope.selectedLayoutName = $scope.NewLayout.Name;
                                $scope.onTabSelected($scope.NewLayout.TabList[0], 0);
                                $("#loading").fadeOut("slow");
                                toaster.pop('success', "Layout Added Successfully.");

                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                        $("#loading").fadeOut("slow");
                                        toaster.pop("error", data.data.ErrorMessage);
                                   }
                                }
                            }
                        });
                    });
                };

                $scope.layoutLoad = function (layout) {
                    debugger;
                    $scope.state.tilesEditing = false;
                  
                    $scope.NewLayout = layout;
                    $scope.selectedLayoutName = $scope.NewLayout.Name;
                    $scope.onTabSelected($scope.NewLayout.TabList[0], 0);
                  
                };

                var tabRename = function () {

                    //var tabedit = $scope.NewLayout.TabList[$scope.tabSet.index];
                    $scope.TabHeading = "Rename";
                    $scope.Buttontext = "Update";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: $scope.NewLayout.TabList[$scope.tabSet.index], State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );

                    dlg.result.then(function (res) {

                        res.IsSync = false;
                        res.SyncDate = Date.now();
                        $scope.NewLayout.TabList[$scope.tabSet.index] = res;
                    });

                }

                $scope.EditTab = function (tab) {
                    //var tabedit = $scope.NewLayout.TabList[$scope.tabSet.index];
                    $scope.TabHeading = "Edit";
                    $scope.Buttontext = "Update";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: tab, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );

                    dlg.result.then(function (res) {
                        var edittab = tabService.UpdateTab(res).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                data.data.PayLoad.IsSync = false;
                                data.data.PayLoad.SyncDate = Date.now();
                                for (var i = 0; i < $scope.Layouts.length; i++) {
                                    for (var j = 0; j < $scope.Layouts[i].TabList.length; j++) {
                                        if ($scope.Layouts[i].TabList[j].ClientObjectId == data.data.PayLoad.ClientObjectId) {
                                            $scope.Layouts[i].TabList[j] = data.data.PayLoad;
                                        }
                                    }

                                }

                                //$scope.NewLayout.TabList[$scope.tabSet.index] = data.data.PayLoad;
                                $scope.ClientScopeChange = true;
                            }
                        })

                    });

                }

                $scope.DeleteTab = function (tab) {
                    //var tab = getActiveTab();

                    if (tab) {

                        var dlg = dialogs.confirm(
                            'Confirm Delete',
                            'Are you sure you want to delete "' + tab.TabName + '" and all its content?',
                            { size: 'sm' }
                        );

                        dlg.result.then(
                            function (res) {
                                if (res == 'yes') {
                                    if (tab.TabId > 0) {
                                        tabService.deleteTab(tab).then(function (data) {
                                            if (data.data.StatusCode == 200) {
                                                var deletedTabID = data.data.PayLoad.ClientObjectId;
                                                //var layoutId = data.data.PayLoad.Result.ClientObjectId;
                                                var requiredlayoutindex = -1;
                                                var requiredtabIndexId = -1;

                                                for (var i = 0; i < $scope.Layouts.length; i++) {

                                                    for (var j = 0; j < $scope.Layouts[i].TabList.length; j++) {
                                                        if ($scope.Layouts[i].TabList[j].ClientObjectId == deletedTabID) {
                                                            requiredlayoutindex = i;
                                                            requiredtabIndexId = j;
                                                        }
                                                    }

                                                   
                                                }
                                                if (requiredlayoutindex > -1 && requiredtabIndexId > -1) {
                                                    $scope.Layouts[requiredlayoutindex].TabList.splice(requiredtabIndexId, 1);
                                                   
                                                    if (requiredtabIndexId == $scope.selectedPageIndex && $scope.Layouts.length > 0) {
                                                        $scope.NewLayout = $scope.Layouts[requiredlayoutindex];
                                                        $scope.selectedPageIndex = 0;
                                                        $scope.selectedPageName = $scope.Layouts[requiredlayoutindex].TabList[0].TabName;
                                                    }
                                                    else if ($scope.NewLayout.TabList.length == 0)
                                                    {
                                                        $scope.NewLayout = $scope.Layouts[0];
                                                        $scope.selectedPageIndex = 0;
                                                        $scope.selectedPageName = $scope.NewLayout.TabList[0].TabName;
                                                    }
                                                }
                                               
                                                $("#loading").fadeOut("slow");
                                                toaster.pop('success', "Tab deleted Successfully.");
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
                                }

                                
                            })
                    }

                }
                $scope.SaveLayout = function (NewLayout) {

                    if ($scope.isLayoutSavingInProgress == false) {

                        $scope.isLayoutSavingInProgress = true;
                       
                        for (var i = 0; i < NewLayout.TabList.length; i++) {
                            var tab = NewLayout.TabList[i];
                            for (var j = 0; j < tab.TileList.length; j++) {
                                var tile = tab.TileList[j];
                                if (angular.equals({}, rulesetDataShareService.getTilelst()) == false) {
                                    //Getting saved edited Tile List from memory
                                    var EditTiles = JSON.parse(localStorage.getItem("Tilelst"));
                                    if (EditTiles != null) {
                                        for (var k = 0; k < EditTiles.length; k++) {
                                            var editTile = EditTiles[k];
                                            if (tile.EditClientId == editTile.EditClientId && tile.TileTypeName == editTile.TileTypeName) {
                                                tile.Value = editTile.Value;
                                                tile.Styles = editTile.Styles;

                                            }
                                            else if (angular.isUndefined(tile.TileId) == false && tile.TileId != null) {
                                                if (tile.TileId == editTile.TileId && tile.TileTypeName == editTile.TileTypeName) {
                                                    tile.Value = editTile.Value;
                                                    tile.Styles = editTile.Styles;
                                                }
                                            }
                                        }
                                    }
                                }
                                tile.TileLocationId = 1;
                            }
                        }
                        //Deleting Tile List from memory
                        localStorage.removeItem("Tilelst");
                        layoutService.update(NewLayout).then(function (data) {

                            $scope.isLayoutSavingInProgress = false

                            if (data.data.StatusCode == 200) {

                                var savedLayout = data.data.PayLoad;

                                for (var i = 0; i < $scope.Layouts.length; i++) {
                                    if ($scope.Layouts[i].LayoutId == savedLayout.LayoutId) {
                                        $scope.Layouts[i] = savedLayout;
                                    }
                                }

                                $scope.NewLayout = savedLayout;
                                $scope.state.tilesEditing = false;
                                toaster.pop('success', "Layout Updated Successfully.");

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
                }

                $scope.layoutRename = function (index, layout) {
                    var Scope = layout;
                    Scope.TabName = Scope.Name;
                    Scope.LayoutId = layout.LayoutId;
                    $scope.TabHeading = "Update Layout Name";
                    $scope.Buttontext = "Update";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: Scope, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );
                    dlg.result.then(function (res) {
                        res.Name = res.TabName;
                        layoutService.update(res).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                //$scope.Layouts[index] = layout;

                                var renamedLayoutID = data.data.PayLoad.ClientObjectId;
                                var requiredlayoutindex = -1;

                                for (var i = 0; i < $scope.Layouts.length; i++) {
                                    var layout = $scope.Layouts[i];
                                    if (layout.ClientObjectId == renamedLayoutID) {
                                        requiredlayoutindex = i;
                                    }
                                }


                                if (requiredlayoutindex > -1) {
                                    $scope.Layouts[requiredlayoutindex] = data.data.PayLoad;
                                    toaster.pop('success', "Layout Updated Successfully.");
                                }
                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                         toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }
                            }
                        });

                    })
                };

                $scope.layoutCopy = function (index, layout) {
                    var Scope = layout;
                    Scope.TabName = Scope.Name;
                    Scope.LayoutId = layout.LayoutId;
                    $scope.TabHeading = "Copy Layout Name";
                    $scope.Buttontext = "Copy";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: Scope, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );
                    dlg.result.then(function (name) {
                        name.Name = name.TabName;
                        name.LayoutId = 0;
                        if (name.TabList != null) {
                            for (var i = 0; i < name.TabList.length; i++) {
                                var data = name.TabList[i];
                                data.LayoutId = 0;
                                data.TabId = 0;
                                if (data.TileList != null) {
                                    for (var j = 0; j < data.TileList.length; j++) {
                                        var dataTile = data.TileList[j];
                                        dataTile.EntityId = 0;
                                        dataTile.TabId = 0;
                                        dataTile.TileId = 0;
                                        if (dataTile.Value.Attribute != null) {
                                            dataTile.Value.Attribute.AttributeId = 0;
                                        }
                                        else if (dataTile.Value.Command != null) {
                                            dataTile.Value.Command.CommandId = 0;
                                        }
                                        else if (dataTile.Value.Counter != null) {
                                            dataTile.Value.Counter.CounterId = 0;
                                        }
                                        else if (dataTile.Value.Execute != null) {
                                            dataTile.Value.Execute.ExecuteId = 0;
                                        }
                                        else if (dataTile.Value.Link != null) {
                                            dataTile.Value.Link.LinkId = 0;
                                        }
                                        else if (dataTile.Value.Note != null) {
                                            dataTile.Value.Note.NoteId = 0;
                                        }

                                    }
                                }


                            }
                        }


                        layoutService.copyLayout(name).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                $scope.NewLayout = data.data.PayLoad;

                                $scope.Layouts.push(data.data.PayLoad);
                                $scope.selectedLayoutName = $scope.NewLayout.Name;
                                $scope.onTabSelected($scope.NewLayout.TabList[0], 0);
                                //FillCharacterLayoutsInLeftSideMenu();
                                toaster.pop('success', "Layout Copied Successfully.");
                                $transition.router.stateService.go('profile.character.layout', { characterId: $scope.NewLayout.CharacterProfileId, layoutId: $scope.NewLayout.LayoutId });

                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                         toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }
                            }
                        });
                    });
                };

                $scope.layoutDelete = function (index, layout) {
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this view, "' + layout.Name + '", and all associated pages, tabs, and tiles?',
                        { size: 'sm' }
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == 'yes') {
                                layoutService.deleteLayout(layout).then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                        var deleteLayoutId = data.data.PayLoad.ClientObjectId;
                                        var requiredLayoutIndexId = -1;
                                        for (var i = 0; i < $scope.Layouts.length; i++) {
                                            if ($scope.Layouts[i].ClientObjectId == deleteLayoutId) {
                                                requiredLayoutIndexId = i;
                                            }
                                        }
                                        if (requiredLayoutIndexId > -1) {
                                            $scope.Layouts.splice(requiredLayoutIndexId, 1);
                                        }
                                        if ($scope.Layouts.length == 0) {
                                            $state.go("profile.characters");

                                        }
                                        else {

                                            $scope.selectedLayoutName = $scope.Layouts[0].Name;

                                            $scope.selectedPageName = $scope.Layouts[0].TabList[0].TabName;

                                        }
                                        //FillCharacterLayoutsInLeftSideMenu();
                                        toaster.pop('success', "Layout deletedSuccessfully.");

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

                        }
                    );
                };


                $scope.state = {
                    tilesEditing: false,
                    tileDragging: false,
                    useOrEditMode: false,
                    tileDeleteId: null
                };

                $scope.ManageTiles = function () {
                    $scope.state.tilesEditing = !$scope.state.tilesEditing;
                    $scope.state.useOrEditMode = !$scope.state.useOrEditMode;
                }

                $scope.ManageTilesCompleted = function () {
                    $scope.state.tilesEditing = !$scope.state.tilesEditing;
                    $scope.state.useOrEditMode = !$scope.state.useOrEditMode;
                }

                $scope.ShowTiles = function () {
                    var dlg = dialogs.create('/views/dialogs/tile-type-picker.html', 'dialogTileTypes',
                        { scope: $scope.NewLayout.LayoutMetaData.TileTypes }
                    );
                    dlg.result.then(function (res) {
                        if (res.TileType == "Note") {
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                            $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                            //$scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                            // $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                            var SelectedTab;
                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if (i == $scope.selectedPageIndex) {
                                    SelectedTab = $scope.NewLayout.TabList[i];
                                }
                            }
                            $scope.NewLayout.LayoutMetaData.Tile.TabId = angular.isUndefined(SelectedTab) == false ? SelectedTab.TabId : $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var dlg = dialogs.create('/views/dialogs/tile-editor-1.html', 'NoteTile',
                                { scope: $scope.NewLayout.LayoutMetaData.Tile, Tablist: $scope.NewLayout.TabList }
                            );
                            dlg.result.then(function (res) {
                                if (res != "cancel") {
                                    if ($scope.NewLayout.TabList[$scope.tabSet.index].TileList == null || $scope.NewLayout.TabList[$scope.tabSet.index].TileList == undefined) {
                                        $scope.NewLayout.TabList[$scope.tabSet.index].TileList = [];
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        //$scope.NewLayout.TabList[$scope.tabSet.index].TileList.push(res);
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                    else {
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        //$scope.NewLayout.TabList[$scope.tabSet.index].TileList.push(res);
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;

                                    }
                                }
                                $scope.ClientScopeChange = true;
                            });
                        }
                        else if (res.TileType == "Counter") {
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                            $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;

                            $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                            // $scope.NewLayout.LayoutMetaData.Tile.TabId = $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var SelectedTab;
                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if (i == $scope.selectedPageIndex) {
                                    SelectedTab = $scope.NewLayout.TabList[i];
                                }
                            }
                            $scope.NewLayout.LayoutMetaData.Tile.TabId = angular.isUndefined(SelectedTab) == false ? SelectedTab.TabId : $scope.NewLayout.TabList[$scope.tabSet.index].TabId;

                            var dlg = dialogs.create('/views/dialogs/tile-editor-2.html', 'NoteTile',
                                { scope: $scope.NewLayout.LayoutMetaData.Tile }
                            );
                            dlg.result.then(function (res) {

                                if (res != "cancel") {
                                    if ($scope.NewLayout.TabList[$scope.tabSet.index].TileList == null || $scope.NewLayout.TabList[$scope.tabSet.index].TileList == undefined) {
                                        $scope.NewLayout.TabList[$scope.tabSet.index].TileList = [];
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                    else {
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                }
                                $scope.ClientScopeChange = true;

                            });
                        }
                        else if (res.TileType == "Attribute") {
                            $scope.CorestatValues = rulesetDataShareService.getLayoutData();
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                            $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                            $scope.NewLayout.LayoutMetaData.Tile.Value.Attribute.CoreStatValue = res.Value.Attribute.CoreStatValue;
                            $scope.NewLayout.LayoutMetaData.Tile.CorestatValues = $scope.CorestatValues.CorestatValues;
                            $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                            //  $scope.NewLayout.LayoutMetaData.Tile.TabId = $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var SelectedTab;
                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if (i == $scope.selectedPageIndex) {
                                    SelectedTab = $scope.NewLayout.TabList[i];
                                }
                            }
                            $scope.NewLayout.LayoutMetaData.Tile.TabId = angular.isUndefined(SelectedTab) == false ? SelectedTab.TabId : $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var dlg = dialogs.create('/views/dialogs/tile-editor-3.html', 'NoteTile',
                                { scope: $scope.NewLayout.LayoutMetaData.Tile }
                            );
                            dlg.result.then(function (res) {

                                if (res != "cancel") {
                                    if ($scope.NewLayout.TabList[$scope.tabSet.index].TileList == null || $scope.NewLayout.TabList[$scope.tabSet.index].TileList == undefined) {
                                        $scope.NewLayout.TabList[$scope.tabSet.index].TileList = [];
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                    else {
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                }
                                $scope.ClientScopeChange = true;

                            });
                        }
                        else if (res.TileType == "Link") {
                           
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                            $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                            $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                            // $scope.NewLayout.LayoutMetaData.Tile.TabId = $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var SelectedTab;
                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if (i == $scope.selectedPageIndex) {
                                    SelectedTab = $scope.NewLayout.TabList[i];
                                }
                            }
                            $scope.NewLayout.LayoutMetaData.Tile.TabId = angular.isUndefined(SelectedTab) == false ? SelectedTab.TabId : $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var dlg = dialogs.create('/views/dialogs/tile-editor-4.html', 'NoteTile',
                                { scope: $scope.NewLayout.LayoutMetaData.Tile }
                            );
                            dlg.result.then(function (res) {

                                if (res != "cancel") {
                                    if ($scope.NewLayout.TabList[$scope.tabSet.index].TileList == null || $scope.NewLayout.TabList[$scope.tabSet.index].TileList == undefined) {
                                        $scope.NewLayout.TabList[$scope.tabSet.index].TileList = [];
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                    else {
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                }
                                $scope.ClientScopeChange = true;

                            });
                            //}

                            //});
                        }
                        else if (res.TileType == "Execute") {
                            
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                            $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;

                            $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                            // $scope.NewLayout.LayoutMetaData.Tile.TabId = $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var SelectedTab;
                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if (i == $scope.selectedPageIndex) {
                                    SelectedTab = $scope.NewLayout.TabList[i];
                                }
                            }
                            $scope.NewLayout.LayoutMetaData.Tile.TabId = angular.isUndefined(SelectedTab) == false ? SelectedTab.TabId : $scope.NewLayout.TabList[$scope.tabSet.index].TabId;

                            var dlg = dialogs.create('/views/dialogs/tile-editor-5.html', 'NoteTile',
                                { scope: $scope.NewLayout.LayoutMetaData.Tile, fullscope: $scope.NewLayout.TabList }
                            );
                            dlg.result.then(function (res) {
                                if (res != "cancel") {
                                    if ($scope.NewLayout.TabList[$scope.tabSet.index].TileList == null || $scope.NewLayout.TabList[$scope.tabSet.index].TileList == undefined) {
                                        $scope.NewLayout.TabList[$scope.tabSet.index].TileList = [];
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                    else {
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                }
                            })
                            //}
                            $scope.ClientScopeChange = true;

                            //});

                        }
                        else if (res.TileType == "Command") {
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                            $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;

                            $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                            // $scope.NewLayout.LayoutMetaData.Tile.TabId = $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var SelectedTab;
                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if (i == $scope.selectedPageIndex) {
                                    SelectedTab = $scope.NewLayout.TabList[i];
                                }
                            }
                            $scope.NewLayout.LayoutMetaData.Tile.TabId = angular.isUndefined(SelectedTab) == false ? SelectedTab.TabId : $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var dlg = dialogs.create('/views/dialogs/tile-editor-6.html', 'NoteTile',
                                { scope: $scope.NewLayout.LayoutMetaData.Tile }
                            );
                            dlg.result.then(function (res) {

                                if (res != "cancel") {
                                    if ($scope.NewLayout.TabList[$scope.tabSet.index].TileList == null || $scope.NewLayout.TabList[$scope.tabSet.index].TileList == undefined) {
                                        $scope.NewLayout.TabList[$scope.tabSet.index].TileList = [];
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                    else {
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                }

                                $scope.ClientScopeChange = true;

                            });
                        }
                        else if (res.TileType == "Image") {
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                            $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                            $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                            $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                            // $scope.NewLayout.LayoutMetaData.Tile.TabId = $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var SelectedTab;
                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if (i == $scope.selectedPageIndex) {
                                    SelectedTab = $scope.NewLayout.TabList[i];
                                }
                            }
                            $scope.NewLayout.LayoutMetaData.Tile.TabId = angular.isUndefined(SelectedTab) == false ? SelectedTab.TabId : $scope.NewLayout.TabList[$scope.tabSet.index].TabId;
                            var dlg = dialogs.create('/views/dialogs/tile-editor-7.html', 'NoteTile',
                                { scope: $scope.NewLayout.LayoutMetaData.Tile }
                            );
                            dlg.result.then(function (res) {
                                if (res != "cancel") {
                                    if ($scope.NewLayout.TabList[$scope.tabSet.index].TileList == null || $scope.NewLayout.TabList[$scope.tabSet.index].TileList == undefined) {
                                        $scope.NewLayout.TabList[$scope.tabSet.index].TileList = [];
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                    else {
                                        res.Height = "5";
                                        res.Width = "5";
                                        res.X = "0";
                                        res.Y = "0";
                                        res.CharacterProfileId = $scope.NewLayout.CharacterProfileId;
                                        res.ClientObjectId = $scope.initialClientObjectId + 1;
                                        res.IsSync = false;
                                        res.SyncDate = Date.now();
                                        $scope.NewLayout.TabList[$scope.selectedPageIndex > 0 ? $scope.selectedPageIndex : $scope.tabSet.index].TileList.push(res);
                                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                    }
                                }

                                $scope.ClientScopeChange = true;
                            });

                        }



                    });
                }
                $scope.state = {
                    tilesEditing: false,
                    tileDragging: false,
                    tileDeleteId: null
                };

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

                $scope.tabSet = {
                    api: {},
                    index: 0
                };

                $scope.tilePickerApi = {
                    messageId: null,
                    beforeSelect: function () {
                    },
                    onClose: function () {
                    }
                };

                var updateTabs = function () {
                    //$scope.navService.updateBody(true, $scope.NewLayout.TabList.length);
                    $scope.tabSet.api.doRecalculate();
                    $scope.tabSet.api.scrollTabIntoView();
                };

                var getActiveTab = function () {

                    if ($scope.tabSet.index >= 0)
                        return $scope.NewLayout.TabList[$scope.tabSet.index];
                    return null;
                };

                var tabsSort = function (arr) {
                    (arr || []).sort(function (a, b) { return a.order - b.order; });
                };

                var layoutRename = function () {

                    var Scope = $scope.NewLayout;
                    Scope.TabName = Scope.Name;
                    Scope.LayoutId = $scope.NewLayout.LayoutId;
                    $scope.TabHeading = "Update Layout Name";
                    $scope.Buttontext = "Update";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: Scope, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );
                    dlg.result.then(function (name) {

                        name.Name = name.TabName;
                        layoutService.update(name).then(function (data) {

                            if (data.data.StatusCode == 200) {

                                $scope.NewLayout.Name = name.Name;
                                //FillCharacterLayoutsInLeftSideMenu();
                                toaster.pop('success', "Layout Updated Successfully.");

                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                         toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }
                            }
                        });
                    });
                };

                var layoutDelete = function () {

                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this view, "' + $scope.NewLayout.Name + '", and all associated pages, tabs, and tiles?',
                        { size: 'sm' }
                    );

                    dlg.result.then(
                        function (btn) {

                            layoutService.deleteLayout($scope.NewLayout.LayoutId).then(function (data) {

                                if (data.data.StatusCode == 200) {

                                    //FillCharacterLayoutsInLeftSideMenu();
                                    $state.go("profile.characters");
                                    toaster.pop('success', "Layout deleted Successfully.");

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
                    );
                };

                var layoutCopy = function () {
                    var Scope = $scope.NewLayout;
                    Scope.TabName = Scope.Name;
                    Scope.LayoutId = $scope.NewLayout.LayoutId;
                    $scope.TabHeading = "Copy Layout Name";
                    $scope.Buttontext = "Copy";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: Scope, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );
                    dlg.result.then(function (name) {

                        name.Name = name.TabName;
                        name.LayoutId = 0;
                        for (var i = 0; i < name.TabList.length; i++) {
                            var data = name.TabList[i];
                            data.LayoutId = 0;
                            data.TabId = 0;
                            for (var j = 0; j < data.TileList.length; j++) {
                                var dataTile = data.TileList[j];
                                dataTile.EntityId = 0;
                                dataTile.TabId = 0;
                                dataTile.TileId = 0;
                                if (dataTile.Value.Attribute != null) {
                                    dataTile.Value.Attribute.AttributeId = 0;
                                }
                                else if (dataTile.Value.Command != null) {
                                    dataTile.Value.Command.CommandId = 0;
                                }
                                else if (dataTile.Value.Counter != null) {
                                    dataTile.Value.Counter.CounterId = 0;
                                }
                                else if (dataTile.Value.Execute != null) {
                                    dataTile.Value.Execute.ExecuteId = 0;
                                }
                                else if (dataTile.Value.Link != null) {
                                    dataTile.Value.Link.LinkId = 0;
                                }
                                else if (dataTile.Value.Note != null) {
                                    dataTile.Value.Note.NoteId = 0;
                                }

                            }

                        }

                        layoutService.copyLayout(name).then(function (data) {

                            if (data.data.StatusCode == 200) {

                                $scope.NewLayout = data.data.PayLoad;
                                //FillCharacterLayoutsInLeftSideMenu();
                                toaster.pop('success', "Layout Copied Successfully.");
                                $transition.router.stateService.go('profile.character.layout', { characterId: $scope.NewLayout.CharacterProfileId, layoutId: $scope.NewLayout.LayoutId });

                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                         toaster.pop("error", data.data.ErrorMessage);
                                    }
                                }
                            }
                        });
                    });
                };

                $scope.CopyTab = function (tab) {
                    $scope.TabHeading = "Copy Page";
                    $scope.Buttontext = "Copy";
                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { scope: tab, State: $scope.TabHeading, btntext: $scope.Buttontext }
                    );

                    dlg.result.then(function (res) {
                        res.ClientObjectId = $scope.initialClientObjectId;
                        res.IsSync = false;
                        res.SyncDate = Date.now();
                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;

                        res.TabId = 0;
                        var copytab = tabService.AddTab(res).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                data.data.PayLoad.IsSync = false;
                                data.data.PayLoad.SyncDate = Date.now();
                                $scope.NewLayout.TabList.push(data.data.PayLoad);
                                for (var i = 0; i < $scope.Layouts.length; i++) {
                                    if ($scope.Layouts[i].LayoutId == data.data.PayLoad.LayoutId) {
                                        $scope.Layouts[i].TabList.push(data.data.PayLoad);
                                    }
                                }

                                //$scope.NewLayout.TabList[$scope.tabSet.index] = data.data.PayLoad;
                                $scope.ClientScopeChange = true;
                            }
                        })
                    });
                };

                var tabReorder = function () {

                    var tab = getActiveTab(),
                        currentIdx = $scope.tabSet.index;

                    var dlg = dialogs.create('/views/dialogs/tab-reorder.html', 'dialogTabReorder',
                        {
                            items: $scope.NewLayout.TabList,
                            sorter: tabsSort
                        },
                        { size: 'sm', copy: false }
                    );

                    dlg.result.then(function (items) {

                        $timeout(function () {

                            items.forEach(function (item, idx) {
                                item.order = idx;
                                if (item === tab)
                                    currentIdx = idx;
                            });

                            tabsSort($scope.NewLayout.TabList);
                            $scope.tabSet.index = currentIdx;

                            updateTabs();

                        });
                    });
                }

                $scope.getTileClass = function (tile) {

                    var arr = [];

                    if ($scope.state.tilesEditing)
                        arr.push(tile.__randomShake);

                    if (tile.id === $scope.state.tileDeleteId)
                        arr.push('over-delete');

                    return arr.join(' ');
                };

                $scope.getAutoPosition = function (tile) {
                    var x = tile.id > 0 ? false : _autoPosition;
                    return x;
                };

                $scope.tileSelect = function (tile) {
                    if ($scope.tilePickerApi.selecting)
                        $scope.tilePickerApi.endSelect(tile);
                };

                $scope.tileEdit = function () {
                    $scope.tilePickerApi.beginSelect(function (tile) {

                    });
                }

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

                $scope.onDeleteDrop = function (event, ui) {
                    var requiredtabindex = -1;
                    var requiredtileIndexId = -1;
                    var tile = GridStackUI.Utils.getNodeData(ui.helper);
                    var clientobjectId = ui.helper[0].dataset.gsId;

                    $scope.Layout = $scope.NewLayout;
                    for (var i = 0; i < $scope.Layout.TabList.length; i++) {
                        var Tab = $scope.Layout.TabList[i];
                        var TabTiles = Tab.TileList;
                        for (var j = 0; j < TabTiles.length; j++) {
                            if (TabTiles[j].ClientObjectId == clientobjectId) {
                                requiredtabindex = i;
                                requiredtileIndexId = j;
                            }
                        }
                    }


                    if (requiredtabindex > -1 && requiredtileIndexId > -1) {
                        if ($scope.Layout.TabList[requiredtabindex].TileList[requiredtileIndexId].TileId == 0) {
                            $scope.Layout.TabList[requiredtabindex].TileList.splice(requiredtileIndexId, 1);
                            $scope.NewLayout = [];
                            $scope.NewLayout = $scope.Layout;
                            toaster.pop('success', "Tile deleted Successfully.");
                        }
                        else {
                            tileService.deleteTile($scope.Layout.TabList[requiredtabindex].TileList[requiredtileIndexId]).then(function (data) {
                                if (data.data.StatusCode == 200) {

                                    var deletedTileID = data.data.PayLoad.Result.TileId;
                                    var requiredtabindex = -1;
                                    var requiredtileIndexId = -1;

                                    for (var i = 0; i < $scope.Layout.TabList.length; i++) {
                                        var Tab = $scope.Layout.TabList[i];
                                        var TabTiles = Tab.TileList;
                                        for (var j = 0; j < TabTiles.length; j++) {
                                            if (TabTiles[j].TileId == deletedTileID) {
                                                requiredtabindex = i;
                                                requiredtileIndexId = j;
                                            }
                                        }
                                    }
                                    if (requiredtabindex > -1 && requiredtileIndexId > -1) {
                                        $scope.Layout.TabList[requiredtabindex].TileList.splice(requiredtileIndexId, 1);
                                    }
                                    $scope.NewLayout = [];
                                    $scope.NewLayout = $scope.Layout;
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
                        }
                    }
                };

                $scope.onDeleteOver = function (event, ui) {
                    var node = GridStackUI.Utils.getNodeData(ui.helper);
                    if (node) {
                        $timeout(function () {
                            $scope.state.tileDeleteId = node.id;
                        });
                    }
                };

                $scope.onDeleteOut = function (event) {
                    if ($scope.state.tileDeleteId) {
                        $timeout(function () {
                            $scope.state.tileDeleteId = null;
                        });
                    }
                };
                $scope.selectedPageIndex = 0;
                $scope.onTabSelected = function (tab, index) {
                    debugger;
                    $scope.selectedPageIndex = index;
                    $scope.selectedPageName = tab.TabName;
                };

                var layoutRender = function (pageIndex) {

                    $scope.state.tilesEditing = false;
                    var layoutId = $scope.NewLayout.LayoutId;
                    var layout = layoutService.loadLayout(layoutId);
                    layout.then(function (data) {

                        if (data.data.StatusCode == 200) {

                            $scope.Layout = data.data.PayLoad;
                            tabsSort($scope.Layout.tabs);

                            if ($scope.Layout.tabs.length) {

                                if (pageIndex || pageIndex === 0) {
                                    pageIndex = Math.clamp(0, $scope.Layout.tabs.length - 1);
                                }
                                else {
                                    pageIndex = 0;

                                    var pageId = $state.params.pageId;
                                    if (pageId) {
                                        pageIndex = $scope.Layout.tabs.findIndex(function (element, index) {
                                            return element.id === pageId;
                                        });
                                    }
                                }
                            }
                            else {
                                pageIndex = -1;
                            }

                            $scope.tabSet.index = pageIndex;
                            updateTabs();
                            //  rulesetDataShareService.setlayoutmetadata($scope.Layout);
                            // $transition.router.stateService.go('profile.character.layout', { characterId: $window.localStorage.getItem("CharacterProfileId"), layoutId: layoutId });
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                     toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        }
                    })

                };

                var layoutLoad = function (layoutId) {
                    $scope.state.tilesEditing = false;
                    var layout = layoutService.loadLayout(layoutId);


                    layout.then(function (data) {

                        if (data.data.StatusCode == 200) {
                            $scope.NewLayout = data.data.PayLoad;
                            $transition.router.stateService.go('profile.character.layout', { characterId: $scope.NewLayout.CharacterProfileId, layoutId: layoutId });
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                     toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        }
                    })
                };

               

                $scope.ToggleMenu = function (e) {
                    var actions = angular.element(e.target).find(".page-toolbar-wrapper-toggle-trigger .btn")
                    var button = actions;
                    var wrapper = ".page-toolbar-wrapper.initial";
                    var button_text = angular.element("#showAction").text();

                    if (angular.element(wrapper).hasClass("hide")) {
                        angular.element(wrapper).removeClass("hide");
                        angular.element(wrapper).addClass("show");
                    }
                    else {
                        angular.element(wrapper).removeClass("show");
                        angular.element(wrapper).addClass("hide");
                    }

                    angular.element(button).toggleClass("icon-arrow-down icon-arrow-up");
                    //wrapper.toggleClass("show");

                    if (button_text === "Show actions") {
                        angular.element("#showAction").text("Hide actions");

                    } else {
                        angular.element("#showAction").text("Show actions");
                    }

                };

                $scope.showContextMenu = function (e) {
                    var trigger = angular.element(e.target).parent();
                    //angular.element(e.target).parent(".dropdown-menu-item").find(".dropdown-menu-item-actions")
                    var actions = angular.element(e.target).parents(".dropdown-menu-item").find(".dropdown-menu-item-actions")

                    e.stopPropagation();

                    trigger.addClass("hide");
                    actions.addClass("show");

                    actions
                        .find("[data-action=close]")
                        .click(function (e) {
                            e.stopPropagation();
                            trigger.removeClass("hide");
                            actions.removeClass("show");
                        });



                };


              

                $scope.hideConteextMenu = function (c) {
                    var cardActionsHover = angular.element(c.target).parents(".dropdown-menu-item").find(".dropdown-menu-item-actions");
                    cardActionsHover.removeClass("show");
                    cardActionsHover.addClass("hide");
                };




            }
            else if ($state.params.action == 2) {

                if ($state.params.contentType == 1) {
                    $scope.ShowItems = true;
                    if (angular.equals({}, rulesetDataShareService.getLayoutItemInventoryData()) == false) {
                        $scope.NewItemInventory = rulesetDataShareService.getLayoutItemInventoryData();
                        $scope.CharacterInventoryMetaData = rulesetDataShareService.getLayoutItemInventoryMetaData();
                        if ($scope.NewItemInventory.CharacterItems.length == 0) {
                            $scope.ShowItems = true;
                            $scope.ShowItem = false;
                        }
                        else {
                            $scope.ShowItems = false;
                            $scope.ShowItem = true;
                        }
                    }
                    else {
                        var itemcontent = characterService.GetCharacterItemContent($state.params.characterId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.NewItemInventory = data.data.PayLoad;
                                rulesetDataShareService.setLayoutItemInventoryData($scope.NewItemInventory);
                                rulesetDataShareService.setLayoutItemInventoryMetaData($scope.NewItemInventory.CharacterInventoryMetaData);
                                if ($scope.NewItemInventory.CharacterItems.length == 0) {
                                    $scope.ShowItems = true;
                                    $scope.ShowItem = false;
                                }
                                else {
                                    $scope.ShowItems = false;
                                    $scope.ShowItem = true;
                                }

                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                     toaster.pop("error", data.data.ErrorMessage);
                                }
                            }

                        });
                    }
                }

                else if ($state.params.contentType == 2) {
                    $scope.ShowSpells = true;
                    if (angular.equals({}, rulesetDataShareService.getLayoutSpellInventoryData()) == false) {
                        $scope.NewSpellInventory = rulesetDataShareService.getLayoutSpellInventoryData();
                        $scope.CharacterInventoryMetaSpellData = rulesetDataShareService.getLayoutSpellInventoryMetaData();
                        if ($scope.NewSpellInventory.CharacterSpells.length == 0) {
                            $scope.ShowSpells = true;
                            $scope.ShowSpell = false;
                        }
                        else {
                            $scope.ShowSpells = false;
                            $scope.ShowSpell = true;
                        }
                    }
                    else {
                        var spellcontent = characterService.GetCharacterSpellContent($state.params.characterId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.NewSpellInventory = data.data.PayLoad;
                                rulesetDataShareService.setLayoutSpellInventoryData($scope.NewSpellInventory);
                                rulesetDataShareService.setLayoutSpellInventoryMetaData($scope.NewSpellInventory.CharacterInventoryMetaData);
                                if ($scope.NewSpellInventory.CharacterSpells.length == 0) {
                                    $scope.ShowSpells = true;
                                    $scope.ShowSpell = false;
                                }
                                else {
                                    $scope.ShowSpells = false;
                                    $scope.ShowSpell = true;
                                }

                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                     toaster.pop("error", data.data.ErrorMessage);
                                }
                            }

                        });
                    }
                }
                else if ($state.params.contentType == 3) {
                    $scope.ShowAbilities = true;
                    if (angular.equals({}, rulesetDataShareService.getLayoutAbilityInventoryData()) == false) {
                        $scope.NewAbilityInventory = rulesetDataShareService.getLayoutAbilityInventoryData();
                        $scope.CharacterInventoryAbilityMetaData = rulesetDataShareService.getLayoutAbilityInventoryMetaData();
                        if ($scope.NewAbilityInventory.CharacterAbilities.length == 0) {
                            $scope.ShowAbilities = true;
                            $scope.ShowAbility = false;
                        }
                        else {
                            $scope.ShowAbilities = false;
                            $scope.ShowAbility = true;
                        }
                    }
                    else {
                        var abilitycontent = characterService.GetCharacterAbilityContent($state.params.characterId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.NewAbilityInventory = data.data.PayLoad;
                                rulesetDataShareService.setLayoutAbilityInventoryData($scope.NewAbilityInventory);
                                rulesetDataShareService.setLayoutAbilityInventoryMetaData($scope.NewAbilityInventory.CharacterInventoryMetaData);
                                if ($scope.NewAbilityInventory.CharacterAbilities.length == 0) {
                                    $scope.ShowAbilities = true;
                                    $scope.ShowAbility = false;
                                }
                                else {
                                    $scope.ShowAbilities = false;
                                    $scope.ShowAbility = true;
                                }

                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                     toaster.pop("error", data.data.ErrorMessage);
                                }
                            }

                        });
                    }
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




                $scope.hideConteextMenu = function (c) {

                    var cardActionsHover = angular.element(c.target).parents(".card").find(".card-actions");
                    cardActionsHover.removeClass("show");
                    cardActionsHover.addClass("hide");
                };

                $scope.showContextMenu = function (e) {

                    var cardActionsHover = angular.element(e.target).parents(".card").find(".card-actions");

                    if (cardActionsHover.hasClass("hide")) {
                        cardActionsHover.removeClass("hide");
                        cardActionsHover.addClass("show");
                    }
                    else {
                        cardActionsHover.removeClass("show");
                        cardActionsHover.addClass("hide");
                    }

                };

            }
            else if ($state.params.action == 3) {
                if ($state.params.contentType == 1) {
                    if (angular.equals({}, rulesetDataShareService.getLayoutRulesetItemInventoryData()) == false) {
                        $scope.RulesetItems = rulesetDataShareService.getLayoutRulesetItemInventoryData();
                        if ($scope.RulesetItems.length == 0) {
                            $scope.ShowItems = true;
                            $scope.ShowItem = false;
                        }
                        else {
                            $scope.ShowItems = false;
                            $scope.ShowItem = true;
                        }
                    }
                    else {
                        var rulesetitemcontent = rulesetService.GetRuleSetItemsForItemInventory($state.params.characterId);
                        rulesetitemcontent.then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.RulesetItems = data.data.PayLoad.Items;
                                rulesetDataShareService.setLayoutRulesetItemInventoryData($scope.RulesetItems);
                                if ($scope.RulesetItems.length == 0) {
                                    $scope.ShowItems = true;
                                    $scope.ShowItem = false;
                                }
                                else {
                                    $scope.ShowItems = false;
                                    $scope.ShowItem = true;
                                }

                            }
                        });
                    }

                }
                else if ($state.params.contentType == 2) {
                    if (angular.equals({}, rulesetDataShareService.getLayoutRulesetSpellInventoryData()) == false) {
                        $scope.RulesetSpells = rulesetDataShareService.getLayoutRulesetSpellInventoryData();
                        if ($scope.RulesetSpells.length == 0) {
                            $scope.ShowSpells = true;
                            $scope.ShowSpell = false;
                        }
                        else {
                            $scope.ShowSpells = false;
                            $scope.ShowSpell = true;
                        }
                    }
                    else {
                        var rulesetspellcontent = rulesetService.GetRuleSetSpellsForSpellInventory($state.params.characterId);
                        rulesetspellcontent.then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.RulesetSpells = data.data.PayLoad.Spells;
                                rulesetDataShareService.setLayoutRulesetSpellInventoryData($scope.RulesetSpells);
                                if ($scope.RulesetSpells.length == 0) {
                                    $scope.ShowSpells = true;
                                    $scope.ShowSpell = false;
                                }
                                else {
                                    $scope.ShowSpells = false;
                                    $scope.ShowSpell = true;
                                }
                            }
                        });
                    }
                }
                else if ($state.params.contentType == 3) {
                    if (angular.equals({}, rulesetDataShareService.getLayoutRulesetAbilityInventoryData()) == false) {
                        $scope.RulesetAbilities = rulesetDataShareService.getLayoutRulesetAbilityInventoryData();
                        if ($scope.RulesetAbilities.length == 0) {
                            $scope.ShowAbilities = true;
                            $scope.ShowAbility = false;
                        }
                        else {
                            $scope.ShowAbilities = false;
                            $scope.ShowAbility = true;
                        }
                    }
                    else {
                        var rulesetabilitycontent = rulesetService.GetRuleSetAbilitiesForAbilityInventory($state.params.characterId);
                        rulesetabilitycontent.then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.RulesetAbilities = data.data.PayLoad.Abilities;
                                rulesetDataShareService.setLayoutRulesetAbilityInventoryData($scope.RulesetAbilities);
                                if ($scope.RulesetAbilities.length == 0) {
                                    $scope.ShowAbilities = true;
                                    $scope.ShowAbility = false;
                                }
                                else {
                                    $scope.ShowAbilities = false;
                                    $scope.ShowAbility = true;
                                }
                            }
                        });
                    }
                }

            }
            else if ($state.params.action == 4) {

                if ($state.params.contentType == 1) {
                    $scope.NewItemInventory = rulesetDataShareService.getLayoutItemInventoryData();
                    $scope.CharacterContent = $scope.NewItemInventory.CharacterItems[$state.params.index];
                    // Setting ClientObjectId For Tiles.
                    for (var i = 0; i < $scope.CharacterContent.CharacterItemsProperties.length; i++) {
                        var ItemPropertyLst = $scope.CharacterContent.CharacterItemsProperties[i];
                        if (ItemPropertyLst.CharacterItemId == 0 || ItemPropertyLst.CharacterItemId == undefined || ItemPropertyLst.CharacterItemId == "") {
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                            ItemPropertyLst.tile.ClientObjectId = $scope.initialClientObjectId;
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                        }
                    }

                    $scope.CharacterContent.Index = $state.params.index;
                }
                else if ($state.params.contentType == 2) {

                    $scope.NewSpellInventory = rulesetDataShareService.getLayoutSpellInventoryData();
                    $scope.CharacterContent = $scope.NewSpellInventory.CharacterSpells[$state.params.index];
                    // Setting ClientObjectId For Tiles.
                    for (var i = 0; i < $scope.CharacterContent.CharacterSpellsProperties.length; i++) {
                        var spellPropertyLst = $scope.CharacterContent.CharacterSpellsProperties[i];
                        if (spellPropertyLst.CharacterSpellId == 0 || spellPropertyLst.CharacterSpellId == undefined || spellPropertyLst.CharacterSpellId == "") {
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                            spellPropertyLst.tile.ClientObjectId = $scope.initialClientObjectId;
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                        }
                    }
                    $scope.CharacterContent.Index = $state.params.index;
                }
                else if ($state.params.contentType == 3) {

                    $scope.NewAbilityInventory = rulesetDataShareService.getLayoutAbilityInventoryData();
                    $scope.CharacterContent = $scope.NewAbilityInventory.CharacterAbilities[$state.params.index];
                    // Setting ClientObjectId For Tiles.
                    for (var i = 0; i < $scope.CharacterContent.CharacterAbilitiesProperties.length; i++) {
                        var abilityPropertyLst = $scope.CharacterContent.CharacterAbilitiesProperties[i];
                        if (abilityPropertyLst.CharacterAbilityId == 0 || abilityPropertyLst.CharacterAbilityId == undefined || abilityPropertyLst.CharacterAbilityId == "") {
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                            abilityPropertyLst.tile.ClientObjectId = $scope.initialClientObjectId;
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                        }
                    }
                    $scope.CharacterContent.Index = $state.params.index;
                }
            }
            

            function setClientObjectId(Layouts) {
                for (var k = 0; k < Layouts.length; k++) {

                    Layouts[k].ClientObjectId = $scope.initialClientObjectId;
                    $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                    for (var i = 0; i < Layouts[k].TabList.length; i++) {
                        Layouts[k].TabList[i].ClientObjectId = $scope.initialClientObjectId;
                        $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                        Layouts[k].TabList[i].IsSync = true;
                        Layouts[k].TabList[i].UpdateDate = Date.now();
                        for (var j = 0; j < Layouts[k].TabList[i].TileList.length; j++) {
                            Layouts[k].TabList[i].TileList[j].ClientObjectId = $scope.initialClientObjectId;
                            Layouts[k].TabList[i].TileList[j].IsSync = true;
                            Layouts[k].TabList[i].TileList[j].UpdateDate = Date.now();
                            $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                        }
                    }
                }
                return Layouts;
            }



            function saveLayoutwithTimer() {

                if ($scope.ClientScopeChange == true) {
                    for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                        if ($scope.NewLayout.TabList[i].IsSync == false) {
                            syncLayoutTabwithTimer($scope.NewLayout.TabList[i]);
                        }
                        for (var j = 0; j < $scope.NewLayout.TabList[i].TileList.length; j++) {
                            if ($scope.NewLayout.TabList[i].TileList[j].IsSync == false) {
                                syncLayoutTilewithTimer($scope.NewLayout.TabList[i].TileList[j]);
                            }
                        }
                    }
                }
                $scope.ClientScopeChange = false;
            }

            function syncLayoutTabwithTimer(tabObjectforUpdate) {


                if (tabObjectforUpdate.TabId == null || tabObjectforUpdate.TabId == "" || tabObjectforUpdate.TabId == 0) {
                    tabService.AddTab(tabObjectforUpdate).then(function (data) {

                        if (data.data.StatusCode == 200) {

                            var UpdatedTabObject = data.data.PayLoad;

                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if ($scope.NewLayout.TabList[i].ClientObjectId == UpdatedTabObject.ClientObjectId) {
                                    if ($scope.NewLayout.TabList[i].UpdateDate <= UpdatedTabObject.UpdateDate) {
                                        $scope.NewLayout.TabList[i] = UpdatedTabObject;
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    // toaster.pop("error", data.data.ErrorMessage);
                                    toaster.pop('error', "Problem in saving the data, please check your internet connection.");
                                }
                                $scope.ClientScopeChange = true;
                            }
                        }
                    });
                }
                else {
                    tabService.UpdateTab(tabObjectforUpdate).then(function (data) {

                        if (data.data.StatusCode == 200) {

                            var UpdatedTabObject = data.data.PayLoad;

                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                if ($scope.NewLayout.TabList[i].ClientObjectId == UpdatedTabObject.ClientObjectId) {
                                    if ($scope.NewLayout.TabList[i].UpdateDate <= UpdatedTabObject.UpdateDate) {
                                        $scope.NewLayout.TabList[i] = UpdatedTabObject;
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    // toaster.pop("error", data.data.ErrorMessage);
                                    toaster.pop('error', "Problem in saving the data, please check your internet connection.");
                                }
                                $scope.ClientScopeChange = true;
                            }
                        }
                    });
                }
            }

            function syncLayoutTilewithTimer(tileObjectforUpdate) {


                if (tileObjectforUpdate.TileId == null || tileObjectforUpdate.TileId == "" || tileObjectforUpdate.TileId == 0) {
                    tileService.AddTile(tileObjectforUpdate).then(function (data) {

                        if (data.data.StatusCode == 200) {

                            var UpdatedObject = data.data.PayLoad;

                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {

                                for (var j = 0; j < $scope.NewLayout.TabList[i].TileList.length; j++) {

                                    if ($scope.NewLayout.TabList[i].TileList[j].ClientObjectId == UpdatedObject.ClientObjectId) {
                                        if ($scope.NewLayout.TabList[i].TileList[j].UpdateDate <= UpdatedObject.UpdateDate) {
                                            $scope.NewLayout.TabList[i].TileList[j] = UpdatedObject;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    // toaster.pop("error", data.data.ErrorMessage);
                                    toaster.pop('error', "Problem in saving the data, please check your internet connection.");
                                }
                                $scope.ClientScopeChange = true;
                            }
                        }
                    });
                }
                else {
                    tileService.UpdateTile(tileObjectforUpdate).then(function (data) {

                        if (data.data.StatusCode == 200) {

                            var UpdatedTabObject = data.data.PayLoad;

                            for (var i = 0; i < $scope.NewLayout.TabList.length; i++) {
                                for (var j = 0; j < $scope.NewLayout.TabList[i].TileList.length; j++) {
                                    if ($scope.NewLayout.TabList[i].TileList[j].ClientObjectId == UpdatedObject.ClientObjectId) {
                                        if ($scope.NewLayout.TabList[i].TileList[j].UpdateDate <= UpdatedObject.UpdateDate) {
                                            $scope.NewLayout.TabList[i].TileList[j] = UpdatedObject;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    // toaster.pop("error", data.data.ErrorMessage);
                                    toaster.pop('error', "Problem in saving the data, please check your internet connection.");
                                }
                                $scope.ClientScopeChange = true;
                            }
                        }
                    });
                }
            }


            var _autoPosition = false;

            var _menuOptionView = {
                id: 'nav.layouts.open',
                name: 'Switch Layout',
                icon: 'fa-fw fa-random',
                menus: []
            };
            $scope.menuCharacter = {
                opened: false,
                menus: navService.getCommonCharacterNav([]),
                menuClick: function (item) {
                    $scope.menuCharacter.opened = false;
                }
            };

            navService.registerNav('character', $scope.menuCharacter);



            function SearchDialogCtrl(dep1, dep2) {

                $scope.cancel = function () {
                    $scope.modalInstance.close(); // the same instance that was created in element.on('click',...)
                }

                // you can call it from the template:  search.dialog.tpl.html
                $scope.someFunction = function () { }

                // it can bind to it in the search.dialog.tpl.html
                $scope.someProperty;

                // this will be two-way bound with some property from the parent field (look below)
                // if you want to perform some action on it just use $scope.$watch
                $scope.searchDialog;
            }


            $scope.ShowDice = function () {

                var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                    { "mode": 3, scope: $scope.NewLayout.CharacterProfileId }
                );
                dlg.result.then(function (res, result) {

                })
            }

            $scope.AddCorestatvalues = function () {
                $scope.characters = [];
                if (angular.equals({}, rulesetDataShareService.getLayoutData()) == false) {
                    $scope.characters = rulesetDataShareService.getLayoutData();
                    //$scope.characters = rulesetDataShareService.getcorestatvalue();
                    if ($scope.characters == null) {
                        toaster.pop('error', "No CoreStat Available.");
                    }
                    $scope.characters.CorestatValuesHeading = "Add CoreStat Values";
                    $scope.characters.CorestatValuesIcon = "fa fa-floppy-o";
                    $scope.characters.CorestatValuesBtnText = "Save";
                    if ($scope.characters.CorestatValues != null && angular.isUndefined($scope.characters.CorestatValues) == false) {
                        for (var i = 0; i < $scope.characters.CorestatValues.length; i++) {
                            var result = $scope.characters.CorestatValues[i];
                            
                        }
                    }
                }
                else {
                    toaster.pop('error', "No CoreStat Available.");
                }
                // $scope.characters = rulesetDataShareService.getcorestatvalue();

                var dlg = dialogs.create('/views/dialogs/addcorestatvalues.html', 'dialogAddCorestatValues',
                    { scope: $scope.characters }

                );

                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        res.Id = res.CharacterProfileId;
                        var values = characterService.AddCorestatValues(res);
                        values.then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.characters = rulesetDataShareService.getLayoutData();
                                $scope.characters.CorestatValues = [];
                                for (var i = 0; i < data.data.PayLoad.CorestatValues.length; i++) {
                                    $scope.characters.CorestatValues.push(data.data.PayLoad.CorestatValues[i]);
                                }
                                rulesetDataShareService.setcorestatvalue($scope.characters);
                                toaster.pop('success', "CoreStat Values are Updated Successfully.");
                                $("#loading").fadeOut("slow");
                            }
                            else {
                                if (data.data.StatusCode == 400) {
                                    if (data.data.ShowToUser == true) {
                                         toaster.pop("error", data.data.ErrorMessage);
                                    }
                                    $("#loading").fadeOut("slow");
                                }
                            }

                        })
                    }
                });
            }

            $scope.ShowTilesforInventory = function (item) {
                $scope.NewLayout = rulesetDataShareService.getLayoutData();
                var dlg = dialogs.create('/views/dialogs/tile-type-picker.html', 'dialogTileTypes',
                    { scope: $scope.NewLayout.LayoutMetaData.TileTypes }
                );
                dlg.result.then(function (res) {
                    if (res.TileType == "Note") {
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                        $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                        //$scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                        $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                        $scope.NewLayout.LayoutMetaData.Tile.TabId = 0;
                        var dlg = dialogs.create('/views/dialogs/tile-editor-1.html', 'NoteTile',
                            { scope: $scope.NewLayout.LayoutMetaData.Tile, Tablist: $scope.NewLayout.TabList }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {
                               
                                res.Height = "5";
                                res.Width = "5";
                                res.X = "0";
                                res.Y = "0";
                                res.ClientObjectId = $scope.initialClientObjectId + 1;
                                res.IsSync = false;
                                res.SyncDate = Date.now();
                                //$scope.NewLayout.TabList[$scope.tabSet.index].TileList.push(res);
                                var tile = { "tile": res };
                                item.push(tile);
                                $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                //}
                            }
                            $scope.ClientScopeChange = true;
                        });
                    }
                    else if (res.TileType == "Counter") {
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                        $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;

                        $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                        $scope.NewLayout.LayoutMetaData.Tile.TabId = 0;


                        var dlg = dialogs.create('/views/dialogs/tile-editor-2.html', 'NoteTile',
                            { scope: $scope.NewLayout.LayoutMetaData.Tile }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {
                               
                                res.Height = "5";
                                res.Width = "5";
                                res.X = "0";
                                res.Y = "0";
                                res.ClientObjectId = $scope.initialClientObjectId + 1;
                                res.IsSync = false;
                                res.SyncDate = Date.now();
                                //$scope.NewLayout.TabList[$scope.tabSet.index].TileList.push(res);
                                var tile = { "tile": res };
                                item.push(tile);
                                $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                            }
                            //}
                            $scope.ClientScopeChange = true;

                        });
                    }
                    else if (res.TileType == "Attribute") {
                        $scope.Attributecorestats = rulesetDataShareService.getLayoutData();
                        $scope.CorestatValues = $scope.Attributecorestats.CorestatValues;
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                        $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                        $scope.NewLayout.LayoutMetaData.Tile.Value.Attribute.CoreStatValue = res.Value.Attribute.CoreStatValue;
                        $scope.NewLayout.LayoutMetaData.Tile.CorestatValues = angular.isDefined($scope.CorestatValues.CorestatValues)
                            == true ? $scope.CorestatValues.CorestatValues :
                            $scope.CorestatValues;
                        $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                        $scope.NewLayout.LayoutMetaData.Tile.TabId = 0;

                        var dlg = dialogs.create('/views/dialogs/tile-editor-3.html', 'NoteTile',
                            { scope: $scope.NewLayout.LayoutMetaData.Tile }
                        );
                        dlg.result.then(function (res) {

                            if (res != "cancel") {
                             
                                res.Height = "5";
                                res.Width = "5";
                                res.X = "0";
                                res.Y = "0";
                                res.ClientObjectId = $scope.initialClientObjectId + 1;
                                res.IsSync = false;
                                res.SyncDate = Date.now();
                                //$scope.NewLayout.TabList[$scope.tabSet.index].TileList.push(res);
                                var tile = { "tile": res };
                                item.push(tile);
                                $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                //}
                            }
                            $scope.ClientScopeChange = true;

                        });
                    }
                    else if (res.TileType == "Link") {
                       
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                        $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                        //$scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                        $scope.NewLayout.LayoutMetaData.Tile.TabId = 0;

                        var dlg = dialogs.create('/views/dialogs/tile-editor-4.html', 'NoteTile',
                            { scope: $scope.NewLayout.LayoutMetaData.Tile }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {
                              
                                res.Height = "5";
                                res.Width = "5";
                                res.X = "0";
                                res.Y = "0";
                                res.ClientObjectId = $scope.initialClientObjectId + 1;
                                res.IsSync = false;
                                res.SyncDate = Date.now();
                               
                                var tile = { "tile": res };
                                item.push(tile);
                                $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                $scope.LinkExecuteTileContent = rulesetDataShareService.getLinkTileData();
                               
                            }
                            $scope.ClientScopeChange = true;

                        });
                       
                    }
                    else if (res.TileType == "Execute") {
                      es;

                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                        $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;

                        //$scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                        $scope.NewLayout.LayoutMetaData.Tile.TabId = 0;


                        var dlg = dialogs.create('/views/dialogs/tile-editor-5.html', 'NoteTile',
                            { scope: $scope.NewLayout.LayoutMetaData.Tile, fullscope: $scope.NewLayout.TabList }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {
                             
                                res.Height = "5";
                                res.Width = "5";
                                res.X = "0";
                                res.Y = "0";
                                res.ClientObjectId = $scope.initialClientObjectId + 1;
                                res.IsSync = false;
                                res.SyncDate = Date.now();
                                //$scope.NewLayout.TabList[$scope.tabSet.index].TileList.push(res);
                                var tile = { "tile": res };
                                item.push(tile);
                                $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                                $scope.LinkExecuteTileContent = rulesetDataShareService.getLinkTileData();
                                
                            }
                        })
                      
                        $scope.ClientScopeChange = true;

                       

                    }
                    else if (res.TileType == "Command") {
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                        $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;

                        $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                        $scope.NewLayout.LayoutMetaData.Tile.TabId = 0;

                        var dlg = dialogs.create('/views/dialogs/tile-editor-6.html', 'NoteTile',
                            { scope: $scope.NewLayout.LayoutMetaData.Tile }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {
                              
                                res.Height = "5";
                                res.Width = "5";
                                res.X = "0";
                                res.Y = "0";
                                res.ClientObjectId = $scope.initialClientObjectId + 1;
                                res.IsSync = false;
                                res.SyncDate = Date.now();
                                //$scope.NewLayout.TabList[$scope.tabSet.index].TileList.push(res);
                                var tile = { "tile": res };
                                item.push(tile);
                                $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                               
                            }

                            $scope.ClientScopeChange = true;

                        });
                    }
                    else if (res.TileType == "Image") {
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeId = res.TileId;
                        $scope.NewLayout.LayoutMetaData.Tile.TileTypeName = res.TileType;
                        $scope.NewLayout.LayoutMetaData.Tile.Value = res.Value;
                        $scope.NewLayout.LayoutMetaData.Tile.Mode = "Edit";
                        $scope.NewLayout.LayoutMetaData.Tile.TabId = 0;
                        var dlg = dialogs.create('/views/dialogs/tile-editor-7.html', 'NoteTile',
                            { scope: $scope.NewLayout.LayoutMetaData.Tile }
                        );
                        dlg.result.then(function (res) {
                            if (res != "cancel") {
                              
                                res.Height = "5";
                                res.Width = "5";
                                res.X = "0";
                                res.Y = "0";
                                res.ClientObjectId = $scope.initialClientObjectId + 1;
                                res.IsSync = false;
                                res.SyncDate = Date.now();
                                //$scope.NewLayout.TabList[$scope.tabSet.index].TileList.push(res);
                                var tile = { "tile": res };
                                item.push(tile);
                                $scope.initialClientObjectId = $scope.initialClientObjectId + 1;
                             
                            }

                            $scope.ClientScopeChange = true;
                        });

                    }



                });
            }
            $scope.SaveInventoryTiles = function (tilecontent, Num) {
                //$scope.NewLayout = rulesetDataShareService.getLayoutData();

                if (Num == 1) {
                    $scope.CharacterInventoryMetaData = rulesetDataShareService.getLayoutItemInventoryMetaData();
                    $scope.CharacterInventoryMetaData.CharacterItems.CharacterItemId = tilecontent.CharacterItemId;
                    $scope.CharacterInventoryMetaData.CharacterItems.CharacterProfileId = tilecontent.CharacterProfileId;
                    $scope.CharacterInventoryMetaData.CharacterItems.CharacterItemsProperties = tilecontent.CharacterItemsProperties;
                    $scope.CharacterInventoryMetaData.CharacterItems.AssociatedSpells = tilecontent.AssociatedSpells;
                    $scope.CharacterInventoryMetaData.CharacterItems.AssociatedAbilities = tilecontent.AssociatedAbilities;
                    var InventoryItems = [];
                    InventoryItems.push($scope.CharacterInventoryMetaData.CharacterItems);
                    var items = characterService.CreateItemInventorytile(InventoryItems).then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.CharacterContent = data.data.PayLoad.CharacterItems[0];
                            toaster.pop('success', "Tile Added Successfully");
                        }
                    });
                }
                else if (Num == 2) {
                    $scope.CharacterInventoryMetaSpellData = rulesetDataShareService.getLayoutSpellInventoryMetaData();
                    $scope.CharacterInventoryMetaSpellData.CharacterSpells.CharacterSpellId = tilecontent.CharacterSpellId;
                    $scope.CharacterInventoryMetaSpellData.CharacterSpells.CharacterProfileId = tilecontent.CharacterProfileId;
                    $scope.CharacterInventoryMetaSpellData.CharacterSpells.CharacterSpellsProperties = tilecontent.CharacterSpellsProperties;
                    var InventorySpells = [];
                    InventorySpells.push($scope.CharacterInventoryMetaSpellData.CharacterSpells);
                    var items = characterService.CreateSpellInventorytile(InventorySpells).then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.CharacterContent = data.data.PayLoad.CharacterSpells[0];
                            toaster.pop('success', "Tile Added Successfully");
                        }
                    });
                }
                else if (Num == 3) {
                    $scope.CharacterInventoryAbilityMetaData = rulesetDataShareService.getLayoutAbilityInventoryMetaData();
                    $scope.CharacterInventoryAbilityMetaData.CharacterAbilities.CharacterAbilityId = tilecontent.CharacterAbilityId;
                    $scope.CharacterInventoryAbilityMetaData.CharacterAbilities.CharacterProfileId = tilecontent.CharacterProfileId;
                    $scope.CharacterInventoryAbilityMetaData.CharacterAbilities.CharacterAbilitiesProperties = tilecontent.CharacterAbilitiesProperties;
                    var InventoryAbilities = [];
                    InventoryAbilities.push($scope.CharacterInventoryAbilityMetaData.CharacterAbilities);
                    var items = characterService.CreateAbilityInventorytile(InventoryAbilities).then(function (data) {
                        if (data.data.StatusCode == 200) {
                            $scope.CharacterContent = data.data.PayLoad.CharacterAbilities[0];
                            toaster.pop('success', "Tile Added Successfully");
                        }
                    });
                }
            }
            $scope.ItemInventory = function () {
                  rulesetDataShareService.setInventory($scope.NewInventory);
                $transition.router.stateService.go('profile.ItemInventory', { characterId: $state.params.characterId, action: 2, isNew: 1, contentType: 1 });
                

            }
            $scope.BackToLayout = function () {
                $("#loading").css("display", "block");
                $state.go('profile.character.layout', { characterId: $state.params.characterId, action: 1, isNew: 1 });
                $("#loading").fadeOut("slow");
            }
            $scope.onloadFun = function () {
                $("#loading").fadeOut("slow");
            }
            $scope.ImportRuleSetCharecterleavel = function () {
                var dlg = dialogs.create('/views/dialogs/rulesetimport.html', 'dialogImportRulesetinCharecter',
                    { characterProfileId: $scope.NewLayout.CharacterProfileId }
                    //{ ruleSetId: $scope.NewRuleSet.Id }
                );

                dlg.result.then(function (res) {
                    if (res != 'cancel') {

                    }
                });
            }



            $scope.SpellInventory = function () {
                
                $transition.router.stateService.go('profile.SpellInventory', { characterId: $state.params.characterId, action: 2, contentType: 2 });
            }

            $scope.AbilityInventory = function () {
                
                $transition.router.stateService.go('profile.AbilityInventory', { characterId: $state.params.characterId, action: 2, contentType: 3 });
			}

			$scope.widgets = [{ x: 0, y: 0, width: 100, height: 100 }, { x: 0, y: 0, width: 3, height: 100 }];
			$scope.options = {
				cellHeight: 200,
				verticalMargin: 10
			};
			$scope.addWidget = function () {
				var newWidget = { x: 0, y: 0, width: 1, height: 1 };
				$scope.widgets.push(newWidget);
			};
			$scope.moveWidget = function () {
				$scope.widgets[0].x = 1;
				$scope.widgets[0].width = 2;
				$scope.widgets[0].height = 2;
			};
			$scope.removeWidget = function (w) {
				var index = $scope.widgets.indexOf(w);
				$scope.widgets.splice(index, 1);
			};
			$scope.onChange = function (event, items) {
				$log.log("onChange event: " + event + " items:" + items);
			};
			$scope.onDragStart = function (event, ui) {
				$log.log("onDragStart event: " + event + " ui:" + ui);
			};
			$scope.onDragStop = function (event, ui) {
				$log.log("onDragStop event: " + event + " ui:" + ui);
			};
			$scope.onResizeStart = function (event, ui) {
				$log.log("onResizeStart event: " + event + " ui:" + ui);
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

			$scope.AddRulesetItems = function () {
				var rulesetitemcontent = rulesetService.GetRuleSetItemsForItemInventory($state.params.characterId);
				rulesetitemcontent.then(function (data) {
					if (data.data.StatusCode == 200) {
						console.log("StatusCode 200: ", data.data.PayLoad.Items);
						$scope.RulesetItems = data.data.PayLoad.Items;
						var rulesets = data.data.PayLoad;
						var dlg = dialogs.create('/views/dialogs/AssociateRulesetItems.html', 'dialogAssociatedRulesetItems',
							{ scope: $scope.RulesetItems }
						);

						dlg.result.then(function (res) {
							console.log("res: "+res);
							$scope.rulesets = res;
							$scope.SaveRulesetItem();
						});
						//rulesetDataShareService.setLayoutRulesetItemInventoryData($scope.RulesetItems);

					}
					else if (data.data.StatusCode == 400) {
						console.log("!!!StatusCode 400: ", data);
						if (data.data.ShowToUser == true) {
							toaster.pop('error', data.data.ErrorMessage);
						}
					}
				});
			}

			$scope.AddRulesetSpell = function () {
				var rulesetitemcontent = rulesetService.GetRuleSetSpellsForSpellInventory($state.params.characterId);
				rulesetitemcontent.then(function (data) {
					if (data.data.StatusCode == 200) {
						console.log("StatusCode 200: ", data);
						$scope.RulesetSpells = data.data.PayLoad.Spells;
						var rulesets = data.data.PayLoad;
						var dlg = dialogs.create('/views/dialogs/AssociateRulesetSpells.html', 'dialogAssociatedRulesetSpells',
							{ scope: $scope.RulesetSpells }
						);

						dlg.result.then(function (res) {
							$scope.spells = res;
							$scope.SaveRulesetSpell();
						});
						//rulesetDataShareService.setLayoutRulesetItemInventoryData($scope.RulesetItems);

					}
					else if (data.data.StatusCode == 400) {
						console.log("!!!StatusCode 400: ", data);
						if (data.data.ShowToUser == true) {
							toaster.pop('error', data.data.ErrorMessage);
						}
					}
				});
			}

			$scope.AddRulesetAbility = function () {
				var rulesetitemcontent = rulesetService.GetRuleSetAbilitiesForAbilityInventory($state.params.characterId);
				rulesetitemcontent.then(function (data) {
					if (data.data.StatusCode == 200) {
						console.log("StatusCode 200: ", data);
						$scope.RulesetAbilities = data.data.PayLoad.Abilities;
						var rulesets = data.data.PayLoad;
						var dlg = dialogs.create('/views/dialogs/AssociateRulesetAbilities.html', 'dialogAssociatedRulesetAbilities',
							{ scope: $scope.RulesetAbilities }
						);

						dlg.result.then(function (res) {
							$scope.abilities = res;
							$scope.SaveRulesetAbility();
						});
						//rulesetDataShareService.setLayoutRulesetItemInventoryData($scope.RulesetItems);

					}
					else if (data.data.StatusCode == 400) {
						console.log("!!!StatusCode 400: ", data);
						if (data.data.ShowToUser == true) {
							toaster.pop('error', data.data.ErrorMessage);
						}
					}
				});
			}


			//$scope.AddRulesetSpells = function () {
   //             $transition.router.stateService.go("profile.CharacterRulesetSpells", { characterId: $state.params.characterId, action: 3, isNew: 1, contentType: 2 });

   //         }
            //$scope.AddRulesetAbilities = function () {
            //    $transition.router.stateService.go("profile.CharacterRulesetAbilities", { characterId: $state.params.characterId, action: 3, isNew: 1, contentType: 3 });

            //}
            $scope.CreateCharacterItem = function () {
                $scope.CharacterInventoryMetaData = rulesetDataShareService.getLayoutItemInventoryMetaData();
                $scope.NewLayout = rulesetDataShareService.getLayoutData();
                $scope.buttontext = "Create";
                $scope.tabName = "Create Item";
                $scope.IsButtonDisabled = false;
                $scope.isBtnShow = false;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCreateInventoryItem',
                    { scope: $scope.CharacterInventoryMetaData.CharacterItems.CharacterItemsProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, NewInventory: $scope.CharacterInventoryMetaData, CharacterId: $scope.NewLayout.CharacterProfileId }
                );

                dlg.result.then(function (res) {


                 

                    if (res != "cancel") {
                        //var CharacterItemsProperties = { "CharacterItemsProperties": res };
                        $scope.NewItemInventory.CharacterItems.push(res);
                        if ($scope.NewItemInventory.CharacterItems.length == 0) {
                            $scope.ShowItems = true;
                            $scope.ShowItem = false;
                        }
                        else {
                            $scope.ShowItems = false;
                            $scope.ShowItem = true;
                        }
                        $state.go('profile.ItemInventory');
                        //rulesetDataShareService.set($scope.NewRuleSet.Items);
                        //$scope.isitemsadded = true;
                    }
                });
            }
            $scope.CreateCharacterSpell = function () {
                debugger;
                $scope.CharacterInventoryMetaData = rulesetDataShareService.getLayoutSpellInventoryMetaData();
                $scope.NewLayout = rulesetDataShareService.getLayoutData();
                $scope.buttontext = "Create";
                $scope.tabName = "Create Spell";
                $scope.IsButtonDisabled = false;
                $scope.isBtnShow = false;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCreateInventorySpell',
                    { scope: $scope.CharacterInventoryMetaData.CharacterSpells.CharacterSpellsProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, NewInventory: $scope.CharacterInventoryMetaData, CharacterId: $scope.NewLayout.CharacterProfileId }
                );

                dlg.result.then(function (res) {


                    if (res != "cancel") {
                        //var CharacterSpellsProperties = { "CharacterSpellsProperties": res };
                        $scope.NewSpellInventory.CharacterSpells.push(res);
                        if ($scope.NewSpellInventory.CharacterSpells.length == 0) {
                            $scope.ShowSpells = true;
                            $scope.ShowSpell = false;
                        }
                        else {
                            $scope.ShowSpells = false;
                            $scope.ShowSpell = true;
                        }
                        $state.go('profile.SpellInventory');
                       
                    }
                });

            }
            $scope.CreateCharacterAbility = function () {
                $scope.CharacterInventoryMetaData = rulesetDataShareService.getLayoutAbilityInventoryMetaData();
                $scope.NewLayout = rulesetDataShareService.getLayoutData();
                $scope.buttontext = "Create";
                $scope.tabName = "Create Ability";
                $scope.IsButtonDisabled = false;
                $scope.isBtnShow = false;
                var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogCreateInventoryAbility',
                    { scope: $scope.CharacterInventoryMetaData.CharacterAbilities.CharacterAbilitiesProperties, tabName: $scope.tabName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, NewInventory: $scope.CharacterInventoryMetaData, CharacterId: $scope.NewLayout.CharacterProfileId }
                );

                dlg.result.then(function (res) {



                    if (res != "cancel") {
                        //var CharacterAbilitiesProperties = { "CharacterAbilitiesProperties": res };
                        $scope.NewAbilityInventory.CharacterAbilities.push(res);
                        if ($scope.NewAbilityInventory.CharacterAbilities.length == 0) {
                            $scope.ShowAbilities = true;
                            $scope.ShowAbility = false;
                        }
                        else {
                            $scope.ShowAbilities = false;
                            $scope.ShowAbility = true;
                        }
                        $state.go('profile.AbilityInventory');
                        //rulesetDataShareService.set($scope.NewRuleSet.Items);
                        //$scope.isitemsadded = true;
                    }
                });

            }
            var SelectedItems = [];
            var SelectedSpells = [];
            var SelectedAbilities = [];
            $scope.addName = function (item, Num) {
                if (Num == 1) {
                    var idx = SelectedItems.indexOf(item);
                    if (SelectedItems.indexOf(item) == -1) {
                        console.log('Pushing: ', item)
                        SelectedItems.push(item);
                        //selectedNames.push(id);
                    } else {
                        SelectedItems.splice(idx, 1);
                        console.log(SelectedItems);
                    }

                }
                else if (Num == 2) {
                    var idx = SelectedSpells.indexOf(item);
                    if (SelectedSpells.indexOf(item) == -1) {
                        console.log('Pushing: ', item)
                        SelectedSpells.push(item);
                        //selectedNames.push(id);
                    } else {
                        SelectedSpells.splice(idx, 1);
                        console.log(SelectedSpells);
                    }
                }
                else if (Num == 3) {
                    var idx = SelectedAbilities.indexOf(item);
                    if (SelectedAbilities.indexOf(item) == -1) {
                        console.log('Pushing: ', item)
                        SelectedAbilities.push(item);
                        //selectedNames.push(id);
                    } else {
                        SelectedAbilities.splice(idx, 1);
                        console.log(SelectedAbilities);
                    }
                }

            };
            $scope.checkSelected = function (item, Num) {
                if (Num == 1) {
                    var idx = SelectedItems.indexOf(item);
                    return idx > -1;
                }
                else if (Num == 2) {
                    var idx = SelectedSpells.indexOf(item);
                    return idx > -1;
                }
                else if (Num == 3) {
                    var idx = SelectedAbilities.indexOf(item);
                    return idx > -1;
                }

            }
            $scope.BackInventory = function () {
                //$("#loading").css("display", "block");
                $transition.router.stateService.go('profile.character.layout', { characterId: $state.params.characterId, action: 1 });
            }
            $scope.BackItem = function () {
                $transition.router.stateService.go('profile.ItemInventory', { characterId: $state.params.characterId, 'action': '2', isNew: 0, contentType: 1 });
            }
            $scope.BackSpell = function () {
                $transition.router.stateService.go('profile.SpellInventory', { characterId: $state.params.characterId, action: 2, contentType: 2 });
            }
            $scope.BackAbility = function () {
                $transition.router.stateService.go('profile.AbilityInventory', { characterId: $state.params.characterId, action: 2, contentType: 3 });
            }
            $scope.BackItemProperties = function () {
                $transition.router.stateService.go('profile.ItemInventory', { characterId: $state.params.characterId, action: 2, contentType: 1 });
            }
            $scope.BackSpellProperties = function () {
                $transition.router.stateService.go('profile.SpellInventory', { characterId: $state.params.characterId, action: 2, contentType: 2 });
            }
            $scope.BackAbilityProperties = function () {
                $transition.router.stateService.go('profile.AbilityInventory', { characterId: $state.params.characterId, action: 2, contentType: 3 });
            }
            $scope.SaveRulesetItem = function () {
                $scope.NewLayout = rulesetDataShareService.getLayoutData();
                $scope.NewItemInventory = rulesetDataShareService.getLayoutItemInventoryData();
				var RulesetItems = [];
				SelectedItems = $scope.rulesets;
                if (SelectedItems.length > 0) {
                    for (var i = 0; i < SelectedItems.length; i++) {
                        var CharacterItemsProperties = { "CharacterItemId": 0, "CharacterProfileId": $scope.NewLayout.CharacterProfileId, "CharacterItemsProperties": SelectedItems[i].ItemProperties };
                    }
                    var InventoryItems = [];
                    InventoryItems.push(CharacterItemsProperties);
                    var items = characterService.CreateCharacterInventoryItems(InventoryItems).then(function (data) {
                        if (data.data.StatusCode == 200) {
                            if (data.data.PayLoad.length != 0) {
                                for (var i = 0; i < data.data.PayLoad.length; i++) {
                                    $scope.NewItemInventory.CharacterItems.push(data.data.PayLoad[i]);
                                }
                            }
                            $transition.router.stateService.go('profile.ItemInventory', { characterId: $state.params.characterId, 'action': '2', isNew: 0, contentType: 1 });
                        }
                        else if (data.data.ErrorMessage == 400) {
                            alert($scope.data.ErrorMessage)
                        }
                    })
                }
                else {
                    $transition.router.stateService.go('profile.ItemInventory', { characterId: $state.params.characterId, 'action': '2', isNew: 0, contentType: 1 });
                }

            }
			$scope.SaveRulesetSpell = function () {
				console.log("SaveRulesetSpell: ",$scope.spells);
                $scope.NewLayout = rulesetDataShareService.getLayoutData();
				$scope.NewSpellInventory = rulesetDataShareService.getLayoutSpellInventoryData();
				SelectedSpells = $scope.spells;
                if (SelectedSpells.length > 0) {
                    for (var i = 0; i < SelectedSpells.length; i++) {
                        var CharacterSpellsProperties = { "CharacterSpellId": 0, "CharacterProfileId": $scope.NewLayout.CharacterProfileId, "CharacterSpellsProperties": SelectedSpells[i].SpellProperties };
                    }
                    var InventorySpells = [];
                    InventorySpells.push(CharacterSpellsProperties);
                    var spells = characterService.CreateCharacterInventorySpells(InventorySpells).then(function (data) {
                        if (data.data.StatusCode == 200) {
                            if (data.data.PayLoad.length != 0) {
                                for (var i = 0; i < data.data.PayLoad.length; i++) {
                                    $scope.NewSpellInventory.CharacterSpells.push(data.data.PayLoad[i]);
                                }
                            }
                            $transition.router.stateService.go('profile.SpellInventory', { characterId: $state.params.characterId, action: 2, contentType: 2 });
                        }
                        else if (data.data.ErrorMessage == 400) {
                            alert($scope.data.ErrorMessage)
                        }
                    })
                }
                else {
                    $transition.router.stateService.go('profile.SpellInventory', { characterId: $state.params.characterId, action: 2, contentType: 2 });
                }

            }
			$scope.SaveRulesetAbility = function () {
				console.log("SaveRulesetAbility: ",$scope.abilities);
                $scope.NewLayout = rulesetDataShareService.getLayoutData();
				$scope.NewAbilityInventory = rulesetDataShareService.getLayoutAbilityInventoryData();
				SelectedAbilities = $scope.abilities;
                if (SelectedAbilities.length > 0) {
                    for (var i = 0; i < SelectedAbilities.length; i++) {
                        var CharacterAbilitiesProperties = { "CharacterAbilityId": 0, "CharacterProfileId": $scope.NewLayout.CharacterProfileId, "CharacterAbilitiesProperties": SelectedAbilities[i].AbilityProperties };
                    }
                    var InventoryAbility = [];
                    InventoryAbility.push(CharacterAbilitiesProperties);
                    var abilities = characterService.CreateCharacterInventoryAbility(InventoryAbility).then(function (data) {
                        if (data.data.StatusCode == 200) {
                            if (data.data.PayLoad.length != 0) {
                                for (var i = 0; i < data.data.PayLoad.length; i++) {
                                    $scope.NewAbilityInventory.CharacterAbilities.push(data.data.PayLoad[i]);
                                }
							}
							console.log("$scope.NewAbilityInventory: ", $scope.NewAbilityInventory);
                            $transition.router.stateService.go('profile.AbilityInventory', { characterId: $state.params.characterId, action: 2, contentType: 3 });
                        }
                        else if (data.data.ErrorMessage == 400) {
                            alert(data.data.ErrorMessage)
                        }
                    })
                }
                else {
                    $transition.router.stateService.go('profile.AbilityInventory', { characterId: $state.params.characterId, action: 2, contentType: 3 });
                }

            }
            //For Editing Inventory Items
            $scope.EditItem = function (item, count, num) {
                debugger;
                if (num == 1) {
                    $scope.pageName = "Editing Item";
                    $scope.buttontext = "Update";
                    $scope.IsButtonDisabled = true;
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Edit";
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterItemsProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Fullscope: item, AssocSpells: item.AssociatedSpells, AssocAbilities: item.AssociatedAbilities, OperationTypeMode: $scope.OperationTypeMode, CharacterId: item.CharacterProfileId}

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterItemsProperties = { "CharacterItemsProperties": res };
                            $scope.NewItemInventory.CharacterItems[count] = res;
                           
                        }
                    });
                }
                else if (num == 2) {
                    $scope.pageName = "Editing Spell";
                    $scope.buttontext = "Update";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Edit";
                    //var indexcount = count - 1;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterSpellsProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullSpellscope: item, OperationTypeMode: $scope.OperationTypeMode}

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterSpellsProperties = { "CharacterSpellsProperties": res };
                            $scope.NewSpellInventory.CharacterSpells[count] = res;
                          
                        }
                    });
                }
                else if (num == 3) {
                    $scope.pageName = "Editing Ability";
                    $scope.buttontext = "Update";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Edit";
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterAbilitiesProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullAbilityScope: item, OperationTypeMode: $scope.OperationTypeMode }

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterAbilitiesProperties = { "CharacterAbilitiesProperties": res };
                            $scope.NewAbilityInventory.CharacterAbilities[count] = res;
                          
                        }

                    });
                }


            };
            $scope.CopyItem = function (item, index, num) {

                debugger;
                if (num == 1) {
                    $scope.NewItemInventory = rulesetDataShareService.getLayoutItemInventoryData();
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    $scope.pageName = "Copying Item";
                    $scope.buttontext = "Copy";
                    $scope.IsButtonDisabled = true;
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Copy";
                    $scope.SelectAssociatedSpells = true;
                    $scope.SelectAssociatedAbilities = true;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterItemsProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Fullscope: item, AssocSpells: item.AssociatedSpells, AssocAbilities: item.AssociatedAbilities, OperationTypeMode: $scope.OperationTypeMode, SelectAssociatedSpells: $scope.SelectAssociatedSpells, SelectAssociatedAbilities: $scope.SelectAssociatedAbilities }

                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterItemsProperties = { "CharacterItemsProperties": res };
                            $scope.NewItemInventory.CharacterItems.push(res);
                        }
                    });
                }
                else if (num == 2) {
                    $scope.NewSpellInventory = rulesetDataShareService.getLayoutSpellInventoryData();
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    $scope.pageName = "Copying Spell";
                    $scope.buttontext = "Copy";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Copy";
                    $scope.SelectAssociatedSpells = true;
                    $scope.SelectAssociatedAbilities = true;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterSpellsProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullSpellscope: item, SelectAssociatedSpells: $scope.SelectAssociatedSpells, SelectAssociatedAbilities: $scope.SelectAssociatedAbilities, OperationTypeMode: $scope.OperationTypeMode}

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterSpellsProperties = { "CharacterSpellsProperties": res };
                            $scope.NewSpellInventory.CharacterSpells.push(res);

                        }

                    });
                }
                else if (num == 3) {
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    $scope.NewAbilityInventory = rulesetDataShareService.getLayoutAbilityInventoryData();
                    $scope.pageName = "Copying Ability";
                    $scope.buttontext = "Copy";
                    $scope.isBtnShow = true;
                    $scope.OperationTypeMode = "Copy";
                    $scope.SelectAssociatedSpells = true;
                    $scope.SelectAssociatedAbilities = true;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterAbilitiesProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullAbilityScope: item, SelectAssociatedSpells: $scope.SelectAssociatedSpells, SelectAssociatedAbilities: $scope.SelectAssociatedAbilities, OperationTypeMode: $scope.OperationTypeMode}

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterAbilitiesProperties = { "CharacterAbilitiesProperties": res };
                            $scope.NewAbilityInventory.CharacterAbilities.push(res);
                        }


                    });
                }

            };
            $scope.Removeitem = function (item, index, Num) {
                if (Num == 1) {
                    $scope.NewItemInventory = rulesetDataShareService.getLayoutItemInventoryData();
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Item, "' + item.CharacterItemsProperties[0].Value.Text.value + '", and all associated pages, tabs, and tiles?',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                var deleteitem = characterService.DeleteCharacterContent(item.CharacterItemsProperties[0].CharacterItemId).then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                      
                                        $scope.NewItemInventory.CharacterItems.splice(index, 1);
                                     
                                    }

                                    //$uibModalInstance.close($scope.Properties);
                                })
                            }

                        })

                }
                else if (Num == 2) {
                    $scope.NewSpellInventory = rulesetDataShareService.getLayoutSpellInventoryData();
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Spell, "' + item.CharacterSpellsProperties[0].Value.Text.value + '",?',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                var deleteitem = characterService.DeleteCharacterSpellContent(item.CharacterSpellsProperties[0].CharacterSpellId).then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                      
                                        $scope.NewSpellInventory.CharacterSpells.splice(index, 1);
                                       
                                    }

                                    //$uibModalInstance.close($scope.Properties);
                                })
                            }

                        })
                }
                else if (Num == 3) {
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    $scope.NewAbilityInventory = rulesetDataShareService.getLayoutAbilityInventoryData();
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Ability, "' + item.CharacterAbilitiesProperties[0].Value.Text.value + '",?',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                var deleteability = characterService.DeleteCharacterAbilityContent(item.CharacterAbilitiesProperties[0].CharacterAbilityId).then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                     

                                        $scope.NewAbilityInventory.CharacterAbilities.splice(index, 1);
                                       
                                    }

                                    //$uibModalInstance.close($scope.Properties);
                                })
                            }

                        })
                }

                //$uibModalInstance.close($scope.Properties);
            }
            $scope.ShowAllItemProperties = function (item, count) {
               
                $state.go("profile.CharacterItemsDetails", { characterId: $state.params.characterId, action: 4, contentType: 1, index: count });
            }
            $scope.ShowAllSpellProperties = function (item, count) {
               
                $state.go("profile.CharacterSpellDetails", { characterId: $state.params.characterId, action: 4, contentType: 2, index: count });
            }
            $scope.ShowAllAbilityProperties = function (item, count) {
                //$scope.ItemProperties = item.CharacterItemsProperties;
                rulesetDataShareService.setItemProperties(item);
                $state.go("profile.CharacterAbilityDetails", { characterId: $state.params.characterId, action: 4, contentType: 3, index: count });
            }
            //For Editing Inventory Itemzproperties
            $scope.EditItems = function (item, num) {
                if (num == 1) {
                    $scope.pageName = "Editing Item";
                    $scope.buttontext = "Update";
                    $scope.IsButtonDisabled = true;
                    $scope.isBtnShow = true;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterItemsProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Fullscope: item }

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterItemsProperties = { "CharacterItemsProperties": res };
                            $scope.NewItemInventory.CharacterItems[item.Index] = res
                           
                            $transition.router.stateService.go('profile.ItemInventory', { characterId: $state.params.characterId, action: 2, contentType: 1 });
                        }
                    });
                }
                else if (num == 2) {
                    $scope.pageName = "Editing Spell";
                    $scope.buttontext = "Update";
                    $scope.isBtnShow = true;
                    //var indexcount = count - 1;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterSpellsProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullSpellscope: item }

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterSpellsProperties = { "CharacterSpellsProperties": res };
                            $scope.NewSpellInventory.CharacterSpells[item.Index] = res;
                            $transition.router.stateService.go('profile.SpellInventory', { characterId: $state.params.characterId, action: 2, contentType: 2 });
                          
                        }
                    });
                }
                else if (num == 3) {
                    $scope.pageName = "Editing Ability";
                    $scope.buttontext = "Update";
                    $scope.isBtnShow = true;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterAbilitiesProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullAbilityScope: item }

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterAbilitiesProperties = { "CharacterAbilitiesProperties": res };
                            $scope.NewAbilityInventory.CharacterAbilities[item.Index] = res;
                            $transition.router.stateService.go('profile.AbilityInventory', { characterId: $state.params.characterId, action: 2, contentType: 3 });
                           
                        }

                    });
                }


            };
            $scope.Removeitems = function (item, Num) {
                if (Num == 1) {
                    $scope.NewItemInventory = rulesetDataShareService.getLayoutItemInventoryData();
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Item, "' + item.CharacterItemsProperties[0].Value.Text.value + '", and all associated pages, tabs, and tiles?',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                var deleteitem = characterService.DeleteCharacterContent(item.CharacterItemsProperties[0].CharacterItemId).then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                       
                                        $scope.NewItemInventory.CharacterItems.splice(item.Index, 1);
                                        $transition.router.stateService.go('profile.ItemInventory', { characterId: $state.params.characterId, action: 2, contentType: 1 });
                                    }


                                })
                            }

                        })

                }
                else if (Num == 2) {
                    $scope.NewSpellInventory = rulesetDataShareService.getLayoutSpellInventoryData();
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Spell, "' + item.CharacterSpellsProperties[0].Value.Text.value + '",?',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                var deleteitem = characterService.DeleteCharacterSpellContent(item.CharacterSpellsProperties[0].CharacterSpellId).then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                     
                                        $scope.NewSpellInventory.CharacterSpells.splice(item.Index, 1);
                                        $transition.router.stateService.go('profile.SpellInventory', { characterId: $state.params.characterId, action: 2, contentType: 2 });

                                    }


                                })
                            }

                        })
                }
                else if (Num == 3) {
                   
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    $scope.NewAbilityInventory = rulesetDataShareService.getLayoutAbilityInventoryData();
                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete this Ability, "' + item.CharacterAbilitiesProperties[0].Value.Text.value + '",?',
                        {}
                    );

                    dlg.result.then(
                        function (res) {
                            if (res == "yes") {
                                var deleteitem = characterService.DeleteCharacterAbilityContent(item.CharacterAbilitiesProperties[0].CharacterAbilityId).then(function (data) {
                                    if (data.data.StatusCode == 200) {
                                       
                                        $scope.NewAbilityInventory.CharacterAbilities.splice(item.Index, 1);
                                        $transition.router.stateService.go('profile.AbilityInventory', { characterId: $state.params.characterId, action: 2, contentType: 3 });
                                       
                                       
                                    }

                                    //$uibModalInstance.close($scope.Properties);
                                })
                            }

                        })
                }

                //$uibModalInstance.close($scope.Properties);
            }
            $scope.CopyItems = function (item, num) {
                if (num == 1) {
                    $scope.NewItemInventory = rulesetDataShareService.getLayoutItemInventoryData();
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    $scope.pageName = "Copying Item";
                    $scope.buttontext = "Copy";
                    $scope.IsButtonDisabled = true;
                    $scope.isBtnShow = true;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterItemsProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnDisabled: $scope.IsButtonDisabled, IsBtnShow: $scope.isBtnShow, Fullscope: item }

                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterItemsProperties = { "CharacterItemsProperties": res };
                            $scope.NewItemInventory.CharacterItems.push(res);
                            $transition.router.stateService.go('profile.ItemInventory', { characterId: $state.params.characterId, action: 2, contentType: 1 });
                        }
                    });
                }
                else if (num == 2) {
                    $scope.NewSpellInventory = rulesetDataShareService.getLayoutSpellInventoryData();
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    $scope.pageName = "Copying Spell";
                    $scope.buttontext = "Copy";
                    $scope.isBtnShow = true;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterSpellsProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullSpellscope: item }

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterSpellsProperties = { "CharacterSpellsProperties": res };
                            $scope.NewSpellInventory.CharacterSpells.push(res);
                            $transition.router.stateService.go('profile.SpellInventory', { characterId: $state.params.characterId, action: 2, contentType: 2 });
                        }

                    });
                }
                else if (num == 3) {
                    $scope.NewLayout = rulesetDataShareService.getLayoutData();
                    $scope.NewAbilityInventory = rulesetDataShareService.getLayoutAbilityInventoryData();
                    $scope.pageName = "Copying Ability";
                    $scope.buttontext = "Copy";
                    $scope.isBtnShow = true;
                    var dlg = dialogs.create('/views/dialogs/createitems.html', 'dialogEditCharacterItem',
                        { scope: item.CharacterAbilitiesProperties, tabName: $scope.pageName, btntext: $scope.buttontext, IsBtnShow: $scope.isBtnShow, FullAbilityScope: item }

                    );

                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //var CharacterAbilitiesProperties = { "CharacterAbilitiesProperties": res };
                            $scope.NewAbilityInventory.CharacterAbilities.push(res);
                            $transition.router.stateService.go('profile.AbilityInventory', { characterId: $state.params.characterId, action: 2, contentType: 3 });
                        }


                    });
                }

            };
            $scope.onloadFun = function ()
            {
                $("#loading").fadeOut("slow");
            }
            $scope.getTileClass = function (tile) {

                var arr = [];

                if ($scope.state.tilesEditing)
                    arr.push(tile.__randomShake);

                if (tile.id === $scope.state.tileDeleteId)
                    arr.push('over-delete');

                return arr.join(' ');
            };
            $scope.getTileClass = function (tile) {

                var arr = [];

                if ($scope.state.tilesEditing)
                    arr.push(tile.__randomShake);

                if (tile.id === $scope.state.tileDeleteId)
                    arr.push('over-delete');

                return arr.join(' ');
            };
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
            $scope.onDeleteDropCharacterTiles = function (event, ui) {
                var tile = GridStackUI.Utils.getNodeData(ui.helper);
                var ClientObjectTileId = ui.helper[0].dataset.gsId;

                var deletedTileIndex = -1;
                if ($scope.CharacterContent.CharacterItemsProperties != undefined && $scope.CharacterContent.CharacterItemsProperties != null && $scope.CharacterContent.CharacterItemsProperties != "") {
                    for (var i = 0; i < $scope.CharacterContent.CharacterItemsProperties.length; i++) {
                        var ItemPropertyLst = $scope.CharacterContent.CharacterItemsProperties[i];
                        if (ItemPropertyLst.CharacterItemId == 0 || ItemPropertyLst.CharacterItemId == undefined || ItemPropertyLst.CharacterItemId == "") {
                            if (ClientObjectTileId == $scope.CharacterContent.CharacterItemsProperties[i].tile.ClientObjectId) {
                                deletedTileIndex = i;
                            }
                        }
                    }

                    if ($scope.CharacterContent.CharacterItemsProperties[deletedTileIndex].tile.TileId == 0) {
                        $scope.CharacterContent.CharacterItemsProperties.splice(deletedTileIndex, 1);
                        toaster.pop('success', "Tile deleted Successfully.");
                    }
                    else {
                        tileService.deleteTile($scope.CharacterContent.CharacterItemsProperties[deletedTileIndex].tile).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.CharacterContent.CharacterItemsProperties.splice(deletedTileIndex, 1);
                                toaster.pop('success', "Tile deleted Successfully.");
                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                     toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        });
                    }
                }

                else if ($scope.CharacterContent.CharacterSpellsProperties != undefined && $scope.CharacterContent.CharacterSpellsProperties != null && $scope.CharacterContent.CharacterSpellsProperties != "") {
                    for (var i = 0; i < $scope.CharacterContent.CharacterSpellsProperties.length; i++) {
                        var spellPropertyLst = $scope.CharacterContent.CharacterSpellsProperties[i];
                        if (spellPropertyLst.CharacterSpellId == 0 || spellPropertyLst.CharacterSpellId == undefined || spellPropertyLst.CharacterSpellId == "") {
                            if (ClientObjectTileId == $scope.CharacterContent.CharacterSpellsProperties[i].tile.ClientObjectId) {
                                deletedTileIndex = i;
                            }
                        }
                    }

                    if ($scope.CharacterContent.CharacterSpellsProperties[deletedTileIndex].tile.TileId == 0) {
                        $scope.CharacterContent.CharacterSpellsProperties.splice(deletedTileIndex, 1);
                        toaster.pop('success', "Tile deleted Successfully.");
                    }
                    else {
                        tileService.deleteTile($scope.CharacterContent.CharacterSpellsProperties[deletedTileIndex].tile).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.CharacterContent.CharacterSpellsProperties.splice(deletedTileIndex, 1);
                                toaster.pop('success', "Tile deleted Successfully.");
                            }
                            else if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                     toaster.pop("error", data.data.ErrorMessage);
                                }
                            }
                        });
                    }
                }
                else if ($scope.CharacterContent.CharacterAbilitiesProperties != undefined && $scope.CharacterContent.CharacterAbilitiesProperties != null && $scope.CharacterContent.CharacterAbilitiesProperties != "") {
                    for (var i = 0; i < $scope.CharacterContent.CharacterAbilitiesProperties.length; i++) {
                        var abilityPropertyLst = $scope.CharacterContent.CharacterAbilitiesProperties[i];
                        if (abilityPropertyLst.CharacterAbilityId == 0 || abilityPropertyLst.CharacterAbilityId == undefined || abilityPropertyLst.CharacterAbilityId == "") {
                            if (ClientObjectTileId == $scope.CharacterContent.CharacterAbilitiesProperties[i].tile.ClientObjectId) {
                                deletedTileIndex = i;
                            }
                        }
                    }

                    if ($scope.CharacterContent.CharacterAbilitiesProperties[deletedTileIndex].tile.TileId == 0) {
                        $scope.CharacterContent.CharacterAbilitiesProperties.splice(deletedTileIndex, 1);
                        toaster.pop('success', "Tile deleted Successfully.");
                    }
                    else {
                        tileService.deleteTile($scope.CharacterContent.CharacterAbilitiesProperties[deletedTileIndex].tile).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                $scope.CharacterContent.CharacterAbilitiesProperties.splice(deletedTileIndex, 1);
                                toaster.pop('success', "Tile deleted Successfully.");
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
            $scope.onDeleteOverCharacterItem = function (event, ui) {
                var node = GridStackUI.Utils.getNodeData(ui.helper);
                if (node) {
                    $timeout(function () {
                        $scope.state.tileDeleteId = node.id;
                    });
                }
            };

            $scope.onDeleteOutCharacterItem = function (event) {
                if ($scope.state.tileDeleteId) {
                    $timeout(function () {
                        $scope.state.tileDeleteId = null;
                    });
                }
            };
            $scope.tileEdit = function () {
                $scope.tilePickerApi.beginSelect(function (tile) {

                });
            }
            function InventoryMetaData() {
                var metadata = characterService.GetNewCharacterInventory().then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.NewInventory = data.data.PayLoad;
                        rulesetDataShareService.setInventory($scope.NewInventory);
                    }
                    else if (data.data.StatusCode == 400) {
                        alert(data.data.ErrorMessage)
                    }
                })
            }

        }
    ]);

})();