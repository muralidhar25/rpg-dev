using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTileTypes
{
    public class Counter
    {
        public int CounterId { get; set; }
        public int CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Mask { get; set; }
        public decimal DefaultValue { get; set; }
        public decimal Value { get; set; }
        public decimal? Min { get; set; }
        public decimal? Max { get; set; }
        public decimal Step { get; set; }
    }
}