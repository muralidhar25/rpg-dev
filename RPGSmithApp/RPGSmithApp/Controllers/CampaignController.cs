using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;
using Stripe;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class CampaignController : Controller
    {
        const string UserDoesNotExists= "No RPGSmith User could be found matching that name. Please supply a different RPGSmith user name or provide an email address.";
        const string InviteAlreadySend = "Invite already sent.";
        const string NoPlayerSlotAvailable = "Please buy more player slots to send invites";
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ICampaignService _campaign;
        private readonly ILogger _logger;
        private readonly IEmailer _emailer;
        public CampaignController(IHttpContextAccessor httpContextAccessor, IPageLastViewService pageLastViewService, ILogger<CampaignController> logger
            , IEmailer emailer, IAccountManager accountManager, ICampaignService campaign)
        {
            this._httpContextAccessor = httpContextAccessor;            
            this._accountManager = accountManager;
            this._campaign = campaign;
            _logger = logger;
            _emailer = emailer;
        }

        [HttpGet("getInvitedPlayers")]
        public async Task<IActionResult> getCountByRuleSetId(int rulesetId)
        {
            return Ok(_campaign.getInvitedPlayers(rulesetId,GetUser()));
        }
        [HttpGet("getReceivedInvites")]
        public async Task<IActionResult> getReceivedInvites(string userid)
        {
            return Ok(await _campaign.getReceivedInvites(userid));
        }
        [HttpGet("getPlayerControlsByCampaignId")]
        public async Task<IActionResult> getPlayerControlsByCampaignId(int campaignID)
        {
            return Ok(await _campaign.getPlayerControlsByCampaignId(campaignID));
        }
        [HttpGet("getPlayerControlsByCharacterId")]
        public async Task<IActionResult> getPlayerControlsByCharacterId(int characterID)
        {
            if (_campaign.IsDeletedInvite(characterID, GetUserId()))
                return (Ok(new { IsDeletedInvite = true, name= _campaign.GetDeletedCharacterName(characterID) }));

            return Ok(await _campaign.getPlayerControlsByCharacterId(characterID, GetUser()));
        }
        [HttpPost("updatePlayerControls")]
        public async Task<IActionResult> updatePlayerControls([FromBody] PlayerControl model)
        {
            return Ok(await _campaign.updatePlayerControls(model));
        }

        [HttpPost("cancelInvite")]
        public async Task<IActionResult> cancelInvite(int inviteID) {
            return Ok(_campaign.cancelInvite(inviteID));
        }

        [HttpPost("DeclineInvite")]
        public async Task<IActionResult> DeclineInvite(int inviteID)
        {
            return Ok(await _campaign.DeclineInvite(inviteID));
        }
        //[HttpPost("AcceptInvite")]
        //public async Task<IActionResult> AcceptInvite(int inviteID)
        //{
        //    return Ok(await _campaign.AcceptInvite(inviteID));
        //}
        [HttpPost("AnswerLaterInvite")]
        public async Task<IActionResult> AnswerLaterInvite(int inviteID)
        {
            return Ok(await _campaign.AnswerLaterInvite(inviteID));
        }

        [HttpPost("removePlayerFromCampaign")]
        public async Task<IActionResult> removePlayerFromCampaign([FromBody] PlayerInviteList model)
        {
            return Ok(_campaign.removePlayerFromCampaign(model));
        }

        [HttpPost("SendPlayerInvite")]
        public async Task<IActionResult> SendPlayerInvite([FromBody] PlayerInviteEmail model)
        {
            try
            {
                if (!isPlayerSlotAvailableToSendInvite(model.CampaignId))
                {
                    return BadRequest(NoPlayerSlotAvailable);
                }
                bool IsInviteSentUsingUserName = false;
                string emailId = model.UserName;
                string PlayerUserId = null;                
                string PlayerName = null;                
                if (!IsValidEmail(model.UserName))
                {
                    ApplicationUser user = await _accountManager.GetUserByUserNameAsync(model.UserName);
                    if (user != null)
                    {                        
                        emailId = user.Email;
                        PlayerUserId = user.Id;
                        PlayerName = user.FullName;
                        IsInviteSentUsingUserName = true;
                    }
                    else {
                        return BadRequest(UserDoesNotExists);
                    }
                }
                else
                {
                    ApplicationUser user = await _accountManager.GetUserByEmailAsync(model.UserName);
                    if (user != null)
                    {
                        emailId = user.Email;
                        PlayerUserId = user.Id;
                        PlayerName = user.FullName;
                    }                    
                }
                model.UserName = emailId;
                ////////////////////send Email
                
                if (string.IsNullOrEmpty(PlayerName))
                {
                    PlayerName = model.UserName;
                }
                if (await _campaign.SameInviteAlreadyExists(model, PlayerUserId))
                {
                    return BadRequest(InviteAlreadySend);
                }

                await  SendInviteEmail(model.SendByUserName, model.SendByCampaignName, model.SendByCampaignImage, PlayerName, model.UserName);
                
                PlayerInvite invite=  await _campaign.CreatePlayerInvite(model, PlayerUserId, IsInviteSentUsingUserName);
                //invite = _campaign.getInvitedPlayerById(invite.Id);
                //PlayerInviteList obj = _campaign.getInvitedPlayerById(invite.Id);
                return Ok(_campaign.getInvitedPlayerById(invite.Id));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private bool isPlayerSlotAvailableToSendInvite(int campaignID)
        {
            return _campaign.isPlayerSlotAvailableToSendInvite(GetUserId(), campaignID);
        }

        private async Task<bool> SendInviteEmail(string gMAccountUserName, string campaignName, string campaignImage,string receiverName, string receiverEmail)
        {            
            var mailTemplatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/mail-templates/playerInviteEmail.html");
            var EmailContent = System.IO.File.ReadAllText(mailTemplatePath);
            EmailContent = EmailContent.Replace("[#GM_AccountName#]", gMAccountUserName);
            EmailContent = EmailContent.Replace("[#Camapign_Name#]", campaignName);
            EmailContent = EmailContent.Replace("[#Camapign_Image#]", campaignImage);
            EmailContent = EmailContent.Replace("[#currentYear#]", DateTime.Now.Year.ToString());
            
            string emailSubject = "RPG Smith Invitation to join Campaign.";
            
            (bool successMail, string errorMail) = await _emailer.SendEmailAsync(receiverName, receiverEmail, emailSubject, EmailContent, isHtml: true);

            if (!successMail)
                _logger.LogWarning("Confirmation mail has not been send for " + receiverEmail + ". " + errorMail);

            return successMail;
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }

        private ApplicationUser GetUser()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            return _accountManager.GetUserByUserNameAsync(userName).Result;
        }
    }
}