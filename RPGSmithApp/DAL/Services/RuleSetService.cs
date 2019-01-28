using System;
using System.Collections.Generic;
using System.Text;
using DAL.Models;
using DAL.Repositories.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;
using System.Data;
using DAL.Models.SPModels;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class RuleSetService : IRuleSetService
    {
        private readonly IRepository<RuleSet> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IRepository<UserRuleSet> _repoUserRuleSet;
        private readonly IConfiguration _configuration;
        public RuleSetService(IRepository<RuleSet> repo, IRepository<UserRuleSet> repoUserRuleSet, ApplicationDbContext context, IConfiguration configuration)
        {
            _repo = repo;
            _repoUserRuleSet = repoUserRuleSet;
            this._context = context;
            _configuration = configuration;
        }

        public async Task<RuleSet> Insert(RuleSet RuleSetDomain)
        {
            return await _repo.Add(RuleSetDomain);
        }

        public async Task<List<RuleSet>> GetRuleSets(int page, int pageSize)
        {
            var results = _context.RuleSets.Where(p => p.IsDeleted != true).ToList();
            return results.Skip(pageSize * (page - 1)).Take(pageSize).ToList();
        }

        public async Task<List<RuleSet>> GetRuleSets()
        {
            return _context.RuleSets.Where(p => p.IsDeleted != true).ToList();
        }

        public async Task<RuleSet> GetRuleSetById(int Id)
        {
            return await _repo.Get(Id);
        }

        public async Task<List<RuleSet>> GetRuleSetByUserId(string UserId)
        {
            // return _repo.AllIncludeNavigation(new string[] {"AspNetUser" }).Where(x => x.AspNetUser.Id == UserId && x.IsDeleted!=true).ToList();
            return _context.RuleSets.Include(p => p.AspNetUser).Where(x => x.AspNetUser.Id == UserId && x.IsDeleted != true).ToList();
        }

        public async Task<List<RuleSet>> GetCoreRuleSets(string UserId)
        {
            return await _context.RuleSets.Where(x => x.IsCoreRuleset == true
                && x.IsAllowSharing == true && x.CreatedBy != UserId
                && x.IsDeleted != true).ToListAsync();
        }

        public List<RuleSet> GetRuleSetsByUserId(string UserId)
        {
            return _context.RuleSets.Include(p => p.AspNetUser).Where(x => x.AspNetUser.Id == UserId && x.IsDeleted != true).ToList();
            //return _repo.AllIncludeNavigation(new string[] { "AspNetUser" }).Where(x => x.AspNetUser.Id == UserId && x.IsDeleted!=true).ToList();
        }

        public async Task<bool> DeleteRuleSet(int id)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {

                using (SqlCommand cmd = new SqlCommand("Ruleset_Delete"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@RulesetID", id);
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
                    return true;
                }
            }

            //// Get associated spells
            //var spells = _context.Spells.Where(x => x.RuleSetId == id && x.IsDeleted != true).ToList();

            //// Remove Spell, Spell command, Character Spell, Itemmaster Spell

            //foreach (Spell spell in spells)
            //{

            //    // Remove associated Commands
            //    var sc = _context.SpellCommands.Where(x => x.SpellId == spell.SpellId && x.IsDeleted != true).ToList();

            //    foreach (SpellCommand item in sc)
            //    {
            //        item.IsDeleted = true;
            //    }

            //    // Remove associated character spell
            //    var cs = _context.CharacterSpells.Where(x => x.SpellId == spell.SpellId && x.IsDeleted != true).ToList();

            //    foreach (CharacterSpell cs_item in cs)
            //    {
            //        cs_item.IsDeleted = true;
            //    }

            //    // Remove associated Items Master spell
            //    var ims = _context.ItemMasterSpells.Where(x => x.SpellId == spell.SpellId && x.IsDeleted != true).ToList();

            //    foreach (ItemMasterSpell ims_item in ims)
            //    {
            //        ims_item.IsDeleted = true;
            //    }

            //    // Remove Spell
            //    spell.IsDeleted = true;
            //}


            //// Get associated Abilities
            //var abilities = _context.Abilities.Where(p => p.RuleSetId == id && p.IsDeleted != true).ToList();


            //// Remove Ability, Ability command, Character Ability, Itemmaster Ability

            //foreach (Ability ability in abilities)
            //{
            //    // Remove associated Commands
            //    var ac = _context.AbilityCommands.Where(x => x.AbilityId == ability.AbilityId && x.IsDeleted != true).ToList();

            //    foreach (AbilityCommand item in ac)
            //    {
            //        item.IsDeleted = true;
            //    }

            //    // Remove associated character ability

            //    var ca = _context.CharacterAbilities.Where(x => x.AbilityId == ability.AbilityId && x.IsDeleted != true).ToList();

            //    foreach (CharacterAbility ca_item in ca)
            //    {
            //        ca_item.IsDeleted = true;
            //    }

            //    // Remove associated Items Master ability
            //    var ima = _context.ItemMasterAbilities.Where(x => x.AbilityId == ability.AbilityId && x.IsDeleted != true).ToList();

            //    foreach (ItemMasterAbility ima_item in ima)
            //    {
            //        ima_item.IsDeleted = true;
            //    }

            //    //Remove Ability

            //    ability.IsDeleted = true;

            //}

            //// Get associated item master

            //var itemmasters = _context.ItemMasters.Where(p => p.RuleSetId == id && p.IsDeleted != true).ToList();

            //// Remove itemmaster, itemmaster ability, itemmaster command, itemmaster spells, itemmaster item, itemmaster player

            //foreach (ItemMaster itemmaster in itemmasters)
            //{
            //    // Remove associated Abilities
            //    var ima = _context.ItemMasterAbilities.Where(x => x.ItemMasterId == itemmaster.ItemMasterId && x.IsDeleted != true).ToList();

            //    foreach (ItemMasterAbility ima_item in ima)
            //    {
            //        ima_item.IsDeleted = true;
            //    }

            //    // Remove associated Spells
            //    var ims = _context.ItemMasterSpells.Where(x => x.ItemMasterId == itemmaster.ItemMasterId && x.IsDeleted != true).ToList();

            //    foreach (ItemMasterSpell ims_item in ims)
            //    {
            //        ims_item.IsDeleted = true;
            //    }

            //    // Remove associated Players
            //    var imp = _context.ItemMasterPlayers.Where(x => x.ItemMasterId == itemmaster.ItemMasterId && x.IsDeleted != true).ToList();

            //    foreach (ItemMasterPlayer imp_item in imp)
            //    {
            //        imp_item.IsDeleted = true;

            //    }

            //    // Remove associated Commands
            //    var imc = _context.ItemMasterCommands.Where(x => x.ItemMasterId == itemmaster.ItemMasterId && x.IsDeleted != true).ToList();

            //    foreach (ItemMasterCommand imc_item in imc)
            //    {
            //        imc_item.IsDeleted = true;
            //    }

            //    // Remove associated Items
            //    var i = _context.Items.Where(x => x.ItemMasterId == itemmaster.ItemMasterId && x.IsDeleted != true).ToList();

            //    foreach (Item item in i)
            //    {
            //        item.IsDeleted = true;
            //    }

            //    //Remove itemmaster 
            //    itemmaster.IsDeleted = true;
            //}


            //// Get associated characterstats

            //var charaterstats = _context.CharacterStats.Where(p => p.RuleSetId == id && p.IsDeleted != true).ToList();

            //// Remove CharacterStat, CharacterStatCalcs, CharacterStatChoices

            //foreach (CharacterStat characterstat in charaterstats)
            //{
            //    // Remove CharacterStatCalcs
            //    var cscalcs = _context.CharacterStatCalcs.Where(p => p.CharacterStatId == characterstat.CharacterStatId && p.IsDeleted != true).ToList();

            //    foreach (CharacterStatCalc cscal_item in cscalcs)
            //    {
            //        cscal_item.IsDeleted = true;
            //    }

            //    //Remove CharacterStatChoices

            //    var cschoice = _context.CharacterStatChoices.Where(p => p.CharacterStatId == characterstat.CharacterStatId && p.IsDeleted != true).ToList();

            //    foreach (CharacterStatChoice cschoice_item in cschoice)
            //    {
            //        cschoice_item.IsDeleted = true;
            //    }

            //    // Remove CharacterStat
            //    characterstat.IsDeleted = true;
            //}


            //// Get associated character

            //var characters = _context.Characters.Where(p => p.RuleSetId == id && p.IsDeleted != true).ToList();

            //// Remove Character, CharacterAbility, CharacterSpells, Character Item
            //foreach (Character c in characters)
            //{
            //    // remove charcter abilities
            //    var ca = _context.CharacterAbilities.Where(x => x.CharacterId == c.CharacterId && x.IsDeleted != true).ToList();

            //    foreach (CharacterAbility ca_item in ca)
            //    {
            //        ca_item.IsDeleted = true;
            //    }

            //    // remove charcter spells
            //    var cs = _context.CharacterSpells.Where(x => x.CharacterId == c.CharacterId && x.IsDeleted != true).ToList();

            //    foreach (CharacterSpell cs_item in cs)
            //    {
            //        cs_item.IsDeleted = true;
            //    }

            //    // remove charcter items
            //    var ci = _context.Items.Where(x => x.CharacterId == c.CharacterId && x.IsDeleted != true).ToList(); ;

            //    foreach (Item item in ci)
            //    {
            //        item.IsDeleted = true;
            //    }
            //    c.IsDeleted = true;
            //}

            //var rulesetLayouts = _context.RulesetDashboardLayouts
            //    .Include(d => d.RulesetDashboardPages)
            //    .Where(x => x.RulesetId == id && x.IsDeleted != true).ToList();

            //if (rulesetLayouts != null)
            //{
            //    foreach (var layout in rulesetLayouts)
            //    {
            //        foreach (var page in layout.RulesetDashboardPages)
            //        {
            //            var rulesetTiles = _context.RulesetTiles.Where(x => x.RulesetDashboardPageId == page.RulesetDashboardPageId && x.IsDeleted != true).ToList();
            //            if (rulesetTiles != null)
            //            {
            //                foreach (var _tile in rulesetTiles)
            //                {
            //                    switch (_tile.TileTypeId)
            //                    {
            //                        case 1:
            //                            var noteTile = _context.RulesetNoteTiles.Where(x => x.RulesetTileId == _tile.RulesetTileId).FirstOrDefault();
            //                            if (noteTile != null) noteTile.IsDeleted = true;
            //                            break;
            //                        case 2:
            //                            var imageTile = _context.RulesetImageTiles.Where(x => x.RulesetTileId == _tile.RulesetTileId).FirstOrDefault();
            //                            if (imageTile != null) imageTile.IsDeleted = true;
            //                            break;
            //                        case 3:
            //                            var counterTile = _context.RulesetCounterTiles.Where(x => x.RulesetTileId == _tile.RulesetTileId).FirstOrDefault();
            //                            if (counterTile != null) counterTile.IsDeleted = true;
            //                            break;
            //                        case 4:
            //                            var charStatTile = _context.RulesetCharacterStatTiles.Where(x => x.RulesetTileId == _tile.RulesetTileId).FirstOrDefault();
            //                            if (charStatTile != null) charStatTile.IsDeleted = true;
            //                            break;
            //                        case 5: break;
            //                        case 6: break;
            //                        case 7:
            //                            var cmdTile = _context.RulesetCommandTiles.Where(x => x.RulesetTileId == _tile.RulesetTileId).FirstOrDefault();
            //                            if (cmdTile != null) cmdTile.IsDeleted = true;
            //                            break;
            //                        default: break;
            //                    }
            //                    var TileConfig = _context.RulesetTileConfig.Where(x => x.RulesetTileId == _tile.RulesetTileId).ToList();
            //                    foreach(var config in TileConfig)
            //                    {
            //                        config.IsDeleted = true;
            //                    }
            //                    _tile.IsDeleted = true;
            //                }
            //            }//end tile
            //            page.IsDeleted = true;
            //        }
            //        layout.IsDeleted = true;
            //    }
            //}

            //var ruleset = await _repo.Get(id);
            //if (ruleset == null) return false;

            //ruleset.IsDeleted = true;
            //ruleset.IsAllowSharing = false;

            //try
            //{
            //    _context.SaveChanges();
            //    return true;
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}

        }

        public async Task<RuleSet> UdateRuleSet(RuleSet RuleSetDomain)
        {
            return await _repo.Update(RuleSetDomain);
        }

        public async Task<bool> AssignRuleSetToUser(UserRuleSet UserRuleSetDomain)
        {
            var isRuleSetAssociatedWithUser = _repoUserRuleSet.Find(u => u.RuleSetId == UserRuleSetDomain.RuleSetId).Any();
            if (isRuleSetAssociatedWithUser == false)
            {
                await _repoUserRuleSet.Add(UserRuleSetDomain);
                return true;
            }
            else
            {
                return false;
            }
        }

        public async Task<bool> IsRuleSetExist(string value, string userId, int? rulseSetId = 0)
        {
            return await _context.RuleSets.Where(x => x.RuleSetName == value
                && x.CreatedBy == userId && x.IsDeleted != true
                && x.RuleSetId != rulseSetId).FirstOrDefaultAsync() == null ? false : true;
            //var items = _repo.GetAll();
            //return items.Result.Where(x => x.RuleSetName == value && x.CreatedBy == userId && x.RuleSetId != rulseSetId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }

        public async Task<int> GetRuleSetsCount()
        {
            return _context.RuleSets.Where(p => p.IsDeleted != true).Count();
        }

        public async Task<int> GetRuleSetsCountByUserId(string userId)
        {
            return _context.RuleSets.Where(p => p.CreatedBy == userId && p.IsDeleted != true).Count();
        }

        public async Task<List<RuleSet>> GetRuleSetByUserId(string UserId, int page, int pageSize)
        {
            //return _repo.AllIncludeNavigation(new string[] { "AspNetUser" }).Where(x => x.AspNetUser.Id == UserId && x.IsDeleted != true).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
            return _context.RuleSets.Include(o => o.AspNetUser).Where(x => x.AspNetUser.Id == UserId && x.IsDeleted != true).Skip(pageSize * (page - 1)).Take(pageSize).ToList();

        }

        public async Task<RuleSet> ImportRuleSetByCode(string code)
        {
            return _context.RuleSets
                .Include(q => q.AspNetUser)
                .Where(p => p.ShareCode.ToString() == code).FirstOrDefault();
        }
        public async Task<RuleSet> duplicateRuleset(RuleSet model, int RuleSetId, string userid)
        {
            RuleSet res = null;


            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //var query = "EXEC DuplicateRuleset @UserID = '" + GetNull(userid) + "',@RulesetIDToDuplicate=" + GetNull(RuleSetId) + ",@RuleSetName='" + GetNull(model.RuleSetName) + "' ,@RuleSetDesc='" + GetNull(model.RuleSetDesc) + "',@DefaultDice='" + GetNull(model.DefaultDice) + "' ,@CurrencyLabel='" + GetNull(model.CurrencyLabel) + "',@WeightLabel='" + GetNull(model.WeightLabel) + "', @DistanceLabel='" + GetNull(model.DistanceLabel) + "', @VolumeLabel='" + GetNull(model.VolumeLabel) + "', @ImageUrl='" + GetNull(model.ImageUrl) + "', @ThumbnailUrl='" + GetNull(model.ThumbnailUrl) + "', @SortOrder=" + GetNull(model.SortOrder) + ", @RuleSetGenreId=" + GetNull(model.RuleSetGenreId) + ", @ParentRuleSetId=" + GetNull(model.ParentRuleSetId) + ", @IsDeleted=" + GetNull(model.IsDeleted) + ", @IsAbilityEnabled=" + GetNull(model.IsAbilityEnabled) + ", @IsItemEnabled=" + GetNull(model.IsItemEnabled) + ", @IsSpellEnabled=" + GetNull(model.IsSpellEnabled) + ", @IsAllowSharing=" + GetNull(model.IsAllowSharing) + ", @IsCoreRuleset =" + GetNull(model.IsCoreRuleset)+ ", @ShareCode="+ GetNull(model.ShareCode) + "";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("DuplicateRuleset", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@UserID", IsNull(userid));
                command.Parameters.AddWithValue("@RulesetIDToDuplicate", IsNull(RuleSetId));
                command.Parameters.AddWithValue("@RuleSetName", IsNull(model.RuleSetName));
                command.Parameters.AddWithValue("@RuleSetDesc", IsNull(model.RuleSetDesc));
                command.Parameters.AddWithValue("@DefaultDice", IsNull(model.DefaultDice));
                command.Parameters.AddWithValue("@CurrencyLabel", IsNull(model.CurrencyLabel));
                command.Parameters.AddWithValue("@WeightLabel", IsNull(model.WeightLabel));
                command.Parameters.AddWithValue("@DistanceLabel", IsNull(model.DistanceLabel));
                command.Parameters.AddWithValue("@VolumeLabel", IsNull(model.VolumeLabel));
                command.Parameters.AddWithValue("@ImageUrl", IsNull(model.ImageUrl));
                command.Parameters.AddWithValue("@ThumbnailUrl", IsNull(model.ThumbnailUrl));
                command.Parameters.AddWithValue("@SortOrder", IsNull(model.SortOrder));
                command.Parameters.AddWithValue("@RuleSetGenreId", IsNull(model.RuleSetGenreId));
                command.Parameters.AddWithValue("@ParentRuleSetId", IsNull(model.ParentRuleSetId));
                command.Parameters.AddWithValue("@IsDeleted", IsNull(model.IsDeleted));
                command.Parameters.AddWithValue("@IsAbilityEnabled", IsNull(model.IsAbilityEnabled));
                command.Parameters.AddWithValue("@IsItemEnabled", IsNull(model.IsItemEnabled));
                command.Parameters.AddWithValue("@IsSpellEnabled", IsNull(model.IsSpellEnabled));
                command.Parameters.AddWithValue("@IsAllowSharing", IsNull(model.IsAllowSharing));
                command.Parameters.AddWithValue("@IsCoreRuleset", IsNull(model.IsCoreRuleset));
                command.Parameters.AddWithValue("@ShareCode", IsNull(model.ShareCode));

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

            if (ds.Tables.Count > 0)
            {
                res = _repo.GetRuleset(ds.Tables[0]);
            }
            return res;

        }
        public async Task<RuleSet> duplicateAddedRuleset(RuleSet model, int ruleSetId, string userId)
        {
            RuleSet res = null;

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("DuplicateAddedRuleset", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@UserID", IsNull(userId));
                command.Parameters.AddWithValue("@RulesetIDToDuplicate", IsNull(ruleSetId));
                command.Parameters.AddWithValue("@RuleSetName", IsNull(model.RuleSetName));
                command.Parameters.AddWithValue("@RuleSetDesc", IsNull(model.RuleSetDesc));
                command.Parameters.AddWithValue("@DefaultDice", IsNull(model.DefaultDice));
                command.Parameters.AddWithValue("@CurrencyLabel", IsNull(model.CurrencyLabel));
                command.Parameters.AddWithValue("@WeightLabel", IsNull(model.WeightLabel));
                command.Parameters.AddWithValue("@DistanceLabel", IsNull(model.DistanceLabel));
                command.Parameters.AddWithValue("@VolumeLabel", IsNull(model.VolumeLabel));
                command.Parameters.AddWithValue("@ImageUrl", IsNull(model.ImageUrl));
                command.Parameters.AddWithValue("@ThumbnailUrl", IsNull(model.ThumbnailUrl));
                command.Parameters.AddWithValue("@SortOrder", IsNull(model.SortOrder));
                command.Parameters.AddWithValue("@RuleSetGenreId", IsNull(model.RuleSetGenreId));
                command.Parameters.AddWithValue("@ParentRuleSetId", IsNull(model.ParentRuleSetId));
                command.Parameters.AddWithValue("@IsDeleted", IsNull(model.IsDeleted));
                command.Parameters.AddWithValue("@IsAbilityEnabled", IsNull(model.IsAbilityEnabled));
                command.Parameters.AddWithValue("@IsItemEnabled", IsNull(model.IsItemEnabled));
                command.Parameters.AddWithValue("@IsSpellEnabled", IsNull(model.IsSpellEnabled));
                command.Parameters.AddWithValue("@IsAllowSharing", IsNull(model.IsAllowSharing));
                command.Parameters.AddWithValue("@IsCoreRuleset", IsNull(model.IsCoreRuleset));
                command.Parameters.AddWithValue("@ShareCode", IsNull(model.ShareCode));

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

            if (ds.Tables.Count > 0)
            {
                res = _repo.GetRuleset(ds.Tables[0]);
            }
            return res;
        }
        public async Task<RuleSet> AddCoreRuleset(RuleSet model, int RuleSetId, string userid)
        {
            RuleSet res = null;

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("AddCoreRuleset", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@UserID", IsNull(userid));
                command.Parameters.AddWithValue("@RulesetIDToDuplicate", IsNull(RuleSetId));
                command.Parameters.AddWithValue("@RuleSetName", IsNull(model.RuleSetName));
                command.Parameters.AddWithValue("@RuleSetDesc", IsNull(model.RuleSetDesc));
                command.Parameters.AddWithValue("@DefaultDice", IsNull(model.DefaultDice));
                command.Parameters.AddWithValue("@CurrencyLabel", IsNull(model.CurrencyLabel));
                command.Parameters.AddWithValue("@WeightLabel", IsNull(model.WeightLabel));
                command.Parameters.AddWithValue("@DistanceLabel", IsNull(model.DistanceLabel));
                command.Parameters.AddWithValue("@VolumeLabel", IsNull(model.VolumeLabel));
                command.Parameters.AddWithValue("@ImageUrl", IsNull(model.ImageUrl));
                command.Parameters.AddWithValue("@ThumbnailUrl", IsNull(model.ThumbnailUrl));
                command.Parameters.AddWithValue("@SortOrder", IsNull(model.SortOrder));
                command.Parameters.AddWithValue("@RuleSetGenreId", IsNull(model.RuleSetGenreId));
                command.Parameters.AddWithValue("@ParentRuleSetId", IsNull(model.ParentRuleSetId));
                command.Parameters.AddWithValue("@IsDeleted", IsNull(model.IsDeleted));
                command.Parameters.AddWithValue("@IsAbilityEnabled", IsNull(model.IsAbilityEnabled));
                command.Parameters.AddWithValue("@IsItemEnabled", IsNull(model.IsItemEnabled));
                command.Parameters.AddWithValue("@IsSpellEnabled", IsNull(model.IsSpellEnabled));

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

            if (ds.Tables.Count > 0)
            {
                res = _repo.GetRuleset(ds.Tables[0]);
            }
            return res;
        }

        private object GetNull(object obj)
        {
            if (obj == null)
                return "NULL";
            else if (obj.GetType() == typeof(bool))
            {
                if ((bool)obj)
                    return "1";
                else
                    return "0";
            }
            else if (obj.GetType() == typeof(Guid))
            {
                return "'" + obj + "'";
            }
            else
                return obj;
        }
        private object IsNull(object obj)
        {
            if (obj == null)
                return DBNull.Value;
            else
                return obj;
        }
        public bool Core_RuleSetWithParentIDExists(int ruleSetId = 0)
        {
            return _context.RuleSets.Where(x => x.RuleSetId == ruleSetId && x.ParentRuleSetId != null && x.IsDeleted != true).Any();
        }
        public Task<RuleSet> Core_RuleSetWithParentIDUserID(int rulesetID, string userID)
        {
            var res = _context.RuleSets.Include(p => p.AspNetUser).Where(x => x.ParentRuleSetId == rulesetID && x.AspNetUser.Id == userID && x.IsDeleted != true).ToList();
            return _context.RuleSets.Include(p => p.AspNetUser).Where(x => x.ParentRuleSetId == rulesetID && x.AspNetUser.Id == userID && x.IsDeleted != true).FirstOrDefaultAsync();
        }
        public SP_RulesetRecordCount GetRulesetRecordCounts(int RulesetID)
        {
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataTable dt = new DataTable();
            try
            {
                connection.Open();
                command = new SqlCommand("Ruleset_GetRecordCounts", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", RulesetID);
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
                res.AbilityCount = Convert.ToInt32(dt.Rows[0]["AbilityCount"]);
                res.SpellCount = Convert.ToInt32(dt.Rows[0]["SpellCount"]);
                res.ItemMasterCount = Convert.ToInt32(dt.Rows[0]["ItemMasterCount"]);
                res.CharacterStatCount = Convert.ToInt32(dt.Rows[0]["CharacterStatCount"]);
                res.LayoutCount = Convert.ToInt32(dt.Rows[0]["LayoutCount"]);
            }
            return res;
        }
        public Task<RuleSet> GetRuleSetBySharecode(Guid rulesetSharecode)
        {
            return _context.RuleSets.Where(q => q.ShareCode == rulesetSharecode).FirstOrDefaultAsync();
        }
        #region CustomDice
        public List<CustomDice> AddCustomDice(List<CustomDice> diceList, int rulesetID)
        {
            foreach (var dice in diceList)
            {
                CustomDice d = new CustomDice() { Icon = dice.Icon, IsNumeric = dice.IsNumeric, Name = dice.Name, RuleSetId = rulesetID };
                _context.CustomDices.Add(d);
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResult r = new CustomDiceResult() { Name = res.Name, CustomDiceId = d.CustomDiceId };
                    _context.CustomDiceResults.Add(r);
                }
            }
            _context.SaveChanges();
            return GetCustomDice(rulesetID);
        }
        public void removeAllDice(int rulesetID)
        {
            var customdices = _context.CustomDices.Where(x => x.RuleSetId == rulesetID).Select(z => z.CustomDiceId).ToList();
            _context.DiceTrays.RemoveRange(_context.DiceTrays.Where(x => customdices.Contains((int)x.CustomDiceId)));
            _context.CustomDiceResults.RemoveRange(_context.CustomDiceResults.Where(x => customdices.Contains(x.CustomDiceId)));
            _context.CustomDices.RemoveRange(_context.CustomDices.Where(x => x.RuleSetId == rulesetID));
            _context.SaveChanges();
        }
        public List<CustomDice> GetCustomDice(int rulesetID)
        {
            return _context.CustomDices.Where(x => x.RuleSetId == rulesetID).OrderBy(a => a.CustomDiceId).Include(x => x.CustomDiceResults).ToList();
        }
        public void CopyCustomDiceToNewRuleSet(int copyFromRulesetID, int copyToRulesetID)
        {
            List<CustomDice> newCustomDices = new List<CustomDice>();

            List<CustomDice> oldCustomDices = GetCustomDice(copyFromRulesetID);
            List<DiceTray> oldDiceTrays = GetDiceTray(copyFromRulesetID);
            foreach (var dice in oldCustomDices)
            {
                CustomDice d = new CustomDice() { Icon = dice.Icon, IsNumeric = dice.IsNumeric, Name = dice.Name, RuleSetId = copyToRulesetID };
                _context.CustomDices.Add(d);
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResult r = new CustomDiceResult() { Name = res.Name, CustomDiceId = d.CustomDiceId };
                    _context.CustomDiceResults.Add(r);
                }
            }            
            _context.SaveChanges();
            addEditDiceTray(GetCustomDice(copyToRulesetID), oldDiceTrays, copyToRulesetID);
        }
        public List<DiceTray> GetDiceTray(int ruleSetId)
        {
            return _context.DiceTrays.Where(r => r.RuleSetId == ruleSetId).OrderBy(x=>x.SortOrder).ToList();
        }
        public List<DefaultDice> GetDefaultDices()
        {
            return _context.DefaultDices.ToList();
        }
        public void removeDiceTray(int rulesetID)
        {
            _context.DiceTrays.RemoveRange(_context.DiceTrays.Where(x => x.RuleSetId == rulesetID));
            _context.SaveChanges();
        }
        public List<DiceTray> addEditDiceTray(List<CustomDice> customDices, List<DiceTray> diceTrays, int rulesetID)
        {
            if (diceTrays.Count > 0)
            {
                removeDiceTray(rulesetID);
                foreach (var model in diceTrays)
                {
                    if (model.IsDefaultDice)
                    {
                        _context.DiceTrays.Add(new DiceTray()
                        {
                            CustomDiceId = null,
                            DefaultDiceId = model.DefaultDiceId,
                            IsCustomDice = false,
                            IsDefaultDice = true,
                            Name = model.Name,
                            RuleSetId = rulesetID,
                            SortOrder=model.SortOrder,
                        });
                    }
                    else if (model.IsCustomDice)
                    {
                        int customdiceID = 0;
                        foreach (var cd in customDices)
                        {
                            if (cd.Name== model.Name)
                            {
                                customdiceID = cd.CustomDiceId;
                            }
                        }

                        _context.DiceTrays.Add(new DiceTray()
                        {
                            CustomDiceId = customdiceID,
                            DefaultDiceId = null,
                            IsCustomDice = true,
                            IsDefaultDice = false,
                            Name = model.Name,
                            RuleSetId = rulesetID,
                            SortOrder = model.SortOrder,
                        });
                    }
                    else {
                        _context.DiceTrays.Add(new DiceTray()
                        {
                            CustomDiceId = null,
                            DefaultDiceId = null,
                            IsCustomDice = false,
                            IsDefaultDice = false,
                            Name = model.Name,
                            RuleSetId = rulesetID,
                            SortOrder = model.SortOrder,
                        });
                    }
                }
                _context.SaveChanges();
            }
            return GetDiceTray(rulesetID);

        }
        #endregion
    }

}