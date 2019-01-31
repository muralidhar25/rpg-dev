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
            List<CharactersCharacterStat> CharactersCharacterStats = _context.CharactersCharacterStats
                .Include(d => d.Character)
                .Include(d => d.CharacterStat.CharacterStatType)
                .Include(d => d.CharacterStat.CharacterStatCalcs)
                .Where(x => x.CharacterId == characterId && (x.CharacterStat.CharacterStatType.StatTypeName == "Combo" || x.CharacterStat.CharacterStatType.StatTypeName == "Calculation" || x.CharacterStat.CharacterStatType.StatTypeName == "Value & Sub-Value" || x.CharacterStat.CharacterStatType.StatTypeName == "Current & Max" || x.CharacterStat.CharacterStatType.StatTypeName == "Number") && x.IsDeleted != true)
                .OrderBy(x => x.CharacterStat.SortOrder).ToList();

            if (page > 0 && pageSize > 0)
                CharactersCharacterStats = CharactersCharacterStats.Skip(pageSize * (page - 1)).Take(pageSize).ToList();


            return CharactersCharacterStats;
        }

        public List<CharacterStat> GetNumericStatsByRulesetId(int rulesetId, int page, int pageSize)
        {
            int parentRulesetId = rulesetId;
            var _ruleset = _context.RuleSets.Where(x => x.RuleSetId == rulesetId).FirstOrDefault();
            if (_ruleset != null)
                parentRulesetId = _ruleset.ParentRuleSetId == null ? parentRulesetId : _ruleset.ParentRuleSetId ?? 0;

            List<CharacterStat> CharacterStats = _context.CharacterStats
                .Include(d => d.CharacterStatType)
                .Include(d => d.CharacterStatCalcs)
                .Where(x => (x.RuleSetId == rulesetId || x.RuleSetId == parentRulesetId) && (x.CharacterStatType.StatTypeName == "Calculation" || x.CharacterStatType.StatTypeName == "Value & Sub-Value" || x.CharacterStatType.StatTypeName == "Current & Max" || x.CharacterStatType.StatTypeName == "Number") && x.IsDeleted != true)
                .OrderBy(x => x.SortOrder).ToList();

            if (page > 0 && pageSize > 0)
                CharacterStats = CharacterStats.Skip(pageSize * (page - 1)).Take(pageSize).ToList();


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
                    type = "item"
                });
            }
            foreach (var spell in spellsList)
            {
                resList.Add(new LinkTypeRecord()
                {
                    id = spell.CharacterSpellId,
                    image = spell.Spell.ImageUrl,
                    name = spell.Spell.Name,
                    type = "spell"
                });
            }
            foreach (var ability in abilitiesList)
            {
                resList.Add(new LinkTypeRecord()
                {
                    id = ability.CharacterAbilityId,
                    image = ability.Ability.ImageUrl,
                    name = ability.Ability.Name,
                    type = "ability"
                });
            }

            return resList;
        }
        public async Task<List<CharactersCharacterStat>> GetConditionsValuesList(int characterId)
        {
            List<CharactersCharacterStat> CharactersCharacterStats =await _context.CharactersCharacterStats                
                .Include(d => d.CharacterStat.CharacterStatChoices)
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
    }
}
