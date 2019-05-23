using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Models;
using DAL.Models.RulesetTileModels;
//using DAL.Services;
using DAL.Services.RulesetTileServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels.EditModels;
using Enum = RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class RulesetDashboardLayoutController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRulesetDashboardLayoutService _rulesetDashboardLayoutService;
        private readonly IRulesetDashboardPageService _rulesetDashboardPageService;
        private readonly IRulesetTileService _tileService;
        private readonly IRulesetCharacterStatTileService _characterStatTileService;
        private readonly IRulesetCommandTileService _commandTileService;
        private readonly IRulesetCounterTileService _counterTileService;
        private readonly IRulesetImageTileService _imageTileService;
        private readonly IRulesetNoteTileService _noteTileService;
        private readonly IRulesetTileConfigService _tileConfigService;
        private readonly IRulesetTextTileService _textTileService;

        public RulesetDashboardLayoutController(IHttpContextAccessor httpContextAccessor,
            IRulesetDashboardLayoutService rulesetDashboardLayoutService,
            IRulesetDashboardPageService rulesetDashboardPageService,
            IRulesetTileService characterTileService,
            IRulesetCharacterStatTileService characterStatTileService,
            IRulesetCommandTileService commandTileService,
            IRulesetCounterTileService counterTileService,
            IRulesetImageTileService imageTileService,
            IRulesetNoteTileService noteTileService,
            IRulesetTileConfigService tileConfigService, IRulesetTextTileService textTileService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._rulesetDashboardLayoutService = rulesetDashboardLayoutService;
            this._rulesetDashboardPageService = rulesetDashboardPageService;
            this._tileService = characterTileService;
            this._characterStatTileService = characterStatTileService;
            this._commandTileService = commandTileService;
            this._counterTileService = counterTileService;
            this._imageTileService = imageTileService;
            this._noteTileService = noteTileService;
            this._tileConfigService = tileConfigService;
            this._textTileService = textTileService;
        }

        [HttpGet("getByRulesetId")]
        public async Task<IEnumerable<RulesetDashboardLayout>> GetByRulesetId(int rulesetId, int page = -1, int pageSize = -1)
        {
            var listLayout = await _rulesetDashboardLayoutService.GetByRulesetId(rulesetId, page,pageSize);

            bool noDefaultLayout = false;

            if (listLayout == null) noDefaultLayout = true;
            else if (listLayout.Count == 0) noDefaultLayout = true;

            try
            {
                if (noDefaultLayout)
                {
                    //in case dashboard has no layout & page created
                    var _layout = await _rulesetDashboardLayoutService.Create(
                        new RulesetDashboardLayout()
                        {
                            Name = "Default",
                            SortOrder = 1,
                            LayoutHeight = 1280,
                            LayoutWidth = 768,
                            RulesetId = rulesetId,
                            IsDefaultLayout = true
                        });

                    var _RulesetDashboardPage = await _rulesetDashboardPageService.Create(new RulesetDashboardPage()
                    {
                        RulesetDashboardLayoutId = _layout.RulesetDashboardLayoutId,
                        Name = "Page1",
                        ContainerWidth = 1280,
                        ContainerHeight = 768,
                        SortOrder = 1,
                        RulesetId = rulesetId
                    });
                    _layout.DefaultPageId = _RulesetDashboardPage.RulesetDashboardPageId;
                    await _rulesetDashboardLayoutService.Update(_layout);

                    listLayout = await _rulesetDashboardLayoutService.GetByRulesetId(rulesetId, page, pageSize);
                }
            }
            catch { }

            return listLayout;
        }

        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] RulesetDashboardLayout model)
        {
            if (ModelState.IsValid)
            {
                if (_rulesetDashboardLayoutService.GetCountByRulesetId((int)model.RulesetId) >= 12)
                {
                    return BadRequest("Only 12 slots of Layouts are allowed.");
                }
                if (_rulesetDashboardLayoutService.CheckDuplicate(model.Name.Trim(), model.RulesetId).Result)
                    return BadRequest("Duplicate Layout Name");

                try
                {
                    int maxsortorder = _rulesetDashboardLayoutService.GetMaximumSortOrdertByRulesetId(model.RulesetId);
                    model.SortOrder = maxsortorder + 1;
                    var layout = await _rulesetDashboardLayoutService.Create(model);                    
                    var _RulesetDashboardPage = await _rulesetDashboardPageService.Create(new RulesetDashboardPage()
                    {
                        RulesetDashboardLayoutId = layout.RulesetDashboardLayoutId,
                        Name = "Page1",
                        ContainerWidth = model.LayoutHeight,
                        ContainerHeight = model.LayoutWidth,
                        BodyBgColor = "#FFFFFF",//set default while creating Ruleset
                        BodyTextColor = "#000000",
                        TitleBgColor = "#FFFFFF",
                        TitleTextColor = "#000000",
                        SortOrder = 1,
                        RulesetId = model.RulesetId
                    });
                    layout.DefaultPageId = _RulesetDashboardPage.RulesetDashboardPageId;
                    await _rulesetDashboardLayoutService.Update(layout);
                    _rulesetDashboardLayoutService.UpdateDefaultLayout(layout.RulesetDashboardLayoutId);
                    return Ok(layout);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("update")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Update([FromBody] RulesetDashboardLayout model)
        {
            if (ModelState.IsValid)
            {
                if (_rulesetDashboardLayoutService.CheckDuplicate(model.Name.Trim(), model.RulesetId,model.RulesetDashboardLayoutId).Result)
                    return BadRequest("Duplicate Layout Name");

                try
                {
                    await _rulesetDashboardLayoutService.Update(model);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpPost("duplicate")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Duplicate([FromBody] RulesetDashboardLayout model)
        {
            if (ModelState.IsValid)
            {
                model.IsDefaultComputer = false;
                model.IsDefaultTablet = false;
                model.IsDefaultMobile = false;
                if (_rulesetDashboardLayoutService.GetCountByRulesetId((int)model.RulesetId) >= 12)
                {
                    return BadRequest("Only 12 slots of Layouts are allowed.");
                }
                if (_rulesetDashboardLayoutService.CheckDuplicate(model.Name.Trim(), model.RulesetId).Result)
                    return BadRequest("Duplicate Layout Name");

                
                try
                {
                    int defaultPageId = 0;
                    var _RulesetDashboardPages = model.RulesetDashboardPages;

                    int maxsortorder = _rulesetDashboardLayoutService.GetMaximumSortOrdertByRulesetId(model.RulesetId);
                    model.SortOrder = maxsortorder + 1;
                    model.IsDefaultLayout = false;
                    model.DefaultPageId = null;
                    model.RulesetDashboardPages = null;

                    var layout = await _rulesetDashboardLayoutService.Create(model);
                    
                    foreach (var page in _RulesetDashboardPages)
                    {
                        page.Tiles = null;
                        int PageId = page.RulesetDashboardPageId;
                        page.RulesetId = layout.RulesetId;
                        page.RulesetDashboardLayoutId = layout.RulesetDashboardLayoutId;
                        page.RulesetDashboardPageId = 0;
                        var _RulesetDashboardPage = await _rulesetDashboardPageService.Create(page);
                        if (defaultPageId == 0)
                            defaultPageId = _RulesetDashboardPage.RulesetDashboardPageId;

                        var RulesetTiles = _tileService.GetByPageIdRulesetId(PageId, _RulesetDashboardPage.RulesetId ?? 0);
                        foreach (var _tile in RulesetTiles)
                        {
                            RulesetTile Tile = await _tileService.Create(new RulesetTile
                            {
                                RulesetId = _tile.RulesetId,
                                RulesetDashboardPageId = _RulesetDashboardPage.RulesetDashboardPageId,
                                Height = _tile.Height,
                                Width = _tile.Width,
                                IsDeleted = false,
                                LocationX = _tile.LocationX,
                                LocationY = _tile.LocationY,
                                Shape = _tile.Shape,
                                SortOrder = _tile.SortOrder,
                                TileTypeId = _tile.TileTypeId
                            });

                            switch (Tile.TileTypeId)
                            {
                                case (int)Enum.TILES.NOTE:
                                    var noteTile = _tile.NoteTiles; 
                                    Tile.NoteTiles = await _noteTileService.Create(new RulesetNoteTile
                                    {
                                        RulesetTileId = Tile.RulesetTileId,
                                        Title = noteTile.Title,
                                        Shape = noteTile.Shape,
                                        SortOrder = noteTile.SortOrder,
                                        Content = noteTile.Content,
                                        BodyBgColor = noteTile.BodyBgColor,
                                        BodyTextColor = noteTile.BodyTextColor,
                                        TitleBgColor = noteTile.TitleBgColor,
                                        TitleTextColor = noteTile.TitleTextColor,
                                        IsDeleted = false
                                    });
                                    //SaveColorsAsync(Tile);
                                    break;
                                case (int)Enum.TILES.IMAGE:
                                    var imageTile = _tile.ImageTiles;
                                    Tile.ImageTiles = await _imageTileService.Create(new RulesetImageTile {
                                        RulesetTileId = Tile.RulesetTileId,
                                        Title = imageTile.Title,
                                        Shape = imageTile.Shape,
                                        SortOrder = imageTile.SortOrder,
                                        BodyBgColor = imageTile.BodyBgColor,
                                        BodyTextColor = imageTile.BodyTextColor,
                                        TitleBgColor = imageTile.TitleBgColor,
                                        TitleTextColor = imageTile.TitleTextColor,
                                        IsDeleted = false,
                                        ImageUrl= imageTile.ImageUrl                                        
                                    });
                                    //SaveColorsAsync(Tile);
                                    break;
                                case (int)Enum.TILES.COUNTER:
                                    var counterTile = _tile.CounterTiles;
                                    Tile.CounterTiles = await _counterTileService.Create(new RulesetCounterTile {
                                        RulesetTileId = Tile.RulesetTileId,
                                        Title = counterTile.Title,
                                        Shape = counterTile.Shape,
                                        SortOrder = counterTile.SortOrder,
                                        BodyBgColor = counterTile.BodyBgColor,
                                        BodyTextColor = counterTile.BodyTextColor,
                                        TitleBgColor = counterTile.TitleBgColor,
                                        TitleTextColor = counterTile.TitleTextColor,
                                        CurrentValue = counterTile.CurrentValue,
                                        DefaultValue =counterTile.DefaultValue,
                                        Maximum = counterTile.Maximum,
                                        Minimum = counterTile.Minimum,
                                        Step = counterTile.Step,
                                        IsDeleted = false
                                    });
                                    //SaveColorsAsync(Tile);
                                    break;
                                case (int)Enum.TILES.CHARACTERSTAT:
                                    var characterStatTile = _tile.CharacterStatTiles;
                                    Tile.CharacterStatTiles = await _characterStatTileService.Create(new RulesetCharacterStatTile
                                    {
                                        RulesetTileId = Tile.RulesetTileId,
                                        CharacterStatId= characterStatTile.CharacterStatId,
                                        ShowTitle= characterStatTile.ShowTitle,
                                        Shape = characterStatTile.Shape,
                                        SortOrder = characterStatTile.SortOrder,
                                        bodyBgColor = characterStatTile.bodyBgColor,
                                        bodyTextColor = characterStatTile.bodyTextColor,
                                        titleBgColor = characterStatTile.titleBgColor,
                                        titleTextColor = characterStatTile.titleTextColor,
                                        IsDeleted = false,
                                        ImageUrl = characterStatTile.ImageUrl
                                    });
                                    //SaveColorsAsync(Tile);
                                    break;
                                case (int)Enum.TILES.LINK:
                                    break;
                                case (int)Enum.TILES.EXECUTE:
                                    break;
                                case (int)Enum.TILES.COMMAND:
                                    var commandTile = _tile.CommandTiles;
                                    Tile.CommandTiles = await _commandTileService.Create(new RulesetCommandTile {
                                        RulesetTileId = Tile.RulesetTileId,
                                        Title = commandTile.Title,
                                        Shape = commandTile.Shape,
                                        SortOrder = commandTile.SortOrder,
                                        ImageUrl = commandTile.ImageUrl,
                                        BodyBgColor = commandTile.BodyBgColor,
                                        BodyTextColor = commandTile.BodyTextColor,
                                        TitleBgColor = commandTile.TitleBgColor,
                                        TitleTextColor = commandTile.TitleTextColor,
                                        IsDeleted = false,
                                        Command = commandTile.Command,
                                    });
                                    //SaveColorsAsync(Tile);
                                    break;
                                case (int)Enum.TILES.TEXT:
                                    var textTile = _tile.TextTiles;
                                    Tile.TextTiles = await _textTileService.Create(new RulesetTextTile
                                    {
                                        RulesetTileId = Tile.RulesetTileId,
                                        Title = textTile.Title,
                                        Shape = textTile.Shape,
                                        SortOrder = textTile.SortOrder,
                                        BodyBgColor = textTile.BodyBgColor,
                                        BodyTextColor = textTile.BodyTextColor,
                                        TitleBgColor = textTile.TitleBgColor,
                                        TitleTextColor = textTile.TitleTextColor,
                                        IsDeleted = false,
                                        Text = textTile.Text
                                    });
                                    //SaveColorsAsync(Tile);
                                    break;
                                default:
                                    break;
                            }

                            await _tileConfigService.CreateAsync(new RulesetTileConfig
                            {
                                RulesetTileId = Tile.RulesetTileId,
                                Col = _tile.Config.Col,
                                Row = _tile.Config.Row,
                                SizeX = _tile.Config.SizeX,
                                SizeY = _tile.Config.SizeY,
                                SortOrder = _tile.Config.SortOrder,
                                UniqueId = _tile.Config.UniqueId,
                                Payload = _tile.Config.Payload,
                                IsDeleted = false
                            });
                            //await _colorService.Create(Tile.tileColor);
                        }
                    }
                    if (defaultPageId > 0)
                    {
                        layout.DefaultPageId = defaultPageId;
                        await _rulesetDashboardLayoutService.Update(layout);
                    }
                    _rulesetDashboardLayoutService.UpdateDefaultLayout(layout.RulesetDashboardLayoutId);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        
        [HttpPost("updateSortOrder")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> UpdateSortOrder([FromBody] List<SortOrderEditModel> model)
        {
            if (ModelState.IsValid)
            {
              
                try
                {
                     _rulesetDashboardLayoutService.UpdateSortOrder(model);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }
        
        [HttpGet("GetById")]
        public RulesetDashboardLayout GetById(int Id)
        {
            return _rulesetDashboardLayoutService.GetById(Id);
        }

        [HttpGet("GetCountByRulesetId")]
        public async Task<IActionResult> GetCountByRulesetId(int rulesetId)
        {
            var _items = _rulesetDashboardLayoutService.GetCountByRulesetId(rulesetId);

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id==0)
                return BadRequest("Please provide valid id");

            try
            {
                var layout = _rulesetDashboardLayoutService.GetById(id);
                var _layouts = _rulesetDashboardLayoutService.GetCountByRulesetId(layout.RulesetId ?? 0);
                
                if (_layouts > 1)
                {
                    await _rulesetDashboardLayoutService.Delete(id);
                    return Ok();
                }
                return BadRequest("You cannot delete the Default layout of a Ruleset.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpPost("UpdateDefaultLayout")]
        public async Task<IActionResult> UpdateDefaultLayout(int layoutId)
        {
            _rulesetDashboardLayoutService.UpdateDefaultLayout(layoutId);
            return Ok();
        }

        [HttpPost("UpdateDefaultLayoutPage")]
        public async Task<IActionResult> UpdateDefaultLayoutPage(int layoutId, int pageId)
        {
            _rulesetDashboardLayoutService.UpdateDefaultLayoutPage(layoutId, pageId);
            return Ok();
        }

        #region Shared Layout
        [HttpGet("getSharedLayoutByRulesetId")]
        public async Task<IEnumerable<RulesetDashboardLayout>> GetSharedLayoutByRulesetId(int rulesetId, int page = -1, int pageSize = -1)
        {
            var listLayout = await _rulesetDashboardLayoutService.GetSharedLayoutByRulesetId(rulesetId, page, pageSize);

            bool noDefaultLayout = false;

            if (listLayout == null) noDefaultLayout = true;
            else if (listLayout.Count == 0) noDefaultLayout = true;

            try
            {
                if (noDefaultLayout)
                {
                    //in case dashboard has no layout & page create shared layout
                    var _layout = await _rulesetDashboardLayoutService.Create(
                        new RulesetDashboardLayout()
                        {
                            Name = Const.SharedLayoutName,
                            SortOrder = 1,
                            LayoutHeight = 1280,
                            LayoutWidth = 768,
                            RulesetId = rulesetId,
                            IsSharedLayout = true,IsDefaultLayout=true
                        });

                    var _RulesetDashboardPage = await _rulesetDashboardPageService.Create(new RulesetDashboardPage()
                    {
                        RulesetDashboardLayoutId = _layout.RulesetDashboardLayoutId,
                        Name = "Page1",
                        ContainerWidth = 1280,
                        ContainerHeight = 768,
                        SortOrder = 1,
                        RulesetId = rulesetId
                    });
                    _layout.DefaultPageId = _RulesetDashboardPage.RulesetDashboardPageId;
                    await _rulesetDashboardLayoutService.Update(_layout);

                    listLayout = await _rulesetDashboardLayoutService.GetSharedLayoutByRulesetId(rulesetId, page, pageSize);
                }
            }
            catch { }

            return listLayout;
        }
        #endregion
    }
}