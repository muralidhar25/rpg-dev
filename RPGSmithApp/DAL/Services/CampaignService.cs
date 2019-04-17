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
        private readonly ICharacterService _characterService;
        public CampaignService(ApplicationDbContext context, IConfiguration configuration, ICharacterService characterService)
        {
            _context = context;
            this._configuration = configuration;
            this._characterService = characterService;
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

        public List<PlayerInviteList> getInvitedPlayers(int rulesetId, ApplicationUser user)
        {
            //var res= _context.PlayerInvites.Where(x => x.PlayerCampaignID == rulesetId).Include(x=>x.PlayerCharacter).Include(x => x.PlayerUser).Select(
            //    x=>new PlayerInviteList() {
            //        InviteId=x.Id,
            //        isAccepted=x.IsAccepted,
            //        isAnswerLater=x.IsAnswerLater,
            //        isDeclined=x.IsDeclined,
            //        isSendToUserName=x.IsSendToUserName,
            //        playerCharacterImage=x.PlayerCharacter!=null? x.PlayerCharacter.ImageUrl :"",
            //        playerCharacterName= x.PlayerCharacter != null ? x.PlayerCharacter.CharacterName : "",
            //        PlayerCharacterId = x.PlayerCharacter != null ? x.PlayerCharacter.CharacterId : 0,
            //        playerUserImage= x.PlayerUser != null ? x.PlayerUser.ProfileImage : "",
            //        playerUserName= x.PlayerUser != null ? x.PlayerUser.UserName : "",
            //        playerUserEmail=x.PlayerEmail,
            //        sendOn =x.SendOn,
            //    }
            //    ).ToList();
           // var re222s = _context.PlayerInvites.Where(x => x.PlayerCampaignID == rulesetId).Include(x => x.PlayerCharacter).Include(x => x.PlayerUser).ToList();

          var  res = _context.PlayerInvites.Where(x => x.PlayerCampaignID == rulesetId).Include(x => x.PlayerCharacter).Include(x => x.PlayerUser).Select(
                x => new PlayerInviteList()
                {
                    InviteId = x.Id,
                    isAccepted = x.IsAccepted,
                    isAnswerLater = x.IsAnswerLater,
                    isDeclined = x.IsDeclined,
                    isSendToUserName = x.IsSendToUserName,
                    playerCharacterImage = x.PlayerCharacter != null ? x.PlayerCharacter.ImageUrl : "",
                    playerCharacterName = x.PlayerCharacter != null ? x.PlayerCharacter.CharacterName : "",
                    PlayerCharacterId = x.PlayerCharacter != null ? x.PlayerCharacter.CharacterId : 0,
                    playerUserImage = x.PlayerUser != null ? x.PlayerUser.ProfileImage : "",
                    playerUserName = x.PlayerUser != null ? x.PlayerUser.UserName : "",
                    playerUserEmail = x.PlayerEmail,
                    sendOn = x.SendOn,
                }
                ).ToList();
            List < Character> ownCharacters = _context.Characters.Where(x => x.RuleSetId == rulesetId && x.UserId==user.Id && x.IsDeleted != true).ToList();
            foreach (var item in ownCharacters)
            {
                res.Add(new PlayerInviteList() {
                    isAccepted=true,
                    PlayerCharacterId=item.CharacterId,
                    playerCharacterImage = item.ImageUrl,
                    playerCharacterName= item.CharacterName,
                    playerUserImage= user.ProfileImage,
                    playerUserName=user.UserName,
                });
            }
            return res;
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
            var res=await _context.PlayerInvites.Where(x => x.PlayerUserID == userid && x.IsDeclined==false && x.IsAccepted==false).Include(x => x.PlayerCampaign).Include(x=>x.SendByUser)
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
        public bool removePlayerFromCampaign(PlayerInviteList model)
        {
            cancelInvite(model.InviteId);
            _characterService.DeleteCharacter(model.PlayerCharacterId);
            return true;
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

                //add player Controls
                PlayerControl control = new PlayerControl()
                {
                    PlayerCharacterID = characterID,
                    CampaignID = invite.PlayerCampaignID,
                    PauseAbilityAdd = false,
                    PauseAbilityCreate = false,
                    PauseGame = false,
                    PauseItemAdd = false,
                    PauseItemCreate = false,
                    PauseSpellAdd = false,
                    PauseSpellCreate = false,
                };

                if (_context.PlayerControls.Where(x=>x.CampaignID== invite.PlayerCampaignID).Any())
                {
                    PlayerControl OldControl = _context.PlayerControls.Where(x => x.CampaignID == invite.PlayerCampaignID).FirstOrDefault();
                    control = new PlayerControl()
                    {
                        PlayerCharacterID = characterID,
                        CampaignID = invite.PlayerCampaignID,
                        PauseAbilityAdd = OldControl.PauseAbilityAdd,
                        PauseAbilityCreate = OldControl.PauseAbilityCreate,
                        PauseGame = OldControl.PauseGame,
                        PauseItemAdd = OldControl.PauseItemAdd,
                        PauseItemCreate = OldControl.PauseItemCreate,
                        PauseSpellAdd = OldControl.PauseSpellAdd,
                        PauseSpellCreate = OldControl.PauseSpellCreate,
                    };
                }
                await _context.PlayerControls.AddAsync(control);
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
        public async Task<PlayerControl> getPlayerControlsByCampaignId(int campaignID) {
            var res = await _context.PlayerControls.Where(x => x.CampaignID == campaignID).FirstOrDefaultAsync();
            if (res!=null)
            {
                res.PlayerCharacterID = 0;
            }
            return res;
        }
        public async Task<PlayerControl> getPlayerControlsByCharacterId(int characterID) {
            return await _context.PlayerControls.Where(x => x.PlayerCharacterID == characterID).FirstOrDefaultAsync();
        }
        public async Task<PlayerControl> updatePlayerControls(PlayerControl model) {
            List<PlayerControl> list =await _context.PlayerControls.Where(x => x.CampaignID == model.CampaignID).ToListAsync();
            foreach (var playerControl in list)
            {
                playerControl.PauseAbilityAdd = model.PauseAbilityAdd;
                playerControl.PauseAbilityCreate = model.PauseAbilityCreate;
                playerControl.PauseGame = model.PauseGame;
                playerControl.PauseItemAdd = model.PauseItemAdd;
                playerControl.PauseItemCreate = model.PauseItemCreate;
                playerControl.PauseSpellAdd = model.PauseSpellAdd;
                playerControl.PauseSpellCreate = model.PauseSpellCreate;
            }
            await _context.SaveChangesAsync();
            return await _context.PlayerControls.Where(x => x.CampaignID == model.CampaignID).FirstOrDefaultAsync();
        }
    }
}
