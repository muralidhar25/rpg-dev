using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class BuffAndEffectViewModel
    {
        public int BuffAndEffectId { get; set; }
        public int? ParentBuffAndEffectId { get; set; }
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string Command { get; set; }
        public string CommandName { get; set; }
        public string Description { get; set; }
        public string Stats { get; set; }
        public string ImageUrl { get; set; }
        public string Metatags { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual RuleSet RuleSet { get; set; }

      //  public virtual ICollection<ItemMasterAbility> ItemMasterAbilities { get; set; }
        public virtual ICollection<BuffAndEffectCommand> BuffAndEffectCommand { get; set; }


        //public int CharacterId { get; set; }
        //public virtual Character Character { get; set; }

    }
    public class CharacterBuffAndEffectViewModel : BuffAndEffectViewModel {
        public int CharacterId { get; set; }
        public int CharacterBuffAandEffectId { get; set; }
    }
}
