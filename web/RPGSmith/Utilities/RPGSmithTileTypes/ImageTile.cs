using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTileTypes
{
    public class ImageTile
    {
        public int ImageId { get; set; }
        public int? CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Imagepath { get; set; }
    }
}