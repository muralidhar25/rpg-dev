using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IItemService
    {
        Task<Item> InsertItem(Item item, List<ItemSpell> ItemSpells, List<ItemAbility> ItemAbilities, List<ItemBuffAndEffect> ItemBuffAndEffects, List<ItemCommand> itemCommands=null);
        Task<Item> UpdateItem(Item item, List<ItemSpell> ItemSpells, List<ItemAbility> ItemAbilities, List<ItemBuffAndEffect> ItemBuffAndEffects);
        List<Item> GetAll();
        Item GetById(int? id);
        List<Item> GetByCharacterId(int characterId);
        List<Item> getItemByCharacterId(int characterId);        
        List<Item> GetByCharacterId(int characterId,int page, int pageSize);
        int GetCountByCharacterId(int characterId);
        Task<bool> DeleteItem(int id);
        bool DeleteItemNotAsync(int id);
        void ToggleEquippedItem(int id);
        (bool, string) CheckItemExist(int characterId, int itemMasterId);
        List<Item> GetByContainerId(int? containerId);
        List<Item> GetAvailableContainerItems(int characterId, int itemId);
        Item GetContainer(int? itemId);

        Task<bool> CheckDuplicateItem(string name, int? characterId, int? itemId = 0);
        List<Item> getDuplicateItems(int? characterId, int itemMasterId = 0);
        Task<Item> UpdateContainer(int itemId, int containerItemId);
        Task<Item> UpdateWeight(int itemId, decimal TotalWeight);
        decimal GetContainedItemWeight(int containerItemId);
        Task<bool> DeleteContainer(int itemId);
        Task<ItemMaster> Core_CreateItemMasterUsingItem(int ItemMasterID, int RulesetID);
        Task<int> Core_updateParentIDForAllRelatedItems(int characterId, int oldParentItemMasterID, int itemMasterIDInserted, char type);
        (CharacterItemWithFilterCount, Character, RuleSet) SP_Items_GetByCharacterId(int characterId, int rulesetId, int page, int pageSize, int sortType = 1);
        SP_AbilitySpellForItemMaster AbilitySpellForItemsByRuleset_sp(int characterId, int rulesetId, int itemId);
        void ManageContainer(int itemId, List<CommonID> list);
        CharacterSpell GetCharSpellIDUrl(int rulesetSpellID, int characterId);
        CharacterAbility GetCharAbilityIDUrl(int rulesetAbilityID, int characterId);
        List<ItemCommand> SP_GetItemCommands(int itemId);
        List<Item> GetNestedContainerItems(int itemid);
        List<Item> GetItemsByCharacterId(int characterId);
        List<Item> GetAvailableItems(int characterId);
        void AddItemToLoot(int? itemId,int Char_LootPileId);
        Task AddItemsSP(List<ItemMasterIds_With_Qty> multiItemMasters, List<ItemMasterBundleIds> multiItemMasterBundles, int characterId,bool IsLootItems);
        List<ItemMasterMonsterItem> getAvailableMonsterContainerItems(int rulesetId, int itemId);
        ItemMasterMonsterItem UpdateMonsterItem(ItemMasterMonsterItem item, List<ItemSpell> ItemSpells, List<ItemAbility> ItemAbilities, List<ItemBuffAndEffect> ItemBuffAndEffects, List<ItemCommand> itemCommandVM);
        void DropMultiItems(List<Item> model, int dropToLootPileId, int rulesetId, int characterId, ApplicationUser user);
        Task AddItemsToMonsterSP(List<ItemMasterIds> itemMasterIds, int monsterId);
        decimal ReduceItemQty(int itemId);
        void Toggle_Show_Hide_Item(int id);
        Task GivePlayerItems(GiveItemsFromPlayerCombat model, int givenByPlayerID, int ruleSetId);
    }
}
