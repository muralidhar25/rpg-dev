using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatComboViewModel
    {
        public int CharacterStatComboId { get; set; }
        public Nullable<int> Maximum { get; set; }
        public Nullable<int> Minimum { get; set; }
        public int DefaultValue { get; set; }
        public string DefaultText { get; set; }
    }
}
