using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.EditModels
{
    public class LastCommandViewModel
    {
        [Required]
        public int CharacterId { get; set; }
        
        [Required]
        public string LastCommand { get; set; }

        [Required]
        public string LastCommandResult { get; set; }

        public string LastCommandValues { get; set; }
    }
}
