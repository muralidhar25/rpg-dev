using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{

public class Email
    {
        public string value { get; set; }
        public string type { get; set; }
    }

    public class Name
    {
        public string familyName { get; set; }
        public string givenName { get; set; }
    }

    public class Image
    {
        public string url { get; set; }
        public bool isDefault { get; set; }
    }

    public class GoogleResponseViewModel
    {
        public string kind { get; set; }
        public string etag { get; set; }
        public string gender { get; set; }
        public List<Email> emails { get; set; }
        public string objectType { get; set; }
        public string id { get; set; }
        public string displayName { get; set; }
        public Name name { get; set; }
        public string url { get; set; }
        public Image image { get; set; }
        public bool isPlusUser { get; set; }
        public string language { get; set; }
        public int circledByCount { get; set; }
        public bool verified { get; set; }
        public string domain { get; set; }
    }
}
