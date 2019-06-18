using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class Ability
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AbilityId { get; set; }
        public int RuleSetId { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        public string Level { get; set; }
        public string Command { get; set; }
        public int MaxNumberOfUses { get; set; }
        public int CurrentNumberOfUses { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Stats { get; set; }
        public bool IsEnabled { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        public int? ParentAbilityId { get; set; }

        public bool? IsDeleted { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string CommandName { get; set; }

        public virtual ICollection<Ability> Abilities1 { get; set; }

        public virtual Ability Ability1 { get; set; }

        public virtual RuleSet RuleSet { get; set; }

        public virtual ICollection<ItemMasterAbility> ItemMasterAbilities { get; set; }
        public virtual ICollection<AbilityCommand> AbilityCommand { get; set; }
        public virtual ICollection<AbilityBuffAndEffect> AbilityBuffAndEffects { get; set; }
    }
}
