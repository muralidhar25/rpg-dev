﻿// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;

namespace DAL.Core
{
    public static class MODE
    {
        public const string NoItems = "NoItems";
        public const string TargetMode = "TargetMode";
        public const string SearchMode = "SearchMode";
    }

    public enum Gender
    {
        None,
        Female,
        Male
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
        Condition = 19
    }
}
