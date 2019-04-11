using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
   public class PlayerInvite
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string SendByUserID { get; set; }
        public virtual ApplicationUser SendByUser { get; set; }
        public string PlayerUserID { get; set; }
        public virtual ApplicationUser PlayerUser { get; set; }
        public int PlayerCampaignID { get; set; }
        public virtual RuleSet PlayerCampaign { get; set; }
        public int? PlayerCharacterID { get; set; }
        public virtual Character PlayerCharacter { get; set; }
        public bool IsAccepted { get; set; }

    }
}
