(function () {

    'use strict';

    var module = angular.module('rpgsmith-services');


    //module.factory("user", function () {
    //    return {};
    //});

    module.factory('rulesetDataShareService', [
        function () {
            var loginData = {}
            var rulesetData = {}

            var characterlayoutsData = {}

            var layoutData = {}

            var layoutItemInventoryData = {}

            var layoutSpellInventoryData = {}

            var layoutAbilityInventoryData = {}
                
            var layoutRuleSetItemInventoryData = {}

            var layoutRuleSetSpellInventoryData = {}

            var layoutRuleSetAbilityInventoryData = {}


            var rulesetItems = {}
            var rulesetSpells = {}
            var rulesetAbilities = {}
            var savedruleset = {}
            var savedcorestat = {}
            var savedlayout = {}
            var newtile = {}
            var layoutRuleSetCorestats = {}
            var characteritems = {}
            var selectedrulesetitems = {}
            var Inventorymetadata = {}
            var ItemProperties = {}
            var TileStyles = {}
            var Tilelst = []
            var Rulesetcontent = {}
            var Rulesetspellcontent = {};
            var ItemInventoryMetadata = {};
            var SpellInventoryMetadata = {};
            var AbilityInventoryMetadata = {};
            var rulesetsdata = {};
            var rpgtypes = {};
            var CharacterRulesetCount = {};
            var ImageDataandName = {};
            var LinkTiledata = {};
            function setloginData(data) {
                loginData = data;
            }
            function getloginData() {
                return loginData;
            }
            function setRulesetData(data)
            {
                rulesetData = data;
            }
            function getRulesetData()
            {
                return rulesetData;
            }

            function setCharacterLayoutsData(data)
            {
                characterlayoutsData = data;
            }

            function getCharacterLayoutsData() {
                return characterlayoutsData;
            }

            function setLayoutData(data) {
                layoutData = data;
            }

            function getLayoutData() {
                return layoutData;
            }

            function setLayoutItemInventoryData(data) {
                layoutItemInventoryData = data;
            }

            function getLayoutItemInventoryData(data) {
                return layoutItemInventoryData;
            }

            function setLayoutSpellInventoryData(data) {
                layoutSpellInventoryData = data;
            }

            function getLayoutSpellInventoryData(data) {
                return layoutSpellInventoryData;
            }

            function setLayoutAbilityInventoryData(data) {
                layoutAbilityInventoryData = data;
            }

            function getLayoutAbilityInventoryData(data) {
                return layoutAbilityInventoryData;
            }

            //

            function setLayoutRulesetItemInventoryData(data) {
                layoutRuleSetItemInventoryData = data;
            }

            function getLayoutRulesetItemInventoryData(data) {
                return layoutRuleSetItemInventoryData;
            }

            function setLayoutRulesetSpellInventoryData(data) {
                layoutRuleSetSpellInventoryData = data;
            }

            function getLayoutRulesetSpellInventoryData(data) {
                return layoutRuleSetSpellInventoryData;
            }

            function setLayoutRulesetAbilityInventoryData(data) {
                layoutRuleSetAbilityInventoryData = data;
            }

            function getLayoutRulesetAbilityInventoryData(data) {
                return layoutRuleSetAbilityInventoryData;
            }
            function setLayoutItemInventoryMetaData(data) {
                ItemInventoryMetadata = data;
            }

            function getLayoutItemInventoryMetaData(data) {
                return ItemInventoryMetadata;
            } 

            function setLayoutSpellInventoryMetaData(data) {
                SpellInventoryMetadata = data;
            }

            function getLayoutSpellInventoryMetaData(data) {
                return SpellInventoryMetadata;
            }

            function setLayoutAbilityInventoryMetaData(data) {
                AbilityInventoryMetadata = data;
            }

            function getLayoutAbilityInventoryMetaData(data) {
                return AbilityInventoryMetadata;
            }
            function setLinkTileData(data) {
                LinkTiledata = data;
            }

            function getLinkTileData(data) {
                return LinkTiledata;
            }
            function setRulesetsData(data) {
                rulesetsdata = data;
            }

            function getRulesetsData(data) {
                return rulesetsdata;
            }
            function setRpgtypeData(data) {
                rpgtypes = data;
            }

            function getRpgtypeData(data) {
                return rpgtypes;
            }
            //

            function setTilelst(data) {
                Tilelst.push(data);
                localStorage.setItem("Tilelst", JSON.stringify(Tilelst));
            }

            function getTilelst() {
                return Tilelst;
            }

            function setTileStyles(data) {
                TileStyles = data;
            }
            function getTileStyles() {
                return TileStyles;
            }
            function setRulesetItems(data) {
                rulesetItems = data;
            }
            function getRulesetItems() {
                return rulesetItems;
            }
            function setRulesetSpells(data) {
                rulesetSpells = data;
            }
            function getRulesetSpells() {
                return rulesetSpells;
            }
            function setRulesetAbilities(data) {
                rulesetAbilities = data;
            }
            function getRulesetAbilities() {
                return rulesetAbilities;
            }
            function setruleset(data) {
                savedruleset = data;
            }
            function getruleset() {
                return savedruleset;
            }
            function setcorestat(data) {
                savedcorestat = data;
            }
            function getcorestat() {
                return savedcorestat;
            }
            function setcorestatvalue(data) {
                layoutRuleSetCorestats = data;
            }
            function getcorestatvalue() {
                return layoutRuleSetCorestats;
            }

            function setlayoutmetadata(data) {
                savedlayout = data;
            }
            function getlayoutmetadata() {
                return savedlayout;
            }

            function setnewlayout(data) {
                newtile = data;
            }
            function getnewlayout() {
                return newtile;
            }
            function setcharacterRulesetitems(data) {
                characteritems = data;
            }
            function getcharacterRulesetitems() {
                return characteritems;
            }
            function setSelectedRulesetitems(data) {
                selectedrulesetitems = data;
            }
            function getSelectedRulesetitems() {
                return selectedrulesetitems;
            }
            function setInventory(data) {
                Inventorymetadata = data;
            }
            function getInventory() {
                return Inventorymetadata;
            }
            function setItemProperties(data) {
                ItemProperties = data;
            }
            function getItemProperties() {
                return ItemProperties;
            }
            function setRulesetcontent(data) {
                Rulesetcontent = data;
            }
            function getRulesetcontent() {
                return Rulesetcontent;
            }
            function setRulesetspellcontent(data) {
                Rulesetspellcontent = data;
            }
            function getRulesetspellcontent()
            {
                return Rulesetspellcontent;
            }
            function SetDisplayCharacterRulesetCount(data)
            {
                CharacterRulesetCount = data;
            }

            function getDisplayCharacterRulesetCount()
            {
                return CharacterRulesetCount;
            }

            function setImageandName(data)
            {
                ImageDataandName = data; 
            }

            function getImageandName()
            {
                return ImageDataandName;
            }

            return {
                setRulesetData: setRulesetData,
                getRulesetData: getRulesetData,

                setLayoutData: setLayoutData,
                getLayoutData: getLayoutData,
                setloginData: setloginData,
                getloginData: getloginData,
                setCharacterLayoutsData: setCharacterLayoutsData,
                getCharacterLayoutsData: getCharacterLayoutsData,

                setLayoutItemInventoryData: setLayoutItemInventoryData,
                getLayoutItemInventoryData: getLayoutItemInventoryData,

                setLayoutSpellInventoryData: setLayoutSpellInventoryData,
                getLayoutSpellInventoryData: getLayoutSpellInventoryData,

                setLayoutAbilityInventoryData: setLayoutAbilityInventoryData,
                getLayoutAbilityInventoryData: getLayoutAbilityInventoryData,

                setLayoutRulesetItemInventoryData: setLayoutRulesetItemInventoryData,
                getLayoutRulesetItemInventoryData: getLayoutRulesetItemInventoryData,

                setLayoutRulesetSpellInventoryData: setLayoutRulesetSpellInventoryData,
                getLayoutRulesetSpellInventoryData: getLayoutRulesetSpellInventoryData,

                setLayoutRulesetAbilityInventoryData: setLayoutRulesetAbilityInventoryData,
                getLayoutRulesetAbilityInventoryData: getLayoutRulesetAbilityInventoryData,

                setLayoutItemInventoryMetaData: setLayoutItemInventoryMetaData,
                getLayoutItemInventoryMetaData: getLayoutItemInventoryMetaData,

                setLayoutSpellInventoryMetaData: setLayoutSpellInventoryMetaData,
                getLayoutSpellInventoryMetaData: getLayoutSpellInventoryMetaData,

                setLayoutAbilityInventoryMetaData: setLayoutAbilityInventoryMetaData,
                getLayoutAbilityInventoryMetaData: getLayoutAbilityInventoryMetaData,

                setTilelst: setTilelst,
                getTilelst: getTilelst,
                setTileStyles: setTileStyles,
                getTileStyles: getTileStyles,
                setRulesetItems: setRulesetItems,
                getRulesetItems: getRulesetItems,
                setRulesetSpells: setRulesetSpells,
                getRulesetSpells: getRulesetSpells,
                setRulesetAbilities: setRulesetAbilities, 
                getRulesetAbilities: getRulesetAbilities,
                setruleset: setruleset,
                getruleset: getruleset,
                setcorestat: setcorestat,
                getcorestat: getcorestat,
                setcorestatvalue: setcorestatvalue,
                getcorestatvalue: getcorestatvalue,
                setlayoutmetadata: setlayoutmetadata,
                getlayoutmetadata: getlayoutmetadata,
                setnewlayout: setnewlayout,
                getnewlayout: getnewlayout,
                setcharacterRulesetitems: setcharacterRulesetitems,
                getcharacterRulesetitems: getcharacterRulesetitems,
                setSelectedRulesetitems: setSelectedRulesetitems,
                getSelectedRulesetitems: getSelectedRulesetitems,
                setInventory: setInventory,
                getInventory: getInventory,
                setItemProperties: setItemProperties,
                getItemProperties: getItemProperties,
                setRulesetcontent: setRulesetcontent,
                getRulesetcontent: getRulesetcontent,
                setRulesetspellcontent: setRulesetspellcontent,
                getRulesetspellcontent: getRulesetspellcontent,
                setLinkTileData: setLinkTileData,
                getLinkTileData: getLinkTileData,
                setRulesetsData: setRulesetsData,
                getRulesetsData: getRulesetsData,
                setRpgtypeData: setRpgtypeData,
                getRpgtypeData: getRpgtypeData,
                SetDisplayCharacterRulesetCount: SetDisplayCharacterRulesetCount,
                getDisplayCharacterRulesetCount: getDisplayCharacterRulesetCount,
                setImageandName: setImageandName,
                getImageandName: getImageandName
            }
          
        }
    ]);

})();

