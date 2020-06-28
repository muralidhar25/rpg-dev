using DAL.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class ItemMasterLootCurrency
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemMasterLootCurrencyId { get; set; }
        public int Amount { get; set; }
        public string Command { get; set; }

        public string Name { get; set; }
        public decimal BaseUnit { get; set; }
        public decimal WeightValue { get; set; }
        public int? SortOrder { get; set; }

        [Required]
        public int LootId { get; set; }

        public int CurrencyTypeId { get; set; }

        public bool IsDeleted { get; set; }
        
        //public virtual CurrencyType CurrencyType { get; set; }
        public virtual ItemMasterLoot ItemMasterLoot { get; set; }
    }
}

