(function () {
    'use strict';

    var app = angular.module('rpgsmith-directives');


    app.directive('tilePicker', ['$document', '$timeout', '$q',
        function ($document, $timeout, $q) {
            return {
                restrict: 'A',
                scope: {
                    api: '=tilePicker'
                },
                link: function (scope, element, attrs, controller, ngModel) {

                    var _callback = null;
                    var _bodyClickCount = 0;

                    function handleKeyDown(e) {
                        var ESC_KEY = 27;
                        var key = e.keyCode || e.which;
                        if (key === ESC_KEY)
                            cleanup();
                    };

                    function handleBodyClick(e) {
                        cleanup();
                    };

                    function cleanup() {
                        if (scope.api.selecting) {

                            _callback = null;

                            $document.on('keydown', handleKeyDown);
                            $document.on('touchend click', handleBodyClick);

                            $timeout(function () {
                                scope.api.selecting = false;
                                if (typeof scope.api.onClose === 'function')
                                    scope.api.onClose();
                            });
                        }
                    };

                    scope.$on('$destroy', function () {
                        cleanup();
                    });

                    scope.api.selecting = false;

                    scope.api.beginSelect = function (callback) {

                        _callback = callback;

                        $timeout(function () {

                            if (typeof scope.api.beforeSelect === 'function')
                                scope.api.beforeSelect();

                            scope.api.selecting = true;

                            $document.on('keydown', handleKeyDown);
                            $document.on('click', handleBodyClick);
                        });
                    };

                    scope.api.endSelect = function (data) {
                        if (typeof _callback === 'function')
                            _callback(data);
                        scope.api.selecting = false;
                        if (typeof scope.api.onClose === 'function')
                            scope.api.onClose();
                    };
                }
            }
        }
    ]);

})();