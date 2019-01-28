using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models.APIModels
{
   public class SearchResult
    {
        public String jsonResult { get; set; }
        public Dictionary<String, String> Headers { get; set; }
    }
}
