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
        public string PlayerEmail { get; set; }

        public bool IsSendToUserName { get; set; }
        public bool IsDeclined { get; set; }
        public bool IsAnswerLater { get; set; }
        public DateTime SendOn { get; set; }

    }
    public class PlayerInviteEmail {
        public string UserName { get; set; }
        public string SendByUserId { get; set; }
        public int CampaignId { get; set; }
        public string SendByUserName { get; set; }
        public string SendByCampaignName { get; set; }
        public string SendByCampaignImage { get; set; }        
    }
    public class PlayerInviteList
    {
        public int InviteId { get; set; }
        public string playerCharacterImage { get; set; }
        public string playerCharacterName { get; set; }
        public DateTime sendOn { get; set; }
        public bool isAccepted { get; set; }
        public bool isDeclined { get; set; }
        public bool isSendToUserName { get; set; }
        public bool isAnswerLater { get; set; }
        public string playerUserImage { get; set; }
        public string playerUserName { get; set; }
        public string playerUserEmail { get; set; }
    }
}
