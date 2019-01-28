using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
    public class ItemSpell
    {
        public int ItemId { get; set; }
        public int SpellId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Item Item { get; set; }
        public virtual Spell Spell { get; set; }
    }
}
