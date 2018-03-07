(function () {
    'use strict';

    var app = angular.module('rpgsmith-directives');

    app.directive('rpgsmithcontenttype', ['$compile', 'dialogs', 'characterService', function ($compile, dialogs, characterService) {
        var templateUrl1 = '<button type="button" class="btn btn-accent btn_align" ng-model="" name="input">{{info.Name}}</button>';
        var templateUrl0 = '<button type="button" class="btn btn-accent btn_align" ng-model="" name="input" ng-click="UpdateEquip()">{{info.Name}}</button>';
        var getTemplate = function (contentType, IsMandatory) {.0
            var template = '';

            switch (contentType) {
                case false:
                        template = templateUrl1;
                    break;
                case true:
                    template = templateUrl0;
                    break;
            }

            return template;
        };


        var linker = function (scope, element, attrs) {

            var items = angular.copy(scope.info);
            if (items.TypeId == 3 || items.TypeId == 4) {
                if (items.IsAction == true) {
                    if (items.Value.YesOrNo.value == "Yes" || items.Value.YesOrNo.value == "False" || items.Value.YesOrNo.value == "" || items.Value.YesOrNo.value === undefined || items.Value.YesOrNo.value === null) {

                        element.html(getTemplate(items.IsAction));
                        $compile(element.contents())(scope);
                        items.Name = "UnEquipped";
                    }
                    else if (items.Value.YesOrNo.value == "No" || items.Value.YesOrNo.value == "False" || items.Value.YesOrNo.value == "" || items.Value.YesOrNo.value === undefined || items.Value.YesOrNo.value === null) {

                        element.html(getTemplate(items.IsAction));
                        $compile(element.contents())(scope);
                        items.Name = "Equipped";
                    }

                }
            }
            scope.UpdateEquip = function () {
                //var CharacterItemValueId = scope.info.CharacterItemValueId;
                if (scope.info.CharacterItemValueId != undefined) {
                    if (scope.info.Value.YesOrNo.value == "Yes" || items.Value.YesOrNo.value == "False" || items.Value.YesOrNo.value == "" || items.Value.YesOrNo.value === undefined || items.Value.YesOrNo.value === null) {
                        scope.info.Value.YesOrNo.value = "No";
                        characterService.UpdateItemEquipContent(scope.info).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                if (items.IsAction == true) {
                                    scope.info.Name = "Equipped";
                                    element.html(getTemplate(items.IsAction));
                                    $compile(element.contents())(scope);
                                }
                            }
                        })
                    }
                    else if (scope.info.Value.YesOrNo.value == "No" || items.Value.YesOrNo.value == "False" || items.Value.YesOrNo.value == "" || items.Value.YesOrNo.value === undefined || items.Value.YesOrNo.value === null) {
                        scope.info.Value.YesOrNo.value = "Yes";
                        characterService.UpdateItemEquipContent(scope.info).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                if (items.IsAction == true) {
                                    scope.info.Name = "UnEquipped";
                                    element.html(getTemplate(items.IsAction));
                                    $compile(element.contents())(scope);
                                }
                            }
                        })
                    }
                }
                else if (scope.info.CharacterSpellValueId != undefined) {
                    if (scope.info.Value.YesOrNo.value == "Yes" || items.Value.YesOrNo.value == "False" || items.Value.YesOrNo.value == "" || items.Value.YesOrNo.value === undefined || items.Value.YesOrNo.value === null) {
                        scope.info.Value.YesOrNo.value = "No";
                        characterService.UpdateSpellMemorizeContent(scope.info).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                if (items.IsAction == true) {
                                    scope.info.Name = "Memorized";
                                    element.html(getTemplate(items.IsAction));
                                    $compile(element.contents())(scope);
                                }
                            }
                        })
                    }
                    else if (scope.info.Value.YesOrNo.value == "No" || items.Value.YesOrNo.value == "False" || items.Value.YesOrNo.value == "" || items.Value.YesOrNo.value === undefined || items.Value.YesOrNo.value === null) {
                        scope.info.Value.YesOrNo.value = "Yes";
                        characterService.UpdateSpellMemorizeContent(scope.info).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                if (items.IsAction == true) {
                                    scope.info.Name = "UnMemorized";
                                    element.html(getTemplate(items.IsAction));
                                    $compile(element.contents())(scope);
                                }
                            }
                        })
                    }
                }
                else if (scope.info.CharacterAbilityValueId != undefined) {
                    if (scope.info.Value.YesOrNo.value == "Yes" || items.Value.YesOrNo.value == "False" || items.Value.YesOrNo.value == "" || items.Value.YesOrNo.value === undefined || items.Value.YesOrNo.value === null) {
                        scope.info.Value.YesOrNo.value = "No";
                        characterService.UpdateAbilityEnabledContent(scope.info).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                if (items.IsAction == true) {
                                    scope.info.Name = "Enabled";
                                    element.html(getTemplate(items.IsAction));
                                    $compile(element.contents())(scope);
                                }
                            }
                        })
                    }
                    else if (scope.info.Value.YesOrNo.value == "No" || items.Value.YesOrNo.value == "False" || items.Value.YesOrNo.value == "" || items.Value.YesOrNo.value === undefined || items.Value.YesOrNo.value === null) {
                        scope.info.Value.YesOrNo.value = "Yes";
                        characterService.UpdateAbilityEnabledContent(scope.info).then(function (data) {
                            if (data.data.StatusCode == 200) {

                                if (items.IsAction == true) {
                                    scope.info.Name = "Disabled";
                                    element.html(getTemplate(items.IsAction));
                                    $compile(element.contents())(scope);
                                }
                            }
                        })
                    }
                }
            }
            //for (var i = 0; i < items.length; i++)
            //{
            //    if (items[i].IsAction == 0)
            //    {
            //        element.html(getTemplate(items[i].IsAction));

            //        $compile(element.contents())(scope);
            //    }
            //    else if (items[i].IsAction == 1)
            //    {
            //        element.html(getTemplate(items[i].IsAction));

            //        $compile(element.contents())(scope);
            //    }
            //}
            //scope.defaultDiceSelect = function () {
            //    debugger;
            //    var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
            //        { "mode": 1 }
            //    );
            //    dlg.result.then(function (res) {
            //        debugger;
            //        //    scope.dice = res;
            //        scope.info.Value.DefaultDice.value = res;
            //    });
            //};
            //scope.getThumbNail = function () {
            //    if (scope.file)
            //        return $scope.file;

            //    var c = scope.item;
            //    if (c.id && c.portrait)
            //        return '/characterdata/' + c.id + '/' + c.portrait;

            //    return null;
            //}
        };

        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                info: '='
            }
        }
    }]);


})();