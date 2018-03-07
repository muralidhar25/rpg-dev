using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using RPGSmith.Utilities.RPGSmithTileTypes;

namespace RPGSmith.Utilities
{
    public class TileTypes
    {
        public Attributes Attribute { get; set; }
        public Note Note { get; set; }
        public Counter Counter { get; set; }
        public Link Link { get; set; }
        public Execute Execute { get; set; }
        public Command Command { get; set; }
        public ImageTile Imagetile { get; set; }
    }
    public class TileTypeslst
    {
        public List<Attributes> Attributes { get; set; }
        public List<Note> Notes { get; set; }
        public List<Counter> Counters { get; set; }
        public List<Link> Links { get; set; }
        public List<Execute> Executes { get; set; }
        public List<Command> Commands { get; set; }
        public List<ImageTile> ImageTile { get; set; }
    }
}