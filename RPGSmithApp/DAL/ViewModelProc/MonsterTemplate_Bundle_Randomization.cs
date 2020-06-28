using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
   public class MonsterTemplate_Bundle_Randomization
    {
        public int MonsterTemplateId { get; set; }
        public int RuleSetId { get; set; }
        public string Name { get; set; }
        public string Command { get; set; }
        public string CommandName { get; set; }
        public string Description { get; set; }
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
        public string gmOnly { get; set; }
        public int BundleItemId { get; set; }
        public int? BundleId { get; set; }
        public decimal Quantity { get; set; }
        public string BundleName { get; set; }
        public string BundleImage { get; set; }
        public string BundleVisibleDesc { get; set; }
        public int? ParentMonsterTemplateBundleId { get; set; }
        public bool AddToCombat { get; set; }
    }
}
