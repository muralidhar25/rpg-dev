using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Models.RulesetTileModels;
using DAL.Models.SPModels;
using DAL.Services;
using DAL.Services.CharacterTileServices;
using DAL.Services.RulesetTileServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using Enum = RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{

    // [Authorize]
    [Route("api/[controller]")]
    public class CombatController : Controller
    {
        private int TotalCharacterSlotsAvailable = 3;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ICombatService _combatService;
       
        public CombatController(IHttpContextAccessor httpContextAccessor,
            IAccountManager accountManager, ICombatService combatService)
        {            
            _httpContextAccessor = httpContextAccessor;
            _accountManager = accountManager;
            _combatService = combatService;
        }

        [HttpGet("GetCombatDetails")]
        public async Task<IActionResult> GetCombatDetails(int CampaignId)
        {
            try {
                Combat_ViewModel model =await _combatService.GetCombatDetails(CampaignId, GetUserId());
                return Ok(model);
            }
            catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("UpdateCombatSettings")]
        public async Task<IActionResult> CreateCharacter([FromBody] CombatSetting model)
        {
            if (ModelState.IsValid)
            {
                try {
                    return Ok(_combatService.UpdateSettings(model));
                }
                catch (Exception ex) {
                    return BadRequest(ex.Message);
                }
                
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }

        private ApplicationUser GetUserDetails()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser;
        }
    }
}

