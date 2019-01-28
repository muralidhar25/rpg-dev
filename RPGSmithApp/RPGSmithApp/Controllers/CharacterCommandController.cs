using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.EditModels;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class CharacterCommandController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICharacterCommandService _characterCommandService;
        private readonly ICharacterService _characterService;

        public CharacterCommandController(IHttpContextAccessor httpContextAccessor, ICharacterCommandService characterCommandService,
            ICharacterService characterService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._characterCommandService = characterCommandService;
            this._characterService = characterService;
        }
        
        [HttpGet("getById")]
        public CharacterCommand GetById(int id)
        {
            return _characterCommandService.GetById(id);
        }

        [HttpGet("getByCharacterId")]
        public IEnumerable<CharacterCommand> GetByCharacterId(int characterId)
        {
            var list = _characterCommandService.GetByCharacterId(characterId);

            if (list == null)
                return new List<CharacterCommand>();

            return list.OrderByDescending(x => x.UpdatedOn).ToList();
        }

        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] CharacterCommandViewModel model)
        {
            if (ModelState.IsValid)
            {
                if (_characterCommandService.CheckDuplicateCharacterCommand(model.Name.Trim(), model.CharacterId).Result)
                    return BadRequest("'"+ model.Name + "' Duplicate Character Command");

                var _characterCommand = Mapper.Map<CharacterCommand>(model);

                _characterCommand.CreatedOn = DateTime.Now;
                _characterCommand.UpdatedOn = DateTime.Now;
                var result = await _characterCommandService.Create(_characterCommand);

                try
                {
                    if (model.CharacterId > 0)
                    {
                        await _characterService.UpdateCharacterLastCommand(new Character
                        {
                            CharacterId = model.CharacterId,
                            LastCommand = model.Command,
                            LastCommandResult = model.CommandResult,
                            LastCommandValues = model.LastCommandValues
                        });
                    }
                }
                catch { }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("update")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Update([FromBody] CharacterCommandViewModel model)
        {
            if (ModelState.IsValid)
            {
                if (_characterCommandService.CheckDuplicateCharacterCommand(model.Name.Trim(), model.CharacterId,model.CharacterCommandId).Result)
                    return BadRequest("Duplicate Character Command");

                var _characterCommand = Mapper.Map<CharacterCommand>(model);

                _characterCommand.UpdatedOn = DateTime.Now;
                var result = await _characterCommandService.Update(_characterCommand);

                try
                {
                    if (model.CharacterId > 0)
                    {
                        await _characterService.UpdateCharacterLastCommand(new Character
                        {
                            CharacterId = model.CharacterId,
                            LastCommand = model.Command,
                            LastCommandResult = model.CommandResult,
                            LastCommandValues = model.LastCommandValues
                        });
                    }
                }
                catch { }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _characterCommandService.Delete(id);          
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("UpdateLastCommand")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] LastCommandViewModel model)
        {
            if (ModelState.IsValid)
            {
                await _characterService.UpdateCharacterLastCommand(new Character
                {
                    CharacterId = model.CharacterId,
                    LastCommand = model.LastCommand,
                    LastCommandResult = model.LastCommandResult,
                    LastCommandValues = model.LastCommandValues
                });

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

    }
}