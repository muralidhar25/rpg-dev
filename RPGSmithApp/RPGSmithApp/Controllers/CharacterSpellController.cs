using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.Helpers.CoreRuleset;
using RPGSmithApp.ViewModels;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class CharacterSpellController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICharacterSpellService _characterSpellService;
        private readonly ICoreRuleset _coreRulesetService;
        private readonly ISpellService _spellService;
        private readonly ISpellCommandService _spellCommandService;

        public CharacterSpellController(IHttpContextAccessor httpContextAccessor, ICharacterSpellService characterSpellService, ICoreRuleset coreRulesetService, ISpellService spellService, ISpellCommandService spellCommandService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._characterSpellService = characterSpellService;
            this._coreRulesetService = coreRulesetService;
            this._spellService = spellService;
            this._spellCommandService = spellCommandService;
        }

        [HttpGet("getall")]
        [ProducesResponseType(200, Type = typeof(IEnumerable<CharacterSpell>))]
        public IActionResult GetAll()
        {
            var characterSpells = _characterSpellService.GetAll();

            if (characterSpells == null || characterSpells.Count == 0)
                return NotFound("Empty Records");

            return Ok(characterSpells);
        }

        [HttpGet("GetById")]
        [ProducesResponseType(200, Type = typeof(CharacterSpell))]
        public IActionResult GetById(int id)
        {
            var characterSpell = _characterSpellService.GetById(id);

            if (characterSpell == null)
                return NotFound("Record not found");

            return Ok(characterSpell);
        }

        [HttpGet("getByCharacterId")]
       // [ProducesResponseType(200, Type = typeof(IEnumerable<CharacterSpell>))]
        public IEnumerable<CharacterSpell> GetByCharacterId(int characterId)
        {
            var characterSpells = _characterSpellService.GetByCharacterId(characterId);

            if (characterSpells == null || characterSpells.Count == 0)
                return new List<CharacterSpell>();
            foreach (var item in characterSpells)
            {
                item.Character.CharacterSpells = null;
            }
            return Utilities.CleanModel<CharacterSpell>(characterSpells);
            //return characterSpells;
        }

        [HttpGet("getAllByCharacterId")]
        public IEnumerable<CharacterSpell> GetAllByCharacterId(int characterId, int page = 1, int pageSize = 6)
        {
            var characterSpells = _characterSpellService.GetByCharacterId(characterId,page,pageSize);

            if (characterSpells == null || characterSpells.Count == 0)
                return new List<CharacterSpell>();

            return characterSpells;

        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CharacterSpellViewModel model)
        {
            if (ModelState.IsValid)
            {

                foreach (var spell in model.MultiSpells)
                {
                    try
                    {
                        (bool IsExist, string name) = _characterSpellService.CheckCharacterSpellExist(model.CharacterId ?? 0, spell.SpellId);
                        if (IsExist)
                            return BadRequest("Spell '" + name + "' already added.");
                    }
                    catch (Exception ex)
                    {
                        return BadRequest("Something went wrong. Please try again later.");
                    }
                }
                foreach (var spell in model.MultiSpells)
                {
                    try
                    {
                        var result = await _characterSpellService.InsertCharacterSpell(new CharacterSpell
                        {
                            SpellId = spell.SpellId,
                            CharacterId = model.CharacterId,
                            IsMemorized = model.IsMemorized
                        });
                    }
                    catch (Exception ex) { }
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] CharacterSpell model)
        {
            if (ModelState.IsValid)
            {

                var characterSpell = _characterSpellService.GetById(model.CharacterSpellId);

                if (characterSpell == null)
                    return BadRequest("Character Spell not found");


                var result = await _characterSpellService.UpdateCharacterSpell(model);

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }


        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            await _characterSpellService.DeleteCharacterSpell(id);

            return Ok();
        }
        [HttpDelete("delete_up")]
        public async Task<IActionResult> Delete(int Id, int RulesetID)
        {
            var charSpell = _characterSpellService.GetById(Id);
            int rulesetID = RulesetID;
            if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
            {
                await Core_DeleteCharacterSpell(charSpell, rulesetID);
            }
            await _characterSpellService.DeleteCharacterSpell(Id);

            return Ok();
        }

        private async Task<IActionResult> Core_DeleteCharacterSpell(CharacterSpell model, int rulesetID)
        {
            int SpellId = model.SpellId == null ? 0 : (int)model.SpellId;
            if (!_coreRulesetService.IsSpellCopiedFromCoreRuleset(SpellId, (int)model.Character.RuleSetId))
            {
                int OldParentSpellId = SpellId;
                var spellToCreate = _spellService.GetById(model.SpellId);
                int SpellIdInserted = CreateSpellForCopiedRuleset(spellToCreate, rulesetID).Result.SpellId;
                //model.ItemMasterId = ItemMasterIDInserted;
                //model.ParentItemId = ItemMasterIDInserted;
                await _coreRulesetService._updateParentIDForAllRelatedItems((int)model.CharacterId, OldParentSpellId, SpellIdInserted, 'S');
            }
            return Ok();
        }

        private async Task<Spell> CreateSpellForCopiedRuleset(Spell model,int rulesetID)
        {
            int OldParentSpellID = (int)model.SpellId;
            Spell spell = new Spell();
            spell.CastingTime = model.CastingTime;
            spell.Class = model.Class;
            spell.Command = model.Command;
            spell.CommandName = model.CommandName;
            spell.Description = model.Description;
            spell.EffectDescription = model.EffectDescription;
            spell.HitEffect = model.HitEffect;
            spell.ImageUrl = model.ImageUrl;
            spell.IsMaterialComponent = model.IsMaterialComponent;
            spell.IsSomaticComponent = model.IsSomaticComponent;
            spell.IsVerbalComponent = model.IsVerbalComponent;
            spell.Levels = model.Levels;
            spell.MaterialComponent = model.MaterialComponent;
            spell.Memorized = model.Memorized == null ? false : (bool)model.Memorized;
            spell.Metatags = model.Metatags;
            spell.MissEffect = model.MissEffect;
            spell.Name = model.Name;
            spell.RuleSetId = rulesetID;
            spell.School = model.School;
            spell.ShouldCast = model.ShouldCast;
            spell.SpellId = model.SpellId == null ? 0 : (int)model.SpellId;
            spell.Stats = model.Stats;


            //var result = await _spellService.Create(spell);
            var result = await _coreRulesetService.CreateSpell(spell);

            if (model.SpellCommand != null && model.SpellCommand.Count > 0)
            {
                foreach (var scViewModels in model.SpellCommand)
                {
                    await _spellCommandService.InsertSpellCommand(new SpellCommand()
                    {
                        Command = scViewModels.Command,
                        Name = scViewModels.Name,
                        SpellId = result.SpellId
                    });
                }
            }
            
            return result;
        }

        [HttpGet("getCountByCharacterId")]
        public async Task<IActionResult> GetCountByCharacterId(int characterId)
        {
            var _items = _characterSpellService.GetCountByCharacterId(characterId);

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }


        [HttpPost("toggleMemorizedCharacterSpell")]
        public async Task<IActionResult> ToggleMemorizedCharacterSpell(int id)
        {
            _characterSpellService.ToggleMemorizedCharacterSpell(id);

            return Ok();
        }

        #region API_UsingSP
        [HttpGet("getByCharacterId_sp")]
        public async Task<IActionResult> getByCharacterId_sp(int characterId, int rulesetId, int page = 1, int pageSize = 30, int sortType = 1)
        {
            dynamic Response = new ExpandoObject();
            (List<CharacterSpell> CharacterSpellList, Character _character, RuleSet _ruleSet) = _characterSpellService.SP_CharacterSpell_GetByCharacterId(characterId, rulesetId, page, pageSize, sortType);

            Response.CharacterSpellList = CharacterSpellList;
            Response.Character = _character;
            Response.RuleSet = _ruleSet;

            return Ok(Response);
        }

        #endregion

    }
}