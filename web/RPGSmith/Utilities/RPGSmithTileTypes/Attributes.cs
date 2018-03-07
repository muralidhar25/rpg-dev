using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTileTypes
{
    public class Attributes
    {
        public int AttributeId { get; set; }
        public int? CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
        public string CorestatValueEdit { get; set; }
        public int? CoreStatValueId { get; set; }
        public int? TypeId { get; set; }
        public CustomTypes CoreStatValue { get; set; }
        public string CorestatValues { get; set; }
        public string SelectedCorestatValue { get; set; }

    }
}