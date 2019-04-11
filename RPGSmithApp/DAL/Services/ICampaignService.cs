using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;

namespace DAL.Services
{
    public interface ICampaignService
    {
        Task<PlayerInvite> CreatePlayerInvite(PlayerInviteEmail model,string PlayerUserId, string PlayerEmail);
    }
}
