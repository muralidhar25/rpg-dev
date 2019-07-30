using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{    
    public class LootTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LootTemplateId { get; set; }

        public int RuleSetId { get; set; }
        public virtual RuleSet RuleSet { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        public bool IsDeleted { get; set; }

        public virtual ICollection<LootTemplateRandomizationEngine> LootTemplateRandomizationEngines { get; set; }
    }
    public class LootTemplateRandomizationEngine
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RandomizationEngineId { get; set; }
        public int LootTemplateId { get; set; }

        public decimal Percentage { get; set; }
        public string Qty { get; set; }
        public int SortOrder { get; set; }
        public int ItemMasterId { get; set; }
        public bool IsOr { get; set; }
        public bool IsDeleted { get; set; }

        public virtual ItemMaster ItemMaster { get; set; }
        public virtual LootTemplate LootTemplate { get; set; }
    }
    public class Create_LootTemplate_ViewModel
    {
        public int LootTemplateId { get; set; }

        public int RuleSetId { get; set; }
        //public virtual RuleSet RuleSet { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string ImageUrl { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        public bool IsDeleted { get; set; }

        public ICollection<LootTemplateRandomizationEngine> LootTemplateRandomizationEngines { get; set; }
    }
    public class LootTemplate_ViewModel
    {
        public int LootTemplateId { get; set; }

        public int RuleSetId { get; set; }
        public virtual RuleSet RuleSet { get; set; }

        
        public string Name { get; set; }

        
        public string Description { get; set; }

        
        public string ImageUrl { get; set; }

       
        public string Metatags { get; set; }

        public bool IsDeleted { get; set; }

        public ICollection<LootTemplateRandomizationEngine> LootTemplateRandomizationEngines { get; set; }
    }
    //public class LootPileTemplate
    //{
    //    [Key]
    //    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    //    public int LootPileId { get; set; }

    //    public int RuleSetId { get; set; }
    //    public virtual RuleSet RuleSet { get; set; }

    //    [Required]
    //    [Column(TypeName = "nvarchar(255)")]
    //    public string Name { get; set; }

    //    [Column(TypeName = "nvarchar(max)")]
    //    public string Description { get; set; }

    //    [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
    //    [Column(TypeName = "nvarchar(2048)")]
    //    public string ImageUrl { get; set; }

    //    [Column(TypeName = "nvarchar(max)")]
    //    public string Metatags { get; set; }

    //    public bool Visible { get; set; }

    //    public int? CharacterID { get; set; }
    //    public virtual Character Character { get; set; }

    //    public int? MonsterID { get; set; }
    //    public virtual Monster Monster { get; set; }

    //    public bool IsDeleted { get; set; }

    //    public virtual ICollection<LootPileLootItem> LootPileLootItems { get; set; }
    //}    
    //public class LootPileLootItem
    //{
    //    [Key]
    //    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    //    public int LootPileLootItemId { get; set; }
    //    public int LootPileId { get; set; }
    //    public int LootId { get; set; }
    //    public bool IsDeleted { get; set; }

    //    public virtual LootPileTemplate LootPile { get; set; }
    //    public virtual ItemMasterLoot Loot { get; set; }
    //}
}