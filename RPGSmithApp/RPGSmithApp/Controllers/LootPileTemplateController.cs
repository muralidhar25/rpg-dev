using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Models.ViewModel;
using DAL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.Helpers.CoreRuleset;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.CreateModels;
using RPGSmithApp.ViewModels.EditModels;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class LootPileTemplateController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IRuleSetService _ruleSetService;
        private readonly ILootPileTemplateService _lootPileTemplateService;

        public LootPileTemplateController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager, IRuleSetService ruleSetService,
            ILootPileTemplateService lootPileTemplateService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._ruleSetService = ruleSetService;
            this._lootPileTemplateService = lootPileTemplateService;
        }

        [HttpPost("CreateLootTemplate")]
        public async Task<IActionResult> CreateLootTemplate([FromBody] Create_LootTemplate_ViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (_lootPileTemplateService.CheckDuplicateLootTemplate(model.Name.Trim(), model.RuleSetId).Result)
                        return BadRequest("The Loot Template Name " + model.Name + " had already been used. Please select another name.");

                    var lootTemplate = Mapper.Map<LootTemplate>(model);
                    var result = await _lootPileTemplateService.Create(lootTemplate);

                    if (model.LootTemplateRandomizationEngines != null && model.LootTemplateRandomizationEngines.Count > 0)
                    {
                        _lootPileTemplateService.insertRandomizationEngines(model.LootTemplateRandomizationEngines.ToList(), result.LootTemplateId);
                    }

                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }




        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] Create_LootTemplate_ViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (_lootPileTemplateService.CheckDuplicateLootTemplate(model.Name.Trim(), model.RuleSetId, model.LootTemplateId).Result)
                        return BadRequest("The Loot Template Name " + model.Name + " had already been used. Please select another name.");

                    var lootTemplateobj = _lootPileTemplateService.GetById(model.LootTemplateId);
                    var becIds = new List<int>();

                    if (lootTemplateobj == null)
                        return Ok("Loot Template not found");

                    var lootTemplate = Mapper.Map<LootTemplate>(model);

                    LootTemplate result = await _lootPileTemplateService.Update(lootTemplate, model.LootTemplateRandomizationEngines);

                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("duplicate")]
        public async Task<IActionResult> Duplicate([FromBody] Create_LootTemplate_ViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (_lootPileTemplateService.CheckDuplicateLootTemplate(model.Name.Trim(), model.RuleSetId).Result)
                        return BadRequest("The Loot Template Name " + model.Name + " had already been used. Please select another name.");

                    var monsterTemplate = _lootPileTemplateService.GetById(model.LootTemplateId);

                    model.LootTemplateId = 0;
                    var lootTemplateModel = Mapper.Map<LootTemplate>(model);
                    var result = await _lootPileTemplateService.Create(lootTemplateModel);

                    if (model.LootTemplateRandomizationEngines != null && model.LootTemplateRandomizationEngines.Count > 0)
                    {
                        _lootPileTemplateService.insertRandomizationEngines(model.LootTemplateRandomizationEngines.ToList(), result.LootTemplateId);
                    }

                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }



        //get user id methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
            //return "ec34768b-c2ff-43b2-9bf3-d0946d416482";
        }
        #region API Using SP
        [HttpGet("getByRuleSetId_sp")]
        public async Task<IActionResult> getByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30)
        {
            dynamic Response = new ExpandoObject();
            var lootTemplatesList = _lootPileTemplateService.SP_GetLootTemplateByRuleSetId(rulesetId, page, pageSize);
            Response.lootTemplates = lootTemplatesList; // Utilities.CleanModel<Ability>(abilityList);
            if (lootTemplatesList.Any())
            {
                Response.RuleSet = lootTemplatesList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            return Ok(Response);
        }
        #endregion
    }
}
