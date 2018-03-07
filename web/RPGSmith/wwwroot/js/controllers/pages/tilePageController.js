(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('tilePageController', ['$scope', '$q', '$state', '$timeout', '$log', 'dialogs', 'navService', 'rulesetDataShareService', 'layoutService', 'tabService','tileService',
        function ($scope, $q, $state, $timeout, $log, dialogs, navService, rulesetDataShareService, layoutService, tabService, tileService) {

            $scope.navService = navService;
            //$scope.dataService = dataService;
            debugger;
            $scope.NewLayout = rulesetDataShareService.getlayoutmetadata();
            GetAllTabs();
          
               
            
            function GetAllTabs() {
                debugger;
                tabService.GetTabs($scope.NewLayout[0].LayoutId).then(function (data) {
                    if (data.data.StatusCode == 200) {
                        $scope.LayoutTabs = data.data.PayLoad
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
           
            var _autoPosition = false;

            var _menuOptionView = {
                id: 'nav.layouts.open',
                name: 'Switch Layout',
                icon: 'fa-fw fa-random',
                menus: []
            };

            $scope.menuHamburger = {
                opened: false,
                menus: navService.getCommonHamburger([
                    {
                        name: 'Layouts',
                        header: true,
                        icon: 'fa-fw'
                    },
                    _menuOptionView,
                    {
                        id: 'view.new',
                        name: 'New Layout',
                        action: function () {
                            layoutAdd();
                        },
                        icon: 'fa-fw fa-file-o',
                    },
                    {
                        id: 'view.rename',
                        name: 'Rename Layout',
                        action: function () {
                            layoutRename();
                        },
                        icon: 'fa-fw fa-i-cursor'
                    },
                    {
                        id: 'view.delete',
                        name: 'Delete Layout',
                        action: function () {
                            layoutDelete();
                        },
                        icon: 'fa-fw fa-trash-o',
                    },
                    {
                        id: 'view.copy',
                        name: 'Copy Layout',
                        action: function () {
                            layoutCopy();
                        },
                        icon: 'fa-fw fa-files-o'
                    },
                    {
                        name: 'Tiles',
                        header: true,
                        icon: 'fa-fw'
                    },
                    {
                        id: 'tiles.edit',
                        name: 'Edit Tiles',
                        action: function () {
                            $scope.state.tilesEditing = !$scope.state.tilesEditing;
                        },
                        icon: 'fa-fw fa-pencil-square-o',
                    },
                    {
                        name: 'Pages',
                        header: true,
                        icon: 'fa-fw'
                    },
                    {
                        id: 'tab.new',
                        name: 'New Page',
                        action: function () {
                            tabAdd();
                        },
                        icon: 'fa-fw fa-file-o',
                    },
                    {
                        id: 'tab.rename',
                        name: 'Rename Page',
                        action: function () {
                            tabRename();
                        },
                        icon: 'fa-fw fa-i-cursor'
                    },
                    {
                        id: 'tab.delete',
                        name: 'Delete Page',
                        action: function () {
                            tabDelete();
                        },
                        icon: 'fa-fw fa-trash-o',
                    },
                    {
                        id: 'tab.copy',
                        name: 'Copy Page',
                        action: function () {
                            tabCopy();
                        },
                        icon: 'fa-fw fa-files-o'
                    },
                    {
                        id: 'tab.reorder',
                        name: 'Reorder Pages',
                        action: function () {
                            tabReorder();
                        },
                        icon: 'fa-fw fa-sort'
                    }
                ]),
                menuClick: function (item) {
                    $scope.menuHamburger.opened = false;
                }
            };

            $scope.menuCharacter = {
                opened: false,
                menus: navService.getCommonCharacterNav([]),
                menuClick: function (item) {
                    $scope.menuCharacter.opened = false;
                }
            };

            navService.registerNav('hamburger', $scope.menuHamburger);
            navService.registerNav('character', $scope.menuCharacter);

            $scope.state = {
                tilesEditing: false,
                tileDragging: false,
                tileDeleteId: null
            };

            $scope.stackOptions = {
                height: 0,
                width: 100,
                cellHeight: 30,
                minWidth: 1,
                // The width, plus padding.
                pixelWidth: 35,
                verticalMargin: 5,
                alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                //alwaysShowResizeHandle: true,
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
                index: -1
            };

            //$scope.LayoutTabs =
            //    [
            //    {
            //        "name": "Main1",
            //        "tiles": [{
            //            "id": "2",
            //            "x": "12",
            //            "y": "8",
            //            "width": "4",
            //            "height": "4",
            //            "minWidth": "2",
            //            "minHeight": "2",
            //            "typeId": "2"
            //        }]
            //    },
            //    {
            //        "name": "Main2",
            //        "tiles": [{
            //            "id": "1",
            //            "x": "4",
            //            "y": "0",
            //            "width": "11",
            //            "height": "4",
            //            "minWidth": "5",
            //            "minHeight": "2",
            //            "typeId": "1"
            //        }]
            //    },
            //    {
            //        "name": "Main3",
            //        "tiles": [{
            //            "id": "3",
            //            "x": "8",
            //            "y": "8",
            //            "width": "8",
            //            "height": "0",
            //            "minWidth": "4",
            //            "minHeight": "0",
            //            "typeId":"3"
            //        }]
            //    },
            //    {
            //        "name": "Main4",
            //        "tiles": [{
            //            "id": "4",
            //            "x": "4",
            //            "y": "8",
            //            "width": "4",
            //            "height": "0",
            //            "minWidth": "2",
            //            "minHeight": "0",
            //            "typeId": "4"
            //        }]
            //    }]
            //{
            //    name: "+",
            //    action: function () {
            //        tabAdd();
            //    }
            //        //"tiles": [{
            //        //    "id": "4",
            //        //    "x": "4",
            //        //    "y": "8",
            //        //    "width": "4",
            //        //    "height": "0",
            //        //    "minWidth": "2",
            //        //    "minHeight": "0",
            //        //    "typeId": ""
            //        //}]
            //}]

            $scope.tilePickerApi = {
                messageId: null,
                beforeSelect: function () {
                },
                onClose: function () {
                }
            };

            var updateTabs = function () {
                $scope.navService.updateBody(true, $scope.LayoutTabs.length);
                $scope.tabSet.api.doRecalculate();
                $scope.tabSet.api.scrollTabIntoView();
            };

            var getActiveTab = function () {
                if ($scope.tabSet.index >= 0)
                    return LayoutTabs[$scope.tabSet.index];
                return null;
            };

            var tabsSort = function (arr) {
                (arr || []).sort(function (a, b) { return a.order - b.order; });
            };

            //var layoutLoad = function (layoutId) {

            //    $scope.state.tilesEditing = false;

            //    dataService.loadLayout(layoutId).then(function () {
                    
            //        var pageId = navService.getLastPageId(dataService.character, dataService.layout);

            //        navService
            //            .gotoLayout(dataService.character.id, dataService.layout.id, pageId, true)
            //            .transition.onSuccess({}, function () {
            //                $timeout(function () {
            //                    layoutRender();
            //                });
            //            });
            //    });
            //};

            var layoutRender = function (pageIndex) {

                //$scope.state.tilesEditing = true;
                tabsSort($scope.LayoutTabs);

                if ($scope.LayoutTabs.length) {

                    if (pageIndex || pageIndex === 0) {
                        pageIndex = Math.clamp(0, $scope.LayoutTabs - 1);                        
                    }
                    else {
                        pageIndex = 0;

                        var pageId = $state.params.pageId;
                        if (pageId) {
                            pageIndex = $scope.LayoutTabs.findIndex(function (element, index) {
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
            };
            //$scope.tab = function ()
            //{
            //    $state.go('profile.addnewcharacter');
            //}
            //var layoutDelete = function () {

            //    var dlg = dialogs.confirm(
            //        'Confirm Delete',
            //        'Are you sure you want to delete this view, "' + dataService.layout.name + '", and all associated pages, tabs, and tiles?',
            //        { size: 'sm' }
            //    );

            //    dlg.result.then(
            //        function (btn) {

            //            dataService.deleteLayout(dataService.layout);
            //            dataService
            //                .saveChanges()
            //                .then(function () {
            //                    navService.gotoLayouts(dataService.character.id, true);
            //                });
            //        }
            //    );
            //};

            var layoutAdd = function () {

                var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                    { name: '' },
                    { size: 'sm' }
                );

                dlg.result.then(function (name) {
                    debugger;
                    $scope.LayoutViewModel = {
                        Name: name,
                        CharacterProfileId:1
                    }

                    layoutService.createLayout($scope.LayoutViewModel).then(function (data) {
                        if (data.data.status.StatusCode === 200) {
                            alert("Success");
                        }
                        else {
                            alert("Failed");
                        }
                    });

                    dataService.character.layouts.push(layout);
                    dataService
                        .saveChanges()
                        .then(function () {
                            layoutLoad(layout.id);
                        });
                });
            };

            //var layoutRename = function () {

            //    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
            //        { name: dataService.layout.name },
            //        { size: 'sm' }
            //    );

            //    dlg.result.then(function (name) {
            //        dataService.layout.name = name;
            //        dataService.saveChanges()
            //    });
            //};

            //var layoutCopy = function () {

            //    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
            //        { name: dataService.layout.name },
            //        { size: 'sm' }
            //    );

            //    dlg.result.then(function (name) {

            //        var layout = dataService.copyEntity(dataService.layout);
            //        layout.name = name;

            //        dataService
            //            .saveChanges()
            //            .then(function () {
            //                layoutLoad(layout.id);
            //            });
            //    });
            //};

            var tabDelete = function () {

                var tab = getActiveTab();

                if (tab) {

                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete "' + tab.name + '" and all its content?',
                        { size: 'sm' }
                    );

                    dlg.result.then(
                        function (btn) {

                            dataService.deleteTab(tab);

                            $scope.tabSet.index--;
                            if ($scope.tabSet.index === -1 && $scope.LayoutTabs.length)
                                $scope.tabSet.index = 0;

                            dataService.saveChanges();

                            $timeout(function () {
                                $scope.tabSet.api.scrollTabIntoView();
                            });
                        }
                    );
                }
            }

            var tabAdd = function () {

                var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                    { name: null },
                    { size: 'sm' }
                );

                dlg.result.then(function (name) {

                    $timeout(function () {

                        var tab = dataService.createTab({
                            name: name,
                            order: $scope.LayoutTabs.length
                        });

                        $scope.LayoutTabs.push(tab);
                        $scope.state.tilesEditing = true;

                        $timeout(function () {
                            $scope.tabSet.index = tab.order;
                            updateTabs();
                        });
                    });
                });
            };
            $scope.AddNewtab = function () {
                debugger;
                var Scope = $scope.NewLayout[0].LayoutMetaData.Tab;
                Scope.LayoutId = $scope.LayoutTabs[0].LayoutId;
                var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                    { scope: Scope}
                );

                dlg.result.then(function (res) {
                    debugger;
                    tabService.AddTab(res).then(function (data) {
                        debugger;
                        if (data.data.StatusCode == 200) {
                            GetAllTabs();
                        }
                        else {
                            if (data.data.StatusCode == 400) {
                                if (data.data.ShowToUser == true) {
                                    alert(data.data.ErrorMessage);
                                }
                            }
                        }
                    });
                });
            }



            $scope.ShowTiles = function () {
                debugger;
                var dlg = dialogs.create('/views/dialogs/showalltiles.html', 'dialogTileTypes',
                    {}
                );
                dlg.result.then(function (res) {
                    debugger;
                });
            }


            //$scope.AddCorestatvalues = function () {
            //    debugger;
            //    $scope.characters = rulesetDataShareService.getcorestatvalue();
            //    var dlg = dialogs.create('/views/dialogs/addcorestatvalues.html', 'dialogAddCorestatValues',
            //        { scope: $scope.characters }

            //    );

            //    dlg.result.then(function (res) {
            //        debugger;
            //        var values = characterService.AddCorestatValues(res);
            //        values.then(function (data)
            //        {
            //            debugger;
            //        })

            //        //$scope.LayoutTabs.push({ "name": res });
            //    });
            //}
            //var tabRename = function () {

            //    var tab = getActiveTab();

            //    if (tab) {

            //        var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
            //            { name: tab.name },
            //            { size: 'sm' }
            //        );

            //        dlg.result.then(function (name) {
            //            tab.name = name;
            //            dataService.saveChanges()
            //        });
            //    }
            

            var tabCopy = function () {

                var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'addNewCoreStat',
                    { name: 'Add New Core Stat' },
                    { size: 'sm' }
                );

                dlg.result.then(function (name) {
                    // Shuffle the order of the other tabs. The copy will add it to the backing array.
                  
                });
            };

            var tabReorder = function () {
                debugger;
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
                   // tileService.edit(tile, true).then(function () {
                        // Nothing to do
                    //});
                });
            }

            //$scope.tileAdd = function () {

            //    tileService.add().then(function (tile) {

            //        _autoPosition = true;

            //        var tab = getActiveTab();

            //        tile.tabId = tab.id;
            //        tab.tiles.push(tile);

            //        $timeout(function () {
            //            _autoPosition = false;
            //        });
            //    });
            //};

            //$scope.onDragStart = function (event, ui) {
            //    $timeout(function () {
            //        $scope.state.tileDragging = true;
            //    });
            //};

            //$scope.onDragStop = function (event, ui) {
            //    $timeout(function () {
            //        $scope.state.tileDragging = false;
            //    });
            //};

            //$scope.onDeleteDrop = function (event, ui) {
            //    var tile = GridStackUI.Utils.getNodeData(ui.helper);
            //    if (tile)
            //        dataService.deleteTile(tile);
            //};

            //$scope.onDeleteOver = function (event, ui) {
            //    var node = GridStackUI.Utils.getNodeData(ui.helper);
            //    if (node) {
            //        $timeout(function () {
            //            $scope.state.tileDeleteId = node.id;
            //        });
            //    }
            //};

            //$scope.onDeleteOut = function (event) {
            //    if ($scope.state.tileDeleteId) {
            //        $timeout(function () {
            //            $scope.state.tileDeleteId = null;
            //        });
            //    }
            //};

            //$scope.onTabSelected = function (tab, index) {

            //    //console.log('onTabSelected');
                
            //    //if (tab && tab.id) {
            //    //    navService.setLastTabId(dataService.character.id, dataService.layout.id, tab.id);
            //    //    navService.gotoLayout(dataService.character.id, dataService.layout.id, tab.id, true);
            //    //}
            //};

            //$scope.saveChanges = function () {
            //    $scope.state.tilesEditing = false;
            //    return dataService.saveChanges();
            //};

            (function () {

                $scope.navService.updateBody(true, true);
                $scope.state.tilesEditing = false;

                //rpgsmith.fillArray(dataService.character.layouts, _menuOptionView.menus, function (layout) {
                //    return {
                //        id: 'view.load',
                //        context: layout,
                //        name: layout.name,
                //        action: function (item) {
                //            layoutLoad(item.context.id);
                //        },
                //        icon: 'fa-fw'
                //    };
                //});

                $timeout(function () {
                    layoutRender();
                });

            })();
        }
    ]);

})();