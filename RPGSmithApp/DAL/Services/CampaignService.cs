using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class CampaignService : ICampaignService
    {
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public CampaignService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            this._configuration = configuration;
        }
        public async Task<PlayerInvite> CreatePlayerInvite(PlayerInviteEmail model, string PlayerUserId, bool IsInviteSentUsingUserName)
        {
            PlayerInvite invite = new PlayerInvite();
            invite.IsAccepted = false;
            invite.PlayerCampaignID = model.CampaignId;
            invite.PlayerCharacterID = null;
            invite.PlayerUserID = PlayerUserId;
            invite.SendByUserID = model.SendByUserId;
            invite.PlayerEmail = model.UserName;
            invite.IsSendToUserName = IsInviteSentUsingUserName;
            invite.SendOn = DateTime.Now;
            await _context.PlayerInvites.AddAsync(invite);
            await _context.SaveChangesAsync();
            return invite;
        }

        public List<PlayerInviteList> getInvitedPlayers(int rulesetId)
        {
            return _context.PlayerInvites.Where(x => x.PlayerCampaignID == rulesetId).Include(x=>x.PlayerCharacter).Include(x => x.PlayerUser).Select(
                x=>new PlayerInviteList() {
                    InviteId=x.Id,
                    isAccepted=x.IsAccepted,
                    isAnswerLater=x.IsAnswerLater,
                    isDeclined=x.IsDeclined,
                    isSendToUserName=x.IsSendToUserName,
                    playerCharacterImage=x.PlayerCharacter!=null? x.PlayerCharacter.ImageUrl :"",
                    playerCharacterName= x.PlayerCharacter != null ? x.PlayerCharacter.CharacterName : "",
                    playerUserImage= x.PlayerUser != null ? x.PlayerUser.ProfileImage : "",
                    playerUserName= x.PlayerUser != null ? x.PlayerUser.UserName : "",
                    playerUserEmail=x.PlayerEmail,
                    sendOn =x.SendOn,
                }
                ).ToList();
        }
        public PlayerInviteList getInvitedPlayerById(int inviteId)
        {
            return _context.PlayerInvites.Where(x => x.Id == inviteId).Include(x => x.PlayerCharacter).Include(x => x.PlayerUser).Select(
                x => new PlayerInviteList()
                {
                    InviteId=x.Id,
                    isAccepted = x.IsAccepted,
                    isAnswerLater = x.IsAnswerLater,
                    isDeclined = x.IsDeclined,
                    isSendToUserName = x.IsSendToUserName,
                    playerCharacterImage = x.PlayerCharacter != null ? x.PlayerCharacter.ImageUrl : "",
                    playerCharacterName = x.PlayerCharacter != null ? x.PlayerCharacter.CharacterName : "",
                    playerUserImage = x.PlayerUser != null ? x.PlayerUser.ProfileImage : "",
                    playerUserName = x.PlayerUser != null ? x.PlayerUser.UserName : "",
                    playerUserEmail = x.PlayerEmail,
                    sendOn = x.SendOn,
                }
                ).FirstOrDefault();
        }

        public async Task<List<PlayerInvite>> getReceivedInvites(string userid)
        {
            var res=await _context.PlayerInvites.Where(x => x.PlayerUserID == userid && x.IsDeclined==false).Include(x => x.PlayerCampaign).Include(x=>x.SendByUser)
                .ToListAsync();
            foreach (var invite in res)
            {
                invite.PlayerCampaign = new RuleSet()
                {
                    RuleSetId = invite.PlayerCampaign.RuleSetId,
                    RuleSetName = invite.PlayerCampaign.RuleSetName,
                    ImageUrl = invite.PlayerCampaign.ImageUrl,
                };
                invite.SendByUser = new ApplicationUser()
                {
                    FullName = invite.SendByUser.FullName,
                    UserName = invite.SendByUser.UserName,
                    Id = invite.SendByUser.Id,
                };
            }
            return res;
        }

        public async Task<bool> SameInviteAlreadyExists(PlayerInviteEmail model, string playerUserId) {
            return _context.PlayerInvites.Where(x =>
             x.PlayerCampaignID == model.CampaignId
             && x.SendByUserID == model.SendByUserId
             && x.PlayerUserID == playerUserId
             && x.PlayerEmail == model.UserName
             ).Any();
        }
        public bool cancelInvite(int inviteID)
        {
            if (_context.PlayerInvites.Where(x => x.Id == inviteID).Any())
            {
                _context.PlayerInvites.Remove(_context.PlayerInvites.Where(x => x.Id == inviteID).SingleOrDefault());
                _context.SaveChanges();
                return true;
            }
            
            return false;
        }
        public bool removePlayerFromCampaign(int inviteID)
        {
            return false;
        }
        public bool isPlayerSlotAvailableToSendInvite(string userId, int campaignID)
        {
            int totalPlayerSlots = _context.UserSubscriptions.Where(x=>x.UserId== userId).SingleOrDefault().PlayerCount;
            int UsedPlayerSlots = _context.PlayerInvites.Where(x => x.PlayerCampaignID == campaignID).Count();
            if (totalPlayerSlots> UsedPlayerSlots)
            {
                return true;
            }
            return false;
        }
        public async Task<PlayerInvite> DeclineInvite(int inviteID) {
            PlayerInvite invite = _context.PlayerInvites.Where(x => x.Id == inviteID).FirstOrDefault();
            if (invite!=null)
            {
                invite.IsDeclined = true;
                await _context.SaveChangesAsync();
                return invite;
            }
            return new PlayerInvite();
        }
        public async Task<PlayerInvite> AcceptInvite(int inviteID, int characterID) {
            PlayerInvite invite = _context.PlayerInvites.Where(x => x.Id == inviteID).FirstOrDefault();
            if (invite != null)
            {
                invite.IsAccepted = true;
                invite.PlayerCharacterID = characterID;
                await _context.SaveChangesAsync();
                return invite;
            }
            return new PlayerInvite();
        }
        public async Task<PlayerInvite> AnswerLaterInvite(int inviteID) {
            PlayerInvite invite = _context.PlayerInvites.Where(x => x.Id == inviteID).FirstOrDefault();
            if (invite != null)
            {
                invite.IsAnswerLater = true;
                await _context.SaveChangesAsync();
                return invite;
            }
            return new PlayerInvite();
        }
        public async Task<bool> isInvitedPlayerCharacter(int characterId) {
            return await _context.PlayerInvites.Where(x => x.PlayerCharacterID == characterId).AnyAsync();
        }
    }
}
