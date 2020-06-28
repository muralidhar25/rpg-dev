using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatConditionViewModel
    {
        public int CharacterStatConditionId { get; set; }
        //public int? IfClauseStatId { get; set; }
        public int? ConditionOperatorID { get; set; }
        public string CompareValue { get; set; }
        public string Result { get; set; }
        public int SortOrder { get; set; }
        public int CharacterStatId { get; set; }
        //public int? IfClauseStattype { get; set; }
        public string IfClauseStatText { get; set; }
        public bool IsNumeric { get; set; }
    }

}
