using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatChoicesViewModel
    {
        public int CharacterStatChoiceId { get; set; }

        [Required(ErrorMessage = "StatChoiceValue is required"), StringLength(100, ErrorMessage = "StatChoiceValue length not more than 100 char")]
        public string StatChoiceValue { get; set; }
    }
}
