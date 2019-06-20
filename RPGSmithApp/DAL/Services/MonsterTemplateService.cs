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
        //private readonly IRepository<MonsterTemplate> _repo;
        //protected readonly ApplicationDbContext _context;
        //private readonly IConfiguration _configuration;
        //public MonsterTemplateService(ApplicationDbContext context, IRepository<MonsterTemplate> repo, IConfiguration configuration)
        //{
        //    _repo = repo;
        //    _context = context;
        //    this._configuration = configuration;
        //}

        //public async Task<MonsterTemplate> Create(MonsterTemplate item)
        //{
        //    return await _repo.Add(item);
        //}

        //public async  Task<bool> Delete(int id)
        //{
        //    // Remove associated Commands
        //    var MTC = _context.MonsterTemplateCommands.Where(x => x.MonsterTemplateId == id && x.IsDeleted !=true).ToList();

        //    foreach(MonsterTemplateCommand item in MTC)
        //    {
        //        item.IsDeleted = true;
        //    }

        //    // Remove associated Buffs
        //    var mtbe = _context.MonsterTemplateBuffAndEffects.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

        //    foreach (MonsterTemplateBuffAndEffect item in mtbe)
        //    {
        //        item.IsDeleted = true;
        //    }

        //    // Remove associated Ability
        //    var mta= _context.MonsterTemplateAbilities.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

        //    foreach (MonsterTemplateAbility item in mta)
        //    {
        //        item.IsDeleted = true;
        //    }

        //    // Remove associated Spell
        //    var mts = _context.MonsterTemplateSpells.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

        //    foreach (MonsterTemplateSpell item in mts)
        //    {
        //        item.IsDeleted = true;
        //    }

        //    // Remove associated monsterTemplates
        //    var mtm = _context.MonsterTemplateMonsters.Where(x => x.MonsterTemplateId == id && x.IsDeleted != true).ToList();

        //    foreach (MonsterTemplateMonster item in mtm)
        //    {
        //        item.IsDeleted = true;
        //    }


        //    // Remove Monster Template
        //    var monsterTemplate = await  _repo.Get(id);

        //    if (monsterTemplate == null)
        //    return false;

        //    monsterTemplate.IsDeleted = true;
               
        //    try
        //    {
        //        _context.SaveChanges();
        //        return true;
        //    }
        //    catch(Exception ex)
        //    {
        //        throw ex;
        //    }
           

        //    //  return await _repo.Remove(id);

        // }

       

        //public MonsterTemplate GetById(int? id)
        //{
        //    MonsterTemplate monsterTemplate = _context.MonsterTemplates
        //        .Include(d=>d.RuleSet)
        //        .Include(d=>d.MonsterTemplateCommand)
        //        .Where(x => x.MonsterTemplateId  == id && x.IsDeleted != true)
                
        //        .FirstOrDefault();

        //    if (monsterTemplate == null) return monsterTemplate;

        //    monsterTemplate.MonsterTemplateCommand = monsterTemplate.MonsterTemplateCommand.Where(p => p.IsDeleted != true).ToList();

        //    return monsterTemplate;
        //}
      
       
        
        //public async Task<MonsterTemplate> Update(MonsterTemplate item)
        //{
        //    var monsterTemplate = _context.MonsterTemplates.FirstOrDefault(x => x.MonsterTemplateId == item.MonsterTemplateId);

        //    if (monsterTemplate == null)
        //        return monsterTemplate;

        //    monsterTemplate.Name = item.Name;

        //    monsterTemplate.Command = item.Command;
        //    monsterTemplate.CommandName = item.CommandName;
        //    monsterTemplate.Description = item.Description;
        //    monsterTemplate.Stats = item.Stats;
        //    monsterTemplate.ImageUrl = item.ImageUrl;

        //    monsterTemplate.Metatags = item.Metatags;

        //    monsterTemplate.ArmorClass= item.ArmorClass;
        //    monsterTemplate.ChallangeRating= item.ChallangeRating;
        //    monsterTemplate.XPValue= item.XPValue;
        //    monsterTemplate.Health= item.Health;
        //    monsterTemplate.InitiativeCommand= item.InitiativeCommand;
        //    monsterTemplate.IsRandomizationEngine= item.IsRandomizationEngine;


        //    try
        //    {
        //        _context.SaveChanges();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }

        //    return monsterTemplate;
        //}

        //public int GetCountByRuleSetId(int ruleSetId)
        //{
        //    return _context.MonsterTemplates.Where(x => x.RuleSetId == ruleSetId && x.IsDeleted!=true).Count();
        //}
        //public int Core_GetCountByRuleSetId(int ruleSetId,int parentID)
        //{
        //    //var idsToRemove = _context.Abilities.Where(p => (p.RuleSetId == ruleSetId) && p.ParentAbilityId != null).Select(p => p.ParentAbilityId).ToArray();

        //    //var recsToRemove = _context.Abilities.Where(p => idsToRemove.Contains(p.AbilityId)).ToList();

        //    //var res = _context.Abilities.Where(x => (x.RuleSetId == ruleSetId || x.RuleSetId == parentID) && x.IsDeleted != true)
        //    //    .Except(recsToRemove);
        //    //return res.Count();
        //    string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
        //    //string qry = "EXEC Ruleset_GetRecordCounts @RulesetID = '" + ruleSetId + "'";

        //    SqlConnection connection = new SqlConnection(connectionString);
        //    SqlCommand command = new SqlCommand();
        //    SqlDataAdapter adapter = new SqlDataAdapter();
        //    DataTable dt = new DataTable();
        //    try
        //    {
        //        connection.Open();
        //        command = new SqlCommand("Ruleset_GetRecordCounts", connection);

        //        // Add the parameters for the SelectCommand.
        //        command.Parameters.AddWithValue("@RulesetID", ruleSetId);
        //        command.CommandType = CommandType.StoredProcedure;

        //        adapter.SelectCommand = command;

        //        adapter.Fill(dt);
        //        command.Dispose();
        //        connection.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        command.Dispose();
        //        connection.Close();
        //    }
            
            
        //    SP_RulesetRecordCount res = new SP_RulesetRecordCount();
        //    if (dt.Rows.Count > 0)
        //    {
        //        res.BuffAndEffectCount = Convert.ToInt32(dt.Rows[0]["BuffAndEffectCount"]);                
        //    }
        //    return res.BuffAndEffectCount;
        //}

        //public async Task<bool> CheckDuplicateBuffAndEffect(string value, int? ruleSetId,int? buffAndEffectId = 0)
        //{
        //    //var items = _repo.GetAll();
        //    //if (items.Result == null || items.Result.Count == 0) return false;
        //    //else if (ruleSetId > 0)
        //    //{
        //    //    return items.Result.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.AbilityId!=abilityId && x.IsDeleted!=true).FirstOrDefault() == null ? false : true;
        //    //}
        //    //else
        //    //    return items.Result.Where(x => x.Name.ToLower() == value.ToLower()).FirstOrDefault() == null ? false : true;
           
        //    if (ruleSetId > 0)
        //    {
        //        return _context.BuffAndEffects.Where(x => x.Name.ToLower() == value.ToLower() && x.RuleSetId == ruleSetId && x.BuffAndEffectId != buffAndEffectId && x.IsDeleted != true).FirstOrDefault() == null ? false : true;
        //    }
        //    else
        //        return _context.BuffAndEffects.Where(x => x.Name.ToLower() == value.ToLower()).FirstOrDefault() == null ? false : true;
        //}

       
        //public bool Core_BuffAndEffectWithParentIDExists(int buffAndEffectId, int RulesetID) {
        //    if (_context.BuffAndEffects.Where(x => x.BuffAndEffectId == buffAndEffectId && x.ParentBuffAndEffectId != null && x.IsDeleted != true).Any())
        //    {
        //        return true;
        //    }
        //    else
        //    {
        //        var model = _context.BuffAndEffects.Where(x => x.BuffAndEffectId == buffAndEffectId && x.ParentBuffAndEffectId == null && x.IsDeleted != true);
        //        if (model.FirstOrDefault().RuleSetId == RulesetID)
        //        {
        //            return true;
        //        }
        //    }
        //    return false;
        //}
        //public async Task<BuffAndEffect> Core_CreateBuffAndEffect(BuffAndEffect buffAndEffects) {
        //    buffAndEffects.ParentBuffAndEffectId = buffAndEffects.BuffAndEffectId;
        //    buffAndEffects.BuffAndEffectId = 0;
        //    return await _repo.Add(buffAndEffects);
        //}

        //public List<BuffAndEffectVM> SP_GetBuffAndEffectByRuleSetId(int rulesetId, int page, int pageSize)
        //{
        //    List<BuffAndEffectVM> _buffAndEffectList = new List<BuffAndEffectVM>();
        //    RuleSet ruleset = new RuleSet();

        //    short num = 0;
        //    string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            
        //    SqlConnection connection = new SqlConnection(connectionString);
        //    SqlCommand command = new SqlCommand();
        //    SqlDataAdapter adapter = new SqlDataAdapter();
        //    DataSet ds = new DataSet();
        //    try
        //    {
        //        connection.Open();
        //        command = new SqlCommand("BuffAndEffect_GetByRulesetID", connection);

        //        // Add the parameters for the SelectCommand.
        //        command.Parameters.AddWithValue("@RulesetID", rulesetId);
        //        command.Parameters.AddWithValue("@page", page);
        //        command.Parameters.AddWithValue("@size", pageSize);
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
           
            

        //    if (ds.Tables[1].Rows.Count > 0)
        //        ruleset = _repo.GetRuleset(ds.Tables[1], num);

        //    if (ds.Tables[0].Rows.Count > 0)
        //    {
               
        //        foreach (DataRow row in ds.Tables[0].Rows)
        //        {
        //            BuffAndEffectVM _buffAndEffect = new BuffAndEffectVM();
        //            _buffAndEffect.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();
        //            _buffAndEffect.Stats = row["Stats"] == DBNull.Value ? null : row["Stats"].ToString();
        //            _buffAndEffect.Metatags = row["Metatags"] == DBNull.Value ? null : row["Metatags"].ToString();
        //            _buffAndEffect.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
        //            _buffAndEffect.CommandName = row["CommandName"] == DBNull.Value ? null : row["CommandName"].ToString();
        //            _buffAndEffect.Description = row["Description"] == DBNull.Value ? null : row["Description"].ToString();
        //            _buffAndEffect.ImageUrl = row["ImageUrl"] == DBNull.Value ? null : row["ImageUrl"].ToString();
        //            //_buffAndEffect.Level = row["Level"] == DBNull.Value ? null : row["Level"].ToString();
        //            _buffAndEffect.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
        //            //_buffAndEffect.IsEnabled = row["IsEnabled"] == DBNull.Value ? false : Convert.ToBoolean(row["IsEnabled"]);
                   
        //            _buffAndEffect.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"].ToString());
        //            _buffAndEffect.ParentBuffAndEffectId = row["ParentBuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["ParentBuffAndEffectId"].ToString());
        //            _buffAndEffect.RuleSetId = row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(row["RuleSetId"].ToString());
        //            _buffAndEffect.IsAssignedToAnyCharacter = row["IsAssignedToAnyCharacter"] == DBNull.Value ? false : true;
                   
        //            _buffAndEffect.RuleSet = ruleset;
        //            _buffAndEffectList.Add(_buffAndEffect);
        //        }
        //    }
        //    return _buffAndEffectList;
        //}

        //public List<BuffAndEffectCommand> SP_GetBuffAndEffectCommands(int buffAndEffectId)
        //{
        //    List<BuffAndEffectCommand> _buffAndEffectCommand = new List<BuffAndEffectCommand>();
        //    string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
          

        //    SqlConnection connection = new SqlConnection(connectionString);
        //    SqlCommand command = new SqlCommand();
        //    SqlDataAdapter adapter = new SqlDataAdapter();
        //    DataSet ds = new DataSet();
        //    try
        //    {
        //        connection.Open();
        //        command = new SqlCommand("BuffAndEffect_GetCommands", connection);

        //        // Add the parameters for the SelectCommand.
        //        command.Parameters.AddWithValue("@BuffAndEffectId", buffAndEffectId);
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
        //            BuffAndEffectCommand _cmd = new BuffAndEffectCommand();

        //            _cmd.Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString();
        //            _cmd.BuffAndEffectId = row["BuffAndEffectId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectId"].ToString());
        //            _cmd.BuffAndEffectCommandId = row["BuffAndEffectCommandId"] == DBNull.Value ? 0 : Convert.ToInt32(row["BuffAndEffectCommandId"].ToString());
        //            _cmd.IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]);
        //            _cmd.Name = row["Name"] == DBNull.Value ? null : row["Name"].ToString();

        //            _buffAndEffectCommand.Add(_cmd);
        //        }
        //    }

        //    return _buffAndEffectCommand;
        //}
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
        //public async Task SP_AssignBuffAndEffectToCharacter(List<BuffAndEffect> buffsList, List<Character> characters, List<Character> nonSelectedCharacters, List<BuffAndEffect> nonSelectedBuffAndEffectsList,int CharacterID)
        //{
        //    List<CommonID> ids = new List<CommonID>();
        //    if (buffsList.Any())
        //    {
        //        ids = buffsList.Select(x => new CommonID() { ID = x.BuffAndEffectId }).ToList();
        //    }
        //    List<CommonID> charids = new List<CommonID>();
        //    if (characters.Any())
        //    {
        //        charids = characters.Select(x => new CommonID() { ID = x.CharacterId }).ToList();
        //    }
        //    List<CommonID> nonSelectedCharids = new List<CommonID>();
        //    if (nonSelectedCharacters.Any())
        //    {
        //        nonSelectedCharids = nonSelectedCharacters.Select(x => new CommonID() { ID = x.CharacterId }).ToList();
        //    }
        //    List<CommonID> nonSelectedBEids = new List<CommonID>();
        //    if (nonSelectedBuffAndEffectsList.Any())
        //    {
        //        nonSelectedBEids = nonSelectedBuffAndEffectsList.Select(x => new CommonID() { ID = x.BuffAndEffectId }).ToList();
        //    }
        //    DataTable buffDT = utility.ToDataTable<CommonID>(ids);
        //    DataTable charDT = utility.ToDataTable<CommonID>(charids);
        //    DataTable nonSelectedCharDT = utility.ToDataTable<CommonID>(nonSelectedCharids);
        //    DataTable nonSelectedBEDT = utility.ToDataTable<CommonID>(nonSelectedBEids);
        //    string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
        //    try
        //    {
        //        using (SqlConnection con = new SqlConnection(consString))
        //        {
        //            using (SqlCommand cmd = new SqlCommand("AssignBuffAndEffectToCharacter"))
        //            {
        //                cmd.CommandType = CommandType.StoredProcedure;
        //                cmd.Connection = con;
        //                cmd.Parameters.AddWithValue("@BuffAndEffectIds", buffDT);
        //                cmd.Parameters.AddWithValue("@CharacterIDs", charDT);
        //                cmd.Parameters.AddWithValue("@NonSelectedCharacterIDs", nonSelectedCharDT);
        //                cmd.Parameters.AddWithValue("@NonSelectedBuffAndEffectIDs", nonSelectedBEDT);
        //                cmd.Parameters.AddWithValue("@CharacterID", CharacterID);
        //                con.Open();
        //                var a = cmd.ExecuteNonQuery();
        //                con.Close();
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        //public async Task<List<CharBuffAndEffect>> getBuffAndEffectAssignedToCharacter(int characterID)
        //{
        //    return await _context.CharacterBuffAndEffects.Where(x => x.CharacterId == characterID && x.IsDeleted != true).Include(x=>x.BuffAndEffect).Select(x=>new CharBuffAndEffect() { Command=x.BuffAndEffect.Command, CharacterBuffAndEffectId = x.CharacterBuffAandEffectId, BuffAndEffectId =x.BuffAndEffect.BuffAndEffectId,Name=x.BuffAndEffect.Name,ImageUrl=x.BuffAndEffect.ImageUrl}).ToListAsync();
        //}
        //public async Task<CharacterBuffAndEffect> GetCharacterBuffAndEffectById(int CharacterBuffAndEffectID) {
        //    CharacterBuffAndEffect characterBuffAndEffect =await _context.CharacterBuffAndEffects
        //        .Where(x => x.CharacterBuffAandEffectId == CharacterBuffAndEffectID && x.IsDeleted!=true)
        //        .Include(x => x.Character)
        //        .Include(x => x.BuffAndEffect)
        //        .Include(d => d.BuffAndEffect.RuleSet)
        //        .Include(d => d.BuffAndEffect.BuffAndEffectCommand).FirstOrDefaultAsync();

        //    if (characterBuffAndEffect == null) return characterBuffAndEffect;

        //    characterBuffAndEffect.BuffAndEffect.BuffAndEffectCommand = characterBuffAndEffect.BuffAndEffect.BuffAndEffectCommand.Where(p => p.IsDeleted != true).ToList();

        //    return characterBuffAndEffect;
        //}
    }
}
