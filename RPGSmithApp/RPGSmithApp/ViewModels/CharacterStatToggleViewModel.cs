using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatToggleViewModel
    {
        public int CharacterStatToggleId { get; set; }

        public Boolean YesNo { get; set; }
        public Boolean OnOff { get; set; }
        public Boolean Display { get; set; }
        public Boolean ShowCheckbox { get; set; }
        public Boolean IsCustom { get; set; }
        public Boolean IsDeleted { get; set; }

        public int CustomToggleId { get; set; }

        //public int CharacterStatId { get; set; }

        public List<CustomToggleViewModel> customToggles { get; set; }

    }

}
