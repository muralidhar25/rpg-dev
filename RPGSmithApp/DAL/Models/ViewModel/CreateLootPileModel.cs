using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models.ViewModel
{
    public class CreateLootPileModel
    {
        public int LootPileId { get; set; }

        public int RuleSetId { get; set; }
        //public RuleSet RuleSet { get; set; }
        
        public string Name { get; set; }
        
        public string Description { get; set; }
        
        public string ImageUrl { get; set; }
        
        public string Metatags { get; set; }

        public bool Visible { get; set; }

        public int? CharacterID { get; set; }
        //public Character Character { get; set; }

        public int? MonsterID { get; set; }
        //public Monster Monster { get; set; }

        public bool IsDeleted { get; set; }

        public List<LootsToAdd> ItemList { get; set; }
    }
}
