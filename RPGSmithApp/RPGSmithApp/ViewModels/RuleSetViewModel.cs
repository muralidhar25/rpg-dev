using DAL.Models;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class RuleSetViewModel
    {
        public int RuleSetId { get; set; }
        [Required]
        public string RuleSetName { get; set; }
        public string RuleSetDesc { get; set; }
        public bool isActive { get; set; }
        public string DefaultDice { get; set; }
        public string CurrencyLabel { get; set; }
        public string WeightLabel { get; set; }
        public string DistanceLabel { get; set; }
        public string VolumeLabel { get; set; }
        public string VolumeMetricLabel { get; set; }
        public string ImageUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public int? SortOrder { get; set; }
        public int? ParentRuleSetId { get; set; }
        public bool IsItemEnabled { get; set; }
        public bool IsAbilityEnabled { get; set; }
        public bool IsSpellEnabled { get; set; }
        public bool IsBuffAndEffectEnabled { get; set; }
        public bool IsCoreRuleset { get; set; }

        public bool IsAllowSharing { get; set; }
        public bool isAdmin { get; set; }
        public Guid? ShareCode { get; set; }
        public string CoreRulesetAdminImageUrl { get; set; }
        public string CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public RulesetRecordCount RecordCount { get; set; }
        public decimal Price { get; set; }
        public bool IsAlreadyPurchased { get; set; }
        public bool IsDicePublicRoll { get; set; }
        public string LastCommand { get; set; }
        public string LastCommandResult { get; set; }
        public string LastCommandResultColor { get; set; }
        public int LastCommandTotal { get; set; }
        public string LastCommandValues { get; set; }
        public bool IsCombatStarted { get; set; }
        public bool haveLootItems { get; set; }
        public bool haveHandOutItems { get; set; }
        public string CurrencyName { get; set; }
        public decimal CurrencyWeight { get; set; }
        public decimal CurrencyBaseUnit { get; set; }
        public List<CurrencyType> CurrencyTypeVM { get; set; }
        public virtual ICollection<ItemMaster> ItemMasters { get; set; }
        public virtual ICollection<Spell> Spells { get; set; }
        public virtual ICollection<Ability> Abilities { get; set; }
        public virtual ICollection<CustomDiceViewModel> customDices { get; set; }
        public virtual ICollection<DiceTray> diceTray { get; set; }
        public virtual ICollection<DefaultDice> defaultDices { get; set; }
    }
}
