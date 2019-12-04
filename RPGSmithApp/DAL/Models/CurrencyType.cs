using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class CurrencyType
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CurrencyTypeId { get; set; }

        [Required]
        [MaxLength(255, ErrorMessage = "The field Name must be string with maximum length of 255 characters")]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }
        public decimal BaseUnit { get; set; }
        public decimal WeightValue { get; set; }
        public int? SortOrder { get; set; }
        public bool IsDeleted { get; set; }

        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }

        public int RuleSetId { get; set; }

        public virtual RuleSet Ruleset { get; set; }
    }
}
