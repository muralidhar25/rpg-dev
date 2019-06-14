using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterBuffAndEffect
    {
        public int ItemMasterId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual ItemMaster ItemMaster { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
    public class SpellBuffAndEffect
    {
        public int SpellId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Spell Spell { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
    public class AbilityBuffAndEffect
    {
        public int AbilityId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Ability Spell { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
    public class ItemBuffAndEffect
    {
        public int ItemId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Item Item { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
}
