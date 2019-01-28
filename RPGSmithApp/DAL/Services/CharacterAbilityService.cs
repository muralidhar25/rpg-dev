using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class CharacterAbilityService : ICharacterAbilityService
    {
        private readonly IRepository<CharacterAbility> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public CharacterAbilityService(ApplicationDbContext context, IRepository<CharacterAbility> repo, IConfiguration configuration)
        {
            _context = context;
            _repo = repo;
            this._configuration = configuration;
        }

        public async Task<bool> DeleteCharacterAbility(int id)
        {
            var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "ability" && x.DefaultValue == id).ToList();
            foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
            {
                LRCCS.DefaultValue = 0;
                LRCCS.LinkType = "";
            }
            var ca= await _repo.Get(id);

            if (ca == null)
                return false;

            ca.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch(Exception ex)
            {
                throw ex;
               
            }

        }

        public bool DeleteCharacterAbilityNotAsync(int id)
        {
            var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "ability" && x.DefaultValue == id).ToList();
            foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
            {
                LRCCS.DefaultValue = 0;
                LRCCS.LinkType = "";
            }
            var ca = _context.CharacterAbilities.Where(x => x.CharacterAbilityId == id).SingleOrDefault();

            if (ca == null)
                return false;

            ca.IsDeleted = true;

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

        public List<CharacterAbility> GetByCharacterId(int characterId)
        {
            return _context.CharacterAbilities
                .Include(d => d.Character.RuleSet)
                .Include(d => d.Ability).ThenInclude(d=>d.AbilityCommand)
                  .Include(d => d.Character)
                .Where(x => x.CharacterId == characterId && x.IsDeleted!=true)
                .OrderBy(o => o.Ability.Name).ToList();
        }

        public List<CharacterAbility> GetByCharacterId(int characterId, int page, int pageSize)
        {
            return _context.CharacterAbilities
                .Include(d => d.Character.RuleSet)
                .Include(d => d.Ability).ThenInclude(d => d.AbilityCommand)
                  .Include(d => d.Character)
                .Where(x => x.CharacterId == characterId && x.IsDeleted!=true)
                .OrderBy(o => o.Ability.Name).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
        }

        public CharacterAbility GetById(int? id)
        {
            return _context.CharacterAbilities.Include(d => d.Character).Include(d => d.Ability).ThenInclude(d => d.AbilityCommand).FirstOrDefault(x => x.CharacterAbilityId == id && x.IsDeleted!=true);
        }

        public CharacterAbility GetByAbilityId(int abilityId)
        {
            return _context.CharacterAbilities.Include(d => d.Character).Include(d => d.Ability).ThenInclude(d => d.AbilityCommand)
                .FirstOrDefault(x => x.AbilityId == abilityId && x.IsDeleted != true);
        }

        public async Task<CharacterAbility> InsertCharacterAbility(CharacterAbility characterAbility)
        {
            return await _repo.Add(characterAbility);
        }

        public (bool, string) CheckCharacterAbilityExist(int characterId, int abilityId)
        {
            bool IsExist = _context.CharacterAbilities.Any(x => x.CharacterId == characterId && x.AbilityId == abilityId && x.IsDeleted!=true);
            string name = string.Empty;
            if (IsExist)
            {
                try
                {
                    name = _context.CharacterAbilities.Where(x => x.CharacterId == characterId && x.AbilityId == abilityId && x.IsDeleted != true).FirstOrDefault().Ability.Name;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                return (IsExist, name);
            }
            else return (false, name);
        }

        public async  Task<CharacterAbility> UpdateCharacterAbility(CharacterAbility characterAbility)
        {
            var ca = _context.CharacterAbilities.Find(characterAbility.CharacterAbilityId);

            if (ca == null)
                return characterAbility;
            try
            {
                ca.CharacterId  = characterAbility.CharacterId;
                ca.IsEnabled = characterAbility.IsEnabled;
                ca.AbilityId = characterAbility.AbilityId;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ca;
        }

        public List<CharacterAbility> GetAll()
        {
            return _context.CharacterAbilities
                .Include(d => d.Character)
                .Include(d => d.Ability)
                .Where(x=>x.IsDeleted!=true)
                .OrderBy(o => o.Ability.Name).ToList();
        }

        public int GetCountByCharacterId(int characterId)
        {
            return _context.CharacterAbilities.Where(x => x.CharacterId == characterId && x.IsDeleted!=true).Count();
        }

        public void ToggleEnableCharacterAbility(int id)
        {
            var ca = _context.CharacterAbilities.Find(id);

            if (ca == null)
                return ;
            try
            {
                if(ca.IsEnabled==true)
                {
                    ca.IsEnabled = false;
                }
                else if (ca.IsEnabled == false)
                {
                    ca.IsEnabled = true;
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

           
        }


        #region SP relate methods

        public (List<CharacterAbility>, Character, RuleSet) SP_CharacterAbility_GetByCharacterId(int characterId, int rulesetId, int page, int pageSize)
        {
            List<CharacterAbility> _CharacterAbilityList = new List<CharacterAbility>();
            RuleSet ruleset = new RuleSet();
            Character character = new Character();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC CharacterAbility_GetByCharacterId @CharacterId='" + characterId + "',@RulesetID='" + rulesetId + "',@page='" + page + "',@size='" + pageSize + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("CharacterAbility_GetByCharacterId", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterId", characterId);
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
            if (ds.Tables[2].Rows.Count > 0)
                character = _repo.GetCharacter(ds.Tables[2]);

            if (ds.Tables[0].Rows.Count > 0)
            {

                foreach (DataRow row in ds.Tables[0].Rows)
                {

                    CharacterAbility _characterAbility = new CharacterAbility();
                    _characterAbility.CharacterAbilityId = row["CharacterAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterAbilityId"].ToString());
                    _characterAbility.CharacterId = characterId;
                    _characterAbility.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"].ToString());
                    _characterAbility.CurrentNumberOfUses = row["CharacterCurrentNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterCurrentNumberOfUses"].ToString());
                    _characterAbility.MaxNumberOfUses = row["CharacterMaxNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterMaxNumberOfUses"].ToString());
                    _characterAbility.IsEnabled = row["CharacterIsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["CharacterIsEnabled"]);

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

                    _ability.RuleSet = ruleset;
                    _characterAbility.Ability = _ability;
                    //_characterAbility.Character = character;
                    _CharacterAbilityList.Add(_characterAbility);
                }
            }
            return (_CharacterAbilityList, character, ruleset);
        }


        #endregion
    }
}
