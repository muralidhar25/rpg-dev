using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTileTypes
{
    public class Link
    {
        public int LinkId { get; set; }
        public int? CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string SelectedProperty { get; set; }
        public string SelectedPropertyValue { get; set; }
        public string SelectedPropertyValueImage { get; set; }
    }
}