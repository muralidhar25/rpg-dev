using DAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class CharacterStatDefaultValue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatDefaultValueId { get; set; }
        public int CharacterStatId { get; set; }
        public string DefaultValue { get; set; }
        public int? Maximum { get; set; }
        public int? Minimum { get; set; }
        public int Type { get; set; }

        public virtual CharacterStat CharacterStat { get; set; }
    }

}
