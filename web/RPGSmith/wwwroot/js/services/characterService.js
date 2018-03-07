(function () {

    'use strict';

    var module = angular.module('rpgsmith-services');

    module.factory('characterService', ['$http',

        function ($http) {

            var _controller = "/api/Character";

            function Service() {
            };

            var service = new Service();

            service.GetCharacters = function () {
                return $http.get(_controller + "/Get");
            }
            service.GetHeaderContentsCounts = function () {
                return $http.get(_controller + "/GetHeaderContentsCounts");
            }
            
            service.saveCharacter = function (character) {
                return $http.post(_controller + "/Create", character);
            }
            service.CopyCharacter = function (character) {
                return $http.post(_controller + "/Copy", character);
            }
            service.EditCharacter = function (character) {
                return $http.post(_controller + "/Edit", character);
            }
            service.Deletecharacter = function (UserID) {
                return $http.post(_controller + "/DeleteCharacter/?UserID=" + UserID);
            }
            service.GetCorestats = function (CharacterId) {
                return $http.post(_controller + "/GetCorestatsByCharacter/?CharacterId=" + CharacterId);
            }
            service.AddCorestatValues = function (corestatvalues) {
                var _characterViewModel = JSON.stringify(corestatvalues);
                return $http.post(_controller + "/CreateCorestatsValues", _characterViewModel);
            }
            service.GetLayouts = function (CharacterId) {
                return $http.get("/api/Layout/Get/?CharacterProfileId=" + CharacterId);
            }
            service.GetNewCharacterInventory = function () {
                return $http.get(_controller + "/GetNewCharacterInventory");
            }
            service.CreateCharacterInventoryItems = function (_characterInventoryItems) {
                return $http.post(_controller + "/CreateCharacterInventoryItems", _characterInventoryItems);
            }
            service.CreateCharacterInventorySpells = function (_characterInventorySpells) {
                return $http.post(_controller + "/CreateCharacterInventorySpells", _characterInventorySpells);
            }
            service.CreateCharacterInventoryAbility = function (_characterInventoryAbility) {
                return $http.post(_controller + "/CreateCharacterInventoryAbility", _characterInventoryAbility);
            }
            service.GetCharacterContent = function (CharacterId) {
                return $http.get(_controller + "/GetCharacterInventoryByCharacterProfileId/?CharacterProfileId=" + CharacterId);
            }
            service.EditCharacterContent = function (charactercontentvalues) {
                return $http.post(_controller + "/EditCharacterContentValues", charactercontentvalues);
            }
            service.CopyCharacterContent = function (_characterContent) {
                return $http.post(_controller + "/CopyCharacterContentValues", _characterContent);
            }
            service.DeleteCharacterContent = function (CharacterItemId) {
                return $http.post(_controller + "/DeleteCharacterContentValues/?CharacterItemId=" + CharacterItemId);
            }
            service.DeleteCharacterSpellContent = function (CharacterSpellId) {
                return $http.post(_controller + "/DeleteCharacterSpellContentValues/?CharacterSpellId=" + CharacterSpellId);
            }
            service.DeleteCharacterAbilityContent = function (CharacterAbilityId) {
                return $http.post(_controller + "/DeleteCharacterAbilityContentValues/?CharacterAbilityId=" + CharacterAbilityId);
            }
            service.UpdateItemEquipContent = function (CharacterItemsValues) {
                return $http.post(_controller + "/UpdateItemEquipContent", CharacterItemsValues);
            }
            service.UpdateSpellMemorizeContent = function (CharacterSpellValues) {
                return $http.post(_controller + "/UpdateSpellMemorizeContent", CharacterSpellValues);
            }
            service.UpdateAbilityEnabledContent = function (_CharacterabilityValues) {
                return $http.post(_controller + "/UpdateAbilityEnabledContent", _CharacterabilityValues);
            }
            service.GetCharacterItemContent = function (CharacterId) {
                return $http.get(_controller + "/GetCharacterItemInventoryByCharacterProfileId/?CharacterProfileId=" + CharacterId);
            }
            service.GetCharacterSpellContent = function (CharacterId) {
                return $http.get(_controller + "/GetCharacterSpellInventoryByCharacterProfileId/?CharacterProfileId=" + CharacterId);
            }
            service.GetCharacterAbilityContent = function (CharacterId) {
                return $http.get(_controller + "/GetCharacterAbilityInventoryByCharacterProfileId/?CharacterProfileId=" + CharacterId);
            }
            service.CreateItemInventorytile = function (charactercontentvalues) {
                return $http.post(_controller + "/CreateCharacterInventoryItemTiles", charactercontentvalues);
            }
            service.CreateSpellInventorytile = function (charactercontentvalues) {
                return $http.post(_controller + "/CreateCharacterInventorySpellTiles", charactercontentvalues);
            }
            service.CreateAbilityInventorytile = function (charactercontentvalues) {
                return $http.post(_controller + "/CreateCharacterInventoryAbilityTiles", charactercontentvalues);
            }

            service.uploadFileToUrl = function(characterProfileId, file, fileName) {
                var fd = new FormData();
                fd.append('filedata', file);
                fd.append('characterProfileId', characterProfileId);
                fd.append('filename', fileName);

                return $http.post('/api/CharecterRuleSetImportExport/Import', fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                });

            }


            return service;
        }
    ]);

})();