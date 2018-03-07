using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTileTypes
{
    public class Execute
    {
        public int ExecuteId { get; set; }
        public int? CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
        public string Command { get; set; }
        public string CommandLastResult { get; set; }
        public DateTime? CommandLastRunDate { get; set; }
        public int? ContentId { get; set; }
        public int? ContentTypeId { get; set; }
        public string SelectedProperty { get; set; }
        public string SelectedPropertyValue { get; set; }
        public string SelectedPropertyValueImage { get; set; }
    }
}