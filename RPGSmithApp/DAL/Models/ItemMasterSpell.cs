using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterSpell
    {
        public int ItemMasterId { get; set; }
        public int SpellId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual ItemMaster ItemMaster { get; set; }
        public virtual Spell Spell { get; set; }
    }
}
