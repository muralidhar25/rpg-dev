﻿using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class MonsterCurrency
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MonsterCurrencyId { get; set; }
        public int Amount { get; set; }
        public string Command { get; set; }

        public string Name { get; set; }
        public decimal BaseUnit { get; set; }
        public decimal WeightValue { get; set; }
        public int? SortOrder { get; set; }

        [Required]
        public int MonsterId { get; set; }
        [Required]
        public int CurrencyTypeId { get; set; }
        public bool IsDeleted { get; set; }
        
        //public virtual CurrencyType CurrencyType { get; set; }
        public virtual Monster Monster { get; set; }
    }
}

