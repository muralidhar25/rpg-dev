using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class ItemMasterBuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ItemMasterId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual ItemMaster ItemMaster { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
    public class SpellBuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int SpellId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Spell Spell { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
    public class AbilityBuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int AbilityId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Ability Spell { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
    public class ItemBuffAndEffect
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ItemId { get; set; }
        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Item Item { get; set; }
        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
}
