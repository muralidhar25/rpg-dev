using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterAbility
    {
        public int ItemMasterId { get; set; }
        public int AbilityId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual ItemMaster ItemMaster { get; set; }
        public virtual Ability Abilitiy { get; set; }
    }
}
