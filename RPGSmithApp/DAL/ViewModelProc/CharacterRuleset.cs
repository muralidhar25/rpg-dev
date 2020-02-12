using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.ViewModelProc
{
    public class CharacterRuleset
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RuleSetId { get; set; }
        public string RuleSetName { get; set; }
        public string RuleSetDesc { get; set; }
        public bool isActive { get; set; }
        public string DefaultDice { get; set; }
        public string CurrencyLabel { get; set; }
        public string WeightLabel { get; set; }
        public string DistanceLabel { get; set; }
        public string VolumeLabel { get; set; }
        public string ImageUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public string OwnerId { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? SortOrder { get; set; }
        public short? RuleSetGenreId { get; set; }
        public int? ParentRuleSetId { get; set; }
        public bool? IsDeleted { get; set; }
        public bool IsAbilityEnabled { get; set; }
        public bool IsItemEnabled { get; set; }
        public bool IsSpellEnabled { get; set; }
        public bool IsAllowSharing { get; set; }
        public bool IsCoreRuleset { get; set; }
        public string LastCommand { get; set; }
        public string LastCommandResult { get; set; }
        public int LastCommandTotal { get; set; }
        public string LastCommandValues { get; set; }
        public string LastCommandResultColor { get; set; }

        public decimal CurrencyBaseUnit { get; set; }
        public string CurrencyName { get; set; }
        public decimal CurrencyWeight { get; set; }
        public bool AutoDeleteItems { get; set; }
    }
}
