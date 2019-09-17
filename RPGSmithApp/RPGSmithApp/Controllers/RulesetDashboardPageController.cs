using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Core.Interfaces;
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
        private readonly IRulesetTextTileService _textTileService;
        private readonly IRulesetCounterTileService _counterTileService;
        private readonly IRulesetImageTileService _imageTileService;
        private readonly IRulesetNoteTileService _noteTileService;
        private readonly IRulesetTileConfigService _tileConfigService;
        private readonly IRulesetDashboardLayoutService _rulesetDashboardLayoutService;
        private readonly IRulesetToggleTileService _toggleTileService;
        private readonly IRulesetCharacterStatClusterTileService _clusterTileService;
        private readonly IAccountManager _accountManager;

        public RulesetDashboardPageController(IHttpContextAccessor httpContextAccessor,
            IRulesetDashboardLayoutService rulesetDashboardLayoutService,
            IRulesetDashboardPageService rulesetDashboardPageService,
            IRulesetTileService rulesetTileService,
            IRulesetCharacterStatTileService characterStatTileService,
            IRulesetCommandTileService commandTileService,
            IRulesetCounterTileService counterTileService,
            IRulesetImageTileService imageTileService,
            IRulesetNoteTileService noteTileService,
            IRulesetTileConfigService tileConfigService,
            IRulesetTextTileService textTileService,
            IRulesetToggleTileService toggleTileService,
            IRulesetCharacterStatClusterTileService clusterTileService, IAccountManager accountManager)
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
            this._textTileService = textTileService;
            this._toggleTileService = toggleTileService;
            this._clusterTileService= clusterTileService;
            this._accountManager = accountManager;
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

                    ////New With SP work start////////////
                    model.RulesetDashboardPageId = PageId;
                    _rulesetDashboardPageService.Create_sp(_RulesetDashboardPage, GetUserId());
                    ////New With SP work end////////////
                    ////////Old Without SP work start////////////
                    //_RulesetDashboardPage = await _rulesetDashboardPageService.Create(_RulesetDashboardPage);

                    ////_rulesetDashboardLayoutService.UpdateDefaultLayoutPage((int)_RulesetDashboardPage.RulesetDashboardLayoutId, _RulesetDashboardPage.RulesetDashboardPageId);
                    //var RulesetTiles = _tileService.GetByPageIdRulesetId(PageId, _RulesetDashboardPage.RulesetId ?? 0);
                    //foreach (var _tile in RulesetTiles)
                    //{
                    //    RulesetTile Tile = await _tileService.Create(new RulesetTile
                    //    {
                    //        RulesetId = _tile.RulesetId,
                    //        RulesetDashboardPageId = _RulesetDashboardPage.RulesetDashboardPageId,
                    //        Height = _tile.Height,
                    //        Width = _tile.Width,
                    //        IsDeleted = false,
                    //        LocationX = _tile.LocationX,
                    //        LocationY = _tile.LocationY,
                    //        Shape = _tile.Shape,
                    //        SortOrder = _tile.SortOrder,
                    //        TileTypeId = _tile.TileTypeId
                    //    });

                    //    switch (Tile.TileTypeId)
                    //    {
                    //        case (int)Enum.TILES.NOTE:
                    //            var noteTile = _tile.NoteTiles;
                    //            Tile.NoteTiles = await _noteTileService.Create(new RulesetNoteTile
                    //            {
                    //                RulesetTileId = Tile.RulesetTileId,
                    //                Title = noteTile.Title,
                    //                Shape = noteTile.Shape,
                    //                SortOrder = noteTile.SortOrder,
                    //                Content = noteTile.Content,
                    //                BodyBgColor = noteTile.BodyBgColor,
                    //                BodyTextColor = noteTile.BodyTextColor,
                    //                TitleBgColor = noteTile.TitleBgColor,
                    //                TitleTextColor = noteTile.TitleTextColor,
                    //                IsDeleted = false
                    //            });
                    //            //SaveColorsAsync(Tile);
                    //            break;
                    //        case (int)Enum.TILES.IMAGE:
                    //            var imageTile = _tile.ImageTiles;
                    //            Tile.ImageTiles = await _imageTileService.Create(new RulesetImageTile
                    //            {
                    //                RulesetTileId = Tile.RulesetTileId,
                    //                Title = imageTile.Title,
                    //                Shape = imageTile.Shape,
                    //                SortOrder = imageTile.SortOrder,
                    //                BodyBgColor = imageTile.BodyBgColor,
                    //                BodyTextColor = imageTile.BodyTextColor,
                    //                TitleBgColor = imageTile.TitleBgColor,
                    //                TitleTextColor = imageTile.TitleTextColor,
                    //                IsDeleted = false,
                    //                ImageUrl = imageTile.ImageUrl
                    //            });
                    //            //SaveColorsAsync(Tile);
                    //            break;
                    //        case (int)Enum.TILES.COUNTER:
                    //            var counterTile = _tile.CounterTiles;
                    //            Tile.CounterTiles = await _counterTileService.Create(new RulesetCounterTile
                    //            {
                    //                RulesetTileId = Tile.RulesetTileId,
                    //                Title = counterTile.Title,
                    //                Shape = counterTile.Shape,
                    //                SortOrder = counterTile.SortOrder,
                    //                BodyBgColor = counterTile.BodyBgColor,
                    //                BodyTextColor = counterTile.BodyTextColor,
                    //                TitleBgColor = counterTile.TitleBgColor,
                    //                TitleTextColor = counterTile.TitleTextColor,
                    //                CurrentValue = counterTile.CurrentValue,
                    //                DefaultValue = counterTile.DefaultValue,
                    //                Maximum = counterTile.Maximum,
                    //                Minimum = counterTile.Minimum,
                    //                Step = counterTile.Step,
                    //                IsDeleted = false
                    //            });
                    //            //SaveColorsAsync(Tile);
                    //            break;
                    //        case (int)Enum.TILES.CHARACTERSTAT:
                    //            var characterStatTile = _tile.CharacterStatTiles;
                    //            Tile.CharacterStatTiles = await _characterStatTileService.Create(new RulesetCharacterStatTile
                    //            {
                    //                RulesetTileId = Tile.RulesetTileId,
                    //                CharacterStatId = characterStatTile.CharacterStatId,
                    //                ShowTitle = characterStatTile.ShowTitle,
                    //                Shape = characterStatTile.Shape,
                    //                SortOrder = characterStatTile.SortOrder,
                    //                bodyBgColor = characterStatTile.bodyBgColor,
                    //                bodyTextColor = characterStatTile.bodyTextColor,
                    //                titleBgColor = characterStatTile.titleBgColor,
                    //                titleTextColor = characterStatTile.titleTextColor,
                    //                IsDeleted = false,
                    //                ImageUrl = characterStatTile.ImageUrl
                    //            });
                    //            //SaveColorsAsync(Tile);
                    //            break;
                    //        case (int)Enum.TILES.LINK:
                    //            break;
                    //        case (int)Enum.TILES.EXECUTE:
                    //            break;
                    //        case (int)Enum.TILES.COMMAND:
                    //            var commandTile = _tile.CommandTiles;
                    //            Tile.CommandTiles = await _commandTileService.Create(new RulesetCommandTile
                    //            {
                    //                RulesetTileId = Tile.RulesetTileId,
                    //                Title = commandTile.Title,
                    //                Shape = commandTile.Shape,
                    //                SortOrder = commandTile.SortOrder,
                    //                ImageUrl = commandTile.ImageUrl,
                    //                BodyBgColor = commandTile.BodyBgColor,
                    //                BodyTextColor = commandTile.BodyTextColor,
                    //                TitleBgColor = commandTile.TitleBgColor,
                    //                TitleTextColor = commandTile.TitleTextColor,
                    //                IsDeleted = false,
                    //                Command = commandTile.Command,
                    //            });
                    //            //SaveColorsAsync(Tile);
                    //            break;
                    //        case (int)Enum.TILES.TEXT:
                    //            var textTile = _tile.TextTiles;
                    //            Tile.TextTiles = await _textTileService.Create(new RulesetTextTile
                    //            {
                    //                RulesetTileId = Tile.RulesetTileId,
                    //                Title = textTile.Title,
                    //                Shape = textTile.Shape,
                    //                SortOrder = textTile.SortOrder,
                    //                BodyBgColor = textTile.BodyBgColor,
                    //                BodyTextColor = textTile.BodyTextColor,
                    //                TitleBgColor = textTile.TitleBgColor,
                    //                TitleTextColor = textTile.TitleTextColor,
                    //                IsDeleted = false,
                    //                Text = textTile.Text
                    //            });
                    //            //SaveColorsAsync(Tile);
                    //            break;
                    //        case (int)Enum.TILES.Toggle:
                    //            var toggleTile = _tile.ToggleTiles;
                    //            var tog = toggleTile.TileToggle;

                    //            var customTogglesList = new List<TileCustomToggle>();
                    //            if (tog.TileCustomToggles != null)
                    //            {
                    //                foreach (var item in tog.TileCustomToggles)
                    //                {
                    //                    customTogglesList.Add(new TileCustomToggle()
                    //                    {
                    //                        Image = item.Image,
                    //                        IsDeleted = item.IsDeleted,
                    //                        ToggleText = item.ToggleText,
                    //                    });
                    //                }
                    //            }

                    //            var togToAdd = new TileToggle()
                    //            {
                    //                Display = tog.Display,
                    //                IsCustom = tog.IsCustom,
                    //                OnOff = tog.OnOff,
                    //                IsDeleted = tog.IsDeleted,
                    //                ShowCheckbox = tog.ShowCheckbox,
                    //                YesNo = tog.YesNo,
                    //                TileCustomToggles = customTogglesList,
                    //            };
                    //            var toggleTileToCreate = new RulesetToggleTile
                    //            {
                    //                RulesetTileId = Tile.RulesetTileId,
                    //                Title = toggleTile.Title,
                    //                Shape = toggleTile.Shape,
                    //                SortOrder = toggleTile.SortOrder,
                    //                BodyBgColor = toggleTile.BodyBgColor,
                    //                BodyTextColor = toggleTile.BodyTextColor,
                    //                TitleBgColor = toggleTile.TitleBgColor,
                    //                TitleTextColor = toggleTile.TitleTextColor,
                    //                IsDeleted = false,
                    //                CheckBox = toggleTile.CheckBox,
                    //                CustomValue = toggleTile.CustomValue,
                    //                OnOff = toggleTile.OnOff,
                    //                YesNo = toggleTile.YesNo,
                    //                TileToggle = togToAdd,

                    //            };
                    //            Tile.ToggleTiles = await _toggleTileService.Create(toggleTileToCreate);
                    //            //SaveColorsAsync(Tile);
                    //            break;
                    //        case (int)Enum.TILES.CHARACTERSTATCLUSTER:
                    //            var clusterTile = _tile.CharacterStatClusterTiles;
                    //            Tile.CharacterStatClusterTiles = await _clusterTileService.Create(new RulesetCharacterStatClusterTile
                    //            {
                    //                RulesetTileId = Tile.RulesetTileId,
                    //                Title = clusterTile.Title,
                    //                Shape = clusterTile.Shape,
                    //                SortOrder = clusterTile.SortOrder,
                    //                BodyBgColor = clusterTile.BodyBgColor,
                    //                BodyTextColor = clusterTile.BodyTextColor,
                    //                TitleBgColor = clusterTile.TitleBgColor,
                    //                TitleTextColor = clusterTile.TitleTextColor,
                    //                IsDeleted = false,
                    //                DisplayCharactersCharacterStatID = clusterTile.DisplayCharactersCharacterStatID,
                    //                ClusterWithSortOrder = clusterTile.ClusterWithSortOrder,
                    //            });
                    //            //SaveColorsAsync(Tile);
                    //            break;
                    //        default:
                    //            break;
                    //    }

                    //    await _tileConfigService.CreateAsync(new RulesetTileConfig
                    //    {
                    //        RulesetTileId = Tile.RulesetTileId,
                    //        Col = _tile.Config.Col,
                    //        Row = _tile.Config.Row,
                    //        SizeX = _tile.Config.SizeX,
                    //        SizeY = _tile.Config.SizeY,
                    //        SortOrder = _tile.Config.SortOrder,
                    //        UniqueId = _tile.Config.UniqueId,
                    //        Payload = _tile.Config.Payload,
                    //        IsDeleted = false
                    //    });
                    //    //await _colorService.Create(Tile.tileColor);
                    //}
                    ////////Old Without SP work end////////////

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
        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
            //return "ec34768b-c2ff-43b2-9bf3-d0946d416482";
        }
    }
}