using DAL.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class LootTemplateCurrency
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LootTemplateCurrencyId { get; set; }
        public int Amount { get; set; }
        public string Command { get; set; }

        [Required]
        public int LootTemplateId { get; set; }
        [Required]
        public int CurrencyTypeId { get; set; }

        public string Name { get; set; }
        public decimal BaseUnit { get; set; }
        public decimal WeightValue { get; set; }
        public int? SortOrder { get; set; }

        public bool IsDeleted { get; set; }
        
        //public virtual CurrencyType CurrencyType { get; set; }
        public virtual LootTemplate LootTemplate { get; set; }
    }
}

