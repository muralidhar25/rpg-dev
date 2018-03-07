using RPGSmith.Utilities.RPGSmithTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RPGSmith.Utilities
{
    public class CustomTypes
    {
        public Text Text { get; set; }
        public Choice Choices { get; set; }
        public Number Number { get; set; }
        public CurrentAndMaxValue CurrentAndMaxValue{get; set; }
        public ValueAndSubValue ValueAndSubValue { get; set; }
        public Image Image { get; set; }
        public OnOrOff OnOrOff { get; set; }
        public YesOrNo YesOrNo { get; set; }
        public Height Height { get; set; }
        public Volume Volume { get; set; }
        public Weight Weight { get; set; }
        public DefaultDice DefaultDice { get; set; }
        public Calculation Calculation { get; set; }

    }
}