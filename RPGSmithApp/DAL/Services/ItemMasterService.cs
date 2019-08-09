using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class ItemMasterService : IItemMasterService
    {
        private readonly IRepository<ItemMaster> _repo;
        private readonly IRepository<ItemMasterAbility> _repoMasterAbility;
        private readonly IRepository<ItemMasterSpell> _repoMasterSpell;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public ItemMasterService(ApplicationDbContext context, IRepository<ItemMaster> repo, IRepository<ItemMasterAbility> repoMasterAbility, IRepository<ItemMasterSpell> repoMasterSpell, IConfiguration configuration)
        {
            _repo = repo;
            _repoMasterAbility = repoMasterAbility;
            _repoMasterSpell = repoMasterSpell;
            _context = context;
            _configuration = configuration;
        }

        public async Task<ItemMaster> CreateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities, List<ItemMasterBuffAndEffect> AssociatedBuffAndEffects)
        {
            item.ItemMasterAbilities = new List<ItemMasterAbility>();
            item.ItemMasterSpell = new List<ItemMasterSpell>();
            item.itemMasterBuffAndEffects = new List<ItemMasterBuffAndEffect>();
            _context.ItemMasters.Add(item);
            _context.SaveChanges();//_repo.Add(item);
            int ItemMasterId = item.ItemMasterId;
            try
            {
                if (ItemMasterId > 0)
                {
                    if (AssociatedAbilities != null && AssociatedAbilities.Count > 0)
                    {
                        AssociatedAbilities.ForEach(a => a.ItemMasterId = ItemMasterId);
                        _context.ItemMasterAbilities.AddRange(AssociatedAbilities);
                        _context.SaveChanges();
                    }
                    if (AssociatedSpells != null && AssociatedSpells.Count > 0)
                    {
                        AssociatedSpells.ForEach(a => a.ItemMasterId = ItemMasterId);
                        _context.ItemMasterSpells.AddRange(AssociatedSpells);// _repoMasterSpell.AddRange(AssociatedSpells);
                        _context.SaveChanges();
                    }
                    if (AssociatedBuffAndEffects != null && AssociatedBuffAndEffects.Count > 0)
                    {
                        //AssociatedBuffAndEffects.ForEach(a => a.ItemMasterId = ItemMasterId);
                        //AssociatedBuffAndEffects.ForEach(a => a.Id = 0);
                       List<ItemMasterBuffAndEffect> AssociatedBuffAndEffectsList = AssociatedBuffAndEffects.Select(x => new ItemMasterBuffAndEffect() {
                            BuffAndEffectId=x.BuffAndEffectId,                            
                       }).ToList();
                        foreach (var be in AssociatedBuffAndEffectsList)
                        {
                            _context.ItemMasterBuffAndEffects.Add(new ItemMasterBuffAndEffect() {BuffAndEffectId= be.BuffAndEffectId, ItemMasterId= ItemMasterId });
                        }
                        //_context.ItemMasterBuffAndEffects.AddRange(AssociatedBuffAndEffectsList);// _repoMasterSpell.AddRange(AssociatedSpells);
                        _context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            { }
            item.ItemMasterAbilities = AssociatedAbilities;
            item.ItemMasterSpell = AssociatedSpells;
            item.itemMasterBuffAndEffects = AssociatedBuffAndEffects;
            return item;
        }

        public async Task<ItemMaster> Core_CreateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities, List<ItemMasterBuffAndEffect> AssociatedBuffAndEffects)
        {
            item.ParentItemMasterId = item.ItemMasterId;
            item.ItemMasterId = 0;

            try
            {
                item.ItemMasterSpell = new List<ItemMasterSpell>();
                item.ItemMasterAbilities = new List<ItemMasterAbility>();
                item.itemMasterBuffAndEffects = new List<ItemMasterBuffAndEffect>();
                await _repo.Add(item);
                int ItemMasterId = item.ItemMasterId;
                if (ItemMasterId > 0)
                {
                    if (AssociatedAbilities != null && AssociatedAbilities.Count > 0)
                    {
                        AssociatedAbilities.ForEach(a => a.ItemMasterId = ItemMasterId);
                        await _repoMasterAbility.AddRange(AssociatedAbilities);
                    }
                    if (AssociatedSpells != null && AssociatedSpells.Count > 0)
                    {
                        AssociatedSpells.ForEach(a => a.ItemMasterId = ItemMasterId);
                        await _repoMasterSpell.AddRange(AssociatedSpells);
                    }
                    if (AssociatedBuffAndEffects != null && AssociatedBuffAndEffects.Count > 0)
                    {
                        //AssociatedBuffAndEffects.ForEach(a => a.ItemMasterId = ItemMasterId);
                        //_context.ItemMasterBuffAndEffects.AddRange(AssociatedBuffAndEffects);
                        //_context.SaveChanges();

                        List<ItemMasterBuffAndEffect> listbuffs = new List<ItemMasterBuffAndEffect>();
                        foreach (var be in AssociatedBuffAndEffects)
                        {
                            ItemMasterBuffAndEffect obj = new ItemMasterBuffAndEffect()
                            {
                                BuffAndEffectId = be.BuffAndEffectId,
                                ItemMasterId = ItemMasterId
                            };
                            listbuffs.Add(obj);
                        }
                        //SpellBuffAndEffectVM.ForEach(a => a.SpellId = spell.SpellId);
                        _context.ItemMasterBuffAndEffects.AddRange(listbuffs);
                        _context.SaveChanges();
                        item.itemMasterBuffAndEffects = listbuffs;
                    }
                }
                var loots = _context.ItemMasterLoots.Where(x => x.ItemMasterId == item.ParentItemMasterId).ToList();
                foreach (var loot in loots)
                {
                    loot.ItemMasterId = item.ItemMasterId;
                }
                _context.SaveChanges();
            }
            catch (Exception ex) { }
            return item;
        }
        public async Task<ItemMaster> UpdateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities,List<ItemMasterBuffAndEffect> AssociatedBuffAndEffects)
        {
            var itemMaster = _context.ItemMasters.Include("RuleSet").Include("ItemMasterAbilities").Where(x => x.ItemMasterId == item.ItemMasterId).FirstOrDefault();

            if (itemMaster == null)
                return itemMaster;

            itemMaster.ItemName = item.ItemName;
            itemMaster.ItemImage = item.ItemImage;
            itemMaster.ItemStats = item.ItemStats;
            itemMaster.ItemVisibleDesc = item.ItemVisibleDesc;
            itemMaster.Command = item.Command;
            itemMaster.ItemCalculation = item.ItemCalculation;
            itemMaster.Value = item.Value;
            itemMaster.Volume = item.Volume;
            itemMaster.Weight = item.Weight;
            itemMaster.IsContainer = item.IsContainer;
            itemMaster.IsMagical = item.IsMagical;
            itemMaster.IsConsumable = item.IsConsumable;
            itemMaster.ContainerWeightMax = item.ContainerWeightMax;
            itemMaster.ContainerWeightModifier = item.ContainerWeightModifier;
            itemMaster.ContainerVolumeMax = item.ContainerVolumeMax;
            itemMaster.PercentReduced = item.PercentReduced;
            itemMaster.TotalWeightWithContents = item.TotalWeightWithContents;
            itemMaster.Metatags = item.Metatags;
            itemMaster.Rarity = item.Rarity;
            itemMaster.CommandName = item.CommandName;

            _context.ItemMasterAbilities.RemoveRange(_context.ItemMasterAbilities.Where(x => x.ItemMasterId == item.ItemMasterId));
            _context.ItemMasterSpells.RemoveRange(_context.ItemMasterSpells.Where(x => x.ItemMasterId == item.ItemMasterId));
            _context.ItemMasterBuffAndEffects.RemoveRange(_context.ItemMasterBuffAndEffects.Where(x => x.ItemMasterId == item.ItemMasterId));


            try
            {
                _context.SaveChanges();

                AssociatedAbilities.ForEach(a => a.ItemMasterId = item.ItemMasterId);
                await _repoMasterAbility.AddRange(AssociatedAbilities);

                AssociatedSpells.ForEach(a => a.ItemMasterId = item.ItemMasterId);
                await _repoMasterSpell.AddRange(AssociatedSpells);

                AssociatedBuffAndEffects.ForEach(a => a.ItemMasterId = item.ItemMasterId);
                _context.ItemMasterBuffAndEffects.AddRange(AssociatedBuffAndEffects);
                _context.SaveChanges();

            }
            catch (Exception ex)
            {
                throw ex;
            }

            return itemMaster;
        }

        public async Task<bool> DeleteItemMaster(int id)
        {
            // Remove associated Abilities
            var ima = _context.ItemMasterAbilities.Where(x => x.ItemMasterId == id && x.IsDeleted != true);

            foreach (ItemMasterAbility ima_item in ima)
            {
                ima_item.IsDeleted = true;
            }

            // Remove associated Spells
            var ims = _context.ItemMasterSpells.Where(x => x.ItemMasterId == id && x.IsDeleted != true);

            foreach (ItemMasterSpell ims_item in ims)
            {
                ims_item.IsDeleted = true;
            }

            // Remove associated Buffs And Effects
            var imbe = _context.ItemMasterBuffAndEffects.Where(x => x.ItemMasterId == id && x.IsDeleted != true);

            foreach (ItemMasterBuffAndEffect imbe_item in imbe)
            {
                imbe_item.IsDeleted = true;
            }

            // Remove associated Players
            var imp = _context.ItemMasterPlayers.Where(x => x.ItemMasterId == id && x.IsDeleted != true);

            foreach (ItemMasterPlayer imp_item in imp)
            {
                imp_item.IsDeleted = true;

            }

            // Remove associated Commands
            var imc = _context.ItemMasterCommands.Where(x => x.ItemMasterId == id && x.IsDeleted != true);

            foreach (ItemMasterCommand imc_item in imc)
            {
                imc_item.IsDeleted = true;
            }

            // Remove associated Items
            var i = _context.Items.Where(x => x.ItemMasterId == id && x.IsDeleted != true);

            foreach (Item item in i)
            {
                item.IsDeleted = true;
                //Remove Link from Character Character Stats
                var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "item" && x.DefaultValue == item.ItemId).ToList();
                foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
                {
                    LRCCS.DefaultValue = 0;
                    LRCCS.LinkType = "";
                }
            }

            var im = await _repo.Get(id);

            if (im == null)
                return false;

            im.IsDeleted = true;

            // Delete item from ItemMasterBundleItems
            _context.ItemMasterBundleItems.RemoveRange(_context.ItemMasterBundleItems.Where(x => x.ItemMasterId == id).ToList());

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

        public List<ItemMaster> GetItemMasters()
        {
            List<ItemMaster> itemmasters = _context.ItemMasters
               .Include(d => d.ItemMasterAbilities).ThenInclude(d => d.Abilitiy)
               .Include(d => d.ItemMasterSpell).ThenInclude(d => d.Spell)
               .Include(d => d.ItemMasterCommand)
               .Include(d => d.Items)
               .Where(d => d.IsDeleted != true)
               .OrderBy(o => o.ItemName).ToList();

            if (itemmasters == null) return itemmasters;

            foreach (ItemMaster itemmaster in itemmasters)
            {

                itemmaster.ItemMasterAbilities = itemmaster.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
                itemmaster.ItemMasterSpell = itemmaster.ItemMasterSpell.Where(p => p.IsDeleted != true).ToList();
                //  itemmaster.ItemMasterPlayers = itemmaster.ItemMasterPlayers.Where(p => p.IsDeleted != true).ToList();
                itemmaster.ItemMasterCommand = itemmaster.ItemMasterCommand.Where(p => p.IsDeleted != true).ToList();
                itemmaster.Items = itemmaster.Items.Where(p => p.IsDeleted != true).ToList();
            }
            return itemmasters;
        }

        public ItemMaster GetItemMasterById(int? id)
        {
            var itemmaster = _context.ItemMasters
              .Include(d => d.RuleSet)
              .Include(d => d.ItemMasterAbilities).ThenInclude(d => d.Abilitiy)
              .Include(d => d.ItemMasterSpell).ThenInclude(d => d.Spell)
              .Include(d => d.itemMasterBuffAndEffects).ThenInclude(d => d.BuffAndEffect)
              .Include(d => d.ItemMasterCommand)
              .Include(d => d.Items)
              .Where(d => d.ItemMasterId == id && d.IsDeleted != true)
              .FirstOrDefault();

            if (itemmaster == null) return itemmaster;

            itemmaster.ItemMasterAbilities = itemmaster.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
            itemmaster.ItemMasterSpell = itemmaster.ItemMasterSpell.Where(p => p.IsDeleted != true).ToList();
            itemmaster.itemMasterBuffAndEffects = itemmaster.itemMasterBuffAndEffects.Where(p => p.IsDeleted != true).ToList();
            //  itemmaster.ItemMasterPlayers = itemmaster.ItemMasterPlayers.Where(p => p.IsDeleted != true).ToList();
            itemmaster.ItemMasterCommand = itemmaster.ItemMasterCommand.Where(p => p.IsDeleted != true).ToList();
            itemmaster.Items = itemmaster.Items.Where(p => p.IsDeleted != true).ToList();

            return itemmaster;
        }
        public ItemMasterMonsterItem getMonsterItemById(int id) {
            var item = _context.ItemMasterMonsterItems
              .Include(d => d.RuleSet)
              .Include(d => d.ItemMasterAbilities).ThenInclude(d => d.Ability)
              .Include(d => d.ItemMasterSpell).ThenInclude(d => d.Spell)
              .Include(d => d.itemMasterBuffAndEffects).ThenInclude(d => d.BuffAndEffect)
              .Include(d => d.ItemMasterCommand)
              .Where(d => d.ItemId == id && d.IsDeleted != true)
              .FirstOrDefault();

            if (item == null) return null;

            item.ItemMasterAbilities = item.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
            item.ItemMasterSpell = item.ItemMasterSpell.Where(p => p.IsDeleted != true).ToList();
            item.itemMasterBuffAndEffects = item.itemMasterBuffAndEffects.Where(p => p.IsDeleted != true).ToList();
            //  itemmaster.ItemMasterPlayers = itemmaster.ItemMasterPlayers.Where(p => p.IsDeleted != true).ToList();
            item.ItemMasterCommand = item.ItemMasterCommand.Where(p => p.IsDeleted != true).ToList();
            

            return item;
        }
        public List<ItemMaster> GetItemMastersByRuleSetId(int ruleSetId)
        {
            //var query = "EXEC ItemMaster_GetByRulesetID @RulesetID = " + ruleSetId;
            //var res = _context.ItemMasters.FromSql<ItemMaster>(query).ToList().FirstOrDefault();

            //DataSet ds = new DataSet("TimeRanges");
            //using (SqlConnection conn = new SqlConnection("ConnectionString"))
            //{
            //    SqlCommand sqlComm = new SqlCommand("Procedure1", conn);
            //    sqlComm.Parameters.AddWithValue("@Start", StartTime);
            //    sqlComm.Parameters.AddWithValue("@Finish", FinishTime);
            //    sqlComm.Parameters.AddWithValue("@TimeRange", TimeRange);

            //    sqlComm.CommandType = CommandType.StoredProcedure;

            //    SqlDataAdapter da = new SqlDataAdapter();
            //    da.SelectCommand = sqlComm;

            //    da.Fill(ds);
            //}
            List<ItemMaster> itemlist = GetItems(ruleSetId);
            //List<ItemMaster> itemlist = _context.ItemMasters
            //   .Include(d => d.RuleSet)
            //   .Include(d => d.ItemMasterAbilities).ThenInclude(d => d.Abilitiy)
            //   .Include(d => d.ItemMasterSpell).ThenInclude(d => d.Spell)
            //   .Include(d => d.ItemMasterCommand)
            //   .Include(d => d.Items)
            //   .Where(p => p.RuleSetId == ruleSetId && p.IsDeleted != true)
            //   .Include(d => d.ItemMasterCommand).OrderBy(o => o.ItemName).ToList();

            //if (itemlist == null) return itemlist;

            //foreach (ItemMaster itemmaster in itemlist)
            //{

            //    itemmaster.ItemMasterAbilities = itemmaster.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
            //    itemmaster.ItemMasterSpell = itemmaster.ItemMasterSpell.Where(p => p.IsDeleted != true).ToList();
            //    //itemmaster.ItemMasterPlayers = itemmaster.ItemMasterPlayers.Where(p => p.IsDeleted != true).ToList();
            //    itemmaster.ItemMasterCommand = itemmaster.ItemMasterCommand.Where(p => p.IsDeleted != true).ToList();
            //    itemmaster.Items = itemmaster.Items.Where(p => p.IsDeleted != true).ToList();
            //}

            ////remove circular dependencies/reference
            //foreach (var list in itemlist)
            //{
            //    try
            //    {
            //        foreach (var ability in list.ItemMasterAbilities)
            //        {
            //            ability.ItemMaster = null;
            //        }
            //        foreach (var spell in list.ItemMasterSpell)
            //        {
            //            spell.ItemMaster = null;
            //        }
            //        foreach (var cmd in list.ItemMasterCommand)
            //        {
            //            cmd.ItemMaster = null;
            //        }
            //    }
            //    catch (Exception ex)
            //    {
            //        throw ex;
            //    }
            //}

            return itemlist;
        }
        public List<ItemMaster> Core_GetItemMastersByRuleSetId(int ruleSetId, int ParentID)
        {
            List<ItemMaster> itemList = GetItems(ruleSetId);

            //var idsToRemove = _context.ItemMasters.Where(p => (p.RuleSetId == ruleSetId) && p.ParentItemMasterId != null).Select(p => p.ParentItemMasterId).ToArray();

            //var itemsToRemove = _context.ItemMasters.Where(p => idsToRemove.Contains(p.ItemMasterId)).ToList();

            //List<ItemMaster> itemlist = _context.ItemMasters.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == ParentID) && x.IsDeleted != true)
            //    .Except(itemsToRemove)
            //   .Include(d => d.RuleSet)
            //   .Include(d => d.ItemMasterAbilities).ThenInclude(d => d.Abilitiy)
            //   .Include(d => d.ItemMasterSpell).ThenInclude(d => d.Spell)
            //   .Include(d => d.ItemMasterCommand)
            //   .Include(d => d.Items)

            //   .Include(d => d.ItemMasterCommand).OrderBy(o => o.ItemName).ToList();

            if (itemList == null) return itemList;

            //foreach (ItemMaster itemmaster in itemList)
            //{

            //    itemmaster.ItemMasterAbilities = itemmaster.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
            //    itemmaster.ItemMasterSpell = itemmaster.ItemMasterSpell.Where(p => p.IsDeleted != true).ToList();
            //    //itemmaster.ItemMasterPlayers = itemmaster.ItemMasterPlayers.Where(p => p.IsDeleted != true).ToList();
            //    itemmaster.ItemMasterCommand = itemmaster.ItemMasterCommand.Where(p => p.IsDeleted != true).ToList();
            //    itemmaster.Items = itemmaster.Items.Where(p => p.IsDeleted != true).ToList();
            //}

            ////remove circular dependencies/reference
            //foreach (var list in itemList)
            //{
            //    try
            //    {
            //        foreach (var ability in list.ItemMasterAbilities)
            //        {
            //            ability.ItemMaster = null;
            //        }
            //        foreach (var spell in list.ItemMasterSpell)
            //        {
            //            spell.ItemMaster = null;
            //        }
            //        foreach (var cmd in list.ItemMasterCommand)
            //        {
            //            cmd.ItemMaster = null;
            //        }
            //    }
            //    catch (Exception ex)
            //    {
            //        throw ex;
            //    }
            //}

            return itemList;
        }

        private List<ItemMaster> GetItems(int ruleSetId)
        {
            List<ItemMaster> itemList = new List<ItemMaster>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC ItemMasterGetAllDetailsByRulesetID @RulesetID = '" + ruleSetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("ItemMasterGetAllDetailsByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", ruleSetId);
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
                foreach (DataRow ItemRow in ds.Tables[0].Rows)
                {
                    ItemMaster itemM = new ItemMaster();
                    itemM.Command = ItemRow["Command"] == DBNull.Value ? null : ItemRow["Command"].ToString();
                    itemM.ContainerVolumeMax = ItemRow["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["ContainerVolumeMax"]);
                    itemM.ContainerWeightMax = ItemRow["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["ContainerVolumeMax"]);
                    itemM.ContainerWeightModifier = ItemRow["ContainerWeightModifier"] == DBNull.Value ? null : ItemRow["ContainerWeightModifier"].ToString();
                    itemM.IsConsumable = ItemRow["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsConsumable"]);
                    itemM.IsContainer = ItemRow["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsContainer"]);
                    itemM.IsDeleted = ItemRow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsDeleted"]);
                    itemM.IsMagical = ItemRow["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsMagical"]);
                    itemM.ItemCalculation = ItemRow["ItemCalculation"] == DBNull.Value ? null : ItemRow["ItemCalculation"].ToString();
                    itemM.ItemImage = ItemRow["ItemImage"] == DBNull.Value ? null : ItemRow["ItemImage"].ToString();

                    itemM.ItemMasterId = ItemRow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["ItemMasterId"]);


                    itemM.ItemName = ItemRow["ItemName"] == DBNull.Value ? null : ItemRow["ItemName"].ToString();

                    itemM.ItemVisibleDesc = ItemRow["ItemVisibleDesc"] == DBNull.Value ? null : ItemRow["ItemVisibleDesc"].ToString();
                    itemM.ItemStats = ItemRow["ItemStats"] == DBNull.Value ? null : ItemRow["ItemStats"].ToString();
                    itemM.Metatags = ItemRow["Metatags"] == DBNull.Value ? null : ItemRow["Metatags"].ToString();
                    itemM.ParentItemMasterId = ItemRow["ParentItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["ParentItemMasterId"]);
                    itemM.PercentReduced = ItemRow["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["PercentReduced"]);
                    itemM.Rarity = ItemRow["Rarity"] == DBNull.Value ? null : ItemRow["Rarity"].ToString();

                    itemM.RuleSetId = ItemRow["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["RuleSetId"]);
                    itemM.TotalWeightWithContents = ItemRow["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["TotalWeightWithContents"]);
                    itemM.Value = ItemRow["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["Value"]);
                    itemM.Volume = ItemRow["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["Volume"]);
                    itemM.Weight = ItemRow["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["Weight"]);

                    itemM.ItemMasterAbilities = new List<ItemMasterAbility>();
                    ItemMasterAbility IMA = null;
                    if (ds.Tables[1].Rows.Count > 0)
                    {
                        foreach (DataRow IMA_Row in ds.Tables[1].Rows)
                        {
                            int ItemMasterID = IMA_Row["ItemMasterID"] == DBNull.Value ? 0 : Convert.ToInt32(IMA_Row["ItemMasterID"]);
                            if (ItemMasterID == itemM.ItemMasterId)
                            {
                                IMA = new ItemMasterAbility();
                                IMA.AbilityId = IMA_Row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(IMA_Row["AbilityId"]);
                                IMA.IsDeleted = IMA_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IMA_Row["IsDeleted"]);
                                IMA.ItemMasterId = IMA_Row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(IMA_Row["ItemMasterId"]);

                                IMA.Abilitiy = new Ability()
                                {
                                    AbilityId = IMA_Row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(IMA_Row["AbilityId"]),
                                    Command = IMA_Row["Command"] == DBNull.Value ? null : IMA_Row["Command"].ToString(),
                                    CurrentNumberOfUses = IMA_Row["CurrentNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(IMA_Row["CurrentNumberOfUses"]),
                                    Description = IMA_Row["Description"] == DBNull.Value ? null : IMA_Row["Description"].ToString(),
                                    ImageUrl = IMA_Row["ImageUrl"] == DBNull.Value ? null : IMA_Row["ImageUrl"].ToString(),
                                    IsDeleted = IMA_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IMA_Row["IsDeleted"]),
                                    IsEnabled = IMA_Row["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(IMA_Row["IsEnabled"]),
                                    Level = IMA_Row["Level"] == DBNull.Value ? null : IMA_Row["Level"].ToString(),
                                    MaxNumberOfUses = IMA_Row["MaxNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(IMA_Row["MaxNumberOfUses"]),
                                    Metatags = IMA_Row["Metatags"] == DBNull.Value ? null : IMA_Row["Metatags"].ToString(),
                                    Name = IMA_Row["Name"] == DBNull.Value ? null : IMA_Row["Name"].ToString(),
                                    RuleSetId = IMA_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(IMA_Row["RuleSetId"]),
                                    ParentAbilityId = IMA_Row["ParentAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(IMA_Row["ParentAbilityId"]),
                                    Stats = IMA_Row["Stats"] == DBNull.Value ? null : IMA_Row["Stats"].ToString()
                                };
                                itemM.ItemMasterAbilities.Add(IMA);
                            }
                        }
                    }

                    itemM.ItemMasterSpell = new List<ItemMasterSpell>();
                    ItemMasterSpell IMS = null;
                    if (ds.Tables[2].Rows.Count > 0)
                    {
                        foreach (DataRow IMS_Row in ds.Tables[2].Rows)
                        {
                            int ItemMasterID = IMS_Row["ItemMasterID"] == DBNull.Value ? 0 : Convert.ToInt32(IMS_Row["ItemMasterID"]);
                            if (ItemMasterID == itemM.ItemMasterId)
                            {
                                IMS = new ItemMasterSpell();
                                IMS.SpellId = IMS_Row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(IMS_Row["SpellId"]);
                                IMS.IsDeleted = IMS_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IMS_Row["IsDeleted"]);
                                IMS.ItemMasterId = IMS_Row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(IMS_Row["ItemMasterId"]);

                                IMS.Spell = new Spell()
                                {
                                    SpellId = IMS_Row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(IMS_Row["SpellId"]),
                                    Command = IMS_Row["Command"] == DBNull.Value ? null : IMS_Row["Command"].ToString(),
                                    Description = IMS_Row["Description"] == DBNull.Value ? null : IMS_Row["Description"].ToString(),
                                    ImageUrl = IMS_Row["ImageUrl"] == DBNull.Value ? null : IMS_Row["ImageUrl"].ToString(),
                                    IsDeleted = IMS_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IMS_Row["IsDeleted"]),
                                    Metatags = IMS_Row["Metatags"] == DBNull.Value ? null : IMS_Row["Metatags"].ToString(),
                                    Name = IMS_Row["Name"] == DBNull.Value ? null : IMS_Row["Name"].ToString(),
                                    RuleSetId = IMS_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(IMS_Row["RuleSetId"]),
                                    ParentSpellId = IMS_Row["ParentSpellId"] == DBNull.Value ? 0 : Convert.ToInt32(IMS_Row["ParentSpellId"]),
                                    Stats = IMS_Row["Stats"] == DBNull.Value ? null : IMS_Row["Stats"].ToString(),
                                    CastingTime = IMS_Row["CastingTime"] == DBNull.Value ? null : IMS_Row["CastingTime"].ToString(),
                                    MaterialComponent = IMS_Row["MaterialComponent"] == DBNull.Value ? null : IMS_Row["MaterialComponent"].ToString(),
                                    Levels = IMS_Row["Levels"] == DBNull.Value ? null : IMS_Row["Levels"].ToString(),
                                    IsVerbalComponent = IMS_Row["IsVerbalComponent"] == DBNull.Value ? false : Convert.ToBoolean(IMS_Row["IsVerbalComponent"]),
                                    IsSomaticComponent = IMS_Row["IsSomaticComponent"] == DBNull.Value ? false : Convert.ToBoolean(IMS_Row["IsSomaticComponent"]),
                                    IsMaterialComponent = IMS_Row["IsMaterialComponent"] == DBNull.Value ? false : Convert.ToBoolean(IMS_Row["IsMaterialComponent"]),
                                    HitEffect = IMS_Row["HitEffect"] == DBNull.Value ? null : IMS_Row["HitEffect"].ToString(),
                                    Class = IMS_Row["Class"] == DBNull.Value ? null : IMS_Row["Class"].ToString(),
                                    EffectDescription = IMS_Row["EffectDescription"] == DBNull.Value ? null : IMS_Row["EffectDescription"].ToString(),
                                    Memorized = IMS_Row["Memorized"] == DBNull.Value ? false : Convert.ToBoolean(IMS_Row["Memorized"]),
                                    MissEffect = IMS_Row["MissEffect"] == DBNull.Value ? null : IMS_Row["MissEffect"].ToString(),
                                    School = IMS_Row["School"] == DBNull.Value ? null : IMS_Row["School"].ToString(),
                                    ShouldCast = IMS_Row["ShouldCast"] == DBNull.Value ? false : Convert.ToBoolean(IMS_Row["ShouldCast"])
                                };
                                itemM.ItemMasterSpell.Add(IMS);
                            }
                        }
                    }

                    itemM.ItemMasterCommand = new List<ItemMasterCommand>();
                    ItemMasterCommand IMC = null;
                    if (ds.Tables[3].Rows.Count > 0)
                    {
                        foreach (DataRow IMC_Row in ds.Tables[3].Rows)
                        {
                            int ItemMasterID = IMC_Row["ItemMasterID"] == DBNull.Value ? 0 : Convert.ToInt32(IMC_Row["ItemMasterID"]);
                            if (ItemMasterID == itemM.ItemMasterId)
                            {
                                IMC = new ItemMasterCommand();
                                IMC.ItemMasterCommandId = IMC_Row["ItemMasterCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(IMC_Row["ItemMasterCommandId"]);
                                IMC.IsDeleted = IMC_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IMC_Row["IsDeleted"]);
                                IMC.ItemMasterId = IMC_Row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(IMC_Row["ItemMasterId"]);
                                IMC.Name = IMC_Row["Name"] == DBNull.Value ? null : IMC_Row["Name"].ToString();
                                IMC.Command = IMC_Row["Command"] == DBNull.Value ? null : IMC_Row["Command"].ToString();

                                itemM.ItemMasterCommand.Add(IMC);
                            }
                        }
                    }
                    itemM.Items = new List<Item>();
                    Item IM = null;
                    if (ds.Tables[4].Rows.Count > 0)
                    {
                        foreach (DataRow IM_Row in ds.Tables[4].Rows)
                        {
                            int ItemMasterID = IM_Row["ItemMasterID"] == DBNull.Value ? 0 : Convert.ToInt32(IM_Row["ItemMasterID"]);
                            if (ItemMasterID == itemM.ItemMasterId)
                            {
                                IM = new Item()
                                {
                                    ItemId = IM_Row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(IM_Row["ItemId"]),
                                    IsDeleted = IM_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(IM_Row["IsDeleted"]),
                                    ItemMasterId = IM_Row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(IM_Row["ItemMasterId"]),
                                    Name = IM_Row["Name"] == DBNull.Value ? null : IM_Row["Name"].ToString(),
                                    Command = IM_Row["Command"] == DBNull.Value ? null : IM_Row["Command"].ToString(),
                                    CharacterId = IM_Row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(IM_Row["CharacterId"]),
                                    ContainedIn = IM_Row["ContainedIn"] == DBNull.Value ? null : (int?)IM_Row["ContainedIn"],
                                    ContainerVolumeMax = IM_Row["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["ContainerVolumeMax"]),
                                    ContainerWeightMax = IM_Row["ContainerWeightMax"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["ContainerWeightMax"]),
                                    ContainerWeightModifier = IM_Row["ContainerWeightModifier"] == DBNull.Value ? null : IM_Row["ContainerWeightModifier"].ToString(),
                                    Description = IM_Row["Description"] == DBNull.Value ? null : IM_Row["Description"].ToString(),
                                    IsConsumable = IM_Row["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(IM_Row["IsConsumable"]),
                                    IsContainer = IM_Row["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(IM_Row["IsContainer"]),
                                    IsEquipped = IM_Row["IsEquipped"] == DBNull.Value ? false : Convert.ToBoolean(IM_Row["IsEquipped"]),
                                    IsIdentified = IM_Row["IsIdentified"] == DBNull.Value ? false : Convert.ToBoolean(IM_Row["IsIdentified"]),
                                    IsMagical = IM_Row["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(IM_Row["IsMagical"]),
                                    IsVisible = IM_Row["IsVisible"] == DBNull.Value ? false : Convert.ToBoolean(IM_Row["IsVisible"]),
                                    ItemCalculation = IM_Row["ItemCalculation"] == DBNull.Value ? null : IM_Row["ItemCalculation"].ToString(),
                                    ItemImage = IM_Row["ItemImage"] == DBNull.Value ? null : IM_Row["ItemImage"].ToString(),
                                    ItemStats = IM_Row["ItemStats"] == DBNull.Value ? null : IM_Row["ItemStats"].ToString(),
                                    Metatags = IM_Row["Metatags"] == DBNull.Value ? null : IM_Row["Metatags"].ToString(),
                                    PercentReduced = IM_Row["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["PercentReduced"]),
                                    Quantity = IM_Row["Quantity"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["Quantity"]),
                                    Rarity = IM_Row["Rarity"] == DBNull.Value ? null : IM_Row["Rarity"].ToString(),
                                    ParentItemId = IM_Row["ParentItemId"] == DBNull.Value ? null : (int?)IM_Row["ParentItemId"],
                                    TotalWeight = IM_Row["TotalWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["TotalWeight"]),
                                    TotalWeightWithContents = IM_Row["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["TotalWeightWithContents"]),
                                    Value = IM_Row["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["Value"]),
                                    Volume = IM_Row["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["Volume"]),
                                    Weight = IM_Row["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(IM_Row["Weight"]),
                                };

                                itemM.Items.Add(IM);
                            }
                        }
                    }


                    itemM.RuleSet = new RuleSet();
                    RuleSet R = null;
                    if (ds.Tables[5].Rows.Count > 0)
                    {
                        foreach (DataRow R_Row in ds.Tables[5].Rows)
                        {
                            int RulesetID = R_Row["RulesetID"] == DBNull.Value ? 0 : Convert.ToInt32(R_Row["RulesetID"]);
                            if (RulesetID == itemM.RuleSetId)
                            {
                                short num = 0;
                                R = new RuleSet()
                                {
                                    CreatedBy = R_Row["CreatedBy"] == DBNull.Value ? null : R_Row["CreatedBy"].ToString(),
                                    CreatedDate = R_Row["CreatedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(R_Row["CreatedDate"]),
                                    CurrencyLabel = R_Row["CurrencyLabel"] == DBNull.Value ? null : R_Row["CurrencyLabel"].ToString(),
                                    DefaultDice = R_Row["DefaultDice"] == DBNull.Value ? null : R_Row["DefaultDice"].ToString(),
                                    DistanceLabel = R_Row["DistanceLabel"] == DBNull.Value ? null : R_Row["DistanceLabel"].ToString(),
                                    ImageUrl = R_Row["ImageUrl"] == DBNull.Value ? null : R_Row["ImageUrl"].ToString(),
                                    IsAbilityEnabled = R_Row["IsAbilityEnabled"] == DBNull.Value ? false : Convert.ToBoolean(R_Row["IsAbilityEnabled"]),
                                    isActive = R_Row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(R_Row["isActive"]),
                                    IsAllowSharing = R_Row["IsAllowSharing"] == DBNull.Value ? false : Convert.ToBoolean(R_Row["IsAllowSharing"]),
                                    IsCoreRuleset = R_Row["IsCoreRuleset"] == DBNull.Value ? false : Convert.ToBoolean(R_Row["IsCoreRuleset"]),
                                    IsDeleted = R_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(R_Row["IsDeleted"]),
                                    IsItemEnabled = R_Row["IsItemEnabled"] == DBNull.Value ? false : Convert.ToBoolean(R_Row["IsItemEnabled"]),
                                    IsSpellEnabled = R_Row["IsSpellEnabled"] == DBNull.Value ? false : Convert.ToBoolean(R_Row["IsSpellEnabled"]),
                                    ModifiedBy = R_Row["ModifiedBy"] == DBNull.Value ? null : R_Row["ModifiedBy"].ToString(),
                                    ModifiedDate = R_Row["ModifiedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(R_Row["ModifiedDate"]),
                                    OwnerId = R_Row["ParentRuleSetId"] == DBNull.Value ? null : R_Row["OwnerId"].ToString(),
                                    ParentRuleSetId = R_Row["ParentRuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(R_Row["ParentRuleSetId"]),
                                    RuleSetDesc = R_Row["RuleSetDesc"] == DBNull.Value ? null : R_Row["RuleSetDesc"].ToString(),
                                    RuleSetGenreId = R_Row["RuleSetGenreId"] == DBNull.Value ? num : (short)Convert.ToInt32(R_Row["RuleSetGenreId"]),
                                    RuleSetId = R_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(R_Row["RuleSetId"]),
                                    RuleSetName = R_Row["RuleSetName"] == DBNull.Value ? null : R_Row["RuleSetName"].ToString(),
                                    ShareCode = R_Row["ShareCode"] == DBNull.Value ? new Guid() : new Guid(R_Row["ShareCode"].ToString()),
                                    ThumbnailUrl = R_Row["ThumbnailUrl"] == DBNull.Value ? null : R_Row["ThumbnailUrl"].ToString(),
                                    VolumeLabel = R_Row["VolumeLabel"] == DBNull.Value ? null : R_Row["VolumeLabel"].ToString(),
                                    WeightLabel = R_Row["WeightLabel"] == DBNull.Value ? null : R_Row["WeightLabel"].ToString(),

                                };

                                itemM.RuleSet = R;
                            }
                        }
                    }

                    itemList.Add(itemM);
                }
            }

            return itemList;
        }

        public ItemsAndLootTemplates GetItemMastersByRuleSetId_add(int rulesetId, bool includeBundles = false, bool includeLootTemplates = false)
        {
            ItemsAndLootTemplates result = new ItemsAndLootTemplates();

            List<LootTemplate> lootTemplates = new List<LootTemplate>();

            List<ItemMaster_Bundle> itemList = new List<ItemMaster_Bundle>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
           // string qry = "EXEC ItemMasterGetAllDetailsByRulesetID_add @RulesetID = '" + rulesetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("ItemMasterGetAllDetailsByRulesetID_add", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@includeBundles", includeBundles);
                command.Parameters.AddWithValue("@includeLootTemplates", includeLootTemplates);
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
                foreach (DataRow ItemRow in ds.Tables[0].Rows)
                {
                    ItemMaster_Bundle itemM = new ItemMaster_Bundle();
                    itemM.Command = ItemRow["Command"] == DBNull.Value ? null : ItemRow["Command"].ToString();
                    itemM.ContainerVolumeMax = ItemRow["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["ContainerVolumeMax"]);
                    itemM.ContainerWeightMax = ItemRow["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["ContainerVolumeMax"]);
                    itemM.ContainerWeightModifier = ItemRow["ContainerWeightModifier"] == DBNull.Value ? null : ItemRow["ContainerWeightModifier"].ToString();
                    itemM.IsConsumable = ItemRow["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsConsumable"]);
                    itemM.IsContainer = ItemRow["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsContainer"]);
                    itemM.IsDeleted = ItemRow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsDeleted"]);
                    itemM.IsMagical = ItemRow["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsMagical"]);
                    itemM.ItemCalculation = ItemRow["ItemCalculation"] == DBNull.Value ? null : ItemRow["ItemCalculation"].ToString();
                    itemM.ItemImage = ItemRow["ItemImage"] == DBNull.Value ? null : ItemRow["ItemImage"].ToString();
                    itemM.ItemMasterId = ItemRow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["ItemMasterId"]);
                    itemM.ItemName = ItemRow["ItemName"] == DBNull.Value ? null : ItemRow["ItemName"].ToString();
                    itemM.ItemVisibleDesc = ItemRow["ItemVisibleDesc"] == DBNull.Value ? null : ItemRow["ItemVisibleDesc"].ToString();
                    itemM.ItemStats = ItemRow["ItemStats"] == DBNull.Value ? null : ItemRow["ItemStats"].ToString();
                    itemM.Metatags = ItemRow["Metatags"] == DBNull.Value ? null : ItemRow["Metatags"].ToString();
                    itemM.ParentItemMasterId = ItemRow["ParentItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["ParentItemMasterId"]);
                    itemM.PercentReduced = ItemRow["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["PercentReduced"]);
                    itemM.Rarity = ItemRow["Rarity"] == DBNull.Value ? null : ItemRow["Rarity"].ToString();
                    itemM.RuleSetId = ItemRow["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["RuleSetId"]);
                    itemM.TotalWeightWithContents = ItemRow["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["TotalWeightWithContents"]);
                    itemM.Value = ItemRow["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["Value"]);
                    itemM.Volume = ItemRow["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["Volume"]);
                    itemM.Weight = ItemRow["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(ItemRow["Weight"]);
                    itemM.IsBundle = ItemRow["IsBundle"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsBundle"]);

                    itemList.Add(itemM);
                }
            }

            if (includeLootTemplates)
            {
                RuleSet ruleset = new RuleSet();

                short num = 0;

                if (ds.Tables[2].Rows.Count > 0)
                    ruleset = _repo.GetRuleset(ds.Tables[2], num);

                if (ds.Tables[1].Rows.Count > 0)
                {

                    foreach (DataRow row in ds.Tables[1].Rows)
                    {
                        LootTemplate _LootTemplate = new LootTemplate();
                        _LootTemplate.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                        _LootTemplate.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                        _LootTemplate.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                        _LootTemplate.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
                        _LootTemplate.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                        _LootTemplate.LootTemplateId = row["LootTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootTemplateId"].ToString());
                        _LootTemplate.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                        _LootTemplate.RuleSet = ruleset;

                        _LootTemplate.LootTemplateRandomizationEngines = new List<LootTemplateRandomizationEngine>();
                        if (ds.Tables[3].Rows.Count > 0)
                        {
                            foreach (DataRow RErow in ds.Tables[3].Rows)
                            {
                                int LT_ID = RErow["LootTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["LootTemplateId"]);
                                if (LT_ID == _LootTemplate.LootTemplateId)
                                {
                                    LootTemplateRandomizationEngine RE = new LootTemplateRandomizationEngine();
                                    RE.RandomizationEngineId = RErow["RandomizationEngineId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["RandomizationEngineId"]);
                                    RE.Qty = RErow["Qty"] == DBNull.Value ? string.Empty : RErow["Qty"].ToString();
                                    RE.Percentage = RErow["Percentage"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["Percentage"]);
                                    RE.SortOrder = RErow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["SortOrder"]);
                                    RE.ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]);
                                    RE.IsOr = RErow["IsOr"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsOr"]);
                                    RE.IsDeleted = RErow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(RErow["IsDeleted"]);
                                    RE.LootTemplateId = LT_ID;
                                    RE.ItemMaster = new ItemMaster()
                                    {
                                        ItemMasterId = RErow["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(RErow["ItemMasterId"]),
                                        ItemName = RErow["ItemName"] == DBNull.Value ? null : RErow["ItemName"].ToString(),
                                        ItemImage = RErow["ItemImage"] == DBNull.Value ? null : RErow["ItemImage"].ToString()
                                    };
                                    _LootTemplate.LootTemplateRandomizationEngines.Add(RE);
                                }
                            }
                        }

                        lootTemplates.Add(_LootTemplate);
                    }
                }
            }
            result.itemMaster_Bundle = itemList;
            result.lootTemplate = lootTemplates;
            return result;

        }
        public async Task<int> GetItemMasterCount()
        {
            return _context.ItemMasters.Where(x => x.IsDeleted != true).Count();
        }


        public int GetCountByRuleSetId(int ruleSetId)
        {
            return (_context.ItemMasters.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted != true).Count()
                +
                _context.ItemMasterBundles.Where(x => x.RuleSetId == ruleSetId).Count());
        }
        public int Core_GetCountByRuleSetId(int ruleSetId, int parentID)
        {
            // var query = "EXEC CoreGetItemMasters @rulesetID = " + ruleSetId + ",@parentRulesetID= " + parentID + "";
            //var res = _context.ItemMasters.FromSql<ItemMaster>(query).Count();
            // return res;

            //var idsToRemove = _context.ItemMasters.Where(p => (p.RuleSetId == ruleSetId) && p.ParentItemMasterId != null).Select(p => p.ParentItemMasterId).ToArray();

            //var itemsToRemove = _context.ItemMasters.Where(p => idsToRemove.Contains(p.ItemMasterId)).ToList();

            //var res = _context.ItemMasters.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == parentID) && x.IsDeleted != true)
            //    .Except(itemsToRemove);

            //return res.Count();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Ruleset_GetRecordCounts @RulesetID = '" + ruleSetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataTable dt = new DataTable();
            try
            {
                connection.Open();
                command = new SqlCommand("Ruleset_GetRecordCounts", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", ruleSetId);
                command.CommandType = CommandType.StoredProcedure;

                adapter.SelectCommand = command;

                adapter.Fill(dt);
                command.Dispose();
                connection.Close();
            }
            catch (Exception ex)
            {
                command.Dispose();
                connection.Close();
            }
            SP_RulesetRecordCount res = new SP_RulesetRecordCount();
            if (dt.Rows.Count > 0)
            {
                res.ItemMasterCount = Convert.ToInt32(dt.Rows[0]["ItemMasterCount"]);
            }
            return res.ItemMasterCount;


        }


        public async Task<bool> CheckDuplicateItemMaster(string value, int? ruleSetId, int? itemMasterId = 0)
        {
            //var items = _repo.GetAll();

            //if (items.Result == null || items.Result.Count == 0) return false;
            //else if (ruleSetId > 0)
            //    return items.Result.Where(x => x.ItemName.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.ItemMasterId != itemMasterId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            //else
            //    return items.Result.Where(x => x.ItemName.ToLower() == value.ToLower() && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            if (ruleSetId > 0)
                return _context.ItemMasters.Where(x => x.ItemName.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.ItemMasterId != itemMasterId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            else
                return _context.ItemMasters.Where(x => x.ItemName.ToLower() == value.ToLower() && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }
        public async Task<bool> CheckDuplicateItemMasterLoot(string value, int? ruleSetId, int? lootID = 0)
        {
            if (ruleSetId > 0)
                return _context.ItemMasterLoots.Where(x => x.ItemName.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.LootId != lootID && x.IsDeleted != true && x.IsLootPile != true).FirstOrDefault() == null ? false : true;
            else
                return _context.ItemMasterLoots.Where(x => x.ItemName.ToLower() == value.ToLower() && x.IsDeleted != true && x.IsLootPile != true).FirstOrDefault() == null ? false : true;
        }
        public async Task<bool> CheckDuplicateItemMasterLootPile(string value, int? ruleSetId, int? lootID = 0)
        {
            if (ruleSetId > 0)
                return _context.ItemMasterLoots.Where(x => x.ItemName.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.LootId != lootID && x.IsDeleted != true && x.IsLootPile==true).FirstOrDefault() == null ? false : true;
            else
                return _context.ItemMasterLoots.Where(x => x.ItemName.ToLower() == value.ToLower() && x.IsDeleted != true && x.IsLootPile == true).FirstOrDefault() == null ? false : true;
        }
        public async Task<ItemMaster> GetDuplicateItemMaster(string value, int? ruleSetId, int? itemMasterId = 0)
        {
            //var items = _repo.GetAll();

            //if (items.Result == null || items.Result.Count == 0)
            //    return null;
            //else if (ruleSetId > 0)
            //    return items.Result.Where(x => x.ItemName.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.ItemMasterId != itemMasterId && x.IsDeleted != true).FirstOrDefault();
            //else
            //    return items.Result.Where(x => x.ItemName.ToLower() == value.ToLower() && x.IsDeleted != true).FirstOrDefault();

            if (ruleSetId > 0)
                return _context.ItemMasters.Where(x => x.ItemName.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.ItemMasterId != itemMasterId && x.IsDeleted != true).FirstOrDefault();
            else
                return _context.ItemMasters.Where(x => x.ItemName.ToLower() == value.ToLower() && x.IsDeleted != true).FirstOrDefault();

        }
        //public async Task<ItemMasterLoot> GetDuplicateLootPile(string value, int? ruleSetId, int? lootId = 0)
        //{
            
        //    if (ruleSetId > 0)
        //        return _context.ItemMasterLoots.Where(x => x.ItemName.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.LootId != lootId && x.IsDeleted != true).FirstOrDefault();
        //    else
        //        return _context.ItemMasterLoots.Where(x => x.ItemName.ToLower() == value.ToLower() && x.IsDeleted != true).FirstOrDefault();

        //}

        public bool Core_ItemMasterWithParentIDExists(int itemMasterID, int RulesetID)
        {
            if (_context.ItemMasters.Where(x => x.ItemMasterId == itemMasterID && x.ParentItemMasterId != null && x.IsDeleted != true).Any())
            {
                return true;
            }
            else
            {
                var model = _context.ItemMasters.Where(x => x.ItemMasterId == itemMasterID && x.ParentItemMasterId == null && x.IsDeleted != true);
                if (model.FirstOrDefault().RuleSetId == RulesetID)
                {
                    return true;
                }
            }
            return false;
            //var rec = _context.ItemMasters.Where(x => x.ItemMasterId == itemMasterID && x.ParentItemMasterId != null && x.IsDeleted != true).FirstOrDefault().
            //return _context.ItemMasters.Where(x => x.ItemMasterId == itemMasterID && x.ParentItemMasterId != null && x.IsDeleted != true).Any();
        }
        public bool Core_ItemMasterLootWithParentIDExists(int LootID, int RulesetID)
        {
            if (_context.ItemMasterLoots.Where(x => x.LootId == LootID && x.ParentLootId != null && x.IsDeleted != true).Any())
            {
                return true;
            }
            else
            {
                var model = _context.ItemMasterLoots.Where(x => x.LootId == LootID && x.ParentLootId == null && x.IsDeleted != true);
                if (model.FirstOrDefault().RuleSetId == RulesetID)
                {
                    return true;
                }
            }
            return false;
            //var rec = _context.ItemMasters.Where(x => x.ItemMasterId == itemMasterID && x.ParentItemMasterId != null && x.IsDeleted != true).FirstOrDefault().
            //return _context.ItemMasters.Where(x => x.ItemMasterId == itemMasterID && x.ParentItemMasterId != null && x.IsDeleted != true).Any();
        }
        public bool Core_BundleWithParentIDExists(int bundleId, int rulesetID) {
            if (_context.ItemMasterBundles.Where(x => x.BundleId == bundleId && x.ParentItemMasterBundleId != null).Any())
            {
                return true;
            }
            else
            {
                var model = _context.ItemMasterBundles.Where(x => x.BundleId == bundleId && x.ParentItemMasterBundleId == null);
                if (model.FirstOrDefault().RuleSetId == rulesetID)
                {
                    return true;
                }
            }
            return false;
        }

        public List<ItemMaster_Bundle> SP_GetItemMastersByRuleSetId(int rulesetId, int page, int pageSize)
        {
            List<ItemMaster_Bundle> itemlist = new List<ItemMaster_Bundle>();
            RuleSet ruleset = new RuleSet();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC ItemMaster_GetByRulesetID @RulesetID='" + rulesetId + "',@page='" + page + "',@size='" + pageSize + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("ItemMaster_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.Parameters.AddWithValue("@includeBundles", true);
                
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

            if (ds.Tables[0].Rows.Count > 0)
            {

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    ItemMaster_Bundle i = new ItemMaster_Bundle();
                    i.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    i.ContainerVolumeMax = row["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerVolumeMax"]);
                    i.ContainerWeightMax = row["ContainerWeightMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerWeightMax"]);
                    i.ContainerWeightModifier = row["ContainerWeightModifier"] == DBNull.Value ? null : row["ContainerWeightModifier"].ToString();
                    i.IsConsumable = row["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(row["IsConsumable"]);
                    i.IsContainer = row["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(row["IsContainer"]);
                    i.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    i.IsMagical = row["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMagical"]);
                    i.ItemCalculation = row["ItemCalculation"] == DBNull.Value ? null : row["ItemCalculation"].ToString();
                    i.ItemImage = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"].ToString());
                    i.ItemName = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString();
                    i.ItemStats = row["ItemStats"] == DBNull.Value ? null : row["ItemStats"].ToString();
                    i.ItemVisibleDesc = row["ItemVisibleDesc"] == DBNull.Value ? null : row["ItemVisibleDesc"].ToString();
                    i.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                    i.ParentItemMasterId = row["ParentItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentItemMasterId"].ToString());
                    i.PercentReduced = row["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(row["PercentReduced"]);
                    i.Rarity = row["Rarity"] == DBNull.Value ? null : row["Rarity"].ToString();
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                    i.TotalWeightWithContents = row["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeightWithContents"]);
                    i.Value = row["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Value"]);
                    i.Volume = row["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Volume"]);
                    i.Weight = row["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Weight"]);

                    i.RuleSet = ruleset;
                    i.CommandName= row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    i.IsBundle = row["IsBundle"] == DBNull.Value ? false : Convert.ToBoolean(row["IsBundle"]);
                    itemlist.Add(i);
                }
            }
            return itemlist;
        }
        public SP_AbilitySpellForItemMaster AbilitySpellForItemsByRuleset_sp(int rulesetId, int itemMasterId)
        {
            SP_AbilitySpellForItemMaster res = new SP_AbilitySpellForItemMaster();
            res.abilityList = new List<Ability>();
            res.selectedAbilityList = new List<Ability>();
            res.spellList = new List<Spell>();
            res.selectedSpellList = new List<Spell>();
            res.buffAndEffectsList = new List<BuffAndEffect>();
            res.selectedBuffAndEffects = new List<BuffAndEffect>();
            res.selectedItemMasterCommand = new List<ItemMasterCommand>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC ItemMasters_Ability_Spell_GetByRulesetID @RulesetID = '" + rulesetId + "',@ItemMasterID = '" + itemMasterId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("ItemMasters_Ability_Spell_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@ItemMasterID", itemMasterId);
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

                    res.buffAndEffectsList.Add(i);/////////
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

                    res.selectedBuffAndEffects.Add(i);///////
                }

            }
            if (ds.Tables[6].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[6].Rows)
                {
                    ItemMasterCommand i = new ItemMasterCommand();
                    i.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    i.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ItemMasterCommandId = row["ItemMasterCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterCommandId"]);
                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"]);
                    res.selectedItemMasterCommand.Add(i);
                }

            }
            return res;
        }
        public SP_AbilitySpellForItemMaster AbilitySpellForLootsByRuleset_sp(int rulesetId, int lootID)
        {
            SP_AbilitySpellForItemMaster res = new SP_AbilitySpellForItemMaster();
            res.abilityList = new List<Ability>();
            res.selectedAbilityList = new List<Ability>();
            res.spellList = new List<Spell>();
            res.selectedSpellList = new List<Spell>();
            res.buffAndEffectsList = new List<BuffAndEffect>();
            res.selectedBuffAndEffects = new List<BuffAndEffect>();
            res.selectedItemMasterCommand = new List<ItemMasterCommand>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC ItemMasters_Ability_Spell_GetByRulesetID @RulesetID = '" + rulesetId + "',@ItemMasterID = '" + itemMasterId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Loots_Ability_Spell_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@LootID", lootID);
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

                    res.buffAndEffectsList.Add(i);/////////
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

                    res.selectedBuffAndEffects.Add(i);///////
                }

            }
            if (ds.Tables[6].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[6].Rows)
                {
                    ItemMasterCommand i = new ItemMasterCommand();
                    i.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    i.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ItemMasterCommandId = row["ItemMasterLootCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterLootCommandId"]);
                    i.ItemMasterId = row["ItemMasterLootId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterLootId"]);
                    res.selectedItemMasterCommand.Add(i);
                }

            }
            return res;
        }
        public ItemMasterMonsterItem GetMonsterContainer(int? containedIn) {
            return _context.ItemMasterMonsterItems.Where(x => x.ItemId == containedIn && x.IsDeleted != true).FirstOrDefault();
        }
        public List<ItemMasterMonsterItem> GetByMonsterContainerId(int itemId) {
            return _context.ItemMasterMonsterItems
               .Where(x => x.ContainedIn == itemId && x.IsDeleted != true)
               .OrderBy(o => o.ItemName).ToList();
        }
        public async Task DeleteMonsterItem(int id) {
            var res = _context.ItemMasterMonsterItems.Where(x => x.ItemId == id).FirstOrDefault();
            if (res != null) 
            {
                res.IsDeleted = true;
               await _context.SaveChangesAsync();
            }
        }
        #region Loot
        public async Task _AddItemsToLoot(List<LootsToAdd> itemList, List<DeployLootTemplateListToAdd> lootTemplateList, int rulesetID, int selectedLootPileId) {

            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            DataTable Datatable_Ids = utility.ToDataTable<LootsToAdd>(itemList);
           // DataTable Datatable_LootTemplateIds = utility.ToDataTable<DeployLootTemplateListToAdd>(lootTemplateList);
            using (SqlConnection con = new SqlConnection(consString))
            {

                using (SqlCommand cmd = new SqlCommand("AddItemMasterToLoot"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@IdsToInsert", Datatable_Ids);
                    cmd.Parameters.AddWithValue("@RulesetID", rulesetID);
                    cmd.Parameters.AddWithValue("@selectedLootPileId", selectedLootPileId);
                    
                    con.Open();
                    try
                    {
                        var a =await cmd.ExecuteNonQueryAsync();
                    }
                    catch (Exception ex)
                    {
                        con.Close();
                        throw ex;
                    }
                    con.Close();                    
                }
            }

            DeployLootTemplateList(lootTemplateList);
        }

        public void DeployLootTemplateList(List<DeployLootTemplateListToAdd> lootTemplateList)
        {
            foreach (var model in lootTemplateList)
            {
                string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
                //assign datatable for list records of dice results.
                int index = 0;

                DataTable DT_reItems = new DataTable();
                if (model.REItems != null)
                {
                    if (model.REItems.Count > 0)
                    {
                        DT_reItems = utility.ToDataTable<REItems>(model.REItems);
                    }
                    else
                    {
                        model.REItems.Add(new REItems() { itemMasterId = 0, qty = 0 });
                        DT_reItems = utility.ToDataTable<REItems>(model.REItems);
                    }
                }
                else
                {
                    model.REItems.Add(new REItems() { itemMasterId = 0, qty = 0 });
                    DT_reItems = utility.ToDataTable<REItems>(model.REItems);
                }

                using (SqlConnection con = new SqlConnection(consString))
                {

                    using (SqlCommand cmd = new SqlCommand("LootTemplate_DeployToLoot"))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Connection = con;                        
                        cmd.Parameters.AddWithValue("@RulesetID", model.rulesetId);
                        cmd.Parameters.AddWithValue("@LootTemplateId", model.lootTemplateId);
                        cmd.Parameters.AddWithValue("@Qty", 1);                        
                        cmd.Parameters.AddWithValue("@REItems", DT_reItems);
                        //cmd.Parameters.AddWithValue("@IsBundle", model.isBundle);

                        con.Open();
                        try
                        {
                            var a = cmd.ExecuteNonQuery();
                        }
                        catch (Exception ex)
                        {
                            con.Close();
                            throw ex;
                        }
                        con.Close();

                    }
                }
            }
        }

        public async Task<List<ItemMasterLoot_ViewModel>> GetItemMasterLoots(int rulesetID, int page = 1, int pageSize = 30)
        {
            List<ItemMasterLoot_ViewModel> itemlist = new List<ItemMasterLoot_ViewModel>();
            RuleSet ruleset = new RuleSet();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC ItemMaster_GetByRulesetID @RulesetID='" + rulesetId + "',@page='" + page + "',@size='" + pageSize + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("ItemMasterLoot_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetID);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);

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

            if (ds.Tables[0].Rows.Count > 0)
            {

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    ItemMasterLoot_ViewModel i = new ItemMasterLoot_ViewModel();
                    i.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    i.ContainerVolumeMax = row["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerVolumeMax"]);
                    i.ContainerWeightMax = row["ContainerWeightMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerWeightMax"]);
                    i.ContainerWeightModifier = row["ContainerWeightModifier"] == DBNull.Value ? null : row["ContainerWeightModifier"].ToString();
                    i.IsConsumable = row["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(row["IsConsumable"]);
                    i.IsContainer = row["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(row["IsContainer"]);
                    i.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    i.IsMagical = row["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMagical"]);
                    i.ItemCalculation = row["ItemCalculation"] == DBNull.Value ? null : row["ItemCalculation"].ToString();
                    i.ItemImage = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"].ToString());
                    i.ItemName = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString();
                    i.ItemStats = row["ItemStats"] == DBNull.Value ? null : row["ItemStats"].ToString();
                    i.ItemVisibleDesc = row["ItemVisibleDesc"] == DBNull.Value ? null : row["ItemVisibleDesc"].ToString();
                    i.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                   //i.ParentItemMasterId = row["ParentItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentItemMasterId"].ToString());
                    i.ParentLootId = row["ParentLootId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentLootId"].ToString());
                    i.PercentReduced = row["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(row["PercentReduced"]);
                    i.Rarity = row["Rarity"] == DBNull.Value ? null : row["Rarity"].ToString();
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                    i.TotalWeightWithContents = row["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeightWithContents"]);
                    i.Value = row["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Value"]);
                    i.Volume = row["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Volume"]);
                    i.Weight = row["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Weight"]);

                    i.RuleSet = ruleset;
                    i.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();

                    i.LootId = row["LootId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootId"].ToString());
                    i.IsShow = row["IsShow"] == DBNull.Value ? false : Convert.ToBoolean(row["IsShow"]);
                    i.ContainedIn = row["ContainedIn"] == DBNull.Value ? 0 : Convert.ToInt32(row["ContainedIn"].ToString());
                    i.Quantity = row["Quantity"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Quantity"]);
                    i.IsIdentified = row["IsIdentified"] == DBNull.Value ? false : Convert.ToBoolean(row["IsIdentified"]);
                    i.IsVisible = row["IsVisible"] == DBNull.Value ? false : Convert.ToBoolean(row["IsVisible"]);
                    i.TotalWeight = row["TotalWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeight"]);
                    i.IsLootPile = row["IsLootPile"] == DBNull.Value ? false : Convert.ToBoolean(row["IsLootPile"]);
                    i.LootPileId = row["LootPileId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootPileId"].ToString());
                    itemlist.Add(i);
                }
            }
            return itemlist;



            //return await _context.ItemMasterLoots.Include(x => x.ItemMaster)
            //    .Where(x => x.ItemMaster.RuleSetId == rulesetID && x.ItemMaster.IsDeleted!=true).AsNoTracking().ToListAsync();
        }
        public async Task<List<ItemMasterLoot_ViewModel>> GetLootItemsForPlayers(int rulesetID) {
            var res =await GetItemMasterLoots(rulesetID, 1, 999999);
            return res.Where(x => (x.IsShow == true || (x.IsLootPile==true && x.IsVisible == true)) && x.IsDeleted != true).OrderByDescending(x=>x.IsLootPile).ThenBy(x=>x.ItemName).ToList();
        }
        public ItemMasterLoot CreateItemMasterLoot(ItemMaster result, ItemMasterLoot loot, 
            List<ItemMasterLootSpell> AssociateSpellVM, 
            List<ItemMasterLootAbility> AssociateAbilityVM, 
            List<ItemMasterLootBuffAndEffect> AssociateBuffAndEffectVM, 
            List<ItemMasterLootCommand> AssociateCommandVM,int rulesetId, Item item=null)
        {
            var Newloot = new ItemMasterLoot();
            if (item != null)
            {
                 Newloot = new ItemMasterLoot()
                {
                    //ContainedIn = loot.ContainedIn,
                    IsIdentified = item.IsIdentified,
                    IsVisible = item.IsVisible,
                    IsShow = loot.IsShow,
                    ItemMasterId = result.ItemMasterId,
                    Quantity = item.Quantity,

                    Command = item.Command,
                    CommandName = item.CommandName,
                    ContainerVolumeMax = item.ContainerVolumeMax,
                    ContainerWeightMax = item.ContainerWeightMax,
                    ContainerWeightModifier = item.ContainerWeightModifier,
                    IsConsumable = item.IsConsumable,
                    IsContainer = item.IsContainer,
                    IsMagical = item.IsMagical,
                    ItemCalculation = item.ItemCalculation,
                    ItemImage = item.ItemImage,
                    ItemName = item.Name,
                    ItemStats = item.ItemStats,
                    ItemVisibleDesc = item.Description,
                    Metatags = item.Metatags,
                    PercentReduced = item.PercentReduced,
                    Rarity = item.Rarity,
                    RuleSetId = rulesetId,////////////////
                    // TotalWeight = itemDomain.to,
                    Value = item.Value,
                    TotalWeightWithContents = item.TotalWeightWithContents,
                    Volume = item.Volume,
                    Weight = item.Weight,
                     TotalWeight = item.TotalWeight,
                     LootPileId= loot.LootPileId
                 };
            }
            else {
                 Newloot = new ItemMasterLoot()
                {
                    ContainedIn = loot.ContainedIn,
                    IsIdentified = loot.IsIdentified,
                    IsVisible = loot.IsVisible,
                    IsShow = loot.IsShow,
                    ItemMasterId = result.ItemMasterId,
                    Quantity = loot.Quantity,

                    Command = loot.Command,
                    CommandName = loot.CommandName,
                    ContainerVolumeMax = loot.ContainerVolumeMax,
                    ContainerWeightMax = loot.ContainerWeightMax,
                    ContainerWeightModifier = loot.ContainerWeightModifier,
                    IsConsumable = loot.IsConsumable,
                    IsContainer = loot.IsContainer,
                    IsMagical = loot.IsMagical,
                    ItemCalculation = loot.ItemCalculation,
                    ItemImage = loot.ItemImage,
                    ItemName = loot.ItemName,
                    ItemStats = loot.ItemStats,
                    ItemVisibleDesc = loot.ItemVisibleDesc,
                    Metatags = loot.Metatags,
                    PercentReduced = loot.PercentReduced,
                    Rarity = loot.Rarity,
                    RuleSetId = rulesetId,
                    // TotalWeight = itemDomain.to,
                    Value = loot.Value,
                    TotalWeightWithContents = loot.TotalWeightWithContents,
                    Volume = loot.Volume,
                    Weight = loot.Weight,
                   TotalWeight= loot.Quantity * (loot.Weight),
                   LootPileId = loot.LootPileId
                 };
            }
            
                _context.ItemMasterLoots.Add(Newloot);
            _context.SaveChanges();
            ///////////////////////////////////////////// return Newloot;

            Newloot.ItemMasterAbilities = new List<ItemMasterLootAbility>();
            Newloot.ItemMasterSpell = new List<ItemMasterLootSpell>();
            Newloot.itemMasterBuffAndEffects = new List<ItemMasterLootBuffAndEffect>();
            Newloot.ItemMasterCommand = new List<ItemMasterLootCommand>();
           
           
            int ItemMasterLootId = Newloot.LootId;
            try
            {
                if (ItemMasterLootId > 0)
                {

                    if (AssociateAbilityVM != null && AssociateAbilityVM.Count > 0)
                    {
                        AssociateAbilityVM.ForEach(a => a.ItemMasterLootId = ItemMasterLootId);
                        _context.ItemMasterLootAbilitys.AddRange(AssociateAbilityVM);
                        _context.SaveChanges();
                    }
                    if (AssociateSpellVM != null && AssociateSpellVM.Count > 0)
                    {
                        AssociateSpellVM.ForEach(a => a.ItemMasterLootId = ItemMasterLootId);
                        _context.ItemMasterLootSpells.AddRange(AssociateSpellVM);// _repoMasterSpell.AddRange(AssociatedSpells);
                        _context.SaveChanges();
                    }
                    if (AssociateBuffAndEffectVM != null && AssociateBuffAndEffectVM.Count > 0)
                    {
                        //AssociatedBuffAndEffects.ForEach(a => a.ItemMasterId = ItemMasterId);
                        //AssociatedBuffAndEffects.ForEach(a => a.Id = 0);
                        List<ItemMasterLootBuffAndEffect> AssociatedBuffAndEffectsList = AssociateBuffAndEffectVM.Select(x => new ItemMasterLootBuffAndEffect()
                        {
                            BuffAndEffectId = x.BuffAndEffectId,
                        }).ToList();
                        foreach (var be in AssociatedBuffAndEffectsList)
                        {
                            _context.ItemMasterLootBuffAndEffects.Add(new ItemMasterLootBuffAndEffect() { BuffAndEffectId = be.BuffAndEffectId, ItemMasterLootId = ItemMasterLootId });
                        }
                        //_context.ItemMasterBuffAndEffects.AddRange(AssociatedBuffAndEffectsList);// _repoMasterSpell.AddRange(AssociatedSpells);
                        _context.SaveChanges();
                    }
                    if (AssociateCommandVM != null && AssociateCommandVM.Count > 0)
                    {
                        foreach (var imcViewModels in AssociateCommandVM)
                        {
                            _context.ItemMasterLootCommands.Add(new ItemMasterLootCommand()
                            {
                                Command = imcViewModels.Command,
                                Name = imcViewModels.Name,
                                ItemMasterLootId = ItemMasterLootId
                            });
                           
                        }
                        _context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            { }
            Newloot.ItemMasterAbilities = AssociateAbilityVM;
            Newloot.ItemMasterSpell = AssociateSpellVM;
            Newloot.itemMasterBuffAndEffects = AssociateBuffAndEffectVM;
            Newloot.ItemMasterCommand = AssociateCommandVM;
            return Newloot;

        }
        public async  Task<ItemMasterLoot> UpdateItemMasterLoot(ItemMasterLoot loot,
            List<ItemMasterLootSpell> itemMasterSpell, 
            List<ItemMasterLootAbility> itemMasterAbilities,
            List<ItemMasterLootBuffAndEffect> itemMasterBuffAndEffects, 
            List<ItemMasterLootCommand> itemMasterCommand)
        {
            ItemMasterLoot obj = _context.ItemMasterLoots.Where(x => x.LootId == loot.LootId).FirstOrDefault();
            if (obj!=null)
            {
                    obj.ContainedIn = loot.ContainedIn;
                    obj.IsIdentified = loot.IsIdentified;
                    obj.IsVisible = loot.IsVisible;
                    obj.IsShow = loot.IsShow;
                    obj.ItemMasterId = loot.ItemMasterId;
                    obj.Quantity = loot.Quantity;

               
               
                
                obj.Command = loot.Command;
                obj.CommandName = loot.CommandName;
                obj.ContainerVolumeMax = loot.ContainerVolumeMax;
                obj.ContainerWeightMax = loot.ContainerWeightMax;
                obj.ContainerWeightModifier = loot.ContainerWeightModifier;
                obj.IsConsumable = loot.IsConsumable;
                obj.IsContainer = loot.IsContainer;
                obj.IsMagical = loot.IsMagical;
                obj.ItemCalculation = loot.ItemCalculation;
                obj.ItemImage = loot.ItemImage;
                obj.ItemName = loot.ItemName;
                obj.ItemStats = loot.ItemStats;
                obj.ItemVisibleDesc = loot.ItemVisibleDesc;
                obj.Metatags = loot.Metatags;
                obj.PercentReduced = loot.PercentReduced;
                obj.Rarity = loot.Rarity;
                
                
                obj.Value = loot.Value;
                obj.TotalWeightWithContents = loot.TotalWeightWithContents;
                obj.Volume = loot.Volume;
                obj.Weight = loot.Weight ;
                obj.TotalWeight = loot.TotalWeight;

                _context.ItemMasterLootAbilitys.RemoveRange(_context.ItemMasterLootAbilitys.Where(x => x.ItemMasterLootId == loot.LootId));
                _context.ItemMasterLootSpells.RemoveRange(_context.ItemMasterLootSpells.Where(x => x.ItemMasterLootId == loot.LootId));
                _context.ItemMasterLootBuffAndEffects.RemoveRange(_context.ItemMasterLootBuffAndEffects.Where(x => x.ItemMasterLootId == loot.LootId));
                _context.ItemMasterLootCommands.RemoveRange(_context.ItemMasterLootCommands.Where(x => x.ItemMasterLootId == loot.LootId));
                await _context.SaveChangesAsync();
                int LootId = loot.LootId;
                try
                {
                    if (LootId > 0)
                    {
                        if (itemMasterAbilities != null && itemMasterAbilities.Count > 0)
                        {
                            itemMasterAbilities.ForEach(a => a.ItemMasterLootId = LootId);
                            _context.ItemMasterLootAbilitys.AddRange(itemMasterAbilities);
                            _context.SaveChanges();
                        }
                        if (itemMasterSpell != null && itemMasterSpell.Count > 0)
                        {
                            itemMasterSpell.ForEach(a => a.ItemMasterLootId = LootId);
                            _context.ItemMasterLootSpells.AddRange(itemMasterSpell);// _repoMasterSpell.AddRange(AssociatedSpells);
                            _context.SaveChanges();
                        }
                        if (itemMasterBuffAndEffects != null && itemMasterBuffAndEffects.Count > 0)
                        {
                           
                            List<ItemMasterLootBuffAndEffect> AssociatedBuffAndEffectsList = itemMasterBuffAndEffects.Select(x => new ItemMasterLootBuffAndEffect()
                            {
                                BuffAndEffectId = x.BuffAndEffectId,
                            }).ToList();
                            foreach (var be in AssociatedBuffAndEffectsList)
                            {
                                _context.ItemMasterLootBuffAndEffects.Add(new ItemMasterLootBuffAndEffect() { BuffAndEffectId = be.BuffAndEffectId, ItemMasterLootId = LootId });
                            }
                           _context.SaveChanges();
                        }
                        if (itemMasterCommand != null && itemMasterCommand.Count > 0)
                        {
                            itemMasterCommand.ForEach(a => a.ItemMasterLootId = LootId);
                            _context.ItemMasterLootCommands.AddRange(itemMasterCommand);// _repoMasterSpell.AddRange(AssociatedSpells);
                            _context.SaveChanges();
                        }
                    }
                }
                catch (Exception ex)
                { }


               
            }
            return obj;
        }
        public async Task<ItemMasterLoot> getLootDetails(int LootId) {
            return await _context.ItemMasterLoots.Include(x=>x.ItemMaster)
                .Include(x=>x.ItemMasterAbilities)
                .Include(x=>x.ItemMasterSpell)
                .Include(x=>x.itemMasterBuffAndEffects)
                .Include(x=>x.ItemMasterCommand)
                .Where(x => x.LootId == LootId).FirstOrDefaultAsync();
        }
        public async Task<List<ItemMasterLoot>> getMultipleLootDetails(List<int> LootId)
        {
            if (LootId.Any())
            {
                return await _context.ItemMasterLoots.Include(x => x.ItemMaster).Where(x => LootId.Contains(x.LootId)).ToListAsync();
            }
            return new List<ItemMasterLoot>();
        }
        public async Task<bool> DeleteContainer(int itemMasterId)
        {
            var item = _context.ItemMasterLoots.Where(x => x.ContainedIn == itemMasterId).ToList();

            foreach (var itm in item)
            {
                itm.ContainedIn = null;
               await _context.SaveChangesAsync();
            }

            return true;
        }
        public async Task<List<ItemMasterLoot_ViewModel>> GetByContainerId(int? containerId)
        {
            //get all item for which given item act as container
            return await _context.ItemMasterLoots.Include(x=>x.ItemMaster)
               .Where(x => x.ContainedIn == containerId && x.ItemMaster.IsDeleted != true)
               .OrderBy(o => o.ItemMaster.ItemName)
               .Select(x => new ItemMasterLoot_ViewModel()
               {
                   Command = x.ItemMaster.Command,
                   CommandName = x.ItemMaster.CommandName,
                   ContainedIn = x.ContainedIn,
                   ContainerVolumeMax = x.ItemMaster.ContainerVolumeMax,
                   ContainerWeightMax = x.ItemMaster.ContainerWeightMax,
                   ContainerWeightModifier = x.ItemMaster.ContainerWeightModifier,
                   IsConsumable = x.ItemMaster.IsConsumable,
                   IsContainer = x.ItemMaster.IsContainer,
                   IsDeleted = x.ItemMaster.IsDeleted,
                   IsIdentified = x.IsIdentified,
                   IsMagical = x.ItemMaster.IsMagical,
                   IsShow = x.IsShow,
                   IsVisible = x.IsVisible,
                   ItemCalculation = x.ItemMaster.ItemCalculation,
                   ItemImage = x.ItemMaster.ItemImage,
                   ItemMasterAbilities = x.ItemMaster.ItemMasterAbilities,
                   ItemMasterCommand = x.ItemMaster.ItemMasterCommand,
                   ItemMasterId = x.ItemMaster.ItemMasterId,
                   ItemMasterPlayers = x.ItemMaster.ItemMasterPlayers,
                   ItemMasterSpell = x.ItemMaster.ItemMasterSpell,
                   ItemName = x.ItemMaster.ItemName,
                   Items = x.ItemMaster.Items,
                   ItemStats = x.ItemMaster.ItemStats,
                   LootId = x.LootId,
                   ItemVisibleDesc = x.ItemMaster.ItemVisibleDesc,
                   ParentItemMasterId = x.ItemMaster.ParentItemMasterId,
                   Metatags = x.ItemMaster.Metatags,
                   PercentReduced = x.ItemMaster.PercentReduced,
                   Quantity = x.Quantity,
                   Rarity = x.ItemMaster.Rarity,
                   RuleSetId = x.ItemMaster.RuleSetId,
                   TotalWeight = x.TotalWeight,
                   TotalWeightWithContents = x.ItemMaster.TotalWeightWithContents,
                   Value = x.ItemMaster.Value,
                   Volume = x.ItemMaster.Volume,
                   Weight = x.ItemMaster.Weight,
               })
               .ToListAsync();
        }
        public async Task<ItemMasterLoot> UpdateWeight(int itemMasterId, decimal TotalWeight)
        {
            var item = _context.ItemMasterLoots.Where(x => x.ItemMasterId == itemMasterId).FirstOrDefault();

            if (item == null) return item;
            item.TotalWeight = TotalWeight;
           await _context.SaveChangesAsync();

            //if (containerItemId > 0 && (item.ContainedIn == null || item.ContainedIn == 0))
            //{
            //    item.ContainedIn = containerItemId;
            //    _context.SaveChanges();
            //}

            return item;
        }
        public async Task<ItemMasterLoot> UpdateContainer(int itemId, int containerItemId)
        {
            var item = _context.ItemMasterLoots.Where(x => x.LootId == itemId).FirstOrDefault();

            if (item == null) return item;

            if (containerItemId > 0 && (item.ContainedIn == null || item.ContainedIn == 0))
            {
                item.ContainedIn = containerItemId;
               await _context.SaveChangesAsync();
            }

            return item;
        }
        public async Task DeleteItemMasterLoot(int lootId) {
            var loot = _context.ItemMasterLoots.Where(x => x.LootId == lootId).FirstOrDefault();
            if (loot!=null)
            {
                var as_ability = _context.ItemMasterLootAbilitys.Where(x => x.ItemMasterLootId == lootId).ToList();
                var as_spell = _context.ItemMasterLootSpells.Where(x => x.ItemMasterLootId == lootId).ToList();
                var as_buffeffect = _context.ItemMasterLootBuffAndEffects.Where(x => x.ItemMasterLootId == lootId).ToList();
                var as_command = _context.ItemMasterLootCommands.Where(x => x.ItemMasterLootId == lootId).ToList();

                foreach (var item in as_ability)
                {
                    item.IsDeleted = true;
                }
                foreach (var item in as_spell)
                {
                    item.IsDeleted = true;
                }
                foreach (var item in as_buffeffect)
                {
                    item.IsDeleted = true;
                }
                foreach (var item in as_command)
                {
                    item.IsDeleted = true;
                }

                loot.IsDeleted = true;
                await _context.SaveChangesAsync();
            }           
            
        }
        public async Task ShowLoot(int lootID, bool isShow) {
            var loot = _context.ItemMasterLoots.Where(x => x.LootId == lootID).FirstOrDefault();
            if (loot!=null)
            {
                loot.IsShow = isShow;
                await _context.SaveChangesAsync();
            }
        }
        public async Task<List<ItemMasterLoot_ViewModel>> GetAvailableContainerItems(int rulesetId, int ItemMasterId)
        {
            // get all character items exept item itself
            var res = await GetItemMasterLoots(rulesetId, 1, 999999);
            return res.Where(x => x.LootId != ItemMasterId
                &&  x.IsContainer == true && x.IsDeleted != true)               
                .ToList();
            //&& x.ContainedIn == null //if isContainer is true then item is a container & an item can act as container for many item
        }
        public decimal GetContainedItemWeight(int containerItemId)
        {
            decimal res = 0;
            if (_context.ItemMasterLoots.Where(x => x.ItemMasterId == containerItemId).Any())
            {
                var obj = _context.ItemMasterLoots.Where(x => x.ItemMasterId == containerItemId).FirstOrDefault();
                if (obj != null)
                {
                    res = obj.TotalWeight;
                }
            }
            return res;

        }
        //public List<ItemMasterLoot> GetByContainerId(int? containerId)
        //{
        //    //get all item for which given item act as container
        //    return _context.ItemMasterLoots.Include(x=>x.ItemMaster)
        //       .Where(x => x.ContainedIn == containerId)
        //       .OrderBy(o => o.ItemMaster.ItemName).ToList();
        //}

        public ItemMasterLoot_ViewModel GetContainer(int? lootId)
        {
            //to get container
            return _context.ItemMasterLoots.Include(x=>x.ItemMaster).Where(x => x.LootId == lootId)
                .Select(x => new ItemMasterLoot_ViewModel()
                {
                    Command = x.ItemMaster.Command,
                    CommandName = x.ItemMaster.CommandName,
                    ContainedIn = x.ContainedIn,
                    ContainerVolumeMax = x.ItemMaster.ContainerVolumeMax,
                    ContainerWeightMax = x.ItemMaster.ContainerWeightMax,
                    ContainerWeightModifier = x.ItemMaster.ContainerWeightModifier,
                    IsConsumable = x.ItemMaster.IsConsumable,
                    IsContainer = x.ItemMaster.IsContainer,
                    IsDeleted = x.ItemMaster.IsDeleted,
                    IsIdentified = x.IsIdentified,
                    IsMagical = x.ItemMaster.IsMagical,
                    IsShow = x.IsShow,
                    IsVisible = x.IsVisible,
                    ItemCalculation = x.ItemMaster.ItemCalculation,
                    ItemImage = x.ItemMaster.ItemImage,
                    ItemMasterAbilities = x.ItemMaster.ItemMasterAbilities,
                    ItemMasterCommand = x.ItemMaster.ItemMasterCommand,
                    ItemMasterId = x.ItemMaster.ItemMasterId,
                    ItemMasterPlayers = x.ItemMaster.ItemMasterPlayers,
                    ItemMasterSpell = x.ItemMaster.ItemMasterSpell,
                    ItemName = x.ItemMaster.ItemName,
                    Items = x.ItemMaster.Items,
                    ItemStats = x.ItemMaster.ItemStats,
                    LootId = x.LootId,
                    ItemVisibleDesc = x.ItemMaster.ItemVisibleDesc,
                    ParentItemMasterId = x.ItemMaster.ParentItemMasterId,
                    Metatags = x.ItemMaster.Metatags,
                    PercentReduced = x.ItemMaster.PercentReduced,
                    Quantity = x.Quantity,
                    Rarity = x.ItemMaster.Rarity,
                    RuleSetId = x.ItemMaster.RuleSetId,
                    TotalWeight = x.TotalWeight,
                    TotalWeightWithContents = x.ItemMaster.TotalWeightWithContents,
                    Value = x.ItemMaster.Value,
                    Volume = x.ItemMaster.Volume,
                    Weight = x.ItemMaster.Weight,
                })
                .FirstOrDefault();
        }
        public List<ItemMasterLoot_ViewModel> GetAvailableItems(int rulesetId)
        {
            var res = GetItemMasterLoots(rulesetId, 1, 999999).Result;
             res= res.Where(p =>  p.IsDeleted != true)
               .OrderBy(o => o.ItemName)               
               .ToList();
            //foreach (var item in res)
            //{
            //    item.ItemMasterLoot = _context.ItemMasterLoots.Where(x => x.ItemMasterId == item.ItemMasterId).FirstOrDefault();
            //}
            return res;
        }
        public ItemMasterLoot GetLootById(int id) {
            var loot = _context.ItemMasterLoots
              .Include(d => d.RuleSet)
              .Include(d => d.ItemMasterAbilities).ThenInclude(d => d.Ability)
              .Include(d => d.ItemMasterSpell).ThenInclude(d => d.Spell)
              .Include(d => d.itemMasterBuffAndEffects).ThenInclude(d => d.BuffAndEffect)
              .Include(d => d.ItemMasterCommand)              
              .Where(d => d.LootId == id && d.IsDeleted != true)
              .FirstOrDefault();

            if (loot == null) return loot;

            loot.ItemMasterAbilities = loot.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
            loot.ItemMasterSpell = loot.ItemMasterSpell.Where(p => p.IsDeleted != true).ToList();
            loot.itemMasterBuffAndEffects = loot.itemMasterBuffAndEffects.Where(p => p.IsDeleted != true).ToList();
            //  itemmaster.ItemMasterPlayers = itemmaster.ItemMasterPlayers.Where(p => p.IsDeleted != true).ToList();
            loot.ItemMasterCommand = loot.ItemMasterCommand.Where(p => p.IsDeleted != true).ToList();
            

            return loot;
        }
        public bool isLootAvailable(int rulesetId) {
            return _context.ItemMasterLoots.Where(x => x.RuleSetId == rulesetId && x.IsShow == true && x.IsDeleted != true).Any();
        }
        public void DeleteMultiItemTemplates(List<ItemMaster_Bundle> model, int rulesetId) {
            int index = 0;
            List<numbersList> dtList = model.Where(x => x.IsBundle).Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x.ItemMasterId
            }).ToList();


            DataTable DT_List = new DataTable();

            if (dtList.Count > 0)
            {
                DT_List = utility.ToDataTable<numbersList>(dtList);
            }

            index = 0;
            List<numbersList> dtList1 = model.Where(x => !x.IsBundle).Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x.ItemMasterId
            }).ToList();


            DataTable DT_List1 = new DataTable();

            if (dtList1.Count > 0)
            {
                DT_List1 = utility.ToDataTable<numbersList>(dtList1);
            }


            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            int rowseffectesd = 0;
            SqlConnection con1 = new SqlConnection(connectionString);
            con1.Open();
            SqlCommand cmd1 = new SqlCommand("Ruleset_DeleteMultiItemMasters", con1);
            cmd1.CommandType = CommandType.StoredProcedure;

            cmd1.Parameters.AddWithValue("@RecordIdsList", DT_List1);
            cmd1.Parameters.AddWithValue("@RulesetID", rulesetId);

            rowseffectesd = cmd1.ExecuteNonQuery();
            con1.Close();

            
            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("Ruleset_DeleteMultiItemMasterBundles", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@RecordIdsList", DT_List);
            cmd.Parameters.AddWithValue("@RulesetID", rulesetId);

            rowseffectesd = cmd.ExecuteNonQuery();
            con.Close();


        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }

        public void CreateLootPile(CreateLootPileModel model) {

            int index = 0;
            List<CommonID> dtList = model.LootPileItems.Select(x => new CommonID()
            {
                ID = x.LootId,                
            }).ToList();

            DataTable DT_List = new DataTable();

            if (dtList.Count > 0)
            {
                DT_List = utility.ToDataTable<CommonID>(dtList);
            }
            else {
                dtList.Add(new CommonID { ID = 0});
                DT_List = utility.ToDataTable<CommonID>(dtList);
            }

            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            
            using (SqlConnection con = new SqlConnection(consString))
            {

                using (SqlCommand cmd = new SqlCommand("LootPile_Create"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@Name", model.ItemName);
                    cmd.Parameters.AddWithValue("@Image", model.ItemImage);
                    cmd.Parameters.AddWithValue("@Description", model.ItemVisibleDesc==null?"": model.ItemVisibleDesc);
                    cmd.Parameters.AddWithValue("@Visible", model.IsVisible);
                    cmd.Parameters.AddWithValue("@Metatags", model.Metatags);
                    cmd.Parameters.AddWithValue("@LootItemIdsToAdd", DT_List);                    
                    cmd.Parameters.AddWithValue("@RulesetID", model.RuleSetId);
                    con.Open();
                    try
                    {
                        var a = cmd.ExecuteNonQuery();
                    }
                    catch (Exception ex)
                    {
                        con.Close();
                        throw ex;
                    }
                    con.Close();
                }
            }
        }
        public LootPileViewModel getLootPileDetails(int lootPileId)
        {
            LootPileViewModel obj = new LootPileViewModel();
            var lootPile = _context.ItemMasterLoots.Where(x => x.LootId == lootPileId && x.IsDeleted != true && x.IsLootPile == true).Include(x=>x.RuleSet).FirstOrDefault();
            if (lootPile!=null)
            {
                obj.IsVisible = lootPile.IsVisible;
                obj.ItemImage = lootPile.ItemImage;
                obj.ItemName = lootPile.ItemName;
                obj.ItemVisibleDesc = lootPile.ItemVisibleDesc;
                obj.LootId = lootPile.LootId;
                obj.Metatags = lootPile.Metatags;
                obj.RuleSetId = lootPile.RuleSetId;
                obj.LootPileItems = new List<LootPileItems_ViewModel>();
                obj.lootPileRuleSet = lootPile.RuleSet;

                var LootPileItems = _context.ItemMasterLoots.Where(x => x.LootPileId == lootPile.LootId && x.IsDeleted != true && x.IsLootPile != true).ToList();
                foreach (var item in LootPileItems)
                {
                    obj.LootPileItems.Add(new LootPileItems_ViewModel()
                    {
                        ItemImage = item.ItemImage,
                        ItemName = item.ItemName,
                        LootId = item.LootId,
                        ItemMasterId = item.ItemMasterId,
                        Qty=Convert.ToInt32(item.Quantity)
                    }
                    );
                }
            }
            return obj;
        }
        public void UpdateLootPile(CreateLootPileModel itemDomain) {
            var lootPile = _context.ItemMasterLoots.Where(x => x.LootId == itemDomain.LootId && x.IsDeleted != true && x.IsLootPile == true).FirstOrDefault();
            if (lootPile != null)
            {
                lootPile.IsVisible = itemDomain.IsVisible;
                lootPile.ItemImage = itemDomain.ItemImage;
                lootPile.ItemName = itemDomain.ItemName;
                lootPile.ItemVisibleDesc = itemDomain.ItemVisibleDesc;

                lootPile.Metatags = itemDomain.Metatags;



                //var lootPileItemsToUpdate = itemDomain.LootPileItems;
                //var OldLootPileItems = _context.ItemMasterLoots.Where(x => x.LootPileId == lootPile.LootId && x.IsDeleted != true && x.IsLootPile != true).ToList();


                //List<int> LootPileItemsLootIdsToDelete = new List<int>();
                //List<int> LootPileItemsLootIdsToUpdate = new List<int>();
                List<LootPileLootItem> LootItemIdsToAdd = new List<LootPileLootItem>();

                var LootPileItems = _context.ItemMasterLoots.Where(x => x.LootPileId == lootPile.LootId && x.IsDeleted != true && x.IsLootPile != true).ToList();

                foreach (var db_item in LootPileItems)
                {

                    if (!itemDomain.LootPileItems.Where(x => x.LootId == db_item.LootId).Any())
                    {
                        //LootPileItemsLootIdsToDelete.Add(db_item.LootId);
                        db_item.IsDeleted = true;
                    }
                    //else {

                    //}
                }


                foreach (var model_item in itemDomain.LootPileItems)
                {
                    if (!LootPileItems.Where(x => x.LootId == model_item.LootId).Any())
                    {
                        LootItemIdsToAdd.Add(model_item);
                    }
                    //else
                    //{
                    //    var rec = LootPileItems.Where(x => x.ItemMasterId == model_item.ItemMasterId).FirstOrDefault();
                    //    if (model_item.Qty != rec.Quantity)
                    //    {
                    //        rec.Quantity = model_item.Qty;
                    //    }
                    //}


                }
                _context.SaveChanges();
                if (LootItemIdsToAdd.Any())
                {
                    List<ItemMasterLoot> itemMasterLoots = new List<ItemMasterLoot>();
                    foreach (var item in LootItemIdsToAdd)
                    {
                        itemMasterLoots.Add(new ItemMasterLoot() { LootId = item.LootId });
                    }
                    MoveLoot(itemMasterLoots, itemDomain.LootId);
                    //int index = 0;
                    //List<LootPileItem> dtList = ItemMasterIdsToAdd.Select(x => new LootPileItem()
                    //{
                    //    RowNum = index = Getindex(index),
                    //    ItemMasterId = x.ItemMasterId,
                    //    Qty = x.Qty
                    //}).ToList();

                    //DataTable DT_List = new DataTable();

                    //if (dtList.Count > 0)
                    //{
                    //    DT_List = utility.ToDataTable<LootPileItem>(dtList);
                    //}

                    //string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

                    //using (SqlConnection con = new SqlConnection(consString))
                    //{

                    //    using (SqlCommand cmd = new SqlCommand("LootPile_UpdateItems"))
                    //    {
                    //        cmd.CommandType = CommandType.StoredProcedure;
                    //        cmd.Connection = con;
                    //        cmd.Parameters.AddWithValue("@LootPileId", itemDomain.LootId);
                    //        cmd.Parameters.AddWithValue("@ItemMasterIdsToAdd", DT_List);
                    //        cmd.Parameters.AddWithValue("@RulesetID", itemDomain.RuleSetId);
                    //        con.Open();
                    //        try
                    //        {
                    //            var a = cmd.ExecuteNonQuery();
                    //        }
                    //        catch (Exception ex)
                    //        {
                    //            con.Close();
                    //            throw ex;
                    //        }
                    //        con.Close();
                    //    }
                    //}
                }
            }
        }

        public LootPileViewModel getCharacterLootPile(int characterId)
        {
            LootPileViewModel obj = new LootPileViewModel();

            var characterLootPile = _context.ItemMasterLoots.Where(x => x.LootPileCharacterId == characterId && x.IsLootPile == true && x.IsDeleted != true).FirstOrDefault();

            if (characterLootPile == null)
            {
                int itemMasterId = _context.ItemMasters.First().ItemMasterId;
                var character = _context.Characters.Where(x => x.CharacterId == characterId && x.IsDeleted != true).FirstOrDefault();
                if (character != null)
                {
                    _context.ItemMasterLoots.Add(new ItemMasterLoot()
                    {
                        ItemName = character.CharacterName + "’s Drops",
                        ItemImage = character.ImageUrl,
                        ItemVisibleDesc = "Items dropped by " + character.CharacterName,
                        IsVisible = true,
                        LootPileCharacterId = characterId,
                        IsLootPile = true,
                        ItemMasterId = itemMasterId,
                        RuleSetId= character.RuleSetId
                    });
                    _context.SaveChanges();
                }
                obj = _context.ItemMasterLoots.Where(x => x.LootPileCharacterId == characterId && x.IsLootPile == true && x.IsDeleted != true)
                    .Select(x => new LootPileViewModel()
                    {
                        IsVisible = x.IsVisible,
                        ItemImage = x.ItemImage,
                        ItemName = x.ItemName,
                        ItemVisibleDesc = x.ItemVisibleDesc,
                        LootId = x.LootId,
                        Metatags = x.Metatags,
                        RuleSetId = x.RuleSetId,
                    }).FirstOrDefault();

            }
            else
            {

                obj.IsVisible = characterLootPile.IsVisible;
                obj.ItemImage = characterLootPile.ItemImage;
                obj.ItemName = characterLootPile.ItemName;
                obj.ItemVisibleDesc = characterLootPile.ItemVisibleDesc;
                obj.LootId = characterLootPile.LootId;
                obj.Metatags = characterLootPile.Metatags;
                obj.RuleSetId = characterLootPile.RuleSetId;

            }



            return obj;
        }

        public LootPileViewModel getMonsterLootPile(int monsterId, int rulesetId) {
            LootPileViewModel obj = new LootPileViewModel();
            
                var monsterLootPile = _context.ItemMasterLoots.Where(x => x.LootPileMonsterId == monsterId && x.IsLootPile == true && x.IsDeleted != true).FirstOrDefault();

                if (monsterLootPile == null)
                {
                var monster = _context.Monsters.Where(x => x.MonsterId == monsterId && x.IsDeleted != true).FirstOrDefault();
                if (monster != null)
                {
                    int itemMasterId = _context.ItemMasters.First().ItemMasterId;
                    _context.ItemMasterLoots.Add(new ItemMasterLoot()
                    {
                        ItemName = monster.Name + "’s Drops",
                        ItemImage = monster.ImageUrl,
                        ItemVisibleDesc = "Items dropped by " + monster.Name,
                        IsVisible = true,
                        LootPileMonsterId = monsterId,
                        IsLootPile = true,
                        ItemMasterId= itemMasterId,
                        RuleSetId= rulesetId
                    });
                    _context.SaveChanges();
                }
                    obj = _context.ItemMasterLoots.Where(x => x.LootPileMonsterId == monsterId && x.IsLootPile == true && x.IsDeleted != true)
                        .Select(x => new LootPileViewModel()
                        {
                            IsVisible = x.IsVisible,
                            ItemImage = x.ItemImage,
                            ItemName = x.ItemName,
                            ItemVisibleDesc = x.ItemVisibleDesc,
                            LootId = x.LootId,
                            Metatags = x.Metatags,
                            RuleSetId = x.RuleSetId,
                        }).FirstOrDefault();

                }
                else
                {

                    obj.IsVisible = monsterLootPile.IsVisible;
                    obj.ItemImage = monsterLootPile.ItemImage;
                    obj.ItemName = monsterLootPile.ItemName;
                    obj.ItemVisibleDesc = monsterLootPile.ItemVisibleDesc;
                    obj.LootId = monsterLootPile.LootId;
                    obj.Metatags = monsterLootPile.Metatags;
                    obj.RuleSetId = monsterLootPile.RuleSetId;

                }
            


            return obj;
        }

        public async Task ShowLootPile(int lootPileID, bool isVisible) {
            var loot = _context.ItemMasterLoots.Where(x => x.LootId == lootPileID).FirstOrDefault();
            if (loot != null)
            {
                loot.IsVisible = isVisible;
                await _context.SaveChangesAsync();
            }
        }


        public List<LootPileViewModel> GetLootPilesListByCharacterId(int characterId, int rulesetId)
        {
            List<LootPileViewModel> result = new List<LootPileViewModel>();
            LootPileViewModel characterLootPile = getCharacterLootPile(characterId);
            List<LootPileViewModel> list = _context.ItemMasterLoots.Where(x => x.IsLootPile == true && x.RuleSetId == rulesetId && x.IsVisible == true 
            && x.LootPileCharacterId!=characterId && x.IsDeleted!=true)
                .Select(x=> new LootPileViewModel() {
                    IsVisible=x.IsVisible,
                    ItemImage=x.ItemImage,
                    ItemName=x.ItemName,
                    ItemVisibleDesc=x.ItemVisibleDesc,
                    LootId=x.LootId,
                    Metatags=x.Metatags,
                    RuleSetId=x.RuleSetId,
                })
                .ToList();

            result.Add(characterLootPile);
            foreach (var item in list)
            {
                result.Add(item);
            }

            string rulesetimage = "https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png";
            var ruleset = _context.RuleSets.Where(x => x.RuleSetId == rulesetId && x.IsDeleted != true).FirstOrDefault();
            if (ruleset != null)
            {
                if (!string.IsNullOrEmpty(ruleset.ImageUrl))
                {
                    rulesetimage = ruleset.ImageUrl;
                }

            }


            LootPileViewModel rootLoot = new LootPileViewModel()
            {
                ItemName = "Root (No Pile)",
                IsVisible = true,
                ItemImage = rulesetimage,
                LootId = -1,
                RuleSetId = rulesetId,

            };
            result.Add(rootLoot);

            return result;
        }

        public async Task<List<ItemMasterLoot_ViewModel>> GetItemsFromLootPile(int lootPileId) {
            List<ItemMasterLoot_ViewModel> res = new List<ItemMasterLoot_ViewModel>();
            res =await _context.ItemMasterLoots.Where(x => x.LootPileId == lootPileId && x.IsDeleted != true)
                .Select(x=>new ItemMasterLoot_ViewModel() {
                    IsLootPile=x.IsLootPile==null?false: (bool)x.IsLootPile,
                    ItemImage= x.ItemImage,
                    ItemName= x.ItemName,
                    ItemMasterId= x.ItemMasterId,
                    LootId= x.LootId,
                    RuleSetId= x.RuleSetId == null ? 0 : (int)x.RuleSetId,
                })
                .ToListAsync();
            return res;
        }

        public void MoveLoot(List<ItemMasterLoot> model, int lootPileID) {
            try
            {
                int index = 0;
                List<CommonID> dtList = model.Select(x => new CommonID()
                {                   
                    ID = x.LootId,                    
                }).ToList();

                DataTable DT_List = new DataTable();

                if (dtList.Count > 0)
                {
                    DT_List = utility.ToDataTable<CommonID>(dtList);
                }
                else
                {
                    dtList.Add(new CommonID { ID = 0 });
                    DT_List = utility.ToDataTable<CommonID>(dtList);
                }

                string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

                using (SqlConnection con = new SqlConnection(consString))
                {

                    using (SqlCommand cmd = new SqlCommand("Loot_Move"))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@LootIdsToMove", DT_List);
                        cmd.Parameters.AddWithValue("@LootPileID", lootPileID);                        
                        con.Open();
                        try
                        {
                            var a = cmd.ExecuteNonQuery();
                        }
                        catch (Exception ex)
                        {
                            con.Close();
                            throw ex;
                        }
                        con.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public List<LootPileViewModel> GetLootPilesListByRuleSetId(int rulesetId)
        {
            List<LootPileViewModel> result = new List<LootPileViewModel>();
            string rulesetimage = "https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png";
            var ruleset = _context.RuleSets.Where(x => x.RuleSetId == rulesetId && x.IsDeleted != true).FirstOrDefault();
            if (ruleset != null)
            {
                if (!string.IsNullOrEmpty(ruleset.ImageUrl))
                {
                    rulesetimage = ruleset.ImageUrl;
                }
                
            }


            LootPileViewModel rootLoot = new LootPileViewModel() {
                ItemName = "Root (No Pile)",
                IsVisible=true,
                ItemImage= rulesetimage,
                LootId=-1,
                RuleSetId=rulesetId,
                
            };
            result.Add(rootLoot);

            List<LootPileViewModel> list = _context.ItemMasterLoots.Where(x => x.IsLootPile == true && x.RuleSetId == rulesetId && x.IsDeleted != true)
                .Select(x => new LootPileViewModel()
                {
                    IsVisible = x.IsVisible,
                    ItemImage = x.ItemImage,
                    ItemName = x.ItemName,
                    ItemVisibleDesc = x.ItemVisibleDesc,
                    LootId = x.LootId,
                    Metatags = x.Metatags,
                    RuleSetId = x.RuleSetId,
                })
                .ToList();

            foreach (var item in list)
            {
                result.Add(item);
            }
            return result;
        }


        #endregion
    }
}
