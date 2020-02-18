using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
   public class CharacterStatSPVM
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
        public int RuleSetId { get; set; }
        public string StatName { get; set; }
        public Guid? StatIdentifier { get; set; }
        public string StatDesc { get; set; }
        public bool isActive { get; set; }
        public short CharacterStatTypeId { get; set; }
        public string OwnerId { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public bool isMultiSelect { get; set; }
        public int? ParentCharacterStatId { get; set; }
        public short SortOrder { get; set; }
        public bool AddToModScreen { get; set; }
        public bool IsChoiceNumeric { get; set; }
        public bool IsChoicesFromAnotherStat { get; set; }
        public int? SelectedChoiceCharacterStatId { get; set; }
        public bool AlertPlayer { get; set; }
        public bool AlertGM { get; set; }
        public virtual Character Character { get; set; }
        public virtual CharacterStatSP CharacterStat { get; set; }

    }
}
