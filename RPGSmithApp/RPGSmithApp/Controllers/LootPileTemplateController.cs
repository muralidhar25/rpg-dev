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
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
    }
}
