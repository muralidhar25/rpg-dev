using DAL.Models.CharacterTileModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
   public class TileConfig
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TileConfigId { get; set; }       
        public int CharacterTileId { get; set; }
        public int SortOrder { get; set; }

        public string UniqueId { get; set; }
        public int Payload { get; set; }
        public int Col { get; set; }
        public int Row { get; set; }
        public int SizeX { get; set; }
        public int SizeY { get; set; }

        public bool IsDeleted { get; set; }

        public virtual CharacterTile CharacterTile { get; set; }
    }
}
