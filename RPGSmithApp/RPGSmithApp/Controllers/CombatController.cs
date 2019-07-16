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
                Combat_ViewModel model =await _combatService.GetCombatDetails(CampaignId, GetUserDetails());
                return Ok(model);
            }
            catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("UpdateCombatSettings")]
        public async Task<IActionResult> UpdateCombatSettings([FromBody] CombatSetting model)
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
        [HttpPost("SaveCombatantList")]
        public async Task<IActionResult> SaveCombatantList([FromBody] List<Combatant_DTModel> model, int CampaignID)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    List<Combatant_ViewModel> list = _combatService.SaveCombatantList(model, CampaignID,GetUserId());
                    return Ok(list);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpGet("GetCombat_AddMonsterList")]
        public async Task<IActionResult> GetCombat_AddMonsterList(int CampaignId)
        {
            try
            {
                List<CombatAllTypeMonsters> model = _combatService.GetCombatAllTypeMonsters(CampaignId);
                return Ok(model);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetCombat_MonstersList")]
        public async Task<IActionResult> GetCombat_MonstersList(int CampaignId)
        {
            try
            {
                List<Monster> model = _combatService.GetCombat_MonstersList(CampaignId);
                return Ok(model);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("AddDeployedMonstersToCombat")]
        public async Task<IActionResult> AddDeployedMonstersToCombat([FromBody] List<CombatAllTypeMonsters> model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    _combatService.AddDeployedMonstersToCombat(model);
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        [HttpPost("RemoveMonsters")]
        public async Task<IActionResult> RemoveMonsters([FromBody] List<MonsterIds> monsterIds, bool deleteMonster)
        {
            try
            {
                _combatService.RemoveMonsters(monsterIds, deleteMonster);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("Combat_Start")]
        public async Task<IActionResult> Combat_Start(int CombatId,bool Start)
        {
            try
            {
                _combatService.Combat_Start(CombatId, Start);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("SaveCombatantTurn")]
        public async Task<IActionResult> SwitchCombatantTurn([FromBody] Combatant_ViewModel model, int roundCount)
        {
           
                try
                {
                    _combatService.SwitchCombatantTurn(model, roundCount);
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

            
        }
        [HttpPost("SaveVisibilityDetails")]
        public async Task<IActionResult> SaveVisibilityDetails([FromBody] Combatant_ViewModel model)
        {
            
                try
                {
                    _combatService.SaveVisibilityDetails(model);
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

            
        }
        [HttpPost("SaveMonsterHealth")]
        public async Task<IActionResult> SaveMonsterHealth([FromBody] Monster model)
        {
           
                try
                {
                    _combatService.SaveMonsterHealth(model);
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

            
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

