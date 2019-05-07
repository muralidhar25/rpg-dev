using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
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
    public class AbilityController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IAbilityService _abilityService;
        private readonly ICharacterAbilityService _characterAbilityService;
        private readonly IAbilityCommandService _abilityCommandService;
        private readonly IRuleSetService _ruleSetService;
        private readonly ICoreRuleset _coreRulesetService;

        public AbilityController(IHttpContextAccessor httpContextAccessor, IAbilityService abilityService,
            IAbilityCommandService abilityCommandService, ICharacterAbilityService characterAbilityService,
            IRuleSetService ruleSetService, ICoreRuleset coreRulesetService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._abilityService = abilityService;
            this._characterAbilityService = characterAbilityService;
            this._abilityCommandService = abilityCommandService;
            this._ruleSetService = ruleSetService;
            this._coreRulesetService = coreRulesetService;
        }

        [HttpGet("getall")]
        public IEnumerable<Ability> GetAll()
        {
            return _abilityService.GetAll();
        }

        [HttpGet("GetById")]
        public AbilityViewModel GetById(int id)
        {
            var ability = _abilityService.GetById(id);

            if (ability == null) return null;

            var _ability = Mapper.Map<AbilityViewModel>(ability);

            var data = _characterAbilityService.GetByAbilityId(_ability.AbilityId);
            if (data != null)
            {
                _ability.CharacterId = data.CharacterId ?? 0;
                _ability.Character = data.Character;
            }

            return _ability;
        }

        [HttpGet("getByRuleSetId")]
        public IEnumerable<Ability> getByRuleSetId(int rulesetId)
        {
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetId))
            {
                var result = _coreRulesetService.GetAbilitiesByRuleSetId(rulesetId);
                foreach (var item in result)
                {
                    item.RuleSet.Abilities = null;
                }
                return Utilities.CleanModel<IEnumerable<Ability>>(result);
            }
            else
            {
                var result = _abilityService.GetAbilitiesByRuleSetId(rulesetId);
                foreach (var item in result)
                {
                    item.RuleSet.Abilities = null;
                }
                return Utilities.CleanModel<IEnumerable<Ability>>(result);
            }

        }

        [HttpGet("getByRuleSetId_add")]
        public IEnumerable<Ability> getByRuleSetId_add(int rulesetId)
        {
            List<Ability> result = _coreRulesetService.GetAbilitiesByRuleSetId_add(rulesetId);           
            return result;
        }
        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] CreateAbilityModel model)
        {
            if (ModelState.IsValid)
            {
                if (_abilityService.CheckDuplicateAbility(model.Name.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Ability Name " + model.Name + " had already been used. Please select another name.");

                var ability = Mapper.Map<Ability>(model);
                var result = await _abilityService.Create(ability);

                if (model.AbilityCommandVM != null && model.AbilityCommandVM.Count > 0)
                {
                    foreach (var acViewModels in model.AbilityCommandVM)
                    {
                        await _abilityCommandService.InsertAbilityCommand(new AbilityCommand()
                        {
                            Command = acViewModels.Command,
                            Name = acViewModels.Name,
                            AbilityId = result.AbilityId
                        });
                    }
                }

                try
                {
                    //when creating ability from character
                    if (model.IsFromCharacter && model.IsFromCharacterId > 0)
                    {
                        await _characterAbilityService.InsertCharacterAbility(new CharacterAbility
                        {
                            CharacterId = model.IsFromCharacterId,
                            AbilityId = result.AbilityId,
                            IsEnabled = result.IsEnabled,
                            MaxNumberOfUses = model.MaxNumberOfUses,
                            CurrentNumberOfUses = model.CurrentNumberOfUses
                        });

                        var ruleset = _ruleSetService.GetRuleSetById(result.RuleSetId);
                        //return Ok("A new " + result.Name + " Ability has been created in the "
                        //    + ruleset.Result.RuleSetName + " Rule Set. Any future updates will not affect the Ability."
                        //    + " If you wish to update the Ability you may do so from the Rule Sets interface.");
                        return Ok(result.Name + " Ability has been successfully created");
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] EditAbilityModel model)
        {
            if (ModelState.IsValid)
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {

                    return await Core_UpdateAbility(model);
                }
                else
                {
                    return await UpdateAbilityCommon(model);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async Task<IActionResult> UpdateAbilityCommon(EditAbilityModel model)
        {
            if (_abilityService.CheckDuplicateAbility(model.Name.Trim(), model.RuleSetId, model.AbilityId).Result)
                return BadRequest("The Ability Name " + model.Name + " had already been used. Please select another name.");

            var abilityobj = _abilityService.GetById(model.AbilityId);
            var acIds = new List<int>();

            if (abilityobj == null)
                return Ok("Ability not found");

            if (abilityobj.AbilityCommand.Count > 0)
                acIds.AddRange(abilityobj.AbilityCommand.Select(x => x.AbilityCommandId).ToList());

            var ability = Mapper.Map<Ability>(model);

            var result = await _abilityService.Update(ability, model.IsFromCharacter);

            if (model.AbilityCommandVM != null && model.AbilityCommandVM.Count > 0)
            {
                if (acIds.Count > 0)
                {
                    foreach (var id in acIds)
                    {
                        if (model.AbilityCommandVM.Where(x => x.AbilityCommandId == id).FirstOrDefault() == null)
                            await _abilityCommandService.DeleteAbilityCommand(id);
                    }
                }

                foreach (var acViewModels in model.AbilityCommandVM)
                {
                    if (acViewModels.AbilityCommandId > 0)
                    {
                        await _abilityCommandService.UdateAbilityCommand(new AbilityCommand()
                        {
                            AbilityCommandId = acViewModels.AbilityCommandId,
                            Command = acViewModels.Command,
                            Name = acViewModels.Name,
                            AbilityId = acViewModels.AbilityId
                        });
                    }
                    else
                    {
                        await _abilityCommandService.InsertAbilityCommand(new AbilityCommand()
                        {
                            Command = acViewModels.Command,
                            Name = acViewModels.Name,
                            AbilityId = result.AbilityId
                        });
                    }
                }
            }
            else
            {
                if (acIds.Count > 0)
                {
                    foreach (var id in acIds)
                    {
                        await _abilityCommandService.DeleteAbilityCommand(id);
                    }
                }
            }

            try
            {
                //when updating ability from character
                if (model.IsFromCharacter && model.IsFromCharacterId > 0)
                {
                    var objCharacterAbility = _characterAbilityService.GetById(model.IsFromCharacterAbilityId);
                    objCharacterAbility.CurrentNumberOfUses = model.CurrentNumberOfUses;
                    objCharacterAbility.MaxNumberOfUses = model.MaxNumberOfUses;
                    await _characterAbilityService.UpdateCharacterAbility(objCharacterAbility);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Remove associated data -TODO
                await _abilityService.Delete(id);
            }
            catch (Exception ex)
            {
                if (ex.InnerException.Message.Contains("The DELETE statement conflicted with the REFERENCE constraint"))
                    return BadRequest("Spell cannot be deleted, as it is associated with Character(s).");
            }

            return Ok();
        }
        [HttpPost("delete_up")]
        public async Task<IActionResult> Delete([FromBody] EditAbilityModel model)
        {
            try
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    int AbilityId = model.AbilityId == null ? 0 : (int)model.AbilityId;
                    if (!_coreRulesetService.IsAbilityCopiedFromCoreRuleset(AbilityId, rulesetID))
                    {
                        await CreateAbilityForCopiedRuleset(model, true);
                        //return Ok();
                        // await UpdateItemMasterCommon(model);
                    }
                }
                await _abilityService.Delete((int)model.AbilityId);
                return Ok();
            }
            catch (Exception ex)
            {
                if (ex.InnerException.Message.Contains("The DELETE statement conflicted with the REFERENCE constraint"))
                    return BadRequest("Spell cannot be deleted, as it is associated with Character(s).");
                else
                    return BadRequest(ex.Message);
            }
        }

        [HttpGet("getCountByRuleSetId")]
        public async Task<IActionResult> getCountByRuleSetId(int rulesetId)
        {
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetId))
            {
                var _items = _coreRulesetService.GetAbilityCountByRuleSetId(rulesetId);

                if (_items == 0)
                    return Ok(0);

                return Ok(_items);
            }
            else
            {
                var _items = _abilityService.GetCountByRuleSetId(rulesetId);

                if (_items == 0)
                    return Ok(0);

                return Ok(_items);
            }
        }


        [HttpPost("upLoadAbilityImageBlob")]
        public async Task<IActionResult> UpLoadAbilityImageBlob()
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                if (httpPostedFile != null)
                {
                    try
                    {
                        BlobService bs = new BlobService(_httpContextAccessor,_accountManager,_ruleSetService);
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
        [HttpPost("duplicateAbility")]
        public async Task<IActionResult> DuplicateAbility([FromBody] CreateAbilityModel model)
        {
            if (ModelState.IsValid)
            {
                if (_abilityService.CheckDuplicateAbility(model.Name.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Ability Name " + model.Name + " had already been used. Please select another name.");

                var ability = _abilityService.GetById(model.AbilityId);

                model.AbilityId = 0;
                var abilityModel = Mapper.Map<Ability>(model);
                var result = await _abilityService.Create(abilityModel);
                //var result = await _abilityService.Create(model);

                foreach (var acViewModels in ability.AbilityCommand)
                {
                    await _abilityCommandService.InsertAbilityCommand(new AbilityCommand()
                    {
                        Command = acViewModels.Command,
                        Name = acViewModels.Name,
                        AbilityId = result.AbilityId
                    });
                }

                try
                {
                    //when duplicating ability from character
                    if (model.IsFromCharacter && model.IsFromCharacterId > 0)
                    {
                        await _characterAbilityService.InsertCharacterAbility(new CharacterAbility
                        {
                            CharacterId = model.IsFromCharacterId,
                            AbilityId = result.AbilityId,
                            IsEnabled = result.IsEnabled,
                            MaxNumberOfUses = model.MaxNumberOfUses,
                            CurrentNumberOfUses = model.CurrentNumberOfUses
                        });

                        var ruleset = _ruleSetService.GetRuleSetById(result.RuleSetId);
                        return Ok("A new " + result.Name + " Ability has been duplicated in the "
                            + ruleset.Result.RuleSetName + " Rule Set. Any future updates will not affect the Ability."
                            + " If you wish to update the Ability you may do so from the Rule Sets interface.");
                    }
                }
                catch { }

                return Ok();
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("toggleEnableAbility")]
        public async Task<IActionResult> ToggleEnableAbility(int id)
        {
            _abilityService.ToggleEnableAbility(id);

            return Ok();
        }

        //get user id methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
            //return "ec34768b-c2ff-43b2-9bf3-d0946d416482";
        }
        private async Task<IActionResult> Core_UpdateAbility(EditAbilityModel model)
        {
            try
            {
                int AbilityId = model.AbilityId == null ? 0 : (int)model.AbilityId;
                if (_coreRulesetService.IsAbilityCopiedFromCoreRuleset(AbilityId, (int)model.RuleSetId))
                {
                    return await UpdateAbilityCommon(model);
                }
                else
                {
                    return await CreateAbilityForCopiedRuleset(model, null);

                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> CreateAbilityForCopiedRuleset(EditAbilityModel model, bool? IsDeleted = null)
        {
            Ability abilityobj = new Ability();
            int OldParentAbilityID = (int)model.AbilityId;
            Ability ability = new Ability();
            ability.AbilityCommand = model.AbilityCommandVM;
            ability.AbilityId = model.AbilityId == null ? 0 : (int)model.AbilityId;
            ability.Command = model.Command;
            ability.Description = model.Description;
            ability.ImageUrl = model.ImageUrl;
            ability.Level = model.Level;
            ability.Metatags = model.Metatags;
            ability.Name = model.Name;
            ability.RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            ability.Stats = model.Stats;
            ability.IsDeleted = IsDeleted;

            if (model.IsFromCharacter)
            {
                abilityobj = _abilityService.GetById(OldParentAbilityID);
                ability.CurrentNumberOfUses = abilityobj.CurrentNumberOfUses;
                ability.MaxNumberOfUses = abilityobj.MaxNumberOfUses;
                ability.IsEnabled = abilityobj.IsEnabled;
            }
            else
            {
                ability.CurrentNumberOfUses = model.CurrentNumberOfUses == null ? 0 : (int)model.CurrentNumberOfUses;
                ability.MaxNumberOfUses = model.MaxNumberOfUses == null ? 0 : (int)model.MaxNumberOfUses;
                ability.IsEnabled = model.IsEnabled == null ? false : (bool)model.IsEnabled;
            }


            //var result = await _abilityService.Create(ability);
            var result = await _coreRulesetService.CreateAbility(ability);

            if (model.AbilityCommandVM != null && model.AbilityCommandVM.Count > 0)
            {
                foreach (var acViewModels in model.AbilityCommandVM)
                {
                    await _abilityCommandService.InsertAbilityCommand(new AbilityCommand()
                    {
                        Command = acViewModels.Command,
                        Name = acViewModels.Name,
                        AbilityId = result.AbilityId,
                        IsDeleted = IsDeleted
                    });
                }
            }
            try
            {
                //when creating ability from character
                if (model.IsFromCharacter && model.IsFromCharacterId > 0)
                {
                    await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.IsFromCharacterId, OldParentAbilityID, result.AbilityId, 'A');

                    var objCharacterAbility = _characterAbilityService.GetById(model.IsFromCharacterAbilityId);
                    objCharacterAbility.CurrentNumberOfUses = model.CurrentNumberOfUses;
                    objCharacterAbility.MaxNumberOfUses = model.MaxNumberOfUses;
                    await _characterAbilityService.UpdateCharacterAbility(objCharacterAbility);

                    var ruleset = _ruleSetService.GetRuleSetById(result.RuleSetId);
                    //return Ok("A new " + result.Name + " Ability has been created in the "
                    //    + ruleset.Result.RuleSetName + " Rule Set. Any future updates will not affect the Ability."
                    //    + " If you wish to update the Ability you may do so from the Rule Sets interface.");
                    return Ok(result.Name + " Ability has been successfully created");
                }
                else
                {
                    var characterIDs = _coreRulesetService.GetCharactersByRulesetID(result.RuleSetId).Result.Select(p => p.CharacterId);
                    foreach (var item in characterIDs)
                    {
                        await _coreRulesetService._updateParentIDForAllRelatedItems(item, OldParentAbilityID, result.AbilityId, 'A');
                    }

                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            return Ok(result.AbilityId);
        }

        #region API Using SP
        [HttpGet("getByRuleSetId_sp")]
        public async Task<IActionResult> getByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30)
        {
            dynamic Response = new ExpandoObject();
            var abilityList = _abilityService.SP_GetAbilityByRuleSetId(rulesetId, page, pageSize);
            Response.Abilities = abilityList; // Utilities.CleanModel<Ability>(abilityList);
            if (abilityList.Any())
            {
                Response.RuleSet = abilityList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            return Ok(Response);
        }

        [HttpGet("getAbilityCommands_sp")]
        public async Task<IActionResult> getAbilityCommands_sp(int abilityId)
        {
            return Ok(_abilityService.SP_GetAbilityCommands(abilityId));
        }

        #endregion
    }
}