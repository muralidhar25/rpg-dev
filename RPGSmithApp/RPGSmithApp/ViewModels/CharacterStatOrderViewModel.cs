using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatOrderViewModel
    {
        public int RuleSetId { get; set; }
        public int CharacterStatId { get; set; }
        public short SortOrder { get; set; }
    }
}
