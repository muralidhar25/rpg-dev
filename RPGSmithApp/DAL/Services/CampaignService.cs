using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
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
        public async Task<PlayerInvite> CreatePlayerInvite(PlayerInviteEmail model, string PlayerUserId)
        {
            PlayerInvite invite = new PlayerInvite();
            invite.IsAccepted = false;
            invite.PlayerCampaignID = model.CampaignId;
            invite.PlayerCharacterID = null;
            invite.PlayerUserID = PlayerUserId;
            invite.SendByUserID = model.SendByUserId;
            invite.PlayerEmail = model.UserName;
            await _context.PlayerInvites.AddAsync(invite);
            await _context.SaveChangesAsync();
            return invite;
        }
        public async Task<bool> SameInviteAlreadyExists(PlayerInviteEmail model, string playerUserId) {
            return _context.PlayerInvites.Where(x =>
             x.PlayerCampaignID == model.CampaignId
             && x.SendByUserID == model.SendByUserId
             && x.PlayerUserID == playerUserId
             && x.PlayerEmail == model.UserName
             ).Any();
        }
    }
}
