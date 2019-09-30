using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class MonsterTemplateViewModel
    {
        public int MonsterTemplateId { get; set; }
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string Command { get; set; }        
        public string CommandName { get; set; }        
        public string Description { get; set; }        
        public string gmOnly { get; set; }        
        public string Stats { get; set; }
        public string ImageUrl { get; set; }        
        public string Metatags { get; set; }
        public int? ParentMonsterTemplateId { get; set; }
        public bool IsDeleted { get; set; }
        public string Health { get; set; }
        public string ArmorClass { get; set; }
        public string XPValue { get; set; }
        public string ChallangeRating { get; set; }
        public string InitiativeCommand { get; set; }
        public bool IsRandomizationEngine { get; set; }

        public virtual RuleSet RuleSet { get; set; }        
        public virtual ICollection<MonsterTemplateCommand> MonsterTemplateCommand { get; set; }

    }
}
