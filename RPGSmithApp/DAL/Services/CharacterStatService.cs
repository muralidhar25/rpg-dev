using System;
using System.Collections.Generic;
using System.Text;
using DAL.Models;
using DAL.Repositories.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using DAL.Repositories;
using System.Linq.Expressions;
using DAL.Models.CharacterTileModels;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Data;
using DAL.Models.RulesetTileModels;
using DAL.Models.SPModels;
using Dapper;

namespace DAL.Services
{
    public class CharacterStatService : ICharacterStatService
    {
        private readonly IRepository<CharacterStat> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public CharacterStatService(ApplicationDbContext context, IRepository<CharacterStat> repo, IConfiguration configuration)
        {
            _context = context;
            _repo = repo;
            this._configuration = configuration;
        }


        //public async Task<List<CharacterStat>> GetCharacterStats(int page, int pageSize)
        //{
        //    return await _repo.PagedList(page, pageSize);
        //}

        public CharacterStat GetCharacterStatById(int Id)
        {
            var characterstat = _repo.AllIncludeNavigation(new string[] { "RuleSet", "CharacterStatCalcs", "CharacterStatChoices", "CharacterStatCombos", "CharacterStatType" })
                .Where(x => x.CharacterStatId == Id && x.IsDeleted != true).FirstOrDefault();

            characterstat.CharacterStatCalcs = characterstat.CharacterStatCalcs.Where(p => p.IsDeleted != true).ToList();
            characterstat.CharacterStatChoices = characterstat.CharacterStatChoices.Where(p => p.IsDeleted != true).ToList();

            return characterstat;
        }

        public List<CharacterStat> GetCharacterStatRuleSetId(int Id)
        {
            List<CharacterStat> characterstats = _context.CharacterStats
                .Include(q => q.RuleSet)
                .Include(q => q.CharacterStatCalcs)
                .Include(q => q.CharacterStatChoices)
                .Include(q => q.CharacterStatCombos)
                .Include(q => q.CharacterStatToggles).ThenInclude(q => q.CustomToggles)
                .Include(q => q.CharacterStatType)
                .Include(q=>q.CharacterStatDefaultValues)
                .Include(q=>q.CharacterStatConditions)
                 .Where(x => x.RuleSetId == Id && x.IsDeleted != true)
                .ToList();

            //List<CharacterStat> characterstats = _repo.AllIncludeNavigation(new string[] { "RuleSet", "CharacterStatCalcs", "CharacterStatChoices", "CharacterStatType" })
            //    .Where(x => x.RuleSetId == Id && x.IsDeleted != true).ToList();

            foreach (CharacterStat characterstat in characterstats)
            {
                characterstat.CharacterStatCalcs = characterstat.CharacterStatCalcs.Where(p => p.IsDeleted != true).ToList();
                characterstat.CharacterStatChoices = characterstat.CharacterStatChoices.Where(p => p.IsDeleted != true).ToList();
            }

            return characterstats;
        }
        public List<CharacterStat> Core_GetCharacterStatRuleSetId(int Id, int parentID)
        {
            var idsToRemove = _context.CharacterStats.Where(p => (p.RuleSetId == Id) && p.ParentCharacterStatId != null).Select(p => p.ParentCharacterStatId).ToArray();
            var recsToRemove = _context.CharacterStats.Where(p => idsToRemove.Contains(p.CharacterStatId)).ToList();

            var res = _context.CharacterStats.Where(x => (x.RuleSetId == Id || x.RuleSetId == parentID) && x.IsDeleted != true)
                .Except(recsToRemove).ToList();

            List<CharacterStat> characterstats =
                _context.CharacterStats
                .Where(x => (x.RuleSetId == Id || x.RuleSetId == parentID) && x.IsDeleted != true)
                .Include(q => q.RuleSet)
                .Include(q => q.CharacterStatCalcs)
                .Include(q => q.CharacterStatChoices)
                .Include(q => q.CharacterStatCombos)
                .Include(q => q.CharacterStatToggles).ThenInclude(q => q.CustomToggles)
                .Include(q => q.CharacterStatType)
                .Include(q => q.CharacterStatDefaultValues)
                .Include(q => q.CharacterStatConditions)
                .ToList();

            characterstats = characterstats.Where(p => res.Select(q => q.CharacterStatId).Contains(p.CharacterStatId)).ToList();
            //List<CharacterStat> characterstats = _repo.AllIncludeNavigation(new string[] { "RuleSet", "CharacterStatCalcs", "CharacterStatChoices", "CharacterStatType" })
            //    .Where(x => x.RuleSetId == Id && x.IsDeleted != true).ToList();

            foreach (CharacterStat characterstat in characterstats)
            {
                characterstat.CharacterStatCalcs = characterstat.CharacterStatCalcs.Where(p => p.IsDeleted != true).ToList();
                characterstat.CharacterStatChoices = characterstat.CharacterStatChoices.Where(p => p.IsDeleted != true).ToList();
            }

            return characterstats;
        }

        public async Task<CharacterStat> InsertCharacterStat(CharacterStat CharacterStatDomain)
        {
            var res= await _repo.Add(CharacterStatDomain);
            //var query = "EXEC Core_CreatedCharacterStat_UpdateChildCharacters @RulesetID =" + res.RuleSetId + ",@InsertedCharacterStat=" + res.CharacterStatId + "";
            // await _context.Database.ExecuteSqlCommandAsync(query);
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("Core_CreatedCharacterStat_UpdateChildCharacters", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@RulesetID", SqlDbType.Int).Value = res.RuleSetId;
            cmd.Parameters.Add("@InsertedCharacterStat", SqlDbType.Int).Value = res.CharacterStatId;

            cmd.ExecuteNonQuery();
            con.Close();
            return res;
        }
        public async Task<CharacterStat> Core_CharacterStat(CharacterStat characterStat)
        {
            characterStat.ParentCharacterStatId = characterStat.CharacterStatId;
            characterStat.CharacterStatId = 0;
            return await _repo.Add(characterStat);
        }
        //public CharacterStat InsertDuplicateRuleSetCharacterStat(CharacterStat CharacterStatDomain)
        //{
        //    var characterStat = new CharacterStat()
        //    {
        //        RuleSetId = CharacterStatDomain.RuleSetId,
        //        StatName = CharacterStatDomain.StatName,
        //        StatDesc = CharacterStatDomain.StatDesc,
        //        isMultiSelect = CharacterStatDomain.isMultiSelect,
        //        isActive = CharacterStatDomain.isActive,
        //        SortOrder = CharacterStatDomain.SortOrder,
        //        ModifiedDate = CharacterStatDomain.ModifiedDate,
        //        ModifiedBy = CharacterStatDomain.ModifiedBy,
        //        CharacterStatTypeId = CharacterStatDomain.CharacterStatTypeId,
        //        ParentCharacterStatId = CharacterStatDomain.ParentCharacterStatId
        //    };

        //    try
        //    {
        //        _context.SaveChanges();
        //    }
        //    catch (Exception ex)
        //    {

        //    }

        //    return characterStat;
        //}
        public async Task<CharacterStat> UdateCharacterStat(CharacterStat CharacterStatDomain)
        {
            var characterStat = _context.CharacterStats.Include("RuleSet").Include("CharacterStatCalcs").Include("CharacterStatChoices").Include("CharacterStatType").Where(x => x.CharacterStatId == CharacterStatDomain.CharacterStatId).FirstOrDefault();

            if (characterStat == null)
                return characterStat;

            characterStat.RuleSetId = CharacterStatDomain.RuleSetId;
            characterStat.StatName = CharacterStatDomain.StatName;
            characterStat.StatDesc = CharacterStatDomain.StatDesc;
            characterStat.isMultiSelect = CharacterStatDomain.isMultiSelect;
            characterStat.isActive = CharacterStatDomain.isActive;
            characterStat.SortOrder = CharacterStatDomain.SortOrder;
            characterStat.ModifiedDate = CharacterStatDomain.ModifiedDate;
            characterStat.ModifiedBy = CharacterStatDomain.ModifiedBy;
            characterStat.CharacterStatTypeId = CharacterStatDomain.CharacterStatTypeId;
            characterStat.ParentCharacterStatId = CharacterStatDomain.ParentCharacterStatId;
            characterStat.AddToModScreen = CharacterStatDomain.AddToModScreen;
            characterStat.AlertPlayer = CharacterStatDomain.AlertPlayer;
            characterStat.AlertGM = CharacterStatDomain.AlertGM;
            characterStat.IsChoiceNumeric = CharacterStatDomain.IsChoiceNumeric;
            characterStat.IsChoicesFromAnotherStat = CharacterStatDomain.IsChoicesFromAnotherStat;
            characterStat.SelectedChoiceCharacterStatId = CharacterStatDomain.SelectedChoiceCharacterStatId;

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return characterStat;
        }
        public async Task<bool> CheckDuplicateCharacterStat(string value, int Id, int? ruleSetId)
        {
            //var items = _repo.GetAll();
            //if (Id > 0)
            //{
            //    return items.Result.Where(x => x.StatName == value && x.RuleSetId == ruleSetId && x.CharacterStatId != Id && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            //}
            //else
            //    return items.Result.Where(x => x.StatName == value && x.RuleSetId == ruleSetId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;            
            if (Id > 0)
            {
                return _context.CharacterStats.Where(x => x.StatName.ToLower().Trim() == value.ToLower().Trim() && x.RuleSetId == ruleSetId && x.CharacterStatId != Id && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            }
            else
                return _context.CharacterStats.Where(x => x.StatName.ToLower().Trim() == value.ToLower().Trim() && x.RuleSetId == ruleSetId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }

        public bool CheckDuplicateCharacterStat_sp(string statName, int characterStatId, int? ruleSetId)
        {
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string spQry = "EXEC CharacterStats_CheckDuplicateName @RulesetId='" + ruleSetId + "',@CharacterStatId='" + characterStatId + "',@StatName='" + statName + "'";

            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("CharacterStats_CheckDuplicateName", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@RulesetId", SqlDbType.Int).Value = ruleSetId;
            cmd.Parameters.Add("@CharacterStatId", SqlDbType.Int).Value = characterStatId;
            cmd.Parameters.Add("@StatName", SqlDbType.VarChar).Value = statName;

            SqlParameter returnParameter = cmd.Parameters.Add("RetVal", SqlDbType.Int);
            returnParameter.Direction = ParameterDirection.ReturnValue;
            cmd.ExecuteNonQuery();
            con.Close();

            int returnValue = (int)returnParameter.Value;

            if (returnValue > 0) return true;
            else return false;
        }

        public async Task<bool> DeleteCharacterStat(int id, bool IsChildRulesetCharacterStatDeleted = false)
        {
            if (IsChildRulesetCharacterStatDeleted)
            {               
                var ccsdel = _context.CharactersCharacterStats.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();

                foreach (CharactersCharacterStat ccs_item in ccsdel)
                {
                    //Remove Characters Stat  Tiles 
                    var cstile = _context.CharacterCharacterStatTiles.Where(p => p.CharactersCharacterStatId == ccs_item.CharactersCharacterStatId && p.IsDeleted != true).ToList();

                    foreach (CharacterCharacterStatTile cstile_item in cstile)
                    {
                        // Remove Tile
                        var tile = _context.CharacterTiles.Where(p => p.CharacterTileId == cstile_item.CharacterTileId).SingleOrDefault();

                        tile.IsDeleted = true;
                        cstile_item.IsDeleted = true;
                    }

                    ccs_item.IsDeleted = true;
                }
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

            // Remove CharacterStatCalcs
            var cscalcs = _context.CharacterStatCalcs.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();
            foreach (CharacterStatCalc cscal_item in cscalcs)
            {
                cscal_item.IsDeleted = true;
            }

            //Remove CharacterStatChoices
            var cschoice = _context.CharacterStatChoices.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();
            foreach (CharacterStatChoice cschoice_item in cschoice)
            {
                cschoice_item.IsDeleted = true;
            }

            // Remove CharacterStatCombos
            var combo = _context.CharacterStatCombos.Where(p => p.CharacterStatId == id && p.IsDeleted != true).FirstOrDefault();
            if (combo != null) combo.IsDeleted = true;

            // Remove CharacterStatCombos
            var toggle = _context.CharacterStatToggle.Include(q => q.CustomToggles).Where(p => p.CharacterStatId == id && p.IsDeleted != true).FirstOrDefault();
            if (toggle != null)
            {
                foreach (var ct in toggle.CustomToggles)
                {
                    ct.IsDeleted = true;
                    _context.CustomToggle.Remove(ct);
                }
                toggle.IsDeleted = true;
                _context.CharacterStatToggle.Remove(toggle);
            }

            // Remove CharacterStatDefaultValues
            _context.CharacterStatDefaultValues.RemoveRange(_context.CharacterStatDefaultValues.Where(a => a.CharacterStatId == id).ToList());

            // Remove CharacterStatConditions
            _context.CharacterStatConditions.RemoveRange(_context.CharacterStatConditions.Where(a => a.CharacterStatId == id).ToList());

            //Remove Characters Character Stat
            var ccs = _context.CharactersCharacterStats.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();
            foreach (CharactersCharacterStat ccs_item in ccs)
            {
                //Remove Characters Stat  Tiles 
                var cstile = _context.CharacterCharacterStatTiles.Where(p => p.CharactersCharacterStatId == ccs_item.CharactersCharacterStatId && p.IsDeleted != true).ToList();

                foreach (CharacterCharacterStatTile cstile_item in cstile)
                {
                    // Remove Tile
                    var tile = _context.CharacterTiles.Where(p => p.CharacterTileId == cstile_item.CharacterTileId).SingleOrDefault();

                    tile.IsDeleted = true;
                    cstile_item.IsDeleted = true;
                }

                ccs_item.IsDeleted = true;
            }
            // Remove ruleset Level tiles

            //Remove ruleset Stat  Tiles 
            var rstile = _context.RulesetCharacterStatTiles.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();
            foreach (RulesetCharacterStatTile rstile_item in rstile)
            {
                // Remove Tile
                var tile = _context.RulesetTiles.Where(p => p.RulesetTileId == rstile_item.RulesetTileId).SingleOrDefault();

                tile.IsDeleted = true;
                rstile_item.IsDeleted = true;
            }


            var characterstat = await _repo.Get(id);

                if (characterstat == null)
                    return false;

                characterstat.IsDeleted = true;
          

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

        public bool DeleteCharacterStatNotAsync(int id)
        {
            // Remove CharacterStatCalcs
            var cscalcs = _context.CharacterStatCalcs.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();
            foreach (CharacterStatCalc cscal_item in cscalcs)
            {
                cscal_item.IsDeleted = true;
            }

            //Remove CharacterStatChoices
            var cschoice = _context.CharacterStatChoices.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();
            foreach (CharacterStatChoice cschoice_item in cschoice)
            {
                cschoice_item.IsDeleted = true;
            }
            
            // Remove CharacterStatCombos
            var combo = _context.CharacterStatCombos.Where(p => p.CharacterStatId == id && p.IsDeleted != true).FirstOrDefault();
            if (combo != null) combo.IsDeleted = true;

            // Remove CharacterStatDefaultValues
            _context.CharacterStatDefaultValues.RemoveRange(_context.CharacterStatDefaultValues.Where(a => a.CharacterStatId == id).ToList());

            // Remove CharacterStatConditions
            _context.CharacterStatConditions.RemoveRange(_context.CharacterStatConditions.Where(a => a.CharacterStatId == id).ToList());


            //Remove Characters Character Stat
            var ccs = _context.CharactersCharacterStats.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();
            foreach (CharactersCharacterStat ccs_item in ccs)
            {
                //Remove Characters Stat  Tiles 
                var cstile = _context.CharacterCharacterStatTiles.Where(p => p.CharactersCharacterStatId == ccs_item.CharactersCharacterStatId && p.IsDeleted != true).ToList();

                foreach (CharacterCharacterStatTile cstile_item in cstile)
                {
                    // Remove Tile
                    var tile = _context.CharacterTiles.Where(p => p.CharacterTileId == cstile_item.CharacterTileId).SingleOrDefault();

                    tile.IsDeleted = true;
                    cstile_item.IsDeleted = true;
                }

                ccs_item.IsDeleted = true;
            }
            //Remove ruleset Stat  Tiles 
            var rstile = _context.RulesetCharacterStatTiles.Where(p => p.CharacterStatId == id && p.IsDeleted != true).ToList();
            foreach (RulesetCharacterStatTile rstile_item in rstile)
            {
                // Remove Tile
                var tile = _context.RulesetTiles.Where(p => p.RulesetTileId == rstile_item.RulesetTileId).SingleOrDefault();

                tile.IsDeleted = true;
                rstile_item.IsDeleted = true;
            }

            var characterstat = _context.CharacterStats.Where(p => p.CharacterStatId == id).SingleOrDefault();

            if (characterstat == null)
                return false;

            characterstat.IsDeleted = true;

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

        public async Task<List<CharacterStat>> GetAllCharacterStats()
        {
            return _context.CharacterStats.Where(p => p.IsDeleted != true).ToList();
        }

        public async Task<int> GetCharacterStatsCount()
        {
            return _context.CharacterStats.Where(p => p.IsDeleted != true).Count();
        }

        public async Task<bool> UpdateCharacterStatOrder(List<CharacterStat> characterStats)
        {
            foreach (var characterStat in characterStats)
            {
                var mapping = _context.CharacterStats.Where(u => u.CharacterStatId == characterStat.CharacterStatId && u.RuleSetId == characterStat.RuleSetId).FirstOrDefault();
                if (mapping != null)
                {
                    mapping.SortOrder = characterStat.SortOrder;
                    mapping.ModifiedDate = characterStat.ModifiedDate;
                }
            }
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
        //public async Task<CharacterStat> UdateCharacterStat(CharacterStat CharacterStatDomain)
        //{
        //    return await _repo.Update(CharacterStatDomain);
        //}

        //public async Task<bool> DeleteCharacterStat(int id)
        //{
        //    return await _repo.Remove(id);
        //}

        public int GetCountByRuleSetId(int? ruleSetId)
        {
            return _context.CharacterStats.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted != true).Count();
        }
        public int Core_GetCountByRuleSetId(int? ruleSetId,int ? parentID)
        {
            var idsToRemove = _context.CharacterStats.Where(p => (p.RuleSetId == ruleSetId) && p.ParentCharacterStatId != null).Select(p => p.ParentCharacterStatId).ToArray();
            var recsToRemove = _context.CharacterStats.Where(p => idsToRemove.Contains(p.CharacterStatId)).ToList();

            var res = _context.CharacterStats.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == parentID) && x.IsDeleted != true)
                .Except(recsToRemove);
            return res.Count();
        }
        public bool Core_CharacterStatWithParentIDExists(int CharacterStatId, int rulesetID)
        {
            if (_context.CharacterStats.Where(x => x.CharacterStatId == CharacterStatId && x.ParentCharacterStatId != null && x.IsDeleted != true).Any())
            {
                return true;
            }
            else
            {
                var model = _context.CharacterStats.Where(x => x.CharacterStatId == CharacterStatId && x.ParentCharacterStatId == null && x.IsDeleted != true);
                if (model.FirstOrDefault().RuleSetId == rulesetID)
                {
                    return true;
                }
            }
            return false;
        }

        public List<CharacterStat> SP_GetCharacterStatByRuleSetId(int rulesetId)
        {
            List<CharacterStat> _characterStatList = new List<CharacterStat>();
            RuleSet ruleset = new RuleSet();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC CharacterStats_GetByRulesetID @RulesetID = '" + rulesetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("CharacterStats_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
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

            if (ds.Tables[0].Rows.Count > 0 && ds.Tables[1].Rows.Count > 0)
            {
                ruleset.CreatedBy = ds.Tables[1].Rows[0]["CreatedBy"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["CreatedBy"].ToString();
                ruleset.CreatedDate = ds.Tables[1].Rows[0]["CreatedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(ds.Tables[1].Rows[0]["CreatedDate"]);
                ruleset.CurrencyLabel = ds.Tables[1].Rows[0]["CurrencyLabel"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["CurrencyLabel"].ToString();
                ruleset.DefaultDice = ds.Tables[1].Rows[0]["DefaultDice"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["DefaultDice"].ToString();
                ruleset.DistanceLabel = ds.Tables[1].Rows[0]["DistanceLabel"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["DistanceLabel"].ToString();
                ruleset.ImageUrl = ds.Tables[1].Rows[0]["ImageUrl"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["ImageUrl"].ToString();
                ruleset.IsAbilityEnabled = ds.Tables[1].Rows[0]["IsAbilityEnabled"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[1].Rows[0]["IsAbilityEnabled"]);
                ruleset.isActive = ds.Tables[1].Rows[0]["isActive"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[1].Rows[0]["isActive"]);
                ruleset.IsAllowSharing = ds.Tables[1].Rows[0]["IsAllowSharing"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[1].Rows[0]["IsAllowSharing"]);
                ruleset.IsCoreRuleset = ds.Tables[1].Rows[0]["IsCoreRuleset"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[1].Rows[0]["IsCoreRuleset"]);
                ruleset.IsDeleted = ds.Tables[1].Rows[0]["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[1].Rows[0]["IsDeleted"]);
                ruleset.IsItemEnabled = ds.Tables[1].Rows[0]["IsItemEnabled"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[1].Rows[0]["IsItemEnabled"]);
                ruleset.IsSpellEnabled = ds.Tables[1].Rows[0]["IsSpellEnabled"] == DBNull.Value ? false : Convert.ToBoolean(ds.Tables[1].Rows[0]["IsSpellEnabled"]);
                ruleset.ModifiedBy = ds.Tables[1].Rows[0]["ModifiedBy"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["ModifiedBy"].ToString();
                ruleset.ModifiedDate = ds.Tables[1].Rows[0]["ModifiedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(ds.Tables[1].Rows[0]["ModifiedDate"]);
                ruleset.OwnerId = ds.Tables[1].Rows[0]["ParentRuleSetId"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["OwnerId"].ToString();
                ruleset.ParentRuleSetId = ds.Tables[1].Rows[0]["ParentRuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[1].Rows[0]["ParentRuleSetId"]);
                ruleset.RuleSetDesc = ds.Tables[1].Rows[0]["RuleSetDesc"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["RuleSetDesc"].ToString();
                ruleset.RuleSetGenreId = ds.Tables[1].Rows[0]["RuleSetGenreId"] == DBNull.Value ? num : (short)Convert.ToInt32(ds.Tables[1].Rows[0]["RuleSetGenreId"]);
                ruleset.RuleSetId = ds.Tables[1].Rows[0]["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(ds.Tables[1].Rows[0]["RuleSetId"]);
                ruleset.RuleSetName = ds.Tables[1].Rows[0]["RuleSetName"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["RuleSetName"].ToString();
                ruleset.ShareCode = ds.Tables[1].Rows[0]["ShareCode"] == DBNull.Value ? new Guid() : new Guid(ds.Tables[1].Rows[0]["ShareCode"].ToString());
                ruleset.ThumbnailUrl = ds.Tables[1].Rows[0]["ThumbnailUrl"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["ThumbnailUrl"].ToString();
                ruleset.VolumeLabel = ds.Tables[1].Rows[0]["VolumeLabel"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["VolumeLabel"].ToString();
                ruleset.WeightLabel = ds.Tables[1].Rows[0]["WeightLabel"] == DBNull.Value ? null : ds.Tables[1].Rows[0]["WeightLabel"].ToString();

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    CharacterStat _characterStat = new CharacterStat();
                    _characterStat.StatName = row["StatName"] == DBNull.Value ? null : row["StatName"].ToString();
                    _characterStat.StatDesc = row["StatDesc"] == DBNull.Value ? null : row["StatDesc"].ToString();
                    _characterStat.StatIdentifier = row["StatIdentifier"] == DBNull.Value ? (Guid?)null : new Guid(row["StatIdentifier"].ToString());

                    _characterStat.CreatedBy = row["CreatedBy"] == DBNull.Value ? null : row["CreatedBy"].ToString();
                    _characterStat.CreatedDate = row["CreatedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(row["CreatedDate"]);
                    _characterStat.ModifiedBy = row["ModifiedBy"] == DBNull.Value ? null : row["ModifiedBy"].ToString();
                    _characterStat.ModifiedDate = row["ModifiedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(row["ModifiedDate"]);
                    _characterStat.OwnerId = row["OwnerId"] == DBNull.Value ? null : row["OwnerId"].ToString();
                    
                    _characterStat.CharacterStatId = row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterStatId"].ToString());

                    int CharacterStatTypeId = row["CharacterStatTypeId"] == DBNull.Value ? 0 : Convert.ToInt16(row["CharacterStatTypeId"].ToString());
                    _characterStat.CharacterStatTypeId = (short)CharacterStatTypeId;
                    int SortOrder = row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt16(row["SortOrder"].ToString());
                    _characterStat.SortOrder = (short)SortOrder;

                    _characterStat.ParentCharacterStatId = row["ParentCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentCharacterStatId"].ToString());

                    _characterStat.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                    _characterStat.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _characterStat.isActive = row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(row["isActive"]);
                    _characterStat.isMultiSelect = row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(row["isMultiSelect"]);

                    _characterStat.RuleSet = ruleset;
                    _characterStatList.Add(_characterStat);
                }
            }
            return _characterStatList;
        }

        public List<CharacterStat> SP_GetCharacterStatByRuleSetId_(int rulesetId)
        {
            List<CharacterStat> _characterStatList = new List<CharacterStat>();
            RuleSet ruleset = new RuleSet();

           string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string qry = "EXEC CharacterStats_GetByRulesetID @RulesetID = '" + rulesetId + "'";
                
                try
                {
                    var characterstat_record = connection.QueryMultiple(qry);
                    _characterStatList = characterstat_record.Read<CharacterStat>().ToList();
                    ruleset= characterstat_record.Read<RuleSet>().FirstOrDefault();
                    _characterStatList.ForEach(x => x.RuleSet = ruleset);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error", ex);
                }
                finally
                {
                    connection.Close();
                }
            }
            SP_GetCharacterStatByRuleSetId(rulesetId);
            return _characterStatList;
        }

        public async Task SaveLogStat(LogStatUpdate model) {
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("CharacterStat_LogStatUpdate", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@CharacterStatId", IsNull(model.CharacterStatId));
            cmd.Parameters.AddWithValue("@CharacterId", IsNull(model.CharacterId));
            cmd.Parameters.AddWithValue("@RuleSetId", IsNull(model.RuleSetId));
            cmd.Parameters.AddWithValue("@AlertToGM", model.AlertToGM);
            cmd.Parameters.AddWithValue("@AlertToPlayer", model.AlertToPlayer);

            cmd.ExecuteNonQuery();
            con.Close();            

        }
        public async Task<bool> DeleteLogStat(int id)
        {
            try
            {
                var log = _context.LogStatUpdates.Where(x => x.Id == id).FirstOrDefault();
                if (log!=null)
                {
                    _context.LogStatUpdates.Remove(log);
                    _context.SaveChanges();
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<List<LogStatUpdate>> GetStatNotificationForGM(int rulesetId)
        {
            List<LogStatUpdate> model = _context.LogStatUpdates.Where(x => x.RuleSetId == rulesetId && x.AlertToGM == true)
                .Include(x => x.CharacterStat)
                .Include(x => x.Character).ThenInclude(x => x.CharactersCharacterStats)
                .ToList();
            return model;
        }

        public async Task<List<LogStatUpdate>> GetStatNotificationForPlayer(int characterId)
        {
            List<LogStatUpdate> model = _context.LogStatUpdates.Where(x => x.CharacterId == characterId && x.AlertToPlayer == true)
                .Include(x => x.CharacterStat)
                .Include(x => x.Character).ThenInclude(x => x.CharactersCharacterStats)
                .ToList();

            return model;
        }

        public async Task DeleteNotification(List<CommonID> ids) {
            var notifications = _context.LogStatUpdates.Where(x=> ids.Select(a=> a.ID).Contains(x.Id));

            _context.LogStatUpdates.RemoveRange(notifications);
            _context.SaveChanges();

        }

        private object IsNull(object obj)        {            if (obj == null)                return DBNull.Value;            else                return obj;        }
        
        //#928
        public async Task<Boolean> AddNotificationStatUpdates(List<NotificationStatUpdates> notificationStatUpdates, int CharacterId)
        {
            if (notificationStatUpdates.Count > 0)
            {
                foreach (var model in notificationStatUpdates)
                {
                    _context.NotificationStatUpdates.Add(new NotificationStatUpdates()
                    {
                        CharacterStatId = model.CharacterStatId,
                        CharacterStatName = model.CharacterStatName,
                        CharacterStatValue = model.CharacterStatValue,
                        IsDeleted = false,
                        CreatedBy = this._context.CurrentUserId,
                        CreatedDate = DateTime.Now,
                        CharacterId = CharacterId
                    });
                }
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<List<NotificationStatUpdates>> GetNotificationStatUpdates(int CharacterId)
        {
            return await _context.NotificationStatUpdates.Where(r => r.CharacterId == CharacterId).ToListAsync();
        }

        public async Task RemoveNotificationStatUpdates(int CharacterId)
        {
            _context.NotificationStatUpdates.RemoveRange(_context.NotificationStatUpdates.Where(x => x.CharacterId == CharacterId));
            await _context.SaveChangesAsync();
        }
    }
}
