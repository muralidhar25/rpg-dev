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

        public async Task<ItemMaster> CreateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities)
        {
            item.ItemMasterAbilities = new List<ItemMasterAbility>();
            item.ItemMasterSpell = new List<ItemMasterSpell>();
            await _repo.Add(item);
            int ItemMasterId = item.ItemMasterId;
            try
            {
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
                }
            }
            catch { }
            item.ItemMasterAbilities = AssociatedAbilities;
            item.ItemMasterSpell = AssociatedSpells;
            return item;
        }

        public async Task<ItemMaster> Core_CreateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities)
        {
            item.ParentItemMasterId = item.ItemMasterId;
            item.ItemMasterId = 0;

            try
            {
                item.ItemMasterSpell = new List<ItemMasterSpell>();
                item.ItemMasterAbilities = new List<ItemMasterAbility>();
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
                }
            }
            catch (Exception ex) { }
            return item;
        }
        public async Task<ItemMaster> UpdateItemMaster(ItemMaster item, List<ItemMasterSpell> AssociatedSpells, List<ItemMasterAbility> AssociatedAbilities)
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


            try
            {
                _context.SaveChanges();

                AssociatedAbilities.ForEach(a => a.ItemMasterId = item.ItemMasterId);
                await _repoMasterAbility.AddRange(AssociatedAbilities);

                AssociatedSpells.ForEach(a => a.ItemMasterId = item.ItemMasterId);
                await _repoMasterSpell.AddRange(AssociatedSpells);

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
              .Include(d => d.ItemMasterCommand)
              .Include(d => d.Items)
              .Where(d => d.ItemMasterId == id && d.IsDeleted != true)
              .FirstOrDefault();

            if (itemmaster == null) return itemmaster;

            itemmaster.ItemMasterAbilities = itemmaster.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
            itemmaster.ItemMasterSpell = itemmaster.ItemMasterSpell.Where(p => p.IsDeleted != true).ToList();
            //  itemmaster.ItemMasterPlayers = itemmaster.ItemMasterPlayers.Where(p => p.IsDeleted != true).ToList();
            itemmaster.ItemMasterCommand = itemmaster.ItemMasterCommand.Where(p => p.IsDeleted != true).ToList();
            itemmaster.Items = itemmaster.Items.Where(p => p.IsDeleted != true).ToList();

            return itemmaster;
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

        public List<ItemMaster_Bundle> GetItemMastersByRuleSetId_add(int rulesetId, bool includeBundles = false)
        {
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
            return itemList;

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

        #region Loot
        public async Task _AddItemsToLoot(List<CommonID> itemList) {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            DataTable Datatable_Ids = utility.ToDataTable<CommonID>(itemList);
            using (SqlConnection con = new SqlConnection(consString))
            {

                using (SqlCommand cmd = new SqlCommand("AddItemMasterToLoot"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@IdsToInsert", Datatable_Ids);
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
                    i.ParentItemMasterId = row["ParentItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentItemMasterId"].ToString());
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
                    itemlist.Add(i);
                }
            }
            return itemlist;



            //return await _context.ItemMasterLoots.Include(x => x.ItemMaster)
            //    .Where(x => x.ItemMaster.RuleSetId == rulesetID && x.ItemMaster.IsDeleted!=true).AsNoTracking().ToListAsync();
        }
        public async Task<List<ItemMasterLoot_ViewModel>> GetLootItemsForPlayers(int rulesetID) {
            return await _context.ItemMasterLoots.Include(x => x.ItemMaster)
                            .Where(x =>x.IsShow==true && x.ItemMaster.RuleSetId == rulesetID && x.ItemMaster.IsDeleted != true)
                            //.AsNoTracking()
                            .Select(x => new ItemMasterLoot_ViewModel() {
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
        public void CreateItemMasterLoot(ItemMaster result, ItemMasterLoot loot) {
            _context.ItemMasterLoots.Add(new ItemMasterLoot()
            {
                ContainedIn = loot.ContainedIn,
                IsIdentified = loot.IsIdentified,
                IsVisible = loot.IsVisible,
                IsShow = loot.IsShow,
                ItemMasterId = result.ItemMasterId,
                Quantity = loot.Quantity,
            });
            _context.SaveChanges();
        }
        public async  Task<ItemMasterLoot> UpdateItemMasterLoot(ItemMasterLoot loot)
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
                await _context.SaveChangesAsync();
            }
            return obj;
        }
        public async Task<ItemMasterLoot> getLootDetails(int LootId) {
            return await _context.ItemMasterLoots.Where(x => x.LootId == LootId).FirstOrDefaultAsync();
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
        public async Task<List<ItemMasterLoot>> GetByContainerId(int? containerId)
        {
            //get all item for which given item act as container
            return await _context.ItemMasterLoots.Include(x=>x.ItemMaster)
               .Where(x => x.ContainedIn == containerId && x.ItemMaster.IsDeleted != true)
               .OrderBy(o => o.ItemMaster.ItemName).ToListAsync();
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
            var item = _context.ItemMasterLoots.Where(x => x.ItemMasterId == itemId).FirstOrDefault();

            if (item == null) return item;

            if (containerItemId > 0 && (item.ContainedIn == null || item.ContainedIn == 0))
            {
                item.ContainedIn = containerItemId;
               await _context.SaveChangesAsync();
            }

            return item;
        }
        public async Task DeleteItemMasterLoot(int lootId) {
            _context.ItemMasterLoots.Remove(_context.ItemMasterLoots.Where(x => x.LootId == lootId).FirstOrDefault());
            await _context.SaveChangesAsync();
        }
        #endregion
    }
}
