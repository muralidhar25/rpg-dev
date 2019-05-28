using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using NgChatSignalR.Models;

namespace DAL.Services
{
    public interface ICampaignService
    {
        Task<PlayerInvite> CreatePlayerInvite(PlayerInviteEmail model,string PlayerUserId,bool IsInviteSentUsingUserName);
        Task<bool> SameInviteAlreadyExists(PlayerInviteEmail model, string playerUserId);
        List<PlayerInviteList> getInvitedPlayers(int rulesetId, ApplicationUser user);
        List<ParticipantResponseViewModel> getChatParticipantList();
        PlayerInviteList getInvitedPlayerById(int inviteId);
        bool cancelInvite(int inviteID);
        bool removePlayerFromCampaign(PlayerInviteList model);
        Task<List<PlayerInvite>> getReceivedInvites(string userid);
        bool isPlayerSlotAvailableToSendInvite(string userId,int campaignID);
        Task<PlayerInvite> DeclineInvite(int inviteID);
        Task<PlayerInvite> AcceptInvite(int inviteID,int characterID);
        Task<PlayerInvite> AnswerLaterInvite(int inviteID);
        Task<bool> isInvitedPlayerCharacter(int characterId);
        Task<PlayerControl> getPlayerControlsByCampaignId(int campaignID);
        Task<PlayerControlModel> getPlayerControlsByCharacterId(int characterID,ApplicationUser currentUser);
        Task<PlayerControl> updatePlayerControls(PlayerControl model);
        bool IsDeletedInvite(int _characterId, string _userId);
        string GetDeletedCharacterName(int characterID);
        void SaveChatMessage(ChatMessage chatMessageModel);
        List<ChatMessage> GetChatMessage(int campaignID);
        Task<bool> isGmAccessingPlayerCharacterUrl(int characterID, ApplicationUser currentUser);
    }
}
