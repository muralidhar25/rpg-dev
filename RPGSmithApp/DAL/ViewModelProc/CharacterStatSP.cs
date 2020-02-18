using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
   public class CharacterStatSP
    {
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
            public int SubValue { get; set; }
            public int Current { get; set; }
            public int Maximum { get; set; }
            public int CalculationResult { get; set; }
            public int? Number { get; set; }
            public int DefaultValue { get; set; }
            public int Minimum { get; set; }
            public string ComboText { get; set; }
            public bool IsDeleted { get; set; }
            public bool Display { get; set; }
            public bool ShowCheckbox { get; set; }
            public bool IsCustom { get; set; }
            public bool IsYes { get; set; }
            public bool IsOn { get; set; }
            public string LinkType { get; set; }
            public bool isMultiSelect { get; set; }
            public string StatName { get; set; }
            public short CharacterStatTypeId { get; set; }
            public RuleSet ruleset { get; set; }
            public List<CharacterStatCalc> CharacterStatCalcs { get; set; }
            public CharacterStatChoice CharacterStatChoices { get; set; }
            public List<CharacterStatType> CharacterStatType { get; set; }
            public CharacterStatDefaultValue CharacterStatDefaultValues { get; set; }
            public CharacterStatCondition CharacterStatConditions { get; set; }
    }
}

