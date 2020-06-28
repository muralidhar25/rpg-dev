using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
    public class CondionalAndOperatorSP
    {
        public int CharacterStatConditionId { get; set; }
        public string IfClauseStatText { get; set; }
        public int? ConditionOperatorID { get; set; }
        public string CompareValue { get; set; }
        public string Result { get; set; }
        public int SortOrder { get; set; }
        public int CharacterStatId { get; set; }
        public bool IsNumeric { get; set; }
        public int ConditionOperatorId { get; set; }
        public string OperatorName { get; set; }
        public string OperatorSymbol { get; set; }
        public bool OperatorIsNumeric { get; set; }
    }
}
