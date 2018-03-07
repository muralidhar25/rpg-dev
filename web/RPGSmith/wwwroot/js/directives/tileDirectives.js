(function () {
    'use strict';

    var app = angular.module('rpgsmith-directives');

    app.directive('ngBindHtmlCompile', ['$timeout', '$sce', '$compile', '$interpolate', function($timeout, $sce, $compile, $interpolate) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                scope.$watch($sce.parseAsHtml(attr.ngBindHtmlCompile), function(value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                });
            }
        };
    }]);

    app.directive('tileRender1', [function () {
        return {
            restrict: 'A',
            controller: 'tileRenderController1',
            templateUrl: '/views/tiles/tile-template-1.html',
            scope: {
                tile: '=tileRender1'
            }
        }
    }]);

    app.directive('tileRender2', [function () {
        return {
            restrict: 'A',
            controller: 'tileRenderController2',
            templateUrl: '/views/tiles/tile-template-2.html',
            scope: {
                tile: '=tileRender2'
            }
        }
    }]);

    app.directive('tileRender3', [function () {
        return {
            restrict: 'A',
            controller: 'tileRenderController3',
            templateUrl: '/views/tiles/tile-template-3.html',
            scope: {
                tile: '=tileRender2'
            }
        }
    }]);


})();