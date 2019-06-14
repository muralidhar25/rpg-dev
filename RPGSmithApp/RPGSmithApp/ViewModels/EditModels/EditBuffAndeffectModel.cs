using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.EditModels
{
    public class EditBuffAndeffectModel
    {
        [Required]
        public int? BuffAndEffectId { get; set; }
        [Required]
        public int? RuleSetId { get; set; }

        [Required]
        public string Name { get; set; }  
        public string Command { get; set; }
        public string CommandName { get; set; }

        public string Description { get; set; }
        public string Stats { get; set; }
        public string ImageUrl { get; set; }
      
        public string Metatags { get; set; }

        public List<BuffAndEffectCommand> BuffAndEffectCommandVM { get; set; }
    }
}
