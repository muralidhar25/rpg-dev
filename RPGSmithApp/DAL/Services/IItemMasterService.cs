﻿using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IItemMasterService
    {
        ItemMaster GetItemMasterById(int? id);
        List<ItemMaster> GetItemMasters();
        List<ItemMaster> GetItemMastersByRuleSetId(int ruleSetId);
        Task<ItemMaster> CreateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities, List<ItemMasterBuffAndEffect> AssociatedBuffAndEffects);
        Task<ItemMaster> UpdateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities, List<ItemMasterBuffAndEffect> AssociatedBuffAndEffects);
        Task<bool> DeleteItemMaster(int id);
        Task<int> GetItemMasterCount();
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateItemMaster(string value, int? ruleSetId, int? itemMasterId = 0);
        Task<bool> CheckDuplicateItemMasterLoot(string value, int? ruleSetId, int? lootID = 0);
        Task<bool> CheckDuplicateItemMasterLootPile(string value, int? ruleSetId, int? lootID = 0);
        Task<ItemMaster> GetDuplicateItemMaster(string value, int? ruleSetId, int? itemMasterId = 0);
        // Task<ItemMasterLoot> GetDuplicateLootPile(string value, int? ruleSetId, int? lootId=0);
        List<ItemMaster> Core_GetItemMastersByRuleSetId(int ruleSetId, int ParentID);
        Task<ItemMaster> Core_CreateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities, List<ItemMasterBuffAndEffect> AssociatedBuffAndEffects);
        bool Core_ItemMasterWithParentIDExists(int itemMasterID, int RulesetID);
        bool Core_ItemMasterLootWithParentIDExists(int LootID, int RulesetID);
        List<ItemMaster_Bundle> SP_GetItemMastersByRuleSetId(int rulesetId, int page, int pageSize);
        SP_AbilitySpellForItemMaster AbilitySpellForItemsByRuleset_sp(int rulesetId, int itemMasterId);
        ItemsAndLootTemplates GetItemMastersByRuleSetId_add(int rulesetId, bool includeBundles = false, bool includeLootTemplates = false);
        bool Core_BundleWithParentIDExists(int bundleId, int rulesetID);
        Task<List<DeployedLootList>> _AddItemsToLoot(List<LootsToAdd_New> itemList, List<DeployLootTemplateListToAdd> lootTemplateList, int rulesetID, int selectedLootPileId, bool isVisible, List<LootIds_With_Qty> selectedLootItems, bool isComingFromCreateEditLootPile = false);
        Task<List<ItemMasterLoot_ViewModel>> GetItemMasterLoots(int rulesetID, int page = 1, int pageSize = 30);
        ItemMasterLoot CreateItemMasterLoot(ItemMaster result, ItemMasterLoot loot,
            List<ItemMasterLootSpell> AssociateSpellVM, List<ItemMasterLootAbility> AssociateAbilityVM,
            List<ItemMasterLootBuffAndEffect> AssociateBuffAndEffectVM, List<ItemMasterLootCommand> AssociateCommandVM,
            int rulesetId, Item item = null, List<CharacterCurrency> CharacterCurrency = null);
        Task<ItemMasterLoot> CreateItemMasterLootAsync(ItemMaster result, ItemMasterLoot loot,
            List<ItemMasterLootSpell> AssociateSpellVM, List<ItemMasterLootAbility> AssociateAbilityVM,
            List<ItemMasterLootBuffAndEffect> AssociateBuffAndEffectVM, List<ItemMasterLootCommand> AssociateCommandVM,
            int rulesetId, Item item = null);
        Task<ItemMasterLoot> UpdateItemMasterLoot(ItemMasterLoot loot, List<ItemMasterLootSpell> itemMasterSpell, List<ItemMasterLootAbility> itemMasterAbilities, List<ItemMasterLootBuffAndEffect> itemMasterBuffAndEffects, List<ItemMasterLootCommand> itemMasterCommand);
        Task<List<ItemMasterLoot_ViewModel>> GetLootItemsForPlayers(int rulesetID);
        Task<ItemMasterLoot> getLootDetails(int LootId);
        Task<bool> DeleteContainer(int itemMasterId);
        int GetCharacterItemCount(int characterId);
        Task<List<ItemMasterLoot_ViewModel>> GetByContainerId(int? containerId);
        int GetLootCountByRuleSetId(int rulesetId);
        ItemMasterLoot GetLootById(int id);
        Task<ItemMasterLoot> UpdateWeight(int itemMasterId, decimal TotalWeight);
        Task<ItemMasterLoot> UpdateContainer(int itemId, int containerItemId);
        ItemMasterMonsterItem getMonsterItemById(int id);
        Task DeleteItemMasterLoot(int lootId);
        Task ShowLoot(int lootID, bool isShow);
        Task<List<ItemMasterLoot_ViewModel>> GetAvailableContainerItems(int rulesetId, int ItemMasterId);
        decimal GetContainedItemWeight(int containerItemId);
        ItemMasterLoot_ViewModel GetContainer(int? lootId);
        ItemMasterMonsterItem GetMonsterContainer(int? containedIn);
        List<ItemMasterMonsterItem> GetByMonsterContainerId(int itemId);
        List<ItemMasterLoot_ViewModel> GetAvailableItems(int rulesetId);
        Task<List<ItemMasterLoot>> getMultipleLootDetails(List<int> LootId);
        SP_AbilitySpellForItemMaster AbilitySpellForLootsByRuleset_sp(int rulesetId, int lootID);
        Task DeleteMonsterItem(int id);
        bool isLootAvailable(int rulesetId);
        void DeleteMultiItemTemplates(List<ItemMaster_Bundle> model, int rulesetId);
        Task CreateLootPile(CreateLootPileModel model);
        LootPileViewModel getLootPileDetails(int lootPileId);
        Task UpdateLootPile(CreateLootPileModel itemDomain);
        LootPileViewModel getCharacterLootPile(int characterId);
        LootPileViewModel getMonsterLootPile(int monsterId, int rulesetId);
        Task ShowLootPile(int lootPileID, bool isVisible);
        List<LootPileViewModel> GetLootPilesListByCharacterId(int characterId, int rulesetId);
        Task<List<ItemMasterLoot_ViewModel>> GetItemsFromLootPile(int lootPileId);
        void MoveLoot(List<ItemMasterLoot> model, int lootPileID);
        Task<List<LootPileViewModel>> GetLootPilesListByRuleSetId(int rulesetId);
        List<DeployedLootList> DeployLootTemplateList(List<DeployLootTemplateListToAdd> lootTemplateList, bool isComingFromCreateEditLootPile = false,
            int selectedLootPileId = -1);
        List<DeployedLootList> DeployLootTemplateListSearch(List<DeployLootTemplateListToAdd> lootTemplateList, bool isComingFromCreateEditLootPile = false,
            int selectedLootPileId = -1);
        int Core_GetLootCountByRuleSetId(int rulesetId, int parentID);
        Task DeleteOrUpdateLootQuantity(List<LootIds_With_Name_Qty> model);
        Task<ItemMasterLoot> GetItemMasterLootById(int id);
        Task<string> GetItemMasterLootUniqueItemName(string LootPileItemName, int RuleSetId, int LootPileId);

        Task<List<ItemMaster>> GetItemMasterByRulesetIdExport(int ruleSetId, int parentRuleSetId);
        Task<string> GetUniqueName(string ItemName, int RuleSetId);
    }
}
