using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterBundle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BundleId { get; set; }

        public int? RuleSetId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string BundleName { get; set; }

        [MaxLength(2048, ErrorMessage = "The field must be string with maximum length of 2048 characters")]
        [Column(TypeName = "nvarchar(2048)")]
        public string BundleImage { get; set; }
       
        [Column(TypeName = "nvarchar(max)")]
        public string BundleVisibleDesc { get; set; }
        
       
        [Column(TypeName = "decimal(18, 8)")]
        public decimal Value { get; set; }
        
        [Column(TypeName = "decimal(18, 8)")]
        public decimal Volume { get; set; }
       
        [Column(TypeName = "decimal(18, 3)")]
        public decimal TotalWeight { get; set; }
       
        
        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

        [Column(TypeName = "nvarchar(20)")]
        public string Rarity { get; set; }

        public int? ParentItemMasterBundleId { get; set; }
        public bool? IsDeleted { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string gmOnly { get; set; }

        public virtual ItemMasterBundle ParentItemMasterBundle { get; set; }
        public virtual RuleSet RuleSet { get; set; }
        public virtual ICollection<ItemMasterBundleItem> ItemMasterBundleItems { get; set; }

    }
}
