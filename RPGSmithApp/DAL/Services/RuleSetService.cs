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
using Dapper;

namespace DAL.Services
{
    public class RuleSetService : IRuleSetService
    {
        private readonly IRepository<RuleSet> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IRepository<UserRuleSet> _repoUserRuleSet;
        private readonly IConfiguration _configuration;
        private readonly ICampaignService _campaign;
        private readonly ICharacterCurrencyService _characterCurrencyService;


        public RuleSetService(IRepository<RuleSet> repo, IRepository<UserRuleSet> repoUserRuleSet, ApplicationDbContext context, IConfiguration configuration, ICampaignService campaign,
            ICharacterCurrencyService characterCurrencyService)
        {
            _repo = repo;
            _repoUserRuleSet = repoUserRuleSet;
            this._context = context;
            _configuration = configuration;
            _campaign = campaign;
            this._characterCurrencyService = characterCurrencyService;
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
            List<RuleSet> UserRulesets = _context.RuleSets.Include(p => p.AspNetUser).Where(x => x.AspNetUser.Id == UserId && x.IsDeleted != true).OrderBy(x => x.RuleSetName).ToList();

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
        public SP_RulesetRecordCount GetRulesetRecordCounts_old(int RulesetID)
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
                res.MonsterCount = Convert.ToInt32(dt.Rows[0]["MonsterCount"]);
                res.MonsterTemplateCount = Convert.ToInt32(dt.Rows[0]["MonsterTemplateCount"]);
                res.LootTemplateCount = Convert.ToInt32(dt.Rows[0]["LootTemplateCount"]);
            }
            return res;
        }

        public SP_RulesetRecordCount GetRulesetRecordCounts(int RulesetID)
        
        {
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SP_RulesetRecordCount res = new SP_RulesetRecordCount();
            string qry = "EXEC Ruleset_GetRecordCounts @RulesetID = '" + RulesetID + "'";
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    var data = connection.Query<SP_RulesetRecordCount>(qry).FirstOrDefault();
                    if (data.AbilityCount != 0)
                    {
                        res.AbilityCount = data.AbilityCount;
                    }
                    if (data.SpellCount != 0)
                    {
                        res.SpellCount = data.SpellCount;
                    }
                    if (data.ItemMasterCount != 0)
                    {
                        res.ItemMasterCount = data.ItemMasterCount;
                    }
                    if (data.CharacterStatCount != 0)
                    {
                        res.CharacterStatCount = data.CharacterStatCount;
                    }
                    if (data.LootCount != 0)
                    {
                        res.LootCount = data.LootCount;
                    }
                    if (data.BuffAndEffectCount != 0)
                    {
                        res.BuffAndEffectCount = data.BuffAndEffectCount;
                    }
                    if (data.MonsterTemplateCount != 0)
                    {
                        res.MonsterTemplateCount = data.MonsterTemplateCount;
                    }
                    if (data.MonsterCount != 0)
                    {
                        res.MonsterCount = data.MonsterCount;
                    }
                    if (data.LayoutCount != 0)
                    {
                        res.LayoutCount = data.LayoutCount;
                    }
                    if (data.LootTemplateCount != 0)
                    {
                        res.LootTemplateCount = data.LootTemplateCount;
                    }
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

            //SP_RulesetRecordCount res2 = new SP_RulesetRecordCount();
            //res2 = GetRulesetRecordCounts_old(RulesetID);
            return res;
        }
        public Task<RuleSet> GetRuleSetBySharecode(Guid rulesetSharecode)
        {
            return _context.RuleSets.Where(q => q.ShareCode == rulesetSharecode).FirstOrDefaultAsync();
        }
        public bool IsRulesetAlreadyPurchased(int ruleSetId, string userID)
        {
            if (userID != null)
            {
                return _context.PurchasedRuleSets.Where(x => x.RuleSetId == ruleSetId && x.UserId == userID).Any();
            }
            return false;

        }
        public async Task updateUserPurchasedRuleset(int ruleSetId, string userID)
        {
            _context.PurchasedRuleSets.Add(new PurchasedRuleSet()
            {
                RuleSetId = ruleSetId,
                UserId = userID
            });
            await _context.SaveChangesAsync();
        }
        public bool IsCombatStarted(int RuleSetId) {
            return _context.Combats.Where(x => x.CampaignId == RuleSetId && x.IsDeleted != true && x.IsStarted == true).Any();
        }
        #region CustomDice
        public List<CustomDice> AddCustomDice(List<CustomDice> diceList, int rulesetID)
        {
            foreach (var dice in diceList)
            {
                CustomDice d = new CustomDice() { Icon = dice.Icon, IsNumeric = dice.IsNumeric, Name = dice.Name, CustomDicetype = dice.CustomDicetype, RuleSetId = rulesetID };
                _context.CustomDices.Add(d);
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResult r = new CustomDiceResult() { Name = res.Name, CustomDiceId = d.CustomDiceId, DisplayContent = res.DisplayContent };
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
        public void RemoveCurrency(int rulesetID)
        {
                string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
                SqlConnection connection = new SqlConnection(connectionString);
                SqlCommand command = new SqlCommand();
                try
                {
                    connection.Open();
                    command = new SqlCommand("CurrencyTypeList_SP", connection);
                    command.Parameters.AddWithValue("@RulesetID", rulesetID);
                    command.CommandType = CommandType.StoredProcedure;
                    command.ExecuteNonQuery();
                    command.Dispose();
                    connection.Close();
                }
                catch (Exception ex)
                {
                    command.Dispose();
                    connection.Close();
                }
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
                CustomDice d = new CustomDice() { Icon = dice.Icon, IsNumeric = dice.IsNumeric, Name = dice.Name, CustomDicetype = dice.CustomDicetype, RuleSetId = copyToRulesetID };
                _context.CustomDices.Add(d);
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResult r = new CustomDiceResult() { Name = res.Name, CustomDiceId = d.CustomDiceId, DisplayContent = res.DisplayContent };
                    _context.CustomDiceResults.Add(r);
                }
            }
            _context.SaveChanges();
            addEditDiceTray(GetCustomDice(copyToRulesetID), oldDiceTrays, copyToRulesetID);
        }
        public List<DiceTray> GetDiceTray(int ruleSetId)
        {
            return _context.DiceTrays.Where(r => r.RuleSetId == ruleSetId).OrderBy(x => x.SortOrder).ToList();
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
                            SortOrder = model.SortOrder,
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
                    else
                    {
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
            return _context.RuleSets.Where(x => x.RuleSetId == ruleSetId).Include(x => x.AspNetUser).Select(x => x.AspNetUser.ProfileImage).FirstOrDefault();
        }

        //CurrencyType #889
        public async Task<List<CurrencyType>> addCurrencyTypes(List<CurrencyType> currencyTypes, int rulesetId)
        {
            if (currencyTypes.Count > 0)
            {
                await removeCurrencyTypes(rulesetId);
                foreach (var model in currencyTypes)
                {
                    _context.CurrencyTypes.Add(new CurrencyType()
                    {
                        Name = model.Name,
                        BaseUnit = model.BaseUnit,
                        WeightValue = model.WeightValue,
                        WeightLabel = model.WeightLabel,
                        SortOrder = model.SortOrder,
                        IsDeleted = false,
                        CreatedBy = this._context.CurrentUserId,
                        CreatedDate = DateTime.Now,
                        RuleSetId = rulesetId
                    });
                }
                _context.SaveChanges();
            }
            return await GetCurrencyTypes(rulesetId);
        }

        public async Task<List<CurrencyType>> updateCurrencyTypes(List<CurrencyType> currencyTypes, int rulesetId)
        {
            try
            {
                List<int> UpdatedTypes = new List<int>();
                if (currencyTypes == null)
                    await removeCurrencyTypes(rulesetId);
                else if (currencyTypes.Count == 0)
                    await removeCurrencyTypes(rulesetId);
                else
                {
                    foreach (var model in currencyTypes)
                    {
                        var existingCurrencyType = await _context.CurrencyTypes.Where(x => x.CurrencyTypeId == model.CurrencyTypeId && x.RuleSetId == rulesetId && x.IsDeleted == false).FirstOrDefaultAsync();
                        if (existingCurrencyType == null)
                        {
                            var newCurrencyType = new CurrencyType()
                            {
                                Name = model.Name,
                                BaseUnit = model.BaseUnit,
                                WeightValue = model.WeightValue,
                                WeightLabel = model.WeightLabel,
                                SortOrder = model.SortOrder,
                                IsDeleted = false,
                                CreatedBy = this._context.CurrentUserId,
                                CreatedDate = DateTime.Now,
                                RuleSetId = rulesetId
                            };
                            _context.CurrencyTypes.Add(newCurrencyType);
                            await _context.SaveChangesAsync();
                            UpdatedTypes.Add(newCurrencyType.CurrencyTypeId);
                        }
                        else
                        {
                            existingCurrencyType.Name = model.Name;
                            existingCurrencyType.BaseUnit = model.BaseUnit;
                            existingCurrencyType.WeightValue = model.WeightValue;
                            existingCurrencyType.WeightLabel = model.WeightLabel;
                            existingCurrencyType.SortOrder = model.SortOrder;
                            existingCurrencyType.UpdatedBy = this._context.CurrentUserId;
                            existingCurrencyType.UpdatedDate = DateTime.Now;
                            _context.CurrencyTypes.Update(existingCurrencyType);
                            await _context.SaveChangesAsync();
                            UpdatedTypes.Add(existingCurrencyType.CurrencyTypeId);
                        }
                    }
                    var OldTypes = await _context.CurrencyTypes.Where(a => !UpdatedTypes.Contains(a.CurrencyTypeId) && a.RuleSetId == rulesetId && a.IsDeleted == false).ToListAsync();
                    if (OldTypes.Count > 0)
                    {
                        foreach(var type in OldTypes)
                        {
                            type.IsDeleted = true;
                            type.UpdatedBy = this._context.CurrentUserId;
                            type.UpdatedDate = DateTime.Now;
                        }
                        //_context.CurrencyTypes.RemoveRange(OldTypes);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            {

            }

           
            return await GetCurrencyTypes(rulesetId);
        }

        public async Task<List<CurrencyType>> GetCurrencyTypesWithDefault(int ruleSetId)
        {
            List<CurrencyType> CurrencyTypeList = new List<CurrencyType>();

            CurrencyTypeList.Add(await this.GetDefaultCurrencyType(ruleSetId));
            CurrencyTypeList.AddRange(await this.GetCurrencyTypes(ruleSetId));

            return CurrencyTypeList;
        }

        public async Task<List<CurrencyType>> GetCurrencyTypes(int ruleSetId)
        {
            return await _context.CurrencyTypes.Where(r => r.RuleSetId == ruleSetId && r.IsDeleted == false)
                .Select(x => new CurrencyType
                {
                    CurrencyTypeId = x.CurrencyTypeId,
                    BaseUnit = x.BaseUnit,
                    Name = x.Name,
                    WeightValue = x.WeightValue,
                    WeightLabel = x.WeightLabel,
                    SortOrder = x.SortOrder,
                    RuleSetId = x.RuleSetId,
                    CreatedBy = x.CreatedBy,
                    CreatedDate = x.CreatedDate
                }).ToListAsync();
        }

        public async Task<CurrencyType> GetDefaultCurrencyType(int ruleSetId)
        {
            var ruleset = await _context.RuleSets.Where(r => r.RuleSetId == ruleSetId )
                .Select(x => new RuleSet
                {                    
                    CurrencyBaseUnit = x.CurrencyBaseUnit,
                    CurrencyLabel = x.CurrencyLabel,
                    CurrencyName = x.CurrencyName,
                    CurrencyWeight = x.CurrencyWeight,
                    WeightLabel = x.WeightLabel,
                    RuleSetId = x.RuleSetId,
                    CreatedBy = x.CreatedBy,
                    CreatedDate = x.CreatedDate
                }).FirstOrDefaultAsync();

            return new CurrencyType
            {
                CurrencyTypeId = -1,
                BaseUnit = ruleset.CurrencyBaseUnit,
                Name = ruleset.CurrencyName,
                WeightValue = ruleset.CurrencyWeight,
                SortOrder = -1,
                RuleSetId = ruleset.RuleSetId,
                CreatedBy = ruleset.CreatedBy,
                CreatedDate = ruleset.CreatedDate
            };
        }

        public async Task removeCurrencyTypes(int ruleSetId)
        {
            _context.CurrencyTypes.RemoveRange(_context.CurrencyTypes.Where(x => x.RuleSetId == ruleSetId));
            await _context.SaveChangesAsync();
        }

        public async Task<CurrencyType> GetCurrencyTypeById(int CurrencyTypeId)
        {
            return await _context.CurrencyTypes.Where(r => r.CurrencyTypeId == CurrencyTypeId)
                .Select(x => new CurrencyType
                {
                    CurrencyTypeId = x.CurrencyTypeId,
                    BaseUnit = x.BaseUnit,
                    Name = x.Name,
                    WeightValue = x.WeightValue,
                    WeightLabel = x.WeightLabel,
                    SortOrder = x.SortOrder,
                    RuleSetId = x.RuleSetId,
                    CreatedBy = x.CreatedBy,
                    CreatedDate = x.CreatedDate,
                    IsDeleted = x.IsDeleted
                }).FirstOrDefaultAsync();
        }

        public async Task<bool> AddCharacterCurrency(int CharacterId, int RuleSetId)
        {
            bool success = false;
            try
            {
                //889
                var defaultCurrency = await this._characterCurrencyService.HasCharacterCurrencyWithDefault(CharacterId);
                if (defaultCurrency == null)
                {
                    var DefaultRSCurrencyType = await this.GetDefaultCurrencyType(RuleSetId);
                    if (!string.IsNullOrEmpty(DefaultRSCurrencyType.Name))
                    {
                        await this._characterCurrencyService.Create(new CharacterCurrency
                        {
                            Name = DefaultRSCurrencyType.Name,
                            Amount = 0,
                            BaseUnit = DefaultRSCurrencyType.BaseUnit,
                            WeightValue = DefaultRSCurrencyType.WeightValue,
                            WeightLabel = DefaultRSCurrencyType.WeightLabel,
                            SortOrder = DefaultRSCurrencyType.SortOrder,
                            CurrencyTypeId = DefaultRSCurrencyType.CurrencyTypeId,
                            CharacterId = CharacterId
                        });
                    }
                }

                var currencyTypes = await this.GetCurrencyTypes(RuleSetId);
                foreach (var type in currencyTypes)
                {
                    if (await this._characterCurrencyService.ExistCurrencyType(CharacterId, type.CurrencyTypeId) == false)
                    {
                        var characterCurrency = new CharacterCurrency
                        {
                            Name = type.Name,
                            Amount = 0,
                            BaseUnit = type.BaseUnit,
                            WeightValue = type.WeightValue,
                            WeightLabel = type.WeightLabel,
                            SortOrder = type.SortOrder,
                            CurrencyTypeId = type.CurrencyTypeId,
                            CharacterId = CharacterId
                        };
                        await this._characterCurrencyService.Create(characterCurrency);
                    }
                }

                var _characterCurrency = await this._characterCurrencyService.GetByCharacterId(CharacterId);
                foreach (var currency in _characterCurrency)
                {
                    if (currency.CurrencyTypeId != -1 && currencyTypes.Where(x => x.CurrencyTypeId == currency.CurrencyTypeId).FirstOrDefault() == null)
                    {
                        await this._characterCurrencyService.Delete(currency.CharacterCurrencyId);
                    }
                }
                await this.UpdateCurrencyInfo(CharacterId, RuleSetId);
                success = true;
            }
            catch (Exception ex)
            { }
            return success;
        }

        public async Task<bool> UpdateCurrencyInfo(int CharacterId, int RuleSetId)
        {
            try
            {
                string _defaultConnection = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
                SqlConnection connection = new SqlConnection(_defaultConnection);
                DataTable dt = new DataTable();
                using (SqlDataAdapter adapter = new SqlDataAdapter())
                {
                    connection.Open();
                    SqlCommand command = new SqlCommand("UpdateCurrencyInfo", connection);
                    try
                    {
                        // Add the parameters
                        command.Parameters.AddWithValue("@RuleSetId", GetNull(RuleSetId));
                        command.Parameters.AddWithValue("@CharacterId", GetNull(CharacterId));
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
                }
                
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        #endregion

        #region Basic_Search
        public List<CharacterAbility> SearchCharacterAbilities(SearchModel searchModel, int[] idsToSearch = null)
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
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsAbilityName", searchModel.AbilityFilters.IsAbilityName);
                    command.Parameters.AddWithValue("@IsAbilityTags", searchModel.AbilityFilters.IsAbilityTags);
                    command.Parameters.AddWithValue("@IsAbilityStats", searchModel.AbilityFilters.IsAbilityStats);
                    command.Parameters.AddWithValue("@IsAbilityDesc", searchModel.AbilityFilters.IsAbilityDesc);
                    command.Parameters.AddWithValue("@IsAbilityLevel", searchModel.AbilityFilters.IsAbilityLevel);
                    command.Parameters.AddWithValue("@IsAbilityGMOnly", searchModel.AbilityFilters.IsGMOnly);
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

                        _ability.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
                        

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
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsAbilityName", searchModel.AbilityFilters.IsAbilityName);
                    command.Parameters.AddWithValue("@IsAbilityTags", searchModel.AbilityFilters.IsAbilityTags);
                    command.Parameters.AddWithValue("@IsAbilityStats", searchModel.AbilityFilters.IsAbilityStats);
                    command.Parameters.AddWithValue("@IsAbilityDesc", searchModel.AbilityFilters.IsAbilityDesc);
                    command.Parameters.AddWithValue("@IsAbilityLevel", searchModel.AbilityFilters.IsAbilityLevel);
                    command.Parameters.AddWithValue("@IsAbilityGMOnly", searchModel.AbilityFilters.IsGMOnly);
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
                        _ability.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();

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
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
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
                    command.Parameters.AddWithValue("@IsSpellGMOnly", searchModel.SpellFilters.IsGMOnly);
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
                        _spell.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();

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
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
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
                    command.Parameters.AddWithValue("@IsSpellGMOnly", searchModel.SpellFilters.IsGMOnly);
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
                        _spell.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();

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
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
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
                    command.Parameters.AddWithValue("@IsItemGMOnly", searchModel.ItemFilters.IsGMOnly);
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
                        i.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
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
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
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
                    command.Parameters.AddWithValue("@IsItemGMOnly", searchModel.ItemFilters.IsGMOnly);
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
                        i.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
                        itemlist.Add(i);
                    }
                }
            }

            return itemlist;
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        public List<ItemMasterLoot> SearchRulesetLoots(SearchModel searchModel, int[] idsToSearch = null, string UserID = "")
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
            List<ItemMasterLoot> lootlist = new List<ItemMasterLoot>();
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
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetLoot);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                command.Parameters.AddWithValue("@CurrentUser_Id", UserID);


                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsLootName", searchModel.LootFilters.IsLootName);
                    command.Parameters.AddWithValue("@IsLootTags", searchModel.LootFilters.IsLootTags);
                    command.Parameters.AddWithValue("@IsLootStats", searchModel.LootFilters.IsLootStats);
                    command.Parameters.AddWithValue("@IsLootDesc", searchModel.LootFilters.IsLootDesc);
                    command.Parameters.AddWithValue("@IsLootRarity", searchModel.LootFilters.IsLootRarity);
                    command.Parameters.AddWithValue("@IsLootAbilityAssociated", searchModel.LootFilters.IsLootAbilityAssociated);
                    command.Parameters.AddWithValue("@IsLootSpellAssociated", searchModel.LootFilters.IsLootSpellAssociated);
                    command.Parameters.AddWithValue("@IsLootItemAssociated", searchModel.LootFilters.IsLootItemAssociated);
                    command.Parameters.AddWithValue("@IsLootItemGMOnly", searchModel.LootFilters.IsGMOnly);
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
                        ItemMasterLoot i = new ItemMasterLoot()
                        {
                            Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                            CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString(),
                            ContainerVolumeMax = row["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerVolumeMax"]),
                            ContainerWeightMax = row["ContainerWeightMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerWeightMax"]),
                            ContainerWeightModifier = row["ContainerWeightModifier"] == DBNull.Value ? null : row["ContainerWeightModifier"].ToString(),
                            IsConsumable = row["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(row["IsConsumable"]),
                            IsContainer = row["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(row["IsContainer"]),
                            IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                            IsIdentified = row["IsIdentified"] == DBNull.Value ? false : Convert.ToBoolean(row["IsIdentified"]),
                            IsLootPile = row["IsLootPile"] == DBNull.Value ? false : Convert.ToBoolean(row["IsLootPile"]),
                            IsShow = row["IsShow"] == DBNull.Value ? false : Convert.ToBoolean(row["IsShow"]),
                            IsVisible = row["IsVisible"] == DBNull.Value ? false : Convert.ToBoolean(row["IsVisible"]),
                            LootId = row["LootId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootId"].ToString()),
                            LootPileCharacterId = row["LootPileCharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootPileCharacterId"].ToString()),
                            LootPileMonsterId = row["LootPileMonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootPileMonsterId"].ToString()),
                            LootPileId = row["LootPileId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootPileId"].ToString()),
                            ParentLootId = row["ParentLootId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentLootId"].ToString()),
                            Quantity = row["Quantity"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Quantity"]),
                            TotalWeight = row["TotalWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeight"]),
                            IsMagical = row["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMagical"]),
                            ItemCalculation = row["ItemCalculation"] == DBNull.Value ? null : row["ItemCalculation"].ToString(),
                            ItemImage = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString(),
                            ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"].ToString()),
                            ItemName = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString(),
                            ItemStats = row["ItemStats"] == DBNull.Value ? null : row["ItemStats"].ToString(),
                            ItemVisibleDesc = row["ItemVisibleDesc"] == DBNull.Value ? null : row["ItemVisibleDesc"].ToString(),
                            Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                            PercentReduced = row["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(row["PercentReduced"]),
                            Rarity = row["Rarity"] == DBNull.Value ? null : row["Rarity"].ToString(),
                            RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                            TotalWeightWithContents = row["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeightWithContents"]),
                            Value = row["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Value"]),
                            Volume = row["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Volume"]),
                            Weight = row["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Weight"]),
                            gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString()
                    };
                       
                        lootlist.Add(i);
                    }
                }
            }

            return lootlist;
        }
        public List<LootTemplate> SearchRulesetLootTemplates(SearchModel searchModel, int[] idsToSearch = null, string UserID = "")
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
            List<LootTemplate> _lootTemplateList = new List<LootTemplate>();
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
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetLootTemplate);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                command.Parameters.AddWithValue("@CurrentUser_Id", UserID);

                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsLootName", searchModel.LootFilters.IsLootName);
                    command.Parameters.AddWithValue("@IsLootTags", searchModel.LootFilters.IsLootTags);
                    command.Parameters.AddWithValue("@IsLootDesc", searchModel.LootFilters.IsLootDesc);
                    command.Parameters.AddWithValue("@IsLootItemAssociated", searchModel.LootFilters.IsLootItemAssociated);
                    command.Parameters.AddWithValue("@IsLootItemGMOnly", searchModel.LootFilters.IsGMOnly);
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
                        LootTemplate _ability = new LootTemplate()
                        {
                            Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString(),
                            Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                            Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString(),
                            ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString(),
                            IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                            RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                            LootTemplateId = row["LootTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootTemplateId"].ToString()),
                            gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString()
                    };
                        _lootTemplateList.Add(_ability);
                    }
                }
            }
            return _lootTemplateList;
        }
        public List<MonsterTemplate_Bundle> SearchRulesetMonsterTemplates(SearchModel searchModel, int[] idsToSearch = null, string UserID = "")
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
            List<MonsterTemplate_Bundle> monsterTemplatelist = new List<MonsterTemplate_Bundle>();
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
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetMonsterTemplate);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                command.Parameters.AddWithValue("@CurrentUser_Id", UserID);


                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsMonsterName", searchModel.MonsterFilters.IsMonsterName);
                    command.Parameters.AddWithValue("@IsMonsterTags", searchModel.MonsterFilters.IsMonsterTags);
                    command.Parameters.AddWithValue("@IsMonsterStats", searchModel.MonsterFilters.IsMonsterStats);
                    command.Parameters.AddWithValue("@IsMonsterDesc", searchModel.MonsterFilters.IsMonsterDesc);
                    command.Parameters.AddWithValue("@IsMonsterChallengeRating", searchModel.MonsterFilters.IsMonsterChallengeRating);
                    command.Parameters.AddWithValue("@IsMonsterXPValue", searchModel.MonsterFilters.IsMonsterXPValue);
                    
                    command.Parameters.AddWithValue("@IsMonsterAbilityAssociated", searchModel.MonsterFilters.IsMonsterAbilityAssociated);
                    command.Parameters.AddWithValue("@IsMonsterSpellAssociated", searchModel.MonsterFilters.IsMonsterSpellAssociated);
                    command.Parameters.AddWithValue("@IsMonsterItemAssociated", searchModel.MonsterFilters.IsMonsterItemAssociated);
                    command.Parameters.AddWithValue("@IsMonsterBEAssociated", searchModel.MonsterFilters.IsMonsterBEAssociated);
                    command.Parameters.AddWithValue("@IsMonsterGMOnly", searchModel.MonsterFilters.IsGMOnly);
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
                        MonsterTemplate_Bundle i = new MonsterTemplate_Bundle()
                        {
                        Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                        ArmorClass = row["ArmorClass"] == DBNull.Value ? null : row["ArmorClass"].ToString(),
                        ChallangeRating = row["ChallangeRating"] == DBNull.Value ? null : row["ChallangeRating"].ToString(),
                        Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString(),
                        Health = row["Health"] == DBNull.Value ? null : row["Health"].ToString(),
                        ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString(),
                        InitiativeCommand = row["InitiativeCommand"] == DBNull.Value ? null : row["InitiativeCommand"].ToString(),
                        Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString(),
                        XPValue = row["XPValue"] == DBNull.Value ? null : row["XPValue"].ToString(),
                        Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString(),
                        IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                        Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                        RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                        IsBundle = row["IsBundle"] == DBNull.Value ? false : Convert.ToBoolean(row["IsBundle"]),
                        CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString(),
                        IsRandomizationEngine= row["IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(row["IsRandomizationEngine"]),
                        MonsterTemplateId= row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString()),
                        ParentMonsterTemplateId= row["ParentMonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentMonsterTemplateId"].ToString()),
                        gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString()
                    };
                        
                        monsterTemplatelist.Add(i);
                    }
                }
            }

            return monsterTemplatelist;
        }
        public List<Monster> SearchRulesetMonsters(SearchModel searchModel, int[] idsToSearch = null, string UserID = "")
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
            List<Monster> _RulesetMonsterList = new List<Monster>();
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
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetMonster);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                command.Parameters.AddWithValue("@CurrentUser_Id", UserID);

                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsMonsterName", searchModel.MonsterFilters.IsMonsterName);
                    command.Parameters.AddWithValue("@IsMonsterTags", searchModel.MonsterFilters.IsMonsterTags);
                    command.Parameters.AddWithValue("@IsMonsterStats", searchModel.MonsterFilters.IsMonsterStats);
                    command.Parameters.AddWithValue("@IsMonsterDesc", searchModel.MonsterFilters.IsMonsterDesc);
                    command.Parameters.AddWithValue("@IsMonsterChallengeRating", searchModel.MonsterFilters.IsMonsterChallengeRating);
                    command.Parameters.AddWithValue("@IsMonsterXPValue", searchModel.MonsterFilters.IsMonsterXPValue);
                    command.Parameters.AddWithValue("@IsMonsterHealth", searchModel.MonsterFilters.IsMonsterHealth);
                    command.Parameters.AddWithValue("@IsMonsterAC", searchModel.MonsterFilters.IsMonsterAC);

                    command.Parameters.AddWithValue("@IsMonsterAbilityAssociated", searchModel.MonsterFilters.IsMonsterAbilityAssociated);
                    command.Parameters.AddWithValue("@IsMonsterSpellAssociated", searchModel.MonsterFilters.IsMonsterSpellAssociated);
                    command.Parameters.AddWithValue("@IsMonsterItemAssociated", searchModel.MonsterFilters.IsMonsterItemAssociated);
                    command.Parameters.AddWithValue("@IsMonsterBEAssociated", searchModel.MonsterFilters.IsMonsterBEAssociated);
                    command.Parameters.AddWithValue("@IsMonsterGMOnly", searchModel.MonsterFilters.IsGMOnly);
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

                        Monster _monster = new Monster()
                        {
                            Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString(),
                            Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString(),
                            Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                            Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                            CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString(),
                            Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString(),
                            ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString(),
                            IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                            RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                            AddToCombatTracker = row["AddToCombatTracker"] == DBNull.Value ? false : Convert.ToBoolean(row["AddToCombatTracker"]),
                            MonsterId = row["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterId"].ToString()),
                            ArmorClass = row["ArmorClass"] == DBNull.Value ? 0 : Convert.ToInt32(row["ArmorClass"].ToString()),
                            ChallangeRating = row["ChallangeRating"] == DBNull.Value ? 0 : Convert.ToInt32(row["ChallangeRating"].ToString()),
                            HealthCurrent = row["HealthCurrent"] == DBNull.Value ? 0 : Convert.ToInt32(row["HealthCurrent"].ToString()),
                            HealthMax = row["HealthMax"] == DBNull.Value ? 0 : Convert.ToInt32(row["HealthMax"].ToString()),
                            InitiativeCommand = row["InitiativeCommand"] == DBNull.Value ? null : row["InitiativeCommand"].ToString(),
                            ParentMonsterId = row["ParentMonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentMonsterId"].ToString()),
                            IsRandomizationEngine = row["IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(row["IsRandomizationEngine"]),
                            XPValue = row["XPValue"] == DBNull.Value ? 0 : Convert.ToInt32(row["XPValue"].ToString()),
                            MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString()),
                            gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString()
                    };
                        
                        MonsterTemplate _monsterTemplate = new MonsterTemplate()
                        {
                            Name = row["MT_Name"] == DBNull.Value ? null : row["MT_Name"].ToString(),
                            Stats = row["MT_Stats"] == DBNull.Value ? null : row["MT_Stats"].ToString(),
                            Metatags = row["MT_Metatags"] == DBNull.Value ? null : row["MT_Metatags"].ToString(),
                            Command = row["MT_Command"] == DBNull.Value ? null : row["MT_Command"].ToString(),
                            CommandName = row["MT_CommandName"] == DBNull.Value ? null : row["MT_CommandName"].ToString(),
                            Description = row["MT_Description"] == DBNull.Value ? null : row["MT_Description"].ToString(),
                            ImageUrl = row["MT_ImageUrl"] == DBNull.Value ? null : row["MT_ImageUrl"].ToString(),
                            IsDeleted = row["MT_IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["MT_IsDeleted"]),
                            RuleSetId = row["MT_RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MT_RuleSetId"].ToString()),
                            ArmorClass = row["MT_ArmorClass"] == DBNull.Value ? null : row["MT_ArmorClass"].ToString(),
                            ChallangeRating = row["MT_ChallangeRating"] == DBNull.Value ? null : row["MT_ChallangeRating"].ToString(),
                            Health = row["MT_Health"] == DBNull.Value ? null : row["MT_Health"].ToString(),
                            InitiativeCommand = row["MT_InitiativeCommand"] == DBNull.Value ? null : row["MT_InitiativeCommand"].ToString(),
                            XPValue = row["MT_XPValue"] == DBNull.Value ? null : row["MT_XPValue"].ToString(),
                            IsRandomizationEngine = row["MT_IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(row["MT_IsRandomizationEngine"]),
                            MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString()),
                            ParentMonsterTemplateId = row["MT_ParentMonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MT_ParentMonsterTemplateId"].ToString()),
                            gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString()

                    };

                        _monster.MonsterTemplate = _monsterTemplate;
                        //_characterAbility.Character = character;
                        _RulesetMonsterList.Add(_monster);
                    }
                }

            }
            return _RulesetMonsterList;
        }
        public List<BuffAndEffectVM> SearchRulesetBuffAndEffects(SearchModel searchModel, int[] idsToSearch = null, string UserID = "")
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
            List<BuffAndEffectVM> _buffEffectList = new List<BuffAndEffectVM>();
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
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetBuffAndEffect);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                command.Parameters.AddWithValue("@CurrentUser_Id", UserID);

                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsBEName", searchModel.BuffAndEffectFilters.IsBuffAndEffectName);
                    command.Parameters.AddWithValue("@IsBETags", searchModel.BuffAndEffectFilters.IsBuffAndEffectTags);
                    command.Parameters.AddWithValue("@IsBEStats", searchModel.BuffAndEffectFilters.IsBuffAndEffectStats);
                    command.Parameters.AddWithValue("@IsBEDesc", searchModel.BuffAndEffectFilters.IsBuffAndEffectDesc);
                    command.Parameters.AddWithValue("@IsBEGMOnly", searchModel.BuffAndEffectFilters.IsGMOnly);
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
                        BuffAndEffectVM _bf = new BuffAndEffectVM()
                        {
                            Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString(),
                            Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString(),
                            Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                            Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                            CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString(),
                            Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString(),
                            ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString(),
                            IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                            RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                            BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"].ToString()),
                            ParentBuffAndEffectId = row["ParentBuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentBuffAndEffectId"].ToString()),
                            IsAssignedToAnyCharacter = row["IsAssignedToAnyCharacter"] == DBNull.Value ? false : Convert.ToBoolean(row["IsAssignedToAnyCharacter"]),
                            gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString()
                    };
                        _buffEffectList.Add(_bf);
                    }
                }
            }
            return _buffEffectList;
        }
        public List<CharacterBuffAndEffect> SearchCharacterBuffAandEffects(SearchModel searchModel, int[] idsToSearch = null, string UserID = "")
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
            List<CharacterBuffAndEffect> _CharacterBuffAndEffectList = new List<CharacterBuffAndEffect>();
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
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.CharacterBuffAndEffect);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                command.Parameters.AddWithValue("@CurrentUser_Id", UserID);

                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsBEName", searchModel.BuffAndEffectFilters.IsBuffAndEffectName);
                    command.Parameters.AddWithValue("@IsBETags", searchModel.BuffAndEffectFilters.IsBuffAndEffectTags);
                    command.Parameters.AddWithValue("@IsBEStats", searchModel.BuffAndEffectFilters.IsBuffAndEffectStats);
                    command.Parameters.AddWithValue("@IsBEDesc", searchModel.BuffAndEffectFilters.IsBuffAndEffectDesc);
                    command.Parameters.AddWithValue("@IsBEGMOnly", searchModel.BuffAndEffectFilters.IsGMOnly);
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

                        CharacterBuffAndEffect _characterBuffAndEffect = new CharacterBuffAndEffect()
                        {
                            BuffAndEffectID= row["BuffAndEffectID"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectID"].ToString()),
                            CharacterBuffAandEffectId= row["CharacterBuffAandEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterBuffAandEffectId"].ToString()),
                            CharacterId= row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"].ToString()),
                        };

                        BuffAndEffect _bf = new BuffAndEffect()
                        {
                            Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString(),
                            Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString(),
                            Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                            Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                            CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString(),
                            Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString(),
                            ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString(),
                            IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                            RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                            BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"].ToString()),
                            ParentBuffAndEffectId = row["ParentBuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentBuffAndEffectId"].ToString()),
                            gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString()
                    };

                        _characterBuffAndEffect.BuffAndEffect = _bf;
                        //_characterAbility.Character = character;
                        _CharacterBuffAndEffectList.Add(_characterBuffAndEffect);
                    }
                }

            }
            return _CharacterBuffAndEffectList;
        }

        public List<ItemMasterLoot> SearchCharacterLoots(SearchModel searchModel, int[] idsToSearch = null, string UserID = "")
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
            List<ItemMasterLoot> lootlist = new List<ItemMasterLoot>();
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
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.CharacterLoot);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                command.Parameters.AddWithValue("@CurrentUser_Id", UserID);


                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
                }
                else
                {
                    command.Parameters.AddWithValue("@IsLootName", searchModel.LootFilters.IsLootName);
                    command.Parameters.AddWithValue("@IsLootTags", searchModel.LootFilters.IsLootTags);
                    command.Parameters.AddWithValue("@IsLootStats", searchModel.LootFilters.IsLootStats);
                    command.Parameters.AddWithValue("@IsLootDesc", searchModel.LootFilters.IsLootDesc);
                    command.Parameters.AddWithValue("@IsLootRarity", searchModel.LootFilters.IsLootRarity);
                    command.Parameters.AddWithValue("@IsLootAbilityAssociated", searchModel.LootFilters.IsLootAbilityAssociated);
                    command.Parameters.AddWithValue("@IsLootSpellAssociated", searchModel.LootFilters.IsLootSpellAssociated);
                    command.Parameters.AddWithValue("@IsLootItemAssociated", searchModel.LootFilters.IsLootItemAssociated);
                    command.Parameters.AddWithValue("@IsLootItemGMOnly", searchModel.LootFilters.IsGMOnly);
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
                        ItemMasterLoot i = new ItemMasterLoot()
                        {
                            Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                            CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString(),
                            ContainerVolumeMax = row["ContainerVolumeMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerVolumeMax"]),
                            ContainerWeightMax = row["ContainerWeightMax"] == DBNull.Value ? 0 : Convert.ToDecimal(row["ContainerWeightMax"]),
                            ContainerWeightModifier = row["ContainerWeightModifier"] == DBNull.Value ? null : row["ContainerWeightModifier"].ToString(),
                            IsConsumable = row["IsConsumable"] == DBNull.Value ? false : Convert.ToBoolean(row["IsConsumable"]),
                            IsContainer = row["IsContainer"] == DBNull.Value ? false : Convert.ToBoolean(row["IsContainer"]),
                            IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                            IsIdentified = row["IsIdentified"] == DBNull.Value ? false : Convert.ToBoolean(row["IsIdentified"]),
                            IsLootPile = row["IsLootPile"] == DBNull.Value ? false : Convert.ToBoolean(row["IsLootPile"]),
                            IsShow = row["IsShow"] == DBNull.Value ? false : Convert.ToBoolean(row["IsShow"]),
                            IsVisible = row["IsVisible"] == DBNull.Value ? false : Convert.ToBoolean(row["IsVisible"]),
                            LootId = row["LootId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootId"].ToString()),
                            LootPileCharacterId = row["LootPileCharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootPileCharacterId"].ToString()),
                            LootPileMonsterId = row["LootPileMonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootPileMonsterId"].ToString()),
                            LootPileId = row["LootPileId"] == DBNull.Value ? 0 : Convert.ToInt32(row["LootPileId"].ToString()),
                            ParentLootId = row["ParentLootId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentLootId"].ToString()),
                            Quantity = row["Quantity"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Quantity"]),
                            TotalWeight = row["TotalWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeight"]),
                            IsMagical = row["IsMagical"] == DBNull.Value ? false : Convert.ToBoolean(row["IsMagical"]),
                            ItemCalculation = row["ItemCalculation"] == DBNull.Value ? null : row["ItemCalculation"].ToString(),
                            ItemImage = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString(),
                            ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"].ToString()),
                            ItemName = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString(),
                            ItemStats = row["ItemStats"] == DBNull.Value ? null : row["ItemStats"].ToString(),
                            ItemVisibleDesc = row["ItemVisibleDesc"] == DBNull.Value ? null : row["ItemVisibleDesc"].ToString(),
                            Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                            PercentReduced = row["PercentReduced"] == DBNull.Value ? 0 : Convert.ToDecimal(row["PercentReduced"]),
                            Rarity = row["Rarity"] == DBNull.Value ? null : row["Rarity"].ToString(),
                            RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                            TotalWeightWithContents = row["TotalWeightWithContents"] == DBNull.Value ? 0 : Convert.ToDecimal(row["TotalWeightWithContents"]),
                            Value = row["Value"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Value"]),
                            Volume = row["Volume"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Volume"]),
                            Weight = row["Weight"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Weight"]),
                            gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString()
                    };

                        lootlist.Add(i);
                    }
                }
            }

            return lootlist;
        }
        public List<Item> SearchRulesetCharacteritems(SearchModel searchModel, int[] idsToSearch = null, string UserID = "")
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
                command.Parameters.AddWithValue("@RecordType", SP_SearchType.RulesetCharacterItems);
                command.Parameters.AddWithValue("@CharacterID", searchModel.CharacterID);
                command.Parameters.AddWithValue("@RulesetID", searchModel.RulesetID);
                command.Parameters.AddWithValue("@CurrentUser_Id", UserID);

                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    command.Parameters.AddWithValue("@IsEverything", true);
                    command.Parameters.AddWithValue("@IsEverythingName", searchModel.EverythingFilters.IsEverythingName);
                    command.Parameters.AddWithValue("@IsEverythingTag", searchModel.EverythingFilters.IsEverythingTags);
                    command.Parameters.AddWithValue("@IsEverythingStat", searchModel.EverythingFilters.IsEverythingStats);
                    command.Parameters.AddWithValue("@IsEverythingDesc", searchModel.EverythingFilters.IsEverythingDesc);
                    command.Parameters.AddWithValue("@IsEverythingGMOnly", searchModel.EverythingFilters.IsGMOnly);
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
                    command.Parameters.AddWithValue("@IsItemGMOnly", searchModel.ItemFilters.IsGMOnly);
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
                        i.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
                        _ItemList.Add(i);
                    }
                }
            }

            return _ItemList;
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public void SaveLastSearchFilters(SearchModel searchModel)
        {
            SearchFilter filter = null;
            if (
                searchModel.SearchType == SP_SearchType.CharacterAbilities
                ||
                searchModel.SearchType == SP_SearchType.CharacterSpells
                ||
                searchModel.SearchType == SP_SearchType.CharacterItems
                ||
                searchModel.SearchType == SP_SearchType.CharacterBuffAndEffect
                ||
                searchModel.SearchType == SP_SearchType.CharacterHandout
                 ||
                searchModel.SearchType == SP_SearchType.CharacterLoot
                )
            {
                if (searchModel.CharacterID != 0)
                {
                    bool isItem = (searchModel.SearchType == SP_SearchType.CharacterItems);
                    bool isSpell = (searchModel.SearchType == SP_SearchType.CharacterSpells);
                    bool isAbility = (searchModel.SearchType == SP_SearchType.CharacterAbilities);
                    bool isBuffEffect = (searchModel.SearchType == SP_SearchType.CharacterBuffAndEffect);
                    bool ishandout = (searchModel.SearchType == SP_SearchType.CharacterHandout);
                    bool isloot = (searchModel.SearchType == SP_SearchType.CharacterLoot);
                    if (_context.SearchFilter.Any(x => x.CharacterId == searchModel.CharacterID && x.IsCharacter == true && x.IsRuleSet == false &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility && x.IsBuffEffect== isBuffEffect && 
                        x.IsHandout == ishandout && x.IsLoot== isloot))
                    {

                        filter = _context.SearchFilter.Where(x => x.CharacterId == searchModel.CharacterID && x.IsCharacter == true && x.IsRuleSet == false &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility && x.IsBuffEffect == isBuffEffect && x.IsHandout == ishandout
                        &&x.IsLoot==isloot
                        ).FirstOrDefault();
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
            else
            {
                if (searchModel.RulesetID != 0)
                {
                    bool isItem = (searchModel.SearchType == SP_SearchType.RulesetItems);
                    bool isSpell = (searchModel.SearchType == SP_SearchType.RulesetSpells);
                    bool isAbility = (searchModel.SearchType == SP_SearchType.RulesetAbilities);

                    bool isBuffEffect = (searchModel.SearchType == SP_SearchType.RulesetBuffAndEffect);
                    bool isMonster = (searchModel.SearchType == SP_SearchType.RulesetMonster);
                    bool isMonsterTemplate = (searchModel.SearchType == SP_SearchType.RulesetMonsterTemplate);
                    bool isLoot = (searchModel.SearchType == SP_SearchType.RulesetLoot);
                    bool isLootTemplate = (searchModel.SearchType == SP_SearchType.RulesetLootTemplate);
                    bool ishandout = (searchModel.SearchType == SP_SearchType.RulesetHandout);
                    bool isRulesetCharacterItem = (searchModel.SearchType == SP_SearchType.RulesetCharacterItems);
                    if (_context.SearchFilter.Any(x => x.RulesetId == searchModel.RulesetID && x.IsRuleSet == true && x.IsCharacter == false &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility &&
                        x.IsBuffEffect == isBuffEffect && x.IsMonster == isMonster && x.IsMonsterTemplate == isMonsterTemplate &&
                        x.IsLoot == isLoot && x.IsLootTemplate == isLootTemplate && x.IsHandout == ishandout
                        && x.IsCharacterItem== isRulesetCharacterItem))
                    {
                        filter = _context.SearchFilter.Where(x => x.RulesetId == searchModel.RulesetID && x.IsRuleSet == true && x.IsCharacter == false &&
                        x.IsItem == isItem && x.IsSpell == isSpell && x.IsAbility == isAbility &&
                        x.IsBuffEffect == isBuffEffect && x.IsMonster == isMonster && x.IsMonsterTemplate == isMonsterTemplate &&
                        x.IsLoot == isLoot && x.IsLootTemplate == isLootTemplate && x.IsHandout == ishandout
                        && x.IsCharacterItem == isRulesetCharacterItem).FirstOrDefault();
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
            if (filter == null)
            {
                filter = new SearchFilter();
            }
            if (
                searchModel.SearchType == SP_SearchType.CharacterAbilities
                ||
                searchModel.SearchType == SP_SearchType.CharacterSpells
                ||
                searchModel.SearchType == SP_SearchType.CharacterItems
                ||
                searchModel.SearchType == SP_SearchType.CharacterBuffAndEffect
||
                searchModel.SearchType == SP_SearchType.CharacterHandout
                ||
                searchModel.SearchType == SP_SearchType.CharacterLoot)
            {
                filter.IsCharacter = true;
                filter.CharacterId = searchModel.CharacterID;

                filter.IsRuleSet = false;
                filter.RulesetId = null;

                filter.IsItem = searchModel.SearchType == SP_SearchType.CharacterItems ? true : false;
                filter.IsSpell = searchModel.SearchType == SP_SearchType.CharacterSpells ? true : false;
                filter.IsAbility = searchModel.SearchType == SP_SearchType.CharacterAbilities ? true : false;
                filter.IsBuffEffect = searchModel.SearchType == SP_SearchType.CharacterBuffAndEffect ? true : false;
                filter.IsHandout = searchModel.SearchType == SP_SearchType.CharacterHandout ? true : false;
                filter.IsLoot = searchModel.SearchType == SP_SearchType.CharacterLoot ? true : false;

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
                    case SP_SearchType.CharacterBuffAndEffect:
                        filter.IsName = searchModel.BuffAndEffectFilters.IsBuffAndEffectName;
                        filter.IsTags = searchModel.BuffAndEffectFilters.IsBuffAndEffectTags;                       
                        filter.IsStats = searchModel.BuffAndEffectFilters.IsBuffAndEffectStats;
                        filter.IsDesc = searchModel.BuffAndEffectFilters.IsBuffAndEffectDesc;
                        break;
                    case SP_SearchType.CharacterHandout:
                        filter.IsName = searchModel.HandoutFilters.IsHandoutName;
                        filter.IsFileType = searchModel.HandoutFilters.IsHandoutFileType;
                        break;
                    case SP_SearchType.CharacterLoot:
                        filter.IsAssociatedAbility = searchModel.LootFilters.IsLootAbilityAssociated;
                        filter.IsDesc = searchModel.LootFilters.IsLootDesc;
                        filter.IsAssociatedItem = searchModel.LootFilters.IsLootItemAssociated;
                        filter.IsName = searchModel.LootFilters.IsLootName;
                        filter.IsRarity = searchModel.LootFilters.IsLootRarity;
                        filter.IsAssociatedSpell = searchModel.LootFilters.IsLootSpellAssociated;
                        filter.IsStats = searchModel.LootFilters.IsLootStats;
                        filter.IsTags = searchModel.LootFilters.IsLootTags;
                        break;
                    default:
                        break;
                }
            }
            else if (searchModel.SearchType == SP_SearchType.Everything)
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
            else
            {
                filter.IsRuleSet = true;
                filter.RulesetId = searchModel.RulesetID;

                filter.IsCharacter = false;
                filter.CharacterId = null;

                filter.IsItem = searchModel.SearchType == SP_SearchType.RulesetItems ? true : false;
                filter.IsSpell = searchModel.SearchType == SP_SearchType.RulesetSpells ? true : false;
                filter.IsAbility = searchModel.SearchType == SP_SearchType.RulesetAbilities ? true : false;

                filter.IsBuffEffect = searchModel.SearchType == SP_SearchType.RulesetBuffAndEffect ? true : false;
                filter.IsMonster = searchModel.SearchType == SP_SearchType.RulesetMonster ? true : false;
                filter.IsMonsterTemplate = searchModel.SearchType == SP_SearchType.RulesetMonsterTemplate ? true : false;
                filter.IsLoot = searchModel.SearchType == SP_SearchType.RulesetLoot ? true : false;
                filter.IsLootTemplate = searchModel.SearchType == SP_SearchType.RulesetLootTemplate ? true : false;
                filter.IsHandout = searchModel.SearchType == SP_SearchType.RulesetHandout ? true : false;
                filter.IsCharacterItem = searchModel.SearchType == SP_SearchType.RulesetCharacterItems ? true : false;

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
                    case SP_SearchType.RulesetBuffAndEffect:
                        filter.IsName = searchModel.BuffAndEffectFilters.IsBuffAndEffectName;
                        filter.IsTags = searchModel.BuffAndEffectFilters.IsBuffAndEffectTags;
                        filter.IsStats = searchModel.BuffAndEffectFilters.IsBuffAndEffectStats;
                        filter.IsDesc = searchModel.BuffAndEffectFilters.IsBuffAndEffectDesc;
                        break;
                    case SP_SearchType.RulesetLoot:
                        filter.IsAssociatedAbility = searchModel.LootFilters.IsLootAbilityAssociated;
                        filter.IsDesc = searchModel.LootFilters.IsLootDesc;
                        filter.IsAssociatedItem = searchModel.LootFilters.IsLootItemAssociated;
                        filter.IsName = searchModel.LootFilters.IsLootName;
                        filter.IsRarity = searchModel.LootFilters.IsLootRarity;
                        filter.IsAssociatedSpell = searchModel.LootFilters.IsLootSpellAssociated;
                        filter.IsStats = searchModel.LootFilters.IsLootStats;
                        filter.IsTags = searchModel.LootFilters.IsLootTags;
                        break;
                    case SP_SearchType.RulesetLootTemplate:
                        filter.IsDesc = searchModel.LootFilters.IsLootDesc;
                        filter.IsAssociatedItem = searchModel.LootFilters.IsLootItemAssociated;
                        filter.IsName = searchModel.LootFilters.IsLootName;                        
                        filter.IsTags = searchModel.LootFilters.IsLootTags;
                        break;
                    case SP_SearchType.RulesetMonster:
                        filter.IsAssociatedAbility = searchModel.MonsterFilters.IsMonsterAbilityAssociated;
                        filter.IsAC = searchModel.MonsterFilters.IsMonsterAC;
                        filter.IsAssociatedBE = searchModel.MonsterFilters.IsMonsterBEAssociated;
                        filter.IsChallengeRating = searchModel.MonsterFilters.IsMonsterChallengeRating;
                        filter.IsDesc = searchModel.MonsterFilters.IsMonsterDesc;
                        filter.IsHealth = searchModel.MonsterFilters.IsMonsterHealth;
                        filter.IsAssociatedItem = searchModel.MonsterFilters.IsMonsterItemAssociated;
                        filter.IsName = searchModel.MonsterFilters.IsMonsterName;
                        filter.IsAssociatedSpell = searchModel.MonsterFilters.IsMonsterSpellAssociated;
                        filter.IsStats = searchModel.MonsterFilters.IsMonsterStats;
                        filter.IsTags = searchModel.MonsterFilters.IsMonsterTags;
                        filter.IsXPValue = searchModel.MonsterFilters.IsMonsterXPValue;
                        break;
                    case SP_SearchType.RulesetMonsterTemplate:
                        filter.IsAssociatedAbility = searchModel.MonsterFilters.IsMonsterAbilityAssociated;                        
                        filter.IsAssociatedBE = searchModel.MonsterFilters.IsMonsterBEAssociated;
                        filter.IsChallengeRating = searchModel.MonsterFilters.IsMonsterChallengeRating;
                        filter.IsDesc = searchModel.MonsterFilters.IsMonsterDesc;
                        filter.IsAssociatedItem = searchModel.MonsterFilters.IsMonsterItemAssociated;
                        filter.IsName = searchModel.MonsterFilters.IsMonsterName;
                        filter.IsAssociatedSpell = searchModel.MonsterFilters.IsMonsterSpellAssociated;
                        filter.IsStats = searchModel.MonsterFilters.IsMonsterStats;
                        filter.IsTags = searchModel.MonsterFilters.IsMonsterTags;
                        filter.IsXPValue = searchModel.MonsterFilters.IsMonsterXPValue;
                        break;
                    case SP_SearchType.RulesetHandout:
                        filter.IsName = searchModel.HandoutFilters.IsHandoutName;
                        filter.IsFileType = searchModel.HandoutFilters.IsHandoutFileType;
                        break;
                    case SP_SearchType.RulesetCharacterItems:
                        filter.IsName = searchModel.ItemFilters.IsItemName;
                        filter.IsTags = searchModel.ItemFilters.IsItemTags;
                        filter.IsStats = searchModel.ItemFilters.IsItemStats;
                        filter.IsDesc = searchModel.ItemFilters.IsItemDesc;
                        filter.IsRarity = searchModel.ItemFilters.IsItemRarity;
                        filter.IsAssociatedSpell = searchModel.ItemFilters.IsItemSpellAssociated;
                        filter.IsAssociatedAbility = searchModel.ItemFilters.IsItemAbilityAssociated;
                        break;
                    default:
                        break;
                }
            }
            return filter;
        }

        public List<SearchEverything> bindEveryThingModel(List<CharacterAbility> characterAbilities, List<Ability> abilities,
            List<CharacterSpell> characterSpells, List<Spell> spells, List<Item> items, List<ItemMaster_Bundle> itemMasters,
            List<BuffAndEffectVM> buffAndEffects,
            List<CharacterBuffAndEffect> characterBuffAndEffects,
            List<ItemMasterLoot> loots,
            List<LootTemplate> lootTemplates,
            List<Monster> monsters,
            List<MonsterTemplate_Bundle> monsterTemplates,
            List<HandoutViewModel> handouts, int CharacterID,
             List<ItemMasterLoot> characterLoots,
            List<Item> rulesetCharacteritems)
        {
            List<SearchEverything> results = new List<SearchEverything>();
            foreach (var item in characterAbilities)
            {
                SearchEverything obj = new SearchEverything()
                {
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
                if (!characterAbilities.Any(x => x.AbilityId == item.AbilityId && x.Ability.Name == item.Name))
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

            foreach (var item in characterBuffAndEffects)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.CharacterBuffAandEffectId,
                    image = item.BuffAndEffect.ImageUrl,
                    name = item.BuffAndEffect.Name,
                    RecordType = SP_SearchType.CharacterBuffAndEffect,
                    CharacterBuffAndEffect = item
                };
                results.Add(obj);
            }
            foreach (var item in buffAndEffects)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.BuffAndEffectId,
                    image = item.ImageUrl,
                    name = item.Name,
                    RecordType = SP_SearchType.RulesetBuffAndEffect,
                     RulesetBuffAndEffect= item
                };
                if (!characterBuffAndEffects.Any(x => x.BuffAndEffectID == item.BuffAndEffectId && x.BuffAndEffect.Name == item.Name))
                {
                    results.Add(obj);
                }

            }
            foreach (var item in monsters)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.MonsterId,
                    image = item.MonsterTemplate.ImageUrl,
                    name = item.MonsterTemplate.Name,
                    RecordType = SP_SearchType.RulesetMonster,
                    RulesetMonster = item
                };
                results.Add(obj);
            }
            foreach (var item in monsterTemplates)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.MonsterTemplateId,
                    image = item.ImageUrl,
                    name = item.Name,
                    RecordType = SP_SearchType.RulesetMonsterTemplate,
                    RulesetMonsterTemplate = item
                };
                //if (!monsters.Any(x => x.MonsterTemplateId == item.MonsterTemplateId && x.MonsterTemplate.Name == item.Name))
                //{
                //    results.Add(obj);
                //}
                results.Add(obj);
            }
            foreach (var item in loots)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.LootId,
                    image = item.ItemImage,
                    name = item.ItemName,
                    RecordType = SP_SearchType.RulesetLoot,
                    RulesetLoot = item
                };
                results.Add(obj);
            }
            foreach (var item in lootTemplates)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.LootTemplateId,
                    image = item.ImageUrl,
                    name = item.Name,
                    RecordType = SP_SearchType.RulesetLootTemplate,
                    RulesetLootTemplate = item
                };
                results.Add(obj);
            }
            if (CharacterID == 0)
            {
                foreach (var item in handouts)
                {
                    SearchEverything obj = new SearchEverything()
                    {
                        id = 0,
                        image = item.url,
                        name = item.Name,
                        RecordType = SP_SearchType.RulesetHandout,
                        extension = item.extension
                    };
                    results.Add(obj);
                }
            }
            else
            {
                foreach (var item in handouts)
                {
                    SearchEverything obj = new SearchEverything()
                    {
                        id = 0,
                        image = item.url,
                        name = item.Name,
                        RecordType = SP_SearchType.CharacterHandout,
                        extension=item.extension

                    };
                    results.Add(obj);
                }
            }
            foreach (var item in rulesetCharacteritems)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.ItemId,
                    image = item.ItemImage,
                    name = item.Name,
                    RecordType = SP_SearchType.RulesetCharacterItems,
                    RulesetCharacterItem = item
                }; results.Add(obj);
            }
            foreach (var item in characterLoots)
            {
                SearchEverything obj = new SearchEverything()
                {
                    id = item.LootId,
                    image = item.ItemImage,
                    name = item.ItemName,
                    RecordType = SP_SearchType.CharacterLoot,
                    CharacterLoot = item
                };
                results.Add(obj);
            }
            return results.OrderBy(x => x.name).ToList();
        }
        public List<SearchEverything> SearchEveryThing(SearchModel searchModel, int CharacterID)
        {
            List<CharacterAbility> characterAbilities = SearchCharacterAbilities(searchModel);
            List<Ability> abilities = SearchRulesetAbilities(searchModel);
            List<CharacterSpell> characterSpells = SearchCharacterSpells(searchModel);
            List<Spell> spells = SearchRulesetSpells(searchModel);
            List<Item> items = SearchCharacterItems(searchModel);
            List<ItemMaster_Bundle> itemMasters = SearchRulesetItems(searchModel);

            List<BuffAndEffectVM> buffAndEffects = SearchRulesetBuffAndEffects(searchModel);
            List<CharacterBuffAndEffect> characterBuffAndEffects = SearchCharacterBuffAandEffects(searchModel);
            List<ItemMasterLoot> loots = SearchRulesetLoots(searchModel);
            List< LootTemplate > lootTemplates = SearchRulesetLootTemplates(searchModel);
            List<Monster> monsters = SearchRulesetMonsters(searchModel);
            List<MonsterTemplate_Bundle> monsterTemplates = SearchRulesetMonsterTemplates(searchModel);
            List<HandoutViewModel> handouts = new List<HandoutViewModel>();
            List<Item> rulesetCharacteritems = SearchRulesetCharacteritems(searchModel);
            List<ItemMasterLoot> CharacterLoots = SearchCharacterLoots(searchModel);
            List<SearchEverything> results = bindEveryThingModel(characterAbilities, abilities, characterSpells, spells, items, itemMasters,
               buffAndEffects, characterBuffAndEffects, loots, lootTemplates, monsters, monsterTemplates, handouts,CharacterID,
               CharacterLoots,rulesetCharacteritems);
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
                DiceRollModel.RuleSet.IsDicePublicRoll = ds.Tables[8].Rows[0]["IsDicePublicRoll"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[8].Rows[0]["IsDicePublicRoll"]);

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
                    DiceRollModel.Character = _repo.GetCharacter(ds.Tables[0]);
                    DiceRollModel.Character.IsDicePublicRoll = ds.Tables[0].Rows[0]["IsDicePublicRoll"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[0].Rows[0]["IsDicePublicRoll"]);

                    DiceRollModel.CharacterCommands = new List<CharacterCommand>();
                    if (ds.Tables[7].Rows.Count > 0) //Dice Tray
                    {
                        List<CharacterCommand> _characterCommands = new List<CharacterCommand>();
                        foreach (DataRow _characterCommandRow in ds.Tables[7].Rows)
                        {
                            CharacterCommand characterCommand = new CharacterCommand()
                            {
                                CharacterCommandId = _characterCommandRow["CharacterCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(_characterCommandRow["CharacterCommandId"]),
                                CharacterId = _characterCommandRow["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(_characterCommandRow["CharacterId"]),
                                Command = _characterCommandRow["Command"] == DBNull.Value ? null : _characterCommandRow["Command"].ToString(),
                                CreatedOn = _characterCommandRow["CreatedOn"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(_characterCommandRow["CreatedOn"]),
                                IsDeleted = _characterCommandRow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(_characterCommandRow["IsDeleted"]),
                                UpdatedOn = _characterCommandRow["UpdatedOn"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(_characterCommandRow["UpdatedOn"]),
                                Name = _characterCommandRow["Name"] == DBNull.Value ? null : _characterCommandRow["Name"].ToString()
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


                if (ds.Tables[13].Rows.Count > 0 && CharacterID == 0) //Dice Tray
                {
                    DiceRollModel.RulesetCommands = new List<RulesetCommand>();
                    List<RulesetCommand> _rulesetCommands = new List<RulesetCommand>();
                    foreach (DataRow __rulesetCommandRow in ds.Tables[13].Rows)
                    {
                        RulesetCommand rulesetCommand = new RulesetCommand()
                        {
                            RulesetCommandId = __rulesetCommandRow["RulesetCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(__rulesetCommandRow["RulesetCommandId"]),
                            RuleSetId = __rulesetCommandRow["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(__rulesetCommandRow["RuleSetId"]),
                            Command = __rulesetCommandRow["Command"] == DBNull.Value ? null : __rulesetCommandRow["Command"].ToString(),
                            CreatedOn = __rulesetCommandRow["CreatedOn"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(__rulesetCommandRow["CreatedOn"]),
                            IsDeleted = __rulesetCommandRow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(__rulesetCommandRow["IsDeleted"]),
                            UpdatedOn = __rulesetCommandRow["UpdatedOn"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(__rulesetCommandRow["UpdatedOn"]),
                            Name = __rulesetCommandRow["Name"] == DBNull.Value ? null : __rulesetCommandRow["Name"].ToString()
                        };
                        _rulesetCommands.Add(rulesetCommand);
                    }
                    if (_rulesetCommands.Any())
                    {
                        DiceRollModel.RulesetCommands = _rulesetCommands;
                    }
                }


            }


            if (_campaign.IsDeletedInvite(CharacterID, User.Id))
            {
                DiceRollModel.IsGmAccessingPlayerCharacter = false;
            }
            else
            {
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

        public async Task<RuleSet> UpdateLastCommand(int rulesetId, string lastcommand, string lastcommandresult, string lastCommandValues, int lastCommandTotal, string lastcommandresultcolor)
        {
            var _ruleset = await _repo.Get(rulesetId);

            if (_ruleset == null)
                return _ruleset;

            _ruleset.LastCommand = lastcommand;
            _ruleset.LastCommandResult = lastcommandresult;
            _ruleset.LastCommandResultColor = lastcommandresultcolor;
            _ruleset.LastCommandValues = lastCommandValues;
            _ruleset.LastCommandTotal = lastCommandTotal;

            try
            {
                _context.SaveChanges();
                return _ruleset;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #region Ruleset Command
        public async Task<bool> CheckDuplicateRulesetCommand(string value, int? rulesetId, int? rulesetCommandId = 0)
        {
            return _context.RulesetCommands.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == rulesetId && x.RulesetCommandId != rulesetCommandId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }

        public async Task<RulesetCommand> Create(RulesetCommand item)
        {
            _context.RulesetCommands.Add(item);
            _context.SaveChanges();
            return item;
        }

        public async Task<RuleSet> UpdateRulesetLastCommand(RuleSet _ruleSet)
        {
            var RuleSet = _context.RuleSets.Where(x => x.RuleSetId == _ruleSet.RuleSetId).FirstOrDefault();

            if (RuleSet == null) return RuleSet;

            RuleSet.LastCommand = _ruleSet.LastCommand;
            RuleSet.LastCommandResult = _ruleSet.LastCommandResult;
            RuleSet.LastCommandValues = _ruleSet.LastCommandValues;
            RuleSet.LastCommandTotal = _ruleSet.LastCommandTotal;

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return RuleSet;
        }

        public async Task<RulesetCommand> Update(RulesetCommand item)
        {
            RulesetCommand rulesetCommand = _context.RulesetCommands.Where(x => x.RulesetCommandId == item.RulesetCommandId).FirstOrDefault();

            if (rulesetCommand == null)
                return rulesetCommand;
            rulesetCommand.Name = item.Name;
            rulesetCommand.UpdatedOn = item.UpdatedOn;
            rulesetCommand.Command = item.Command;
            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return rulesetCommand;
        }

        public async Task<bool> Delete(int id)
        {
            // Remove CharacterCommand
           var cc = _context.RulesetCommands.Where(x => x.RulesetCommandId == id).FirstOrDefault();

            if (cc == null)
                return false;

            cc.IsDeleted = true;

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
        #endregion

        public bool IsItemEnabled(int rulesetID) {
            return _context.RuleSets.Where(x => x.RuleSetId == rulesetID && x.IsItemEnabled == true).Any();
        }
        public bool IsSpellEnabled(int rulesetID) {
            return _context.RuleSets.Where(x => x.RuleSetId == rulesetID && x.IsSpellEnabled == true).Any();
        }
        public bool IsAbilityEnabled(int rulesetID) {
            return _context.RuleSets.Where(x => x.RuleSetId == rulesetID && x.IsAbilityEnabled == true).Any();
        }
        public bool IsBuffAndEffectEnabled(int rulesetID) {
            return _context.RuleSets.Where(x => x.RuleSetId == rulesetID && x.IsBuffAndEffectEnabled == true).Any();
        }

    }

}