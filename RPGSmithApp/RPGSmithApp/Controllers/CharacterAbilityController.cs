using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.Helpers.CoreRuleset;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.EditModels;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class CharacterAbilityController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICharacterAbilityService _characterAbilityService;
        private readonly IAbilityService _abilityService;
        private readonly ICoreRuleset _coreRulesetService;
        private readonly IAbilityCommandService _abilityCommandService;
        private readonly IRuleSetService _ruleSetService;

        public CharacterAbilityController(IHttpContextAccessor httpContextAccessor, ICharacterAbilityService characterAbilityService,
            IAbilityService abilityService, ICoreRuleset coreRulesetService, IAbilityCommandService abilityCommandService, IRuleSetService ruleSetService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._characterAbilityService = characterAbilityService;
            this._abilityService = abilityService;
            this._coreRulesetService = coreRulesetService;
            this._abilityCommandService = abilityCommandService;
            this._ruleSetService = ruleSetService;
        }

        [HttpGet("getall")]
        [ProducesResponseType(200, Type = typeof(IEnumerable<CharacterAbility>))]
        public IActionResult GetAll()
        {
            var characterAbilities = _characterAbilityService.GetAll();

            if (characterAbilities == null || characterAbilities.Count == 0)
                return NotFound("Empty Records");

            return Ok(characterAbilities);
        }

        [HttpGet("GetById")]
        [ProducesResponseType(200, Type = typeof(CharacterAbility))]
        public IActionResult GetById(int id)
        {
            var characterAbility = _characterAbilityService.GetById(id);

            if(characterAbility==null)
                return NotFound("Record not found"); 

            return Ok(characterAbility);
        }

        [HttpGet("getByCharacterId")]
        //[ProducesResponseType(200, Type = typeof(IEnumerable<CharacterAbility>))]
        public IEnumerable<CharacterAbility> GetByCharacterId(int characterId)
        {
            var characterAbilities = _characterAbilityService.GetByCharacterId(characterId);

            if (characterAbilities == null || characterAbilities.Count == 0)
                return new List<CharacterAbility>();

            //foreach (var item in characterAbilities)
            //{
            //    item.Character.CharacterAbilities = null;
            //}
           // return Utilities.CleanModel <CharacterAbility> (characterAbilities);

            return characterAbilities;

        }
        [HttpGet("GetAbilityByCharacterId")]
        //[ProducesResponseType(200, Type = typeof(IEnumerable<CharacterAbility>))]
        public IEnumerable<CharacterAbility> GetAbilityByCharacterId(int characterId)
        {
            List<CharacterAbility> characterAbilities = _characterAbilityService.GetAbilityByCharacterId(characterId);

            if (characterAbilities == null || characterAbilities.Count == 0)
                return new List<CharacterAbility>();

            //foreach (var item in characterAbilities)
            //{
            //    item.Character.CharacterAbilities = null;
            //}
            // return Utilities.CleanModel <CharacterAbility> (characterAbilities);

            return characterAbilities;

        }
        

        [HttpGet("getAllByCharacterId")]
      
        public IEnumerable<CharacterAbility> GetAllByCharacterId(int characterId, int page = 1, int pageSize = 6)
        {
            var characterAbilities = _characterAbilityService.GetByCharacterId(characterId,page,pageSize);

            if (characterAbilities == null || characterAbilities.Count == 0)
                return new List<CharacterAbility>();

          
            return characterAbilities;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CharacterAbilityViewModel model)
        {
            if (ModelState.IsValid)
            {
                foreach (var ability in model.MultiAbilities)
                {
                    try
                    {
                        (bool IsExist, string name) = _characterAbilityService.CheckCharacterAbilityExist(model.CharacterId ?? 0, ability.AbilityId);
                        if (IsExist)
                            return BadRequest("Ability '" + name + "' already added.");
                    }
                    catch (Exception ex)
                    {
                        return BadRequest("Something went wrong. Please try again later.");
                    }
                    
                }
                foreach (var ability in model.MultiAbilities)
                {
                    var _ability =  _abilityService.GetById(ability.AbilityId);
                    try
                    {
                        var result = await _characterAbilityService.InsertCharacterAbility(new CharacterAbility
                        {
                            AbilityId = ability.AbilityId,
                            CharacterId = model.CharacterId,
                            IsEnabled = model.IsEnabled,
                            MaxNumberOfUses = _ability.MaxNumberOfUses,
                            CurrentNumberOfUses = _ability.CurrentNumberOfUses
                        });
                    }
                    catch (Exception ex)
                    {
                    }
                    
                }
            
                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] CharacterAbility model)
        {
            if (ModelState.IsValid)
            {

                var characterAbility = _characterAbilityService.GetById(model.CharacterAbilityId);
               
                if (characterAbility == null)
                    return BadRequest("Character Ability not found");

           
                var result = await _characterAbilityService.UpdateCharacterAbility(model);

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }


        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            await _characterAbilityService.DeleteCharacterAbility(id);

            return Ok();
        }


        [HttpPost("delete_up")]
        public async Task<IActionResult> Delete(int Id, int RulesetID)
        {
            var charAbility = _characterAbilityService.GetById(Id);
            int rulesetID = RulesetID;
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
            {
                await Core_DeleteCharacterAbility(charAbility, rulesetID);
            }
            
                await _characterAbilityService.DeleteCharacterAbility(Id);

                return Ok();
           
            
        }
        [HttpPost("RemoveAbilities")]
        public async Task<IActionResult> removeMultiAbilities([FromBody] List<CharacterAbility> model, int rulesetId)
        {
            try
            {
                _characterAbilityService.removeMultiAbilities(model, rulesetId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        private async Task<IActionResult> Core_DeleteCharacterAbility(CharacterAbility model, int rulesetID)
        {
           
                int AbilityId = model.AbilityId == null ? 0 : (int)model.AbilityId;
                if (!_coreRulesetService.IsAbilityCopiedFromCoreRuleset(AbilityId, (int)model.Character.RuleSetId))
                {
                    int OldParentAbilityId = AbilityId;
                var abilityToCreate = _abilityService.GetById(model.AbilityId);
                int AbilityIdInserted = CreateAbilityForCopiedRuleset(abilityToCreate, rulesetID).Result.AbilityId;
                    //model.ItemMasterId = ItemMasterIDInserted;
                    //model.ParentItemId = ItemMasterIDInserted;
                     await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.CharacterId, OldParentAbilityId, AbilityIdInserted, 'A');
                }
            return Ok();
           
        }

        [HttpGet("getCountByCharacterId")]
        public async Task<IActionResult> GetCountByCharacterId(int characterId)
        {
            var _items = _characterAbilityService.GetCountByCharacterId(characterId);

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }


        [HttpPost("toggleEnableCharacterAbility")]
        public async Task<IActionResult> ToggleEnableCharacterAbility(int id)
        {
            _characterAbilityService.ToggleEnableCharacterAbility(id);

            return Ok();
        }
        private async Task<Ability> CreateAbilityForCopiedRuleset(Ability model, int rulesetID)
        {
            int OldParentAbilityID = (int)model.AbilityId;
            Ability ability = new Ability();
            ability.AbilityCommand = model.AbilityCommand;
            ability.AbilityId = model.AbilityId == null ? 0 : (int)model.AbilityId;
            ability.Command = model.Command;
            ability.CurrentNumberOfUses = model.CurrentNumberOfUses == null ? 0 : (int)model.CurrentNumberOfUses;
            ability.Description = model.Description;
            ability.ImageUrl = model.ImageUrl;
            ability.IsEnabled = model.IsEnabled == null ? false : (bool)model.IsEnabled;
            ability.Level = model.Level;
            ability.MaxNumberOfUses = model.MaxNumberOfUses == null ? 0 : (int)model.MaxNumberOfUses;
            ability.Metatags = model.Metatags;
            ability.Name = model.Name;
            ability.RuleSetId = rulesetID;
            ability.Stats = model.Stats;


            //var result = await _abilityService.Create(ability);
            var result = await _coreRulesetService.CreateAbility(ability,model.AbilityBuffAndEffects.ToList());
            //var result = await _abilityService.Create(ability);
            //var result = await _coreRulesetService.CreateAbility(model);

            if (model.AbilityCommand != null && model.AbilityCommand.Count > 0)
            {
                foreach (var acViewModels in model.AbilityCommand)
                {
                    await _abilityCommandService.InsertAbilityCommand(new AbilityCommand()
                    {
                        Command = acViewModels.Command,
                        Name = acViewModels.Name,
                        AbilityId = result.AbilityId
                    });
                }
            }
            
            return result;
        }


        #region API_UsingSP
        [HttpGet("getByCharacterId_sp")]
        public async Task<IActionResult> getByCharacterId_sp(int characterId, int rulesetId, int page = 1, int pageSize = 30, int sortType = 1)
        {
            dynamic Response = new ExpandoObject();
            (CharacterAbilityListWithFilterCount characterAbilityresult, Character _character, RuleSet _ruleSet) = _characterAbilityService.SP_CharacterAbility_GetByCharacterId(characterId, rulesetId, page, pageSize, sortType);
            var characterAbilityList = characterAbilityresult.AbilityList;
            Response.characterAbilityList = characterAbilityList;
            Response.Character = _character;
            Response.RuleSet = _ruleSet;
            Response.FilterAplhabetCount = characterAbilityresult.FilterAplhabetCount;
            Response.FilterEnabledCount = characterAbilityresult.FilterEnabledCount;
            Response.FilterLevelCount = characterAbilityresult.FilterLevelCount;

            return Ok(Response);
        }

        //[HttpGet("AbilitySpellForItemsByRuleset_sp")]
        //public async Task<IActionResult> AbilitySpellForItemsByRuleset_sp(int rulesetId, int itemMasterId)
        //{
        //    return Ok(_itemMasterService.AbilitySpellForItemsByRuleset_sp(rulesetId, itemMasterId));
        //}
        #endregion
    }
}