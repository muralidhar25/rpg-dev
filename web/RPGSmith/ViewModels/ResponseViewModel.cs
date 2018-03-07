using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmith.Web.ViewModels
{
    public class ResponseViewModel
    {
        public Object PayLoad { get; set; }
        public int StatusCode { get; set; }
        public string ErrorMessage { get; set; }
        public bool ShowToUser { get; set; }
    }
}
