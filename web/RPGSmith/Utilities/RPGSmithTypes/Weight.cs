using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTypes
{
    public class Weight
    {
        public string allowedFormat { get; set; }
        public int value { get; set; }

        //public Units units = new Units();
        public Units units { get; set; }

    }
}