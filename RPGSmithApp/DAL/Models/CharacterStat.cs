namespace DAL.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class CharacterStat
    {        
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatId { get; set; }

        public int RuleSetId { get; set; }

        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string StatName { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
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

        public bool? IsDeleted { get; set; }
        public bool AddToModScreen { get; set; }
        public bool IsChoiceNumeric { get; set; }
        public bool IsChoicesFromAnotherStat { get; set; }
        public int? SelectedChoiceCharacterStatId { get; set; }

        public virtual RuleSet RuleSet { get; set; }

        public virtual CharacterStatType CharacterStatType { get; set; }

        public virtual ApplicationUser AspNetUser { get; set; }

        public virtual ApplicationUser AspNetUser1 { get; set; }

        public virtual ApplicationUser AspNetUser2 { get; set; }

        public virtual ICollection<CharacterStatCalc> CharacterStatCalcs { get; set; }

        public virtual ICollection<CharacterStatChoice> CharacterStatChoices { get; set; }
        public virtual ICollection<CharacterStatDefaultValue> CharacterStatDefaultValues { get; set; }

        //[NotMapped]
        public virtual ICollection<CharacterStatCondition> CharacterStatConditions { get; set; }
        //public virtual ICollection<CharacterStatCondition> IfStatss { get; set; }

        public virtual CharacterStatCombo CharacterStatCombos { get; set; }
        public virtual CharacterStatToggle CharacterStatToggles { get; set; }

        public virtual ICollection<CharacterStat> CharacterStats1 { get; set; }

        public virtual CharacterStat CharacterStat1 { get; set; }
        public virtual CharacterStat SelectedChoiceCharacterStat { get; set; }

        public virtual ICollection<CharactersCharacterStat> CharactersCharacterStats { get; set; }

    }
}
