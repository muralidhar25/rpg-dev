using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class Spell
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SpellId { get; set; }
        public int RuleSetId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }
               
        [Column(TypeName = "nvarchar(255)")]
        public string School { get; set; }
      
        [Column(TypeName = "nvarchar(255)")]
        public string Class { get; set; }     
      
        [Column(TypeName = "nvarchar(255)")]
        public string Levels { get; set; }

        public string Command { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string MaterialComponent { get; set; }
        public bool IsMaterialComponent { get; set; }
        public bool IsSomaticComponent { get; set; }
        public bool IsVerbalComponent { get; set; }
              
        public string CastingTime { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }
        public string Stats { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string HitEffect  { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string MissEffect { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string EffectDescription { get; set; }

        public bool ShouldCast { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        public bool Memorized { get; set; }

        [Column(TypeName = "nvarchar(4000)")]
        public string Metatags { get; set; }

        public int? ParentSpellId { get; set; }

        public bool? IsDeleted { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string CommandName { get; set; }

        public virtual ICollection<Spell> Spells1 { get; set; }
        public virtual Spell Spell1 { get; set; }
        public virtual RuleSet RuleSet { get; set; }

        public virtual ICollection<ItemMasterSpell> ItemMasterSpells { get; set; }
        public virtual ICollection<SpellCommand> SpellCommand { get; set; }
        public virtual ICollection<SpellBuffAndEffect> SpellBuffAndEffects { get; set; }
      
    }
}
