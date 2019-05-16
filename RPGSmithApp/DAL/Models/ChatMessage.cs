using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DAL.Models
{
    public class ChatMessage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Message { get; set; }
        public int CampaignID { get; set; }
        public int SenderCharacterID { get; set; }
        public int SenderCampaignID { get; set; }
        public int ReceiverCharacterID { get; set; }
        public int ReceiverCampaignID { get; set; }
        public DateTime DateSent { get; set; }
        public bool IsSystemGenerated { get; set; }
    }   
}
