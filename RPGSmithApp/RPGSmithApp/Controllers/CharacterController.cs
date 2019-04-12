using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Models.RulesetTileModels;
using DAL.Models.SPModels;
using DAL.Services;
using DAL.Services.CharacterTileServices;
using DAL.Services.RulesetTileServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;
using Enum = RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{

    // [Authorize]
    [Route("api/[controller]")]
    public class CharacterController : Controller
    {
        private int TotalCharacterSlotsAvailable = 3;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ICharacterService _CharacterService;
        private readonly ICharacterSpellService _characterSpellService;
        private readonly ICharacterAbilityService _characterAbilityService;
        private readonly IItemService _itemService;
        private readonly IColorService _colorService;
        private readonly ICharacterCommandService _characterCommandService;
        private readonly ICharactersCharacterStatService _charactersCharacterStatServic;
        private readonly ICharacterDashboardLayoutService _characterDashboardLayoutService;
        private readonly ICharacterDashboardPageService _characterDashboardPageService;
        private readonly ICharacterStatService _characterStatService;
        private readonly ICharacterTileService _characterTileService;
        private readonly IRuleSetService _ruleSetService;
        private readonly IRulesetDashboardLayoutService _rulesetDashboardLayoutService;
        private readonly IRulesetDashboardPageService _rulesetDashboardPageService;
        private readonly IRulesetTileService _rulesetTileService;
        private readonly ICharacterStatTileService _characterStatTileService;
        private readonly ICommandTileService _commandTileService;
        private readonly ICounterTileService _counterTileService;
        private readonly IImageTileService _imageTileService;
        private readonly INoteTileService _noteTileService;
        private readonly ITileConfigService _tileConfigService;
        private readonly ICommonFuncsCoreRuleSet _commonFuncsCoreRuleSet;

        public CharacterController(ICharacterService CharacterService, IHttpContextAccessor httpContextAccessor,
            IAccountManager accountManager, ICharacterSpellService characterSpellService,
            ICharacterAbilityService characterAbilityService, IItemService itemService,
            ICharacterCommandService characterCommandService, ICharactersCharacterStatService charactersCharacterStatServic,
            ICharacterStatService characterStatService, ICharacterDashboardLayoutService characterDashboardLayoutService,
            ICharacterDashboardPageService characterDashboardPageService, ICharacterTileService characterTileService,
            IRuleSetService ruleSetService, IRulesetDashboardLayoutService rulesetDashboardLayoutService,
            IRulesetDashboardPageService rulesetDashboardPageService, IRulesetTileService rulesetTileService,
            ICharacterStatTileService characterStatTileService, ITileConfigService tileConfigService,
            ICommandTileService commandTileService,
            ICounterTileService counterTileService,
            IImageTileService imageTileService,
            INoteTileService noteTileService,
            ICommonFuncsCoreRuleSet commonFuncsCoreRuleSet)
        {
            _CharacterService = CharacterService;
            _httpContextAccessor = httpContextAccessor;
            _accountManager = accountManager;
            _characterSpellService = characterSpellService;
            _characterAbilityService = characterAbilityService;
            _itemService = itemService;
            _characterCommandService = characterCommandService;
            _charactersCharacterStatServic = charactersCharacterStatServic;
            _characterStatService = characterStatService;
            _characterDashboardLayoutService = characterDashboardLayoutService;
            _characterDashboardPageService = characterDashboardPageService;
            _ruleSetService = ruleSetService;
            _rulesetDashboardLayoutService = rulesetDashboardLayoutService;
            _rulesetDashboardPageService = rulesetDashboardPageService;
            _rulesetTileService = rulesetTileService;
            _characterTileService = characterTileService;
            _characterStatTileService = characterStatTileService;
            _commandTileService = commandTileService;
            _counterTileService = counterTileService;
            _imageTileService = imageTileService;
            _noteTileService = noteTileService;
            _tileConfigService = tileConfigService;
            _commonFuncsCoreRuleSet = commonFuncsCoreRuleSet;
        }

        [HttpGet("GetCharactersCount")]
        public async Task<IActionResult> GetCharactersCount(string Id)
        {
            // var _characters = _CharacterService.GetCharacterUserId(Id);
             int _charactersCount = _CharacterService.GetCharacterCountUserId(Id);

            //if (_characters == null)
            //    return Ok(0);

            return Ok(_charactersCount);
        }
        
        [HttpGet("GetCharacters_charStatsById")]
        public async Task<IActionResult> GetCharacters_charStatsById(int RulesetId,int characterId)
        {
            SP_CharactersCharacterStat ccs = new SP_CharactersCharacterStat();
            RuleSetViewModel res = new RuleSetViewModel();
            List<CustomDiceViewModel> customdices = new List<CustomDiceViewModel>();
            List<DefaultDice> defaultdices = new List<DefaultDice>();
            List<DiceTray> dicetray = new List<DiceTray>();
            if (characterId>0)
            {
                ccs = _characterTileService.GetCharactersCharacterStats_sp(characterId);
            }
            if (RulesetId > 0)
            {
                var ruleSetdetail = await _ruleSetService.GetRuleSetById(RulesetId);
                res = _commonFuncsCoreRuleSet.GetRuleSetViewModel(ruleSetdetail);
                customdices = Utilities.MapCustomDice(_ruleSetService.GetCustomDice(RulesetId));
                dicetray = _ruleSetService.GetDiceTray(RulesetId);
                defaultdices = _ruleSetService.GetDefaultDices();
            }
            return Ok(new {
                ruleSet = res, characterCharacterstats = ccs, customDices= customdices,
                diceTray= dicetray,
                defaultDices= defaultdices
            });
        }
        [HttpPost("CreateCharacter")]
        public async Task<IActionResult> CreateCharacter([FromBody] CharacterEditModel model)
        {
            if (ModelState.IsValid)
            { int CharIdToDuplicate = 0;
                var userId = GetUserId();
                if (model.View.ToUpper() == "DUPLICATE")
                {
                    CharIdToDuplicate=model.CharacterId;
                    model.CharacterId = 0;
                }

                await TotalCharacterSlotsAvailableForCurrentUser();
                //Limit user to have max 3 characters & //purchase for more set
                if (await _CharacterService.GetCharactersCountByUserId(userId) >= TotalCharacterSlotsAvailable && !IsAdminUser())
                    return BadRequest("Only "+ TotalCharacterSlotsAvailable + " slots of Characters are allowed");

                var characterDomain = Mapper.Map<Character>(model);
                characterDomain.UserId = userId;

                if (_CharacterService.IsCharacterExist(model.CharacterName, userId).Result)
                    return BadRequest("The Character Name '" + model.CharacterName + "' had already been used in this Rule Set. Please select another name.");

                if (IsNewRulesetToAdd(model.RuleSetId, userId))
                {
                    var NewRuleset =await AddCoreRuleSetsCommon(new int[] { model.RuleSetId });
                    if (NewRuleset==null)
                    {
                        return BadRequest("The maximum number of Rule Sets ("+ TotalCharacterSlotsAvailable + ") already exist on this account. Please delete one of the existing Rule Sets to allow for the addition of another. Rule Sets can be deleted from the Rule Sets screen");
                    }
                    else 
                    {
                        model.RuleSetId= NewRuleset.RuleSetId;
                        characterDomain.RuleSetId = NewRuleset.RuleSetId;
                    }
                }

                try
                {
                    _CharacterService.Create_SP(characterDomain, model.LayoutHeight, model.LayoutWidth, CharIdToDuplicate);
                    
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
               
                //var result = await _CharacterService.InsertCharacter(characterDomain);

                //// Add Character Stat from Rule set Character stats
                //int? parentID = _ruleSetService.GetRuleSetById(model.RuleSetId).Result.ParentRuleSetId;
                //if (parentID == null)
                //{
                //    parentID = model.RuleSetId;
                //}
                //var characterstats = _characterStatService.Core_GetCharacterStatRuleSetId(model.RuleSetId, (int)parentID);

                //foreach (var cs in characterstats)
                //{
                //    await _charactersCharacterStatServic.Create(new CharactersCharacterStat()
                //    {
                //        CharacterId = result.CharacterId,
                //        CharacterStatId = cs.CharacterStatId,
                //        OnOff = false,
                //        YesNo = false
                //    });
                //}

                //var rulesetLayouts = _rulesetDashboardLayoutService.GetByRulesetId(characterDomain.RuleSetId ?? 0).Result;
                //if (rulesetLayouts != null)
                //{
                //    int count = 0;
                //    foreach (var layout in rulesetLayouts)
                //    {
                //        count += 1;
                //        var _characterDashboardLayout = await _characterDashboardLayoutService.Create(new CharacterDashboardLayout()
                //        {
                //            Name = layout.Name,
                //            LayoutHeight = layout.LayoutHeight,
                //            LayoutWidth = layout.LayoutWidth,
                //            CharacterId = result.CharacterId,
                //            SortOrder = 1,
                //            IsDefaultLayout = count == 1 ? true : false
                //        });

                //        var rulesetPages = _rulesetDashboardPageService.GetPagesByLayoutId(layout.RulesetDashboardLayoutId);
                //        if (rulesetPages != null)
                //        {
                //            count = 2;
                //            foreach (var page in rulesetPages)
                //            {
                //                // page.Ruleset.
                //                //page.Tiles = null;
                //                //page.Layout = null;
                //                var _characterDashboardPage = await _characterDashboardPageService.Create(new CharacterDashboardPage()
                //                {
                //                    CharacterDashboardLayoutId = _characterDashboardLayout.CharacterDashboardLayoutId,
                //                    CharacterId = result.CharacterId,
                //                    Name = page.Name,
                //                    ContainerWidth = page.ContainerWidth,
                //                    ContainerHeight = page.ContainerHeight,
                //                    BodyBgColor = page.BodyBgColor,
                //                    BodyTextColor = page.BodyTextColor,
                //                    TitleBgColor = page.TitleBgColor,
                //                    TitleTextColor = page.TitleTextColor,
                //                    SortOrder = 1
                //                });
                //                if (count == 2)
                //                {
                //                    _characterDashboardLayout.DefaultPageId = _characterDashboardPage.CharacterDashboardPageId;
                //                    await _characterDashboardLayoutService.Update(_characterDashboardLayout);
                //                    count += 1;
                //                }

                //                var rulesetTiles = _rulesetTileService.GetByPageIdRulesetId(page.RulesetDashboardPageId, page.RulesetId ?? 0);
                //                if (rulesetTiles != null)
                //                {
                //                    foreach (var _tile in rulesetTiles)
                //                    {
                //                        var Tile = new CharacterTile
                //                        {
                //                            CharacterDashboardPageId = _characterDashboardPage.CharacterDashboardPageId,
                //                            CharacterId = result.CharacterId,
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
                //                                await _characterTileService.Create(Tile);
                //                                var noteTile = _tile.NoteTiles;
                //                                Tile.NoteTiles = await _noteTileService.Create(new CharacterNoteTile
                //                                {
                //                                    CharacterTileId = Tile.CharacterTileId,
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
                //                                await _characterTileService.Create(Tile);
                //                                var imageTile = _tile.ImageTiles;
                //                                Tile.ImageTiles = await _imageTileService.Create(new CharacterImageTile
                //                                {
                //                                    CharacterTileId = Tile.CharacterTileId,
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
                //                                await _characterTileService.Create(Tile);
                //                                var counterTile = _tile.CounterTiles;
                //                                Tile.CounterTiles = await _counterTileService.Create(new CharacterCounterTile
                //                                {
                //                                    CharacterTileId = Tile.CharacterTileId,
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
                //                                await _characterTileService.Create(Tile);
                //                                var characterStatTile = _tile.CharacterStatTiles;
                //                                var charactersCharacterStats = _charactersCharacterStatServic.GetByCharacterStatId(characterStatTile.CharacterStatId ?? 0, result.CharacterId);
                //                                foreach (var charactersCharacterStat in charactersCharacterStats)
                //                                {
                //                                    //charactersCharacterStat.CharacterStatTiles = null;
                //                                    Tile.CharacterStatTiles = await _characterStatTileService.Create(new CharacterCharacterStatTile
                //                                    {
                //                                        CharacterTileId = Tile.CharacterTileId,
                //                                        CharactersCharacterStatId = charactersCharacterStat.CharactersCharacterStatId,
                //                                        ShowTitle = characterStatTile.ShowTitle,
                //                                        Shape = characterStatTile.Shape,
                //                                        SortOrder = characterStatTile.SortOrder,
                //                                        bodyBgColor = characterStatTile.bodyBgColor,
                //                                        bodyTextColor = characterStatTile.bodyTextColor,
                //                                        titleBgColor = characterStatTile.titleBgColor,
                //                                        titleTextColor = characterStatTile.titleTextColor,
                //                                        IsDeleted = false
                //                                    });
                //                                    SaveColorsAsync(Tile);
                //                                }
                //                                break;
                //                            case (int)Enum.TILES.LINK: break;
                //                            case (int)Enum.TILES.EXECUTE: break;
                //                            case (int)Enum.TILES.COMMAND:
                //                                await _characterTileService.Create(Tile);
                //                                var commandTile = _tile.CommandTiles;
                //                                Tile.CommandTiles = await _commandTileService.Create(new CharacterCommandTile
                //                                {
                //                                    CharacterTileId = Tile.CharacterTileId,
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
                //                            default:
                //                                break;
                //                        }
                //                        try
                //                        {
                //                            await _tileConfigService.CreateAsync(new TileConfig
                //                            {
                //                                CharacterTileId = Tile.CharacterTileId,
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
                //else
                //{
                //    //Create default layout & page for character
                //    var CharacterDashboardLayout = await _characterDashboardLayoutService.Create(new CharacterDashboardLayout()
                //    {
                //        //DefaultPageId
                //        Name = "Default",
                //        SortOrder = 1,
                //        LayoutHeight = model.LayoutHeight,
                //        LayoutWidth = model.LayoutWidth,
                //        CharacterId = result.CharacterId,
                //        IsDefaultLayout = true
                //    });
                //    var CharacterDashboardPage = await _characterDashboardPageService.Create(new CharacterDashboardPage()
                //    {
                //        CharacterDashboardLayoutId = CharacterDashboardLayout.CharacterDashboardLayoutId,
                //        Name = "Page1",
                //        ContainerWidth = model.LayoutHeight,
                //        ContainerHeight = model.LayoutWidth,
                //        BodyBgColor = "#FFFFFF",//set default while creating character
                //        BodyTextColor = "#000000",
                //        TitleBgColor = "#FFFFFF",
                //        TitleTextColor = "#000000",
                //        SortOrder = 1,
                //        CharacterId = result.CharacterId
                //    });
                //    CharacterDashboardLayout.DefaultPageId = CharacterDashboardPage.CharacterDashboardPageId;
                //    await _characterDashboardLayoutService.Update(CharacterDashboardLayout);
                //}
                return Ok();
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private bool IsNewRulesetToAdd(int ruleSetId,string userId)
        {
            return _CharacterService.IsNewRulesetToAdd(ruleSetId, userId);
        }

        [HttpPost("UpdateCharacter")]
        public async Task<IActionResult> UpdateCharacter([FromBody]  CharacterEditModel model)
        {
            if (ModelState.IsValid)
            {
                var userId = GetUserId();

                if (_CharacterService.IsCharacterExist(model.CharacterName, userId, model.CharacterId).Result)
                    return BadRequest("Duplicate Character Name");

                var characterDomain = Mapper.Map<Character>(model);
                characterDomain.CharacterId = model.CharacterId;
                characterDomain.UserId = userId;
                characterDomain.ImageUrl = model.ImageUrl;
                characterDomain.ThumbnailUrl = model.ThumbnailUrl;

                var result = await _CharacterService.UpdateCharacter(characterDomain);

                //Update character default layout/page if not already
                var CharacterDashboardLayout = new CharacterDashboardLayout();
                if (_characterDashboardLayoutService.GetCountByCharacterId(model.CharacterId) == 0)
                {
                    CharacterDashboardLayout = await _characterDashboardLayoutService.Create(new CharacterDashboardLayout()
                    {
                        //DefaultPageId
                        Name = "Default",
                        SortOrder = 1,
                        CharacterId = result.CharacterId
                    });

                    var CharacterDashboardPage = new CharacterDashboardPage();
                    if (_characterDashboardPageService.GetCountByCharacterId(model.CharacterId) == 0)
                    {
                        CharacterDashboardPage = await _characterDashboardPageService.Create(new CharacterDashboardPage()
                        {
                            CharacterDashboardLayoutId = CharacterDashboardLayout.CharacterDashboardLayoutId,
                            Name = "Page1",
                            ContainerWidth = 1370,
                            ContainerHeight = 720,
                            SortOrder = 1,
                            CharacterId = result.CharacterId
                        });
                    }
                    CharacterDashboardLayout.DefaultPageId = CharacterDashboardPage.CharacterDashboardPageId;
                    await _characterDashboardLayoutService.Update(CharacterDashboardLayout);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpDelete("DeleteCharacter")]
        public async Task<IActionResult> DeleteCharacter(int Id)
        {
            await _CharacterService.DeleteCharacter(Id);

            return Ok();
        }

        [HttpGet("GetCharactersById")]
        public async Task<IActionResult> GetCharactersById(int id)
        {
            var character = _CharacterService.GetCharacterById(id);
            if (character == null)
                return Ok("Character Not Found using Id" + id);

            return Ok(GetCharacterViewModel(character));
        }

        [HttpGet("GetCharactersByIdDice")]
        public async Task<IActionResult> GetCharactersByIdDice(int id)
        {
            var character = _CharacterService.GetCharacterByIdDice(id);
            if (character == null)
                return Ok("Character Not Found using Id" + id);

            return Ok(character);
        }

        [HttpGet("GetCharactersByRuleSetId")]
        public async Task<IActionResult> GetCharacterByRuleSetId(int id)
        {
            var characters = _CharacterService.GetCharacterRuleSetId(id);

            //If Limited edition
            if (characters != null && !IsAdminUser()) {
                await TotalCharacterSlotsAvailableForCurrentUser();
                characters = characters.Take(characters.Count >= TotalCharacterSlotsAvailable ? TotalCharacterSlotsAvailable : characters.Count).ToList();
            }

            List<CharacterViewModel> CharacterVM = new List<CharacterViewModel>();
            foreach (var character in characters)
                CharacterVM.Add(GetCharacterViewModel(character));

            return Ok(CharacterVM);
        }

        [HttpGet("GetCharactersByUserId")]
        public async Task<IActionResult> GetCharactersByUserId(string id)
        {
            var characters = _CharacterService.GetCharacterUserId(id);

            //If Limited edition
            if (characters != null && !IsAdminUser()) {
                await TotalCharacterSlotsAvailableForCurrentUser();
                characters = characters.Take(characters.Count >= TotalCharacterSlotsAvailable ? TotalCharacterSlotsAvailable : characters.Count).ToList();
            }

            List<CharacterViewModel> CharacterVM = new List<CharacterViewModel>();
            foreach (var character in characters)
                CharacterVM.Add(GetCharacterViewModel(character));

            return Ok(CharacterVM);
        }

                
        [HttpPost("UpLoadCharaterImageBlob")]
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
                    Response.ThumbnailUrl = Response.ImageUrl; // bs.UploadThumbnail(httpPostedFile, imageName, container).Result;

                    return Ok(Response);
                }

                return BadRequest();
            }
            return BadRequest("No Image Selected");

        }

        private CharacterViewModel GetCharacterViewModel(Character Character)
        {
            var CharactersVM = new CharacterViewModel
            {
                CharacterId = Character.CharacterId,
                CharacterName = Character.CharacterName,
                CharacterDescription = Character.CharacterDescription,
                //CharacterImage = Character.CharacterImage,
                ImageUrl = Character.ImageUrl,
                ThumbnailUrl = Character.ThumbnailUrl,
                LastCommand = Character.LastCommand,
                LastCommandResult = Character.LastCommandResult,
                LastCommandValues = Character.LastCommandValues,
                LastCommandTotal = Character.LastCommandTotal,
                InventoryWeight = Character.InventoryWeight,
                RuleSet = Character.RuleSet == null ? new RuleSetViewModel() : new RuleSetViewModel
                {
                    RuleSetId = Character.RuleSet.RuleSetId,
                    RuleSetName = Character.RuleSet.RuleSetName,
                    RuleSetDesc = Character.RuleSet.RuleSetName,
                    isActive = Character.RuleSet.isActive,
                    DefaultDice = Character.RuleSet.DefaultDice,
                    CurrencyLabel = Character.RuleSet.CurrencyLabel,
                    WeightLabel = Character.RuleSet.WeightLabel,
                    DistanceLabel = Character.RuleSet.DistanceLabel,
                    SortOrder = Character.RuleSet.SortOrder,
                    VolumeLabel = Character.RuleSet.VolumeLabel,
                    ImageUrl = Character.RuleSet.ImageUrl,
                    ThumbnailUrl = Character.RuleSet.ThumbnailUrl,
                    IsItemEnabled = Character.RuleSet.IsItemEnabled,
                    IsAbilityEnabled = Character.RuleSet.IsAbilityEnabled,
                    IsSpellEnabled = Character.RuleSet.IsSpellEnabled
                    //RuleSetImage = Character.RuleSet.RuleSetImage
                },
                RuleSets = Character.RuleSet == null ? new List<RuleSetViewModel>() : new List<RuleSetViewModel>
                {
                    new RuleSetViewModel {
                        RuleSetId = Character.RuleSet.RuleSetId,
                        RuleSetName = Character.RuleSet.RuleSetName,
                        RuleSetDesc = Character.RuleSet.RuleSetName,
                        isActive = Character.RuleSet.isActive,
                        DefaultDice = Character.RuleSet.DefaultDice,
                        CurrencyLabel = Character.RuleSet.CurrencyLabel,
                        WeightLabel = Character.RuleSet.WeightLabel,
                        DistanceLabel = Character.RuleSet.DistanceLabel,
                        SortOrder = Character.RuleSet.SortOrder,
                        VolumeLabel = Character.RuleSet.VolumeLabel,
                        ImageUrl = Character.RuleSet.ImageUrl,
                        ThumbnailUrl = Character.RuleSet.ThumbnailUrl,
                        IsItemEnabled=Character.RuleSet.IsItemEnabled,
                        IsAbilityEnabled=Character.RuleSet.IsAbilityEnabled,
                        IsSpellEnabled=Character.RuleSet.IsSpellEnabled
                        //RuleSetImage = Character.RuleSet.RuleSetImage
                    }
                }
            };
            return CharactersVM;
        }

        [AllowAnonymous]
        [HttpPost("duplicateCharacter")]
        public async Task<IActionResult> DuplicateCharacter([FromBody] Character model)
        {
            if (ModelState.IsValid)
            {
                var userId = GetUserId();

                await TotalCharacterSlotsAvailableForCurrentUser();
                //Limit user to have max 3 characters & //purchase for more set
                if (await _CharacterService.GetCharactersCountByUserId(userId) >= TotalCharacterSlotsAvailable && !IsAdminUser())
                    return BadRequest("Only "+ TotalCharacterSlotsAvailable + " slots of Characters are allowed.");


                if (_CharacterService.IsCharacterExist(model.CharacterName, userId).Result)
                    return BadRequest("The Character Name '" + model.CharacterName + "' had already been used in this Rule Set. Please select another name.");

                var character = _CharacterService.GetCharacterById(model.CharacterId);


                model.CharacterId = 0;
                model.UserId = userId;

                var result = await _CharacterService.InsertCharacter(model);

                if (result.CharacterId > 0)
                {
                    foreach (var ability in character.CharacterAbilities)
                    {
                        await _characterAbilityService.InsertCharacterAbility(new CharacterAbility()
                        {
                            CharacterId = result.CharacterId,
                            IsEnabled = ability.IsEnabled,
                            AbilityId = ability.AbilityId
                        });
                    }

                    foreach (var spell in character.CharacterSpells)
                    {
                        await _characterSpellService.InsertCharacterSpell(new CharacterSpell()
                        {
                            CharacterId = result.CharacterId,
                            IsMemorized = spell.IsMemorized,
                            SpellId = spell.SpellId
                        });
                    }

                    foreach (var item in character.Items)
                    {
                        await _itemService.InsertItem(new Item()
                        {
                            CharacterId = result.CharacterId,
                            ItemMasterId = item.ItemMasterId,
                            ContainedIn = item.ContainedIn,
                            Quantity = item.Quantity,
                            TotalWeight = item.TotalWeight,
                            IsIdentified = item.IsIdentified,
                            IsEquipped = item.IsEquipped,
                            IsVisible = item.IsVisible,
                            Name = item.Name,

                            IsContainer = item.IsContainer,
                            IsConsumable = item.IsConsumable,
                            IsMagical = item.IsMagical,
                            ItemCalculation = item.ItemCalculation,
                            Metatags = item.Metatags,
                            Rarity = item.Rarity,
                            Value = item.Value,
                            Volume = item.Volume,
                            Weight = item.Weight,

                            ItemStats = item.ItemStats,
                            ContainerWeightMax = item.ContainerWeightMax,
                            ContainerVolumeMax = item.ContainerVolumeMax,
                            PercentReduced = item.PercentReduced,
                            TotalWeightWithContents = item.TotalWeightWithContents,
                            ContainerWeightModifier = item.ContainerWeightModifier
                        },
                        item.ItemSpells.ToList(),
                        item.ItemAbilities.ToList());
                    }
                    foreach (var cc in character.CharacterCommands)
                    {
                        await _characterCommandService.Create(new CharacterCommand()
                        {
                            CharacterId = result.CharacterId,
                            Command = cc.Command,
                            Name = cc.Name,
                            UpdatedOn = cc.UpdatedOn,
                            CreatedOn = cc.CreatedOn

                        });

                    }

                    return Ok();
                }
                else
                {
                    BadRequest("some error occurred");
                }

            }

            return BadRequest(ModelState);
        }

        [HttpPost("updateLastCommand")]
        public async Task<IActionResult> UpdateLastCommand([FromBody] UpdateCharacterLastCommand model)
        {
            if (ModelState.IsValid)
            {
                //var result = await _CharacterService.UpdateLastCommand(model.CharacterId, model.LastCommand, model.LastCommandResult, model.LastCommandValues);
                return Ok(await _CharacterService.UpdateLastCommand(model.CharacterId, model.LastCommand, model.LastCommandResult, model.LastCommandValues, model.LastCommandTotal));
            }

            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        private async void SaveColorsAsync(CharacterTile Tile)
        {
            try
            {
                TileColor _tileColor = new TileColor();
                _tileColor.CreatedBy = GetUserId();
                _tileColor.CreatedDate = DateTime.Now;
                _tileColor.CharacterTileId = Tile.CharacterTileId;

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
                    case (int)Enum.TILES.LINK:
                        _tileColor.BodyBgColor = Tile.LinkTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.LinkTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.LinkTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.LinkTiles.TitleTextColor;
                        break;
                    case (int)Enum.TILES.EXECUTE:
                        _tileColor.BodyBgColor = Tile.ExecuteTiles.BodyBgColor;
                        _tileColor.BodyTextColor = Tile.ExecuteTiles.BodyTextColor;
                        _tileColor.TitleBgColor = Tile.ExecuteTiles.TitleBgColor;
                        _tileColor.TitleTextColor = Tile.ExecuteTiles.TitleTextColor;
                        break;
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

        private ApplicationUser GetUserDetails()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser;
        }

        private bool IsAdminUser()
        {
            (ApplicationUser user, string[] role) = _accountManager.GetUserAndRolesAsync(GetUserId()).Result;
            if (string.Join("", role).Contains("administrator")) return true;
            return false;
        }

        private async Task<RuleSet> AddCoreRuleSetsCommon(int[] rulesetIds)
        {
            RuleSet res = null;
            var _userId = GetUserId();

            //await TotalCharacterSlotsAvailableForCurrentUser(); //Already being called from previsous method
            //Limit user to have max 3 ruleset & //purchase for more sets
            if (await _ruleSetService.GetRuleSetsCountByUserId(_userId) >= TotalCharacterSlotsAvailable && !IsAdminUser())
                return null;

            foreach (var _id in rulesetIds)
            {
                var _addRuleset =Utilities.GetRuleset(_id, _ruleSetService);
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
               
                var _rulesetData = Mapper.Map<RuleSet>(_addRuleset);
                _rulesetData.isActive = true;
                _rulesetData.ShareCode = null;//Guid.NewGuid(); //not used in sp
                _rulesetData.OwnerId = _userId;
                _rulesetData.CreatedBy = _userId;
                _rulesetData.CreatedDate = DateTime.Now;
                _rulesetData.RuleSetName = newRulesetName;

                _addRuleset.IsCoreRuleset = false;//not used in sp

                res = await _ruleSetService.AddCoreRuleset(_rulesetData, _id, _userId);
                //CopyCustomDiceToNewRuleSet(_id, res.RuleSetId);
                _ruleSetService.CopyCustomDiceToNewRuleSet(_id, res.RuleSetId);
            }
            return res;
        }
        private async Task TotalCharacterSlotsAvailableForCurrentUser()
        {
            ApplicationUser user = GetUserDetails();
            UserSubscription userSubscription = await _accountManager.userSubscriptions(user.Id);
            if (userSubscription != null)
            {
                TotalCharacterSlotsAvailable = userSubscription.CharacterCount;
            }
            else {
                TotalCharacterSlotsAvailable = 3;
            }
            
           
        }
        #region API Using SP
        [HttpGet("getByUserId_sp")]
        public async Task<IActionResult> getByUserId_sp(string userId, int page = 1, int pageSize = 30)
        {
            dynamic Response = new ExpandoObject();
            (List<Character> CharactersList, List<RuleSet> _ruleSet) = _CharacterService.SP_Character_GetByUserId(userId, page, pageSize);

            Response.CharactersList = CharactersList;
            Response.RuleSet = _ruleSet;

            return Ok(Response);
        }

        #endregion

        #region Custom Dice DiceTray
        
        [HttpGet("GetDiceTray")]
        public async Task<IActionResult> GetDiceTray(int rulesetId, int characterId)
        {
            List<DiceTray> result = new List<DiceTray>();
            if (characterId != 0)
            {
                rulesetId = (int)_CharacterService.GetCharacterById(characterId).RuleSetId;
            }
            return Ok(new {
               diceTray= _ruleSetService.GetDiceTray(rulesetId).ToList(),
               customDices= _ruleSetService.GetCustomDice(rulesetId).ToList(),
               defaultDices= _ruleSetService.GetDefaultDices().ToList(),
            });
        }
        #endregion
    }
}

