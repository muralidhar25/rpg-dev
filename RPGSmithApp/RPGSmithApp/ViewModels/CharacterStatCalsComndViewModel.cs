using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatCalsComndViewModel
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "CalculationCommand is required"), StringLength(500, ErrorMessage = "CalculationCommand length not more than 500 char")]
        public string CalculationCommandValue { get; set; }
        public string StatCalculationIds { get; set; }
    }
}
