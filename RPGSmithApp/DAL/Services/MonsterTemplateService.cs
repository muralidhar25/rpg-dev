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
    public class MonsterTemplateService : IMonsterTemplateService
    {
        private readonly IRepository<MonsterTemplate> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IItemMasterService _itemMasterService;
        public MonsterTemplateService(ApplicationDbContext context, IRepository<MonsterTemplate> repo, IConfiguration configuration, IItemMasterService itemMasterService)
        {
            _repo = repo;
            _context = context;
            this._configuration = configuration;
            this._itemMasterService = itemMasterService;
        }

        public async Task<MonsterTemplate> Create(MonsterTemplate item)
        {
            return await _repo.Add(item);
        }
        public async Task<bool> DeleteMonster(int monsterId)
        {
            var monsterItems = _context.ItemMasterMonsterItems.Where(x => x.MonsterId == monsterId).ToList();
            foreach (var item in monsterItems)
            {
                item.IsDeleted = true;
            }
            var monster = _context.Monsters.Where(x => x.MonsterId == monsterId).FirstOrDefault();
            if (monster!=null)
            {
                monster.IsDeleted = true;
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
        public async Task<bool> Delete(int id)
        {
            // Remove associated Commands
            var MTC = _context.MonsterTemplateCommands.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateCommand item in MTC)
            {
                item.IsDeleted = true;
            }

            // Remove deployed Monsters
            var m = _context.Monsters.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (Monster item in m)
            {
                item.IsDeleted = true;
            }

            // Remove associated Buffs
            var mtbe = _context.MonsterTemplateBuffAndEffects.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateBuffAndEffect item in mtbe)
            {
                item.IsDeleted = true;
            }

            // Remove associated Ability
            var mta = _context.MonsterTemplateAbilities.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateAbility item in mta)
            {
                item.IsDeleted = true;
            }

            // Remove associated Spell
            var mts = _context.MonsterTemplateSpells.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateSpell item in mts)
            {
                item.IsDeleted = true;
            }

            // Remove associated monsterTemplates
            var mtm = _context.MonsterTemplateMonsters.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateMonster item in mtm)
            {
                item.IsDeleted = true;
            }

            // Remove Itemmasters
            var mti = _context.MonsterTemplateItemMasters.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

            foreach (MonsterTemplateItemMaster item in mti)
            {
                item.IsDeleted = true;
            }

            // Remove Monster Template
            var monsterTemplate = await _repo.Get(id);

            if (monsterTemplate == null)
                return false;

            monsterTemplate.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }


            //  return await _repo.Remove(id);

        }



        public MonsterTemplate GetById(int? id)
        {
            MonsterTemplate monsterTemplate = _context.MonsterTemplates
                .Include(d => d.RuleSet)
                .Include(d => d.MonsterTemplateCommands)
                //.Include(d => d.MonsterTemplateAbilities)
                //.Include(d => d.MonsterTemplateSpells)
                //.Include(d => d.MonsterTemplateBuffAndEffects)
                //.Include(d => d.MonsterTemplateMonsters)
                //.Include(d => d.MonsterTemplateItemMasters)
                .Where(x => x.MonsterTemplateId == id && x.IsDeleted != true)

                .FirstOrDefault();

            if (monsterTemplate == null) return monsterTemplate;

            monsterTemplate.MonsterTemplateCommands = monsterTemplate.MonsterTemplateCommands.Where(p => p.IsDeleted != true).ToList();

            return monsterTemplate;
        }
        public Monster GetMonsterById(int? id,bool IsGettingDetailsForDetailScreenAPI) {
            Monster monster =   _context.Monsters
                .Include(d => d.RuleSet).Include(d => d.MonsterTemplate)   
                .Where(x => x.MonsterId == id && x.IsDeleted != true).FirstOrDefault();

            if (monster == null) return monster;

            if (IsGettingDetailsForDetailScreenAPI)
            {
                monster.MonsterTemplate.Command = monster.Command;
                monster.MonsterTemplate.CommandName = monster.CommandName;
                monster.MonsterTemplate.Description = monster.Description;
                monster.MonsterTemplate.InitiativeCommand = monster.InitiativeCommand;
                monster.MonsterTemplate.Stats = monster.Stats;
            }

            



            return monster;
        }


        public async Task<MonsterTemplate> Update(MonsterTemplate item,
            List<MonsterTemplateAbility> MonsterTemplateAbilityVM,
            List<MonsterTemplateMonster> MonsterTemplateMonsterVM,
            List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM,
            List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM,
            List<MonsterTemplateSpell> MonsterTemplateSpellVM,bool IsFromMonsterTemplateScreen = true)
        {
            var monsterTemplate = _context.MonsterTemplates.FirstOrDefault(x => x.MonsterTemplateId == item.MonsterTemplateId);

            if (monsterTemplate == null)
                return monsterTemplate;

            if (IsFromMonsterTemplateScreen)
            {
                monsterTemplate.Name = item.Name;
                monsterTemplate.ImageUrl = item.ImageUrl;
                monsterTemplate.Metatags = item.Metatags;
            }
            

            monsterTemplate.Command = item.Command;
            monsterTemplate.CommandName = item.CommandName;
            monsterTemplate.Description = item.Description;
            monsterTemplate.Stats = item.Stats;
           

           

            monsterTemplate.ArmorClass = item.ArmorClass;
            monsterTemplate.ChallangeRating = item.ChallangeRating;
            monsterTemplate.XPValue = item.XPValue;
            monsterTemplate.Health = item.Health;
            monsterTemplate.InitiativeCommand = item.InitiativeCommand;
            monsterTemplate.IsRandomizationEngine = item.IsRandomizationEngine;


            //try
            //{
            //    _context.SaveChanges();
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}
            _context.MonsterTemplateAbilities.RemoveRange(_context.MonsterTemplateAbilities.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            _context.MonsterTemplateSpells.RemoveRange(_context.MonsterTemplateSpells.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            _context.MonsterTemplateBuffAndEffects.RemoveRange(_context.MonsterTemplateBuffAndEffects.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            _context.MonsterTemplateMonsters.RemoveRange(_context.MonsterTemplateMonsters.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            if (IsFromMonsterTemplateScreen)
            {
                _context.MonsterTemplateItemMasters.RemoveRange(_context.MonsterTemplateItemMasters.Where(x => x.MonsterTemplateId == item.MonsterTemplateId));
            }
            
            try
            {
                _context.SaveChanges();

                List<MonsterTemplateAbility> Alist = new List<MonsterTemplateAbility>();
                foreach (var be in MonsterTemplateAbilityVM)
                {
                    MonsterTemplateAbility obj = new MonsterTemplateAbility()
                    {
                        AbilityId = be.AbilityId,
                        MonsterTemplateId = item.MonsterTemplateId
                    };
                    Alist.Add(obj);
                }                
                _context.MonsterTemplateAbilities.AddRange(Alist);

                List<MonsterTemplateSpell> Slist = new List<MonsterTemplateSpell>();
                foreach (var be in MonsterTemplateSpellVM)
                {
                    MonsterTemplateSpell obj = new MonsterTemplateSpell()
                    {
                        SpellId = be.SpellId,
                        MonsterTemplateId = item.MonsterTemplateId
                    };
                    Slist.Add(obj);
                }
                _context.MonsterTemplateSpells.AddRange(Slist);

                List<MonsterTemplateBuffAndEffect> Blist = new List<MonsterTemplateBuffAndEffect>();
                foreach (var be in MonsterTemplateBuffAndEffectVM)
                {
                    MonsterTemplateBuffAndEffect obj = new MonsterTemplateBuffAndEffect()
                    {
                        BuffAndEffectId = be.BuffAndEffectId,
                        MonsterTemplateId = item.MonsterTemplateId
                    };
                    Blist.Add(obj);
                }
                _context.MonsterTemplateBuffAndEffects.AddRange(Blist);

                List<MonsterTemplateMonster> Mlist = new List<MonsterTemplateMonster>();
                foreach (var be in MonsterTemplateMonsterVM)
                {
                    MonsterTemplateMonster obj = new MonsterTemplateMonster()
                    {
                        AssociateMonsterTemplateId = be.AssociateMonsterTemplateId,
                        MonsterTemplateId = item.MonsterTemplateId
                    };
                    Mlist.Add(obj);
                }
                _context.MonsterTemplateMonsters.AddRange(Mlist);

                
                if (IsFromMonsterTemplateScreen)
                {
                    List<MonsterTemplateItemMaster> Ilist = new List<MonsterTemplateItemMaster>();
                    foreach (var be in MonsterTemplateItemMasterVM)
                    {
                        MonsterTemplateItemMaster obj = new MonsterTemplateItemMaster()
                        {
                            ItemMasterId = be.ItemMasterId,
                            MonsterTemplateId = item.MonsterTemplateId,
                            Qty = be.Qty
                        };
                        Ilist.Add(obj);
                    }
                    _context.MonsterTemplateItemMasters.AddRange(Ilist);
                    _context.SaveChanges();
                }
                
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return monsterTemplate;
        }

        public async Task<Monster> UpdateMonster(Monster model,
            List<MonsterTemplateAbility> monsterAbilityVM,
            List<MonsterTemplateMonster> monsterAssociateMonsterVM,
            List<MonsterTemplateBuffAndEffect> monsterBuffAndEffectVM,
            List<MonsterTemplateSpell> monsterSpellVM,
            List<MonsterTemplateCommand> monsterCommandVM)
        {
            //return null;
            var item = GetMonsterById(model.MonsterId,false);
            if (item == null) return model;

            item.Name = model.Name;
            item.ImageUrl = model.ImageUrl;
            item.Metatags = model.Metatags;
            item.HealthCurrent = model.HealthCurrent;
            item.HealthMax = model.HealthMax;
            item.ArmorClass = model.ArmorClass;
            item.XPValue = model.XPValue;
            item.ChallangeRating = model.ChallangeRating;

            item.Command = model.Command;
            item.CommandName = model.CommandName;
            item.Description = model.Description;
            item.InitiativeCommand = model.InitiativeCommand;
            item.Stats = model.Stats;


            //try
            //{
            //    _context.SaveChanges();
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}
            _context.MonsterAbilitys.RemoveRange(_context.MonsterAbilitys.Where(x => x.MonsterId == item.MonsterId));
            _context.MonsterSpells.RemoveRange(_context.MonsterSpells.Where(x => x.MonsterId == item.MonsterId));
            _context.MonsterBuffAndEffects.RemoveRange(_context.MonsterBuffAndEffects.Where(x => x.MonsterId == item.MonsterId));
            _context.MonsterMonsters.RemoveRange(_context.MonsterMonsters.Where(x => x.MonsterId == item.MonsterId));
            _context.MonsterCommands.RemoveRange(_context.MonsterCommands.Where(x => x.MonsterId == item.MonsterId));
            try
            {
                _context.SaveChanges();

                List<MonsterAbility> Alist = new List<MonsterAbility>();
                foreach (var be in monsterAbilityVM)
                {
                    MonsterAbility obj = new MonsterAbility()
                    {
                        AbilityId = be.AbilityId,
                        MonsterId = item.MonsterId
                    };
                    Alist.Add(obj);
                }
                _context.MonsterAbilitys.AddRange(Alist);

                List<MonsterSpell> Slist = new List<MonsterSpell>();
                foreach (var be in monsterSpellVM)
                {
                    MonsterSpell obj = new MonsterSpell()
                    {
                        SpellId = be.SpellId,
                        MonsterId = item.MonsterId
                    };
                    Slist.Add(obj);
                }
                _context.MonsterSpells.AddRange(Slist);

                List<MonsterBuffAndEffect> Blist = new List<MonsterBuffAndEffect>();
                foreach (var be in monsterBuffAndEffectVM)
                {
                    MonsterBuffAndEffect obj = new MonsterBuffAndEffect()
                    {
                        BuffAndEffectId = be.BuffAndEffectId,
                        MonsterId = item.MonsterId
                    };
                    Blist.Add(obj);
                }
                _context.MonsterBuffAndEffects.AddRange(Blist);

                List<MonsterMonster> Mlist = new List<MonsterMonster>();
                foreach (var be in monsterAssociateMonsterVM)
                {
                    MonsterMonster obj = new MonsterMonster()
                    {
                        AssociateMonsterId = be.AssociateMonsterTemplateId,
                        MonsterId = item.MonsterId
                    };
                    Mlist.Add(obj);
                }
                _context.MonsterMonsters.AddRange(Mlist);

                List<MonsterCommand> Clist = new List<MonsterCommand>();
                foreach (var be in monsterCommandVM)
                {
                    MonsterCommand obj = new MonsterCommand()
                    {
                        Command = be.Command,
                        Name = be.Name,
                        MonsterId = item.MonsterId
                    };
                    Clist.Add(obj);
                }
                _context.MonsterCommands.AddRange(Clist);


                
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return model;
        }

        public int GetCountByRuleSetId(int ruleSetId)
        {
            return _context.MonsterTemplates.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted != true).Count();
        }
        public int Core_GetCountByRuleSetId(int ruleSetId, int parentID)
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
                res.MonsterTemplateCount = Convert.ToInt32(dt.Rows[0]["MonsterTemplateCount"]);
            }
            return res.MonsterTemplateCount;
        }

        public async Task<bool> CheckDuplicateMonsterTemplate(string value, int? ruleSetId, int? monsterTemplateId = 0)
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
                return _context.MonsterTemplates.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.MonsterTemplateId != monsterTemplateId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
            }
            else
                return _context.MonsterTemplates.Where(x => x.Name.ToLower() == value.ToLower()).FirstOrDefault() == null ? false : true;
        }


        public bool Core_MonsterTemplateWithParentIDExists(int monsterTemplateId, int RulesetID)
        {
            if (_context.MonsterTemplates.Where(x => x.MonsterTemplateId == monsterTemplateId && x.ParentMonsterTemplateId != null && x.IsDeleted != true).Any())
            {
                return true;
            }
            else
            {
                var model = _context.MonsterTemplates.Where(x => x.MonsterTemplateId == monsterTemplateId && x.ParentMonsterTemplateId == null && x.IsDeleted != true);
                if (model.FirstOrDefault().RuleSetId == RulesetID)
                {
                    return true;
                }
            }
            return false;
        }
        public async Task<MonsterTemplate> Core_CreateMonsterTemplate(MonsterTemplate monsterTemplate)
        {
            monsterTemplate.ParentMonsterTemplateId = monsterTemplate.MonsterTemplateId;
            monsterTemplate.MonsterTemplateId = 0;
            return await _repo.Add(monsterTemplate);
        }

        public List<MonsterTemplate_Bundle> SP_GetMonsterTemplateByRuleSetId(int rulesetId, int page, int pageSize, int sortType = 1)
        {
            List<MonsterTemplate_Bundle> _monsterTemplateList = new List<MonsterTemplate_Bundle>();
            RuleSet ruleset = new RuleSet();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("MonsterTemplate_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.Parameters.AddWithValue("@SortType", sortType);
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
                    MonsterTemplate_Bundle _MonsterTemplate = new MonsterTemplate_Bundle();
                    _MonsterTemplate.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    _MonsterTemplate.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
                    _MonsterTemplate.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
                    _MonsterTemplate.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _MonsterTemplate.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    _MonsterTemplate.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    _MonsterTemplate.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
                    
                    _MonsterTemplate.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    
                    
                    _MonsterTemplate.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString());
                    _MonsterTemplate.ParentMonsterTemplateId = row["ParentMonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentMonsterTemplateId"].ToString());
                    _MonsterTemplate.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());

                    _MonsterTemplate.Health = row["Health"] == DBNull.Value ? null : row["Health"].ToString();
                    _MonsterTemplate.ArmorClass = row["ArmorClass"] == DBNull.Value ? null : row["ArmorClass"].ToString();
                    _MonsterTemplate.ChallangeRating = row["ChallangeRating"] == DBNull.Value ? null : row["ChallangeRating"].ToString();
                    _MonsterTemplate.XPValue = row["XPValue"] == DBNull.Value ? null : row["XPValue"].ToString();
                    _MonsterTemplate.InitiativeCommand = row["InitiativeCommand"] == DBNull.Value ? null : row["InitiativeCommand"].ToString();
                    _MonsterTemplate.IsRandomizationEngine = row["IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(row["IsRandomizationEngine"]);

                    _MonsterTemplate.IsBundle = row["IsBundle"] == DBNull.Value ? false : Convert.ToBoolean(row["IsBundle"]);

                    _MonsterTemplate.RuleSet = ruleset;
                    _monsterTemplateList.Add(_MonsterTemplate);
                }
            }
            return _monsterTemplateList;
        }

        public List<MonsterTemplateCommand> SP_GetMonsterTemplateCommands(int monsterTemplateId)
        {
            List<MonsterTemplateCommand> _monsterTemplateCommand = new List<MonsterTemplateCommand>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("MonsterTemplate_GetCommands", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@MonsterTemplateId", monsterTemplateId);
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
                    MonsterTemplateCommand _cmd = new MonsterTemplateCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString());
                    _cmd.MonsterTemplateCommandId = row["MonsterTemplateCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    _monsterTemplateCommand.Add(_cmd);
                }
            }

            return _monsterTemplateCommand;
        }
        
        public SP_AssociateForMonsterTemplate SP_GetAssociateRecords(int monsterTemplateId, int rulesetId, int MonsterID)
        {
            SP_AssociateForMonsterTemplate res = new SP_AssociateForMonsterTemplate();
            res.abilityList = new List<Ability>();
            res.selectedAbilityList = new List<Ability>();
            res.spellList = new List<Spell>();
            res.selectedSpellList = new List<Spell>();
            res.buffAndEffectsList = new List<BuffAndEffect>();
            res.selectedBuffAndEffects = new List<BuffAndEffect>();
            res.monsterTemplatesList = new List<MonsterTemplate>();
            res.selectedMonsterTemplates = new List<MonsterTemplate>();
            res.monsterTemplateCommands = new List<MonsterTemplateCommand>();
            res.selectedItemMasters = new List<ItemMasterForMonsterTemplate>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("MonsterTemplate_GetAssociateRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@MonsterTemplateId", monsterTemplateId);
                command.Parameters.AddWithValue("@RulesetID", rulesetId);
                command.Parameters.AddWithValue("@MonsterID", MonsterID);
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
                    MonsterTemplateCommand _cmd = new MonsterTemplateCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString());
                    _cmd.MonsterTemplateCommandId = row["MonsterTemplateCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    res.monsterTemplateCommands.Add(_cmd);
                }
            }
            if (ds.Tables[1].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.abilityList.Add(i);
                }

            }
            if (ds.Tables[2].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[2].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.spellList.Add(i);
                }

            }
            if (ds.Tables[3].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[3].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.buffAndEffectsList.Add(i);/////////
                }

            }
            if (ds.Tables[4].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[4].Rows)
                {
                    MonsterTemplate i = new MonsterTemplate();
                    i.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.monsterTemplatesList.Add(i);/////////
                }

            }
            if (ds.Tables[5].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[5].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedAbilityList.Add(i);
                }

            }
            if (ds.Tables[6].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[6].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedSpellList.Add(i);
                }

            }
            if (ds.Tables[7].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[7].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedBuffAndEffects.Add(i);///////
                }

            }
            if (ds.Tables[8].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[8].Rows)
                {
                    MonsterTemplate i = new MonsterTemplate();
                    i.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedMonsterTemplates.Add(i);///////
                }

            }
            if (ds.Tables[9].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[9].Rows)
                {
                    ItemMasterForMonsterTemplate i = new ItemMasterForMonsterTemplate();
                    DataColumnCollection columns = ds.Tables[9].Columns;
                    if (columns.Contains("ItemId")) {
                        i.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"]);
                    }
                       
                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"]);
                    i.ImageUrl = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                    i.Name = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString();
                    i.Qty = row["Qty"] == DBNull.Value ? 0 : Convert.ToInt32(row["Qty"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);

                    res.selectedItemMasters.Add(i);///////
                }

            }
            return res;
        }



        public SP_AssociateForMonsterTemplate SP_GetMonsterAssociateRecords(int monsterID, int rulesetId)
        {
            SP_AssociateForMonsterTemplate res = new SP_AssociateForMonsterTemplate();
            res.abilityList = new List<Ability>();
            res.selectedAbilityList = new List<Ability>();
            res.spellList = new List<Spell>();
            res.selectedSpellList = new List<Spell>();
            res.buffAndEffectsList = new List<BuffAndEffect>();
            res.selectedBuffAndEffects = new List<BuffAndEffect>();
            res.monsterTemplatesList = new List<MonsterTemplate>();
            res.selectedMonsterTemplates = new List<MonsterTemplate>();
            res.monsterTemplateCommands = new List<MonsterTemplateCommand>();
            res.selectedItemMasters = new List<ItemMasterForMonsterTemplate>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Monster_GetAssociateRecords", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@MonsterID", monsterID);
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
                    MonsterTemplateCommand _cmd = new MonsterTemplateCommand();

                    _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _cmd.MonsterTemplateId = row["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterId"].ToString());
                    _cmd.MonsterTemplateCommandId = row["MonsterCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterCommandId"].ToString());
                    _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
                    _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

                    res.monsterTemplateCommands.Add(_cmd);
                }
            }
            if (ds.Tables[1].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.abilityList.Add(i);
                }

            }
            if (ds.Tables[2].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[2].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.spellList.Add(i);
                }

            }
            if (ds.Tables[3].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[3].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.buffAndEffectsList.Add(i);/////////
                }

            }
            if (ds.Tables[4].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[4].Rows)
                {
                    MonsterTemplate i = new MonsterTemplate();
                    i.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.monsterTemplatesList.Add(i);/////////
                }

            }
            if (ds.Tables[5].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[5].Rows)
                {
                    Ability i = new Ability();
                    i.AbilityId = row["AbilityId"] == DBNull.Value ? 0 : Convert.ToInt32(row["AbilityId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedAbilityList.Add(i);
                }

            }
            if (ds.Tables[6].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[6].Rows)
                {
                    Spell i = new Spell();
                    i.SpellId = row["SpellId"] == DBNull.Value ? 0 : Convert.ToInt32(row["SpellId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedSpellList.Add(i);
                }

            }
            if (ds.Tables[7].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[7].Rows)
                {
                    BuffAndEffect i = new BuffAndEffect();
                    i.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedBuffAndEffects.Add(i);///////
                }

            }
            if (ds.Tables[8].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[8].Rows)
                {
                    MonsterTemplate i = new MonsterTemplate();
                    i.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);
                    i.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
                    i.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();

                    res.selectedMonsterTemplates.Add(i);///////
                }

            }
            if (ds.Tables[9].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[9].Rows)
                {
                    ItemMasterForMonsterTemplate i = new ItemMasterForMonsterTemplate();
                    DataColumnCollection columns = ds.Tables[9].Columns;
                    if (columns.Contains("ItemId"))
                    {
                        i.ItemId = row["ItemId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemId"]);
                    }

                    i.ItemMasterId = row["ItemMasterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ItemMasterId"]);
                    i.ImageUrl = row["ItemImage"] == DBNull.Value ? null : row["ItemImage"].ToString();
                    i.Name = row["ItemName"] == DBNull.Value ? null : row["ItemName"].ToString();
                    i.Qty = row["Qty"] == DBNull.Value ? 0 : Convert.ToInt32(row["Qty"]);
                    i.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"]);

                    res.selectedItemMasters.Add(i);///////
                }

            }
            return res;
        }



        public List<MonsterTemplateAbility> insertAssociateAbilities(List<MonsterTemplateAbility> MonsterTemplateAbilityVM) {
            try {
                _context.MonsterTemplateAbilities.AddRange(MonsterTemplateAbilityVM);
                _context.SaveChanges();
            } catch (Exception ex) {  }
           
            return MonsterTemplateAbilityVM;
        }
        public List<MonsterTemplateSpell> insertAssociateSpells(List<MonsterTemplateSpell> MonsterTemplateSpellVM) {
            try {
                _context.MonsterTemplateSpells.AddRange(MonsterTemplateSpellVM);
                _context.SaveChanges();
            } catch (Exception ex) { }
            
            return MonsterTemplateSpellVM;
        }
        public List<MonsterTemplateBuffAndEffect> insertAssociateBuffAndEffects(List<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffectVM) {
            try {
                _context.MonsterTemplateBuffAndEffects.AddRange(MonsterTemplateBuffAndEffectVM);
                _context.SaveChanges();
            } catch (Exception ex) { }
           
            return MonsterTemplateBuffAndEffectVM;
        }
        public List<MonsterTemplateMonster> insertAssociateMonsterTemplates(List<MonsterTemplateMonster> MonsterTemplateMonsterVM) {
            try {
                _context.MonsterTemplateMonsters.AddRange(MonsterTemplateMonsterVM);
                _context.SaveChanges();
                
            } catch (Exception ex) {
            }
            return MonsterTemplateMonsterVM;
        }
        public List<MonsterTemplateItemMaster> insertAssociateItemMasters(List<MonsterTemplateItemMaster> MonsterTemplateItemMasterVM)
        {
            try
            {
                _context.MonsterTemplateItemMasters.AddRange(MonsterTemplateItemMasterVM);
                _context.SaveChanges();

            }
            catch (Exception ex) { }
            return MonsterTemplateItemMasterVM;
        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }
        public void deployMonster(DeployMonsterTemplate model)
        {
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;


            //assign datatable for list records of dice results.
            int index = 0;
            List<numbersList> healthCurrent = model.healthCurrent.Select(x => new numbersList() {
                RowNum = index = Getindex(index),
                Number = x }).ToList();

            index = 0;
            List<numbersList> healthMax = model.healthMax.Select(x => new numbersList() {
                RowNum = index = Getindex(index),
                Number = x }).ToList();

            index = 0;
            List<numbersList> armorClass = model.armorClass.Select(x => new numbersList() {
                RowNum = index = Getindex(index),
                Number = x }).ToList();

            index = 0;
            List<numbersList> xpValue = model.xpValue.Select(x => new numbersList() {
                RowNum = index = Getindex(index),
                Number = x }).ToList();

            index = 0;
            List<numbersList> challangeRating = model.challangeRating.Select(x => new numbersList() {
                RowNum = index = Getindex(index),
                Number = x }).ToList();

            DataTable DT_healthCurrent = new DataTable();
           
                if (healthCurrent.Count > 0)
                {
                    DT_healthCurrent= utility.ToDataTable<numbersList>(healthCurrent);
                }
            
             
            DataTable DT_healthMax = new DataTable();
            
                if (healthMax.Count > 0)
                {
                    DT_healthMax = utility.ToDataTable<numbersList>(healthMax);
                }
            
            
            DataTable DT_armorClass = new DataTable();
           
                if (armorClass.Count > 0)
                {
                    DT_armorClass = utility.ToDataTable<numbersList>(armorClass);
                }
            
            
            DataTable DT_xpValue = new DataTable();
           
                if (xpValue.Count > 0)
                {
                    DT_xpValue = utility.ToDataTable<numbersList>(xpValue);
                }
            
            
            DataTable DT_challangeRating = new DataTable();
            
                if (challangeRating.Count > 0)
                {
                    DT_challangeRating = utility.ToDataTable<numbersList>(challangeRating);
                }
            
            


            using (SqlConnection con = new SqlConnection(consString))
            {

                using (SqlCommand cmd = new SqlCommand("MonsterTemplate_Deploy"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@RulesetID", model.rulesetId);
                    cmd.Parameters.AddWithValue("@MonsterTemplateId", model.monsterTemplateId);
                    cmd.Parameters.AddWithValue("@Qty", model.qty);
                    cmd.Parameters.AddWithValue("@HealthCurrentList", DT_healthCurrent);
                    cmd.Parameters.AddWithValue("@HealthMaxList", DT_healthMax);
                    cmd.Parameters.AddWithValue("@ArmorClassList", DT_armorClass);
                    cmd.Parameters.AddWithValue("@XPValueList", DT_xpValue);
                    cmd.Parameters.AddWithValue("@ChallangeRatingList", DT_challangeRating);
                    cmd.Parameters.AddWithValue("@AddToCombat", model.addToCombat);
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


        public List<Monster> SP_GetMonstersByRuleSetId(int rulesetId, int page, int pageSize, int sortType = 1)
        {
            List<Monster> _monsterList = new List<Monster>();
            RuleSet ruleset = new RuleSet();

            short num = 0;
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("Monster_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
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

            if (ds.Tables[0].Rows.Count > 0)
            {

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    Monster _monster = new Monster()
                    {
                        AddToCombatTracker= row["AddToCombatTracker"] == DBNull.Value ? false : Convert.ToBoolean(row["AddToCombatTracker"]),
                        ArmorClass= row["ArmorClass"] == DBNull.Value ? 0 : Convert.ToInt32(row["ArmorClass"].ToString()),
                        ChallangeRating= row["ChallangeRating"] == DBNull.Value ? 0 : Convert.ToInt32(row["ChallangeRating"].ToString()),
                        HealthCurrent= row["HealthCurrent"] == DBNull.Value ? 0 : Convert.ToInt32(row["HealthCurrent"].ToString()),
                        HealthMax= row["HealthMax"] == DBNull.Value ? 0 : Convert.ToInt32(row["HealthMax"].ToString()),
                        ImageUrl= row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString(),
                        IsDeleted= row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                        Metatags= row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString(),
                        MonsterId= row["MonsterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterId"].ToString()),
                        MonsterTemplateId= row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString()),
                        Name= row["Name"] == DBNull.Value ? null : row["Name"].ToString(),
                        RuleSetId= row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString()),
                        XPValue= row["XPValue"] == DBNull.Value ? 0 : Convert.ToInt32(row["XPValue"].ToString()),                        
                    };




                    MonsterTemplate _MonsterTemplate = new MonsterTemplate();
                    _MonsterTemplate.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
                    _MonsterTemplate.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
                    _MonsterTemplate.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
                    _MonsterTemplate.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
                    _MonsterTemplate.MonsterTemplateId = row["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(row["MonsterTemplateId"].ToString());
                    _MonsterTemplate.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
                    _MonsterTemplate.Health = row["MTHealth"] == DBNull.Value ? null : row["MTHealth"].ToString();
                    _MonsterTemplate.ArmorClass = row["MTArmorClass"] == DBNull.Value ? null : row["MTArmorClass"].ToString();
                    _MonsterTemplate.ChallangeRating = row["MTChallangeRating"] == DBNull.Value ? null : row["MTChallangeRating"].ToString();
                    _MonsterTemplate.XPValue = row["MTXPValue"] == DBNull.Value ? null : row["MTXPValue"].ToString();
                    _MonsterTemplate.InitiativeCommand = row["InitiativeCommand"] == DBNull.Value ? null : row["InitiativeCommand"].ToString();


                    _monster.RuleSet = ruleset;
                    _monster.MonsterTemplate = _MonsterTemplate;
                    _monsterList.Add(_monster);
                }
            }
            return _monsterList;
        }

        public async Task enableCombatTracker(int monsterId, bool enableCombatTracker) {
            var monster =await _context.Monsters.Where(x => x.MonsterId == monsterId && x.IsDeleted != true).FirstOrDefaultAsync();
            if (monster!=null)
            {
                monster.AddToCombatTracker = enableCombatTracker;
               await _context.SaveChangesAsync();
            }
        }
        //public List<BuffAndEffect> GetByRuleSetId_add(int rulesetId)
        //{
        //    List<BuffAndEffect> buffAndEffectList = new List<BuffAndEffect>();
        //    string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
        //    //string qry = "EXEC AbilitiesByRuleSetId_add @RulesetID = '" + rulesetId + "'";

        //    SqlConnection connection = new SqlConnection(connectionString);
        //    SqlCommand command = new SqlCommand();
        //    SqlDataAdapter adapter = new SqlDataAdapter();
        //    DataSet ds = new DataSet();
        //    try
        //    {
        //        connection.Open();
        //        command = new SqlCommand("BuffAndEffectsByRuleSetId_add", connection);

        //        // Add the parameters for the SelectCommand.
        //        command.Parameters.AddWithValue("@RulesetID", rulesetId);
        //        command.CommandType = CommandType.StoredProcedure;

        //        adapter.SelectCommand = command;

        //        adapter.Fill(ds);
        //        command.Dispose();
        //        connection.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        command.Dispose();
        //        connection.Close();
        //    }

        //    if (ds.Tables[0].Rows.Count > 0)
        //    {
        //        foreach (DataRow row in ds.Tables[0].Rows)
        //        {
        //            BuffAndEffect _buffAndEffect = new BuffAndEffect();
        //            _buffAndEffect.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
        //            _buffAndEffect.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
        //            _buffAndEffect.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"].ToString());
        //            _buffAndEffect.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());

        //            buffAndEffectList.Add(_buffAndEffect);
        //        }
        //    }
        //    return buffAndEffectList;
        //}
        public async Task<MonsterTemplate> Core_CreateMonsterTemplateUsingMonster(int monsterTemplateId, int rulesetID)
        {
            MonsterTemplate model = GetById(monsterTemplateId);// GetItemMasterById(ItemMasterID);
            MonsterTemplate monsterTemplate = new MonsterTemplate()

            {
                MonsterTemplateId = model.MonsterTemplateId,
                Command = model.Command,
                Metatags = model.Metatags,
                RuleSetId = rulesetID,
                ArmorClass = model.ArmorClass,
                ChallangeRating = model.ChallangeRating,
                CommandName = model.CommandName,
                Description = model.Description,
                Health = model.Health,
                ImageUrl = model.ImageUrl,
                InitiativeCommand = model.InitiativeCommand,

                IsRandomizationEngine = model.IsRandomizationEngine,
                //MonsterTemplateAbilities = model.MonsterTemplateAbilities,
                //MonsterTemplateBuffAndEffects = model.MonsterTemplateBuffAndEffects,
                //MonsterTemplateCommands = model.MonsterTemplateCommands,
                //MonsterTemplateItemMasters = model.MonsterTemplateItemMasters,
                //MonsterTemplateMonsters = model.MonsterTemplateMonsters,
                //MonsterTemplateSpells = model.MonsterTemplateSpells,
                Name = model.Name,



                Stats = model.Stats,
                XPValue = model.XPValue,
            };



            MonsterTemplate CreatedItemMaster = await Core_CreateMonsterTemplate(monsterTemplate);
            return CreatedItemMaster;
        }

        public List<ItemMasterForMonsterTemplate> getMonsterItemsToDrop(int monsterId) {
            return _context.ItemMasterMonsterItems.Where(x => x.MonsterId == monsterId && x.IsDeleted != true).Include(x=>x.ItemMaster).Select(x=> new ItemMasterForMonsterTemplate() {


                ItemId = x.ItemId,
                ImageUrl = x.ItemMaster.ItemImage,
                ItemMasterId= x.ItemMasterId,
                Name = x.ItemMaster.ItemName,
                Qty = (int)x.Quantity,
                RuleSetId = x.ItemMaster.RuleSetId
            } ).ToList();
        }
        public async Task DropItemsToLoot(List<ItemMasterForMonsterTemplate> list)
        {
            foreach (var item in list)
            {
                var ItemMasterLootSpells = new List<ItemMasterLootSpell>();
                var ItemMasterLootAbilitys = new List<ItemMasterLootAbility>();
                   var ItemMasterLootBuffAndEffects = new List<ItemMasterLootBuffAndEffect>();
                   var ItemMasterLootCommands = new List<ItemMasterLootCommand>();

                var ItemMasterMonsterItem = _context.ItemMasterMonsterItems.Where(x => x.ItemId == item.ItemId)
                    .Include(x=>x.ItemMasterCommand)
                    .Include(x=>x.ItemMasterAbilities)
                    .Include(x=>x.ItemMasterSpell)
                    .Include(x=>x.itemMasterBuffAndEffects)
                    .FirstOrDefault();
                if (ItemMasterMonsterItem!=null)
                {
                    ItemMasterMonsterItem.IsDeleted = true;
                    if (ItemMasterMonsterItem.ItemMasterCommand!=null && ItemMasterMonsterItem.ItemMasterCommand.Count>0)
                    {
                        foreach (var record in ItemMasterMonsterItem.ItemMasterCommand)
                        {
                            ItemMasterLootCommand rec = new ItemMasterLootCommand() {
                                Command=record.Command,
                                Name=record.Name
                            };
                            ItemMasterLootCommands.Add(rec);
                        }
                    }
                    if (ItemMasterMonsterItem.ItemMasterAbilities != null && ItemMasterMonsterItem.ItemMasterAbilities.Count > 0)
                    {
                        foreach (var record in ItemMasterMonsterItem.ItemMasterAbilities)
                        {
                            ItemMasterLootAbility rec = new ItemMasterLootAbility()
                            {                                
                                AbilityId = record.AbilityId
                            };
                            ItemMasterLootAbilitys.Add(rec);
                        }
                    }
                    if (ItemMasterMonsterItem.ItemMasterSpell != null && ItemMasterMonsterItem.ItemMasterSpell.Count > 0)
                    {
                        foreach (var record in ItemMasterMonsterItem.ItemMasterSpell)
                        {
                            ItemMasterLootSpell rec = new ItemMasterLootSpell()
                            {
                                SpellId = record.SpellId
                            };
                            ItemMasterLootSpells.Add(rec);
                        }
                    }
                    if (ItemMasterMonsterItem.itemMasterBuffAndEffects != null && ItemMasterMonsterItem.itemMasterBuffAndEffects.Count > 0)
                    {
                        foreach (var record in ItemMasterMonsterItem.itemMasterBuffAndEffects)
                        {
                            ItemMasterLootBuffAndEffect rec = new ItemMasterLootBuffAndEffect()
                            {
                                BuffAndEffectId = record.BuffAndEffectId
                            };
                            ItemMasterLootBuffAndEffects.Add(rec);
                        }
                    }
                }
                _context.SaveChanges();
                   ItemMaster obj = _context.ItemMasters.Where(x => x.ItemMasterId == item.ItemMasterId).FirstOrDefault();
                if (obj != null)
                {
                    _itemMasterService.CreateItemMasterLoot(obj, new ItemMasterLoot()
                    {
                        IsShow = true,
                        Quantity = ItemMasterMonsterItem.Quantity,
                        Command= ItemMasterMonsterItem.Command,
                        CommandName= ItemMasterMonsterItem.CommandName,
                       ContainerVolumeMax =ItemMasterMonsterItem.ContainerVolumeMax,
                       ContainerWeightMax =ItemMasterMonsterItem.ContainerWeightMax,
                        ContainerWeightModifier=ItemMasterMonsterItem.ContainerWeightModifier,
                        IsConsumable=ItemMasterMonsterItem.IsConsumable,
                        IsContainer=ItemMasterMonsterItem.IsContainer,
                        IsIdentified=ItemMasterMonsterItem.IsIdentified,
                        IsMagical=ItemMasterMonsterItem.IsMagical,
                        IsVisible=ItemMasterMonsterItem.IsVisible,
                        ItemCalculation=ItemMasterMonsterItem.ItemCalculation,
                        ItemImage=ItemMasterMonsterItem.ItemImage,
                        ItemName=ItemMasterMonsterItem.ItemName,
                        ItemStats=ItemMasterMonsterItem.ItemStats,
                        ItemVisibleDesc=ItemMasterMonsterItem.ItemVisibleDesc,
                        Metatags=ItemMasterMonsterItem.Metatags,
                        PercentReduced=ItemMasterMonsterItem.PercentReduced,
                        Rarity=ItemMasterMonsterItem.Rarity,
                        RuleSetId=ItemMasterMonsterItem.RuleSetId,
                        TotalWeight=ItemMasterMonsterItem.TotalWeight,
                        TotalWeightWithContents=ItemMasterMonsterItem.TotalWeightWithContents,
                        Value=ItemMasterMonsterItem.Value,
                        Volume=ItemMasterMonsterItem.Volume,
                        Weight=ItemMasterMonsterItem.Weight,
                    },
                    ItemMasterLootSpells,
                   ItemMasterLootAbilitys,
                    ItemMasterLootBuffAndEffects,
                   ItemMasterLootCommands
                    );
                }
            }
        }
        public List<MonsterTemplate_Bundle> GetMonsterTemplatesByRuleSetId_add(int rulesetId, bool includeBundles=false)
        {
            List<MonsterTemplate_Bundle> monsterList = new List<MonsterTemplate_Bundle>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            // string qry = "EXEC ItemMasterGetAllDetailsByRulesetID_add @RulesetID = '" + rulesetId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("MonsterTemplateGetAllDetailsByRulesetID_add", connection);

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
                    MonsterTemplate_Bundle MonsterTemp = new MonsterTemplate_Bundle() {
                        ArmorClass = ItemRow["ArmorClass"] == DBNull.Value ? null : ItemRow["ArmorClass"].ToString(),
                        ChallangeRating = ItemRow["ChallangeRating"] == DBNull.Value ? null : ItemRow["ChallangeRating"].ToString(),
                        Command = ItemRow["Command"] == DBNull.Value ? null : ItemRow["Command"].ToString(),
                        CommandName = ItemRow["CommandName"] == DBNull.Value ? null : ItemRow["CommandName"].ToString(),
                        Description = ItemRow["Description"] == DBNull.Value ? null : ItemRow["Description"].ToString(),
                        Health = ItemRow["Health"] == DBNull.Value ? null : ItemRow["Health"].ToString(),
                        ImageUrl = ItemRow["ImageUrl"] == DBNull.Value ? null : ItemRow["ImageUrl"].ToString(),
                        InitiativeCommand = ItemRow["InitiativeCommand"] == DBNull.Value ? null : ItemRow["InitiativeCommand"].ToString(),
                        IsDeleted = ItemRow["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsDeleted"]),
                        IsRandomizationEngine = ItemRow["IsRandomizationEngine"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsRandomizationEngine"]),
                        Metatags = ItemRow["Metatags"] == DBNull.Value ? null : ItemRow["Metatags"].ToString(),                       
                        MonsterTemplateId = ItemRow["MonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["MonsterTemplateId"]),
                        Name = ItemRow["Name"] == DBNull.Value ? null : ItemRow["Name"].ToString(),
                        ParentMonsterTemplateId = ItemRow["ParentMonsterTemplateId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["ParentMonsterTemplateId"]),
                        RuleSetId = ItemRow["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(ItemRow["RuleSetId"]),
                        Stats = ItemRow["Stats"] == DBNull.Value ? null : ItemRow["Stats"].ToString(),
                        XPValue = ItemRow["XPValue"] == DBNull.Value ? null : ItemRow["XPValue"].ToString(),
                        IsBundle = ItemRow["IsBundle"] == DBNull.Value ? false : Convert.ToBoolean(ItemRow["IsBundle"]),
                    };
                    monsterList.Add(MonsterTemp);
                }
            }
            return monsterList;

        }
        public bool Core_BundleWithParentIDExists(int bundleId, int rulesetID)
        {
            if (_context.MonsterTemplateBundles.Where(x => x.BundleId == bundleId && x.ParentMonsterTemplateBundleId != null).Any())
            {
                return true;
            }
            else
            {
                var model = _context.MonsterTemplateBundles.Where(x => x.BundleId == bundleId && x.ParentMonsterTemplateBundleId == null);
                if (model.FirstOrDefault().RuleSetId == rulesetID)
                {
                    return true;
                }
            }
            return false;
        }
    }
}
