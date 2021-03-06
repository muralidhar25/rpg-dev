﻿using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Models.SPModels
{
    public class CustomDiceViewModel
    {
        public int CustomDiceId { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Icon { get; set; }

        public bool IsNumeric { get; set; }

        public int RuleSetId { get; set; }

        public CustomDicetypeEnum CustomDicetype { get; set; }

        public virtual ICollection<CustomDiceResultViewModel> Results { get; set; }
    }
    public class CustomDiceResultViewModel
    {
        public int CustomDiceResultId { get; set; }

        
        public string Name { get; set; }

        public string DisplayContent { get; set; }

        public int CustomDiceId { get; set; }
    }
}
