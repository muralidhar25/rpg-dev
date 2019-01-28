﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Services.RulesetTileServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels.EditModels;
using Enum = RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class RulesetDashboardPageController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRulesetDashboardPageService _rulesetDashboardPageService;
        private readonly IRulesetTileService _tileService;
        private readonly IRulesetCharacterStatTileService _characterStatTileService;
        private readonly IRulesetCommandTileService _commandTileService;
        private readonly IRulesetCounterTileService _counterTileService;
        private readonly IRulesetImageTileService _imageTileService;
        private readonly IRulesetNoteTileService _noteTileService;
        private readonly IRulesetTileConfigService _tileConfigService;
        private readonly IRulesetDashboardLayoutService _rulesetDashboardLayoutService;

        public RulesetDashboardPageController(IHttpContextAccessor httpContextAccessor,
            IRulesetDashboardLayoutService rulesetDashboardLayoutService,
            IRulesetDashboardPageService rulesetDashboardPageService,
            IRulesetTileService rulesetTileService,
            IRulesetCharacterStatTileService characterStatTileService,
            IRulesetCommandTileService commandTileService,
            IRulesetCounterTileService counterTileService,
            IRulesetImageTileService imageTileService,
            IRulesetNoteTileService noteTileService,
            IRulesetTileConfigService tileConfigService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._rulesetDashboardPageService = rulesetDashboardPageService;
            this._tileService = rulesetTileService;
            this._characterStatTileService = characterStatTileService;
            this._commandTileService = commandTileService;
            this._counterTileService = counterTileService;
            this._imageTileService = imageTileService;
            this._noteTileService = noteTileService;
            this._tileConfigService = tileConfigService;
            this._rulesetDashboardLayoutService = rulesetDashboardLayoutService;
        }

        [HttpGet("GetById")]
        public RulesetDashboardPage GetById(int Id)
        {
            return _rulesetDashboardPageService.GetById(Id);
        }


        [HttpGet("getByRulesetId")]
        public IEnumerable<RulesetDashboardPage> GetByRulesetId(int RulesetId)
        {
            return _rulesetDashboardPageService.GetByRulesetId(RulesetId);
        }

        [HttpGet("getByLayoutId")]
        public IEnumerable<RulesetDashboardPage> GetByLayoutId(int layoutId)
        {
            return _rulesetDashboardPageService.GetByLayoutId(layoutId,-1,-1);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] RulesetDashboardPage model)
        {
            if (ModelState.IsValid)
            {
                if (_rulesetDashboardPageService.GetCountByLayoutId((int)model.RulesetDashboardLayoutId) >= 12)
                {
                    return BadRequest("Only 12 slots of Pages are allowed.");
                }
                if (_rulesetDashboardPageService.CheckDuplicate(model.Name.Trim(), model.RulesetId,model.RulesetDashboardLayoutId).Result)
                    return BadRequest("Duplicate Page Name");
                
                try
                {
                    int maxsortorder = _rulesetDashboardPageService.GetMaximumSortOrdertByLayoutId(model.RulesetDashboardLayoutId);
                    model.SortOrder = maxsortorder + 1;
                    await _rulesetDashboardPageService.Create(model);
                    _rulesetDashboardLayoutService.UpdateDefaultLayoutPage((int)model.RulesetDashboardLayoutId, model.RulesetDashboardPageId);
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
        public async Task<IActionResult> Update([FromBody] RulesetDashboardPage model)
        {
            if (ModelState.IsValid)
            {
                if (_rulesetDashboardPageService.CheckDuplicate(model.Name.Trim(), model.RulesetId, model.RulesetDashboardLayoutId,model.RulesetDashboardPageId).Result)
                    return BadRequest("Duplicate Page Name");

                try
                {
                    await _rulesetDashboardPageService.Update(model);
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
        public async Task<IActionResult> Duplicate([FromBody] RulesetDashboardPage model)
        {
            if (ModelState.IsValid)
            {
                if (_rulesetDashboardPageService.GetCountByLayoutId((int)model.RulesetDashboardLayoutId) >= 12)
                {
                    return BadRequest("Only 12 slots of Pages are allowed.");
                }
                if (_rulesetDashboardPageService.CheckDuplicate(model.Name.Trim(), model.RulesetId, model.RulesetDashboardLayoutId).Result)
                    return BadRequest("Duplicate Page Name");

                
                try
                {
                    model.Tiles = null;
                    int PageId = model.RulesetDashboardPageId;
                    model.RulesetDashboardPageId = 0;
                    var _RulesetDashboardPage = Mapper.Map<RulesetDashboardPage>(model);
                    int maxsortorder = _rulesetDashboardPageService.GetMaximumSortOrdertByLayoutId(model.RulesetDashboardLayoutId);
                    _RulesetDashboardPage.SortOrder = maxsortorder + 1;

                    _RulesetDashboardPage = await _rulesetDashboardPageService.Create(_RulesetDashboardPage);

                    _rulesetDashboardLayoutService.UpdateDefaultLayoutPage((int)_RulesetDashboardPage.RulesetDashboardLayoutId, _RulesetDashboardPage.RulesetDashboardPageId);
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
                                Tile.ImageTiles = await _imageTileService.Create(new RulesetImageTile
                                {
                                    RulesetTileId = Tile.RulesetTileId,
                                    Title = imageTile.Title,
                                    Shape = imageTile.Shape,
                                    SortOrder = imageTile.SortOrder,
                                    BodyBgColor = imageTile.BodyBgColor,
                                    BodyTextColor = imageTile.BodyTextColor,
                                    TitleBgColor = imageTile.TitleBgColor,
                                    TitleTextColor = imageTile.TitleTextColor,
                                    IsDeleted = false,
                                    ImageUrl = imageTile.ImageUrl
                                });
                                //SaveColorsAsync(Tile);
                                break;
                            case (int)Enum.TILES.COUNTER:
                                var counterTile = _tile.CounterTiles;
                                Tile.CounterTiles = await _counterTileService.Create(new RulesetCounterTile
                                {
                                    RulesetTileId = Tile.RulesetTileId,
                                    Title = counterTile.Title,
                                    Shape = counterTile.Shape,
                                    SortOrder = counterTile.SortOrder,
                                    BodyBgColor = counterTile.BodyBgColor,
                                    BodyTextColor = counterTile.BodyTextColor,
                                    TitleBgColor = counterTile.TitleBgColor,
                                    TitleTextColor = counterTile.TitleTextColor,
                                    CurrentValue = counterTile.CurrentValue,
                                    DefaultValue = counterTile.DefaultValue,
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
                                    CharacterStatId =characterStatTile.CharacterStatId,
                                    ShowTitle = characterStatTile.ShowTitle,
                                    Shape = characterStatTile.Shape,
                                    SortOrder = characterStatTile.SortOrder,
                                    bodyBgColor = characterStatTile.bodyBgColor,
                                    bodyTextColor = characterStatTile.bodyTextColor,
                                    titleBgColor = characterStatTile.titleBgColor,
                                    titleTextColor = characterStatTile.titleTextColor,
                                    IsDeleted = false
                                });
                                //SaveColorsAsync(Tile);
                                break;
                            case (int)Enum.TILES.LINK:
                                break;
                            case (int)Enum.TILES.EXECUTE:
                                break;
                            case (int)Enum.TILES.COMMAND:
                                var commandTile = _tile.CommandTiles;
                                Tile.CommandTiles = await _commandTileService.Create(new RulesetCommandTile
                                {
                                    RulesetTileId = Tile.RulesetTileId,
                                    Title = commandTile.Title,
                                    Shape = commandTile.Shape,
                                    SortOrder = commandTile.SortOrder,
                                    ImageUrl = commandTile.ImageUrl,
                                    BodyBgColor = commandTile.BodyBgColor,
                                    BodyTextColor = commandTile.BodyTextColor,
                                    TitleBgColor = commandTile.TitleBgColor,
                                    TitleTextColor = commandTile.TitleTextColor,
                                    IsDeleted = false
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
                    _rulesetDashboardPageService.UpdateSortOrder(model);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpGet("GetCountByRulesetId")]
        public async Task<IActionResult> GetCountByRulesetId(int RulesetId)
        {
            var _items = _rulesetDashboardPageService.GetCountByRulesetId(RulesetId);

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }

        [HttpGet("GetCountByLayoutId")]
        public async Task<IActionResult> GetCountByLayoutId(int layoutId)
        {
            var _items = _rulesetDashboardPageService.GetCountByLayoutId(layoutId);

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id == 0)
                return BadRequest("Please provide valid id");
            try
            {
                var page =  _rulesetDashboardPageService.GetById(id);
                var _pages = _rulesetDashboardPageService.GetCountByLayoutId(page.RulesetDashboardLayoutId ?? 0);

                if (_pages > 1)
                {
                    await _rulesetDashboardPageService.Delete(id);
                    return Ok();
                }
                return BadRequest("You cannot delete the Default page of the layout.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

    }
}