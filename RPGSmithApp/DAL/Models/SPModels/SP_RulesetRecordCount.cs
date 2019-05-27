using System;
using System.Collections.Generic;
using System.Data;
using System.Reflection;
using System.Text;

namespace DAL.Models.SPModels
{
    public class SP_RulesetRecordCount
    {
        public int SpellCount { get; set; }
        public int AbilityCount { get; set; }
        public int ItemMasterCount { get; set; }
        public int CharacterStatCount { get; set; }
        public int LayoutCount { get; set; }
        public int LootCount { get; set; }
    }
    public class SP_AbilitySpellForItemMaster
    {
        public List<Ability> abilityList { get; set; }
        public List<Spell> spellList { get; set; }
        public List<Ability> selectedAbilityList { get; set; }
        public List<Spell> selectedSpellList { get; set; }
        public List<ItemMasterCommand> selectedItemMasterCommand { get; set; }
        public List<ItemCommand> selectedItemCommand { get; set; }
    }
    public class SP_CharactersCharacterStat
    {
        public List<CharactersCharacterStat> charactersCharacterStat { get; set; }
        public Character character { get; set; }
    }
    public class CommonTileConfig
    {
        public int RowNum { get; set; }
        public int TileId { get; set; }
        public int SortOrder { get; set; }
        public string UniqueId { get; set; }
        public int Payload { get; set; }
        public int Col { get; set; }
        public int Row { get; set; }
        public int SizeX { get; set; }
        public int SizeY { get; set; }
        public bool IsDeleted { get; set; }
    }
    public class CommonCharactersCharacterStat
    {
        public int RowNum { get; set; }
        public int CharactersCharacterStatId { get; set; }
        public int? CharacterStatId { get; set; }
        public int? CharacterId { get; set; }
        public string Text { get; set; }
        public string RichText { get; set; }
        public string Choice { get; set; }
        public string MultiChoice { get; set; }
        public string Command { get; set; }
        public bool YesNo { get; set; }
        public bool OnOff { get; set; }
        public int Value { get; set; }
        public int? Number { get; set; }
        public int SubValue { get; set; }
        public int Current { get; set; }
        public int Maximum { get; set; }
        public int CalculationResult { get; set; }

        public int Minimum { get; set; }
        public int DefaultValue { get; set; }        
        public string ComboText { get; set; }

        public bool IsDeleted { get; set; }

        public bool Display { get; set; }
        public bool ShowCheckbox { get; set; }
        public bool IsCustom { get; set; }        
        public bool IsYes { get; set; }
        public bool IsOn { get; set; }
        public string LinkType { get; set; }
    }
    public class CommonID {
        public int ID { get; set; }
    }
    public static class utility
    {
        public static DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);

            //Get all the properties
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                //Defining type of data column gives proper data table 
                var type = (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>) ? Nullable.GetUnderlyingType(prop.PropertyType) : prop.PropertyType);
                //Setting column names as Property names
                dataTable.Columns.Add(prop.Name, type);
            }
            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    //inserting property values to datatable rows
                    values[i] = Props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            //put a breakpoint here and check datatable
            return dataTable;
        }
        public static void FillConditionStats(DataSet ds, CharactersCharacterStat CharCharStat, CharacterStat CharStat, int TableNo)
        {
            CharStat.CharacterStatConditions = new List<CharacterStatCondition>();
            if (ds.Tables[TableNo].Rows.Count > 0)
            {
                foreach (DataRow ConditionStat_Row in ds.Tables[TableNo].Rows)
                {
                    int ConditionCharacterstatID = ConditionStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(ConditionStat_Row["CharacterStatId"]);
                    if (ConditionCharacterstatID == CharCharStat.CharacterStatId)
                    {
                        int ConditionOperatorID = ConditionStat_Row["ConditionOperatorID"] == DBNull.Value ? 0 : Convert.ToInt32(ConditionStat_Row["ConditionOperatorID"]);
                        var conditionStat = new CharacterStatCondition()
                        {
                            CharacterStatConditionId = ConditionStat_Row["CharacterStatConditionId"] == DBNull.Value ? 0 : Convert.ToInt32(ConditionStat_Row["CharacterStatConditionId"]),
                            CharacterStatId = ConditionStat_Row["CharacterStatId"] == DBNull.Value ? 0 : Convert.ToInt32(ConditionStat_Row["CharacterStatId"]),
                            CompareValue = ConditionStat_Row["CompareValue"] == DBNull.Value ? string.Empty : ConditionStat_Row["CompareValue"].ToString(),
                            ConditionOperatorID = ConditionOperatorID,
                            IfClauseStatText = ConditionStat_Row["IfClauseStatText"] == DBNull.Value ? string.Empty : ConditionStat_Row["IfClauseStatText"].ToString(),
                            IsNumeric = ConditionStat_Row["IsNumeric"] == DBNull.Value ? false : Convert.ToBoolean(ConditionStat_Row["IsNumeric"]),
                            Result = ConditionStat_Row["Result"] == DBNull.Value ? string.Empty : ConditionStat_Row["Result"].ToString(),
                            SortOrder = ConditionStat_Row["SortOrder"] == DBNull.Value ? 0 : Convert.ToInt32(ConditionStat_Row["SortOrder"]),
                            ConditionOperator = null
                        };
                        if (ConditionOperatorID > 0)
                        {
                            conditionStat.ConditionOperator = new ConditionOperator()
                            {
                                ConditionOperatorId = ConditionStat_Row["ConditionOperatorId"] == DBNull.Value ? 0 : Convert.ToInt32(ConditionStat_Row["ConditionOperatorId"]),
                                IsNumeric = ConditionStat_Row["OperatorIsNumeric"] == DBNull.Value ? false : Convert.ToBoolean(ConditionStat_Row["OperatorIsNumeric"]),
                                Name = ConditionStat_Row["OperatorName"] == DBNull.Value ? string.Empty : ConditionStat_Row["OperatorName"].ToString(),
                                Symbol = ConditionStat_Row["OperatorSymbol"] == DBNull.Value ? string.Empty : ConditionStat_Row["OperatorSymbol"].ToString(),
                            };
                        }
                        CharStat.CharacterStatConditions.Add(conditionStat);

                    }
                }
            }
        }

        public static void FillStatCalcs(DataSet ds, CharacterStat CharStat, int characterstatID, int TableNo)
        {
            List<CharacterStatCalc> calcs = new List<CharacterStatCalc>();
            if (ds.Tables[TableNo].Rows.Count > 0)
            {
                foreach (DataRow r in ds.Tables[TableNo].Rows)
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
        }

        public static void FillStatChoices(DataSet ds, CharacterStat CharStat, int characterstatID, int TableNo)
        {
            List<CharacterStatChoice> Choices = new List<CharacterStatChoice>();
            if (ds.Tables[TableNo].Rows.Count > 0)
            {
                foreach (DataRow r in ds.Tables[TableNo].Rows)
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
                    else
                    {
                        if (CharStat.SelectedChoiceCharacterStatId == choiceCharacterStat && CharStat.IsChoicesFromAnotherStat == true)
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
        }
    }
    public class LinkTypeRecord {
        public int id { get; set; }
        public string name { get; set; }
        public string image { get; set; }
        public string type { get; set; }
        public bool? isItemEquiped { get; set; }
        public bool? isSpellMemorized { get; set; }
        public bool? isAbilityEnabled { get; set; }
    }
    public enum SP_SearchType
    {
        Everything = -1,
        RulesetItems = 1,
        CharacterItems = 2,
        RulesetSpells = 3,
        CharacterSpells = 4,
        RulesetAbilities = 5,
        CharacterAbilities = 6
    }
    public class SearchModel
    {
        public SP_SearchType SearchType { get; set; }
        public string SearchString { get; set; }
        public int CharacterID { get; set; }
        public int RulesetID { get; set; }
        public ItemFilter ItemFilters { get; set; }
        public SpellFilter SpellFilters { get; set; }
        public AbilityFilter AbilityFilters { get; set; }
        public EveryThingFilter EverythingFilters { get; set; }
    }
    public class ItemFilter
    {
        public bool IsItemName { get; set; }
        public bool IsItemTags { get; set; }
        public bool IsItemStats { get; set; }
        public bool IsItemDesc { get; set; }
        public bool IsItemRarity { get; set; }
        public bool IsItemSpellAssociated { get; set; }
        public bool IsItemAbilityAssociated { get; set; }
    }
    public class SpellFilter
    {
        public bool IsSpellName { get; set; }
        public bool IsSpellTags { get; set; }
        public bool IsSpellStats { get; set; }
        public bool IsSpellDesc { get; set; }
        public bool IsSpellClass { get; set; }
        public bool IsSpellSchool { get; set; }
        public bool IsSpellLevel { get; set; }
        public bool IsSpellCastingTime { get; set; }
        public bool IsSpellEffectDesc { get; set; }
        public bool IsSpellHitEffect { get; set; }
        public bool IsSpellMissEffect { get; set; }
    }
    public class AbilityFilter
    {

        public bool IsAbilityName { get; set; }
        public bool IsAbilityTags { get; set; }
        public bool IsAbilityStats { get; set; }
        public bool IsAbilityDesc { get; set; }
        public bool IsAbilityLevel { get; set; }
    }
    public class EveryThingFilter
    {
        public bool IsEverythingName { get; set; }
        public bool IsEverythingTags { get; set; }
        public bool IsEverythingStats { get; set; }
        public bool IsEverythingDesc { get; set; }
    }
    public class SearchEverything
    {
        public int id { get; set; }
        public string image { get; set; }
        public string name { get; set; }
        public SP_SearchType RecordType { get; set; }

        public CharacterAbility CharacterAbility { get; set; }
        public CharacterSpell CharacterSpell { get; set; }
        public Item CharacterItem { get; set; }
        public ItemMaster RulesetItem { get; set; }
        public Ability RulesetAbility { get; set; }
        public Spell RulesetSpell { get; set; }
    }
    public class ItemMaster_Bundle : ItemMaster {
        public bool IsBundle { get; set; }
    }
    public class ItemMasterBundleIds
    {
        public int ItemMasterBundleId { get; set; }
    }
    public class ItemMasterLoot_ViewModel:ItemMaster
    {
        
        public int LootId { get; set; }

      
        //public int ItemMasterId { get; set; }

        public bool IsShow { get; set; }

        public int? ContainedIn { get; set; }

        
        public decimal Quantity { get; set; }

        public bool? IsIdentified { get; set; }
        public bool? IsVisible { get; set; }        
       
        public decimal TotalWeight { get; set; }

        public ItemMaster Container { get; set; }
        public List<ItemMasterLoot_ViewModel> ContainerItems { get; set; }
    }
}
