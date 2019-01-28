using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.Helpers
{
    public static class Enum
    {
        public enum LinkType
        {
            spell,
            ability,
            item
        }

        public enum TILES
        {
            NOTE = 1,
            IMAGE = 2,
            COUNTER = 3,
            CHARACTERSTAT = 4,
            LINK = 5,
            EXECUTE = 6,
            COMMAND = 7,
            TEXT=8
        }

        public enum STAT_TYPE
        {
            Text = 1,
            RichText = 2,
            Number = 3,
            CurrentMax = 5,
            Choice = 6,
            ValueSubValue = 7,
            OnOff = 9,
            YesNo = 10,
            Calculation = 12,
            Command = 13,
            Toggle = 14,
            Combo = 15,
            LinkRecord = 18,
            Condition=19
        }

    }
}
