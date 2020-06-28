using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Models.SPModels
{
    public class RulesetRecordCount
    {
        public int SpellCount { get; set; }
        public int ItemMasterCount { get; set; }
        public int AbilityCount { get; set; }
        public int CharacterStatCount { get; set; }
        public int LayoutCount { get; set; }
        public int LootCount { get; set; }
        public int BuffAndEffectCount { get; set; }
        public int MonsterTemplateCount { get; set; }
        public int MonsterCount { get; set; }
        public int LootTemplateCount { get; set; }
    }
}
