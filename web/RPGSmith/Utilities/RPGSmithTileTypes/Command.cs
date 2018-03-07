using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTileTypes
{
    public class Command
    {
        public int CommandId { get; set; }
        public int? CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string command { get; set; }
        public string commandLastResult { get; set; }
        public string ImagePath { get; set; }
        public DateTime? commandLastRunDate { get; set; }
    }
}