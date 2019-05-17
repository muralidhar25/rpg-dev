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

        public virtual ItemMaster ItemMaster { get; set; } 
    }
    //public class ItemMasterLootSpell
    //{
    //    public int ItemMasterLootId { get; set; }
    //    public int SpellId { get; set; }
    //    public bool? IsDeleted { get; set; }

    //    public virtual ItemMasterLoot ItemMasterLoot { get; set; }
    //    public virtual Spell Spell { get; set; }
    //}
    //public class ItemMasterLootAbility
    //{
    //    public int ItemMasterLootId { get; set; }
    //    public int AbilityId { get; set; }
    //    public bool? IsDeleted { get; set; }

    //    public virtual ItemMasterLoot ItemMasterLoot { get; set; }
    //    public virtual Ability Abilitiy { get; set; }
    //}
    //public class ItemMasterLootCommand
    //{
    //    [Key]
    //    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    //    public int ItemMasterLootCommandId { get; set; }
    //    public string Command { get; set; }

    //    [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
    //    [Column(TypeName = "nvarchar(255)")]
    //    public string Name { get; set; }

    //    public int ItemMasterLootId { get; set; }
    //    public bool? IsDeleted { get; set; }

    //    public virtual ItemMasterLoot ItemMasterLoot { get; set; }
    //}
}
