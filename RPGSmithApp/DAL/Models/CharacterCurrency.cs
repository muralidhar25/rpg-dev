using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class CharacterCurrency
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterCurrencyId { get; set; }

        public int Amount { get; set; }
        public string Command { get; set; }

        public string Name { get; set; }
        public decimal BaseUnit { get; set; }
        public decimal WeightValue { get; set; }
        public int? SortOrder { get; set; }
        public bool IsDeleted { get; set; }

        public int CurrencyTypeId { get; set; }
        //public virtual CurrencyType CurrencyType { get; set; }

        public int CharacterId { get; set; }
        public virtual Character Character { get; set; }
    }
}
