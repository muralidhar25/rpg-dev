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
   public class CharacterSpellService : ICharacterSpellService
    {
        private readonly IRepository<CharacterSpell> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public CharacterSpellService(ApplicationDbContext context, IRepository<CharacterSpell> repo, IConfiguration configuration)
        {
            _context = context;
            _repo = repo;
            this._configuration = configuration;
        }
        
        public async Task<bool> DeleteCharacterSpell(int id)
        {
            var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "spell" && x.DefaultValue == id).ToList();
            foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
            {
                LRCCS.DefaultValue = 0;
                LRCCS.LinkType = "";
            }
            var cs = await _repo.Get(id);

            if (cs == null)
                return false;

            cs.IsDeleted = true;

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

        public bool DeleteCharacterSpellNotAsync(int id)
        {
            var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "spell" && x.DefaultValue == id).ToList();
            foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
            {
                LRCCS.DefaultValue = 0;
                LRCCS.LinkType = "";
            }
            var cs = _context.CharacterSpells.Where(x => x.CharacterSpellId  == id).SingleOrDefault();

            if (cs == null)
                return false;

            cs.IsDeleted = true;

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

        public List<CharacterSpell> GetByCharacterId(int characterId)
        {
            return _context.CharacterSpells
                .Include(d => d.Character.RuleSet)
                .Include(d => d.Spell).ThenInclude(d=>d.SpellCommand)
                .Include(d=>d.Character)
                .Where(x => x.CharacterId == characterId && x.IsDeleted!=true)
                .OrderBy(o => o.Spell.Name).ToList();
        }
        public List<CharacterSpell> GetSpellByCharacterId(int characterId) {
            return _context.CharacterSpells              
                .Include(d => d.Spell)
                .Where(x => x.CharacterId == characterId && x.IsDeleted != true)
                .OrderBy(o => o.Spell.Name).ToList();
        }
        public List<CharacterSpell> GetByCharacterId(int characterId, int page, int pageSize)
        {
            return _context.CharacterSpells
                .Include(d => d.Character.RuleSet)
                .Include(d => d.Spell).ThenInclude(d => d.SpellCommand)
                  .Include(d => d.Character)
                .Where(x => x.CharacterId == characterId && x.IsDeleted != true)
                .OrderBy(o => o.Spell.Name).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
        }

        public CharacterSpell GetById(int? id)
        {
            return _context.CharacterSpells
                .Include(d => d.Character).ThenInclude(d => d.RuleSet)
                .Include(d => d.Spell).ThenInclude(d => d.SpellCommand)
                .Include(d => d.Spell).ThenInclude(d => d.SpellBuffAndEffects).ThenInclude(d => d.BuffAndEffect)
                .FirstOrDefault(x => x.CharacterSpellId == id && x.IsDeleted!=true);
        }

        public CharacterSpell GetBySpellId(int spellId)
        {
            return _context.CharacterSpells
                .Include(d => d.Character)
                .Include(d => d.Spell).ThenInclude(d => d.SpellCommand)
                .FirstOrDefault(x => x.SpellId == spellId && x.IsDeleted != true);
        }

        public async Task<CharacterSpell> InsertCharacterSpell(CharacterSpell characterSpell)
        {
            return await _repo.Add(characterSpell);
        }
        
        public (bool, string) CheckCharacterSpellExist(int characterId, int spellId)
        {
            bool IsExist = _context.CharacterSpells.Any(x => x.CharacterId == characterId && x.SpellId == spellId && x.IsDeleted!=true);
            string name = string.Empty;
            if (IsExist)
            {
                try
                {
                    name = _context.CharacterSpells.Where(x => x.CharacterId == characterId && x.SpellId == spellId && x.IsDeleted!=true).Include(x=>x.Spell).FirstOrDefault().Spell.Name;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                return (IsExist, name);
            }
            else return (false, name);
        }

        public async Task<CharacterSpell> UpdateCharacterSpell(CharacterSpell characterSpell)
        {
            var cs = _context.CharacterSpells.Find(characterSpell.CharacterSpellId);

            if (cs == null)
                return characterSpell;
            try
            {
                cs.CharacterId = characterSpell.CharacterId;
                cs.IsMemorized = characterSpell.IsMemorized;
                cs.SpellId = characterSpell.SpellId;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return cs;
        }

        public List<CharacterSpell> GetAll()
        {
            return _context.CharacterSpells
                .Include(d => d.Character)
                .Include(d => d.Spell)
                .Where(x=>x.IsDeleted!=true)
                .OrderBy(o => o.Spell.Name).ToList();
        }

        public int GetCountByCharacterId(int characterId)
        {
            return _context.CharacterSpells.Where(x => x.CharacterId == characterId && x.IsDeleted!=true).Count();
        }

        public void ToggleMemorizedCharacterSpell(int id)
        {
            var cs = _context.CharacterSpells.Find(id);

            if (cs == null)
                return;
            try
            {
                if (cs.IsMemorized == true)
                {
                    cs.IsMemorized = false;
                }
                else if (cs.IsMemorized == false)
                {
                    cs.IsMemorized = true;
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }

        #region SP relate methods

        public (List<CharacterSpell>, Character, RuleSet) SP_CharacterSpell_GetByCharacterId(int characterId, int rulesetId, int page, int pageSize, int sortType = 1)
        {
            List<CharacterSpell> _CharacterSpellList = new List<CharacterSpell>();
            RuleSet ruleset = new RuleSet();
            Character character = new Character();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC CharacterSpell_GetByCharacterId @CharacterId='" + characterId + "',@RulesetID='" + rulesetId + "',@page='" + page + "',@size='" + pageSize + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("CharacterSpell_GetByCharacterId", connection);

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

                    CharacterSpell _characterSpell = new CharacterSpell();
                    _characterSpell.CharacterSpellId = row["CharacterSpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterSpellId"].ToString());
                    _characterSpell.CharacterId = characterId;
                    _characterSpell.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"].ToString());
                    _characterSpell.IsMemorized = row["CharacterIsMemorized"] == DBNull.Value ? false : Convert.ToBoolean(row["CharacterIsMemorized"]);
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

                    _spell.RuleSet = ruleset;
                    _characterSpell.Spell = _spell;
                    //_characterSpell.Character = character;
                    _CharacterSpellList.Add(_characterSpell);
                }
            }
            return (_CharacterSpellList, character, ruleset);
        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }
        public void removeMultiSpells(List<CharacterSpell> model, int rulesetId)
        {
            int index = 0;
            List<numbersList> dtList = model.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number =x.CharacterSpellId
            }).ToList();


            DataTable DT_List = new DataTable();

            if (dtList.Count > 0)
            {
                DT_List = utility.ToDataTable<numbersList>(dtList);
            }


            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            int rowseffectesd = 0;
            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            SqlCommand cmd = new SqlCommand("Character_DeleteMultiSpells", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@RecordIdsList", DT_List);
            cmd.Parameters.AddWithValue("@RulesetID", rulesetId);

            rowseffectesd = cmd.ExecuteNonQuery();
            con.Close();
        }

        #endregion
    }
}
