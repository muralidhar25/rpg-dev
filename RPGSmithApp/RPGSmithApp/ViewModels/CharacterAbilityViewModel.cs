using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DAL.Models;

namespace RPGSmithApp.ViewModels
{
    public class CharacterAbilityViewModel
    {
        [Required]
        public int? CharacterId { get; set; }

        [Required]
        public bool? IsEnabled { get; set; }

        [Required]
        public int? AbilityId { get; set; }

        public int? CurrentNumberOfUses { get; set; }
        public int? MaxNumberOfUses { get; set; }

        public List<AbilityIds> MultiAbilities { get; set; }

        public virtual Ability Ability { get; set; }
        public virtual Character Character { get; set; }
    }

    public class AbilityIds
    {
        public int AbilityId { get; set; }
    }
}
