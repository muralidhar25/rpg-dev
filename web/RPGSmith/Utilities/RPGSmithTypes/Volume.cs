using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTypes
{
    public class Volume
    {
        public string allowedFormat { get; set; }
        public decimal depthvalue { get; set; }
        public decimal heightvalue { get; set; }
        public decimal lenghtvalue { get; set; }

        public Units units = new Units();
    }
}