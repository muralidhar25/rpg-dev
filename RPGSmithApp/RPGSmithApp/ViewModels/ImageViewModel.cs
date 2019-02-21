using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class ImageViewModel
    {
        public String UserId { get; set; }
        public String File { get; set; }
        public String Extension { get; set; }
        public String Type { get; set; } //base64 or url
    }
}
