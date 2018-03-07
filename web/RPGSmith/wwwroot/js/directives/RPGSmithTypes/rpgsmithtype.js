(function () {
	'use strict';

	var app = angular.module('rpgsmith-directives');

	app.directive('rpgsmithtype', ['$compile', 'dialogs', function ($compile, dialogs) {

		var templateUrl1_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.itemname.$invalid">' +
			'</span>' +
			'<input type="text" ng-disabled="DisableField" placeholder="Enter {{info.Name}}" name="itemname" id="itemname" class="form-control text-line" ng-model="info.Value.Text.value" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" > ' +
			'</div>' +
			'</ng-form>';

		var templateUrl1 = ' <input type="text" ng-disabled="DisableField" placeholder="Enter {{info.Name}}" class="form-control" ng-model="info.Value.Text.value" />';
		var templateUrl7 = '<input type="number" min=0 class="form-control inline" ng-model="info.Value.Weight.value" placeholder="Enter {{info.Name}}"  ng-disabled="DisableField"  /> ' +
			'<input type="text"  ng-model="info.Value.Weight.units.selectedUnit " ng-disabled="DisableField" placeholder="Enter {{info.Name}}" class="form-control inline_old" readonly/>';
		var templateUrl7_withvalidation =
			'<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.weight.$invalid">' +
			'</span>' +
			'<input type="number" name="weight" id="weight" min=0 class="form-control inline" ng-disabled="DisableField" ng-model="info.Value.Weight.value" placeholder="Enter {{info.Name}}"  ng-disabled="DisableField" /> ' +
			'<input type="text" placeholder="Enter {{info.Name}}" ng-model="info.Value.Weight.units.selectedUnit" class="form-control inline_old" readonly/>' +
			'</div>' +
			'</ng-form>';
		//var templateUrl7 = '<input type="number" class="form-control inline" ng-model="info.Value.Weight.value" placeholder="Weight"/> ' +
		//    '<select class="form-control inline" ng-options="unit for unit in info.Value.Weight.units.availableUnits" ng-model="info.Value.Weight.units.selectedUnit" >' +
		//    '<option value="">--Select--</option></select>';
		//var templateUrl7_withvalidation = '<ng-form name="form">' +
		//    '<div class="form-group">' +
		//    '<span ng-show="form.input.$invalid">' +
		//    '</span>' +
		//    '<input type="number" class="form-control inline" ng-model="info.Value.Weight.value" placeholder="Weight"/> ' +
		//    '<select class="form-control inline" ng-options="unit for unit in info.Value.Weight.units.availableUnits" ng-model="info.Value.Weight.units.selectedUnit" name="input" >' +
		//    '<option value="">--Select--</option></select>';
		//'</div>' +
		//    '</ng-form>';
		var templateUrl3 = '<div class="btn-group" data-toggle=""><label class="btn btn-primary"><input type= "radio" ng-model="info.Value.OnOrOff.value"" value= "On" />On</label > <label class="btn btn-default"><input type="radio" ng-model="info.Value.OnOrOff.value" value="Off" ng-disabled="DisableField" />Off</label></div >';
		var templateUrl3_withvalidation = '<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<div class="btn-group" data-toggle=""><label class="btn btn-primary"><input type="radio"  name="input" ng-model="info.Value.OnOrOff.value"" value= "On" />On</label > <label class="btn btn-default"><input type="radio" ng-model="info.Value.OnOrOff.value" value="Off" ng-disabled="DisableField" />Off</label></div >';
		'</div>' +
			'</ng-form>';

		//var templateUrl4 = '<ul class="input-list-items" style="height:auto;"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="checkbox"><span ng-model="info.Value.YesOrNo.value"><em class="icon icon-with-text icon-visible icon-rsi">{{property.Name}}</em><i class="icon"></i></span></label></li></ul>';

		var templateUrl4 = '<ul class="input-switch-items"><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" ng-model="info.Value.YesOrNo.value" value="Yes" ng-disabled="DisableField"><span>Yes</span></label></li><li class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" ng-model="info.Value.YesOrNo.value" value="No" ng-disabled="DisableField"><span>No</span></label></li></ul>';

		var templateUrl4_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<div class="btn-group" data-toggle=""><label class="btn btn-primary"><input type= "radio" name="input" ng-model="info.Value.YesOrNo.value"" value= "Yes" ng-disabled="DisableField" />Yes</label > <label class="btn btn-default"><input type="radio" name="input"  ng-model="info.Value.YesOrNo.value" value="No" ng-disabled="DisableField"/>No</label></div >';
		'</div>' +
			'</ng-form>';
		var templateUrl12 = '<input type="number" min=0 class="form-control inline" ng-model="info.Value.Height.value" placeholder="Enter {{info.Name}}" ng-disabled="DisableField"/> ' +
			'<select class="form-control inline" ng-options="unit for unit in info.Value.Height.units.availableUnits" ng-model="info.Value.Height.units.selectedUnit" >' +
			'<option value="">--Select--</option></select>';
		var templateUrl12_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<input type="number" min=0 class="form-control inline" name="input" ng-model="info.Value.Height.value" placeholder="Enter {{info.Name}}" ng-disabled="DisableField"/> ' +
			'<select class="form-control inline" ng-options="unit for unit in info.Value.Height.units.availableUnits" ng-model="info.Value.Height.units.selectedUnit" >' +
			'<option value="">--Select--</option></select>';
		'</div>' +
			'</ng-form>';
		var templateUrl5 = '<input type="number" min=0 class="form-control inline" ng-model="info.Value.ValueAndSubValue.value" placeholder="Enter {{info.Name}}" />&nbsp;&nbsp;<input type="number" min=0 class="form-control inline" ng-model="info.Value.ValueAndSubValue.subvalue" placeholder="Enter {{info.Name}}" ng-disabled="DisableField" />';
		var templateUrl5_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<input type="number" min=0 class="form-control inline" name="input" ng-model="info.Value.ValueAndSubValue.value" placeholder="Enter {{info.Name}}" ng-disabled="DisableField"/>&nbsp;&nbsp;<input type="number" min=0 class="form-control inline" ng-model="info.Value.ValueAndSubValue.subvalue" placeholder="Enter {{info.Name}}" />';
		'</div>' +
			'</ng-form>';
		var templateUrl6 = '<input type="number" min=0 ng-model="info.Value.CurrentAndMaxValue.CurrentValue" class="form-control inline" placeholder="Enter {{info.Name}}" />&nbsp;&nbsp;<input class="form-control inline" type="number" min=0 ng-model="info.Value.CurrentAndMaxValue.MaxValue" placeholder="Enter {{info.Name}}" ng-disabled="DisableField" />';
		var templateUrl6_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<input type="number" min=0 name="input" ng-model="info.Value.CurrentAndMaxValue.CurrentValue" class="form-control inline" placeholder="Enter {{info.Name}}" ng-disabled="DisableField" />&nbsp;&nbsp;<input class="form-control inline" type="number" min=0 ng-model="info.Value.CurrentAndMaxValue.MaxValue" placeholder="Enter {{info.Name}}" />';
		'</div>' +
			'</ng-form>';
		var templateUrl8 = '<div class="text edit-character-portrait"><img id="itemImage" ng-src="{{info.Value.Image.image}}" ng-model="info.Value.Image.image" alt="Character Image" ngf-thumbnail="getThumbNail()" ngf-resize="{width: 120, height: 120}" ng-disabled="DisableField" /></div><div class="profile_image"><span>Choose Portrait</span><input type="file" onchange="angular.element(this).scope().ItemImageUpload(this)" accept="x-png,gif,jpeg" ng-disabled="DisableField" /> </div>';
		//var templateUrl8 = '<div class="form-group input-image"><div class="input-image-control-wrapper" style="height:100px;"><div class="input-image-note icon icon-upload"><span>Click here to upload.</span><small>(320 x 320 px)</small></div><input type="file" id="newItemImageFile" class="form-control-file" ng-src="{{info.Value.Image.image}}" ng-model="info.Value.Image.image" alt="" ngf-thumbnail="getThumbNail()" ngf-resize="{width: 120, height: 120}"></div></div>';
		var templateUrl8_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<div class="pull-left edit-character-portrait"><img id="itemImage" ng-src="{{info.Value.Image.image}}" name="input" ng-model="info.Value.Image.image" alt="" ngf-thumbnail="getThumbNail()" ngf-resize="{width: 120, height: 120}" ng-disabled="DisableField" /></div><div class="profile_image"><span></span><input type="file" rpgsmithtype="info.Value.Image.image" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" onchange="angular.element(this).scope().ItemImageUpload(this)" accept="x-png,gif,jpeg" ng-disabled="DisableField" /> </div>';
		'</div>' +
			'</ng-form>';
		//var templateUrl13 = '<div class="col-sm-9 tab_more" style="padding:0px"><input type="number" class="form-control inline" ng-model="info.Value.Volume.lenghtvalue" placeholder="Enter {{info.Name}}"/><input type="number" class="form-control inline" ng-model="info.Value.Volume.heightvalue" placeholder="Enter {{info.Name}}"/><input type="number" class="form-control inline" ng-model="info.Value.Volume.depthvalue" placeholder="Depth"/><select class="form-control" ng-options="unit for unit in info.Value.Volume.units.availableUnits" ng-model="info.Value.Volume.units.selectedUnit"><option value="">--Select--</option></select></div>';
		//var templateUrl3_withvalidation = '<div class="form-group">' +
		//    '<span ng-show="form.input.$invalid">' +
		//    '</span>' +
		//    '<div class="col-sm-9 tab_more" style="padding:0px"><input type="number" class="form-control inline" name="input" ng-model="info.Value.Volume.lenghtvalue" placeholder="Enter {{info.Name}}"/><input type="number" class="form-control inline" ng-model="info.Value.Volume.heightvalue" placeholder="Enter {{info.Name}}"/><input type="number" class="form-control inline" ng-model="info.Value.Volume.depthvalue" placeholder="Depth"/><select class="form-control" ng-options="unit for unit in info.Value.Volume.units.availableUnits" ng-model="info.Value.Volume.units.selectedUnit"><option value="">--Select--</option></select></div>';
		//'</div>' +
		//    '</ng-form>';
		var templateUrl13 = '<div class="form-group"><div class="form-row"><div class="col"><input type="number" min=0 class="form-control" ng-model="info.Value.Volume.lenghtvalue" placeholder="Enter {{info.Name}}" ng-disabled="DisableField"></div><div class="col"><input type="number" min=0 class="form-control" ng-model="info.Value.Volume.heightvalue" placeholder="Enter {{info.Name}}" ng-disabled="DisableField" ></div><div class="col"><input type="number" min=0 class="form-control" ng-model="info.Value.Volume.depthvalue" placeholder="Depth {{info.Name}}" ng-disabled="DisableField" ></div><div class="col"><input type="text" placeholder="Enter {{info.Name}}" ng-model="info.Value.Volume.units.selectedUnit" class="form-control" ng-disabled="DisableField" readonly></div></div></div>';
		var templateUrl3_withvalidation = '<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<div class="" ><input type="number" ng-disabled="DisableField" min=0 class="form-control inline" name="input" ng-model="info.Value.Volume.lenghtvalue" placeholder="Enter {{info.Name}}"/><input type="number" min=0 class="form-control inline" ng-model="info.Value.Volume.heightvalue" placeholder="Enter {{info.Name}}" ng-disabled="DisableField"/><input type="number" min=0 class="form-control inline" ng-model="info.Value.Volume.depthvalue" placeholder="Depth" ng-disabled="DisableField" /><input type="text" placeholder="Enter {{info.Name}}" ng-model="info.Value.Volume.units.selectedUnit" class="form-control inline_old" ng-disabled="DisableField" readonly/></div>';
		'</div>' +
			'</ng-form>';
		var templateUrl14 = '<input type="number" min=0 ng-model="info.Value.Number.value" placeholder="Enter {{info.Name}}" class="form-control inline_width" ng-disabled="DisableField" />';

		var templateUrl14_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.quantityinput.$invalid">' +
			'</span>' +
			'<input type="number" min=0 placeholder="Enter {{info.Name}}" name="quantityinput" class="select_dropdown form-control inline_width" ng-model="info.Value.Number.value" name="input"  ng-required="info" ng-disabled="DisableField"/> ' +
			'</div>' +
			'</ng-form>';

		var templateUrl2 = '<ul class="input-switch-items"><li class="form-check" ng-repeat="choice in info.Value.Choices.choices"><label class="form-check-label"><input class="form-check-input" ng-model="info.Value.Choices.selectedchoice" type="radio" ng-disabled="DisableField" name="newItemRarity" checked="checked"><span>{{choice.ChoiceName}}</span></label></li></ul>'
		var templateUrl2_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<select class="form-control" ng-options="choice.ChoiceName for choice in info.Value.Choices.choices" ng-model="info.Value.Choices.selectedchoice"><option value="">--Select--</option></select>' +
			'</div>' +
			'</ng-form>';

		var templateUrl15 = '<input type="text" ng-disabled="DisableField" placeholder="Enter {{info.Name}}" class="form-control" ng-model="info.Value.DefaultDice.value" /><button type="button" title= "" data-toggle="tooltip" class="select_dice btn icon icon-dice icon-rsi btn-simple-primary" data-original-title="Show Dice" ng-click="defaultDiceSelect()" ng-disabled="DisableField"></button>';

		var templateUrl15_withvalidation =
			'<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<input type="text" ng-disabled="DisableField" placeholder="Enter {{info.Name}}" class="form-control" ng-model="info.Value.DefaultDice.value" /><button type="button" title= "" data-toggle="tooltip" class="select_dice btn icon icon-dice icon-rsi btn-simple-primary" data-original-title="Show Dice" ng-click="defaultDiceSelect()" ng-disabled="DisableField"></button>';
		'</div>' +
			'</ng-form>';
		var templateUrl19_withvalidation = '<ng-form name="form">' +
			'<div class="form-group">' +
			'<span ng-show="form.input.$invalid">' +
			'</span>' +
			'<textarea placeholder="Enter {{info.Name}}" ng-disabled="DisableField" class="form-control text-line" ng-model="info.Value.Text.value" name="input" ng-class="{red: form.input.$dirty && form.input.$error.required}" ng-required="info" ></textarea> ' +
			'</div>' +
			'</ng-form>';

		var templateUrl19 = ' <textarea placeholder="Enter {{info.Name}}" ng-disabled="DisableField" class="form-control" ng-model="info.Value.Text.value"></textarea>';

		var templateUrl20 = ' <textarea placeholder="Enter {{info.Name}}" ng-disabled="DisableField" class="form-control" ng-model="info.Value.Text.value"></textarea>';

		//var templateUrl16 = '<input type="text" ng-model="info.Value.Calculation.formulae" class="form-control" disabled/>' 
		//var templateUrl16_withvalidation = '<ng-form name="form">' +
		//    '<div class="form-group">' +
		//    '<span ng-show="form.input.$invalid">' +
		//    '</span>' +
		//    '<input type="text" class="form-control" ng-model="info.Value.Calculation.formulae" ng-required="info" disabled/> ' +
		//    '</div>' +
		//    '</ng-form>';


		var linker = function (scope, element, attrs) {

			var items = angular.copy(scope.info);
			var mode = angular.copy(attrs.mode);

			if (mode != undefined) {
				if (mode == "'Edit'") {
					if (items.TypeId == 1 && items.Name == "Name") {
						scope.DisableField = true;
					}
				}
				if (mode == "'Copy'") {
					if (items.TypeId == 1 && items.Name == "Name") {
						scope.info.Value.Text.value = "";

					}
					else {
						scope.DisableField = true;
					}

				}
				if (mode == "'Create'") {
					if (items.TypeId == 1 && items.Name == "Name") {
						scope.DisableField = false;
					}
				}
			}

			var Calculation = function (FormulaVal, fullscope) {
				var FormlaForCalculate = FormulaVal;
				var WeightRes = '';
				var QuantityRes = '';
				var ArrayList = [];

				for (var i = 0; i < FormulaVal.length; i++) {

					if (FormulaVal[i] == '[' || FormulaVal[i] == ']');
					{
						var Result = '';
						var Str = FormulaVal.substring(i + 1, FormulaVal.length);

						if (FormulaVal[i] == '[') {
							var Result = '';
							for (var j = 0; j < Str.length; j++) {
								if (Str[j] == ']') {
									ArrayList.push(Result);
									break;
								}
								else {
									Result = Result + Str[j];
									i = i + 1;
								}
							}
						}
					}
				}

				//FormlaForCalculate = FormlaForCalculate.replace('[', '');
				//FormlaForCalculate = FormlaForCalculate.replace(']', '');
				FormlaForCalculate = FormlaForCalculate.replace(/\[/g, '');
				FormlaForCalculate = FormlaForCalculate.replace(/\]/g, '');

				for (var i = 0; i < ArrayList.length; i++) {
					for (var j = 0; j < fullscope.length; j++) {
						if ((ArrayList[i] == fullscope[j].Name || ArrayList[i] == fullscope[j].CorestatName)) {
							if ((ArrayList[i] == fullscope[j].Name || ArrayList[i] == fullscope[j].CorestatName) && fullscope[j].TypeId == 7) {
								FormlaForCalculate = FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.Weight.value");
							}
							else if ((ArrayList[i] == fullscope[j].Name || ArrayList[i] == fullscope[j].CorestatName) && fullscope[j].TypeId == 14) {
								FormlaForCalculate = FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.Number.value");
								//FormlaForCalculate = parseInt(FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.Number.value"));
							}
							else if ((ArrayList[i] == fullscope[j].Name || ArrayList[i] == fullscope[j].CorestatName) && fullscope[j].TypeId == 5) {
								FormlaForCalculate = FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.ValueAndSubValue.value");
								//FormlaForCalculate = parseInt(FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.Number.value"));
							}
							else if ((ArrayList[i] == fullscope[j].Name || ArrayList[i] == fullscope[j].CorestatName) && fullscope[j].TypeId == 6) {
								FormlaForCalculate = FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.CurrentAndMaxValue.CurrentValue");
								//FormlaForCalculate = parseInt(FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.Number.value"));
							}
							//else if (ArrayList[i] == fullscope[j].CorestatName && fullscope[j].TypeId == 5) {
							//    if (fullscope[j].CorestatName.indexOf('.Value') > -1) {
							//        FormlaForCalculate = FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.ValueAndSubValue.value");
							//    }
							//    else if (fullscope[j].CorestatName.indexOf('.SubValue') > -1) {
							//        FormlaForCalculate = FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.ValueAndSubValue.subvalue");
							//    }
							//}
							//else if (ArrayList[i] == fullscope[j].CorestatName && fullscope[j].TypeId == 6) {
							//    if (fullscope[j].CorestatName.indexOf('.CurrentValue') > -1) {
							//        FormlaForCalculate = FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.CurrentAndMaxValue.CurrentValue");
							//    }
							//    else if (fullscope[j].CorestatName.indexOf('.MaxValue') > -1) {
							//        FormlaForCalculate = FormlaForCalculate.replace(ArrayList[i], "fullscope[" + j + "].Value.CurrentAndMaxValue.MaxValue");
							//    }
							//}
						}
					}
				}

				return FormlaForCalculate;
			}


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
						if (IsMandatory == true) {
							template = templateUrl2_withvalidation;
						}
						else {
							template = templateUrl2;
						}
						break;
					case 3:
						if (IsMandatory == true) {
							template = templateUrl3_withvalidation;
						}
						else {
							template = templateUrl3;
						}
						break;

					case 4:

						if (IsMandatory == true) {
							template = templateUrl4_withvalidation;
						}
						else {
							template = templateUrl4;
						}
						break;
					case 5:
						if (IsMandatory == true) {
							template = templateUrl5_withvalidation;
						}
						else {
							template = templateUrl5;
						}
						break;
					case 6:
						if (IsMandatory == true) {
							template = templateUrl6_withvalidation;
						}
						else {
							template = templateUrl6;
						}
						break;
					case 7:
						if (IsMandatory == true) {
							template = templateUrl7_withvalidation;
						}
						else {
							template = templateUrl7;
						}
						break;

					case 8:

						if (IsMandatory == true) {
							template = templateUrl8_withvalidation;
						}
						else {
							template = templateUrl8;
						}
						break;
					case 12:
						if (IsMandatory == true) {
							template = templateUrl12_withvalidation;
						}
						else {
							template = templateUrl12;
						}
						break;
					case 13:
						if (IsMandatory == true) {
							template = templateUrl13_withvalidation;
						}
						else {
							template = templateUrl13;
						}
						break;
					case 14:
						if (IsMandatory == true) {
							template = templateUrl14_withvalidation;
						}
						else {
							template = templateUrl14;
						}
						break;
					case 15:
						if (IsMandatory == true) {
							template = templateUrl15_withvalidation;
						}
						else {
							template = templateUrl15;
						}
						break;
					case 16:
						//    if (IsMandatory == true) {
						//        template = templateUrl16_withvalidation;
						//    }
						//    else {
						//        template = templateUrl16;
						//    }
						//    break;
						var templateUrl16 = '{{' + Calculation(scope.info.Value.Calculation.formulae, scope.fullscope) + '}}';
						var templateUrl16_withvalidation = '{{' + Calculation(scope.info.Value.Calculation.formulae, scope.fullscope) + '}}';

						if (IsMandatory == true) {
							template = templateUrl16_withvalidation;
						}
						else {
							template = templateUrl16;
						}
						break;
					case 19:
						if (IsMandatory == true) {
							template = templateUrl19_withvalidation;
						}
						else {
							template = templateUrl19;
						}
						break;

				}

				return template;
			};



			element.html(getTemplate(items.TypeId, items.IsMandatory));

			$compile(element.contents())(scope);
			scope.getThumbNail = function () {
				if (scope.file)
					return $scope.file;

				var c = scope.item;
				if (c.id && c.portrait)
					return '/characterdata/' + c.id + '/' + c.portrait;

				return null;
			}

			scope.defaultDiceSelect = function () {
				var dlg = dialogs.create('/views/dialogs/defaultdiceselection.html', 'dialogDefaultDiceSelect',
					{ "mode": 1 }
				);
				dlg.result.then(function (res) {
					//    scope.dice = res;
					scope.info.Value.DefaultDice.value = res;
				});
			};
			//scope.uploadFile = function (input) {
			//    debugger;
			//    for (var file = 0; file < input.length; file++) {
			//        scope.info.Value.Image.image = input[file];
			//    }
			//    var file = $('input[type=file]').val(); 
			//    var clientImage =  getBase64(file);
			//    scope.info.Value.Image.clientImage = clientImage;
			//};
			function getBase64(file) {
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function () {
					return reader.result;
				};
				reader.onerror = function (error) {
					console.log('Error: ', error);
				};
			}
			scope.ItemImageUpload = function (input) {
				
				if (input.files && input.files[0]) {
					var reader = new FileReader();
					reader.onload = function (e) {
						$('#itemImage')
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
				info: '=',
				fullscope: '=',
				mode: '='
			}
		}
	}]);


})();