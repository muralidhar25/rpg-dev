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
    public class BuffAndEffectController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IBuffAndEffectService _buffAndEffectService;
        private readonly ICharacterAbilityService _characterAbilityService;
        private readonly IBuffAndEffectCommandService _buffAndEffectCommandService;
        private readonly IRuleSetService _ruleSetService;
        private readonly ICoreRuleset _coreRulesetService;
        private readonly ICharacterService _CharacterService;

        public BuffAndEffectController(IHttpContextAccessor httpContextAccessor, IBuffAndEffectService buffAndEffectService,
            IBuffAndEffectCommandService buffAndEffectCommandService, ICharacterAbilityService characterAbilityService,
            IRuleSetService ruleSetService, ICoreRuleset coreRulesetService, ICharacterService CharacterService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._buffAndEffectService = buffAndEffectService;
            this._characterAbilityService = characterAbilityService;
            this._buffAndEffectCommandService = buffAndEffectCommandService;
            this._ruleSetService = ruleSetService;
            this._coreRulesetService = coreRulesetService;
            this._CharacterService = CharacterService;
        }

        //[HttpGet("getall")]
        //public IEnumerable<BuffAndEffect> GetAll()
        //{
        //    return _buffAndEffectService.GetAll();
        //}

        [HttpGet("GetById")]
        public BuffAndEffectViewModel GetById(int id)
        {
            var buffAndEffect = _buffAndEffectService.GetById(id);

            if (buffAndEffect == null) return null;

            var _buffAndEffect = Mapper.Map<BuffAndEffectViewModel>(buffAndEffect);

            //var data = _characterAbilityService.GetByAbilityId(_buffAndEffect.BuffAndEffectId);
            //if (data != null)
            //{
            //    _ability.CharacterId = data.CharacterId ?? 0;
            //    _ability.Character = data.Character;
            //}

            return _buffAndEffect;
        }

        
             [HttpGet("getCharacterBuffAndEffectById")]
        public async Task<CharacterBuffAndEffectViewModel>  getCharacterBuffAndEffectById(int CharacterBuffAndEffectID)
        {
            CharacterBuffAndEffect buffAndEffect =await _buffAndEffectService.GetCharacterBuffAndEffectById(CharacterBuffAndEffectID);
            if (buffAndEffect==null)
            {
               
                return new CharacterBuffAndEffectViewModel();
            }
            CharacterBuffAndEffectViewModel model = new CharacterBuffAndEffectViewModel() {
                BuffAndEffectCommand = buffAndEffect.BuffAndEffect.BuffAndEffectCommand,
                BuffAndEffectId = buffAndEffect.BuffAndEffect.BuffAndEffectId,
                CharacterBuffAandEffectId = buffAndEffect.CharacterBuffAandEffectId,
                CharacterId = buffAndEffect.CharacterId == null ? 0 : (int)buffAndEffect.CharacterId,
                Command = buffAndEffect.BuffAndEffect.Command,
                CommandName = buffAndEffect.BuffAndEffect.CommandName,
                Description = buffAndEffect.BuffAndEffect.Description,
                ImageUrl = buffAndEffect.BuffAndEffect.ImageUrl,
                IsDeleted = buffAndEffect.BuffAndEffect.IsDeleted,
                Metatags = buffAndEffect.BuffAndEffect.Metatags,
                Name = buffAndEffect.BuffAndEffect.Name,
                ParentBuffAndEffectId = buffAndEffect.BuffAndEffect.ParentBuffAndEffectId,
                RuleSet = buffAndEffect.BuffAndEffect.RuleSet,
                RuleSetId = buffAndEffect.BuffAndEffect.RuleSetId,
                Stats = buffAndEffect.BuffAndEffect.Stats,
                Character = buffAndEffect.Character
            };

            return model;
        }
        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] CreateBuffAndEffectModel model, bool IsFromCharacter, int characterID)
        {
            if (ModelState.IsValid)
            {
                if (_buffAndEffectService.CheckDuplicateBuffAndEffect(model.Name.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Buff & Effect Name " + model.Name + " had already been used. Please select another name.");

                var buffAndEffect= Mapper.Map<BuffAndEffect>(model);
                var result = await _buffAndEffectService.Create(buffAndEffect);
                if (result !=null && IsFromCharacter && characterID>0)
                {
                    await AssignCreatedBuffToCharacter(characterID, result);
                }
                if (model.BuffAndEffectCommandVM != null && model.BuffAndEffectCommandVM.Count > 0)
                {
                    foreach (var acViewModels in model.BuffAndEffectCommandVM)
                    {
                        await _buffAndEffectCommandService.InsertBuffAndEffectCommand(new BuffAndEffectCommand()
                        {
                            Command = acViewModels.Command,
                            Name = acViewModels.Name,
                            BuffAndEffectId = result.BuffAndEffectId
                        });
                    }
                }

                return Ok(result);
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async Task AssignCreatedBuffToCharacter(int characterID, BuffAndEffect result)
        {
            List<BuffAndEffect> buffs = new List<BuffAndEffect>();
            buffs.Add(new BuffAndEffect() { BuffAndEffectId = result.BuffAndEffectId });
            List<Character> characters = new List<Character>();
            characters.Add(new Character() { CharacterId = characterID });
            List<BuffAndEffect> nonselectedbuffs = new List<BuffAndEffect>();
            List<Character> nonselectedcharacters = new List<Character>();
            await _buffAndEffectService.SP_AssignBuffAndEffectToCharacter(buffs, characters, nonselectedcharacters, nonselectedbuffs, 0);
        }

        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] EditBuffAndeffectModel model)
        {
            if (ModelState.IsValid)
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {

                    return await Core_UpdateBuffAndEffect(model);
                }
                else
                {
                    return await UpdateBuffAndEffectCommon(model);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async Task<IActionResult> UpdateBuffAndEffectCommon(EditBuffAndeffectModel model)
        {
            if (_buffAndEffectService.CheckDuplicateBuffAndEffect(model.Name.Trim(), model.RuleSetId, model.BuffAndEffectId).Result)
                return BadRequest("The Buff & Effect Name " + model.Name + " had already been used. Please select another name.");

            var buffAndEffectobj = _buffAndEffectService.GetById(model.BuffAndEffectId);
            var becIds = new List<int>();

            if (buffAndEffectobj == null)
                return Ok("Buff & Effect not found");

            if (buffAndEffectobj.BuffAndEffectCommand.Count > 0)
                becIds.AddRange(buffAndEffectobj.BuffAndEffectCommand.Select(x => x.BuffAndEffectCommandId).ToList());

            var buffAndEffect = Mapper.Map<BuffAndEffect>(model);

            var result = await _buffAndEffectService.Update(buffAndEffect);

            if (model.BuffAndEffectCommandVM != null && model.BuffAndEffectCommandVM.Count > 0)
            {
                if (becIds.Count > 0)
                {
                    foreach (var id in becIds)
                    {
                        if (model.BuffAndEffectCommandVM.Where(x => x.BuffAndEffectCommandId == id).FirstOrDefault() == null)
                            await _buffAndEffectCommandService.DeleteBuffAndEffectCommand(id);
                    }
                }

                foreach (var becViewModels in model.BuffAndEffectCommandVM)
                {
                    if (becViewModels.BuffAndEffectCommandId > 0)
                    {
                        await _buffAndEffectCommandService.UdateBuffAndEffectCommand(new BuffAndEffectCommand()
                        {
                            BuffAndEffectCommandId = becViewModels.BuffAndEffectCommandId,
                            Command = becViewModels.Command,
                            Name = becViewModels.Name,
                            BuffAndEffectId = becViewModels.BuffAndEffectId
                        });
                    }
                    else
                    {
                        await _buffAndEffectCommandService.InsertBuffAndEffectCommand(new BuffAndEffectCommand()
                        {
                            Command = becViewModels.Command,
                            Name = becViewModels.Name,
                            BuffAndEffectId = result.BuffAndEffectId
                        });
                    }
                }
            }
            else
            {
                if (becIds.Count > 0)
                {
                    foreach (var id in becIds)
                    {
                        await _buffAndEffectCommandService.DeleteBuffAndEffectCommand(id);
                    }
                }
            }

            

            return Ok();
        }

        //[HttpDelete("delete")]
        //public async Task<IActionResult> Delete(int id)
        //{
        //    try
        //    {
        //        // Remove associated data -TODO
        //        await _buffAndEffectService.Delete(id);
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ex.InnerException.Message.Contains("The DELETE statement conflicted with the REFERENCE constraint"))
        //            return BadRequest("Buff & Effect cannot be deleted, as it is associated with Character(s).");
        //    }

        //    return Ok();
        //}
        [HttpPost("delete_up")]
        public async Task<IActionResult> Delete([FromBody] EditBuffAndeffectModel model)
        {
            try
            {
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {
                    int BuffAndEffectId = model.BuffAndEffectId == null ? 0 : (int)model.BuffAndEffectId;
                    if (!_coreRulesetService.IsBuffAndEffectCopiedFromCoreRuleset(BuffAndEffectId, rulesetID))
                    {
                        await CreateBuffAndEffectForCopiedRuleset(model, true);
                        //return Ok();
                        // await UpdateItemMasterCommon(model);
                    }
                }
                await _buffAndEffectService.Delete((int)model.BuffAndEffectId);
                return Ok();
            }
            catch (Exception ex)
            {
                if (ex.InnerException.Message.Contains("The DELETE statement conflicted with the REFERENCE constraint"))
                    return BadRequest("Buff & Effect cannot be deleted, as it is associated with Character(s).");
                else
                    return BadRequest(ex.Message);
            }
        }

        [HttpGet("getCountByRuleSetId")]
        public async Task<IActionResult> getCountByRuleSetId(int rulesetId)
        {
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetId))
            {
                var _items = _coreRulesetService.GetBuffAndEffectCountByRuleSetId(rulesetId);

                if (_items == 0)
                    return Ok(0);

                return Ok(_items);
            }
            else
            {
                var _items = _buffAndEffectService.GetCountByRuleSetId(rulesetId);

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
        [HttpPost("duplicate")]
        public async Task<IActionResult> Duplicate([FromBody] CreateBuffAndEffectModel model, bool IsFromCharacter, int characterID)
        {
            if (ModelState.IsValid)
            {
                if (_buffAndEffectService.CheckDuplicateBuffAndEffect(model.Name.Trim(), model.RuleSetId).Result)
                    return BadRequest("The Buff & Effect Name " + model.Name + " had already been used. Please select another name.");

                var buffAndEffect = _buffAndEffectService.GetById(model.BuffAndEffectId);

                model.BuffAndEffectId = 0;
                var buffAndEffectModel = Mapper.Map<BuffAndEffect>(model);
                var result = await _buffAndEffectService.Create(buffAndEffectModel);
                if (result != null && IsFromCharacter && characterID > 0)
                {
                    await AssignCreatedBuffToCharacter(characterID, result);
                }
                //var result = await _abilityService.Create(model);

                foreach (var acViewModels in buffAndEffect.BuffAndEffectCommand)
                {
                    await _buffAndEffectCommandService.InsertBuffAndEffectCommand(new BuffAndEffectCommand()
                    {
                        Command = acViewModels.Command,
                        Name = acViewModels.Name,
                        BuffAndEffectId = result.BuffAndEffectId
                    });
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
        private async Task<IActionResult> Core_UpdateBuffAndEffect(EditBuffAndeffectModel model)
        {
            try
            {
                int BuffAndEffectId = model.BuffAndEffectId == null ? 0 : (int)model.BuffAndEffectId;
                if (_coreRulesetService.IsBuffAndEffectCopiedFromCoreRuleset(BuffAndEffectId, (int)model.RuleSetId))
                {
                    return await UpdateBuffAndEffectCommon(model);
                }
                else
                {
                    return await CreateBuffAndEffectForCopiedRuleset(model, null);

                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> CreateBuffAndEffectForCopiedRuleset(EditBuffAndeffectModel model, bool? IsDeleted = null)
        {
            BuffAndEffect buffAndEffectobj = new BuffAndEffect();
            int OldParentBuffAndEffectID = (int)model.BuffAndEffectId;
            BuffAndEffect buffAndEffect = new BuffAndEffect();
            buffAndEffect.BuffAndEffectCommand = model.BuffAndEffectCommandVM;
            buffAndEffect.BuffAndEffectId = model.BuffAndEffectId == null ? 0 : (int)model.BuffAndEffectId;
            buffAndEffect.Command = model.Command;
            buffAndEffect.Description = model.Description;
            buffAndEffect.ImageUrl = model.ImageUrl;
            buffAndEffect.Metatags = model.Metatags;
            buffAndEffect.Name = model.Name;
            buffAndEffect.RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            buffAndEffect.Stats = model.Stats;
            buffAndEffect.IsDeleted = IsDeleted;

           


            //var result = await _abilityService.Create(ability);
            var result = await _coreRulesetService.CreateBuffAndEffect(buffAndEffect);

            if (model.BuffAndEffectCommandVM != null && model.BuffAndEffectCommandVM.Count > 0)
            {
                foreach (var acViewModels in model.BuffAndEffectCommandVM)
                {
                    await _buffAndEffectCommandService.InsertBuffAndEffectCommand(new BuffAndEffectCommand()
                    {
                        Command = acViewModels.Command,
                        Name = acViewModels.Name,
                        BuffAndEffectId = result.BuffAndEffectId,
                        IsDeleted = IsDeleted
                    });
                }
            }
           
            return Ok(result.BuffAndEffectId);
        }
        [HttpGet("getByRuleSetId_add")]
        public IEnumerable<BuffAndEffect> getByRuleSetId_add(int rulesetId)
        {
            List<BuffAndEffect> result = _buffAndEffectService.GetByRuleSetId_add(rulesetId);
            return result;
        }
        #region API Using SP
        [HttpGet("getByRuleSetId_sp")]
        public async Task<IActionResult> getByRuleSetId_sp(int rulesetId, int page = 1, int pageSize = 30)
        {
            dynamic Response = new ExpandoObject();
            var buffAndEffectsList = _buffAndEffectService.SP_GetBuffAndEffectByRuleSetId(rulesetId, page, pageSize);
            Response.buffAndEffects = buffAndEffectsList; // Utilities.CleanModel<Ability>(abilityList);
            if (buffAndEffectsList.Any())
            {
                Response.RuleSet = buffAndEffectsList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            return Ok(Response);
        }

        [HttpGet("getCommands_sp")]
        public async Task<IActionResult> getCommands_sp(int buffAndEffectID)
        {
            return Ok(_buffAndEffectService.SP_GetBuffAndEffectCommands(buffAndEffectID));
        }
        [HttpGet("getBuffAndEffectAssignedToCharacter")]
        public async Task<IActionResult> getBuffAndEffectAssignedToCharacter(int characterID)
        {
            return Ok(await _buffAndEffectService.getBuffAndEffectAssignedToCharacter(characterID));
        }
        
        [HttpPost("assignBuffAndEffectToCharacter")]        
        public async Task<IActionResult> assignBuffAndEffectToCharacter([FromBody] AssignBuffAndEffect model, int CharacterID)
        {
            await _buffAndEffectService.SP_AssignBuffAndEffectToCharacter(model.buffAndEffectList, model.characters, model.nonSelectedCharacters, model.nonSelectedBuffAndEffectsList,CharacterID);
            return Ok();
        }

        [HttpGet("GetOnlyCharactersByRuleSetId")]
        public async Task<IActionResult> GetOnlyCharactersByRuleSetId(int id, int buffAndEffectId)
        {
            var characters = _CharacterService.GetOnlyCharacterRuleSetId(id, buffAndEffectId);

            //If Limited edition
            //if (characters != null && !IsAdminUser() && !isFromLootGiveScreen)
            //{
            //    await TotalCharacterSlotsAvailableForCurrentUser();
            //    characters = characters.Take(characters.Count >= TotalCharacterSlotsAvailable ? TotalCharacterSlotsAvailable : characters.Count).ToList();
            //}



            return Ok(characters);
        }
        [HttpPost("DeleteRecords")]
        public async Task<IActionResult> DeleteMultiBuffsAndEffects([FromBody] List<BuffAndEffect> model, int rulesetId)
        {
            try
            {
                _buffAndEffectService.DeleteMultiBuffsAndEffects(model, rulesetId);
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