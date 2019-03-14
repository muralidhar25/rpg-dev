using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL.Models;
using DAL.Models.CharacterTileModels;
//using DAL.Services;
using DAL.Services.CharacterTileServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels.EditModels;
using Enum = RPGSmithApp.Helpers.Enum;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class CharacterDashboardPageController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly DAL.Services.ICharacterDashboardPageService _characterDashboardPageService;
        private readonly DAL.Services.ICharacterDashboardLayoutService _characterDashboardLayoutService;
        private readonly ICharacterTileService _tileService;
        private readonly ICharacterStatTileService _characterStatTileService;
        private readonly ICommandTileService _commandTileService;
        private readonly ITextTileService _textTileService;
        private readonly ICounterTileService _counterTileService;
        private readonly IExecuteTileService _executeTileService;
        private readonly IImageTileService _imageTileService;
        private readonly ILinkTileService _linkTileService;
        private readonly INoteTileService _noteTileService;
        private readonly ITileConfigService _tileConfigService;

        public CharacterDashboardPageController(IHttpContextAccessor httpContextAccessor,
            DAL.Services.ICharacterDashboardPageService characterDashboardPageService,
            DAL.Services.ICharacterDashboardLayoutService characterDashboardLayoutService,
            ICharacterTileService characterTileService,
            ICharacterStatTileService characterStatTileService,
            ICommandTileService commandTileService,
            ICounterTileService counterTileService,
            IExecuteTileService executeTileService,
            IImageTileService imageTileService,
            ILinkTileService linkTileService,
            INoteTileService noteTileService,
            ITileConfigService tileConfigService,
            ITextTileService textTileService)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._characterDashboardPageService = characterDashboardPageService;
            this._characterDashboardLayoutService = characterDashboardLayoutService;
            this._tileService = characterTileService;
            this._characterStatTileService = characterStatTileService;
            this._commandTileService = commandTileService;
            this._counterTileService = counterTileService;
            this._executeTileService = executeTileService;
            this._imageTileService = imageTileService;
            this._linkTileService = linkTileService;
            this._noteTileService = noteTileService;
            this._tileConfigService = tileConfigService;
            this._textTileService = textTileService;
        }

        [HttpGet("GetById")]
        public CharacterDashboardPage GetById(int Id)
        {
            return _characterDashboardPageService.GetById(Id);
        }


        [HttpGet("getByCharacterId")]
        public IEnumerable<CharacterDashboardPage> GetByCharacterId(int characterId)
        {
            return _characterDashboardPageService.GetByCharacterId(characterId);
        }

        [HttpGet("getByLayoutId")]
        public IEnumerable<CharacterDashboardPage> GetByLayoutId(int layoutId)
        {
            return _characterDashboardPageService.GetByLayoutId(layoutId,-1,-1);
        }

        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] CharacterDashboardPage model)
        {
            if (ModelState.IsValid)
            {
                if (_characterDashboardPageService.GetCountByLayoutId((int)model.CharacterDashboardLayoutId)>=12)
                {
                    return BadRequest("Only 12 slots of Pages are allowed.");
                }
                if (_characterDashboardPageService.CheckDuplicate(model.Name.Trim(), model.CharacterId,model.CharacterDashboardLayoutId).Result)
                    return BadRequest("Duplicate Page Name");
                
                try
                {
                    int maxsortorder = _characterDashboardPageService.GetMaximumSortOrdertByLayoutId(model.CharacterDashboardLayoutId);
                    model.SortOrder = maxsortorder + 1;
                    await _characterDashboardPageService.Create(model);
                    _characterDashboardLayoutService.UpdateDefaultLayoutPage((int)model.CharacterDashboardLayoutId, model.CharacterDashboardPageId);
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
        public async Task<IActionResult> Update([FromBody] CharacterDashboardPage model)
        {
            if (ModelState.IsValid)
            {
                if (_characterDashboardPageService.CheckDuplicate(model.Name.Trim(), model.CharacterId, model.CharacterDashboardLayoutId,model.CharacterDashboardPageId).Result)
                    return BadRequest("Duplicate Page Name");

                try
                {
                    await _characterDashboardPageService.Update(model);
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
        public async Task<IActionResult> Duplicate([FromBody] CharacterDashboardPage model)
        {
            if (ModelState.IsValid)
            {
                if (_characterDashboardPageService.GetCountByLayoutId((int)model.CharacterDashboardLayoutId) >= 12)
                {
                    return BadRequest("Only 12 slots of Pages are allowed.");
                }
                if (_characterDashboardPageService.CheckDuplicate(model.Name.Trim(), model.CharacterId, model.CharacterDashboardLayoutId).Result)
                    return BadRequest("Duplicate Page Name");

                try
                {
                    model.Tiles = null;
                    int PageId = model.CharacterDashboardPageId;
                    model.CharacterDashboardPageId = 0;
                    var _characterDashboardPage = Mapper.Map<CharacterDashboardPage>(model);
                    int maxsortorder = _characterDashboardPageService.GetMaximumSortOrdertByLayoutId(model.CharacterDashboardLayoutId);
                    _characterDashboardPage.SortOrder = maxsortorder + 1;
                    
                    _characterDashboardPage = await _characterDashboardPageService.Create(_characterDashboardPage);

                    var characterTiles = _tileService.GetByPageIdCharacterId(PageId, _characterDashboardPage.CharacterId ?? 0);
                    foreach (var _tile in characterTiles)
                    {
                        CharacterTile Tile = await _tileService.Create(new CharacterTile
                        {
                            CharacterId = _tile.CharacterId,
                            CharacterDashboardPageId = _characterDashboardPage.CharacterDashboardPageId,
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
                                Tile.NoteTiles = await _noteTileService.Create(new CharacterNoteTile
                                {
                                    CharacterTileId = Tile.CharacterTileId,
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
                                Tile.ImageTiles = await _imageTileService.Create(new CharacterImageTile
                                {
                                    CharacterTileId = Tile.CharacterTileId,
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
                                Tile.CounterTiles = await _counterTileService.Create(new CharacterCounterTile
                                {
                                    CharacterTileId = Tile.CharacterTileId,
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
                                Tile.CharacterStatTiles = await _characterStatTileService.Create(new CharacterCharacterStatTile
                                {
                                    CharacterTileId = Tile.CharacterTileId,
                                    CharactersCharacterStatId = characterStatTile.CharactersCharacterStatId,
                                    ShowTitle = characterStatTile.ShowTitle,
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
                                var linkTile = _tile.LinkTiles;
                                Tile.LinkTiles = await _linkTileService.Create(new CharacterLinkTile
                                {
                                    CharacterTileId = Tile.CharacterTileId,
                                    AbilityId = linkTile.LinkType.ToLower() == Enum.LinkType.ability.ToString()
                                            ? linkTile.AbilityId : null,
                                    SpellId = linkTile.LinkType.ToLower() == Enum.LinkType.spell.ToString()
                                            ? linkTile.SpellId : null,
                                    ItemId = linkTile.LinkType.ToLower() == Enum.LinkType.item.ToString()
                                            ? linkTile.ItemId : null,
                                    LinkType = linkTile.LinkType,
                                    ShowTitle = linkTile.ShowTitle,
                                    Shape = linkTile.Shape,
                                    SortOrder = linkTile.SortOrder,
                                    BodyBgColor = linkTile.BodyBgColor,
                                    BodyTextColor = linkTile.BodyTextColor,
                                    TitleBgColor = linkTile.TitleBgColor,
                                    TitleTextColor = linkTile.TitleTextColor,
                                    IsDeleted = false
                                });
                                //SaveColorsAsync(Tile);
                                break;
                            case (int)Enum.TILES.EXECUTE:
                                var executeTile = _tile.ExecuteTiles;
                                Tile.ExecuteTiles = await _executeTileService.Create(new CharacterExecuteTile
                                {
                                    CharacterTileId = Tile.CharacterTileId,
                                    AbilityId = executeTile.LinkType.ToLower() == Enum.LinkType.ability.ToString()
                                            ? executeTile.AbilityId : null,
                                    SpellId = executeTile.LinkType.ToLower() == Enum.LinkType.spell.ToString()
                                            ? executeTile.SpellId : null,
                                    ItemId = executeTile.LinkType.ToLower() == Enum.LinkType.item.ToString()
                                            ? executeTile.ItemId : null,
                                    LinkType = executeTile.LinkType,
                                    ShowTitle = executeTile.ShowTitle,
                                    Shape = executeTile.Shape,
                                    SortOrder = executeTile.SortOrder,
                                    BodyBgColor = executeTile.BodyBgColor,
                                    BodyTextColor = executeTile.BodyTextColor,
                                    TitleBgColor = executeTile.TitleBgColor,
                                    TitleTextColor = executeTile.TitleTextColor,
                                    CommandId = executeTile.CommandId,
                                    IsDeleted = false
                                });
                                //SaveColorsAsync(Tile);
                                break;
                            case (int)Enum.TILES.COMMAND:
                                var commandTile = _tile.CommandTiles;
                                Tile.CommandTiles = await _commandTileService.Create(new CharacterCommandTile
                                {
                                    CharacterTileId = Tile.CharacterTileId,
                                    Title = commandTile.Title,
                                    Shape = commandTile.Shape,
                                    SortOrder = commandTile.SortOrder,
                                    ImageUrl = commandTile.ImageUrl,
                                    BodyBgColor = commandTile.BodyBgColor,
                                    BodyTextColor = commandTile.BodyTextColor,
                                    TitleBgColor = commandTile.TitleBgColor,
                                    TitleTextColor = commandTile.TitleTextColor,
                                    Command=commandTile.Command,
                                    IsDeleted = false
                                });
                                //SaveColorsAsync(Tile);
                                break;
                            case (int)Enum.TILES.TEXT:
                                var textTile = _tile.TextTiles;
                                Tile.TextTiles = await _textTileService.Create(new CharacterTextTile
                                {
                                    CharacterTileId = Tile.CharacterTileId,
                                    Title = textTile.Title,
                                    Shape = textTile.Shape,
                                    SortOrder = textTile.SortOrder,
                                    BodyBgColor = textTile.BodyBgColor,
                                    BodyTextColor = textTile.BodyTextColor,
                                    TitleBgColor = textTile.TitleBgColor,
                                    TitleTextColor = textTile.TitleTextColor,
                                    IsDeleted = false,
                                    Text = textTile.Text,                                    
                                });
                                //SaveColorsAsync(Tile);
                                break;
                            default:
                                break;
                        }

                        await _tileConfigService.CreateAsync(new TileConfig
                        {
                            CharacterTileId = Tile.CharacterTileId,
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
                    _characterDashboardLayoutService.UpdateDefaultLayoutPage((int)_characterDashboardPage.CharacterDashboardLayoutId, _characterDashboardPage.CharacterDashboardPageId);
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
                    _characterDashboardPageService.UpdateSortOrder(model);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                return Ok();
            }
            return BadRequest(Utilities.ModelStateError(ModelState));
        }

        [HttpGet("GetCountByCharacterId")]
        public async Task<IActionResult> GetCountByCharacterId(int characterId)
        {
            var _items = _characterDashboardPageService.GetCountByCharacterId(characterId);

            if (_items == 0)
                return Ok(0);

            return Ok(_items);
        }

        [HttpGet("GetCountByLayoutId")]
        public async Task<IActionResult> GetCountByLayoutId(int layoutId)
        {
            var _items = _characterDashboardPageService.GetCountByLayoutId(layoutId);

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
                var page =  _characterDashboardPageService.GetById(id);
                var _pages = _characterDashboardPageService.GetCountByLayoutId(page.CharacterDashboardLayoutId ?? 0);

                if (_pages > 1)
                {
                    await _characterDashboardPageService.Delete(id);
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