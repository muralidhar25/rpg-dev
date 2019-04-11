using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;
using Stripe;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class CampaignController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ICampaignService _campaign;

        public CampaignController(IHttpContextAccessor httpContextAccessor, IPageLastViewService pageLastViewService
            , IAccountManager accountManager, ICampaignService campaign)
        {
            this._httpContextAccessor = httpContextAccessor;            
            this._accountManager = accountManager;
            this._campaign = campaign;
        }
        [HttpPost("SendPlayerInvite")]
        public async Task<IActionResult> SendPlayerInvite([FromBody] PlayerInviteEmail model)
        {
            try
            {
                string emailId = model.UserName;
                string PlayerUserId = null;                
                if (!IsValidEmail(model.UserName))
                {
                    ApplicationUser user = await _accountManager.GetUserByUserNameAsync(model.UserName);
                    emailId = user.Email;
                    PlayerUserId = user.Id;
                }
                else
                {
                    ApplicationUser user = await _accountManager.GetUserByEmailAsync(model.UserName);
                    if (user != null)
                    {
                        emailId = user.Email;
                        PlayerUserId = user.Id;
                    }                    
                }
                model.UserName = emailId;
                //send Email
                //SendInviteEmail(GMAccountUserName, CampaignName,CampaignImage)
                
                //test this check thi method
                PlayerInvite invite=  await _campaign.CreatePlayerInvite(model, PlayerUserId, emailId);

                return Ok(invite);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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