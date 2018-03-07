(function () {
    'use strict';
    
    var app = angular.module('rpgsmith-directives');
    
    app.controller('GridstackController', ['$scope', function ($scope) {

        var gridstack = null;

        this.init = function (element, options) {
            gridstack = element.gridstack(options).data('gridstack');
            return gridstack;
        };

        this.verticalMargin = function (value, noUpdate) {
            if (gridstack) {
                gridstack.verticalMargin(value, noUpdate);
            }
        };

        this.enableMove = function (enable) {
            if (gridstack)
                gridstack.enableMove(enable, true);
        };

        this.enableResize = function (enable) {
            if (gridstack)
                gridstack.enableResize(enable, true);
        };

        this.removeItem = function (element) {
            if (gridstack)
                return gridstack.removeWidget(element, false);
            return null;
        };

        this.addItem = function (element) {
            if (gridstack) {

                var el = gridstack.makeWidget(element);
                el.attr('data-gs-auto-position', false);

                return element;
            }
            return null;
        };

    }]);

    app.directive('gridstack', ['$timeout', '$window', function ($timeout, $window) {

        return {
            restrict: 'A',
            controller: 'GridstackController',
            scope: {
                options: '=',
                onChange: '&',
                onDragStart: '&',
                onDragStop: '&',
                onResizeStart: '&',
                onResizeStop: '&',
                gridstackHandler: '=?',
                gsLockTiles: '=?'
            },
            link: function (scope, element, attrs, controller, ngModel) {

                var gridstack = controller.init(element, scope.options);

                scope.gridstackHandler = gridstack;
                scope.options.api = gridstack;

                angular.element($window).bind('resize', _.debounce(function () {

                    var width = element.innerWidth();
                    var cellWidth = gridstack.cellWidth();

                    if (cellWidth > 0) {

                        var columns = Math.floor(width / cellWidth);

                        if (columns !== scope.options.width) {

                            scope.$evalAsync(function () {
                                console.log(columns);
                                //scope.options.width = columns;
                                gridstack.setGridWidth(columns, false);
                            });
                        }
                    }

                }, 500));
                
				element.on('change', function (e, items) {
					console.log("Change: ",e,items);
                    
                });

                element.on('dragstart', function (e, ui) {
                    scope.onDragStart({ event: e, ui: ui });
                });

                element.on('dragstop', function (e, ui) {
                    scope.onDragStop({ event: e, ui: ui });
                });

                element.on('resizestart', function (e, ui) {
                    scope.onResizeStart({ event: e, ui: ui });
                });

                element.on('resizestop', function (e, ui) {
                    scope.onResizeStop({ event: e, ui: ui });
                });

                scope.$watch('gsLockTiles', function () {
                    controller.enableMove(!scope.gsLockTiles);
                    controller.enableResize(!scope.gsLockTiles);
                });
            }
        };

    }]);

    app.directive('gridstackItem', ['$timeout', function ($timeout) {

        return {
            restrict: 'A',
            controller: 'GridstackController',
            require: '^gridstack',
            scope: {

                gsItem: '=?',
                gridstackItem: '=',
                
                gsItemId: '=?',
                gsItemX: '=?',
                gsItemY: '=?',
                gsItemWidth: '=?',
                gsItemHeight: '=?',

                gsItemAutoPosition: '=?',

                gsItemMinHeight: '=?',
                gsItemMaxHeight: '=?',
                gsItemMinWidth: '=?',
                gsItemMaxWidth: '=?'
            },
            link: function (scope, element, attrs, controller) {

                var el = $(element);

                element.data('_item_data', scope.gsItem);
                
                el.attr('data-gs-id', scope.gsItemId);

                if (!scope.gsItemAutoPosition) {
                    el.attr('data-gs-x', scope.gsItemX);
                    el.attr('data-gs-y', scope.gsItemY);
                }

                el.attr('data-gs-width', scope.gsItemWidth);
                el.attr('data-gs-height', scope.gsItemHeight);
                
                el.attr('data-gs-min-width', scope.gsItemMinWidth);
                el.attr('data-gs-min-height', scope.gsItemMinHeight);
                el.attr('data-gs-max-width', scope.gsItemMaxWidth);
                el.attr('data-gs-max-height', scope.gsItemMaxHeight);

                el.attr('data-gs-auto-position', scope.gsItemAutoPosition);
                
                var widget = controller.addItem(element);
                var item = element.data('_gridstack_node');

                // TODO
                // https://github.com/kdietrich/gridstack-angular/pull/21
                scope.$watch(function () { return el.attr('data-gs-id'); }, function (val) {
                    scope.gsItemId = val;
                });
                
                scope.$watch(function () { return el.attr('data-gs-x'); }, function (val) {
                    scope.gsItemX = Number(val);
                });

                scope.$watch(function () { return el.attr('data-gs-y'); }, function (val) {
                    scope.gsItemY = Number(val);
                });

                scope.$watch(function () { return el.attr('data-gs-width'); }, function (val) {
                    scope.gsItemWidth = Number(val);
                });

                scope.$watch(function () { return el.attr('data-gs-height'); }, function (val) {
                    scope.gsItemHeight = Number(val);
                });

                element.bind('$destroy', function () {
                    var item = element.data('_gridstack_node');
                    controller.removeItem(element);
                });
            }

        };

    }]);

})();