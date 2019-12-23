using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.SPModels;
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
    public class MonsterTemplateController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IMonsterTemplateService _monsterTemplateService;
        private readonly ICharacterAbilityService _characterAbilityService;
        private readonly IMonsterTemplateCommandService _monsterTemplateCommandService;
        private readonly IRuleSetService _ruleSetService;
        private readonly ICoreRuleset _coreRulesetService;
        private readonly ICharacterService _CharacterService;
        private readonly IMonsterCurrencyService _monsterCurrencyService;
        private readonly IMonsterTemplateCurrencyService _monsterTemplateCurrencyService;

        public MonsterTemplateController(IHttpContextAccessor httpContextAccessor, IMonsterTemplateService monsterTemplateService,
            IMonsterTemplateCommandService monsterTemplateCommandService, ICharacterAbilityService characterAbilityService,
            IRuleSetService ruleSetService, ICoreRuleset coreRulesetService, ICharacterService CharacterService,
            IMonsterCurrencyService monsterCurrencyService,
            IMonsterTemplateCurrencyService monsterTemplateCurrencyService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._monsterTemplateService = monsterTemplateService;
            this._characterAbilityService = characterAbilityService;
            this._monsterTemplateCommandService = monsterTemplateCommandService;
            this._ruleSetService = ruleSetService;
            this._coreRulesetService = coreRulesetService;
            this._CharacterService = CharacterService;
            this._monsterCurrencyService = monsterCurrencyService;
            this._monsterTemplateCurrencyService = monsterTemplateCurrencyService;
        }


        [HttpGet("GetById")]
        public MonsterTemplateViewModel GetById(int id)
        {
            var monsterTemplate = _monsterTemplateService.GetById(id);
            if (monsterTemplate == null) return null;

            var _monsterTemplate = Mapper.Map<MonsterTemplateViewModel>(monsterTemplate);

            if (_monsterTemplate != null)
                _monsterTemplate.MonsterTemplateCurrency = this._monsterTemplateCurrencyService.GetByMonsterTemplateId(monsterTemplate.MonsterTemplateId).Result;

            return _monsterTemplate;
        }

        [HttpGet("GetMonsterById")]
        public async Task<IActionResult> GetMonsterById(int id)
        {
            var monster = _monsterTemplateService.GetMonsterById(id, true);

            try
            {
                if (monster == null) return null;

                var _monster = Mapper.Map<MonsterViewModel>(monster);
                if (_monster != null)
                    _monster.MonsterCurrency = this._monsterCurrencyService.GetByMonsterId(monster.MonsterId).Result;

                return Ok(_monster);
            }
            catch (Exception ex)
            {
                return Ok(monster);
            }
        }

        [HttpGet("GetMonsterItemsToDrop")]
        public async Task<IActionResult> GetMonsterItemsToDrop(int monsterId)
        {
            List<ItemMasterForMonsterTemplate> MonsterItemsToDrop = _monsterTemplateService.getMonsterItemsToDrop(monsterId);
            return Ok(MonsterItemsToDrop);
        }
        [HttpPost("addRemoveMonsterRecords")]
        public async Task<IActionResult> addRemoveMonsterRecords([FromBody] List<AddRemoveRecords> model,int monsterId, string type)
        {
            _monsterTemplateService.addRemoveMonsterRecords(model,monsterId, type);
            return Ok();
        }
        

        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] CreateMonsterTemplateModel model, bool isCreatingFromMonsterScreen,
            int armorClass, int health, int challangeRating, int xpValue
            )
        {
            if (ModelState.IsValid)
            {
                if (_monsterTemplateService.CheckDuplicateMonsterTemplate(model.Name.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Monster Template Name " + model.Name + " had already been used. Please select another name.");

                var monsterTemplate = Mapper.Map<MonsterTemplate>(model);
                var result = await _monsterTemplateService.Create(monsterTemplate);

                if (model.MonsterTemplateCommandVM != null && model.MonsterTemplateCommandVM.Count > 0)
                {
                    foreach (var acViewModels in model.MonsterTemplateCommandVM)
                    {
                        await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                        {
                            Command = acViewModels.Command,
                            Name = acViewModels.Name,
                            MonsterTemplateId = result.MonsterTemplateId
                        });
                    }
                }
                if (model.MonsterTemplateAbilityVM != null && model.MonsterTemplateAbilityVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateAbilityVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateAbilities(model.MonsterTemplateAbilityVM);
                }
                if (model.MonsterTemplateSpellVM != null && model.MonsterTemplateSpellVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateSpellVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateSpells(model.MonsterTemplateSpellVM);
                    //foreach (var acViewModels in model.MonsterTemplateCommandVM)
                    //{
                    //    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    //    {
                    //        Command = acViewModels.Command,
                    //        Name = acViewModels.Name,
                    //        MonsterTemplateId = result.MonsterTemplateId
                    //    });
                    //}
                }
                if (model.MonsterTemplateBuffAndEffectVM != null && model.MonsterTemplateBuffAndEffectVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateBuffAndEffectVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateBuffAndEffects(model.MonsterTemplateBuffAndEffectVM);
                    //foreach (var acViewModels in model.MonsterTemplateBuffAndEffectVM)
                    //{
                    //    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    //    {
                    //        Command = acViewModels.Command,
                    //        Name = acViewModels.Name,
                    //        MonsterTemplateId = result.MonsterTemplateId
                    //    });
                    //}
                }
                if (model.MonsterTemplateAssociateMonsterTemplateVM != null && model.MonsterTemplateAssociateMonsterTemplateVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateAssociateMonsterTemplateVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateMonsterTemplates(model.MonsterTemplateAssociateMonsterTemplateVM);
                    //foreach (var acViewModels in model.MonsterTemplateCommandVM)
                    //{
                    //    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    //    {
                    //        Command = acViewModels.Command,
                    //        Name = acViewModels.Name,
                    //        MonsterTemplateId = result.MonsterTemplateId
                    //    });
                    //}
                }
                if (model.IsRandomizationEngine)
                {
                    if (model.RandomizationEngine != null && model.RandomizationEngine.Count > 0)
                    {
                        _monsterTemplateService.insertRandomizationEngines(model.RandomizationEngine, result.MonsterTemplateId);
                    }
                }
                else
                {
                    if (model.MonsterTemplateItemMasterVM != null && model.MonsterTemplateItemMasterVM.Count > 0)
                    {
                        foreach (var item in model.MonsterTemplateItemMasterVM)
                        {
                            item.MonsterTemplateId = result.MonsterTemplateId;
                        }
                        _monsterTemplateService.insertAssociateItemMasters(model.MonsterTemplateItemMasterVM);

                    }
                }

                if (model.MonsterTemplateCurrency != null)
                {
                    foreach (var currency in model.MonsterTemplateCurrency)
                    {
                        currency.MonsterTemplateId = result.MonsterTemplateId;
                        await this._monsterTemplateCurrencyService.Create(currency);
                    }
                }

                if (isCreatingFromMonsterScreen)
                {
                    List<int> armorClassList = new List<int>();
                    armorClassList.Add(armorClass);

                    List<int> challangeRatingList = new List<int>();
                    challangeRatingList.Add(challangeRating);

                    List<int> healthList = new List<int>();
                    healthList.Add(health);

                    List<int> xpValueList = new List<int>();
                    xpValueList.Add(xpValue);

                    DeployMonsterTemplate deploy = new DeployMonsterTemplate()
                    {
                        addToCombat = true,
                        armorClass = armorClassList,
                        challangeRating = challangeRatingList,
                        healthCurrent = healthList,
                        healthMax = healthList,
                        monsterTemplateId = result.MonsterTemplateId,
                        rulesetId = result.RuleSetId,
                        qty = 1,
                        xpValue = xpValueList,
                        REItems = model.REItems
                    };
                    var MonsterIds = _monsterTemplateService.deployMonster(deploy);
                    await this.UpdateCurrencyDeployedMonsters(model.MonsterTemplateCurrency, MonsterIds);
                }
                return Ok(result);
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async Task<bool> UpdateCurrencyDeployedMonsters(List<MonsterTemplateCurrency> MonsterTemplateCurrency, List<int> MonsterIds, int monsterTemplateId= 0)
        {
            bool success = false;
            try
            {
                foreach (var monsterId in MonsterIds)
                {
                    if (MonsterTemplateCurrency == null)
                        MonsterTemplateCurrency = await this._monsterTemplateCurrencyService.GetByMonsterTemplateId(monsterTemplateId);

                    foreach (var currency in MonsterTemplateCurrency)
                    {
                        await this._monsterCurrencyService.Create(new MonsterCurrency
                        {
                            Name = currency.Name,
                            Amount = currency.Amount,
                            Command = currency.Command,
                            BaseUnit = currency.BaseUnit,
                            WeightValue = currency.WeightValue,
                            SortOrder = currency.SortOrder,
                            CurrencyTypeId = currency.CurrencyTypeId,
                            MonsterId = monsterId,
                        });
                        success = true;
                    }
                }
            }
            catch { success = false; }
            return success;
        }

        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] EditMonsterTemplateModel model)
        {
            if (ModelState.IsValid)
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {

                    return await Core_UpdateMonsterTemplate(model);
                }
                else
                {
                    return await UpdateMonsterTemplateCommon(model);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("dropMonsterItems")]
        public async Task<IActionResult> dropMonsterItems([FromBody] List<ItemMasterForMonsterTemplate> list, int monsterId)
        {

            int itemCountAfterDelete = await _monsterTemplateService.DropItemsToLoot(list, monsterId);
            return Ok(itemCountAfterDelete);
        }

        [HttpPost("DropMonsterItemsWithCurrency")]
        public async Task<IActionResult> ItemMasterForMonsterDropItems([FromBody] ItemMasterForMonsterDropItems list, int monsterId)
        {            
            int itemCountAfterDelete = await _monsterTemplateService.DropItemsToLoot(list.SelectedItemsList, monsterId, list.MonsterCurrency);
            return Ok(itemCountAfterDelete);
        }
        

        [HttpPost("updateMonster")]
        public async Task<IActionResult> updateMonster([FromBody] EditMonsterModel model)
        {
            if (ModelState.IsValid)
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    return await Core_UpdateMonster(model);
                }
                else
                {
                    return await Update_Monster_Common(model);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        private async Task<IActionResult> Core_UpdateMonster(EditMonsterModel model)
        {
            try
            {
                await CheckCoreRuleset(model);
                return await Update_Monster_Common(model);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        private async Task<int> CheckCoreRuleset(EditMonsterModel model)
        {
            //int MonsterTemplateId = model.MonsterTemplateId == null ? 0 : (int)model.MonsterTemplateId;
            //if (!_coreRulesetService.IsMonsterTemplateCopiedFromCoreRuleset(MonsterTemplateId, (int)model.RuleSetId))
            //{
            //    int OldParentMonsterTemplateId = MonsterTemplateId;
            //    int MonsterTemplateIdInserted =CreateMonsterForCopiedRuleset(model).Result.MonsterTemplateId;
            //    model.MonsterTemplateId = MonsterTemplateIdInserted;
            //    model.ParentMonsterTemplateId = MonsterTemplateIdInserted;
            //    return await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.RuleSetId, OldParentMonsterTemplateId, MonsterTemplateIdInserted, 'M');
            //}
            //return 0;
            int MonsterTemplateId = model.MonsterTemplateId == null ? 0 : (int)model.MonsterTemplateId;
            if (!_coreRulesetService.IsMonsterTemplateCopiedFromCoreRuleset(MonsterTemplateId, (int)model.RuleSetId))
            {
                int OldParentItemMasterID = MonsterTemplateId;
                int ItemMasterIDInserted = CreateMonsterForCopiedRuleset(model).Result.MonsterTemplateId;
                model.MonsterTemplateId = ItemMasterIDInserted;
                model.ParentMonsterId = ItemMasterIDInserted;
                return await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.RuleSetId, OldParentItemMasterID, ItemMasterIDInserted, 'M');
            }
            return 0;
        }
        private async Task<MonsterTemplate> CreateMonsterForCopiedRuleset(EditMonsterModel model)
        {
            var result = await _coreRulesetService.CreateMonsterTemplateUsingMonster((int)model.MonsterTemplateId, (int)model.RuleSetId);
            bool IsDeleted = false;
            if (model.MonsterTemplateCommandVM != null && model.MonsterTemplateCommandVM.Count > 0)
            {
                foreach (var acViewModels in model.MonsterTemplateCommandVM)
                {
                    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    {
                        Command = acViewModels.Command,
                        Name = acViewModels.Name,
                        MonsterTemplateId = result.MonsterTemplateId,
                        //IsDeleted = IsDeleted == null ? false : Convert.ToBoolean(monsterTemplate.IsDeleted)
                        IsDeleted = IsDeleted == null ? false : Convert.ToBoolean(false)
                    });
                }
            }
            if (model.MonsterTemplateAbilityVM != null && model.MonsterTemplateAbilityVM.Count > 0)
            {
                _monsterTemplateService.insertAssociateAbilities(model.MonsterTemplateAbilityVM);
            }
            if (model.MonsterTemplateSpellVM != null && model.MonsterTemplateSpellVM.Count > 0)
            {
                _monsterTemplateService.insertAssociateSpells(model.MonsterTemplateSpellVM);

            }
            if (model.MonsterTemplateBuffAndEffectVM != null && model.MonsterTemplateBuffAndEffectVM.Count > 0)
            {
                _monsterTemplateService.insertAssociateBuffAndEffects(model.MonsterTemplateBuffAndEffectVM);

            }
            if (model.MonsterTemplateAssociateMonsterTemplateVM != null && model.MonsterTemplateAssociateMonsterTemplateVM.Count > 0)
            {
                _monsterTemplateService.insertAssociateMonsterTemplates(model.MonsterTemplateAssociateMonsterTemplateVM);

            }
            if (model.MonsterTemplateItemMasterVM != null && model.MonsterTemplateItemMasterVM.Count > 0)
            {
                foreach (var item in model.MonsterTemplateItemMasterVM)
                {
                    item.MonsterTemplateId = result.MonsterTemplateId;
                }
                _monsterTemplateService.insertAssociateItemMasters(model.MonsterTemplateItemMasterVM);

            }
            return result;
        }
        private async Task<IActionResult> UpdateMonsterTemplateCommon(EditMonsterTemplateModel model)
        {
            if (_monsterTemplateService.CheckDuplicateMonsterTemplate(model.Name.Trim(), model.RuleSetId, model.MonsterTemplateId).Result)
                return BadRequest("The Monster Template Name " + model.Name + " had already been used. Please select another name.");

            var monsterTemplateobj = _monsterTemplateService.GetById(model.MonsterTemplateId);
            var becIds = new List<int>();

            if (monsterTemplateobj == null)
                return Ok("Monster Template not found");

            if (monsterTemplateobj.MonsterTemplateCommands.Count > 0)
                becIds.AddRange(monsterTemplateobj.MonsterTemplateCommands.Select(x => x.MonsterTemplateCommandId).ToList());

            var monsterTemplate = Mapper.Map<MonsterTemplate>(model);

            var result = await _monsterTemplateService.Update(monsterTemplate, model.MonsterTemplateAbilityVM, model.MonsterTemplateAssociateMonsterTemplateVM, model.MonsterTemplateBuffAndEffectVM, model.MonsterTemplateItemMasterVM, model.MonsterTemplateSpellVM, model.RandomizationEngine);

            if (model.MonsterTemplateCommandVM != null && model.MonsterTemplateCommandVM.Count > 0)
            {
                if (becIds.Count > 0)
                {
                    foreach (var id in becIds)
                    {
                        if (model.MonsterTemplateCommandVM.Where(x => x.MonsterTemplateCommandId == id).FirstOrDefault() == null)
                            await _monsterTemplateCommandService.DeleteMonsterTemplateCommand(id);
                    }
                }

                foreach (var becViewModels in model.MonsterTemplateCommandVM)
                {
                    if (becViewModels.MonsterTemplateCommandId > 0)
                    {
                        await _monsterTemplateCommandService.UdateMonsterTemplateCommand(new MonsterTemplateCommand()
                        {
                            MonsterTemplateCommandId = becViewModels.MonsterTemplateCommandId,
                            Command = becViewModels.Command,
                            Name = becViewModels.Name,
                            MonsterTemplateId = becViewModels.MonsterTemplateId
                        });
                    }
                    else
                    {
                        await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                        {
                            Command = becViewModels.Command,
                            Name = becViewModels.Name,
                            MonsterTemplateId = result.MonsterTemplateId
                        });
                    }
                }
            }
            else
            {
                await _monsterTemplateCommandService.DeleteMonsterTemplateAllCommands(result.MonsterTemplateId);
            }

            if (model.MonsterTemplateCurrency != null)
            {
                foreach (var currency in model.MonsterTemplateCurrency)
                {
                    currency.MonsterTemplateId = result.MonsterTemplateId;
                    if (currency.MonsterTemplateCurrencyId == 0)
                        await this._monsterTemplateCurrencyService.Create(currency);
                    else
                        await this._monsterTemplateCurrencyService.Update(currency);
                }
            }

            return Ok();
        }


        private async Task<IActionResult> Update_Monster_Common(EditMonsterModel model)
        {
            var item = _monsterTemplateService.GetMonsterById(model.MonsterId, false);
            if (item == null) return BadRequest("Monster not found");

            item.Name = model.Name;
            item.ImageUrl = model.ImageUrl;
            item.Metatags = model.Metatags;
            item.HealthCurrent = model.MonsterHealthCurrent;
            item.HealthMax = model.MonsterHealthMax;
            item.ArmorClass = model.MonsterArmorClass;
            item.XPValue = model.MonsterXPValue;
            item.ChallangeRating = model.MonsterChallangeRating;
            //item.AddToCombatTracker =;
            item.Command = model.Command;
            item.CommandName = model.CommandName;
            item.Description = model.Description;
            item.gmOnly = model.gmOnly;
            item.InitiativeCommand = model.InitiativeCommand;
            item.Stats = model.Stats;



            //var monsterTemplate = Mapper.Map<MonsterTemplate>(model);

            //var result = await _monsterTemplateService.Update(monsterTemplate, model.MonsterTemplateAbilityVM, model.MonsterTemplateAssociateMonsterTemplateVM, model.MonsterTemplateBuffAndEffectVM, model.MonsterTemplateItemMasterVM, model.MonsterTemplateSpellVM,false);

            await _monsterTemplateService.UpdateMonster(item, model.MonsterTemplateAbilityVM, model.MonsterTemplateAssociateMonsterTemplateVM, model.MonsterTemplateBuffAndEffectVM, model.MonsterTemplateSpellVM,model.MonsterTemplateCommandVM,model.MonsterTemplateItemVM);

            try
            {
                if (model.MonsterCurrency != null)
                {
                    foreach (var currency in model.MonsterCurrency)
                    {
                        currency.MonsterId = item.MonsterId;
                        if (currency.MonsterCurrencyId == 0)
                            await this._monsterCurrencyService.Create(currency);
                        else
                            await this._monsterCurrencyService.Update(currency);
                    }
                }
            }
            catch { }

            //var becIds = new List<int>();
            //if (model.MonsterTemplateCommandVM.Count > 0)
            //    becIds.AddRange(model.MonsterTemplateCommandVM.Select(x => x.MonsterTemplateCommandId).ToList());


            //if (model.MonsterTemplateCommandVM != null && model.MonsterTemplateCommandVM.Count > 0)
            //{
            //    if (becIds.Count > 0)
            //    {
            //        foreach (var id in becIds)
            //        {
            //            if (model.MonsterTemplateCommandVM.Where(x => x.MonsterTemplateCommandId == id).FirstOrDefault() == null)
            //                await _monsterTemplateCommandService.DeleteMonsterTemplateCommand(id);
            //        }
            //    }

            //    foreach (var becViewModels in model.MonsterTemplateCommandVM)
            //    {
            //        if (becViewModels.MonsterTemplateCommandId > 0)
            //        {
            //            await _monsterTemplateCommandService.UdateMonsterTemplateCommand(new MonsterTemplateCommand()
            //            {
            //                MonsterTemplateCommandId = becViewModels.MonsterTemplateCommandId,
            //                Command = becViewModels.Command,
            //                Name = becViewModels.Name,
            //                MonsterTemplateId = becViewModels.MonsterTemplateId
            //            });
            //        }
            //        else
            //        {
            //            await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
            //            {
            //                Command = becViewModels.Command,
            //                Name = becViewModels.Name,
            //                MonsterTemplateId = result.MonsterTemplateId
            //            });
            //        }
            //    }
            //}
            //else
            //{

            //            await _monsterTemplateCommandService.DeleteMonsterTemplateAllCommands(result.MonsterTemplateId);

            //}


            return Ok();
        }

        [HttpPost("delete_up")]
        public async Task<IActionResult> Delete([FromBody] EditMonsterTemplateModel model)
        {
            try
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    int MonsterTemplateId = model.MonsterTemplateId == null ? 0 : (int)model.MonsterTemplateId;
                    if (!_coreRulesetService.IsMonsterTemplateCopiedFromCoreRuleset(MonsterTemplateId, rulesetID))
                    {
                        await CreateMonsterTemplateForCopiedRuleset(model, true);
                        return Ok();
                        // await UpdateItemMasterCommon(model);
                    }
                }
                try
                {
                    await this._monsterTemplateCurrencyService.DeleteByMonsterTemplate(model.MonsterTemplateId ?? 0);
                }
                catch { }

                await _monsterTemplateService.Delete((int)model.MonsterTemplateId);
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

        [HttpPost("deleteMonster_up")]
        public async Task<IActionResult> deleteMonster_up([FromBody] EditMonsterModel model)
        {
            try
            {
                //var model = data.item;
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    await Core_DeleteMonster(model);
                }
                else
                {
                    await DeleteMonsterCommon(model.MonsterId);
                }

                //var currentUser = GetUser();
                //if (currentUser.IsGm || currentUser.IsGmPermanent)
                //{
                //    _itemService.AddItemToLoot(model.ItemMasterId);
                //}
                //else if (await _campaignService.isInvitedPlayerCharacter((int)model.CharacterId))
                //{
                //    _itemService.AddItemToLoot(model.ItemMasterId);
                //}
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> Core_DeleteMonster(EditMonsterModel model)
        {
            try
            {
                await CheckCoreRuleset(model);
                return await DeleteMonsterCommon(model.MonsterId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> DeleteMonsterCommon(int monsterId)
        {
            try
            {
                await this._monsterCurrencyService.DeleteByMonster(monsterId);
            }
            catch(Exception ex) { }

            await _monsterTemplateService.DeleteMonster(monsterId);
            return Ok();
        }

        [HttpGet("getCountByRuleSetId")]
        public async Task<IActionResult> getCountByRuleSetId(int rulesetId)
        {
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetId))
            {
                var _items = _coreRulesetService.GetMonsterTemplateCountByRuleSetId(rulesetId);

                if (_items == 0)
                    return Ok(0);

                return Ok(_items);
            }
            else
            {
                var _items = _monsterTemplateService.GetCountByRuleSetId(rulesetId);

                if (_items == 0)
                    return Ok(0);

                return Ok(_items);
            }
        }

        [HttpGet("getMonsterCountByRuleSetId")]
        public async Task<IActionResult> getMonsterCountByRuleSetId(int rulesetId)
        {
            int monsterCount = 0;
            int monsterTemplateCount = 0;
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetId))
            {
                monsterTemplateCount = _coreRulesetService.GetMonsterTemplateCountByRuleSetId(rulesetId);
                monsterCount = _coreRulesetService.GetMonsterCountByRuleSetId(rulesetId);
            }
            else
            {
                monsterTemplateCount = _monsterTemplateService.GetCountByRuleSetId(rulesetId);
                monsterCount = _monsterTemplateService.GetMonsterCountByRuleSetId(rulesetId);
            }
            return Ok(new { monsterTemplateCount = monsterTemplateCount , monsterCount = monsterCount });
        }


        [HttpPost("upLoadImageBlob")]
        public async Task<IActionResult> UpLoadImageBlob()
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                if (httpPostedFile != null)
                {
                    try
                    {
                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _ruleSetService);
                        var container = bs.GetCloudBlobContainer().Result;
                        string imageName = Guid.NewGuid().ToString();
                        dynamic Response = new ExpandoObject();
                        Response.ImageUrl = bs.UploadImages(httpPostedFile, imageName, container).Result;
                        Response.ThumbnailUrl = Response.ImageUrl; // bs.UploadThumbnail(httpPostedFile, imageName, container).Result;

                        return Ok(Response);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ex.Message);
                    }
                }

                return BadRequest();
            }
            return BadRequest("No Image Selected");

        }

        [AllowAnonymous]
        [HttpPost("duplicate")]
        public async Task<IActionResult> Duplicate([FromBody] CreateMonsterTemplateModel model, bool isCreatingFromMonsterScreen,
            int armorClass, int health, int challangeRating, int xpValue)
        {
            if (ModelState.IsValid)
            {
                if (_monsterTemplateService.CheckDuplicateMonsterTemplate(model.Name.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Monster Template Name " + model.Name + " had already been used. Please select another name.");

                var monsterTemplate = _monsterTemplateService.GetById(model.MonsterTemplateId);

                model.MonsterTemplateId = 0;
                var monsterTemplateModel = Mapper.Map<MonsterTemplate>(model);
                var result = await _monsterTemplateService.Create(monsterTemplateModel);


                foreach (var acViewModels in model.MonsterTemplateCommandVM)
                {
                    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    {
                        Command = acViewModels.Command,
                        Name = acViewModels.Name,
                        MonsterTemplateId = result.MonsterTemplateId
                    });
                }

                if (model.MonsterTemplateAbilityVM != null && model.MonsterTemplateAbilityVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateAbilityVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateAbilities(model.MonsterTemplateAbilityVM);
                }
                if (model.MonsterTemplateSpellVM != null && model.MonsterTemplateSpellVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateSpellVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateSpells(model.MonsterTemplateSpellVM);
                    //foreach (var acViewModels in model.MonsterTemplateCommandVM)
                    //{
                    //    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    //    {
                    //        Command = acViewModels.Command,
                    //        Name = acViewModels.Name,
                    //        MonsterTemplateId = result.MonsterTemplateId
                    //    });
                    //}
                }
                if (model.MonsterTemplateBuffAndEffectVM != null && model.MonsterTemplateBuffAndEffectVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateBuffAndEffectVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateBuffAndEffects(model.MonsterTemplateBuffAndEffectVM);
                    //foreach (var acViewModels in model.MonsterTemplateBuffAndEffectVM)
                    //{
                    //    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    //    {
                    //        Command = acViewModels.Command,
                    //        Name = acViewModels.Name,
                    //        MonsterTemplateId = result.MonsterTemplateId
                    //    });
                    //}
                }
                if (model.MonsterTemplateAssociateMonsterTemplateVM != null && model.MonsterTemplateAssociateMonsterTemplateVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateAssociateMonsterTemplateVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateMonsterTemplates(model.MonsterTemplateAssociateMonsterTemplateVM);
                    //foreach (var acViewModels in model.MonsterTemplateCommandVM)
                    //{
                    //    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    //    {
                    //        Command = acViewModels.Command,
                    //        Name = acViewModels.Name,
                    //        MonsterTemplateId = result.MonsterTemplateId
                    //    });
                    //}
                }
                if (model.MonsterTemplateItemMasterVM != null && model.MonsterTemplateItemMasterVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateItemMasterVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateItemMasters(model.MonsterTemplateItemMasterVM);

                }
                if (model.IsRandomizationEngine)
                {
                    if (model.RandomizationEngine != null && model.RandomizationEngine.Count > 0)
                    {
                        _monsterTemplateService.insertRandomizationEngines(model.RandomizationEngine, result.MonsterTemplateId);
                    }
                }
                else
                {
                    if (model.MonsterTemplateItemMasterVM != null && model.MonsterTemplateItemMasterVM.Count > 0)
                    {
                        foreach (var item in model.MonsterTemplateItemMasterVM)
                        {
                            item.MonsterTemplateId = result.MonsterTemplateId;
                        }
                        _monsterTemplateService.insertAssociateItemMasters(model.MonsterTemplateItemMasterVM);

                    }
                }

                if (model.MonsterTemplateCurrency != null)
                {
                    foreach (var currency in model.MonsterTemplateCurrency)
                    {
                        currency.MonsterTemplateId = result.MonsterTemplateId;
                        currency.MonsterTemplateCurrencyId = 0;
                        await this._monsterTemplateCurrencyService.Create(currency);
                    }
                }

                if (isCreatingFromMonsterScreen)
                {
                    List<int> armorClassList = new List<int>();
                    armorClassList.Add(armorClass);

                    List<int> challangeRatingList = new List<int>();
                    challangeRatingList.Add(challangeRating);

                    List<int> healthList = new List<int>();
                    healthList.Add(health);

                    List<int> xpValueList = new List<int>();
                    xpValueList.Add(xpValue);
                    DeployMonsterTemplate deploy = new DeployMonsterTemplate()
                    {
                        addToCombat = true,
                        armorClass = armorClassList,
                        challangeRating = challangeRatingList,
                        healthCurrent = healthList,
                        healthMax = healthList,
                        monsterTemplateId = result.MonsterTemplateId,
                        rulesetId = result.RuleSetId,
                        qty = 1,
                        xpValue = xpValueList,
                        REItems = model.REItems
                    };
                    var MonsterIds = _monsterTemplateService.deployMonster(deploy);
                    await this.UpdateCurrencyDeployedMonsters(model.MonsterTemplateCurrency, MonsterIds);
                }

                return Ok();
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
        private async Task<IActionResult> Core_UpdateMonsterTemplate(EditMonsterTemplateModel model)
        {
            try
            {
                int MonsterTemplateId = model.MonsterTemplateId == null ? 0 : (int)model.MonsterTemplateId;
                if (_coreRulesetService.IsMonsterTemplateCopiedFromCoreRuleset(MonsterTemplateId, (int)model.RuleSetId))
                {
                    return await UpdateMonsterTemplateCommon(model);
                }
                else
                {
                    return await CreateMonsterTemplateForCopiedRuleset(model, null);

                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> CreateMonsterTemplateForCopiedRuleset(EditMonsterTemplateModel model, bool? IsDeleted = null)
        {
            MonsterTemplate monsterTemplateobj = new MonsterTemplate();
            int OldParentMonsterTemplateID = (int)model.MonsterTemplateId;
            MonsterTemplate monsterTemplate = new MonsterTemplate() {
            MonsterTemplateId = model.MonsterTemplateId == null ? 0 : (int)model.MonsterTemplateId,
            Command = model.Command,
            Description = model.Description,
            gmOnly = model.gmOnly,
            ImageUrl = model.ImageUrl,
            Metatags = model.Metatags,
            Name = model.Name,
            RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId,
            Stats = model.Stats,
            IsDeleted = IsDeleted == null ? false : Convert.ToBoolean(model.IsDeleted),
            ArmorClass= model.ArmorClass,
            ChallangeRating= model.ChallangeRating,
            CommandName= model.CommandName,
            Health= model.Health,
            InitiativeCommand= model.InitiativeCommand,
            IsRandomizationEngine= model.IsRandomizationEngine,
            XPValue= model.XPValue,
            
        };
            
            




            //var result = await _abilityService.Create(ability);
            var result = await _coreRulesetService.CreateMonsterTemplate(monsterTemplate);
            await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.RuleSetId, OldParentMonsterTemplateID, result.MonsterTemplateId, 'M');
            //monsterTemplate.MonsterTemplateCommands = model.MonsterTemplateCommandVM;
            if (model.MonsterTemplateCommandVM != null && model.MonsterTemplateCommandVM.Count > 0)
            {
                foreach (var acViewModels in model.MonsterTemplateCommandVM)
                {
                    await _monsterTemplateCommandService.InsertMonsterTemplateCommand(new MonsterTemplateCommand()
                    {
                        Command = acViewModels.Command,
                        Name = acViewModels.Name,
                        MonsterTemplateId = result.MonsterTemplateId,
                        IsDeleted = IsDeleted == null ? false : Convert.ToBoolean(monsterTemplate.IsDeleted)
                    });
                }
            }
            if (model.MonsterTemplateAbilityVM != null && model.MonsterTemplateAbilityVM.Count > 0)
            {
                foreach (var item in model.MonsterTemplateAbilityVM)
                {
                    item.MonsterTemplateId = result.MonsterTemplateId;
                } 
                _monsterTemplateService.insertAssociateAbilities(model.MonsterTemplateAbilityVM);
            }
            if (model.MonsterTemplateSpellVM != null && model.MonsterTemplateSpellVM.Count > 0)
            {
                foreach (var item in model.MonsterTemplateSpellVM)
                {
                    item.MonsterTemplateId = result.MonsterTemplateId;
                }
                _monsterTemplateService.insertAssociateSpells(model.MonsterTemplateSpellVM);

            }
            if (model.MonsterTemplateBuffAndEffectVM != null && model.MonsterTemplateBuffAndEffectVM.Count > 0)
            {
                foreach (var item in model.MonsterTemplateBuffAndEffectVM)
                {
                    item.MonsterTemplateId = result.MonsterTemplateId;
                }
                _monsterTemplateService.insertAssociateBuffAndEffects(model.MonsterTemplateBuffAndEffectVM);

            }
            if (model.MonsterTemplateAssociateMonsterTemplateVM != null && model.MonsterTemplateAssociateMonsterTemplateVM.Count > 0)
            {
                foreach (var item in model.MonsterTemplateAssociateMonsterTemplateVM)
                {
                    item.MonsterTemplateId = result.MonsterTemplateId;
                }
                _monsterTemplateService.insertAssociateMonsterTemplates(model.MonsterTemplateAssociateMonsterTemplateVM);

            }
            //if (model.MonsterTemplateItemMasterVM != null && model.MonsterTemplateItemMasterVM.Count > 0)
            //{
            //    foreach (var item in model.MonsterTemplateItemMasterVM)
            //    {
            //        item.MonsterTemplateId = result.MonsterTemplateId;
            //    }
            //    _monsterTemplateService.insertAssociateItemMasters(model.MonsterTemplateItemMasterVM);

            //}
            if (model.IsRandomizationEngine)
            {
                if (model.RandomizationEngine != null && model.RandomizationEngine.Count > 0)
                {
                    _monsterTemplateService.insertRandomizationEngines(model.RandomizationEngine, result.MonsterTemplateId);
                }
            }
            else
            {
                if (model.MonsterTemplateItemMasterVM != null && model.MonsterTemplateItemMasterVM.Count > 0)
                {
                    foreach (var item in model.MonsterTemplateItemMasterVM)
                    {
                        item.MonsterTemplateId = result.MonsterTemplateId;
                    }
                    _monsterTemplateService.insertAssociateItemMasters(model.MonsterTemplateItemMasterVM);

                }
            }
            if (IsDeleted==true)
            {
                await _monsterTemplateService.Delete(result.MonsterTemplateId);
            }

            if (model.MonsterTemplateCurrency != null)
            {
                foreach (var currency in model.MonsterTemplateCurrency)
                {
                    await this._monsterTemplateCurrencyService.Update(currency);
                }
            }

            return Ok(result.MonsterTemplateId);
        }
        //[HttpGet("getByRuleSetId_add")]
        //public IEnumerable<BuffAndEffect> getByRuleSetId_add(int rulesetId)
        //{
        //    List<BuffAndEffect> result = _monsterTemplateService.GetByRuleSetId_add(rulesetId);
        //    return result;
        //}

        [HttpPost("DeployMonsterTemplate")]
        public async Task<IActionResult> DeployMonsterTemplate([FromBody] DeployMonsterTemplate model)
        {
            try
            {
                var MonsterIds = _monsterTemplateService.deployMonster(model);
                await this.UpdateCurrencyDeployedMonsters(null, MonsterIds, model.monsterTemplateId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("AddMonsters")]
        public async Task<IActionResult> AddMonsters([FromBody]  List<DeployMonsterTemplate> model)
        {
            try
            {
                _monsterTemplateService.AddMonsters(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("enableCombatTracker")]
        public async Task<IActionResult> enableCombatTracker(int monsterId, bool enableCombatTracker)
        {
            try
            {
                await _monsterTemplateService.enableCombatTracker(monsterId, enableCombatTracker);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("AssignMonsterTocharacter")]
        public async Task<IActionResult> AssignMonsterTocharacter([FromBody] AssociateMonsterToCharacter model)
        {
            try
            {
                await _monsterTemplateService.AssignMonsterTocharacter(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost("duplicateMonster")]
        public async Task<IActionResult> DuplicateMonster([FromBody] EditMonsterModel model, bool addToCombat, int? characterId)
        {
            if (ModelState.IsValid)
            {
                if (_monsterTemplateService.CheckDuplicateMonster(model.Name.Trim(), model.RuleSetId, model.MonsterId).Result)
                    return BadRequest("The Monster Name " + model.Name + " had already been used. Please select another name.");

                //var monster = _monsterTemplateService.GetMonsterById(model.MonsterId, false);

                //model.MonsterId = 0;
                //var monsterModel = Mapper.Map<Monster>(model);
                if (characterId<=0)
                {
                    characterId = null;
                }
                Monster monsterModel = new Monster() {
                    AddToCombatTracker = addToCombat,
                    ArmorClass = model.MonsterArmorClass,
                    ChallangeRating = model.MonsterChallangeRating,
                    CharacterId = characterId,
                    Command = model.Command,
                    CommandName = model.CommandName,
                    Description = model.Description,
                    gmOnly = model.gmOnly,
                    HealthCurrent = model.MonsterHealthCurrent,
                    HealthMax = model.MonsterHealthMax,
                    ImageUrl = model.ImageUrl,
                    InitiativeCommand = model.InitiativeCommand,
                    IsRandomizationEngine = model.IsRandomizationEngine,
                    ItemMasterMonsterItems = model.MonsterTemplateItemVM.Select(x => new ItemMasterMonsterItem() { ItemId = x.ItemId }).ToList(),
                    Metatags = model.Metatags,
                    MonsterAbilitys = model.MonsterTemplateAbilityVM.Select(x => new MonsterAbility() { AbilityId = x.AbilityId }).ToList(),
                    MonsterBuffAndEffects = model.MonsterTemplateBuffAndEffectVM.Select(x => new MonsterBuffAndEffect() { BuffAndEffectId = x.BuffAndEffectId }).ToList(),
                    MonsterCommands = model.MonsterTemplateCommandVM.Select(x => new MonsterCommand() { Command = x.Command, Name=x.Name }).ToList(),
                    MonsterMonsters = model.MonsterTemplateAssociateMonsterTemplateVM.Select(x => new MonsterMonster() { AssociateMonsterId = x.AssociateMonsterTemplateId }).ToList(),
                    MonsterSpells = model.MonsterTemplateSpellVM.Select(x => new MonsterSpell() { SpellId = x.SpellId }).ToList(),
                    MonsterTemplateId = (int)model.MonsterTemplateId,
                    Name = model.Name,
                    RuleSetId = (int)model.RuleSetId,
                    Stats = model.Stats,
                    XPValue = model.MonsterXPValue,
                };
                var result = await _monsterTemplateService.duplicateMonster(monsterModel);

                try
                {
                    if (model.MonsterCurrency != null)
                    {
                        foreach (var currency in model.MonsterCurrency)
                        {
                            currency.MonsterId = result.MonsterId;
                            await this._monsterCurrencyService.Create(currency);
                        }
                    }
                }
                catch { }

                return Ok(result);
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpGet("GetMonstersByRulesetId")]
        public async Task<IActionResult> GetMonstersByRulesetId(int ruleSetId)
        {
            //var monsters = _monsterTemplateService.GetMonstersByRulesetId(ruleSetId);

            //if (monsters == null) { return null; }
            //return Ok(monsters);
            return Ok(_monsterTemplateService.GetMonstersByRulesetId(ruleSetId));
        }


        #region API Using SP
        [HttpGet("getByRuleSetId_sp")]
        public async Task<IActionResult> getByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30, int sortType = 1)
        {
            dynamic Response = new ExpandoObject();
            var monsterTemplatesResult = _monsterTemplateService.SP_GetMonsterTemplateByRuleSetId(rulesetId, page, pageSize, sortType);
            var monsterTemplatesList = monsterTemplatesResult.MonsterTemplates_Bundle;
            Response.monsterTemplates = monsterTemplatesList; // Utilities.CleanModel<Ability>(abilityList);
            Response.FilterAplhabetCount = monsterTemplatesResult.FilterAplhabetCount;
            Response.FilterCRCount = monsterTemplatesResult.FilterCRCount;
            Response.FilterHealthCount = monsterTemplatesResult.FilterHealthCount;

            try
            {
                if (monsterTemplatesList.Any())
                {
                    Response.RuleSet = monsterTemplatesList.FirstOrDefault().RuleSet;
                }
                else
                {
                    Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
                }
                Response.CurrencyTypes = await _ruleSetService.GetCurrencyTypesWithDefault(rulesetId);
            }
            catch { }

            return Ok(Response);
        }

        [HttpGet("getMonsterByRuleSetId_sp")]
        public async Task<IActionResult> getMonsterByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30, int sortType = 1, int? characterId=null)
        {
            dynamic Response = new ExpandoObject();
            var monsterResult = _monsterTemplateService.SP_GetMonstersByRuleSetId(rulesetId, page, pageSize, sortType, characterId);
            var monsterList = monsterResult.Monsters;
            Response.monsters = monsterList; // Utilities.CleanModel<Ability>(abilityList);
            Response.FilterAplhabetCount = monsterResult.FilterAplhabetCount;
            Response.FilterCRCount = monsterResult.FilterCRCount;
            Response.FilterHealthCount = monsterResult.FilterHealthCount;
            if (monsterList.Any())
            {
                Response.RuleSet = monsterList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            Response.Character = null;
            if (characterId!=null && characterId>0)
            {
                Response.Character = _CharacterService.GetCharacterById_Lite((int) characterId);
            }
            Response.CurrencyTypes = await _ruleSetService.GetCurrencyTypesWithDefault(rulesetId);
            return Ok(Response);
        }

        [HttpGet("getCommands_sp")]
        public async Task<IActionResult> getCommands_sp(int monsterTemplateID)
        {
            return Ok(_monsterTemplateService.SP_GetMonsterTemplateCommands(monsterTemplateID));
        }

        [HttpGet("getMonsterCommands_sp")]
        public async Task<IActionResult> getMonsterCommands_sp(int monsterId)
        {
            return Ok(_monsterTemplateService.SP_GetMonsterCommands(monsterId));
        }
        
        [HttpGet("SP_GetAssociateRecords")]
        public async Task<IActionResult> SP_GetAssociateRecords(int monsterTemplateId, int rulesetId, int MonsterID = 0)
        {
            var GetAssociateRecords = _monsterTemplateService.SP_GetAssociateRecords(monsterTemplateId, rulesetId, MonsterID);
            try
            {
                GetAssociateRecords.CurrencyType = await this._ruleSetService.GetCurrencyTypesWithDefault(rulesetId);
            }
            catch { }
            return Ok(GetAssociateRecords);
        }

        [HttpGet("SP_GetMonsterAssociateRecords")]
        public async Task<IActionResult> SP_GetMonsterAssociateRecords(int MonsterID, int rulesetId)
        {
            var GetMonsterAssociateRecords = _monsterTemplateService.SP_GetMonsterAssociateRecords(MonsterID, rulesetId);
            try
            {
                GetMonsterAssociateRecords.CurrencyType = await this._ruleSetService.GetCurrencyTypesWithDefault(rulesetId);
            }
            catch { }
            return Ok(GetMonsterAssociateRecords);
        }

        [HttpGet("getByRuleSetId_add")]
        public async Task<IActionResult> getByRuleSetId_add(int rulesetId, bool includeBundles = false)
        {
            dynamic Response = new ExpandoObject();
            List<MonsterTemplate_Bundle> MonsterTemplateList = _monsterTemplateService.GetMonsterTemplatesByRuleSetId_add(rulesetId, includeBundles);

            Response.MonsterTemplate = Utilities.CleanModel<MonsterTemplate_Bundle>(MonsterTemplateList);
            Response.RuleSet = Utilities.CleanModel<RuleSet>(_ruleSetService.GetRuleSetById(rulesetId).Result);
            return Ok(Response);

        }

        [HttpPost("DeleteMonsterTemplates")]
        public async Task<IActionResult> DeleteMultiMonsterTemplates([FromBody] List<MonsterTemplate_Bundle> model, int rulesetId)
        {
            try
            {
                try
                {
                    foreach (var mTemplate in model)
                    {
                        await this._monsterTemplateCurrencyService.DeleteByMonsterTemplate(mTemplate.MonsterTemplateId);
                    }
                }
                catch { }

                _monsterTemplateService.DeleteMultiMonsterTemplates(model, rulesetId);                

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("DeleteMonsters")]
        public async Task<IActionResult> DeleteMultiMonsters([FromBody] List<Monster> model, int rulesetId)
        {
            try
            {
                try
                {
                    foreach (var monster in model)
                    {
                        await this._monsterCurrencyService.DeleteByMonster(monster.MonsterId);
                    }
                }
                catch { }

                _monsterTemplateService.DeleteMultiMonsters(model, rulesetId);
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