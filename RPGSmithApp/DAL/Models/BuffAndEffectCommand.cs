using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class BuffAndEffectCommand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BuffAndEffectCommandId { get; set; }
        public string Command { get; set; }
        public string Name { get; set; }

        public int BuffAndEffectId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual BuffAndEffect BuffAndEffect { get; set; }
    }
}
