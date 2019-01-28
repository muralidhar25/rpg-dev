using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Services;
using DAL.Services.RulesetTileServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.Helpers.CoreRuleset;
using RPGSmithApp.ViewModels;
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
        private readonly IRuleSetService _ruleSetService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ICharacterService _characterService;
        private readonly ICharacterStatService _characterStatService;
        private readonly ICharacterStatCalcService _characterStatCalcService;
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
            ICommonFuncsCoreRuleSet commonFuncsCoreRuleSet)
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
        }

        [HttpGet("GetRuleSetsCount")]
        public async Task<IActionResult> GetRuleSetsCount(string Id)
        {
            var _ruleSets = _ruleSetService.GetRuleSetsByUserId(Id);

            if (_ruleSets == null) return Ok(0);

            //If Limited edition
            _ruleSets = _ruleSets.Take(_ruleSets.Count >= 3 ? 3 : _ruleSets.Count).ToList();

            return Ok(_ruleSets.Count);
        }
        [HttpGet("GetRuleSetAndCharacterCount")]
        public async Task<IActionResult> GetRuleSetAndCharacterCount(string Id)
        {
            int rCount = await _ruleSetService.GetRuleSetsCountByUserId(Id);
            int cCount = _characterService.GetCharacterCountUserId(Id);
            return Ok(new { rulesetCount=rCount , characetrCount=cCount});
        }


        [HttpGet("getRulesetRecordCountById")]
        public async Task<IActionResult> GetRulesetRecordCountById(int Id)
        {           
            return Ok(_coreRulesetService.GetRulesetRecordCounts(Id));
        }
        
        [HttpGet("GetRuleSets")]
        public async Task<IActionResult> GetRuleSets(int page, int pageSize)
        {
            var ruleSets = await _ruleSetService.GetRuleSets(page, pageSize);

            //If Limited edition
            if (ruleSets != null && !IsAdminUser())
                ruleSets = ruleSets.Take(ruleSets.Count >= 3 ? 3 : ruleSets.Count).ToList();

            List<RuleSetViewModel> ruleSetsVM = new List<RuleSetViewModel>();
            foreach (var ruleSet in ruleSets)
                ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));

            return Ok(ruleSetsVM);
        }

        [HttpGet("GetAllRuleSets")]
        public async Task<IActionResult> GetRuleSets()
        {
            var ruleSets = await _ruleSetService.GetRuleSets();

            //If Limited edition
            if (ruleSets != null && !IsAdminUser())
                ruleSets = ruleSets.Take(ruleSets.Count >= 3 ? 3 : ruleSets.Count).ToList();

            List<RuleSetViewModel> ruleSetsVM = new List<RuleSetViewModel>();
            foreach (var ruleSet in ruleSets)
                ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));

            return Ok(ruleSetsVM);
        }

        [HttpGet("GetRuleSetById")]
        public async Task<IActionResult> GetRuleSetById(int id)
        {
            var ruleSet = await _ruleSetService.GetRuleSetById(id);
            //if (ruleSet == null) return Ok("RuleSet Not Found using Id" + id);
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
                    ruleSets = ruleSets.Take(ruleSets.Count >= 3 ? 3 : ruleSets.Count).ToList();


                foreach (var ruleSet in ruleSets)
                    ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));
            }

            catch (Exception ex) { }
            return Ok(ruleSetsVM);
        }

        [HttpGet("GetAllRuleSetByUserId")]
        public async Task<IActionResult> GetRuleSetByUserId(string id,int page=1, int pageSize=10)
        {
            var ruleSets = await _ruleSetService.GetRuleSetByUserId(id,page,pageSize);
            //if (ruleSets.Count == 0) return Ok("RuleSet Not Found using UserId " + id);

            //If Limited edition
            if (ruleSets != null && !IsAdminUser())
                ruleSets = ruleSets.Take(ruleSets.Count >= 3 ? 3 : ruleSets.Count).ToList();

            var ruleSetsVM = new List<RuleSetViewModel>();
            foreach (var ruleSet in ruleSets)
                ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));

            return Ok(ruleSetsVM);
        }

        [HttpGet("GetCoreRuleSets")]
        public IEnumerable<RuleSetViewModel> GetCoreRuleSets(string id)
        {
            var ruleSets = _ruleSetService.GetCoreRuleSets(id).Result;

            //If Limited edition
            //if (ruleSets != null && !IsAdminUser())
            //    ruleSets = ruleSets.Take(ruleSets.Count >= 3 ? 3 : ruleSets.Count).ToList();

            var ruleSetsVM = new List<RuleSetViewModel>();
            foreach (var ruleSet in ruleSets)
                ruleSetsVM.Add(_commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSet));

            return ruleSetsVM;
        }

        [HttpPost("CreateRuleSet")]
        public async Task<IActionResult> CreateRuleSet([FromBody] RuleSetViewModel model)
        {
            if (ModelState.IsValid)
            {
                var _userId = GetUserId();
                var ruleSetDomain = Mapper.Map<RuleSet>(model);

                //Limit user to have max 3 ruleset & //purchase for more sets
                if (await _ruleSetService.GetRuleSetsCountByUserId(_userId) >= 3 && !IsAdminUser())
                    return BadRequest("Only three slots of Rule Sets are allowed. For more slots, please contact administrator.");

                if (IsAdminUser()) ruleSetDomain.IsCoreRuleset = true;
                else ruleSetDomain.IsCoreRuleset = false;

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
                // System.IO.File.Delete(path);
                return Ok(ruleSetDomain);
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }


        [HttpPost("addRuleSets")]
        public async Task<IActionResult> addRuleSets([FromBody] int[] rulesetIds)
        {
            try
            {
                var _userId = GetUserId();

                //Limit user to have max 3 ruleset & //purchase for more sets
                if (await _ruleSetService.GetRuleSetsCountByUserId(_userId) >= 3 && !IsAdminUser())
                    return BadRequest("Only three slots of Rule Sets are allowed. For more slots, please contact administrator.");

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
                    var _addRuleset = GetRuleset(_id);
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
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
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
                    BlobService bs = new BlobService();
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
                var userId = GetUserId();
                var ruleSetDomain = _ruleSetService.GetRuleSetById(model.RuleSetId).Result;

                if (IsAdminUser())
                    ruleSetDomain.IsCoreRuleset = true;
                else
                    ruleSetDomain.IsCoreRuleset = false;

                ruleSetDomain.RuleSetName = model.RuleSetName;
                ruleSetDomain.RuleSetDesc = model.RuleSetDesc;
                ruleSetDomain.CurrencyLabel = model.CurrencyLabel;
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
                ruleSetDomain.IsAllowSharing = model.IsAllowSharing;
                ruleSetDomain.ShareCode = model.ShareCode;
                ruleSetDomain.ModifiedDate = DateTime.Now;

                if (_ruleSetService.IsRuleSetExist(model.RuleSetName, userId,model.RuleSetId).Result)
                    return BadRequest("Duplicate RuleSet Name");

                await _ruleSetService.UdateRuleSet(ruleSetDomain);
                List<CustomDice> result=_addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                List<DiceTray> diceTrayResult = _addEditDiceTray(result, model.diceTray.ToList(), ruleSetDomain.RuleSetId);
                return Ok(ruleSetDomain);
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
                var userId = GetUserId();

                if (await _ruleSetService.GetRuleSetsCountByUserId(userId) >= 3 && !IsAdminUser())
                    return BadRequest("Only three slots of Rule Sets are allowed. For more slots, please contact administrator.");


                if (_ruleSetService.IsRuleSetExist(model.RuleSetName, userId).Result)
                    return BadRequest("The Rule Set Name " + model.RuleSetName + " had already been used. Please select another name.");
                              
                var ruleSetDomain = Mapper.Map<RuleSet>(model);
                ruleSetDomain.isActive = true;
                ruleSetDomain.ShareCode = IsAdminUser() ? (Guid?)Guid.NewGuid() : null;
                ruleSetDomain.IsAllowSharing = IsAdminUser() ? model.IsAllowSharing: false;
                ruleSetDomain.IsCoreRuleset = false;
                ruleSetDomain.OwnerId = userId;
                ruleSetDomain.CreatedBy = userId;
                ruleSetDomain.CreatedDate = DateTime.Now;
                ruleSetDomain.ModifiedBy = userId;
                ruleSetDomain.ModifiedDate = DateTime.Now;
                //ruleSetDomain.RuleSetId = 0;
                try
                {
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
                            return Ok(ruleSetDomain);
                        }
                    }
                    RuleSet res = await _ruleSetService.duplicateRuleset(ruleSetDomain, model.RuleSetId, userId);
                    ruleSetDomain.RuleSetId = res.RuleSetId;
                    //await addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                    List<CustomDice> result = _addEditCustomDice(model.customDices.ToList(), ruleSetDomain.RuleSetId);
                    List<DiceTray> diceTrayResult = _addEditDiceTray(result, model.diceTray.ToList(), ruleSetDomain.RuleSetId);
                }
                catch(Exception ex)
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


                return Ok(ruleSetDomain);
            }

            return BadRequest(ModelState);
        }

        [AllowAnonymous]
        [HttpGet("ImportRuleSet")]
        public async Task<IActionResult> ImportRuleSet(string code)
        {
            var ruleSet = _ruleSetService.ImportRuleSetByCode(code).Result;

            if (ruleSet == null) return BadRequest("The entered share code is invalid. Please enter a valid share code.");

            if (ruleSet.IsAllowSharing) {
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
                ? "https://rpgsmithsa.blob.core.windows.net/stock-defimg-rulesets/RuleSetWhite.png" : ruleSet.ImageUrl);
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
        
        
        
        
        
        public RuleSetViewModel GetRuleset(int rulesetId)
        {
            var _ruleset = _ruleSetService.GetRuleSetById(rulesetId).Result;
            return new RuleSetViewModel()
            {
                RuleSetName = _ruleset.RuleSetName,
                RuleSetDesc = _ruleset.RuleSetDesc,
                DefaultDice = _ruleset.DefaultDice,
                CurrencyLabel = _ruleset.CurrencyLabel,
                WeightLabel = _ruleset.WeightLabel,
                DistanceLabel = _ruleset.DistanceLabel,
                SortOrder = _ruleset.SortOrder,
                VolumeLabel = _ruleset.VolumeLabel,
                ImageUrl = _ruleset.ImageUrl,
                ThumbnailUrl = _ruleset.ThumbnailUrl,
                IsAbilityEnabled = _ruleset.IsAbilityEnabled,
                IsItemEnabled = _ruleset.IsItemEnabled,
                IsSpellEnabled = _ruleset.IsSpellEnabled,
                IsAllowSharing = _ruleset.IsAllowSharing,

                IsCoreRuleset = _ruleset.IsCoreRuleset,
                ParentRuleSetId = rulesetId
            };
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
                int result= await _coreRulesetService.GetCopiedRuleSetIdFromRulesetAndUser(rulesetID, UserID);
                return Ok(result);
            }
            catch (Exception ex) {
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
        public async Task<IActionResult> addEditCustomDice([FromBody]  List<CustomDiceViewModel> model,int rulesetID)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    List<CustomDice> result = new List<CustomDice>();
                    result = _addEditCustomDice(model, rulesetID);
                    return Ok(Utilities.MapCustomDice(result));
                }
                catch (Exception ex) {
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
                    RuleSetId = rulesetID
                };
                List<CustomDiceResult> diceResList = new List<CustomDiceResult>();
                foreach (var res in dice.Results)
                {
                    CustomDiceResult CDres = new CustomDiceResult()
                    {
                        //CustomDiceResultId=res.CustomDiceResultId,
                        //CustomDiceId=res.CustomDiceId,
                        Name = res.Name
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
          return  _ruleSetService.addEditDiceTray(customDices, diceTrays, rulesetID);
        }

        [HttpGet("GetCustomDice")]
        public async Task<IActionResult> GetCustomDice(int rulesetID)
        {
            try
            {
                List<CustomDiceViewModel> result =Utilities.MapCustomDice(_ruleSetService.GetCustomDice(rulesetID));
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

        #endregion
    }
}
