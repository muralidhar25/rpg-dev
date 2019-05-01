using DAL.Models;
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
        Task<ItemMaster> CreateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities);
        Task<ItemMaster> UpdateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities);
        Task<bool> DeleteItemMaster(int id);
        Task<int> GetItemMasterCount();
        int GetCountByRuleSetId(int ruleSetId);
        int Core_GetCountByRuleSetId(int ruleSetId, int parentID);
        Task<bool> CheckDuplicateItemMaster(string value, int? ruleSetId,int? itemMasterId = 0);
        Task<ItemMaster> GetDuplicateItemMaster(string value, int? ruleSetId, int? itemMasterId = 0);
        List<ItemMaster> Core_GetItemMastersByRuleSetId(int ruleSetId, int ParentID);
        Task<ItemMaster> Core_CreateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities);
        bool Core_ItemMasterWithParentIDExists(int itemMasterID, int RulesetID);
        List<ItemMaster_Bundle> SP_GetItemMastersByRuleSetId(int rulesetId, int page, int pageSize);
        SP_AbilitySpellForItemMaster AbilitySpellForItemsByRuleset_sp(int rulesetId, int itemMasterId);
        List<ItemMaster_Bundle> GetItemMastersByRuleSetId_add(int rulesetId, bool includeBundles = false);
        bool Core_BundleWithParentIDExists(int bundleId, int rulesetID);
        Task _AddItemsToLoot(List<CommonID> itemList);
        Task<List<ItemMasterLoot_ViewModel>> GetItemMasterLoots(int rulesetID, int page = 1, int pageSize = 30);
        ItemMasterLoot CreateItemMasterLoot(ItemMaster result, ItemMasterLoot loot);
        Task<ItemMasterLoot> UpdateItemMasterLoot(ItemMasterLoot loot);
        Task<List<ItemMasterLoot_ViewModel>> GetLootItemsForPlayers(int rulesetID);
        Task<ItemMasterLoot> getLootDetails(int LootId);
        Task<bool> DeleteContainer(int itemMasterId);
        Task<List<ItemMasterLoot_ViewModel>> GetByContainerId(int? containerId);
        Task<ItemMasterLoot> UpdateWeight(int itemMasterId, decimal TotalWeight);
        Task<ItemMasterLoot> UpdateContainer(int itemId, int containerItemId);
        Task DeleteItemMasterLoot(int lootId);
        Task ShowLoot(int lootID, bool isShow);
        Task<List<ItemMasterLoot_ViewModel>> GetAvailableContainerItems(int rulesetId, int ItemMasterId);
        decimal GetContainedItemWeight(int containerItemId);
        ItemMasterLoot_ViewModel GetContainer(int? lootId);
        List<ItemMasterLoot_ViewModel> GetAvailableItems(int rulesetId);
    }
}
