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
    
    public partial class characterprofile_BCK_15092017
    {
        public int CharacterProfileId { get; set; }
        public string UserId { get; set; }
        public int CampaignId { get; set; }
        public string Name { get; set; }
        public string Portrait { get; set; }
        public System.DateTime Authored { get; set; }
        public Nullable<System.DateTime> Edited { get; set; }
        public Nullable<int> RulesetId { get; set; }
    }
}
