using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class DiceTray
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DiceTrayId { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string Name { get; set; }

        public int? CustomDiceId { get; set; }
        public virtual CustomDice CustomDice { get; set; }

        public int? DefaultDiceId { get; set; }
        public virtual DefaultDice DefaultDice { get; set; }

        public bool IsCustomDice { get; set; }

        public bool IsDefaultDice { get; set; }

        public int RuleSetId { get; set; }
        public virtual RuleSet RuleSet { get; set; }

        public int SortOrder { get; set; }
    }
}
