using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.ViewModelProc
{
    public class Characters
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RuleSetRuleSetId { get; set; }
        public string RuleSetName { get; set; }
        public string RuleSetDesc { get; set; }
        public string RuleSetImageUrl { get; set; }
        public string RuleSetThumbnailUrl { get; set; }
        public bool? IsAbilityEnabled { get; set; }
        public bool? IsAllowSharing { get; set; }
        public bool? IsCoreRuleset { get; set; }
        public bool? IsItemEnabled { get; set; }
        public bool? IsSpellEnabled { get; set; }
        public int? ParentRuleSetId { get; set; }
        public System.Guid ShareCode { get; set; }
        public bool? IsCharacterGamePaused { get; set; }
        public int? InviteId { get; set; }
        public int CharacterId { get; set; }
        public string CharacterName { get; set; }
        public string CharacterDescription { get; set; }
        public string ImageUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public string UserId { get; set; }
        public int? RuleSetId { get; set; }
        public int? ParentCharacterId { get; set; }
        public bool? IsDeleted { get; set; }
        public string LastCommand { get; set; }
        public string LastCommandResult { get; set; }
        public decimal? InventoryWeight { get; set; }
        public string LastCommandValues { get; set; }
        public int? LastCommandTotal { get; set; }
        public bool? IsDicePublicRoll { get; set; }
        public string LastCommandResultColor { get; set; }
        public Int64 Index { get; set; }
    }
}
