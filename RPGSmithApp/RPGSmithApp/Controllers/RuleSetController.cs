using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Models.SPModels;
using DAL.Services;
using DAL.Services.RulesetTileServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.Helpers.CoreRuleset;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Enum = RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{
    // [Authorize(Roles = "administrator, user")]
    [Route("api/[controller]")]
    public class RuleSetController : Controller
    {
        private int TotalRuleSetSlotsAvailable = 3;
        private readonly IRuleSetService _ruleSetService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ICharacterService _characterService;
        private readonly ICharacterStatService _characterStatService;
        private readonly ICharacterStatCalcService _characterStatCalcService;
        private readonly IMonsterTemplateCommandService _monsterTemplateCommandService;
        private readonly ICharacterStatChoiceService _characterStatChoiceService;
        private readonly IAbilityService _abilityService;
        private readonly IAbilityCommandService _abilityCommandService;
        private readonly IItemMasterService _itemMasterService;
        private readonly IItemMasterCommandService _iItemMasterCommandService;
        private readonly ISpellService _spellService;
        private readonly ISpellCommandService _spellCommandService;
        private readonly IRulesetDashboardLayoutService _rulesetDashboardLayoutService;
        private readonly IRulesetDashboardPageService _rulesetDashboardPageService;

        private readonly IRulesetTileService _rulesetTileService;
        private readonly IRulesetCharacterStatTileService _characterStatTileService;
        private readonly IRulesetCommandTileService _commandTileService;
        private readonly IRulesetCounterTileService _counterTileService;
        private readonly IRulesetImageTileService _imageTileService;
        private readonly IRulesetNoteTileService _noteTileService;
        private readonly IRulesetTileColorService _colorService;
        private readonly IRulesetTileConfigService _rulesetTileConfigService;

        private readonly IEmailer _emailer;
        private readonly ICoreRuleset _coreRulesetService;
        private readonly ICommonFuncsCoreRuleSet _commonFuncsCoreRuleSet;
        private readonly BlobService bs = new BlobService(null, null, null);
        private readonly IMonsterTemplateService _monsterTemplateService;

        public RuleSetController(IRuleSetService ruleSetService,
            ICharacterService characterService,
            ICharacterStatService characterStatService,
            ICharacterStatCalcService characterStatCalcService,
            ICharacterStatChoiceService characterStatChoiceService,
            IHttpContextAccessor httpContextAccessor,
            IAccountManager accountManager,
            IAbilityService abilityService,
            IAbilityCommandService abilityCommandService,
            IItemMasterService itemMasterService,
            IItemMasterCommandService iItemMasterCommandService,
            ISpellService spellService,
            ISpellCommandService spellCommandService,
            IRulesetDashboardLayoutService rulesetDashboardLayoutService,
            IRulesetDashboardPageService rulesetDashboardPageService,
            IRulesetTileService rulesetTileService,
            IRulesetCharacterStatTileService characterStatTileService,
            IRulesetCommandTileService commandTileService,
            IRulesetCounterTileService counterTileService,
            IRulesetImageTileService imageTileService,
            IRulesetNoteTileService noteTileService,
            IRulesetTileColorService colorService,
            IRulesetTileConfigService rulesetTileConfigService,
            IEmailer emailer,
            ICoreRuleset coreRulesetService,
            ICommonFuncsCoreRuleSet commonFuncsCoreRuleSet,
            IMonsterTemplateService monsterTemplateService)
        {
            _ruleSetService = ruleSetService;
            _characterService = characterService;
            _characterStatService = characterStatService;
            _characterStatCalcService = characterStatCalcService;
            _characterStatChoiceService = characterStatChoiceService;
            _httpContextAccessor = httpContextAccessor;
            _accountManager = accountManager;
            _abilityService = abilityService;
            _abilityCommandService = abilityCommandService;
            _itemMasterService = itemMasterService;
            _iItemMasterCommandService = iItemMasterCommandService;
            _spellService = spellService;
            _spellCommandService = spellCommandService;
            _rulesetDashboardLayoutService = rulesetDashboardLayoutService;
            _rulesetDashboardPageService = rulesetDashboardPageService;
            _rulesetTileService = rulesetTileService;
            _characterStatTileService = characterStatTileService;
            _commandTileService = commandTileService;
            _counterTileService = counterTileService;
            _imageTileService = imageTileService;
            _noteTileService = noteTileService;
            _rulesetTileConfigService = rulesetTileConfigService;
            _emailer = emailer;
            _coreRulesetService = coreRulesetService;
            _commonFuncsCoreRuleSet = commonFuncsCoreRuleSet;
            this._monsterTemplateService = monsterTemplateService;
        }

        [HttpGet("GetRuleSetsCount")]
        public async Task<IActionResult> GetRuleSetsCount(string Id)
        {
            await TotalRuleSetSlotsAvailableForCurrentUser();
            var _ruleSets = _ruleSetService.GetRuleSetsByUserId(Id);

            if (_ruleSets == null) return Ok(0);

            //If Limited edition
            _ruleSets = _ruleSets.Take(_ruleSets.Count >= TotalRuleSetSlotsAvailable ? TotalRuleSetSlotsAvailable : _ruleSets.Count).ToList();

            return Ok(_ruleSets.Count);
        }

        private async Task TotalRuleSetSlotsAvailableForCurrentUser()
        {
            ApplicationUser user = GetUser();
            UserSubscription userSubscription = await _accountManager.userSubscriptions(user.Id);
            if (userSubscription != null)
            {
                if (user.IsGm)
                {
                    TotalRuleSetSlotsAvailable = userSubscription.CampaignCount;
                }
                else
                {
                    TotalRuleSetSlotsAvailable = userSubscription.RulesetCount;
                }
            }
            else
            {
                TotalRuleSetSlotsAvailable = 3;
            }

        }

        [HttpGet("GetRuleSetAndCharacterCount")]
        public async Task<IActionResult> GetRuleSetAndCharacterCount(string Id)
        {
            int rCount = await _ruleSetService.GetRuleSetsCountByUserId(Id);
            int cCount = _characterService.GetCharacterCountUserId(Id);
            return Ok(new { rulesetCount = rCount, characetrCount = cCount });
        }


        [HttpGet("getRulesetRecordCountById")]
        public async Task<IActionResult> GetRulesetRecordCountById(int Id)
        {
            return Ok(_coreRulesetService.GetRulesetRecordCounts(Id));
        }

        [HttpGet("GetRuleSets")]
        public async Task<IActionResult> GetRuleSets(int page, int pageSize)
        {
            try
            {
                await TotalRuleSetSlotsAvailableForCurrentUser();
                var ruleSets = await _ruleSetService.GetRuleSets(page, pageSize);

                //If Limited edition
                if (ruleSets != null && !IsAdminUser())
                    ruleSets = ruleSets.Take(ruleSets.Count >= TotalRuleSetSlotsAvailable ? TotalRuleSetSlotsAvailable : ruleSets.Count).ToList();

                List<RuleSetViewModel> ruleSetsVM = new List<RuleSetViewModel>();
                foreach (var ruleSet in ruleSets)
                    ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));

                return Ok(ruleSetsVM);
            }

            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetAllRuleSets")]
        public async Task<IActionResult> GetRuleSets()
        {
            try
            {
                await TotalRuleSetSlotsAvailableForCurrentUser();
                var ruleSets = await _ruleSetService.GetRuleSets();

                //If Limited edition
                if (ruleSets != null && !IsAdminUser())
                    ruleSets = ruleSets.Take(ruleSets.Count >= TotalRuleSetSlotsAvailable ? TotalRuleSetSlotsAvailable : ruleSets.Count).ToList();

                List<RuleSetViewModel> ruleSetsVM = new List<RuleSetViewModel>();
                foreach (var ruleSet in ruleSets)
                    ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));

                return Ok(ruleSetsVM);
            }

            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetRuleSetById")]
        public async Task<IActionResult> GetRuleSetById(int id)
        {
            var ruleSet = await _ruleSetService.GetRuleSetById(id);
            if (ruleSet == null) return BadRequest("RuleSet Not Found using Id" + id);
            return Ok(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));
        }

        [HttpGet("GetRuleSetByUserId")]
        public async Task<IActionResult> GetRuleSetByUserId(string id)
        {
            var ruleSetsVM = new List<RuleSetViewModel>();
            try
            {
                var ruleSets = await _ruleSetService.GetRuleSetByUserId(id);
                //if (ruleSets.Count == 0) return Ok("RuleSet Not Found using UserId " + id);

                //If Limited edition
                if (ruleSets != null && !IsAdminUser())
                {
                    await TotalRuleSetSlotsAvailableForCurrentUser();
                    ruleSets = ruleSets.Take(ruleSets.Count >= TotalRuleSetSlotsAvailable ? TotalRuleSetSlotsAvailable : ruleSets.Count).ToList();
                }


                foreach (var ruleSet in ruleSets)
                    ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));
            }

            catch (Exception ex) { return BadRequest(ex.Message); }
            return Ok(ruleSetsVM);
        }

        [HttpGet("GetAllRuleSetByUserId")]
        public async Task<IActionResult> GetRuleSetByUserId(string id, int page = 1, int pageSize = 10)
        {
            try
            {
                var ruleSets = await _ruleSetService.GetRuleSetByUserId(id, page, pageSize);
                //if (ruleSets.Count == 0) return Ok("RuleSet Not Found using UserId " + id);

                //If Limited edition
                if (ruleSets != null && !IsAdminUser())
                {
                    await TotalRuleSetSlotsAvailableForCurrentUser();
                    ruleSets = ruleSets.Take(ruleSets.Count >= TotalRuleSetSlotsAvailable ? TotalRuleSetSlotsAvailable : ruleSets.Count).ToList();
                }
                var ruleSetsVM = new List<RuleSetViewModel>();
                foreach (var ruleSet in ruleSets)
                    ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));

                return Ok(ruleSetsVM);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpGet("GetRuleSetToCreateCharacterByUserId")]
        public async Task<IActionResult> GetRuleSetToCreateCharacterByUserId(string id, int page = 1, int pageSize = 10)
        {
            try
            {
                var ruleSets = _ruleSetService.GetRuleSetToCreateCharacterByUserId(id, page, pageSize);
                //if (ruleSets.Count == 0) return Ok("RuleSet Not Found using UserId " + id);

                ////If Limited edition
                //if (ruleSets != null && !IsAdminUser())
                //    ruleSets = ruleSets.Take(ruleSets.Count >= TotalRuleSetSlotsAvailable ? TotalRuleSetSlotsAvailable : ruleSets.Count).ToList();

                var ruleSetsVM = new List<RuleSetViewModel>();
                foreach (var ruleSet in ruleSets)
                    ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel_LiteVersion(ruleSet, GetUserId()));

                return Ok(ruleSetsVM);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpGet("GetCoreRuleSets")]
        public IEnumerable<RuleSetViewModel> GetCoreRuleSets(string id)
        {
            var ruleSets = _ruleSetService.GetCoreRuleSets(id).Result;

            //If Limited edition
            //if (ruleSets != null && !IsAdminUser())
            //    ruleSets = ruleSets.Take(ruleSets.Count >= TotalRuleSetSlotsAvailable ? TotalRuleSetSlotsAvailable : ruleSets.Count).ToList();

            var ruleSetsVM = new List<RuleSetViewModel>();
            foreach (var ruleSet in ruleSets)
                ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet, id));

            return ruleSetsVM.OrderBy(x => x.SortOrder).ThenBy(x => x.RuleSetName).ToList();
        }

        [HttpPost("CreateRuleSet")]
        public async Task<IActionResult> CreateRuleSet([FromBody] RuleSetViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var _userId = GetUserId();
                    var ruleSetDomain = Mapper.Map<RuleSet>(model);

                    await TotalRuleSetSlotsAvailableForCurrentUser();
                    //Limit user to have max 3 ruleset & //purchase for more sets
                    if (await _ruleSetService.GetRuleSetsCountByUserId(_userId) >= TotalRuleSetSlotsAvailable && !IsAdminUser())
                        return BadRequest("Only " + TotalRuleSetSlotsAvailable + " slots of Rule Sets are allowed.");

                    if (IsAdminUser()) ruleSetDomain.IsCoreRuleset = true;
                    else ruleSetDomain.IsCoreRuleset = false;

                    ruleSetDomain.CurrencyLabel = model.CurrencyLabel == null ? model.CurrencyName : model.CurrencyLabel;
                    ruleSetDomain.CurrencyBaseUnit = 1;
                    ruleSetDomain.isActive = true;
                    ruleSetDomain.ShareCode = Guid.NewGuid();
                    ruleSetDomain.OwnerId = _userId;
                    ruleSetDomain.CreatedBy = _userId;
                    ruleSetDomain.CreatedDate = DateTime.Now;
                    ruleSetDomain.ModifiedBy = _userId;
                    ruleSetDomain.ModifiedDate = DateTime.Now;

                    if (_ruleSetService.IsRuleSetExist(model.RuleSetName, _userId).Result)
                        return BadRequest("The Rule Set Name " + model.RuleSetName + " had already been used. Please select another name.");

                    await _ruleSetService.Insert(ruleSetDomain);
                    //await addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                    List<CustomDice> result = _addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                    List<DiceTray> diceTrayResult = _addEditDiceTray(result, model.diceTray.ToList(), ruleSetDomain.RuleSetId);
                    List<CurrencyType> CurrencyTypes = await _addCurrencyTypes(model.CurrencyTypeVM, ruleSetDomain.RuleSetId);

                    // System.IO.File.Delete(path);
                    return Ok(ruleSetDomain);
                }
                catch (Exception ex) { return BadRequest(ex.Message); }
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }


        [HttpPost("addRuleSets")]
        public async Task<IActionResult> addRuleSets([FromBody] int[] rulesetIds)
        {
            try
            {
                return await AddCoreRuleSetsCommon(rulesetIds);
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }

        [HttpPost("updateUserPurchasedRuleset")]
        public async Task<IActionResult> updateUserPurchasedRuleset([FromBody] RuleSet model)
        {
            try
            {
                await _ruleSetService.updateUserPurchasedRuleset(model.RuleSetId, GetUserId());
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }
        ////This Method is also written on Charater Controller
        private async Task<IActionResult> AddCoreRuleSetsCommon(int[] rulesetIds)
        {
            try
            {
                var _userId = GetUserId();

                await TotalRuleSetSlotsAvailableForCurrentUser();
                //Limit user to have max 3 ruleset & //purchase for more sets
                if (await _ruleSetService.GetRuleSetsCountByUserId(_userId) >= TotalRuleSetSlotsAvailable && !IsAdminUser())
                    return BadRequest("Only " + TotalRuleSetSlotsAvailable + " slots of Rule Sets are allowed.");
                int newAddedRulesetID = 0;
                foreach (var _id in rulesetIds)
                {

                    /////////////OLD 15Nov 2018//////////////////
                    // var _addRuleset = GetRuleset(_id);
                    //if (IsAdminUser())  _addRuleset.IsCoreRuleset = true;
                    //else _addRuleset.IsCoreRuleset = false;

                    //if (_ruleSetService.IsRuleSetExist(_addRuleset.RuleSetName, _userId).Result)
                    //    return BadRequest("The Rule Set Name " + _addRuleset.RuleSetName + " had already been used. Please select another name.");

                    //var _rulesetData = Mapper.Map<RuleSet>(_addRuleset);
                    //_rulesetData.isActive = true;
                    //_rulesetData.ShareCode = Guid.NewGuid();
                    //_rulesetData.OwnerId = _userId;
                    //_rulesetData.CreatedBy = _userId;
                    //_rulesetData.CreatedDate = DateTime.Now;
                    //RuleSet res = await _ruleSetService.duplicateRuleset(_rulesetData, _id, _userId);
                    ///////////// END OLD 15Nov 2018//////////////////

                    /////15 nov 2018 Import RuleSet/////////////////////
                    var _addRuleset = Utilities.GetRuleset(_id, _ruleSetService);
                    int Count = 1;
                    string newRulesetName = _addRuleset.RuleSetName;
                    bool rulesetExists = false;
                    do
                    {
                        rulesetExists = _ruleSetService.IsRuleSetExist(newRulesetName, _userId).Result;
                        if (rulesetExists)
                        {
                            newRulesetName = _addRuleset.RuleSetName + "_" + Count;
                            Count++;
                        }


                    } while (rulesetExists);

                    //if (_ruleSetService.IsRuleSetExist(_addRuleset.RuleSetName, _userId).Result)
                    //    return BadRequest("The Rule Set Name " + _addRuleset.RuleSetName + " had already been used. Please select another name.");

                    var _rulesetData = Mapper.Map<RuleSet>(_addRuleset);
                    _rulesetData.isActive = true;
                    _rulesetData.ShareCode = null;//Guid.NewGuid(); //not used in sp
                    _rulesetData.OwnerId = _userId;
                    _rulesetData.CreatedBy = _userId;
                    _rulesetData.CreatedDate = DateTime.Now;
                    _rulesetData.RuleSetName = newRulesetName;

                    _addRuleset.IsCoreRuleset = false;//not used in sp

                    RuleSet res = await _ruleSetService.AddCoreRuleset(_rulesetData, _id, _userId);
                    newAddedRulesetID = res.RuleSetId;
                    CopyCustomDiceToNewRuleSet(_id, res.RuleSetId);

                    /////End 15 nov 2018 Import RuleSet/////////////////////
                    ///
                    //var result = await _ruleSetService.Insert(_rulesetData);

                    //var characterStats = _characterStatService.GetCharacterStatRuleSetId(_id);
                    //foreach (var characterStat in characterStats)
                    //{
                    //    var newCharacterStat = await _characterStatService.InsertCharacterStat(new CharacterStat()
                    //    {
                    //        RuleSetId = result.RuleSetId,
                    //        StatName = characterStat.StatName,
                    //        StatDesc = characterStat.StatDesc,
                    //        CharacterStatTypeId = characterStat.CharacterStatTypeId,
                    //        isActive = characterStat.isActive,
                    //        OwnerId = _userId,
                    //        CreatedBy = _userId,
                    //        CreatedDate = DateTime.Now,
                    //        ModifiedBy = _userId,
                    //        ModifiedDate = DateTime.Now,
                    //        isMultiSelect = characterStat.isActive,
                    //        //  ParentCharacterStatId = characterStat.CharacterStatId ,
                    //        SortOrder = characterStat.SortOrder
                    //    });

                    //    if (characterStat.CharacterStatCalcs != null && characterStat.CharacterStatCalcs.Count > 0)
                    //    {
                    //        foreach (var cscViewModels in characterStat.CharacterStatCalcs)
                    //        {
                    //            await _characterStatCalcService.InsertCharacterStatCalc(new CharacterStatCalc()
                    //            {
                    //                StatCalculation = cscViewModels.StatCalculation,
                    //                CharacterStatId = newCharacterStat.CharacterStatId
                    //            });
                    //        }
                    //    }

                    //    if (characterStat.CharacterStatChoices != null && characterStat.CharacterStatChoices.Count > 0)
                    //    {
                    //        foreach (var cscViewModels in characterStat.CharacterStatChoices)
                    //        {
                    //            await _characterStatChoiceService.InsertCharacterStatChoice(new CharacterStatChoice()
                    //            {
                    //                StatChoiceValue = cscViewModels.StatChoiceValue,
                    //                CharacterStatId = newCharacterStat.CharacterStatId
                    //            });
                    //        }
                    //    }
                    //}
                    //var itemMasters = _itemMasterService.GetItemMastersByRuleSetId(_id);
                    //foreach (var item in itemMasters)
                    //{
                    //    var ItemMaster = new ItemMaster()
                    //    {
                    //        ItemName = item.ItemName,
                    //        ItemImage = item.ItemImage,
                    //        ItemStats = item.ItemStats,
                    //        ItemVisibleDesc = item.ItemVisibleDesc,
                    //        Command = item.Command,
                    //        ItemCalculation = item.ItemCalculation,
                    //        Value = item.Value,
                    //        Volume = item.Volume,
                    //        Weight = item.Weight,
                    //        IsContainer = item.IsContainer,
                    //        IsMagical = item.IsMagical,
                    //        IsConsumable = item.IsConsumable,
                    //        ContainerWeightMax = item.ContainerWeightMax,
                    //        ContainerWeightModifier = item.ContainerWeightModifier,
                    //        ContainerVolumeMax = item.ContainerVolumeMax,
                    //        PercentReduced = item.PercentReduced,
                    //        TotalWeightWithContents = item.TotalWeightWithContents,
                    //        Metatags = item.Metatags,
                    //        Rarity = item.Rarity,
                    //        RuleSetId = result.RuleSetId
                    //        //ParentItemMasterId=model.ParentRuleSetId
                    //    };

                    //    var ItemMasterAbilities = item.ItemMasterAbilities.ToList();
                    //    var ItemMasterSpell = item.ItemMasterSpell.ToList();

                    //    var resultItemMaster = await _itemMasterService.CreateItemMaster(ItemMaster, ItemMasterSpell, ItemMasterAbilities);
                    //    if (item.ItemMasterCommand != null)
                    //    {
                    //        foreach (var cmd in item.ItemMasterCommand)
                    //        {
                    //            await _iItemMasterCommandService.InsertItemMasterCommand(new ItemMasterCommand()
                    //            {
                    //                Command = cmd.Command,
                    //                Name = cmd.Name,
                    //                ItemMasterId = resultItemMaster.ItemMasterId
                    //            });
                    //        }
                    //    }
                    //}
                    ////-----spell
                    //var spells = _spellService.GetSpellsByRuleSetId(_id);
                    //foreach (var spell in spells)
                    //{
                    //    var _spell = new Spell()
                    //    {
                    //        Name = spell.Name,
                    //        School = spell.School,
                    //        Class = spell.Class,
                    //        Levels = spell.Levels,
                    //        Command = spell.Command,
                    //        MaterialComponent = spell.MaterialComponent,
                    //        IsMaterialComponent = spell.IsMaterialComponent,
                    //        IsSomaticComponent = spell.IsSomaticComponent,
                    //        IsVerbalComponent = spell.IsVerbalComponent,
                    //        CastingTime = spell.CastingTime,
                    //        Description = spell.Description,
                    //        Stats = spell.Stats,
                    //        HitEffect = spell.HitEffect,
                    //        MissEffect = spell.MissEffect,
                    //        EffectDescription = spell.EffectDescription,
                    //        ShouldCast = spell.ShouldCast,
                    //        ImageUrl = spell.ImageUrl,
                    //        Memorized = spell.Memorized,
                    //        Metatags = spell.Metatags,
                    //        RuleSetId = result.RuleSetId
                    //    };
                    //    var resultSpell = await _spellService.Create(_spell);
                    //    if (spell.SpellCommand != null)
                    //    {
                    //        foreach (var cmd in spell.SpellCommand)
                    //        {
                    //            await _spellCommandService.InsertSpellCommand(new SpellCommand()
                    //            {
                    //                Command = cmd.Command,
                    //                Name = cmd.Name,
                    //                SpellId = resultSpell.SpellId
                    //            });
                    //        }
                    //    }
                    //}
                    ////---Ability
                    //var abilitiesList = _abilityService.GetAbilitiesByRuleSetId(_id);
                    //foreach (var ability in abilitiesList)
                    //{
                    //    var _ability = new Ability()
                    //    {
                    //        Name = ability.Name,
                    //        Level = ability.Level,
                    //        Command = ability.Command,
                    //        Description = ability.Description,
                    //        Stats = ability.Stats,
                    //        ImageUrl = ability.ImageUrl,
                    //        IsEnabled = ability.IsEnabled,
                    //        Metatags = ability.Metatags,
                    //        CurrentNumberOfUses = ability.CurrentNumberOfUses,
                    //        MaxNumberOfUses = ability.MaxNumberOfUses,
                    //        RuleSetId = result.RuleSetId
                    //    };
                    //    var resultAbility = await _abilityService.Create(_ability);
                    //    if (ability.AbilityCommand != null)
                    //    {
                    //        foreach (var cmd in ability.AbilityCommand)
                    //        {
                    //            await _abilityCommandService.InsertAbilityCommand(new AbilityCommand()
                    //            {
                    //                Command = cmd.Command,
                    //                Name = cmd.Name,
                    //                AbilityId = resultAbility.AbilityId
                    //            });
                    //        }
                    //    }
                    //}

                    //var rulesetLayouts = _rulesetDashboardLayoutService.GetByRulesetId(_id).Result;
                    //if (rulesetLayouts != null)
                    //{
                    //    int count = 0;
                    //    foreach (var layout in rulesetLayouts)
                    //    {
                    //        count += 1;
                    //        var _characterDashboardLayout = await _rulesetDashboardLayoutService.Create(new RulesetDashboardLayout()
                    //        {
                    //            Name = layout.Name,
                    //            LayoutHeight = layout.LayoutHeight,
                    //            LayoutWidth = layout.LayoutWidth,
                    //            RulesetId = result.RuleSetId,
                    //            SortOrder = 1,
                    //            IsDefaultLayout = count == 1 ? true : false
                    //        });

                    //        var rulesetPages = _rulesetDashboardPageService.GetByLayoutId(layout.RulesetDashboardLayoutId);
                    //        if (rulesetPages != null)
                    //        {
                    //            count = 2;
                    //            foreach (var page in rulesetPages)
                    //            {
                    //                var _characterDashboardPage = await _rulesetDashboardPageService.Create(new RulesetDashboardPage()
                    //                {
                    //                    RulesetDashboardLayoutId = _characterDashboardLayout.RulesetDashboardLayoutId,
                    //                    Name = page.Name,
                    //                    ContainerWidth = page.ContainerWidth,
                    //                    ContainerHeight = page.ContainerHeight,
                    //                    BodyBgColor = page.BodyBgColor,
                    //                    BodyTextColor = page.BodyTextColor,
                    //                    TitleBgColor = page.TitleBgColor,
                    //                    TitleTextColor = page.TitleTextColor,
                    //                    SortOrder = 1,
                    //                    RulesetId = result.RuleSetId
                    //                });
                    //                if (count == 2)
                    //                {
                    //                    _characterDashboardLayout.DefaultPageId = _characterDashboardPage.RulesetDashboardPageId;
                    //                    await _rulesetDashboardLayoutService.Update(_characterDashboardLayout);
                    //                    count += 1;
                    //                }

                    //                var rulesetTiles = _rulesetTileService.GetByPageIdRulesetId(page.RulesetDashboardPageId, page.RulesetId ?? 0);
                    //                if (rulesetTiles != null)
                    //                {
                    //                    foreach (var _tile in rulesetTiles)
                    //                    {
                    //                        var Tile = new RulesetTile
                    //                        {
                    //                            RulesetDashboardPageId = _characterDashboardPage.RulesetDashboardPageId,
                    //                            RulesetId = result.RuleSetId,
                    //                            Height = _tile.Height,
                    //                            Width = _tile.Width,
                    //                            LocationX = _tile.LocationX,
                    //                            LocationY = _tile.LocationY,
                    //                            Shape = _tile.Shape,
                    //                            SortOrder = _tile.SortOrder,
                    //                            TileTypeId = _tile.TileTypeId
                    //                        };

                    //                        switch (Tile.TileTypeId)
                    //                        {
                    //                            case (int)Enum.TILES.NOTE:
                    //                                if (_tile.NoteTiles == null) break;
                    //                                await _rulesetTileService.Create(Tile);
                    //                                RulesetNoteTile noteTile = _tile.NoteTiles;
                    //                                Tile.NoteTiles = await _noteTileService.Create(new RulesetNoteTile
                    //                                {
                    //                                    RulesetTileId = Tile.RulesetTileId,
                    //                                    Title = noteTile.Title,
                    //                                    Shape = noteTile.Shape,
                    //                                    SortOrder = noteTile.SortOrder,
                    //                                    Content = noteTile.Content,
                    //                                    BodyBgColor = noteTile.BodyBgColor,
                    //                                    BodyTextColor = noteTile.BodyTextColor,
                    //                                    TitleBgColor = noteTile.TitleBgColor,
                    //                                    TitleTextColor = noteTile.TitleTextColor,
                    //                                    IsDeleted = false
                    //                                });
                    //                                SaveColorsAsync(Tile);
                    //                                break;
                    //                            case (int)Enum.TILES.IMAGE:
                    //                                if (_tile.ImageTiles == null) break;
                    //                                await _rulesetTileService.Create(Tile);
                    //                                var imageTile = _tile.ImageTiles;
                    //                                Tile.ImageTiles = await _imageTileService.Create(new RulesetImageTile
                    //                                {
                    //                                    RulesetTileId = Tile.RulesetTileId,
                    //                                    Title = imageTile.Title,
                    //                                    Shape = imageTile.Shape,
                    //                                    SortOrder = imageTile.SortOrder,
                    //                                    BodyBgColor = imageTile.BodyBgColor,
                    //                                    BodyTextColor = imageTile.BodyTextColor,
                    //                                    TitleBgColor = imageTile.TitleBgColor,
                    //                                    TitleTextColor = imageTile.TitleTextColor,
                    //                                    IsDeleted = false,
                    //                                    ImageUrl = imageTile.ImageUrl
                    //                                });
                    //                                SaveColorsAsync(Tile);
                    //                                break;
                    //                            case (int)Enum.TILES.COUNTER:
                    //                                if (_tile.CounterTiles == null) break;
                    //                                await _rulesetTileService.Create(Tile);
                    //                                var counterTile = _tile.CounterTiles;
                    //                                Tile.CounterTiles = await _counterTileService.Create(new RulesetCounterTile
                    //                                {
                    //                                    RulesetTileId = Tile.RulesetTileId,
                    //                                    Title = counterTile.Title,
                    //                                    Shape = counterTile.Shape,
                    //                                    SortOrder = counterTile.SortOrder,
                    //                                    BodyBgColor = counterTile.BodyBgColor,
                    //                                    BodyTextColor = counterTile.BodyTextColor,
                    //                                    TitleBgColor = counterTile.TitleBgColor,
                    //                                    TitleTextColor = counterTile.TitleTextColor,
                    //                                    CurrentValue = counterTile.CurrentValue,
                    //                                    DefaultValue = counterTile.DefaultValue,
                    //                                    Maximum = counterTile.Maximum,
                    //                                    Minimum = counterTile.Minimum,
                    //                                    Step = counterTile.Step,
                    //                                    IsDeleted = false
                    //                                });
                    //                                SaveColorsAsync(Tile);
                    //                                break;
                    //                            case (int)Enum.TILES.CHARACTERSTAT:
                    //                                if (_tile.CharacterStatTiles == null) break;
                    //                                await _rulesetTileService.Create(Tile);
                    //                                var characterStatTile = _tile.CharacterStatTiles;
                    //                                Tile.CharacterStatTiles = await _characterStatTileService.Create(new RulesetCharacterStatTile
                    //                                {
                    //                                    RulesetTileId = Tile.RulesetTileId,
                    //                                    CharacterStatId = characterStatTile.CharacterStatId,
                    //                                    ShowTitle = characterStatTile.ShowTitle,
                    //                                    Shape = characterStatTile.Shape,
                    //                                    SortOrder = characterStatTile.SortOrder,
                    //                                    bodyBgColor = characterStatTile.bodyBgColor,
                    //                                    bodyTextColor = characterStatTile.bodyTextColor,
                    //                                    titleBgColor = characterStatTile.titleBgColor,
                    //                                    titleTextColor = characterStatTile.titleTextColor,
                    //                                    IsDeleted = false
                    //                                });
                    //                                SaveColorsAsync(Tile);
                    //                                break;
                    //                            case (int)Enum.TILES.LINK: break;
                    //                            case (int)Enum.TILES.EXECUTE: break;
                    //                            case (int)Enum.TILES.COMMAND:
                    //                                if (_tile.CommandTiles == null) break;
                    //                                await _rulesetTileService.Create(Tile);
                    //                                var commandTile = _tile.CommandTiles;
                    //                                Tile.CommandTiles = await _commandTileService.Create(new RulesetCommandTile
                    //                                {
                    //                                    RulesetTileId = Tile.RulesetTileId,
                    //                                    Title = commandTile.Title,
                    //                                    Shape = commandTile.Shape,
                    //                                    SortOrder = commandTile.SortOrder,
                    //                                    ImageUrl = commandTile.ImageUrl,
                    //                                    BodyBgColor = commandTile.BodyBgColor,
                    //                                    BodyTextColor = commandTile.BodyTextColor,
                    //                                    TitleBgColor = commandTile.TitleBgColor,
                    //                                    TitleTextColor = commandTile.TitleTextColor,
                    //                                    IsDeleted = false
                    //                                });
                    //                                SaveColorsAsync(Tile);
                    //                                break;
                    //                            default: break;
                    //                        }
                    //                        try
                    //                        {
                    //                            await _rulesetTileConfigService.CreateAsync(new RulesetTileConfig
                    //                            {
                    //                                RulesetTileId = Tile.RulesetTileId,
                    //                                Col = _tile.Config.Col,
                    //                                Row = _tile.Config.Row,
                    //                                SizeX = _tile.Config.SizeX,
                    //                                SizeY = _tile.Config.SizeY,
                    //                                SortOrder = _tile.Config.SortOrder,
                    //                                UniqueId = _tile.Config.UniqueId,
                    //                                Payload = _tile.Config.Payload,
                    //                                IsDeleted = false
                    //                            });
                    //                        }
                    //                        catch { }
                    //                    }
                    //                }//end tile
                    //            }
                    //        }
                    //    }
                    //}
                }
                // System.IO.File.Delete(path);
                return Ok(newAddedRulesetID);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("UpLoadRuleSetImageBlob")]
        public async Task<IActionResult> UpLoadRuleSetImageBlob()
        {

            if (_httpContextAccessor.HttpContext.Request.Form.Files.Any())
            {
                // Get the uploaded image from the Files collection
                var httpPostedFile = _httpContextAccessor.HttpContext.Request.Form.Files["UploadedImage"];

                if (httpPostedFile != null)
                {
                    BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _ruleSetService);
                    var container = bs.GetCloudBlobContainer().Result;
                    string imageName = Guid.NewGuid().ToString();
                    dynamic Response = new ExpandoObject();
                    Response.ImageUrl = bs.UploadImages(httpPostedFile, imageName, container).Result;
                    Response.ThumbnailUrl = bs.UploadThumbnail(httpPostedFile, imageName, container).Result;

                    return Ok(Response);
                }

                return BadRequest();
            }
            return BadRequest("No Image Selected");

        }

        [HttpDelete("DeleteRuleSet")]
        public async Task<IActionResult> DeleteRuleSet(int Id)
        {
            try
            {
                //var characters = _characterService.GetCharacterRuleSetId(Id);
                //if (characters.Count > 0)
                //    return BadRequest("Ruleset cannot be deleted, as it is associated with Character(s).");
                //else
                //{
                //    var characterStats = _characterStatService.GetCharacterStatRuleSetId(Id);
                //    foreach (var characterStat in characterStats.ToArray())
                //    {
                //        foreach (var calCmd in characterStat.CharacterStatCalcs.ToArray())
                //            await _characterStatCalcService.DeleteCharacterStatCalc(calCmd.CharacterStatCalcId);
                //        foreach (var choice in characterStat.CharacterStatChoices.ToArray())
                //            await _characterStatChoiceService.DeleteCharacterStatChoice(choice.CharacterStatChoiceId);

                //        await _characterStatService.DeleteCharacterStat(characterStat.CharacterStatId);
                //    }
                _ruleSetService.removeAllDice(Id);
                _ruleSetService.removeDiceTray(Id);
                await _ruleSetService.DeleteRuleSet(Id);
                BlobService bs = new BlobService(_httpContextAccessor, _accountManager, _ruleSetService);
                await bs.DeleteBlobContainer("user-" + GetUserId() + "-handout" + "-" + Id);
                return Ok();
                //  }
            }
            catch (Exception ex)
            {
                if (ex.InnerException.Message.Contains("The DELETE statement conflicted with the REFERENCE constraint"))
                    return BadRequest("Ruleset cannot be deleted, as it is associated with Character(s).");
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("UpdateRuleSet")]
        public async Task<IActionResult> UpdateRuleSet([FromBody]  RuleSetViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var userId = GetUserId();
                    var ruleSetDomain = _ruleSetService.GetRuleSetById(model.RuleSetId).Result;

                    //if (IsAdminUser())
                    //    ruleSetDomain.IsCoreRuleset = true;
                    //else
                    //    ruleSetDomain.IsCoreRuleset = false;

                    ruleSetDomain.RuleSetName = model.RuleSetName;
                    ruleSetDomain.RuleSetDesc = model.RuleSetDesc;
                    ruleSetDomain.CurrencyLabel = model.CurrencyLabel == null ? model.CurrencyName : model.CurrencyLabel;
                    ruleSetDomain.DistanceLabel = model.DistanceLabel;
                    ruleSetDomain.DefaultDice = model.DefaultDice;
                    ruleSetDomain.RuleSetId = model.RuleSetId;
                    ruleSetDomain.ImageUrl = model.ImageUrl;
                    ruleSetDomain.ThumbnailUrl = model.ThumbnailUrl;
                    ruleSetDomain.VolumeLabel = model.VolumeLabel;
                    ruleSetDomain.WeightLabel = model.WeightLabel;
                    ruleSetDomain.SortOrder = model.SortOrder;
                    ruleSetDomain.ModifiedBy = userId;
                    ruleSetDomain.IsAbilityEnabled = model.IsAbilityEnabled;
                    ruleSetDomain.IsItemEnabled = model.IsItemEnabled;
                    ruleSetDomain.IsSpellEnabled = model.IsSpellEnabled;
                    ruleSetDomain.IsBuffAndEffectEnabled = model.IsBuffAndEffectEnabled;
                    ruleSetDomain.IsAllowSharing = model.IsAllowSharing;
                    ruleSetDomain.ShareCode = model.ShareCode;
                    ruleSetDomain.ModifiedDate = DateTime.Now;
                    ruleSetDomain.AutoDeleteItems = model.AutoDeleteItems;

                    ruleSetDomain.CurrencyName = model.CurrencyName;
                    ruleSetDomain.CurrencyWeight = model.CurrencyWeight;
                    ruleSetDomain.CurrencyBaseUnit = 1;

                    if (_ruleSetService.IsRuleSetExist(model.RuleSetName, userId, model.RuleSetId).Result)
                        return BadRequest("Duplicate RuleSet Name");

                    var UpdatedRuleset = await _ruleSetService.UdateRuleSet(ruleSetDomain);
                    //if (UpdatedRuleset != null)
                    //{
                    //    GroupChatHub.EditParticipant(UpdatedRuleset);
                    //}
                    List<CustomDice> result = _addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                    List<DiceTray> diceTrayResult = _addEditDiceTray(result, model.diceTray.ToList(), ruleSetDomain.RuleSetId);

                    List<CurrencyType> CurrencyTypes = await _updateCurrencyTypes(model.CurrencyTypeVM, ruleSetDomain.RuleSetId);
                    return Ok(ruleSetDomain);
                }
                catch (Exception ex) { return BadRequest(ex.Message); }
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("AddRuleSetToUser")]
        public async Task<IActionResult> UpdateRuleSet([FromBody] int RuleSetId)
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = await _accountManager.GetUserByUserNameAsync(userName);

            UserRuleSet userRuleSet = new UserRuleSet();
            userRuleSet.RuleSetId = RuleSetId;
            userRuleSet.UserId = appUser.Id;
            var isRuleSetExistForUser = await _ruleSetService.AssignRuleSetToUser(userRuleSet);

            if (!isRuleSetExistForUser)
            {
                return Ok("The Rule Set Already Associated With User");
            }
            else
            {
                return Ok();
            }
        }

        [AllowAnonymous]
        [HttpPost("DuplicateRuleSet")]
        public async Task<IActionResult> DuplicateRuleSet([FromBody] RuleSetViewModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var userId = GetUserId();
                    await TotalRuleSetSlotsAvailableForCurrentUser();
                    if (await _ruleSetService.GetRuleSetsCountByUserId(userId) >= TotalRuleSetSlotsAvailable && !IsAdminUser())
                        return BadRequest("Only " + TotalRuleSetSlotsAvailable + " slots of Rule Sets are allowed. For more slots, please contact administrator.");


                    if (_ruleSetService.IsRuleSetExist(model.RuleSetName, userId).Result)
                        return BadRequest("The Rule Set Name " + model.RuleSetName + " had already been used. Please select another name.");

                    var ruleSetDomain = Mapper.Map<RuleSet>(model);
                    ruleSetDomain.isActive = true;
                    ruleSetDomain.ShareCode = IsAdminUser() ? (Guid?)Guid.NewGuid() : null;
                    ruleSetDomain.IsAllowSharing = IsAdminUser() ? model.IsAllowSharing : false;
                    ruleSetDomain.IsCoreRuleset = false;
                    ruleSetDomain.OwnerId = userId;
                    ruleSetDomain.CreatedBy = userId;
                    ruleSetDomain.CreatedDate = DateTime.Now;
                    ruleSetDomain.ModifiedBy = userId;
                    ruleSetDomain.ModifiedDate = DateTime.Now;
                    //ruleSetDomain.RuleSetId = 0;
                    ruleSetDomain.CurrencyLabel = model.CurrencyLabel == null ? model.CurrencyName : model.CurrencyLabel;
                    ruleSetDomain.CurrencyBaseUnit = 1;

                    int? parentRulesetID = _ruleSetService.GetRuleSetById(model.RuleSetId).Result.ParentRuleSetId;
                    if (parentRulesetID != null)
                    {
                        if (parentRulesetID > 0)
                        {
                            RuleSet DupCoreRuleset = await _ruleSetService.duplicateAddedRuleset(ruleSetDomain, model.RuleSetId, userId);
                            ruleSetDomain.RuleSetId = DupCoreRuleset.RuleSetId;
                            //await addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                            List<CustomDice> _result = _addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                            List<DiceTray> _diceTrayResult = _addEditDiceTray(_result, model.diceTray.ToList(), ruleSetDomain.RuleSetId);
                            List<CurrencyType> _CurrencyTypes = await _addCurrencyTypes(model.CurrencyTypeVM, ruleSetDomain.RuleSetId);
                            return Ok(ruleSetDomain);
                        }
                    }
                    RuleSet res = await _ruleSetService.duplicateRuleset(ruleSetDomain, model.RuleSetId, userId);
                    ruleSetDomain.RuleSetId = res.RuleSetId;
                    //await addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                    List<CustomDice> result = _addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                    List<DiceTray> diceTrayResult = _addEditDiceTray(result, model.diceTray.ToList(), ruleSetDomain.RuleSetId);
                    List<CurrencyType> CurrencyTypes = await _addCurrencyTypes(model.CurrencyTypeVM, ruleSetDomain.RuleSetId);

                    return Ok(ruleSetDomain);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                //var result = await _ruleSetService.Insert(ruleSetDomain);

                //var characterStats = _characterStatService.GetCharacterStatRuleSetId(model.RuleSetId);
                //foreach (var characterStat in characterStats)
                //{
                //    var newCharacterStat = await _characterStatService.InsertCharacterStat(new CharacterStat()
                //    {
                //        RuleSetId = result.RuleSetId,
                //        StatName = characterStat.StatName,
                //        StatDesc = characterStat.StatDesc,
                //        CharacterStatTypeId = characterStat.CharacterStatTypeId,
                //        isActive = characterStat.isActive,
                //        OwnerId = userId,
                //        CreatedBy = userId,
                //        CreatedDate = DateTime.Now,
                //        ModifiedBy = userId,
                //        ModifiedDate = DateTime.Now,
                //        isMultiSelect = characterStat.isActive,
                //      //  ParentCharacterStatId = characterStat.CharacterStatId ,
                //        SortOrder = characterStat.SortOrder
                //    });

                //    if (characterStat.CharacterStatCalcs != null && characterStat.CharacterStatCalcs.Count > 0)
                //    {
                //        foreach (var cscViewModels in characterStat.CharacterStatCalcs)
                //        {
                //            await _characterStatCalcService.InsertCharacterStatCalc(new CharacterStatCalc()
                //            {
                //                StatCalculation = cscViewModels.StatCalculation,
                //                CharacterStatId = newCharacterStat.CharacterStatId
                //            });
                //        }
                //    }

                //    if (characterStat.CharacterStatChoices != null && characterStat.CharacterStatChoices.Count > 0)
                //    {
                //        foreach (var cscViewModels in characterStat.CharacterStatChoices)
                //        {
                //            await _characterStatChoiceService.InsertCharacterStatChoice(new CharacterStatChoice()
                //            {
                //                StatChoiceValue = cscViewModels.StatChoiceValue,
                //                CharacterStatId = newCharacterStat.CharacterStatId
                //            });
                //        }
                //    }
                //}

                ////await Task.Run(() =>  {
                ////    //This code runs on a new thread, control is returned to the caller on the UI thread.


                //// Process pr = new Process();
                //// ProcessStartInfo prs = new ProcessStartInfo();
                ////// prs.
                ////// Thread th = new Thread(new ThreadStart());
                //// pr.StartInfo = prs;

                //// ThreadStart ths = new ThreadStart(() => {
                ////     bool ret = pr.Start();
                ////     //is ret what you expect it to be....
                //// });

                ////Thread t = new Thread(()=>_rulesetTileService.BGProcess(result.RuleSetId, userId));
                ////t.IsBackground = true;
                ////t.Start();
                //////t.Join();


                //var itemMasters = _itemMasterService.GetItemMastersByRuleSetId(model.RuleSetId);
                //foreach (var item in itemMasters)
                //{
                //    var ItemMaster = new ItemMaster()
                //    {
                //        ItemName = item.ItemName,
                //        ItemImage = item.ItemImage,
                //        ItemStats = item.ItemStats,
                //        ItemVisibleDesc = item.ItemVisibleDesc,
                //        Command = item.Command,
                //        ItemCalculation = item.ItemCalculation,
                //        Value = item.Value,
                //        Volume = item.Volume,
                //        Weight = item.Weight,
                //        IsContainer = item.IsContainer,
                //        IsMagical = item.IsMagical,
                //        IsConsumable = item.IsConsumable,
                //        ContainerWeightMax = item.ContainerWeightMax,
                //        ContainerWeightModifier = item.ContainerWeightModifier,
                //        ContainerVolumeMax = item.ContainerVolumeMax,
                //        PercentReduced = item.PercentReduced,
                //        TotalWeightWithContents = item.TotalWeightWithContents,
                //        Metatags = item.Metatags,
                //        Rarity = item.Rarity,
                //        RuleSetId = result.RuleSetId
                //        //ParentItemMasterId=model.ParentRuleSetId
                //    };

                //    var ItemMasterAbilities = item.ItemMasterAbilities.ToList();
                //    var ItemMasterSpell = item.ItemMasterSpell.ToList();

                //    var resultItemMaster = await _itemMasterService.CreateItemMaster(ItemMaster, ItemMasterSpell, ItemMasterAbilities);
                //    if (item.ItemMasterCommand != null)
                //    {
                //        foreach (var cmd in item.ItemMasterCommand)
                //        {
                //            await _iItemMasterCommandService.InsertItemMasterCommand(new ItemMasterCommand()
                //            {
                //                Command = cmd.Command,
                //                Name = cmd.Name,
                //                ItemMasterId = resultItemMaster.ItemMasterId
                //            });
                //        }
                //    }
                //}
                ////-----spell
                //var spells = _spellService.GetSpellsByRuleSetId(model.RuleSetId);
                //foreach (var spell in spells)
                //{
                //    var _spell = new Spell()
                //    {
                //        Name = spell.Name,
                //        School = spell.School,
                //        Class = spell.Class,
                //        Levels = spell.Levels,
                //        Command = spell.Command,
                //        MaterialComponent = spell.MaterialComponent,
                //        IsMaterialComponent = spell.IsMaterialComponent,
                //        IsSomaticComponent = spell.IsSomaticComponent,
                //        IsVerbalComponent = spell.IsVerbalComponent,
                //        CastingTime = spell.CastingTime,
                //        Description = spell.Description,
                //        Stats = spell.Stats,
                //        HitEffect = spell.HitEffect,
                //        MissEffect = spell.MissEffect,
                //        EffectDescription = spell.EffectDescription,
                //        ShouldCast = spell.ShouldCast,
                //        ImageUrl = spell.ImageUrl,
                //        Memorized = spell.Memorized,
                //        Metatags = spell.Metatags,
                //        RuleSetId = result.RuleSetId
                //    };
                //    var resultSpell = await _spellService.Create(_spell);
                //    if (spell.SpellCommand != null)
                //    {
                //        foreach (var cmd in spell.SpellCommand)
                //        {
                //            await _spellCommandService.InsertSpellCommand(new SpellCommand()
                //            {
                //                Command = cmd.Command,
                //                Name = cmd.Name,
                //                SpellId = resultSpell.SpellId
                //            });
                //        }
                //    }
                //}
                ////---Ability
                //var abilitiesList = _abilityService.GetAbilitiesByRuleSetId(model.RuleSetId);
                //foreach (var ability in abilitiesList)
                //{
                //    var _ability = new Ability()
                //    {
                //        Name = ability.Name,
                //        Level = ability.Level,
                //        Command = ability.Command,
                //        Description = ability.Description,
                //        Stats = ability.Stats,
                //        ImageUrl = ability.ImageUrl,
                //        IsEnabled = ability.IsEnabled,
                //        Metatags = ability.Metatags,
                //        CurrentNumberOfUses = ability.CurrentNumberOfUses,
                //        MaxNumberOfUses = ability.MaxNumberOfUses,
                //        RuleSetId= result.RuleSetId
                //    };
                //    var resultAbility = await _abilityService.Create(_ability);
                //    if (ability.AbilityCommand != null)
                //    {
                //        foreach (var cmd in ability.AbilityCommand)
                //        {
                //            await _abilityCommandService.InsertAbilityCommand(new AbilityCommand()
                //            {
                //                Command = cmd.Command,
                //                Name = cmd.Name,
                //                AbilityId = resultAbility.AbilityId
                //            });
                //        }
                //    }
                //}

                //var rulesetLayouts = _rulesetDashboardLayoutService.GetByRulesetId(model.RuleSetId).Result;
                //if (rulesetLayouts != null)
                //{
                //    int count = 0;
                //    foreach (var layout in rulesetLayouts)
                //    {
                //        count += 1;
                //        var _characterDashboardLayout = await _rulesetDashboardLayoutService.Create(new RulesetDashboardLayout()
                //        {
                //            Name = layout.Name,
                //            LayoutHeight = layout.LayoutHeight,
                //            LayoutWidth = layout.LayoutWidth,
                //            RulesetId = result.RuleSetId,
                //            SortOrder = 1,
                //            IsDefaultLayout = count == 1 ? true : false
                //        });

                //        var rulesetPages = _rulesetDashboardPageService.GetByLayoutId(layout.RulesetDashboardLayoutId);
                //        if (rulesetPages != null)
                //        {
                //            count = 2;
                //            foreach (var page in rulesetPages)
                //            {
                //                var _characterDashboardPage = await _rulesetDashboardPageService.Create(new RulesetDashboardPage()
                //                {
                //                    RulesetDashboardLayoutId = _characterDashboardLayout.RulesetDashboardLayoutId,
                //                    Name = page.Name,
                //                    ContainerWidth = page.ContainerWidth,
                //                    ContainerHeight = page.ContainerHeight,
                //                    BodyBgColor = page.BodyBgColor,
                //                    BodyTextColor = page.BodyTextColor,
                //                    TitleBgColor = page.TitleBgColor,
                //                    TitleTextColor = page.TitleTextColor,
                //                    SortOrder = 1,
                //                    RulesetId = result.RuleSetId
                //                });
                //                if (count == 2)
                //                {
                //                    _characterDashboardLayout.DefaultPageId = _characterDashboardPage.RulesetDashboardPageId;
                //                    await _rulesetDashboardLayoutService.Update(_characterDashboardLayout);
                //                    count += 1;
                //                }

                //                var rulesetTiles = _rulesetTileService.GetByPageIdRulesetId(page.RulesetDashboardPageId, page.RulesetId ?? 0);
                //                if (rulesetTiles != null)
                //                {
                //                    foreach (var _tile in rulesetTiles)
                //                    {
                //                        var Tile = new RulesetTile
                //                        {
                //                            RulesetDashboardPageId = _characterDashboardPage.RulesetDashboardPageId,
                //                            RulesetId = result.RuleSetId,
                //                            Height = _tile.Height,
                //                            Width = _tile.Width,
                //                            LocationX = _tile.LocationX,
                //                            LocationY = _tile.LocationY,
                //                            Shape = _tile.Shape,
                //                            SortOrder = _tile.SortOrder,
                //                            TileTypeId = _tile.TileTypeId
                //                        };

                //                        switch (Tile.TileTypeId)
                //                        {
                //                            case (int)Enum.TILES.NOTE:
                //                                if (_tile.NoteTiles == null) break;
                //                                await _rulesetTileService.Create(Tile);
                //                                RulesetNoteTile noteTile = _tile.NoteTiles;
                //                                Tile.NoteTiles = await _noteTileService.Create(new RulesetNoteTile
                //                                {
                //                                    RulesetTileId = Tile.RulesetTileId,
                //                                    Title = noteTile.Title,
                //                                    Shape = noteTile.Shape,
                //                                    SortOrder = noteTile.SortOrder,
                //                                    Content = noteTile.Content,
                //                                    BodyBgColor = noteTile.BodyBgColor,
                //                                    BodyTextColor = noteTile.BodyTextColor,
                //                                    TitleBgColor = noteTile.TitleBgColor,
                //                                    TitleTextColor = noteTile.TitleTextColor,
                //                                    IsDeleted = false
                //                                });
                //                                SaveColorsAsync(Tile);
                //                                break;
                //                            case (int)Enum.TILES.IMAGE:
                //                                if (_tile.ImageTiles == null) break;
                //                                await _rulesetTileService.Create(Tile);
                //                                var imageTile = _tile.ImageTiles;
                //                                Tile.ImageTiles = await _imageTileService.Create(new RulesetImageTile
                //                                {
                //                                    RulesetTileId = Tile.RulesetTileId,
                //                                    Title = imageTile.Title,
                //                                    Shape = imageTile.Shape,
                //                                    SortOrder = imageTile.SortOrder,
                //                                    BodyBgColor = imageTile.BodyBgColor,
                //                                    BodyTextColor = imageTile.BodyTextColor,
                //                                    TitleBgColor = imageTile.TitleBgColor,
                //                                    TitleTextColor = imageTile.TitleTextColor,
                //                                    IsDeleted = false,
                //                                    ImageUrl = imageTile.ImageUrl
                //                                });
                //                                SaveColorsAsync(Tile);
                //                                break;
                //                            case (int)Enum.TILES.COUNTER:
                //                                if (_tile.CounterTiles == null) break;
                //                                await _rulesetTileService.Create(Tile);
                //                                var counterTile = _tile.CounterTiles;
                //                                Tile.CounterTiles = await _counterTileService.Create(new RulesetCounterTile
                //                                {
                //                                    RulesetTileId = Tile.RulesetTileId,
                //                                    Title = counterTile.Title,
                //                                    Shape = counterTile.Shape,
                //                                    SortOrder = counterTile.SortOrder,
                //                                    BodyBgColor = counterTile.BodyBgColor,
                //                                    BodyTextColor = counterTile.BodyTextColor,
                //                                    TitleBgColor = counterTile.TitleBgColor,
                //                                    TitleTextColor = counterTile.TitleTextColor,
                //                                    CurrentValue = counterTile.CurrentValue,
                //                                    DefaultValue = counterTile.DefaultValue,
                //                                    Maximum = counterTile.Maximum,
                //                                    Minimum = counterTile.Minimum,
                //                                    Step = counterTile.Step,
                //                                    IsDeleted = false
                //                                });
                //                                SaveColorsAsync(Tile);
                //                                break;
                //                            case (int)Enum.TILES.CHARACTERSTAT:
                //                                if (_tile.CharacterStatTiles == null) break;
                //                                await _rulesetTileService.Create(Tile);
                //                                var characterStatTile = _tile.CharacterStatTiles;
                //                                Tile.CharacterStatTiles = await _characterStatTileService.Create(new RulesetCharacterStatTile
                //                                {
                //                                    RulesetTileId = Tile.RulesetTileId,
                //                                    CharacterStatId = characterStatTile.CharacterStatId,
                //                                    ShowTitle = characterStatTile.ShowTitle,
                //                                    Shape = characterStatTile.Shape,
                //                                    SortOrder = characterStatTile.SortOrder,
                //                                    bodyBgColor = characterStatTile.bodyBgColor,
                //                                    bodyTextColor = characterStatTile.bodyTextColor,
                //                                    titleBgColor = characterStatTile.titleBgColor,
                //                                    titleTextColor = characterStatTile.titleTextColor,
                //                                    IsDeleted = false
                //                                });
                //                                SaveColorsAsync(Tile);
                //                                break;
                //                            case (int)Enum.TILES.LINK: break;
                //                            case (int)Enum.TILES.EXECUTE: break;
                //                            case (int)Enum.TILES.COMMAND:
                //                                if (_tile.CommandTiles == null) break;
                //                                await _rulesetTileService.Create(Tile);
                //                                var commandTile = _tile.CommandTiles;
                //                                Tile.CommandTiles = await _commandTileService.Create(new RulesetCommandTile
                //                                {
                //                                    RulesetTileId = Tile.RulesetTileId,
                //                                    Title = commandTile.Title,
                //                                    Shape = commandTile.Shape,
                //                                    SortOrder = commandTile.SortOrder,
                //                                    ImageUrl = commandTile.ImageUrl,
                //                                    BodyBgColor = commandTile.BodyBgColor,
                //                                    BodyTextColor = commandTile.BodyTextColor,
                //                                    TitleBgColor = commandTile.TitleBgColor,
                //                                    TitleTextColor = commandTile.TitleTextColor,
                //                                    IsDeleted = false
                //                                });
                //                                SaveColorsAsync(Tile);
                //                                break;
                //                            default: break;
                //                        }
                //                        try
                //                        {
                //                            await _rulesetTileConfigService.CreateAsync(new RulesetTileConfig
                //                            {
                //                                RulesetTileId = Tile.RulesetTileId,
                //                                Col = _tile.Config.Col,
                //                                Row = _tile.Config.Row,
                //                                SizeX = _tile.Config.SizeX,
                //                                SizeY = _tile.Config.SizeY,
                //                                SortOrder = _tile.Config.SortOrder,
                //                                UniqueId = _tile.Config.UniqueId,
                //                                Payload = _tile.Config.Payload,
                //                                IsDeleted = false
                //                            });
                //                        }
                //                        catch { }
                //                    }
                //                }//end tile
                //            }
                //        }
                //    }
                //}



            }

            return BadRequest(ModelState);
        }

        [AllowAnonymous]
        [HttpGet("ImportRuleSet")]
        public async Task<IActionResult> ImportRuleSet(string code)
        {
            try
            {
                var ruleSet = _ruleSetService.ImportRuleSetByCode(code).Result;

                if (ruleSet == null) return BadRequest("The entered share code is invalid. Please enter a valid share code.");

                if (ruleSet.IsAllowSharing)
                {
                    var res = _commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet);
                    res.isAdmin = IsAdminUser();
                    return Ok(res);
                }

                else
                {
                    string username = ruleSet.AspNetUser == null ? "" : ruleSet.AspNetUser.UserName;
                    string res = "The User " + username + " has not enabled sharing of this Rule Set.";
                    return BadRequest(res);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("ShareRuleSetCode")]
        [AllowAnonymous]
        public async Task<IActionResult> ShareRuleSetCode(string email, string code)
        {
            RuleSet ruleSet = _ruleSetService.ImportRuleSetByCode(code).Result;
            if (ruleSet == null)
                return BadRequest("The entered share code is invalid. Please enter a valid share code.");

            var mailTemplatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/mail-templates/ruleset-share.html");
            var EmailContent = System.IO.File.ReadAllText(mailTemplatePath);
            EmailContent = EmailContent.Replace("#RULESET-NAME#", ruleSet.RuleSetName);
            EmailContent = EmailContent.Replace("#RULESET-IMAGE#", ruleSet.ImageUrl == null || ruleSet.ImageUrl == ""
                ? "https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RS.png" : ruleSet.ImageUrl);
            EmailContent = EmailContent.Replace("#RPGSMITH-USERNAME#", ruleSet.AspNetUser.UserName);
            EmailContent = EmailContent.Replace("#RULESET-SHARE-CODE#", code);
            EmailContent = EmailContent.Replace("#YEAR#", DateTime.Now.Year.ToString());

            //var request = _httpContextAccessor.HttpContext.Request;
            //var host = request.Host.ToUriComponent();
            //var pathBase = request.PathBase.ToUriComponent();
            //var reset_url = $"{request.Scheme}://{host}{pathBase}/" + "resetpassword?userid=" + appUser.Id;
            //EmailContent = EmailContent.Replace("#RESET-URL", reset_url);

            (bool success, string errorMsg) response = await _emailer.SendEmailAsync(email, email, "Rule Set Share Code", EmailContent, isHtml: true);

            if (response.success) return Ok();
            else return BadRequest(response.errorMsg + " Please try again.");
        }






        private async void SaveColorsAsync(RulesetTile Tile)
        {
            try
            {
                RulesetTileColor _tileColor = new RulesetTileColor();
                _tileColor.CreatedBy = GetUserId();
                _tileColor.CreatedDate = DateTime.Now;
                _tileColor.RulesetTileId = Tile.RulesetTileId;

                switch (Tile.TileTypeId)
                {
                    case (int)Enum.TILES.NOTE:
                        _tileColor.BodyBgColor = Tile.NoteTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.NoteTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.NoteTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.NoteTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.IMAGE:
                        _tileColor.BodyBgColor = Tile.ImageTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.ImageTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.ImageTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.ImageTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.COUNTER:
                        _tileColor.BodyBgColor = Tile.CounterTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.CounterTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.CounterTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.CounterTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.CHARACTERSTAT:
                        _tileColor.BodyBgColor = Tile.CharacterStatTiles.bodyBgColor;
                        _tileColor.BodyTextColor = Tile.CharacterStatTiles.bodyTextColor;
                        _tileColor.TitleBgColor = Tile.CharacterStatTiles.titleBgColor;
                        _tileColor.TitleTextColor = Tile.CharacterStatTiles.titleTextColor;
                        break;
                    case (int)Enum.TILES.LINK: break;
                    case (int)Enum.TILES.EXECUTE: break;
                    case (int)Enum.TILES.COMMAND:
                        _tileColor.BodyBgColor = Tile.CommandTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.CommandTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.CommandTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.CommandTiles.TitleTextColor;
                        break;
                    default: break;
                }

                //save colors
                if (_tileColor.TitleTextColor != null && _tileColor.BodyTextColor != null)
                    await _colorService.Create(_tileColor);
            }
            catch (Exception ex)
            { }
        }

        //get user id methods
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }

        private ApplicationUser GetUser()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            return _accountManager.GetUserByUserNameAsync(userName).Result;
        }

        private bool IsAdminUser()
        {
            (ApplicationUser user, string[] role) = _accountManager.GetUserAndRolesAsync(GetUserId()).Result;
            if (string.Join("", role).Contains("administrator")) return true;
            return false;
        }

        [HttpGet("GetCopiedRulesetID")]
        public async Task<IActionResult> GetCopiedRulesetID(int rulesetID, string UserID)
        {
            try
            {
                int result = await _coreRulesetService.GetCopiedRuleSetIdFromRulesetAndUser(rulesetID, UserID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest("Request: GetCopiedRulesetID, " + ex.Message);
            }
        }
        //public async Task<List<RuleSet>> GetRuleSets(string UserID)
        //{
        //    var res = await _ruleSetService.GetRuleSetByUserId(UserID);
        //    if (res != null)
        //    {
        //        foreach (var ruleset in res)
        //        {
        //            ruleset.RuleSetId = ruleset.ParentRuleSetId != null ? (int)ruleset.ParentRuleSetId : ruleset.RuleSetId;
        //        }

        //    }
        //    return res;
        //}
        //public async Task<List<RuleSet>> GetRuleSets(string UserID, int page = 1, int pageSize = 10)
        //{
        //    var res = await _ruleSetService.GetRuleSetByUserId(UserID);
        //    if (res != null)
        //    {
        //        foreach (var ruleset in res)
        //        {
        //            ruleset.RuleSetId = ruleset.ParentRuleSetId != null ? (int)ruleset.ParentRuleSetId : ruleset.RuleSetId;
        //        }

        //    }
        //    return res;
        //}
        //public async Task<RuleSet> GetRuleSet(string UserID)
        //{
        //    var res = (await _ruleSetService.GetRuleSetByUserId(UserID)).ToList().FirstOrDefault();
        //    if (res != null)
        //    {
        //        res.RuleSetId = res.ParentRuleSetId != null ? (int)res.ParentRuleSetId : res.RuleSetId;
        //    }
        //    return res;
        //}
        #region CustomDice
        [HttpPost("addEditCustomDice")]
        public async Task<IActionResult> addEditCustomDice([FromBody]  List<CustomDiceViewModel> model, int rulesetID)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    List<CustomDice> result = new List<CustomDice>();
                    result = _addEditCustomDice(model, rulesetID);
                    return Ok(utility.MapCustomDice(result));
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private List<CustomDice> _addEditCustomDice(List<CustomDiceViewModel> model, int rulesetID)
        {
            List<CustomDice> result;
            _ruleSetService.removeAllDice(rulesetID);
            List<CustomDice> diceList = new List<CustomDice>();
            foreach (var dice in model)
            {
                CustomDice Cdice = new CustomDice()
                {
                    //CustomDiceId = dice.CustomDiceId,
                    Icon = dice.Icon,
                    IsNumeric = dice.IsNumeric,
                    Name = dice.Name,
                    CustomDicetype = dice.CustomDicetype,
                    RuleSetId = rulesetID
                };
                List<CustomDiceResult> diceResList = new List<CustomDiceResult>();
                foreach (var res in dice.Results)
                {
                    CustomDiceResult CDres = new CustomDiceResult()
                    {
                        //CustomDiceResultId=res.CustomDiceResultId,
                        //CustomDiceId=res.CustomDiceId,
                        Name = res.Name,
                        DisplayContent = res.DisplayContent
                    };
                    diceResList.Add(CDres);
                }
                Cdice.CustomDiceResults = diceResList;
                diceList.Add(Cdice);
            }
            result = _ruleSetService.AddCustomDice(diceList, rulesetID);
            return result;
        }
        private List<DiceTray> _addEditDiceTray(List<CustomDice> customDices, List<DiceTray> diceTrays, int rulesetID)
        {
            return _ruleSetService.addEditDiceTray(customDices, diceTrays, rulesetID);
        }

        private async Task<List<CurrencyType>> _addCurrencyTypes(List<CurrencyType> currencyTypes, int rulesetId)
        {
            return await _ruleSetService.addCurrencyTypes(currencyTypes, rulesetId);
        }

        private async Task<List<CurrencyType>> _updateCurrencyTypes(List<CurrencyType> currencyTypes, int rulesetId)
        {
            return await _ruleSetService.updateCurrencyTypes(currencyTypes, rulesetId);
        }

        [HttpGet("GetCustomDice")]
        public async Task<IActionResult> GetCustomDice(int rulesetID)
        {
            try
            {
                List<CustomDiceViewModel> result = utility.MapCustomDice(_ruleSetService.GetCustomDice(rulesetID));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private void CopyCustomDiceToNewRuleSet(int CopyFromRulesetID, int CopyToRulesetID)
        {
            _ruleSetService.CopyCustomDiceToNewRuleSet(CopyFromRulesetID, CopyToRulesetID);
        }


        [HttpGet("GetDefaultDice")]
        public async Task<IActionResult> GetDefaultDice()
        {
            try
            {
                return Ok(_ruleSetService.GetDefaultDices());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        #endregion

        #region SearchResults        
        [HttpPost("GetSearchResults")]
        public IActionResult GetSearchResults([FromBody] SearchModel searchModel, bool isCampaignSearch =false ,bool includeHandout=false)
        {
            var results = new int[] { };
            try
            {
                searchModel.SearchString = addSingleQuoteforSPIfNeeded(searchModel.SearchString);
                _ruleSetService.SaveLastSearchFilters(searchModel);
                string searchText = searchModel.SearchString;

                if (!string.IsNullOrEmpty(searchText) && searchText.Length > 2)
                {
                    if ((searchText.ElementAt(0) == '"' && searchText.ElementAt(searchText.Length - 1) == '"'))
                    {
                        searchText = searchText.Remove(0, 1);
                        searchText = searchText.Remove(searchText.Length - 1, 1);
                        searchModel.SearchString = searchText;
                        return GetSingleSearchResult(searchModel);
                    }
                }
                else if (string.IsNullOrEmpty(searchText))
                {
                    searchText = string.Empty;
                }


                List<CharacterAbility> characterAbilities = new List<CharacterAbility>();
                List<CharacterSpell> characterSpells = new List<CharacterSpell>();
                List<Item> items = new List<Item>();
                List<ItemMaster_Bundle> itemMasters = new List<ItemMaster_Bundle>();
                List<Spell> spells = new List<Spell>();
                List<Ability> abilities = new List<Ability>();

                List<BuffAndEffectVM> buffAndEffects = new List<BuffAndEffectVM>();
                List<CharacterBuffAndEffect> characterBuffAndEffects = new List<CharacterBuffAndEffect>();
                List<ItemMasterLoot> loots = new List<ItemMasterLoot>();
                List<LootTemplate> lootTemplates = new List<LootTemplate>();
                List<Monster> monsters = new List<Monster>();
                List<MonsterTemplate_Bundle> monsterTemplates = new List<MonsterTemplate_Bundle>();
                List<HandoutViewModel> handouts = new List<HandoutViewModel>();

                List<ItemMasterLoot> characterLoots = new List<ItemMasterLoot>();
                List<Item> RulesetCharacteritems = new List<Item>();

                bool skipGettingRecords = false;
                bool FlagIsInitailItemOfList = true;
                foreach (string item in searchText.Split(' '))
                {
                    if (!string.IsNullOrEmpty(item))
                    {
                        searchModel.SearchString = item;

                        int[] idsToSearch = new int[] { };
                        switch (searchModel.SearchType)
                        {
                            case SP_SearchType.CharacterAbilities:
                                if (!isCampaignSearch)
                                {
                                    if (characterAbilities.Select(x => x.CharacterAbilityId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                    {
                                        skipGettingRecords = true;
                                    }
                                    if (!skipGettingRecords)
                                    {
                                        characterAbilities = (_ruleSetService.SearchCharacterAbilities(searchModel, characterAbilities.Select(x => x.CharacterAbilityId).ToArray()));

                                    }

                                }
                                
                                break;
                            case SP_SearchType.CharacterSpells:
                                if (!isCampaignSearch)
                                {
                                    if (characterSpells.Select(x => x.CharacterSpellId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                    {
                                        skipGettingRecords = true;
                                    }
                                    if (!skipGettingRecords)
                                    {
                                        characterSpells = (_ruleSetService.SearchCharacterSpells(searchModel, characterSpells.Select(x => x.CharacterSpellId).ToArray()));

                                    }
                                }
                                break;
                            case SP_SearchType.CharacterItems:
                                if (!isCampaignSearch)
                                {
                                    if (items.Select(x => x.ItemId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                    {
                                        skipGettingRecords = true;
                                    }
                                    if (!skipGettingRecords)
                                    {
                                        items = (_ruleSetService.SearchCharacterItems(searchModel, items.Select(x => x.ItemId).ToArray()));

                                    }
                                }
                                break;
                            case SP_SearchType.RulesetItems:
                                if (itemMasters.Select(x => x.ItemMasterId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                {
                                    skipGettingRecords = true;
                                }
                                if (!skipGettingRecords)
                                {
                                    itemMasters = (_ruleSetService.SearchRulesetItems(searchModel, itemMasters.Select(x => x.ItemMasterId).ToArray()));

                                }
                                break;
                            case SP_SearchType.RulesetSpells:
                                if (spells.Select(x => x.SpellId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                {
                                    skipGettingRecords = true;
                                }
                                if (!skipGettingRecords)
                                {
                                    spells = (_ruleSetService.SearchRulesetSpells(searchModel, spells.Select(x => x.SpellId).ToArray()));

                                }
                                break;
                            case SP_SearchType.RulesetAbilities:
                                if (abilities.Select(x => x.AbilityId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                {
                                    skipGettingRecords = true;
                                }
                                if (!skipGettingRecords)
                                {
                                    abilities = (_ruleSetService.SearchRulesetAbilities(searchModel, abilities.Select(x => x.AbilityId).ToArray()));

                                }
                                break;
                                ///////////////////////////////////////////////////////////////////////
                            case SP_SearchType.RulesetLoot:
                                if (loots.Select(x => x.LootId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                {
                                    skipGettingRecords = true;
                                }
                                if (!skipGettingRecords)
                                {
                                    loots = (_ruleSetService.SearchRulesetLoots(searchModel, loots.Select(x => x.LootId).ToArray(), GetUserId()));

                                }
                                break;
                            case SP_SearchType.RulesetLootTemplate:
                                if (lootTemplates.Select(x => x.LootTemplateId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                {
                                    skipGettingRecords = true;
                                }
                                if (!skipGettingRecords)
                                {
                                    lootTemplates = (_ruleSetService.SearchRulesetLootTemplates(searchModel, lootTemplates.Select(x => x.LootTemplateId).ToArray(), GetUserId()));

                                }
                                break;
                            case SP_SearchType.CharacterBuffAndEffect:
                                if (!isCampaignSearch)
                                {
                                    if (characterBuffAndEffects.Select(x => x.CharacterBuffAandEffectId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                    {
                                        skipGettingRecords = true;
                                    }
                                    if (!skipGettingRecords)
                                    {
                                        characterBuffAndEffects = (_ruleSetService.SearchCharacterBuffAandEffects(searchModel, characterBuffAndEffects.Select(x => x.CharacterBuffAandEffectId).ToArray(), GetUserId()));

                                    }
                                }
                                break;
                            case SP_SearchType.RulesetBuffAndEffect:
                                if (buffAndEffects.Select(x => x.BuffAndEffectId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                {
                                    skipGettingRecords = true;
                                }
                                if (!skipGettingRecords)
                                {
                                    buffAndEffects = (_ruleSetService.SearchRulesetBuffAndEffects(searchModel, buffAndEffects.Select(x => x.BuffAndEffectId).ToArray(), GetUserId()));

                                }
                                break;
                            case SP_SearchType.RulesetMonster:
                                if (monsters.Select(x => x.MonsterId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                {
                                    skipGettingRecords = true;
                                }
                                if (!skipGettingRecords)
                                {
                                    monsters = (_ruleSetService.SearchRulesetMonsters(searchModel, monsters.Select(x => x.MonsterId).ToArray(), GetUserId()));

                                }
                                break;
                            case SP_SearchType.RulesetMonsterTemplate:
                                if (monsterTemplates.Select(x => x.MonsterTemplateId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                {
                                    skipGettingRecords = true;
                                }
                                if (!skipGettingRecords)
                                {
                                    monsterTemplates = (_ruleSetService.SearchRulesetMonsterTemplates(searchModel, monsterTemplates.Select(x => x.MonsterTemplateId).ToArray(), GetUserId()));

                                }
                                break;
                            case SP_SearchType.CharacterHandout:
                                if (!isCampaignSearch)
                                {
                                    GetFilteredHandouts(searchModel, searchText, handouts);
                                    //var handoutLists_2 = bs.All_BlobMyHandoutsForSearchAsync("user-" + GetUserId() + "-handout" + "-" + searchModel.RulesetID).Result;
                                    //handoutLists_2 = handoutLists_2.Where(x => x.name.Contains(searchText)).ToList();
                                    //foreach (var _blobItem in handoutLists_2)
                                    //{
                                    //    HandoutViewModel obj = new HandoutViewModel()
                                    //    {
                                    //        Name = System.IO.Path.GetFileName(_blobItem.name),
                                    //        type = _blobItem.ContentType,
                                    //        url = _blobItem.AbsoluteUri,
                                    //        extension = System.IO.Path.GetExtension(_blobItem.name)
                                    //    };
                                    //    handouts.Add(obj);
                                    //}
                                    //if (handouts.Select(x => x.AbilityId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                    //{
                                    //    skipGettingRecords = true;
                                    //}
                                    //if (!skipGettingRecords)
                                    //{
                                    //    handouts = (_ruleSetService.SearchRulesetAbilities(searchModel, abilities.Select(x => x.AbilityId).ToArray()));

                                    //}
                                }

                                    break;
                            case SP_SearchType.RulesetHandout:
                                GetFilteredHandouts(searchModel, searchText, handouts);
                                //var handoutLists_1 = bs.All_BlobMyHandoutsForSearchAsync("user-" + GetUserId() + "-handout" + "-" + searchModel.RulesetID).Result;
                                //handoutLists_1 = handoutLists_1.Where(x => x.name.Contains(searchText)).ToList();
                                //foreach (var _blobItem in handoutLists_1)
                                //{
                                //    HandoutViewModel obj = new HandoutViewModel()
                                //    {
                                //        Name = System.IO.Path.GetFileName(_blobItem.name),
                                //        type = _blobItem.ContentType,
                                //        url = _blobItem.AbsoluteUri,
                                //        extension=System.IO.Path.GetExtension(_blobItem.name)

                                //    };
                                //    handouts.Add(obj);
                                //}
                                //if (handouts.Select(x => x.AbilityId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                //{
                                //    skipGettingRecords = true;
                                //}
                                //if (!skipGettingRecords)
                                //{
                                //    handouts = (_ruleSetService.SearchRulesetAbilities(searchModel, abilities.Select(x => x.AbilityId).ToArray()));

                                //}
                                break;
                            ///////////////////////////////////////////////////////////////////////////////////
                            case SP_SearchType.CharacterLoot:
                                if (!isCampaignSearch)
                                {
                                    if (characterLoots.Select(x => x.LootId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                    {
                                        skipGettingRecords = true;
                                    }
                                    if (!skipGettingRecords)
                                    {
                                        characterLoots = (_ruleSetService.SearchCharacterLoots(searchModel, characterLoots.Select(x => x.LootId).ToArray(), GetUserId()));

                                    }
                                }
                                break;
                            case SP_SearchType.RulesetCharacterItems:
                                
                                    if (RulesetCharacteritems.Select(x => x.ItemId).ToArray().Length == 0 && !FlagIsInitailItemOfList)
                                    {
                                        skipGettingRecords = true;
                                    }
                                    if (!skipGettingRecords)
                                    {
                                        RulesetCharacteritems = (_ruleSetService.SearchRulesetCharacteritems(searchModel, RulesetCharacteritems.Select(x => x.ItemId).ToArray(), GetUserId()));

                                    }
                                
                                break;
                            case SP_SearchType.Everything:
                                if (!isCampaignSearch)
                                {
                                    characterAbilities = (_ruleSetService.SearchCharacterAbilities(searchModel, characterAbilities.Select(x => x.CharacterAbilityId).ToArray()));
                                    characterSpells = (_ruleSetService.SearchCharacterSpells(searchModel, characterSpells.Select(x => x.CharacterSpellId).ToArray()));
                                    items = (_ruleSetService.SearchCharacterItems(searchModel, items.Select(x => x.ItemId).ToArray()));
                                    characterBuffAndEffects = (_ruleSetService.SearchCharacterBuffAandEffects(searchModel, characterBuffAndEffects.Select(x => x.CharacterBuffAandEffectId).ToArray(), GetUserId()));
                                    characterLoots = (_ruleSetService.SearchCharacterLoots(searchModel, characterLoots.Select(x => x.LootId).ToArray(), GetUserId()));
                                }
                                itemMasters = (_ruleSetService.SearchRulesetItems(searchModel, itemMasters.Select(x => x.ItemMasterId).ToArray()));
                                spells = (_ruleSetService.SearchRulesetSpells(searchModel, spells.Select(x => x.SpellId).ToArray()));
                                abilities = (_ruleSetService.SearchRulesetAbilities(searchModel, abilities.Select(x => x.AbilityId).ToArray()));

                                loots = (_ruleSetService.SearchRulesetLoots(searchModel, loots.Select(x => x.LootId).ToArray(), GetUserId()));
                                lootTemplates = (_ruleSetService.SearchRulesetLootTemplates(searchModel, lootTemplates.Select(x => x.LootTemplateId).ToArray(), GetUserId()));
                                buffAndEffects = (_ruleSetService.SearchRulesetBuffAndEffects(searchModel, buffAndEffects.Select(x => x.BuffAndEffectId).ToArray(), GetUserId()));
                                monsters = (_ruleSetService.SearchRulesetMonsters(searchModel, monsters.Select(x => x.MonsterId).ToArray(), GetUserId()));
                                monsterTemplates = (_ruleSetService.SearchRulesetMonsterTemplates(searchModel, monsterTemplates.Select(x => x.MonsterTemplateId).ToArray(), GetUserId()));
                                if (includeHandout)
                                {
                                    GetFilteredHandouts(searchModel, searchText, handouts);
                                }
                                RulesetCharacteritems = (_ruleSetService.SearchRulesetCharacteritems(searchModel, RulesetCharacteritems.Select(x => x.ItemId).ToArray(), GetUserId()));

                                //handouts = (_ruleSetService.SearchRulesetAbilities(searchModel, abilities.Select(x => x.AbilityId).ToArray()));
                                break;
                            default:
                                break;
                        }
                    }
                    FlagIsInitailItemOfList = false;
                }
                switch (searchModel.SearchType)
                {
                    case SP_SearchType.CharacterAbilities:
                        return Ok(characterAbilities.GroupBy(x => x.CharacterAbilityId).Select(x => x.First()));

                    case SP_SearchType.RulesetAbilities:
                        return Ok(abilities.GroupBy(x => x.AbilityId).Select(x => x.First()));

                    case SP_SearchType.CharacterSpells:
                        return Ok(characterSpells.GroupBy(x => x.CharacterSpellId).Select(x => x.First()));

                    case SP_SearchType.RulesetSpells:
                        return Ok(spells.GroupBy(x => x.SpellId).Select(x => x.First()));

                    case SP_SearchType.CharacterItems:
                        return Ok(items.GroupBy(x => x.ItemId).Select(x => x.First()));

                    case SP_SearchType.RulesetItems:
                        return Ok(itemMasters.GroupBy(x => x.ItemMasterId).Select(x => x.First()));
                        //////////////////////////////////////////
                    case SP_SearchType.RulesetLoot:
                        return Ok(loots.GroupBy(x => x.LootId).Select(x => x.First()));
                    case SP_SearchType.RulesetLootTemplate:
                        return Ok(lootTemplates.GroupBy(x => x.LootTemplateId).Select(x => x.First()));
                    case SP_SearchType.CharacterBuffAndEffect:
                        return Ok(characterBuffAndEffects.GroupBy(x => x.CharacterBuffAandEffectId).Select(x => x.First()));
                    case SP_SearchType.RulesetBuffAndEffect:
                        return Ok(buffAndEffects.GroupBy(x => x.BuffAndEffectId).Select(x => x.First()));
                    case SP_SearchType.RulesetMonster:
                        return Ok(monsters.GroupBy(x => x.MonsterId).Select(x => x.First()));
                    case SP_SearchType.RulesetMonsterTemplate:
                        return Ok(monsterTemplates.GroupBy(x => x.MonsterTemplateId).Select(x => x.First()));
                    case SP_SearchType.CharacterHandout:
                        return Ok(handouts);
                    case SP_SearchType.RulesetHandout:
                        return Ok(handouts);
                    case SP_SearchType.CharacterLoot:
                        return Ok(characterLoots.GroupBy(x => x.LootId).Select(x => x.First()));
                    case SP_SearchType.RulesetCharacterItems:
                        return Ok(RulesetCharacteritems.GroupBy(x => x.ItemId).Select(x => x.First()));                        
                        break;
                        ////////////////////////////////////////////////////////
                    case SP_SearchType.Everything:
                        bool IsItemEnabled = _ruleSetService.IsItemEnabled(searchModel.RulesetID);
                        bool IsSpellEnabled = _ruleSetService.IsSpellEnabled(searchModel.RulesetID);
                        bool IsAbilityEnabled = _ruleSetService.IsAbilityEnabled(searchModel.RulesetID);
                        bool IsBuffAndEffectEnabled = _ruleSetService.IsBuffAndEffectEnabled(searchModel.RulesetID);

                        if (IsItemEnabled)
                        {
                            items = items.GroupBy(x => x.ItemId).Select(x => x.First()).ToList();
                            itemMasters = itemMasters.GroupBy(x => x.ItemMasterId).Select(x => x.First()).ToList();
                            loots = loots.GroupBy(x => x.LootId).Select(x => x.First()).ToList();
                            lootTemplates = lootTemplates.GroupBy(x => x.LootTemplateId).Select(x => x.First()).ToList();
                            characterLoots = characterLoots.GroupBy(x => x.LootId).Select(x => x.First()).ToList();
                            RulesetCharacteritems = RulesetCharacteritems.GroupBy(x => x.ItemId).Select(x => x.First()).ToList();
                        }
                        else {
                            items = new List<Item>();
                            itemMasters = new List<ItemMaster_Bundle>();
                            loots = new List<ItemMasterLoot>();
                            lootTemplates = new List<LootTemplate>();
                            characterLoots = new List<ItemMasterLoot>();
                            RulesetCharacteritems = new List<Item>();
                        }
                        if (IsSpellEnabled)
                        {
                            characterSpells = characterSpells.GroupBy(x => x.CharacterSpellId).Select(x => x.First()).ToList();
                            spells = spells.GroupBy(x => x.SpellId).Select(x => x.First()).ToList();
                        }
                        else
                        {
                            characterSpells = new List<CharacterSpell>();
                            spells = new List<Spell>();
                        }
                        if (IsAbilityEnabled)
                        {
                            characterAbilities = characterAbilities.GroupBy(x => x.CharacterAbilityId).Select(x => x.First()).ToList();
                            abilities = abilities.GroupBy(x => x.AbilityId).Select(x => x.First()).ToList();
                        }
                        else
                        {
                            characterAbilities = new List<CharacterAbility>();
                            abilities = new List<Ability>();
                        }
                        if (IsBuffAndEffectEnabled)
                        {
                            characterBuffAndEffects = characterBuffAndEffects.GroupBy(x => x.CharacterBuffAandEffectId).Select(x => x.First()).ToList();
                            buffAndEffects = buffAndEffects.GroupBy(x => x.BuffAndEffectId).Select(x => x.First()).ToList();
                        }
                        else
                        {
                            characterBuffAndEffects = new List<CharacterBuffAndEffect>();
                            buffAndEffects = new List<BuffAndEffectVM>();
                        }
                        monsters = monsters.GroupBy(x => x.MonsterId).Select(x => x.First()).ToList();
                        monsterTemplates = monsterTemplates.GroupBy(x => x.MonsterTemplateId).Select(x => x.First()).ToList();
                        handouts = handouts;

                        /////////////////////////////////////////////////
                        return Ok(_ruleSetService.bindEveryThingModel(characterAbilities, abilities, characterSpells, spells, items, itemMasters,
                            buffAndEffects, characterBuffAndEffects, loots, lootTemplates, monsters, monsterTemplates,handouts, searchModel.CharacterID,
                            characterLoots, RulesetCharacteritems));
                        break;
                    default:
                        return Ok();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private void GetFilteredHandouts(SearchModel searchModel, string searchText, List<HandoutViewModel> handouts)
        {
            bool isRecordFilterFlag = (searchModel.SearchType == SP_SearchType.Everything && searchModel.EverythingFilters.IsEverythingName) || (searchModel.HandoutFilters.IsHandoutName || searchModel.HandoutFilters.IsHandoutFileType);
            if (isRecordFilterFlag)
            {
                var handoutLists = bs.All_BlobMyHandoutsForSearchAsync("user-" + GetUserId() + "-handout" + "-" + searchModel.RulesetID).Result;

                if (searchModel.SearchType == SP_SearchType.Everything)
                {
                    if (searchModel.EverythingFilters.IsEverythingName)
                    {
                        handoutLists = handoutLists.Where(x => x.name.Contains(searchText)).ToList();
                    }
                }
                else
                {
                    if (searchModel.HandoutFilters.IsHandoutName && searchModel.HandoutFilters.IsHandoutFileType)
                    {
                        handoutLists = handoutLists.Where(x => x.name.Contains(searchText) || System.IO.Path.GetExtension(x.name).Contains(searchText)).ToList();
                    }
                    else if (searchModel.HandoutFilters.IsHandoutName)
                    {
                        handoutLists = handoutLists.Where(x => x.name.Contains(searchText)).ToList();
                    }
                    else if (searchModel.HandoutFilters.IsHandoutFileType)
                    {
                        handoutLists = handoutLists.Where(x => System.IO.Path.GetExtension(x.name).Contains(searchText)).ToList();                        
                    }
                }
                    foreach (var _blobItem in handoutLists)
                    {
                        HandoutViewModel obj = new HandoutViewModel()
                        {
                            Name = System.IO.Path.GetFileName(_blobItem.name),
                            type = _blobItem.ContentType,
                            url = _blobItem.AbsoluteUri,
                            extension = System.IO.Path.GetExtension(_blobItem.name)

                        };
                        handouts.Add(obj);
                    }                
            }
                       
        }

        private string addSingleQuoteforSPIfNeeded(string searchString)
        {
            if (!string.IsNullOrEmpty(searchString))
            {
                return searchString.Replace("'", "''");
            }
            return searchString;
        }

        private IActionResult GetSingleSearchResult(SearchModel searchModel)
        {
            switch (searchModel.SearchType)
            {
                case SP_SearchType.CharacterAbilities:
                    return Ok(_ruleSetService.SearchCharacterAbilities(searchModel));
                case SP_SearchType.RulesetAbilities:
                    return Ok(_ruleSetService.SearchRulesetAbilities(searchModel));
                case SP_SearchType.CharacterSpells:
                    return Ok(_ruleSetService.SearchCharacterSpells(searchModel));
                case SP_SearchType.RulesetSpells:
                    return Ok(_ruleSetService.SearchRulesetSpells(searchModel));
                case SP_SearchType.CharacterItems:
                    return Ok(_ruleSetService.SearchCharacterItems(searchModel));
                case SP_SearchType.RulesetItems:
                    return Ok(_ruleSetService.SearchRulesetItems(searchModel));
                case SP_SearchType.CharacterBuffAndEffect:
                    return Ok(_ruleSetService.SearchCharacterBuffAandEffects(searchModel));
                case SP_SearchType.RulesetBuffAndEffect:
                    return Ok(_ruleSetService.SearchRulesetBuffAndEffects(searchModel));
                case SP_SearchType.RulesetLoot:
                    return Ok(_ruleSetService.SearchRulesetLoots(searchModel));
                case SP_SearchType.RulesetLootTemplate:
                    return Ok(_ruleSetService.SearchRulesetLootTemplates(searchModel));
                case SP_SearchType.RulesetMonster:
                    return Ok(_ruleSetService.SearchRulesetMonsters(searchModel));
                case SP_SearchType.RulesetMonsterTemplate:
                    return Ok(_ruleSetService.SearchRulesetMonsterTemplates(searchModel));
                case SP_SearchType.CharacterLoot:
                    return Ok(_ruleSetService.SearchCharacterLoots(searchModel));
                case SP_SearchType.RulesetCharacterItems:
                    return Ok(_ruleSetService.SearchRulesetCharacteritems(searchModel));
                case SP_SearchType.Everything:
                    return Ok(_ruleSetService.SearchEveryThing(searchModel,searchModel.CharacterID));
                    break;
                default:
                    return Ok();
            }
        }
        #endregion

        #region DiceRoll
        [HttpGet("GetDiceRollData")]
        public async Task<IActionResult> GetDiceRollData(int CharacterID, int RuleSetID)
        {
            try
            {
                DiceRollModel diceRollModel = await _ruleSetService.GetDiceRollModelAsync(RuleSetID, CharacterID, GetUser());
                DiceRollViewModel diceRollViewModel = new DiceRollViewModel()
                {
                    Character = diceRollModel.Character == null ? new Character() : diceRollModel.Character,
                    CharacterCommands = diceRollModel.CharacterCommands == null ? new List<CharacterCommand>() : diceRollModel.CharacterCommands,
                    RulesetCommands = diceRollModel.RulesetCommands == null ? new List<RulesetCommand>() : diceRollModel.RulesetCommands,
                    CharactersCharacterStats = diceRollModel.CharactersCharacterStats == null ? new List<CharactersCharacterStat>() : diceRollModel.CharactersCharacterStats,// Utilities.GetCharCharStatViewModelList( diceRollModel.CharactersCharacterStats,_characterStatChoiceService),
                    CustomDices = utility.MapCustomDice(diceRollModel.CustomDices),
                    DefaultDices = diceRollModel.DefaultDices,
                    DiceTrays = diceRollModel.DiceTrays,
                    IsGmAccessingPlayerCharacter = diceRollModel.IsGmAccessingPlayerCharacter,
                    RuleSet = diceRollModel.RuleSet,
                };


                return Ok(diceRollViewModel);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        #endregion

        [HttpPost("updateLastCommand")]
        public async Task<IActionResult> UpdateLastCommand([FromBody] UpdateRulesetLastCommand model)
        {
            if (ModelState.IsValid)
            {
                //var result = await _CharacterService.UpdateLastCommand(model.CharacterId, model.LastCommand, model.LastCommandResult, model.LastCommandValues);
                return Ok(await _ruleSetService.UpdateLastCommand(model.RuleSetId, model.LastCommand, model.LastCommandResult, model.LastCommandValues, model.LastCommandTotal,model.LastCommandResultColor));
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        #region RuleSet Command

        [HttpPost("createCommand")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> CreateCommand([FromBody] RulesetCommandViewModel model)
        {
            if (ModelState.IsValid)
            {
                if (_ruleSetService.CheckDuplicateRulesetCommand(model.Name.Trim(), model.RulesetId).Result)
                    return BadRequest("'" + model.Name + "' Duplicate Ruleset Command");

                var _characterCommand = Mapper.Map<RulesetCommand>(model);

                _characterCommand.CreatedOn = DateTime.Now;
                _characterCommand.UpdatedOn = DateTime.Now;
                var result = await _ruleSetService.Create(_characterCommand);

                //try
                //{
                //    if (model.RulesetId > 0)
                //    {
                //        await _ruleSetService.UpdateRulesetLastCommand(new RuleSet
                //        {
                //            RuleSetId = model.RulesetId,
                //            LastCommand = model.Command,
                //            LastCommandResult = model.CommandResult,
                //            LastCommandValues = model.LastCommandValues
                //        });
                //    }
                //}
                //catch { }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("updateCommand")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> UpdateCommand([FromBody] RulesetCommandViewModel model)
        {
            if (ModelState.IsValid)
            {
                if (_ruleSetService.CheckDuplicateRulesetCommand(model.Name.Trim(), model.RulesetId, model.RulesetCommandId).Result)
                    return BadRequest("Duplicate Ruleset Command");

                var _rulesetCommand = Mapper.Map<RulesetCommand>(model);

                _rulesetCommand.UpdatedOn = DateTime.Now;
                var result = await _ruleSetService.Update(_rulesetCommand);

                //try
                //{
                //    if (model.RulesetId > 0)
                //    {
                //        await _ruleSetService.UpdateRulesetLastCommand(new RuleSet
                //        {
                //            RuleSetId = model.RulesetId,
                //            LastCommand = model.Command,
                //            LastCommandResult = model.CommandResult,
                //            LastCommandValues = model.LastCommandValues
                //        });
                //    }
                //}
                //catch { }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpDelete("deleteCommand")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _ruleSetService.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        #endregion

        public class ExportImportVM
        {
            public int RuleSetId { get; set; }
            public Enum.RecordType RecordType { get; set; }
            public List<MonstersImportVM> Monsters { get; set; }

            public List<REItems> REItems { get; set; }
        }

        [HttpPost("Export")]
        public async Task<IActionResult> Export([FromBody] ExportImportVM model)
        {
            if (Enum.RecordType.MONSTERS == model.RecordType)
            {
                return Ok(this._monsterTemplateService.GetMonsterTemplatesByRulesetIdExport(model.RuleSetId)); ;
            }
            return Ok();
        }

        [HttpPost("Import")]
        public async Task<IActionResult> Import([FromBody] ExportImportVM model)
        {
            if (Enum.RecordType.MONSTERS == model.RecordType)
            {
                foreach (var monster in model.Monsters)
                {
                    if (_monsterTemplateService.CheckDuplicateMonsterTemplate(monster.Name.Trim(), model.RuleSetId).Result)
                    {
                        //Unique Name
                        monster.Name = await _monsterTemplateService.GetMonsterUniqueName(monster.Name.Trim(), model.RuleSetId);
                    }

                    var monsterTemplate = new MonsterTemplate()
                    {
                        Health = monster.Health.ToString(),
                        Name = monster.Name,
                        Command = monster.Command,
                        ImageUrl = monster.ImageUrl,
                        Description = monster.Description,
                        ArmorClass = monster.ArmorClass.ToString(),
                        ChallangeRating = monster.ChallangeRating.ToString(),
                        CommandName = monster.CommandName,
                        gmOnly = monster.gmOnly,
                        InitiativeCommand = monster.InitiativeCommand,
                        XPValue = monster.XPValue.ToString(),
                        Stats = monster.Stats,
                        Metatags = monster.Metatags,
                        IsRandomizationEngine = monster.IsRandomizationEngine,
                        RuleSetId = model.RuleSetId,
                        IsDeleted = false
                    };

                    var result = await _monsterTemplateService.Create(monsterTemplate);

                    if (monster.MonsterTemplateAbilityVM != null && monster.MonsterTemplateAbilityVM.Count > 0)
                    {
                        foreach (var item in monster.MonsterTemplateAbilityVM)
                        {
                            
                            item.MonsterTemplateId = result.MonsterTemplateId;
                        }
                        _monsterTemplateService.insertAssociateAbilities(monster.MonsterTemplateAbilityVM);
                    }

                    if (monster.MonsterTemplateBuffAndEffectVM != null && monster.MonsterTemplateBuffAndEffectVM.Count > 0)
                    {
                        foreach (var item in monster.MonsterTemplateBuffAndEffectVM)
                        {
                            item.MonsterTemplateId = result.MonsterTemplateId;
                        }
                        _monsterTemplateService.insertAssociateBuffAndEffects(monster.MonsterTemplateBuffAndEffectVM);                   
                    }
                    if (monster.MonsterTemplateItemMasterVM != null && monster.MonsterTemplateItemMasterVM.Count > 0)
                    {
                        foreach (var item in monster.MonsterTemplateItemMasterVM)
                        {
                            item.MonsterTemplateId = result.MonsterTemplateId;
                        }
                        _monsterTemplateService.insertAssociateItemMasters(monster.MonsterTemplateItemMasterVM);
                    }
                    if (monster.MonsterTemplateSpellVM != null && monster.MonsterTemplateSpellVM.Count > 0)
                    {
                        foreach (var item in monster.MonsterTemplateSpellVM)
                        {
                            item.MonsterTemplateId = result.MonsterTemplateId;
                        }
                        _monsterTemplateService.insertAssociateSpells(monster.MonsterTemplateSpellVM);                   
                    }


                    //if (monster.MonsterTemplateCommandVM != null && monster.MonsterTemplateCommandVM.Count > 0)
                    //{
                    //    foreach (var acViewModels in monster.MonsterTemplateCommandVM)
                    //    {
                    //        var x = new MonsterTemplateCommand()
                    //        {
                    //            Command = acViewModels.Command,
                    //            Name = acViewModels.Name,
                    //            MonsterTemplateId = result.MonsterTemplateId
                    //        };
                    //        await _monsterTemplateCommandService.InsertMonsterTemplateCommandImport(x);
                    //    }
                    //}


                    List<int> armorClassList = new List<int>();
                    armorClassList.Add(monster.ArmorClass);

                    List<int> challangeRatingList = new List<int>();
                    challangeRatingList.Add(monster.ChallangeRating);

                    List<int> healthList = new List<int>();
                    healthList.Add(monster.Health);

                    List<int> xpValueList = new List<int>();
                    xpValueList.Add(monster.XPValue);

                    //DeployMonsterTemplate deploy = new DeployMonsterTemplate()
                    //{
                    //    addToCombat = true,
                    //    armorClass = armorClassList,
                    //    challangeRating = challangeRatingList,
                    //    healthCurrent = healthList,
                    //    healthMax = healthList,
                    //    monsterTemplateId = result.MonsterTemplateId,
                    //    rulesetId = result.RuleSetId,
                    //    qty = 1,
                    //    xpValue = xpValueList,
                    //    REItems = new List<REItems>()
                    //};
                    //var MonsterIds = _monsterTemplateService.deployMonster(deploy);
                }
            }
            return Ok();
        }
    }
}
