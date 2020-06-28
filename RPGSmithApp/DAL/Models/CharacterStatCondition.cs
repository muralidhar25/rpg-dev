using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class CharacterStatCondition
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterStatConditionId { get; set; }


        //public int? IfClauseStatId { get; set; }
        //public int? IfClauseStattype { get; set; }
        public string IfClauseStatText { get; set; }
        public int? ConditionOperatorID { get; set; }
        [Column(TypeName = "nvarchar(255)")]
        public string CompareValue { get; set; }
        [Column(TypeName = "nvarchar(255)")]
        public string Result { get; set; }
        public int SortOrder { get; set; }     

        public int CharacterStatId { get; set; }
        public bool IsNumeric { get; set; }

        public virtual ConditionOperator ConditionOperator { get; set; }
        public virtual CharacterStat CharacterStat { get; set; }
        //public virtual CharacterStat IfClauseStat { get; set; }
    }
}
