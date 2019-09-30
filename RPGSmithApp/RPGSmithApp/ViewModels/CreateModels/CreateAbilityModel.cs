using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.CreateModels
{
    public class CreateAbilityModel
    {
        public int AbilityId { get; set; }
        [Required]
        public int RuleSetId { get; set; }

        [Required]   
        public string Name { get; set; }
       
        public string Level { get; set; }
        public string Command { get; set; }
        public string CommandName { get; set; }
       
        public int? MaxNumberOfUses { get; set; }       
        public int? CurrentNumberOfUses { get; set; }

        public string Description { get; set; }
        public string gmOnly { get; set; }
        public string Stats { get; set; }
        public string ImageUrl { get; set; }
        
        public bool? IsEnabled { get; set; }
     
        public string Metatags { get; set; }

        public bool IsFromCharacter { get; set; }
        public int IsFromCharacterId { get; set; }

        public List<AbilityCommand> AbilityCommandVM { get; set; }
        public List<AbilityBuffAndEffect> AbilityBuffAndEffectVM { get; set; }
    }
}
