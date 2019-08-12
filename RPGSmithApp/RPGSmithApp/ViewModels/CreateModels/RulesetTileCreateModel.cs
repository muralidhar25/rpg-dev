using DAL.Models.RulesetTileModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.CreateModels
{
    public class RulesetTileCreateModel
    {
       
        [Required]
        public int? TileTypeId { get; set; }

        [Required]
        public int? RulesetDashboardPageId { get; set; }

        [Required]
        public int? RulesetId { get; set; }

       // [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        //public string Color { get; set; }
        //public string BgColor { get; set; }

        public int Shape { get; set; }

        public int LocationX { get; set; }
        public int LocationY { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public int SortOrder { get; set; }

        public bool IsDeleted { get; set; }
     
        public RulesetNoteTile NoteTile { get; set; }
        public RulesetImageTile ImageTile { get; set; }
        public RulesetTextTile TextTile { get; set; }
        public RulesetToggleTile ToggleTile { get; set; }
        public RulesetCounterTile CounterTile { get; set; }
        public RulesetCharacterStatTile CharacterStatTile { get; set; }
        public RulesetCommandTile CommandTile { get; set; }
        public RulesetBuffAndEffectTile BuffAndEffectTile { get; set; }

        public List<CharacterStatIds> MultiCharacterStats { get; set; }
    }

}
