using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Web.ViewModels
{
    public class RPGSmithTypeViewModel
    {

        public int TypeId { get; set; }

        public string Name { get; set; }

        public string AllowedValues { get; set; }

        public List<string> Units { get; set; }

		public string Description { get; set; }

		public string Examples { get; set; }

	}
    
}