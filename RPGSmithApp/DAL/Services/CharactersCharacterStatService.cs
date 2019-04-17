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

        public CharactersCharacterStatService(ApplicationDbContext context, IRepository<CharactersCharacterStat> repo, IConfiguration configuration)
        {
            _repo = repo;
            _context = context;
            _configuration = configuration;
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

        public void Update(List<CharactersCharacterStat> characterStats)
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

            return resList;
        }
        public async Task<List<CharactersCharacterStat>> GetConditionsValuesList(int characterId)
        {
            List<CharactersCharacterStat> CharactersCharacterStats =await _context.CharactersCharacterStats                
                .Include(d => d.CharacterStat.CharacterStatChoices).Include(x=>x.CharacterStat.CharacterStatConditions)
               .Where(x => x.CharacterId == characterId && x.IsDeleted != true).OrderBy(x => x.CharacterStat.SortOrder)
               .ToListAsync();
            return CharactersCharacterStats;
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
            if (ds.Tables[1].Rows.Count > 0)
            {
                foreach (DataRow CharCharStat_Row in ds.Tables[1].Rows)
                {
                    CharactersCharacterStat CharCharStat = null;
                    int? nullInt = null;
                    int CharactersCharacterStatId = CharCharStat_Row["CharactersCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharactersCharacterStatId"]);

                    CharCharStat = new CharactersCharacterStat()
                    {
                        CharactersCharacterStatId = CharactersCharacterStatId,
                        CharacterStatId = CharCharStat_Row["CharacterStatId"] == DBNull.Value ? nullInt : Convert.ToInt32(CharCharStat_Row["CharacterStatId"]),
                        CharacterId = CharCharStat_Row["CharacterId"] == DBNull.Value ? nullInt : Convert.ToInt32(CharCharStat_Row["CharacterId"]),
                        Text = CharCharStat_Row["Text"] == DBNull.Value ? null : CharCharStat_Row["Text"].ToString(),
                        RichText = CharCharStat_Row["RichText"] == DBNull.Value ? null : CharCharStat_Row["RichText"].ToString(),
                        Choice = CharCharStat_Row["Choice"] == DBNull.Value ? null : CharCharStat_Row["Choice"].ToString(),
                        MultiChoice = CharCharStat_Row["MultiChoice"] == DBNull.Value ? null : CharCharStat_Row["MultiChoice"].ToString(),
                        Command = CharCharStat_Row["Command"] == DBNull.Value ? null : CharCharStat_Row["Command"].ToString(),
                        YesNo = CharCharStat_Row["YesNo"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["YesNo"]),
                        OnOff = CharCharStat_Row["OnOff"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["OnOff"]),
                        Value = CharCharStat_Row["Value"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Value"]),
                        Number = CharCharStat_Row["Number"] == DBNull.Value ? (int?)null : Convert.ToInt32(CharCharStat_Row["Number"]),
                        SubValue = CharCharStat_Row["SubValue"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["SubValue"]),
                        Current = CharCharStat_Row["Current"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Current"]),
                        Maximum = CharCharStat_Row["Maximum"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Maximum"]),
                        CalculationResult = CharCharStat_Row["CalculationResult"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CalculationResult"]),
                        Minimum = CharCharStat_Row["Minimum"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["Minimum"]),
                        DefaultValue = CharCharStat_Row["DefaultValue"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["DefaultValue"]),
                        ComboText = CharCharStat_Row["ComboText"] == DBNull.Value ? null : CharCharStat_Row["ComboText"].ToString(),
                        IsDeleted = CharCharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsDeleted"]),
                        Display = CharCharStat_Row["Display"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["Display"]),
                        ShowCheckbox = CharCharStat_Row["ShowCheckbox"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["ShowCheckbox"]),
                        IsCustom = CharCharStat_Row["IsCustom"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsCustom"]),
                        //CustomToggleId = CharCharStat_Row["CustomToggleId"] == DBNull.Value ? nullInt : Convert.ToInt32(CharCharStat_Row["CustomToggleId"]),
                        IsYes = CharCharStat_Row["IsYes"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsYes"]),
                        IsOn = CharCharStat_Row["IsOn"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsOn"]),
                        LinkType = CharCharStat_Row["LinkType"] == DBNull.Value ? null : CharCharStat_Row["LinkType"].ToString(),

                    };

                    CharacterStat CharStat = null;
                    short num = 0;
                    int characterstatID = CharCharStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["CharacterStatId"]);
                    if (characterstatID == CharCharStat.CharacterStatId)
                    {
                        CharStat = new CharacterStat()
                        {
                            CharacterStatId = characterstatID,
                            RuleSetId = CharCharStat_Row["RuleSetId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["RuleSetId"]),
                            StatName = CharCharStat_Row["StatName"] == DBNull.Value ? null : CharCharStat_Row["StatName"].ToString(),
                            StatDesc = CharCharStat_Row["StatDesc"] == DBNull.Value ? null : CharCharStat_Row["StatDesc"].ToString(),
                            isActive = CharCharStat_Row["isActive"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["isActive"]),
                            CharacterStatTypeId = CharCharStat_Row["CharacterStatTypeId"] == DBNull.Value ? num : (short)(CharCharStat_Row["CharacterStatTypeId"]),
                            isMultiSelect = CharCharStat_Row["isMultiSelect"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["isMultiSelect"]),
                            ParentCharacterStatId = CharCharStat_Row["ParentCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["ParentCharacterStatId"]),
                            SortOrder = CharCharStat_Row["SortOrder"] == DBNull.Value ? num : (short)(CharCharStat_Row["SortOrder"]),
                            IsDeleted = CharCharStat_Row["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsDeleted"]),
                            CreatedBy = CharCharStat_Row["CreatedBy"] == DBNull.Value ? null : CharCharStat_Row["CreatedBy"].ToString(),
                            CreatedDate = CharCharStat_Row["CreatedDate"] == DBNull.Value ? new DateTime() : Convert.ToDateTime(CharCharStat_Row["CreatedDate"]),
                            OwnerId = CharCharStat_Row["OwnerId"] == DBNull.Value ? null : CharCharStat_Row["OwnerId"].ToString(),
                            AddToModScreen = CharCharStat_Row["AddToModScreen"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["AddToModScreen"]),
                            IsChoiceNumeric = CharCharStat_Row["IsChoiceNumeric"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsChoiceNumeric"]),
                            IsChoicesFromAnotherStat = CharCharStat_Row["IsChoicesFromAnotherStat"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["IsChoicesFromAnotherStat"]),
                            SelectedChoiceCharacterStatId = CharCharStat_Row["SelectedChoiceCharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(CharCharStat_Row["SelectedChoiceCharacterStatId"]),
                        };

                        List<CharacterStatDefaultValue> defVals = new List<CharacterStatDefaultValue>();
                        if (ds.Tables[6].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[6].Rows)
                            {
                                int defValCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                if (characterstatID == defValCharacterStat)
                                {
                                    CharacterStatDefaultValue dv = new CharacterStatDefaultValue()
                                    {
                                        CharacterStatDefaultValueId = r["CharacterStatDefaultValueId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatDefaultValueId"]),
                                        CharacterStatId = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]),
                                        DefaultValue = r["DefaultValue"] == DBNull.Value ? null : r["DefaultValue"].ToString(),
                                        Maximum = r["Maximum"] == DBNull.Value ? nullInt : Convert.ToInt32(r["Maximum"]),
                                        Minimum = r["Minimum"] == DBNull.Value ? nullInt : Convert.ToInt32(r["Minimum"]),
                                        Type = r["Type"] == DBNull.Value ? 0 : Convert.ToInt32(r["Type"]),
                                    };
                                    defVals.Add(dv);
                                }
                            }
                        }
                        CharStat.CharacterStatDefaultValues = defVals;


                        List<CharacterStatCondition> cnds = new List<CharacterStatCondition>();
                        if (ds.Tables[5].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[5].Rows)
                            {
                                int CndCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                if (characterstatID == CndCharacterStat)
                                {
                                    CharacterStatCondition cnd = new CharacterStatCondition()
                                    {
                                        CharacterStatConditionId = r["CharacterStatConditionId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatConditionId"]),
                                        CompareValue = r["CompareValue"] == DBNull.Value ? null : r["CompareValue"].ToString(),
                                        IfClauseStatText = r["IfClauseStatText"] == DBNull.Value ? null : r["IfClauseStatText"].ToString(),
                                        IsNumeric = r["IsNumeric"] == DBNull.Value ? false : Convert.ToBoolean(r["IsNumeric"]),
                                        Result = r["Result"] == DBNull.Value ? null : r["Result"].ToString(),
                                        SortOrder = r["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(r["SortOrder"]),
                                        ConditionOperatorID = r["ConditionOperatorID"] == DBNull.Value ? nullInt : Convert.ToInt32(r["ConditionOperatorID"]),

                                    };
                                    if (cnd.ConditionOperatorID != null)
                                    {
                                        cnd.ConditionOperator = new ConditionOperator()
                                        {
                                            ConditionOperatorId = r["CO_ConditionOperatorId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CO_ConditionOperatorId"]),
                                            IsNumeric = r["CO_IsNumeric"] == DBNull.Value ? false : Convert.ToBoolean(r["CO_IsNumeric"]),
                                            Name = r["CO_Name"] == DBNull.Value ? null : r["CO_Name"].ToString(),
                                            Symbol = r["CO_Symbol"] == DBNull.Value ? null : r["CO_Symbol"].ToString(),
                                        };
                                    }
                                    cnds.Add(cnd);
                                }
                            }
                        }
                        CharStat.CharacterStatConditions = cnds;

                        List<CharacterStatChoice> Choices = new List<CharacterStatChoice>();
                        if (ds.Tables[4].Rows.Count > 0)
                        {
                            foreach (DataRow r in ds.Tables[4].Rows)
                            {
                                int choiceCharacterStat = r["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatId"]);
                                if (characterstatID == choiceCharacterStat)
                                {
                                    CharacterStatChoice ch = new CharacterStatChoice();
                                    ch.CharacterStatChoiceId = r["CharacterStatChoiceId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatChoiceId"]);
                                    ch.StatChoiceValue = r["StatChoiceValue"] == DBNull.Value ? null : r["StatChoiceValue"].ToString();
                                    ch.CharacterStatId = choiceCharacterStat;
                                    ch.IsDeleted = r["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(r["IsDeleted"]);

                                    Choices.Add(ch);
                                }
                                else {
                                    if (CharStat.SelectedChoiceCharacterStatId== choiceCharacterStat && CharStat.IsChoicesFromAnotherStat==true)
                                    {
                                        CharacterStatChoice ch = new CharacterStatChoice();
                                        ch.CharacterStatChoiceId = r["CharacterStatChoiceId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterStatChoiceId"]);
                                        ch.StatChoiceValue = r["StatChoiceValue"] == DBNull.Value ? null : r["StatChoiceValue"].ToString();
                                        ch.CharacterStatId = choiceCharacterStat;
                                        ch.IsDeleted = r["IsDeleted"] == DBNull.Value ? false : Convert.ToBoolean(r["IsDeleted"]);

                                        Choices.Add(ch);
                                    }
                                }
                            }
                        }
                        CharStat.CharacterStatChoices = Choices;


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
                    }
                    CharCharStat.CharacterStat = CharStat;

                    CharCharStat.Character = new Character();

                    if (ds.Tables[0].Rows.Count > 0)
                    {
                        foreach (DataRow r in ds.Tables[0].Rows)
                        {
                            int CharacterId = r["CharacterId"] == DBNull.Value ? 0 : Convert.ToInt32(r["CharacterId"]);
                            if (CharacterId == CharCharStat.CharacterId)
                            {
                                CharCharStat.Character = new Character()
                                {
                                    CharacterId = CharacterId,
                                    CharacterName = r["CharacterName"] == DBNull.Value ? null : r["CharacterName"].ToString(),
                                    ImageUrl = r["ImageUrl"] == DBNull.Value ? null : r["ImageUrl"].ToString(),
                                    InventoryWeight = r["InventoryWeight"] == DBNull.Value ? 0 : Convert.ToDecimal(r["InventoryWeight"]),
                                    ParentCharacterId = r["ParentCharacterId"] == DBNull.Value ? nullInt : Convert.ToInt32(r["ParentCharacterId"]),
                                    RuleSetId = r["RuleSetId"] == DBNull.Value ? nullInt : Convert.ToInt32(r["RuleSetId"]),
                                    UserId = r["UserId"] == DBNull.Value ? null : r["UserId"].ToString()
                                };
                            }
                        }
                    }
                    CharactersCharacterStatsList.Add(CharCharStat);
                }
            }
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
    }
}
