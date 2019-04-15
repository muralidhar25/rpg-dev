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
    public class SpellController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ISpellService _spellService;
        private readonly ICharacterSpellService _characterSpellService;
        private readonly ISpellCommandService _spellCommandService;
        private readonly IRuleSetService _ruleSetService;
        private readonly ICoreRuleset _coreRulesetService;

        public SpellController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            ISpellService spellService, ISpellCommandService spellCommandService,
            ICharacterSpellService characterSpellService, IRuleSetService ruleSetService,
            ICoreRuleset coreRulesetService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._accountManager = accountManager;
            this._spellService = spellService;
            this._characterSpellService = characterSpellService;
            this._spellCommandService = spellCommandService;
            this._ruleSetService = ruleSetService;
            this._coreRulesetService = coreRulesetService;
        }

        [HttpGet("GetAll")]
        public IEnumerable<Spell> GetAll()
        {
            return _spellService.GetAll();
        }

        [HttpGet("GetById")]
        public SpellViewModel GetById(int id)
        {
            var spell = _spellService.GetById(id);

            if (spell == null) return null;

            var _spell = Mapper.Map<SpellViewModel>(spell);

            var data = _characterSpellService.GetBySpellId(_spell.SpellId);
            if (data != null)
            {
                _spell.CharacterId = data.CharacterId ?? 0;
                _spell.Character = data.Character;
            }

            return _spell;
        }

        [HttpGet("getByRuleSetId")]
        public IEnumerable<Spell> getByRuleSetId(int rulesetId)
        {
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetId))
            {
                var result = _coreRulesetService.GetSpellsByRuleSetId(rulesetId);
                foreach (var item in result)
                {
                    item.RuleSet.Spells = null;
                }
                return Utilities.CleanModel<IEnumerable<Spell>>(result);
            }
            else
            {
                var result = _spellService.GetSpellsByRuleSetId(rulesetId);
                foreach (var item in result)
                {
                    item.RuleSet.Spells = null;
                }
                return Utilities.CleanModel<IEnumerable<Spell>>(result);
            }
        }

        [HttpGet("getByRuleSetId_add")]
        public IEnumerable<Spell> getByRuleSetId_add(int rulesetId)
        {
            List<Spell> result = _coreRulesetService.GetSpellsByRuleSetId_add(rulesetId);
            return Utilities.CleanModel<IEnumerable<Spell>>(result);
        }
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateSpellModel model)
        {

            if (ModelState.IsValid)
            {
                if (_spellService.CheckDuplicateSpell(model.Name.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Spell Name '" + model.Name + "' had already been used. Please select another name.");

                var spell = Mapper.Map<Spell>(model);
                var result = await _spellService.Create(spell);


                if (model.SpellCommandVM != null && model.SpellCommandVM.Count > 0)
                {
                    foreach (var scViewModels in model.SpellCommandVM)
                    {
                        await _spellCommandService.InsertSpellCommand(new SpellCommand()
                        {
                            Command = scViewModels.Command,
                            Name = scViewModels.Name,
                            SpellId = result.SpellId
                        });
                    }
                }

                try
                {
                    if (model.IsFromCharacter && model.IsFromCharacterId > 0)
                    {
                        await _characterSpellService.InsertCharacterSpell(new CharacterSpell
                        {
                            CharacterId = model.IsFromCharacterId,
                            SpellId = result.SpellId,
                            IsMemorized = result.Memorized
                        });

                        var ruleset = _ruleSetService.GetRuleSetById(result.RuleSetId);
                        //return Ok("A new " + result.Name + " Spell has been created in the "
                        //    + ruleset.Result.RuleSetName + " Rule Set. Any future updates will not affect the Spell."
                        //    + " If you wish to update the Spell you may do so from the Rule Sets interface.");
                        return Ok(result.Name + " Spell has been successfully created");
                    }
                }
                catch (Exception ex)
                { return BadRequest(ex.Message); }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("Update")]
        public async Task<IActionResult> Update([FromBody] EditSpellModel model)
        {
            if (ModelState.IsValid)
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {

                    return await Core_UpdateSpell(model);
                }
                else
                {
                    return await UpdateSpellCommon(model);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async Task<IActionResult> UpdateSpellCommon(EditSpellModel model)
        {
            if (_spellService.CheckDuplicateSpell(model.Name.Trim(), model.RuleSetId, model.SpellId).Result)
                return BadRequest("The Spell Name " + model.Name + " had already been used. Please select another name.");

            var spellobj = _spellService.GetById(model.SpellId);
            var scIds = new List<int>();

            if (spellobj == null)
                return Ok("Spell not found");

            if (spellobj.SpellCommand.Count > 0)
                scIds.AddRange(spellobj.SpellCommand.Select(x => x.SpellCommandId).ToList());

            var spell = Mapper.Map<Spell>(model);
            var result = await _spellService.Update(spell);

            if (model.SpellCommandVM != null && model.SpellCommandVM.Count > 0)
            {
                if (scIds.Count > 0)
                {
                    foreach (var id in scIds)
                    {
                        if (model.SpellCommandVM.Where(x => x.SpellCommandId == id).FirstOrDefault() == null)
                            await _spellCommandService.DeleteSpellCommand(id);
                    }
                }

                foreach (var scViewModels in model.SpellCommandVM)
                {
                    if (scViewModels.SpellCommandId > 0)
                    {
                        await _spellCommandService.UdateSpellCommand(new SpellCommand()
                        {
                            SpellCommandId = scViewModels.SpellCommandId,
                            Command = scViewModels.Command,
                            Name = scViewModels.Name,
                            SpellId = scViewModels.SpellId
                        });
                    }
                    else
                    {
                        await _spellCommandService.InsertSpellCommand(new SpellCommand()
                        {
                            Command = scViewModels.Command,
                            Name = scViewModels.Name,
                            SpellId = result.SpellId
                        });
                    }
                }
            }
            else
            {
                if (scIds.Count > 0)
                {
                    foreach (var id in scIds)
                    {
                        await _spellCommandService.DeleteSpellCommand(id);
                    }
                }
            }


            return Ok();
        }

        [HttpDelete("Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Remove associated data -TODO
                await _spellService.Delete(id);
            }
            catch (Exception ex)
            {
                if (ex.InnerException.Message.Contains("The DELETE statement conflicted with the REFERENCE constraint"))
                    return BadRequest("Spell cannot be deleted, as it is associated with Character(s).");
            }

            return Ok();
        }
        [HttpPost("delete_up")]
        public async Task<IActionResult> Delete([FromBody] EditSpellModel model)
        {
            try
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    int SpellId = model.SpellId == null ? 0 : (int)model.SpellId;
                    if (!_coreRulesetService.IsSpellCopiedFromCoreRuleset(SpellId, rulesetID))
                    {
                        await CreateSpellForCopiedRuleset(model, true);
                        //return Ok();
                        // await UpdateItemMasterCommon(model);
                    }
                }
                await _spellService.Delete((int)model.SpellId);
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
                var _items = _coreRulesetService.GetSpellCountByRuleSetId(rulesetId);

                if (_items == 0)
                    return Ok(0);

                return Ok(_items);
            }
            else
            {
                var _items = _spellService.GetCountByRuleSetId(rulesetId);

                if (_items == 0)
                    return Ok(0);

                return Ok(_items);
            }
        }

        [HttpPost("upLoadSpellImageBlob")]
        public async Task<IActionResult> UpLoadSpellImageBlob()
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                if (httpPostedFile != null)
                {
                    try
                    {
                        BlobService bs = new BlobService(_httpContextAccessor, _accountManager);
                        var container = bs.GetCloudBlobContainer().Result;
                        string imageName = Guid.NewGuid().ToString();
                        dynamic Response = new ExpandoObject();
                        Response.ImageUrl = bs.UploadImages(httpPostedFile, imageName, container).Result;
                        Response.ThumbnailUrl = bs.UploadThumbnail(httpPostedFile, imageName, container).Result;

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
        [HttpPost("duplicateSpell")]
        public async Task<IActionResult> DuplicateSpell([FromBody] CreateSpellModel model)
        {
            if (ModelState.IsValid)
            {
                if (_spellService.CheckDuplicateSpell(model.Name.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Spell Name " + model.Name + " had already been used. Please select another name.");

                var spells = _spellService.GetById(model.SpellId);

                model.SpellId = 0;
                var spellModel = Mapper.Map<Spell>(model);
                var result = await _spellService.Create(spellModel);
                //var result = await _spellService.Create(model);

                foreach (var spellCommand in spells.SpellCommand)
                {
                    await _spellCommandService.InsertSpellCommand(new SpellCommand()
                    {
                        Command = spellCommand.Command,
                        Name = spellCommand.Name,
                        SpellId = result.SpellId
                    });
                }

                try
                {
                    //when duplcating from character
                    if (model.IsFromCharacter && model.IsFromCharacterId > 0)
                    {
                        await _characterSpellService.InsertCharacterSpell(new CharacterSpell
                        {
                            CharacterId = model.IsFromCharacterId,
                            SpellId = result.SpellId,
                            IsMemorized = result.Memorized
                        });

                        var ruleset = _ruleSetService.GetRuleSetById(result.RuleSetId);
                        return Ok("A new " + result.Name + " Spell has been duplicated in the "
                            + ruleset.Result.RuleSetName + " Rule Set. Any future updates will not affect the Spell."
                            + " If you wish to update the Spell you may do so from the Rule Sets interface.");
                    }
                }
                catch (Exception ex)
                { return BadRequest(ex.Message); }

                return Ok();
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("toggleMemorizedSpell")]
        public async Task<IActionResult> ToggleMemorizedSpell(int id)
        {
            _spellService.ToggleMemorizedSpell(id);

            return Ok();
        }

        //get user id methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }
        private async Task<IActionResult> Core_UpdateSpell(EditSpellModel model)
        {
            try
            {
                int SpellID = model.SpellId == null ? 0 : (int)model.SpellId;
                if (_coreRulesetService.IsSpellCopiedFromCoreRuleset(SpellID, (int)model.RuleSetId))
                {
                    return await UpdateSpellCommon(model);
                }
                else
                {
                    //var spell = Mapper.Map<Spell>(model);
                    return await CreateSpellForCopiedRuleset(model, null);

                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> CreateSpellForCopiedRuleset(EditSpellModel model, bool? IsDeleted = null)
        {
            int OldParentSpellID = (int)model.SpellId;
            Spell spell = new Spell();
            spell.CastingTime = model.CastingTime;
            spell.Class = model.Class;
            spell.Command = model.Command;
            spell.Description = model.Description;
            spell.EffectDescription = model.EffectDescription;
            spell.HitEffect = model.HitEffect;
            spell.ImageUrl = model.ImageUrl;
            spell.IsMaterialComponent = model.IsMaterialComponent;
            spell.IsSomaticComponent = model.IsSomaticComponent;
            spell.IsVerbalComponent = model.IsVerbalComponent;
            spell.Levels = model.Levels;
            spell.MaterialComponent = model.MaterialComponent;

            spell.Metatags = model.Metatags;
            spell.MissEffect = model.MissEffect;
            spell.Name = model.Name;
            spell.RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            spell.School = model.School;
            spell.ShouldCast = model.ShouldCast;
            spell.SpellId = model.SpellId == null ? 0 : (int)model.SpellId;
            spell.Stats = model.Stats;
            //spell.SpellCommand = model.SpellCommandVM;
            spell.IsDeleted = IsDeleted;

            if (model.IsFromCharacter)
            {
                var spellobj = _spellService.GetById(OldParentSpellID);
                spell.Memorized = spellobj.Memorized;
            }
            else
            {
                spell.Memorized = model.Memorized == null ? false : (bool)model.Memorized;
            }
            //var result = await _spellService.Create(spell);
            var result = await _coreRulesetService.CreateSpell(spell);

            if (model.SpellCommandVM != null && model.SpellCommandVM.Count > 0)
            {
                foreach (var scViewModels in model.SpellCommandVM)
                {
                    await _spellCommandService.InsertSpellCommand(new SpellCommand()
                    {
                        Command = scViewModels.Command,
                        Name = scViewModels.Name,
                        SpellId = result.SpellId,
                        IsDeleted = IsDeleted
                    });
                }
            }
            try
            {
                if (model.IsFromCharacter && model.IsFromCharacterId > 0)
                {
                    await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.IsFromCharacterId, OldParentSpellID, result.SpellId, 'S');

                    var ruleset = _ruleSetService.GetRuleSetById(result.RuleSetId);
                    //return Ok("A new " + result.Name + " Spell has been created in the "
                    //    + ruleset.Result.RuleSetName + " Rule Set. Any future updates will not affect the Spell."
                    //    + " If you wish to update the Spell you may do so from the Rule Sets interface.");
                    return Ok(result.Name + " Spell has been successfully created");
                }
                else
                {
                    var characterIDs = _coreRulesetService.GetCharactersByRulesetID(result.RuleSetId).Result.Select(p => p.CharacterId);
                    foreach (var item in characterIDs)
                    {
                        await _coreRulesetService._updateParentIDForAllRelatedItems(item, OldParentSpellID, result.SpellId, 'S');
                    }

                }
            }
            catch (Exception ex)
            { return BadRequest(ex.Message); }
            return Ok(result.SpellId);
        }

        #region API Using SP
        [HttpGet("getByRuleSetId_sp")]
        public async Task<IActionResult> getByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30)
        {
            dynamic Response = new ExpandoObject();
            var spellList = _spellService.SP_GetSpellsByRuleSetId(rulesetId, page, pageSize);
            Response.Spells = spellList; // Utilities.CleanModel<Spell>(spellList);
            if (spellList.Any())
            {
                Response.RuleSet = spellList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            return Ok(Response);
        }

        [HttpGet("getSpellCommands_sp")]
        public async Task<IActionResult> getSpellCommands_sp(int spellId)
        {
            return Ok(_spellService.SP_GetSpellCommands(spellId));
        }

        #endregion
    }
}