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
    public class SpellService : ISpellService
    {
        private readonly IRepository<Spell> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public SpellService(IRepository<Spell> repo, ApplicationDbContext context, IConfiguration configuration)
        {
            this._repo = repo;
            this._context = context;
            this._configuration = configuration;
        }

        public async Task<Spell> Create(Spell spell)
        {
            return await _repo.Add(spell);
        }

        public async Task<bool> Delete(int id)
        {


            // Remove associated Commands
            var sc = _context.SpellCommands.Where(x => x.SpellId == id && x.IsDeleted != true).ToList();

            foreach (SpellCommand item in sc)
            {
                item.IsDeleted = true;
            }

            // Remove associated character spell
            var cs = _context.CharacterSpells.Where(x => x.SpellId == id && x.IsDeleted != true).ToList();

            foreach (CharacterSpell cs_item in cs)
            {
                cs_item.IsDeleted = true;
                var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "spell" && x.DefaultValue == cs_item.CharacterSpellId).ToList();
                foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
                {
                    LRCCS.DefaultValue = 0;
                    LRCCS.LinkType = "";
                }
            }

            // Remove associated Items Master spell
            var ims = _context.ItemMasterSpells.Where(x => x.SpellId == id && x.IsDeleted != true).ToList();

            foreach (ItemMasterSpell ims_item in ims)
            {
                ims_item.IsDeleted = true;
            }

            // Remove spell
            var spell = await _repo.Get(id);

            if (spell == null)
                return false;

            spell.IsDeleted = true;

            try
            {
                _context.SaveChanges();

                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            // return await _repo.Remove(id);
        }

        public List<Spell> GetAll()
        {
            List<Spell> spells = _context.Spells
                 .Include(d => d.RuleSet)
                .Include(d => d.ItemMasterSpells)
                .Include(d => d.SpellCommand)
                .Where(x => x.IsDeleted != true)
                .OrderBy(o => o.Name).ToList();

            foreach (Spell spell in spells)
            {
                spell.ItemMasterSpells = spell.ItemMasterSpells.Where(p => p.IsDeleted != true).ToList();
                spell.SpellCommand = spell.SpellCommand.Where(p => p.IsDeleted != true).ToList();
            }

            return spells;
        }
        public List<Spell> GetSpellsByRuleSetId_add(int rulesetId)
        {
            List<Spell> spellList = new List<Spell>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
           // string qry = "EXEC SpellsByRuleSetId_add @RulesetID = '" + rulesetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("SpellsByRuleSetId_add", connection);

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
            if (ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    Spell _spell = new Spell();
                    _spell.CastingTime = row["CastingTime"] == DBNull.Value ? null : row["CastingTime"].ToString();
                    _spell.Class = row["Class"] == DBNull.Value ? null : row["Class"].ToString();
                    _spell.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
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

                    spellList.Add(_spell);
                }
            }
            return spellList;
        }
        public List<Spell> GetSpellsByRuleSetId(int ruleSetId)
        {
            List<Spell> spells = _context.Spells
                .Include(d => d.RuleSet)
                .Include(d => d.ItemMasterSpells)
                .Include(d => d.SpellCommand)
                .Where(x => x.RuleSetId == ruleSetId && x.IsDeleted != true).OrderBy(o => o.Name).ToList();

            if (spells == null) return spells;

            foreach (Spell spell in spells)
            {
                spell.ItemMasterSpells = spell.ItemMasterSpells.Where(p => p.IsDeleted != true).ToList();
                spell.SpellCommand = spell.SpellCommand.Where(p => p.IsDeleted != true).ToList();
            }

            return spells;
        }
        public List<Spell> Core_GetSpellsByRuleSetId(int ruleSetId, int ParentID)
        {
            var idsToRemove = _context.Spells.Where(p => (p.RuleSetId == ruleSetId) && p.ParentSpellId != null).Select(p => p.ParentSpellId).ToArray();

            var recsToRemove = _context.Spells.Where(p => idsToRemove.Contains(p.SpellId)).ToList();

            List<Spell> spells = _context.Spells.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == ParentID) && x.IsDeleted != true)
                .Except(recsToRemove)
                .Include(d => d.RuleSet)
                .Include(d => d.ItemMasterSpells)
                .Include(d => d.SpellCommand)
                .OrderBy(o => o.Name).ToList();

            if (spells == null) return spells;

            foreach (Spell spell in spells)
            {
                spell.ItemMasterSpells = spell.ItemMasterSpells.Where(p => p.IsDeleted != true).ToList();
                spell.SpellCommand = spell.SpellCommand.Where(p => p.IsDeleted != true).ToList();
            }

            return spells;
        }

        public Spell GetById(int? id)
        {
            var spell = _context.Spells
                .Include(d => d.RuleSet)
                .Include(d => d.ItemMasterSpells)
                .Include(d => d.SpellCommand)
                .Where(x => x.SpellId == id && x.IsDeleted != true)
                .FirstOrDefault();

            if (spell == null) return spell;

            spell.ItemMasterSpells = spell.ItemMasterSpells.Where(p => p.IsDeleted != true).ToList();
            spell.SpellCommand = spell.SpellCommand.Where(p => p.IsDeleted != true).ToList();

            return spell;
        }
        
        public async Task<Spell> Update(Spell spell)
        {
            var spellInDb = _context.Spells.FirstOrDefault(x => x.SpellId == spell.SpellId);

            if (spellInDb == null)
                return spellInDb;

            spellInDb.Name = spell.Name;
            spellInDb.School = spell.School;
            spellInDb.Class = spell.Class;
            spellInDb.Levels = spell.Levels;
            spellInDb.Command = spell.Command;
            spellInDb.CommandName = spell.CommandName;
            spellInDb.MaterialComponent = spell.MaterialComponent;
            spellInDb.IsMaterialComponent = spell.IsMaterialComponent;
            spellInDb.IsSomaticComponent = spell.IsSomaticComponent;
            spellInDb.IsVerbalComponent = spell.IsVerbalComponent;
            spellInDb.CastingTime = spell.CastingTime;
            spellInDb.Description = spell.Description;
            spellInDb.Stats = spell.Stats;
            spellInDb.HitEffect = spell.HitEffect;
            spellInDb.MissEffect = spell.MissEffect;
            spellInDb.EffectDescription = spell.EffectDescription;
            spellInDb.ShouldCast = spell.ShouldCast;
            spellInDb.ImageUrl = spell.ImageUrl;
            spellInDb.Memorized = spell.Memorized;
            spellInDb.Metatags = spell.Metatags;

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return spellInDb;
        }

        public int GetCountByRuleSetId(int ruleSetId)
        {
            return _context.Spells.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted != true).Count();
        }
        public int Core_GetCountByRuleSetId(int ruleSetId, int parentID)
        {
            //var idsToRemove = _context.Spells.Where(p => (p.RuleSetId == ruleSetId) && p.ParentSpellId != null).Select(p => p.ParentSpellId).ToArray();

            //var recsToRemove = _context.Spells.Where(p => idsToRemove.Contains(p.SpellId)).ToList();

            //var res = _context.Spells.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == parentID) && x.IsDeleted != true)
            //    .Except(recsToRemove);
            //return res.Count();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
           // string qry = "EXEC Ruleset_GetRecordCounts @RulesetID = '" + ruleSetId + "'";

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
                res.SpellCount = Convert.ToInt32(dt.Rows[0]["SpellCount"]);               
            }
            return res.SpellCount;
        }

        public async Task<bool> CheckDuplicateSpell(string value, int? ruleSetId, int? spellId = 0)
        {
            //var items = _repo.GetAll();
            //if (items.Result == null || items.Result.Count == 0) return false;
            //else if (ruleSetId > 0)
            //{
            //    return items.Result.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId  == ruleSetId && x.SpellId!= spellId && x.IsDeleted!=true).FirstOrDefault() == null ? false : true;
            //}
            //else
            //    return items.Result.Where(x => x.Name.ToLower() == value.ToLower() &&x.IsDeleted!=true).FirstOrDefault() == null ? false : true;

            if (ruleSetId > 0)
            {
                return _context.Spells.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.SpellId != spellId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            }
            else
                return _context.Spells.Where(x => x.Name.ToLower() == value.ToLower() && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        }

        public void ToggleMemorizedSpell(int Id)
        {
            var spellInDb = _context.Spells.FirstOrDefault(x => x.SpellId == Id);

            if (spellInDb == null)
                return;


            if (spellInDb.Memorized == true)
            {
                spellInDb.Memorized = false;
            }
            else if (spellInDb.Memorized == false)
            {
                spellInDb.Memorized = true;
            }

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<Spell> Core_CreateSpell(Spell spell)
        {
            spell.ParentSpellId = spell.SpellId;
            spell.SpellId = 0;
            return await _repo.Add(spell);
        }
        public bool Core_SpellWithParentIDExists(int spellID, int RulesetID)
        {
            if (_context.Spells.Where(x => x.SpellId == spellID && x.ParentSpellId != null && x.IsDeleted != true).Any())
            {
                return true;
            }
            else
            {
                var model = _context.Spells.Where(x => x.SpellId == spellID && x.ParentSpellId == null && x.IsDeleted != true);
                if (model.FirstOrDefault().RuleSetId == RulesetID)
                {
                    return true;
                }
            }
            return false;
        }

        public List<Spell> SP_GetSpellsByRuleSetId(int rulesetId, int page, int pageSize)
        {
            List<Spell> SpellList = new List<Spell>();
            RuleSet ruleset = new RuleSet();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Spell_GetByRulesetID @RulesetID = '" + rulesetId + "',@page='" + page + "',@size='" + pageSize + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Spell_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
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

                    _spell.RuleSet = ruleset;
                    SpellList.Add(_spell);
                }
            }

            return SpellList;
        }

        public List<SpellCommand> SP_GetSpellCommands(int spellId)
        {
            List<SpellCommand> _spellCommand = new List<SpellCommand>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            string qry = "EXEC Spell_GetSpellCommands @SpellId = '" + spellId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Spell_GetSpellCommands", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@SpellId", spellId);
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
                    SpellCommand _spellCmd = new SpellCommand();

                    _spellCmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _spellCmd.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"].ToString());
                    _spellCmd.SpellCommandId = row["SpellCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellCommandId"].ToString());
                    _spellCmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _spellCmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    _spellCommand.Add(_spellCmd);
                }
            }

            return _spellCommand;
        }
    }
}
