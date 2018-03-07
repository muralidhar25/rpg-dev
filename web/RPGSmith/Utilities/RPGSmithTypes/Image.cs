using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Drawing;

namespace RPGSmith.Utilities.RPGSmithTypes
{
    public class Image
    {
        public string image { get; set; }
        public HttpPostedFileBase clientImage { get; set; }
    }
}