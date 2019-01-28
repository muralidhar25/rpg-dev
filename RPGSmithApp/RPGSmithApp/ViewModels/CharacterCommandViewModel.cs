using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace RPGSmithApp.ViewModels
{
    public class CharacterCommandViewModel
    {
        public int CharacterCommandId { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Command { get; set; }
        public string CommandResult { get; set; }
        public string LastCommandValues { get; set; }
        

        public int CharacterId { get; set; }

        public DateTime? CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
