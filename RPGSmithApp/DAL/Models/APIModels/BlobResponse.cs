using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models.APIModels
{
   public class BlobResponse
    {
        public List<Items> items { get; set; }
    }
    public class Items
    {
        public string AbsolutePath { get; set; }
        public string AbsoluteUri { get; set; }
        public Boolean IsAbsoluteUri { get; set; }
        public Boolean IsSelected { get; set; }
        public string OriginalString { get; set; }
        public string Container { get; set; }
        public long Size { get; set; }
        public string ContentType { get; set; }
        public DateTimeOffset? LastModifiedDate { get; set; }
        //AbsolutePath
        //AbsoluteUri  OriginalString
    }
    public class DeleteBlob
    {
        public string blobName { get; set; }
        public string userContainerName { get; set; }
    }
}
