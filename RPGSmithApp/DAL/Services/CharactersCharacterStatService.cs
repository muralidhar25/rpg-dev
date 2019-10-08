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
    public class CharactersCharacterStatService : ICharactersCharacterStatService
    {

        private readonly IRepository<CharactersCharacterStat> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ICharacterStatChoiceService _characterStatChoiceService;

        public CharactersCharacterStatService(ApplicationDbContext context, 
            IRepository<CharactersCharacterStat> repo, 
            IConfiguration configuration,
            ICharacterStatChoiceService characterStatChoiceService)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
            _characterStatChoiceService = characterStatChoiceService;
        }

        public void Create(CharactersCharacterStat item)
        {
            //return await _repo.Add(item);
            string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            using (SqlConnection con = new SqlConnection(consString))
            {
                using (SqlCommand cmd = new SqlCommand("CharactersCharacterStats_Create"))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Connection = con;
                    //cmd.Parameters.AddWithValue("@CharactersCharacterStatId", GetNull(item.CharactersCharacterStatId));
                    cmd.Parameters.AddWithValue("@CharacterStatId", GetNull(item.CharacterStatId));
                    cmd.Parameters.AddWithValue("@CharacterId", GetNull(item.CharacterId));
                    cmd.Parameters.AddWithValue("@Text", GetNull(item.Text));
                    cmd.Parameters.AddWithValue("@RichText", GetNull(item.RichText));
                    cmd.Parameters.AddWithValue("@Choice", GetNull(item.Choice));
                    cmd.Parameters.AddWithValue("@MultiChoice", GetNull(item.MultiChoice));
                    cmd.Parameters.AddWithValue("@Command", GetNull(item.Command));
                    cmd.Parameters.AddWithValue("@YesNo", GetNull(item.YesNo));
                    cmd.Parameters.AddWithValue("@OnOff", GetNull(item.OnOff));
                    cmd.Parameters.AddWithValue("@Value", GetNull(item.Value));
                    cmd.Parameters.AddWithValue("@Number", GetNull(item.Number));
                    cmd.Parameters.AddWithValue("@SubValue", GetNull(item.SubValue));
                    cmd.Parameters.AddWithValue("@Current", GetNull(item.Current));
                    cmd.Parameters.AddWithValue("@Maximum", GetNull(item.Maximum));
                    cmd.Parameters.AddWithValue("@CalculationResult", GetNull(item.CalculationResult));
                    cmd.Parameters.AddWithValue("@IsDeleted", GetNull(item.IsDeleted));
                    cmd.Parameters.AddWithValue("@ComboText", GetNull(item.ComboText));
                    cmd.Parameters.AddWithValue("@DefaultValue", GetNull(item.DefaultValue));
                    cmd.Parameters.AddWithValue("@Minimum", GetNull(item.Minimum));
                    cmd.Parameters.AddWithValue("@Display", GetNull(item.Display));
                    cmd.Parameters.AddWithValue("@IsCustom", GetNull(item.IsCustom));
                    cmd.Parameters.AddWithValue("@ShowCheckbox", GetNull(item.ShowCheckbox));
                    cmd.Parameters.AddWithValue("@IsOn", GetNull(item.IsOn));
                    cmd.Parameters.AddWithValue("@IsYes", GetNull(item.IsYes));
                    cmd.Parameters.AddWithValue("@LinkType", GetNull(item.LinkType));
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
            //return new CharactersCharacterStat();
        }

        public List<CharactersCharacterStat> GetByCharacterStatId(int characterStatId, int characterId)
        {
            List<CharactersCharacterStat> CharactersCharacterStats = _context.CharactersCharacterStats
               .Where(x => x.CharacterStatId == characterStatId
                    && x.CharacterId == characterId && x.IsDeleted != true).OrderBy(x => x.CharacterStat.SortOrder)
                    .ToList();

            if (CharactersCharacterStats == null) return CharactersCharacterStats;

            return CharactersCharacterStats;
        }

        public List<CharactersCharacterStat> GetByCharacterId(int characterId, int page = 1, int pageSize = 10)
        {


            List<CharactersCharacterStat> CharactersCharacterStats = _context.CharactersCharacterStats
               .Include(d => d.Character)
               .Include(d => d.CharacterStat.CharacterStatChoices)
               .Include(d => d.CharacterStat.CharacterStatType)
               .Include(d => d.CharacterStat.CharacterStatCalcs)
               .Include(d => d.CharacterStat.CharacterStatConditions)             
               .Include(d => d.CharacterStatTiles)
               .Where(x => x.CharacterId == characterId && x.IsDeleted != true).OrderBy(x => x.CharacterStat.SortOrder)
               .ToList();

            if (page > 0 && pageSize > 0)
                CharactersCharacterStats = CharactersCharacterStats.Skip(pageSize * (page - 1)).Take(pageSize).ToList();

            if (CharactersCharacterStats == null) return CharactersCharacterStats;

            foreach (CharactersCharacterStat ccs in CharactersCharacterStats)
            {
                ccs.CharacterStatTiles = ccs.CharacterStatTiles.Where(p => p.IsDeleted != true).ToList();

            }

            foreach (CharactersCharacterStat ccs in CharactersCharacterStats)
            {
                ccs.Character.CharactersCharacterStats = null;
                //ccs.Character.CharacterAbilities = null;
                //ccs.Character.CharacterSpells = null;
                ccs.Character.CharacterTiles = null;
            }

            return CharactersCharacterStats;
        }


        public List<CharactersCharacterStat> GetStatListByCharacterId(int characterId, int page = 1, int pageSize = 10)
        {


            List<CharactersCharacterStat> CharactersCharacterStats = _context.CharactersCharacterStats
               //.Include(d => d.Character)
               //.Include(d => d.CharacterStat.CharacterStatChoices)
               //.Include(d => d.CharacterStat.CharacterStatType)
               //.Include(d => d.CharacterStat.CharacterStatCalcs)
               //.Include(d => d.CharacterStatTiles)
               .Where(x => x.CharacterId == characterId && x.IsDeleted != true).OrderBy(x => x.CharacterStat.SortOrder)
               .Include(d => d.CharacterStat)
               .ToList();

            if (page > 0 && pageSize > 0)
                CharactersCharacterStats = CharactersCharacterStats.Skip(pageSize * (page - 1)).Take(pageSize).ToList();

                              

            return CharactersCharacterStats;
        }

        public async Task<CharactersCharacterStat> Update(CharactersCharacterStat item)
        {
            var CharactersCharacterStat = await _repo.Get(item.CharactersCharacterStatId);

            if (CharactersCharacterStat == null)
                return CharactersCharacterStat;

            CharactersCharacterStat.Text = item.Text;
            CharactersCharacterStat.RichText = item.RichText;
            CharactersCharacterStat.Command = item.Command;
            CharactersCharacterStat.YesNo = item.YesNo;
            CharactersCharacterStat.OnOff = item.OnOff;
            CharactersCharacterStat.Value = item.Value;
            CharactersCharacterStat.SubValue = item.SubValue;
            CharactersCharacterStat.Current = item.Current;
            CharactersCharacterStat.Maximum = item.Maximum;
            CharactersCharacterStat.Minimum = item.Minimum;
            CharactersCharacterStat.DefaultValue = item.DefaultValue;
            CharactersCharacterStat.ComboText = item.ComboText;
            CharactersCharacterStat.CalculationResult = item.CalculationResult;
            CharactersCharacterStat.Number = item.Number;
            CharactersCharacterStat.Choice = item.Choice;
            CharactersCharacterStat.MultiChoice = item.MultiChoice;
            CharactersCharacterStat.IsOn = item.IsOn;
            CharactersCharacterStat.IsYes = item.IsYes;
            CharactersCharacterStat.ShowCheckbox = item.ShowCheckbox;
            CharactersCharacterStat.LinkType = item.LinkType;

            try
            {
                await _repo.Update(CharactersCharacterStat);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return CharactersCharacterStat;
        }

        public async Task<CharactersCharacterStat> UpdateCommandImage(int id, string image)
        {
            var CharactersCharacterStat = await _repo.Get(id);

            if (CharactersCharacterStat == null)
                return CharactersCharacterStat;

            CharactersCharacterStat.Text = image; //saving image in text field for command only

            try
            {
                await _repo.Update(CharactersCharacterStat);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return CharactersCharacterStat;
        }

        public void Update(List<CharactersCharacterStat> characterStats, bool AlertToGM, bool AlertToPlayer)
        {

            //foreach (CharactersCharacterStat cs in characterStats)
            //{
            //    var CharactersCharacterStat = _context.CharactersCharacterStats.Where(p => p.CharactersCharacterStatId == cs.CharactersCharacterStatId).SingleOrDefault();
            //    if (cs.CharacterStat.CharacterStatCalcs.Count() > 0)
            //    {
            //        foreach (var calc in cs.CharacterStat.CharacterStatCalcs)
            //        {

            //        }
            //    }
            //    CharactersCharacterStat.Text = cs.Text;
            //    CharactersCharacterStat.RichText = cs.RichText;
            //    CharactersCharacterStat.Command = cs.Command;
            //    CharactersCharacterStat.YesNo = cs.YesNo;
            //    CharactersCharacterStat.OnOff = cs.OnOff;
            //    CharactersCharacterStat.Value = cs.Value;
            //    CharactersCharacterStat.SubValue = cs.SubValue;
            //    CharactersCharacterStat.Current = cs.Current;
            //    CharactersCharacterStat.Maximum = cs.Maximum;
            //    CharactersCharacterStat.CalculationResult = cs.CalculationResult;
            //    CharactersCharacterStat.Number = cs.Number;
            //    CharactersCharacterStat.Choice = cs.Choice;
            //    CharactersCharacterStat.MultiChoice = cs.MultiChoice;
            //}

            //try
            //{
            //    _context.SaveChanges();
            //}
            //catch (Exception ex)
            //{
            //    throw ex;
            //}
            try
            {
                int index = 0;
                List<CommonCharactersCharacterStat> dtList = characterStats.Select(o => new CommonCharactersCharacterStat()
                {
                    RowNum = index = Getindex(index),
                    CharactersCharacterStatId = o.CharactersCharacterStatId,
                    CharacterStatId = o.CharacterStatId,
                    CharacterId = o.CharacterId,
                    Text = o.Text,
                    RichText = o.RichText,
                    Choice = o.Choice,
                    MultiChoice = o.MultiChoice,
                    Command = o.Command,
                    YesNo = o.YesNo,
                    OnOff = o.OnOff,
                    Value = o.Value,
                    SubValue = o.SubValue,
                    Current = o.Current,
                    Maximum = o.Maximum,
                    Minimum = o.Minimum,
                    ComboText = o.ComboText,
                    DefaultValue = o.DefaultValue,
                    CalculationResult = o.CalculationResult,
                    Number = o.Number,
                    IsDeleted = o.IsDeleted,
                    //CustomToggleId=o.CustomToggleId,
                    Display=o.Display,
                    IsCustom=o.IsCustom,
                    IsOn=o.IsOn,
                    IsYes=o.IsYes,
                    ShowCheckbox=o.ShowCheckbox,
                    LinkType=o.LinkType,
                }).ToList();
                DataTable dt = utility.ToDataTable<CommonCharactersCharacterStat>(dtList);
                if (dt.Rows.Count > 0)
                {
                    string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

                    using (SqlConnection con = new SqlConnection(consString))
                    {
                        using (SqlCommand cmd = new SqlCommand("CharacterCharacterStats_Update"))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Connection = con;
                            cmd.Parameters.AddWithValue("@characterCharacterStatList", dt);
                            cmd.Parameters.AddWithValue("@alertToGM", AlertToGM);
                            cmd.Parameters.AddWithValue("@alertToPlayer", AlertToPlayer);
                            con.Open();
                            var a = cmd.ExecuteNonQuery();
                            con.Close();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        private static int Getindex(int index)
        {
            index = index + 1;
            return index;
        }
        public List<CharactersCharacterStat> GetNumericStatsByCharacterId(int characterId, int page, int pageSize)
        {
            //List<CharactersCharacterStat> CharactersCharacterStats = _context.CharactersCharacterStats
            //    .Include(d => d.Character)
            //    .Include(d => d.CharacterStat.CharacterStatType)
            //    .Include(d => d.CharacterStat.CharacterStatCalcs)
            //    .Where(x => x.CharacterId == characterId && (x.CharacterStat.CharacterStatType.StatTypeName == "Combo" || x.CharacterStat.CharacterStatType.StatTypeName == "Calculation" || x.CharacterStat.CharacterStatType.StatTypeName == "Value & Sub-Value" || x.CharacterStat.CharacterStatType.StatTypeName == "Current & Max" || x.CharacterStat.CharacterStatType.StatTypeName == "Number" || x.CharacterStat.CharacterStatType.StatTypeName == "Command") && x.IsDeleted != true)
            //    .OrderBy(x => x.CharacterStat.SortOrder).ToList();

            //if (page > 0 && pageSize > 0)
            //    CharactersCharacterStats = CharactersCharacterStats.Skip(pageSize * (page - 1)).Take(pageSize).ToList();

            List<CharactersCharacterStat> CharactersCharacterStats = GetByCharacterId_sp(characterId, page, pageSize, true);
              


            return CharactersCharacterStats;
        }

        public List<CharacterStat> GetNumericStatsByRulesetId(int rulesetId, int page, int pageSize)
        {
            int parentRulesetId = rulesetId;
            var _ruleset = _context.RuleSets.Where(x => x.RuleSetId == rulesetId).FirstOrDefault();
            if (_ruleset != null)
                parentRulesetId = _ruleset.ParentRuleSetId == null ? parentRulesetId : _ruleset.ParentRuleSetId ?? 0;

            //List<CharacterStat> CharacterStats = _context.CharacterStats
            //    .Include(d => d.CharacterStatType)
            //    .Include(d => d.CharacterStatCalcs)
            //    .Where(x => (x.RuleSetId == rulesetId || x.RuleSetId == parentRulesetId) && (x.CharacterStatType.StatTypeName == "Calculation" || x.CharacterStatType.StatTypeName == "Value & Sub-Value" || x.CharacterStatType.StatTypeName == "Current & Max" || x.CharacterStatType.StatTypeName == "Number") && x.IsDeleted != true)
            //    .OrderBy(x => x.SortOrder).ToList();

            //      if (page > 0 && pageSize > 0)
            //    CharacterStats = CharacterStats.Skip(pageSize * (page - 1)).Take(pageSize).ToList();

            List<CharacterStat> CharacterStats = GetByRulesetId_sp(rulesetId, parentRulesetId, page, pageSize,true);

            


            return CharacterStats;
        }
        public CharacterStatToggle GetCharacterStatToggleList(int characterStatId) {
            var res = _context.CharacterStatToggle.Where(x => x.CharacterStatId == characterStatId && x.IsDeleted == false).Select(x => new CharacterStatToggle() {
                CharacterStatId = x.CharacterStatId,
                CharacterStatToggleId = x.CharacterStatToggleId,
                Display = x.Display,
                IsCustom = x.IsCustom,
                IsDeleted = x.IsDeleted,
                OnOff = x.OnOff,
                ShowCheckbox = x.ShowCheckbox,
                YesNo = x.YesNo,
                CustomToggles = _context.CustomToggle.Where(z => z.CharacterStatToggleId == x.CharacterStatToggleId).ToList()
            }).FirstOrDefault();
            return res;
        }
        public List<LinkTypeRecord> getLinkTypeRecords(int characterId)
        {
            var itemsList = _context.Items.Where(z => z.CharacterId == characterId && z.IsDeleted != true).ToList();
            var spellsList = _context.CharacterSpells.Where(z => z.CharacterId == characterId && z.IsDeleted != true).Include(x => x.Spell).ToList();
            var abilitiesList = _context.CharacterAbilities.Where(z => z.CharacterId == characterId && z.IsDeleted != true).Include(x => x.Ability).ToList();
            var buffAndEffectsList = _context.CharacterBuffAndEffects.Where(z => z.CharacterId == characterId && z.IsDeleted!=true).Include(x => x.BuffAndEffect).ToList();

            List<LinkTypeRecord> resList = new List<LinkTypeRecord>();

            foreach (var item in itemsList)
            {
                resList.Add(new LinkTypeRecord()
                {
                    id = item.ItemId,
                    image = item.ItemImage,
                    name = item.Name,
                    type = "item",
                    isItemEquiped = item.IsEquipped
                });
            }
            foreach (var spell in spellsList)
            {
                resList.Add(new LinkTypeRecord()
                {
                    id = spell.CharacterSpellId,
                    image = spell.Spell.ImageUrl,
                    name = spell.Spell.Name,
                    type = "spell",
                    isSpellMemorized=spell.IsMemorized
                });
            }
            foreach (var ability in abilitiesList)
            {
                resList.Add(new LinkTypeRecord()
                {
                    id = ability.CharacterAbilityId,
                    image = ability.Ability.ImageUrl,
                    name = ability.Ability.Name,
                    type = "ability",
                    isAbilityEnabled=ability.IsEnabled
                });
            }
            foreach (var be in buffAndEffectsList)
            {
                resList.Add(new LinkTypeRecord()
                {
                    id = be.CharacterBuffAandEffectId,
                    image = be.BuffAndEffect.ImageUrl,
                    name = be.BuffAndEffect.Name,
                    type = "be",                    
                });
            }
            return resList;
        }
        public async Task<List<CharactersCharacterStat>> GetConditionsValuesList(int characterId)
        {
            //List<CharactersCharacterStat> CharactersCharacterStats =await _context.CharactersCharacterStats                
            //    .Include(d => d.CharacterStat.CharacterStatChoices).Include(x=>x.CharacterStat.CharacterStatConditions)
            //    .Include(x => x.CharacterStat.CharacterStatCalcs)
            //   .Where(x => x.CharacterId == characterId && x.IsDeleted != true).OrderBy(x => x.CharacterStat.SortOrder)
            //   .ToListAsync();

            //foreach (var item in CharactersCharacterStats)
            //{
            //    foreach (var cond in item.CharacterStat.CharacterStatConditions)
            //    {
            //        cond.ConditionOperator = _context.ConditionOperators.Where(x => x.ConditionOperatorId == cond.ConditionOperatorID).FirstOrDefault();
            //    }

            //}
            //return CharactersCharacterStats;
            List<CharactersCharacterStat> CCSList = new List<CharactersCharacterStat>();
            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("[CharactersCharacterStats_GetByCharacterID]", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterID", characterId);
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
                short num = 0;
                List<CharactersCharacterStat> list = new List<CharactersCharacterStat>();
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    CharactersCharacterStat ccs = new CharactersCharacterStat()
                    {
                        CalculationResult = row["CalculationResult"] == DBNull.Value ? 0 : Convert.ToInt32(row["CalculationResult"]),
                        CharacterId = row["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterId"]),
                        CharactersCharacterStatId = row["CharactersCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharactersCharacterStatId"]),
                        CharacterStatId = row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterStatId"]),
                        Choice = row["Choice"] == DBNull.Value ? null : row["Choice"].ToString(),
                        Command = row["Command"] == DBNull.Value ? null : row["Command"].ToString(),
                        Current = row["Current"] == DBNull.Value ? 0 : Convert.ToInt32(row["Current"]),
                        IsDeleted = row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(row["IsDeleted"]),
                        Maximum = row["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(row["Maximum"]),
                        MultiChoice = row["MultiChoice"] == DBNull.Value ? null : row["MultiChoice"].ToString(),
                        Number = row["Number"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["Number"]),
                        OnOff = row["OnOff"] == DBNull.Value ? false : Convert.ToBoolean(row["OnOff"]),
                        RichText = row["RichText"] == DBNull.Value ? null : row["RichText"].ToString(),
                        SubValue = row["SubValue"] == DBNull.Value ? 0 : Convert.ToInt32(row["SubValue"]),
                        Text = row["Text"] == DBNull.Value ? null : row["Text"].ToString(),
                        Value = row["Value"] == DBNull.Value ? 0 : Convert.ToInt32(row["Value"]),
                        YesNo = row["YesNo"] == DBNull.Value ? false : Convert.ToBoolean(row["YesNo"]),
                        Minimum = row["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(row["Minimum"]),
                        DefaultValue = row["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(row["DefaultValue"]),
                        ComboText = row["ComboText"] == DBNull.Value ? "" : row["ComboText"].ToString(),
                        Display = row["Display"] == DBNull.Value ? false : Convert.ToBoolean(row["Display"]),
                        IsCustom = row["IsCustom"] == DBNull.Value ? false : Convert.ToBoolean(row["IsCustom"]),
                        IsOn = row["IsOn"] == DBNull.Value ? false : Convert.ToBoolean(row["IsOn"]),
                        IsYes = row["IsYes"] == DBNull.Value ? false : Convert.ToBoolean(row["IsYes"]),
                        ShowCheckbox = row["ShowCheckbox"] == DBNull.Value ? false : Convert.ToBoolean(row["ShowCheckbox"]),
                        LinkType = row["LinkType"] == DBNull.Value ? null : row["LinkType"].ToString(),
                        CharacterStat = new CharacterStat()
                        {
                            CharacterStatTypeId = row["CharacterStatTypeId"] == DBNull.Value ? num : (short)(row["CharacterStatTypeId"]),
                            CharacterStatId = row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterStatId"]),
                            StatName = row["StatName"] == DBNull.Value ? null : row["StatName"].ToString(),
                            isMultiSelect = row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(row["isMultiSelect"]),

                            //CharacterStatChoices = _characterStatChoiceService.GetByIds(((row["Choice"] == DBNull.Value ? "" : row["Choice"].ToString()) + (row["MultiChoice"] == DBNull.Value ? "" : row["MultiChoice"].ToString())).ToString()),
                            //CharacterStatCalcs = _characterStatCalcService.GetByStatId(row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(row["CharacterStatId"]))
                        }

                    };
                    utility.FillStatChoices(ds, ccs.CharacterStat, (int)ccs.CharacterStatId, 3);
                    utility.FillStatCalcs(ds, ccs.CharacterStat, (int)ccs.CharacterStatId, 2);
                    utility.FillConditionStats(ds, ccs, ccs.CharacterStat, 4);
                    list.Add(ccs);
                }
                CCSList = list;
            }
            return CCSList;
        }
        private object GetNull(object obj)
        {
            if (obj == null)
                return DBNull.Value;
            else if (obj.GetType() == typeof(bool))
            {
                if ((bool)obj)
                    return 1;
                else
                    return 0;
            }
            else
                return obj;
        }
        public List<CharactersCharacterStat> GetByCharacterId_sp(int characterId, int page = 1, int pageSize = 10,bool getResultForAddModScreen = false)
        {
            List<CharactersCharacterStat> CharactersCharacterStatsList = new List<CharactersCharacterStat>();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Character_GetTilesByPageID @CharacterID = '" + characterId + "' ,@PageID='" + pageId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("CharCharStatReferenced_GetByCharacterID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@CharacterID", characterId);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.Parameters.AddWithValue("@getResultForAddModScreen", getResultForAddModScreen);
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


            //////////////////////////////////////////////////////////////////////////////////////////////////////
            utility.FillCharacterCharacterStats(CharactersCharacterStatsList, ds);
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            return CharactersCharacterStatsList;
        }

        

        public List<CharacterStat> GetByRulesetId_sp(int RulesetID, int ParentRulesetID, int page = 1, int pageSize = 10,bool getResultForAddModScreen = false)
        {
            List<CharacterStat> CharacterStatsList = new List<CharacterStat>();

            string connectionString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //string qry = "EXEC Character_GetTilesByPageID @CharacterID = '" + characterId + "' ,@PageID='" + pageId + "'";

            SqlConnection connection = new SqlConnection(connectionString);
            SqlCommand command = new SqlCommand();
            SqlDataAdapter adapter = new SqlDataAdapter();
            DataSet ds = new DataSet();
            try
            {
                connection.Open();
                command = new SqlCommand("CharStatReferenced_GetByRulesetID", connection);

                // Add the parameters for the SelectCommand.
                command.Parameters.AddWithValue("@RulesetID", RulesetID);
                command.Parameters.AddWithValue("@ParentRulesetID", ParentRulesetID);
                command.Parameters.AddWithValue("@page", page);
                command.Parameters.AddWithValue("@size", pageSize);
                command.Parameters.AddWithValue("@getResultForAddModScreen", getResultForAddModScreen);
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


            //////////////////////////////////////////////////////////////////////////////////////////////////////
            if (ds.Tables[1].Rows.Count > 0)
            {
                foreach (DataRow CharStat_Row in ds.Tables[1].Rows)
                {
                    
                    int? nullInt = null;
                    CharacterStat CharStat = null;
                    short num = 0;
                    int characterstatID = CharStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["CharacterStatId"]);
                   
                        CharStat = new CharacterStat()
                        {
                            CharacterStatId = characterstatID,
                            RuleSetId = CharStat_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["RuleSetId"]),
                            StatName = CharStat_Row["StatName"] == DBNull.Value ? null : CharStat_Row["StatName"].ToString(),
                            StatDesc = CharStat_Row["StatDesc"] == DBNull.Value ? null : CharStat_Row["StatDesc"].ToString(),
                            isActive = CharStat_Row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["isActive"]),
                            CharacterStatTypeId = CharStat_Row["CharacterStatTypeId"] == DBNull.Value ? num : (short)(CharStat_Row["CharacterStatTypeId"]),
                            isMultiSelect = CharStat_Row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["isMultiSelect"]),
                            ParentCharacterStatId = CharStat_Row["ParentCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharStat_Row["ParentCharacterStatId"]),
                            SortOrder = CharStat_Row["SortOrder"] == DBNull.Value ? num : (short)(CharStat_Row["SortOrder"]),
                            IsDeleted = CharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["IsDeleted"]),
                            CreatedBy = CharStat_Row["CreatedBy"] == DBNull.Value ? null : CharStat_Row["CreatedBy"].ToString(),
                            CreatedDate = CharStat_Row["CreatedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(CharStat_Row["CreatedDate"]),
                            OwnerId = CharStat_Row["OwnerId"] == DBNull.Value ? null : CharStat_Row["OwnerId"].ToString(),
                            AddToModScreen = CharStat_Row["AddToModScreen"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["AddToModScreen"]),
                            AlertPlayer = CharStat_Row["AlertPlayer"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["AlertPlayer"]),
                            AlertGM = CharStat_Row["AlertGM"] == DBNull.Value ? false : Convert.ToBoolean(CharStat_Row["AlertGM"]),
                        };

                        List<CharacterStatCalc> calcs = new List<CharacterStatCalc>();
                        if (ds.Tables[3].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[3].Rows)
                            {
                                int calcCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                if (characterstatID == calcCharacterStat)
                                {
                                    CharacterStatCalc cal = new CharacterStatCalc();
                                    cal.CharacterStatCalcId = r["CharacterStatCalcId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatCalcId"]);
                                    cal.StatCalculation = r["StatCalculation"] == DBNull.Value ? null : r["StatCalculation"].ToString();
                                    cal.CharacterStatId = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                    cal.IsDeleted = r["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(r["IsDeleted"]);
                                    cal.StatCalculationIds = r["StatCalculationIds"] == DBNull.Value ? null : r["StatCalculationIds"].ToString();
                                    calcs.Add(cal);
                                }
                            }
                        }
                        CharStat.CharacterStatCalcs = calcs;

                        CharacterStatType statType = new CharacterStatType();
                        if (ds.Tables[2].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[2].Rows)
                            {
                                short CharacterStatTypeID = r["CharacterStatTypeId"] == DBNull.Value ? num : (short)(r["CharacterStatTypeId"]);
                                if (CharacterStatTypeID == CharStat.CharacterStatTypeId)
                                {
                                    statType = new CharacterStatType();
                                    statType.CharacterStatTypeId = CharacterStatTypeID;
                                    statType.StatTypeName = r["StatTypeName"] == DBNull.Value ? null : r["StatTypeName"].ToString();
                                    statType.StatTypeDesc = r["StatTypeDesc"] == DBNull.Value ? null : r["StatTypeDesc"].ToString();
                                    statType.isNumeric = r["isNumeric"] == DBNull.Value ? false : Convert.ToBoolean(r["isNumeric"]);
                                    statType.TypeId = r["TypeId"] == DBNull.Value ? num : (short)(r["TypeId"]);
                                }
                            }
                        }
                        CharStat.CharacterStatType = statType;



                    CharStat.RuleSet = new RuleSet();

                    if (ds.Tables[0].Rows.Count > 0)
                    {
                        CharStat.RuleSet = _repo.GetRuleset(ds.Tables[0], num);                      
                    }
                    CharacterStatsList.Add(CharStat);
                }
            }
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            return CharacterStatsList;
        }
        public CharCharStatDetails getCharCharStatDetails(int characterId) {
            CharCharStatDetails obj = new CharCharStatDetails();
            obj.LinkRecordsDetails = getLinkTypeRecords(characterId).ToList();
            //////////////////////////////////////////////////////////////
            List<CharactersCharacterStatViewModel> ResultList = new List<CharactersCharacterStatViewModel>();
            CharactersCharacterStatViewModel CharactersCharacterStatVievModel = new CharactersCharacterStatViewModel();
            List<CharactersCharacterStat> data = GetConditionsValuesList(characterId).Result;
            foreach (CharactersCharacterStat item in data)
            {
                CharactersCharacterStatVievModel = new CharactersCharacterStatViewModel()
                {
                    CalculationResult = item.CalculationResult,
                    CharacterId = item.CharacterId,
                    CharactersCharacterStatId = item.CharactersCharacterStatId,
                    CharacterStatId = item.CharacterStatId,
                    Choice = item.Choice,
                    Command = item.Command,
                    Current = item.Current,
                    IsDeleted = item.IsDeleted,
                    Maximum = item.Maximum,
                    MultiChoice = item.MultiChoice,
                    Number = item.Number,
                    OnOff = item.OnOff,
                    RichText = item.RichText,
                    SubValue = item.SubValue,
                    Text = item.Text,
                    Value = item.Value,
                    YesNo = item.YesNo,
                    ComboText = item.ComboText,
                    DefaultValue = item.DefaultValue,
                    Minimum = item.Minimum,
                    Display = item.Display,
                    IsCustom = item.IsCustom,
                    IsOn = item.IsOn,
                    IsYes = item.IsYes,
                    ShowCheckbox = item.ShowCheckbox,
                    LinkType = item.LinkType,
                    CharacterStat = new CharacterStat()
                    {
                        CharacterStatId = item.CharacterStat.CharacterStatId,
                        CharacterStatTypeId = item.CharacterStat.CharacterStatTypeId,
                        StatName = item.CharacterStat.StatName,
                        isMultiSelect = item.CharacterStat.isMultiSelect,
                        CharacterStatChoices = item.CharacterStat.CharacterStatChoices.Select(z => new CharacterStatChoice
                        {
                            CharacterStatChoiceId = z.CharacterStatChoiceId,
                            CharacterStatId = z.CharacterStatId,
                            IsDeleted = z.IsDeleted,
                            StatChoiceValue = z.StatChoiceValue
                        }).ToList(),
                        CharacterStatConditions = item.CharacterStat.CharacterStatConditions.Select(z => new CharacterStatCondition()
                        {
                            CharacterStatConditionId = z.CharacterStatConditionId,
                            CharacterStatId = z.CharacterStatId,
                            ConditionOperatorID = z.ConditionOperatorID,
                            IfClauseStatText = z.IfClauseStatText,
                            IsNumeric = z.IsNumeric,
                            CompareValue = z.CompareValue,
                            Result = z.Result,
                            SortOrder = z.SortOrder,
                            ConditionOperator = z.ConditionOperator,
                        }).ToList(),
                        CharacterStatCalcs = item.CharacterStat.CharacterStatCalcs.Select(z => new CharacterStatCalc()
                        {
                            CharacterStatCalcId = z.CharacterStatCalcId,
                            CharacterStatId = z.CharacterStatId,
                            IsDeleted = z.IsDeleted,
                            StatCalculation = z.StatCalculation,
                            StatCalculationIds = z.StatCalculationIds,
                        }).ToList(),
                    }

                };
                ResultList.Add(CharactersCharacterStatVievModel);
            }
            obj.ConditionsValuesLists = ResultList;
            /////////////////////////////////////////////////////////////////

            //////////////////////////////////////////////
            var CharCharStats = GetByCharacterId_sp(characterId, 1, 9999999);
            List<CharactersCharacterStatViewModel> CharactersCharacterStatVievModels = utility.GetCharCharStatViewModelList(CharCharStats, _characterStatChoiceService);
            obj.CharactersCharacterStats = CharactersCharacterStatVievModels;
            ////////////////////////////////////////////////
            return obj;
        }


    }
}
