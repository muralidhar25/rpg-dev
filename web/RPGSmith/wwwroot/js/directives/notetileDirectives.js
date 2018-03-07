(function () {
    'use strict';

    var app = angular.module('rpgsmith-directives');

    app.directive('rpgsmithnotetype', ['$compile', 'dialogs', 'tileService', '$state', 'toaster', 'rulesetDataShareService', function ($compile, dialogs, tileService, $state, toaster, rulesetDataShareService) {
		var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-4"><div class="form-group"><label for="newNoteTitle">Title</label><input type= "text" id="newNoteTitle" class="form-control" placeholder= "Enter note title" ng-model="info.Value.Note.Name" ></div><div class="form-group"> <ul class="input-color-items"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor" checked="checked"><i class="icon input-color-2"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-4"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-6"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-8"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-10"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-12"></i></label></li><li class="form-check"><label class="form-check-label"><i class="icon input-color-custom" role="button" data-dismiss="modal" data-toggle="modal" data-target="#colorSelectionPopup"></i></label></li></ul></div></div></div> <div class="form-row"><div class="col"><div class="form-group"><label for="newNoteContents">Contents*</label><textarea id="newNoteContents" class="form-control" placeholder="Enter note contents" rows="8" ng-model="info.Value.Note.Text"></textarea></div></div></div></form > ';

		var templateUrlUse = '<div class="NoteTile" style="background-color: {{info.Styles.titlebackgroundcolor}};height: 50px;"><span class="text_design" ng-click="EditNoteTile()" > <p style="color:{{info.Styles.titletextcolor}};height: 50px;">{{ info.Value.Note.Name }}</p></span ></div ><div style="color:{{info.Styles.bodytextcolor}};height: 80%" ng-bind-html="info.Value.Note.Text" ng-click="ShowContent()"></div>';


        var getTemplate = function (useoredit) {
            var template = '';

            switch (useoredit) {
                case 1:
                    template = templateUrlEdit;
                    break;
                case 0:
                    template = templateUrlUse;
                    break;
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            //var items = angular.copy(scope.info);
            //var item = angular.copy(scope.fullscope);
            element.html(getTemplate(scope.useoredit));

            $compile(element.contents())(scope);
            scope.EditNoteTile = function () {
                var dlg = dialogs.create('/views/dialogs/tile-editor-1.html', 'NoteTile',
                    { scope: scope.info, Tablist: scope.fullscope }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        res.IsSync = false;
                        res.UpdateDate = Date.now();
                        if (res.Styles != null) {
                            res.Styles.backgroundColor = $("#bckcolor").val();
                        }
                        rulesetDataShareService.setTilelst(res);
                        //rulesetDataShareService.setTileStyles(res);
                        //var index = -1;
                        //if (angular.isUndefined(scope.fullscope) == false) {
                        //    for (var i = 0; i < scope.fullscope.length; i++) {
                        //        if (scope.fullscope[i].TileId == res.TileId) {
                        //            scope.fullscope.splice(i, 1);
                        //            scope.fullscope.push(res);
                        //        }
                        //    }
                        //}
                        //res.Mode = "Use";
                        //element.html(getTemplate(scope.useoredit));
                        scope.info = res;

                        scope.fromDirectiveFn(scope.info);
                    }
                });
            }

            scope.ShowContent = function () {
                var dlg = dialogs.create('/views/dialogs/notetilecontent.html', 'ShowAllTileContent',
                    { scope: scope.info }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        scope.info = res;
                    }
                });
            }

            scope.RemoveTile = function () {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    "Are you sure you want to delete " + scope.info.Value.Note.Name,
                    { size: 'sm' }
                );

                dlg.result.then(
                    function (btn) {
                        tileService.deleteTile(scope.info.TileId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                //  scope.info = null;
                                //  scope.info.splice(scope.info.TileId);
                                $state.go('profile.character.layout');
                                // $transition.router.stateService.go('profile.character.layout', { characterId: scope.info.Value.Note.CharacterProfileId, layoutId: 123 });
                                toaster.pop('success', "Tile deleted Successfully.");
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
                );
            }

        }


        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                info: '=',
                //info: '&',
                //info: false,
                //fullscope: '=',
                useoredit: '=',
                fromDirectiveFn: '=method'
            }
        };

    }]);

    app.directive('rpgsmithcountertype', ['$compile', 'dialogs', 'tileService', 'toaster', 'rulesetDataShareService', function ($compile, dialogs, tileService, toaster, rulesetDataShareService) {
        //var templateUrlEdit = '<div class="row"><div class ="form-group col-md-6"><label class="control-label col-md-4">Default Value</label><div class="col-md-8"><input type="number" placeholder="Default Value" class="form-control col-md-8" ng-model="info.Value.Counter.DefaultValue" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" value="0" ></div></div><div class="form-group col-md-6"><label class="control-label col-md-4">Mask</label><div class="col-md-8"><input type="text" placeholder="Text" class="form-control col-md-8" ng-model="info.Value.Counter.Mask" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" value="" ></div></div>' +
        //    '<div class="form-group col-md-6"><label class="control-label col-md-4">Max</label><div class="col-md-8"><input type="number" placeholder="Max Value" class="form-control col-md-8" ng-model="info.Value.Counter.Max" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" value="" ></div></div><div class="form-group col-md-6"><label class="control-label col-md-4">Min</label><div class="col-md-8"><input type="number" placeholder="Min Value" class="form-control col-md-8" ng-model="info.Value.Counter.Min" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" value="" ></div></div><div class="form-group col-md-6"><label class="control-label col-md-4">Name</label><div class="col-md-8"><input type="text" placeholder="Name" class="form-control col-md-8" ng-model="info.Value.Counter.Name" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" value="" ></div></div>' +
        //    '<div class="form-group col-md-6"><label class="control-label col-md-4">Step</label><div class="col-md-8"><input type="number" placeholder="Step" class="form-control col-md-8" ng-model="info.Value.Counter.Step" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" value="" ></div></div><div class="form-group col-md-6"><label class="control-label col-md-4">Value</label><div class="col-md-8"><input type="number" placeholder="Value" class="form-control col-md-8" ng-model="info.Value.Counter.Value" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" value="" ></div></div></div>';
		var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-6"><div class="form-group"><label for="newCounterTitle">Title</label><input type="text" id="newCounterTitle" class="form-control" ng-model="info.Value.Counter.Name" placeholder="Enter counter title"></div></div><div class="col-12 col-md-6"><div class="form-group"><label for="newCounterDefaultValue">Default Value*</label><input type="number" id="newCounterDefaultValue" class="form-control" placeholder="Enter reset value" ng-model="info.Value.Counter.Value"></div></div></div><div class="form-row"><div class="col-12 col-md-6"><div class="form-group"><label for="newCounterMinimumValue">Minimum</label><input type="number" id="newCounterMinimumValue" class="form-control" placeholder="Enter minimum value" ng-model="info.Value.Counter.Min"></div></div><div class="col-12 col-md-6"><div class="form-group"><label for="newCounterMaximumValue">Maximum</label><input type="number" id="newCounterMaximumValue" class="form-control" placeholder="Enter maximum value" ng-model="info.Value.Counter.Max"></div></div></div><div class="form-row"><div class="col-12 col-md-6"><div class="form-group"><label for="newCounterStep">Step</label><input type="number" id="newCounterStep" class="form-control" placeholder="Enter step" ng-model="info.Value.Counter.Step"></div><div class="form-group"><label for="colorList">Color*</label><ul id="colorList" class="input-color-items"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor" checked="checked"><i class="icon input-color-2"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-4"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-6"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-8"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-10"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-12"></i></label></li><li class="form-check"><label class="form-check-label"><i class="icon input-color-custom" role="button" data-dismiss="modal" data-toggle="modal" data-target="#colorSelectionPopup"></i></label></li></ul></div></div></div></form>';


		var templateUrlUse = '<div class="NoteTile" style="background-color: {{info.Styles.titlebackgroundcolor}}"><span  ng-click="EditCounterTile()" class="text_design"><p style="color:{{info.Styles.titletextcolor}};height:50px">{{info.Value.Counter.Name}}</p></span></div> <div class="text_align" style="font-size: larger;vertical-align: middle;background-color: {{info.Styles.bodybackgroundColor}};width: 100%;height:90%"><p ng-click="ShowCounterValue()" style="color:{{info.Styles.bodytextcolor}};">{{ info.Value.Counter.Value }}</p> </div>';

        var getTemplate = function (useoredit) {
            var template = '';

            switch (useoredit) {
                case 1:
                    template = templateUrlEdit;
                    break;
                case 0:
                    template = templateUrlUse;
                    break;
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            //var items = angular.copy(scope.info);

            element.html(getTemplate(scope.useoredit));

            $compile(element.contents())(scope);

            scope.EditCounterTile = function () {
                var dlg = dialogs.create('/views/dialogs/tile-editor-2.html', 'NoteTile',
                    { scope: scope.info }
                );
                dlg.result.then(function (res) {
                    //res.UpdateDate = Date.now();
                    if (res != "cancel") {
                        if (res.Styles != null) {
                            res.Styles.backgroundColor = $("#bckcolor").val();
                        }
                        rulesetDataShareService.setTilelst(res);
                        scope.info = res;

                    }
                });
            }
            var setValue = function (val) {
                scope.info.IsSync = false;
                //scope.info.UpdateDate = Date.now();
                scope.info.Value.Counter.Value = parseInt(val);
            }
            setValue(scope.info.Value.Counter.Value);
            scope.ShowCounterValue = function () {
                var dlg = dialogs.create('/views/dialogs/countertilecontent.html', 'ShowAllTileContent',
                    { scope: scope.info }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        scope.info = res;
                    }
                });
            }
            scope.Increment = function () {
                var min = angular.isUndefined(scope.info.Value.Counter.Min) ? null : parseInt(scope.info.Value.Counter.Min);
                var max = angular.isUndefined(scope.info.Value.Counter.Max) ? null : parseInt(scope.info.Value.Counter.Max);
                var step = angular.isUndefined(scope.info.Value.Counter.Step) ? 0 : parseInt(scope.info.Value.Counter.Step);
                if (max && (scope.info.Value.Counter.Value >= max || scope.info.Value.Counter.Value + step >= max)) {
                    setValue(max);
                    return false;
                }
                else if (step == 0) {
                    scope.info.Value.Counter.Value = min;
                    return false;
                }
                setValue(scope.info.Value.Counter.Value + step);
            }
            scope.Decrement = function () {
                var min = angular.isUndefined(scope.info.Value.Counter.Min) ? null : parseInt(scope.info.Value.Counter.Min);
                var max = angular.isUndefined(scope.info.Value.Counter.Max) ? null : parseInt(scope.info.Value.Counter.Max);
                var step = angular.isUndefined(scope.info.Value.Counter.Step) ? 0 : parseInt(scope.info.Value.Counter.Step);
                if (min && (scope.info.Value.Counter.Value <= min || scope.info.Value.Counter.Value - step <= min) || min === 0 && scope.info.Value.Counter.Value < 1) {
                    setValue(min);
                    return false;
                }
                setValue(scope.info.Value.Counter.Value - step);
            };
            scope.Reset = function () {
                var min = angular.isUndefined(scope.info.Value.Counter.Min) ? null : parseInt(scope.info.Value.Counter.Min);
                var max = angular.isUndefined(scope.info.Value.Counter.Max) ? null : parseInt(scope.info.Value.Counter.Max);
                var step = angular.isUndefined(scope.info.Value.Counter.Step) ? 0 : parseInt(scope.info.Value.Counter.Step);
                var dlg = dialogs.confirm(
                    'Confirm Reset',
                    'Are you sure you want to reset "' + scope.info.Value.Counter.Name + '" to "' + scope.info.Value.Counter.DefaultValue + '"?',
                    { size: 'md' }
                );

                dlg.result.then(
                    function () {
                        scope.info.IsSync = false;
                        scope.info.UpdateDate = Date.now();
                        scope.info.Value.Counter.Value = scope.info.Value.Counter.DefaultValue;
                    });
            }
            scope.RemoveTile = function () {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    "Are you sure you want to delete " + scope.info.Value.Counter.Name,
                    { size: 'sm' }
                );

                dlg.result.then(
                    function (btn) {
                        tileService.deleteTile(scope.info.TileId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                //  scope.info.splice(scope.info.TileId);
                                toaster.pop('success', "Tile deleted Successfully.");

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
                );
            }

        };
        //scope.changed = function () {
        //    // If the user decides to delete the number, we will set it to 0.
        //    if (!scope.info.Value.Counter.Value) setValue(0);

        //    // Check if what's typed is numeric or if it has any letters.
        //    if (/[0-9]/.test(scope.info.Value.Counter.Value)) {
        //        setValue(scope.info.Value.Counter.Value);
        //    }
        //    else {
        //        setValue(scope.min);
        //    }

        //    // If a minimum is set, let's make sure we're within the limit.
        //    if (min && (scope.info.Value.Counter.Value <= min || scope.info.Value.Counter.Value - step <= min)) {
        //        setValue(min);
        //        return false;
        //    }

        //    // If a maximum is set, let's make sure we're within the limit.
        //    if (max && (scope.info.Value.Counter.Value >= max || scope.info.Value.Counter.Value + step >= max)) {
        //        setValue(max);
        //        return false;
        //    }

        //    // Re-set the value as an integer.
        //    setValue(scope.info.Value.Counter.Value);
        //};
        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                info: '=',
                useoredit: '='
            }
        }

    }]);

    app.directive('rpgsmithattributetype', ['$compile', 'dialogs', 'rulesetDataShareService', function ($compile, dialogs, rulesetDataShareService) {
        //var templateUrlEdit = '<div class="row"><div class ="form-group col-md-6"><label class="control-label col-md-4">Title</label><div class="col-md-8"><input type="text" class="form-control col-md-8" ng-model="info.Value.Attribute.Title" value=""/></div></div><div class ="form-group col-md-6"><label class="control-label col-md-4">Corestat Value</label><div class="col-md-6"><select class="form-control " ng-options=" item.Name as item.Name for item in info.CorestatValues" ng-model="info.Value.Attribute.CorestatValue" >' +
        //    //var templateUrlEdit = '<div class="row"><div class ="form-group col-md-6"><label class="control-label col-md-4">Title</label><div class="col-md-8"><input type="text" class="form-control col-md-8" ng-model="info.Value.Attribute.Title" value=""/></div></div><div class ="form-group col-md-6"><label class="control-label col-md-4">Corestat Value</label><div class="col-md-6"><select class="form-control " ng-options="item for item in corestatnames" ng-model="info.Value.Attribute.CorestatValue" >' +
        //    '<option value="">--Select--</option></select></div></div></div>';

		var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-6"><div class="form-group"><label for="colorList">Color*</label><ul id="colorList" class="input-color-items"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor" checked="checked"><i class="icon input-color-2"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-4"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-6"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-8"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-10"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-12"></i></label></li><li class="form-check"><label class="form-check-label"><i class="icon input-color-custom" role="button" data-dismiss="modal" data-toggle="modal" data-target="#colorSelectionPopup"></i></label></li></ul></div><fieldset class="form-group input-switch input-switch-dual"><legend></legend><ul class="input-switch-items"><li class="form-check"><label class="control-label col-md-4">Title</label></li><li class="form-check"><input type="text" class="form-control col-md-8" ng-model="info.Value.Attribute.Title" value="" /></li></ul></fieldset></div></div><div class="form-row"><div class="col"><fieldset class="form-group input-list input-list-wrap core-stats"><legend>Core Stats*</legend><ul class="input-list-items" ng-if="info.CorestatValues != null"><li class="form-check" ng-repeat="coreStatValue in info.CorestatValues"><label class="form-check-label"><input class="form-check-input" type="radio" name="newAttributeCoreStats" value="{{coreStatValue.Name}}" ng-model="$parent.info.Value.Attribute.CorestatValue"><span><em>{{ coreStatValue.Name }}</em><i class="icon"></i></span></label></li></ul><p class="text-center" ng-if="info.CorestatValues == null">No Corestats Available</p></fieldset></div></div></form>';
        //var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-6"><fieldset class="form-group input-switch input-switch-dual"><legend></legend><ul class="input-switch-items"><li class="form-check"><label class="control-label col-md-4">Title</label></li><li class="form-check"><input type="text" class="form-control col-md-8" ng-model="info.Value.Attribute.Title" value="" /></li></ul></fieldset></div></div><div class="form-row"><div class="col"><fieldset class="form-group input-list input-list-wrap core-stats"><legend>Core Stats*</legend><ul class="input-list-items"><li class="form-check" ng-repeat="coreStatValue in info.CorestatValues"><label class="form-check-label"><input class="form-check-input" type="radio" name="newAttributeCoreStats" value="{{coreStatValue.Name}}" ng-model="info.Value.Attribute.SelectedCorestatValue"><span><em>{{ coreStatValue.Name }}</em><i class="icon"></i></span></label></li></ul></fieldset></div></div></form>';

		var templateUrlUse = '<div class="NoteTile" style="background-color: {{info.Styles.titlebackgroundcolor}}"><span ng-click="EditAttributeTile()" class="text_design"><p style="color:{{info.Styles.titletextcolor}};">{{info.Value.Attribute.Title}}</p></span></div><div class="text_align"><p ng-click="ShowAttributeContent()" style="color:{{info.Styles.bodytextcolor}};">{{info.Value.Attribute.Name}}</p></div>';

        var getTemplate = function (useoredit) {
            var template = '';

            switch (useoredit) {
                case 1:
                    template = templateUrlEdit;
                    break;
                case 0:
                    template = templateUrlUse;
                    break;
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            debugger;
            var items = angular.copy(scope.info);
            element.html(getTemplate(scope.useoredit));

            $compile(element.contents())(scope);

            if (scope.useoredit == 0) {
                if (items.Value.Attribute.AttributeContent == null || items.Value.Attribute.AttributeContent == "" || angular.isUndefined(items.Value.Attribute.AttributeContent) == true) {
                    var CoreStatValues = rulesetDataShareService.getLayoutData();
                    for (var i = 0; i < CoreStatValues.CorestatValues.length; i++) {
                        var data = CoreStatValues.CorestatValues[i];
                        if (scope.info.Value.Attribute.TypeId == data.TypeId) {
                            items.Value.Attribute.AttributeContent = data;
                        }
                    }
                }
                if (items.Value.Attribute.AttributeContent.TypeId == 1) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.Text != null) {
                        scope.info.Value.Attribute.CorestatValues = "Text:" + items.Value.Attribute.AttributeContent.Value.Text.value;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 2) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    //scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.Choices != null) {
                        scope.info.Value.Attribute.CorestatValues = "Choices:" + items.Value.Attribute.AttributeContent.Value.Choices;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent.AttributeValue = "Choices:" + items.Value.Attribute.AttributeContent.Value.Choices;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 3) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.YesOrNo != null) {
                        scope.info.Value.Attribute.CorestatValues = "On/Off:" + items.Value.Attribute.AttributeContent.Value.YesOrNo.value;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 4) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.OnOrOff != null) {
                        scope.info.Value.Attribute.CorestatValues = "Yes/No:" + items.Value.Attribute.AttributeContent.Value.OnOrOff.value;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 5) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.ValueAndSubValue != null) {
                        scope.info.Value.Attribute.CorestatValues = "Value:" + items.Value.Attribute.AttributeContent.Value.ValueAndSubValue.value + " " + "Sub Value:" + items.Value.Attribute.AttributeContent.Value.ValueAndSubValue.subvalue;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 6) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue != null) {
                        scope.info.Value.Attribute.CorestatValues = "Current Value:" + items.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue.CurrentValue + " " + "Max Value:" + items.Value.Attribute.AttributeContent.Value.CurrentAndMaxValue.MaxValue;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 7) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.Weight != null) {
                        scope.info.Value.Attribute.CorestatValues = "Weight:" + items.Value.Attribute.AttributeContent.Value.Weight.value + items.Value.Attribute.AttributeContent.Weight.units.selectedUnit;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 8) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.Image != null) {
                        scope.info.Value.Attribute.CorestatValues = items.Value.Attribute.AttributeContent.Value.Image.image;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 12) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.Height != null) {
                        scope.info.Value.Attribute.CorestatValues = "Height:" + items.Value.Attribute.AttributeContent.Value.Height.value + items.Value.Attribute.AttributeContent.Height.units.selectedUnit;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 13) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.Volume != null) {
                        scope.info.Value.Attribute.CorestatValues = "Volume:" + items.Value.Attribute.AttributeContent.Value.Volume.value + "  " + items.Value.Attribute.AttributeContent.Volume.units.selectedUnit;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 14) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.Number != null) {
                        scope.info.Value.Attribute.CorestatValues = "Number:" + items.Value.Attribute.AttributeContent.Value.Number.value;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 15) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.DefaultDice != null) {
                        scope.info.Value.Attribute.CorestatValues = "Dice:" + items.Value.Attribute.AttributeContent.Value.DefaultDice.value;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent = items.Value.Attribute.AttributeContent;
                }
                else if (items.Value.Attribute.AttributeContent.TypeId == 19) {
                    scope.info.Value.Attribute.CoreStatValue = items.Value.Attribute.AttributeContent.Value;
                    scope.info.Value.Attribute.TypeId = items.Value.Attribute.AttributeContent.TypeId;
                    if (items.Value.Attribute.AttributeContent.Value.TextArea != null) {
                        scope.info.Value.Attribute.CorestatValues = items.Value.Attribute.AttributeContent.Value.TextArea.value;
                    }
                    else {
                        scope.info.Value.Attribute.CorestatValues = "";
                    }
                    scope.info.Value.Attribute.AttributeContent.AttributeValue = items.Value.Attribute.AttributeContent.Value.TextArea.value;
                }
            }

            scope.ShowAttributeContent = function () {
                var dlg = dialogs.create('/views/dialogs/attributetilecontent.html', 'ShowAllTileContent',
                    { scope: scope.info }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        scope.info = res;
                    }
                });
            }

            scope.EditAttributeTile = function () {
            
                var layoutdata = rulesetDataShareService.getLayoutData();
                var corestatvalues = layoutdata.CorestatValues;
                scope.info.CorestatValues = angular.isUndefined(corestatvalues) == false ? corestatvalues : [];
                for (var i = 0; i < scope.info.CorestatValues.length; i++) {
                    if (scope.info.CorestatValues[i].Name != null) {
                        if (scope.info.Value.Attribute.Name == scope.info.CorestatValues[i].Name) {
                            scope.info.Value.Attribute.SelectedCorestatValue = scope.info.CorestatValues[i].Name;
                       }
                    }
                }
                var dlg = dialogs.create('/views/dialogs/tile-editor-3.html', 'NoteTile',
                    { scope: scope.info }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        if (res.Styles != null) {
                            res.Styles.backgroundColor = $("#bckcolor").val();
                        }
                        rulesetDataShareService.setTilelst(res);
                        scope.info = res;
                    }
                });
            }

            scope.RemoveTile = function () {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    "Are you sure you want to delete " + scope.info.Value.Attribute.Name,
                    { size: 'sm' }
                );

                dlg.result.then(
                    function (btn) {
                        tileService.deleteTile(scope.info.TileId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                //  scope.info.splice(scope.info.TileId);
                                toaster.pop('success', "Tile deleted Successfully.");

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
                );
            }
        };

        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                info: '=',
                useoredit: '='
            }
        }

    }]);

    app.directive('rpgsmithlinktype', ['$compile', 'dialogs', 'rulesetDataShareService', function ($compile, dialogs, rulesetDataShareService) {
		var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-6"><div class="form-group"><label for="colorList">Color*</label><ul id="colorList" class="input-color-items"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor" checked="checked"><i class="icon input-color-2"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-4"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-6"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-8"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-10"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-12"></i></label></li><li class="form-check"><label class="form-check-label"><i class="icon input-color-custom" role="button" data-dismiss="modal" data-toggle="modal" data-target="#colorSelectionPopup"></i></label></li></ul></div><fieldset class="form-group input-switch input-switch-dual"><legend></legend><ul class="input-switch-items"><li class="form-check"><label class="form-check-label">Title</label></li><li class="form-check"><input type="text" class="form-control col-md-8" ng-model="info.Value.Link.Title" value="" /></li></ul></fieldset></div></div><div class="form-row"><div class="col"><!-- Link property switch --><fieldset class="form-group input-switch"><legend>Property*</legend><ul class="input-switch-items"><li class="form-check" ><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperty" ng-click="ShowItemsDropdown()" value="Items" ng-model="info.Value.Link.SelectedPropertyValue"><span>Items</span></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperty" ng-click="ShowSpellsDropdown()" value="Spells" ng-model="info.Value.Link.SelectedPropertyValue"><span>Spells</span></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperty" ng-click="ShowAbilitiesDropdown()" value="Abilities" ng-model="info.Value.Link.SelectedPropertyValue"><span>Abilities</span></label></li></ul></fieldset><fieldset class="form-group input-list input-list-wrap properties"><ul class="input-list-items"><li class="form-check" ng-show="IsItemVisible" ng-repeat="item in LinkTileItems"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperties" value="{{item.ItemProperties[0].Value.Text.value}}" ng-model="$parent.info.Value.Link.SelectedProperty" ng-click="SetContentType(1)"><span><em>{{ item.ItemProperties[0].Value.Text.value }}</em><i class="icon"></i></span></label></li><li class="form-check" ng-show="IsSpellVisible" ng-repeat="spell in LinkTileSpells"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperties" value="{{spell.SpellProperties[0].Value.Text.value}}"  ng-model="$parent.info.Value.Link.SelectedProperty"><span><img ng-src="{{info.Value.Link.SelectedPropertyValueImage}}" alt=""><em>{{spell.SpellProperties[0].Value.Text.value}}</em><i class="icon"></i></span></label></li><li class="form-check" ng-show="IsAbilityVisible" ng-repeat="ability in LinkTileAbilities"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperties" value="{{ability.AbilityProperties[0].Value.Text.value}}" ng-model="$parent.info.Value.Link.SelectedProperty"><span><img ng-src="{{info.Value.Link.SelectedPropertyValueImage}}" alt=""><em>{{ability.AbilityProperties[0].Value.Text.value}}</em><i class="icon"></i></span></label></li></ul><p style="text-align:center;" ng-show="ShowContent">Content Not Available</p></fieldset></div></div></form>';
		var templateUrlUse = '<div class="NoteTile" style="background-color: {{info.Styles.titlebackgroundcolor}};height: 50px;"> <span ng-click="EditLinkTile()" style="color:{{info.Styles.titletextcolor}};">{{info.Value.Link.Title}}</span></div><div class="text_align" style="text-align:center;width:100%;height:90%;background-size: 100% 100%;background-image: url(&#34;{{info.Value.Link.SelectedPropertyValueImage}}&#34;)"> </div>';

        var getTemplate = function (useoredit) {
            var template = '';

            switch (useoredit) {
                case 1:
                    template = templateUrlEdit;
                    break;
                case 0:
                    template = templateUrlUse;
                    break;
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            var items = angular.copy(scope.info);

            element.html(getTemplate(scope.useoredit));

            $compile(element.contents())(scope);
            scope.IsItemVisible = true;
            scope.IsSpellVisible = false;
            scope.IsAbilityVisible = false;
            scope.LinkTileItems = [];
            scope.LinkTileSpells = [];
            scope.LinkTileAbilities = [];
            //if (angular.equals({}, rulesetDataShareService.getRulesetData()) == false) {
            //    scope.ContentfullScope = getRulesetData
            //}
            if (angular.isUndefined(scope.fullscope) == false) {
                if (scope.fullscope.Items != null) {
                    for (var i = 0; i < scope.fullscope.Items.length; i++) {
                        scope.LinkTileItems.push(scope.fullscope.Items[i]);
                    }
                }
                if (scope.fullscope.Spells != null) {
                    for (var i = 0; i < scope.fullscope.Spells.length; i++) {
                        scope.LinkTileSpells.push(scope.fullscope.Spells[i]);
                    }
                }
                if (scope.fullscope.Abilities != null) {
                    for (var i = 0; i < scope.fullscope.Abilities.length; i++) {
                        scope.LinkTileAbilities.push(scope.fullscope.Abilities[i]);
                    }
                }
            }
            //else {
            //    if (scope.ContentfullScope.Items != null) {
            //        for (var i = 0; i < scope.ContentfullScope.Items.length; i++) {
            //            scope.LinkTileItems.push(scope.ContentfullScope.Items[i]);
            //        }
            //    }
            //    if (scope.ContentfullScope.Spells != null) {
            //        for (var i = 0; i < scope.ContentfullScope.Spells.length; i++) {
            //            scope.LinkTileSpells.push(scope.ContentfullScope.Spells[i]);
            //        }
            //    }
            //    if (scope.ContentfullScope.Abilities != null) {
            //        for (var i = 0; i < scope.ContentfullScope.Abilities.length; i++) {
            //            scope.LinkTileAbilities.push(scope.ContentfullScope.Abilities[i]);
            //        }
            //    }
            //}
            //if (items.Mode == "Edit") {
                if (items.Value.Link.SelectedPropertyValue == "Items") {
                    scope.IsItemVisible = true;
                    scope.IsSpellVisible = false;
                    scope.IsAbilityVisible = false;
                }
                if (items.Value.Link.SelectedPropertyValue == "Spells") {
                    scope.IsItemVisible = false;
                    scope.IsSpellVisible = true;
                    scope.IsAbilityVisible = false;
                }
                if (items.Value.Link.SelectedPropertyValue == "Abilities") {
                    scope.IsItemVisible = false;
                    scope.IsSpellVisible = false;
                    scope.IsAbilityVisible = true;
                }
            //}
            scope.SetContentType = function (contentType) {
                if (contentType == 1) {
                    scope.info.Value.Link.SelectedPropertyValue = "Items";
                } else if (contentType == 2) {
                    scope.info.Value.Link.SelectedPropertyValue = "Spells";
                }
                else if (contentType == 3) {
                    scope.info.Value.Link.SelectedPropertyValue = "Abilities";
                }
            }
            scope.ShowItemsDropdown = function () {
                scope.IsItemVisible = true;
                scope.IsSpellVisible = false;
                scope.IsAbilityVisible = false;
                if (scope.LinkTileItems.length <= 0)
                {
                    scope.ShowContent = true;
                }
            }
            scope.ShowSpellsDropdown = function () {
                scope.IsItemVisible = false;
                scope.IsSpellVisible = true;
                scope.IsAbilityVisible = false;
                if (scope.LinkTileSpells.length <= 0) {
                    scope.ShowContent = true;
                }
            }
            scope.ShowAbilitiesDropdown = function () {
                scope.IsItemVisible = false;
                scope.IsSpellVisible = false;
                scope.IsAbilityVisible = true;
                if (scope.LinkTileAbilities.length <= 0) {
                    scope.ShowContent = true;
                }
            }
            scope.newstyles = function () {

                return {
                    'background-size': '100% 100%',
                    'background-repeat': 'no-repeat',
                    'width': '100%',
                    'height': '100%'
                }

                //return {
                //    'background-color': 'transparent'
                //}

            };
            //scope.Items = [];
            //scope.spells = [];
            //scope.Abilities = [];
            //for (var i = 0; i < items.LinkTileProperties.Items.length; i++) {
            //    scope.Items.push(items.LinkTileProperties.Items[i].ItemProperties[0].Value.Text.value)
            //}
            //for (var i = 0; i < items.LinkTileProperties.Spells.length; i++) {
            //    scope.spells.push(items.LinkTileProperties.Spells[i].SpellProperties[0].Value.Text.value)
            //}
            //for (var i = 0; i < items.LinkTileProperties.Abilities.length; i++) {
            //    scope.Abilities.push(items.LinkTileProperties.Abilities[i].AbilityProperties[0].Value.Text.value)
            //}


            scope.ShowAllContent = function () {
                var IsItem = false; var IsSpell = false; var IsAbility = false;
                if (scope.info.Value.Link.SelectedPropertyValue == "Items") {
                    for (var i = 0; i < scope.LinkTileItems.length; i++) {
                        var data = scope.LinkTileItems[i];
                        if (scope.info.Value.Link.SelectedProperty == data.ItemProperties[0].Value.Text.value) {
                            IsItem = true;
                        }
                    }
                }
                else if (scope.info.Value.Link.SelectedPropertyValue == "Spells") {
                    for (var i = 0; i < scope.LinkTileSpells.length; i++) {
                        var data = scope.LinkTileSpells[i];
                        if (scope.info.Value.Link.SelectedProperty == data.SpellProperties[0].Value.Text.value) {
                            IsSpell = true;
                        }
                    }
                }
                else if (scope.info.Value.Link.SelectedPropertyValue == "Abilities") {
                    for (var i = 0; i < scope.LinkTileAbilities.length; i++) {
                        var data = scope.LinkTileAbilities[i];
                        if (scope.info.Value.Link.SelectedProperty == data.AbilityProperties[0].Value.Text.value) {
                            IsAbility = true;
                        }
                    }
                }
                if (IsItem == true) {
                    var ItemProperties = angular.isUndefined(scope.info.Value.Link.Content) == false ? scope.info.Value.Link.Content : data;
                    var dlg = dialogs.create('/views/dialogs/allitemcontent.html', 'ShowItems',
                        { scope: ItemProperties }
                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //scope.info = res;
                        }
                    });
                }
                else if (IsSpell == true) {
                    var SpellProperties = angular.isUndefined(scope.info.Value.Link.Content) == false ? scope.info.Value.Link.Content : data;
                    var dlg = dialogs.create('/views/dialogs/allspellcontent.html', 'ShowItems',
                        { scope: SpellProperties }
                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //scope.info = res;
                        }
                    });
                }
                else if (IsAbility == true) {
                    var AbilityProperties = angular.isUndefined(scope.info.Value.Link.Content) == false ? scope.info.Value.Link.Content : data;
                    var dlg = dialogs.create('/views/dialogs/allabilitycontent.html', 'ShowItems',
                        { scope: AbilityProperties }
                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //scope.info = res;
                        }
                    });
                }
            }
            scope.EditLinkTile = function () {
                var dlg = dialogs.create('/views/dialogs/tile-editor-4.html', 'NoteTile',
                    { scope: scope.info, fullscope: scope.fullscope }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        if (res.Styles != null) {
                            res.Styles.backgroundColor = $("#bckcolor").val();
                        }
                        rulesetDataShareService.setTilelst(res);
                        scope.info = res;

                    }
                });
            }
            scope.RemoveTile = function () {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    "Are you sure you want to delete " + scope.info.Value.Link.Name,
                    { size: 'sm' }
                );

                dlg.result.then(
                    function (btn) {
                        tileService.deleteTile(scope.info.TileId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                // scope.info.splice(scope.info.TileId);
                                toaster.pop('success', "Tile deleted Successfully.");

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
                );
            }
        };

        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                info: '=',
                useoredit: '=',
                fullscope:'='
            }
        }

    }]);

    app.directive('rpgsmithexecutetype', ['$compile', 'dialogs', 'rulesetDataShareService', function ($compile, dialogs, rulesetDataShareService) {

        var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-6"><fieldset class="form-group input-switch input-switch-dual"><legend></legend><ul class="input-switch-items"><li class="form-check"><label class="form-check-label">Title</label></li><li class="form-check"><input type="text" class="form-control col-md-8" ng-model="info.Value.Execute.Title" value="" /></li></ul></fieldset></div></div><div class="form-row"><div class="col"><!-- Link property switch --><fieldset class="form-group input-switch"><legend>Property*</legend><ul class="input-switch-items"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperty" ng-click="ShowItemsDropdown()" value="Items" ng-model="info.Value.Execute.SelectedPropertyValue"><span>Items</span></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperty" ng-click="ShowSpellsDropdown()" value="Spells" ng-model="info.Value.Execute.SelectedPropertyValue"><span>Spells</span></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperty" ng-click="ShowAbilitiesDropdown()" value="Abilities" ng-model="info.Value.Execute.SelectedPropertyValue"><span>Abilities</span></label></li></ul></fieldset><fieldset class="form-group input-list input-list-wrap properties"><ul class="input-list-items"><li class="form-check" ng-show="IsItemVisible" ng-repeat="item in ExecuteTileItems"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperties" value="{{item.ItemProperties[0].Value.Text.value}}" ng-model="$parent.info.Value.Execute.SelectedProperty" ng-click="SetContentType(1)"><span><em>{{ item.ItemProperties[0].Value.Text.value }}</em><i class="icon"></i></span></label></li><li class="form-check" ng-show="IsSpellVisible" ng-repeat="spell in ExecuteTileSpells"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperties" value="{{spell.SpellProperties[0].Value.Text.value}}" ng-model="$parent.info.Value.Execute.SelectedProperty"><span><img ng-src="{{info.Value.Link.SelectedPropertyValueImage}}" alt=""><em>{{ spell.SpellProperties[0].Value.Text.value }}</em><i class="icon"></i></span></label></li><li class="form-check" ng-show="IsAbilityVisible" ng-repeat="ability in ExecuteTileAbilities"><label class="form-check-label"><input class="form-check-input" type="radio" name="newLinkProperties" value="{{ability.AbilityProperties[0].Value.Text.value}}" ng-model="$parent.info.Value.Execute.SelectedProperty"><span><img ng-src="{{info.Value.Link.SelectedPropertyValueImage}}" alt=""><em>{{ ability.AbilityProperties[0].Value.Text.value }}</em><i class="icon"></i></span></label></li></ul><p style="text-align:center;" ng-show="ShowContent">Content Not Available</p></fieldset></div></div></form>';
		var templateUrlUse = '<div class="NoteTile" style="background-color: {{info.Styles.titlebackgroundcolor}};height: 50px"><span ng-click="EditExecuteTile()" class="text_design"><p style="color:{{info.Styles.titletextcolor}};">{{info.Value.Execute.Name}}</p></span></div><div class="text_align" style="text-align:center"> <img src="{{info.Value.Execute.SelectedPropertyValueImage}}" ng-style="newstyles()" class="img-resposive ng-pristine ng-untouched ng-valid ng-empty" ng-click="ShowAllContent()"></div>';

        //var templateUrlEdit = '<div class="row label-text-left"><div class="col-md-offset-2 col-md-8"><div class="form-group col-md-12"><label class="control-label col-md-4">Title</label><div class="col-md-8"><input type="text" class="form-control col-md-8" ng-model="info.Value.Execute.Title" value="" /></div></div><div class="form-group col-md-12"><label class="control-label col-md-4">Select Property</label><div class="col-md-8"><label class="radio-inline"><input type="radio" name="item" ng-model="info.Value.Execute.SelectedProperty" value="Items"  ng-click="ShowItemsDropdown()" />Items</label><label class="radio-inline"><input type="radio" name="item" ng-model="info.Value.Execute.SelectedProperty" value="Spells" ng-click="ShowSpellsDropdown()" />Spells</label><label class="radio-inline"><input type="radio" name="item" ng-model="info.Value.Execute.SelectedProperty" value="Abilities" ng-click="ShowAbilitiesDropdown()" />Abilities</label></div></div>' +
        //    '<div class="form-group col-md-12"><label class="control-label col-md-4">Select Property Value</label><div ng-show="IsItemVisible" class="col-md-8"><select class="form-control col-md-8" ng-options="item for item in Items" ng-model="info.Value.Execute.SelectedPropertyValue"><option value="">--Select Items--</option></select></div><div ng-show="IsSpellVisible" class="col-md-8"><select class="form-control col-md-5" ng-options="spell for spell in spells" ng-model="info.Value.Execute.SelectedPropertyValue"><option value="">--Select Spells--</option></select></div><div ng-show="IsAbilityVisible" class="col-md-8"><select class="form-control col-md-5" ng-options="ability for ability in Abilities" ng-model="info.Value.Execute.SelectedPropertyValue"><option value="">--Select Abilities--</option></select></div></div></div></div></div>';
        //var templateUrlUse = '<div class="NoteTile"> <span ng-click="EditExecuteTile()"><i class="fa fa-edit"></i></span><span class="text_design"><p>{{info.Value.Execute.Title}}</p></span></div><div class="text_align" style="text-align:center"> <img ng-src="{{info.Value.Execute.SelectedPropertyValue}}" ng-style="newstyles()" class="img-resposive ng-pristine ng-untouched ng-valid ng-empty" ng-click="ShowAllContent()"></div>';

        var getTemplate = function (useoredit) {
            var template = '';

            switch (useoredit) {
                case 1:
                    template = templateUrlEdit;
                    break;
                case 0:
                    template = templateUrlUse;
                    break;
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            var items = angular.copy(scope.info);

            element.html(getTemplate(scope.useoredit));

            $compile(element.contents())(scope);
            scope.IsItemVisible = true;
            scope.IsSpellVisible = false;
            scope.IsAbilityVisible = false;
            scope.ExecuteTileItems = [];
            scope.ExecuteTileSpells = [];
            scope.ExecuteTileAbilities = [];
            // scope.fullscope = rulesetDataShareService.getRulesetData();
            //if (angular.equals({}, rulesetDataShareService.getRulesetData()) == false) {
            //    scope.ContentfullScope = rulesetDataShareService.getRulesetData();
            //}
            if (angular.isUndefined(scope.fullscope) == false) {
                if (scope.fullscope.Items != null) {
                    for (var i = 0; i < scope.fullscope.Items.length; i++) {
                        scope.ExecuteTileItems.push(scope.fullscope.Items[i]);
                    }
                }
                if (scope.fullscope.Spells != null) {
                    for (var i = 0; i < scope.fullscope.Spells.length; i++) {
                        scope.ExecuteTileSpells.push(scope.fullscope.Spells[i]);
                    }
                }
                if (scope.fullscope.Abilities != null) {
                    for (var i = 0; i < scope.fullscope.Abilities.length; i++) {
                        scope.ExecuteTileAbilities.push(scope.fullscope.Abilities[i]);
                    }
                }
            }
            //else {
            //    if (scope.ContentfullScope.Items != null) {
            //        for (var i = 0; i < scope.ContentfullScope.Items.length; i++) {
            //            scope.ExecuteTileItems.push(scope.ContentfullScope.Items[i]);
            //        }
            //    }
            //    if (scope.ContentfullScope.Spells != null) {
            //        for (var i = 0; i < scope.ContentfullScope.Spells.length; i++) {
            //            scope.ExecuteTileSpells.push(scope.ContentfullScope.Spells[i]);
            //        }
            //    }
            //    if (scope.ContentfullScope.Abilities != null) {
            //        for (var i = 0; i < scope.ContentfullScope.Abilities.length; i++) {
            //            scope.ExecuteTileAbilities.push(scope.ContentfullScope.Abilities[i]);
            //        }
            //    }
            //}
            //if (items.Mode == "Edit") {
                if (items.Value.Execute.SelectedPropertyValue == "Items") {
                    scope.IsItemVisible = true;
                    scope.IsSpellVisible = false;
                    scope.IsAbilityVisible = false;
                }
                if (items.Value.Execute.SelectedPropertyValue == "Spells") {
                    scope.IsItemVisible = false;
                    scope.IsSpellVisible = true;
                    scope.IsAbilityVisible = false;
                }
                if (items.Value.Execute.SelectedPropertyValue == "Abilities") {
                    scope.IsItemVisible = false;
                    scope.IsSpellVisible = false;
                    scope.IsAbilityVisible = true;
                }
            //}
                scope.ShowItemsDropdown = function () {
                    scope.IsItemVisible = true;
                    scope.IsSpellVisible = false;
                    scope.IsAbilityVisible = false;
                    if (scope.LinkTileItems.length <= 0) {
                        scope.ShowContent = true;
                    }
                }
                scope.ShowSpellsDropdown = function () {
                    scope.IsItemVisible = false;
                    scope.IsSpellVisible = true;
                    scope.IsAbilityVisible = false;
                    if (scope.LinkTileSpells.length <= 0) {
                        scope.ShowContent = true;
                    }
                }
                scope.ShowAbilitiesDropdown = function () {
                    scope.IsItemVisible = false;
                    scope.IsSpellVisible = false;
                    scope.IsAbilityVisible = true;
                    if (scope.LinkTileAbilities.length <= 0) {
                        scope.ShowContent = true;
                    }
                }
            scope.newstyles = function () {

                return {
                    'background-size': '100% 100%',
                    'background-repeat': 'no-repeat',
                    'width': '120px',
                    'height': '120px'
                }

                //return {
                //    'background-color': 'transparent'
                //}

            };
            //scope.Items = [];
            //scope.spells = [];
            //scope.Abilities = [];
            //for (var i = 0; i < items.ExecuteTileProperties.Items.length; i++) {
            //    scope.Items.push(items.ExecuteTileProperties.Items[i].ItemProperties[0].Value.Text.value)
            //}
            //for (var i = 0; i < items.ExecuteTileProperties.Spells.length; i++) {
            //    scope.spells.push(items.ExecuteTileProperties.Spells[i].SpellProperties[0].Value.Text.value)
            //}
            //for (var i = 0; i < items.ExecuteTileProperties.Abilities.length; i++) {
            //    scope.Abilities.push(items.ExecuteTileProperties.Abilities[i].AbilityProperties[0].Value.Text.value)
            //}
            scope.ShowAllContent = function () {
                var IsItem = false; var IsSpell = false; var IsAbility = false;
                if (scope.info.Value.Execute.SelectedPropertyValue == "Items") {
                    for (var i = 0; i < scope.ExecuteTileItems.length; i++) {
                        var data = scope.ExecuteTileItems[i];
                        if (scope.info.Value.Execute.SelectedProperty == data.ItemProperties[0].Value.Text.value) {
                            IsItem = true;
                        }
                    }
                }
                else if (scope.info.Value.Execute.SelectedPropertyValue == "Spells") {
                    for (var i = 0; i < scope.ExecuteTileSpells.length; i++) {
                        var data = scope.ExecuteTileSpells[i];
                        if (scope.info.Value.Execute.SelectedProperty == data.SpellProperties[0].Value.Text.value) {
                            IsSpell = true;
                        }
                    }
                }
                else if (scope.info.Value.Execute.SelectedPropertyValue == "Abilities") {
                    for (var i = 0; i < scope.ExecuteTileAbilities.length; i++) {
                        var data = scope.ExecuteTileAbilities[i];
                        if (scope.info.Value.Execute.SelectedProperty == data.AbilityProperties[0].Value.Text.value) {
                            IsAbility = true;
                        }
                    }
                }
                if (IsItem == true) {
                    var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                        { scope: scope.info.Value.Execute.Content, mode: 2 }
                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //scope.info = res;
                        }
                    });
                }
                else if (IsSpell == true) {
                    var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                        { scope: scope.info.Value.Execute.Content, mode: 2 }
                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //scope.info = res;
                        }
                    });
                }
                else if (IsAbility == true) {
                    var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                        { scope: scope.info.Value.Execute.Content, mode: 2 }
                    );
                    dlg.result.then(function (res) {
                        if (res != "cancel") {
                            //scope.info = res;
                        }
                    });
                }
            }
            scope.EditExecuteTile = function () {
                //scope.info.Mode = "Edit";
                //scope.FullScope = scope.fullscope;
                //scope.info.Value.Execute.SelectedPropertyValue = scope.info.Value.Execute.SelectedPropertyValue;
                var dlg = dialogs.create('/views/dialogs/tile-editor-5.html', 'NoteTile',
                    { scope: scope.info, fullscope: scope.fullscope }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        if (res.Styles != null) {
                            res.Styles.backgroundColor = $("#bckcolor").val();
                        }
                        rulesetDataShareService.setTilelst(res);
                        scope.info = res;
                    }
                });
            }
            scope.RemoveTile = function () {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    "Are you sure you want to delete " + scope.info.Value.Execute.Name,
                    { size: 'sm' }
                );

                dlg.result.then(
                    function (btn) {
                        tileService.deleteTile(scope.info.TileId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                // scope.info.splice(scope.info.TileId);
                                toaster.pop('success', "Tile deleted Successfully.");

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
                );
            }
        };

        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                info: '=',
                fullscope: '=',
                useoredit: '='
            }
        }

    }]);

    app.directive('rpgsmithcommandtype', ['$compile', 'dialogs', 'rulesetDataShareService', function ($compile, dialogs, rulesetDataShareService) {
		var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-6"><div class="form-group"><label for="newCommandTitle">Title</label><input type="text" id="newCommandTitle" class="form-control" placeholder="Enter command title" ng-model="info.Value.Command.Name"></div><div class="form-group"><label for="newCommandCmd">Command</label><span class="input-group-btn"><button type="button" title="Show Dice" data-toggle="tooltip" class="btn icon icon-dice icon-rsi btn-simple-primary" ng-click="defaultDiceSelect()" ng-model="info.Value.Command.command"/></button></span><input type="text" id="newCommandCmd" ng-model="info.Value.Command.command" class="form-control" placeholder="Enter the command"></div><div class="form-group"><label for="colorList">Color*</label><ul id="colorList" class="input-color-items"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor" checked="checked"><i class="icon input-color-2"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-4"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-6"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-8"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-10"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-12"></i></label></li><li class="form-check"><label class="form-check-label"><i class="icon input-color-custom" role="button" data-dismiss="modal" data-toggle="modal" data-target="#colorSelectionPopup"></i></label></li></ul></div></div><div class="col-12 col-md-6"><div class="form-group input-image"><label for="newCommandImage">Image</label><div class="input-image-control-wrapper"><div class="form-group input-image"><label for="newImageFile"></label><div class="input-image-control-wrapper"><div class="input-image-note icon icon-upload"><span ng-model="info.Value.Command.ImagePath">Click here to upload.</span><small>(320 x 320 px)</small></div><input type="file"  class="form-control-file"  onchange="angular.element(this).scope().CommandImageUpload(this)" accept="x-png,gif,jpeg"></div></div></form>';

		var templateUrlUse = '<div class="NoteTile" style="background-color: {{info.Styles.titlebackgroundcolor}};height: 50px"><span ng-click="EditCommandTile()" class="text_design"><p style="color:{{info.Styles.titletextcolor}};">{{info.Value.Command.Name}}</p></span></div><div class="text_align"><img src="{{info.Value.Command.ImagePath}}" ng-style="newstyles()" class="img-resposive ng-pristine ng-untouched ng-valid ng-empty" ng-click="CommandRun()"></div>';
        
        var getTemplate = function (useoredit) {
            var template = '';

            switch (useoredit) {
                case 1:
                    template = templateUrlEdit;
                    break;
                case 0:
                    template = templateUrlUse;
                    break;
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            var items = angular.copy(scope.info);

            element.html(getTemplate(scope.useoredit));

            $compile(element.contents())(scope);
            //scope.ValidateCommand = function ()
            //{
            //    debugger;
            //    var command = scope.info.Value.Command.Command;
            //    if (!dicenotationvalidator(command))
            //    {
            //        toaster.pop('Warning', "Invalid Command");
            //    }


            //}
            scope.CommandImageUpload = function (input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('#commandImage')
                            .attr("Src", e.target.result)
                            .width(120)
                            .height(120);
                        scope.info.Value.Command.ImagePath = e.target.result;
                    };

                    reader.readAsDataURL(input.files[0]);
                }

            }
            scope.defaultDiceSelect = function () {
                var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                    { "mode": 1, scope: scope.info.Value.Command.command }
                );
                dlg.result.then(function (res) {
                    //    scope.dice = res;
                    scope.info.Value.Command.command = res;
                });
            };
            scope.newstyles = function () {

                return {
                    'background-size': '100% 100%',
                    'background-repeat': 'no-repeat',
                    'width': '120px',
                    'height': '120px'
                }

                //return {
                //    'background-color': 'transparent'
                //}

            };
            scope.CommandRun = function () {
                var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
                    { scope: scope.info, mode: 2 }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        //  scope.info = res;
                    }
                });

            }
            scope.EditCommandTile = function () {
                var dlg = dialogs.create('/views/dialogs/tile-editor-6.html', 'NoteTile',
                    { scope: scope.info }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        if (res.Styles != null) {
                            res.Styles.backgroundColor = $("#bckcolor").val();
                        }
                        if (res.Styles != null) {
                            res.Styles.backgroundColor = $("#bckcolor").val();
                        }
                        rulesetDataShareService.setTilelst(res);
                        scope.info = res;
                    }
                });
            }
            scope.RemoveTile = function () {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    "Are you sure you want to delete " + scope.info.Value.Command.Name,
                    { size: 'sm' }
                );

                dlg.result.then(
                    function (btn) {
                        tileService.deleteTile(scope.info.TileId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                toaster.pop('success', "Tile deleted Successfully.");

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
                );
            }
        };

        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                info: '=',
                useoredit: '='
            }
        }

    }]);

    app.directive('rpgsmithimagetype', ['$compile', 'dialogs', 'rulesetDataShareService', function ($compile, dialogs, rulesetDataShareService) {
        //var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-6"><div class="form-group"><label for="newImageTitle">Title</label><input type="text" id="newImageTitle" class="form-control" placeholder="Enter image title" ng-model="info.Value.Imagetile.Name"></div><div class="form-group"><label for="newImageDescription">Description</label><input type="text" id="newImageDescription" class="form-control" placeholder="Enter image description"></div></div><div class="col-12 col-md-6"><div class="form-group input-image"><label for="newCommandImage">Image</label><div class="input-image-control-wrapper"><div class="form-group input-image"><label for="newImageFile"></label><div class="input-image-control-wrapper"><div class="input-image-note icon icon-upload"><span ng-model="info.Value.Imagetile.Imagepath">Click here to upload.</span><small>(320 x 320 px)</small></div><input type="file"  class="form-control-file"  onchange="angular.element(this).scope().CommandImageUpload(this)" accept="x-png,gif,jpeg"></div></div></form>'
		var templateUrlEdit = '<form><div class="form-row"><div class="col-12 col-md-6"><div class="form-group"><label for="newImageTitle">Title</label><input type="text" id="newImageTitle" class="form-control" placeholder="Enter image title" ng-model="info.Value.Imagetile.Name"></div><div class="form-group"><label for="newImageDescription">Description</label><textarea class="form-control" rows="10" ng-model = "info.Value.Imagetile.Description" id="newImageDescription" class="form-control" placeholder="Enter image description"></textarea></div><div class="form-group"><label for="colorList">Color*</label><ul id="colorList" class="input-color-items"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor" checked="checked"><i class="icon input-color-2"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-4"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-6"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-8"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-10"></i></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="newNoteTileColor"><i class="icon input-color-12"></i></label></li><li class="form-check"><label class="form-check-label"><i class="icon input-color-custom" role="button" data-dismiss="modal" data-toggle="modal" data-target="#colorSelectionPopup"></i></label></li></ul></div></div><div class="col-12 col-md-6"><div class="form-group input-image"><label for="newCommandImage">Image</label><div class="input-image-control-wrapper"><div class="form-group input-image"><label for="newImageFile"></label><div class="input-image-control-wrapper"><div class="input-image-note icon icon-upload"><span ng-model="info.Value.Imagetile.Imagepath">Click here to upload.</span><small>(320 x 320 px)</small></div><input type="file"  class="form-control-file"  onchange="angular.element(this).scope().CommandImageUpload(this)" accept="x-png,gif,jpeg"></div></div></form>'
		var templateUrlUse = '<div class="NoteTile" style="background-color: {{info.Styles.titlebackgroundcolor}}height: 50px;"><span ng-click="EditImageTile()" class="text_design"><p style="color:{{info.Styles.titletextcolor}};">{{info.Value.Imagetile.Name}}</p></span></div><div class="text_align"><img ng-src="{{info.Value.Imagetile.Imagepath}}" class="img-resposive img_center" width="120" height="120" ng-click="showImage()" /></div>';

        var getTemplate = function (useoredit) {
            var template = '';

            switch (useoredit) {
                case 1:
                    template = templateUrlEdit;
                    break;
                case 0:
                    template = templateUrlUse;
                    break;
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            var items = angular.copy(scope.info);

            element.html(getTemplate(scope.useoredit));

            $compile(element.contents())(scope);
            scope.getThumbNail = function () {
                if (scope.file)
                    return $scope.file;

                var c = scope.item;
                if (c.id && c.portrait)
                    return '/characterdata/' + c.id + '/' + c.portrait;

                return null;
            }
            scope.CommandImageUpload = function (input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('#commandImage')
                            .attr("Src", e.target.result)
                            .width(120)
                            .height(120);
                        scope.info.Value.Imagetile.Imagepath = e.target.result;
                    };

                    reader.readAsDataURL(input.files[0]);
                }

            }
            scope.showImage = function () {
                var dlg = dialogs.create('/views/dialogs/Imagetilecontent.html', 'ShowAllTileContent',
                    { scope: scope.info }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        scope.info = res;
                    }
                });
            }
            scope.EditImageTile = function () {
                var dlg = dialogs.create('/views/dialogs/tile-editor-7.html', 'NoteTile',
                    { scope: scope.info, Tablist: scope.fullscope }
                );
                dlg.result.then(function (res) {
                    if (res != "cancel") {
                        if (res.Styles != null) {
                            res.Styles.backgroundColor = $("#bckcolor").val();
                        }
                        rulesetDataShareService.setTilelst(res);
                        var index = -1;
                        if (angular.isUndefined(scope.fullscope) == false) {
                            for (var i = 0; i < scope.fullscope.length; i++) {
                                if (scope.fullscope[i].TileId == res.TileId) {
                                    scope.fullscope.splice(i, 1);
                                    scope.fullscope.push(res);
                                }
                            }
                        }
                        scope.info = res;
                    }
                });
            }
            scope.RemoveTile = function () {
                var dlg = dialogs.confirm(
                    'Confirm Delete',
                    "Are you sure you want to delete " + scope.info.Value.Command.Name,
                    { size: 'sm' }
                );

                dlg.result.then(
                    function (btn) {
                        tileService.deleteTile(scope.info.TileId).then(function (data) {
                            if (data.data.StatusCode == 200) {
                                toaster.pop('success', "Tile deleted Successfully.");

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
                );
            }
        };

        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                info: '=',
                fullscope: '=',
                useoredit: '='
            }
        }

    }]);

})();












    