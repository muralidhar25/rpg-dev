using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class Item
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ItemImage { get; set; }

        [Required]
        public int? CharacterId { get; set; }
        [Required]
        public int? ItemMasterId { get; set; }

        public string Command { get; set; }

        public Nullable<int> ContainedIn { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal TotalWeight { get; set; }


        [Column(TypeName = "decimal(18, 3)")]
        public decimal Value { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal Volume { get; set; }

        [Column(TypeName = "decimal(18, 3)")]
        public decimal Weight { get; set; }


        [Column(TypeName = "nvarchar(max)")]
        public string ItemStats { get; set; }

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

        public bool? IsIdentified { get; set; }
        public bool? IsVisible { get; set; }
        public bool? IsEquipped { get; set; }
        public bool IsMagical { get; set; }
        public bool IsConsumable { get; set; }

        [Column(TypeName = "nvarchar(1024)")]
        public string ItemCalculation { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        [Column(TypeName = "nvarchar(20)")]
        public string Rarity { get; set; }


        public int? ParentItemId { get; set; }
        public bool? IsDeleted { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string CommandName { get; set; }

        public int? CopiedLootID { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string gmOnly { get; set; }


        public virtual Character Character { get; set; }
        public virtual ItemMaster ItemMaster { get; set; }
        public virtual List<ItemCommand> ItemCommandVM { get; set; }

        public virtual ICollection<ItemAbility> ItemAbilities { get; set; }
        public virtual ICollection<ItemSpell> ItemSpells { get; set; }
        public virtual ICollection<ItemBuffAndEffect> ItemBuffAndEffects { get; set; }
    }

    public class ItemVM
    {
        public virtual List<ItemVMWithQty> Items { get; set; }
        public virtual List<CharacterCurrency> CharacterCurrency { get; set; }
    }

    public class ItemVMWithQty : Item
    {
        public decimal Qty { get; set; }
    }
}
