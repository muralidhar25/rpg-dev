using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
   public class UserSubscription
    {   //INSERT INTO [UserSubscriptions] SELECT id,3,0,3,0,1000 from AspNetUsers
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }
        public int RulesetCount { get; set; }
        public int CampaignCount { get; set; }
        public int CharacterCount { get; set; }
        public int PlayerCount { get; set; }
        public int StorageSpaceInMB { get; set; }
    }
}
