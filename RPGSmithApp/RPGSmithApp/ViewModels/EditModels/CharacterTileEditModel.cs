using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.EditModels
{
    public class CharacterTileEditModel
    {
        [Required]
        public int? CharacterTileId { get; set; }

        [Required]
        public int? TileTypeId { get; set; }

        [Required]
        public int? CharacterDashboardPageId { get; set; }

        [Required]
        public int? CharacterId { get; set; }

        [MaxLength(50, ErrorMessage = "The field Color must be string with maximum length of 50 characters")]
        public string Color { get; set; }
        public string BgColor { get; set; }

        public int Shape { get; set; }
        public int SortOrder { get; set; }

        public int LocationX { get; set; }
        public int LocationY { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }

        public bool IsDeleted { get; set; }
     
        public CharacterNoteTile NoteTile { get; set; }
        public CharacterImageTile ImageTile { get; set; }
        public CharacterTextTile TextTile { get; set; }
        public CharacterCounterTile CounterTile { get; set; }
        public CharacterCharacterStatTile CharacterStatTile { get; set; }
        public CharacterExecuteTile ExecuteTile { get; set; }
        public CharacterLinkTile LinkTile { get; set; }
        public CharacterCommandTile CommandTile { get; set; }
    }
}
