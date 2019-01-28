using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class AbilityCommand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AbilityCommandId { get; set; }
        public string Command { get; set; }
        public string Name { get; set; }

        public int AbilityId { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Ability Abilitiy { get; set; }
    }
}
