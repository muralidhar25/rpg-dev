using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterLoot
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LootId { get; set; }

        [Required]
        public int ItemMasterId { get; set; }        

        public bool IsShow { get; set; }

        public int? ContainedIn { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal Quantity { get; set; }

        public bool? IsIdentified { get; set; }
        public bool? IsVisible { get; set; }
        //public bool? IsEquipped { get; set; }
        [Column(TypeName = "decimal(18, 3)")]
        public decimal TotalWeight { get; set; }



        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string ItemName { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ItemImage { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ItemStats { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ItemVisibleDesc { get; set; }

        public string Command { get; set; }

        [Column(TypeName = "nvarchar(255)")]
        public string ItemCalculation { get; set; }

        [Column(TypeName = "decimal(18, 8)")]
        public decimal Value { get; set; }

        [Column(TypeName = "decimal(18, 8)")]
        public decimal Volume { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal Weight { get; set; }

        public bool IsContainer { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal ContainerWeightMax { get; set; }

        [Column(TypeName = "decimal(18, 8)")]
        public decimal ContainerVolumeMax { get; set; }

        [Column(TypeName = "varchar(50)")]
        public string ContainerWeightModifier { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal PercentReduced { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal TotalWeightWithContents { get; set; }

        public bool IsMagical { get; set; }

        public bool IsConsumable { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        [Column(TypeName = "nvarchar(20)")]
        public string Rarity { get; set; }

        public int? ParentLootId { get; set; }

        public bool IsDeleted { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string CommandName { get; set; }

        public int? RuleSetId { get; set; }


        
        public virtual RuleSet RuleSet { get; set; }

        
        public virtual ICollection<ItemMasterLootAbility> ItemMasterAbilities { get; set; }
        public virtual ICollection<ItemMasterLootBuffAndEffect> itemMasterBuffAndEffects { get; set; }
        
        public virtual ICollection<ItemMasterLootSpell> ItemMasterSpell { get; set; }
        public virtual ICollection<ItemMasterLootCommand> ItemMasterCommand { get; set; }
        public virtual ItemMasterLoot ParentLoot { get; set; }
        public virtual ItemMaster ItemMaster { get; set; } 
    }
    public class ItemMasterLootCommand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemMasterLootCommandId { get; set; }
        public string Command { get; set; }
        public string Name { get; set; }

        public int ItemMasterLootId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual ItemMasterLoot ItemMasterLoot { get; set; }
    }
    public class ItemMasterLootAbility
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ItemMasterLootId { get; set; }
        public int AbilityId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual ItemMasterLoot ItemMasterLoot { get; set; }
        public virtual Ability Ability { get; set; }
    }
    public class ItemMasterLootSpell
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ItemMasterLootId { get; set; }
        public int SpellId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual ItemMasterLoot ItemMasterLoot { get; set; }
        public virtual Spell Spell { get; set; }
    }    
    public class ItemMasterLootBuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ItemMasterLootId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool IsDeleted { get; set; }

        public virtual ItemMasterLoot ItemMasterLoot { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }


}
