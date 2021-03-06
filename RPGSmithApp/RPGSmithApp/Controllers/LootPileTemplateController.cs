﻿using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core;
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
        private readonly ILootTemplateCurrencyService _lootTemplateCurrencyService;
        private readonly IItemMasterLootCurrencyService _itemMasterLootCurrencyService;
        private readonly IPageLastViewService _pageLastViewService;

        public LootPileTemplateController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager, IRuleSetService ruleSetService,
            ILootPileTemplateService lootPileTemplateService, ILootTemplateCurrencyService lootTemplateCurrencyService,
            IItemMasterLootCurrencyService itemMasterLootCurrencyService, IPageLastViewService pageLastViewService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._ruleSetService = ruleSetService;
            this._lootPileTemplateService = lootPileTemplateService;
            this._lootTemplateCurrencyService = lootTemplateCurrencyService;
            this._itemMasterLootCurrencyService = itemMasterLootCurrencyService;
            this._pageLastViewService = pageLastViewService;
        }

        [HttpGet("getById")]
        public async Task<IActionResult> getByRuleSetId_sp(int LootTemplateId)
        {
            var lootTemplate = await _lootPileTemplateService.GetLootTemplateVMById(LootTemplateId);
            try
            {
                //var lootTemplateModel = Mapper.Map<LootTemplateVM>(lootTemplate);
                if (lootTemplate != null)
                {
                    lootTemplate.LootTemplateCurrency = await this._lootTemplateCurrencyService.GetByLootTemplateId(lootTemplate.LootTemplateId);
                    lootTemplate.CurrencyType = await this._ruleSetService.GetCurrencyTypesWithDefault(lootTemplate.RuleSetId);
                }

                return Ok(lootTemplate);
            }
            catch (Exception ex)
            {
                return Ok(lootTemplate);
            }
        }

        [HttpPost("CreateLootTemplate")]
        public async Task<IActionResult> CreateLootTemplate([FromBody] Create_LootTemplate_ViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (_lootPileTemplateService.CheckDuplicateLootTemplate(model.Name.Trim(), model.RuleSetId).Result)
                        return BadRequest("The Random Loot Name " + model.Name + " had already been used. Please select another name.");

                    var lootTemplate = Mapper.Map<LootTemplate>(model);
                    var result = await _lootPileTemplateService.Create(lootTemplate);

                    if (model.LootTemplateRandomizationEngines != null)
                    {
                        if (model.LootTemplateRandomizationEngines.Count > 0)
                            _lootPileTemplateService.insertRandomizationEngines(model.LootTemplateRandomizationEngines.ToList(), result.LootTemplateId);
                    }

                    if (model.RandomizationSearchInfo != null)
                    {
                        if (model.RandomizationSearchInfo.Count > 0)
                            await _lootPileTemplateService.AddUpdateRandomizationSearchInfo(model.RandomizationSearchInfo.ToList(), result.LootTemplateId);
                    }

                    try
                    {
                        if (model.LootTemplateCurrency != null)
                        {
                            foreach (var currency in model.LootTemplateCurrency)
                            {
                                currency.LootTemplateId = result.LootTemplateId;
                                await this._lootTemplateCurrencyService.Create(currency);
                            }
                        }
                    }
                    catch { }

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
                        return BadRequest("The Random Loot Name " + model.Name + " had already been used. Please select another name.");

                    var lootTemplateobj = _lootPileTemplateService.GetById(model.LootTemplateId);
                    var becIds = new List<int>();

                    if (lootTemplateobj == null)
                        return Ok("Random Loot not found");

                    var lootTemplate = Mapper.Map<LootTemplate>(model);

                    LootTemplate result = await _lootPileTemplateService.Update(lootTemplate, model.LootTemplateRandomizationEngines);

                    if (model.RandomizationSearchInfo != null && model.Mode == MODE.SearchMode)
                    {
                        if (model.RandomizationSearchInfo.Count > 0)
                            await _lootPileTemplateService.AddUpdateRandomizationSearchInfo(model.RandomizationSearchInfo.ToList(), result.LootTemplateId);
                    }                    

                    try
                    {
                        if (model.LootTemplateCurrency != null)
                        {
                            foreach (var currency in model.LootTemplateCurrency)
                            {
                                currency.LootTemplateId = result.LootTemplateId;
                                if (currency.LootTemplateCurrencyId == 0)
                                    await this._lootTemplateCurrencyService.Create(currency);
                                else
                                    await this._lootTemplateCurrencyService.Update(currency);
                            }
                        }
                    }
                    catch { }

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
                        return BadRequest("The Random Loot Name " + model.Name + " had already been used. Please select another name.");

                    var monsterTemplate = _lootPileTemplateService.GetById(model.LootTemplateId);

                    model.LootTemplateId = 0;
                    var lootTemplateModel = Mapper.Map<LootTemplate>(model);
                    var result = await _lootPileTemplateService.Create(lootTemplateModel);

                    if (model.LootTemplateRandomizationEngines != null && model.LootTemplateRandomizationEngines.Count > 0)
                    {
                        _lootPileTemplateService.insertRandomizationEngines(model.LootTemplateRandomizationEngines.ToList(), result.LootTemplateId);
                    }

                    if (model.RandomizationSearchInfo != null)
                    {
                        if (model.RandomizationSearchInfo.Count > 0)
                            await _lootPileTemplateService.AddUpdateRandomizationSearchInfo(model.RandomizationSearchInfo.ToList(), result.LootTemplateId);
                    }

                    try
                    {
                        if (model.LootTemplateCurrency != null)
                        {
                            foreach (var currency in model.LootTemplateCurrency)
                            {
                                currency.LootTemplateId = result.LootTemplateId;
                                await this._lootTemplateCurrencyService.Create(currency);
                            }
                        }
                    }
                    catch { }

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
            try
            {
                string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
                ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
                return appUser.Id;
            }
            catch (Exception ex)
            {
                var user = _httpContextAccessor.HttpContext.User.Claims.Select(x => x.Value).FirstOrDefault();
                return user;
            }
        }

        [HttpPost("delete_up")]
        public async Task<IActionResult> Delete(int LootTemplateId)
        {
            try
            {
                try
                {
                    await this._lootTemplateCurrencyService.DeleteByLootTemplate(LootTemplateId);
                }
                catch { }

                await _lootPileTemplateService.Delete(LootTemplateId);
                return Ok();
            }
            catch (Exception ex)
            {
                if (ex.InnerException.Message.Contains("The DELETE statement conflicted with the REFERENCE constraint"))
                    return BadRequest("Monster Template cannot be deleted.");
                else
                    return BadRequest(ex.Message);
            }
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
            Response.CurrencyTypes = await _ruleSetService.GetCurrencyTypesWithDefault(rulesetId);
            Response.ViewType = _pageLastViewService.GetByUserIdPageName(this.GetUserId(), "ItemMaster");

            return Ok(Response);
        }

        [HttpPost("DeleteLootTemplates")]
        public async Task<IActionResult> DeleteMultiLootTemplates([FromBody] List<LootTemplate> model, int rulesetId)
        {
            try
            {
                try
                {
                    foreach(var lootTemplate in model)
                    {
                        await this._lootTemplateCurrencyService.DeleteByLootTemplate(lootTemplate.LootTemplateId);
                    }
                }
                catch { }

                _lootPileTemplateService.DeleteMultiLootTemplates(model, rulesetId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        #endregion
    }
}
