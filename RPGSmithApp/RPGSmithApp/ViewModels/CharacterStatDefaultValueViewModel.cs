using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatDefaultValueViewModel
    {
        public int CharacterStatDefaultValueId { get; set; }
        public int CharacterStatId { get; set; }
        public string DefaultValue { get; set; }
        public int Maximum { get; set; }
        public int Minimum { get; set; }
        public int Type { get; set; }
    }

}
