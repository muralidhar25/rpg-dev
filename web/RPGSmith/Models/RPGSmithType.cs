using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Models
{
    public class RPGSmithTypes
    {

        public int TypeId { get; set; }

        public string Name { get; set; }

        public string AllowedValues { get; set; }

        public List<string> Units { get; set; }

    }
    
}