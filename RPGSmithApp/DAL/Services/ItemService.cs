using DAL.Models;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
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

        public ItemService(ApplicationDbContext context, IRepository<Item> repo, IConfiguration configuration,
            IRepository<ItemAbility> repoItemAbility, IRepository<ItemSpell> repoItemSpell,IRepository<ItemCommand> repoItemCommand,
            IItemMasterService itemMasterService)
        {
            _context = context;
            _repoItemAbility = repoItemAbility;
            _repoItemSpell = repoItemSpell;
            _repo = repo;
            _repoItemCommand = repoItemCommand;
            _itemMasterService = itemMasterService;
            this._configuration = configuration;
        }
        public async Task AddItemsSP(List<ItemMasterIds> multiItemMasters, List<ItemMasterBundleIds> multiItemMasterBundles, int characterId, bool IsLootItems)
        {
            DataTable ItemDT = utility.ToDataTable<CommonID>(multiItemMasters.Select(x=> new CommonID { ID=x.ItemMasterId}).ToList());
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
        public async Task<Item> InsertItem(Item item, List<ItemSpell> ItemSpells, List<ItemAbility> ItemAbilities, List<ItemCommand> itemCommands=null)
        {
            item.ItemAbilities = new List<ItemAbility>();
            item.ItemSpells = new List<ItemSpell>();
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
        public async Task<ItemMaster> Core_CreateItemMasterUsingItem(int ItemMasterID,int RulesetID)
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

            ItemMaster CreatedItemMaster =await _itemMasterService.Core_CreateItemMaster(itemMaster, itemMaster.ItemMasterSpell.ToList(), itemMaster.ItemMasterAbilities.ToList());
            return CreatedItemMaster;
        }
        public async Task<Item> UpdateItem(Item item, List<ItemSpell> ItemSpells, List<ItemAbility> ItemAbilities)
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
        public List<Item> getItemByCharacterId(int characterId) {
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
                .FirstOrDefault(x => x.ItemId == id && x.IsDeleted != true);
        }
        
        public (bool, string) CheckItemExist(int characterId, int itemMasterId)
        {
            bool IsExist = _context.Items.Any(x => x.CharacterId == characterId && x.ItemMasterId == itemMasterId && x.IsDeleted!=true);
            string name = string.Empty;
            if (IsExist)
            {
                try
                {
                    name = _context.Items.Where(x => x.CharacterId == characterId && x.ItemMasterId == itemMasterId && x.IsDeleted!=true).FirstOrDefault().ItemMaster.ItemName;
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
        public List<Item> GetAvailableItems(int characterId) {
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

        public List<Item> getDuplicateItems(int? characterId, int itemMasterId = 0) {
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
            cmd.Parameters.Add("@Type", SqlDbType.Char,1).Value = type;

            rowseffectesd = cmd.ExecuteNonQuery();
            con.Close();
            return rowseffectesd;
        }
        public CharacterSpell GetCharSpellIDUrl(int rulesetSpellID, int characterId) {
            return _context.CharacterSpells.Where(q => q.SpellId == rulesetSpellID && q.CharacterId== characterId && q.IsDeleted!=true).FirstOrDefault();
        }
        public CharacterAbility GetCharAbilityIDUrl(int rulesetAbilityID, int characterId) {
            return _context.CharacterAbilities.Where(q => q.AbilityId == rulesetAbilityID && q.CharacterId == characterId && q.IsDeleted != true).FirstOrDefault();
        }
        #region SP relate methods

        public (List<Item>, Character, RuleSet) SP_Items_GetByCharacterId(int characterId, int rulesetId, int page, int pageSize,  int sortType = 1)
        {
            List<Item> _ItemList = new List<Item>();
            RuleSet ruleset = new RuleSet();
            Character character = new Character();

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
                    i.CommandName= row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    _ItemList.Add(i);
                }
            }
            return (_ItemList, character, ruleset);
        }

        public SP_AbilitySpellForItemMaster AbilitySpellForItemsByRuleset_sp(int characterId, int rulesetId, int itemId)
        {
            SP_AbilitySpellForItemMaster res = new SP_AbilitySpellForItemMaster();
            res.abilityList = new List<Ability>();
            res.selectedAbilityList = new List<Ability>();
            res.spellList = new List<Spell>();
            res.selectedSpellList = new List<Spell>();
            res.selectedItemCommand = new List<ItemCommand>();
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
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedAbilityList.Add(i);
                }

            }
            if (ds.Tables[3].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[3].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedSpellList.Add(i);
                }

            }
            if (ds.Tables[4].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[4].Rows)
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

        public List<ItemCommand> SP_GetItemCommands(int itemId)
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

        public List<Item> GetNestedContainerItems(int itemid)
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

        #endregion
        public void AddItemToLoot(int? itemMasterId) {
            if (itemMasterId!=null)
            {
                ItemMaster obj = _context.ItemMasters.Where(x => x.ItemMasterId == (int)itemMasterId).FirstOrDefault();
                if (obj != null)
                {
                    _itemMasterService.CreateItemMasterLoot(obj, new ItemMasterLoot()
                    {
                        IsShow = true
                    });
                }
            }
            
        }
    }
}
