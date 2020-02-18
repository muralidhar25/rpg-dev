using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.ViewModelProc
{
    public class ItemsSP
    {
        public string AbsolutePath { get; set; }
        public string AbsoluteUri { get; set; }
        public Boolean IsAbsoluteUri { get; set; }
        public Boolean IsSelected { get; set; }
        public Boolean IsFolder { get; set; }
        public string OriginalString { get; set; }
        public string Container { get; set; }
        public long Size { get; set; }
        public string ContentType { get; set; }
        public string name { get; set; }
        public DateTimeOffset? LastModifiedDate { get; set; }
    }
}
