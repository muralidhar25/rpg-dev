//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace RPGSmith.Data.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Counter_BCK_26092017
    {
        public int CounterId { get; set; }
        public int CharacterProfileId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Mask { get; set; }
        public decimal DefaultValue { get; set; }
        public decimal Value { get; set; }
        public Nullable<decimal> Min { get; set; }
        public Nullable<decimal> Max { get; set; }
        public decimal Step { get; set; }
        public System.DateTime Authored { get; set; }
        public Nullable<System.DateTime> Edited { get; set; }
    }
}
