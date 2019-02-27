namespace DAL.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class RuleSet
    {
        public RuleSet()
        {
            CharacterStats = new HashSet<CharacterStat>();
            UserRuleSets = new HashSet<UserRuleSet>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RuleSetId { get; set; }

        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string RuleSetName { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string RuleSetDesc { get; set; }

        public bool isActive { get; set; }

        public string DefaultDice { get; set; }

        public string CurrencyLabel { get; set; }

        public string WeightLabel { get; set; }

        public string DistanceLabel { get; set; }

        public string VolumeLabel { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ThumbnailUrl { get; set; }

        //public bool? IsCoreContent { get; set; }

        public string OwnerId { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        public int? SortOrder { get; set; }

        public short? RuleSetGenreId { get; set; }
        public int? ParentRuleSetId { get; set; }

        public bool? IsDeleted { get; set; }

        public bool IsItemEnabled { get; set; }
        public bool IsAbilityEnabled { get; set; }
        public bool IsSpellEnabled { get; set; }

        public bool IsAllowSharing { get; set; }
        public bool IsCoreRuleset { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid? ShareCode { get; set; }

        public virtual ApplicationUser AspNetUser { get; set; }

        public virtual ApplicationUser AspNetUser1 { get; set; }

        public virtual ApplicationUser AspNetUser2 { get; set; }

        public virtual ICollection<CharacterStat> CharacterStats { get; set; }

        public virtual RuleSetGenre RuleSetGenre { get; set; }

        public ICollection<UserRuleSet> UserRuleSets { get; set; }

        public ICollection<Character> Characters { get; set; }

        public virtual ICollection<RuleSet> RuleSets1 { get; set; }

        public virtual RuleSet RuleSet1 { get; set; }

        public virtual ICollection<ItemMaster> ItemMasters { get; set; }
        public virtual ICollection<Spell> Spells { get; set; }
        public virtual ICollection<Ability> Abilities { get; set; }
        public virtual ICollection<SearchFilter> SearchFilters { get; set; }

    }
}
