(function () {
    'use strict';

    var app = angular.module('rpgsmith-controllers');

    app.controller('layoutsPageController', ['$scope', '$q', '$window', '$timeout', '$transition', 'dialogs', 'toaster', 'navService', 'dataService',
        function ($scope, $q, $window, $timeout, $transition, dialogs, toaster, navService, dataService) {

            $scope.dataService = dataService;
            $scope.navService = navService;

            $scope.tilePickerApi = {
                messageId: null,
                beforeSelect: function () {
                    toaster.clear('*');
                    $scope.tilePickerApi.messageId = toaster.pop({
                        type: 'note',
                        body: 'Click a layout to ' + $scope.tilePickerApi.action + ' it.',
                        timeout: 0,
                        showCloseButton: false,
                        tapToDismiss: false
                    });
                },
                onClose: function () {
                    if ($scope.tilePickerApi.messageId)
                        toaster.clear($scope.tilePickerApi.messageId);
                }
            };

            $scope.menuHamburger = {
                opened: false,
                menus: navService.getCommonHamburger([
                    {
                        name: 'Layouts',
                        header: true
                    },
                    {
                        id: 'view.new',
                        name: 'New Layout',
                        icon: 'fa-fw fa-file-o',
                        action: function () {
                            layoutAdd();
                        }
                    },
                    {
                        id: 'view.rename',
                        name: 'Rename Layout',
                        icon: 'fa-fw fa-i-cursor',
                        action: function () {
                            layoutRename();
                        }
                    },
                    {
                        id: 'view.delete',
                        name: 'Delete Layout',
                        icon: 'fa-fw fa-trash-o',
                        action: function () {
                            layoutDelete();
                        }
                    },
                    {
                        id: 'view.copy',
                        name: 'Copy Layout',
                        icon: 'fa-fw fa-files-o',
                        action: function () {
                            layoutCopy();
                        }
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

            var layoutAdd = function () {

                var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                    { name: '' },
                    { size: 'sm' }
                );

                dlg.result.then(function (name) {

                    var layout = dataService.createLayout({
                        name: name
                    });

                    dataService.character.layouts.push(layout);
                    dataService.saveChanges()
                });

            };

            var layoutRename = function () {

                $scope.tilePickerApi.action = 'rename';
                $scope.tilePickerApi.beginSelect(function (item) {

                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { name: item.name },
                        { size: 'sm' }
                    );

                    dlg.result.then(function (name) {
                        item.name = name;
                        dataService.saveChanges()
                    });
                });
            };

            var layoutDelete = function () {

                $scope.tilePickerApi.action = 'delete';
                $scope.tilePickerApi.beginSelect(function (item) {

                    var dlg = dialogs.confirm(
                        'Confirm Delete',
                        'Are you sure you want to delete the layout, "' + item.name + '", and all associated pages, tabs, and tiles?',
                        { size: 'sm' }
                    );

                    dlg.result.then(
                        function (btn) {
                            dataService.deleteLayout(item);
                            dataService.saveChanges();
                        }
                    );
                });
            };

            var layoutCopy = function () {

                $scope.tilePickerApi.action = 'copy';
                $scope.tilePickerApi.beginSelect(function (item) {

                    var dlg = dialogs.create('/views/dialogs/tab-rename.html', 'dialogTabRename',
                        { name: item.name },
                        { size: 'sm' }
                    );

                    dlg.result.then(function (name) {

                        alert('TODO');

                        // We have to ensure the layout is completely loaded before
                        // we can copy it.

                        //var layout = dataService.copyEntity(dataService.layout);
                        //layout.name = name;

                        //dataService.saveChanges();
                    });

                });
            };

            $scope.selectLayout = function (layout) {
                if ($scope.tilePickerApi.selecting)
                    $scope.tilePickerApi.endSelect(layout);
                else
                    $transition.router.stateService.go('profile.character.layout', { characterId: $transition.params().characterId, layoutId: layout.id });
            };

            $scope.newLayout = function () {
                if ($scope.tilePickerApi.selecting)
                    return;
                layoutAdd();
            };

            var createToastId = null;

            $scope.$watch('dataService.character.layouts.length', function (count) {
                if (count === 0) {
                    createToastId = toaster.pop({
                        type: 'note',
                        body: 'Click the plus button to create a new layout.',
                        timeout: 0,
                        showCloseButton: false,
                        tapToDismiss: true
                    });
                }
                else {
                    toaster.clear(createToastId);
                }
            });

            (function () {
                $scope.navService.updateBody(true, false);
            })();
        }
    ]);

})();