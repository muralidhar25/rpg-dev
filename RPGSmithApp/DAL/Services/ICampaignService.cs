using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;

namespace DAL.Services
{
    public interface ICampaignService
    {
        Task<PlayerInvite> CreatePlayerInvite(PlayerInviteEmail model,string PlayerUserId,bool IsInviteSentUsingUserName);
        Task<bool> SameInviteAlreadyExists(PlayerInviteEmail model, string playerUserId);
        List<PlayerInviteList> getInvitedPlayers(int rulesetId);
        PlayerInviteList getInvitedPlayerById(int inviteId);
        bool cancelInvite(int inviteID);
        bool removePlayerFromCampaign(int inviteID);
        Task<List<PlayerInvite>> getReceivedInvites(string userid);
        bool isPlayerSlotAvailableToSendInvite(string userId,int campaignID);
        Task<PlayerInvite> DeclineInvite(int inviteID);
        Task<PlayerInvite> AcceptInvite(int inviteID);
        Task<PlayerInvite> AnswerLaterInvite(int inviteID);
    }
}
