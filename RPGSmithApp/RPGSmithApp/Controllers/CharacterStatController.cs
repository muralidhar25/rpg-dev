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
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using static RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{

    // [Authorize]
    [Route("api/[controller]")]
    public class CharacterStatController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ICharacterStatService _CharacterStatService;
        private readonly ICharacterStatCalcService _CharacterStatCalcService;
        private readonly ICharacterStatChoiceService _CharacterStatChoiceService;
        private readonly ICharacterStatComboService _CharacterStatComboService;
        private readonly ICharacterStatToggleService _CharacterStatToggleService;
        private readonly ICharacterStatDefaultValueService _characterStatDefaultValueService;
        private readonly ICharacterStatConditionService _characterStatConditionService;
        private readonly ICustomToggleService _CustomToggleService;
        private readonly ICharacterStatTypeService _CharacterStatTypeService;
        private readonly ICharacterService _CharacterService;
        private readonly ICharactersCharacterStatService _charactersCharacterStatServic;
        private readonly ICoreRuleset _coreRulesetService;
        private readonly ICommonFuncsCoreRuleSet _commonFuncsCoreRuleSet;
        private readonly IRuleSetService _ruleSetService;

        //private readonly BlobService bs = new BlobService();

        public CharacterStatController(ICharacterStatService CharacterStatService, ICharacterStatCalcService CharacterStatCalcService,
            ICharacterStatChoiceService CharacterStatChoiceService, ICharacterStatTypeService CharacterStatTypeService, ICharacterStatComboService CharacterStatComboService,
            IHttpContextAccessor httpContextAccessor, IAccountManager accountManager, ICharacterService characterService,
            ICharacterStatToggleService CharacterStatToggleService, ICustomToggleService CustomToggleService,
            ICharactersCharacterStatService charactersCharacterStatServic, ICoreRuleset coreRulesetService, ICommonFuncsCoreRuleSet commonFuncsCoreRuleSet, IRuleSetService ruleSetService, ICharacterStatDefaultValueService characterStatDefaultValueService, ICharacterStatConditionService characterStatConditionService)
        {
            _CharacterStatService = CharacterStatService;
            _CharacterStatCalcService = CharacterStatCalcService;
            _CharacterStatChoiceService = CharacterStatChoiceService;
            _CharacterStatComboService = CharacterStatComboService;
            _CharacterStatToggleService = CharacterStatToggleService;
            _CustomToggleService = CustomToggleService;
            _CharacterStatTypeService = CharacterStatTypeService;
            _httpContextAccessor = httpContextAccessor;
            _CharacterService = characterService;
            _accountManager = accountManager;
            _charactersCharacterStatServic = charactersCharacterStatServic;
            _coreRulesetService = coreRulesetService;
            _commonFuncsCoreRuleSet = commonFuncsCoreRuleSet;
            _ruleSetService = ruleSetService;
            _characterStatDefaultValueService = characterStatDefaultValueService;
            _characterStatConditionService = characterStatConditionService;
        }

        [HttpGet("GetCharacterStatsCount")]
        public async Task<IActionResult> GetCharacterStatsCount()
        {
            var CharacterStatCount = _CharacterStatService.GetCharacterStatsCount();

            if (CharacterStatCount == null)
                return Ok(0);

            return Ok(CharacterStatCount.Result);
        }

        [HttpGet("getCharcaterChoiceByIds")]
        public IEnumerable<CharacterStatChoice> getCharcaterChoiceByIds(string characterhoiceIds)
        {
            return _CharacterStatChoiceService.GetByIds(characterhoiceIds);

        }

        [HttpPost("CreateCharacterStat")]
        public async Task<IActionResult> CreateCharacterStat([FromBody] CharacterStatEditModel model)
        {
            try
            {
                if (model.SelectedChoiceCharacterStatId==0)
                {
                    model.SelectedChoiceCharacterStatId = null;
                }
                if (ModelState.IsValid)
                {

                    int charstatcount = _CharacterStatService.GetCountByRuleSetId(model.RuleSetId);
                    if (charstatcount >= 200)
                    {
                        return BadRequest("Maximum Number of Character Stats for this Rule Set has been reached, 200. Please delete one or more existing Characters Stats to allow for more.");
                    }

                    var userId = GetUserId();                    
                    var characterStatDomain = Mapper.Map<CharacterStat>(model);
                    characterStatDomain.StatIdentifier = Guid.NewGuid();
                    characterStatDomain.OwnerId = userId;
                    characterStatDomain.CreatedBy = userId;
                    characterStatDomain.CreatedDate = DateTime.Now;
                    characterStatDomain.ModifiedBy = userId;

                    //if (_CharacterStatService.CheckDuplicateCharacterStat(model.StatName, model.CharacterStatId, model.RuleSetId).Result)
                    //    return BadRequest("The Character Stat Name " + model.StatName + " had already been used in this Rule Set. Please select another name.");

                    if (_CharacterStatService.CheckDuplicateCharacterStat_sp(model.StatName, model.CharacterStatId, model.RuleSetId))
                        return BadRequest("The Character Stat Name " + model.StatName + " had already been used in this Rule Set. Please select another name.");
                    
                    try
                    {
                        var characterStats = _CharacterStatService.GetCharacterStatRuleSetId(model.RuleSetId ?? 0);
                        var latestOrder = 1;
                        if (characterStats.Count > 0)
                        {
                            var _order = characterStats.OrderByDescending(o => o.SortOrder).FirstOrDefault().SortOrder;
                            //latestOrder = _order == 0 || _order == null ? latestOrder : _order + 1;
                        }
                        characterStatDomain.SortOrder = (Int16)latestOrder;
                    }
                    catch (Exception ex)
                    { return BadRequest(ex.Message); }

                    var result = await _CharacterStatService.InsertCharacterStat(characterStatDomain);

                    if (model.CharacterStatCalsComndViewModel != null && model.CharacterStatCalsComndViewModel.Count > 0)
                    {
                        foreach (var cscViewModels in model.CharacterStatCalsComndViewModel)
                        {
                            await _CharacterStatCalcService.InsertCharacterStatCalc(new CharacterStatCalc()
                            {
                                StatCalculation = cscViewModels.CalculationCommandValue,
                                StatCalculationIds = cscViewModels.StatCalculationIds,
                                CharacterStatId = result.CharacterStatId
                            });
                        }
                    }

                    if (model.CharacterStatChoicesViewModels != null && model.CharacterStatChoicesViewModels.Count > 0 && !model.IsChoicesFromAnotherStat)
                    {
                        foreach (var cscViewModels in model.CharacterStatChoicesViewModels)
                        {
                            await _CharacterStatChoiceService.InsertCharacterStatChoice(new CharacterStatChoice()
                            {
                                StatChoiceValue = cscViewModels.StatChoiceValue,
                                CharacterStatId = result.CharacterStatId
                            });
                        }
                    }

                    var _characterStatComboVM = model.CharacterStatComboViewModel;
                    try
                    {
                        if (_characterStatComboVM != null && (int)STAT_TYPE.Combo == result.CharacterStatTypeId)
                        {
                            await _CharacterStatComboService.InsertCharacterStatCombo(new CharacterStatCombo()
                            {
                                Maximum = _characterStatComboVM.Maximum,
                                Minimum = _characterStatComboVM.Minimum,
                                DefaultValue = _characterStatComboVM.DefaultValue,
                                CharacterStatId = result.CharacterStatId,
                                DefaultText= _characterStatComboVM.DefaultText
                            });
                        }
                    }
                    catch { }
                    var _characterStatToggleVM = model.CharacterStatToggleViewModel;
                    try
                    {
                        if (_characterStatToggleVM != null && (int)STAT_TYPE.Toggle == result.CharacterStatTypeId)
                        {
                            var toggle = await _CharacterStatToggleService.InsertCharacterStatToggle(new CharacterStatToggle()
                            {
                                CharacterStatId = result.CharacterStatId,
                                Display = _characterStatToggleVM.Display,
                                ShowCheckbox = _characterStatToggleVM.ShowCheckbox,
                                IsCustom = _characterStatToggleVM.IsCustom,
                                OnOff = _characterStatToggleVM.OnOff,
                                YesNo = _characterStatToggleVM.YesNo,
                            });
                            if (toggle.IsCustom && _characterStatToggleVM.customToggles != null)
                            {
                                foreach (var ctoggle in _characterStatToggleVM.customToggles)
                                {
                                    if (ctoggle.Image != "" && ctoggle.Image != null)
                                    {
                                        if (!ctoggle.Image.Contains("rpgsmithsa.blob.core.windows.net"))
                                        {
                                            BlobService bs = new BlobService(_httpContextAccessor,_accountManager,_ruleSetService);
                                            string imageName = Guid.NewGuid().ToString() + ".jpg";
                                            if (ctoggle.Image.StartsWith("data:image"))
                                            {
                                                ctoggle.Image = bs.UploadImage_Base64(ctoggle.Image, imageName).Result;
                                            }
                                            else
                                                ctoggle.Image = bs.UploadImage_URL(ctoggle.Image, imageName).Result;
                                        }
                                    }
                                    var _ctoggle = await _CustomToggleService.InsertCustomToggle(new CustomToggle()
                                    {
                                        CharacterStatToggleId = toggle.CharacterStatToggleId,
                                        Image = ctoggle.Image,
                                        ToggleText = ctoggle.ToggleText
                                    });
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                    }
                    if (
                        model.CharacterStatDefaultValueViewModel != null 
                        && 
                        (
                            model.CharacterStatTypeId != (int)STAT_TYPE.Toggle && 
                            model.CharacterStatTypeId != (int)STAT_TYPE.Condition && 
                            model.CharacterStatTypeId != (int)STAT_TYPE.Calculation && 
                            model.CharacterStatTypeId != (int)STAT_TYPE.Combo && 
                            model.CharacterStatTypeId != (int)STAT_TYPE.LinkRecord &&
                            model.CharacterStatTypeId != (int)STAT_TYPE.OnOff &&
                            model.CharacterStatTypeId != (int)STAT_TYPE.YesNo))
                    {
                        if (model.CharacterStatDefaultValueViewModel.Count > 0)
                        {
                            foreach (var defvalue in model.CharacterStatDefaultValueViewModel)
                            {
                                try
                                {
                                    await _characterStatDefaultValueService.InsertCharacterStatDefaultValue(new CharacterStatDefaultValue()
                                    {
                                        CharacterStatId = result.CharacterStatId,
                                        DefaultValue = defvalue.DefaultValue,
                                        Maximum = defvalue.Maximum,
                                        Minimum = defvalue.Minimum,
                                        Type = defvalue.Type
                                    });
                                }
                                catch (Exception ex)
                                { }

                            }
                        }
                    }
                    if (model.CharacterStatConditionViewModel != null&& (int)model.CharacterStatTypeId == (int)STAT_TYPE.Condition)
                    {
                        if (model.CharacterStatConditionViewModel.Count>0)
                        {
                            List<CharacterStatCondition> conditionsList = new List<CharacterStatCondition>();
                            foreach (var condition in model.CharacterStatConditionViewModel)
                            {
                                
                                    CharacterStatCondition obj = new CharacterStatCondition()
                                    {
                                        CharacterStatId = result.CharacterStatId,
                                        CompareValue = condition.CompareValue,
                                        ConditionOperatorID = condition.IfClauseStatText == null ? null : condition.ConditionOperatorID,
                                        //IfClauseStatId = condition.IfClauseStatId,
                                        //IfClauseStattype = condition.IfClauseStattype,
                                        Result = condition.Result,
                                        SortOrder = condition.SortOrder,                                        
                                        IfClauseStatText=condition.IfClauseStatText,
                                        IsNumeric =condition.IsNumeric
                                    };
                                    conditionsList.Add(obj);
                                

                            }
                            if (conditionsList.Count > 0)
                            {
                                try
                                {
                                    await _characterStatConditionService.InsertCharacterStatCondition(conditionsList, result.CharacterStatId);
                                }
                                catch (Exception ex)
                                { }
                            }
                        }
                    }
                    // Add character stat to characters character stat
                    var characters = _CharacterService.GetCharacterRuleSetId(result.RuleSetId);

                    foreach (var c in characters)
                    {
                        var _charactersCharacterStat = new CharactersCharacterStat();
                        _charactersCharacterStat.CharacterId = c.CharacterId;
                        _charactersCharacterStat.CharacterStatId = result.CharacterStatId;
                        _charactersCharacterStat.OnOff = false;
                        _charactersCharacterStat.YesNo = false;

                        if (_characterStatComboVM != null)
                        {
                            _charactersCharacterStat.Maximum = _characterStatComboVM.Maximum ?? 0;
                            _charactersCharacterStat.Minimum = _characterStatComboVM.Minimum ?? 0;
                            _charactersCharacterStat.DefaultValue = _characterStatComboVM.DefaultValue;
                            _charactersCharacterStat.ComboText = _characterStatComboVM.DefaultText;
                        }
                        if (_characterStatToggleVM != null && (int)STAT_TYPE.Toggle == result.CharacterStatTypeId) {
                            _charactersCharacterStat.Display = _characterStatToggleVM.Display;
                            _charactersCharacterStat.OnOff = _characterStatToggleVM.OnOff;
                            _charactersCharacterStat.YesNo = _characterStatToggleVM.YesNo;
                            _charactersCharacterStat.IsCustom = _characterStatToggleVM.IsCustom;
                            if (_charactersCharacterStat.Display)
                            {
                                _charactersCharacterStat.ShowCheckbox = _characterStatToggleVM.ShowCheckbox;
                            }
                            else {
                                _charactersCharacterStat.ShowCheckbox = false;
                            }
                            
                            _charactersCharacterStat.IsOn =false;
                            _charactersCharacterStat.IsYes =false;
                            
                            //if (_charactersCharacterStat.IsCustom && _characterStatToggleVM.customToggles != null)
                            //{
                            //    foreach (var ctoggle in _characterStatToggleVM.customToggles)
                            //    {                                    
                            //        var _ctoggle = await _CustomToggleService.InsertCustomToggle(new CustomToggle() //Do it for character..
                            //        {
                            //            CharacterStatToggleId = toggle.CharacterStatToggleId,
                            //            Image = ctoggle.Image,
                            //            ToggleText = ctoggle.ToggleText
                            //        });
                            //    }
                            //}
                            
                        }
                        if (model.CharacterStatDefaultValueViewModel != null && 
                            (model.CharacterStatTypeId != (int)STAT_TYPE.Toggle &&
                            model.CharacterStatTypeId != (int)STAT_TYPE.Condition &&
                            model.CharacterStatTypeId != (int)STAT_TYPE.Calculation &&
                            model.CharacterStatTypeId != (int)STAT_TYPE.Combo &&
                            model.CharacterStatTypeId != (int)STAT_TYPE.LinkRecord &&
                            model.CharacterStatTypeId != (int)STAT_TYPE.OnOff &&
                            model.CharacterStatTypeId != (int)STAT_TYPE.YesNo))
                        {
                            if (model.CharacterStatDefaultValueViewModel.Count > 0) {
                                foreach (var cDefval in model.CharacterStatDefaultValueViewModel)
                                {
                                    switch (cDefval.Type)
                                    {
                                        case 1:
                                            _charactersCharacterStat.Text = cDefval.DefaultValue;
                                            break;
                                        case 2:
                                            _charactersCharacterStat.RichText = cDefval.DefaultValue;
                                            break;
                                        case 3:
                                            _charactersCharacterStat.Number = getIntiger(cDefval.DefaultValue);
                                            break;
                                        case 4:
                                            _charactersCharacterStat.Current = getIntiger(cDefval.DefaultValue);
                                            break;
                                        case 5:
                                            _charactersCharacterStat.Maximum = getIntiger(cDefval.DefaultValue);
                                            break;
                                        case 6:
                                            _charactersCharacterStat.Value = getIntiger(cDefval.DefaultValue);
                                            break;
                                        case 7:
                                            _charactersCharacterStat.SubValue = getIntiger(cDefval.DefaultValue);
                                            break;
                                        case 8:
                                            _charactersCharacterStat.Command = cDefval.DefaultValue;
                                            break;
                                        case 14:
                                            _charactersCharacterStat.DefaultValue = getIntiger(cDefval.DefaultValue);
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                        }

                            _charactersCharacterStatServic.Create(_charactersCharacterStat);
                    }

                    return Ok();
                }
                return BadRequest(Utilities.ModelStateError(ModelState));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private int getIntiger(string defaultValue)
        {
            if (string.IsNullOrEmpty(defaultValue))
            {
                return 0;
            }
            try {
                return Convert.ToInt32(defaultValue);
            }
            catch (Exception ex) {
                return 0;
            }
        }

        [HttpPost("UpdateCharacterStat")]
        public async Task<IActionResult> UpdateCharacterStat([FromBody]  CharacterStatEditModel model)
        {
            if (ModelState.IsValid)
            {
                if (model.SelectedChoiceCharacterStatId == 0)
                {
                    model.SelectedChoiceCharacterStatId = null;
                }
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {

                    return await Core_UpdateCharacterstat(model);
                }
                else
                {
                    return await UpdateCharacterstatCommon(model);
                }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async Task<IActionResult> Core_UpdateCharacterstat(CharacterStatEditModel model)
        {
            try
            {
                int CharacterStatId = model.CharacterStatId;
                if (_coreRulesetService.IsCharacterstatCopiedFromCoreRuleset(CharacterStatId, (int)model.RuleSetId))
                {
                    return await UpdateCharacterstatCommon(model);
                }
                else
                {
                    //var spell = Mapper.Map<Spell>(model);
                    return await CreateCharacterstatCopiedRuleset(model, null);

                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<IActionResult> CreateCharacterstatCopiedRuleset(CharacterStatEditModel model, bool? Isdeleted = null)
        {
            int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            int? parentID = _ruleSetService.GetRuleSetById(rulesetID).Result.ParentRuleSetId;
            if (parentID == null)
            {
                parentID = model.RuleSetId;
            }
            int charstatcount = _CharacterStatService.Core_GetCountByRuleSetId(rulesetID, parentID);
            if (charstatcount >= 200)
            {
                return BadRequest("Maximum Number of Character Stats for this Rule Set has been reached, 200. Please delete one or more existing Characters Stats to allow for more.");
            }
            var userId = GetUserId();


            //var characterStatDomain = Mapper.Map<CharacterStat>(model);
            int OldCharacterStatID = model.CharacterStatId;
            short DefNum = 0;
            CharacterStat characterStatDomain = new CharacterStat();

            characterStatDomain.CharacterStatId = model.CharacterStatId;
            characterStatDomain.CharacterStatTypeId = model.CharacterStatTypeId;
            characterStatDomain.isActive = model.isActive == null ? false : (bool)model.isActive;
            characterStatDomain.isMultiSelect = model.isMultiSelect == null ? false : (bool)model.isMultiSelect;
            characterStatDomain.ParentCharacterStatId = model.ParentCharacterStatId;
            characterStatDomain.RuleSetId = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
            characterStatDomain.SortOrder = model.SortOrder == null ? DefNum : (short)model.SortOrder;
            characterStatDomain.StatDesc = model.StatDesc;
            characterStatDomain.StatName = model.StatName;
            characterStatDomain.IsDeleted = Isdeleted;

            characterStatDomain.OwnerId = userId;
            characterStatDomain.CreatedBy = userId;
            characterStatDomain.CreatedDate = DateTime.Now;
            characterStatDomain.ModifiedBy = userId;
            characterStatDomain.AddToModScreen = model.AddToModScreen;
            characterStatDomain.IsChoiceNumeric = model.IsChoiceNumeric;
            characterStatDomain.IsChoicesFromAnotherStat = model.IsChoicesFromAnotherStat;
            characterStatDomain.SelectedChoiceCharacterStatId = model.SelectedChoiceCharacterStatId;
            characterStatDomain.AlertPlayer = model.AlertPlayer;
            characterStatDomain.AlertGM = model.AlertGM;

            //try
            //{
            //    var characterStats = _CharacterStatService.GetCharacterStatRuleSetId(model.RuleSetId ?? 0);
            //    var latestOrder = 1;
            //    if (characterStats.Count > 0)
            //    {
            //        var _order = characterStats.OrderByDescending(o => o.SortOrder).FirstOrDefault().SortOrder;
            //        latestOrder = _order == 0 || _order == null ? latestOrder : _order + 1;
            //    }
            //    characterStatDomain.SortOrder = (Int16)latestOrder;
            //}
            //catch (Exception ex)
            //{ return BadRequest(ex.Message); }

            if (_CharacterStatService.CheckDuplicateCharacterStat(model.StatName, model.CharacterStatId, model.RuleSetId).Result)
                return BadRequest("The Character Stat Name " + model.StatName + " had already been used in this Rule Set. Please select another name.");

            //var result = await _CharacterStatService.InsertCharacterStat(characterStatDomain);
            var result = await _coreRulesetService.InsertCharacterStat(characterStatDomain);
            ////////////////////////////////////////////////
            //if (Isdeleted==null)
            //{
            //    if (model.CharacterStatTypeId== 19) //STAT_TYPE.Condition = 19
            //    {
            //        LogStatUpdate logStat = new LogStatUpdate();
            //        logStat.CharacterStatId = model.CharacterStatId;
            //        logStat.RuleSetId = model.RuleSetId;
            //        await _CharacterStatService.SaveLogStat(logStat);
            //    }
            //}


            if (model.CharacterStatCalsComndViewModel != null && model.CharacterStatCalsComndViewModel.Count > 0)
            {
                foreach (var cscViewModels in model.CharacterStatCalsComndViewModel)
                {
                    await _CharacterStatCalcService.InsertCharacterStatCalc(new CharacterStatCalc()
                    {
                        StatCalculation = cscViewModels.CalculationCommandValue,
                        StatCalculationIds = cscViewModels.StatCalculationIds,
                        CharacterStatId = result.CharacterStatId,
                        IsDeleted = Isdeleted
                    });
                }
            }

            if (model.CharacterStatChoicesViewModels != null && model.CharacterStatChoicesViewModels.Count > 0 && !model.IsChoicesFromAnotherStat)
            {
                foreach (var cscViewModels in model.CharacterStatChoicesViewModels)
                {
                    await _CharacterStatChoiceService.InsertCharacterStatChoice(new CharacterStatChoice()
                    {
                        StatChoiceValue = cscViewModels.StatChoiceValue,
                        CharacterStatId = result.CharacterStatId,
                        IsDeleted = Isdeleted
                    });
                }
            }

            try
            {
                var _characterStatComboVM = model.CharacterStatComboViewModel;
                if (_characterStatComboVM != null && (int)STAT_TYPE.Combo == result.CharacterStatTypeId)
                {
                    await _CharacterStatComboService.InsertCharacterStatCombo(new CharacterStatCombo()
                    {
                        Maximum = _characterStatComboVM.Maximum,
                        Minimum = _characterStatComboVM.Minimum,
                        DefaultValue = _characterStatComboVM.DefaultValue,
                        DefaultText = _characterStatComboVM.DefaultText,
                        CharacterStatId = result.CharacterStatId
                    });
                }
            }
            catch { }
            var _characterStatToggleVM = model.CharacterStatToggleViewModel;
            try
            {
                if (_characterStatToggleVM != null && (int)STAT_TYPE.Toggle == result.CharacterStatTypeId)
                {
                    var toggle = await _CharacterStatToggleService.InsertCharacterStatToggle(new CharacterStatToggle()
                    {
                        CharacterStatId = result.CharacterStatId,
                        Display = _characterStatToggleVM.Display,
                        ShowCheckbox = _characterStatToggleVM.ShowCheckbox,
                        IsCustom = _characterStatToggleVM.IsCustom,
                        OnOff = _characterStatToggleVM.OnOff,
                        YesNo = _characterStatToggleVM.YesNo,
                    });
                    if (toggle.IsCustom && _characterStatToggleVM.customToggles != null)
                    {
                        foreach (var ctoggle in _characterStatToggleVM.customToggles)
                        {
                            if (ctoggle.Image != "" && ctoggle.Image != null)
                            {
                                if (!ctoggle.Image.Contains("rpgsmithsa.blob.core.windows.net"))
                                {
                                    BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _ruleSetService);
                                    string imageName = Guid.NewGuid().ToString() + ".jpg";
                                    if (ctoggle.Image.StartsWith("data:image"))
                                    {
                                        ctoggle.Image = bs.UploadImage_Base64(ctoggle.Image, imageName).Result;
                                    }
                                    else
                                        ctoggle.Image = bs.UploadImage_URL(ctoggle.Image, imageName).Result;
                                }
                            }
                            var _ctoggle = await _CustomToggleService.InsertCustomToggle(new CustomToggle()
                            {
                                CharacterStatToggleId = toggle.CharacterStatToggleId,
                                Image = ctoggle.Image,
                                ToggleText = ctoggle.ToggleText
                            });
                        }
                    }
                }
            }
            catch { }
            if (model.CharacterStatDefaultValueViewModel != null && 
                (model.CharacterStatTypeId != (int)STAT_TYPE.Toggle &&
                model.CharacterStatTypeId != (int)STAT_TYPE.Condition &&
                model.CharacterStatTypeId != (int)STAT_TYPE.Calculation && 
                model.CharacterStatTypeId != (int)STAT_TYPE.Combo && 
                model.CharacterStatTypeId != (int)STAT_TYPE.LinkRecord &&
                model.CharacterStatTypeId != (int)STAT_TYPE.OnOff && 
                model.CharacterStatTypeId != (int)STAT_TYPE.YesNo))
            {
                if (model.CharacterStatDefaultValueViewModel.Count > 0)
                {
                    foreach (var defvalue in model.CharacterStatDefaultValueViewModel)
                    {
                        try
                        {
                            await _characterStatDefaultValueService.InsertCharacterStatDefaultValue(new CharacterStatDefaultValue()
                            {
                                CharacterStatId = result.CharacterStatId,
                                DefaultValue = defvalue.DefaultValue,
                                Maximum = defvalue.Maximum,
                                Minimum = defvalue.Minimum,
                                Type = defvalue.Type
                            });
                        }
                        catch (Exception ex) { }
                    }
                }
            }
            if (model.CharacterStatConditionViewModel != null)
            {
                if (model.CharacterStatConditionViewModel.Count > 0)
                {
                    List<CharacterStatCondition> conditionsList = new List<CharacterStatCondition>();
                    foreach (var condition in model.CharacterStatConditionViewModel)
                    {

                        CharacterStatCondition obj = new CharacterStatCondition()
                        {
                            CharacterStatId = result.CharacterStatId,
                            CompareValue = condition.CompareValue,
                            ConditionOperatorID = condition.IfClauseStatText == null ? null : condition.ConditionOperatorID,
                            //IfClauseStatId = condition.IfClauseStatId,
                            //IfClauseStattype = condition.IfClauseStattype,
                            Result = condition.Result,
                            SortOrder = condition.SortOrder,                            
                            IfClauseStatText=condition.IfClauseStatText,
                            IsNumeric =condition.IsNumeric
                        };
                        conditionsList.Add(obj);


                    }
                    if (conditionsList.Count > 0)
                    {
                        try
                        {
                            await _characterStatConditionService.InsertCharacterStatCondition(conditionsList, result.CharacterStatId);
                        }
                        catch (Exception ex)
                        { }
                    }
                }
            }
            // Add character stat to characters character stat
            var characterIDs = _coreRulesetService.GetCharactersByRulesetID(result.RuleSetId).Result.Select(p => p.CharacterId);
            foreach (var item in characterIDs)
            {
                await _coreRulesetService._updateParentIDForAllRelatedItems(item, OldCharacterStatID, result.CharacterStatId, 'C');
            }
            if (Isdeleted == true)
            {
                await _CharacterStatService.DeleteCharacterStat(result.CharacterStatId);
            }
            return Ok();
        }

        private async Task<IActionResult> UpdateCharacterstatCommon(CharacterStatEditModel model)
        {
            var userId = GetUserId();

            var characterStat = _CharacterStatService.GetCharacterStatById(model.CharacterStatId);
            var calsIds = new List<int>();
            var choiceIds = new List<int>();

            if (characterStat.CharacterStatCalcs.Count > 0)
                calsIds.AddRange(characterStat.CharacterStatCalcs.Select(x => x.CharacterStatCalcId).ToList());

            if (characterStat.CharacterStatChoices.Count > 0)
                choiceIds.AddRange(characterStat.CharacterStatChoices.Select(x => x.CharacterStatChoiceId).ToList());


            if (characterStat == null)
                return Ok("CharacterStat not found");

            var characterStatDomain = Mapper.Map<CharacterStat>(model);
            characterStatDomain.CharacterStatId = model.CharacterStatId;
            characterStatDomain.ModifiedBy = userId;
            characterStatDomain.ParentCharacterStatId = model.ParentCharacterStatId == 0 ? null : model.ParentCharacterStatId;

            if (_CharacterStatService.CheckDuplicateCharacterStat(model.StatName, model.CharacterStatId, model.RuleSetId).Result)
                return BadRequest("The Character Stat Name " + model.StatName + " had already been used in this Rule Set. Please select another name.");

            var result = await _CharacterStatService.UdateCharacterStat(characterStatDomain);
            ///////////////////////////////////////////////////////
            //if (model.CharacterStatTypeId== 19) //STAT_TYPE.Condition = 19
            //{
            //    LogStatUpdate logStat = new LogStatUpdate();
            //    logStat.CharacterStatId = model.CharacterStatId;
            //    logStat.RuleSetId = model.RuleSetId;
            //    await _CharacterStatService.SaveLogStat(logStat);
            //}

            if (model.CharacterStatCalsComndViewModel != null && model.CharacterStatCalsComndViewModel.Count > 0)
            {
                if (calsIds.Count > 0)
                {
                    foreach (var id in calsIds)
                    {
                        if (model.CharacterStatCalsComndViewModel.Where(x => x.Id == id).FirstOrDefault() == null)
                            await _CharacterStatCalcService.DeleteCharacterStatCalc(id);
                    }
                }

                foreach (var cscViewModels in model.CharacterStatCalsComndViewModel)
                {
                    if (cscViewModels.Id > 0)
                    {
                        await _CharacterStatCalcService.UdateCharacterStatCalc(new CharacterStatCalc()
                        {
                            CharacterStatCalcId = cscViewModels.Id,
                            StatCalculation = cscViewModels.CalculationCommandValue,
                            CharacterStatId = result.CharacterStatId,
                            StatCalculationIds = cscViewModels.StatCalculationIds
                        });
                    }
                    else
                    {
                        await _CharacterStatCalcService.InsertCharacterStatCalc(new CharacterStatCalc()
                        {
                            StatCalculation = cscViewModels.CalculationCommandValue,
                            CharacterStatId = result.CharacterStatId,
                            StatCalculationIds = cscViewModels.StatCalculationIds
                        });
                    }
                }
            }
            else
            {
                if (calsIds.Count > 0)
                {
                    foreach (var id in calsIds)
                    {
                        await _CharacterStatCalcService.DeleteCharacterStatCalc(id);
                    }
                }
            }
            if (model.IsChoicesFromAnotherStat)
            {
                await _CharacterStatChoiceService.DeleteChoiceByStatID(characterStat.CharacterStatId);
            }
            if (model.CharacterStatChoicesViewModels != null && model.CharacterStatChoicesViewModels.Count > 0 && !model.IsChoicesFromAnotherStat)
            {
                if (choiceIds.Count > 0)
                {
                    foreach (var id in choiceIds)
                    {
                        if (model.CharacterStatChoicesViewModels.Where(x => x.CharacterStatChoiceId == id).FirstOrDefault() == null)
                            await _CharacterStatChoiceService.DeleteCharacterStatChoice(id);
                    }
                }
                
                foreach (var cscViewModels in model.CharacterStatChoicesViewModels)
                {
                    if (model.IsChoicesFromAnotherStat)
                    {
                        cscViewModels.CharacterStatChoiceId = 0;
                    }
                    if (cscViewModels.CharacterStatChoiceId > 0)
                    {
                        await _CharacterStatChoiceService.UdateCharacterStatChoice(new CharacterStatChoice()
                        {
                            CharacterStatChoiceId = cscViewModels.CharacterStatChoiceId,
                            StatChoiceValue = cscViewModels.StatChoiceValue,
                            CharacterStatId = result.CharacterStatId
                        });
                    }
                    else
                    {
                        await _CharacterStatChoiceService.InsertCharacterStatChoice(new CharacterStatChoice()
                        {
                            StatChoiceValue = cscViewModels.StatChoiceValue,
                            CharacterStatId = result.CharacterStatId
                        });
                    }
                }
            }
            else
            {
                if (choiceIds.Count > 0)
                {
                    foreach (var id in choiceIds)
                    {
                        await _CharacterStatChoiceService.DeleteCharacterStatChoice(id);
                    }
                }
            }

            try
            {
                var _characterStatComboVM = model.CharacterStatComboViewModel;
                if (_characterStatComboVM != null && (int)STAT_TYPE.Combo == result.CharacterStatTypeId)
                {
                    await _CharacterStatComboService.UpdateCharacterStatCombo(new CharacterStatCombo()
                    {
                        CharacterStatComboId = _characterStatComboVM.CharacterStatComboId,
                        Maximum = _characterStatComboVM.Maximum,
                        Minimum = _characterStatComboVM.Minimum,
                        DefaultValue = _characterStatComboVM.DefaultValue,
                        DefaultText = _characterStatComboVM.DefaultText,
                        CharacterStatId = result.CharacterStatId
                    });
                }
            }
            catch { }
            try
            {     
                var _characterStatToggleVM = model.CharacterStatToggleViewModel;
                if (_characterStatToggleVM != null && (int)STAT_TYPE.Toggle == result.CharacterStatTypeId)
                {
                    var toggle = await _CharacterStatToggleService.UpdateCharacterStatToggle(new CharacterStatToggle()
                    {
                        CharacterStatToggleId = _characterStatToggleVM.CharacterStatToggleId,
                        CharacterStatId = result.CharacterStatId,
                        Display = _characterStatToggleVM.Display,
                        ShowCheckbox = _characterStatToggleVM.ShowCheckbox,
                        IsCustom = _characterStatToggleVM.IsCustom,
                        OnOff = _characterStatToggleVM.OnOff,
                        YesNo = _characterStatToggleVM.YesNo,
                    });
                    if (toggle.IsCustom && _characterStatToggleVM.customToggles != null)
                    {
                        foreach (var ctoggle in _characterStatToggleVM.customToggles)
                        {
                            if (ctoggle.Image != "" && ctoggle.Image != null ) {
                                if (!ctoggle.Image.Contains("rpgsmithsa.blob.core.windows.net"))
                                {
                                    BlobService bs = new BlobService(_httpContextAccessor, _accountManager,_ruleSetService);
                                    string imageName = Guid.NewGuid().ToString() + ".jpg";
                                    if (ctoggle.Image.StartsWith("data:image"))
                                    {
                                        ctoggle.Image =  bs.UploadImage_Base64(ctoggle.Image, imageName).Result;
                                    }
                                    else
                                        ctoggle.Image = bs.UploadImage_URL(ctoggle.Image, imageName).Result;
                                }
                            }

                            var ct = new CustomToggle()
                            {
                                //CustomToggleId = ctoggle.CustomToggleId,
                                CharacterStatToggleId = toggle.CharacterStatToggleId,
                                Image = ctoggle.Image,
                                ToggleText = ctoggle.ToggleText
                            };
                            //if (ct.CustomToggleId > 0)
                            //await _CustomToggleService.UpdateCustomToggle(ct);
                            //else
                            await _CustomToggleService.InsertCustomToggle(ct);
                        }
                    }                   
                    // Add character stat to characters character stat
                    var characters = _CharacterService.GetCharacterRuleSetId(result.RuleSetId);

                    foreach (var c in characters)
                    {
                        var _charactersCharacterStat = _charactersCharacterStatServic.GetByCharacterStatId(result.CharacterStatId, c.CharacterId).FirstOrDefault();
                        if (_charactersCharacterStat!=null)
                        {
                            _charactersCharacterStat.CharacterId = c.CharacterId;
                            _charactersCharacterStat.CharacterStatId = result.CharacterStatId;
                            _charactersCharacterStat.OnOff = false;
                            _charactersCharacterStat.YesNo = false;


                            if (_characterStatToggleVM != null && (int)STAT_TYPE.Toggle == result.CharacterStatTypeId)
                            {
                                _charactersCharacterStat.Display = _characterStatToggleVM.Display;
                                _charactersCharacterStat.OnOff = _characterStatToggleVM.OnOff;
                                _charactersCharacterStat.YesNo = _characterStatToggleVM.YesNo;
                                _charactersCharacterStat.IsCustom = _characterStatToggleVM.IsCustom;
                                if (_charactersCharacterStat.Display)
                                {
                                    _charactersCharacterStat.ShowCheckbox = _characterStatToggleVM.ShowCheckbox;
                                }
                                else
                                {
                                    _charactersCharacterStat.ShowCheckbox = false;
                                }

                                _charactersCharacterStat.IsOn = false;
                                _charactersCharacterStat.IsYes = false;

                                //if (_charactersCharacterStat.IsCustom && _characterStatToggleVM.customToggles != null)
                                //{
                                //    foreach (var ctoggle in _characterStatToggleVM.customToggles)
                                //    {                                    
                                //        var _ctoggle = await _CustomToggleService.InsertCustomToggle(new CustomToggle() //Do it for character..
                                //        {
                                //            CharacterStatToggleId = toggle.CharacterStatToggleId,
                                //            Image = ctoggle.Image,
                                //            ToggleText = ctoggle.ToggleText
                                //        });
                                //    }
                                //}

                            }

                            await _charactersCharacterStatServic.Update(_charactersCharacterStat);
                        }
                        
                    }
                }
                if (model.CharacterStatDefaultValueViewModel != null && 
                    (model.CharacterStatTypeId != (int)STAT_TYPE.Toggle &&
                    model.CharacterStatTypeId != (int)STAT_TYPE.Condition &&
                    model.CharacterStatTypeId != (int)STAT_TYPE.Calculation &&
                    model.CharacterStatTypeId != (int)STAT_TYPE.Combo &&
                    model.CharacterStatTypeId != (int)STAT_TYPE.LinkRecord &&
                    model.CharacterStatTypeId != (int)STAT_TYPE.OnOff &&
                    model.CharacterStatTypeId != (int)STAT_TYPE.YesNo))
                {
                    if (model.CharacterStatDefaultValueViewModel.Count > 0)
                    {
                        await _characterStatDefaultValueService.DeleteCharacterStatDefaultValue(result.CharacterStatId);
                        foreach (var defvalue in model.CharacterStatDefaultValueViewModel)
                        {
                            try
                            {
                                //await _characterStatDefaultValueService.UpdateCharacterStatDefaultValue(new CharacterStatDefaultValue()
                                //{
                                //    CharacterStatDefaultValueId = defvalue.CharacterStatDefaultValueId,
                                //    CharacterStatId = result.CharacterStatId,
                                //    DefaultValue = defvalue.DefaultValue,
                                //    Maximum = defvalue.Maximum,
                                //    Minimum = defvalue.Minimum,
                                //    Type = defvalue.Type
                                //});
                                await _characterStatDefaultValueService.InsertCharacterStatDefaultValue(new CharacterStatDefaultValue()
                                {
                                    CharacterStatId = result.CharacterStatId,
                                    DefaultValue = defvalue.DefaultValue,
                                    Maximum = defvalue.Maximum,
                                    Minimum = defvalue.Minimum,
                                    Type = defvalue.Type
                                });
                                if (defvalue.Type == 1 || defvalue.Type == 2 || defvalue.Type == 3 || defvalue.Type == 8 || defvalue.Type == 14)
                                {
                                    break;
                                }
                            }
                            catch (Exception ex) { }
                        }
                    }
                }
                if (model.CharacterStatConditionViewModel != null)
                {
                    if (model.CharacterStatConditionViewModel.Count > 0)
                    {
                        List<CharacterStatCondition> conditionsList = new List<CharacterStatCondition>();
                        foreach (var condition in model.CharacterStatConditionViewModel)
                        {

                            CharacterStatCondition obj = new CharacterStatCondition()
                            {
                                CharacterStatId = result.CharacterStatId,
                                CompareValue = condition.CompareValue,
                                ConditionOperatorID = condition.IfClauseStatText == null ? null : condition.ConditionOperatorID,
                                //IfClauseStatId = condition.IfClauseStatId,
                                //IfClauseStattype = condition.IfClauseStattype,
                                Result = condition.Result,
                                SortOrder = condition.SortOrder,                                
                                IfClauseStatText=condition.IfClauseStatText,
                                IsNumeric =condition.IsNumeric
                            };
                            conditionsList.Add(obj);


                        }
                        if (conditionsList.Count > 0)
                        {
                            try
                            {
                                await _characterStatConditionService.InsertCharacterStatCondition(conditionsList, result.CharacterStatId);
                            }
                            catch (Exception ex)
                            { }
                        }
                    }
                }
            }
            catch { }

            return Ok();
        }

        [HttpDelete("DeleteCharacterStat")]
        public async Task<IActionResult> DeleteCharacterStat(int Id)
        {
            await _CharacterStatService.DeleteCharacterStat(Id);

            return Ok();

        }

        [HttpPost("DeleteCharacterStat_up")]
        public async Task<IActionResult> DeleteCharacterStat([FromBody] CharacterStatEditModel model)
        {

            try
            {
                bool flag = false;
                int rulesetID = model.RuleSetId == null ? 0 : (int)model.RuleSetId;
                if (_coreRulesetService.IsCopiedFromCoreRuleset(rulesetID))
                {

                    int CharacterStatId = model.CharacterStatId;
                    if (!_coreRulesetService.IsCharacterstatCopiedFromCoreRuleset(CharacterStatId, (int)model.RuleSetId))
                    {
                        flag = true;
                           await CreateCharacterstatCopiedRuleset(model, true);
                        //return Ok();
                    }

                }

                await _CharacterStatService.DeleteCharacterStat(model.CharacterStatId, flag);

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetCharacterStatsById")]
        public async Task<IActionResult> GetCharacterStatsById(int id)
        {
            var CharacterStat = _CharacterStatService.GetCharacterStatById(id);

            if (CharacterStat == null)
                return Ok("CharacterStat Not Found using Id" + id);

            return Ok(_commonFuncsCoreRuleSet.GetCharacterStatViewModel(CharacterStat));
        }

        [HttpGet("GetCharacterStatsByRuleSetId")]
        public async Task<IActionResult> GetCharacterStatByRuleSetId(int id)
        {
            if (_coreRulesetService.IsCopiedFromCoreRuleset(id))
            {

                var characterStats = _coreRulesetService.Character_GetCharacterStatByRuleSetId(id);
                List<CharacterStatViewModel> CharacterStatVM = new List<CharacterStatViewModel>();
                foreach (var characterStat in characterStats)
                    CharacterStatVM.Add(_commonFuncsCoreRuleSet.GetCharacterStatViewModel(characterStat));

                return Ok(CharacterStatVM.OrderBy(o => o.SortOrder).ThenByDescending(x=>x.CreatedDate).ToList());
            }
            else
            {
                var characterStats = _CharacterStatService.GetCharacterStatRuleSetId(id);
                List<CharacterStatViewModel> CharacterStatVM = new List<CharacterStatViewModel>();
                foreach (var characterStat in characterStats)
                    CharacterStatVM.Add(_commonFuncsCoreRuleSet.GetCharacterStatViewModel(characterStat));

                return Ok(CharacterStatVM.OrderBy(o => o.SortOrder).ThenByDescending(x => x.CreatedDate).ToList());
            }
        }

        [HttpGet("CharacterStatTypeList")]
        public async Task<IActionResult> CharacterStatTypeList()
        {
            var _characterStatTypeList = _CharacterStatTypeService.GetCharacterStatTypeList()
                .Where(x=>x.TypeId!=0).OrderBy(x=>x.TypeId)
                .Select(x => new CharacterStatTypeViewModel()
                {
                    CharacterStatTypeId = x.CharacterStatTypeId,
                    isNumeric = x.isNumeric,
                    StatTypeDesc = x.StatTypeDesc,
                    StatTypeName = x.StatTypeName
                }).ToList();

            return Ok(_characterStatTypeList);
        }

        [HttpPost("UpdateCharacterStatSortOrder")]
        public async Task<IActionResult> UpdateCharacterStatSortOrder([FromBody]  List<CharacterStatOrderViewModel> models)
        {
            if (models.Count > 0)
            {
                var l = new List<CharacterStat>();
                foreach (var model in models)
                {
                    l.Add(new CharacterStat()
                    {
                        RuleSetId = model.RuleSetId,
                        CharacterStatId = model.CharacterStatId,
                        SortOrder = model.SortOrder,
                        ModifiedDate = DateTime.Now
                    });
                }
                if (l.Count > 0)
                    await _CharacterStatService.UpdateCharacterStatOrder(l);
            }

            return Ok();
        }

        [HttpGet("getCountByRuleSetId")]
        public async Task<IActionResult> getCountByRuleSetId(int rulesetId)
        {
            var _items = _CharacterStatService.GetCountByRuleSetId(rulesetId);

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }

        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;

            // return "ec34768b-c2ff-43b2-9bf3-d0946d416482";
        }

        
        [HttpGet("getConditionOperators")]
        public async Task<IActionResult> getConditionOperators(int rulesetId)
        {
            return Ok(await  _characterStatConditionService.GetConditionOperators());
        }

        [HttpPost("LogCharacterStatUpdate")]
        public async Task<IActionResult> LogCharacterStatUpdate([FromBody]  LogStatUpdate model)
        {
            try
            {
                await _CharacterStatService.SaveLogStat(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("DeleteLogStat")]
        public async Task<IActionResult> DeleteLogStat(int Id)
        {
            await _CharacterStatService.DeleteLogStat(Id);

            return Ok();

        }

        [HttpGet("GetStatNotificationForGM")]
        public async Task<IActionResult> getStatNotificationForGM(int rulesetId)
        {
            return Ok(await _CharacterStatService.GetStatNotificationForGM(rulesetId));
        }

        [HttpGet("GetStatNotificationForPlayer")]
        public async Task<IActionResult> getStatNotificationForPlayer(int characterId)
        {
            return Ok(await _CharacterStatService.GetStatNotificationForPlayer(characterId));
        }

        [HttpPost("DeleteNotification")]
        public async Task<IActionResult> DeleteNotification([FromBody] List<CommonID> Ids)
        {
            await _CharacterStatService.DeleteNotification(Ids);
            return Ok();
        }

        #region API Using SP
        [HttpGet("getByRuleSetId_sp")]
        public async Task<IActionResult> getByRuleSetId_sp(int rulesetId)
        {
            dynamic Response = new ExpandoObject();
            var CharacterStatList = _CharacterStatService.SP_GetCharacterStatByRuleSetId(rulesetId);
            Response.CharacterStats = CharacterStatList; // Utilities.CleanModel<Ability>(abilityList);
            if (CharacterStatList.Any())
            {
                Response.RuleSet = CharacterStatList.FirstOrDefault().RuleSet;
            }
            else
            {
                Response.RuleSet = _ruleSetService.GetRuleSetById(rulesetId).Result;
            }
            return Ok(Response);
        }

        #endregion

        #region WI 928

        [HttpGet("GetNotificationStatUpdates")]
        public async Task<IActionResult> GetNotificationStatUpdates(int CharacterId)
        {
            return Ok(await _CharacterStatService.GetNotificationStatUpdates(CharacterId));
        }

        [HttpPost("AddNotificationStatUpdates/{CharacterId}")]
        public async Task<IActionResult> AddNotificationStatUpdates(int CharacterId, [FromBody] List<NotificationStatUpdates> notificationStatUpdates)
        {
            return Ok(await _CharacterStatService.AddNotificationStatUpdates(notificationStatUpdates, CharacterId));
        }

        [HttpDelete("RemoveNotificationStatUpdates")]
        public async Task<IActionResult> RemoveNotificationStatUpdates(int CharacterId)
        {
            await _CharacterStatService.RemoveNotificationStatUpdates(CharacterId);
            return Ok();
        }

        #endregion
    }
}
