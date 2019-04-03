using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class CharacterEditModel
    {
        public int CharacterId { get; set; }

        [Required(ErrorMessage = "RuleSetId is required")]
        public int RuleSetId { get; set; }

        [Required(ErrorMessage = "CharacterName is required"), StringLength(100, ErrorMessage = "Name length not more than 100 char")]
        public string CharacterName { get; set; }

//        [StringLength(4000, ErrorMessage = "CharacterDescription length not more than 4000 char")]
        public string CharacterDescription { get; set; }

        public string ImageUrl { get; set; }

        public string ThumbnailUrl { get; set; }

        public int LayoutHeight { get; set; }
        public int LayoutWidth { get; set; }


        public string LastCommand { get; set; }
        public string LastCommandResult { get; set; }
        public string LastCommandValues { get; set; }
        public decimal InventoryWeight { get; set; }
        public string View { get; set; }

    }
}
