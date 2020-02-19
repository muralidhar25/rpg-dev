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
using DAL.ViewModelProc;
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class AbilityService : IAbilityService
    {
        private readonly IRepository<Ability> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public AbilityService(ApplicationDbContext context, IRepository<Ability> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            this._configuration = configuration;
        }

        public async Task<Ability> Create(Ability item, List<AbilityBuffAndEffect> AbilityBuffAndEffectVM)
        {
            //return await _repo.Add(item);

            item.AbilityBuffAndEffects = new List<AbilityBuffAndEffect>();
            var result = await _repo.Add(item);

            int abilityId = result.AbilityId;
            try
            {
                if (abilityId > 0)
                {

                    if (AbilityBuffAndEffectVM != null && AbilityBuffAndEffectVM.Count > 0)
                    {
                        //AssociatedBuffAndEffects.ForEach(a => a.ItemMasterId = ItemMasterId);
                        //AssociatedBuffAndEffects.ForEach(a => a.Id = 0);
                        List<AbilityBuffAndEffect> AssociatedBuffAndEffectsList = AbilityBuffAndEffectVM.Select(x => new AbilityBuffAndEffect()
                        {
                            BuffAndEffectId = x.BuffAndEffectId,
                        }).ToList();
                        foreach (var be in AssociatedBuffAndEffectsList)
                        {
                            _context.AbilityBuffAndEffects.Add(new AbilityBuffAndEffect() { BuffAndEffectId = be.BuffAndEffectId, AbilityId = abilityId });
                        }
                        //_context.ItemMasterBuffAndEffects.AddRange(AssociatedBuffAndEffectsList);// _repoMasterSpell.AddRange(AssociatedSpells);
                        _context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            { }

            result.AbilityBuffAndEffects = AbilityBuffAndEffectVM;
            return result;

        }

        public async  Task<bool> Delete(int id)
        {
            // Remove associated Commands
            var ac = _context.AbilityCommands.Where(x => x.AbilityId == id && x.IsDeleted !=true).ToList();

            foreach(AbilityCommand item in ac)
            {
                item.IsDeleted = true;
            }

            // Remove associated Buffs
            var abe = _context.AbilityBuffAndEffects.Where(x => x.AbilityId == id && x.IsDeleted != true).ToList();

            foreach (AbilityBuffAndEffect item in abe)
            {
                item.IsDeleted = true;
            }

            // Remove associated character ability

            var ca = _context.CharacterAbilities.Where(x => x.AbilityId == id && x.IsDeleted!=true).ToList();

            foreach (CharacterAbility  ca_item in ca)
            {
                ca_item.IsDeleted = true;
                var LinkedRecords_CharacterCharacterStats = _context.CharactersCharacterStats.Where(x => x.LinkType == "ability" && x.DefaultValue == ca_item.CharacterAbilityId).ToList();
                foreach (var LRCCS in LinkedRecords_CharacterCharacterStats)
                {
                    LRCCS.DefaultValue = 0;
                    LRCCS.LinkType = "";
                }
            }

            // Remove associated Items Master ability
            var ima = _context.ItemMasterAbilities.Where(x => x.AbilityId == id && x.IsDeleted!=true).ToList();

            foreach (ItemMasterAbility ima_item in ima)
            {
                ima_item.IsDeleted = true;
            }


            // Remove Ability
            var ability =await  _repo.Get(id);

            if (ability == null)
            return false;

            ability.IsDeleted = true;
               
            try
            {
                _context.SaveChanges();
                return true;
            }
            catch(Exception ex)
            {
                throw ex;
            }
           

            //  return await _repo.Remove(id);

         }

        public List<Ability> GetAll()
        {
            List<Ability> abilities = _context.Abilities
                 .Include(d => d.RuleSet)
                .Include(d => d.ItemMasterAbilities)
                .Include(d => d.AbilityCommand)
                .Include(d => d.AbilityBuffAndEffects).ThenInclude(d => d.BuffAndEffect)
                .Where(x => x.IsDeleted != true).OrderBy(o => o.Name).ToList();


            if (abilities == null) return abilities;

            foreach (Ability a in abilities)
            {
                a.ItemMasterAbilities = a.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
                a.AbilityCommand = a.AbilityCommand.Where(p => p.IsDeleted != true).ToList();
                a.AbilityBuffAndEffects = a.AbilityBuffAndEffects.Where(p => p.IsDeleted != true).ToList();
            }

            return abilities;
        }

        public Ability GetById(int? id)
        {
            Ability ability= _context.Abilities
                .Include(d=>d.RuleSet)
                .Include(d=>d.ItemMasterAbilities)
                .Include(d=>d.AbilityCommand)
                .Include(d => d.AbilityBuffAndEffects).ThenInclude(d => d.BuffAndEffect)
                .Where(x => x.AbilityId  == id && x.IsDeleted != true)
                .FirstOrDefault();

            if (ability == null) return ability;

            ability.ItemMasterAbilities = ability.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
            ability.AbilityCommand = ability.AbilityCommand.Where(p => p.IsDeleted != true).ToList();
            ability.AbilityBuffAndEffects = ability.AbilityBuffAndEffects.Where(p => p.IsDeleted != true).ToList();

            return ability;
        }
        public List<Ability> GetAbilitiesByRuleSetId_add_Old(int rulesetId)
        {
            List<Ability> abilityList = new List<Ability>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC AbilitiesByRuleSetId_add @RulesetID = '" + rulesetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("AbilitiesByRuleSetId_add", connection);

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
                    Ability _ability = new Ability();
                    _ability.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    _ability.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
                    _ability.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                    _ability.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _ability.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    _ability.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    _ability.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
                    _ability.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
                    _ability.Level = row["Level"] == DBNull.Value ? null : row["Level"].ToString();
                    _ability.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _ability.IsEnabled = row["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsEnabled"]);

                    _ability.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"].ToString());
                    _ability.ParentAbilityId = row["ParentAbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentAbilityId"].ToString());
                    _ability.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                    _ability.CurrentNumberOfUses = row["CurrentNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["CurrentNumberOfUses"].ToString());
                    _ability.MaxNumberOfUses = row["MaxNumberOfUses"] == DBNull.Value ? 0 : Convert.ToInt32(row["MaxNumberOfUses"].ToString());

                    abilityList.Add(_ability);
                }
            }
            return abilityList;
        }

        public List<AbilitySP> GetAbilitiesByRuleSetId_add(int rulesetId)
        {
            List<AbilitySP> abilityList = new List<AbilitySP>();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            string qry = "EXEC AbilitiesByRuleSetId_add @RulesetID='" + rulesetId + "'";
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    abilityList = connection.Query<AbilitySP>(qry).ToList();
                    //if (abilityrecord.Count>0)
                    //{
                    //    abilityList = abilityrecord;
                    //}
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
            return abilityList;
        }

        public List<Ability> GetAbilitiesByRuleSetId(int ruleSetId)
        {
            List<Ability> abilities= _context.Abilities
                .Include(d => d.RuleSet)
                .Include(d => d.ItemMasterAbilities)
                .Include(d => d.AbilityCommand)
                .Include(d => d.AbilityBuffAndEffects).ThenInclude(d => d.BuffAndEffect)
                .Where(x => x.RuleSetId == ruleSetId && x.IsDeleted!=true)
                .OrderBy(o => o.Name).ToList();

            if (abilities == null) return abilities;

            foreach (Ability a in abilities)
            {
                a.ItemMasterAbilities = a.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
                a.AbilityCommand = a.AbilityCommand.Where(p => p.IsDeleted != true).ToList();
                a.AbilityBuffAndEffects = a.AbilityBuffAndEffects.Where(p => p.IsDeleted != true).ToList();
            }

            return abilities;
        }
        public List<Ability> Core_GetAbilitiesByRuleSetId(int ruleSetId,int parentID)
        {
            var idsToRemove = _context.Abilities.Where(p => (p.RuleSetId == ruleSetId) && p.ParentAbilityId != null ).Select(p => p.ParentAbilityId).ToArray();

            var recsToRemove = _context.Abilities.Where(p => idsToRemove.Contains(p.AbilityId)).ToList();

            var res = _context.Abilities.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == parentID) && x.IsDeleted != true)
                .Except(recsToRemove);
            List<Ability> abilities = _context.Abilities.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == parentID) && x.IsDeleted != true)
                .Except(recsToRemove)
                .Include(d => d.RuleSet)
                .Include(d => d.ItemMasterAbilities)
                .Include(d => d.AbilityCommand)
                .Include(d => d.AbilityBuffAndEffects).ThenInclude(d => d.BuffAndEffect)

                .OrderBy(o => o.Name).ToList();

            if (abilities == null) return abilities;

            foreach (Ability a in abilities)
            {
                a.ItemMasterAbilities = a.ItemMasterAbilities.Where(p => p.IsDeleted != true).ToList();
                a.AbilityCommand = a.AbilityCommand.Where(p => p.IsDeleted != true).ToList();
                a.AbilityBuffAndEffects = a.AbilityBuffAndEffects.Where(p => p.IsDeleted != true).ToList();
            }

            return abilities;
        }
        public async Task<Ability> Update(Ability item, List<AbilityBuffAndEffect> AbilityBuffAndEffectVM, bool IsFromCharacter = false)
        {
            var ability = _context.Abilities.FirstOrDefault(x => x.AbilityId == item.AbilityId);

            if (ability == null)
                return ability;

            ability.Name = item.Name;
            ability.Level = item.Level;
            ability.Command = item.Command;
            ability.CommandName = item.CommandName;
            ability.Description = item.Description;
            ability.gmOnly = item.gmOnly;
            ability.Stats = item.Stats;
            ability.ImageUrl = item.ImageUrl;
            ability.IsEnabled = item.IsEnabled;
            ability.Metatags = item.Metatags;

            if (!IsFromCharacter)
            {
                ability.MaxNumberOfUses = item.MaxNumberOfUses;
                ability.CurrentNumberOfUses = item.CurrentNumberOfUses;
            }

            _context.AbilityBuffAndEffects.RemoveRange(_context.AbilityBuffAndEffects.Where(x => x.AbilityId == item.AbilityId));
            try
            {
                _context.SaveChanges();

                List<AbilityBuffAndEffect> listbuffs = new List<AbilityBuffAndEffect>();
                foreach (var be in AbilityBuffAndEffectVM)
                {
                    AbilityBuffAndEffect obj = new AbilityBuffAndEffect()
                    {
                        BuffAndEffectId = be.BuffAndEffectId,
                        AbilityId = item.AbilityId
                    };
                    listbuffs.Add(obj);
                }
                //SpellBuffAndEffectVM.ForEach(a => a.SpellId = spell.SpellId);
                _context.AbilityBuffAndEffects.AddRange(listbuffs);
                _context.SaveChanges();
                ability.AbilityBuffAndEffects = listbuffs;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ability;
        }

        public int GetCountByRuleSetId(int ruleSetId)
        {
            return _context.Abilities.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted!=true).Count();
        }
        public int Core_GetCountByRuleSetId_Old(int ruleSetId,int parentID)
        {
            //var idsToRemove = _context.Abilities.Where(p => (p.RuleSetId == ruleSetId) && p.ParentAbilityId != null).Select(p => p.ParentAbilityId).ToArray();

            //var recsToRemove = _context.Abilities.Where(p => idsToRemove.Contains(p.AbilityId)).ToList();

            //var res = _context.Abilities.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == parentID) && x.IsDeleted != true)
            //    .Except(recsToRemove);
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
                res.AbilityCount = Convert.ToInt32(dt.Rows[0]["AbilityCount"]);                
            }
            return res.AbilityCount;
        }

        public int Core_GetCountByRuleSetId(int ruleSetId, int parentID)
        {
            SP_RulesetRecordCount res = new SP_RulesetRecordCount();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            string qry = "EXEC Ruleset_GetRecordCounts @RulesetID = '" + ruleSetId + "'";
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    var rulesetrecord = connection.Query<SP_RulesetRecordCount>(qry).FirstOrDefault();
                    if (rulesetrecord != null)
                    {
                        res.AbilityCount = rulesetrecord.AbilityCount;
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

            return res.AbilityCount;
        }

        public async Task<bool> CheckDuplicateAbility(string value, int? ruleSetId,int? abilityId=0)
        {
            //var items = _repo.GetAll();
            //if (items.Result == null || items.Result.Count == 0) return false;
            //else if (ruleSetId > 0)
            //{
            //    return items.Result.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.AbilityId!=abilityId && x.IsDeleted!=true).FirstOrDefault() == null ? false : true;
            //}
            //else
            //    return items.Result.Where(x => x.Name.ToLower() == value.ToLower()).FirstOrDefault() == null ? false : true;
           
            if (ruleSetId > 0)
            {
                return _context.Abilities.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.AbilityId != abilityId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            }
            else
                return _context.Abilities.Where(x => x.Name.ToLower() == value.ToLower()).FirstOrDefault() == null ? false : true;
        }

        public void ToggleEnableAbility(int Id)
        {
            var ability = _context.Abilities.FirstOrDefault(x => x.AbilityId == Id);

            if (ability == null)
                return;


            if (ability.IsEnabled == true)
            {
                ability.IsEnabled = false;
            }
            else if (ability.IsEnabled == false)
            {
                ability.IsEnabled = true;
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
        public bool Core_AbilityWithParentIDExists(int abilityId,int RulesetID) {
            if (_context.Abilities.Where(x => x.AbilityId == abilityId && x.ParentAbilityId != null && x.IsDeleted != true).Any())
            {
                return true;
            }
            else
            {
                var model = _context.Abilities.Where(x => x.AbilityId == abilityId && x.ParentAbilityId == null && x.IsDeleted != true);
                if (model.FirstOrDefault().RuleSetId == RulesetID)
                {
                    return true;
                }
            }
            return false;
        }
        public async Task<Ability> Core_CreateAbility(Ability ability, List<AbilityBuffAndEffect> AbilityBuffAndEffectVM) {
            ability.ParentAbilityId = ability.AbilityId;
            ability.AbilityId = 0;

            ability.AbilityBuffAndEffects = new List<AbilityBuffAndEffect>();
            await _repo.Add(ability);

            int abilityID = ability.AbilityId;
            if (abilityID > 0)
            {

                if (AbilityBuffAndEffectVM != null && AbilityBuffAndEffectVM.Count > 0)
                {
                    //AssociatedBuffAndEffects.ForEach(a => a.ItemMasterId = ItemMasterId);
                    //_context.ItemMasterBuffAndEffects.AddRange(AssociatedBuffAndEffects);
                    //_context.SaveChanges();


                    List<AbilityBuffAndEffect> listbuffs = new List<AbilityBuffAndEffect>();
                    foreach (var item in AbilityBuffAndEffectVM)
                    {
                        AbilityBuffAndEffect obj = new AbilityBuffAndEffect()
                        {
                            BuffAndEffectId = item.BuffAndEffectId,
                            AbilityId = ability.AbilityId
                        };
                        listbuffs.Add(obj);
                    }
                    //SpellBuffAndEffectVM.ForEach(a => a.SpellId = spell.SpellId);
                    _context.AbilityBuffAndEffects.AddRange(listbuffs);
                    _context.SaveChanges();
                    ability.AbilityBuffAndEffects = listbuffs;
                }
            }
            return ability;
        }

        public List<Ability> SP_GetAbilityByRuleSetId_Old(int rulesetId, int page, int pageSize)
        {
            List<Ability> _abilityList = new List<Ability>();
            RuleSet ruleset = new RuleSet();
            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Ability_GetByRulesetID @RulesetID = '" + rulesetId + "',@page='" + page + "',@size='" + pageSize + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Ability_GetByRulesetID", connection);

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
                    Ability _ability = new Ability();
                    _ability.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    _ability.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
                    _ability.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                    _ability.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _ability.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    _ability.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    _ability.gmOnly = row["gmOnly"] == DBNull.Value ? null : row["gmOnly"].ToString();
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
                    _abilityList.Add(_ability);
                }
            }
            return _abilityList;
        }
        
        public List<AbilitySP> SP_GetAbilityByRuleSetId(int rulesetId, int page, int pageSize)
        {
            List<AbilitySP> _abilityList = new List<AbilitySP>();
            RuleSet _ruleset = new RuleSet();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            string qry = "EXEC Ability_GetByRulesetID @RulesetID = '" + rulesetId + "',@page = '" + page + "',@size = '" + pageSize + "'";
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    var abilityrecord = connection.QueryMultiple(qry);
                    _abilityList = abilityrecord.Read<AbilitySP>().ToList();
                    _ruleset = abilityrecord.Read<RuleSet>().FirstOrDefault();
                    _abilityList.ForEach(x => x.RuleSet = _ruleset);
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

            return _abilityList;
        }

        public AbilityAssociatedRecords SP_GetAbilityCommands_Old(int abilityId, int RuleSetID)
        {
            
            AbilityAssociatedRecords result = new AbilityAssociatedRecords();
            List<AbilityCommand> _abilityCommand = new List<AbilityCommand>();
            List<BuffAndEffect> _BuffAndEffects = new List<BuffAndEffect>();
            List<BuffAndEffect> _selectedBuffAndEffects = new List<BuffAndEffect>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            // string qry = "EXEC Ability_GetAbilityCommands @AbilityId = '" + abilityId + "'";
            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Ability_GetAbilityCommands", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@AbilityId", abilityId);
                command.Parameters.AddWithValue("@RulesetID", RuleSetID);
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
                    AbilityCommand _cmd = new AbilityCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"].ToString());
                    _cmd.AbilityCommandId = row["AbilityCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    _abilityCommand.Add(_cmd);
                }
            }
            if (ds.Tables[1].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    _BuffAndEffects.Add(i);/////////
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

                    _selectedBuffAndEffects.Add(i);///////
                }
            }

            result.AbilityCommands = _abilityCommand;
            result.BuffAndEffectsList = _BuffAndEffects;
            result.SelectedBuffAndEffects = _selectedBuffAndEffects;
            return result;
           // return _abilityCommand;
        }

        public AbilityAssociatedRecords SP_GetAbilityCommands(int abilityId, int RuleSetID)
        {
            AbilityAssociatedRecords result = new AbilityAssociatedRecords();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            string qry = "Exec Ability_GetAbilityCommands @AbilityId ='" + abilityId + "',@RulesetID='" + RuleSetID + "'";

            using (SqlConnection Connection = new SqlConnection(connectionString))
            {
                try
                {
                    Connection.Open();
                    var abilityrecord = Connection.QueryMultiple(qry);
                    if (abilityrecord != null)
                    {
                        result.AbilityCommands = abilityrecord.Read<AbilityCommand>().ToList();
                        result.BuffAndEffectsList = abilityrecord.Read<BuffAndEffect>().ToList();
                        result.SelectedBuffAndEffects = abilityrecord.Read<BuffAndEffect>().ToList();
                    }
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    Connection.Close();
                }
            }
            return result;
        }
        public void DeleteMultiAbilities(List<Ability> model, int rulesetId) {
            int index = 0;
            List<numbersList> dtList = model.Select(x => new numbersList()
            {
                RowNum = index = Getindex(index),
                Number = x.AbilityId
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
            SqlCommand cmd = new SqlCommand("Ruleset_DeleteMultiAbilities", con);
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
    
    }
}
