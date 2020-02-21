using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class MonsterTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MonsterTemplateId { get; set; }

        public int RuleSetId { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        public string Command { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string CommandName { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Stats { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        public int? ParentMonsterTemplateId { get; set; }

        public bool IsDeleted { get; set; }

        public string Health { get; set; }
        public string ArmorClass { get; set; }
        public string XPValue { get; set; }
        public string ChallangeRating { get; set; }
        public string InitiativeCommand { get; set; }

        public bool IsRandomizationEngine { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string gmOnly { get; set; }


        public virtual MonsterTemplate ParentMonsterTemplate { get; set; }

        public virtual RuleSet RuleSet { get; set; }

        //public virtual ICollection<ItemMasterAbility> ItemMasterAbilities { get; set; }
        public virtual ICollection<MonsterTemplateCommand> MonsterTemplateCommands { get; set; }
        //public virtual ICollection<MonsterTemplateAbility> MonsterTemplateAbilities { get; set; }
        //public virtual ICollection<MonsterTemplateSpell> MonsterTemplateSpells { get; set; }
        //public virtual ICollection<MonsterTemplateBuffAndEffect> MonsterTemplateBuffAndEffects { get; set; }
        //public virtual ICollection<MonsterTemplateItemMaster> MonsterTemplateItemMasters { get; set; }
        //public virtual ICollection<MonsterTemplateMonster> MonsterTemplateMonsters { get; set; }
        //public virtual ICollection<MonsterTemplateCurrency> MonsterTemplateCurrency { get; set; }
        // public virtual ICollection<MonsterTemplateBundle> MonsterTemplateBundles { get; set; }
        //public virtual ICollection<MonsterTemplateRandomizationSearch> MonsterTemplateRandomizationSearch { get; set; }
    }
    public class MonsterTemplateCommand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MonsterTemplateCommandId { get; set; }
        public string Command { get; set; }
        public string Name { get; set; }

        public int MonsterTemplateId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual MonsterTemplate MonsterTemplate { get; set; }
    }
    public class MonsterTemplateAbility
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
        public int AbilityId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual MonsterTemplate MonsterTemplate { get; set; }
        public virtual Ability Ability { get; set; }
    }
    public class MonsterTemplateSpell
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
        public int SpellId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual MonsterTemplate MonsterTemplate { get; set; }
        public virtual Spell Spell { get; set; }
    }
    public class MonsterTemplateMonster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
        public int AssociateMonsterTemplateId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual MonsterTemplate MonsterTemplate { get; set; }
        public virtual MonsterTemplate AssociateMonsterTemplate { get; set; }
    }
    public class MonsterTemplateBuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual MonsterTemplate MonsterTemplate { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
    public class RandomizationEngine {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RandomizationEngineId { get; set; }
        public decimal Percentage { get; set; }
        public string Qty { get; set; }
        public string QuantityString { get; set; }
        public int SortOrder { get; set; }
        public int ItemMasterId { get; set; }
        public bool IsOr { get; set; }
        public bool IsDeleted { get; set; }

        public virtual ItemMaster ItemMaster { get; set; }       
    }
    public class MonsterTemplateRandomizationEngine
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
        public int RandomizationEngineId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual MonsterTemplate MonsterTemplate { get; set; }
        public virtual RandomizationEngine RandomizationEngine { get; set; }
    }
    public class MonsterTemplateItemMaster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int MonsterTemplateId { get; set; }
        public int ItemMasterId { get; set; }
        public int Qty { get; set; }
        public bool IsDeleted { get; set; }

        public virtual MonsterTemplate MonsterTemplate { get; set; }
        public virtual ItemMaster ItemMaster { get; set; }
    }
   
}

//update[RuleSets] set[IsBuffAndEffectEnabled] = 0
//update[RuleSets] set[IsBuffAndEffectEnabled] = 1  where OwnerId in (SELECT id FROM ASPNETUSERS WHERE IsGm=1 )