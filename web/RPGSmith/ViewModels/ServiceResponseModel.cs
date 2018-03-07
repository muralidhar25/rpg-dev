using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmith.Web.ViewModels
{
    public class ServiceResponseModel
    {
        public Object Result { get; set; }
        public int StatusCode { get; set; }
        public string ErrorMessage { get; set; }
        public bool ShowToUser { get; set; }

    }
}