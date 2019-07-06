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

        public MonsterTemplateController(IHttpContextAccessor httpContextAccessor, IMonsterTemplateService monsterTemplateService,
            IMonsterTemplateCommandService monsterTemplateCommandService, ICharacterAbilityService characterAbilityService,
            IRuleSetService ruleSetService, ICoreRuleset coreRulesetService, ICharacterService CharacterService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._monsterTemplateService = monsterTemplateService;
            this._characterAbilityService = characterAbilityService;
            this._monsterTemplateCommandService = monsterTemplateCommandService;
            this._ruleSetService = ruleSetService;
            this._coreRulesetService = coreRulesetService;
            this._CharacterService = CharacterService;
        }


        [HttpGet("GetById")]
        public MonsterTemplateViewModel GetById(int id)
        {
            var monsterTemplate = _monsterTemplateService.GetById(id);

            if (monsterTemplate == null) return null;

            var _monsterTemplate = Mapper.Map<MonsterTemplateViewModel>(monsterTemplate);



            return _monsterTemplate;
        }

        [HttpGet("GetMonsterById")]
        public async Task<IActionResult> GetMonsterById(int id)
        {
            var monster = _monsterTemplateService.GetMonsterById(id, true);

            if (monster == null) return null;

            //var _monster = Mapper.Map<MonsterTemplateViewModel>(monsterTemplate);




            return Ok(monster);
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
                    _monsterTemplateService.deployMonster(deploy);
                }
                return Ok(result);
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
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
            
          int itemCountAfterDelete=  await _monsterTemplateService.DropItemsToLoot(list,monsterId);
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
            item.InitiativeCommand = model.InitiativeCommand;
            item.Stats = model.Stats;



            //var monsterTemplate = Mapper.Map<MonsterTemplate>(model);

            //var result = await _monsterTemplateService.Update(monsterTemplate, model.MonsterTemplateAbilityVM, model.MonsterTemplateAssociateMonsterTemplateVM, model.MonsterTemplateBuffAndEffectVM, model.MonsterTemplateItemMasterVM, model.MonsterTemplateSpellVM,false);

            await _monsterTemplateService.UpdateMonster(item, model.MonsterTemplateAbilityVM, model.MonsterTemplateAssociateMonsterTemplateVM, model.MonsterTemplateBuffAndEffectVM, model.MonsterTemplateSpellVM,model.MonsterTemplateCommandVM,model.MonsterTemplateItemVM);


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
                        //return Ok();
                        // await UpdateItemMasterCommon(model);
                    }
                }
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


                foreach (var acViewModels in monsterTemplate.MonsterTemplateCommands)
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
                    _monsterTemplateService.deployMonster(deploy);
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
            MonsterTemplate monsterTemplate = new MonsterTemplate();
            monsterTemplate.MonsterTemplateCommands = model.MonsterTemplateCommandVM;
            monsterTemplate.MonsterTemplateId = model.MonsterTemplateId == null ? 0 : (int)model.MonsterTemplateId;
            monsterTemplate.Command = model.Command;
            monsterTemplate.Description = model.Description;
            monsterTemplate.ImageUrl = model.ImageUrl;
            monsterTemplate.Metatags = model.Metatags;
            monsterTemplate.Name = model.Name;
            monsterTemplate.RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            monsterTemplate.Stats = model.Stats;
            monsterTemplate.IsDeleted = IsDeleted == null ? false : Convert.ToBoolean(monsterTemplate.IsDeleted);




            //var result = await _abilityService.Create(ability);
            var result = await _coreRulesetService.CreateMonsterTemplate(monsterTemplate);

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
            return Ok(result.MonsterTemplateId);
        }
        //[HttpGet("getByRuleSetId_add")]
        //public IEnumerable<BuffAndEffect> getByRuleSetId_add(int rulesetId)
        //{
        //    List<BuffAndEffect> result = _monsterTemplateService.GetByRuleSetId_add(rulesetId);
        //    return result;
        //}

        [HttpPost("DeployMonsterTemplate")]
        public async Task<IActionResult> DeployMonsterTemplate([FromBody]  DeployMonsterTemplate model)
        {
            try
            {
                _monsterTemplateService.deployMonster(model);
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

        #region API Using SP
        [HttpGet("getByRuleSetId_sp")]
        public async Task<IActionResult> getByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30, int sortType = 1)
        {
            dynamic Response = new ExpandoObject();
            var monsterTemplatesList = _monsterTemplateService.SP_GetMonsterTemplateByRuleSetId(rulesetId, page, pageSize, sortType);
            Response.monsterTemplates = monsterTemplatesList; // Utilities.CleanModel<Ability>(abilityList);
            if (monsterTemplatesList.Any())
            {
                Response.RuleSet = monsterTemplatesList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            return Ok(Response);
        }

        [HttpGet("getMonsterByRuleSetId_sp")]
        public async Task<IActionResult> getMonsterByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30, int sortType = 1)
        {
            dynamic Response = new ExpandoObject();
            var monsterList = _monsterTemplateService.SP_GetMonstersByRuleSetId(rulesetId, page, pageSize, sortType);
            Response.monsters = monsterList; // Utilities.CleanModel<Ability>(abilityList);
            if (monsterList.Any())
            {
                Response.RuleSet = monsterList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            return Ok(Response);
        }

        [HttpGet("getCommands_sp")]
        public async Task<IActionResult> getCommands_sp(int monsterTemplateID)
        {
            return Ok(_monsterTemplateService.SP_GetMonsterTemplateCommands(monsterTemplateID));
        }
        [HttpGet("SP_GetAssociateRecords")]
        public async Task<IActionResult> SP_GetAssociateRecords(int monsterTemplateId, int rulesetId, int MonsterID = 0)
        {
            return Ok(_monsterTemplateService.SP_GetAssociateRecords(monsterTemplateId, rulesetId, MonsterID));
        }
        [HttpGet("SP_GetMonsterAssociateRecords")]
        public async Task<IActionResult> SP_GetMonsterAssociateRecords(int MonsterID, int rulesetId)
        {
            return Ok(_monsterTemplateService.SP_GetMonsterAssociateRecords(MonsterID, rulesetId));
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
        #endregion
    }
}