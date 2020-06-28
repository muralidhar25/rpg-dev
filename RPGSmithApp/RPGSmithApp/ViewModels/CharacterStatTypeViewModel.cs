using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterStatTypeViewModel
    {
        public int CharacterStatTypeId { get; set; }
        [Required(ErrorMessage = "StatTypeName is required"), StringLength(10, ErrorMessage = "StatTypeName length not more than 255 char")]
        public string StatTypeName { get; set; }
        [Required(ErrorMessage = "StatTypeDesc is required"), StringLength(10, ErrorMessage = "StatTypeDesc length not more than 4000 char")]
        public string StatTypeDesc { get; set; }
        [Required(ErrorMessage = "isNumeric is required")]
        public bool isNumeric { get; set; }
    }
}
