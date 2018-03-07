using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities.RPGSmithTypes
{
    public class Choice
    {
        public List<Choices> choices { get; set; }
        public string Value { get; set; }
        public string selectedchoice { get; set; }
        public string SelectedChoiceName { get; set; }
    }
    public class Choices
    {
       public string ChoiceName { get; set; }
    }
}