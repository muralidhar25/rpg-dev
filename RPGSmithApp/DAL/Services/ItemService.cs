﻿using DAL.Models;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
using DAL.ViewModelProc;
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public class ItemService : IItemService
    {
        private readonly IRepository<Item> _repo;
        private readonly IRepository<ItemAbility> _repoItemAbility;
        private readonly IRepository<ItemSpell> _repoItemSpell;
        private readonly IRepository<ItemCommand> _repoItemCommand;
        protected readonly ApplicationDbContext _context;
        private readonly IItemMasterService _itemMasterService;
        private readonly IConfiguration _configuration;
        private readonly IMonsterTemplateService _monsterTemplateService;
        private readonly IItemMasterLootCurrencyService _itemMasterLootCurrencyService;

        

        public ItemService(ApplicationDbContext context, IRepository<Item> repo, IConfiguration configuration,
            IRepository<ItemAbility> repoItemAbility, IRepository<ItemSpell> repoItemSpell, IRepository<ItemCommand> repoItemCommand,
            IItemMasterService itemMasterService, IMonsterTemplateService monsterTemplateService,
            IItemMasterLootCurrencyService itemMasterLootCurrencyService)
        {
            _context = context;
            _repoItemAbility = repoItemAbility;
            _repoItemSpell = repoItemSpell;
            _repo = repo;
            _repoItemCommand = repoItemCommand;
            _itemMasterService = itemMasterService;
            this._configuration = configuration;
            this._monsterTemplateService = monsterTemplateService;
            this._itemMasterLootCurrencyService = itemMasterLootCurrencyService;
        }

        public async Task<bool> ItemFromTakeAll(ItemMasterLoot Loot, int CharacterId, bool IsTakeAll = false, bool isTakeFromPopup = false, int TakeFromPopupQty = 0)
        {
            try
            {
                if (IsTakeAll)
                {
                    var Item = await _context.Items.Where(x => x.ItemMasterId == Loot.ItemMasterId && x.Name == Loot.ItemName && x.CharacterId == CharacterId && (x.IsDeleted != true || x.IsDeleted == null)).FirstOrDefaultAsync();
                    if (Item == null) return false;

                    Item.Quantity += Loot.Quantity;
                    await _context.SaveChangesAsync();

                    var ItemMasterLootAbilitys = _context.ItemMasterLootAbilitys.Where(x => x.ItemMasterLootId == Loot.LootId).FirstOrDefault();
                    if (ItemMasterLootAbilitys != null) ItemMasterLootAbilitys.IsDeleted = true;

                    var ItemMasterLootSpells = _context.ItemMasterLootSpells.Where(x => x.ItemMasterLootId == Loot.LootId).FirstOrDefault();
                    if (ItemMasterLootSpells != null) ItemMasterLootSpells.IsDeleted = true;

                    var ItemMasterLootBuffAndEffects = _context.ItemMasterLootBuffAndEffects.Where(x => x.ItemMasterLootId == Loot.LootId).FirstOrDefault();
                    if (ItemMasterLootBuffAndEffects != null) ItemMasterLootBuffAndEffects.IsDeleted = true;

                    var ItemMasterLootCommands = _context.ItemMasterLootCommands.Where(x => x.ItemMasterLootId == Loot.LootId).FirstOrDefault();
                    if (ItemMasterLootCommands != null) ItemMasterLootCommands.IsDeleted = true;

                    var _itemMasterLoot = _context.ItemMasterLoots.Where(x => x.LootId == Loot.LootId).FirstOrDefault();
                    if (_itemMasterLoot != null) _itemMasterLoot.IsDeleted = true;
                    await _context.SaveChangesAsync();
                }
                else if (isTakeFromPopup)
                {
                    var Item = await _context.Items.Where(x => x.ItemMasterId == Loot.ItemMasterId && x.Name == Loot.ItemName && x.CharacterId == CharacterId && (x.IsDeleted != true || x.IsDeleted == null)).FirstOrDefaultAsync();
                    if (Item != null)
                    {
                        Item.Quantity += TakeFromPopupQty;
                        await _context.SaveChangesAsync();
                    }

                    var _itemMasterLoot = _context.ItemMasterLoots.Where(x => x.LootId == Loot.LootId).FirstOrDefault();
                    if (_itemMasterLoot != null)
                    {
                        _itemMasterLoot.Quantity -= TakeFromPopupQty;
                        await _context.SaveChangesAsync();
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task AddItemsSP(List<ItemMasterIds_With_Qty> multiItemMasters, List<ItemMasterBundleIds> multiItemMasterBundles, int characterId, bool IsLootItems)
        {

            foreach (var item in multiItemMasters)
            {
                var loot = _context.ItemMasterLoots.Where(x => x.LootId == item.ItemMasterId).FirstOrDefault();
                if (loot != null)
                {
                    if (loot.Quantity >= item.Qty)
                    {
                        loot.Quantity = loot.Quantity - item.Qty;
                        _context.SaveChanges();
                    }
                    item.IsDelete = loot.Quantity > 0 ? 0 : 1;
                }
            }

            DataTable ItemDT = utility.ToDataTable<CommonID_With_Qty>(multiItemMasters.Select(x => new CommonID_With_Qty { ID = x.ItemMasterId, Qty = x.Qty, IsDelete = x.IsDelete }).ToList());
            DataTable BundleDT = utility.ToDataTable<CommonID>(multiItemMasterBundles.Select(x => new CommonID { ID = x.ItemMasterBundleId }).ToList());

            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("AddItemsToCharacter"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@ItemsToAdd", ItemDT);
                    cmd.Parameters.AddWithValue("@BundlesToAdd", BundleDT);
                    cmd.Parameters.AddWithValue("@CharacterId", characterId);
                    cmd.Parameters.AddWithValue("@IsLootItems", IsLootItems);
                    con.Open();
                    var a = cmd.ExecuteNonQuery();
                    con.Close();
                }
            }
        }

        public async Task AddItemsToMonsterSP(List<ItemMasterIds> itemMasterIds, int monsterId)
        {
            DataTable ItemDT = utility.ToDataTable<CommonID>(itemMasterIds.Select(x => new CommonID { ID = x.ItemMasterId }).ToList());

            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("AddLootItemsToMonster"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@ItemsToAdd", ItemDT);
                    cmd.Parameters.AddWithValue("@MonsterId", monsterId);
                    con.Open();
                    var a = cmd.ExecuteNonQuery();
                    con.Close();
                }
            }
        }

        public async Task<Item> InsertItem(Item item, List<ItemSpell> ItemSpells, List<ItemAbility> ItemAbilities, List<ItemBuffAndEffect> ItemBuffAndEffects, List<ItemCommand> itemCommands = null)
        {
            item.ItemAbilities = new List<ItemAbility>();
            item.ItemSpells = new List<ItemSpell>();
            item.ItemBuffAndEffects = new List<ItemBuffAndEffect>();
            item.ItemCommandVM = new List<ItemCommand>();
            await _repo.Add(item);

            int ItemId = item.ItemId;

            if (ItemId > 0)
            {
                if (ItemSpells != null && ItemSpells.Count > 0)
                {
                    ItemSpells.ForEach(a => a.ItemId = ItemId);
                    await _repoItemSpell.AddRange(ItemSpells);
                }
                if (ItemAbilities != null && ItemAbilities.Count > 0)
                {
                    ItemAbilities.ForEach(a => a.ItemId = ItemId);
                    await _repoItemAbility.AddRange(ItemAbilities);
                }
                if (ItemBuffAndEffects != null && ItemBuffAndEffects.Count > 0)
                {
                    ItemBuffAndEffects.ForEach(a => a.ItemId = ItemId);
                    _context.ItemBuffAndEffects.AddRange(ItemBuffAndEffects);
                    _context.SaveChanges();
                }
                if (itemCommands != null && itemCommands.Count > 0)
                {
                    itemCommands.ForEach(a => a.ItemId = ItemId);
                    await _repoItemCommand.AddRange(itemCommands);
                    //_context.ItemCommands.AddRange(itemCommands);
                }
            }
            item.ItemAbilities = ItemAbilities;
            item.ItemSpells = ItemSpells;
            return item;

        }
        public async Task<ItemMaster> Core_CreateItemMasterUsingItem(int ItemMasterID, int RulesetID)
        {
            ItemMaster model = _itemMasterService.GetItemMasterById(ItemMasterID);
            ItemMaster itemMaster = new ItemMaster();
            itemMaster.ItemMasterId = model.ItemMasterId;
            itemMaster.Command = model.Command;
            itemMaster.ContainerVolumeMax = model.ContainerVolumeMax;
            itemMaster.ContainerWeightMax = model.ContainerWeightMax;
            itemMaster.ContainerWeightModifier = model.ContainerWeightModifier;
            itemMaster.IsConsumable = model.IsConsumable;
            itemMaster.IsContainer = model.IsContainer;
            itemMaster.IsMagical = model.IsMagical;
            itemMaster.ItemCalculation = model.ItemCalculation;
            itemMaster.ItemImage = model.ItemImage;
            itemMaster.ItemMasterId = model.ItemMasterId;
            itemMaster.ItemName = model.ItemName;
            itemMaster.ItemStats = model.ItemStats;
            itemMaster.ItemVisibleDesc = model.ItemVisibleDesc;
            itemMaster.gmOnly = model.gmOnly;
            itemMaster.Metatags = model.Metatags;
            itemMaster.PercentReduced = model.PercentReduced;
            itemMaster.Rarity = model.Rarity;
            itemMaster.RuleSetId = RulesetID;
            itemMaster.TotalWeightWithContents = model.TotalWeightWithContents;
            itemMaster.Value = model.Value;
            itemMaster.Volume = model.Volume;
            itemMaster.Weight = model.Weight;
            itemMaster.ItemMasterSpell = model.ItemMasterSpell;
            itemMaster.ItemMasterAbilities = model.ItemMasterAbilities;
            itemMaster.itemMasterBuffAndEffects = model.itemMasterBuffAndEffects;

            ItemMaster CreatedItemMaster = await _itemMasterService.Core_CreateItemMaster(itemMaster, itemMaster.ItemMasterSpell.ToList(), itemMaster.ItemMasterAbilities.ToList(), itemMaster.itemMasterBuffAndEffects.ToList());
            return CreatedItemMaster;
        }
        public async Task<Item> UpdateItem(Item item, List<ItemSpell> ItemSpells, List<ItemAbility> ItemAbilities, List<ItemBuffAndEffect> ItemBuffAndEffects)
        {
            var itemobj = _context.Items.Find(item.ItemId);

            if (itemobj == null)
                return item;
            try
            {
                itemobj.ContainedIn = item.ContainedIn;
                itemobj.Quantity = item.Quantity;
                itemobj.TotalWeight = item.TotalWeight;
                itemobj.IsIdentified = item.IsIdentified;
                itemobj.IsEquipped = item.IsEquipped;
                itemobj.IsVisible = item.IsVisible;

                itemobj.Name = item.Name;
                itemobj.Description = item.Description;
                itemobj.gmOnly = item.gmOnly;
                itemobj.CharacterId = item.CharacterId;
                itemobj.ItemMasterId = item.ItemMasterId;
                itemobj.ItemImage = item.ItemImage;

                itemobj.ContainedIn = item.ContainedIn;
                itemobj.IsContainer = item.IsContainer;

                itemobj.IsConsumable = item.IsConsumable;
                itemobj.IsMagical = item.IsMagical;
                itemobj.ItemCalculation = item.ItemCalculation;
                itemobj.Metatags = item.Metatags;
                itemobj.Rarity = item.Rarity;
                itemobj.Value = item.Value;
                itemobj.Volume = item.Volume;
                itemobj.Weight = item.Weight;
                itemobj.Command = item.Command;

                itemobj.ItemStats = item.ItemStats;
                itemobj.ContainerWeightMax = item.ContainerWeightMax;
                itemobj.ContainerVolumeMax = item.ContainerVolumeMax;
                itemobj.PercentReduced = item.PercentReduced;
                itemobj.TotalWeightWithContents = item.TotalWeightWithContents;
                itemobj.ContainerWeightModifier = item.ContainerWeightModifier;
                itemobj.CommandName = item.CommandName;

                if (ItemAbilities != null)
                {
                    _context.ItemAbilities.RemoveRange(_context.ItemAbilities.Where(x => x.ItemId == item.ItemId));
                    ItemAbilities.ForEach(a => a.ItemId = item.ItemId);
                    await _repoItemAbility.AddRange(ItemAbilities);
                }

                if (ItemSpells != null)
                {
                    _context.ItemSpells.RemoveRange(_context.ItemSpells.Where(x => x.ItemId == item.ItemId));
                    ItemSpells.ForEach(a => a.ItemId = item.ItemId);
                    await _repoItemSpell.AddRange(ItemSpells);
                }
                if (ItemBuffAndEffects != null)
                {
                    _context.ItemBuffAndEffects.RemoveRange(_context.ItemBuffAndEffects.Where(x => x.ItemId == item.ItemId));
                    ItemBuffAndEffects.ForEach(a => a.ItemId = item.ItemId);
                    _context.ItemBuffAndEffects.AddRange(ItemBuffAndEffects);
                    // _context.SaveChanges();
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return itemobj;
        }
        public ItemMasterMonsterItem UpdateMonsterItem(ItemMasterMonsterItem item,
            List<ItemSpell> ItemSpells,
            List<ItemAbility> ItemAbilities,
            List<ItemBuffAndEffect> ItemBuffAndEffects,
            List<ItemCommand> itemCommandVM)
        {
            var itemobj = _context.ItemMasterMonsterItems.Find(item.ItemId);

            if (itemobj == null)
                return item;
            try
            {
                itemobj.ContainedIn = item.ContainedIn;
                itemobj.Quantity = item.Quantity;
                itemobj.TotalWeight = item.TotalWeight;
                itemobj.IsIdentified = item.IsIdentified;
                itemobj.IsEquipped = item.IsEquipped;
                itemobj.IsVisible = item.IsVisible;

                itemobj.ItemName = item.ItemName;
                itemobj.ItemVisibleDesc = item.ItemVisibleDesc;
                //itemobj.CharacterId = item.CharacterId;
                // itemobj.ItemMasterId = item.ItemMasterId;
                itemobj.ItemImage = item.ItemImage;

                itemobj.ContainedIn = item.ContainedIn;
                itemobj.IsContainer = item.IsContainer;

                itemobj.IsConsumable = item.IsConsumable;
                itemobj.IsMagical = item.IsMagical;
                itemobj.ItemCalculation = item.ItemCalculation;
                itemobj.Metatags = item.Metatags;
                itemobj.Rarity = item.Rarity;
                itemobj.Value = item.Value;
                itemobj.Volume = item.Volume;
                itemobj.Weight = item.Weight;
                itemobj.Command = item.Command;

                itemobj.ItemStats = item.ItemStats;
                itemobj.ContainerWeightMax = item.ContainerWeightMax;
                itemobj.ContainerVolumeMax = item.ContainerVolumeMax;
                itemobj.PercentReduced = item.PercentReduced;
                itemobj.TotalWeightWithContents = item.TotalWeightWithContents;
                itemobj.ContainerWeightModifier = item.ContainerWeightModifier;
                itemobj.CommandName = item.CommandName;

                if (ItemAbilities != null)
                {
                    _context.ItemMasterMonsterItemAbilitys.RemoveRange(_context.ItemMasterMonsterItemAbilitys.Where(x => x.ItemMasterMonsterItemId == item.ItemId));

                    _context.ItemMasterMonsterItemAbilitys.AddRange(ItemAbilities.Select(x => new ItemMasterMonsterItemAbility() { AbilityId = x.AbilityId, ItemMasterMonsterItemId = item.ItemId }));
                }

                if (ItemSpells != null)
                {
                    _context.ItemMasterMonsterItemSpells.RemoveRange(_context.ItemMasterMonsterItemSpells.Where(x => x.ItemMasterMonsterItemId == item.ItemId));

                    _context.ItemMasterMonsterItemSpells.AddRange(ItemSpells.Select(x => new ItemMasterMonsterItemSpell() { SpellId = x.SpellId, ItemMasterMonsterItemId = item.ItemId }));


                }
                if (ItemBuffAndEffects != null)
                {
                    _context.ItemMasterMonsterItemBuffAndEffects.RemoveRange(_context.ItemMasterMonsterItemBuffAndEffects.Where(x => x.ItemMasterMonsterItemId == item.ItemId));
                    _context.ItemMasterMonsterItemBuffAndEffects.AddRange(ItemBuffAndEffects.Select(x => new ItemMasterMonsterItemBuffAndEffect() { BuffAndEffectId = x.BuffAndEffectId, ItemMasterMonsterItemId = item.ItemId }));


                }
                if (itemCommandVM != null)
                {
                    _context.ItemMasterMonsterItemCommands.RemoveRange(_context.ItemMasterMonsterItemCommands.Where(x => x.ItemMasterMonsterItemId == item.ItemId));
                    _context.ItemMasterMonsterItemCommands.AddRange(itemCommandVM.Select(x => new ItemMasterMonsterItemCommand() { Command = x.Command, Name = x.Name, ItemMasterMonsterItemId = item.ItemId }));


                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return itemobj;
        }
        public async Task<Item> UpdateContainer(int itemId, int containerItemId)
        {
            var item = _context.Items.Where(x => x.ItemId == itemId && x.IsDeleted != true).FirstOrDefault();

            if (item == null) return item;

            if (containerItemId > 0 && (item.ContainedIn == null || item.ContainedIn == 0))
            {
                item.ContainedIn = containerItemId;
                _context.SaveChanges();
            }

            return item;
        }
        public void ManageContainer(int itemId, List<CommonID> list)
        {
            DataTable dt = utility.ToDataTable<CommonID>(list);

            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("Item_DropContainer"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@ItemID", itemId);
                    cmd.Parameters.AddWithValue("@TempIdsparam", dt);
                    con.Open();
                    var a = cmd.ExecuteNonQuery();
                    con.Close();
                }
            }

        }
        public async Task<Item> UpdateWeight(int itemId, decimal TotalWeight)
        {
            var item = _context.Items.Where(x => x.ItemId == itemId && x.IsDeleted != true).FirstOrDefault();

            if (item == null) return item;
            item.TotalWeight = TotalWeight;
            _context.SaveChanges();

            //if (containerItemId > 0 && (item.ContainedIn == null || item.ContainedIn == 0))
            //{
            //    item.ContainedIn = containerItemId;
            //    _context.SaveChanges();
            //}

            return item;
        }

        public decimal GetContainedItemWeight(int containerItemId)
            => _context.Items.Where(x => x.ItemId == containerItemId && x.IsDeleted != true).Select(x => x.TotalWeight).FirstOrDefault();

        public async Task<bool> DeleteContainer(int itemId)
        {
            var item = _context.Items.Where(x => x.ContainedIn == itemId).ToList();

            foreach (Item itm in item)
            {
                itm.ContainedIn = null;
                _context.SaveChanges();
            }

            return true;
        }

        public async Task<bool> DeleteItem(int id)
        {
            // Remove associated Abilities
            var ItemAbilities = _context.ItemAbilities.Where(x => x.ItemId == id && x.IsDeleted != true).ToList();
            foreach (ItemAbility ability in ItemAbilities)
            {
                ability.IsDeleted = true;
            }

            // Remove associated Spells
            var ItemSpells = _context.ItemSpells.Where(x => x.ItemId == id && x.IsDeleted != true).ToList();
            foreach (ItemSpell spell in ItemSpells)
            {
                spell.IsDeleted = true;
            }

            // Remove associated Commands
            var ItemCommands = _context.ItemCommands.Where(x => x.ItemId == id && x.IsDeleted != true).ToList();
            foreach (ItemCommand command in ItemCommands)
            {
                command.IsDeleted = true;
            }

            //Remove Link from Character Character Stats
            var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "item" && x.DefaultValue == id).ToList();
            foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
            {
                LRCCS.DefaultValue = 0;
                LRCCS.LinkType = "";
            }

            var item = await _repo.Get(id);

            if (item == null)
                return false;

            item.ContainedIn = null;
            item.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool DeleteItemNotAsync(int id)
        {
            // Remove associated Abilities
            var ItemAbilities = _context.ItemAbilities.Where(x => x.ItemId == id && x.IsDeleted != true);
            foreach (ItemAbility ability in ItemAbilities)
            {
                ability.IsDeleted = true;
            }

            // Remove associated Spells
            var ItemSpells = _context.ItemSpells.Where(x => x.ItemId == id && x.IsDeleted != true);
            foreach (ItemSpell spell in ItemSpells)
            {
                spell.IsDeleted = true;
            }

            // Remove associated Commands
            var ItemCommands = _context.ItemCommands.Where(x => x.ItemId == id && x.IsDeleted != true);
            foreach (ItemCommand command in ItemCommands)
            {
                command.IsDeleted = true;
            }
            //Remove Link from Character Character Stats
            var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "item" && x.DefaultValue == id).ToList();
            foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
            {
                LRCCS.DefaultValue = 0;
                LRCCS.LinkType = "";
            }

            var item = _context.Items.SingleOrDefault(p => p.ItemId == id);
            if (item == null)
                return false;

            item.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public List<Item> GetByCharacterId(int characterId)
        {
            return _context.Items
                .Include(d => d.Character.RuleSet).Include(d => d.ItemMaster)
                .Include(d => d.ItemCommandVM)
                .Include(d => d.ItemSpells).ThenInclude(d => d.Spell)
                .Include(d => d.ItemAbilities).ThenInclude(d => d.Ability)
                .Where(x => x.CharacterId == characterId && x.IsDeleted.GetValueOrDefault() != true).OrderBy(o => o.Name).ToList();
        }
        public List<Item> getItemByCharacterId(int characterId)
        {
            return _context.Items
              .Where(x => x.CharacterId == characterId && x.IsDeleted.GetValueOrDefault() != true).OrderBy(o => o.Name).ToList();
        }
        public List<Item> GetItemsByCharacterId(int characterId)
        {
            return _context.Items
                .Where(x => x.CharacterId == characterId && x.IsDeleted.GetValueOrDefault() != true).ToList();
        }

        public List<Item> GetAvailableContainerItems(int characterId, int itemId)
        {
            // get all character items exept item itself
            return _context.Items.Where(x => x.CharacterId == characterId && x.ItemId != itemId
                && x.IsContainer == true && x.IsDeleted != true).ToList();
            //&& x.ContainedIn == null //if isContainer is true then item is a container & an item can act as container for many item
        }
        public List<ItemMasterMonsterItem> getAvailableMonsterContainerItems(int rulesetId, int itemId)
        {
            // get all character items exept item itself
            return _context.ItemMasterMonsterItems.Where(x => x.RuleSetId == rulesetId && x.ItemId != itemId
                && x.IsContainer == true && x.IsDeleted != true).ToList();
            //&& x.ContainedIn == null //if isContainer is true then item is a container & an item can act as container for many item
        }

        public List<Item> GetByContainerId(int? containerId)
        {
            //get all item for which given item act as container
            return _context.Items
               .Where(x => x.ContainedIn == containerId && x.IsDeleted != true)
               .OrderBy(o => o.Name).ToList();
        }

        public Item GetContainer(int? itemId)
        {
            //to get container
            return _context.Items.Where(x => x.ItemId == itemId && x.IsDeleted != true).FirstOrDefault();
        }

        public List<Item> GetByCharacterId(int characterId, int page, int pageSize)
        {
            return _context.Items
                .Include(d => d.Character.RuleSet).Include(d => d.ItemMaster)
                .Include(d => d.ItemCommandVM)
                .Include(d => d.ItemSpells).ThenInclude(d => d.Spell)
                .Include(d => d.ItemAbilities).ThenInclude(d => d.Ability)
                .Where(x => x.CharacterId == characterId && x.IsDeleted != true)
                .OrderBy(o => o.Name).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
        }

        public Item GetById(int? id)
        {
            return _context.Items
                .Include(d => d.Character.RuleSet).Include(d => d.ItemMaster)
                .Include(d => d.ItemCommandVM)
                .Include(d => d.ItemSpells).ThenInclude(d => d.Spell)
                .Include(d => d.ItemAbilities).ThenInclude(d => d.Ability)
                .Include(d => d.ItemBuffAndEffects).ThenInclude(d => d.BuffAndEffect)
                .FirstOrDefault(x => x.ItemId == id && x.IsDeleted != true);
        }

        public (bool, string) CheckItemExist(int characterId, int itemMasterId)
        {
            bool IsExist = _context.Items.Any(x => x.CharacterId == characterId && x.ItemMasterId == itemMasterId && x.IsDeleted != true);
            string name = string.Empty;
            if (IsExist)
            {
                try
                {
                    name = _context.Items.Where(x => x.CharacterId == characterId && x.ItemMasterId == itemMasterId && x.IsDeleted != true).FirstOrDefault().ItemMaster.ItemName;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                return (IsExist, name);
            }
            else return (false, name);
        }

        public List<Item> GetAll()
        {
            return _context.Items.Where(p => p.IsDeleted != true).OrderBy(o => o.Name)
                .Include(d => d.Character.RuleSet).Include(d => d.ItemMaster)
                .Include(d => d.ItemCommandVM)
                .Include(d => d.ItemSpells).ThenInclude(d => d.Spell)
                .Include(d => d.ItemAbilities).ThenInclude(d => d.Ability)
                .AsNoTracking()
                .ToList();
        }
        public List<Item> GetAvailableItems(int characterId)
        {
            return _context.Items.Where(p => p.CharacterId == characterId && p.IsDeleted != true)
               .OrderBy(o => o.Name).ToList();
        }
        public int GetCountByCharacterId(int characterId)
        {
            return _context.Items.Where(x => x.CharacterId == characterId && x.IsDeleted != true).Count();
        }

        public void ToggleEquippedItem(int id)
        {
            var item = _context.Items.Find(id);

            if (item == null)
                return;
            try
            {
                if (item.IsEquipped == true)
                {
                    item.IsEquipped = false;
                }
                else
                {
                    item.IsEquipped = true;
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }

        public void Toggle_Show_Hide_Item(int id)
        {
            var item = _context.Items.Find(id);

            if (item == null)
                return;
            try
            {
                if (item.IsVisible == true)
                {
                    item.IsVisible = false;
                }
                else
                {
                    item.IsVisible = true;
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }

        public async Task<bool> CheckDuplicateItem(string name, int? characterId, int? itemId = 0)
        {
            var items = _repo.GetAll();

            if (items.Result == null || items.Result.Count == 0)
                return false;
            else if (characterId > 0)
                return items.Result.Where(x => x.Name.ToLower() == name.ToLower() && x.CharacterId == characterId && x.ItemId != itemId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            else
                return false;

            //return items.Result.Where(x => x.Name.ToLower() == name.ToLower() && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }

        public List<Item> getDuplicateItems(int? characterId, int itemMasterId = 0)
        {
            var items = _repo.GetAll();

            if (items.Result == null || items.Result.Count == 0)
                return null;
            else if (characterId > 0)
                return items.Result.Where(x => x.ItemMasterId == itemMasterId && x.CharacterId == characterId && x.IsDeleted != true).ToList();
            else
                return null;
        }

        public async Task<int> Core_updateParentIDForAllRelatedItems(int characterId, int oldParentItemMasterID, int itemMasterIDInserted, char type)
        {

            // var query = "EXEC Core_UpdateItemMasterIDs @CharacterID ="+ characterId + ",@ItemMasterId="+ oldParentItemMasterID + ",@NewItemMasterId="+ itemMasterIDInserted + ",@Type='"+ type + "'";
            //return await _context.Database.ExecuteSqlCommandAsync(query);
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            int rowseffectesd = 0;
            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("Core_UpdateItemMasterIDs", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@CharacterID", SqlDbType.Int).Value = characterId;
            cmd.Parameters.Add("@ItemMasterId", SqlDbType.Int).Value = oldParentItemMasterID;
            cmd.Parameters.Add("@NewItemMasterId", SqlDbType.Int).Value = itemMasterIDInserted;
            cmd.Parameters.Add("@Type", SqlDbType.Char, 1).Value = type;

            rowseffectesd = cmd.ExecuteNonQuery();
            con.Close();
            return rowseffectesd;
        }
        public CharacterSpell GetCharSpellIDUrl(int rulesetSpellID, int characterId)
        {
            return _context.CharacterSpells.Where(q => q.SpellId == rulesetSpellID && q.CharacterId == characterId && q.IsDeleted != true).FirstOrDefault();
        }
        public CharacterAbility GetCharAbilityIDUrl(int rulesetAbilityID, int characterId)
        {
            return _context.CharacterAbilities.Where(q => q.AbilityId == rulesetAbilityID && q.CharacterId == characterId && q.IsDeleted != true).FirstOrDefault();
        }
        #region SP relate methods

        public (CharacterItemWithFilterCount, Character, RuleSet) SP_Items_GetByCharacterId(int characterId, int rulesetId, int page, int pageSize, int sortType = 1)
        {
            CharacterItemWithFilterCount result = new CharacterItemWithFilterCount();
            List<Item> _ItemList = new List<Item>();
            RuleSet ruleset = new RuleSet();
            Character character = new Character();

            int FilterAplhabetCount = 0;
            int FilterUnContainedCount = 0;
            int FilterEquippedCount = 0;
            int FilterVisibleCount = 0;

            result.items = _ItemList;
            result.FilterAplhabetCount = FilterAplhabetCount;
            result.FilterUnContainedCount = FilterUnContainedCount;
            result.FilterEquippedCount = FilterEquippedCount;
            result.FilterVisibleCount = FilterVisibleCount;



            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Item_GetByCharacterId @CharacterId='" + characterId + "',@RulesetID='" + rulesetId + "',@page='" + page + "',@size='" + pageSize + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Item_GetByCharacterId", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterId", characterId);
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.Parameters.AddWithValue("@SortType", sortType);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }

            if (ds.Tables[1].Rows.Count > 0)
                ruleset = _repo.GetRuleset(ds.Tables[1], num);
            if (ds.Tables[2].Rows.Count > 0)
                character = _repo.GetCharacter(ds.Tables[2]);

            if (ds.Tables[0].Rows.Count > 0)
            {

                foreach (DataRow row in ds.Tables[0].Rows)
                {

                    Item i = new Item();
                    i.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"].ToString());
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    i.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
                    i.ItemImage = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                    i.CharacterId = characterId;
                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"].ToString());
                    i.Quantity = row["Quantity"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Quantity"]);
                    i.TotalWeight = row["TotalWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeight"]);
                    i.IsIdentified = row["IsIdentified"] == DBNull.Value ? false : Convert.ToBoolean(row["IsIdentified"]);
                    i.IsVisible = row["IsVisible"] == DBNull.Value ? false : Convert.ToBoolean(row["IsVisible"]);
                    i.IsEquipped = row["IsEquipped"] == DBNull.Value ? false : Convert.ToBoolean(row["IsEquipped"]);
                    i.ParentItemId = row["ParentItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentItemId"].ToString());
                    i.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    i.ContainedIn = row["ContainedIn"] == DBNull.Value ? 0 : Convert.ToInt32(row["ContainedIn"].ToString());
                    i.IsConsumable = row["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(row["IsConsumable"]);
                    i.IsContainer = row["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(row["IsContainer"]);
                    i.IsMagical = row["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMagical"]);
                    i.ItemCalculation = row["ItemCalculation"] == DBNull.Value ? null : row["ItemCalculation"].ToString();
                    i.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                    i.Rarity = row["Rarity"] == DBNull.Value ? null : row["Rarity"].ToString();
                    i.Value = row["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Value"]);
                    i.Volume = row["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Volume"]);
                    i.Weight = row["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Weight"]);
                    i.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    i.ContainerVolumeMax = row["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerVolumeMax"]);
                    i.ContainerWeightMax = row["ContainerWeightMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerWeightMax"]);
                    i.ContainerWeightModifier = row["ContainerWeightModifier"] == DBNull.Value ? null : row["ContainerWeightModifier"].ToString();
                    i.ItemStats = row["ItemStats"] == DBNull.Value ? null : row["ItemStats"].ToString();
                    i.PercentReduced = row["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(row["PercentReduced"]);
                    i.TotalWeightWithContents = row["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeightWithContents"]);
                    i.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    _ItemList.Add(i);
                }
            }

            if (ds.Tables[3].Rows.Count > 0)
            {
                FilterAplhabetCount = ds.Tables[3].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[3].Rows[0][0]);
            }
            if (ds.Tables[4].Rows.Count > 0)
            {
                FilterEquippedCount = ds.Tables[4].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[4].Rows[0][0]);
            }
            if (ds.Tables[5].Rows.Count > 0)
            {
                FilterVisibleCount = ds.Tables[5].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[5].Rows[0][0]);
            }
            if (ds.Tables[6].Rows.Count > 0)
            {
                FilterUnContainedCount = ds.Tables[6].Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[6].Rows[0][0]);
            }

            result.items = _ItemList;
            result.FilterAplhabetCount = FilterAplhabetCount;
            result.FilterUnContainedCount = FilterUnContainedCount;
            result.FilterEquippedCount = FilterEquippedCount;
            result.FilterVisibleCount = FilterVisibleCount;
            //return result;

            return (result, character, ruleset);
        }
        public (CharacterItemWithFilterCount, Character, RuleSet) SP_Items_GetByCharacterId_new(int characterId, int rulesetId, int page, int pageSize, int sortType = 1)
        {
            CharacterItemWithFilterCount result = new CharacterItemWithFilterCount();
            List<Item> _ItemList = new List<Item>();
            RuleSet ruleset = new RuleSet();
            Character character = new Character();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string qry = "EXEC Item_GetByCharacterId @CharacterId = '" + characterId + "',@RulesetID = '" + rulesetId + "',@page = '" + page + "',@size = '" + pageSize + "',@SortType = '" + sortType + "'";

                try
                {
                    connection.Open();
                    var item_record = connection.QueryMultiple(qry);
                    _ItemList = item_record.Read<Item>().ToList();
                    ruleset = item_record.Read<RuleSet>().FirstOrDefault();
                    character = item_record.Read<Character>().FirstOrDefault();

                    result.FilterAplhabetCount = item_record.Read<AlphabetCountSP>().FirstOrDefault().AplhabetCount;
                    result.FilterEquippedCount = item_record.Read<FilterEquippedCountSP>().FirstOrDefault().EquippedCount;
                    result.FilterVisibleCount = item_record.Read<FilterVisibleCountSP>().FirstOrDefault().VisibleCount;
                    result.FilterUnContainedCount = item_record.Read<FilterUnContainedCountSP>().FirstOrDefault().UncontainedCount;
                    result.items = _ItemList;
                }
                catch (Exception ex1)
                {
                    throw ex1;
                }
                finally
                {
                    connection.Close();
                }
            }
            //return result;
            return (result, character, ruleset);
        }

        public SP_AbilitySpellForItemMaster AbilitySpellForItemsByRuleset_sp_old(int characterId, int rulesetId, int itemId)
        {
            SP_AbilitySpellForItemMaster res = new SP_AbilitySpellForItemMaster();
            res.abilityList = new List<Ability>();
            res.selectedAbilityList = new List<Ability>();
            res.spellList = new List<Spell>();
            res.selectedSpellList = new List<Spell>();
            res.selectedItemCommand = new List<ItemCommand>();
            res.buffAndEffectsList = new List<BuffAndEffect>();
            res.selectedBuffAndEffects = new List<BuffAndEffect>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Item_Ability_Spell_GetByRulesetID @RulesetID = '" + rulesetId + "',@CharacterId='" + characterId + "',@ItemID = '" + itemId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Item_Ability_Spell_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterId", characterId);
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@ItemID", itemId);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }

            if (ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.abilityList.Add(i);
                }

            }
            if (ds.Tables[1].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.spellList.Add(i);
                }

            }
            if (ds.Tables[2].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[2].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.buffAndEffectsList.Add(i);
                }

            }
            if (ds.Tables[3].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[3].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedAbilityList.Add(i);
                }

            }
            if (ds.Tables[4].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[4].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedSpellList.Add(i);
                }

            }
            if (ds.Tables[5].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[5].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedBuffAndEffects.Add(i);
                }

            }
            if (ds.Tables[6].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[6].Rows)
                {
                    ItemCommand i = new ItemCommand();
                    i.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    i.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ItemCommandId = row["ItemCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemCommandId"]);
                    i.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"]);
                    res.selectedItemCommand.Add(i);
                }

            }
            return res;
        }

        public SP_AbilitySpellForItemMaster AbilitySpellForItemsByRuleset_sp(int characterId, int rulesetId, int itemId)
        {
            SP_AbilitySpellForItemMaster res = new SP_AbilitySpellForItemMaster();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            string qry = "EXEC Item_Ability_Spell_GetByRulesetID @CharacterId = '" + characterId + "',@RulesetID = '" + rulesetId + "',@ItemID = '" + itemId + "'";
           
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    var data = connection.QueryMultiple(qry);
                    res.abilityList = data.Read<Ability>().ToList();
                    res.spellList = data.Read<Spell>().ToList();
                    res.buffAndEffectsList = data.Read<BuffAndEffect>().ToList();
                    res.selectedAbilityList = data.Read<Ability>().ToList();
                    res.selectedSpellList = data.Read<Spell>().ToList();
                    res.selectedBuffAndEffects = data.Read<BuffAndEffect>().ToList();
                    res.selectedItemCommand = data.Read<ItemCommand>().ToList();
                }
                catch (Exception ex1)
                {
                    throw ex1;
                }
                finally
                {
                    connection.Close();
                }
            }
            return res;
        }

        public List<ItemCommand> SP_GetItemCommands_Old(int itemId)
        {
            List<ItemCommand> _ItemCommand = new List<ItemCommand>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Item_GetItemCommands @ItemId = '" + itemId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Item_GetItemCommands", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@ItemId", itemId);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }

            if (ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    ItemCommand _cmd = new ItemCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"].ToString());
                    _cmd.ItemCommandId = row["ItemCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    _ItemCommand.Add(_cmd);
                }
            }

            return _ItemCommand;
        }

        public List<ItemCommand> SP_GetItemCommands(int itemId)
        {
            List<ItemCommand> _ItemCommand = new List<ItemCommand>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string qry = "EXEC Item_GetItemCommands @ItemId = '" + itemId + "'";
                try
                {
                    connection.Open();
                    _ItemCommand = connection.Query<ItemCommand>(qry).ToList();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    connection.Close();
                }
            }
            return _ItemCommand;
        }

        public List<Item> GetNestedContainerItems_old(int itemid)
        {
            List<Item> _ItemsList = new List<Item>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Item_DropContainer @ItemID =" + itemid + "";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Item_DropContainer", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@ItemID", itemid);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }

            foreach (DataTable dt in ds.Tables)
            {
                if (dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        Item i = new Item();
                        i.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"]);
                        i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                        //i.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                        //i.ItemImage = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                        i.CharacterId = row["CharacterId"] == DBNull.Value ? null : (int?)(row["CharacterId"]);
                        i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"].ToString());
                        //i.Quantity = row["Quantity"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Quantity"]);
                        //i.TotalWeight = row["TotalWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeight"]);
                        //i.IsIdentified = row["IsIdentified"] == DBNull.Value ? false : Convert.ToBoolean(row["IsIdentified"]);
                        //i.IsVisible = row["IsVisible"] == DBNull.Value ? false : Convert.ToBoolean(row["IsVisible"]);
                        //i.IsEquipped = row["IsEquipped"] == DBNull.Value ? false : Convert.ToBoolean(row["IsEquipped"]);
                        i.ParentItemId = row["ParentItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentItemId"].ToString());
                        i.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                        i.ContainedIn = row["ContainedIn"] == DBNull.Value ? 0 : Convert.ToInt32(row["ContainedIn"].ToString());
                        //i.IsConsumable = row["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(row["IsConsumable"]);
                        //i.IsContainer = row["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(row["IsContainer"]);
                        //i.IsMagical = row["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMagical"]);
                        //i.ItemCalculation = row["ItemCalculation"] == DBNull.Value ? null : row["ItemCalculation"].ToString();
                        //i.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                        //i.Rarity = row["Rarity"] == DBNull.Value ? null : row["Rarity"].ToString();
                        //i.Value = row["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Value"]);
                        //i.Volume = row["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Volume"]);
                        //i.Weight = row["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Weight"]);
                        //i.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                        //i.ContainerVolumeMax = row["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerVolumeMax"]);
                        //i.ContainerWeightMax = row["ContainerWeightMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerWeightMax"]);
                        //i.ContainerWeightModifier = row["ContainerWeightModifier"] == DBNull.Value ? null : row["ContainerWeightModifier"].ToString();
                        //i.ItemStats = row["ItemStats"] == DBNull.Value ? null : row["ItemStats"].ToString();
                        //i.PercentReduced = row["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(row["PercentReduced"]);
                        //i.TotalWeightWithContents = row["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeightWithContents"]);

                        _ItemsList.Add(i);
                    }
                }

            }
            return _ItemsList;
        }

        public List<Item> GetNestedContainerItems(int itemid)
        {
            List<Item> _ItemsList = new List<Item>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string qry = "EXEC Item_DropContainer @ItemID ='" + itemid + "'";
                try
                {
                    connection.Open();
                    _ItemsList = connection.Query<Item>(qry).ToList();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    connection.Close();
                }
            }
            return _ItemsList;
        }

        #endregion
        public void AddItemToLoot(int? itemId, int Char_LootPileId, decimal Qty = -1, List<CharacterCurrency> CharacterCurrency = null)
        {
            if (itemId != null)
            {

                Item obj = _context.Items.Where(x => x.ItemId == (int)itemId).Include(x => x.ItemCommandVM)
                    .Include(x => x.ItemAbilities).Include(x => x.ItemSpells).Include(x => x.ItemBuffAndEffects)
                    .FirstOrDefault();

                ItemMaster objItemMaster = _context.ItemMasters.Where(x => x.ItemMasterId == obj.ItemMasterId).FirstOrDefault();

                var ItemMasterAbilities = new List<ItemMasterLootAbility>();
                var ItemMasterSpell = new List<ItemMasterLootSpell>();
                var itemMasterBuffAndEffects = new List<ItemMasterLootBuffAndEffect>();
                var ItemMasterCommand = new List<ItemMasterLootCommand>();
                if (obj.ItemSpells != null)
                {
                    ItemMasterSpell = obj.ItemSpells.Select(x => new ItemMasterLootSpell()
                    {
                        SpellId = x.SpellId,
                    }).ToList();
                }
                if (obj.ItemAbilities != null)
                {
                    ItemMasterAbilities = obj.ItemAbilities.Select(x => new ItemMasterLootAbility()
                    {
                        AbilityId = x.AbilityId,
                    }).ToList();
                }
                if (obj.ItemBuffAndEffects != null)
                {
                    itemMasterBuffAndEffects = obj.ItemBuffAndEffects.Select(x => new ItemMasterLootBuffAndEffect()
                    {
                        BuffAndEffectId = x.BuffAndEffectId,
                    }).ToList();
                }
                if (obj.ItemCommandVM != null)
                {
                    ItemMasterCommand = obj.ItemCommandVM.Select(x => new ItemMasterLootCommand()
                    {
                        Command = x.Command,
                        Name = x.Name
                    }).ToList();
                }
                if (obj != null)
                {
                    int rulesetId = objItemMaster.RuleSetId;
                    var character = _context.Characters.Where(x => x.CharacterId == obj.CharacterId).FirstOrDefault();
                    if (character != null)
                    {
                        rulesetId = character.RuleSetId != null ? (int)character.RuleSetId : objItemMaster.RuleSetId;
                    }

                    int? nullnumber = null;
                    bool IsNewLootItem = true;

                    if (Qty == -1)
                    {
                        IsNewLootItem = true;
                    }
                    else
                    {
                        var ExistingLootItem = _context.ItemMasterLoots.Where(x => x.ItemMasterId == objItemMaster.ItemMasterId && (x.LootPileId == Char_LootPileId || (x.LootPileId == null && Char_LootPileId == -1 && x.LootPileCharacterId == null)) && (x.IsDeleted != true || x.IsDeleted == null)).FirstOrDefault();
                        if (ExistingLootItem == null) IsNewLootItem = true;
                        else
                        {
                            IsNewLootItem = false;
                            ExistingLootItem.Quantity += Qty;
                            _context.SaveChanges();
                        }
                    }
                    if (IsNewLootItem)
                    {
                        obj.Quantity = Qty == -1 ? obj.Quantity : Qty;
                        _itemMasterService.CreateItemMasterLoot(objItemMaster, new ItemMasterLoot()
                        {
                            IsShow = true,
                            LootPileId = Char_LootPileId == -1 ? nullnumber : Char_LootPileId,
                            Quantity = Qty == -1 ? obj.Quantity : Qty
                        },
                            ItemMasterSpell, ItemMasterAbilities, itemMasterBuffAndEffects, ItemMasterCommand, rulesetId, obj, CharacterCurrency
                        );
                    }
                }
            }

        }
        public void DropMultiItems(List<Item> model, int dropToLootPileId, int rulesetId, int characterId, ApplicationUser user)
        {
            int index = 0;
            List<numbersList> dtList = model.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x.ItemId,
                Quantity = x.Quantity
            }).ToList();


            DataTable DT_List = new DataTable();

            if (dtList.Count > 0)
            {
                DT_List = utility.ToDataTable<numbersList>(dtList);
            }

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Character_DeleteMultiItems", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RecordIdsList", DT_List);
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }
            List<int> itemIDsDeleted = new List<int>();
            if (ds.Tables.Count > 0)
            {
                foreach (DataTable table in ds.Tables)
                {
                    if (table.Rows.Count > 0)
                    {
                        int itemId = table.Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(table.Rows[0][0]);
                        itemIDsDeleted.Add(itemId);
                    }
                }
            }
            if (itemIDsDeleted.Any())
            {
                itemIDsDeleted = itemIDsDeleted.Distinct().ToList();
                foreach (var _item in itemIDsDeleted)
                {
                    var currentUser = user;
                    if (currentUser.IsGm || currentUser.IsGmPermanent)
                    {
                        AddItemToLoot(_item, dropToLootPileId);
                    }
                    else if (isInvitedPlayerCharacter(characterId).Result)
                    {
                        AddItemToLoot(_item, dropToLootPileId);
                    }
                }

            }
            //string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //int rowseffectesd = 0;
            //SqlConnection con = new SqlConnection(connectionString);
            //con.Open();
            //SqlCommand cmd = new SqlCommand("Character_DeleteMultiItems", con);
            //cmd.CommandType = CommandType.StoredProcedure;

            //cmd.Parameters.AddWithValue("@RecordIdsList", DT_List);
            //cmd.Parameters.AddWithValue("@RulesetID", rulesetId);
            //cmd.Parameters.AddWithValue("@DropToLootPileId", dropToLootPileId);

            //rowseffectesd = cmd.ExecuteNonQuery();
            //con.Close();
        }

        public async Task DropMultipleItemsWithCurrency(List<numbersList> dtList, int dropToLootPileId, int rulesetId, int characterId, ApplicationUser user, List<CharacterCurrency> CharacterCurrency = null)
        {
            DataTable DT_List = new DataTable();
            if (dtList.Count > 0)
            {
                DT_List = utility.ToDataTable<numbersList>(dtList);
            }

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Character_DeleteMultiItems", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RecordIdsList", DT_List);
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(ds);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }
            List<int> itemIDsDeleted = new List<int>();
            if (ds.Tables.Count > 0)
            {
                foreach (DataTable table in ds.Tables)
                {
                    if (table.Rows.Count > 0)
                    {
                        int itemId = table.Rows[0][0] == DBNull.Value ? 0 : Convert.ToInt32(table.Rows[0][0]);
                        itemIDsDeleted.Add(itemId);
                    }
                }
            }
            if (itemIDsDeleted.Any())
            {
                itemIDsDeleted = itemIDsDeleted.Distinct().ToList();
                foreach (var _item in itemIDsDeleted)
                {
                    var currentUser = user;
                    if (currentUser.IsGm || currentUser.IsGmPermanent)
                    {
                        AddItemToLoot(_item, dropToLootPileId);
                    }
                    else if (isInvitedPlayerCharacter(characterId).Result)
                    {
                        AddItemToLoot(_item, dropToLootPileId);
                    }
                }

                if (CharacterCurrency != null && dropToLootPileId > 0)
                {
                    var ExistLootCurrency =  await this._itemMasterLootCurrencyService.GetByLootId(dropToLootPileId);
                    if (ExistLootCurrency.Count == 0)
                    {
                        var ItemMasterLootCurrencyList = new List<ItemMasterLootCurrency>();
                        foreach (var currency in CharacterCurrency)
                        {
                            ItemMasterLootCurrencyList.Add(new ItemMasterLootCurrency
                            {
                                Name = currency.Name,
                                Amount = currency.Amount,
                                Command = currency.Amount.ToString(),
                                BaseUnit = currency.BaseUnit,
                                WeightValue = currency.WeightValue,
                                SortOrder = currency.SortOrder,
                                CurrencyTypeId = currency.CurrencyTypeId,
                                LootId = dropToLootPileId,
                            });
                        }
                        if (ItemMasterLootCurrencyList.Count > 0)
                        {
                            await this._itemMasterLootCurrencyService.CreateRange(ItemMasterLootCurrencyList);
                        }
                    }
                    else
                    {
                        foreach (var currency in CharacterCurrency)
                        {
                            var existedCurrencyModel = ExistLootCurrency.Where(x => x.Name == currency.Name && x.CurrencyTypeId == currency.CurrencyTypeId).FirstOrDefault();
                            if (existedCurrencyModel != null)
                            {
                                await this._itemMasterLootCurrencyService.AddQuantity(existedCurrencyModel.ItemMasterLootCurrencyId, currency.Amount);
                            }
                        }
                    }
                }
            }
        }

        public async Task<Item> UpdateDroppedItemQuantity(int ItemId, Decimal Quantity)
        {
            var itemobj = _context.Items.Find(ItemId);

            if (itemobj == null)
                return itemobj;
            try
            {
                itemobj.Quantity = Quantity;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                //throw ex;
            }

            return itemobj;
        }


        public decimal ReduceItemQty(int itemId, int RuleSetId)
        {
            try
            {
                var isAutoDelete = false;
                RuleSet ruleSet = new RuleSet();
                ruleSet = _context.RuleSets.Where(r => r.RuleSetId == RuleSetId).FirstOrDefault();
                if (ruleSet != null)
                {
                    isAutoDelete = ruleSet.AutoDeleteItems;
                }

                var item = _context.Items.Where(x => x.ItemId == itemId).FirstOrDefault();
                if (item != null)
                {
                    if (item.Quantity > 0)
                    {
                        item.Quantity = item.Quantity - 1;
                        item.TotalWeight = item.Weight * item.Quantity;
                    }
                    if (item.Quantity == 0 && isAutoDelete)
                    {
                        item.IsDeleted = true;
                    }
                    _context.SaveChanges();
                    return item.Quantity;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return 0;
        }

        public async Task<bool> isInvitedPlayerCharacter(int characterId)
        {
            return await _context.PlayerInvites.Where(x => x.PlayerCharacterID == characterId && (x.IsDeleted == false || x.IsDeleted == null)).AnyAsync();
        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }


        public async Task GivePlayerItems(GiveItemsFromPlayerCombat model, int givenByPlayerID, int ruleSetId)
        {
            if (model.GiveTo.Type == "character")
            {
                var items = _context.Items.Where(x => model.Items.Select(y => y.ID).Contains(x.ItemId)).ToList();
                if (items != null && items.Count != 0)
                {
                    foreach (var item in items)
                    {
                        var quantityToGive = model.Items.Where(x => x.ID == item.ItemId).FirstOrDefault().Qty;
                        var GiveItemId = model.Items.Where(x => x.ID == item.ItemId).FirstOrDefault().ID;
                        if (quantityToGive == item.Quantity && item.ItemId == GiveItemId)
                        {
                            item.CharacterId = model.GiveTo.Id;
                            _context.SaveChanges();
                        }
                        else
                        {
                            if (item.ItemId == GiveItemId)
                            {
                                item.Quantity = item.Quantity - quantityToGive;
                                item.TotalWeight = item.Weight * item.Quantity;
                                _context.SaveChanges();

                                var itemDetails = GetById(item.ItemId);

                                var itemSpells = new List<ItemSpell>();
                                foreach (var spell in itemDetails.ItemSpells)
                                {
                                    var _spell = new ItemSpell()
                                    {
                                        SpellId = spell.SpellId
                                    };
                                    itemSpells.Add(_spell);
                                }

                                var itemAbilities = new List<ItemAbility>();
                                foreach (var ability in itemDetails.ItemAbilities)
                                {
                                    var _ability = new ItemAbility()
                                    {
                                        AbilityId = ability.AbilityId
                                    };
                                    itemAbilities.Add(_ability);
                                }

                                var itemBuffEffects = new List<ItemBuffAndEffect>();
                                foreach (var BE in itemDetails.ItemBuffAndEffects)
                                {
                                    var _be = new ItemBuffAndEffect()
                                    {
                                        BuffAndEffectId = BE.BuffAndEffectId
                                    };
                                    itemBuffEffects.Add(_be);
                                }

                                //await InsertItem(new Item
                                //{
                                //    Name = item.Name,
                                //    Description = item.Description,
                                //    ItemImage = item.ItemImage,
                                //    CharacterId = model.GiveTo.Id,
                                //    ItemMasterId = item.ItemMasterId,
                                //    IsIdentified = item.IsIdentified,
                                //    IsVisible = item.IsVisible,
                                //    IsEquipped = item.IsEquipped,
                                //    ParentItemId = item.ItemMasterId,
                                //    Command = item.Command,
                                //    IsContainer = item.IsContainer,
                                //    IsConsumable = item.IsConsumable,
                                //    IsMagical = item.IsMagical,
                                //    ItemCalculation = item.ItemCalculation,
                                //    Metatags = item.Metatags,
                                //    Rarity = item.Rarity,
                                //    Value = item.Value,
                                //    Volume = item.Volume,
                                //    Weight = item.Weight,
                                //    Quantity = quantityToGive,
                                //    TotalWeight = item.Weight * quantityToGive,
                                //    ItemStats = item.ItemStats,
                                //    ContainerWeightMax = item.ContainerWeightMax,
                                //    ContainerVolumeMax = item.ContainerVolumeMax,
                                //    PercentReduced = item.PercentReduced,
                                //    TotalWeightWithContents = item.TotalWeightWithContents,
                                //    ContainerWeightModifier = item.ContainerWeightModifier,
                                //    CommandName = item.CommandName
                                //},
                                //itemSpells, itemAbilities, itemBuffEffects, itemDetails.ItemCommandVM);

                                await InsertGivenItem(model.GiveTo.Id, quantityToGive, item, itemSpells, itemAbilities, itemBuffEffects, itemDetails.ItemCommandVM);
                                await _context.SaveChangesAsync();


                            }
                        }

                    }
                }
            }
            else if (model.GiveTo.Type == "monster")
            {
                var items = _context.Items.Where(x => model.Items.Select(y => y.ID).Contains(x.ItemId)).ToList();
                if (items != null)
                {
                    var monsterDetails = _monsterTemplateService.GetMonsterById(model.GiveTo.Id, true);

                    foreach (var item in items)
                    {
                        var quantityToGive = model.Items.Where(x => x.ID == item.ItemId).FirstOrDefault().Qty;
                        var GiveItemId = model.Items.Where(x => x.ID == item.ItemId).FirstOrDefault().ID;

                        if (quantityToGive == item.Quantity && item.ItemId == GiveItemId)
                        {
                            item.IsDeleted = true;
                            _context.SaveChanges();

                            await AssignItemToMonster(item.ItemMasterId, quantityToGive, monsterDetails.MonsterId, ruleSetId);
                        }
                        else
                        {
                            if (item.ItemId == GiveItemId)
                            {
                                item.Quantity = item.Quantity - quantityToGive;
                                item.TotalWeight = item.Weight * item.Quantity;
                                _context.SaveChanges();

                                await AssignItemToMonster(item.ItemMasterId, quantityToGive, monsterDetails.MonsterId, ruleSetId);
                            }
                        }

                    }

                }

            }
        }

        private async Task<Item> InsertGivenItem(int CharacterId, int quantityToGive, Item item, List<ItemSpell> ItemSpells,
            List<ItemAbility> ItemAbilities, List<ItemBuffAndEffect> ItemBuffAndEffects, List<ItemCommand> itemCommands)
        {
            var _givenItem = new Item
            {
                Name = item.Name,
                Description = item.Description,
                ItemImage = item.ItemImage,
                CharacterId = CharacterId, //model.GiveTo.Id,
                ItemMasterId = item.ItemMasterId,
                IsIdentified = item.IsIdentified,
                IsVisible = item.IsVisible,
                IsEquipped = item.IsEquipped,
                ParentItemId = item.ItemMasterId,
                Command = item.Command,
                IsContainer = item.IsContainer,
                IsConsumable = item.IsConsumable,
                IsMagical = item.IsMagical,
                ItemCalculation = item.ItemCalculation,
                Metatags = item.Metatags,
                Rarity = item.Rarity,
                Value = item.Value,
                Volume = item.Volume,
                Weight = item.Weight,
                Quantity = quantityToGive,
                TotalWeight = item.Weight * quantityToGive,
                ItemStats = item.ItemStats,
                ContainerWeightMax = item.ContainerWeightMax,
                ContainerVolumeMax = item.ContainerVolumeMax,
                PercentReduced = item.PercentReduced,
                TotalWeightWithContents = item.TotalWeightWithContents,
                ContainerWeightModifier = item.ContainerWeightModifier,
                CommandName = item.CommandName
            };

            _context.Items.Add(_givenItem);
            await _context.SaveChangesAsync();

            item.ItemAbilities = new List<ItemAbility>();
            item.ItemSpells = new List<ItemSpell>();
            item.ItemBuffAndEffects = new List<ItemBuffAndEffect>();
            item.ItemCommandVM = new List<ItemCommand>();
            //await _repo.Add(item);

            int ItemId = item.ItemId;

            if (ItemId > 0)
            {
                if (ItemSpells != null)
                {
                    ItemSpells.ForEach(a => a.ItemId = ItemId);
                    await _repoItemSpell.AddRange(ItemSpells);
                }
                if (ItemAbilities != null)
                {
                    ItemAbilities.ForEach(a => a.ItemId = ItemId);
                    await _repoItemAbility.AddRange(ItemAbilities);
                }
                if (ItemBuffAndEffects != null)
                {
                    ItemBuffAndEffects.ForEach(a => a.ItemId = ItemId);
                    _context.ItemBuffAndEffects.AddRange(ItemBuffAndEffects);
                    _context.SaveChanges();
                }
                if (itemCommands != null)
                {
                    itemCommands.ForEach(a => a.ItemId = ItemId);
                    await _repoItemCommand.AddRange(itemCommands);
                    //_context.ItemCommands.AddRange(itemCommands);
                }
            }
            item.ItemAbilities = ItemAbilities;
            item.ItemSpells = ItemSpells;

            await _context.SaveChangesAsync();

            return item;

        }

        private async Task AssignItemToMonster(int? itemMastedId, int quantityToGive, int MonsterId, int ruleSetId)
        {


            var ItemMasterMonsterItem = _context.ItemMasters.Where(x => x.ItemMasterId == itemMastedId && x.IsDeleted != true)
                .Select(x => new ItemMasterMonsterItem()
                {
                    Command = x.Command,
                    CommandName = x.CommandName,
                    ContainerVolumeMax = x.ContainerVolumeMax,
                    ContainerWeightMax = x.ContainerWeightMax,
                    ContainerWeightModifier = x.ContainerWeightModifier,
                    IsConsumable = x.IsConsumable,
                    IsContainer = x.IsContainer,
                    IsEquipped = false,
                    IsIdentified = false,
                    IsMagical = x.IsMagical,
                    IsVisible = false,
                    ItemCalculation = x.ItemCalculation,
                    ItemImage = x.ItemImage,
                    ItemName = x.ItemName,
                    ItemStats = x.ItemStats,
                    ItemVisibleDesc = x.ItemVisibleDesc,
                    Metatags = x.Metatags,
                    PercentReduced = x.PercentReduced,
                    Quantity = quantityToGive,
                    Rarity = x.Rarity,
                    TotalWeight = quantityToGive * x.Weight,
                    Value = x.Value,
                    Volume = x.Volume,
                    Weight = x.Weight,
                    TotalWeightWithContents = x.TotalWeightWithContents,
                    ItemMasterId = itemMastedId ?? 0,
                    MonsterId = MonsterId,
                    RuleSetId = ruleSetId
                })
                .FirstOrDefault();
            if (ItemMasterMonsterItem != null)
            {
                _context.ItemMasterMonsterItems.Add(ItemMasterMonsterItem);

                var Abilitys = _context.ItemMasterAbilities.Where(x => x.ItemMasterId == itemMastedId && x.IsDeleted != true).ToList();
                foreach (var a in Abilitys)
                {
                    _context.ItemMasterMonsterItemAbilitys.Add(new ItemMasterMonsterItemAbility()
                    {
                        AbilityId = a.AbilityId,
                        ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                    });
                }

                var Spells = _context.ItemMasterSpells.Where(x => x.ItemMasterId == itemMastedId && x.IsDeleted != true).ToList();
                foreach (var a in Spells)
                {
                    _context.ItemMasterMonsterItemSpells.Add(new ItemMasterMonsterItemSpell()
                    {
                        SpellId = a.SpellId,
                        ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                    });
                }

                var BEs = _context.ItemMasterBuffAndEffects.Where(x => x.ItemMasterId == itemMastedId && x.IsDeleted != true).ToList();
                foreach (var a in BEs)
                {
                    _context.ItemMasterMonsterItemBuffAndEffects.Add(new ItemMasterMonsterItemBuffAndEffect()
                    {
                        BuffAndEffectId = a.BuffAndEffectId,
                        ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                    });
                }

                var cmds = _context.ItemMasterCommands.Where(x => x.ItemMasterId == itemMastedId && x.IsDeleted != true).ToList();
                foreach (var a in cmds)
                {
                    _context.ItemMasterMonsterItemCommands.Add(new ItemMasterMonsterItemCommand()
                    {
                        Command = a.Command,
                        Name = a.Name,
                        ItemMasterMonsterItemId = ItemMasterMonsterItem.ItemId
                    });
                }

                _context.SaveChanges();
            }
        }


    }
}
