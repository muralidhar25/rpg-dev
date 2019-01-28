using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models.CharacterTileModels
{
    public class CharacterTile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CharacterTileId { get; set; }

        [Required]
        public int TileTypeId { get; set; }
        [Required]
        public int CharacterDashboardPageId { get; set; }
        [Required]
        public int CharacterId { get; set; }        
        public int Shape { get; set; }

        public int LocationX { get; set; }
        public int LocationY { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public int SortOrder { get; set; }

        public bool IsDeleted { get; set; }

        public virtual Character Character { get; set; }
        public virtual TileType TileType { get; set; }
        public virtual CharacterDashboardPage CharacterDashboardPage { get; set; }

        public virtual CharacterNoteTile NoteTiles { get; set; }
        public virtual CharacterImageTile ImageTiles { get; set; }
        public virtual CharacterTextTile TextTiles { get; set; }
        public virtual CharacterCounterTile CounterTiles { get; set; }
        public virtual CharacterCharacterStatTile CharacterStatTiles { get; set; }
        public virtual CharacterExecuteTile ExecuteTiles { get; set; }
        public virtual CharacterLinkTile LinkTiles { get; set; }
        public virtual CharacterCommandTile CommandTiles { get; set; }
        public virtual TileConfig Config { get; set; }
    }
}
