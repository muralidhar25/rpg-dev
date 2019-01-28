using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models.RulesetTileModels
{
    public class RulesetTile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RulesetTileId { get; set; }

        [Required]
        public int TileTypeId { get; set; }
        [Required]
        public int RulesetDashboardPageId { get; set; }
        [Required]
        public int RulesetId { get; set; }
        
        public int Shape { get; set; }
        public int LocationX { get; set; }
        public int LocationY { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public int SortOrder { get; set; }

        public bool IsDeleted { get; set; }

        public virtual RuleSet Ruleset { get; set; }
        public virtual TileType TileType { get; set; }
        public virtual RulesetDashboardPage RulesetDashboardPage { get; set; }
        public virtual RulesetNoteTile NoteTiles { get; set; }
        public virtual RulesetImageTile ImageTiles { get; set; }
        public virtual RulesetTextTile TextTiles { get; set; }
        public virtual RulesetCounterTile CounterTiles { get; set; }
        public virtual RulesetCharacterStatTile CharacterStatTiles { get; set; }
        //public virtual RulesetExecuteTile ExecuteTiles { get; set; }
        //public virtual RulesetLinkTile LinkTiles { get; set; }
        public virtual RulesetCommandTile CommandTiles { get; set; }
        public virtual RulesetTileConfig Config { get; set; }
    }
}
