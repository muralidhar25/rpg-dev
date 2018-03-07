(function () {
	'use strict';

	var app = angular.module('rpgsmith-directives');

	app.directive('rpgsmithrulesettype', ['$compile', 'dialogs', function ($compile, dialogs) {
		var templateUrl1_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<input type="text" placeholder="Enter {{info.Name}}" class="form-control" ng-model="info.Value.Text.value" name="input" />';
		'</div>' +
			'</ng-form>';
		var templateUrl1 = '<div class="form-group"><input type="text" ng-model="info.Value.Text.value" class="form-control" placeholder="Enter {{info.Name}} value"></div>';
		//var templateUrl7 = '<select class="form-control inline" ng-options="unit for unit in info.Value.Weight.units.availableUnits" ng-model="info.Units.selectedUnit" >' +
		//    '<option value="">--Select--</option></select>';
		//var templateUrl7_withvalidation =
		//    '<ng-form name="form">' +
		//    '<div class="form-group">' +
		//    '<span ng-show="form.input.$invalid">' +
		//    '</span>' +
		//    '<select class="select_dropdown form-control inline" ng-options="unit for unit in info.Value.Weight.units.availableUnits" ng-model="info.Units.selectedUnit" name="input"  ng-required="info"> ' +
		//    '<option value="">--Select--</option></select>' +
		//    '</div>' +
		//    '</ng-form>';

		var templateUrl7 = '<div class="form-group"><input type="text"  ng-model="info.Units.selectedUnit" placeholder="Enter {{info.Name}}" class="form-control"/></div>';
		var templateUrl7_withvalidation =
			'<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<div class="form-group"><input type="text"  ng-model="info.Units.selectedUnit" placeholder="Enter {{info.Name}}" class="form-control"/></div>' +
			'</div>' +
			'</ng-form>';

		//var templateUrl8 = '<div class="pull-left edit-character-portrait"><img id="GeneralStngImage" ng-src="{{info.Value.Image.image}}" ng-model="info.Value.Image.image" alt="RuleSet Image" ngf-resize="{width: 120, height: 120}" /></div><div class="profile_image"><span>Choose Portrait</span><input type="file" name="file" onchange="angular.element(this).scope().ItemImageUpload(this)" accept="x-png,gif,jpeg"/></div>';
		var templateUrl8 = '<div class="form-group input-image"><div class="input-image-control-wrapper"><div class="input-image-note icon icon-upload"><span ng-model="info.Value.Image.image">Click here to upload.</span><small>(320 x 320 px)</small></div><input type="file"  class="form-control-file"  onchange="angular.element(this).scope().ItemImageUpload(this)" accept="x-png,gif,jpeg"></div></div>';
		var templateUrl8_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<div class="form-group input-image"><div class="input-image-control-wrapper"><div class="input-image-note icon icon-upload"><span ng-model="info.Value.Image.image">Click here to upload.</span><small>(320 x 320 px)</small></div><input type="file"  class="form-control-file"  onchange="angular.element(this).scope().ItemImageUpload(this)" accept="x-png,gif,jpeg"></div></div>';
		//'<div class="pull-left edit-character-portrait"><img id="GeneralStngImage" ng-src="{{info.Value.Image.image}}" name="input" ng-model="info.Value.Image.image" alt="RuleSet Image" ngf-resize="{width: 120, height: 120}" /></div><div class="profile_image"><span>Choose Portrait</span><input type="file" rpgsmithtype="info.Value.Image.image" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" onchange="angular.element(this).scope().ItemImageUpload(this)" accept="x-png,gif,jpeg" /> </div>';
		'</div>' +
			'</ng-form>';


		var templateUrl15 = '<span class="input-group-btn"><button type="button" title="" data-toggle="tooltip" class="btn icon icon-dice icon-rsi btn-simple-primary" data-original-title="Show Dice" ng-click="defaultDiceSelect()"></button></span><input type="text" ng-model="info.Value.DefaultDice.value" class="form-control" placeholder="Select dice">';
		var templateUrl15_withvalidation =
			'<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<span class="input-group-btn"><button type="button" title="" data-toggle="tooltip" class="btn icon icon-dice icon-rsi btn-simple-primary" data-original-title="Show Dice" ng-click="defaultDiceSelect()"></button></span><input type="text" ng-model="info.Value.DefaultDice.value" class="form-control" placeholder="Select dice">';
		'</div>' +
			'</ng-form>';

		var getTemplate = function (contentType, IsMandatory) {
			var template = '';

			switch (contentType) {
				case 1:
					if (IsMandatory == true) {
						template = templateUrl1_withvalidation;
					}
					else {
						template = templateUrl1;
					}
					break;
				case 2:
					template = templateUrl2;
					break;
				case 3:
					template = templateUrl3;
					break;
				case 4:
					template = templateUrl4;
					break;
				case 5:
					template = templateUrl5;
					break;
				case 6:
					template = templateUrl6;
					break;
				case 7:
					if (IsMandatory == true) {
						template = templateUrl7_withvalidation;
					}
					else {
						template = templateUrl7;
					}
					break;
				//case 8:
				//    template = templateUrl8;
				//    break;

				case 8:

					if (IsMandatory == true) {
						template = templateUrl8_withvalidation;
					}
					else {
						template = templateUrl8;
					}
					break;

				case 12:
					template = templateUrl12;
					break;
				case 13:
					template = templateUrl13;
					break;
				case 14:
					template = templateUrl14;
					break;
				case 15:
					if (IsMandatory == true) {
						template = templateUrl15_withvalidation;
					}
					else {
						template = templateUrl15;
					}
					break;
			}

			return template;
		};


		var linker = function (scope, element, attrs) {
			debugger;

			var items = angular.copy(scope.info);

			element.html(getTemplate(items.TypeId, items.IsMandatory));

			$compile(element.contents())(scope);

			scope.defaultDiceSelect = function () {
				debugger;
				var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
					{ "mode": 1 }
				);
				dlg.result.then(function (res) {
					debugger;
					//    scope.dice = res;
					scope.info.Value.DefaultDice.value = res;
				});
			};
			scope.getThumbNail = function () {
				if (scope.file)
					return $scope.file;

				var c = scope.item;
				if (c.id && c.portrait)
					return '/characterdata/' + c.id + '/' + c.portrait;

				return null;
			}
			//scope.uploadFile = function (input) {
			//    debugger;
			//    for (var file = 0; file < input.length; file++) {
			//        scope.info.Value.Image.image = input[file];
			//    }
			//}
			scope.ItemImageUpload = function (input) {
				debugger
				if (input.files && input.files[0]) {
					var reader = new FileReader();
					reader.onload = function (e) {
						$('#GeneralStngImage')
							.attr("Src", e.target.result)
							.width(120)
							.height(120);
						scope.info.Value.Image.image = e.target.result;
					};

					reader.readAsDataURL(input.files[0]);
				}

			}
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