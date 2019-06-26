using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class MonsterTemplateBundle
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
        
       
        
        
        [Column(TypeName = "nvarchar(max)")]
        public string Metatags { get; set; }

       

        public int? ParentMonsterTemplateBundleId { get; set; }
        public bool? IsDeleted { get; set; }
        public bool AddToCombat { get; set; }


        public virtual MonsterTemplateBundle ParentMonsterTemplateBundle { get; set; }
        public virtual RuleSet RuleSet { get; set; }
        public virtual ICollection<MonsterTemplateBundleItem> MonsterTemplateBundleItems { get; set; }

    }
}
