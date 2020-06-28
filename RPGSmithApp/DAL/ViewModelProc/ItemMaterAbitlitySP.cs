using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
    public class ItemMaterAbitlitySP
    {
        public int ItemMasterId { get; set; }
        public int AbilityId { get; set; }
        public bool? IsDeleted { get; set; }
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string Level { get; set; }
        public string Command { get; set; }
        public int MaxNumberOfUses { get; set; }
        public int CurrentNumberOfUses { get; set; }
        public string Description { get; set; }
        public string Stats { get; set; }
        public bool IsEnabled { get; set; }
        public string ImageUrl { get; set; }
        public string Metatags { get; set; }
        public int? ParentAbilityId { get; set; }
        public string CommandName { get; set; }
        public string gmOnly { get; set; }
        public AbilitySP AbilitySP { get; set;}
    }
}
