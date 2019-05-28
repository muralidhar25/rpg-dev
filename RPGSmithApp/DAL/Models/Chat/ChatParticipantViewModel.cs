using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NgChatSignalR.Models
{
    public class ChatParticipantViewModel
    {
        public ChatParticipantTypeEnum ParticipantType { get; set; }
        public string Id { get; set; }
        public int Status { get; set; }
        public string Avatar { get; set; }
        public string DisplayName { get; set; }
        public int CampaignID { get; set; }
        public int CharacterID { get; set; }
        public int CharacterCampaignID { get; set; }
        public string UserId { get; set; }
        //public string UserAvatar { get; set; }
        //public string UserDisplayName { get; set; }

    }
    public class UserModel {
        public string id { get; set; }
        public string userName { get; set; }        
        public string profileImage { get; set; }
        public int CampaignID { get; set; }
        public int CharacterID { get; set; }
        public int CharacterCampaignID { get; set; }
        public string UserId { get; set; }
        public bool IsConnectionIDProvided { get; set; }
    }
}
