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
    public class CharacterDashboardLayoutController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly DAL.Services.ICharacterDashboardLayoutService _characterDashboardLayoutService;
        private readonly DAL.Services.ICharacterDashboardPageService _characterDashboardPageService;
        private readonly ICharacterTileService _tileService;
        private readonly ICharacterStatTileService _characterStatTileService;
        private readonly ICommandTileService _commandTileService;
        private readonly ICounterTileService _counterTileService;
        private readonly IExecuteTileService _executeTileService;
        private readonly IImageTileService _imageTileService;
        private readonly ILinkTileService _linkTileService;
        private readonly INoteTileService _noteTileService;
        private readonly ITileConfigService _tileConfigService;
        private readonly ITextTileService _textTileService;

        public CharacterDashboardLayoutController(IHttpContextAccessor httpContextAccessor,
            DAL.Services.ICharacterDashboardLayoutService characterDashboardLayoutService,
            DAL.Services.ICharacterDashboardPageService characterDashboardPageService,
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
            this._characterDashboardLayoutService = characterDashboardLayoutService;
            this._characterDashboardPageService = characterDashboardPageService;
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

        [HttpGet("getByCharacterId")]
        public async Task<IEnumerable<CharacterDashboardLayout>> GetByCharacterId(int characterId, int page = -1, int pageSize = -1)
        {
            var listLayout = await _characterDashboardLayoutService.GetByCharacterId(characterId, page,pageSize);

            bool noDefaultLayout = false;

            if (listLayout == null) noDefaultLayout = true;
            else if (listLayout.Count == 0) noDefaultLayout = true;

            try
            {
                if (noDefaultLayout)
                {
                    //in case dashboard has no layout & page created
                    var _layout = await _characterDashboardLayoutService.Create(
                        new CharacterDashboardLayout()
                        {
                            Name = "Default",
                            SortOrder = 1,
                            LayoutHeight = 1280,
                            LayoutWidth = 768,
                            CharacterId = characterId,
                            IsDefaultLayout = true
                        });

                    var _characterDashboardPage = await _characterDashboardPageService.Create(new CharacterDashboardPage()
                    {
                        CharacterDashboardLayoutId = _layout.CharacterDashboardLayoutId,
                        Name = "Page1",
                        ContainerWidth = 1280,
                        ContainerHeight = 768,
                        SortOrder = 1,
                        CharacterId = characterId
                    });
                    _layout.DefaultPageId = _characterDashboardPage.CharacterDashboardPageId;
                    await _characterDashboardLayoutService.Update(_layout);

                    listLayout = await _characterDashboardLayoutService.GetByCharacterId(characterId, page, pageSize);
                }
            }
            catch { }

            return listLayout;
        }

        [HttpPost("create")]
        [ProducesResponseType(200, Type = typeof(string))]
        public async Task<IActionResult> Create([FromBody] CharacterDashboardLayout model)
        {
            if (ModelState.IsValid)
            {
                if (_characterDashboardLayoutService.GetCountByCharacterId((int)model.CharacterId) >= 12)
                {
                    return BadRequest("Only 12 slots of Layouts are allowed.");
                }

                if (_characterDashboardLayoutService.CheckDuplicate(model.Name.Trim(), model.CharacterId).Result)
                    return BadRequest("Duplicate Layout Name");

                try
                {
                    int maxsortorder = _characterDashboardLayoutService.GetMaximumSortOrdertByCharacterId(model.CharacterId);
                    model.SortOrder = maxsortorder + 1;
                    var layout = await _characterDashboardLayoutService.Create(model);

                    var _characterDashboardPage = await _characterDashboardPageService.Create(new CharacterDashboardPage()
                    {
                        CharacterDashboardLayoutId = layout.CharacterDashboardLayoutId,
                        Name = "Page1",
                        ContainerWidth = model.LayoutHeight,
                        ContainerHeight = model.LayoutWidth,
                        BodyBgColor = "#FFFFFF",//set default while creating character
                        BodyTextColor = "#000000",
                        TitleBgColor = "#FFFFFF",
                        TitleTextColor = "#000000",
                        SortOrder = 1,
                        CharacterId = model.CharacterId
                    });
                    layout.DefaultPageId = _characterDashboardPage.CharacterDashboardPageId;
                    await _characterDashboardLayoutService.Update(layout);
                    _characterDashboardLayoutService.UpdateDefaultLayout(layout.CharacterDashboardLayoutId);

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
        public async Task<IActionResult> Update([FromBody] CharacterDashboardLayout model)
        {
            if (ModelState.IsValid)
            {
                if (_characterDashboardLayoutService.CheckDuplicate(model.Name.Trim(), model.CharacterId,model.CharacterDashboardLayoutId).Result)
                    return BadRequest("Duplicate Layout Name");

                try
                {
                    await _characterDashboardLayoutService.Update(model);
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
        public async Task<IActionResult> Duplicate([FromBody] CharacterDashboardLayout model)
        {
            if (ModelState.IsValid)
            {
                model.IsDefaultComputer = false;
                model.IsDefaultTablet = false;
                model.IsDefaultMobile = false;
                if (_characterDashboardLayoutService.GetCountByCharacterId((int)model.CharacterId) >= 12)
                {
                    return BadRequest("Only 12 slots of Layouts are allowed.");
                }
                if (_characterDashboardLayoutService.CheckDuplicate(model.Name.Trim(), model.CharacterId).Result)
                    return BadRequest("Duplicate Layout Name");

                try
                {
                    int defaultPageId = 0;
                    var _characterDashboardPages = model.CharacterDashboardPages;

                    int maxsortorder = _characterDashboardLayoutService.GetMaximumSortOrdertByCharacterId(model.CharacterId);
                    model.SortOrder = maxsortorder + 1;
                    model.IsDefaultLayout = false;
                    model.DefaultPageId = null;
                    model.CharacterDashboardPages = null;

                    var layout = await _characterDashboardLayoutService.Create(model);

                    foreach (var page in _characterDashboardPages)
                    {
                        page.Tiles = null;
                        int PageId = page.CharacterDashboardPageId;
                        page.CharacterId = layout.CharacterId;
                        page.CharacterDashboardLayoutId = layout.CharacterDashboardLayoutId;
                        page.CharacterDashboardPageId = 0;
                        var _characterDashboardPage = await _characterDashboardPageService.Create(page);
                        if (defaultPageId == 0)
                            defaultPageId = _characterDashboardPage.CharacterDashboardPageId;

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
                                    Tile.ImageTiles = await _imageTileService.Create(new CharacterImageTile {
                                        CharacterTileId = Tile.CharacterTileId,
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
                                    Tile.CounterTiles = await _counterTileService.Create(new CharacterCounterTile {
                                        CharacterTileId = Tile.CharacterTileId,
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
                                    Tile.CharacterStatTiles = await _characterStatTileService.Create(new CharacterCharacterStatTile
                                    {
                                        CharacterTileId = Tile.CharacterTileId,
                                        CharactersCharacterStatId= characterStatTile.CharactersCharacterStatId,
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
                                        DisplayLinkImage=linkTile.DisplayLinkImage,
                                        IsDeleted = false
                                    });                                   
                                    //SaveColorsAsync(Tile);
                                    break;
                                case (int)Enum.TILES.EXECUTE:
                                    var executeTile = _tile.ExecuteTiles;
                                        Tile.ExecuteTiles = await _executeTileService.Create(new CharacterExecuteTile {
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
                                            DisplayLinkImage = executeTile.DisplayLinkImage,
                                            IsDeleted = false
                                        });                                  
                                    //SaveColorsAsync(Tile);
                                    break;
                                case (int)Enum.TILES.COMMAND:
                                    var commandTile = _tile.CommandTiles;
                                    Tile.CommandTiles = await _commandTileService.Create(new CharacterCommandTile {
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
                    }
                    if (defaultPageId > 0)
                    {
                        layout.DefaultPageId = defaultPageId;
                        await _characterDashboardLayoutService.Update(layout);
                    }
                    _characterDashboardLayoutService.UpdateDefaultLayout(layout.CharacterDashboardLayoutId);
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
                     _characterDashboardLayoutService.UpdateSortOrder(model);
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
        public CharacterDashboardLayout GetById(int Id)
        {
            return _characterDashboardLayoutService.GetById(Id);
        }

        [HttpGet("GetCountByCharacterId")]
        public async Task<IActionResult> GetCountByCharacterId(int characterId)
        {
            var _items = _characterDashboardLayoutService.GetCountByCharacterId(characterId);

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
                var layout = _characterDashboardLayoutService.GetById(id);
                var _layouts = _characterDashboardLayoutService.GetCountByCharacterId(layout.CharacterId ?? 0);
                
                if (_layouts > 1)
                {
                    await _characterDashboardLayoutService.Delete(id);
                    return Ok();
                }
                return BadRequest("You cannot delete the Default layout of a Character.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpPost("UpdateDefaultLayout")]
        public async Task<IActionResult> UpdateDefaultLayout(int layoutId, int characterID)
        {
            _characterDashboardLayoutService.UpdateDefaultLayout(layoutId,characterID);
            return Ok();
        }

        [HttpPost("UpdateDefaultLayoutPage")]
        public async Task<IActionResult> UpdateDefaultLayoutPage(int layoutId, int pageId)
        {
            _characterDashboardLayoutService.UpdateDefaultLayoutPage(layoutId, pageId);
            return Ok();
        }
    }
}