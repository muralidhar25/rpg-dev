(function () {

    'use strict';

    var module = angular.module('rpgsmith-services');

    module.factory('rulesetService', ['$http',

        function ($http) {

            var _controller = "/api/RuleSet";

            function Service() {
            };

            var service = new Service();

            service.GetRuleSets = function () {
                return $http.get(_controller + "/Get");
            }

            service.GetNewRuleset = function () {
                return $http.get(_controller + "/GetNewRuleset");
            }
            service.GetNewRulesetByRuleSetId = function (RuleSetId) {
                var response = $http({
                    method: "get",
                    url: _controller + "/GetRulesetByRuleSetId?RuleSetId=" + RuleSetId,
                    //params: {
                    //    RuleSetId: JSON.stringify(RuleSetId)
                    //}
                });
                return response;
            }
            service.saveRuleSet = function (ruleset) {

                var clientImages = [];

                var _ruleset = angular.copy(ruleset);

                for (var i = 0; i < _ruleset.Rulesetproperty.length; i++) {
                    var ruleSetProperty = _ruleset.Rulesetproperty[i];
                    if (i == 2 && ruleSetProperty.Value.Image.image != null && ruleSetProperty.Value.Image.image != "" && angular.isUndefined(ruleSetProperty.Value.Image.image) == false) {
                        // Split the base64 string in data and contentType
                        var block = ruleSetProperty.Value.Image.image.split(";");
                        // Get the content type
                        var contentType = block[0].split(":")[1];
                        // get the real base64 content of the file
                        var realData = block[1].split(",")[1];

                        // Convert to blob
                        var blob = b64toBlob(realData, contentType);
                        var splitFileExt = contentType.split('/');
                        var fileExt = splitFileExt[1];

                        var currentDate = Date.now();

                        var file = new File([blob], _ruleset.Name + "~" + _ruleset.UserId + currentDate + "." + fileExt, { type: contentType });
                        //ruleSetImage = file;
                        clientImages.push(file);

                        ruleSetProperty.Value.Image.image = _ruleset.Name + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                        break;
                    }
                }
                for (var i = 0; i < _ruleset.Items.length; i++) {
                    var item = _ruleset.Items[i];
                    for (var j = 0; j < item.ItemProperties.length; j++) {
                        if (j == 1 && item.ItemProperties[j].Value.Image.image != null && item.ItemProperties[j].Value.Image.image != "" && angular.isUndefined(item.ItemProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            var block = item.ItemProperties[j].Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                            //items.push(file);
                            clientImages.push(file);

                            item.ItemProperties[j].Value.Image.image = item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            break;
                        }
                    }

                }
                for (var i = 0; i < _ruleset.Spells.length; i++) {
                    var spell = _ruleset.Spells[i];
                    for (var j = 0; j < spell.SpellProperties.length; j++) {
                        if (j == 1 && spell.SpellProperties[j].Value.Image.image != null && spell.SpellProperties[j].Value.Image.image != "" && angular.isUndefined(spell.SpellProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            var block = spell.SpellProperties[j].Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], spell.SpellProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                            //spells.push(file);
                            clientImages.push(file);

                            spell.SpellProperties[j].Value.Image.image = spell.SpellProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            break;
                        }
                    }
                }
                for (var i = 0; i < _ruleset.Abilities.length; i++) {
                    var ability = _ruleset.Abilities[i];
                    for (var j = 0; j < ability.AbilityProperties.length; j++) {
                        if (j == 1 && ability.AbilityProperties[j].Value.Image.image != null && ability.AbilityProperties[j].Value.Image.image != "" && angular.isUndefined(ability.AbilityProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            var block = ability.AbilityProperties[j].Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], ability.AbilityProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                            //abilities.push(file);
                            clientImages.push(file);

                            ability.AbilityProperties[j].Value.Image.image = ability.AbilityProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            break;
                        }
                    }
                }
                //var itemfiles = items;
                //var spellfiles = spells;
                //var abilityfiles = abilities;
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/Create",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("ruleSetViewModel", angular.toJson(data.ruleSetViewModel));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { ruleSetViewModel: _ruleset, clientImages: clientImages }
                })
                // return $http.post(_controller + "/Create", _ruleset);
            }
            service.updateRuleSet = function (ruleset) {

                var clientImages = [];

                var _ruleset = angular.copy(ruleset);

                for (var i = 0; i < _ruleset.Rulesetproperty.length; i++) {
                    var ruleSetProperty = _ruleset.Rulesetproperty[i];
                    if (i == 2 && ruleSetProperty.Value.Image.image != null && ruleSetProperty.Value.Image.image != "" && angular.isUndefined(ruleSetProperty.Value.Image.image) == false) {
                        // Split the base64 string in data and contentType
                        if (ruleSetProperty.Value.Image.image.includes("wwwroot") == false) {
                            var block = ruleSetProperty.Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], _ruleset.Name + "~" + _ruleset.UserId + currentDate + "." + fileExt, { type: contentType });
                            //ruleSetImage = file;
                            clientImages.push(file);

                            ruleSetProperty.Value.Image.image = _ruleset.Name + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                        }
                        break;
                    }
                }
                for (var i = 0; i < _ruleset.Items.length; i++) {
                    var item = _ruleset.Items[i];
                    for (var j = 0; j < item.ItemProperties.length; j++) {
                        if (j == 1 && item.ItemProperties[j].Value.Image.image != null && item.ItemProperties[j].Value.Image.image != "" && angular.isUndefined(item.ItemProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            if (item.ItemProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                var block = item.ItemProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //items.push(file);
                                clientImages.push(file);

                                item.ItemProperties[j].Value.Image.image = item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }

                }
                for (var i = 0; i < _ruleset.Spells.length; i++) {
                    var spell = _ruleset.Spells[i];
                    for (var j = 0; j < spell.SpellProperties.length; j++) {
                        if (j == 1 && spell.SpellProperties[j].Value.Image.image != null && spell.SpellProperties[j].Value.Image.image != "" && angular.isUndefined(spell.SpellProperties[j].Value.Image.image) == false) {
                            if (spell.SpellProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                // Split the base64 string in data and contentType
                                var block = spell.SpellProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], spell.SpellProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //spells.push(file);
                                clientImages.push(file);

                                spell.SpellProperties[j].Value.Image.image = spell.SpellProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }
                }
                for (var i = 0; i < _ruleset.Abilities.length; i++) {
                    var ability = _ruleset.Abilities[i];
                    for (var j = 0; j < ability.AbilityProperties.length; j++) {
                        if (j == 1 && ability.AbilityProperties[j].Value.Image.image != null && ability.AbilityProperties[j].Value.Image.image != "" && angular.isUndefined(ability.AbilityProperties[j].Value.Image.image) == false) {
                            if (ability.AbilityProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                // Split the base64 string in data and contentType
                                var block = ability.AbilityProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], ability.AbilityProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //abilities.push(file);
                                clientImages.push(file);

                                ability.AbilityProperties[j].Value.Image.image = ability.AbilityProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }
                }
                //var itemfiles = items;
                //var spellfiles = spells;
                //var abilityfiles = abilities;
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/Update",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("ruleSetViewModel", angular.toJson(data.ruleSetViewModel));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { ruleSetViewModel: _ruleset, clientImages: clientImages }
                })
                // return $http.post(_controller + "/Create", _ruleset);
            }
            service.copyRuleSet = function (ruleset) {
                var clientImages = [];

                var _ruleset = angular.copy(ruleset);

                for (var i = 0; i < _ruleset.Rulesetproperty.length; i++) {
                    var ruleSetProperty = _ruleset.Rulesetproperty[i];
                    if (i == 2 && ruleSetProperty.Value.Image.image != null && ruleSetProperty.Value.Image.image != "" && angular.isUndefined(ruleSetProperty.Value.Image.image) == false) {
                        // Split the base64 string in data and contentType
                        if (ruleSetProperty.Value.Image.image.includes("wwwroot") == false) {
                            var block = ruleSetProperty.Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], _ruleset.Name + "~" + _ruleset.UserId + currentDate + "." + fileExt, { type: contentType });
                            //ruleSetImage = file;
                            clientImages.push(file);

                            ruleSetProperty.Value.Image.image = _ruleset.Name + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                        }
                        break;
                    }
                }
                for (var i = 0; i < _ruleset.Items.length; i++) {
                    var item = _ruleset.Items[i];
                    for (var j = 0; j < item.ItemProperties.length; j++) {
                        if (j == 1 && item.ItemProperties[j].Value.Image.image != null && item.ItemProperties[j].Value.Image.image != "" && angular.isUndefined(item.ItemProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            if (item.ItemProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                var block = item.ItemProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //items.push(file);
                                clientImages.push(file);

                                item.ItemProperties[j].Value.Image.image = item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }

                }
                for (var i = 0; i < _ruleset.Spells.length; i++) {
                    var spell = _ruleset.Spells[i];
                    for (var j = 0; j < spell.SpellProperties.length; j++) {
                        if (j == 1 && spell.SpellProperties[j].Value.Image.image != null && spell.SpellProperties[j].Value.Image.image != "" && angular.isUndefined(spell.SpellProperties[j].Value.Image.image) == false) {
                            if (spell.SpellProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                // Split the base64 string in data and contentType
                                var block = spell.SpellProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], spell.SpellProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //spells.push(file);
                                clientImages.push(file);

                                spell.SpellProperties[j].Value.Image.image = spell.SpellProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }
                }
                for (var i = 0; i < _ruleset.Abilities.length; i++) {
                    var ability = _ruleset.Abilities[i];
                    for (var j = 0; j < ability.AbilityProperties.length; j++) {
                        if (j == 1 && ability.AbilityProperties[j].Value.Image.image != null && ability.AbilityProperties[j].Value.Image.image != "" && angular.isUndefined(ability.AbilityProperties[j].Value.Image.image) == false) {
                            if (ability.AbilityProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                // Split the base64 string in data and contentType
                                var block = ability.AbilityProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], ability.AbilityProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //abilities.push(file);
                                clientImages.push(file);

                                ability.AbilityProperties[j].Value.Image.image = ability.AbilityProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }
                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/Copy",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("ruleSetViewModel", angular.toJson(data.ruleSetViewModel));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { ruleSetViewModel: _ruleset, clientImages: clientImages }
                })
            }
            //service.GetTypes = function () {
            //    return $http.get("/api/RPGSmithType/Get");
            //}
            service.GetTypes = function () {
                return $http.get("/api/RPGSmithType/GetRPGSmithTypeForCoreStat");
            }
            service.DeleteRuleSet = function (ID) {
                var RuleSetID = { 'RuleSetID': ID };
                //$http.post(_controller + "/Delete", RuleSetID).then(function (data, status, headers, config) {
                //    return data;
                //}, function (data, status, headers, config) {
                //    return data;
                //});
                return $http.post(_controller + "/Delete", RuleSetID);
            }
            service.GetCoreStatById = function (CoreStatID) {
                var response = $http({
                    method: "post",
                    url: _controller + "/GetCoreStatsByCoreStatId",
                    params: {
                        CoreStatID: JSON.stringify(CoreStatID)
                    }
                });
                return response;
            }
            //service.DeleteCoreStat = function (ID) {
            //    var CoreStatID = { 'CoreStatID': ID };
            //    return $http.post(_controller + "/DeleteCoreStat", CoreStatID);
            //}
            service.GetRuleSetItemsForItemInventory = function (characterId) {
                return $http.post(_controller + "/GetRuleSetItemsByCharacterProfileId?CharacterProfileId=" + characterId);
            }
            service.GetRuleSetSpellsForSpellInventory = function (characterId) {
                return $http.post(_controller + "/GetRuleSetSpellsByCharacterProfileId?CharacterProfileId=" + characterId);
            }
            service.GetRuleSetAbilitiesForAbilityInventory = function (characterId) {
                return $http.post(_controller + "/GetRuleSetAbilitiesByCharacterProfileId?CharacterProfileId=" + characterId);
            }
            //service.GetCorestats = function () {
            //    return $http.get(_controller + "/GetAllCorestats");
            //}


            service.GetRuleSetForLinkTile = function (characterId) {
                return $http.post(_controller + "/GetRuleSetByCharacterProfileId?CharacterProfileId=" + characterId);
            }
            service.ExportRuleset = function (rulesetId) {
                location.href = "/api/RuleSetImportExport/Export?RuleSetID=" + rulesetId;
            }


            var b64toBlob = function (b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob = new Blob(byteArrays, { type: contentType });
                return blob;
            };


            service.uploadFileToUrl = function (RuleSetId, file, fileName, RuleSetName) {
                var fd = new FormData();
                fd.append('filedata', file);
                fd.append('rulesetId', RuleSetId);
                fd.append('filename', fileName);
                fd.append('RuleSetName', RuleSetName);

                return $http.post('/api/RuleSetImportExport/Import', fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                });
                //.then(function (data) {
                //    if (data.data.StatusCode == 200) {

                //    }
                //    else if (data.data.StatusCode == 400) {

                //    }
                //});
            }

            //For New Design


            service.GetAllRuleSets = function () {
                return $http.get(_controller + "/GetRulesetsByUserId");
            }
            service.CopyRulesetByRulesetId = function (RulesetId, Name) {
                return $http.post(_controller + "/CopyRulesetByRulesetId?RulesetId=" + RulesetId + "&Name=" + Name);
            }
            service.GetRuleSetGeneralSettings = function (RulesetId) {
                return $http.post(_controller + "/GetRulesetGeneralSettingsByRulesetId?RulesetId=" + RulesetId);
            }
            service.GetGeneralSettingsMetadata = function () {
                return $http.get(_controller + "/GetGeneralSettingsMetaData");
            }
            service.CreateGeneralSettings = function (_rulesetProperty) {
                var clientImages = [];

                var _ruleset = angular.copy(_rulesetProperty);

                for (var i = 0; i < _rulesetProperty.length; i++) {
                    var ruleSetProperty = _ruleset[i];
                    if (i == 2 && ruleSetProperty.Value.Image.image != null && ruleSetProperty.Value.Image.image != "" && angular.isUndefined(ruleSetProperty.Value.Image.image) == false) {
                        // Split the base64 string in data and contentType
                        var block = ruleSetProperty.Value.Image.image.split(";");
                        // Get the content type
                        var contentType = block[0].split(":")[1];
                        // get the real base64 content of the file
                        var realData = block[1].split(",")[1];

                        // Convert to blob
                        var blob = b64toBlob(realData, contentType);
                        var splitFileExt = contentType.split('/');
                        var fileExt = splitFileExt[1];

                        var currentDate = Date.now();

                        var file = new File([blob], _ruleset[0].RulesetName + "~" + currentDate + "." + fileExt, { type: contentType });
                        //ruleSetImage = file;
                        clientImages.push(file);

                        ruleSetProperty.Value.Image.image = _ruleset[0].RulesetName + "~" + currentDate + "." + fileExt;
                        break;
                    }
                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/CreateRulesetGeneralSettings",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_rulesetProperty", angular.toJson(data._rulesetProperty));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _rulesetProperty: _ruleset, clientImages: clientImages }
                })
            }

            service.UpdateGeneralSettings = function (_updateGeneralSettings) {
                var clientImages = [];

                var _ruleset = angular.copy(_updateGeneralSettings);

                for (var i = 0; i < _updateGeneralSettings.length; i++) {
                    var ruleSetProperty = _ruleset[i];
                    if (i == 2 && ruleSetProperty.Value.Image.image != null && ruleSetProperty.Value.Image.image != "" && angular.isUndefined(ruleSetProperty.Value.Image.image) == false) {
                        // Split the base64 string in data and contentType
                        if (ruleSetProperty.Value.Image.image.includes("wwwroot") == false) {
                            var block = ruleSetProperty.Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], _ruleset.Name + "~" + _ruleset.UserId + currentDate + "." + fileExt, { type: contentType });
                            //ruleSetImage = file;
                            clientImages.push(file);

                            ruleSetProperty.Value.Image.image = _ruleset.Name + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                        }
                        break;
                    }
                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/UpdateRulesetGeneralSettings",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_updateGeneralSettings", angular.toJson(data._updateGeneralSettings));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _updateGeneralSettings: _ruleset, clientImages: clientImages }
                })
            }

            service.GetRulesetCorestats = function (RulesetId) {
                return $http.post(_controller + "/GetCorestatsByRulesetId?RulesetId=" + RulesetId);
            }
            service.GetCorestatsMetadata = function () {
                return $http.get(_controller + "/GetCorestatsMetadata");
            }

            service.CreateCorestats = function (_rulesetCorestats) {
                return $http.post(_controller + "/CreateCorestats", _rulesetCorestats);
            }
            service.UpdateCorestats = function (_updateCorestats) {
                return $http.post(_controller + "/UpdateCorestats", _updateCorestats);
            }

            service.CopyCorestats = function (_copyCorestats) {
                return $http.post(_controller + "/CopyCorestats", _copyCorestats);
            }
            service.DeleteCorestats = function (deletecorestats) {
                return $http.post(_controller + "/DeleteCorestats", deletecorestats);
            }
            service.GetRulesetItems = function (RUlesetId) {
                //var response = $http({
                //    method: "get",
                //    url: _controller + "/GetRulesetItemsByRulesetId",
                //    params: {
                //        RulesetId: JSON.stringify(RulesetId)
                //    }
                //});
                //return response;
                return $http.get(_controller + "/GetRulesetItemsByRulesetId/?RUlesetId=" + RUlesetId);
            }
            service.GetItemsMetadata = function (RulesetId) {
                var response = $http({
                    method: "post",
                    url: _controller + "/GetRulesetItemsMetadata",
                    params: {
                        RulesetId: JSON.stringify(RulesetId)
                    }
                });
                return response;
                //return $http.post(_controller + "/GetRulesetItemsMetadata?RulesetId=", RulesetId);
            }
            service.CreateItems = function (_rulesetItems) {
                var clientImages = [];
                var _ruleset = angular.copy(_rulesetItems);
                for (var i = 0; i < _rulesetItems.length; i++) {
                    var item = _ruleset[i];
                    for (var j = 0; j < item.ItemProperties.length; j++) {
                        if (j == 1 && item.ItemProperties[j].Value.Image.image != null && item.ItemProperties[j].Value.Image.image != "" && angular.isUndefined(item.ItemProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            var block = item.ItemProperties[j].Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], item.ItemProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt);
                            //items.push(file);
                            clientImages.push(file);

                            item.ItemProperties[j].Value.Image.image = item.ItemProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt;
                            break;
                        }
                    }

                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/CreateRulesetItems",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_rulesetItems", angular.toJson(data._rulesetItems));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _rulesetItems: _ruleset, clientImages: clientImages }
                })

            }

            service.UpdateItems = function (_updateItems) {
                var clientImages = [];
                var _ruleset = angular.copy(_updateItems);
                for (var i = 0; i < _updateItems.length; i++) {
                    var item = _ruleset[i];
                    for (var j = 0; j < item.ItemProperties.length; j++) {
                        if (j == 1 && item.ItemProperties[j].Value.Image.image != null && item.ItemProperties[j].Value.Image.image != "" && angular.isUndefined(item.ItemProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            if (item.ItemProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                var block = item.ItemProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //items.push(file);
                                clientImages.push(file);

                                item.ItemProperties[j].Value.Image.image = item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }

                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/UpdateRulesetItems",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_updateItems", angular.toJson(data._updateItems));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _updateItems: _ruleset, clientImages: clientImages }
                })
            }

            service.CopyItems = function (_copyItems) {
                var clientImages = [];
                var _ruleset = angular.copy(_copyItems);
                for (var i = 0; i < _copyItems.length; i++) {
                    var item = _ruleset[i];
                    for (var j = 0; j < item.ItemProperties.length; j++) {
                        if (j == 1 && item.ItemProperties[j].Value.Image.image != null && item.ItemProperties[j].Value.Image.image != "" && angular.isUndefined(item.ItemProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            if (item.ItemProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                var block = item.ItemProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //items.push(file);
                                clientImages.push(file);

                                item.ItemProperties[j].Value.Image.image = item.ItemProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }

                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/CopyRulesetItems",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_copyItems", angular.toJson(data._copyItems));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _copyItems: _ruleset, clientImages: clientImages }
                })
            }
            service.DeleteItems = function (deleteitem) {
                return $http.post(_controller + "/DeleteItem", deleteitem);
            }
            service.GetRulesetSpells = function (RUlesetId) {
                //var response = $http({
                //    method: "get",
                //    url: _controller + "/GetRulesetItemsByRulesetId",
                //    params: {
                //        RulesetId: JSON.stringify(RulesetId)
                //    }
                //});
                //return response;
                return $http.get(_controller + "/GetRulesetSpellsByRulesetId/?RUlesetId=" + RUlesetId);
            }

            service.GetSpellsMetadata = function (RulesetId) {
                var response = $http({
                    method: "post",
                    url: _controller + "/GetRulesetSpellsMetadata",
                    params: {
                        RulesetId: JSON.stringify(RulesetId)
                    }
                });
                return response;
                //return $http.post(_controller + "/GetRulesetItemsMetadata?RulesetId=", RulesetId);
            }



            service.CreateSpells = function (_rulesetSpells) {
                var clientImages = [];
                var _ruleset = angular.copy(_rulesetSpells);
                for (var i = 0; i < _rulesetSpells.length; i++) {
                    var spell = _ruleset[i];
                    for (var j = 0; j < spell.SpellProperties.length; j++) {
                        if (j == 1 && spell.SpellProperties[j].Value.Image.image != null && spell.SpellProperties[j].Value.Image.image != "" && angular.isUndefined(spell.SpellProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            var block = spell.SpellProperties[j].Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], spell.SpellProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt);
                            //items.push(file);
                            clientImages.push(file);

                            spell.SpellProperties[j].Value.Image.image = spell.SpellProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt;
                            break;
                        }
                    }

                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/CreateRulesetSpells",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_rulesetSpells", angular.toJson(data._rulesetSpells));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _rulesetSpells: _ruleset, clientImages: clientImages }
                })

            }

            service.UpdateSpells = function (_updateSpells) {
                var clientImages = [];
                var _ruleset = angular.copy(_updateSpells);
                for (var i = 0; i < _updateSpells.length; i++) {
                    var spell = _ruleset[i];
                    for (var j = 0; j < spell.SpellProperties.length; j++) {
                        if (j == 1 && spell.SpellProperties[j].Value.Image.image != null && spell.SpellProperties[j].Value.Image.image != "" && angular.isUndefined(spell.SpellProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            if (spell.SpellProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                var block = spell.SpellProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], spell.SpellProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt);
                                //items.push(file);
                                clientImages.push(file);

                                spell.SpellProperties[j].Value.Image.image = spell.SpellProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }

                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/UpdateRulesetSpells",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_updateSpells", angular.toJson(data._updateSpells));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _updateSpells: _ruleset, clientImages: clientImages }
                })
            }

            service.CopySpells = function (_copySpells) {
                var clientImages = [];
                var _ruleset = angular.copy(_copySpells);
                for (var i = 0; i < _copySpells.length; i++) {
                    var spell = _copySpells[i];
                    for (var j = 0; j < spell.SpellProperties.length; j++) {
                        if (j == 1 && spell.SpellProperties[j].Value.Image.image != null && spell.SpellProperties[j].Value.Image.image != "" && angular.isUndefined(spell.SpellProperties[j].Value.Image.image) == false) {
                            if (spell.SpellProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                // Split the base64 string in data and contentType
                                var block = spell.SpellProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], spell.SpellProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //spells.push(file);
                                clientImages.push(file);

                                spell.SpellProperties[j].Value.Image.image = spell.SpellProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }
                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/CopyRulesetSpells",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_copySpells", angular.toJson(data._copySpells));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _copySpells: _ruleset, clientImages: clientImages }
                })
            }

            service.DeleteSpells = function (deletespell) {
                return $http.post(_controller + "/DeleteSpell", deletespell);
            }

            service.GetRulesetAbilities = function (RUlesetId) {
                //var response = $http({
                //    method: "get",
                //    url: _controller + "/GetRulesetItemsByRulesetId",
                //    params: {
                //        RulesetId: JSON.stringify(RulesetId)
                //    }
                //});
                //return response;
                return $http.get(_controller + "/GetRulesetAbilitiesByRulesetId/?RUlesetId=" + RUlesetId);
            }


            service.GetAbilitiesMetadata = function (RulesetId) {
                var response = $http({
                    method: "post",
                    url: _controller + "/GetRulesetAbilitiesMetadata",
                    params: {
                        RulesetId: JSON.stringify(RulesetId)
                    }
                });
                return response;
                //return $http.post(_controller + "/GetRulesetItemsMetadata?RulesetId=", RulesetId);
            }

            service.CreateAbilities = function (_rulesetAbilities) {
                var clientImages = [];
                var _ruleset = angular.copy(_rulesetAbilities);
                for (var i = 0; i < _rulesetAbilities.length; i++) {
                    var ability = _ruleset[i];
                    for (var j = 0; j < ability.AbilityProperties.length; j++) {
                        if (j == 1 && ability.AbilityProperties[j].Value.Image.image != null && ability.AbilityProperties[j].Value.Image.image != "" && angular.isUndefined(ability.AbilityProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            var block = ability.AbilityProperties[j].Value.Image.image.split(";");
                            // Get the content type
                            var contentType = block[0].split(":")[1];
                            // get the real base64 content of the file
                            var realData = block[1].split(",")[1];

                            // Convert to blob
                            var blob = b64toBlob(realData, contentType);
                            var splitFileExt = contentType.split('/');
                            var fileExt = splitFileExt[1];

                            var currentDate = Date.now();

                            var file = new File([blob], ability.AbilityProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt);
                            //items.push(file);
                            clientImages.push(file);

                            ability.AbilityProperties[j].Value.Image.image = ability.AbilityProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt;
                            break;
                        }
                    }

                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/CreateRulesetAbilities",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_rulesetAbilities", angular.toJson(data._rulesetAbilities));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _rulesetAbilities: _ruleset, clientImages: clientImages }
                })

            }


            service.UpdateAbilities = function (_updateAbilities) {
                var clientImages = [];
                var _ruleset = angular.copy(_updateAbilities);
                for (var i = 0; i < _updateAbilities.length; i++) {
                    var ability = _ruleset[i];
                    for (var j = 0; j < ability.AbilityProperties.length; j++) {
                        if (j == 1 && ability.AbilityProperties[j].Value.Image.image != null && ability.AbilityProperties[j].Value.Image.image != "" && angular.isUndefined(ability.AbilityProperties[j].Value.Image.image) == false) {
                            // Split the base64 string in data and contentType
                            if (ability.AbilityProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                var block = ability.AbilityProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], ability.AbilityProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt);
                                //items.push(file);
                                clientImages.push(file);

                                ability.AbilityProperties[j].Value.Image.image = ability.AbilityProperties[0].Value.Text.value + "~" + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }

                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/UpdateRulesetAbilities",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_updateAbilities", angular.toJson(data._updateAbilities));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _updateAbilities: _ruleset, clientImages: clientImages }
                })
            }

            service.CopyAbilities = function (_copyAbilities) {
                var clientImages = [];
                var _ruleset = angular.copy(_copyAbilities);
                for (var i = 0; i < _copyAbilities.length; i++) {
                    var ability = _copyAbilities[i];
                    for (var j = 0; j < ability.AbilityProperties.length; j++) {
                        if (j == 1 && ability.AbilityProperties[j].Value.Image.image != null && ability.AbilityProperties[j].Value.Image.image != "" && angular.isUndefined(ability.AbilityProperties[j].Value.Image.image) == false) {
                            if (ability.AbilityProperties[j].Value.Image.image.includes("wwwroot") == false) {
                                // Split the base64 string in data and contentType
                                var block = ability.AbilityProperties[j].Value.Image.image.split(";");
                                // Get the content type
                                var contentType = block[0].split(":")[1];
                                // get the real base64 content of the file
                                var realData = block[1].split(",")[1];

                                // Convert to blob
                                var blob = b64toBlob(realData, contentType);
                                var splitFileExt = contentType.split('/');
                                var fileExt = splitFileExt[1];

                                var currentDate = Date.now();

                                var file = new File([blob], ability.AbilityProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt);
                                //spells.push(file);
                                clientImages.push(file);

                                ability.AbilityProperties[j].Value.Image.image = ability.AbilityProperties[0].Value.Text.value + "~" + _ruleset.UserId + currentDate + "." + fileExt;
                            }
                            break;
                        }
                    }
                }
                var ruleSetImage = angular.isUndefined(ruleSetImage) == false ? ruleSetImage : null;
                return $http({
                    url: _controller + "/CopyRulesetAbilities",
                    method: "POST",
                    headers: { "Content-Type": undefined },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        formData.append("_copyAbilities", angular.toJson(data._copyAbilities));
                        for (var i = 0; i < data.clientImages.length; i++) {
                            formData.append("clientImages[" + i + "]", data.clientImages[i]);
                        }
                        //for (var i = 0; i < data.itemfiles.length; i++) {
                        //    formData.append("itemfiles[" + i + "]", data.itemfiles[i]);
                        //}
                        //for (var i = 0; i < data.spellfiles.length; i++) {
                        //    formData.append("spellfiles[" + i + "]", data.spellfiles[i]);
                        //}
                        //for (var i = 0; i < data.abilityfiles.length; i++) {
                        //    formData.append("abilityfiles[" + i + "]", data.abilityfiles[i]);
                        //}
                        //formData.append("ruleSetImage", data.ruleSetImage);
                        return formData;
                    },
                    data: { _copyAbilities: _ruleset, clientImages: clientImages }
                })
            }

            service.DeleteAbilities = function (deleteability) {
                return $http.post(_controller + "/DeleteAbility", deleteability);
            }
            service.GetTilesMetadataForRuleset = function () {
                return $http.get(_controller + "/GetTilesMetadataForRuleset");
            }
            service.SaveRulesetTiles = function (_rulesetContent) {
                return $http.post(_controller + "/SaveOrUpdateRulesetContentTiles", _rulesetContent);
            }
            //Convert base64 bit image in to Http posted file (Blob)
            function b64toBlob(b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob = new Blob(byteArrays, { type: contentType }, name);
                return blob;
            }

            return service;
        }
    ]);

})();