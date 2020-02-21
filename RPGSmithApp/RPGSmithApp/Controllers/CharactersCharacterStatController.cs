﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Models;
using DAL.Models.SPModels;
using DAL.Services;
using DAL.ViewModelProc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class CharactersCharacterStatController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICharactersCharacterStatService _charactersCharacterStatServic;
        private readonly ICharacterStatChoiceService _characterStatChoiceService;
        private readonly ICharacterStatDefaultValueService _characterStatDefaultValueService;
        private readonly ICharacterStatConditionService _characterStatConditionService;
        private readonly ICharacterStatService _CharacterStatService;


        public CharactersCharacterStatController(IHttpContextAccessor httpContextAccessor, ICharactersCharacterStatService charactersCharacterStatServic,
            ICharacterStatChoiceService characterStatChoiceService, ICharacterStatDefaultValueService characterStatDefaultValueService,
            ICharacterStatConditionService characterStatConditionService, ICharacterStatService characterStatService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._charactersCharacterStatServic = charactersCharacterStatServic;
            this._characterStatChoiceService = characterStatChoiceService;
            this._characterStatDefaultValueService = characterStatDefaultValueService;
            this._characterStatConditionService = characterStatConditionService;
            this._CharacterStatService = characterStatService;
        }

        [HttpGet("getByCharacterId")]
        public IEnumerable<CharactersCharacterStatViewModel> GetByCharacterId(int characterId, int page = 1, int pageSize = 10)
        {



            //var data = _charactersCharacterStatServic.GetByCharacterId(characterId, page, pageSize);
            var data = _charactersCharacterStatServic.GetByCharacterId_sp(characterId, page, pageSize);
            List<CharactersCharacterStatViewModel> CharactersCharacterStatVievModels = utility.GetCharCharStatViewModelList(data,_characterStatChoiceService);
            //foreach (var ccs in CharactersCharacterStatVievModels)
            //{
            //    ccs.Character.CharactersCharacterStats = null;
            //    //ccs.Character.CharacterAbilities = null;
            //    //ccs.Character.CharacterSpells = null;
            //    ccs.Character.CharacterTiles = null;
            //}
            return Utilities.CleanModel<CharactersCharacterStatViewModel>(CharactersCharacterStatVievModels);
            // return CharactersCharacterStatVievModels;

        }

       

        [HttpGet("getStatListByCharacterId")]
        public IEnumerable<CharactersCharacterStatViewModel> GetStatListByCharacterId(int characterId, int page = 1, int pageSize = 10)
        {

            List<CharactersCharacterStatViewModel> CharactersCharacterStatVievModels = new List<CharactersCharacterStatViewModel>();

            CharactersCharacterStatViewModel CharactersCharacterStatVievModel;

            var data = _charactersCharacterStatServic.GetStatListByCharacterId(characterId, page, pageSize);

            foreach (CharactersCharacterStat item in data)
            {
                CharactersCharacterStatVievModel = Mapper.Map<CharactersCharacterStatViewModel>(item);

                //if (item.CharacterStat.CharacterStatType.StatTypeName == "Choice" && item.CharacterStat.isMultiSelect == true && (item.MultiChoice != null || item.MultiChoice != string.Empty))
                //{
                //    CharactersCharacterStatVievModel.SelectedCharacterChoices = _characterStatChoiceService.GetByIds(item.MultiChoice);
                //}

                //if (item.CharacterStat.CharacterStatType.StatTypeName == "Choice" && item.CharacterStat.isMultiSelect == false && (item.Choice != null || item.Choice != string.Empty))
                //{
                //    CharactersCharacterStatVievModel.SelectedCharacterChoices = _characterStatChoiceService.GetByIds(item.Choice);
                //}

                CharactersCharacterStatVievModels.Add(CharactersCharacterStatVievModel);
            }
            //foreach (var ccs in CharactersCharacterStatVievModels)
            //{
            //    ccs.Character.CharactersCharacterStats = null;
            //    //ccs.Character.CharacterAbilities = null;
            //    //ccs.Character.CharacterSpells = null;
            //    ccs.Character.CharacterTiles = null;
            //}
            return Utilities.CleanModel<CharactersCharacterStatViewModel>(CharactersCharacterStatVievModels);
            // return CharactersCharacterStatVievModels;

        }

        [HttpGet("GetNumericStatsByCharacterId")]
        public IEnumerable<CharactersCharacterStat> GetNumericStatsByCharacterId(int characterId, int page = 1, int pageSize = 10)
        {

            var CharactersCharacterStats = _charactersCharacterStatServic.GetNumericStatsByCharacterId(characterId, page, pageSize);
            return Utilities.CleanModel<CharactersCharacterStat>(CharactersCharacterStats);
            //return CharactersCharacterStats;
        }

        [HttpGet("GetNumericStatsByRulesetId")]
        public IEnumerable<CharacterStat> GetNumericStatsByRulesetId_Old(int rulesetId, int page = 1, int pageSize = 10)
        {

            var CharacterStats = _charactersCharacterStatServic.GetNumericStatsByRulesetId(rulesetId, page, pageSize);
            return Utilities.CleanModel<CharacterStat>(CharacterStats);
            //return CharactersCharacterStats;
        }

        //public IEnumerable<CharacterStat> GetNumericStatsByRulesetId(int rulesetId, int page = 1, int pageSize = 10)
        //{

        //    var CharacterStats = _charactersCharacterStatServic.GetNumericStatsByRulesetId(rulesetId, page, pageSize);
        //    return Utilities.CleanModel<CharacterStatSP>(CharacterStats);
        //    //return CharactersCharacterStats;
        //}


        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] CharactersCharacterStat model)
        {
            if (ModelState.IsValid)
            {
              
                try
                {
                      _charactersCharacterStatServic.Create(model);
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
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Update([FromBody] CharactersCharacterStat model)
        {
            if (ModelState.IsValid)
            {

                try
                {
                   await _charactersCharacterStatServic.Update(model);
                    //LogStatUpdate logStat = new LogStatUpdate();
                    //logStat.CharacterStatId = model.CharacterStatId;
                    //logStat.CharacterId = model.CharacterId;
                    //await _CharacterStatService.SaveLogStat(logStat);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("updatelist")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> UpdateList([FromBody] List<CharactersCharacterStat> model, bool AlertToGM, bool AlertToPlayer)
        {
            if (ModelState.IsValid)
            {

                try
                {
                    _charactersCharacterStatServic.Update(model, AlertToGM, AlertToPlayer);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpGet("getLinkTypeRecords")]
        public IEnumerable<LinkTypeRecord> getLinkTypeRecords(int characterId)
        {
            return _charactersCharacterStatServic.getLinkTypeRecords(characterId);
        }

        [HttpGet("getConditionsValuesList")]
        public async Task<IActionResult> GetConditionsValuesList(int characterId)
        {
            List<CharactersCharacterStatViewModel> ResultList = new List<CharactersCharacterStatViewModel>();
            CharactersCharacterStatViewModel CharactersCharacterStatVievModel = new CharactersCharacterStatViewModel();
            List<CharactersCharacterStat> data = await _charactersCharacterStatServic.GetConditionsValuesList(characterId);
            foreach (CharactersCharacterStat item in data)
            {
                CharactersCharacterStatVievModel = new CharactersCharacterStatViewModel()
                {
                    CalculationResult = item.CalculationResult,
                    CharacterId = item.CharacterId,
                    CharactersCharacterStatId = item.CharactersCharacterStatId,
                    CharacterStatId = item.CharacterStatId,
                    Choice = item.Choice,
                    Command = item.Command,
                    Current = item.Current,
                    IsDeleted = item.IsDeleted,
                    Maximum = item.Maximum,
                    MultiChoice = item.MultiChoice,
                    Number = item.Number,
                    OnOff = item.OnOff,
                    RichText = item.RichText,
                    SubValue = item.SubValue,
                    Text = item.Text,
                    Value = item.Value,
                    YesNo = item.YesNo,
                    ComboText = item.ComboText,
                    DefaultValue = item.DefaultValue,
                    Minimum = item.Minimum,
                    Display = item.Display,
                    IsCustom = item.IsCustom,
                    IsOn = item.IsOn,
                    IsYes = item.IsYes,
                    ShowCheckbox = item.ShowCheckbox,
                    LinkType = item.LinkType,
                    CharacterStat = new CharacterStat()
                    {        CharacterStatId= item.CharacterStat.CharacterStatId,
                        CharacterStatTypeId = item.CharacterStat.CharacterStatTypeId,
                        StatName= item.CharacterStat.StatName,
                        isMultiSelect= item.CharacterStat.isMultiSelect,
                        CharacterStatChoices = item.CharacterStat.CharacterStatChoices.Select(z => new CharacterStatChoice
                        {
                            CharacterStatChoiceId = z.CharacterStatChoiceId,
                            CharacterStatId = z.CharacterStatId,
                            IsDeleted = z.IsDeleted,
                            StatChoiceValue = z.StatChoiceValue
                        }).ToList(),
                        CharacterStatConditions=item.CharacterStat.CharacterStatConditions.Select(z => new CharacterStatCondition() {
                           CharacterStatConditionId =z.CharacterStatConditionId,
                            CharacterStatId= z.CharacterStatId,
                            ConditionOperatorID= z.ConditionOperatorID,
                            IfClauseStatText= z.IfClauseStatText,
                            IsNumeric= z.IsNumeric,
                            CompareValue= z.CompareValue,
                            Result= z.Result,
                            SortOrder= z.SortOrder,
                            ConditionOperator=z.ConditionOperator,
                        }).ToList(),
                        CharacterStatCalcs= item.CharacterStat.CharacterStatCalcs.Select(z => new CharacterStatCalc()
                        {
                           CharacterStatCalcId=z.CharacterStatCalcId,
                           CharacterStatId=z.CharacterStatId,
                           IsDeleted=z.IsDeleted,
                           StatCalculation=z.StatCalculation,
                           StatCalculationIds=z.StatCalculationIds,
                        }).ToList(),
                    }

                };
                ResultList.Add(CharactersCharacterStatVievModel);
            }
            return Ok(ResultList);
        }
        [HttpGet("getCharCharStatDetails")]
        public async Task<IActionResult> getCharCharStatDetails(int characterId)
        {
            var res = _charactersCharacterStatServic.getCharCharStatDetails(characterId);
            
            return Ok(res);
        }

    }
}