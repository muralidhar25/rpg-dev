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
        private readonly ICampaignService _campaign;
        public RuleSetService(IRepository<RuleSet> repo, IRepository<UserRuleSet> repoUserRuleSet, ApplicationDbContext context, IConfiguration configuration, ICampaignService campaign)
        {
            _repo = repo;
            _repoUserRuleSet = repoUserRuleSet;
            this._context = context;
            _configuration = configuration;
            _campaign = campaign;
        }

        public async Task<RuleSet> Insert(RuleSet RuleSetDomain)
        {
            return await _repo.Add(RuleSetDomain);
        }

        public async Task<List<RuleSet>> GetRuleSets(int page, int pageSize)
        {
            return _context.RuleSets.Where(p => p.IsDeleted != true).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
        }

        public async Task<List<RuleSet>> GetRuleSets()
        {
            return _context.RuleSets.Where(p => p.IsDeleted != true).ToList();
        }

        public async Task<RuleSet> GetRuleSetById(int Id)
        {
            return await _context.RuleSets.Where(x => x.RuleSetId == Id).FirstOrDefaultAsync(); //_repo.Get(Id);
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


        public List<RuleSet> GetRuleSetToCreateCharacterByUserId(string UserId, int page, int pageSize)
        {
            List<RuleSet> UserRulesets = _context.RuleSets.Include(p => p.AspNetUser).Where(x => x.AspNetUser.Id == UserId && x.IsDeleted != true).OrderBy(x=>x.RuleSetName).ToList();

            var CoreRuleSetIdsToRemove = UserRulesets.Where(x => x.ParentRuleSetId != null).Select(x => x.ParentRuleSetId).ToArray();

            List<RuleSet> CoreRulesets = _context.RuleSets.Where(x => x.IsCoreRuleset == true && x.IsAllowSharing == true && x.CreatedBy != UserId && x.IsDeleted != true).OrderBy(x => x.SortOrder).ThenBy(x => x.RuleSetName).ToList();

            CoreRulesets = CoreRulesets.Where(x => !CoreRuleSetIdsToRemove.Contains(x.RuleSetId)).ToList();

            foreach (var ruleset in UserRulesets)
            {
                ruleset.IsCoreRuleset = false;
            }

            List<RuleSet> result = new List<RuleSet>();
            result.AddRange(UserRulesets);
            result.AddRange(CoreRulesets);

            return result.Skip(pageSize * (page - 1)).Take(pageSize).ToList();
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
                command.Parameters.AddWithValue("@IsBuffAndEffectEnabled", IsNull(model.IsBuffAndEffectEnabled));

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
                command.Parameters.AddWithValue("@IsBuffAndEffectEnabled", IsNull(model.IsBuffAndEffectEnabled));
                command.Parameters.AddWithValue("@IsAllowSharing", IsNull(model.IsAllowSharing));
                command.Parameters.AddWithValue("@IsCoreRuleset", IsNull(model.IsCoreRuleset));
                command.Parameters.AddWithValue("@ShareCode", IsNull(model.ShareCode));
                //command.Parameters.AddWithValue("@IsBuffAndEffectEnabled", IsNull(model.IsBuffAndEffectEnabled));
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
                res.LootCount = Convert.ToInt32(dt.Rows[0]["LootCount"]);
                res.BuffAndEffectCount = Convert.ToInt32(dt.Rows[0]["BuffAndEffectCount"]);

            }
            return res;
        }
        public Task<RuleSet> GetRuleSetBySharecode(Guid rulesetSharecode)
        {
            return _context.RuleSets.Where(q => q.ShareCode == rulesetSharecode).FirstOrDefaultAsync();
        }
        public bool IsRulesetAlreadyPurchased(int ruleSetId, string userID) {
            if (userID!=null)
            {
                return _context.PurchasedRuleSets.Where(x => x.RuleSetId == ruleSetId && x.UserId == userID).Any();
            }
            return false;
            
        }
        public async Task updateUserPurchasedRuleset(int ruleSetId, string userID) {
            _context.PurchasedRuleSets.Add(new PurchasedRuleSet()
            {
                RuleSetId = ruleSetId,
                UserId = userID
            });
            await _context.SaveChangesAsync();
        }
        #region CustomDice
        public List<CustomDice> AddCustomDice(List<CustomDice> diceList, int rulesetID)
        {
            foreach (var dice in diceList)
            {
                CustomDice d = new CustomDice() { Icon = dice.Icon, IsNumeric = dice.IsNumeric, Name = dice.Name,CustomDicetype=dice.CustomDicetype, RuleSetId = rulesetID };
                _context.CustomDices.Add(d);               
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResult r = new CustomDiceResult() { Name = res.Name, CustomDiceId = d.CustomDiceId ,DisplayContent=res.DisplayContent};
                    _context.CustomDiceResults.Add(r);                    
                }                
            }
            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
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
                CustomDice d = new CustomDice() { Icon = dice.Icon, IsNumeric = dice.IsNumeric, Name = dice.Name,CustomDicetype=dice.CustomDicetype, RuleSetId = copyToRulesetID };
                _context.CustomDices.Add(d);
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResult r = new CustomDiceResult() { Name = res.Name, CustomDiceId = d.CustomDiceId ,DisplayContent=res.DisplayContent};
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
                        int checkcustomdiceID = 0;
                        int customdiceID = 0;
                        foreach (var cd in customDices)
                        {
                            if (cd.Name == model.Name)
                            {
                                customdiceID = cd.CustomDiceId;
                                checkcustomdiceID = 1;
                            }
                        }
                        if (checkcustomdiceID > 0)
                        {
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
        public string GetUserImageFromRulesetID(int ruleSetId)
        {
            return _context.RuleSets.Where(x=>x.RuleSetId== ruleSetId).Include(x=>x.AspNetUser).Select(x=>x.AspNetUser.ProfileImage).FirstOrDefault();
        }
        #endregion

        #region Basic_Search
        public List<CharacterAbility> SearchCharacterAbilities(SearchModel searchModel, int[] idsToSearch = null)
        {
            DataTable dt_ids = new DataTable();
            if (idsToSearch!=null)
            {
                if (idsToSearch.Length>0)
                {
                    dt_ids = ConvertIntArrayToDataTable(idsToSearch);
                    //dt_ids = utility.ToDataTable<int>(idsToSearch.ToList());
                }
            }
            List<CharacterAbility> _CharacterAbilityList = new List<CharacterAbility>();
            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("SearchRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@SearchText", searchModel.SearchString);
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.CharacterAbilities);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                
                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything",true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName );
                    command.Parameters.AddWithValue("@IsEverythingTag",  searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                }
                else {
                    command.Parameters.AddWithValue("@IsAbilityName", searchModel.AbilityFilters.IsAbilityName);
                    command.Parameters.AddWithValue("@IsAbilityTags", searchModel.AbilityFilters.IsAbilityTags);
                    command.Parameters.AddWithValue("@IsAbilityStats", searchModel.AbilityFilters.IsAbilityStats);
                    command.Parameters.AddWithValue("@IsAbilityDesc", searchModel.AbilityFilters.IsAbilityDesc);
                    command.Parameters.AddWithValue("@IsAbilityLevel", searchModel.AbilityFilters.IsAbilityLevel);
                }

                if (idsToSearch != null)
                {
                    if (idsToSearch.Length > 0 && dt_ids.Rows.Count>0)
                    {
                        command.Parameters.AddWithValue("@OldSearchIds", dt_ids);
                    }
                }

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
                if (ds.Tables[0].Rows.Count > 0)
                {

                    foreach (DataRow row in ds.Tables[0].Rows)
                    {

                        CharacterAbility _characterAbility = new CharacterAbility();
                        _characterAbility.CharacterAbilityId = row["CharacterAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterAbilityId"].ToString());
                        _characterAbility.CharacterId = row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"].ToString());
                        _characterAbility.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"].ToString());
                        //_characterAbility.CurrentNumberOfUses = row["CharacterCurrentNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterCurrentNumberOfUses"].ToString());
                        //_characterAbility.MaxNumberOfUses = row["CharacterMaxNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterMaxNumberOfUses"].ToString());
                        //_characterAbility.IsEnabled = row["CharacterIsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["CharacterIsEnabled"]);

                        Ability _ability = new Ability();
                        _ability.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                        _ability.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
                        _ability.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                        _ability.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                        _ability.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                        _ability.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                        _ability.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
                        _ability.Level = row["Level"] == DBNull.Value ? null : row["Level"].ToString();
                        _ability.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                        //_ability.IsEnabled = row["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsEnabled"]);

                        _ability.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"].ToString());
                        _ability.ParentAbilityId = row["ParentAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentAbilityId"].ToString());
                        _ability.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                        //_ability.CurrentNumberOfUses = row["CurrentNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["CurrentNumberOfUses"].ToString());
                        //_ability.MaxNumberOfUses = row["MaxNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["MaxNumberOfUses"].ToString());


                        _characterAbility.Ability = _ability;
                        //_characterAbility.Character = character;
                        _CharacterAbilityList.Add(_characterAbility);
                    }
                }

            }
            return _CharacterAbilityList;
        }

        private DataTable ConvertIntArrayToDataTable(int[] idsToSearch)
        {
            
            DataTable dt = new DataTable();
            dt.Columns.Add("ID");
            DataRow row;
            for (int i = 0; i < idsToSearch.Length; i++)
            {
                row = dt.NewRow();
                row["ID"] = idsToSearch[i];
                dt.Rows.Add(row);
            }
            return dt;
        }

        public List<Ability> SearchRulesetAbilities(SearchModel searchModel, int[] idsToSearch = null)
        {
            DataTable dt_ids = new DataTable();
            if (idsToSearch != null)
            {
                if (idsToSearch.Length > 0)
                {
                    dt_ids = ConvertIntArrayToDataTable(idsToSearch);
                    //dt_ids = utility.ToDataTable<int>(idsToSearch.ToList());
                }
            }
            List<Ability> _abilityList = new List<Ability>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("SearchRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@SearchText", searchModel.SearchString);
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetAbilities);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);

                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName );
                    command.Parameters.AddWithValue("@IsEverythingTag",  searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsAbilityName", searchModel.AbilityFilters.IsAbilityName);
                    command.Parameters.AddWithValue("@IsAbilityTags", searchModel.AbilityFilters.IsAbilityTags);
                    command.Parameters.AddWithValue("@IsAbilityStats", searchModel.AbilityFilters.IsAbilityStats);
                    command.Parameters.AddWithValue("@IsAbilityDesc", searchModel.AbilityFilters.IsAbilityDesc);
                    command.Parameters.AddWithValue("@IsAbilityLevel", searchModel.AbilityFilters.IsAbilityLevel);
                }
                if (idsToSearch != null)
                {
                    if (idsToSearch.Length > 0 && dt_ids.Rows.Count > 0)
                    {
                        command.Parameters.AddWithValue("@OldSearchIds", dt_ids);
                    }
                }


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
                if (ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        Ability _ability = new Ability();
                        _ability.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                        _ability.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
                        _ability.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                        _ability.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                        _ability.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                        _ability.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                        _ability.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
                        _ability.Level = row["Level"] == DBNull.Value ? null : row["Level"].ToString();
                        _ability.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                        _ability.IsEnabled = row["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsEnabled"]);

                        _ability.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"].ToString());
                        _ability.ParentAbilityId = row["ParentAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentAbilityId"].ToString());
                        _ability.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                        _ability.CurrentNumberOfUses = row["CurrentNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["CurrentNumberOfUses"].ToString());
                        _ability.MaxNumberOfUses = row["MaxNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["MaxNumberOfUses"].ToString());

                        _abilityList.Add(_ability);
                    }
                }
            }
            return _abilityList;
        }
        public List<CharacterSpell> SearchCharacterSpells(SearchModel searchModel, int[] idsToSearch = null)
        {
            DataTable dt_ids = new DataTable();
            if (idsToSearch != null)
            {
                if (idsToSearch.Length > 0)
                {
                    dt_ids = ConvertIntArrayToDataTable(idsToSearch);
                    //dt_ids = utility.ToDataTable<int>(idsToSearch.ToList());
                }
            }
            List<CharacterSpell> _CharacterSpellList = new List<CharacterSpell>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("SearchRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@SearchText", searchModel.SearchString);
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.CharacterSpells);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);

                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName );
                    command.Parameters.AddWithValue("@IsEverythingTag",  searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsSpellName", searchModel.SpellFilters.IsSpellName);
                    command.Parameters.AddWithValue("@IsSpellTags", searchModel.SpellFilters.IsSpellTags);
                    command.Parameters.AddWithValue("@IsSpellStats", searchModel.SpellFilters.IsSpellStats);
                    command.Parameters.AddWithValue("@IsSpellDesc", searchModel.SpellFilters.IsSpellDesc);
                    command.Parameters.AddWithValue("@IsSpellClass", searchModel.SpellFilters.IsSpellClass);
                    command.Parameters.AddWithValue("@IsSpellSchool", searchModel.SpellFilters.IsSpellSchool);
                    command.Parameters.AddWithValue("@IsSpellLevel", searchModel.SpellFilters.IsSpellLevel);
                    command.Parameters.AddWithValue("@IsSpellCastingTime", searchModel.SpellFilters.IsSpellCastingTime);
                    command.Parameters.AddWithValue("@IsSpellEffectDesc", searchModel.SpellFilters.IsSpellEffectDesc);
                    command.Parameters.AddWithValue("@IsSpellHitEffect", searchModel.SpellFilters.IsSpellHitEffect);
                    command.Parameters.AddWithValue("@IsSpellMissEffect", searchModel.SpellFilters.IsSpellMissEffect);
                }

                if (idsToSearch != null)
                {
                    if (idsToSearch.Length > 0 && dt_ids.Rows.Count > 0)
                    {
                        command.Parameters.AddWithValue("@OldSearchIds", dt_ids);
                    }
                }

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
                if (ds.Tables[0].Rows.Count > 0)
                {

                    foreach (DataRow row in ds.Tables[0].Rows)
                    {

                        CharacterSpell _characterSpell = new CharacterSpell();
                        _characterSpell.CharacterSpellId = row["CharacterSpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterSpellId"].ToString());
                        _characterSpell.CharacterId = row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"].ToString());
                        _characterSpell.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"].ToString());
                        _characterSpell.IsMemorized = row["IsMemorized"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMemorized"]);
                        _characterSpell.IsDeleted = false;

                        Spell _spell = new Spell();
                        _spell.CastingTime = row["CastingTime"] == DBNull.Value ? null : row["CastingTime"].ToString();
                        _spell.Class = row["Class"] == DBNull.Value ? null : row["Class"].ToString();
                        _spell.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                        _spell.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                        _spell.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                        _spell.IsMaterialComponent = row["IsMaterialComponent"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMaterialComponent"]);
                        _spell.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                        _spell.IsSomaticComponent = row["IsSomaticComponent"] == DBNull.Value ? false : Convert.ToBoolean(row["IsSomaticComponent"]);
                        _spell.IsVerbalComponent = row["IsVerbalComponent"] == DBNull.Value ? false : Convert.ToBoolean(row["IsVerbalComponent"]);
                        _spell.Memorized = row["Memorized"] == DBNull.Value ? false : Convert.ToBoolean(row["Memorized"]);
                        _spell.ShouldCast = row["ShouldCast"] == DBNull.Value ? false : Convert.ToBoolean(row["ShouldCast"]);

                        _spell.EffectDescription = row["EffectDescription"] == DBNull.Value ? null : row["EffectDescription"].ToString();
                        _spell.HitEffect = row["HitEffect"] == DBNull.Value ? null : row["HitEffect"].ToString();
                        _spell.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                        _spell.Levels = row["Levels"] == DBNull.Value ? null : row["Levels"].ToString();
                        _spell.MaterialComponent = row["MaterialComponent"] == DBNull.Value ? null : row["MaterialComponent"].ToString();
                        _spell.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                        _spell.MissEffect = row["MissEffect"] == DBNull.Value ? null : row["MissEffect"].ToString();
                        _spell.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                        _spell.School = row["School"] == DBNull.Value ? null : row["School"].ToString();
                        _spell.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();

                        _spell.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"].ToString());
                        _spell.ParentSpellId = row["ParentSpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentSpellId"].ToString());
                        _spell.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());

                        _characterSpell.Spell = _spell;
                        _CharacterSpellList.Add(_characterSpell);
                    }
                }
            }

            return _CharacterSpellList;
        }
        public List<Spell> SearchRulesetSpells(SearchModel searchModel, int[] idsToSearch = null)
        {
            DataTable dt_ids = new DataTable();
            if (idsToSearch != null)
            {
                if (idsToSearch.Length > 0)
                {
                    dt_ids = ConvertIntArrayToDataTable(idsToSearch);
                    //dt_ids = utility.ToDataTable<int>(idsToSearch.ToList());
                }
            }
            List<Spell> SpellList = new List<Spell>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("SearchRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@SearchText", searchModel.SearchString);
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetSpells);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);


                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName );
                    command.Parameters.AddWithValue("@IsEverythingTag",  searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsSpellName", searchModel.SpellFilters.IsSpellName);
                    command.Parameters.AddWithValue("@IsSpellTags", searchModel.SpellFilters.IsSpellTags);
                    command.Parameters.AddWithValue("@IsSpellStats", searchModel.SpellFilters.IsSpellStats);
                    command.Parameters.AddWithValue("@IsSpellDesc", searchModel.SpellFilters.IsSpellDesc);
                    command.Parameters.AddWithValue("@IsSpellClass", searchModel.SpellFilters.IsSpellClass);
                    command.Parameters.AddWithValue("@IsSpellSchool", searchModel.SpellFilters.IsSpellSchool);
                    command.Parameters.AddWithValue("@IsSpellLevel", searchModel.SpellFilters.IsSpellLevel);
                    command.Parameters.AddWithValue("@IsSpellCastingTime", searchModel.SpellFilters.IsSpellCastingTime);
                    command.Parameters.AddWithValue("@IsSpellEffectDesc", searchModel.SpellFilters.IsSpellEffectDesc);
                    command.Parameters.AddWithValue("@IsSpellHitEffect", searchModel.SpellFilters.IsSpellHitEffect);
                    command.Parameters.AddWithValue("@IsSpellMissEffect", searchModel.SpellFilters.IsSpellMissEffect);
                }
                if (idsToSearch != null)
                {
                    if (idsToSearch.Length > 0 && dt_ids.Rows.Count > 0)
                    {
                        command.Parameters.AddWithValue("@OldSearchIds", dt_ids);
                    }
                }

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
                if (ds.Tables[0].Rows.Count > 0)
                {

                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        Spell _spell = new Spell();
                        _spell.CastingTime = row["CastingTime"] == DBNull.Value ? null : row["CastingTime"].ToString();
                        _spell.Class = row["Class"] == DBNull.Value ? null : row["Class"].ToString();
                        _spell.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                        _spell.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                        _spell.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                        _spell.IsMaterialComponent = row["IsMaterialComponent"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMaterialComponent"]);
                        _spell.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                        _spell.IsSomaticComponent = row["IsSomaticComponent"] == DBNull.Value ? false : Convert.ToBoolean(row["IsSomaticComponent"]);
                        _spell.IsVerbalComponent = row["IsVerbalComponent"] == DBNull.Value ? false : Convert.ToBoolean(row["IsVerbalComponent"]);
                        _spell.Memorized = row["Memorized"] == DBNull.Value ? false : Convert.ToBoolean(row["Memorized"]);
                        _spell.ShouldCast = row["ShouldCast"] == DBNull.Value ? false : Convert.ToBoolean(row["ShouldCast"]);

                        _spell.EffectDescription = row["EffectDescription"] == DBNull.Value ? null : row["EffectDescription"].ToString();
                        _spell.HitEffect = row["HitEffect"] == DBNull.Value ? null : row["HitEffect"].ToString();
                        _spell.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                        _spell.Levels = row["Levels"] == DBNull.Value ? null : row["Levels"].ToString();
                        _spell.MaterialComponent = row["MaterialComponent"] == DBNull.Value ? null : row["MaterialComponent"].ToString();
                        _spell.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                        _spell.MissEffect = row["MissEffect"] == DBNull.Value ? null : row["MissEffect"].ToString();
                        _spell.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                        _spell.School = row["School"] == DBNull.Value ? null : row["School"].ToString();
                        _spell.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();

                        _spell.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"].ToString());
                        _spell.ParentSpellId = row["ParentSpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentSpellId"].ToString());
                        _spell.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());

                        SpellList.Add(_spell);
                    }
                }
            }
            return SpellList;
        }
        public List<Item> SearchCharacterItems(SearchModel searchModel, int[] idsToSearch = null)
        {
            DataTable dt_ids = new DataTable();
            if (idsToSearch != null)
            {
                if (idsToSearch.Length > 0)
                {
                    dt_ids = ConvertIntArrayToDataTable(idsToSearch);
                    //dt_ids = utility.ToDataTable<int>(idsToSearch.ToList());
                }
            }
            List<Item> _ItemList = new List<Item>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("SearchRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@SearchText", searchModel.SearchString);
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.CharacterItems);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);


                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName );
                    command.Parameters.AddWithValue("@IsEverythingTag",  searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsItemName", searchModel.ItemFilters.IsItemName);
                    command.Parameters.AddWithValue("@IsItemTags", searchModel.ItemFilters.IsItemTags);
                    command.Parameters.AddWithValue("@IsItemStats", searchModel.ItemFilters.IsItemStats);
                    command.Parameters.AddWithValue("@IsItemDesc", searchModel.ItemFilters.IsItemDesc);
                    command.Parameters.AddWithValue("@IsItemRarity", searchModel.ItemFilters.IsItemRarity);
                    command.Parameters.AddWithValue("@IsItemAbilityAssociated", searchModel.ItemFilters.IsItemAbilityAssociated);
                    command.Parameters.AddWithValue("@IsItemSpellAssociated", searchModel.ItemFilters.IsItemSpellAssociated);
                }
                if (idsToSearch != null)
                {
                    if (idsToSearch.Length > 0 && dt_ids.Rows.Count > 0)
                    {
                        command.Parameters.AddWithValue("@OldSearchIds", dt_ids);
                    }
                }

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
                if (ds.Tables[0].Rows.Count > 0)
                {

                    foreach (DataRow row in ds.Tables[0].Rows)
                    {

                        Item i = new Item();
                        i.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"].ToString());
                        i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                        i.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                        i.ItemImage = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                        i.CharacterId = row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"].ToString());
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
            }

            return _ItemList;
        }
        public List<ItemMaster_Bundle> SearchRulesetItems(SearchModel searchModel, int[] idsToSearch = null)
        {
            DataTable dt_ids = new DataTable();
            if (idsToSearch != null)
            {
                if (idsToSearch.Length > 0)
                {
                    dt_ids = ConvertIntArrayToDataTable(idsToSearch);
                    //dt_ids = utility.ToDataTable<int>(idsToSearch.ToList());
                }
            }
            List<ItemMaster_Bundle> itemlist = new List<ItemMaster_Bundle>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("SearchRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@SearchText", searchModel.SearchString);
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetItems);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);


                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName );
                    command.Parameters.AddWithValue("@IsEverythingTag",  searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsItemName", searchModel.ItemFilters.IsItemName);
                    command.Parameters.AddWithValue("@IsItemTags", searchModel.ItemFilters.IsItemTags);
                    command.Parameters.AddWithValue("@IsItemStats", searchModel.ItemFilters.IsItemStats);
                    command.Parameters.AddWithValue("@IsItemDesc", searchModel.ItemFilters.IsItemDesc);
                    command.Parameters.AddWithValue("@IsItemRarity", searchModel.ItemFilters.IsItemRarity);
                    command.Parameters.AddWithValue("@IsItemAbilityAssociated", searchModel.ItemFilters.IsItemAbilityAssociated);
                    command.Parameters.AddWithValue("@IsItemSpellAssociated", searchModel.ItemFilters.IsItemSpellAssociated);
                }

                if (idsToSearch != null)
                {
                    if (idsToSearch.Length > 0 && dt_ids.Rows.Count > 0)
                    {
                        command.Parameters.AddWithValue("@OldSearchIds", dt_ids);
                    }
                }
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
                        i.IsBundle = row["IsBundle"] == DBNull.Value ? false : Convert.ToBoolean(row["IsBundle"]);

                        i.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                        itemlist.Add(i);
                    }
                }
            }

            return itemlist;
        }

        public void SaveLastSearchFilters(SearchModel searchModel)
        {
            SearchFilter filter = null;
            if (
                searchModel.SearchType == SP_SearchType.CharacterAbilities
                ||
                searchModel.SearchType == SP_SearchType.CharacterSpells
                ||
                searchModel.SearchType == SP_SearchType.CharacterItems
                )
            {
                if (searchModel.CharacterID!=0)
                {
                    bool isItem = (searchModel.SearchType == SP_SearchType.CharacterItems);
                    bool isSpell = (searchModel.SearchType == SP_SearchType.CharacterSpells);
                    bool isAbility = (searchModel.SearchType == SP_SearchType.CharacterAbilities);
                    if (_context.SearchFilter.Any(x => x.CharacterId == searchModel.CharacterID && x.IsCharacter==true && x.IsRuleSet == false &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility))
                    {
                       
                        filter = _context.SearchFilter.Where(x => x.CharacterId == searchModel.CharacterID && x.IsCharacter == true && x.IsRuleSet == false && 
                        x.IsItem== isItem && x.IsSpell== isSpell && x.IsAbility==isAbility
                        ).FirstOrDefault();
                        if (filter != null)
                        {
                            filter = setFilterValues(filter, searchModel);
                            _context.SearchFilter.Update(filter);
                            _context.SaveChanges();
                        }
                    }
                    else {
                        filter = setFilterValues(filter, searchModel);
                        _context.SearchFilter.Add(filter);
                        _context.SaveChanges();
                    }
                }
            }
            else if (searchModel.SearchType == SP_SearchType.Everything)
            {
                if (searchModel.CharacterID != 0 && searchModel.RulesetID != 0)
                {
                    if (_context.SearchFilter.Any(x => x.CharacterId == searchModel.CharacterID && x.RulesetId == searchModel.RulesetID 
                    && x.IsCharacter == true && x.IsRuleSet == true))
                    {

                        filter = _context.SearchFilter.Where(x => x.CharacterId == searchModel.CharacterID && x.RulesetId == searchModel.RulesetID
                    && x.IsCharacter == true && x.IsRuleSet == true).FirstOrDefault();
                        if (filter != null)
                        {
                            filter = setFilterValues(filter, searchModel);
                            _context.SearchFilter.Update(filter);
                            _context.SaveChanges();
                        }
                    }
                    else
                    {
                        filter = setFilterValues(filter, searchModel);
                        _context.SearchFilter.Add(filter);
                        _context.SaveChanges();
                    }
                }
            }
            else {
                if (searchModel.RulesetID != 0)
                {
                    bool isItem = (searchModel.SearchType == SP_SearchType.RulesetItems);
                    bool isSpell = (searchModel.SearchType == SP_SearchType.RulesetSpells);
                    bool isAbility = (searchModel.SearchType == SP_SearchType.RulesetAbilities);
                    if (_context.SearchFilter.Any(x => x.RulesetId == searchModel.RulesetID && x.IsRuleSet == true && x.IsCharacter == false &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility))
                    {
                        filter = _context.SearchFilter.Where(x => x.RulesetId == searchModel.RulesetID && x.IsRuleSet == true && x.IsCharacter == false &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility).FirstOrDefault();
                        if (filter != null)
                        {
                            filter = setFilterValues(filter, searchModel);
                            _context.SearchFilter.Update(filter);
                            _context.SaveChanges();
                        }
                    }
                    else
                    {
                        filter = setFilterValues(filter, searchModel);
                        _context.SearchFilter.Add(filter);
                        _context.SaveChanges();
                    }
                }
            }
        }

        private SearchFilter setFilterValues(SearchFilter filter, SearchModel searchModel)
        {
            if (filter==null)
            {
                filter = new SearchFilter();
            }
            if (
                searchModel.SearchType == SP_SearchType.CharacterAbilities
                ||
                searchModel.SearchType == SP_SearchType.CharacterSpells
                ||
                searchModel.SearchType == SP_SearchType.CharacterItems
                )
            {
                filter.IsCharacter = true;
                filter.CharacterId = searchModel.CharacterID;

                filter.IsRuleSet = false;
                filter.RulesetId = null;

                filter.IsItem = searchModel.SearchType == SP_SearchType.CharacterItems ? true : false;
                filter.IsSpell = searchModel.SearchType == SP_SearchType.CharacterSpells ? true : false;
                filter.IsAbility = searchModel.SearchType == SP_SearchType.CharacterAbilities ? true : false;

                switch (searchModel.SearchType)
                {
                    case SP_SearchType.CharacterItems:
                        filter.IsName = searchModel.ItemFilters.IsItemName;
                        filter.IsTags = searchModel.ItemFilters.IsItemTags;
                        filter.IsStats = searchModel.ItemFilters.IsItemStats;
                        filter.IsDesc = searchModel.ItemFilters.IsItemDesc;
                        filter.IsRarity = searchModel.ItemFilters.IsItemRarity;
                        filter.IsAssociatedSpell = searchModel.ItemFilters.IsItemSpellAssociated;
                        filter.IsAssociatedAbility = searchModel.ItemFilters.IsItemAbilityAssociated;
                        break;
                    case SP_SearchType.CharacterSpells:
                        filter.IsName = searchModel.SpellFilters.IsSpellName;
                        filter.IsClass = searchModel.SpellFilters.IsSpellClass;
                        filter.IsSchool = searchModel.SpellFilters.IsSpellSchool;
                        filter.IsLevel = searchModel.SpellFilters.IsSpellLevel;
                        filter.IsTags = searchModel.SpellFilters.IsSpellTags;
                        filter.IsStats = searchModel.SpellFilters.IsSpellStats;
                        filter.IsDesc = searchModel.SpellFilters.IsSpellDesc;
                        filter.IsCastingTime = searchModel.SpellFilters.IsSpellCastingTime;
                        filter.IsEffectDesc = searchModel.SpellFilters.IsSpellEffectDesc;
                        filter.IsHitEffect = searchModel.SpellFilters.IsSpellHitEffect;
                        filter.IsMissEffect = searchModel.SpellFilters.IsSpellMissEffect;
                        break;
                    case SP_SearchType.CharacterAbilities:
                        filter.IsName = searchModel.AbilityFilters.IsAbilityName;
                        filter.IsTags = searchModel.AbilityFilters.IsAbilityTags;
                        filter.IsLevel = searchModel.AbilityFilters.IsAbilityLevel;
                        filter.IsStats = searchModel.AbilityFilters.IsAbilityStats;
                        filter.IsDesc = searchModel.AbilityFilters.IsAbilityDesc;
                        break;
                    default:
                        break;
                }
            }
           else   if (searchModel.SearchType == SP_SearchType.Everything)
            {
                filter.IsCharacter = true;
                filter.CharacterId = searchModel.CharacterID;

                filter.IsRuleSet = true;
                filter.RulesetId = searchModel.RulesetID;

                switch (searchModel.SearchType)
                {
                    case SP_SearchType.Everything:
                        filter.IsName = searchModel.EverythingFilters.IsEverythingName;
                        filter.IsTags = searchModel.EverythingFilters.IsEverythingTags;
                        filter.IsStats = searchModel.EverythingFilters.IsEverythingStats;
                        filter.IsDesc = searchModel.EverythingFilters.IsEverythingDesc;                        
                        break;                    
                    default:
                        break;
                }
            }
            else {
                filter.IsRuleSet = true;
                filter.RulesetId = searchModel.RulesetID;

                filter.IsCharacter = false;
                filter.CharacterId = null;

                filter.IsItem = searchModel.SearchType == SP_SearchType.RulesetItems ? true : false;
                filter.IsSpell = searchModel.SearchType == SP_SearchType.RulesetSpells ? true : false;
                filter.IsAbility = searchModel.SearchType == SP_SearchType.RulesetAbilities ? true : false;

                switch (searchModel.SearchType)
                {
                    case SP_SearchType.RulesetItems:
                        filter.IsName = searchModel.ItemFilters.IsItemName;
                        filter.IsTags = searchModel.ItemFilters.IsItemTags;
                        filter.IsStats = searchModel.ItemFilters.IsItemStats;
                        filter.IsDesc = searchModel.ItemFilters.IsItemDesc;
                        filter.IsRarity = searchModel.ItemFilters.IsItemRarity;
                        filter.IsAssociatedSpell = searchModel.ItemFilters.IsItemSpellAssociated;
                        filter.IsAssociatedAbility = searchModel.ItemFilters.IsItemAbilityAssociated;
                        break;
                    case SP_SearchType.RulesetSpells:
                        filter.IsName = searchModel.SpellFilters.IsSpellName;
                        filter.IsClass = searchModel.SpellFilters.IsSpellClass;
                        filter.IsSchool = searchModel.SpellFilters.IsSpellSchool;
                        filter.IsLevel = searchModel.SpellFilters.IsSpellLevel;
                        filter.IsTags = searchModel.SpellFilters.IsSpellTags;
                        filter.IsStats = searchModel.SpellFilters.IsSpellStats;
                        filter.IsDesc = searchModel.SpellFilters.IsSpellDesc;
                        filter.IsCastingTime = searchModel.SpellFilters.IsSpellCastingTime;
                        filter.IsEffectDesc = searchModel.SpellFilters.IsSpellEffectDesc;
                        filter.IsHitEffect = searchModel.SpellFilters.IsSpellHitEffect;
                        filter.IsMissEffect = searchModel.SpellFilters.IsSpellMissEffect;
                        break;
                    case SP_SearchType.RulesetAbilities:
                        filter.IsName = searchModel.AbilityFilters.IsAbilityName;
                        filter.IsTags = searchModel.AbilityFilters.IsAbilityTags;
                        filter.IsLevel = searchModel.AbilityFilters.IsAbilityLevel;
                        filter.IsStats = searchModel.AbilityFilters.IsAbilityStats;
                        filter.IsDesc = searchModel.AbilityFilters.IsAbilityDesc;
                        break;
                    default:
                        break;
                }
            }
            return filter;
        }

        public List<SearchEverything> bindEveryThingModel(List<CharacterAbility> characterAbilities, List<Ability> abilities,
            List<CharacterSpell> characterSpells, List<Spell> spells, List<Item> items, List<ItemMaster_Bundle> itemMasters)
        {
            List<SearchEverything> results = new List<SearchEverything>();
            foreach (var item in characterAbilities)
            {
                SearchEverything obj = new SearchEverything() {
                    id = item.CharacterAbilityId,
                    image = item.Ability.ImageUrl,
                    name = item.Ability.Name,
                    RecordType = SP_SearchType.CharacterAbilities,
                    CharacterAbility = item
                };
                results.Add(obj);
            }
            foreach (var item in abilities)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.AbilityId,
                    image = item.ImageUrl,
                    name = item.Name,
                    RecordType = SP_SearchType.RulesetAbilities,
                    RulesetAbility = item
                };
                if (!characterAbilities.Any(x=>x.AbilityId== item.AbilityId &&  x.Ability.Name== item.Name))
                {
                    results.Add(obj);
                }
                
            }
            foreach (var item in characterSpells)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.CharacterSpellId,
                    image = item.Spell.ImageUrl,
                    name = item.Spell.Name,
                    RecordType = SP_SearchType.CharacterSpells,
                    CharacterSpell = item
                }; results.Add(obj);
            }
            foreach (var item in spells)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.SpellId,
                    image = item.ImageUrl,
                    name = item.Name,
                    RecordType = SP_SearchType.RulesetSpells,
                    RulesetSpell = item
                };
                if (!characterSpells.Any(x => x.SpellId == item.SpellId && x.Spell.Name == item.Name))
                {
                    results.Add(obj);
                }
            }
            foreach (var item in items)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.ItemId,
                    image = item.ItemImage,
                    name = item.Name,
                    RecordType = SP_SearchType.CharacterItems,
                    CharacterItem = item
                }; results.Add(obj);
            }
            foreach (var item in itemMasters)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.ItemMasterId,
                    image = item.ItemImage,
                    name = item.ItemName,
                    RecordType = SP_SearchType.RulesetItems,
                    RulesetItem = item
                };
                if (!items.Any(x => x.ItemMasterId == item.ItemMasterId && x.Name == item.ItemName))
                {
                    results.Add(obj);
                }
            }


            return results.OrderBy(x=>x.name).ToList();
        }
        public List<SearchEverything> SearchEveryThing(SearchModel searchModel)
        {
            List<CharacterAbility> characterAbilities= SearchCharacterAbilities(searchModel);
            List<Ability> abilities= SearchRulesetAbilities(searchModel);
            List<CharacterSpell> characterSpells= SearchCharacterSpells(searchModel);
            List<Spell> spells= SearchRulesetSpells(searchModel);
            List<Item> items= SearchCharacterItems(searchModel);
            List<ItemMaster_Bundle> itemMasters= SearchRulesetItems(searchModel);
            List<SearchEverything> results = bindEveryThingModel(characterAbilities, abilities, characterSpells, spells, items, itemMasters);
            return results;
        }
        #endregion
        #region DiceRoll
        public async Task<DiceRollModel> GetDiceRollModelAsync(int RulesetID, int CharacterID, ApplicationUser User)
        {
           
            DiceRollModel DiceRollModel = new DiceRollModel();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Character_GetTilesByPageID @CharacterID = '" + characterId + "' ,@PageID='" + pageId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("GetDiceRollData", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", RulesetID);
                command.Parameters.AddWithValue("@CharacterID", CharacterID);
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
            if (ds.Tables[8].Rows.Count > 0) //Check Ruleset Exists
            {
                DiceRollModel.RuleSet = _repo.GetRuleset(ds.Tables[8]);
                DiceRollModel.RuleSet.IsDicePublicRoll= ds.Tables[8].Rows[0]["IsDicePublicRoll"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[8].Rows[0]["IsDicePublicRoll"]);

                DiceRollModel.CustomDices = new List<CustomDice>();
                if (ds.Tables[9].Rows.Count > 0) //Custom Dices
                {
                    List<CustomDice> customDices = new List<CustomDice>();
                    foreach (DataRow _diceRow in ds.Tables[9].Rows)
                    {
                        CustomDice dice = new CustomDice()
                        {
                            CustomDiceId = _diceRow["CustomDiceId"] == DBNull.Value ? 0 : Convert.ToInt32(_diceRow["CustomDiceId"]),
                            CustomDicetype = GetCustomDicetype(_diceRow["CustomDicetype"] == DBNull.Value ? 0 : Convert.ToInt32(_diceRow["CustomDicetype"])),
                            Icon = _diceRow["Icon"] == DBNull.Value ? null : _diceRow["Icon"].ToString(),
                            IsNumeric = _diceRow["IsNumeric"] == DBNull.Value ? false : Convert.ToBoolean(_diceRow["IsNumeric"]),
                            Name = _diceRow["Name"] == DBNull.Value ? null : _diceRow["Name"].ToString(),
                            RuleSetId = _diceRow["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(_diceRow["RuleSetId"]),
                        };
                        List<CustomDiceResult> customDiceResults = new List<CustomDiceResult>();
                        foreach (DataRow _diceResultRow in ds.Tables[10].Rows)
                        {
                            int _diceResultRow_CustomDiceId = _diceResultRow["CustomDiceId"] == DBNull.Value ? 0 : Convert.ToInt32(_diceResultRow["CustomDiceId"]);
                            if (dice.CustomDiceId == _diceResultRow_CustomDiceId)
                            {
                                CustomDiceResult result = new CustomDiceResult()
                                {
                                    CustomDiceId = _diceResultRow_CustomDiceId,
                                    CustomDiceResultId = _diceResultRow["CustomDiceResultId"] == DBNull.Value ? 0 : Convert.ToInt32(_diceResultRow["CustomDiceResultId"]),
                                    DisplayContent = _diceResultRow["DisplayContent"] == DBNull.Value ? null : _diceResultRow["DisplayContent"].ToString(),
                                    Name = _diceResultRow["Name"] == DBNull.Value ? null : _diceResultRow["Name"].ToString(),
                                };
                                customDiceResults.Add(result);
                            }
                        }
                        dice.CustomDiceResults = customDiceResults;
                        customDices.Add(dice);
                    }
                    if (customDices.Any())
                    {
                        DiceRollModel.CustomDices = customDices;
                    }
                }

                DiceRollModel.DiceTrays = new List<DiceTray>();
                if (ds.Tables[11].Rows.Count > 0) //Dice Tray
                {
                    List<DiceTray> _diceTrays = new List<DiceTray>();
                    foreach (DataRow _diceTrayRow in ds.Tables[11].Rows)
                    {
                        DiceTray tray = new DiceTray()
                        {
                            DefaultDiceId = _diceTrayRow["DefaultDiceId"] == DBNull.Value ? 0 : Convert.ToInt32(_diceTrayRow["DefaultDiceId"]),
                            CustomDiceId = _diceTrayRow["CustomDiceId"] == DBNull.Value ? 0 : Convert.ToInt32(_diceTrayRow["CustomDiceId"]),
                            DiceTrayId = _diceTrayRow["DiceTrayId"] == DBNull.Value ? 0 : Convert.ToInt32(_diceTrayRow["DiceTrayId"]),
                            IsCustomDice = _diceTrayRow["IsCustomDice"] == DBNull.Value ? false : Convert.ToBoolean(_diceTrayRow["IsCustomDice"]),
                            IsDefaultDice = _diceTrayRow["IsDefaultDice"] == DBNull.Value ? false : Convert.ToBoolean(_diceTrayRow["IsDefaultDice"]),
                            Name = _diceTrayRow["Name"] == DBNull.Value ? null : _diceTrayRow["Name"].ToString(),
                            RuleSetId = _diceTrayRow["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(_diceTrayRow["RuleSetId"]),
                            SortOrder = _diceTrayRow["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(_diceTrayRow["SortOrder"]),
                        };
                        _diceTrays.Add(tray);
                    }
                    if (_diceTrays.Any())
                    {
                        DiceRollModel.DiceTrays = _diceTrays;
                    }
                }

                DiceRollModel.DefaultDices = new List<DefaultDice>();
                if (ds.Tables[12].Rows.Count > 0) //Dice Tray
                {
                    List<DefaultDice> _defaultDices = new List<DefaultDice>();
                    foreach (DataRow _defaultDicesRow in ds.Tables[12].Rows)
                    {
                        DefaultDice defaultDice = new DefaultDice()
                        {
                            DefaultDiceId = _defaultDicesRow["DefaultDiceId"] == DBNull.Value ? 0 : Convert.ToInt32(_defaultDicesRow["DefaultDiceId"]),
                            Icon = _defaultDicesRow["Icon"] == DBNull.Value ? null : _defaultDicesRow["Icon"].ToString(),
                            Name = _defaultDicesRow["Name"] == DBNull.Value ? null : _defaultDicesRow["Name"].ToString(),
                        };
                        _defaultDices.Add(defaultDice);
                    }
                    if (_defaultDices.Any())
                    {
                        DiceRollModel.DefaultDices = _defaultDices;
                    }
                }

                if (ds.Tables[0].Rows.Count > 0) //Check Character Exists
                {
                    DiceRollModel.Character= _repo.GetCharacter(ds.Tables[0]);
                    DiceRollModel.Character.IsDicePublicRoll = ds.Tables[0].Rows[0]["IsDicePublicRoll"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[0].Rows[0]["IsDicePublicRoll"]);

                    DiceRollModel.CharacterCommands = new List<CharacterCommand>();
                    if (ds.Tables[7].Rows.Count > 0) //Dice Tray
                    {
                        List<CharacterCommand> _characterCommands = new List<CharacterCommand>();
                        foreach (DataRow _characterCommandRow in ds.Tables[7].Rows)
                        {
                            CharacterCommand characterCommand = new CharacterCommand()
                            {
                                CharacterCommandId= _characterCommandRow["CharacterCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(_characterCommandRow["CharacterCommandId"]),
                                CharacterId= _characterCommandRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(_characterCommandRow["CharacterId"]),
                                Command= _characterCommandRow["Command"] == DBNull.Value ? null : _characterCommandRow["Command"].ToString(),
                                CreatedOn= _characterCommandRow["CreatedOn"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(_characterCommandRow["CreatedOn"]),
                                IsDeleted= _characterCommandRow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(_characterCommandRow["IsDeleted"]),
                                UpdatedOn= _characterCommandRow["UpdatedOn"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(_characterCommandRow["UpdatedOn"]),
                                Name= _characterCommandRow["Name"] == DBNull.Value ? null : _characterCommandRow["Name"].ToString()
                            };
                            _characterCommands.Add(characterCommand);
                        }
                        if (_characterCommands.Any())
                        {
                            DiceRollModel.CharacterCommands = _characterCommands;
                        }
                    }

                    DiceRollModel.CharactersCharacterStats = new List<CharactersCharacterStat>();
                    if (ds.Tables[1].Rows.Count > 0)
                    {
                        utility.FillCharacterCharacterStats(DiceRollModel.CharactersCharacterStats, ds);
                    }

                }


            }


            if (_campaign.IsDeletedInvite(CharacterID, User.Id))
            {
                DiceRollModel.IsGmAccessingPlayerCharacter = false;
            }
            else {
                DiceRollModel.IsGmAccessingPlayerCharacter = await _campaign.isGmAccessingPlayerCharacterUrl(CharacterID, User);
            }            

            return DiceRollModel;
        }

        private CustomDicetypeEnum GetCustomDicetype(int CustomDicetypeID)
        {
            switch (CustomDicetypeID)
            {
                case 1:
                    return CustomDicetypeEnum.Numeric;
                    
                case 2:
                    return CustomDicetypeEnum.Text;
                    
                default:
                    return CustomDicetypeEnum.Image;
                    
            }
        }
        #endregion
    }

}