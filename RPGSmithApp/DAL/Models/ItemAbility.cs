using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
    public class ItemAbility
    {
        public int ItemId { get; set; }
        public int AbilityId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Item Item { get; set; }
        public virtual Ability Ability { get; set; }
    }
}
