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
        const string UserDoesNotExists= "Username does not exists.";
        const string InviteAlreadySend = "Invite already sent.";
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
        [HttpPost("SendPlayerInvite")]
        public async Task<IActionResult> SendPlayerInvite([FromBody] PlayerInviteEmail model)
        {
            try
            {                
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
                
                PlayerInvite invite=  await _campaign.CreatePlayerInvite(model, PlayerUserId);
                
                return Ok(invite );
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<bool> SendInviteEmail(string gMAccountUserName, string campaignName, string campaignImage,string receiverName, string receiverEmail)
        {
            var mailTemplatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/mail-templates/playerInviteEmail.html");
            var EmailContent = System.IO.File.ReadAllText(mailTemplatePath);
            EmailContent = EmailContent.Replace("[#GM_AccountName#]", gMAccountUserName);
            EmailContent = EmailContent.Replace("[#Camapign_Name#]", campaignName);
            EmailContent = EmailContent.Replace("[#Camapign_Image#]", campaignImage);
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