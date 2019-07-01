using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class Monster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MonsterId { get; set; }
        public int MonsterTemplateId { get; set; }
        public int RuleSetId { get; set; }
        [Required]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        public bool IsDeleted { get; set; }
        public int HealthCurrent { get; set; }
        public int HealthMax { get; set; }
        public int ArmorClass { get; set; }
        public int XPValue { get; set; }
        public int ChallangeRating { get; set; }
        public bool AddToCombatTracker { get; set; }

        public string Command { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string CommandName { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Stats { get; set; }

        public int? ParentMonsterId { get; set; }       
        public string InitiativeCommand { get; set; }
        public bool IsRandomizationEngine { get; set; }

        public virtual Monster ParentMonster { get; set; }
        public virtual RuleSet RuleSet { get; set; }
        public virtual MonsterTemplate MonsterTemplate { get; set; }

        public virtual ICollection<MonsterCommand> MonsterCommands { get; set; }
        //public virtual ICollection<MonsterAbility> MonsterAbilitys { get; set; }
        //public virtual ICollection<MonsterSpell> MonsterSpells { get; set; }
        //public virtual ICollection<MonsterBuffAndEffect> MonsterBuffAndEffects { get; set; }
        //public virtual ICollection<MonsterMonster> MonsterMonsters { get; set; }
    }

    public class MonsterCommand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MonsterCommandId { get; set; }
        public string Command { get; set; }
        public string Name { get; set; }

        public int MonsterId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual Monster Monster { get; set; }
    }
    public class MonsterAbility
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterId { get; set; }
        public int AbilityId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual Monster Monster { get; set; }
        public virtual Ability Ability { get; set; }
    }
    public class MonsterSpell
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterId { get; set; }
        public int SpellId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual Monster Monster { get; set; }
        public virtual Spell Spell { get; set; }
    }
    public class MonsterMonster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterId { get; set; }
        public int AssociateMonsterId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual Monster Monster { get; set; }
        public virtual MonsterTemplate AssociateMonster { get; set; }
    }
    public class MonsterBuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual Monster Monster { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
}

