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
    }
    public class ItemFilter
    {
        public bool IsItemName { get; set; }
        public bool IsItemTags { get; set; }
        public bool IsItemStats { get; set; }
        public bool IsItemDesc { get; set; }
        public bool IsItemRarity { get; set; }
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
}
