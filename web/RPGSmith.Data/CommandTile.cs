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
    
    public partial class CommandTile
    {
        public int CommandId { get; set; }
        public Nullable<int> CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public string Command { get; set; }
        public string CommandLastResult { get; set; }
        public Nullable<System.DateTime> CommandLastRunDate { get; set; }
        public string ImagePath { get; set; }
        public string Name { get; set; }
    
        public virtual AspNetUser AspNetUser { get; set; }
    }
}
