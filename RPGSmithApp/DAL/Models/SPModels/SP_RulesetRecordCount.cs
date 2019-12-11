using DAL.Models.APIModels;
using DAL.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
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
        public int BuffAndEffectCount { get; set; }
        public int MonsterTemplateCount { get; set; }
        public int MonsterCount { get; set; }
        public int LootTemplateCount { get; set; }

    }
    public class SP_AbilitySpellForItemMaster
    {
        public List<Ability> abilityList { get; set; }
        public List<Spell> spellList { get; set; }
        public List<BuffAndEffect> buffAndEffectsList { get; set; }
        public List<Ability> selectedAbilityList { get; set; }
        public List<Spell> selectedSpellList { get; set; }
        public List<BuffAndEffect> selectedBuffAndEffects { get; set; }
        public List<ItemMasterCommand> selectedItemMasterCommand { get; set; }
        public List<ItemCommand> selectedItemCommand { get; set; }
    }
    public class SP_AssociateForMonsterTemplate
    {
        public List<Ability> abilityList { get; set; }
        public List<Spell> spellList { get; set; }
        public List<BuffAndEffect> buffAndEffectsList { get; set; }
        public List<MonsterTemplate> monsterTemplatesList { get; set; }
        public List<ItemMasterForMonsterTemplate> itemMasterList { get; set; }
        public List<Ability> selectedAbilityList { get; set; }
        public List<Spell> selectedSpellList { get; set; }
        public List<BuffAndEffect> selectedBuffAndEffects { get; set; }
        public List<MonsterTemplate> selectedMonsterTemplates { get; set; }
        public List<ItemMasterForMonsterTemplate> selectedItemMasters { get; set; }
        public List<MonsterTemplateCommand> monsterTemplateCommands { get; set; }
        public List<RandomizationEngine> RandomizationEngine { get; set; }
        public List<CurrencyType> CurrencyType { get; set; }
    }
    public class ItemMasterForMonsterTemplate
    {
        public int ItemId { get; set; }
        public int ItemMasterId { get; set; }
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public int Qty { get; set; }

    }
    public class AddRemoveRecords
    {
        public int ItemMasterId { get; set; }
        public int ItemId { get; set; }
        public int SpellId { get; set; }
        public int AbilityId { get; set; }
        public int BuffAndEffectId { get; set; }
        public int MonsterTemplateId { get; set; }
        public bool Selected { get; set; }
    }
    public class SP_CharactersCharacterStat
    {
        public List<CharactersCharacterStat> charactersCharacterStat { get; set; }
        public Character character { get; set; }
    }
    public class SpellAssociatedRecords
    {
        public List<SpellCommand> SpellCommands { get; set; }
        public List<BuffAndEffect> BuffAndEffectsList { get; set; }
        public List<BuffAndEffect> SelectedBuffAndEffects { get; set; }

    }
    public class AbilityAssociatedRecords
    {
        public List<AbilityCommand> AbilityCommands { get; set; }
        public List<BuffAndEffect> BuffAndEffectsList { get; set; }
        public List<BuffAndEffect> SelectedBuffAndEffects { get; set; }

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
    public class CommonID
    {
        public int ID { get; set; }
    }
    public class CommonID_With_Qty
    {
        public int ID { get; set; }
        public int Qty { get; set; }
    }

    public class GiveItemsFromPlayerCombat {
        public List<CommonID_With_Qty> Items { get; set; }
        public GiveTo GiveTo { get; set; }
    }

    public class GiveTo {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public string Type { get; set; }
    }

    public class LootToMonster {
      public int MonsterId  { get; set; }
      public List<LootIds> MultiLootIds { get; set; }
    }
    public class LootIds
    {
        public int LootId { get; set; }
        public string Name { get; set; }

    }
    public class Commands    {        public string Command { get; set; }        public string CommandName { get; set; }    }

    public class MonsterWithItemCount : Monster
    {
        public int ItemsCount { get; set; }
        public List<MonsterCurrency> MonsterCurrency { get; set; }

    }
    public class MonstersWithFilterCount {
        public List<MonsterWithItemCount> Monsters { get; set; }
        public int FilterAplhabetCount { get; set; }
        public int FilterCRCount { get; set; }
        public int FilterHealthCount { get; set; }
    }
    public class MonsterTemplateWithFilterCount
    {
        public List<MonsterTemplate_Bundle> MonsterTemplates_Bundle { get; set; }
        public int FilterAplhabetCount { get; set; }
        public int FilterCRCount { get; set; }
        public int FilterHealthCount { get; set; }
    }
    public class CharacterItemWithFilterCount{

        public List<Item> items { get; set; }
        public int FilterUnContainedCount { get; set; }
        public int FilterAplhabetCount { get; set; }
        public int FilterEquippedCount { get; set; }
        public int FilterVisibleCount { get; set; }
    }
    public class CharacterSpellListWithFilterCount
    {
        public List<CharacterSpell> SpellList { get; set; }
        public int FilterAplhabetCount { get; set; }
        public int FilterReadiedCount { get; set; }
        public int FilterLevelCount { get; set; }
    }
    public class CharacterAbilityListWithFilterCount
    {
        public List<CharacterAbility> AbilityList { get; set; }
        public int FilterAplhabetCount { get; set; }
        public int FilterEnabledCount { get; set; }
        public int FilterLevelCount { get; set; }
    }
    public class LogError
    {
        public string Error { get; set; }
        public string ErrorStack { get; set; }
        public string Headers { get; set; }
        public string CurrentUser { get; set; }
        public string CurrentUrl { get; set; }
    }
    public class LootsToAdd
    {
        public int ID { get; set; }
        public bool IsBundle { get; set; }
    }
    public class LootsToAdd_New
    {
        public int ID { get; set; }
        public bool IsBundle { get; set; }
        public int Qty { get; set; }
    }
    public class ItemTemplateToDeploy
    {
        public int ItemMasterId { get; set; }
        public bool IsBundle { get; set; }
        public int Qty { get; set; }
    }
    //
    public class DeployedLootList
    {
        public int LootId { get; set; }
        public int LootTemplateId { get; set; }
    }
    public class DeployLootTemplateListToAdd
    {       
            public int qty { get; set; }
            public int lootTemplateId { get; set; }
            public int rulesetId { get; set; }           
            public List<REItems> REItems { get; set; }        
    }
    public class AddLoot
    {
        public List<LootsToAdd_New> lootItemsToAdd { get; set; }
        public List<DeployLootTemplateListToAdd> lootTemplatesToAdd { get; set; }
        public List<LootIds_With_Qty> lootItemsToLink { get; set; }
    }
    public class AssignBuffAndEffect
    {
        public List<BuffAndEffect> buffAndEffectList { get; set; }
        public List<Character> characters { get; set; }
        public List<Character> nonSelectedCharacters { get; set; }
        public List<BuffAndEffect> nonSelectedBuffAndEffectsList { get; set; }
    }
    public class SelectedCharacter : Character
    {
        public bool Selected { get; set; }
    }
    public class CharBuffAndEffect : BuffAndEffect
    {
        public int CharacterBuffAndEffectId { get; set; }
        public string Command { get; set; }
    }

    public class DeployMonsterTemplate
    {
        public int qty { get; set; }
        public int monsterTemplateId { get; set; }
        public int rulesetId { get; set; }
        public List<int> healthCurrent { get; set; }
        public List<int> healthMax { get; set; }
        public List<int> armorClass { get; set; }
        public List<int> xpValue { get; set; }
        public List<int> challangeRating { get; set; }
        public bool addToCombat { get; set; }
        public bool isBundle { get; set; }
        public List<REItems> REItems { get; set; }
        public List<MonsterCurrency> MonsterCurrency { get; set; }
    }
    public class numbersList
    {
        public int RowNum { get; set; }
        public int Number { get; set; }
    }
    public class AssociateMonsterToCharacter
    {
        public int? CharacterId { get; set; }
        public int MonsterId { get; set; }
    }

    public class REItems
    {
        
        public int itemMasterId { get; set; }
        public int qty { get; set; }
        public int deployCount { get; set; }
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

        public static void FillCharacterCharacterStats(List<CharactersCharacterStat> CharactersCharacterStatsList, DataSet ds)
        {
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
                            
                            AlertPlayer = ds.Tables[1].Columns.Contains("AlertPlayer")? (CharCharStat_Row["AlertPlayer"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["AlertPlayer"])):false,
                            AlertGM = ds.Tables[1].Columns.Contains("AlertGM") ? (CharCharStat_Row["AlertGM"] == DBNull.Value ? false : Convert.ToBoolean(CharCharStat_Row["AlertGM"])) : false,

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
        }

        public static List<CharactersCharacterStatViewModel> GetCharCharStatViewModelList(List<CharactersCharacterStat> data, ICharacterStatChoiceService _characterStatChoiceService)
        {
            List<CharactersCharacterStatViewModel> CharactersCharacterStatVievModels = new List<CharactersCharacterStatViewModel>();

            CharactersCharacterStatViewModel CharactersCharacterStatVievModel;
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
                        CharacterStatType = item.CharacterStat.CharacterStatType,
                        CharacterStatTypeId = item.CharacterStat.CharacterStatTypeId,
                        CreatedBy = item.CharacterStat.CreatedBy,
                        CreatedDate = item.CharacterStat.CreatedDate,
                        OwnerId = item.CharacterStat.OwnerId,
                        StatName = item.CharacterStat.StatName,
                        StatDesc = item.CharacterStat.StatDesc,
                        SortOrder = item.CharacterStat.SortOrder,
                        RuleSetId = item.CharacterStat.RuleSetId,
                        ParentCharacterStatId = item.CharacterStat.ParentCharacterStatId,
                        isMultiSelect = item.CharacterStat.isMultiSelect,
                        IsDeleted = item.CharacterStat.IsDeleted,
                        isActive = item.CharacterStat.isActive,
                        CharacterStatCalcs = item.CharacterStat.CharacterStatCalcs,
                        IsChoiceNumeric = item.CharacterStat.IsChoiceNumeric,
                        IsChoicesFromAnotherStat = item.CharacterStat.IsChoicesFromAnotherStat,
                        SelectedChoiceCharacterStatId = item.CharacterStat.SelectedChoiceCharacterStatId,
                        //CharactersCharacterStats= item.CharacterStat.CharactersCharacterStats,
                        CharacterStatChoices = item.CharacterStat.CharacterStatChoices.Select(z => new CharacterStatChoice
                        {
                            CharacterStatChoiceId = z.CharacterStatChoiceId,
                            CharacterStatId = z.CharacterStatId,
                            IsDeleted = z.IsDeleted,
                            StatChoiceValue = z.StatChoiceValue
                        }).ToList(),
                        //CharacterStatCombos= new CharacterStatCombo() {
                        //    CharacterStatComboId = item.CharacterStat.CharacterStatCombos.CharacterStatComboId ,
                        //    CharacterStatId= item.CharacterStat.CharacterStatCombos.CharacterStatId,
                        //    DefaultValue= item.CharacterStat.CharacterStatCombos.DefaultValue,
                        //    IsDeleted= item.CharacterStat.CharacterStatCombos.IsDeleted,
                        //    Maximum= item.CharacterStat.CharacterStatCombos.Maximum,
                        //    Minimum= item.CharacterStat.CharacterStatCombos.Minimum
                        //} ,
                        CharacterStatConditions = item.CharacterStat.CharacterStatConditions.OrderBy(z => z.SortOrder).ToList(),
                        CharacterStatDefaultValues = item.CharacterStat.CharacterStatDefaultValues,
                        AlertGM= item.CharacterStat.AlertGM,
                        AlertPlayer= item.CharacterStat.AlertPlayer
                    },
                    Character = new Character()
                    {
                        CharacterId = item.Character.CharacterId,
                        CharacterName = item.Character.CharacterName,
                        ImageUrl = item.Character.ImageUrl,
                        InventoryWeight = item.Character.InventoryWeight,
                        ParentCharacterId = item.Character.ParentCharacterId,
                        RuleSetId = item.Character.RuleSetId,
                        UserId = item.Character.UserId
                    }

                };
                //List<CharacterStatDefaultValue> CharacterStatDefaultValuesList = 
                //    _characterStatDefaultValueService.GetCharacterStatDefaultValue((int)CharactersCharacterStatVievModel.CharacterStatId).Result;
                //CharactersCharacterStatVievModel.CharacterStat.CharacterStatDefaultValues = new List<CharacterStatDefaultValue>();
                //if (CharacterStatDefaultValuesList != null)
                //{
                //    if (CharacterStatDefaultValuesList.Count>0)
                //    {

                //        foreach (var defv in CharacterStatDefaultValuesList)
                //        {
                //            var CharStatDefValues = new CharacterStatDefaultValue()
                //            {
                //                CharacterStatDefaultValueId = defv.CharacterStatDefaultValueId,
                //                CharacterStatId = defv.CharacterStatId,
                //                DefaultValue = defv.DefaultValue,
                //                Maximum = defv.Maximum,
                //                Minimum = defv.Minimum,
                //                Type = defv.Type,
                //                CharacterStat=null,
                //            };
                //            CharactersCharacterStatVievModel.CharacterStat.CharacterStatDefaultValues.Add(CharStatDefValues);
                //        }
                //    }
                //}


                if (CharactersCharacterStatVievModel.IsCustom)
                {
                    //--Uncomment if user want to  display custom toggle data over character character screen.----------//

                    //CharactersCharacterStatVievModel.CharacterCustomToggle = new List<CharacterCustomToggle>();
                    //CharacterStatToggle CharacterStatToggle = _charactersCharacterStatServic.GetCharacterStatToggleList((int)CharactersCharacterStatVievModel.CharacterStatId);
                    //if (CharacterStatToggle!=null)
                    //{
                    //    foreach (var toggle in CharacterStatToggle.CustomToggles)
                    //    {
                    //        CharactersCharacterStatVievModel.CharacterCustomToggle.Add(new CharacterCustomToggle()
                    //        {
                    //            CustomToggleId = toggle.CustomToggleId,
                    //            Image = toggle.Image,
                    //            IsDeleted = toggle.IsDeleted,
                    //            ToggleText = toggle.ToggleText,
                    //        });
                    //    }
                    //}

                }
                //CharactersCharacterStatVievModel = Mapper.Map<CharactersCharacterStatViewModel>(item);

                if (item.CharacterStat.CharacterStatType.StatTypeName == "Choice" && item.CharacterStat.isMultiSelect == true && (item.MultiChoice != null || item.MultiChoice != string.Empty))
                {
                    CharactersCharacterStatVievModel.SelectedCharacterChoices = _characterStatChoiceService.GetByIds(item.MultiChoice);
                }

                if (item.CharacterStat.CharacterStatType.StatTypeName == "Choice" && item.CharacterStat.isMultiSelect == false && (item.Choice != null || item.Choice != string.Empty))
                {
                    CharactersCharacterStatVievModel.SelectedCharacterChoices = _characterStatChoiceService.GetByIds(item.Choice);
                }

                CharactersCharacterStatVievModels.Add(CharactersCharacterStatVievModel);
            }

            return CharactersCharacterStatVievModels;
        }

        public static List<CustomDiceViewModel> MapCustomDice(List<CustomDice> list)
        {
            List<CustomDiceViewModel> result = new List<CustomDiceViewModel>();
            foreach (var dice in list)
            {
                CustomDiceViewModel Cdice = new CustomDiceViewModel()
                {
                    CustomDiceId = dice.CustomDiceId,
                    Icon = dice.Icon,
                    IsNumeric = dice.IsNumeric,
                    Name = dice.Name,
                    CustomDicetype = dice.CustomDicetype,
                    RuleSetId = dice.RuleSetId
                };
                List<CustomDiceResultViewModel> diceResList = new List<CustomDiceResultViewModel>();
                foreach (var res in dice.CustomDiceResults)
                {
                    CustomDiceResultViewModel CDres = new CustomDiceResultViewModel()
                    {
                        CustomDiceResultId = res.CustomDiceResultId,
                        CustomDiceId = res.CustomDiceId,
                        Name = res.Name,
                        DisplayContent = res.DisplayContent
                    };
                    diceResList.Add(CDres);
                }
                Cdice.Results = diceResList;
                result.Add(Cdice);
            }
            return result;
        }
    }
    public class CharCharStatDetails {
        public List<LinkTypeRecord> LinkRecordsDetails { get; set; }
        public List<CharactersCharacterStatViewModel> ConditionsValuesLists { get; set; }
        public List<CharactersCharacterStatViewModel> CharactersCharacterStats { get; set; }
    }
    public class LinkTypeRecord
    {
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
        CharacterAbilities = 6,

        RulesetLoot = 10,
        RulesetLootTemplate = 11,
        RulesetBuffAndEffect =12,
        CharacterBuffAndEffect=13,
        RulesetMonster = 14,
        RulesetMonsterTemplate = 15,
        CharacterHandout = 16,
        RulesetHandout = 17,
        RulesetCharacterItems = 18,
        CharacterLoot = 19,

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
        public BuffAndEffectFilter BuffAndEffectFilters { get; set; }
        public LootFilter LootFilters { get; set; }
        public MonsterFilter MonsterFilters { get; set; }
        public EveryThingFilter EverythingFilters { get; set; }
        public HandoutFilter HandoutFilters { get; set; }
    }
    public class HandoutFilter
    {

        public bool IsHandoutName { get; set; }
        public bool IsHandoutFileType { get; set; }
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
    public class BuffAndEffectFilter
    {

        public bool IsBuffAndEffectName { get; set; }
        public bool IsBuffAndEffectTags { get; set; }
        public bool IsBuffAndEffectStats { get; set; }
        public bool IsBuffAndEffectDesc { get; set; }
    }
    public class LootFilter
    {
        //Name
        //Tags
        //Description
        //Items
        //Stats(Loot only)
        //Rarity(Loot only)
        //Spells(Loot only)
        //Abilites(Loot only)
        public bool IsLootName { get; set; }
        public bool IsLootTags { get; set; }
        public bool IsLootStats { get; set; }
        public bool IsLootDesc { get; set; }
        public bool IsLootRarity { get; set; }
        public bool IsLootItemAssociated { get; set; }
        public bool IsLootSpellAssociated { get; set; }
        public bool IsLootAbilityAssociated { get; set; }
        

    }
    public class MonsterFilter
    {     
        public bool IsMonsterName { get; set; }
        public bool IsMonsterTags { get; set; }
        public bool IsMonsterStats { get; set; }
        public bool IsMonsterDesc { get; set; }
        public bool IsMonsterHealth { get; set; }
        public bool IsMonsterAC { get; set; }
        public bool IsMonsterChallengeRating { get; set; }
        public bool IsMonsterXPValue { get; set; }
        public bool IsMonsterItemAssociated { get; set; }
        public bool IsMonsterSpellAssociated { get; set; }
        public bool IsMonsterAbilityAssociated { get; set; }
        public bool IsMonsterBEAssociated { get; set; }
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
        public string extension { get; set; }
        public SP_SearchType RecordType { get; set; }

        public CharacterAbility CharacterAbility { get; set; }
        public CharacterSpell CharacterSpell { get; set; }
        public Item CharacterItem { get; set; }
        public ItemMaster RulesetItem { get; set; }
        public Ability RulesetAbility { get; set; }
        public Spell RulesetSpell { get; set; }

        public CharacterBuffAndEffect CharacterBuffAndEffect { get; set; }
        public BuffAndEffect RulesetBuffAndEffect { get; set; }
        public ItemMasterLoot RulesetLoot { get; set; }
        public LootTemplate RulesetLootTemplate { get; set; }
        public Monster RulesetMonster { get; set; }
        public MonsterTemplate_Bundle RulesetMonsterTemplate { get; set; }
        public Item RulesetCharacterItem  { get; set; }
        public ItemMasterLoot CharacterLoot { get; set; }
    }
    public class ItemMaster_Bundle : ItemMaster
    {
        public bool IsBundle { get; set; }
    }

    public class ItemsAndLootTemplates {
        public List<ItemMaster_Bundle> itemMaster_Bundle { get; set; }
        public List<LootTemplate> lootTemplate { get; set; }
    }
    public class CreateLootPileModel
    {
        public int LootId { get; set; }

        [Required]
        public int? RuleSetId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        public string ItemName { get; set; }

        public string ItemImage { get; set; }

        //        [MaxLength(4000, ErrorMessage = "The field Visible Description must be string with maximum length of 1024 characters")]
        public string ItemVisibleDesc { get; set; }
        public string gmOnly { get; set; }



        public string Metatags { get; set; }

        public bool IsVisible { get; set; }

        public List<LootPileLootItem> LootPileItems { get; set; }
        public List<ItemTemplateToDeploy> ItemTemplateToDeploy { get; set; }
        public List<DeployLootTemplateListToAdd> LootTemplateToDeploy { get; set; }
        public List<ItemMasterLootCurrency> ItemMasterLootCurrency { get; set; }
    }
    public class LootPileLootItem
    {       
        public int LootId { get; set; }
    }
    public class LootIds_With_Qty
    {       
        public int LootId { get; set; }
        public int Qty { get; set; }
    }
    //public class LootPileItem
    //{
    //    public int RowNum { get; set; }        
    //    public int ItemMasterId { get; set; }
    //    public int Qty { get; set; }
    //    public bool IsBundle { get; set; }
    //}
    public class LootPileViewModel
    {
        public int LootId { get; set; }

        
        public int? RuleSetId { get; set; }
        public RuleSet lootPileRuleSet { get; set; }

        public string ItemName { get; set; }

        public string ItemImage { get; set; }
        
        public string ItemVisibleDesc { get; set; }
        public string gmOnly { get; set; }

        public string Metatags { get; set; }

        public bool? IsVisible { get; set; }

        public List<LootPileItems_ViewModel> LootPileItems { get; set; }
        public List<ItemMasterLootCurrency> ItemMasterLootCurrency { get; set; }
        public List<CurrencyType> CurrencyTypesList { get; set; }
    }
    public class LootPileItems_ViewModel
    {
        
        public int LootId { get; set; }
        public int ItemMasterId { get; set; }
        public int Qty { get; set; }
        public string ItemName { get; set; }
        public string ItemImage { get; set; }
    }
    public class MonsterTemplate_Bundle : MonsterTemplate
    {
        public bool IsBundle { get; set; }
        public List<MonsterTemplate_BundleItemsWithRandomItems> BundleItems { get; set; }
        public List<RandomizationEngine> RandomizationEngine { get; set; }
        public List<MonsterTemplateCurrency> MonsterTemplateCurrency { get; set; }
    }
    
    public class MonsterTemplate_BundleItemsWithRandomItems : MonsterTemplateBundleItem
    {
        public MonsterTemplate_WithRandomItems MonsterTemplate { get; set; }
        
    }
    public class MonsterTemplate_WithRandomItems : MonsterTemplate
    {
        public List<RandomizationEngine> RandomizationEngine { get; set; }
    }
    public class ItemMasterBundleIds
    {
        public int ItemMasterBundleId { get; set; }
    }
    public class MonsterTemplateBundleIds
    {
        public int MonsterTemplateBundleId { get; set; }
    }
    public class ItemMasterIds
    {
        public int ItemMasterId { get; set; }
    }
    public class ItemMasterIds_With_Qty
    {
        public int ItemMasterId { get; set; }
        public int Qty { get; set; }
    }
    public class ItemMasterLootIds
    {
        public int ItemMasterLootId { get; set; }
    }
    public class ItemMasterLoot_ViewModel : ItemMaster
    {

        public int LootId { get; set; }
        public int ParentLootId { get; set; }


        //public int ItemMasterId { get; set; }

        public bool IsShow { get; set; }

        public int? ContainedIn { get; set; }


        public decimal Quantity { get; set; }

        public bool? IsIdentified { get; set; }
        public bool? IsVisible { get; set; }

        public decimal TotalWeight { get; set; }

        public bool IsLootPile { get; set; }
        public int LootPileId { get; set; }

        public ItemMaster Container { get; set; }

        public List<ItemMasterLoot_ViewModel> ContainerItems { get; set; }

        public List<ItemMasterLootCurrency> ItemMasterLootCurrency { get; set; }
    }

    public class DiceRollModel
    {
        public Character Character { get; set; }
        public List<CharacterCommand> CharacterCommands { get; set; }
        public List<RulesetCommand> RulesetCommands { get; set; }
        public bool IsGmAccessingPlayerCharacter { get; set; }
        public List<CharactersCharacterStat> CharactersCharacterStats { get; set; }
        public RuleSet RuleSet { get; set; }
        public List<CustomDice> CustomDices { get; set; }
        public List<DiceTray> DiceTrays { get; set; }
        public List<DefaultDice> DefaultDices { get; set; }
    }
    public class DiceRollViewModel
    {
        public Character Character { get; set; }
        public List<CharacterCommand> CharacterCommands { get; set; }
        public List<RulesetCommand> RulesetCommands { get; set; }
        public bool IsGmAccessingPlayerCharacter { get; set; }
        public List<CharactersCharacterStat> CharactersCharacterStats { get; set; }
        public RuleSet RuleSet { get; set; }
        public List<CustomDiceViewModel> CustomDices { get; set; }
        public List<DiceTray> DiceTrays { get; set; }
        public List<DefaultDice> DefaultDices { get; set; }
    }
    public class DiceRollViewModel_Combat
    {
        public List<CharactersCharacterStat> CharactersCharacterStats { get; set; }
        public Character Character { get; set; }
    }

    public class ItemMasterForLootPile    {
        public int ItemMasterId { get; set; }
        public string Name { get; set; }        public string ImageUrl { get; set; }        public bool IsBundle { get; set; }    }
    public class HandoutViewModel {
        public string Name { get; set; }
        public string url { get; set; }
        public string type { get; set; }
        public string extension { get; set; }
    }
    public class BlobsSearch {
        public BlobResponse blobResponse { get; set; }
        //count = Count, blobResponse = objBlobResponse, previousContainerImageNumber = previousContainerImageNumber
    }
    public class UpdateClusterSortOrderModel {
        public int ClusterTileId { get; set; }
        public string SortedIds { get; set; }
    }
}
