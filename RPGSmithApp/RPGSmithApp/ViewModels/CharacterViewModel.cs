using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterViewModel
    {
        public int CharacterId { get; set; }
        public string CharacterName { get; set; }
        public string CharacterDescription { get; set; }
        public byte[] CharacterImage { get; set; }
        public string ImageUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public string LastCommand { get; set; }
        public string LastCommandResult { get; set; }
        public string LastCommandValues { get; set; }
        public int LastCommandTotal { get; set; }
        public decimal InventoryWeight { get; set; }
        public RuleSetViewModel RuleSet { get; set; }
        public List<RuleSetViewModel> RuleSets { get; set; }
    }
}
