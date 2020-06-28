using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class ConditionOperator
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ConditionOperatorId { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(100)")]
        public string Name { get; set; }

        [Column(TypeName = "nvarchar(10)")]
        public string Symbol { get; set; }
        public bool IsNumeric { get; set; }

        //public virtual CharacterStat CharacterStat { get; set; }
        //public virtual ICollection<CustomToggle> CustomToggles { get; set; }
    }
}
