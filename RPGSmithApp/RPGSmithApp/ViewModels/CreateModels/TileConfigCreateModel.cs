using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels.CreateModels
{
    public class TileConfigCreateModel
    {
        [Required]
        public int CharacterTileId { get; set; }
        [Required]
        public int Payload { get; set; }
        [Required]
        public int Col { get; set; }
        [Required]
        public int Row { get; set; }
        [Required]
        public int SizeX { get; set; }
        [Required]
        public int SizeY { get; set; }
        
    }
}
